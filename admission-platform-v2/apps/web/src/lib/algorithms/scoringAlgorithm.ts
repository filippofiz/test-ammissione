/**
 * Scoring Algorithms
 * Each test type (SAT, GMAT, TOLC, etc.) has its own scoring system
 * All configuration is loaded from 2V_algorithm_config table
 *
 * IMPORTANT: Scoring is test-type specific!
 * - SAT: 200-800 per section, scaled scoring
 * - GMAT: 200-800 total, adaptive scoring with subscores
 * - TOLC: Custom scoring per section
 * - etc.
 */

import { supabase } from '../supabase';

// ============================================================================
// INTERFACES
// ============================================================================

interface QuestionResponse {
  question_id: string;
  section_id: string;
  is_correct: boolean;
  is_blank: boolean;
  difficulty?: number;
  discrimination?: number;
  section_name?: string;
  points_value?: number; // Some tests have questions worth different points
  options_count?: number; // Number of answer options (for option-based penalty calculation)
}

/**
 * Scoring configuration loaded from database (2V_algorithm_config table)
 */
interface ScoringConfig {
  id?: string;
  test_type: string;
  track_type: string;
  algorithm_category: 'scoring';
  scoring_method: 'raw_score' | 'scaled' | 'weighted' | 'irt_based' | 'custom';

  // Penalty Configuration
  penalty_for_wrong?: number | Record<string, number>; // e.g., SAT has no penalty (-0), some tests -0.25, or option-based: { "3": -0.33, "4": -0.2 }
  penalty_for_blank?: number; // Usually 0

  // Section Weights (for weighted scoring)
  section_weights?: Record<string, number>; // e.g., { "math": 0.5, "verbal": 0.5 }

  // Scaling Configuration (for scaled scoring like SAT/GMAT)
  scale_min?: number; // e.g., 200 for SAT
  scale_max?: number; // e.g., 800 for SAT
  raw_to_scaled_table?: Array<{ raw: number; scaled: number }>; // Conversion table

  // IRT-based scoring
  use_theta_for_score?: boolean; // Use IRT theta to calculate final score

  // Custom scoring rules (JSON configuration)
  custom_rules?: Record<string, any>;

  created_at?: string;
  updated_at?: string;
}

interface SectionScore {
  section_id: string;
  section_name: string;
  raw_score: number;
  scaled_score?: number;
  max_possible: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  total_questions: number;
}

interface TotalScore {
  raw_score: number;
  scaled_score?: number;
  max_possible: number;
  percentage: number;
  section_scores: SectionScore[];
  theta?: number; // IRT ability estimate (if using adaptive/IRT)
  metadata?: Record<string, any>;
}

// ============================================================================
// SCORING ALGORITHM CLASS
// ============================================================================

export class ScoringAlgorithm {
  private config: ScoringConfig;
  private responses: QuestionResponse[];

  constructor(config: ScoringConfig) {
    this.config = config;
    this.responses = [];
  }

  /**
   * Add a response to be scored
   */
  addResponse(response: QuestionResponse): void {
    this.responses.push(response);
  }

  /**
   * Add multiple responses
   */
  addResponses(responses: QuestionResponse[]): void {
    this.responses.push(...responses);
  }

