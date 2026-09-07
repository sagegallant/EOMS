import { Router } from 'express';
import {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getDepartments,
  getPositions,
} from '../controllers/employee.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/departments', requireAuth, getDepartments);
router.get('/positions', requireAuth, getPositions);

router.get('/', requireAuth, listEmployees);
router.get('/:id', requireAuth, getEmployeeById);
router.post('/', requireAuth, requireRole('HR_ADMIN', 'HR_SPECIALIST', 'RECRUITER'), createEmployee);
router.patch('/:id', requireAuth, requireRole('HR_ADMIN', 'HR_SPECIALIST', 'DEPARTMENT_MANAGER'), updateEmployee);

export default router;
