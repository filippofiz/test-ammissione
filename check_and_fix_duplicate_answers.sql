-- Check for duplicate answers (same assignment_id, question_id, attempt_number)
-- This query will find all duplicate answer records

WITH duplicates AS (
  SELECT
    assignment_id,
    question_id,
    attempt_number,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY created_at DESC) as answer_ids,
    ARRAY_AGG(created_at ORDER BY created_at DESC) as created_dates
  FROM "2V_student_answers"
  GROUP BY assignment_id, question_id, attempt_number
  HAVING COUNT(*) > 1
)
SELECT
  assignment_id,
  question_id,
  attempt_number,
  duplicate_count,
  answer_ids,
  created_dates
FROM duplicates
ORDER BY duplicate_count DESC;

-- To fix duplicates (keeping only the most recent answer):
-- UNCOMMENT THE FOLLOWING QUERY AFTER REVIEWING THE RESULTS ABOVE
/*
WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY assignment_id, question_id, attempt_number
      ORDER BY created_at DESC
    ) as row_num
  FROM "2V_student_answers"
)
DELETE FROM "2V_student_answers"
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);
*/

-- After cleaning up duplicates, verify the unique constraint exists:
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = '2V_student_answers'
--   AND constraint_name = 'unique_answer_per_attempt';