  /**
   * Get the penalty for a wrong answer based on the number of options
   * Supports both fixed penalties and option-based penalties
   */
  private getPenaltyForWrong(optionsCount?: number): number {
    const penaltyConfig = this.config.penalty_for_wrong;

    // If no penalty configured, return 0
    if (!penaltyConfig) return 0;

    // If penalty is a simple number, return it
    if (typeof penaltyConfig === 'number') {
      return Math.abs(penaltyConfig);
    }

    // If penalty is an object with option-based rules, use options_count
    if (typeof penaltyConfig === 'object' && optionsCount !== undefined) {
      // Try exact match first (e.g., "3" for 3 options)
      const exactPenalty = penaltyConfig[String(optionsCount)];
      if (exactPenalty !== undefined) {
        return Math.abs(Number(exactPenalty));
      }

      // Fall back to "default" key if provided
      const defaultPenalty = penaltyConfig['default'];
      if (defaultPenalty !== undefined) {
        return Math.abs(Number(defaultPenalty));
      }

      // If we have option-based config but no match, try to find the closest
      const optionKeys = Object.keys(penaltyConfig)
        .filter(k => k !== 'default' && !isNaN(Number(k)))
        .map(Number)
        .sort((a, b) => a - b);

      // Use the penalty for the highest option count that's <= optionsCount
      for (let i = optionKeys.length - 1; i >= 0; i--) {
        if (optionKeys[i] <= optionsCount) {
          const penalty = penaltyConfig[String(optionKeys[i])];
          return Math.abs(Number(penalty));
        }
      }

      // If no match found, use the first available penalty
      if (optionKeys.length > 0) {
        const penalty = penaltyConfig[String(optionKeys[0])];
        return Math.abs(Number(penalty));
      }
    }

    // Fallback: if penalty is object but no optionsCount provided, use "default" or first value
    if (typeof penaltyConfig === 'object') {
      const defaultPenalty = penaltyConfig['default'];
      if (defaultPenalty !== undefined) {
        return Math.abs(Number(defaultPenalty));
      }

      // Use first available penalty value
      const firstKey = Object.keys(penaltyConfig)[0];
      if (firstKey) {
        return Math.abs(Number(penaltyConfig[firstKey]));
      }
    }

    return 0;
  }

  /**
   * Calculate total score based on configured scoring method
   */
  calculateScore(theta?: number): TotalScore {
    const method = this.config.scoring_method;

    switch (method) {
      case 'raw_score':
        return this.calculateRawScore();

      case 'scaled':
        return this.calculateScaledScore();

      case 'weighted':
        return this.calculateWeightedScore();

      case 'irt_based':
        return this.calculateIRTBasedScore(theta);

      case 'custom':
        return this.calculateCustomScore();

      default:
        console.warn(`Unknown scoring method: ${method}, falling back to raw score`);
        return this.calculateRawScore();
    }
  }

  /**
   * Raw Score: Simple count of correct answers with penalties
   * Used by: Many standardized tests
   */
  private calculateRawScore(): TotalScore {
    const penaltyBlank = this.config.penalty_for_blank || 0;

    // Group by section
    const sectionGroups = this.groupBySection();
    const sectionScores: SectionScore[] = [];

    let totalRaw = 0;
    let totalMaxPossible = 0;

    for (const [sectionId, sectionResponses] of Object.entries(sectionGroups)) {
      let sectionRaw = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let blankCount = 0;

      for (const response of sectionResponses) {
        const pointsValue = response.points_value || 1;

        if (response.is_correct) {
          sectionRaw += pointsValue;
          correctCount++;
        } else if (response.is_blank) {
          sectionRaw -= penaltyBlank * pointsValue;
          blankCount++;
        } else {
          // Calculate penalty for wrong answer based on options count
          const penaltyWrong = this.getPenaltyForWrong(response.options_count);
          sectionRaw -= penaltyWrong * pointsValue;
          wrongCount++;
        }
      }

      const maxPossible = sectionResponses.reduce(
        (sum, r) => sum + (r.points_value || 1),
        0
      );

      sectionScores.push({
        section_id: sectionId,
        section_name: sectionResponses[0]?.section_name || sectionId,
        raw_score: sectionRaw,
        max_possible: maxPossible,
        percentage: maxPossible > 0 ? (sectionRaw / maxPossible) * 100 : 0,
        correct_count: correctCount,
        wrong_count: wrongCount,
        blank_count: blankCount,
        total_questions: sectionResponses.length,
      });

      totalRaw += sectionRaw;
      totalMaxPossible += maxPossible;
    }

    return {
      raw_score: totalRaw,
      max_possible: totalMaxPossible,
      percentage: totalMaxPossible > 0 ? (totalRaw / totalMaxPossible) * 100 : 0,
      section_scores: sectionScores,
    };
  }

