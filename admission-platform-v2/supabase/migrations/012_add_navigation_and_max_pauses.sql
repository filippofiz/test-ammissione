-- Migration: Add missing columns to test track config
-- Date: 2025-11-15
-- Purpose: Add section_order, navigation_between_sections and max_pauses columns

-- Add section_order column (was in original migration but may not have been applied)
ALTER TABLE "2V_test_track_config"
ADD COLUMN IF NOT EXISTS section_order JSONB;

-- Add navigation_between_sections column
ALTER TABLE "2V_test_track_config"
ADD COLUMN IF NOT EXISTS navigation_between_sections TEXT DEFAULT 'forward_only';

-- Add max_pauses column for student choice pause mode
ALTER TABLE "2V_test_track_config"
ADD COLUMN IF NOT EXISTS max_pauses INTEGER DEFAULT 3;

-- Add comments
COMMENT ON COLUMN "2V_test_track_config".section_order IS 'Array of section names in the order they should appear (for mandatory mode)';
COMMENT ON COLUMN "2V_test_track_config".navigation_between_sections IS 'Navigation mode between sections: forward_only | back_forward';
COMMENT ON COLUMN "2V_test_track_config".max_pauses IS 'Maximum number of pauses allowed when pause_mode is user_choice';
