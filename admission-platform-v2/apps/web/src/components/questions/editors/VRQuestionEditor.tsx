/**
 * VRQuestionEditor
 * Structured editor for Verbal Reasoning multiple-choice questions.
 * Uses LaTeXEditor for all text fields so math expressions and markdown
 * render with syntax highlighting.
 */

import { LaTeXEditor } from './LaTeXEditor';

interface VRQuestionEditorProps {
  vrType: 'critical_reasoning' | 'reading_comprehension';
  passageText: string;
  questionText: string;
  options: Record<string, string>;
  correctAnswer: string;
  onVRTypeChange: (type: 'critical_reasoning' | 'reading_comprehension') => void;
  onPassageTextChange: (value: string) => void;
  onQuestionTextChange: (value: string) => void;
  onOptionChange: (key: string, value: string) => void;
  onCorrectAnswerChange: (key: string) => void;
}

export function VRQuestionEditor({
  vrType,
  passageText,
  questionText,
  options,
  correctAnswer,
  onVRTypeChange,
  onPassageTextChange,
  onQuestionTextChange,
  onOptionChange,
  onCorrectAnswerChange,
}: VRQuestionEditorProps) {
  return (
    <div className="space-y-4">
      {/* VR Sub-type selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Sub-type
        </label>
        <div className="flex gap-2">
          {(
            [
              { value: 'critical_reasoning', label: 'Critical Reasoning' },
              { value: 'reading_comprehension', label: 'Reading Comprehension' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onVRTypeChange(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                vrType === value
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Passage / Argument */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {vrType === 'critical_reasoning' ? 'Argument / Stimulus' : 'Reading Passage'}
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <LaTeXEditor
          value={passageText}
          onChange={onPassageTextChange}
          placeholder={
            vrType === 'critical_reasoning'
              ? 'Enter the argument or stimulus that the question refers to…'
              : 'Enter the reading passage that contains the information for answering the question…'
          }
          minHeight="128px"
        />
        <p className="text-xs text-gray-500 mt-1">
          {vrType === 'critical_reasoning'
            ? 'The argument or scenario the question asks about.'
            : 'The passage that contains the information needed to answer the question.'}
        </p>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Text
        </label>
        <LaTeXEditor
          value={questionText}
          onChange={onQuestionTextChange}
          placeholder="Enter the question (e.g. 'Which of the following most weakens the argument above?')"
          minHeight="72px"
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
                  placeholder={`Option ${opt.toUpperCase()}`}
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
