/**
 * Data Insights Question Editor Router Component
 * Routes to appropriate editor based on DI question type
 */

import { DSQuestionEditor } from './editors/DSQuestionEditor';
import { TAQuestionEditor } from './editors/TAQuestionEditor';
import { TPAQuestionEditor } from './editors/TPAQuestionEditor';
import { GIQuestionEditor } from './editors/GIQuestionEditor';
import { MSRQuestionEditor } from './editors/MSRQuestionEditor';

interface DataInsightsEditorProps {
  questionData: any;
  answers: any;
  onChange: (field: string, value: any) => void;
}

export function DataInsightsEditor({
  questionData,
  answers,
  onChange,
}: DataInsightsEditorProps) {
  const diType = questionData?.di_type;

  // DS - Data Sufficiency
  if (diType === 'DS') {
    return (
      <DSQuestionEditor
        questionData={questionData}
        correctAnswer={answers?.correct_answer}
        onChange={onChange}
      />
    );
  }

  // TA - Table Analysis
  if (diType === 'TA') {
    return (
      <TAQuestionEditor
        questionData={questionData}
        correctAnswer={answers?.correct_answer}
        onChange={onChange}
      />
    );
  }

  // TPA - Two-Part Analysis
  if (diType === 'TPA') {
    return (
      <TPAQuestionEditor
        questionData={questionData}
        correctAnswer={answers?.correct_answer}
        onChange={onChange}
      />
    );
  }

  // GI - Graphical Interpretation
  if (diType === 'GI') {
    return (
      <GIQuestionEditor
        questionData={questionData}
        correctAnswer={answers?.correct_answer}
        onChange={onChange}
      />
    );
  }

  // MSR - Multi-Source Reasoning
  if (diType === 'MSR') {
    return (
      <MSRQuestionEditor
        questionData={questionData}
        onChange={onChange}
      />
    );
  }

  // Unknown type - show warning with raw JSON editor
  return (
    <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
      <p className="text-yellow-800 font-semibold mb-2">
        Unknown Data Insights type: {diType || 'not specified'}
      </p>
      <p className="text-sm text-yellow-700 mb-3">
        No specific editor available for this question type. You can edit the raw JSON data below.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Question Data (JSON)
          </label>
          <textarea
            value={JSON.stringify(questionData, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                // Update all fields in question_data
                Object.keys(parsed).forEach(key => {
                  onChange(`question_data.${key}`, parsed[key]);
                });
              } catch {
                // Invalid JSON, don't update
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[200px] font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Answers (JSON)
          </label>
          <textarea
            value={JSON.stringify(answers, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                if (parsed.correct_answer !== undefined) {
                  onChange('answers.correct_answer', parsed.correct_answer);
                }
              } catch {
                // Invalid JSON, don't update
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent min-h-[100px] font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
