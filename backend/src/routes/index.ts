import { Router, type Router as ExpressRouter } from 'express';
import requirementRoutes from './requirement.routes.js';
import chatRoutes from './chat.routes.js';
import documentsRoutes from './documents.routes.js';
import sessionRoutes from './session.routes.js';
import authRoutes from './auth.routes.js';

const router: ExpressRouter = Router();

router.use('/requirements', requirementRoutes);
router.use('/chat', chatRoutes);
router.use('/sessions', sessionRoutes);
router.use('/documents', documentsRoutes);
router.use('/auth', authRoutes);

export default router;
