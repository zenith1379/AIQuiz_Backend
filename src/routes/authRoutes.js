import express from 'express';
import { AuthController } from '../controllers/index.js';
import { verifyToken } from '../middleware/auth.js';
import { forgotPasswordLimiter, resetPasswordLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Password reset routes (with rate limiting)
router.post('/forgot-password', forgotPasswordLimiter, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, AuthController.resetPassword);

// Protected routes
router.get('/me', verifyToken, AuthController.getCurrentUser);
router.post('/change-password', verifyToken, AuthController.changePassword);

export default router;
