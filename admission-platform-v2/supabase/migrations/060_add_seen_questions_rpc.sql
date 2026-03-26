-- Migration: 060_add_seen_questions_rpc.sql
-- Purpose: Create a SECURITY DEFINER RPC to update seen_question_ids on
-- 2V_gmat_student_progress for the authenticated student.
--
-- The UPDATE policy on 2V_gmat_student_progress is tutor-only (migration 036),
-- so students cannot directly update their seen_question_ids array from the client.
-- This RPC mirrors the pattern used for training results (046), section assessments
-- (054), and simulation slots (059): validate ownership, then bypass RLS.
-- Created: March 2026

CREATE OR REPLACE FUNCTION public.add_gmat_seen_questions(
  p_student_id  UUID,
  p_question_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid UUID;
BEGIN
  v_auth_uid := auth.uid();

  -- Ownership check: only the student themselves can update their own seen list
  IF NOT EXISTS (
    SELECT 1 FROM "2V_profiles"
    WHERE id = p_student_id
      AND auth_uid = v_auth_uid
  ) THEN
    RAISE EXCEPTION 'Unauthorized: student_id does not match authenticated user';
  END IF;

  -- Merge incoming IDs into the existing array, deduplicating via DISTINCT unnest
  UPDATE "2V_gmat_student_progress"
  SET seen_question_ids = ARRAY(
    SELECT DISTINCT unnest(seen_question_ids || p_question_ids)
  )
  WHERE student_id = p_student_id;
END;
$$;

-- Grant execute permission to authenticated users (students)
GRANT EXECUTE ON FUNCTION public.add_gmat_seen_questions(UUID, UUID[]) TO authenticated;

COMMENT ON FUNCTION public.add_gmat_seen_questions IS
  'Merges the provided question IDs into the student''s seen_question_ids array, '
  'deduplicating automatically. Validates that the caller owns the student record. '
  'Bypasses RLS via SECURITY DEFINER so students can update their own progress.';
