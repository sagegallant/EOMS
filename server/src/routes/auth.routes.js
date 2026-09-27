import { Router } from 'express';
import {
  login,
  verifyMfa,
  setupMfa,
  enableMfa,
  disableMfa,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/mfa/verify', verifyMfa);
router.post('/mfa/setup', requireAuth, setupMfa);
router.post('/mfa/enable', requireAuth, enableMfa);
router.post('/mfa/disable', requireAuth, disableMfa);
router.get('/me', requireAuth, getCurrentUser);

export default router;

