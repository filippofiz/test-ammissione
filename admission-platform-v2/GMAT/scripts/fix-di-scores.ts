/**
 * Fix DI Assessment Scores
 *
 * Retroactively fixes GMAT assessment results where Data Insights questions
 * were incorrectly scored due to a type mismatch between how correct_answer
 * is stored (wrapped in an array for DI questions) and how the scoring logic
 * compared answers.
 *
 * Usage:
 *   npx tsx GMAT/scripts/fix-di-scores.ts --dry-run    # Preview changes
 *   npx tsx GMAT/scripts/fix-di-scores.ts               # Apply fixes
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded env from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('Warning: Could not find .env file');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
  || process.env.EXPO_PUBLIC_SUPABASE_URL
  || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.VITE_SUPABASE_ANON_KEY
  || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Answer checking logic (mirrors apps/web/src/lib/gmat/answerChecking.ts)
function checkAnswerCorrectness(
  userAnswer: unknown,
  correctAnswer: unknown,
  diType?: string | null,
): boolean {
  if (correctAnswer == null || userAnswer == null) return false;

  if (diType) {
    switch (diType) {
      case 'DS': {
        let correct = correctAnswer;
        if (Array.isArray(correctAnswer) && correctAnswer.length === 1 && typeof correctAnswer[0] === 'string') {
          correct = correctAnswer[0];
        }
        if (typeof correct === 'string' && typeof userAnswer === 'string') {
          return userAnswer.toUpperCase() === correct.toUpperCase();
        }
        return false;
      }
      case 'GI':
      case 'MSR': {
        const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [];
        const userArr = Array.isArray(userAnswer) ? userAnswer : [];
        if (correctArr.length !== userArr.length || correctArr.length === 0) return false;
        return correctArr.every((val: unknown, idx: number) =>
          String(val).toLowerCase() === String(userArr[idx]).toLowerCase(),
        );
      }
      case 'TA':
      case 'TPA': {
        let correct = correctAnswer;
        if (Array.isArray(correctAnswer) && correctAnswer.length === 1 && typeof correctAnswer[0] === 'object') {
          correct = correctAnswer[0];
        }
        if (typeof correct === 'object' && correct !== null && !Array.isArray(correct) &&
            typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer)) {
          return JSON.stringify(userAnswer) === JSON.stringify(correct);
        }
        return false;
      }
    }
  }

  if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
    return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
  }
  if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
    if (correctAnswer.length !== userAnswer.length) return false;
    return correctAnswer.every((val: unknown, idx: number) =>
      String(val).toLowerCase() === String(userAnswer[idx]).toLowerCase(),
    );
  }
  if (typeof correctAnswer === 'object' && correctAnswer !== null && !Array.isArray(correctAnswer) &&
      typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer)) {
    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  }
  return false;
}

interface AnswerEntry {
  answer: unknown;
  is_correct: boolean;
  time_spent_seconds: number;
  is_unanswered?: boolean;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('========================================');
  console.log('Fix DI Assessment Scores');
  console.log('========================================\n');
  if (dryRun) console.log('*** DRY RUN — no changes will be made ***\n');

  // Fetch all assessment results that might contain DI questions
  // This includes all DI section results plus mock/placement results that span multiple sections
  const { data: results, error: resultsError } = await supabase
    .from('2V_gmat_assessment_results')
    .select('id, section, assessment_type, score_raw, score_total, score_percentage, question_ids, answers_data, difficulty_breakdown')
    .not('answers_data', 'is', null);

  if (resultsError) {
    console.error('Error fetching results:', resultsError.message);
    process.exit(1);
  }

  if (!results || results.length === 0) {
    console.log('No assessment results found.');
    return;
  }

  console.log(`Found ${results.length} total assessment results to check.\n`);

  let fixedCount = 0;
  let unchangedCount = 0;

  for (const result of results) {
    const answersData = (typeof result.answers_data === 'string'
      ? JSON.parse(result.answers_data)
      : result.answers_data) as Record<string, AnswerEntry> | null;

    if (!answersData || Object.keys(answersData).length === 0) continue;

    const questionIds = (typeof result.question_ids === 'string'
      ? JSON.parse(result.question_ids)
      : result.question_ids) as string[] | null;

    if (!questionIds || questionIds.length === 0) continue;

    // Fetch questions for this result
    const { data: questions, error: qError } = await supabase
      .from('2V_questions')
      .select('id, answers, question_data, difficulty')
      .in('id', questionIds);

    if (qError || !questions) {
      console.error(`  Error fetching questions for result ${result.id}: ${qError?.message}`);
      continue;
    }

    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Re-evaluate each answer
    let newCorrectCount = 0;
    let changed = false;
    const updatedAnswersData = { ...answersData };
    const difficultyBreakdown: Record<string, { correct: number; total: number; unanswered?: number }> = {
      easy: { correct: 0, total: 0, unanswered: 0 },
      medium: { correct: 0, total: 0, unanswered: 0 },
      hard: { correct: 0, total: 0, unanswered: 0 },
    };

    for (const questionId of questionIds) {
      const question = questionMap.get(questionId);
      const answerEntry = answersData[questionId];

      if (!question) continue;

      const difficulty = (question.difficulty || 'medium').toLowerCase();
      if (difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty].total++;
      }

      if (!answerEntry || answerEntry.is_unanswered) {
        if (difficultyBreakdown[difficulty]) {
          difficultyBreakdown[difficulty].unanswered = (difficultyBreakdown[difficulty].unanswered || 0) + 1;
        }
        continue;
      }

      const answersObj = typeof question.answers === 'string'
        ? JSON.parse(question.answers)
        : question.answers;
      const correctAnswer = answersObj?.correct_answer;

      const questionData = typeof question.question_data === 'string'
        ? JSON.parse(question.question_data)
        : question.question_data;

      const newIsCorrect = checkAnswerCorrectness(answerEntry.answer, correctAnswer, questionData?.di_type);

      if (newIsCorrect) {
        newCorrectCount++;
        if (difficultyBreakdown[difficulty]) {
          difficultyBreakdown[difficulty].correct++;
        }
      }

      if (newIsCorrect !== answerEntry.is_correct) {
        changed = true;
        updatedAnswersData[questionId] = {
          ...answerEntry,
          is_correct: newIsCorrect,
        };
      }
    }

    if (!changed) {
      unchangedCount++;
      continue;
    }

    const newTotal = questionIds.length;
    const newPercentage = newTotal > 0 ? (newCorrectCount / newTotal) * 100 : 0;

    console.log(`Result ${result.id} (${result.assessment_type} - ${result.section}):`);
    console.log(`  Score: ${result.score_raw}/${result.score_total} (${result.score_percentage}%) → ${newCorrectCount}/${newTotal} (${newPercentage.toFixed(2)}%)`);
    console.log(`  Difficulty: ${JSON.stringify(difficultyBreakdown)}`);

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('2V_gmat_assessment_results')
        .update({
          score_raw: newCorrectCount,
          score_total: newTotal,
          score_percentage: newPercentage.toFixed(2),
          answers_data: updatedAnswersData,
          difficulty_breakdown: difficultyBreakdown,
        })
        .eq('id', result.id);

      if (updateError) {
        console.error(`  ERROR updating: ${updateError.message}`);
      } else {
        console.log('  Updated successfully.');
      }
    }

    fixedCount++;
  }

  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Results checked: ${results.length}`);
  console.log(`Results needing fix: ${fixedCount}`);
  console.log(`Results unchanged: ${unchangedCount}`);
  if (dryRun && fixedCount > 0) {
    console.log('\nRun without --dry-run to apply fixes.');
  }
  console.log('========================================\n');
}

main().catch(console.error);
