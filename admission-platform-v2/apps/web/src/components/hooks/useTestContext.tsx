/**
 * TestContext — central callback registry for TakeTestPage.
 *
 * Problem it solves:
 *   Several hooks (useTestTimer, useReviewMode, usePauseManagement, useTestProctoring)
 *   need to call functions that are defined AFTER the hooks are initialised — creating
 *   a circular dependency that was previously solved with four separate useRef dummies:
 *     completeSectionRef, moveToNextSectionRef, handleTimeUpRef, onAnnulTestRef
 *
 * Solution:
 *   A single context that holds stable refs internally.
 *   Hooks consume the context and call through the refs.
 *   TakeTestPage calls registerCallbacks() once each function is defined,
 *   pointing the refs at the real implementations.
 */

import React, { createContext, useContext, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TestCallbacks {
  completeSection: () => void;
  moveToNextSection: (sectionIndexOverride?: number) => void;
  handleTimeUp: () => void;
  onAnnulTest: (reason: 'fullscreen_exit' | 'multiple_screens') => void;
}

interface TestContextValue {
  /**
   * Wire up the real implementations.
   * Call this inside TakeTestPage after all functions are defined.
   */
  registerCallbacks: (callbacks: Partial<TestCallbacks>) => void;

  // Stable forwarders — safe to pass to hooks at init time
  completeSection: () => void;
  moveToNextSection: (sectionIndexOverride?: number) => void;
  handleTimeUp: () => void;
  onAnnulTest: (reason: 'fullscreen_exit' | 'multiple_screens') => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TestContext = createContext<TestContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TestContextProvider({ children }: { children: React.ReactNode }) {
  const completeSectionRef = useRef<() => void>(() => {});
  const moveToNextSectionRef = useRef<(sectionIndexOverride?: number) => void>(() => {});
  const handleTimeUpRef = useRef<() => void>(() => {});
  const onAnnulTestRef = useRef<(reason: 'fullscreen_exit' | 'multiple_screens') => void>(() => {});

  // registerCallbacks is stable — same function reference across renders
  const registerCallbacks = useRef<TestContextValue['registerCallbacks']>(
    (callbacks) => {
      if (callbacks.completeSection)   completeSectionRef.current   = callbacks.completeSection;
      if (callbacks.moveToNextSection) moveToNextSectionRef.current = callbacks.moveToNextSection;
      if (callbacks.handleTimeUp)      handleTimeUpRef.current      = callbacks.handleTimeUp;
      if (callbacks.onAnnulTest)       onAnnulTestRef.current       = callbacks.onAnnulTest;
    }
  ).current;

  // Stable forwarders — created once, delegate to the current ref value
  const value = useRef<TestContextValue>({
    registerCallbacks,
    completeSection:   (...args) => completeSectionRef.current(...args),
    moveToNextSection: (...args) => moveToNextSectionRef.current(...args),
    handleTimeUp:      (...args) => handleTimeUpRef.current(...args),
    onAnnulTest:       (...args) => onAnnulTestRef.current(...args),
  }).current;

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTestContext(): TestContextValue {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error('useTestContext must be used inside <TestContextProvider>');
  return ctx;
}
