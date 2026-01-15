-- Migration: 033_create_gmat_materials.sql
-- Purpose: Create tables for GMAT lesson materials and student assignments
-- Created: January 2025

-- 2V_lesson_materials: Stores metadata for PDF materials
CREATE TABLE "2V_lesson_materials" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type TEXT NOT NULL,              -- 'GMAT'
  section TEXT NOT NULL,                -- 'QR', 'VR', 'DI'
  topic TEXT NOT NULL,                  -- 'number-properties-arithmetic', etc.
  material_type TEXT NOT NULL,          -- 'lesson', 'training', 'assessment', 'context', 'slide'
  title TEXT NOT NULL,
  description TEXT,
  pdf_storage_path TEXT NOT NULL,       -- Path in Supabase bucket
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(test_type, section, topic, material_type, title)
);

-- 2V_material_assignments: Tracks which materials are unlocked for which students
CREATE TABLE "2V_material_assignments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES "2V_lesson_materials"(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES "2V_profiles"(id),
  is_unlocked BOOLEAN DEFAULT true,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_lesson_materials_test_type ON "2V_lesson_materials"(test_type);
CREATE INDEX idx_lesson_materials_section ON "2V_lesson_materials"(section);
CREATE INDEX idx_lesson_materials_topic ON "2V_lesson_materials"(topic);
CREATE INDEX idx_lesson_materials_active ON "2V_lesson_materials"(is_active) WHERE is_active = true;
CREATE INDEX idx_material_assignments_student ON "2V_material_assignments"(student_id);
CREATE INDEX idx_material_assignments_material ON "2V_material_assignments"(material_id);

-- Enable Row Level Security
ALTER TABLE "2V_lesson_materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "2V_material_assignments" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 2V_lesson_materials

-- Everyone can view active materials metadata (not the PDFs themselves)
CREATE POLICY "View active materials"
  ON "2V_lesson_materials" FOR SELECT
  USING (is_active = true);

-- Tutors and Admins can manage all materials
CREATE POLICY "Tutors manage materials"
  ON "2V_lesson_materials" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- RLS Policies for 2V_material_assignments

-- Students can view their own assignments
CREATE POLICY "Students view own assignments"
  ON "2V_material_assignments" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );

-- Students can update their own assignments (for marking viewed/completed)
CREATE POLICY "Students update own assignments"
  ON "2V_material_assignments" FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );

-- Tutors and Admins can manage all assignments
CREATE POLICY "Tutors manage assignments"
  ON "2V_material_assignments" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Trigger to update updated_at on lesson_materials
CREATE OR REPLACE FUNCTION update_lesson_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lesson_materials_updated_at
  BEFORE UPDATE ON "2V_lesson_materials"
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_materials_updated_at();
