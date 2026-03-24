/**
 * useGmatResults Hook
 *
 * Loads GMAT assessment results from 2V_gmat_assessment_results
 * and normalizes them into UnifiedResultData.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  calculateEstimatedGmatScore,
  SECTION_ASSESSMENT_CONFIG,
  type GmatSection,
  type GmatAssessmentResult,
  type GmatAssessmentType,
  type GmatCycle,
} from '../../lib/api/gmat';
import { computeGmatScoreFromSections } from '../../lib/gmat/scoreComputation';
import type { UnifiedResultData, UnifiedQuestionResult } from './types';
import { getAssessmentTypeLabel, formatTopicName } from './types';
import { checkAnswerCorrectness } from '../../lib/gmat/answerChecking';

export interface UseGmatResultsReturn {
  data: UnifiedResultData | null;
  loading: boolean;
  error: string | null;
  /** Raw GMAT assessment record for features that need it */
  assessment: GmatAssessmentResult | null;
}

export function useGmatResults(assessmentId: string | undefined): UseGmatResultsReturn {
  const [data, setData] = useState<UnifiedResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<GmatAssessmentResult | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      setError('No assessment ID provided');
      setLoading(false);
      return;
    }
    loadResults(assessmentId);
  }, [assessmentId]);

  async function loadResults(id: string) {
    try {
      setLoading(true);
      setError(null);

      // Load assessment result
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('2V_gmat_assessment_results')
        .select('*')
        .eq('id', id)
        .single();

      if (assessmentError) throw assessmentError;
      if (!assessmentData) throw new Error('Assessment not found');

      const result: GmatAssessmentResult = {
        ...assessmentData,
        assessment_type: assessmentData.assessment_type as GmatAssessmentType,
        suggested_cycle: assessmentData.suggested_cycle as GmatCycle | null,
        assigned_cycle: assessmentData.assigned_cycle as GmatCycle | null,
        difficulty_breakdown: assessmentData.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
        answers_data: assessmentData.answers_data as GmatAssessmentResult['answers_data'],
        bookmarked_question_ids: assessmentData.bookmarked_question_ids as string[] | null,
      };

      setAssessment(result);

      // Parse answers_data and bookmarks
      const answersData = assessmentData.answers_data as Record<string, {
        answer: any;
        time_spent_seconds: number;
        is_correct: boolean;
        is_unanswered?: boolean;
      }> | null;
      const bookmarkedIds = new Set(assessmentData.bookmarked_question_ids || []);
      const hasAnswersData = answersData && Object.keys(answersData).length > 0;

      // Load questions
      let questions: UnifiedQuestionResult[] = [];
      if (assessmentData.question_ids && assessmentData.question_ids.length > 0) {
        const { data: questionsData, error: questionsError } = await supabase
          .from('2V_questions')
          .select('*')
          .in('id', assessmentData.question_ids);

        if (questionsError) throw questionsError;

        // Sort by original question_ids order
        const orderMap = new Map(
          assessmentData.question_ids.map((qid: string, idx: number) => [qid, idx])
        );
        const sortedQuestions = (questionsData || []).sort((a, b) => {
          return (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999);
        });

        questions = sortedQuestions.map((q, index) => {
          const answerData = answersData?.[q.id];
          const questionDataParsed = typeof q.question_data === 'string'
            ? JSON.parse(q.question_data)
            : q.question_data;
          const answersParsed = typeof q.answers === 'string'
            ? JSON.parse(q.answers)
            : q.answers;

          // Always recompute isCorrect from the raw student answer and correct answer.
          // This fixes legacy results where is_correct was stored incorrectly (e.g. due to
          // TA JSON.stringify key-order bug or DS comparison failure that stored false for
          // correct answers). Recomputing at display time is always accurate.
          let isCorrect: boolean;
          if (answerData?.answer != null && !answerData.is_unanswered) {
            isCorrect = checkAnswerCorrectness(
              answerData.answer,
              answersParsed?.correct_answer,
              questionDataParsed?.di_type,
            );
          } else {
            isCorrect = false;
          }

          return {
            questionId: q.id,
            question: {
              id: q.id,
              section: q.section,
              difficulty: q.difficulty ?? undefined,
              question_type: q.question_type,
              question_data: questionDataParsed,
              answers: answersParsed,
              topic: q.topic ?? undefined,
            },
            order: index + 1,
            isCorrect,
            hasAnswer: hasAnswersData ? !(answerData?.is_unanswered) : true,
            timeSpentSeconds: answerData?.time_spent_seconds,
            isBookmarked: bookmarkedIds.has(q.id),
            studentAnswer: answerData?.answer,
          };
        });
      }

      // Build title
      const isMock = result.assessment_type === 'mock';
      const typeLabel = getAssessmentTypeLabel(result.assessment_type);
      const sectionName = result.section
        ? SECTION_ASSESSMENT_CONFIG[result.section as GmatSection]?.fullName || result.section
        : null;
      const title = sectionName ? `${typeLabel} - ${sectionName}` : typeLabel;

      // Subtitle
      const subtitle = result.topic ? formatTopicName(result.topic) : result.id;

      // Sections from questions
      const sections = [...new Set(questions.map(q => q.question.section))];

      // Estimated GMAT score (mock only)
      // For mocks: compute per-section scores via calibrated IRT algorithm for better accuracy
      let estimatedGmatScore: number | undefined;
      let gmatSectionScores: Record<string, number> | undefined;
      let gmatPercentile: number | undefined;
      let gmatScoreBand: string | undefined;

      if (isMock) {
        // Build per-section raw/total from questions for IRT computation.
        // Use stored metadata.section_scores when available (avoids recomputing from
        // question list which may be incomplete), otherwise fall back to live count.
        const metadataSections = (result as any).metadata?.section_scores as
          Record<string, { score_raw: number; score_total: number }> | undefined;

        let sectionsForComputation: Record<string, { score_raw: number; score_total: number }>;

        if (metadataSections && Object.keys(metadataSections).length > 0) {
          sectionsForComputation = metadataSections;
        } else {
          // Fall back: count from recomputed question results
          const sectionGroups: Record<string, { score_raw: number; score_total: number }> = {};
          for (const q of questions) {
            const section = q.question.section;
            if (!sectionGroups[section]) sectionGroups[section] = { score_raw: 0, score_total: 0 };
            sectionGroups[section].score_total++;
            if (q.isCorrect) sectionGroups[section].score_raw++;
          }
          sectionsForComputation = sectionGroups;
        }

        const computed = computeGmatScoreFromSections(sectionsForComputation);
        if (computed) {
          estimatedGmatScore = computed.totalScore;
          gmatSectionScores = computed.sectionScores;
          gmatPercentile = computed.percentile;
          gmatScoreBand = computed.scoreBand;
        } else {
          // Partial mock (not all 3 sections) — fall back to percentage-based estimate
          estimatedGmatScore = calculateEstimatedGmatScore(result.score_percentage);
        }
      }

      // Recompute scoreRaw from per-question isCorrect values when question data is available.
      // This fixes legacy results where score_raw was stored as 0 due to answer-checking bugs
      // (e.g. TA JSON.stringify key-order issue, DS comparison failure).
      let scoreRaw = result.score_raw;
      let scoreTotal = result.score_total;
      let scorePercentage = result.score_percentage;
      if (questions.length > 0 && hasAnswersData) {
        const recomputedCorrect = questions.filter(q => q.isCorrect).length;
        scoreRaw = recomputedCorrect;
        scoreTotal = questions.length;
        scorePercentage = scoreTotal > 0 ? (scoreRaw / scoreTotal) * 100 : 0;
      }

      const unified: UnifiedResultData = {
        source: 'gmat',
        sourceId: id,
        title,
        subtitle,
        completedAt: result.completed_at ?? undefined,
        scoreRaw,
        scoreTotal,
        scorePercentage,
        totalTimeSeconds: result.time_spent_seconds ?? undefined,
        questions,
        sections,
        estimatedGmatScore,
        gmatSectionScores,
        gmatPercentile,
        gmatScoreBand,
        difficultyBreakdown: result.difficulty_breakdown,
        assessmentType: result.assessment_type,
        gmatSection: result.section ?? undefined,
        topicName: result.topic ? formatTopicName(result.topic) : undefined,
      };

      setData(unified);
    } catch (err) {
      console.error('Error loading GMAT results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, assessment };
}
