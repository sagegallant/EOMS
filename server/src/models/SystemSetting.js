import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const SystemSetting = sequelize.define('SystemSetting', {
  settingKey:   { type: DataTypes.STRING(100), primaryKey: true, field: 'setting_key' },
  settingValue: { type: DataTypes.TEXT, allowNull: false, field: 'setting_value' },
  description:  { type: DataTypes.STRING(255), allowNull: true },
}, { tableName: 'system_settings', createdAt: false });
