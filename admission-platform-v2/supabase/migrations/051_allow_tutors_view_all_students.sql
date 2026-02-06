-- Allow tutors to view ALL student answers, not just their assigned students
-- Date: 2026-02-04
-- Reason: Tutors need to see results for all students, not just assigned ones

DROP POLICY IF EXISTS "Tutors view student answers" ON "2V_student_answers";

CREATE POLICY "Tutors view student answers"
  ON "2V_student_answers" FOR SELECT
  USING (
    -- Allow if user has TUTOR role
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
    )
  );
