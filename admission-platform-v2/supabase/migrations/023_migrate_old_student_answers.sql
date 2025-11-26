-- Migrate old student_answers to new 2V_student_answers table
-- Student ID: cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18
-- Old auth_uid: 2546af23-6a98-4555-955a-9f904b18dfc0

-- Insert old answers into new table
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
  -- Transform answer to JSONB format
  jsonb_build_object('answer', sa.answer) as answer,
  -- Keep auto_score as is (0, 1, or null)
  sa.auto_score,
  0 as time_spent_seconds,
  false as is_flagged,
  sa.submitted_at,
  sa.submitted_at as created_at,
  sa.submitted_at as updated_at,
  false as is_guided,
  NULL as guided_settings
FROM student_answers sa
INNER JOIN "2V_test_assignments" ta
  ON ta.test_id = sa.test_id
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
