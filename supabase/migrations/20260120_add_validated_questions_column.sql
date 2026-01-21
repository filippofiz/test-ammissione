-- Add validated_questions column to track detailed validation results
ALTER TABLE validation_jobs ADD COLUMN IF NOT EXISTS validated_questions JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN validation_jobs.validated_questions IS 'Detailed array of validated questions with their validation results, flags, and timestamps';
