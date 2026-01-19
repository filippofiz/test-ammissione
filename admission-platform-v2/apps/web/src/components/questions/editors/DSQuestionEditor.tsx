/**
 * DS (Data Sufficiency) Question Editor Component
 * Simple text-based editor for DS question fields
 */

interface DSQuestionEditorProps {
  questionData: {
    problem?: string;
    statement1?: string;
    statement2?: string;
  };
  correctAnswer?: string;
  onChange: (field: string, value: any) => void;
}

const DS_ANSWER_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

export function DSQuestionEditor({
  questionData,
  correctAnswer,
  onChange,
}: DSQuestionEditorProps) {
  return (
    <div className="space-y-4">
      {/* Problem Statement */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Problem Statement
        </label>
        <textarea
          value={questionData.problem || ''}
          onChange={(e) => onChange('question_data.problem', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[120px] font-mono text-sm"
          placeholder="Enter the problem statement (supports LaTeX)"
        />
      </div>

      {/* Statement 1 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Statement (1)
        </label>
        <textarea
          value={questionData.statement1 || ''}
          onChange={(e) => onChange('question_data.statement1', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[80px] font-mono text-sm"
          placeholder="Enter statement 1 (supports LaTeX)"
        />
      </div>

      {/* Statement 2 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Statement (2)
        </label>
        <textarea
          value={questionData.statement2 || ''}
          onChange={(e) => onChange('question_data.statement2', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[80px] font-mono text-sm"
          placeholder="Enter statement 2 (supports LaTeX)"
        />
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Correct Answer
        </label>
        <select
          value={correctAnswer || ''}
          onChange={(e) => onChange('answers.correct_answer', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent bg-white"
        >
          <option value="">Select correct answer</option>
          {DS_ANSWER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          A: (1) alone sufficient | B: (2) alone sufficient | C: Both together | D: Each alone | E: Neither sufficient
        </p>
      </div>
    </div>
  );
}
