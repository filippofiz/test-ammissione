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
  faGripVertical,
  faLock,
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
import { createAdaptiveAlgorithm, SimpleAdaptiveAlgorithm, ComplexAdaptiveAlgorithm } from '../lib/algorithms/adaptiveAlgorithm';
import { translateTestTrack } from '../lib/translateTestTrack';

interface TestConfig {
  test_type: string;
  track_type: string;
  section_order_mode: 'mandatory' | 'user_choice';
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
  adaptivity_mode?: 'adaptive' | 'static';
  use_base_questions?: boolean;
  base_questions_scope?: 'per_section' | 'per_test';
  base_questions_count?: number;
  algorithm_type?: 'simple' | 'complex';
  baseline_difficulty?: number | string; // Difficulty level for baseline questions (e.g., 1, 2, 3 or "easy", "medium", "hard"). If not set, uses average difficulty.

  // Question limits
  questions_per_section?: Record<string, number>; // JSONB mapping section names to question counts
}

interface Question {
  id: string;
  test_type: string;
  section: string;
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

export default function TakeTestPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Detect test mode from URL parameter (?testMode=true)
  const searchParams = new URLSearchParams(window.location.search);
  const isTestMode = searchParams.get('testMode') === 'true';

  console.log('🔍 TakeTestPage mode:', isTestMode ? 'TEST MODE (using _test tables)' : 'PRODUCTION MODE');

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
  const [showStartScreen, setShowStartScreen] = useState(true);
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
  const [showAnswerRequiredMessage, setShowAnswerRequiredMessage] = useState(false);
  const [isPartialAnswer, setIsPartialAnswer] = useState(false);
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const [sectionTransitionCountdown, setSectionTransitionCountdown] = useState(5);

