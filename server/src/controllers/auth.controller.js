import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { generateSecret, generateURI, verifySync } from 'otplib';
import { sequelize, SystemUser, Employee, MfaBackupCode } from '../models/index.js';
import { getRolesForUser } from '../services/rbac.service.js';
import { logAudit } from '../services/audit.service.js';

const JWT_TTL = process.env.JWT_TTL ?? '8h';
const JWT_SECRET = process.env.JWT_SECRET || 'eoms_super_secret_jwt_key_change_in_production_2026';

function signChallenge(userId) {
  return jwt.sign({ userId, purpose: 'mfa_challenge' }, JWT_SECRET, { expiresIn: '5m' });
}

export async function login(req, res, next) {
  try {
    const { identifier, username, email, password } = req.body;
    const loginId = (identifier || username || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Username/email and password are required.' });
    }

    const user = await SystemUser.findOne({
      where: { username: loginId }
    }) || await SystemUser.findOne({
      where: { email: loginId }
    });

    // Uniform error — never reveal which field failed
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
      await logAudit({ action: 'LOGIN_FAILED', targetTable: 'system_users',
        targetId: user?.userId ?? null, ip: req.ip, userAgent: req.headers['user-agent'] });
      return res.status(401).json({ code: 'BAD_CREDENTIALS',
        message: 'Incorrect email/username or password.' });
    }

    if (user.mfaSecret) {
      return res.status(200).json({ mfaRequired: true, challenge: signChallenge(user.userId) });
    }
    return issueSession(res, user, req);
  } catch (e) { next(e); }
}

