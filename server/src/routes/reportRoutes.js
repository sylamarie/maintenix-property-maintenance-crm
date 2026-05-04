import { Router } from 'express';

import { getJobReportById } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'operative', 'client'));

router.get('/jobs/:jobId', getJobReportById);

export default router;
