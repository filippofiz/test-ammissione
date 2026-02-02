/**
 * GMAT Question Allocation Utilities
 * Functions for managing question allocation, template matching, and cycle-based question selection
 */

import { supabase } from '../supabase';
// Import from full generated Supabase types
import type { Database } from '../../../database.types';

// Types
export type GmatCycle = 'Foundation' | 'Development' | 'Excellence';

export const GMAT_CYCLES: GmatCycle[] = ['Foundation', 'Development', 'Excellence'];

export interface CycleAllocation {
  allocated_questions: string[];
  allocated_at: string | null;
}

export interface QuestionAllocation {
  by_cycle: {
    [K in GmatCycle]?: CycleAllocation;
  };
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface QuestionRequirements {
  total_questions: number;
  time_limit_minutes?: number;
  difficulty_distribution: {
    [K in GmatCycle]: DifficultyDistribution;
  };
}

type LessonMaterial = Database['public']['Tables']['2V_lesson_materials']['Row'];

// GMAT Structure - mirrors the allocation page structure
export const GMAT_STRUCTURE = {
  'Quantitative Reasoning': {
    code: 'QR',
    topics: [
      { id: '01-number-properties-arithmetic', name: 'Number Properties & Arithmetic' },
      { id: '02-algebra', name: 'Algebra' },
      { id: '03-word-problems', name: 'Word Problems' },
      { id: '04-statistics-probability', name: 'Statistics & Probability' },
      { id: '05-percents-ratios-proportions', name: 'Percents, Ratios & Proportions' },
    ],
  },
  'Data Insights': {
    code: 'DI',
    topics: [
      { id: '01-data-sufficiency', name: 'Data Sufficiency', diType: 'DS' },
      { id: '02-graphics-interpretation', name: 'Graphics Interpretation', diType: 'GI' },
      { id: '03-table-analysis', name: 'Table Analysis', diType: 'TA' },
      { id: '04-two-part-analysis', name: 'Two-Part Analysis', diType: 'TPA' },
      { id: '05-multi-source-reasoning', name: 'Multi-Source Reasoning', diType: 'MSR' },
    ],
  },
  'Verbal Reasoning': {
    code: 'VR',
    topics: [
      { id: '01-critical-reasoning', name: 'Critical Reasoning' },
      { id: '02-reading-comprehension', name: 'Reading Comprehension' },
    ],
  },
} as const;

// Material types
export type MaterialType = 'training1' | 'training2' | 'assessment';

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  training1: 'Training 1',
  training2: 'Training 2',
  assessment: 'Topic Assessment',
};

/**
 * Get allocated question IDs for a specific material template and cycle
 */
export async function getAllocatedQuestionIds(
  materialId: string,
  cycle: GmatCycle
): Promise<string[]> {
  const { data, error } = await supabase
    .from('2V_lesson_materials')
    .select('question_allocation')
    .eq('id', materialId)
    .single();

  if (error) {
    console.error('Error fetching allocation:', error);
    throw new Error(`Failed to fetch question allocation: ${error.message}`);
  }

  const allocation = data?.question_allocation as QuestionAllocation | null;
  return allocation?.by_cycle?.[cycle]?.allocated_questions || [];
}

/**
 * Get question requirements for a material template
 */
export async function getQuestionRequirements(
  materialId: string
): Promise<QuestionRequirements | null> {
  const { data, error } = await supabase
    .from('2V_lesson_materials')
    .select('question_requirements')
    .eq('id', materialId)
    .single();

  if (error) {
    console.error('Error fetching requirements:', error);
    return null;
  }

  return data?.question_requirements as QuestionRequirements | null;
}

/**
 * Find matching template by section, topic, and material type
 * Uses fuzzy matching on section codes, topic names, and material types
 */
