-- Create quiz_sessions tables with correct column references
-- Fixed to match actual database schema (id instead of quiz_id/user_id/question_id)

CREATE TABLE IF NOT EXISTS quiz_sessions (
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

CREATE TABLE IF NOT EXISTS session_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  user_id INT NULL,
  participant_name VARCHAR(100),
  socket_id VARCHAR(100),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  score INT DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_session_active (session_id, is_active)
);

CREATE TABLE IF NOT EXISTS session_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  participant_id INT NOT NULL,
  question_id INT NOT NULL,
  choice_id INT NULL,
  answer_text TEXT NULL,
  is_correct BOOLEAN,
  time_taken INT,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES session_participants(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_session_participant (session_id, participant_id)
);
