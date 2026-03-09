-- Migration: 056_add_cycle_to_training_result_rpc.sql
-- Purpose: Add p_metadata param to save_gmat_training_result so the cycle can be stored.
-- This allows filtering training completions by the cycle they were taken under.

-- Drop the old signature first
DROP FUNCTION IF EXISTS public.save_gmat_training_result(UUID, TEXT, TEXT, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[], JSONB, UUID[]);

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
  p_bookmarked_question_ids UUID[] DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
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
  v_auth_uid := auth.uid();

  IF NOT EXISTS (
    SELECT 1 FROM "2V_profiles"
    WHERE id = p_student_id
      AND auth_uid = v_auth_uid
  ) THEN
    RAISE EXCEPTION 'Unauthorized: student_id does not match authenticated user';
  END IF;

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
    metadata,
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
    p_metadata,
    true,
    false,
    NOW()
  )
  RETURNING id INTO v_result_id;

  -- Auto-lock the training test after completion
  INSERT INTO "2V_gmat_training_locks" (student_id, template_id, is_locked, updated_at)
  VALUES (p_student_id, p_topic::UUID, true, NOW())
  ON CONFLICT (student_id, template_id)
  DO UPDATE SET is_locked = true, updated_at = NOW();

  RETURN v_result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_gmat_training_result(UUID, TEXT, TEXT, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[], JSONB, UUID[], JSONB) TO authenticated;
