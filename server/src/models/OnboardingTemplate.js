import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const OnboardingTemplate = sequelize.define('OnboardingTemplate', {
  templateId:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'template_id' },
  templateName: { type: DataTypes.STRING(150), allowNull: false, field: 'template_name' },
  deptId:       { type: DataTypes.INTEGER, allowNull: true, field: 'dept_id' },
  targetRole:   { type: DataTypes.STRING(50), allowNull: true, field: 'target_role' },
  description:  { type: DataTypes.TEXT, allowNull: true },
  isActive:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
}, { tableName: 'onboarding_templates' });
