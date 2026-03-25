# GMAT Question Extraction Pipeline — Instructions

> **Purpose**: This file is the permanent reference for any AI session or human operator working on extracting GMAT questions from images into structured markdown. Read this before touching any extraction file.

---

## 1. Overview

The pipeline has two stages:

| Stage | Script | Input | Output |
|---|---|---|---|
| 1 — OCR | `scripts/AI/extract_questions.py` | `raw_question_images/*.png` | `raw_question_text/*.md` |
| 2 — Format | `scripts/AI/format_questions.py` | `raw_question_text/*.md` | Appended to `{Section} - Text Extraction.md` |

**After both stages**, several fields still require manual completion:
- `*Image source*` on GI questions (see [GI Workflow](#6-gi-question-workflow))
- `*Answers*`
- `*Explanation*`
- `# Difficulty`

> **⚠️ Naming inconsistency**: `VR - Text Extraction.md` currently contains Data Insights (DI) questions — it was named before the section structure was finalised. New questions must go into the correct file (`DI - Text Extraction.md`, etc.). Do not append more DI questions to the VR file.

---

## 2. Prerequisites

```bash
# Verify existing packages (torch + transformers already installed as of March 2026)
pip show torch transformers Pillow

# Install any missing dependencies
pip install -r admission-platform-v2/GMAT/scripts/AI/requirements_ocr.txt

# Optional: install accelerate for faster CPU inference
pip install accelerate
```

**Optional — Ollama backend (simpler, requires separate install):**
1. Download from https://ollama.com/download/windows and install
2. Pull the model once: `ollama pull glm-ocr`
3. The script auto-detects Ollama if it is running; otherwise it falls back to transformers

---

## 3. Directory Structure

```
admission-platform-v2/GMAT/
├── scripts/
│   └── AI/
│       ├── extract_questions.py       ← Stage 1
│       ├── format_questions.py        ← Stage 2
│       └── requirements_ocr.txt
└── sources/official/GMAT Online Question Bank/
    └── docs/
        ├── raw_question_images/       ← PUT INPUT IMAGES HERE
        │   └── (optional subfolders: DI/, QR/, VR/)
        ├── raw_question_text/         ← Stage 1 output (intermediate)
        ├── images/                    ← Referenced images for GI questions
        ├── DI - Text Extraction.md    ← Final output for DI questions
        ├── QR - Text Extraction.md    ← Final output for QR questions
        ├── VR - Text Extraction.md    ← Final output for VR questions (⚠️ see note above)
        ├── extraction_log.json        ← Stage 1 log (auto-generated)
        ├── format_log.json            ← Stage 2 log (auto-generated)
        └── EXTRACTION_INSTRUCTIONS.md ← This file
```

---

## 4. Input Image Naming Conventions

| Pattern | Example | Notes |
|---|---|---|
| Single image | `100472.png` | Most question types |
| MSR question tabs | `100441_question1.png`, `100441_question2.png` | One file per sub-question |
| MSR source tabs | `100441_source_tab1.png`, `100441_source_tab2.png` | One file per source tab |
| Generic multi-image | `100500_a.png`, `100500_b.png` | Alternative suffix style |

All files sharing the same leading numeric ID are grouped into a single OCR pass. The suffix after `_` is purely descriptive and does not affect processing.

**Optional subfolder hints** — place images in a subfolder to help section detection:
```
raw_question_images/DI/100472.png
raw_question_images/QR/100600.png
raw_question_images/VR/100700.png
```
Stage 2 reads the parent folder name as a section hint when detection confidence is low.

Question IDs are purely numeric (e.g. `100310`, `100472`) matching the GMAT Official Question Bank format.

---

## 5. Running Stage 1 — OCR

```bash
# From the repo root:
cd admission-platform-v2/GMAT/scripts/AI

# Basic run (auto-detects backend)
python extract_questions.py

# Force a specific backend
python extract_questions.py --backend transformers
python extract_questions.py --backend ollama

# Process a single question
python extract_questions.py --only 100472

# Preview without writing anything
python extract_questions.py --dry-run

# Check what has already been extracted
python extract_questions.py --status
```

**What Stage 1 writes** to `raw_question_text/100472.md`:
```markdown
<!-- GLM-OCR raw extraction -->
<!-- source: 100472.png -->
<!-- extracted_at: 2026-03-25T10:30:00 -->
<!-- backend: transformers -->

[verbatim OCR output — text, LaTeX math, markdown tables]
```

> **Note on GI questions**: GLM-OCR is instructed to skip charts and graphs entirely. The raw file will contain only surrounding text (question stem, blank options, etc.). The chart image must be handled separately — see [Section 6](#6-gi-question-workflow).

---

## 6. GI Question Workflow

Graphics Interpretation questions contain a chart that cannot be reconstructed from OCR. The workflow is:

1. **Stage 1** extracts the surrounding text (question stem, Blank options) and sets `*Image source*: [TO BE ADDED BY USER]`
2. **You** export/crop the chart image using your tool and save it to `docs/images/{question_id}.png`
3. **You** update the `*Image source*:` line in the extraction file to `images/{question_id}.png`

Example of a completed GI question (see 100310 and 100472 in `VR - Text Extraction.md` for reference):
```markdown
*Image source*: images/100472.png
```

---

## 7. Running Stage 2 — Format

```bash
# Basic run (auto-detects section/type for each question)
python format_questions.py

# Force all questions to a specific section (useful for known-section batches)
python format_questions.py --force-section DI

# Process a single question
python format_questions.py --only 100472

# Preview without writing
python format_questions.py --dry-run

# Check what has already been formatted
python format_questions.py --status
```

After Stage 2, each formatted question is appended to the correct extraction file. Fields marked `[TO BE ADDED]` or `[TO BE ADDED BY USER]` must be filled in manually.

> **Note on DS questions**: DS images show the math topic tag (e.g. "Algebra Ratios", "Arithmetic Percents") rather than the GMAT category word. Stage 2 automatically sets `# Category: Evaluate` for all DS questions, since evaluating statement sufficiency is always an Evaluate-type task.

---

## 8. Section and Type Mapping

| Section | Full Name | Question Types |
|---|---|---|
| DI | Data Insights | GI, TA, TPA, MSR, DS |
| VR | Verbal Reasoning | CR, RC |
| QR | Quantitative Reasoning | PS |

| Abbrev | Full Name | Key signals for auto-detection |
|---|---|---|
| GI | Graphics Interpretation | "Blank 1", "drop-down", "select the option" |
| TA | Table Analysis | Yes/No statements + markdown table |
| TPA | Two-Part Analysis | "select one in each column", two-column table |
| MSR | Multi-Source Reasoning | Multiple tabs/passages ("Tab 1", "Passage 2") |
| DS | Data Sufficiency | "(1)" and "(2)" statements + sufficiency language |
| CR | Critical Reasoning | Short argument + (A)–(E) choices + reasoning keywords |
| RC | Reading Comprehension | Long passage (200+ words) + comprehension questions |
| PS | Problem Solving | Math stem + (A)–(E) numerical/algebraic choices |

### Category field

Every question has a `# Category:` field in its header. The four valid values are:

| Category | Meaning |
|---|---|
| **Recognize** | Identify and read information directly from the data |
| **Evaluate** | Compare or assess options based on criteria |
| **Apply** | Use given information to compute or derive a result |
| **Infer** | Draw a conclusion not explicitly stated in the data |

In the source images, the category appears as the **first ALL-CAPS word** at the start of the explanation section (e.g. `RECOGNIZE`, `EVALUATE`, `APPLY`, `INFER`). Stage 2 extracts this automatically. Special cases:
- **DS questions**: The image shows a math topic tag instead (e.g. "Algebra Ratios") — Stage 2 always sets `Evaluate` for DS.
- All other types where detection fails: set to `[TO BE ADDED]` for manual completion.

The category is also echoed as the first bold word in the `*Explanation*` block, matching the existing format.

When auto-detection confidence is low, the question is flagged `needs_review: true` in `format_log.json` and gets a `[TO BE ADDED — section unclear]` placeholder. Use `--force-section` to override.

---

## 9. Question Format Reference

The canonical format is established by the 5 complete questions in `VR - Text Extraction.md`. All new questions must match this structure exactly. Below is a minimal example of each type.

### GI — Graphics Interpretation
```markdown
# Question Code : 100472
# Section : Data Insights
# Question Type: Graphics Interpretation (GI)
# Difficulty: Not given from official source
# Category: Apply
*Image source*: images/100472.png
*Question*:
[Question stem text here]

*Options for Blank 1*:
- Option A
- Option B
- Option C

*Options for Blank 2*:
- Option A
- Option B

*Answers*:
Blank 1: [answer]
Blank 2: [answer]

*Explanation*:
**[Recognize/Evaluate/Apply/Infer]**
**RO1**
[Step 1 reasoning] **The correct answer is [X].**
**RO2**
[Step 2 reasoning] **The correct answer is [Y].**
```

### TA — Table Analysis
```markdown
# Question Code : 100325
# Section : Data Insights
# Question Type: Table Analysis (TA)
# Difficulty: Not given from official source
*Image source*: null
*Context*:
[Introductory paragraph describing the table]

*Table*:
| **Col 1** | **Col 2** | **Col 3** |
|:---:|:---:|:---:|
| val | val | val |

*Statements*:
For each of the following statements, select **Yes** if the statement is true based on the information provided. Otherwise select **No**.
- [Statement 1]
- [Statement 2]
- [Statement 3]

*Answers*:
- [Statement 1] **Yes/No**
- [Statement 2] **Yes/No**
- [Statement 3] **Yes/No**

*Explanation*:
**Recognize**
**RO1**
[Reasoning] **The correct answer is Yes/No.**
```

### TPA — Two-Part Analysis
```markdown
# Question Code : 100379
# Section : Data Insights
# Question Type: Two-Part Analysis (TPA)
# Difficulty: Not given from official source
*Image source*: null
*Question*:
[Question stem with context]

| **Column 1** | **Column 2** | |
|:---:|:---:|:---|
| ○ | ○ | Row 1 option |
| ○ | ○ | Row 2 option |

*Answers*:
- **Column 1**: [Row X]
- **Column 2**: [Row Y]

*Explanation*:
**Evaluate**
**RO1**
[Reasoning for Column 1] **The correct answer is [X].**
**RO2**
[Reasoning for Column 2] **The correct answer is [Y].**
```

### DS — Data Sufficiency
```markdown
# Question Code : [ID]
# Section : Data Insights
# Question Type: Data Sufficiency (DS)
# Difficulty: Not given from official source
*Image source*: null
*Question*:
[Question stem / what to determine]

*(1)* [First statement]

*(2)* [Second statement]

*Answer choices*:
- (A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.
- (B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.
- (C) BOTH statements TOGETHER are sufficient, but NEITHER statement alone is sufficient.
- (D) EACH statement ALONE is sufficient.
- (E) Statements (1) and (2) TOGETHER are NOT sufficient.

*Answers*: [TO BE ADDED]

*Explanation*:
[TO BE ADDED]
```

### CR — Critical Reasoning
```markdown
# Question Code : [ID]
# Section : Verbal Reasoning
# Question Type: Critical Reasoning (CR)
# Difficulty: Not given from official source
*Image source*: null
*Question*:
[Argument/stimulus paragraph]

[Question stem asking to weaken/strengthen/assume/etc.]

*Options*:
- (A) [option]
- (B) [option]
- (C) [option]
- (D) [option]
- (E) [option]

*Answers*: [letter]

*Explanation*:
[TO BE ADDED]
```

### PS — Problem Solving
```markdown
# Question Code : [ID]
# Section : Quantitative Reasoning
# Question Type: Problem Solving (PS)
# Difficulty: Not given from official source
*Image source*: null
*Question*:
[Math problem stem with LaTeX where needed]

*Options*:
- (A) $value$
- (B) $value$
- (C) $value$
- (D) $value$
- (E) $value$

*Answers*: [letter]

*Explanation*:
[TO BE ADDED]
```

---

## 10. LaTeX Conventions

| Usage | Syntax | Example |
|---|---|---|
| Inline math | `$...$` | `$x^2 + y^2 = z^2$` |
| Display math | `$$...$$` | `$$\frac{a}{b} = c$$` |
| Fractions | `\frac{num}{den}` | `$\frac{3}{4}$` |
| Square root | `\sqrt{x}` | `$\sqrt{2}$` |
| Thousands separator | `{,}` | `$1{,}390$` |
| Currency | `\$` inside math | `$\$2{,}250$` |
| Superscript | `^` | `$ft^2$` |
| Subscript | `_` | `$x_1$` |
| Degree | `^\circ` | `$90^\circ$` |

---

## 11. Manual Completion Checklist

After running the pipeline, for each new question verify:

- [ ] `# Difficulty` — fill in if known, otherwise leave `Not given from official source`
- [ ] `# Category` — auto-filled for most types; always `Evaluate` for DS; `[TO BE ADDED]` means check the source image explanation header
- [ ] `*Image source*` — for GI questions: add path to chart image after placing it in `docs/images/`
- [ ] `*Answers*` — auto-extracted from the OCR output and filled in (verify for correctness)
- [ ] `*Explanation*` — auto-extracted from the OCR output (verify; the category word and **RO1/RO2** structure should already be present)
- [ ] Check `format_log.json` for any entries with `needs_review: true` — these need manual section/type correction

---

## 12. Backends Comparison

| | Transformers | Ollama |
|---|---|---|
| Install | `pip install transformers torch` (already done) | Download from ollama.com, then `ollama pull glm-ocr` |
| Model download | ~1.8GB on first run to `~/.cache/huggingface/` | Managed by Ollama |
| Per-image speed | ~10–30s on CPU, faster with GPU | Similar; slight HTTP overhead |
| GPU support | Automatic via `device_map="auto"` | Automatic |
| Offline | Yes, after first download | Yes, after pull |
| Interactive test | No | `ollama run glm-ocr` in terminal |
| Auto-detected | Fallback when Ollama not running | Primary if Ollama is running |
