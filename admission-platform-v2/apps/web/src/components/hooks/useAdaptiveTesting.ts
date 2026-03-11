/**
 * useAdaptiveTesting
 *
 * Extracts all adaptive question-selection logic from TakeTestPage:
 *   - Base-question completion tracking per section
 *   - Next-question selection via algorithm (or random/sequential fallback)
 *   - GMAT Data Insights subtype balancing (DS/GI/TA/TPA/MSR)
 *   - MSR/TA group handling (related questions added together)
 *   - Per-section base-question reset when moving to a new section
 *   - GMAT IRT theta capture before section reset
 *
 * TakeTestPage still calls completeSection() and setCurrentQuestionIndex()
 * itself; this hook returns helper functions that perform the adaptive
 * book-keeping and return the *action* to take (add questions, advance,
 * complete section).
 */

import { useState, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { ComplexAdaptiveAlgorithm } from '@/lib/algorithms/adaptiveAlgorithm';
import type { SimpleAdaptiveAlgorithm } from '@/lib/algorithms/adaptiveAlgorithm';
import type { TestConfig, Question, StudentAnswer } from '@/types/test';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdaptiveAction =
  | { type: 'advance'; newIndex: number; newGlobalOrder: number }
  | { type: 'add_and_advance'; questions: Question[]; newIndex: number; newGlobalOrder: number }
  | { type: 'complete_section' }
  | { type: 'no_op' };

export interface UseAdaptiveTestingParams {
  config: TestConfig | null;
  currentSection: string;
  currentQuestionIndex: number;
  globalQuestionOrder: number;
  selectedQuestions: Question[];
  questionPool: Question[];
  answers: Record<string, StudentAnswer>;
  adaptiveAlgorithm: SimpleAdaptiveAlgorithm | ComplexAdaptiveAlgorithm | null;
  /** Ref shared with submitTest so both can read/write GMAT IRT thetas */
  sectionThetasRef: MutableRefObject<Record<string, { theta: number; se: number }>>;
}

export interface UseAdaptiveTestingReturn {
  baseQuestionsCompletedPerSection: Record<string, boolean>;
  /**
   * Decide what to do for the next adaptive question.
   * Call this from goToNextQuestion when config.adaptivity_mode === 'adaptive'.
   * Returns an AdaptiveAction describing what TakeTestPage should do next.
   */
  selectNextAdaptiveAction: () => Promise<AdaptiveAction>;
  /**
   * Prepare base questions for a new section.
   * Returns the array of base questions to add to selectedQuestions.
   * Also resets the algorithm state and captures GMAT theta if needed.
   * Call this from moveToNextSection when use_base_questions + per_section.
   */
  prepareBaseQuestionsForSection: (nextSection: string, completedSection: string) => Question[];
}

// ---------------------------------------------------------------------------
// Internal helpers (pure, no React)
// ---------------------------------------------------------------------------

function getSectionField(question: Question, config: TestConfig | null): string {
  return config?.section_order_mode?.includes('macro_sections') && question.macro_section
    ? question.macro_section
    : (question.section ?? '');
}

function matchesDifficulty(question: Question, targetDifficulty: number | string): boolean {
  const qDiff = question.difficulty;
  if (typeof qDiff === typeof targetDifficulty) return qDiff === targetDifficulty;
  const numToStr: Record<number, string> = { 1: 'easy', 2: 'medium', 3: 'hard' };
  const strToNum: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
  if (typeof targetDifficulty === 'number' && typeof qDiff === 'string') {
    return numToStr[targetDifficulty]?.toLowerCase() === qDiff.toLowerCase();
  }
  if (typeof targetDifficulty === 'string' && typeof qDiff === 'number') {
    return strToNum[targetDifficulty.toLowerCase()] === qDiff;
  }
  return false;
}

function getSourceGroupKey(question: Question): string | null {
  const diType = question.question_data?.di_type;
  if (diType === 'MSR' && question.question_data?.sources) {
    const key = question.question_data.sources
      .map((s: any) => `${s.tab_name}:${s.content_type}:${(s.content || '').substring(0, 100)}`)
      .join('|');
    return `MSR:${key}`;
  }
  if (diType === 'TA' && question.question_data?.table_data) {
    const title   = question.question_data.table_title ?? '';
    const firstRow = question.question_data.table_data?.[0]?.join(',') ?? '';
    const headers  = question.question_data.column_headers?.join(',') ?? '';
    return `TA:${title}:${headers}:${firstRow}`;
  }
  return null;
}

function findRelatedQuestions(question: Question, pool: Question[]): Question[] {
  const groupKey = getSourceGroupKey(question);
  if (!groupKey) return [question];
  const related = pool.filter(q => getSourceGroupKey(q) === groupKey);
  return related.length > 0 ? related : [question];
}

/**
 * Count how many effective questions would exist after adding `newQuestions`.
 * MSR/TA groups count as 1 effective question (regardless of sub-question count).
 */
function calculateEffectiveCount(allQuestions: Question[]): number {
  const groupKeys = new Set<string>();
  let individualCount = 0;
  for (const q of allQuestions) {
    const key = getSourceGroupKey(q);
    if (key) {
      groupKeys.add(key);
    } else {
      individualCount++;
    }
  }
  return groupKeys.size + individualCount;
}

function pickBaseQuestions(
  questionPool: Question[],
  section: string,
  config: TestConfig
): Question[] {
  const baseCount = config.base_questions_count ?? 0;
  const baselineDifficulty = config.baseline_difficulty ?? 2;
  const isRandom = config.question_order === 'random';

  const getSection = (q: Question) => getSectionField(q, config);

  let candidates = questionPool.filter(
    q => getSection(q) === section && matchesDifficulty(q, baselineDifficulty)
  );

  if (candidates.length < baseCount) {
    // Fallback: use all questions in the section
    const allInSection = questionPool.filter(q => getSection(q) === section);
    candidates = isRandom ? [...allInSection].sort(() => Math.random() - 0.5) : allInSection;
  } else if (isRandom) {
    candidates = [...candidates].sort(() => Math.random() - 0.5);
  }

  const selected = candidates.slice(0, baseCount);
  selected.forEach(q => { q.is_base = true; });
  return selected;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAdaptiveTesting(params: UseAdaptiveTestingParams): UseAdaptiveTestingReturn {
  const {
    config,
    currentSection,
    currentQuestionIndex,
    globalQuestionOrder,
    selectedQuestions,
    questionPool,
    answers,
    adaptiveAlgorithm,
    sectionThetasRef,
  } = params;

  const [baseQuestionsCompletedPerSection, setBaseQuestionsCompletedPerSection] =
    useState<Record<string, boolean>>({});

  // -------------------------------------------------------------------------
  // selectNextAdaptiveAction
  // -------------------------------------------------------------------------

  const selectNextAdaptiveAction = useCallback(async (): Promise<AdaptiveAction> => {
    if (!config) return { type: 'no_op' };

    // --- Determine whether base questions for this section are complete ---
    let baseComplete = false;

    if (config.use_base_questions && config.base_questions_scope === 'per_section') {
      const sectionQuestions = selectedQuestions.filter(
        q => getSectionField(q, config) === currentSection
      );
      const baselineInSection = sectionQuestions.filter(q => q.is_base);
      baseComplete = (currentQuestionIndex + 1) >= baselineInSection.length;

      if (!baseQuestionsCompletedPerSection[currentSection] && baseComplete) {
        setBaseQuestionsCompletedPerSection(prev => ({ ...prev, [currentSection]: true }));
      }
    } else {
      if (adaptiveAlgorithm) {
        baseComplete = adaptiveAlgorithm.getState().base_questions_completed;
      } else {
        baseComplete = selectedQuestions.length >= (config.base_questions_count ?? 0);
      }
    }

    if (!baseComplete) {
      // Still in base phase — standard sequential advance
      if (currentQuestionIndex < selectedQuestions.filter(q => getSectionField(q, config) === currentSection).length - 1) {
        return {
          type: 'advance',
          newIndex: currentQuestionIndex + 1,
          newGlobalOrder: globalQuestionOrder + 1,
        };
      }
      return { type: 'no_op' };
    }

    // --- Base complete: select next adaptive question ---

    const sectionSelected = selectedQuestions.filter(
      q => getSectionField(q, config) === currentSection
    );
    const sectionLimit = config.questions_per_section?.[currentSection] ?? 20;

    // Check effective questions answered so far
    const answeredCount = currentQuestionIndex + 1;
    const answeredSoFar = sectionSelected.slice(0, answeredCount);
    const effectiveAnswered = calculateEffectiveCount(answeredSoFar);

    if (effectiveAnswered >= sectionLimit) {
      return { type: 'complete_section' };
    }

    const answeredIds = new Set(sectionSelected.map(q => q.id));
    const available = questionPool.filter(
      q => !answeredIds.has(q.id) && getSectionField(q, config) === currentSection
    );

    if (available.length === 0) {
      return { type: 'complete_section' };
    }

    // --- GMAT DI subtype balancing ---
    const isDISection =
      currentSection?.toLowerCase().includes('data insights') ||
      currentSection?.toLowerCase().includes(' di') ||
      available.some(q => q.question_data?.di_type);

    if (isDISection) {
      const DI_TYPES = ['DS', 'GI', 'TA', 'TPA', 'MSR'] as const;
      const MIN_PER_TYPE: Record<string, number> = { DS: 2, GI: 2, TA: 2, TPA: 2, MSR: 2 };

      const selectedPerType: Record<string, number> = {};
      for (const type of DI_TYPES) {
        selectedPerType[type] = sectionSelected.filter(q => q.question_data?.di_type === type).length;
      }

      const underrepresented = DI_TYPES.filter(t => selectedPerType[t] < MIN_PER_TYPE[t]);

      if (underrepresented.length > 0) {
        const priorityPool = available.filter(q =>
          q.question_data?.di_type && underrepresented.includes(q.question_data.di_type as any)
        );

        if (priorityPool.length > 0) {
          const forced = priorityPool[Math.floor(Math.random() * priorityPool.length)];
          const group = findRelatedQuestions(forced, available);
          group.forEach(q => { q.is_base = false; });

          const projected = calculateEffectiveCount([...sectionSelected, ...group]);
          if (projected > sectionLimit) return { type: 'complete_section' };

          return {
            type: 'add_and_advance',
            questions: group,
            newIndex: currentQuestionIndex + 1,
            newGlobalOrder: globalQuestionOrder + 1,
          };
        }
      }
    }

    // --- Normal adaptive selection ---
    let nextQuestion: Question | undefined;

    if (adaptiveAlgorithm) {
      const selected = await adaptiveAlgorithm.selectNextQuestion(available, currentSection);
      nextQuestion = (selected as Question | null) ?? undefined;
    } else if (config.question_order === 'random') {
      nextQuestion = available[Math.floor(Math.random() * available.length)];
    } else {
      nextQuestion = available[0];
    }

    if (!nextQuestion) {
      return { type: 'complete_section' };
    }

    const diType = nextQuestion.question_data?.di_type;
    const group = (diType === 'MSR' || diType === 'TA')
      ? findRelatedQuestions(nextQuestion, available)
      : [nextQuestion];

    group.forEach(q => { q.is_base = false; });

    const projected = calculateEffectiveCount([...sectionSelected, ...group]);
    if (projected > sectionLimit) return { type: 'complete_section' };

    return {
      type: 'add_and_advance',
      questions: group,
      newIndex: currentQuestionIndex + 1,
      newGlobalOrder: globalQuestionOrder + 1,
    };
  }, [
    config, currentSection, currentQuestionIndex, globalQuestionOrder,
    selectedQuestions, questionPool, answers, adaptiveAlgorithm,
    baseQuestionsCompletedPerSection,
  ]);

  // -------------------------------------------------------------------------
  // prepareBaseQuestionsForSection
  // -------------------------------------------------------------------------

  const prepareBaseQuestionsForSection = useCallback(
    (nextSection: string, completedSection: string): Question[] => {
      if (!config) return [];
      if (
        config.adaptivity_mode !== 'adaptive' ||
        !config.use_base_questions ||
        config.base_questions_scope !== 'per_section'
      ) return [];

      // Capture GMAT IRT theta for the completed section before resetting
      if (
        adaptiveAlgorithm instanceof ComplexAdaptiveAlgorithm &&
        config.test_type === 'GMAT' &&
        completedSection
      ) {
        const thetaData = {
          theta: adaptiveAlgorithm.getFinalTheta(),
          se: adaptiveAlgorithm.getFinalSE(),
        };
        sectionThetasRef.current = { ...sectionThetasRef.current, [completedSection]: thetaData };
      }

      // Reset algorithm state for new section
      adaptiveAlgorithm?.resetForNewSection();

      return pickBaseQuestions(questionPool, nextSection, config);
    },
    [config, adaptiveAlgorithm, questionPool, sectionThetasRef]
  );

  return {
    baseQuestionsCompletedPerSection,
    selectNextAdaptiveAction,
    prepareBaseQuestionsForSection,
  };
}
