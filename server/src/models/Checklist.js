import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Checklist = sequelize.define('Checklist', {
  checklistId:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'checklist_id' },
  planId:        { type: DataTypes.INTEGER, allowNull: false, field: 'plan_id' },
  phaseName:     { type: DataTypes.STRING(100), allowNull: false, field: 'phase_name' },
  phaseOrder:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'phase_order' },
  dueOffsetDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'due_offset_days' },
}, { tableName: 'checklists', updatedAt: false });