  // Adaptive testing state
  const [questionPool, setQuestionPool] = useState<Question[]>([]); // Available questions
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]); // Questions to show
  const [currentTheta, setCurrentTheta] = useState<number>(0); // IRT ability estimate
  const [algorithmConfig, setAlgorithmConfig] = useState<any>(null); // Algorithm configuration
  const [adaptiveAlgorithm, setAdaptiveAlgorithm] = useState<SimpleAdaptiveAlgorithm | ComplexAdaptiveAlgorithm | null>(null); // Algorithm instance
  const [baseQuestionsCompletedPerSection, setBaseQuestionsCompletedPerSection] = useState<Record<string, boolean>>({}); // Track base questions per section

  // Saving and timing state
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<number>(1);
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, Date>>({});
  const [sectionTimes, setSectionTimes] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current section and questions
  const currentSection = sections[currentSectionIndex];
  // Use selectedQuestions if adaptive, otherwise use allQuestions
  const questionsToUse = config?.adaptivity_mode === 'adaptive' && selectedQuestions.length > 0
    ? selectedQuestions
    : allQuestions;
  const sectionQuestions = questionsToUse.filter(q => q.section === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];
  const totalQuestionsInSection = sectionQuestions.length;

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
      saveAnswer(currentQuestion.id, currentAnswer, flaggedStatus);
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
    if (currentQuestion) {
      console.log(`📝 Question ${currentQuestionIndex + 1}/${sectionQuestionLimit} - Section: ${currentSection}`);
    }
  }, [currentQuestion, currentQuestionIndex, currentSection, sectionQuestionLimit]);

  // Save answers and clean up session before page unload (browser close, refresh, etc.)
  // This ensures "in_progress" status doesn't persist when student leaves
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Save current answer if any
      if (currentQuestion?.id && answers[currentQuestion.id]) {
        console.log('💾 Saving answer before page unload...');
        // Try to save synchronously
        await saveAnswer(
          currentQuestion.id,
          answers[currentQuestion.id],
          answers[currentQuestion.id].flagged || false
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

      console.log('🤖 Bot command received:', action, { answer, questionId });

      // Show visual feedback
      setBotAction(`🤖 ${action}`);
      setTimeout(() => setBotAction(null), 2000);

      switch (action) {
        case 'START_TEST':
          // Click the "Start Test" button
          console.log('🤖 Bot starting test...');
          if (showStartScreen) {
            startTest();
          }
          break;

        case 'SELECT_ANSWER':
          // Select the answer in the current question
          console.log('🤖 Bot selecting answer:', answer);
          if (currentQuestion && answer !== undefined) {
            setAnswers(prev => ({
              ...prev,
              [currentQuestion.id]: answer
            }));
          }
          break;

        case 'NEXT_QUESTION':
          // Click the Next button
          console.log('🤖 Bot clicking Next...');
          goToNextQuestion();
          break;

        case 'SUBMIT_TEST':
          // Submit the test
          console.log('🤖 Bot submitting test...');
          submitTest();
          break;
      }
    };

    // Add event listener
    window.addEventListener('message', handleBotMessage);

    // Send READY message to parent window when page is fully loaded
    if (window.opener && config && currentQuestion) {
      console.log('📡 Sending READY message to bot control window...');
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

      // Skip fullscreen enforcement on localhost for testing
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        console.log('🛠️ Fullscreen enforcement disabled on localhost');
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
  }, [showStartScreen, showSectionSelectionScreen, showPauseScreen, showPauseChoiceScreen, showCompletionScreen, showExitWarning, testAnnulled]);

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
    }
  }, [showPauseChoiceScreen]);

  // Pause choice countdown (auto-continue after 5 seconds)
  useEffect(() => {
    if (showPauseChoiceScreen && pauseChoiceCountdown > 0) {
      const timer = setTimeout(() => {
        setPauseChoiceCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showPauseChoiceScreen && pauseChoiceCountdown === 0) {
      // Time's up - continue without pause
      handleSkipPause(true); // true = auto-skip
    }
  }, [showPauseChoiceScreen, pauseChoiceCountdown]);

  // Section transition countdown (auto-advance after 5 seconds)
  useEffect(() => {
    if (showSectionTransition && sectionTransitionCountdown > 0) {
      const timer = setTimeout(() => {
        setSectionTransitionCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSectionTransition && sectionTransitionCountdown === 0) {
      // Time's up - proceed to next section or pause
      handleSectionTransitionComplete();
    }
  }, [showSectionTransition, sectionTransitionCountdown]);

  // Reset section transition countdown when screen shows
  useEffect(() => {
    if (showSectionTransition) {
      setSectionTransitionCountdown(5);
    }
  }, [showSectionTransition]);

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
    // If not adaptive mode, return all questions
    if (config.adaptivity_mode !== 'adaptive') {
      return allQuestions;
    }

    let processedQuestions = [...allQuestions];

    // Handle question randomization
    if (config.question_order === 'random') {
      if (config.base_questions_scope === 'per_section') {
        // Randomize within each section
        const sections = Array.from(new Set(processedQuestions.map(q => q.section)));
        const randomizedQuestions: Question[] = [];

        sections.forEach(section => {
          const sectionQuestions = processedQuestions.filter(q => q.section === section);
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
          q => q.section === targetSection && matchesDifficulty(q, targetDifficulty)
        );

        // FALLBACK: If not enough questions with target difficulty, try other difficulties
        if (candidates.length < count) {
          console.warn(`⚠️ Not enough baseline questions with difficulty ${targetDifficulty} in section ${targetSection}. Found ${candidates.length}, need ${count}. Using fallback.`);

          // Get all questions from this section
          const allSectionQuestions = questions.filter(q => q.section === targetSection);
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
        .select(`*, 2V_tests${tableSuffix}(test_type, exercise_type)`)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      console.log('📊 Assignment loaded from database:', {
        id: assignment.id,
        status: assignment.status,
        current_attempt: assignment.current_attempt,
        total_attempts: assignment.total_attempts,
        completion_details: assignment.completion_details,
        start_time: assignment.start_time
      });

      // Check if test is locked (completed tests are auto-locked)
      if (assignment.status === 'locked') {
        console.log('🔒 Test is locked - student cannot take test');
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

        console.log('🔍 Checking stale session:', {
          status: assignment.status,
          hasStartTime: !!assignment.start_time,
          navigationType: navigation?.type,
          isPageReload,
          hasSessionMarker: !!hasSessionMarker,
          isPageRefresh,
          sessionKey: `test_session_${assignmentId}`,
          currentAttempt: assignment.current_attempt,
          totalAttempts: assignment.total_attempts
        });

        if (isPageRefresh) {
          console.log('🔄 STALE SESSION DETECTED - in_progress status from previous session');

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

          console.log(`📝 Marking test as ${newStatus} | Reason: ${reason} | Attempt: ${currentAttemptNum}`);

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
            console.log(`🔄 Updating existing stale session attempt ${currentAttemptNum}`);
            attempts[existingAttemptIndex] = {
              ...attempts[existingAttemptIndex],
              ...newAttempt
            };
          } else {
            console.log(`➕ Adding new stale session attempt ${currentAttemptNum} to history`);
            attempts.push(newAttempt);
          }

          // Note: Answers remain in database with their attempt_number for review

          const updateData = {
            status: newStatus,
            total_attempts: currentAttemptNum,
            completion_details: { attempts }
          };

          console.log('💾 Updating database with:', updateData);

          const { data: updateResult, error: statusError } = await db
            .from(`2V_test_assignments${tableSuffix}`)
            .update(updateData)
            .eq('id', assignmentId)
            .select();

          if (statusError) {
            console.error('❌ Error updating stale session:', statusError);
          } else {
            console.log(`✅ Database update successful!`, updateResult);
            console.log(`✅ Test marked as ${newStatus} | Attempt ${currentAttemptNum} recorded | Total attempts in history: ${attempts.length}`);
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

      console.log(`📝 Loading test | Assignment: ${assignmentId} | Attempt: ${currentAttemptNum} | Status: ${assignment.status}`);

      const testType = assignment['2V_tests'].test_type;
      const trackType = assignment['2V_tests'].exercise_type;

      // Load test configuration (always from real tables - it's reference data)
      const { data: configData, error: configError } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType)
        .eq('track_type', trackType)
        .maybeSingle();

      if (configError) throw configError;

      if (!configData) {
        alert('Test configuration not found. Please contact your instructor.');
        navigate(-1);
        return;
      }

      setConfig(configData);

      // Load algorithm configuration if adaptive mode is enabled
      let algorithmConfigData = null;
      if (configData.adaptivity_mode === 'adaptive') {
        const { data: algConfig, error: algError } = await supabase
          .from('2V_algorithm_config')
          .select('*')
          .eq('test_type', testType)
          .eq('track_type', trackType)
          .eq('algorithm_category', 'adaptive')
          .maybeSingle();

        if (algError) {
          console.error('Error loading algorithm config:', algError);
        } else if (algConfig) {
          algorithmConfigData = algConfig;
          setAlgorithmConfig(algConfig);
        } else {
          console.warn('Adaptive mode enabled but no algorithm config found');
        }
      }

      // Load test questions (always from real tables - questions are read-only reference data)
      // Questions are linked by test_type, not by test_id
      const { data: questions, error: questionsError } = await supabase
        .from('2V_questions')
        .select('*')
        .eq('test_type', testType)
        .order('section')
        .order('question_number');

      if (questionsError) throw questionsError;

      setAllQuestions(questions || []);
      setQuestionPool(questions || []); // Store full pool

      // Set up sections based on config
      if (configData.section_order_mode === 'mandatory' && configData.section_order) {
        setSections(configData.section_order);
      } else {
        // Get unique sections from questions
        const uniqueSections = Array.from(new Set(questions?.map(q => q.section) || []));
        setSections(uniqueSections);
      }

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
          track_type: trackType,
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

      // Initialize timer if needed
      if (configData.total_time_minutes) {
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

        if (answersError) {
          console.error('Error loading existing answers:', answersError);
        } else if (existingAnswers) {
          console.log(`📥 Loading answers for attempt ${currentAttemptNumber}`);

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
          console.log(`✅ Loaded ${Object.keys(loadedAnswers).length} existing answers`);
        }
      }

    } catch (err) {
      console.error('Error loading test data:', err);
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
      console.error('❌ Error fetching assignment:', assignmentError);
      return;
    }

    // If restarting from annulled/incomplete, increment attempt
    if (assignment.status === 'annulled' || assignment.status === 'incomplete') {
      const newAttempt = (assignment.current_attempt || 1) + 1;
      const newTotalAttempts = assignment.total_attempts || (assignment.current_attempt || 1);

      console.log(`🔄 RESTARTING ${assignment.status} test`);
      console.log(`📝 Incrementing attempt: ${assignment.current_attempt} → ${newAttempt}`);

      const { error: updateError } = await supabase
        .from('2V_test_assignments')
        .update({
          current_attempt: newAttempt,
          total_attempts: newTotalAttempts,
          status: 'in_progress',
          start_time: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (updateError) {
        console.error('❌ Error incrementing attempt:', updateError);
        return;
      }

      console.log(`✅ Attempt incremented: ${assignment.current_attempt} → ${newAttempt}`);
      setCurrentAttempt(newAttempt);
    } else if (assignment.status === 'unlocked') {
      // First time starting this test
      const { error: updateError } = await supabase
        .from('2V_test_assignments')
        .update({
          status: 'in_progress',
          start_time: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (updateError) {
        console.error('❌ Error updating status:', updateError);
        return;
      }

      console.log('✅ Test started - status updated to in_progress');
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
        q => q.section === firstSection && matchesDifficulty(q, baselineDifficulty)
      );

      const baseCount = config.base_questions_count || 0;

      // FALLBACK: If not enough questions with target difficulty
      if (baseQuestionsCandidates.length < baseCount) {
        console.warn(`⚠️ Not enough baseline questions with difficulty ${baselineDifficulty} in section ${firstSection}. Found ${baseQuestionsCandidates.length}, need ${baseCount}. Using fallback.`);

        // Get all questions from this section
        const allSectionQuestions = questionPool.filter(q => q.section === firstSection);

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

  function startSectionTimer() {
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Get time for current section from config
    let sectionTime: number | null = null;

    if (config?.time_per_section && currentSection) {
      // Specific time per section
      sectionTime = config.time_per_section[currentSection] || null;
    } else if (config?.total_time_minutes && sections.length > 0) {
      // Proportional time: divide total time by number of sections
      sectionTime = Math.round(config.total_time_minutes / sections.length);
    }

    if (sectionTime) {
      setTimeRemaining(sectionTime * 60); // Convert to seconds
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
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
    alert(t('takeTest.timeUp'));
    submitTest();
  }

  function handleAnswerSelect(answer: string) {
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        answer,
        timeSpent: prev[currentQuestion.id]?.timeSpent || 0,
        flagged: prev[currentQuestion.id]?.flagged || false,
      }
    }));

    // Record response with adaptive algorithm if enabled
    if (adaptiveAlgorithm && config?.adaptivity_mode === 'adaptive') {
      const isCorrect = answer === currentQuestion.correct_answer;
      adaptiveAlgorithm.recordResponse(currentQuestion, isCorrect);
      console.log('Recorded adaptive response:', {
        questionId: currentQuestion.id,
        isCorrect,
        currentState: adaptiveAlgorithm.getState()
      });
    }
  }

  function toggleFlag() {
    if (!currentQuestion) return;

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
    if (!config) return false;

    // Can't go back if at first question of first section
    if (currentSectionIndex === 0 && currentQuestionIndex === 0) return false;

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
    if (!canGoBack()) return;

    // Save current answer before navigating back
    if (currentQuestion?.id && answers[currentQuestion.id]) {
      console.log('💾 Saving answer before going back...');
      await saveAnswer(
        currentQuestion.id,
        answers[currentQuestion.id],
        answers[currentQuestion.id].flagged || false
      );
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      // Move to previous section's last question
      setCurrentSectionIndex(currentSectionIndex - 1);
      const prevSectionQuestions = allQuestions.filter(
        q => q.section === sections[currentSectionIndex - 1]
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
    retryCount: number = 0
  ): Promise<boolean> {
    if (!assignmentId || !studentId) {
      console.error('❌ Cannot save answer: missing assignmentId or studentId');
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
      } else if (answerData.answer) {
        // Simple question: single answer
        jsonbAnswer = { answer: answerData.answer };
      } else {
        console.error('❌ Unknown answer format:', answerData);
        return false;
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
        }, {
          onConflict: 'assignment_id,question_id,attempt_number'
        });

      if (error) {
        throw error;
      }

      console.log(`✅ Answer saved (${isTestMode ? 'TEST DB' : 'PROD DB'}) | Assignment: ${assignmentId} | Question: ${questionId} | Time: ${timeSpentSeconds}s`);

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

      if (statusError && statusError.code !== 'PGRST116') {
        console.error('⚠️ Error updating assignment status:', statusError);
      }

      setIsSaving(false);
      return true;

    } catch (error: any) {
      console.error(`❌ Error saving answer (attempt ${retryCount + 1}/3):`, error);

      // Retry logic with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
        console.log(`🔄 Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return saveAnswer(questionId, answerData, isFlagged, retryCount + 1);
      } else {
        // Final failure after 3 attempts
        setSaveError('Failed to save answer. Your progress may not be saved.');
        setIsSaving(false);
        return false;
      }
    }
  }

  async function goToNextQuestion() {
    // Save current answer immediately before navigating
    if (currentQuestion?.id && answers[currentQuestion.id]) {
      console.log(`💾 Saving answer before navigation | Assignment: ${assignmentId} | Question: ${currentQuestion.id}`);
      await saveAnswer(
        currentQuestion.id,
        answers[currentQuestion.id],
        answers[currentQuestion.id].flagged || false
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
        const currentSectionQuestions = selectedQuestions.filter(q => q.section === currentSection);
        const baselineQuestionsInSection = currentSectionQuestions.filter(q => q.is_base);

        // Baseline questions are completed if we're ABOUT TO ANSWER or have already answered all baseline questions
        // When clicking "Next" from the last baseline question (e.g., index 3 when there are 4 baseline questions),
        // we need to transition to adaptive mode, so we check if the NEXT question index would be >= baseline count
        baseQuestionsCompletedForSection = (currentQuestionIndex + 1) >= baselineQuestionsInSection.length;

        console.log(`🔍 Baseline check: currentQuestionIndex=${currentQuestionIndex}, nextIndex=${currentQuestionIndex + 1}, baselineCount=${baselineQuestionsInSection.length}, completed=${baseQuestionsCompletedForSection}`);

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
        const sectionSelectedQuestions = selectedQuestions.filter(q => q.section === currentSection);

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
          q => !answeredQuestionIds.has(q.id) && q.section === currentSection
        );

        console.log(`📊 Available questions: ${availableQuestions.length}, Already shown: ${sectionSelectedQuestions.length}, Target: ${questionLimitForSection}`);

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
    // Check for mandatory pause
    if (config?.pause_mode === 'between_sections' &&
        config.pause_sections?.includes(currentSection)) {
      const pauseDuration = (config.pause_duration_minutes || 5) * 60;
      setPauseTimeRemaining(pauseDuration);
      setShowPauseScreen(true);
      setTimeout(() => {
        setShowPauseScreen(false);
        setPauseTimeRemaining(null);
        moveToNextSection();
      }, pauseDuration * 1000);
      return;
    }

    // Check for user choice pause (only if not the last section and pauses remaining)
    if (config?.pause_mode === 'user_choice' &&
        currentSectionIndex < sections.length - 1 &&
        pausesUsed < (config?.max_pauses || 0)) {
      // IMPORTANT: Reset countdown BEFORE showing the screen to avoid race condition
      setPauseChoiceCountdown(5);
      setShowPauseChoiceScreen(true);
      return;
    }

    // No pause - show transition message (if not the last section)
    if (currentSectionIndex < sections.length - 1) {
      setShowSectionTransition(true);
      return;
    }

    // Last section - move to completion
    moveToNextSection();
  }

  function handleSectionTransitionComplete() {
    setShowSectionTransition(false);
    moveToNextSection();
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
        console.error('Error fetching completion_details for pause save:', fetchError);
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

      if (updateError) {
        console.error('Error saving pause event to database:', updateError);
      } else {
        console.log(`✅ Pause event saved to database: ${action} in ${currentSection}`);
      }
    } catch (err) {
      console.error('Error in savePauseEventToDatabase:', err);
    }
  }

  function handleTakePause() {
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

    setShowPauseChoiceScreen(false);
    const pauseDuration = (config?.pause_duration_minutes || 5) * 60;
    setPauseTimeRemaining(pauseDuration);
    setShowPauseScreen(true);
    setTimeout(() => {
      setShowPauseScreen(false);
      setPauseTimeRemaining(null);
      moveToNextSection();
    }, pauseDuration * 1000);
  }

  function handleSkipPause(isAutoSkip = false) {
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
    setShowPauseChoiceScreen(false);
    moveToNextSection();
  }

  function moveToNextSection() {
    if (currentSectionIndex < sections.length - 1) {
      const nextSectionIndex = currentSectionIndex + 1;
      const nextSection = sections[nextSectionIndex];

      setCurrentSectionIndex(nextSectionIndex);
      setCurrentQuestionIndex(0);
      setSectionStartTime(new Date());


      // For adaptive mode with per_section base questions, add base questions for new section
      if (config?.adaptivity_mode === 'adaptive' &&
          config?.use_base_questions &&
          config?.base_questions_scope === 'per_section') {

        // Determine baseline difficulty
        let baselineDifficulty = config.baseline_difficulty || 2;

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
          q => q.section === nextSection && matchesDifficulty(q, baselineDifficulty)
        );

        const baseCount = config.base_questions_count || 0;

        // FALLBACK: If not enough questions with target difficulty
        if (nextSectionBaseQuestionsCandidates.length < baseCount) {
          console.warn(`⚠️ Not enough baseline questions with difficulty ${baselineDifficulty} in section ${nextSection}. Found ${nextSectionBaseQuestionsCandidates.length}, need ${baseCount}. Using fallback.`);

          // Get all questions from this section
          const allSectionQuestions = questionPool.filter(q => q.section === nextSection);

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

      // Restart timer for new section
      startSectionTimer();
    } else {
      // Test complete
      submitTest();
    }
  }

  async function submitTest() {
    // Prevent double submission
    if (submitting) {
      console.log('⚠️ Test is already being submitted, ignoring duplicate call');
      return;
    }

    setSubmitting(true);
    console.log('🏁 Submitting test - all answers already saved in database');

    if (timerRef.current) clearInterval(timerRef.current);

    // ❌ REMOVED: test_questions tracking (no longer needed, using answers.created_at instead)

    // Save final answer if any
    if (currentQuestion?.id && answers[currentQuestion.id]) {
      console.log('💾 Saving final answer...');
      await saveAnswer(
        currentQuestion.id,
        answers[currentQuestion.id],
        answers[currentQuestion.id].flagged || false
      );
    }

    // Mark test as completed in database with completion_details
    try {
      // Save completion details
      const success = await saveCompletionDetails('completed', 'submitted');

      if (!success) {
        throw new Error('Failed to save completion details');
      }

      console.log('✅ Test submission completed successfully');

      // Show completion screen
      setShowCompletionScreen(true);
      setSubmitting(false);
    } catch (err) {
      console.error('❌ Error submitting test:', err);
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
    // Disable multiple screen detection on localhost for development
    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';

    if (isLocalhost) {
      console.log('🛠️ Multiple screen detection disabled on localhost');
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
      console.error('Error checking screens:', err);
      return false;
    }
  }

  // Enter fullscreen mode
  function enterFullscreen() {
    // Skip fullscreen on localhost for testing
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      console.log('🛠️ Fullscreen request skipped on localhost');
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
      console.log('💾 saveCompletionDetails called:', { status, reason, annulmentReason, currentAttempt });

      // Get existing attempts history from database
      const { data: currentAssignment, error: fetchError } = await supabase
        .from('2V_test_assignments')
        .select('completion_details, start_time, current_attempt, total_attempts')
        .eq('id', assignmentId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching current assignment:', fetchError);
      }

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
      newAttempt.sections_completed = Array.from(new Set(selectedQuestions.map(q => q.section)));

      console.log('📝 New attempt record created:', newAttempt);

      // Check if attempt already exists (update instead of duplicating)
      const existingAttemptIndex = attempts.findIndex(
        (a: any) => a.attempt_number === currentAttempt
      );

      if (existingAttemptIndex >= 0) {
        console.log(`🔄 Updating existing attempt ${currentAttempt} at index ${existingAttemptIndex}`);
        attempts[existingAttemptIndex] = {
          ...attempts[existingAttemptIndex],
          ...newAttempt
        };
      } else {
        console.log(`➕ Adding new attempt ${currentAttempt} to history`);
        attempts.push(newAttempt);
      }

      const newTotalAttempts = status === 'incomplete' ? currentAttempt - 1 : currentAttempt;

      // IMPORTANT: completed tests are AUTO-LOCKED (tutor must unlock to allow retake)
      const finalStatus = status === 'completed' ? 'locked' : status;

      const updateData = {
        status: finalStatus,
        completed_at: new Date().toISOString(),
        completion_details: { attempts },
        total_attempts: newTotalAttempts,
        // IMPORTANT: Hide results when test is completed/annulled
        // Tutor must explicitly enable visibility after reviewing with student
        results_viewable_by_student: false
      };

      console.log('💾 Updating database with completion details:', updateData);

      const { data: updateResult, error } = await supabase
        .from('2V_test_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select();

      if (error) {
        console.error('❌ Error saving completion details:', error);
        throw error;
      }

      console.log('✅ Database update successful!', updateResult);
      console.log(`✅ Test ${status} | Attempt ${currentAttempt} | Reason: ${reason} | Stats calculated from answers table`);
      return true;
    } catch (err) {
      console.error('❌ Error in saveCompletionDetails:', err);
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
    setShowExitWarning(false);
    setExitCountdown(5);
    enterFullscreen();
  }

  function handleConfirmExit() {
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
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
              >
                {t('takeTest.exitTest')}
              </button>
              <button
                onClick={handleStayInTest}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
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
                      {allQuestions.filter(q => q.section === section).length} {t('takeTest.questions')}
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
            {currentSection}
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
            <p className="text-xl font-bold text-brand-dark">{nextSection}</p>
          </div>

          <button
            onClick={handleSectionTransitionComplete}
            className="w-full px-8 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
          >
            {t('takeTest.continueNow')}
          </button>
        </div>
      </div>
    );
  }

  // Pause Choice Screen (for user_choice mode)
  if (showPauseChoiceScreen) {
    const pausesRemaining = (config?.max_pauses || 0) - pausesUsed;
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-lg">
            <div className="text-6xl mb-6">☕</div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">
              {t('takeTest.sectionComplete')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('takeTest.completedSection')} <span className="font-semibold">{currentSection}</span>
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
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                {t('takeTest.continueWithoutPause')}
              </button>
              <button
                onClick={handleTakePause}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
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
              {t('takeTest.completedSection')} <span className="font-semibold">{currentSection}</span>
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

  // Main Test Interface
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">{currentSection}</h2>
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
          </div>
          {/* Debug info for testing */}
          <div className="flex gap-4 mt-1 text-xs">
            <span className={`font-semibold ${currentQuestion?.is_base ? 'text-blue-600' : 'text-purple-600'}`}>
              {currentQuestion?.is_base ? '🔵 BASELINE' : '🟣 ADAPTIVE'}
            </span>
            <span className="text-gray-700">
              Difficulty: <span className="font-semibold">{currentQuestion?.difficulty || 'N/A'}</span>
            </span>
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
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          {/* Question Text */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                {t('takeTest.question')} {currentQuestion?.question_number}
              </h3>
              <button
                onClick={toggleFlag}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                  answers[currentQuestion?.id]?.flagged
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FontAwesomeIcon icon={faFlag} className="mr-2" />
                {answers[currentQuestion?.id]?.flagged ? t('takeTest.flagged') : t('takeTest.flag')}
              </button>
            </div>

            {/* Render based on question type */}
            {currentQuestion?.question_data?.question ? (
              // Multiple choice question with JSON structure
              <div className="text-gray-800 text-lg whitespace-pre-wrap">
                {currentQuestion?.question_data?.question}
              </div>
            ) : !currentQuestion?.question_data?.di_type ? (
              // Legacy format fallback
              <div className="text-gray-800 text-lg whitespace-pre-wrap">
                {currentQuestion?.question_text}
              </div>
            ) : null}

            {/* GMAT Data Insights Question Types */}
            {currentQuestion?.question_data?.di_type === 'DS' && (
            <DSQuestion
              problem={currentQuestion.question_data.problem || ''}
              statement1={currentQuestion.question_data.statement1 || ''}
              statement2={currentQuestion.question_data.statement2 || ''}
              selectedAnswer={answers[currentQuestion.id]?.answer}
              onAnswerChange={handleAnswerSelect}
            />
          )}

          {currentQuestion?.question_data?.di_type === 'MSR' && (
            <MSRQuestion
              sources={currentQuestion.question_data.sources || []}
              questions={currentQuestion.question_data.questions || []}
              selectedAnswers={answers[currentQuestion.id]?.msrAnswers || []}
              onAnswerChange={(qIndex, answer) => {
                const currentMSRAnswers = answers[currentQuestion.id]?.msrAnswers || [];
                const newMSRAnswers = [...currentMSRAnswers];
                newMSRAnswers[qIndex] = answer;
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: {
                    ...prev[currentQuestion.id],
                    msrAnswers: newMSRAnswers,
                    answer: newMSRAnswers.join(','), // Store as comma-separated
                  }
                }));
              }}
            />
          )}

          {currentQuestion?.question_data?.di_type === 'GI' && (
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
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: {
                    ...prev[currentQuestion.id],
                    blank1: value,
                    answer: `${value}|${prev[currentQuestion.id]?.blank2 || ''}`,
                  }
                }));
              }}
              onBlank2Change={(value) => {
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: {
                    ...prev[currentQuestion.id],
                    blank2: value,
                    answer: `${prev[currentQuestion.id]?.blank1 || ''}|${value}`,
                  }
                }));
              }}
            />
          )}

          {currentQuestion?.question_data?.di_type === 'TA' && (
            <TAQuestion
              tableTitle={currentQuestion.question_data.table_title}
              columnHeaders={currentQuestion.question_data.column_headers || []}
              tableData={currentQuestion.question_data.table_data || []}
              statements={currentQuestion.question_data.statements || []}
              selectedAnswers={answers[currentQuestion.id]?.taAnswers || {}}
              onAnswerChange={(statementIndex, value) => {
                const currentTAAnswers = answers[currentQuestion.id]?.taAnswers || {};
                const newTAAnswers = { ...currentTAAnswers, [statementIndex]: value };
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: {
                    ...prev[currentQuestion.id],
                    taAnswers: newTAAnswers,
                    answer: Object.values(newTAAnswers).join(','),
                  }
                }));
              }}
            />
          )}

          {currentQuestion?.question_data?.di_type === 'TPA' && (
            <TPAQuestion
              scenario={currentQuestion.question_data.scenario || ''}
              column1Title={currentQuestion.question_data.column1_title || ''}
              column2Title={currentQuestion.question_data.column2_title || ''}
              sharedOptions={currentQuestion.question_data.shared_options || []}
              selectedColumn1={answers[currentQuestion.id]?.column1}
              selectedColumn2={answers[currentQuestion.id]?.column2}
              onColumn1Change={(value) => {
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: {
                    ...prev[currentQuestion.id],
                    column1: value,
                    answer: `${value}|${prev[currentQuestion.id]?.column2 || ''}`,
                  }
                }));
              }}
              onColumn2Change={(value) => {
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: {
                    ...prev[currentQuestion.id],
                    column2: value,
                    answer: `${prev[currentQuestion.id]?.column1 || ''}|${value}`,
                  }
                }));
              }}
            />
          )}

          {/* Standard Multiple Choice Questions (Quantitative & Verbal Reasoning) */}
          {currentQuestion?.question_type === 'multiple_choice' && currentQuestion?.question_data?.options && (
            <MultipleChoiceQuestion
              questionText={currentQuestion.question_data.question_text || ''}
              imageUrl={currentQuestion.question_data.image_url || undefined}
              options={currentQuestion.question_data.options}
              selectedAnswer={answers[currentQuestion.id]?.answer}
              onAnswerChange={handleAnswerSelect}
            />
          )}
        </div>

        {/* Standard Multiple Choice Answer Options */}
          {!currentQuestion?.question_data?.di_type && (
            <div className="space-y-3">
            {currentQuestion?.question_data?.choices ? (
              // Multiple choice with JSON choices
              currentQuestion.question_data.choices.map(choice => {
                const isSelected = answers[currentQuestion?.id]?.answer === choice.label;
                return (
                  <button
                    key={choice.label}
                    onClick={() => handleAnswerSelect(choice.label)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-brand-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isSelected
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {choice.label}
                      </div>
                      <div className="flex-1 text-gray-800">{choice.text}</div>
                      {isSelected && (
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

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-brand-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isSelected
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {option}
                      </div>
                      <div className="flex-1 text-gray-800">{answerText as string}</div>
                      {isSelected && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green text-xl" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white border-t-2 border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={goToPreviousQuestion}
          disabled={!canGoBack()}
          className="px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:hover:bg-gray-200"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          {t('takeTest.previous')}
        </button>

        <div className="text-sm text-gray-600">
          {t('takeTest.section')} {currentSectionIndex + 1} {t('takeTest.of')} {sections.length}
        </div>

        <button
          onClick={goToNextQuestion}
          disabled={submitting}
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
      </div>

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
