import { Router } from 'express';
import {
  listAssets,
  getAssetById,
  createAsset,
  listAllocations,
  allocateAsset,
  acknowledgeAllocation,
  returnAsset,
} from '../controllers/asset.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, listAssets);
router.get('/allocations', requireAuth, listAllocations);
router.get('/:id', requireAuth, getAssetById);
router.post('/', requireAuth, requireRole('IT_ADMIN', 'SYSTEM_ADMIN'), createAsset);
router.post('/allocate', requireAuth, requireRole('IT_ADMIN', 'SYSTEM_ADMIN'), allocateAsset);
router.patch('/allocations/:id/acknowledge', requireAuth, acknowledgeAllocation);
router.patch('/allocations/:id/return', requireAuth, requireRole('IT_ADMIN', 'SYSTEM_ADMIN'), returnAsset);

export default router;
