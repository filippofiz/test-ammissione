/**
 * Results Calculation Algorithms
 * Calculate percentiles, pass/fail, grade boundaries, etc.
 * All configuration is loaded from 2V_algorithm_config table
 *
 * IMPORTANT: Results calculation is test-type specific!
 * - SAT: Percentile rankings, college readiness benchmarks
 * - GMAT: Percentile rankings, score bands
 * - TOLC: Pass/fail thresholds, grade levels
 */

import { supabase } from '../supabase';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Results configuration loaded from database (2V_algorithm_config table)
 */
interface ResultsConfig {
  id?: string;
  test_type: string;
  track_type: string;
  algorithm_category: 'results';

  // Percentile Calculation Method
  percentile_calculation?: 'historical' | 'normative' | 'irt_based';

  // Pass/Fail Configuration
  pass_threshold?: number; // Percentage or scaled score required to pass
  use_scaled_for_pass?: boolean; // Use scaled score vs percentage

  // Grade Boundaries (for multiple performance levels)
  grade_boundaries?: Record<string, number>; // e.g., { "A": 90, "B": 80, "C": 70, "D": 60 }
  grade_labels?: string[]; // e.g., ["Excellent", "Good", "Fair", "Poor"]

  // Percentile Bands (for score interpretation)
  percentile_bands?: Array<{
    min_percentile: number;
    max_percentile: number;
    label: string;
    description?: string;
  }>;

  // College Readiness Benchmarks (SAT-specific)
  college_readiness_benchmarks?: Record<string, number>;

  // Custom results rules
  custom_rules?: Record<string, any>;

  created_at?: string;
  updated_at?: string;
}

interface TestResult {
  student_id: string;
  test_type: string;
  track_type: string;
  raw_score: number;
  scaled_score?: number;
  percentage: number;
  theta?: number;

  // Results
  passed: boolean;
  grade?: string;
  grade_label?: string;
  percentile?: number;
  percentile_band?: string;
  college_ready?: boolean;

  // Metadata
  section_results?: Array<{
    section_id: string;
    section_name: string;
    score: number;
    percentile?: number;
    passed?: boolean;
  }>;

  interpretation?: string;
  recommendations?: string[];
  metadata?: Record<string, any>;
}

interface HistoricalScore {
  score: number;
  scaled_score?: number;
  student_id: string;
  completed_at: string;
}

// ============================================================================
// RESULTS ALGORITHM CLASS
// ============================================================================

export class ResultsAlgorithm {
  private config: ResultsConfig;

  constructor(config: ResultsConfig) {
    this.config = config;
  }

  /**
   * Calculate complete results for a student
   */
  async calculateResults(
    studentId: string,
    testType: string,
    trackType: string,
    rawScore: number,
    scaledScore?: number,
    percentage?: number,
    theta?: number,
    sectionScores?: Array<{ section_id: string; section_name: string; score: number }>
  ): Promise<TestResult> {
    // Calculate pass/fail
    const passed = this.calculatePassFail(rawScore, scaledScore, percentage);

    // Calculate grade
    const { grade, gradeLabel } = this.calculateGrade(rawScore, scaledScore, percentage);

    // Calculate percentile
    const percentile = await this.calculatePercentile(
      testType,
      trackType,
      rawScore,
      scaledScore,
      theta
    );

    // Determine percentile band
    const percentileBand = this.getPercentileBand(percentile);

    // Check college readiness (if applicable)
    const collegeReady = this.checkCollegeReadiness(scaledScore, sectionScores);

    // Generate interpretation and recommendations
    const interpretation = this.generateInterpretation(
      passed,
      grade,
      percentile,
      collegeReady
    );
    const recommendations = this.generateRecommendations(
      passed,
      grade,
      percentile,
      sectionScores
    );

    // Calculate section results
    const sectionResults = await this.calculateSectionResults(
      testType,
      trackType,
      sectionScores
    );

    return {
      student_id: studentId,
      test_type: testType,
      track_type: trackType,
      raw_score: rawScore,
      scaled_score: scaledScore,
      percentage: percentage || 0,
      theta: theta,
      passed,
      grade,
      grade_label: gradeLabel,
      percentile,
      percentile_band: percentileBand,
      college_ready: collegeReady,
      section_results: sectionResults,
      interpretation,
      recommendations,
    };
  }

  /**
   * Calculate pass/fail status
   */
  private calculatePassFail(
    rawScore: number,
    scaledScore?: number,
    percentage?: number
  ): boolean {
    const threshold = this.config.pass_threshold;

    if (threshold === undefined) {
      // No pass/fail threshold configured
      return true;
    }

    const useScaled = this.config.use_scaled_for_pass || false;

    if (useScaled && scaledScore !== undefined) {
      return scaledScore >= threshold;
    } else if (percentage !== undefined) {
      return percentage >= threshold;
    } else {
      // Fallback: assume threshold is percentage
      // Calculate percentage from raw score if not provided
      return false; // Can't determine without more info
    }
  }

