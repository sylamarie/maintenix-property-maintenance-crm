import { Router } from 'express';

import {
  getVariation,
  getVariations,
  patchAdminReview,
  patchClientDecision,
  postVariation
} from '../controllers/variationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { uploadVariationPhotoFile } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('admin'), getVariations);
router.post(
  '/',
  requireRole('operative'),
  uploadVariationPhotoFile.single('photo'),
  postVariation
);
router.get('/:id', requireRole('admin', 'operative', 'client'), getVariation);
router.patch('/:id/admin-review', requireRole('admin'), patchAdminReview);
router.patch('/:id/client-decision', requireRole('client'), patchClientDecision);

export default router;
