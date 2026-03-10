import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { MathJaxRenderer } from '../MathJaxRenderer';

export interface ReviewQuestion {
  question_text: string;
  options: Record<string, string>;
  explanation?: string;
  correct_answer: string;
}

interface ResultQuestionCardProps {
  index: number;
  question: ReviewQuestion;
  answered: string | null | undefined;
  correct: boolean;
  skipped: boolean;
}

function addParagraphBreaks(text: string): string {
  if (!text || text.length < 200) return text;
  const mathBlocks: string[] = [];
  let processed = text
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; })
    .replace(/\$[^$\n]+?\$/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; })
    .replace(/\\\([\s\S]*?\\\)/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; });
  processed = processed.replace(/([.)]) ([A-ZÀÈÉÌÒÙ])/g, '$1\n$2');
  processed = processed.replace(/\uFFFE(\d+)\uFFFE/g, (_, i) => mathBlocks[parseInt(i)]);
  return processed;
}

export function ResultQuestionCard({ index, question, answered, correct, skipped }: ResultQuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { question_text, options, explanation, correct_answer } = question;

  return (
    <div className={`bg-white rounded-xl border-2 transition-all ${
      skipped
        ? 'border-gray-200'
        : correct
          ? 'border-green-200'
          : 'border-red-200'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors rounded-xl"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          skipped
            ? 'bg-gray-100 text-gray-400'
            : correct
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
        }`}>
          {skipped ? (
            <span className="text-sm font-semibold">{index}</span>
          ) : (
            <FontAwesomeIcon icon={correct ? faCheck : faTimes} className="text-sm" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-gray-400">Q{index}</span>
            {skipped && <span className="text-xs text-gray-400 italic">Skipped</span>}
            {!skipped && !correct && answered && (
              <span className="text-xs text-red-500 font-medium">
                Your answer: {answered.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 truncate">
            {question_text.substring(0, 100)}{question_text.length > 100 ? '...' : ''}
          </p>
        </div>

        <FontAwesomeIcon
          icon={expanded ? faChevronUp : faChevronDown}
          className="text-gray-400 flex-shrink-0"
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3 mb-4 text-sm text-gray-800 leading-relaxed">
            <MathJaxRenderer>{question_text}</MathJaxRenderer>
          </div>

          <div className="space-y-2 mb-4">
            {Object.entries(options).map(([key, text]) => {
              const isCorrectOption = key === correct_answer;
              const isStudentAnswer = key === answered;
              return (
                <div
                  key={key}
                  className={`flex items-start gap-2 p-2.5 rounded-lg text-sm ${
                    isCorrectOption
                      ? 'bg-green-50 border border-green-200'
                      : isStudentAnswer
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <span className={`font-bold flex-shrink-0 ${
                    isCorrectOption ? 'text-green-600' : isStudentAnswer ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {key.toUpperCase()}.
                  </span>
                  <span className={`${isCorrectOption ? 'text-green-800' : isStudentAnswer ? 'text-red-700' : 'text-gray-700'}`}>
                    <MathJaxRenderer>{text}</MathJaxRenderer>
                  </span>
                  {isCorrectOption && (
                    <FontAwesomeIcon icon={faCheck} className="text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  {isStudentAnswer && !isCorrectOption && (
                    <FontAwesomeIcon icon={faTimes} className="text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Explanation</p>
              <div className="text-sm text-blue-900 leading-relaxed">
                <MathJaxRenderer>{addParagraphBreaks(explanation)}</MathJaxRenderer>
              </div>
            </div>
          )}
          {!explanation && (
            <p className="text-xs text-gray-400 italic">No explanation available for this question.</p>
          )}
        </div>
      )}
    </div>
  );
}
