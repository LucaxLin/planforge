import { Router, type Router as ExpressRouter } from 'express';
import { exportMarkdown } from '../controllers/document.controller.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router: ExpressRouter = Router();

router.post('/export/markdown', asyncHandler(exportMarkdown));

export default router;
