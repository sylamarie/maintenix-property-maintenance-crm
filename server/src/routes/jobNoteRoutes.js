import { Router } from 'express';

import {
  getNotesForJob,
  postJobNote
} from '../controllers/jobNoteController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'operative'));

router.post('/', postJobNote);
router.get('/job/:jobId', getNotesForJob);

export default router;
