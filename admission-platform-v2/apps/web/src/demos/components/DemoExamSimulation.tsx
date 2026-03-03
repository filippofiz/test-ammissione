// DemoExamSimulation — configurable exam simulation UI

interface ExamQuestion {
  id: string;
  number: number;
  section: string;
  text: string;
  options: { label: string; text: string }[];
  difficulty: string;
  timeLimit: number;
}

interface ExamSimulationProps {
  examName: string;
  examSubtitle: string;
  examColor: string;
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  timeRemaining: number;
  totalQuestions: number;
  isFlagged: boolean;
  showHighlight: boolean;
  language: 'it' | 'en';
}

const labels = {
  it: { prev: 'Precedente', next: 'Prossima', flag: 'Contrassegna', flagged: 'Contrassegnata', question: 'Domanda', of: 'di' },
  en: { prev: 'Previous', next: 'Next', flag: 'Flag', flagged: 'Flagged', question: 'Question', of: 'of' },
};

const diffLabels: Record<string, Record<string, { color: string }>> = {
  it: { 'Facile': { color: 'text-green-600' }, 'Media': { color: 'text-amber-600' }, 'Difficile': { color: 'text-red-600' } },
  en: { 'Easy': { color: 'text-green-600' }, 'Medium': { color: 'text-amber-600' }, 'Hard': { color: 'text-red-600' } },
};

export function DemoExamSimulation({
  examName, examSubtitle, examColor, questions, currentQuestionIndex, selectedAnswer, timeRemaining, totalQuestions, isFlagged, showHighlight, language,
}: ExamSimulationProps) {
  const question = questions[currentQuestionIndex];
  if (!question) return null;

  const l = labels[language];
  const progress = ((question.number) / totalQuestions) * 100;
  const diffColor = diffLabels[language]?.[question.difficulty]?.color || 'text-gray-500';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-w-3xl mx-auto">
      {/* Top bar with exam branding */}
      <div className="px-5 py-2.5 flex items-center justify-between" style={{ backgroundColor: examColor }}>
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">{examName}</span>
          <span className="text-white/70 text-xs">{examSubtitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${timeRemaining < 60 ? 'bg-red-500/30 text-red-200' : 'bg-white/15 text-white'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-bold text-xs">{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-white text-xs">
            <span className="font-bold">{question.number}</span>
            <span className="text-white/60"> {l.of} {totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: examColor }} />
      </div>

      {/* Question content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-lg">
            {l.question} {question.number}
          </span>
          <span className={`text-xs font-medium ${diffColor}`}>{question.difficulty}</span>
          <span className="text-xs text-gray-400">{question.section}</span>
          {isFlagged && (
            <span className="demo-animate-bounceIn text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${examColor}15`, color: examColor }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {l.flagged}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-800 leading-relaxed mb-6 whitespace-pre-line">{question.text}</p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = selectedAnswer === opt.label;
            return (
              <div
                key={opt.label}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-300 cursor-pointer
                  ${isSelected ? 'shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                  ${isSelected && showHighlight ? 'demo-animate-pulseGlow' : ''}`}
                style={isSelected ? { borderColor: examColor, backgroundColor: `${examColor}08` } : undefined}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={isSelected ? { backgroundColor: examColor, color: 'white' } : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
                >
                  {opt.label}
                </div>
                <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                  {opt.text}
                </span>
                {isSelected && (
                  <div className="ml-auto">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: examColor }}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg font-medium text-xs hover:bg-gray-300 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {l.prev}
        </button>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${isFlagged ? 'border-2' : 'bg-gray-100 text-gray-500'}`}
            style={isFlagged ? { backgroundColor: `${examColor}10`, color: examColor, borderColor: `${examColor}40` } : undefined}>
            <svg className="w-3.5 h-3.5 inline mr-1" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {isFlagged ? l.flagged : l.flag}
          </button>
          <button
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg font-bold text-white text-xs transition-colors"
            style={{ backgroundColor: selectedAnswer ? examColor : '#d1d5db', cursor: selectedAnswer ? 'pointer' : 'not-allowed' }}
          >
            {l.next}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
