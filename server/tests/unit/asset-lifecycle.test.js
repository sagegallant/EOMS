import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { listAssetModels, deleteAsset } from '../../src/controllers/asset.controller.js';
import { Asset, AssetAllocation, sequelize } from '../../src/models/index.js';

describe('Unit Tests: IT Asset Lifecycle (Catalog Models & Safe Asset Deletion)', () => {
  test('asset router registers GET /models and DELETE /:id with proper authorization', async () => {
    const { default: assetRouter } = await import('../../src/routes/asset.routes.js');

    const modelsRoute = assetRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/models' && layer.route.methods.get
    );
    const deleteRoute = assetRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/:id' && layer.route.methods.delete
    );

    assert.ok(modelsRoute, 'GET /models route must be registered');
    assert.ok(deleteRoute, 'DELETE /:id route must be registered');

    // Ensure GET /models is registered BEFORE GET /:id so Express does not capture 'models' as ':id'
    const modelsIndex = assetRouter.stack.findIndex(
      (layer) => layer.route && layer.route.path === '/models' && layer.route.methods.get
    );
    const getByIdIndex = assetRouter.stack.findIndex(
      (layer) => layer.route && layer.route.path === '/:id' && layer.route.methods.get
    );
    assert.ok(modelsIndex < getByIdIndex, 'GET /models must be registered before GET /:id');
  });

  test('deleteAsset returns 404 NOT_FOUND when asset does not exist', async () => {
    let statusCode = null;
    let jsonResponse = null;

    // Mock transaction
    const originalTransaction = sequelize.transaction;
    let rolledBack = false;
    sequelize.transaction = async () => ({
      rollback: async () => { rolledBack = true; },
      commit: async () => {},
    });

    // Mock Asset.findByPk to return null
    const originalFindByPk = Asset.findByPk;
    Asset.findByPk = async () => null;

    try {
      const req = {
        params: { id: '9999' },
        user: { userId: 1, roles: ['IT_ADMIN'] },
        ip: '127.0.0.1',
        headers: {},
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

      await deleteAsset(req, res, () => {});

      assert.equal(statusCode, 404, 'Should return HTTP 404');
      assert.equal(jsonResponse?.code, 'NOT_FOUND');
      assert.ok(rolledBack, 'Transaction must be rolled back');
    } finally {
      sequelize.transaction = originalTransaction;
      Asset.findByPk = originalFindByPk;
    }
  });

  test('deleteAsset rejects deletion of actively allocated asset with 409 CONFLICT', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const originalTransaction = sequelize.transaction;
    let rolledBack = false;
    sequelize.transaction = async () => ({
      rollback: async () => { rolledBack = true; },
      commit: async () => {},
    });

    const originalFindByPk = Asset.findByPk;
    const originalFindOne = AssetAllocation.findOne;

    Asset.findByPk = async () => ({
      assetId: 50,
      assetTag: 'AST-TEST-001',
      serialNumber: 'SN-TEST-001',
      status: 'allocated',
    });

    // Active allocation exists
    AssetAllocation.findOne = async () => ({
      allocationId: 101,
      assetId: 50,
      returnedAt: null,
    });

    try {
      const req = {
        params: { id: '50' },
        user: { userId: 1, roles: ['IT_ADMIN'] },
        ip: '127.0.0.1',
        headers: {},
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

      await deleteAsset(req, res, () => {});

      assert.equal(statusCode, 409, 'Should reject deletion with HTTP 409');
      assert.equal(jsonResponse?.code, 'CONFLICT');
      assert.match(jsonResponse?.message, /cannot delete an asset that is currently allocated/i);
      assert.ok(rolledBack, 'Transaction must be rolled back on conflict');
    } finally {
      sequelize.transaction = originalTransaction;
      Asset.findByPk = originalFindByPk;
      AssetAllocation.findOne = originalFindOne;
    }
  });

  test('deleteAsset successfully cleans historical records, deletes in-stock asset, and commits', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const originalTransaction = sequelize.transaction;
    let committed = false;
    sequelize.transaction = async () => ({
      rollback: async () => {},
      commit: async () => { committed = true; },
    });

    const originalFindByPk = Asset.findByPk;
    const originalFindOne = AssetAllocation.findOne;
    const originalDestroyAllocations = AssetAllocation.destroy;

    let assetDestroyed = false;
    let historicalDestroyed = false;

    Asset.findByPk = async () => ({
      assetId: 51,
      assetTag: 'AST-STOCK-001',
      serialNumber: 'SN-STOCK-001',
      status: 'in_stock',
      destroy: async () => { assetDestroyed = true; },
    });

    // No active allocation
    AssetAllocation.findOne = async () => null;

    AssetAllocation.destroy = async () => {
      historicalDestroyed = true;
      return 1;
    };

    try {
      const req = {
        params: { id: '51' },
        user: { userId: 1, roles: ['IT_ADMIN'] },
        ip: '127.0.0.1',
        headers: {},
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

      await deleteAsset(req, res, () => {});

      assert.ok(historicalDestroyed, 'Historical returned allocations must be cleaned');
      assert.ok(assetDestroyed, 'Asset record must be destroyed');
      assert.ok(committed, 'Transaction must be committed');
      assert.match(jsonResponse?.message, /deleted successfully/i);
    } finally {
      sequelize.transaction = originalTransaction;
      Asset.findByPk = originalFindByPk;
      AssetAllocation.findOne = originalFindOne;
      AssetAllocation.destroy = originalDestroyAllocations;
    }
  });
});
