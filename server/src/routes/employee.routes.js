import { Router } from 'express';
import {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  reactivateEmployee,
  deleteEmployee,
  getDepartments,
  getPositions,
} from '../controllers/employee.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/departments', requireAuth, getDepartments);
router.get('/positions', requireAuth, getPositions);

router.get('/', requireAuth, listEmployees);
router.get('/:id', requireAuth, getEmployeeById);
router.post('/', requireAuth, requirePermission('employee:write'), createEmployee);
router.patch('/:id', requireAuth, requirePermission('employee:write'), updateEmployee);
router.patch('/:id/deactivate', requireAuth, requireRole('SYSTEM_ADMIN'), deactivateEmployee);
router.patch('/:id/reactivate', requireAuth, requireRole('SYSTEM_ADMIN'), reactivateEmployee);
router.delete('/:id', requireAuth, requireRole('SYSTEM_ADMIN'), deleteEmployee);

export default router;