export async function findMatchingTemplate(
  section: string,
  topic: string,
  materialType: string
): Promise<LessonMaterial | null> {
  // Fetch all active GMAT templates
  const { data: templates, error } = await supabase
    .from('2V_lesson_materials')
    .select('*')
    .eq('test_type', 'GMAT')
    .eq('is_template', true)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching templates:', error);
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  if (!templates || templates.length === 0) {
    return null;
  }

  // Normalize inputs for matching
  const normalizedSection = section.toLowerCase();
  const normalizedTopic = topic.toLowerCase();
  const normalizedMaterialType = materialType.toLowerCase();

  // Find matching template
  const matchingTemplate = templates.find(t => {
    // Section matching - check code or full name
    const templateSection = t.section.toLowerCase();
    const sectionMatch =
      templateSection === normalizedSection ||
      templateSection.includes(normalizedSection) ||
      normalizedSection.includes(templateSection) ||
      // Check section codes (QR, DI, VR)
      (normalizedSection === 'qr' && templateSection.includes('quantitative')) ||
      (normalizedSection === 'di' && templateSection.includes('data')) ||
      (normalizedSection === 'vr' && templateSection.includes('verbal')) ||
      (normalizedSection.includes('quantitative') && templateSection === 'qr') ||
      (normalizedSection.includes('data') && templateSection === 'di') ||
      (normalizedSection.includes('verbal') && templateSection === 'vr');

    // Topic matching - fuzzy match on topic name or id
    const templateTopic = t.topic.toLowerCase();
    const topicMatch =
      templateTopic.includes(normalizedTopic) ||
      normalizedTopic.includes(templateTopic) ||
      t.pdf_storage_path?.toLowerCase().includes(normalizedTopic);

    // Material type matching
    const templateMaterialType = t.material_type.toLowerCase();
    const materialMatch =
      templateMaterialType.includes(normalizedMaterialType) ||
      normalizedMaterialType.includes(templateMaterialType) ||
      t.title?.toLowerCase().includes(normalizedMaterialType) ||
      t.pdf_storage_path?.toLowerCase().includes(`question-template-${normalizedMaterialType}`);

    return sectionMatch && topicMatch && materialMatch;
  });

  return matchingTemplate || null;
}

/**
 * Parse test identifier to extract section, topic, materialType
 * Uses naming convention from test metadata
 *
 * Expected patterns:
 * - section: "QR", "DI", "VR" or full names
 * - format/exercise_type: "training", "assessment", etc.
 * - Additional metadata in test fields
 */
export function parseTestIdentifier(
  testInfo: {
    section?: string;
    exercise_type?: string;
    format?: string;
    materia?: string | null;
    test_number?: number;
  }
): { section: string; topic: string; materialType: string } {
  // Extract section - normalize to code format
  let section = testInfo.section || '';
  if (section.toLowerCase().includes('quantitative')) section = 'QR';
  else if (section.toLowerCase().includes('data')) section = 'DI';
  else if (section.toLowerCase().includes('verbal')) section = 'VR';
  else section = section.toUpperCase();

  // Extract topic from materia field or other metadata
  let topic = testInfo.materia || '';

  // Extract material type from exercise_type or format
  let materialType = 'training1'; // default
  const exerciseType = (testInfo.exercise_type || testInfo.format || '').toLowerCase();

  if (exerciseType.includes('assessment') || exerciseType.includes('test')) {
    materialType = 'assessment';
  } else if (exerciseType.includes('training2') || exerciseType.includes('training 2')) {
    materialType = 'training2';
  } else if (exerciseType.includes('training1') || exerciseType.includes('training 1') || exerciseType.includes('training')) {
    materialType = 'training1';
  }

  return { section, topic, materialType };
}

/**
 * Validate if allocation is complete for all cycles
 */
export function validateAllocation(
  template: LessonMaterial
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allocation = template.question_allocation as QuestionAllocation | null;
  const requirements = template.question_requirements as QuestionRequirements | null;

  if (!requirements) {
    errors.push('Missing question requirements');
    return { valid: false, errors };
  }

  const requiredCount = requirements.total_questions;

  for (const cycle of GMAT_CYCLES) {
    const cycleAlloc = allocation?.by_cycle?.[cycle];
    const allocatedCount = cycleAlloc?.allocated_questions?.length || 0;

    if (allocatedCount < requiredCount) {
      errors.push(`${cycle}: ${allocatedCount}/${requiredCount} questions allocated`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get cycle info for display
 */
export function getCycleInfo(cycle: GmatCycle): {
  name: string;
  scoreRange: string;
  description: string;
  difficultyDistribution: { easy: number; medium: number; hard: number };
} {
  const cycleData = {
    Foundation: {
      name: 'Foundation',
      scoreRange: '505-605',
      description: 'Building fundamentals and concept mastery',
      difficultyDistribution: { easy: 60, medium: 30, hard: 10 },
    },
    Development: {
      name: 'Development',
      scoreRange: '605-665',
      description: 'Strengthening weak areas and building speed',
      difficultyDistribution: { easy: 25, medium: 50, hard: 25 },
    },
    Excellence: {
      name: 'Excellence',
      scoreRange: '665-715+',
      description: 'Advanced strategies and peak performance',
      difficultyDistribution: { easy: 5, medium: 30, hard: 65 },
    },
  };

  return cycleData[cycle];
}
