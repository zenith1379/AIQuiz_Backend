-- Create quiz_sessions table first (no dependencies)
DROP TABLE IF EXISTS quiz_sessions;
CREATE TABLE quiz_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  host_id INT NOT NULL,
  session_code VARCHAR(10) UNIQUE NOT NULL,
  status ENUM('waiting', 'active', 'completed') DEFAULT 'waiting',
  max_participants INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_code (session_code),
  INDEX idx_status (status)
);
