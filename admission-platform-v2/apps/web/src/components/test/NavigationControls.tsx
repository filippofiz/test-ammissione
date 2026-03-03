/**
 * NavigationControls — Previous/Next footer buttons for test navigation.
 * Includes question number navigation in the center.
 * Supports multi-question pages with ranges (1-3, 4-6, etc.)
 */

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faClock, faList } from '@fortawesome/free-solid-svg-icons';

export interface NavigationControlsProps {
  // Navigation state
  currentSectionIndex: number;
  currentQuestionIndex: number; // For single question mode, this is the question index. For multi-question, this is the page index.
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
  answeredQuestions?: Set<number>; // Set of answered question indices (0-based)
  onNavigateToQuestion?: (index: number) => void;

  // Multi-question page support
  questionsPerPage?: number; // If > 1, show page ranges instead of individual numbers
  currentPageIndex?: number; // Current page (0-based) when using multi-question pages

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
  questionsPerPage = 1,
  currentPageIndex,
  onPrevious,
  onNext,
  onReturnToReview,
}: NavigationControlsProps) {
  const { t } = useTranslation();

  const isTimeExpired = timeRemaining !== null && timeRemaining <= 1;
  const effectiveQuestionsPerPage = questionsPerPage > 1 ? questionsPerPage : 1;
  const totalPages = Math.ceil(totalQuestionsInSection / effectiveQuestionsPerPage);
  const currentPage = currentPageIndex !== undefined ? currentPageIndex : Math.floor(currentQuestionIndex / effectiveQuestionsPerPage);

  const handlePageClick = (pageIndex: number) => {
    if (!onNavigateToQuestion) return;
    const targetQuestionIndex = pageIndex * effectiveQuestionsPerPage;

    // Can always go forward or stay on current
    if (pageIndex >= currentPage) {
      onNavigateToQuestion(targetQuestionIndex);
      return;
    }
    // Going back - check if allowed
    if (canGoBack) {
      onNavigateToQuestion(targetQuestionIndex);
    }
  };

  // Check if all questions in a page are answered
  const isPageAnswered = (pageIndex: number): boolean => {
    const startIdx = pageIndex * effectiveQuestionsPerPage;
    const endIdx = Math.min(startIdx + effectiveQuestionsPerPage, totalQuestionsInSection);
    for (let i = startIdx; i < endIdx; i++) {
      if (!answeredQuestions.has(i)) return false;
    }
    return true;
  };

  // Check if any question in a page is answered
  const isPagePartiallyAnswered = (pageIndex: number): boolean => {
    const startIdx = pageIndex * effectiveQuestionsPerPage;
    const endIdx = Math.min(startIdx + effectiveQuestionsPerPage, totalQuestionsInSection);
    for (let i = startIdx; i < endIdx; i++) {
      if (answeredQuestions.has(i)) return true;
    }
    return false;
  };

  // Get label for a page button
  const getPageLabel = (pageIndex: number): string => {
    if (effectiveQuestionsPerPage === 1) {
      return String(pageIndex + 1);
    }
    const startQ = pageIndex * effectiveQuestionsPerPage + 1;
    const endQ = Math.min((pageIndex + 1) * effectiveQuestionsPerPage, totalQuestionsInSection);
    if (startQ === endQ) {
      return String(startQ);
    }
    return `${startQ}-${endQ}`;
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

        {/* Question/Page numbers in center */}
        <div className="flex-1 flex justify-center">
          <div className="flex flex-wrap justify-center gap-1 max-w-[60vw] overflow-x-auto py-1">
            {Array.from({ length: totalPages }, (_, pageIndex) => {
              const isCurrent = pageIndex === currentPage;
              const isPast = pageIndex < currentPage;
              const isFullyAnswered = isPageAnswered(pageIndex);
              const isPartiallyAnswered = isPagePartiallyAnswered(pageIndex);
              const canClick = onNavigateToQuestion && (isCurrent || pageIndex > currentPage || (isPast && canGoBack));

              return (
                <button
                  key={pageIndex}
                  onClick={() => handlePageClick(pageIndex)}
                  disabled={!canClick || isTimeExpired}
                  className={`
                    min-w-[2rem] h-8 px-2 rounded-lg text-xs font-bold transition-all
                    ${isCurrent
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                      : isFullyAnswered
                        ? 'bg-green-500 text-white'
                        : isPartiallyAnswered
                          ? 'bg-green-300 text-green-800'
                          : 'bg-gray-200 text-gray-600'
                    }
                    ${canClick && !isTimeExpired ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                    disabled:opacity-50
                  `}
                >
                  {getPageLabel(pageIndex)}
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
                    : currentPage < totalPages - 1) ? (
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
