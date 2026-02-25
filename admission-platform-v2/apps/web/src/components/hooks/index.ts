/**
 * Shared logic hooks
 *
 * This folder contains reusable React hooks for test-taking functionality
 * used by both TakeTestPage and GMATTrainingTestPage.
 *
 * Hooks:
 * - useTestTimer: Timer countdown logic with pause/resume support
 * - useTestProgress: LocalStorage save/restore with crash recovery
 * - useAnswerManagement: Answer state, saving, auto-save, network monitoring
 * - useReviewMode: GMAT-style review & edit mode (bookmarks, change tracking)
 * - usePauseManagement: Pause screens, countdowns, section transitions
 * - useTestProctoring: Fullscreen enforcement, exit warnings, multiple screen detection
 */

export { useTestTimer, formatTime } from './useTestTimer';
export type { UseTestTimerOptions, UseTestTimerReturn } from './useTestTimer';

export {
  useTestProgress,
  useAutoSaveProgress,
  createProgressSnapshot,
} from './useTestProgress';
export type {
  UseTestProgressOptions,
  UseTestProgressReturn,
  SavedTestProgress,
  StoredAnswer,
} from './useTestProgress';

export { useAnswerManagement } from './useAnswerManagement';
export type { UseAnswerManagementOptions } from './useAnswerManagement';

export { useReviewMode } from './useReviewMode';
export type { UseReviewModeOptions, UseReviewModeReturn } from './useReviewMode';

export { usePauseManagement } from './usePauseManagement';
export type { UsePauseManagementOptions, UsePauseManagementReturn } from './usePauseManagement';

export { useTestProctoring } from './useTestProctoring';
