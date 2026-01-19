# GMAT Integration Plan

> **Status:** Phase 7 In Progress - Question Allocation Integration
> **Last Updated:** January 2026
> **Purpose:** Roadmap for integrating GMAT preparation into the admission platform`2

---

## Overview

Integrate GMAT preparation program into the admission platform:
- **1296 questions** imported from `GMAT/sources/questions/` (536 QR, 383 VR, 377 DI)
- **70+ PDF materials** from `GMAT/material/education/` (Typst → PDF)
- **Custom GMAT Preparation Page** with curriculum view
- **Per-PDF tutor unlock system** for materials

---

## Progress Tracking

### Phase 1: Database Schema ✅ COMPLETE
- [x] Create migration `033_create_gmat_materials.sql`
- [x] Create migration `034_create_gmat_materials_bucket.sql`
- [x] Deploy migrations to production
- [x] Verify RLS policies work correctly

### Phase 2: Question Import ✅ COMPLETE
- [x] Update `toDBRow()` in `types.ts` to include explanation
- [x] Create `scripts/import-gmat-questions.ts`
- [x] Create GMAT Question Pool test record (ID: `522d3e88-e1fd-4f8e-b984-f9c61f5227a9`)
- [x] Import QR questions (536 questions - OG, PQ, SK, PT1, SI)
- [x] Import VR questions (383 questions - CR + RC)
- [x] Import DI questions (377 questions - DS, TPA, GI, TA, MSR)

### Phase 3: Explanation Display ✅ COMPLETE
- [x] Create `ExplanationDisplay.tsx` component
- [x] Add explanation props to `DSQuestion.tsx`
- [x] Add explanation props to `GIQuestion.tsx`
- [x] Add explanation props to `TAQuestion.tsx`
- [x] Add explanation props to `TPAQuestion.tsx`
- [x] Add explanation props to `MSRQuestion.tsx`
- [x] Add explanation props to `MultipleChoiceQuestion.tsx`
- [x] Update `TestResultsPage.tsx` to pass explanation to components

### Phase 4: PDF Material System ✅ COMPLETE
- [x] Create `scripts/upload-gmat-materials.ts`
- [x] Create `scripts/compile-materials.ts` (Typst batch compilation)
- [x] Add npm scripts: `compile:materials`, `upload:materials`
- [x] Compiled 78 Typst files to PDF (1 syntax error in context/QR/fundamentals.typ)
- [x] Uploaded 79 PDF files to `gmat-materials` bucket
- [x] Created 79 records in `2V_lesson_materials` table

### Phase 5: GMAT Preparation Pages
- [ ] Create `GMATPreparationPage.tsx` (student view)
- [ ] Create `GMATMaterialsManagementPage.tsx` (tutor view)
- [ ] Add routes to `App.tsx`
- [ ] Add navigation links in StudentHomePage
- [ ] Add "Materials" button in TutorStudentsPage

### Phase 6: Test Track Configuration
- [ ] Configure GMAT section order
- [ ] Configure test track timing/navigation
- [ ] Test full GMAT test flow

### Phase 7: Question Allocation Integration 🔄 IN PROGRESS
> **Purpose:** Connect the GMAT allocation system to the actual test-taking flow

- [x] **7.1** Create `2V_gmat_student_progress` table (migration 036) ✅
- [x] **7.2** Regenerate database types ✅
- [ ] **7.3** Create GMAT utility library (`lib/gmat/questionAllocation.ts`)
- [ ] **7.4** Create GMAT progress API (`lib/api/gmat.ts`)
- [ ] **7.5** Update TakeTestPage.tsx to use allocated questions
- [ ] **7.6** Add tutor UI for cycle management
- [ ] **7.7** Update GMATPreparationPage to show student's cycle
- [ ] **7.8** Add validation to GMATQuestionAllocationPage

---

## Phase 1: Database Schema

### 1.1 Create Lesson Materials Table
**File:** `supabase/migrations/033_create_gmat_materials.sql`

```sql
-- 2V_lesson_materials: Stores metadata for PDF materials
CREATE TABLE "2V_lesson_materials" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type TEXT NOT NULL,              -- 'GMAT'
  section TEXT NOT NULL,                -- 'QR', 'VR', 'DI'
  topic TEXT NOT NULL,                  -- 'number-properties-arithmetic', etc.
  material_type TEXT NOT NULL,          -- 'lesson', 'training', 'assessment', 'context', 'slide'
  title TEXT NOT NULL,
  description TEXT,
  pdf_storage_path TEXT NOT NULL,       -- Path in Supabase bucket
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(test_type, section, topic, material_type, title)
);

