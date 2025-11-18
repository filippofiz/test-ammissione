-- Migration: Fix prevent_critical_field_changes to allow PDF→Multiple Choice conversion
-- Date: 2025-11-18
-- Purpose: Allow converting PDF questions to interactive multiple choice format

-- Drop and recreate the function with the fix
CREATE OR REPLACE FUNCTION prevent_critical_field_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- ALLOW changing question_type from 'pdf' to 'multiple_choice' (conversion use case)
  IF OLD.question_type = 'pdf' AND NEW.question_type = 'multiple_choice' THEN
    -- Allow PDF→Multiple Choice conversion
    RETURN NEW;
  END IF;

  -- Prevent changing test_id (questions belong to one test forever)
  IF OLD.test_id != NEW.test_id THEN
    RAISE EXCEPTION 'Cannot change test_id after question creation';
  END IF;

  -- Prevent changing question_number (maintains uniqueness)
  IF OLD.question_number != NEW.question_number THEN
    RAISE EXCEPTION 'Cannot change question_number after creation';
  END IF;

  -- Prevent changing question_type in other cases (structure would be invalid)
  IF OLD.question_type != NEW.question_type THEN
    RAISE EXCEPTION 'Cannot change question_type after creation (except PDF→Multiple Choice conversion)';
  END IF;

  -- Prevent changing id
  IF OLD.id != NEW.id THEN
    RAISE EXCEPTION 'Cannot change question id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prevent_critical_field_changes() IS
'Prevents changes to critical fields (test_id, question_number, id) but allows PDF→Multiple Choice conversion for admin tools';
