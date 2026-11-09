import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { getMe, login } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Allow 5 failed logins per IP every 15 minutes. Successful logins are not
// counted, so normal users are never blocked.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many failed login attempts. Please try again in 15 minutes.', details: null }
});

router.post('/login', loginLimiter, login);
router.get('/me', authenticate, getMe);

export default router;