-- 2V_material_assignments: Tracks which materials are unlocked for which students
CREATE TABLE "2V_material_assignments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES "2V_lesson_materials"(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES "2V_profiles"(id),
  is_unlocked BOOLEAN DEFAULT true,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_id, student_id)
);

-- Indexes
CREATE INDEX idx_lesson_materials_test_type ON "2V_lesson_materials"(test_type);
CREATE INDEX idx_lesson_materials_section ON "2V_lesson_materials"(section);
CREATE INDEX idx_material_assignments_student ON "2V_material_assignments"(student_id);
CREATE INDEX idx_material_assignments_material ON "2V_material_assignments"(material_id);

-- RLS Policies
ALTER TABLE "2V_lesson_materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "2V_material_assignments" ENABLE ROW LEVEL SECURITY;

-- Everyone can view active materials metadata
CREATE POLICY "View active materials"
  ON "2V_lesson_materials" FOR SELECT
  USING (is_active = true);

-- Tutors/Admins can manage materials
CREATE POLICY "Tutors manage materials"
  ON "2V_lesson_materials" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- Students see their own assignments
CREATE POLICY "Students view own assignments"
  ON "2V_material_assignments" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()
    )
  );

-- Tutors/Admins can manage all assignments
CREATE POLICY "Tutors manage assignments"
  ON "2V_material_assignments" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );
```

### 1.2 Create Storage Bucket
**File:** `supabase/migrations/034_create_gmat_materials_bucket.sql`

```sql
-- Create gmat-materials bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gmat-materials',
  'gmat-materials',
  false,
  104857600,  -- 100MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Students can view PDFs for their assigned materials
CREATE POLICY "Students view assigned material PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gmat-materials'
  AND EXISTS (
    SELECT 1 FROM "2V_material_assignments" ma
    JOIN "2V_lesson_materials" lm ON ma.material_id = lm.id
    WHERE lm.pdf_storage_path = name
    AND ma.student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
    AND ma.is_unlocked = true
  )
);

