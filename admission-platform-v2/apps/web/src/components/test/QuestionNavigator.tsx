/**
 * QuestionNavigator Component
 *
 * A question grid/list component that shows all questions with their status.
 * Used in review screens and navigation sidebars during tests.
 *
 * Features:
 * - Shows question numbers with visual status indicators
 * - Supports grid and list layouts
 * - Highlights answered, unanswered, bookmarked, and current questions
 * - Click to navigate to specific question
 * - Shows summary counts (answered, bookmarked, unanswered)
 * - Supports section grouping for multi-section tests
 */

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faBookmark,
  faExclamationCircle,
  faList,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Question status for display
 */
export interface QuestionStatus {
  id: string;
  questionNumber: number;
  isAnswered: boolean;
  isBookmarked: boolean;
  isCurrent?: boolean;
  isUnanswered?: boolean; // Explicitly marked as unanswered (time up)
  section?: string;
}

export interface QuestionNavigatorProps {
  /** List of questions with their statuses */
  questions: QuestionStatus[];
  /** Currently selected/active question index */
  currentIndex?: number;
  /** Callback when user clicks a question to navigate */
  onQuestionClick?: (index: number, questionId: string) => void;
  /** Layout mode: grid (compact) or list (detailed) */
  layout?: 'grid' | 'list';
  /** Whether clicking is disabled (e.g., time expired) */
  disabled?: boolean;
  /** Show section headers for multi-section tests */
  showSections?: boolean;
  /** Title for the navigator (e.g., "Review Questions") */
  title?: string;
  /** Show summary stats (answered/bookmarked counts) */
  showSummary?: boolean;
  /** Maximum changes allowed (for GMAT review mode) */
  maxChanges?: number;
  /** Number of changes used (for GMAT review mode) */
  changesUsed?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get question status styling based on its state
 */
function getQuestionStyle(
  question: QuestionStatus,
  isCurrent: boolean
): { bgClass: string; textClass: string; borderClass: string } {
  if (isCurrent) {
    return {
      bgClass: 'bg-blue-500',
      textClass: 'text-white',
      borderClass: 'border-blue-600',
    };
  }

  if (question.isBookmarked && !question.isAnswered) {
    return {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      borderClass: 'border-yellow-400',
    };
  }

  if (question.isBookmarked && question.isAnswered) {
    return {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      borderClass: 'border-yellow-400',
    };
  }

  if (question.isAnswered) {
    return {
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      borderClass: 'border-green-400',
    };
  }

  if (question.isUnanswered) {
    return {
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
      borderClass: 'border-red-400',
    };
  }

  return {
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300',
  };
}

/**
 * Grid layout - compact number buttons
 */
function QuestionGrid({
  questions,
  currentIndex,
  onQuestionClick,
  disabled,
}: {
  questions: QuestionStatus[];
  currentIndex?: number;
  onQuestionClick?: (index: number, questionId: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {questions.map((question, index) => {
        const isCurrent = index === currentIndex;
        const style = getQuestionStyle(question, isCurrent);

        return (
          <button
            key={question.id}
            onClick={() => onQuestionClick?.(index, question.id)}
            disabled={disabled}
            className={`
              relative w-10 h-10 rounded-lg border-2 font-bold text-sm
              transition-all hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              ${style.bgClass} ${style.textClass} ${style.borderClass}
              ${isCurrent ? 'ring-2 ring-blue-300 ring-offset-1' : ''}
            `}
            title={`Question ${question.questionNumber}${question.isBookmarked ? ' (Bookmarked)' : ''}${question.isAnswered ? ' (Answered)' : ' (Unanswered)'}`}
          >
            {question.questionNumber}
            {question.isBookmarked && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * List layout - detailed rows with status info
 */
function QuestionList({
  questions,
  currentIndex,
  onQuestionClick,
  disabled,
}: {
  questions: QuestionStatus[];
  currentIndex?: number;
  onQuestionClick?: (index: number, questionId: string) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      {questions.map((question, index) => {
        const isCurrent = index === currentIndex;
        const style = getQuestionStyle(question, isCurrent);

        return (
          <button
            key={question.id}
            onClick={() => onQuestionClick?.(index, question.id)}
            disabled={disabled}
            className={`
              flex items-center justify-between w-full p-3 rounded-lg border-2
              transition-all hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              ${style.borderClass}
              ${isCurrent ? 'bg-blue-50' : question.isBookmarked ? 'bg-yellow-50' : question.isAnswered ? 'bg-green-50' : 'bg-gray-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <span
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${question.isAnswered ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}
                  ${isCurrent ? 'ring-2 ring-blue-400' : ''}
                `}
              >
                {question.questionNumber}
              </span>
              <span className="text-sm text-gray-700">
                {t('takeTest.question', 'Question')} {question.questionNumber}
              </span>
              {question.section && (
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                  {question.section}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {question.isBookmarked && (
                <FontAwesomeIcon icon={faBookmark} className="text-yellow-500" />
              )}
              {question.isAnswered ? (
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
              ) : (
                <span className="text-xs text-red-500 font-semibold">
                  {t('takeTest.notAnswered', 'Not answered')}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Summary stats component
 */
function NavigatorSummary({
  questions,
  maxChanges,
  changesUsed,
}: {
  questions: QuestionStatus[];
  maxChanges?: number;
  changesUsed?: number;
}) {
  const { t } = useTranslation();

  const answered = questions.filter((q) => q.isAnswered).length;
  const bookmarked = questions.filter((q) => q.isBookmarked).length;
  const unanswered = questions.length - answered;

  return (
    <div className="flex flex-wrap gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-gray-700">
          {t('takeTest.answered', 'Answered')}: {answered}/{questions.length}
        </span>
      </div>

      {unanswered > 0 && (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="text-gray-700">
            {t('takeTest.unanswered', 'Unanswered')}: {unanswered}
          </span>
        </div>
      )}

      {bookmarked > 0 && (
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBookmark} className="text-yellow-500" />
          <span className="text-gray-700">
            {t('takeTest.bookmarked', 'Bookmarked')}: {bookmarked}
          </span>
        </div>
      )}

      {maxChanges !== undefined && changesUsed !== undefined && (
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${
              changesUsed >= maxChanges ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            {t('takeTest.changesUsed', 'Changes used')}: {changesUsed}/{maxChanges}
          </span>
        </div>
      )}
    </div>
  );
}

export function QuestionNavigator({
  questions,
  currentIndex,
  onQuestionClick,
  layout = 'grid',
  disabled = false,
  showSections = false,
  title,
  showSummary = true,
  maxChanges,
  changesUsed,
  className = '',
}: QuestionNavigatorProps) {
  const { t } = useTranslation();

  // Group by section if needed
  const groupedQuestions = showSections
    ? questions.reduce((acc, q) => {
        const section = q.section || 'Questions';
        if (!acc[section]) acc[section] = [];
        acc[section].push(q);
        return acc;
      }, {} as Record<string, QuestionStatus[]>)
    : { '': questions };

  const sectionKeys = Object.keys(groupedQuestions);

  return (
    <div className={`${className}`}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faList} className="text-gray-500" />
            {title}
          </h3>
        </div>
      )}

      {/* Summary */}
      {showSummary && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <NavigatorSummary
            questions={questions}
            maxChanges={maxChanges}
            changesUsed={changesUsed}
          />
        </div>
      )}

      {/* Questions by section */}
      <div className="space-y-4">
        {sectionKeys.map((section) => (
          <div key={section}>
            {showSections && section && (
              <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                {section}
              </h4>
            )}
            {layout === 'grid' ? (
              <QuestionGrid
                questions={groupedQuestions[section]}
                currentIndex={
                  // Adjust current index for section offset
                  showSections
                    ? currentIndex !== undefined
                      ? currentIndex -
                        sectionKeys
                          .slice(0, sectionKeys.indexOf(section))
                          .reduce((acc, s) => acc + groupedQuestions[s].length, 0)
                      : undefined
                    : currentIndex
                }
                onQuestionClick={(localIndex, questionId) => {
                  // Convert local index back to global
                  const globalIndex = showSections
                    ? sectionKeys
                        .slice(0, sectionKeys.indexOf(section))
                        .reduce((acc, s) => acc + groupedQuestions[s].length, 0) +
                      localIndex
                    : localIndex;
                  onQuestionClick?.(globalIndex, questionId);
                }}
                disabled={disabled}
              />
            ) : (
              <QuestionList
                questions={groupedQuestions[section]}
                currentIndex={
                  showSections
                    ? currentIndex !== undefined
                      ? currentIndex -
                        sectionKeys
                          .slice(0, sectionKeys.indexOf(section))
                          .reduce((acc, s) => acc + groupedQuestions[s].length, 0)
                      : undefined
                    : currentIndex
                }
                onQuestionClick={(localIndex, questionId) => {
                  const globalIndex = showSections
                    ? sectionKeys
                        .slice(0, sectionKeys.indexOf(section))
                        .reduce((acc, s) => acc + groupedQuestions[s].length, 0) +
                      localIndex
                    : localIndex;
                  onQuestionClick?.(globalIndex, questionId);
                }}
                disabled={disabled}
              />
            )}
          </div>
        ))}
      </div>

      {/* Unanswered warning */}
      {questions.some((q) => !q.isAnswered) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-orange-500" />
          <span className="text-sm text-orange-700">
            {t(
              'takeTest.unansweredWarning',
              'Unanswered questions will be marked as incorrect.'
            )}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact sidebar variant for use during test-taking
 */
export function QuestionNavigatorSidebar({
  questions,
  currentIndex,
  onQuestionClick,
  disabled,
  className = '',
}: Omit<QuestionNavigatorProps, 'layout' | 'title' | 'showSummary'>) {
  const answered = questions.filter((q) => q.isAnswered).length;
  const bookmarked = questions.filter((q) => q.isBookmarked).length;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Mini summary */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">
          {answered}/{questions.length} answered
        </span>
        {bookmarked > 0 && (
          <span className="text-sm text-yellow-600 flex items-center gap-1">
            <FontAwesomeIcon icon={faBookmark} className="text-xs" />
            {bookmarked}
          </span>
        )}
      </div>

      {/* Compact grid */}
      <QuestionGrid
        questions={questions}
        currentIndex={currentIndex}
        onQuestionClick={onQuestionClick}
        disabled={disabled}
      />
    </div>
  );
}

export default QuestionNavigator;
