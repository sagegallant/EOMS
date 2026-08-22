import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Position = sequelize.define('Position', {
  positionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'position_id' },
  deptId:     { type: DataTypes.INTEGER, allowNull: false, field: 'dept_id' },
  jobTitle:   { type: DataTypes.STRING(100), allowNull: false, field: 'job_title' },
  jobGrade:   { type: DataTypes.STRING(20), allowNull: true, field: 'job_grade' },
}, { tableName: 'positions' });
