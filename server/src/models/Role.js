import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Role = sequelize.define('Role', {
  roleId:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'role_id' },
  roleName:        { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'role_name' },
  description:     { type: DataTypes.STRING(255), allowNull: true },
  hierarchyLevel:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 9, field: 'hierarchy_level' },
}, { tableName: 'roles' });

