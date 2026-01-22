/**
 * GMAT Assessment Results Page
 * Displays results for GMAT Section Assessments and Mock Simulations
 * Uses the 2V_gmat_assessment_results table which stores question_ids
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faChartBar,
  faTrophy,
  faChartLine,
  faGraduationCap,
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
  MOCK_SIMULATION_CONFIG,
  type GmatSection,
  type GmatAssessmentResult,
  type GmatAssessmentType,
} from '../lib/api/gmat';

interface Question {
  id: string;
  section: string;
  difficulty?: string;
  question_type: string;
  question_data: any;
  answers: any;
}

interface QuestionResult {
  question: Question;
  isCorrect: boolean;
  order: number;
}

export default function GMATAssessmentResultsPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isStudentView = location.pathname.includes('/student/');
  const isEnglish = i18n.language === 'en';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<GmatAssessmentResult | null>(null);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterCorrectness, setFilterCorrectness] = useState<'all' | 'correct' | 'wrong'>('all');

  useEffect(() => {
    loadAssessmentResults();
  }, [assessmentId]);

  async function loadAssessmentResults() {
    try {
      setLoading(true);
      setError(null);

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
        suggested_cycle: assessmentData.suggested_cycle,
        assigned_cycle: assessmentData.assigned_cycle,
        difficulty_breakdown: assessmentData.difficulty_breakdown,
      };

      setAssessment(result);

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

        // Map to question results
        // Note: Without individual answer data, we show questions in review mode
        // The difficulty_breakdown in the result gives aggregate info
        const questionResults: QuestionResult[] = sortedQuestions.map((q, index) => ({
          question: {
            ...q,
            question_data: typeof q.question_data === 'string'
              ? JSON.parse(q.question_data)
              : q.question_data,
            answers: typeof q.answers === 'string'
              ? JSON.parse(q.answers)
              : q.answers,
          },
          isCorrect: true, // We don't have individual answer data yet
          order: index + 1,
        }));

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
      return (
        <DSQuestion
          problem={questionData.problem || ''}
          statement1={questionData.statement1 || ''}
          statement2={questionData.statement2 || ''}
          selectedAnswer={null}
          correctAnswer={answersData?.correct_answer?.[0] || answersData?.correct_answer}
          onAnswerChange={noOp}
          readOnly={true}
          showResults={true}
          explanation={questionData.explanation}
        />
      );
    }

    // Multi-Source Reasoning
    if (diType === 'MSR') {
      return (
        <MSRQuestion
          sources={questionData.sources || []}
          questions={questionData.questions || []}
          selectedAnswers={[]}
          onAnswerChange={noOp}
          readOnly={true}
          correctAnswers={answersData?.correct_answer || []}
          showResults={true}
          explanation={questionData.explanation}
        />
      );
    }

    // Graphics Interpretation
    if (diType === 'GI') {
      const correctAnswer = answersData?.correct_answer;
      return (
        <GIQuestion
          chartConfig={questionData.chart_config}
          contextText={questionData.context_text}
          statementText={questionData.statement_text || ''}
          blank1Options={questionData.blank1_options || []}
          blank2Options={questionData.blank2_options || []}
          selectedBlank1={undefined}
          selectedBlank2={undefined}
          onBlank1Change={noOp}
          onBlank2Change={noOp}
          readOnly={true}
          correctBlank1={correctAnswer}
          correctBlank2={correctAnswer}
          showResults={true}
          explanation={questionData.explanation}
        />
      );
    }

    // Table Analysis
    if (diType === 'TA') {
      const correctAnswer = Array.isArray(answersData?.correct_answer)
        ? answersData.correct_answer[0]
        : answersData?.correct_answer || {};
      return (
        <TAQuestion
          tableTitle={questionData.table_title}
          columnHeaders={questionData.column_headers || []}
          tableData={questionData.table_data || []}
          statements={questionData.statements || []}
          selectedAnswers={{}}
          onAnswerChange={noOp}
          readOnly={true}
          tableSortable={true}
          correctAnswers={correctAnswer}
          showResults={true}
          explanation={questionData.explanation}
        />
      );
    }

    // Two-Part Analysis
    if (diType === 'TPA') {
      const correctAnswer = Array.isArray(answersData?.correct_answer)
        ? answersData.correct_answer[0]
        : answersData?.correct_answer || {};
      return (
        <TPAQuestion
          scenario={questionData.scenario || ''}
          column1Title={questionData.column1_title || ''}
          column2Title={questionData.column2_title || ''}
          sharedOptions={questionData.shared_options || []}
          selectedColumn1={undefined}
          selectedColumn2={undefined}
          onColumn1Change={noOp}
          onColumn2Change={noOp}
          readOnly={true}
          correctColumn1={correctAnswer}
          correctColumn2={correctAnswer}
          showResults={true}
          explanation={questionData.explanation}
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

      return (
        <MultipleChoiceQuestion
          questionText={questionText}
          passageText={passageText}
          passageTitle={questionData.passage_title}
          imageUrl={questionData.image_url}
          options={options}
          selectedAnswer={null}
          correctAnswer={answersData?.correct_answer}
          onAnswerChange={noOp}
          readOnly={true}
          showResults={true}
          explanation={questionData.explanation}
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
    // Note: Without individual answer tracking, correctness filter isn't meaningful yet
    return true;
  });

  // Get unique sections for filter
  const sections = [...new Set(questions.map(q => q.question.section))];

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
                  {assessment.completed_at && (
                    <p className="text-gray-500">
                      Completed: {new Date(assessment.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Score Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                      {Math.floor(assessment.time_spent_seconds / 60)}m
                    </div>
                    <div className="text-sm text-gray-600">Time Spent</div>
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

            {/* Questions Section */}
            {questions.length > 0 && (
              <>
                {/* Filters */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
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
                    <div className="text-sm text-gray-500">
                      Showing {filteredQuestions.length} of {questions.length} questions
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {filteredQuestions.map((result, index) => (
                    <div
                      key={result.question.id}
                      className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
                    >
                      {/* Question Header */}
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-800">
                            Q{result.order}
                          </span>
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
                        </div>
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
