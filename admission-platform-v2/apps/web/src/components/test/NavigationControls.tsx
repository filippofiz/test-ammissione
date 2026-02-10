/**
 * NavigationControls — Previous/Next footer buttons for test navigation.
 * Extracted from TakeTestPage (lines 4590-4667).
 */

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faClock, faList } from '@fortawesome/free-solid-svg-icons';

export interface NavigationControlsProps {
  // Navigation state
  currentSectionIndex: number;
  currentQuestionIndex: number;
  expectedTotalSections: number;
  sectionQuestionLimit: number;
  totalQuestionsInSection: number;
  totalQuestions: number;

  // Mode flags
  isInReviewMode: boolean;
  isPreviewMode: boolean;
  isTransitioning: boolean;
  submitting: boolean;
  adaptivityMode?: string;

  // Timer
  timeRemaining: number | null;

  // Navigation checks
  canGoBack: boolean;

  // Callbacks
  onPrevious: () => void;
  onNext: () => void;
  onReturnToReview: () => void;
}

export function NavigationControls({
  currentSectionIndex,
  currentQuestionIndex,
  expectedTotalSections,
  sectionQuestionLimit,
  totalQuestionsInSection,
  totalQuestions,
  isInReviewMode,
  isPreviewMode,
  isTransitioning,
  submitting,
  adaptivityMode,
  timeRemaining,
  canGoBack,
  onPrevious,
  onNext,
  onReturnToReview,
}: NavigationControlsProps) {
  const { t } = useTranslation();

  const isTimeExpired = timeRemaining !== null && timeRemaining <= 1;

  return (
    <div className="bg-white border-t-2 border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Previous button - disabled in review mode */}
        {!isInReviewMode && (
          <button
            onClick={onPrevious}
            disabled={!canGoBack || isTransitioning || isTimeExpired}
            className="px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('takeTest.previous')}
          </button>
        )}
        {/* Return to Review button (when in review mode) */}
        {isInReviewMode && (
          <button
            onClick={onReturnToReview}
            disabled={isTimeExpired}
            className="px-4 py-3 rounded-xl font-semibold transition-all bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faList} className="mr-2" />
            {t('takeTest.returnToReview') || 'Return to Review'}
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600">
        {t('takeTest.section')} {currentSectionIndex + 1} {t('takeTest.of')} {expectedTotalSections}
      </div>

      {/* Next button - show Return to Review in review mode */}
      {isInReviewMode ? (
        <button
          onClick={onReturnToReview}
          disabled={isTimeExpired}
          className="px-6 py-3 rounded-xl font-semibold transition-all bg-brand-green text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faList} className="mr-2" />
          {t('takeTest.returnToReview') || 'Return to Review'}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={submitting || isTransitioning || isTimeExpired || (isPreviewMode && currentQuestionIndex >= totalQuestions - 1)}
          className="px-6 py-3 rounded-xl font-semibold transition-all bg-brand-green text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <FontAwesomeIcon icon={faClock} className="mr-2 animate-spin" />
              {t('takeTest.submitting') || 'Submitting...'}
            </>
          ) : (
            <>
              {/* In adaptive mode, check against section question limit, not current total */}
              {(adaptivityMode === 'adaptive'
                ? currentQuestionIndex < sectionQuestionLimit - 1
                : currentQuestionIndex < totalQuestionsInSection - 1) ? (
                <>
                  {t('takeTest.next')}
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </>
              ) : isPreviewMode ? (
                // In preview mode, show "Last Question" instead of submit
                <>
                  {t('takeTest.next')}
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </>
              ) : currentSectionIndex < expectedTotalSections - 1 ? (
                t('takeTest.completeSection')
              ) : (
                t('takeTest.submitTest')
              )}
            </>
          )}
        </button>
      )}
    </div>
  );
}
