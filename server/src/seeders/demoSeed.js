import bcrypt from 'bcryptjs';
import { sequelize, SystemUser, Role, UserRole, Employee, Position, Department } from '../models/index.js';

export async function seed() {
  const PW = await bcrypt.hash('Password@123', 12); // demo only

  const roles = await Role.bulkCreate([
    { roleName: 'SYSTEM_ADMIN', hierarchyLevel: 1 },
    { roleName: 'HR_ADMIN', hierarchyLevel: 2 },
    { roleName: 'DEPARTMENT_MANAGER', hierarchyLevel: 7 },
    { roleName: 'IT_ADMIN', hierarchyLevel: 5 },
    { roleName: 'EMPLOYEE', hierarchyLevel: 9 },
  ].map(r => ({ ...r, description: r.roleName })), { returning: true });
  const R = Object.fromEntries(roles.map(r => [r.roleName, r.roleId]));

  const users = await SystemUser.bulkCreate([
    { username: 'admin',          email: 'admin@eoms.io' },
    { username: 'sarah.williams', email: 'sarah.williams@eoms.io' },
    { username: 'alex.johnson',   email: 'alex.johnson@eoms.io' },
    { username: 'michael.chen',   email: 'michael.chen@eoms.io' },
    { username: 'david.miller',   email: 'david.miller@eoms.io' },
  ].map(u => ({ ...u, passwordHash: PW })), { returning: true });
  const U = Object.fromEntries(users.map(u => [u.username, u.userId]));

  await UserRole.bulkCreate([
    { userId: U.admin,            roleId: R.SYSTEM_ADMIN,        isPrimary: true },
    { userId: U['sarah.williams'], roleId: R.HR_ADMIN,           isPrimary: true },
    { userId: U['alex.johnson'],   roleId: R.EMPLOYEE,           isPrimary: true },
    { userId: U['michael.chen'],   roleId: R.DEPARTMENT_MANAGER, isPrimary: true },
    { userId: U['david.miller'],   roleId: R.IT_ADMIN,           isPrimary: true },
  ]);

  const depts = await Department.bulkCreate([
    { deptName: 'Engineering' },
    { deptName: 'Human Resources' },
    { deptName: 'Information Technology' },
  ], { returning: true });

  const pos = await Position.bulkCreate([
    { deptId: depts[0].deptId, jobTitle: 'Software Engineer', jobGrade: 'L3' },
    { deptId: depts[0].deptId, jobTitle: 'Department Manager', jobGrade: 'Manager' },
    { deptId: depts[1].deptId, jobTitle: 'HR Specialist', jobGrade: 'L2' },
    { deptId: depts[2].deptId, jobTitle: 'IT Support Engineer', jobGrade: 'L2' },
  ], { returning: true });

  await Employee.bulkCreate([
    { userId: U['alex.johnson'], positionId: pos[0].positionId, firstName: 'Alex',
      lastName: 'Johnson', hireDate: '2026-01-12', status: 'onboarding',
      workLocation: 'Hybrid', workEmail: 'alex.johnson@eoms.io' },
    { userId: U['michael.chen'], positionId: pos[1].positionId, firstName: 'Michael',
      lastName: 'Chen', hireDate: '2023-06-01', status: 'active', workLocation: 'On-site' },
    { userId: U['sarah.williams'], positionId: pos[2].positionId, firstName: 'Sarah',
      lastName: 'Williams', hireDate: '2022-03-15', status: 'active', workLocation: 'Hybrid' },
    { userId: U['david.miller'], positionId: pos[3].positionId, firstName: 'David',
      lastName: 'Miller', hireDate: '2023-09-04', status: 'active', workLocation: 'On-site' },
  ]);
  console.log('✔ Demo data seeded — sign in with any username above / Password@123');
}
