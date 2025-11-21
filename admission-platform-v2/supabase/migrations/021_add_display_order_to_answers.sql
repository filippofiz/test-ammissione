-- Add display_order column to track question presentation order
-- This preserves the order questions were shown to students (important for randomized tests)

ALTER TABLE "2V_student_answers"
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Add index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_student_answers_display_order
ON "2V_student_answers" (assignment_id, attempt_number, display_order);

-- Also add to test tables
ALTER TABLE "2V_student_answers_test"
ADD COLUMN IF NOT EXISTS display_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_student_answers_test_display_order
ON "2V_student_answers_test" (assignment_id, attempt_number, display_order);
