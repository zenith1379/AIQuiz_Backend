import SystemSettings from '../models/SystemSettings.js';
import AuditLog from '../models/AuditLog.js';

/**
 * SettingsService - Business logic for system settings management
 * Features:
 * - Get all settings with admin info
 * - Update settings with validation
 * - Audit logging for changes
 */
class SettingsService {
  /**
   * Get all system settings
   * @returns {Array} Array of settings with metadata
   */
  static async getAllSettings() {
    try {
      const settings = await SystemSettings.getAll();
      
      // Parse values to proper types
      return settings.map(setting => ({
        key: setting.setting_key,
        value: SystemSettings.parseValue(setting),
        rawValue: setting.setting_value,
        type: setting.setting_type,
        description: setting.description,
        updatedBy: setting.updated_by,
        updatedByUsername: setting.updated_by_username,
        updatedAt: setting.updated_at
      }));
    } catch (error) {
      console.error('Error in SettingsService.getAllSettings:', error);
      throw new Error('Failed to retrieve system settings');
    }
  }

  /**
   * Update multiple settings
   * @param {Object} updates - Object with key-value pairs {setting_key: new_value}
   * @param {number} adminId - Admin user ID
   * @param {string} ipAddress - Admin IP address
   * @returns {Object} Update results
   */
  static async updateSettings(updates, adminId, ipAddress) {
    try {
      const results = {
        success: [],
        failed: []
      };

      // Define valid setting keys (whitelist)
      const validKeys = [
        'ai_model_name',
        'ai_temperature',
        'ai_max_tokens',
        'rate_limit_quiz_generation',
        'rate_limit_admin_actions',
        'default_question_count',
        'maintenance_mode'
      ];

      for (const [key, value] of Object.entries(updates)) {
        try {
          // Validate key is in whitelist
          if (!validKeys.includes(key)) {
            results.failed.push({
              key,
              reason: 'Invalid setting key'
            });
            continue;
          }

          // Get current setting to check type
          const currentSetting = await SystemSettings.getByKey(key);
          
          if (!currentSetting) {
            results.failed.push({
              key,
              reason: 'Setting not found'
            });
            continue;
          }

          // Validate value type
          const stringValue = String(value);
          if (!SystemSettings.validateValue(currentSetting.setting_type, stringValue)) {
            results.failed.push({
              key,
              reason: `Invalid value for type ${currentSetting.setting_type}`
            });
            continue;
          }

          // Update setting
          const updated = await SystemSettings.update(key, stringValue, adminId);
          
          if (updated) {
            // Create audit log
            await AuditLog.create(
              null,
              adminId,
              'SETTING_UPDATED',
              currentSetting.setting_value,
              stringValue,
              ipAddress
            );

            results.success.push({
              key,
              oldValue: currentSetting.setting_value,
              newValue: stringValue
            });
          } else {
            results.failed.push({
              key,
              reason: 'Update failed'
            });
          }
        } catch (error) {
          console.error(`Error updating setting ${key}:`, error);
          results.failed.push({
            key,
            reason: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in SettingsService.updateSettings:', error);
      throw new Error('Failed to update system settings');
    }
  }

  /**
   * Get setting value by key (parsed to proper type)
   * @param {string} key - Setting key
   * @returns {*} Parsed value or null
   */
  static async getSetting(key) {
    try {
      const setting = await SystemSettings.getByKey(key);
      return SystemSettings.parseValue(setting);
    } catch (error) {
      console.error('Error in SettingsService.getSetting:', error);
      throw new Error(`Failed to retrieve setting: ${key}`);
    }
  }
}

export default SettingsService;
