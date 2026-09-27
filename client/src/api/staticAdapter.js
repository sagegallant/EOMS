// Static Data Mock Adapter for GitHub Pages & Standalone Previews
import {
  STATIC_USERS,
  STATIC_EMPLOYEES,
  STATIC_DEPARTMENTS,
  STATIC_POSITIONS,
  STATIC_CHECKLIST_TASKS,
  STATIC_ASSETS,
  STATIC_DOCUMENTS,
  STATIC_TRAINING_COURSES,
  STATIC_POSH_QUESTIONS,
  STATIC_NOTIFICATIONS,
  STATIC_REPORTS_SUMMARY,
  STATIC_AUDIT_LOGS,
} from './staticData';

// Clone datasets into memory so interactive user actions persist during the session
let employees = [...STATIC_EMPLOYEES];
let tasks = [...STATIC_CHECKLIST_TASKS];
let assets = [...STATIC_ASSETS];
let documents = [...STATIC_DOCUMENTS];
let notifications = [...STATIC_NOTIFICATIONS];
let auditLogs = [...STATIC_AUDIT_LOGS];

export function handleStaticRequest(config) {
  const url = (config.url || '').replace(/^[a-z]+:\/\/[^/]+/i, '').replace(/^\/api\/v1/, '');
  const method = (config.method || 'get').toLowerCase();

  // Helper response wrapper
  const respond = (status, data) => ({
    data,
    status,
    statusText: status === 200 || status === 201 ? 'OK' : 'Error',
    headers: {},
    config,
  });

  // 1. Auth: Login
  if (url === '/auth/login' && method === 'post') {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch { /* ignore */ }
    const identifier = (body.identifier || body.username || '').toLowerCase().trim();
    
    // Find matching persona or default to HR Admin (Priya Patel)
    const user = STATIC_USERS.find(
      u => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    ) || STATIC_USERS[1]; // Priya Patel fallback

    return respond(200, {
      message: 'Login successful (Static Demo Mode)',
      token: `static-demo-token-${user.userId}-${Date.now()}`,
      user: {
        id: user.userId,
        userId: user.userId,
        username: user.username,
        email: user.email,
        roles: user.roles,
        employeeId: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        name: `${user.firstName} ${user.lastName}`,
        dept: user.dept || 'Engineering',
        hub: user.hub || 'Bengaluru',
        mfaEnabled: false,
      },
    });
  }

  // 1b. Auth: MFA endpoints
  if (url === '/auth/mfa/verify' && method === 'post') {
    return respond(200, {
      token: `static-mfa-token-${Date.now()}`,
      user: {
        id: STATIC_USERS[1].userId,
        userId: STATIC_USERS[1].userId,
        username: STATIC_USERS[1].username,
        email: STATIC_USERS[1].email,
        roles: STATIC_USERS[1].roles,
        employeeId: STATIC_USERS[1].employeeId,
        firstName: STATIC_USERS[1].firstName,
        lastName: STATIC_USERS[1].lastName,
        fullName: `${STATIC_USERS[1].firstName} ${STATIC_USERS[1].lastName}`,
        name: `${STATIC_USERS[1].firstName} ${STATIC_USERS[1].lastName}`,
        mfaEnabled: false,
      },
    });
  }
  if (url === '/auth/mfa/setup' && method === 'post') {
    return respond(200, {
      qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e2e8f0"/><text x="50" y="55" font-size="12" text-anchor="middle" fill="%23475569">MFA QR Code</text></svg>',
      manualSecret: 'JBSWY3DPEHPK3PXP',
      backupCodes: ['ABCD1234', 'EFGH5678', 'IJKL9012'],
      setupToken: 'static-setup-token',
    });
  }
  if (url === '/auth/mfa/enable' && method === 'post') {
    return respond(200, { message: 'Multi-factor authentication (TOTP) successfully activated.' });
  }
  if (url === '/auth/mfa/disable' && method === 'post') {
    return respond(200, { message: 'MFA has been disabled.' });
  }

  // 2. Auth: Me
  if (url === '/auth/me' && method === 'get') {
    return respond(200, { user: STATIC_USERS[1] });
  }

  // 3. Departments & Positions (must precede generic /employees)
  if (url === '/employees/departments' || url === '/departments') {
    return respond(200, { data: STATIC_DEPARTMENTS });
  }
  if (url === '/employees/positions' || url === '/positions') {
    return respond(200, { data: STATIC_POSITIONS });
  }

  // 4. Employees
  const empIdMatch = url.match(/^\/employees\/(\d+)$/);
  if (empIdMatch && method === 'get') {
    const id = Number(empIdMatch[1]);
    const emp = employees.find(e => e.employeeId === id) || employees[0];
    return respond(200, { data: emp });
  }
  if (url.startsWith('/employees') && method === 'get') {
    return respond(200, { data: employees });
  }
  if (url === '/employees' && method === 'post') {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch { /* ignore */ }
    const newEmp = {
      employeeId: employees.length + 1,
      userId: employees.length + 1,
      firstName: body.firstName || 'New',
      lastName: body.lastName || 'Hire',
      workEmail: body.workEmail || 'new.hire@eoms.in',
      workLocation: body.workLocation || 'Bengaluru (Hybrid)',
      status: 'onboarding',
      hireDate: body.hireDate || new Date().toISOString().split('T')[0],
      Position: STATIC_POSITIONS.find(p => p.positionId === Number(body.positionId)) || STATIC_POSITIONS[0],
      OnboardingPlan: { progressPercent: 0, status: 'in_progress' },
    };
    employees.unshift(newEmp);
    return respond(201, { message: 'Employee registered.', data: newEmp });
  }

  // 5. Onboarding & Cohorts
  if (url.startsWith('/onboarding/employee') && method === 'get') {
    return respond(200, {
      data: {
        planId: 1,
        status: 'in_progress',
        progressPercent: 72,
        Checklists: [
          { checklistId: 1, phaseName: 'Pre-Boarding', Tasks: tasks.slice(0, 4) },
          { checklistId: 2, phaseName: 'Day 1 Orientation', Tasks: tasks.slice(4, 8) },
          { checklistId: 3, phaseName: 'Week 1 Integration', Tasks: tasks.slice(8) },
        ],
      },
    });
  }
  if (url.startsWith('/onboarding') && method === 'get') {
    return respond(200, {
      data: [
        { templateId: 1, templateName: 'Q1 Tech Engineering Cohort', cohortSize: 12, targetDays: 45 },
        { templateId: 2, templateName: 'People Operations & Support Cohort', cohortSize: 4, targetDays: 30 },
      ],
    });
  }

  // 6. Tasks & Progress
  if (url.startsWith('/tasks/') && url.endsWith('/progress') && method === 'patch') {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch { /* ignore */ }
    const taskIdMatch = url.match(/\/tasks\/(\d+)\/progress/);
    const taskId = taskIdMatch ? Number(taskIdMatch[1]) : 1;

    tasks = tasks.map(t => t.taskId === taskId ? { ...t, status: body.status || 'completed' } : t);
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const progressPercent = Math.round((completedCount / tasks.length) * 100);

    return respond(200, {
      message: 'Task progress updated.',
      data: { taskId, status: body.status || 'completed' },
      plan: { progressPercent, status: progressPercent === 100 ? 'completed' : 'in_progress' },
    });
  }
  if (url.startsWith('/tasks') && method === 'get') {
    return respond(200, { data: tasks });
  }

  // 7. Assets & Allocations
  if (url === '/assets/allocations' && method === 'get') {
    const allAllocations = assets.flatMap(a => a.AssetAllocations || []);
    return respond(200, { data: allAllocations });
  }
  if (url === '/assets' && method === 'get') {
    return respond(200, { data: assets });
  }
  if (url === '/assets/allocate' && method === 'post') {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch { /* ignore */ }
    const assetId = Number(body.assetId);
    const emp = employees.find(e => e.employeeId === Number(body.employeeId)) || employees[0];

    assets = assets.map(a => {
      if (a.assetId === assetId) {
        const newAlloc = {
          allocationId: Date.now(),
          assetId,
          employeeId: emp.employeeId,
          acknowledgementStatus: 'pending',
          allocatedAt: new Date().toISOString(),
          Employee: { firstName: emp.firstName, lastName: emp.lastName },
          Asset: a,
        };
        return { ...a, status: 'allocated', AssetAllocations: [newAlloc] };
      }
      return a;
    });
    return respond(201, { message: 'Asset allocated.', data: { assetId, status: 'allocated' } });
  }
  if (url.includes('/acknowledge') && method === 'patch') {
    assets = assets.map(a => ({
      ...a,
      AssetAllocations: (a.AssetAllocations || []).map(al => ({ ...al, acknowledgementStatus: 'acknowledged' })),
    }));
    return respond(200, { message: 'Asset handover acknowledged.', data: { acknowledgementStatus: 'acknowledged' } });
  }

  // 8. Documents
  if (url === '/documents' && method === 'get') {
    return respond(200, { data: documents });
  }
  if (url === '/documents/upload' && method === 'post') {
    const newDoc = {
      documentId: documents.length + 1,
      fileName: 'uploaded_document.pdf',
      uploadedAt: new Date().toISOString().split('T')[0],
      DocumentType: { typeName: 'Identity / Statutory Proof', isMandatory: true },
      Employee: { firstName: 'Aarav', lastName: 'Sharma', workEmail: 'aarav.sharma@eoms.in' },
      DocumentVerifications: [{ status: 'pending', notes: 'Pending compliance review.', verifiedAt: null }],
    };
    documents.unshift(newDoc);
    return respond(201, { message: 'Document submitted.', data: { document: newDoc } });
  }
  if (url.includes('/verify') && method === 'patch') {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch { /* ignore */ }
    const docIdMatch = url.match(/\/documents\/(\d+)\/verify/);
    const docId = docIdMatch ? Number(docIdMatch[1]) : 1;

    documents = documents.map(d => {
      if (d.documentId === docId) {
        return {
          ...d,
          DocumentVerifications: [{ status: body.status || 'approved', notes: body.comments || 'Verified in demo mode.', verifiedAt: new Date().toISOString() }],
        };
      }
      return d;
    });
    return respond(200, { message: 'Document verified.', data: { status: body.status || 'approved' } });
  }

  // 9. Training & Quiz
  if (url.includes('/quiz/submit') && method === 'post') {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch { /* ignore */ }
    const answers = body.answers || {};
    let correct = 0;
    STATIC_POSH_QUESTIONS.forEach(q => {
      if (Number(answers[q.id]) === q.correctIndex) correct++;
    });
    const score = Math.round((correct / STATIC_POSH_QUESTIONS.length) * 100);
    const passed = score >= 80;

    return respond(200, {
      message: passed ? 'Quiz passed successfully!' : 'Quiz submitted.',
      data: { score, passed, recordStatus: passed ? 'completed' : 'in_progress', totalQuestions: 5, correctAnswers: correct },
    });
  }
  if (url.includes('/quiz') && method === 'get') {
    // Strip correctIndex for client
    const clientQuestions = STATIC_POSH_QUESTIONS.map(({ id, question, options }) => ({ id, question, options }));
    return respond(200, { data: { courseTitle: 'POSH Act 2013 Sensitization', passingScore: 80, questions: clientQuestions } });
  }
  if (url.startsWith('/training/courses') && method === 'get') {
    return respond(200, { data: STATIC_TRAINING_COURSES });
  }

  // 10. Reports Summary
  if (url.startsWith('/reports/summary')) {
    return respond(200, { data: STATIC_REPORTS_SUMMARY });
  }

  // 11. Notifications
  if (url === '/notifications' && method === 'get') {
    return respond(200, { data: notifications });
  }
  if (url.endsWith('/read') && method === 'patch') {
    const idMatch = url.match(/\/notifications\/(\d+)\/read/);
    const id = idMatch ? Number(idMatch[1]) : 1;
    notifications = notifications.map(n => n.notificationId === id ? { ...n, isRead: true } : n);
    return respond(200, { message: 'Marked as read.' });
  }
  if (url.includes('/read-all') && method === 'patch') {
    notifications = notifications.map(n => ({ ...n, isRead: true }));
    return respond(200, { message: 'All marked as read.' });
  }

  // 12. Audit Logs
  if (url.startsWith('/audit')) {
    return respond(200, { data: auditLogs, pagination: { total: auditLogs.length, page: 1, limit: 50, totalPages: 1 } });
  }

  // 13. Settings
  if (url.startsWith('/settings')) {
    return respond(200, {
      data: [
        { settingKey: 'company_legal_name', settingValue: 'EOMS Technologies India Private Limited' },
        { settingKey: 'primary_tech_hub', settingValue: 'Bengaluru, Karnataka, India' },
        { settingKey: 'onboarding_sla_target_days', settingValue: '45' },
      ],
    });
  }

  // Fallback
  return respond(200, { data: [] });
}
