import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run migrations endpoint - DELETE AFTER USE!
router.post('/run-migrations/:secret', async (req, res) => {
  const { secret } = req.params;
  
  if (secret !== 'add-role-dec24') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    console.log('Running migrations...');

    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationFiles = [
      // Core multiplayer tables
      '1_create_quiz_sessions.sql',
      '2_create_session_participants.sql',
      '3_create_session_answers.sql',
      // Additional features
      'create_audit_logs.sql',
      'create_calendar_events.sql',
      'create_checklists.sql',
      // HITL feedback + training batches
      'create_ai_feedback.sql',
      'create_ai_training_batches.sql',
      'create_password_reset_tokens.sql',
      'create_speaking_practice.sql',
      'create_system_settings.sql',
      'create_todo_items.sql',
      // User subscription features
      'add_subscription_fields_to_users.sql'
    ];

    const results = [];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      
      if (!fs.existsSync(filePath)) {
        results.push({ file, status: 'skipped', reason: 'File not found' });
        continue;
      }

      try {
        const sql = fs.readFileSync(filePath, 'utf8');
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (err) {
            if (!err.message.includes('already exists')) {
              throw err;
            }
          }
        }

        results.push({ file, status: 'success' });
        console.log(`${file} completed`);

      } catch (err) {
        results.push({ file, status: 'error', error: err.message });
        console.error(`${file} failed:`, err.message);
      }
    }

    // Verify tables
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);

    res.json({
      success: true,
      message: 'Migrations completed successfully',
      results,
      tables: tableNames
    });

  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check database columns
router.get('/check-columns/:secret', async (req, res) => {
  const { secret } = req.params;
  
  if (secret !== 'migrate-2025-aiquiz') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM users');
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', ['finaltest@example.com']);
    
    res.json({
      columns: columns.map(c => ({ Field: c.Field, Type: c.Type, Default: c.Default })),
      sampleUser: users[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug raw query
router.post('/debug-query/:secret', async (req, res) => {
  const { secret } = req.params;
  
  if (secret !== 'migrate-2025-aiquiz') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { query, params } = req.body;
    const [result] = await pool.query(query, params || []);
    
    res.json({
      rowCount: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

export default router;
