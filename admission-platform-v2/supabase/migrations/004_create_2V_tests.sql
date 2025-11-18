-- Migration: Create 2V_tests table structure
-- Date: 2025-11-15
-- Purpose: Test definitions table - ONE row per unique test

-- ============================================================================
-- 2V_TESTS - Test definitions
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_tests" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Test identification (standardized from old system)
  test_type TEXT NOT NULL,      -- tipologia_test: "ARCHED", "GMAT", "BOCCONI", etc.
  section TEXT NOT NULL,         -- Section: "Multi-topic" or specific topic
  exercise_type TEXT NOT NULL,   -- "Training", "Assessment Monotematico", "Assessment Iniziale", "Simulazione"
  test_number INTEGER NOT NULL,  -- Test instance number (1, 2, 3...) from old progressivo

  -- Test configuration
  format TEXT NOT NULL,          -- "pdf" or "interactive"
  default_duration_mins INTEGER, -- Default duration in minutes

  -- Metadata
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_by UUID REFERENCES "2V_profiles"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Unique constraint: one test per combination including test_number
  UNIQUE(test_type, section, exercise_type, test_number, format)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_2V_tests_test_type ON "2V_tests"(test_type);
CREATE INDEX IF NOT EXISTS idx_2V_tests_section ON "2V_tests"(section);
CREATE INDEX IF NOT EXISTS idx_2V_tests_exercise_type ON "2V_tests"(exercise_type);
CREATE INDEX IF NOT EXISTS idx_2V_tests_test_number ON "2V_tests"(test_number);
CREATE INDEX IF NOT EXISTS idx_2V_tests_format ON "2V_tests"(format);
CREATE INDEX IF NOT EXISTS idx_2V_tests_is_active ON "2V_tests"(is_active);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_2V_tests_updated_at ON "2V_tests";
CREATE TRIGGER update_2V_tests_updated_at
  BEFORE UPDATE ON "2V_tests"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE "2V_tests" ENABLE ROW LEVEL SECURITY;

-- Everyone can view active tests
DROP POLICY IF EXISTS "Everyone can view active tests" ON "2V_tests";
CREATE POLICY "Everyone can view active tests"
  ON "2V_tests" FOR SELECT
  USING (is_active = true);

-- Tutors and admins can manage tests
DROP POLICY IF EXISTS "Tutors and admins can manage tests" ON "2V_tests";
CREATE POLICY "Tutors and admins can manage tests"
  ON "2V_tests" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON "2V_tests" TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "2V_tests" IS 'Test definitions - ONE row per unique test';
COMMENT ON COLUMN "2V_tests".test_type IS 'Test type: ARCHED, GMAT, BOCCONI, etc.';
COMMENT ON COLUMN "2V_tests".section IS 'Section: "Multi-topic" for Simulazioni/Assessment Iniziale, or specific topic';
COMMENT ON COLUMN "2V_tests".exercise_type IS 'Training | Assessment Monotematico | Assessment Iniziale | Simulazione';
COMMENT ON COLUMN "2V_tests".test_number IS 'Test instance number (1, 2, 3...) - allows multiple tests of same type';
COMMENT ON COLUMN "2V_tests".format IS 'pdf or interactive';
COMMENT ON COLUMN "2V_tests".default_duration_mins IS 'Default time limit in minutes';
