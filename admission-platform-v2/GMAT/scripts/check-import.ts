import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
  console.log('Checking GMAT questions in database...\n');

  const { count, error } = await supabase
    .from('2V_questions')
    .select('*', { count: 'exact', head: true })
    .eq('test_type', 'GMAT');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total GMAT questions: ${count}`);

  // Get all questions to analyze (increase limit to get all)
  const { data: questions } = await supabase
    .from('2V_questions')
    .select('section, difficulty, question_type')
    .eq('test_type', 'GMAT')
    .limit(2000);

  if (questions) {
    const sectionCounts: Record<string, number> = {};
    const difficultyCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    questions.forEach((q) => {
      sectionCounts[q.section] = (sectionCounts[q.section] || 0) + 1;
      if (q.difficulty) {
        difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
      }
      typeCounts[q.question_type] = (typeCounts[q.question_type] || 0) + 1;
    });

    console.log('\nBy section:');
    Object.entries(sectionCounts).sort().forEach(([section, count]) => {
      console.log(`  ${section}: ${count}`);
    });

    console.log('\nBy difficulty:');
    Object.entries(difficultyCounts).sort().forEach(([diff, count]) => {
      console.log(`  ${diff}: ${count}`);
    });

    console.log('\nBy question_type:');
    Object.entries(typeCounts).sort().forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // Check for null/missing difficulties
    const nodifficulty = questions.filter(q => !q.difficulty).length;
    if (nodifficulty > 0) {
      console.log(`\nQuestions without difficulty: ${nodifficulty}`);
    }
  }
}

check();
