import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const TrainingQuizAttempt = sequelize.define(
  'TrainingQuizAttempt',
  {
    attemptId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'attempt_id',
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'record_id',
    },
    attemptNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'attempt_number',
    },
    scoreAchieved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'score_achieved',
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    attemptedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'attempted_at',
    },
  },
  {
    tableName: 'training_quiz_attempts',
    timestamps: false,
  }
);
