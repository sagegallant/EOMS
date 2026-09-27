import { Router } from 'express';
import { listSettings, updateSetting } from '../controllers/setting.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, listSettings);
router.patch('/:key', requireAuth, requirePermission('setting:manage'), updateSetting);

export default router;

