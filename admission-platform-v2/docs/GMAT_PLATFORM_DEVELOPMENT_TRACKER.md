# GMAT Platform: Fixes, Enhancements & New Features — Development Tracker

> **Branch:** `gmat-integrations`
> **Started:** 2026-02-16
> **Plan file:** `.claude/plans/inherited-wandering-origami.md`

---

## Progress Tracker

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1A | Verify result saving protections | `DONE` | All protections confirmed present and matching NewCodeTypescript |
| 1B | Time measurement fixes (hooks) | `DONE` | 3 fixes applied across hooks and GMAT pages |
| 1C | VR long passage UI fix | `DONE` | Sticky passage + natural flow, no internal scrollbars — 5 files |
| 2A | Analytics: time management analysis | `REVIEW` | Time tab with BarCharts, pacing indicators |
| 2B | Analytics: category-based analysis | `REVIEW` | Categories tab with groupBy selector + detail table |
| 2C | Analytics: progress over time | `REVIEW` | Progress tab with LineChart, improvement metrics |
| 3A | GMAT Simulation page | `REVIEW` | GMATSimulationPage.tsx created, routes + nav wired |
| 3B | Section assessment IRT display | `PENDING` | Ensure 60-90 scores + percentiles shown |
| 4A | Placement assessment page | `PENDING` | New GMATPlacementAssessmentPage.tsx |
| 4B | Familiarization mock mode | `PENDING` | Guided, no scoring |
| 4C | GMATPreparationPage integration | `PENDING` | New student flow |

**Status legend:** `PENDING` → `IN PROGRESS` → `REVIEW` → `DONE` / `ITERATING`

---

## Step 1A: Verify Result Saving Protections

**Objective:** Confirm that the critical data-integrity protections from NewCodeTypescript are present and working on gmat-integrations.

### Findings

**1. `saveTrainingResult()` — Empty data validation** (`gmat.ts` L1851-1858)
- **Present and correct.** Validates:
  - `answersData` is not null/undefined and has at least one key
  - `questionIds` is not null/undefined and has at least one element
  - Throws descriptive errors on failure
- Matches NewCodeTypescript implementation exactly.

**2. `getTrainingCompletions()` — Result filtering** (`gmat.ts` L1778-1789)
- **Present and correct.** Filters out results where `answers_data` is:
  - null/undefined
  - Empty string (`'{}'` or whitespace)
  - Empty object (`{}`)
- This prevents phantom completion counts from failed saves.
- Matches NewCodeTypescript implementation exactly.

**3. Additional protections already in place:**
- `saveSectionAssessmentResult()` (L1137-1191) — accepts answersData and saves it
- `savePlacementAssessmentResult()` (L854-898) — saves with proper validation
- `saveMockSimulationResult()` (L1520-1585) — saves with section breakdown
- RPC-based save for training (`save_gmat_training_result`) bypasses RLS safely

### Verdict
**No code changes needed.** All critical protections are already ported to gmat-integrations.

---

## Step 1B: Time Measurement Fixes

### Analysis

**`useTestTimer.ts`** — Already solid, no changes needed:
- Defensive `clearInterval` at top of effect (L116-120) before creating new interval
- `isMountedRef` check inside interval callback (L130-136)
- Clean unmount cleanup (L99-105) and effect cleanup (L158-163)
- `timeRemaining` NOT in deps (L164) — avoids interval recreation on every tick

**`useAnswerManagement.ts`** — One fix applied:
- `questionStartTimes` useEffect (L186-194) only triggered on `currentQuestion.id` change
- In `back_forward` mode, revisiting the same question wouldn't re-trigger the effect since the ID hasn't changed, but the start time was deleted by the previous save
- **Fix:** Added `currentQuestionIndex` to the dependency array so start time is always reset on navigation

**`GMATTrainingTestPage.tsx` and `GMATSectionAssessmentPage.tsx`** — One fix applied to each:
- `goToQuestion()` only accumulated time for questions that had an existing answer
- If a student viewed a question but didn't answer (e.g., during review phase), the viewing time was lost
- **Fix:** Now tracks time even for unanswered questions by creating an `__UNANSWERED__` entry with the accumulated time

### Files Modified
- `components/hooks/useAnswerManagement.ts` — L186-194: added `currentQuestionIndex` to deps
- `pages/GMATTrainingTestPage.tsx` — `goToQuestion()`: track time for unanswered questions
- `pages/GMATSectionAssessmentPage.tsx` — `goToQuestion()`: track time for unanswered questions

---

## Step 1C: VR Long Passage UI Fix

### Problem
Verbal Reasoning Reading Comprehension questions include long passages (200-350+ words). The previous layout used `max-h-[650px] overflow-y-auto` inside a `sticky top-4` panel, sitting within an already-scrollable parent container. This created **nested scrollbars** — the student had to scroll inside the passage panel AND scroll the outer page, making the UX confusing and hard to navigate.

