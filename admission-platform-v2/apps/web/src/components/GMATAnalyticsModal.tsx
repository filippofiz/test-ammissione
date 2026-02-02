/**
 * GMAT Analytics Modal Component
 * Full analytics view showing detailed performance data:
 * - Performance statistics (average scores, section breakdowns)
 * - Strengths and weaknesses analysis
 * - Questions seen count
 * - Section assessment scores with visual bars
 * - Mock simulation results
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faChartLine,
  faCheckCircle,
  faGraduationCap,
  faTrophy,
  faArrowUp,
  faArrowDown,
  faClipboardCheck,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  type GmatProgress,
  type GmatAssessmentResult,
  type TrainingCompletion,
  type GmatSection,
  calculateEstimatedGmatScore,
} from '../lib/api/gmat';

interface GMATAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gmatProgress: GmatProgress | null;
  placementResult: GmatAssessmentResult | null;
  sectionAssessments: Record<GmatSection, GmatAssessmentResult | null>;
  mockSimulation: GmatAssessmentResult | null;
  trainingCompletions: Map<string, TrainingCompletion>;
  totalTrainingTests: number;
  embedded?: boolean; // If true, render as embedded content instead of modal
}

export function GMATAnalyticsModal({
  isOpen,
  onClose,
  gmatProgress,
  placementResult,
  sectionAssessments,
  mockSimulation,
  trainingCompletions,
  totalTrainingTests,
  embedded = false,
}: GMATAnalyticsModalProps) {
  if (!isOpen) return null;

  // Calculate progress stats
  const completedTrainingTests = trainingCompletions.size;
  const trainingProgress = totalTrainingTests > 0
    ? Math.round((completedTrainingTests / totalTrainingTests) * 100)
    : 0;

  const completedAssessments = [
    sectionAssessments.QR,
    sectionAssessments.DI,
    sectionAssessments.VR,
  ].filter(Boolean).length;

  const questionsSeenCount = gmatProgress?.seen_question_ids?.length || 0;

  // Calculate estimated score if mock is completed
  const estimatedScore = mockSimulation
    ? calculateEstimatedGmatScore(mockSimulation.score_percentage)
    : null;

  // Calculate performance statistics
  const trainingScores = Array.from(trainingCompletions.values()).map(c => c.score_percentage);
  const averageTrainingScore = trainingScores.length > 0
    ? Math.round(trainingScores.reduce((a, b) => a + b, 0) / trainingScores.length)
    : null;

  // Use section assessments for accurate per-section performance
  const sectionScores: { section: string; score: number | null; label: string }[] = [
    { section: 'QR', score: sectionAssessments.QR?.score_percentage ?? null, label: 'Quantitative Reasoning' },
    { section: 'DI', score: sectionAssessments.DI?.score_percentage ?? null, label: 'Data Insights' },
    { section: 'VR', score: sectionAssessments.VR?.score_percentage ?? null, label: 'Verbal Reasoning' },
  ];

  // Find strongest and weakest sections
  const completedSectionScores = sectionScores.filter(s => s.score !== null);
  const strongestSection = completedSectionScores.length > 0
    ? completedSectionScores.reduce((a, b) => (a.score! > b.score! ? a : b))
    : null;
  const weakestSection = completedSectionScores.length > 0
    ? completedSectionScores.reduce((a, b) => (a.score! < b.score! ? a : b))
    : null;

  // Analytics content - shared between modal and embedded
  const analyticsContent = (
    <div className="space-y-6">
          {/* Estimated GMAT Score - If Mock Completed */}
          {estimatedScore && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    <span className="text-sm font-medium opacity-90">Estimated GMAT Score</span>
                  </div>
                  <div className="text-5xl font-bold">{estimatedScore}</div>
                  <p className="text-sm opacity-75 mt-2">Based on latest mock simulation</p>
                </div>
                {mockSimulation && (
                  <div className="text-right">
                    <div className="text-2xl font-bold opacity-90">
                      {mockSimulation.score_raw}/{mockSimulation.score_total}
                    </div>
                    <div className="text-sm opacity-75">Raw Score</div>
                    <div className="text-lg font-semibold mt-1">
                      {mockSimulation.score_percentage.toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Training Progress */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faClipboardCheck} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Training</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {completedTrainingTests}/{totalTrainingTests}
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
            </div>

            {/* Section Assessments */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Assessments</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {completedAssessments}/3
              </div>
              <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(completedAssessments / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Questions Seen */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Questions Seen</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {questionsSeenCount}
              </div>
              <div className="text-xs text-blue-500 mt-1">Unique questions</div>
            </div>

            {/* Mock Status */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Simulation</span>
              </div>
              {mockSimulation ? (
                <>
                  <div className="text-2xl font-bold text-indigo-600">
                    {mockSimulation.score_percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-indigo-500 mt-1">Completed</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-400">--</div>
                  <div className="text-xs text-gray-400 mt-1">Not started</div>
                </>
              )}
            </div>
          </div>

          {/* Performance Analytics */}
          {(averageTrainingScore !== null || completedSectionScores.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-amber-500" />
                Performance Analysis
              </h3>

              {/* Average Training Score */}
              {averageTrainingScore !== null && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Average Training Score</span>
                    <span className={`text-3xl font-bold ${
                      averageTrainingScore >= 70 ? 'text-emerald-600' :
                      averageTrainingScore >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {averageTrainingScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        averageTrainingScore >= 70 ? 'bg-emerald-500' :
                        averageTrainingScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${averageTrainingScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Section Scores Breakdown */}
              {completedSectionScores.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Section Assessment Scores</h4>
                  <div className="space-y-4">
                    {sectionScores.map(({ section, score, label }) => (
                      <div key={section} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium text-gray-600">{label}</div>
                        <div className="flex-1">
                          {score !== null ? (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    score >= 70 ? 'bg-emerald-500' :
                                    score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className={`text-lg font-bold min-w-[4rem] text-right ${
                                score >= 70 ? 'text-emerald-600' :
                                score >= 50 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {Math.round(score)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Not taken yet</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              {strongestSection && weakestSection && strongestSection.section !== weakestSection.section && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-2">
                      <FontAwesomeIcon icon={faArrowUp} />
                      Strongest Section
                    </div>
                    <div className="text-lg font-bold text-emerald-700">{strongestSection.label}</div>
                    <div className="text-3xl font-bold text-emerald-600 mt-1">
                      {Math.round(strongestSection.score!)}%
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mb-2">
                      <FontAwesomeIcon icon={faArrowDown} />
                      Focus Area
                    </div>
                    <div className="text-lg font-bold text-amber-700">{weakestSection.label}</div>
                    <div className="text-3xl font-bold text-amber-600 mt-1">
                      {Math.round(weakestSection.score!)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Placement Assessment Info */}
          {placementResult && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Placement Assessment</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {placementResult.score_raw}/{placementResult.score_total}
                    </div>
                    <div className="text-xs text-gray-500">Raw Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {placementResult.score_percentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Percentage</div>
                  </div>
                  {placementResult.suggested_cycle && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-700">
                        {placementResult.suggested_cycle}
                      </div>
                      <div className="text-xs text-gray-500">Suggested Cycle</div>
                    </div>
                  )}
                </div>
                {placementResult.completed_at && (
                  <div className="text-sm text-gray-500">
                    {new Date(placementResult.completed_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!averageTrainingScore && completedSectionScores.length === 0 && !mockSimulation && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analytics Data Yet</h3>
              <p className="text-gray-500 text-sm">
                Complete some training tests or section assessments to see your performance analytics.
              </p>
            </div>
          )}
    </div>
  );

  // Embedded mode - render content directly without modal wrapper
  if (embedded) {
    return analyticsContent;
  }

  // Modal mode - render with modal wrapper
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="text-indigo-600 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">GMAT Analytics</h2>
              <p className="text-sm text-gray-500">Detailed performance breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {analyticsContent}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
