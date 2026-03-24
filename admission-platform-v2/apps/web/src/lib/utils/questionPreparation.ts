/**
 * Question preparation utilities extracted from TakeTestPage.
 * Handles initial question selection, DI subtype balancing, MSR/TA grouping, and baseline selection.
 * Pure functions — no React, no state.
 */

import type { TestConfig, Question } from '@/types/test';

// ─── Section field helper ────────────────────────────────────────────────────

function getSection(q: Question, config: TestConfig): string {
  return config.section_order_mode?.includes('macro_sections') && q.macro_section
    ? q.macro_section
    : q.section;
}

// ─── Difficulty matching ─────────────────────────────────────────────────────

/**
 * Matches a question's difficulty against a target difficulty value.
 * Handles both numeric (1/2/3) and string ('easy'/'medium'/'hard') formats.
 */
export function matchesDifficulty(question: Question, targetDifficulty: number | string): boolean {
  const qDiff = question.difficulty;

  if (typeof qDiff === typeof targetDifficulty) {
    return qDiff === targetDifficulty;
  }

  const difficultyMap: Record<number, string> = { 1: 'easy', 2: 'medium', 3: 'hard' };
  const reverseDifficultyMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

  if (typeof targetDifficulty === 'number' && typeof qDiff === 'string') {
    return difficultyMap[targetDifficulty]?.toLowerCase() === qDiff.toLowerCase();
  } else if (typeof targetDifficulty === 'string' && typeof qDiff === 'number') {
    return reverseDifficultyMap[targetDifficulty.toLowerCase()] === qDiff;
  }

  return false;
}

// ─── MSR/TA source group key ─────────────────────────────────────────────────

/**
 * Generates a hash key identifying questions that share the same MSR or TA source.
 * Questions with the same key should be presented together.
 * Returns null for non-grouped question types.
 */
