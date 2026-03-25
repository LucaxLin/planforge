import { Router } from 'express';
import requirementRoutes from './requirement.routes.js';
import chatRoutes from './chat.routes.js';
import documentsRoutes from './documents.routes.js';
import sessionRoutes from './session.routes.js';

const router = Router();

router.use('/requirements', requirementRoutes);
router.use('/chat', chatRoutes);
router.use('/sessions', sessionRoutes);
router.use('/documents', documentsRoutes);

export default router;
