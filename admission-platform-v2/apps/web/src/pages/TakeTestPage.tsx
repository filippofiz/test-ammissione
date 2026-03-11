/**
 * Take Test Page - Universal Test Taking Interface
 * Supports any test type (GMAT, SAT, TOLC, etc.) with flexible configuration
 * Based on test_track_config settings
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFlag,
  faClock,
  faBookmark,
} from "@fortawesome/free-solid-svg-icons";
import { Layout } from "../components/Layout";
import { supabase } from "../lib/supabase";
import { supabaseTest } from "../lib/supabaseTest";
import { useTranslation } from "react-i18next";
import { MathJaxProvider } from "../components/MathJaxRenderer";
import { QuestionRenderer } from "../components/test/QuestionRenderer";
import {
  SectionCompleted,
  PauseChoice,
  PauseScreen,
  TestCompleted,
} from "../components/test/SectionTransition";
import { ReviewScreen } from "../components/test/ReviewScreen";
import { TestStartScreen } from "../components/test/TestStartScreen";
import { SectionSelectionScreen } from "../components/test/SectionSelectionScreen";
import { TestHeader } from "../components/test/TestHeader";
import { NavigationControls } from "../components/test/NavigationControls";
import { MultiQuestionView } from "../components/test/MultiQuestionView";
import { TestLockedScreen } from "../components/test/TestLockedScreen";
import { TestAnnulledScreen } from "../components/test/TestAnnulledScreen";
import { ExitWarningScreen } from "../components/test/ExitWarningScreen";
import ChangeBlockedToast from "../components/test/ChangeBlockedToast";
import AnswerRequiredModal from "../components/test/AnswerRequiredModal";
import SubmittingOverlay from "../components/test/SubmittingOverlay";
import { useTestProctoring } from "../components/hooks/useTestProctoring";
import { useReviewMode } from "../components/hooks/useReviewMode";
import { useAnswerManagement } from "../components/hooks/useAnswerManagement";
import { useTestTimer, formatTime } from "../components/hooks/useTestTimer";
import { usePauseManagement } from "../components/hooks/usePauseManagement";
import { TestContextProvider, useTestContext } from "@/components/hooks/useTestContext";
import { useTestDataLoader } from "@/components/hooks/useTestDataLoader";
import { useAdaptiveTesting } from "@/components/hooks/useAdaptiveTesting";
import { PDFTestView } from "../components/PDFTestView";
import { ComplexAdaptiveAlgorithm } from "../lib/algorithms/adaptiveAlgorithm";
import { addSeenQuestions } from "../lib/api/gmat";
import { useSaveCompletionDetails } from "@/components/hooks/useSaveCompletionDetails";
import { useSaveGmatResult } from "@/components/hooks/useSaveGmatResult";
import { useTestProgress } from "@/components/hooks/useTestProgress";
import type { GmatSection } from "@/lib/api/gmat";
import {
  getSectionField,
  formatSectionName,
  calculateSectionQuestionLimit,
  calculateExpectedTotalSections,
} from "@/lib/utils/sectionUtils";

function TakeTestPageInner() {
  const { assignmentId, testId, startQuestionNumber, assessmentType, section: gmatSectionParam } = useParams<{
    assignmentId?: string;
    testId?: string;
    startQuestionNumber?: string;
    assessmentType?: string;
    section?: string;
  }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = window.location;

  // GMAT MODE DETECTION - activated by /take-test/gmat/:assessmentType/:section? routes
  const isGmatMode = location.pathname.startsWith("/take-test/gmat/");
  const gmatAssessmentType = isGmatMode
    ? (assessmentType as 'placement' | 'section' | 'simulation' | undefined)
    : undefined;
  const gmatSection = isGmatMode ? (gmatSectionParam as GmatSection | undefined) : undefined;

  // PREVIEW MODE DETECTION - 100% separate from real test
  const isPreviewMode = location.pathname.startsWith("/preview-test");
  const previewTestId = isPreviewMode ? (testId ?? null) : null;
  const previewStartQuestion = isPreviewMode
    ? parseInt(startQuestionNumber || "1", 10)
    : 1;

  // Detect test mode from URL parameter (?testMode=true)
  const searchParams = new URLSearchParams(window.location.search);
  const isTestMode = searchParams.get("testMode") === "true";

  // Detect guided mode from URL parameters (?guided=true&timed=false)
  const isGuidedMode = searchParams.get("guided") === "true";
  const guidedTimed = searchParams.get("timed") !== "false"; // Default to timed

  // Toggle for showing/hiding correct answers in guided mode
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  const db = isTestMode ? supabaseTest : supabase;

  // Crash-recovery session ID — must be stable across page refreshes:
  //   - GMAT: route params only (no timestamp), e.g. "gmat_placement_all"
  //   - Standard tests: assignmentId from URL param
  const progressSessionId = isGmatMode
    ? `gmat_${gmatAssessmentType}_${gmatSection ?? 'all'}`
    : (assignmentId ?? 'noop');
  const [showResumeModal, setShowResumeModal] = useState(false);

  // State
  const [submitting, setSubmitting] = useState(false); // Submitting test state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentPageGroup, setCurrentPageGroup] = useState(0); // For PDF tests: current page group
  const [showSectionSelectionScreen, setShowSectionSelectionScreen] =
    useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [timerActive, setTimerActive] = useState(false); // Controls whether the timer interval is running
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [sectionStartTime, setSectionStartTime] = useState<Date | null>(null);
  const [userSelectedSections, setUserSelectedSections] = useState<string[]>(
    [],
  );
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(
    null,
  );
  // showAnswerRequiredMessage, isPartialAnswer, showChangeBlockedMessage — now owned by useAnswerManagement hook

  // Device diagnostics (pre-test, owned here so it can be passed to useTestDataLoader)
  const [deviceDiagnostics, setDeviceDiagnostics] = useState<{
    connection: {
      status: "checking" | "good" | "warning" | "error";
      value?: number;
    };
    performance: {
      status: "checking" | "good" | "warning" | "error";
      value?: number;
    };
    overall: "checking" | "ready" | "warning" | "error";
  } | null>(null);

  // GMAT IRT scoring: ref shared with useAdaptiveTesting for per-section theta capture
  const sectionThetasRef = useRef<
    Record<string, { theta: number; se: number }>
  >({});

  // When resuming from saved progress, hold the restored time here so startSectionTimer
  // uses it instead of recalculating from config (consumed once then cleared).
  const resumeTimeRef = useRef<number | null>(null);

  // Set to true when the user clicks "Resume" so startTest() knows NOT to increment
  // the attempt number (the incomplete status was caused by stale-session detection,
  // not by an actual failed attempt).
  const isResumingRef = useRef(false);

  // Central callback registry — replaces completeSectionRef, moveToNextSectionRef,
  // handleTimeUpRef, onAnnulTestRef. Wire implementations via registerCallbacks() after they're defined.
  const {
    registerCallbacks,
    completeSection: completeSectionCb,
    moveToNextSection: moveToNextSectionCb,
    handleTimeUp: handleTimeUpCb,
    onAnnulTest: onAnnulTestCb,
  } = useTestContext();
  // completeSectionCb, moveToNextSectionCb, handleTimeUpCb, onAnnulTestCb are stable forwarders
  // passed to hooks at init time; real implementations are wired via registerCallbacks() below.

  // timerRef — now managed by useTestTimer hook
  // pauseChoiceMadeRef, showPauseChoiceRef, currentSectionIndexRef, pausesUsedRef — owned by usePauseManagement hook
  const isCompletingSectionRef = useRef(false); // Synchronous guard for race condition
  // isInReviewModeRef, showReviewScreenRef — owned by useReviewMode hook
  // savingInProgressRef, autoSaveTimeoutRef, currentQuestionIdRef, globalQuestionOrderRef,
  // currentAttemptRef, questionStartTimesRef, answersRef — owned by useAnswerManagement hook

  // Timer — must be before useTestDataLoader so setTimeRemaining is available at load time
  const { timeRemaining, setTimeRemaining } = useTestTimer({
    initialSeconds: null,
    isActive: timerActive,
    onTimeUp: handleTimeUpCb,
  });

  // Data loading — owns config, questions, answers, student state
  const {
    loading,
    isLocked,
    config,
    sections,
    setSections,
    allQuestions,
    questionPool,
    selectedQuestions,
    setSelectedQuestions,
    adaptiveAlgorithm,
    studentId,
    currentAttempt,
    setCurrentAttempt,
    hasSpecialNeeds,
    exerciseType,
    isPDFTest,
    answers,
    setAnswers,
    globalQuestionOrder,
    setGlobalQuestionOrder,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    showStartScreen,
    setShowStartScreen,
    testLanguage,
    setTestLanguage,
  } = useTestDataLoader({
    assignmentId,
    isPreviewMode,
    previewTestId,
    previewStartQuestion,
    isTestMode,
    isGuidedMode,
    guidedTimed,
    isGmatMode,
    gmatAssessmentType,
    gmatSection,
    db,
    i18n,
    deviceDiagnostics,
    setTimeRemaining,
    setTimerActive,
  });

  // Helper function to get the correct section field based on config
  // Get current section and questions
  const currentSection = sections[currentSectionIndex];

  // Adaptive testing — base questions, algorithm selection, DI balancing, GMAT theta capture
  const { selectNextAdaptiveAction, prepareBaseQuestionsForSection } =
    useAdaptiveTesting({
      config,
      currentSection,
      currentQuestionIndex,
      globalQuestionOrder,
      selectedQuestions,
      questionPool,
      answers,
      adaptiveAlgorithm,
      sectionThetasRef,
    });

  // Pause management — usePauseManagement hook
  const currentSectionIndexRef = useRef(currentSectionIndex);
  const pauseMgmt = usePauseManagement({
    config,
    currentSection,
    currentSectionIndexRef,
    assignmentId,
    currentAttempt,
    supabase,
    moveToNextSection: moveToNextSectionCb,
  });
  const {
    showPauseScreen,
    setShowPauseScreen,
    showPauseChoiceScreen,
    setShowPauseChoiceScreen,
    pauseTimeRemaining,
    setPauseTimeRemaining,
    pausesUsed,
    pauseEvents,
    pauseChoiceCountdown,
    setPauseChoiceCountdown,
    setPauseChoiceTrigger,
    showSectionTransition,
    setShowSectionTransition,
    sectionTransitionCountdown,
    isTransitioning,
    setIsTransitioning,
    pauseChoiceMadeRef,
    showPauseChoiceRef,
    pausesUsedRef,
    handleTakePause,
    handleSkipPause,
    handleSectionTransitionComplete,
  } = pauseMgmt;

  // Proctoring: fullscreen enforcement, exit warnings, multiple screen detection
  const proctoring = useTestProctoring({
    isGuidedMode,
    showStartScreen,
    showSectionSelectionScreen,
    showPauseScreen,
    showPauseChoiceScreen,
    showCompletionScreen,
    onAnnulTest: onAnnulTestCb,
  });
  const {
    testAnnulled,
    showExitWarning,
    exitCountdown,
    multipleScreensDetected,
    enterFullscreen,
    handleStayInTest,
    handleConfirmExit,
    checkMultipleScreens,
  } = proctoring;

  // Bind exerciseType into formatSectionName for use as a prop/callback
  const formatSectionNameBound = (name: string) =>
    formatSectionName(name, exerciseType);

  // Calculate expected total sections (for footer display)
  const expectedTotalSections = calculateExpectedTotalSections(
    config,
    sections,
  );

  // Use selectedQuestions if they've been prepared (for both adaptive and non-adaptive tests)
  const questionsToUse =
    selectedQuestions.length > 0 ? selectedQuestions : allQuestions;

  // In no_sections mode, use all questions; otherwise filter by section
  const sectionQuestions =
    config?.section_order_mode === "no_sections"
      ? questionsToUse
      : questionsToUse.filter(
          (q) => getSectionField(q, config) === currentSection,
        );

  const currentQuestion = sectionQuestions[currentQuestionIndex];
  const totalQuestionsInSection = sectionQuestions.length;

  // Multi-question page support
  const questionsPerPage =
    config?.questions_per_page && config.questions_per_page > 1
      ? config.questions_per_page
      : 1;
  const isMultiQuestionPage = questionsPerPage > 1;
  const currentPageIndex = Math.floor(currentQuestionIndex / questionsPerPage);

  // Get questions for current page (when multi-question mode)
  const currentPageStartIndex = currentPageIndex * questionsPerPage;
  const currentPageQuestions = isMultiQuestionPage
    ? sectionQuestions.slice(
        currentPageStartIndex,
        currentPageStartIndex + questionsPerPage,
      )
    : [currentQuestion].filter(Boolean);

  // Review & Edit mode (GMAT-style) — useReviewMode hook
  const reviewMode = useReviewMode({
    timeRemaining,
    answers,
    currentSectionQuestions: sectionQuestions,
    setCurrentQuestionIndex,
    onCompleteSection: completeSectionCb,
  });
  const {
    bookmarkedQuestions,
    showReviewScreen,
    answerChangesUsed,
    isInReviewMode,
    setAnswerChangesUsed,
    setShowReviewScreen,
    setIsInReviewMode,
    isInReviewModeRef,
    showReviewScreenRef,
    toggleBookmark,
    enterReviewMode,
    goToQuestionFromReview,
    returnToReviewScreen,
    completeReview,
  } = reviewMode;

  // Answer management — useAnswerManagement hook
  const answerMgmt = useAnswerManagement({
    answers,
    setAnswers,
    currentQuestion,
    currentQuestionIndex,
    globalQuestionOrder,
    studentId,
    currentAttempt,
    config,
    timeRemaining,
    isTransitioning,
    isPreviewMode,
    isTestMode,
    isGuidedMode,
    guidedTimed,
    isGmatMode,
    assignmentId,
    adaptiveAlgorithm,
    db,
    isInReviewMode,
    answerChangesUsed,
    setAnswerChangesUsed,
  });
  const {
    isSaving,
    saveError,
    showAnswerRequiredMessage,
    setShowAnswerRequiredMessage,
    isPartialAnswer,
    setIsPartialAnswer,
    showChangeBlockedMessage,
    sectionTimes,
    setSectionTimes,
    saveAnswer,
    handleRendererAnswerChange,
    toUnifiedAnswer,
    toggleFlag,
    autoSaveTimeoutRef,
    answersRef,
    globalQuestionOrderRef,
    currentQuestionIdRef,
  } = answerMgmt;

  const sectionQuestionLimit = calculateSectionQuestionLimit(
    config,
    currentSection,
    totalQuestionsInSection,
  );

  // Completion details persistence — extracted hook
  const { saveCompletionDetails } = useSaveCompletionDetails({
    assignmentId,
    currentAttempt,
    config,
    deviceDiagnostics,
    testStartTime,
    sectionStartTime,
    currentSection,
    sectionTimes,
    pauseEvents,
    sections,
    selectedQuestions,
    answers,
    sectionThetasRef,
  });

  // Crash recovery (localStorage) — active for both GMAT and standard tests
  // Disabled for preview/guided mode (no meaningful state to restore)
  const {
    hasSavedProgress,
    savedProgress,
    saveProgress,
    clearProgress,
  } = useTestProgress({
    sessionId: progressSessionId,
    userId: studentId ?? '',
    // Keep disabled until studentId is resolved — prevents initial load with wrong key
    disabled: isPreviewMode || isGuidedMode || progressSessionId === 'noop' || !studentId,
    testType: isGmatMode ? `gmat_${gmatAssessmentType}` : 'standard',
  });

  // Show resume modal once when saved progress is detected (start screen must be visible)
  useEffect(() => {
    if (hasSavedProgress && showStartScreen && !showResumeModal) {
      setShowResumeModal(true);
    }
  }, [hasSavedProgress, showStartScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save progress on every answer change (immediate)
  useEffect(() => {
    if (!studentId || showStartScreen) return;
    saveProgress({
      currentIndex: currentQuestionIndex,
      currentSectionIndex,
      answers: Object.entries(answers).map(([id, a]) => [id, {
        questionId: id,
        answer: a.answer as string | string[] | Record<string, unknown>,
        timeSpent: a.timeSpent,
      }]),
      bookmarkedQuestions: Array.from(bookmarkedQuestions),
      timeRemaining,
      testStarted: true,
      inReviewPhase: showReviewScreen,
    });
  }, [answers, studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also save every 30s so timeRemaining stays current even when no answer changes
  const lastTimerSaveRef = useRef<number>(0);
  useEffect(() => {
    if (!studentId || showStartScreen || timeRemaining === null) return;
    if (Date.now() - lastTimerSaveRef.current < 30_000) return;
    lastTimerSaveRef.current = Date.now();
    saveProgress({
      currentIndex: currentQuestionIndex,
      currentSectionIndex,
      answers: Object.entries(answers).map(([id, a]) => [id, {
        questionId: id,
        answer: a.answer as string | string[] | Record<string, unknown>,
        timeSpent: a.timeSpent,
      }]),
      bookmarkedQuestions: Array.from(bookmarkedQuestions),
      timeRemaining,
      testStarted: true,
      inReviewPhase: showReviewScreen,
    });
  }, [timeRemaining, studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // GMAT result saving hook
  const { saveGmatResult } = useSaveGmatResult({
    isGmatMode,
    gmatAssessmentType,
    gmatSection,
    studentId,
    selectedQuestions,
    answers,
    sectionThetasRef,
    bookmarkedQuestions,
    sections,
    timeRemaining,
    initialTimeSeconds: null, // fallback: per-question timeSpent sum
  });

  // Question start time, network monitor, auto-save debounce — now handled by useAnswerManagement hook

  // Track section times
  useEffect(() => {
    if (sectionStartTime && currentSection) {
      // When section changes, save the time spent in previous section
      return () => {
        const timeSpent = Math.floor(
          (new Date().getTime() - sectionStartTime.getTime()) / 1000,
        );
        setSectionTimes((prev) => ({
          ...prev,
          [currentSection]: (prev[currentSection] || 0) + timeSpent,
        }));
      };
    }
  }, [currentSection, sectionStartTime]);

  // Keep currentSectionIndexRef in sync with state (for use in timer callbacks to avoid stale closures)
  useEffect(() => {
    currentSectionIndexRef.current = currentSectionIndex;
  }, [currentSectionIndex]);

  // pausesUsedRef sync — now handled by usePauseManagement hook

  // Ref syncs for answer management refs + beforeunload — now handled by useAnswerManagement hook

  // Pause timer countdown, pause choice countdown, section transition countdown
  // — all now handled by usePauseManagement hook

  // Fullscreen monitor, exit countdown, multiple screen check → moved to useTestProctoring hook

  async function startTest() {
    // Check for multiple screens before starting
    const hasMultipleScreens = await checkMultipleScreens();
    if (hasMultipleScreens) {
      alert(t("takeTest.multipleScreensError"));
      return;
    }

    // GMAT mode: no assignment rows — skip DB status check entirely
    if (!isGmatMode) {
      // Get current assignment status
      const { data: assignment, error: assignmentError } = (await supabase
        .from("2V_test_assignments")
        .select("status, current_attempt, total_attempts")
        .eq("id", assignmentId!)
        .single()) as {
        data: {
          status: string;
          current_attempt: number | null;
          total_attempts: number | null;
        } | null;
        error: unknown;
      };

      if (assignmentError || !assignment) {
        console.error(
          "❌ [startTest] Failed to fetch assignment:",
          assignmentError,
        );
        alert("Unable to start the test. Please reload the page and try again.");
        return;
      }

      // If restarting from annulled/incomplete, increment attempt —
      // UNLESS we're resuming via the resume modal (stale-session detection caused
      // the incomplete status, not an actual failed attempt).
      if (
        assignment.status === "annulled" ||
        assignment.status === "incomplete"
      ) {
        if (isResumingRef.current) {
          // Resume: restore the same attempt number without incrementing
          isResumingRef.current = false;
          const currentAttempt = assignment.current_attempt || 1;
          const { error: updateError } = await supabase
            .from("2V_test_assignments")
            .update({ status: "in_progress", completion_status: "in_progress" })
            .eq("id", assignmentId!);

          if (updateError) {
            console.error("❌ [startTest] Failed to restore in_progress status:", updateError);
            alert("Unable to resume the test. Please reload the page and try again.");
            return;
          }

          setCurrentAttempt(currentAttempt);
        } else {
        const newAttempt = (assignment.current_attempt || 1) + 1;
        const newTotalAttempts =
          assignment.total_attempts || assignment.current_attempt || 1;

        const updateData1: {
          current_attempt: number;
          total_attempts: number;
          status: string;
          completion_status: string;
          start_time: string;
        } = {
          current_attempt: newAttempt,
          total_attempts: newTotalAttempts,
          status: "in_progress",
          completion_status: "in_progress",
          start_time: new Date().toISOString(),
        };
        const { error: updateError } = await supabase
          .from("2V_test_assignments")
          .update(updateData1)
          .eq("id", assignmentId!);

        if (updateError) {
          console.error(
            "❌ [startTest] Failed to update attempt number:",
            updateError,
          );
          alert(
            "Unable to start the test. Please reload the page and try again.",
          );
          return;
        }

        setCurrentAttempt(newAttempt);
        }
      } else if (assignment.status === "unlocked") {
        // First time starting this test

        const updateData2: {
          status: string;
          completion_status: string;
          start_time: string;
        } = {
          status: "in_progress",
          completion_status: "in_progress",
          start_time: new Date().toISOString(),
        };
        const { error: updateError } = await supabase
          .from("2V_test_assignments")
          .update(updateData2)
          .eq("id", assignmentId!);

        if (updateError) {
          console.error(
            "❌ [startTest] Failed to update test status:",
            updateError,
          );
          alert(
            "Unable to start the test. Please reload the page and try again.",
          );
          return;
        }
      }
    }

    // Check if user needs to select section order
    if (
      config?.section_order_mode === "user_choice" &&
      userSelectedSections.length === 0
    ) {
      setShowStartScreen(false);
      setShowSectionSelectionScreen(true);
      setUserSelectedSections([...sections]); // Initialize with default order
      return;
    }

    // Apply user-selected sections if any
    if (userSelectedSections.length > 0) {
      setSections(userSelectedSections);
    }

    setShowStartScreen(false);
    setShowSectionSelectionScreen(false);
    setTestLanguage(i18n.language); // Capture language at test start
    setTestStartTime(new Date());
    setSectionStartTime(new Date());

    // Enter fullscreen mode
    enterFullscreen();

    // Start timer based on current section
    startSectionTimer();
  }

  function beginTestWithSelectedSections() {
    setSections(userSelectedSections);

    // Prepare baseline questions for the first section (adaptive per_section mode)
    if (userSelectedSections.length > 0) {
      // Pass '' as completedSection — no previous section to capture theta for
      const baseQs = prepareBaseQuestionsForSection(
        userSelectedSections[0],
        "",
      );
      if (baseQs.length > 0) {
        setSelectedQuestions(baseQs);
      }
    }

    setShowSectionSelectionScreen(false);
    setTestLanguage(i18n.language); // Capture language at test start
    setTestStartTime(new Date());
    setSectionStartTime(new Date());

    // Enter fullscreen mode
    enterFullscreen();

    startSectionTimer();
  }

  function moveSectionUp(index: number) {
    if (index === 0) return;
    const newSections = [...userSelectedSections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    setUserSelectedSections(newSections);
  }

  function moveSectionDown(index: number) {
    if (index === userSelectedSections.length - 1) return;
    const newSections = [...userSelectedSections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    setUserSelectedSections(newSections);
  }

  function handleDragStart(index: number) {
    setDraggedSectionIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();

    if (draggedSectionIndex === null || draggedSectionIndex === index) return;

    const newSections = [...userSelectedSections];
    const draggedSection = newSections[draggedSectionIndex];

    // Remove from old position
    newSections.splice(draggedSectionIndex, 1);
    // Insert at new position
    newSections.splice(index, 0, draggedSection);

    setUserSelectedSections(newSections);
    setDraggedSectionIndex(index);
  }

  function handleDragEnd() {
    setDraggedSectionIndex(null);
  }

  /** Calculate section time in seconds from config, handling special needs and adaptive suffixes */
  function getSectionTimeSeconds(sectionOverride?: string): number | null {
    // Skip timer in guided mode with no time limit
    if (isGuidedMode && !guidedTimed) return null;

    const section = sectionOverride || currentSection;
    let sectionTime: number | null = null;

    if (config?.time_per_section && section) {
      sectionTime = config.time_per_section[section];
      // If not found and this is an adaptive section (ends with -Easy or -Hard),
      // try the base section name (e.g., "RW2" from "RW2-Easy")
      if (
        !sectionTime &&
        (section.endsWith("-Easy") || section.endsWith("-Hard"))
      ) {
        const baseSection = section.replace(/-Easy|-Hard$/i, "");
        sectionTime = config.time_per_section[baseSection] || null;
      }
    } else if (config?.total_time_minutes && sections.length > 0) {
      let totalTime = config.total_time_minutes;
      if (hasSpecialNeeds) {
        totalTime = Math.round(totalTime * 1.3);
      }
      sectionTime = Math.round(totalTime / sections.length);
    }

    if (!sectionTime) return null;

    let sectionTimeSeconds = sectionTime * 60;
    if (hasSpecialNeeds && config?.time_per_section && section) {
      sectionTimeSeconds = Math.round(sectionTimeSeconds * 1.3);
      console.log("⏰ Special needs: Applied 30% extra time to section", {
        section,
        original: sectionTime,
        adjusted: Math.round(sectionTimeSeconds / 60),
      });
    }
    return sectionTimeSeconds;
  }

  function startSectionTimer(sectionOverride?: string) {
    setTimerActive(false);
    // If resuming from saved progress, use the stored time instead of recalculating from config
    if (resumeTimeRef.current !== null) {
      setTimeRemaining(resumeTimeRef.current);
      resumeTimeRef.current = null;
      setTimerActive(true);
      return;
    }
    const seconds = getSectionTimeSeconds(sectionOverride);
    if (seconds !== null) {
      setTimeRemaining(seconds);
      setTimerActive(true);
    } else {
      setTimeRemaining(null);
    }
  }

  function handleTimeUp() {
    // Timer is automatically stopped by the hook when it reaches 0
    setTimerActive(false);

    // If in review mode, close the review screen and complete the section
    // Use refs to get actual values (avoids stale closure in timer callbacks)
    if (isInReviewModeRef.current || showReviewScreenRef.current) {
      // Call completeSection with skipReviewCheck=true to skip the review mode check
      completeSection(true);
      return;
    }

    // Complete the section instead of submitting the entire test
    // This will handle navigation to next section, pause screens, or final submission
    completeSection();
  }

  // handleAnswerSelect, DI helpers, handleRendererAnswerChange, toUnifiedAnswer, toggleFlag
  // — now provided by useAnswerManagement hook

  function canGoBack(): boolean {
    if (!config) {
      return false;
    }

    // PREVIEW MODE: Always allow back except at very first question
    if (isPreviewMode) {
      return currentQuestionIndex > 0;
    }

    // Can't go back if at first question of first section
    if (currentSectionIndex === 0 && currentQuestionIndex === 0) {
      return false;
    }

    // Check navigation within section
    if (currentQuestionIndex > 0 && config.navigation_mode === "back_forward") {
      return true;
    }

    // Check navigation between sections
    if (
      currentQuestionIndex === 0 &&
      currentSectionIndex > 0 &&
      config.navigation_between_sections === "back_forward"
    ) {
      return true;
    }

    return false;
  }

  async function goToPreviousQuestion() {
    // Extra safety: reject if time has expired
    if (timeRemaining !== null && timeRemaining <= 0) {
      return;
    }

    // Prevent race condition: if already navigating, ignore this call
    if (isTransitioning) {
      return;
    }

    if (!canGoBack()) return;

    setIsTransitioning(true);

    try {
      // Cancel any pending auto-save since we're doing an immediate save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // Save current answer before navigating back (or save empty answer to track question order)
      if (currentQuestion?.id) {
        await saveAnswer(
          currentQuestion.id,
          answers[currentQuestion.id] || { answer: null },
          answers[currentQuestion.id]?.flagged || false,
          0,
          globalQuestionOrder + 1,
        );
      }

      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (currentSectionIndex > 0) {
        // Move to previous section's last question
        setCurrentSectionIndex(currentSectionIndex - 1);
        const prevSectionQuestions = allQuestions.filter(
          (q) =>
            getSectionField(q, config) === sections[currentSectionIndex - 1],
        );
        setCurrentQuestionIndex(prevSectionQuestions.length - 1);
      }
    } finally {
      setIsTransitioning(false);
    }
  }

  // saveAnswer — now provided by useAnswerManagement hook

  async function goToNextQuestion() {
    console.log("🔍 [NAVIGATION] goToNextQuestion called", {
      currentQuestionIndex,
      globalQuestionOrder,
      currentSection,
      isTransitioning,
      timeRemaining,
      willSaveCurrentQuestionWithOrder: globalQuestionOrder + 1,
    });

    // Extra safety: reject if time has expired
    if (timeRemaining !== null && timeRemaining <= 0) {
      console.log("⚠️ [NAVIGATION] Rejected - time expired");
      return;
    }

    // Prevent race condition: if already navigating, ignore this call
    if (isTransitioning) {
      console.log("⚠️ [NAVIGATION] Rejected - already transitioning");
      return;
    }

    console.log("✅ [NAVIGATION] Starting navigation");
    setIsTransitioning(true);

    try {
      // Cancel any pending auto-save since we're doing an immediate save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // Save current answer immediately before navigating (or save empty answer to track question order)
      if (currentQuestion?.id) {
        const saved = await saveAnswer(
          currentQuestion.id,
          answers[currentQuestion.id] || { answer: null },
          answers[currentQuestion.id]?.flagged || false,
          0,
          globalQuestionOrder + 1,
        );

        // Block navigation if save failed
        if (!saved) {
          console.log("⚠️ [NAVIGATION] Blocked - save failed");
          setIsTransitioning(false);
          return;
        }
      }

      // Check if answer is required
      console.log("📝 [VALIDATION] Checking blank answers:", {
        can_leave_blank: config?.can_leave_blank,
        willValidate: config?.can_leave_blank === false,
      });

      if (config?.can_leave_blank === false) {
        const currentAnswer = answers[currentQuestion?.id];

        // Basic check: does any answer exist?
        if (!currentAnswer?.answer) {
          setIsPartialAnswer(false);
          setShowAnswerRequiredMessage(true);
          return;
        }

        // For multi-part questions, check if ALL parts are answered
        const questionData = currentQuestion?.question_data;

        // MSR questions: all questions must be answered
        if (questionData?.di_type === "MSR") {
          const questions = questionData.questions || [];
          const msrAnswers = currentAnswer.msrAnswers || [];

          if (
            msrAnswers.length < questions.length ||
            msrAnswers.some((a) => !a)
          ) {
            // Check if ANY are answered (partial)
            const hasAnyAnswer = msrAnswers.some((a) => a);
            setIsPartialAnswer(hasAnyAnswer);
            setShowAnswerRequiredMessage(true);
            return;
          }
        }

        // GI questions: both blanks must be filled
        if (questionData?.di_type === "GI") {
          if (!currentAnswer.blank1 || !currentAnswer.blank2) {
            // Check if one is answered (partial)
            const hasAnyAnswer = !!(
              currentAnswer.blank1 || currentAnswer.blank2
            );
            setIsPartialAnswer(hasAnyAnswer);
            setShowAnswerRequiredMessage(true);
            return;
          }
        }

        // TA questions: all statements must be answered
        if (questionData?.di_type === "TA") {
          const statements = questionData.statements || [];
          const taAnswers = currentAnswer.taAnswers || {};

          if (Object.keys(taAnswers).length < statements.length) {
            // Has partial answer if any statements are answered
            setIsPartialAnswer(Object.keys(taAnswers).length > 0);
            setShowAnswerRequiredMessage(true);
            return;
          }

          // Check that all statement indices are answered
          for (let i = 0; i < statements.length; i++) {
            if (!taAnswers[i]) {
              // Has partial answer
              setIsPartialAnswer(true);
              setShowAnswerRequiredMessage(true);
              return;
            }
          }
        }

        // TPA questions: both columns must be answered
        if (questionData?.di_type === "TPA") {
          if (!currentAnswer.column1 || !currentAnswer.column2) {
            // Check if one is answered (partial)
            const hasAnyAnswer = !!(
              currentAnswer.column1 || currentAnswer.column2
            );
            setIsPartialAnswer(hasAnyAnswer);
            setShowAnswerRequiredMessage(true);
            return;
          }
        }
      }

      // Adaptive question selection
      if (config?.adaptivity_mode === "adaptive") {
        const action = await selectNextAdaptiveAction();
        if (action.type === "complete_section") {
          completeSection();
          return;
        }
        if (action.type === "add_and_advance") {
          setSelectedQuestions((prev) => [...prev, ...action.questions]);
          setCurrentQuestionIndex(action.newIndex);
          setGlobalQuestionOrder(action.newGlobalOrder);
          return;
        }
        if (action.type === "advance") {
          setCurrentQuestionIndex(action.newIndex);
          setGlobalQuestionOrder(action.newGlobalOrder);
          return;
        }
        // action.type === 'no_op': fall through to standard advance below
      }

      // Standard navigation (non-adaptive, or adaptive no_op fallback)
      if (currentQuestionIndex < totalQuestionsInSection - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setGlobalQuestionOrder(globalQuestionOrder + 1);
      } else {
        completeSection();
      }
    } finally {
      setIsTransitioning(false);
    }
  }

  function completeSection(skipReviewCheck = false) {
    // Prevent race condition: use ref for synchronous check
    if (isCompletingSectionRef.current) {
      return;
    }

    // Check if review mode is enabled and not already in review
    if (!skipReviewCheck && config?.allow_review_at_end && !isInReviewMode) {
      enterReviewMode();
      return;
    }

    // If called with skipReviewCheck (time expired during review), reset review state
    if (
      skipReviewCheck &&
      (isInReviewModeRef.current || showReviewScreenRef.current)
    ) {
      setShowReviewScreen(false);
      showReviewScreenRef.current = false;
      setIsInReviewMode(false);
      isInReviewModeRef.current = false;
      setAnswerChangesUsed(0);
    }

    // Set ref immediately for synchronous guard
    isCompletingSectionRef.current = true;

    // Use refs to get actual values (avoids stale closure in timer callbacks)
    const actualCurrentSection = sections[currentSectionIndexRef.current];
    const actualCurrentSectionIndex = currentSectionIndexRef.current;
    const actualPausesUsed = pausesUsedRef.current;

    // Stop the section timer to prevent it from running during pause
    setTimerActive(false);

    // Check for mandatory pause
    if (
      config?.pause_mode === "between_sections" &&
      config.pause_sections?.includes(actualCurrentSection)
    ) {
      const pauseDuration = (config.pause_duration_minutes || 5) * 60;
      console.log("⏸️ [PAUSE] Mandatory pause triggered", {
        section: actualCurrentSection,
        sectionIndex: actualCurrentSectionIndex,
        pauseDurationMinutes: config.pause_duration_minutes,
        pauseDurationSeconds: pauseDuration,
        pauseMode: config.pause_mode,
        pauseSections: config.pause_sections,
      });
      setPauseTimeRemaining(pauseDuration);
      setShowPauseScreen(true);
      setTimeout(() => {
        console.log("▶️ [PAUSE] Mandatory pause ended, resuming test", {
          section: actualCurrentSection,
          nextSectionIndex: actualCurrentSectionIndex + 1,
        });
        setShowPauseScreen(false);
        setPauseTimeRemaining(null);
        isCompletingSectionRef.current = false;
        moveToNextSection(actualCurrentSectionIndex);
      }, pauseDuration * 1000);
      return;
    }

    // Check for user choice pause (only if not the last section and pauses remaining)
    if (
      config?.pause_mode === "user_choice" &&
      actualCurrentSectionIndex < sections.length - 1 &&
      actualPausesUsed < (config?.max_pauses || 0)
    ) {
      // IMPORTANT: Reset countdown and ref BEFORE showing the screen
      pauseChoiceMadeRef.current = false;
      showPauseChoiceRef.current = true; // Set ref to persist across StrictMode remounts
      setPauseChoiceCountdown(5);
      setPauseChoiceTrigger((prev) => prev + 1); // Trigger useEffect to start countdown
      setShowPauseChoiceScreen(true);
      // Reset flag when user makes choice
      setTimeout(() => {
        isCompletingSectionRef.current = false;
      }, 500);
      return;
    }

    // No pause - show transition message (if not the last section)
    if (actualCurrentSectionIndex < expectedTotalSections - 1) {
      setShowSectionTransition(true);
      // Reset flag when transition completes
      setTimeout(() => {
        isCompletingSectionRef.current = false;
      }, 500);
      return;
    }

    // Last section - move to completion
    // Reset ref before submitting — if submitTest fails, completeSection must remain callable
    isCompletingSectionRef.current = false;
    moveToNextSection(actualCurrentSectionIndex);
  }

  // handleSectionTransitionComplete, savePauseEventToDatabase, handleTakePause, handleSkipPause
  // — now provided by usePauseManagement hook

  function moveToNextSection(sectionIndexOverride?: number) {
    // Use override if provided (to avoid stale closure issues), otherwise use state
    const currentIndex =
      sectionIndexOverride !== undefined
        ? sectionIndexOverride
        : currentSectionIndex;

    // MACRO SECTION ADAPTIVITY: Check if we just finished a base section and need to add adaptive section
    const useMacroSectionAdaptivity =
      config?.section_order_mode?.includes("macro_sections") &&
      config?.section_adaptivity_config &&
      Object.keys(config.section_adaptivity_config).length > 0;

    if (useMacroSectionAdaptivity) {
      const currentSection = sections[currentIndex];
      const sectionConfig = config!.section_adaptivity_config![currentSection];

      // If we just finished a base section, calculate performance and add next adaptive section
      if (sectionConfig?.type === "base") {
        // Calculate performance in the current (finished) base section
        const currentSectionQuestions = selectedQuestions.filter((q) => {
          const qSection =
            config?.section_order_mode?.includes("macro_sections") &&
            q.macro_section
              ? q.macro_section
              : q.section;
          return qSection === currentSection;
        });

        const answeredQuestions = currentSectionQuestions.filter(
          (q) => answers[q.id]?.answer,
        );
        const correctAnswers = answeredQuestions.filter((q) => {
          const answer = answers[q.id]?.answer;
          return answer === q.correct_answer;
        });

        const percentCorrect =
          answeredQuestions.length > 0
            ? (correctAnswers.length / answeredQuestions.length) * 100
            : 0;

        // Find the next adaptive group in the original config order
        // Look through config.section_order to find the next adaptive group after current base section
        const allConfigSections = config?.section_order || [];
        const currentSectionIndexInConfig =
          allConfigSections.indexOf(currentSection);

        // Find next adaptive group (sections with same prefix but different difficulties)
        let adaptiveSectionToAdd: string | null = null;

        for (
          let i = currentSectionIndexInConfig + 1;
          i < allConfigSections.length;
          i++
        ) {
          const candidateSection = allConfigSections[i];
          const candidateConfig =
            config!.section_adaptivity_config![candidateSection];

          if (candidateConfig?.type === "adaptive") {
            // Found an adaptive section - determine if it's Easy or Hard
            const isHardSection = candidateSection.endsWith("-Hard");
            const isEasySection = candidateSection.endsWith("-Easy");

            if (isHardSection || isEasySection) {
              // Extract group prefix (e.g., "RW2" from "RW2-Easy" or "RW2-Hard")
              const groupPrefix = candidateSection.replace(/-Easy|-Hard$/i, "");

              // Choose Hard if ≥65%, otherwise Easy
              if (percentCorrect >= 65) {
                adaptiveSectionToAdd = `${groupPrefix}-Hard`;
              } else {
                adaptiveSectionToAdd = `${groupPrefix}-Easy`;
              }

              break;
            }
          }
        }

        // Add the adaptive section to the sections array if found
        if (adaptiveSectionToAdd && !sections.includes(adaptiveSectionToAdd)) {
          let insertIndex = currentIndex + 1; // Default: insert right after current section

          // Find the correct insertion position based on config order
          const adaptiveSectionIndexInConfig =
            allConfigSections.indexOf(adaptiveSectionToAdd);
          const newSections = [...sections];

          for (let i = 0; i < newSections.length; i++) {
            const sectionIndexInConfig = allConfigSections.indexOf(
              newSections[i],
            );
            if (sectionIndexInConfig > adaptiveSectionIndexInConfig) {
              insertIndex = i;
              break;
            }
          }

          newSections.splice(insertIndex, 0, adaptiveSectionToAdd);
          setSections(newSections);

          // Move to the newly added adaptive section immediately
          setCurrentSectionIndex(insertIndex);
          setCurrentQuestionIndex(0);
          // Increment globalQuestionOrder since we're moving to a new question
          setGlobalQuestionOrder((prev) => prev + 1);
          setSectionStartTime(new Date());

          // Restart timer for the new adaptive section
          startSectionTimer(adaptiveSectionToAdd);
          return; // Exit early - we've already moved to the next section
        }
      }
    }

    if (currentIndex < sections.length - 1) {
      const nextSectionIndex = currentIndex + 1;
      const nextSection = sections[nextSectionIndex];

      setCurrentSectionIndex(nextSectionIndex);
      setCurrentQuestionIndex(0);
      // Increment globalQuestionOrder since we're moving to a new question (first of next section)
      setGlobalQuestionOrder((prev) => prev + 1);
      setSectionStartTime(new Date());

      // For adaptive mode with per_section base questions: theta capture + algorithm reset + base questions
      const baseQs = prepareBaseQuestionsForSection(
        nextSection,
        sections[currentIndex],
      );
      if (baseQs.length > 0) {
        setSelectedQuestions((prev) => [...prev, ...baseQs]);
      }

      // Restart timer for new section (pass nextSection to avoid stale closure)
      startSectionTimer(nextSection);
    } else {
      // Test complete
      submitTest();
    }
  }

  async function submitTest() {
    // PREVIEW MODE: Don't submit test
    if (isPreviewMode) {
      console.log("Preview mode: Submit blocked");
      return;
    }

    // Prevent double submission
    if (submitting) {
      return;
    }

    // Use refs to get actual current values (avoids stale closure in timer callbacks)
    const actualCurrentQuestionId = currentQuestionIdRef.current;
    const actualGlobalQuestionOrder = globalQuestionOrderRef.current;
    const actualAnswers = answersRef.current;

    console.log("📤 [SUBMIT] submitTest called", {
      stateValues: {
        currentQuestionIndex,
        globalQuestionOrder,
        currentQuestionId: currentQuestion?.id,
        answersCount: Object.keys(answers).length,
      },
      refValues: {
        actualCurrentQuestionId,
        actualGlobalQuestionOrder,
        actualAnswersCount: Object.keys(actualAnswers).length,
      },
      willSaveWithQuestionOrder: actualGlobalQuestionOrder + 1,
      hasAnswer: !!actualAnswers[actualCurrentQuestionId || ""],
      totalAnswersInState: Object.keys(answers).length,
    });

    setSubmitting(true);

    setTimerActive(false);

    // Capture final section theta for GMAT IRT scoring (last section wasn't reset)
    if (
      adaptiveAlgorithm instanceof ComplexAdaptiveAlgorithm &&
      config?.test_type === "GMAT"
    ) {
      const lastSection = sections[currentSectionIndexRef.current];
      if (lastSection && !sectionThetasRef.current[lastSection]) {
        const thetaData = {
          theta: adaptiveAlgorithm.getFinalTheta(),
          se: adaptiveAlgorithm.getFinalSE(),
        };
        sectionThetasRef.current = {
          ...sectionThetasRef.current,
          [lastSection]: thetaData,
        };
      }
    }

<<<<<<< HEAD
    // Flush ALL answers from state to DB before completing
    // Prevents data loss from failed auto-saves (network issues, sidebar navigation, etc.)
    const answerEntries = Object.entries(actualAnswers);
    console.log('📤 [SUBMIT] Flushing all answers to DB', {
      totalInState: answerEntries.length,
      currentQuestionId: actualCurrentQuestionId?.substring(0, 8)
    });

    if (answerEntries.length > 0) {
      // Derive question order from position in selectedQuestions
      const questionOrderMap = new Map<string, number>();
      selectedQuestions.forEach((q, idx) => { questionOrderMap.set(q.id, idx + 1); });

      const savePromises = answerEntries.map(([questionId, answerData]) =>
        saveAnswer(
          questionId,
          answerData,
          answerData?.flagged || false,
          0,
          questionOrderMap.get(questionId)
        ).catch(err => {
          console.warn('⚠️ [SUBMIT] Failed to save answer', questionId.substring(0, 8), err);
          return false;
        })
      );

      const results = await Promise.all(savePromises);
      const saved = results.filter(Boolean).length;
      console.log(`📤 [SUBMIT] Flushed ${saved}/${answerEntries.length} answers`);
    }

    // Mark test as completed in database with completion_details
    // Safety: if submission takes longer than 30s, force-show completion screen
    // This prevents students from being stuck on "Submitting..." overlay forever
    const submissionTimeout = setTimeout(() => {
      console.warn(
        "⚠️ [SUBMIT] Submission timed out after 30s — forcing completion screen",
      );
      setShowCompletionScreen(true);
      setSubmitting(false);
    }, 30000);

    try {
      if (isGmatMode) {
        // GMAT mode: save to 2V_gmat_assessment_results, skip 2V_test_assignments
        await saveGmatResult();
        clearProgress();
      } else {
        // Standard mode: save completion details to 2V_test_assignments
        const success = await saveCompletionDetails("completed", "submitted");

        if (!success) {
          console.error(
            "❌ [SUBMIT] saveCompletionDetails returned false — showing completion screen anyway",
          );
          // Don't throw — still show completion screen. The answers are already saved individually.
        }

        // For GMAT tests routed through assignments, track seen questions
        if (
          config?.test_type === "GMAT" &&
          studentId &&
          allQuestions.length > 0
        ) {
          try {
            const questionIds = allQuestions.map((q) => q.id);
            await addSeenQuestions(studentId, questionIds);
            console.log(
              "✅ Added seen questions to GMAT progress:",
              questionIds.length,
            );
          } catch (seenErr) {
            // Non-critical error - log but don't block completion
            console.error("Failed to track seen questions:", seenErr);
          }
        }
      }

      // Clear crash-recovery state now that submission succeeded
      clearProgress();

      // Show completion screen
      clearTimeout(submissionTimeout);
      setShowCompletionScreen(true);
      setSubmitting(false);
    } catch (err) {
      clearTimeout(submissionTimeout);
      console.error("❌ [SUBMIT] Error during submission:", err);
      // Still show completion screen — individual answers were already saved
      setShowCompletionScreen(true);
      setSubmitting(false);
    }
  }

  // formatTime — now imported from useTestTimer hook

  // checkMultipleScreens, enterFullscreen → moved to useTestProctoring hook
  // saveCompletionDetails → extracted to useSaveCompletionDetails hook

  // annulTest, handleStayInTest, handleConfirmExit → moved to useTestProctoring hook

  // Register all callbacks in one effect after all functions are defined
  useEffect(() => {
    registerCallbacks({
      handleTimeUp,
      completeSection,
      moveToNextSection,
      onAnnulTest: (reason) => {
        if (isGmatMode) return; // GMAT has no assignment row to annul
        const annulmentReason =
          reason === "multiple_screens"
            ? "multiple_screens_detected"
            : "exited_fullscreen";
        saveCompletionDetails("annulled", reason, annulmentReason);
      },
    });
  }, [
    handleTimeUp,
    completeSection,
    moveToNextSection,
    saveCompletionDetails,
    registerCallbacks,
  ]);

  // Wait until all critical state is loaded to prevent race condition
  // where sections is set to ['All Questions'] but config is not yet loaded,
  // causing the filter to incorrectly return 0 questions
  // Note: In 'no_sections' mode, sections array is intentionally empty - that's valid
  if (
    loading ||
    !config ||
    (config.section_order_mode !== "no_sections" && sections.length === 0)
  ) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t("takeTest.loading")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Test Locked Screen (completed tests are auto-locked)
  if (isLocked) {
    return <TestLockedScreen onBackToHome={() => navigate("/student/home")} />;
  }

  // Test Annulled Screen
  if (testAnnulled) {
    return (
      <TestAnnulledScreen
        multipleScreensDetected={multipleScreensDetected}
        onBackToSelection={() => {
          if (config?.test_type) {
            navigate(`/student/home?test=${config.test_type}`);
          } else {
            navigate("/student/home");
          }
        }}
      />
    );
  }

  // Exit Warning Screen (5-second countdown)
  if (showExitWarning) {
    return (
      <ExitWarningScreen
        exitCountdown={exitCountdown}
        onConfirmExit={handleConfirmExit}
        onStayInTest={handleStayInTest}
      />
    );
  }

  // Start Screen
  if (showStartScreen && config) {
    return (
      <>
        <TestStartScreen
          config={config}
          onCancel={() => navigate(-1)}
          onStart={startTest}
          onDiagnosticsComplete={(results) => setDeviceDiagnostics(results)}
        />
        {/* Resume modal — overlays the start screen when saved progress exists */}
        {showResumeModal && savedProgress && (() => {
          const answeredCount = savedProgress.answers.filter(([, a]) => a.answer !== null && a.answer !== '' && a.answer !== '__UNANSWERED__').length;
          const savedSection = savedProgress.currentSectionIndex !== undefined ? sections[savedProgress.currentSectionIndex] : null;
          const savedAt = new Date(savedProgress.savedAt);
          const savedAtStr = savedAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
          const timeLeft = savedProgress.timeRemaining;
          const timeLeftStr = timeLeft !== null ? formatTime(timeLeft) : null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('takeTest.resumeTitle', 'Resume previous session?')}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t('takeTest.resumeSavedAt', 'Saved on')} {savedAtStr}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('takeTest.resumeAnswered', 'Questions answered')}</span>
                    <span className="font-medium text-gray-800">{answeredCount}</span>
                  </div>
                  {savedSection && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('takeTest.resumeSection', 'Section')}</span>
                      <span className="font-medium text-gray-800">{formatSectionNameBound(savedSection)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('takeTest.resumeQuestion', 'Question')}</span>
                    <span className="font-medium text-gray-800">{savedProgress.currentIndex + 1}</span>
                  </div>
                  {timeLeftStr && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('takeTest.resumeTimeLeft', 'Time remaining')}</span>
                      <span className="font-medium text-gray-800">{timeLeftStr}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      // NOTE: do NOT restore answers from localStorage here — loadTestData already
                      // loaded the full, properly-typed answers from the DB. Overwriting with the
                      // shallow localStorage copy (which lacks msrAnswers, blank1/2, etc.) would
                      // corrupt the state.
                      if (savedProgress.currentSectionIndex !== undefined) {
                        setCurrentSectionIndex(savedProgress.currentSectionIndex);
                      }
                      setCurrentQuestionIndex(savedProgress.currentIndex);
                      if (savedProgress.timeRemaining !== null) {
                        resumeTimeRef.current = savedProgress.timeRemaining;
                      }
                      isResumingRef.current = true;
                      setShowResumeModal(false);
                      startTest();
                    }}
                  >
                    {t('takeTest.resumeYes', 'Resume')}
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      clearProgress();
                      setShowResumeModal(false);
                    }}
                  >
                    {t('takeTest.resumeNo', 'Start fresh')}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </>
    );
  }

  // Section Selection Screen (for user_choice mode)
  if (showSectionSelectionScreen && config) {
    // Pre-compute question counts per section for the component
    const questionCountBySection: Record<string, number> = {};
    userSelectedSections.forEach((section) => {
      questionCountBySection[section] = allQuestions.filter(
        (q) => getSectionField(q, config) === section,
      ).length;
    });

    return (
      <SectionSelectionScreen
        config={config}
        sections={userSelectedSections}
        draggedSectionIndex={draggedSectionIndex}
        hasSpecialNeeds={hasSpecialNeeds}
        questionCountBySection={questionCountBySection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onMoveSectionUp={moveSectionUp}
        onMoveSectionDown={moveSectionDown}
        onBack={() => {
          setShowSectionSelectionScreen(false);
          setShowStartScreen(true);
        }}
        onBegin={beginTestWithSelectedSections}
      />
    );
  }

  // Section Transition Screen
  if (showSectionTransition) {
    const nextSectionIndex = currentSectionIndex + 1;
    let nextSection = sections[nextSectionIndex];

    // MACRO SECTION ADAPTIVITY: If current section is a base section,
    // predict which adaptive section will be added (based on current performance)
    const useMacroSectionAdaptivity =
      config?.section_order_mode?.includes("macro_sections") &&
      config?.section_adaptivity_config &&
      Object.keys(config.section_adaptivity_config).length > 0;

    if (
      useMacroSectionAdaptivity &&
      config?.section_adaptivity_config?.[currentSection]?.type === "base"
    ) {
      // Calculate performance to predict Easy vs Hard
      const currentSectionQuestions = selectedQuestions.filter((q) => {
        const qSection =
          config?.section_order_mode?.includes("macro_sections") &&
          q.macro_section
            ? q.macro_section
            : q.section;
        return qSection === currentSection;
      });

      const answeredQuestions = currentSectionQuestions.filter(
        (q) => answers[q.id]?.answer,
      );
      const correctAnswers = answeredQuestions.filter((q) => {
        const answer = answers[q.id]?.answer;
        return answer === q.correct_answer;
      });

      const percentCorrect =
        answeredQuestions.length > 0
          ? (correctAnswers.length / answeredQuestions.length) * 100
          : 0;

      // Find next adaptive group in config
      const allConfigSections = config?.section_order || [];
      const currentSectionIndexInConfig =
        allConfigSections.indexOf(currentSection);

      for (
        let i = currentSectionIndexInConfig + 1;
        i < allConfigSections.length;
        i++
      ) {
        const candidateSection = allConfigSections[i];
        const candidateConfig =
          config!.section_adaptivity_config![candidateSection];

        if (candidateConfig?.type === "adaptive") {
          const isHardSection = candidateSection.endsWith("-Hard");
          const isEasySection = candidateSection.endsWith("-Easy");

          if (isHardSection || isEasySection) {
            const groupPrefix = candidateSection.replace(/-Easy|-Hard$/i, "");
            // Choose Hard if ≥65%, otherwise Easy
            nextSection =
              percentCorrect >= 65
                ? `${groupPrefix}-Hard`
                : `${groupPrefix}-Easy`;
            break;
          }
        }
      }
    }

    return (
      <SectionCompleted
        completedSectionName={formatSectionNameBound(currentSection)}
        nextSectionName={formatSectionNameBound(nextSection)}
        countdown={sectionTransitionCountdown}
        onContinue={() => handleSectionTransitionComplete()}
        isLoading={isTransitioning}
        disabled={sectionTransitionCountdown <= 1}
      />
    );
  }

  // Pause Choice Screen (for user_choice mode)
  // Use ref to persist across StrictMode remounts
  const shouldShowPauseChoice =
    showPauseChoiceScreen || showPauseChoiceRef.current;
  if (shouldShowPauseChoice) {
    return (
      <PauseChoice
        completedSectionName={formatSectionNameBound(currentSection)}
        pausesRemaining={(config?.max_pauses || 0) - pausesUsed}
        pauseDurationMinutes={config?.pause_duration_minutes || 5}
        countdown={pauseChoiceCountdown}
        onTakePause={handleTakePause}
        onSkipPause={() => handleSkipPause()}
        disabled={pauseChoiceCountdown <= 1}
      />
    );
  }

  // Pause Screen
  if (showPauseScreen) {
    return (
      <PauseScreen
        sectionName={formatSectionNameBound(currentSection)}
        timeRemaining={pauseTimeRemaining}
        isMandatory={config?.pause_mode !== "user_choice"}
      />
    );
  }

  // Completion Screen
  if (showCompletionScreen) {
    return (
      <Layout>
        <TestCompleted onReturnToDashboard={() => navigate("/student/home")} />
      </Layout>
    );
  }

  // PDF Test Interface
  if (isPDFTest && !showStartScreen && !showCompletionScreen) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header with Timer and Section Info */}
        <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Preview Mode Exit Button */}
            {isPreviewMode && (
              <>
                <button
                  onClick={() => {
                    const currentQ =
                      currentQuestion?.question_number || previewStartQuestion;
                    navigate("/admin/review-questions", {
                      state: {
                        selectedTestId: previewTestId,
                        scrollToQuestion: currentQ,
                      },
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center gap-2"
                  title="Exit preview and return to review page"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Exit Preview
                </button>
                {/* Language Toggle in Preview */}
                <button
                  onClick={() => {
                    const newLang = testLanguage === "it" ? "en" : "it";
                    setTestLanguage(newLang);
                    i18n.changeLanguage(newLang);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm"
                  title="Toggle language"
                >
                  {testLanguage === "it" ? "🇮🇹 → 🇬🇧" : "🇬🇧 → 🇮🇹"}
                </button>
              </>
            )}
            <div>
              <h2 className="text-xl font-bold text-brand-dark">
                {isPreviewMode && "🔍 PREVIEW MODE - "}
                {formatSectionNameBound(currentSection)}
              </h2>
              <p className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {expectedTotalSections}
              </p>
            </div>
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg">
              <FontAwesomeIcon icon={faClock} className="text-brand-green" />
              <span
                className={`font-mono font-bold ${timeRemaining < 300 ? "text-red-600" : "text-gray-800"}`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
          {/* Guided Mode Indicator for PDF tests */}
          {isGuidedMode && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                <span>🎓</span>
                <span>Guided</span>
                {!guidedTimed && (
                  <span className="text-purple-500">• No limit</span>
                )}
              </div>
              {/* Toggle Show/Hide Answers */}
              <button
                onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  showCorrectAnswers
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300"
                }`}
              >
                {showCorrectAnswers ? "👁️ Hide" : "👁️ Show"}
              </button>
            </div>
          )}
        </div>

        {/* PDF Test View */}
        <div className="flex-1 overflow-hidden">
          <PDFTestView
            questions={
              sectionQuestions.filter(
                (q) =>
                  typeof q.question_data.pdf_url === "string" &&
                  typeof q.question_data.page_number === "number",
              ) as any
            }
            currentPageGroup={currentPageGroup}
            answers={answers}
            showCorrectAnswers={isGuidedMode && showCorrectAnswers}
            onAnswer={(questionId, answer) => {
              // Extra safety: reject if time has expired
              if (timeRemaining !== null && timeRemaining <= 0) {
                return;
              }
              setAnswers((prev) => ({
                ...prev,
                [questionId]: {
                  questionId,
                  answer,
                  timeSpent: 0,
                  flagged: prev[questionId]?.flagged || false,
                },
              }));
            }}
            onNext={async () => {
              // Extra safety: reject if time has expired
              if (timeRemaining !== null && timeRemaining <= 0) {
                return;
              }

              // Save all answers on current page before moving
              for (let i = 0; i < sectionQuestions.length; i++) {
                const question = sectionQuestions[i];
                if (answers[question.id]) {
                  await saveAnswer(
                    question.id,
                    answers[question.id],
                    answers[question.id].flagged,
                    0,
                    i + 1,
                  );
                }
              }

              // Check if we need to move to next section
              const pageGroups: Record<number, any[]> = {};
              sectionQuestions.forEach((q) => {
                const pageNum = q.question_data.page_number;
                if (typeof pageNum === "number") {
                  if (!pageGroups[pageNum]) pageGroups[pageNum] = [];
                  pageGroups[pageNum].push(q);
                }
              });
              const totalPageGroups = Object.keys(pageGroups).length;

              if (currentPageGroup < totalPageGroups - 1) {
                // Move to next page group
                setCurrentPageGroup(currentPageGroup + 1);
              } else {
                // Last page of section - complete section (with transition)
                setCurrentPageGroup(0); // Reset for next section
                if (currentSectionIndex < sections.length - 1) {
                  completeSection(); // This will show transition screen
                } else {
                  // Test complete
                  await submitTest();
                }
              }
            }}
            onPrevious={() => {
              if (currentPageGroup > 0) {
                setCurrentPageGroup(currentPageGroup - 1);
              }
            }}
            canGoNext={true}
            canGoPrevious={currentPageGroup > 0}
            timeRemaining={timeRemaining}
          />
        </div>
      </div>
    );
  }

  // Main Test Interface
  return (
    <MathJaxProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header with Timer */}
        <TestHeader
          currentSection={currentSection}
          currentQuestionIndex={currentQuestionIndex}
          sectionQuestionLimit={sectionQuestionLimit}
          formatSectionName={formatSectionNameBound}
          sectionOrderMode={config?.section_order_mode}
          maxAnswerChanges={config?.max_answer_changes}
          timeRemaining={timeRemaining}
          currentQuestionSection={currentQuestion?.section}
          isSaving={isSaving}
          saveError={saveError}
          deviceDiagnostics={deviceDiagnostics}
          isInReviewMode={isInReviewMode}
          answerChangesUsed={answerChangesUsed}
          currentSectionIndex={currentSectionIndex}
          expectedTotalSections={expectedTotalSections}
          isPreviewMode={isPreviewMode}
          previewTestId={previewTestId}
          previewStartQuestion={previewStartQuestion}
          currentQuestionNumber={currentQuestion?.question_number}
          testLanguage={testLanguage}
          onExitPreview={() => {
            const currentQ =
              currentQuestion?.question_number || previewStartQuestion;
            navigate("/admin/review-questions", {
              state: {
                selectedTestId: previewTestId,
                scrollToQuestion: currentQ,
              },
            });
          }}
          onToggleLanguage={() => {
            const newLang = testLanguage === "it" ? "en" : "it";
            setTestLanguage(newLang);
            i18n.changeLanguage(newLang);
          }}
          isGuidedMode={isGuidedMode}
          guidedTimed={guidedTimed}
          showCorrectAnswers={showCorrectAnswers}
          onToggleCorrectAnswers={() =>
            setShowCorrectAnswers(!showCorrectAnswers)
          }
          questionsPerPage={config?.questions_per_page}
        />

        {/* Question Content */}
        <div
          className={`flex-1 overflow-y-auto ${currentQuestion?.question_data?.passage_text ? "p-4" : "p-6"}`}
        >
          {/* Multi-Question Page View */}
          {isMultiQuestionPage ? (
            <div className="max-w-4xl mx-auto">
              <MultiQuestionView
                questions={currentPageQuestions}
                answers={answers}
                currentSection={currentSection}
                testLanguage={testLanguage}
                bookmarkedQuestions={bookmarkedQuestions}
                timeRemaining={timeRemaining}
                allowBookmarks={config?.allow_bookmarks}
                isGuidedMode={isGuidedMode}
                showCorrectAnswers={showCorrectAnswers}
                isPreviewMode={isPreviewMode}
                onAnswerChange={(questionId, answer) => {
                  setAnswers((prev) => ({
                    ...prev,
                    [questionId]: { ...prev[questionId], ...answer },
                  }));
                }}
                onToggleBookmark={toggleBookmark}
                toUnifiedAnswer={toUnifiedAnswer}
                startIndex={currentPageStartIndex}
              />
            </div>
          ) : (
            <div
              key={currentQuestion?.id || currentQuestionIndex}
              className={`${currentQuestion?.question_data?.passage_text ? "max-w-7xl" : "max-w-4xl"} mx-auto bg-white rounded-2xl shadow-lg ${currentQuestion?.question_data?.passage_text ? "p-6" : "p-8"}`}
            >
              {/* Question Text */}
              <div className="mb-8">
                <div className="flex items-start justify-end gap-2 mb-4">
                  {/* Bookmark Button (GMAT-style) */}
                  {config?.allow_bookmarks && currentQuestion?.id && (
                    <button
                      onClick={() => toggleBookmark(currentQuestion.id)}
                      disabled={timeRemaining !== null && timeRemaining <= 1}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        bookmarkedQuestions.has(currentQuestion.id)
                          ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-400"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                      {bookmarkedQuestions.has(currentQuestion.id)
                        ? t("takeTest.bookmarked") || "Bookmarked"
                        : t("takeTest.bookmark") || "Bookmark"}
                    </button>
                  )}
                </div>

                {/* All question formats routed through QuestionRenderer */}
                {currentQuestion &&
                  (() => {
                    const isEnglishSection = currentSection
                      ?.toLowerCase()
                      .includes("inglese");
                    const rendererLanguage: "it" | "en" =
                      testLanguage === "en" || isEnglishSection ? "en" : "it";

                    return (
                      <QuestionRenderer
                        question={{
                          id: currentQuestion.id,
                          question_type: currentQuestion.question_type,
                          question_data: currentQuestion.question_data,
                          answers: currentQuestion.answers,
                          answer_a: currentQuestion.answer_a,
                          answer_b: currentQuestion.answer_b,
                          answer_c: currentQuestion.answer_c,
                          answer_d: currentQuestion.answer_d,
                          answer_e: currentQuestion.answer_e,
                          question_text: currentQuestion.question_text,
                        }}
                        currentAnswer={toUnifiedAnswer(
                          answers[currentQuestion.id],
                        )}
                        onAnswerChange={handleRendererAnswerChange}
                        language={rendererLanguage}
                        showResults={
                          (isGuidedMode && showCorrectAnswers) || isPreviewMode
                        }
                      />
                    );
                  })()}
              </div>

              {/* Report Issue Button - subtle link at bottom */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <button
                  onClick={toggleFlag}
                  disabled={timeRemaining !== null && timeRemaining <= 1}
                  className={`text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    answers[currentQuestion?.id]?.flagged
                      ? "text-orange-600 font-medium"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FontAwesomeIcon icon={faFlag} className="mr-1" />
                  {answers[currentQuestion?.id]?.flagged
                    ? t("takeTest.issueReported")
                    : t("takeTest.reportIssue")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls with Question Numbers */}
        <NavigationControls
          currentSectionIndex={currentSectionIndex}
          currentQuestionIndex={currentQuestionIndex}
          expectedTotalSections={expectedTotalSections}
          sectionQuestionLimit={sectionQuestionLimit}
          totalQuestionsInSection={totalQuestionsInSection}
          totalQuestions={allQuestions.length}
          isInReviewMode={isInReviewMode}
          isPreviewMode={isPreviewMode}
          isTransitioning={isTransitioning}
          submitting={submitting}
          adaptivityMode={config?.adaptivity_mode}
          timeRemaining={timeRemaining}
          canGoBack={canGoBack()}
          answeredQuestions={
            new Set(
              sectionQuestions
                .map((q, idx) => ({
                  idx,
                  answered: !!(
                    answers[q.id]?.answer ||
                    answers[q.id]?.msrAnswers?.length ||
                    answers[q.id]?.blank1 ||
                    answers[q.id]?.taAnswers ||
                    answers[q.id]?.column1
                  ),
                }))
                .filter((x) => x.answered)
                .map((x) => x.idx),
            )
          }
          questionsPerPage={questionsPerPage}
          currentPageIndex={currentPageIndex}
          onPrevious={goToPreviousQuestion}
          onNext={goToNextQuestion}
          onReturnToReview={returnToReviewScreen}
        />

        {/* Review Screen Overlay */}
        <ReviewScreen
          isOpen={showReviewScreen}
          questions={sectionQuestions.map((q, idx) => ({
            id: q.id,
            questionNumber: idx + 1,
            isAnswered: !!(
              answers[q.id]?.answer ||
              answers[q.id]?.msrAnswers ||
              answers[q.id]?.blank1 ||
              answers[q.id]?.taAnswers ||
              answers[q.id]?.column1
            ),
            isBookmarked: bookmarkedQuestions.has(q.id),
          }))}
          onQuestionClick={(index: number, _questionId: string) =>
            goToQuestionFromReview(index)
          }
          onComplete={completeReview}
          isLastSection={currentSectionIndex >= expectedTotalSections - 1}
          disabled={timeRemaining !== null && timeRemaining <= 1}
          maxChanges={config?.max_answer_changes}
          changesUsed={answerChangesUsed}
        />

        <ChangeBlockedToast visible={showChangeBlockedMessage} />
        <AnswerRequiredModal
          visible={showAnswerRequiredMessage}
          isPartialAnswer={isPartialAnswer}
          onClose={() => setShowAnswerRequiredMessage(false)}
        />
        <SubmittingOverlay visible={submitting} />
      </div>
<<<<<<< HEAD

      {/* Navigation Controls with Question Numbers */}
      <NavigationControls
        currentSectionIndex={currentSectionIndex}
        currentQuestionIndex={currentQuestionIndex}
        expectedTotalSections={expectedTotalSections}
        sectionQuestionLimit={sectionQuestionLimit}
        totalQuestionsInSection={totalQuestionsInSection}
        totalQuestions={allQuestions.length}
        isInReviewMode={isInReviewMode}
        isPreviewMode={isPreviewMode}
        isTransitioning={isTransitioning}
        submitting={submitting}
        adaptivityMode={config?.adaptivity_mode}
        timeRemaining={timeRemaining}
        canGoBack={canGoBack()}
        answeredQuestions={new Set(
          sectionQuestions
            .map((q, idx) => ({ idx, answered: !!(answers[q.id]?.answer || answers[q.id]?.msrAnswers?.length || answers[q.id]?.blank1 || answers[q.id]?.taAnswers || answers[q.id]?.column1) }))
            .filter(x => x.answered)
            .map(x => x.idx)
        )}
        onNavigateToQuestion={undefined}
        questionsPerPage={questionsPerPage}
        currentPageIndex={currentPageIndex}
        onPrevious={goToPreviousQuestion}
        onNext={goToNextQuestion}
        onReturnToReview={returnToReviewScreen}
      />

      {/* Review Screen Overlay */}
      <ReviewScreen
        isOpen={showReviewScreen}
        questions={currentSectionQuestionsList.map((q, idx) => ({
          id: q.id,
          questionNumber: idx + 1,
          isAnswered: !!(answers[q.id]?.answer || answers[q.id]?.msrAnswers || answers[q.id]?.blank1 || answers[q.id]?.taAnswers || answers[q.id]?.column1),
          isBookmarked: bookmarkedQuestions.has(q.id),
        }))}
        onQuestionClick={(index: number, _questionId: string) => goToQuestionFromReview(index)}
        onComplete={completeReview}
        isLastSection={currentSectionIndex >= expectedTotalSections - 1}
        disabled={timeRemaining !== null && timeRemaining <= 1}
        maxChanges={config?.max_answer_changes}
        changesUsed={answerChangesUsed}
      />

      {/* Change Blocked Toast (when max changes reached) */}
      {showChangeBlockedMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">{t('takeTest.maxChangesReached') || 'Maximum changes reached'}</p>
              <p className="text-sm">
                {t('takeTest.cannotChangeMore') || 'You cannot change any more answers in this section'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Answer Required Modal Overlay */}
      {showAnswerRequiredMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-600 mb-4">
              {t('takeTest.answerRequired')}
            </h3>
            <p className="text-gray-700 mb-6">
              {isPartialAnswer
                ? t('takeTest.mustCompleteAllParts')
                : t('takeTest.mustAnswerQuestion')
              }
            </p>
            <button
              onClick={() => setShowAnswerRequiredMessage(false)}
              className="px-8 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* Submitting Test Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <FontAwesomeIcon icon={faClock} className="text-6xl text-brand-green animate-spin mb-4" />
            <h3 className="text-xl font-bold text-brand-dark mb-2">
              {t('takeTest.submittingTest') || 'Submitting Test...'}
            </h3>
            <p className="text-gray-600">
              {t('takeTest.pleaseWait') || 'Please wait while we save your answers...'}
            </p>
          </div>
        </div>
      )}
    </MathJaxProvider>
  );
}

export default function TakeTestPage() {
  return (
    <TestContextProvider>
      <TakeTestPageInner />
    </TestContextProvider>
  );
}
