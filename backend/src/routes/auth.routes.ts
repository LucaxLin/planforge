import { Router, type Router as ExpressRouter } from 'express';
import {
  getCurrentUser,
  logout,
  sendRegisterCode,
  verifyRegister,
  login,
} from '../controllers/auth.controller.js';

const router: ExpressRouter = Router();

// Get current user (check login status)
router.get('/me', getCurrentUser);

// Logout
router.post('/logout', logout);

// Send register code
router.post('/register/send-code', sendRegisterCode);

// Verify register
router.post('/register/verify', verifyRegister);

// Login (no email verification needed)
router.post('/login', login);

export default router;
