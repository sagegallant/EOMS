import { Router } from 'express';
import {
  listPlans,
  getPlanById,
  getPlanByEmployeeId,
  createPlan,
  updatePlan,
  listTemplates,
  getTemplateById,
} from '../controllers/onboarding.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/templates', requireAuth, listTemplates);
router.get('/templates/:id', requireAuth, getTemplateById);

router.get('/employee/:employeeId', requireAuth, getPlanByEmployeeId);
router.get('/', requireAuth, listPlans);
router.get('/:id', requireAuth, getPlanById);
router.post('/', requireAuth, requireRole('HR_ADMIN', 'HR_SPECIALIST', 'RECRUITER'), createPlan);
router.patch('/:id', requireAuth, requireRole('HR_ADMIN', 'HR_SPECIALIST', 'DEPARTMENT_MANAGER'), updatePlan);

export default router;
