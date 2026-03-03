import { useState, useEffect, useRef } from 'react';

interface GMATScoreProps {
  estimatedScore: number;
  percentile: number;
  sections: { name: string; score: number; maxScore: number; questions: number; correct: number }[];
  difficultyBreakdown: { easy: { correct: number; total: number; percentage: number }; medium: { correct: number; total: number; percentage: number }; hard: { correct: number; total: number; percentage: number } };
  showScore: boolean;
  showSections: boolean;
  showDifficulty: boolean;
  showPercentile: boolean;
}

export function DemoGMATScore({
  estimatedScore, percentile, sections, difficultyBreakdown, showScore, showSections, showDifficulty, showPercentile,
}: GMATScoreProps) {
  const [displayScore, setDisplayScore] = useState(200);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!showScore) { setDisplayScore(200); return; }

    const duration = 2500;
    const start = performance.now();
    const from = 200;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(from + eased * (estimatedScore - from)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [showScore, estimatedScore]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Score dial + sections side by side */}
      <div className="flex gap-4 items-start">
        {/* Score dial */}
        {showScore && (
          <div className="demo-animate-bounceIn bg-white rounded-xl shadow-xl border border-gray-100 p-5 text-center flex-shrink-0" style={{ width: '280px' }}>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Estimated GMAT Score</div>
            <div className="relative w-40 h-40 mx-auto mb-2">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeDasharray="400" strokeDashoffset="100" strokeLinecap="round" transform="rotate(135 100 100)" />
                <circle
                  cx="100" cy="100" r="85" fill="none" stroke="#6366F1" strokeWidth="12"
                  strokeDasharray={`${((displayScore - 200) / 600) * 400} 1000`}
                  strokeDashoffset="0" strokeLinecap="round" transform="rotate(135 100 100)"
                  className="transition-all duration-100"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-indigo-600 demo-score-text">{displayScore}</span>
                <span className="text-[10px] text-gray-400">out of 805</span>
              </div>
            </div>
            {showPercentile && (
              <div className="demo-animate-fadeInUp inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {percentile}th Percentile — Above Average
              </div>
            )}
          </div>
        )}

        {/* Section scores */}
        {showSections && (
          <div className="flex-1 grid grid-cols-3 gap-3">
            {sections.map((section, i) => {
              const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-emerald-500 to-emerald-600'];
              return (
                <div
                  key={section.name}
                  className="demo-animate-fadeInUp bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <div className={`w-11 h-11 mx-auto mb-2 bg-gradient-to-br ${colors[i]} rounded-lg flex items-center justify-center`}>
                    <span className="text-lg font-bold text-white">{section.score}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-xs mb-0.5">{section.name}</h3>
                  <div className="text-[10px] text-gray-400">{section.correct}/{section.questions} correct</div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[i]} rounded-full demo-progress-bar`}
                      style={{ width: `${section.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Difficulty breakdown */}
      {showDifficulty && (
        <div className="demo-animate-fadeInUp bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Performance by Difficulty</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Easy', data: difficultyBreakdown.easy, color: '#10B981' },
              { label: 'Medium', data: difficultyBreakdown.medium, color: '#F59E0B' },
              { label: 'Hard', data: difficultyBreakdown.hard, color: '#EF4444' },
            ].map((d) => (
              <div key={d.label} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke={d.color} strokeWidth="8"
                      strokeDasharray={`${d.data.percentage * 2.51} 1000`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color: d.color }}>{d.data.percentage}%</span>
                  </div>
                </div>
                <div className="font-semibold text-gray-700 text-xs">{d.label}</div>
                <div className="text-[10px] text-gray-400">{d.data.correct}/{d.data.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
