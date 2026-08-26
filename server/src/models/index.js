import { sequelize } from '../config/db.js';
import { SystemUser } from './SystemUser.js';
import { Role } from './Role.js';
import { Permission } from './Permission.js';
import { RolePermission } from './RolePermission.js';
import { UserRole } from './UserRole.js';
import { Department } from './Department.js';
import { Position } from './Position.js';
import { Employee } from './Employee.js';
import { EmergencyContact } from './EmergencyContact.js';
import { OnboardingTemplate } from './OnboardingTemplate.js';
import { OnboardingPlan } from './OnboardingPlan.js';
import { Checklist } from './Checklist.js';
import { Task } from './Task.js';
import { TaskProgress } from './TaskProgress.js';
import { DocumentType } from './DocumentType.js';
import { Document } from './Document.js';
import { DocumentVerification } from './DocumentVerification.js';
import { TrainingCourse } from './TrainingCourse.js';
import { TrainingModule } from './TrainingModule.js';
import { TrainingRecord } from './TrainingRecord.js';
import { AssetCategory } from './AssetCategory.js';
import { AssetModel } from './AssetModel.js';
import { Asset } from './Asset.js';
import { AssetAllocation } from './AssetAllocation.js';
import { Notification } from './Notification.js';
import { AuditLog } from './AuditLog.js';
import { SystemSetting } from './SystemSetting.js';

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

Employee.hasMany(EmergencyContact, { foreignKey: 'employee_id' });
EmergencyContact.belongsTo(Employee, { foreignKey: 'employee_id' });

// Plan, Template, Checklist, Task associations
OnboardingPlan.belongsTo(OnboardingTemplate, { foreignKey: 'template_id' });
OnboardingPlan.hasMany(Checklist, { foreignKey: 'plan_id' });
Checklist.belongsTo(OnboardingPlan, { foreignKey: 'plan_id' });
Checklist.hasMany(Task, { foreignKey: 'checklist_id' });
Task.belongsTo(Checklist, { foreignKey: 'checklist_id' });

TaskProgress.belongsTo(Task, { foreignKey: 'task_id' });
TaskProgress.belongsTo(Employee, { foreignKey: 'employee_id' });
TaskProgress.belongsTo(SystemUser, { as: 'CompletedByUser', foreignKey: 'completed_by' });

// Document & Verification associations
Document.belongsTo(DocumentType, { foreignKey: 'type_id' });
DocumentType.hasMany(Document, { foreignKey: 'type_id' });
Document.hasMany(DocumentVerification, { foreignKey: 'document_id' });
DocumentVerification.belongsTo(Document, { foreignKey: 'document_id' });
DocumentVerification.belongsTo(SystemUser, { as: 'Reviewer', foreignKey: 'reviewer_user_id' });

// Training associations
TrainingCourse.hasMany(TrainingModule, { foreignKey: 'course_id' });
TrainingModule.belongsTo(TrainingCourse, { foreignKey: 'course_id' });
TrainingRecord.belongsTo(TrainingCourse, { foreignKey: 'course_id' });
TrainingCourse.hasMany(TrainingRecord, { foreignKey: 'course_id' });

// Asset associations
AssetCategory.hasMany(AssetModel, { foreignKey: 'category_id' });
AssetModel.belongsTo(AssetCategory, { foreignKey: 'category_id' });
AssetModel.hasMany(Asset, { foreignKey: 'model_id' });
Asset.belongsTo(AssetModel, { foreignKey: 'model_id' });
AssetAllocation.belongsTo(Asset, { foreignKey: 'asset_id' });
AssetAllocation.belongsTo(Employee, { foreignKey: 'employee_id' });
AssetAllocation.belongsTo(SystemUser, { as: 'AllocatedByUser', foreignKey: 'allocated_by' });

// Notifications & Auditing
SystemUser.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(SystemUser, { foreignKey: 'user_id' });
SystemUser.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(SystemUser, { as: 'Actor', foreignKey: 'user_id' });

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
  EmergencyContact,
  OnboardingTemplate,
  OnboardingPlan,
  Checklist,
  Task,
  TaskProgress,
  DocumentType,
  Document,
  DocumentVerification,
  TrainingCourse,
  TrainingModule,
  TrainingRecord,
  AssetCategory,
  AssetModel,
  Asset,
  AssetAllocation,
  Notification,
  AuditLog,
  SystemSetting,
};
