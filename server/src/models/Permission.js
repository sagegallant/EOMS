import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Permission = sequelize.define('Permission', {
  permissionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'permission_id' },
  actionName:   { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'action_name' },
  resource:     { type: DataTypes.STRING(100), allowNull: false },
  description:  { type: DataTypes.STRING(255), allowNull: true },
  isActive:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
}, { tableName: 'permissions' });
