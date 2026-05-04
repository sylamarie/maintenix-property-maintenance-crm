import { Router } from 'express';

import { getDashboard } from '../controllers/adminDashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', getDashboard);

export default router;
