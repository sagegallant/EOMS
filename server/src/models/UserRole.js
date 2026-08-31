import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const UserRole = sequelize.define('UserRole', {
  userId:    { type: DataTypes.INTEGER, primaryKey: true, field: 'user_id' },
  roleId:    { type: DataTypes.INTEGER, primaryKey: true, field: 'role_id' },
  isPrimary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_primary' },
}, { tableName: 'user_roles', timestamps: false });
