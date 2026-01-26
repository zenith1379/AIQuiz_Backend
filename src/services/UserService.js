import db from '../config/database.js';
import { User } from '../models/index.js';

export class UserService {
  // Get all users
  static async getAll() {
    const [rows] = await db.query('SELECT id as user_id, username, email, dob, role, avatar, created_at FROM users ORDER BY created_at DESC');
    return rows.map(row => User.fromDatabase(row));
  }

  // Get user by ID
  static async getById(userId) {
    const [rows] = await db.query(
      'SELECT id as user_id, username, email, dob, role, avatar, created_at FROM users WHERE id = ?',
      [userId]
    );
    return rows.length > 0 ? User.fromDatabase(rows[0]) : null;
  }

  // Get user by email
  static async getByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? User.fromDatabase(rows[0]) : null;
  }

  // Create new user
  static async create(userData) {
    const user = new User(userData);
    
    if (!user.isValid()) {
      throw new Error('Invalid user data');
    }

    // Only insert columns that exist in the database
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [user.username, user.email, user.password, user.role || 'student']
    );

    user.user_id = result.insertId;
    return user;
  }

  // Update user
  static async update(userId, userData) {
    const updates = [];
    const values = [];

    if (userData.username) {
      updates.push('username = ?');
      values.push(userData.username);
    }
    if (userData.email) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    if (userData.password) {
      updates.push('password = ?');
      values.push(userData.password);
    }
    if (userData.dob) {
      updates.push('dob = ?');
      values.push(userData.dob);
    }
    if (userData.role) {
      updates.push('role = ?');
      values.push(userData.role);
    }
    if (userData.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(userData.avatar);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await this.getById(userId);
  }

  // Delete user
  static async delete(userId) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
    return result.affectedRows > 0;
  }

  // Get users by role
  static async getByRole(role) {
    const [rows] = await db.query(
      'SELECT id as user_id, username, email, dob, role, avatar, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      [role]
    );
    return rows.map(row => User.fromDatabase(row));
  }

  // Get user stats
  static async getStats() {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as total_teachers
      FROM users
    `);
    return stats[0];
  }
}

export default UserService;
