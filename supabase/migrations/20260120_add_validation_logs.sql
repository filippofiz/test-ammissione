-- Add logs column to validation_jobs table
ALTER TABLE validation_jobs ADD COLUMN IF NOT EXISTS logs TEXT[] DEFAULT '{}';

COMMENT ON COLUMN validation_jobs.logs IS 'Array of log messages from edge function execution';
