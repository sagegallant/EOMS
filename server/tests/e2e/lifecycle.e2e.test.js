import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Op } from 'sequelize';
import app from '../../src/app.js';
import {
  Employee,
  OnboardingPlan,
  Checklist,
  Task,
  TaskProgress,
  Document,
  DocumentType,
  DocumentVerification,
  Asset,
  AssetModel,
  AssetAllocation,
  TrainingCourse,
  TrainingRecord,
  Position,
} from '../../src/models/index.js';

describe('E2E Lifecycle Test: 4-Persona Corporate Onboarding & Statutory Compliance Simulation', () => {
  let server;
  let baseUrl;

  let hrToken;
  let itToken;
  let employeeToken;
  let complianceToken;

  let createdEmployeeId;
  let allocatedAssetId;
  let submittedDocId;

  before(async () => {
    await new Promise(resolve => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/v1`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  async function loginAs(identifier, password = 'Password@123') {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    assert.equal(res.status, 200, `Login should succeed for ${identifier}`);
    const body = await res.json();
    return body.token;
  }

  test('Phase 1: Multi-Persona Authentication Gateways', async () => {
    hrToken = await loginAs('priya.patel');
    itToken = await loginAs('rohan.verma');
    employeeToken = await loginAs('aarav.sharma');
    complianceToken = await loginAs('neha.nair');

    assert.ok(hrToken, 'HR Admin token issued');
    assert.ok(itToken, 'IT Admin token issued');
    assert.ok(employeeToken, 'New Hire token issued');
    assert.ok(complianceToken, 'Compliance Officer token issued');
  });

  test('Phase 2: HR Admin provisions new employee & initializes onboarding plan', async () => {
    // Get position ID for SDE-II
    const pos = await Position.findOne({ where: { jobTitle: 'Senior Software Engineer (SDE-II)' } });
    const positionId = pos ? pos.positionId : 1;

    const testEmail = `ananya.verma.${Date.now()}@eoms.in`;
    const res = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        firstName: 'Ananya',
        lastName: 'Verma',
        workEmail: testEmail,
        positionId,
        hireDate: '2026-09-01',
        workLocation: 'Bengaluru (Hybrid)',
        emergencyContact: {
          name: 'Sunil Verma',
          relationship: 'Father',
          phone: '+91 98765 43210',
          email: 'sunil.verma@gmail.com',
        },
      }),
    });

    assert.equal(res.status, 201, 'HR Admin should successfully create employee');
    const body = await res.json();
    assert.equal(body.data.firstName, 'Ananya');
    assert.equal(body.data.lastName, 'Verma');
    assert.equal(body.data.workEmail, testEmail);

    createdEmployeeId = body.data.employeeId;

    // Verify Onboarding plan was automatically created
    const plan = await OnboardingPlan.findOne({ where: { employeeId: createdEmployeeId } });
    assert.ok(plan, 'Onboarding plan must be initialized for newly registered employee');
  });

  test('Phase 3: IT Admin allocates workstation hardware to the new employee', async () => {
    // Locate or create an in-stock asset
    let asset = await Asset.findOne({ where: { status: 'in_stock' } });
    if (!asset) {
      const model = await AssetModel.findOne();
      asset = await Asset.create({
        modelId: model ? model.modelId : 1,
        serialNumber: `SN-TEST-${Date.now()}`,
        assetTag: `TAG-TEST-${Date.now()}`,
        status: 'in_stock',
        purchasedAt: '2026-08-15',
      });
    }

    allocatedAssetId = asset.assetId;

    const res = await fetch(`${baseUrl}/assets/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${itToken}`,
      },
      body: JSON.stringify({
        assetId: allocatedAssetId,
        employeeId: createdEmployeeId,
        notes: 'Pre-configured MacBook Pro M3 Max with BitLocker & Okta Verify.',
      }),
    });

    assert.equal(res.status, 201, 'IT Admin should successfully allocate hardware');
    const body = await res.json();
    assert.equal(body.data.acknowledgementStatus, 'pending');

    // Verify asset status updated to allocated
    const updatedAsset = await Asset.findByPk(allocatedAssetId);
    assert.equal(updatedAsset.status, 'allocated');
  });

  test('Phase 4: Employee completes task progress, statutory training, and uploads PAN card', async () => {
    // 1. Get an existing Aarav Sharma employee record
    const aarav = await Employee.findOne({ where: { workEmail: 'aarav.sharma@eoms.in' } });
    assert.ok(aarav, 'Aarav Sharma employee record exists');

    // 2. Fetch a task to mark completed
    const task = await Task.findOne();
    assert.ok(task, 'Task exists');

    const progressRes = await fetch(`${baseUrl}/tasks/${task.taskId}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        employeeId: aarav.employeeId,
        status: 'completed',
        notes: 'Aadhaar e-KYC and digital signature verification finalized.',
      }),
    });

    assert.equal(progressRes.status, 200);

    // 3. Complete POSH Act 2013 mandatory training
    const poshCourse = await TrainingCourse.findOne({
      where: { title: 'Prevention of Sexual Harassment (POSH) Act 2013' },
    });
    const courseId = poshCourse ? poshCourse.courseId : 1;

    const trainingRes = await fetch(`${baseUrl}/training/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        employeeId: aarav.employeeId,
        courseId,
        score: 96,
        progressPercent: 100,
        status: 'completed',
      }),
    });

    assert.equal(trainingRes.status, 200);
    const trainingBody = await trainingRes.json();
    assert.equal(trainingBody.data.status, 'completed');
    assert.equal(trainingBody.data.score, 96);

    // 4. Upload PAN Card statutory document
    const panDocType = await DocumentType.findOne({ where: { typeName: { [Op.like]: '%PAN%' } } });
    const typeId = panDocType ? panDocType.typeId : 1;

    const uploadRes = await fetch(`${baseUrl}/documents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        employeeId: aarav.employeeId,
        typeId,
        fileName: 'Aarav_Sharma_PAN_Card.pdf',
        filePath: '/uploads/documents/pan_aarav_sharma.pdf',
        fileSizeBytes: 245760,
        mimeType: 'application/pdf',
      }),
    });

    assert.equal(uploadRes.status, 201);
    const uploadBody = await uploadRes.json();
    submittedDocId = uploadBody.data.document.documentId;
    assert.ok(submittedDocId, 'Document ID must be returned');
    assert.equal(uploadBody.data.verification.status, 'pending');
  });

  test('Phase 5: Compliance Officer audits and approves the statutory document with audit trail', async () => {
    const verifyRes = await fetch(`${baseUrl}/documents/${submittedDocId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${complianceToken}`,
      },
      body: JSON.stringify({
        status: 'approved',
        comments: 'PAN Card format matches Income Tax Dept standard (ABCDE1234F). Verified by Compliance.',
      }),
    });

    assert.equal(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.data.status, 'approved');
    assert.match(verifyBody.data.comments, /Income Tax Dept/);

    // Verify document verification in DB
    const verification = await DocumentVerification.findOne({
      where: { documentId: submittedDocId },
    });
    assert.equal(verification.status, 'approved');
  });
});