### Root Cause
The layout hierarchy was:
```
h-screen flex flex-col overflow-hidden
  └─ flex-1 overflow-auto p-4          ← outer scroll
       └─ max-w-4xl mx-auto            ← too narrow for split layout
            └─ bg-white rounded-2xl p-5
                 └─ flex gap-8
                      ├─ passage: sticky top-4, max-h-[650px] overflow-y-auto  ← inner scroll (BAD)
                      └─ question + options
```

Two issues:
1. **Nested scrolling** — passage had its own scrollbar inside an already-scrollable parent
2. **Narrow container** — `max-w-4xl` (896px) forced two side-by-side panels into a cramped space

### Solution — Sticky Passage, No Internal Scrollbars

Zero internal scrollviews. The passage sticks on the left while the outer page scrolls naturally:

**Passage panel (left):**
- `sticky top-4 self-start` — stays pinned as user scrolls
- No `overflow-y-auto` or `max-h` — renders at full content height
- Constrained to `min-w-[42%] max-w-[50%]` for balanced split

**Question panel (right):**
- Natural flow, no overflow constraints — content height drives the outer page scroll
- Width matches with `min-w-[42%]`

**Parent containers:**
- Widened from `max-w-4xl` to `max-w-7xl` when passage is detected
- This gives the split-panel adequate room (~1280px vs 896px)
- Non-passage questions still use `max-w-4xl` for optimal reading width

### Files Modified
- `components/questions/MultipleChoiceQuestion.tsx` — L44-62: replaced passage layout with split-panel
- `components/test/QuestionRenderer.tsx` — L413-430: same fix for `open_ended` passage layout
- `pages/GMATTrainingTestPage.tsx` — L690-693: added `hasPassage` detection; L1481, L1681: conditional `max-w-7xl`
- `pages/GMATSectionAssessmentPage.tsx` — L724-727: added `hasPassage` detection; L1497, L1695: conditional `max-w-7xl`
- `pages/TakeTestPage.tsx` — L4113-4114: cleaned up passage detection, aligned to `max-w-7xl`

### Verification Checklist
- [ ] VR Reading Comprehension: both panels scroll independently, no nested scrollbars
- [ ] Long passage (300+ words): passage scrollable, question/options visible without outer scrolling
- [ ] QR/DI questions (no passage): still render centered in `max-w-4xl` — no visual regression
- [ ] Review phase: passage questions still display correctly with wider container
- [ ] Multiple viewport sizes (laptop 1366px, desktop 1920px): layout adapts properly

---

## Step 2A-2C: Analytics Enhancement

### Overview
Complete rewrite of `GMATAnalyticsModal` from a single-page view to a **4-tab analytics dashboard**:
- **Overview** — original content (progress counters, section scores, strengths/weaknesses)
- **Time** — per-question timing analysis, pacing indicators, time vs accuracy
- **Categories** — breakdown by section/question type/difficulty with accuracy charts
- **Progress** — score trend over time with improvement metrics

### Architecture

**Data layer:**
- New `getAnalyticsData()` in `gmat.ts` — fetches ALL `2V_gmat_assessment_results` rows + question metadata from `2V_questions`
- Returns `GmatAnalyticsData { allResults, questionMetadata: Map<string, QuestionMetadata> }`
- Question metadata includes: section, difficulty, question_type, di_type, categories
- Data loaded lazily in `GMATPreparationPage` — only when analytics tab is active

**Aggregation:**
- `aggregateQuestionData()` flattens all `answers_data` entries across results into `QuestionTimingEntry[]`
- Each entry has: questionId, timeSpent, isCorrect, section, difficulty, questionType, diType, categories
- Skips `is_unanswered` entries from the Step 1B time tracking fix

**Charts (recharts):**
- Time tab: Horizontal BarChart (avg time by section), dual-axis BarChart (time distribution + accuracy)
- Categories tab: Horizontal BarChart (accuracy by category, color-coded), detail table
- Progress tab: LineChart (score trend over time), improvement summary cards

### Tab Details

**2A — Time Tab:**
- Summary cards: avg time/question, slow questions (>2x avg), quick questions (<0.5x avg)
- Average Time by Section: horizontal bar chart
- Time Distribution & Accuracy: bucketed (0-30s, 30-60s, 60-90s, 90-120s, 120s+) with accuracy overlay

**2B — Categories Tab:**
- Group-by selector: Section | Type | Difficulty
- Horizontal bar chart showing accuracy per category (green >70%, amber 50-70%, red <50%)
- Detail table: category, question count, correct, accuracy %, avg time

