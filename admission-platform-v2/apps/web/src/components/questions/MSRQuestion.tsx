/**
 * MSR (Multi-Source Reasoning) Question Component
 * Displays multiple sources (text/tables) with tabbed navigation and multiple sub-questions
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { MathJaxRenderer } from '../MathJaxRenderer';
import { normalizeWhitespace, normalizeOptionText } from '../../lib/textUtils';
import { ExplanationDisplay } from './ExplanationDisplay';

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
  image_options?: Record<string, string>;
  question_type: string;
  correct_answer: string;
}

interface MSRQuestionProps {
  sources: MSRSource[];
  questions: MSRSubQuestion[];
  selectedAnswers: string[];
  onAnswerChange: (questionIndex: number, answer: string) => void;
  readOnly?: boolean; // For results view - disables answer buttons
  correctAnswers?: string[]; // For results view - shows correct answers
  showResults?: boolean; // For results view - displays answer feedback
  explanation?: string; // For results view - shows explanation after answer
}

export function MSRQuestion({ sources, questions, selectedAnswers, onAnswerChange, readOnly = false, correctAnswers = [], showResults = false, explanation }: MSRQuestionProps) {
  const [activeTab, setActiveTab] = useState(0);

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

        {/* Tab Content */}
        <div className="p-6 bg-white max-h-96 overflow-y-auto overflow-x-hidden">
          {sources[activeTab].content_type === 'text' ? (
            <div className="text-gray-800 whitespace-pre-wrap">
              <MathJaxRenderer>{normalizeWhitespace(sources[activeTab].content || '')}</MathJaxRenderer>
            </div>
          ) : (
            // Table display
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    {sources[activeTab].table_headers?.map((header, i) => (
                      <th key={i} className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 break-words">
                        <MathJaxRenderer>{normalizeOptionText(header)}</MathJaxRenderer>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sources[activeTab].table_data?.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, j) => (
                        <td key={j} className="border border-gray-300 px-4 py-2 text-gray-800 break-words">
                          <MathJaxRenderer>{normalizeOptionText(cell)}</MathJaxRenderer>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Multiple Sub-Questions */}
      <div className="space-y-6">
        {questions.map((question, qIndex) => {
          const studentAnswer = selectedAnswers[qIndex];
          const correctAnswer = correctAnswers[qIndex];
          const isCorrect = showResults && studentAnswer === correctAnswer;
          const isWrong = showResults && studentAnswer && studentAnswer !== correctAnswer;

          return (
            <div key={qIndex} className="border-2 border-gray-200 rounded-xl p-6 bg-white">
              {/* Question Text */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-3">
                  Question {qIndex + 1}
                </span>
                <p className="text-gray-800 text-lg">
                  <MathJaxRenderer>{normalizeWhitespace(question.text)}</MathJaxRenderer>
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {Object.entries(question.options).map(([key, value]) => {
                  const isSelected = studentAnswer === key;
                  const isCorrectOption = showResults && correctAnswer === key;
                  const isWrongSelection = showResults && isSelected && !isCorrect;

                  let borderClass = 'border-gray-200';
                  let bgClass = 'bg-white';
                  let borderStyle = 'border-2';

                  if (isSelected && isCorrect) {
                    // Student selected correct answer - solid green border
                    borderClass = 'border-green-600';
                    bgClass = 'bg-green-50';
                  } else if (isWrongSelection) {
                    // Student selected wrong answer - solid red border
                    borderClass = 'border-red-600';
                    bgClass = 'bg-red-50';
                  } else if (isCorrectOption) {
                    // Show correct answer when student got it wrong - dashed green border
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
                            <img
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

      {/* Explanation (shown in results view) */}
      {showResults && explanation && (
        <ExplanationDisplay explanation={explanation} />
      )}
    </div>
  );
}
