-- Simplify RLS policies for 2V_test_assignments: Allow all authenticated users full access

-- Drop all existing policies on 2V_test_assignments
DROP POLICY IF EXISTS "Students view own assignments" ON "2V_test_assignments";
DROP POLICY IF EXISTS "Students update own assignments" ON "2V_test_assignments";
DROP POLICY IF EXISTS "Tutors view student assignments" ON "2V_test_assignments";
DROP POLICY IF EXISTS "Tutors manage student assignments" ON "2V_test_assignments";
DROP POLICY IF EXISTS "Admins manage all assignments" ON "2V_test_assignments";

-- Create single policy for all authenticated users
CREATE POLICY "Authenticated users have full access"
  ON "2V_test_assignments"
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
