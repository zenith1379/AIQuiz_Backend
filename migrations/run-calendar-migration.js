import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'quiz_generator',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('Connected to MySQL');

    const sqlFilePath = join(__dirname, 'create_calendar_events.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf-8');

    console.log('Running migration: create_calendar_events.sql');
    await connection.query(sqlContent);

    console.log('Migration completed successfully!');
    console.log('Table "calendar_events" is ready.');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

runMigration();
