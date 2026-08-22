import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ code: 'NO_TOKEN', message: 'Authentication required.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'eoms_super_secret_jwt_key_change_in_production_2026'); // { userId, username, roles: [] }
    next();
  } catch {
    res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Session expired. Please sign in again.' });
  }
};
