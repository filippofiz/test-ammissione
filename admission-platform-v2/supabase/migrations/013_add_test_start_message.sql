-- Migration: Add test start message field
-- Date: 2025-11-15
-- Purpose: Add configurable message shown to students at test start

-- Add test_start_message column
ALTER TABLE "2V_test_track_config"
ADD COLUMN IF NOT EXISTS test_start_message TEXT;

-- Add comment
COMMENT ON COLUMN "2V_test_track_config".test_start_message IS 'Message displayed to students at the start of the test, auto-generated based on config and editable';
