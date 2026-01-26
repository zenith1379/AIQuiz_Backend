import express from 'express';
import { UserController } from '../controllers/index.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/', UserController.getAll);
router.get('/stats', UserController.getStats);
router.get('/role/:role', UserController.getByRole);
router.get('/:id', UserController.getById);
router.put('/:id', UserController.update);
router.delete('/:id', checkRole('admin'), UserController.delete);

export default router;
