// DemoTestInterface — simulated test-taking UI

interface TestQuestion {
  id: string;
  number: number;
  section: string;
  text: string;
  options: { label: string; text: string }[];
  difficulty: string;
  timeLimit: number;
}

interface TestInterfaceProps {
  questions: TestQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  timeRemaining: number;
  isFlagged: boolean;
  showHighlight: boolean; // Highlight the selected answer with animation
}

export function DemoTestInterface({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  timeRemaining,
  isFlagged,
  showHighlight,
}: TestInterfaceProps) {
  const question = questions[currentQuestionIndex];
  if (!question) return null;

  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const diffColor = question.difficulty === 'Easy' ? 'text-green-600' : question.difficulty === 'Medium' ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[rgb(28,37,69)] to-[rgb(40,52,96)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold">Bocconi Admission Test</span>
          <span className="text-blue-200 text-sm">{question.section}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${timeRemaining < 60 ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-bold demo-score-text">{formatTime(timeRemaining)}</span>
          </div>
          {/* Question counter */}
          <div className="text-white text-sm">
            <span className="font-bold">{currentQuestionIndex + 1}</span>
            <span className="text-blue-200"> / {totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-[#00a666] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Question content */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1 rounded-lg">
            Question {question.number}
          </span>
          <span className={`text-sm font-medium ${diffColor}`}>{question.difficulty}</span>
          {isFlagged && (
            <span className="demo-animate-bounceIn bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Flagged
            </span>
          )}
        </div>

        <p className="text-lg text-gray-800 leading-relaxed mb-8">{question.text}</p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((opt) => {
            const isSelected = selectedAnswer === opt.label;
            return (
              <div
                key={opt.label}
                className={`relative flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? 'border-[#00a666] bg-[#00a666]/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${isSelected && showHighlight ? 'demo-animate-pulseGlow' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${isSelected ? 'bg-[#00a666] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {opt.label}
                </div>
                <span className={`text-base ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                  {opt.text}
                </span>
                {isSelected && (
                  <div className="ml-auto">
                    <svg className="w-6 h-6 text-[#00a666]" fill="currentColor" viewBox="0 0 24 24">
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
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <button className="px-5 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-300 transition-colors">
          \u2190 Previous
        </button>
        <div className="flex items-center gap-3">
          <button className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${isFlagged ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' : 'bg-gray-100 text-gray-500'}`}>
            <svg className="w-4 h-4 inline mr-1" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Flag
          </button>
          <button className={`px-6 py-2.5 rounded-xl font-bold text-white transition-colors ${selectedAnswer ? 'bg-[#00a666] hover:bg-[#008855]' : 'bg-gray-300 cursor-not-allowed'}`}>
            Next \u2192
          </button>
        </div>
      </div>
    </div>
  );
}
