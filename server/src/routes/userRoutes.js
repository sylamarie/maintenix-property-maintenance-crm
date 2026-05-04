import { Router } from 'express';

import { getOperatives } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/operatives', getOperatives);

export default router;
