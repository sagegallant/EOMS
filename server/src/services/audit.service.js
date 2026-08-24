import { AuditLog } from '../models/AuditLog.js';

export async function logAudit({ userId = null, action, targetTable = null, targetId = null, ip = null, userAgent = null, details = null }) {
  try {
    return await AuditLog.create({
      userId,
      action,
      targetTable,
      targetId: targetId !== null ? String(targetId) : null,
      ipAddress: ip,
      userAgent,
      details,
    });
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
}
