import { AdminService } from "../services/index.js";
import { AIFeedback, AITrainingBatch } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize.js';

export class AdminController {
  /**
   * GET /admin/users
   * List all users with pagination, search, and role filtering
   * Access: admin, super_admin
   */
  static async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {};

      if (req.query.search) filters.search = req.query.search;
      if (req.query.role) filters.role = req.query.role;

      const result = await AdminService.getUsers(page, limit, filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error getting users:", error);
      next(error);
    }
  }

  /**
   * PUT /admin/users/:id/role
   * Update user role (super_admin only)
   * Access: super_admin only
   */
  static async updateUserRole(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const { role: newRole } = req.body;

      if (!newRole) {
        return res.status(400).json({
          success: false,
          error: "Role is required",
        });
      }

      const adminId = req.user.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await AdminService.updateUserRole(
        userId,
        newRole,
        adminId,
        ipAddress
      );

      res.json({
        success: true,
        message: "Role updated successfully",
        ...result,
      });
    } catch (error) {
      console.error("Error updating user role:", error);

      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (
        error.message.includes("Invalid role") ||
        error.message.includes("Cannot change your own role")
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }

  /**
   * DELETE /admin/users/:id
   * Delete/deactivate user (soft delete)
   * Access: super_admin only
   */
  static async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const adminId = req.user.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await AdminService.deleteUser(userId, adminId, ipAddress);

      res.json(result);
    } catch (error) {
      console.error("Error deleting user:", error);

      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes("Cannot delete")) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }

  /**
   * GET /admin/statistics
   * Get dashboard statistics
   * Access: admin, super_admin
   */
  static async getStatistics(req, res, next) {
    try {
      const stats = await AdminService.getStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting statistics:", error);
      next(error);
    }
  }

  /**
   * GET /admin/audit-logs
   * Get audit logs with pagination
   * Access: admin, super_admin
   */
  static async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {};

      if (req.query.userId) filters.userId = parseInt(req.query.userId);
      if (req.query.adminId) filters.adminId = parseInt(req.query.adminId);
      if (req.query.action) filters.action = req.query.action;

      const result = await AdminService.getAuditLogs(page, limit, filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error getting audit logs:", error);
      next(error);
    }
  }

  /**
   * GET /admin/users/:id
   * Get user details with audit history
   * Access: admin, super_admin
   */
  static async getUserDetails(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const result = await AdminService.getUserDetails(userId);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error getting user details:", error);

      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }

  /**
   * GET /admin/settings
   * Get all system settings
   * Access: super_admin only
   */
  static async getSettings(req, res, next) {
    try {
      const { SettingsService } = await import("../services/index.js");
      const settings = await SettingsService.getAllSettings();

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Error getting settings:", error);
      next(error);
    }
  }

  /**
   * PATCH /admin/settings
   * Update system settings
   * Access: super_admin only
   */
  static async updateSettings(req, res, next) {
    try {
      const updates = req.body; // {ai_model_name: 'qwen3:8b', ai_temperature: '0.7', ...}
      const adminId = req.user.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const { SettingsService } = await import("../services/index.js");
      const results = await SettingsService.updateSettings(
        updates,
        adminId,
        ipAddress
      );

      res.json({
        success: true,
        message: `${results.success.length} settings updated successfully`,
        data: results,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      next(error);
    }
  }

  /**
   * GET /admin/quizzes/pending
   * Get all pending quizzes for approval
   * Access: admin, super_admin
   */
  static async getPendingQuizzes(req, res, next) {
    try {
      const { QuizService } = await import("../services/index.js");
      const quizzes = await QuizService.getQuizzesByApprovalStatus('pending');

      res.json({
        success: true,
        data: quizzes,
      });
    } catch (error) {
      console.error("Error getting pending quizzes:", error);
      next(error);
    }
  }

  /**
   * GET /admin/quizzes/all
   * Get all quizzes with full question details for statistics
   * Access: admin, super_admin
   */
  static async getAllQuizzes(req, res, next) {
    try {
      const { QuizService } = await import("../services/index.js");
      const quizzes = await QuizService.getAllQuizzesWithQuestions();

      res.json(quizzes);
    } catch (error) {
      console.error("Error getting all quizzes:", error);
      next(error);
    }
  }

  /**
   * PUT /admin/quizzes/:id/approve
   * Approve a quiz
   * Access: admin, super_admin
   */
  static async approveQuiz(req, res, next) {
    try {
      const quizId = parseInt(req.params.id);
      const adminId = req.user.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const { QuizService } = await import("../services/index.js");
      const result = await QuizService.approveQuiz(quizId, adminId);

      // Log action
      await AdminService.logAction({
        adminId,
        action: 'approve_quiz',
        targetType: 'quiz',
        targetId: quizId,
        ipAddress,
        details: result
      });

      res.json({
        success: true,
        message: 'Quiz approved successfully',
        data: result,
      });
    } catch (error) {
      console.error("Error approving quiz:", error);
      next(error);
    }
  }

  /**
   * PUT /admin/quizzes/:id/reject
   * Reject a quiz
   * Access: admin, super_admin
   */
  static async rejectQuiz(req, res, next) {
    try {
      const quizId = parseInt(req.params.id);
      const { reason } = req.body;
      const adminId = req.user.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const { QuizService } = await import("../services/index.js");
      const result = await QuizService.rejectQuiz(quizId, adminId, reason);

      // Log action
      await AdminService.logAction({
        adminId,
        action: 'reject_quiz',
        targetType: 'quiz',
        targetId: quizId,
        ipAddress,
        details: { reason, ...result }
      });

      res.json({
        success: true,
        message: 'Quiz rejected successfully',
        data: result,
      });
    } catch (error) {
      console.error("Error rejecting quiz:", error);
      next(error);
    }
  }

  /**
   * GET /admin/ai/feedback
   * List HITL feedback items for training curation
   * Query params: minRating, maxRating, source, type, onlyUnbatched (default true), limit, offset
   * Access: admin, super_admin
   */
  static async getAIFeedbackQueue(req, res, next) {
    try {
      const minRating = req.query.minRating !== undefined ? Number(req.query.minRating) : null;
      const maxRating = req.query.maxRating !== undefined ? Number(req.query.maxRating) : null;
      const feedbackType = req.query.type ? String(req.query.type) : null;
      const limit = Math.min(Number(req.query.limit) || 200, 500);
      const offset = Number(req.query.offset) || 0;

      if (minRating !== null && (!Number.isFinite(minRating) || minRating < 1 || minRating > 10)) {
        return res.status(400).json({ error: 'minRating must be 1..10' });
      }
      if (maxRating !== null && (!Number.isFinite(maxRating) || maxRating < 1 || maxRating > 10)) {
        return res.status(400).json({ error: 'maxRating must be 1..10' });
      }

      const where = {};

      if (minRating !== null) {
        where.rating = { [Op.gte]: minRating };
      }
      if (maxRating !== null) {
        where.rating = { ...where.rating, [Op.lte]: maxRating };
      }
      if (feedbackType) {
        where.feedbackType = feedbackType;
      }

      const items = await AIFeedback.findAll({
        where,
        attributes: ['id', 'userId', 'feedbackType', 'userInput', 'aiResponse', 'rating', 'comment', 'isUseful', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        raw: true
      });

      res.json(items);
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      res.json([]);
    }
  }

  /**
   * POST /admin/ai/training-batches
   * Create a draft batch from selected feedback IDs
   */
  static async createTrainingBatch(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const adminId = req.user?.userId || null;
      const { name, feedbackIds, feedbackType } = req.body || {};
      const ids = Array.isArray(feedbackIds) ? feedbackIds.map(x => Number(x)).filter(Number.isFinite) : [];

      if (!ids.length) {
        await transaction.rollback();
        return res.status(400).json({ error: 'feedbackIds must be a non-empty array' });
      }

      // Create batch
      const batch = await AITrainingBatch.create({
        batchName: name || `Batch ${new Date().toISOString()}`,
        feedbackType: feedbackType || 'general',
        status: 'pending',
        feedbackCount: ids.length,
        createdBy: adminId
      }, { transaction });

      await transaction.commit();

      res.status(201).json({ ok: true, batch_id: batch.id });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating training batch:', error);
      next(error);
    }
  }

  /**
   * GET /admin/ai/training-batches
   * List batches with item counts
   */
  static async getTrainingBatches(req, res, next) {
    try {
      const batches = await AITrainingBatch.findAll({
        attributes: ['id', 'batchName', 'feedbackType', 'status', 'feedbackCount', 'createdAt', 'processedAt'],
        order: [['createdAt', 'DESC']],
        limit: 200,
        raw: true
      });

      // Map to match expected format
      const formattedBatches = batches.map(b => ({
        batch_id: b.id,
        name: b.batchName,
        feedback_type: b.feedbackType,
        status: b.status,
        item_count: b.feedbackCount,
        created_at: b.createdAt,
        processed_at: b.processedAt
      }));

      res.json(formattedBatches);
    } catch (error) {
      console.error('Error getting training batches:', error);
      res.json([]);
    }
  }

  /**
   * POST /admin/ai/training-batches/:id/approve
   * Mark batch as approved
   */
  static async approveTrainingBatch(req, res, next) {
    try {
      const batchId = Number(req.params.id);
      if (!Number.isFinite(batchId)) {
        return res.status(400).json({ error: 'Invalid batch id' });
      }

      await AITrainingBatch.update(
        { 
          status: 'completed',
          processedAt: new Date()
        },
        { where: { id: batchId } }
      );

      res.json({ ok: true });
    } catch (error) {
      console.error('Error approving batch:', error);
      next(error);
    }
  }

  /**
   * DELETE /admin/ai/feedback/:id
   * Delete a feedback item
   */
  static async deleteFeedback(req, res, next) {
    try {
      const feedbackId = Number(req.params.id);
      if (!Number.isFinite(feedbackId)) {
        return res.status(400).json({ error: 'Invalid feedback id' });
      }

      const result = await AIFeedback.destroy({
        where: { id: feedbackId }
      });

      if (result === 0) {
        return res.status(404).json({ error: 'Feedback not found' });
      }

      res.json({ ok: true });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      next(error);
    }
  }

  /**
   * GET /admin/ai/training-batches/:id/export
   * Export training batch as CSV
   */
  static async exportTrainingBatch(req, res, next) {
    try {
      const batchId = Number(req.params.id);
      if (!Number.isFinite(batchId)) {
        return res.status(400).json({ error: 'Invalid batch id' });
      }

      // Get batch info
      const batch = await AITrainingBatch.findByPk(batchId);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // For now, return basic batch info as CSV
      // In a real implementation, you'd join with feedback items
      const csvRows = [];
      csvRows.push('id,name,feedback_type,status,feedback_count,created_at');
      csvRows.push([
        batch.id,
        `"${batch.batchName || ''}"`,
        batch.feedbackType,
        batch.status,
        batch.feedbackCount,
        batch.createdAt
      ].join(','));

      const csv = csvRows.join('\n');
      const filename = `batch_${batchId}_${batch.batchName || 'export'}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting batch:', error);
      next(error);
    }
  }
}

export default AdminController;
