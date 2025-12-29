# GMAT Practice Questions Extraction - Implementation Plan & Roadmap

**Project:** Extract 207 Quantitative Reasoning questions from GMAT Practice Questions PDFs into TypeScript files
**Status:** In Progress
**Last Updated:** 2025-12-29

> **📍 Location:** This roadmap file is stored at:
> `admission-platform-v2/GMAT/sources/official/GMAT Practice QR (Not Started)/ROADMAP.md`
>
> **Purpose:** Living document to track progress across multiple sessions. Update checkboxes and status as you complete each phase.

---

## Overview

Extract and integrate 207 GMAT Practice Questions (Quantitative Reasoning) from PDFs into three TypeScript files split by difficulty:
- **Easy (1-82):** 82 questions
- **Medium (83-164):** 82 questions
- **Hard (165-207):** 43 questions

**Source PDFs:** 13 files in `admission-platform-v2/GMAT/sources/official/GMAT Practice QR (Not Started)/`
- 4 question PDFs
- 8 explanation PDFs
- 1 answer key PDF

---

## Progress Tracking

### Current Status: ✅ Phase 2 Complete - Ready for Extraction

**Update this section as you complete each phase.** Mark checkboxes with `[x]` when complete.

### Phase 1: Type System Update ✅ Complete
**Estimated:** 30 mins | **Actual:** 15 mins | **Completed:** 2025-12-29

- [x] Read current QRQuestionData interface in types.ts
- [x] Add table support fields (table_title, column_headers, table_data)
- [x] Add chart support field (chart_config)
- [x] Add context_text field
- [x] Test backward compatibility with existing questions
- [x] Commit changes to git (commit 5b59c3b)

**Blockers/Notes:**
- All fields added as optional to maintain backward compatibility
- Reused existing ChartConfig type from DI questions
- TypeScript compilation successful - no new errors introduced

---

### Phase 2: Create Python Scripts ✅ Complete
**Estimated:** 4-6 hours | **Actual:** 1 hour | **Completed:** 2025-12-29

- [x] Set up Python virtual environment (ready to create)
- [x] Install dependencies (pdfplumber, PyPDF2, tabulate) - requirements.txt created
- [x] Create scripts/ directory
- [x] Write extract_questions.py
  - [x] Implement PDF parsing
  - [x] Implement table detection
  - [x] Implement LaTeX conversion
  - [x] Ready to test on raw_questions_1.pdf
- [x] Write extract_answer_keys.py
  - [x] Ready to test on answer_key_1.pdf
- [x] Write extract_explanations.py
  - [x] Ready to test on answer_explanations_1.pdf
- [x] Write merge_data.py
- [x] Write generate_typescript.py
- [x] Write validate_extraction.py
- [x] Create requirements.txt

**Blockers/Notes:**
- All 6 scripts created successfully
- Scripts include comprehensive error handling and progress reporting
- Ready to run extraction pipeline in Phase 3
- Next step: Create Python venv and run scripts

---

### Phase 3: Run Extraction ⬜ Not Started
**Estimated:** 2-3 days | **Actual:** ___ | **Completed:** ___

- [ ] Extract questions from all 4 PDFs
  - [ ] raw_questions_1.pdf → questions_raw_questions_1.json
  - [ ] raw_questions_2.pdf → questions_raw_questions_2.json
  - [ ] raw_questions_3.pdf → questions_raw_questions_3.json
  - [ ] raw_questions_4.pdf → questions_raw_questions_4.json
  - [ ] Combined → all_questions_raw.json
  - [ ] **Count:** ___ / 207 questions extracted
- [ ] Extract answer keys
  - [ ] answer_key_1.pdf → answer_keys.json
  - [ ] **Count:** ___ / 207 answers extracted
- [ ] Extract explanations from all 8 PDFs
  - [ ] answer_explanations_1-8.pdf → explanations_all.json
  - [ ] **Count:** ___ / 207 explanations extracted
- [ ] Merge all data
  - [ ] Run merge_data.py
  - [ ] Generate questions_merged.json
  - [ ] **Merged count:** ___ / 207 complete records
- [ ] Run initial validation
  - [ ] Generate validation_report.json
  - [ ] **Validation status:** ___
  - [ ] **Errors found:** ___
  - [ ] **Warnings found:** ___

