/**
 * MSR (Multi-Source Reasoning) Question Component
 * Displays multiple sources (text + optional image) with tabbed navigation.
 *
 * Two rendering modes for sub-questions:
 *  - Tabular (all questions have exactly 2 options): table with an optional
 *    shared question_stem shown above, per-row statements in left column.
 *  - Card stack (standard MC): one card per question, as before.
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { MathJaxRenderer } from '../MathJaxRenderer';
import { normalizeWhitespace, normalizeOptionText } from '../../lib/textUtils';
import { ExplanationDisplay } from './ExplanationDisplay';
import { ImageWithFallback } from '../ImageWithFallback';

interface MSRSource {
  content?: string;
  tab_name: string;
  content_type: 'text' | 'table'; // 'table' is legacy — content is always rendered as text/markdown
  table_data?: string[][];
  table_headers?: string[];
  image_url?: string | null;
}

interface MSRSubQuestion {
  text: string;
  options: Record<string, string>;
  image_options?: Record<string, string>;
  question_type: string;
  correct_answer: string;
}

interface MSRQuestionProps {
  sources: MSRSource[];
  questions: MSRSubQuestion[];
  questionStem?: string;  // shared question shown above the tabular answer table
  selectedAnswers: string[];
  onAnswerChange: (questionIndex: number, answer: string) => void;
  readOnly?: boolean;
  correctAnswers?: string[];
  showResults?: boolean;
  explanation?: string;
}

export function MSRQuestion({
  sources,
  questions,
  questionStem,
  selectedAnswers,
  onAnswerChange,
  readOnly = false,
  correctAnswers = [],
  showResults = false,
  explanation,
}: MSRQuestionProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Use tabular layout when every sub-question has exactly 2 options
  const isTabular =
    questions.length > 0 &&
    questions.every(q => Object.keys(q.options).length === 2);

  const activeSource = sources[activeTab] ?? sources[0];

  // Build source text: for legacy 'table' type, format as a plain text table
  // using the table_headers + table_data arrays so MathJaxRenderer can render it.
  const sourceText = (() => {
    if (!activeSource) return '';
    if (activeSource.content_type === 'table' && activeSource.table_headers) {
      const sep = activeSource.table_headers.map(() => '---').join(' | ');
      const header = activeSource.table_headers.join(' | ');
      const rows = (activeSource.table_data || []).map(row => row.join(' | '));
      return [header, sep, ...rows].join('\n');
    }
    return activeSource.content || '';
  })();

  return (
    <div className="space-y-6">
      {/* Tabbed Sources Section */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b-2 border-gray-200 bg-gray-50">
          {sources.map((source, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 px-4 py-3 font-semibold transition-all ${
                activeTab === index
                  ? 'bg-white text-brand-green border-b-2 border-brand-green'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {source.tab_name}
            </button>
          ))}
        </div>

        {/* Tab Content — always rendered as rich text via MathJaxRenderer */}
        <div className="p-6 bg-white max-h-96 overflow-y-auto overflow-x-hidden">
          <div className="text-gray-800">
            <MathJaxRenderer>{normalizeWhitespace(sourceText)}</MathJaxRenderer>
          </div>

          {/* Optional source image */}
          {activeSource?.image_url && (
            <div className="mt-4">
              <ImageWithFallback
                src={activeSource.image_url}
                alt={activeSource.tab_name}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sub-Questions */}
      {isTabular ? (
        <TabularQuestions
          questions={questions}
          questionStem={questionStem}
          selectedAnswers={selectedAnswers}
          onAnswerChange={onAnswerChange}
          correctAnswers={correctAnswers}
          showResults={showResults}
          readOnly={readOnly}
        />
      ) : (
        <CardQuestions
          questions={questions}
          selectedAnswers={selectedAnswers}
          onAnswerChange={onAnswerChange}
          correctAnswers={correctAnswers}
          showResults={showResults}
          readOnly={readOnly}
        />
      )}

      {showResults && explanation && (
        <ExplanationDisplay explanation={explanation} />
      )}
    </div>
  );
}

// ── Tabular layout (2-option questions) ───────────────────────────────────────

interface SubQuestionsProps {
  questions: MSRSubQuestion[];
  questionStem?: string;
  selectedAnswers: string[];
  onAnswerChange: (qIndex: number, answer: string) => void;
  correctAnswers: string[];
  showResults: boolean;
  readOnly: boolean;
}

