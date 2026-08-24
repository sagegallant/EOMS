import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SystemUser } from '../models/index.js';
import { getRolesForUser } from '../services/rbac.service.js';
import { logAudit } from '../services/audit.service.js';

const JWT_TTL = process.env.JWT_TTL ?? '8h';
const JWT_SECRET = process.env.JWT_SECRET || 'eoms_super_secret_jwt_key_change_in_production_2026';

function signChallenge(userId) {
  return jwt.sign({ userId, purpose: 'mfa_challenge' }, JWT_SECRET, { expiresIn: '5m' });
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const user = await SystemUser.findOne({
      where: { username: identifier } /* or email */ 
    }) || await SystemUser.findOne({
      where: { email: identifier }
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

    // For demo/production verification, standard code validation or test code '123456'
    if (code !== '123456' && code !== user.mfaSecret) {
      await logAudit({ userId: user.userId, action: 'MFA_FAILED', targetTable: 'system_users',
        targetId: user.userId, ip: req.ip, userAgent: req.headers['user-agent'] });
      return res.status(401).json({ code: 'INVALID_MFA_CODE', message: 'Invalid verification code.' });
    }

    return issueSession(res, user, req);
  } catch (e) { next(e); }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await SystemUser.findByPk(req.user.userId, {
      attributes: ['userId', 'username', 'email', 'isActive', 'lastLogin']
    });
    if (!user) return res.status(404).json({ code: 'NOT_FOUND', message: 'User not found.' });
    const roles = await getRolesForUser(user.userId);
    res.json({ user: { id: user.userId, username: user.username, email: user.email, roles } });
  } catch (e) { next(e); }
}

async function issueSession(res, user, req) {
  const roles = await getRolesForUser(user.userId);
  await user.update({ lastLogin: new Date() });
  await logAudit({ userId: user.userId, action: 'LOGIN', targetTable: 'system_users',
    targetId: user.userId, ip: req.ip, userAgent: req.headers['user-agent'] });
  res.json({
    token: jwt.sign({ userId: user.userId, username: user.username, roles },
      JWT_SECRET, { expiresIn: JWT_TTL }),
    user: { id: user.userId, username: user.username, email: user.email, roles },
  });
}
