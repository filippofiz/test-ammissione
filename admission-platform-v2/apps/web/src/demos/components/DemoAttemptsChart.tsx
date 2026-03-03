interface Attempt {
  number: number;
  date: string;
  overall: number;
  sections: { name: string; score: number }[];
}

interface AttemptsChartProps {
  examName: string;
  attempts: Attempt[];
  visibleAttempts: number;
  showBars: boolean;
}

const ATTEMPT_COLORS = ['#EF4444', '#F59E0B', '#00a666'];

export function DemoAttemptsChart({ examName, attempts, visibleAttempts, showBars }: AttemptsChartProps) {
  const chartW = 500;
  const chartH = 180;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const sectionNames = attempts[0]?.sections.map(s => s.name) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800">Confronto Tentativi</h2>
        <p className="text-xs text-gray-500">Simulazione {examName} — Progresso nel tempo</p>
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: '200px' }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(v => {
            const y = padT + innerH - (v / 100) * innerH;
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={padL - 6} y={y + 3} textAnchor="end" className="text-[8px]" fill="#9ca3af">{v}%</text>
              </g>
            );
          })}

          {/* Attempt lines */}
          {attempts.slice(0, visibleAttempts).map((attempt, ai) => {
            const sections = attempt.sections;
            const points = sections.map((s, si) => {
              const x = padL + (si / (sections.length - 1)) * innerW;
              const y = padT + innerH - (s.score / 100) * innerH;
              return { x, y, score: s.score };
            });
            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const color = ATTEMPT_COLORS[ai];

            return (
              <g key={ai} className="demo-animate-fadeIn" style={{ animationDelay: `${ai * 300}ms` }}>
                <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points.map(p => `${p.x},${p.y}`).join(' ')} className="demo-chart-line" />
                {points.map((p, pi) => (
                  <g key={pi}>
                    <circle cx={p.x} cy={p.y} r="4" fill={color} />
                    <circle cx={p.x} cy={p.y} r="7" fill={color} fillOpacity="0.15" />
                  </g>
                ))}
                {/* Overall score label */}
                <text x={chartW - padR + 8} y={padT + innerH - (attempt.overall / 100) * innerH + 4} fill={color} className="text-[9px] font-bold">
                  {attempt.overall}%
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {sectionNames.map((name, i) => {
            const x = padL + (i / (sectionNames.length - 1)) * innerW;
            return <text key={i} x={x} y={chartH - 4} textAnchor="middle" fill="#9ca3af" className="text-[7px]">{name}</text>;
          })}
        </svg>

        {/* Legend + improvement badges */}
        <div className="flex items-center justify-center gap-4 mt-2">
          {attempts.slice(0, visibleAttempts).map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ATTEMPT_COLORS[i] }} />
              <span className="text-[10px] text-gray-600">Tentativo {a.number} — {a.date}</span>
              {i > 0 && (
                <span className="demo-animate-bounceIn text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                  +{a.overall - attempts[i - 1].overall}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section bars */}
      {showBars && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Dettaglio per Sezione</h3>
          <div className="space-y-3">
            {sectionNames.map((name, si) => (
              <div key={name}>
                <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                  <span>{name}</span>
                  <span className="font-bold text-gray-800">{attempts[visibleAttempts - 1]?.sections[si]?.score}%</span>
                </div>
                <div className="flex gap-1 h-3">
                  {attempts.slice(0, visibleAttempts).map((a, ai) => (
                    <div key={ai} className="flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full demo-progress-bar"
                        style={{ width: `${a.sections[si].score}%`, backgroundColor: ATTEMPT_COLORS[ai] }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
