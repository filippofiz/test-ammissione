/**
 * useReviewMode Hook
 *
 * Manages GMAT-style review & edit mode for TakeTestPage.
 *
 * Owns:
 * - Bookmark toggling
 * - Review screen visibility
 * - Answer change counter (shared with useAnswerManagement via returned setters)
 * - Original answers snapshot (for change tracking)
 * - Review mode flag + refs (for stale closure avoidance in timer callbacks)
 * - enterReviewMode / goToQuestionFromReview / returnToReviewScreen / completeReview
 */

import { useState, useRef, useCallback } from 'react';

// Generic answer type — mirrors TakeTestPage's StudentAnswer without importing from the page.
export interface ReviewModeAnswer {
  questionId: string;
  answer: string | null;
  timeSpent: number;
  flagged: boolean;
  msrAnswers?: string[];
  blank1?: string;
  blank2?: string;
  taAnswers?: Record<number, 'true' | 'false'>;
  column1?: string;
  column2?: string;
}

export interface ReviewModeQuestion {
  id: string;
}

// ─── Hook Options ────────────────────────────────────────────────────────────

export interface UseReviewModeOptions {
  timeRemaining: number | null;
  answers: Record<string, ReviewModeAnswer>;
  currentSectionQuestions: ReviewModeQuestion[];
  setCurrentQuestionIndex: (index: number) => void;
  /** Called after review is completed to proceed with section completion */
  onCompleteSection: () => void;
}

// ─── Hook Return ─────────────────────────────────────────────────────────────

export interface UseReviewModeReturn {
  // State
  bookmarkedQuestions: Set<string>;
  showReviewScreen: boolean;
  answerChangesUsed: number;
  isInReviewMode: boolean;

  // Setters (needed by useAnswerManagement and parent)
  setAnswerChangesUsed: React.Dispatch<React.SetStateAction<number>>;
  setBookmarkedQuestions: React.Dispatch<React.SetStateAction<Set<string>>>;
  setShowReviewScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInReviewMode: React.Dispatch<React.SetStateAction<boolean>>;

  // Refs (for stale closure avoidance in timer callbacks)
  isInReviewModeRef: React.MutableRefObject<boolean>;
  showReviewScreenRef: React.MutableRefObject<boolean>;

  // Functions
  toggleBookmark: (questionId: string) => void;
  enterReviewMode: () => void;
  goToQuestionFromReview: (questionIndex: number) => void;
  returnToReviewScreen: () => void;
  completeReview: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useReviewMode({
  timeRemaining,
  answers,
  currentSectionQuestions,
  setCurrentQuestionIndex,
  onCompleteSection,
}: UseReviewModeOptions): UseReviewModeReturn {
  // ─── State ───────────────────────────────────────────────────────────────────
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [answerChangesUsed, setAnswerChangesUsed] = useState<number>(0);
  const [_originalAnswers, setOriginalAnswers] = useState<Record<string, ReviewModeAnswer>>({});
  const [isInReviewMode, setIsInReviewMode] = useState(false);

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const isInReviewModeRef = useRef(false);
  const showReviewScreenRef = useRef(false);

  // ─── toggleBookmark ──────────────────────────────────────────────────────────

  const toggleBookmark = useCallback((questionId: string) => {
    if (timeRemaining !== null && timeRemaining <= 0) return;

    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, [timeRemaining]);

  // ─── enterReviewMode ────────────────────────────────────────────────────────

  const enterReviewMode = useCallback(() => {
    const originals: Record<string, ReviewModeAnswer> = {};
    currentSectionQuestions.forEach(q => {
      if (answers[q.id]) {
        originals[q.id] = { ...answers[q.id] };
      }
    });
    setOriginalAnswers(originals);
    setAnswerChangesUsed(0);
    setIsInReviewMode(true);
    isInReviewModeRef.current = true;
    setShowReviewScreen(true);
    showReviewScreenRef.current = true;
  }, [currentSectionQuestions, answers]);

  // ─── goToQuestionFromReview ──────────────────────────────────────────────────

  const goToQuestionFromReview = useCallback((questionIndex: number) => {
    if (timeRemaining !== null && timeRemaining <= 0) return;

    setShowReviewScreen(false);
    showReviewScreenRef.current = false;
    setCurrentQuestionIndex(questionIndex);
  }, [timeRemaining, setCurrentQuestionIndex]);

  // ─── returnToReviewScreen ────────────────────────────────────────────────────

  const returnToReviewScreen = useCallback(() => {
    if (timeRemaining !== null && timeRemaining <= 0) return;

    setShowReviewScreen(true);
    showReviewScreenRef.current = true;
  }, [timeRemaining]);

  // ─── completeReview ──────────────────────────────────────────────────────────

  const completeReview = useCallback(() => {
    if (timeRemaining !== null && timeRemaining <= 0) return;

    setShowReviewScreen(false);
    showReviewScreenRef.current = false;
    setIsInReviewMode(false);
    isInReviewModeRef.current = false;
    setOriginalAnswers({});
    setAnswerChangesUsed(0);

    // Clear bookmarks for this section
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      currentSectionQuestions.forEach(q => newSet.delete(q.id));
      return newSet;
    });

    // Proceed with actual section completion
    onCompleteSection();
  }, [timeRemaining, currentSectionQuestions, onCompleteSection]);

  // ─── Return ──────────────────────────────────────────────────────────────────

  return {
    // State
    bookmarkedQuestions,
    showReviewScreen,
    answerChangesUsed,
    isInReviewMode,

    // Setters
    setAnswerChangesUsed,
    setBookmarkedQuestions,
    setShowReviewScreen,
    setIsInReviewMode,

    // Refs
    isInReviewModeRef,
    showReviewScreenRef,

    // Functions
    toggleBookmark,
    enterReviewMode,
    goToQuestionFromReview,
    returnToReviewScreen,
    completeReview,
  };
}
