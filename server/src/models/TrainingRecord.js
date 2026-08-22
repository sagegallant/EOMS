import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const TrainingRecord = sequelize.define('TrainingRecord', {
  recordId:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'record_id' },
  employeeId:      { type: DataTypes.INTEGER, allowNull: false, field: 'employee_id' },
  courseId:        { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
  status:          { type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'failed'),
                     allowNull: false, defaultValue: 'not_started' },
  score:           { type: DataTypes.INTEGER, allowNull: true },
  progressPercent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'progress_percent' },
  startedAt:       { type: DataTypes.DATE, allowNull: true, field: 'started_at' },
  completedAt:     { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
}, { tableName: 'training_records' });
