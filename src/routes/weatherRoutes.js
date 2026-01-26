import express from 'express';
import { WeatherController } from '../controllers/WeatherController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/weather/by-coords?lat=<lat>&lon=<lon>
// @desc    Get current weather for a specific location by coordinates
// @access  Public (no authentication required)
router.get('/by-coords', WeatherController.getWeatherData);

// Legacy endpoint for backward compatibility
router.get('/', WeatherController.getWeatherData);

export default router;
