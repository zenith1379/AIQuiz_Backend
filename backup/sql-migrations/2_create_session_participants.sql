-- Create session_participants table (depends on quiz_sessions)
DROP TABLE IF EXISTS session_participants;
CREATE TABLE session_participants (
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
