/**
 * useTestProgress Hook
 *
 * Manages test progress persistence to localStorage for crash recovery.
 * Automatically saves progress on answer changes and provides restore functionality.
 *
 * Features:
 * - Auto-save progress to localStorage on each answer
 * - 24-hour expiry for saved progress
 * - Serialize/deserialize Map and Set for JSON storage
 * - Resume detection on page load
 * - Clear progress on successful submission
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Answer structure stored in progress
 */
export interface StoredAnswer {
  questionId: string;
  answer: string | string[] | Record<string, unknown>;
  timeSpent: number;
}

/**
 * Saved progress structure for localStorage
 */
export interface SavedTestProgress {
  /** Unique identifier for the test session (e.g., templateId, assignmentId) */
  sessionId: string;
  /** Student/user ID */
  userId: string;
  /** Current question index */
  currentIndex: number;
  /** Current section index (for multi-section tests) */
  currentSectionIndex?: number;
  /** Answers as array of [questionId, answer] for JSON serialization */
  answers: Array<[string, StoredAnswer]>;
  /** Bookmarked question IDs */
  bookmarkedQuestions: string[];
  /** Time remaining in seconds (null if no timer) */
  timeRemaining: number | null;
  /** Whether the test has been started */
  testStarted: boolean;
  /** Whether currently in review phase */
  inReviewPhase: boolean;
  /** ISO timestamp when progress was saved */
  savedAt: string;
  /** Optional: Test type identifier */
  testType?: string;
  /** Optional: Additional custom data */
  customData?: Record<string, unknown>;
}

export interface UseTestProgressOptions {
  /** Unique session identifier (e.g., templateId, assignmentId) */
  sessionId: string;
  /** User ID */
  userId: string;
  /** Storage key prefix (default: 'test_progress_') */
  storageKeyPrefix?: string;
  /** Max age in milliseconds before progress expires (default: 24 hours) */
  maxAge?: number;
  /** Whether to disable auto-save (e.g., for preview mode) */
  disabled?: boolean;
  /** Test type for identification */
  testType?: string;
}

export interface UseTestProgressReturn {
  /** Check if there's saved progress to resume */
  hasSavedProgress: boolean;
  /** The saved progress data (null if none) */
  savedProgress: SavedTestProgress | null;
  /** Save current progress */
  saveProgress: (data: Omit<SavedTestProgress, 'sessionId' | 'userId' | 'savedAt'>) => void;
  /** Load saved progress (called automatically on init) */
  loadProgress: () => SavedTestProgress | null;
  /** Clear saved progress */
  clearProgress: () => void;
  /** Convert answers Map to array for storage */
  serializeAnswers: (answers: Map<string, StoredAnswer>) => Array<[string, StoredAnswer]>;
  /** Convert answers array back to Map */
  deserializeAnswers: (answers: Array<[string, StoredAnswer]>) => Map<string, StoredAnswer>;
  /** Convert bookmarks Set to array for storage */
  serializeBookmarks: (bookmarks: Set<string>) => string[];
  /** Convert bookmarks array back to Set */
  deserializeBookmarks: (bookmarks: string[]) => Set<string>;
}

/**
 * Generate storage key from session and user IDs
 */
function getStorageKey(prefix: string, sessionId: string, userId: string): string {
  return `${prefix}${sessionId}_${userId}`;
}

/**
 * Hook for managing test progress persistence
 */