**2C — Progress Tab:**
- Improvement summary: first tests avg vs recent tests avg, with delta
- Score trend LineChart showing all training + section assessment scores chronologically

### Files Modified
- `lib/api/gmat.ts` — added `getAnalyticsData()`, `QuestionMetadata`, `GmatAnalyticsData` types
- `components/GMATAnalyticsModal.tsx` — complete rewrite with tab navigation + 3 new tab components
- `pages/GMATPreparationPage.tsx` — added lazy analytics data loading, pass `analyticsData` prop

### Verification Checklist
- [ ] Overview tab: same content as before, no regression
- [ ] Time tab: shows timing data when test results have `answers_data` with `time_spent_seconds`
- [ ] Categories tab: groupBy buttons switch between section/type/difficulty
- [ ] Progress tab: line chart renders with 2+ scored results
- [ ] Empty states: each tab shows appropriate message when no data
- [ ] Lazy loading: analytics data only fetched when analytics tab is active
- [ ] Modal mode (showAnalyticsModal): tabs work correctly in modal wrapper too

---

## Step 3A: GMAT Simulation Page

### Overview
Created `GMATSimulationPage.tsx` — a full GMAT mock test page with 3 sequential sections (QR → DI → VR), per-section timers, IRT scoring, crash recovery, and a comprehensive results display.

### Architecture
Follows `GMATSectionAssessmentPage.tsx` patterns but extended for multi-section sequential flow.

**5-phase page lifecycle:**
1. **Loading** — Auth check, `simulation_unlocked` gate, fetch questions via `getMockSimulationQuestions()`, load full question data from `2V_questions`
2. **Test-taking** — Per-section timer (45 min each), forward-only navigation, bookmark support, calculator for DI section, passage detection for container widening
3. **Section review** — Grid view of answered/unanswered/bookmarked within current section, ability to revisit questions, complete section to proceed
4. **Section transition** — Summary screen showing completed section, progress dots, next section info with question count + time, "Continue" button
5. **Results** — GMAT score card (205-805), section scores (60-90) with percentiles, difficulty breakdown table, filterable question review

### API Enhancement
`saveMockSimulationResult()` in `gmat.ts` now accepts optional `answersData` and `bookmarkedQuestionIds` parameters, enabling per-question analytics and question review in results.

### Files Created
- `pages/GMATSimulationPage.tsx` — Full simulation test page (~1100 lines)

### Files Modified
- `lib/api/gmat.ts` — `saveMockSimulationResult()`: added `answersData` + `bookmarkedQuestionIds` params, added to Supabase insert
- `App.tsx` — Added routes: `/student/take-test/gmat-simulation` and `/tutor/take-test/gmat-simulation`
- `pages/GMATPreparationPage.tsx` — Wired "Start Simulation" and "New Simulation" buttons to navigate to simulation page

### Key Features
- **IRT Scoring:** Uses `GmatScoringAlgorithm.calculateFromThetas()` for full GMAT scoring after all 3 sections
- **Crash Recovery:** `useTestProgress` with `customData` storing `currentSectionIndex` and `sectionCompleted` array
- **Auto-lock:** Calls `lockSimulation(studentId)` after successful submission — tutor must re-unlock for next attempt
- **Timer Reset:** `setTimeRemaining(45*60)` between sections via `useTestTimer` hook
- **DI Calculator:** `GMATCalculator` shown only during DI section
- **Passage Layout:** Same `hasPassage` detection + `max-w-7xl` widening as other GMAT pages

### Reused Components
`QuestionRenderer`, `TestTimerCompact`, `TimeUpModal`, `GMATCalculator`, `MathJaxProvider`, `Layout`, `useTestTimer`, `useTestProgress`

### Verification Checklist
- [ ] Pre-start screen: shows section breakdown, timing info, start/back buttons
- [ ] QR section: forward-only navigation, bookmark toggle, timer counting down from 45:00
- [ ] Section review: grid with answered/unanswered indicators, bookmarked questions flagged
- [ ] Section transition: shows completed section, progress, next section info
- [ ] DI section: calculator button appears, functions correctly
- [ ] VR section: passage questions use wider container layout
- [ ] Time expiry: TimeUpModal appears, auto-completes section on submit
- [ ] Results: total GMAT score (205-805), section scores (60-90), percentiles, difficulty breakdown
- [ ] Question review: filterable by section/correctness/bookmarked, shows correct answers
- [ ] Crash recovery: resume modal appears with section/question/time info
- [ ] Simulation lock: locked after completion, error message if trying to access when locked
- [ ] Navigation: "Start Simulation" and "New Simulation" buttons in GMATPreparationPage navigate correctly

---

## Step 3B: Section Assessment IRT Display Enhancement

*(To be filled after implementation)*

---

## Step 4A-4C: Initial Assessment

*(To be filled after implementation)*
