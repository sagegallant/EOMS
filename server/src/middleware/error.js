import { logAudit } from '../services/audit.service.js';

export const errorHandler = async (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');
  const message = err.message || 'An unexpected error occurred.';

  if (status === 500) {
    console.error('[Error Handler]', err);
    try {
      await logAudit({
        userId: req.user?.userId || null,
        action: 'SERVER_ERROR',
        targetTable: 'system_errors',
        targetId: null,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { message: err.message, stack: err.stack, path: req.originalUrl },
      });
    } catch (auditErr) {
      console.error('Failed to log error audit:', auditErr.message);
    }
  }

  res.status(status).json({
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && status === 500 ? { stack: err.stack } : {}),
  });
};
