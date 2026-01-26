-- Create quiz_sessions table for real-time multiplayer quiz games
CREATE TABLE IF NOT EXISTS quiz_sessions (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  host_id INT NOT NULL,
  session_code VARCHAR(10) UNIQUE NOT NULL,
  status ENUM('waiting', 'active', 'completed') DEFAULT 'waiting',
  max_participants INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  FOREIGN KEY (host_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_session_code (session_code),
  INDEX idx_status (status)
);

-- Create session_participants table to track who joined
CREATE TABLE IF NOT EXISTS session_participants (
  participant_id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  user_id INT NULL,
  participant_name VARCHAR(100),
  socket_id VARCHAR(100),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  score INT DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_session_active (session_id, is_active)
);

-- Create session_answers table to track student responses
CREATE TABLE IF NOT EXISTS session_answers (
  answer_id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  participant_id INT NOT NULL,
  question_id INT NOT NULL,
  choice_id INT NULL,
  answer_text TEXT NULL,
  is_correct BOOLEAN,
  time_taken INT, -- milliseconds
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES session_participants(participant_id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
  INDEX idx_session_participant (session_id, participant_id)
);
