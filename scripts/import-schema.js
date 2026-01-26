import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importSchema() {
  console.log('🚀 Starting database schema import...');

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true, // Allow multiple SQL statements
  };

  // Add SSL for production (Aiven requires SSL)
  if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  try {
    console.log('📡 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'quiz_generator_backup_utf8.sql');
    console.log(`📄 Reading SQL file: ${sqlFile}`);
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by statements and execute one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.query(statement);
          console.log(`✅ [${i + 1}/${statements.length}] Executed successfully`);
        } catch (err) {
          // Ignore "table already exists" errors
          if (!err.message.includes('already exists')) {
            console.error(`❌ Error in statement ${i + 1}:`, err.message);
          }
        }
      }
    }

    console.log('🎉 Schema import completed!');
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Tables created:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    await connection.end();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importSchema();
