-- Migration: Add session_id, question_order, allow skipped questions
-- Date: 2026-03-06

ALTER TABLE "ai_pool_student_answers"
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS question_order INTEGER;

-- Allow null selected_answer for skipped questions
ALTER TABLE "ai_pool_student_answers" ALTER COLUMN selected_answer DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pool_answers_session ON "ai_pool_student_answers"(session_id);

COMMENT ON COLUMN "ai_pool_student_answers".session_id IS 'Groups answers into practice sessions/batches';
COMMENT ON COLUMN "ai_pool_student_answers".question_order IS 'Order the question appeared in the session (1-based)';
COMMENT ON COLUMN "ai_pool_student_answers".selected_answer IS 'NULL means question was seen but skipped';
