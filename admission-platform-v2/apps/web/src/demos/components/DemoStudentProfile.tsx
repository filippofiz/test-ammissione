interface ProfileProps {
  name: string;
  testDate: string;
  schoolGrade: number;
  testHistory: { date: string; testName: string; score: number }[];
  sectionScores: { section: string; score: number; maxScore: number }[];
  weakAreas: string[];
  strengths: string[];
  isVisible: boolean;
  showChart: boolean;
  showDetails: boolean;
}

export function DemoStudentProfile({
  name, testDate, schoolGrade, testHistory, sectionScores, weakAreas, strengths, isVisible, showChart, showDetails,
}: ProfileProps) {
  if (!isVisible) return null;

  return (
    <div className="demo-animate-fadeInUp max-w-4xl mx-auto space-y-3">
      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00a666] to-emerald-400 rounded-xl flex items-center justify-center text-white text-lg font-bold">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{name}</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
              <span>Test: {testDate}</span>
              <span>School Grade: <span className="font-bold text-gray-700">{schoolGrade}/10</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Score trend chart */}
      {showChart && (
        <div className="demo-animate-fadeIn bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-2">Score Progression</h3>
          <div className="relative h-36">
            <svg className="w-full h-full" viewBox="0 0 400 130" preserveAspectRatio="none">
              {[0, 32, 65, 97, 130].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f3f4f6" strokeWidth="1" />
              ))}
              <polyline
                fill="none"
                stroke="#00a666"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="demo-chart-line"
                points={testHistory
                  .map((t, i) => {
                    const x = (i / (testHistory.length - 1)) * 380 + 10;
                    const y = 130 - ((t.score - 60) / 40) * 120;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              {testHistory.map((t, i) => {
                const x = (i / (testHistory.length - 1)) * 380 + 10;
                const y = 130 - ((t.score - 60) / 40) * 120;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#00a666" />
                    <circle cx={x} cy={y} r="7" fill="#00a666" fillOpacity="0.2" />
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-gray-400 px-2">
              {testHistory.map((t, i) => (
                <span key={i} className="truncate max-w-[50px]">{t.testName.split(' ').slice(0, 2).join(' ')}</span>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {'\u2191'} +{testHistory[testHistory.length - 1].score - testHistory[0].score}% improvement
            </div>
            <span className="text-[10px] text-gray-400">since first test</span>
          </div>
        </div>
      )}

      {/* Section scores + strengths/weaknesses */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-3">
          {/* Section scores */}
          <div className="demo-animate-slideInLeft bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Section Scores</h3>
            <div className="space-y-2.5">
              {sectionScores.map((s) => (
                <div key={s.section}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-600">{s.section}</span>
                    <span className="font-bold text-gray-800">{s.score}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full demo-progress-bar"
                      style={{
                        width: `${s.score}%`,
                        backgroundColor: s.score >= 85 ? '#00a666' : s.score >= 70 ? '#F59E0B' : '#EF4444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="demo-animate-slideInRight space-y-3">
            <div className="bg-green-50 rounded-xl border border-green-200 p-3">
              <h3 className="text-xs font-bold text-green-700 uppercase mb-2">Strengths</h3>
              <ul className="space-y-1.5">
                {strengths.map((s) => (
                  <li key={s} className="flex items-center gap-1.5 text-xs text-green-800">
                    <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-3">
              <h3 className="text-xs font-bold text-amber-700 uppercase mb-2">Needs Improvement</h3>
              <ul className="space-y-1.5">
                {weakAreas.map((w) => (
                  <li key={w} className="flex items-center gap-1.5 text-xs text-amber-800">
                    <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
