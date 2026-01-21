-- Add AI validation column to 2V_questions table
ALTER TABLE "2V_questions" ADD COLUMN IF NOT EXISTS ai_validation JSONB DEFAULT NULL;

-- Create validation jobs tracking table
CREATE TABLE IF NOT EXISTS validation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  total_questions INTEGER NOT NULL,
  processed_count INTEGER DEFAULT 0,
  passed_count INTEGER DEFAULT 0,
  flagged_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  current_batch JSONB,
  error_log JSONB[] DEFAULT '{}',
  flag_statistics JSONB DEFAULT '{}',
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed', 'stopped'))
);

-- Create index on ai_validation for faster queries
CREATE INDEX IF NOT EXISTS idx_2v_questions_ai_validation ON "2V_questions" USING gin (ai_validation);

-- Create index on validation_jobs status
CREATE INDEX IF NOT EXISTS idx_validation_jobs_status ON validation_jobs(status);

-- Add comments for documentation
COMMENT ON COLUMN "2V_questions".ai_validation IS 'AI validation results including status, flags, comments, and detailed check results';
COMMENT ON TABLE validation_jobs IS 'Tracks batch AI validation jobs with progress and error logging';
