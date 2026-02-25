/**
 * useRegularTestResults Hook
 *
 * Loads regular test results from 2V_test_assignments + 2V_student_answers
 * and normalizes them into UnifiedResultData.
 *
 * Extracts all data-loading, scoring, and action logic from TestResultsPage
 * so the page component only handles UI.
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  UnifiedResultData,
  UnifiedQuestionResult,
  DifficultyBreakdownData,
  ScaledScoreData,
  AttemptComparisonData,
} from './types';
// types re-exported for convenience; getSectionFullName used by page layer

/* ------------------------------------------------------------------ */
/*  Internal interfaces mirroring TestResultsPage originals            */
/* ------------------------------------------------------------------ */

interface Question {
  id: string;
  section: string;
  materia?: string;
  question_text: string;
  question_type: string;
  question_number?: number;
  correct_answer: any;
  options?: any;
  answers?: any;
  image_url?: string;
  question_data?: any;
  difficulty?: number | string;
  Questions_toReview?: {
    needs_review: boolean;
    notes: string;
    flagged_by: string;
    flagged_at: string;
  } | null;
}

interface StudentAnswer {
  id: string;
  question_id: string;
  answer: any;
  time_spent_seconds: number;
  is_flagged: boolean;
  attempt_number: number;
  auto_score: number | null;
  tutor_score: number | null;
  tutor_feedback: string | null;
}

/* ------------------------------------------------------------------ */
/*  Pure helper functions (no React state)                             */
/* ------------------------------------------------------------------ */

/** Flexible answer comparison: numeric, fraction, percentage equivalence */
function compareAnswersFlexibly(studentValue: any, correctValue: any): boolean {
  const studentStr = String(studentValue || '').trim();
  const correctStr = String(correctValue || '').trim();

  if (studentStr.toLowerCase() === correctStr.toLowerCase()) return true;

  const studentNum = parseFloat(studentStr);
  const correctNum = parseFloat(correctStr);

  if (!isNaN(studentNum) && !isNaN(correctNum)) {
    return Math.abs(studentNum - correctNum) < 0.0001;
  }

  const evalFraction = (str: string): number | null => {
    const match = str.match(/^(-?\d+)\/(-?\d+)$/);
    if (match) {
      const num = parseFloat(match[1]);
      const den = parseFloat(match[2]);
      return den !== 0 ? num / den : null;
    }
    return null;
  };

  const evalPercentage = (str: string): number | null => {
    const match = str.match(/^(-?\d+(?:\.\d+)?)%$/);
    if (match) return parseFloat(match[1]) / 100;
    return null;
  };

  const studentNormalized = evalPercentage(studentStr) ?? evalFraction(studentStr) ?? (!isNaN(studentNum) ? studentNum : null);
  const correctNormalized = evalPercentage(correctStr) ?? evalFraction(correctStr) ?? (!isNaN(correctNum) ? correctNum : null);

  if (studentNormalized !== null && correctNormalized !== null) {
    return Math.abs(studentNormalized - correctNormalized) < 0.0001;
  }
  return false;
}

