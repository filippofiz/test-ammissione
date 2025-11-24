-- Add review tracking to 2V_tests table
-- Tracks when a test was reviewed and by whom

ALTER TABLE "2V_tests"
ADD COLUMN IF NOT EXISTS review_info JSONB DEFAULT NULL;

-- Example structure:
-- {
--   "reviewed_at": "2025-11-22T10:30:00Z",
--   "reviewed_by": "user-uuid",
--   "reviewed_by_email": "admin@example.com",
--   "notes": "All questions verified"
-- }

COMMENT ON COLUMN "2V_tests".review_info IS 'Tracks review status with timestamp and reviewer info';
