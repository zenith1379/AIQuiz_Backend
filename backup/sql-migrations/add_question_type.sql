-- Migration: Add question_type column to questions table
-- This allows storing different question types: single, fillblank, matching, general

-- Step 1: Add question_type column with ENUM type
ALTER TABLE questions 
ADD COLUMN question_type ENUM('single', 'fillblank', 'matching', 'general', 'multiple') 
NOT NULL DEFAULT 'single' 
AFTER question_text;

-- Step 2: Add time_limit column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS time_limit INT DEFAULT 30 
AFTER question_type;

-- Step 3: Update existing questions to have single type (backward compatibility)
UPDATE questions 
SET question_type = 'single' 
WHERE question_type IS NULL OR question_type = '';

-- Verify the changes
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'questions' 
AND TABLE_SCHEMA = DATABASE()
AND COLUMN_NAME IN ('question_type', 'time_limit');
