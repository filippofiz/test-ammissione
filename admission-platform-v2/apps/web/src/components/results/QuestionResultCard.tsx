/**
 * QuestionResultCard Component
 *
 * Displays a single question result with:
 * - Header: question number, correctness icon, badges, time
 * - Body: question content via QuestionRenderer (readOnly + showResults)
 * - Footer: tutor review section (regular tests, tutor only)
 */

import { useState, useRef, useCallback, useMemo } from 'react';
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
import { type UnifiedQuestionResult, getSectionFullName, getQuestionCategory, type ComparisonIndicator } from './types';
import { NoAnswerCards, STUDENT_NAME_COLORS } from '../questions/ComparisonChips';
import type { ComparisonSlots, NoAnswerEntry } from '../questions/ComparisonChips';

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
  /** Comparison indicators for additional students (tutor view, multi-student comparison) */
  comparisonIndicators?: ComparisonIndicator[];
  /** Name of the primary student — shown as a chip alongside comparison students */
  primaryStudentName?: string | null;
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

/**
 * Build a ComparisonSlots map from comparison indicators for a given question.
 * Each indicator's studentAnswer is mapped to the correct slot key(s) based on
 * the question's di_type.
 *
 * Primary student uses colorIndex 4 (blue); comparison students use 0-3.
 */
