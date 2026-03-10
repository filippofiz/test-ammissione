/**
 * GMAT Training Test Page
 * Specialized page for taking GMAT training tests from allocated templates
 * - Fetches questions based on template allocation and student's cycle
 * - Saves results to 2V_gmat_assessment_results
 * - Forward-only navigation with bookmark feature
 * - Review phase before submission
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowLeft,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faExclamationTriangle,
  faEye,
  faHistory,
  faRedo,
  faBookmark,
  faList,
  faTag,
  faCalculator,
  faStopwatch,
  faChartLine,
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
  getTrainingTemplateDetails,
  saveTrainingResult,
  type GmatCycle,
  type TrainingTemplate,
  type GmatAssessmentResult,
} from '../lib/api/gmat';
import { getAllocatedQuestionIds, MATERIAL_TYPE_LABELS } from '../lib/gmat/questionAllocation';

interface Question {
  id: string;
  question_number: number;
  question_type: string;
  section: string;
  difficulty: string | null;
  question_data: any;
  answers: any;
}

// Use StoredAnswer from the hook for answer storage
type Answer = StoredAnswer;

export default function GMATTrainingTestPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if this is preview mode (tutor/admin preview)
  const isPreviewMode = searchParams.get('preview') === 'true';

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<TrainingTemplate | null>(null);
  const [studentCycle, setStudentCycle] = useState<GmatCycle | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GmatAssessmentResult | null>(null);
  const [initialTimeSeconds, setInitialTimeSeconds] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [studentId, setStudentId] = useState<string | null>(null);

  // Review phase state
  const [inReviewPhase, setInReviewPhase] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'bookmarked'>('all');

  // Calculator state (available for Data Insights section)
  const [showCalculator, setShowCalculator] = useState(false);

  // Results view state
  const [showResultsTimeReport, setShowResultsTimeReport] = useState(false);
  const [showResultsPacingCharts, setShowResultsPacingCharts] = useState(false);
  const [showResultsQuestions, setShowResultsQuestions] = useState(false);
  const [resultsFilterCorrectness, setResultsFilterCorrectness] = useState<'all' | 'correct' | 'wrong'>('all');
  const [resultsFilterBookmarked, setResultsFilterBookmarked] = useState(false);

  // Resume modal state
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Time's Up modal state
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);

  // Use the shared timer hook
  const { timeRemaining, setTimeRemaining } = useTestTimer({
    initialSeconds: initialTimeSeconds,
    isActive: testStarted,
    onTimeUp: handleTimeUp,
  });

  // Use the shared progress hook for crash recovery
  const testProgress = useTestProgress({
    sessionId: templateId || '',
    userId: studentId || '',
    storageKeyPrefix: 'gmat_training_progress_',
    disabled: isPreviewMode || !templateId || !studentId,
    testType: 'gmat_training',
  });

  // Alias for cleaner code
  const { savedProgress, saveProgress, clearProgress, hasSavedProgress } = testProgress;

  // Load template and questions
  useEffect(() => {
    loadData();
  }, [templateId]);

  // Show resume modal when saved progress is detected
  useEffect(() => {
    if (hasSavedProgress && !loading && !testStarted && !showResumeModal) {
      setShowResumeModal(true);
    }
  }, [hasSavedProgress, loading, testStarted, showResumeModal]);

  async function loadData() {
    if (!templateId) {
      setError('No template ID provided');
      setLoading(false);
      return;
    }

    try {
      // Get current user profile
      const profile = await getCurrentProfile();
      if (!profile) {
        setError('Please log in to continue');
        setLoading(false);
        return;
      }
      setStudentId(profile.id);

      // Get template details first (needed for both preview and normal mode)
      const templateDetails = await getTrainingTemplateDetails(templateId);
      if (!templateDetails) {
        setError('Training template not found');
        setLoading(false);
        return;
      }
      setTemplate(templateDetails);

      let cycleToUse: GmatCycle;
      let allocatedIds: string[] = [];

      if (isPreviewMode) {
        // Preview mode: use first available cycle with questions
        // Try each cycle in order to find one with allocated questions
        const cyclesToTry: GmatCycle[] = ['Foundation', 'Development', 'Excellence'];

        for (const cycle of cyclesToTry) {
          const ids = await getAllocatedQuestionIds(templateId, cycle);
          if (ids && ids.length > 0) {
            cycleToUse = cycle;
            allocatedIds = ids;
            break;
          }
        }

        if (allocatedIds.length === 0) {
          setError('No questions have been allocated for any cycle. Please allocate questions first.');
          setLoading(false);
          return;
        }

        setStudentCycle(cycleToUse!);
      } else {
        // Normal mode: require student's assigned cycle
        const progress = await getStudentGMATProgress(profile.id);
        if (!progress) {
          setError('You have not been assigned a GMAT preparation cycle. Please contact your tutor.');
          setLoading(false);
          return;
        }

        // Allow overriding the cycle via query param (used when viewing a past cycle from GMATPreparationPage)
        const cycleParam = searchParams.get('cycle') as GmatCycle | null;
        const validCycles: GmatCycle[] = ['Foundation', 'Development', 'Excellence'];
        if (cycleParam && validCycles.includes(cycleParam)) {
          cycleToUse = cycleParam;
        } else {
          cycleToUse = progress.gmat_cycle;
        }
        setStudentCycle(cycleToUse);

        // Get allocated question IDs for the chosen cycle
        allocatedIds = await getAllocatedQuestionIds(templateId, cycleToUse);
        if (!allocatedIds || allocatedIds.length === 0) {
          setError(`No questions have been allocated for the ${cycleToUse} cycle. Please contact your tutor.`);
          setLoading(false);
          return;
        }
      }

      // Fetch full question data
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('id, question_number, question_type, section, difficulty, question_data, answers')
        .in('id', allocatedIds);

      if (questionsError) {
        throw new Error(`Failed to load questions: ${questionsError.message}`);
      }

      // Order questions according to allocation order
      const questionMap = new Map(questionsData?.map(q => [q.id, q]) || []);
      const orderedQuestions = allocatedIds
        .map(id => questionMap.get(id))
        .filter((q): q is Question => q !== undefined);

      setQuestions(orderedQuestions);

      // Set time limit (this will be passed to useTestTimer hook)
      if (templateDetails.question_requirements?.time_limit_minutes) {
        setInitialTimeSeconds(templateDetails.question_requirements.time_limit_minutes * 60);
      }

      // Note: Saved progress is automatically loaded by useTestProgress hook
      // The resume modal will be shown via useEffect when savedProgress is detected

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training');
    } finally {
      setLoading(false);
    }
  }

  function handleTimeUp() {
    // Auto-save time spent on current question before showing modal
    if (currentQuestion && !answers.has(currentQuestion.id)) {
      // Record time spent even without an answer (will be counted as unanswered)
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      const newAnswers = new Map(answers).set(currentQuestion.id, {
        questionId: currentQuestion.id,
        answer: '__UNANSWERED__', // Special marker for unanswered questions
        timeSpent,
      });
      setAnswers(newAnswers);
    } else if (currentQuestion && answers.has(currentQuestion.id)) {
      // Update time spent on current question
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      const existingAnswer = answers.get(currentQuestion.id)!;
      const newAnswers = new Map(answers).set(currentQuestion.id, {
        ...existingAnswer,
        timeSpent: existingAnswer.timeSpent + timeSpent,
      });
      setAnswers(newAnswers);
    }

    // Show Time's Up modal
    setShowTimeUpModal(true);
  }

  function startTest() {
    setTestStarted(true);
    setQuestionStartTime(Date.now());

    // Save initial progress using the hook
    saveProgress(createProgressSnapshot(
      0,
      new Map(),
      new Set(),
      timeRemaining,
      true,
      false
    ));
  }

  function resumeTest() {
    if (!savedProgress) return;

    // Restore state from saved progress
    setCurrentIndex(savedProgress.currentIndex);
    setAnswers(new Map(savedProgress.answers as Array<[string, Answer]>));
    setBookmarkedQuestions(new Set(savedProgress.bookmarkedQuestions || []));
    if (savedProgress.timeRemaining !== null) {
      setTimeRemaining(savedProgress.timeRemaining);
    }
    setInReviewPhase(savedProgress.inReviewPhase || false);
    setTestStarted(true);
    setQuestionStartTime(Date.now());
    setShowResumeModal(false);
  }

  function startFresh() {
    // Clear saved progress and start new test
    clearProgress();
    setShowResumeModal(false);
    // Don't auto-start, let user click Start button
  }

  function toggleBookmark(questionId: string) {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }

      // Auto-save progress with updated bookmarks
      saveProgress(createProgressSnapshot(
        currentIndex,
        answers,
        newSet,
        timeRemaining,
        true,
        inReviewPhase
      ));

      return newSet;
    });
  }

  function handleAnswer(questionId: string, answer: string | string[] | Record<string, string>) {
    const additionalTime = Math.round((Date.now() - questionStartTime) / 1000);
    const existingAnswer = answers.get(questionId);
    const accumulatedTime = (existingAnswer?.timeSpent || 0) + additionalTime;
    const newAnswers = new Map(answers).set(questionId, {
      questionId,
      answer,
      timeSpent: accumulatedTime,
    });
    setAnswers(newAnswers);
    // Reset start time so goToQuestion/handleTimeUp won't double-count
    setQuestionStartTime(Date.now());

    // Auto-save progress after each answer
    saveProgress(createProgressSnapshot(
      currentIndex,
      newAnswers,
      bookmarkedQuestions,
      timeRemaining,
      true,
      inReviewPhase
    ));
  }

  function goToQuestion(index: number) {
    // Save time for current question (even if unanswered — important for review phase)
    const currentQuestion = questions[currentIndex];
    let updatedAnswers = answers;

    if (currentQuestion) {
      const additionalTime = Math.round((Date.now() - questionStartTime) / 1000);
      const existingAnswer = answers.get(currentQuestion.id);
      if (existingAnswer) {
        updatedAnswers = new Map(answers).set(currentQuestion.id, {
          ...existingAnswer,
          timeSpent: existingAnswer.timeSpent + additionalTime,
        });
        setAnswers(updatedAnswers);
      } else if (additionalTime > 0) {
        // Track time even for unanswered questions (e.g., during review navigation)
        updatedAnswers = new Map(answers).set(currentQuestion.id, {
          questionId: currentQuestion.id,
          answer: '__UNANSWERED__',
          timeSpent: additionalTime,
        });
        setAnswers(updatedAnswers);
      }
    }

    setCurrentIndex(index);
    setQuestionStartTime(Date.now());

    // Auto-save progress when navigating
    saveProgress(createProgressSnapshot(
      index,
      updatedAnswers,
      bookmarkedQuestions,
      timeRemaining,
      true,
      inReviewPhase
    ));
  }

  function nextQuestion() {
    const currentQuestion = questions[currentIndex];
    const hasAnswer = currentQuestion && answers.has(currentQuestion.id);

    // In normal test mode (not review), can only proceed if answered
    if (!inReviewPhase && !hasAnswer) {
      return;
    }

    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    } else if (!inReviewPhase) {
      // All questions answered, enter review phase
      enterReviewPhase();
    }
  }

  function enterReviewPhase() {
    setInReviewPhase(true);

    // Auto-save progress with review phase state
    saveProgress(createProgressSnapshot(
      currentIndex,
      answers,
      bookmarkedQuestions,
      timeRemaining,
      true,
      true // inReviewPhase = true
    ));
  }

  async function submitTest() {
    if (submitting || !studentId || !template) return;

    // Hide Time's Up modal if showing
    setShowTimeUpModal(false);
    setSubmitting(true);

    try {
      // Calculate scores - track unanswered separately
      let correctCount = 0;
      let unansweredCount = 0;
      const unansweredQuestionIds: string[] = [];
      const difficultyBreakdown: Record<string, { correct: number; total: number; unanswered: number }> = {
        easy: { correct: 0, total: 0, unanswered: 0 },
        medium: { correct: 0, total: 0, unanswered: 0 },
        hard: { correct: 0, total: 0, unanswered: 0 },
      };

      const questionIds: string[] = [];

      for (const question of questions) {
        questionIds.push(question.id);
        const difficulty = (question.difficulty || 'medium').toLowerCase();
        if (difficultyBreakdown[difficulty]) {
          difficultyBreakdown[difficulty].total++;
        }

        const userAnswer = answers.get(question.id);

        // Check if unanswered (no answer or special marker)
        if (!userAnswer || userAnswer.answer === '__UNANSWERED__') {
          unansweredCount++;
          unansweredQuestionIds.push(question.id);
          if (difficultyBreakdown[difficulty]) {
            difficultyBreakdown[difficulty].unanswered++;
          }
          continue;
        }

        // Parse the correct answer
        const answersData = typeof question.answers === 'string'
          ? JSON.parse(question.answers)
          : question.answers;
        const correctAnswer = answersData?.correct_answer;

        // Get DI subtype for proper answer comparison
        const questionData = typeof question.question_data === 'string'
          ? JSON.parse(question.question_data)
          : question.question_data;

        const isCorrect = checkAnswerCorrectness(userAnswer.answer, correctAnswer, questionData?.di_type);

        if (isCorrect) {
          correctCount++;
          if (difficultyBreakdown[difficulty]) {
            difficultyBreakdown[difficulty].correct++;
          }
        }
      }

      // Calculate total time
      const totalTimeSeconds = Array.from(answers.values()).reduce((sum, a) => sum + a.timeSpent, 0);

      // Build per-question answers data with correctness info and unanswered tracking
      // Note: StoredAnswer uses Record<string, unknown> but the API expects Record<string, string>
      // We cast to the API's expected type since we know the actual values are strings
      const perQuestionAnswersData: Record<string, { answer: string | string[] | Record<string, string>; time_spent_seconds: number; is_correct: boolean; is_unanswered?: boolean }> = {};
      for (const question of questions) {
        const userAnswer = answers.get(question.id);

        // Handle unanswered questions
        if (!userAnswer || userAnswer.answer === '__UNANSWERED__') {
          perQuestionAnswersData[question.id] = {
            answer: '',
            time_spent_seconds: userAnswer?.timeSpent || 0,
            is_correct: false,
            is_unanswered: true,
          };
          continue;
        }

        // Parse the correct answer
        const answersDataForQ = typeof question.answers === 'string'
          ? JSON.parse(question.answers)
          : question.answers;
        const correctAnswer = answersDataForQ?.correct_answer;

        // Get DI subtype for proper answer comparison
        const questionDataForQ = typeof question.question_data === 'string'
          ? JSON.parse(question.question_data)
          : question.question_data;

        const isCorrect = checkAnswerCorrectness(userAnswer.answer, correctAnswer, questionDataForQ?.di_type);

        perQuestionAnswersData[question.id] = {
          answer: userAnswer.answer as string | string[] | Record<string, string>,
          time_spent_seconds: userAnswer.timeSpent,
          is_correct: isCorrect,
          is_unanswered: false,
        };
      }

      // Convert bookmarked questions Set to array
      const bookmarkedIds = Array.from(bookmarkedQuestions);

      // In preview mode, don't save results - just show them
      if (isPreviewMode) {
        const previewResult: GmatAssessmentResult = {
          id: 'preview',
          student_id: studentId,
          assessment_type: 'training',
          section: template.section,
          topic: template.topic || null,
          score_raw: correctCount,
          score_total: questions.length,
          score_percentage: (correctCount / questions.length) * 100,
          question_ids: questionIds,
          difficulty_breakdown: difficultyBreakdown,
          time_spent_seconds: totalTimeSeconds,
          suggested_cycle: null,
          assigned_cycle: null,
          tutor_validated: null,
          validated_by: null,
          validated_at: null,
          tutor_notes: null,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          answers_data: perQuestionAnswersData,
          bookmarked_question_ids: bookmarkedIds,
          unanswered_count: unansweredCount,
          unanswered_question_ids: unansweredQuestionIds,
        };
        setResult(previewResult);
        setTestCompleted(true);
        return;
      }

      // Save result (only for non-preview mode)
      const savedResult = await saveTrainingResult(
        studentId,
        template.id,
        template.section,
        correctCount,
        questions.length,
        questionIds,
        difficultyBreakdown,
        totalTimeSeconds,
        perQuestionAnswersData,
        bookmarkedIds,
        studentCycle ?? undefined
      );

      setResult(savedResult);
      setTestCompleted(true);

      // Clear saved progress after successful submission
      clearProgress();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  }

  // Convert stored answer format to UnifiedAnswer for QuestionRenderer
  function toUnifiedAnswer(
    storedAnswer: string | string[] | Record<string, unknown> | undefined,
    questionData: Record<string, unknown>
  ): UnifiedAnswer {
    if (!storedAnswer) return {};

    const diType = questionData.di_type as string | undefined;

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
        // Multiple choice or other
        return { answer: storedAnswer as string };
    }
  }

  // Convert UnifiedAnswer back to stored format for handleAnswer
  function fromUnifiedAnswer(
    unifiedAnswer: UnifiedAnswer,
    questionData: Record<string, unknown>
  ): string | string[] | Record<string, string> {
    const diType = questionData.di_type as string | undefined;

    switch (diType) {
      case 'DS':
        return unifiedAnswer.answer || '';
      case 'MSR':
        return unifiedAnswer.msrAnswers || [];
      case 'GI':
        return [unifiedAnswer.blank1 || '', unifiedAnswer.blank2 || ''];
      case 'TA':
        return unifiedAnswer.taAnswers as unknown as Record<string, string> || {};
      case 'TPA':
        return { col1: unifiedAnswer.column1 || '', col2: unifiedAnswer.column2 || '' };
      default:
        return unifiedAnswer.answer || '';
    }
  }

  // Handle answer change from QuestionRenderer
  function handleQuestionRendererAnswer(questionId: string, unifiedAnswer: UnifiedAnswer) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const questionData = typeof question.question_data === 'string'
      ? JSON.parse(question.question_data)
      : question.question_data;

    const storedAnswer = fromUnifiedAnswer(unifiedAnswer, questionData);
    handleAnswer(questionId, storedAnswer);
  }

  // Render question component using QuestionRenderer
  function renderQuestion(question: Question) {
    const questionData = typeof question.question_data === 'string'
      ? JSON.parse(question.question_data)
      : question.question_data;

    const storedAnswer = answers.get(question.id)?.answer;
    const unifiedAnswer = toUnifiedAnswer(storedAnswer, questionData);

    return (
      <QuestionRenderer
        question={{
          ...question,
          question_data: questionData,
        }}
        currentAnswer={unifiedAnswer}
        onAnswerChange={handleQuestionRendererAnswer}
      />
    );
  }

  // Check if current question has an answer
  const currentQuestion = questions[currentIndex];
  const hasCurrentAnswer = currentQuestion && answers.has(currentQuestion.id);
  const isCurrentBookmarked = currentQuestion && bookmarkedQuestions.has(currentQuestion.id);
  const allQuestionsAnswered = questions.length > 0 && answers.size === questions.length;
  const bookmarkedCount = bookmarkedQuestions.size;

  // Detect passage-based questions to widen the container for split-panel layout
  const currentQuestionData = currentQuestion?.question_data
    ? (typeof currentQuestion.question_data === 'string' ? JSON.parse(currentQuestion.question_data) : currentQuestion.question_data)
    : null;
  const hasPassage = !!currentQuestionData?.passage_text;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-brand-green animate-spin mb-4" />
          <p className="text-gray-600">Loading training test...</p>
        </div>
      </div>
    );
  }

  // Resume Modal
  const resumeModal = showResumeModal && savedProgress && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faHistory} className="text-3xl text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Continue Previous Test?</h2>
          <p className="text-gray-600 text-sm">
            We found a saved progress from your previous session.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Questions Answered:</span>
              <span className="font-semibold text-gray-800 ml-2">
                {savedProgress.answers.length} / {questions.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Last Question:</span>
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
            Resume Test
          </button>
        </div>
      </div>
    </div>
  );

  // Time's Up Modal - compute unanswered count
  const answeredCount = Array.from(answers.values()).filter(a => a.answer !== '__UNANSWERED__').length;
  const unansweredCount = questions.length - answeredCount;

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Unable to Load Training</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/student/gmat-preparation')}
              className="px-6 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Back to GMAT Preparation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test completed state - Enhanced results view matching GMATAssessmentResultsPage
  // Students see only a submission confirmation; tutors (preview mode) see full results
  if (testCompleted && result) {
    // For students (non-preview mode): Show simple submission confirmation
    if (!isPreviewMode) {
      return (
        <Layout
          pageTitle="Training Submitted"
          pageSubtitle={template?.title || 'Complete'}
        >
          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
              {/* Success Card */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Training Submitted Successfully!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your answers for <span className="font-semibold">{template?.title}</span> have been submitted.
                </p>
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <FontAwesomeIcon icon={faClock} className="text-lg" />
                    <span className="font-medium">Results are pending tutor review</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Your tutor will review your submission and make the results available when ready.
                  </p>
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

    // For tutors (preview mode): Show full results
    const percentage = result.score_percentage;
    const isPassed = percentage >= 60;

    // Build question results with timing data
    const questionResults = questions.map((q, index) => {
      const answerData = answers.get(q.id);
      const answersObj = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
      const correctAnswer = answersObj?.correct_answer;
      const qData = typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data;
      const isCorrect = answerData && correctAnswer
        ? checkAnswerCorrectness(answerData.answer, correctAnswer, qData?.di_type)
        : false;

      return {
        question: q,
        isCorrect,
        order: index + 1,
        timeSpentSeconds: answerData?.timeSpent || 0,
        isBookmarked: bookmarkedQuestions.has(q.id),
        studentAnswer: answerData?.answer,
      };
    });

    // Calculate stats
    const correctCount = questionResults.filter(r => r.isCorrect).length;
    const wrongCount = questionResults.filter(r => !r.isCorrect).length;
    const bookmarkedCount = questionResults.filter(r => r.isBookmarked).length;

    // Pacing calculations
    const expectedTimePerQuestion = 120; // 2 minutes per question
    const questionsWithTime = questionResults.filter(r => r.timeSpentSeconds > 0);
    const maxTime = Math.max(...questionsWithTime.map(r => r.timeSpentSeconds), expectedTimePerQuestion);
    const fastQuestions = questionsWithTime.filter(r => r.timeSpentSeconds < expectedTimePerQuestion * 0.5).length;
    const slowQuestions = questionsWithTime.filter(r => r.timeSpentSeconds > expectedTimePerQuestion * 1.5).length;
    const onPaceQuestions = questionsWithTime.length - fastQuestions - slowQuestions;

    // Cumulative pacing data
    let cumulativeActual = 0;
    const pacingData = questionResults.map((r, i) => {
      cumulativeActual += r.timeSpentSeconds;
      return {
        question: i + 1,
        actual: cumulativeActual,
        expected: (i + 1) * expectedTimePerQuestion,
      };
    });

    // Filter questions for display
    const filteredQuestions = questionResults.filter(r => {
      if (resultsFilterCorrectness === 'correct' && !r.isCorrect) return false;
      if (resultsFilterCorrectness === 'wrong' && r.isCorrect) return false;
      if (resultsFilterBookmarked && !r.isBookmarked) return false;
      return true;
    });

    // Render question component for results using QuestionRenderer
    const renderResultQuestion = (qResult: typeof questionResults[0]) => {
      const { question, studentAnswer } = qResult;
      const questionData = question.question_data;

      // Convert studentAnswer to UnifiedAnswer format for results view
      const unifiedAnswer = toUnifiedAnswer(studentAnswer, questionData);

      return (
        <QuestionRenderer
          question={{
            ...question,
            question_data: questionData,
          }}
          currentAnswer={unifiedAnswer}
          onAnswerChange={() => {}} // No-op for results view
          showResults={true}
          readOnly={true}
          explanation={questionData?.explanation}
        />
      );
    };

    return (
      <Layout
        pageTitle={isPreviewMode ? 'Preview Complete' : 'Training Complete'}
        pageSubtitle={template?.title || 'Results'}
      >
        <MathJaxProvider>
          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Back Button */}
              <button
                onClick={() => navigate('/student/gmat-preparation')}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to GMAT Preparation
              </button>

              {/* Preview Mode Notice */}
              {isPreviewMode && (
                <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-3">
                  <FontAwesomeIcon icon={faEye} className="text-amber-600 text-xl" />
                  <div>
                    <h3 className="font-semibold text-amber-800">Preview Results</h3>
                    <p className="text-sm text-amber-700">These results were not saved since you are in preview mode.</p>
                  </div>
                </div>
              )}

              {/* Results Summary Card */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl ${isPassed ? 'bg-green-100' : 'bg-amber-100'} flex items-center justify-center`}>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={`text-2xl ${isPassed ? 'text-green-600' : 'text-amber-600'}`}
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {isPreviewMode ? 'Preview Complete!' : 'Training Complete!'}
                    </h1>
                    <p className="text-gray-500">
                      {template?.title} - {studentCycle} Cycle
                    </p>
                  </div>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600">
                      {result.score_raw}/{result.score_total}
                    </div>
                    <div className="text-sm text-gray-600">Raw Score</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className={`text-3xl font-bold ${isPassed ? 'text-blue-600' : 'text-amber-600'}`}>
                      {percentage.toFixed(0)}%
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
                      {result.time_spent_seconds && questions.length > 0
                        ? Math.round(result.time_spent_seconds / questions.length)
                        : '-'}s
                    </div>
                    <div className="text-sm text-gray-600">Avg per Question</div>
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                {result.difficulty_breakdown && (
                  <div className="border-t-2 border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Performance by Difficulty</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                        const data = result.difficulty_breakdown?.[difficulty];
                        if (!data || data.total === 0) return null;
                        const pct = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                        const color = difficulty === 'easy' ? 'green' : difficulty === 'medium' ? 'amber' : 'red';
                        return (
                          <div key={difficulty} className={`p-3 bg-${color}-50 rounded-lg`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-medium text-${color}-700 capitalize`}>{difficulty}</span>
                              <span className={`text-sm font-bold text-${color}-600`}>
                                {data.correct}/{data.total}
                              </span>
                            </div>
                            <div className={`w-full bg-${color}-200 rounded-full h-2`}>
                              <div
                                className={`bg-${color}-500 h-2 rounded-full transition-all`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                          {questionResults.map((qr) => {
                            const isSlower = qr.timeSpentSeconds > expectedTimePerQuestion * 1.5;
                            const isFaster = qr.timeSpentSeconds < expectedTimePerQuestion * 0.5;
                            return (
                              <div
                                key={qr.question.id}
                                className={`p-3 rounded-lg border ${
                                  qr.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Q{qr.order}</span>
                                    <FontAwesomeIcon
                                      icon={qr.isCorrect ? faCheckCircle : faTimesCircle}
                                      className={qr.isCorrect ? 'text-green-600' : 'text-red-600'}
                                    />
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
                                  {qr.question.section} • {qr.question.difficulty || 'Unknown'}
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

                      {showResultsPacingCharts && (
                        <>
                          {/* Bar chart */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Time per Question</span>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                                  Expected ({expectedTimePerQuestion}s)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-end gap-1 h-24 bg-gray-50 rounded-lg p-2 overflow-x-auto">
                              {questionResults.map((qr, i) => {
                                const heightPercent = Math.min((qr.timeSpentSeconds / maxTime) * 100, 100);
                                const expectedHeightPercent = Math.min((expectedTimePerQuestion / maxTime) * 100, 100);
                                const isOverTime = qr.timeSpentSeconds > expectedTimePerQuestion;
                                const isFast = qr.timeSpentSeconds < expectedTimePerQuestion * 0.5;
                                return (
                                  <div key={qr.question.id} className="flex-1 min-w-[20px] max-w-[40px] flex flex-col items-center relative group">
                                    <div
                                      className="absolute w-full border-t-2 border-dashed border-blue-400 z-10"
                                      style={{ bottom: `${expectedHeightPercent}%` }}
                                    />
                                    <div
                                      className={`w-full rounded-t transition-all cursor-pointer ${
                                        qr.isCorrect
                                          ? isOverTime ? 'bg-amber-400' : isFast ? 'bg-green-400' : 'bg-green-500'
                                          : isOverTime ? 'bg-red-400' : isFast ? 'bg-red-300' : 'bg-red-500'
                                      }`}
                                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                                    />
                                    <span className="text-[8px] text-gray-400 mt-0.5">{i + 1}</span>
                                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">
                                      Q{i + 1}: {qr.timeSpentSeconds}s {qr.isCorrect ? '✓' : '✗'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Cumulative Pacing Chart */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Cumulative Pacing</span>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                  <div className="w-8 h-0.5 bg-blue-500"></div>
                                  Expected
                                </span>
                                <span className="flex items-center gap-1">
                                  <div className="w-8 h-0.5 bg-purple-500"></div>
                                  Actual
                                </span>
                              </div>
                            </div>
                            <div className="relative h-20 bg-gray-50 rounded-lg p-2">
                              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-gray-400 pr-1">
                                <span>{Math.round((pacingData[pacingData.length - 1]?.expected || 0) / 60)}m</span>
                                <span>0m</span>
                              </div>
                              <div className="ml-12 h-full relative">
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                  <line x1="0" y1="100%" x2="100%" y2="0" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 2" />
                                </svg>
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                  <polyline
                                    fill="none"
                                    stroke="#8B5CF6"
                                    strokeWidth="2"
                                    points={pacingData.map((d, i) => {
                                      const x = (i / (pacingData.length - 1 || 1)) * 100;
                                      const maxExp = pacingData[pacingData.length - 1]?.expected || 1;
                                      const y = 100 - (d.actual / maxExp) * 100;
                                      return `${x}%,${Math.max(0, Math.min(100, y))}%`;
                                    }).join(' ')}
                                  />
                                </svg>
                                <div className="absolute right-0 top-0 text-xs">
                                  {cumulativeActual < (pacingData[pacingData.length - 1]?.expected || 0) * 0.9 ? (
                                    <span className="text-green-600 font-medium">Ahead of pace</span>
                                  ) : cumulativeActual > (pacingData[pacingData.length - 1]?.expected || 0) * 1.1 ? (
                                    <span className="text-red-600 font-medium">Behind pace</span>
                                  ) : (
                                    <span className="text-blue-600 font-medium">On pace</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Questions Review Section */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faList} className="text-purple-600 text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Question Review</h2>
                      <p className="text-sm text-gray-500">Review your answers and explanations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResultsQuestions(!showResultsQuestions)}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    {showResultsQuestions ? 'Hide Questions' : 'Show Questions'}
                  </button>
                </div>

                {showResultsQuestions && (
                  <>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setResultsFilterCorrectness('all')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            resultsFilterCorrectness === 'all'
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setResultsFilterCorrectness('correct')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                            resultsFilterCorrectness === 'correct'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                          {correctCount}
                        </button>
                        <button
                          onClick={() => setResultsFilterCorrectness('wrong')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                            resultsFilterCorrectness === 'wrong'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                          {wrongCount}
                        </button>
                      </div>
                      {bookmarkedCount > 0 && (
                        <button
                          onClick={() => setResultsFilterBookmarked(!resultsFilterBookmarked)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                            resultsFilterBookmarked
                              ? 'bg-amber-500 text-white'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                          {bookmarkedCount} Bookmarked
                        </button>
                      )}
                      <div className="text-sm text-gray-500 ml-auto">
                        Showing {filteredQuestions.length} of {questionResults.length} questions
                      </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-6">
                      {filteredQuestions.map((qr) => (
                        <div
                          key={qr.question.id}
                          className={`rounded-2xl border-2 overflow-hidden ${
                            qr.isCorrect ? 'border-green-200' : 'border-red-200'
                          }`}
                        >
                          <div className={`px-6 py-4 border-b flex items-center justify-between ${
                            qr.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-gray-800">Q{qr.order}</span>
                              <FontAwesomeIcon
                                icon={qr.isCorrect ? faCheckCircle : faTimesCircle}
                                className={qr.isCorrect ? 'text-green-600' : 'text-red-600'}
                              />
                              {qr.isBookmarked && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                                  <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                                  Bookmarked
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                                {qr.question.section}
                              </span>
                              {qr.question.difficulty && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  qr.question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  qr.question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {qr.question.difficulty}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <FontAwesomeIcon icon={faClock} className="text-xs" />
                              <span className="font-medium">{qr.timeSpentSeconds}s</span>
                            </div>
                          </div>
                          <div className="p-6 bg-white">
                            {renderResultQuestion(qr)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Back to Preparation Button */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/student/gmat-preparation')}
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

  // Pre-test state (not started)
  if (!testStarted) {
    const materialTypeLabel = MATERIAL_TYPE_LABELS[template?.material_type as keyof typeof MATERIAL_TYPE_LABELS] || template?.material_type;

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {/* Resume Modal */}
        {resumeModal}
        {/* Time's Up Modal */}
        <TimeUpModal
          isOpen={showTimeUpModal}
          onSubmit={submitTest}
          isSubmitting={submitting}
          unansweredCount={unansweredCount}
          totalQuestions={questions.length}
        />

        <div className="max-w-2xl w-full">
          {/* Preview Mode Banner */}
          {isPreviewMode && (
            <div className="mb-4 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-3">
              <FontAwesomeIcon icon={faEye} className="text-amber-600 text-xl" />
              <div>
                <h3 className="font-semibold text-amber-800">Preview Mode</h3>
                <p className="text-sm text-amber-700">You are previewing this test. Results will not be saved.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{materialTypeLabel}</h1>
              <p className="text-gray-600">{template?.topic} - {template?.section}</p>
              <div className="inline-block mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
                {studentCycle} Cycle{isPreviewMode && ' (Preview)'}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Questions</span>
                <span className="font-bold text-gray-800">{questions.length}</span>
              </div>
              {template?.question_requirements?.time_limit_minutes && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Time Limit</span>
                  <span className="font-bold text-gray-800">{template.question_requirements.time_limit_minutes} minutes</span>
                </div>
              )}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <span className="text-blue-700">Navigation</span>
                <span className="font-medium text-blue-800 text-sm">Forward only (answer to continue)</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <span className="text-amber-700">
                  <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                  Bookmark Feature
                </span>
                <span className="font-medium text-amber-800 text-sm">Mark questions for review</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startTest}
                className="px-8 py-4 bg-brand-green text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                {isPreviewMode ? 'Start Preview' : 'Start Training'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review Phase UI
  if (inReviewPhase) {
    const filteredQuestions = reviewFilter === 'bookmarked'
      ? questions.filter(q => bookmarkedQuestions.has(q.id))
      : questions;

    return (
      <MathJaxProvider>
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
          {/* Preview Mode Indicator - Minimal */}
          {isPreviewMode && (
            <div className="bg-amber-400 text-amber-900 px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faEye} />
              Preview Mode
            </div>
          )}

          {/* Review Content - Scrollable area */}
          <div className="flex-1 overflow-auto p-4">
            <div className={`${hasPassage ? 'max-w-7xl' : 'max-w-4xl'} mx-auto`}>
              {/* Compact Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <FontAwesomeIcon icon={faList} />
                  <span className="font-semibold text-sm">Review Phase</span>
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
                    All ({questions.length})
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
                    {bookmarkedCount}
                  </button>
                </div>
              </div>

              {/* Question Grid - Compact */}
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
                {filteredQuestions.map((q) => {
                  const actualIndex = questions.findIndex(question => question.id === q.id);
                  const isAnswered = answers.has(q.id);
                  const isBookmarked = bookmarkedQuestions.has(q.id);
                  const isCurrent = actualIndex === currentIndex;

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

              {filteredQuestions.length === 0 && reviewFilter === 'bookmarked' && (
                <div className="bg-white rounded-xl p-6 text-center">
                  <FontAwesomeIcon icon={faTag} className="text-3xl text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No bookmarked questions</p>
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
                        Q{currentIndex + 1}
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

          {/* Bottom Bar - Compact */}
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
                  <span className="font-semibold text-gray-700">{answers.size}</span>/{questions.length}
                </span>
              </div>

              {/* Right: Calculator + Submit button */}
              <div className="flex items-center gap-2">
                {/* Calculator button - only for DI section */}
                {currentQuestion?.section === 'Data Insights' && (
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
                  onClick={submitTest}
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
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Calculator for Data Insights section */}
          {currentQuestion?.section === 'Data Insights' && (
            <GMATCalculator
              isOpen={showCalculator}
              onClose={() => setShowCalculator(false)}
            />
          )}
        </div>
      </MathJaxProvider>
    );
  }

  // Test in progress (normal phase)

  return (
    <MathJaxProvider>
      {/* Time's Up Modal */}
      <TimeUpModal
        isOpen={showTimeUpModal}
        onSubmit={submitTest}
        isSubmitting={submitting}
        unansweredCount={unansweredCount}
        totalQuestions={questions.length}
      />

      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
        {/* Preview Mode Indicator - Minimal */}
        {isPreviewMode && (
          <div className="bg-amber-400 text-amber-900 px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faEye} />
            Preview Mode
          </div>
        )}

        {/* Question Content - Takes all available space */}
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
                {/* Compact Question Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm">
                      Q{currentIndex + 1}
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
                    title={isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark for review'}
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

        {/* Bottom Navigation - Compact single-row layout */}
        <div className="bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            {/* Left: Timer */}
            <TestTimerCompact
              timeRemaining={timeRemaining}
              warningThreshold={600}
              dangerThreshold={300}
              className="px-2 py-1 rounded-lg text-sm font-semibold shrink-0 bg-gray-100"
            />

            {/* Center: Question Pills - horizontal scroll */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1 scrollbar-thin">
              {questions.map((q, i) => {
                const isAnswered = answers.has(q.id);
                const isCurrent = i === currentIndex;
                const isBookmarked = bookmarkedQuestions.has(q.id);
                const canAccess = i <= currentIndex || inReviewPhase;

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
                    {isBookmarked && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Stats + Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Calculator button - only for DI section */}
              {currentQuestion?.section === 'Data Insights' && (
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
                <span><span className="font-semibold text-gray-700">{answeredCount}</span>/{questions.length}</span>
                {bookmarkedCount > 0 && (
                  <span className="text-amber-600 flex items-center gap-0.5">
                    <FontAwesomeIcon icon={faBookmark} className="text-[10px]" />
                    {bookmarkedCount}
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
              {allQuestionsAnswered && currentIndex === questions.length - 1 ? (
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

        {/* Calculator for Data Insights section */}
        {currentQuestion?.section === 'Data Insights' && (
          <GMATCalculator
            isOpen={showCalculator}
            onClose={() => setShowCalculator(false)}
          />
        )}
      </div>
    </MathJaxProvider>
  );
}
