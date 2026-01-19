/**
 * TPA (Two-Part Analysis) Question Editor Component
 * Simple text-based editor for TPA question fields
 */

import { useState, useEffect } from 'react';

interface TPAQuestionEditorProps {
  questionData: {
    scenario?: string;
    column1_title?: string;
    column2_title?: string;
    shared_options?: string[];
  };
  correctAnswer?: { col1?: string; col2?: string };
  onChange: (field: string, value: any) => void;
}

export function TPAQuestionEditor({
  questionData,
  correctAnswer,
  onChange,
}: TPAQuestionEditorProps) {
  // Local state for JSON editing with validation
  const [sharedOptionsJson, setSharedOptionsJson] = useState('');
  const [correctAnswerJson, setCorrectAnswerJson] = useState('');
  const [sharedOptionsError, setSharedOptionsError] = useState('');
  const [correctAnswerError, setCorrectAnswerError] = useState('');

  // Initialize JSON strings from props
  useEffect(() => {
    setSharedOptionsJson(JSON.stringify(questionData.shared_options || [], null, 2));
    setCorrectAnswerJson(JSON.stringify(correctAnswer || {}, null, 2));
  }, []);

  const handleSharedOptionsChange = (value: string) => {
    setSharedOptionsJson(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setSharedOptionsError('');
        onChange('question_data.shared_options', parsed);
      } else {
        setSharedOptionsError('Must be an array');
      }
    } catch {
      setSharedOptionsError('Invalid JSON');
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
            placeholder="e.g., First Value"
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
            placeholder="e.g., Second Value"
          />
        </div>
      </div>

      {/* Shared Options (JSON) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Shared Options (JSON array)
        </label>
        <textarea
          value={sharedOptionsJson}
          onChange={(e) => handleSharedOptionsChange(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[120px] font-mono text-sm ${
            sharedOptionsError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='["Option 1", "Option 2", "Option 3"]'
        />
        {sharedOptionsError && (
          <p className="mt-1 text-xs text-red-500">{sharedOptionsError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Format: ["Option 1", "Option 2", ...]
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
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[80px] font-mono text-sm ${
            correctAnswerError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='{"col1": "Option 1", "col2": "Option 2"}'
        />
        {correctAnswerError && (
          <p className="mt-1 text-xs text-red-500">{correctAnswerError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Format: &#123;"col1": "value for column 1", "col2": "value for column 2"&#125;
        </p>
      </div>
    </div>
  );
}
