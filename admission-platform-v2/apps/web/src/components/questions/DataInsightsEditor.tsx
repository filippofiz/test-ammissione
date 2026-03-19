/**
 * Data Insights Question Editor Router Component
 * Routes to appropriate editor based on DI question type
 */

import { DSQuestionEditor } from './editors/DSQuestionEditor';
import { TAQuestionEditor } from './editors/TAQuestionEditor';
import { TPAQuestionEditor } from './editors/TPAQuestionEditor';
import { GIQuestionEditor } from './editors/GIQuestionEditor';
import { MSRQuestionEditor } from './editors/MSRQuestionEditor';
import { LaTeXEditor } from './editors/LaTeXEditor';

interface DataInsightsEditorProps {
  questionData: any;
  answers: any;
  onChange: (field: string, value: any) => void;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  onDifficultyChange?: (value: 'easy' | 'medium' | 'hard' | null) => void;
}

function ExplanationRow({ questionData, onChange }: { questionData: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="mt-4">
      <label className="block text-xs font-semibold text-gray-500 mb-1">Explanation</label>
      <LaTeXEditor
        value={questionData?.explanation || ''}
        onChange={(val) => onChange('question_data.explanation', val)}
        placeholder="Explanation — supports LaTeX ($…$) and **bold**"
        minHeight="80px"
      />
    </div>
  );
}

export function DataInsightsEditor({
  questionData,
  answers,
  onChange,
  difficulty,
  onDifficultyChange,
}: DataInsightsEditorProps) {
  const diType = questionData?.di_type;

  const difficultyRow = onDifficultyChange ? (
    <div className="flex items-center gap-2 mb-4">
      <label className="text-sm font-semibold text-gray-700">Difficulty:</label>
      <select
        value={difficulty ?? ''}
        onChange={(e) => {
          const val = e.target.value as 'easy' | 'medium' | 'hard' | '';
          onDifficultyChange(val === '' ? null : val);
        }}
        className={`text-sm px-3 py-1 rounded border font-medium cursor-pointer ${
          difficulty === 'easy'
            ? 'bg-green-100 text-green-700 border-green-300'
            : difficulty === 'medium'
            ? 'bg-amber-100 text-amber-700 border-amber-300'
            : difficulty === 'hard'
            ? 'bg-red-100 text-red-700 border-red-300'
            : 'bg-gray-100 text-gray-500 border-gray-300'
        }`}
      >
        <option value="">— not set —</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  ) : null;

  // DS - Data Sufficiency
  if (diType === 'DS') {
    return (
      <>
        {difficultyRow}
        <DSQuestionEditor
          questionData={questionData}
          correctAnswer={answers?.correct_answer}
          onChange={onChange}
        />
        <ExplanationRow questionData={questionData} onChange={onChange} />
      </>
    );
  }

  // TA - Table Analysis
  if (diType === 'TA') {
    return (
      <>
        {difficultyRow}
        <TAQuestionEditor
          questionData={questionData}
          correctAnswer={answers?.correct_answer}
          onChange={onChange}
        />
        <ExplanationRow questionData={questionData} onChange={onChange} />
      </>
    );
  }

  // TPA - Two-Part Analysis
  if (diType === 'TPA') {
    return (
      <>
        {difficultyRow}
        <TPAQuestionEditor
          questionData={questionData}
          correctAnswer={answers?.correct_answer}
          onChange={onChange}
        />
        <ExplanationRow questionData={questionData} onChange={onChange} />
      </>
    );
  }

  // GI - Graphical Interpretation
  if (diType === 'GI') {
    return (
      <>
        {difficultyRow}
        <GIQuestionEditor
          questionData={questionData}
          correctAnswer={answers?.correct_answer}
          onChange={onChange}
        />
        <ExplanationRow questionData={questionData} onChange={onChange} />
      </>
    );
  }

  // MSR - Multi-Source Reasoning
  if (diType === 'MSR') {
    return (
      <>
        {difficultyRow}
        <MSRQuestionEditor
          questionData={questionData}
          onChange={onChange}
        />
        <ExplanationRow questionData={questionData} onChange={onChange} />
      </>
    );
  }

  // Unknown type - show warning with raw JSON editor
  return (
    <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
      {difficultyRow}
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