export function useTestProgress({
  sessionId,
  userId,
  storageKeyPrefix = 'test_progress_',
  maxAge = 24 * 60 * 60 * 1000, // 24 hours default
  disabled = false,
  testType,
}: UseTestProgressOptions): UseTestProgressReturn {
  const [savedProgress, setSavedProgress] = useState<SavedTestProgress | null>(null);
  const initialLoadDone = useRef(false);

  // Generate storage key
  const storageKey = getStorageKey(storageKeyPrefix, sessionId, userId);

  /**
   * Load progress from localStorage
   */
  const loadProgress = useCallback((): SavedTestProgress | null => {
    if (disabled || !sessionId || !userId) return null;

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const progress = JSON.parse(saved) as SavedTestProgress;

      // Validate the saved progress is not too old
      const savedTime = new Date(progress.savedAt).getTime();
      const now = Date.now();

      if (now - savedTime > maxAge) {
        // Progress expired, clear it
        localStorage.removeItem(storageKey);
        return null;
      }

      // Validate session and user match
      if (progress.sessionId !== sessionId || progress.userId !== userId) {
        return null;
      }

      return progress;
    } catch (err) {
      console.error('[useTestProgress] Failed to load progress:', err);
      return null;
    }
  }, [storageKey, sessionId, userId, maxAge, disabled]);

  /**
   * Save progress to localStorage
   */
  const saveProgress = useCallback(
    (data: Omit<SavedTestProgress, 'sessionId' | 'userId' | 'savedAt'>) => {
      if (disabled || !sessionId || !userId) return;

      try {
        const progress: SavedTestProgress = {
          ...data,
          sessionId,
          userId,
          testType,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(progress));
      } catch (err) {
        console.error('[useTestProgress] Failed to save progress:', err);
      }
    },
    [storageKey, sessionId, userId, testType, disabled]
  );

  /**
   * Clear progress from localStorage
   */
  const clearProgress = useCallback(() => {
    if (!sessionId || !userId) return;

    try {
      localStorage.removeItem(storageKey);
      setSavedProgress(null);
    } catch (err) {
      console.error('[useTestProgress] Failed to clear progress:', err);
    }
  }, [storageKey, sessionId, userId]);

  /**
   * Serialize answers Map to array for JSON storage
   */
  const serializeAnswers = useCallback(
    (answers: Map<string, StoredAnswer>): Array<[string, StoredAnswer]> => {
      return Array.from(answers.entries());
    },
    []
  );

  /**
   * Deserialize answers array back to Map
   */
  const deserializeAnswers = useCallback(
    (answers: Array<[string, StoredAnswer]>): Map<string, StoredAnswer> => {
      return new Map(answers);
    },
    []
  );

  /**
   * Serialize bookmarks Set to array for JSON storage
   */
  const serializeBookmarks = useCallback((bookmarks: Set<string>): string[] => {
    return Array.from(bookmarks);
  }, []);

  /**
   * Deserialize bookmarks array back to Set
   */
  const deserializeBookmarks = useCallback((bookmarks: string[]): Set<string> => {
    return new Set(bookmarks || []);
  }, []);

  // Load progress on initial mount
  useEffect(() => {
    if (!initialLoadDone.current && sessionId && userId) {
      const progress = loadProgress();
      setSavedProgress(progress);
      initialLoadDone.current = true;
    }
  }, [sessionId, userId, loadProgress]);

  return {
    hasSavedProgress: savedProgress !== null && savedProgress.testStarted,
    savedProgress,
    saveProgress,
    loadProgress,
    clearProgress,
    serializeAnswers,
    deserializeAnswers,
    serializeBookmarks,
    deserializeBookmarks,
  };
}

/**
 * Helper function to create a progress snapshot for saving
 */
export function createProgressSnapshot(
  currentIndex: number,
  answers: Map<string, StoredAnswer>,
  bookmarkedQuestions: Set<string>,
  timeRemaining: number | null,
  testStarted: boolean,
  inReviewPhase: boolean,
  currentSectionIndex?: number,
  customData?: Record<string, unknown>
): Omit<SavedTestProgress, 'sessionId' | 'userId' | 'savedAt'> {
  return {
    currentIndex,
    currentSectionIndex,
    answers: Array.from(answers.entries()),
    bookmarkedQuestions: Array.from(bookmarkedQuestions),
    timeRemaining,
    testStarted,
    inReviewPhase,
    customData,
  };
}

/**
 * Hook for auto-saving progress on state changes
 * Use this for automatic saves when answers/bookmarks change
 */
export function useAutoSaveProgress(
  progress: UseTestProgressReturn,
  deps: {
    currentIndex: number;
    answers: Map<string, StoredAnswer>;
    bookmarkedQuestions: Set<string>;
    timeRemaining: number | null;
    testStarted: boolean;
    inReviewPhase: boolean;
    currentSectionIndex?: number;
  },
  enabled: boolean = true
) {
  const lastSaveRef = useRef<string>('');

  useEffect(() => {
    if (!enabled || !deps.testStarted) return;

    // Create a hash of current state to avoid unnecessary saves
    const stateHash = JSON.stringify({
      currentIndex: deps.currentIndex,
      answersSize: deps.answers.size,
      bookmarksSize: deps.bookmarkedQuestions.size,
      timeRemaining: deps.timeRemaining,
      inReviewPhase: deps.inReviewPhase,
    });

    // Only save if state actually changed
    if (stateHash !== lastSaveRef.current) {
      lastSaveRef.current = stateHash;

      const snapshot = createProgressSnapshot(
        deps.currentIndex,
        deps.answers,
        deps.bookmarkedQuestions,
        deps.timeRemaining,
        deps.testStarted,
        deps.inReviewPhase,
        deps.currentSectionIndex
      );

      progress.saveProgress(snapshot);
    }
  }, [
    deps.currentIndex,
    deps.answers,
    deps.bookmarkedQuestions,
    deps.timeRemaining,
    deps.testStarted,
    deps.inReviewPhase,
    deps.currentSectionIndex,
    enabled,
    progress,
  ]);
}
