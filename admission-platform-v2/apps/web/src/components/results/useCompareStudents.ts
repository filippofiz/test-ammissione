/**
 * useCompareStudents Hook
 *
 * Manages the multi-student comparison feature on UnifiedResultsPage.
 * Tutor-only: short-circuits immediately when enabled=false (student view).
 *
 * Flow:
 * 1. When primaryData is ready, find other students who completed the same test.
 * 2. Tutor calls addStudent(sourceId) to load a lightweight ComparisonStudentResult.
 * 3. removeStudent(sourceId) removes from the comparison.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { GmatAssessmentResult } from '../../lib/api/gmat';
import { checkAnswerCorrectness } from '../../lib/gmat/answerChecking';
import { checkIfCorrect } from './useRegularTestResults';
import type {
  UnifiedResultData,
  ComparisonStudentResult,
  AvailableComparisonStudent,
} from './types';

export interface UseCompareStudentsParams {
  primaryData: UnifiedResultData | null;
  isGmat: boolean;
  /** Raw GMAT assessment record — needed for assessment_type, section, topic on GMAT path */
  primaryAssessment?: GmatAssessmentResult | null;
  /** Set to false in student view — hook short-circuits and makes no queries */
  enabled: boolean;
}

export interface UseCompareStudentsReturn {
  availableStudents: AvailableComparisonStudent[];
  availableLoading: boolean;
  comparisonResults: ComparisonStudentResult[];
  loadingIds: Set<string>;
  errorIds: Map<string, string>;
  addStudent: (sourceId: string) => void;
  removeStudent: (sourceId: string) => void;
}

const MAX_COMPARISON_STUDENTS = 4;

/* ------------------------------------------------------------------ */
/*  Standalone data loaders (not React hooks)                          */
/* ------------------------------------------------------------------ */

/**
 * Load a lightweight comparison result for a regular test assignment.
 * Queries the student's answers for their current attempt and computes correctness.
 */
async function loadComparisonRegularResult(
  assignmentId: string,
): Promise<ComparisonStudentResult> {
  // Load the assignment to get student info and current attempt number
  const { data: assignment, error: assignError } = await supabase
    .from('2V_test_assignments')
    .select('id, student_id, completed_at, current_attempt')
    .eq('id', assignmentId)
    .single();

  if (assignError || !assignment) {
    throw new Error(assignError?.message || 'Assignment not found');
  }

  // Fetch student name separately to avoid FK ambiguity
  let studentName: string | null = null;
  if (assignment.student_id) {
    const { data: profile } = await supabase
      .from('2V_profiles')
      .select('name')
      .eq('id', assignment.student_id)
      .single();
    studentName = profile?.name ?? null;
  }

  const attemptNumber = (assignment as any).current_attempt ?? 1;

  // Load answers for this attempt
  const { data: answers, error: answersError } = await supabase
    .from('2V_student_answers')
    .select('question_id, answer, auto_score, tutor_score, tutor_feedback, is_flagged, time_spent_seconds, attempt_number')
    .eq('assignment_id', assignmentId)
    .eq('attempt_number', attemptNumber);

  if (answersError) throw new Error(answersError.message);

  const answersMap = new Map<string, any>();
  for (const a of answers ?? []) {
    answersMap.set(a.question_id, a);
  }

  const questionIds = [...answersMap.keys()];
  if (questionIds.length === 0) {
    return {
      sourceId: assignmentId,
      studentName,
      completedAt: (assignment as any).completed_at ?? null,
      scoreRaw: 0,
      scoreTotal: 0,
      scorePercentage: 0,
      questionResults: new Map(),
    };
  }

  // Load question data to evaluate correctness
  // Note: correct_answer is inside the 'answers' JSONB field, not a top-level column
  const { data: questions, error: questionsError } = await supabase
    .from('2V_questions')
    .select('id, section, question_type, answers, question_data')
    .in('id', questionIds);

  if (questionsError) throw new Error(questionsError.message);

  const questionResults = new Map<string, { isCorrect: boolean; hasAnswer: boolean; studentAnswer: any; timeSpentSeconds?: number }>();
  let scoreRaw = 0;

  for (const q of questions ?? []) {
    const studentAnswer = answersMap.get(q.id) ?? null;
    // Must check the inner answer value — the DB stores { answer: null } for skipped
    // questions, so !!studentAnswer?.answer would be truthy even when unanswered.
    const rawAnswer = studentAnswer?.answer;
    const hasAnswer = !!rawAnswer &&
      !(typeof rawAnswer === 'object' &&
        (rawAnswer.answer === null || rawAnswer.answer === undefined) &&
        !rawAnswer.answers);
    const isCorrect = hasAnswer ? checkIfCorrect(q as any, studentAnswer) : false;
    if (isCorrect) scoreRaw++;
    // Store the raw answer so the UI can render what the student chose
    questionResults.set(q.id, {
      isCorrect,
      hasAnswer,
      studentAnswer: studentAnswer?.answer ?? null,
      timeSpentSeconds: studentAnswer?.time_spent_seconds ?? undefined,
    });
  }

  const scoreTotal = questionIds.length;
  const scorePercentage = scoreTotal > 0 ? Math.round((scoreRaw / scoreTotal) * 100) : 0;

  return {
    sourceId: assignmentId,
    studentName,
    completedAt: (assignment as any).completed_at ?? null,
    scoreRaw,
    scoreTotal,
    scorePercentage,
    questionResults,
  };
}

