-- Quick fix: add role column if not exists
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student';
