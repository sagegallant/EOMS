import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const AuditLog = sequelize.define('AuditLog', {
  logId:       { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'log_id' },
  userId:      { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  action:      { type: DataTypes.STRING(100), allowNull: false },
  targetTable: { type: DataTypes.STRING(100), allowNull: true, field: 'target_table' },
  targetId:    { type: DataTypes.STRING(100), allowNull: true, field: 'target_id' },
  ipAddress:   { type: DataTypes.STRING(45), allowNull: true, field: 'ip_address' },
  userAgent:   { type: DataTypes.STRING(255), allowNull: true, field: 'user_agent' },
  details:     { type: DataTypes.JSON, allowNull: true },
}, { tableName: 'audit_logs', updatedAt: false, createdAt: 'created_at' });
