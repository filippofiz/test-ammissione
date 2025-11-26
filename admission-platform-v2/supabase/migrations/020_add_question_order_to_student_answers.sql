-- Add question_order column to track the order questions were encountered
-- This helps maintain accurate display order regardless of created_at/updated_at timestamps

ALTER TABLE "2V_student_answers"
ADD COLUMN IF NOT EXISTS question_order INTEGER;

-- Add index for sorting by question order
CREATE INDEX IF NOT EXISTS idx_2V_student_answers_question_order
ON "2V_student_answers"(assignment_id, attempt_number, question_order);

-- Add comment
COMMENT ON COLUMN "2V_student_answers".question_order IS 'The order (1-based) in which this question was encountered by the student during the test';
