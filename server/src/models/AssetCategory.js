import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const AssetCategory = sequelize.define('AssetCategory', {
  categoryId:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'category_id' },
  categoryName: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'category_name' },
  type:         { type: DataTypes.ENUM('hardware', 'software_license', 'peripheral', 'access_card'), allowNull: false, defaultValue: 'hardware' },
}, { tableName: 'asset_categories', updatedAt: false });
