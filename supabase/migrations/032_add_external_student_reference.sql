-- Migration: Add external student reference to profiles
-- Description: Stores reference ID to students in external project/system

-- Add external_student_id field to 2V_profiles
ALTER TABLE public."2V_profiles"
ADD COLUMN IF NOT EXISTS external_student_id INTEGER;

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_external_student_id
    ON public."2V_profiles"(external_student_id)
    WHERE external_student_id IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN public."2V_profiles".external_student_id IS
    'ID of student in external system';
