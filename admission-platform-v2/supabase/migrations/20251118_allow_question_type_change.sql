-- Migration: Allow changing question_type during updates
-- Date: 2025-11-18
-- Purpose: Allow converting PDF questions to multiple_choice questions

-- Drop the trigger that prevents question_type changes if it exists
DROP TRIGGER IF EXISTS prevent_question_type_change ON "2V_questions";
DROP FUNCTION IF EXISTS prevent_question_type_change_fn();

-- Add a comment explaining why we allow this
COMMENT ON COLUMN "2V_questions".question_type IS 'Question type - can be changed when converting PDF questions to interactive format';
