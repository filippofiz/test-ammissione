-- Migration: 035_add_template_flag_to_materials.sql
-- Purpose: Add is_template flag to distinguish question templates from real materials
-- Created: January 2025

-- Add is_template column to identify question allocation templates
-- These are PDFs that specify how many questions should be in a training/assessment
-- They should NOT be shown to students, only used by admins for question allocation
ALTER TABLE "2V_lesson_materials"
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Add column to store question allocation configuration for templates
-- This will store the allocated question IDs for this template
ALTER TABLE "2V_lesson_materials"
ADD COLUMN IF NOT EXISTS question_allocation JSONB DEFAULT NULL;

-- Add column to store question requirements for templates
-- This defines how many questions of each difficulty/category are needed
ALTER TABLE "2V_lesson_materials"
ADD COLUMN IF NOT EXISTS question_requirements JSONB DEFAULT NULL;

-- The question_requirements structure:
-- {
--   "total_questions": 14,
--   "time_limit_minutes": 35,
--   "difficulty_distribution": {
--     "beginner": { "easy": 10, "medium": 3, "hard": 1 },
--     "intermediate": { "easy": 4, "medium": 7, "hard": 3 },
--     "advanced": { "easy": 2, "medium": 5, "hard": 7 },
--     "elite": { "easy": 1, "medium": 3, "hard": 10 }
--   },
--   "categories": [
--     { "name": "Value Questions - Algebra", "count": "4-5", "subtopics": ["Solving for x", "expressions"] },
--     { "name": "Yes/No Questions", "count": "3-4", "subtopics": ["Is x positive?", "comparisons"] }
--   ]
-- }

-- The question_allocation structure:
-- {
--   "question_count": 10,           -- How many questions this template expects
--   "allocated_questions": [        -- Array of question IDs that have been allocated
--     "uuid1", "uuid2", ...
--   ],
--   "allocated_at": "timestamp",    -- When questions were last allocated
--   "allocated_by": "uuid"          -- Who allocated the questions
-- }

-- Update existing template files to mark them as templates
-- Pattern: question-template-* files are templates, not real materials
UPDATE "2V_lesson_materials"
SET is_template = true
WHERE title ILIKE '%Question Template%'
   OR pdf_storage_path ILIKE '%question-template%';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_lesson_materials_is_template
  ON "2V_lesson_materials"(is_template);

-- Comment on column
COMMENT ON COLUMN "2V_lesson_materials".is_template IS
  'If true, this is a question allocation template for admins, not a real student material';

COMMENT ON COLUMN "2V_lesson_materials".question_allocation IS
  'JSON object storing allocated question IDs for template materials';
