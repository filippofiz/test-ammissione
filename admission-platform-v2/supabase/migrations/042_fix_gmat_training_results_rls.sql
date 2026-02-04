-- Migration: 042_fix_gmat_training_results_rls.sql
-- Purpose: Allow students to insert their own training results
-- Issue: Students get RLS error when completing training tests
-- Created: February 2026

-- ============================================
-- Update assessment_type CHECK constraint to include 'training'
-- ============================================

-- First, drop the existing constraint
ALTER TABLE "2V_gmat_assessment_results"
DROP CONSTRAINT IF EXISTS "2V_gmat_assessment_results_assessment_type_check";

-- Add updated constraint that includes 'training'
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
-- Add RLS policy for students to insert their own training results
-- ============================================

-- Students can insert their own training results
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
  );

-- ============================================
-- Comments
-- ============================================

COMMENT ON POLICY "Students create own training results" ON "2V_gmat_assessment_results" IS
  'Allows students to insert their own training results when completing training tests';
