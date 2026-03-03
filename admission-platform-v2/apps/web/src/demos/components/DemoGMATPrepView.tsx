interface Section {
  name: string;
  color: string;
  icon: string;
  topics: { name: string; progress: number; completed: number; total: number }[];
}

interface GMATPrepViewProps {
  sections: Section[];
  nextRecommended: string;
  visibleSections: number;
  animateProgress: boolean;
  showRecommended: boolean;
}

const ICONS: Record<string, string> = {
  calculator: '\u{1F5A9}',
  chart: '\u{1F4CA}',
  book: '\u{1F4D6}',
};

export function DemoGMATPrepView({ sections, nextRecommended, visibleSections, animateProgress, showRecommended }: GMATPrepViewProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-3">
      {/* Header */}
      <div className="demo-animate-fadeInUp bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
        <h1 className="text-lg font-bold mb-0.5">GMAT Preparation</h1>
        <p className="text-indigo-200 text-xs">Track your progress across all GMAT sections</p>
      </div>

      {/* Recommended next */}
      {showRecommended && (
        <div className="demo-animate-bounceIn bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] text-amber-600 font-bold uppercase">Recommended Next</div>
            <div className="text-xs font-semibold text-amber-900">{nextRecommended}</div>
          </div>
        </div>
      )}

      {/* Section columns */}
      <div className="grid grid-cols-3 gap-3">
        {sections.slice(0, visibleSections).map((section, si) => {
          const totalProgress = Math.round(
            section.topics.reduce((sum, t) => sum + t.progress, 0) / section.topics.length
          );

          return (
            <div
              key={section.name}
              className="demo-animate-fadeInUp bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              style={{ animationDelay: `${si * 200}ms` }}
            >
              {/* Section header */}
              <div className="p-3 text-center" style={{ borderTop: `3px solid ${section.color}` }}>
                <div className="text-2xl mb-1">{ICONS[section.icon] || '\u{1F4DA}'}</div>
                <h3 className="font-bold text-gray-800 text-sm">{section.name}</h3>
                <div className="text-[10px] text-gray-400 mt-0.5">Overall: {totalProgress}%</div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                    style={{
                      width: animateProgress ? `${totalProgress}%` : '0%',
                      backgroundColor: section.color,
                    }}
                  />
                </div>
              </div>

              {/* Topics */}
              <div className="px-3 pb-3 space-y-2">
                {section.topics.map((topic) => (
                  <div key={topic.name}>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-gray-600">{topic.name}</span>
                      <span className="font-medium text-gray-800">{topic.completed}/{topic.total}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                        style={{
                          width: animateProgress ? `${topic.progress}%` : '0%',
                          backgroundColor: section.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    {topic.progress === 100 && (
                      <div className="text-[9px] text-green-600 font-medium mt-0.5">{'\u2713'} Complete</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
