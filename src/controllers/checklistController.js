// Checklist Controller
import checklistService from '../services/checklistService.js';

class ChecklistController {
    /**
     * Get all checklists for user
     */
    async getChecklists(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const checklists = await checklistService.getUserChecklists(userId);
            
            res.json({
                success: true,
                checklists
            });
        } catch (error) {
            console.error('Get checklists error:', error);
            res.status(500).json({
                error: 'Failed to get checklists',
                details: error.message
            });
        }
    }

    /**
     * Create new checklist
     */
    async createChecklist(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const data = req.body;

            const checklist = await checklistService.createChecklist(userId, data);
            
            res.status(201).json({
                success: true,
                checklist
            });
        } catch (error) {
            console.error('Create checklist error:', error);
            res.status(500).json({
                error: 'Failed to create checklist',
                details: error.message
            });
        }
    }

    /**
     * Update checklist
     */
    async updateChecklist(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const checklistId = parseInt(req.params.id);
            const data = req.body;

            const checklist = await checklistService.updateChecklist(userId, checklistId, data);
            
            res.json({
                success: true,
                checklist
            });
        } catch (error) {
            console.error('Update checklist error:', error);
            res.status(500).json({
                error: 'Failed to update checklist',
                details: error.message
            });
        }
    }

    /**
     * Delete checklist
     */
    async deleteChecklist(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const checklistId = parseInt(req.params.id);

            const deleted = await checklistService.deleteChecklist(userId, checklistId);
            
            if (!deleted) {
                return res.status(404).json({
                    error: 'Checklist not found'
                });
            }

            res.json({
                success: true,
                message: 'Checklist deleted successfully'
            });
        } catch (error) {
            console.error('Delete checklist error:', error);
            res.status(500).json({
                error: 'Failed to delete checklist',
                details: error.message
            });
        }
    }

    /**
     * Get statistics
     */
    async getStatistics(req, res) {
        try {
            const userId = req.user.userId || req.user.id;
            const stats = await checklistService.getStatistics(userId);
            
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({
                error: 'Failed to get statistics',
                details: error.message
            });
        }
    }
}

export default new ChecklistController();
