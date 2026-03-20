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

  logger.info('Extracting AI config from headers', {
    hasProvider: !!provider,
    hasApiKey: !!apiKey,
    hasBaseURL: !!baseURL,
    hasModel: !!model,
    provider,
    model,
    baseURL,
    apiKeyLength: apiKey ? apiKey.length : 0
  });

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

export const analyzeRequirement = async (req: Request, res: Response) => {
  const { id } = req.params;

  logger.info('Analyze requirement request received', { id });

  const requirement = requirementService.getRequirement(id);
  if (!requirement) {
    logger.error('Requirement not found', { id });
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${id} not found`,
      statusCode: 404,
    });
    return;
  }

  logger.info('Requirement found', { 
    id, 
    title: requirement.title, 
    contentLength: requirement.content.length 
  });

  try {
    const aiConfig = extractAIConfig(req);
    logger.info('AI config extracted successfully', { 
      provider: aiConfig.provider,
      model: aiConfig.model,
      hasApiKey: !!aiConfig.apiKey
    });

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
    logger.error('Analysis failed', { 
      error: error instanceof Error ? error.message : 'Unknown',
      id 
    });
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
