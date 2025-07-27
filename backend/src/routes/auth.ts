import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';
import { registerValidation, loginValidation } from '../utils/validation';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
} from '../controllers/authController';

const router = express.Router();

// Public routes with rate limiting - FIXED: Ensure all paths are properly formatted
router.post('/register', authLimiter, validateRequest(registerValidation), register);
router.post('/login', authLimiter, validateRequest(loginValidation), login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.post('/refresh-token', authenticate, refreshToken);

export default router;
