/**
 * TPA (Two-Part Analysis) Question Component
 * Displays scenario with two-column answer grid where student selects one option per column
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { MathJaxRenderer } from '../MathJaxRenderer';
import { normalizeWhitespace, normalizeOptionText } from '../../lib/textUtils';

interface TPAQuestionProps {
  scenario: string;
  column1Title: string;
  column2Title: string;
  sharedOptions: string[];
  sharedOptionsImages?: string[]; // Optional images for options (parallel array to sharedOptions)
  selectedColumn1?: string;
  selectedColumn2?: string;
  onColumn1Change: (value: string) => void;
  onColumn2Change: (value: string) => void;
  readOnly?: boolean; // For results view - disables selection buttons
  correctColumn1?: any; // For results view - can be string or object from DB
  correctColumn2?: any; // For results view - can be string or object from DB
  showResults?: boolean; // For results view - displays answer feedback
}

export function TPAQuestion({
  scenario,
  column1Title,
  column2Title,
  sharedOptions,
  selectedColumn1,
  selectedColumn2,
  onColumn1Change,
  onColumn2Change,
  readOnly = false,
  correctColumn1,
  correctColumn2,
  showResults = false,
}: TPAQuestionProps) {
  // Normalize correct answers
  // Database stores as object: {col1: "option1", col2: "option2"}
  // Component needs: correctColumn1="option1", correctColumn2="option2"
  let normalizedCorrectColumn1: string | undefined;
  let normalizedCorrectColumn2: string | undefined;

  // Check if correctColumn1 is actually the object (when both props receive the same object)
  if (typeof correctColumn1 === 'object' && correctColumn1 !== null && 'col1' in correctColumn1 && 'col2' in correctColumn1) {
    normalizedCorrectColumn1 = correctColumn1.col1;
    normalizedCorrectColumn2 = correctColumn1.col2;
  } else {
    // Already in string format
    normalizedCorrectColumn1 = correctColumn1;
    normalizedCorrectColumn2 = correctColumn2;
  }

  return (
    <div className="space-y-6">
      {/* Scenario Section */}
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white overflow-x-auto">
        <div className="text-gray-800 text-lg whitespace-pre-wrap">
          <MathJaxRenderer>{normalizeWhitespace(scenario)}</MathJaxRenderer>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-700 italic">
        Select one option in each column. Each option can be selected in both columns.
      </div>

      {/* Two-Column Selection Grid */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr_120px_120px] bg-gray-50 border-b-2 border-gray-200">
          <div className="px-6 py-3 font-semibold text-gray-700 border-r-2 border-gray-200">
            Options
          </div>
          <div className="px-4 py-3 font-semibold text-gray-700 text-center border-r-2 border-gray-200">
            {normalizeOptionText(column1Title)}
          </div>
          <div className="px-4 py-3 font-semibold text-gray-700 text-center">
            {normalizeOptionText(column2Title)}
          </div>
        </div>

        {/* Option Rows */}
        <div className="divide-y divide-gray-200">
          {sharedOptions.map((option, index) => {
            const isSelectedCol1 = selectedColumn1 === option;
            const isSelectedCol2 = selectedColumn2 === option;
            const isCorrectCol1 = showResults && normalizedCorrectColumn1 === option;
            const isCorrectCol2 = showResults && normalizedCorrectColumn2 === option;
            const isWrongCol1 = showResults && isSelectedCol1 && !isCorrectCol1;
            const isWrongCol2 = showResults && isSelectedCol2 && !isCorrectCol2;

            return (
              <div
                key={index}
                className="grid grid-cols-[1fr_120px_120px] hover:bg-gray-50 transition-colors"
              >
                {/* Option Text */}
                <div className={`px-6 py-4 text-gray-800 border-r-2 border-gray-200 flex items-center ${
                  ((isCorrectCol1 && !isSelectedCol1) || (isCorrectCol2 && !isSelectedCol2))
                    ? 'bg-green-50/30'
                    : ''
                }`}>
                  <div>
                    <MathJaxRenderer>{normalizeOptionText(option)}</MathJaxRenderer>
                    {showResults && ((isSelectedCol1 && isCorrectCol1) || (isSelectedCol2 && isCorrectCol2)) && (
                      <div className="text-xs text-green-700 font-semibold mt-1">Your answer - Correct!</div>
                    )}
                    {(isWrongCol1 || isWrongCol2) && (
                      <div className="text-xs text-red-700 font-semibold mt-1">Your answer</div>
                    )}
                    {((isCorrectCol1 && !isSelectedCol1) || (isCorrectCol2 && !isSelectedCol2)) && (
                      <div className="text-xs text-green-700 font-semibold mt-1">Correct answer</div>
                    )}
                  </div>
                </div>

                {/* Column 1 Selection */}
                <div className={`px-4 py-4 flex items-center justify-center border-r-2 border-gray-200 ${
                  isCorrectCol1 && !isSelectedCol1 ? 'bg-green-50/30' : ''
                }`}>
                  <button
                    onClick={() => !readOnly && onColumn1Change(option)}
                    className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                      isWrongCol1
                        ? 'border-2 border-red-600 bg-red-600'
                        : isCorrectCol1 && !isSelectedCol1
                          ? 'border-[3px] border-dashed border-green-600 bg-green-100'
                          : isCorrectCol1
                            ? 'border-2 border-green-600 bg-green-600'
                            : isSelectedCol1
                              ? 'border-2 border-brand-green bg-brand-green'
                              : readOnly
                                ? 'border-2 border-gray-300'
                                : 'border-2 border-gray-300 hover:border-brand-green'
                    } ${readOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                  >
                    {isWrongCol1 && (
                      <FontAwesomeIcon icon={faTimesCircle} className="text-white text-xl" />
                    )}
                    {isCorrectCol1 && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                    )}
                    {isSelectedCol1 && !showResults && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                    )}
                  </button>
                </div>

                {/* Column 2 Selection */}
                <div className={`px-4 py-4 flex items-center justify-center ${
                  isCorrectCol2 && !isSelectedCol2 ? 'bg-green-50/30' : ''
                }`}>
                  <button
                    onClick={() => !readOnly && onColumn2Change(option)}
                    className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                      isWrongCol2
                        ? 'border-2 border-red-600 bg-red-600'
                        : isCorrectCol2 && !isSelectedCol2
                          ? 'border-[3px] border-dashed border-green-600 bg-green-100'
                          : isCorrectCol2
                            ? 'border-2 border-green-600 bg-green-600'
                            : isSelectedCol2
                              ? 'border-2 border-brand-green bg-brand-green'
                              : readOnly
                                ? 'border-2 border-gray-300'
                                : 'border-2 border-gray-300 hover:border-brand-green'
                    } ${readOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                  >
                    {isWrongCol2 && (
                      <FontAwesomeIcon icon={faTimesCircle} className="text-white text-xl" />
                    )}
                    {isCorrectCol2 && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                    )}
                    {isSelectedCol2 && !showResults && (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
