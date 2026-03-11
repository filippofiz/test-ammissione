# TakeTestPage — Living Documentation

> **Single source of truth** for the post-refactor TakeTestPage system.
> File: `src/pages/TakeTestPage.tsx` (~2,000 lines after refactor)

---

## Table of Contents

1. [What It Is](#1-what-it-is)
2. [Architecture Overview](#2-architecture-overview)
3. [File Structure](#3-file-structure)
4. [URL Params & Mode Detection](#4-url-params--mode-detection)
5. [Types (extracted)](#5-types-extracted)
6. [State in TakeTestPageInner](#6-state-in-taketestpageinner)
7. [Refs in TakeTestPageInner](#7-refs-in-taketestpageinner)
8. [Hooks — Call Order & Contracts](#8-hooks--call-order--contracts)
9. [Derived / Computed Values](#9-derived--computed-values)
10. [Functions inside TakeTestPageInner](#10-functions-inside-taketestpageinner)
11. [Callback Registration (TestContext)](#11-callback-registration-testcontext)
12. [Rendering — Screen Router](#12-rendering--screen-router)
13. [Rendering — Main Test Interface](#13-rendering--main-test-interface)
14. [Rendering — PDF Test Interface](#14-rendering--pdf-test-interface)
15. [Extracted Hooks — Deep Reference](#15-extracted-hooks--deep-reference)
16. [Extracted Utilities — Deep Reference](#16-extracted-utilities--deep-reference)
17. [Database Tables Accessed](#17-database-tables-accessed)
18. [Known Remaining Issues](#18-known-remaining-issues)

---

## 1. What It Is

A universal React page that handles the **full lifecycle of taking any test** on the platform. Entirely config-driven — the same component handles GMAT, SAT, TOLC, and any other type via `TestConfig` from the `2V_test_track_config` table.

**Capabilities:**
- Loading test data (questions, config, existing in-progress answers)
- Pre-test start screen with device diagnostics
- Section order selection (drag-and-drop for `user_choice` mode)
- Per-section or total-test timer (with special needs 30% extra)
- Answer capture (all DI types: DS, GI, TA, TPA, MSR; legacy formats; open-ended)
- Auto-saving answers to Supabase with debounce and network monitoring
- Adaptive testing (simple difficulty-based and IRT/CAT algorithms)
- GMAT Data Insights subtype balancing (DS, GI, TA, TPA, MSR minimum counts)
- Review & Edit mode (GMAT-style bookmarks + max answer-change limit)
- Pause management (mandatory between-sections, user-choice, section transitions)
- Fullscreen enforcement and proctoring (exit warning countdown, annulment)
- Multiple screen detection
- Test submission with metadata persistence
- Preview mode (admins only — read-only, no DB writes)
- Guided mode (correct answers shown on demand)
- PDF test format
- External student result sync on completion

---

## 2. Architecture Overview

```
TakeTestPage (default export)
└── TestContextProvider          ← provides stable callback forwarders
    └── TakeTestPageInner        ← all logic lives here (~2000 lines)
        ├── useTestContext()     ← consume stable forwarders + registerCallbacks
        ├── useTestTimer()
        ├── useTestDataLoader()  ← config, questions, answers, student state
        ├── useAdaptiveTesting() ← adaptive algorithm bridge
        ├── usePauseManagement()
        ├── useTestProctoring()
        ├── useReviewMode()
        ├── useAnswerManagement()
        └── useSaveCompletionDetails()
```

**Key design principle — TestContext solves the chicken-and-egg problem:**
Hooks (timer, proctoring, pause management, review mode) need to *call* functions (`handleTimeUp`, `completeSection`, `moveToNextSection`, `onAnnulTest`) that are defined *after* the hooks are initialised. `TestContext` provides stable ref-backed forwarders that hooks can call at init time; `registerCallbacks()` then points the refs at the real implementations once they're defined.

---

## 3. File Structure

```
src/
├── pages/
│   └── TakeTestPage.tsx                  ← orchestrator (~2000 lines)
│
├── types/
│   └── test.ts                           ← all shared interfaces (8 types)
│
├── lib/utils/
│   ├── sectionUtils.ts                   ← getSectionField, formatSectionName,
│   │                                        calculateSectionQuestionLimit,
│   │                                        calculateExpectedTotalSections,
│   │                                        filterSectionsWithAdaptivity
│   └── questionPreparation.ts            ← prepareInitialQuestions (called inside useTestDataLoader)
│
├── components/
│   ├── test/
│   │   ├── AnswerRequiredModal.tsx        ← extracted modal
│   │   ├── ChangeBlockedToast.tsx         ← extracted toast
│   │   ├── SubmittingOverlay.tsx          ← extracted overlay
│   │   ├── QuestionRenderer.tsx           ← handles ALL question formats (modern + legacy)
│   │   ├── TestHeader.tsx
│   │   ├── NavigationControls.tsx
│   │   ├── ReviewScreen.tsx
│   │   ├── MultiQuestionView.tsx
│   │   ├── SectionSelectionScreen.tsx
│   │   ├── TestStartScreen.tsx
│   │   ├── TestLockedScreen.tsx
│   │   ├── TestAnnulledScreen.tsx
│   │   ├── ExitWarningScreen.tsx
│   │   └── SectionTransition.tsx         ← SectionCompleted, PauseChoice, PauseScreen, TestCompleted
│   │
│   └── hooks/
│       ├── useTestContext.tsx             ← TestContextProvider + useTestContext
│       ├── useTestDataLoader.ts           ← loadTestData + loadPreviewData logic
│       ├── useAdaptiveTesting.ts          ← adaptive question selection bridge
│       ├── useSaveCompletionDetails.ts    ← completion metadata persistence
│       ├── useTestTimer.ts
│       ├── useAnswerManagement.ts
│       ├── useReviewMode.ts
│       ├── usePauseManagement.ts
│       └── useTestProctoring.ts
```

---

## 4. URL Params & Mode Detection

```
Route: /take-test/:assignmentId
Route: /preview-test/:testId/:startQuestionNumber
```

**From `useParams`:**
| Param | Used When |
|-------|-----------|
| `assignmentId` | Real test mode |
| `testId` | Preview mode |
| `startQuestionNumber` | Preview mode — first question to show |

**From `window.location` / `URLSearchParams`:**
| Variable | Detection | Meaning |
|----------|-----------|---------|
| `isPreviewMode` | `pathname.startsWith('/preview-test')` | Admin preview — no DB writes |
| `previewTestId` | `isPreviewMode ? (testId ?? null) : null` | `string \| null` |
| `previewStartQuestion` | `parseInt(startQuestionNumber \|\| '1', 10)` | number, default 1 |
| `isTestMode` | `?testMode=true` | Uses `_test` suffix DB tables |
| `isGuidedMode` | `?guided=true` | Shows correct answers toggle |
| `guidedTimed` | `?timed=false` → false, default true | Whether timer runs in guided mode |

**Database client selection:**
```ts
const db = isTestMode ? supabaseTest : supabase;
// isTestMode uses 2V_test_assignments_test, 2V_student_answers_test, etc.
```

---

## 5. Types (extracted)

All defined in `src/types/test.ts` and imported by TakeTestPage and all hooks.

### `TestConfig`
Config from `2V_test_track_config`. Controls all test behaviour.

| Field | Type | Description |
|-------|------|-------------|
| `test_type` | string | e.g. `'GMAT'`, `'SAT'`, `'TOLC'` |
| `track_type` | string | exercise type track |
| `section_order_mode` | enum | `'mandatory'` \| `'user_choice'` \| `'no_sections'` \| `'mandatory_macro_sections'` \| `'user_choice_macro_sections'` |
| `section_order` | `string[] \| null` | Ordered list of sections in config |
| `time_per_section` | `Record<string, number> \| null` | Minutes per section |
| `total_time_minutes` | `number \| null` | Total test time (fallback) |
| `navigation_mode` | `'forward_only' \| 'back_forward'` | Within-section nav |
| `navigation_between_sections` | `'forward_only' \| 'back_forward'` | Between-section nav |
| `can_leave_blank` | `boolean \| null` | If false, answer required before Next |
| `pause_mode` | `'no_pause' \| 'between_sections' \| 'user_choice'` | |
| `pause_sections` | `string[] \| null` | Which sections trigger mandatory pause |
| `pause_duration_minutes` | number | Pause length |
| `max_pauses` | number? | Max pauses allowed (user_choice mode) |
| `test_start_message` | string? | Welcome message (English) |
| `messaggio_iniziale_test` | string? | Welcome message (Italian) |
| `calculator_type` | `'none' \| 'regular' \| 'graphing' \| 'scientific'` | |
| `question_order` | `'random' \| 'sequential'` | |
| `adaptivity_mode` | `'adaptive' \| 'non_adaptive' \| 'static'` | |
| `use_base_questions` | boolean? | Whether to start with baseline questions |
| `base_questions_scope` | `'per_section' \| 'entire_test'` | |
| `base_questions_count` | number? | How many baseline questions |
| `algorithm_type` | `'simple' \| 'complex'` | |
| `baseline_difficulty` | `number \| string` | Difficulty for baseline questions |
| `questions_per_section` | `Record<string, number>` | Per-section question limit (adaptive) |
| `total_questions` | number? | Total question limit (single-section tests) |
| `section_adaptivity_config` | `Record<string, { type: 'base' \| 'adaptive'; difficulty?: string }>` | Macro section adaptivity |
| `allow_review_at_end` | boolean? | GMAT review mode |
| `allow_bookmarks` | boolean? | Bookmark questions |
| `max_answer_changes` | number? | Max answer changes in review mode |
| `max_questions_to_review` | `number \| null` | |
| `algorithm_id` | string? | References `2V_algorithm_config` |
| `questions_per_page` | number? | Multi-question per page mode |

### `Question`
From `2V_questions` table.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | UUID |
| `test_type` | string | |
| `section` | string | Section name |
| `macro_section` | string? | Used in macro_sections mode |
| `question_number` | number | |
| `question_type` | string | `'multiple_choice'`, `'open_ended'`, etc. |
| `difficulty` | `string \| number` | `'easy'`/`'medium'`/`'hard'` or 1/2/3 |
| `is_base` | boolean? | Marked during adaptive baseline selection |
| `question_data` | object | Nested JSON — format varies by DI type |
| `answers` | `{ correct_answer: string[]; wrong_answers: string[] }` | |
| `question_text` | string? | Legacy field |
| `answer_a/b/c/d/e` | `string \| null` | Legacy answer options |
| `correct_answer` | string? | Legacy correct answer field |
| `topic` | string? | |

**`question_data` sub-fields by DI type:**
- **DS** (Data Sufficiency): `problem`, `statement1`, `statement2`
- **MSR** (Multi-Source Reasoning): `sources[]` (tab_name, content_type, content/table_data), `questions[]`
- **GI** (Graphical Interpretation): `chart_config`, `context_text`, `blank1_options[]`, `blank2_options[]`, `statement_text`
- **TA** (Table Analysis): `table_data[][]`, `table_title`, `column_headers[]`, `statements[]` (text, is_true)
- **TPA** (Two-Part Analysis): `scenario`, `column1_title`, `column2_title`, `shared_options[]`
- **Common**: `di_type`, `image_url`, `image_url_eng`, `question`/`question_text`/`question_text_eng`, `options`, `options_eng`, `passage_text`, `passage_text_eng`, `choices[]` (label, text)
- **PDF**: `pdf_url`, `page_number`

### `StudentAnswer`
In-memory answer for one question.
```ts
{
  questionId: string;
  answer: string | null;        // Simple (A/B/C/D/E) or null
  timeSpent: number;            // Seconds
  flagged: boolean;             // "Report issue" flag
  msrAnswers?: string[];        // MSR: one per sub-question
  blank1?: string;              // GI: first dropdown
  blank2?: string;              // GI: second dropdown
  taAnswers?: Record<number, 'true' | 'false'>; // TA: per row
  column1?: string;             // TPA: left column
  column2?: string;             // TPA: right column
}
```

### `JsonbAnswer`
DB storage format.
```ts
| { answers: string[] }                                       // MSR
| { answers: { part1: string | null; part2: string | null } } // GI / TPA
| { answers: Record<number, 'true' | 'false'> }               // TA
| { answer: string | null }                                    // Simple
```

### `AttemptData`
Stored in `completion_details.attempts[]` in the assignment row.
```ts
{
  attempt_number: number;
  status: 'completed' | 'incomplete' | 'annulled';
  reason: 'submitted' | 'time_expired' | 'fullscreen_exit' | 'multiple_screens' | 'browser_closed';
  annulment_reason?: string | null;
  started_at: string;           // ISO timestamp
  completed_at: string;
  browser_info: string;
  screen_resolution: string;    // "1920x1080"
  timestamp: string;
  pause_events?: PauseEvent[];
  test_config?: Record<string, unknown>;
  sections_completed?: string[];
  section_times?: Record<string, number>;
  total_questions?: number;
  questions_answered?: number;
  device_diagnostics?: { connection_latency_ms, connection_status, performance_benchmark_ms, performance_status, overall_status, tested_at };
  gmat_scoring?: { section_thetas: Record<string, { theta: number; se: number }>; algorithm_version: string; };
}
```

### Other types
- `TestInfo` — `{ id, test_type, exercise_type, format, test_number?, section?, materia? }`
- `AlgorithmConfig` — from `2V_algorithm_config`; fields for simple/IRT config
- `TestAssignment` — from `2V_test_assignments` with joined test info
- `DbStudentAnswer` — answer row from `2V_student_answers`

---

## 6. State in TakeTestPageInner

### Owned directly by TakeTestPageInner

| State | Type | Description |
|-------|------|-------------|
| `submitting` | boolean | Test submission in progress |
| `currentSectionIndex` | number | Index into `sections[]` |
| `currentPageGroup` | number | PDF tests: current page group index |
| `showSectionSelectionScreen` | boolean | Show drag-and-drop section order screen |
| `showCompletionScreen` | boolean | Show test completed screen |
| `showCorrectAnswers` | boolean | Guided mode: toggle correct answer display |
| `timerActive` | boolean | Whether timer countdown is running |
| `testStartTime` | `Date \| null` | When test was started |
| `sectionStartTime` | `Date \| null` | When current section started |
| `userSelectedSections` | `string[]` | User's chosen section order (user_choice mode) |
| `draggedSectionIndex` | `number \| null` | For drag interaction during section selection |
| `deviceDiagnostics` | object \| null | Passed to start screen and saved in attempt metadata |

### Delegated to `useTestDataLoader` (returned and destructured)

| State | Type | Description |
|-------|------|-------------|
| `loading` | boolean | Initial data fetching |
| `isLocked` | boolean | Test is locked (completed) |
| `config` | `TestConfig \| null` | Full test config |
| `sections` | `string[]` | Active sections for this run |
| `setSections` | setter | Used by `moveToNextSection` (macro adaptivity) |
| `allQuestions` | `Question[]` | All loaded questions |
| `questionPool` | `Question[]` | Full pool (adaptive) — superset of selectedQuestions |
| `selectedQuestions` | `Question[]` | Currently shown questions |
| `setSelectedQuestions` | setter | Used by adaptive navigation |
| `adaptiveAlgorithm` | `SimpleAdaptiveAlgorithm \| ComplexAdaptiveAlgorithm \| null` | |
| `studentId` | `string \| null` | |
| `currentAttempt` | number | Current attempt number |
| `setCurrentAttempt` | setter | Used by `startTest` when restarting |
| `hasSpecialNeeds` | boolean | 30% extra time |
| `exerciseType` | string | e.g. "Simulazione" |
| `isPDFTest` | boolean | True if `format === 'pdf'` |
| `answers` | `Record<string, StudentAnswer>` | In-memory answers map |
| `setAnswers` | setter | |
| `globalQuestionOrder` | number | Global counter for DB `question_order` field |
| `setGlobalQuestionOrder` | setter | |
| `currentQuestionIndex` | number | Index within current section |
| `setCurrentQuestionIndex` | setter | |
| `showStartScreen` | boolean | |
| `setShowStartScreen` | setter | |
| `testLanguage` | string | Language captured at test start |
| `setTestLanguage` | setter | |

---

## 7. Refs in TakeTestPageInner

| Ref | Owner | Purpose |
|-----|-------|---------|
| `sectionThetasRef` | TakeTestPage | GMAT IRT per-section theta scores. Shared with `useAdaptiveTesting` (written there) and `useSaveCompletionDetails` (read at submit) |
| `isCompletingSectionRef` | TakeTestPage | Synchronous guard preventing double `completeSection()` calls |
| `currentSectionIndexRef` | TakeTestPage | Synced copy of `currentSectionIndex` for use in timer/proctoring callbacks (avoids stale state) |
| `autoSaveTimeoutRef` | `useAnswerManagement` | Cancelled before immediate saves |
| `answersRef` | `useAnswerManagement` | Latest answers for use in stale-closure callbacks (submitTest) |
| `globalQuestionOrderRef` | `useAnswerManagement` | Latest order for stale-closure callbacks |
| `currentQuestionIdRef` | `useAnswerManagement` | Latest question ID for stale-closure callbacks |
| `isInReviewModeRef` | `useReviewMode` | Read by `handleTimeUp` for stale-closure-safe check |
| `showReviewScreenRef` | `useReviewMode` | Same |
| `pauseChoiceMadeRef` | `usePauseManagement` | Prevents double choice in StrictMode |
| `showPauseChoiceRef` | `usePauseManagement` | Persists pause choice state across StrictMode remounts |
| `pausesUsedRef` | `usePauseManagement` | Read by `completeSection` for stale-closure-safe count |

---

## 8. Hooks — Call Order & Contracts

Hooks are called in this order (order matters — some depend on values from previous hooks):

### 1. `useTestContext()`
```
Source:  components/hooks/useTestContext.tsx
Returns: { registerCallbacks, completeSection, moveToNextSection, handleTimeUp, onAnnulTest }
```
`completeSection`, `moveToNextSection`, `handleTimeUp`, `onAnnulTest` are **stable forwarders** — safe to pass to subsequent hooks even though the real implementations don't exist yet. `registerCallbacks` wires the real implementations via a `useEffect` at the end of the component.

### 2. `useTestTimer()`
```
Source:  components/hooks/useTestTimer.ts
Input:   { initialSeconds: null, isActive: timerActive, onTimeUp: handleTimeUpCb }
Returns: { timeRemaining, setTimeRemaining }
```
`onTimeUp` receives the stable forwarder from TestContext. Must be called before `useTestDataLoader` since it provides `setTimeRemaining` which the loader uses to initialise the timer.

### 3. `useTestDataLoader()`
```
Source:  components/hooks/useTestDataLoader.ts
Input:   { assignmentId, isPreviewMode, previewTestId, previewStartQuestion,
           isTestMode, isGuidedMode, guidedTimed, db, i18n, deviceDiagnostics,
           setTimeRemaining, setTimerActive }
Returns: loading, isLocked, config, sections, setSections,
         allQuestions, questionPool, selectedQuestions, setSelectedQuestions,
         adaptiveAlgorithm, studentId, currentAttempt, setCurrentAttempt,
         hasSpecialNeeds, exerciseType, isPDFTest,
         answers, setAnswers, globalQuestionOrder, setGlobalQuestionOrder,
         currentQuestionIndex, setCurrentQuestionIndex,
         showStartScreen, setShowStartScreen, testLanguage, setTestLanguage
```

### 4. `useAdaptiveTesting()`
```
Source:  components/hooks/useAdaptiveTesting.ts
Input:   { config, currentSection, currentQuestionIndex, globalQuestionOrder,
           selectedQuestions, questionPool, answers, adaptiveAlgorithm, sectionThetasRef }
Returns: { selectNextAdaptiveAction, prepareBaseQuestionsForSection }
```
`selectNextAdaptiveAction()` — async, called from `goToNextQuestion`. Returns `AdaptiveAction`:
- `{ type: 'advance', newIndex, newGlobalOrder }` — move forward (base phase)
- `{ type: 'add_and_advance', questions, newIndex, newGlobalOrder }` — add new question(s) then advance
- `{ type: 'complete_section' }` — section limit reached or pool exhausted
- `{ type: 'no_op' }` — no action needed

`prepareBaseQuestionsForSection(nextSection, completedSection)` — called from `moveToNextSection`. Captures GMAT IRT theta for the completed section, resets the algorithm for the new section, and returns the baseline questions array to append to `selectedQuestions`.

### 5. `usePauseManagement()`
```
Source:  components/hooks/usePauseManagement.ts
Input:   { config, currentSection, currentSectionIndexRef, assignmentId,
           currentAttempt, supabase, moveToNextSection: moveToNextSectionCb }
Returns: showPauseScreen, setShowPauseScreen, showPauseChoiceScreen, setShowPauseChoiceScreen,
         pauseTimeRemaining, setPauseTimeRemaining, pausesUsed, pauseEvents,
         pauseChoiceCountdown, setPauseChoiceCountdown, setPauseChoiceTrigger,
         showSectionTransition, setShowSectionTransition, sectionTransitionCountdown,
         isTransitioning, setIsTransitioning,
         pauseChoiceMadeRef, showPauseChoiceRef, pausesUsedRef,
         handleTakePause, handleSkipPause, handleSectionTransitionComplete
```
`moveToNextSection` receives the stable forwarder from TestContext.

### 6. `useTestProctoring()`
```
Source:  components/hooks/useTestProctoring.ts
Input:   { isGuidedMode, showStartScreen, showSectionSelectionScreen,
           showPauseScreen, showPauseChoiceScreen, showCompletionScreen,
           onAnnulTest: onAnnulTestCb }
Returns: testAnnulled, showExitWarning, exitCountdown, multipleScreensDetected,
         enterFullscreen, handleStayInTest, handleConfirmExit, checkMultipleScreens
```
`onAnnulTest` receives the stable forwarder from TestContext.

### 7. `useReviewMode()`
```
Source:  components/hooks/useReviewMode.ts
Input:   { timeRemaining, answers, currentSectionQuestions: sectionQuestions,
           setCurrentQuestionIndex, onCompleteSection: completeSectionCb }
Returns: bookmarkedQuestions, showReviewScreen, answerChangesUsed, isInReviewMode,
         setAnswerChangesUsed, setShowReviewScreen, setIsInReviewMode,
         isInReviewModeRef, showReviewScreenRef,
         toggleBookmark, enterReviewMode, goToQuestionFromReview,
         returnToReviewScreen, completeReview
```
`onCompleteSection` receives the stable forwarder from TestContext.

### 8. `useAnswerManagement()`
```
Source:  components/hooks/useAnswerManagement.ts
Input:   { answers, setAnswers, currentQuestion, currentQuestionIndex,
           globalQuestionOrder, studentId, currentAttempt, config,
           timeRemaining, isTransitioning, isPreviewMode, isTestMode,
           isGuidedMode, guidedTimed, assignmentId, adaptiveAlgorithm,
           db, isInReviewMode, answerChangesUsed, setAnswerChangesUsed }
Returns: isSaving, saveError, showAnswerRequiredMessage, setShowAnswerRequiredMessage,
         isPartialAnswer, setIsPartialAnswer, showChangeBlockedMessage,
         sectionTimes, setSectionTimes, saveAnswer, handleRendererAnswerChange,
         toUnifiedAnswer, toggleFlag,
         autoSaveTimeoutRef, answersRef, globalQuestionOrderRef, currentQuestionIdRef
```

### 9. `useSaveCompletionDetails()`
```
Source:  components/hooks/useSaveCompletionDetails.ts
Input:   { assignmentId, currentAttempt, config, deviceDiagnostics,
           testStartTime, sectionStartTime, currentSection, sectionTimes,
           pauseEvents, sections, selectedQuestions, answers, sectionThetasRef }
Returns: { saveCompletionDetails }
```
`saveCompletionDetails(status, reason, annulmentReason?)` — async, returns boolean.

---

## 9. Derived / Computed Values

Computed inline (no `useState`):

| Value | Computation |
|-------|-------------|
| `currentSection` | `sections[currentSectionIndex]` |
| `formatSectionNameBound` | `(name) => formatSectionName(name, exerciseType)` |
| `expectedTotalSections` | `calculateExpectedTotalSections(config, sections)` — base sections × 2 if macro adaptivity |
| `questionsToUse` | `selectedQuestions.length > 0 ? selectedQuestions : allQuestions` |
| `sectionQuestions` | `no_sections` mode → all; else filter `questionsToUse` by `getSectionField === currentSection` |
| `currentQuestion` | `sectionQuestions[currentQuestionIndex]` |
| `totalQuestionsInSection` | `sectionQuestions.length` |
| `questionsPerPage` | `config?.questions_per_page > 1 ? ... : 1` |
| `isMultiQuestionPage` | `questionsPerPage > 1` |
| `currentPageIndex` | `Math.floor(currentQuestionIndex / questionsPerPage)` |
| `currentPageStartIndex` | `currentPageIndex * questionsPerPage` |
| `currentPageQuestions` | Slice of `sectionQuestions` for current page |
| `sectionQuestionLimit` | `calculateSectionQuestionLimit(config, currentSection, totalQuestionsInSection)` |

---

## 10. Functions inside TakeTestPageInner

### `getSectionTimeSeconds(sectionOverride?): number | null`
Calculates timer seconds for a section:
1. Returns `null` if `isGuidedMode && !guidedTimed`
2. Tries `config.time_per_section[section]`
3. If not found and section ends with `-Easy`/`-Hard`, strips suffix and retries
4. Falls back to `total_time_minutes / sections.length`
5. Applies 30% multiplier if `hasSpecialNeeds`

### `startSectionTimer(sectionOverride?)`
Stops current timer, calculates seconds via `getSectionTimeSeconds`, sets `timeRemaining` and activates timer (or sets `null` for no timer).

### `handleTimeUp()`
Called via TestContext by `useTestTimer` when countdown hits zero:
1. `setTimerActive(false)`
2. If `isInReviewModeRef.current || showReviewScreenRef.current` → `completeSection(true)` (skip review check)
3. Otherwise → `completeSection()`

### `canGoBack(): boolean`
- Preview mode: true if `currentQuestionIndex > 0`
- False if at first question of first section
- True if `navigation_mode === 'back_forward'` AND `currentQuestionIndex > 0`
- True if `navigation_between_sections === 'back_forward'` AND at first Q of non-first section

### `goToPreviousQuestion()` (async)
1. Guard: time expired or `isTransitioning`
2. `setIsTransitioning(true)`
3. Cancel pending auto-save
4. Save current answer
5. Decrement `currentQuestionIndex`, or move to previous section's last question

### `goToNextQuestion()` (async)
The most complex navigation function:

1. Guards: time expired, `isTransitioning`, `submitting`
2. `setIsTransitioning(true)`
3. Cancel pending auto-save
4. Save current answer (blocks navigation if save fails)
5. **Answer validation** (if `can_leave_blank === false`):
   - Checks each DI type for completeness (MSR: all sub-questions; GI: both blanks; TA: all statements; TPA: both columns)
   - Sets `isPartialAnswer` flag and shows `AnswerRequiredModal` if incomplete, then returns
6. **Adaptive path** (`adaptivity_mode === 'adaptive'`):
   - `await selectNextAdaptiveAction()`
   - `complete_section` → `completeSection()`
   - `add_and_advance` → append questions + advance index
   - `advance` → advance index
   - `no_op` → fall through to standard path
7. **Standard path** (non-adaptive or adaptive no_op):
   - Not last question → `setCurrentQuestionIndex + 1` + `setGlobalQuestionOrder + 1`
   - Last question → `completeSection()`

### `startTest()` (async)
Called when student clicks "Start Test":
1. `checkMultipleScreens()` — block if detected
2. Fetch assignment status from DB
3. If `annulled`/`incomplete` → increment `current_attempt` in DB + state
4. If `unlocked` (first start) → update status to `in_progress`
5. If `user_choice` sections AND no selection yet → show section selection screen
6. Apply `userSelectedSections` if any, hide start screen
7. Capture `testLanguage`, set `testStartTime` + `sectionStartTime`
8. `enterFullscreen()`
9. `startSectionTimer()`

### `beginTestWithSelectedSections()`
Called after section drag-and-drop confirmed:
1. Apply `userSelectedSections` as active sections
2. If adaptive `per_section`: call `prepareBaseQuestionsForSection(firstSection, '')` → append to `selectedQuestions`
3. Hide selection screen, capture language, set start times
4. `enterFullscreen()` + `startSectionTimer()`

### `completeSection(skipReviewCheck = false)`
Called at the end of each section:
1. Guard: `isCompletingSectionRef.current` (sync race condition check)
2. If `allow_review_at_end` AND not already in review AND not `skipReviewCheck` → `enterReviewMode()` and return
3. If `skipReviewCheck` AND in review → reset review state (`showReviewScreen`, `isInReviewMode`, `answerChangesUsed`)
4. Set `isCompletingSectionRef.current = true`
5. Stop timer
6. Use **refs** for stale-closure-safe state: `actualCurrentSection`, `actualCurrentSectionIndex`, `actualPausesUsed`
7. **Mandatory pause** check (`pause_mode === 'between_sections'` + section in `pause_sections`): show pause screen + setTimeout to auto-advance after duration
8. **User choice pause** check (`pause_mode === 'user_choice'` + not last section + pauses remaining): show `PauseChoice` screen
9. **Section transition** (no pause + not last section): show `SectionCompleted` screen
10. **Last section**: `moveToNextSection(actualCurrentSectionIndex)`

### `moveToNextSection(sectionIndexOverride?)`
Advances to the next section:
1. `currentIndex` = override ?? `currentSectionIndex`
2. **Macro section adaptivity**: if just finished a base section:
   - Calculate `percentCorrect` on answered questions in completed section
   - Find next adaptive group in `config.section_order`
   - If ≥65% correct → append `-Hard` variant; else `-Easy` variant
   - Insert into `sections` at correct position, move immediately to it, start timer, **return early**
3. If more sections remain → advance `currentSectionIndex`, reset `currentQuestionIndex` to 0, increment `globalQuestionOrder`, set `sectionStartTime`
4. Call `prepareBaseQuestionsForSection(nextSection, completedSection)` → append result to `selectedQuestions`
5. `startSectionTimer(nextSection)`
6. No more sections → `submitTest()`

### `submitTest()` (async)
1. Guard: `isPreviewMode`, `submitting`
2. Use **refs** for stale-closure-safe values: `currentQuestionIdRef`, `globalQuestionOrderRef`, `answersRef`
3. `setSubmitting(true)`, `setTimerActive(false)`
4. Capture final GMAT IRT theta for last section into `sectionThetasRef` (if `ComplexAdaptiveAlgorithm`)
5. Save final question's answer (null if unanswered) to mark question order
6. Set 30-second safety timeout (forces completion screen if DB hangs)
7. `await saveCompletionDetails('completed', 'submitted')`
8. If GMAT: `addSeenQuestions(studentId, questionIds)` (non-critical)
9. Clear timeout, `setShowCompletionScreen(true)`, `setSubmitting(false)`
10. On error: still show completion screen (individual answers already saved)

### Drag & drop helpers (section selection)
- `moveSectionUp(index)` / `moveSectionDown(index)` — swap adjacent items in `userSelectedSections`
- `handleDragStart(index)` — set `draggedSectionIndex`
- `handleDragOver(e, index)` — reorder live during drag
- `handleDragEnd()` — clear `draggedSectionIndex`

---

## 11. Callback Registration (TestContext)

After all functions are defined, a single `useEffect` wires the real implementations:

```ts
useEffect(() => {
  registerCallbacks({
    handleTimeUp,
    completeSection,
    moveToNextSection,
    onAnnulTest: (reason) => {
      const annulmentReason = reason === 'multiple_screens'
        ? 'multiple_screens_detected'
        : 'exited_fullscreen';
      saveCompletionDetails('annulled', reason, annulmentReason);
    },
  });
}, [handleTimeUp, completeSection, moveToNextSection, saveCompletionDetails, registerCallbacks]);
```

This replaces the old pattern of four individual `completeSectionRef`, `moveToNextSectionRef`, `handleTimeUpRef`, `onAnnulTestRef` refs that were assigned mid-render (which was a side effect during render — a React violation).

---

## 12. Rendering — Screen Router

Strict priority order (first match wins):

| Priority | Condition | Output |
|----------|-----------|--------|
| 1 | `loading \|\| !config \|\| (not no_sections && sections.length === 0)` | Inline spinner in `<Layout>` |
| 2 | `isLocked` | `<TestLockedScreen>` |
| 3 | `testAnnulled` | `<TestAnnulledScreen multipleScreensDetected>` |
| 4 | `showExitWarning` | `<ExitWarningScreen exitCountdown onConfirmExit onStayInTest>` |
| 5 | `showStartScreen && config` | `<TestStartScreen config onCancel onStart onDiagnosticsComplete>` |
| 6 | `showSectionSelectionScreen && config` | `<SectionSelectionScreen>` with question counts |
| 7 | `showSectionTransition` | `<SectionCompleted>` — predicts Easy/Hard next section for macro adaptivity |
| 8 | `shouldShowPauseChoice` (state OR ref) | `<PauseChoice>` |
| 9 | `showPauseScreen` | `<PauseScreen isMandatory>` |
| 10 | `showCompletionScreen` | `<Layout><TestCompleted></Layout>` |
| 11 | `isPDFTest` | PDF test interface (custom inline header + `<PDFTestView>`) |
| 12 | default | Main test interface |

---

## 13. Rendering — Main Test Interface

Wrapped in `<MathJaxProvider>`. Full-screen flex column.

### Header
`<TestHeader>` receives: section info, question counter, timer, saving indicator, device diagnostics, review mode state, preview mode controls (exit + language toggle), guided mode indicator + correct-answers toggle.

### Question Content Area (`flex-1 overflow-y-auto`)

**Multi-question page** (`isMultiQuestionPage === true`):
`<MultiQuestionView questions={currentPageQuestions} ...>`

**Single question:**
```
Bookmark button (if allow_bookmarks)
↓
QuestionRenderer          ← ALL question formats routed here (modern + legacy)
  - question_data with di_type  → DS/MSR/GI/TA/TPA components
  - question_data with options  → modern multiple choice
  - question_data with choices[] → legacy choices format
  - answer_a/b/c/d/e fields     → legacy letter format
  - open_ended                  → text input
↓
Report Issue button (toggleFlag)
```

Language selection for `QuestionRenderer`: `'en'` if `testLanguage === 'en'` OR section name contains `'inglese'`, else `'it'`.

`showResults` prop: `true` if `(isGuidedMode && showCorrectAnswers) || isPreviewMode`.

### Footer
`<NavigationControls>` — section/question indices, limits, review mode, adaptivity mode, answered question set, navigation callbacks, multi-page support.

### Always-rendered overlays
- `<ReviewScreen isOpen={showReviewScreen}>` — GMAT review overlay
- `<ChangeBlockedToast visible={showChangeBlockedMessage}>` — max changes reached
- `<AnswerRequiredModal visible={showAnswerRequiredMessage} isPartialAnswer>` — answer required
- `<SubmittingOverlay visible={submitting}>` — submission in progress

---

## 14. Rendering — PDF Test Interface

Rendered when `isPDFTest && !showStartScreen && !showCompletionScreen`.

**Custom inline header** (does NOT use `<TestHeader>`):
- Preview mode: Exit Preview button + language toggle
- Section name + "Section X of Y"
- Timer (if active)
- Guided mode badge + show/hide answers toggle

**Content:** `<PDFTestView>` with:
- `onAnswer` — updates `answers` state directly (time-guarded)
- `onNext` — saves all answers on current page, then advances `currentPageGroup` or calls `completeSection()`/`submitTest()`
- `onPrevious` — decrements `currentPageGroup`

---

## 15. Extracted Hooks — Deep Reference

### `useTestContext` (`components/hooks/useTestContext.tsx`)
**Problem it solves:** hooks need to call functions (`completeSection`, `moveToNextSection`, `handleTimeUp`, `onAnnulTest`) that are defined *after* the hooks are initialised.

**Solution:** A React context that wraps four `useRef` slots. `TestContextProvider` exposes stable forwarder functions (created once, never change reference) that delegate to the current ref value. `registerCallbacks()` updates the refs. Hooks call the stable forwarders at any time safely.

```ts
interface TestCallbacks {
  completeSection: () => void;
  moveToNextSection: (sectionIndexOverride?: number) => void;
  handleTimeUp: () => void;
  onAnnulTest: (reason: 'fullscreen_exit' | 'multiple_screens') => void;
}
```

### `useTestDataLoader` (`components/hooks/useTestDataLoader.ts`)
Owns the complete data loading lifecycle. Two paths:

**Preview path** (`isPreviewMode === true`):
- Read-only. Loads test info → config → questions (by `test_id` or all GMAT questions for Assessment Iniziale test 1). Sets sections from questions. Navigates to `previewStartQuestion`. Skips start screen.

**Real test path** (default):
1. Load assignment from `2V_test_assignments`
2. Lock check: `status === 'locked'` → set `isLocked`, stop
3. Stale session detection: `status === 'in_progress'` + page reload detected (via `performance.getEntriesByType` + `sessionStorage`) → mark `annulled` (localhost) or `incomplete` (production)
4. Load student profile for `esigenze_speciali`
5. Extract test info, handle SAT language force-English, detect PDF format
6. Load config from `2V_test_track_config` (normalised match on `track_type`)
7. Load algorithm config if `adaptivity_mode === 'adaptive'`
8. Determine question fetch strategy:
   - **GMAT Assessment Iniziale test 1**: fetch all GMAT questions paginated by `test_type`
   - **GMAT cycle-based tests**: `getStudentGMATProgress` → `parseTestIdentifier` → `findMatchingTemplate` → `getAllocatedQuestionIds` → fetch by IDs
   - **Default**: fetch by `test_id` (with `additional_test_ids` support), paginated in batches of 1000
9. Parse `question_data`/`answers` (may be JSON strings from DB)
10. Build sections list, apply `filterSectionsWithAdaptivity()`
11. Call `prepareInitialQuestions()` → sets `selectedQuestions`
12. Initialise adaptive algorithm via `createAdaptiveAlgorithm()`
13. Set timer with special needs adjustment
14. Restore existing answers if `status === 'in_progress'`

**Internal helpers:**
- `normalizeTrackType(str)` — lowercase + trim for config matching
- `parseQuestions(raw)` — parse `question_data`/`answers` JSON strings
- `buildSectionsList(config, questions)` — from config or question data

### `useAdaptiveTesting` (`components/hooks/useAdaptiveTesting.ts`)
Bridge between `goToNextQuestion` and the adaptive algorithm.

**`selectNextAdaptiveAction()`** — async. Full logic:
1. Determine if baseline phase is complete (`per_section` or `entire_test` scope)
2. If not complete → return `advance` (sequential, base phase still going)
3. Count effective questions answered (MSR/TA groups count as 1)
4. If limit reached → `complete_section`
5. If available pool empty → `complete_section`
6. **GMAT DI subtype enforcement** (for DI sections): check minimum counts (DS:2, GI:2, TA:2, TPA:2, MSR:2); if underrepresented, force-select from that type; find related questions (MSR/TA sharing same source)
7. Normal adaptive selection via `adaptiveAlgorithm.selectNextQuestion(available, currentSection)` (or random/sequential fallback)
8. MSR/TA group expansion: `findRelatedQuestions(nextQuestion, available)`
9. Project limit check → `complete_section` if would exceed
10. Return `add_and_advance` with group

**`prepareBaseQuestionsForSection(nextSection, completedSection)`**:
1. Guard: only if `adaptive` + `use_base_questions` + `per_section`
2. Capture GMAT IRT theta for completed section into `sectionThetasRef`
3. `adaptiveAlgorithm.resetForNewSection()`
4. `pickBaseQuestions(questionPool, nextSection, config)` — filter by section + difficulty, random shuffle if configured, slice to `base_questions_count`, mark `is_base = true`

### `useSaveCompletionDetails` (`components/hooks/useSaveCompletionDetails.ts`)
Persists attempt metadata and triggers external sync.

`saveCompletionDetails(status, reason, annulmentReason?)`:
- Uses `withTimeout(thenable, ms, label)` — wraps `PromiseLike<T>` via `Promise.resolve()` + `Promise.race` with rejection timeout (10s each call)
- Fetches current `completion_details` from DB
- Builds `AttemptData` (timestamps, browser, screen, device diagnostics, pause events, section times, config snapshot, GMAT IRT scores)
- Upserts into `completion_details.attempts[]`
- Updates assignment: `status` (completed→locked), `completion_status`, `completed_at`, `results_viewable_by_student: false`
- If `status === 'completed'`: gets user → gets profile → if `external_student_id` → `calculateResultsForExternalSync()` → `syncTestResultsToExternal()` (non-critical, wrapped in try/catch)

---

## 16. Extracted Utilities — Deep Reference

### `sectionUtils.ts` (`lib/utils/sectionUtils.ts`)

**`getSectionField(question, config)`**
Returns `question.macro_section` if `section_order_mode` includes `'macro_sections'` AND field exists, else `question.section ?? ''`.

**`formatSectionName(name, exerciseType?)`**
- `'Multi-topic'` → `exerciseType` (or `'Multi-topic'` if not provided)
- `RW` prefix → `'Reading and Writing'`
- `Math1` / `Math2` → `'Math 1'` / `'Math 2'`
- Strips `-Hard` / `-Easy` suffixes

**`calculateSectionQuestionLimit(config, currentSection, totalQuestionsInSection)`**
- Non-adaptive: returns `totalQuestionsInSection`
- Adaptive: `questions_per_section[currentSection]`; if not found and section ends with `-Easy`/`-Hard`, strips suffix and retries; defaults to 20

**`calculateExpectedTotalSections(config, sections)`**
- With macro adaptivity (`section_adaptivity_config` with any `type: 'base'` entries): `baseSectionCount * 2`
- Otherwise: `sections.length`

**`filterSectionsWithAdaptivity(sections, adaptivityConfig, initialOnly)`**
- `type === 'base'` → always include
- `type === 'adaptive'` AND `initialOnly=false` → randomly pick one from each group (strip `-Easy`/`-Hard` to find group)
- `type === 'adaptive'` AND `initialOnly=true` → exclude (will be added later by `moveToNextSection`)
- No config for section → include by default

---

## 17. Database Tables Accessed

| Table | Operations | Notes |
|-------|-----------|-------|
| `2V_test_assignments` | SELECT, UPDATE | `_test` suffix in test mode |
| `2V_tests` | SELECT (joined) | Test metadata |
| `2V_test_track_config` | SELECT | Test configuration |
| `2V_questions` | SELECT | Always real table (never `_test`) |
| `2V_student_answers` | SELECT (restore), UPSERT (save) | `_test` suffix in test mode |
| `2V_algorithm_config` | SELECT | Adaptive algorithm config |
| `2V_profiles` | SELECT | `esigenze_speciali`, `external_student_id` |
| `2V_gmat_student_progress` | SELECT (cycle), UPDATE (seen Qs) | Via `lib/api/gmat` |
| `2V_question_allocation_templates` | SELECT | GMAT cycle question allocation |
| `2V_pause_events` | INSERT | Via `usePauseManagement` |

---

## 18. Known Remaining Issues

| Issue | Location | Severity |
|-------|----------|----------|
| PDF test has its own inline header | `TakeTestPage.tsx` render | Low — duplicates TestHeader logic |
| Drag & drop state + handlers in page | `TakeTestPage.tsx` | Low — could move into `SectionSelectionScreen` |
| Macro-adaptivity performance calculation duplicated | `moveToNextSection` + `SectionTransition` render | Low — same percent-correct calc in two places |
| Answer completeness validation inline | `goToNextQuestion` (lines 844–922) | Medium — complex per-DI-type logic could be a utility |
| `startTest` + `beginTestWithSelectedSections` share setup | Both functions | Low — shared lines (language, times, fullscreen, timer) |
| `getSectionTimeSeconds` lives in page | `TakeTestPage.tsx` | Low — could move to `sectionUtils.ts` |
