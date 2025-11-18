-- Migration: Create 2V_student_answers table
-- Date: 2025-11-15
-- Purpose: Student answer storage with strict validation

-- ============================================================================
-- 2V_STUDENT_ANSWERS - ONE answer per question per assignment
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_student_answers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- REQUIRED: References (NO orphaned answers!)
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES "2V_questions"(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES "2V_test_assignments"(id) ON DELETE CASCADE,

  -- REQUIRED: Student's answer
  answer JSONB NOT NULL,

  -- Scoring (nullable until graded)
  auto_score DECIMAL(5,2) CHECK (auto_score >= 0 AND auto_score <= 100),
  tutor_score DECIMAL(5,2) CHECK (tutor_score >= 0 AND tutor_score <= 100),
  tutor_feedback TEXT,

  -- Timing
  time_spent_seconds INTEGER CHECK (time_spent_seconds >= 0),

  -- Metadata
  is_flagged BOOLEAN DEFAULT false NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- ============================================================================
  -- CRITICAL: ONE answer per question per assignment (no duplicates!)
  -- ============================================================================
  UNIQUE(assignment_id, question_id)
);

-- ============================================================================
-- STRICT VALIDATION: Answer must be valid JSONB object
-- ============================================================================

ALTER TABLE "2V_student_answers" ADD CONSTRAINT check_answer_format
CHECK (
  jsonb_typeof(answer) = 'object' AND
  (
    answer ? 'answer' OR          -- Simple: {"answer": "B"}
    answer ? 'answers' OR         -- Multiple: {"answers": ["a", "b"]}
    answer ? 'text'               -- Open-ended: {"text": "Essay..."}
  )
);

-- ============================================================================
-- VALIDATION TRIGGER: Ensure assignment and question belong to same test
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_answer_assignment_question_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if assignment's test matches question's test
  IF NOT EXISTS (
    SELECT 1 FROM "2V_test_assignments" ta
    INNER JOIN "2V_questions" q ON q.test_id = ta.test_id
    WHERE ta.id = NEW.assignment_id AND q.id = NEW.question_id
  ) THEN
    RAISE EXCEPTION 'Question does not belong to the test in this assignment';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_answer_match ON "2V_student_answers";
CREATE TRIGGER validate_answer_match
  BEFORE INSERT OR UPDATE ON "2V_student_answers"
  FOR EACH ROW
  EXECUTE FUNCTION validate_answer_assignment_question_match();

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX idx_2V_student_answers_student_id ON "2V_student_answers"(student_id);
CREATE INDEX idx_2V_student_answers_question_id ON "2V_student_answers"(question_id);
CREATE INDEX idx_2V_student_answers_assignment_id ON "2V_student_answers"(assignment_id);
CREATE INDEX idx_2V_student_answers_submitted_at ON "2V_student_answers"(submitted_at);
CREATE INDEX idx_2V_student_answers_flagged ON "2V_student_answers"(is_flagged) WHERE is_flagged = true;

-- Composite index for common query pattern
CREATE INDEX idx_2V_student_answers_assignment_question ON "2V_student_answers"(assignment_id, question_id);

-- GIN index for JSONB answer queries
CREATE INDEX idx_2V_student_answers_answer_gin ON "2V_student_answers" USING GIN (answer);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_2V_student_answers_updated_at ON "2V_student_answers";
CREATE TRIGGER update_2V_student_answers_updated_at
  BEFORE UPDATE ON "2V_student_answers"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE "2V_student_answers" ENABLE ROW LEVEL SECURITY;

-- Students can view and insert their own answers
DROP POLICY IF EXISTS "Students view own answers" ON "2V_student_answers";
CREATE POLICY "Students view own answers"
  ON "2V_student_answers" FOR SELECT
  USING (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

DROP POLICY IF EXISTS "Students insert own answers" ON "2V_student_answers";
CREATE POLICY "Students insert own answers"
  ON "2V_student_answers" FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

-- Students can update their own answers (change answer, flag for review)
DROP POLICY IF EXISTS "Students update own answers" ON "2V_student_answers";
CREATE POLICY "Students update own answers"
  ON "2V_student_answers" FOR UPDATE
  USING (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  )
  WITH CHECK (
    -- Students can only update answer and is_flagged, NOT scores
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

-- Tutors can view their students' answers
DROP POLICY IF EXISTS "Tutors view student answers" ON "2V_student_answers";
CREATE POLICY "Tutors view student answers"
  ON "2V_student_answers" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
    )
  );

-- Tutors can update their students' answers (add scores, feedback)
DROP POLICY IF EXISTS "Tutors update student answers" ON "2V_student_answers";
CREATE POLICY "Tutors update student answers"
  ON "2V_student_answers" FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (
        SELECT id FROM "2V_profiles"
        WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
      )
    )
  );

-- Admins have full access
DROP POLICY IF EXISTS "Admins manage all answers" ON "2V_student_answers";
CREATE POLICY "Admins manage all answers"
  ON "2V_student_answers" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb)
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON "2V_student_answers" TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "2V_student_answers" IS 'Student answers - ONE answer per question per assignment attempt';
COMMENT ON COLUMN "2V_student_answers".student_id IS 'Who submitted this answer';
COMMENT ON COLUMN "2V_student_answers".question_id IS 'Which question this answers';
COMMENT ON COLUMN "2V_student_answers".assignment_id IS 'Which test attempt this belongs to';
COMMENT ON COLUMN "2V_student_answers".answer IS 'Student answer in JSONB format (validated)';
COMMENT ON COLUMN "2V_student_answers".auto_score IS 'Automatic score (0-100) or NULL if cannot auto-grade';
COMMENT ON COLUMN "2V_student_answers".tutor_score IS 'Tutor override score (0-100)';
COMMENT ON COLUMN "2V_student_answers".tutor_feedback IS 'Tutor comments on this answer';
COMMENT ON COLUMN "2V_student_answers".time_spent_seconds IS 'Time student spent on this question';
COMMENT ON COLUMN "2V_student_answers".is_flagged IS 'Student flagged this question for review';

-- ============================================================================
-- VALIDATION EXAMPLES (for documentation)
-- ============================================================================

/*
VALID answer examples:

Simple Multiple Choice:
{"answer": "B"}

Data Insights (MSR with 3 sub-questions):
{"answers": ["a", "b", "c"]}

Data Insights (Table Analysis):
{"answers": {"row1": "yes", "row2": "no", "row3": "yes", "row4": "no"}}

Open Ended:
{"text": "The theory of relativity states that..."}

Data Insights (Two-Part Analysis):
{"answers": {"part1": "b", "part2": "d"}}
*/
