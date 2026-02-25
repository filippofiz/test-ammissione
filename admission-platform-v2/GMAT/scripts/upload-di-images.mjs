/**
 * Script to upload GI question images to Supabase Storage
 * and update the question_data.image_url field in the database.
 *
 * Run from the repo root:
 *   node admission-platform-v2/GMAT/scripts/upload-di-images.mjs
 */

// Use createRequire to load the CJS build of supabase-js from the web app's node_modules
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const { createClient } = require('../../apps/web/node_modules/@supabase/supabase-js/dist/main/index.js');

const SUPABASE_URL = 'https://elrwpaezjnemmiegkyin.supabase.co';
const SERVICE_ROLE_KEY =
  '***REMOVED***';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Map: gmat_question_id -> local image filename
const IMAGES = [
  { gmatId: 'DI-GMAT-PT1_-00013', file: 'DI-GMAT-PT1_-00013.png' },
  { gmatId: 'DI-GMAT-PT1_-00014', file: 'DI-GMAT-PT1_-00014.png' },
  { gmatId: 'DI-GMAT-PT1_-00015', file: 'DI-GMAT-PT1_-00015.png' },
  // PQO GI questions
  { gmatId: 'DI-GMAT-PQO_-00008', file: 'DI-GMAT-PQO_-00008.png' },
  // OQBK GI questions (GMAT Online Question Bank)
  { gmatId: 'DI-GMAT-OQBK-00001', file: 'DI-GMAT-OQBK-00001.png' },
  { gmatId: 'DI-GMAT-OQBK-00002', file: 'DI-GMAT-OQBK-00002.png' },
  { gmatId: 'DI-GMAT-OQBK-00003', file: 'DI-GMAT-OQBK-00003.png' },
  { gmatId: 'DI-GMAT-OQBK-00004', file: 'DI-GMAT-OQBK-00004.png' },
  { gmatId: 'DI-GMAT-OQBK-00005', file: 'DI-GMAT-OQBK-00005.png' },
  { gmatId: 'DI-GMAT-OQBK-00006', file: 'DI-GMAT-OQBK-00006.png' },
  { gmatId: 'DI-GMAT-OQBK-00007', file: 'DI-GMAT-OQBK-00007.png' },
  { gmatId: 'DI-GMAT-OQBK-00008', file: 'DI-GMAT-OQBK-00008.png' },
];

const IMAGES_DIR = join(__dirname, '../sources/questions/DI/images');
const STORAGE_BUCKET = 'question-images';
const TEN_YEARS_SECONDS = 10 * 365 * 24 * 60 * 60;

async function run() {
  console.log('Starting GI image upload...\n');

  // Fetch all GMAT questions with pagination (table may have >1000 rows)
  const allRows = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  while (true) {
    const { data, error: fetchError } = await supabase
      .from('2V_questions')
      .select('id, question_data')
      .eq('test_type', 'GMAT')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (fetchError) {
      console.error('✗ Could not fetch questions:', fetchError.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }
  console.log(`Fetched ${allRows.length} GMAT question rows\n`);

  for (const { gmatId, file } of IMAGES) {
    const localPath = join(IMAGES_DIR, file);
    const storagePath = `GMAT/DI/${file}`;

    console.log(`── ${gmatId}`);

    // 1. Read the local image file
    let imageData;
    try {
      imageData = readFileSync(localPath);
    } catch (err) {
      console.error(`  ✗ Could not read ${localPath}:`, err.message);
      continue;
    }
    console.log(`  · Read ${imageData.length} bytes from disk`);

    // 2. Upload to Supabase Storage (upsert so re-running is safe)
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, imageData, { contentType: 'image/png', upsert: true });

    if (uploadError) {
      console.error(`  ✗ Storage upload failed:`, uploadError.message);
      continue;
    }
    console.log(`  ✓ Uploaded → ${storagePath}`);

    // 3. Create a long-lived signed URL (10 years)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, TEN_YEARS_SECONDS);

    if (signedError || !signedData?.signedUrl) {
      console.error(`  ✗ Signed URL creation failed:`, signedError?.message);
      continue;
    }
    const imageUrl = signedData.signedUrl;
    console.log(`  ✓ Signed URL created`);

    // 4. Find the matching question row
    const row = allRows.find((r) => {
      const qd = typeof r.question_data === 'string'
        ? JSON.parse(r.question_data)
        : r.question_data;
      return qd?.gmat_question_id === gmatId;
    });

    if (!row) {
      console.error(`  ✗ No DB row found for gmat_question_id = ${gmatId}`);
      continue;
    }

    // 5. Merge image_url into existing question_data
    const currentData = typeof row.question_data === 'string'
      ? JSON.parse(row.question_data)
      : row.question_data;

    const updatedData = { ...currentData, image_url: imageUrl };

    const { error: updateError } = await supabase
      .from('2V_questions')
      .update({ question_data: updatedData })
      .eq('id', row.id);

    if (updateError) {
      console.error(`  ✗ DB update failed:`, updateError.message);
      continue;
    }

    console.log(`  ✓ DB updated (row id: ${row.id})\n`);
  }

  console.log('All done.');
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
