-- Migration: Add calculator type support to test track config
-- Date: 2025-11-27
-- Purpose: Add calculator_type field to support different calculator modes (regular, graphing, scientific)

-- ============================================================================
-- ADD CALCULATOR_TYPE COLUMN
-- ============================================================================

-- Add calculator_type column to 2V_test_track_config
ALTER TABLE "2V_test_track_config"
ADD COLUMN IF NOT EXISTS calculator_type TEXT DEFAULT 'regular';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN "2V_test_track_config".calculator_type IS 'Calculator type: none (no calculator), regular (GMAT-style), graphing (Desmos graphing), scientific (Desmos scientific/SAT)';

-- ============================================================================
-- UPDATE EXISTING CONFIGURATIONS
-- ============================================================================

-- GMAT tests typically use regular calculator for Data Insights
UPDATE "2V_test_track_config"
SET calculator_type = 'regular'
WHERE test_type = 'GMAT' AND calculator_type IS NULL;

-- SAT tests typically use graphing or scientific calculator
UPDATE "2V_test_track_config"
SET calculator_type = 'scientific'
WHERE test_type = 'SAT' AND calculator_type IS NULL;

-- Other tests default to 'none' unless specified
UPDATE "2V_test_track_config"
SET calculator_type = COALESCE(calculator_type, 'none')
WHERE calculator_type IS NULL;

-- ============================================================================
-- VALIDATION
-- ============================================================================

-- Add check constraint to ensure valid calculator types
ALTER TABLE "2V_test_track_config"
ADD CONSTRAINT check_calculator_type
CHECK (calculator_type IN ('none', 'regular', 'graphing', 'scientific'));

-- ============================================================================
-- EXAMPLES
-- ============================================================================

-- Example: SAT test with scientific calculator (for sections that allow it)
-- INSERT INTO "2V_test_track_config" (test_type, track_type, calculator_type, section_order_mode, navigation_mode)
-- VALUES ('SAT', 'full_test', 'scientific', 'mandatory', 'forward_only')
-- ON CONFLICT (test_type, track_type) DO UPDATE SET calculator_type = EXCLUDED.calculator_type;

-- Example: GMAT test with regular calculator for Data Insights
-- INSERT INTO "2V_test_track_config" (test_type, track_type, calculator_type, section_order_mode, navigation_mode)
-- VALUES ('GMAT', 'diagnostic', 'regular', 'mandatory', 'forward_only')
-- ON CONFLICT (test_type, track_type) DO UPDATE SET calculator_type = EXCLUDED.calculator_type;

-- Example: Test with graphing calculator
-- INSERT INTO "2V_test_track_config" (test_type, track_type, calculator_type, section_order_mode, navigation_mode)
-- VALUES ('CUSTOM', 'math_test', 'graphing', 'user_choice', 'back_forward')
-- ON CONFLICT (test_type, track_type) DO UPDATE SET calculator_type = EXCLUDED.calculator_type;
