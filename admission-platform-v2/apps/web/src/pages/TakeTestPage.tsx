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
  faArrowRight,
  faFlag,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faGripVertical,
  faLock,
  faBookmark,
  faList,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { supabaseTest, fromTest } from '../lib/supabaseTest';
import { useTranslation } from 'react-i18next';
import { DSQuestion } from '../components/questions/DSQuestion';
import { MSRQuestion } from '../components/questions/MSRQuestion';
import { GIQuestion } from '../components/questions/GIQuestion';
import { TAQuestion } from '../components/questions/TAQuestion';
import { TPAQuestion } from '../components/questions/TPAQuestion';
import { MultipleChoiceQuestion } from '../components/questions/MultipleChoiceQuestion';
import { PDFTestView } from '../components/PDFTestView';
import { createAdaptiveAlgorithm, SimpleAdaptiveAlgorithm, ComplexAdaptiveAlgorithm } from '../lib/algorithms/adaptiveAlgorithm';
import { translateTestTrack } from '../lib/translateTestTrack';

interface TestConfig {
  test_type: string;
  track_type: string;
  section_order_mode: 'mandatory' | 'user_choice' | 'no_sections';
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

  // Algorithm configuration
  question_order?: 'random' | 'sequential';
  adaptivity_mode?: 'adaptive' | 'non_adaptive' | 'static'; // Allow both naming conventions
  use_base_questions?: boolean;
  base_questions_scope?: 'per_section' | 'per_test' | 'entire_test'; // Support both naming conventions
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
    chart_config?: any;
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
    question?: string;
    passage?: string;
    question_text?: string;
    options?: Record<string, string>;

    // Answer choices (for multiple choice)
    choices?: Array<{
      label: string;
      text: string;
    }>;
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

/**
 * Filters sections based on section adaptivity configuration.
 * - Base sections are always included
 * - For adaptive sections, randomly picks one from each group
 * - Maintains the original order from section_order
 *
 * Example:
 * Input: ["RW1", "RW2-Easy", "RW2-Hard", "Math1", "Math2-Easy", "Math2-Hard"]
 * Config: { RW1: base, RW2-Easy: adaptive, RW2-Hard: adaptive, Math1: base, Math2-Easy: adaptive, Math2-Hard: adaptive }
 * Output: ["RW1", "RW2-Hard", "Math1", "Math2-Easy"] (randomly picked RW2-Hard and Math2-Easy)
 */
function filterSectionsWithAdaptivity(
  sections: string[],
  adaptivityConfig: Record<string, { type: 'base' | 'adaptive'; difficulty?: string }>
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
    } else if (config.type === 'adaptive') {
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
  }

  return result;
}

export default function TakeTestPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Detect test mode from URL parameter (?testMode=true)
  const searchParams = new URLSearchParams(window.location.search);
  const isTestMode = searchParams.get('testMode') === 'true';

  // Detect guided mode from URL parameters (?guided=true&timed=false)
  const isGuidedMode = searchParams.get('guided') === 'true';
  const guidedTimed = searchParams.get('timed') !== 'false'; // Default to timed

  // Toggle for showing/hiding correct answers in guided mode
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  const db = isTestMode ? supabaseTest : supabase;
  const dbFrom = (table: string) => isTestMode ? fromTest(table) : supabase.from(table);

  // Visual indicator for test mode
  const [botAction, setBotAction] = useState<string | null>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Submitting test state
  const [isLocked, setIsLocked] = useState(false); // Test is locked/completed
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [isPDFTest, setIsPDFTest] = useState(false); // PDF test format
  const [currentPageGroup, setCurrentPageGroup] = useState(0); // For PDF tests: current page group
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [testLanguage, setTestLanguage] = useState<string>('it'); // Language captured at test start
  const [showSectionSelectionScreen, setShowSectionSelectionScreen] = useState(false);
  const [showPauseScreen, setShowPauseScreen] = useState(false);
  const [showPauseChoiceScreen, setShowPauseChoiceScreen] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState<number | null>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [sectionStartTime, setSectionStartTime] = useState<Date | null>(null);
  const [pausesUsed, setPausesUsed] = useState(0);
  const [pauseEvents, setPauseEvents] = useState<Array<{
    timestamp: string;
    section: string;
    action: 'pause_taken' | 'pause_skipped' | 'pause_auto_skipped';
  }>>([]);
  const [userSelectedSections, setUserSelectedSections] = useState<string[]>([]);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  // Fullscreen and screen monitoring state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(5);
  const [multipleScreensDetected, setMultipleScreensDetected] = useState(false);
  const [testAnnulled, setTestAnnulled] = useState(false);
  const [pauseChoiceCountdown, setPauseChoiceCountdown] = useState(5);
  const [pauseChoiceTrigger, setPauseChoiceTrigger] = useState(0); // Trigger to force countdown useEffect to run
  const [showAnswerRequiredMessage, setShowAnswerRequiredMessage] = useState(false);
  const [isPartialAnswer, setIsPartialAnswer] = useState(false);
  const [showChangeBlockedMessage, setShowChangeBlockedMessage] = useState(false);
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const [sectionTransitionCountdown, setSectionTransitionCountdown] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent race conditions
  const [isCompletingSection, setIsCompletingSection] = useState(false); // Prevent double section completion

  // Adaptive testing state
  const [questionPool, setQuestionPool] = useState<Question[]>([]); // Available questions
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]); // Questions to show
  const [currentTheta, setCurrentTheta] = useState<number>(0); // IRT ability estimate
  const [algorithmConfig, setAlgorithmConfig] = useState<any>(null); // Algorithm configuration
  const [adaptiveAlgorithm, setAdaptiveAlgorithm] = useState<SimpleAdaptiveAlgorithm | ComplexAdaptiveAlgorithm | null>(null); // Algorithm instance
  const [baseQuestionsCompletedPerSection, setBaseQuestionsCompletedPerSection] = useState<Record<string, boolean>>({}); // Track base questions per section

  // Review & Edit feature state (GMAT-style)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set()); // Question IDs that are bookmarked
  const [showReviewScreen, setShowReviewScreen] = useState(false); // Show review screen at end of section
  const [answerChangesUsed, setAnswerChangesUsed] = useState<number>(0); // Number of answer changes made in review
  const [originalAnswers, setOriginalAnswers] = useState<Record<string, StudentAnswer>>({}); // Answers before review (to track changes)
  const [isInReviewMode, setIsInReviewMode] = useState(false); // Currently in review mode

  // Toggle bookmark for current question
  const toggleBookmark = (questionId: string) => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Check if answer was changed during review
  const checkAnswerChanged = (questionId: string, newAnswer: StudentAnswer): boolean => {
    const original = originalAnswers[questionId];
    if (!original) return false;
    // Compare all answer fields
    const originalValue = JSON.stringify({
      answer: original.answer,
      msrAnswers: original.msrAnswers,
      blank1: original.blank1,
      blank2: original.blank2,
      taAnswers: original.taAnswers,
      column1: original.column1,
      column2: original.column2,
    });
    const newValue = JSON.stringify({
      answer: newAnswer.answer,
      msrAnswers: newAnswer.msrAnswers,
      blank1: newAnswer.blank1,
      blank2: newAnswer.blank2,
      taAnswers: newAnswer.taAnswers,
      column1: newAnswer.column1,
      column2: newAnswer.column2,
    });
    return originalValue !== newValue;
  };

  // Handle answer update with review mode tracking
  // GMAT rule: 3 CHANGES total (not 3 questions) - changing same question twice = 2 changes
  const updateAnswer = (questionId: string, updater: (prev: StudentAnswer | undefined) => StudentAnswer) => {
    // Check if we should block this change BEFORE updating
    if (isInReviewMode && config?.max_answer_changes !== undefined && config.max_answer_changes > 0) {
      const currentAnswer = answers[questionId];
      const newAnswer = updater(currentAnswer);

      // Check if the answer is actually different from current
      const isDifferentFromCurrent = JSON.stringify(currentAnswer?.answer) !== JSON.stringify(newAnswer?.answer) ||
        JSON.stringify(currentAnswer?.msrAnswers) !== JSON.stringify(newAnswer?.msrAnswers) ||
        currentAnswer?.blank1 !== newAnswer?.blank1 ||
        currentAnswer?.blank2 !== newAnswer?.blank2 ||
        JSON.stringify(currentAnswer?.taAnswers) !== JSON.stringify(newAnswer?.taAnswers) ||
        currentAnswer?.column1 !== newAnswer?.column1 ||
        currentAnswer?.column2 !== newAnswer?.column2;

      // If selecting the same answer, no change needed
      if (!isDifferentFromCurrent) {
        return;
      }

      // Each change counts toward the limit
      if (answerChangesUsed >= config.max_answer_changes) {
        // Max changes reached, block the change
        setShowChangeBlockedMessage(true);
        setTimeout(() => setShowChangeBlockedMessage(false), 3000);
        return;
      }

      // Increment counter and update answer
      setAnswerChangesUsed(prev => prev + 1);

      // Update the answer
      setAnswers(prev => ({
        ...prev,
        [questionId]: newAnswer
      }));
    } else {
      // Not in review mode or no max_answer_changes set, just update normally
      setAnswers(prev => ({
        ...prev,
        [questionId]: updater(prev[questionId])
      }));
    }
  };

  // Enter review mode - save original answers
  const enterReviewMode = () => {
    const currentSectionQuestions = currentSectionQuestionsList;
    const originals: Record<string, StudentAnswer> = {};
    currentSectionQuestions.forEach(q => {
      if (answers[q.id]) {
        originals[q.id] = { ...answers[q.id] };
      }
    });
    setOriginalAnswers(originals);
    setAnswerChangesUsed(0);
    setIsInReviewMode(true);
    isInReviewModeRef.current = true;
    setShowReviewScreen(true);
    showReviewScreenRef.current = true;
  };

  // Go to specific question from review screen
  const goToQuestionFromReview = (questionIndex: number) => {
    setShowReviewScreen(false);
    showReviewScreenRef.current = false;
    setCurrentQuestionIndex(questionIndex);
  };

  // Return to review screen
  const returnToReviewScreen = () => {
    setShowReviewScreen(true);
    showReviewScreenRef.current = true;
  };

  // Complete review and move to next section
  const completeReview = () => {
    setShowReviewScreen(false);
    showReviewScreenRef.current = false;
    setIsInReviewMode(false);
    isInReviewModeRef.current = false;
    setOriginalAnswers({});
    setAnswerChangesUsed(0);
    // Clear bookmarks for this section
    const currentSectionQuestions = currentSectionQuestionsList;
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      currentSectionQuestions.forEach(q => newSet.delete(q.id));
      return newSet;
    });
    // Now actually complete the section
    // This will call completeSection again, but isInReviewMode is now false
    // so it will proceed with the actual section completion
    completeSection();
  };

  // Saving and timing state
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<number>(1);
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, Date>>({});
  const [sectionTimes, setSectionTimes] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletingSectionRef = useRef(false); // Synchronous guard for race condition
  const pauseChoiceMadeRef = useRef(false); // Prevent double pause choice handling
  const showPauseChoiceRef = useRef(false); // Ref to track pause choice screen state for StrictMode
  const currentSectionIndexRef = useRef(currentSectionIndex); // Ref for current section to avoid stale closures in timer
  const pausesUsedRef = useRef(pausesUsed); // Ref for pauses used to avoid stale closures in timer
  const isInReviewModeRef = useRef(false); // Ref for review mode to avoid stale closures in timer
  const showReviewScreenRef = useRef(false); // Ref for review screen to avoid stale closures in timer

  // Helper function to get the correct section field based on config
  const getSectionField = (question: Question): string => {
    if (config?.section_order_mode?.includes('macro_sections') && question.macro_section) {
      return question.macro_section;
    }
    return question.section;
  };

  // Get current section and questions
  const currentSection = sections[currentSectionIndex];

  // Helper to format section names for display
  const formatSectionName = (name: string): string => {
    if (!name) return '';
    // Replace RW with "Reading and Writing"
    let formatted = name.replace(/^RW(\d*)/, 'Reading and Writing $1').trim();
    // Replace Math1, Math2 with "Math 1", "Math 2"
    formatted = formatted.replace(/^Math(\d+)/, 'Math $1');
    // Remove -Hard or -Easy suffixes
    formatted = formatted.replace(/-(Hard|Easy)$/i, '');
    return formatted;
  };

  // Helper to get localized question text based on language captured at test start
  const getLocalizedQuestionText = (questionData: any): string => {
    if (!questionData) return '';
    if (testLanguage === 'en' && questionData.question_text_eng) {
      return questionData.question_text_eng;
    }
    return questionData.question_text || questionData.question || '';
  };

  // Helper to get localized options based on language captured at test start
  const getLocalizedOptions = (questionData: any): Record<string, string> => {
    if (!questionData) return {};
    if (testLanguage === 'en' && questionData.options_eng) {
      return questionData.options_eng;
    }
    return questionData.options || {};
  };

  // Use selectedQuestions if they've been prepared (for both adaptive and non-adaptive tests)
  const questionsToUse = selectedQuestions.length > 0
    ? selectedQuestions
    : allQuestions;
  // In no_sections mode, use all questions; otherwise filter by section
  const sectionQuestions = config?.section_order_mode === 'no_sections'
    ? questionsToUse
    : questionsToUse.filter(q => getSectionField(q) === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];
  const totalQuestionsInSection = sectionQuestions.length;

  // Alias for review functions (same as sectionQuestions)
  const currentSectionQuestionsList = sectionQuestions;

  // Calculate total questions expected for THIS section
  const calculateSectionQuestionLimit = (): number => {
    if (config?.questions_per_section) {
      return config.questions_per_section[currentSection] || 20; // default to 20
    }
    // Fallback: use current section questions loaded
    return totalQuestionsInSection;
  };
  const sectionQuestionLimit = calculateSectionQuestionLimit();

  // Track question start time when question changes
  useEffect(() => {
    if (currentQuestion?.id && !questionStartTimes[currentQuestion.id]) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestion.id]: new Date()
      }));
    }
  }, [currentQuestion?.id, questionStartTimes]);

  // ❌ REMOVED: test_questions tracking with race condition
  // ✅ NEW: Question order is now tracked via answers.created_at (atomic, no race conditions)

  // Auto-save answer when it changes (debounced)
  useEffect(() => {
    if (!currentQuestion?.id) return;

    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer) return;

    // Debounce saving to avoid too many requests
    const timeoutId = setTimeout(() => {
      const flaggedStatus = currentAnswer.flagged || false;
      saveAnswer(currentQuestion.id, currentAnswer, flaggedStatus, 0, currentQuestionIndex + 1);
    }, 1000); // Save 1 second after last change

    return () => clearTimeout(timeoutId);
  }, [answers, currentQuestion?.id]);

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

  // Keep pausesUsedRef in sync with state (for use in timer callbacks to avoid stale closures)
  useEffect(() => {
    pausesUsedRef.current = pausesUsed;
  }, [pausesUsed]);

  // Save answers and clean up session before page unload (browser close, refresh, etc.)
  // This ensures "in_progress" status doesn't persist when student leaves
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Save current answer if any (or save empty answer to track question order)
      if (currentQuestion?.id) {
        // Try to save synchronously
        await saveAnswer(
          currentQuestion.id,
          answers[currentQuestion.id] || { answer: null },
          answers[currentQuestion.id]?.flagged || false,
          0,
          currentQuestionIndex + 1
        );
      }

      // Clear session marker so next load is detected as new session
      // This triggers stale session detection in loadTestData()
      // which will mark the test as incomplete/annulled
      sessionStorage.removeItem(`test_session_${assignmentId}`);

      // Show warning message to user
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentQuestion, answers, assignmentId, studentId]);

  useEffect(() => {
    loadTestData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [assignmentId]);

  // Bot Control: Listen for bot commands to automate test
  useEffect(() => {
    const handleBotMessage = (event: MessageEvent) => {
      // Verify message origin for security
      if (event.origin !== window.location.origin) return;

      const { type, action, answer, questionId } = event.data;

      if (type !== 'BOT_ACTION') return;

      // Show visual feedback
      setBotAction(`🤖 ${action}`);
      setTimeout(() => setBotAction(null), 2000);

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

  // Pause timer countdown
  useEffect(() => {
    if (pauseTimeRemaining !== null && pauseTimeRemaining > 0) {
      const interval = setInterval(() => {
        setPauseTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [pauseTimeRemaining]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      // Skip fullscreen enforcement in guided mode
      if (isGuidedMode) {
        return;
      }

      // Skip fullscreen enforcement on localhost for testing
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        return;
      }

      // Only trigger exit warning if user exits fullscreen during active test
      // Exclude: start screens, pause screens, warning screen itself, completion, and annulled state
      if (!isCurrentlyFullscreen &&
          !showStartScreen &&
          !showSectionSelectionScreen &&
          !showPauseScreen &&
          !showPauseChoiceScreen &&
          !showCompletionScreen &&
          !showExitWarning &&
          !testAnnulled) {
        setShowExitWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [showStartScreen, showSectionSelectionScreen, showPauseScreen, showPauseChoiceScreen, showCompletionScreen, showExitWarning, testAnnulled, isGuidedMode]);

  // Exit warning countdown
  useEffect(() => {
    if (showExitWarning && exitCountdown > 0) {
      const timer = setTimeout(() => {
        setExitCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showExitWarning && exitCountdown === 0) {
      // Time's up - annul test
      annulTest();
    }
  }, [showExitWarning, exitCountdown]);

  // Check for multiple screens on start and periodically during test
  useEffect(() => {
    async function monitorScreens() {
      const hasMultipleScreens = await checkMultipleScreens();
      setMultipleScreensDetected(hasMultipleScreens);

      // If multiple screens detected during active test, annul it
      if (hasMultipleScreens &&
          !showStartScreen &&
          !showSectionSelectionScreen &&
          !showCompletionScreen &&
          !testAnnulled) {
        annulTest();
      }
    }

    monitorScreens();
    const interval = setInterval(monitorScreens, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [showStartScreen, showSectionSelectionScreen, showCompletionScreen, testAnnulled]);

  // Reset pause choice countdown when screen shows
  useEffect(() => {
    if (showPauseChoiceScreen) {
      setPauseChoiceCountdown(5);
      pauseChoiceMadeRef.current = false; // Reset ref when screen shows
    }
  }, [showPauseChoiceScreen]);

  // Pause choice countdown (auto-continue after 5 seconds)
  // Check both state and ref since state may be reset by StrictMode
  // Use pauseChoiceTrigger to force re-run when pause choice screen should show
  useEffect(() => {
    try {
      // Check ref inside useEffect to get current value
      const isPauseChoiceVisible = showPauseChoiceScreen || showPauseChoiceRef.current;
      if (isPauseChoiceVisible && pauseChoiceCountdown > 0) {
        const timer = setTimeout(() => {
          setPauseChoiceCountdown(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (isPauseChoiceVisible && pauseChoiceCountdown === 0 && !pauseChoiceMadeRef.current) {
        // Time's up - continue without pause (only if no choice was made)
        handleSkipPause(true); // true = auto-skip
      }
    } catch (error) {
      // Error in pause choice countdown
    }
  }, [showPauseChoiceScreen, pauseChoiceCountdown, pauseChoiceTrigger]);

  // Reset section transition countdown when screen shows
  useEffect(() => {
    if (showSectionTransition) {
      setSectionTransitionCountdown(5);
    }
  }, [showSectionTransition]);

  // Section transition countdown (auto-advance after 5 seconds)
  useEffect(() => {
    if (showSectionTransition && sectionTransitionCountdown > 0) {
      const timer = setTimeout(() => {
        setSectionTransitionCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSectionTransition && sectionTransitionCountdown === 0) {
      // Time's up - proceed to next section
      // Use setTimeout(0) to let any pending state updates (like reset) apply first
      // This handles the race condition where screen shows but countdown hasn't reset yet
      const timer = setTimeout(() => {
        // Only proceed if countdown is STILL 0 after state updates
        // If it was reset to 5, this check will fail and we'll wait for real countdown
        handleSectionTransitionComplete(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showSectionTransition, sectionTransitionCountdown]);

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
    algorithmConfig: any
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
          let sectionQuestions = processedQuestions.filter(q => getSection(q) === section);
          const limit = config.questions_per_section![section];

          if (limit !== undefined && limit > 0) {
            // Apply randomization if configured
            if (config.question_order === 'random') {
              sectionQuestions = [...sectionQuestions].sort(() => Math.random() - 0.5);
            }
            // Take limited number
            limitedQuestions.push(...sectionQuestions.slice(0, limit));
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
      const selectBaselineQuestions = (
        questions: Question[],
        targetSection: string,
        targetDifficulty: number | string,
        count: number
      ): Question[] => {
        // Try to get questions with target difficulty
        let candidates = questions.filter(
          q => getSection(q) === targetSection && matchesDifficulty(q, targetDifficulty)
        );

        // FALLBACK: If not enough questions with target difficulty, try other difficulties
        if (candidates.length < count) {
          // Get all questions from this section
          const allSectionQuestions = questions.filter(q => getSection(q) === targetSection);
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

  async function loadTestData() {
    try {
      setLoading(true);

      // Load assignment details (uses test tables in test mode)
      const tableSuffix = isTestMode ? '_test' : '';
      const { data: assignment, error: assignmentError } = await db
        .from(`2V_test_assignments${tableSuffix}`)
        .select(`*, 2V_tests${tableSuffix}(id, test_type, exercise_type, format)`)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      console.log('📊 [STATUS] Loaded assignment:', {
        assignmentId,
        status: assignment.status,
        currentAttempt: assignment.current_attempt,
        totalAttempts: assignment.total_attempts,
        startTime: assignment.start_time,
        completedAt: assignment.completed_at
      });

      // Check if test is locked (completed tests are auto-locked)
      if (assignment.status === 'locked') {
        console.log('🔒 [STATUS] Test is locked - showing locked screen');
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
          const existingDetails = assignment.completion_details || {};
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
            timestamp: new Date().toISOString()
          };

          // Check if attempt already exists (update instead of duplicating)
          const existingAttemptIndex = attempts.findIndex(
            (a: any) => a.attempt_number === currentAttemptNum
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
          };

          const { data: updateResult, error: statusError } = await db
            .from(`2V_test_assignments${tableSuffix}`)
            .update(updateData)
            .eq('id', assignmentId)
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

      const testType = assignment['2V_tests'].test_type;
      const exerciseType = assignment['2V_tests'].exercise_type;
      const testFormat = assignment['2V_tests'].format;

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
        .eq('test_type', testType);

      if (configsError) {
        console.error('❌ [CONFIG ERROR] Failed to load configs:', configsError);
        throw configsError;
      }

      // Find matching config by normalized track_type (case and space/underscore insensitive)
      const configData = configsData?.find(config =>
        normalize(config.track_type) === trackTypeNormalized
      );

      if (!configData) {
        console.error('❌ [CONFIG MISSING] No config found for:', {
          testType,
          exerciseType,
          availableConfigs: configsData?.map(c => ({ track_type: c.track_type, normalized: normalize(c.track_type) }))
        });
        alert('Test configuration not found. Please contact your instructor.');
        navigate(-1);
        return;
      }

      setConfig(configData);

      // Load algorithm configuration if adaptive mode is enabled
      let algorithmConfigData = null;
      if (configData.adaptivity_mode === 'adaptive' && configData.algorithm_id) {
        // Fetch algorithm config by ID from the algorithm library
        const { data: algConfig, error: algError } = await supabase
          .from('2V_algorithm_config')
          .select('*')
          .eq('id', configData.algorithm_id)
          .single();

        if (!algError && algConfig) {
          algorithmConfigData = algConfig;
          setAlgorithmConfig(algConfig);
        } else {
          console.warn('Algorithm not found for id:', configData.algorithm_id);
        }
      }

      // Load test questions (always from real tables - questions are read-only reference data)
      // Questions are linked by test_id
      const testId = assignment['2V_tests'].id;

      // For no_sections mode, order only by question_number; otherwise by section then question_number
      const questionsQuery = supabase
        .from('2V_questions')
        .select('*')
        .eq('test_id', testId);

      if (configData.section_order_mode === 'no_sections') {
        questionsQuery.order('question_number');
      } else {
        questionsQuery.order('section').order('question_number');
      }

      const { data: questions, error: questionsError } = await questionsQuery;

      if (questionsError) throw questionsError;

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

      setAllQuestions(parsedQuestions);
      setQuestionPool(parsedQuestions); // Store full pool

      // Set up sections based on config
      let sectionsToUse: string[] = [];

      // Check if this is a no-sections test first
      if (configData.section_order_mode === 'no_sections') {
        // For no_sections mode, create a single virtual section with all questions
        sectionsToUse = ['All Questions'];
      } else if (configData.section_order_mode === 'mandatory' && configData.section_order) {
        sectionsToUse = configData.section_order;
      } else if (configData.section_order_mode?.includes('macro_sections') && configData.section_order) {
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
        sectionsToUse = filterSectionsWithAdaptivity(sectionsToUse, configData.section_adaptivity_config);
      }

      setSections(sectionsToUse);

      // Initialize question selection based on config
      const initialQuestions = prepareInitialQuestions(
        questions || [],
        configData,
        algorithmConfigData
      );
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
        setTimeRemaining(configData.total_time_minutes * 60); // Convert to seconds
      }

      // Load existing answers if test is in progress (for current attempt only)
      if (assignment.status === 'in_progress' || assignment.status === 'completed') {
        const currentAttemptNumber = assignment.current_attempt || 1;
        const { data: existingAnswers, error: answersError} = await db
          .from(`2V_student_answers${tableSuffix}`)
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('attempt_number', currentAttemptNumber);

        if (!answersError && existingAnswers) {

          // Transform loaded answers back to local state format
          const loadedAnswers: Record<string, any> = {};

          existingAnswers.forEach((dbAnswer: any) => {
            const questionId = dbAnswer.question_id;
            const jsonbAnswer = dbAnswer.answer;

            // Transform JSONB back to local format
            let localAnswer: any = {
              questionId: questionId,
              flagged: dbAnswer.is_flagged || false,
              timeSpent: dbAnswer.time_spent_seconds || 0
            };

            // Detect format and transform
            if (jsonbAnswer.answer !== undefined) {
              // Simple answer
              localAnswer.answer = jsonbAnswer.answer;
            } else if (jsonbAnswer.answers && Array.isArray(jsonbAnswer.answers)) {
              // MSR question (array)
              localAnswer.msrAnswers = jsonbAnswer.answers;
              localAnswer.answer = jsonbAnswer.answers.join(',');
            } else if (jsonbAnswer.answers && typeof jsonbAnswer.answers === 'object') {
              // Check if it's GI/TPA format (part1, part2) or TA format (row keys)
              if (jsonbAnswer.answers.part1 !== undefined || jsonbAnswer.answers.part2 !== undefined) {
                // GI or TPA format
                localAnswer.blank1 = jsonbAnswer.answers.part1;
                localAnswer.blank2 = jsonbAnswer.answers.part2;
                localAnswer.column1 = jsonbAnswer.answers.part1; // For TPA
                localAnswer.column2 = jsonbAnswer.answers.part2;
                localAnswer.answer = `${jsonbAnswer.answers.part1 || ''}|${jsonbAnswer.answers.part2 || ''}`;
              } else {
                // TA format
                localAnswer.taAnswers = jsonbAnswer.answers;
                localAnswer.answer = Object.values(jsonbAnswer.answers).join(',');
              }
            }

            loadedAnswers[questionId] = localAnswer;
          });

          setAnswers(loadedAnswers);
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
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return;
    }

    // If restarting from annulled/incomplete, increment attempt
    if (assignment.status === 'annulled' || assignment.status === 'incomplete') {
      const newAttempt = (assignment.current_attempt || 1) + 1;
      const newTotalAttempts = assignment.total_attempts || (assignment.current_attempt || 1);

      console.log(`🔄 [STATUS] ${assignment.status} → in_progress (attempt ${assignment.current_attempt} → ${newAttempt})`, {
        assignmentId,
        previousStatus: assignment.status,
        newStatus: 'in_progress',
        completion_status: 'in_progress',
        previousAttempt: assignment.current_attempt,
        newAttempt,
        totalAttempts: newTotalAttempts
      });

      const { error: updateError } = await supabase
        .from('2V_test_assignments')
        .update({
          current_attempt: newAttempt,
          total_attempts: newTotalAttempts,
          status: 'in_progress',
          completion_status: 'in_progress',
          start_time: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (updateError) {
        console.error('❌ [STATUS ERROR] Failed to update status to in_progress:', updateError);
        return;
      }

      console.log('✅ [STATUS] Successfully updated to in_progress');
      setCurrentAttempt(newAttempt);
    } else if (assignment.status === 'unlocked') {
      // First time starting this test
      console.log(`🔄 [STATUS] unlocked → in_progress (first attempt)`, {
        assignmentId,
        previousStatus: 'unlocked',
        newStatus: 'in_progress',
        completion_status: 'in_progress'
      });

      const { error: updateError } = await supabase
        .from('2V_test_assignments')
        .update({
          status: 'in_progress',
          completion_status: 'in_progress',
          start_time: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (updateError) {
        console.error('❌ [STATUS ERROR] Failed to update status to in_progress:', updateError);
        return;
      }

      console.log('✅ [STATUS] Successfully updated to in_progress');
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

  function startSectionTimer(sectionOverride?: string) {
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Skip timer in guided mode with no time limit
    if (isGuidedMode && !guidedTimed) {
      setTimeRemaining(null);
      return;
    }

    // Use override section if provided (to avoid stale closure issues), otherwise use current section
    const section = sectionOverride || currentSection;

    // Get time for section from config
    let sectionTime: number | null = null;

    if (config?.time_per_section && section) {
      // Specific time per section
      sectionTime = config.time_per_section[section] || null;
    } else if (config?.total_time_minutes && sections.length > 0) {
      // Proportional time: divide total time by number of sections
      sectionTime = Math.round(config.total_time_minutes / sections.length);
    }

    if (sectionTime) {
      setTimeRemaining(sectionTime * 60); // Convert to seconds
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null) return prev;
          if (prev <= 0) return 0; // Already at 0, don't call handleTimeUp again
          if (prev === 1) {
            // Transitioning to 0 - call handleTimeUp once
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  function handleTimeUp() {
    if (timerRef.current) clearInterval(timerRef.current);

    // If in review mode, close the review screen and complete the review
    // Use refs to get actual values (avoids stale closure in timer callbacks)
    if (isInReviewModeRef.current || showReviewScreenRef.current) {
      setShowReviewScreen(false);
      showReviewScreenRef.current = false;
      setIsInReviewMode(false);
      isInReviewModeRef.current = false;
      setOriginalAnswers({});
      setAnswerChangesUsed(0);
      // Call completeSection with a flag to skip the review mode check
      completeSectionAfterTimeUp();
      return;
    }

    // Complete the section instead of submitting the entire test
    // This will handle navigation to next section, pause screens, or final submission
    completeSection();
  }

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

    // Clear the section timer to prevent it from running during pause
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Check for mandatory pause
    if (config?.pause_mode === 'between_sections' &&
        config.pause_sections?.includes(actualCurrentSection)) {
      const pauseDuration = (config.pause_duration_minutes || 5) * 60;
      setPauseTimeRemaining(pauseDuration);
      setShowPauseScreen(true);
      setTimeout(() => {
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
    if (actualCurrentSectionIndex < sections.length - 1) {
      setShowSectionTransition(true);
      setTimeout(() => {
        setIsCompletingSection(false);
        isCompletingSectionRef.current = false;
      }, 500);
      return;
    }

    // Last section - move to completion
    moveToNextSection(actualCurrentSectionIndex);
  }

  function handleAnswerSelect(answer: string) {
    if (!currentQuestion) return;

    // Extra safety: reject if time has expired
    if (timeRemaining !== null && timeRemaining <= 0) {
      return;
    }

    updateAnswer(currentQuestion.id, (prev) => ({
      questionId: currentQuestion.id,
      answer,
      timeSpent: prev?.timeSpent || 0,
      flagged: prev?.flagged || false,
    }));

    // Record response with adaptive algorithm if enabled
    if (adaptiveAlgorithm && config?.adaptivity_mode === 'adaptive') {
      // Get correct answer from the right place (answers JSONB field for GMAT, correct_answer for others)
      const answersData = typeof currentQuestion.answers === 'string'
        ? JSON.parse(currentQuestion.answers)
        : currentQuestion.answers;
      const correctAnswerData = answersData?.correct_answer || currentQuestion.correct_answer;

      // Normalize correct answer (may be array or string)
      const correctAnswer = Array.isArray(correctAnswerData) ? correctAnswerData[0] : correctAnswerData;

      // Compare (case-insensitive for letter answers)
      const normalizedAnswer = typeof answer === 'string' ? answer.toUpperCase() : answer;
      const normalizedCorrect = typeof correctAnswer === 'string' ? correctAnswer.toUpperCase() : correctAnswer;
      const isCorrect = normalizedAnswer === normalizedCorrect;

      adaptiveAlgorithm.recordResponse(currentQuestion, isCorrect);
    }
  }

  function toggleFlag() {
    if (!currentQuestion) return;

    // Extra safety: reject if time has expired
    if (timeRemaining !== null && timeRemaining <= 0) {
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {
          questionId: currentQuestion.id,
          answer: null,
          timeSpent: 0,
          flagged: false,
        }),
        flagged: !(prev[currentQuestion.id]?.flagged || false),
      }
    }));
  }

  function canGoBack(): boolean {
    if (!config) {
      return false;
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

    if (!canGoBack()) return;

    // Save current answer before navigating back (or save empty answer to track question order)
    if (currentQuestion?.id) {
      await saveAnswer(
        currentQuestion.id,
        answers[currentQuestion.id] || { answer: null },
        answers[currentQuestion.id]?.flagged || false,
        0,
        currentQuestionIndex + 1
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
  }

  /**
   * Save or update an answer to the database
   * Includes retry logic and error handling
   */
  async function saveAnswer(
    questionId: string,
    answerData: any,
    isFlagged: boolean = false,
    retryCount: number = 0,
    questionOrder?: number
  ): Promise<boolean> {
    if (!assignmentId || !studentId) {
      return false;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Calculate time spent on this question
      const startTime = questionStartTimes[questionId];
      const timeSpentSeconds = startTime
        ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        : 0;

      // Transform answer to JSONB format based on question type
      let jsonbAnswer: any = {};

      // Check the structure of answerData to determine format
      if (answerData.msrAnswers) {
        // MSR question: array of answers
        jsonbAnswer = { answers: answerData.msrAnswers };
      } else if (answerData.blank1 !== undefined || answerData.blank2 !== undefined) {
        // GI question: two-part analysis
        jsonbAnswer = {
          answers: {
            part1: answerData.blank1 || null,
            part2: answerData.blank2 || null
          }
        };
      } else if (answerData.taAnswers) {
        // TA question: table analysis with multiple rows
        jsonbAnswer = { answers: answerData.taAnswers };
      } else if (answerData.column1 || answerData.column2) {
        // TPA question: two-part analysis
        jsonbAnswer = {
          answers: {
            part1: answerData.column1 || null,
            part2: answerData.column2 || null
          }
        };
      } else if (answerData.answer !== undefined) {
        // Simple question: single answer (can be null for flagged but unanswered)
        jsonbAnswer = { answer: answerData.answer };
      } else {
        // No answer data at all - still save for flagged status
        jsonbAnswer = { answer: null };
      }

      // Upsert answer to database (uses test tables in test mode)
      const tableSuffix = isTestMode ? '_test' : '';
      const { error } = await db
        .from(`2V_student_answers${tableSuffix}`)
        .upsert({
          assignment_id: assignmentId,
          student_id: studentId,
          question_id: questionId,
          attempt_number: currentAttempt,
          answer: jsonbAnswer,
          is_flagged: isFlagged,
          time_spent_seconds: timeSpentSeconds,
          question_order: questionOrder,
          // Guided mode fields
          is_guided: isGuidedMode,
          guided_settings: isGuidedMode ? {
            timed: guidedTimed
          } : null,
        }, {
          onConflict: 'assignment_id,question_id,attempt_number'
        });

      if (error) {
        throw error;
      }

      // Update assignment status to 'in_progress' on first answer (if still unlocked)
      // Note: annulled/incomplete transitions are now handled in loadTestData
      const { error: statusError } = await db
        .from(`2V_test_assignments${tableSuffix}`)
        .update({
          status: 'in_progress',
          start_time: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .eq('status', 'unlocked');

      setIsSaving(false);
      return true;

    } catch (error: any) {
      // Retry logic with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s

        await new Promise(resolve => setTimeout(resolve, delay));
        return saveAnswer(questionId, answerData, isFlagged, retryCount + 1, questionOrder);
      } else {
        // Final failure after 3 attempts
        setSaveError('Failed to save answer. Your progress may not be saved.');
        setIsSaving(false);
        return false;
      }
    }
  }

  async function goToNextQuestion() {
    // Extra safety: reject if time has expired
    if (timeRemaining !== null && timeRemaining <= 0) {
      return;
    }

    // Save current answer immediately before navigating (or save empty answer to track question order)
    if (currentQuestion?.id) {
      await saveAnswer(
        currentQuestion.id,
        answers[currentQuestion.id] || { answer: null },
        answers[currentQuestion.id]?.flagged || false,
        0,
        currentQuestionIndex + 1
      );
    }

    // Check if answer is required
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
          const hasAnyAnswer = currentAnswer.blank1 || currentAnswer.blank2;
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
          const hasAnyAnswer = currentAnswer.column1 || currentAnswer.column2;
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
        let questionLimitForSection = 20; // default
        if (config.questions_per_section) {
          questionLimitForSection = config.questions_per_section[currentSection] || 20;

          if (sectionSelectedQuestions.length >= questionLimitForSection) {
            completeSection();
            return;
          }
        }

        const answeredQuestionIds = new Set(sectionSelectedQuestions.map(q => q.id));

        // Get available questions from pool (not yet shown in this section)
        const availableQuestions = questionPool.filter(
          q => !answeredQuestionIds.has(q.id) && getSectionField(q) === currentSection
        );

        if (availableQuestions.length > 0) {
          let nextQuestion;

          if (adaptiveAlgorithm) {
            // Use adaptive algorithm to select next question
            nextQuestion = await adaptiveAlgorithm.selectNextQuestion(
              availableQuestions,
              currentSection
            );
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
            // Explicitly mark as NOT baseline (adaptive question)
            nextQuestion.is_base = false;

            // Add to selected questions
            setSelectedQuestions(prev => [...prev, nextQuestion]);

            // Move to the new question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            return;
          }
        } else {
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
      } else {
        // We're at the last selected question
        // The adaptive logic above should have added a new question if base questions are complete
        // If it didn't (no more questions available), it already called completeSection()
        // Just as a safety, do nothing here - the adaptive logic handles it
      }
    } else {
      // Non-adaptive mode: check if we're at the end of section
      if (currentQuestionIndex < totalQuestionsInSection - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeSection();
      }
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

    // Clear the section timer to prevent it from running during pause
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Check for mandatory pause
    if (config?.pause_mode === 'between_sections' &&
        config.pause_sections?.includes(actualCurrentSection)) {
      const pauseDuration = (config.pause_duration_minutes || 5) * 60;
      setPauseTimeRemaining(pauseDuration);
      setShowPauseScreen(true);
      setTimeout(() => {
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
    if (actualCurrentSectionIndex < sections.length - 1) {
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

  function handleSectionTransitionComplete(isAuto = false) {
    // Extra safety: reject manual clicks if countdown has expired (allow auto-transition)
    if (!isAuto && sectionTransitionCountdown <= 0) {
      return;
    }

    // Prevent race condition: if already transitioning, ignore this call
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    setShowSectionTransition(false);
    moveToNextSection(currentSectionIndexRef.current);
    // Reset flag after a short delay to allow state updates
    setTimeout(() => setIsTransitioning(false), 500);
  }

  async function savePauseEventToDatabase(action: 'pause_taken' | 'pause_skipped' | 'pause_auto_skipped') {
    if (!assignmentId || !currentAttempt) return;

    try {
      // Get current completion_details
      const { data: assignment, error: fetchError } = await supabase
        .from('2V_test_assignments')
        .select('completion_details')
        .eq('id', assignmentId)
        .single();

      if (fetchError) {
        return;
      }

      const completionDetails = assignment?.completion_details || { attempts: [] };
      const attempts = Array.isArray(completionDetails.attempts) ? completionDetails.attempts : [];

      // Find current attempt
      const attemptIndex = attempts.findIndex((a: any) => a.attempt_number === currentAttempt);

      const pauseEvent = {
        timestamp: new Date().toISOString(),
        section: currentSection,
        action
      };

      if (attemptIndex >= 0) {
        // Update existing attempt
        if (!attempts[attemptIndex].pause_events) {
          attempts[attemptIndex].pause_events = [];
        }
        attempts[attemptIndex].pause_events.push(pauseEvent);

        // Update pauses_used if this is a pause_taken
        if (action === 'pause_taken') {
          attempts[attemptIndex].pauses_used = (attempts[attemptIndex].pauses_used || 0) + 1;
        }
      } else {
        // Create new attempt record with pause event
        attempts.push({
          attempt_number: currentAttempt,
          pause_events: [pauseEvent],
          pauses_used: action === 'pause_taken' ? 1 : 0,
          pauses_available: config?.max_pauses || 0
        });
      }

      // Save to database
      const { error: updateError } = await supabase
        .from('2V_test_assignments')
        .update({ completion_details: { attempts } })
        .eq('id', assignmentId);

    } catch (err) {
      // Error in savePauseEventToDatabase
    }
  }

  function handleTakePause() {
    // Extra safety: reject if countdown has expired or choice already made
    if (pauseChoiceCountdown <= 0 || pauseChoiceMadeRef.current) {
      return;
    }

    // Mark choice as made immediately
    pauseChoiceMadeRef.current = true;

    setPausesUsed(prev => prev + 1);
    // Record pause event in state
    const pauseEvent = {
      timestamp: new Date().toISOString(),
      section: currentSection,
      action: 'pause_taken' as const
    };
    setPauseEvents(prev => [...prev, pauseEvent]);

    // Save to database immediately
    savePauseEventToDatabase('pause_taken');

    showPauseChoiceRef.current = false; // Clear ref
    setShowPauseChoiceScreen(false);
    const pauseDuration = (config?.pause_duration_minutes || 5) * 60;
    setPauseTimeRemaining(pauseDuration);
    setShowPauseScreen(true);
    setTimeout(() => {
      setShowPauseScreen(false);
      setPauseTimeRemaining(null);
      moveToNextSection(currentSectionIndexRef.current);
    }, pauseDuration * 1000);
  }

  function handleSkipPause(isAutoSkip = false) {
    // Extra safety: reject if choice already made or countdown expired (for manual clicks)
    if (pauseChoiceMadeRef.current) {
      return;
    }
    if (!isAutoSkip && pauseChoiceCountdown <= 0) {
      return;
    }

    // Mark choice as made immediately
    pauseChoiceMadeRef.current = true;

    const action = isAutoSkip ? 'pause_auto_skipped' : 'pause_skipped';

    // Record pause skip event in state
    const pauseEvent = {
      timestamp: new Date().toISOString(),
      section: currentSection,
      action: action as 'pause_skipped' | 'pause_auto_skipped'
    };
    setPauseEvents(prev => [...prev, pauseEvent]);

    // Save to database immediately
    savePauseEventToDatabase(action);

    // Reset countdown for next time (defensive measure)
    setPauseChoiceCountdown(5);
    showPauseChoiceRef.current = false; // Clear ref
    setShowPauseChoiceScreen(false);
    moveToNextSection(currentSectionIndexRef.current);
  }

  function moveToNextSection(sectionIndexOverride?: number) {
    // Use override if provided (to avoid stale closure issues), otherwise use state
    const currentIndex = sectionIndexOverride !== undefined ? sectionIndexOverride : currentSectionIndex;

    if (currentIndex < sections.length - 1) {
      const nextSectionIndex = currentIndex + 1;
      const nextSection = sections[nextSectionIndex];

      setCurrentSectionIndex(nextSectionIndex);
      setCurrentQuestionIndex(0);
      setSectionStartTime(new Date());


      // For adaptive mode with per_section base questions, reset algorithm state and add base questions for new section
      if (config?.adaptivity_mode === 'adaptive' &&
          config?.use_base_questions &&
          config?.base_questions_scope === 'per_section') {

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

  async function submitTest() {
    // Prevent double submission
    if (submitting) {
      console.warn('⚠️ [STATUS] Submit prevented - already submitting');
      return;
    }

    console.log('🚀 [STATUS] Test submission started', {
      assignmentId,
      currentAttempt,
      answersCount: Object.keys(answers).length
    });

    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    // Save final answer if any (or save empty answer to track question order)
    if (currentQuestion?.id) {
      await saveAnswer(
        currentQuestion.id,
        answers[currentQuestion.id] || { answer: null },
        answers[currentQuestion.id]?.flagged || false,
        0,
        currentQuestionIndex + 1
      );
    }

    // Mark test as completed in database with completion_details
    try {
      console.log('💾 [STATUS] Saving completion details...');
      // Save completion details
      const success = await saveCompletionDetails('completed', 'submitted');

      if (!success) {
        throw new Error('Failed to save completion details');
      }

      console.log('✅ [STATUS] Test submitted successfully - status="locked", completion_status="completed YYYY-MM-DD at HH:MM"');
      // Show completion screen
      setShowCompletionScreen(true);
      setSubmitting(false);
    } catch (err) {
      console.error('❌ [STATUS] Test submission failed:', err);
      setSubmitting(false);
      alert('Error submitting test. Please contact your instructor.');
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Check for multiple screens
  async function checkMultipleScreens(): Promise<boolean> {
    // Disable multiple screen detection in guided mode
    if (isGuidedMode) {
      return false;
    }

    // Disable multiple screen detection on localhost for development
    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';

    if (isLocalhost) {
      return false;
    }

    try {
      // @ts-ignore - Screen Detection API may not be in TypeScript types yet
      if (window.screen.isExtended !== undefined) {
        // @ts-ignore
        return window.screen.isExtended;
      }

      // Fallback: check screen count using getScreenDetails if available
      // @ts-ignore
      if ('getScreenDetails' in window) {
        // @ts-ignore
        const screens = await window.getScreenDetails();
        return screens.screens.length > 1;
      }

      // Fallback: return false if API not available
      return false;
    } catch (err) {
      return false;
    }
  }

  // Enter fullscreen mode
  function enterFullscreen() {
    // Skip fullscreen in guided mode
    if (isGuidedMode) {
      return;
    }

    // Skip fullscreen on localhost for testing
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return;
    }

    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  }

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
      const { data: currentAssignment, error: fetchError } = await supabase
        .from('2V_test_assignments')
        .select('completion_details, start_time, current_attempt, total_attempts')
        .eq('id', assignmentId)
        .single();

      const existingDetails = currentAssignment?.completion_details || {};
      const attempts = Array.isArray(existingDetails.attempts) ? existingDetails.attempts : [];

      // Create attempt record with ONLY essential metadata (no redundant data)
      const newAttempt: any = {
        attempt_number: currentAttempt,
        status,
        reason,
        started_at: currentAssignment?.start_time || testStartTime?.toISOString() || new Date().toISOString(),
        completed_at: new Date().toISOString(),

        // Environment/security info
        browser_info: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
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

      // Check if attempt already exists (update instead of duplicating)
      const existingAttemptIndex = attempts.findIndex(
        (a: any) => a.attempt_number === currentAttempt
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

      console.log(`🔄 [STATUS] Completing test: in_progress → ${finalStatus}`, {
        assignmentId,
        status,
        finalStatus,
        completion_status: completionStatusText,
        reason,
        currentAttempt,
        newTotalAttempts
      });

      const updateData = {
        status: finalStatus,
        completion_status: completionStatusText,
        completed_at: new Date().toISOString(),
        completion_details: { attempts },
        total_attempts: newTotalAttempts,
        // IMPORTANT: Hide results when test is completed/annulled
        // Tutor must explicitly enable visibility after reviewing with student
        results_viewable_by_student: false
      };

      console.log('📝 [STATUS] Update data:', {
        ...updateData,
        completion_details: `${attempts.length} attempt(s)`
      });

      const { data: updateResult, error } = await supabase
        .from('2V_test_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select();

      if (error) {
        console.error('❌ [STATUS ERROR] Failed to save completion:', error);
        throw error;
      }

      console.log('✅ [STATUS] Test completion saved successfully', {
        assignmentId,
        finalStatus,
        completion_status: completionStatusText,
        updateResult: updateResult?.[0]
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  function annulTest() {
    // Determine annulment reason
    let annulmentReason = 'unknown';
    if (multipleScreensDetected) {
      annulmentReason = 'multiple_screens_detected';
    } else if (showExitWarning) {
      annulmentReason = 'exited_fullscreen';
    }

    // Save completion details
    saveCompletionDetails(
      'annulled',
      multipleScreensDetected ? 'multiple_screens' : 'fullscreen_exit',
      annulmentReason
    );

    setTestAnnulled(true);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  // Handle exit warning countdown
  function handleStayInTest() {
    // Extra safety: reject if countdown has expired
    if (exitCountdown <= 0) {
      return;
    }

    setShowExitWarning(false);
    setExitCountdown(5);
    enterFullscreen();
  }

  function handleConfirmExit() {
    // Extra safety: reject if countdown has expired
    if (exitCountdown <= 0) {
      return;
    }

    annulTest();
  }

  if (loading) {
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
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faLock} className="text-5xl text-red-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t('takeTest.testLocked') || 'Test Locked'}
            </h2>
            <p className="text-gray-700 mb-6">
              {t('takeTest.testLockedMessage') || 'This test has been completed and is now locked. Contact your tutor to unlock it if you need to retake the test.'}
            </p>
            <button
              onClick={() => navigate('/student/home')}
              className="px-8 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
            >
              {t('takeTest.backToHome') || 'Back to Home'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Test Annulled Screen
  if (testAnnulled) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              {t('takeTest.testAnnulled')}
            </h2>
            <p className="text-gray-700 mb-6">
              {multipleScreensDetected
                ? t('takeTest.multipleScreensDetected')
                : t('takeTest.fullscreenExitDetected')}
            </p>
            <p className="text-gray-600 mb-8">
              {t('takeTest.contactInstructor')}
            </p>
            <button
              onClick={() => {
                // Navigate back to student home with test type parameter
                if (config?.test_type) {
                  navigate(`/student/home?test=${config.test_type}`);
                } else {
                  navigate('/student/home');
                }
              }}
              className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
            >
              {t('takeTest.backToTestSelection')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Exit Warning Screen (5-second countdown)
  if (showExitWarning) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-lg border-4 border-red-500">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              {t('takeTest.exitWarningTitle')}
            </h2>
            <p className="text-gray-700 mb-6">
              {t('takeTest.exitWarningMessage')}
            </p>

            {/* Countdown Timer */}
            <div className="bg-red-600 text-white rounded-2xl p-8 mb-6">
              <p className="text-sm uppercase tracking-wide mb-2">{t('takeTest.testWillBeAnnulledIn')}</p>
              <div className="text-8xl font-bold font-mono">
                {exitCountdown}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConfirmExit}
                disabled={exitCountdown <= 1}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('takeTest.exitTest')}
              </button>
              <button
                onClick={handleStayInTest}
                disabled={exitCountdown <= 1}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('takeTest.stayInTest')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Start Screen
  if (showStartScreen && config) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">
              {config.test_type} - {translateTestTrack(config.track_type, t)}
            </h1>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {(i18n.language === 'en' ? config.test_start_message : config.messaggio_iniziale_test) || t('takeTest.welcome') || 'Welcome to the test!'}
              </pre>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('takeTest.cancel')}
              </button>
              <button
                onClick={startTest}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                {t('takeTest.startTest')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Section Selection Screen (for user_choice mode)
  if (showSectionSelectionScreen && config) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-4">
              {t('takeTest.chooseSectionOrder')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('takeTest.chooseSectionOrderDesc')}
            </p>

            {/* Section List */}
            <div className="space-y-3 mb-8">
              {userSelectedSections.map((section, index) => (
                <div
                  key={`${section}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDragEnd}
                  className={`flex items-center gap-3 border-2 rounded-xl p-4 transition-all cursor-move ${
                    draggedSectionIndex === index
                      ? 'border-brand-green bg-green-50 opacity-50 scale-95'
                      : 'bg-gray-50 border-gray-200 hover:border-brand-green hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0}
                      className="text-gray-500 hover:text-brand-green disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} rotation={90} />
                    </button>
                    <button
                      onClick={() => moveSectionDown(index)}
                      disabled={index === userSelectedSections.length - 1}
                      className="text-gray-500 hover:text-brand-green disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faArrowRight} rotation={90} />
                    </button>
                  </div>

                  <div className="flex-shrink-0 w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{section}</div>
                    <div className="text-sm text-gray-500">
                      {config?.questions_per_section?.[section] || allQuestions.filter(q => getSectionField(q) === section).length} {t('takeTest.questions')}
                      {config.time_per_section?.[section] && (
                        <> • {config.time_per_section[section]} {t('common.minutes')}</>
                      )}
                    </div>
                  </div>

                  <FontAwesomeIcon icon={faGripVertical} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowSectionSelectionScreen(false);
                  setShowStartScreen(true);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('common.back')}
              </button>
              <button
                onClick={beginTestWithSelectedSections}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                {t('takeTest.beginTest')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Section Transition Screen
  if (showSectionTransition) {
    const nextSectionIndex = currentSectionIndex + 1;
    const nextSection = sections[nextSectionIndex];
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-lg">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-brand-dark mb-4">
            {t('takeTest.sectionCompleted')}
          </h2>
          <p className="text-xl text-gray-700 mb-2">
            {formatSectionName(currentSection)}
          </p>
          <p className="text-gray-600 mb-8">
            {t('takeTest.wellDone')}
          </p>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-r from-brand-green to-green-600 text-white rounded-2xl p-6 mb-6">
            <p className="text-sm uppercase tracking-wide mb-2">{t('takeTest.nextSectionIn')}</p>
            <div className="text-6xl font-bold font-mono">
              {sectionTransitionCountdown}
            </div>
            <p className="text-sm mt-2 opacity-90">{t('takeTest.secondsRemaining')}</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">{t('takeTest.upNext')}</p>
            <p className="text-xl font-bold text-brand-dark">{formatSectionName(nextSection)}</p>
          </div>

          <button
            onClick={handleSectionTransitionComplete}
            disabled={isTransitioning || sectionTransitionCountdown <= 1}
            className="w-full px-8 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransitioning ? 'Loading...' : t('takeTest.continueNow')}
          </button>
        </div>
      </div>
    );
  }

  // Pause Choice Screen (for user_choice mode)
  // Use ref to persist across StrictMode remounts
  const shouldShowPauseChoice = showPauseChoiceScreen || showPauseChoiceRef.current;
  if (shouldShowPauseChoice) {
    const pausesRemaining = (config?.max_pauses || 0) - pausesUsed;
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-lg">
            <div className="text-6xl mb-6">☕</div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">
              {t('takeTest.sectionComplete')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('takeTest.completedSection')} <span className="font-semibold">{formatSectionName(currentSection)}</span>
            </p>

            {/* Countdown Timer */}
            <div className="bg-orange-500 text-white rounded-2xl p-6 mb-6">
              <p className="text-sm uppercase tracking-wide mb-2">{t('takeTest.autoContinueIn')}</p>
              <div className="text-6xl font-bold font-mono">
                {pauseChoiceCountdown}
              </div>
              <p className="text-sm mt-2 opacity-90">{t('takeTest.secondsRemaining')}</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <p className="text-gray-700 mb-2">
                {t('takeTest.pauseQuestion')}
              </p>
              <p className="text-sm text-gray-600">
                {t('takeTest.pausesRemaining')}: <span className="font-bold text-brand-green">{pausesRemaining}</span>
              </p>
              <p className="text-sm text-gray-600">
                {t('takeTest.pauseDuration')}: <span className="font-bold">{config?.pause_duration_minutes || 5} {t('common.minutes')}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSkipPause}
                disabled={pauseChoiceCountdown <= 1}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('takeTest.continueWithoutPause')}
              </button>
              <button
                onClick={handleTakePause}
                disabled={pauseChoiceCountdown <= 1}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('takeTest.takePause')}
              </button>
            </div>
          </div>
      </div>
    );
  }

  // Pause Screen
  if (showPauseScreen) {
    const isUserChoice = config?.pause_mode === 'user_choice';
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
            <div className="text-6xl mb-6 text-brand-green">⏸️</div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">
              {isUserChoice ? t('takeTest.pauseBreak') : t('takeTest.mandatoryBreak')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('takeTest.completedSection')} <span className="font-semibold">{formatSectionName(currentSection)}</span>
            </p>

            {/* Countdown Timer */}
            {pauseTimeRemaining !== null && (
              <div className="bg-gradient-to-r from-brand-green to-green-600 text-white rounded-2xl p-8 mb-6">
                <p className="text-sm uppercase tracking-wide mb-2">{t('takeTest.timeRemaining')}</p>
                <div className="text-6xl font-bold font-mono">
                  {formatTime(pauseTimeRemaining)}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500">
              {t('takeTest.relaxAndRecharge')}
            </p>
          </div>
      </div>
    );
  }

  // Completion Screen
  if (showCompletionScreen) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl w-full">
            <div className="text-center bg-white rounded-2xl shadow-xl p-12">
              {/* Success Icon */}
              <div className="mb-6">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-brand-green text-8xl"
                />
              </div>

              {/* Title */}
              <h2 className="text-4xl font-bold text-brand-dark mb-4">
                {t('takeTest.testComplete', 'Test Complete!')}
              </h2>

              {/* Confirmation Message */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                <p className="text-lg text-gray-700 mb-2">
                  ✓ {t('takeTest.answersSubmitted', 'Your answers have been successfully submitted')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('takeTest.thankYou', 'Thank you for completing the test')}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/student/home')}
                className="px-10 py-4 bg-gradient-to-r from-brand-green to-green-600 text-white text-lg rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                {t('takeTest.returnToDashboard', 'Return to Dashboard')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // PDF Test Interface
  if (isPDFTest && !showStartScreen && !showCompletionScreen) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header with Timer and Section Info */}
        <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-dark">{formatSectionName(currentSection)}</h2>
            <p className="text-sm text-gray-600">
              Section {currentSectionIndex + 1} of {sections.length}
            </p>
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
            questions={sectionQuestions}
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
                if (!pageGroups[pageNum]) pageGroups[pageNum] = [];
                pageGroups[pageNum].push(q);
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
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">
            {config?.section_order_mode === 'no_sections'
              ? (currentQuestion?.section ? formatSectionName(currentQuestion.section) : `Domanda ${currentQuestionIndex + 1}`)
              : formatSectionName(currentSection)
            }
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">
              {t('takeTest.question')} {currentQuestionIndex + 1} {t('takeTest.of')} {sectionQuestionLimit}
            </p>
            {isSaving && (
              <span className="text-xs text-gray-500 italic flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            )}
            {saveError && (
              <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                ⚠️ {saveError}
              </span>
            )}
            {/* Review Mode Indicator with Changes Counter */}
            {isInReviewMode && config?.max_answer_changes !== undefined && (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                answerChangesUsed >= config.max_answer_changes
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                📝 {t('takeTest.changesUsed')}: {answerChangesUsed}/{config.max_answer_changes}
              </span>
            )}
          </div>
          {/* Debug info for testing - Only show in adaptive mode */}
          {/* Hidden for production - uncomment to debug adaptive algorithm
          {config?.adaptivity_mode === 'adaptive' && (
            <div className="flex gap-4 mt-1 text-xs">
              <span className={`font-semibold ${currentQuestion?.is_base ? 'text-blue-600' : 'text-purple-600'}`}>
                {currentQuestion?.is_base ? '🔵 BASELINE' : '🟣 ADAPTIVE'}
              </span>
            </div>
          )}
          */}
        </div>
        {timeRemaining !== null && (
          <div className="flex items-center gap-2 text-lg">
            <FontAwesomeIcon icon={faClock} className="text-brand-green" />
            <span className={`font-mono font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-800'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
        {/* Guided Mode Indicator */}
        {isGuidedMode && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
              <span>🎓</span>
              <span>{t('takeTest.guidedMode', 'Guided Mode')}</span>
              {!guidedTimed && <span className="text-purple-500">• {t('takeTest.noTimeLimit', 'No time limit')}</span>}
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
              {showCorrectAnswers ? '👁️ ' + t('takeTest.hideAnswers', 'Hide Answers') : '👁️ ' + t('takeTest.showAnswers', 'Show Answers')}
            </button>
          </div>
        )}
      </div>

      {/* Question Content */}
      <div className={`flex-1 overflow-y-auto ${currentQuestion?.question_data?.passage_text ? 'p-4' : 'p-6'}`}>
        <div className={`${currentQuestion?.question_data?.passage_text ? 'w-full max-w-full' : 'max-w-4xl'} mx-auto bg-white rounded-2xl shadow-lg ${currentQuestion?.question_data?.passage_text ? 'p-6' : 'p-8'}`}>
          {/* Question Text */}
          <div className="mb-8">
            <div className="flex items-start justify-end gap-2 mb-4">
              {/* Bookmark Button (GMAT-style) */}
              {config?.allow_bookmarks && currentQuestion?.id && (
                <button
                  onClick={() => toggleBookmark(currentQuestion.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
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

            {/* GMAT Data Insights Question Types */}
            {currentQuestion?.question_data?.di_type === 'DS' && (() => {
              const answersData = typeof currentQuestion.answers === 'string'
                ? JSON.parse(currentQuestion.answers)
                : currentQuestion.answers;
              const correctAnswerData = answersData?.correct_answer;
              const correctDSAnswer = Array.isArray(correctAnswerData) ? correctAnswerData[0] : correctAnswerData;

              return (
                <DSQuestion
                  problem={currentQuestion.question_data.problem || ''}
                  statement1={currentQuestion.question_data.statement1 || ''}
                  statement2={currentQuestion.question_data.statement2 || ''}
                  selectedAnswer={answers[currentQuestion.id]?.answer}
                  onAnswerChange={handleAnswerSelect}
                  correctAnswer={correctDSAnswer}
                  showResults={isGuidedMode && showCorrectAnswers}
                />
              );
            })()}

          {currentQuestion?.question_data?.di_type === 'MSR' && (() => {
            const answersData = typeof currentQuestion.answers === 'string'
              ? JSON.parse(currentQuestion.answers)
              : currentQuestion.answers;
            const correctAnswerData = answersData?.correct_answer;
            const correctMSRAnswers = Array.isArray(correctAnswerData) ? correctAnswerData : [];

            return (
              <MSRQuestion
                sources={currentQuestion.question_data.sources || []}
                questions={currentQuestion.question_data.questions || []}
                selectedAnswers={answers[currentQuestion.id]?.msrAnswers || []}
                onAnswerChange={(qIndex, answer) => {
                  const currentMSRAnswers = answers[currentQuestion.id]?.msrAnswers || [];
                  const newMSRAnswers = [...currentMSRAnswers];
                  newMSRAnswers[qIndex] = answer;
                  updateAnswer(currentQuestion.id, (prev) => ({
                    ...prev,
                    questionId: currentQuestion.id,
                    msrAnswers: newMSRAnswers,
                    answer: newMSRAnswers.join(','),
                    timeSpent: prev?.timeSpent || 0,
                    flagged: prev?.flagged || false,
                  }));
                }}
                correctAnswers={correctMSRAnswers}
                showResults={isGuidedMode && showCorrectAnswers}
              />
            );
          })()}

          {currentQuestion?.question_data?.di_type === 'GI' && (() => {
            const answersData = typeof currentQuestion.answers === 'string'
              ? JSON.parse(currentQuestion.answers)
              : currentQuestion.answers;
            const correctAnswerData = answersData?.correct_answer;

            return (
              <GIQuestion
                chartConfig={currentQuestion.question_data.chart_config}
                contextText={currentQuestion.question_data.context_text}
                statementText={currentQuestion.question_data.statement_text || ''}
                blank1Options={currentQuestion.question_data.blank1_options || []}
                blank2Options={currentQuestion.question_data.blank2_options || []}
                imageUrl={currentQuestion.question_data.image_url || undefined}
                selectedBlank1={answers[currentQuestion.id]?.blank1}
                selectedBlank2={answers[currentQuestion.id]?.blank2}
                onBlank1Change={(value) => {
                  updateAnswer(currentQuestion.id, (prev) => ({
                    ...prev,
                    questionId: currentQuestion.id,
                    blank1: value,
                    blank2: prev?.blank2,
                    answer: `${value}|${prev?.blank2 || ''}`,
                    timeSpent: prev?.timeSpent || 0,
                    flagged: prev?.flagged || false,
                  }));
                }}
                onBlank2Change={(value) => {
                  updateAnswer(currentQuestion.id, (prev) => ({
                    ...prev,
                    questionId: currentQuestion.id,
                    blank1: prev?.blank1,
                    blank2: value,
                    answer: `${prev?.blank1 || ''}|${value}`,
                    timeSpent: prev?.timeSpent || 0,
                    flagged: prev?.flagged || false,
                  }));
                }}
                correctBlank1={correctAnswerData}
                correctBlank2={correctAnswerData}
                showResults={isGuidedMode && showCorrectAnswers}
              />
            );
          })()}

          {currentQuestion?.question_data?.di_type === 'TA' && (() => {
            const answersData = typeof currentQuestion.answers === 'string'
              ? JSON.parse(currentQuestion.answers)
              : currentQuestion.answers;
            const correctAnswerData = answersData?.correct_answer;
            const correctTAAnswers = Array.isArray(correctAnswerData) && correctAnswerData.length > 0
              ? correctAnswerData[0]
              : correctAnswerData || {};

            return (
              <TAQuestion
                tableTitle={currentQuestion.question_data.table_title}
                columnHeaders={currentQuestion.question_data.column_headers || []}
                tableData={currentQuestion.question_data.table_data || []}
                statements={currentQuestion.question_data.statements || []}
                selectedAnswers={answers[currentQuestion.id]?.taAnswers || {}}
                onAnswerChange={(statementIndex, value) => {
                  const currentTAAnswers = answers[currentQuestion.id]?.taAnswers || {};
                  const newTAAnswers = { ...currentTAAnswers, [statementIndex]: value };
                  updateAnswer(currentQuestion.id, (prev) => ({
                    ...prev,
                    questionId: currentQuestion.id,
                    taAnswers: newTAAnswers,
                    answer: Object.values(newTAAnswers).join(','),
                    timeSpent: prev?.timeSpent || 0,
                    flagged: prev?.flagged || false,
                  }));
                }}
                correctAnswers={correctTAAnswers}
                showResults={isGuidedMode && showCorrectAnswers}
              />
            );
          })()}

          {currentQuestion?.question_data?.di_type === 'TPA' && (() => {
            const answersData = typeof currentQuestion.answers === 'string'
              ? JSON.parse(currentQuestion.answers)
              : currentQuestion.answers;
            const correctAnswerData = answersData?.correct_answer;
            const correctTPAAnswers = Array.isArray(correctAnswerData) && correctAnswerData.length > 0
              ? correctAnswerData[0]
              : correctAnswerData || {};

            return (
              <TPAQuestion
                scenario={currentQuestion.question_data.scenario || ''}
                column1Title={currentQuestion.question_data.column1_title || ''}
                column2Title={currentQuestion.question_data.column2_title || ''}
                sharedOptions={currentQuestion.question_data.shared_options || []}
                selectedColumn1={answers[currentQuestion.id]?.column1}
                selectedColumn2={answers[currentQuestion.id]?.column2}
                onColumn1Change={(value) => {
                  updateAnswer(currentQuestion.id, (prev) => ({
                    ...prev,
                    questionId: currentQuestion.id,
                    column1: value,
                    column2: prev?.column2,
                    answer: `${value}|${prev?.column2 || ''}`,
                    timeSpent: prev?.timeSpent || 0,
                    flagged: prev?.flagged || false,
                  }));
                }}
                onColumn2Change={(value) => {
                  updateAnswer(currentQuestion.id, (prev) => ({
                    ...prev,
                    questionId: currentQuestion.id,
                    column1: prev?.column1,
                    column2: value,
                    answer: `${prev?.column1 || ''}|${value}`,
                    timeSpent: prev?.timeSpent || 0,
                    flagged: prev?.flagged || false,
                  }));
                }}
                correctColumn1={correctTPAAnswers}
                correctColumn2={correctTPAAnswers}
                showResults={isGuidedMode && showCorrectAnswers}
              />
            );
          })()}

          {/* Standard Multiple Choice Questions (Quantitative & Verbal Reasoning) */}
          {currentQuestion?.question_type === 'multiple_choice' && currentQuestion?.question_data?.options && (() => {
            // Parse answers field (might be string or object)
            const answersData = typeof currentQuestion.answers === 'string'
              ? JSON.parse(currentQuestion.answers)
              : currentQuestion.answers;
            const correctAnswerData = answersData?.correct_answer;
            const correctAnswer = Array.isArray(correctAnswerData)
              ? correctAnswerData[0]
              : correctAnswerData;

            return (
              <MultipleChoiceQuestion
                questionText={getLocalizedQuestionText(currentQuestion.question_data)}
                passageText={testLanguage === 'en' && currentQuestion.question_data.passage_text_eng
                  ? currentQuestion.question_data.passage_text_eng
                  : currentQuestion.question_data.passage_text}
                passageTitle={currentQuestion.question_data.passage_title}
                imageUrl={currentQuestion.question_data.image_url || undefined}
                options={getLocalizedOptions(currentQuestion.question_data)}
                selectedAnswer={answers[currentQuestion.id]?.answer}
                onAnswerChange={handleAnswerSelect}
                showResults={isGuidedMode && showCorrectAnswers}
                correctAnswer={correctAnswer}
              />
            );
          })()}


          {/* Open-Ended Questions */}
          {currentQuestion?.question_type === 'open_ended' && (
            currentQuestion.question_data?.passage_text ? (
              // Layout with passage text on the left
              <div className="flex gap-8 w-full">
                {/* Passage Text on the left */}
                <div className="flex-1 min-w-[45%] border-2 border-blue-200 rounded-xl p-6 bg-blue-50 h-fit sticky top-4">
                  {currentQuestion.question_data.passage_title && (
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      {currentQuestion.question_data.passage_title}
                    </h3>
                  )}
                  <div className="text-gray-700 whitespace-pre-wrap max-h-[650px] overflow-y-auto">
                    {testLanguage === 'en' && currentQuestion.question_data.passage_text_eng
                      ? currentQuestion.question_data.passage_text_eng
                      : currentQuestion.question_data.passage_text}
                  </div>
                </div>

                {/* Question and answer area on the right */}
                <div className="flex-1 min-w-[45%] space-y-4">
                  {(currentQuestion.question_data?.question_text || currentQuestion.question_data?.question_text_eng) && (
                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                      <div className="text-lg text-gray-800">
                        {getLocalizedQuestionText(currentQuestion.question_data)}
                      </div>
                    </div>
                  )}
                  <textarea
                    value={answers[currentQuestion.id]?.answer || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    placeholder={t('takeTest.enterYourAnswer', 'Enter your answer here...')}
                    className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:ring-2 focus:ring-brand-green focus:ring-opacity-20 outline-none resize-y text-gray-800"
                  />
                </div>
              </div>
            ) : (
              // Layout without passage text
              <div className="space-y-4">
                {(currentQuestion.question_data?.question_text || currentQuestion.question_data?.question_text_eng) && (
                  <div className="text-lg text-gray-800 mb-4">
                    {getLocalizedQuestionText(currentQuestion.question_data)}
                  </div>
                )}
                <textarea
                  value={answers[currentQuestion.id]?.answer || ''}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  placeholder={t('takeTest.enterYourAnswer', 'Enter your answer here...')}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:ring-2 focus:ring-brand-green focus:ring-opacity-20 outline-none resize-y text-gray-800"
                />
              </div>
            )
          )}
        </div>

        {/* Standard Multiple Choice Answer Options */}
          {!currentQuestion?.question_data?.di_type && (() => {
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
                      <div className="flex-1 text-gray-800">{choice.text}</div>
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
                      <div className="flex-1 text-gray-800">{answerText as string}</div>
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
              className={`text-xs transition-colors ${
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
      <div className="bg-white border-t-2 border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Previous button - disabled in review mode */}
          {!isInReviewMode && (
            <button
              onClick={goToPreviousQuestion}
              disabled={!canGoBack() || (timeRemaining !== null && timeRemaining <= 1)}
              className="px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:hover:bg-gray-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              {t('takeTest.previous')}
            </button>
          )}
          {/* Return to Review button (when in review mode) */}
          {isInReviewMode && (
            <button
              onClick={returnToReviewScreen}
              className="px-4 py-3 rounded-xl font-semibold transition-all bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-400"
            >
              <FontAwesomeIcon icon={faList} className="mr-2" />
              {t('takeTest.returnToReview') || 'Return to Review'}
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {t('takeTest.section')} {currentSectionIndex + 1} {t('takeTest.of')} {sections.length}
        </div>

        {/* Next button - show Return to Review in review mode */}
        {isInReviewMode ? (
          <button
            onClick={returnToReviewScreen}
            className="px-6 py-3 rounded-xl font-semibold transition-all bg-brand-green text-white hover:bg-green-600"
          >
            <FontAwesomeIcon icon={faList} className="mr-2" />
            {t('takeTest.returnToReview') || 'Return to Review'}
          </button>
        ) : (
          <button
            onClick={goToNextQuestion}
            disabled={submitting || (timeRemaining !== null && timeRemaining <= 1)}
          className="px-6 py-3 rounded-xl font-semibold transition-all bg-brand-green text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <FontAwesomeIcon icon={faClock} className="mr-2 animate-spin" />
              {t('takeTest.submitting') || 'Submitting...'}
            </>
          ) : (
            <>
              {/* In adaptive mode, check against section question limit, not current total */}
              {(config?.adaptivity_mode === 'adaptive'
                ? currentQuestionIndex < sectionQuestionLimit - 1
                : currentQuestionIndex < totalQuestionsInSection - 1) ? (
                <>
                  {t('takeTest.next')}
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </>
              ) : currentSectionIndex < sections.length - 1 ? (
                t('takeTest.completeSection')
              ) : (
                t('takeTest.submitTest')
              )}
            </>
          )}
        </button>
        )}
      </div>

      {/* Review Screen Overlay (GMAT-style) */}
      {showReviewScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-brand-dark">
                <FontAwesomeIcon icon={faList} className="mr-2" />
                {t('takeTest.reviewSection') || 'Review Section'}
              </h3>
              <div className="text-sm text-gray-600">
                {config?.max_answer_changes !== undefined && (
                  <span className={answerChangesUsed >= (config.max_answer_changes || 0) ? 'text-red-600 font-bold' : ''}>
                    {t('takeTest.changesUsed') || 'Changes used'}: {answerChangesUsed}/{config.max_answer_changes}
                  </span>
                )}
              </div>
            </div>

            {/* Question List */}
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="grid gap-2">
                {currentSectionQuestionsList.map((question, index) => {
                  const answer = answers[question.id];
                  const isAnswered = !!answer?.answer || !!answer?.msrAnswers || !!answer?.blank1 || !!answer?.taAnswers || !!answer?.column1;
                  const isBookmarked = bookmarkedQuestions.has(question.id);

                  return (
                    <button
                      key={question.id}
                      onClick={() => goToQuestionFromReview(index)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${
                        isBookmarked
                          ? 'border-yellow-400 bg-yellow-50'
                          : isAnswered
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          isAnswered ? 'bg-brand-green text-white' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">
                          {t('takeTest.question')} {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isBookmarked && (
                          <FontAwesomeIcon icon={faBookmark} className="text-yellow-500" />
                        )}
                        {isAnswered ? (
                          <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green" />
                        ) : (
                          <span className="text-xs text-red-500 font-semibold">
                            {t('takeTest.notAnswered') || 'Not answered'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                {currentSectionQuestionsList.filter(q => {
                  const answer = answers[q.id];
                  return !!answer?.answer || !!answer?.msrAnswers || !!answer?.blank1 || !!answer?.taAnswers || !!answer?.column1;
                }).length} / {currentSectionQuestionsList.length} {t('takeTest.answered') || 'answered'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={completeReview}
                  className="px-6 py-2 rounded-lg bg-brand-green text-white font-semibold hover:bg-green-600 transition-all"
                >
                  {currentSectionIndex < sections.length - 1
                    ? t('takeTest.completeSection')
                    : t('takeTest.submitTest')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
  );
}
