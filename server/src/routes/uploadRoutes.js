import { Router } from 'express';

import { uploadJobPhoto } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { ensureAssignedJobAccess } from '../middleware/jobAccessMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { uploadJobPhotoFile } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post(
  '/jobs/:jobId/photos',
  authenticate,
  requireRole('operative'),
  ensureAssignedJobAccess,
  uploadJobPhotoFile.single('photo'),
  uploadJobPhoto
);

export default router;
