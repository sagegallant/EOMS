import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { handleStaticRequest } from '../../../client/src/api/staticAdapter.js';

describe('Unit Tests: Static Demo Adapter Asset Lifecycle', () => {
  test('GET /assets/models returns registered catalog models', async () => {
    const res = await handleStaticRequest({
      url: '/assets/models',
      method: 'get',
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.data), 'data must be an array of models');
    assert.ok(res.data.data.length > 0, 'models list should not be empty');
    assert.ok(res.data.data[0].modelName, 'model must have modelName');
  });

  test('POST /assets creates a new in-stock hardware asset', async () => {
    const res = await handleStaticRequest({
      url: '/assets',
      method: 'post',
      data: JSON.stringify({
        modelId: 1,
        serialNumber: 'SN-DYN-001',
        assetTag: 'AST-DYN-001',
        purchasedAt: '2026-11-01',
        warrantyExpiry: '2029-11-01',
      }),
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.data.assetTag, 'AST-DYN-001');
    assert.equal(res.data.data.status, 'in_stock');
  });

  test('DELETE /assets/:id blocks deletion of actively allocated asset with 409 CONFLICT', async () => {
    // In staticData, assetId 1 (MacBook Pro 16" - AST-2024-001) is allocated to Priya Sharma
    const res = await handleStaticRequest({
      url: '/assets/1',
      method: 'delete',
    });

    assert.equal(res.status, 409);
    assert.match(res.data.message, /cannot delete an asset that is currently allocated/i);
  });

  test('DELETE /assets/:id deletes unallocated asset with 200 OK', async () => {
    // First create an unallocated asset
    const created = await handleStaticRequest({
      url: '/assets',
      method: 'post',
      data: JSON.stringify({
        modelId: 3,
        serialNumber: 'SN-DEL-999',
        assetTag: 'AST-DEL-999',
      }),
    });
    const newId = created.data.data.assetId;

    const deleteRes = await handleStaticRequest({
      url: `/assets/${newId}`,
      method: 'delete',
    });

    assert.equal(deleteRes.status, 200);
    assert.match(deleteRes.data.message, /deleted/i);
  });
});
