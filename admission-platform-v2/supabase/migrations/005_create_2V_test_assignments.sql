-- Migration: Create 2V_test_assignments table
-- Date: 2025-11-15
-- Purpose: Student-test assignments (ONE row per student-test combination)

-- ============================================================================
-- 2V_TEST_ASSIGNMENTS - ONE row per student-test combination
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_test_assignments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES "2V_tests"(id) ON DELETE CASCADE,

  -- Status
  status TEXT NOT NULL DEFAULT 'locked', -- 'locked', 'unlocked', 'in_progress', 'completed'

  -- Attempt tracking (TEMPORARY - will move to separate attempts table later)
  start_time TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Time spent in seconds
  score DECIMAL(10,2),

  -- Assignment metadata
  assigned_by UUID REFERENCES "2V_profiles"(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Unique: one assignment per student-test combination
  UNIQUE(student_id, test_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_2V_test_assignments_student_id ON "2V_test_assignments"(student_id);
CREATE INDEX IF NOT EXISTS idx_2V_test_assignments_test_id ON "2V_test_assignments"(test_id);
CREATE INDEX IF NOT EXISTS idx_2V_test_assignments_status ON "2V_test_assignments"(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_2V_test_assignments_updated_at ON "2V_test_assignments";
CREATE TRIGGER update_2V_test_assignments_updated_at
  BEFORE UPDATE ON "2V_test_assignments"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE "2V_test_assignments" ENABLE ROW LEVEL SECURITY;

-- Students can view their own assignments
DROP POLICY IF EXISTS "Students view own assignments" ON "2V_test_assignments";
CREATE POLICY "Students view own assignments"
  ON "2V_test_assignments" FOR SELECT
  USING (student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()));

-- Students can update their own assignments (for status changes)
DROP POLICY IF EXISTS "Students update own assignments" ON "2V_test_assignments";
CREATE POLICY "Students update own assignments"
  ON "2V_test_assignments" FOR UPDATE
  USING (student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()));

-- Tutors can view their students' assignments
DROP POLICY IF EXISTS "Tutors view student assignments" ON "2V_test_assignments";
CREATE POLICY "Tutors view student assignments"
  ON "2V_test_assignments" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
    )
  );

-- Tutors can manage (insert/update/delete) their students' assignments
DROP POLICY IF EXISTS "Tutors manage student assignments" ON "2V_test_assignments";
CREATE POLICY "Tutors manage student assignments"
  ON "2V_test_assignments" FOR ALL
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb)
    )
  );

-- Admins have full access
DROP POLICY IF EXISTS "Admins manage all assignments" ON "2V_test_assignments";
CREATE POLICY "Admins manage all assignments"
  ON "2V_test_assignments" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb)
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON "2V_test_assignments" TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "2V_test_assignments" IS 'Student-test assignments - ONE row per student-test combination';
COMMENT ON COLUMN "2V_test_assignments".student_id IS 'References 2V_profiles';
COMMENT ON COLUMN "2V_test_assignments".test_id IS 'References 2V_tests (includes test_number for different instances)';
COMMENT ON COLUMN "2V_test_assignments".status IS 'locked | unlocked | in_progress | completed';
COMMENT ON COLUMN "2V_test_assignments".start_time IS 'TEMPORARY: Student attempt start time - will move to attempts table';
COMMENT ON COLUMN "2V_test_assignments".completed_at IS 'TEMPORARY: Student attempt completion time - will move to attempts table';
COMMENT ON COLUMN "2V_test_assignments".duration IS 'TEMPORARY: Time student spent in seconds - will move to attempts table';
COMMENT ON COLUMN "2V_test_assignments".score IS 'TEMPORARY: Student score - will move to attempts table';
