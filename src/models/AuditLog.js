import pool from '../config/database.js';

export class AuditLog {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.adminId = data.adminId;
    this.action = data.action;
    this.oldValue = data.oldValue;
    this.newValue = data.newValue;
    this.ipAddress = data.ipAddress;
    this.createdAt = data.createdAt;
  }

  /**
   * Create a new audit log entry
   */
  static async create(userId, adminId, action, oldValue, newValue, ipAddress = null) {
    const query = `
      INSERT INTO audit_logs (userId, adminId, action, oldValue, newValue, ipAddress)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      userId,
      adminId,
      action,
      oldValue,
      newValue,
      ipAddress
    ]);
    
    return new AuditLog({
      id: result.insertId,
      userId,
      adminId,
      action,
      oldValue,
      newValue,
      ipAddress
    });
  }

  /**
   * Find all audit logs for a specific user
   */
  static async findByUserId(userId, limit = 50) {
    const query = `
      SELECT al.*, 
             u1.username as userName, u1.email as userEmail,
             u2.username as adminName, u2.email as adminEmail
      FROM audit_logs al
      LEFT JOIN users u1 ON al.userId = u1.user_id
      LEFT JOIN users u2 ON al.adminId = u2.user_id
      WHERE al.userId = ?
      ORDER BY al.createdAt DESC
      LIMIT ${parseInt(limit)}
    `;
    
    const [rows] = await pool.execute(query, [userId]);
    return rows.map(row => new AuditLog(row));
  }

  /**
   * Find all audit logs with pagination
   */
  static async findAll(page = 1, limit = 50, filters = {}) {
    const offset = (page - 1) * limit;
    let conditions = [];
    let countParams = [];
    let queryParams = [];

    if (filters.userId) {
      conditions.push('al.userId = ?');
      countParams.push(filters.userId);
      queryParams.push(filters.userId);
    }

    if (filters.adminId) {
      conditions.push('al.adminId = ?');
      countParams.push(filters.adminId);
      queryParams.push(filters.adminId);
    }

    if (filters.action) {
      conditions.push('al.action = ?');
      countParams.push(filters.action);
      queryParams.push(filters.action);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    // LIMIT/OFFSET compatibility
    const query = `
      SELECT al.*, 
             u1.username as userName, u1.email as userEmail,
             u2.username as adminName, u2.email as adminEmail
      FROM audit_logs al
      LEFT JOIN users u1 ON al.userId = u1.user_id
      LEFT JOIN users u2 ON al.adminId = u2.user_id
      ${whereClause}
      ORDER BY al.createdAt DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    
    const [rows] = await pool.execute(query, queryParams);

    return {
      data: rows.map(row => new AuditLog(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get recent logs (last 24 hours)
   */
  static async getRecent(hours = 24, limit = 100) {
    const query = `
      SELECT al.*, 
             u1.username as userName, u1.email as userEmail,
             u2.username as adminName, u2.email as adminEmail
      FROM audit_logs al
      LEFT JOIN users u1 ON al.userId = u1.user_id
      LEFT JOIN users u2 ON al.adminId = u2.user_id
      WHERE al.createdAt >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY al.createdAt DESC
      LIMIT ${parseInt(limit)}
    `;
    
    const [rows] = await pool.execute(query, [hours]);
    return rows.map(row => new AuditLog(row));
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      adminId: this.adminId,
      action: this.action,
      oldValue: this.oldValue,
      newValue: this.newValue,
      ipAddress: this.ipAddress,
      createdAt: this.createdAt,
      userName: this.userName,
      userEmail: this.userEmail,
      adminName: this.adminName,
      adminEmail: this.adminEmail
    };
  }
}

export default AuditLog;
