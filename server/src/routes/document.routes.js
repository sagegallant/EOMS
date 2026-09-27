import { Router } from 'express';
import {
  listDocumentTypes,
  listDocuments,
  getDocumentById,
  uploadDocument,
  downloadDocument,
  verifyDocument,
} from '../controllers/document.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { documentUpload } from '../services/storage.service.js';

const router = Router();

router.get('/types', requireAuth, listDocumentTypes);
router.get('/', requireAuth, listDocuments);
router.get('/:id', requireAuth, getDocumentById);
router.get('/:id/download', requireAuth, downloadDocument);
router.post('/upload', requireAuth, documentUpload.single('file'), uploadDocument);
router.patch('/:id/verify', requireAuth, requirePermission('document:verify'), verifyDocument);

export default router;