  /**
   * Calculate grade based on grade boundaries
   */
  private calculateGrade(
    rawScore: number,
    scaledScore?: number,
    percentage?: number
  ): { grade?: string; gradeLabel?: string } {
    const boundaries = this.config.grade_boundaries;
    const labels = this.config.grade_labels;

    if (!boundaries || Object.keys(boundaries).length === 0) {
      return {};
    }

    // Determine which score to use
    const scoreToUse = scaledScore || percentage || rawScore;

    // Sort boundaries by value (descending)
    const sortedBoundaries = Object.entries(boundaries).sort(
      ([, a], [, b]) => b - a
    );

    // Find appropriate grade
    for (let i = 0; i < sortedBoundaries.length; i++) {
      const [grade, threshold] = sortedBoundaries[i];

      if (scoreToUse >= threshold) {
        const gradeLabel = labels && labels[i] ? labels[i] : undefined;
        return { grade, gradeLabel };
      }
    }

    // Below all thresholds
    const lowestGrade = sortedBoundaries[sortedBoundaries.length - 1]?.[0];
    const lowestLabel = labels?.[sortedBoundaries.length - 1];

    return { grade: lowestGrade, gradeLabel: lowestLabel };
  }

  /**
   * Calculate percentile ranking
   */
  private async calculatePercentile(
    testType: string,
    trackType: string,
    rawScore: number,
    scaledScore?: number,
    theta?: number
  ): Promise<number | undefined> {
    const method = this.config.percentile_calculation || 'historical';

    switch (method) {
      case 'historical':
        return this.calculateHistoricalPercentile(testType, trackType, rawScore, scaledScore);

      case 'normative':
        return this.calculateNormativePercentile(rawScore, scaledScore);

      case 'irt_based':
        return this.calculateIRTPercentile(theta);

      default:
        console.warn(`Unknown percentile method: ${method}`);
        return undefined;
    }
  }

  /**
   * Historical Percentile: Based on actual student scores in database
   */
  private async calculateHistoricalPercentile(
    testType: string,
    trackType: string,
    rawScore: number,
    scaledScore?: number
  ): Promise<number | undefined> {
    try {
      // Get all completed test scores for this test type and track
      const { data: scores, error } = await supabase
        .from('2V_test_assignments')
        .select('raw_score, scaled_score')
        .eq('test_type', testType)
        .eq('track_type', trackType)
        .eq('status', 'completed')
        .not('raw_score', 'is', null);

      if (error || !scores || scores.length === 0) {
        console.warn('No historical data available for percentile calculation');
        return undefined;
      }

      // Use scaled score if available, otherwise raw score
      const useScaled = scaledScore !== undefined;
      const currentScore = useScaled ? scaledScore : rawScore;

      const historicalScores = scores
        .map((s) => (useScaled ? s.scaled_score : s.raw_score))
        .filter((s) => s !== null && s !== undefined) as number[];

      if (historicalScores.length === 0) {
        return undefined;
      }

      // Calculate percentile: percentage of scores below current score
      const belowCount = historicalScores.filter((s) => s < currentScore).length;
      const percentile = (belowCount / historicalScores.length) * 100;

      return Math.round(percentile);
    } catch (err) {
      console.error('Error calculating historical percentile:', err);
      return undefined;
    }
  }

  /**
   * Normative Percentile: Based on pre-defined normal distribution
   * Used for standardized tests with published norms
   */
  private calculateNormativePercentile(
    rawScore: number,
    scaledScore?: number
  ): number | undefined {
    // This would use pre-defined percentile tables from test publishers
    // For now, return undefined as this requires external data
    console.warn('Normative percentile calculation requires external norm tables');
    return undefined;
  }

  /**
   * IRT-Based Percentile: Convert theta to percentile assuming normal distribution
   */
  private calculateIRTPercentile(theta?: number): number | undefined {
    if (theta === undefined) {
      return undefined;
    }

    // Theta is assumed to be normally distributed with mean=0, sd=1
    // Use cumulative normal distribution
    const percentile = this.normalCDF(theta) * 100;

    return Math.round(percentile);
  }

  /**
   * Cumulative Normal Distribution Function
   */
  private normalCDF(z: number): number {
    // Approximation using error function
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return z > 0 ? 1 - prob : prob;
  }

  /**
   * Get percentile band label
   */
  private getPercentileBand(percentile?: number): string | undefined {
    if (percentile === undefined) {
      return undefined;
    }

    const bands = this.config.percentile_bands;

    if (!bands || bands.length === 0) {
      // Default bands
      if (percentile >= 90) return 'Top 10%';
      if (percentile >= 75) return 'Top 25%';
      if (percentile >= 50) return 'Above Average';
      if (percentile >= 25) return 'Below Average';
      return 'Bottom 25%';
    }

    // Find matching band
    for (const band of bands) {
      if (percentile >= band.min_percentile && percentile <= band.max_percentile) {
        return band.label;
      }
    }

    return undefined;
  }

