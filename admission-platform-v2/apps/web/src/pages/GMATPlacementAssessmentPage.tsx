/**
 * GMAT Placement Assessment Page
 * Multi-section sequential test for new students to determine preparation cycle.
 * - 45 questions total (15 QR + 15 DI + 15 VR)
 * - Per-section timer (30 min each, 90 min total)
 * - Fixed section order (QR → DI → VR)
 * - Forward-only navigation with bookmark + review per section
 * - Section transitions between sections
 * - Raw scoring → cycle suggestion (Foundation / Development / Excellence)
 * - Student: sees "submitted, pending review" only
 * - Preview mode: full results display locally (not saved)
 * - Crash recovery via useTestProgress
 * - Layout matches GMATSimulationPage / GMATTrainingTestPage pattern
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowLeft,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faExclamationTriangle,
  faHistory,
  faRedo,
  faBookmark,
  faCalculator,
  faChartLine,
  faList,
  faClock,
  faTag,
  faStopwatch,
  faTrophy,
  faEye,
  faClipboardCheck,
  faHourglass,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import { checkAnswerCorrectness } from '../lib/gmat/answerChecking';
import { getCurrentProfile } from '../lib/auth';
import { MathJaxProvider } from '../components/MathJaxRenderer';
import { Layout } from '../components/Layout';
import { GMATCalculator } from '../components/GMATCalculator';
import { useTestTimer, formatTime } from '../components/hooks/useTestTimer';
import { TestTimerCompact } from '../components/test/TestTimer';
import { QuestionRenderer, type UnifiedAnswer } from '../components/test/QuestionRenderer';
import { TimeUpModal } from '../components/test/SectionTransition';
import {
  useTestProgress,
  createProgressSnapshot,
  type StoredAnswer,
} from '../components/hooks/useTestProgress';
import {
  getStudentGMATProgress,
  getPlacementAssessmentQuestions,
  savePlacementAssessmentResult,
  hasPendingPlacementValidation,
  calculateSuggestedCycle,
  PLACEMENT_CONFIG,
  type GmatSection,
  type GmatAssessmentResult,
} from '../lib/api/gmat';

// ============================================
// Types
// ============================================
interface Question {
  id: string;
  question_number: number;
  question_type: string;
  section: string;
  difficulty: string | null;
  question_data: any;
  answers: any;
}

type Answer = StoredAnswer;

const SECTION_ORDER: GmatSection[] = ['QR', 'DI', 'VR'];

const SECTION_LABELS: Record<GmatSection, string> = {
  QR: 'Quantitative Reasoning',
  DI: 'Data Insights',
  VR: 'Verbal Reasoning',
};

const TIME_PER_SECTION_MINUTES = PLACEMENT_CONFIG.timeMinutes / PLACEMENT_CONFIG.sections.length; // 30 min

// ============================================
// Main Component
// ============================================
export default function GMATPlacementAssessmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if this is preview mode (tutor/admin preview)
  const isPreviewMode = searchParams.get('preview') === 'true';

  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Question state — all questions flat + split by section
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [sectionQuestions, setSectionQuestions] = useState<Record<GmatSection, Question[]>>({
    QR: [], DI: [], VR: [],
  });

  // Navigation state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inReviewPhase, setInReviewPhase] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'bookmarked'>('all');
  const [sectionCompleted, setSectionCompleted] = useState<boolean[]>([false, false, false]);
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);

  // Answer & bookmark state (shared across all sections)
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Timer state — resets per section
  const [initialTimeSeconds, setInitialTimeSeconds] = useState<number | null>(null);

  // Calculator (DI section only)
  const [showCalculator, setShowCalculator] = useState(false);

  // Results
  const [result, setResult] = useState<GmatAssessmentResult | null>(null);

  // Results view state (preview mode only)
  const [showResultsTimeReport, setShowResultsTimeReport] = useState(false);
  const [showResultsPacingCharts, setShowResultsPacingCharts] = useState(false);
  const [showResultsQuestions, setShowResultsQuestions] = useState(false);
  const [resultsFilterCorrectness, setResultsFilterCorrectness] = useState<'all' | 'correct' | 'wrong'>('all');
  const [resultsFilterBookmarked, setResultsFilterBookmarked] = useState(false);
  const [resultsSectionFilter, setResultsSectionFilter] = useState<GmatSection | 'all'>('all');

  // Resume modal
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Derived state
  const currentSection = SECTION_ORDER[currentSectionIndex];
  const currentSectionQs = sectionQuestions[currentSection] || [];
  const currentQuestion = currentSectionQs[currentQuestionIndex] || null;
  const isDISection = currentSection === 'DI';

  // Timer hook
  const { timeRemaining, setTimeRemaining } = useTestTimer({
    initialSeconds: initialTimeSeconds,
    isActive: testStarted && !showSectionTransition && !testCompleted,
    onTimeUp: handleTimeUp,
  });

  // Crash recovery
  const testProgress = useTestProgress({
    sessionId: 'gmat-placement-assessment',
    userId: studentId || '',
    storageKeyPrefix: 'gmat_placement_',
    disabled: isPreviewMode || !studentId,
    testType: 'gmat_placement',
  });

  const { savedProgress, saveProgress, clearProgress, hasSavedProgress } = testProgress;

  // ============================================
  // Data Loading
  // ============================================
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (hasSavedProgress && !loading && !testStarted && !showResumeModal) {
      setShowResumeModal(true);
    }
  }, [hasSavedProgress, loading, testStarted, showResumeModal]);

  async function loadData() {
    try {
      const profile = await getCurrentProfile();
      if (!profile) {
        setError('Please log in to continue');
        setLoading(false);
        return;
      }
      setStudentId(profile.id);

      if (!isPreviewMode) {
        // Student mode: Check guards
        const progress = await getStudentGMATProgress(profile.id);

        // If student already has a cycle, placement is not needed
        if (progress?.gmat_cycle) {
          setError('You already have a preparation cycle assigned. Placement assessment is not needed.');
          setLoading(false);
          return;
        }

        // If student has a pending placement validation, they can't take another
        const hasPending = await hasPendingPlacementValidation(profile.id);
        if (hasPending) {
          setError('Your placement assessment has already been submitted and is awaiting tutor review.');
          setLoading(false);
          return;
        }
      }

      // Get question IDs from pool
      const { questions: questionRefs, error: selectionError } =
        await getPlacementAssessmentQuestions(profile.id);

      if (selectionError || questionRefs.length === 0) {
        setError(selectionError || 'No questions available for placement assessment. Please contact your tutor.');
        setLoading(false);
        return;
      }

      // Group by section code
      const refsBySection: Record<GmatSection, typeof questionRefs> = { QR: [], DI: [], VR: [] };
      for (const ref of questionRefs) {
        const sec = ref.section as GmatSection;
        if (refsBySection[sec]) {
          refsBySection[sec].push(ref);
        }
      }

      // Fetch full question data
      const allIds = questionRefs.map(q => q.id);
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('id, question_number, question_type, section, difficulty, question_data, answers')
        .in('id', allIds);

      if (questionsError || !questionsData) {
        throw new Error(`Failed to load questions: ${questionsError?.message || 'No data'}`);
      }

      // Build ordered questions preserving section grouping
      const questionMap = new Map(questionsData.map(q => [q.id, q as Question]));

      const orderedSectionQuestions: Record<GmatSection, Question[]> = { QR: [], DI: [], VR: [] };
      const orderedAll: Question[] = [];

      for (const sec of SECTION_ORDER) {
        const sectionRefs = refsBySection[sec];
        for (const ref of sectionRefs) {
          const fullQ = questionMap.get(ref.id);
          if (fullQ) {
            orderedSectionQuestions[sec].push(fullQ);
            orderedAll.push(fullQ);
          }
        }
      }

      setAllQuestions(orderedAll);
      setSectionQuestions(orderedSectionQuestions);
      setInitialTimeSeconds(TIME_PER_SECTION_MINUTES * 60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load placement assessment');
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // Test Flow
  // ============================================
  function handleTimeUp() {
    saveCurrentQuestionTime();
    setShowTimeUpModal(true);
  }

  function saveCurrentQuestionTime() {
    if (!currentQuestion) return;
    const additionalTime = Math.round((Date.now() - questionStartTime) / 1000);
    const existing = answers.get(currentQuestion.id);
    if (existing) {
      const updated = new Map(answers).set(currentQuestion.id, {
        ...existing,
        timeSpent: existing.timeSpent + additionalTime,
      });
      setAnswers(updated);
    } else if (additionalTime > 0) {
      const updated = new Map(answers).set(currentQuestion.id, {
        questionId: currentQuestion.id,
        answer: '__UNANSWERED__',
        timeSpent: additionalTime,
      });
      setAnswers(updated);
    }
    setQuestionStartTime(Date.now());
  }

  function startTest() {
    setInitialTimeSeconds(TIME_PER_SECTION_MINUTES * 60);
    setTestStarted(true);
    setQuestionStartTime(Date.now());
    doSaveProgress(0, 0, new Map(), new Set(), TIME_PER_SECTION_MINUTES * 60, false);
  }

  function resumeTest() {
    if (!savedProgress) return;
    const customData = savedProgress.customData as { currentSectionIndex?: number; sectionCompleted?: boolean[] } | undefined;
    const restoredSectionIndex = customData?.currentSectionIndex ?? 0;
    const restoredSectionCompleted = customData?.sectionCompleted ?? [false, false, false];

    setCurrentSectionIndex(restoredSectionIndex);
    setCurrentQuestionIndex(savedProgress.currentIndex);
    setAnswers(new Map(savedProgress.answers as Array<[string, Answer]>));
    setBookmarkedQuestions(new Set(savedProgress.bookmarkedQuestions || []));
    setSectionCompleted(restoredSectionCompleted);
    setInReviewPhase(savedProgress.inReviewPhase || false);

    // Set timer for the current section
    if (savedProgress.timeRemaining !== null) {
      setInitialTimeSeconds(savedProgress.timeRemaining);
      setTimeRemaining(savedProgress.timeRemaining);
    } else {
      setInitialTimeSeconds(TIME_PER_SECTION_MINUTES * 60);
    }

    setTestStarted(true);
    setQuestionStartTime(Date.now());
    setShowResumeModal(false);
  }

  function startFresh() {
    clearProgress();
    setShowResumeModal(false);
  }

  // ============================================
  // Navigation
  // ============================================
  function handleAnswer(questionId: string, answer: string | string[] | Record<string, string>) {
    const additionalTime = Math.round((Date.now() - questionStartTime) / 1000);
    const existing = answers.get(questionId);
    const accumulatedTime = (existing?.timeSpent || 0) + additionalTime;
    const newAnswers = new Map(answers).set(questionId, {
      questionId,
      answer,
      timeSpent: accumulatedTime,
    });
    setAnswers(newAnswers);
    setQuestionStartTime(Date.now());
    doSaveProgress(currentSectionIndex, currentQuestionIndex, newAnswers, bookmarkedQuestions, timeRemaining, inReviewPhase);
  }

  function goToQuestion(index: number) {
    const currentQ = currentSectionQs[currentQuestionIndex];
    let updatedAnswers = answers;

    if (currentQ) {
      const additionalTime = Math.round((Date.now() - questionStartTime) / 1000);
      const existing = answers.get(currentQ.id);
      if (existing) {
        updatedAnswers = new Map(answers).set(currentQ.id, {
          ...existing,
          timeSpent: existing.timeSpent + additionalTime,
        });
        setAnswers(updatedAnswers);
      } else if (additionalTime > 0) {
        updatedAnswers = new Map(answers).set(currentQ.id, {
          questionId: currentQ.id,
          answer: '__UNANSWERED__',
          timeSpent: additionalTime,
        });
        setAnswers(updatedAnswers);
      }
    }

    setCurrentQuestionIndex(index);
    setQuestionStartTime(Date.now());
    doSaveProgress(currentSectionIndex, index, updatedAnswers, bookmarkedQuestions, timeRemaining, inReviewPhase);
  }

  function nextQuestion() {
    const currentQ = currentSectionQs[currentQuestionIndex];
    const hasAnswer = currentQ && answers.has(currentQ.id) && answers.get(currentQ.id)!.answer !== '__UNANSWERED__';

    if (!inReviewPhase && !hasAnswer) return;

    if (currentQuestionIndex < currentSectionQs.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    } else if (!inReviewPhase) {
      enterReviewPhase();
    }
  }

  function enterReviewPhase() {
    saveCurrentQuestionTime();
    setInReviewPhase(true);
    setReviewFilter('all');
    doSaveProgress(currentSectionIndex, currentQuestionIndex, answers, bookmarkedQuestions, timeRemaining, true);
  }

  function toggleBookmark(questionId: string) {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      doSaveProgress(currentSectionIndex, currentQuestionIndex, answers, newSet, timeRemaining, inReviewPhase);
      return newSet;
    });
  }

  // ============================================
  // Section Transitions
  // ============================================
  function completeCurrentSection() {
    saveCurrentQuestionTime();

    const newCompleted = [...sectionCompleted];
    newCompleted[currentSectionIndex] = true;
    setSectionCompleted(newCompleted);
    setInReviewPhase(false);

    if (currentSectionIndex < SECTION_ORDER.length - 1) {
      setShowSectionTransition(true);
      setShowTimeUpModal(false);
    } else {
      setShowTimeUpModal(false);
      submitTest();
    }
  }

  function proceedToNextSection() {
    const nextIdx = currentSectionIndex + 1;
    const nextTimeSeconds = TIME_PER_SECTION_MINUTES * 60;

    setCurrentSectionIndex(nextIdx);
    setCurrentQuestionIndex(0);
    setInReviewPhase(false);
    setShowSectionTransition(false);
    setShowCalculator(false);
    setInitialTimeSeconds(nextTimeSeconds);
    setTimeRemaining(nextTimeSeconds);
    setQuestionStartTime(Date.now());

    doSaveProgress(nextIdx, 0, answers, bookmarkedQuestions, nextTimeSeconds, false);
  }

  // ============================================
  // Crash Recovery Save Helper
  // ============================================
  function doSaveProgress(
    secIdx: number,
    qIdx: number,
    ans: Map<string, Answer>,
    bookmarks: Set<string>,
    timeRem: number | null,
    review: boolean
  ) {
    const snapshot = createProgressSnapshot(qIdx, ans, bookmarks, timeRem, true, review);
    snapshot.customData = {
      currentSectionIndex: secIdx,
      sectionCompleted,
    };
    saveProgress(snapshot);
  }

  // ============================================
  // Submission & Scoring
  // ============================================
  async function submitTest() {
    if (submitting || !studentId) return;
    setSubmitting(true);
    setShowTimeUpModal(false);

    try {
      const allQuestionIds: string[] = [];
      const perQuestionAnswersData: Record<string, {
        answer: string | string[] | Record<string, string>;
        time_spent_seconds: number;
        is_correct: boolean;
        is_unanswered?: boolean;
      }> = {};

      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalTimeSeconds = 0;

      const difficultyBreakdown: Record<string, { correct: number; total: number }> = {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
      };

      for (const sec of SECTION_ORDER) {
        const secQs = sectionQuestions[sec];

        for (const question of secQs) {
          allQuestionIds.push(question.id);
          totalQuestions++;
          const difficulty = (question.difficulty || 'medium').toLowerCase();
          if (difficultyBreakdown[difficulty]) {
            difficultyBreakdown[difficulty].total++;
          }

          const userAnswer = answers.get(question.id);
          const isUnanswered = !userAnswer || userAnswer.answer === '__UNANSWERED__';

          if (isUnanswered) {
            perQuestionAnswersData[question.id] = {
              answer: '',
              time_spent_seconds: userAnswer?.timeSpent || 0,
              is_correct: false,
              is_unanswered: true,
            };
            totalTimeSeconds += userAnswer?.timeSpent || 0;
            continue;
          }

          const answersObj = typeof question.answers === 'string'
            ? JSON.parse(question.answers)
            : question.answers;
          const correctAnswer = answersObj?.correct_answer;

          const questionData = typeof question.question_data === 'string'
            ? JSON.parse(question.question_data)
            : question.question_data;

          const isCorrect = checkAnswerCorrectness(userAnswer!.answer, correctAnswer, questionData?.di_type);

          if (isCorrect) {
            totalCorrect++;
            if (difficultyBreakdown[difficulty]) {
              difficultyBreakdown[difficulty].correct++;
            }
          }

          perQuestionAnswersData[question.id] = {
            answer: userAnswer!.answer as string | string[] | Record<string, string>,
            time_spent_seconds: userAnswer!.timeSpent,
            is_correct: isCorrect,
            is_unanswered: false,
          };

          totalTimeSeconds += userAnswer!.timeSpent;
        }
      }

      const bookmarkedIds = Array.from(bookmarkedQuestions);

      if (isPreviewMode) {
        // Preview mode: build local result, don't save
        const suggestedCycle = calculateSuggestedCycle(totalCorrect, totalQuestions);

        const previewResult = {
          id: 'preview',
          student_id: studentId,
          assessment_type: 'placement' as const,
          section: null,
          topic: null,
          score_raw: totalCorrect,
          score_total: totalQuestions,
          score_percentage: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
          question_ids: allQuestionIds,
          difficulty_breakdown: difficultyBreakdown,
          time_spent_seconds: totalTimeSeconds,
          suggested_cycle: suggestedCycle,
          assigned_cycle: null,
          tutor_validated: null,
          validated_by: null,
          validated_at: null,
          tutor_notes: null,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          answers_data: perQuestionAnswersData,
          bookmarked_question_ids: bookmarkedIds,
        } as GmatAssessmentResult;
        setResult(previewResult);
        setTestCompleted(true);
      } else {
        // Student mode: save to DB
        const savedResult = await savePlacementAssessmentResult(
          studentId,
          totalCorrect,
          totalQuestions,
          difficultyBreakdown,
          allQuestionIds,
          totalTimeSeconds,
          perQuestionAnswersData,
          bookmarkedIds
        );

        setResult(savedResult);
        setTestCompleted(true);
        clearProgress();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit placement assessment');
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================
  // Answer Conversion Helpers
  // ============================================
  function toUnifiedAnswer(
    storedAnswer: string | string[] | Record<string, unknown> | undefined,
    questionData: Record<string, unknown>
  ): UnifiedAnswer {
    if (!storedAnswer) return {};
    const diType = questionData?.di_type as string | undefined;

    switch (diType) {
      case 'DS':
        return { answer: storedAnswer as string };
      case 'MSR':
        return { msrAnswers: storedAnswer as string[] };
      case 'GI': {
        const giArr = storedAnswer as string[];
        return { blank1: giArr[0] || '', blank2: giArr[1] || '' };
      }
      case 'TA':
        return { taAnswers: storedAnswer as Record<number, 'true' | 'false'> };
      case 'TPA': {
        const tpaObj = storedAnswer as Record<string, string>;
        return { column1: tpaObj.col1, column2: tpaObj.col2 };
      }
      default:
        return { answer: storedAnswer as string };
    }
  }

  function fromUnifiedAnswer(
    unified: UnifiedAnswer,
    questionData: Record<string, unknown>
  ): string | string[] | Record<string, string> {
    const diType = questionData?.di_type as string | undefined;

    switch (diType) {
      case 'DS':
        return unified.answer || '';
      case 'MSR':
        return unified.msrAnswers || [];
      case 'GI':
        return [unified.blank1 || '', unified.blank2 || ''];
      case 'TA':
        return unified.taAnswers as unknown as Record<string, string> || {};
      case 'TPA':
        return { col1: unified.column1 || '', col2: unified.column2 || '' };
      default:
        return unified.answer || '';
    }
  }

  function handleQuestionRendererAnswer(questionId: string, unified: UnifiedAnswer) {
    const question = currentSectionQs.find(q => q.id === questionId);
    if (!question) return;
    const questionData = typeof question.question_data === 'string'
      ? JSON.parse(question.question_data)
      : question.question_data;
    const storedAnswer = fromUnifiedAnswer(unified, questionData);
    handleAnswer(questionId, storedAnswer);
  }

  // ============================================
  // Render Helpers
  // ============================================
  function renderQuestion(question: Question) {
    const questionData = typeof question.question_data === 'string'
      ? JSON.parse(question.question_data)
      : question.question_data;
    const storedAnswer = answers.get(question.id)?.answer;
    const unansweredFiltered = storedAnswer === '__UNANSWERED__' ? undefined : storedAnswer;
    const unifiedAnswer = toUnifiedAnswer(unansweredFiltered, questionData);

    return (
      <QuestionRenderer
        question={{ ...question, question_data: questionData }}
        currentAnswer={unifiedAnswer}
        onAnswerChange={handleQuestionRendererAnswer}
      />
    );
  }

  // Current section stats
  const answeredInSection = currentSectionQs.filter(q => {
    const a = answers.get(q.id);
    return a && a.answer !== '__UNANSWERED__';
  }).length;
  const bookmarkedInSection = currentSectionQs.filter(q => bookmarkedQuestions.has(q.id)).length;
  const hasCurrentAnswer = currentQuestion && answers.has(currentQuestion.id) && answers.get(currentQuestion.id)!.answer !== '__UNANSWERED__';
  const allSectionQuestionsAnswered = answeredInSection === currentSectionQs.length;
  const isCurrentBookmarked = currentQuestion ? bookmarkedQuestions.has(currentQuestion.id) : false;

  // Passage detection for wider container
  const currentQuestionData = currentQuestion?.question_data
    ? (typeof currentQuestion.question_data === 'string' ? JSON.parse(currentQuestion.question_data) : currentQuestion.question_data)
    : null;
  const hasPassage = !!currentQuestionData?.passage_text;

  const backUrl = window.location.pathname.startsWith('/tutor')
    ? '/tutor/students'
    : '/student/gmat-preparation';

  // ============================================
  // Loading State
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-brand-green animate-spin mb-4" />
          <p className="text-gray-600">Loading placement assessment...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // Resume Modal
  // ============================================
  const resumeModal = showResumeModal && savedProgress && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faHistory} className="text-3xl text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Continue Previous Assessment?</h2>
          <p className="text-gray-600 text-sm">
            We found saved progress from your previous session.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Section:</span>
              <span className="font-semibold text-gray-800 ml-2">
                {SECTION_LABELS[SECTION_ORDER[(savedProgress.customData as any)?.currentSectionIndex ?? 0]]}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Question:</span>
              <span className="font-semibold text-gray-800 ml-2">
                #{savedProgress.currentIndex + 1}
              </span>
            </div>
            {savedProgress.timeRemaining !== null && (
              <div className="col-span-2">
                <span className="text-gray-500">Time Remaining:</span>
                <span className="font-semibold text-gray-800 ml-2">
                  {formatTime(savedProgress.timeRemaining)}
                </span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-gray-500">Saved:</span>
              <span className="font-semibold text-gray-800 ml-2">
                {new Date(savedProgress.savedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={startFresh}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faRedo} />
            Start Fresh
          </button>
          <button
            onClick={resumeTest}
            className="flex-1 px-4 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faHistory} />
            Resume
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // Error State
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Unable to Load Assessment</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(backUrl)}
              className="px-6 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Back to GMAT Preparation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Test Completed — Results
  // ============================================
  if (testCompleted && result) {
    // Student mode: simple confirmation card
    if (!isPreviewMode) {
      return (
        <Layout pageTitle="Assessment Submitted" pageSubtitle="GMAT Placement Assessment">
          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-3">Assessment Submitted</h1>
                <p className="text-gray-600 mb-6">
                  Your placement assessment has been submitted successfully. Your tutor will review your results and assign your preparation cycle.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faHourglass} className="text-amber-600 text-xl" />
                    <div className="text-left">
                      <div className="font-semibold text-amber-800 text-sm">Awaiting Tutor Review</div>
                      <div className="text-xs text-amber-700">
                        You will be notified once your tutor assigns your preparation cycle.
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/student/gmat-preparation')}
                  className="px-8 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Back to GMAT Preparation
                </button>
              </div>
            </div>
          </div>
        </Layout>
      );
    }

    // Preview mode: full results display
    const allQuestionResults = allQuestions.map((q, index) => {
      const answerData = answers.get(q.id);
      const answersObj2 = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
      const correctAnswer = answersObj2?.correct_answer;
      const qData = typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data;
      const isCorrect = answerData && answerData.answer !== '__UNANSWERED__' && correctAnswer
        ? checkAnswerCorrectness(answerData.answer, correctAnswer, qData?.di_type)
        : false;

      let qSection: GmatSection = 'QR';
      for (const sec of SECTION_ORDER) {
        if (sectionQuestions[sec].some(sq => sq.id === q.id)) {
          qSection = sec;
          break;
        }
      }

      return {
        question: q,
        isCorrect,
        order: index + 1,
        section: qSection,
        timeSpentSeconds: answerData?.timeSpent || 0,
        isBookmarked: bookmarkedQuestions.has(q.id),
        studentAnswer: answerData?.answer,
        isUnanswered: !answerData || answerData.answer === '__UNANSWERED__',
      };
    });

    const filteredResults = allQuestionResults.filter(r => {
      if (resultsSectionFilter !== 'all' && r.section !== resultsSectionFilter) return false;
      if (resultsFilterCorrectness === 'correct' && !r.isCorrect) return false;
      if (resultsFilterCorrectness === 'wrong' && (r.isCorrect || r.isUnanswered)) return false;
      if (resultsFilterBookmarked && !r.isBookmarked) return false;
      return true;
    });

    // Pacing calculations
    const expectedTimePerQuestion = 120; // 2 minutes per question
    const questionsWithTime = allQuestionResults.filter(r => r.timeSpentSeconds > 0);
    const fastQuestions = questionsWithTime.filter(r => r.timeSpentSeconds < expectedTimePerQuestion * 0.5).length;
    const slowQuestions = questionsWithTime.filter(r => r.timeSpentSeconds > expectedTimePerQuestion * 1.5).length;
    const onPaceQuestions = questionsWithTime.length - fastQuestions - slowQuestions;

    // Cumulative pacing data
    let cumulativeActual = 0;
    const pacingData = allQuestionResults.map((r, i) => {
      cumulativeActual += r.timeSpentSeconds;
      return {
        question: i + 1,
        actual: cumulativeActual,
        expected: (i + 1) * expectedTimePerQuestion,
      };
    });

    const renderResultQuestion = (qResult: typeof allQuestionResults[0]) => {
      const { question, studentAnswer } = qResult;
      const questionData = typeof question.question_data === 'string'
        ? JSON.parse(question.question_data) : question.question_data;
      const unansweredFiltered = studentAnswer === '__UNANSWERED__' ? undefined : studentAnswer;
      const unifiedAnswer = toUnifiedAnswer(unansweredFiltered, questionData);

      return (
        <QuestionRenderer
          question={{ ...question, question_data: questionData }}
          currentAnswer={unifiedAnswer}
          onAnswerChange={() => {}}
          showResults={true}
          readOnly={true}
          explanation={questionData?.explanation}
        />
      );
    };

    // Per-section breakdown for preview
    const sectionBreakdown = SECTION_ORDER.map(sec => {
      const secResults = allQuestionResults.filter(r => r.section === sec);
      const correct = secResults.filter(r => r.isCorrect).length;
      const total = secResults.length;
      return { section: sec, correct, total, percentage: total > 0 ? (correct / total) * 100 : 0 };
    });

    return (
      <Layout pageTitle="Preview Complete" pageSubtitle="GMAT Placement Assessment">
        <MathJaxProvider>
          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Back Button */}
              <button
                onClick={() => navigate(backUrl)}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to GMAT Preparation
              </button>

              {/* Preview Mode Notice */}
              <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-3">
                <FontAwesomeIcon icon={faEye} className="text-amber-600 text-xl" />
                <div>
                  <h3 className="font-semibold text-amber-800">Preview Results</h3>
                  <p className="text-sm text-amber-700">These results were not saved since you are in preview mode.</p>
                </div>
              </div>

              {/* Score Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white mb-6 shadow-xl">
                <div className="text-center mb-6">
                  <FontAwesomeIcon icon={faTrophy} className="text-4xl text-amber-300 mb-3" />
                  <h1 className="text-2xl font-bold opacity-90 mb-1">Placement Assessment Result</h1>
                  <div className="text-5xl font-black tracking-tight">
                    {result.score_raw}/{result.score_total}
                  </div>
                  <div className="text-lg opacity-80 mt-2">
                    {result.score_percentage.toFixed(1)}%
                  </div>
                  <div className="mt-3 inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold">
                    Suggested Cycle: {result.suggested_cycle || 'N/A'}
                  </div>
                </div>

                {/* Section Scores */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {sectionBreakdown.map(sec => (
                    <div key={sec.section} className="bg-white/15 rounded-xl p-4 text-center backdrop-blur-sm">
                      <div className="text-xs font-medium opacity-80 mb-1">{SECTION_LABELS[sec.section]}</div>
                      <div className="text-2xl font-bold">{sec.correct}/{sec.total}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {sec.percentage.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results Summary Card */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600">
                      {result.score_raw}/{result.score_total}
                    </div>
                    <div className="text-sm text-gray-600">Raw Score</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600">
                      {result.score_percentage.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Percentage</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <div className="text-3xl font-bold text-amber-600">
                      {result.time_spent_seconds ? `${Math.floor(result.time_spent_seconds / 60)}m ${result.time_spent_seconds % 60}s` : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600">
                      {result.time_spent_seconds && allQuestions.length > 0
                        ? Math.round(result.time_spent_seconds / allQuestions.length)
                        : '-'}s
                    </div>
                    <div className="text-sm text-gray-600">Avg per Question</div>
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="border-t-2 border-gray-100 pt-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Performance by Difficulty</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['easy', 'medium', 'hard'] as const).map(diff => {
                      const bd = result.difficulty_breakdown as any;
                      const data = bd?.[diff];
                      return (
                        <div key={diff} className={`text-center p-3 rounded-lg ${
                          diff === 'easy' ? 'bg-emerald-50' : diff === 'medium' ? 'bg-amber-50' : 'bg-red-50'
                        }`}>
                          <div className={`text-lg font-bold ${
                            diff === 'easy' ? 'text-emerald-600' : diff === 'medium' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {data ? `${data.correct}/${data.total}` : '—'}
                          </div>
                          <div className="text-xs text-gray-600 capitalize">{diff}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Report Section */}
              {questionsWithTime.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={faStopwatch} className="text-blue-600 text-lg" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Time Report</h2>
                        <p className="text-sm text-gray-500">Pacing analysis and time per question</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowResultsTimeReport(!showResultsTimeReport)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      {showResultsTimeReport ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>

                  {/* Pacing Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{fastQuestions}</div>
                      <div className="text-xs text-gray-600">Fast (&lt;{Math.round(expectedTimePerQuestion * 0.5)}s)</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{onPaceQuestions}</div>
                      <div className="text-xs text-gray-600">On Pace</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{slowQuestions}</div>
                      <div className="text-xs text-gray-600">Slow (&gt;{Math.round(expectedTimePerQuestion * 1.5)}s)</div>
                    </div>
                  </div>

                  {showResultsTimeReport && (
                    <>
                      {/* Question Details Grid */}
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Question Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {allQuestionResults.map((qr) => {
                            const isSlower = qr.timeSpentSeconds > expectedTimePerQuestion * 1.5;
                            const isFaster = qr.timeSpentSeconds < expectedTimePerQuestion * 0.5;
                            return (
                              <div
                                key={qr.question.id}
                                className={`p-3 rounded-lg border ${
                                  qr.isUnanswered
                                    ? 'bg-gray-50 border-gray-200'
                                    : qr.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Q{qr.order}</span>
                                    {qr.isUnanswered ? (
                                      <span className="text-xs text-gray-400">—</span>
                                    ) : (
                                      <FontAwesomeIcon
                                        icon={qr.isCorrect ? faCheckCircle : faTimesCircle}
                                        className={qr.isCorrect ? 'text-green-600' : 'text-red-600'}
                                      />
                                    )}
                                    {qr.isBookmarked && (
                                      <FontAwesomeIcon icon={faBookmark} className="text-amber-500 text-xs" />
                                    )}
                                  </div>
                                  <div className={`flex items-center gap-1 text-sm font-medium ${
                                    isSlower ? 'text-red-600' : isFaster ? 'text-green-600' : 'text-gray-600'
                                  }`}>
                                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                                    {qr.timeSpentSeconds}s
                                    {isSlower && <span className="text-xs ml-1">(slow)</span>}
                                    {isFaster && <span className="text-xs ml-1">(fast)</span>}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {SECTION_LABELS[qr.section]} • {qr.question.difficulty || 'Unknown'}
                                </div>
                                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isSlower ? 'bg-red-500' : isFaster ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${Math.min((qr.timeSpentSeconds / expectedTimePerQuestion) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pacing Charts Toggle */}
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <button
                          onClick={() => setShowResultsPacingCharts(!showResultsPacingCharts)}
                          className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faChartLine} />
                          {showResultsPacingCharts ? 'Hide Pacing Charts' : 'Show Pacing Charts'}
                        </button>
                      </div>

                      {showResultsPacingCharts && pacingData.length > 0 && (
                        <div className="border-t border-gray-100 pt-4 mt-4 space-y-6">
                          {/* Time per Question Bar Chart */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Time per Question</h4>
                            <div className="flex items-end gap-[2px] h-32">
                              {allQuestionResults.map((qr, i) => {
                                const maxTime = Math.max(...allQuestionResults.map(r => r.timeSpentSeconds), expectedTimePerQuestion);
                                const heightPct = maxTime > 0 ? (qr.timeSpentSeconds / maxTime) * 100 : 0;
                                const isSlower = qr.timeSpentSeconds > expectedTimePerQuestion * 1.5;
                                const isFaster = qr.timeSpentSeconds < expectedTimePerQuestion * 0.5;
                                return (
                                  <div
                                    key={qr.question.id}
                                    className={`flex-1 rounded-t ${
                                      qr.isUnanswered ? 'bg-gray-300' :
                                      isSlower ? 'bg-red-400' : isFaster ? 'bg-green-400' : 'bg-blue-400'
                                    }`}
                                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                                    title={`Q${i + 1}: ${qr.timeSpentSeconds}s`}
                                  />
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded" /> Fast</span>
                              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded" /> On Pace</span>
                              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded" /> Slow</span>
                            </div>
                          </div>

                          {/* Cumulative Pacing */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Cumulative Pacing</h4>
                            <div className="relative h-32 border-l border-b border-gray-200">
                              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${pacingData.length} ${pacingData[pacingData.length - 1]?.expected || 1}`} preserveAspectRatio="none">
                                <polyline
                                  fill="none"
                                  stroke="#94a3b8"
                                  strokeWidth="2"
                                  strokeDasharray="4 4"
                                  vectorEffect="non-scaling-stroke"
                                  points={pacingData.map(d => `${d.question - 1},${(pacingData[pacingData.length - 1]?.expected || 1) - d.expected}`).join(' ')}
                                />
                                <polyline
                                  fill="none"
                                  stroke="#6366f1"
                                  strokeWidth="2"
                                  vectorEffect="non-scaling-stroke"
                                  points={pacingData.map(d => `${d.question - 1},${(pacingData[pacingData.length - 1]?.expected || 1) - d.actual}`).join(' ')}
                                />
                              </svg>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-indigo-500" /> Actual</span>
                              <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-gray-400 border-dashed border-t" /> Expected</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Question Review Section */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faList} className="text-gray-600 text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Question Review</h2>
                      <p className="text-sm text-gray-500">{allQuestions.length} questions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResultsQuestions(!showResultsQuestions)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {showResultsQuestions ? 'Hide Questions' : 'Show Questions'}
                  </button>
                </div>

                {showResultsQuestions && (
                  <>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      {/* Section filter */}
                      {(['all', ...SECTION_ORDER] as const).map(sec => (
                        <button
                          key={sec}
                          onClick={() => setResultsSectionFilter(sec)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            resultsSectionFilter === sec
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {sec === 'all' ? 'All Sections' : SECTION_LABELS[sec]}
                        </button>
                      ))}
                      <div className="w-px bg-gray-200 h-6" />
                      {(['all', 'correct', 'wrong'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setResultsFilterCorrectness(f)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            resultsFilterCorrectness === f
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {f === 'all' ? 'All' : f === 'correct' ? `Correct (${allQuestionResults.filter(r => r.isCorrect).length})` : `Wrong (${allQuestionResults.filter(r => !r.isCorrect && !r.isUnanswered).length})`}
                        </button>
                      ))}
                      <button
                        onClick={() => setResultsFilterBookmarked(!resultsFilterBookmarked)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          resultsFilterBookmarked
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <FontAwesomeIcon icon={faBookmark} className="mr-1" />
                        Bookmarked
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 mb-4">
                      Showing {filteredResults.length} of {allQuestions.length} questions
                    </p>

                    {/* Question list — colored header + white body pattern */}
                    <div className="space-y-6">
                      {filteredResults.map(qResult => (
                        <div
                          key={qResult.question.id}
                          className={`rounded-2xl border-2 overflow-hidden ${
                            qResult.isUnanswered
                              ? 'border-gray-200'
                              : qResult.isCorrect
                                ? 'border-green-200'
                                : 'border-red-200'
                          }`}
                        >
                          {/* Colored Header */}
                          <div className={`px-6 py-4 border-b flex items-center justify-between ${
                            qResult.isUnanswered
                              ? 'bg-gray-50 border-gray-100'
                              : qResult.isCorrect
                                ? 'bg-green-50 border-green-100'
                                : 'bg-red-50 border-red-100'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-gray-800">Q{qResult.order}</span>
                              {qResult.isUnanswered ? (
                                <span className="text-xs text-gray-400 font-medium">Unanswered</span>
                              ) : (
                                <FontAwesomeIcon
                                  icon={qResult.isCorrect ? faCheckCircle : faTimesCircle}
                                  className={qResult.isCorrect ? 'text-green-600' : 'text-red-600'}
                                />
                              )}
                              {qResult.isBookmarked && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                                  <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                                  Bookmarked
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                                {SECTION_LABELS[qResult.section]}
                              </span>
                              {qResult.question.difficulty && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  qResult.question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  qResult.question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {qResult.question.difficulty}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <FontAwesomeIcon icon={faClock} className="text-xs" />
                              <span className="font-medium">{qResult.timeSpentSeconds}s</span>
                            </div>
                          </div>
                          {/* White Body */}
                          <div className="p-6 bg-white">
                            {renderResultQuestion(qResult)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Back to Preparation */}
              <div className="text-center">
                <button
                  onClick={() => navigate(backUrl)}
                  className="px-8 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Back to GMAT Preparation
                </button>
              </div>
            </div>
          </div>
        </MathJaxProvider>
      </Layout>
    );
  }

  // ============================================
  // Section Transition Screen
  // ============================================
  if (showSectionTransition) {
    const completedSection = SECTION_ORDER[currentSectionIndex];
    const nextSection = SECTION_ORDER[currentSectionIndex + 1];
    const completedSectionQs = sectionQuestions[completedSection];
    const answeredInCompleted = completedSectionQs.filter(q => {
      const a = answers.get(q.id);
      return a && a.answer !== '__UNANSWERED__';
    }).length;

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {SECTION_LABELS[completedSection]} — Complete
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {answeredInCompleted}/{completedSectionQs.length} questions answered
          </p>

          {/* Section progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {SECTION_ORDER.map((sec, i) => (
              <div key={sec} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i <= currentSectionIndex
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                {i < SECTION_ORDER.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < currentSectionIndex ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Next section info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
            <div className="text-sm font-medium text-indigo-700 mb-1">Up Next</div>
            <div className="text-lg font-bold text-indigo-800">{SECTION_LABELS[nextSection]}</div>
            <div className="text-xs text-indigo-600 mt-1">
              {PLACEMENT_CONFIG.questionsPerSection} questions • {TIME_PER_SECTION_MINUTES} minutes
            </div>
          </div>

          <button
            onClick={proceedToNextSection}
            className="w-full px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowRight} />
            Continue to {SECTION_LABELS[nextSection]}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // Pre-Start Screen
  // ============================================
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {resumeModal}

          {/* Preview Mode Banner */}
          {isPreviewMode && (
            <div className="mb-4 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-3">
              <FontAwesomeIcon icon={faEye} className="text-amber-600 text-xl" />
              <div>
                <h3 className="font-semibold text-amber-800">Preview Mode</h3>
                <p className="text-sm text-amber-700">You are previewing this assessment. Results will not be saved.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faClipboardCheck} className="text-3xl text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Placement Assessment</h1>
              <p className="text-gray-600">
                {PLACEMENT_CONFIG.totalQuestions} questions across 3 sections • {PLACEMENT_CONFIG.timeMinutes} minutes total
              </p>
            </div>

            {/* Section list — fixed order */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Section Order</h3>
              {SECTION_ORDER.map((sec, i) => (
                <div key={sec} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-700">
                    {i + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800 text-sm">{SECTION_LABELS[sec]}</div>
                    <div className="text-xs text-gray-500">{PLACEMENT_CONFIG.questionsPerSection} questions • {TIME_PER_SECTION_MINUTES} min</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-left">
              <div className="text-xs text-amber-700">
                <strong>Note:</strong> Navigation is forward-only within each section. You can bookmark questions and review them before completing each section. A calculator is available during Data Insights. Your results will be reviewed by your tutor.
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startTest}
                className="px-8 py-4 bg-brand-green text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors"
              >
                {isPreviewMode ? 'Start Preview' : 'Start Assessment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Time's Up Modal
  // ============================================
  const sectionUnansweredCount = currentSectionQs.length - answeredInSection;
  const timeUpModal = showTimeUpModal && (
    <TimeUpModal
      isOpen={showTimeUpModal}
      totalQuestions={currentSectionQs.length}
      unansweredCount={sectionUnansweredCount}
      onSubmit={() => {
        setShowTimeUpModal(false);
        completeCurrentSection();
      }}
    />
  );

  // ============================================
  // Review Phase (within current section) — Training page layout
  // ============================================
  if (inReviewPhase) {
    const filteredReviewQuestions = reviewFilter === 'bookmarked'
      ? currentSectionQs.filter(q => bookmarkedQuestions.has(q.id))
      : currentSectionQs;

    return (
      <MathJaxProvider>
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
          {/* Preview Mode Indicator */}
          {isPreviewMode && (
            <div className="bg-amber-400 text-amber-900 px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faEye} />
              Preview Mode
            </div>
          )}

          {timeUpModal}

          {/* Review Content - Scrollable area */}
          <div className="flex-1 overflow-auto p-4">
            <div className={`${hasPassage ? 'max-w-7xl' : 'max-w-4xl'} mx-auto`}>
              {/* Compact Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <FontAwesomeIcon icon={faList} />
                  <span className="font-semibold text-sm">Review — {SECTION_LABELS[currentSection]}</span>
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setReviewFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      reviewFilter === 'all'
                        ? 'bg-brand-green text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All ({currentSectionQs.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('bookmarked')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      reviewFilter === 'bookmarked'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                    {bookmarkedInSection}
                  </button>
                </div>
              </div>

              {/* Question Grid — Responsive */}
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
                {filteredReviewQuestions.map((q) => {
                  const actualIndex = currentSectionQs.findIndex(question => question.id === q.id);
                  const isAnswered = answers.has(q.id) && answers.get(q.id)!.answer !== '__UNANSWERED__';
                  const isBookmarked = bookmarkedQuestions.has(q.id);
                  const isCurrent = actualIndex === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(actualIndex)}
                      className={`relative p-2 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                        isCurrent
                          ? 'border-brand-green bg-brand-green/10'
                          : isBookmarked
                          ? 'border-amber-300 bg-amber-50'
                          : isAnswered
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-800">Q{actualIndex + 1}</span>
                      {isBookmarked && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredReviewQuestions.length === 0 && reviewFilter === 'bookmarked' && (
                <div className="bg-white rounded-xl p-6 text-center">
                  <FontAwesomeIcon icon={faTag} className="text-3xl text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No bookmarked questions</p>
                </div>
              )}

              {/* Warning if unanswered */}
              {sectionUnansweredCount > 0 && reviewFilter === 'all' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>
                      {sectionUnansweredCount} question{sectionUnansweredCount > 1 ? 's' : ''} not answered.
                      Unanswered questions will be marked as incorrect.
                    </span>
                  </div>
                </div>
              )}

              {/* Review Question Detail */}
              {currentQuestion && (() => {
                const questionData = typeof currentQuestion.question_data === 'string'
                  ? JSON.parse(currentQuestion.question_data)
                  : currentQuestion.question_data;
                const categories = questionData?.categories as string[] | undefined;
                const primaryCategory = categories?.[0];

                return (
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm">
                          Q{currentQuestionIndex + 1}
                        </span>
                        {primaryCategory && (
                          <span className="px-2.5 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700">
                            {primaryCategory}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleBookmark(currentQuestion.id)}
                        className={`p-2 rounded-lg transition-all ${
                          isCurrentBookmarked
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                        }`}
                      >
                        <FontAwesomeIcon icon={isCurrentBookmarked ? faBookmark : faTag} />
                      </button>
                    </div>
                    {renderQuestion(currentQuestion)}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Bottom Bar — Compact */}
          <div className="bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              {/* Left: Timer and stats */}
              <div className="flex items-center gap-2">
                <TestTimerCompact
                  timeRemaining={timeRemaining}
                  warningThreshold={600}
                  dangerThreshold={300}
                  className="px-2 py-1 rounded-lg text-sm font-semibold bg-gray-100"
                />
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{answeredInSection}</span>/{currentSectionQs.length}
                </span>
              </div>

              {/* Right: Calculator + Submit button */}
              <div className="flex items-center gap-2">
                {isDISection && (
                  <button
                    onClick={() => setShowCalculator(!showCalculator)}
                    className={`p-2 rounded-lg transition-all ${
                      showCalculator
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                    title="Calculator (Data Insights)"
                  >
                    <FontAwesomeIcon icon={faCalculator} />
                  </button>
                )}

                <button
                  onClick={completeCurrentSection}
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      {currentSectionIndex === SECTION_ORDER.length - 1
                        ? 'Submit Assessment'
                        : 'Complete Section'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Calculator */}
          {isDISection && (
            <GMATCalculator
              isOpen={showCalculator}
              onClose={() => setShowCalculator(false)}
            />
          )}
        </div>
      </MathJaxProvider>
    );
  }

  // ============================================
  // Main Test-Taking UI — Training page layout with bottom bar
  // ============================================
  return (
    <MathJaxProvider>
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
        {/* Preview Mode Indicator */}
        {isPreviewMode && (
          <div className="bg-amber-400 text-amber-900 px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faEye} />
            Preview Mode
          </div>
        )}

        {timeUpModal}
        {resumeModal}

        {/* Question Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className={`${hasPassage ? 'max-w-7xl' : 'max-w-4xl'} mx-auto`}>
            {currentQuestion && (() => {
              const questionData = typeof currentQuestion.question_data === 'string'
                ? JSON.parse(currentQuestion.question_data)
                : currentQuestion.question_data;
              const categories = questionData?.categories as string[] | undefined;
              const primaryCategory = categories?.[0];

              return (
                <div className="bg-white rounded-2xl shadow-lg p-5">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm">
                        Q{currentQuestionIndex + 1}
                      </span>
                      {primaryCategory && (
                        <span className="px-2.5 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700">
                          {primaryCategory}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleBookmark(currentQuestion.id)}
                      className={`p-2 rounded-lg transition-all ${
                        isCurrentBookmarked
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                      }`}
                    >
                      <FontAwesomeIcon icon={isCurrentBookmarked ? faBookmark : faTag} />
                    </button>
                  </div>

                  {/* Question Body */}
                  {renderQuestion(currentQuestion)}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Bottom Navigation — Compact single-row layout matching Training page */}
        <div className="bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            {/* Left: Timer */}
            <TestTimerCompact
              timeRemaining={timeRemaining}
              warningThreshold={600}
              dangerThreshold={300}
              className="px-2 py-1 rounded-lg text-sm font-semibold shrink-0 bg-gray-100"
            />

            {/* Section indicator pills */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {SECTION_ORDER.map((sec, i) => (
                <div
                  key={sec}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < currentSectionIndex ? 'bg-emerald-500' :
                    i === currentSectionIndex ? 'bg-indigo-500' :
                    'bg-gray-300'
                  }`}
                  title={SECTION_LABELS[sec]}
                />
              ))}
            </div>

            {/* Center: Question Pills — horizontal scroll */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1 scrollbar-thin">
              {currentSectionQs.map((q, i) => {
                const isAnswered = answers.has(q.id) && answers.get(q.id)!.answer !== '__UNANSWERED__';
                const isCurrent = i === currentQuestionIndex;
                const isBookmarkedQ = bookmarkedQuestions.has(q.id);
                const canAccess = i <= currentQuestionIndex || inReviewPhase;

                return (
                  <div
                    key={q.id}
                    className={`relative w-7 h-7 rounded-md text-xs font-semibold transition-all flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-brand-green text-white'
                        : isAnswered
                        ? 'bg-green-100 text-green-700'
                        : canAccess
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-gray-50 text-gray-300'
                    } ${!canAccess ? 'cursor-not-allowed' : ''}`}
                  >
                    {i + 1}
                    {isBookmarkedQ && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Stats + Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Calculator button — DI section only */}
              {isDISection && (
                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className={`p-2 rounded-lg transition-all ${
                    showCalculator
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                  title="Calculator (Data Insights)"
                >
                  <FontAwesomeIcon icon={faCalculator} />
                </button>
              )}

              {/* Progress & Bookmarks */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <span><span className="font-semibold text-gray-700">{answeredInSection}</span>/{currentSectionQs.length}</span>
                {bookmarkedInSection > 0 && (
                  <span className="text-amber-600 flex items-center gap-0.5">
                    <FontAwesomeIcon icon={faBookmark} className="text-[10px]" />
                    {bookmarkedInSection}
                  </span>
                )}
              </div>

              {/* Status indicator */}
              {!hasCurrentAnswer ? (
                <span className="text-amber-600 text-xs font-medium flex items-center gap-1">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-[10px]" />
                  <span className="hidden sm:inline">Answer</span>
                </span>
              ) : (
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm" />
              )}

              {/* Next/Review Button */}
              {allSectionQuestionsAnswered && currentQuestionIndex === currentSectionQs.length - 1 ? (
                <button
                  onClick={enterReviewPhase}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <FontAwesomeIcon icon={faList} />
                  <span className="hidden sm:inline">Review</span>
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled={!hasCurrentAnswer}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                    hasCurrentAnswer
                      ? 'bg-brand-green text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Calculator */}
        {isDISection && (
          <GMATCalculator
            isOpen={showCalculator}
            onClose={() => setShowCalculator(false)}
          />
        )}
      </div>
    </MathJaxProvider>
  );
}
