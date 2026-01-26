import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import quizRoutes from './quizRoutes.js';
import questionRoutes from './questionRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';
import weatherRoutes from './weatherRoutes.js';
import todoRoutes from './todoRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import speakingPracticeRoutes from './speakingPractice.js';
import checklistRoutes from './checklist.js';
import documentRoutes from './documentRoutes.js';
import sessionRoutes from './sessionRoutes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/quizzes', quizRoutes);
router.use('/questions', questionRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/weather', weatherRoutes);
router.use('/todos', todoRoutes);
router.use('/calendar', calendarRoutes);
router.use('/checklists', checklistRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/speaking-practice', speakingPracticeRoutes);
router.use('/documents', documentRoutes);
router.use('/sessions', sessionRoutes);

export default router;
