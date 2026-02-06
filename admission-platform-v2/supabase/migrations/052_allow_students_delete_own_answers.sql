-- Migration: Allow students to delete their own answers
-- Date: 2026-02-06
-- Purpose: Fix issue where students can't delete previous attempt answers when restarting a test

-- Students can delete their own answers (needed for clearing previous attempt data)
DROP POLICY IF EXISTS "Students delete own answers" ON "2V_student_answers";
CREATE POLICY "Students delete own answers"
  ON "2V_student_answers" FOR DELETE
  USING (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

-- Also add the same policy for test table
DROP POLICY IF EXISTS "Students delete own answers test" ON "2V_student_answers_test";
CREATE POLICY "Students delete own answers test"
  ON "2V_student_answers_test" FOR DELETE
  USING (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );
