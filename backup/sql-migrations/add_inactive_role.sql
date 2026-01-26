-- Add 'inactive' role to users table
-- Run this migration to support soft delete functionality

ALTER TABLE users 
MODIFY COLUMN role ENUM('student', 'teacher', 'admin', 'super_admin', 'inactive') 
DEFAULT 'student';

-- Update any existing soft-deleted users (if any were marked as deleted another way)
-- This is optional and safe to run even if no such records exist
