import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'quiz_generator',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Read the migration file
    const migrationPath = join(__dirname, 'migrations', 'add_metadata_to_choices.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`  ⚡ Executing: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the column was added
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'choices' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'metadata'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Verified: metadata column exists');
      console.log('   Column details:', columns[0]);
    } else {
      console.log('⚠️  Warning: metadata column was not found after migration');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Check if column already exists
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  The metadata column already exists. Skipping migration.');
    } else {
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
