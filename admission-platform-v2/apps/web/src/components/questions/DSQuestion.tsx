/**
 * DS (Data Sufficiency) Question Component
 * Displays problem with two statements and standard DS answer options
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from '../LaTeX';
import { normalizeWhitespace } from '../../lib/textUtils';

interface DSQuestionProps {
  problem: string;
  statement1: string;
  statement2: string;
  selectedAnswer?: string;
  correctAnswer?: string; // For results view - shows correct answer
  onAnswerChange: (answer: string) => void;
  readOnly?: boolean; // For results view - disables answer buttons
  showResults?: boolean; // For results view - displays answer feedback
}

const DS_OPTIONS = [
  {
    label: 'A',
    text: 'Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.',
  },
  {
    label: 'B',
    text: 'Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.',
  },
  {
    label: 'C',
    text: 'BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.',
  },
  {
    label: 'D',
    text: 'EACH statement ALONE is sufficient.',
  },
  {
    label: 'E',
    text: 'Statements (1) and (2) TOGETHER are NOT sufficient.',
  },
];

export function DSQuestion({
  problem,
  statement1,
  statement2,
  selectedAnswer,
  correctAnswer,
  onAnswerChange,
  readOnly = false,
  showResults = false,
}: DSQuestionProps) {
  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
        <div className="text-gray-800 text-lg whitespace-pre-wrap">
          <LaTeX>{normalizeWhitespace(problem)}</LaTeX>
        </div>

        {/* Two Statements */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 space-y-3">
          <div>
            <div className="font-semibold text-blue-900 mb-1">(1)</div>
            <div className="text-gray-800">
              <LaTeX>{normalizeWhitespace(statement1)}</LaTeX>
            </div>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-1">(2)</div>
            <div className="text-gray-800">
              <LaTeX>{normalizeWhitespace(statement2)}</LaTeX>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {DS_OPTIONS.map((option) => {
          const isSelected = selectedAnswer === option.label;
          const isCorrectOption = showResults && correctAnswer === option.label;
          const isWrongSelection = showResults && isSelected && correctAnswer !== option.label;

          // Determine styling based on selection and correctness
          let baseClass = 'w-full text-left p-4 rounded-xl transition-all ';
          let borderStyle = 'border-2';
          let colorClass = '';

          if (isSelected && isCorrectOption) {
            // Student selected correct answer - solid green border
            colorClass = 'border-green-600 bg-green-50';
          } else if (isWrongSelection) {
            // Student selected wrong answer - solid red border
            colorClass = 'border-red-600 bg-red-50';
          } else if (isCorrectOption) {
            // Show correct answer when student got it wrong - dashed green border
            colorClass = 'border-green-600 bg-green-50/70';
            borderStyle = 'border-2 border-dashed';
          } else if (isSelected && !showResults) {
            // Selected during test (not results view)
            colorClass = 'border-brand-green bg-green-50';
          } else {
            // Unselected option
            colorClass = readOnly ? 'border-gray-200 bg-white' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
          }

          const className = baseClass + borderStyle + ' ' + colorClass + (readOnly ? ' cursor-default pointer-events-none' : ' cursor-pointer');

          return (
            <button
              key={option.label}
              onClick={() => !readOnly && onAnswerChange(option.label)}
              className={className}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isWrongSelection
                      ? 'bg-red-600 text-white'
                      : isCorrectOption
                        ? 'bg-green-600 text-white'
                        : isSelected
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {option.label}
                </div>
                <div className="flex-1">
                  <div className="text-gray-800">{option.text}</div>
                  {showResults && isSelected && isCorrectOption && (
                    <div className="text-xs text-green-700 font-semibold mt-1">Your answer - Correct!</div>
                  )}
                  {isWrongSelection && (
                    <div className="text-xs text-red-700 font-semibold mt-1">Your answer</div>
                  )}
                  {isCorrectOption && !isSelected && (
                    <div className="text-xs text-green-700 font-semibold mt-1">Correct answer</div>
                  )}
                </div>
                {isWrongSelection && (
                  <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl" />
                )}
                {isCorrectOption && (
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
}
