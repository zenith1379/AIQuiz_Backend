// Run Speaking Practice Migration
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function runMigration() {
    console.log('🚀 Running Speaking Practice Migration...\n');

    // Database configuration
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'quiz_generator_backup',
        multipleStatements: true
    };

    let connection;

    try {
        // Connect to database
        console.log('📡 Connecting to database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL\n');

        // Read migration file
        const migrationPath = path.join(__dirname, 'migrations', 'create_speaking_practice.sql');
        console.log('📄 Reading migration file...');
        const sql = await fs.readFile(migrationPath, 'utf8');
        console.log('✅ Migration file loaded\n');

        // Execute migration
        console.log('⚡ Executing migration...');
        await connection.query(sql);
        console.log('✅ Migration executed successfully!\n');

        // Verify tables
        console.log('🔍 Verifying tables...');
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME IN ('speaking_practice_sessions', 'speaking_practice_topics')
        `, [config.database]);

        console.log('✅ Tables created:');
        tables.forEach(table => {
            console.log(`   - ${table.TABLE_NAME}`);
        });

        // Count sample topics
        const [topics] = await connection.query('SELECT COUNT(*) as count FROM speaking_practice_topics');
        console.log(`\n✅ Sample topics inserted: ${topics[0].count} topics`);

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Start backend: npm run dev');
        console.log('2. Start frontend: cd FE_quiz/aiquiz-main && npm run dev');
        console.log('3. Login and click "Speaking Practice" in sidebar');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nDetails:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run migration
runMigration().catch(console.error);
