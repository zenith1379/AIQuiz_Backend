import nodemailer from 'nodemailer';
import config from '../config/config.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('email');

export class EmailService {
  static transporter = null;

  /**
   * Check if SMTP is configured
   */
  static isConfigured() {
    return !!(config.SMTP_USER && config.SMTP_PASS);
  }

  /**
   * Initialize email transporter (Gmail SMTP)
   */
  static getTransporter() {
    if (!this.transporter) {
      // Check if credentials are configured
      if (!this.isConfigured()) {
        log.warn('SMTP credentials not configured. Email sending disabled.');
        return null;
      }

      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE, // true for 465, false for other ports
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS
        }
      });
    }
    return this.transporter;
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email, token, userName = 'User') {
    // Check if SMTP is configured
    if (!this.isConfigured()) {
      log.warn('SMTP not configured. Skipping email send (DEV mode).');
      log.debug(`[DEV MODE] Reset token for ${email}: ${token}`);
      log.debug(`Reset URL: ${config.RESET_PASSWORD_URL}?token=${token}`);
      return { success: true, devMode: true, token };
    }

    const resetUrl = `${config.RESET_PASSWORD_URL}?token=${token}`;
    
    const mailOptions = {
      from: `"Quiz App" <${config.EMAIL_FROM}>`,
      to: email,
      subject: 'Reset Your Password - Quiz App',
      html: this.getPasswordResetTemplate(userName, resetUrl)
    };

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail(mailOptions);
      
      log.info(`Password reset email sent to ${email}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      log.error('Error sending email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * HTML template for password reset email
   */
  static getPasswordResetTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #5568d3; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>We received a request to reset your password for your Quiz App account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in <strong>15 minutes</strong></li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you access the link above</li>
              </ul>
            </div>
            
            <p>For security reasons, we can't reset your password without your confirmation.</p>
            
            <p>Best regards,<br>
            <strong>Quiz App Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Quiz App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Verify SMTP connection
   */
  static async verifyConnection() {
    if (!this.isConfigured()) {
      log.info('SMTP not configured. Running in DEV mode.');
      return false;
    }

    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      log.info('SMTP connection verified');
      return true;
    } catch (error) {
      log.error('SMTP connection failed:', error.message);
      return false;
    }
  }
}

export default EmailService;
