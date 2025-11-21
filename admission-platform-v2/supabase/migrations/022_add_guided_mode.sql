-- Migration: Add guided mode support to student answers
-- Date: 2025-11-21
-- Purpose: Support tutor-guided test sessions with configurable options

-- ============================================================================
-- Add guided mode columns to 2V_student_answers
-- ============================================================================

-- Add is_guided flag to mark answers from guided sessions
ALTER TABLE "2V_student_answers"
  ADD COLUMN IF NOT EXISTS is_guided BOOLEAN DEFAULT false NOT NULL;

-- Add guided_settings JSONB for guided mode configuration
ALTER TABLE "2V_student_answers"
  ADD COLUMN IF NOT EXISTS guided_settings JSONB;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for filtering guided answers
CREATE INDEX IF NOT EXISTS idx_2V_student_answers_is_guided
  ON "2V_student_answers"(is_guided);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN "2V_student_answers".is_guided IS
  'Whether this answer was submitted in tutor-guided mode';

COMMENT ON COLUMN "2V_student_answers".guided_settings IS
  'Settings for guided mode: {timed: boolean, show_answers: boolean}';

-- ============================================================================
-- GUIDED_SETTINGS STRUCTURE DOCUMENTATION
-- ============================================================================

/*
guided_settings JSONB structure:

{
  "timed": true | false,           -- Whether test had time limit in guided mode
  "show_answers": true | false     -- Whether correct answers were shown during test
}

GUIDED MODE BEHAVIOR:
- is_guided = false: Normal test mode (student takes test independently)
- is_guided = true: Guided mode (tutor assists student during test)
  - timed = true: Timer ran normally
  - timed = false: No time limit was applied
  - show_answers = true: Correct answer was shown after each question
  - show_answers = false: Correct answers were not shown

This allows the same assignment to have multiple attempts:
- Attempt 1: Normal mode (is_guided = false)
- Attempt 2: Guided mode (is_guided = true, timed = false, show_answers = true)
- Attempt 3: Normal mode (is_guided = false)
*/
