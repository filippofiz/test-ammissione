/**
 * UnifiedResultsPage
 *
 * Single results page that handles both GMAT and regular test results.
 * Detects the source from the route path and uses the appropriate data hook.
 *
 * Layout:
 *  - Back button
 *  - Header (title, icon, subtitle, date)
 *  - ScoreSummary
 *  - DifficultyBreakdown (if available)
 *  - TimeReport
 *  - Results Visibility Toggle (regular, tutor only)
 *  - Attempt Comparison (regular, multiple attempts)
 *  - ResultsFilterBar
 *  - QuestionResultCard[] (filtered list)
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faChartLine,
  faGraduationCap,
  faClock,
  faEye,
  faEyeSlash,
  faChevronDown,
  faChevronUp,
  faTrophy,
  faArrowUp,
  faArrowDown,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { MathJaxProvider } from '../components/MathJaxRenderer';

// Shared results components
import { ScoreSummary } from '../components/results/ScoreSummary';
import { DifficultyBreakdown } from '../components/results/DifficultyBreakdown';
import { TimeReport, type TimeReportQuestion, type TimeReportComparisonStudent } from '../components/results/TimeReport';
import { ResultsFilterBar, type CorrectnessFilter } from '../components/results/ResultsFilterBar';
import { QuestionResultCard } from '../components/results/QuestionResultCard';
import { getQuestionCategory, getSectionFullName } from '../components/results/types';
import type { UnifiedResultData, AttemptComparisonData, ComparisonIndicator } from '../components/results/types';

// Data hooks
import { useGmatResults } from '../components/results/useGmatResults';
import { useRegularTestResults } from '../components/results/useRegularTestResults';
import { useCompareStudents } from '../components/results/useCompareStudents';
import { StudentComparisonPanel } from '../components/results/StudentComparisonPanel';

export default function UnifiedResultsPage() {
  const { assessmentId, assignmentId } = useParams<{
    assessmentId?: string;
    assignmentId?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isGmat = location.pathname.includes('/gmat-results/');
  const isStudentView = location.pathname.includes('/student/');
  const sourceId = isGmat ? assessmentId : assignmentId;
  const language = i18n.language === 'en' ? 'en' : 'it';

  // Use the appropriate data hook
  const gmat = useGmatResults(isGmat ? sourceId : undefined);
  const regular = useRegularTestResults(!isGmat ? sourceId : undefined, isStudentView);

  const data: UnifiedResultData | null = isGmat ? gmat.data : regular.data;
  const loading = isGmat ? gmat.loading : regular.loading;
  const error = isGmat ? gmat.error : regular.error;

  // Multi-student comparison (tutor only)
  const compare = useCompareStudents({
    primaryData: data,
    isGmat,
    primaryAssessment: isGmat ? gmat.assessment ?? null : null,
    enabled: !isStudentView,
  });

  // Filter state
  const [filterSection, setFilterSection] = useState('all');
  const [filterCorrectness, setFilterCorrectness] = useState<CorrectnessFilter>('all');
  const [filterBookmarked, setFilterBookmarked] = useState(false);

  // Attempt comparison UI state (regular tests)
  const [showComparison, setShowComparison] = useState(false);

  // Derived data
  const hasAnswersData = useMemo(() => {
    if (!data) return true;
    return data.questions.some(q => q.studentAnswer !== undefined);
  }, [data]);

  const correctCount = useMemo(() => data?.questions.filter(q => q.isCorrect).length ?? 0, [data]);
  const wrongCount = useMemo(
    () => data?.questions.filter(q => q.hasAnswer && !q.isCorrect).length ?? 0,
    [data],
  );
  const unansweredCount = useMemo(
    () => data?.questions.filter(q => !q.hasAnswer).length ?? 0,
    [data],
  );
  const bookmarkedCount = useMemo(
    () => data?.questions.filter(q => q.isBookmarked).length ?? 0,
    [data],
  );

  // Filter questions
  const filteredQuestions = useMemo(() => {
    if (!data) return [];
    return data.questions.filter(q => {
      if (filterSection !== 'all' && q.question.section !== filterSection) return false;
      if (filterCorrectness === 'correct' && !q.isCorrect) return false;
      if (filterCorrectness === 'wrong' && (!q.hasAnswer || q.isCorrect)) return false;
      if (filterCorrectness === 'unanswered' && q.hasAnswer) return false;
      if (filterBookmarked && !q.isBookmarked) return false;
      return true;
    });
  }, [data, filterSection, filterCorrectness, filterBookmarked]);

  // TimeReport questions
  const timeReportQuestions = useMemo<TimeReportQuestion[]>(() => {
    if (!data) return [];
    return data.questions.map(q => {
      const qData =
        typeof q.question.question_data === 'string'
          ? JSON.parse(q.question.question_data)
          : q.question.question_data;
      return {
        id: q.questionId,
        order: q.order,
        section: q.question.section,
        isCorrect: q.isCorrect,
        hasAnswer: q.hasAnswer,
        isBookmarked: q.isBookmarked,
        timeSpentSeconds: q.timeSpentSeconds,
        category: getQuestionCategory(qData),
      };
    });
  }, [data]);

  // Per-section expected time (seconds per question).
  // Priority: trackConfig.time_per_section / trackConfig.questions_per_section
  //         → trackConfig.total_time_minutes / total questions
  //         → test-type hardcoded defaults
  //         → global fallback
  const expectedTimePerSection = useMemo<Record<string, number>>(() => {
    if (!data) return { __global__: 120 };
    if (isGmat) return { __global__: 120 };

    const tc = data.trackConfig;

    // Build per-section map from time_per_section + questions_per_section
    if (tc?.time_per_section && typeof tc.time_per_section === 'object') {
      const result: Record<string, number> = {};
      for (const [section, minutes] of Object.entries(tc.time_per_section as Record<string, number>)) {
        const qCount = tc.questions_per_section?.[section];
        result[section] = qCount && qCount > 0
          ? Math.round((minutes * 60) / qCount)
          : Math.round((minutes * 60) / 10); // fallback: assume 10 questions if count unknown
      }
      if (Object.keys(result).length > 0) return result;
    }

    // Fallback: total_time_minutes / total questions → uniform per section
    if (tc?.total_time_minutes && data.questions.length > 0) {
      const secPerQ = Math.round((tc.total_time_minutes * 60) / data.questions.length);
      return { __global__: secPerQ };
    }

    // Hardcoded test-type defaults
    const testType = data.assignment?.['2V_tests']?.test_type?.toUpperCase() || '';
    if (testType === 'GMAT') return { __global__: 120 };
    if (testType === 'SAT') return { __global__: 75 };
    if (testType === 'BOCCONI' || testType === 'BOCCONI LAW' || testType === 'CATTOLICA') return { __global__: 60 };

    // Last resort: actual average
    if (data.totalTimeSeconds && data.questions.length > 0) {
      return { __global__: Math.round(data.totalTimeSeconds / data.questions.length) };
    }
    return { __global__: 90 };
  }, [data, isGmat]);

  // TimeReport comparison students — lightweight time overlay per comparison student
  const timeReportComparisonStudents = useMemo<TimeReportComparisonStudent[]>(() => {
    if (isStudentView || compare.comparisonResults.length === 0) return [];
    return compare.comparisonResults.map((cr, i) => {
      const timeByQuestionId: Record<string, number | undefined> = {};
      const correctByQuestionId: Record<string, boolean | undefined> = {};
      cr.questionResults.forEach((qr, questionId) => {
        timeByQuestionId[questionId] = qr.timeSpentSeconds;
        correctByQuestionId[questionId] = qr.hasAnswer ? qr.isCorrect : undefined;
      });
      return {
        studentName: cr.studentName,
        colorIndex: i,
        timeByQuestionId,
        correctByQuestionId,
      };
    });
  }, [compare.comparisonResults, isStudentView]);

  // Section results for IRT score report
  const sectionResults = useMemo(() => {
    if (!data) return undefined;
    const result: Record<string, { correct: number; total: number }> = {};
    data.questions.forEach(q => {
      const s = q.question.section;
      if (!result[s]) result[s] = { correct: 0, total: 0 };
      result[s].total++;
      if (q.isCorrect) result[s].correct++;
    });
    return result;
  }, [data]);

  // Build question-level comparison indicator map.
  // For questions a comparison student never reached, insert an explicit unreached indicator
  // (timeSpentSeconds: undefined, hasAnswer: false) so the header card renders correctly.
  const questionComparisonMap = useMemo(() => {
    const map = new Map<string, ComparisonIndicator[]>();
    for (const cr of compare.comparisonResults) {
      // First pass: fill in what we have
      cr.questionResults.forEach((qr, questionId) => {
        const arr = map.get(questionId) ?? [];
        arr.push({
          studentName: cr.studentName,
          isCorrect: qr.isCorrect,
          hasAnswer: qr.hasAnswer,
          studentAnswer: qr.studentAnswer,
          timeSpentSeconds: qr.timeSpentSeconds,
        });
        map.set(questionId, arr);
      });
      // Second pass: for every primary question not in questionResults → unreached
      if (data) {
        for (const q of data.questions) {
          const qid = q.questionId;
          if (!cr.questionResults.has(qid)) {
            const arr = map.get(qid) ?? [];
            arr.push({
              studentName: cr.studentName,
              isCorrect: false,
              hasAnswer: false,
              studentAnswer: null,
              timeSpentSeconds: undefined,
            });
            map.set(qid, arr);
          }
        }
      }
    }
    return map;
  }, [compare.comparisonResults, data]);

  /* ---- Loading & Error states ---- */

  if (loading) {
    return (
      <Layout pageTitle="Results" pageSubtitle="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FontAwesomeIcon icon={faClock} className="text-6xl text-brand-green animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout pageTitle="Results" pageSubtitle="Error">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md">
            <p className="text-red-700 font-medium">{error || 'Results not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  /* ---- Derived display values ---- */

  const isMock = data.assessmentType === 'mock';

  return (
    <Layout pageTitle={data.title} pageSubtitle={data.subtitle}>
      <MathJaxProvider>
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            {isGmat ? 'Back to GMAT Preparation' : t('testResults.backToStudentTests')}
          </button>

          {/* Results Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-14 h-14 rounded-xl ${
                  isMock ? 'bg-indigo-100' : 'bg-purple-100'
                } flex items-center justify-center`}
              >
                <FontAwesomeIcon
                  icon={isMock ? faGraduationCap : faChartLine}
                  className={`text-2xl ${isMock ? 'text-indigo-600' : 'text-purple-600'}`}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{data.title}</h1>
                {data.topicName && (
                  <p className="text-purple-600 font-medium">{data.topicName}</p>
                )}
                {!data.topicName && data.subtitle && (
                  <p className="text-gray-500">{data.subtitle}</p>
                )}
                {data.completedAt && (
                  <p className="text-gray-500">
                    Completed: {new Date(data.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Score Summary */}
            <ScoreSummary
              scoreRaw={data.scoreRaw}
              scoreTotal={data.scoreTotal}
              scorePercentage={data.scorePercentage}
              totalTimeSeconds={data.totalTimeSeconds}
              questionCount={data.questions.length}
              estimatedGmatScore={data.estimatedGmatScore}
              scaledScores={
                data.scaledScores
                  ? {
                      totalScore: data.scaledScores.totalScore,
                      displayName: data.scaledScores.displayName,
                      sectionScores: data.scaledScores.sectionScores,
                      rawScoreDetails: data.scaledScores.rawScoreDetails,
                    }
                  : undefined
              }
              algorithmConfig={data.algorithmConfig}
              scoringMethod={data.scaledScores?.scoringMethod}
              sectionResults={sectionResults}
              resultsViewable={data.resultsViewable}
              isStudentView={isStudentView}
            />

            {/* Difficulty Breakdown */}
            {data.difficultyBreakdown && (
              <DifficultyBreakdown breakdown={data.difficultyBreakdown} />
            )}
          </div>

          {/* Time Report */}
          <TimeReport
            questions={timeReportQuestions}
            expectedTimePerSection={expectedTimePerSection}
            totalTimeSeconds={data.totalTimeSeconds}
            comparisonStudents={timeReportComparisonStudents.length > 0 ? timeReportComparisonStudents : undefined}
            primaryStudentName={!isStudentView ? (data.studentName ?? null) : undefined}
          />

          {/* Results Visibility Toggle (regular tests, tutor only) */}
          {!isGmat && !isStudentView && (
            <ResultsVisibilityToggle
              resultsViewable={data.resultsViewable ?? false}
              togglingViewability={regular.togglingViewability}
              onToggle={regular.toggleResultsViewability}
            />
          )}

          {/* Attempt Comparison (regular tests, multiple attempts) */}
          {!isGmat &&
            (data.totalAttempts ?? 1) > 1 &&
            regular.attemptComparison.length > 0 && (
              <AttemptComparisonSection
                attemptComparison={regular.attemptComparison}
                selectedAttempt={regular.selectedAttempt}
                showComparison={showComparison}
                onToggle={() => setShowComparison(!showComparison)}
              />
            )}

          {/* Multi-student comparison panel (tutor only) */}
          {!isStudentView && (
            <StudentComparisonPanel
              availableStudents={compare.availableStudents}
              availableLoading={compare.availableLoading}
              comparisonResults={compare.comparisonResults}
              loadingIds={compare.loadingIds}
              errorIds={compare.errorIds}
              onAdd={compare.addStudent}
              onRemove={compare.removeStudent}
              primaryData={data}
            />
          )}

          {/* Filter Bar */}
          <ResultsFilterBar
            sections={data.sections}
            filterSection={filterSection}
            onSectionChange={setFilterSection}
            filterCorrectness={filterCorrectness}
            onCorrectnessChange={setFilterCorrectness}
            correctCount={correctCount}
            wrongCount={wrongCount}
            unansweredCount={unansweredCount > 0 ? unansweredCount : undefined}
            bookmarkedCount={isGmat ? bookmarkedCount : undefined}
            filterBookmarked={filterBookmarked}
            onBookmarkToggle={isGmat ? () => setFilterBookmarked(!filterBookmarked) : undefined}
            totalAttempts={!isGmat ? data.totalAttempts : undefined}
            selectedAttempt={!isGmat ? regular.selectedAttempt : undefined}
            attemptsWithAnswers={!isGmat ? data.attemptsWithAnswers : undefined}
            onAttemptChange={!isGmat ? regular.setSelectedAttempt : undefined}
            filteredCount={filteredQuestions.length}
            totalCount={data.questions.length}
            sectionNameFormatter={isGmat ? getSectionFullName : undefined}
          />

          {/* Question Results */}
          <div className="space-y-6">
            {filteredQuestions.map(result => (
              <QuestionResultCard
                key={result.questionId}
                result={result}
                hasAnswersData={hasAnswersData}
                language={language}
                isStudentView={isStudentView}
                onReviewSave={!isGmat && !isStudentView ? regular.saveQuestionReview : undefined}
                comparisonIndicators={!isStudentView ? questionComparisonMap.get(result.questionId) : undefined}
                primaryStudentName={!isStudentView ? (data.studentName ?? null) : undefined}
              />
            ))}

            {filteredQuestions.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No matching questions found</p>
              </div>
            )}
          </div>
        </div>
      </MathJaxProvider>
    </Layout>
  );
}

/* ================================================================== */
/*  Sub-components inlined in this file (only used here)               */
/* ================================================================== */

/** Results visibility toggle for tutors (regular tests only) */
function ResultsVisibilityToggle({
  resultsViewable,
  togglingViewability,
  onToggle,
}: {
  resultsViewable: boolean;
  togglingViewability: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Icon + label */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            resultsViewable ? 'bg-green-50' : 'bg-gray-100'
          }`}>
            <FontAwesomeIcon
              icon={resultsViewable ? faEye : faEyeSlash}
              className={`text-sm ${resultsViewable ? 'text-green-600' : 'text-gray-400'}`}
            />
          </div>
          <div>
            <span className="font-semibold text-gray-800 text-sm leading-tight block">
              Student results visibility
            </span>
            <span className="text-xs text-gray-400 leading-tight mt-0.5 block">
              {resultsViewable
                ? 'Student can view their detailed results'
                : 'Results are hidden — student cannot see them yet'}
            </span>
          </div>
        </div>

        {/* Status badge + toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            resultsViewable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {resultsViewable ? 'Visible' : 'Hidden'}
          </span>
          <button
            onClick={onToggle}
            disabled={togglingViewability}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              togglingViewability ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${resultsViewable ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-flex h-4 w-4 items-center justify-center transform rounded-full bg-white shadow transition-transform ${
              resultsViewable ? 'translate-x-6' : 'translate-x-1'
            }`}>
              {togglingViewability && (
                <div className="w-2.5 h-2.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Attempt comparison section for multi-attempt tests */
function AttemptComparisonSection({
  attemptComparison,
  selectedAttempt,
  showComparison,
  onToggle,
}: {
  attemptComparison: AttemptComparisonData[];
  selectedAttempt: number | null;
  showComparison: boolean;
  onToggle: () => void;
}) {
  if (attemptComparison.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-green-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faChartLine} className="text-2xl text-green-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Attempt Comparison</h2>
            <p className="text-sm text-gray-600">
              View improvements across {attemptComparison.length} attempts
            </p>
          </div>
        </div>
        <FontAwesomeIcon
          icon={showComparison ? faChevronUp : faChevronDown}
          className="text-xl text-gray-400"
        />
      </button>

      {showComparison && (
        <div className="mt-6 space-y-6">
          {/* Score Progress Cards */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Score Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attemptComparison.map((attempt, idx) => {
                const prev = idx > 0 ? attemptComparison[idx - 1] : null;
                const scoreDiff = prev ? attempt.score - prev.score : 0;
                const timeDiff = prev
                  ? attempt.avgTimePerQuestion - prev.avgTimePerQuestion
                  : 0;

                return (
                  <div
                    key={attempt.attemptNumber}
                    className={`p-4 rounded-lg border-2 ${
                      attempt.attemptNumber === selectedAttempt
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-700">
                        Attempt {attempt.attemptNumber}
                      </span>
                      {attempt.attemptNumber === selectedAttempt && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-800">{attempt.score}%</span>
                        {prev && scoreDiff !== 0 && (
                          <div
                            className={`flex items-center gap-1 text-sm font-semibold ${
                              scoreDiff > 0
                                ? 'text-green-600'
                                : scoreDiff < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={
                                scoreDiff > 0
                                  ? faArrowUp
                                  : scoreDiff < 0
                                    ? faArrowDown
                                    : faMinus
                              }
                            />
                            {Math.abs(scoreDiff)}%
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-green-100 rounded">
                          <div className="font-bold text-green-700">{attempt.correct}</div>
                          <div className="text-green-600">Correct</div>
                        </div>
                        <div className="text-center p-2 bg-red-100 rounded">
                          <div className="font-bold text-red-700">{attempt.wrong}</div>
                          <div className="text-red-600">Wrong</div>
                        </div>
                        <div className="text-center p-2 bg-gray-100 rounded">
                          <div className="font-bold text-gray-700">{attempt.unanswered}</div>
                          <div className="text-gray-600">Skipped</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t">
                        <span className="text-gray-600 flex items-center gap-1">
                          <FontAwesomeIcon icon={faClock} />
                          Avg: {attempt.avgTimePerQuestion}s
                        </span>
                        {prev && timeDiff !== 0 && (
                          <div
                            className={`flex items-center gap-1 font-semibold ${
                              timeDiff < 0
                                ? 'text-green-600'
                                : timeDiff > 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={
                                timeDiff < 0
                                  ? faArrowDown
                                  : timeDiff > 0
                                    ? faArrowUp
                                    : faMinus
                              }
                            />
                            {Math.abs(timeDiff)}s
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Comparison Table */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Section Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Section</th>
                    {attemptComparison.map(a => (
                      <th key={a.attemptNumber} className="text-center py-3 px-4 font-semibold text-gray-700">
                        Attempt {a.attemptNumber}
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-semibold text-green-700">
                      Improvement
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(attemptComparison[0]?.sectionStats || {}).map(section => (
                    <tr key={section} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{section}</td>
                      {attemptComparison.map(a => {
                        const stat = a.sectionStats[section];
                        const accuracy = stat
                          ? Math.round((stat.correct / stat.total) * 100)
                          : 0;
                        return (
                          <td key={a.attemptNumber} className="text-center py-3 px-4">
                            <div className="font-semibold text-gray-800">{accuracy}%</div>
                            <div className="text-xs text-gray-500">
                              {stat?.correct}/{stat?.total}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                              <FontAwesomeIcon icon={faClock} />
                              {stat ? Math.round(stat.time / 60) : 0}m
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center py-3 px-4">
                        {(() => {
                          const first = attemptComparison[0].sectionStats[section];
                          const last =
                            attemptComparison[attemptComparison.length - 1].sectionStats[section];
                          const firstAcc = first
                            ? Math.round((first.correct / first.total) * 100)
                            : 0;
                          const lastAcc = last
                            ? Math.round((last.correct / last.total) * 100)
                            : 0;
                          const diff = lastAcc - firstAcc;

                          return diff !== 0 ? (
                            <div
                              className={`flex items-center justify-center gap-1 font-semibold ${
                                diff > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              <FontAwesomeIcon icon={diff > 0 ? faArrowUp : faArrowDown} />
                              {Math.abs(diff)}%
                            </div>
                          ) : (
                            <div className="text-gray-400">-</div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <KeyInsights attemptComparison={attemptComparison} />
        </div>
      )}
    </div>
  );
}

/** Key insights derived from attempt comparison data */
function KeyInsights({ attemptComparison }: { attemptComparison: AttemptComparisonData[] }) {
  if (attemptComparison.length < 2) return null;

  const first = attemptComparison[0];
  const last = attemptComparison[attemptComparison.length - 1];
  const scoreImprovement = last.score - first.score;
  const timeImprovement = first.avgTimePerQuestion - last.avgTimePerQuestion;
  const best = [...attemptComparison].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
      <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
        <FontAwesomeIcon icon={faTrophy} />
        Key Insights
      </h3>
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div className="bg-white rounded p-3 border border-blue-100">
          <div className="text-blue-700 font-semibold mb-1">Overall Score Change</div>
          <div
            className={`text-xl font-bold ${
              scoreImprovement > 0
                ? 'text-green-600'
                : scoreImprovement < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {scoreImprovement > 0 ? '+' : ''}
            {scoreImprovement}%
          </div>
          <div className="text-xs text-gray-600">
            From {first.score}% to {last.score}%
          </div>
        </div>
        <div className="bg-white rounded p-3 border border-blue-100">
          <div className="text-blue-700 font-semibold mb-1">Time Efficiency</div>
          <div
            className={`text-xl font-bold ${
              timeImprovement > 0
                ? 'text-green-600'
                : timeImprovement < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {timeImprovement > 0 ? '-' : '+'}
            {Math.abs(timeImprovement)}s
          </div>
          <div className="text-xs text-gray-600">Avg time per question</div>
        </div>
        <div className="bg-white rounded p-3 border border-blue-100">
          <div className="text-blue-700 font-semibold mb-1">Best Performance</div>
          <div className="text-xl font-bold text-green-600">Attempt {best.attemptNumber}</div>
          <div className="text-xs text-gray-600">{best.score}% accuracy</div>
        </div>
        <div className="bg-white rounded p-3 border border-blue-100">
          <div className="text-blue-700 font-semibold mb-1">Completion Rate</div>
          <div className="text-xl font-bold text-gray-800">
            {last.total - last.unanswered}/{last.total}
          </div>
          <div className="text-xs text-gray-600">Questions answered</div>
        </div>
      </div>
    </div>
  );
}
