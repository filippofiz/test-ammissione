/**
 * TA (Table Analysis) Question Editor Component
 * Simple text-based editor for TA question fields
 */

import { useState, useEffect } from 'react';

interface TAStatement {
  text: string;
  is_true?: boolean;
}

interface TAQuestionEditorProps {
  questionData: {
    table_title?: string;
    column_headers?: string[];
    table_data?: string[][];
    statements?: TAStatement[];
  };
  correctAnswer?: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

export function TAQuestionEditor({
  questionData,
  correctAnswer,
  onChange,
}: TAQuestionEditorProps) {
  // Local state for JSON editing with validation
  const [tableDataJson, setTableDataJson] = useState('');
  const [statementsJson, setStatementsJson] = useState('');
  const [correctAnswerJson, setCorrectAnswerJson] = useState('');
  const [tableDataError, setTableDataError] = useState('');
  const [statementsError, setStatementsError] = useState('');
  const [correctAnswerError, setCorrectAnswerError] = useState('');

  // Initialize JSON strings from props
  useEffect(() => {
    setTableDataJson(JSON.stringify(questionData.table_data || [], null, 2));
    setStatementsJson(JSON.stringify(questionData.statements || [], null, 2));
    setCorrectAnswerJson(JSON.stringify(correctAnswer || {}, null, 2));
  }, []);

  const handleTableDataChange = (value: string) => {
    setTableDataJson(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setTableDataError('');
        onChange('question_data.table_data', parsed);
      } else {
        setTableDataError('Must be an array');
      }
    } catch {
      setTableDataError('Invalid JSON');
    }
  };

  const handleStatementsChange = (value: string) => {
    setStatementsJson(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setStatementsError('');
        onChange('question_data.statements', parsed);
      } else {
        setStatementsError('Must be an array');
      }
    } catch {
      setStatementsError('Invalid JSON');
    }
  };

  const handleCorrectAnswerChange = (value: string) => {
    setCorrectAnswerJson(value);
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        setCorrectAnswerError('');
        onChange('answers.correct_answer', parsed);
      } else {
        setCorrectAnswerError('Must be an object');
      }
    } catch {
      setCorrectAnswerError('Invalid JSON');
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Table Title
        </label>
        <input
          type="text"
          value={questionData.table_title || ''}
          onChange={(e) => onChange('question_data.table_title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="Enter table title"
        />
      </div>

      {/* Column Headers */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Column Headers (comma-separated)
        </label>
        <input
          type="text"
          value={(questionData.column_headers || []).join(', ')}
          onChange={(e) => {
            const headers = e.target.value.split(',').map(h => h.trim()).filter(h => h);
            onChange('question_data.column_headers', headers);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="Header 1, Header 2, Header 3"
        />
      </div>

      {/* Table Data (JSON) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Table Data (JSON array of arrays)
        </label>
        <textarea
          value={tableDataJson}
          onChange={(e) => handleTableDataChange(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[150px] font-mono text-sm ${
            tableDataError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='[["Row1Col1", "Row1Col2"], ["Row2Col1", "Row2Col2"]]'
        />
        {tableDataError && (
          <p className="mt-1 text-xs text-red-500">{tableDataError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Format: [["cell1", "cell2"], ["cell3", "cell4"]]
        </p>
      </div>

      {/* Statements (JSON) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Statements (JSON array)
        </label>
        <textarea
          value={statementsJson}
          onChange={(e) => handleStatementsChange(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[120px] font-mono text-sm ${
            statementsError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='[{"text": "Statement 1"}, {"text": "Statement 2"}]'
        />
        {statementsError && (
          <p className="mt-1 text-xs text-red-500">{statementsError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Format: [&#123;"text": "Statement text"&#125;, ...]
        </p>
      </div>

      {/* Correct Answers (JSON) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Correct Answers (JSON object)
        </label>
        <textarea
          value={correctAnswerJson}
          onChange={(e) => handleCorrectAnswerChange(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[100px] font-mono text-sm ${
            correctAnswerError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='{"stmt0": "col1", "stmt1": "col2"}'
        />
        {correctAnswerError && (
          <p className="mt-1 text-xs text-red-500">{correctAnswerError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Format: &#123;"stmt0": "col1", "stmt1": "col2"&#125; (col1=True, col2=False)
        </p>
      </div>
    </div>
  );
}
