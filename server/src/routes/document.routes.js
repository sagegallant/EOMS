import { Router } from 'express';
import {
  listDocumentTypes,
  listDocuments,
  getDocumentById,
  uploadDocument,
  verifyDocument,
} from '../controllers/document.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/types', requireAuth, listDocumentTypes);
router.get('/', requireAuth, listDocuments);
router.get('/:id', requireAuth, getDocumentById);
router.post('/upload', requireAuth, uploadDocument);
router.patch('/:id/verify', requireAuth, requireRole('COMPLIANCE_OFFICER', 'HR_ADMIN', 'HR_SPECIALIST'), verifyDocument);

export default router;
