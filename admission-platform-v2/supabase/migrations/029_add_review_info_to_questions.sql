-- Migration: Add review_info to 2V_questions
-- Date: 2025-11-28
-- Purpose: Allow individual questions to be marked as reviewed

-- Add review_info column to track question review status
ALTER TABLE "2V_questions"
ADD COLUMN IF NOT EXISTS review_info JSONB DEFAULT NULL;

-- Add index for querying reviewed/unreviewed questions
CREATE INDEX IF NOT EXISTS idx_2V_questions_review_info ON "2V_questions" USING GIN (review_info);

-- Add comment
COMMENT ON COLUMN "2V_questions".review_info IS 'Review information: {reviewed_at, reviewed_by, reviewed_by_email, notes}';
