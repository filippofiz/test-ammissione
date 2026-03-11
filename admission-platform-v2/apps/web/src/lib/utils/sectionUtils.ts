/**
 * Section-related utility functions extracted from TakeTestPage.
 * Pure functions — no React, no state.
 */

import type { TestConfig, Question } from '@/types/test';

/**
 * Returns the correct section field for a question based on the config's section_order_mode.
 * In macro_sections mode, uses macro_section; otherwise uses section.
 */
export function getSectionField(question: Question, config: TestConfig | null): string {
  if (config?.section_order_mode?.includes('macro_sections') && question.macro_section) {
    return question.macro_section;
  }
  return question.section;
}

/**
 * Formats a section name for human-readable display.
 * - 'Multi-topic' → shows exerciseType instead
 * - RW prefix → 'Reading and Writing'
 * - Math1/2 → 'Math 1' / 'Math 2'
 * - Strips -Hard / -Easy suffixes
 */
export function formatSectionName(name: string, exerciseType?: string): string {
  if (!name) return '';
  if (name === 'Multi-topic' && exerciseType) {
    return exerciseType;
  }
  let formatted = name.replace(/^RW(\d*)/, 'Reading and Writing $1').trim();
  formatted = formatted.replace(/^Math(\d+)/, 'Math $1');
  formatted = formatted.replace(/-(Hard|Easy)$/i, '');
  return formatted;
}

/**
 * Calculates the effective question limit for the current section.
 * - Non-adaptive: always uses the actual count of loaded questions
 * - Adaptive: uses questions_per_section config (with base-name fallback for -Easy/-Hard sections)
 */
export function calculateSectionQuestionLimit(
  config: TestConfig | null,
  currentSection: string,
  totalQuestionsInSection: number
): number {
  if (config?.adaptivity_mode !== 'adaptive') {
    return totalQuestionsInSection;
  }

  if (config?.questions_per_section && currentSection) {
    let limit = config.questions_per_section[currentSection];

    // Fallback: strip -Easy / -Hard for adaptive section variants
    if (limit === undefined && (currentSection.endsWith('-Easy') || currentSection.endsWith('-Hard'))) {
      const baseSection = currentSection.replace(/-Easy|-Hard$/i, '');
      limit = config.questions_per_section[baseSection];
    }

    return limit || 20;
  }

  return totalQuestionsInSection;
}

/**
 * Calculates the expected total number of sections to display in the footer ("Section X of Y").
 * In macro_section adaptivity mode each base section gets 1 adaptive section added → multiply by 2.
 */
export function calculateExpectedTotalSections(
  config: TestConfig | null,
  sections: string[]
): number {
  if (!config?.section_adaptivity_config || Object.keys(config.section_adaptivity_config).length === 0) {
    return sections.length;
  }

  const useMacroSectionAdaptivity = config?.section_order_mode?.includes('macro_sections');
  if (!useMacroSectionAdaptivity) {
    return sections.length;
  }

  const baseSectionCount = Object.values(config.section_adaptivity_config).filter(c => c.type === 'base').length;
  return baseSectionCount * 2;
}

/**
 * Filters sections based on section adaptivity configuration.
 * - Base sections are always included.
 * - Adaptive sections: if initialOnly=false, randomly picks one from each group (e.g. RW2-Easy or RW2-Hard).
 * - Adaptive sections: if initialOnly=true, skips all (will be added later based on performance).
 *
 * @example initialOnly=false
 * Input:  ["RW1", "RW2-Easy", "RW2-Hard", "Math1", "Math2-Easy", "Math2-Hard"]
 * Output: ["RW1", "RW2-Hard", "Math1", "Math2-Easy"]  (randomly picked one from each group)
 *
 * @example initialOnly=true
 * Input:  ["RW1", "RW2-Easy", "RW2-Hard", "Math1", "Math2-Easy", "Math2-Hard"]
 * Output: ["RW1", "Math1"]  (only base sections)
 */
export function filterSectionsWithAdaptivity(
  sections: string[],
  adaptivityConfig: Record<string, { type: 'base' | 'adaptive'; difficulty?: string }>,
  initialOnly: boolean = false
): string[] {
  const result: string[] = [];
  const processedGroups = new Set<string>();

  for (const section of sections) {
    const config = adaptivityConfig[section];

    if (!config) {
      // No config for this section, include it by default
      result.push(section);
      continue;
    }

    if (config.type === 'base') {
      result.push(section);
    } else if (config.type === 'adaptive' && !initialOnly) {
      const groupPrefix = section.replace(/-Easy|-Hard$/i, '');

      if (processedGroups.has(groupPrefix)) {
        continue;
      }

      const groupSections = sections.filter(s => {
        const sectionConfig = adaptivityConfig[s];
        return sectionConfig?.type === 'adaptive' && s.startsWith(groupPrefix);
      });

      const randomIndex = Math.floor(Math.random() * groupSections.length);
      const pickedSection = groupSections[randomIndex];

      result.push(pickedSection);
      processedGroups.add(groupPrefix);
    }
    // If initialOnly=true and adaptive, skip (will be added later based on performance)
  }

  return result;
}
