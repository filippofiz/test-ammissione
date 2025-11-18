/**
 * Quick script to check question data in database
 */
const { createClient } = require('@supabase/supabase-js');

// Use the local Supabase URL and anon key from your .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuestions() {
  console.log('Checking questions in database...\n');

  const { data, error } = await supabase
    .from('2V_tests')
    .select('*')
    .eq('test_type', 'GMAT')
    .eq('section', 'Multi-topic')
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} questions\n`);

  data.forEach((q, i) => {
    console.log(`\n=== Question ${i + 1} ===`);
    console.log('ID:', q.id);
    console.log('Test Number:', q.test_number);
    console.log('Question Type:', q.question_type);
    console.log('Question Data:', JSON.stringify(q.question_data, null, 2));
    console.log('Answers:', JSON.stringify(q.answers, null, 2));
  });
}

checkQuestions();
