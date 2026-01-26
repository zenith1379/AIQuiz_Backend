import express from 'express';
import { AuthController, UserController, QuizController, AIController } from '../controllers/index.js';

const router = express.Router();

// Legacy Auth routes (no /auth prefix)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Legacy User routes
router.get('/users', UserController.getAll);
router.get('/users/stats/all', UserController.getStats);
router.get('/users/:id', UserController.getById);
router.put('/users/:id', UserController.update);
router.delete('/users/:id', UserController.delete);

// Legacy Quiz routes
router.post('/quizzes', QuizController.create);
router.get('/quizzes', QuizController.getAll);
router.get('/quizzes/community/all', QuizController.getCommunity);
router.get('/quizzes/:id', QuizController.getById);
router.put('/quizzes/:id', QuizController.update);
router.delete('/quizzes/:id', QuizController.delete);

// Legacy Question routes
router.post('/questions', QuizController.addQuestion);
router.get('/quizzes/:id/questions', QuizController.getQuestions);
router.put('/questions/:id', QuizController.updateQuestion);
router.delete('/questions/:id', QuizController.deleteQuestion);

// Legacy AI routes (ollama prefix)
router.post('/ollama/generate', AIController.generateQuiz);
router.post('/ollama/chat', AIController.chat);

export default router;
