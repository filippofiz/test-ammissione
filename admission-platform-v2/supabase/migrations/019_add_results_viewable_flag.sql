-- Migration: Add results viewable flag for tutor control
-- Date: 2025-11-17
-- Purpose: Allow tutors to control when students can view test results

-- Add column to control results visibility
ALTER TABLE "2V_test_assignments"
ADD COLUMN IF NOT EXISTS results_viewable_by_student BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN "2V_test_assignments".results_viewable_by_student IS 'Controls whether student can view detailed results for this test. Tutor must enable this after reviewing corrections with student.';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_test_assignments_results_viewable
  ON "2V_test_assignments"(results_viewable_by_student)
  WHERE results_viewable_by_student = true;