  /**
   * Scaled Score: Convert raw score to scaled score using conversion table
   * Used by: SAT, GMAT
   */
  private calculateScaledScore(): TotalScore {
    const rawScoreResult = this.calculateRawScore();

    // Scale each section if we have a conversion table
    const scaledSections = rawScoreResult.section_scores.map((section) => {
      const scaledScore = this.rawToScaled(section.raw_score, section.section_id);
      return {
        ...section,
        scaled_score: scaledScore,
      };
    });

    // Calculate total scaled score
    const totalScaledScore = this.rawToScaled(rawScoreResult.raw_score);

    return {
      ...rawScoreResult,
      scaled_score: totalScaledScore,
      section_scores: scaledSections,
    };
  }

  /**
   * Weighted Score: Different sections have different weights
   * Used by: Some custom tests
   */
  private calculateWeightedScore(): TotalScore {
    const rawScoreResult = this.calculateRawScore();
    const weights = this.config.section_weights || {};

    let weightedTotal = 0;
    let totalWeight = 0;

    const weightedSections = rawScoreResult.section_scores.map((section) => {
      const weight = weights[section.section_id] || weights[section.section_name] || 1;
      const weightedScore = section.percentage * weight;

      weightedTotal += weightedScore;
      totalWeight += weight;

      return {
        ...section,
        scaled_score: weightedScore,
      };
    });

    const finalWeightedScore = totalWeight > 0 ? weightedTotal / totalWeight : 0;

    return {
      ...rawScoreResult,
      scaled_score: finalWeightedScore,
      section_scores: weightedSections,
      metadata: {
        weights_applied: weights,
      },
    };
  }

  /**
   * IRT-Based Score: Use theta (ability estimate) to calculate score
   * Used by: Adaptive tests (GMAT)
   */
  private calculateIRTBasedScore(theta?: number): TotalScore {
    const rawScoreResult = this.calculateRawScore();

    if (theta === undefined) {
      console.warn('IRT-based scoring requires theta value, falling back to raw score');
      return rawScoreResult;
    }

    // Convert theta (typically -4 to 4) to score scale
    const scaleMin = this.config.scale_min || 200;
    const scaleMax = this.config.scale_max || 800;

    // Map theta to scale (assuming theta range of -3 to 3 for most practical purposes)
    const thetaMin = -3;
    const thetaMax = 3;
    const normalizedTheta = Math.max(thetaMin, Math.min(thetaMax, theta));

    const scaledScore =
      scaleMin +
      ((normalizedTheta - thetaMin) / (thetaMax - thetaMin)) * (scaleMax - scaleMin);

    return {
      ...rawScoreResult,
      scaled_score: Math.round(scaledScore),
      theta: theta,
      metadata: {
        theta_to_score_mapping: {
          theta,
          theta_range: [thetaMin, thetaMax],
          scale_range: [scaleMin, scaleMax],
        },
      },
    };
  }

  /**
   * Custom Score: Apply custom rules from configuration
   * Used by: Tests with unique scoring requirements
   */
  private calculateCustomScore(): TotalScore {
    const rawScoreResult = this.calculateRawScore();
    const customRules = this.config.custom_rules || {};

    // This is a placeholder for custom scoring logic
    // The actual implementation would depend on the custom_rules structure
    // For now, just return raw score with custom metadata

    return {
      ...rawScoreResult,
      metadata: {
        custom_rules_applied: customRules,
      },
    };
  }

