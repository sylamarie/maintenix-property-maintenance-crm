import { Router } from 'express';

import {
  getClient,
  getClients,
  patchClient,
  postClient,
  removeClient
} from '../controllers/clientController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', postClient);
router.patch('/:id', patchClient);
router.delete('/:id', removeClient);

export default router;
