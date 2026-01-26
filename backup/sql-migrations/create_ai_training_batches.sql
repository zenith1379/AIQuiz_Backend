-- Create tables for batching ai_feedback items into training datasets
CREATE TABLE IF NOT EXISTS ai_training_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  status ENUM('draft', 'approved') NOT NULL DEFAULT 'draft',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  INDEX idx_ai_training_batches_status (status),
  INDEX idx_ai_training_batches_created_at (created_at),
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_training_batch_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  feedback_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ai_batch_feedback (batch_id, feedback_id),
  INDEX idx_ai_batch_items_batch_id (batch_id),
  INDEX idx_ai_batch_items_feedback_id (feedback_id),
  FOREIGN KEY (batch_id) REFERENCES ai_training_batches(id) ON DELETE CASCADE,
  FOREIGN KEY (feedback_id) REFERENCES ai_feedback(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE ai_training_batches COMMENT = 'Groups ai_feedback items into curated training batches.';
ALTER TABLE ai_training_batch_items COMMENT = 'Join table mapping feedback items into training batches.';
