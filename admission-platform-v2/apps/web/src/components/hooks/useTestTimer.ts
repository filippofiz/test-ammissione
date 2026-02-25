/**
 * useTestTimer Hook
 *
 * A reusable timer hook for test-taking functionality.
 * Handles countdown, pause/resume, and time-up callbacks.
 *
 * Features:
 * - Countdown timer with seconds precision
 * - Pause and resume support
 * - Time-up callback with automatic cleanup
 * - Special needs support (30% extra time)
 * - Safe cleanup on unmount
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTestTimerOptions {
  /** Initial time in seconds (or null for no timer) */
  initialSeconds: number | null;
  /** Whether the timer is currently active/running */
  isActive: boolean;
  /** Callback when time reaches zero */
  onTimeUp?: () => void;
  /** Apply 30% extra time for special needs */
  applySpecialNeeds?: boolean;
  /** Whether timer is paused */
  isPaused?: boolean;
}

export interface UseTestTimerReturn {
  /** Current time remaining in seconds (null if no timer) */
  timeRemaining: number | null;
  /** Formatted time string (e.g., "5:30" or "1:05:30") */
  formattedTime: string;
  /** Whether time is in warning zone (< 5 minutes) */
  isWarning: boolean;
  /** Whether time is in danger zone (< 1 minute) */
  isDanger: boolean;
  /** Whether time has expired */
  isExpired: boolean;
  /** Manually set the time remaining */
  setTimeRemaining: (seconds: number | null) => void;
  /** Reset timer to initial value */
  resetTimer: (newInitialSeconds?: number) => void;
}

/**
 * Format seconds into a human-readable time string
 * @param seconds - Time in seconds
 * @returns Formatted string like "5:30" or "1:05:30"
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate initial time with optional special needs adjustment
 */
function calculateInitialTime(seconds: number | null, applySpecialNeeds: boolean): number | null {
  if (seconds === null) return null;
  if (applySpecialNeeds) {
    return Math.round(seconds * 1.3); // 30% extra time
  }
  return seconds;
}

export function useTestTimer({
  initialSeconds,
  isActive,
  onTimeUp,
  applySpecialNeeds = false,
  isPaused = false,
}: UseTestTimerOptions): UseTestTimerReturn {
  // Calculate initial time with special needs adjustment
  const adjustedInitialSeconds = calculateInitialTime(initialSeconds, applySpecialNeeds);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(adjustedInitialSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp ref updated to avoid stale closures
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Track component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Update time when initialSeconds changes
  useEffect(() => {
    const newTime = calculateInitialTime(initialSeconds, applySpecialNeeds);
    setTimeRemaining(newTime);
  }, [initialSeconds, applySpecialNeeds]);

  // Timer countdown effect
  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Don't start timer if not active, paused, or no time set
    if (!isActive || isPaused || timeRemaining === null) {
      return;
    }

    // Create the timer interval
    timerRef.current = setInterval(() => {
      // Check if still mounted before updating state
      if (!isMountedRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      setTimeRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 0) return 0; // Already at 0

        if (prev === 1) {
          // Transitioning to 0 - call onTimeUp once
          // Use setTimeout to avoid calling during state update
          setTimeout(() => {
            if (isMountedRef.current && onTimeUpRef.current) {
              onTimeUpRef.current();
            }
          }, 0);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused]); // Note: timeRemaining is NOT in deps to avoid re-creating interval

  // Reset timer function
  const resetTimer = useCallback((newInitialSeconds?: number) => {
    const seconds = newInitialSeconds !== undefined ? newInitialSeconds : initialSeconds;
    const newTime = calculateInitialTime(seconds, applySpecialNeeds);
    setTimeRemaining(newTime);
  }, [initialSeconds, applySpecialNeeds]);

  // Computed values
  const isWarning = timeRemaining !== null && timeRemaining > 0 && timeRemaining < 300; // < 5 minutes
  const isDanger = timeRemaining !== null && timeRemaining > 0 && timeRemaining < 60; // < 1 minute
  const isExpired = timeRemaining !== null && timeRemaining <= 0;
  const formattedTime = timeRemaining !== null ? formatTime(timeRemaining) : '--:--';

  return {
    timeRemaining,
    formattedTime,
    isWarning,
    isDanger,
    isExpired,
    setTimeRemaining,
    resetTimer,
  };
}
