-- Migration: Fix answer validation to support shared questions
-- Date: 2026-01-21
-- Purpose: Update validation trigger to check both test_id AND additional_test_ids

-- ============================================================================
-- Updated validation function to support shared questions
-- Maintains special handling for GMAT Assessment Iniziale 1 pool questions
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_answer_assignment_question_match()
RETURNS TRIGGER AS $$
DECLARE
  v_test_type TEXT;
  v_exercise_type TEXT;
  v_test_number INTEGER;
  v_question_test_type TEXT;
BEGIN
  -- Get test info for this assignment
  SELECT t.test_type, t.exercise_type, t.test_number
  INTO v_test_type, v_exercise_type, v_test_number
  FROM "2V_test_assignments" ta
  INNER JOIN "2V_tests" t ON t.id = ta.test_id
  WHERE ta.id = NEW.assignment_id;

  -- Get question test type
  SELECT q.test_type
  INTO v_question_test_type
  FROM "2V_questions" q
  WHERE q.id = NEW.question_id;

  -- SPECIAL CASE: GMAT Assessment Iniziale test 1 can use any GMAT question from pool
  IF v_test_type = 'GMAT'
     AND v_exercise_type = 'Assessment Iniziale'
     AND v_test_number = 1
     AND v_question_test_type = 'GMAT' THEN
    -- Allow any GMAT question for this test
    RETURN NEW;
  END IF;

  -- NORMAL CASE: Check if assignment's test matches question's test_id OR additional_test_ids
  IF NOT EXISTS (
    SELECT 1
    FROM "2V_test_assignments" ta
    INNER JOIN "2V_questions" q ON (
      q.test_id = ta.test_id
      OR q.additional_test_ids @> to_jsonb(ta.test_id::text)
    )
    WHERE ta.id = NEW.assignment_id
    AND q.id = NEW.question_id
  ) THEN
    RAISE EXCEPTION 'Question does not belong to the test in this assignment';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION validate_answer_assignment_question_match() IS
'Validates that a question belongs to the test in an assignment.
Special handling:
1. GMAT Assessment Iniziale test 1 - allows any GMAT question from pool
2. Shared questions - checks both test_id and additional_test_ids
This allows questions to be shared across multiple test types (e.g., BOCCONI and TOLC).';
