/**
 * GMAT Assessment Results Page
 * Displays results for GMAT Section Assessments and Mock Simulations
 * Uses the 2V_gmat_assessment_results table which stores question_ids
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faChartLine,
  faGraduationCap,
  faBookmark,
  faTag,
  faStopwatch,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { MathJaxProvider } from '../components/MathJaxRenderer';
import { supabase } from '../lib/supabase';
import { DSQuestion } from '../components/questions/DSQuestion';
import { MSRQuestion } from '../components/questions/MSRQuestion';
import { GIQuestion } from '../components/questions/GIQuestion';
import { TAQuestion } from '../components/questions/TAQuestion';
import { TPAQuestion } from '../components/questions/TPAQuestion';
import { MultipleChoiceQuestion } from '../components/questions/MultipleChoiceQuestion';
import { LaTeX } from '../components/LaTeX';
import {
  calculateEstimatedGmatScore,
  SECTION_ASSESSMENT_CONFIG,
  type GmatSection,
  type GmatAssessmentResult,
  type GmatAssessmentType,
  type GmatCycle,
} from '../lib/api/gmat';

interface Question {
  id: string;
  section: string;
  difficulty?: string;
  question_type: string;
  question_data: any;
  answers: any;
  topic?: string;
}

interface QuestionResult {
  question: Question;
  isCorrect: boolean;
  order: number;
  timeSpentSeconds?: number;
  isBookmarked?: boolean;
  studentAnswer?: string | string[] | Record<string, string>;
}

export default function GMATAssessmentResultsPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const isEnglish = i18n.language === 'en';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<GmatAssessmentResult | null>(null);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterCorrectness, setFilterCorrectness] = useState<'all' | 'correct' | 'wrong'>('all');
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [showTimeReport, setShowTimeReport] = useState(false);
  const [showPacingCharts, setShowPacingCharts] = useState(false);

  useEffect(() => {
    loadAssessmentResults();
  }, [assessmentId]);

  async function loadAssessmentResults() {
    try {
      setLoading(true);
      setError(null);

      if (!assessmentId) {
        throw new Error('Assessment ID is required');
      }

      // Load assessment result
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('2V_gmat_assessment_results')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) throw assessmentError;
      if (!assessmentData) throw new Error('Assessment not found');

      const result: GmatAssessmentResult = {
        ...assessmentData,
        assessment_type: assessmentData.assessment_type as GmatAssessmentType,
        suggested_cycle: assessmentData.suggested_cycle as GmatCycle | null,
        assigned_cycle: assessmentData.assigned_cycle as GmatCycle | null,
        difficulty_breakdown: assessmentData.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
        answers_data: assessmentData.answers_data as GmatAssessmentResult['answers_data'],
        bookmarked_question_ids: assessmentData.bookmarked_question_ids as string[] | null,
      };

      setAssessment(result);

      // Get answers_data and bookmarks from the assessment
      const answersData = assessmentData.answers_data as Record<string, { answer: any; time_spent_seconds: number; is_correct: boolean }> | null;
      const bookmarkedIds = new Set(assessmentData.bookmarked_question_ids || []);

      // Load questions if question_ids are available
      if (assessmentData.question_ids && assessmentData.question_ids.length > 0) {
        const { data: questionsData, error: questionsError } = await supabase
          .from('2V_questions')
          .select('*')
          .in('id', assessmentData.question_ids);

        if (questionsError) throw questionsError;

        // Create a map for ordering questions by their position in question_ids
        const orderMap = new Map(
          assessmentData.question_ids.map((id: string, index: number) => [id, index])
        );

        // Sort questions by their original order
        const sortedQuestions = (questionsData || []).sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? 999;
          const orderB = orderMap.get(b.id) ?? 999;
          return orderA - orderB;
        });

        // Map to question results with per-question answer data
        const questionResults: QuestionResult[] = sortedQuestions.map((q, index) => {
          const answerData = answersData?.[q.id];
          const question: Question = {
            id: q.id,
            section: q.section,
            difficulty: q.difficulty ?? undefined,
            question_type: q.question_type,
            question_data: typeof q.question_data === 'string'
              ? JSON.parse(q.question_data)
              : q.question_data,
            answers: typeof q.answers === 'string'
              ? JSON.parse(q.answers)
              : q.answers,
            topic: q.topic ?? undefined,
          };
          return {
            question,
            isCorrect: answerData?.is_correct ?? true, // Use stored correctness or default to true
            order: index + 1,
            timeSpentSeconds: answerData?.time_spent_seconds,
            isBookmarked: bookmarkedIds.has(q.id),
            studentAnswer: answerData?.answer,
          };
        });

        setQuestions(questionResults);
      }
    } catch (err) {
      console.error('Error loading assessment results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  // Get assessment type label
  function getAssessmentTypeLabel(type: GmatAssessmentType): string {
    switch (type) {
      case 'placement':
        return 'Placement Assessment';
      case 'section_assessment':
        return 'Section Assessment';
      case 'mock':
        return 'Mock Simulation';
      case 'topic_assessment':
        return 'Topic Assessment';
      case 'training':
        return 'Training';
      default:
        return type;
    }
  }

  // Get section full name
  function getSectionFullName(section: GmatSection | string | null): string {
    if (!section) return 'Full Test';
    const config = SECTION_ASSESSMENT_CONFIG[section as GmatSection];
    return config?.fullName || section;
  }

  // Format topic name (converts 01-data-sufficiency to Data Sufficiency)
  function formatTopicName(topic: string | null | undefined): string {
    if (!topic) return '';
    // Remove number prefix (e.g., "01-") and convert to title case
    const withoutPrefix = topic.replace(/^\d+-/, '');
    return withoutPrefix
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Get question category from question_data
  function getQuestionCategory(questionData: any): string | null {
    // Check for di_type (Data Insights questions)
    if (questionData?.di_type) {
      const diTypes: Record<string, string> = {
        'DS': 'Data Sufficiency',
        'GI': 'Graphics Interpretation',
        'TA': 'Table Analysis',
        'TPA': 'Two-Part Analysis',
        'MSR': 'Multi-Source Reasoning',
      };
      return diTypes[questionData.di_type] || questionData.di_type;
    }
    // Check for questionSubtype (e.g., "reading-comprehension")
    if (questionData?.questionSubtype) {
      return questionData.questionSubtype
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    // Check for categories array (GMAT questions have this)
    if (questionData?.categories && Array.isArray(questionData.categories) && questionData.categories.length > 0) {
      // Return first two categories joined (e.g., "Arithmetic • Properties of numbers")
      return questionData.categories.slice(0, 2).join(' • ');
    }
    // Check for category field
    if (questionData?.category) {
      return questionData.category;
    }
    // Check for question_category field
    if (questionData?.question_category) {
      return questionData.question_category;
    }
    return null;
  }

  // Render a question component
  function renderQuestion(result: QuestionResult) {
    const { question } = result;
    const questionData = question.question_data;
    const answersData = question.answers;

    // No-op for read-only mode
    const noOp = () => {};

    // Detect Data Insights sub-type
    const diType = questionData?.di_type || questionData?.diType;

    // Data Sufficiency
    if (diType === 'DS') {
      const studentAnswer = typeof result.studentAnswer === 'string' ? result.studentAnswer : undefined;
      return (
        <DSQuestion
          problem={questionData.problem || ''}
          statement1={questionData.statement1 || ''}
          statement2={questionData.statement2 || ''}
          selectedAnswer={studentAnswer}
          correctAnswer={answersData?.correct_answer?.[0] || answersData?.correct_answer}
          onAnswerChange={noOp}
          readOnly={true}
          showResults={true}
          explanation={questionData.explanation || undefined}
        />
      );
    }

    // Multi-Source Reasoning
    if (diType === 'MSR') {
      const studentAnswers = Array.isArray(result.studentAnswer) ? result.studentAnswer : [];
      return (
        <MSRQuestion
          sources={questionData.sources || []}
          questions={questionData.questions || []}
          selectedAnswers={studentAnswers}
          onAnswerChange={noOp}
          readOnly={true}
          correctAnswers={answersData?.correct_answer || []}
          showResults={true}
          explanation={questionData.explanation || undefined}
        />
      );
    }

    // Graphics Interpretation
    if (diType === 'GI') {
      const correctAnswer = answersData?.correct_answer;
      // Student answer for GI is typically { blank1: "value", blank2: "value" }
      const studentGI = result.studentAnswer && typeof result.studentAnswer === 'object' && !Array.isArray(result.studentAnswer)
        ? result.studentAnswer as Record<string, string>
        : {};
      return (
        <GIQuestion
          chartConfig={questionData.chart_config}
          contextText={questionData.context_text}
          statementText={questionData.statement_text || ''}
          blank1Options={questionData.blank1_options || []}
          blank2Options={questionData.blank2_options || []}
          selectedBlank1={studentGI.blank1}
          selectedBlank2={studentGI.blank2}
          onBlank1Change={noOp}
          onBlank2Change={noOp}
          readOnly={true}
          correctBlank1={correctAnswer}
          correctBlank2={correctAnswer}
          showResults={true}
          explanation={questionData.explanation || undefined}
        />
      );
    }

    // Table Analysis
    if (diType === 'TA') {
      const correctAnswer = Array.isArray(answersData?.correct_answer)
        ? answersData.correct_answer[0]
        : answersData?.correct_answer || {};
      // Student answer for TA is typically { 0: 'true'/'false', 1: 'true'/'false', ... }
      // Convert from stored format to TAQuestion expected format
      const studentAnswerRaw = result.studentAnswer && typeof result.studentAnswer === 'object' && !Array.isArray(result.studentAnswer)
        ? result.studentAnswer as Record<string, string | boolean>
        : {};
      const studentTA: Record<number, 'true' | 'false'> = {};
      Object.entries(studentAnswerRaw).forEach(([key, value]) => {
        const numKey = parseInt(key, 10);
        if (!isNaN(numKey)) {
          studentTA[numKey] = value === true || value === 'true' ? 'true' : 'false';
        }
      });
      const correctTA: Record<number, 'true' | 'false'> = {};
      if (correctAnswer && typeof correctAnswer === 'object') {
        Object.entries(correctAnswer).forEach(([key, value]) => {
          const numKey = parseInt(key, 10);
          if (!isNaN(numKey)) {
            correctTA[numKey] = value === true || value === 'true' ? 'true' : 'false';
          }
        });
      }
      return (
        <TAQuestion
          tableTitle={questionData.table_title}
          columnHeaders={questionData.column_headers || []}
          tableData={questionData.table_data || []}
          statements={questionData.statements || []}
          selectedAnswers={studentTA}
          onAnswerChange={() => {}}
          readOnly={true}
          tableSortable={true}
          correctAnswers={correctTA}
          showResults={true}
          explanation={questionData.explanation || undefined}
        />
      );
    }

    // Two-Part Analysis
    if (diType === 'TPA') {
      const correctAnswer = Array.isArray(answersData?.correct_answer)
        ? answersData.correct_answer[0]
        : answersData?.correct_answer || {};
      // Student answer for TPA is typically { column1: "A", column2: "B" }
      const studentTPA = result.studentAnswer && typeof result.studentAnswer === 'object' && !Array.isArray(result.studentAnswer)
        ? result.studentAnswer as Record<string, string>
        : {};
      return (
        <TPAQuestion
          scenario={questionData.scenario || ''}
          column1Title={questionData.column1_title || ''}
          column2Title={questionData.column2_title || ''}
          sharedOptions={questionData.shared_options || []}
          selectedColumn1={studentTPA.column1}
          selectedColumn2={studentTPA.column2}
          onColumn1Change={noOp}
          onColumn2Change={noOp}
          readOnly={true}
          correctColumn1={correctAnswer}
          correctColumn2={correctAnswer}
          showResults={true}
          explanation={questionData.explanation || undefined}
        />
      );
    }

    // Multiple Choice (including CR, RC)
    if (question.question_type === 'multiple_choice' && questionData.options) {
      const questionText = isEnglish
        ? (questionData.question_text_eng || questionData.question_text || '')
        : (questionData.question_text || '');
      const options = isEnglish
        ? (questionData.options_eng || questionData.options || [])
        : (questionData.options || []);
      const passageText = isEnglish
        ? (questionData.passage_text_eng || questionData.passage_text)
        : questionData.passage_text;
      const studentAnswer = typeof result.studentAnswer === 'string' ? result.studentAnswer : undefined;

      return (
        <MultipleChoiceQuestion
          questionText={questionText}
          passageText={passageText}
          passageTitle={questionData.passage_title}
          imageUrl={questionData.image_url}
          options={options}
          selectedAnswer={studentAnswer}
          correctAnswer={answersData?.correct_answer}
          onAnswerChange={noOp}
          readOnly={true}
          showResults={true}
          explanation={questionData.explanation || undefined}
        />
      );
    }

    // Fallback for other question types
    return (
      <div className="space-y-4">
        <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
          {questionData.question_text || questionData.problem ? (
            <div className="text-gray-800 text-lg whitespace-pre-wrap">
              <LaTeX>{questionData.question_text || questionData.problem}</LaTeX>
            </div>
          ) : (
            <div className="text-gray-400 italic">
              Question type: {question.question_type}
            </div>
          )}
          {questionData.explanation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
              <div className="text-gray-800 whitespace-pre-wrap">
                <LaTeX>{questionData.explanation}</LaTeX>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Filter questions
  const filteredQuestions = questions.filter(result => {
    if (filterSection !== 'all' && result.question.section !== filterSection) return false;
    if (filterCorrectness === 'correct' && !result.isCorrect) return false;
    if (filterCorrectness === 'wrong' && result.isCorrect) return false;
    if (filterBookmarked && !result.isBookmarked) return false;
    return true;
  });

  // Get unique sections for filter
  const sections = [...new Set(questions.map(q => q.question.section))];

  // Count stats
  const bookmarkedCount = questions.filter(q => q.isBookmarked).length;
  const correctCount = questions.filter(q => q.isCorrect).length;
  const wrongCount = questions.filter(q => !q.isCorrect).length;
  const hasAnswersData = assessment?.answers_data && Object.keys(assessment.answers_data).length > 0;

  // Loading state
  if (loading) {
    return (
      <Layout pageTitle="Assessment Results" pageSubtitle="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !assessment) {
    return (
      <Layout pageTitle="Assessment Results" pageSubtitle="Error">
        <div className="p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">{error || 'Assessment not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isMock = assessment.assessment_type === 'mock';
  const estimatedScore = isMock ? calculateEstimatedGmatScore(assessment.score_percentage) : null;

  return (
    <Layout
      pageTitle={getAssessmentTypeLabel(assessment.assessment_type)}
      pageSubtitle={assessment.section ? getSectionFullName(assessment.section) : 'Full Test Results'}
    >
      <MathJaxProvider>
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to GMAT Preparation
            </button>

            {/* Results Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl ${isMock ? 'bg-indigo-100' : 'bg-purple-100'} flex items-center justify-center`}>
                  <FontAwesomeIcon
                    icon={isMock ? faGraduationCap : faChartLine}
                    className={`text-2xl ${isMock ? 'text-indigo-600' : 'text-purple-600'}`}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {getAssessmentTypeLabel(assessment.assessment_type)}
                    {assessment.section && ` - ${getSectionFullName(assessment.section)}`}
                  </h1>
                  {/* Show topic name for training results */}
                  {assessment.topic && (
                    <p className="text-purple-600 font-medium">
                      {formatTopicName(assessment.topic)}
                    </p>
                  )}
                  {assessment.completed_at && (
                    <p className="text-gray-500">
                      Completed: {new Date(assessment.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Score Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {/* Estimated GMAT Score (Mock only) */}
                {isMock && estimatedScore && (
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <div className="text-3xl font-bold text-indigo-600">{estimatedScore}</div>
                    <div className="text-sm text-gray-600">Est. GMAT Score</div>
                  </div>
                )}

                {/* Raw Score */}
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">
                    {assessment.score_raw}/{assessment.score_total}
                  </div>
                  <div className="text-sm text-gray-600">Raw Score</div>
                </div>

                {/* Percentage */}
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">
                    {assessment.score_percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Percentage</div>
                </div>

                {/* Time Spent */}
                {assessment.time_spent_seconds && (
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <div className="text-3xl font-bold text-amber-600">
                      {Math.floor(assessment.time_spent_seconds / 60)}m {assessment.time_spent_seconds % 60}s
                    </div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                )}

                {/* Average Time Per Question */}
                {assessment.time_spent_seconds && questions.length > 0 && (
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(assessment.time_spent_seconds / questions.length)}s
                    </div>
                    <div className="text-sm text-gray-600">Avg per Question</div>
                  </div>
                )}
              </div>

              {/* Difficulty Breakdown */}
              {assessment.difficulty_breakdown && (
                <div className="border-t-2 border-gray-100 pt-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Performance by Difficulty</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                      const data = assessment.difficulty_breakdown?.[difficulty];
                      if (!data) return null;
                      const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
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
                              style={{ width: `${percentage}%` }}
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
            {hasAnswersData && (() => {
              // Calculate pacing statistics
              const _avgTimePerQuestion = assessment?.time_spent_seconds && questions.length > 0
                ? assessment.time_spent_seconds / questions.length
                : 60;
              void _avgTimePerQuestion; // Silence unused variable warning
              const expectedTimePerQuestion = 120; // 2 minutes per question as GMAT standard
              const questionsWithTime = questions.filter(q => q.timeSpentSeconds !== undefined);
              const maxTime = Math.max(...questionsWithTime.map(q => q.timeSpentSeconds || 0), expectedTimePerQuestion);

              // Calculate cumulative time for pacing chart
              let cumulativeActual = 0;
              const pacingData = questions.map((q, i) => {
                cumulativeActual += q.timeSpentSeconds || 0;
                const expectedCumulative = (i + 1) * expectedTimePerQuestion;
                return {
                  question: i + 1,
                  actual: cumulativeActual,
                  expected: expectedCumulative,
                  questionTime: q.timeSpentSeconds || 0,
                  isCorrect: q.isCorrect,
                };
              });

              // Calculate pacing summary
              const fastQuestions = questionsWithTime.filter(q => (q.timeSpentSeconds || 0) < expectedTimePerQuestion * 0.5).length;
              const slowQuestions = questionsWithTime.filter(q => (q.timeSpentSeconds || 0) > expectedTimePerQuestion * 1.5).length;
              const onPaceQuestions = questionsWithTime.length - fastQuestions - slowQuestions;

              return (
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
                      onClick={() => setShowTimeReport(!showTimeReport)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      {showTimeReport ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>

                  {/* Pacing Summary - Always visible */}
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

                  {showTimeReport && (
                    <>
                      {/* Question Details Grid */}
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Question Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {questions.map((result) => {
                            const isSlower = result.timeSpentSeconds && result.timeSpentSeconds > expectedTimePerQuestion * 1.5;
                            const isFaster = result.timeSpentSeconds && result.timeSpentSeconds < expectedTimePerQuestion * 0.5;

                            return (
                              <div
                                key={result.question.id}
                                className={`p-3 rounded-lg border ${
                                  result.isCorrect
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Q{result.order}</span>
                                    <FontAwesomeIcon
                                      icon={result.isCorrect ? faCheckCircle : faTimesCircle}
                                      className={result.isCorrect ? 'text-green-600' : 'text-red-600'}
                                    />
                                    {result.isBookmarked && (
                                      <FontAwesomeIcon icon={faBookmark} className="text-amber-500 text-xs" />
                                    )}
                                  </div>
                                  <div className={`flex items-center gap-1 text-sm font-medium ${
                                    isSlower ? 'text-red-600' :
                                    isFaster ? 'text-green-600' :
                                    'text-gray-600'
                                  }`}>
                                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                                    {result.timeSpentSeconds ? `${result.timeSpentSeconds}s` : '-'}
                                    {isSlower && <span className="text-xs ml-1">(slow)</span>}
                                    {isFaster && <span className="text-xs ml-1">(fast)</span>}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {result.question.section}
                                  {getQuestionCategory(result.question.question_data) && ` • ${getQuestionCategory(result.question.question_data)}`}
                                </div>
                                {/* Time bar visualization */}
                                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isSlower ? 'bg-red-500' : isFaster ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${Math.min((result.timeSpentSeconds || 0) / expectedTimePerQuestion * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pacing Charts Toggle Button */}
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <button
                          onClick={() => setShowPacingCharts(!showPacingCharts)}
                          className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faChartLine} />
                          {showPacingCharts ? 'Hide Pacing Charts' : 'Show Pacing Charts'}
                        </button>
                      </div>

                      {/* Pacing Visualization - Only shown when toggled */}
                      {showPacingCharts && (
                        <>
                          {/* Bar chart showing time per question */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Time per Question</span>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                                  Expected ({expectedTimePerQuestion}s)
                                </span>
                                <span className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                                  Actual
                                </span>
                              </div>
                            </div>
                            <div className="flex items-end gap-1 h-24 bg-gray-50 rounded-lg p-2 overflow-x-auto">
                              {questions.map((result, i) => {
                                const time = result.timeSpentSeconds || 0;
                                const heightPercent = Math.min((time / maxTime) * 100, 100);
                                const expectedHeightPercent = Math.min((expectedTimePerQuestion / maxTime) * 100, 100);
                                const isOverTime = time > expectedTimePerQuestion;
                                const isFast = time < expectedTimePerQuestion * 0.5;

                                return (
                                  <div key={result.question.id} className="flex-1 min-w-[20px] max-w-[40px] flex flex-col items-center relative group">
                                    {/* Expected time indicator line */}
                                    <div
                                      className="absolute w-full border-t-2 border-dashed border-blue-400 z-10"
                                      style={{ bottom: `${expectedHeightPercent}%` }}
                                    />
                                    {/* Actual time bar */}
                                    <div
                                      className={`w-full rounded-t transition-all cursor-pointer ${
                                        result.isCorrect
                                          ? isOverTime ? 'bg-amber-400' : isFast ? 'bg-green-400' : 'bg-green-500'
                                          : isOverTime ? 'bg-red-400' : isFast ? 'bg-red-300' : 'bg-red-500'
                                      }`}
                                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                                      title={`Q${i + 1}: ${time}s ${result.isCorrect ? '✓' : '✗'}`}
                                    />
                                    {/* Question number */}
                                    <span className="text-[8px] text-gray-400 mt-0.5">{i + 1}</span>
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">
                                      Q{i + 1}: {time}s {result.isCorrect ? '✓' : '✗'}
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
                              {/* Y-axis labels */}
                              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-gray-400 pr-1">
                                <span>{Math.round(pacingData[pacingData.length - 1]?.expected / 60 || 0)}m</span>
                                <span>0m</span>
                              </div>
                              {/* Chart area */}
                              <div className="ml-12 h-full relative">
                                {/* Expected line (straight diagonal) */}
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                  <line
                                    x1="0"
                                    y1="100%"
                                    x2="100%"
                                    y2="0"
                                    stroke="#3B82F6"
                                    strokeWidth="2"
                                    strokeDasharray="4 2"
                                  />
                                </svg>
                                {/* Actual pacing line */}
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                  <polyline
                                    fill="none"
                                    stroke="#8B5CF6"
                                    strokeWidth="2"
                                    points={pacingData.map((d, i) => {
                                      const x = (i / (pacingData.length - 1 || 1)) * 100;
                                      const maxExpected = pacingData[pacingData.length - 1]?.expected || 1;
                                      const y = 100 - (d.actual / maxExpected) * 100;
                                      return `${x}%,${Math.max(0, Math.min(100, y))}%`;
                                    }).join(' ')}
                                  />
                                </svg>
                                {/* Status indicator */}
                                <div className="absolute right-0 top-0 text-xs">
                                  {cumulativeActual < pacingData[pacingData.length - 1]?.expected * 0.9 ? (
                                    <span className="text-green-600 font-medium">Ahead of pace</span>
                                  ) : cumulativeActual > pacingData[pacingData.length - 1]?.expected * 1.1 ? (
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
              );
            })()}

            {/* Questions Section */}
            {questions.length > 0 && (
              <>
                {/* Filters */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Section Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Section:</span>
                      <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="all">All Sections</option>
                        {sections.map(section => (
                          <option key={section} value={section}>{getSectionFullName(section)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Correctness Filter */}
                    {hasAnswersData && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setFilterCorrectness('all')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            filterCorrectness === 'all'
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFilterCorrectness('correct')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                            filterCorrectness === 'correct'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                          {correctCount}
                        </button>
                        <button
                          onClick={() => setFilterCorrectness('wrong')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                            filterCorrectness === 'wrong'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                          {wrongCount}
                        </button>
                      </div>
                    )}

                    {/* Bookmark Filter */}
                    {bookmarkedCount > 0 && (
                      <button
                        onClick={() => setFilterBookmarked(!filterBookmarked)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          filterBookmarked
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                        {bookmarkedCount} Bookmarked
                      </button>
                    )}

                    <div className="text-sm text-gray-500 ml-auto">
                      Showing {filteredQuestions.length} of {questions.length} questions
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {filteredQuestions.map((result) => (
                    <div
                      key={result.question.id}
                      className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${
                        hasAnswersData
                          ? result.isCorrect
                            ? 'border-green-200'
                            : 'border-red-200'
                          : 'border-gray-100'
                      }`}
                    >
                      {/* Question Header */}
                      <div className={`px-6 py-4 border-b flex items-center justify-between ${
                        hasAnswersData
                          ? result.isCorrect
                            ? 'bg-green-50 border-green-100'
                            : 'bg-red-50 border-red-100'
                          : 'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-800">
                            Q{result.order}
                          </span>
                          {hasAnswersData && (
                            <FontAwesomeIcon
                              icon={result.isCorrect ? faCheckCircle : faTimesCircle}
                              className={result.isCorrect ? 'text-green-600' : 'text-red-600'}
                            />
                          )}
                          {result.isBookmarked && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                              <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                              Bookmarked
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                            {getSectionFullName(result.question.section)}
                          </span>
                          {result.question.difficulty && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              result.question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                              result.question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {result.question.difficulty}
                            </span>
                          )}
                          {/* Question Category badge (from question_data) */}
                          {getQuestionCategory(result.question.question_data) && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1">
                              <FontAwesomeIcon icon={faTag} className="text-xs" />
                              {getQuestionCategory(result.question.question_data)}
                            </span>
                          )}
                        </div>
                        {/* Time spent on this question */}
                        {result.timeSpentSeconds !== undefined && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <FontAwesomeIcon icon={faClock} className="text-xs" />
                            <span className="font-medium">{result.timeSpentSeconds}s</span>
                          </div>
                        )}
                      </div>

                      {/* Question Content */}
                      <div className="p-6">
                        {renderQuestion(result)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* No Questions Message */}
            {questions.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 text-center">
                <p className="text-gray-500">
                  Question details are not available for this assessment.
                </p>
              </div>
            )}
          </div>
        </div>
      </MathJaxProvider>
    </Layout>
  );
}
