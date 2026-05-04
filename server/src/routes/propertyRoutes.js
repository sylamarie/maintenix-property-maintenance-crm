import { Router } from 'express';

import {
  getProperties,
  getProperty,
  patchProperty,
  postProperty,
  removeProperty
} from '../controllers/propertyController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', postProperty);
router.patch('/:id', patchProperty);
router.delete('/:id', removeProperty);

export default router;
