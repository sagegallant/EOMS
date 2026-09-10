import { Router } from 'express';
import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskProgress,
  deleteTask,
} from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, listTasks);
router.get('/:id', requireAuth, getTaskById);
router.post('/', requireAuth, requireRole('HR_ADMIN', 'HR_SPECIALIST', 'DEPARTMENT_MANAGER'), createTask);
router.patch('/:id', requireAuth, requireRole('HR_ADMIN', 'HR_SPECIALIST', 'DEPARTMENT_MANAGER'), updateTask);
router.patch('/:taskId/progress', requireAuth, updateTaskProgress);
router.delete('/:id', requireAuth, requireRole('HR_ADMIN', 'SYSTEM_ADMIN'), deleteTask);

export default router;
