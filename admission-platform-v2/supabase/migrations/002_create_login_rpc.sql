-- Create RPC function for login that bypasses RLS
-- Date: 2025-11-14
-- This function is needed because RLS prevents fetching profile during login

-- Create a function that returns user profile after login
CREATE OR REPLACE FUNCTION public.get_profile_by_auth_uid(user_auth_uid UUID)
RETURNS TABLE (
  id UUID,
  auth_uid UUID,
  email TEXT,
  name TEXT,
  roles JSONB,
  tutor_id UUID,
  tests JSONB,
  esigenze_speciali BOOLEAN,
  must_change_password BOOLEAN,
  last_password_change TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.auth_uid,
    p.email,
    p.name,
    p.roles,
    p.tutor_id,
    p.tests,
    p.esigenze_speciali,
    p.must_change_password,
    p.last_password_change,
    p.created_at,
    p.updated_at
  FROM "2V_profiles" p
  WHERE p.auth_uid = user_auth_uid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_by_auth_uid(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_profile_by_auth_uid IS 'Get user profile by auth_uid, bypassing RLS for login flow';
