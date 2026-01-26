import db from '../config/database.js';

/**
 * SystemSettings Model - Manages system configuration
 * Features:
 * - Key-value storage with type support
 * - Audit tracking with updated_by
 * - Type validation (string, number, boolean, json)
 */
class SystemSettings {
  /**
   * Get a single setting by key
   * @param {string} key - Setting key
   * @returns {Object|null} Setting object or null
   */
  static async getByKey(key) {
    try {
      const [rows] = await db.execute(
        `SELECT setting_key, setting_value, setting_type, description, 
                updated_by, updated_at
         FROM system_settings
         WHERE setting_key = ?`,
        [key]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in SystemSettings.getByKey:', error);
      throw error;
    }
  }

  /**
   * Get all settings
   * @returns {Array} Array of all settings
   */
  static async getAll() {
    try {
      const [rows] = await db.execute(
        `SELECT s.setting_key, s.setting_value, s.setting_type, s.description,
                s.updated_by, s.updated_at, u.username as updated_by_username
         FROM system_settings s
         LEFT JOIN users u ON s.updated_by = u.user_id
         ORDER BY s.setting_key`
      );
      return rows;
    } catch (error) {
      console.error('Error in SystemSettings.getAll:', error);
      throw error;
    }
  }

  /**
   * Update a setting value
   * @param {string} key - Setting key
   * @param {string} value - New value (as string)
   * @param {number} adminId - Admin user ID
   * @returns {boolean} Success status
   */
  static async update(key, value, adminId) {
    try {
      const [result] = await db.execute(
        `UPDATE system_settings
         SET setting_value = ?, updated_by = ?
         WHERE setting_key = ?`,
        [value, adminId, key]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in SystemSettings.update:', error);
      throw error;
    }
  }

  /**
   * Validate setting value based on type
   * @param {string} type - Setting type (string, number, boolean, json)
   * @param {string} value - Value to validate
   * @returns {boolean} Is valid
   */
  static validateValue(type, value) {
    switch (type) {
      case 'number':
        return !isNaN(parseFloat(value)) && isFinite(value);
      case 'boolean':
        return value === 'true' || value === 'false';
      case 'json':
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      case 'string':
      default:
        return typeof value === 'string';
    }
  }

  /**
   * Get parsed setting value (converts based on type)
   * @param {Object} setting - Setting object with value and type
   * @returns {*} Parsed value
   */
  static parseValue(setting) {
    if (!setting) return null;
    
    const { setting_value, setting_type } = setting;
    
    switch (setting_type) {
      case 'number':
        return parseFloat(setting_value);
      case 'boolean':
        return setting_value === 'true';
      case 'json':
        try {
          return JSON.parse(setting_value);
        } catch {
          return setting_value;
        }
      case 'string':
      default:
        return setting_value;
    }
  }
}

export default SystemSettings;