function buildComparisonSlots(
  indicators: ComparisonIndicator[],
  questionData: any,
  primaryStudentName: string | null | undefined,
  primaryStudentAnswer: any,
  primaryHasAnswer: boolean,
  primaryIsCorrect: boolean,
  primaryTimeSpentSeconds: number | undefined,
): { slots: ComparisonSlots; noAnswerEntries: NoAnswerEntry[] } {
  const slots: ComparisonSlots = {};
  const noAnswerEntries: NoAnswerEntry[] = [];

  const addToSlot = (
    key: string,
    studentName: string | null,
    colorIndex: number,
    isCorrect?: boolean,
    timeSpentSeconds?: number,
  ) => {
    if (!slots[key]) slots[key] = [];
    slots[key].push({ studentName, colorIndex, isCorrect, timeSpentSeconds });
  };

  const diType = questionData?.di_type as string | undefined;

  // Build unified list: primary student first (colorIndex 4 = blue), then comparison students (0-3)
  const allIndicators: Array<{
    ind: ComparisonIndicator;
    colorIndex: number;
    timeSpentSeconds?: number;
  }> = [];

  if (primaryHasAnswer && primaryStudentAnswer !== null && primaryStudentAnswer !== undefined) {
    allIndicators.push({
      ind: {
        studentName: primaryStudentName ?? null,
        isCorrect: primaryIsCorrect,
        hasAnswer: primaryHasAnswer,
        studentAnswer: primaryStudentAnswer,
      },
      colorIndex: 4,
      timeSpentSeconds: primaryTimeSpentSeconds,
    });
  } else {
    // Primary student didn't answer — add to no-answer list
    noAnswerEntries.push({
      studentName: primaryStudentName ?? null,
      colorIndex: 4,
      timeSpentSeconds: primaryTimeSpentSeconds,
      // Primary always "saw" the question (it's their own result page)
      state: 'skipped',
    });
  }

  indicators.forEach((ind, i) => {
    allIndicators.push({ ind, colorIndex: i, timeSpentSeconds: ind.timeSpentSeconds });
  });

  allIndicators.forEach(({ ind, colorIndex, timeSpentSeconds }) => {
    if (!ind.hasAnswer || ind.studentAnswer === null || ind.studentAnswer === undefined) {
      // Unreached = never got to this question (no time at all); skipped = saw it but didn't answer
      const state: 'skipped' | 'unreached' = timeSpentSeconds === undefined ? 'unreached' : 'skipped';
      noAnswerEntries.push({
        studentName: ind.studentName,
        colorIndex,
        timeSpentSeconds,
        state,
      });
      return;
    }

    let val = ind.studentAnswer;
    if (!diType && typeof val === 'object' && val !== null && 'answer' in val) {
      val = val.answer;
    }

    switch (diType) {
      case 'DS': {
        const key = typeof val === 'string' ? val.toUpperCase() : String(val).toUpperCase();
        addToSlot(key, ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
        break;
      }
      case 'MSR': {
        const arr = Array.isArray(val) ? val : [];
        arr.forEach((answer: any, qi: number) => {
          if (answer !== null && answer !== undefined && answer !== '') {
            addToSlot(`q${qi}_${String(answer)}`, ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
          }
        });
        break;
      }
      case 'GI': {
        let b1: string | undefined;
        let b2: string | undefined;
        if (Array.isArray(val)) {
          b1 = val[0]; b2 = val[1];
        } else if (typeof val === 'object' && val !== null) {
          b1 = val.part1 ?? val[0];
          b2 = val.part2 ?? val[1];
        }
        if (b1) addToSlot('blank1', ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
        if (b2) addToSlot('blank2', ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
        break;
      }
      case 'TA': {
        const answers = val?.answers ?? val;
        if (typeof answers === 'object' && answers !== null) {
          Object.entries(answers).forEach(([k, v]) => {
            const idx = typeof k === 'string' && k.startsWith('stmt')
              ? parseInt(k.replace('stmt', ''), 10)
              : parseInt(String(k), 10);
            const boolVal = String(v) === 'true' || String(v) === 'col1' ? 'true' : 'false';
            addToSlot(`stmt${idx}_${boolVal}`, ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
          });
        }
        break;
      }
      case 'TPA': {
        const tpaVal = val?.answers ?? val;
        if (typeof tpaVal === 'object' && tpaVal !== null) {
          const c1 = tpaVal.col1 ?? tpaVal.column1 ?? tpaVal.part1;
          const c2 = tpaVal.col2 ?? tpaVal.column2 ?? tpaVal.part2;
          if (c1) addToSlot(`col1_${c1}`, ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
          if (c2) addToSlot(`col2_${c2}`, ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
        }
        break;
      }
      default: {
        let key = typeof val === 'string' ? val : String(val);
        if (typeof val === 'object' && val !== null && 'answer' in val) {
          key = String(val.answer);
        }
        addToSlot(key.toLowerCase(), ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
        addToSlot(key.toUpperCase(), ind.studentName, colorIndex, ind.isCorrect, timeSpentSeconds);
        break;
      }
    }
  });

  return { slots, noAnswerEntries };
}

export function QuestionResultCard({
  result,
  hasAnswersData = true,
  language = 'it',
  isStudentView = false,
  onReviewSave,
  comparisonIndicators,
  primaryStudentName,
}: QuestionResultCardProps) {
  const questionData = typeof result.question.question_data === 'string'
    ? JSON.parse(result.question.question_data)
    : result.question.question_data;

  const category = getQuestionCategory(questionData);
  const unifiedAnswer = toRendererAnswer(result.studentAnswer, questionData);

  const { comparisonSlots, noAnswerEntries } = useMemo(() => {
    // Only build slots when there are comparison students
    if (!comparisonIndicators || comparisonIndicators.length === 0) {
      return { comparisonSlots: undefined as ComparisonSlots | undefined, noAnswerEntries: [] as NoAnswerEntry[] };
    }
    const { slots, noAnswerEntries } = buildComparisonSlots(
      comparisonIndicators,
      questionData,
      primaryStudentName,
      result.studentAnswer,
      result.hasAnswer,
      result.isCorrect,
      result.timeSpentSeconds,
    );
    return { comparisonSlots: slots, noAnswerEntries };
  }, [comparisonIndicators, questionData, primaryStudentName, result.studentAnswer, result.hasAnswer, result.isCorrect, result.timeSpentSeconds]);

  // In comparison mode, neutralize header — correctness is conveyed by the answer cards
  const comparisonMode = !!comparisonSlots;

  // Border color based on correctness (neutral in comparison mode)
  const borderClass = comparisonMode
    ? 'border-gray-200'
    : !hasAnswersData
      ? 'border-gray-100'
      : !result.hasAnswer
        ? 'border-purple-200'
        : result.isCorrect
          ? 'border-green-200'
          : 'border-red-200';

  // Header bg color (neutral in comparison mode)
  const headerClass = comparisonMode
    ? 'bg-gray-50 border-gray-100'
    : !hasAnswersData
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

          {/* Correctness icon — hidden in comparison mode (no single student owns this header) */}
          {!comparisonMode && hasAnswersData && result.hasAnswer && (
            <FontAwesomeIcon
              icon={result.isCorrect ? faCheckCircle : faTimesCircle}
              className={result.isCorrect ? 'text-green-600' : 'text-red-600'}
            />
          )}

          {/* Not answered indicator — hidden in comparison mode */}
          {!comparisonMode && hasAnswersData && !result.hasAnswer && (
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

        {comparisonMode ? (
          /* In comparison mode: show skipped/unreached student cards on the right of the header */
          noAnswerEntries.length > 0 ? (
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {noAnswerEntries.map((entry, i) => {
                const colorIdx = entry.colorIndex === 4 ? 4 : entry.colorIndex % 4;
                const name = entry.studentName ?? 'Student';
                const isUnreached = entry.state === 'unreached';
                return (
                  <div
                    key={i}
                    className="inline-flex flex-col items-center justify-center gap-0.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 select-none opacity-75"
                  >
                    <span className={`text-xs font-bold leading-tight ${STUDENT_NAME_COLORS[colorIdx]}`}>{name}</span>
                    <span className="text-[10px] text-gray-400 italic leading-none">
                      {isUnreached ? 'not reached' : 'skipped'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null
        ) : (
          <div className="flex items-center gap-2 shrink-0">
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
          comparisonSlots={comparisonSlots}
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
