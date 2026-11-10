import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { demoLogin, getMe, login } from '../controllers/authController.js';
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

// Demo sign-in has no password to guess, so it gets its own limit: 30 per IP
// every 15 minutes (enough for a visitor to try all three roles many times).
const demoLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many demo sign-ins. Please try again in a few minutes.', details: null }
});

router.post('/login', loginLimiter, login);
router.post('/demo-login', demoLoginLimiter, demoLogin);
router.get('/me', authenticate, getMe);

export default router;
