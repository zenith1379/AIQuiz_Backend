import express from 'express';
import { AdminController } from '../controllers/index.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All admin routes require authentication and rate limiting
router.use(verifyToken);
router.use(adminLimiter);

// Dashboard statistics
router.get('/statistics', requireRole(['admin', 'super_admin']), AdminController.getStatistics);

// Users list
router.get('/users', requireRole(['admin', 'super_admin']), AdminController.getUsers);

// User details with audit history
router.get('/users/:id', requireRole(['admin', 'super_admin']), AdminController.getUserDetails);

// User role update
router.put('/users/:id/role', requireRole(['super_admin']), AdminController.updateUserRole);

// User deletion
router.delete('/users/:id', requireRole(['super_admin']), AdminController.deleteUser);

// Audit logs
router.get('/audit-logs', requireRole(['admin', 'super_admin']), AdminController.getAuditLogs);

// System settings
router.get('/settings', requireRole(['super_admin']), AdminController.getSettings);

// Settings update
router.patch('/settings', requireRole(['super_admin']), AdminController.updateSettings);

// Pending quizzes for approval
router.get('/quizzes/pending', requireRole(['admin', 'super_admin']), AdminController.getPendingQuizzes);

// All quizzes
router.get('/quizzes/all', requireRole(['admin', 'super_admin']), AdminController.getAllQuizzes);

// PUT /admin/quizzes/:id/approve - Approve a quiz (admin + super_admin)
router.put('/quizzes/:id/approve', requireRole(['admin', 'super_admin']), AdminController.approveQuiz);

// PUT /admin/quizzes/:id/reject - Reject a quiz (admin + super_admin)
router.put('/quizzes/:id/reject', requireRole(['admin', 'super_admin']), AdminController.rejectQuiz);

// AI HITL feedback + training batches (admin + super_admin)
router.get('/ai/feedback', requireRole(['admin', 'super_admin']), AdminController.getAIFeedbackQueue);
router.delete('/ai/feedback/:id', requireRole(['admin', 'super_admin']), AdminController.deleteFeedback);
router.post('/ai/training-batches', requireRole(['admin', 'super_admin']), AdminController.createTrainingBatch);
router.get('/ai/training-batches', requireRole(['admin', 'super_admin']), AdminController.getTrainingBatches);
router.post('/ai/training-batches/:id/approve', requireRole(['admin', 'super_admin']), AdminController.approveTrainingBatch);
router.get('/ai/training-batches/:id/export', requireRole(['admin', 'super_admin']), AdminController.exportTrainingBatch);

export default router;
