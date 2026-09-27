import { Router } from 'express';
import {
  getDashboardSummary,
  getDepartmentStats,
} from '../controllers/report.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

router.get('/summary', requireAuth, requirePermission('report:view'), getDashboardSummary);
router.get('/departments', requireAuth, requirePermission('report:view'), getDepartmentStats);

export default router;

