/**
 * GMAT Material Upload Script
 *
 * This script uploads compiled PDF materials to Supabase storage and creates
 * corresponding records in the 2V_lesson_materials table.
 *
 * Usage:
 *   npx tsx GMAT/scripts/upload-gmat-materials.ts [options]
 *
 * Options:
 *   --section <QR|VR|DI|assessments|context|slides>  Upload materials from specific section
 *   --topic <topic-folder>                           Upload specific topic (e.g., 01-number-properties-arithmetic)
 *   --all                                            Upload all materials
 *   --dry-run                                        Show what would be uploaded without actually uploading
 *   --force                                          Overwrite existing files in storage
 *
 * Prerequisites:
 *   1. Compile Typst files to PDF first using: npm run compile:materials
 *   2. Set SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Examples:
 *   npx tsx GMAT/scripts/upload-gmat-materials.ts --dry-run --all
 *   npx tsx GMAT/scripts/upload-gmat-materials.ts --section QR --force
 *   npx tsx GMAT/scripts/upload-gmat-materials.ts --topic 01-number-properties-arithmetic
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const possibleEnvPaths = [
  path.resolve(__dirname, '../../.env'),  // admission-platform-v2/.env (prioritize this)
  path.resolve(process.cwd(), '.env'),
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Required: SUPABASE_URL (or VITE/EXPO variant) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Base paths
const MATERIAL_BASE_PATH = path.resolve(__dirname, '../material/education');
const BUCKET_NAME = 'gmat-materials';

// Material type mapping based on filename patterns
function getMaterialType(filename: string): string {
  if (filename.includes('lesson-material')) return 'lesson';
  if (filename.includes('training1') || filename.includes('training-1')) return 'training1';
  if (filename.includes('training2') || filename.includes('training-2')) return 'training2';
  if (filename.includes('assessment')) return 'assessment';
  if (filename.includes('practice')) return 'practice';
  if (filename.includes('exercises')) return 'exercises';
  if (filename.includes('overview')) return 'overview';
  if (filename.includes('fundamentals')) return 'fundamentals';
  if (filename.includes('core')) return 'core';
  if (filename.includes('excellence')) return 'excellence';
  if (filename.includes('mock') || filename.includes('simulation')) return 'mock';
  if (filename.includes('placement')) return 'placement';
  if (filename.includes('slide')) return 'slide';
  if (filename.includes('reference')) return 'reference';
  return 'other';
}

// Generate human-readable title from filename
function generateTitle(filename: string, topic: string, section: string): string {
  const baseName = filename.replace('.pdf', '').replace(/-/g, ' ');

  // Capitalize words
  const titleCase = baseName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return titleCase;
}

// Topic display name mapping
const TOPIC_DISPLAY_NAMES: Record<string, string> = {
  '01-number-properties-arithmetic': 'Number Properties & Arithmetic',
  '02-algebra': 'Algebra',
  '03-word-problems': 'Word Problems',
  '04-statistics-probability': 'Statistics & Probability',
  '05-percents-ratios-proportions': 'Percents, Ratios & Proportions',
  '01-data-sufficiency': 'Data Sufficiency',
  '02-graphics-interpretation': 'Graphics Interpretation',
  '03-table-analysis': 'Table Analysis',
  '04-two-part-analysis': 'Two-Part Analysis',
  '05-multi-source-reasoning': 'Multi-Source Reasoning',
  '01-critical-reasoning': 'Critical Reasoning',
  '02-reading-comprehension': 'Reading Comprehension',
  'initial-diagnostic': 'Initial Diagnostic',
  'mock-simulations': 'Mock Simulations',
  'section-assessments': 'Section Assessments',
};

// Section display names
const SECTION_DISPLAY_NAMES: Record<string, string> = {
  'QR': 'Quantitative Reasoning',
  'DI': 'Data Insights',
  'VR': 'Verbal Reasoning',
  'assessments': 'Assessments',
  'context': 'Context',
  'slides': 'Slides',
};

interface MaterialFile {
  localPath: string;
  storagePath: string;
  section: string;
  topic: string;
  materialType: string;
  title: string;
  filename: string;
  isTemplate: boolean;  // True if this is a question allocation template, not real student material
}

// Check if a file is a question template (for admin use only)
function isQuestionTemplate(filename: string): boolean {
  return filename.includes('question-template');
}

// Scan for PDF files in a directory
function scanForPDFs(dirPath: string, section: string, topic: string = ''): MaterialFile[] {
  const materials: MaterialFile[] = [];

  if (!fs.existsSync(dirPath)) {
    return materials;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectories
      const subTopic = topic || entry.name;
      materials.push(...scanForPDFs(fullPath, section, subTopic));
    } else if (entry.isFile() && entry.name.endsWith('.pdf')) {
      const materialType = getMaterialType(entry.name);
      const effectiveTopic = topic || 'general';

      // Storage path: GMAT/{section}/{topic}/{filename}
      const storagePath = topic
        ? `GMAT/${section}/${topic}/${entry.name}`
        : `GMAT/${section}/${entry.name}`;

      materials.push({
        localPath: fullPath,
        storagePath,
        section,
        topic: effectiveTopic,
        materialType,
        title: generateTitle(entry.name, effectiveTopic, section),
        filename: entry.name,
        isTemplate: isQuestionTemplate(entry.name),
      });
    }
  }

  return materials;
}

// Collect all materials based on options
function collectMaterials(options: {
  section?: string;
  topic?: string;
  all?: boolean;
}): MaterialFile[] {
  const allMaterials: MaterialFile[] = [];

  const sectionsToScan = options.all
    ? ['QR', 'DI', 'VR']
    : options.section
      ? [options.section]
      : [];

  // Scan lesson directories
  for (const section of sectionsToScan) {
    const lessonsPath = path.join(MATERIAL_BASE_PATH, 'lessons', section);

    if (options.topic) {
      // Scan specific topic
      const topicPath = path.join(lessonsPath, options.topic);
      allMaterials.push(...scanForPDFs(topicPath, section, options.topic));
    } else {
      // Scan all topics in section
      allMaterials.push(...scanForPDFs(lessonsPath, section));
    }
  }

  // Scan context directory
  if (options.all || options.section === 'context') {
    const contextPath = path.join(MATERIAL_BASE_PATH, 'context');
    allMaterials.push(...scanForPDFs(contextPath, 'context'));
  }

  // Scan assessments directory
  if (options.all || options.section === 'assessments') {
    const assessmentsPath = path.join(MATERIAL_BASE_PATH, 'assessments');
    allMaterials.push(...scanForPDFs(assessmentsPath, 'assessments'));
  }

  // Scan slides directory
  if (options.all || options.section === 'slides') {
    const slidesPath = path.join(MATERIAL_BASE_PATH, 'slides');
    allMaterials.push(...scanForPDFs(slidesPath, 'slides'));
  }

  // Scan root lessons directory for standalone files (e.g., reference sheet)
  if (options.all) {
    const rootLessonsPath = path.join(MATERIAL_BASE_PATH, 'lessons');
    const rootFiles = fs.readdirSync(rootLessonsPath, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.pdf'));

    for (const file of rootFiles) {
      allMaterials.push({
        localPath: path.join(rootLessonsPath, file.name),
        storagePath: `GMAT/reference/${file.name}`,
        section: 'reference',
        topic: 'reference',
        materialType: getMaterialType(file.name),
        title: generateTitle(file.name, 'reference', 'reference'),
        filename: file.name,
        isTemplate: isQuestionTemplate(file.name),
      });
    }
  }

  return allMaterials;
}

// Upload a single file to storage
async function uploadFile(material: MaterialFile, force: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const fileBuffer = fs.readFileSync(material.localPath);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(material.storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: force,
      });

    if (error) {
      // Check if it's a duplicate error when not forcing
      if (error.message.includes('already exists') && !force) {
        return { success: false, error: 'File already exists (use --force to overwrite)' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Create or update database record
async function upsertMaterialRecord(material: MaterialFile): Promise<{ success: boolean; error?: string }> {
  try {
    const sectionDisplay = SECTION_DISPLAY_NAMES[material.section] || material.section;
    const topicDisplay = TOPIC_DISPLAY_NAMES[material.topic] || material.topic;

    const { error } = await supabase
      .from('2V_lesson_materials')
      .upsert({
        test_type: 'GMAT',
        section: sectionDisplay,
        topic: topicDisplay,
        material_type: material.materialType,
        title: material.title,
        pdf_storage_path: material.storagePath,
        is_active: true,
        is_template: material.isTemplate,  // Mark question templates
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'test_type,section,topic,material_type,title',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  const options = {
    section: args.includes('--section') ? args[args.indexOf('--section') + 1] : undefined,
    topic: args.includes('--topic') ? args[args.indexOf('--topic') + 1] : undefined,
    all: args.includes('--all'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
  };

  if (!options.all && !options.section && !options.topic) {
    console.log('Usage: npx tsx GMAT/scripts/upload-gmat-materials.ts [options]');
    console.log('');
    console.log('Options:');
    console.log('  --section <QR|VR|DI|assessments|context|slides>  Upload from section');
    console.log('  --topic <topic-folder>                           Upload specific topic');
    console.log('  --all                                            Upload all materials');
    console.log('  --dry-run                                        Preview without uploading');
    console.log('  --force                                          Overwrite existing files');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx GMAT/scripts/upload-gmat-materials.ts --dry-run --all');
    console.log('  npx tsx GMAT/scripts/upload-gmat-materials.ts --section QR --force');
    process.exit(1);
  }

  console.log('\n📚 GMAT Material Upload Script');
  console.log('================================\n');

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be uploaded\n');
  }

  // Collect materials
  const materials = collectMaterials(options);

  if (materials.length === 0) {
    console.log('⚠️  No PDF files found. Make sure to compile Typst files first:');
    console.log('    npm run compile:materials');
    process.exit(1);
  }

  console.log(`Found ${materials.length} PDF files to process:\n`);

  // Group by section for display
  const bySection: Record<string, MaterialFile[]> = {};
  for (const m of materials) {
    if (!bySection[m.section]) bySection[m.section] = [];
    bySection[m.section].push(m);
  }

  for (const [section, files] of Object.entries(bySection)) {
    const templateCount = files.filter(f => f.isTemplate).length;
    const studentCount = files.length - templateCount;
    console.log(`📁 ${SECTION_DISPLAY_NAMES[section] || section} (${studentCount} student materials, ${templateCount} templates)`);
    for (const f of files) {
      const templateTag = f.isTemplate ? ' [TEMPLATE]' : '';
      console.log(`   - ${f.filename}${templateTag} → ${f.storagePath}`);
    }
    console.log('');
  }

  if (options.dryRun) {
    console.log('✅ Dry run complete. Use without --dry-run to upload.');
    return;
  }

  // Upload files
  console.log('\n📤 Uploading files...\n');

  let uploadSuccess = 0;
  let uploadSkipped = 0;
  let uploadFailed = 0;
  let dbSuccess = 0;
  let dbFailed = 0;

  for (const material of materials) {
    process.stdout.write(`  Uploading ${material.filename}... `);

    const uploadResult = await uploadFile(material, options.force);

    if (uploadResult.success) {
      uploadSuccess++;
      console.log('✅');

      // Create database record
      const dbResult = await upsertMaterialRecord(material);
      if (dbResult.success) {
        dbSuccess++;
      } else {
        dbFailed++;
        console.log(`    ⚠️  DB record failed: ${dbResult.error}`);
      }
    } else if (uploadResult.error?.includes('already exists')) {
      uploadSkipped++;
      console.log('⏭️  (exists)');

      // Still update database record
      const dbResult = await upsertMaterialRecord(material);
      if (dbResult.success) {
        dbSuccess++;
      } else {
        dbFailed++;
      }
    } else {
      uploadFailed++;
      console.log(`❌ ${uploadResult.error}`);
    }
  }

  // Summary
  console.log('\n================================');
  console.log('📊 Upload Summary');
  console.log('================================');
  console.log(`  Files uploaded:  ${uploadSuccess}`);
  console.log(`  Files skipped:   ${uploadSkipped}`);
  console.log(`  Files failed:    ${uploadFailed}`);
  console.log(`  DB records:      ${dbSuccess} created/updated`);
  if (dbFailed > 0) {
    console.log(`  DB failures:     ${dbFailed}`);
  }
  console.log('');
}

main().catch(console.error);
