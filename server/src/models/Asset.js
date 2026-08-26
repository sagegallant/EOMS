import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Asset = sequelize.define('Asset', {
  assetId:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'asset_id' },
  modelId:        { type: DataTypes.INTEGER, allowNull: false, field: 'model_id' },
  serialNumber:   { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'serial_number' },
  assetTag:       { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'asset_tag' },
  status:         { type: DataTypes.ENUM('in_stock', 'allocated', 'in_repair', 'retired'), allowNull: false, defaultValue: 'in_stock' },
  purchasedAt:    { type: DataTypes.DATEONLY, allowNull: true, field: 'purchased_at' },
  warrantyExpiry: { type: DataTypes.DATEONLY, allowNull: true, field: 'warranty_expiry' },
}, { tableName: 'assets' });