export async function verifyMfa(req, res, next) {
  try {
    const { challenge, code } = req.body;
    if (!challenge || !code) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Challenge and code required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(challenge, JWT_SECRET);
    } catch {
      return res.status(401).json({ code: 'CHALLENGE_EXPIRED', message: 'MFA session expired. Please log in again.' });
    }

    const user = await SystemUser.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ code: 'USER_INACTIVE', message: 'Account disabled.' });
    }

    const sanitizedCode = String(code).trim().toUpperCase();
    let isTotpValid = false;

    try {
      const result = verifySync({ token: sanitizedCode, secret: user.mfaSecret });
      isTotpValid = !!(result && result.valid);
    } catch {
      isTotpValid = false;
    }

    if (isTotpValid) {
      await logAudit({
        userId: user.userId,
        action: 'MFA_TOTP_SUCCESS',
        targetTable: 'system_users',
        targetId: user.userId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return issueSession(res, user, req);
    }

    // Check if entered code is a valid, unused recovery/backup code
    const unusedBackupCodes = await MfaBackupCode.findAll({
      where: { userId: user.userId, usedAt: null },
    });

    for (const bc of unusedBackupCodes) {
      const match = await bcrypt.compare(sanitizedCode, bc.codeHash);
      if (match) {
        await bc.update({ usedAt: new Date() });
        await logAudit({
          userId: user.userId,
          action: 'MFA_BACKUP_CODE_USED',
          targetTable: 'mfa_backup_codes',
          targetId: bc.codeId,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        });
        return issueSession(res, user, req);
      }
    }

    // Both failed
    await logAudit({
      userId: user.userId,
      action: 'MFA_FAILED',
      targetTable: 'system_users',
      targetId: user.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(401).json({ code: 'INVALID_MFA_CODE', message: 'Invalid verification or recovery code.' });
  } catch (e) {
    next(e);
  }
}

export async function setupMfa(req, res, next) {
  try {
    const user = await SystemUser.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ code: 'NOT_FOUND', message: 'User not found.' });

    const secret = generateSecret();
    const otpauth = generateURI({ secret, label: user.email || user.username, issuer: 'EOMS' });
    const qrCode = await QRCode.toDataURL(otpauth);

    // Generate 6 recovery codes
    const backupCodes = [];
    for (let i = 0; i < 6; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    const setupToken = jwt.sign(
      { userId: user.userId, secret, backupCodes, purpose: 'mfa_setup' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({
      qrCode,
      manualSecret: secret,
      backupCodes,
      setupToken,
    });
  } catch (e) {
    next(e);
  }
}

export async function enableMfa(req, res, next) {
  try {
    const { setupToken, code } = req.body;
    if (!setupToken || !code) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'setupToken and code are required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(setupToken, JWT_SECRET);
      if (decoded.purpose !== 'mfa_setup' || decoded.userId !== req.user.userId) {
        throw new Error('Invalid token purpose');
      }
    } catch {
      return res.status(400).json({ code: 'INVALID_SETUP_TOKEN', message: 'Setup session expired. Please retry.' });
    }

    const sanitizedCode = String(code).trim();
    let isTotpValid = false;
    try {
      const result = verifySync({ token: sanitizedCode, secret: decoded.secret });
      isTotpValid = !!(result && result.valid);
    } catch {
      isTotpValid = false;
    }

    if (!isTotpValid) {
      return res.status(400).json({ code: 'INVALID_CODE', message: 'Invalid TOTP verification code. Check your authenticator app.' });
    }

    await sequelize.transaction(async (t) => {
      await SystemUser.update({ mfaSecret: decoded.secret }, { where: { userId: req.user.userId }, transaction: t });

      // Invalidate old backup codes
      await MfaBackupCode.destroy({ where: { userId: req.user.userId }, transaction: t });

      // Store hashed backup codes
      const hashedRows = await Promise.all(
        decoded.backupCodes.map(async (bc) => ({
          userId: req.user.userId,
          codeHash: await bcrypt.hash(bc, 10),
        }))
      );
      await MfaBackupCode.bulkCreate(hashedRows, { transaction: t });
    });

    await logAudit({
      userId: req.user.userId,
      action: 'MFA_ENABLED',
      targetTable: 'system_users',
      targetId: req.user.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Multi-factor authentication (TOTP) successfully activated.' });
  } catch (e) {
    next(e);
  }
}

export async function disableMfa(req, res, next) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Password is required to disable MFA.' });
    }

    const user = await SystemUser.findByPk(req.user.userId);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ code: 'INVALID_PASSWORD', message: 'Password verification failed.' });
    }

    await sequelize.transaction(async (t) => {
      await user.update({ mfaSecret: null }, { transaction: t });
      await MfaBackupCode.destroy({ where: { userId: user.userId }, transaction: t });
    });

    await logAudit({
      userId: user.userId,
      action: 'MFA_DISABLED',
      targetTable: 'system_users',
      targetId: user.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'MFA has been disabled.' });
  } catch (e) {
    next(e);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await SystemUser.findByPk(req.user.userId, {
      attributes: ['userId', 'username', 'email', 'isActive', 'mfaSecret', 'lastLogin']
    });
    if (!user) return res.status(404).json({ code: 'NOT_FOUND', message: 'User not found.' });
    const roles = await getRolesForUser(user.userId);
    const employee = await Employee.findOne({ where: { userId: user.userId } });

    res.json({
      user: {
        id: user.userId,
        userId: user.userId,
        username: user.username,
        email: user.email,
        roles,
        employeeId: employee?.employeeId || null,
        firstName: employee?.firstName || user.username,
        lastName: employee?.lastName || '',
        fullName: employee ? `${employee.firstName} ${employee.lastName}` : user.username,
        mfaEnabled: !!user.mfaSecret,
      }
    });
  } catch (e) { next(e); }
}

async function issueSession(res, user, req) {
  const roles = await getRolesForUser(user.userId);
  await user.update({ lastLogin: new Date() });
  await logAudit({ userId: user.userId, action: 'LOGIN', targetTable: 'system_users',
    targetId: user.userId, ip: req.ip, userAgent: req.headers['user-agent'] });

  const employee = await Employee.findOne({ where: { userId: user.userId } });

  res.json({
    token: jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        roles,
        employeeId: employee?.employeeId || null,
      },
      JWT_SECRET,
      { expiresIn: JWT_TTL }
    ),
    user: {
      id: user.userId,
      userId: user.userId,
      username: user.username,
      email: user.email,
      roles,
      employeeId: employee?.employeeId || null,
      firstName: employee?.firstName || user.username,
      lastName: employee?.lastName || '',
      fullName: employee ? `${employee.firstName} ${employee.lastName}` : user.username,
      mfaEnabled: !!user.mfaSecret,
    },
  });
}

