/**
 * useTestProctoring Hook
 *
 * Handles fullscreen enforcement, exit warnings, multiple screen detection,
 * and test annulment for proctored tests.
 *
 * Self-contained: no dependencies on other custom hooks.
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseTestProctoringOptions {
  /** Skip all proctoring in guided/preview mode */
  isGuidedMode: boolean;
  /** Screen state flags — proctoring is suppressed while these are true */
  showStartScreen: boolean;
  showSectionSelectionScreen: boolean;
  showPauseScreen: boolean;
  showPauseChoiceScreen: boolean;
  showCompletionScreen: boolean;
  /** Called when test should be annulled (save completion details, etc.) */
  onAnnulTest: (reason: 'fullscreen_exit' | 'multiple_screens') => void;
}

export interface UseTestProctoringReturn {
  testAnnulled: boolean;
  showExitWarning: boolean;
  exitCountdown: number;
  multipleScreensDetected: boolean;
  enterFullscreen: () => void;
  handleStayInTest: () => void;
  handleConfirmExit: () => void;
  checkMultipleScreens: () => Promise<boolean>;
}

export function useTestProctoring({
  isGuidedMode,
  showStartScreen,
  showSectionSelectionScreen,
  showPauseScreen,
  showPauseChoiceScreen,
  showCompletionScreen,
  onAnnulTest,
}: UseTestProctoringOptions): UseTestProctoringReturn {
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(5);
  const [multipleScreensDetected, setMultipleScreensDetected] = useState(false);
  const [testAnnulled, setTestAnnulled] = useState(false);

  // Check for multiple screens
  const checkMultipleScreens = useCallback(async (): Promise<boolean> => {
    if (isGuidedMode) return false;

    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
    if (isLocalhost) return false;

    try {
      // @ts-ignore - Screen Detection API may not be in TypeScript types yet
      if (window.screen.isExtended !== undefined) {
        // @ts-ignore
        return window.screen.isExtended;
      }

      // @ts-ignore
      if ('getScreenDetails' in window) {
        // @ts-ignore
        const screens = await window.getScreenDetails();
        return screens.screens.length > 1;
      }

      return false;
    } catch {
      return false;
    }
  }, [isGuidedMode]);

  // Enter fullscreen mode
  const enterFullscreen = useCallback(() => {
    if (isGuidedMode) return;

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) return;

    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  }, [isGuidedMode]);

  // Annul the test
  const annulTest = useCallback(() => {
    const reason: 'fullscreen_exit' | 'multiple_screens' =
      multipleScreensDetected ? 'multiple_screens' : 'fullscreen_exit';

    onAnnulTest(reason);

    setTestAnnulled(true);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [multipleScreensDetected, onAnnulTest]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (isGuidedMode) return;

      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) return;

      if (!isCurrentlyFullscreen &&
          !showStartScreen &&
          !showSectionSelectionScreen &&
          !showPauseScreen &&
          !showPauseChoiceScreen &&
          !showCompletionScreen &&
          !showExitWarning &&
          !testAnnulled) {
        setShowExitWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [showStartScreen, showSectionSelectionScreen, showPauseScreen, showPauseChoiceScreen, showCompletionScreen, showExitWarning, testAnnulled, isGuidedMode]);

  // Exit warning countdown
  useEffect(() => {
    if (showExitWarning && exitCountdown > 0) {
      const timer = setTimeout(() => {
        setExitCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showExitWarning && exitCountdown === 0) {
      annulTest();
    }
  }, [showExitWarning, exitCountdown, annulTest]);

  // Check for multiple screens periodically
  useEffect(() => {
    async function monitorScreens() {
      const hasMultipleScreens = await checkMultipleScreens();
      setMultipleScreensDetected(hasMultipleScreens);

      if (hasMultipleScreens &&
          !showStartScreen &&
          !showSectionSelectionScreen &&
          !showCompletionScreen &&
          !testAnnulled) {
        annulTest();
      }
    }

    monitorScreens();
    const interval = setInterval(monitorScreens, 3000);
    return () => clearInterval(interval);
  }, [showStartScreen, showSectionSelectionScreen, showCompletionScreen, testAnnulled, checkMultipleScreens, annulTest]);

  // Handle "Stay in Test" button
  const handleStayInTest = useCallback(() => {
    if (exitCountdown <= 0) return;

    setShowExitWarning(false);
    setExitCountdown(5);
    enterFullscreen();
  }, [exitCountdown, enterFullscreen]);

  // Handle "Confirm Exit" button
  const handleConfirmExit = useCallback(() => {
    if (exitCountdown <= 0) return;

    annulTest();
  }, [exitCountdown, annulTest]);

  return {
    testAnnulled,
    showExitWarning,
    exitCountdown,
    multipleScreensDetected,
    enterFullscreen,
    handleStayInTest,
    handleConfirmExit,
    checkMultipleScreens,
  };
}
