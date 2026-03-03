interface QuestionType {
  type: string;
  color: string;
  description: string;
  sampleQuestion: string;
}

interface GalleryProps {
  questionTypes: QuestionType[];
  visibleCount: number;
  activeCard: number | null;
}

export function DemoQuestionGallery({ questionTypes, visibleCount, activeCard }: GalleryProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="demo-animate-fadeInUp text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Supported Question Types</h1>
        <p className="text-gray-500 text-sm">6 advanced question formats for comprehensive assessment</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {questionTypes.slice(0, visibleCount).map((qt, i) => {
          const isActive = activeCard === i;
          return (
            <div
              key={qt.type}
              className={`demo-animate-fadeInUp bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-all duration-500
                ${isActive ? 'border-[#00a666] scale-[1.03] shadow-xl' : 'border-gray-100'}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Color bar */}
              <div className="h-1.5" style={{ backgroundColor: qt.color }} />

              <div className="p-3">
                {/* Icon & type */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${qt.color}20` }}
                  >
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: qt.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-xs">{qt.type}</h3>
                    <p className="text-[10px] text-gray-400">{qt.description}</p>
                  </div>
                </div>

                {/* Sample question */}
                {isActive && (
                  <div className="demo-animate-slideDown mt-2 bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                    <div className="text-[9px] text-gray-400 uppercase font-bold mb-1">Sample</div>
                    <p className="text-[11px] text-gray-700">{qt.sampleQuestion}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      {visibleCount >= questionTypes.length && (
        <div className="demo-animate-fadeInUp flex items-center justify-center gap-6 py-3">
          {[
            { value: '6', label: 'Question Types' },
            { value: '847', label: 'Questions in Bank' },
            { value: '5', label: 'Difficulty Levels' },
            { value: '15+', label: 'Subject Areas' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-[#00a666]">{stat.value}</div>
              <div className="text-[10px] text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
