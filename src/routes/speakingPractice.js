// Speaking Practice Routes
import express from 'express';
import speakingPracticeController from '../controllers/speakingPracticeController.js';
import { verifyToken as authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/speaking');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.webm';
        cb(null, `speaking-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'audio/webm',
            'audio/wav',
            'audio/mp3',
            'audio/mpeg',
            'audio/ogg',
            'audio/mp4',
            'audio/x-m4a'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

// Public routes
router.get('/topics', speakingPracticeController.getTopics);
router.get('/topics/random', speakingPracticeController.getRandomTopic);

// AI Voice Assistant chat endpoint (public - no auth required)
router.post('/chat', speakingPracticeController.aiChat);

// Protected routes (require authentication)
router.use(authenticateToken);

// Submit speech for full analysis
router.post('/submit', upload.single('audio'), speakingPracticeController.submitSpeech);

// Save recording without analysis
router.post('/save', upload.single('audio'), speakingPracticeController.saveRecording);

// Quick conversation (text-based, no audio)
router.post('/conversation', speakingPracticeController.quickConversation);

// Generate sample answer for specific question
router.post('/generate-sample', speakingPracticeController.generateSampleForQuestion);

// Get practice history
router.get('/history', speakingPracticeController.getPracticeHistory);

// Get session details
router.get('/sessions/:id', speakingPracticeController.getSessionDetail);

// Delete session
router.delete('/sessions/:id', speakingPracticeController.deleteSession);

export default router;
