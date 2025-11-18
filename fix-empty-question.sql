-- Fix the empty question by adding sample content
-- Replace 'c2923eb0-dc84-46ca-b798-e06678db7449' with your actual question ID

UPDATE "2V_tests"
SET
  question_data = '{
    "question": "If x + y = 10 and x - y = 6, what is the value of x?",
    "options": {
      "a": "2",
      "b": "4",
      "c": "6",
      "d": "8",
      "e": "10"
    }
  }'::jsonb,
  answers = '{
    "correct_answer": ["d"]
  }'::jsonb
WHERE id = 'c2923eb0-dc84-46ca-b798-e06678db7449';

-- Verify the update
SELECT
  id,
  test_type,
  section,
  test_number,
  question_type,
  question_data,
  answers
FROM "2V_tests"
WHERE id = 'c2923eb0-dc84-46ca-b798-e06678db7449';