/** Check if a student answer is correct, handling all question types */
function checkIfCorrect(question: Question, studentAnswer: StudentAnswer | null): boolean {
  if (!studentAnswer || !studentAnswer.answer) return false;

  const studentAns = studentAnswer.answer;
  const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
  const correctAns = answersData?.correct_answer;

  if (!studentAns || !correctAns) return false;

  const questionData = (question as any).question_data || {};
  const diType = questionData.di_type;

  // GI
  if (diType === 'GI' && studentAns.answers && Array.isArray(correctAns)) {
    const g = studentAns.answers;
    return (
      String(g.part1 || '').trim() === String(correctAns[0] || '').trim() &&
      String(g.part2 || '').trim() === String(correctAns[1] || '').trim()
    );
  }

  // TA
  if (diType === 'TA' && studentAns.answers) {
    const correctTA = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
    const studentTA = studentAns.answers;
    return Object.entries(correctTA).every(([key, value]) => {
      const match = key.match(/stmt(\d+)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const expected = value === 'col1' ? 'true' : 'false';
        const sv = String(studentTA[idx] || studentTA[String(idx)] || '').toLowerCase();
        return sv === expected || sv === String(expected === 'true');
      }
      return true;
    });
  }

  // TPA
  if (diType === 'TPA' && studentAns.answers) {
    const c = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
    const s = studentAns.answers;
    return (
      String(s.part1 || '').trim() === String(c.col1 || '').trim() &&
      String(s.part2 || '').trim() === String(c.col2 || '').trim()
    );
  }

  // MSR
  if (diType === 'MSR' && studentAns.answers && Array.isArray(correctAns)) {
    const arr = Array.isArray(studentAns.answers) ? studentAns.answers : [];
    if (arr.length !== correctAns.length) return false;
    return arr.every((a: any, i: number) => String(a || '').toLowerCase() === String(correctAns[i] || '').toLowerCase());
  }

  // DS
  if (diType === 'DS') {
    const sd = typeof studentAns === 'string' ? studentAns : studentAns.answer;
    const cd = Array.isArray(correctAns) ? correctAns[0] : correctAns;
    return String(sd || '').toUpperCase() === String(cd || '').toUpperCase();
  }

  // Multiple Choice
  if (question.question_type === 'multiple_choice') {
    const sm = studentAns.answer || studentAns;
    return String(sm || '').toLowerCase() === String(correctAns || '').toLowerCase();
  }

  // Open-ended / text input
  if (studentAns.answer !== undefined && correctAns) {
    const cv = typeof correctAns === 'string' ? correctAns : correctAns.answer || correctAns;
    return compareAnswersFlexibly(studentAns.answer, cv);
  }

  // Multiple answers (backward compat)
  if (studentAns.answers && correctAns.answers) {
    const sa = Array.isArray(studentAns.answers) ? studentAns.answers : [];
    const ca = Array.isArray(correctAns.answers) ? correctAns.answers : [];
    if (sa.length !== ca.length) return false;
    return sa.every((a: any, i: number) => compareAnswersFlexibly(a, ca[i]));
  }

  return false;
}

/** Check if a result has an actual answer (not null/empty) */
function hasActualAnswer(studentAnswer: StudentAnswer | null): boolean {
  if (!studentAnswer) return false;
  const answerData = studentAnswer.answer;
  if (!answerData) return false;

  if (typeof answerData === 'object') {
    if (answerData.answers && typeof answerData.answers === 'object') {
      return Object.keys(answerData.answers).length > 0;
    }
    if (answerData.answer === null || answerData.answer === undefined) {
      return false;
    }
  }
  return true;
}

/** Group results by section */
function groupBySection(results: UnifiedQuestionResult[]): Record<string, UnifiedQuestionResult[]> {
  const grouped: Record<string, UnifiedQuestionResult[]> = {};
  results.forEach(r => {
    const section = r.question.section || 'Other';
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(r);
  });
  return grouped;
}

/** Count options in a question (for penalty calculation) */
function countOptions(questionData: any): number {
  const opts = questionData?.options || questionData?.options_eng || {};
  return Object.keys(opts).filter(k => k.length === 1 && k >= 'a' && k <= 'z').length;
}

