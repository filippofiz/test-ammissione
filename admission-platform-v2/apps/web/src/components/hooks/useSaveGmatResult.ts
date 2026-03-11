/**
 * useSaveGmatResult Hook
 *
 * Handles all GMAT-specific result saving to 2V_gmat_assessment_results.
 * Called from TakeTestPage.submitTest() when isGmatMode === true.
 *
 * Mirrors the pattern of useSaveCompletionDetails — single useCallback,
 * returns { saveGmatResult }.
 */

import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import {
  savePlacementAssessmentResult,
  saveSectionAssessmentResult,
  saveMockSimulationResult,
  lockSimulation,
  getStudentGMATProgress,
  type GmatSection,
  type GmatAssessmentResult,
} from '@/lib/api/gmat';
import {
  estimateThetaFromResponses,
  applyUnansweredPenalty,
  thetaToSectionScore,
  getSectionPercentile,
  GmatScoringAlgorithm,
} from '@/lib/algorithms/gmatScoringAlgorithm';
import { checkAnswerCorrectness } from '@/lib/gmat/answerChecking';
import type { Question, StudentAnswer } from '@/types/test';

// Full section name mapping for IRT percentile lookup
const SECTION_CODE_TO_FULL: Record<GmatSection, string> = {
  QR: 'Quantitative Reasoning',
  DI: 'Data Insights',
  VR: 'Verbal Reasoning',
};

export interface UseSaveGmatResultParams {
  isGmatMode: boolean;
  gmatAssessmentType: 'placement' | 'section' | 'simulation' | undefined;
  gmatSection: GmatSection | undefined;
  studentId: string | null;
  selectedQuestions: Question[];
  answers: Record<string, StudentAnswer>;
  sectionThetasRef: MutableRefObject<Record<string, { theta: number; se: number }>>;
  bookmarkedQuestions: Set<string>;
  sections: string[];
  timeRemaining: number | null;
  initialTimeSeconds: number | null;
}

/**
 * Build per-question answer data and scoring stats for a list of questions.
 */
function buildAnswerStats(questions: Question[], answers: Record<string, StudentAnswer>) {
  const perQuestionAnswersData: Record<string, {
    answer: string | string[] | Record<string, string>;
    time_spent_seconds: number;
    is_correct: boolean;
    is_unanswered?: boolean;
  }> = {};

  const difficultyBreakdown: Record<string, { correct: number; total: number; unanswered: number }> = {
    easy: { correct: 0, total: 0, unanswered: 0 },
    medium: { correct: 0, total: 0, unanswered: 0 },
    hard: { correct: 0, total: 0, unanswered: 0 },
  };

  const responsePattern: Array<{
    isCorrect: boolean;
    difficulty: string;
    questionType?: string;
    diSubtype?: string | null;
    questionId: string;
  }> = [];

  let correctCount = 0;
  let unansweredCount = 0;
  let totalTimeSeconds = 0;

  for (const question of questions) {
    const difficulty = (question.difficulty || 'medium').toString().toLowerCase();
    if (difficultyBreakdown[difficulty]) {
      difficultyBreakdown[difficulty].total++;
    }

    const userAnswer = answers[question.id];
    const isUnanswered = !userAnswer || userAnswer.answer === '__UNANSWERED__' || userAnswer.answer === null;

    if (isUnanswered) {
      unansweredCount++;
      if (difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty].unanswered++;
      }
      perQuestionAnswersData[question.id] = {
        answer: '',
        time_spent_seconds: userAnswer?.timeSpent || 0,
        is_correct: false,
        is_unanswered: true,
      };
      totalTimeSeconds += userAnswer?.timeSpent || 0;
      continue;
    }

    const answersData = typeof question.answers === 'string'
      ? JSON.parse(question.answers)
      : question.answers;
    const correctAnswer = answersData?.correct_answer;

    const questionData = typeof question.question_data === 'string'
      ? JSON.parse(question.question_data)
      : question.question_data;

    const diType = questionData?.di_type as string | null | undefined;

    // Reconstruct the raw answer value as the GMAT pages stored it
    let rawAnswer: unknown = userAnswer.answer;
    if (diType === 'MSR' && userAnswer.msrAnswers) rawAnswer = userAnswer.msrAnswers;
    else if (diType === 'GI') rawAnswer = [userAnswer.blank1, userAnswer.blank2];
    else if (diType === 'TA') rawAnswer = userAnswer.taAnswers;
    else if (diType === 'TPA') rawAnswer = { col1: userAnswer.column1, col2: userAnswer.column2 };

    const isCorrect = checkAnswerCorrectness(rawAnswer, correctAnswer, diType);

    if (isCorrect) {
      correctCount++;
      if (difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty].correct++;
      }
    }

    responsePattern.push({
      isCorrect,
      difficulty,
      questionType: question.question_type,
      diSubtype: diType || null,
      questionId: question.id,
    });

    perQuestionAnswersData[question.id] = {
      answer: userAnswer.answer as string | string[] | Record<string, string>,
      time_spent_seconds: userAnswer.timeSpent,
      is_correct: isCorrect,
      is_unanswered: false,
    };

    totalTimeSeconds += userAnswer.timeSpent;
  }

  return {
    perQuestionAnswersData,
    difficultyBreakdown,
    responsePattern,
    correctCount,
    unansweredCount,
    totalTimeSeconds,
  };
}

