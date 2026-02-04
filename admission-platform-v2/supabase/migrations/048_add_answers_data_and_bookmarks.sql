-- Migration: 048_add_answers_data_and_bookmarks.sql
-- Purpose: Add columns to store per-question answers/time data and bookmarked questions
-- This enables detailed time reports and bookmark filtering in the results page
-- Created: February 2026

-- ============================================
-- Add new columns to assessment results
-- ============================================

-- answers_data: JSONB storing user answers with timing per question
-- Format: { "question_id": { "answer": "A" | ["A", "B"] | { "col1": "X" }, "time_spent_seconds": 45, "is_correct": true }, ... }
ALTER TABLE "2V_gmat_assessment_results"
ADD COLUMN IF NOT EXISTS answers_data JSONB;

-- bookmarked_question_ids: Array of question IDs that were bookmarked during the test
ALTER TABLE "2V_gmat_assessment_results"
ADD COLUMN IF NOT EXISTS bookmarked_question_ids UUID[];

-- ============================================
-- Drop old function signature and create new one
-- ============================================

-- Drop the old function with 9 parameters (from migration 046/047)
DROP FUNCTION IF EXISTS public.save_gmat_training_result(UUID, TEXT, TEXT, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[]);

-- Create the new function with 11 parameters (includes answers_data and bookmarked_question_ids)
CREATE OR REPLACE FUNCTION public.save_gmat_training_result(
  p_student_id UUID,
  p_section TEXT,
  p_topic TEXT,
  p_score_raw INTEGER,
  p_score_total INTEGER,
  p_score_percentage DECIMAL(5,2),
  p_difficulty_breakdown JSONB DEFAULT NULL,
  p_time_spent_seconds INTEGER DEFAULT NULL,
  p_question_ids UUID[] DEFAULT NULL,
  p_answers_data JSONB DEFAULT NULL,
  p_bookmarked_question_ids UUID[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result_id UUID;
  v_auth_uid UUID;
BEGIN
  -- Get the current user's auth uid
  v_auth_uid := auth.uid();

  -- Verify the student_id belongs to the authenticated user
  IF NOT EXISTS (
    SELECT 1 FROM "2V_profiles"
    WHERE id = p_student_id
      AND auth_uid = v_auth_uid
  ) THEN
    RAISE EXCEPTION 'Unauthorized: student_id does not match authenticated user';
  END IF;

  -- Insert the training result
  INSERT INTO "2V_gmat_assessment_results" (
    student_id,
    assessment_type,
    section,
    topic,
    score_raw,
    score_total,
    score_percentage,
    difficulty_breakdown,
    time_spent_seconds,
    question_ids,
    answers_data,
    bookmarked_question_ids,
    tutor_validated,
    results_visible,
    completed_at
  ) VALUES (
    p_student_id,
    'training',
    p_section,
    p_topic,
    p_score_raw,
    p_score_total,
    p_score_percentage,
    p_difficulty_breakdown,
    p_time_spent_seconds,
    p_question_ids,
    p_answers_data,
    p_bookmarked_question_ids,
    true,  -- Trainings don't require validation
    false, -- Results not visible until tutor enables
    NOW()
  )
  RETURNING id INTO v_result_id;

  -- Auto-lock the training test after completion
  -- Note: template_id in locks table references 2V_lesson_materials(id), but p_topic contains the template UUID
  INSERT INTO "2V_gmat_training_locks" (student_id, template_id, is_locked, updated_at)
  VALUES (p_student_id, p_topic::UUID, true, NOW())
  ON CONFLICT (student_id, template_id)
  DO UPDATE SET is_locked = true, updated_at = NOW();

  RETURN v_result_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.save_gmat_training_result(
  UUID, TEXT, TEXT, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[], JSONB, UUID[]
) TO authenticated;

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN "2V_gmat_assessment_results".answers_data IS
  'JSONB storing user answers with timing per question. Format: { "question_id": { "answer": ..., "time_spent_seconds": N, "is_correct": bool } }';

COMMENT ON COLUMN "2V_gmat_assessment_results".bookmarked_question_ids IS
  'Array of question IDs that were bookmarked/flagged by the student during the test';

COMMENT ON FUNCTION public.save_gmat_training_result IS
  'Saves a GMAT training result for the authenticated student. Validates ownership, stores detailed answers/timing, and auto-locks the test.';