  /**
   * Check college readiness (SAT-specific)
   */
  private checkCollegeReadiness(
    scaledScore?: number,
    sectionScores?: Array<{ section_id: string; section_name: string; score: number }>
  ): boolean | undefined {
    const benchmarks = this.config.college_readiness_benchmarks;

    if (!benchmarks || Object.keys(benchmarks).length === 0) {
      return undefined; // Not applicable for this test
    }

    // Check if all sections meet benchmarks
    if (sectionScores) {
      for (const section of sectionScores) {
        const benchmark =
          benchmarks[section.section_id] || benchmarks[section.section_name];

        if (benchmark !== undefined && section.score < benchmark) {
          return false;
        }
      }
      return true;
    }

    // Check overall score
    if (scaledScore !== undefined && benchmarks['total']) {
      return scaledScore >= benchmarks['total'];
    }

    return undefined;
  }

  /**
   * Calculate section-level results
   */
  private async calculateSectionResults(
    testType: string,
    trackType: string,
    sectionScores?: Array<{ section_id: string; section_name: string; score: number }>
  ): Promise<Array<{ section_id: string; section_name: string; score: number; percentile?: number; passed?: boolean }> | undefined> {
    if (!sectionScores || sectionScores.length === 0) {
      return undefined;
    }

    const results = [];

    for (const section of sectionScores) {
      // Calculate section-level percentile (simplified - would need section-specific historical data)
      const percentile = await this.calculateHistoricalPercentile(
        testType,
        trackType,
        section.score,
        section.score
      );

      // Check if section passes threshold
      const sectionThreshold = this.config.pass_threshold;
      const passed = sectionThreshold !== undefined ? section.score >= sectionThreshold : undefined;

      results.push({
        ...section,
        percentile,
        passed,
      });
    }

    return results;
  }

  /**
   * Generate interpretation text
   */
  private generateInterpretation(
    passed: boolean,
    grade?: string,
    percentile?: number,
    collegeReady?: boolean
  ): string {
    const parts = [];

    if (grade) {
      parts.push(`You received a grade of ${grade}.`);
    }

    if (percentile !== undefined) {
      parts.push(`You scored better than ${percentile}% of test takers.`);
    }

    if (collegeReady !== undefined) {
      if (collegeReady) {
        parts.push('You have demonstrated college readiness in all sections.');
      } else {
        parts.push('Some sections may require additional preparation for college-level work.');
      }
    }

    if (passed) {
      parts.push('Congratulations, you have passed this test!');
    } else {
      parts.push('You did not meet the passing threshold. Consider reviewing the material and trying again.');
    }

    return parts.join(' ');
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    passed: boolean,
    grade?: string,
    percentile?: number,
    sectionScores?: Array<{ section_id: string; section_name: string; score: number }>
  ): string[] {
    const recommendations: string[] = [];

    if (!passed) {
      recommendations.push('Review fundamental concepts before retaking the test');
      recommendations.push('Consider additional study time or tutoring support');
    }

    if (percentile !== undefined && percentile < 50) {
      recommendations.push('Focus on areas where you struggled the most');
      recommendations.push('Practice with similar test formats to improve familiarity');
    }

    if (sectionScores) {
      // Find weakest section
      const weakestSection = sectionScores.reduce((min, section) =>
        section.score < min.score ? section : min
      );

      recommendations.push(
        `Consider additional practice in ${weakestSection.section_name} where you scored ${weakestSection.score}`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Continue practicing to maintain your skills.');
    }

    return recommendations;
  }
}

// ============================================================================
// FACTORY AND LOADING FUNCTIONS
// ============================================================================

/**
 * Load results configuration from database (2V_algorithm_config table)
 * This is the ONLY place where results configuration is defined!
 */
export async function loadResultsConfig(
  testType: string,
  trackType: string
): Promise<ResultsConfig | null> {
  try {
    const { data, error } = await supabase
      .from('2V_algorithm_config')
      .select('*')
      .eq('test_type', testType)
      .eq('track_type', trackType)
      .eq('algorithm_category', 'results')
      .maybeSingle();

    if (error) {
      console.error('Error loading results config:', error);
      return null;
    }

    if (!data) {
      console.warn(`No results config found for ${testType}/${trackType}`);
      return null;
    }

    return {
      id: data.id,
      test_type: testType,
      track_type: trackType,
      algorithm_category: 'results',
      percentile_calculation: data.percentile_calculation || 'historical',
      pass_threshold: data.pass_threshold,
      use_scaled_for_pass: data.use_scaled_for_pass,
      grade_boundaries: data.grade_boundaries,
      grade_labels: data.grade_labels,
      percentile_bands: data.percentile_bands,
      college_readiness_benchmarks: data.college_readiness_benchmarks,
      custom_rules: data.custom_rules,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error('Error loading results config:', err);
    return null;
  }
}

/**
 * Create results algorithm with configuration from database
 */
export async function createResultsAlgorithm(
  testType: string,
  trackType: string
): Promise<ResultsAlgorithm | null> {
  const config = await loadResultsConfig(testType, trackType);

  if (!config) {
    console.error(`Failed to load results config for ${testType}/${trackType}`);
    return null;
  }

  return new ResultsAlgorithm(config);
}
