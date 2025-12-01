-- Migration: Change penalty_for_wrong column to JSONB type
-- Date: 2025-12-01
-- Purpose: Support both fixed penalties (numbers) and option-based penalties (objects)

-- Change penalty_for_wrong from numeric to JSONB
-- This allows storing both:
-- - Fixed penalty: -0.2
-- - Option-based penalty: {"3": -0.33, "4": -0.2}

DO $$
BEGIN
  -- Main table: 2V_algorithm_config
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '2V_algorithm_config'
    AND column_name = 'penalty_for_wrong'
    AND data_type != 'jsonb'
  ) THEN
    -- Drop DEFAULT constraint if exists
    ALTER TABLE "2V_algorithm_config"
    ALTER COLUMN penalty_for_wrong DROP DEFAULT;

    -- Change column type to JSONB
    ALTER TABLE "2V_algorithm_config"
    ALTER COLUMN penalty_for_wrong TYPE JSONB USING
      CASE
        WHEN penalty_for_wrong IS NOT NULL THEN to_jsonb(penalty_for_wrong)
        ELSE NULL
      END;

    RAISE NOTICE 'Updated 2V_algorithm_config.penalty_for_wrong to JSONB';
  END IF;

  -- Test table: 2V_algorithm_config_test
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '2V_algorithm_config_test'
    AND column_name = 'penalty_for_wrong'
    AND data_type != 'jsonb'
  ) THEN
    -- Drop DEFAULT constraint if exists
    ALTER TABLE "2V_algorithm_config_test"
    ALTER COLUMN penalty_for_wrong DROP DEFAULT;

    -- Change column type to JSONB
    ALTER TABLE "2V_algorithm_config_test"
    ALTER COLUMN penalty_for_wrong TYPE JSONB USING
      CASE
        WHEN penalty_for_wrong IS NOT NULL THEN to_jsonb(penalty_for_wrong)
        ELSE NULL
      END;

    RAISE NOTICE 'Updated 2V_algorithm_config_test.penalty_for_wrong to JSONB';
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN "2V_algorithm_config".penalty_for_wrong IS 'Penalty for wrong answers - can be a number (fixed penalty) or object (option-based: {"3": -0.33, "4": -0.2})';
