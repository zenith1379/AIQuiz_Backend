import express from 'express';
import { CalendarController } from '../controllers/CalendarController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Authentication required
router.use(verifyToken);

// GET /api/calendar/events
router.get('/events', CalendarController.getAllEvents);

// POST /api/calendar/events
router.post('/events', CalendarController.createEvent);

// PUT /api/calendar/events/:id
router.put('/events/:id', CalendarController.updateEvent);

// DELETE /api/calendar/events/:id
router.delete('/events/:id', CalendarController.deleteEvent);

export default router;
