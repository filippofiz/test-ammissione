// Supabase Edge Function to sync test results to external project
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

  console.log('🚀 Sync test results to external Edge Function called');

  try {
    // Get the external Supabase credentials from environment variables
    const externalSupabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalSupabaseKey = Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY');

    if (!externalSupabaseUrl || !externalSupabaseKey) {
      console.error('❌ Missing external Supabase credentials');
      throw new Error('External Supabase credentials not configured');
    }

    // Parse request body
    const {
      externalStudentId,
      testType,
      testName,
      completedAt,
      attemptNumber,
      status,
      correct,
      wrong,
      blank,
      totalQuestions
    } = await req.json();

    console.log('📝 Syncing test result:', {
      externalStudentId,
      testType,
      testName,
      status,
      correct,
      wrong,
      blank,
      totalQuestions
    });

    if (!externalStudentId) {
      throw new Error('Missing externalStudentId');
    }

    // Create client for external Supabase project
    const externalSupabase = createClient(
      externalSupabaseUrl,
      externalSupabaseKey
    );

    // Insert test result
    const { data, error } = await externalSupabase
      .from('entrance_tests_results_externalapp')
      .insert({
        student_id: externalStudentId,
        test_type: testType,
        test_name: testName,
        completed_at: completedAt,
        attempt_number: attemptNumber,
        status: status,
        correct: correct,
        wrong: wrong,
        blank: blank,
        total_questions: totalQuestions
      })
      .select();

    if (error) {
      console.error('❌ Insert error:', error);
      throw error;
    }

    console.log('✅ Test result synced successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Error syncing test result:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
