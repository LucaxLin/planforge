import { Router } from 'express';
import requirementRoutes from './requirement.routes.js';
import chatRoutes from './chat.routes.js';
import documentRoutes from './document.routes.js';
import sessionRoutes from './session.routes.js';
import documentsRoutes from './documents.routes.js';

const router = Router();

router.use('/requirements', requirementRoutes);
router.use('/sessions', chatRoutes);
router.use('/api', documentRoutes);
router.use('/api', sessionRoutes);
router.use('/api/documents', documentsRoutes);

export default router;
