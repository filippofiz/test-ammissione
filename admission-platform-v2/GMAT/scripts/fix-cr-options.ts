/**
 * fix-cr-options.ts
 *
 * Patches verbal_reasoning_OG_CR_medium.ts and verbal_reasoning_OG_CR_hard.ts
 * by filling in the empty options fields from the extracted JSON source files.
 *
 * Also corrects incorrect `answers` (correct_answer) fields using answer_keys.json.
 *
 * Run with:
 *   npx tsx GMAT/scripts/fix-cr-options.ts
 *
 * Options:
 *   --dry-run   Print what would be changed without writing files
 */

import * as fs from "fs";
import * as path from "path";

const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const EXTRACTED_DIR = path.resolve(
  __dirname,
  "../sources/official/GMAT Official Guide 2025-2026 (Complete)/VR (Complete)/Critical Reasoning (Complete)/extracted"
);

const TARGET_FILES = [
  path.resolve(
    __dirname,
    "../sources/questions/VR/verbal_reasoning_OG_CR_medium.ts"
  ),
  path.resolve(
    __dirname,
    "../sources/questions/VR/verbal_reasoning_OG_CR_hard.ts"
  ),
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OptionMap {
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
}

interface QuestionRecord {
  question_number: number;
  stimulus_text?: string;
  question_text?: string;
  options: OptionMap;
}

// ---------------------------------------------------------------------------
// Step 1: Load and normalise all extracted JSON files into a lookup map
// ---------------------------------------------------------------------------

function normaliseOptions(raw: any): OptionMap {
  const LETTERS = ["a", "b", "c", "d", "e"] as const;
  const result: OptionMap = { a: "", b: "", c: "", d: "", e: "" };

  if (Array.isArray(raw)) {
    raw.forEach((item: any, i: number) => {
      const letter = LETTERS[i];
      if (!letter) return;

      if (typeof item === "string") {
        // Format A: plain array ["text a", "text b", ...]
        // Format B: array with letter prefix ["A. text a", "B. text b", ...]
        result[letter] = item.replace(/^[A-Ea-e][\.\)]\s*/, "").trim();
      } else if (item && typeof item === "object" && "text" in item) {
        // Format D: array of {label, text} objects
        result[letter] = String(item.text).trim();
      }
    });
  } else if (raw && typeof raw === "object") {
    // Format C: key-value object {"A": "text", ...} or {"a": "...", ...}
    for (const [key, value] of Object.entries(raw)) {
      const lower = key.toLowerCase() as keyof OptionMap;
      if (lower in result && typeof value === "string") {
        result[lower] = value.trim();
      }
    }
  }

  return result;
}

