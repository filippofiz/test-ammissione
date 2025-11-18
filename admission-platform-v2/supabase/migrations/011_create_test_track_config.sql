-- Migration: Create test track configuration table
-- Date: 2025-11-15
-- Purpose: Store configuration for different test tracks (Assessment Iniziale, Simulazioni, Training, etc.)

-- ============================================================================
-- 2V_TEST_TRACK_CONFIG - Configuration for test tracks
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_test_track_config" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Test identification
  test_type TEXT NOT NULL, -- 'GMAT', 'SAT', 'TOLC', etc.
  track_type TEXT NOT NULL, -- 'assessment_iniziale', 'simulazione', 'training', 'assessment_monotematico'

  -- Configuration for Assessment Iniziale & Simulazioni
  -- Section Order
  section_order_mode TEXT DEFAULT 'mandatory', -- 'mandatory' | 'user_choice'
  section_order JSONB, -- Array of section names in order (for mandatory mode)

  -- Time Configuration
  time_per_section JSONB, -- { "section_name": minutes } or null for no time limit
  total_time_minutes INTEGER, -- Total time for entire test or null

  -- Navigation
  navigation_mode TEXT DEFAULT 'forward_only', -- 'forward_only' | 'back_forward'
  can_leave_blank BOOLEAN DEFAULT true, -- Can student leave questions unanswered?

  -- Pause Configuration
  pause_mode TEXT DEFAULT 'no_pause', -- 'no_pause' | 'between_sections' | 'user_choice'
  pause_sections JSONB, -- Array of section names where pause is allowed, or null
  pause_duration_minutes INTEGER DEFAULT 5, -- Default pause duration

  -- Future configurations for Training & Assessment Monotematici
  -- (Currently empty, will be added later)
  training_config JSONB, -- Placeholder for training-specific config
  assessment_mono_config JSONB, -- Placeholder for assessment monotematico config

  -- Metadata
  created_by UUID REFERENCES "2V_profiles"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- Unique constraint: one config per test_type + track_type combination
  UNIQUE(test_type, track_type)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_test_track_config_test_type ON "2V_test_track_config"(test_type);
CREATE INDEX IF NOT EXISTS idx_test_track_config_track_type ON "2V_test_track_config"(track_type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_2V_test_track_config_updated_at ON "2V_test_track_config";
CREATE TRIGGER update_2V_test_track_config_updated_at
  BEFORE UPDATE ON "2V_test_track_config"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE "2V_test_track_config" ENABLE ROW LEVEL SECURITY;

-- Tutors can view all configurations
DROP POLICY IF EXISTS "Tutors view all test track configs" ON "2V_test_track_config";
CREATE POLICY "Tutors view all test track configs"
  ON "2V_test_track_config" FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb)
  );

-- Tutors can create/update configurations
DROP POLICY IF EXISTS "Tutors manage test track configs" ON "2V_test_track_config";
CREATE POLICY "Tutors manage test track configs"
  ON "2V_test_track_config" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb)
  );

-- Admins have full access
DROP POLICY IF EXISTS "Admins manage all test track configs" ON "2V_test_track_config";
CREATE POLICY "Admins manage all test track configs"
  ON "2V_test_track_config" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb)
  );

-- Students can view configurations (read-only)
DROP POLICY IF EXISTS "Students view test track configs" ON "2V_test_track_config";
CREATE POLICY "Students view test track configs"
  ON "2V_test_track_config" FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"STUDENT"'::jsonb)
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON "2V_test_track_config" TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "2V_test_track_config" IS 'Configuration for different test tracks (Assessment Iniziale, Simulazioni, Training, etc.)';
COMMENT ON COLUMN "2V_test_track_config".test_type IS 'Test type: GMAT, SAT, TOLC, etc.';
COMMENT ON COLUMN "2V_test_track_config".track_type IS 'Track type: assessment_iniziale, simulazione, training, assessment_monotematico';
COMMENT ON COLUMN "2V_test_track_config".section_order_mode IS 'mandatory (sections in fixed order) | user_choice (student can choose)';
COMMENT ON COLUMN "2V_test_track_config".section_order IS 'Array of section names in the order they should appear (for mandatory mode)';
COMMENT ON COLUMN "2V_test_track_config".time_per_section IS 'JSON object mapping section names to time in minutes';
COMMENT ON COLUMN "2V_test_track_config".navigation_mode IS 'forward_only (cannot go back) | back_forward (can navigate freely)';
COMMENT ON COLUMN "2V_test_track_config".can_leave_blank IS 'Whether students can leave questions unanswered';
COMMENT ON COLUMN "2V_test_track_config".pause_mode IS 'no_pause | between_sections (at specific sections) | user_choice';
COMMENT ON COLUMN "2V_test_track_config".pause_sections IS 'Array of section names where pause is allowed';

-- ============================================================================
-- INSERT DEFAULT CONFIGURATIONS (Examples)
-- ============================================================================

-- Example: GMAT Assessment Iniziale default config
INSERT INTO "2V_test_track_config" (test_type, track_type, section_order_mode, navigation_mode, can_leave_blank, pause_mode)
VALUES ('GMAT', 'assessment_iniziale', 'mandatory', 'forward_only', false, 'between_sections')
ON CONFLICT (test_type, track_type) DO NOTHING;

-- Example: GMAT Simulazione default config
INSERT INTO "2V_test_track_config" (test_type, track_type, section_order_mode, navigation_mode, can_leave_blank, pause_mode)
VALUES ('GMAT', 'simulazione', 'mandatory', 'forward_only', false, 'between_sections')
ON CONFLICT (test_type, track_type) DO NOTHING;

-- Example: GMAT Training placeholder
INSERT INTO "2V_test_track_config" (test_type, track_type, training_config)
VALUES ('GMAT', 'training', '{}')
ON CONFLICT (test_type, track_type) DO NOTHING;

-- Example: GMAT Assessment Monotematico placeholder
INSERT INTO "2V_test_track_config" (test_type, track_type, assessment_mono_config)
VALUES ('GMAT', 'assessment_monotematico', '{}')
ON CONFLICT (test_type, track_type) DO NOTHING;
