import { sequelize } from '../config/db.js';

const permCache = new Map(); // userId → Set<action_name>, TTL 60s

export const requirePermission = (action) => async (req, res, next) => {
  try {
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
      return res.status(403).json({ code: 'FORBIDDEN',
        message: `Missing permission: ${action}. Contact your administrator.` });
    }
    req.permissions = perms;
    next();
  } catch (e) { next(e); }
};
