import { Router, type Router as ExpressRouter, type Request, type Response } from 'express';
import { dbService } from '../services/database.service.js';
import { aiService } from '../services/ai.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { generatorSystemPrompt, generateDocumentPrompt } from '../prompts/generator.prompt.js';
import type { AIConfig } from '../types/index.js';
import logger from '../utils/logger.js';

const router: ExpressRouter = Router();

router.use(requireAuth);

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

const getUserId = (req: Request): string => {
  return (req as any).userId;
};

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const documents = dbService.getAllDocuments(userId);
  res.json({ documents });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const document = dbService.getDocument(userId, parseInt(req.params.id));
  if (!document) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  res.json({ document });
}));

router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { sessionId, title } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required' });
    return;
  }

  const session = dbService.getSession(userId, sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const aiConfig = extractAIConfig(req);
  const document = dbService.createDocument(userId, sessionId, title || '项目实施计划', 'generating');

  res.status(202).json({
    document,
    message: 'Document generation started. Check document status for updates.',
  });

  setImmediate(async () => {
    try {
      const messages = dbService.getMessages(userId, sessionId);
      const conversationSummary = messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
        .join('\n\n');

      const fullPrompt = `**原始需求：**
${session.requirement_content || '未提供具体需求'}

**对话历史：**
${conversationSummary || '无对话历史'}`;

      aiService.configure(aiConfig);

      const response = await aiService.chat([
        { role: 'system', content: generatorSystemPrompt },
        { role: 'user', content: generateDocumentPrompt(fullPrompt) }
      ]);

      const cleanContent = response
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .trim();

      dbService.updateDocument(userId, document.id, {
        content: cleanContent,
        status: 'completed'
      });

      logger.info('Async document generation completed', {
        userId,
        documentId: document.id,
        sessionId,
        contentLength: response.length
      });

    } catch (error) {
      logger.error('Async document generation failed', {
        userId,
        documentId: document.id,
        error: error instanceof Error ? error.message : 'Unknown'
      });
      dbService.updateDocument(userId, document.id, {
        status: 'failed'
      });
    }
  });
}));

router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { title, content, status } = req.body;
  const document = dbService.updateDocument(userId, parseInt(req.params.id), { title, content, status });
  if (!document) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  res.json({ document });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  dbService.deleteDocument(userId, parseInt(req.params.id));
  res.status(204).send();
}));

export default router;
