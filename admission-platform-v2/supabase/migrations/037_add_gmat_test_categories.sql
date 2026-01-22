-- Migration: 037_add_gmat_test_categories.sql
-- Purpose: Add GMAT test category system and assessment results table
-- Created: January 2026
-- Phase 8.1 of GMAT Integration Plan

-- ============================================
-- Add GMAT Test Category to Lesson Materials
-- ============================================

-- Add category column to organize GMAT materials by test type
-- Categories: placement, quick_test, training, topic_assessment, section_assessment, mock
-- NULL is allowed for backward compatibility with existing materials

ALTER TABLE "2V_lesson_materials"
ADD COLUMN IF NOT EXISTS gmat_test_category TEXT
CHECK (gmat_test_category IS NULL OR gmat_test_category IN (
  'placement',
  'quick_test',
  'training',
  'topic_assessment',
  'section_assessment',
  'mock'
));

-- Index for fast category lookups (partial index only for non-null categories)
CREATE INDEX IF NOT EXISTS idx_lesson_materials_gmat_category
ON "2V_lesson_materials"(gmat_test_category)
WHERE gmat_test_category IS NOT NULL;

-- ============================================
-- Create GMAT Assessment Results Table
-- ============================================

-- This table stores results from GMAT assessments with tutor validation support
-- Key features:
-- - Stores suggested_cycle from algorithm and assigned_cycle after tutor validation
-- - tutor_validated flag ensures cycle assignment requires tutor confirmation
-- - Supports all assessment types: placement, topic_assessment, section_assessment, mock

CREATE TABLE IF NOT EXISTS "2V_gmat_assessment_results" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Student reference
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,

  -- Assessment identification
  assessment_type TEXT NOT NULL CHECK (assessment_type IN (
    'placement',
    'topic_assessment',
    'section_assessment',
    'mock'
  )),
  section TEXT,  -- QR, DI, VR, or NULL for full test (placement/mock)
  topic TEXT,    -- For topic assessments only (e.g., '01-data-sufficiency')

  -- Score data
  score_raw INTEGER NOT NULL,
  score_total INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  difficulty_breakdown JSONB,  -- { easy: { correct: 5, total: 5 }, medium: {...}, hard: {...} }
  time_spent_seconds INTEGER,

  -- Cycle assignment (for placement assessments)
  suggested_cycle TEXT CHECK (suggested_cycle IS NULL OR suggested_cycle IN (
    'Foundation', 'Development', 'Excellence'
  )),
  assigned_cycle TEXT CHECK (assigned_cycle IS NULL OR assigned_cycle IN (
    'Foundation', 'Development', 'Excellence'
  )),

  -- Tutor validation (REQUIRED before cycle is applied)
  tutor_validated BOOLEAN DEFAULT FALSE,
  validated_by UUID REFERENCES "2V_profiles"(id),
  validated_at TIMESTAMPTZ,
  tutor_notes TEXT,

  -- Questions reference
  question_ids UUID[],

  -- Timestamps
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate results for same assessment (allow retakes with different completed_at)
  UNIQUE(student_id, assessment_type, section, topic, completed_at)
);

-- ============================================
-- Indexes for Assessment Results
-- ============================================

-- Fast student lookups
CREATE INDEX IF NOT EXISTS idx_gmat_results_student
ON "2V_gmat_assessment_results"(student_id);

-- Fast assessment type filtering
CREATE INDEX IF NOT EXISTS idx_gmat_results_type
ON "2V_gmat_assessment_results"(assessment_type);

-- Fast lookup for pending tutor validations
CREATE INDEX IF NOT EXISTS idx_gmat_results_pending_validation
ON "2V_gmat_assessment_results"(tutor_validated)
WHERE tutor_validated = FALSE;

-- Composite index for common query pattern: student + type + section
CREATE INDEX IF NOT EXISTS idx_gmat_results_student_type_section
ON "2V_gmat_assessment_results"(student_id, assessment_type, section);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE "2V_gmat_assessment_results" ENABLE ROW LEVEL SECURITY;

-- Students can view their own assessment results
CREATE POLICY "Students view own GMAT results"
  ON "2V_gmat_assessment_results" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );

-- Tutors and Admins can view all results
CREATE POLICY "Tutors view all GMAT results"
  ON "2V_gmat_assessment_results" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Tutors and Admins can insert results (when test is completed)
CREATE POLICY "Tutors create GMAT results"
  ON "2V_gmat_assessment_results" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Tutors and Admins can update results (for validation)
CREATE POLICY "Tutors update GMAT results"
  ON "2V_gmat_assessment_results" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Tutors and Admins can delete results
CREATE POLICY "Tutors delete GMAT results"
  ON "2V_gmat_assessment_results" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN "2V_lesson_materials".gmat_test_category IS
  'GMAT test category: placement, quick_test, training, topic_assessment, section_assessment, mock';

COMMENT ON TABLE "2V_gmat_assessment_results" IS
  'Stores GMAT assessment results with tutor validation support for cycle assignment';

COMMENT ON COLUMN "2V_gmat_assessment_results".assessment_type IS
  'Type of assessment: placement (initial), topic_assessment, section_assessment, or mock';

COMMENT ON COLUMN "2V_gmat_assessment_results".suggested_cycle IS
  'Cycle suggested by scoring algorithm (for placement assessments)';

COMMENT ON COLUMN "2V_gmat_assessment_results".assigned_cycle IS
  'Actual cycle assigned after tutor validation (may differ from suggested)';

COMMENT ON COLUMN "2V_gmat_assessment_results".tutor_validated IS
  'Whether a tutor has reviewed and confirmed the cycle assignment';

COMMENT ON COLUMN "2V_gmat_assessment_results".difficulty_breakdown IS
  'JSON breakdown of performance by difficulty: { easy: {correct, total}, medium: {...}, hard: {...} }';
