// Supabase Edge Function: admin-reset-password
// Allows admins to reset user passwords to a temporary value

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  console.log('========== ADMIN RESET PASSWORD FUNCTION CALLED ==========');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request - returning 200');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);

    if (!authHeader) {
      console.error('ERROR: Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token to verify they're authenticated
    console.log('Creating Supabase client...');
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user is authenticated and is an admin
    console.log('Verifying user authentication...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.error('ERROR: No user returned from auth');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id, user.email);

    // Check if user has ADMIN role
    console.log('Checking admin role for user:', user.id);
    const { data: profile, error: profileError } = await supabaseClient
      .from('2V_profiles')
      .select('roles')
      .eq('auth_uid', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User profile:', profile);
    console.log('User roles:', profile?.roles);

    if (!profile || !Array.isArray(profile.roles) || !profile.roles.includes('ADMIN')) {
      console.error('ERROR: User is not an admin. Roles:', profile?.roles);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User is admin - proceeding with password reset');

    // Get request body
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { user_auth_uid, new_password } = body;

    if (!user_auth_uid || !new_password) {
      console.error('ERROR: Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_auth_uid, new_password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Resetting password for user:', user_auth_uid);

    // Create admin client with service role key
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update the user's password using admin API
    console.log('Calling admin.updateUserById...');
    const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
      user_auth_uid,
      { password: new_password }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update password', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Password updated successfully:', updateData);

    // Update the profile to set must_change_password flag
    console.log('Updating profile must_change_password flag...');
    const { error: profileUpdateError } = await adminClient
      .from('2V_profiles')
      .update({ must_change_password: true, updated_at: new Date().toISOString() })
      .eq('auth_uid', user_auth_uid);

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
      return new Response(
        JSON.stringify({ error: 'Password updated but failed to set password change flag', details: profileUpdateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile updated successfully');
    console.log('========== PASSWORD RESET COMPLETED SUCCESSFULLY ==========');

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('========== FUNCTION ERROR ==========');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
