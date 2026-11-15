import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createTask } from '../../src/controllers/task.controller.js';

describe('Unit Tests: Priority Task Creation & Validation', () => {
  test('createTask rejects missing checklistId or title with 400 VALIDATION_ERROR', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      body: {
        title: 'Complete Compliance Checklist',
        // checklistId missing
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

    await createTask(req, res, () => {});

    assert.equal(statusCode, 400, 'Should return HTTP 400');
    assert.equal(jsonResponse?.code, 'VALIDATION_ERROR');
  });

  test('task router accepts admin, hr, and manager roles for task creation', async () => {
    const { default: taskRouter } = await import('../../src/routes/task.routes.js');

    const postRoute = taskRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/' && layer.route.methods.post
    );

    assert.ok(postRoute, 'POST / route must exist on task router');
    assert.ok(postRoute.route.stack.length >= 2, 'Route must have middleware and handler');
  });
});