/**
 * Load a lightweight comparison result for a GMAT assessment.
 * Reads answers_data JSONB directly (no separate answers table needed).
 */
async function loadComparisonGmatResult(
  assessmentId: string,
): Promise<ComparisonStudentResult> {
  const { data: assessment, error } = await supabase
    .from('2V_gmat_assessment_results')
    .select('id, student_id, completed_at, score_raw, score_total, score_percentage, answers_data, question_ids')
    .eq('id', assessmentId)
    .single();

  if (error || !assessment) {
    throw new Error(error?.message || 'Assessment not found');
  }

  // Fetch student name separately to avoid FK ambiguity
  let studentName: string | null = null;
  if (assessment.student_id) {
    const { data: profile } = await supabase
      .from('2V_profiles')
      .select('name')
      .eq('id', assessment.student_id)
      .single();
    studentName = profile?.name ?? null;
  }

  const answersData = assessment.answers_data as Record<string, {
    answer: any;
    time_spent_seconds: number;
    is_correct: boolean;
    is_unanswered?: boolean;
  }> | null;

  const questionResults = new Map<string, { isCorrect: boolean; hasAnswer: boolean; studentAnswer: any; timeSpentSeconds?: number }>();

  if (answersData) {
    // Load questions to recompute correctness (same as main hook does)
    const questionIds = Object.keys(answersData);
    if (questionIds.length > 0) {
      const { data: questions } = await supabase
        .from('2V_questions')
        .select('id, answers, question_data')
        .in('id', questionIds);

      for (const q of questions ?? []) {
        const answerEntry = answersData[q.id];
        if (!answerEntry) continue;
        const hasAnswer = !answerEntry.is_unanswered && answerEntry.answer !== null && answerEntry.answer !== undefined;
        const answersParsed = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
        const questionDataParsed = typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data;
        const isCorrect = hasAnswer
          ? checkAnswerCorrectness(answerEntry.answer, answersParsed?.correct_answer, questionDataParsed?.di_type)
          : false;
        // Store the raw answer so the UI can render what the student chose
        questionResults.set(q.id, {
          isCorrect,
          hasAnswer,
          studentAnswer: hasAnswer ? answerEntry.answer : null,
          timeSpentSeconds: answerEntry.time_spent_seconds ?? undefined,
        });
      }
    }
  }

  return {
    sourceId: assessmentId,
    studentName,
    completedAt: assessment.completed_at ?? null,
    scoreRaw: assessment.score_raw ?? 0,
    scoreTotal: assessment.score_total ?? 0,
    scorePercentage: assessment.score_percentage ?? 0,
    questionResults,
  };
}

/* ------------------------------------------------------------------ */
/*  Peer-discovery queries                                              */
/* ------------------------------------------------------------------ */

async function fetchPeersForRegularTest(
  testId: string,
  excludeAssignmentId: string,
): Promise<AvailableComparisonStudent[]> {
  const { data, error } = await supabase
    .from('2V_test_assignments')
    .select('id, student_id, completed_at')
    .eq('test_id', testId)
    .not('completed_at', 'is', null)
    .neq('id', excludeAssignmentId);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  // Fetch student names separately to avoid FK ambiguity
  const studentIds = [...new Set(data.map(r => r.student_id).filter(Boolean))];
  const namesMap = new Map<string, string | null>();
  if (studentIds.length > 0) {
    const { data: profiles } = await supabase
      .from('2V_profiles')
      .select('id, name')
      .in('id', studentIds);
    for (const p of profiles ?? []) namesMap.set(p.id, p.name);
  }

  return data.map((row: any) => ({
    sourceId: row.id,
    studentName: namesMap.get(row.student_id) ?? null,
    completedAt: row.completed_at ?? null,
    alreadyAdded: false,
  }));
}

