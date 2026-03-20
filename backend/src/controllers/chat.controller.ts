import type { Request, Response } from 'express';
import { requirementService } from '../services/requirement.service.js';
import { aiService } from '../services/ai.service.js';
import { analyzerSystemPrompt, analyzerUserPrompt } from '../prompts/analyzer.prompt.js';
import logger from '../utils/logger.js';
import type { AIConfig, Message } from '../types/index.js';

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

export const chat = async (req: Request, res: Response) => {
  const { requirementId, message } = req.body;

  logger.info('Chat request received', { requirementId, messageLength: message?.length });

  if (!requirementId || !message) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'requirementId and message are required',
      statusCode: 400,
    });
    return;
  }

  const requirement = requirementService.getRequirement(requirementId);
  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${requirementId} not found`,
      statusCode: 404,
    });
    return;
  }

  try {
    const aiConfig = extractAIConfig(req);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullResponse = '';
    let history = requirementService.getConversationHistory(requirementId) || [];
    
    history.push({ role: 'user', content: message });

    const messages: Message[] = [
      { role: 'system', content: analyzerSystemPrompt }
    ];

    if (requirement) {
      messages.push({ role: 'user', content: analyzerUserPrompt(requirement.content) });
    }

    messages.push(...history);

    aiService.configure(aiConfig);

    logger.info('Starting streaming response', { requirementId });

    try {
      for await (const chunk of aiService.chatStream(messages)) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
      }
    } catch (streamError) {
      logger.error('Stream error', { error: streamError instanceof Error ? streamError.message : 'Unknown' });
      res.write(`data: ${JSON.stringify({ error: 'Stream failed', done: true })}\n\n`);
    }

    history.push({ role: 'assistant', content: fullResponse });
    
    const updatedHistory = requirementService.updateConversationHistory(requirementId, history);

    res.write(`data: ${JSON.stringify({ done: true, history: updatedHistory })}\n\n`);
    res.end();

    logger.info('Chat stream completed', { requirementId, responseLength: fullResponse.length });

  } catch (error) {
    logger.error('Chat failed', { 
      error: error instanceof Error ? error.message : 'Unknown',
      requirementId 
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Chat failed',
      statusCode: 500,
    });
  }
};

export const generateSolution = async (req: Request, res: Response) => {
  const { requirementId } = req.body;

  logger.info('Generate solution request received', { requirementId });

  if (!requirementId) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'requirementId is required',
      statusCode: 400,
    });
    return;
  }

  const requirement = requirementService.getRequirement(requirementId);
  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${requirementId} not found`,
      statusCode: 404,
    });
    return;
  }

  try {
    const aiConfig = extractAIConfig(req);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const history = requirementService.getConversationHistory(requirementId) || [];
    const conversationSummary = history.map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`).join('\n\n');

    const { generatorSystemPrompt } = await import('../prompts/generator.prompt.js');
    const { generatorUserPrompt } = await import('../prompts/generator.prompt.js');
    
    const messages = [
      { role: 'system' as const, content: generatorSystemPrompt },
      { role: 'user' as const, content: generatorUserPrompt(requirement.content, undefined, conversationSummary) }
    ];

    aiService.configure(aiConfig);

    logger.info('Starting streaming solution generation', { requirementId });

    let fullContent = '';
    try {
      for await (const chunk of aiService.chatStream(messages)) {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
      }
    } catch (streamError) {
      logger.error('Solution stream error', { error: streamError instanceof Error ? streamError.message : 'Unknown' });
      res.write(`data: ${JSON.stringify({ error: 'Stream failed', done: true })}\n\n`);
    }

    const completeMarker = `\n\n---\n**文档完整性验证**\n- 生成时间: ${new Date().toLocaleString('zh-CN')}\n- 文档状态: ✅ 完整\n- 字符数: ${fullContent.length}\n`;
    fullContent += completeMarker;

    res.write(`data: ${JSON.stringify({ done: true, content: fullContent, complete: true })}\n\n`);
    res.end();

    logger.info('Solution stream completed', { requirementId, contentLength: fullContent.length });

  } catch (error) {
    logger.error('Generate solution failed', { 
      error: error instanceof Error ? error.message : 'Unknown',
      requirementId 
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to generate solution',
      statusCode: 500,
    });
  }
};

export const getConversationHistory = async (req: Request, res: Response) => {
  const { requirementId } = req.params;

  logger.info('Get conversation history', { requirementId });

  const requirement = requirementService.getRequirement(requirementId);
  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${requirementId} not found`,
      statusCode: 404,
    });
    return;
  }

  const history = requirementService.getConversationHistory(requirementId);

  res.json({
    requirementId,
    history,
  });
};
