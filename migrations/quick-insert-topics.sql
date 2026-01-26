-- Quick insert speaking topics (simplified)
USE quiz_generator;

INSERT INTO speaking_practice_topics (title, description, category, difficulty_level, is_active, sample_questions) VALUES
('Family and Friends', 'Talk about your family members, relationships, and close friends', 'Personal', 'beginner', TRUE, '["Tell me about your family", "Do you have any siblings?", "Who is your best friend?"]'),
('Home and Living', 'Describe your home, neighborhood, and living situation', 'Personal', 'beginner', TRUE, '["Describe your home", "What is your favorite room?", "Do you live in a house or apartment?"]'),
('Shopping and Fashion', 'Discuss shopping habits, clothing preferences, and fashion trends', 'Lifestyle', 'beginner', TRUE, '["Do you enjoy shopping?", "What is your fashion style?", "Where do you usually shop?"]'),
('Weather and Seasons', 'Talk about weather, climate, and your favorite seasons', 'Lifestyle', 'beginner', TRUE, '["What is the weather like today?", "What is your favorite season?", "How does weather affect your mood?"]'),
('Health and Fitness', 'Discuss health habits, exercise routines, and wellness practices', 'Lifestyle', 'intermediate', TRUE, '["How do you stay healthy?", "Do you exercise regularly?", "What is your diet like?"]'),
('Education and Learning', 'Talk about education, learning experiences, and academic goals', 'Academic', 'intermediate', TRUE, '["Tell me about your education", "What subjects do you enjoy?", "How do you prefer to learn?"]'),
('Entertainment and Media', 'Discuss movies, TV shows, music, and entertainment preferences', 'Lifestyle', 'intermediate', TRUE, '["What kind of movies do you like?", "Do you watch TV series?", "What music do you listen to?"]'),
('Environment and Nature', 'Talk about environmental issues, nature, and conservation', 'Social', 'intermediate', TRUE, '["What environmental problems concern you?", "Do you recycle?", "How can we protect nature?"]'),
('Communication and Social Media', 'Discuss communication methods and social media usage', 'Technology', 'intermediate', TRUE, '["How do you communicate with friends?", "Do you use social media?", "How has technology changed communication?"]'),
('Art and Culture', 'Talk about art, museums, cultural activities, and creative hobbies', 'Culture', 'intermediate', TRUE, '["Are you interested in art?", "Have you visited any museums?", "What cultural events do you enjoy?"]'),
('Global Issues', 'Discuss world problems, international relations, and global challenges', 'Social', 'advanced', TRUE, '["What global issues worry you most?", "How can countries cooperate better?", "What is your opinion on climate change?"]'),
('Career and Success', 'Talk about career development, ambitions, and professional goals', 'Professional', 'advanced', TRUE, '["What defines success for you?", "How do you plan your career?", "What skills are important in your field?"]'),
('Science and Innovation', 'Discuss scientific discoveries, innovations, and technological advances', 'Academic', 'advanced', TRUE, '["What scientific breakthrough interests you?", "How does innovation affect society?", "Discuss the future of technology"]'),
('Economics and Business', 'Talk about economic systems, business practices, and market trends', 'Professional', 'advanced', TRUE, '["How does the economy affect daily life?", "What makes a business successful?", "Discuss globalization and its impact"]'),
('Philosophy and Ethics', 'Discuss philosophical concepts, ethical dilemmas, and moral values', 'Academic', 'advanced', TRUE, '["What is the meaning of happiness?", "How do you make ethical decisions?", "Discuss a moral dilemma"]'),
('Urbanization and Development', 'Talk about city development, urban planning, and infrastructure', 'Social', 'advanced', TRUE, '["How should cities develop sustainably?", "What are the challenges of urbanization?", "Discuss smart city concepts"]');

SELECT COUNT(*) as total_topics, difficulty_level 
FROM speaking_practice_topics 
GROUP BY difficulty_level;