export function useSaveGmatResult(params: UseSaveGmatResultParams) {
  const {
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
    initialTimeSeconds,
  } = params;

  const saveGmatResult = useCallback(async (): Promise<GmatAssessmentResult | null> => {
    if (!isGmatMode || !studentId || !gmatAssessmentType) return null;

    const bookmarkedIds = Array.from(bookmarkedQuestions);
    const questionIds = selectedQuestions.map(q => q.id);

    // Total time = initial seconds minus remaining, fallback to summing per-question times
    const totalTimeSeconds = initialTimeSeconds != null
      ? Math.max(0, initialTimeSeconds * 60 - (timeRemaining ?? 0))
      : Object.values(answers).reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    try {
      // --- PLACEMENT ---
      if (gmatAssessmentType === 'placement') {
        const {
          perQuestionAnswersData,
          difficultyBreakdown,
          correctCount,
        } = buildAnswerStats(selectedQuestions, answers);

        return await savePlacementAssessmentResult(
          studentId,
          correctCount,
          selectedQuestions.length,
          difficultyBreakdown as GmatAssessmentResult['difficulty_breakdown'],
          questionIds,
          totalTimeSeconds,
          perQuestionAnswersData,
          bookmarkedIds,
        );
      }

      // --- SECTION ASSESSMENT ---
      if (gmatAssessmentType === 'section' && gmatSection) {
        const {
          perQuestionAnswersData,
          difficultyBreakdown,
          responsePattern,
          correctCount,
          unansweredCount,
        } = buildAnswerStats(selectedQuestions, answers);

        const { theta, se, perItemDetails } = estimateThetaFromResponses(responsePattern);
        const adjustedTheta = applyUnansweredPenalty(theta, unansweredCount);
        const sectionScore = thetaToSectionScore(adjustedTheta);
        const sectionFullName = SECTION_CODE_TO_FULL[gmatSection];
        const percentile = getSectionPercentile(sectionFullName as Parameters<typeof getSectionPercentile>[0], sectionScore);

        const responsePatternDetails = perItemDetails.map((item, i) => ({
          ...item,
          questionId: responsePattern[i]?.questionId,
        }));

        // Get student cycle for metadata
        const progress = await getStudentGMATProgress(studentId).catch(() => null);
        const studentCycle = progress?.gmat_cycle as string | undefined;

        return await saveSectionAssessmentResult(
          studentId,
          gmatSection,
          correctCount,
          selectedQuestions.length,
          difficultyBreakdown as GmatAssessmentResult['difficulty_breakdown'],
          questionIds,
          totalTimeSeconds,
          perQuestionAnswersData,
          bookmarkedIds,
          sectionScore,
          theta,
          adjustedTheta,
          se,
          unansweredCount,
          percentile,
          studentCycle,
          responsePatternDetails,
        );
      }

      // --- SIMULATION ---
      if (gmatAssessmentType === 'simulation') {
        type GmatSectionKey = GmatSection;
        const sectionOrder = (sections.length > 0 ? sections : ['QR', 'DI', 'VR']) as GmatSectionKey[];

        const sectionScores: Record<GmatSectionKey, {
          score_raw: number;
          score_total: number;
          score_percentage: number;
          difficulty_breakdown: Record<string, { correct: number; total: number; unanswered: number }>;
        }> = {} as any;

        const allPerQuestionData: Record<string, {
          answer: string | string[] | Record<string, string>;
          time_spent_seconds: number;
          is_correct: boolean;
          is_unanswered?: boolean;
        }> = {};

        const scorer = new GmatScoringAlgorithm();
        const sectionThetas: Record<GmatSectionKey, number> = {} as any;

        let totalCorrect = 0;
        let totalQuestionsCount = 0;

        for (const sec of sectionOrder) {
          const secQs = selectedQuestions.filter(q => q.section === sec);
          if (secQs.length === 0) continue;

          const {
            perQuestionAnswersData,
            difficultyBreakdown,
            responsePattern,
            correctCount,
            unansweredCount,
          } = buildAnswerStats(secQs, answers);

          Object.assign(allPerQuestionData, perQuestionAnswersData);

          // Use captured theta from sectionThetasRef if available (from adaptive algorithm),
          // otherwise compute from response pattern
          const capturedTheta = sectionThetasRef.current[sec];
          let adjustedTheta: number;
          if (capturedTheta) {
            adjustedTheta = applyUnansweredPenalty(capturedTheta.theta, unansweredCount);
          } else {
            const { theta } = estimateThetaFromResponses(responsePattern);
            adjustedTheta = applyUnansweredPenalty(theta, unansweredCount);
          }

          sectionThetas[sec] = adjustedTheta;

          totalCorrect += correctCount;
          totalQuestionsCount += secQs.length;

          sectionScores[sec] = {
            score_raw: correctCount,
            score_total: secQs.length,
            score_percentage: secQs.length > 0 ? (correctCount / secQs.length) * 100 : 0,
            difficulty_breakdown: difficultyBreakdown,
          };
        }

        // Calculate composite score
        scorer.calculateFromThetas(
          sectionThetas['QR'] ?? 0,
          sectionThetas['VR'] ?? 0,
          sectionThetas['DI'] ?? 0,
          true,
        );

        const allQuestionIds = sectionOrder.flatMap(sec =>
          selectedQuestions.filter(q => q.section === sec).map(q => q.id)
        );

        const result = await saveMockSimulationResult(
          studentId,
          totalCorrect,
          totalQuestionsCount,
          sectionScores as any,
          allQuestionIds,
          totalTimeSeconds,
          allPerQuestionData,
          bookmarkedIds,
        );

        // Lock simulation after successful save (non-critical)
        try {
          await lockSimulation(studentId);
        } catch {
          console.warn('[useSaveGmatResult] Failed to lock simulation after completion');
        }

        return result;
      }

      return null;
    } catch (err) {
      console.error('[useSaveGmatResult] Error saving GMAT result:', err);
      return null;
    }
  }, [
    isGmatMode, gmatAssessmentType, gmatSection, studentId,
    selectedQuestions, answers, sectionThetasRef, bookmarkedQuestions,
    sections, timeRemaining, initialTimeSeconds,
  ]);

  return { saveGmatResult };
}
