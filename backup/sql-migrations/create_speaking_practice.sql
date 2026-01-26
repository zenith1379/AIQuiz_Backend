-- Speaking Practice Sessions Table
CREATE TABLE IF NOT EXISTS speaking_practice_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    audio_url VARCHAR(500),
    transcription TEXT,
    
    -- User's spoken text analysis
    original_text TEXT NOT NULL,
    corrected_text TEXT,
    
    -- Scores (0-9 IELTS scale)
    pronunciation_score DECIMAL(3,1),
    grammar_score DECIMAL(3,1),
    fluency_score DECIMAL(3,1),
    vocabulary_score DECIMAL(3,1),
    overall_score DECIMAL(3,1),
    
    -- Detailed feedback
    pronunciation_errors JSON COMMENT 'Array of {word, incorrect, correct, ipa}',
    grammar_errors JSON COMMENT 'Array of {error, correction, explanation}',
    suggestions TEXT COMMENT 'Teacher feedback and suggestions',
    
    -- AI Response
    ai_response_text TEXT,
    ai_audio_url VARCHAR(500),
    voice_gender ENUM('male', 'female') DEFAULT 'female',
    
    -- Practice mode
    practice_mode ENUM('conversation', 'ielts_part1', 'ielts_part2', 'ielts_part3', 'pronunciation', 'grammar') DEFAULT 'conversation',
    topic VARCHAR(200),
    
    -- Metadata
    duration_seconds INT COMMENT 'Audio duration in seconds',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_practice_mode (practice_mode),
    INDEX idx_overall_score (overall_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Speaking Practice Topics
CREATE TABLE IF NOT EXISTS speaking_practice_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    category VARCHAR(100),
    sample_questions JSON COMMENT 'Array of questions for this topic',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_difficulty (difficulty_level),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample topics
INSERT INTO speaking_practice_topics (title, description, difficulty_level, category, sample_questions) VALUES
('Daily Routines', 'Talk about your daily activities and habits', 'beginner', 'Lifestyle', JSON_ARRAY(
    'What time do you usually wake up?',
    'Describe your typical morning routine',
    'What do you usually do on weekends?',
    'How do you spend your free time?'
)),
('Travel & Tourism', 'Discuss travel experiences and plans', 'intermediate', 'Travel', JSON_ARRAY(
    'Tell me about a memorable trip you took',
    'What is your favorite travel destination?',
    'Do you prefer traveling alone or with others?',
    'What are the benefits of international travel?'
)),
('Technology & Innovation', 'Discuss modern technology and its impact', 'advanced', 'Technology', JSON_ARRAY(
    'How has technology changed the way we communicate?',
    'What are the advantages and disadvantages of social media?',
    'Do you think AI will replace human jobs?',
    'How can technology improve education?'
)),
('Education & Learning', 'Talk about education systems and learning', 'intermediate', 'Education', JSON_ARRAY(
    'What do you think makes a good teacher?',
    'Should students choose their own subjects?',
    'Is online learning as effective as traditional classroom learning?',
    'What skills are most important for students to learn?'
)),
('Environment & Climate', 'Discuss environmental issues and solutions', 'advanced', 'Environment', JSON_ARRAY(
    'What are the main environmental problems in your country?',
    'What can individuals do to protect the environment?',
    'Should governments invest more in renewable energy?',
    'How will climate change affect future generations?'
));
