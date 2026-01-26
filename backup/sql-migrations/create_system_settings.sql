-- Create system_settings table
-- Stores global configuration for the application
-- Supports string, number, boolean, and json types

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description VARCHAR(255),
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_updated_by (updated_by),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('ai_model_name', 'qwen2.5:7b', 'string', 'AI model name for quiz generation'),
('ai_temperature', '0.7', 'number', 'AI model temperature (0-1)'),
('ai_max_tokens', '2000', 'number', 'Maximum tokens for AI responses'),
('rate_limit_quiz_generation', '10', 'number', 'Max quiz generations per 15 minutes'),
('rate_limit_admin_actions', '30', 'number', 'Max admin actions per 15 minutes'),
('default_question_count', '10', 'number', 'Default number of questions per quiz'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- Log migration
SELECT 'system_settings table created successfully' as message;
