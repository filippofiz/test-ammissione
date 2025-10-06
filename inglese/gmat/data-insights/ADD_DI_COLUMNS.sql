-- SQL to add Data Insights example columns to bancadati table
-- Run this in your Supabase SQL Editor

-- Add columns for storing individual DI question type examples
ALTER TABLE bancadati
ADD COLUMN IF NOT EXISTS example_ds JSONB,
ADD COLUMN IF NOT EXISTS example_gi JSONB,
ADD COLUMN IF NOT EXISTS example_ta JSONB,
ADD COLUMN IF NOT EXISTS example_tpa JSONB,
ADD COLUMN IF NOT EXISTS example_msr JSONB;

-- Add comments to document the columns
COMMENT ON COLUMN bancadati.example_ds IS 'Data Sufficiency question example (JSONB)';
COMMENT ON COLUMN bancadati.example_gi IS 'Graphics Interpretation question example (JSONB)';
COMMENT ON COLUMN bancadati.example_ta IS 'Table Analysis question example (JSONB)';
COMMENT ON COLUMN bancadati.example_tpa IS 'Two-Part Analysis question example (JSONB)';
COMMENT ON COLUMN bancadati.example_msr IS 'Multi-Source Reasoning question example (JSONB)';

-- Create indexes for faster JSON queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_bancadati_example_ds ON bancadati USING GIN (example_ds);
CREATE INDEX IF NOT EXISTS idx_bancadati_example_gi ON bancadati USING GIN (example_gi);
CREATE INDEX IF NOT EXISTS idx_bancadati_example_ta ON bancadati USING GIN (example_ta);
CREATE INDEX IF NOT EXISTS idx_bancadati_example_tpa ON bancadati USING GIN (example_tpa);
CREATE INDEX IF NOT EXISTS idx_bancadati_example_msr ON bancadati USING GIN (example_msr);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bancadati'
AND column_name LIKE 'example_%'
ORDER BY column_name;
