import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const DocumentVerification = sequelize.define('DocumentVerification', {
  verificationId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'verification_id' },
  documentId:     { type: DataTypes.INTEGER, allowNull: false, field: 'document_id' },
  reviewerUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'reviewer_user_id' },
  status:         { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'requires_resubmission'),
                    allowNull: false, defaultValue: 'pending' },
  comments:       { type: DataTypes.TEXT, allowNull: true },
  verifiedAt:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'verified_at' },
}, { tableName: 'document_verifications', updatedAt: false });
