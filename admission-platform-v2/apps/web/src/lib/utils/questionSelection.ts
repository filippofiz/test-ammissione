/**
 * Question Selection Utilities
 *
 * Pure functions for selecting and organizing test questions.
 * Extracted from TakeTestPage to reduce file size.
 *
 * Handles:
 * - Static question selection (with section limits)
 * - Adaptive base question selection
 * - GMAT DI subtype representation (DS, GI, TA, TPA, MSR)
 * - Related question grouping (MSR/TA sets sharing source data)
 */

/** Minimal question shape needed by selection logic */
export interface SelectableQuestion {
  id: string;
  section: string;
  macro_section?: string;
  question_number: number;
  question_type: string;
  difficulty: string;
  is_base?: boolean;
  question_data: {
    di_type?: 'DS' | 'MSR' | 'TPA' | 'GI' | 'TA';
    sources?: Array<{
      content?: string;
      tab_name: string;
      content_type: string;
      table_data?: string[][];
      table_headers?: string[];
    }>;
    table_data?: string[][];
    table_title?: string;
    column_headers?: string[];
    [key: string]: any;
  };
  answers: any;
  [key: string]: any;
}

/** Minimal config shape needed by selection logic */
export interface SelectionConfig {
  section_order_mode: string;
  question_order?: 'random' | 'sequential';
  adaptivity_mode?: 'adaptive' | 'non_adaptive' | 'static';
  use_base_questions?: boolean;
  base_questions_scope?: 'per_section' | 'entire_test';
  base_questions_count?: number;
  baseline_difficulty?: number | string;
  questions_per_section?: Record<string, number>;
  total_questions?: number;
}

/**
 * Generate a hash key for MSR/TA questions to identify shared sources.
 * Questions with the same source data should be presented together.
 */
export function getSourceGroupKey(question: SelectableQuestion): string | null {
  const diType = question.question_data?.di_type;

  if (diType === 'MSR' && question.question_data?.sources) {
    const sources = question.question_data.sources;
    const sourceKey = sources.map((s: any) =>
      `${s.tab_name}:${s.content_type}:${(s.content || '').substring(0, 100)}`
    ).join('|');
    return `MSR:${sourceKey}`;
  }

  if (diType === 'TA' && question.question_data?.table_data) {
    const tableTitle = question.question_data.table_title || '';
    const firstRow = question.question_data.table_data?.[0]?.join(',') || '';
    const headers = question.question_data.column_headers?.join(',') || '';
    return `TA:${tableTitle}:${headers}:${firstRow}`;
  }

  return null;
}

/**
 * Group questions by shared source data so related questions are adjacent.
 * MSR/TA question sets that share source material are kept together.
 */
export function groupRelatedQuestions<T extends SelectableQuestion>(questions: T[]): T[] {
  const grouped: Map<string, T[]> = new Map();
  const ungrouped: T[] = [];

  questions.forEach(q => {
    const groupKey = getSourceGroupKey(q);
    if (groupKey) {
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      grouped.get(groupKey)!.push(q);
    } else {
      ungrouped.push(q);
    }
  });

  const groupSizes = Array.from(grouped.entries())
    .filter(([_, qs]) => qs.length > 1)
    .map(([key, qs]) => `${key.split(':')[0]}(${qs.length})`);

  if (groupSizes.length > 0) {
    console.log('🔗 [QUESTION GROUPING] Found related question groups:', groupSizes.join(', '));
  }

  const result: T[] = [];
  const usedGroups = new Set<string>();

  questions.forEach(q => {
    const groupKey = getSourceGroupKey(q);

    if (groupKey && !usedGroups.has(groupKey)) {
      const groupMembers = grouped.get(groupKey) || [];
      result.push(...groupMembers);
      usedGroups.add(groupKey);
    } else if (!groupKey) {
      result.push(q);
    }
  });

  return result;
}

