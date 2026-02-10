/**
 * ScoreSummary Component
 *
 * Displays a grid of score cards for test results.
 * Supports both GMAT results (estimated score, raw, percentage, time)
 * and regular test results with optional Bocconi-style scaled scoring.
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

export interface ScaledScoreDetails {
  totalScore: number;
  displayName: string;
  sectionScores?: Record<string, number>;
  rawScoreDetails?: {
    correct: number;
    correctPoints: number;
    wrong: number;
    wrongPoints: number;
    blank: number;
    blankPoints: number;
    totalRawScore: number;
    totalQuestions: number;
    scaledTo50?: number;
    penaltyBreakdown?: Array<{
      optionCount: number;
      count: number;
      totalPenalty: number;
      penaltyPerQuestion: number;
    }>;
  };
}

export interface ScoreSummaryProps {
  scoreRaw: number;
  scoreTotal: number;
  scorePercentage: number;
  totalTimeSeconds?: number;
  questionCount: number;
  /** Estimated GMAT score - only shown for GMAT mock simulations */
  estimatedGmatScore?: number;
  /** Bocconi/algorithm-based scaled scores */
  scaledScores?: ScaledScoreDetails | null;
  /** Algorithm config for score ranges (section_score_min/max, total_score_min/max) */
  algorithmConfig?: any;
  /** Scoring method from algorithm config */
  scoringMethod?: 'raw_score' | 'irt' | string;
  /** Grouped results by section for section score display */
  sectionResults?: Record<string, { correct: number; total: number }>;
  /** Whether results are viewable by student (controls visibility of score report) */
  resultsViewable?: boolean;
  /** Whether this is a student view */
  isStudentView?: boolean;
}

