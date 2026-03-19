import { Router } from 'express';
import requirementRoutes from './requirement.routes.js';
import chatRoutes from './chat.routes.js';
import documentRoutes from './document.routes.js';

const router = Router();

router.use('/requirements', requirementRoutes);
router.use('/sessions', chatRoutes);
router.use('/', documentRoutes);

export default router;
