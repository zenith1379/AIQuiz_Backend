import SettingsService from '../services/SettingsService.js';

/**
 * SettingsController - HTTP handlers for system settings management
 * Routes:
 * - GET /admin/settings - Get all settings (super_admin only)
 * - PATCH /admin/settings - Update settings (super_admin only)
 */
class SettingsController {
  /**
   * Get all system settings
   * GET /admin/settings
   * @returns {200} Settings array with metadata
   * @returns {500} Server error
   */
  static async getSettings(req, res, next) {
    try {
      const settings = await SettingsService.getAllSettings();
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error in SettingsController.getSettings:', error);
      next(error);
    }
  }

  /**
   * Update system settings
   * PATCH /admin/settings
   * @body {Object} settings - Key-value pairs to update
   * @returns {200} Update results with success/failed arrays
   * @returns {400} Invalid request body
   * @returns {500} Server error
   */
  static async updateSettings(req, res, next) {
    try {
      const { settings } = req.body;

      // Validate request body
      if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body. Expected { settings: { key: value, ... } }'
        });
      }

      const adminId = req.user.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const results = await SettingsService.updateSettings(settings, adminId, ipAddress);

      // Determine response status based on results
      const allFailed = results.success.length === 0 && results.failed.length > 0;
      const someSucceeded = results.success.length > 0;

      res.status(allFailed ? 400 : 200).json({
        success: someSucceeded,
        message: someSucceeded 
          ? `Successfully updated ${results.success.length} setting(s)` 
          : 'Failed to update all settings',
        data: {
          updated: results.success,
          failed: results.failed
        }
      });
    } catch (error) {
      console.error('Error in SettingsController.updateSettings:', error);
      next(error);
    }
  }
}

export default SettingsController;