-- Tutors and admins can upload/manage materials
CREATE POLICY "Tutors manage material PDFs"
ON storage.objects FOR ALL
USING (
  bucket_id = 'gmat-materials'
  AND EXISTS (
    SELECT 1 FROM "2V_profiles"
    WHERE auth_uid = auth.uid()
    AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
  )
);
```

---

## Phase 2: Question Import System

### 2.1 Create GMAT Question Pool Test

Since `test_id` is required (NOT NULL constraint), create a single parent test record:

```sql
INSERT INTO "2V_tests" (test_type, section, exercise_type, test_number, format, is_active)
VALUES ('GMAT', 'Question Pool', 'Pool', 1, 'interactive', true);
```

### 2.2 Update `toDBRow()` to Include Explanation
**File:** `GMAT/sources/questions/types.ts`

Modify the helper to include `explanation` inside `question_data` JSONB:

```typescript
export function toDBRow(question: GMATQuestion): Omit<BaseQuestionRow, "id" | "created_at" | "updated_at"> {
  const questionType: QuestionType =
    question.section === "Data Insights" ? "data_insights" : "multiple_choice";

  // Include explanation inside question_data
  const questionDataWithExplanation = {
    ...question.questionData,
    explanation: question.explanation || null,
  };

  return {
    test_type: "GMAT",
    question_number: question.question_number,
    question_type: questionType,
    section: question.section,
    materia: null,
    difficulty: question.difficulty ?? null,
    difficulty_level: question.difficultyLevel ?? null,
    question_data: JSON.stringify(questionDataWithExplanation),  // Now includes explanation
    answers: JSON.stringify(question.answers),
    is_active: true,
    duplicate_question_ids: "[]",
  };
}
```

### 2.3 Create Import Script
**File:** `scripts/import-gmat-questions.ts`

**Features:**
- Import individual files on demand (not all at once)
- Validate ID format: `^(QR|VR|DI)-GMAT-(OG__|SK__|SI__|PT1_|PQ__)-\d{5}$`
- Skip questions without proper ID format
- Include `explanation` in `question_data` JSONB
- Report import statistics

**Questions to import:**
| Section | Files | Approx Count |
|---------|-------|--------------|
| QR | quantitative_reasoning_OG_easy.ts | ~96 |
| QR | quantitative_reasoning_OG_medium.ts | ~80 |
| QR | quantitative_reasoning_OG_hard.ts | ~96 |
| QR | quantitative_reasoning_PQ.ts | ~46 |
| QR | quantitative_reasoning_PT1.ts | ~21 |
| QR | quantitative_reasoning_SK.ts | ~27 |
| QR | quantitative_reasoning_SI.ts | ~9 |
| VR | verbal_reasoning_OG_CR_easy.ts | ~60 |
| VR | verbal_reasoning_OG_CR_medium.ts | ~60 |
| VR | verbal_reasoning_OG_CR_hard.ts | ~64 |
| VR | verbal_reasoning_OG_RC_easy.ts | ~50 |
| VR | verbal_reasoning_OG_RC_medium.ts | ~50 |
| VR | verbal_reasoning_OG_RC_hard.ts | ~46 |
| VR | verbal_reasoning_PT1.ts | ~23 |
| VR | verbal_reasoning_SK.ts | ~30 |
| DI | data_insights_OG_DS.ts | ~137 |
| DI | data_insights_OG_TPA.ts | ~28 |
| DI | data_insights_SK.ts | ~22 |
| DI | data_insights_PT1.ts | ~20 |

**Total: ~965 questions**

---

## Phase 3: Explanation Display

### 3.1 Update Question Components

**Files to modify:**
- `apps/web/src/components/questions/DSQuestion.tsx`
- `apps/web/src/components/questions/GIQuestion.tsx`
- `apps/web/src/components/questions/TAQuestion.tsx`
- `apps/web/src/components/questions/TPAQuestion.tsx`
- `apps/web/src/components/questions/MSRQuestion.tsx`
- `apps/web/src/components/questions/MultipleChoiceQuestion.tsx`

**Add to each component:**

```tsx
// Add to props interface
interface QuestionProps {
  // existing props...
  explanation?: string;
  showExplanation?: boolean;
}

// Add after answer options, when showResults=true:
{showExplanation && explanation && (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
    <div className="text-gray-800 whitespace-pre-wrap">
      <LaTeX>{explanation}</LaTeX>
    </div>
  </div>
)}
```

### 3.2 Update TestResultsPage
**File:** `apps/web/src/pages/TestResultsPage.tsx`

- Add state: `const [showExplanations, setShowExplanations] = useState(false);`
- Add toggle button in header
- Extract `explanation` from `question_data` JSONB:
  ```tsx
  const questionData = typeof question.question_data === 'string'
    ? JSON.parse(question.question_data)
    : question.question_data;
  const explanation = questionData.explanation;
  ```
- Pass `explanation` and `showExplanation={showExplanations}` to question components

---

## Phase 4: PDF Material System

### 4.1 Typst Compilation Workflow

**Compile locally:**
```bash
# From GMAT/material/education/lessons/QR/01-number-properties-arithmetic/
typst compile lesson-material.typ lesson-material.pdf
```

**Batch compile script (create if needed):**
```bash
#!/bin/bash
# compile-gmat-materials.sh
cd GMAT/material/education

