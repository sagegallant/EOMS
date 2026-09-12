import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../../src/app.js';

describe('Integration Tests: EOMS REST API Endpoints', () => {
  let server;
  let baseUrl;
  let authToken;

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

  test('GET /health returns 200 with system metadata', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.version, '1.0.0');
  });

  test('POST /auth/login fails on invalid credentials with 401', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'nonexistent.user', password: 'WrongPassword999' }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'BAD_CREDENTIALS');
  });

  test('POST /auth/login succeeds for Indian HR Admin persona (Priya Patel)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'priya.patel', password: 'Password@123' }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.token, 'Response must contain a valid JWT session token');
    assert.equal(body.user.username, 'priya.patel');
    assert.ok(body.user.roles.includes('HR_ADMIN'));

    authToken = body.token;
  });

  test('GET /employees requires authentication and returns data for authenticated admin', async () => {
    // Unauthenticated attempt
    const unauthRes = await fetch(`${baseUrl}/employees`);
    assert.equal(unauthRes.status, 401);

    // Authenticated attempt
    const authRes = await fetch(`${baseUrl}/employees`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(authRes.status, 200);
    const body = await authRes.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);

    const hasAarav = body.data.some(e => e.firstName === 'Aarav' && e.lastName === 'Sharma');
    assert.ok(hasAarav, 'Seeded employee Aarav Sharma must be present in directory');
  });

  test('GET /onboarding/templates returns active enterprise onboarding cohorts', async () => {
    const res = await fetch(`${baseUrl}/onboarding/templates`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });

  test('GET /reports/summary aggregates cross-functional organization metrics', async () => {
    const res = await fetch(`${baseUrl}/reports/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.employees);
    assert.ok(body.data.onboarding);
    assert.ok(body.data.compliance);
    assert.ok(body.data.assets);
    assert.ok(body.data.training);
  });

  test('GET /tasks returns phased onboarding checklist tasks', async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });
});
