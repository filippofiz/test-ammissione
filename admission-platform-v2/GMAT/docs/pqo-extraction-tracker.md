# PQO Screenshot Extraction — Implementation Tracker

> Living doc. Updated after each step is approved.

---

## Status Overview

| Step | Part | File(s) | Status |
|------|------|---------|--------|
| 1 | Extract screenshots → JSON | `scripts/extract_screenshots.py` | ✅ Complete |
| 2 | Reconstruct GI charts | `scripts/reconstruct_di_images.py` | ✅ Complete |
| 3 | JSON → TypeScript | `scripts/generate_pqo_typescript.py` | ✅ Complete |
| 4 | Import tracking manifest | `scripts/manifest.json` (maintained by all scripts) | ✅ Complete (embedded in Steps 1–3) |
| 5 | Extend import script | `scripts/import-gmat-questions.ts` | 🔲 Not started |

---

## Step 1 — `extract_screenshots.py`

**Goal**: Claude Vision reads screenshots grouped by GMAT ID → outputs `extracted/questions.json`

**Key design decisions**:
- Screenshots already named by GMAT ID (`4GM116.png`, `8GM127_a.png`) — script groups by base ID automatically, no manual folder grouping needed
- Skips already-extracted entries (idempotent reruns)
- Saves incrementally after each question (resilient to interruption)
- `manifest.json` updated per question with extraction status
- Modes: `--dry-run`, `--only <gmat_id>`, `--status`
- Model: `claude-opus-4-5-20251101` (best vision for complex math/tables)
- API key: read from `ANTHROPIC_API_KEY` env var

**Output format** (per question in `extracted/questions.json`):
- QR: `{ gmat_id, question_text, options{a-e}, correct_answer, explanation, category, has_table, has_chart, needs_manual_review }`
- DI-DS: `{ di_type, gmat_id, problem, statement1, statement2, correct_answer, explanation }`
- DI-TPA: `{ di_type, gmat_id, scenario, column1_title, column2_title, shared_options[], correct_col1, correct_col2, explanation }`
- DI-TA: `{ di_type, gmat_id, table_title, stimulus_text, column_headers[], table_data[][], statements[{text,is_true}], answer_col1_title, answer_col2_title, statement_column_title, explanation }`
- DI-GI: `{ di_type, gmat_id, context_text, statement_text, blank1_options[], blank1_correct, blank2_options[], blank2_correct, chart_description, chart_type, chart_title, chart_data_points, explanation }`
- DI-MSR: `{ di_type, gmat_id, sources[{tab_name,content}], questions[{text,options{},correct_answer}], explanation }`

**Status**: ✅ Complete

**Notes**:
- Calls `extract-from-screenshot` Supabase edge function (deployed) — no local Anthropic key needed
- Uses `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from `admission-platform-v2/.env`
- Tested: dry-run on `4GM116` extracted perfectly (LaTeX, correct answer, explanation, category)
- Cost per QR question: ~$0.05 (opus). All 29 QR: ~$1.50 total
- Encoding fix: replaced `≈` with `~` for Windows console compatibility
- New file: `supabase/functions/extract-from-screenshot/index.ts` (deployed to Supabase)

---

## Step 2 — `reconstruct_di_images.py`

**Goal**: For GI questions only — Claude generates a matplotlib Python script → executed → clean PNG saved to `DI/images/`

**Key design decisions**:
- TA does NOT need reconstruction — table data renders natively in `TAQuestion.tsx`
- Claude receives: original screenshot(s) + extracted `chart_title`, `chart_type`, `chart_description`, `chart_data_points`
- Claude outputs: complete Python matplotlib script that saves `output.png` (via dedicated edge function `reconstruct-gi-chart`)
- Script executes in subprocess with a temp directory, then copies result to `DI/images/<question_id>.png`
- Generated Python code is also saved to `DI/images/code/<gmat_id>_chart.py` for inspection/editing
- `manifest.json` updated with `image_reconstructed: true`, `image_filename`, `image_reconstructed_at`
- Dependencies: `matplotlib`, `numpy` (no seaborn needed — simpler)
- Skips already-reconstructed charts (idempotent reruns)

**New file created**: `supabase/functions/reconstruct-gi-chart/index.ts` (needs deployment)

**Output PNG naming**:
- If `question_id` is in manifest (set by Step 3): `DI-GMAT-PQO_-00001.png`
- Otherwise fallback: `DI-GMAT-PQO_-<gmat_id>.png`
- Best to run Step 3 first then re-run reconstruction if needed, OR run after Step 3

**CLI**:
```bash
python reconstruct_di_images.py \
  --input "GMAT/sources/official/GMAT Practice DI Online/extracted/questions.json" \
  --screenshots-dir "GMAT/sources/official/GMAT Practice DI Online/screenshots" \
  --output-dir "GMAT/sources/questions/DI/images" \
  --id-prefix "DI-GMAT-PQO_"

# Test single question (dry-run prints code, does not execute)
python reconstruct_di_images.py ... --only 8GM147 --dry-run

