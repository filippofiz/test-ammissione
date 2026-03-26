/**
 * DS (Data Sufficiency) Question Component
 * Displays problem with two statements and standard DS answer options
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { MathJaxRenderer } from '../MathJaxRenderer';
import { normalizeWhitespace } from '../../lib/textUtils';
import { ExplanationDisplay } from './ExplanationDisplay';
import { ComparisonChips, type ComparisonSlots } from './ComparisonChips';

interface DSQuestionProps {
  problem: string;
  statement1: string;
  statement2: string;
  selectedAnswer?: string;
  correctAnswer?: string; // For results view - shows correct answer
  onAnswerChange: (answer: string) => void;
  readOnly?: boolean; // For results view - disables answer buttons
  showResults?: boolean; // For results view - displays answer feedback
  explanation?: string; // For results view - shows explanation after answer
  /** Comparison student chips keyed by option label (e.g. "A", "B") */
  comparisonSlots?: ComparisonSlots;
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
  explanation,
  comparisonSlots,
}: DSQuestionProps) {
  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
        <div className="text-gray-800 text-lg whitespace-pre-wrap">
          <MathJaxRenderer>{normalizeWhitespace(problem)}</MathJaxRenderer>
        </div>

        {/* Two Statements */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 space-y-3">
          <div>
            <div className="font-semibold text-blue-900 mb-1">(1)</div>
            <div className="text-gray-800">
              <MathJaxRenderer>{normalizeWhitespace(statement1)}</MathJaxRenderer>
            </div>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-1">(2)</div>
            <div className="text-gray-800">
              <MathJaxRenderer>{normalizeWhitespace(statement2)}</MathJaxRenderer>
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
          const comparisonMode = !!comparisonSlots;

          // Determine styling based on selection and correctness
          let baseClass = 'w-full text-left p-4 rounded-xl transition-all ';
          let borderStyle = 'border-2';
          let colorClass = '';

          if (comparisonMode) {
            // In comparison mode: neutral for all options, only correct gets green highlight
            if (isCorrectOption) {
              colorClass = 'border-green-500 bg-green-50';
            } else {
              colorClass = readOnly ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300';
            }
          } else if (isSelected && isCorrectOption) {
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
                    comparisonMode
                      ? isCorrectOption
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                      : isWrongSelection
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
                <div className="flex-1 min-w-0">
                  <div className="text-gray-800">{option.text}</div>
                </div>
                {comparisonMode ? (
                  <div className="flex-shrink-0 flex flex-col gap-1.5 items-end min-w-[80px]">
                    <ComparisonChips slotKey={option.label} comparisonSlots={comparisonSlots} />
                    {isCorrectOption && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl mt-1" />
                    )}
                  </div>
                ) : (
                  <>
                    {isWrongSelection && (
                      <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl flex-shrink-0" />
                    )}
                    {isCorrectOption && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl flex-shrink-0" />
                    )}
                    {isSelected && !showResults && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green text-xl flex-shrink-0" />
                    )}
                  </>
                )}
              </div>
            </button>
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
