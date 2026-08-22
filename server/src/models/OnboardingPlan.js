import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const OnboardingPlan = sequelize.define('OnboardingPlan', {
  planId:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'plan_id' },
  employeeId:           { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'employee_id' },
  templateId:           { type: DataTypes.INTEGER, allowNull: true, field: 'template_id' },
  startDate:            { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
  targetCompletionDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'target_completion_date' },
  actualCompletionDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'actual_completion_date' },
  progressPercent:      { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0.00, field: 'progress_percent' },
  status:               { type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'overdue'),
                          allowNull: false, defaultValue: 'in_progress' },
}, { tableName: 'onboarding_plans' });
