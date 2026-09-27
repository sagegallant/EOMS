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
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

router.get('/departments', requireAuth, getDepartments);
router.get('/positions', requireAuth, getPositions);

router.get('/', requireAuth, listEmployees);
router.get('/:id', requireAuth, getEmployeeById);
router.post('/', requireAuth, requirePermission('employee:write'), createEmployee);
router.patch('/:id', requireAuth, requirePermission('employee:write'), updateEmployee);

export default router;