/**
 * Select questions ensuring GMAT DI subtype representation.
 * Ensures all Data Insights question types (DS, GI, TA, TPA, MSR) are represented
 * even when some types are underrepresented in the pool.
 *
 * MSR/TA sets (multiple questions sharing same source) count as 1 "effective question"
 * toward the limit, not individual questions.
 */
export function selectWithDISubtypeRepresentation<T extends SelectableQuestion>(
  questions: T[],
  limit: number,
  shouldRandomize: boolean
): T[] {
  console.log(`🎯 [DI SELECTION] Starting selection with limit: ${limit} effective questions, pool size: ${questions.length}`);

  const isDataInsightsSection = questions.some(q =>
    q.section?.toLowerCase().includes('data insights') ||
    q.section?.toLowerCase().includes('di') ||
    q.question_data?.di_type
  );

  if (!isDataInsightsSection) {
    let selected = shouldRandomize
      ? [...questions].sort(() => Math.random() - 0.5)
      : [...questions];
    console.log(`📋 [DI SELECTION] Not a DI section, returning ${Math.min(selected.length, limit)} questions`);
    return selected.slice(0, limit);
  }

  const DI_TYPES = ['DS', 'GI', 'TA', 'TPA', 'MSR'] as const;

  const MIN_PER_TYPE: Record<string, number> = {
    'DS': 1,
    'GI': 2,
    'TA': 1,
    'TPA': 1,
    'MSR': 1,
  };

  const msrTaGroups: Map<string, T[]> = new Map();
  const nonGroupedQuestions: T[] = [];

  questions.forEach(q => {
    const groupKey = getSourceGroupKey(q);
    if (groupKey) {
      if (!msrTaGroups.has(groupKey)) {
        msrTaGroups.set(groupKey, []);
      }
      msrTaGroups.get(groupKey)!.push(q);
    } else {
      nonGroupedQuestions.push(q);
    }
  });

  console.log('📦 [MSR/TA GROUPS] Found', msrTaGroups.size, 'source groups:');
  msrTaGroups.forEach((qs, key) => {
    const preview = qs[0]?.question_data?.sources?.[0]?.content?.substring(0, 50) || key.substring(0, 50);
    console.log(`   - ${key.split(':')[0]}: ${qs.length} questions sharing "${preview}..."`);
  });

  // FORCE INCLUDE: Island Museum MSR set
  let islandMuseumKey: string | undefined = undefined;
  msrTaGroups.forEach((qs, key) => {
    if (islandMuseumKey) return;
    const firstQuestion = qs[0];
    if (!firstQuestion?.question_data?.sources) return;

    const hasIslandMuseum = firstQuestion.question_data.sources.some((source: any) =>
      source.content?.includes('Island Museum')
    );

    if (hasIslandMuseum) {
      islandMuseumKey = key;
      console.log('🏛️ [DETECTION] Found Island Museum MSR set with key:', key.substring(0, 50) + '...');
    }
  });

  const selectedQuestions: T[] = [];
  const usedIds = new Set<string>();
  const usedGroupKeys = new Set<string>();
  let effectiveQuestionCount = 0;

  // Phase 0: Force include Island Museum MSR set if found
  if (islandMuseumKey && effectiveQuestionCount < limit) {
    const islandMuseumQuestions = msrTaGroups.get(islandMuseumKey)!;
    console.log('🏛️ [FORCED] Adding Island Museum MSR set:', islandMuseumQuestions.length, 'questions (counts as 1 effective question)');
    islandMuseumQuestions.forEach(q => {
      selectedQuestions.push(q);
      usedIds.add(q.id);
    });
    usedGroupKeys.add(islandMuseumKey);
    effectiveQuestionCount += 1;
  }

  // Group questions by DI type (for non-grouped questions)
  const byType: Record<string, T[]> = {};
  DI_TYPES.forEach(type => {
    byType[type] = nonGroupedQuestions.filter(q => q.question_data?.di_type === type);
  });

  const msrGroups: Array<{ key: string; questions: T[] }> = [];
  const taGroups: Array<{ key: string; questions: T[] }> = [];

  msrTaGroups.forEach((qs, key) => {
    if (usedGroupKeys.has(key)) return;
    const diType = qs[0]?.question_data?.di_type;
    if (diType === 'MSR') {
      msrGroups.push({ key, questions: qs });
    } else if (diType === 'TA') {
      taGroups.push({ key, questions: qs });
    }
  });

  console.log('📊 GMAT DI Subtype Distribution in Pool:',
    `DS: ${byType['DS']?.length || 0}, ` +
    `GI: ${byType['GI']?.length || 0}, ` +
    `TA: ${taGroups.length} sets (${questions.filter(q => q.question_data?.di_type === 'TA').length} questions), ` +
    `TPA: ${byType['TPA']?.length || 0}, ` +
    `MSR: ${msrGroups.length} sets (${questions.filter(q => q.question_data?.di_type === 'MSR').length} questions)`
  );

  // Phase 1: Guarantee minimum representation of each type
  DI_TYPES.forEach(type => {
    const minRequired = MIN_PER_TYPE[type] || 1;

    if (type === 'MSR') {
      const groups = shouldRandomize ? [...msrGroups].sort(() => Math.random() - 0.5) : msrGroups;
      let typeCount = usedGroupKeys.has(islandMuseumKey || '') && islandMuseumKey?.includes('MSR') ? 1 : 0;

      for (const { key, questions: groupQs } of groups) {
        if (typeCount >= minRequired) break;
        if (effectiveQuestionCount >= limit) break;
        if (usedGroupKeys.has(key)) continue;

        groupQs.forEach(q => {
          selectedQuestions.push(q);
          usedIds.add(q.id);
        });
        usedGroupKeys.add(key);
        effectiveQuestionCount += 1;
        typeCount++;
        console.log(`✅ Added MSR set (${groupQs.length} questions) - effective count now: ${effectiveQuestionCount}`);
      }
    } else if (type === 'TA') {
      const groups = shouldRandomize ? [...taGroups].sort(() => Math.random() - 0.5) : taGroups;
      let typeCount = 0;

      for (const { key, questions: groupQs } of groups) {
        if (typeCount >= minRequired) break;
        if (effectiveQuestionCount >= limit) break;
        if (usedGroupKeys.has(key)) continue;

        groupQs.forEach(q => {
          selectedQuestions.push(q);
          usedIds.add(q.id);
        });
        usedGroupKeys.add(key);
        effectiveQuestionCount += 1;
        typeCount++;
        console.log(`✅ Added TA set (${groupQs.length} questions) - effective count now: ${effectiveQuestionCount}`);
      }
    } else {
      const typeQuestions = byType[type] || [];
      const pool = shouldRandomize
        ? [...typeQuestions].sort(() => Math.random() - 0.5)
        : [...typeQuestions];

      let typeCount = 0;
      for (const q of pool) {
        if (typeCount >= minRequired) break;
        if (effectiveQuestionCount >= limit) break;
        if (usedIds.has(q.id)) continue;

        selectedQuestions.push(q);
        usedIds.add(q.id);
        effectiveQuestionCount += 1;
        typeCount++;
      }
    }
  });

  console.log(`✅ Phase 1 (Guaranteed DI types): ${effectiveQuestionCount}/${limit} effective questions (${selectedQuestions.length} actual questions)`);

  // Phase 2: Fill remaining slots
  if (effectiveQuestionCount < limit) {
    const remainingIndividual = nonGroupedQuestions.filter(q => !usedIds.has(q.id));
    const pool = shouldRandomize
      ? [...remainingIndividual].sort(() => Math.random() - 0.5)
      : [...remainingIndividual];

    for (const q of pool) {
      if (effectiveQuestionCount >= limit) break;
      if (!usedIds.has(q.id)) {
        selectedQuestions.push(q);
        usedIds.add(q.id);
        effectiveQuestionCount += 1;
      }
    }
  }

  if (effectiveQuestionCount < limit) {
    const remainingGroups = [...msrGroups, ...taGroups].filter(g => !usedGroupKeys.has(g.key));
    const shuffled = shouldRandomize ? remainingGroups.sort(() => Math.random() - 0.5) : remainingGroups;

    for (const { key, questions: groupQs } of shuffled) {
      if (effectiveQuestionCount >= limit) break;
      if (usedGroupKeys.has(key)) continue;

      groupQs.forEach(q => {
        selectedQuestions.push(q);
        usedIds.add(q.id);
      });
      usedGroupKeys.add(key);
      effectiveQuestionCount += 1;
    }
  }

  console.log(`✅ Phase 2 (Fill remaining): ${effectiveQuestionCount}/${limit} effective questions (${selectedQuestions.length} actual questions)`);

  // Log final distribution
  const finalMsrCount = new Set(
    selectedQuestions.filter(q => q.question_data?.di_type === 'MSR').map(q => getSourceGroupKey(q))
  ).size;
  const finalTaCount = new Set(
    selectedQuestions.filter(q => q.question_data?.di_type === 'TA').map(q => getSourceGroupKey(q))
  ).size;

  console.log('📋 Final DI type distribution (effective questions):',
    `DS: ${selectedQuestions.filter(q => q.question_data?.di_type === 'DS').length}, ` +
    `GI: ${selectedQuestions.filter(q => q.question_data?.di_type === 'GI').length}, ` +
    `TA: ${finalTaCount} sets, ` +
    `TPA: ${selectedQuestions.filter(q => q.question_data?.di_type === 'TPA').length}, ` +
    `MSR: ${finalMsrCount} sets`
  );

  console.log(`🏁 [DI SELECTION] FINAL: Selected ${selectedQuestions.length} actual questions = ${effectiveQuestionCount} effective questions (limit was ${limit})`);

  if (effectiveQuestionCount > limit) {
    console.warn(`⚠️ [DI SELECTION] WARNING: Exceeded limit! ${effectiveQuestionCount} > ${limit}`);
  }

  // Phase 3: Group related MSR/TA questions together
  return groupRelatedQuestions(selectedQuestions);
}

