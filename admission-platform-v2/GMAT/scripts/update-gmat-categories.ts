/**
 * Script to update GMAT questions with their categories
 *
 * This script:
 * 1. Reads all GMAT question source files
 * 2. Extracts question IDs and their categories
 * 3. Updates the question_data JSONB field in the database to include categories
 *
 * The import script stores the source ID as `gmat_question_id` in question_data,
 * so we can match questions using that field.
 *
 * Usage:
 *   npx tsx GMAT/scripts/update-gmat-categories.ts --dry-run
 *   npx tsx GMAT/scripts/update-gmat-categories.ts --update
 *   npx tsx GMAT/scripts/update-gmat-categories.ts --export-json
 *
 * Options:
 *   --dry-run     Show what would be updated without actually updating
 *   --update      Actually update the database
 *   --export-json Export the mapping to a JSON file
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
  path.resolve(__dirname, '../../apps/web/.env.local'),
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

const supabaseUrl = process.env.VITE_SUPABASE_URL
  || process.env.EXPO_PUBLIC_SUPABASE_URL
  || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.VITE_SUPABASE_ANON_KEY
  || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Question file mapping - matches import script
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
    exportName: 'quantitativeReasoningQuestionsOGMedium'
  },
  'quantitative_reasoning_OG_hard': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_OG_hard',
    exportName: 'quantitativeReasoningQuestionsOGHard'
  },
  'quantitative_reasoning_PQ': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PQ',
    exportName: 'quantitativeReasoningQuestionsPQ'
  },
  'quantitative_reasoning_PQ_easy': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PQ_easy',
    exportName: 'quantitativeReasoningQuestionsPQEasy'
  },
  'quantitative_reasoning_PQ_medium': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PQ_medium',
    exportName: 'quantitativeReasoningQuestionsPQMedium'
  },
  'quantitative_reasoning_PQ_hard': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PQ_hard',
    exportName: 'quantitativeReasoningQuestionsPQHard'
  },
  'quantitative_reasoning_PT1': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_PT1',
    exportName: 'quantitativeReasoningQuestionsPT1'
  },
  'quantitative_reasoning_SK': {
    section: 'QR',
    path: '../sources/questions/QR/quantitative_reasoning_SK',
    exportName: 'quantitativeReasoningQuestionsSK'
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
    exportName: 'verbalReasoningQuestionsOGCREasy'
  },
  'verbal_reasoning_OG_CR_medium': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_CR_medium',
    exportName: 'verbalReasoningQuestionsOGCRMedium'
  },
  'verbal_reasoning_OG_CR_hard': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_CR_hard',
    exportName: 'verbalReasoningQuestionsOGCRHard'
  },
  'verbal_reasoning_OG_RC_easy': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_RC_easy',
    exportName: 'verbalReasoningQuestionsOGRCEasy'
  },
  'verbal_reasoning_OG_RC_medium': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_RC_medium',
    exportName: 'verbalReasoningQuestionsOGRCMedium'
  },
  'verbal_reasoning_OG_RC_hard': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_OG_RC_hard',
    exportName: 'verbalReasoningQuestionsOGRCHard'
  },
  'verbal_reasoning_PT1': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_PT1',
    exportName: 'verbalReasoningQuestionsPT1'
  },
  'verbal_reasoning_SK': {
    section: 'VR',
    path: '../sources/questions/VR/verbal_reasoning_SK',
    exportName: 'verbalReasoningQuestionsSK'
  },
  // DI files
  'data_insights_OG_DS': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_OG_DS',
    exportName: 'dataInsightsQuestionsOGDS'
  },
  'data_insights_OG_TPA': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_OG_TPA',
    exportName: 'dataInsightsQuestionsOGTPA'
  },
  'data_insights_PQ_DS': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_PQ_DS',
    exportName: 'dataInsightsQuestionsPQDS'
  },
  'data_insights_PQ_TPA': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_PQ_TPA',
    exportName: 'dataInsightsQuestionsPQTPA'
  },
  'data_insights_SK': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_SK',
    exportName: 'dataInsightsQuestionsSK'
  },
  'data_insights_PT1': {
    section: 'DI',
    path: '../sources/questions/DI/data_insights_PT1',
    exportName: 'dataInsightsQuestionsPT1'
  },
};

// Type for the category mapping
interface QuestionCategoryMapping {
  id: string; // gmat_question_id like "QR-GMAT-OG__-00001"
  categories: string[];
  section: string;
  questionSubtype?: string; // For VR: 'critical-reasoning' or 'reading-comprehension'
}

// Load questions from a file and extract categories
async function loadQuestionsFromFile(fileKey: string): Promise<QuestionCategoryMapping[]> {
  const fileInfo = QUESTION_FILES[fileKey];
  if (!fileInfo) {
    console.warn(`Unknown file: ${fileKey}`);
    return [];
  }

  try {
    const module = await import(fileInfo.path);

    // Try multiple possible export names
    let questions = module[fileInfo.exportName];

    if (!questions) {
      // Try common patterns
      const possibleExports = Object.keys(module).filter(k => !k.startsWith('_'));
      if (possibleExports.length > 0) {
        questions = module[possibleExports[0]];
        console.log(`  Using export: ${possibleExports[0]}`);
      }
    }

    if (!Array.isArray(questions)) {
      console.warn(`  Warning: ${fileKey} does not export an array`);
      return [];
    }

    const mappings: QuestionCategoryMapping[] = [];

    for (const q of questions) {
      if (q.id) {
        mappings.push({
          id: q.id,
          categories: q.categories || [],
          section: q.section,
          questionSubtype: q.questionSubtype,
        });
      }
    }

    return mappings;
  } catch (error) {
    console.error(`  Error loading ${fileKey}:`, error);
    return [];
  }
}

// Collect all category mappings from source files
async function collectAllMappings(): Promise<QuestionCategoryMapping[]> {
  const allMappings: QuestionCategoryMapping[] = [];

  for (const fileKey of Object.keys(QUESTION_FILES)) {
    console.log(`Loading: ${fileKey}...`);
    const mappings = await loadQuestionsFromFile(fileKey);
    console.log(`  Found ${mappings.length} questions`);
    allMappings.push(...mappings);
  }

  return allMappings;
}

// Get unique categories by section
function getUniqueCategoriesBySection(mappings: QuestionCategoryMapping[]) {
  const bySection: Record<string, Set<string>> = {};

  for (const m of mappings) {
    if (!bySection[m.section]) {
      bySection[m.section] = new Set();
    }
    for (const cat of m.categories) {
      bySection[m.section].add(cat);
    }
  }

  console.log('\n📊 Categories by Section:');
  for (const [section, categories] of Object.entries(bySection)) {
    console.log(`\n  ${section}:`);
    const sorted = Array.from(categories).sort();
    for (const cat of sorted) {
      const count = mappings.filter(m => m.section === section && m.categories.includes(cat)).length;
      console.log(`    - ${cat} (${count} questions)`);
    }
  }
}

// Export mapping to JSON file
function exportMappingToJson(mappings: QuestionCategoryMapping[]) {
  const outputPath = path.join(__dirname, '../sources/questions/category-mapping.json');

  const jsonMapping: Record<string, { categories: string[]; section: string; subtype?: string }> = {};

  for (const m of mappings) {
    jsonMapping[m.id] = {
      categories: m.categories,
      section: m.section,
      ...(m.questionSubtype && { subtype: m.questionSubtype }),
    };
  }

  fs.writeFileSync(outputPath, JSON.stringify(jsonMapping, null, 2));
  console.log(`\n📁 Exported ${mappings.length} mappings to ${outputPath}`);
}

// Update questions in database
async function updateQuestionsInDatabase(mappings: QuestionCategoryMapping[], dryRun: boolean) {
  console.log(`\n🔄 ${dryRun ? '[DRY RUN] ' : ''}Updating questions in database...`);

  // First, fetch all GMAT questions from database (paginated to get all)
  console.log('  Fetching GMAT questions from database...');

  let allQuestions: any[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: batch, error: fetchError } = await supabase
      .from('2V_questions')
      .select('id, question_data')
      .eq('test_type', 'GMAT')
      .range(offset, offset + pageSize - 1);

    if (fetchError) {
      console.error('  Error fetching questions:', fetchError.message);
      return;
    }

    if (!batch || batch.length === 0) break;

    allQuestions = allQuestions.concat(batch);
    offset += pageSize;

    if (batch.length < pageSize) break; // Last page
  }

  console.log(`  Found ${allQuestions.length} GMAT questions in database`);

  // Create a map of gmat_question_id -> database question
  const gmatIdToDbQuestion = new Map<string, { id: string; question_data: any }>();

  for (const q of allQuestions || []) {
    const questionData = typeof q.question_data === 'string'
      ? JSON.parse(q.question_data)
      : q.question_data;

    const gmatQuestionId = questionData?.gmat_question_id;
    if (gmatQuestionId) {
      gmatIdToDbQuestion.set(gmatQuestionId, { id: q.id, question_data: questionData });
    }
  }

  console.log(`  Found ${gmatIdToDbQuestion.size} questions with gmat_question_id`);

  // Create mapping lookup
  const mappingLookup = new Map<string, QuestionCategoryMapping>();
  for (const m of mappings) {
    mappingLookup.set(m.id, m);
  }

  let updated = 0;
  let alreadyHasCategories = 0;
  let notInDb = 0;
  let noCategories = 0;
  let errors = 0;

  // Process each mapping
  for (const mapping of mappings) {
    const dbQuestion = gmatIdToDbQuestion.get(mapping.id);

    if (!dbQuestion) {
      notInDb++;
      continue;
    }

    if (!mapping.categories || mapping.categories.length === 0) {
      noCategories++;
      continue;
    }

    // Check if already has categories
    if (dbQuestion.question_data.categories && dbQuestion.question_data.categories.length > 0) {
      alreadyHasCategories++;
      continue;
    }

    // Prepare updated question_data
    const updatedQuestionData = {
      ...dbQuestion.question_data,
      categories: mapping.categories,
      ...(mapping.questionSubtype && { questionSubtype: mapping.questionSubtype }),
    };

    if (dryRun) {
      if (updated < 5) {
        console.log(`  Would update ${mapping.id}: categories = [${mapping.categories.join(', ')}]`);
      }
    } else {
      const { error: updateError } = await supabase
        .from('2V_questions')
        .update({ question_data: updatedQuestionData })
        .eq('id', dbQuestion.id);

      if (updateError) {
        console.error(`  Error updating ${mapping.id}: ${updateError.message}`);
        errors++;
      }
    }

    updated++;
  }

  console.log('\n📊 Results:');
  console.log(`  ✅ ${dryRun ? 'Would update' : 'Updated'}: ${updated}`);
  console.log(`  ⏭️ Already have categories: ${alreadyHasCategories}`);
  console.log(`  ⚠️ Not in database: ${notInDb}`);
  console.log(`  📭 No categories defined: ${noCategories}`);
  if (errors > 0) {
    console.log(`  ❌ Errors: ${errors}`);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const doUpdate = args.includes('--update');
  const exportJson = args.includes('--export-json');

  console.log('🏷️  GMAT Question Category Updater');
  console.log('==================================\n');

  if (!dryRun && !doUpdate && !exportJson) {
    console.log('Usage:');
    console.log('  npx tsx GMAT/scripts/update-gmat-categories.ts --dry-run     Show what would be updated');
    console.log('  npx tsx GMAT/scripts/update-gmat-categories.ts --update      Actually update database');
    console.log('  npx tsx GMAT/scripts/update-gmat-categories.ts --export-json Export mapping to JSON');
    console.log('');
    console.log('You can combine options, e.g.: --dry-run --export-json');
    process.exit(0);
  }

  // Collect all category mappings from source files
  console.log('📥 Collecting category mappings from source files...\n');
  const mappings = await collectAllMappings();
  console.log(`\n📊 Total: ${mappings.length} questions with mappings`);

  // Count questions with categories
  const withCategories = mappings.filter(m => m.categories && m.categories.length > 0);
  console.log(`   With categories: ${withCategories.length}`);
  console.log(`   Without categories: ${mappings.length - withCategories.length}`);

  // Show unique categories
  getUniqueCategoriesBySection(mappings);

  // Export to JSON if requested
  if (exportJson) {
    exportMappingToJson(mappings);
  }

  // Update database
  if (dryRun || doUpdate) {
    await updateQuestionsInDatabase(mappings, dryRun);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