function loadExtractedData(): Map<number, QuestionRecord> {
  const map = new Map<number, QuestionRecord>();

  const files = fs
    .readdirSync(EXTRACTED_DIR)
    .filter((f) => f.startsWith("questions_") && f.endsWith(".json"))
    .sort(); // sort so overlapping ranges: more specific files come later and can overwrite

  for (const file of files) {
    const fullPath = path.join(EXTRACTED_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8").trim();
    if (!raw || raw === "[]" || raw === "{}") continue;

    let entries: any;
    try {
      entries = JSON.parse(raw);
    } catch (e) {
      console.warn(`⚠️  Could not parse ${file}: ${e}`);
      continue;
    }

    // Handle both formats:
    //   - plain array of questions
    //   - object with {difficulty, questions: [...]}
    let questions: any[];
    if (Array.isArray(entries)) {
      questions = entries;
    } else if (
      entries &&
      typeof entries === "object" &&
      "questions" in (entries as any) &&
      Array.isArray((entries as any).questions)
    ) {
      questions = (entries as any).questions;
    } else {
      console.warn(`⚠️  ${file}: unrecognised format, skipping`);
      continue;
    }

    for (const entry of questions) {
      const qNum = entry.question_number as number;
      if (!qNum) continue;

      const rawOptions = entry.options;
      if (!rawOptions) continue;

      const options = normaliseOptions(rawOptions);

      // Only store if at least one option is non-empty
      const hasContent = Object.values(options).some((v) => v.trim() !== "");
      if (!hasContent) continue;

      map.set(qNum, {
        question_number: qNum,
        stimulus_text: entry.stimulus_text ?? undefined,
        question_text: entry.question_text ?? undefined,
        options,
      });
    }
  }

  console.log(`✅  Loaded ${map.size} questions from extracted JSON files`);
  return map;
}

// ---------------------------------------------------------------------------
// Step 2: Load answer keys
// ---------------------------------------------------------------------------

function loadAnswerKeys(): Map<number, string> {
  const keyFile = path.join(EXTRACTED_DIR, "answer_keys.json");
  if (!fs.existsSync(keyFile)) {
    console.warn("⚠️  answer_keys.json not found");
    return new Map();
  }
  const raw = JSON.parse(fs.readFileSync(keyFile, "utf-8")) as Record<
    string,
    { answer: string }
  >;
  const map = new Map<number, string>();
  for (const [k, v] of Object.entries(raw)) {
    map.set(Number(k), v.answer.toLowerCase());
  }
  console.log(`✅  Loaded ${map.size} answer keys`);
  return map;
}

// ---------------------------------------------------------------------------
// Step 3: Patch a single .ts file
// ---------------------------------------------------------------------------

function escapeForTemplate(text: string): string {
  // Escape backticks and ${} that could break template literals — not used here
  // We'll use JSON.stringify-style quoting for strings in JS source
  // Options are written as regular string properties
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

function buildOptionsBlock(options: OptionMap, indent: string): string {
  // Produce the options: { a: "...", b: "...", ... } block
  return (
    `options: {\n` +
    `${indent}  a: "${escapeForTemplate(options.a)}",\n` +
    `${indent}  b: "${escapeForTemplate(options.b)}",\n` +
    `${indent}  c: "${escapeForTemplate(options.c)}",\n` +
    `${indent}  d: "${escapeForTemplate(options.d)}",\n` +
    `${indent}  e: "${escapeForTemplate(options.e)}"\n` +
    `${indent}}`
  );
}

function patchFile(
  filePath: string,
  extractedData: Map<number, QuestionRecord>,
  answerKeys: Map<number, string>
): void {
  console.log(`\n📄  Processing: ${path.basename(filePath)}`);

  let source = fs.readFileSync(filePath, "utf-8");
  let fixedOptions = 0;
  let fixedAnswers = 0;
  let notFound: number[] = [];

  // Find all question blocks with empty options using a regex that matches:
  //   id: "VR-GMAT-OG__-NNNNN",          <- capture question number
  //   ... (several lines of metadata) ...
  //   options: {
  //     a: "",
  //     b: "",
  //     c: "",
  //     d: "",
  //     e: ""
  //   },
  //
  // We do this by scanning for blocks where ALL options are empty strings.

  // Regex to find an empty options block.
  // We match only the "options: { a: "", ... }" block itself (no leading whitespace
  // captured), so we can reconstruct it with proper indentation using the line prefix.
  //
  // Pattern captures:
  //   group 1: the per-line indent (spaces before "a:", "b:", etc.)
  //   group 2: the full "options: {...}" block
  const EMPTY_OPTIONS_RE =
    /^([ \t]*)(options:\s*\{\s*\n\1\s*a:\s*"",\s*\n\1\s*b:\s*"",\s*\n\1\s*c:\s*"",\s*\n\1\s*d:\s*"",\s*\n\1\s*e:\s*""\s*\n\1\})/m;

  // To find the question number associated with each match, we look backwards
  // in the source from the match position for the nearest id: "VR-GMAT-OG__-NNNNN"
  const ID_RE = /id:\s*"VR-GMAT-OG__-(\d{5})"/g;

  // Build an array of {questionNumber, position} pairs for all ids in the file
  const idPositions: Array<{ qNum: number; pos: number }> = [];
  let idMatch: RegExpExecArray | null;
  while ((idMatch = ID_RE.exec(source)) !== null) {
    idPositions.push({ qNum: parseInt(idMatch[1], 10), pos: idMatch.index });
  }

  // Find all empty options blocks iteratively (non-global multiline regex)
  const matches: Array<{ index: number; length: number; indent: string; qNum: number }> = [];

  let searchFrom = 0;
  while (true) {
    const slice = source.slice(searchFrom);
    const m = EMPTY_OPTIONS_RE.exec(slice);
    if (!m) break;

    const matchStart = searchFrom + m.index;
    const indent = m[1]; // the per-line leading whitespace (spaces)

    // Find the question number by looking for the nearest id position before this match
    let qNum = -1;
    for (let i = idPositions.length - 1; i >= 0; i--) {
      if (idPositions[i].pos < matchStart) {
        qNum = idPositions[i].qNum;
        break;
      }
    }

    matches.push({
      index: matchStart,
      length: m[0].length,
      indent,
      qNum,
    });

    // Advance past this match
    searchFrom = matchStart + m[0].length;
  }

  // Process from last to first so indices stay valid
  for (let i = matches.length - 1; i >= 0; i--) {
    const { index, length, indent, qNum } = matches[i];

    if (qNum === -1) {
      console.warn(`  ⚠️  Could not determine question number for match at offset ${index}`);
      continue;
    }

    const record = extractedData.get(qNum);
    if (!record) {
      console.warn(`  ❌  Q${qNum}: no extracted data found`);
      notFound.push(qNum);
      continue;
    }

    // Build the replacement
    const newOptionsBlock = `${indent}${buildOptionsBlock(record.options, indent)}`;
    const originalBlock = source.slice(index, index + length);

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Q${qNum}: would replace:\n    ${originalBlock.trim()}\n  with:\n    ${newOptionsBlock.trim()}`);
    } else {
      source =
        source.slice(0, index) +
        newOptionsBlock +
        source.slice(index + length);
      fixedOptions++;
      console.log(`  ✅  Q${qNum}: options patched`);
    }
  }

  // ---------------------------------------------------------------------------
  // Fix incorrect answers using answer_keys.json
  // ---------------------------------------------------------------------------
  // Strategy: find each generateMCAnswers("x") and look backwards to find the
  // nearest question id to determine which question it belongs to.
  const GEN_ANSWER_RE = /generateMCAnswers\("([a-e])"\)/g;

  const answerMatches: Array<{
    index: number;
    length: number;
    qNum: number;
    currentAnswer: string;
  }> = [];

  let answerMatch: RegExpExecArray | null;
  while ((answerMatch = GEN_ANSWER_RE.exec(source)) !== null) {
    const matchPos = answerMatch.index;
    const currentAnswer = answerMatch[1];

    // Find nearest id before this position
    let qNum = -1;
    for (let i = idPositions.length - 1; i >= 0; i--) {
      if (idPositions[i].pos < matchPos) {
        qNum = idPositions[i].qNum;
        break;
      }
    }
    if (qNum === -1) continue;

    answerMatches.push({
      index: matchPos,
      length: answerMatch[0].length,
      qNum,
      currentAnswer,
    });
  }

  for (let i = answerMatches.length - 1; i >= 0; i--) {
    const { index, length, qNum, currentAnswer } = answerMatches[i];
    const correctAnswer = answerKeys.get(qNum);

    if (!correctAnswer) continue;
    if (correctAnswer === currentAnswer) continue;

    const newText = `generateMCAnswers("${correctAnswer}")`;
    if (DRY_RUN) {
      console.log(
        `  [DRY RUN] Q${qNum}: would fix answer "${currentAnswer}" → "${correctAnswer}"`
      );
    } else {
      source = source.slice(0, index) + newText + source.slice(index + length);
      fixedAnswers++;
      console.log(`  ✅  Q${qNum}: answer fixed "${currentAnswer}" → "${correctAnswer}"`);
    }
  }

  // ---------------------------------------------------------------------------
  // Write result
  // ---------------------------------------------------------------------------
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, source, "utf-8");
    console.log(
      `\n  📝  Written. Fixed ${fixedOptions} option blocks, ${fixedAnswers} answer keys.`
    );
    if (notFound.length > 0) {
      console.log(
        `  ⚠️  No data found for questions: ${notFound.join(", ")}`
      );
      console.log(
        "      These questions still have empty options — fix manually."
      );
    }
  } else {
    console.log(
      `\n  [DRY RUN] Would fix ${matches.length} option blocks, check ${answerMatches.length} answers.`
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=".repeat(60));
  console.log("  fix-cr-options.ts — GMAT CR Question Patcher");
  console.log("=".repeat(60));
  if (DRY_RUN) console.log("  MODE: DRY RUN (no files will be written)\n");

  const extractedData = loadExtractedData();
  const answerKeys = loadAnswerKeys();

  for (const filePath of TARGET_FILES) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌  File not found: ${filePath}`);
      continue;
    }
    patchFile(filePath, extractedData, answerKeys);
  }

  console.log("\n" + "=".repeat(60));
  console.log("  Done.");
  console.log("=".repeat(60));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
