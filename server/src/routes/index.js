import { Router } from 'express';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import clientPortalRoutes from './clientPortalRoutes.js';
import clientRoutes from './clientRoutes.js';
import healthRoutes from './healthRoutes.js';
import jobRoutes from './jobRoutes.js';
import jobNoteRoutes from './jobNoteRoutes.js';
import operativeRoutes from './operativeRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import reportRoutes from './reportRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import userRoutes from './userRoutes.js';
import variationRoutes from './variationRoutes.js';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/client', clientPortalRoutes);
router.use('/clients', clientRoutes);
router.use('/health', healthRoutes);
router.use('/job-notes', jobNoteRoutes);
router.use('/jobs', jobRoutes);
router.use('/operative', operativeRoutes);
router.use('/properties', propertyRoutes);
router.use('/reports', reportRoutes);
router.use('/uploads', uploadRoutes);
router.use('/users', userRoutes);
router.use('/variations', variationRoutes);

export default router;
