interface QuestionStatus {
  number: number;
  status: 'answered' | 'flagged' | 'current' | 'unanswered' | 'not-visited';
}

interface TestNavProps {
  questions: QuestionStatus[];
  isVisible: boolean;
  currentQuestion: number;
}

export function DemoTestNav({ questions, isVisible, currentQuestion }: TestNavProps) {
  if (!isVisible) return null;

  const getColor = (status: QuestionStatus['status']) => {
    switch (status) {
      case 'answered': return 'bg-[#00a666] text-white';
      case 'flagged': return 'bg-yellow-400 text-yellow-900';
      case 'current': return 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2';
      case 'unanswered': return 'bg-gray-200 text-gray-600';
      case 'not-visited': return 'bg-gray-100 text-gray-400';
    }
  };

  const answered = questions.filter(q => q.status === 'answered').length;
  const flagged = questions.filter(q => q.status === 'flagged').length;

  return (
    <div className="demo-animate-slideInRight bg-white rounded-2xl shadow-xl border border-gray-200 p-5 w-72">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Question Navigator</h3>

      {/* Summary */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#00a666]" />
          <span className="text-gray-600">{answered} Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-gray-600">{flagged} Flagged</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q) => (
          <button
            key={q.number}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${getColor(q.status)} ${q.number === currentQuestion ? 'scale-110' : ''}`}
          >
            {q.number}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        {[
          { color: 'bg-[#00a666]', label: 'Answered' },
          { color: 'bg-yellow-400', label: 'Flagged for Review' },
          { color: 'bg-blue-500', label: 'Current' },
          { color: 'bg-gray-200', label: 'Unanswered' },
          { color: 'bg-gray-100', label: 'Not Visited' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
