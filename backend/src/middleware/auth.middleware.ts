import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { dbService } from '../services/database.service.js';
import config from '../config/index.js';

const verifyToken = (token: string): { userId: string; iat: number } | null => {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    const secret = config.jwt.secret;

    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) return null;

    return payload;
  } catch (error) {
    return null;
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    res.status(401).json({ error: '未登录', code: 'UNAUTHORIZED' });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: '登录已过期', code: 'TOKEN_EXPIRED' });
    return;
  }

  const user = dbService.getUserById(decoded.userId);

  if (!user) {
    res.status(401).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
    return;
  }

  (req as any).user = user;
  (req as any).userId = user.id;

  next();
};
