import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const TrainingCourse = sequelize.define('TrainingCourse', {
  courseId:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'course_id' },
  title:           { type: DataTypes.STRING(200), allowNull: false },
  description:     { type: DataTypes.TEXT, allowNull: true },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30, field: 'duration_minutes' },
  isMandatory:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_mandatory' },
  passingScore:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 80, field: 'passing_score' },
}, { tableName: 'training_courses' });
