import express from 'express';
import { AIController } from '../controllers/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All AI routes require authentication
router.use(verifyToken);

router.post('/generate', AIController.generateQuiz);
router.post('/chat', AIController.chat);
router.post('/feedback', AIController.submitFeedback);

export default router;
