-- Update existing users to have default role
UPDATE users SET role = 'student' WHERE role IS NULL OR role = '';
