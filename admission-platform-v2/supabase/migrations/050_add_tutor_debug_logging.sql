-- Debug function to check why tutors can't see student answers
-- Date: 2026-02-04

-- Create a debug function to check tutor access
CREATE OR REPLACE FUNCTION debug_tutor_student_answers(p_auth_uid UUID DEFAULT NULL)
RETURNS TABLE (
  step TEXT,
  result JSONB
) AS $$
DECLARE
  v_auth_uid UUID;
  v_tutor_profile_id UUID;
  v_tutor_roles JSONB;
BEGIN
  -- Use provided auth_uid or current user
  v_auth_uid := COALESCE(p_auth_uid, auth.uid());

  -- Step 1: Check current user's auth_uid
  RETURN QUERY
  SELECT
    '1. Current auth_uid'::TEXT,
    jsonb_build_object('auth_uid', v_auth_uid);

  -- Step 2: Find tutor's profile
  SELECT id, roles INTO v_tutor_profile_id, v_tutor_roles
  FROM "2V_profiles"
  WHERE auth_uid = v_auth_uid;

  RETURN QUERY
  SELECT
    '2. Tutor profile'::TEXT,
    jsonb_build_object(
      'profile_id', v_tutor_profile_id,
      'roles', v_tutor_roles,
      'has_tutor_role', v_tutor_roles @> '"TUTOR"'::jsonb
    );

  -- Step 3: Find students assigned to this tutor
  RETURN QUERY
  SELECT
    '3. Students for this tutor'::TEXT,
    jsonb_agg(jsonb_build_object(
      'student_id', id,
      'email', email,
      'full_name', full_name,
      'tutor_id', tutor_id
    ))
  FROM "2V_profiles"
  WHERE tutor_id = v_tutor_profile_id;

  -- Step 4: Check student answers
  RETURN QUERY
  SELECT
    '4. Student answers'::TEXT,
    jsonb_agg(jsonb_build_object(
      'answer_id', sa.id,
      'student_id', sa.student_id,
      'assignment_id', sa.assignment_id,
      'question_id', sa.question_id,
      'submitted_at', sa.submitted_at
    ))
  FROM "2V_student_answers" sa;

  -- Step 5: Check which student IDs should be visible
  RETURN QUERY
  SELECT
    '5. Student IDs that should be visible'::TEXT,
    jsonb_agg(p.id)
  FROM "2V_profiles" p
  WHERE p.tutor_id IN (
    SELECT id FROM "2V_profiles"
    WHERE auth_uid = v_auth_uid AND roles @> '"TUTOR"'::jsonb
  );

  -- Step 6: Check if answers match visible students
  RETURN QUERY
  SELECT
    '6. Answers matching tutor students'::TEXT,
    jsonb_agg(jsonb_build_object(
      'answer_id', sa.id,
      'student_id', sa.student_id,
      'student_email', p.email
    ))
  FROM "2V_student_answers" sa
  JOIN "2V_profiles" p ON sa.student_id = p.id
  WHERE sa.student_id IN (
    SELECT id FROM "2V_profiles"
    WHERE tutor_id = v_tutor_profile_id
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION debug_tutor_student_answers TO authenticated;

COMMENT ON FUNCTION debug_tutor_student_answers IS 'Debug function to check why tutors cannot see student answers. Call with: SELECT * FROM debug_tutor_student_answers();';
