import { Router } from 'express';
import {
  listCourses,
  getCourseById,
  getEmployeeTraining,
  updateProgress,
  createCourse,
} from '../controllers/training.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/courses', requireAuth, listCourses);
router.get('/courses/:id', requireAuth, getCourseById);
router.post('/courses', requireAuth, requireRole('HR_ADMIN', 'COMPLIANCE_OFFICER'), createCourse);
router.get('/employee/:employeeId', requireAuth, getEmployeeTraining);
router.post('/progress', requireAuth, updateProgress);

export default router;
