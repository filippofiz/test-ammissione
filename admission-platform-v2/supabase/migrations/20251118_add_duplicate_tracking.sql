-- Migration: Add duplicate question tracking
-- Date: 2025-11-18
-- Purpose: Allow questions to reference duplicates while remaining independent

-- ============================================================================
-- Add duplicate_question_ids field
-- ============================================================================

ALTER TABLE "2V_questions"
ADD COLUMN duplicate_question_ids JSONB DEFAULT '[]'::jsonb;

-- ============================================================================
-- Add constraint to ensure it's an array of UUIDs
-- ============================================================================

ALTER TABLE "2V_questions"
ADD CONSTRAINT check_duplicate_question_ids_array
CHECK (
  jsonb_typeof(duplicate_question_ids) = 'array'
);

-- ============================================================================
-- Add GIN index for efficient querying of duplicates
-- ============================================================================

CREATE INDEX idx_2V_questions_duplicate_ids_gin
ON "2V_questions" USING GIN (duplicate_question_ids);

-- ============================================================================
-- Helper function to find all questions in a duplicate group
-- ============================================================================

CREATE OR REPLACE FUNCTION get_duplicate_group(question_id UUID)
RETURNS TABLE (
  id UUID,
  test_id UUID,
  question_number INTEGER,
  question_type TEXT,
  section TEXT,
  question_data JSONB,
  answers JSONB,
  duplicate_question_ids JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE duplicate_tree AS (
    -- Start with the given question
    SELECT q.*
    FROM "2V_questions" q
    WHERE q.id = question_id

    UNION

    -- Find all questions referenced in duplicate_question_ids
    SELECT q.*
    FROM "2V_questions" q
    INNER JOIN duplicate_tree dt
    ON q.id IN (
      SELECT jsonb_array_elements_text(dt.duplicate_question_ids)::uuid
    )
  )
  SELECT DISTINCT
    dt.id,
    dt.test_id,
    dt.question_number,
    dt.question_type,
    dt.section,
    dt.question_data,
    dt.answers,
    dt.duplicate_question_ids
  FROM duplicate_tree dt;
END;
$$;

-- ============================================================================
-- Helper function to sync duplicate_question_ids bidirectionally
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_duplicate_references()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  duplicate_id UUID;
BEGIN
  -- Only process if duplicate_question_ids changed
  IF (TG_OP = 'UPDATE' AND OLD.duplicate_question_ids = NEW.duplicate_question_ids) THEN
    RETURN NEW;
  END IF;

  -- For each question in the duplicate list, add this question to their list
  FOR duplicate_id IN
    SELECT jsonb_array_elements_text(NEW.duplicate_question_ids)::uuid
  LOOP
    -- Add NEW.id to the duplicate's list if not already there
    UPDATE "2V_questions"
    SET duplicate_question_ids = (
      CASE
        WHEN duplicate_question_ids @> to_jsonb(NEW.id::text)
        THEN duplicate_question_ids
        ELSE duplicate_question_ids || to_jsonb(NEW.id::text)
      END
    )
    WHERE id = duplicate_id
    AND id != NEW.id; -- Don't create self-reference
  END LOOP;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- Trigger to maintain bidirectional references
-- ============================================================================

DROP TRIGGER IF EXISTS sync_duplicate_refs_trigger ON "2V_questions";
CREATE TRIGGER sync_duplicate_refs_trigger
  AFTER INSERT OR UPDATE OF duplicate_question_ids
  ON "2V_questions"
  FOR EACH ROW
  EXECUTE FUNCTION sync_duplicate_references();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN "2V_questions".duplicate_question_ids IS
'Array of question IDs that are duplicates of this question (bidirectional references maintained automatically)';

COMMENT ON FUNCTION get_duplicate_group(UUID) IS
'Returns all questions in a duplicate group, including the question itself and all transitively related duplicates';

COMMENT ON FUNCTION sync_duplicate_references() IS
'Automatically maintains bidirectional duplicate references when duplicate_question_ids is updated';
