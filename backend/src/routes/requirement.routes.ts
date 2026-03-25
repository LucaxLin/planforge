import { Router, type Router as ExpressRouter } from 'express';
import {
  createRequirement,
  getRequirement,
  updateRequirement,
  deleteRequirement,
  uploadDocument,
} from '../controllers/requirement.controller.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router: ExpressRouter = Router();

router.post('/', upload.single('file'), asyncHandler(createRequirement));
router.get('/:id', asyncHandler(getRequirement));
router.put('/:id', asyncHandler(updateRequirement));
router.delete('/:id', asyncHandler(deleteRequirement));
router.post('/:id/upload', upload.single('file'), asyncHandler(uploadDocument));

export default router;
