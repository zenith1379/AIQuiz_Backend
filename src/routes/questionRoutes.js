import express from 'express';
import { QuizController } from '../controllers/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (read access)
router.get('/:id/choices', QuizController.getChoices);

export default router;