/**
 * Prepare initial questions for a test based on config.
 *
 * Handles:
 * - PDF tests (keep original order)
 * - Non-adaptive: static selection with section limits
 * - Adaptive: base question selection with difficulty matching
 * - DI subtype representation for GMAT Data Insights
 */
export function prepareInitialQuestions<T extends SelectableQuestion>(
  allQuestions: T[],
  config: SelectionConfig,
  _algorithmConfig: any
): T[] {
  const getSection = (q: T) =>
    config.section_order_mode?.includes('macro_sections') && q.macro_section
      ? q.macro_section
      : q.section;

  // PDF TEST: NO randomization - keep original order
  const isPDFTest = allQuestions.length > 0 && allQuestions[0].question_type === 'pdf';
  if (isPDFTest) {
    return [...allQuestions].sort((a, b) => a.question_number - b.question_number);
  }

  let processedQuestions = [...allQuestions];

  // NON-ADAPTIVE MODE: Static question selection
  if (config.adaptivity_mode !== 'adaptive') {
    // CASE 1: Single-section test with total_questions limit
    if (config.section_order_mode === 'no_sections' && config.total_questions) {
      if (config.question_order === 'random') {
        processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
      }
      return processedQuestions.slice(0, config.total_questions);
    }

    // CASE 2: Multi-section test with questions_per_section limits
    if (config.questions_per_section) {
      const limitedQuestions: T[] = [];
      const sections = Array.from(new Set(processedQuestions.map(q => getSection(q))));

      sections.forEach(section => {
        const sectionQuestions = processedQuestions.filter(q => getSection(q) === section);
        const limit = config.questions_per_section![section];

        if (limit !== undefined && limit > 0) {
          const selected = selectWithDISubtypeRepresentation(
            sectionQuestions,
            limit,
            config.question_order === 'random'
          );
          limitedQuestions.push(...selected);
        } else {
          limitedQuestions.push(...sectionQuestions);
        }
      });

      return limitedQuestions;
    }

    // CASE 3: No limits - return all
    if (config.question_order === 'random') {
      processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
    }
    return processedQuestions;
  }

  // ADAPTIVE MODE
  if (config.question_order === 'random') {
    if (config.base_questions_scope === 'per_section') {
      const sections = Array.from(new Set(processedQuestions.map(q => getSection(q))));
      const randomizedQuestions: T[] = [];

      sections.forEach(section => {
        const sectionQuestions = processedQuestions.filter(q => getSection(q) === section);
        const shuffled = [...sectionQuestions].sort(() => Math.random() - 0.5);
        randomizedQuestions.push(...shuffled);
      });

      processedQuestions = randomizedQuestions;
    } else {
      processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
    }
  }

  // Handle base questions selection
  if (config.use_base_questions && config.base_questions_count) {
    let baselineDifficulty = config.baseline_difficulty;
    if (!baselineDifficulty) {
      baselineDifficulty = 2;
    }

    const matchesDifficulty = (question: T, targetDifficulty: number | string): boolean => {
      const qDiff = question.difficulty;

      if (typeof qDiff === typeof targetDifficulty) {
        return qDiff === targetDifficulty;
      }

      const difficultyMap: Record<number, string> = {
        1: 'easy',
        2: 'medium',
        3: 'hard'
      };
      const reverseDifficultyMap: Record<string, number> = {
        'easy': 1,
        'medium': 2,
        'hard': 3
      };

      if (typeof targetDifficulty === 'number' && typeof qDiff === 'string') {
        return difficultyMap[targetDifficulty]?.toLowerCase() === qDiff.toLowerCase();
      } else if (typeof targetDifficulty === 'string' && typeof qDiff === 'number') {
        return reverseDifficultyMap[targetDifficulty.toLowerCase()] === qDiff;
      }

      return false;
    };

    const baseQuestions: T[] = [];

    const selectBaselineQuestions = (
      questions: T[],
      targetSection: string,
      targetDifficulty: number | string,
      count: number
    ): T[] => {
      const allSectionQuestions = questions.filter(q => getSection(q) === targetSection);

      const isDataInsightsSection = allSectionQuestions.some(q =>
        q.section?.toLowerCase().includes('data insights') ||
        q.section?.toLowerCase().includes('di') ||
        q.question_data?.di_type
      );

      if (isDataInsightsSection) {
        console.log('🎯 Adaptive Base Questions: Using DI subtype representation for', targetSection);
        const selected = selectWithDISubtypeRepresentation(
          allSectionQuestions,
          count,
          config.question_order === 'random'
        );
        selected.forEach(q => q.is_base = true);
        return selected;
      }

      let candidates = questions.filter(
        q => getSection(q) === targetSection && matchesDifficulty(q, targetDifficulty)
      );

      if (candidates.length < count) {
        candidates = allSectionQuestions;
      }

      if (config.question_order === 'random') {
        candidates = [...candidates].sort(() => Math.random() - 0.5);
      }

      const selected = candidates.slice(0, count);
      selected.forEach(q => q.is_base = true);
      return selected;
    };

    if (config.base_questions_scope === 'per_section') {
      const sections = Array.from(new Set(processedQuestions.map(q => getSection(q))));
      const firstSection = sections[0];
      const baseCount = config.base_questions_count || 0;

      const selectedBaseQuestions = selectBaselineQuestions(
        processedQuestions,
        firstSection,
        baselineDifficulty!,
        baseCount
      );

      baseQuestions.push(...selectedBaseQuestions);
    } else {
      const sections = Array.from(new Set(processedQuestions.map(q => q.section)));
      const firstSection = sections[0];
      const baseCount = config.base_questions_count || 0;

      const selectedBaseQuestions = selectBaselineQuestions(
        processedQuestions,
        firstSection,
        baselineDifficulty!,
        baseCount
      );

      baseQuestions.push(...selectedBaseQuestions);
    }

    return baseQuestions;
  }

  // Adaptive but no base questions
  return [];
}
