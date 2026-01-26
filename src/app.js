import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import config from './config/config.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { createLogger } from './utils/logger.js';

const log = createLogger('app');

const app = express();

// CORS configuration for production and development
const allowedOrigins = [
  config.FRONTEND_URL, // Production frontend
  'http://localhost:5173', // Local development
  'http://localhost:3000' // Alternative local port
].filter(Boolean); // Remove any undefined values

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview deployments (*.vercel.app)
    if (origin && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      log.warn('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: config.MAX_FILE_SIZE }));
app.use(bodyParser.urlencoded({ limit: config.MAX_FILE_SIZE, extended: true }));

// Health check endpoint (for monitoring services)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api', routes);

// Temporary migration route
import migrationRoutes from './routes/migrationRoutes.js';
app.use('/api/migrate', migrationRoutes);

// Legacy routes for backward compatibility
import legacyRoutes from './routes/legacyRoutes.js';
app.use('/api', legacyRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
