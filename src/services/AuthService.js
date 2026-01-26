import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './UserService.js';
import { User, PasswordResetToken } from '../models/index.js';
import { EmailService } from './EmailService.js';
import config from '../config/config.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('auth');

export class AuthService {
  // Register new user
  static async register(userData) {
    // Check if email already exists
    const existingUser = await UserService.getByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user with only supported fields
    const user = await UserService.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword
    });

    return user;
  }

  // Login user
  static async login(credentials) {
    const { email, password } = credentials;

    // Get user by email
    const user = await UserService.getByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await UserService.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user with password
    const userWithPassword = await UserService.getByEmail(user.email);

    // Verify old password
    const match = await bcrypt.compare(oldPassword, userWithPassword.password);
    if (!match) {
      throw new Error('Incorrect old password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await UserService.update(userId, { password: hashedPassword });

    return true;
  }

  // Request password reset (forgot password)
  static async requestPasswordReset(email, ipAddress = 'unknown') {
    log.info(`[SECURITY] Password reset requested for email: ${email} from IP: ${ipAddress}`);
    
    // Check if user exists (but don't reveal this information)
    const user = await UserService.getByEmail(email);
    
    if (user) {
      // Generate UUID token
      const token = uuidv4();
      
      // Calculate expiry time (15 minutes from now)
      const expiresAt = new Date(Date.now() + config.RESET_PASSWORD_TOKEN_EXPIRY);
      
      // Save token to database
      await PasswordResetToken.create(user.user_id, token, expiresAt);
      
      // Send email with reset link
      try {
        await EmailService.sendPasswordResetEmail(user.email, token, user.username);
        log.info(`[SECURITY] Password reset email sent to: ${email}`);
      } catch (error) {
        log.error(`[SECURITY] Failed to send reset email to: ${email}`, error.message);
        // Don't throw error - we still return success to prevent email enumeration
      }
    } else {
      log.info(`[SECURITY] Password reset requested for non-existent email: ${email}`);
    }
    
    // Always return success message (security: don't reveal if email exists)
    return {
      success: true,
      message: 'If your email is registered, you will receive a password reset link shortly.'
    };
  }

  // Reset password with token
  static async resetPassword(token, newPassword, ipAddress = 'unknown') {
    log.info(`[SECURITY] Password reset attempt with token from IP: ${ipAddress}`);
    
    // Find valid token
    const resetToken = await PasswordResetToken.findByToken(token);
    
    if (!resetToken) {
      log.warn(`[SECURITY] Invalid or expired token used from IP: ${ipAddress}`);
      throw new Error('Invalid or expired reset token');
    }
    
    // Get user
    const user = await UserService.getById(resetToken.userId);
    if (!user) {
      log.warn(`[SECURITY] User not found for token from IP: ${ipAddress}`);
      throw new Error('User not found');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await UserService.update(user.user_id, { password: hashedPassword });
    
    // Mark token as used
    await PasswordResetToken.markAsUsed(token);
    
    // Delete all other tokens for this user
    await PasswordResetToken.deleteByUserId(user.user_id);
    
    log.info(`[SECURITY] Password reset successful for user ID: ${user.user_id} from IP: ${ipAddress}`);
    
    return {
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    };
  }

  // Cleanup expired tokens (can be called periodically)
  static async cleanupExpiredTokens() {
    const deletedCount = await PasswordResetToken.deleteExpired();
    log.info(`[CLEANUP] Deleted ${deletedCount} expired password reset tokens`);
    return deletedCount;
  }
}

export default AuthService;
