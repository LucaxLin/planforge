import type { Request, Response } from 'express';
import { requirementService } from '../services/requirement.service.js';
import { createRequirementSchema } from '../utils/validator.js';
import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import type { AIConfig } from '../types/index.js';

const extractAIConfig = (req: Request): AIConfig => {
  const provider = req.headers['x-api-provider'] as string;
  const apiKey = req.headers['x-api-key'] as string;
  const baseURL = req.headers['x-api-baseurl'] as string | undefined;
  const model = req.headers['x-api-model'] as string;

  if (!provider || !apiKey || !model) {
    throw new Error('Missing required AI configuration headers');
  }

  return {
    provider: provider as 'minimax' | 'zai' | 'custom',
    apiKey,
    baseURL,
    model,
  };
};

export const createRequirement = async (req: Request, res: Response) => {
  try {
    const data = createRequirementSchema.parse(req.body);
    const requirement = requirementService.createRequirement(data.title, data.content, data.type);
    res.status(201).json(requirement);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.errors,
        statusCode: 400,
      });
    } else {
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

export const analyzeRequirement = async (req: Request, res: Response) => {
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

  try {
    const aiConfig = extractAIConfig(req);
    const analysis = await requirementService.analyzeRequirement(requirement.content, aiConfig);

    requirementService.updateRequirement(id, {
      status: 'completed',
      analysis,
    });

    res.json({
      requirementId: id,
      analysis,
    });
  } catch (error) {
    logger.error('Analysis failed', { error: error instanceof Error ? error.message : 'Unknown' });
    requirementService.updateRequirement(id, { status: 'failed' } as any);
    throw error;
  }
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

  const content = req.file.buffer.toString('utf-8');
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
