-- Migration: 059_simulation_slots.sql
-- Purpose: Replace the single simulation_unlocked boolean on 2V_gmat_student_progress
-- with a per-slot model that supports one attempt per slot, scoped to a GMAT cycle.
-- This mirrors the pattern used for training locks (migration 057) and
-- section assessment locks (migration 058).
--
-- The simulation_unlocked column on 2V_gmat_student_progress is now deprecated.
-- It is no longer read or written by the application after this migration.
-- It will be dropped in a future migration.

-- 1. Create the new table
CREATE TABLE IF NOT EXISTS "2V_gmat_simulation_slots" (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  gmat_cycle   TEXT NOT NULL CHECK (gmat_cycle IN ('Foundation', 'Development', 'Excellence')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  -- FK to the assessment result row produced when this slot was used. NULL until completed.
  result_id    UUID REFERENCES "2V_gmat_assessment_results"(id) ON DELETE SET NULL,
  created_by   UUID REFERENCES "2V_profiles"(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup: all slots for a student in a given cycle
CREATE INDEX IF NOT EXISTS idx_simulation_slots_student_cycle
  ON "2V_gmat_simulation_slots" (student_id, gmat_cycle);

-- 2. Enable RLS
ALTER TABLE "2V_gmat_simulation_slots" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own simulation slots"
  ON "2V_gmat_simulation_slots" FOR SELECT
  USING (student_id IN (
    SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
  ));

CREATE POLICY "Tutors can view simulation slots"
  ON "2V_gmat_simulation_slots" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can insert simulation slots"
  ON "2V_gmat_simulation_slots" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can update simulation slots"
  ON "2V_gmat_simulation_slots" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

CREATE POLICY "Tutors can delete simulation slots"
  ON "2V_gmat_simulation_slots" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"ADMIN"'::jsonb OR roles @> '"TUTOR"'::jsonb)
    )
  );

-- 3. updated_at trigger
CREATE OR REPLACE FUNCTION update_simulation_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_simulation_slots_updated_at
  BEFORE UPDATE ON "2V_gmat_simulation_slots"
  FOR EACH ROW EXECUTE FUNCTION update_simulation_slots_updated_at();

-- 4. RPC: save_gmat_mock_simulation_result (SECURITY DEFINER)
-- Atomically inserts the result row AND marks the slot as completed.
-- Students cannot directly INSERT into 2V_gmat_assessment_results or UPDATE slots,
-- so this RPC handles both operations in a single transaction.
CREATE OR REPLACE FUNCTION public.save_gmat_mock_simulation_result(
  p_student_id              UUID,
  p_slot_id                 UUID,
  p_score_raw               INTEGER,
  p_score_total             INTEGER,
  p_score_percentage        DECIMAL(5,2),
  p_difficulty_breakdown    JSONB DEFAULT NULL,
  p_time_spent_seconds      INTEGER DEFAULT NULL,
  p_question_ids            UUID[] DEFAULT NULL,
  p_answers_data            JSONB DEFAULT NULL,
  p_bookmarked_question_ids UUID[] DEFAULT NULL,
  p_metadata                JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result_id UUID;
  v_auth_uid  UUID;
BEGIN
  v_auth_uid := auth.uid();

  -- Ownership check: only the student themselves can submit
  IF NOT EXISTS (
    SELECT 1 FROM "2V_profiles"
    WHERE id = p_student_id AND auth_uid = v_auth_uid
  ) THEN
    RAISE EXCEPTION 'Unauthorized: student_id does not match authenticated user';
  END IF;

  -- Verify slot exists, belongs to this student, and is still pending
  IF NOT EXISTS (
    SELECT 1 FROM "2V_gmat_simulation_slots"
    WHERE id = p_slot_id
      AND student_id = p_student_id
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Slot not found, already completed, or does not belong to this student';
  END IF;

  -- Insert assessment result
  INSERT INTO "2V_gmat_assessment_results" (
    student_id, assessment_type, section,
    score_raw, score_total, score_percentage,
    difficulty_breakdown, time_spent_seconds,
    question_ids, answers_data, bookmarked_question_ids,
    metadata, tutor_validated, completed_at
  ) VALUES (
    p_student_id, 'mock', NULL,
    p_score_raw, p_score_total, p_score_percentage,
    p_difficulty_breakdown, p_time_spent_seconds,
    p_question_ids, p_answers_data, p_bookmarked_question_ids,
    p_metadata, TRUE, NOW()
  )
  RETURNING id INTO v_result_id;

  -- Mark slot as completed and link the result
  UPDATE "2V_gmat_simulation_slots"
  SET status       = 'completed',
      result_id    = v_result_id,
      completed_at = NOW()
  WHERE id = p_slot_id;

  RETURN v_result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_gmat_mock_simulation_result(
  UUID, UUID, INTEGER, INTEGER, DECIMAL(5,2), JSONB, INTEGER, UUID[], JSONB, UUID[], JSONB
) TO authenticated;
