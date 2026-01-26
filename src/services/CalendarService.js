import pool from '../config/database.js';
import { CalendarEvent } from '../models/index.js';

const getAllByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM calendar_events WHERE user_id = ? ORDER BY start_datetime ASC',
    [userId]
  );
  return rows.map(row => CalendarEvent.fromDatabase(row));
};

const findById = async (id, userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM calendar_events WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (rows.length === 0) return null;
  return CalendarEvent.fromDatabase(rows[0]);
};

const create = async ({ user_id, title, start, end, notes }) => {
  const [result] = await pool.query(
    'INSERT INTO calendar_events (user_id, title, start_datetime, end_datetime, notes) VALUES (?, ?, ?, ?, ?)',
    [user_id, title, start, end, notes ?? null]
  );
  return await findById(result.insertId, user_id);
};

const remove = async (id, userId) => {
  const [result] = await pool.query(
    'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
};

const update = async (id, userId, updates) => {
  const existing = await findById(id, userId);
  if (!existing) return null;

  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.start !== undefined) {
    fields.push('start_datetime = ?');
    values.push(updates.start);
  }
  if (updates.end !== undefined) {
    fields.push('end_datetime = ?');
    values.push(updates.end);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }

  if (fields.length === 0) return existing;

  values.push(id, userId);
  await pool.query(
    `UPDATE calendar_events SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  return await findById(id, userId);
};

export const CalendarService = {
  getAllByUserId,
  findById,
  create,
  update,
  remove,
};
