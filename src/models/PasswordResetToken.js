import pool from '../config/database.js';

export class PasswordResetToken {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.token = data.token;
    this.expiresAt = data.expiresAt;
    this.used = data.used || false;
    this.createdAt = data.createdAt;
  }

  /**
   * Create a new password reset token
   */
  static async create(userId, token, expiresAt) {
    const query = `
      INSERT INTO password_reset_tokens (userId, token, expiresAt)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [userId, token, expiresAt]);
    
    return new PasswordResetToken({
      id: result.insertId,
      userId,
      token,
      expiresAt,
      used: false
    });
  }

  /**
   * Find a valid (unused and not expired) token
   */
  static async findByToken(token) {
    const query = `
      SELECT * FROM password_reset_tokens
      WHERE token = ? AND used = FALSE AND expiresAt > NOW()
      LIMIT 1
    `;
    
    const [rows] = await pool.execute(query, [token]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return new PasswordResetToken(rows[0]);
  }

  /**
   * Mark token as used
   */
  static async markAsUsed(token) {
    const query = `
      UPDATE password_reset_tokens
      SET used = TRUE
      WHERE token = ?
    `;
    
    await pool.execute(query, [token]);
  }

  /**
   * Delete expired tokens (cleanup)
   */
  static async deleteExpired() {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE expiresAt < NOW()
    `;
    
    const [result] = await pool.execute(query);
    return result.affectedRows;
  }

  /**
   * Delete all tokens for a user (e.g., after successful password change)
   */
  static async deleteByUserId(userId) {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE userId = ?
    `;
    
    await pool.execute(query, [userId]);
  }

  /**
   * Check if token exists and is valid
   */
  static async isValidToken(token) {
    const resetToken = await this.findByToken(token);
    return resetToken !== null;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      token: this.token,
      expiresAt: this.expiresAt,
      used: this.used,
      createdAt: this.createdAt
    };
  }
}

export default PasswordResetToken;
