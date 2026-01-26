import { AuthService } from '../services/index.js';
import { generateToken } from '../middleware/auth.js';

export class AuthController {
  // Register
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const user = await AuthService.register({
        username,
        email,
        password
      });

      res.status(201).json({
        message: 'User registered successfully',
        userId: user.user_id
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await AuthService.login({ email, password });

      const token = generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role || 'student'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  static async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.userId;
      const { UserService } = await import('../services/index.js');
      
      const user = await UserService.getById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.userId;
      const { oldPassword, newPassword } = req.body;

      await AuthService.changePassword(userId, oldPassword, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Forgot password - Request reset token
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Get client IP address
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

      // Request password reset
      const result = await AuthService.requestPasswordReset(email.trim().toLowerCase(), ipAddress);

      // Always return 200 with generic message (security)
      res.status(200).json(result);
    } catch (error) {
      // Log error but don't expose details to client
      console.error('[ERROR] Forgot password error:', error);
      
      // Return generic success message even on error (security)
      res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link shortly.'
      });
    }
  }

  // Reset password with token
  static async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      // Validate inputs
      if (!token || !token.trim()) {
        return res.status(400).json({ error: 'Reset token is required' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Get client IP address
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

      // Reset password
      const result = await AuthService.resetPassword(token.trim(), password, ipAddress);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
