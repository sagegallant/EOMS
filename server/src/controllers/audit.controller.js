import { AuditLog, SystemUser } from '../models/index.js';

export async function listAuditLogs(req, res, next) {
  try {
    const { action, userId, targetTable, page = 1, limit = 50 } = req.query;
    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (targetTable) where.targetTable = targetTable;

    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: SystemUser,
          as: 'Actor',
          attributes: ['userId', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (e) {
    next(e);
  }
}
