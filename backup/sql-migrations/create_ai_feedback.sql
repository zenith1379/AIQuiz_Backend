-- Create ai_feedback table for HITL (Human-in-the-loop) ratings/notes
-- Stores quiz/game quality ratings to support admin filtering and fine-tuning dataset curation.
CREATE TABLE IF NOT EXISTS ai_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NULL,
  topic VARCHAR(255) NULL,
  question_id VARCHAR(128) NOT NULL,
  question_text TEXT NULL,
  question_type VARCHAR(64) NULL,
  rating TINYINT NULL,
  tags TEXT NULL,
  notes TEXT NULL,
  source VARCHAR(64) NULL,
  original_created_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ai_feedback_rating (rating),
  INDEX idx_ai_feedback_created_at (created_at),
  INDEX idx_ai_feedback_quiz_id (quiz_id),
  INDEX idx_ai_feedback_source (source),
  INDEX idx_ai_feedback_question_type (question_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE ai_feedback COMMENT = 'HITL feedback items (rating/tags/notes) used for admin curation and model fine-tuning.';
