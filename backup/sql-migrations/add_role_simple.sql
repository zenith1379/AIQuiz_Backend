-- Simple migration to add role column
-- Add role column
ALTER TABLE users ADD COLUMN role ENUM('student', 'teacher', 'admin', 'super_admin', 'inactive') DEFAULT 'student';

-- Update existing users
UPDATE users SET role = 'student' WHERE role IS NULL;
