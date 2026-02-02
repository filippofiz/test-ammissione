-- Migration: 039_add_section_assessment_locks.sql
-- Purpose: Add section assessment lock flags for tutor control of individual section assessments
-- Created: January 2026

-- ============================================
-- Add section assessment lock columns
-- ============================================

-- Add columns to track whether each section assessment is locked by tutor
-- Default to false (unlocked) - students can take assessments unless explicitly locked
ALTER TABLE "2V_gmat_student_progress"
ADD COLUMN IF NOT EXISTS section_qr_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS section_di_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS section_vr_locked BOOLEAN DEFAULT FALSE;

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN "2V_gmat_student_progress".section_qr_locked IS
  'Manual flag for tutor to lock/unlock Quantitative Reasoning section assessment.';

COMMENT ON COLUMN "2V_gmat_student_progress".section_di_locked IS
  'Manual flag for tutor to lock/unlock Data Insights section assessment.';

COMMENT ON COLUMN "2V_gmat_student_progress".section_vr_locked IS
  'Manual flag for tutor to lock/unlock Verbal Reasoning section assessment.';
