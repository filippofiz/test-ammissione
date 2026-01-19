/**
 * MSR (Multi-Source Reasoning) Question Editor Component
 * Simple text-based editor for MSR question fields using JSON textareas
 */

import { useState, useEffect } from 'react';

interface MSRSource {
  content?: string;
  tab_name: string;
  content_type: 'text' | 'table';
  table_data?: string[][];
  table_headers?: string[];
}

interface MSRSubQuestion {
  text: string;
  options: Record<string, string>;
  question_type: string;
  correct_answer: string;
}

interface MSRQuestionEditorProps {
  questionData: {
    sources?: MSRSource[];
    questions?: MSRSubQuestion[];
  };
  onChange: (field: string, value: any) => void;
}

export function MSRQuestionEditor({
  questionData,
  onChange,
}: MSRQuestionEditorProps) {
  // Local state for JSON editing with validation
  const [sourcesJson, setSourcesJson] = useState('');
  const [questionsJson, setQuestionsJson] = useState('');
  const [sourcesError, setSourcesError] = useState('');
  const [questionsError, setQuestionsError] = useState('');

  // Initialize JSON strings from props
  useEffect(() => {
    setSourcesJson(JSON.stringify(questionData.sources || [], null, 2));
    setQuestionsJson(JSON.stringify(questionData.questions || [], null, 2));
  }, []);

  const handleSourcesChange = (value: string) => {
    setSourcesJson(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setSourcesError('');
        onChange('question_data.sources', parsed);
      } else {
        setSourcesError('Must be an array');
      }
    } catch {
      setSourcesError('Invalid JSON');
    }
  };

  const handleQuestionsChange = (value: string) => {
    setQuestionsJson(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setQuestionsError('');
        onChange('question_data.questions', parsed);
      } else {
        setQuestionsError('Must be an array');
      }
    } catch {
      setQuestionsError('Invalid JSON');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sources (JSON) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Sources (JSON array)
        </label>
        <textarea
          value={sourcesJson}
          onChange={(e) => handleSourcesChange(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[200px] font-mono text-sm ${
            sourcesError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={`[
  {
    "tab_name": "Source 1",
    "content_type": "text",
    "content": "Source content here..."
  },
  {
    "tab_name": "Data Table",
    "content_type": "table",
    "table_headers": ["Col1", "Col2"],
    "table_data": [["row1col1", "row1col2"]]
  }
]`}
        />
        {sourcesError && (
          <p className="mt-1 text-xs text-red-500">{sourcesError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Each source needs: tab_name, content_type ("text" or "table"), and either content (for text) or table_headers + table_data (for table)
        </p>
      </div>

      {/* Questions (JSON) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Questions (JSON array)
        </label>
        <textarea
          value={questionsJson}
          onChange={(e) => handleQuestionsChange(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[200px] font-mono text-sm ${
            questionsError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={`[
  {
    "text": "Question text here?",
    "question_type": "multiple_choice",
    "options": {
      "a": "Option A text",
      "b": "Option B text",
      "c": "Option C text"
    },
    "correct_answer": "a"
  }
]`}
        />
        {questionsError && (
          <p className="mt-1 text-xs text-red-500">{questionsError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Each question needs: text, question_type, options (object with keys a, b, c, etc.), and correct_answer
        </p>
      </div>
    </div>
  );
}
