import { Router, type Router as ExpressRouter } from 'express';
import {
  chat,
  generateSolution,
  getConversationHistory,
} from '../controllers/chat.controller.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router: ExpressRouter = Router();

router.post('/', asyncHandler(chat));
router.post('/generate-solution', asyncHandler(generateSolution));
router.get('/history/:requirementId', asyncHandler(getConversationHistory));

export default router;
