// Supabase Edge Function to update student email in external Supabase project
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 Update email Edge Function called');

  try {
    // Get the external Supabase credentials from environment variables
    const externalSupabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalSupabaseKey = Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY');

    if (!externalSupabaseUrl || !externalSupabaseKey) {
      console.error('❌ Missing external Supabase credentials');
      throw new Error('External Supabase credentials not configured');
    }

    // Parse request body
    const { studentId, email } = await req.json();
    console.log('📝 Updating student ID:', studentId, 'with email:', email);

    if (!studentId || !email) {
      throw new Error('Missing studentId or email');
    }

    // Create client for external Supabase project
    const externalSupabase = createClient(
      externalSupabaseUrl,
      externalSupabaseKey
    );

    // Update the student email
    const { data, error } = await externalSupabase
      .from('students_list')
      .update({ studentMail: email })
      .eq('id', studentId)
      .select();

    if (error) {
      console.error('❌ Update error:', error);
      throw error;
    }

    console.log('✅ Email updated successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Error updating external student email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
