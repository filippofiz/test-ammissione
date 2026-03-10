-- Migration: Create AI Pool System tables
-- Date: 2026-03-05
-- Purpose: Infinite practice pool with AI-generated questions and proficiency tracking

-- ============================================================================
-- 1. AI_POOL_QUESTIONS - AI-generated questions for the practice pool
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_pool_questions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Classification (matches 2V_questions structure)
  test_type TEXT NOT NULL,
  section TEXT NOT NULL,
  materia TEXT,

  -- Question content (same JSONB format as 2V_questions multiple_choice)
  question_data JSONB NOT NULL,
  answers JSONB NOT NULL,

  -- AI generation metadata
  source TEXT NOT NULL DEFAULT 'ai_generated' CHECK (source IN ('ai_generated', 'curated')),
  generation_model TEXT,
  generation_cost_usd DECIMAL(10,6),
  generation_prompt_hash TEXT,

  -- Review workflow
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES "2V_profiles"(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,

  -- Active flag (soft delete)
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Validation: question_data must have question_text and options
ALTER TABLE "ai_pool_questions" ADD CONSTRAINT check_pool_question_data
CHECK (
  question_data ? 'question_text' AND
  question_data ? 'options' AND
  jsonb_typeof(question_data->'options') = 'object' AND
  (question_data->'options') ? 'a' AND
  (question_data->'options') ? 'b'
);

-- Validation: answers must have correct_answer and wrong_answers
ALTER TABLE "ai_pool_questions" ADD CONSTRAINT check_pool_answers
CHECK (
  jsonb_typeof(answers) = 'object' AND
  answers ? 'correct_answer' AND
  answers ? 'wrong_answers' AND
  jsonb_typeof(answers->'wrong_answers') = 'array'
);

-- Indexes
CREATE INDEX idx_pool_questions_test_type ON "ai_pool_questions"(test_type);
CREATE INDEX idx_pool_questions_section ON "ai_pool_questions"(section);
CREATE INDEX idx_pool_questions_review_status ON "ai_pool_questions"(review_status);
CREATE INDEX idx_pool_questions_active ON "ai_pool_questions"(is_active) WHERE is_active = true;
CREATE INDEX idx_pool_questions_test_type_section ON "ai_pool_questions"(test_type, section);
CREATE INDEX idx_pool_questions_pending ON "ai_pool_questions"(created_at DESC) WHERE review_status = 'pending';

-- GIN indexes for JSONB
CREATE INDEX idx_pool_questions_data_gin ON "ai_pool_questions" USING GIN (question_data);
CREATE INDEX idx_pool_questions_answers_gin ON "ai_pool_questions" USING GIN (answers);

-- Updated_at trigger
CREATE TRIGGER update_ai_pool_questions_updated_at
  BEFORE UPDATE ON "ai_pool_questions"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. AI_POOL_STUDENT_PROGRESS - Proficiency tracking per student/topic
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_pool_student_progress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who and what
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  section TEXT NOT NULL,

  -- Proficiency state
  proficiency_level INTEGER NOT NULL DEFAULT 0 CHECK (proficiency_level >= 0 AND proficiency_level <= 3),
  proficiency_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (proficiency_status IN ('not_started', 'struggling', 'developing', 'proficient')),
  proficient_at TIMESTAMP WITH TIME ZONE,

  -- Streak tracking (for level up/down logic)
  current_streak INTEGER NOT NULL DEFAULT 0,

  -- Cumulative stats
  total_answered INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- One progress row per student per topic
  UNIQUE(student_id, test_type, section)
);

-- Indexes
CREATE INDEX idx_pool_progress_student ON "ai_pool_student_progress"(student_id);
CREATE INDEX idx_pool_progress_test_type ON "ai_pool_student_progress"(test_type);
CREATE INDEX idx_pool_progress_status ON "ai_pool_student_progress"(proficiency_status);
CREATE INDEX idx_pool_progress_student_test ON "ai_pool_student_progress"(student_id, test_type);

