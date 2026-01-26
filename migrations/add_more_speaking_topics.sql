-- Add more speaking practice topics

INSERT INTO speaking_practice_topics (title, description, category, difficulty_level, is_active, sample_questions) 
VALUES 
-- Beginner Topics
('Family and Friends', 'Talk about your family members, relationships, and close friends', 'Personal', 'beginner', TRUE, 
'["Tell me about your family", "Do you have any siblings?", "Who is your best friend?", "How often do you see your family?"]'),

('Home and Living', 'Describe your home, neighborhood, and living situation', 'Personal', 'beginner', TRUE,
'["Describe your home", "What''s your favorite room?", "Do you live in a house or apartment?", "Tell me about your neighborhood"]'),

('Shopping and Fashion', 'Discuss shopping habits, clothing preferences, and fashion trends', 'Lifestyle', 'beginner', TRUE,
'["Do you enjoy shopping?", "What''s your fashion style?", "Where do you usually shop?", "How often do you buy clothes?"]'),

('Weather and Seasons', 'Talk about weather, seasons, and climate preferences', 'General', 'beginner', TRUE,
'["What''s your favorite season?", "How''s the weather today?", "Does weather affect your mood?", "What do you do on rainy days?"]'),

-- Intermediate Topics
('Health and Fitness', 'Discuss health habits, exercise routines, and wellness practices', 'Lifestyle', 'intermediate', TRUE,
'["How do you stay healthy?", "Do you exercise regularly?", "What''s your diet like?", "How important is health to you?"]'),

('Education and Learning', 'Talk about education system, learning experiences, and study methods', 'Academic', 'intermediate', TRUE,
'["Describe your education background", "What subject did you enjoy most?", "How do you prefer to learn?", "Is education important in your country?"]'),

('Entertainment and Media', 'Discuss movies, TV shows, music, and entertainment preferences', 'Lifestyle', 'intermediate', TRUE,
'["What kind of movies do you like?", "Do you watch TV series?", "What music do you listen to?", "How do you spend your free time?"]'),

('Environment and Nature', 'Talk about environmental issues, nature, and conservation', 'Social', 'intermediate', TRUE,
'["What environmental problems concern you?", "Do you recycle?", "How can we protect nature?", "Do you prefer city or countryside?"]'),

('Communication and Social Media', 'Discuss communication methods, social media use, and online interactions', 'Technology', 'intermediate', TRUE,
'["How do you communicate with friends?", "Do you use social media?", "Has technology changed communication?", "What''s your favorite app?"]'),

('Art and Culture', 'Talk about art, museums, cultural activities, and creative hobbies', 'Culture', 'intermediate', TRUE,
'["Are you interested in art?", "Have you visited any museums?", "What cultural events do you enjoy?", "Do you have creative hobbies?"]'),

-- Advanced Topics
('Global Issues', 'Discuss international problems, politics, and world affairs', 'Social', 'advanced', TRUE,
'["What global issue concerns you most?", "How can countries work together?", "What''s your opinion on globalization?", "Discuss a current world event"]'),

('Career and Success', 'Talk about career development, ambitions, and professional goals', 'Professional', 'advanced', TRUE,
'["What defines success for you?", "How do you plan your career?", "What skills are important in your field?", "Discuss work-life balance"]'),

('Science and Innovation', 'Discuss scientific discoveries, innovations, and technological advances', 'Academic', 'advanced', TRUE,
'["What scientific breakthrough interests you?", "How does innovation affect society?", "Discuss the future of technology", "What''s your view on AI?"]'),

('Economics and Business', 'Talk about economy, business trends, and financial topics', 'Professional', 'advanced', TRUE,
'["How does the economy affect daily life?", "What makes a business successful?", "Discuss entrepreneurship", "What''s your view on capitalism?"]'),

('Philosophy and Ethics', 'Discuss philosophical questions, moral issues, and ethical dilemmas', 'Academic', 'advanced', TRUE,
'["What''s the meaning of happiness?", "Discuss right and wrong", "What''s your philosophy of life?", "How do you make difficult decisions?"]'),

('Urbanization and Development', 'Talk about city planning, urban issues, and infrastructure', 'Social', 'advanced', TRUE,
'["How are cities changing?", "What makes a city livable?", "Discuss traffic problems", "Should cities grow bigger?"]');

-- Verify insertion
SELECT COUNT(*) as total_topics, 
       difficulty_level, 
       COUNT(*) as count_per_level 
FROM speaking_practice_topics 
GROUP BY difficulty_level;
