import { useState, useEffect, useRef } from 'react';

interface ValidationItem {
  id: string;
  questionText: string;
  status: 'valid' | 'flagged';
  confidence: number;
  checks: string[];
  issue?: string;
}

interface AIValidationProps {
  totalQuestions: number;
  accuracy: number;
  validations: ValidationItem[];
  visibleCount: number;
  scanningIndex: number;
  showStats: boolean;
  animateCounter: boolean;
}

export function DemoAIValidation({
  totalQuestions, accuracy, validations, visibleCount, scanningIndex, showStats, animateCounter,
}: AIValidationProps) {
  const [displayTotal, setDisplayTotal] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!animateCounter) { setDisplayTotal(0); return; }
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTotal(Math.round(eased * totalQuestions));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [animateCounter, totalQuestions]);

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {/* Header */}
      <div className="demo-animate-fadeInUp bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold">AI Quality Assurance</h1>
        </div>
        <p className="text-emerald-100 text-xs">Automated validation ensuring question quality and accuracy</p>
      </div>

      {/* Stats counters */}
      {showStats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: animateCounter ? displayTotal : 0, label: 'Questions Validated', color: 'text-[#00a666]' },
            { value: `${accuracy}%`, label: 'Accuracy Rate', color: 'text-blue-600' },
            { value: validations.filter(v => v.status === 'flagged').length, label: 'Issues Found', color: 'text-amber-600' },
            { value: '4', label: 'Check Categories', color: 'text-purple-600' },
          ].map((stat, i) => (
            <div key={stat.label} className="demo-animate-fadeInUp bg-white rounded-lg shadow-lg border border-gray-100 p-3 text-center"
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`text-2xl font-bold ${stat.color} demo-score-text`}>{stat.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Validation stream */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="font-semibold text-gray-700 text-xs">Validation Results</span>
          <span className="text-[10px] text-gray-400">Showing {Math.min(visibleCount, validations.length)} of {validations.length}</span>
        </div>

        <div className="divide-y divide-gray-100">
          {validations.slice(0, visibleCount).map((item, i) => {
            const isScanning = i === scanningIndex;
            return (
              <div
                key={item.id}
                className={`relative px-4 py-2.5 flex items-center gap-3 transition-all duration-300
                  ${isScanning ? 'bg-green-50' : ''}
                  ${i < visibleCount ? 'demo-animate-fadeIn' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {isScanning && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#00a666] to-transparent demo-animate-scanLine" />
                  </div>
                )}

                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                  ${item.status === 'valid' ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {item.status === 'valid' ? (
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{item.questionText}</p>
                  {item.issue && (
                    <p className="text-[10px] text-amber-600 mt-0.5">{item.issue}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.checks.map((check) => (
                    <span key={check} className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">
                      {check}
                    </span>
                  ))}
                </div>

                <div className={`text-xs font-bold flex-shrink-0 w-10 text-right
                  ${item.confidence >= 90 ? 'text-green-600' : item.confidence >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                  {item.confidence}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
