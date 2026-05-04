import { Router } from 'express';

import {
  getDashboard,
  getJob,
  getJobs,
  patchStatus
} from '../controllers/operativeController.js';
import { getOperativeJobVariations } from '../controllers/variationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('operative'));

router.get('/dashboard', getDashboard);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJob);
router.get('/jobs/:id/variations', getOperativeJobVariations);
router.patch('/jobs/:id/status', patchStatus);

export default router;
