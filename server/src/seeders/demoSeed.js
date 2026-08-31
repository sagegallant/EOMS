import bcrypt from 'bcryptjs';
import {
  sequelize,
  SystemUser,
  Role,
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
} from '../models/index.js';

export async function seed() {
  console.log('🌱 Starting comprehensive idempotent Indian Corporate seeding for EOMS...');

  // Disable foreign key checks for safe cleanup
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

  // Truncate tables to ensure a pristine idempotent state
  const tablesToClear = [
    'audit_logs', 'notifications', 'feedback_surveys', 'task_progress',
    'tasks', 'checklists', 'onboarding_plans', 'onboarding_templates',
    'document_verifications', 'documents', 'document_types',
    'training_quiz_attempts', 'training_records', 'training_modules', 'training_courses',
    'asset_allocations', 'assets', 'asset_models', 'asset_categories', 'software_provisioning',
    'emergency_contacts', 'employees', 'positions', 'departments',
    'user_roles', 'role_permissions', 'permissions', 'roles', 'system_users', 'system_settings'
  ];

  for (const table of tablesToClear) {
    try {
      await sequelize.query(`TRUNCATE TABLE \`${table}\``);
    } catch (err) {
      // fallback delete if truncate restricted
      await sequelize.query(`DELETE FROM \`${table}\``);
    }
  }

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

  // Default hashed password for all demo accounts
  const PW = await bcrypt.hash('Password@123', 10);

  // ── 1. Roles ────────────────────────────────────────────────────────
  const roles = await Role.bulkCreate([
    { roleName: 'SYSTEM_ADMIN', hierarchyLevel: 1, description: 'Chief System & Platform Administrator' },
    { roleName: 'HR_ADMIN', hierarchyLevel: 2, description: 'Head of People Operations & HR Admin' },
    { roleName: 'HR_SPECIALIST', hierarchyLevel: 3, description: 'Talent Integration & Onboarding Partner' },
    { roleName: 'COMPLIANCE_OFFICER', hierarchyLevel: 4, description: 'Legal, POSH & Regulatory Compliance Officer' },
    { roleName: 'IT_ADMIN', hierarchyLevel: 5, description: 'IT Infrastructure & Asset Provisioning Lead' },
    { roleName: 'RECRUITER', hierarchyLevel: 6, description: 'Talent Acquisition & Candidate Transition' },
    { roleName: 'DEPARTMENT_MANAGER', hierarchyLevel: 7, description: 'Engineering & Departmental People Manager' },
    { roleName: 'ONBOARDING_BUDDY', hierarchyLevel: 8, description: 'Peer Mentor & Technical Onboarding Buddy' },
    { roleName: 'EMPLOYEE', hierarchyLevel: 9, description: 'Standard Employee / New Hire Cohort Member' },
    { roleName: 'PAYROLL_ADMIN', hierarchyLevel: 10, description: 'India Payroll, TDS & EPFO Administrator' },
  ], { returning: true });
  const R = Object.fromEntries(roles.map(r => [r.roleName, r.roleId]));

  // ── 2. System Users (Indian Corporate Personas + Legacy Aliases) ─────
  const users = await SystemUser.bulkCreate([
    { username: 'admin', email: 'rajesh.nambiar@eoms.in', passwordHash: PW },
    { username: 'priya.patel', email: 'priya.patel@eoms.in', passwordHash: PW },
    { username: 'aarav.sharma', email: 'aarav.sharma@eoms.in', passwordHash: PW },
    { username: 'vikram.malhotra', email: 'vikram.malhotra@eoms.in', passwordHash: PW },
    { username: 'rohan.verma', email: 'rohan.verma@eoms.in', passwordHash: PW },
    { username: 'neha.nair', email: 'neha.nair@eoms.in', passwordHash: PW },
    { username: 'sneha.kulkarni', email: 'sneha.kulkarni@eoms.in', passwordHash: PW },
    { username: 'arjun.rao', email: 'arjun.rao@eoms.in', passwordHash: PW },
    { username: 'ananya.iyer', email: 'ananya.iyer@eoms.in', passwordHash: PW },
    { username: 'kabir.mehta', email: 'kabir.mehta@eoms.in', passwordHash: PW },
    { username: 'pooja.desai', email: 'pooja.desai@eoms.in', passwordHash: PW },
    { username: 'aditya.sengupta', email: 'aditya.sengupta@eoms.in', passwordHash: PW },
    { username: 'tanvi.reddy', email: 'tanvi.reddy@eoms.in', passwordHash: PW },
    { username: 'karthik.krishnan', email: 'karthik.krishnan@eoms.in', passwordHash: PW },
    { username: 'ritu.choudhury', email: 'ritu.choudhury@eoms.in', passwordHash: PW },
    // Legacy demo compatibility aliases
    { username: 'sarah.williams', email: 'sarah.williams@eoms.io', passwordHash: PW },
    { username: 'alex.johnson', email: 'alex.johnson@eoms.io', passwordHash: PW },
    { username: 'michael.chen', email: 'michael.chen@eoms.io', passwordHash: PW },
    { username: 'david.miller', email: 'david.miller@eoms.io', passwordHash: PW },
  ], { returning: true });
  const U = Object.fromEntries(users.map(u => [u.username, u.userId]));

  // User Roles
  await UserRole.bulkCreate([
    { userId: U.admin, roleId: R.SYSTEM_ADMIN, isPrimary: true },
    { userId: U['priya.patel'], roleId: R.HR_ADMIN, isPrimary: true },
    { userId: U['aarav.sharma'], roleId: R.EMPLOYEE, isPrimary: true },
    { userId: U['vikram.malhotra'], roleId: R.DEPARTMENT_MANAGER, isPrimary: true },
    { userId: U['rohan.verma'], roleId: R.IT_ADMIN, isPrimary: true },
    { userId: U['neha.nair'], roleId: R.COMPLIANCE_OFFICER, isPrimary: true },
    { userId: U['sneha.kulkarni'], roleId: R.EMPLOYEE, isPrimary: true },
    { userId: U['arjun.rao'], roleId: R.EMPLOYEE, isPrimary: true },
    { userId: U['ananya.iyer'], roleId: R.EMPLOYEE, isPrimary: true },
    { userId: U['kabir.mehta'], roleId: R.EMPLOYEE, isPrimary: true },
    { userId: U['pooja.desai'], roleId: R.HR_SPECIALIST, isPrimary: true },
    { userId: U['aditya.sengupta'], roleId: R.EMPLOYEE, isPrimary: true },
    { userId: U['tanvi.reddy'], roleId: R.RECRUITER, isPrimary: true },
    { userId: U['karthik.krishnan'], roleId: R.ONBOARDING_BUDDY, isPrimary: true },
    { userId: U['ritu.choudhury'], roleId: R.PAYROLL_ADMIN, isPrimary: true },
    // Aliases
    { userId: U['sarah.williams'], roleId: R.HR_ADMIN, isPrimary: true },
    { userId: U['alex.johnson'], roleId: R.EMPLOYEE, isPrimary: true },
    { userId: U['michael.chen'], roleId: R.DEPARTMENT_MANAGER, isPrimary: true },
    { userId: U['david.miller'], roleId: R.IT_ADMIN, isPrimary: true },
  ]);

  // ── 3. Departments ──────────────────────────────────────────────────
  const departments = await Department.bulkCreate([
    { deptName: 'Platform Engineering' },
    { deptName: 'Cloud & Infrastructure Operations' },
    { deptName: 'Product & UI/UX Design' },
    { deptName: 'People Operations (Human Resources)' },
    { deptName: 'IT & Systems Engineering' },
    { deptName: 'Legal, POSH & Compliance' },
    { deptName: 'Finance, Tax & Payroll' },
  ], { returning: true });
  const D = Object.fromEntries(departments.map(d => [d.deptName, d.deptId]));

  // ── 4. Positions ────────────────────────────────────────────────────
  const positions = await Position.bulkCreate([
    { deptId: D['Platform Engineering'], jobTitle: 'Engineering Director', jobGrade: 'M2' },
    { deptId: D['Platform Engineering'], jobTitle: 'Senior Software Engineer (SDE-II)', jobGrade: 'L3' },
    { deptId: D['Platform Engineering'], jobTitle: 'Lead Frontend Architect', jobGrade: 'L4' },
    { deptId: D['Cloud & Infrastructure Operations'], jobTitle: 'Cloud Infrastructure Specialist', jobGrade: 'L3' },
    { deptId: D['Product & UI/UX Design'], jobTitle: 'Senior Product Designer', jobGrade: 'L3' },
    { deptId: D['People Operations (Human Resources)'], jobTitle: 'Head of People Operations', jobGrade: 'M2' },
    { deptId: D['People Operations (Human Resources)'], jobTitle: 'Senior Talent Integration Partner', jobGrade: 'L2' },
    { deptId: D['IT & Systems Engineering'], jobTitle: 'Lead IT Systems Engineer', jobGrade: 'L3' },
    { deptId: D['Legal, POSH & Compliance'], jobTitle: 'Corporate Legal & POSH Officer', jobGrade: 'L3' },
    { deptId: D['Finance, Tax & Payroll'], jobTitle: 'Senior Payroll & Tax Specialist', jobGrade: 'L2' },
  ], { returning: true });
  const P = Object.fromEntries(positions.map(p => [p.jobTitle, p.positionId]));

  // ── 5. Employees ────────────────────────────────────────────────────
  const employees = await Employee.bulkCreate([
    // Leadership & Admins
    {
      userId: U.admin, positionId: P['Engineering Director'], firstName: 'Rajesh',
      lastName: 'Nambiar', hireDate: '2022-01-10', status: 'active',
      workLocation: 'Bengaluru', workEmail: 'rajesh.nambiar@eoms.in'
    },
    {
      userId: U['priya.patel'], positionId: P['Head of People Operations'], firstName: 'Priya',
      lastName: 'Patel', hireDate: '2023-03-01', status: 'active',
      workLocation: 'Bengaluru', workEmail: 'priya.patel@eoms.in'
    },
    {
      userId: U['vikram.malhotra'], positionId: P['Engineering Director'], firstName: 'Vikram',
      lastName: 'Malhotra', hireDate: '2023-06-15', status: 'active',
      workLocation: 'Bengaluru', workEmail: 'vikram.malhotra@eoms.in'
    },
    {
      userId: U['rohan.verma'], positionId: P['Lead IT Systems Engineer'], firstName: 'Rohan',
      lastName: 'Verma', hireDate: '2023-08-01', status: 'active',
      workLocation: 'Hyderabad', workEmail: 'rohan.verma@eoms.in'
    },
    {
      userId: U['neha.nair'], positionId: P['Corporate Legal & POSH Officer'], firstName: 'Neha',
      lastName: 'Nair', hireDate: '2024-02-12', status: 'active',
      workLocation: 'Bengaluru', workEmail: 'neha.nair@eoms.in'
    },
    // Onboarding Cohort Members
    {
      userId: U['aarav.sharma'], positionId: P['Senior Software Engineer (SDE-II)'], firstName: 'Aarav',
      lastName: 'Sharma', hireDate: '2026-01-12', status: 'onboarding',
      workLocation: 'Bengaluru', workEmail: 'aarav.sharma@eoms.in'
    },
    {
      userId: U['sneha.kulkarni'], positionId: P['Senior Product Designer'], firstName: 'Sneha',
      lastName: 'Kulkarni', hireDate: '2026-01-20', status: 'onboarding',
      workLocation: 'Pune', workEmail: 'sneha.kulkarni@eoms.in'
    },
    {
      userId: U['arjun.rao'], positionId: P['Cloud Infrastructure Specialist'], firstName: 'Arjun',
      lastName: 'Rao', hireDate: '2026-02-02', status: 'onboarding',
      workLocation: 'Hyderabad', workEmail: 'arjun.rao@eoms.in'
    },
    {
      userId: U['ananya.iyer'], positionId: P['Lead Frontend Architect'], firstName: 'Ananya',
      lastName: 'Iyer', hireDate: '2026-02-10', status: 'onboarding',
      workLocation: 'Bengaluru', workEmail: 'ananya.iyer@eoms.in'
    },
    {
      userId: U['kabir.mehta'], positionId: P['Senior Software Engineer (SDE-II)'], firstName: 'Kabir',
      lastName: 'Mehta', hireDate: '2026-02-20', status: 'onboarding',
      workLocation: 'Gurugram', workEmail: 'kabir.mehta@eoms.in'
    },
    {
      userId: U['aditya.sengupta'], positionId: P['Senior Software Engineer (SDE-II)'], firstName: 'Aditya',
      lastName: 'Sengupta', hireDate: '2026-03-01', status: 'onboarding',
      workLocation: 'Remote', workEmail: 'aditya.sengupta@eoms.in'
    },
    {
      userId: U['pooja.desai'], positionId: P['Senior Talent Integration Partner'], firstName: 'Pooja',
      lastName: 'Desai', hireDate: '2024-05-10', status: 'active',
      workLocation: 'Mumbai', workEmail: 'pooja.desai@eoms.in'
    },
    {
      userId: U['tanvi.reddy'], positionId: P['Senior Talent Integration Partner'], firstName: 'Tanvi',
      lastName: 'Reddy', hireDate: '2025-01-15', status: 'active',
      workLocation: 'Hyderabad', workEmail: 'tanvi.reddy@eoms.in'
    },
    {
      userId: U['karthik.krishnan'], positionId: P['Senior Software Engineer (SDE-II)'], firstName: 'Karthik',
      lastName: 'Krishnan', hireDate: '2024-09-01', status: 'active',
      workLocation: 'Bengaluru', workEmail: 'karthik.krishnan@eoms.in'
    },
    {
      userId: U['ritu.choudhury'], positionId: P['Senior Payroll & Tax Specialist'], firstName: 'Ritu',
      lastName: 'Choudhury', hireDate: '2024-11-15', status: 'active',
      workLocation: 'Bengaluru', workEmail: 'ritu.choudhury@eoms.in'
    },
    // Aliases
    {
      userId: U['alex.johnson'], positionId: P['Senior Software Engineer (SDE-II)'], firstName: 'Alex',
      lastName: 'Johnson', hireDate: '2026-01-12', status: 'onboarding',
      workLocation: 'Bengaluru', workEmail: 'alex.johnson@eoms.io'
    },
    {
      userId: U['sarah.williams'], positionId: P['Head of People Operations'], firstName: 'Sarah',
      lastName: 'Williams', hireDate: '2023-03-01', status: 'active',
      workLocation: 'Bengaluru', workEmail: 'sarah.williams@eoms.io'
    },
    {
      userId: U['michael.chen'], positionId: P['Engineering Director'], firstName: 'Michael',
      lastName: 'Chen', hireDate: '2023-06-15', status: 'active',
      workLocation: 'Bengaluru', workEmail: 'michael.chen@eoms.io'
    },
    {
      userId: U['david.miller'], positionId: P['Lead IT Systems Engineer'], firstName: 'David',
      lastName: 'Miller', hireDate: '2023-08-01', status: 'active',
      workLocation: 'Hyderabad', workEmail: 'david.miller@eoms.io'
    },
  ], { returning: true });

  const E = Object.fromEntries(employees.map(e => [`${e.firstName} ${e.lastName}`, e.employeeId]));

  // Set managers
  await Employee.update({ managerId: E['Vikram Malhotra'] }, {
    where: { employeeId: [E['Aarav Sharma'], E['Ananya Iyer'], E['Kabir Mehta'], E['Aditya Sengupta'], E['Karthik Krishnan'], E['Alex Johnson']] }
  });
  await Employee.update({ managerId: E['Priya Patel'] }, {
    where: { employeeId: [E['Pooja Desai'], E['Tanvi Reddy'], E['Ritu Choudhury']] }
  });

  // Emergency Contacts with Indian phone numbers & relations
  await EmergencyContact.bulkCreate([
    { employeeId: E['Aarav Sharma'], name: 'Sunil Sharma', relationship: 'Father', phone: '+91 98450 12345', email: 'sunil.sharma@gmail.com', isPrimary: true },
    { employeeId: E['Sneha Kulkarni'], name: 'Mahesh Kulkarni', relationship: 'Spouse', phone: '+91 97631 87654', email: 'mahesh.k@outlook.com', isPrimary: true },
    { employeeId: E['Arjun Rao'], name: 'Lakshmi Rao', relationship: 'Mother', phone: '+91 94401 54321', email: 'lakshmi.rao@yahoo.co.in', isPrimary: true },
    { employeeId: E['Ananya Iyer'], name: 'Suresh Iyer', relationship: 'Father', phone: '+91 98800 65432', email: 'suresh.iyer@gmail.com', isPrimary: true },
  ]);

  // ── 6. Onboarding Templates ─────────────────────────────────────────
  const templates = await OnboardingTemplate.bulkCreate([
    { templateName: 'Engineering 90-Day Ramp-Up (India Tech Hubs)', targetRole: 'EMPLOYEE', description: 'Structured 30-60-90 day engineering journey for SDEs in Bengaluru, Hyderabad & Pune.', deptId: D['Platform Engineering'], isActive: true },
    { templateName: 'General Corporate & Business Operations', targetRole: 'EMPLOYEE', description: 'Standard pan-India employee induction, statutory compliance, and corporate values.', deptId: D['People Operations (Human Resources)'], isActive: true },
    { templateName: 'Product Design & UX Immersion', targetRole: 'EMPLOYEE', description: 'Figma design system setup, customer empathy interviews, and sprint integration.', deptId: D['Product & UI/UX Design'], isActive: true },
  ], { returning: true });

  // ── 7. Onboarding Plans for Cohort Members ──────────────────────────
  const plans = await OnboardingPlan.bulkCreate([
    { employeeId: E['Aarav Sharma'], templateId: templates[0].templateId, startDate: '2026-01-12', targetCompletionDate: '2026-04-12', progressPercent: 72.00, status: 'in_progress' },
    { employeeId: E['Sneha Kulkarni'], templateId: templates[2].templateId, startDate: '2026-01-20', targetCompletionDate: '2026-04-20', progressPercent: 45.00, status: 'in_progress' },
    { employeeId: E['Arjun Rao'], templateId: templates[0].templateId, startDate: '2026-02-02', targetCompletionDate: '2026-05-02', progressPercent: 88.00, status: 'in_progress' },
    { employeeId: E['Ananya Iyer'], templateId: templates[0].templateId, startDate: '2026-02-10', targetCompletionDate: '2026-05-10', progressPercent: 60.00, status: 'in_progress' },
    { employeeId: E['Kabir Mehta'], templateId: templates[0].templateId, startDate: '2026-02-20', targetCompletionDate: '2026-05-20', progressPercent: 35.00, status: 'in_progress' },
    { employeeId: E['Aditya Sengupta'], templateId: templates[0].templateId, startDate: '2026-03-01', targetCompletionDate: '2026-06-01', progressPercent: 15.00, status: 'in_progress' },
    // Alias compatibility
    { employeeId: E['Alex Johnson'], templateId: templates[0].templateId, startDate: '2026-01-12', targetCompletionDate: '2026-04-12', progressPercent: 72.00, status: 'in_progress' },
  ], { returning: true });

  const planMap = Object.fromEntries(plans.map(p => [p.employeeId, p.planId]));

  // ── 8. Checklists & Tasks (Phased 30-60-90 Days) ─────────────────────
  for (const empPlan of plans) {
    const pId = empPlan.planId;
    const checklists = await Checklist.bulkCreate([
      { planId: pId, phaseName: 'Pre-boarding', phaseOrder: 1, dueOffsetDays: 0 },
      { planId: pId, phaseName: 'Day 1: Orientation & Setup', phaseOrder: 2, dueOffsetDays: 1 },
      { planId: pId, phaseName: 'Week 1: Team & Foundations', phaseOrder: 3, dueOffsetDays: 7 },
      { planId: pId, phaseName: '30 Days: Integration & First PR', phaseOrder: 4, dueOffsetDays: 30 },
      { planId: pId, phaseName: '60 Days: Project Ownership', phaseOrder: 5, dueOffsetDays: 60 },
      { planId: pId, phaseName: '90 Days: Final Evaluation', phaseOrder: 6, dueOffsetDays: 90 },
    ], { returning: true });

    // Populate Tasks for each checklist
    const c1 = checklists[0].checklistId;
    const c2 = checklists[1].checklistId;
    const c3 = checklists[2].checklistId;
    const c4 = checklists[3].checklistId;
    const c5 = checklists[4].checklistId;
    const c6 = checklists[5].checklistId;

    const createdTasks = await Task.bulkCreate([
      // Pre-boarding
      { checklistId: c1, title: 'Upload Government Identity Proof (Aadhaar & PAN)', category: 'compliance', priority: 'critical', estimatedMinutes: 20, isMandatory: true, sortOrder: 1 },
      { checklistId: c1, title: 'Complete EPFO Form 11 & UAN declaration', category: 'administrative', priority: 'high', estimatedMinutes: 25, isMandatory: true, sortOrder: 2 },
      { checklistId: c1, title: 'Submit Relieving Letter from previous employer', category: 'administrative', priority: 'high', estimatedMinutes: 15, isMandatory: true, sortOrder: 3 },
      { checklistId: c1, title: 'Confirm delivery address for corporate MacBook kit', category: 'it_setup', priority: 'high', estimatedMinutes: 10, isMandatory: true, sortOrder: 4 },
      // Day 1
      { checklistId: c2, title: 'Collect laptop from IT & complete hardware handover sign-off', category: 'it_setup', priority: 'critical', estimatedMinutes: 30, isMandatory: true, sortOrder: 1 },
      { checklistId: c2, title: 'Activate Google Workspace & 2FA corporate authenticator', category: 'it_setup', priority: 'critical', estimatedMinutes: 25, isMandatory: true, sortOrder: 2 },
      { checklistId: c2, title: 'Attend Virtual Welcome by People Operations (HR)', category: 'administrative', priority: 'high', estimatedMinutes: 60, isMandatory: true, sortOrder: 3 },
      { checklistId: c2, title: 'Acknowledge POSH Act 2013 Policy & ICC Committee details', category: 'compliance', priority: 'critical', estimatedMinutes: 30, isMandatory: true, sortOrder: 4 },
      // Week 1
      { checklistId: c3, title: 'Meet your Manager (1:1 Welcome & Expectation Setting)', category: 'manager_meeting', priority: 'high', estimatedMinutes: 45, isMandatory: true, sortOrder: 1 },
      { checklistId: c3, title: 'Connect with designated Onboarding Buddy (Karthik Krishnan)', category: 'administrative', priority: 'medium', estimatedMinutes: 30, isMandatory: false, sortOrder: 2 },
      { checklistId: c3, title: 'Complete Information Security & DPDP Compliance Module', category: 'training', priority: 'critical', estimatedMinutes: 60, isMandatory: true, sortOrder: 3 },
      { checklistId: c3, title: 'Configure local Docker, Node.js & GitHub SSH keys', category: 'it_setup', priority: 'high', estimatedMinutes: 90, isMandatory: true, sortOrder: 4 },
      // 30 Days
      { checklistId: c4, title: 'Submit first code pull request & obtain team approval', category: 'training', priority: 'high', estimatedMinutes: 120, isMandatory: true, sortOrder: 1 },
      { checklistId: c4, title: 'Complete POSH Sensitization Interactive Course & Quiz', category: 'compliance', priority: 'critical', estimatedMinutes: 45, isMandatory: true, sortOrder: 2 },
      { checklistId: c4, title: 'Conduct 30-Day Check-in & Feedback Survey with Manager', category: 'manager_meeting', priority: 'high', estimatedMinutes: 45, isMandatory: true, sortOrder: 3 },
      // 60 Days
      { checklistId: c5, title: 'Lead a technical feature sprint and participate in on-call shadow', category: 'training', priority: 'medium', estimatedMinutes: 180, isMandatory: true, sortOrder: 1 },
      { checklistId: c5, title: '60-Day Progress Sign-off with Department Manager', category: 'manager_meeting', priority: 'high', estimatedMinutes: 45, isMandatory: true, sortOrder: 2 },
      // 90 Days
      { checklistId: c6, title: '90-Day Comprehensive Performance & Milestone Evaluation', category: 'manager_meeting', priority: 'critical', estimatedMinutes: 60, isMandatory: true, sortOrder: 1 },
      { checklistId: c6, title: 'Formal transition from Onboarding to Full Active Contributor', category: 'administrative', priority: 'high', estimatedMinutes: 30, isMandatory: true, sortOrder: 2 },
    ], { returning: true });

    // Seed task progress for Aarav Sharma (or Alex Johnson) at 72%
    const isAarav = empPlan.employeeId === E['Aarav Sharma'] || empPlan.employeeId === E['Alex Johnson'];
    for (let i = 0; i < createdTasks.length; i++) {
      const task = createdTasks[i];
      let status = 'not_started';
      if (isAarav) {
        if (i < 11) status = 'completed'; // ~70% done
        else if (i === 11 || i === 12) status = 'in_progress';
        else status = 'not_started';
      } else {
        if (i < 5) status = 'completed';
        else if (i < 8) status = 'in_progress';
        else status = 'not_started';
      }

      await TaskProgress.create({
        employeeId: empPlan.employeeId,
        taskId: task.taskId,
        status,
        completedAt: status === 'completed' ? new Date('2026-02-15') : null,
        notes: status === 'completed' ? 'Verified by mentor & manager' : null,
      });
    }
  }

  // ── 9. Document Types & Uploaded Compliance Documents ───────────────
  const docTypes = await DocumentType.bulkCreate([
    { typeName: 'PAN Card Copy', description: 'Mandatory Indian Income Tax PAN card copy for TDS compliance.', isRequired: true, allowedExtensions: 'pdf,jpg,png' },
    { typeName: 'Aadhaar Identity Proof', description: 'UIDAI Aadhaar government identity proof.', isRequired: true, allowedExtensions: 'pdf,jpg,png' },
    { typeName: 'EPFO Form 11 Declaration', description: 'Employees Provident Fund Organization enrollment and UAN registration.', isRequired: true, allowedExtensions: 'pdf' },
    { typeName: 'Relieving & Experience Letter', description: 'Formal clearance certificate from previous employer.', isRequired: true, allowedExtensions: 'pdf' },
    { typeName: 'Cancelled Cheque / Bank Proof', description: 'Direct salary credit account proof (HDFC, ICICI, SBI).', isRequired: true, allowedExtensions: 'pdf,jpg,png' },
    { typeName: 'POSH Policy Acknowledgement', description: 'Signed sign-off for Prevention of Sexual Harassment at Workplace Act.', isRequired: true, allowedExtensions: 'pdf' },
  ], { returning: true });
  const DT = Object.fromEntries(docTypes.map(d => [d.typeName, d.typeId]));

  const documents = await Document.bulkCreate([
    { employeeId: E['Aarav Sharma'], typeId: DT['PAN Card Copy'], fileName: 'Aarav_Sharma_PAN_Card.pdf', filePath: '/docs/emp_aarav_pan.pdf', fileSizeBytes: 1048576, mimeType: 'application/pdf' },
    { employeeId: E['Aarav Sharma'], typeId: DT['Aadhaar Identity Proof'], fileName: 'Aarav_Sharma_Aadhaar.pdf', filePath: '/docs/emp_aarav_aadhaar.pdf', fileSizeBytes: 2097152, mimeType: 'application/pdf' },
    { employeeId: E['Aarav Sharma'], typeId: DT['EPFO Form 11 Declaration'], fileName: 'Aarav_Sharma_EPFO_Form11.pdf', filePath: '/docs/emp_aarav_form11.pdf', fileSizeBytes: 524288, mimeType: 'application/pdf' },
    { employeeId: E['Aarav Sharma'], typeId: DT['Cancelled Cheque / Bank Proof'], fileName: 'Aarav_HDFC_Bank_Cheque.pdf', filePath: '/docs/emp_aarav_cheque.pdf', fileSizeBytes: 819200, mimeType: 'application/pdf' },
    { employeeId: E['Aarav Sharma'], typeId: DT['POSH Policy Acknowledgement'], fileName: 'Aarav_POSH_Signed_Affidavit.pdf', filePath: '/docs/emp_aarav_posh.pdf', fileSizeBytes: 614400, mimeType: 'application/pdf' },
    { employeeId: E['Sneha Kulkarni'], typeId: DT['PAN Card Copy'], fileName: 'Sneha_Kulkarni_PAN.pdf', filePath: '/docs/emp_sneha_pan.pdf', fileSizeBytes: 940000, mimeType: 'application/pdf' },
    { employeeId: E['Sneha Kulkarni'], typeId: DT['Aadhaar Identity Proof'], fileName: 'Sneha_Kulkarni_Aadhaar.pdf', filePath: '/docs/emp_sneha_aadhaar.pdf', fileSizeBytes: 1800000, mimeType: 'application/pdf' },
    { employeeId: E['Arjun Rao'], typeId: DT['PAN Card Copy'], fileName: 'Arjun_Rao_PAN.pdf', filePath: '/docs/emp_arjun_pan.pdf', fileSizeBytes: 850000, mimeType: 'application/pdf' },
    { employeeId: E['Ananya Iyer'], typeId: DT['PAN Card Copy'], fileName: 'Ananya_Iyer_PAN.pdf', filePath: '/docs/emp_ananya_pan.pdf', fileSizeBytes: 920000, mimeType: 'application/pdf' },
  ], { returning: true });

  // Document Verifications
  await DocumentVerification.bulkCreate([
    { documentId: documents[0].documentId, reviewerUserId: U['priya.patel'], status: 'approved', comments: 'PAN details cross-verified with NSDL database. Approved.' },
    { documentId: documents[1].documentId, reviewerUserId: U['priya.patel'], status: 'approved', comments: 'Aadhaar masked copy verified.' },
    { documentId: documents[2].documentId, reviewerUserId: U['priya.patel'], status: 'approved', comments: 'UAN validated for PF transfer.' },
    { documentId: documents[3].documentId, reviewerUserId: U['priya.patel'], status: 'approved', comments: 'HDFC IFSC code and account name match candidate records.' },
    { documentId: documents[4].documentId, reviewerUserId: U['neha.nair'], status: 'pending', comments: 'Under legal compliance review queue.' },
    { documentId: documents[5].documentId, reviewerUserId: U['priya.patel'], status: 'approved', comments: 'PAN verification verified.' },
    { documentId: documents[6].documentId, reviewerUserId: U['priya.patel'], status: 'requires_resubmission', comments: 'Corner of Aadhaar is truncated. Please re-upload clearer scan.' },
    { documentId: documents[7].documentId, reviewerUserId: U['priya.patel'], status: 'pending', comments: 'In verification queue.' },
    { documentId: documents[8].documentId, reviewerUserId: U['priya.patel'], status: 'pending', comments: 'In verification queue.' },
  ]);

  // ── 10. Training Courses, Modules & Employee Records ─────────────────
  const courses = await TrainingCourse.bulkCreate([
    { title: 'POSH Act 2013 Sensitization & Prevention of Workplace Harassment', description: 'Mandatory Indian statutory training on recognizing, preventing, and reporting workplace misconduct under ICC guidelines.', durationMinutes: 45, isMandatory: true, passingScore: 80 },
    { title: 'Information Security & DPDP Act Compliance', description: 'Data protection standards, handling customer PII, corporate phishing defense, and secure engineering practices.', durationMinutes: 60, isMandatory: true, passingScore: 85 },
    { title: 'EOMS Cloud Infrastructure & Git Flow Standards', description: 'Microservices architecture, Docker environment setup, PR code review conventions, and CI/CD deployment policies.', durationMinutes: 90, isMandatory: true, passingScore: 80 },
    { title: 'Corporate Code of Conduct & Anti-Bribery Standards', description: 'Company ethics, gift policies, conflict of interest, and whistle-blower mechanisms.', durationMinutes: 30, isMandatory: true, passingScore: 80 },
  ], { returning: true });

  // Modules for courses
  await TrainingModule.bulkCreate([
    { courseId: courses[0].courseId, title: 'Understanding the POSH Act 2013 & Legal Definitions', contentType: 'slides', moduleOrder: 1 },
    { courseId: courses[0].courseId, title: 'Internal Complaints Committee (ICC) Role & Redressal Procedures', contentType: 'video', moduleOrder: 2 },
    { courseId: courses[0].courseId, title: 'Workplace Conduct Scenarios & Case Studies', contentType: 'document', moduleOrder: 3 },
    { courseId: courses[0].courseId, title: 'POSH Mandatory Certification Quiz', contentType: 'quiz', moduleOrder: 4 },
    // Course 2
    { courseId: courses[1].courseId, title: 'Digital Personal Data Protection (DPDP) Core Principles', contentType: 'slides', moduleOrder: 1 },
    { courseId: courses[1].courseId, title: 'Phishing Awareness, 2FA & Password Hygiene', contentType: 'video', moduleOrder: 2 },
    { courseId: courses[1].courseId, title: 'Information Security Final Assessment', contentType: 'quiz', moduleOrder: 3 },
  ]);

  // Training Records for Aarav Sharma
  await TrainingRecord.bulkCreate([
    { employeeId: E['Aarav Sharma'], courseId: courses[0].courseId, status: 'in_progress', score: 85, progressPercent: 64, startedAt: new Date('2026-02-01') },
    { employeeId: E['Aarav Sharma'], courseId: courses[1].courseId, status: 'completed', score: 92, progressPercent: 100, startedAt: new Date('2026-01-15'), completedAt: new Date('2026-01-20') },
    { employeeId: E['Aarav Sharma'], courseId: courses[2].courseId, status: 'completed', score: 95, progressPercent: 100, startedAt: new Date('2026-01-22'), completedAt: new Date('2026-01-28') },
    { employeeId: E['Aarav Sharma'], courseId: courses[3].courseId, status: 'completed', score: 100, progressPercent: 100, startedAt: new Date('2026-01-14'), completedAt: new Date('2026-01-14') },
    // Other employees
    { employeeId: E['Sneha Kulkarni'], courseId: courses[0].courseId, status: 'in_progress', score: 70, progressPercent: 50, startedAt: new Date('2026-02-05') },
    { employeeId: E['Arjun Rao'], courseId: courses[0].courseId, status: 'completed', score: 95, progressPercent: 100, startedAt: new Date('2026-02-05'), completedAt: new Date('2026-02-10') },
  ]);

  // ── 11. Assets, Models & Provisioning ────────────────────────────────
  const assetCategories = await AssetCategory.bulkCreate([
    { categoryName: 'Laptops & Workstations', type: 'hardware' },
    { categoryName: 'Displays & Peripherals', type: 'peripheral' },
    { categoryName: 'Hardware Security Tokens', type: 'access_card' },
    { categoryName: 'Enterprise SaaS Licenses', type: 'software_license' },
  ], { returning: true });
  const AC = Object.fromEntries(assetCategories.map(c => [c.categoryName, c.categoryId]));

  const assetModels = await AssetModel.bulkCreate([
    { categoryId: AC['Laptops & Workstations'], manufacturer: 'Apple', modelName: 'MacBook Pro 16" M3 Max (36GB / 1TB)', specs: '16-core GPU, 36GB Unified Memory, Liquid Retina XDR' },
    { categoryId: AC['Laptops & Workstations'], manufacturer: 'Lenovo', modelName: 'ThinkPad T14s Gen 5 (32GB / 1TB)', specs: 'AMD Ryzen 7 PRO, 32GB LPDDR5x, OLED display' },
    { categoryId: AC['Displays & Peripherals'], manufacturer: 'Dell', modelName: 'UltraSharp 27" 4K USB-C Hub (U2723QE)', specs: '4K UHD, IPS Black, 90W Power Delivery' },
    { categoryId: AC['Hardware Security Tokens'], manufacturer: 'Yubico', modelName: 'YubiKey 5C NFC', specs: 'FIDO2 / WebAuthn, USB-C + NFC hardware security' },
  ], { returning: true });

  const assets = await Asset.bulkCreate([
    { modelId: assetModels[0].modelId, serialNumber: 'C02XYZ108M3', assetTag: 'BLR-MBP-2026-108', status: 'allocated', purchasedAt: '2025-11-01' },
    { modelId: assetModels[0].modelId, serialNumber: 'C02XYZ109M3', assetTag: 'BLR-MBP-2026-109', status: 'allocated', purchasedAt: '2025-11-01' },
    { modelId: assetModels[1].modelId, serialNumber: 'PF2K991A4', assetTag: 'HYD-TP-2026-214', status: 'allocated', purchasedAt: '2025-12-05' },
    { modelId: assetModels[1].modelId, serialNumber: 'PF2K992B5', assetTag: 'PUN-TP-2026-215', status: 'in_stock', purchasedAt: '2025-12-05' },
    { modelId: assetModels[2].modelId, serialNumber: 'CN088DEL4K', assetTag: 'BLR-MON-2026-088', status: 'allocated', purchasedAt: '2026-01-10' },
    { modelId: assetModels[3].modelId, serialNumber: 'YK5C-99014', assetTag: 'BLR-SEC-2026-014', status: 'allocated', purchasedAt: '2026-01-10' },
    { modelId: assetModels[0].modelId, serialNumber: 'C02XYZ110M3', assetTag: 'BLR-MBP-2026-110', status: 'in_stock', purchasedAt: '2026-02-01' },
  ], { returning: true });

  // Asset Allocations
  await AssetAllocation.bulkCreate([
    { assetId: assets[0].assetId, employeeId: E['Aarav Sharma'], allocatedBy: U['rohan.verma'], acknowledgementStatus: 'acknowledged', notes: 'Handed over at Bengaluru Bellandur Tech Hub on Day 1.' },
    { assetId: assets[4].assetId, employeeId: E['Aarav Sharma'], allocatedBy: U['rohan.verma'], acknowledgementStatus: 'acknowledged', notes: 'Dell 4K monitor dispatched for hybrid home setup.' },
    { assetId: assets[5].assetId, employeeId: E['Aarav Sharma'], allocatedBy: U['rohan.verma'], acknowledgementStatus: 'acknowledged', notes: 'Configured for AWS & GitHub 2FA.' },
    { assetId: assets[1].assetId, employeeId: E['Sneha Kulkarni'], allocatedBy: U['rohan.verma'], acknowledgementStatus: 'pending', notes: 'Dispatched via Blue Dart courier to Pune Hinjawadi office.' },
    { assetId: assets[2].assetId, employeeId: E['Arjun Rao'], allocatedBy: U['rohan.verma'], acknowledgementStatus: 'acknowledged', notes: 'Collected at Hyderabad HITEC City office.' },
  ]);

  // ── 12. Notifications & Communication ───────────────────────────────
  await Notification.bulkCreate([
    { userId: U['aarav.sharma'], title: 'Welcome to EOMS Technologies India! 🎉', message: 'Welcome Aarav! Your 90-day onboarding journey has officially begun. Check your Day 1 task list.', channel: 'in_app', isRead: true },
    { userId: U['aarav.sharma'], title: 'Hardware Handover Acknowledged ✓', message: 'Your MacBook Pro 16" (BLR-MBP-2026-108) allocation has been successfully acknowledged.', channel: 'in_app', isRead: true },
    { userId: U['aarav.sharma'], title: 'Reminder: Complete Mandatory POSH Training', message: 'Please complete the POSH Act 2013 compliance course before March 15.', channel: 'in_app', isRead: false },
    { userId: U['priya.patel'], title: 'New Document Pending Review ▤', message: 'Sneha Kulkarni has re-uploaded identity proof. Awaiting HR verification.', channel: 'in_app', isRead: false },
    { userId: U['vikram.malhotra'], title: 'Upcoming Milestone Review ⏱️', message: 'Aarav Sharma has achieved 72% onboarding progress. 60-Day Review due soon.', channel: 'in_app', isRead: false },
    { userId: U['rohan.verma'], title: 'New Hardware Dispatch Request 💻', message: 'Laptop allocation requested for incoming hire Aditya Sengupta (Remote).', channel: 'in_app', isRead: false },
  ]);

  // ── 13. System Settings & Audit Logs ────────────────────────────────
  await SystemSetting.bulkCreate([
    { settingKey: 'company_legal_name', settingValue: 'EOMS Technologies India Private Limited', description: 'Registered legal entity name for contracts and tax compliance.' },
    { settingKey: 'primary_tech_hub', settingValue: 'Bengaluru (Bellandur Tech Corridor), Karnataka, India', description: 'Headquarters and primary operations center.' },
    { settingKey: 'onboarding_sla_target_days', settingValue: '45', description: 'Target maximum days for new hires to reach 100% completion.' },
    { settingKey: 'support_email', settingValue: 'peopleops@eoms.in', description: 'Contact email for new hire questions and IT support.' },
    { settingKey: 'posh_committee_email', settingValue: 'icc.complaints@eoms.in', description: 'Confidential Internal Complaints Committee reporting mailbox.' },
    { settingKey: 'mfa_enforced', settingValue: 'true', description: 'Enforce hardware/TOTP 2FA for all corporate system access.' },
  ]);

  await AuditLog.bulkCreate([
    { userId: U.admin, action: 'SYSTEM_BOOTSTRAP', targetTable: 'roles', details: { rolesSeeded: 10 } },
    { userId: U['priya.patel'], action: 'EMPLOYEE_ONBOARDED', targetTable: 'employees', targetId: String(E['Aarav Sharma']), details: { employee: 'Aarav Sharma', role: 'SDE-II', hub: 'Bengaluru' } },
    { userId: U['priya.patel'], action: 'DOCUMENT_VERIFIED', targetTable: 'documents', targetId: '1', details: { document: 'PAN Card', status: 'approved' } },
    { userId: U['rohan.verma'], action: 'ASSET_ALLOCATED', targetTable: 'assets', targetId: '1', details: { assetTag: 'BLR-MBP-2026-108', recipient: 'Aarav Sharma' } },
  ]);

  console.log('✔ Idempotent Indian corporate seeding completed successfully!');
  console.log('✔ 10 Roles, 7 Departments, 10 Positions, 19 Users & Employees, 40+ Tasks, Documents, Training & Assets seeded.');
}
