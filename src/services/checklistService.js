// Checklist Service
import db from '../config/database.js';

class ChecklistService {
    /**
     * Get all checklists for a user
     */
    async getUserChecklists(userId) {
        const [checklists] = await db.query(
            `SELECT * FROM checklists 
             WHERE user_id = ? 
             ORDER BY 
                CASE WHEN completed = 0 THEN 0 ELSE 1 END,
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                due_date_time ASC`,
            [userId]
        );

        return checklists.map(item => ({
            ...item,
            tags: item.tags ? JSON.parse(item.tags) : []
        }));
    }

    /**
     * Create new checklist
     */
    async createChecklist(userId, data) {
        const { title, description, dueDateTime, priority, tags, completed } = data;
        
        const [result] = await db.query(
            `INSERT INTO checklists 
             (user_id, title, description, due_date_time, priority, tags, completed) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title,
                description || null,
                dueDateTime || null,
                priority || 'medium',
                tags && Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]),
                completed || false
            ]
        );

        const [created] = await db.query(
            'SELECT * FROM checklists WHERE id = ?',
            [result.insertId]
        );

        const item = created[0];
        return {
            ...item,
            tags: item.tags ? JSON.parse(item.tags) : []
        };
    }

    /**
     * Update checklist
     */
    async updateChecklist(userId, checklistId, data) {
        const { title, description, dueDateTime, priority, tags, completed } = data;
        
        const updates = [];
        const values = [];

        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (dueDateTime !== undefined) {
            updates.push('due_date_time = ?');
            values.push(dueDateTime);
        }
        if (priority !== undefined) {
            updates.push('priority = ?');
            values.push(priority);
        }
        if (tags !== undefined) {
            updates.push('tags = ?');
            values.push(Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]));
        }
        if (completed !== undefined) {
            updates.push('completed = ?');
            values.push(completed);
            if (completed) {
                updates.push('completed_at = NOW()');
            } else {
                updates.push('completed_at = NULL');
            }
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(userId, checklistId);

        await db.query(
            `UPDATE checklists 
             SET ${updates.join(', ')} 
             WHERE user_id = ? AND id = ?`,
            values
        );

        const [updated] = await db.query(
            'SELECT * FROM checklists WHERE id = ?',
            [checklistId]
        );

        const item = updated[0];
        return {
            ...item,
            tags: item.tags ? JSON.parse(item.tags) : []
        };
    }

    /**
     * Delete checklist
     */
    async deleteChecklist(userId, checklistId) {
        const [result] = await db.query(
            'DELETE FROM checklists WHERE user_id = ? AND id = ?',
            [userId, checklistId]
        );

        return result.affectedRows > 0;
    }

    /**
     * Get statistics
     */
    async getStatistics(userId) {
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN completed = 0 AND due_date_time < NOW() THEN 1 ELSE 0 END) as overdue
             FROM checklists
             WHERE user_id = ?`,
            [userId]
        );

        return stats[0];
    }
}

export default new ChecklistService();
