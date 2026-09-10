import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, requireRole('SYSTEM_ADMIN', 'COMPLIANCE_OFFICER', 'HR_ADMIN'), listAuditLogs);

export default router;
