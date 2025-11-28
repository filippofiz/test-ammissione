-- Add section to unique constraint for 2V_questions
-- This allows the same question_number in different sections of the same test

-- Drop old constraint
ALTER TABLE "2V_questions" DROP CONSTRAINT IF EXISTS "2V_questions_test_id_question_number_key";

-- Add new constraint with section
ALTER TABLE "2V_questions" ADD CONSTRAINT "2V_questions_test_id_question_number_section_key"
  UNIQUE(test_id, question_number, section);
