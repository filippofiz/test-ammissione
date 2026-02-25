/**
 * ResultsFilterBar Component
 *
 * Combined filter bar for test results, supporting:
 * - Section dropdown filter
 * - Correctness buttons (all / correct / wrong / unanswered)
 * - Bookmark filter (GMAT)
 * - Attempt selector (regular tests with multiple attempts)
 * - Filtered/total results counter
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faBookmark,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { getSectionFullName } from './types';

export type CorrectnessFilter = 'all' | 'correct' | 'wrong' | 'unanswered';

export interface ResultsFilterBarProps {
  /** Available sections to filter by */
  sections: string[];
  filterSection: string;
  onSectionChange: (section: string) => void;

  filterCorrectness: CorrectnessFilter;
  onCorrectnessChange: (value: CorrectnessFilter) => void;
  correctCount: number;
  wrongCount: number;
  /** Number of unanswered questions (shown as filter option if > 0) */
  unansweredCount?: number;

  /** Bookmark filter (GMAT) */
  bookmarkedCount?: number;
  filterBookmarked?: boolean;
  onBookmarkToggle?: () => void;

  /** Attempt selector (regular tests) */
  totalAttempts?: number;
  selectedAttempt?: number | null;
  attemptsWithAnswers?: Set<number>;
  onAttemptChange?: (attempt: number) => void;

  /** Results counter */
  filteredCount: number;
  totalCount: number;

  /** Custom section name formatter (defaults to getSectionFullName) */
  sectionNameFormatter?: (section: string) => string;
}

export function ResultsFilterBar({
  sections,
  filterSection,
  onSectionChange,
  filterCorrectness,
  onCorrectnessChange,
  correctCount,
  wrongCount,
  unansweredCount,
  bookmarkedCount,
  filterBookmarked,
  onBookmarkToggle,
  totalAttempts,
  selectedAttempt,
  attemptsWithAnswers,
  onAttemptChange,
  filteredCount,
  totalCount,
  sectionNameFormatter = getSectionFullName,
}: ResultsFilterBarProps) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Section Filter */}
        {sections.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Section:</span>
            <select
              value={filterSection}
              onChange={(e) => onSectionChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Sections</option>
              {sections.map(section => (
                <option key={section} value={section}>
                  {sectionNameFormatter(section)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Correctness Filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCorrectnessChange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterCorrectness === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onCorrectnessChange('correct')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filterCorrectness === 'correct'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
            {correctCount}
          </button>
          <button
            onClick={() => onCorrectnessChange('wrong')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filterCorrectness === 'wrong'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
            {wrongCount}
          </button>
          {unansweredCount != null && unansweredCount > 0 && (
            <button
              onClick={() => onCorrectnessChange('unanswered')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filterCorrectness === 'unanswered'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="text-xs" />
              {unansweredCount}
            </button>
          )}
        </div>

        {/* Bookmark Filter */}
        {bookmarkedCount != null && bookmarkedCount > 0 && onBookmarkToggle && (
          <button
            onClick={onBookmarkToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filterBookmarked
                ? 'bg-amber-500 text-white'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            <FontAwesomeIcon icon={faBookmark} className="text-xs" />
            {bookmarkedCount} Bookmarked
          </button>
        )}

        {/* Attempt Selector */}
        {totalAttempts != null && totalAttempts > 1 && onAttemptChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Attempt:</span>
            <select
              value={selectedAttempt || ''}
              onChange={(e) => onAttemptChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              {Array.from({ length: totalAttempts }, (_, i) => i + 1).map(num => (
                <option
                  key={num}
                  value={num}
                  disabled={attemptsWithAnswers ? !attemptsWithAnswers.has(num) : false}
                >
                  Attempt {num}{attemptsWithAnswers && !attemptsWithAnswers.has(num) ? ' (no data)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Results Counter */}
        <div className="text-sm text-gray-500 ml-auto">
          Showing {filteredCount} of {totalCount} questions
        </div>
      </div>
    </div>
  );
}
