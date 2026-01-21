import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Use service role with auth bypass for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function cleanup() {
  console.log('Deleting existing GMAT questions...');

  // First count
  const { count: beforeCount } = await supabase
    .from('2V_questions')
    .select('*', { count: 'exact', head: true })
    .eq('test_type', 'GMAT');

  console.log(`Questions before delete: ${beforeCount}`);

  // Delete all GMAT questions at once
  const { data, error } = await supabase
    .from('2V_questions')
    .delete()
    .eq('test_type', 'GMAT')
    .select('id');

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(`Deleted ${data?.length || 0} questions`);
  }

  // Count after
  const { count: afterCount } = await supabase
    .from('2V_questions')
    .select('*', { count: 'exact', head: true })
    .eq('test_type', 'GMAT');

  console.log(`\nQuestions after delete: ${afterCount}`);
  console.log(`Total deleted: ${deleted}`);
}

cleanup();
