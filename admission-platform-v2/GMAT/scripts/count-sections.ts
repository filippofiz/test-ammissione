import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function countSections() {
  console.log('Counting GMAT questions by section...\n');

  // Total count
  const { count: total } = await supabase
    .from('2V_questions')
    .select('*', { count: 'exact', head: true })
    .eq('test_type', 'GMAT');
  console.log(`Total GMAT questions: ${total}`);

  // Count each section separately
  const sections = ['Quantitative Reasoning', 'Verbal Reasoning', 'Data Insights'];

  for (const section of sections) {
    const { count } = await supabase
      .from('2V_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_type', 'GMAT')
      .eq('section', section);
    console.log(`  ${section}: ${count}`);
  }

  // Check question types
  console.log('\nBy question_type:');
  for (const qtype of ['multiple_choice', 'data_insights']) {
    const { count } = await supabase
      .from('2V_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_type', 'GMAT')
      .eq('question_type', qtype);
    console.log(`  ${qtype}: ${count}`);
  }

  // Sum of sections
  let sectionSum = 0;
  for (const section of sections) {
    const { count } = await supabase
      .from('2V_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_type', 'GMAT')
      .eq('section', section);
    sectionSum += count || 0;
  }
  console.log(`\nSum of sections: ${sectionSum}`);
  console.log(`Unaccounted: ${(total || 0) - sectionSum}`);
}

countSections();
