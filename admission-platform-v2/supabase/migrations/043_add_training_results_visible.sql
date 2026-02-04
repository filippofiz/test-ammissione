-- Migration: 043_add_training_results_visible.sql
-- Purpose: Add results_visible column to control when students can see their training results
-- Issue: Students should not see results until tutor enables visibility
-- Created: February 2026

-- ============================================
-- Add results_visible column to assessment results
-- ============================================

ALTER TABLE "2V_gmat_assessment_results"
ADD COLUMN IF NOT EXISTS results_visible BOOLEAN DEFAULT FALSE;

-- ============================================
-- Update RLS to respect results visibility for students
-- ============================================

-- Drop existing student select policy
DROP POLICY IF EXISTS "Students view own GMAT results" ON "2V_gmat_assessment_results";

-- Create new policy that checks results_visible for training results
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
-- Add policy for students to insert with results_visible=false
-- This ensures students can't make their own results visible
-- ============================================

-- Update the student insert policy to ensure results_visible is false on insert
DROP POLICY IF EXISTS "Students create own training results" ON "2V_gmat_assessment_results";

CREATE POLICY "Students create own training results"
  ON "2V_gmat_assessment_results" FOR INSERT
  WITH CHECK (
    -- Must be for assessment_type = 'training'
    assessment_type = 'training'
    AND
    -- Must be for their own student_id
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
    AND
    -- results_visible must be false (students can't make their own results visible)
    (results_visible IS NULL OR results_visible = FALSE)
  );

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN "2V_gmat_assessment_results".results_visible IS
  'Whether the student can view this result. Controlled by tutor. Default false for training results.';
