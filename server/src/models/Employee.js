import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Employee = sequelize.define('Employee', {
  employeeId:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'employee_id' },
  userId:       { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'user_id' },
  positionId:   { type: DataTypes.INTEGER, allowNull: false, field: 'position_id' },
  managerId:    { type: DataTypes.INTEGER, allowNull: true, field: 'manager_id' },
  firstName:    { type: DataTypes.STRING(100), allowNull: false, field: 'first_name' },
  lastName:     { type: DataTypes.STRING(100), allowNull: false, field: 'last_name' },
  hireDate:     { type: DataTypes.DATEONLY, allowNull: false, field: 'hire_date' },
  endDate:      { type: DataTypes.DATEONLY, allowNull: true, field: 'end_date' },
  status:       { type: DataTypes.ENUM('onboarding', 'active', 'on_leave', 'terminated'),
                  allowNull: false, defaultValue: 'onboarding' },
  workEmail:    { type: DataTypes.STRING(150), allowNull: true, field: 'work_email' },
  workLocation: { type: DataTypes.ENUM('Remote', 'Hybrid', 'On-site'), allowNull: true, field: 'work_location' },
}, { tableName: 'employees' });

Employee.associate = ({ SystemUser, Position, Employee, OnboardingPlan, Document, TaskProgress,
                        TrainingRecord, AssetAllocation }) => {
  Employee.belongsTo(SystemUser, { foreignKey: 'user_id' });
  Employee.belongsTo(Position,   { foreignKey: 'position_id' });
  Employee.belongsTo(Employee,   { as: 'Manager', foreignKey: 'manager_id' });
  Employee.hasOne(OnboardingPlan,  { foreignKey: 'employee_id' });
  Employee.hasMany(Document,       { foreignKey: 'employee_id' });
  Employee.hasMany(TaskProgress,   { foreignKey: 'employee_id' });
  Employee.hasMany(TrainingRecord, { foreignKey: 'employee_id' });
  Employee.hasMany(AssetAllocation,{ foreignKey: 'employee_id' });
};
