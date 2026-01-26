-- Checklists Table
CREATE TABLE IF NOT EXISTS checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date_time DATETIME,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    tags JSON,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_completed (user_id, completed),
    INDEX idx_due_date (due_date_time),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Weather Cache Table (for AI voice integration)
CREATE TABLE IF NOT EXISTS weather_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    temperature DECIMAL(5, 2),
    weather_condition VARCHAR(100),
    humidity INT,
    wind_speed DECIMAL(5, 2),
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    UNIQUE KEY unique_location (location),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample checklists
INSERT INTO checklists (user_id, title, description, due_date_time, priority, tags) VALUES
(1, 'Complete React project', 'Finish the frontend dashboard for QuizMaker', DATE_ADD(NOW(), INTERVAL 2 DAY), 'high', JSON_ARRAY('work', 'urgent')),
(1, 'Review code', 'Code review for backend API', DATE_ADD(NOW(), INTERVAL 1 DAY), 'medium', JSON_ARRAY('work')),
(1, 'Study English', 'Practice speaking with AI voice assistant', DATE_ADD(NOW(), INTERVAL 3 DAY), 'medium', JSON_ARRAY('personal', 'learning')),
(1, 'Gym workout', 'Cardio and weights session', DATE_ADD(NOW(), INTERVAL 1 DAY), 'low', JSON_ARRAY('health', 'personal'));
