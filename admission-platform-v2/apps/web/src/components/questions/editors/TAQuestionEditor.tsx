/**
 * TA (Table Analysis) Question Editor Component
 * Structured editor for TA question fields — no raw JSON editing required
 */

import { LaTeXEditor } from './LaTeXEditor';

interface TAStatement {
  text: string;
}

interface TAQuestionEditorProps {
  questionData: {
    table_title?: string;
    stimulus_text?: string;
    column_headers?: string[];
    table_data?: string[][];
    statements?: TAStatement[];
    answer_col1_title?: string;
    answer_col2_title?: string;
    statement_column_title?: string;
  };
  // DB stores correct_answer as [{stmt0: "col1", stmt1: "col2", ...}] — accept both array and plain object
  correctAnswer?: Record<string, string> | [Record<string, string>];
  onChange: (field: string, value: any) => void;
}

export function TAQuestionEditor({
  questionData,
  correctAnswer: correctAnswerRaw,
  onChange,
}: TAQuestionEditorProps) {
  const headers = questionData.column_headers || [];
  const tableData = questionData.table_data || [];
  const statements = questionData.statements || [];
  const col1Label = questionData.answer_col1_title || 'True';
  const col2Label = questionData.answer_col2_title || 'False';

  // Unwrap DB array format [{...}] → {...}
  const correctAnswer: Record<string, string> =
    Array.isArray(correctAnswerRaw) && correctAnswerRaw.length > 0
      ? correctAnswerRaw[0]
      : (correctAnswerRaw as Record<string, string>) || {};

  // Always save in DB array format [{...}]
  const saveCorrectAnswer = (updated: Record<string, string>) => {
    onChange('answers.correct_answer', [updated]);
  };

  // ── Column headers ──────────────────────────────────────────────────────────

  const handleHeaderChange = (colIndex: number, value: string) => {
    const updated = headers.map((h, i) => (i === colIndex ? value : h));
    onChange('question_data.column_headers', updated);
  };

  const handleAddColumn = () => {
    const updatedHeaders = [...headers, ''];
    const updatedData = tableData.map(row => [...row, '']);
    onChange('question_data.column_headers', updatedHeaders);
    onChange('question_data.table_data', updatedData);
  };

  const handleRemoveColumn = (colIndex: number) => {
    const updatedHeaders = headers.filter((_, i) => i !== colIndex);
    const updatedData = tableData.map(row => row.filter((_, i) => i !== colIndex));
    onChange('question_data.column_headers', updatedHeaders);
    onChange('question_data.table_data', updatedData);
  };

  // ── Table rows ──────────────────────────────────────────────────────────────

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const updated = tableData.map((row, ri) =>
      ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row
    );
    onChange('question_data.table_data', updated);
  };

  const handleAddRow = () => {
    onChange('question_data.table_data', [...tableData, Array(headers.length).fill('')]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    onChange('question_data.table_data', tableData.filter((_, i) => i !== rowIndex));
  };

  // ── Statements + correct answers ────────────────────────────────────────────

  const handleStatementTextChange = (index: number, value: string) => {
    const updated = statements.map((s, i) => (i === index ? { ...s, text: value } : s));
    onChange('question_data.statements', updated);
  };

  const handleStatementCorrectChange = (index: number, value: 'col1' | 'col2') => {
    const key = `stmt${index}`;
    saveCorrectAnswer({ ...correctAnswer, [key]: value });
  };

  const handleAddStatement = () => {
    const index = statements.length;
    onChange('question_data.statements', [...statements, { text: '' }]);
    // Default new statement to col1 (True)
    saveCorrectAnswer({ ...correctAnswer, [`stmt${index}`]: 'col1' });
  };

  const handleRemoveStatement = (index: number) => {
    const updatedStatements = statements.filter((_, i) => i !== index);
    onChange('question_data.statements', updatedStatements);
    // Rebuild correct answer keys to stay consecutive
    const updatedCorrect: Record<string, string> = {};
    Object.entries(correctAnswer)
      .filter(([key]) => {
        const match = key.match(/^stmt(\d+)$/);
        return match ? parseInt(match[1], 10) !== index : true;
      })
      .forEach(([key, value]) => {
        const match = key.match(/^stmt(\d+)$/);
        if (match) {
          const i = parseInt(match[1], 10);
          const newI = i > index ? i - 1 : i;
          updatedCorrect[`stmt${newI}`] = value;
        } else {
          updatedCorrect[key] = value;
        }
      });
    saveCorrectAnswer(updatedCorrect);
  };

  return (
    <div className="space-y-6">
      {/* Stimulus Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Context / Stimulus Text
        </label>
        <LaTeXEditor
          value={questionData.stimulus_text || ''}
          onChange={(value) => onChange('question_data.stimulus_text', value)}
          placeholder="Introductory text describing the table and the task (supports LaTeX)"
          minHeight="100px"
        />
      </div>

      {/* Table Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Table Title
        </label>
        <LaTeXEditor
          value={questionData.table_title || ''}
          onChange={(value) => onChange('question_data.table_title', value)}
          placeholder="Title shown above the table (supports LaTeX)"
          minHeight="44px"
        />
      </div>

      {/* Answer Column Titles */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Column 1 Label
          </label>
          <input
            type="text"
            value={questionData.answer_col1_title || ''}
            onChange={(e) => onChange('question_data.answer_col1_title', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            placeholder="e.g. Yes, True, Correct, Supported"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Column 2 Label
          </label>
          <input
            type="text"
            value={questionData.answer_col2_title || ''}
            onChange={(e) => onChange('question_data.answer_col2_title', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            placeholder="e.g. No, False, Incorrect, Not Supported"
          />
        </div>
      </div>

      {/* Table Editor */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Table
        </label>
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-8 px-2 py-2 text-gray-400 font-normal text-center">#</th>
                {headers.map((header, colIndex) => (
                  <th key={colIndex} className="px-2 py-2 min-w-[140px]">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-brand-green focus:border-transparent"
                        placeholder={`Header ${colIndex + 1}`}
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(colIndex)}
                        className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors text-xs"
                        title="Remove column"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 w-10">
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="w-7 h-7 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 hover:border-brand-green hover:text-brand-green transition-colors text-sm"
                    title="Add column"
                  >
                    +
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 last:border-0">
                  <td className="px-2 py-2 text-center text-xs text-gray-400">{rowIndex + 1}</td>
                  {headers.map((_, colIndex) => (
                    <td key={colIndex} className="px-2 py-2">
                      <input
                        type="text"
                        value={row[colIndex] ?? ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-brand-green focus:border-transparent"
                        placeholder="cell value"
                        spellCheck={false}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rowIndex)}
                      className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors text-xs"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {headers.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">
              Add a column to start building the table
            </p>
          )}
        </div>

        {headers.length > 0 && (
          <button
            type="button"
            onClick={handleAddRow}
            className="mt-2 px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors w-full"
          >
            + Add row
          </button>
        )}
      </div>

      {/* Statements */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Statements &amp; Correct Answers
        </label>
        <p className="text-xs text-gray-500 mb-3">
          For each statement, write the text and select whether it is <strong>{col1Label}</strong> or <strong>{col2Label}</strong> according to the table.
        </p>
        <div className="space-y-2">
          {statements.map((statement, index) => {
            const key = `stmt${index}`;
            const isTrue = (correctAnswer[key] ?? 'col1') === 'col1';
            return (
              <div key={index} className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-400 w-5 shrink-0 pt-2 text-right">{index + 1}.</span>
                <div className="flex-1">
                  <LaTeXEditor
                    value={statement.text}
                    onChange={(value) => handleStatementTextChange(index, value)}
                    placeholder={`Statement ${index + 1} (supports LaTeX)`}
                    minHeight="44px"
                  />
                </div>
                {/* col1 / col2 toggle */}
                <div className="shrink-0 flex rounded-lg border border-gray-300 overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => handleStatementCorrectChange(index, 'col1')}
                    className={`px-3 py-2 font-medium transition-colors ${
                      isTrue
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {col1Label}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatementCorrectChange(index, 'col2')}
                    className={`px-3 py-2 font-medium border-l border-gray-300 transition-colors ${
                      !isTrue
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {col2Label}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStatement(index)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5"
                  title="Remove statement"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleAddStatement}
          className="mt-2 px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors w-full"
        >
          + Add statement
        </button>
      </div>
    </div>
  );
}
