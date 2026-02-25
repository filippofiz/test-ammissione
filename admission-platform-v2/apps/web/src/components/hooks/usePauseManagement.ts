/**
 * usePauseManagement Hook
 *
 * Manages pause-related state, countdowns, and actions for TakeTestPage.
 *
 * Owns:
 * - Pause screen visibility (mandatory & user-choice)
 * - Pause time remaining countdown
 * - Pauses used counter & events log
 * - Pause choice countdown (auto-skip after 5s)
 * - Section transition screen + countdown
 * - savePauseEventToDatabase
 * - handleTakePause / handleSkipPause / handleSectionTransitionComplete
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PauseEvent {
  timestamp: string;
  section: string;
  action: 'pause_taken' | 'pause_skipped' | 'pause_auto_skipped';
}

interface AttemptRecord {
  attempt_number: number;
  pause_events?: PauseEvent[];
  pauses_used?: number;
  pauses_available?: number;
  [key: string]: unknown;
}

// Minimal supabase client interface
interface SupabaseClient {
  from: (table: string) => any;
}

// ─── Hook Options ────────────────────────────────────────────────────────────

/** Minimal config shape — any object with at least these fields is accepted */
interface PauseConfig {
  pause_mode?: string;
  pause_sections?: string[] | null;
  pause_duration_minutes?: number;
  max_pauses?: number;
}

export interface UsePauseManagementOptions {
  /** Only pause-related config fields are used by this hook */
  config: PauseConfig | null;
  currentSection: string;
  currentSectionIndexRef: React.MutableRefObject<number>;
  assignmentId: string | undefined;
  currentAttempt: number;
  supabase: SupabaseClient;
  /** Called to advance to the next section after pause/transition completes */
  moveToNextSection: (sectionIndexOverride: number) => void;
}

// ─── Hook Return ─────────────────────────────────────────────────────────────

export interface UsePauseManagementReturn {
  // Pause screen state
  showPauseScreen: boolean;
  setShowPauseScreen: React.Dispatch<React.SetStateAction<boolean>>;
  showPauseChoiceScreen: boolean;
  setShowPauseChoiceScreen: React.Dispatch<React.SetStateAction<boolean>>;
  pauseTimeRemaining: number | null;
  setPauseTimeRemaining: React.Dispatch<React.SetStateAction<number | null>>;

  // Pause tracking
  pausesUsed: number;
  setPausesUsed: React.Dispatch<React.SetStateAction<number>>;
  pauseEvents: PauseEvent[];
  setPauseEvents: React.Dispatch<React.SetStateAction<PauseEvent[]>>;

  // Pause choice countdown
  pauseChoiceCountdown: number;
  setPauseChoiceCountdown: React.Dispatch<React.SetStateAction<number>>;
  setPauseChoiceTrigger: React.Dispatch<React.SetStateAction<number>>;

  // Section transition
  showSectionTransition: boolean;
  setShowSectionTransition: React.Dispatch<React.SetStateAction<boolean>>;
  sectionTransitionCountdown: number;

  // Transitioning guard (used by completeSection in TakeTestPage)
  isTransitioning: boolean;
  setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>;

  // Refs (needed by completeSection in TakeTestPage)
  pauseChoiceMadeRef: React.MutableRefObject<boolean>;
  showPauseChoiceRef: React.MutableRefObject<boolean>;
  pausesUsedRef: React.MutableRefObject<number>;

