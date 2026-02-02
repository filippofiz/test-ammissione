import { supabase } from './supabase';
// Import from full generated Supabase types
import type { Database } from '../../database.types';

type Profile = Database['public']['Tables']['2V_profiles']['Row'];

export interface LoginResult {
  success: boolean;
  mustChangePassword: boolean;
  profile: Profile | null;
  error: string | null;
}

/**
 * Sign in with email and password
 * Returns profile data including must_change_password flag
 */
export async function signIn(email: string, password: string): Promise<LoginResult> {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        mustChangePassword: false,
        profile: null,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        mustChangePassword: false,
        profile: null,
        error: 'No user data returned',
      };
    }

    // Fetch user profile using RPC to bypass RLS
    const { data: profileData, error: profileError } = await supabase
      .rpc('get_profile_by_auth_uid', { user_auth_uid: authData.user.id });

    if (profileError || !profileData || profileData.length === 0) {
      return {
        success: false,
        mustChangePassword: false,
        profile: null,
        error: profileError ? `Profile error: ${profileError.message}` : 'Profile not found',
      };
    }

    // The RPC returns a subset of Profile fields, cast to full Profile type
    const profile = profileData[0] as Profile;

    return {
      success: true,
      mustChangePassword: profile.must_change_password ?? false,
      profile,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      mustChangePassword: false,
      profile: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Change user password and update must_change_password flag
 */
export async function changePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    // Update password in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Update profile using RPC to bypass RLS
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_password_changed', { user_auth_uid: user.id });

    if (updateError || !updateResult) {
      return { success: false, error: updateError ? `Profile update error: ${updateError.message}` : 'Failed to update profile' };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current user profile
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Use RPC to bypass RLS (prevents infinite recursion)
    const { data: profileData } = await supabase
      .rpc('get_profile_by_auth_uid', { user_auth_uid: user.id });

    if (!profileData || profileData.length === 0) {
      return null;
    }

    // The RPC returns a subset of Profile fields, cast to full Profile type
    return profileData[0] as Profile;
  } catch {
    return null;
  }
}
