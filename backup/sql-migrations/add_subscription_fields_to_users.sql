-- Add subscription-related fields to the users table
ALTER TABLE users
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free',
ADD COLUMN subscription_expires_at DATETIME;

-- Add comment to the table
ALTER TABLE users COMMENT = 'Stores user information, including subscription status.';

-- Add indexes for new fields
CREATE INDEX idx_is_premium ON users(is_premium);
CREATE INDEX idx_subscription_tier ON users(subscription_tier);
