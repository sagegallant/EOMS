import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const DocumentType = sequelize.define('DocumentType', {
  typeId:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'type_id' },
  typeName:          { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'type_name' },
  description:       { type: DataTypes.STRING(255), allowNull: true },
  isRequired:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_required' },
  allowedExtensions: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'pdf,png,jpg,jpeg', field: 'allowed_extensions' },
}, { tableName: 'document_types', updatedAt: false });
