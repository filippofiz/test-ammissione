/**
 * QRQuestionEditor
 * Structured editor for Quantitative Reasoning multiple-choice questions.
 * Uses LaTeXEditor for all text fields so math expressions render with syntax highlighting.
 */

import { LaTeXEditor } from './LaTeXEditor';

interface QRQuestionEditorProps {
  questionText: string;
  options: Record<string, string>;
  correctAnswer: string;
  onQuestionTextChange: (value: string) => void;
  onOptionChange: (key: string, value: string) => void;
  onCorrectAnswerChange: (key: string) => void;
}

export function QRQuestionEditor({
  questionText,
  options,
  correctAnswer,
  onQuestionTextChange,
  onOptionChange,
  onCorrectAnswerChange,
}: QRQuestionEditorProps) {
  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Text
        </label>
        <LaTeXEditor
          value={questionText}
          onChange={onQuestionTextChange}
          placeholder="Enter the question text… supports LaTeX ($…$) and **bold**"
          minHeight="96px"
        />
      </div>

      {/* Answer Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Answer Options
        </label>
        <div className="space-y-2">
          {['a', 'b', 'c', 'd', 'e'].map(opt => (
            <div key={opt} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => onCorrectAnswerChange(opt)}
                className={`mt-1 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  correctAnswer === opt
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={correctAnswer === opt ? 'Correct answer' : 'Set as correct'}
              >
                {opt.toUpperCase()}
              </button>
              <div className="flex-1">
                <LaTeXEditor
                  value={options[opt] || ''}
                  onChange={(value) => onOptionChange(opt, value)}
                  placeholder={`Option ${opt.toUpperCase()} — supports LaTeX ($…$)`}
                  minHeight="48px"
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click the letter button to mark the correct answer.
        </p>
      </div>
    </div>
  );
}
