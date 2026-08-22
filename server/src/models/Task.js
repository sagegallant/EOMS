import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Task = sequelize.define('Task', {
  taskId:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'task_id' },
  checklistId:      { type: DataTypes.INTEGER, allowNull: false, field: 'checklist_id' },
  title:            { type: DataTypes.STRING(200), allowNull: false },
  description:      { type: DataTypes.TEXT, allowNull: true },
  category:         { type: DataTypes.ENUM('administrative', 'it_setup', 'training', 'compliance', 'manager_meeting'),
                      allowNull: false, defaultValue: 'administrative' },
  assignedRole:     { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'EMPLOYEE', field: 'assigned_role' },
  estimatedMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30, field: 'estimated_minutes' },
  priority:         { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
                      allowNull: false, defaultValue: 'medium' },
  isMandatory:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_mandatory' },
  sortOrder:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
}, { tableName: 'tasks' });