# Status
python reconstruct_di_images.py --input ... --status
```

**Status**: ✅ Complete (needs `reconstruct-gi-chart` edge function deployed to Supabase)

**Deployment note**: Run `supabase functions deploy reconstruct-gi-chart` from `admission-platform-v2/`

---

## Step 3 — `generate_pqo_typescript.py`

**Goal**: Reads extracted JSON → produces TypeScript files for all PQO questions

**Output files**:
- `GMAT/sources/questions/QR/quantitative_reasoning_PQO.ts` → exports `quantitativeReasoningQuestionsPQO`
- `GMAT/sources/questions/DI/data_insights_PQO_DS.ts` → exports `dataInsightsPQO_DS`
- `GMAT/sources/questions/DI/data_insights_PQO_TPA.ts` → exports `dataInsightsPQO_TPA`
- `GMAT/sources/questions/DI/data_insights_PQO_GI.ts` → exports `dataInsightsPQO_GI`
- `GMAT/sources/questions/DI/data_insights_PQO_TA.ts` → exports `dataInsightsPQO_TA`
- `GMAT/sources/questions/DI/data_insights_PQO_MSR.ts` → exports `dataInsightsPQO_MSR`

**ID format**: `QR-GMAT-PQO_-00001`, `DI-GMAT-PQO_-00001` (sequential within PQO set, DI counter shared across all subtypes)

**Key design decisions**:
- TA `correct_answer` map: `stmt0/stmt1/...` → `"col1"` (if `is_true`) or `"col2"` (if `!is_true`)
- GI `image_url: null` initially — populated by the upload step; `chart_config` is omitted since `GIQuestion.tsx` prioritises `imageUrl`
- GI questionData cast as `unknown as GIQuestionData` to allow `image_url` field not in the strict type
- MSR sources always use `content_type: "text"` — table-type sources would need manual editing
- Manifest updated with `question_id`, `typescript_file`, `typescript_generated_at` for each entry

**CLI**:
```bash
# QR
python generate_pqo_typescript.py --section QR \
  --input "GMAT/sources/official/GMAT Practice QR Online/extracted/questions.json"

# DI (all subtypes at once)
python generate_pqo_typescript.py --section DI \
  --input "GMAT/sources/official/GMAT Practice DI Online/extracted/questions.json"

# Both at once
python generate_pqo_typescript.py --section both \
  --input "GMAT/sources/official/GMAT Practice QR Online/extracted/questions.json" \
  --di-input "GMAT/sources/official/GMAT Practice DI Online/extracted/questions.json"

# Dry-run (prints first 60 lines of each file)
python generate_pqo_typescript.py --section QR --input ... --dry-run
```

**Status**: ✅ Complete

---

## Step 4 — `manifest.json` tracking

**Goal**: Track every screenshot through the full pipeline; `--status` shows diff of what needs doing

**Schema per entry**:
```json
{
  "gmat_id": "4GM116",
  "section": "QR",
  "di_type": null,
  "source_screenshots": ["4GM116.png"],
  "extracted_at": "...",
  "question_id": "QR-GMAT-PQO_-00001",
  "typescript_file": "quantitative_reasoning_PQO.ts",
  "typescript_generated_at": "...",
  "image_reconstructed": false,
  "image_uploaded": false,
  "imported_to_db": false,
  "imported_at": null,
  "db_row_id": null,
  "needs_manual_review": false
}
```

**Note**: `manifest.json` is updated by all scripts (`extract_screenshots.py`, `reconstruct_di_images.py`, `generate_pqo_typescript.py`, `import-gmat-questions.ts`). It lives at `GMAT/scripts/manifest.json`.

**Status**: ✅ Complete (embedded across Steps 1–3; each script updates its own fields)

---

## Step 5 — Extend `import-gmat-questions.ts`

**Goal**: Add PQO source code support to existing import pipeline

**Changes**:
1. Add `PQO_?` to valid ID regex pattern
2. Add `PQO` → offset `500000` in source offset map
3. Register all 6 PQO TypeScript files in question files map
4. Update `manifest.json` after successful import (set `imported_to_db`, `imported_at`, `db_row_id`)

**Status**: 🔲 Not started

---

## Notes / Decisions Log

- `GIQuestion.tsx:74-82` — already supports `imageUrl` (priority) or `chartConfig` (Chart.js fallback). GI questions from PQO will use `imageUrl` pointing to reconstructed matplotlib PNG.
- `TAQuestion.tsx` — renders tables natively from `columnHeaders` + `tableData`. No image needed for TA.
- Screenshot naming is already by GMAT ID — no manual grouping required.
- `ANTHROPIC_API_KEY` must be set locally (retrieve value from Supabase dashboard → Project Settings → Edge Functions → Secrets → `CLAUDE_API_KEY`).

---

## Completed Steps

- **Step 1** (`extract_screenshots.py`): Claude Vision extraction via `extract-from-screenshot` edge function. Tested on QR questions. Handles multi-part screenshots, difficulty from filename, `categories` as array.
- **Step 2** (`reconstruct_di_images.py`): GI chart reconstruction via `reconstruct-gi-chart` edge function. Generates + executes matplotlib code locally. Saves PNG + code file for inspection.
- **Step 3** (`generate_pqo_typescript.py`): JSON → TypeScript for all 6 output files (QR + 5 DI subtypes). Manifest updated with `question_id` + `typescript_file`. GI uses `image_url: null` initially.
- **Step 4** (`manifest.json`): Fully tracked — each script updates its own lifecycle fields.
