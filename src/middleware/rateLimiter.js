import rateLimit from 'express-rate-limit';
import { createLogger } from '../utils/logger.js';

const log = createLogger('rate-limit');

/**
 * Rate limiter for forgot password endpoint
 * Limits to 3 requests per 15 minutes per IP
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many password reset requests. Please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    log.warn(`[SECURITY] Rate limit exceeded for forgot-password from IP: ${ipAddress}`);
    
    res.status(429).json({
      error: 'Too many password reset requests from this IP. Please try again after 15 minutes.',
      retryAfter: '15 minutes'
    });
  },
  // Skip successful requests from count (optional - more lenient)
  skipSuccessfulRequests: false,
  // Skip failed requests from count (optional)
  skipFailedRequests: false
});

/**
 * Rate limiter for reset password endpoint
 * Limits to 5 attempts per 15 minutes per IP
 */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many password reset attempts. Please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    log.warn(`[SECURITY] Rate limit exceeded for reset-password from IP: ${ipAddress}`);
    
    res.status(429).json({
      error: 'Too many password reset attempts from this IP. Please try again after 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * General auth rate limiter for login/register
 * Limits to 10 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication requests. Please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    log.warn(`[SECURITY] Rate limit exceeded for auth endpoint from IP: ${ipAddress}`);
    
    res.status(429).json({
      error: 'Too many authentication requests from this IP. Please try again after 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Admin endpoints rate limiter
 * Limits to 30 requests per 15 minutes (stricter than public endpoints)
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    success: false,
    error: 'Too many admin requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  handler: (req, res) => {
    const userInfo = req.user ? `User ${req.user.userId} (${req.user.email})` : 'Unauthenticated user';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    log.warn(`[RATE_LIMIT] ${userInfo} exceeded admin rate limit from IP ${ipAddress}`);
    
    res.status(429).json({
      success: false,
      error: 'Too many admin requests from this IP. Please try again after 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});
