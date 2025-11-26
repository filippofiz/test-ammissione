-- Simplify RLS policies: Allow all authenticated users full access
-- This removes role-based restrictions for easier access

-- Drop all existing policies on 2V_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON "2V_profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "2V_profiles";
DROP POLICY IF EXISTS "Tutors can view their students" ON "2V_profiles";
DROP POLICY IF EXISTS "Tutors can view other tutors" ON "2V_profiles";
DROP POLICY IF EXISTS "Tutors can insert students" ON "2V_profiles";
DROP POLICY IF EXISTS "Tutors can update their students" ON "2V_profiles";
DROP POLICY IF EXISTS "Admins have full access" ON "2V_profiles";

-- Create single policy for all authenticated users
CREATE POLICY "Authenticated users have full access"
  ON "2V_profiles"
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
