/**
 * QuestionResultCard Component
 *
 * Displays a single question result with:
 * - Header: question number, correctness icon, badges, time
 * - Body: question content via QuestionRenderer (readOnly + showResults)
 * - Footer: tutor review section (regular tests, tutor only)
 */

import { useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faBookmark,
  faClock,
  faTag,
  faFlag,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { QuestionRenderer, type UnifiedAnswer } from '../test/QuestionRenderer';
import { type UnifiedQuestionResult, getSectionFullName, getQuestionCategory } from './types';

export interface QuestionResultCardProps {
  result: UnifiedQuestionResult;
  /** Whether answers data is available (controls correctness display) */
  hasAnswersData?: boolean;
  /** Language for question rendering */
  language?: 'it' | 'en';
  /** Whether this is a student view (hides tutor review section) */
  isStudentView?: boolean;
  /** Callback for saving question review (tutor only) */
  onReviewSave?: (questionId: string, needsReview: boolean, notes: string) => void;
}

/**
 * Convert a stored student answer into the UnifiedAnswer format
 * expected by QuestionRenderer.
 */
function toRendererAnswer(
  studentAnswer: any,
  questionData: any,
): UnifiedAnswer {
  if (!studentAnswer) return {};

  const diType = questionData?.di_type as string | undefined;

  // GMAT answers are stored directly (string, string[], or Record)
  // Regular test answers are stored as { answer: { answer: "e" } } or similar
  // Normalize both formats

  // Handle regular test nested format: { answer: { answer: "e" } }
  let normalizedAnswer = studentAnswer;
  if (studentAnswer && typeof studentAnswer === 'object' && 'answer' in studentAnswer && !diType) {
    normalizedAnswer = studentAnswer.answer;
  }

  switch (diType) {
    case 'DS':
      return { answer: typeof normalizedAnswer === 'string' ? normalizedAnswer : String(normalizedAnswer || '') };
    case 'MSR':
      return { msrAnswers: Array.isArray(normalizedAnswer) ? normalizedAnswer : [] };
    case 'GI': {
      if (Array.isArray(normalizedAnswer)) {
        return { blank1: normalizedAnswer[0] || '', blank2: normalizedAnswer[1] || '' };
      }
      // Regular test format: { part1: "x", part2: "y" }
      if (normalizedAnswer && typeof normalizedAnswer === 'object') {
        return {
          blank1: normalizedAnswer.part1 || normalizedAnswer[0] || '',
          blank2: normalizedAnswer.part2 || normalizedAnswer[1] || '',
        };
      }
      return {};
    }
    case 'TA':
      return { taAnswers: normalizedAnswer as Record<number, 'true' | 'false'> };
    case 'TPA': {
      if (normalizedAnswer && typeof normalizedAnswer === 'object') {
        return {
          column1: normalizedAnswer.col1 || normalizedAnswer.column1 || '',
          column2: normalizedAnswer.col2 || normalizedAnswer.column2 || '',
        };
      }
      return {};
    }
    default:
      // Multiple choice or unknown type
      if (typeof normalizedAnswer === 'string') return { answer: normalizedAnswer };
      if (typeof normalizedAnswer === 'object' && normalizedAnswer !== null) {
        // Try common field names
        if ('answer' in normalizedAnswer) return { answer: String(normalizedAnswer.answer) };
        if ('answers' in normalizedAnswer) {
          // MSR-like from regular tests
          const answers = normalizedAnswer.answers;
          if (typeof answers === 'object' && answers !== null) {
            // { part1: "x", part2: "y" } → GI format
            if ('part1' in answers) return { blank1: answers.part1, blank2: answers.part2 };
          }
        }
      }
      return { answer: String(normalizedAnswer || '') };
  }
}

// Noop answer change handler for read-only mode
const noopAnswerChange = () => {};

export function QuestionResultCard({
  result,
  hasAnswersData = true,
  language = 'it',
  isStudentView = false,
  onReviewSave,
}: QuestionResultCardProps) {
  const questionData = typeof result.question.question_data === 'string'
    ? JSON.parse(result.question.question_data)
    : result.question.question_data;

  const category = getQuestionCategory(questionData);
  const unifiedAnswer = toRendererAnswer(result.studentAnswer, questionData);

  // Border color based on correctness
  const borderClass = !hasAnswersData
    ? 'border-gray-100'
    : !result.hasAnswer
      ? 'border-purple-200'
      : result.isCorrect
        ? 'border-green-200'
        : 'border-red-200';

  // Header bg color
  const headerClass = !hasAnswersData
    ? 'bg-gray-50 border-gray-100'
    : !result.hasAnswer
      ? 'bg-purple-50 border-purple-100'
      : result.isCorrect
        ? 'bg-green-50 border-green-100'
        : 'bg-red-50 border-red-100';

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${borderClass}`}>
      {/* Question Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${headerClass}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-lg font-bold text-gray-800">Q{result.order}</span>

          {/* Correctness icon */}
          {hasAnswersData && result.hasAnswer && (
            <FontAwesomeIcon
              icon={result.isCorrect ? faCheckCircle : faTimesCircle}
              className={result.isCorrect ? 'text-green-600' : 'text-red-600'}
            />
          )}

          {/* Not answered indicator */}
          {hasAnswersData && !result.hasAnswer && (
            <FontAwesomeIcon icon={faEyeSlash} className="text-purple-600" title="Not Answered" />
          )}

          {/* Flagged indicator (regular tests) */}
          {result.isFlagged && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              <FontAwesomeIcon icon={faFlag} /> Flagged
            </span>
          )}

          {/* Bookmark badge (GMAT) */}
          {result.isBookmarked && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faBookmark} className="text-xs" />
              Bookmarked
            </span>
          )}

          {/* Section badge */}
          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
            {getSectionFullName(result.question.section)}
          </span>

          {/* Difficulty badge */}
          {result.question.difficulty && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              result.question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              result.question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {result.question.difficulty}
            </span>
          )}

          {/* Materia badge (regular tests) */}
          {result.question.materia && (
            <span className="text-sm text-gray-700 font-medium">
              {result.question.materia}
            </span>
          )}

          {/* Category badge */}
          {category && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faTag} className="text-xs" />
              {category}
            </span>
          )}
        </div>

        {/* Time spent */}
        {result.timeSpentSeconds != null && result.timeSpentSeconds > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            <FontAwesomeIcon icon={faClock} className="text-xs" />
            <span className="font-medium">
              {result.timeSpentSeconds >= 60
                ? `${Math.floor(result.timeSpentSeconds / 60)}m ${result.timeSpentSeconds % 60}s`
                : `${result.timeSpentSeconds}s`
              }
            </span>
          </div>
        )}
      </div>

      {/* Question Content via QuestionRenderer */}
      <div className="p-6">
        <QuestionRenderer
          question={{
            id: result.question.id,
            question_type: result.question.question_type,
            question_data: questionData,
            answers: typeof result.question.answers === 'string'
              ? JSON.parse(result.question.answers)
              : result.question.answers,
          }}
          currentAnswer={unifiedAnswer}
          onAnswerChange={noopAnswerChange}
          language={language}
          showResults={true}
          readOnly={true}
        />
      </div>

      {/* Tutor Review Section */}
      {!isStudentView && onReviewSave && (
        <TutorReviewSection
          questionId={result.question.id}
          initialReview={result.reviewState || result.question.Questions_toReview || null}
          onSave={onReviewSave}
        />
      )}
    </div>
  );
}

/** Tutor review footer with checkbox + debounced notes textarea */
function TutorReviewSection({
  questionId,
  initialReview,
  onSave,
}: {
  questionId: string;
  initialReview: { needs_review: boolean; notes: string } | null;
  onSave: (questionId: string, needsReview: boolean, notes: string) => void;
}) {
  const [needsReview, setNeedsReview] = useState(initialReview?.needs_review ?? false);
  const [notes, setNotes] = useState(initialReview?.notes ?? '');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setNeedsReview(checked);
    onSave(questionId, checked, notes);
  }, [questionId, notes, onSave]);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);

    // Debounce auto-save
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onSave(questionId, needsReview, value);
    }, 1000);
  }, [questionId, needsReview, onSave]);

  return (
    <div className="px-6 pb-6 pt-2 border-t border-gray-200 bg-orange-50">
      <div className="flex items-center gap-3 mb-3">
        <input
          type="checkbox"
          id={`review-${questionId}`}
          checked={needsReview}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          className="w-5 h-5 text-orange-600 border-orange-300 rounded focus:ring-orange-500 cursor-pointer"
        />
        <label htmlFor={`review-${questionId}`} className="text-sm font-semibold text-orange-700 cursor-pointer">
          Flag this question for review (internal)
        </label>
      </div>

      {needsReview && (
        <textarea
          placeholder="Add notes about what needs to be fixed in this question..."
          className="w-full p-3 border-2 border-orange-300 rounded-lg focus:border-orange-500 outline-none resize-none bg-white"
          rows={2}
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
        />
      )}
    </div>
  );
}
