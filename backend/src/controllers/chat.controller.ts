import type { Request, Response } from 'express';
import { requirementService } from '../services/requirement.service.js';
import { sendMessageSchema } from '../utils/validator.js';
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

export const createSession = async (req: Request, res: Response) => {
  const { requirementId } = req.body;

  const requirement = requirementService.getRequirement(requirementId);
  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${requirementId} not found`,
      statusCode: 404,
    });
    return;
  }

  const session = requirementService.createSession(requirementId);
  res.status(201).json(session);
};

export const getSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = requirementService.getSession(id);

  if (!session) {
    res.status(404).json({
      error: 'Not Found',
      message: `Session ${id} not found`,
      statusCode: 404,
    });
    return;
  }

  res.json(session);
};

export const sendMessage = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = sendMessageSchema.parse(req.body);
    const session = requirementService.getSession(id);

    if (!session) {
      res.status(404).json({
        error: 'Not Found',
        message: `Session ${id} not found`,
        statusCode: 404,
      });
      return;
    }

    requirementService.addMessageToSession(id, {
      role: 'user',
      content: data.content,
    });

    const aiConfig = extractAIConfig(req);
    const requirement = requirementService.getRequirement(session.requirementId);

    const systemPrompt = `You are a helpful AI assistant helping to clarify requirements for the following project:

Project: ${requirement?.title || 'Untitled'}
Description: ${requirement?.content || 'No description'}

Provide helpful, concise responses to help clarify requirements.`;

    const { aiService } = await import('../services/ai.service.js');
    const response = await aiService.chat(
      session.messages as any,
      systemPrompt
    );

    requirementService.addMessageToSession(id, {
      role: 'assistant',
      content: response,
    });

    res.json({
      sessionId: id,
      message: {
        role: 'assistant',
        content: response,
      },
    });
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

export const getMessages = async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = requirementService.getSession(id);

  if (!session) {
    res.status(404).json({
      error: 'Not Found',
      message: `Session ${id} not found`,
      statusCode: 404,
    });
    return;
  }

  res.json({
    sessionId: id,
    messages: session.messages,
  });
};
