-- SQL to check if di_question_data column exists in bancadati table
-- Run this in your Supabase SQL Editor

-- Check if the columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bancadati'
AND column_name IN ('di_question_type', 'di_question_data')
ORDER BY column_name;

-- If the column doesn't exist, run this to add it:
-- ALTER TABLE bancadati
-- ADD COLUMN IF NOT EXISTS di_question_data JSONB;

-- Add comment
-- COMMENT ON COLUMN bancadati.di_question_data IS 'Data Insights question data (JSONB) - stores DS/GI/TA/TPA/MSR question structures';

-- Create index for faster JSON queries
-- CREATE INDEX IF NOT EXISTS idx_bancadati_di_question_data ON bancadati USING GIN (di_question_data);
