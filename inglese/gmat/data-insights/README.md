# GMAT Data Insights Implementation

## Overview
This module adds support for creating GMAT Data Insights questions in the test creation interface. It integrates seamlessly with the existing `excel-form-bancadati.js` system while keeping all changes minimal and isolated.

## What's Been Implemented

### ✅ Core Infrastructure
1. **Folder Structure** Created in `inglese/gmat/data-insights/`
2. **New Database Columns** Added to excel form:
   - `di_question_type` - Stores the DI question type (DS/GI/TA/TPA/MSR)
   - `di_question_data` - Stores complete question data as JSON

3. **Integration Points**:
   - Modified `excel-form-bancadati.js` (minimal changes)
   - Modified `modify_tests.html` to load DI modules
   - All DI logic kept in separate files

### ✅ Question Creation Interface

#### When DI Button Appears:
- Only for GMAT tests
- Only for these sections: **Assessment Iniziale**, **Data Insights**, **Simulazioni**

#### User Flow:
1. User creates GMAT test in config modal
2. Excel-like table loads with standard columns
3. Each row has a "📝 Create DI Question" button in the "DI Type" column
4. Clicking button opens modal to select question type (5 types available)
5. After selecting type, specific creator modal opens
6. User fills in DI question details
7. On save:
   - DI data saved to row's `di_question_data` column
   - Button changes to "✏️ [TYPE]" for editing
   - Standard question fields (question_text, options A-E) are **disabled**

### ✅ Data Sufficiency Creator (COMPLETED)
**File**: `question-types/data-sufficiency.js`

**Features**:
- Problem statement input with LaTeX support
- Statement (1) and Statement (2) inputs
- Optional image upload
- Standard 5-choice answer format (specific to DS):
  - A: Statement (1) ALONE is sufficient
  - B: Statement (2) ALONE is sufficient
  - C: BOTH together are sufficient, but NEITHER alone
  - D: EACH alone is sufficient
  - E: Statements together are NOT sufficient
- Optional explanation field
- Real-time LaTeX preview
- Edit and Delete functionality

**Data Structure**:
```json
{
  "problem": "What is the value of x?",
  "statement1": "x > 5",
  "statement2": "x < 10",
  "correct_answer": "C",
  "explanation": "Both statements together narrow the range...",
  "image_url": "optional_url",
  "answer_choices": { ... standard DS choices ... }
}
```

### 🚧 Still To Implement

#### Graphics Interpretation (GI)
**File**: `question-types/graphics-interpretation.js`
- Chart/graph image upload
- Fill-in-the-blank statements with dropdown options
- Support for: scatter plots, bar charts, line graphs, pie charts

#### Table Analysis (TA)
**File**: `question-types/table-analysis.js`
- Sortable data table builder
- True/False statements
- All statements must be correct for credit

#### Two-Part Analysis (TPA)
**File**: `question-types/two-part-analysis.js`
- Scenario/context text
- Part A question
- Part B question
- Shared answer options
- Both parts must be correct

#### Multi-Source Reasoning (MSR)
**File**: `question-types/multi-source-reasoning.js`
- Multiple tabs (2-3 sources)
- Each tab can contain: text, chart, or table
- Questions based on cross-referencing sources

## File Structure

```
inglese/gmat/data-insights/
├── gmat-data-insights.js           # Main module coordinator
├── question-types/
│   ├── data-sufficiency.js         # ✅ COMPLETE
│   ├── graphics-interpretation.js  # 🚧 TODO
│   ├── table-analysis.js           # 🚧 TODO
│   ├── two-part-analysis.js        # 🚧 TODO
│   └── multi-source-reasoning.js   # 🚧 TODO
└── README.md                       # This file
```

## Minimal Changes to Existing Code

### `excel-form-bancadati.js`
- Added 2 columns to `this.columns` array
- Added DI Type column header in table
- Added DI Type cell creation in `createCells()`
- Added logic to disable standard fields when DI question exists
- **Total lines changed**: ~100 lines added (out of 2000+ line file)

### `modify_tests.html`
- Added script loader for GMAT Data Insights modules
- **Total lines changed**: ~15 lines

## How to Use

### Creating a Data Sufficiency Question:

1. Open modify_tests.html
2. Click "Advanced Upload" → "Database Test Creation"
3. In config modal:
   - Select "GMAT" as test type
   - Select "Data Insights" (or Assessment Iniziale/Simulazioni) as section
   - Fill in other details and click "Continua"
4. In the excel table, find the row where you want to add DS question
5. Click "📝 Create DI Question" button
6. Select "Data Sufficiency" from the 5 options
7. Fill in:
   - Problem statement (supports LaTeX: $x^2$ etc.)
   - Statement (1)
   - Statement (2)
   - Upload image (optional)
   - Select correct answer
   - Add explanation (optional)
8. Click "💾 Save Question"
9. The row will now show:
   - Button changes to "✏️ DS"
   - Standard question fields are disabled
   - DI data stored in JSON

### Editing/Deleting:
- Click the "✏️ DS" button to edit
- In the edit modal, click "🗑️ Delete Question" to remove and re-enable standard fields

## Data Storage

All DI questions are stored in the `bancadati` table with these columns:
- `di_question_type`: VARCHAR (values: DS, GI, TA, TPA, MSR, or empty)
- `di_question_data`: JSONB (complete question structure)

Standard columns (question_text, options A-E) remain in the database but are left empty for DI questions.

## Next Steps

1. **Test Data Sufficiency** - Verify the implementation works end-to-end
2. **Implement remaining 4 question types** following the same pattern
3. **Add test-taking interface** (in `test_bancaDati.js`) to render DI questions during tests
4. **Add scoring logic** (in separate scorer file) for each DI question type
5. **Implement image upload to Supabase Storage** (currently using data URLs)

## Notes

- All LaTeX rendering uses MathJax (already loaded in the system)
- Image upload currently creates data URLs; needs Supabase Storage integration
- DI questions keep all common fields (test type, section, difficulty, question number)
- The system is designed to be extensible - each question type is independent

---

**Status**: Data Sufficiency (DS) fully implemented and ready for testing
**Next**: Implement Graphics Interpretation (GI)
