import db from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MigrationController {
  static async restoreRole(req, res) {
    const secret = req.params.secret;
    
    // Security check
    if (secret !== 'restore-role-2025') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      console.log('Reading restore_role_column.sql...');
      const sqlPath = path.join(__dirname, '../../migrations/restore_role_column.sql');
      const sql = await fs.readFile(sqlPath, 'utf8');
      
      console.log('Executing migration...');
      
      // Split by semicolon and filter out empty statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      const results = [];
      
      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        const [result] = await db.query(statement);
        results.push({
          statement: statement.substring(0, 100),
          result: JSON.stringify(result)
        });
      }
      
      console.log('Migration completed successfully!');
      
      res.json({
        message: 'Role column restored successfully!',
        results
      });
      
    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  }
}
