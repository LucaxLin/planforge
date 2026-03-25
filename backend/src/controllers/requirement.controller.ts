import type { Request, Response } from 'express';
import { requirementService } from '../services/requirement.service.js';
import { createRequirementSchema } from '../utils/validator.js';
import { ZodError } from 'zod';
import logger from '../utils/logger.js';

const parseFileContent = (file: Express.Multer.File): string => {
  const ext = file.originalname.split('.').pop()?.toLowerCase();

  try {
    if (ext === 'txt' || ext === 'md') {
      return file.buffer.toString('utf-8');
    } else if (ext === 'doc' || ext === 'docx') {
      logger.warn('Word document parsing - treating as plain text', {
        filename: file.originalname,
        size: file.size
      });
      return file.buffer.toString('utf-8');
    }
    return file.buffer.toString('utf-8');
  } catch (error) {
    logger.error('Failed to parse file', {
      error: error instanceof Error ? error.message : 'Unknown',
      filename: file.originalname
    });
    throw new Error('Failed to parse file content');
  }
};

export const createRequirement = async (req: Request, res: Response) => {
  try {
    let title = '';
    let content = '';
    let type: 'text' | 'document' = 'text';

    if (req.headers['content-type']?.includes('multipart/form-data')) {
      title = req.body.title || '未命名需求';
      content = req.body.content || '';
      type = 'text';

      if (req.file) {
        logger.info('File uploaded', {
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        });

        content = parseFileContent(req.file);
        type = 'document';
      }
    } else {
      const data = createRequirementSchema.parse(req.body);
      title = data.title;
      content = data.content;
      type = data.type;
    }

    if (!content.trim()) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Content is required',
        statusCode: 400,
      });
      return;
    }

    const requirement = requirementService.createRequirement(title, content, type);
    res.status(201).json(requirement);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.errors,
        statusCode: 400,
      });
    } else {
      logger.error('Create requirement failed', {
        error: error instanceof Error ? error.message : 'Unknown'
      });
      throw error;
    }
  }
};

export const getRequirement = async (req: Request, res: Response) => {
  const { id } = req.params;
  const requirement = requirementService.getRequirement(id);

  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${id} not found`,
      statusCode: 404,
    });
    return;
  }

  res.json(requirement);
};

export const updateRequirement = async (req: Request, res: Response) => {
  const { id } = req.params;
  const requirement = requirementService.updateRequirement(id, req.body);

  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${id} not found`,
      statusCode: 404,
    });
    return;
  }

  res.json(requirement);
};

export const deleteRequirement = async (req: Request, res: Response) => {
  const { id } = req.params;
  const requirement = requirementService.getRequirement(id);

  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${id} not found`,
      statusCode: 404,
    });
    return;
  }

  requirementService.updateRequirement(id, { status: 'failed' } as any);
  res.status(204).send();
};

export const uploadDocument = async (req: Request, res: Response) => {
  const { id } = req.params;

  const requirement = requirementService.getRequirement(id);
  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${id} not found`,
      statusCode: 404,
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'No file uploaded',
      statusCode: 400,
    });
    return;
  }

  const content = parseFileContent(req.file);
  requirementService.updateRequirement(id, {
    content,
    type: 'document',
  });

  res.json({
    message: 'Document uploaded successfully',
    filename: req.file.originalname,
    size: req.file.size,
  });
};
