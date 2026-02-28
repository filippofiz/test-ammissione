-- Migration: 055_fix_student_training_select_rls.sql
-- Purpose: Allow students to SELECT their own training results regardless of results_visible.
--
-- Problem: Migration 043 restricted student SELECT to rows where results_visible = TRUE,
-- which means students can't see their own training completions at all on the preparation
-- page (the count shows 0, all cards appear locked/undone).
--
-- Fix: Students should always be able to read their own rows — the application layer
-- already handles results_visible: it shows "Results pending review" when false and
-- hides the score. RLS should not gate the existence of a completion, only the tutor
-- controls whether detailed results are shown via the results_visible flag in the UI.

DROP POLICY IF EXISTS "Students view own GMAT results" ON "2V_gmat_assessment_results";

CREATE POLICY "Students view own GMAT results"
  ON "2V_gmat_assessment_results" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );
