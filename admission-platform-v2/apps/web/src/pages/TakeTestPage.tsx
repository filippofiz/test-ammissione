/**
 * Take Test Page - Universal Test Taking Interface
 * Supports any test type (GMAT, SAT, TOLC, etc.) with flexible configuration
 * Based on test_track_config settings
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faFlag,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faBookmark,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { supabaseTest } from '../lib/supabaseTest';
import { useTranslation } from 'react-i18next';
import { MathJaxProvider, MathJaxRenderer } from '../components/MathJaxRenderer';
import { QuestionRenderer } from '../components/test/QuestionRenderer';
import { SectionCompleted, PauseChoice, PauseScreen, TestCompleted } from '../components/test/SectionTransition';
import { ReviewScreen } from '../components/test/ReviewScreen';
import { TestStartScreen } from '../components/test/TestStartScreen';
import { SectionSelectionScreen } from '../components/test/SectionSelectionScreen';
import { TestHeader } from '../components/test/TestHeader';
import { NavigationControls } from '../components/test/NavigationControls';
import { TestLockedScreen } from '../components/test/TestLockedScreen';
import { TestAnnulledScreen } from '../components/test/TestAnnulledScreen';
import { ExitWarningScreen } from '../components/test/ExitWarningScreen';
import { useTestProctoring } from '../components/hooks/useTestProctoring';
import { useReviewMode } from '../components/hooks/useReviewMode';
import { useAnswerManagement } from '../components/hooks/useAnswerManagement';
import { useTestTimer, formatTime } from '../components/hooks/useTestTimer';
import { usePauseManagement } from '../components/hooks/usePauseManagement';
import { PDFTestView } from '../components/PDFTestView';
import { createAdaptiveAlgorithm, SimpleAdaptiveAlgorithm, ComplexAdaptiveAlgorithm } from '../lib/algorithms/adaptiveAlgorithm';
import {
  getStudentGMATProgress,
  addSeenQuestions,
  type GmatCycle
} from '../lib/api/gmat';
import {
  findMatchingTemplate,
  getAllocatedQuestionIds,
  parseTestIdentifier
} from '../lib/gmat/questionAllocation';
import { syncTestResultsToExternal } from '../lib/api/externalStudents';
import { calculateResultsForExternalSync } from '../lib/utils/externalSyncCalculator';
// Note: prepareInitialQuestions is defined as a local function below (not imported)

interface TestConfig {
  test_type: string;
  track_type: string;
  section_order_mode: 'mandatory' | 'user_choice' | 'no_sections' | 'mandatory_macro_sections' | 'user_choice_macro_sections' | string;
  section_order: string[] | null;
  time_per_section: Record<string, number> | null;
  total_time_minutes: number | null;
  navigation_mode: 'forward_only' | 'back_forward';
  navigation_between_sections?: 'forward_only' | 'back_forward';
  can_leave_blank: boolean | null;
  pause_mode: 'no_pause' | 'between_sections' | 'user_choice';
  pause_sections: string[] | null;
  pause_duration_minutes: number;
  max_pauses?: number;
  test_start_message?: string; // English message
  messaggio_iniziale_test?: string; // Italian message

  // Calculator configuration
  calculator_type?: 'none' | 'regular' | 'graphing' | 'scientific'; // Calculator type: none, regular (GMAT-style), graphing (Desmos), scientific (Desmos/SAT)

  // Algorithm configuration
  question_order?: 'random' | 'sequential';
  adaptivity_mode?: 'adaptive' | 'non_adaptive' | 'static'; // Allow both naming conventions
  use_base_questions?: boolean;
  base_questions_scope?: 'per_section' | 'entire_test'; // Per section or entire test
  base_questions_count?: number;
  algorithm_type?: 'simple' | 'complex';
  baseline_difficulty?: number | string; // Difficulty level for baseline questions (e.g., 1, 2, 3 or "easy", "medium", "hard"). If not set, uses average difficulty.

  // Question limits
  questions_per_section?: Record<string, number>; // JSONB mapping section names to question counts (for multi-section tests)
  total_questions?: number; // Total number of questions (for single-section tests)

  // Section adaptivity
  section_adaptivity_config?: Record<string, { type: 'base' | 'adaptive'; difficulty?: string }>;

  // Review & Edit feature (GMAT-style)
  allow_review_at_end?: boolean;
  allow_bookmarks?: boolean;
  max_answer_changes?: number;
  max_questions_to_review?: number | null;

  // Algorithm reference
  algorithm_id?: string;
}

interface Question {
  id: string;
  test_type: string;
  section: string;
  macro_section?: string; // Used when section_order_mode includes 'macro_sections'
  question_number: number;
  question_type: string;
  difficulty: string;
  is_base?: boolean; // Mark if this is a baseline question for adaptive algorithms

  // New JSON structure
  question_data: {
    // Data Insights fields
    di_type?: 'DS' | 'MSR' | 'TPA' | 'GI' | 'TA';

    // DS (Data Sufficiency)
    problem?: string;
    statement1?: string;
    statement2?: string;

    // MSR (Multi-Source Reasoning)
    sources?: Array<{
      content?: string;
      tab_name: string;
      content_type: 'text' | 'table';
      table_data?: string[][];
      table_headers?: string[];
    }>;
    questions?: Array<{
      text: string;
      options: Record<string, string>;
      question_type: string;
      correct_answer: string;
    }>;

    // GI (Graphical Interpretation)
    chart_config?: Record<string, unknown>;
    context_text?: string;
    blank1_options?: string[];
    blank2_options?: string[];
    statement_text?: string;

    // TA (Table Analysis)
    table_data?: string[][];
    table_title?: string;
    column_headers?: string[];
    statements?: Array<{
      text: string;
      is_true: boolean;
    }>;

    // TPA (Two-Part Analysis)
    scenario?: string;
    column1_title?: string;
    column2_title?: string;
    shared_options?: string[];

    // Common fields
    image_url?: string | null;
    image_url_eng?: string | null;
    image_options?: Record<string, string>;
    image_options_eng?: Record<string, string>;
    question?: string;
    passage?: string;
    question_text?: string;
    question_text_eng?: string;
    options?: Record<string, string>;
    options_eng?: Record<string, string>;
    passage_text?: string;
    passage_text_eng?: string;
    passage_title?: string;
    passage_title_eng?: string;

    // Answer choices (for multiple choice)
    choices?: Array<{
      label: string;
      text: string;
    }>;

    // PDF-based test fields
    pdf_url?: string;
    page_number?: number;
  };

  answers: {
    correct_answer: string[];
    wrong_answers: string[];
  };

  // Legacy fields (for backwards compatibility)
  question_text?: string;
  answer_a?: string | null;
  answer_b?: string | null;
  answer_c?: string | null;
  answer_d?: string | null;
  answer_e?: string | null;
  correct_answer?: string;
  topic?: string;
}

interface StudentAnswer {
  questionId: string;
  answer: string | null;
  timeSpent: number;
  flagged: boolean;
  // For GMAT Data Insights questions
  msrAnswers?: string[]; // MSR has multiple sub-questions
  blank1?: string; // GI has two blanks
  blank2?: string;
  taAnswers?: Record<number, 'true' | 'false'>; // TA has multiple true/false statements
  column1?: string; // TPA has two columns
  column2?: string;
}

// JSONB answer format for database storage
type JsonbAnswer =
  | { answers: string[] } // MSR
  | { answers: { part1: string | null; part2: string | null } } // GI or TPA
  | { answers: Record<number, 'true' | 'false'> } // TA
  | { answer: string | null }; // Simple questions

// Attempt data stored in completion_details
interface AttemptData {
  attempt_number: number;
  status: string;
  reason: string;
  annulment_reason?: string | null;
  started_at: string;
  completed_at: string;
  browser_info: string;
  screen_resolution: string;
  timestamp: string;
  pause_events?: Array<{
    timestamp: string;
    section: string;
    action: 'pause_taken' | 'pause_skipped' | 'pause_auto_skipped';
  }>;
  pauses_used?: number;
  test_config?: Record<string, unknown>;
  sections_completed?: string[];
  section_times?: Record<string, number>;
  total_questions?: number;
  device_diagnostics?: {
    connection_latency_ms: number | null;
    connection_status: 'good' | 'warning' | 'error';
    performance_benchmark_ms: number | null;
    performance_status: 'good' | 'warning' | 'error';
    overall_status: 'ready' | 'warning' | 'error';
    tested_at: string;
  };
  [key: string]: unknown; // Allow additional properties
}

// Test info nested in assignment
interface TestInfo {
  id: string;
  test_type: string;
  exercise_type: string;
  format: string;
  test_number?: number;
  section?: string;
  materia?: string;
}

// Algorithm configuration from database
interface AlgorithmConfig {
  id: string;
  algorithm_type: 'simple' | 'complex';
  simple_difficulty_increment?: number;
  irt_model?: '1PL' | '2PL' | '3PL';
  initial_theta?: number;
  theta_min?: number;
  theta_max?: number;
  se_threshold?: number;
  max_information_weight?: number;
  exposure_control?: boolean;
  [key: string]: unknown;
}

// Test assignment from database
interface TestAssignment {
  id: string;
  student_id: string;
  status: 'unlocked' | 'in_progress' | 'completed' | 'locked' | 'incomplete' | 'annulled';
  start_time: string | null;
  current_attempt: number;
  total_attempts: number;
  completion_details: {
    attempts: AttemptData[];
  } | null;
  '2V_tests'?: TestInfo;
  '2V_tests_test'?: TestInfo;
  [key: string]: unknown; // Allow additional properties
}

// Student answer from database
interface DbStudentAnswer {
  question_id: string;
  answer: JsonbAnswer;
  is_flagged: boolean;
  time_spent_seconds: number;
  question_order: number;
  attempt_number: number;
}

/**
 * Filters sections based on section adaptivity configuration.
 * - Base sections are always included
 * - For adaptive sections:
 *   - If initialOnly=true (macro_section mode): Returns only base sections, adaptive sections added later based on performance
 *   - If initialOnly=false: Randomly picks one from each group
 * - Maintains the original order from section_order
 *
 * Example (initialOnly=false):
 * Input: ["RW1", "RW2-Easy", "RW2-Hard", "Math1", "Math2-Easy", "Math2-Hard"]
 * Config: { RW1: base, RW2-Easy: adaptive, RW2-Hard: adaptive, Math1: base, Math2-Easy: adaptive, Math2-Hard: adaptive }
 * Output: ["RW1", "RW2-Hard", "Math1", "Math2-Easy"] (randomly picked RW2-Hard and Math2-Easy)
 *
 * Example (initialOnly=true):
 * Input: ["RW1", "RW2-Easy", "RW2-Hard", "Math1", "Math2-Easy", "Math2-Hard"]
 * Config: { RW1: base, RW2-Easy: adaptive, RW2-Hard: adaptive, Math1: base, Math2-Easy: adaptive, Math2-Hard: adaptive }
 * Output: ["RW1", "Math1"] (only base sections, adaptive sections added later based on 65% threshold)
 */
function filterSectionsWithAdaptivity(
  sections: string[],
  adaptivityConfig: Record<string, { type: 'base' | 'adaptive'; difficulty?: string }>,
  initialOnly: boolean = false
): string[] {
  const result: string[] = [];
  const processedGroups = new Set<string>();

  for (const section of sections) {
    const config = adaptivityConfig[section];

    if (!config) {
      // No config for this section, include it by default
      result.push(section);
      continue;
    }

    if (config.type === 'base') {
      // Always include base sections
      result.push(section);
    } else if (config.type === 'adaptive' && !initialOnly) {
      // Extract group prefix (e.g., "RW2" from "RW2-Easy")
      const groupPrefix = section.replace(/-Easy|-Hard$/i, '');

      if (processedGroups.has(groupPrefix)) {
        // Already picked a section from this group, skip
        continue;
      }

      // Find all sections in this group
      const groupSections = sections.filter(s => {
        const sectionConfig = adaptivityConfig[s];
        return sectionConfig?.type === 'adaptive' && s.startsWith(groupPrefix);
      });

      // Randomly pick one from the group
      const randomIndex = Math.floor(Math.random() * groupSections.length);
      const pickedSection = groupSections[randomIndex];

      result.push(pickedSection);
      processedGroups.add(groupPrefix);
    }
    // If initialOnly=true and adaptive, skip (will be added later based on performance)
  }

  return result;
}

export default function TakeTestPage() {
  const { assignmentId, testId, startQuestionNumber } = useParams<{
    assignmentId?: string;
    testId?: string;
    startQuestionNumber?: string;
  }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = window.location;

  // PREVIEW MODE DETECTION - 100% separate from real test
  const isPreviewMode = location.pathname.startsWith('/preview-test');
  const previewTestId = isPreviewMode ? testId : null;
  const previewStartQuestion = isPreviewMode ? parseInt(startQuestionNumber || '1', 10) : 1;

  // Detect test mode from URL parameter (?testMode=true)
  const searchParams = new URLSearchParams(window.location.search);
  const isTestMode = searchParams.get('testMode') === 'true';

  // Detect guided mode from URL parameters (?guided=true&timed=false)
  const isGuidedMode = searchParams.get('guided') === 'true';
  const guidedTimed = searchParams.get('timed') !== 'false'; // Default to timed

  // Toggle for showing/hiding correct answers in guided mode
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  const db = isTestMode ? supabaseTest : supabase;

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Submitting test state
  const [isLocked, setIsLocked] = useState(false); // Test is locked/completed
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [globalQuestionOrder, setGlobalQuestionOrder] = useState(0); // Global question counter across all sections
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [isPDFTest, setIsPDFTest] = useState(false); // PDF test format
  const [currentPageGroup, setCurrentPageGroup] = useState(0); // For PDF tests: current page group
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [deviceDiagnostics, setDeviceDiagnostics] = useState<{
    connection: { status: 'checking' | 'good' | 'warning' | 'error'; value?: number };
    performance: { status: 'checking' | 'good' | 'warning' | 'error'; value?: number };
    overall: 'checking' | 'ready' | 'warning' | 'error';
  } | null>(null);
  const [testLanguage, setTestLanguage] = useState<string>('it'); // Language captured at test start
  const [exerciseType, setExerciseType] = useState<string>(''); // Exercise type from assignment
  const [showSectionSelectionScreen, setShowSectionSelectionScreen] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false); // Student has special needs (30% extra time)
  const [timerActive, setTimerActive] = useState(false); // Controls whether the timer interval is running
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [sectionStartTime, setSectionStartTime] = useState<Date | null>(null);
  const [userSelectedSections, setUserSelectedSections] = useState<string[]>([]);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [_isCompletingSection, setIsCompletingSection] = useState(false); // Prevent double section completion
  // showAnswerRequiredMessage, isPartialAnswer, showChangeBlockedMessage — now owned by useAnswerManagement hook

  // Adaptive testing state
  const [questionPool, setQuestionPool] = useState<Question[]>([]); // Available questions
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]); // Questions to show
  const [_algorithmConfig, setAlgorithmConfig] = useState<Record<string, unknown> | null>(null); // Algorithm configuration
  const [adaptiveAlgorithm, setAdaptiveAlgorithm] = useState<SimpleAdaptiveAlgorithm | ComplexAdaptiveAlgorithm | null>(null); // Algorithm instance
  const [baseQuestionsCompletedPerSection, setBaseQuestionsCompletedPerSection] = useState<Record<string, boolean>>({}); // Track base questions per section

  // GMAT IRT scoring: track per-section theta estimates for proper GMAT scoring
  // Only accessed at submission time, so no state needed — ref suffices
  const sectionThetasRef = useRef<Record<string, { theta: number; se: number }>>({});

  // Review & Edit feature — managed by useReviewMode hook
  // completeSection callback ref — set after completeSection is defined (same pattern as onAnnulTestRef)
  const completeSectionRef = useRef<() => void>(() => {});

  // Saving and timing state
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<number>(1);
  // questionStartTimes, sectionTimes, isSaving, saveError — now owned by useAnswerManagement hook

  // timerRef — now managed by useTestTimer hook
  // pauseChoiceMadeRef, showPauseChoiceRef, currentSectionIndexRef, pausesUsedRef — owned by usePauseManagement hook
  const isCompletingSectionRef = useRef(false); // Synchronous guard for race condition
  // isInReviewModeRef, showReviewScreenRef — owned by useReviewMode hook
  // savingInProgressRef, autoSaveTimeoutRef, currentQuestionIdRef, globalQuestionOrderRef,
  // currentAttemptRef, questionStartTimesRef, answersRef — owned by useAnswerManagement hook

  // Helper function to get the correct section field based on config
  const getSectionField = (question: Question): string => {
    if (config?.section_order_mode?.includes('macro_sections') && question.macro_section) {
      return question.macro_section;
    }
    return question.section;
  };

  // Get current section and questions
  const currentSection = sections[currentSectionIndex];

  // Pause management — usePauseManagement hook
  // moveToNextSection is defined later, so wire via ref (same pattern as completeSectionRef)
  const moveToNextSectionRef = useRef<(sectionIndexOverride: number) => void>(() => {});
  const currentSectionIndexRef = useRef(currentSectionIndex);
  const pauseMgmt = usePauseManagement({
    config,
    currentSection,
    currentSectionIndexRef,
    assignmentId,
    currentAttempt,
    supabase,
    moveToNextSection: (idx) => moveToNextSectionRef.current(idx),
  });
  const {
    showPauseScreen, setShowPauseScreen,
    showPauseChoiceScreen, setShowPauseChoiceScreen,
    pauseTimeRemaining, setPauseTimeRemaining,
    pausesUsed,
    pauseEvents,
    pauseChoiceCountdown, setPauseChoiceCountdown, setPauseChoiceTrigger,
    showSectionTransition, setShowSectionTransition, sectionTransitionCountdown,
    isTransitioning, setIsTransitioning,
    pauseChoiceMadeRef, showPauseChoiceRef, pausesUsedRef,
    handleTakePause, handleSkipPause, handleSectionTransitionComplete,
  } = pauseMgmt;

  // Proctoring: fullscreen enforcement, exit warnings, multiple screen detection
  // onAnnulTest callback ref — set after saveCompletionDetails is defined
  const onAnnulTestRef = useRef<(reason: 'fullscreen_exit' | 'multiple_screens') => void>(() => {});
  const proctoring = useTestProctoring({
    isGuidedMode,
    showStartScreen,
    showSectionSelectionScreen,
    showPauseScreen,
    showPauseChoiceScreen,
    showCompletionScreen,
    onAnnulTest: (reason) => onAnnulTestRef.current(reason),
  });
  const { testAnnulled, showExitWarning, exitCountdown, multipleScreensDetected, enterFullscreen, handleStayInTest, handleConfirmExit, checkMultipleScreens } = proctoring;

  // Helper to format section names for display
  const formatSectionName = (name: string): string => {
    if (!name) return '';
    // If section is "Multi-topic", display exercise type instead
    if (name === 'Multi-topic' && exerciseType) {
      return exerciseType;
    }
    // Replace RW with "Reading and Writing"
    let formatted = name.replace(/^RW(\d*)/, 'Reading and Writing $1').trim();
    // Replace Math1, Math2 with "Math 1", "Math 2"
    formatted = formatted.replace(/^Math(\d+)/, 'Math $1');
    // Remove -Hard or -Easy suffixes
    formatted = formatted.replace(/-(Hard|Easy)$/i, '');
    return formatted;
  };

  // Calculate expected total sections (for footer display)
  // In macro_section adaptivity mode, each base section will have an adaptive section added
  const expectedTotalSections = (() => {
    if (!config?.section_adaptivity_config || Object.keys(config.section_adaptivity_config).length === 0) {
      return sections.length; // No adaptivity, use actual length
    }

    const useMacroSectionAdaptivity = config?.section_order_mode?.includes('macro_sections');
    if (!useMacroSectionAdaptivity) {
      return sections.length; // Not macro_section mode, use actual length
    }

    // Count base sections (each will get 1 adaptive section added)
    const baseSectionCount = Object.values(config.section_adaptivity_config).filter(c => c.type === 'base').length;
    return baseSectionCount * 2; // base + adaptive for each
  })();

  // Use selectedQuestions if they've been prepared (for both adaptive and non-adaptive tests)
  const questionsToUse = selectedQuestions.length > 0
    ? selectedQuestions
    : allQuestions;

  console.log('🎯 [RENDER] Questions to use:', {
    selectedQuestionsCount: selectedQuestions.length,
    allQuestionsCount: allQuestions.length,
    questionsToUseCount: questionsToUse.length,
    currentSection,
    sectionOrderMode: config?.section_order_mode
  });

  // In no_sections mode, use all questions; otherwise filter by section
  const sectionQuestions = config?.section_order_mode === 'no_sections'
    ? questionsToUse
    : questionsToUse.filter(q => getSectionField(q) === currentSection);

  console.log('📊 [RENDER] Section questions filtered:', {
    sectionQuestionsCount: sectionQuestions.length,
    currentQuestionIndex,
    currentSection,
    firstSectionQuestion: sectionQuestions[0] ? {
      id: sectionQuestions[0].id,
      section: getSectionField(sectionQuestions[0])
    } : null
  });

  const currentQuestion = sectionQuestions[currentQuestionIndex];
  const totalQuestionsInSection = sectionQuestions.length;

  console.log('🔎 [RENDER] Current question:', {
    exists: !!currentQuestion,
    currentQuestionIndex,
    totalQuestionsInSection,
    questionId: currentQuestion?.id,
    hasQuestionData: !!currentQuestion?.question_data
  });

  // Alias for review functions (same as sectionQuestions)
  const currentSectionQuestionsList = sectionQuestions;

  // Timer — useTestTimer hook (replaces inline timerRef + startSectionTimer + formatTime)
  // onTimeUp is wired via ref because handleTimeUp is defined later in the file
  const handleTimeUpRef = useRef<() => void>(() => {});
  const { timeRemaining, setTimeRemaining } = useTestTimer({
    initialSeconds: null,
    isActive: timerActive,
    onTimeUp: () => handleTimeUpRef.current(),
  });

  // Review & Edit mode (GMAT-style) — useReviewMode hook
  const reviewMode = useReviewMode({
    timeRemaining,
    answers,
    currentSectionQuestions: currentSectionQuestionsList,
    setCurrentQuestionIndex,
    onCompleteSection: () => completeSectionRef.current(),
  });
  const {
    bookmarkedQuestions, showReviewScreen, answerChangesUsed, isInReviewMode,
    setAnswerChangesUsed, setShowReviewScreen, setIsInReviewMode,
    isInReviewModeRef, showReviewScreenRef,
    toggleBookmark, enterReviewMode, goToQuestionFromReview, returnToReviewScreen, completeReview,
  } = reviewMode;

  // Answer management — useAnswerManagement hook
  const answerMgmt = useAnswerManagement({
    answers,
    setAnswers,
    currentQuestion,
    currentQuestionIndex,
    globalQuestionOrder,
    studentId,
    currentAttempt,
    config,
    timeRemaining,
    isTransitioning,
    isPreviewMode,
    isTestMode,
    isGuidedMode,
    guidedTimed,
    assignmentId,
    adaptiveAlgorithm,
    db,
    isInReviewMode,
    answerChangesUsed,
    setAnswerChangesUsed,
  });
  const {
    isSaving, saveError,
    showAnswerRequiredMessage, setShowAnswerRequiredMessage,
    isPartialAnswer, setIsPartialAnswer,
    showChangeBlockedMessage,
    sectionTimes, setSectionTimes,
    saveAnswer,
    handleAnswerSelect, handleRendererAnswerChange, toUnifiedAnswer, toggleFlag,
    autoSaveTimeoutRef, answersRef,
    globalQuestionOrderRef, currentQuestionIdRef,
  } = answerMgmt;

  // Calculate total questions expected for THIS section
  // For non-adaptive mode: use actual questions loaded (user must answer all selected questions)
  // For adaptive mode: use configured limit (effective questions target)
  const calculateSectionQuestionLimit = (): number => {
    // For non-adaptive mode, always use actual questions count
    // because we pre-select all questions and user must complete them
    if (config?.adaptivity_mode !== 'adaptive') {
      return totalQuestionsInSection;
    }

    // For adaptive mode, use configured limit
    if (config?.questions_per_section && currentSection) {
      // Try exact section name first
      let limit = config.questions_per_section[currentSection];

      // If not found and this is an adaptive section (ends with -Easy or -Hard),
      // try the base section name
      if (limit === undefined && (currentSection.endsWith('-Easy') || currentSection.endsWith('-Hard'))) {
        const baseSection = currentSection.replace(/-Easy|-Hard$/i, '');
        limit = config.questions_per_section[baseSection];
      }

      return limit || 20; // default to 20
    }
    // Fallback: use current section questions loaded
    return totalQuestionsInSection;
  };
  const sectionQuestionLimit = calculateSectionQuestionLimit();

  // Question start time, network monitor, auto-save debounce — now handled by useAnswerManagement hook

  // Track section times
  useEffect(() => {
    if (sectionStartTime && currentSection) {
      // When section changes, save the time spent in previous section
      return () => {
        const timeSpent = Math.floor((new Date().getTime() - sectionStartTime.getTime()) / 1000);
        setSectionTimes(prev => ({
          ...prev,
          [currentSection]: (prev[currentSection] || 0) + timeSpent
        }));
      };
    }
  }, [currentSection, sectionStartTime]);

  // Question progression logging
  useEffect(() => {
    // Question progression tracked
  }, [currentQuestion, currentQuestionIndex, currentSection, sectionQuestionLimit]);

  // Keep currentSectionIndexRef in sync with state (for use in timer callbacks to avoid stale closures)
  useEffect(() => {
    currentSectionIndexRef.current = currentSectionIndex;
  }, [currentSectionIndex]);

  // pausesUsedRef sync — now handled by usePauseManagement hook

  // Ref syncs for answer management refs + beforeunload — now handled by useAnswerManagement hook

  useEffect(() => {
    if (isPreviewMode) {
      loadPreviewData();
    } else {
      loadTestData();
    }
    return () => {
      setTimerActive(false); // Timer cleanup handled by useTestTimer hook
    };
  }, [assignmentId, isPreviewMode, previewTestId]);

  // Bot Control: Listen for bot commands to automate test
  useEffect(() => {
    const handleBotMessage = (event: MessageEvent) => {
      // Verify message origin for security
      if (event.origin !== window.location.origin) return;

      const { type, action, answer, questionId: _questionId } = event.data;

      if (type !== 'BOT_ACTION') return;

      switch (action) {
        case 'START_TEST':
          // Click the "Start Test" button
          if (showStartScreen) {
            startTest();
          }
          break;

        case 'SELECT_ANSWER':
          // Select the answer in the current question
          if (currentQuestion && answer !== undefined) {
            setAnswers(prev => ({
              ...prev,
              [currentQuestion.id]: answer
            }));
          }
          break;

        case 'NEXT_QUESTION':
          // Click the Next button
          goToNextQuestion();
          break;

        case 'SUBMIT_TEST':
          // Submit the test
          submitTest();
          break;
      }
    };

    // Add event listener
    window.addEventListener('message', handleBotMessage);

    // Send READY message to parent window when page is fully loaded
    if (window.opener && config && currentQuestion) {
      window.opener.postMessage({
        type: 'TEST_WINDOW_READY',
        assignmentId
      }, window.location.origin);
    }

    return () => {
      window.removeEventListener('message', handleBotMessage);
    };
  }, [showStartScreen, currentQuestion, answers, config, assignmentId]);

  // Pause timer countdown, pause choice countdown, section transition countdown
  // — all now handled by usePauseManagement hook

  // Fullscreen monitor, exit countdown, multiple screen check → moved to useTestProctoring hook

  /**
   * Prepares initial questions based on configuration
   * Handles randomization and base question selection
   *
   * IMPORTANT: For per_section scope, only returns base questions for FIRST section
   * For per_test scope, returns base questions from first section only
   */
  function prepareInitialQuestions(
    allQuestions: Question[],
    config: TestConfig,
    _algorithmConfig: any
  ): Question[] {
    // Helper to get correct section field
    const getSection = (q: Question) =>
      config.section_order_mode?.includes('macro_sections') && q.macro_section
        ? q.macro_section
        : q.section;

    // Check if this is a PDF test
    const isPDFTest = allQuestions.length > 0 && allQuestions[0].question_type === 'pdf';

    // PDF TEST SPECIAL HANDLING: NO randomization - keep original order
    if (isPDFTest) {
      // Sort by question_number to ensure correct order
      const sortedQuestions = [...allQuestions].sort((a, b) => a.question_number - b.question_number);
      return sortedQuestions;
    }

    let processedQuestions = [...allQuestions];

    // HELPER: Generate a hash key for MSR/TA questions to identify shared sources
    // Questions with the same source data should be presented together
    const getSourceGroupKey = (question: Question): string | null => {
      const diType = question.question_data?.di_type;

      if (diType === 'MSR' && question.question_data?.sources) {
        // Hash based on source tab names and content types
        const sources = question.question_data.sources;
        const sourceKey = sources.map((s: any) =>
          `${s.tab_name}:${s.content_type}:${(s.content || '').substring(0, 100)}`
        ).join('|');
        return `MSR:${sourceKey}`;
      }

      if (diType === 'TA' && question.question_data?.table_data) {
        // Hash based on table title and first row of data
        const tableTitle = question.question_data.table_title || '';
        const firstRow = question.question_data.table_data?.[0]?.join(',') || '';
        const headers = question.question_data.column_headers?.join(',') || '';
        return `TA:${tableTitle}:${headers}:${firstRow}`;
      }

      return null;
    };

    // HELPER: Group questions by shared source data and sort so related questions are adjacent
    const groupRelatedQuestions = (questions: Question[]): Question[] => {
      // Separate questions by whether they have a source group
      const grouped: Map<string, Question[]> = new Map();
      const ungrouped: Question[] = [];

      questions.forEach(q => {
        const groupKey = getSourceGroupKey(q);
        if (groupKey) {
          if (!grouped.has(groupKey)) {
            grouped.set(groupKey, []);
          }
          grouped.get(groupKey)!.push(q);
        } else {
          ungrouped.push(q);
        }
      });

      // Log groupings found
      const groupSizes = Array.from(grouped.entries())
        .filter(([_, qs]) => qs.length > 1)
        .map(([key, qs]) => `${key.split(':')[0]}(${qs.length})`);

      if (groupSizes.length > 0) {
        console.log('🔗 [QUESTION GROUPING] Found related question groups:', groupSizes.join(', '));
      }

      // Build final array: interleave grouped and ungrouped questions
      // Groups are kept together, positioned based on first question's original position
      const result: Question[] = [];
      const usedGroups = new Set<string>();

      // Track original positions
      const originalPositions = new Map<string, number>();
      questions.forEach((q, idx) => originalPositions.set(q.id, idx));

      // Process in original order, inserting groups when we hit their first member
      questions.forEach(q => {
        const groupKey = getSourceGroupKey(q);

        if (groupKey && !usedGroups.has(groupKey)) {
          // First time seeing this group - add all members together
          const groupMembers = grouped.get(groupKey) || [];
          result.push(...groupMembers);
          usedGroups.add(groupKey);
        } else if (!groupKey) {
          // Ungrouped question
          result.push(q);
        }
        // Skip if already added as part of a group
      });

      return result;
    };

    // GMAT DI SUBTYPE REPRESENTATION HELPER
    // Ensures all Data Insights question types (DS, GI, TA, TPA, MSR) are represented
    // even when some types are underrepresented in the pool
    //
    // IMPORTANT: MSR/TA sets (multiple questions sharing same source) count as 1 "effective question"
    // toward the limit, not individual questions. This prevents MSR sets from filling up all slots.
    const selectWithDISubtypeRepresentation = (
      questions: Question[],
      limit: number,
      shouldRandomize: boolean
    ): Question[] => {
      console.log(`🎯 [DI SELECTION] Starting selection with limit: ${limit} effective questions, pool size: ${questions.length}`);

      // Check if this is a Data Insights section (GMAT)
      const isDataInsightsSection = questions.some(q =>
        q.section?.toLowerCase().includes('data insights') ||
        q.section?.toLowerCase().includes('di') ||
        q.question_data?.di_type
      );

      if (!isDataInsightsSection) {
        // Not DI section - use standard selection
        let selected = shouldRandomize
          ? [...questions].sort(() => Math.random() - 0.5)
          : [...questions];
        console.log(`📋 [DI SELECTION] Not a DI section, returning ${Math.min(selected.length, limit)} questions`);
        return selected.slice(0, limit);
      }

      // DI Section: Ensure representation of all DI subtypes
      const DI_TYPES = ['DS', 'GI', 'TA', 'TPA', 'MSR'] as const;

      // Minimum "effective questions" per DI type (MSR/TA sets count as 1)
      const MIN_PER_TYPE: Record<string, number> = {
        'DS': 1,   // Usually well-represented
        'GI': 2,   // Often underrepresented - force at least 2
        'TA': 1,   // 1 TA set (may have multiple questions)
        'TPA': 1,  // Usually okay
        'MSR': 1,  // 1 MSR set (counts as 1 even if it has 6 questions)
      };

      // First, build source groups for MSR/TA questions
      // Each group is treated as 1 "effective question"
      const msrTaGroups: Map<string, Question[]> = new Map();
      const nonGroupedQuestions: Question[] = [];

      questions.forEach(q => {
        const groupKey = getSourceGroupKey(q);
        if (groupKey) {
          if (!msrTaGroups.has(groupKey)) {
            msrTaGroups.set(groupKey, []);
          }
          msrTaGroups.get(groupKey)!.push(q);
        } else {
          nonGroupedQuestions.push(q);
        }
      });

      // Log MSR/TA groups found
      console.log('📦 [MSR/TA GROUPS] Found', msrTaGroups.size, 'source groups:');
      msrTaGroups.forEach((qs, key) => {
        const preview = qs[0]?.question_data?.sources?.[0]?.content?.substring(0, 50) || key.substring(0, 50);
        console.log(`   - ${key.split(':')[0]}: ${qs.length} questions sharing "${preview}..."`);
      });

      // FORCE INCLUDE: Island Museum MSR set (starts with "Island Museum analyzes historical artifacts")
      // Search through all MSR groups to find the Island Museum set
      let islandMuseumKey: string | undefined = undefined;
      msrTaGroups.forEach((qs, key) => {
        if (islandMuseumKey) return; // Already found
        const firstQuestion = qs[0];
        if (!firstQuestion?.question_data?.sources) return;

        // Check all sources in the question for "Island Museum"
        const hasIslandMuseum = firstQuestion.question_data.sources.some((source: any) =>
          source.content?.includes('Island Museum')
        );

        if (hasIslandMuseum) {
          islandMuseumKey = key;
          console.log('🏛️ [DETECTION] Found Island Museum MSR set with key:', key.substring(0, 50) + '...');
        }
      });

      const selectedQuestions: Question[] = [];
      const usedIds = new Set<string>();
      const usedGroupKeys = new Set<string>();
      let effectiveQuestionCount = 0; // MSR/TA sets count as 1

      // Phase 0: Force include Island Museum MSR set if found
      if (islandMuseumKey && effectiveQuestionCount < limit) {
        const islandMuseumQuestions = msrTaGroups.get(islandMuseumKey)!;
        console.log('🏛️ [FORCED] Adding Island Museum MSR set:', islandMuseumQuestions.length, 'questions (counts as 1 effective question)');
        islandMuseumQuestions.forEach(q => {
          selectedQuestions.push(q);
          usedIds.add(q.id);
        });
        usedGroupKeys.add(islandMuseumKey);
        effectiveQuestionCount += 1; // Entire set counts as 1
      }

      // Group questions by DI type (for non-grouped questions)
      const byType: Record<string, Question[]> = {};
      DI_TYPES.forEach(type => {
        byType[type] = nonGroupedQuestions.filter(q => q.question_data?.di_type === type);
      });

      // Also track MSR/TA groups by type
      const msrGroups: Array<{ key: string; questions: Question[] }> = [];
      const taGroups: Array<{ key: string; questions: Question[] }> = [];

      msrTaGroups.forEach((qs, key) => {
        if (usedGroupKeys.has(key)) return; // Already used
        const diType = qs[0]?.question_data?.di_type;
        if (diType === 'MSR') {
          msrGroups.push({ key, questions: qs });
        } else if (diType === 'TA') {
          taGroups.push({ key, questions: qs });
        }
      });

      // Log available questions per type
      console.log('📊 GMAT DI Subtype Distribution in Pool:',
        `DS: ${byType['DS']?.length || 0}, ` +
        `GI: ${byType['GI']?.length || 0}, ` +
        `TA: ${taGroups.length} sets (${questions.filter(q => q.question_data?.di_type === 'TA').length} questions), ` +
        `TPA: ${byType['TPA']?.length || 0}, ` +
        `MSR: ${msrGroups.length} sets (${questions.filter(q => q.question_data?.di_type === 'MSR').length} questions)`
      );

      // Phase 1: Guarantee minimum representation of each type
      // For MSR/TA, we select SETS (each set = 1 effective question)
      DI_TYPES.forEach(type => {
        const minRequired = MIN_PER_TYPE[type] || 1;

        if (type === 'MSR') {
          // Select MSR groups (each group = 1 effective question)
          const groups = shouldRandomize ? [...msrGroups].sort(() => Math.random() - 0.5) : msrGroups;
          let typeCount = usedGroupKeys.has(islandMuseumKey || '') && islandMuseumKey?.includes('MSR') ? 1 : 0;

          for (const { key, questions: groupQs } of groups) {
            if (typeCount >= minRequired) break;
            if (effectiveQuestionCount >= limit) break;
            if (usedGroupKeys.has(key)) continue;

            // Add entire group
            groupQs.forEach(q => {
              selectedQuestions.push(q);
              usedIds.add(q.id);
            });
            usedGroupKeys.add(key);
            effectiveQuestionCount += 1; // Set counts as 1
            typeCount++;
            console.log(`✅ Added MSR set (${groupQs.length} questions) - effective count now: ${effectiveQuestionCount}`);
          }
        } else if (type === 'TA') {
          // Select TA groups (each group = 1 effective question)
          const groups = shouldRandomize ? [...taGroups].sort(() => Math.random() - 0.5) : taGroups;
          let typeCount = 0;

          for (const { key, questions: groupQs } of groups) {
            if (typeCount >= minRequired) break;
            if (effectiveQuestionCount >= limit) break;
            if (usedGroupKeys.has(key)) continue;

            // Add entire group
            groupQs.forEach(q => {
              selectedQuestions.push(q);
              usedIds.add(q.id);
            });
            usedGroupKeys.add(key);
            effectiveQuestionCount += 1; // Set counts as 1
            typeCount++;
            console.log(`✅ Added TA set (${groupQs.length} questions) - effective count now: ${effectiveQuestionCount}`);
          }
        } else {
          // DS, GI, TPA - select individual questions (each = 1 effective question)
          const typeQuestions = byType[type] || [];
          const pool = shouldRandomize
            ? [...typeQuestions].sort(() => Math.random() - 0.5)
            : [...typeQuestions];

          let typeCount = 0;
          for (const q of pool) {
            if (typeCount >= minRequired) break;
            if (effectiveQuestionCount >= limit) break;
            if (usedIds.has(q.id)) continue;

            selectedQuestions.push(q);
            usedIds.add(q.id);
            effectiveQuestionCount += 1;
            typeCount++;
          }
        }
      });

      console.log(`✅ Phase 1 (Guaranteed DI types): ${effectiveQuestionCount}/${limit} effective questions (${selectedQuestions.length} actual questions)`);

      // Phase 2: Fill remaining slots with any available questions
      // Prioritize individual questions over more MSR/TA sets to avoid filling up with sets
      if (effectiveQuestionCount < limit) {
        // First, add remaining individual questions
        const remainingIndividual = nonGroupedQuestions.filter(q => !usedIds.has(q.id));
        const pool = shouldRandomize
          ? [...remainingIndividual].sort(() => Math.random() - 0.5)
          : [...remainingIndividual];

        for (const q of pool) {
          if (effectiveQuestionCount >= limit) break;
          if (!usedIds.has(q.id)) {
            selectedQuestions.push(q);
            usedIds.add(q.id);
            effectiveQuestionCount += 1;
          }
        }
      }

      // If still need more, add remaining MSR/TA sets
      if (effectiveQuestionCount < limit) {
        const remainingGroups = [...msrGroups, ...taGroups].filter(g => !usedGroupKeys.has(g.key));
        const shuffled = shouldRandomize ? remainingGroups.sort(() => Math.random() - 0.5) : remainingGroups;

        for (const { key, questions: groupQs } of shuffled) {
          if (effectiveQuestionCount >= limit) break;
          if (usedGroupKeys.has(key)) continue;

          groupQs.forEach(q => {
            selectedQuestions.push(q);
            usedIds.add(q.id);
          });
          usedGroupKeys.add(key);
          effectiveQuestionCount += 1; // Set counts as 1
        }
      }

      console.log(`✅ Phase 2 (Fill remaining): ${effectiveQuestionCount}/${limit} effective questions (${selectedQuestions.length} actual questions)`);

      // Log final distribution
      const finalMsrCount = new Set(
        selectedQuestions.filter(q => q.question_data?.di_type === 'MSR').map(q => getSourceGroupKey(q))
      ).size;
      const finalTaCount = new Set(
        selectedQuestions.filter(q => q.question_data?.di_type === 'TA').map(q => getSourceGroupKey(q))
      ).size;

      console.log('📋 Final DI type distribution (effective questions):',
        `DS: ${selectedQuestions.filter(q => q.question_data?.di_type === 'DS').length}, ` +
        `GI: ${selectedQuestions.filter(q => q.question_data?.di_type === 'GI').length}, ` +
        `TA: ${finalTaCount} sets, ` +
        `TPA: ${selectedQuestions.filter(q => q.question_data?.di_type === 'TPA').length}, ` +
        `MSR: ${finalMsrCount} sets`
      );

      console.log(`🏁 [DI SELECTION] FINAL: Selected ${selectedQuestions.length} actual questions = ${effectiveQuestionCount} effective questions (limit was ${limit})`);

      // Verify we haven't exceeded the limit
      if (effectiveQuestionCount > limit) {
        console.warn(`⚠️ [DI SELECTION] WARNING: Exceeded limit! ${effectiveQuestionCount} > ${limit}`);
      }

      // Phase 3: Group related MSR/TA questions together in the final order
      const groupedQuestions = groupRelatedQuestions(selectedQuestions);

      return groupedQuestions;
    };

    // NON-ADAPTIVE MODE: Static question selection
    if (config.adaptivity_mode !== 'adaptive') {
      // CASE 1: Single-section test with total_questions limit
      if (config.section_order_mode === 'no_sections' && config.total_questions) {
        // Apply randomization if configured
        if (config.question_order === 'random') {
          processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
        }
        // Take limited number
        processedQuestions = processedQuestions.slice(0, config.total_questions);
        return processedQuestions;
      }

      // CASE 2: Multi-section test with questions_per_section limits
      if (config.questions_per_section) {
        const limitedQuestions: Question[] = [];
        const sections = Array.from(new Set(processedQuestions.map(q => getSection(q))));

        sections.forEach(section => {
          const sectionQuestions = processedQuestions.filter(q => getSection(q) === section);
          const limit = config.questions_per_section![section];

          if (limit !== undefined && limit > 0) {
            // Use DI subtype representation helper for Data Insights section
            const selected = selectWithDISubtypeRepresentation(
              sectionQuestions,
              limit,
              config.question_order === 'random'
            );
            limitedQuestions.push(...selected);
          } else {
            // No limit for this section, include all
            limitedQuestions.push(...sectionQuestions);
          }
        });

        processedQuestions = limitedQuestions;
        return processedQuestions;
      }

      // CASE 3: No limits configured - return all questions
      if (config.question_order === 'random') {
        processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
      }

      return processedQuestions;
    }

    // ADAPTIVE MODE: Continue with adaptive logic below

    // Handle question randomization for adaptive mode
    if (config.question_order === 'random') {
      if (config.base_questions_scope === 'per_section') {
        // Randomize within each section
        const sections = Array.from(new Set(processedQuestions.map(q => getSection(q))));
        const randomizedQuestions: Question[] = [];

        sections.forEach(section => {
          const sectionQuestions = processedQuestions.filter(q => getSection(q) === section);
          // Shuffle section questions
          const shuffled = [...sectionQuestions].sort(() => Math.random() - 0.5);
          randomizedQuestions.push(...shuffled);
        });

        processedQuestions = randomizedQuestions;
      } else {
        // Randomize all questions together
        processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
      }
    }

    // Handle base questions selection
    if (config.use_base_questions && config.base_questions_count) {
      // Determine baseline difficulty
      // If not specified, use average difficulty (2 or "medium")
      // Map numeric to string: 1="easy", 2="medium", 3="hard"
      let baselineDifficulty = config.baseline_difficulty;
      if (!baselineDifficulty) {
        // Default to medium difficulty
        baselineDifficulty = 2;
      }

      // Helper function to match difficulty (handles both string and numeric)
      const matchesDifficulty = (question: Question, targetDifficulty: number | string): boolean => {
        const qDiff = question.difficulty;

        // If both are numbers or both are strings, direct comparison
        if (typeof qDiff === typeof targetDifficulty) {
          return qDiff === targetDifficulty;
        }

        // Otherwise, map between numeric and string
        const difficultyMap: Record<number, string> = {
          1: 'easy',
          2: 'medium',
          3: 'hard'
        };
        const reverseDifficultyMap: Record<string, number> = {
          'easy': 1,
          'medium': 2,
          'hard': 3
        };

        if (typeof targetDifficulty === 'number' && typeof qDiff === 'string') {
          return difficultyMap[targetDifficulty]?.toLowerCase() === qDiff.toLowerCase();
        } else if (typeof targetDifficulty === 'string' && typeof qDiff === 'number') {
          return reverseDifficultyMap[targetDifficulty.toLowerCase()] === qDiff;
        }

        return false;
      };

      const baseQuestions: Question[] = [];

      // Helper to select baseline questions with fallback (respects question_order config)
      // Enhanced with DI subtype representation for Data Insights section
      const selectBaselineQuestions = (
        questions: Question[],
        targetSection: string,
        targetDifficulty: number | string,
        count: number
      ): Question[] => {
        // Get all questions from this section
        const allSectionQuestions = questions.filter(q => getSection(q) === targetSection);

        // Check if this is a Data Insights section
        const isDataInsightsSection = allSectionQuestions.some(q =>
          q.section?.toLowerCase().includes('data insights') ||
          q.section?.toLowerCase().includes('di') ||
          q.question_data?.di_type
        );

        // For Data Insights: Use DI subtype representation logic
        if (isDataInsightsSection) {
          console.log('🎯 Adaptive Base Questions: Using DI subtype representation for', targetSection);
          const selected = selectWithDISubtypeRepresentation(
            allSectionQuestions,
            count,
            config.question_order === 'random'
          );
          // Mark as baseline
          selected.forEach(q => q.is_base = true);
          return selected;
        }

        // Standard selection for non-DI sections
        // Try to get questions with target difficulty
        let candidates = questions.filter(
          q => getSection(q) === targetSection && matchesDifficulty(q, targetDifficulty)
        );

        // FALLBACK: If not enough questions with target difficulty, try other difficulties
        if (candidates.length < count) {
          candidates = allSectionQuestions;
        }

        // Apply randomization if question_order is 'random'
        if (config.question_order === 'random') {
          candidates = [...candidates].sort(() => Math.random() - 0.5);
        }
        // else: keep sequential order (no shuffling)

        // Take the requested count
        const selected = candidates.slice(0, count);

        // Mark as baseline
        selected.forEach(q => q.is_base = true);

        return selected;
      };

      if (config.base_questions_scope === 'per_section') {
        // For per_section: Only select base questions for FIRST section
        // Other sections will get their base questions when we move to them
        const sections = Array.from(new Set(processedQuestions.map(q => getSection(q))));
        const firstSection = sections[0];
        const baseCount = config.base_questions_count || 0;

        const selectedBaseQuestions = selectBaselineQuestions(
          processedQuestions,
          firstSection,
          baselineDifficulty!,
          baseCount
        );

        baseQuestions.push(...selectedBaseQuestions);
      } else {
        // For per_test: Select N base questions from first section
        const sections = Array.from(new Set(processedQuestions.map(q => q.section)));
        const firstSection = sections[0];
        const baseCount = config.base_questions_count || 0;

        const selectedBaseQuestions = selectBaselineQuestions(
          processedQuestions,
          firstSection,
          baselineDifficulty!,
          baseCount
        );

        baseQuestions.push(...selectedBaseQuestions);
      }

      return baseQuestions;
    }

    // If adaptive but no base questions, return empty array
    // (adaptive selection will happen as student progresses)
    return [];
  }

  // PREVIEW MODE: Load test data without assignment
  async function loadPreviewData() {
    try {
      setLoading(true);

      if (!previewTestId) {
        console.error('Preview mode: No testId provided');
        navigate('/admin/review-questions');
        return;
      }

      // Load test info
      const { data: testInfo, error: testError } = await supabase
        .from('2V_tests')
        .select('*')
        .eq('id', previewTestId)
        .single();

      if (testError || !testInfo) {
        console.error('Preview mode: Test not found', testError);
        navigate('/admin/review-questions');
        return;
      }

      const testType = testInfo.test_type;
      const exerciseType = testInfo.exercise_type;
      setExerciseType(exerciseType || '');

      // Load test config
      const normalize = (str: string) => str.toLowerCase().replace(/[\s_]+/g, '_');
      const trackTypeNormalized = normalize(exerciseType);

      const { data: configsData, error: configsError } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType);

      if (configsError) throw configsError;

      const configData = configsData?.find(config =>
        normalize(config.track_type) === trackTypeNormalized
      );

      if (!configData) {
        alert('Test configuration not found');
        navigate('/admin/review-questions');
        return;
      }

      setConfig(configData as unknown as TestConfig);

      // Check if this is GMAT Assessment Iniziale test 1 - if so, pull from general question pool
      const isGMATAssessmentInitial1 =
        testType === 'GMAT' &&
        exerciseType === 'Assessment Iniziale' &&
        testInfo.test_number === 1;

      console.log('🎯 [PREVIEW] Question Fetching Debug:', {
        testType,
        exerciseType,
        test_number: testInfo.test_number,
        isGMATAssessmentInitial1
      });

      // Load questions - SEQUENTIAL ORDER (no randomization in preview)
      let questions: any[] = [];

      // For GMAT Assessment Iniziale 1, fetch from general pool by test_type (with pagination)
      // For all other tests, fetch by test_id
      if (isGMATAssessmentInitial1) {
        console.log('✅ [PREVIEW] Fetching from GMAT question pool (all test_type=GMAT questions)');
        // Use pagination to avoid 1000 row limit
        const batchSize = 1000;
        let from = 0;
        let hasMore = true;

        while (hasMore) {
          const { data: batch, error: batchError } = await supabase
            .from('2V_questions')
            .select('*')
            .eq('test_type', testType)
            .order('question_number', { ascending: true })
            .range(from, from + batchSize - 1);

          if (batchError) throw batchError;

          if (batch && batch.length > 0) {
            questions = [...questions, ...batch];
            from += batchSize;
            hasMore = batch.length === batchSize;
          } else {
            hasMore = false;
          }
        }
      } else {
        console.log('📋 [PREVIEW] Fetching questions for specific test_id:', previewTestId);
        const { data, error: questionsError } = await supabase
          .from('2V_questions')
          .select('*')
          .eq('test_id', previewTestId)
          .order('question_number', { ascending: true });

        if (questionsError) throw questionsError;
        questions = data || [];
      }

      console.log('📊 [PREVIEW] Questions fetched:', {
        count: questions?.length || 0,
        sections: questions ? [...new Set(questions.map(q => q.section))].filter(Boolean) : []
      });

      if (!questions || questions.length === 0) {
        alert('No questions found for this test');
        navigate('/admin/review-questions');
        return;
      }

      setAllQuestions(questions);

      // Set sections (if any)
      if (configData.section_order_mode !== 'no_sections') {
        const uniqueSections = [...new Set(questions.map(q => q.section))];
        setSections(uniqueSections);
      } else {
        setSections([]);
      }

      // Set language to Italian by default for preview
      setTestLanguage('it');

      // Navigate to the start question
      const startIndex = questions.findIndex(q => q.question_number === previewStartQuestion);
      if (startIndex >= 0) {
        setCurrentQuestionIndex(startIndex);
      } else {
        setCurrentQuestionIndex(0);
      }

      // Disable start screen in preview
      setShowStartScreen(false);
      setLoading(false);

    } catch (err) {
      console.error('Preview mode: Error loading test data', err);
      alert('Failed to load preview');
      navigate('/admin/review-questions');
    }
  }

  async function loadTestData() {
    try {
      setLoading(true);

      // Load assignment details (uses test tables in test mode)
      const tableSuffix = isTestMode ? '_test' : '';
      const { data: assignment, error: assignmentError } = await db
        .from(`2V_test_assignments${tableSuffix}`)
        .select(`*, 2V_tests${tableSuffix}(id, test_type, exercise_type, format, test_number)`)
        .eq('id', assignmentId!)
        .single() as { data: TestAssignment | null; error: unknown };

      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error('Assignment not found');

      console.log('🔐 [RLS CHECK] Assignment loaded:', {
        assignmentId,
        student_id: assignment.student_id,
        test_id: assignment.test_id,
        status: assignment.status,
        tableSuffix
      });


      // Check if test is locked (completed tests are auto-locked)
      if (assignment.status === 'locked') {
        setIsLocked(true);
        setShowStartScreen(false); // Don't show start screen
        setLoading(false);
        return; // Stop loading test data
      }

      // Check if test was in_progress and user is reloading (stale session detection)
      // This prevents "in_progress" from persisting when student is not actively taking test
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (assignment.status === 'in_progress' && assignment.start_time) {
        // Check if this is a page reload using browser navigation API
        // performance.navigation.type: 0=navigate, 1=reload, 2=back/forward
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const isPageReload = navigation?.type === 'reload';

        // Also check sessionStorage as secondary check
        const hasSessionMarker = sessionStorage.getItem(`test_session_${assignmentId}`);
        const isPageRefresh = isPageReload || !hasSessionMarker;

        if (isPageRefresh) {

          // Clear session marker so it can be set fresh after marking as annulled
          sessionStorage.removeItem(`test_session_${assignmentId}`);

          // Get existing attempts history or create new array
          const existingDetails = assignment.completion_details || { attempts: [] };
          const attempts = Array.isArray(existingDetails.attempts) ? existingDetails.attempts : [];

          const currentAttemptNum = assignment.current_attempt || 1;

          // Localhost: Mark as annulled (for easier testing of retake flow)
          // Production: Mark as incomplete (normal behavior - student can resume/restart)
          const newStatus = isLocalhost ? 'annulled' : 'incomplete';
          const reason = 'browser_closed';
          const annulmentReason = isLocalhost ? 'page_refresh_localhost' : 'session_ended';

          // Create attempt record with ONLY essential metadata
          const newAttempt = {
            attempt_number: currentAttemptNum,
            status: newStatus,
            reason,
            annulment_reason: annulmentReason,
            started_at: assignment.start_time || new Date().toISOString(),
            completed_at: new Date().toISOString(),
            browser_info: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            timestamp: new Date().toISOString(),
            device_diagnostics: deviceDiagnostics ? {
              connection_latency_ms: deviceDiagnostics.connection.value ?? null,
              connection_status: deviceDiagnostics.connection.status === 'checking' ? 'warning' : deviceDiagnostics.connection.status,
              performance_benchmark_ms: deviceDiagnostics.performance.value ?? null,
              performance_status: deviceDiagnostics.performance.status === 'checking' ? 'warning' : deviceDiagnostics.performance.status,
              overall_status: deviceDiagnostics.overall === 'checking' ? 'warning' : deviceDiagnostics.overall,
              tested_at: new Date().toISOString()
            } : undefined
          };

          // Check if attempt already exists (update instead of duplicating)
          const existingAttemptIndex = attempts.findIndex(
            (a: AttemptData) => a.attempt_number === currentAttemptNum
          );

          if (existingAttemptIndex >= 0) {
            attempts[existingAttemptIndex] = {
              ...attempts[existingAttemptIndex],
              ...newAttempt
            };
          } else {
            attempts.push(newAttempt);
          }

          // Note: Answers remain in database with their attempt_number for review

          const updateData = {
            status: newStatus,
            total_attempts: currentAttemptNum,
            completion_details: { attempts }
          } as any;

          const { error: statusError } = await db
            .from(`2V_test_assignments${tableSuffix}`)
            .update(updateData)
            .eq('id', assignmentId!)
            .select();

          if (!statusError) {
            // Update local state
            assignment.status = newStatus;
            assignment.total_attempts = currentAttemptNum;
          }
        }

        // Mark this session as active
        sessionStorage.setItem(`test_session_${assignmentId}`, 'active');
      }

      // Store student_id and current_attempt for saving answers
      // Don't increment attempt here - wait until user clicks "Start Test"
      const currentAttemptNum = assignment.current_attempt || 1;
      setStudentId(assignment.student_id);
      setCurrentAttempt(currentAttemptNum);

      // Load student profile to check for special needs (extra time)
      const { data: studentProfile } = await db
        .from('2V_profiles')
        .select('esigenze_speciali')
        .eq('id', assignment.student_id)
        .single();

      const studentHasSpecialNeeds = studentProfile?.esigenze_speciali || false;
      setHasSpecialNeeds(studentHasSpecialNeeds);

      const testInfo = (assignment['2V_tests'] || assignment['2V_tests_test'])!;
      const testType = testInfo.test_type;
      const exerciseType = testInfo.exercise_type;
      const testFormat = testInfo.format;

      // SAT tests always start in English regardless of user's language setting
      if (testType === 'SAT' && i18n.language !== 'en') {
        await i18n.changeLanguage('en');
      }

      // Store exercise type in state for display
      setExerciseType(exerciseType || '');

      // Check if this is a PDF test
      if (testFormat === 'pdf') {
        setIsPDFTest(true);
      } else {
        setIsPDFTest(false);
      }

      // Normalize function: lowercase, replace spaces/underscores consistently
      const normalize = (str: string) => str.toLowerCase().replace(/[\s_]+/g, '_');
      const trackTypeNormalized = normalize(exerciseType);

      // Load all configs for this test type, then find by normalized track_type
      const { data: configsData, error: configsError } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType) as { data: TestConfig[] | null; error: unknown };

      if (configsError) {
        throw configsError;
      }

      // Find matching config by normalized track_type (case and space/underscore insensitive)
      const configData = configsData?.find(config =>
        normalize(config.track_type) === trackTypeNormalized
      );

      if (!configData) {
        alert('Test configuration not found. Please contact your instructor.');
        navigate(-1);
        return;
      }

      setConfig(configData);

      // Log pause configuration
      console.log('⏸️ [PAUSE] Configuration loaded', {
        pauseMode: configData.pause_mode,
        pauseSections: configData.pause_sections,
        pauseDurationMinutes: configData.pause_duration_minutes,
        maxPauses: configData.max_pauses,
        isPauseEnabled: configData.pause_mode !== 'no_pause',
        isMandatoryPause: configData.pause_mode === 'between_sections',
        isUserChoicePause: configData.pause_mode === 'user_choice'
      });

      // Log blank answer configuration
      console.log('📝 [CONFIG] Can leave blank:', configData.can_leave_blank);

      // Load algorithm configuration if adaptive mode is enabled
      let algorithmConfigData: AlgorithmConfig | null = null;
      if (configData.adaptivity_mode === 'adaptive' && configData.algorithm_id) {
        // Fetch algorithm config by ID from the algorithm library
        const { data: algConfig, error: algError } = await supabase
          .from('2V_algorithm_config')
          .select('*')
          .eq('id', configData.algorithm_id)
          .single() as { data: AlgorithmConfig | null; error: unknown };

        if (!algError && algConfig) {
          algorithmConfigData = algConfig;
          setAlgorithmConfig(algConfig);
        }
      }

      // Load test questions (always from real tables - questions are read-only reference data)
      // Questions are linked by test_id
      const testId = testInfo.id;

      // Check if this is GMAT Assessment Iniziale test 1 - if so, pull from general question pool
      const isGMATAssessmentInitial1 =
        testType === 'GMAT' &&
        exerciseType === 'Assessment Iniziale' &&
        testInfo.test_number === 1;

      // Check if this is a GMAT test that uses cycle-based allocation (training/assessment, not initial)
      const isGMATCycleBasedTest =
        testType === 'GMAT' &&
        !isGMATAssessmentInitial1 &&
        (exerciseType.toLowerCase().includes('training') || exerciseType.toLowerCase().includes('assessment'));

      console.log('🎯 Question Fetching Debug:', {
        testType,
        exerciseType,
        test_number: testInfo.test_number,
        isGMATAssessmentInitial1,
        isGMATCycleBasedTest
      });

      // For no_sections mode, order only by question_number; otherwise by section then question_number
      let questions: Question[] = [];

      // For GMAT Assessment Iniziale 1, fetch from general pool by test_type (with pagination)
      // For GMAT cycle-based tests, fetch allocated questions based on student's cycle
      // For all other tests, fetch by test_id
      if (isGMATAssessmentInitial1) {
        console.log('✅ Fetching from GMAT question pool (all test_type=GMAT questions)');
        // Use pagination to avoid 1000 row limit
        const batchSize = 1000;
        let from = 0;
        let hasMore = true;

        while (hasMore) {
          let query = supabase
            .from('2V_questions')
            .select('*')
            .eq('test_type', testType);

          if (configData.section_order_mode === 'no_sections') {
            query = query.order('question_number');
          } else {
            query = query.order('section').order('question_number');
          }

          const { data: batch, error: batchError } = await query.range(from, from + batchSize - 1);

          if (batchError) throw batchError;

          if (batch && batch.length > 0) {
            questions = [...questions, ...batch] as Question[];
            from += batchSize;
            hasMore = batch.length === batchSize;
          } else {
            hasMore = false;
          }
        }
      } else if (isGMATCycleBasedTest) {
        // GMAT Cycle-Based Test: Get student's cycle and fetch allocated questions
        console.log('🔄 GMAT Cycle-Based Test: Fetching allocated questions');

        // Get student's GMAT progress (cycle)
        const studentProgress = await getStudentGMATProgress(assignment.student_id);

        if (!studentProgress) {
          // Student hasn't been assigned a cycle yet
          alert('You have not been assigned a GMAT preparation cycle yet. Please contact your tutor.');
          navigate(-1);
          return;
        }

        const studentCycle = studentProgress.gmat_cycle as GmatCycle;
        console.log('📊 Student GMAT Cycle:', studentCycle);

        // Parse test identifier to find matching template
        const { section, topic, materialType } = parseTestIdentifier({
          section: testInfo.section,
          exercise_type: exerciseType,
          materia: testInfo.materia,
          test_number: testInfo.test_number
        });

        console.log('🔍 Template matching:', { section, topic, materialType });

        // Find matching template
        const template = await findMatchingTemplate(section, topic, materialType);

        if (!template) {
          console.error('No matching template found for:', { section, topic, materialType });
          alert('No question allocation found for this test. Please contact your tutor.');
          navigate(-1);
          return;
        }

        console.log('✅ Found template:', template.id, template.title);

        // Get allocated question IDs for student's cycle
        const allocatedIds = await getAllocatedQuestionIds(template.id, studentCycle);

        if (!allocatedIds || allocatedIds.length === 0) {
          console.error('No questions allocated for cycle:', studentCycle);
          alert(`No questions have been allocated for the ${studentCycle} cycle. Please contact your tutor.`);
          navigate(-1);
          return;
        }

        console.log('📋 Allocated question IDs:', allocatedIds.length);

        // Fetch allocated questions by their IDs
        const { data: allocatedQuestions, error: allocError } = await supabase
          .from('2V_questions')
          .select('*')
          .in('id', allocatedIds);

        if (allocError) throw allocError;

        // Sort questions according to the allocation order
        const idOrderMap = new Map(allocatedIds.map((id, idx) => [id, idx]));
        questions = (allocatedQuestions || []).sort((a, b) => {
          const orderA = idOrderMap.get(a.id) ?? 999;
          const orderB = idOrderMap.get(b.id) ?? 999;
          return orderA - orderB;
        }) as unknown as Question[];

        console.log('✅ Fetched allocated GMAT questions:', questions.length);
      } else {
        console.log('📋 Fetching questions for specific test_id:', testId);

        // Check current auth state for RLS debugging
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔐 [RLS CHECK] Current auth user:', {
          userId: user?.id,
          email: user?.email,
          testId
        });

        // Query for questions where test_id matches OR testId is in additional_test_ids
        let query = supabase
          .from('2V_questions')
          .select('*')
          .or(`test_id.eq.${testId},additional_test_ids.cs.["${testId}"]`);

        if (configData.section_order_mode === 'no_sections') {
          query = query.order('question_number');
        } else {
          query = query.order('section').order('question_number');
        }

        const { data, error: questionsError } = await query as { data: Question[] | null; error: unknown };

        console.log('🔍 [DB QUERY] Query result:', {
          hasError: !!questionsError,
          error: questionsError,
          dataIsNull: data === null,
          dataLength: data?.length || 0,
          testId,
          tableName: '2V_questions'
        });

        if (questionsError) throw questionsError;
        questions = data || [];
      }

      console.log('📊 Questions fetched:', {
        count: questions?.length || 0,
        firstQuestion: questions?.[0] ? {
          id: questions[0].id,
          section: questions[0].section,
          question_number: questions[0].question_number
        } : null
      });

      // Parse question_data and answers fields if they are strings
      const parsedQuestions = (questions || []).map(q => ({
        ...q,
        question_data: typeof q.question_data === 'string'
          ? JSON.parse(q.question_data)
          : q.question_data,
        answers: typeof q.answers === 'string'
          ? JSON.parse(q.answers)
          : q.answers
      }));

      console.log('🔍 [QUESTIONS] Parsed questions:', {
        totalQuestions: parsedQuestions.length,
        firstQuestion: parsedQuestions[0] ? {
          id: parsedQuestions[0].id,
          question_data: parsedQuestions[0].question_data,
          section: parsedQuestions[0].section
        } : null
      });

      setAllQuestions(parsedQuestions);
      setQuestionPool(parsedQuestions); // Store full pool

      // Set up sections based on config
      let sectionsToUse: string[] = [];

      // Check if this is a no-sections test first
      if (configData.section_order_mode === 'no_sections') {
        // For no_sections mode, create a single virtual section with all questions
        sectionsToUse = ['All Questions'];
      } else if (configData.section_order_mode === 'mandatory' && configData.section_order && configData.section_order.length > 0) {
        sectionsToUse = configData.section_order;
      } else if (configData.section_order_mode?.includes('macro_sections') && configData.section_order && configData.section_order.length > 0) {
        // Use section_order from config when using macro_sections mode
        sectionsToUse = configData.section_order;
      } else if (configData.section_order_mode !== 'no_sections') {
        // Get unique sections from questions only if not in no_sections mode
        const sectionField = configData.section_order_mode?.includes('macro_sections')
          ? 'macro_section'
          : 'section';
        sectionsToUse = Array.from(new Set(
          questions?.map(q => (q as any)[sectionField]).filter(Boolean) || []
        ));
      }

      // Apply section adaptivity filtering if configured
      if (configData.section_adaptivity_config && Object.keys(configData.section_adaptivity_config).length > 0) {
        // For macro_section mode, use performance-based selection (initially only base sections)
        const useMacroSectionAdaptivity = configData.section_order_mode?.includes('macro_sections');
        sectionsToUse = filterSectionsWithAdaptivity(sectionsToUse, configData.section_adaptivity_config, useMacroSectionAdaptivity);
      }

      console.log('📑 [SECTIONS] Sections configured:', {
        sectionsToUse,
        sectionCount: sectionsToUse.length,
        sectionOrderMode: configData.section_order_mode
      });

      setSections(sectionsToUse);

      // Initialize question selection based on config
      const initialQuestions = prepareInitialQuestions(
        questions || [],
        configData,
        algorithmConfigData
      );

      console.log('✅ [INIT] Initial questions prepared:', {
        initialQuestionCount: initialQuestions.length,
        allQuestionsCount: questions?.length || 0,
        firstInitialQuestion: initialQuestions[0] ? {
          id: initialQuestions[0].id,
          section: initialQuestions[0].section
        } : null
      });

      setSelectedQuestions(initialQuestions);

      // Initialize adaptive algorithm if adaptive mode is enabled
      if (configData.adaptivity_mode === 'adaptive' && algorithmConfigData) {
        const algorithm = createAdaptiveAlgorithm({
          test_type: testType,
          track_type: trackTypeNormalized,
          algorithm_type: algorithmConfigData.algorithm_type || 'complex',
          simple_difficulty_increment: algorithmConfigData.simple_difficulty_increment,
          irt_model: algorithmConfigData.irt_model,
          initial_theta: algorithmConfigData.initial_theta,
          theta_min: algorithmConfigData.theta_min,
          theta_max: algorithmConfigData.theta_max,
          se_threshold: algorithmConfigData.se_threshold,
          max_information_weight: algorithmConfigData.max_information_weight,
          exposure_control: algorithmConfigData.exposure_control,
          use_base_questions: configData.use_base_questions,
          base_questions_scope: configData.base_questions_scope,
          base_questions_count: configData.base_questions_count,
        });
        setAdaptiveAlgorithm(algorithm);
      }

      // Initialize timer if needed (skip if guided mode with no time limit)
      if (configData.total_time_minutes && (!isGuidedMode || guidedTimed)) {
        let totalTimeSeconds = configData.total_time_minutes * 60; // Convert to seconds

        // Apply 30% extra time for students with special needs
        if (studentHasSpecialNeeds) {
          totalTimeSeconds = Math.round(totalTimeSeconds * 1.3);
          console.log('⏰ Special needs: Applied 30% extra time', {
            original: configData.total_time_minutes,
            adjusted: Math.round(totalTimeSeconds / 60)
          });
        }

        setTimeRemaining(totalTimeSeconds);
      }

      // Load existing answers if test is in progress (for current attempt only)
      if (assignment.status === 'in_progress' || assignment.status === 'completed') {
        const currentAttemptNumber = assignment.current_attempt || 1;
        const { data: existingAnswers, error: answersError} = await db
          .from(`2V_student_answers${tableSuffix}`)
          .select('*')
          .eq('assignment_id', assignmentId!)
          .eq('attempt_number', currentAttemptNumber) as { data: DbStudentAnswer[] | null; error: unknown };

        if (!answersError && existingAnswers) {

          // Transform loaded answers back to local state format
          const loadedAnswers: Record<string, StudentAnswer> = {};

          existingAnswers.forEach((dbAnswer) => {
            const questionId = dbAnswer.question_id;
            const jsonbAnswer = dbAnswer.answer;

            // Transform JSONB back to local format
            let localAnswer: Partial<StudentAnswer> = {
              questionId: questionId,
              flagged: dbAnswer.is_flagged || false,
              timeSpent: dbAnswer.time_spent_seconds || 0
            };

            // Detect format and transform using type guards
            if ('answer' in jsonbAnswer) {
              // Simple answer
              localAnswer.answer = jsonbAnswer.answer;
            } else if ('answers' in jsonbAnswer) {
              if (Array.isArray(jsonbAnswer.answers)) {
                // MSR question (array)
                localAnswer.msrAnswers = jsonbAnswer.answers;
                localAnswer.answer = jsonbAnswer.answers.join(',');
              } else {
                // Check if it's GI/TPA format (part1, part2) or TA format (row keys)
                // Type guard: GI/TPA format has 'part1' or 'part2' as keys (not numeric)
                const answerKeys = Object.keys(jsonbAnswer.answers);
                const isGIOrTPAFormat = answerKeys.includes('part1') || answerKeys.includes('part2');

                if (isGIOrTPAFormat) {
                  // GI or TPA format
                  const giTpaAnswer = jsonbAnswer.answers as { part1: string | null; part2: string | null };
                  localAnswer.blank1 = giTpaAnswer.part1 ?? undefined;
                  localAnswer.blank2 = giTpaAnswer.part2 ?? undefined;
                  localAnswer.column1 = giTpaAnswer.part1 ?? undefined; // For TPA
                  localAnswer.column2 = giTpaAnswer.part2 ?? undefined;
                  localAnswer.answer = `${giTpaAnswer.part1 || ''}|${giTpaAnswer.part2 || ''}`;
                } else {
                  // TA format
                  localAnswer.taAnswers = jsonbAnswer.answers as Record<number, 'true' | 'false'>;
                  localAnswer.answer = Object.values(jsonbAnswer.answers).join(',');
                }
              }
            }

            loadedAnswers[questionId] = localAnswer as StudentAnswer;
          });

          setAnswers(loadedAnswers);

          // Initialize globalQuestionOrder based on the highest question_order in existing answers
          const maxQuestionOrder = existingAnswers.reduce((max, answer) => {
            return Math.max(max, answer.question_order || 0);
          }, 0);
          console.log('🔢 [INIT] Initializing globalQuestionOrder from existing answers', {
            existingAnswersCount: existingAnswers.length,
            maxQuestionOrder: maxQuestionOrder,
            allQuestionOrders: existingAnswers.map(a => a.question_order).sort((a, b) => a - b)
          });
          setGlobalQuestionOrder(maxQuestionOrder);
        }
      }

    } catch (err) {
      alert('Failed to load test. Please try again.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  async function startTest() {
    // Check for multiple screens before starting
    const hasMultipleScreens = await checkMultipleScreens();
    if (hasMultipleScreens) {
      alert(t('takeTest.multipleScreensError'));
      return;
    }

    // Get current assignment status
    const { data: assignment, error: assignmentError } = await supabase
      .from('2V_test_assignments')
      .select('status, current_attempt, total_attempts')
      .eq('id', assignmentId!)
      .single() as { data: { status: string; current_attempt: number | null; total_attempts: number | null } | null; error: unknown };

    if (assignmentError || !assignment) {
      return;
    }

    // If restarting from annulled/incomplete, increment attempt
    if (assignment.status === 'annulled' || assignment.status === 'incomplete') {
      const newAttempt = (assignment.current_attempt || 1) + 1;
      const newTotalAttempts = assignment.total_attempts || (assignment.current_attempt || 1);


      const updateData1: {
        current_attempt: number;
        total_attempts: number;
        status: string;
        completion_status: string;
        start_time: string;
      } = {
        current_attempt: newAttempt,
        total_attempts: newTotalAttempts,
        status: 'in_progress',
        completion_status: 'in_progress',
        start_time: new Date().toISOString()
      };
      const { error: updateError } = await supabase
        .from('2V_test_assignments')
        .update(updateData1)
        .eq('id', assignmentId!);

      if (updateError) {
        return;
      }

      setCurrentAttempt(newAttempt);
    } else if (assignment.status === 'unlocked') {
      // First time starting this test

      const updateData2: {
        status: string;
        completion_status: string;
        start_time: string;
      } = {
        status: 'in_progress',
        completion_status: 'in_progress',
        start_time: new Date().toISOString()
      };
      const { error: updateError } = await supabase
        .from('2V_test_assignments')
        .update(updateData2)
        .eq('id', assignmentId!);

      if (updateError) {
        return;
      }

    }


    // Check if user needs to select section order
    if (config?.section_order_mode === 'user_choice' && userSelectedSections.length === 0) {
      setShowStartScreen(false);
      setShowSectionSelectionScreen(true);
      setUserSelectedSections([...sections]); // Initialize with default order
      return;
    }

    // Apply user-selected sections if any
    if (userSelectedSections.length > 0) {
      setSections(userSelectedSections);
    }

    setShowStartScreen(false);
    setShowSectionSelectionScreen(false);
    setTestLanguage(i18n.language); // Capture language at test start
    setTestStartTime(new Date());
    setSectionStartTime(new Date());

    // Enter fullscreen mode
    enterFullscreen();

    // Start timer based on current section
    startSectionTimer();
  }

  function beginTestWithSelectedSections() {
    setSections(userSelectedSections);

    // If adaptive mode with per_section base questions, prepare baseline questions for the FIRST section in user's order
    if (config?.adaptivity_mode === 'adaptive' &&
        config?.use_base_questions &&
        config?.base_questions_scope === 'per_section' &&
        userSelectedSections.length > 0) {

      const firstSection = userSelectedSections[0];
      const baselineDifficulty = config.baseline_difficulty || 2;

      // Helper to get correct section field
      const getSection = (q: Question) =>
        config?.section_order_mode?.includes('macro_sections') && q.macro_section
          ? q.macro_section
          : q.section;

      // Helper function to match difficulty
      const matchesDifficulty = (question: Question, targetDifficulty: number | string): boolean => {
        const qDiff = question.difficulty;
        if (typeof qDiff === typeof targetDifficulty) {
          return qDiff === targetDifficulty;
        }
        const difficultyMap: Record<number, string> = { 1: 'easy', 2: 'medium', 3: 'hard' };
        const reverseDifficultyMap: Record<string, number> = { 'easy': 1, 'medium': 2, 'hard': 3 };
        if (typeof targetDifficulty === 'number' && typeof qDiff === 'string') {
          return difficultyMap[targetDifficulty]?.toLowerCase() === qDiff.toLowerCase();
        } else if (typeof targetDifficulty === 'string' && typeof qDiff === 'number') {
          return reverseDifficultyMap[targetDifficulty.toLowerCase()] === qDiff;
        }
        return false;
      };

      // Get baseline questions for the first section with randomization and fallback
      let baseQuestionsCandidates = questionPool.filter(
        q => getSection(q) === firstSection && matchesDifficulty(q, baselineDifficulty)
      );

      const baseCount = config.base_questions_count || 0;

      // FALLBACK: If not enough questions with target difficulty
      if (baseQuestionsCandidates.length < baseCount) {
        // Get all questions from this section
        const allSectionQuestions = questionPool.filter(q => getSection(q) === firstSection);

        // Apply randomization if question_order is 'random'
        if (config.question_order === 'random') {
          baseQuestionsCandidates = [...allSectionQuestions].sort(() => Math.random() - 0.5);
        } else {
          baseQuestionsCandidates = allSectionQuestions;
        }
      } else {
        // Apply randomization if question_order is 'random'
        if (config.question_order === 'random') {
          baseQuestionsCandidates = [...baseQuestionsCandidates].sort(() => Math.random() - 0.5);
        }
        // else: keep sequential order (no shuffling)
      }

      const baseQuestionsForSection = baseQuestionsCandidates.slice(0, baseCount);

      // Mark as baseline
      baseQuestionsForSection.forEach(q => q.is_base = true);

      // Replace selectedQuestions with baseline questions for the first section
      setSelectedQuestions(baseQuestionsForSection);
    }

    setShowSectionSelectionScreen(false);
    setTestLanguage(i18n.language); // Capture language at test start
    setTestStartTime(new Date());
    setSectionStartTime(new Date());

    // Enter fullscreen mode
    enterFullscreen();

    startSectionTimer();
  }

  function moveSectionUp(index: number) {
    if (index === 0) return;
    const newSections = [...userSelectedSections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setUserSelectedSections(newSections);
  }

  function moveSectionDown(index: number) {
    if (index === userSelectedSections.length - 1) return;
    const newSections = [...userSelectedSections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setUserSelectedSections(newSections);
  }

  function handleDragStart(index: number) {
    setDraggedSectionIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();

    if (draggedSectionIndex === null || draggedSectionIndex === index) return;

    const newSections = [...userSelectedSections];
    const draggedSection = newSections[draggedSectionIndex];

    // Remove from old position
    newSections.splice(draggedSectionIndex, 1);
    // Insert at new position
    newSections.splice(index, 0, draggedSection);

    setUserSelectedSections(newSections);
    setDraggedSectionIndex(index);
  }

  function handleDragEnd() {
    setDraggedSectionIndex(null);
  }

  /** Calculate section time in seconds from config, handling special needs and adaptive suffixes */
  function getSectionTimeSeconds(sectionOverride?: string): number | null {
    // Skip timer in guided mode with no time limit
    if (isGuidedMode && !guidedTimed) return null;

    const section = sectionOverride || currentSection;
    let sectionTime: number | null = null;

    if (config?.time_per_section && section) {
      sectionTime = config.time_per_section[section];
      // If not found and this is an adaptive section (ends with -Easy or -Hard),
      // try the base section name (e.g., "RW2" from "RW2-Easy")
      if (!sectionTime && (section.endsWith('-Easy') || section.endsWith('-Hard'))) {
        const baseSection = section.replace(/-Easy|-Hard$/i, '');
        sectionTime = config.time_per_section[baseSection] || null;
      }
    } else if (config?.total_time_minutes && sections.length > 0) {
      let totalTime = config.total_time_minutes;
      if (hasSpecialNeeds) {
        totalTime = Math.round(totalTime * 1.3);
      }
      sectionTime = Math.round(totalTime / sections.length);
    }

    if (!sectionTime) return null;

    let sectionTimeSeconds = sectionTime * 60;
    if (hasSpecialNeeds && config?.time_per_section && section) {
      sectionTimeSeconds = Math.round(sectionTimeSeconds * 1.3);
      console.log('⏰ Special needs: Applied 30% extra time to section', {
        section,
        original: sectionTime,
        adjusted: Math.round(sectionTimeSeconds / 60)
      });
    }
    return sectionTimeSeconds;
  }

  function startSectionTimer(sectionOverride?: string) {
    setTimerActive(false);
    const seconds = getSectionTimeSeconds(sectionOverride);
    if (seconds !== null) {
      setTimeRemaining(seconds);
      setTimerActive(true);
    } else {
      setTimeRemaining(null);
    }
  }

  function handleTimeUp() {
    // Timer is automatically stopped by the hook when it reaches 0
    setTimerActive(false);

    // If in review mode, close the review screen and complete the section
    // Use refs to get actual values (avoids stale closure in timer callbacks)
    if (isInReviewModeRef.current || showReviewScreenRef.current) {
      setShowReviewScreen(false);
      showReviewScreenRef.current = false;
      setIsInReviewMode(false);
      isInReviewModeRef.current = false;
      setAnswerChangesUsed(0);
      // Call completeSection with a flag to skip the review mode check
      completeSectionAfterTimeUp();
      return;
    }

    // Complete the section instead of submitting the entire test
    // This will handle navigation to next section, pause screens, or final submission
    completeSection();
  }

  // Wire handleTimeUp to the ref used by useTestTimer's onTimeUp callback
  handleTimeUpRef.current = handleTimeUp;

  // Special version of completeSection that skips review mode check (called when time expires)
  function completeSectionAfterTimeUp() {
    // Prevent race condition: use ref for synchronous check
    if (isCompletingSectionRef.current) {
      return;
    }

    // Set ref immediately for synchronous guard
    isCompletingSectionRef.current = true;

    // Use refs to get actual values (avoids stale closure in timer callbacks)
    const actualCurrentSection = sections[currentSectionIndexRef.current];
    const actualCurrentSectionIndex = currentSectionIndexRef.current;
    const actualPausesUsed = pausesUsedRef.current;

    setIsCompletingSection(true);

    // Stop the section timer to prevent it from running during pause
    setTimerActive(false);

    // Check for mandatory pause
    if (config?.pause_mode === 'between_sections' &&
        config.pause_sections?.includes(actualCurrentSection)) {
      const pauseDuration = (config.pause_duration_minutes || 5) * 60;
      console.log('⏸️ [PAUSE] Mandatory pause triggered', {
        section: actualCurrentSection,
        sectionIndex: actualCurrentSectionIndex,
        pauseDurationMinutes: config.pause_duration_minutes,
        pauseDurationSeconds: pauseDuration,
        pauseMode: config.pause_mode,
        pauseSections: config.pause_sections
      });
      setPauseTimeRemaining(pauseDuration);
      setShowPauseScreen(true);
      setTimeout(() => {
        console.log('▶️ [PAUSE] Mandatory pause ended, resuming test', {
          section: actualCurrentSection,
          nextSectionIndex: actualCurrentSectionIndex + 1
        });
        setShowPauseScreen(false);
        setPauseTimeRemaining(null);
        setIsCompletingSection(false);
        isCompletingSectionRef.current = false;
        moveToNextSection(actualCurrentSectionIndex);
      }, pauseDuration * 1000);
      return;
    }

    // Check for user choice pause (only if not the last section and pauses remaining)
    if (config?.pause_mode === 'user_choice' &&
        actualCurrentSectionIndex < sections.length - 1 &&
        actualPausesUsed < (config?.max_pauses || 0)) {
      console.log('⏸️ [PAUSE] User choice pause screen shown', {
        section: actualCurrentSection,
        sectionIndex: actualCurrentSectionIndex,
        pausesUsed: actualPausesUsed,
        pausesRemaining: (config?.max_pauses || 0) - actualPausesUsed,
        maxPauses: config?.max_pauses,
        countdownSeconds: 5,
        pauseMode: config.pause_mode
      });
      // IMPORTANT: Reset countdown and ref BEFORE showing the screen
      pauseChoiceMadeRef.current = false;
      showPauseChoiceRef.current = true;
      setPauseChoiceCountdown(5);
      setPauseChoiceTrigger(prev => prev + 1);
      setShowPauseChoiceScreen(true);
      setTimeout(() => {
        setIsCompletingSection(false);
        isCompletingSectionRef.current = false;
      }, 500);
      return;
    }

    // No pause - show transition message (if not the last section)
    if (actualCurrentSectionIndex < expectedTotalSections - 1) {
      console.log('⏭️ [PAUSE] No pause configured - showing section transition', {
        section: actualCurrentSection,
        sectionIndex: actualCurrentSectionIndex,
        nextSectionIndex: actualCurrentSectionIndex + 1,
        pauseMode: config?.pause_mode
      });
      setShowSectionTransition(true);
      setTimeout(() => {
        setIsCompletingSection(false);
        isCompletingSectionRef.current = false;
      }, 500);
      return;
    }

    // Last section - move to completion
    console.log('⏭️ [PAUSE] Last section - no pause, moving to completion', {
      section: actualCurrentSection,
      sectionIndex: actualCurrentSectionIndex,
      pauseMode: config?.pause_mode
    });
    moveToNextSection(actualCurrentSectionIndex);
  }

  // handleAnswerSelect, DI helpers, handleRendererAnswerChange, toUnifiedAnswer, toggleFlag
  // — now provided by useAnswerManagement hook

  function canGoBack(): boolean {
    if (!config) {
      return false;
    }

    // PREVIEW MODE: Always allow back except at very first question
    if (isPreviewMode) {
      return currentQuestionIndex > 0;
    }

    // Can't go back if at first question of first section
    if (currentSectionIndex === 0 && currentQuestionIndex === 0) {
      return false;
    }

    // Check navigation within section
    if (currentQuestionIndex > 0 && config.navigation_mode === 'back_forward') {
      return true;
    }

    // Check navigation between sections
    if (currentQuestionIndex === 0 && currentSectionIndex > 0 &&
        config.navigation_between_sections === 'back_forward') {
      return true;
    }

    return false;
  }

  async function goToPreviousQuestion() {
    // Extra safety: reject if time has expired
    if (timeRemaining !== null && timeRemaining <= 0) {
      return;
    }

    // Prevent race condition: if already navigating, ignore this call
    if (isTransitioning) {
      return;
    }

    if (!canGoBack()) return;

    setIsTransitioning(true);

    try {
      // Cancel any pending auto-save since we're doing an immediate save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // Save current answer before navigating back (or save empty answer to track question order)
      if (currentQuestion?.id) {
      await saveAnswer(
        currentQuestion.id,
        answers[currentQuestion.id] || { answer: null },
        answers[currentQuestion.id]?.flagged || false,
        0,
        globalQuestionOrder + 1
      );
    }

      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (currentSectionIndex > 0) {
        // Move to previous section's last question
        setCurrentSectionIndex(currentSectionIndex - 1);
        const prevSectionQuestions = allQuestions.filter(
          q => getSectionField(q) === sections[currentSectionIndex - 1]
        );
        setCurrentQuestionIndex(prevSectionQuestions.length - 1);
      }
    } finally {
      setIsTransitioning(false);
    }
  }

  // saveAnswer — now provided by useAnswerManagement hook

  async function goToNextQuestion() {
    console.log('🔍 [NAVIGATION] goToNextQuestion called', {
      currentQuestionIndex,
      globalQuestionOrder,
      currentSection,
      isTransitioning,
      timeRemaining,
      willSaveCurrentQuestionWithOrder: globalQuestionOrder + 1
    });

    // Extra safety: reject if time has expired
    if (timeRemaining !== null && timeRemaining <= 0) {
      console.log('⚠️ [NAVIGATION] Rejected - time expired');
      return;
    }

    // Prevent race condition: if already navigating, ignore this call
    if (isTransitioning) {
      console.log('⚠️ [NAVIGATION] Rejected - already transitioning');
      return;
    }

    console.log('✅ [NAVIGATION] Starting navigation');
    setIsTransitioning(true);

    try {
      // Cancel any pending auto-save since we're doing an immediate save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // Save current answer immediately before navigating (or save empty answer to track question order)
      if (currentQuestion?.id) {
        const saved = await saveAnswer(
          currentQuestion.id,
          answers[currentQuestion.id] || { answer: null },
          answers[currentQuestion.id]?.flagged || false,
          0,
          globalQuestionOrder + 1
        );

        // Block navigation if save failed
        if (!saved) {
          console.log('⚠️ [NAVIGATION] Blocked - save failed');
          setIsTransitioning(false);
          return;
        }
      }

    // Check if answer is required
    console.log('📝 [VALIDATION] Checking blank answers:', {
      can_leave_blank: config?.can_leave_blank,
      willValidate: config?.can_leave_blank === false
    });

    if (config?.can_leave_blank === false) {
      const currentAnswer = answers[currentQuestion?.id];

      // Basic check: does any answer exist?
      if (!currentAnswer?.answer) {
        setIsPartialAnswer(false);
        setShowAnswerRequiredMessage(true);
        return;
      }

      // For multi-part questions, check if ALL parts are answered
      const questionData = currentQuestion?.question_data;

      // MSR questions: all questions must be answered
      if (questionData?.di_type === 'MSR') {
        const questions = questionData.questions || [];
        const msrAnswers = currentAnswer.msrAnswers || [];

        if (msrAnswers.length < questions.length || msrAnswers.some(a => !a)) {
          // Check if ANY are answered (partial)
          const hasAnyAnswer = msrAnswers.some(a => a);
          setIsPartialAnswer(hasAnyAnswer);
          setShowAnswerRequiredMessage(true);
          return;
        }
      }

      // GI questions: both blanks must be filled
      if (questionData?.di_type === 'GI') {
        if (!currentAnswer.blank1 || !currentAnswer.blank2) {
          // Check if one is answered (partial)
          const hasAnyAnswer = !!(currentAnswer.blank1 || currentAnswer.blank2);
          setIsPartialAnswer(hasAnyAnswer);
          setShowAnswerRequiredMessage(true);
          return;
        }
      }

      // TA questions: all statements must be answered
      if (questionData?.di_type === 'TA') {
        const statements = questionData.statements || [];
        const taAnswers = currentAnswer.taAnswers || {};

        if (Object.keys(taAnswers).length < statements.length) {
          // Has partial answer if any statements are answered
          setIsPartialAnswer(Object.keys(taAnswers).length > 0);
          setShowAnswerRequiredMessage(true);
          return;
        }

        // Check that all statement indices are answered
        for (let i = 0; i < statements.length; i++) {
          if (!taAnswers[i]) {
            // Has partial answer
            setIsPartialAnswer(true);
            setShowAnswerRequiredMessage(true);
            return;
          }
        }
      }

      // TPA questions: both columns must be answered
      if (questionData?.di_type === 'TPA') {
        if (!currentAnswer.column1 || !currentAnswer.column2) {
          // Check if one is answered (partial)
          const hasAnyAnswer = !!(currentAnswer.column1 || currentAnswer.column2);
          setIsPartialAnswer(hasAnyAnswer);
          setShowAnswerRequiredMessage(true);
          return;
        }
      }
    }

    // Handle adaptive/random question selection
    if (config?.adaptivity_mode === 'adaptive') {
      // Determine if base questions are completed for THIS section
      let baseQuestionsCompletedForSection = false;

      if (config.base_questions_scope === 'per_section') {
        // Check if we've ANSWERED (not just prepared) base questions for the current section
        // We need to check currentQuestionIndex, not selectedQuestions.length
        const currentSectionQuestions = selectedQuestions.filter(q => getSectionField(q) === currentSection);
        const baselineQuestionsInSection = currentSectionQuestions.filter(q => q.is_base);

        // Baseline questions are completed if we're ABOUT TO ANSWER or have already answered all baseline questions
        // When clicking "Next" from the last baseline question (e.g., index 3 when there are 4 baseline questions),
        // we need to transition to adaptive mode, so we check if the NEXT question index would be >= baseline count
        baseQuestionsCompletedForSection = (currentQuestionIndex + 1) >= baselineQuestionsInSection.length;

        // Also check if marked as completed
        if (!baseQuestionsCompletedPerSection[currentSection] && baseQuestionsCompletedForSection) {
          setBaseQuestionsCompletedPerSection(prev => ({ ...prev, [currentSection]: true }));
        }
      } else {
        // For 'per_test' scope, use global completion status
        if (adaptiveAlgorithm) {
          const algorithmState = adaptiveAlgorithm.getState();
          baseQuestionsCompletedForSection = algorithmState.base_questions_completed;
        } else {
          // No algorithm, check manually
          baseQuestionsCompletedForSection = selectedQuestions.length >= (config.base_questions_count || 0);
        }
      }

      // Check if we need to select next question
      if (baseQuestionsCompletedForSection) {
        // Get questions already shown in THIS section
        const sectionSelectedQuestions = selectedQuestions.filter(q => getSectionField(q) === currentSection);

        // Check if we've reached the question limit for this section
        // IMPORTANT: For Data Insights, count MSR/TA sets as 1 effective question
        // We must count ANSWERED questions (up to currentQuestionIndex + 1), not ALL selected questions
        let questionLimitForSection = 20; // default
        if (config.questions_per_section) {
          questionLimitForSection = config.questions_per_section[currentSection] || 20;

          // Get questions that have been ANSWERED (shown and completed)
          // currentQuestionIndex is 0-based, so +1 gives us the count of questions answered
          // We're in goToNextQuestion, so the current question has been answered
          const answeredQuestionsCount = currentQuestionIndex + 1;
          const answeredQuestions = sectionSelectedQuestions.slice(0, answeredQuestionsCount);

          // Calculate effective question count for DI section
          const isDataInsights = currentSection?.toLowerCase().includes('data insights') ||
            currentSection?.toLowerCase().includes('di') ||
            answeredQuestions.some(q => q.question_data?.di_type);

          let effectiveQuestionCount = answeredQuestionsCount;

          if (isDataInsights) {
            // For MSR/TA sets to count as 1 effective question, ALL questions in the set must be answered
            // First, build a map of all MSR/TA groups in the selected questions (not just answered)
            const allGroupSizes: Map<string, number> = new Map();

            sectionSelectedQuestions.forEach(q => {
              const diType = q.question_data?.di_type;
              if (diType === 'MSR' && q.question_data?.sources) {
                const sources = q.question_data.sources;
                const sourceKey = 'MSR:' + sources.map((s: any) =>
                  `${s.tab_name}:${s.content_type}:${(s.content || '').substring(0, 100)}`
                ).join('|');
                allGroupSizes.set(sourceKey, (allGroupSizes.get(sourceKey) || 0) + 1);
              } else if (diType === 'TA' && q.question_data?.table_data) {
                const tableTitle = q.question_data.table_title || '';
                const firstRow = q.question_data.table_data?.[0]?.join(',') || '';
                const headers = q.question_data.column_headers?.join(',') || '';
                const sourceKey = `TA:${tableTitle}:${headers}:${firstRow}`;
                allGroupSizes.set(sourceKey, (allGroupSizes.get(sourceKey) || 0) + 1);
              }
            });

            // Now count how many questions from each group have been answered
            const answeredGroupCounts: Map<string, number> = new Map();
            let individualCount = 0;

            answeredQuestions.forEach(q => {
              const diType = q.question_data?.di_type;
              if (diType === 'MSR' && q.question_data?.sources) {
                const sources = q.question_data.sources;
                const sourceKey = 'MSR:' + sources.map((s: any) =>
                  `${s.tab_name}:${s.content_type}:${(s.content || '').substring(0, 100)}`
                ).join('|');
                answeredGroupCounts.set(sourceKey, (answeredGroupCounts.get(sourceKey) || 0) + 1);
              } else if (diType === 'TA' && q.question_data?.table_data) {
                const tableTitle = q.question_data.table_title || '';
                const firstRow = q.question_data.table_data?.[0]?.join(',') || '';
                const headers = q.question_data.column_headers?.join(',') || '';
                const sourceKey = `TA:${tableTitle}:${headers}:${firstRow}`;
                answeredGroupCounts.set(sourceKey, (answeredGroupCounts.get(sourceKey) || 0) + 1);
              } else {
                individualCount++;
              }
            });

            // Count completed groups (where ALL questions in the group have been answered)
            let completedGroupsCount = 0;
            answeredGroupCounts.forEach((answeredCount, groupKey) => {
              const totalInGroup = allGroupSizes.get(groupKey) || 0;
              if (answeredCount >= totalInGroup) {
                completedGroupsCount++;
              }
            });

            effectiveQuestionCount = completedGroupsCount + individualCount;
            console.log(`📊 [SECTION LIMIT] Effective questions completed: ${effectiveQuestionCount} (${answeredQuestionsCount} actual answered, ${completedGroupsCount} MSR/TA sets fully completed)`);
          }

          if (effectiveQuestionCount >= questionLimitForSection) {
            console.log(`🏁 [SECTION LIMIT] Reached limit: ${effectiveQuestionCount}/${questionLimitForSection} effective questions`);
            completeSection();
            return;
          }
        }

        const answeredQuestionIds = new Set(sectionSelectedQuestions.map(q => q.id));

        // Get available questions from pool (not yet shown in this section)
        let availableQuestions = questionPool.filter(
          q => !answeredQuestionIds.has(q.id) && getSectionField(q) === currentSection
        );

        // GMAT DI SUBTYPE BALANCING FOR ADAPTIVE MODE
        // Check if we need to force inclusion of underrepresented DI types
        const isDataInsightsSection = currentSection?.toLowerCase().includes('data insights') ||
          currentSection?.toLowerCase().includes('di') ||
          availableQuestions.some(q => q.question_data?.di_type);

        // Helper to get source group key for MSR/TA questions (same logic as in prepareInitialQuestions)
        const getAdaptiveSourceGroupKey = (question: Question): string | null => {
          const diType = question.question_data?.di_type;
          if (diType === 'MSR' && question.question_data?.sources) {
            const sources = question.question_data.sources;
            const sourceKey = sources.map((s: any) =>
              `${s.tab_name}:${s.content_type}:${(s.content || '').substring(0, 100)}`
            ).join('|');
            return `MSR:${sourceKey}`;
          }
          if (diType === 'TA' && question.question_data?.table_data) {
            const tableTitle = question.question_data.table_title || '';
            const firstRow = question.question_data.table_data?.[0]?.join(',') || '';
            const headers = question.question_data.column_headers?.join(',') || '';
            return `TA:${tableTitle}:${headers}:${firstRow}`;
          }
          return null;
        };

        // Helper to find all related questions (same source group)
        const findRelatedQuestions = (question: Question, pool: Question[]): Question[] => {
          const groupKey = getAdaptiveSourceGroupKey(question);
          if (!groupKey) return [question];

          const related = pool.filter(q => getAdaptiveSourceGroupKey(q) === groupKey);
          return related.length > 0 ? related : [question];
        };

        // Helper to calculate what effective count would be after adding questions
        // This counts unique MSR/TA groups as 1 each, plus individual questions
        const calculateEffectiveAfterAdding = (newQuestions: Question[]): number => {
          // Combine already selected questions with new questions to be added
          const allQuestionsAfterAdd = [...sectionSelectedQuestions, ...newQuestions];

          // Count unique MSR/TA groups and individual questions
          const groupKeys = new Set<string>();
          let individualCount = 0;

          allQuestionsAfterAdd.forEach(q => {
            const diType = q.question_data?.di_type;
            if (diType === 'MSR' && q.question_data?.sources) {
              const sources = q.question_data.sources;
              const sourceKey = 'MSR:' + sources.map((s: any) =>
                `${s.tab_name}:${s.content_type}:${(s.content || '').substring(0, 100)}`
              ).join('|');
              groupKeys.add(sourceKey);
            } else if (diType === 'TA' && q.question_data?.table_data) {
              const tableTitle = q.question_data.table_title || '';
              const firstRow = q.question_data.table_data?.[0]?.join(',') || '';
              const headers = q.question_data.column_headers?.join(',') || '';
              const sourceKey = `TA:${tableTitle}:${headers}:${firstRow}`;
              groupKeys.add(sourceKey);
            } else {
              individualCount++;
            }
          });

          const projectedEffective = groupKeys.size + individualCount;
          console.log(`📊 [PROJECTION] After adding ${newQuestions.length} questions: ${projectedEffective} effective (${groupKeys.size} groups + ${individualCount} individual)`);
          return projectedEffective;
        };

        if (isDataInsightsSection && availableQuestions.length > 0) {
          const DI_TYPES = ['DS', 'GI', 'TA', 'TPA', 'MSR'] as const;
          const MIN_PER_TYPE = { 'DS': 2, 'GI': 2, 'TA': 2, 'TPA': 2, 'MSR': 2 };

          // Count already selected per type
          const selectedPerType: Record<string, number> = {};
          DI_TYPES.forEach(type => {
            selectedPerType[type] = sectionSelectedQuestions.filter(q => q.question_data?.di_type === type).length;
          });

          // Find types that haven't met minimum
          const underrepresentedTypes = DI_TYPES.filter(type => selectedPerType[type] < MIN_PER_TYPE[type]);

          if (underrepresentedTypes.length > 0) {
            // Filter available questions to prioritize underrepresented types
            const priorityQuestions = availableQuestions.filter(q =>
              q.question_data?.di_type && underrepresentedTypes.includes(q.question_data.di_type)
            );

            if (priorityQuestions.length > 0) {
              console.log('🎯 [DI BALANCE] Prioritizing underrepresented DI types:', underrepresentedTypes);
              console.log('🎯 [DI BALANCE] Current distribution:', selectedPerType);
              console.log('🎯 [DI BALANCE] Priority questions available:', priorityQuestions.length);

              // Force selection from underrepresented types
              // Override adaptive algorithm temporarily
              const randomIndex = Math.floor(Math.random() * priorityQuestions.length);
              const forcedQuestion = priorityQuestions[randomIndex];

              if (forcedQuestion) {
                // For MSR/TA, find and add ALL related questions together
                const relatedQuestions = findRelatedQuestions(forcedQuestion, availableQuestions);

                // CHECK: Would adding these questions exceed the limit?
                const projectedEffective = calculateEffectiveAfterAdding(relatedQuestions);
                if (projectedEffective > questionLimitForSection) {
                  console.log(`🛑 [DI BALANCE] Adding ${relatedQuestions.length} questions would exceed limit (${projectedEffective} > ${questionLimitForSection}), completing section`);
                  completeSection();
                  return;
                }

                console.log('✅ [DI BALANCE] Forcing question of type:', forcedQuestion.question_data?.di_type);
                if (relatedQuestions.length > 1) {
                  console.log('🔗 [DI BALANCE] Adding', relatedQuestions.length, 'related questions together');
                }

                // Mark all as non-baseline and add to selection
                relatedQuestions.forEach(q => q.is_base = false);
                setSelectedQuestions(prev => [...prev, ...relatedQuestions]);
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setGlobalQuestionOrder(globalQuestionOrder + 1);
                return;
              }
            }
          }
        }

        if (availableQuestions.length > 0) {
          let nextQuestion: Question | undefined;

          console.log('🔍 [NAVIGATION] Selecting next adaptive question', {
            availableCount: availableQuestions.length,
            section: currentSection,
            baseQuestionsCompleted: baseQuestionsCompletedForSection
          });

          if (adaptiveAlgorithm) {
            // Use adaptive algorithm to select next question
            const selected = await adaptiveAlgorithm.selectNextQuestion(
              availableQuestions,
              currentSection
            );
            nextQuestion = (selected as Question | null) ?? undefined;
            console.log('🔍 [NAVIGATION] Algorithm returned:', {
              hasQuestion: !!nextQuestion,
              questionId: nextQuestion?.id?.substring(0, 8)
            });
          } else {
            // No algorithm configured - respect question_order config
            if (config.question_order === 'random') {
              // Select randomly
              const randomIndex = Math.floor(Math.random() * availableQuestions.length);
              nextQuestion = availableQuestions[randomIndex];
            } else {
              // Select sequentially (first available question)
              nextQuestion = availableQuestions[0];
            }
          }

          if (nextQuestion) {
            // For MSR/TA questions, find and add ALL related questions together
            const diType = nextQuestion.question_data?.di_type;
            let questionsToAdd: Question[] = [nextQuestion];

            if (diType === 'MSR' || diType === 'TA') {
              const relatedQuestions = findRelatedQuestions(nextQuestion, availableQuestions);
              if (relatedQuestions.length > 1) {
                questionsToAdd = relatedQuestions;
                console.log('🔗 [NAVIGATION] MSR/TA question has', relatedQuestions.length, 'related questions - adding together');
              }
            }

            // CHECK: Would adding these questions exceed the limit?
            const projectedEffective = calculateEffectiveAfterAdding(questionsToAdd);
            if (projectedEffective > questionLimitForSection) {
              console.log(`🛑 [NAVIGATION] Adding ${questionsToAdd.length} questions would exceed limit (${projectedEffective} > ${questionLimitForSection}), completing section`);
              completeSection();
              return;
            }

            console.log('✅ [NAVIGATION] Adding adaptive question(s) to selection', {
              questionId: nextQuestion.id.substring(0, 8),
              section: currentSection,
              count: questionsToAdd.length,
              newQuestionIndex: currentQuestionIndex + 1
            });

            // Explicitly mark as NOT baseline (adaptive question)
            questionsToAdd.forEach(q => q.is_base = false);

            // Add to selected questions
            setSelectedQuestions(prev => [...prev, ...questionsToAdd]);

            // Move to the new question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setGlobalQuestionOrder(globalQuestionOrder + 1);
            return;
          } else {
            console.warn('⚠️ [NAVIGATION] No question returned from algorithm, will fall through to standard navigation');
          }
        } else {
          console.log('🏁 [NAVIGATION] No more questions available in section, completing section', {
            section: currentSection
          });
          // No more questions available in this section - complete section
          completeSection();
          return;
        }
      }
    }

    // Standard navigation (non-adaptive or during base questions)
    if (config?.adaptivity_mode === 'adaptive') {
      // In adaptive mode during base questions, move to next question
      // Check if we're at the last question currently in selectedQuestions
      if (currentQuestionIndex < totalQuestionsInSection - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setGlobalQuestionOrder(globalQuestionOrder + 1);
      } else {
        // We're at the last selected question
        // The adaptive logic above should have added a new question if base questions are complete
        // If it didn't (no more questions available), it already called completeSection()
        // Just as a safety, do nothing here - the adaptive logic handles it
      }
    } else {
      // Non-adaptive mode: check if we're at the end of section
      if (currentQuestionIndex < totalQuestionsInSection - 1) {
        console.log('➡️ [NAVIGATION] Moving to next question', {
          from: {
            questionIndex: currentQuestionIndex,
            globalQuestionOrder: globalQuestionOrder
          },
          to: {
            questionIndex: currentQuestionIndex + 1,
            globalQuestionOrder: globalQuestionOrder + 1
          }
        });
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setGlobalQuestionOrder(globalQuestionOrder + 1);
      } else {
        completeSection();
      }
    }
    } finally {
      setIsTransitioning(false);
    }
  }

  function completeSection() {
    // Prevent race condition: use ref for synchronous check
    if (isCompletingSectionRef.current) {
      return;
    }

    // Check if review mode is enabled and not already in review
    if (config?.allow_review_at_end && !isInReviewMode) {
      enterReviewMode();
      return;
    }

    // Set ref immediately for synchronous guard
    isCompletingSectionRef.current = true;

    // Use refs to get actual values (avoids stale closure in timer callbacks)
    const actualCurrentSection = sections[currentSectionIndexRef.current];
    const actualCurrentSectionIndex = currentSectionIndexRef.current;
    const actualPausesUsed = pausesUsedRef.current;

    setIsCompletingSection(true);

    // Stop the section timer to prevent it from running during pause
    setTimerActive(false);

    // Check for mandatory pause
    if (config?.pause_mode === 'between_sections' &&
        config.pause_sections?.includes(actualCurrentSection)) {
      const pauseDuration = (config.pause_duration_minutes || 5) * 60;
      console.log('⏸️ [PAUSE] Mandatory pause triggered', {
        section: actualCurrentSection,
        sectionIndex: actualCurrentSectionIndex,
        pauseDurationMinutes: config.pause_duration_minutes,
        pauseDurationSeconds: pauseDuration,
        pauseMode: config.pause_mode,
        pauseSections: config.pause_sections
      });
      setPauseTimeRemaining(pauseDuration);
      setShowPauseScreen(true);
      setTimeout(() => {
        console.log('▶️ [PAUSE] Mandatory pause ended, resuming test', {
          section: actualCurrentSection,
          nextSectionIndex: actualCurrentSectionIndex + 1
        });
        setShowPauseScreen(false);
        setPauseTimeRemaining(null);
        setIsCompletingSection(false);
        isCompletingSectionRef.current = false;
        moveToNextSection(actualCurrentSectionIndex);
      }, pauseDuration * 1000);
      return;
    }

    // Check for user choice pause (only if not the last section and pauses remaining)
    if (config?.pause_mode === 'user_choice' &&
        actualCurrentSectionIndex < sections.length - 1 &&
        actualPausesUsed < (config?.max_pauses || 0)) {
      // IMPORTANT: Reset countdown and ref BEFORE showing the screen
      pauseChoiceMadeRef.current = false;
      showPauseChoiceRef.current = true; // Set ref to persist across StrictMode remounts
      setPauseChoiceCountdown(5);
      setPauseChoiceTrigger(prev => prev + 1); // Trigger useEffect to start countdown
      setShowPauseChoiceScreen(true);
      // Reset flag when user makes choice
      setTimeout(() => {
        setIsCompletingSection(false);
        isCompletingSectionRef.current = false;
      }, 500);
      return;
    }

    // No pause - show transition message (if not the last section)
    if (actualCurrentSectionIndex < expectedTotalSections - 1) {
      setShowSectionTransition(true);
      // Reset flag when transition completes
      setTimeout(() => {
        setIsCompletingSection(false);
        isCompletingSectionRef.current = false;
      }, 500);
      return;
    }

    // Last section - move to completion
    // Note: Don't reset refs here - let submitTest handle completion
    // This prevents race conditions from multiple timer callbacks
    moveToNextSection(actualCurrentSectionIndex);
  }
  // Keep completeSectionRef in sync so useReviewMode.completeReview() calls the latest version
  completeSectionRef.current = completeSection;

  // handleSectionTransitionComplete, savePauseEventToDatabase, handleTakePause, handleSkipPause
  // — now provided by usePauseManagement hook

  function moveToNextSection(sectionIndexOverride?: number) {
    // Use override if provided (to avoid stale closure issues), otherwise use state
    const currentIndex = sectionIndexOverride !== undefined ? sectionIndexOverride : currentSectionIndex;

    // MACRO SECTION ADAPTIVITY: Check if we just finished a base section and need to add adaptive section
    const useMacroSectionAdaptivity = config?.section_order_mode?.includes('macro_sections') &&
                                       config?.section_adaptivity_config &&
                                       Object.keys(config.section_adaptivity_config).length > 0;

    if (useMacroSectionAdaptivity) {
      const currentSection = sections[currentIndex];
      const sectionConfig = config!.section_adaptivity_config![currentSection];

      // If we just finished a base section, calculate performance and add next adaptive section
      if (sectionConfig?.type === 'base') {
        // Calculate performance in the current (finished) base section
        const currentSectionQuestions = selectedQuestions.filter(q => {
          const qSection = config?.section_order_mode?.includes('macro_sections') && q.macro_section
            ? q.macro_section
            : q.section;
          return qSection === currentSection;
        });

        const answeredQuestions = currentSectionQuestions.filter(q => answers[q.id]?.answer);
        const correctAnswers = answeredQuestions.filter(q => {
          const answer = answers[q.id]?.answer;
          return answer === q.correct_answer;
        });

        const percentCorrect = answeredQuestions.length > 0
          ? (correctAnswers.length / answeredQuestions.length) * 100
          : 0;


        // Find the next adaptive group in the original config order
        // Look through config.section_order to find the next adaptive group after current base section
        const allConfigSections = config?.section_order || [];
        const currentSectionIndexInConfig = allConfigSections.indexOf(currentSection);

        // Find next adaptive group (sections with same prefix but different difficulties)
        let adaptiveSectionToAdd: string | null = null;

        for (let i = currentSectionIndexInConfig + 1; i < allConfigSections.length; i++) {
          const candidateSection = allConfigSections[i];
          const candidateConfig = config!.section_adaptivity_config![candidateSection];

          if (candidateConfig?.type === 'adaptive') {
            // Found an adaptive section - determine if it's Easy or Hard
            const isHardSection = candidateSection.endsWith('-Hard');
            const isEasySection = candidateSection.endsWith('-Easy');

            if (isHardSection || isEasySection) {
              // Extract group prefix (e.g., "RW2" from "RW2-Easy" or "RW2-Hard")
              const groupPrefix = candidateSection.replace(/-Easy|-Hard$/i, '');

              // Choose Hard if ≥65%, otherwise Easy
              if (percentCorrect >= 65) {
                adaptiveSectionToAdd = `${groupPrefix}-Hard`;
              } else {
                adaptiveSectionToAdd = `${groupPrefix}-Easy`;
              }

              break;
            }
          }
        }

        // Add the adaptive section to the sections array if found
        if (adaptiveSectionToAdd && !sections.includes(adaptiveSectionToAdd)) {
          let insertIndex = currentIndex + 1; // Default: insert right after current section

          // Find the correct insertion position based on config order
          const adaptiveSectionIndexInConfig = allConfigSections.indexOf(adaptiveSectionToAdd);
          const newSections = [...sections];

          for (let i = 0; i < newSections.length; i++) {
            const sectionIndexInConfig = allConfigSections.indexOf(newSections[i]);
            if (sectionIndexInConfig > adaptiveSectionIndexInConfig) {
              insertIndex = i;
              break;
            }
          }

          newSections.splice(insertIndex, 0, adaptiveSectionToAdd);
          setSections(newSections);

          // Move to the newly added adaptive section immediately
          setCurrentSectionIndex(insertIndex);
          setCurrentQuestionIndex(0);
          // Increment globalQuestionOrder since we're moving to a new question
          setGlobalQuestionOrder(prev => prev + 1);
          setSectionStartTime(new Date());

          // Restart timer for the new adaptive section
          startSectionTimer(adaptiveSectionToAdd);
          return; // Exit early - we've already moved to the next section
        }
      }
    }

    if (currentIndex < sections.length - 1) {
      const nextSectionIndex = currentIndex + 1;
      const nextSection = sections[nextSectionIndex];

      setCurrentSectionIndex(nextSectionIndex);
      setCurrentQuestionIndex(0);
      // Increment globalQuestionOrder since we're moving to a new question (first of next section)
      setGlobalQuestionOrder(prev => prev + 1);
      setSectionStartTime(new Date());


      // For adaptive mode with per_section base questions, reset algorithm state and add base questions for new section
      if (config?.adaptivity_mode === 'adaptive' &&
          config?.use_base_questions &&
          config?.base_questions_scope === 'per_section') {

        // Capture per-section theta before resetting (for GMAT IRT scoring)
        if (adaptiveAlgorithm instanceof ComplexAdaptiveAlgorithm && config?.test_type === 'GMAT') {
          const completedSection = sections[currentIndex];
          if (completedSection) {
            const thetaData = { theta: adaptiveAlgorithm.getFinalTheta(), se: adaptiveAlgorithm.getFinalSE() };
            sectionThetasRef.current = { ...sectionThetasRef.current, [completedSection]: thetaData };
          }
        }

        // Reset adaptive algorithm state for new section
        if (adaptiveAlgorithm) {
          adaptiveAlgorithm.resetForNewSection();
        }

        // Determine baseline difficulty
        let baselineDifficulty = config.baseline_difficulty || 2;

        // Helper to get correct section field
        const getSection = (q: Question) =>
          config?.section_order_mode?.includes('macro_sections') && q.macro_section
            ? q.macro_section
            : q.section;

        // Helper function to match difficulty (handles both string and numeric)
        const matchesDifficulty = (question: Question, targetDifficulty: number | string): boolean => {
          const qDiff = question.difficulty;

          // If both are numbers or both are strings, direct comparison
          if (typeof qDiff === typeof targetDifficulty) {
            return qDiff === targetDifficulty;
          }

          // Otherwise, map between numeric and string
          const difficultyMap: Record<number, string> = {
            1: 'easy',
            2: 'medium',
            3: 'hard'
          };
          const reverseDifficultyMap: Record<string, number> = {
            'easy': 1,
            'medium': 2,
            'hard': 3
          };

          if (typeof targetDifficulty === 'number' && typeof qDiff === 'string') {
            return difficultyMap[targetDifficulty]?.toLowerCase() === qDiff.toLowerCase();
          } else if (typeof targetDifficulty === 'string' && typeof qDiff === 'number') {
            return reverseDifficultyMap[targetDifficulty.toLowerCase()] === qDiff;
          }

          return false;
        };

        // Get questions with baseline difficulty for the next section from pool with randomization and fallback
        let nextSectionBaseQuestionsCandidates = questionPool.filter(
          q => getSection(q) === nextSection && matchesDifficulty(q, baselineDifficulty)
        );

        const baseCount = config.base_questions_count || 0;

        // FALLBACK: If not enough questions with target difficulty
        if (nextSectionBaseQuestionsCandidates.length < baseCount) {

          // Get all questions from this section
          const allSectionQuestions = questionPool.filter(q => getSection(q) === nextSection);

          // Apply randomization if question_order is 'random'
          if (config.question_order === 'random') {
            nextSectionBaseQuestionsCandidates = [...allSectionQuestions].sort(() => Math.random() - 0.5);
          } else {
            nextSectionBaseQuestionsCandidates = allSectionQuestions;
          }
        } else {
          // Apply randomization if question_order is 'random'
          if (config.question_order === 'random') {
            nextSectionBaseQuestionsCandidates = [...nextSectionBaseQuestionsCandidates].sort(() => Math.random() - 0.5);
          }
          // else: keep sequential order (no shuffling)
        }

        const baseQuestionsForSection = nextSectionBaseQuestionsCandidates.slice(0, baseCount);

        // Mark these questions as baseline in memory
        baseQuestionsForSection.forEach(q => q.is_base = true);

        // Add base questions to selectedQuestions
        setSelectedQuestions(prev => [...prev, ...baseQuestionsForSection]);
      }

      // Restart timer for new section (pass nextSection to avoid stale closure)
      startSectionTimer(nextSection);
    } else {
      // Test complete
      submitTest();
    }
  }

  // Wire moveToNextSectionRef so usePauseManagement callbacks can call moveToNextSection
  moveToNextSectionRef.current = moveToNextSection;

  async function submitTest() {
    // PREVIEW MODE: Don't submit test
    if (isPreviewMode) {
      console.log('Preview mode: Submit blocked');
      return;
    }

    // Prevent double submission
    if (submitting) {
      return;
    }

    // Use refs to get actual current values (avoids stale closure in timer callbacks)
    const actualCurrentQuestionId = currentQuestionIdRef.current;
    const actualGlobalQuestionOrder = globalQuestionOrderRef.current;
    const actualAnswers = answersRef.current;

    console.log('📤 [SUBMIT] submitTest called', {
      stateValues: {
        currentQuestionIndex,
        globalQuestionOrder,
        currentQuestionId: currentQuestion?.id,
        answersCount: Object.keys(answers).length
      },
      refValues: {
        actualCurrentQuestionId,
        actualGlobalQuestionOrder,
        actualAnswersCount: Object.keys(actualAnswers).length
      },
      willSaveWithQuestionOrder: actualGlobalQuestionOrder + 1,
      hasAnswer: !!actualAnswers[actualCurrentQuestionId || ''],
      totalAnswersInState: Object.keys(answers).length
    });

    setSubmitting(true);

    setTimerActive(false);

    // Capture final section theta for GMAT IRT scoring (last section wasn't reset)
    if (adaptiveAlgorithm instanceof ComplexAdaptiveAlgorithm && config?.test_type === 'GMAT') {
      const lastSection = sections[currentSectionIndexRef.current];
      if (lastSection && !sectionThetasRef.current[lastSection]) {
        const thetaData = { theta: adaptiveAlgorithm.getFinalTheta(), se: adaptiveAlgorithm.getFinalSE() };
        sectionThetasRef.current = { ...sectionThetasRef.current, [lastSection]: thetaData };
      }
    }

    // Save final answer if any (or save empty answer to track question order)
    // Use ref values to avoid stale closures
    if (actualCurrentQuestionId) {
      console.log('📤 [SUBMIT] Saving current question before completion', {
        questionId: actualCurrentQuestionId.substring(0, 8),
        questionOrder: actualGlobalQuestionOrder + 1,
        hasAnswer: !!actualAnswers[actualCurrentQuestionId],
        answerValue: actualAnswers[actualCurrentQuestionId]?.answer || 'null'
      });
      await saveAnswer(
        actualCurrentQuestionId,
        actualAnswers[actualCurrentQuestionId] || {
          questionId: actualCurrentQuestionId,
          answer: null,
          timeSpent: 0,
          flagged: false
        },
        actualAnswers[actualCurrentQuestionId]?.flagged || false,
        0,
        actualGlobalQuestionOrder + 1
      );
    }

    // Mark test as completed in database with completion_details
    try {
      // Save completion details
      const success = await saveCompletionDetails('completed', 'submitted');

      if (!success) {
        throw new Error('Failed to save completion details');
      }

      // For GMAT tests, track seen questions
      if (config?.test_type === 'GMAT' && studentId && allQuestions.length > 0) {
        try {
          const questionIds = allQuestions.map(q => q.id);
          await addSeenQuestions(studentId, questionIds);
          console.log('✅ Added seen questions to GMAT progress:', questionIds.length);
        } catch (seenErr) {
          // Non-critical error - log but don't block completion
          console.error('Failed to track seen questions:', seenErr);
        }
      }

      // Show completion screen
      setShowCompletionScreen(true);
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      alert('Error submitting test. Please contact your instructor.');
    }
  }

  // formatTime — now imported from useTestTimer hook

  // checkMultipleScreens, enterFullscreen → moved to useTestProctoring hook

  // Exit fullscreen and annul test
  /**
   * Save completion details to database with reason and timing info
   * ✅ SIMPLIFIED: Only stores essential metadata (stats calculated from answers table)
   */
  async function saveCompletionDetails(
    status: 'completed' | 'incomplete' | 'annulled',
    reason: 'submitted' | 'time_expired' | 'fullscreen_exit' | 'multiple_screens' | 'browser_closed',
    annulmentReason?: string
  ) {
    try {
      // Get existing attempts history from database
      const { data: currentAssignment, error: _fetchError } = await supabase
        .from('2V_test_assignments')
        .select('completion_details, start_time, current_attempt, total_attempts')
        .eq('id', assignmentId!)
        .single() as { data: { completion_details: { attempts: AttemptData[] } | null; start_time: string | null; current_attempt: number | null; total_attempts: number | null } | null; error: unknown };

      const existingDetails = currentAssignment?.completion_details || { attempts: [] };
      const attempts = Array.isArray(existingDetails.attempts) ? existingDetails.attempts : [];

      // Create attempt record with ONLY essential metadata (no redundant data)
      const newAttempt: AttemptData = {
        attempt_number: currentAttempt,
        status,
        reason,
        started_at: currentAssignment?.start_time || testStartTime?.toISOString() || new Date().toISOString(),
        completed_at: new Date().toISOString(),

        // Environment/security info
        browser_info: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString(),

        // Device diagnostics from pre-test check
        device_diagnostics: deviceDiagnostics ? {
          connection_latency_ms: deviceDiagnostics.connection.value ?? null,
          connection_status: deviceDiagnostics.connection.status === 'checking' ? 'warning' : deviceDiagnostics.connection.status,
          performance_benchmark_ms: deviceDiagnostics.performance.value ?? null,
          performance_status: deviceDiagnostics.performance.status === 'checking' ? 'warning' : deviceDiagnostics.performance.status,
          overall_status: deviceDiagnostics.overall === 'checking' ? 'warning' : deviceDiagnostics.overall,
          tested_at: new Date().toISOString()
        } : undefined
      };

      if (annulmentReason) {
        newAttempt.annulment_reason = annulmentReason;
      }

      // Test configuration snapshot (for audit trail)
      if (config) {
        newAttempt.test_config = {
          navigation_mode: config.navigation_mode,
          navigation_between_sections: config.navigation_between_sections,
          time_per_section: config.time_per_section,
          total_time_minutes: config.total_time_minutes,
          pause_mode: config.pause_mode,
          pause_duration_minutes: config.pause_duration_minutes,
          max_pauses: config.max_pauses
        };
      }

      // Pause usage tracking
      newAttempt.pause_events = pauseEvents;

      // Section completion tracking (for UI purposes)
      // Use sections array (which includes "All Questions" for no_sections mode) instead of actual question sections
      newAttempt.sections_completed = sections;

      // Section time tracking - capture final section time before saving
      const finalSectionTimes = { ...sectionTimes };
      if (sectionStartTime && currentSection) {
        const currentSectionTime = Math.floor((new Date().getTime() - sectionStartTime.getTime()) / 1000);
        finalSectionTimes[currentSection] = (finalSectionTimes[currentSection] || 0) + currentSectionTime;
      }
      newAttempt.section_times = finalSectionTimes;

      // Question statistics
      newAttempt.total_questions = selectedQuestions.length;
      newAttempt.questions_answered = Object.keys(answers).filter(qId => {
        const ans = answers[qId];
        return ans && ans.answer !== null && ans.answer !== undefined;
      }).length;

      // GMAT IRT scoring: save per-section theta estimates for proper GMAT scoring
      if (config?.test_type === 'GMAT' && Object.keys(sectionThetasRef.current).length > 0) {
        newAttempt.gmat_scoring = {
          section_thetas: sectionThetasRef.current,
          algorithm_version: '1.1.0',
        };
      }

      // Check if attempt already exists (update instead of duplicating)
      const existingAttemptIndex = attempts.findIndex(
        (a: AttemptData) => a.attempt_number === currentAttempt
      );

      if (existingAttemptIndex >= 0) {
        attempts[existingAttemptIndex] = {
          ...attempts[existingAttemptIndex],
          ...newAttempt
        };
      } else {
        attempts.push(newAttempt);
      }

      const newTotalAttempts = status === 'incomplete' ? currentAttempt - 1 : currentAttempt;

      // Format completion timestamp for completion_status field
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      const completionStatusText = `${status} ${dateStr} at ${timeStr}`;

      // Auto-lock when completed (tutor must unlock to allow retake)
      const finalStatus = status === 'completed' ? 'locked' : status;

      const updateData = {
        status: finalStatus,
        completion_status: completionStatusText,
        completed_at: new Date().toISOString(),
        completion_details: { attempts },
        total_attempts: newTotalAttempts,
        // IMPORTANT: Hide results when test is completed/annulled
        // Tutor must explicitly enable visibility after reviewing with student
        results_viewable_by_student: false
      } as any;

      const { data: _updateResult, error } = await supabase
        .from('2V_test_assignments')
        .update(updateData)
        .eq('id', assignmentId!)
        .select();

      if (error) {
        throw error;
      }

      // Sync test results to external database if completed
      if (status === 'completed') {
        try {
          // Get student's external_student_id
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('2V_profiles')
              .select('external_student_id')
              .eq('auth_uid', user.id)
              .single();

            if (profile?.external_student_id) {
              // Calculate correct, wrong, blank answers using isolated calculator
              // IMPORTANT: This is ONLY for external sync and has NO impact on internal platform results
              const totalQuestions = selectedQuestions.length;

              // Get test info for external sync
              const { data: assignmentWithTest } = await supabase
                .from('2V_test_assignments')
                .select('2V_tests(test_type, exercise_type, test_number, section)')
                .eq('id', assignmentId!)
                .single();

              const testInfo = (assignmentWithTest as any)?.['2V_tests'];
              const testType = testInfo?.test_type || 'Unknown';
              const section = testInfo?.section || '';
              const exerciseType = testInfo?.exercise_type || '';
              const testNumber = testInfo?.test_number || '';

              // Build comprehensive test name: "GMAT - Logaritmi e Esponenziali - Training 1"
              // or "GMAT - Logaritmi e Esponenziali - Assessment Monomatematico 2"
              let testName = testType;

              if (section && section !== 'Multi-topic') {
                testName += ` - ${section}`;
              }

              if (exerciseType) {
                testName += ` - ${exerciseType}`;
              }

              if (testNumber) {
                testName += ` ${testNumber}`;
              }

              console.log('📊 [EXTERNAL SYNC] Calculating results for external platform');
              const results = await calculateResultsForExternalSync(
                assignmentId!,
                currentAttempt,
                totalQuestions
              );

              await syncTestResultsToExternal({
                externalStudentId: profile.external_student_id,
                testType: testType,
                testName: testName,
                completedAt: new Date().toISOString(),
                attemptNumber: currentAttempt,
                status: status,
                correct: results.correct,
                wrong: results.wrong,
                blank: results.blank,
                totalQuestions: results.totalQuestions
              });
            }
          }
        } catch (syncError) {
          console.error('⚠️ Failed to sync results to external database:', syncError);
          // Don't fail the test submission if external sync fails
        }
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  // Wire up proctoring annul callback (needs saveCompletionDetails defined above)
  onAnnulTestRef.current = (reason: 'fullscreen_exit' | 'multiple_screens') => {
    const annulmentReason = reason === 'multiple_screens' ? 'multiple_screens_detected' : 'exited_fullscreen';
    saveCompletionDetails('annulled', reason, annulmentReason);
  };
  // annulTest, handleStayInTest, handleConfirmExit → moved to useTestProctoring hook

  // Wait until all critical state is loaded to prevent race condition
  // where sections is set to ['All Questions'] but config is not yet loaded,
  // causing the filter to incorrectly return 0 questions
  if (loading || !config || sections.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t('takeTest.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Test Locked Screen (completed tests are auto-locked)
  if (isLocked) {
    return <TestLockedScreen onBackToHome={() => navigate('/student/home')} />;
  }

  // Test Annulled Screen
  if (testAnnulled) {
    return (
      <TestAnnulledScreen
        multipleScreensDetected={multipleScreensDetected}
        onBackToSelection={() => {
          if (config?.test_type) {
            navigate(`/student/home?test=${config.test_type}`);
          } else {
            navigate('/student/home');
          }
        }}
      />
    );
  }

  // Exit Warning Screen (5-second countdown)
  if (showExitWarning) {
    return (
      <ExitWarningScreen
        exitCountdown={exitCountdown}
        onConfirmExit={handleConfirmExit}
        onStayInTest={handleStayInTest}
      />
    );
  }

  // Start Screen
  if (showStartScreen && config) {
    return (
      <TestStartScreen
        config={config}
        onCancel={() => navigate(-1)}
        onStart={startTest}
        onDiagnosticsComplete={(results) => setDeviceDiagnostics(results)}
      />
    );
  }

  // Section Selection Screen (for user_choice mode)
  if (showSectionSelectionScreen && config) {
    // Pre-compute question counts per section for the component
    const questionCountBySection: Record<string, number> = {};
    userSelectedSections.forEach(section => {
      questionCountBySection[section] = allQuestions.filter(q => getSectionField(q) === section).length;
    });

    return (
      <SectionSelectionScreen
        config={config}
        sections={userSelectedSections}
        draggedSectionIndex={draggedSectionIndex}
        hasSpecialNeeds={hasSpecialNeeds}
        questionCountBySection={questionCountBySection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onMoveSectionUp={moveSectionUp}
        onMoveSectionDown={moveSectionDown}
        onBack={() => {
          setShowSectionSelectionScreen(false);
          setShowStartScreen(true);
        }}
        onBegin={beginTestWithSelectedSections}
      />
    );
  }

  // Section Transition Screen
  if (showSectionTransition) {
    const nextSectionIndex = currentSectionIndex + 1;
    let nextSection = sections[nextSectionIndex];

    // MACRO SECTION ADAPTIVITY: If current section is a base section,
    // predict which adaptive section will be added (based on current performance)
    const useMacroSectionAdaptivity = config?.section_order_mode?.includes('macro_sections') &&
                                       config?.section_adaptivity_config &&
                                       Object.keys(config.section_adaptivity_config).length > 0;

    if (useMacroSectionAdaptivity && config?.section_adaptivity_config?.[currentSection]?.type === 'base') {
      // Calculate performance to predict Easy vs Hard
      const currentSectionQuestions = selectedQuestions.filter(q => {
        const qSection = config?.section_order_mode?.includes('macro_sections') && q.macro_section
          ? q.macro_section
          : q.section;
        return qSection === currentSection;
      });

      const answeredQuestions = currentSectionQuestions.filter(q => answers[q.id]?.answer);
      const correctAnswers = answeredQuestions.filter(q => {
        const answer = answers[q.id]?.answer;
        return answer === q.correct_answer;
      });

      const percentCorrect = answeredQuestions.length > 0
        ? (correctAnswers.length / answeredQuestions.length) * 100
        : 0;

      // Find next adaptive group in config
      const allConfigSections = config?.section_order || [];
      const currentSectionIndexInConfig = allConfigSections.indexOf(currentSection);

      for (let i = currentSectionIndexInConfig + 1; i < allConfigSections.length; i++) {
        const candidateSection = allConfigSections[i];
        const candidateConfig = config!.section_adaptivity_config![candidateSection];

        if (candidateConfig?.type === 'adaptive') {
          const isHardSection = candidateSection.endsWith('-Hard');
          const isEasySection = candidateSection.endsWith('-Easy');

          if (isHardSection || isEasySection) {
            const groupPrefix = candidateSection.replace(/-Easy|-Hard$/i, '');
            // Choose Hard if ≥65%, otherwise Easy
            nextSection = percentCorrect >= 65 ? `${groupPrefix}-Hard` : `${groupPrefix}-Easy`;
            break;
          }
        }
      }
    }

    return (
      <SectionCompleted
        completedSectionName={formatSectionName(currentSection)}
        nextSectionName={formatSectionName(nextSection)}
        countdown={sectionTransitionCountdown}
        onContinue={() => handleSectionTransitionComplete()}
        isLoading={isTransitioning}
        disabled={sectionTransitionCountdown <= 1}
      />
    );
  }

  // Pause Choice Screen (for user_choice mode)
  // Use ref to persist across StrictMode remounts
  const shouldShowPauseChoice = showPauseChoiceScreen || showPauseChoiceRef.current;
  if (shouldShowPauseChoice) {
    return (
      <PauseChoice
        completedSectionName={formatSectionName(currentSection)}
        pausesRemaining={(config?.max_pauses || 0) - pausesUsed}
        pauseDurationMinutes={config?.pause_duration_minutes || 5}
        countdown={pauseChoiceCountdown}
        onTakePause={handleTakePause}
        onSkipPause={() => handleSkipPause()}
        disabled={pauseChoiceCountdown <= 1}
      />
    );
  }

  // Pause Screen
  if (showPauseScreen) {
    return (
      <PauseScreen
        sectionName={formatSectionName(currentSection)}
        timeRemaining={pauseTimeRemaining}
        isMandatory={config?.pause_mode !== 'user_choice'}
      />
    );
  }

  // Completion Screen
  if (showCompletionScreen) {
    return (
      <Layout>
        <TestCompleted onReturnToDashboard={() => navigate('/student/home')} />
      </Layout>
    );
  }

  // PDF Test Interface
  if (isPDFTest && !showStartScreen && !showCompletionScreen) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header with Timer and Section Info */}
        <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Preview Mode Exit Button */}
            {isPreviewMode && (
              <>
                <button
                  onClick={() => {
                    const currentQ = currentQuestion?.question_number || previewStartQuestion;
                    navigate('/admin/review-questions', {
                      state: {
                        selectedTestId: previewTestId,
                        scrollToQuestion: currentQ
                      }
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center gap-2"
                  title="Exit preview and return to review page"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Exit Preview
                </button>
                {/* Language Toggle in Preview */}
                <button
                  onClick={() => {
                    const newLang = testLanguage === 'it' ? 'en' : 'it';
                    setTestLanguage(newLang);
                    i18n.changeLanguage(newLang);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm"
                  title="Toggle language"
                >
                  {testLanguage === 'it' ? '🇮🇹 → 🇬🇧' : '🇬🇧 → 🇮🇹'}
                </button>
              </>
            )}
            <div>
              <h2 className="text-xl font-bold text-brand-dark">
                {isPreviewMode && '🔍 PREVIEW MODE - '}
                {formatSectionName(currentSection)}
              </h2>
              <p className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {expectedTotalSections}
              </p>
            </div>
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg">
              <FontAwesomeIcon icon={faClock} className="text-brand-green" />
              <span className={`font-mono font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-800'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
          {/* Guided Mode Indicator for PDF tests */}
          {isGuidedMode && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                <span>🎓</span>
                <span>Guided</span>
                {!guidedTimed && <span className="text-purple-500">• No limit</span>}
              </div>
              {/* Toggle Show/Hide Answers */}
              <button
                onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  showCorrectAnswers
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {showCorrectAnswers ? '👁️ Hide' : '👁️ Show'}
              </button>
            </div>
          )}
        </div>

        {/* PDF Test View */}
        <div className="flex-1 overflow-hidden">
          <PDFTestView
            questions={sectionQuestions.filter(q =>
              typeof q.question_data.pdf_url === 'string' && typeof q.question_data.page_number === 'number'
            ) as any}
            currentPageGroup={currentPageGroup}
            answers={answers}
            showCorrectAnswers={isGuidedMode && showCorrectAnswers}
            onAnswer={(questionId, answer) => {
              // Extra safety: reject if time has expired
              if (timeRemaining !== null && timeRemaining <= 0) {
                return;
              }
              setAnswers(prev => ({
                ...prev,
                [questionId]: {
                  questionId,
                  answer,
                  timeSpent: 0,
                  flagged: prev[questionId]?.flagged || false,
                }
              }));
            }}
            onNext={async () => {
              // Extra safety: reject if time has expired
              if (timeRemaining !== null && timeRemaining <= 0) {
                return;
              }

              // Save all answers on current page before moving
              for (let i = 0; i < sectionQuestions.length; i++) {
                const question = sectionQuestions[i];
                if (answers[question.id]) {
                  await saveAnswer(question.id, answers[question.id], answers[question.id].flagged, 0, i + 1);
                }
              }

              // Check if we need to move to next section
              const pageGroups: Record<number, any[]> = {};
              sectionQuestions.forEach(q => {
                const pageNum = q.question_data.page_number;
                if (typeof pageNum === 'number') {
                  if (!pageGroups[pageNum]) pageGroups[pageNum] = [];
                  pageGroups[pageNum].push(q);
                }
              });
              const totalPageGroups = Object.keys(pageGroups).length;

              if (currentPageGroup < totalPageGroups - 1) {
                // Move to next page group
                setCurrentPageGroup(currentPageGroup + 1);
              } else {
                // Last page of section - complete section (with transition)
                setCurrentPageGroup(0); // Reset for next section
                if (currentSectionIndex < sections.length - 1) {
                  completeSection(); // This will show transition screen
                } else {
                  // Test complete
                  await submitTest();
                }
              }
            }}
            onPrevious={() => {
              if (currentPageGroup > 0) {
                setCurrentPageGroup(currentPageGroup - 1);
              }
            }}
            canGoNext={true}
            canGoPrevious={currentPageGroup > 0}
            timeRemaining={timeRemaining}
          />
        </div>
      </div>
    );
  }

  // Main Test Interface
  console.log('🎨 [MAIN RENDER] Component rendering:', {
    hasCurrentQuestion: !!currentQuestion,
    currentQuestionId: currentQuestion?.id,
    sectionQuestionsLength: sectionQuestions.length,
    currentQuestionIndex,
    currentSection,
    allQuestionsLength: allQuestions.length,
    selectedQuestionsLength: selectedQuestions.length
  });

  return (
    <MathJaxProvider>
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Timer */}
      <TestHeader
        currentSection={currentSection}
        currentQuestionIndex={currentQuestionIndex}
        sectionQuestionLimit={sectionQuestionLimit}
        formatSectionName={formatSectionName}
        sectionOrderMode={config?.section_order_mode}
        maxAnswerChanges={config?.max_answer_changes}
        timeRemaining={timeRemaining}
        currentQuestionSection={currentQuestion?.section}
        isSaving={isSaving}
        saveError={saveError}
        deviceDiagnostics={deviceDiagnostics}
        isInReviewMode={isInReviewMode}
        answerChangesUsed={answerChangesUsed}
        isPreviewMode={isPreviewMode}
        previewTestId={previewTestId}
        previewStartQuestion={previewStartQuestion}
        currentQuestionNumber={currentQuestion?.question_number}
        testLanguage={testLanguage}
        onExitPreview={() => {
          const currentQ = currentQuestion?.question_number || previewStartQuestion;
          navigate('/admin/review-questions', {
            state: {
              selectedTestId: previewTestId,
              scrollToQuestion: currentQ
            }
          });
        }}
        onToggleLanguage={() => {
          const newLang = testLanguage === 'it' ? 'en' : 'it';
          setTestLanguage(newLang);
          i18n.changeLanguage(newLang);
        }}
        isGuidedMode={isGuidedMode}
        guidedTimed={guidedTimed}
        showCorrectAnswers={showCorrectAnswers}
        onToggleCorrectAnswers={() => setShowCorrectAnswers(!showCorrectAnswers)}
      />

      {/* Question Content */}
      <div className={`flex-1 overflow-y-auto ${currentQuestion?.question_data?.passage_text ? 'p-4' : 'p-6'}`}>
        <div className={`${currentQuestion?.question_data?.passage_text ? 'max-w-7xl' : 'max-w-4xl'} mx-auto bg-white rounded-2xl shadow-lg ${currentQuestion?.question_data?.passage_text ? 'p-6' : 'p-8'}`}>
          {/* Question Text */}
          <div className="mb-8">
            <div className="flex items-start justify-end gap-2 mb-4">
              {/* Bookmark Button (GMAT-style) */}
              {config?.allow_bookmarks && currentQuestion?.id && (
                <button
                  onClick={() => toggleBookmark(currentQuestion.id)}
                  disabled={timeRemaining !== null && timeRemaining <= 1}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    bookmarkedQuestions.has(currentQuestion.id)
                      ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                  {bookmarkedQuestions.has(currentQuestion.id)
                    ? (t('takeTest.bookmarked') || 'Bookmarked')
                    : (t('takeTest.bookmark') || 'Bookmark')
                  }
                </button>
              )}
            </div>

            {/* Legacy format fallback - only show for questions without question_data */}
            {!currentQuestion?.question_data && currentQuestion?.question_text ? (
              <div className="text-gray-800 text-lg whitespace-pre-wrap">
                {currentQuestion?.question_text}
              </div>
            ) : null}

            {/* Question Rendering via QuestionRenderer */}
            {currentQuestion?.question_data && (currentQuestion.question_data.di_type || currentQuestion.question_type === 'multiple_choice' && currentQuestion.question_data.options || currentQuestion.question_type === 'open_ended') && (() => {
              const isEnglishSection = currentSection?.toLowerCase().includes('inglese');
              const rendererLanguage: 'it' | 'en' = (testLanguage === 'en' || isEnglishSection) ? 'en' : 'it';

              return (
                <QuestionRenderer
                  question={{
                    id: currentQuestion.id,
                    question_type: currentQuestion.question_type,
                    question_data: currentQuestion.question_data,
                    answers: currentQuestion.answers,
                  }}
                  currentAnswer={toUnifiedAnswer(answers[currentQuestion.id])}
                  onAnswerChange={handleRendererAnswerChange}
                  language={rendererLanguage}
                  showResults={(isGuidedMode && showCorrectAnswers) || isPreviewMode}
                />
              );
            })()}

        </div>

        {/* Legacy Multiple Choice Answer Options (choices/answer_a format not handled by QuestionRenderer) */}
          {!currentQuestion?.question_data?.di_type && !currentQuestion?.question_data?.options && currentQuestion?.question_type !== 'open_ended' && (() => {
            // Get correct answer for standard multiple choice
            const answersData = currentQuestion?.answers ?
              (typeof currentQuestion.answers === 'string' ? JSON.parse(currentQuestion.answers) : currentQuestion.answers)
              : null;
            const correctAnswerData = answersData?.correct_answer;
            const stdCorrectAnswer = Array.isArray(correctAnswerData)
              ? correctAnswerData[0]
              : correctAnswerData;

            return (
            <div className="space-y-3">
            {currentQuestion?.question_data?.choices ? (
              // Multiple choice with JSON choices
              currentQuestion.question_data.choices.map(choice => {
                const isSelected = answers[currentQuestion?.id]?.answer === choice.label;
                const isCorrect = isGuidedMode && showCorrectAnswers && stdCorrectAnswer === choice.label;
                const isWrong = isGuidedMode && showCorrectAnswers && isSelected && stdCorrectAnswer !== choice.label;

                return (
                  <button
                    key={choice.label}
                    onClick={() => handleAnswerSelect(choice.label)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isCorrect
                        ? 'border-green-500 bg-green-100'
                        : isWrong
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-brand-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isCorrect
                          ? 'bg-green-500 text-white'
                          : isWrong
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {choice.label}
                      </div>
                      <div className="flex-1 text-gray-800">
                        <MathJaxRenderer>{choice.text}</MathJaxRenderer>
                      </div>
                      {isCorrect && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
                      )}
                      {isWrong && (
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-xl" />
                      )}
                      {isSelected && !isCorrect && !isWrong && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green text-xl" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              // Legacy format with answer_a, answer_b, etc.
              ['A', 'B', 'C', 'D', 'E'].map(option => {
                const answerKey = `answer_${option.toLowerCase()}` as keyof Question;
                const answerText = currentQuestion?.[answerKey];

                if (!answerText) return null;

                const isSelected = answers[currentQuestion?.id]?.answer === option;
                const isCorrect = isGuidedMode && showCorrectAnswers && stdCorrectAnswer === option;
                const isWrong = isGuidedMode && showCorrectAnswers && isSelected && stdCorrectAnswer !== option;

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isCorrect
                        ? 'border-green-500 bg-green-100'
                        : isWrong
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-brand-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isCorrect
                          ? 'bg-green-500 text-white'
                          : isWrong
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {option}
                      </div>
                      <div className="flex-1 text-gray-800">
                        <MathJaxRenderer>{answerText as string}</MathJaxRenderer>
                      </div>
                      {isCorrect && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
                      )}
                      {isWrong && (
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-xl" />
                      )}
                      {isSelected && !isCorrect && !isWrong && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green text-xl" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
            </div>
            );
          })()}

          {/* Report Issue Button - subtle link at bottom */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={toggleFlag}
              disabled={timeRemaining !== null && timeRemaining <= 1}
              className={`text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                answers[currentQuestion?.id]?.flagged
                  ? 'text-orange-600 font-medium'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FontAwesomeIcon icon={faFlag} className="mr-1" />
              {answers[currentQuestion?.id]?.flagged
                ? t('takeTest.issueReported')
                : t('takeTest.reportIssue')}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <NavigationControls
        currentSectionIndex={currentSectionIndex}
        currentQuestionIndex={currentQuestionIndex}
        expectedTotalSections={expectedTotalSections}
        sectionQuestionLimit={sectionQuestionLimit}
        totalQuestionsInSection={totalQuestionsInSection}
        totalQuestions={allQuestions.length}
        isInReviewMode={isInReviewMode}
        isPreviewMode={isPreviewMode}
        isTransitioning={isTransitioning}
        submitting={submitting}
        adaptivityMode={config?.adaptivity_mode}
        timeRemaining={timeRemaining}
        canGoBack={canGoBack()}
        onPrevious={goToPreviousQuestion}
        onNext={goToNextQuestion}
        onReturnToReview={returnToReviewScreen}
      />

      {/* Review Screen Overlay */}
      <ReviewScreen
        isOpen={showReviewScreen}
        questions={currentSectionQuestionsList.map((q, idx) => ({
          id: q.id,
          questionNumber: idx + 1,
          isAnswered: !!(answers[q.id]?.answer || answers[q.id]?.msrAnswers || answers[q.id]?.blank1 || answers[q.id]?.taAnswers || answers[q.id]?.column1),
          isBookmarked: bookmarkedQuestions.has(q.id),
        }))}
        onQuestionClick={(index: number, _questionId: string) => goToQuestionFromReview(index)}
        onComplete={completeReview}
        isLastSection={currentSectionIndex >= expectedTotalSections - 1}
        disabled={timeRemaining !== null && timeRemaining <= 1}
        maxChanges={config?.max_answer_changes}
        changesUsed={answerChangesUsed}
      />

      {/* Change Blocked Toast (when max changes reached) */}
      {showChangeBlockedMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">{t('takeTest.maxChangesReached') || 'Maximum changes reached'}</p>
              <p className="text-sm">
                {t('takeTest.cannotChangeMore') || 'You cannot change any more answers in this section'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Answer Required Modal Overlay */}
      {showAnswerRequiredMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-600 mb-4">
              {t('takeTest.answerRequired')}
            </h3>
            <p className="text-gray-700 mb-6">
              {isPartialAnswer
                ? t('takeTest.mustCompleteAllParts')
                : t('takeTest.mustAnswerQuestion')
              }
            </p>
            <button
              onClick={() => setShowAnswerRequiredMessage(false)}
              className="px-8 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* Submitting Test Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <FontAwesomeIcon icon={faClock} className="text-6xl text-brand-green animate-spin mb-4" />
            <h3 className="text-xl font-bold text-brand-dark mb-2">
              {t('takeTest.submittingTest') || 'Submitting Test...'}
            </h3>
            <p className="text-gray-600">
              {t('takeTest.pleaseWait') || 'Please wait while we save your answers...'}
            </p>
          </div>
        </div>
      )}
    </div>
    </MathJaxProvider>
  );
}
