import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { handleStaticRequest } from '../../../client/src/api/staticAdapter.js';

describe('Unit Tests: Static Demo Adapter Employee Lifecycle & is_active Consistency', () => {
  test('POST /employees creates employee with is_active = 1 and full SystemUser record', () => {
    const createReq = {
      url: '/employees',
      method: 'post',
      data: JSON.stringify({
        firstName: 'Divya',
        lastName: 'Sharma',
        workEmail: 'divya.sharma@eoms.in',
        positionId: 1,
        hireDate: '2026-11-16',
        workLocation: 'Bengaluru (Hybrid)',
      }),
    };

    const res = handleStaticRequest(createReq);
    assert.equal(res.status, 201, 'Should respond with 201 Created');
    assert.ok(res.data.data.employeeId, 'Should assign a valid employeeId');
    assert.equal(res.data.data.firstName, 'Divya');
    assert.equal(res.data.data.is_active, 1, 'New employee must have binary is_active = 1');
    assert.equal(res.data.data.SystemUser?.isActive, true, 'SystemUser.isActive must be true');
    assert.equal(res.data.data.SystemUser?.is_active, 1, 'SystemUser.is_active must be 1');

    const createdId = res.data.data.employeeId;

    // Verify it is listed under status=active
    const listActiveRes = handleStaticRequest({
      url: '/employees?status=active',
      method: 'get',
    });
    assert.equal(listActiveRes.status, 200);
    const foundActive = listActiveRes.data.data.find(e => e.employeeId === createdId);
    assert.ok(foundActive, 'Newly created employee must appear in active employee directory');

    // Deactivate the employee
    const deactivateRes = handleStaticRequest({
      url: `/employees/${createdId}/deactivate`,
      method: 'patch',
    });
    assert.equal(deactivateRes.status, 200, 'Deactivation should return 200 OK');
    assert.equal(deactivateRes.data.data.isActive, false);
    assert.equal(deactivateRes.data.data.is_active, 0, 'Binary is_active must be set to 0');
    assert.equal(deactivateRes.data.data.status, 'terminated');

    // Verify it is NOT listed under status=active
    const listActiveAfter = handleStaticRequest({
      url: '/employees?status=active',
      method: 'get',
    });
    assert.ok(!listActiveAfter.data.data.some(e => e.employeeId === createdId), 'Deactivated employee must not appear in active list');

    // Verify it IS listed under status=inactive
    const listInactive = handleStaticRequest({
      url: '/employees?status=inactive',
      method: 'get',
    });
    assert.ok(listInactive.data.data.some(e => e.employeeId === createdId), 'Deactivated employee must appear in inactive list');

    // Reactivate the employee
    const reactivateRes = handleStaticRequest({
      url: `/employees/${createdId}/reactivate`,
      method: 'patch',
    });
    assert.equal(reactivateRes.status, 200, 'Reactivation should return 200 OK');
    assert.equal(reactivateRes.data.data.isActive, true);
    assert.equal(reactivateRes.data.data.is_active, 1, 'Binary is_active must be restored to 1');

    // Delete the employee
    const deleteRes = handleStaticRequest({
      url: `/employees/${createdId}`,
      method: 'delete',
    });
    assert.equal(deleteRes.status, 200, 'Delete should return 200 OK');

    const listAll = handleStaticRequest({
      url: '/employees?status=all',
      method: 'get',
    });
    assert.ok(!listAll.data.data.some(e => e.employeeId === createdId), 'Deleted employee must be expunged');
  });
});
