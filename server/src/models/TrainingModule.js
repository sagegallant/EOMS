import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const TrainingModule = sequelize.define('TrainingModule', {
  moduleId:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'module_id' },
  courseId:    { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  contentType: { type: DataTypes.ENUM('video', 'slides', 'quiz', 'document'), allowNull: false, defaultValue: 'slides', field: 'content_type' },
  contentUrl:  { type: DataTypes.STRING(500), allowNull: true, field: 'content_url' },
  moduleOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'module_order' },
}, { tableName: 'training_modules', updatedAt: false });
