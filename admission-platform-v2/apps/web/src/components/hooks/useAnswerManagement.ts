/**
 * useAnswerManagement Hook
 *
 * Extracts answer-related operations and UI state from TakeTestPage.
 * Core state (answers, studentId, currentAttempt, globalQuestionOrder) remains
 * in the parent because loadTestData/goToNextQuestion need to set them directly.
 *
 * This hook owns:
 * - Save operations (saveAnswer with retry + network timeout)
 * - Answer update with review mode change tracking (updateAnswer)
 * - Answer format adapters (handleRendererAnswerChange, handleAnswerSelect, toUnifiedAnswer)
 * - DI answer checking helpers (MSR, GI, TA, TPA)
 * - UI flags (isSaving, saveError, showAnswerRequired, showChangeBlocked)
 * - Auto-save debouncing
 * - Network connection monitoring
 * - Question time tracking
 * - Beforeunload handler
 * - Refs that sync from parent state (to avoid stale closures in timer callbacks)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { UnifiedAnswer } from '../test/QuestionRenderer';

// Re-export for convenience — TakeTestPage defines the canonical types,
// but the hook needs them for function signatures.
// We use generic interfaces here so the hook doesn't import from TakeTestPage.

export interface AnswerManagementQuestion {
  id: string;
  question_type: string;
  correct_answer?: string;
  question_data: {
    di_type?: 'DS' | 'MSR' | 'TPA' | 'GI' | 'TA';
    questions?: Array<{ text: string; options: Record<string, string>; question_type: string; correct_answer: string }>;
    statements?: Array<{ text: string; is_true: boolean }>;
    [key: string]: unknown;
  };
  answers: {
    correct_answer: string[];
    wrong_answers: string[];
  };
}

export interface AnswerManagementStudentAnswer {
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

// JSONB answer format for database storage
type JsonbAnswer =
  | { answers: string[] }
  | { answers: { part1: string | null; part2: string | null } }
  | { answers: Record<number, 'true' | 'false'> }
  | { answer: string | null };

interface AdaptiveAlgorithm {
  recordResponse: (question: AnswerManagementQuestion, isCorrect: boolean) => void;
}

// Supabase client type (minimal interface)
interface SupabaseClient {
  from: (table: string) => any;
}

// ─── Hook Options ────────────────────────────────────────────────────────────

export interface UseAnswerManagementOptions {
  // Core state from parent (not owned by this hook)
  answers: Record<string, AnswerManagementStudentAnswer>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, AnswerManagementStudentAnswer>>>;
  currentQuestion: AnswerManagementQuestion | null;
  currentQuestionIndex: number;
  globalQuestionOrder: number;
  studentId: string | null;
  currentAttempt: number;

  // Config
  config: { adaptivity_mode?: string; max_answer_changes?: number } | null;
  timeRemaining: number | null;
  isTransitioning: boolean;
  isPreviewMode: boolean;
  isTestMode: boolean;
  isGuidedMode: boolean;
  guidedTimed: boolean;
  assignmentId: string | undefined;
  adaptiveAlgorithm: AdaptiveAlgorithm | null;
  db: SupabaseClient;

  // Review mode (from useReviewMode or parent state)
  isInReviewMode: boolean;
  answerChangesUsed: number;
  setAnswerChangesUsed: React.Dispatch<React.SetStateAction<number>>;
}

export interface UseAnswerManagementReturn {
  // UI state (owned by this hook)
  isSaving: boolean;
  saveError: string | null;
  setSaveError: React.Dispatch<React.SetStateAction<string | null>>;
  showAnswerRequiredMessage: boolean;
  setShowAnswerRequiredMessage: React.Dispatch<React.SetStateAction<boolean>>;
  isPartialAnswer: boolean;
  setIsPartialAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  showChangeBlockedMessage: boolean;
  setShowChangeBlockedMessage: React.Dispatch<React.SetStateAction<boolean>>;
  questionStartTimes: Record<string, Date>;
  setQuestionStartTimes: React.Dispatch<React.SetStateAction<Record<string, Date>>>;
  sectionTimes: Record<string, number>;
  setSectionTimes: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  // Operations
  updateAnswer: (questionId: string, updater: (prev: AnswerManagementStudentAnswer | undefined) => AnswerManagementStudentAnswer) => void;
  saveAnswer: (questionId: string, answerData: AnswerManagementStudentAnswer, isFlagged?: boolean, retryCount?: number, questionOrder?: number) => Promise<boolean>;
  handleAnswerSelect: (answer: string) => void;
  handleRendererAnswerChange: (questionId: string, unified: UnifiedAnswer) => void;
  toUnifiedAnswer: (sa: AnswerManagementStudentAnswer | undefined) => UnifiedAnswer;
  toggleFlag: () => void;

  // Refs (needed by other parts of TakeTestPage for stale closure avoidance)
  savingInProgressRef: React.MutableRefObject<Map<string, Promise<boolean>>>;
  autoSaveTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  answersRef: React.MutableRefObject<Record<string, AnswerManagementStudentAnswer>>;
  currentAttemptRef: React.MutableRefObject<number>;
  globalQuestionOrderRef: React.MutableRefObject<number>;
  currentQuestionIdRef: React.MutableRefObject<string | null>;
  questionStartTimesRef: React.MutableRefObject<Record<string, Date>>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAnswerManagement({
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
  assignmentId,
  adaptiveAlgorithm,
  db,
  isInReviewMode,
  answerChangesUsed,
  setAnswerChangesUsed,
}: UseAnswerManagementOptions): UseAnswerManagementReturn {
  // ─── UI State (owned by this hook) ─────────────────────────────────────────
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, Date>>({});
  const [sectionTimes, setSectionTimes] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAnswerRequiredMessage, setShowAnswerRequiredMessage] = useState(false);
  const [isPartialAnswer, setIsPartialAnswer] = useState(false);
  const [showChangeBlockedMessage, setShowChangeBlockedMessage] = useState(false);

  // ─── Refs (sync from parent state for stale closure avoidance) ─────────────
  const savingInProgressRef = useRef<Map<string, Promise<boolean>>>(new Map());
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionIdRef = useRef<string | null>(null);
  const globalQuestionOrderRef = useRef<number>(0);
  const currentAttemptRef = useRef<number>(1);
  const questionStartTimesRef = useRef<Record<string, Date>>({});
  const answersRef = useRef<Record<string, AnswerManagementStudentAnswer>>({});

  // ─── Ref Sync Effects ──────────────────────────────────────────────────────
  useEffect(() => { currentQuestionIdRef.current = currentQuestion?.id || null; }, [currentQuestion?.id]);
  useEffect(() => { globalQuestionOrderRef.current = globalQuestionOrder; }, [globalQuestionOrder]);
  useEffect(() => { currentAttemptRef.current = currentAttempt; }, [currentAttempt]);
  useEffect(() => { questionStartTimesRef.current = questionStartTimes; }, [questionStartTimes]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // ─── Track question start time ────────────────────────────────────────────
  // Reset start time whenever the question index changes (not just the ID).
  // This handles the case where a student navigates away and back to the same
  // question in back_forward mode — the previous save deletes the start time,
  // and we need a fresh timestamp for the new visit.
  useEffect(() => {
    if (currentQuestion?.id) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestion.id]: new Date()
      }));
    }
  }, [currentQuestion?.id, currentQuestionIndex]);

  // ─── Network connection monitor ───────────────────────────────────────────
  useEffect(() => {
    if (!saveError?.includes('internet')) return;

    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const startTime = Date.now();

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          if (responseTime > 1500) {
            setSaveError('🐢 Connessione lenta');
          } else {
            setSaveError('✅ Sei di nuovo online');
            setTimeout(() => setSaveError(null), 5000);
          }
        }
      } catch {
        console.log('🔴 Still offline');
      }
    };

    checkConnection();
    const intervalId = setInterval(checkConnection, 2000);
    return () => clearInterval(intervalId);
  }, [saveError]);

  // ─── Auto-save debounce ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion?.id) return;

    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer) return;

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

    const timeoutId = setTimeout(() => {
      const flaggedStatus = currentAnswer.flagged || false;
      saveAnswer(currentQuestion.id, currentAnswer, flaggedStatus, 0, globalQuestionOrder + 1);
      autoSaveTimeoutRef.current = null;
    }, 1000);

    autoSaveTimeoutRef.current = timeoutId;

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, [answers, currentQuestion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Beforeunload handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (currentQuestion?.id) {
        await saveAnswer(
          currentQuestion.id,
          answers[currentQuestion.id] || { questionId: currentQuestion.id, answer: null, timeSpent: 0, flagged: false },
          answers[currentQuestion.id]?.flagged || false,
          0,
          currentQuestionIndex + 1
        );
      }
      sessionStorage.removeItem(`test_session_${assignmentId}`);
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentQuestion, answers, assignmentId, studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── updateAnswer ─────────────────────────────────────────────────────────
  const updateAnswer = useCallback((questionId: string, updater: (prev: AnswerManagementStudentAnswer | undefined) => AnswerManagementStudentAnswer) => {
    if (isInReviewMode && config?.max_answer_changes !== undefined && (config.max_answer_changes as number) > 0) {
      const currentAnswer = answers[questionId];
      const newAnswer = updater(currentAnswer);

      const isDifferentFromCurrent = JSON.stringify(currentAnswer?.answer) !== JSON.stringify(newAnswer?.answer) ||
        JSON.stringify(currentAnswer?.msrAnswers) !== JSON.stringify(newAnswer?.msrAnswers) ||
        currentAnswer?.blank1 !== newAnswer?.blank1 ||
        currentAnswer?.blank2 !== newAnswer?.blank2 ||
        JSON.stringify(currentAnswer?.taAnswers) !== JSON.stringify(newAnswer?.taAnswers) ||
        currentAnswer?.column1 !== newAnswer?.column1 ||
        currentAnswer?.column2 !== newAnswer?.column2;

      if (!isDifferentFromCurrent) return;

      if (answerChangesUsed >= (config.max_answer_changes as number)) {
        setShowChangeBlockedMessage(true);
        setTimeout(() => setShowChangeBlockedMessage(false), 3000);
        return;
      }

      setAnswerChangesUsed(prev => prev + 1);
      setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: updater(prev[questionId]) }));
    }
  }, [isInReviewMode, config?.max_answer_changes, answers, answerChangesUsed, setAnswerChangesUsed, setAnswers]);

  // ─── saveAnswer ───────────────────────────────────────────────────────────
  async function saveAnswer(
    questionId: string,
    answerData: AnswerManagementStudentAnswer,
    isFlagged: boolean = false,
    retryCount: number = 0,
    questionOrder?: number
  ): Promise<boolean> {
    if (isPreviewMode) return true;
    if (!assignmentId || !studentId) return false;

    const existingSave = savingInProgressRef.current.get(questionId);
    if (existingSave) {
      try { await existingSave; } catch { /* ignore */ }
    }

    const savePromise = (async () => {
      try {
        setIsSaving(true);
        setSaveError(prev => prev?.includes('internet') ? prev : null);

        const actualCurrentAttempt = currentAttemptRef.current;
        const actualQuestionStartTimes = questionStartTimesRef.current;

        console.log('💾 [SAVE] saveAnswer using ref values', {
          questionId: questionId.substring(0, 8),
          actualCurrentAttempt,
          hasStartTime: !!actualQuestionStartTimes[questionId],
          questionOrder
        });

        const tableSuffix = isTestMode ? '_test' : '';

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 5000)
        );

        const queryPromise = db
          .from(`2V_student_answers${tableSuffix}`)
          .select('question_order, time_spent_seconds')
          .eq('assignment_id', assignmentId)
          .eq('question_id', questionId)
          .eq('attempt_number', actualCurrentAttempt)
          .maybeSingle();

        const { data: existingAnswer } = await Promise.race([queryPromise, timeoutPromise]) as any;

        const startTime = actualQuestionStartTimes[questionId];
        const newTimeSpentSeconds = startTime
          ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
          : 0;

        const finalTimeSpentSeconds = existingAnswer
          ? (existingAnswer.time_spent_seconds || 0) + newTimeSpentSeconds
          : newTimeSpentSeconds;

        const finalQuestionOrder = existingAnswer
          ? existingAnswer.question_order
          : questionOrder;

        console.log('⏱️ [SAVE] Time calculation', {
          questionId: questionId.substring(0, 8),
          hasStartTime: !!startTime,
          newTimeSpent: newTimeSpentSeconds,
          existingTimeSpent: existingAnswer?.time_spent_seconds || 0,
          finalTimeSpent: finalTimeSpentSeconds,
          questionOrder: finalQuestionOrder
        });

        // Transform answer to JSONB format
        let jsonbAnswer: JsonbAnswer;
        if (answerData.msrAnswers) {
          jsonbAnswer = { answers: answerData.msrAnswers };
        } else if (answerData.blank1 !== undefined || answerData.blank2 !== undefined) {
          jsonbAnswer = { answers: { part1: answerData.blank1 || null, part2: answerData.blank2 || null } };
        } else if (answerData.taAnswers) {
          jsonbAnswer = { answers: answerData.taAnswers };
        } else if (answerData.column1 || answerData.column2) {
          jsonbAnswer = { answers: { part1: answerData.column1 || null, part2: answerData.column2 || null } };
        } else if (answerData.answer !== undefined) {
          jsonbAnswer = { answer: answerData.answer };
        } else {
          jsonbAnswer = { answer: null };
        }

        const upsertTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 5000)
        );

        const upsertQueryPromise = db
          .from(`2V_student_answers${tableSuffix}`)
          .upsert({
            assignment_id: assignmentId,
            student_id: studentId,
            question_id: questionId,
            attempt_number: actualCurrentAttempt,
            answer: jsonbAnswer,
            is_flagged: isFlagged,
            time_spent_seconds: finalTimeSpentSeconds,
            question_order: finalQuestionOrder,
            is_guided: isGuidedMode,
            guided_settings: isGuidedMode ? { timed: guidedTimed } : null,
          }, {
            onConflict: 'assignment_id,question_id,attempt_number'
          });

        const { error } = await Promise.race([upsertQueryPromise, upsertTimeoutPromise]) as any;
        if (error) throw error;

        // Update assignment status to 'in_progress' on first answer
        const statusTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 5000)
        );

        const statusQueryPromise = db
          .from(`2V_test_assignments${tableSuffix}`)
          .update({ status: 'in_progress', start_time: new Date().toISOString() })
          .eq('id', assignmentId)
          .eq('status', 'unlocked');

        await Promise.race([statusQueryPromise, statusTimeoutPromise]) as any;

        // Clear the start time
        setQuestionStartTimes(prev => {
          const updated = { ...prev };
          delete updated[questionId];
          return updated;
        });

        return true;
      } catch (error: any) {
        console.error('❌ [SAVE] Error:', error);

        const errorMessage = error?.message?.toLowerCase() || '';
        const isNetworkError = !navigator.onLine ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('network') ||
          errorMessage.includes('timeout') ||
          error?.code === 'ENOTFOUND';

        if (isNetworkError) {
          setSaveError('⚠️ No internet connection. Cannot proceed until connection is restored.');
          return false;
        }

        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return saveAnswer(questionId, answerData, isFlagged, retryCount + 1, questionOrder);
        } else {
          setSaveError('Failed to save answer. Your progress may not be saved.');
          return false;
        }
      } finally {
        setIsSaving(false);
        savingInProgressRef.current.delete(questionId);
      }
    })();

    savingInProgressRef.current.set(questionId, savePromise);
    return savePromise;
  }

  // ─── DI Answer Checking Helpers ───────────────────────────────────────────

  function checkAndRecordMSRResponse(msrAnswers: string[], correctAnswers: string[]) {
    if (!currentQuestion || !adaptiveAlgorithm || config?.adaptivity_mode !== 'adaptive') return;
    const allCorrect = msrAnswers.length === correctAnswers.length &&
      msrAnswers.every((ans, idx) => ans?.toUpperCase() === correctAnswers[idx]?.toUpperCase());
    console.log('🔍 [MSR] Checking answer correctness', {
      questionId: currentQuestion.id.substring(0, 8), studentAnswers: msrAnswers, correctAnswers, isCorrect: allCorrect
    });
    adaptiveAlgorithm.recordResponse(currentQuestion, allCorrect);
  }

  function checkAndRecordGIResponse(blank1: string | undefined, blank2: string | undefined, correctAnswerData: { blank1?: string; blank2?: string } | string[] | undefined) {
    if (!currentQuestion || !adaptiveAlgorithm || config?.adaptivity_mode !== 'adaptive') return;
    const correctBlank1 = Array.isArray(correctAnswerData) ? correctAnswerData[0] : (correctAnswerData?.blank1 || null);
    const correctBlank2 = Array.isArray(correctAnswerData) ? correctAnswerData[1] : (correctAnswerData?.blank2 || null);
    const isCorrect = blank1?.toUpperCase() === correctBlank1?.toUpperCase() &&
      blank2?.toUpperCase() === correctBlank2?.toUpperCase();
    console.log('🔍 [GI] Checking answer correctness', {
      questionId: currentQuestion.id.substring(0, 8), studentBlank1: blank1, studentBlank2: blank2, correctBlank1, correctBlank2, isCorrect
    });
    adaptiveAlgorithm.recordResponse(currentQuestion, isCorrect);
  }

  function checkAndRecordTAResponse(taAnswers: Record<number, string>, correctAnswers: Record<number, string>) {
    if (!currentQuestion || !adaptiveAlgorithm || config?.adaptivity_mode !== 'adaptive') return;
    const allCorrect = Object.keys(correctAnswers).every(key =>
      taAnswers[Number(key)]?.toUpperCase() === correctAnswers[Number(key)]?.toUpperCase()
    );
    console.log('🔍 [TA] Checking answer correctness', {
      questionId: currentQuestion.id.substring(0, 8), studentAnswers: taAnswers, correctAnswers, isCorrect: allCorrect
    });
    adaptiveAlgorithm.recordResponse(currentQuestion, allCorrect);
  }

  function checkAndRecordTPAResponse(column1: string | undefined, column2: string | undefined, correctAnswerData: { column1?: string; column2?: string } | undefined) {
    if (!currentQuestion || !adaptiveAlgorithm || config?.adaptivity_mode !== 'adaptive') return;
    const correctColumn1 = correctAnswerData?.column1;
    const correctColumn2 = correctAnswerData?.column2;
    const isCorrect = column1?.toUpperCase() === correctColumn1?.toUpperCase() &&
      column2?.toUpperCase() === correctColumn2?.toUpperCase();
    console.log('🔍 [TPA] Checking answer correctness', {
      questionId: currentQuestion.id.substring(0, 8), studentColumn1: column1, studentColumn2: column2, correctColumn1, correctColumn2, isCorrect
    });
    adaptiveAlgorithm.recordResponse(currentQuestion, isCorrect);
  }

  // ─── handleAnswerSelect ───────────────────────────────────────────────────

  function handleAnswerSelect(answer: string) {
    if (!currentQuestion) return;
    if (timeRemaining !== null && timeRemaining <= 0) return;
    if (isTransitioning) return;

    updateAnswer(currentQuestion.id, (prev) => ({
      questionId: currentQuestion.id,
      answer,
      timeSpent: prev?.timeSpent || 0,
      flagged: prev?.flagged || false,
    }));

    if (adaptiveAlgorithm && config?.adaptivity_mode === 'adaptive') {
      const answersData = typeof currentQuestion.answers === 'string'
        ? JSON.parse(currentQuestion.answers as unknown as string)
        : currentQuestion.answers;
      const correctAnswerData = answersData?.correct_answer || currentQuestion.correct_answer;
      const correctAnswer = Array.isArray(correctAnswerData) ? correctAnswerData[0] : correctAnswerData;
      const normalizedAnswer = typeof answer === 'string' ? answer.toUpperCase() : answer;
      const normalizedCorrect = typeof correctAnswer === 'string' ? correctAnswer.toUpperCase() : correctAnswer;
      const isCorrect = normalizedAnswer === normalizedCorrect;
      adaptiveAlgorithm.recordResponse(currentQuestion, isCorrect);
    }
  }

  // ─── handleRendererAnswerChange ───────────────────────────────────────────

  function handleRendererAnswerChange(questionId: string, unified: UnifiedAnswer) {
    if (!currentQuestion || currentQuestion.id !== questionId) return;
    if (timeRemaining !== null && timeRemaining <= 0) return;
    if (isTransitioning) return;

    const diType = currentQuestion.question_data?.di_type;
    const answersData = typeof currentQuestion.answers === 'string'
      ? JSON.parse(currentQuestion.answers as unknown as string)
      : currentQuestion.answers;
    const correctAnswerData = answersData?.correct_answer;

    if (diType === 'DS' || (!diType && currentQuestion.question_type === 'multiple_choice')) {
      if (unified.answer != null) handleAnswerSelect(unified.answer);
    } else if (diType === 'MSR') {
      const newMSRAnswers = unified.msrAnswers || [];
      updateAnswer(questionId, (prev) => ({
        ...prev, questionId, msrAnswers: newMSRAnswers,
        answer: newMSRAnswers.join(','),
        timeSpent: prev?.timeSpent || 0, flagged: prev?.flagged || false,
      }));
      const numQuestions = currentQuestion.question_data?.questions?.length || 0;
      const correctMSRAnswers = Array.isArray(correctAnswerData) ? correctAnswerData : [];
      if (newMSRAnswers.filter(a => a).length === numQuestions) {
        checkAndRecordMSRResponse(newMSRAnswers, correctMSRAnswers);
      }
    } else if (diType === 'GI') {
      updateAnswer(questionId, (prev) => ({
        ...prev, questionId, blank1: unified.blank1, blank2: unified.blank2,
        answer: `${unified.blank1 || ''}|${unified.blank2 || ''}`,
        timeSpent: prev?.timeSpent || 0, flagged: prev?.flagged || false,
      }));
      if (unified.blank1 && unified.blank2) {
        checkAndRecordGIResponse(unified.blank1, unified.blank2, correctAnswerData);
      }
    } else if (diType === 'TA') {
      const newTAAnswers = unified.taAnswers || {};
      updateAnswer(questionId, (prev) => ({
        ...prev, questionId, taAnswers: newTAAnswers,
        answer: Object.values(newTAAnswers).join(','),
        timeSpent: prev?.timeSpent || 0, flagged: prev?.flagged || false,
      }));
      const numStatements = currentQuestion.question_data?.statements?.length || 0;
      const correctTAAnswers = Array.isArray(correctAnswerData) && correctAnswerData.length > 0
        ? correctAnswerData[0] : correctAnswerData || {};
      if (Object.keys(newTAAnswers).length === numStatements) {
        checkAndRecordTAResponse(newTAAnswers, correctTAAnswers);
      }
    } else if (diType === 'TPA') {
      updateAnswer(questionId, (prev) => ({
        ...prev, questionId, column1: unified.column1, column2: unified.column2,
        answer: `${unified.column1 || ''}|${unified.column2 || ''}`,
        timeSpent: prev?.timeSpent || 0, flagged: prev?.flagged || false,
      }));
      const correctTPAAnswers = Array.isArray(correctAnswerData) && correctAnswerData.length > 0
        ? correctAnswerData[0] : correctAnswerData || {};
      if (unified.column1 && unified.column2) {
        checkAndRecordTPAResponse(unified.column1, unified.column2, correctTPAAnswers);
      }
    } else if (currentQuestion.question_type === 'open_ended') {
      updateAnswer(questionId, (prev) => ({
        ...prev, questionId, answer: unified.answer || '',
        timeSpent: prev?.timeSpent || 0, flagged: prev?.flagged || false,
      }));
    }
  }

  // ─── toUnifiedAnswer ──────────────────────────────────────────────────────

  function toUnifiedAnswer(sa: AnswerManagementStudentAnswer | undefined): UnifiedAnswer {
    if (!sa) return {};
    return {
      answer: sa.answer ?? undefined,
      msrAnswers: sa.msrAnswers,
      blank1: sa.blank1,
      blank2: sa.blank2,
      taAnswers: sa.taAnswers,
      column1: sa.column1,
      column2: sa.column2,
    };
  }

  // ─── toggleFlag ───────────────────────────────────────────────────────────

  function toggleFlag() {
    if (!currentQuestion) return;
    if (timeRemaining !== null && timeRemaining <= 0) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {
          questionId: currentQuestion.id,
          answer: null,
          timeSpent: 0,
          flagged: false,
        }),
        flagged: !(prev[currentQuestion.id]?.flagged || false),
      }
    }));
  }

  // ─── Return ───────────────────────────────────────────────────────────────

  return {
    // UI state
    isSaving, saveError, setSaveError,
    showAnswerRequiredMessage, setShowAnswerRequiredMessage,
    isPartialAnswer, setIsPartialAnswer,
    showChangeBlockedMessage, setShowChangeBlockedMessage,
    questionStartTimes, setQuestionStartTimes,
    sectionTimes, setSectionTimes,
    // Operations
    updateAnswer, saveAnswer,
    handleAnswerSelect, handleRendererAnswerChange, toUnifiedAnswer, toggleFlag,
    // Refs
    savingInProgressRef, autoSaveTimeoutRef, answersRef,
    currentAttemptRef, globalQuestionOrderRef, currentQuestionIdRef, questionStartTimesRef,
  };
}
