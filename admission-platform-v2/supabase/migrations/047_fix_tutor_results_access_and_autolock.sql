-- Migration: 047_fix_tutor_results_access_and_autolock.sql
-- Purpose:
-- 1. Ensure tutors can view all assessment results regardless of results_visible
-- 2. Update the RPC function to auto-lock training after completion
-- Created: February 2026

-- ============================================
-- Step 1: Fix tutor SELECT policy
-- ============================================

-- Drop any existing tutor select policy
DROP POLICY IF EXISTS "Tutors view all GMAT results" ON "2V_gmat_assessment_results";

-- Recreate tutor select policy - tutors see everything
CREATE POLICY "Tutors view all GMAT results"
  ON "2V_gmat_assessment_results" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- ============================================
-- Step 2: Update RPC function to auto-lock training
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

  -- Auto-lock the training after completion
  -- This prevents the student from retaking without tutor unlock
  INSERT INTO "2V_gmat_training_locks" (student_id, template_id, is_locked, locked_by)
  VALUES (p_student_id, p_topic::UUID, true, NULL)
  ON CONFLICT (student_id, template_id)
  DO UPDATE SET is_locked = true, updated_at = NOW();

  RETURN v_result_id;
END;
$$;

-- ============================================
-- Step 3: Ensure the training locks table allows student inserts via RPC
-- The RPC runs as SECURITY DEFINER so this should work, but let's be safe
-- ============================================

-- Add policy for the RPC function to insert locks
-- (SECURITY DEFINER functions bypass RLS, but this is for completeness)

-- ============================================
-- Verification queries (run manually)
-- ============================================
-- Check all policies on the table:
-- SELECT polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr
-- FROM pg_policy
-- WHERE polrelid = '2V_gmat_assessment_results'::regclass;
