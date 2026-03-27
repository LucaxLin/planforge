import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { dbService } from '../services/database.service.js';
import { emailService } from '../services/email.service.js';
import { captchaService } from '../services/captcha.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import config from '../config/index.js';

const generateEmailVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId: string): string => {
  const payload = { userId, iat: Date.now() };
  const secret = config.jwt.secret;
  const signature = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return `${Buffer.from(JSON.stringify(payload)).toString('base64')}.${signature}`;
};

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

export const getCaptcha = asyncHandler(async (_req: Request, res: Response) => {
  const captcha = captchaService.generateCaptcha();
  res.json({
    captchaId: captcha.captchaId,
    captchaData: captcha.captchaData,
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  // Read token from Cookie instead of Authorization header
  const token = req.cookies?.auth_token;

  if (!token) {
    res.status(401).json({ error: '未登录', isLoggedIn: false });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: '登录已过期', isLoggedIn: false });
    return;
  }

  const user = dbService.getUserById(decoded.userId);

  if (!user) {
    res.status(401).json({ error: '用户不存在', isLoggedIn: false });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    isLoggedIn: true,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({ message: '已退出登录' });
});

export const sendRegisterCode = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, confirmPassword } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: '无效的邮箱格式' });
    return;
  }

  // Validate password length
  if (password.length < 6) {
    res.status(400).json({ error: '密码至少需要 6 位' });
    return;
  }

  // Validate password match
  if (password !== confirmPassword) {
    res.status(400).json({ error: '两次输入的密码不一致' });
    return;
  }

  // Check if email already exists
  const existingUser = dbService.getUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ error: '该邮箱已被注册' });
    return;
  }

  // Generate email verification code
  const code = generateEmailVerificationCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Save email verification code
  dbService.createEmailVerificationCode(email, code);

  // Send email
  try {
    await emailService.sendVerificationCode(email, code);
  } catch (error) {
    res.status(500).json({ error: '邮件发送失败，请稍后重试' });
    return;
  }

  res.json({
    message: '验证码已发送到您的邮箱',
    expiresAt,
  });
});

export const verifyRegister = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, password } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: '无效的邮箱格式' });
    return;
  }

  // Get email verification code
  const verification = dbService.getEmailVerificationCode(email);

  if (!verification) {
    res.status(400).json({ error: '请先获取验证码' });
    return;
  }

  // Check if code is expired
  if (verification.expires_at < Date.now()) {
    res.status(400).json({ error: '验证码已过期，请重新获取' });
    return;
  }

  // Check if code is correct
  if (verification.code !== code) {
    res.status(400).json({ error: '验证码错误' });
    return;
  }

  // Mark code as used
  dbService.markEmailCodeAsUsed(email);

  // Check if email already exists
  const existingUser = dbService.getUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ error: '该邮箱已被注册' });
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const userId = uuidv4();
  const user = dbService.createUser(userId, email, passwordHash);

  // Generate token
  const token = generateToken(userId);

  // Set HttpOnly Cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  res.status(201).json({
    message: '注册成功',
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: '无效的邮箱格式' });
    return;
  }

  // Validate password
  if (!password || password.length < 6) {
    res.status(400).json({ error: '密码至少需要 6 位' });
    return;
  }

  // Check if user exists
  const user = dbService.getUserByEmail(email);
  if (!user) {
    res.status(400).json({ error: '该邮箱未注册，请先注册' });
    return;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    res.status(400).json({ error: '密码错误' });
    return;
  }

  // Generate token
  const token = generateToken(user.id);

  // Set HttpOnly Cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  res.json({
    message: '登录成功',
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
  });
});
