import { sequelize } from '../config/db.js';
import { SystemUser } from './SystemUser.js';
import { Role } from './Role.js';
import { Permission } from './Permission.js';
import { RolePermission } from './RolePermission.js';
import { UserRole } from './UserRole.js';
import { Department } from './Department.js';
import { Position } from './Position.js';
import { Employee } from './Employee.js';
import { OnboardingPlan } from './OnboardingPlan.js';
import { Checklist } from './Checklist.js';
import { Task } from './Task.js';
import { TaskProgress } from './TaskProgress.js';
import { Document } from './Document.js';
import { DocumentVerification } from './DocumentVerification.js';
import { TrainingRecord } from './TrainingRecord.js';
import { AssetAllocation } from './AssetAllocation.js';
import { AuditLog } from './AuditLog.js';

// Setup RBAC associations
SystemUser.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', otherKey: 'role_id' });
Role.belongsToMany(SystemUser, { through: UserRole, foreignKey: 'role_id', otherKey: 'user_id' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id' });

// Organization associations
Department.hasMany(Department, { as: 'SubDepartments', foreignKey: 'parent_dept_id' });
Department.belongsTo(Department, { as: 'ParentDepartment', foreignKey: 'parent_dept_id' });
Department.hasMany(Position, { foreignKey: 'dept_id' });
Position.belongsTo(Department, { foreignKey: 'dept_id' });

// Employee associations
Employee.associate({
  SystemUser,
  Position,
  Employee,
  OnboardingPlan,
  Document,
  TaskProgress,
  TrainingRecord,
  AssetAllocation,
});

// Plan, Checklist, Task associations
OnboardingPlan.hasMany(Checklist, { foreignKey: 'plan_id' });
Checklist.belongsTo(OnboardingPlan, { foreignKey: 'plan_id' });
Checklist.hasMany(Task, { foreignKey: 'checklist_id' });
Task.belongsTo(Checklist, { foreignKey: 'checklist_id' });

// Document verification associations
Document.hasMany(DocumentVerification, { foreignKey: 'document_id' });
DocumentVerification.belongsTo(Document, { foreignKey: 'document_id' });

export {
  sequelize,
  SystemUser,
  Role,
  Permission,
  RolePermission,
  UserRole,
  Department,
  Position,
  Employee,
  OnboardingPlan,
  Checklist,
  Task,
  TaskProgress,
  Document,
  DocumentVerification,
  TrainingRecord,
  AssetAllocation,
  AuditLog,
};
