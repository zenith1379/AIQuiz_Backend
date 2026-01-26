import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createLogger } from '../utils/logger.js';

dotenv.config();

const log = createLogger('db');

// Production requires DB_PASSWORD to be set in environment
if (process.env.NODE_ENV === 'production' && !process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD must be set in production environment!');
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'root'),
  database: process.env.DB_NAME || 'quiz_generator',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000 // 60 seconds timeout
};

// Add SSL for production (Aiven requires SSL)
if (process.env.NODE_ENV === 'production') {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    connection.release();
  })
  .catch(err => {
    log.error('Database connection failed:', err.message);
  });

export default pool;
