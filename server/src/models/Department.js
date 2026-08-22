import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Department = sequelize.define('Department', {
  deptId:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'dept_id' },
  deptName:     { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'dept_name' },
  parentDeptId: { type: DataTypes.INTEGER, allowNull: true, field: 'parent_dept_id' },
}, { tableName: 'departments' });