export function getSourceGroupKey(question: Question): string | null {
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

// ─── MSR/TA grouping ─────────────────────────────────────────────────────────

/**
 * Reorders a question array so that related MSR/TA questions (sharing the same source)
 * are placed adjacent to each other, preserving the original position of the first occurrence.
 */
export function groupRelatedQuestions(questions: Question[]): Question[] {
  const grouped: Map<string, Question[]> = new Map();
  const ungrouped: Question[] = [];

  questions.forEach(q => {
    const groupKey = getSourceGroupKey(q);
    if (groupKey) {
      if (!grouped.has(groupKey)) grouped.set(groupKey, []);
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

  const result: Question[] = [];
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
    // Skip if already added as part of a group
  });

  return result;
}

// ─── DI subtype representation ───────────────────────────────────────────────

/**
 * Selects questions from a Data Insights pool ensuring all DI subtypes are represented.
 * MSR/TA sets count as 1 "effective question" toward the limit.
 *
 * Minimum counts enforced: DS≥1, GI≥2, TA≥1, TPA≥1, MSR≥1.
 * The "Island Museum" MSR set is always force-included when present.
 */
export function selectWithDISubtypeRepresentation(
  questions: Question[],
  limit: number,
  shouldRandomize: boolean
): Question[] {
  console.log(`🎯 [DI SELECTION] Starting selection with limit: ${limit} effective questions, pool size: ${questions.length}`);

  const isDataInsightsSection = questions.some(q =>
    q.section?.toLowerCase().includes('data insights') ||
    q.section?.toLowerCase().includes('di') ||
    q.question_data?.di_type
  );

  if (!isDataInsightsSection) {
    const selected = [...questions];
    console.log(`📋 [DI SELECTION] Not a DI section, returning ${Math.min(selected.length, limit)} questions`);
    return selected.slice(0, limit);
  }

  const DI_TYPES = ['DS', 'GI', 'TA', 'TPA', 'MSR'] as const;

  const MIN_PER_TYPE: Record<string, number> = {
    DS: 1,
    GI: 2,
    TA: 1,
    TPA: 1,
    MSR: 1,
  };

  // Build MSR/TA group maps
  const msrTaGroups: Map<string, Question[]> = new Map();
  const nonGroupedQuestions: Question[] = [];

  questions.forEach(q => {
    const groupKey = getSourceGroupKey(q);
    if (groupKey) {
      if (!msrTaGroups.has(groupKey)) msrTaGroups.set(groupKey, []);
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

  // Detect Island Museum MSR set (force-include)
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

  const selectedQuestions: Question[] = [];
  const usedIds = new Set<string>();
  const usedGroupKeys = new Set<string>();
  let effectiveQuestionCount = 0;

  // Phase 0: Force include Island Museum MSR set
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

  // Build per-type pools
  const byType: Record<string, Question[]> = {};
  DI_TYPES.forEach(type => {
    byType[type] = nonGroupedQuestions.filter(q => q.question_data?.di_type === type);
  });

  const msrGroups: Array<{ key: string; questions: Question[] }> = [];
  const taGroups: Array<{ key: string; questions: Question[] }> = [];

  msrTaGroups.forEach((qs, key) => {
    if (usedGroupKeys.has(key)) return;
    const diType = qs[0]?.question_data?.di_type;
    if (diType === 'MSR') msrGroups.push({ key, questions: qs });
    else if (diType === 'TA') taGroups.push({ key, questions: qs });
  });

  console.log('📊 GMAT DI Subtype Distribution in Pool:',
    `DS: ${byType['DS']?.length || 0}, ` +
    `GI: ${byType['GI']?.length || 0}, ` +
    `TA: ${taGroups.length} sets (${questions.filter(q => q.question_data?.di_type === 'TA').length} questions), ` +
    `TPA: ${byType['TPA']?.length || 0}, ` +
    `MSR: ${msrGroups.length} sets (${questions.filter(q => q.question_data?.di_type === 'MSR').length} questions)`
  );

  // Phase 1: Guarantee minimum representation of each DI type
  DI_TYPES.forEach(type => {
    const minRequired = MIN_PER_TYPE[type] || 1;

    if (type === 'MSR') {
      const groups = msrGroups;
      let typeCount = usedGroupKeys.has(islandMuseumKey || '') && islandMuseumKey?.includes('MSR') ? 1 : 0;

      for (const { key, questions: groupQs } of groups) {
        if (typeCount >= minRequired) break;
        if (effectiveQuestionCount >= limit) break;
        if (usedGroupKeys.has(key)) continue;

        groupQs.forEach(q => { selectedQuestions.push(q); usedIds.add(q.id); });
        usedGroupKeys.add(key);
        effectiveQuestionCount += 1;
        typeCount++;
        console.log(`✅ Added MSR set (${groupQs.length} questions) - effective count now: ${effectiveQuestionCount}`);
      }
    } else if (type === 'TA') {
      const groups = taGroups;
      let typeCount = 0;

      for (const { key, questions: groupQs } of groups) {
        if (typeCount >= minRequired) break;
        if (effectiveQuestionCount >= limit) break;
        if (usedGroupKeys.has(key)) continue;

        groupQs.forEach(q => { selectedQuestions.push(q); usedIds.add(q.id); });
        usedGroupKeys.add(key);
        effectiveQuestionCount += 1;
        typeCount++;
        console.log(`✅ Added TA set (${groupQs.length} questions) - effective count now: ${effectiveQuestionCount}`);
      }
    } else {
      const typeQuestions = byType[type] || [];
      const pool = [...typeQuestions];
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

  // Phase 2: Fill remaining slots — individual questions first, then more MSR/TA sets
  if (effectiveQuestionCount < limit) {
    const remainingIndividual = nonGroupedQuestions.filter(q => !usedIds.has(q.id));
    const pool = [...remainingIndividual];

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
    const shuffled = remainingGroups;

    for (const { key, questions: groupQs } of shuffled) {
      if (effectiveQuestionCount >= limit) break;
      if (usedGroupKeys.has(key)) continue;
      groupQs.forEach(q => { selectedQuestions.push(q); usedIds.add(q.id); });
      usedGroupKeys.add(key);
      effectiveQuestionCount += 1;
    }
  }

  console.log(`✅ Phase 2 (Fill remaining): ${effectiveQuestionCount}/${limit} effective questions (${selectedQuestions.length} actual questions)`);

  const finalMsrCount = new Set(selectedQuestions.filter(q => q.question_data?.di_type === 'MSR').map(q => getSourceGroupKey(q))).size;
  const finalTaCount = new Set(selectedQuestions.filter(q => q.question_data?.di_type === 'TA').map(q => getSourceGroupKey(q))).size;

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

  return groupRelatedQuestions(selectedQuestions);
}

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * Prepares the initial question list for a test session.
 * Handles: PDF ordering, MSR/TA grouping, DI subtype balancing, randomization, and baseline selection.
 *
 * For adaptive mode: returns ONLY the baseline questions for the first section.
 * For non-adaptive mode: returns the full selected question set.
 */
export function prepareInitialQuestions(
  allQuestions: Question[],
  config: TestConfig,
  _algorithmConfig: unknown
): Question[] {
  // PDF tests: keep original order, no randomization
  const isPDFTest = allQuestions.length > 0 && allQuestions[0].question_type === 'pdf';
  if (isPDFTest) {
    return [...allQuestions].sort((a, b) => a.question_number - b.question_number);
  }

  let processedQuestions = [...allQuestions];

  // NON-ADAPTIVE MODE
  if (config.adaptivity_mode !== 'adaptive') {
    // Single-section test with total_questions limit
    if (config.section_order_mode === 'no_sections' && config.total_questions) {
      return processedQuestions.slice(0, config.total_questions);
    }

    // Multi-section test with questions_per_section limits
    if (config.questions_per_section) {
      const limitedQuestions: Question[] = [];
      const sections = Array.from(new Set(processedQuestions.map(q => getSection(q, config))));

      sections.forEach(section => {
        const sectionQuestions = processedQuestions.filter(q => getSection(q, config) === section);
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

    // No limits — return all in original order
    return processedQuestions;
  }

  // ADAPTIVE MODE: select baseline questions
  if (config.use_base_questions && config.base_questions_count) {
    const baselineDifficulty = config.baseline_difficulty ?? 2;
    const baseCount = config.base_questions_count;

    const selectBaselineQuestions = (
      questions: Question[],
      targetSection: string,
      targetDifficulty: number | string,
      count: number
    ): Question[] => {
      const allSectionQuestions = questions.filter(q => getSection(q, config) === targetSection);

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
        selected.forEach(q => (q.is_base = true));
        return selected;
      }

      let candidates = questions.filter(
        q => getSection(q, config) === targetSection && matchesDifficulty(q, targetDifficulty)
      );

      if (candidates.length < count) {
        candidates = allSectionQuestions;
      }

      const selected = candidates.slice(0, count);
      selected.forEach(q => (q.is_base = true));
      return selected;
    };

    const sections = Array.from(new Set(processedQuestions.map(q => getSection(q, config))));
    const firstSection = sections[0];

    // For both per_section and per_test scope: select baseline from the first section
    const baseQuestions = selectBaselineQuestions(
      processedQuestions,
      firstSection,
      baselineDifficulty,
      baseCount
    );

    return baseQuestions;
  }

  // Adaptive but no base questions configured — adaptive selection happens as student progresses
  return [];
}
