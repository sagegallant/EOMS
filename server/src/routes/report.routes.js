import { Router } from 'express';
import {
  getDashboardSummary,
  getDepartmentStats,
} from '../controllers/report.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/summary', requireAuth, requireRole('HR_ADMIN', 'HR_SPECIALIST', 'COMPLIANCE_OFFICER', 'DEPARTMENT_MANAGER', 'IT_ADMIN'), getDashboardSummary);
router.get('/departments', requireAuth, requireRole('HR_ADMIN', 'HR_SPECIALIST', 'COMPLIANCE_OFFICER', 'DEPARTMENT_MANAGER'), getDepartmentStats);

export default router;
