-- AI Question Training & Review System
-- Track all AI generations, approvals, and feedback for continuous learning

CREATE TABLE IF NOT EXISTS ai_question_history (
  id SERIAL PRIMARY KEY,

  -- Question details
  question_type VARCHAR(10) NOT NULL,  -- DS, GI, TA, TPA, MSR
  difficulty VARCHAR(20) NOT NULL,     -- medium, hard

  -- AI generation data
  generated_json JSONB NOT NULL,       -- What AI created
  prompt_used TEXT,                    -- Exact prompt sent to AI

  -- Review & feedback
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, corrected
  rating INT CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
  rejection_reason TEXT,               -- Why rejected (if rejected)
  correction_notes TEXT,               -- What was changed (if corrected)
  corrected_json JSONB,                -- Final approved version after edits

  -- Performance metrics
  response_time_ms INT,                -- How fast AI generated
  tokens_used INT,                     -- API cost tracking

  -- User tracking
  created_by VARCHAR(100),
  reviewed_by VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,

  -- Learning optimization
  used_as_example BOOLEAN DEFAULT FALSE, -- Has this been used in prompts?
  example_usage_count INT DEFAULT 0      -- How many times used as example
);

-- Indexes for fast retrieval
CREATE INDEX idx_ai_approved_questions
ON ai_question_history(question_type, difficulty, rating DESC)
WHERE status IN ('approved', 'corrected');

CREATE INDEX idx_ai_pending_review
ON ai_question_history(created_at DESC)
WHERE status = 'pending';

CREATE INDEX idx_ai_examples
ON ai_question_history(question_type, difficulty, rating DESC, example_usage_count ASC)
WHERE status IN ('approved', 'corrected') AND rating >= 4;

CREATE INDEX idx_ai_rejection_patterns
ON ai_question_history(question_type, rejection_reason)
WHERE status = 'rejected';

-- Comments
COMMENT ON TABLE ai_question_history IS 'Tracks AI-generated questions for review and continuous learning';
COMMENT ON COLUMN ai_question_history.generated_json IS 'Original AI output before any edits';
COMMENT ON COLUMN ai_question_history.corrected_json IS 'Final version after teacher corrections';
COMMENT ON COLUMN ai_question_history.status IS 'pending=awaiting review, approved=used as-is, rejected=not used, corrected=edited then used';
COMMENT ON COLUMN ai_question_history.used_as_example IS 'Whether this question has been used in few-shot learning prompts';

-- Function to increment example usage count
CREATE OR REPLACE FUNCTION increment_example_usage(question_id INT)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_question_history
  SET
    example_usage_count = example_usage_count + 1,
    used_as_example = TRUE
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;
