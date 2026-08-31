import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const AssetAllocation = sequelize.define('AssetAllocation', {
  allocationId:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'allocation_id' },
  assetId:               { type: DataTypes.INTEGER, allowNull: false, field: 'asset_id' },
  employeeId:            { type: DataTypes.INTEGER, allowNull: false, field: 'employee_id' },
  allocatedBy:           { type: DataTypes.INTEGER, allowNull: false, field: 'allocated_by' },
  allocatedAt:           { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'allocated_at' },
  returnedAt:            { type: DataTypes.DATE, allowNull: true, field: 'returned_at' },
  acknowledgementStatus: { type: DataTypes.ENUM('pending', 'acknowledged', 'disputed'),
                           allowNull: false, defaultValue: 'pending', field: 'acknowledgement_status' },
  notes:                 { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'asset_allocations', timestamps: false });
