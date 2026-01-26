-- Create audit_logs table for tracking role changes and admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  adminId INT NULL,
  action VARCHAR(100) NOT NULL,
  oldValue TEXT,
  newValue TEXT,
  ipAddress VARCHAR(45),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (adminId) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user (userId),
  INDEX idx_admin (adminId),
  INDEX idx_action (action),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment
ALTER TABLE audit_logs COMMENT = 'Audit log for tracking admin actions and role changes';
