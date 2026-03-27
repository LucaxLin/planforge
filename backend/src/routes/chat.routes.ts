import { Router, type Router as ExpressRouter } from 'express';
import {
  chat,
  generateSolution,
  getConversationHistory,
} from '../controllers/chat.controller.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.use(requireAuth);

router.post('/', asyncHandler(chat));
router.post('/generate-solution', asyncHandler(generateSolution));
router.get('/history/:requirementId', asyncHandler(getConversationHistory));

export default router;
