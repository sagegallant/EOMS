import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const EmergencyContact = sequelize.define('EmergencyContact', {
  contactId:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'contact_id' },
  employeeId:   { type: DataTypes.INTEGER, allowNull: false, field: 'employee_id' },
  name:         { type: DataTypes.STRING(100), allowNull: false },
  relationship: { type: DataTypes.STRING(50), allowNull: false },
  phone:        { type: DataTypes.STRING(25), allowNull: false },
  email:        { type: DataTypes.STRING(150), allowNull: true },
  isPrimary:    { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_primary' },
}, { tableName: 'emergency_contacts', updatedAt: false });
