-- Migration: 061_backfill_seen_question_ids.sql
-- Purpose: Backfill seen_question_ids for existing students whose questions were
-- never tracked because the student UPDATE policy was missing on
-- 2V_gmat_student_progress (fixed in migration 060).
--
-- Strategy: For each student who has a progress record, collect all question_ids
-- across every assessment result row and merge them (distinct) into seen_question_ids.
-- This covers trainings, section assessments, placement assessments, and mock simulations.
-- Created: March 2026

UPDATE "2V_gmat_student_progress" p
SET seen_question_ids = ARRAY(
  SELECT DISTINCT unnest(aggregated.all_ids)
  FROM (
    SELECT array_agg(qid) AS all_ids
    FROM (
      SELECT unnest(question_ids) AS qid
      FROM "2V_gmat_assessment_results"
      WHERE student_id = p.student_id
        AND question_ids IS NOT NULL
        AND array_length(question_ids, 1) > 0
    ) expanded
  ) aggregated
  WHERE aggregated.all_ids IS NOT NULL
)
WHERE EXISTS (
  SELECT 1
  FROM "2V_gmat_assessment_results" r
  WHERE r.student_id = p.student_id
    AND r.question_ids IS NOT NULL
    AND array_length(r.question_ids, 1) > 0
);
