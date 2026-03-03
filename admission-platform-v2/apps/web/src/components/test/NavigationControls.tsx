/**
 * NavigationControls — Previous/Next footer buttons for test navigation.
 * Includes question number navigation in the center.
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

  // Question navigation
  answeredQuestions?: Set<number>;
  onNavigateToQuestion?: (index: number) => void;

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
  answeredQuestions = new Set(),
  onNavigateToQuestion,
  onPrevious,
  onNext,
  onReturnToReview,
}: NavigationControlsProps) {
  const { t } = useTranslation();

  const isTimeExpired = timeRemaining !== null && timeRemaining <= 1;

  const handleQuestionClick = (index: number) => {
    if (!onNavigateToQuestion) return;
    // Can always go forward or stay on current
    if (index >= currentQuestionIndex) {
      onNavigateToQuestion(index);
      return;
    }
    // Going back - check if allowed
    if (canGoBack) {
      onNavigateToQuestion(index);
    }
  };

  return (
    <div className="bg-white border-t-2 border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        {/* Previous button */}
        <div className="flex-shrink-0">
          {!isInReviewMode ? (
            <button
              onClick={onPrevious}
              disabled={!canGoBack || isTransitioning || isTimeExpired}
              className="px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:hover:bg-gray-200 text-sm"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
              {t('takeTest.previous')}
            </button>
          ) : (
            <button
              onClick={onReturnToReview}
              disabled={isTimeExpired}
              className="px-3 py-2 rounded-xl font-semibold transition-all bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FontAwesomeIcon icon={faList} className="mr-1" />
              {t('takeTest.returnToReview') || 'Review'}
            </button>
          )}
        </div>

        {/* Question numbers in center */}
        <div className="flex-1 flex justify-center">
          <div className="flex flex-wrap justify-center gap-1 max-w-[60vw] overflow-x-auto py-1">
            {Array.from({ length: totalQuestionsInSection }, (_, index) => {
              const isAnswered = answeredQuestions.has(index);
              const isCurrent = index === currentQuestionIndex;
              const isPast = index < currentQuestionIndex;
              const canClick = onNavigateToQuestion && (isCurrent || index > currentQuestionIndex || (isPast && canGoBack));

              return (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(index)}
                  disabled={!canClick || isTimeExpired}
                  className={`
                    w-8 h-8 rounded-lg text-xs font-bold transition-all
                    ${isCurrent
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                      : isAnswered
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                    ${canClick && !isTimeExpired ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                    disabled:opacity-50
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <div className="flex-shrink-0">
          {isInReviewMode ? (
            <button
              onClick={onReturnToReview}
              disabled={isTimeExpired}
              className="px-4 py-2 rounded-xl font-semibold transition-all bg-brand-green text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FontAwesomeIcon icon={faList} className="mr-1" />
              {t('takeTest.returnToReview') || 'Review'}
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={submitting || isTransitioning || isTimeExpired || (isPreviewMode && currentQuestionIndex >= totalQuestions - 1)}
              className="px-4 py-2 rounded-xl font-semibold transition-all bg-brand-green text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? (
                <>
                  <FontAwesomeIcon icon={faClock} className="mr-1 animate-spin" />
                  {t('takeTest.submitting') || '...'}
                </>
              ) : (
                <>
                  {(adaptivityMode === 'adaptive'
                    ? currentQuestionIndex < sectionQuestionLimit - 1
                    : currentQuestionIndex < totalQuestionsInSection - 1) ? (
                    <>
                      {t('takeTest.next')}
                      <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                    </>
                  ) : isPreviewMode ? (
                    <>
                      {t('takeTest.next')}
                      <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
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
      </div>
    </div>
  );
}
