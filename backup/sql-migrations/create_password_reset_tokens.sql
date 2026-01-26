-- Create password_reset_tokens table for forgot password functionality
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires (expiresAt),
  INDEX idx_used (used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment
ALTER TABLE password_reset_tokens COMMENT = 'Stores password reset tokens with 15-minute expiry';
