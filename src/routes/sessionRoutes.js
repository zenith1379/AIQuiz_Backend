import express from 'express';
import { SessionController } from '../controllers/SessionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new quiz session
router.post('/create', verifyToken, SessionController.createSession);

// Get session by code
router.get('/:code', SessionController.getSession);

// Join a session
router.post('/join', SessionController.joinSession);

// Start a session
router.post('/:session_id/start', verifyToken, SessionController.startSession);

// Get session participants
router.get('/:session_id/participants', SessionController.getParticipants);

// Remove participant (kick)
router.delete('/participants/:participant_id', verifyToken, SessionController.removeParticipant);

export default router;
