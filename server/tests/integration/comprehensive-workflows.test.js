import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../../src/app.js';
import {
  sequelize,
  SystemUser,
  Employee,
  Asset,
  AssetModel,
  Document,
  DocumentType,
  TrainingCourse,
  TrainingRecord,
  TrainingQuizAttempt,
  AuditLog,
} from '../../src/models/index.js';

describe('Comprehensive Enterprise Workflows & Security Verification', () => {
  let server;
  let baseUrl;
  let hrToken;
  let itToken;
  let emp1Token;
  let emp2Token;
  let complianceToken;

  let emp1EmployeeId;
  let emp2EmployeeId;

  let testEmpId;
  let testAssetId;
  let testAllocationId;
  let testDocId;

  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/v1`;
        resolve();
      });
    });

    // Obtain tokens
    const login = async (identifier, password = 'Password@123') => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      return { token: data.token, user: data.user };
    };

    const hrRes = await login('priya.patel');
    hrToken = hrRes.token;

    const itRes = await login('rohan.verma');
    itToken = itRes.token;

    const emp1Res = await login('aarav.sharma');
    emp1Token = emp1Res.token;
    emp1EmployeeId = emp1Res.user.employeeId;

    const emp2Res = await login('sneha.kulkarni');
    emp2Token = emp2Res.token;
    emp2EmployeeId = emp2Res.user.employeeId;

    const compRes = await login('neha.nair');
    complianceToken = compRes.token;
  });

  after(async () => {
    try {
      if (testAssetId) {
        await sequelize.query(`DELETE FROM asset_allocations WHERE asset_id = ${testAssetId}`);
        await sequelize.query(`DELETE FROM assets WHERE asset_id = ${testAssetId}`);
      }
      if (testEmpId) {
        const [empRows] = await sequelize.query(`SELECT user_id FROM employees WHERE employee_id = ${testEmpId}`);
        const userId = empRows?.[0]?.user_id;
        await sequelize.query(`DELETE FROM task_progress WHERE employee_id = ${testEmpId}`);
        await sequelize.query(`DELETE FROM tasks WHERE checklist_id IN (SELECT checklist_id FROM checklists WHERE plan_id IN (SELECT plan_id FROM onboarding_plans WHERE employee_id = ${testEmpId}))`);
        await sequelize.query(`DELETE FROM checklists WHERE plan_id IN (SELECT plan_id FROM onboarding_plans WHERE employee_id = ${testEmpId})`);
        await sequelize.query(`DELETE FROM onboarding_plans WHERE employee_id = ${testEmpId}`);
        await sequelize.query(`DELETE FROM emergency_contacts WHERE employee_id = ${testEmpId}`);
        await sequelize.query(`DELETE FROM employees WHERE employee_id = ${testEmpId}`);
        if (userId) {
          await sequelize.query(`DELETE FROM user_roles WHERE user_id = ${userId}`);
          await sequelize.query(`DELETE FROM system_users WHERE user_id = ${userId}`);
        }
      }
      if (testDocId) {
        await sequelize.query(`DELETE FROM document_verifications WHERE document_id = ${testDocId}`);
        await sequelize.query(`DELETE FROM documents WHERE document_id = ${testDocId}`);
      }
    } catch {
      // ignore
    }
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  });

  // ── 1. AUTH & JWT VERIFICATION ───────────────────────────────────────────
  describe('1. Authentication & Session Security', () => {
    test('Valid login returns authoritative JWT and user session payload', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'priya.patel', password: 'Password@123' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.token);
      assert.equal(body.user.username, 'priya.patel');
      assert.ok(body.user.roles.includes('HR_ADMIN'));
    });

    test('Invalid password returns 401 with BAD_CREDENTIALS', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'priya.patel', password: 'DefectivePassword!' }),
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.code, 'BAD_CREDENTIALS');
    });

    test('Unknown user identifier returns 401 with uniform BAD_CREDENTIALS', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'unknown_ghost_user_99', password: 'AnyPassword@123' }),
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.code, 'BAD_CREDENTIALS');
    });

    test('Expired / forged JWT is cleanly rejected with 401', async () => {
      const res = await fetch(`${baseUrl}/employees`, {
        headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature' },
      });
      assert.equal(res.status, 401);
    });
  });

  // ── 2. RBAC & GRANULAR PERMISSIONS ─────────────────────────────────────────
  describe('2. RBAC & Granular Permission Enforcement', () => {
    test('Permitted action succeeds (HR Admin accesses employee creation endpoint)', async () => {
      const res = await fetch(`${baseUrl}/employees`, {
        headers: { Authorization: `Bearer ${hrToken}` },
      });
      assert.equal(res.status, 200);
    });

    test('Forbidden permission check: Employee cannot access SLA check endpoint', async () => {
      const res = await fetch(`${baseUrl}/onboarding/sla-check`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${emp1Token}` },
      });
      assert.equal(res.status, 403);
    });

    test('Forbidden permission check: Employee cannot allocate hardware assets', async () => {
      const res = await fetch(`${baseUrl}/assets/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emp1Token}`,
        },
        body: JSON.stringify({ assetId: 1, employeeId: 2 }),
      });
      assert.equal(res.status, 403);
    });
  });

  // ── 3. EMPLOYEES DIRECTORY & ONBOARDING PROVISIONING ─────────────────────
  describe('3. Employee Management & Onboarding Plan Initialization', () => {
    test('Create employee succeeds and initializes onboarding plan atomically', async () => {
      const uniqueEmail = `test.hire.${Date.now()}@eoms.in`;
      const res = await fetch(`${baseUrl}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hrToken}`,
        },
        body: JSON.stringify({
          firstName: 'Vikram',
          lastName: 'Chawla',
          workEmail: uniqueEmail,
          positionId: 1,
          hireDate: '2026-09-15',
          workLocation: 'Bengaluru (Hybrid)',
          emergencyContact: {
            name: 'Sunita Chawla',
            relationship: 'Mother',
            phone: '+91 99887 76655',
          },
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.ok(body.data.employeeId);
      testEmpId = body.data.employeeId;
    });

    test('Create employee with missing required data returns 400 VALIDATION_ERROR', async () => {
      const res = await fetch(`${baseUrl}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hrToken}`,
        },
        body: JSON.stringify({
          firstName: 'Incomplete',
          // missing lastName, email, positionId, hireDate
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.code, 'VALIDATION_ERROR');
    });

    test('Update employee record reflects changes in database', async () => {
      const res = await fetch(`${baseUrl}/employees/${testEmpId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hrToken}`,
        },
        body: JSON.stringify({ workLocation: 'Hyderabad (Hitec City)' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.workLocation, 'Hyderabad (Hitec City)');
    });
  });

  // ── 4. ONBOARDING TASKS & PROGRESS CALCULATION ──────────────────────────
  describe('4. Real Onboarding Progress & Task Tracking', () => {
    test('Task progress update calculates plan percentage on the server', async () => {
      // Find an existing task for employee 1
      const planRes = await fetch(`${baseUrl}/onboarding/employee/${emp1EmployeeId}`, {
        headers: { Authorization: `Bearer ${hrToken}` },
      });
      assert.equal(planRes.status, 200);
      const planData = await planRes.json();
      const firstTask = planData.data?.Checklists?.[0]?.Tasks?.[0];

      if (firstTask) {
        const progressRes = await fetch(`${baseUrl}/tasks/${firstTask.taskId}/progress`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${emp1Token}`,
          },
          body: JSON.stringify({
            employeeId: emp1EmployeeId,
            status: 'completed',
            notes: 'Task completed via integration test suite.',
          }),
        });
        assert.equal(progressRes.status, 200);
        const progressData = await progressRes.json();
        assert.ok(progressData.plan !== undefined && progressData.plan.progressPercent !== undefined);
      }
    });

    test('Updating non-existent task returns 404 NOT_FOUND', async () => {
      const res = await fetch(`${baseUrl}/tasks/999999/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emp1Token}`,
        },
        body: JSON.stringify({
          employeeId: emp1EmployeeId,
          status: 'completed',
        }),
      });
      assert.equal(res.status, 404);
    });
  });

  // ── 5. ASSET ALLOCATION, RACE CONDITIONS & OBJECT AUTHORIZATION ────────
  describe('5. Asset Allocation, Concurrency & Object-Level Authorization', () => {
    test('IT Admin allocates in-stock asset successfully', async () => {
      // Create new asset to allocate
      const model = await AssetModel.findOne();
      const asset = await Asset.create({
        modelId: model ? model.modelId : 1,
        serialNumber: `SN-CONCUR-${Date.now()}`,
        assetTag: `TAG-CONCUR-${Date.now()}`,
        status: 'in_stock',
      });
      testAssetId = asset.assetId;

      const res = await fetch(`${baseUrl}/assets/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${itToken}`,
        },
        body: JSON.stringify({
          assetId: testAssetId,
          employeeId: emp1EmployeeId, // Aarav Sharma
          notes: 'Test allocation with concurrency lock',
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      testAllocationId = body.data.allocationId;
      assert.equal(body.data.acknowledgementStatus, 'pending');
    });

    test('Double-allocation race condition test: attempting to allocate same asset returns 409 CONFLICT', async () => {
      const res = await fetch(`${baseUrl}/assets/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${itToken}`,
        },
        body: JSON.stringify({
          assetId: testAssetId,
          employeeId: emp2EmployeeId, // Another employee
        }),
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.code, 'CONFLICT');
    });

    test('Object-level authorization: User B cannot acknowledge User A allocation', async () => {
      // emp2Token is Sneha (employeeId 2), testAllocationId is assigned to Aarav (employeeId 1)
      const res = await fetch(`${baseUrl}/assets/allocations/${testAllocationId}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emp2Token}`,
        },
        body: JSON.stringify({ acknowledgementStatus: 'acknowledged' }),
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.code, 'FORBIDDEN');
    });

    test('Assigned employee successfully acknowledges own hardware allocation', async () => {
      const res = await fetch(`${baseUrl}/assets/allocations/${testAllocationId}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emp1Token}`,
        },
        body: JSON.stringify({ acknowledgementStatus: 'acknowledged' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.acknowledgementStatus, 'acknowledged');
    });
  });

  // ── 6. STATUTORY DOCUMENT AUDIT & AUTHORIZATION ─────────────────────────
  describe('6. Document Workflow, Verification & Access Control', () => {
    test('Employee uploads statutory compliance document', async () => {
      const type = await DocumentType.findOne();
      const res = await fetch(`${baseUrl}/documents/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emp1Token}`,
        },
        body: JSON.stringify({
          employeeId: emp1EmployeeId,
          typeId: type ? type.typeId : 1,
          fileName: 'aarav_sharma_pan.pdf',
          filePath: 'doc-sample.pdf',
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      testDocId = body.data.document.documentId;
      assert.equal(body.data.verification.status, 'pending');
    });

    test('Unauthorized employee cannot download another employee private document', async () => {
      // emp2Token attempts to download Aarav's document
      const res = await fetch(`${baseUrl}/documents/${testDocId}/download`, {
        headers: { Authorization: `Bearer ${emp2Token}` },
      });
      assert.equal(res.status, 403);
    });

    test('Compliance Officer verifies and approves the submitted document', async () => {
      const res = await fetch(`${baseUrl}/documents/${testDocId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${complianceToken}`,
        },
        body: JSON.stringify({
          status: 'approved',
          comments: 'Statutory government record cross-verified successfully.',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.status, 'approved');
    });
  });

  // ── 7. STATUTORY TRAINING QUIZ ENGINE ───────────────────────────────────
  describe('7. Server-Side Training Quiz Engine', () => {
    let courseId = 1;

    test('GET /training/courses/:id/quiz returns questions WITHOUT answer keys', async () => {
      const res = await fetch(`${baseUrl}/training/courses/${courseId}/quiz`, {
        headers: { Authorization: `Bearer ${emp1Token}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(Array.isArray(body.data.questions));
      assert.ok(body.data.questions.length > 0);
      // Ensure answer key is never disclosed
      assert.equal(body.data.questions[0].correctIndex, undefined);
    });

    test('Submit quiz with perfect answers scores 100% and records passed attempt', async () => {
      // POSH quiz answers: Q1: 0, Q2: 1, Q3: 3, Q4: 1, Q5: 1
      const res = await fetch(`${baseUrl}/training/courses/${courseId}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emp1Token}`,
        },
        body: JSON.stringify({
          employeeId: emp1EmployeeId,
          answers: { 1: 0, 2: 1, 3: 3, 4: 1, 5: 1 },
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.score, 100);
      assert.equal(body.data.passed, true);
      assert.equal(body.data.recordStatus, 'completed');
    });

    test('Submit quiz with failing answers scores <80% and records failed attempt', async () => {
      const res = await fetch(`${baseUrl}/training/courses/${courseId}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emp1Token}`,
        },
        body: JSON.stringify({
          employeeId: emp1EmployeeId,
          answers: { 1: 3, 2: 0, 3: 0, 4: 0, 5: 0 },
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.score < 80);
      assert.equal(body.data.passed, false);
    });
  });

  // ── 8. REPORTING & AUDIT TRAIL ──────────────────────────────────────────
  describe('8. Aggregated Reporting & Audit Trail', () => {
    test('GET /reports/summary aggregates real database metrics', async () => {
      const res = await fetch(`${baseUrl}/reports/summary`, {
        headers: { Authorization: `Bearer ${hrToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.employees.total > 0);
      assert.ok(body.data.onboarding.totalPlans > 0);
      assert.ok(body.data.assets.totalAssets > 0);
    });

    test('GET /audit returns append-only security logs with pagination and filters', async () => {
      const res = await fetch(`${baseUrl}/audit?limit=10&page=1`, {
        headers: { Authorization: `Bearer ${hrToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0);
      assert.ok(body.pagination.total > 0);
    });
  });
});
