import { logAudit } from '../services/audit.service.js';

export const errorHandler = async (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');
  const message = err.message || 'An unexpected error occurred.';

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      code: 'FILE_TOO_LARGE',
      message: 'Uploaded file exceeds the maximum allowed limit of 5MB.',
    });
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      code: 'INVALID_FILE_TYPE',
      message: err.message || 'Only PDF, PNG, JPG, and WebP files are permitted.',
    });
  }

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
