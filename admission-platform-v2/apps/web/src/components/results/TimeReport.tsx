/**
 * TimeReport Component
 *
 * Full time analysis section for test results:
 * - Pacing summary (fast / on-pace / slow counts) - always visible
 * - Question details grid with time indicators - toggled
 * - Time per question bar chart - toggled
 * - Cumulative pacing SVG chart - toggled
 *
 * Manages its own toggle state internally.
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStopwatch,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faBookmark,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';

export interface TimeReportQuestion {
  id: string;
  order: number;
  section: string;
  isCorrect: boolean;
  isBookmarked?: boolean;
  timeSpentSeconds?: number;
  /** Display string for question category (e.g. "Data Sufficiency", "Arithmetic") */
  category?: string | null;
}

export interface TimeReportProps {
  questions: TimeReportQuestion[];
  /** Expected time per question in seconds (120 for GMAT, varies for regular) */
  expectedTimePerQuestion: number;
  totalTimeSeconds?: number;
}

export function TimeReport({
  questions,
  expectedTimePerQuestion,
}: TimeReportProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPacingCharts, setShowPacingCharts] = useState(false);

  const questionsWithTime = questions.filter(q => q.timeSpentSeconds !== undefined);
  if (questionsWithTime.length === 0) return null;

  const maxTime = Math.max(
    ...questionsWithTime.map(q => q.timeSpentSeconds || 0),
    expectedTimePerQuestion
  );

  // Pacing summary
  const fastThreshold = expectedTimePerQuestion * 0.5;
  const slowThreshold = expectedTimePerQuestion * 1.5;
  const fastQuestions = questionsWithTime.filter(q => (q.timeSpentSeconds || 0) < fastThreshold).length;
  const slowQuestions = questionsWithTime.filter(q => (q.timeSpentSeconds || 0) > slowThreshold).length;
  const onPaceQuestions = questionsWithTime.length - fastQuestions - slowQuestions;

  // Cumulative pacing data
  let cumulativeActual = 0;
  const pacingData = questions.map((q, i) => {
    cumulativeActual += q.timeSpentSeconds || 0;
    return {
      question: i + 1,
      actual: cumulativeActual,
      expected: (i + 1) * expectedTimePerQuestion,
      questionTime: q.timeSpentSeconds || 0,
      isCorrect: q.isCorrect,
    };
  });

  const totalExpected = pacingData[pacingData.length - 1]?.expected || 1;

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
      {/* Header */}
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
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Pacing Summary - Always visible */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{fastQuestions}</div>
          <div className="text-xs text-gray-600">Fast (&lt;{Math.round(fastThreshold)}s)</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{onPaceQuestions}</div>
          <div className="text-xs text-gray-600">On Pace</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{slowQuestions}</div>
          <div className="text-xs text-gray-600">Slow (&gt;{Math.round(slowThreshold)}s)</div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Question Details Grid */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Question Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {questions.map((result) => {
                const time = result.timeSpentSeconds || 0;
                const isSlower = result.timeSpentSeconds != null && time > slowThreshold;
                const isFaster = result.timeSpentSeconds != null && time < fastThreshold;

                return (
                  <div
                    key={result.id}
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
                        {result.timeSpentSeconds != null ? `${result.timeSpentSeconds}s` : '-'}
                        {isSlower && <span className="text-xs ml-1">(slow)</span>}
                        {isFaster && <span className="text-xs ml-1">(fast)</span>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {result.section}
                      {result.category && ` \u2022 ${result.category}`}
                    </div>
                    {/* Time bar visualization */}
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isSlower ? 'bg-red-500' : isFaster ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(time / expectedTimePerQuestion * 100, 100)}%` }}
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
              onClick={() => setShowPacingCharts(!showPacingCharts)}
              className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faChartLine} />
              {showPacingCharts ? 'Hide Pacing Charts' : 'Show Pacing Charts'}
            </button>
          </div>

          {/* Pacing Charts */}
          {showPacingCharts && (
            <>
              {/* Bar chart: Time per Question */}
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
                      <div key={result.id} className="flex-1 min-w-[20px] max-w-[40px] flex flex-col items-center relative group">
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
                          title={`Q${i + 1}: ${time}s ${result.isCorrect ? '\u2713' : '\u2717'}`}
                        />
                        {/* Question number */}
                        <span className="text-[8px] text-gray-400 mt-0.5">{i + 1}</span>
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">
                          Q{i + 1}: {time}s {result.isCorrect ? '\u2713' : '\u2717'}
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
                    <span>{Math.round(totalExpected / 60)}m</span>
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
                          const y = 100 - (d.actual / totalExpected) * 100;
                          return `${x}%,${Math.max(0, Math.min(100, y))}%`;
                        }).join(' ')}
                      />
                    </svg>
                    {/* Status indicator */}
                    <div className="absolute right-0 top-0 text-xs">
                      {cumulativeActual < totalExpected * 0.9 ? (
                        <span className="text-green-600 font-medium">Ahead of pace</span>
                      ) : cumulativeActual > totalExpected * 1.1 ? (
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
}
