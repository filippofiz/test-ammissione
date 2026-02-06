-- Fix RLS policy: Add role check for tutors viewing student answers
-- Date: 2026-02-04
-- Issue: Tutors could not view student answers because the SELECT policy was missing the role check

DROP POLICY IF EXISTS "Tutors view student answers" ON "2V_student_answers";

CREATE POLICY "Tutors view student answers"
  ON "2V_student_answers" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (
        SELECT id FROM "2V_profiles"
        WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
      )
    )
  );
