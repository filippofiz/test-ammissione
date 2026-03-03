-- MSR Question Stem Migration
-- Extracts repeated question suffix from sub-question texts into a top-level
-- `question_stem` field, and strips the suffix from each sub-question's `text`.
--
-- Affected questions (all in table: "2V_questions", column: question_data JSONB):
--   200013  be95c0b6-afc2-41e3-8ead-36bf9df7cc07
--   200014  9040fb4c-72f0-4d44-9a2e-a422e6eb8db4
--   200015  92df02b9-2d18-4971-9fb3-75627f24d029
--   200016  6e79fd3d-dc44-4fbc-967e-0ebca273d6b2
--
-- Questions 200017, 200018: standard MC (single sub-question), no stem to extract.
-- Question  510010: malformed options — left unchanged, fix manually via editor.

-- ── 200013 ────────────────────────────────────────────────────────────────────
-- Stem: "Can a range of dates for the object's creation be obtained using one of
--        the techniques in the manner described?"
-- Rows: "Bronze statue of a deer" | "Fired-clay pot" | "Wooden statue of a warrior"

UPDATE "2V_questions"
SET question_data = jsonb_set(
    jsonb_set(
      question_data,
      '{question_stem}',
      '"Can a range of dates for the object''s creation be obtained using one of the techniques in the manner described?"'
    ),
    '{questions}',
    '[
      {"text": "Bronze statue of a deer", "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "b"},
      {"text": "Fired-clay pot",          "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "a"},
      {"text": "Wooden statue of a warrior", "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "a"}
    ]'::jsonb
  )
WHERE id = 'be95c0b6-afc2-41e3-8ead-36bf9df7cc07';

-- ── 200014 ────────────────────────────────────────────────────────────────────
-- Stem: "Does this confirm the artifact was created during the time of the Kaxna Kingdom?"
-- Rows: full artifact descriptions (already concise, strip only the suffix)

UPDATE "2V_questions"
SET question_data = jsonb_set(
    jsonb_set(
      question_data,
      '{question_stem}',
      '"Does this confirm the artifact was created during the time of the Kaxna Kingdom?"'
    ),
    '{questions}',
    '[
      {"text": "Bone necklace shown by IRMS to have element ratios characteristic of artifacts known to be from the Kaxna Kingdom", "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "b"},
      {"text": "Fired-clay jug dated to 1050 BC by TL dating", "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "a"},
      {"text": "Copper box shown by ICP-MS to have the same ratio of trace metals found in the copper mines of Kaxna", "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "b"}
    ]'::jsonb
  )
WHERE id = '9040fb4c-72f0-4d44-9a2e-a422e6eb8db4';

-- ── 200015 ────────────────────────────────────────────────────────────────────
-- Stem: "Can the cost of all pertinent techniques be shown to be within the museum's
--        first-year Kaxna budget?"
-- Rows: the artifact descriptions

UPDATE "2V_questions"
SET question_data = jsonb_set(
    jsonb_set(
      question_data,
      '{question_stem}',
      '"Can the cost of all pertinent techniques be shown to be within the museum''s first-year Kaxna budget?"'
    ),
    '{questions}',
    '[
      {"text": "2 fired-clay statues and 10 bronze statues", "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "a"},
      {"text": "3 fired-clay statues and 5 tin implements",  "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "a"},
      {"text": "4 fired-clay pots and 20 wooden statues",    "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "b"}
    ]'::jsonb
  )
WHERE id = '92df02b9-2d18-4971-9fb3-75627f24d029';

-- ── 200016 ────────────────────────────────────────────────────────────────────
-- Same stem as 200015

UPDATE "2V_questions"
SET question_data = jsonb_set(
    jsonb_set(
      question_data,
      '{question_stem}',
      '"Can the cost of all pertinent techniques be shown to be within the museum''s first-year Kaxna budget?"'
    ),
    '{questions}',
    '[
      {"text": "2 bone implements and 5 fired-clay cups decorated with gold", "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "b"},
      {"text": "7 wooden statues and 20 metal implements",                    "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "a"},
      {"text": "15 wooden statues decorated with bone",                       "options": {"a": "Yes", "b": "No"}, "question_type": "multiple_choice", "correct_answer": "a"}
    ]'::jsonb
  )
WHERE id = '6e79fd3d-dc44-4fbc-967e-0ebca273d6b2';

-- ── 200017 & 200018 ───────────────────────────────────────────────────────────
-- Standard MC (single sub-question, full text already in questions[0].text).
-- No change needed — question_stem stays absent/null.

-- ── 510010 ────────────────────────────────────────────────────────────────────
-- Malformed (options: {}, broken correct_answer). Fix manually via editor UI.
