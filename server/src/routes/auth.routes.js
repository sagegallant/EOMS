import { Router } from 'express';
import { login, verifyMfa, getCurrentUser } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/mfa/verify', verifyMfa);
router.get('/me', requireAuth, getCurrentUser);

export default router;
