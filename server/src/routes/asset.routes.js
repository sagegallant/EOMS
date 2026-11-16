import { Router } from 'express';
import {
  listAssets,
  listAssetModels,
  getAssetById,
  createAsset,
  deleteAsset,
  listAllocations,
  allocateAsset,
  acknowledgeAllocation,
  returnAsset,
} from '../controllers/asset.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, listAssets);
router.get('/models', requireAuth, listAssetModels);
router.get('/allocations', requireAuth, listAllocations);
router.get('/:id', requireAuth, getAssetById);
router.post('/', requireAuth, requirePermission('asset:allocate'), createAsset);
router.delete('/:id', requireAuth, requirePermission('asset:allocate'), deleteAsset);
router.post('/allocate', requireAuth, requirePermission('asset:allocate'), allocateAsset);
router.patch('/allocations/:id/acknowledge', requireAuth, acknowledgeAllocation);
router.patch('/allocations/:id/return', requireAuth, requirePermission('asset:allocate'), returnAsset);

export default router;


