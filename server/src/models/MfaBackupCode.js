import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const MfaBackupCode = sequelize.define(
  'MfaBackupCode',
  {
    codeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'code_id',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    codeHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'code_hash',
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'used_at',
    },
  },
  {
    tableName: 'mfa_backup_codes',
    updatedAt: false,
    createdAt: 'created_at',
  }
);
