-- Diagnostic queries to debug tutor access to student answers
-- Run this as a tutor user to see what's happening

-- 1. Check current user
SELECT
  'Current User' as check_name,
  auth.uid() as auth_uid,
  id,
  email,
  roles,
  roles @> '"TUTOR"'::jsonb as has_tutor_role
FROM "2V_profiles"
WHERE auth_uid = auth.uid();

-- 2. Check students assigned to current tutor
SELECT
  'Students Assigned to Me' as check_name,
  s.id as student_id,
  s.email as student_email,
  s.full_name as student_name,
  s.tutor_id,
  t.email as tutor_email
FROM "2V_profiles" s
JOIN "2V_profiles" t ON s.tutor_id = t.id
WHERE t.auth_uid = auth.uid();

-- 3. Check ALL student answers (admin view)
SELECT
  'All Student Answers' as check_name,
  sa.id,
  sa.student_id,
  p.email as student_email,
  p.tutor_id,
  sa.assignment_id,
  sa.submitted_at
FROM "2V_student_answers" sa
JOIN "2V_profiles" p ON sa.student_id = p.id
ORDER BY sa.submitted_at DESC
LIMIT 20;

-- 4. Check what the RLS policy should return
SELECT
  'What RLS Should Show' as check_name,
  sa.id,
  sa.student_id,
  p.email as student_email,
  sa.assignment_id
FROM "2V_student_answers" sa
JOIN "2V_profiles" p ON sa.student_id = p.id
WHERE sa.student_id IN (
  SELECT id FROM "2V_profiles"
  WHERE tutor_id IN (
    SELECT id FROM "2V_profiles"
    WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb
  )
);

-- 5. Check the tutor profile table structure
SELECT
  'Sample Profile Data' as check_name,
  id,
  email,
  tutor_id,
  roles
FROM "2V_profiles"
LIMIT 5;
