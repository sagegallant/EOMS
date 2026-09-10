import { SystemSetting } from '../models/index.js';
import { logAudit } from '../services/audit.service.js';

export async function listSettings(req, res, next) {
  try {
    const settings = await SystemSetting.findAll({
      order: [['settingKey', 'ASC']],
    });
    res.json({ data: settings });
  } catch (e) {
    next(e);
  }
}

export async function updateSetting(req, res, next) {
  try {
    const { key } = req.params;
    const { settingValue } = req.body;

    if (settingValue === undefined) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'settingValue is required.' });
    }

    const setting = await SystemSetting.findByPk(key);
    if (!setting) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Setting not found.' });
    }

    await setting.update({ settingValue: String(settingValue) });

    await logAudit({
      userId: req.user?.userId,
      action: 'UPDATE_SYSTEM_SETTING',
      targetTable: 'system_settings',
      targetId: key,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { key, settingValue },
    });

    res.json({ message: 'System setting updated.', data: setting });
  } catch (e) {
    next(e);
  }
}
