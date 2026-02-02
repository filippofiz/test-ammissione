-- Migration: 040_add_initial_assessment_visibility.sql
-- Purpose: Add initial assessment visibility control for tutors
-- Created: January 2026

-- ============================================
-- Add initial assessment visibility column
-- ============================================

-- Add column to control whether the initial assessment section is visible to students
-- Default to true (visible) - tutors can hide it if needed
ALTER TABLE "2V_gmat_student_progress"
ADD COLUMN IF NOT EXISTS initial_assessment_visible BOOLEAN DEFAULT TRUE;

-- Add column to control whether the initial assessment results are visible to students
-- Default to true (visible) - tutors can hide results while keeping section visible
ALTER TABLE "2V_gmat_student_progress"
ADD COLUMN IF NOT EXISTS initial_assessment_results_visible BOOLEAN DEFAULT TRUE;

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN "2V_gmat_student_progress".initial_assessment_visible IS
  'Manual flag for tutor to show/hide the Initial Assessment section from student view.';

COMMENT ON COLUMN "2V_gmat_student_progress".initial_assessment_results_visible IS
  'Manual flag for tutor to show/hide the Initial Assessment results from student view.';
