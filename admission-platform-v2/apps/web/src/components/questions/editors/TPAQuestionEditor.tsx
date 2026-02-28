/**
 * TPA (Two-Part Analysis) Question Editor Component
 * Simple text-based editor for TPA question fields
 */

interface TPAQuestionEditorProps {
  questionData: {
    scenario?: string;
    column1_title?: string;
    column2_title?: string;
    shared_options?: string[];
  };
  // DB stores correct_answer as [{col1, col2}] — accept both the array and the unwrapped object
  correctAnswer?: { col1?: string; col2?: string } | [{ col1?: string; col2?: string }];
  onChange: (field: string, value: any) => void;
}

export function TPAQuestionEditor({
  questionData,
  correctAnswer: correctAnswerRaw,
  onChange,
}: TPAQuestionEditorProps) {
  const options = questionData.shared_options || [];

  // Unwrap DB array format [{col1, col2}] → {col1, col2}
  const correctAnswer: { col1?: string; col2?: string } =
    Array.isArray(correctAnswerRaw) && correctAnswerRaw.length > 0
      ? correctAnswerRaw[0]
      : (correctAnswerRaw as { col1?: string; col2?: string }) || {};

  // Always save in DB array format [{col1, col2}]
  const saveCorrectAnswer = (updated: { col1?: string; col2?: string }) => {
    onChange('answers.correct_answer', [updated]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = options.map((o, i) => (i === index ? value : o));
    onChange('question_data.shared_options', updated);
    // If the changed option was a correct answer, keep it in sync
    const newCorrect = { ...correctAnswer };
    if (newCorrect.col1 === options[index]) newCorrect.col1 = value;
    if (newCorrect.col2 === options[index]) newCorrect.col2 = value;
    if (newCorrect.col1 !== correctAnswer.col1 || newCorrect.col2 !== correctAnswer.col2) {
      saveCorrectAnswer(newCorrect);
    }
  };

  const handleAddOption = () => {
    onChange('question_data.shared_options', [...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    const removed = options[index];
    const updated = options.filter((_, i) => i !== index);
    onChange('question_data.shared_options', updated);
    // Clear correct answer if removed option was selected
    const newCorrect = { ...correctAnswer };
    if (newCorrect.col1 === removed) newCorrect.col1 = '';
    if (newCorrect.col2 === removed) newCorrect.col2 = '';
    saveCorrectAnswer(newCorrect);
  };

  const handleCorrectCol1Change = (value: string) => {
    saveCorrectAnswer({ ...correctAnswer, col1: value });
  };

  const handleCorrectCol2Change = (value: string) => {
    saveCorrectAnswer({ ...correctAnswer, col2: value });
  };

  return (
    <div className="space-y-4">
      {/* Scenario */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Scenario
        </label>
        <textarea
          value={questionData.scenario || ''}
          onChange={(e) => onChange('question_data.scenario', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[150px] font-mono text-sm"
          placeholder="Enter the scenario text (supports LaTeX)"
        />
      </div>

      {/* Column Titles */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Column 1 Title
          </label>
          <input
            type="text"
            value={questionData.column1_title || ''}
            onChange={(e) => onChange('question_data.column1_title', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            placeholder="e.g., First Value (supports LaTeX)"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Column 2 Title
          </label>
          <input
            type="text"
            value={questionData.column2_title || ''}
            onChange={(e) => onChange('question_data.column2_title', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            placeholder="e.g., Second Value (supports LaTeX)"
          />
        </div>
      </div>

      {/* Shared Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Shared Options
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-gray-400 w-6 shrink-0 text-right">{index + 1}.</span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent font-mono text-sm"
                placeholder={`Option ${index + 1} (supports LaTeX)`}
              />
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Remove option"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddOption}
          className="mt-2 px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors w-full"
        >
          + Add option
        </button>
      </div>

      {/* Correct Answers */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Correct Answers
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {questionData.column1_title || 'Column 1'}
            </label>
            <select
              value={correctAnswer?.col1 || ''}
              onChange={(e) => handleCorrectCol1Change(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm bg-white"
            >
              <option value="">— select correct option —</option>
              {options.filter(o => o.trim()).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {questionData.column2_title || 'Column 2'}
            </label>
            <select
              value={correctAnswer?.col2 || ''}
              onChange={(e) => handleCorrectCol2Change(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm bg-white"
            >
              <option value="">— select correct option —</option>
              {options.filter(o => o.trim()).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
