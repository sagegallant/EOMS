import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Document = sequelize.define('Document', {
  documentId:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'document_id' },
  employeeId:    { type: DataTypes.INTEGER, allowNull: false, field: 'employee_id' },
  typeId:        { type: DataTypes.INTEGER, allowNull: false, field: 'type_id' },
  fileName:      { type: DataTypes.STRING(255), allowNull: false, field: 'file_name' },
  filePath:      { type: DataTypes.STRING(500), allowNull: false, field: 'file_path' },
  fileSizeBytes: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0, field: 'file_size_bytes' },
  mimeType:      { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'application/pdf', field: 'mime_type' },
  uploadedAt:    { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'uploaded_at' },
}, { tableName: 'documents', createdAt: 'uploaded_at', updatedAt: 'updated_at' });