-- Updated_at trigger
CREATE TRIGGER update_ai_pool_student_progress_updated_at
  BEFORE UPDATE ON "ai_pool_student_progress"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. AI_POOL_STUDENT_ANSWERS - All pool answers (from 2V or AI questions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_pool_student_answers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who answered
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,

  -- Which question (can be from either source)
  question_id UUID NOT NULL,
  question_source TEXT NOT NULL CHECK (question_source IN ('2v', 'ai_pool')),

  -- Context
  test_type TEXT NOT NULL,
  section TEXT NOT NULL,

  -- Answer data
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER CHECK (time_spent_seconds >= 0),

  -- Timestamp (critical for 3-week cooldown)
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes for the 3-week cooldown query (most critical query)
CREATE INDEX idx_pool_answers_student_answered ON "ai_pool_student_answers"(student_id, answered_at DESC);
CREATE INDEX idx_pool_answers_student_section ON "ai_pool_student_answers"(student_id, test_type, section);
CREATE INDEX idx_pool_answers_question ON "ai_pool_student_answers"(question_id);
CREATE INDEX idx_pool_answers_cooldown ON "ai_pool_student_answers"(student_id, question_id, answered_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- ai_pool_questions
ALTER TABLE "ai_pool_questions" ENABLE ROW LEVEL SECURITY;

-- Everyone can view active approved/pending pool questions (students need to see them)
DROP POLICY IF EXISTS "Anyone can view active pool questions" ON "ai_pool_questions";
CREATE POLICY "Anyone can view active pool questions"
  ON "ai_pool_questions" FOR SELECT
  USING (
    is_active = true AND review_status IN ('approved', 'pending')
  );

-- Only admins can manage pool questions (insert, update, delete)
DROP POLICY IF EXISTS "Admins manage pool questions" ON "ai_pool_questions";
CREATE POLICY "Admins manage pool questions"
  ON "ai_pool_questions" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND roles @> '"ADMIN"'::jsonb
    )
  );

-- ai_pool_student_progress
ALTER TABLE "ai_pool_student_progress" ENABLE ROW LEVEL SECURITY;

-- Students can view their own progress
DROP POLICY IF EXISTS "Students view own pool progress" ON "ai_pool_student_progress";
CREATE POLICY "Students view own pool progress"
  ON "ai_pool_student_progress" FOR SELECT
  USING (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

-- Students can insert/update their own progress
DROP POLICY IF EXISTS "Students manage own pool progress" ON "ai_pool_student_progress";
CREATE POLICY "Students manage own pool progress"
  ON "ai_pool_student_progress" FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

DROP POLICY IF EXISTS "Students update own pool progress" ON "ai_pool_student_progress";
CREATE POLICY "Students update own pool progress"
  ON "ai_pool_student_progress" FOR UPDATE
  USING (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

-- Tutors can view their students' progress
DROP POLICY IF EXISTS "Tutors view student pool progress" ON "ai_pool_student_progress";
CREATE POLICY "Tutors view student pool progress"
  ON "ai_pool_student_progress" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
    )
  );

-- Admins have full access
DROP POLICY IF EXISTS "Admins manage all pool progress" ON "ai_pool_student_progress";
CREATE POLICY "Admins manage all pool progress"
  ON "ai_pool_student_progress" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb)
  );

-- ai_pool_student_answers
ALTER TABLE "ai_pool_student_answers" ENABLE ROW LEVEL SECURITY;

-- Students can view their own answers
DROP POLICY IF EXISTS "Students view own pool answers" ON "ai_pool_student_answers";
CREATE POLICY "Students view own pool answers"
  ON "ai_pool_student_answers" FOR SELECT
  USING (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

-- Students can insert their own answers
DROP POLICY IF EXISTS "Students insert own pool answers" ON "ai_pool_student_answers";
CREATE POLICY "Students insert own pool answers"
  ON "ai_pool_student_answers" FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

-- Tutors can view their students' answers
DROP POLICY IF EXISTS "Tutors view student pool answers" ON "ai_pool_student_answers";
CREATE POLICY "Tutors view student pool answers"
  ON "ai_pool_student_answers" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
    )
  );

-- Admins have full access
DROP POLICY IF EXISTS "Admins manage all pool answers" ON "ai_pool_student_answers";
CREATE POLICY "Admins manage all pool answers"
  ON "ai_pool_student_answers" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb)
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON "ai_pool_questions" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON "ai_pool_questions" TO authenticated;

GRANT SELECT, INSERT, UPDATE ON "ai_pool_student_progress" TO authenticated;

GRANT SELECT, INSERT ON "ai_pool_student_answers" TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "ai_pool_questions" IS 'AI-generated questions for infinite practice pool. Separate from 2V_questions.';
COMMENT ON COLUMN "ai_pool_questions".review_status IS 'pending = awaiting admin review, approved = verified correct, rejected = not usable';
COMMENT ON COLUMN "ai_pool_questions".source IS 'ai_generated = created by AI, curated = manually added by admin';

COMMENT ON TABLE "ai_pool_student_progress" IS 'Tracks proficiency level per student per topic. Level 0-3, 3 = proficient.';
COMMENT ON COLUMN "ai_pool_student_progress".current_streak IS 'Consecutive correct answers. 3 = level up. Reset to 0 on wrong answer.';

COMMENT ON TABLE "ai_pool_student_answers" IS 'All answers given in pool practice. Used for 3-week cooldown and proficiency calculation.';
COMMENT ON COLUMN "ai_pool_student_answers".question_source IS '2v = question from 2V_questions table, ai_pool = question from ai_pool_questions table';
COMMENT ON COLUMN "ai_pool_student_answers".answered_at IS 'When the student answered. Critical for 3-week cooldown check.';
