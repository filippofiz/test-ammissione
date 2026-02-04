-- Migration: 045_simplify_student_training_insert.sql
-- Purpose: Simplify the RLS policy for students inserting training results
-- Using EXISTS pattern which is more reliable than IN (SELECT...)
-- Created: February 2026

-- ============================================
-- Drop all existing student insert policies
-- ============================================

DROP POLICY IF EXISTS "Students create own training results" ON "2V_gmat_assessment_results";
DROP POLICY IF EXISTS "Students insert own training results" ON "2V_gmat_assessment_results";
DROP POLICY IF EXISTS "Students can insert training results" ON "2V_gmat_assessment_results";

-- ============================================
-- Create new policy using EXISTS pattern
-- ============================================

CREATE POLICY "Students create own training results"
  ON "2V_gmat_assessment_results" FOR INSERT
  WITH CHECK (
    -- Must be a training result
    assessment_type = 'training'
    AND
    -- The student_id must match a profile where auth_uid = current user
    EXISTS (
      SELECT 1
      FROM "2V_profiles" p
      WHERE p.id = student_id
        AND p.auth_uid = auth.uid()
    )
  );

-- ============================================
-- Verify: Run this query to check the policy
-- ============================================
-- SELECT polname, polcmd, pg_get_expr(polwithcheck, polrelid) as with_check
-- FROM pg_policy
-- WHERE polrelid = '2V_gmat_assessment_results'::regclass
--   AND polname = 'Students create own training results';
