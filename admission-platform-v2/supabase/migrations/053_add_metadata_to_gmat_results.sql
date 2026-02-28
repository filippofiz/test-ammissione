-- Migration: 053_add_metadata_to_gmat_results.sql
-- Purpose: Add missing metadata JSONB column to 2V_gmat_assessment_results
-- Required by saveSectionAssessmentResult() in gmat.ts for IRT scoring data

ALTER TABLE "2V_gmat_assessment_results"
ADD COLUMN IF NOT EXISTS metadata JSONB;

COMMENT ON COLUMN "2V_gmat_assessment_results".metadata IS
  'IRT scoring metadata for section assessments: gmat_section_score, theta, adjusted_theta, se, unanswered_count, percentile, cycle, algorithm_version, response_pattern_details';
