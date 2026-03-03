interface QuestionCardProps {
  questionNumber: number;
  text: string;
  options: string[];
  correctAnswer: string;
  studentAnswer: string | null;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: string;
  section: string;
  isExpanded: boolean;
  onToggle?: () => void;
}

export function DemoQuestionCard({
  questionNumber,
  text,
  options,
  correctAnswer,
  studentAnswer,
  isCorrect,
  timeSpent,
  difficulty,
  section,
  isExpanded,
}: QuestionCardProps) {
  const borderColor = studentAnswer === null ? 'border-gray-300' : isCorrect ? 'border-green-400' : 'border-red-400';
  const bgColor = studentAnswer === null ? 'bg-gray-50' : isCorrect ? 'bg-green-50/30' : 'bg-red-50/30';
  const diffColor = difficulty === 'Easy' ? 'bg-green-100 text-green-700' : difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-xl overflow-hidden transition-all duration-500`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${isCorrect ? 'bg-green-100/50' : studentAnswer === null ? 'bg-gray-100/50' : 'bg-red-100/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${isCorrect ? 'bg-[#00a666]' : studentAnswer === null ? 'bg-gray-400' : 'bg-red-500'}`}>
            {isCorrect ? '\u2713' : studentAnswer === null ? '-' : '\u2717'}
          </div>
          <span className="font-semibold text-gray-800">Q{questionNumber}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor}`}>{difficulty}</span>
          <span className="text-xs text-gray-400">{section}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeSpent}s
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 py-4 demo-animate-slideDown">
          {/* Question text */}
          <p className="text-gray-800 font-medium mb-4">{text}</p>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {options.map((opt, i) => {
              const label = optionLabels[i];
              const isStudentChoice = studentAnswer === label;
              const isCorrectOption = correctAnswer === label;
              let optBg = 'bg-white border-gray-200';
              if (isCorrectOption) optBg = 'bg-green-100 border-green-400';
              if (isStudentChoice && !isCorrect) optBg = 'bg-red-100 border-red-400';

              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 ${optBg} transition-colors`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${isCorrectOption ? 'bg-[#00a666] text-white' : isStudentChoice && !isCorrect ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {label}
                  </div>
                  <span className="text-sm text-gray-700">{opt}</span>
                  {isCorrectOption && <span className="ml-auto text-xs text-[#00a666] font-semibold">\u2713 Correct</span>}
                  {isStudentChoice && !isCorrect && <span className="ml-auto text-xs text-red-500 font-semibold">Your answer</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
