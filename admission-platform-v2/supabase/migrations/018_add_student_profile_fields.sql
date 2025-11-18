-- Migration: Add student profile fields for tracking real test dates and academic info
-- Date: 2025-11-17
-- Purpose: Add fields for real exam dates, school grades, and past test results

-- Add new columns to 2V_profiles table
ALTER TABLE "2V_profiles"
ADD COLUMN IF NOT EXISTS real_test_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS average_school_grade DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS past_test_results JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS student_notes TEXT;

-- Create index for real_test_date to quickly find upcoming tests
CREATE INDEX IF NOT EXISTS idx_2V_profiles_real_test_date ON "2V_profiles"(real_test_date)
  WHERE real_test_date IS NOT NULL AND roles @> '"STUDENT"'::jsonb;

-- Add comments
COMMENT ON COLUMN "2V_profiles".real_test_date IS 'Future real exam date for countdown timer';
COMMENT ON COLUMN "2V_profiles".average_school_grade IS 'Student average school grades (e.g., 85.5 for 85.5%)';
COMMENT ON COLUMN "2V_profiles".past_test_results IS 'Array of past test attempts with dates and scores, e.g., [{"date": "2025-01-15", "test_type": "SAT", "score": 1250, "notes": "First attempt"}]';
COMMENT ON COLUMN "2V_profiles".student_notes IS 'General notes about the student from tutor';