/** Calculate scaled scores based on algorithm config */
function calculateScaledScores(
  results: UnifiedQuestionResult[],
  algorithmConfig: any,
): ScaledScoreData | null {
  if (!algorithmConfig) return null;

  const groupedResults = groupBySection(results);
  const sectionScores: Record<string, number> = {};

  if (algorithmConfig.scoring_method === 'raw_score') {
    const penaltyBlank = parseFloat(algorithmConfig.penalty_for_blank || '0');

    const getPenaltyForWrong = (optionsCount?: number): number => {
      const penaltyConfig = algorithmConfig.penalty_for_wrong;
      if (!penaltyConfig) return 0;
      if (typeof penaltyConfig === 'number') return Math.abs(penaltyConfig);
      if (typeof penaltyConfig === 'string') return Math.abs(parseFloat(penaltyConfig));

      if (typeof penaltyConfig === 'object' && optionsCount !== undefined) {
        const exactPenalty = penaltyConfig[String(optionsCount)];
        if (exactPenalty !== undefined) return Math.abs(Number(exactPenalty));

        const optionKeys = Object.keys(penaltyConfig)
          .filter(k => !isNaN(Number(k)))
          .map(Number)
          .sort((a, b) => a - b);

        for (let i = optionKeys.length - 1; i >= 0; i--) {
          if (optionKeys[i] <= optionsCount) {
            return Math.abs(Number(penaltyConfig[String(optionKeys[i])]));
          }
        }
        if (optionKeys.length > 0) {
          return Math.abs(Number(penaltyConfig[String(optionKeys[0])]));
        }
      }
      return 0;
    };

    let totalCorrect = 0;
    let totalWrong = 0;
    let totalBlank = 0;
    let totalQuestions = 0;
    let totalPenaltyPoints = 0;
    const penaltyBreakdown: Record<number, { count: number; totalPenalty: number; penaltyPerQuestion: number }> = {};

    Object.keys(groupedResults).forEach(sectionName => {
      const sectionResults = groupedResults[sectionName];
      totalQuestions += sectionResults.length;

      let score = 0;

      sectionResults.forEach(r => {
        const qData = typeof r.question.question_data === 'string'
          ? JSON.parse(r.question.question_data)
          : r.question.question_data;

        if (r.isCorrect) {
          score += 1;
          totalCorrect++;
        } else if (r.hasAnswer && !r.isCorrect) {
          const optCount = countOptions(qData);
          const penalty = getPenaltyForWrong(optCount);
          score -= penalty;
          totalPenaltyPoints += penalty;

          if (!penaltyBreakdown[optCount]) {
            penaltyBreakdown[optCount] = { count: 0, totalPenalty: 0, penaltyPerQuestion: penalty };
          }
          penaltyBreakdown[optCount].count++;
          penaltyBreakdown[optCount].totalPenalty += penalty;

          totalWrong++;
        } else {
          score += penaltyBlank;
          totalBlank++;
        }
      });

      sectionScores[sectionName] = parseFloat(score.toFixed(2));
    });

    const totalRawScore = Object.values(sectionScores).reduce((sum, s) => sum + s, 0);
    const scaledTo50 = totalQuestions > 0 ? (totalRawScore / totalQuestions) * 50 : 0;

    return {
      sectionScores,
      totalScore: parseFloat(scaledTo50.toFixed(2)),
      displayName: algorithmConfig.display_name,
      scoringMethod: 'raw_score',
      rawScoreDetails: {
        correct: totalCorrect,
        correctPoints: totalCorrect,
        wrong: totalWrong,
        wrongPoints: parseFloat((-totalPenaltyPoints).toFixed(2)),
        blank: totalBlank,
        blankPoints: totalBlank * penaltyBlank,
        totalRawScore: parseFloat(totalRawScore.toFixed(2)),
        totalQuestions,
        scaledTo50: parseFloat(scaledTo50.toFixed(2)),
        penaltyBreakdown: Object.keys(penaltyBreakdown).map(optCount => ({
          optionCount: parseInt(optCount),
          count: penaltyBreakdown[parseInt(optCount)].count,
          totalPenalty: parseFloat(penaltyBreakdown[parseInt(optCount)].totalPenalty.toFixed(2)),
          penaltyPerQuestion: parseFloat(penaltyBreakdown[parseInt(optCount)].penaltyPerQuestion.toFixed(2)),
        })),
      },
    };
  } else {
    // IRT-based / scaled score
    Object.keys(groupedResults).forEach(sectionName => {
      const sectionResults = groupedResults[sectionName];
      const correct = sectionResults.filter(r => r.isCorrect).length;
      const total = sectionResults.length;
      const pct = total > 0 ? correct / total : 0;

      const range = algorithmConfig.section_score_max - algorithmConfig.section_score_min;
      const scaled = algorithmConfig.section_score_min + pct * range;
      const increment = algorithmConfig.score_increment || 1;
      sectionScores[sectionName] = Math.round(scaled / increment) * increment;
    });

    const vals = Object.values(sectionScores);
    const avg = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;

    const totalRange = algorithmConfig.total_score_max - algorithmConfig.total_score_min;
    const sectionRange = algorithmConfig.section_score_max - algorithmConfig.section_score_min;
    const normalised = (avg - algorithmConfig.section_score_min) / sectionRange;
    const totalScore = algorithmConfig.total_score_min + normalised * totalRange;

    const increment = algorithmConfig.score_increment || 1;

    return {
      sectionScores,
      totalScore: Math.round(totalScore / increment) * increment,
      displayName: algorithmConfig.display_name,
      scoringMethod: 'irt',
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Hook return type                                                   */
/* ------------------------------------------------------------------ */

export interface UseRegularTestResultsReturn {
  data: UnifiedResultData | null;
  loading: boolean;
  error: string | null;

  /* Actions exposed to the page */
  selectedAttempt: number | null;
  setSelectedAttempt: (attempt: number) => void;
  attemptComparison: AttemptComparisonData[];
  toggleResultsViewability: () => Promise<void>;
  togglingViewability: boolean;
  saveQuestionReview: (questionId: string, needsReview: boolean, notes: string) => void;
}

/* ------------------------------------------------------------------ */
/*  The hook                                                           */
/* ------------------------------------------------------------------ */

export function useRegularTestResults(
  assignmentId: string | undefined,
  isStudentView: boolean,
): UseRegularTestResultsReturn {
  const [data, setData] = useState<UnifiedResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttempt, setSelectedAttemptState] = useState<number | null>(null);
  const [attemptComparison, setAttemptComparison] = useState<AttemptComparisonData[]>([]);
  const [togglingViewability, setTogglingViewability] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Keep a ref to the latest data for action callbacks
  const dataRef = useRef(data);
  dataRef.current = data;

  const reviewTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Load current user for question review feature
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('2V_profiles')
          .select('id')
          .eq('auth_uid', user.id)
          .single();
        if (profile) setCurrentUserId(profile.id);
      }
    })();
  }, []);

  // Main data load
  useEffect(() => {
    if (!assignmentId) {
      setError('No assignment ID provided');
      setLoading(false);
      return;
    }
    loadResults(assignmentId, selectedAttempt);
  }, [assignmentId, selectedAttempt]);

  /* ---- main loader ---- */
  async function loadResults(id: string, attemptOverride: number | null) {
    try {
      setLoading(true);
      setError(null);

      // 1. Load assignment with test info
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('2V_test_assignments')
        .select(`
          *,
          results_viewable_by_student,
          2V_tests(id, test_type, test_number, section, exercise_type)
        `)
        .eq('id', id)
        .single();

      if (assignmentError) throw assignmentError;

      // 2. Load student profile
      const { data: studentData, error: studentError } = await supabase
        .from('2V_profiles')
        .select('id, name, email')
        .eq('id', assignmentData.student_id)
        .single();

      if (studentError) throw studentError;

      const fullAssignment = { ...assignmentData, '2V_profiles': studentData };
      const testType = assignmentData['2V_tests'].test_type;
      const exerciseType = assignmentData['2V_tests'].exercise_type;

      // 3. Load track config + algorithm config
      const { data: trackConfig } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType)
        .eq('track_type', exerciseType)
        .maybeSingle();

      let algorithmConfig: any = null;
      if (trackConfig?.algorithm_id) {
        const { data: algoConfig } = await supabase
          .from('2V_algorithm_config')
          .select('*')
          .eq('id', trackConfig.algorithm_id)
          .single();
        if (algoConfig) algorithmConfig = algoConfig;
      }

      // 4. Load ALL answers to determine which attempts have data
      const { data: allAnswers, error: answersError } = await supabase
        .from('2V_student_answers')
        .select('question_id, created_at, updated_at, attempt_number, question_order')
        .eq('assignment_id', id)
        .order('question_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true, nullsFirst: false });

      if (answersError) throw answersError;

      if (!allAnswers || allAnswers.length === 0) {
        throw new Error('No answers found for this assignment');
      }

      const attemptsSet = new Set(allAnswers.map(a => a.attempt_number));

      // Auto-select most recent attempt with answers (first load only)
      let attemptToLoad = attemptOverride;
      if (attemptToLoad === null) {
        for (let i = assignmentData.current_attempt || 1; i >= 1; i--) {
          if (attemptsSet.has(i)) {
            attemptToLoad = i;
            setSelectedAttemptState(i);
            break;
          }
        }
      }
      if (attemptToLoad === null) {
        setLoading(false);
        return;
      }

      const answers = allAnswers.filter(a => a.attempt_number === attemptToLoad);

      // 5. Get completion_details for metadata
      const completionDetails = (assignmentData.completion_details || { attempts: [] }) as { attempts: any[] };
      const attemptRecord = completionDetails.attempts?.find(
        (a: any) => a.attempt_number === attemptToLoad,
      );

      // 6. Determine question IDs
      const isNonAdaptive = trackConfig?.adaptivity_mode === 'non_adaptive';
      const hasNoMacroSections = trackConfig?.section_order_mode !== 'macro_sections_mandatory';
      const shouldShowAllQuestions = isNonAdaptive && hasNoMacroSections;

      let questionIds: string[] = [];

      if (shouldShowAllQuestions) {
        const testId = assignmentData['2V_tests'].id;

        // Query 1: primary questions (test_id match)
        const { data: primaryQuestions, error: primaryError } = await supabase
          .from('2V_questions')
          .select('id, question_number')
          .eq('test_id', testId);

        if (primaryError) throw primaryError;

        // Query 2: questions shared via additional_test_ids
        const { data: sharedQuestions, error: sharedError } = await supabase
          .from('2V_questions')
          .select('id, question_number, additional_test_ids')
          .not('additional_test_ids', 'is', null);

        if (sharedError) throw sharedError;

        const filteredShared = (sharedQuestions || []).filter(
          q => Array.isArray(q.additional_test_ids) && q.additional_test_ids.includes(testId)
        );

        const combined = [...(primaryQuestions || []), ...filteredShared];
        const unique = Array.from(new Map(combined.map(q => [q.id, q])).values())
          .sort((a, b) => (a.question_number || 0) - (b.question_number || 0));

        questionIds = unique.map(q => q.id);
      } else if (answers.length > 0) {
        const seen = new Set<string>();
        questionIds = answers
          .filter(a => {
            if (seen.has(a.question_id)) return false;
            seen.add(a.question_id);
            return true;
          })
          .map(a => a.question_id);
      } else {
        throw new Error(`No answers found for attempt ${attemptToLoad}`);
      }

      // 7. Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('*')
        .in('id', questionIds);

      if (questionsError) throw questionsError;

      const questionMap = new Map((questionsData || []).map(q => [q.id, q]));

      let questions = questionIds
        .map(id => questionMap.get(id))
        .filter((q): q is NonNullable<typeof q> => q !== undefined) as unknown as Question[];

      // 8. Sort questions
      if (shouldShowAllQuestions) {
        const answerOrderMap = new Map(answers.map(a => [a.question_id, a.question_order ?? 999999]));
        questions.sort((a, b) => {
          const aHas = answerOrderMap.has(a.id);
          const bHas = answerOrderMap.has(b.id);
          if (aHas && bHas) return answerOrderMap.get(a.id)! - answerOrderMap.get(b.id)!;
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          return (a.question_number || 0) - (b.question_number || 0);
        });
      } else {
        const answerOrderMap = new Map(answers.map((a, idx) => [a.question_id, idx]));
        const answerCreatedAtMap = new Map(answers.map(a => [a.question_id, new Date(a.created_at).getTime()]));
        questions.sort((a, b) => {
          const oA = answerOrderMap.get(a.id) ?? 999999;
          const oB = answerOrderMap.get(b.id) ?? 999999;
          if (oA !== oB) return oA - oB;
          const tA = answerCreatedAtMap.get(a.id) ?? 999999999999999;
          const tB = answerCreatedAtMap.get(b.id) ?? 999999999999999;
          if (tA !== tB) return tA - tB;
          return (a.question_number || 0) - (b.question_number || 0);
        });
      }

      // 9. Metadata from completion_details
      const metadataMap = new Map<string, any>();
      if (attemptRecord?.test_questions) {
        attemptRecord.test_questions.forEach((tq: any) => {
          metadataMap.set(tq.question_id, { questionNumber: tq.question_number, difficulty: tq.difficulty });
        });
      }

      // 10. Load full student answers for this attempt
      const { data: allFullAnswers, error: fullAnswersError } = await supabase
        .from('2V_student_answers')
        .select('*')
        .eq('assignment_id', id);

      if (fullAnswersError) throw fullAnswersError;

      const fullAnswers = (allFullAnswers || []).filter(a => a.attempt_number === attemptToLoad);
      const answerMap = new Map(fullAnswers.map(a => [a.question_id, a]));

      // 11. Build unified questions
      const unifiedQuestions: UnifiedQuestionResult[] = questions.map((q, index) => {
        const sa = (answerMap.get(q.id) || null) as StudentAnswer | null;
        const correct = checkIfCorrect(q, sa);
        const answered = hasActualAnswer(sa);
        const metadata = metadataMap.get(q.id);

        return {
          questionId: q.id,
          question: {
            id: q.id,
            section: q.section,
            difficulty: metadata?.difficulty || q.difficulty || undefined,
            question_type: q.question_type,
            question_data: typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data,
            answers: typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers,
            topic: undefined,
            materia: q.materia,
            image_url: q.image_url,
            question_text: q.question_text,
            Questions_toReview: q.Questions_toReview || null,
          },
          order: index + 1,
          isCorrect: correct,
          hasAnswer: answered,
          timeSpentSeconds: sa?.time_spent_seconds,
          isFlagged: sa?.is_flagged ?? false,
          studentAnswer: sa?.answer,
          autoScore: sa?.auto_score ?? null,
          tutorScore: sa?.tutor_score ?? null,
          tutorFeedback: sa?.tutor_feedback ?? null,
        };
      });

      // 12. Compute scores
      const correctCount = unifiedQuestions.filter(q => q.isCorrect).length;
      const totalCount = unifiedQuestions.length;
      const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      // Total time from assignment timestamps
      let totalTimeSeconds: number | undefined;
      if (assignmentData.start_time && assignmentData.completed_at) {
        totalTimeSeconds = Math.floor(
          (new Date(assignmentData.completed_at).getTime() - new Date(assignmentData.start_time).getTime()) / 1000,
        );
      }

      // Difficulty breakdown from per-question data
      const diffBreakdown: DifficultyBreakdownData = {};
      unifiedQuestions.forEach(q => {
        const d = q.question.difficulty;
        if (!d) return;
        const key = typeof d === 'number'
          ? d <= 1 ? 'easy' : d <= 2 ? 'medium' : 'hard'
          : d === 'easy' || d === 'medium' || d === 'hard' ? d : undefined;
        if (!key) return;
        if (!diffBreakdown[key]) diffBreakdown[key] = { correct: 0, total: 0, unanswered: 0 };
        const entry = diffBreakdown[key]!;
        entry.total++;
        if (q.isCorrect) entry.correct++;
        if (!q.hasAnswer && entry.unanswered != null) entry.unanswered++;
      });

      const hasDifficultyData = Object.keys(diffBreakdown).length > 0;

      // Scaled scores
      const scaledScores = calculateScaledScores(unifiedQuestions, algorithmConfig);

      // Sections
      const sections = [...new Set(unifiedQuestions.map(q => q.question.section))];

      // Build title
      const studentName = studentData?.name || 'Student';
      const title = `Test Results - ${studentName}`;
      const subtitle = `${testType} - Test #${assignmentData['2V_tests'].test_number}`;

      const unified: UnifiedResultData = {
        source: 'regular',
        sourceId: id,
        title,
        subtitle,
        completedAt: assignmentData.completed_at ?? undefined,
        scoreRaw: correctCount,
        scoreTotal: totalCount,
        scorePercentage,
        totalTimeSeconds,
        questions: unifiedQuestions,
        sections,
        difficultyBreakdown: hasDifficultyData ? diffBreakdown : undefined,
        algorithmConfig,
        scaledScores: scaledScores ?? undefined,
        totalAttempts: assignmentData.total_attempts ?? 1,
        currentAttempt: attemptToLoad,
        attemptsWithAnswers: attemptsSet,
        resultsViewable: assignmentData.results_viewable_by_student ?? false,
        isStudentView,
        assignment: fullAssignment,
      };

      setData(unified);

      // Load attempt comparison if multiple attempts
      if (assignmentData.total_attempts > 1) {
        loadAttemptComparisonInner(id, assignmentData);
      }
    } catch (err) {
      console.error('Error loading regular test results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  /* ---- attempt comparison ---- */
  async function loadAttemptComparisonInner(
    assignId: string,
    assignment: any,
  ) {
    try {
      if (assignment.total_attempts <= 1) return;

      const { data: allAnswersForAssignment, error: allAnswersError } = await supabase
        .from('2V_student_answers')
        .select('*')
        .eq('assignment_id', assignId)
        .order('created_at', { ascending: true });

      if (allAnswersError) throw allAnswersError;
      if (!allAnswersForAssignment || allAnswersForAssignment.length === 0) return;

      const completionDetails = assignment.completion_details || { attempts: [] };
      const attempts: AttemptComparisonData[] = [];

      for (let attemptNum = 1; attemptNum <= assignment.total_attempts; attemptNum++) {
        const answersForAttempt = allAnswersForAssignment.filter(a => a.attempt_number === attemptNum);
        if (answersForAttempt.length === 0) continue;

        const questionIdsForAttempt = answersForAttempt.map(a => a.question_id);
        const { data: questionsData, error: questionsError } = await supabase
          .from('2V_questions')
          .select('*')
          .in('id', questionIdsForAttempt);

        if (questionsError) throw questionsError;

        const questionMap = new Map((questionsData || []).map(q => [q.id, q]));
        const questions = questionIdsForAttempt
          .map(qId => questionMap.get(qId))
          .filter((q): q is NonNullable<typeof q> => q !== undefined) as unknown as Question[];

        const answerMap = new Map(answersForAttempt.map(a => [a.question_id, a]));
        let correct = 0;
        let wrong = 0;
        let unanswered = 0;
        const sectionStats: Record<string, { correct: number; total: number; time: number }> = {};

        questions.forEach((q: Question) => {
          const sa = (answerMap.get(q.id) || null) as StudentAnswer | null;
          const isCorrect = checkIfCorrect(q, sa);
          const answered = hasActualAnswer(sa);

          if (!answered) unanswered++;
          else if (isCorrect) correct++;
          else wrong++;

          if (!sectionStats[q.section]) sectionStats[q.section] = { correct: 0, total: 0, time: 0 };
          sectionStats[q.section].total++;
          if (isCorrect) sectionStats[q.section].correct++;
          if (sa) sectionStats[q.section].time += sa.time_spent_seconds || 0;
        });

        const attemptRecord = completionDetails.attempts?.find((a: any) => a.attempt_number === attemptNum);
        let totalTime = 0;
        if (attemptRecord?.started_at && attemptRecord?.completed_at) {
          totalTime = Math.floor(
            (new Date(attemptRecord.completed_at).getTime() - new Date(attemptRecord.started_at).getTime()) / 1000,
          );
        } else {
          totalTime = answersForAttempt.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0);
        }

        attempts.push({
          attemptNumber: attemptNum,
          correct,
          wrong,
          unanswered,
          total: questions.length,
          score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
          totalTime,
          avgTimePerQuestion: totalTime > 0 && questions.length > 0 ? Math.round(totalTime / questions.length) : 0,
          sectionStats,
        });
      }

      setAttemptComparison(attempts);
    } catch {
      // silently ignore comparison load errors
    }
  }

  /* ---- actions ---- */

  function setSelectedAttempt(attempt: number) {
    setSelectedAttemptState(attempt);
  }

  async function toggleResultsViewabilityAction() {
    if (!assignmentId || !dataRef.current) return;
    try {
      setTogglingViewability(true);
      const newValue = !(dataRef.current.resultsViewable ?? false);

      const { error } = await supabase
        .from('2V_test_assignments')
        .update({ results_viewable_by_student: newValue })
        .eq('id', assignmentId);

      if (error) {
        alert('Failed to update results viewability. Please try again.');
        return;
      }

      setData(prev => prev ? { ...prev, resultsViewable: newValue } : prev);
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setTogglingViewability(false);
    }
  }

  function saveQuestionReview(questionId: string, needsReview: boolean, notes: string) {
    if (!currentUserId) return;

    // Debounce via timeouts ref
    const existing = reviewTimeoutsRef.current.get(questionId);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(async () => {
      const reviewData = needsReview
        ? { needs_review: needsReview, notes: notes || '', flagged_by: currentUserId, flagged_at: new Date().toISOString() }
        : null;

      const { error } = await supabase
        .from('2V_questions')
        .update({ Questions_toReview: reviewData } as any)
        .eq('id', questionId);

      if (error) console.error('Failed to save question review:', error);
    }, 500);

    reviewTimeoutsRef.current.set(questionId, timeout);
  }

  return {
    data,
    loading,
    error,
    selectedAttempt,
    setSelectedAttempt,
    attemptComparison,
    toggleResultsViewability: toggleResultsViewabilityAction,
    togglingViewability,
    saveQuestionReview,
  };
}
