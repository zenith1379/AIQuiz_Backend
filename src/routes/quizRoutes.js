import express from 'express';
import { QuizController } from '../controllers/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth required for reading)
router.get('/community', QuizController.getCommunity);
router.get('/', QuizController.getAll); // Make getAll public
router.get('/:id', QuizController.getById); // Make getById public
router.get('/:id/questions', QuizController.getQuestions); // Make questions public

// Protected routes (require authentication)
router.post('/', verifyToken, QuizController.create);
router.put('/:id', verifyToken, QuizController.update);
router.delete('/:id', verifyToken, QuizController.delete);
router.post('/:id/request-public', verifyToken, QuizController.requestPublic);

// Question routes (protected)
router.post('/questions', verifyToken, QuizController.addQuestion);
router.put('/questions/:id', verifyToken, QuizController.updateQuestion);
router.delete('/questions/:id', verifyToken, QuizController.deleteQuestion);

export default router;
