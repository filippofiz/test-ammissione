-- Migration: Add attempt tracking to assignments and answers
-- Date: 2025-11-16
-- Purpose: Support multiple test attempts with same assignment_id

-- ============================================================================
-- PART 1: Add attempt tracking to 2V_test_assignments
-- ============================================================================

-- Add attempt tracking columns
ALTER TABLE "2V_test_assignments"
  ADD COLUMN IF NOT EXISTS current_attempt INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS total_attempts INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS completion_details JSONB;

-- Add check constraints (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_current_attempt_positive'
  ) THEN
    ALTER TABLE "2V_test_assignments"
      ADD CONSTRAINT check_current_attempt_positive CHECK (current_attempt >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_total_attempts_non_negative'
  ) THEN
    ALTER TABLE "2V_test_assignments"
      ADD CONSTRAINT check_total_attempts_non_negative CHECK (total_attempts >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_total_attempts_gte_current'
  ) THEN
    ALTER TABLE "2V_test_assignments"
      ADD CONSTRAINT check_total_attempts_gte_current CHECK (total_attempts >= current_attempt - 1);
  END IF;
END $$;

-- Update existing rows to have current_attempt = 1, total_attempts = 0
UPDATE "2V_test_assignments"
SET
  current_attempt = 1,
  total_attempts = CASE
    WHEN status IN ('completed', 'annulled') THEN 1
    ELSE 0
  END
WHERE current_attempt IS NULL;

-- ============================================================================
-- PART 2: Add attempt_number to 2V_student_answers
-- ============================================================================

-- Add attempt_number column (defaults to 1 for existing answers)
ALTER TABLE "2V_student_answers"
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1 NOT NULL;

-- Add check constraint (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_attempt_number_positive'
  ) THEN
    ALTER TABLE "2V_student_answers"
      ADD CONSTRAINT check_attempt_number_positive CHECK (attempt_number >= 1);
  END IF;
END $$;

-- Update existing answers to have attempt_number = 1
UPDATE "2V_student_answers"
SET attempt_number = 1
WHERE attempt_number IS NULL;

-- ============================================================================
-- PART 3: Update unique constraint to support multiple attempts
-- ============================================================================

-- Drop old unique constraint (one answer per assignment+question)
ALTER TABLE "2V_student_answers"
  DROP CONSTRAINT IF EXISTS "2V_student_answers_assignment_id_question_id_key";

-- Add new unique constraint (one answer per assignment+question+attempt)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_answer_per_attempt'
  ) THEN
    ALTER TABLE "2V_student_answers"
      ADD CONSTRAINT unique_answer_per_attempt UNIQUE(assignment_id, question_id, attempt_number);
  END IF;
END $$;

-- ============================================================================
-- PART 4: Update indexes for performance
-- ============================================================================

-- Add index for attempt_number queries
CREATE INDEX IF NOT EXISTS idx_2V_student_answers_attempt_number
  ON "2V_student_answers"(attempt_number);

-- Add composite index for common query pattern (assignment + current attempt)
CREATE INDEX IF NOT EXISTS idx_2V_student_answers_assignment_attempt
  ON "2V_student_answers"(assignment_id, attempt_number);

-- Add index for completion_details JSONB queries
CREATE INDEX IF NOT EXISTS idx_2V_test_assignments_completion_details_gin
  ON "2V_test_assignments" USING GIN (completion_details);

-- ============================================================================
-- PART 5: Update status enum (add 'incomplete' and 'annulled')
-- ============================================================================

-- Note: PostgreSQL doesn't have enum for text columns, but we document valid values
COMMENT ON COLUMN "2V_test_assignments".status IS
  'Valid values: locked | unlocked | in_progress | completed | incomplete | annulled';

-- ============================================================================
-- PART 6: Update comments for documentation
-- ============================================================================

COMMENT ON COLUMN "2V_test_assignments".current_attempt IS
  'Current attempt number (increments when student retakes test)';

COMMENT ON COLUMN "2V_test_assignments".total_attempts IS
  'Total number of attempts completed so far';

COMMENT ON COLUMN "2V_test_assignments".completion_details IS
  'JSONB object with completion info: {reason, completed_at, section_times, total_time_seconds, questions_answered, total_questions, annulment_reason}';

COMMENT ON COLUMN "2V_student_answers".attempt_number IS
  'Which attempt this answer belongs to (allows same question, different attempts)';

-- ============================================================================
-- COMPLETION_DETAILS STRUCTURE DOCUMENTATION
-- ============================================================================

/*
completion_details JSONB structure:

{
  "reason": "submitted" | "time_expired" | "fullscreen_exit" | "multiple_screens" | "browser_closed",
  "completed_at": "2025-01-15T10:30:00Z",
  "section_times": {
    "Logica": 450,
    "Matematica": 380,
    "Inglese": 290
  },
  "total_time_seconds": 1120,
  "questions_answered": 35,
  "total_questions": 40,
  "annulment_reason": "exited_fullscreen_3_times" (only if annulled)
}

STATUS FLOW:
- unlocked → Student clicks "Start Test" → in_progress
- in_progress → Student clicks "Submit" → completed (reason: submitted)
- in_progress → Time expires → completed (reason: time_expired)
- in_progress → Browser closed → incomplete (reason: browser_closed) → can restart
- in_progress → Fullscreen exit → annulled (reason: fullscreen_exit) → can restart
- in_progress → Multiple screens → annulled (reason: multiple_screens) → can restart

RETAKE LOGIC:
- completed → Tutor unlocks → status='unlocked', current_attempt++
- incomplete → Student clicks "Restart" → status='in_progress', current_attempt++
- annulled → Student clicks "Restart" → status='in_progress', current_attempt++

LOCKING RULES:
- completed → AUTO-LOCKED (tutor must unlock to allow retake)
- incomplete → Student can restart anytime
- annulled → Student can restart anytime (tutor can review attempt history)
*/
