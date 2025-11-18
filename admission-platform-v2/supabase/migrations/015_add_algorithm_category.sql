-- Add algorithm_category column to 2V_algorithm_config table
ALTER TABLE "2V_algorithm_config"
ADD COLUMN IF NOT EXISTS algorithm_category TEXT NOT NULL DEFAULT 'adaptive';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_algorithm_config_category
ON "2V_algorithm_config" (test_type, track_type, algorithm_category);

-- Update existing rows to have 'adaptive' as the category
UPDATE "2V_algorithm_config"
SET algorithm_category = 'adaptive'
WHERE algorithm_category IS NULL;
