-- Migration: Create test tables for Test Runner
-- Date: 2025-11-16
-- Purpose: Duplicate all tables with _test suffix for isolated testing

-- ============================================================================
-- PROFILES TEST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_profiles_test" (
  LIKE "2V_profiles" INCLUDING ALL
);

-- ============================================================================
-- TESTS TEST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_tests_test" (
  LIKE "2V_tests" INCLUDING ALL
);

-- ============================================================================
-- QUESTIONS TEST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_questions_test" (
  LIKE "2V_questions" INCLUDING ALL
);

-- ============================================================================
-- TEST ASSIGNMENTS TEST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_test_assignments_test" (
  LIKE "2V_test_assignments" INCLUDING ALL
);

-- ============================================================================
-- STUDENT ANSWERS TEST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_student_answers_test" (
  LIKE "2V_student_answers" INCLUDING ALL
);

-- Truncate student data (Test Runner will create its own)
TRUNCATE TABLE "2V_student_answers_test" CASCADE;
TRUNCATE TABLE "2V_test_assignments_test" CASCADE;
TRUNCATE TABLE "2V_profiles_test" CASCADE;

-- Add foreign key constraints (not copied by LIKE)
DO $$
BEGIN
  -- Drop existing constraints if they exist
  ALTER TABLE "2V_student_answers_test" DROP CONSTRAINT IF EXISTS fk_student_answers_test_student;
  ALTER TABLE "2V_student_answers_test" DROP CONSTRAINT IF EXISTS fk_student_answers_test_question;
  ALTER TABLE "2V_student_answers_test" DROP CONSTRAINT IF EXISTS fk_student_answers_test_assignment;

  -- Add new constraints
  ALTER TABLE "2V_student_answers_test"
    ADD CONSTRAINT fk_student_answers_test_student
      FOREIGN KEY (student_id) REFERENCES "2V_profiles_test"(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_student_answers_test_question
      FOREIGN KEY (question_id) REFERENCES "2V_questions_test"(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_student_answers_test_assignment
      FOREIGN KEY (assignment_id) REFERENCES "2V_test_assignments_test"(id) ON DELETE CASCADE;
END $$;

-- ============================================================================
-- TEST TRACK CONFIG TEST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_test_track_config_test" (
  LIKE "2V_test_track_config" INCLUDING ALL
);

-- ============================================================================
-- ALGORITHM CONFIG TEST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_algorithm_config_test" (
  LIKE "2V_algorithm_config" INCLUDING ALL
);

-- ============================================================================
-- ROW LEVEL SECURITY (Disabled for test tables)
-- ============================================================================

ALTER TABLE "2V_profiles_test" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "2V_tests_test" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "2V_questions_test" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "2V_test_assignments_test" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "2V_student_answers_test" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "2V_test_track_config_test" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "2V_algorithm_config_test" DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- GRANTS (Full access for authenticated users)
-- ============================================================================

GRANT ALL ON "2V_profiles_test" TO authenticated;
GRANT ALL ON "2V_tests_test" TO authenticated;
GRANT ALL ON "2V_questions_test" TO authenticated;
GRANT ALL ON "2V_test_assignments_test" TO authenticated;
GRANT ALL ON "2V_student_answers_test" TO authenticated;
GRANT ALL ON "2V_test_track_config_test" TO authenticated;
GRANT ALL ON "2V_algorithm_config_test" TO authenticated;

-- ============================================================================
-- COPY STRUCTURE DATA (Tests and Track Config)
-- ============================================================================

-- Copy test types and questions from production to test tables
-- Note: Using INSERT INTO ... SELECT without ON CONFLICT since constraints may not be copied
-- Alternatively, delete and re-insert
TRUNCATE TABLE "2V_tests_test" CASCADE;
INSERT INTO "2V_tests_test" SELECT * FROM "2V_tests";

TRUNCATE TABLE "2V_questions_test" CASCADE;
INSERT INTO "2V_questions_test" SELECT * FROM "2V_questions";

TRUNCATE TABLE "2V_test_track_config_test" CASCADE;
INSERT INTO "2V_test_track_config_test" SELECT * FROM "2V_test_track_config";

-- Copy algorithm config if exists
TRUNCATE TABLE "2V_algorithm_config_test" CASCADE;
INSERT INTO "2V_algorithm_config_test" SELECT * FROM "2V_algorithm_config";

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "2V_profiles_test" IS 'Test table for Test Runner - mirrors 2V_profiles structure';
COMMENT ON TABLE "2V_tests_test" IS 'Test table for Test Runner - mirrors 2V_tests structure';
COMMENT ON TABLE "2V_questions_test" IS 'Test table for Test Runner - mirrors 2V_questions structure';
COMMENT ON TABLE "2V_test_assignments_test" IS 'Test table for Test Runner - mirrors 2V_test_assignments structure';
COMMENT ON TABLE "2V_student_answers_test" IS 'Test table for Test Runner - mirrors 2V_student_answers structure';
COMMENT ON TABLE "2V_test_track_config_test" IS 'Test table for Test Runner - mirrors 2V_test_track_config structure';
COMMENT ON TABLE "2V_algorithm_config_test" IS 'Test table for Test Runner - mirrors 2V_algorithm_config structure';

-- ============================================================================
-- HELPER FUNCTION: Cleanup Test Data
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_test_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Truncate all test tables (cascades to remove all test data)
  TRUNCATE TABLE "2V_student_answers_test" CASCADE;
  TRUNCATE TABLE "2V_test_assignments_test" CASCADE;
  TRUNCATE TABLE "2V_profiles_test" CASCADE;

  -- Re-copy structure data
  TRUNCATE TABLE "2V_tests_test" CASCADE;
  INSERT INTO "2V_tests_test" SELECT * FROM "2V_tests";

  TRUNCATE TABLE "2V_questions_test" CASCADE;
  INSERT INTO "2V_questions_test" SELECT * FROM "2V_questions";

  TRUNCATE TABLE "2V_test_track_config_test" CASCADE;
  INSERT INTO "2V_test_track_config_test" SELECT * FROM "2V_test_track_config";

  TRUNCATE TABLE "2V_algorithm_config_test" CASCADE;
  INSERT INTO "2V_algorithm_config_test" SELECT * FROM "2V_algorithm_config";

  RAISE NOTICE 'Test tables cleaned up successfully';
END;
$$;

COMMENT ON FUNCTION cleanup_test_tables() IS 'Cleanup all test data - call after running tests';
