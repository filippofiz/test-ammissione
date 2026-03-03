/**
 * QuestionNavigationList Component
 * Displays numbered question buttons with answered/unanswered status
 * Allows navigation following test rules (can go back, etc.)
 */

import { useTranslation } from 'react-i18next';

interface QuestionNavigationListProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestions: Set<number>; // Set of answered question indices
  canGoBack: boolean;
  onNavigate: (questionIndex: number) => void;
}

export function QuestionNavigationList({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  canGoBack,
  onNavigate,
}: QuestionNavigationListProps) {
  const { t } = useTranslation();

  if (totalQuestions === 0) {
    return null;
  }

  const handleClick = (index: number) => {
    // Can always go forward or stay on current
    if (index >= currentQuestionIndex) {
      onNavigate(index);
      return;
    }
    // Going back - check if allowed
    if (canGoBack) {
      onNavigate(index);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        {t('takeTest.questions', 'Questions')}
      </h4>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isAnswered = answeredQuestions.has(index);
          const isCurrent = index === currentQuestionIndex;
          const isPast = index < currentQuestionIndex;
          const canClick = isCurrent || index > currentQuestionIndex || (isPast && canGoBack);

          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!canClick}
              className={`
                w-9 h-9 rounded-lg text-sm font-semibold transition-all
                ${isCurrent
                  ? 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-1'
                  : isAnswered
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : isPast
                      ? 'bg-orange-400 text-white hover:bg-orange-500'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }
                ${!canClick ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={
                isCurrent
                  ? t('takeTest.currentQuestion', 'Current question')
                  : isAnswered
                    ? t('takeTest.answered', 'Answered')
                    : isPast
                      ? t('takeTest.skipped', 'Skipped')
                      : t('takeTest.notAnswered', 'Not answered')
              }
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500"></span>
          {t('takeTest.answered', 'Answered')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-400"></span>
          {t('takeTest.skipped', 'Skipped')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200"></span>
          {t('takeTest.notAnswered', 'Not answered')}
        </span>
      </div>
    </div>
  );
}
