import { Router } from 'express';
import { listEmployees, getEmployeeById } from '../controllers/employee.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listEmployees);
router.get('/:id', requireAuth, getEmployeeById);

export default router;
