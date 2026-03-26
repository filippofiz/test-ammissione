/**
 * GI (Graphical Interpretation) Question Component
 * Displays a chart/graph with context and fill-in-the-blank statements
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { MathJaxRenderer, InlineMarkdownRenderer } from '../MathJaxRenderer';
import { Chart } from '../Chart';
import { normalizeWhitespace, normalizeOptionText } from '../../lib/textUtils';
import { ExplanationDisplay } from './ExplanationDisplay';
import { QuestionImage } from '../test/QuestionImage';
import { ComparisonChips, type ComparisonSlots } from './ComparisonChips';

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
  /** Comparison chips keyed by "blank1" or "blank2" */
  comparisonSlots?: ComparisonSlots;
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
  comparisonSlots,
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
            <QuestionImage
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
            <MathJaxRenderer>{normalizeWhitespace(contextText)}</MathJaxRenderer>
          </div>
        )}
      </div>

      {/* Statement with Dropdowns */}
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
        <p className="text-gray-800 text-base leading-relaxed">
          {parts.map((part, index) => {
            if (part === '[BLANK1]') {
              const isBlank1Correct = showResults && selectedBlank1 === normalizedCorrectBlank1;
              const isBlank1Wrong = showResults && selectedBlank1 && selectedBlank1 !== normalizedCorrectBlank1;

              // In showResults+readOnly mode with no student answer, display the correct answer
              const blank1DisplayValue = (showResults && readOnly && !selectedBlank1)
                ? (normalizedCorrectBlank1 || '')
                : (selectedBlank1 || '');

              return (
                <select
                  key={index}
                  value={blank1DisplayValue}
                  onChange={(e) => !readOnly && onBlank1Change(e.target.value)}
                  disabled={readOnly}
                  className={`inline-block align-middle mx-1 px-2 py-0.5 border-2 rounded font-semibold text-sm text-gray-800 max-w-[180px] transition-colors focus:outline-none focus:ring-2 ${
                    isBlank1Correct || (showResults && readOnly && !selectedBlank1 && normalizedCorrectBlank1)
                      ? 'border-green-600 bg-green-100 focus:ring-green-600'
                      : isBlank1Wrong
                        ? 'border-red-600 bg-red-100 focus:ring-red-600'
                        : 'border-brand-green bg-green-50 focus:ring-brand-green'
                  } ${!readOnly ? 'cursor-pointer hover:bg-green-100' : 'cursor-default'}`}
                >
                  <option value="" disabled>Select...</option>
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

              // In showResults+readOnly mode with no student answer, display the correct answer
              const blank2DisplayValue = (showResults && readOnly && !selectedBlank2)
                ? (normalizedCorrectBlank2 || '')
                : (selectedBlank2 || '');

              return (
                <select
                  key={index}
                  value={blank2DisplayValue}
                  onChange={(e) => !readOnly && onBlank2Change(e.target.value)}
                  disabled={readOnly}
                  className={`inline-block align-middle mx-1 px-2 py-0.5 border-2 rounded font-semibold text-sm text-gray-800 max-w-[180px] transition-colors focus:outline-none focus:ring-2 ${
                    isBlank2Correct || (showResults && readOnly && !selectedBlank2 && normalizedCorrectBlank2)
                      ? 'border-green-600 bg-green-100 focus:ring-green-600'
                      : isBlank2Wrong
                        ? 'border-red-600 bg-red-100 focus:ring-red-600'
                        : 'border-brand-green bg-green-50 focus:ring-brand-green'
                  } ${!readOnly ? 'cursor-pointer hover:bg-green-100' : 'cursor-default'}`}
                >
                  <option value="" disabled>Select...</option>
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
              return (
                <InlineMarkdownRenderer key={index} content={normalizeWhitespace(part)} />
              );
            }
          })}
        </p>
      </div>

      {/* Comparison chips for blank1 and blank2 */}
      {comparisonSlots && (
        <div className="flex flex-wrap gap-4">
          {['blank1', 'blank2'].map((blankKey, bi) => {
            const entries = comparisonSlots[blankKey];
            if (!entries || entries.length === 0) return null;
            return (
              <div key={blankKey} className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Blank {bi + 1}:</span>
                <ComparisonChips slotKey={blankKey} comparisonSlots={comparisonSlots} />
              </div>
            );
          })}
        </div>
      )}

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
