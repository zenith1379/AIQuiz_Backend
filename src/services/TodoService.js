import pool from '../config/database.js';
import { TodoItem } from '../models/index.js';

const getAllByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM todo_items WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map(row => TodoItem.fromDatabase(row));
};

const findById = async (id, userId) => {
  const [rows] = await pool.query('SELECT * FROM todo_items WHERE id = ? AND user_id = ?', [id, userId]);
  if (rows.length === 0) {
    return null;
  }
  return TodoItem.fromDatabase(rows[0]);
};

const create = async (todoData) => {
  const { user_id, task, due_date } = todoData;
  const [result] = await pool.query(
    'INSERT INTO todo_items (user_id, task, due_date) VALUES (?, ?, ?)',
    [user_id, task, due_date || null]
  );
  const newTodoId = result.insertId;
  return await findById(newTodoId, user_id);
};

const update = async (id, userId, updates) => {
  const allowedUpdates = ['task', 'due_date', 'is_completed'];
  const fields = [];
  const values = [];

  for (const key in updates) {
    if (allowedUpdates.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return await findById(id, userId); // No update, just return the current item
  }

  values.push(id);
  values.push(userId);

  const sql = `UPDATE todo_items SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
  
  await pool.query(sql, values);
  
  return await findById(id, userId);
};

const remove = async (id, userId) => {
  const [result] = await pool.query('DELETE FROM todo_items WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

const getStatsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      COUNT(*) as total_tasks,
      SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks
    FROM todo_items
    WHERE user_id = ?`,
    [userId]
  );

  const stats = rows[0];
  const total_tasks = parseInt(stats.total_tasks, 10);
  const completed_tasks = parseInt(stats.completed_tasks, 10) || 0;
  const pending_tasks = total_tasks - completed_tasks;
  const completion_percentage = total_tasks > 0 ? (completed_tasks / total_tasks) * 100 : 0;

  return {
    total_tasks,
    completed_tasks,
    pending_tasks,
    completion_percentage: parseFloat(completion_percentage.toFixed(1)),
  };
};


export const TodoService = {
  getAllByUserId,
  findById,
  create,
  update,
  remove,
  getStatsByUserId,
};
