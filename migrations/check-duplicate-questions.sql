-- Find duplicate sample questions across all topics
-- This script helps identify if any questions are reused across different topics

USE quiz_generator;

-- Create temporary table to extract individual questions
DROP TEMPORARY TABLE IF EXISTS temp_questions;
CREATE TEMPORARY TABLE temp_questions (
    topic_id INT,
    topic_title VARCHAR(200),
    question_text TEXT,
    question_index INT
);

-- Extract all questions from JSON arrays (manual extraction for each topic)
-- This is a simplified approach - in production, you'd use JSON functions

SELECT 'Checking for duplicate sample questions...' as info;

-- Find topics that might share similar question patterns
SELECT 
    t1.id as topic1_id,
    t1.title as topic1_title,
    t2.id as topic2_id,
    t2.title as topic2_title,
    'Check manually - JSON comparison complex' as note
FROM speaking_practice_topics t1
CROSS JOIN speaking_practice_topics t2
WHERE t1.id < t2.id
ORDER BY t1.title, t2.title
LIMIT 10;

-- Show all topics with their sample questions for manual review
SELECT 
    id,
    title,
    difficulty_level,
    sample_questions
FROM speaking_practice_topics
ORDER BY difficulty_level, title;

-- Count questions per topic (approximate - counts array elements)
SELECT 
    id,
    title,
    difficulty_level,
    LENGTH(sample_questions) - LENGTH(REPLACE(sample_questions, '",', '')) + 1 as approximate_question_count
FROM speaking_practice_topics
ORDER BY approximate_question_count DESC;
