import { Router, type Router as ExpressRouter, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from '../services/database.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.use(requireAuth);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const sessions = dbService.getAllSessions(userId);
  res.json({ sessions });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const session = dbService.getSession(userId, req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  const messages = dbService.getMessages(userId, req.params.id);
  const documents = dbService.getDocumentsBySession(userId, req.params.id);
  res.json({ session, messages, documents });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, requirementContent } = req.body;
  const id = uuidv4();
  const session = dbService.createSession(userId, id, title || '新对话', requirementContent);
  res.status(201).json({ session });
}));

router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, requirementContent } = req.body;
  const session = dbService.updateSession(userId, req.params.id, { title, requirement_content: requirementContent });
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json({ session });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  dbService.deleteSession(userId, req.params.id);
  res.status(204).send();
}));

router.get('/:id/messages', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const messages = dbService.getMessages(userId, req.params.id);
  res.json({ messages });
}));

router.post('/:id/messages', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { role, content } = req.body;
  if (!role || !content) {
    res.status(400).json({ error: 'role and content are required' });
    return;
  }
  const messages = dbService.addMessage(userId, req.params.id, role, content);
  res.status(201).json({ messages });
}));

router.delete('/:id/messages', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  dbService.clearMessages(userId, req.params.id);
  res.status(204).send();
}));

export default router;
