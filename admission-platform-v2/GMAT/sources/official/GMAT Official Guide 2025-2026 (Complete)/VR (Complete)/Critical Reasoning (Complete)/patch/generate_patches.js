const fs = require('fs');
const path = require('path');

const BASE = path.dirname(__filename);
const MD_FILE = path.join(BASE, '2V_questions_corrections.md');
const JSON_FILE = path.join(BASE, '2V_questions_rows.json');
const SQL_FILE = path.join(BASE, '2V_questions_patches.sql');

// ── helpers ───────────────────────────────────────────────────────────────────

function esc(s) {
  return (s || '').replace(/'/g, "''");
}

// Lines that start an answer option block
const OPTION_RE = /^[A-E]\. /;

// Lines that are the question prompt (immediately before the A-E options)
// The prompt is the LAST non-option, non-blank line before the first option.
// We detect it by scanning forward until we find the options.

// Section headers
const SECTION_RE = /^(Argument Construction|Argument Evaluation|Evaluation of a Plan)$/;

// ── parse the MD file ─────────────────────────────────────────────────────────

function parseMD(mdText) {
  const questions = {};
  const lines = mdText.split('\n');
  const Q_HEADER = /^(\d+)\. \(\*\*(easy|medium|hard)\*\*\) (.+)$/;

  let i = 0;
  while (i < lines.length) {
    const headerMatch = lines[i].match(Q_HEADER);
    if (!headerMatch) { i++; continue; }

    const qNum = parseInt(headerMatch[1]);
    const difficulty = headerMatch[2];
    i++;

    // Collect all lines until the first A. option — these are passage + question_text.
    // The LAST non-blank line before A. is the question_text.
    // Everything before that (starting with the header content) is passage_text.
    const passageAndQuestion = [headerMatch[3].trim()];

    while (i < lines.length && !OPTION_RE.test(lines[i]) && !SECTION_RE.test(lines[i]) && !lines[i].startsWith('**Situation**') && !lines[i].startsWith('----') && !lines[i].match(/^\d+\. \(\*\*/)) {
      passageAndQuestion.push(lines[i]);
      i++;
    }

    // Remove trailing blank lines
    while (passageAndQuestion.length && !passageAndQuestion[passageAndQuestion.length - 1].trim()) {
      passageAndQuestion.pop();
    }

    // The last non-blank entry is the question_text; everything before it is passage_text
    const questionText = passageAndQuestion[passageAndQuestion.length - 1] || '';
    const passageLines = passageAndQuestion.slice(0, passageAndQuestion.length - 1);
    // Join passage lines, collapsing blank lines to a single newline
    const passageText = passageLines.join('\n').replace(/\n{2,}/g, '\n').trim();

    // options A-E
    const options = {};
    while (i < lines.length && OPTION_RE.test(lines[i])) {
      const letter = lines[i][0].toLowerCase();
      options[letter] = lines[i].slice(3).trim();
      i++;
    }

    // section label
    let sectionLabel = '';
    while (i < lines.length && !lines[i].startsWith('**Situation**')) {
      if (SECTION_RE.test(lines[i].trim())) sectionLabel = lines[i].trim();
      i++;
    }

    // **Situation**
    if (i < lines.length && lines[i].startsWith('**Situation**')) i++;

    // situation text (everything until **Reasoning**)
    const situationLines = [];
    while (i < lines.length && !lines[i].startsWith('**Reasoning**')) {
      situationLines.push(lines[i]);
      i++;
    }
    const situationText = situationLines.join('\n').trim();

    // **Reasoning**
    if (i < lines.length && lines[i].startsWith('**Reasoning**')) i++;

    // reasoning + per-letter explanations
    const reasoningLines = [];
    const explanationLetters = {};
    let correctAnswer = '';

    while (i < lines.length) {
      const line = lines[i];
      if (line.match(/^\d+\. \(\*\*/) || line === '----') break;

      const correctLineMatch = line.match(/^\*\*The correct answer is ([A-E])\.\*\*$/);
      if (correctLineMatch) {
        correctAnswer = correctLineMatch[1].toLowerCase();
        i++; continue;
      }

      if (OPTION_RE.test(line)) {
        const letter = line[0].toLowerCase();
        explanationLetters[letter] = line.slice(3).trim();
        i++; continue;
      }

      reasoningLines.push(line);
      i++;
    }

    const reasoningText = reasoningLines.join('\n').trim();

    // Detect correct answer from **Correct.** label if not found via "The correct answer" line
    const letterOrder = ['a','b','c','d','e'];
    if (!correctAnswer) {
      for (const l of letterOrder) {
        if (explanationLetters[l] && explanationLetters[l].startsWith('**Correct.**')) {
          correctAnswer = l;
          break;
        }
      }
    }

    const wrongAnswers = letterOrder.filter(l => l !== correctAnswer && options[l] !== undefined);

    // Build explanation string preserving markdown
    const expParts = [sectionLabel];
    if (situationText) expParts.push('**Situation**\n' + situationText);
    if (reasoningText) expParts.push('**Reasoning**\n' + reasoningText);
    for (const l of letterOrder) {
      if (explanationLetters[l]) expParts.push(l.toUpperCase() + '. ' + explanationLetters[l]);
    }
    if (correctAnswer) expParts.push('**The correct answer is ' + correctAnswer.toUpperCase() + '.**');
    const explanation = expParts.join('\n\n');

    questions[qNum] = {
      difficulty,
      difficulty_level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
      passage_text: passageText,
      question_text: questionText,
      options,
      explanation,
      correct_answer: correctAnswer,
      wrong_answers: wrongAnswers,
    };
  }

  return questions;
}

// ── main ──────────────────────────────────────────────────────────────────────

const mdText = fs.readFileSync(MD_FILE, 'utf8');
const jsonRows = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

const dbByNumber = {};
for (const row of jsonRows) dbByNumber[row.question_number] = row;

const mdQuestions = parseMD(mdText);

const sqlLines = [
  '-- SQL patch for 2V_questions (Q662-Q802)',
  '-- Preserves markdown bold/italic formatting',
  '-- Run in Supabase SQL editor',
  '',
];

let count = 0;
const skipped = [];

for (const qNum of Object.keys(mdQuestions).map(Number).sort((a, b) => a - b)) {
  const q = mdQuestions[qNum];
  const row = dbByNumber[qNum];

  if (!row) {
    skipped.push(qNum);
    sqlLines.push(`-- Q${qNum}: SKIPPED (not in DB)`);
    sqlLines.push('');
    continue;
  }

  if (!q.correct_answer) {
    skipped.push(qNum);
    sqlLines.push(`-- Q${qNum}: SKIPPED (correct answer not detected)`);
    sqlLines.push('');
    continue;
  }

  // Validate options
  const missingOpts = ['a','b','c','d','e'].filter(l => !q.options[l]);
  if (missingOpts.length) {
    console.warn(`Q${qNum}: missing options ${missingOpts.join(',')} — check MD parsing`);
  }

  const wrongArr = q.wrong_answers.map(l => `'${l}'`).join(',');

  sqlLines.push(`-- Q${qNum}`);
  sqlLines.push(`UPDATE "2V_questions"`);
  sqlLines.push(`SET`);
  sqlLines.push(`  question_data = question_data::jsonb`);
  sqlLines.push(`    || jsonb_build_object(`);
  sqlLines.push(`      'passage_text', '${esc(q.passage_text)}',`);
  sqlLines.push(`      'question_text', '${esc(q.question_text)}',`);
  sqlLines.push(`      'options', jsonb_build_object('a', '${esc(q.options.a)}', 'b', '${esc(q.options.b)}', 'c', '${esc(q.options.c)}', 'd', '${esc(q.options.d)}', 'e', '${esc(q.options.e)}'),`);
  sqlLines.push(`      'explanation', '${esc(q.explanation)}'`);
  sqlLines.push(`    ),`);
  sqlLines.push(`  answers = jsonb_build_object('correct_answer', '${q.correct_answer}', 'wrong_answers', ARRAY[${wrongArr}]::text[]),`);
  sqlLines.push(`  difficulty = '${q.difficulty}',`);
  sqlLines.push(`  difficulty_level = ${q.difficulty_level},`);
  sqlLines.push(`  updated_at = now()`);
  sqlLines.push(`WHERE id = '${row.id}';`);
  sqlLines.push('');
  count++;
}

fs.writeFileSync(SQL_FILE, sqlLines.join('\n'), 'utf8');
console.log(`Done. ${count} UPDATE statements. Skipped: ${skipped.join(', ') || 'none'}`);
