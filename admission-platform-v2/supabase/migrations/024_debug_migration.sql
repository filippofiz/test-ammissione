-- Debug: Check what we have in old student_answers table
SELECT
  'Old answers count' as check_type,
  COUNT(*) as count
FROM student_answers
WHERE auth_uid = '2546af23-6a98-4555-955a-9f904b18dfc0'::uuid;

-- Debug: Check test assignments for this student
SELECT
  'Test assignments count' as check_type,
  COUNT(*) as count
FROM "2V_test_assignments"
WHERE student_id = 'cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18'::uuid;

-- Debug: Check test assignments with current_attempt = 1
SELECT
  'Test assignments (attempt 1)' as check_type,
  COUNT(*) as count
FROM "2V_test_assignments"
WHERE student_id = 'cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18'::uuid
  AND current_attempt = 1;

-- Debug: Check if test_ids match
SELECT
  'Matching test_ids' as check_type,
  COUNT(DISTINCT sa.test_id) as old_tests,
  COUNT(DISTINCT ta.test_id) as assignment_tests
FROM student_answers sa
LEFT JOIN "2V_test_assignments" ta
  ON ta.test_id = sa.test_id
  AND ta.student_id = 'cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18'::uuid
WHERE sa.auth_uid = '2546af23-6a98-4555-955a-9f904b18dfc0'::uuid;

-- Debug: Show sample old answers with their test_ids
SELECT
  sa.test_id,
  sa.question_id,
  sa.answer,
  COUNT(*) as answer_count
FROM student_answers sa
WHERE sa.auth_uid = '2546af23-6a98-4555-955a-9f904b18dfc0'::uuid
GROUP BY sa.test_id, sa.question_id, sa.answer
LIMIT 10;

-- Debug: Show test assignments for this student
SELECT
  ta.id as assignment_id,
  ta.test_id,
  ta.current_attempt,
  ta.status
FROM "2V_test_assignments" ta
WHERE ta.student_id = 'cbf17d9c-c2d2-4ac0-8d4a-c9764bef7f18'::uuid
LIMIT 10;
