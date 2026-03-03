interface TimeBarData {
  questionNumber: number;
  timeSpent: number;
  expected: number;
  isCorrect: boolean;
  section: string;
}

interface PacingData {
  question: number;
  actual: number;
  expected: number;
}

interface TimeChartProps {
  timeData: TimeBarData[];
  pacingData: PacingData[];
  visibleBars: number;
  showPacingLine: boolean;
  showSectionStats: boolean;
  showAnalysis: boolean;
  pacingScore?: number;
  showPacingScore: boolean;
}

export function DemoTimeChart({ timeData, pacingData, visibleBars, showPacingLine, showSectionStats, showAnalysis, pacingScore = 78, showPacingScore }: TimeChartProps) {
  const maxTime = Math.max(...timeData.map(d => d.timeSpent), 120);

  return (
    <div className="space-y-2">
      {/* Pacing Score — compact inline */}
      {showPacingScore && (
        <div className="demo-animate-bounceIn flex items-center justify-center gap-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Overall Pacing Score</div>
          <div className={`text-2xl font-bold ${pacingScore >= 70 ? 'text-[#00a666]' : pacingScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
            {pacingScore}%
          </div>
          <div className="text-[10px] text-gray-400">of questions at optimal pace</div>
        </div>
      )}

      {/* Per-question bar chart */}
      <div>
        <h3 className="text-xs font-semibold text-gray-800 mb-1">Time per Question</h3>
        <div className="relative h-36 flex items-end gap-[2px]">
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-blue-400 z-10"
            style={{ bottom: `${(60 / maxTime) * 100}%` }}
          >
            <span className="absolute -top-3 right-0 text-[9px] text-blue-400 font-medium">60s</span>
          </div>

          {timeData.map((d, i) => {
            const height = (d.timeSpent / maxTime) * 100;
            const barColor = d.isCorrect
              ? d.timeSpent <= 60 ? 'bg-[#00a666]' : d.timeSpent <= 90 ? 'bg-emerald-400' : 'bg-amber-400'
              : 'bg-red-400';
            const isVisible = i < visibleBars;

            return (
              <div key={i} className="flex-1 relative group" style={{ height: '100%' }}>
                {isVisible && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 ${barColor} rounded-t`}
                    style={{
                      height: `${height}%`,
                      transformOrigin: 'bottom',
                      animation: `demoBarGrow 0.4s ease-out forwards`,
                    }}
                  />
                )}
                {isVisible && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-20">
                    Q{d.questionNumber}: {d.timeSpent}s {d.isCorrect ? '\u2713' : '\u2717'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-gray-400">Q1</span>
          <span className="text-[9px] text-gray-400">Q{timeData.length}</span>
        </div>
      </div>

      {/* Pacing line chart + Section stats side by side */}
      {showPacingLine && (
        <div className="demo-animate-fadeIn grid grid-cols-5 gap-2">
          {/* Pacing chart — 3 cols */}
          <div className="col-span-3 relative h-36 bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="text-xs font-semibold text-gray-800">Cumulative Pacing</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0 border-t-2 border-dashed border-blue-300" />
                  <span className="text-[7px] text-gray-400">Expected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-purple-500 rounded" />
                  <span className="text-[7px] text-gray-400">Actual</span>
                </div>
                <div className="bg-[#00a666] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                  Ahead of pace
                </div>
              </div>
            </div>
            <svg className="w-full h-[calc(100%-20px)]" viewBox="0 0 400 90" preserveAspectRatio="none">
              <line x1="0" y1="90" x2="400" y2="0" stroke="#93C5FD" strokeWidth="2" strokeDasharray="8 4" />
              <polyline
                fill="none" stroke="#8B5CF6" strokeWidth="3" className="demo-chart-line"
                points={pacingData.map((d, i) => {
                  const x = (i / (pacingData.length - 1)) * 400;
                  const maxC = pacingData[pacingData.length - 1].expected;
                  const y = 90 - (d.actual / maxC) * 90;
                  return `${x},${y}`;
                }).join(' ')}
              />
            </svg>
          </div>

          {/* Section avg times — 2 cols */}
          <div className="col-span-2 space-y-0.5">
            <h3 className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Avg. Time by Section</h3>
            {showSectionStats ? (
              ['Logic & Problem Solving', 'Mathematics', 'Reading Comprehension', 'Data Analysis', 'Critical Thinking'].map((section, i) => {
                const sectionData = timeData.filter(d => d.section === section);
                const avgTime = sectionData.length > 0
                  ? Math.round(sectionData.reduce((s, d) => s + d.timeSpent, 0) / sectionData.length)
                  : 0;
                const isOver = avgTime > 60;

                return (
                  <div key={section} className="demo-animate-fadeIn bg-white rounded border border-gray-200 px-2 py-0.5 flex items-center justify-between"
                    style={{ animationDelay: `${i * 120}ms` }}>
                    <span className="text-[10px] text-gray-500 font-medium truncate">{section.split(' ')[0]}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[11px] font-bold ${isOver ? 'text-amber-600' : 'text-gray-800'}`}>{avgTime}s</span>
                      {isOver && <span className="text-[7px] text-amber-500">slow</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-20 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00a666] rounded-full demo-spinner-circle" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pacing analysis insights */}
      {showAnalysis && (
        <div className="demo-animate-fadeInUp bg-white rounded-lg border border-gray-200 px-3 py-2">
          <h3 className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pacing Analysis</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="demo-animate-fadeIn flex items-start gap-1.5">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-[10px] text-gray-600 leading-snug">
                <span className="font-semibold text-gray-800">Strong start.</span> First 20 questions ahead of schedule, building a 3-min buffer.
              </p>
            </div>
            <div className="demo-animate-fadeIn flex items-start gap-1.5" style={{ animationDelay: '200ms' }}>
              <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-[10px] text-gray-600 leading-snug">
                <span className="font-semibold text-gray-800">Watch Q4 & Q13.</span> Over 90s each — flag and return if stuck after 60s.
              </p>
            </div>
            <div className="demo-animate-fadeIn flex items-start gap-1.5" style={{ animationDelay: '400ms' }}>
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <p className="text-[10px] text-gray-600 leading-snug">
                <span className="font-semibold text-gray-800">Excellent overall.</span> Finished 4 min early. Pacing improved +12% vs. last attempt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
