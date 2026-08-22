import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const RolePermission = sequelize.define('RolePermission', {
  roleId:       { type: DataTypes.INTEGER, primaryKey: true, field: 'role_id' },
  permissionId: { type: DataTypes.INTEGER, primaryKey: true, field: 'permission_id' },
}, { tableName: 'role_permissions', timestamps: false });
