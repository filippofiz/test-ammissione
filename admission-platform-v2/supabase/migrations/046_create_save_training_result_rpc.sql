-- Migration: 046_create_save_training_result_rpc.sql
-- Purpose: Create an RPC function to save training results, bypassing RLS
-- This is a reliable way to handle the insert while still validating the user
-- Created: February 2026

-- ============================================
-- Create the RPC function
-- ============================================

CREATE OR REPLACE FUNCTION public.save_gmat_training_result(
  p_student_id UUID,
  p_section TEXT,
  p_topic TEXT,
  p_score_raw INTEGER,
  p_score_total INTEGER,
  p_score_percentage DECIMAL(5,2),
  p_difficulty_breakdown JSONB DEFAULT NULL,
  p_time_spent_seconds INTEGER DEFAULT NULL,
  p_question_ids UUID[] DEFAULT NULL
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
    true,  -- Trainings don't require validation
    false, -- Results not visible until tutor enables
    NOW()
  )
  RETURNING id INTO v_result_id;

  RETURN v_result_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.save_gmat_training_result(
  UUID, TEXT, TEXT, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[]
) TO authenticated;

-- Comment
COMMENT ON FUNCTION public.save_gmat_training_result IS
  'Saves a GMAT training result for the authenticated student. Validates ownership before insert.';
