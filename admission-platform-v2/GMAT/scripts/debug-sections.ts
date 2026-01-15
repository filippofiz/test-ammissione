import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function debug() {
  // Get unique sections
  const { data: allQuestions, count } = await supabase
    .from('2V_questions')
    .select('section, question_type', { count: 'exact' })
    .eq('test_type', 'GMAT')
    .limit(2000);

  console.log('Total questions:', count);
  console.log('Rows fetched:', allQuestions?.length);

  if (allQuestions) {
    const sectionTypes: Record<string, Set<string>> = {};
    const sectionCounts: Record<string, number> = {};

    allQuestions.forEach((q) => {
      sectionCounts[q.section] = (sectionCounts[q.section] || 0) + 1;
      if (!sectionTypes[q.section]) {
        sectionTypes[q.section] = new Set();
      }
      sectionTypes[q.section].add(q.question_type);
    });

    console.log('\nUnique sections found:');
    Object.entries(sectionCounts).forEach(([section, count]) => {
      const types = Array.from(sectionTypes[section]).join(', ');
      console.log(`  "${section}": ${count} (types: ${types})`);
    });
  }
}

debug();
