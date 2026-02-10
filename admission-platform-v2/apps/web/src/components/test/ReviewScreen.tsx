/**
 * ReviewScreen Component
 *
 * A modal overlay for reviewing questions before final submission.
 * Used at the end of a test section or the entire test.
 *
 * Features:
 * - Shows question grid with status indicators
 * - Displays answered/unanswered/bookmarked counts
 * - Allows navigation to specific questions for review
 * - GMAT-style change tracking (max changes allowed)
 * - Confirmation before final submission
 */

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faCheckCircle,
  faBookmark,
  faExclamationTriangle,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { QuestionNavigator, QuestionStatus } from './QuestionNavigator';

export interface ReviewScreenProps {
  /** Whether to show the review screen */
  isOpen: boolean;
  /** List of questions with their statuses */
  questions: QuestionStatus[];
  /** Callback when user clicks a question to navigate */
  onQuestionClick: (index: number, questionId: string) => void;
  /** Callback when user wants to complete/submit */
  onComplete: () => void;
  /** Callback when user wants to close review without submitting */
  onClose?: () => void;
  /** Whether this is the last section (submit test) or not (complete section) */
  isLastSection?: boolean;
  /** Section name for display */
  sectionName?: string;
  /** Current section number */
  currentSectionIndex?: number;
  /** Total sections */
  totalSections?: number;
  /** Whether clicking is disabled (e.g., time expired) */
  disabled?: boolean;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
  /** Maximum changes allowed (GMAT review mode) */
  maxChanges?: number;
  /** Number of changes used (GMAT review mode) */
  changesUsed?: number;
  /** Time remaining (optional, for display) */
  timeRemaining?: number | null;
}

/**
 * Format time in MM:SS or HH:MM:SS
 */
function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function ReviewScreen({
  isOpen,
  questions,
  onQuestionClick,
  onComplete,
  onClose,
  isLastSection = true,
  sectionName,
  currentSectionIndex,
  totalSections,
  disabled = false,
  isSubmitting = false,
  maxChanges,
  changesUsed,
  timeRemaining,
}: ReviewScreenProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Calculate stats
  const answered = questions.filter((q) => q.isAnswered).length;
  const unanswered = questions.length - answered;
  const bookmarked = questions.filter((q) => q.isBookmarked).length;

  // Determine button text
  const buttonText = isLastSection
    ? t('takeTest.submitTest', 'Submit Test')
    : t('takeTest.completeSection', 'Complete Section');

  const buttonLoadingText = isLastSection
    ? t('takeTest.submitting', 'Submitting...')
    : t('takeTest.completing', 'Completing...');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faList} className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {t('takeTest.reviewSection', 'Review Section')}
              </h3>
              {sectionName && (
                <p className="text-sm text-gray-500">
                  {sectionName}
                  {currentSectionIndex !== undefined && totalSections && (
                    <span className="ml-2">
                      ({currentSectionIndex + 1} of {totalSections})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Timer (if provided) */}
          {timeRemaining !== null && timeRemaining !== undefined && (
            <div
              className={`px-3 py-1.5 rounded-lg font-mono font-bold ${
                timeRemaining < 60
                  ? 'bg-red-100 text-red-700 animate-pulse'
                  : timeRemaining < 300
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
          )}

          {/* Close button (if onClose provided) */}
          {onClose && (
            <button
              onClick={onClose}
              disabled={disabled}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-6">
            {/* Answered */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('takeTest.answered', 'Answered')}</div>
                <div className="font-bold text-gray-800">
                  {answered} / {questions.length}
                </div>
              </div>
            </div>

            {/* Unanswered */}
            {unanswered > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('takeTest.unanswered', 'Unanswered')}</div>
                  <div className="font-bold text-red-600">{unanswered}</div>
                </div>
              </div>
            )}

            {/* Bookmarked */}
            {bookmarked > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBookmark} className="text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('takeTest.bookmarked', 'Bookmarked')}</div>
                  <div className="font-bold text-yellow-700">{bookmarked}</div>
                </div>
              </div>
            )}

            {/* Changes Used (GMAT mode) */}
            {maxChanges !== undefined && changesUsed !== undefined && (
              <div className="flex items-center gap-2 ml-auto">
                <div
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    changesUsed >= maxChanges
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('takeTest.changesUsed', 'Changes')}: {changesUsed}/{maxChanges}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <QuestionNavigator
            questions={questions}
            onQuestionClick={onQuestionClick}
            layout="list"
            disabled={disabled}
            showSummary={false}
            maxChanges={maxChanges}
            changesUsed={changesUsed}
          />
        </div>

        {/* Warning for unanswered questions */}
        {unanswered > 0 && (
          <div className="px-6 py-3 bg-orange-50 border-t border-orange-200">
            <div className="flex items-center gap-2 text-orange-700">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span className="text-sm font-medium">
                {t(
                  'takeTest.unansweredWarning',
                  `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Unanswered questions will be marked as incorrect.`
                )}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <div className="text-sm text-gray-600">
            {t('takeTest.clickQuestionToReview', 'Click on a question to review and edit your answer.')}
          </div>

          <button
            onClick={onComplete}
            disabled={disabled || isSubmitting}
            className={`
              px-6 py-3 rounded-xl font-semibold transition-all
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isLastSection
                  ? 'bg-gradient-to-r from-brand-green to-green-600 text-white hover:shadow-lg'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {buttonLoadingText}
              </>
            ) : (
              <>
                {isLastSection ? (
                  <FontAwesomeIcon icon={faCheckCircle} />
                ) : (
                  <FontAwesomeIcon icon={faArrowRight} />
                )}
                {buttonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact review panel variant for sidebar use during test
 */
export function ReviewPanel({
  questions,
  onQuestionClick,
  onEnterReview,
  disabled = false,
  className = '',
}: {
  questions: QuestionStatus[];
  onQuestionClick: (index: number, questionId: string) => void;
  onEnterReview?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();

  const answered = questions.filter((q) => q.isAnswered).length;
  const bookmarked = questions.filter((q) => q.isBookmarked).length;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Mini summary */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">
          {answered}/{questions.length} {t('takeTest.answered', 'answered')}
        </span>
        {bookmarked > 0 && (
          <span className="text-sm text-yellow-600 flex items-center gap-1">
            <FontAwesomeIcon icon={faBookmark} className="text-xs" />
            {bookmarked}
          </span>
        )}
      </div>

      {/* Compact grid */}
      <QuestionNavigator
        questions={questions}
        onQuestionClick={onQuestionClick}
        layout="grid"
        disabled={disabled}
        showSummary={false}
      />

      {/* Review button */}
      {onEnterReview && (
        <button
          onClick={onEnterReview}
          disabled={disabled}
          className="mt-4 w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faList} />
          {t('takeTest.reviewAll', 'Review All')}
        </button>
      )}
    </div>
  );
}

export default ReviewScreen;