  // Actions
  handleTakePause: () => void;
  handleSkipPause: (isAutoSkip?: boolean) => void;
  handleSectionTransitionComplete: (isAuto?: boolean) => void;
  savePauseEventToDatabase: (action: 'pause_taken' | 'pause_skipped' | 'pause_auto_skipped') => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePauseManagement({
  config,
  currentSection,
  currentSectionIndexRef,
  assignmentId,
  currentAttempt,
  supabase,
  moveToNextSection,
}: UsePauseManagementOptions): UsePauseManagementReturn {
  // ─── State ───────────────────────────────────────────────────────────────────

  const [showPauseScreen, setShowPauseScreen] = useState(false);
  const [showPauseChoiceScreen, setShowPauseChoiceScreen] = useState(false);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState<number | null>(null);
  const [pausesUsed, setPausesUsed] = useState(0);
  const [pauseEvents, setPauseEvents] = useState<PauseEvent[]>([]);
  const [pauseChoiceCountdown, setPauseChoiceCountdown] = useState(5);
  const [pauseChoiceTrigger, setPauseChoiceTrigger] = useState(0);
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const [sectionTransitionCountdown, setSectionTransitionCountdown] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ─── Refs ────────────────────────────────────────────────────────────────────

  const pauseChoiceMadeRef = useRef(false);
  const showPauseChoiceRef = useRef(false);
  const pausesUsedRef = useRef(pausesUsed);

  // ─── Ref sync effects ────────────────────────────────────────────────────────

  useEffect(() => {
    pausesUsedRef.current = pausesUsed;
    if (pausesUsed > 0) {
      console.log('⏸️ [PAUSE] Pauses used updated', {
        pausesUsed,
        pausesRemaining: (config?.max_pauses || 0) - pausesUsed,
        maxPauses: config?.max_pauses
      });
    }
  }, [pausesUsed, config?.max_pauses]);

  // ─── Pause timer countdown ─────────────────────────────────────────────────

  useEffect(() => {
    if (pauseTimeRemaining !== null && pauseTimeRemaining > 0) {
      if (pauseTimeRemaining % 30 === 0) {
        console.log('⏸️ [PAUSE] Pause timer countdown', {
          remainingSeconds: pauseTimeRemaining,
          remainingMinutes: Math.floor(pauseTimeRemaining / 60),
          remainingFormatted: `${Math.floor(pauseTimeRemaining / 60)}:${(pauseTimeRemaining % 60).toString().padStart(2, '0')}`
        });
      }

      const interval = setInterval(() => {
        setPauseTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [pauseTimeRemaining]);

  // ─── Pause choice countdown reset ──────────────────────────────────────────

  useEffect(() => {
    if (showPauseChoiceScreen) {
      setPauseChoiceCountdown(5);
      pauseChoiceMadeRef.current = false;
    }
  }, [showPauseChoiceScreen]);

  // ─── Pause choice countdown (auto-continue after 5 seconds) ────────────────

  useEffect(() => {
    try {
      const isPauseChoiceVisible = showPauseChoiceScreen || showPauseChoiceRef.current;
      if (isPauseChoiceVisible && pauseChoiceCountdown > 0) {
        console.log('⏸️ [PAUSE] Choice countdown', {
          countdown: pauseChoiceCountdown,
          isPauseChoiceVisible,
          showPauseChoiceScreen,
          pausesUsed,
          pausesRemaining: (config?.max_pauses || 0) - pausesUsed
        });
        const timer = setTimeout(() => {
          setPauseChoiceCountdown(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (isPauseChoiceVisible && pauseChoiceCountdown === 0 && !pauseChoiceMadeRef.current) {
        console.log('⏰ [PAUSE] Choice countdown expired - auto-skipping', {
          section: currentSection,
          pauseChoiceCountdown,
          choiceMade: pauseChoiceMadeRef.current
        });
        handleSkipPause(true);
      }
    } catch (error) {
      console.error('❌ [PAUSE] Error in pause choice countdown', error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPauseChoiceScreen, pauseChoiceCountdown, pauseChoiceTrigger]);

  // ─── Section transition countdown reset ────────────────────────────────────

  useEffect(() => {
    if (showSectionTransition) {
      setSectionTransitionCountdown(5);
    }
  }, [showSectionTransition]);

  // ─── Section transition countdown (auto-advance after 5 seconds) ───────────

  useEffect(() => {
    if (showSectionTransition && sectionTransitionCountdown > 0) {
      const timer = setTimeout(() => {
        setSectionTransitionCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSectionTransition && sectionTransitionCountdown === 0) {
      const timer = setTimeout(() => {
        handleSectionTransitionComplete(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSectionTransition, sectionTransitionCountdown]);

  // ─── savePauseEventToDatabase ──────────────────────────────────────────────

  const savePauseEventToDatabase = useCallback(async (action: 'pause_taken' | 'pause_skipped' | 'pause_auto_skipped') => {
    if (!assignmentId || !currentAttempt) {
      console.log('⚠️ [PAUSE] Cannot save pause event - missing assignment or attempt', {
        assignmentId,
        currentAttempt
      });
      return;
    }

    console.log('💾 [PAUSE] Saving pause event to database', {
      action,
      section: currentSection,
      attemptNumber: currentAttempt,
      assignmentId
    });

    try {
      const { data: assignment, error: fetchError } = await supabase
        .from('2V_test_assignments')
        .select('completion_details')
        .eq('id', assignmentId!)
        .single() as { data: { completion_details: { attempts: AttemptRecord[] } | null } | null; error: unknown };

      if (fetchError) {
        console.error('❌ [PAUSE] Failed to fetch completion_details for pause event', {
          error: fetchError,
          assignmentId
        });
        return;
      }

      const completionDetails = assignment?.completion_details || { attempts: [] };
      const attempts = Array.isArray(completionDetails.attempts) ? completionDetails.attempts : [];

      const attemptIndex = attempts.findIndex((a: AttemptRecord) => a.attempt_number === currentAttempt);

      const pauseEvent: PauseEvent = {
        timestamp: new Date().toISOString(),
        section: currentSection,
        action
      };

      if (attemptIndex >= 0) {
        if (!attempts[attemptIndex].pause_events) {
          attempts[attemptIndex].pause_events = [];
        }
        attempts[attemptIndex].pause_events!.push(pauseEvent);
        if (action === 'pause_taken') {
          attempts[attemptIndex].pauses_used = (attempts[attemptIndex].pauses_used || 0) + 1;
        }
        console.log('✅ [PAUSE] Updated existing attempt with pause event', {
          attemptIndex,
          attemptNumber: currentAttempt,
          totalPauseEvents: attempts[attemptIndex].pause_events!.length,
          pausesUsed: attempts[attemptIndex].pauses_used
        });
      } else {
        attempts.push({
          attempt_number: currentAttempt,
          pause_events: [pauseEvent],
          pauses_used: action === 'pause_taken' ? 1 : 0,
          pauses_available: config?.max_pauses || 0
        } as AttemptRecord);
        console.log('✅ [PAUSE] Created new attempt with pause event', {
          attemptNumber: currentAttempt,
          pausesUsed: action === 'pause_taken' ? 1 : 0,
          pausesAvailable: config?.max_pauses || 0
        });
      }

      const updatePayload = {
        completion_details: { attempts }
      } as any;
      const { error: updateError } = await supabase
        .from('2V_test_assignments')
        .update(updatePayload)
        .eq('id', assignmentId!);

      if (updateError) {
        console.error('❌ [PAUSE] Failed to save pause event to database', {
          error: updateError,
          assignmentId,
          attemptNumber: currentAttempt,
          action
        });
      } else {
        console.log('✅ [PAUSE] Successfully saved pause event to database', {
          assignmentId,
          attemptNumber: currentAttempt,
          action,
          totalAttempts: attempts.length
        });
      }
    } catch (err) {
      console.error('❌ [PAUSE] Exception in savePauseEventToDatabase', {
        error: err,
        action,
        section: currentSection,
        attemptNumber: currentAttempt
      });
    }
  }, [assignmentId, currentAttempt, currentSection, config?.max_pauses, supabase]);

  // ─── handleTakePause ──────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handleTakePause() {
    if (pauseChoiceCountdown <= 0 || pauseChoiceMadeRef.current) {
      console.log('⚠️ [PAUSE] Take pause rejected - countdown expired or choice already made', {
        pauseChoiceCountdown,
        choiceAlreadyMade: pauseChoiceMadeRef.current
      });
      return;
    }

    console.log('✅ [PAUSE] User chose to take pause', {
      section: currentSection,
      sectionIndex: currentSectionIndexRef.current,
      previousPausesUsed: pausesUsed,
      newPausesUsed: pausesUsed + 1,
      pausesRemaining: (config?.max_pauses || 0) - pausesUsed - 1,
      pauseDurationMinutes: config?.pause_duration_minutes,
      countdownRemaining: pauseChoiceCountdown
    });

    pauseChoiceMadeRef.current = true;

    setPausesUsed(prev => prev + 1);
    const pauseEvent: PauseEvent = {
      timestamp: new Date().toISOString(),
      section: currentSection,
      action: 'pause_taken'
    };
    setPauseEvents(prev => [...prev, pauseEvent]);

    savePauseEventToDatabase('pause_taken');

    showPauseChoiceRef.current = false;
    setShowPauseChoiceScreen(false);
    const pauseDuration = (config?.pause_duration_minutes || 5) * 60;
    setPauseTimeRemaining(pauseDuration);
    setShowPauseScreen(true);
    console.log('⏸️ [PAUSE] Pause started', {
      pauseDurationSeconds: pauseDuration,
      pauseDurationMinutes: config?.pause_duration_minutes,
      willResumeAt: new Date(Date.now() + pauseDuration * 1000).toISOString()
    });
    setTimeout(() => {
      console.log('▶️ [PAUSE] User choice pause ended, resuming test', {
        section: currentSection,
        nextSectionIndex: currentSectionIndexRef.current + 1
      });
      setShowPauseScreen(false);
      setPauseTimeRemaining(null);
      moveToNextSection(currentSectionIndexRef.current);
    }, pauseDuration * 1000);
  }

  // ─── handleSkipPause ──────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handleSkipPause(isAutoSkip = false) {
    if (pauseChoiceMadeRef.current) {
      console.log('⚠️ [PAUSE] Skip pause rejected - choice already made', {
        choiceAlreadyMade: pauseChoiceMadeRef.current
      });
      return;
    }
    if (!isAutoSkip && pauseChoiceCountdown <= 0) {
      console.log('⚠️ [PAUSE] Skip pause rejected - countdown expired', {
        pauseChoiceCountdown,
        isAutoSkip
      });
      return;
    }

    pauseChoiceMadeRef.current = true;

    const action = isAutoSkip ? 'pause_auto_skipped' as const : 'pause_skipped' as const;

    console.log(`⏭️ [PAUSE] Pause ${isAutoSkip ? 'auto-skipped (timeout)' : 'skipped by user'}`, {
      section: currentSection,
      sectionIndex: currentSectionIndexRef.current,
      action,
      pausesUsed,
      pausesRemaining: (config?.max_pauses || 0) - pausesUsed,
      countdownRemaining: pauseChoiceCountdown,
      isAutoSkip
    });

    const pauseEvent: PauseEvent = {
      timestamp: new Date().toISOString(),
      section: currentSection,
      action
    };
    setPauseEvents(prev => [...prev, pauseEvent]);

    savePauseEventToDatabase(action);

    setPauseChoiceCountdown(5);
    showPauseChoiceRef.current = false;
    setShowPauseChoiceScreen(false);
    console.log('▶️ [PAUSE] Continuing without pause', {
      nextSectionIndex: currentSectionIndexRef.current + 1
    });
    moveToNextSection(currentSectionIndexRef.current);
  }

  // ─── handleSectionTransitionComplete ───────────────────────────────────────

  function handleSectionTransitionComplete(isAuto = false) {
    if (!isAuto && sectionTransitionCountdown <= 0) {
      return;
    }

    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    setShowSectionTransition(false);
    moveToNextSection(currentSectionIndexRef.current);
    setTimeout(() => setIsTransitioning(false), 500);
  }

  // ─── Return ────────────────────────────────────────────────────────────────

  return {
    // Pause screen state
    showPauseScreen,
    setShowPauseScreen,
    showPauseChoiceScreen,
    setShowPauseChoiceScreen,
    pauseTimeRemaining,
    setPauseTimeRemaining,

    // Pause tracking
    pausesUsed,
    setPausesUsed,
    pauseEvents,
    setPauseEvents,

    // Pause choice countdown
    pauseChoiceCountdown,
    setPauseChoiceCountdown,
    setPauseChoiceTrigger,

    // Section transition
    showSectionTransition,
    setShowSectionTransition,
    sectionTransitionCountdown,

    // Transitioning guard
    isTransitioning,
    setIsTransitioning,

    // Refs
    pauseChoiceMadeRef,
    showPauseChoiceRef,
    pausesUsedRef,

    // Actions
    handleTakePause,
    handleSkipPause,
    handleSectionTransitionComplete,
    savePauseEventToDatabase,
  };
}
