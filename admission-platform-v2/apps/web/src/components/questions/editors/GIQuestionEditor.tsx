/**
 * GI (Graphical Interpretation) Question Editor Component
 * Simple text-based editor for GI question fields
 */

import { LaTeXEditor } from './LaTeXEditor';

interface GIQuestionEditorProps {
  questionData: {
    context_text?: string;
    statement_text?: string;
    blank1_options?: string[];
    blank2_options?: string[];
    image_url?: string;
  };
  correctAnswer?: string[] | { blank1?: string; blank2?: string };
  onChange: (field: string, value: any) => void;
}

export function GIQuestionEditor({
  questionData,
  correctAnswer,
  onChange,
}: GIQuestionEditorProps) {
  // Normalize correct answer format
  let blank1Correct = '';
  let blank2Correct = '';

  if (Array.isArray(correctAnswer)) {
    blank1Correct = correctAnswer[0] || '';
    blank2Correct = correctAnswer[1] || '';
  } else if (correctAnswer && typeof correctAnswer === 'object') {
    blank1Correct = correctAnswer.blank1 || '';
    blank2Correct = correctAnswer.blank2 || '';
  }

  const handleCorrectAnswerChange = (blank: 'blank1' | 'blank2', value: string) => {
    // Store as array format [blank1, blank2]
    const newCorrect = blank === 'blank1'
      ? [value, blank2Correct]
      : [blank1Correct, value];
    onChange('answers.correct_answer', newCorrect);
  };

  return (
    <div className="space-y-4">
      {/* Image URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={questionData.image_url || ''}
          onChange={(e) => onChange('question_data.image_url', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="https://example.com/chart.png"
          spellCheck={false}
        />
      </div>

      {/* Context Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Context Text
        </label>
        <LaTeXEditor
          value={questionData.context_text || ''}
          onChange={(value) => onChange('question_data.context_text', value)}
          placeholder="Enter context text describing the graph (supports LaTeX)"
          minHeight="100px"
        />
      </div>

      {/* Statement Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Statement Text
        </label>
        <LaTeXEditor
          value={questionData.statement_text || ''}
          onChange={(value) => onChange('question_data.statement_text', value)}
          placeholder="Use [BLANK1] and [BLANK2] for dropdown placeholders"
          minHeight="100px"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use [BLANK1] and [BLANK2] to mark where dropdown options appear
        </p>
      </div>

      {/* Blank 1 Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Blank 1 Options (comma-separated)
        </label>
        <input
          type="text"
          value={(questionData.blank1_options || []).join(', ')}
          onChange={(e) => {
            const options = e.target.value.split(',').map(o => o.trim()).filter(o => o);
            onChange('question_data.blank1_options', options);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="Option A, Option B, Option C"
          spellCheck={false}
        />
      </div>

      {/* Blank 1 Correct Answer */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Blank 1 Correct Answer
        </label>
        <input
          type="text"
          value={blank1Correct}
          onChange={(e) => handleCorrectAnswerChange('blank1', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="Enter the correct value for blank 1"
          spellCheck={false}
        />
      </div>

      {/* Blank 2 Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Blank 2 Options (comma-separated)
        </label>
        <input
          type="text"
          value={(questionData.blank2_options || []).join(', ')}
          onChange={(e) => {
            const options = e.target.value.split(',').map(o => o.trim()).filter(o => o);
            onChange('question_data.blank2_options', options);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="Option X, Option Y, Option Z"
          spellCheck={false}
        />
      </div>

      {/* Blank 2 Correct Answer */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Blank 2 Correct Answer
        </label>
        <input
          type="text"
          value={blank2Correct}
          onChange={(e) => handleCorrectAnswerChange('blank2', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="Enter the correct value for blank 2"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
