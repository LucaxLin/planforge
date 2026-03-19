import { Router } from 'express';
import {
  createSession,
  getSession,
  sendMessage,
  getMessages,
} from '../controllers/chat.controller.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

router.post('/', asyncHandler(createSession));
router.get('/:id', asyncHandler(getSession));
router.post('/:id/messages', asyncHandler(sendMessage));
router.get('/:id/messages', asyncHandler(getMessages));

export default router;
