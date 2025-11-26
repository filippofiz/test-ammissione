-- Migrate old student_answers to new 2V_student_answers table
-- Using metadata mapping via pdf_url → test metadata
-- Student ID: cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18
-- Old auth_uid: 2546af23-6a98-4555-955a-9f904b18dfc0

-- Insert old answers into new table, mapping old test to new test via pdf_url → metadata
INSERT INTO "2V_student_answers" (
  assignment_id,
  student_id,
  question_id,
  attempt_number,
  answer,
  auto_score,
  time_spent_seconds,
  is_flagged,
  submitted_at,
  created_at,
  updated_at,
  is_guided,
  guided_settings
)
SELECT
  ta.id as assignment_id,
  'cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18'::uuid as student_id,
  sa.question_id,
  1 as attempt_number,
  jsonb_build_object('answer', sa.answer) as answer,
  sa.auto_score,
  0 as time_spent_seconds,
  false as is_flagged,
  sa.submitted_at,
  sa.submitted_at as created_at,
  sa.submitted_at as updated_at,
  false as is_guided,
  NULL as guided_settings
FROM student_answers sa
-- Join with old questions table to get pdf_url
INNER JOIN questions old_question
  ON old_question.id = sa.question_id
-- Join with old tests table via pdf_url to get metadata
INNER JOIN tests old_test
  ON old_test.pdf_url = old_question.pdf_url
-- Join with new 2V_tests table matching on metadata
-- Map: old.tipologia_test → new.test_type, old.section → new.section, old.tipologia_esercizi → new.exercise_type, old.progressivo → new.test_number
INNER JOIN "2V_tests" new_test
  ON new_test.test_type = old_test.tipologia_test
  AND new_test.section = old_test.section
  AND new_test.exercise_type = old_test.tipologia_esercizi
  AND new_test.test_number = old_test.progressivo
-- Join with new test assignments
INNER JOIN "2V_test_assignments" ta
  ON ta.test_id = new_test.id
  AND ta.student_id = 'cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18'::uuid
  AND ta.current_attempt = 1
WHERE sa.auth_uid = '2546af23-6a98-4555-955a-9f904b18dfc0'::uuid
ON CONFLICT (assignment_id, question_id, attempt_number) DO NOTHING;

-- Log migration stats
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM "2V_student_answers"
  WHERE student_id = 'cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18'::uuid
    AND attempt_number = 1;

  RAISE NOTICE 'Migration complete. Total answers migrated: %', migrated_count;
END $$;
