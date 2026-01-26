import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('security');

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role || 'student'
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    log.warn('Auth failed: No token provided', { path: req.path });
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'student'
    };
    next();
  } catch (error) {
    log.warn('Auth failed: Invalid token', { error: error.message, path: req.path });
    res.status(401).json({ error: 'Invalid or expired token.', details: error.message });
  }
};

export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

/**
 * Middleware for admin panel routes
 * Requires user to be admin or super_admin
 */
export const requireRole = (allowedRoles = ['admin', 'super_admin']) => {
  return (req, res, next) => {
    if (!req.user) {
      log.warn(`[SECURITY] Unauthorized admin access attempt from IP: ${req.ip}`);
      return res.status(401).json({ 
        error: 'Authentication required. Please login.' 
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      log.warn(`[SECURITY] Forbidden admin access attempt by ${req.user.email} (role: ${req.user.role}) from IP: ${req.ip}`);
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }

    log.info(`[SECURITY] Admin access granted to ${req.user.email} (role: ${req.user.role})`);
    next();
  };
};
