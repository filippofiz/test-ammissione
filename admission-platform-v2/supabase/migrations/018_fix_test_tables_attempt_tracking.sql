-- Migration: Fix test tables to match production after attempt tracking migration
-- Date: 2025-11-19
-- Purpose: Add attempt_number and unique constraint to test tables

-- ============================================================================
-- PART 1: Fix 2V_student_answers_test
-- ============================================================================

-- Add attempt_number column (if not exists)
ALTER TABLE "2V_student_answers_test"
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1 NOT NULL;

-- Add check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_attempt_number_positive_test'
  ) THEN
    ALTER TABLE "2V_student_answers_test"
      ADD CONSTRAINT check_attempt_number_positive_test CHECK (attempt_number >= 1);
  END IF;
END $$;

-- Drop old unique constraint if exists
ALTER TABLE "2V_student_answers_test"
  DROP CONSTRAINT IF EXISTS "2V_student_answers_test_assignment_id_question_id_key";

-- Add new unique constraint (one answer per assignment+question+attempt)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_answer_per_attempt_test'
  ) THEN
    ALTER TABLE "2V_student_answers_test"
      ADD CONSTRAINT unique_answer_per_attempt_test UNIQUE(assignment_id, question_id, attempt_number);
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_2V_student_answers_test_attempt_number
  ON "2V_student_answers_test"(attempt_number);

CREATE INDEX IF NOT EXISTS idx_2V_student_answers_test_assignment_attempt
  ON "2V_student_answers_test"(assignment_id, attempt_number);

-- ============================================================================
-- PART 2: Fix 2V_test_assignments_test
-- ============================================================================

-- Add attempt tracking columns (if not exists)
ALTER TABLE "2V_test_assignments_test"
  ADD COLUMN IF NOT EXISTS current_attempt INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS total_attempts INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS completion_details JSONB;

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_current_attempt_positive_test'
  ) THEN
    ALTER TABLE "2V_test_assignments_test"
      ADD CONSTRAINT check_current_attempt_positive_test CHECK (current_attempt >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_total_attempts_non_negative_test'
  ) THEN
    ALTER TABLE "2V_test_assignments_test"
      ADD CONSTRAINT check_total_attempts_non_negative_test CHECK (total_attempts >= 0);
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN "2V_student_answers_test".attempt_number IS
  'Which attempt this answer belongs to (allows same question, different attempts)';

COMMENT ON COLUMN "2V_test_assignments_test".current_attempt IS
  'Current attempt number (increments when student retakes test)';

COMMENT ON COLUMN "2V_test_assignments_test".total_attempts IS
  'Total number of attempts completed so far';

COMMENT ON COLUMN "2V_test_assignments_test".completion_details IS
  'JSONB object with completion info';
