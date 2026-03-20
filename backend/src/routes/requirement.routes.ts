import { Router } from 'express';
import {
  createRequirement,
  getRequirement,
  updateRequirement,
  deleteRequirement,
  analyzeRequirement,
  uploadDocument,
} from '../controllers/requirement.controller.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', upload.single('file'), asyncHandler(createRequirement));
router.get('/:id', asyncHandler(getRequirement));
router.put('/:id', asyncHandler(updateRequirement));
router.delete('/:id', asyncHandler(deleteRequirement));
router.post('/:id/analyze', asyncHandler(analyzeRequirement));
router.post('/:id/upload', upload.single('file'), asyncHandler(uploadDocument));

export default router;
