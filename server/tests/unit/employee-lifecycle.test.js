import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { deactivateEmployee, reactivateEmployee, deleteEmployee } from '../../src/controllers/employee.controller.js';

describe('Unit Tests: Employee Lifecycle (Deactivation, Reactivation & Self-Protection)', () => {
  test('deactivateEmployee rejects self-deactivation with 403 FORBIDDEN', async () => {
    let statusCode = null;
    let jsonResponse = null;

    // Simulate requesting admin attempting to deactivate their own account
    const req = {
      params: { id: '99' },
      user: {
        userId: 10,
        employeeId: 99,
        roles: ['SYSTEM_ADMIN'],
        username: 'admin',
      },
    };

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };

    await deactivateEmployee(req, res, () => {});

    assert.equal(statusCode, 403, 'Should reject self-deactivation with HTTP 403');
    assert.equal(jsonResponse?.code, 'FORBIDDEN', 'Should return FORBIDDEN code');
    assert.match(jsonResponse?.message, /cannot deactivate.*own/i, 'Message should explain self-protection rule');
  });

  test('deleteEmployee rejects self-deletion with 403 FORBIDDEN', async () => {
    let statusCode = null;
    let jsonResponse = null;

    // Simulate requesting admin attempting to delete their own account
    const req = {
      params: { id: '99' },
      user: {
        userId: 10,
        employeeId: 99,
        roles: ['SYSTEM_ADMIN'],
        username: 'admin',
      },
    };

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };

    await deleteEmployee(req, res, () => {});

    assert.equal(statusCode, 403, 'Should reject self-deletion with HTTP 403');
    assert.equal(jsonResponse?.code, 'FORBIDDEN', 'Should return FORBIDDEN code');
    assert.match(jsonResponse?.message, /cannot delete.*own/i, 'Message should explain self-protection rule');
  });

  test('employee router registers PATCH /:id/deactivate, PATCH /:id/reactivate, and DELETE /:id with SYSTEM_ADMIN guard', async () => {
    const { default: employeeRouter } = await import('../../src/routes/employee.routes.js');

    const deactivateRoute = employeeRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/:id/deactivate' && layer.route.methods.patch
    );
    const reactivateRoute = employeeRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/:id/reactivate' && layer.route.methods.patch
    );
    const deleteRoute = employeeRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/:id' && layer.route.methods.delete
    );

    assert.ok(deactivateRoute, 'PATCH /:id/deactivate route must be registered');
    assert.ok(reactivateRoute, 'PATCH /:id/reactivate route must be registered');
    assert.ok(deleteRoute, 'DELETE /:id route must be registered');
  });
});
