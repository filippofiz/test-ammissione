import { useState, useEffect, useRef } from 'react';

interface Section {
  name: string;
  mastery: number;
  status: 'strong' | 'good' | 'weak';
}

interface EndOfPathReportProps {
  examName: string;
  studentName: string;
  startScore: number;
  finalScore: number;
  improvement: number;
  totalQuestionsPracticed: number;
  totalTimeSpent: string;
  simulationsCompleted: number;
  sections: Section[];
  strengths: string[];
  improved: string[];
  readyForExam: boolean;
  showProgress: boolean;
  visibleSections: number;
  showStats: boolean;
  showStrengths: boolean;
  showBadge: boolean;
}

const statusColors = { strong: '#00a666', good: '#F59E0B', weak: '#EF4444' };
const statusLabels = { strong: 'Eccellente', good: 'Buono', weak: 'Da migliorare' };

export function DemoEndOfPathReport({
  examName, studentName, startScore, finalScore, improvement, totalQuestionsPracticed, totalTimeSpent, simulationsCompleted, sections, strengths, improved, showProgress, visibleSections, showStats, showStrengths, showBadge,
}: EndOfPathReportProps) {
  const [displayScore, setDisplayScore] = useState(startScore);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!showProgress) { setDisplayScore(startScore); return; }
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startScore + eased * (finalScore - startScore)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [showProgress, startScore, finalScore]);

  const arcProgress = (displayScore - startScore) / (finalScore - startScore);

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {/* Header */}
      <div className="demo-animate-fadeInUp bg-gradient-to-r from-[rgb(28,37,69)] to-[rgb(40,52,96)] rounded-xl p-4 text-white text-center">
        <h2 className="text-lg font-bold">Report di Fine Percorso</h2>
        <p className="text-blue-200 text-xs">{examName} — {studentName}</p>
      </div>

      {/* Progress arc + stats side by side */}
      <div className="flex gap-3">
        {/* Score arc */}
        {showProgress && (
          <div className="demo-animate-bounceIn bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center flex-shrink-0" style={{ width: '220px' }}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Punteggio Finale</div>
            <div className="relative w-32 h-32 mx-auto mb-2">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeDasharray="400" strokeDashoffset="100" strokeLinecap="round" transform="rotate(135 100 100)" />
                <circle cx="100" cy="100" r="85" fill="none" stroke="#00a666" strokeWidth="12" strokeDasharray={`${arcProgress * 400} 1000`} strokeDashoffset="0" strokeLinecap="round" transform="rotate(135 100 100)" className="transition-all duration-100" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#00a666]">{displayScore}%</span>
                <span className="text-[9px] text-gray-400">da {startScore}%</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
              {'\u2191'} +{improvement}% miglioramento
            </div>
          </div>
        )}

        {/* Stats grid */}
        {showStats && (
          <div className="flex-1 grid grid-cols-3 gap-2">
            {[
              { value: totalQuestionsPracticed, label: 'Domande Praticate', icon: '📝' },
              { value: totalTimeSpent, label: 'Tempo di Studio', icon: '⏱️' },
              { value: simulationsCompleted, label: 'Simulazioni', icon: '🎯' },
            ].map((stat, i) => (
              <div key={i} className="demo-animate-fadeInUp bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-center" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-[9px] text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section mastery */}
      {visibleSections > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Padronanza per Sezione</h3>
          <div className="space-y-2.5">
            {sections.slice(0, visibleSections).map((s, i) => (
              <div key={s.name} className="demo-animate-fadeIn" style={{ animationDelay: `${i * 200}ms` }}>
                <div className="flex justify-between items-center text-xs mb-0.5">
                  <span className="text-gray-600">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${statusColors[s.status]}15`, color: statusColors[s.status] }}>
                      {statusLabels[s.status]}
                    </span>
                    <span className="font-bold text-gray-800">{s.mastery}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full demo-progress-bar" style={{ width: `${s.mastery}%`, backgroundColor: statusColors[s.status] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths + Improvements side by side */}
      {showStrengths && (
        <div className="grid grid-cols-2 gap-3">
          <div className="demo-animate-slideInLeft bg-green-50 rounded-xl border border-green-200 p-3">
            <h3 className="text-[10px] font-bold text-green-700 uppercase mb-2">Punti di Forza</h3>
            <ul className="space-y-1">
              {strengths.map((s) => (
                <li key={s} className="flex items-center gap-1.5 text-xs text-green-800">
                  <span className="text-green-500">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="demo-animate-slideInRight bg-blue-50 rounded-xl border border-blue-200 p-3">
            <h3 className="text-[10px] font-bold text-blue-700 uppercase mb-2">Aree Migliorate</h3>
            <ul className="space-y-1">
              {improved.map((s) => (
                <li key={s} className="flex items-center gap-1.5 text-xs text-blue-800">
                  <span className="text-blue-500">{'\u2191'}</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Ready badge */}
      {showBadge && (
        <div className="demo-animate-bounceIn bg-gradient-to-r from-[#00a666] to-emerald-500 rounded-xl p-4 text-center text-white">
          <div className="text-2xl mb-1">🎓</div>
          <h3 className="text-lg font-bold">Pronto per l'esame!</h3>
          <p className="text-emerald-100 text-xs">Hai raggiunto un livello eccellente in tutte le aree</p>
        </div>
      )}
    </div>
  );
}
