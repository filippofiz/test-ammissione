-- Migration: Create RPC function for changing password
-- This function bypasses RLS to update the must_change_password flag
-- after a user changes their password

CREATE OR REPLACE FUNCTION public.update_password_changed(user_auth_uid UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "2V_profiles"
  SET
    must_change_password = false,
    last_password_change = now(),
    updated_at = now()
  WHERE auth_uid = user_auth_uid;

  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_password_changed(UUID) TO authenticated;

COMMENT ON FUNCTION public.update_password_changed IS
  'Updates the must_change_password flag after password change. Uses SECURITY DEFINER to bypass RLS.';
