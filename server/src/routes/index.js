import { Router } from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import onboardingRoutes from './onboarding.routes.js';
import taskRoutes from './task.routes.js';
import documentRoutes from './document.routes.js';
import assetRoutes from './asset.routes.js';
import trainingRoutes from './training.routes.js';
import notificationRoutes from './notification.routes.js';
import reportRoutes from './report.routes.js';
import auditRoutes from './audit.routes.js';
import settingRoutes from './setting.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'Enterprise Onboarding Management System (EOMS) API',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/tasks', taskRoutes);
router.use('/documents', documentRoutes);
router.use('/assets', assetRoutes);
router.use('/training', trainingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/audit', auditRoutes);
router.use('/settings', settingRoutes);

export default router;
