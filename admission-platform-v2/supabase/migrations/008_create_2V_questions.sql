-- Migration: Create 2V_questions table
-- Date: 2025-11-15
-- Purpose: Unified question storage for all question types

-- ============================================================================
-- 2V_QUESTIONS - Polymorphic question storage
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_questions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- REQUIRED: Link to test (NO orphaned questions allowed!)
  test_id UUID NOT NULL REFERENCES "2V_tests"(id) ON DELETE CASCADE,

  -- REQUIRED: Test type for validation against topics
  test_type TEXT NOT NULL,

  -- REQUIRED: Question identification
  question_number INTEGER NOT NULL CHECK (question_number > 0),
  question_type TEXT NOT NULL CHECK (question_type IN ('pdf', 'multiple_choice', 'data_insights', 'open_ended')),

  -- REQUIRED: Topic classification (for validation against 2V_topics_sections)
  section TEXT NOT NULL, -- argomento: e.g., "Advanced Math", "Quantitative Reasoning"
  materia TEXT,          -- subject area: e.g., "Math", "Matematica", NULL

  -- Optional difficulty
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard') OR difficulty IS NULL),

  -- REQUIRED: Question content (type-specific structure)
  question_data JSONB NOT NULL,

  -- REQUIRED: Answers (correct + wrong answers submitted by students)
  answers JSONB NOT NULL,

  -- Metadata
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES "2V_profiles"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- ============================================================================
  -- CRITICAL: Prevent duplicate questions in same test
  -- ============================================================================
  UNIQUE(test_id, question_number)
);

-- ============================================================================
-- VALIDATION: question_data structure based on question_type
-- ============================================================================

ALTER TABLE "2V_questions" ADD CONSTRAINT check_question_data_structure
CHECK (
  CASE question_type
    WHEN 'pdf' THEN
      question_data ? 'pdf_url' AND
      question_data ? 'page_number' AND
      jsonb_typeof(question_data->'page_number') = 'number'
    WHEN 'multiple_choice' THEN
      question_data ? 'question_text' AND
      question_data ? 'options' AND
      jsonb_typeof(question_data->'options') = 'object' AND
      (question_data->'options') ? 'a' AND
      (question_data->'options') ? 'b'
    WHEN 'data_insights' THEN
      question_data ? 'di_type' AND
      (question_data->>'di_type') IN ('MSR', 'DS', 'GI', 'TA', 'TPA')
    WHEN 'open_ended' THEN
      question_data ? 'question_text'
    ELSE false
  END
);

-- ============================================================================
-- VALIDATION: answers structure
-- ============================================================================

ALTER TABLE "2V_questions" ADD CONSTRAINT check_answers_structure
CHECK (
  -- answers must be an object
  jsonb_typeof(answers) = 'object' AND
  -- must have correct_answer field
  answers ? 'correct_answer' AND
  -- must have wrong_answers array (can be empty)
  answers ? 'wrong_answers' AND
  jsonb_typeof(answers->'wrong_answers') = 'array'
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_2V_questions_test_id ON "2V_questions"(test_id);
CREATE INDEX idx_2V_questions_test_type ON "2V_questions"(test_type);
CREATE INDEX idx_2V_questions_section ON "2V_questions"(section);
CREATE INDEX idx_2V_questions_materia ON "2V_questions"(materia);
CREATE INDEX idx_2V_questions_question_type ON "2V_questions"(question_type);
CREATE INDEX idx_2V_questions_difficulty ON "2V_questions"(difficulty);

-- Composite index for topic validation
CREATE INDEX idx_2V_questions_test_type_section_materia ON "2V_questions"(test_type, section, materia);

-- GIN index for JSONB queries
CREATE INDEX idx_2V_questions_question_data_gin ON "2V_questions" USING GIN (question_data);
CREATE INDEX idx_2V_questions_answers_gin ON "2V_questions" USING GIN (answers);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_2V_questions_updated_at ON "2V_questions";
CREATE TRIGGER update_2V_questions_updated_at
  BEFORE UPDATE ON "2V_questions"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE "2V_questions" ENABLE ROW LEVEL SECURITY;

-- Students can view questions from their assigned tests
DROP POLICY IF EXISTS "Students view assigned test questions" ON "2V_questions";
CREATE POLICY "Students view assigned test questions"
  ON "2V_questions" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "2V_test_assignments" ta
      WHERE ta.test_id = "2V_questions".test_id
      AND ta.student_id IN (
        SELECT id FROM "2V_profiles"
        WHERE auth_uid = auth.uid()
      )
    )
  );

-- Tutors and admins can manage all questions
DROP POLICY IF EXISTS "Tutors and admins manage questions" ON "2V_questions";
CREATE POLICY "Tutors and admins manage questions"
  ON "2V_questions" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON "2V_questions" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON "2V_questions" TO authenticated; -- RLS enforces who can

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "2V_questions" IS 'Unified storage for all question types (PDF, multiple choice, data insights, open-ended)';
COMMENT ON COLUMN "2V_questions".test_type IS 'Test type (SAT, GMAT, etc.) - used for validation against 2V_topics_sections';
COMMENT ON COLUMN "2V_questions".section IS 'Topic/section (argomento) - e.g., Advanced Math, Quantitative Reasoning';
COMMENT ON COLUMN "2V_questions".materia IS 'Subject area (Materia) - e.g., Math, Matematica, Altro';
COMMENT ON COLUMN "2V_questions".question_data IS 'Question content - structure varies by question_type';
COMMENT ON COLUMN "2V_questions".answers IS 'Answers object: {correct_answer: any, wrong_answers: array}';
COMMENT ON CONSTRAINT check_question_data_structure ON "2V_questions" IS 'Validates question_data structure matches question_type';
COMMENT ON CONSTRAINT check_answers_structure ON "2V_questions" IS 'Ensures answers has correct_answer and wrong_answers array';
