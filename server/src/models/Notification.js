import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Notification = sequelize.define('Notification', {
  notificationId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'notification_id' },
  userId:         { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  title:          { type: DataTypes.STRING(200), allowNull: false },
  message:        { type: DataTypes.TEXT, allowNull: false },
  channel:        { type: DataTypes.ENUM('in_app', 'email', 'sms'), allowNull: false, defaultValue: 'in_app' },
  isRead:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_read' },
  readAt:         { type: DataTypes.DATE, allowNull: true, field: 'read_at' },
}, { tableName: 'notifications', updatedAt: false });