async function fetchPeersForGmatTest(
  assessmentType: string,
  section: string | null,
  topic: string | null,
  excludeAssessmentId: string,
): Promise<AvailableComparisonStudent[]> {
  let query = supabase
    .from('2V_gmat_assessment_results')
    .select('id, student_id, completed_at')
    .eq('assessment_type', assessmentType)
    .neq('id', excludeAssessmentId)
    .not('completed_at', 'is', null);

  // Handle null-safe matching for section and topic
  if (section === null || section === undefined) {
    query = query.is('section', null);
  } else {
    query = query.eq('section', section);
  }

  if (topic === null || topic === undefined) {
    query = query.is('topic', null);
  } else {
    query = query.eq('topic', topic);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  // Fetch student names separately to avoid FK ambiguity
  const studentIds = [...new Set(data.map((r: any) => r.student_id).filter(Boolean))];
  const namesMap = new Map<string, string | null>();
  if (studentIds.length > 0) {
    const { data: profiles } = await supabase
      .from('2V_profiles')
      .select('id, name')
      .in('id', studentIds);
    for (const p of profiles ?? []) namesMap.set(p.id, p.name);
  }

  return data.map((row: any) => ({
    sourceId: row.id,
    studentName: namesMap.get(row.student_id) ?? null,
    completedAt: row.completed_at ?? null,
    alreadyAdded: false,
  }));
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useCompareStudents({
  primaryData,
  isGmat,
  primaryAssessment,
  enabled,
}: UseCompareStudentsParams): UseCompareStudentsReturn {
  const [availableStudents, setAvailableStudents] = useState<AvailableComparisonStudent[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonStudentResult[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [errorIds, setErrorIds] = useState<Map<string, string>>(new Map());

  // Find peers when primary data is ready
  useEffect(() => {
    if (!enabled || !primaryData) return;

    if (isGmat) {
      if (!primaryAssessment) return;
      setAvailableLoading(true);
      fetchPeersForGmatTest(
        primaryAssessment.assessment_type,
        primaryAssessment.section ?? null,
        primaryAssessment.topic ?? null,
        primaryData.sourceId,
      )
        .then(peers => setAvailableStudents(peers))
        .catch(() => setAvailableStudents([]))
        .finally(() => setAvailableLoading(false));
    } else {
      const testId = primaryData.assignment?.['2V_tests']?.id;
      if (!testId) return;
      setAvailableLoading(true);
      fetchPeersForRegularTest(testId, primaryData.sourceId)
        .then(peers => setAvailableStudents(peers))
        .catch(() => setAvailableStudents([]))
        .finally(() => setAvailableLoading(false));
    }
  }, [enabled, primaryData, isGmat, primaryAssessment]);

  // Keep alreadyAdded flag in sync
  useEffect(() => {
    const addedIds = new Set(comparisonResults.map(r => r.sourceId));
    setAvailableStudents(prev =>
      prev.map(s => ({ ...s, alreadyAdded: addedIds.has(s.sourceId) })),
    );
  }, [comparisonResults]);

  const addStudent = useCallback(
    async (sourceId: string) => {
      if (comparisonResults.length >= MAX_COMPARISON_STUDENTS) return;
      if (comparisonResults.some(r => r.sourceId === sourceId)) return;

      setLoadingIds(prev => new Set(prev).add(sourceId));
      setErrorIds(prev => {
        const next = new Map(prev);
        next.delete(sourceId);
        return next;
      });

      try {
        const result = isGmat
          ? await loadComparisonGmatResult(sourceId)
          : await loadComparisonRegularResult(sourceId);
        setComparisonResults(prev => [...prev, result]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load';
        setErrorIds(prev => new Map(prev).set(sourceId, msg));
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(sourceId);
          return next;
        });
      }
    },
    [comparisonResults, isGmat],
  );

  const removeStudent = useCallback((sourceId: string) => {
    setComparisonResults(prev => prev.filter(r => r.sourceId !== sourceId));
    setErrorIds(prev => {
      const next = new Map(prev);
      next.delete(sourceId);
      return next;
    });
  }, []);

  if (!enabled) {
    return {
      availableStudents: [],
      availableLoading: false,
      comparisonResults: [],
      loadingIds: new Set(),
      errorIds: new Map(),
      addStudent: () => {},
      removeStudent: () => {},
    };
  }

  return {
    availableStudents,
    availableLoading,
    comparisonResults,
    loadingIds,
    errorIds,
    addStudent,
    removeStudent,
  };
}
