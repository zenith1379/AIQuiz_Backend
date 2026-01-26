// Checklist Routes
import express from 'express';
import checklistController from '../controllers/checklistController.js';
import { verifyToken as authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all checklists
router.get('/', checklistController.getChecklists);

// Get statistics
router.get('/stats', checklistController.getStatistics);

// Create checklist
router.post('/', checklistController.createChecklist);

// Update checklist
router.put('/:id', checklistController.updateChecklist);

// Delete checklist
router.delete('/:id', checklistController.deleteChecklist);

export default router;
