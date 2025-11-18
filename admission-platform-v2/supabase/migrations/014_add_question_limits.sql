-- Migration: Add question limit and baseline difficulty fields to test track configuration
-- Date: 2025-11-16
-- Purpose: Add questions_per_section JSONB field and baseline_difficulty for controlling test behavior

-- ============================================================================
-- ADD FIELDS
-- ============================================================================

ALTER TABLE "2V_test_track_config"
ADD COLUMN IF NOT EXISTS questions_per_section JSONB,
ADD COLUMN IF NOT EXISTS baseline_difficulty TEXT;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN "2V_test_track_config".questions_per_section IS 'JSON object mapping section names to question counts: {"Data Insights": 20, "Quantitative Reasoning": 21, "Verbal Reasoning": 23}';
COMMENT ON COLUMN "2V_test_track_config".baseline_difficulty IS 'Difficulty level for baseline questions (e.g., "easy", "medium", "hard" or 1, 2, 3). If not set, uses "medium"/2.';

-- ============================================================================
-- UPDATE EXISTING GMAT CONFIG WITH DEFAULT VALUES
-- ============================================================================

-- Update GMAT Assessment Iniziale with standard GMAT section question counts and baseline difficulty
UPDATE "2V_test_track_config"
SET questions_per_section = '{
  "Data Insights": 20,
  "Quantitative Reasoning": 21,
  "Verbal Reasoning": 23
}'::jsonb,
baseline_difficulty = 'medium'
WHERE test_type = 'GMAT' AND track_type = 'Assessment Iniziale';
