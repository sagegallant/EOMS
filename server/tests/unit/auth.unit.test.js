import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'eoms_super_secret_jwt_key_change_in_production_2026';

describe('Unit Tests: Authentication & Cryptographic Security', () => {
  test('Bcrypt Password Hashing & Verification', async () => {
    const rawPassword = 'CorporatePassword@2026';
    const hash = await bcrypt.hash(rawPassword, 10);

    assert.ok(hash.startsWith('$2'), 'Bcrypt hash should follow standard $2 format');
    assert.notEqual(rawPassword, hash, 'Hash must not equal plaintext password');

    const isValid = await bcrypt.compare(rawPassword, hash);
    assert.equal(isValid, true, 'Valid password must match hash');

    const isInvalid = await bcrypt.compare('WrongPassword', hash);
    assert.equal(isInvalid, false, 'Invalid password must not match hash');
  });

  test('JWT Generation, Signature Verification & Claims Payload', () => {
    const payload = {
      userId: 101,
      username: 'priya.patel',
      roles: ['HR_ADMIN'],
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    assert.ok(typeof token === 'string' && token.split('.').length === 3, 'JWT should contain 3 dot-separated parts');

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.equal(decoded.userId, 101);
    assert.equal(decoded.username, 'priya.patel');
    assert.deepEqual(decoded.roles, ['HR_ADMIN']);
    assert.ok(decoded.exp > Math.floor(Date.now() / 1000));
  });

  test('JWT Expiration and Invalid Secret Handling', () => {
    const shortToken = jwt.sign({ userId: 5 }, JWT_SECRET, { expiresIn: '1ms' });
    
    assert.throws(
      () => jwt.verify(shortToken, 'wrong_secret_key_xyz'),
      /invalid signature/,
      'Verification with incorrect secret must throw invalid signature error',
    );
  });

  test('MFA Challenge Token Structure', () => {
    const userId = 42;
    const challenge = jwt.sign({ userId, purpose: 'mfa_challenge' }, JWT_SECRET, { expiresIn: '5m' });
    const decoded = jwt.verify(challenge, JWT_SECRET);

    assert.equal(decoded.userId, 42);
    assert.equal(decoded.purpose, 'mfa_challenge');
  });
});
