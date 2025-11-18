-- Migration: Add conversion tracking to questions
-- Date: 2025-11-18
-- Purpose: Track when questions are converted from PDF to interactive format

-- Add conversion_info column to track conversion history
ALTER TABLE "2V_questions"
ADD COLUMN IF NOT EXISTS conversion_info JSONB DEFAULT NULL;

-- Create index for conversion queries
CREATE INDEX IF NOT EXISTS idx_2V_questions_conversion_info ON "2V_questions" USING GIN (conversion_info);

-- Add comment
COMMENT ON COLUMN "2V_questions".conversion_info IS 'Conversion history: {converted_from: "pdf", converted_to: "multiple_choice", converted_at: timestamp, converted_by: uuid, ai_cost_usd: number, etc.}';

-- Example of what conversion_info will contain:
-- {
--   "converted_from": "pdf",
--   "converted_to": "multiple_choice",
--   "converted_at": "2025-11-18T10:30:00Z",
--   "converted_by": "user-uuid",
--   "ai_model": "claude-sonnet-4-5",
--   "ai_cost_usd": 0.0234,
--   "ai_tokens": {
--     "input": 12543,
--     "output": 3421
--   },
--   "image_extraction": true,
--   "graph_recreation": true
-- }
