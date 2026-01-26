import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import db from '../src/config/database.js';

// Loads .env locally; on hosting, env vars are provided by the platform
dotenv.config();

const email = process.env.SUPER_ADMIN_EMAIL;
const password = process.env.SUPER_ADMIN_PASSWORD;
const username = process.env.SUPER_ADMIN_USERNAME || 'super_admin';
const forcePassword = String(process.env.SEED_SUPER_ADMIN_FORCE_PASSWORD || '').toLowerCase() === 'true';

if (!email || !password) {
  console.error('Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD');
  process.exit(1);
}

const run = async () => {
  const [rows] = await db.query('SELECT id, email, role FROM users WHERE email = ? LIMIT 1', [email]);

  if (rows.length) {
    const userId = rows[0].id;

    // Ensure role is super_admin
    await db.query('UPDATE users SET role = ? WHERE id = ?', ['super_admin', userId]);

    // Optionally rotate password (disabled by default)
    if (forcePassword) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    }

    console.log(`OK: ensured super_admin role for existing user ${email}`);
    if (forcePassword) console.log('OK: password updated (force flag enabled)');
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashed, 'super_admin']
  );

  console.log(`OK: created super_admin user ${email} (id=${result.insertId})`);
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed super admin failed:', err?.message || err);
    process.exit(1);
  });
