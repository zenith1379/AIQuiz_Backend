import dotenv from 'dotenv';

dotenv.config();

const requireInProduction = (name, fallback = undefined) => {
  const value = process.env[name];
  if (value !== undefined && value !== null && String(value).length > 0) {
    return value;
  }
  if ((process.env.NODE_ENV || 'development') === 'production') {
    throw new Error(
      `${name} is required in production! ` +
      `Set it as an environment variable in your hosting provider (Render: Service → Environment → Add ${name})`
    );
  }
  return fallback;
};

export default {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: requireInProduction('DB_PASSWORD'),
  DB_NAME: process.env.DB_NAME || 'quiz_generator',
  DB_PORT: process.env.DB_PORT || 3306,

  // JWT
  JWT_SECRET: requireInProduction('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Ollama AI
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'gemma3:1b',

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // File Upload
  MAX_FILE_SIZE: '50mb',  

  // Email (SMTP Gmail)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: requireInProduction('SMTP_USER', ''),
  SMTP_PASS: requireInProduction('SMTP_PASS', ''),
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@quizapp.com',

  // Password Reset
  RESET_PASSWORD_TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes in milliseconds
  RESET_PASSWORD_URL: process.env.RESET_PASSWORD_URL || 'http://localhost:5173/reset-password',

  // Weather Widget
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',

  // PayPal
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || '',
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || '',
  PAYPAL_MODE: process.env.PAYPAL_MODE || 'sandbox',

  // Google Cloud & Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};
