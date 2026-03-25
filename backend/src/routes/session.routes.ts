import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from '../services/database.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const sessions = dbService.getAllSessions();
  res.json({ sessions });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const session = dbService.getSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  const messages = dbService.getMessages(req.params.id);
  const documents = dbService.getDocumentsBySession(req.params.id);
  res.json({ session, messages, documents });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, requirementContent } = req.body;
  const id = uuidv4();
  const session = dbService.createSession(id, title || '新对话', requirementContent);
  res.status(201).json({ session });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const { title, requirementContent } = req.body;
  const session = dbService.updateSession(req.params.id, { title, requirement_content: requirementContent });
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json({ session });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  dbService.deleteSession(req.params.id);
  res.status(204).send();
}));

router.get('/:id/messages', asyncHandler(async (req, res) => {
  const messages = dbService.getMessages(req.params.id);
  res.json({ messages });
}));

router.post('/:id/messages', asyncHandler(async (req, res) => {
  const { role, content } = req.body;
  if (!role || !content) {
    res.status(400).json({ error: 'role and content are required' });
    return;
  }
  const messages = dbService.addMessage(req.params.id, role, content);
  res.status(201).json({ messages });
}));

router.delete('/:id/messages', asyncHandler(async (req, res) => {
  dbService.clearMessages(req.params.id);
  res.status(204).send();
}));

export default router;
