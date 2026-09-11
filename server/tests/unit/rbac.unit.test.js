import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { requireRole } from '../../src/middleware/rbac.js';

describe('Unit Tests: Role-Based Access Control (RBAC) Guards', () => {
  function createMockContext({ user = null } = {}) {
    let statusCode = null;
    let jsonBody = null;
    let nextCalled = false;

    const req = { user, ip: '127.0.0.1', headers: {} };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(body) {
        jsonBody = body;
        return this;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    return { req, res, next, getStatus: () => statusCode, getJson: () => jsonBody, isNextCalled: () => nextCalled };
  }

  test('requireRole blocks unauthenticated requests with 401', () => {
    const middleware = requireRole('HR_ADMIN');
    const ctx = createMockContext({ user: null });

    middleware(ctx.req, ctx.res, ctx.next);

    assert.equal(ctx.getStatus(), 401);
    assert.equal(ctx.getJson()?.code, 'UNAUTHORIZED');
    assert.equal(ctx.isNextCalled(), false);
  });

  test('requireRole grants immediate bypass to SYSTEM_ADMIN superuser', () => {
    const middleware = requireRole('COMPLIANCE_OFFICER');
    const ctx = createMockContext({
      user: { userId: 1, roles: ['SYSTEM_ADMIN'] },
    });

    middleware(ctx.req, ctx.res, ctx.next);

    assert.equal(ctx.isNextCalled(), true);
    assert.equal(ctx.getStatus(), null);
  });

  test('requireRole allows user with matching role', () => {
    const middleware = requireRole('HR_ADMIN', 'HR_SPECIALIST');
    const ctx = createMockContext({
      user: { userId: 2, roles: ['HR_ADMIN'] },
    });

    middleware(ctx.req, ctx.res, ctx.next);

    assert.equal(ctx.isNextCalled(), true);
    assert.equal(ctx.getStatus(), null);
  });

  test('requireRole forbids user without matching role with 403', () => {
    const middleware = requireRole('IT_ADMIN');
    const ctx = createMockContext({
      user: { userId: 3, roles: ['EMPLOYEE'] },
    });

    middleware(ctx.req, ctx.res, ctx.next);

    assert.equal(ctx.getStatus(), 403);
    assert.equal(ctx.getJson()?.code, 'FORBIDDEN');
    assert.equal(ctx.isNextCalled(), false);
  });
});