export function ScoreSummary({
  scoreRaw,
  scoreTotal,
  scorePercentage,
  totalTimeSeconds,
  questionCount,
  estimatedGmatScore,
  scaledScores,
  algorithmConfig,
  scoringMethod,
  sectionResults,
  resultsViewable = true,
  isStudentView = false,
}: ScoreSummaryProps) {
  const [showScoreReport, setShowScoreReport] = useState(false);

  return (
    <>
      {/* Score Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {/* Estimated GMAT Score (Mock only) */}
        {estimatedGmatScore !== undefined && (
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <div className="text-3xl font-bold text-indigo-600">{estimatedGmatScore}</div>
            <div className="text-sm text-gray-600">Est. GMAT Score</div>
          </div>
        )}

        {/* Raw Score */}
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <div className="text-3xl font-bold text-green-600">
            {scoreRaw}/{scoreTotal}
          </div>
          <div className="text-sm text-gray-600">Raw Score</div>
        </div>

        {/* Percentage */}
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <div className="text-3xl font-bold text-blue-600">
            {scorePercentage.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Percentage</div>
        </div>

        {/* Time Spent */}
        {totalTimeSeconds != null && totalTimeSeconds > 0 && (
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <div className="text-3xl font-bold text-amber-600">
              {Math.floor(totalTimeSeconds / 60)}m {totalTimeSeconds % 60}s
            </div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        )}

        {/* Average Time Per Question */}
        {totalTimeSeconds != null && totalTimeSeconds > 0 && questionCount > 0 && (
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(totalTimeSeconds / questionCount)}s
            </div>
            <div className="text-sm text-gray-600">Avg per Question</div>
          </div>
        )}
      </div>

      {/* Bocconi/Algorithm Score Report (collapsible) */}
      {scaledScores && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-purple-300">
          <button
            onClick={() => setShowScoreReport(!showScoreReport)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faChartBar} className="text-2xl text-purple-700" />
              <div>
                <h2 className="text-2xl font-bold text-purple-900">
                  {scaledScores.displayName} Score Report
                </h2>
                <p className="text-sm text-purple-700 mt-1">
                  Scaled scores based on {scaledScores.displayName} algorithm
                </p>
              </div>
            </div>
            <FontAwesomeIcon
              icon={showScoreReport ? faChevronUp : faChevronDown}
              className="text-xl text-purple-700"
            />
          </button>

          {showScoreReport && (!isStudentView || resultsViewable) && (
            <div className="mt-6">
              {scoringMethod === 'raw_score' ? (
                <RawScoreReport scaledScores={scaledScores} />
              ) : (
                <IrtScoreReport
                  scaledScores={scaledScores}
                  algorithmConfig={algorithmConfig}
                  sectionResults={sectionResults}
                />
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** Raw score report (Bocconi style) - total score with penalty breakdown */
function RawScoreReport({ scaledScores }: { scaledScores: ScaledScoreDetails }) {
  const details = scaledScores.rawScoreDetails;

  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-lg px-6 py-4 border-2 border-purple-400 shadow-md max-w-md w-full">
        <div className="text-sm text-purple-700 font-semibold">Total Score</div>
        <div className="text-4xl font-bold text-purple-900 my-2">
          {scaledScores.totalScore} / 50
        </div>
        {details && (
          <div className="mt-4 pt-4 border-t border-purple-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">✓ Correct ({details.correct}):</span>
              <span className="font-semibold text-green-700">+{details.correctPoints}</span>
            </div>

            {details.penaltyBreakdown && details.penaltyBreakdown.length > 0 ? (
              <>
                {details.penaltyBreakdown
                  .sort((a, b) => a.optionCount - b.optionCount)
                  .map(pb => (
                    <div key={pb.optionCount} className="flex justify-between text-sm">
                      <span className="text-red-700">
                        ✗ Wrong - {pb.optionCount} options ({pb.count}):
                        <span className="text-xs ml-1">({pb.penaltyPerQuestion} each)</span>
                      </span>
                      <span className="font-semibold text-red-700">-{pb.totalPenalty}</span>
                    </div>
                  ))
                }
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-red-700">✗ Wrong ({details.wrong}):</span>
                <span className="font-semibold text-red-700">{details.wrongPoints}</span>
              </div>
            )}

            {details.blank > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">○ Blank ({details.blank}):</span>
                <span className="font-semibold text-gray-600">{details.blankPoints}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-purple-200 text-sm">
              <span className="text-purple-700 font-semibold">Raw Total:</span>
              <span className="font-bold text-purple-700">{details.totalRawScore}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** IRT-based score report - total + section scores with ranges */
function IrtScoreReport({
  scaledScores,
  algorithmConfig,
  sectionResults,
}: {
  scaledScores: ScaledScoreDetails;
  algorithmConfig?: any;
  sectionResults?: Record<string, { correct: number; total: number }>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Total Score */}
      <div className="bg-white rounded-lg px-6 py-4 border-2 border-purple-400 shadow-md h-fit">
        <div className="text-sm text-purple-700 font-semibold">Total Score</div>
        <div className="text-4xl font-bold text-purple-900 my-2">
          {scaledScores.totalScore}
        </div>
        {algorithmConfig && (
          <div className="text-xs text-purple-600">
            Range: {algorithmConfig.total_score_min}-{algorithmConfig.total_score_max}
          </div>
        )}
      </div>

      {/* Right: Section Scores */}
      {scaledScores.sectionScores && (
        <div className="space-y-3">
          {Object.entries(scaledScores.sectionScores).map(([sectionName, score]) => {
            const sectionData = sectionResults?.[sectionName];
            return (
              <div key={sectionName} className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-purple-900">{sectionName}</div>
                  <div className="text-3xl font-bold text-purple-900">{score}</div>
                </div>
                {sectionData && sectionData.total > 0 && (
                  <div className="text-sm text-purple-700 mt-2">
                    {sectionData.correct}/{sectionData.total} correct ({Math.round((sectionData.correct / sectionData.total) * 100)}%)
                  </div>
                )}
                {algorithmConfig && (
                  <div className="text-xs text-purple-600 mt-1">
                    Range: {algorithmConfig.section_score_min}-{algorithmConfig.section_score_max}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
