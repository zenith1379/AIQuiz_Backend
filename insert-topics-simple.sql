-- Copy and paste this into MySQL command line or MySQL Workbench
USE quiz_generator;

-- Add new topics
INSERT INTO speaking_practice_topics (title, description, category, difficulty_level, is_active, sample_questions) VALUES
('Family and Friends', 'Talk about your family members, relationships, and close friends', 'Personal', 'beginner', 1, '["Tell me about your family", "Do you have any siblings?", "Who is your best friend?"]'),
('Home and Living', 'Describe your home, neighborhood, and living situation', 'Personal', 'beginner', 1, '["Describe your home", "What is your favorite room?", "Do you live in a house or apartment?"]'),
('Shopping', 'Discuss shopping habits, clothing preferences, and fashion', 'Lifestyle', 'beginner', 1, '["Do you enjoy shopping?", "What is your fashion style?", "Where do you usually shop?"]'),
('Weather', 'Talk about weather, climate, and your favorite seasons', 'Lifestyle', 'beginner', 1, '["What is the weather like today?", "What is your favorite season?", "How does weather affect you?"]'),
('Health and Fitness', 'Discuss health habits, exercise, and wellness practices', 'Lifestyle', 'intermediate', 1, '["How do you stay healthy?", "Do you exercise regularly?", "What is your diet like?"]'),
('Education', 'Talk about education, learning experiences, and academic goals', 'Academic', 'intermediate', 1, '["Tell me about your education", "What subjects do you enjoy?", "How do you prefer to learn?"]'),
('Entertainment', 'Discuss movies, TV shows, music, and entertainment', 'Lifestyle', 'intermediate', 1, '["What movies do you like?", "Do you watch TV series?", "What music do you listen to?"]'),
('Environment', 'Talk about environmental issues, nature, and conservation', 'Social', 'intermediate', 1, '["What environmental problems concern you?", "Do you recycle?", "How can we protect nature?"]'),
('Social Media', 'Discuss communication methods and social media usage', 'Technology', 'intermediate', 1, '["How do you communicate with friends?", "Do you use social media?", "How has technology changed communication?"]'),
('Art and Culture', 'Talk about art, museums, and cultural activities', 'Culture', 'intermediate', 1, '["Are you interested in art?", "Have you visited museums?", "What cultural events do you enjoy?"]'),
('Global Issues', 'Discuss world problems and global challenges', 'Social', 'advanced', 1, '["What global issues worry you?", "How can countries cooperate?", "Your opinion on climate change?"]'),
('Career', 'Talk about career development and professional goals', 'Professional', 'advanced', 1, '["What defines success?", "How do you plan your career?", "Important skills in your field?"]'),
('Technology', 'Discuss innovations and technological advances', 'Academic', 'advanced', 1, '["What breakthrough interests you?", "How does innovation affect society?", "Future of technology?"]'),
('Business', 'Talk about economic systems and business practices', 'Professional', 'advanced', 1, '["How does economy affect daily life?", "What makes a business successful?", "Discuss globalization"]'),
('Philosophy', 'Discuss philosophical concepts and moral values', 'Academic', 'advanced', 1, '["What is the meaning of happiness?", "How do you make ethical decisions?", "Discuss a moral dilemma"]'),
('Urban Development', 'Talk about city development and urban planning', 'Social', 'advanced', 1, '["How should cities develop?", "Challenges of urbanization?", "Discuss smart city concepts"]');

-- Verify
SELECT difficulty_level, COUNT(*) as count FROM speaking_practice_topics GROUP BY difficulty_level;
