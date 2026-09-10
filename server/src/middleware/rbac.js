import { sequelize } from '../config/db.js';

const permCache = new Map(); // userId → Set<action_name>, TTL 60s

export const requirePermission = (action) => async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required.' });
    }

    // SYSTEM_ADMIN possesses superuser permissions across all resources
    if (req.user.roles?.includes('SYSTEM_ADMIN')) {
      return next();
    }

    const key = req.user.userId;
    let perms = permCache.get(key);
    if (!perms) {
      const [rows] = await sequelize.query(
        `SELECT DISTINCT p.action_name
           FROM permissions p
           JOIN role_permissions rp ON rp.permission_id = p.permission_id
           JOIN user_roles ur       ON ur.role_id = rp.role_id
          WHERE ur.user_id = :userId AND p.is_active = 1`,
        { replacements: { userId: key } },
      );
      perms = new Set(rows.map(r => r.action_name));
      permCache.set(key, perms);
      setTimeout(() => permCache.delete(key), 60_000);
    }

    if (!perms.has(action)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: `Missing permission: ${action}. Contact your administrator.`,
      });
    }
    req.permissions = perms;
    next();
  } catch (e) {
    next(e);
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required.' });
  }

  const userRoles = req.user.roles || [];
  if (userRoles.includes('SYSTEM_ADMIN') || allowedRoles.some(r => userRoles.includes(r))) {
    return next();
  }

  return res.status(403).json({
    code: 'FORBIDDEN',
    message: `Access denied. Requires one of: ${allowedRoles.join(', ')}.`,
  });
};
