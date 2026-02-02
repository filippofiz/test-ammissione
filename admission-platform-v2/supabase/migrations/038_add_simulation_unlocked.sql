-- Migration: 038_add_simulation_unlocked.sql
-- Purpose: Add simulation_unlocked flag for manual tutor control of GMAT simulations
-- Created: January 2026

-- ============================================
-- Add simulation_unlocked column
-- ============================================

-- Add column to track whether simulations are manually unlocked by tutor
-- Default to false (locked) - tutors must explicitly unlock
ALTER TABLE "2V_gmat_student_progress"
ADD COLUMN IF NOT EXISTS simulation_unlocked BOOLEAN DEFAULT FALSE;

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN "2V_gmat_student_progress".simulation_unlocked IS
  'Manual flag for tutor to unlock/lock GMAT simulations. Replaces auto-unlock based on section assessment scores.';
