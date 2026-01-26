-- Migration: Add metadata column to choices table
-- This allows storing additional data for matching questions and other question types

-- Add metadata column to store JSON data
ALTER TABLE choices 
ADD COLUMN metadata JSON DEFAULT NULL 
AFTER is_correct;

-- Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'choices' 
AND TABLE_SCHEMA = DATABASE()
AND COLUMN_NAME = 'metadata';
