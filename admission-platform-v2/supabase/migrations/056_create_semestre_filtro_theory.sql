-- Migration: 056_create_semestre_filtro_theory.sql
-- Purpose: Create tables for Semestre Filtro theory content, student access, and progress
-- Created: March 2026

-- Theory content blocks
CREATE TABLE semestre_filtro_theory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type TEXT NOT NULL DEFAULT 'SEMESTRE FILTRO',
  materia TEXT NOT NULL,
  section TEXT NOT NULL,
  topic TEXT,                          -- NULL = section-level theory
  title TEXT NOT NULL,
  content_raw TEXT NOT NULL DEFAULT '',  -- Admin's raw input
  content_formatted TEXT,              -- AI-enhanced markdown/LaTeX version
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Per-student section access (lock/unlock by tutor)
CREATE TABLE semestre_filtro_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'SEMESTRE FILTRO',
  section TEXT NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  unlocked_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, test_type, section)
);

-- Track which theory blocks student has read/completed
CREATE TABLE semestre_filtro_theory_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  theory_id UUID NOT NULL REFERENCES semestre_filtro_theory(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, theory_id)
);

-- Indexes
CREATE INDEX idx_sf_theory_lookup ON semestre_filtro_theory(test_type, materia, section);
CREATE INDEX idx_sf_theory_topic ON semestre_filtro_theory(test_type, section, topic);
CREATE INDEX idx_sf_access_student ON semestre_filtro_access(student_id, test_type);
CREATE INDEX idx_sf_progress_student ON semestre_filtro_theory_progress(student_id);
CREATE INDEX idx_sf_progress_theory ON semestre_filtro_theory_progress(theory_id);

-- Enable Row Level Security
ALTER TABLE semestre_filtro_theory ENABLE ROW LEVEL SECURITY;
ALTER TABLE semestre_filtro_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE semestre_filtro_theory_progress ENABLE ROW LEVEL SECURITY;

-- RLS: Theory content
CREATE POLICY "View active theory"
  ON semestre_filtro_theory FOR SELECT
  USING (is_active = true);

CREATE POLICY "Tutors manage theory"
  ON semestre_filtro_theory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- RLS: Student access
CREATE POLICY "Students view own access"
  ON semestre_filtro_access FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "Tutors manage access"
  ON semestre_filtro_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- RLS: Theory progress
CREATE POLICY "Students manage own progress"
  ON semestre_filtro_theory_progress FOR ALL
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "Tutors view progress"
  ON semestre_filtro_theory_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_sf_theory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sf_theory_updated_at
  BEFORE UPDATE ON semestre_filtro_theory
  FOR EACH ROW
  EXECUTE FUNCTION update_sf_theory_updated_at();
