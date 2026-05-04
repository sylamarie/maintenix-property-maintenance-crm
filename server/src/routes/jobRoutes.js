import { Router } from 'express';

import {
  getJob,
  getJobs,
  patchJob,
  patchJobAssignment,
  patchJobStatus,
  postJob,
  removeJob
} from '../controllers/jobController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', postJob);
router.patch('/:id', patchJob);
router.patch('/:id/status', patchJobStatus);
router.patch('/:id/assign', patchJobAssignment);
router.delete('/:id', removeJob);

export default router;