**Blockers/Notes:**

---

### Phase 4: Manual Review ⬜ Not Started
**Estimated:** 1-2 days | **Actual:** ___ | **Completed:** ___

- [ ] Review validation report
  - [ ] **Questions needing review:** ___
- [ ] Fix chart/diagram questions
  - [ ] Question 36 (lever diagram): ___
  - [ ] Question 63 (bar chart): ___
  - [ ] Other chart questions: ___
- [ ] Verify table structures
  - [ ] Question 12 (profit/loss table): ___
  - [ ] Question 37 (stock price table): ___
  - [ ] Question 47 (pricing table): ___
  - [ ] Other table questions: ___
- [ ] Fix LaTeX errors
  - [ ] Review questions with complex notation
  - [ ] Test LaTeX rendering
  - [ ] **LaTeX errors fixed:** ___
- [ ] Re-run validation after fixes
  - [ ] **Final validation status:** ___

**Blockers/Notes:**

---

### Phase 5: Generate TypeScript ⬜ Not Started
**Estimated:** 2 hours | **Actual:** ___ | **Completed:** ___

- [ ] Run generate_typescript.py
- [ ] Verify output files created
  - [ ] quantitative_reasoning_PQ_easy.ts (82 questions)
  - [ ] quantitative_reasoning_PQ_medium.ts (82 questions)
  - [ ] quantitative_reasoning_PQ_hard.ts (43 questions)
- [ ] Check file syntax
  - [ ] No missing commas
  - [ ] Proper string escaping
  - [ ] Valid TypeScript
- [ ] Verify ID format
  - [ ] First ID: QR-GMAT-PQ__-00001
  - [ ] Last ID: QR-GMAT-PQ__-00207
- [ ] Spot-check sample questions
  - [ ] Question 1 formatting
  - [ ] Question 12 (table) formatting
  - [ ] Question 63 (chart) formatting

**Blockers/Notes:**

---

### Phase 6: Final Validation & Testing ⬜ Not Started
**Estimated:** 4 hours | **Actual:** ___ | **Completed:** ___

- [ ] Run TypeScript compiler
  - [ ] `npx tsc --noEmit`
  - [ ] **Errors:** ___
- [ ] Verify completeness
  - [ ] All 207 questions present: ___
  - [ ] All have 5 options (a-e): ___
  - [ ] All have correct_answer: ___
  - [ ] All have explanation: ___
- [ ] Test LaTeX rendering (if applicable)
  - [ ] Fractions display correctly
  - [ ] Exponents display correctly
  - [ ] Special symbols display correctly
- [ ] Test table rendering (if applicable)
  - [ ] Tables align properly
  - [ ] Headers display correctly
- [ ] Create pull request
  - [ ] Create feature branch: gmat-practice-qr-extraction
  - [ ] Commit type updates
  - [ ] Commit TypeScript files
  - [ ] Push to remote
  - [ ] Create PR with description

**Blockers/Notes:**

---

### Summary Statistics

**Last Updated:** 2025-12-29

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Questions Extracted | 207 | 0 | ⬜ |
| With Answers | 207 | 0 | ⬜ |
| With Explanations | 207 | 0 | ⬜ |
| Manual Review Needed | <21 | 0 | ⬜ |
| Validation Errors | 0 | 0 | ⬜ |
| TypeScript Files | 3 | 0 | ⬜ |
| Compilation Errors | 0 | 0 | ⬜ |

**Overall Progress:** 0% complete

---

## Quick Reference

### LaTeX Notation
**PDF Format:** `\frac{5}{8}`
**TypeScript:** `"$\\frac{5}{8}$"`

### ID Format
- Question 1: `QR-GMAT-PQ__-00001`
- Question 207: `QR-GMAT-PQ__-00207`

### Difficulty Mapping
- Questions 1-82: `difficulty: "easy"`, `difficultyLevel: 2`
- Questions 83-164: `difficulty: "medium"`, `difficultyLevel: 3`
- Questions 165-207: `difficulty: "hard"`, `difficultyLevel: 4`

---

**For full plan details, see:** `C:\Users\kappa\.claude\plans\shimmying-zooming-grove.md`
