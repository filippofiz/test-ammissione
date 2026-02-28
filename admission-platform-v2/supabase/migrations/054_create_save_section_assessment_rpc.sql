-- Migration: 054_create_save_section_assessment_rpc.sql
-- Purpose: Create an RPC function to save section assessment results and auto-lock
-- the section, bypassing RLS. This mirrors the pattern used for training results
-- (migration 046/047). Students cannot directly INSERT/UPDATE those tables, so we
-- use a SECURITY DEFINER function that validates ownership before acting.
-- Created: February 2026

CREATE OR REPLACE FUNCTION public.save_gmat_section_assessment_result(
  p_student_id UUID,
  p_section TEXT,
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

  -- Insert the section assessment result
  INSERT INTO "2V_gmat_assessment_results" (
    student_id,
    assessment_type,
    section,
    score_raw,
    score_total,
    score_percentage,
    difficulty_breakdown,
    time_spent_seconds,
    question_ids,
    tutor_validated,
    answers_data,
    bookmarked_question_ids,
    metadata,
    completed_at
  ) VALUES (
    p_student_id,
    'section_assessment',
    p_section,
    p_score_raw,
    p_score_total,
    p_score_percentage,
    p_difficulty_breakdown,
    p_time_spent_seconds,
    p_question_ids,
    true,  -- Section assessments don't require tutor validation
    p_answers_data,
    p_bookmarked_question_ids,
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_result_id;

  -- Auto-lock the section so the student cannot retake until a tutor unlocks it.
  -- The UPDATE policy on 2V_gmat_student_progress is tutor-only, so this must
  -- happen inside the SECURITY DEFINER function rather than from the client.
  UPDATE "2V_gmat_student_progress"
  SET
    section_qr_locked = CASE WHEN p_section = 'QR' THEN true ELSE section_qr_locked END,
    section_di_locked = CASE WHEN p_section = 'DI' THEN true ELSE section_di_locked END,
    section_vr_locked = CASE WHEN p_section = 'VR' THEN true ELSE section_vr_locked END
  WHERE student_id = p_student_id;

  RETURN v_result_id;
END;
$$;

-- Grant execute permission to authenticated users (students)
GRANT EXECUTE ON FUNCTION public.save_gmat_section_assessment_result(
  UUID, TEXT, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[], JSONB, UUID[], JSONB
) TO authenticated;

-- Comment
COMMENT ON FUNCTION public.save_gmat_section_assessment_result IS
  'Saves a GMAT section assessment result for the authenticated student and auto-locks the section. Validates ownership before acting. Bypasses RLS via SECURITY DEFINER.';
