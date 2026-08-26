import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const AssetModel = sequelize.define('AssetModel', {
  modelId:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'model_id' },
  categoryId:   { type: DataTypes.INTEGER, allowNull: false, field: 'category_id' },
  manufacturer: { type: DataTypes.STRING(100), allowNull: false },
  modelName:    { type: DataTypes.STRING(150), allowNull: false, field: 'model_name' },
  specs:        { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'asset_models', updatedAt: false });
