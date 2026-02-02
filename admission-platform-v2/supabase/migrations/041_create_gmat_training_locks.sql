-- Migration: Create GMAT Training Locks Table
-- This table tracks the lock/unlock status of GMAT training tests for students
-- Training templates are stored in 2V_lesson_materials (with is_template=true and test_type='GMAT')

-- Create the GMAT training locks table
CREATE TABLE IF NOT EXISTS "2V_gmat_training_locks" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES "2V_lesson_materials"(id) ON DELETE CASCADE,
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  locked_by UUID REFERENCES "2V_profiles"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each student can only have one lock record per template
  UNIQUE(student_id, template_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_gmat_training_locks_student_id ON "2V_gmat_training_locks"(student_id);
CREATE INDEX IF NOT EXISTS idx_gmat_training_locks_template_id ON "2V_gmat_training_locks"(template_id);

-- Enable RLS
ALTER TABLE "2V_gmat_training_locks" ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Students can view their own lock records
CREATE POLICY "Students can view own training locks"
  ON "2V_gmat_training_locks"
  FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
    )
  );

-- Tutors can view and manage lock records for their students
CREATE POLICY "Tutors can view student training locks"
  ON "2V_gmat_training_locks"
  FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (
        SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can insert training locks"
  ON "2V_gmat_training_locks"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can update training locks"
  ON "2V_gmat_training_locks"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can delete training locks"
  ON "2V_gmat_training_locks"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_gmat_training_locks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gmat_training_locks_updated_at
  BEFORE UPDATE ON "2V_gmat_training_locks"
  FOR EACH ROW
  EXECUTE FUNCTION update_gmat_training_locks_updated_at();
