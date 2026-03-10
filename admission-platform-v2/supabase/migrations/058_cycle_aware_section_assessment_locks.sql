-- Migration: 058_cycle_aware_section_assessment_locks.sql
-- Purpose: Replace the per-student boolean section lock columns (section_qr_locked,
-- section_di_locked, section_vr_locked) in 2V_gmat_student_progress with a dedicated
-- 2V_gmat_section_assessment_locks table that tracks lock state per (student, section, cycle).
-- This mirrors the pattern used for training locks (migration 057).

-- 1. Create the new table
CREATE TABLE IF NOT EXISTS "2V_gmat_section_assessment_locks" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('QR', 'DI', 'VR')),
  gmat_cycle TEXT NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  locked_by UUID REFERENCES "2V_profiles"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (student_id, section, gmat_cycle)
);

CREATE INDEX IF NOT EXISTS idx_gmat_section_locks_student_cycle
  ON "2V_gmat_section_assessment_locks" (student_id, gmat_cycle);

-- 2. Enable RLS
ALTER TABLE "2V_gmat_section_assessment_locks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own section locks"
  ON "2V_gmat_section_assessment_locks" FOR SELECT
  USING (student_id IN (
    SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
  ));

CREATE POLICY "Tutors can view student section locks"
  ON "2V_gmat_section_assessment_locks" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can insert section locks"
  ON "2V_gmat_section_assessment_locks" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can update section locks"
  ON "2V_gmat_section_assessment_locks" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can delete section locks"
  ON "2V_gmat_section_assessment_locks" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

-- 3. Migrate existing lock state from 2V_gmat_student_progress into the new table
--    (Foundation cycle only, since all current students are on Foundation)
INSERT INTO "2V_gmat_section_assessment_locks" (student_id, section, gmat_cycle, is_locked)
SELECT student_id, 'QR', 'Foundation', section_qr_locked
FROM "2V_gmat_student_progress"
WHERE section_qr_locked IS NOT NULL
ON CONFLICT (student_id, section, gmat_cycle) DO NOTHING;

INSERT INTO "2V_gmat_section_assessment_locks" (student_id, section, gmat_cycle, is_locked)
SELECT student_id, 'DI', 'Foundation', section_di_locked
FROM "2V_gmat_student_progress"
WHERE section_di_locked IS NOT NULL
ON CONFLICT (student_id, section, gmat_cycle) DO NOTHING;

INSERT INTO "2V_gmat_section_assessment_locks" (student_id, section, gmat_cycle, is_locked)
SELECT student_id, 'VR', 'Foundation', section_vr_locked
FROM "2V_gmat_student_progress"
WHERE section_vr_locked IS NOT NULL
ON CONFLICT (student_id, section, gmat_cycle) DO NOTHING;

-- 4. Update save_gmat_section_assessment_result to auto-lock in the new table
DROP FUNCTION IF EXISTS public.save_gmat_section_assessment_result(UUID, TEXT, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[], JSONB, UUID[], JSONB);

CREATE OR REPLACE FUNCTION public.save_gmat_section_assessment_result(
  p_student_id UUID,
  p_section TEXT,
  p_score_raw INTEGER,
  p_score_total INTEGER,
  p_score_percentage DECIMAL(5,2),
  p_difficulty_breakdown JSONB DEFAULT NULL,
  p_time_spent_seconds INTEGER DEFAULT NULL,
  p_question_ids UUID[] DEFAULT NULL,
  p_answers_data JSONB DEFAULT NULL,
  p_bookmarked_question_ids UUID[] DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result_id UUID;
  v_auth_uid UUID;
  v_cycle TEXT;
BEGIN
  v_auth_uid := auth.uid();

  IF NOT EXISTS (
    SELECT 1 FROM "2V_profiles"
    WHERE id = p_student_id AND auth_uid = v_auth_uid
  ) THEN
    RAISE EXCEPTION 'Unauthorized: student_id does not match authenticated user';
  END IF;

  INSERT INTO "2V_gmat_assessment_results" (
    student_id, assessment_type, section,
    score_raw, score_total, score_percentage,
    difficulty_breakdown, time_spent_seconds,
    question_ids, tutor_validated, answers_data,
    bookmarked_question_ids, metadata, completed_at
  ) VALUES (
    p_student_id, 'section_assessment', p_section,
    p_score_raw, p_score_total, p_score_percentage,
    p_difficulty_breakdown, p_time_spent_seconds,
    p_question_ids, true, p_answers_data,
    p_bookmarked_question_ids, p_metadata, NOW()
  )
  RETURNING id INTO v_result_id;

  -- Extract cycle from metadata (defaults to 'Foundation' for legacy rows)
  v_cycle := COALESCE(p_metadata->>'cycle', 'Foundation');

  -- Auto-lock this section for this cycle
  INSERT INTO "2V_gmat_section_assessment_locks" (student_id, section, gmat_cycle, is_locked, updated_at)
  VALUES (p_student_id, p_section, v_cycle, true, NOW())
  ON CONFLICT (student_id, section, gmat_cycle)
  DO UPDATE SET is_locked = true, updated_at = NOW();

  RETURN v_result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_gmat_section_assessment_result(
  UUID, TEXT, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[], JSONB, UUID[], JSONB
) TO authenticated;

-- 5. updated_at trigger
CREATE OR REPLACE FUNCTION update_gmat_section_locks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gmat_section_locks_updated_at
  BEFORE UPDATE ON "2V_gmat_section_assessment_locks"
  FOR EACH ROW EXECUTE FUNCTION update_gmat_section_locks_updated_at();
