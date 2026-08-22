import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const TaskProgress = sequelize.define('TaskProgress', {
  progressId:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'progress_id' },
  employeeId:  { type: DataTypes.INTEGER, allowNull: false, field: 'employee_id' },
  taskId:      { type: DataTypes.INTEGER, allowNull: false, field: 'task_id' },
  status:      { type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'blocked'),
                 allowNull: false, defaultValue: 'not_started' },
  completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
  completedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'completed_by' },
  notes:       { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'task_progress' });
