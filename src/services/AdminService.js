import pool from '../config/database.js';
import { AuditLog } from '../models/index.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('admin');

export class AdminService {
  /**
   * Get all users with pagination, filters, and quiz statistics
   */
  static async getUsers(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    let conditions = [];
    let countParams = [];
    let queryParams = [];

    // Search by email or username
    if (filters.search) {
      conditions.push('(u.email LIKE ? OR u.username LIKE ?)');
      countParams.push(`%${filters.search}%`, `%${filters.search}%`);
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Filter by role
    if (filters.role) {
      conditions.push('u.role = ?');
      countParams.push(filters.role);
      queryParams.push(filters.role);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Get paginated users with quiz count (avoid N+1 query problem)
    // LIMIT/OFFSET compatibility
    const query = `
      SELECT 
        u.id as user_id,
        u.id as id,
        u.username, 
        u.email, 
        u.role, 
        u.dob, 
        u.created_at,
        COUNT(q.id) as quiz_count,
        MAX(q.created_at) as last_activity
      FROM users u
      LEFT JOIN quizzes q ON u.id = q.user_id
      ${whereClause}
      GROUP BY u.id, u.username, u.email, u.role, u.dob, u.created_at
      ORDER BY u.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    
    const [rows] = await pool.execute(query, queryParams);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update user role (only super_admin can do this)
   */
  static async updateUserRole(userId, newRole, adminId, ipAddress) {
    // Get current user data
    const [users] = await pool.execute(
      'SELECT id as user_id, email, username, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    const oldRole = user.role;

    // Validate new role (explicit whitelist)
    const VALID_ROLES = ['student', 'teacher', 'admin', 'super_admin', 'inactive'];
    if (!VALID_ROLES.includes(newRole)) {
      throw new Error(`Invalid role '${newRole}'. Allowed values: ${VALID_ROLES.join(', ')}`);
    }

    // Prevent changing own role
    if (userId === adminId) {
      throw new Error('Cannot change your own role');
    }

    // Update role
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [newRole, userId]
    );

    // Log to audit
    await AuditLog.create(
      userId,
      adminId,
      'ROLE_CHANGE',
      oldRole,
      newRole,
      ipAddress
    );

    log.info(`[ADMIN] Role changed for user ${user.email}: ${oldRole} → ${newRole} by admin ${adminId}`);

    return {
      success: true,
      user: {
        userId: user.user_id,
        email: user.email,
        username: user.username,
        oldRole,
        newRole
      }
    };
  }

  /**
   * Delete/deactivate user (soft delete)
   */
  static async deleteUser(userId, adminId, ipAddress) {
    // Get user info
    const [users] = await pool.execute(
      'SELECT id as user_id, email, username, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Prevent deleting super_admin
    if (user.role === 'super_admin') {
      throw new Error('Cannot delete super admin');
    }

    // Prevent self-deletion
    if (userId === adminId) {
      throw new Error('Cannot delete your own account');
    }

    // Soft delete: update role to inactive
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      ['inactive', userId]
    );

    // Log to audit
    await AuditLog.create(
      userId,
      adminId,
      'USER_DELETED',
      user.role,
      'inactive',
      ipAddress
    );

    log.info(`[ADMIN] User deleted: ${user.email} by admin ${adminId}`);

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  /**
   * Get statistics for admin dashboard
   */
  static async getStatistics() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as teachers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'super_admin' THEN 1 ELSE 0 END) as superAdmins,
        SUM(CASE WHEN role = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM users
    `);

    const [quizStats] = await pool.execute(`
      SELECT COUNT(*) as totalQuizzes FROM quizzes
    `);

    const [questionStats] = await pool.execute(`
      SELECT COUNT(*) as totalQuestions FROM questions
    `);

    return {
      users: stats[0],
      quizzes: quizStats[0].totalQuizzes,
      questions: questionStats[0].totalQuestions
    };
  }

  /**
   * Get audit logs with pagination
   */
  static async getAuditLogs(page = 1, limit = 50, filters = {}) {
    return await AuditLog.findAll(page, limit, filters);
  }

  /**
   * Get user details with audit history
   */
  static async getUserDetails(userId) {
    const [users] = await pool.execute(
      `SELECT id as user_id, username, email, role, dob, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    const auditLogs = await AuditLog.findByUserId(userId, 20);

    return {
      user,
      auditHistory: auditLogs
    };
  }
}

export default AdminService;
