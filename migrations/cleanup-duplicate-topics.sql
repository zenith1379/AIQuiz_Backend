-- Remove ALL duplicate speaking practice topics
-- Keep only ONE instance of each unique title

USE quiz_generator;

-- Show current duplicates
SELECT 'Current Duplicate Topics:' as info;
SELECT title, COUNT(*) as count 
FROM speaking_practice_topics 
GROUP BY title 
HAVING count > 1 
ORDER BY count DESC, title;

-- Delete duplicates, keep only the one with lowest ID (oldest)
DELETE t1 FROM speaking_practice_topics t1
INNER JOIN speaking_practice_topics t2 
WHERE 
    t1.id > t2.id 
    AND t1.title = t2.title;

-- Verify: Show remaining topics count
SELECT 'After Cleanup:' as info;
SELECT difficulty_level, COUNT(*) as count
FROM speaking_practice_topics
GROUP BY difficulty_level
ORDER BY 
    CASE difficulty_level
        WHEN 'beginner' THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced' THEN 3
    END;

-- Show all unique topics
SELECT 'All Unique Topics:' as info;
SELECT id, title, category, difficulty_level
FROM speaking_practice_topics
ORDER BY 
    CASE difficulty_level
        WHEN 'beginner' THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced' THEN 3
    END,
    title;

-- Final verification
SELECT 'Final Check - Any Duplicates?' as info;
SELECT title, COUNT(*) as count 
FROM speaking_practice_topics 
GROUP BY title 
HAVING count > 1;
