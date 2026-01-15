/**
 * GMAT Material Compilation Script
 *
 * This script compiles all Typst (.typ) files to PDF in the education directory.
 *
 * Usage:
 *   npx tsx GMAT/scripts/compile-materials.ts [options]
 *
 * Options:
 *   --section <QR|VR|DI|assessments|context|slides>  Compile specific section
 *   --topic <topic-folder>                           Compile specific topic
 *   --all                                            Compile all materials
 *   --dry-run                                        Show what would be compiled
 *   --force                                          Recompile even if PDF exists
 *
 * Prerequisites:
 *   - Typst must be installed: https://typst.app/docs/installation/
 *   - On Windows: winget install --id Typst.Typst
 *   - On Mac: brew install typst
 *
 * Examples:
 *   npx tsx GMAT/scripts/compile-materials.ts --dry-run --all
 *   npx tsx GMAT/scripts/compile-materials.ts --section QR
 *   npx tsx GMAT/scripts/compile-materials.ts --topic 01-data-sufficiency --force
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Base path for education materials
const MATERIAL_BASE_PATH = path.resolve(__dirname, '../material/education');

interface TypstFile {
  sourcePath: string;
  outputPath: string;
  section: string;
  topic: string;
  filename: string;
}

// Check if Typst is installed
function checkTypstInstalled(): boolean {
  try {
    execSync('typst --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Scan for .typ files in a directory
function scanForTypstFiles(dirPath: string, section: string, topic: string = ''): TypstFile[] {
  const files: TypstFile[] = [];

  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Skip templates directory
      if (entry.name === 'templates') continue;

      // Recurse into subdirectories
      const subTopic = topic || entry.name;
      files.push(...scanForTypstFiles(fullPath, section, subTopic));
    } else if (entry.isFile() && entry.name.endsWith('.typ')) {
      const outputPath = fullPath.replace('.typ', '.pdf');

      files.push({
        sourcePath: fullPath,
        outputPath,
        section,
        topic: topic || 'root',
        filename: entry.name,
      });
    }
  }

  return files;
}

// Collect all Typst files based on options
function collectTypstFiles(options: {
  section?: string;
  topic?: string;
  all?: boolean;
}): TypstFile[] {
  const allFiles: TypstFile[] = [];

  const sectionsToScan = options.all
    ? ['QR', 'DI', 'VR']
    : options.section && ['QR', 'DI', 'VR'].includes(options.section)
      ? [options.section]
      : [];

  // Scan lesson directories
  for (const section of sectionsToScan) {
    const lessonsPath = path.join(MATERIAL_BASE_PATH, 'lessons', section);

    if (options.topic) {
      const topicPath = path.join(lessonsPath, options.topic);
      allFiles.push(...scanForTypstFiles(topicPath, section, options.topic));
    } else {
      allFiles.push(...scanForTypstFiles(lessonsPath, section));
    }
  }

  // Scan context directory
  if (options.all || options.section === 'context') {
    const contextPath = path.join(MATERIAL_BASE_PATH, 'context');
    allFiles.push(...scanForTypstFiles(contextPath, 'context'));
  }

  // Scan assessments directory
  if (options.all || options.section === 'assessments') {
    const assessmentsPath = path.join(MATERIAL_BASE_PATH, 'assessments');
    allFiles.push(...scanForTypstFiles(assessmentsPath, 'assessments'));
  }

  // Scan slides directory
  if (options.all || options.section === 'slides') {
    const slidesPath = path.join(MATERIAL_BASE_PATH, 'slides');
    allFiles.push(...scanForTypstFiles(slidesPath, 'slides'));
  }

  // Scan root lessons for standalone files (like reference sheet)
  if (options.all) {
    const rootLessonsPath = path.join(MATERIAL_BASE_PATH, 'lessons');
    const rootFiles = fs.readdirSync(rootLessonsPath, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.typ'));

    for (const file of rootFiles) {
      const fullPath = path.join(rootLessonsPath, file.name);
      allFiles.push({
        sourcePath: fullPath,
        outputPath: fullPath.replace('.typ', '.pdf'),
        section: 'reference',
        topic: 'root',
        filename: file.name,
      });
    }
  }

  // Scan program directory
  if (options.all) {
    const programPath = path.join(MATERIAL_BASE_PATH, 'program');
    allFiles.push(...scanForTypstFiles(programPath, 'program'));
  }

  return allFiles;
}

// Compile a single Typst file
function compileFile(file: TypstFile): { success: boolean; error?: string } {
  try {
    // Use the parent material directory as root for imports (templates are in ../templates)
    const rootDir = path.resolve(MATERIAL_BASE_PATH, '..');

    execSync(`typst compile --root "${rootDir}" "${file.sourcePath}" "${file.outputPath}"`, {
      stdio: 'pipe',
      cwd: path.dirname(file.sourcePath),
    });

    return { success: true };
  } catch (err: any) {
    const errorMessage = err.stderr?.toString() || err.message || String(err);
    return { success: false, error: errorMessage };
  }
}

// Check if PDF needs recompilation
function needsCompilation(file: TypstFile, force: boolean): boolean {
  if (force) return true;

  if (!fs.existsSync(file.outputPath)) return true;

  const sourceStat = fs.statSync(file.sourcePath);
  const outputStat = fs.statSync(file.outputPath);

  return sourceStat.mtime > outputStat.mtime;
}

// Section display names
const SECTION_DISPLAY_NAMES: Record<string, string> = {
  'QR': 'Quantitative Reasoning',
  'DI': 'Data Insights',
  'VR': 'Verbal Reasoning',
  'assessments': 'Assessments',
  'context': 'Context',
  'slides': 'Slides',
  'program': 'Program',
  'reference': 'Reference',
};

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
    console.log('Usage: npx tsx GMAT/scripts/compile-materials.ts [options]');
    console.log('');
    console.log('Options:');
    console.log('  --section <QR|VR|DI|assessments|context|slides>  Compile section');
    console.log('  --topic <topic-folder>                           Compile specific topic');
    console.log('  --all                                            Compile all materials');
    console.log('  --dry-run                                        Preview without compiling');
    console.log('  --force                                          Recompile all files');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx GMAT/scripts/compile-materials.ts --dry-run --all');
    console.log('  npx tsx GMAT/scripts/compile-materials.ts --section QR');
    process.exit(1);
  }

  console.log('\n📝 GMAT Material Compilation Script');
  console.log('====================================\n');

  // Check if Typst is installed
  if (!options.dryRun && !checkTypstInstalled()) {
    console.log('❌ Typst is not installed or not in PATH.');
    console.log('');
    console.log('Install Typst:');
    console.log('  Windows: winget install --id Typst.Typst');
    console.log('  Mac:     brew install typst');
    console.log('  Linux:   See https://typst.app/docs/installation/');
    process.exit(1);
  }

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be compiled\n');
  }

  // Collect files
  const files = collectTypstFiles(options);

  if (files.length === 0) {
    console.log('⚠️  No .typ files found in the specified location.');
    process.exit(1);
  }

  // Filter files that need compilation
  const toCompile = files.filter(f => needsCompilation(f, options.force));
  const upToDate = files.length - toCompile.length;

  console.log(`Found ${files.length} Typst files (${toCompile.length} need compilation, ${upToDate} up-to-date):\n`);

  // Group by section for display
  const bySection: Record<string, TypstFile[]> = {};
  for (const f of toCompile) {
    if (!bySection[f.section]) bySection[f.section] = [];
    bySection[f.section].push(f);
  }

  for (const [section, sectionFiles] of Object.entries(bySection)) {
    console.log(`📁 ${SECTION_DISPLAY_NAMES[section] || section} (${sectionFiles.length} files)`);
    for (const f of sectionFiles) {
      const relativePath = path.relative(MATERIAL_BASE_PATH, f.sourcePath);
      console.log(`   - ${relativePath}`);
    }
    console.log('');
  }

  if (options.dryRun) {
    console.log('✅ Dry run complete. Use without --dry-run to compile.');
    return;
  }

  if (toCompile.length === 0) {
    console.log('✅ All files are up-to-date. Use --force to recompile.');
    return;
  }

  // Compile files
  console.log('\n🔨 Compiling files...\n');

  let success = 0;
  let failed = 0;
  const errors: { file: string; error: string }[] = [];

  for (const file of toCompile) {
    const relativePath = path.relative(MATERIAL_BASE_PATH, file.sourcePath);
    process.stdout.write(`  Compiling ${relativePath}... `);

    const result = compileFile(file);

    if (result.success) {
      success++;
      console.log('✅');
    } else {
      failed++;
      console.log('❌');
      errors.push({ file: relativePath, error: result.error || 'Unknown error' });
    }
  }

  // Summary
  console.log('\n====================================');
  console.log('📊 Compilation Summary');
  console.log('====================================');
  console.log(`  Compiled:    ${success}`);
  console.log(`  Failed:      ${failed}`);
  console.log(`  Up-to-date:  ${upToDate}`);
  console.log(`  Total:       ${files.length}`);
  console.log('');

  if (errors.length > 0) {
    console.log('❌ Errors:');
    for (const err of errors) {
      console.log(`\n  ${err.file}:`);
      console.log(`    ${err.error.split('\n').slice(0, 5).join('\n    ')}`);
    }
    console.log('');
  }
}

main().catch(console.error);
