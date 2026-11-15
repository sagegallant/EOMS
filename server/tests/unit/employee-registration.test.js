import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { createEmployee } from '../../src/controllers/employee.controller.js';

describe('Unit Tests: Employee Registration & Credential Validation', () => {
  test('createEmployee rejects requests missing password with 400 VALIDATION_ERROR', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      body: {
        firstName: 'Ananya',
        lastName: 'Verma',
        workEmail: 'ananya.verma@eoms.in',
        positionId: 1,
        hireDate: '2026-11-15',
        // password intentionally omitted
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

    const next = (err) => {
      throw err;
    };

    await createEmployee(req, res, next);

    assert.equal(statusCode, 400, 'Should return HTTP 400');
    assert.equal(jsonResponse?.code, 'VALIDATION_ERROR', 'Should return VALIDATION_ERROR code');
    assert.match(jsonResponse?.message, /password/i, 'Message should mention password requirement');
  });

  test('createEmployee rejects password shorter than 8 characters', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      body: {
        firstName: 'Ananya',
        lastName: 'Verma',
        workEmail: 'ananya.verma@eoms.in',
        positionId: 1,
        hireDate: '2026-11-15',
        password: 'short', // < 8 characters
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

    const next = (err) => {
      throw err;
    };

    await createEmployee(req, res, next);

    assert.equal(statusCode, 400, 'Should return HTTP 400 for short password');
    assert.equal(jsonResponse?.code, 'VALIDATION_ERROR');
    assert.match(jsonResponse?.message, /8 characters/i, 'Message should specify minimum 8 characters');
  });
});
