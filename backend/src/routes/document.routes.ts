import { Router } from 'express';
import {
  generateAnalysis,
  generateQuestions,
  generateSolution,
  exportMarkdown,
} from '../controllers/document.controller.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

router.post('/generate/analysis', asyncHandler(generateAnalysis));
router.post('/generate/questions', asyncHandler(generateQuestions));
router.post('/generate/solution', asyncHandler(generateSolution));
router.post('/export/markdown', asyncHandler(exportMarkdown));

export default router;
