/**
 * Multiple Choice Question Component
 * Standard multiple choice with single correct answer
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { MathJaxRenderer } from '../MathJaxRenderer';
import { normalizeWhitespace, normalizeOptionText } from '../../lib/textUtils';
import { ExplanationDisplay } from './ExplanationDisplay';

interface MultipleChoiceQuestionProps {
  questionText: string;
  passageText?: string; // Optional passage text for reading comprehension
  passageTitle?: string; // Optional passage title
  imageUrl?: string;
  options: Record<string, string>; // { "a": "option text", "b": "option text", ... }
  imageOptions?: Record<string, string>; // { "a": "image_url", "b": "image_url", ... } - Optional images for answer options
  selectedAnswer?: string;
  onAnswerChange: (answer: string) => void;
  readOnly?: boolean; // For results view - disables answer buttons
  correctAnswer?: string; // For results view - shows correct answer
  showResults?: boolean; // For results view - displays answer feedback
  explanation?: string; // For results view - shows explanation after answer
}

export function MultipleChoiceQuestion({
  questionText,
  passageText,
  passageTitle,
  imageUrl,
  options,
  imageOptions,
  selectedAnswer,
  onAnswerChange,
  readOnly = false,
  correctAnswer,
  showResults = false,
  explanation,
}: MultipleChoiceQuestionProps) {
  const { t } = useTranslation();

  // If there's passage text, use a side-by-side layout with full width container
  if (passageText) {
    return (
      <div className="flex gap-8 w-full">
        {/* Passage Text - Display on the left */}
        <div className="flex-1 min-w-[45%] border-2 border-blue-200 rounded-xl p-6 bg-blue-50 h-fit sticky top-4">
          {passageTitle && (
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              <MathJaxRenderer>{normalizeWhitespace(passageTitle)}</MathJaxRenderer>
            </h3>
          )}
          <div className="text-gray-700 whitespace-pre-wrap max-h-[650px] overflow-y-auto overflow-x-auto">
            <MathJaxRenderer>{normalizeWhitespace(passageText)}</MathJaxRenderer>
          </div>
        </div>

        {/* Question and Options on the right - wider */}
        <div className="flex-1 min-w-[45%] space-y-6">
          {/* Question Text */}
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-white overflow-x-auto">
            <div className="text-gray-800 text-lg whitespace-pre-wrap mb-4">
              <MathJaxRenderer>{normalizeWhitespace(questionText)}</MathJaxRenderer>
            </div>

            {/* Image if present */}
            {imageUrl && (
              <div className="mt-4">
                <img
                  src={imageUrl}
                  alt="Question illustration"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
        {Object.entries(options).map(([key, text]) => {
          const isSelected = selectedAnswer === key;
          const isCorrectOption = showResults && correctAnswer === key;
          const isWrongSelection = showResults && isSelected && correctAnswer !== key;

          let borderClass = 'border-gray-200';
          let bgClass = 'bg-white';
          let borderStyle = 'border-2';

          if (isSelected && isCorrectOption) {
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
          } else if (isSelected && !showResults) {
            // Selected during test (not results view)
            borderClass = 'border-brand-green';
            bgClass = 'bg-green-50';
          }

          return (
            <button
              key={key}
              onClick={() => !readOnly && onAnswerChange(key)}
              className={`w-full text-left p-4 rounded-xl ${borderStyle} transition-all ${borderClass} ${bgClass} ${
                readOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:border-gray-300'
              }`}
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
                  {key.toUpperCase()}
                </div>
                <div className="flex-1">
                  {imageOptions?.[key] ? (
                    <img
                      src={imageOptions[key]}
                      alt={`Option ${key.toUpperCase()}`}
                      className="max-w-full h-auto rounded"
                    />
                  ) : (
                    text && <MathJaxRenderer>{normalizeOptionText(text)}</MathJaxRenderer>
                  )}
                  {showResults && isSelected && isCorrectOption && (
                    <div className="text-xs text-green-700 font-semibold mt-1">{t('testResults.yourAnswerCorrect')}</div>
                  )}
                  {isWrongSelection && (
                    <div className="text-xs text-red-700 font-semibold mt-1">{t('testResults.yourAnswerLabel')}</div>
                  )}
                  {isCorrectOption && !isSelected && (
                    <div className="text-xs text-green-700 font-semibold mt-1">{t('testResults.correctAnswerLabel')}</div>
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

          {/* Explanation (shown in results view) */}
          {showResults && explanation && (
            <ExplanationDisplay explanation={explanation} />
          )}
        </div>
      </div>
    );
  }

  // Default layout when there's no passage text
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white overflow-x-auto">
        <div className="text-gray-800 text-lg whitespace-pre-wrap mb-4">
          <MathJaxRenderer>{normalizeWhitespace(questionText)}</MathJaxRenderer>
        </div>

        {/* Image if present */}
        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {Object.entries(options).map(([key, text]) => {
          const isSelected = selectedAnswer === key;
          const isCorrectOption = showResults && correctAnswer === key;
          const isWrongSelection = showResults && isSelected && correctAnswer !== key;

          let borderClass = 'border-gray-200';
          let bgClass = 'bg-white';
          let borderStyle = 'border-2';

          if (isSelected && isCorrectOption) {
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
          } else if (isSelected && !showResults) {
            // Selected during test (not results view)
            borderClass = 'border-brand-green';
            bgClass = 'bg-green-50';
          }

          return (
            <button
              key={key}
              onClick={() => !readOnly && onAnswerChange(key)}
              className={`w-full text-left p-4 rounded-xl ${borderStyle} transition-all ${borderClass} ${bgClass} ${
                readOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:border-gray-300'
              }`}
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
                  {key.toUpperCase()}
                </div>
                <div className="flex-1">
                  {imageOptions?.[key] ? (
                    <img
                      src={imageOptions[key]}
                      alt={`Option ${key.toUpperCase()}`}
                      className="max-w-full h-auto rounded"
                    />
                  ) : (
                    text && <MathJaxRenderer>{normalizeOptionText(text)}</MathJaxRenderer>
                  )}
                  {showResults && isSelected && isCorrectOption && (
                    <div className="text-xs text-green-700 font-semibold mt-1">{t('testResults.yourAnswerCorrect')}</div>
                  )}
                  {isWrongSelection && (
                    <div className="text-xs text-red-700 font-semibold mt-1">{t('testResults.yourAnswerLabel')}</div>
                  )}
                  {isCorrectOption && !isSelected && (
                    <div className="text-xs text-green-700 font-semibold mt-1">{t('testResults.correctAnswerLabel')}</div>
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

      {/* Explanation (shown in results view) */}
      {showResults && explanation && (
        <ExplanationDisplay explanation={explanation} />
      )}
    </div>
  );
}
