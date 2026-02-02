/**
 * GMAT Training Test Page
 * Specialized page for taking GMAT training tests from allocated templates
 * - Fetches questions based on template allocation and student's cycle
 * - Saves results to 2V_gmat_assessment_results
 * - Simpler than TakeTestPage - no complex configuration
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faClock,
  faCheckCircle,
  faSpinner,
  faExclamationTriangle,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/auth';
import { MathJaxProvider } from '../components/MathJaxRenderer';
import { DSQuestion } from '../components/questions/DSQuestion';
import { MSRQuestion } from '../components/questions/MSRQuestion';
import { GIQuestion } from '../components/questions/GIQuestion';
import { TAQuestion } from '../components/questions/TAQuestion';
import { TPAQuestion } from '../components/questions/TPAQuestion';
import { MultipleChoiceQuestion } from '../components/questions/MultipleChoiceQuestion';
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

interface Answer {
  questionId: string;
  answer: string | string[] | Record<string, string>;
  timeSpent: number;
}

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
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GmatAssessmentResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [studentId, setStudentId] = useState<string | null>(null);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load template and questions
  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [templateId]);

  // Timer countdown
  useEffect(() => {
    if (testStarted && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [testStarted, timeRemaining]);

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
        cycleToUse = progress.gmat_cycle;
        setStudentCycle(cycleToUse);

        // Get allocated question IDs for student's cycle
        allocatedIds = await getAllocatedQuestionIds(templateId, cycleToUse);
        if (!allocatedIds || allocatedIds.length === 0) {
          setError(`No questions have been allocated for your ${cycleToUse} cycle. Please contact your tutor.`);
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

      // Set time limit
      if (templateDetails.question_requirements?.time_limit_minutes) {
        setTimeRemaining(templateDetails.question_requirements.time_limit_minutes * 60);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training');
    } finally {
      setLoading(false);
    }
  }

  function handleTimeUp() {
    // Auto-submit when time is up
    submitTest();
  }

  function startTest() {
    setTestStarted(true);
    setQuestionStartTime(Date.now());
  }

  function handleAnswer(questionId: string, answer: string | string[] | Record<string, string>) {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    setAnswers(prev => new Map(prev).set(questionId, {
      questionId,
      answer,
      timeSpent,
    }));
  }

  function goToQuestion(index: number) {
    // Save time for current question
    const currentQuestion = questions[currentIndex];
    if (currentQuestion) {
      const existingAnswer = answers.get(currentQuestion.id);
      if (existingAnswer) {
        const additionalTime = Math.round((Date.now() - questionStartTime) / 1000);
        setAnswers(prev => new Map(prev).set(currentQuestion.id, {
          ...existingAnswer,
          timeSpent: existingAnswer.timeSpent + additionalTime,
        }));
      }
    }

    setCurrentIndex(index);
    setQuestionStartTime(Date.now());
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }

  async function submitTest() {
    if (submitting || !studentId || !template) return;

    setSubmitting(true);

    try {
      // Calculate scores
      let correctCount = 0;
      const difficultyBreakdown: Record<string, { correct: number; total: number }> = {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
      };

      const questionIds: string[] = [];

      for (const question of questions) {
        questionIds.push(question.id);
        const difficulty = (question.difficulty || 'medium').toLowerCase();
        if (difficultyBreakdown[difficulty]) {
          difficultyBreakdown[difficulty].total++;
        }

        const userAnswer = answers.get(question.id);
        if (!userAnswer) continue;

        // Parse the correct answer
        const answersData = typeof question.answers === 'string'
          ? JSON.parse(question.answers)
          : question.answers;
        const correctAnswer = answersData?.correct_answer;

        // Check if answer is correct
        let isCorrect = false;
        if (typeof correctAnswer === 'string' && typeof userAnswer.answer === 'string') {
          isCorrect = userAnswer.answer.toLowerCase() === correctAnswer.toLowerCase();
        } else if (Array.isArray(correctAnswer) && Array.isArray(userAnswer.answer)) {
          isCorrect = JSON.stringify(userAnswer.answer.sort()) === JSON.stringify(correctAnswer.sort());
        } else if (typeof correctAnswer === 'object' && typeof userAnswer.answer === 'object') {
          isCorrect = JSON.stringify(userAnswer.answer) === JSON.stringify(correctAnswer);
        }

        if (isCorrect) {
          correctCount++;
          if (difficultyBreakdown[difficulty]) {
            difficultyBreakdown[difficulty].correct++;
          }
        }
      }

      // Calculate total time
      const totalTimeSeconds = Array.from(answers.values()).reduce((sum, a) => sum + a.timeSpent, 0);

      // In preview mode, don't save results - just show them
      if (isPreviewMode) {
        const previewResult: GmatAssessmentResult = {
          id: 'preview',
          student_id: studentId,
          assessment_type: 'training',
          section: template.section,
          score_raw: correctCount,
          score_total: questions.length,
          score_percentage: (correctCount / questions.length) * 100,
          question_ids: questionIds,
          difficulty_breakdown: difficultyBreakdown,
          time_spent_seconds: totalTimeSeconds,
          completed_at: new Date().toISOString(),
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
        totalTimeSeconds
      );

      setResult(savedResult);
      setTestCompleted(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  }

  // Format time as MM:SS
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Render question component based on type
  function renderQuestion(question: Question) {
    const questionData = typeof question.question_data === 'string'
      ? JSON.parse(question.question_data)
      : question.question_data;

    const currentAnswer = answers.get(question.id)?.answer;

    // Data Insights question types
    if (questionData.di_type === 'DS') {
      return (
        <DSQuestion
          problem={questionData.problem || ''}
          statement1={questionData.statement1 || ''}
          statement2={questionData.statement2 || ''}
          selectedAnswer={currentAnswer as string}
          onAnswerChange={(answer: string) => handleAnswer(question.id, answer)}
        />
      );
    }

    if (questionData.di_type === 'MSR') {
      const msrAnswers = currentAnswer as string[] || [];
      return (
        <MSRQuestion
          sources={questionData.sources || []}
          questions={questionData.questions || []}
          selectedAnswers={msrAnswers}
          onAnswerChange={(questionIndex: number, answer: string) => {
            const newAnswers = [...msrAnswers];
            newAnswers[questionIndex] = answer;
            handleAnswer(question.id, newAnswers);
          }}
        />
      );
    }

    if (questionData.di_type === 'GI') {
      const giAnswers = currentAnswer as string[] || ['', ''];
      return (
        <GIQuestion
          chartConfig={questionData.chart_config}
          contextText={questionData.context_text}
          statementText={questionData.statement_text || ''}
          blank1Options={questionData.blank1_options || []}
          blank2Options={questionData.blank2_options || []}
          imageUrl={questionData.image_url}
          selectedBlank1={giAnswers[0]}
          selectedBlank2={giAnswers[1]}
          onBlank1Change={(value: string) => {
            handleAnswer(question.id, [value, giAnswers[1] || '']);
          }}
          onBlank2Change={(value: string) => {
            handleAnswer(question.id, [giAnswers[0] || '', value]);
          }}
        />
      );
    }

    if (questionData.di_type === 'TA') {
      const taAnswers = currentAnswer as Record<number, 'true' | 'false'> || {};
      return (
        <TAQuestion
          tableTitle={questionData.table_title}
          columnHeaders={questionData.column_headers || []}
          tableData={questionData.table_data || []}
          statements={questionData.statements || []}
          selectedAnswers={taAnswers}
          onAnswerChange={(statementIndex: number, value: 'true' | 'false') => {
            const newAnswers = { ...taAnswers, [statementIndex]: value };
            handleAnswer(question.id, newAnswers as unknown as Record<string, string>);
          }}
        />
      );
    }

    if (questionData.di_type === 'TPA') {
      const tpaAnswers = currentAnswer as Record<string, string> || {};
      return (
        <TPAQuestion
          scenario={questionData.scenario || ''}
          column1Title={questionData.column1_title || ''}
          column2Title={questionData.column2_title || ''}
          sharedOptions={questionData.shared_options || []}
          selectedColumn1={tpaAnswers.col1}
          selectedColumn2={tpaAnswers.col2}
          onColumn1Change={(value: string) => {
            handleAnswer(question.id, { ...tpaAnswers, col1: value });
          }}
          onColumn2Change={(value: string) => {
            handleAnswer(question.id, { ...tpaAnswers, col2: value });
          }}
        />
      );
    }

    // Standard multiple choice
    return (
      <MultipleChoiceQuestion
        questionText={questionData.question_text || ''}
        options={questionData.options || {}}
        imageUrl={questionData.image_url}
        imageOptions={questionData.image_options}
        selectedAnswer={currentAnswer as string}
        onAnswerChange={(answer: string) => handleAnswer(question.id, answer)}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <Layout pageTitle="GMAT Training" pageSubtitle="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-brand-green animate-spin mb-4" />
            <p className="text-gray-600">Loading training test...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout pageTitle="GMAT Training" pageSubtitle="Error">
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
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
      </Layout>
    );
  }

  // Test completed state
  if (testCompleted && result) {
    const percentage = result.score_percentage;
    const isPassed = percentage >= 60;

    return (
      <Layout pageTitle="Training Complete" pageSubtitle={template?.title || 'GMAT Training'}>
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Preview Mode Notice */}
            {isPreviewMode && (
              <div className="mb-4 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-3">
                <FontAwesomeIcon icon={faEye} className="text-amber-600 text-xl" />
                <div>
                  <h3 className="font-semibold text-amber-800">Preview Results</h3>
                  <p className="text-sm text-amber-700">These results were not saved since you are in preview mode.</p>
                </div>
              </div>
            )}

            <div className={`${isPassed ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} border-2 rounded-2xl p-8 text-center`}>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={`text-6xl ${isPassed ? 'text-green-500' : 'text-amber-500'} mb-4`}
              />
              <h2 className={`text-2xl font-bold ${isPassed ? 'text-green-700' : 'text-amber-700'} mb-2`}>
                {isPreviewMode ? 'Preview Complete!' : 'Training Complete!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {template?.title} - {studentCycle} Cycle{isPreviewMode && ' (Preview)'}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-bold text-gray-800">
                    {result.score_raw}/{result.score_total}
                  </div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-amber-600'}`}>
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-bold text-gray-800">
                    {result.time_spent_seconds ? Math.round(result.time_spent_seconds / 60) : '-'}m
                  </div>
                  <div className="text-sm text-gray-500">Time</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/student/gmat-preparation')}
                  className="px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Back to Preparation
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Pre-test state (not started)
  if (!testStarted) {
    const materialTypeLabel = MATERIAL_TYPE_LABELS[template?.material_type as keyof typeof MATERIAL_TYPE_LABELS] || template?.material_type;

    return (
      <Layout pageTitle="GMAT Training" pageSubtitle={template?.title || ''}>
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
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
      </Layout>
    );
  }

  // Test in progress
  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.size;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <MathJaxProvider>
      <Layout pageTitle="GMAT Training" pageSubtitle={`Question ${currentIndex + 1} of ${questions.length}`}>
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* Preview Mode Indicator */}
          {isPreviewMode && (
            <div className="bg-amber-400 text-amber-900 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faEye} />
              Preview Mode - Results will not be saved
            </div>
          )}

          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-800">
                Q{currentIndex + 1}/{questions.length}
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-green h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                <FontAwesomeIcon icon={faClock} />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            )}

            <div className="text-sm text-gray-500">
              {answeredCount} answered
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              {currentQuestion && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  {renderQuestion(currentQuestion)}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-white border-t border-gray-200 px-4 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Previous
              </button>

              {/* Question Navigator */}
              <div className="flex gap-1 overflow-x-auto max-w-[50%]">
                {questions.map((q, i) => {
                  const isAnswered = answers.has(q.id);
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(i)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'bg-brand-green text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={submitTest}
                  disabled={submitting}
                  className="px-6 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  Next
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </MathJaxProvider>
  );
}
