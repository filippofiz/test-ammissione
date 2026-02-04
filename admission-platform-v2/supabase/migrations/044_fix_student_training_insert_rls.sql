-- Migration: 044_fix_student_training_insert_rls.sql
-- Purpose: Fix RLS policy for students inserting training results
-- Issue: Students still get RLS error when completing training tests
-- Created: February 2026

-- ============================================
-- Step 1: Ensure 'training' is in the CHECK constraint
-- ============================================

-- Drop any existing constraint (handle different possible names)
DO $$
BEGIN
  -- Try dropping with the expected name
  ALTER TABLE "2V_gmat_assessment_results" DROP CONSTRAINT IF EXISTS "2V_gmat_assessment_results_assessment_type_check";
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore errors
END $$;

-- Also try the auto-generated constraint name pattern
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = '2V_gmat_assessment_results'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%assessment_type%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "2V_gmat_assessment_results" DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore errors
END $$;

-- Add the correct constraint
ALTER TABLE "2V_gmat_assessment_results"
ADD CONSTRAINT "2V_gmat_assessment_results_assessment_type_check"
CHECK (assessment_type IN (
  'placement',
  'topic_assessment',
  'section_assessment',
  'mock',
  'training'
));

-- ============================================
-- Step 2: Ensure results_visible column exists
-- ============================================

ALTER TABLE "2V_gmat_assessment_results"
ADD COLUMN IF NOT EXISTS results_visible BOOLEAN DEFAULT FALSE;

-- ============================================
-- Step 3: Drop ALL existing student insert policies and recreate
-- ============================================

DROP POLICY IF EXISTS "Students create own training results" ON "2V_gmat_assessment_results";
DROP POLICY IF EXISTS "Students insert own training results" ON "2V_gmat_assessment_results";
DROP POLICY IF EXISTS "Students can insert training results" ON "2V_gmat_assessment_results";

-- Create a simple, permissive policy for students inserting training results
-- The key is that we only check:
-- 1. It's a training result
-- 2. The student_id matches the authenticated user
CREATE POLICY "Students create own training results"
  ON "2V_gmat_assessment_results" FOR INSERT
  WITH CHECK (
    assessment_type = 'training'
    AND
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );

-- ============================================
-- Step 4: Fix the SELECT policy for students
-- ============================================

DROP POLICY IF EXISTS "Students view own GMAT results" ON "2V_gmat_assessment_results";

-- Students can view their own results, but training results require results_visible=true
CREATE POLICY "Students view own GMAT results"
  ON "2V_gmat_assessment_results" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
    AND (
      -- Non-training results are always visible to the student
      assessment_type != 'training'
      OR
      -- Training results only visible if results_visible is true
      results_visible = TRUE
    )
  );

-- ============================================
-- Verification query (run manually to check)
-- ============================================
-- SELECT polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr,
--        pg_get_expr(polwithcheck, polrelid) as with_check_expr
-- FROM pg_policy
-- WHERE polrelid = '2V_gmat_assessment_results'::regclass;
