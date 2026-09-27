import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

router.get('/', requireAuth, requirePermission('audit:view'), listAuditLogs);

export default router;

