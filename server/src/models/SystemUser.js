import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const SystemUser = sequelize.define('SystemUser', {
  userId:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'user_id' },
  username:      { type: DataTypes.STRING(100), allowNull: false, unique: true },
  passwordHash:  { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  email:         { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  isActive:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
  lastLogin:     { type: DataTypes.DATE, allowNull: true, field: 'last_login' },
  mfaSecret:     { type: DataTypes.STRING(255), allowNull: true, field: 'mfa_secret' },
  versionNumber: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1, field: 'version_number' },
}, { tableName: 'system_users' });