# Compile all lesson materials
for section in QR DI VR; do
  for topic in lessons/$section/*/; do
    for file in "$topic"*.typ; do
      if [ -f "$file" ]; then
        typst compile "$file" "${file%.typ}.pdf"
        echo "Compiled: $file"
      fi
    done
  done
done
```

**Materials structure (70+ PDFs):**
```
material/education/
├── lessons/           # 12 topics × ~4 files each = ~48 PDFs
│   ├── QR/ (5 topics)
│   │   ├── 01-number-properties-arithmetic/
│   │   │   ├── lesson-material.typ → lesson-material.pdf
│   │   │   ├── question-template-training1.typ → training1.pdf
│   │   │   ├── question-template-training2.typ → training2.pdf
│   │   │   └── question-template-assessment.typ → assessment.pdf
│   │   ├── 02-algebra/
│   │   └── ...
│   ├── DI/ (5 topics)
│   └── VR/ (2 topics)
├── assessments/       # Diagnostic, section assessments, mock = ~6 PDFs
│   ├── initial-diagnostic/
│   ├── section-assessments/
│   └── mock-simulations/
├── context/           # Overview files = ~13 PDFs
│   ├── QR/
│   ├── DI/
│   └── VR/
└── slides/            # Section overviews = ~4 PDFs
```

### 4.2 Upload/Update Script
**File:** `scripts/upload-gmat-materials.ts`

**Features:**
- Upload compiled PDFs to `gmat-materials` bucket
- **Overwrite existing** files (no versioning)
- Create/update `2V_lesson_materials` records
- Storage path pattern: `GMAT/{section}/{topic}/{filename}.pdf`

**Example storage paths:**
- `GMAT/QR/01-number-properties-arithmetic/lesson-material.pdf`
- `GMAT/DI/02-graphics-interpretation/training1.pdf`
- `GMAT/assessments/diagnostic-simulation.pdf`

### 4.3 Manual Update Workflow

For quick PDF updates without running the full script:
1. Edit Typst source locally
2. Compile: `typst compile lesson-material.typ lesson-material.pdf`
3. Upload via Supabase dashboard (Storage → gmat-materials → navigate → upload/replace)
4. Path must match existing `pdf_storage_path` in database

---

## Phase 5: GMAT Preparation Pages

### 5.1 Student GMAT Preparation Page
**New File:** `apps/web/src/pages/GMATPreparationPage.tsx`

**Route:** `/student/gmat-preparation`

**UI Structure (following existing patterns from StudentHomePage):**
```
Layout (title: "GMAT Preparation", subtitle: "Your personalized learning path")
├── Progress Sidebar (sticky, right side)
│   ├── Circular progress chart (overall completion)
│   ├── Stats: "X of Y materials unlocked"
│   ├── Stats: "X topics completed"
│   └── Next recommended action
└── Main Content
    ├── Introduction Card (collapsible)
    │   └── Brief overview of GMAT structure
    ├── Section Cards (expandable) - QR, DI, VR order
    │   └── Topic Cards (12 total)
    │       ├── Topic header with progress bar
    │       ├── Materials Grid
    │       │   ├── Lesson Material (icon + lock status)
    │       │   ├── Training 1 (icon + lock status)
    │       │   ├── Training 2 (icon + lock status)
    │       │   └── Topic Assessment (icon + lock status)
    │       └── View/Download buttons (if unlocked)
    └── Diagnostic & Mock Section
        ├── Initial Diagnostic (if assigned)
        └── Mock Simulations (if assigned)
```

**Features:**
- Curriculum organized by section → topic
- Per-PDF unlock status (lock icon if not assigned/unlocked)
- Click to view PDF in modal (react-pdf) or download
- Mark as "viewed" when opened
- Progress tracking per topic (% of materials viewed)

### 5.2 Tutor GMAT Materials Management Page
**New File:** `apps/web/src/pages/GMATMaterialsManagementPage.tsx`

**Route:** `/tutor/student/:studentId/gmat-materials`

**UI Structure (following patterns from StudentTestsPage):**
```
Layout (title: "GMAT Materials", subtitle: "{Student Name}")
├── Student Info Header
│   ├── Name, email
│   └── Back to student button
├── Quick Actions Bar
│   ├── "Unlock All" button
│   └── Filter: Section dropdown
└── Materials List (accordion style)
    ├── Section: Quantitative Reasoning
    │   ├── Topic: Number Properties & Arithmetic
    │   │   ├── lesson-material.pdf [Unlocked ✓] [Lock]
    │   │   ├── training1.pdf [Locked 🔒] [Unlock]
    │   │   ├── training2.pdf [Locked 🔒] [Unlock]
    │   │   └── assessment.pdf [Locked 🔒] [Unlock]
    │   ├── Topic: Algebra
    │   │   └── ...
    │   └── [Unlock All Topic] button
    ├── Section: Data Insights
    │   └── ...
    └── Section: Verbal Reasoning
        └── ...
```

**Features:**
- List all materials organized by section → topic
- Show unlock status per material
- Toggle unlock/lock per individual PDF
- Bulk actions: unlock all for topic, unlock all for section
- Show "viewed_at" timestamp if material was accessed

### 5.3 Update Routes
**File:** `apps/web/src/App.tsx`

```tsx
import GMATPreparationPage from './pages/GMATPreparationPage';
import GMATMaterialsManagementPage from './pages/GMATMaterialsManagementPage';

// Add inside <Routes>:

// Student GMAT route
<Route
  path="/student/gmat-preparation"
  element={
    <ProtectedRoute requiredRoles={['STUDENT']}>
      <GMATPreparationPage />
    </ProtectedRoute>
  }
/>

// Tutor GMAT materials route
<Route
  path="/tutor/student/:studentId/gmat-materials"
  element={
    <ProtectedRoute requiredRoles={['TUTOR', 'ADMIN']}>
      <GMATMaterialsManagementPage />
    </ProtectedRoute>
  }
/>
```

### 5.4 Add Navigation Links

**StudentHomePage.tsx:**
- When `testTypes` includes 'GMAT', show a card/button linking to `/student/gmat-preparation`
- Could be a prominent card at the top: "GMAT Preparation Program"

**TutorStudentsPage.tsx:**
- Add "Materials" button in the student action row (next to "Profile" and "Tests")
- Links to `/tutor/student/${studentId}/gmat-materials`

---

## Phase 6: Test Track Configuration (Optional)

### 6.1 GMAT Section Order

Ensure `2V_section_order` has GMAT entry:

```sql
INSERT INTO "2V_section_order" (test_type, section_order)
VALUES ('GMAT', '["Quantitative Reasoning", "Data Insights", "Verbal Reasoning"]')
ON CONFLICT (test_type) DO UPDATE SET section_order = EXCLUDED.section_order;
```

### 6.2 Test Track Config

Configure timing/navigation for GMAT tests in `2V_test_track_config`:

```sql
INSERT INTO "2V_test_track_config" (test_type, track_type, total_time_minutes, navigation_mode, section_order_mode)
VALUES
  ('GMAT', 'simulazione', 135, 'forward_only', 'mandatory'),
  ('GMAT', 'assessment_iniziale', 135, 'forward_only', 'mandatory'),
  ('GMAT', 'training', NULL, 'back_forward', 'no_sections')
ON CONFLICT (test_type, track_type) DO UPDATE SET
  total_time_minutes = EXCLUDED.total_time_minutes,
  navigation_mode = EXCLUDED.navigation_mode;
```

---

## Critical Files Reference

| Purpose | Path |
|---------|------|
| Question types | `GMAT/sources/questions/types.ts` |
| Question files | `GMAT/sources/questions/QR/`, `VR/`, `DI/` |
| DS Component | `apps/web/src/components/questions/DSQuestion.tsx` |
| GI Component | `apps/web/src/components/questions/GIQuestion.tsx` |
| TA Component | `apps/web/src/components/questions/TAQuestion.tsx` |
| TPA Component | `apps/web/src/components/questions/TPAQuestion.tsx` |
| MSR Component | `apps/web/src/components/questions/MSRQuestion.tsx` |
| MC Component | `apps/web/src/components/questions/MultipleChoiceQuestion.tsx` |
| Test Results | `apps/web/src/pages/TestResultsPage.tsx` |
| Student Home | `apps/web/src/pages/StudentHomePage.tsx` |
| Tutor Students | `apps/web/src/pages/TutorStudentsPage.tsx` |
| Routes | `apps/web/src/App.tsx` |
| Migrations | `supabase/migrations/` (next: 033, 034) |
| Typst template | `GMAT/material/templates/uptoten-template.typ` |
| Curriculum docs | `GMAT/material/education/program/` |

---

## Topic Mapping Reference

| Section | Topic Folder | Display Name |
|---------|--------------|--------------|
| QR | 01-number-properties-arithmetic | Number Properties & Arithmetic |
| QR | 02-algebra | Algebra |
| QR | 03-word-problems | Word Problems |
| QR | 04-statistics-probability | Statistics & Probability |
| QR | 05-percents-ratios-proportions | Percents, Ratios & Proportions |
| DI | 01-data-sufficiency | Data Sufficiency (DS) |
| DI | 02-graphics-interpretation | Graphics Interpretation (GI) |
| DI | 03-table-analysis | Table Analysis (TA) |
| DI | 04-two-part-analysis | Two-Part Analysis (TPA) |
| DI | 05-multi-source-reasoning | Multi-Source Reasoning (MSR) |
| VR | 01-critical-reasoning | Critical Reasoning (CR) |
| VR | 02-reading-comprehension | Reading Comprehension (RC) |

---

## Implementation Order

### Recommended Parallel Tracks

**Track A: Questions (can start immediately)**
1. Update `toDBRow()` in types.ts
2. Create import script
3. Create GMAT Question Pool test record
4. Import first batch of questions
5. Add explanation props to question components
6. Update TestResultsPage

**Track B: Materials (can start in parallel)**
1. Create migrations (033, 034)
2. Deploy to production
3. Compile sample Typst files to PDF
4. Create upload script
5. Create GMATPreparationPage
6. Create GMATMaterialsManagementPage
7. Add routes and navigation

---

## Risk Mitigation

1. **Backup database** before running migrations
2. **Test imports locally** with sample data first
3. **Validate question IDs** - only import questions matching valid ID pattern
4. **Filter old questions** by ID pattern in UI (not delete from database)
5. **Incremental rollout** - questions first, then materials
6. **PDF overwrite** - keep local Typst sources as the master copy

---

## Notes for Future Sessions

- This plan was created in December 2024
- The platform uses React + Vite + Tailwind + Supabase
- Question components follow a consistent pattern (see DSQuestion.tsx)
- UI patterns follow StudentHomePage and StudentTestsPage
- Latest migration number is 035, so new migrations start at 036
- The `test_id` field is required in `2V_questions` - use "Question Pool" test as parent

---

## Phase 7: Question Allocation Integration

> **Added:** January 2026
> **Purpose:** Connect the GMAT Question Allocation system to the actual test-taking flow

### Problem Summary

The GMAT Question Allocation system (created in `GMATQuestionAllocationPage.tsx`) exists in **isolation** from the actual test-taking flow. Admins can allocate questions to cycles (Foundation/Development/Excellence) per template, but **this allocation is never used** when students take tests.

**Critical Issues Identified:**
1. `TakeTestPage.tsx` (lines 2050-2082) fetches ALL GMAT questions when `isGMATAssessmentInitial1=true`, ignoring the allocation
2. No cycle field exists to specify which cycle a student should use
3. No link between test assignments and material templates containing the allocation

### Key Design Decisions

1. **Cycle is GLOBAL per student** - Each student has ONE cycle for all GMAT preparation (stored in dedicated table)
2. **Tutor manually selects cycle** when setting up student's GMAT preparation
3. **Tutor can promote student** to next cycle when ready
4. **Templates are admin-only** - Students never see allocation templates, only their preparation materials
5. **Block test if no allocation** - Don't allow test start if questions aren't allocated for that cycle
6. **Students see their cycle** in GMATPreparationPage
7. **Template auto-matching** - System finds template by parsing test identifier naming convention

### 7.1 Database Schema Changes

**New Migration:** `036_add_gmat_student_tracking.sql`

**Create new table `2V_gmat_student_progress`:**
```sql
CREATE TABLE "2V_gmat_student_progress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  gmat_cycle TEXT NOT NULL CHECK (gmat_cycle IN ('Foundation', 'Development', 'Excellence')),
  seen_question_ids UUID[] DEFAULT '{}',  -- Array of question IDs already seen
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)  -- One record per student
);

-- Index for fast student lookups
CREATE INDEX idx_gmat_progress_student ON "2V_gmat_student_progress"(student_id);

-- Index for checking if a question was seen (using GIN for array)
CREATE INDEX idx_gmat_progress_seen_questions ON "2V_gmat_student_progress" USING GIN(seen_question_ids);

-- RLS Policies
ALTER TABLE "2V_gmat_student_progress" ENABLE ROW LEVEL SECURITY;

-- Students can view their own progress
CREATE POLICY "Students view own progress"
  ON "2V_gmat_student_progress" FOR SELECT
  USING (student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()));

-- Tutors/Admins can manage all progress
CREATE POLICY "Tutors manage progress"
  ON "2V_gmat_student_progress" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );
```

**Benefits of separate table:**
- Clean separation of GMAT-specific data from general profiles
- Can track seen questions efficiently (important for avoiding question repetition)
- Easy to extend with additional GMAT tracking fields in the future
- No changes needed to `2V_test_assignments` - template is auto-matched

### 7.2 Regenerate Database Types

After applying migration:
```bash
cd apps/web
npx supabase gen types typescript --local > database.types.ts
# OR for remote:
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > database.types.ts
```

### 7.3 GMAT Utility Library

**New File:** `apps/web/src/lib/gmat/questionAllocation.ts`

```typescript
import { supabase } from '../supabase';

export type GmatCycle = 'Foundation' | 'Development' | 'Excellence';

export interface CycleAllocation {
  allocated_questions: string[];
  allocated_at: string | null;
}

export interface QuestionAllocation {
  by_cycle: {
    [K in GmatCycle]?: CycleAllocation;
  };
}

// Get allocated question IDs for a specific material template and cycle
export async function getAllocatedQuestionIds(
  materialId: string,
  cycle: GmatCycle
): Promise<string[]>;

// Get question requirements for a material template
export async function getQuestionRequirements(
  materialId: string
): Promise<QuestionRequirements | null>;

// Find matching template by section, topic, and material type
export async function findMatchingTemplate(
  section: string,
  topic: string,
  materialType: string
): Promise<LessonMaterial | null>;

// Parse test identifier to extract section, topic, materialType
// Uses naming convention: e.g., "QR-01-training1" → section='QR', topic='01-...', materialType='training1'
export function parseTestIdentifier(
  testInfo: { section?: string; format?: string; test_number?: number }
): { section: string; topic: string; materialType: string };

// Validate if allocation is complete for all cycles
export function validateAllocation(
  template: LessonMaterial
): { valid: boolean; errors: string[] };
```

### 7.4 GMAT Progress API

**New File:** `apps/web/src/lib/api/gmat.ts`

```typescript
import { supabase } from '../supabase';

export type GmatCycle = 'Foundation' | 'Development' | 'Excellence';

export interface GmatProgress {
  id: string;
  student_id: string;
  gmat_cycle: GmatCycle;
  seen_question_ids: string[];
  created_at: string;
  updated_at: string;
}

// Initialize GMAT preparation for a student
export async function initializeGMATPreparation(
  studentId: string,
  cycle: GmatCycle
): Promise<GmatProgress>;

// Get student's current GMAT progress
export async function getStudentGMATProgress(
  studentId: string
): Promise<GmatProgress | null>;

// Update student's cycle (promotion)
export async function updateStudentGMATCycle(
  studentId: string,
  newCycle: GmatCycle
): Promise<void>;

// Add questions to seen list (called after test completion)
export async function addSeenQuestions(
  studentId: string,
  questionIds: string[]
): Promise<void>;

// Check if student has seen specific questions
export async function getSeenQuestions(
  studentId: string,
  questionIds: string[]
): Promise<string[]>;
```

### 7.5 Update TakeTestPage.tsx

**File:** `apps/web/src/pages/TakeTestPage.tsx` (lines ~2035-2100)

**Changes:**
1. For GMAT tests, get student's cycle from `2V_gmat_student_progress`
2. Parse test identifier to get matching fields (section, topic, materialType)
3. Auto-match template using parsed fields
4. Fetch template's `question_allocation`, get allocated question IDs for student's cycle
5. Fetch only those specific questions from `2V_questions`
6. **Block test start** if no allocation exists
7. After test completion, add question IDs to `seen_question_ids` array

```typescript
// Pseudocode for new logic
if (testType === 'GMAT') {
  // 1. Get student's GMAT progress (cycle + seen questions)
  const gmatProgress = await getStudentGMATProgress(studentId);
  if (!gmatProgress?.gmat_cycle) {
    throw new Error('Student has no GMAT cycle assigned. Please contact your tutor.');
  }

  // 2. Parse test identifier to get matching fields
  const { section, topic, materialType } = parseTestIdentifier(testInfo);

  // 3. Auto-match template based on parsed fields
  const template = await findMatchingTemplate(section, topic, materialType);
  if (!template) {
    throw new Error(`No template found for ${section}-${topic}-${materialType}`);
  }

  // 4. Get allocated questions for this cycle
  const allocatedIds = template.question_allocation?.by_cycle[gmatProgress.gmat_cycle]?.allocated_questions;
  if (!allocatedIds?.length) {
    throw new Error(`No questions allocated for ${gmatProgress.gmat_cycle} cycle`);
  }

  // 5. Fetch only allocated questions
  questions = await fetchQuestionsByIds(allocatedIds);
}

// After test completion:
await addSeenQuestions(studentId, questionIds);
```

### 7.6 Tutor UI for Cycle Management

**Location:** Add section in tutor student management (or new component)

**Features:**
1. **Initialize GMAT Preparation** - Set student's initial cycle (Foundation/Development/Excellence)
2. **View Current Cycle** - Display in student overview
3. **Promote Student** - Button to move from Foundation → Development → Excellence
4. **View Seen Questions** - Show count of questions student has already seen

**When assigning a GMAT test:**
1. Verify student has a cycle assigned (show warning if not)
2. System auto-matches template based on test's naming convention
3. Verify allocation exists for student's cycle (show error if not)

### 7.7 Update GMATPreparationPage

**File:** `apps/web/src/pages/GMATPreparationPage.tsx`

Display student's current cycle prominently:
- Show cycle name (Foundation/Development/Excellence)
- Show target score range (e.g., 505-605 for Foundation)
- Show difficulty distribution they'll encounter

### 7.8 Add Validation to Allocation Page

**File:** `apps/web/src/pages/GMATQuestionAllocationPage.tsx`

Add validation to show warnings when:
- Allocation is incomplete (less questions than required)
- Difficulty distribution doesn't match percentages
- Questions are duplicated across cycles

### Files to Modify

| File | Action | Priority |
|------|--------|----------|
| `supabase/migrations/036_add_gmat_student_tracking.sql` | Create new table | High |
| `apps/web/database.types.ts` | Regenerate after migration | High |
| `apps/web/src/lib/gmat/questionAllocation.ts` | Create utility library | High |
| `apps/web/src/lib/api/gmat.ts` | Create GMAT progress API | High |
| `apps/web/src/pages/TakeTestPage.tsx` | Modify lines 2050-2100 | High |
| Tutor student management page | Add cycle selector/promoter UI | Medium |
| `apps/web/src/pages/GMATPreparationPage.tsx` | Show student's cycle | Medium |
| `apps/web/src/pages/GMATQuestionAllocationPage.tsx` | Add validation warnings | Low |

### Difficulty Distribution Reference

From the program documentation (`GMAT/material/education/program/question-allocation.md`):

**Training Sessions & Topic Assessments:**
| Cycle | Easy | Medium | Hard |
|-------|------|--------|------|
| Foundation | 60% | 30% | 10% |
| Development | 25% | 50% | 25% |
| Excellence | 5% | 30% | 65% |

**Section Assessments & Mocks:**
| Cycle | Easy | Medium | Hard |
|-------|------|--------|------|
| Foundation | 50% | 35% | 15% |
| Development | 20% | 50% | 30% |
| Excellence | 5% | 35% | 60% |

### Verification Strategy

1. **After Migration (7.1-7.2):**
   - Verify `2V_gmat_student_progress` table exists
   - Confirm constraints work (only valid cycle values)
   - Test inserting/updating progress records

2. **After Utility Library (7.3-7.4):**
   - Test `initializeGMATPreparation()` creates record correctly
   - Test `getStudentGMATProgress()` returns correct data
   - Test `parseTestIdentifier()` extracts correct fields
   - Test `findMatchingTemplate()` matches correctly

3. **After TakeTestPage Changes (7.5):**
   - Initialize GMAT preparation for test student (set cycle to Foundation)
   - Ensure template auto-matching works
   - Take test and verify ONLY allocated questions appear
   - Verify question count matches template allocation

4. **End-to-End Test:**
   - Admin has allocated questions to Foundation cycle for template
   - Tutor initializes GMAT preparation for student with cycle=Foundation
   - Tutor assigns test to student
   - System auto-matches to correct template
   - Student takes test
   - Verify only allocated questions appear
   - After completion: verify question IDs added to `seen_question_ids`

5. **Cycle Progression Test:**
   - Tutor promotes student from Foundation to Development
   - Student's next tests use Development-allocated questions
   - Verify difficulty distribution changes

### Backward Compatibility

- Existing GMAT tests without student progress record: Show error message prompting tutor to initialize GMAT preparation
- Template auto-matching: Relies on test identifier naming convention being consistent
- Seen questions tracking: Starts empty, builds up as student takes tests