  /**
   * Convert raw score to scaled score using conversion table
   */
  private rawToScaled(rawScore: number, _sectionId?: string): number {
    const table = this.config.raw_to_scaled_table;

    if (!table || table.length === 0) {
      // No conversion table, use linear scaling
      const scaleMin = this.config.scale_min || 0;
      const scaleMax = this.config.scale_max || 100;
      const maxRaw = this.responses.reduce((sum, r) => sum + (r.points_value || 1), 0);

      if (maxRaw === 0) return scaleMin;

      return Math.round(scaleMin + (rawScore / maxRaw) * (scaleMax - scaleMin));
    }

    // Find closest match in conversion table
    if (rawScore <= table[0].raw) {
      return table[0].scaled;
    }

    if (rawScore >= table[table.length - 1].raw) {
      return table[table.length - 1].scaled;
    }

    // Linear interpolation between two points
    for (let i = 0; i < table.length - 1; i++) {
      if (rawScore >= table[i].raw && rawScore <= table[i + 1].raw) {
        const ratio =
          (rawScore - table[i].raw) / (table[i + 1].raw - table[i].raw);
        const scaledScore =
          table[i].scaled + ratio * (table[i + 1].scaled - table[i].scaled);
        return Math.round(scaledScore);
      }
    }

    return table[0].scaled;
  }

  /**
   * Group responses by section
   */
  private groupBySection(): Record<string, QuestionResponse[]> {
    const groups: Record<string, QuestionResponse[]> = {};

    for (const response of this.responses) {
      const sectionId = response.section_id || 'default';
      if (!groups[sectionId]) {
        groups[sectionId] = [];
      }
      groups[sectionId].push(response);
    }

    return groups;
  }

  /**
   * Get section breakdown
   */
  getSectionBreakdown(): SectionScore[] {
    const result = this.calculateScore();
    return result.section_scores;
  }
}

// ============================================================================
// FACTORY AND LOADING FUNCTIONS
// ============================================================================

/**
 * Load scoring configuration from database (2V_algorithm_config table)
 * This is the ONLY place where scoring configuration is defined!
 */
export async function loadScoringConfig(
  testType: string,
  trackType: string
): Promise<ScoringConfig | null> {
  try {
    const { data, error } = await supabase
      .from('2V_algorithm_config')
      .select('*')
      .eq('test_type', testType)
      .eq('track_type', trackType)
      .eq('algorithm_category', 'scoring')
      .maybeSingle();

    if (error) {
      console.error('Error loading scoring config:', error);
      return null;
    }

    if (!data) {
      console.warn(`No scoring config found for ${testType}/${trackType}`);
      return null;
    }

    // Convert null values to undefined and handle missing columns
    // Note: Some columns may not exist in the database schema yet
    const configData = data as Record<string, unknown>;
    return {
      id: data.id,
      test_type: testType,
      track_type: trackType,
      algorithm_category: 'scoring',
      scoring_method: (data.scoring_method as ScoringConfig['scoring_method']) || 'raw_score',
      penalty_for_wrong: (data.penalty_for_wrong as number | Record<string, number> | null) ?? undefined,
      penalty_for_blank: data.penalty_for_blank ?? undefined,
      section_weights: (data.section_weights as Record<string, number> | null) ?? undefined,
      scale_min: (configData.scale_min as number | null) ?? undefined,
      scale_max: (configData.scale_max as number | null) ?? undefined,
      raw_to_scaled_table: (configData.raw_to_scaled_table as ScoringConfig['raw_to_scaled_table']) ?? undefined,
      use_theta_for_score: (configData.use_theta_for_score as boolean | null) ?? undefined,
      custom_rules: (configData.custom_rules as Record<string, unknown> | null) ?? undefined,
      created_at: data.created_at ?? undefined,
      updated_at: data.updated_at ?? undefined,
    };
  } catch (err) {
    console.error('Error loading scoring config:', err);
    return null;
  }
}

/**
 * Create scoring algorithm with configuration from database
 */
export async function createScoringAlgorithm(
  testType: string,
  trackType: string
): Promise<ScoringAlgorithm | null> {
  const config = await loadScoringConfig(testType, trackType);

  if (!config) {
    console.error(`Failed to load scoring config for ${testType}/${trackType}`);
    return null;
  }

  return new ScoringAlgorithm(config);
}
