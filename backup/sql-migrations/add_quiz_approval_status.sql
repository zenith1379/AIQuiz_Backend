-- Add approval status to quizzes table for admin moderation
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by INT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS is_community BOOLEAN DEFAULT FALSE;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_approval_status ON quizzes(approval_status);
CREATE INDEX IF NOT EXISTS idx_is_community ON quizzes(is_community);

-- Add foreign key for approved_by
ALTER TABLE quizzes 
ADD CONSTRAINT fk_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Update existing quizzes to be approved by default (migration)
UPDATE quizzes SET approval_status = 'approved' WHERE approval_status IS NULL;
