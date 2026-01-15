/**
 * TA (Table Analysis) Question Component
 * Displays a data table with statements to evaluate as True/False or Correct/Incorrect
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from '../LaTeX';
import { SortableTable } from '../SortableTable';
import { normalizeWhitespace } from '../../lib/textUtils';
import { ExplanationDisplay } from './ExplanationDisplay';

interface TAStatement {
  text: string;
  is_true?: boolean; // For answer validation (not shown to student)
}

interface TAQuestionProps {
  tableTitle?: string;
  columnHeaders: string[];
  tableData: string[][];
  statements: TAStatement[];
  selectedAnswers: Record<number, 'true' | 'false'>;
  onAnswerChange: (statementIndex: number, value: 'true' | 'false') => void;
  readOnly?: boolean; // For results view - disables answer buttons
  tableSortable?: boolean; // Allow table sorting even in readOnly mode
  correctAnswers?: Record<number, 'true' | 'false'>; // For results view - shows correct answers
  showResults?: boolean; // For results view - displays answer feedback
  explanation?: string; // For results view - shows explanation after answer
}

export function TAQuestion({
  tableTitle,
  columnHeaders,
  tableData,
  statements,
  selectedAnswers,
  onAnswerChange,
  readOnly = false,
  tableSortable = true,
  correctAnswers = {},
  showResults = false,
  explanation,
}: TAQuestionProps) {
  // Transform correctAnswers if needed
  // Database stores as: {stmt0: "col1", stmt1: "col2"} where col1=true, col2=false
  // Component expects: {0: "true", 1: "false"}
  const normalizedCorrectAnswers: Record<number, 'true' | 'false'> = {};

  Object.entries(correctAnswers).forEach(([key, value]) => {
    // Handle both formats: numeric keys (0, 1, 2) and statement keys (stmt0, stmt1, stmt2)
    let index: number;
    let normalizedValue: 'true' | 'false';

    // Check if key is like "stmt0", "stmt1", etc.
    const match = key.match(/stmt(\d+)/);
    if (match) {
      index = parseInt(match[1], 10);
      // Convert col1/col2 to true/false
      normalizedValue = value === 'col1' ? 'true' : 'false';
    } else {
      // Already numeric key
      index = typeof key === 'string' ? parseInt(key, 10) : key;
      // Value should already be true/false
      normalizedValue = value as 'true' | 'false';
    }

    normalizedCorrectAnswers[index] = normalizedValue;
  });

  return (
    <div className="space-y-6">
      {/* Table Section with Sortable Columns */}
      <SortableTable
        title={tableTitle}
        columnHeaders={columnHeaders}
        tableData={tableData}
        readOnly={!tableSortable}
      />

      {/* Statements to Evaluate */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="px-6 py-3 bg-gray-50 border-b-2 border-gray-200">
          <h3 className="font-semibold text-gray-800">
            For each statement, select True or False based on the table above
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {statements.map((statement, index) => {
            // Handle both numeric and string keys (0 vs "0")
            const answer = selectedAnswers[index] || selectedAnswers[String(index)];
            const correctAnswer = normalizedCorrectAnswers[index] || normalizedCorrectAnswers[String(index)];
            const isTrue = answer === 'true' || answer === true;
            const isFalse = answer === 'false' || answer === false;
            const correctIsTrue = correctAnswer === 'true' || correctAnswer === true;
            const correctIsFalse = correctAnswer === 'false' || correctAnswer === false;

            const trueIsCorrect = showResults && correctIsTrue;
            const falseIsCorrect = showResults && correctIsFalse;
            const selectedTrueIsWrong = showResults && isTrue && !correctIsTrue;
            const selectedFalseIsWrong = showResults && isFalse && !correctIsFalse;

            return (
            <div key={index} className="p-4">
              {/* Statement Text */}
              <div className="mb-3 text-gray-800">
                <LaTeX>{normalizeWhitespace(statement.text)}</LaTeX>
              </div>

              {/* True/False Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => !readOnly && onAnswerChange(index, 'true')}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                    selectedTrueIsWrong
                      ? 'border-2 border-red-600 bg-red-50'
                      : trueIsCorrect && !isTrue
                        ? 'border-2 border-dashed border-green-600 bg-green-50/70'
                        : trueIsCorrect
                          ? 'border-2 border-green-600 bg-green-50'
                          : isTrue
                            ? 'border-2 border-brand-green bg-green-50'
                            : readOnly
                              ? 'border-2 border-gray-200 bg-white'
                              : 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${readOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                          selectedTrueIsWrong
                            ? 'bg-red-600 text-white'
                            : trueIsCorrect
                              ? 'bg-green-600 text-white'
                              : isTrue
                                ? 'bg-brand-green text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        T
                      </div>
                      <span className="font-semibold">True</span>
                      {selectedTrueIsWrong && (
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                      )}
                      {trueIsCorrect && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                      )}
                      {isTrue && !showResults && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green" />
                      )}
                    </div>
                    {showResults && isTrue && trueIsCorrect && (
                      <div className="text-xs text-green-700 font-semibold">Your answer - Correct!</div>
                    )}
                    {selectedTrueIsWrong && (
                      <div className="text-xs text-red-700 font-semibold">Your answer</div>
                    )}
                    {trueIsCorrect && !isTrue && (
                      <div className="text-xs text-green-700 font-semibold">Correct answer</div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => !readOnly && onAnswerChange(index, 'false')}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                    selectedFalseIsWrong
                      ? 'border-2 border-red-600 bg-red-50'
                      : falseIsCorrect && !isFalse
                        ? 'border-2 border-dashed border-green-600 bg-green-50/70'
                        : falseIsCorrect
                          ? 'border-2 border-green-600 bg-green-50'
                          : isFalse
                            ? 'border-2 border-brand-green bg-green-50'
                            : readOnly
                              ? 'border-2 border-gray-200 bg-white'
                              : 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${readOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                          selectedFalseIsWrong
                            ? 'bg-red-600 text-white'
                            : falseIsCorrect
                              ? 'bg-green-600 text-white'
                              : isFalse
                                ? 'bg-brand-green text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        F
                      </div>
                      <span className="font-semibold">False</span>
                      {selectedFalseIsWrong && (
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                      )}
                      {falseIsCorrect && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                      )}
                      {isFalse && !showResults && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green" />
                      )}
                    </div>
                    {showResults && isFalse && falseIsCorrect && (
                      <div className="text-xs text-green-700 font-semibold">Your answer - Correct!</div>
                    )}
                    {selectedFalseIsWrong && (
                      <div className="text-xs text-red-700 font-semibold">Your answer</div>
                    )}
                    {falseIsCorrect && !isFalse && (
                      <div className="text-xs text-green-700 font-semibold">Correct answer</div>
                    )}
                  </div>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Explanation (shown in results view) */}
      {showResults && explanation && (
        <ExplanationDisplay explanation={explanation} />
      )}
    </div>
  );
}