function TabularQuestions({
  questions,
  questionStem,
  selectedAnswers,
  onAnswerChange,
  correctAnswers,
  showResults,
  readOnly,
}: SubQuestionsProps) {
  const optionKeys = Object.keys(questions[0].options);
  const optionLabels = Object.values(questions[0].options);

  return (
    <div className="space-y-3">
      {/* Shared question stem shown above the table */}
      {questionStem && (
        <div className="px-1 text-gray-800">
          <MathJaxRenderer>{normalizeWhitespace(questionStem)}</MathJaxRenderer>
        </div>
      )}

      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Statement</th>
              {optionLabels.map(label => (
                <th key={label} className="px-6 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((q, qIndex) => {
              const studentAnswer = selectedAnswers[qIndex];
              const correctAnswer = correctAnswers[qIndex];

              return (
                <tr key={qIndex} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-gray-800">
                    <MathJaxRenderer>{normalizeWhitespace(q.text)}</MathJaxRenderer>
                  </td>
                  {optionKeys.map(key => {
                    const isSelected = studentAnswer === key;
                    const isCorrectSelection = showResults && isSelected && correctAnswer === key;
                    const isWrongSelection = showResults && isSelected && correctAnswer !== key;
                    const showCorrectNotSelected = showResults && correctAnswer === key && !isSelected;

                    let btnClass =
                      'w-9 h-9 rounded-full border-2 mx-auto flex items-center justify-center text-sm font-bold transition-all ';
                    if (isCorrectSelection)
                      btnClass += 'bg-green-600 border-green-600 text-white';
                    else if (isWrongSelection)
                      btnClass += 'bg-red-500 border-red-500 text-white';
                    else if (showCorrectNotSelected)
                      btnClass += 'border-green-600 border-dashed text-green-700 bg-green-50';
                    else if (isSelected)
                      btnClass += 'bg-brand-green border-brand-green text-white';
                    else
                      btnClass += 'border-gray-300 bg-white hover:border-brand-green text-gray-400';

                    const icon = isCorrectSelection || showCorrectNotSelected
                      ? '✓'
                      : isWrongSelection
                        ? '✗'
                        : isSelected
                          ? '●'
                          : '';

                    return (
                      <td key={key} className="px-6 py-3 text-center">
                        <button
                          onClick={() => !readOnly && onAnswerChange(qIndex, key)}
                          className={btnClass + (readOnly ? ' cursor-default pointer-events-none' : ' cursor-pointer')}
                          title={optionLabels[optionKeys.indexOf(key)]}
                        >
                          {icon}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Card-stack layout (standard MC) ──────────────────────────────────────────

function CardQuestions({
  questions,
  selectedAnswers,
  onAnswerChange,
  correctAnswers,
  showResults,
  readOnly,
}: SubQuestionsProps) {
  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => {
        const studentAnswer = selectedAnswers[qIndex];
        const correctAnswer = correctAnswers[qIndex];
        const isCorrect = showResults && studentAnswer === correctAnswer;
        const isWrong = showResults && studentAnswer && studentAnswer !== correctAnswer;

        return (
          <div key={qIndex} className="border-2 border-gray-200 rounded-xl p-6 bg-white">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-3">
                Question {qIndex + 1}
              </span>
              <p className="text-gray-800 text-lg">
                <MathJaxRenderer>{normalizeWhitespace(question.text)}</MathJaxRenderer>
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(question.options).map(([key, value]) => {
                const isSelected = studentAnswer === key;
                const isCorrectOption = showResults && correctAnswer === key;
                const isWrongSelection = showResults && isSelected && !isCorrect;

                let borderClass = 'border-gray-200';
                let bgClass = 'bg-white';
                let borderStyle = 'border-2';

                if (isSelected && isCorrect) {
                  borderClass = 'border-green-600';
                  bgClass = 'bg-green-50';
                } else if (isWrongSelection) {
                  borderClass = 'border-red-600';
                  bgClass = 'bg-red-50';
                } else if (isCorrectOption) {
                  borderClass = 'border-green-600';
                  bgClass = 'bg-green-50/70';
                  borderStyle = 'border-2 border-dashed';
                }

                return (
                  <button
                    key={key}
                    onClick={() => !readOnly && onAnswerChange(qIndex, key)}
                    className={`w-full text-left p-4 rounded-xl ${borderStyle} transition-all ${borderClass} ${bgClass} ${
                      readOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isSelected && isCorrect
                          ? 'bg-green-600 text-white'
                          : isWrongSelection
                            ? 'bg-red-600 text-white'
                            : isCorrectOption
                              ? 'bg-green-600 text-white'
                              : isSelected
                                ? 'bg-brand-green text-white'
                                : 'bg-gray-200 text-gray-700'
                      }`}>
                        {key.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        {question.image_options?.[key] ? (
                          <ImageWithFallback
                            src={question.image_options[key]}
                            alt={`Option ${key.toUpperCase()}`}
                            className="max-w-full h-auto rounded"
                          />
                        ) : (
                          value && <MathJaxRenderer>{normalizeOptionText(value)}</MathJaxRenderer>
                        )}
                        {showResults && isSelected && isCorrect && (
                          <div className="text-xs text-green-700 font-semibold mt-1">Your answer - Correct!</div>
                        )}
                        {isWrongSelection && (
                          <div className="text-xs text-red-700 font-semibold mt-1">Your answer</div>
                        )}
                        {isCorrectOption && !isSelected && (
                          <div className="text-xs text-green-700 font-semibold mt-1">Correct answer</div>
                        )}
                      </div>
                      {isSelected && isCorrect && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                      )}
                      {isWrongSelection && (
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl" />
                      )}
                      {isCorrectOption && !isSelected && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                      )}
                      {isSelected && !showResults && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green text-xl" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
