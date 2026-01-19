-- Migration: 036_add_gmat_student_tracking.sql
-- Purpose: Create table to track GMAT student progress including cycle and seen questions
-- Created: January 2026

-- ============================================
-- Create GMAT Student Progress Table
-- ============================================

-- This table stores GMAT-specific progress data for each student:
-- - gmat_cycle: Which preparation cycle the student is in (Foundation/Development/Excellence)
-- - seen_question_ids: Array of question UUIDs the student has already seen (to avoid repetition)

CREATE TABLE IF NOT EXISTS "2V_gmat_student_progress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  gmat_cycle TEXT NOT NULL CHECK (gmat_cycle IN ('Foundation', 'Development', 'Excellence')),
  seen_question_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- ============================================
-- Indexes
-- ============================================

-- Index for fast student lookups
CREATE INDEX IF NOT EXISTS idx_gmat_progress_student
  ON "2V_gmat_student_progress"(student_id);

-- GIN index for efficient array operations on seen_question_ids
-- This enables fast queries like: WHERE 'uuid' = ANY(seen_question_ids)
CREATE INDEX IF NOT EXISTS idx_gmat_progress_seen_questions
  ON "2V_gmat_student_progress" USING GIN(seen_question_ids);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE "2V_gmat_student_progress" ENABLE ROW LEVEL SECURITY;

-- Students can view their own progress
CREATE POLICY "Students view own GMAT progress"
  ON "2V_gmat_student_progress" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );

-- Tutors and Admins can view all progress
CREATE POLICY "Tutors view all GMAT progress"
  ON "2V_gmat_student_progress" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Tutors and Admins can insert new progress records
CREATE POLICY "Tutors create GMAT progress"
  ON "2V_gmat_student_progress" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Tutors and Admins can update progress records
CREATE POLICY "Tutors update GMAT progress"
  ON "2V_gmat_student_progress" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Tutors and Admins can delete progress records
CREATE POLICY "Tutors delete GMAT progress"
  ON "2V_gmat_student_progress" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- ============================================
-- Trigger for updated_at
-- ============================================

-- Create or replace function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_gmat_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS trigger_update_gmat_progress_updated_at ON "2V_gmat_student_progress";
CREATE TRIGGER trigger_update_gmat_progress_updated_at
  BEFORE UPDATE ON "2V_gmat_student_progress"
  FOR EACH ROW
  EXECUTE FUNCTION update_gmat_progress_updated_at();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE "2V_gmat_student_progress" IS
  'Stores GMAT-specific progress data for students including their cycle and seen questions';

COMMENT ON COLUMN "2V_gmat_student_progress".student_id IS
  'Reference to the student profile';

COMMENT ON COLUMN "2V_gmat_student_progress".gmat_cycle IS
  'GMAT preparation cycle: Foundation (505-605), Development (605-665), or Excellence (665-715+)';

COMMENT ON COLUMN "2V_gmat_student_progress".seen_question_ids IS
  'Array of question UUIDs the student has already seen to prevent repetition across tests';

COMMENT ON COLUMN "2V_gmat_student_progress".created_at IS
  'When the GMAT preparation was initialized for this student';

COMMENT ON COLUMN "2V_gmat_student_progress".updated_at IS
  'When this record was last updated (auto-managed by trigger)';
