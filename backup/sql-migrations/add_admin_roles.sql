-- Add admin and super_admin roles to users table
ALTER TABLE users 
MODIFY COLUMN role ENUM('student', 'teacher', 'admin', 'super_admin') DEFAULT 'student';

-- Set hain1974211@gmail.com as super_admin
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'hain1974211@gmail.com';

-- Add comment
ALTER TABLE users COMMENT = 'Users table with role-based access control (student, teacher, admin, super_admin)';
