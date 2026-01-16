/**
 * GMAT Question Import Script
 *
 * This script imports GMAT questions from TypeScript source files into the database.
 *
 * Usage:
 *   npx tsx GMAT/scripts/import-gmat-questions.ts [options]
 *
 * Options:
 *   --file <filename>    Import specific file (e.g., quantitative_reasoning_OG_easy)
 *   --section <QR|VR|DI> Import all files from a section
 *   --all                Import all question files
 *   --dry-run            Show what would be imported without actually importing
 *   --test-id <uuid>     Specify test_id for the Question Pool (required for import)
 *
 * Examples:
 *   npx tsx GMAT/scripts/import-gmat-questions.ts --dry-run --all
 *   npx tsx GMAT/scripts/import-gmat-questions.ts --file quantitative_reasoning_OG_easy --test-id "uuid-here"
 *   npx tsx GMAT/scripts/import-gmat-questions.ts --section QR --test-id "uuid-here"
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { toDBRow, GMATQuestion } from '../sources/questions/types';

// Load environment variables from root .env
// Try multiple possible locations for the .env file
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

// Support multiple env variable names
const supabaseUrl = process.env.VITE_SUPABASE_URL
  || process.env.EXPO_PUBLIC_SUPABASE_URL
  || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.VITE_SUPABASE_ANON_KEY
  || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Found:');
  console.error(`  VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? 'set' : 'not set'}`);
  console.error(`  EXPO_PUBLIC_SUPABASE_URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL ? 'set' : 'not set'}`);
  console.error(`  SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'}`);
  console.error('\nRequired: SUPABASE_URL (or VITE/EXPO variant) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Valid question ID pattern: Section-GMAT-Source-Number
// Examples: QR-GMAT-OG__-00001, DI-GMAT-OG-00273, VR-GMAT-PT1_-00001, QR-GMAT-PQ_-00001
// Sources: OG (Official Guide), SK (Study Kit), SI (Special Items), PT1 (Practice Test 1), PQ (Practice Questions)
// Allow 1 or 2 underscores, optional hyphen before number
const VALID_ID_PATTERN = /^(QR|VR|DI)-GMAT-(OG_?_?|SK_?_?|SI_?_?|PT1_?|PQ_?_?)-?\d{5}$/;

// Question file mapping - based on actual export names from grep
const QUESTION_FILES: Record<string, { section: string; path: string; exportName: string }> = {
  // QR files
  'quantitative_reasoning_OG_easy': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_OG_easy',
    exportName: 'quantitativeReasoningQuestionsOG'
  },
  'quantitative_reasoning_OG_medium': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_OG_medium',
    exportName: 'quantitativeReasoningQuestionsOG'  // Same export name
  },
  'quantitative_reasoning_OG_hard': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_OG_hard',
    exportName: 'quantitativeReasoningQuestionsOG'  // Same export name
  },
  'quantitative_reasoning_PQ_easy': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PQ_easy',
    exportName: 'quantitativeReasoningQuestionsPQ'
  },
  'quantitative_reasoning_PQ_medium': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PQ_medium',
    exportName: 'quantitativeReasoningQuestionsPQ'
  },
  'quantitative_reasoning_PQ_hard': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PQ_hard',
    exportName: 'quantitativeReasoningQuestionsPQ'
  },
  'quantitative_reasoning_PQ': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PQ',
    exportName: 'quantitativeReasoningQuestionsPQ'
  },
  'quantitative_reasoning_PT1': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PT1',
    exportName: 'quantitativeReasoningQuestionsPT1'
  },
  'quantitative_reasoning_SK': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_SK',
    exportName: 'quantitativeReasoningQuestions'  // No suffix
  },
  'quantitative_reasoning_SI': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_SI',
    exportName: 'quantitativeReasoningQuestionsSI'
  },
  // VR files
  'verbal_reasoning_OG_CR_easy': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_CR_easy',
    exportName: 'verbalReasoningQuestionsOG_CR_Easy'
  },
  'verbal_reasoning_OG_CR_medium': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_CR_medium',
    exportName: 'verbalReasoningQuestionsOG_CR_Medium'
  },
  'verbal_reasoning_OG_CR_hard': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_CR_hard',
    exportName: 'verbalReasoningQuestionsOG_CR_Hard'
  },
  'verbal_reasoning_OG_RC_easy': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_RC_easy',
    exportName: 'verbalReasoningQuestionsOG_RC_Easy'
  },
  'verbal_reasoning_OG_RC_medium': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_RC_medium',
    exportName: 'verbalReasoningQuestionsOG_RC_Medium'
  },
  'verbal_reasoning_OG_RC_hard': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_RC_hard',
    exportName: 'verbalReasoningQuestionsOG_RC_Hard'
  },
  'verbal_reasoning_PT1': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_PT1',
    exportName: 'verbalReasoningQuestionsPT1'
  },
  'verbal_reasoning_SK': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_SK',
    exportName: 'verbalReasoningQuestions'  // No suffix
  },
  // DI files
  'data_insights_OG_DS': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_OG_DS',
    exportName: 'dataInsightsOG_DS'
  },
  'data_insights_OG_TPA': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_OG_TPA',
    exportName: 'dataInsightsOG_TPA'
  },
  'data_insights_PQ_DS': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_PQ_DS',
    exportName: 'dataInsightsPQ_DS'
  },
  'data_insights_PQ_TPA': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_PQ_TPA',
    exportName: 'dataInsightsPQ_TPA'
  },
  'data_insights_SK': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_SK',
    exportName: 'dataInsightsQuestions'  // Different name
  },
  'data_insights_PT1': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_PT1',
    exportName: 'dataInsightsQuestionsPT1'
  },
};

interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  imported: number;
  skipped: number;
  errors: number;
  invalidIds: string[];
}

async function loadQuestions(fileKey: string): Promise<GMATQuestion[]> {
  const fileInfo = QUESTION_FILES[fileKey];
  if (!fileInfo) {
    throw new Error(`Unknown file: ${fileKey}`);
  }

  try {
    const module = await import(fileInfo.path);
    const questions = module[fileInfo.exportName];

    if (!Array.isArray(questions)) {
      console.warn(`Warning: ${fileKey} does not export an array as ${fileInfo.exportName}`);
      return [];
    }

    return questions;
  } catch (error) {
    console.error(`Error loading ${fileKey}:`, error);
    return [];
  }
}

function validateQuestionId(id: string): boolean {
  return VALID_ID_PATTERN.test(id);
}

async function importQuestions(
  questions: GMATQuestion[],
  testId: string,
  dryRun: boolean
): Promise<ImportStats> {
  const stats: ImportStats = {
    total: questions.length,
    valid: 0,
    invalid: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    invalidIds: [],
  };

  // Collect valid questions - don't include 'id' field, let database generate UUID
  // The question's text ID will be stored inside question_data as 'gmat_question_id'
  const validQuestions: Array<Record<string, unknown>> = [];

  for (const question of questions) {
    if (!validateQuestionId(question.id)) {
      stats.invalid++;
      stats.invalidIds.push(question.id);
      continue;
    }

    stats.valid++;
    const dbRow = toDBRow(question);

    // Parse question_data to add gmat_question_id
    const questionData = JSON.parse(dbRow.question_data);
    questionData.gmat_question_id = question.id;
    // Store original question_number from source file
    questionData.original_question_number = question.question_number;

    // Generate unique question_number from the ID
    // ID format: QR-GMAT-OG__-00001 -> extract last 5 digits as number
    // Add source offset to prevent collisions:
    // OG: 0-99999, PQ: 100000-199999, SK: 200000-299999, PT1: 300000-399999, SI: 400000-499999
    const numPart = parseInt(question.id.slice(-5), 10);
    let sourceOffset = 0;
    if (question.id.includes('-PQ')) sourceOffset = 100000;
    else if (question.id.includes('-SK')) sourceOffset = 200000;
    else if (question.id.includes('-PT1')) sourceOffset = 300000;
    else if (question.id.includes('-SI')) sourceOffset = 400000;
    const uniqueQuestionNumber = sourceOffset + numPart;

    validQuestions.push({
      test_id: testId,
      test_type: dbRow.test_type,
      question_number: uniqueQuestionNumber,
      question_type: dbRow.question_type,
      section: dbRow.section,
      materia: dbRow.materia,
      difficulty: dbRow.difficulty,
      difficulty_level: dbRow.difficulty_level,
      question_data: questionData,  // Pass as object, Supabase will handle JSONB
      answers: JSON.parse(dbRow.answers),  // Parse for JSONB
      is_active: dbRow.is_active,
      duplicate_question_ids: JSON.parse(dbRow.duplicate_question_ids || '[]'),
    });
  }

  if (dryRun) {
    console.log(`\n[DRY RUN] Would import ${validQuestions.length} questions`);
    return stats;
  }

  // Batch insert (database generates UUIDs)
  const BATCH_SIZE = 50;
  for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
    const batch = validQuestions.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from('2V_questions')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`Error importing batch ${i / BATCH_SIZE + 1}:`, error.message);
      stats.errors += batch.length;
    } else {
      stats.imported += data?.length || 0;
    }
  }

  return stats;
}

async function getOrCreateGMATTestPool(): Promise<string | null> {
  // First, check if GMAT Question Pool test already exists
  const { data: existingTest } = await supabase
    .from('2V_tests')
    .select('id')
    .eq('test_type', 'GMAT')
    .eq('section', 'Question Pool')
    .eq('exercise_type', 'Pool')
    .single();

  if (existingTest) {
    console.log(`Found existing GMAT Question Pool: ${existingTest.id}`);
    return existingTest.id;
  }

  // Create new Question Pool test
  const { data: newTest, error: createError } = await supabase
    .from('2V_tests')
    .insert({
      test_type: 'GMAT',
      section: 'Question Pool',
      exercise_type: 'Pool',
      test_number: 1,
      format: 'interactive',
      is_active: true,
    })
    .select('id')
    .single();

  if (createError) {
    console.error('Error creating GMAT Question Pool:', createError.message);
    return null;
  }

  console.log(`Created new GMAT Question Pool: ${newTest.id}`);
  return newTest.id;
}

async function main() {
  const args = process.argv.slice(2);

  const dryRun = args.includes('--dry-run');
  const importAll = args.includes('--all');
  const fileIndex = args.indexOf('--file');
  const sectionIndex = args.indexOf('--section');
  const testIdIndex = args.indexOf('--test-id');

  const specificFile = fileIndex !== -1 ? args[fileIndex + 1] : null;
  const specificSection = sectionIndex !== -1 ? args[sectionIndex + 1] : null;
  const providedTestId = testIdIndex !== -1 ? args[testIdIndex + 1] : null;

  console.log('========================================');
  console.log('GMAT Question Import Script');
  console.log('========================================\n');

  if (dryRun) {
    console.log('*** DRY RUN MODE - No changes will be made ***\n');
  }

  // Determine test_id
  let testId: string;
  if (providedTestId) {
    testId = providedTestId;
    console.log(`Using provided test_id: ${testId}\n`);
  } else if (!dryRun) {
    console.log('No test_id provided, checking for GMAT Question Pool...');
    const poolId = await getOrCreateGMATTestPool();
    if (!poolId) {
      console.error('Failed to get or create GMAT Question Pool. Exiting.');
      process.exit(1);
    }
    testId = poolId;
  } else {
    testId = 'dry-run-test-id';
  }

  // Determine which files to import
  let filesToImport: string[] = [];

  if (importAll) {
    filesToImport = Object.keys(QUESTION_FILES);
  } else if (specificFile) {
    if (!QUESTION_FILES[specificFile]) {
      console.error(`Unknown file: ${specificFile}`);
      console.log('\nAvailable files:');
      Object.keys(QUESTION_FILES).forEach(f => console.log(`  - ${f}`));
      process.exit(1);
    }
    filesToImport = [specificFile];
  } else if (specificSection) {
    filesToImport = Object.keys(QUESTION_FILES).filter(
      f => QUESTION_FILES[f].section === specificSection
    );
    if (filesToImport.length === 0) {
      console.error(`No files found for section: ${specificSection}`);
      console.log('Valid sections: QR, VR, DI');
      process.exit(1);
    }
  } else {
    console.log('Usage: npx tsx import-gmat-questions.ts [options]\n');
    console.log('Options:');
    console.log('  --file <filename>    Import specific file');
    console.log('  --section <QR|VR|DI> Import all files from a section');
    console.log('  --all                Import all question files');
    console.log('  --dry-run            Show what would be imported');
    console.log('  --test-id <uuid>     Specify test_id for Question Pool\n');
    console.log('Available files:');
    Object.keys(QUESTION_FILES).forEach(f => {
      console.log(`  - ${f} (${QUESTION_FILES[f].section})`);
    });
    process.exit(0);
  }

  console.log(`Files to import: ${filesToImport.length}`);
  console.log(filesToImport.map(f => `  - ${f}`).join('\n'));
  console.log('');

  // Import each file
  const totalStats: ImportStats = {
    total: 0,
    valid: 0,
    invalid: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    invalidIds: [],
  };

  for (const fileKey of filesToImport) {
    console.log(`\n--- Processing: ${fileKey} ---`);

    const questions = await loadQuestions(fileKey);
    if (questions.length === 0) {
      console.log(`  No questions found in ${fileKey}`);
      continue;
    }

    console.log(`  Loaded ${questions.length} questions`);

    const stats = await importQuestions(questions, testId, dryRun);

    console.log(`  Valid: ${stats.valid}, Invalid: ${stats.invalid}`);
    if (!dryRun) {
      console.log(`  Imported: ${stats.imported}, Errors: ${stats.errors}`);
    }

    if (stats.invalidIds.length > 0 && stats.invalidIds.length <= 5) {
      console.log(`  Invalid IDs: ${stats.invalidIds.join(', ')}`);
    } else if (stats.invalidIds.length > 5) {
      console.log(`  Invalid IDs (first 5): ${stats.invalidIds.slice(0, 5).join(', ')}...`);
    }

    // Accumulate stats
    totalStats.total += stats.total;
    totalStats.valid += stats.valid;
    totalStats.invalid += stats.invalid;
    totalStats.imported += stats.imported;
    totalStats.errors += stats.errors;
    totalStats.invalidIds.push(...stats.invalidIds);
  }

  // Summary
  console.log('\n========================================');
  console.log('IMPORT SUMMARY');
  console.log('========================================');
  console.log(`Total questions processed: ${totalStats.total}`);
  console.log(`Valid questions: ${totalStats.valid}`);
  console.log(`Invalid questions (skipped): ${totalStats.invalid}`);
  if (!dryRun) {
    console.log(`Successfully imported: ${totalStats.imported}`);
    console.log(`Errors: ${totalStats.errors}`);
  }
  console.log('========================================\n');
}

main().catch(console.error);
