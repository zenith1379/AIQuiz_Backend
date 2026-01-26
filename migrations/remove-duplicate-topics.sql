-- Remove duplicate speaking practice topics
-- Keep only unique topics (16 total: 4 beginner, 6 intermediate, 6 advanced)

USE quiz_generator;

-- First, see what we have
SELECT id, title, difficulty_level, created_at 
FROM speaking_practice_topics 
ORDER BY title, created_at;

-- Delete all topics first (will re-insert clean data)
DELETE FROM speaking_practice_topics;

-- Insert clean, non-duplicate topics (16 total)

-- BEGINNER (4 topics)
INSERT INTO speaking_practice_topics (title, description, category, difficulty_level, is_active, sample_questions) VALUES
('Family and Friends', 'Talk about your family members, relationships, and close friends', 'Personal', 'beginner', TRUE, 
'["Tell me about your family", "Do you have any siblings?", "Who is your best friend?", "How often do you see your family?"]'),

('Home and Living', 'Describe your home, neighborhood, and living situation', 'Personal', 'beginner', TRUE,
'["Describe your home", "What is your favorite room?", "Do you live in a house or apartment?", "Tell me about your neighborhood"]'),

('Shopping and Fashion', 'Discuss shopping habits, clothing preferences, and fashion trends', 'Lifestyle', 'beginner', TRUE,
'["Do you enjoy shopping?", "What is your fashion style?", "Where do you usually shop?", "How often do you buy clothes?"]'),

('Weather and Seasons', 'Talk about weather, climate, and seasonal preferences', 'General', 'beginner', TRUE,
'["What is your favorite season?", "How is the weather today?", "Does weather affect your mood?", "What do you do on rainy days?"]');

-- INTERMEDIATE (6 topics)
INSERT INTO speaking_practice_topics (title, description, category, difficulty_level, is_active, sample_questions) VALUES
('Health and Fitness', 'Discuss health habits, exercise routines, and wellness practices', 'Lifestyle', 'intermediate', TRUE,
'["How do you stay healthy?", "Do you exercise regularly?", "What is your diet like?", "How important is health to you?"]'),

('Education and Learning', 'Talk about education systems, learning experiences, and study methods', 'Academic', 'intermediate', TRUE,
'["Describe your education background", "What subjects did you enjoy most?", "How do you prefer to learn?", "Is education important in your country?"]'),

('Entertainment and Media', 'Discuss movies, TV shows, music, and entertainment preferences', 'Lifestyle', 'intermediate', TRUE,
'["What kind of movies do you like?", "Do you watch TV series?", "What music do you listen to?", "How do you spend your free time?"]'),

('Environment and Nature', 'Talk about environmental issues, nature conservation, and sustainability', 'Social', 'intermediate', TRUE,
'["What environmental problems concern you?", "Do you recycle?", "How can we protect nature?", "Do you prefer city or countryside?"]'),

('Communication and Social Media', 'Discuss communication methods, social media usage, and digital interaction', 'Technology', 'intermediate', TRUE,
'["How do you communicate with friends?", "Do you use social media?", "Has technology changed communication?", "What is your favorite app?"]'),

('Art and Culture', 'Talk about art, museums, cultural activities, and creative pursuits', 'Culture', 'intermediate', TRUE,
'["Are you interested in art?", "Have you visited any museums?", "What cultural events do you enjoy?", "Do you have creative hobbies?"]');

-- ADVANCED (6 topics)
INSERT INTO speaking_practice_topics (title, description, category, difficulty_level, is_active, sample_questions) VALUES
('Global Issues', 'Discuss international problems, politics, and world affairs', 'Social', 'advanced', TRUE,
'["What global issue concerns you most?", "How can countries work together?", "What is your opinion on globalization?", "Discuss a current world event"]'),

('Career and Success', 'Talk about career development, professional ambitions, and success metrics', 'Professional', 'advanced', TRUE,
'["What defines success for you?", "How do you plan your career?", "What skills are important in your field?", "Discuss work-life balance"]'),

('Science and Innovation', 'Discuss scientific discoveries, technological innovations, and future trends', 'Academic', 'advanced', TRUE,
'["What scientific breakthrough interests you?", "How does innovation affect society?", "Discuss the future of technology", "What is your view on AI?"]'),

('Economics and Business', 'Talk about economic systems, business practices, and financial topics', 'Professional', 'advanced', TRUE,
'["How does the economy affect daily life?", "What makes a business successful?", "Discuss entrepreneurship", "What is your view on capitalism?"]'),

('Philosophy and Ethics', 'Discuss philosophical questions, moral issues, and ethical dilemmas', 'Academic', 'advanced', TRUE,
'["What is the meaning of happiness?", "Discuss right and wrong", "What is your philosophy of life?", "How do you make difficult decisions?"]'),

('Urbanization and Development', 'Talk about city planning, urban challenges, and infrastructure development', 'Social', 'advanced', TRUE,
'["How are cities changing?", "What makes a city livable?", "Discuss traffic problems", "Should cities grow bigger or smarter?"]');

-- Verify the final count
SELECT 
    difficulty_level,
    COUNT(*) as topic_count,
    GROUP_CONCAT(title ORDER BY title SEPARATOR ', ') as topics
FROM speaking_practice_topics
GROUP BY difficulty_level
ORDER BY 
    CASE difficulty_level
        WHEN 'beginner' THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced' THEN 3
    END;

-- Show all topics
SELECT id, title, category, difficulty_level, is_active
FROM speaking_practice_topics
ORDER BY 
    CASE difficulty_level
        WHEN 'beginner' THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced' THEN 3
    END,
    title;

-- Final summary
SELECT 
    'Total Topics' as metric,
    COUNT(*) as value
FROM speaking_practice_topics
UNION ALL
SELECT 
    'Active Topics' as metric,
    COUNT(*) as value
FROM speaking_practice_topics
WHERE is_active = TRUE;
