import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import config from './config/config.js';
import './config/database.js'; // Initialize database connection
import { initializeSocket } from './socket/socketHandler.js';
import { createLogger } from './utils/logger.js';

// Suppress Google Cloud metadata warnings when not running on GCP
process.env.SUPPRESS_GCLOUD_CREDS_WARNING = 'true';

const PORT = config.PORT;

const log = createLogger('server');

const server = http.createServer(app);

// Socket.IO with CORS for production and development
const allowedOrigins = [
  config.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow all Vercel preview deployments
      if (!origin || origin.includes('vercel.app') || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'], // Support both for mobile
  pingTimeout: 60000,
  pingInterval: 25000
});

initializeSocket(io);

server.listen(PORT, () => {
  log.info(`Server is running on http://localhost:${PORT}`);
  log.info('WebSocket server is listening');
  log.debug(`Ollama URL: ${config.OLLAMA_URL}`);
  log.debug(`Frontend URL: ${config.FRONTEND_URL}`);
});
