-- Create session_answers table (depends on quiz_sessions and session_participants)
DROP TABLE IF EXISTS session_answers;
CREATE TABLE session_answers (
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
