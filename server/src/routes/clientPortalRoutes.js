import { Router } from 'express';

import {
  getDashboard,
  getJob,
  getJobs,
  getProperties
} from '../controllers/clientPortalController.js';
import { getClientVariations } from '../controllers/variationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('client'));

router.get('/dashboard', getDashboard);
router.get('/properties', getProperties);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJob);
router.get('/variations', getClientVariations);

export default router;
