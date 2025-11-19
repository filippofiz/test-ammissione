-- Copy Assessment Iniziale questions from questions table to 2V_questions

INSERT INTO "2V_questions" (
  test_id,
  test_type,
  question_number,
  question_type,
  section,
  macro_section,
  question_data,
  answers,
  is_active
)
SELECT
  '378b521a-92dc-4785-939e-3961ee5a66f9'::uuid AS test_id,
  'SAT' AS test_type,
  question_number,
  'pdf' AS question_type,
  argomento AS section,
  "SAT_section" AS macro_section,
  jsonb_build_object(
    'pdf_url', pdf_url,
    'page_number', page_number,
    'pdf_url_eng', pdf_url_eng
  ) AS question_data,
  jsonb_build_object(
    'correct_answer', correct_answer,
    'wrong_answers', COALESCE(to_jsonb(wrong_answers), '[]'::jsonb)
  ) AS answers,
  true AS is_active
FROM questions
WHERE section = 'Assessment Iniziale'
  AND tipologia_esercizi = 'Assessment'
  AND progressivo = 1
  AND tipologia_test = 'SAT PDF'
ORDER BY question_number;
