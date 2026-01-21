// Supabase Edge Function to fetch students from external Supabase project
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExternalStudent {
  id: number;
  studentName: string;
  studentMail: string | null;
  parentName: string | null;
  parentMail: string | null;
  parentPhoneNumber: string | null;
  subjects: string | null;
  class: string | null;
  school: string | null;
  mainTutor: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 Edge Function called');

  try {
    // Get the external Supabase credentials from environment variables
    const externalSupabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalSupabaseKey = Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY');

    console.log('🔑 External URL present:', !!externalSupabaseUrl);
    console.log('🔑 External Key present:', !!externalSupabaseKey);
    console.log('🌐 External URL:', externalSupabaseUrl);

    if (!externalSupabaseUrl || !externalSupabaseKey) {
      console.error('❌ Missing external Supabase credentials');
      throw new Error('External Supabase credentials not configured');
    }

    // Create client for external Supabase project
    console.log('🔧 Creating Supabase client...');
    const externalSupabase = createClient(
      externalSupabaseUrl,
      externalSupabaseKey
    );

    // Parse query parameters
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('search') || '';
    console.log('🔍 Search query:', searchQuery);

    // Query the external students table
    const tableName = 'students_list';
    console.log('📋 Querying table:', tableName);

    let query = externalSupabase
      .from(tableName)
      .select('id, studentName, studentMail, parentName, parentMail, parentPhoneNumber, subjects, class, school, mainTutor')
      .order('studentName', { ascending: true });

    // Add search filter if provided (only search in studentName for performance)
    if (searchQuery) {
      console.log('🔎 Adding search filter on studentName only');
      query = query.ilike('studentName', `%${searchQuery}%`);
    }

    console.log('📡 Executing query...');
    const { data: students, error } = await query;

    if (error) {
      console.error('❌ Query error:', error);
      throw error;
    }

    console.log('✅ Query successful');
    console.log('👥 Number of students found:', students?.length || 0);
    console.log('📦 First student:', students?.[0]);

    return new Response(
      JSON.stringify({ students }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Error fetching external students:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
