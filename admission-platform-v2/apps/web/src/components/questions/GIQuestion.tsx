/**
 * GI (Graphical Interpretation) Question Component
 * Displays a chart/graph with context and fill-in-the-blank statements
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from '../LaTeX';
import { Chart } from '../Chart';
import { normalizeWhitespace, normalizeOptionText } from '../../lib/textUtils';
import { ExplanationDisplay } from './ExplanationDisplay';

interface GIQuestionProps {
  chartConfig: any; // Chart.js config or image URL
  contextText?: string;
  statementText: string;
  blank1Options: string[];
  blank2Options: string[];
  imageUrl?: string;
  selectedBlank1?: string;
  selectedBlank2?: string;
  onBlank1Change: (value: string) => void;
  onBlank2Change: (value: string) => void;
  readOnly?: boolean; // For results view - disables dropdowns
  correctBlank1?: any; // For results view - can be string or array from DB
  correctBlank2?: any; // For results view - can be string or array from DB
  showResults?: boolean; // For results view - displays answer feedback
  explanation?: string; // For results view - shows explanation after answer
}

export function GIQuestion({
  chartConfig,
  contextText,
  statementText,
  blank1Options,
  blank2Options,
  imageUrl,
  selectedBlank1,
  selectedBlank2,
  onBlank1Change,
  onBlank2Change,
  readOnly = false,
  correctBlank1,
  correctBlank2,
  showResults = false,
  explanation,
}: GIQuestionProps) {
  // Normalize correct answers
  // Database stores as array: ["value1", "value2"]
  // Component needs: correctBlank1="value1", correctBlank2="value2"
  let normalizedCorrectBlank1: string | undefined;
  let normalizedCorrectBlank2: string | undefined;

  // Check if correctBlank1 is actually the array (when both props receive the same array)
  if (Array.isArray(correctBlank1) && correctBlank1.length === 2) {
    normalizedCorrectBlank1 = correctBlank1[0];
    normalizedCorrectBlank2 = correctBlank1[1];
  } else {
    // Already in string format
    normalizedCorrectBlank1 = correctBlank1;
    normalizedCorrectBlank2 = correctBlank2;
  }

  // Parse statement to find blank positions
  const parts = statementText.split(/(\[BLANK1\]|\[BLANK2\])/);

  const isCorrect = showResults && selectedBlank1 === normalizedCorrectBlank1 && selectedBlank2 === normalizedCorrectBlank2;
  const hasAnswer = selectedBlank1 || selectedBlank2;

  return (
    <div className="space-y-6">
      {/* Chart/Graph Section */}
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
        {imageUrl ? (
          // Display chart as image
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Graph"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        ) : chartConfig ? (
          // Render interactive chart using Chart.js
          <Chart config={chartConfig} />
        ) : (
          // Fallback if no image or chart config
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">No chart data available</p>
          </div>
        )}

        {/* Context Text */}
        {contextText && (
          <div className="mt-4 text-gray-700 text-sm">
            <LaTeX>{normalizeWhitespace(contextText)}</LaTeX>
          </div>
        )}
      </div>

      {/* Statement with Dropdowns */}
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
        <div className="text-gray-800 text-lg flex flex-wrap items-center gap-2">
          {parts.map((part, index) => {
            if (part === '[BLANK1]') {
              const isBlank1Correct = showResults && selectedBlank1 === normalizedCorrectBlank1;
              const isBlank1Wrong = showResults && selectedBlank1 && selectedBlank1 !== normalizedCorrectBlank1;

              return (
                <select
                  key={index}
                  value={selectedBlank1 || ''}
                  onChange={(e) => !readOnly && onBlank1Change(e.target.value)}
                  className={`inline-block px-4 py-2 border-2 rounded-lg font-semibold text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                    isBlank1Correct
                      ? 'border-green-600 bg-green-100 focus:ring-green-600'
                      : isBlank1Wrong
                        ? 'border-red-600 bg-red-100 focus:ring-red-600'
                        : 'border-brand-green bg-green-50 focus:ring-brand-green'
                  } cursor-pointer ${!readOnly ? 'hover:bg-green-100' : ''}`}
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {blank1Options.map((option, i) => {
                    const isCorrectOption = showResults && option === normalizedCorrectBlank1;
                    const isSelectedOption = option === selectedBlank1;
                    return (
                      <option
                        key={i}
                        value={option}
                        style={{
                          backgroundColor: isCorrectOption ? '#dcfce7' : isSelectedOption && !isCorrectOption ? '#fee2e2' : 'white',
                          fontWeight: isCorrectOption ? 'bold' : 'normal',
                          color: isCorrectOption ? '#15803d' : isSelectedOption && !isCorrectOption ? '#991b1b' : 'inherit'
                        }}
                      >
                        {isCorrectOption ? '✓ ' : ''}{normalizeOptionText(option)}{isCorrectOption ? ' (Correct)' : ''}
                      </option>
                    );
                  })}
                </select>
              );
            } else if (part === '[BLANK2]') {
              const isBlank2Correct = showResults && selectedBlank2 === normalizedCorrectBlank2;
              const isBlank2Wrong = showResults && selectedBlank2 && selectedBlank2 !== normalizedCorrectBlank2;

              return (
                <select
                  key={index}
                  value={selectedBlank2 || ''}
                  onChange={(e) => !readOnly && onBlank2Change(e.target.value)}
                  className={`inline-block px-4 py-2 border-2 rounded-lg font-semibold text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                    isBlank2Correct
                      ? 'border-green-600 bg-green-100 focus:ring-green-600'
                      : isBlank2Wrong
                        ? 'border-red-600 bg-red-100 focus:ring-red-600'
                        : 'border-brand-green bg-green-50 focus:ring-brand-green'
                  } cursor-pointer ${!readOnly ? 'hover:bg-green-100' : ''}`}
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {blank2Options.map((option, i) => {
                    const isCorrectOption = showResults && option === normalizedCorrectBlank2;
                    const isSelectedOption = option === selectedBlank2;
                    return (
                      <option
                        key={i}
                        value={option}
                        style={{
                          backgroundColor: isCorrectOption ? '#dcfce7' : isSelectedOption && !isCorrectOption ? '#fee2e2' : 'white',
                          fontWeight: isCorrectOption ? 'bold' : 'normal',
                          color: isCorrectOption ? '#15803d' : isSelectedOption && !isCorrectOption ? '#991b1b' : 'inherit'
                        }}
                      >
                        {isCorrectOption ? '✓ ' : ''}{normalizeOptionText(option)}{isCorrectOption ? ' (Correct)' : ''}
                      </option>
                    );
                  })}
                </select>
              );
            } else {
              return <span key={index}><LaTeX>{normalizeWhitespace(part)}</LaTeX></span>;
            }
          })}
        </div>
      </div>

      {/* Instructions and Feedback */}
      {!showResults && (
        <div className="text-sm text-gray-600 italic">
          Select options from the dropdown menus to complete the statement based on the graph above.
        </div>
      )}
      {showResults && (
        <div className="flex items-center gap-3 text-sm">
          {isCorrect ? (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              <span className="font-semibold text-green-700">Your answer - Correct!</span>
            </>
          ) : hasAnswer ? (
            <>
              <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl" />
              <span className="font-semibold text-red-700">
                Incorrect. Correct answers: Blank 1: {normalizedCorrectBlank1 || 'N/A'}, Blank 2: {normalizedCorrectBlank2 || 'N/A'}
              </span>
            </>
          ) : (
            <span className="text-gray-500 italic">No answer provided</span>
          )}
        </div>
      )}

      {/* Explanation (shown in results view) */}
      {showResults && explanation && (
        <ExplanationDisplay explanation={explanation} />
      )}
    </div>
  );
}
