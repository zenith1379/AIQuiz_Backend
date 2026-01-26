-- Create calendar events table for Calendar page (replaces FE Todo List UI)
-- Run this against the configured MySQL database (default: quiz_generator)

CREATE TABLE IF NOT EXISTS calendar_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_calendar_events_user_id (user_id),
  INDEX idx_calendar_events_start (start_datetime),
  INDEX idx_calendar_events_end (end_datetime)
);
