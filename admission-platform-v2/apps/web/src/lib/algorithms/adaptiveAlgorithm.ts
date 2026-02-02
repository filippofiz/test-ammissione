/**
 * Adaptive Testing Algorithms
 * Implements both Simple and Complex (CAT with IRT) adaptive testing algorithms
 *
 * IMPORTANT: All configuration parameters are loaded from 2V_algorithm_config table
 */

import { supabase } from '../supabase';

// ============================================================================
// INTERFACES
// ============================================================================

interface Question {
  id: string;
  difficulty?: number | string; // Can be numeric (1-5) or string ('easy', 'medium', 'hard')
  section_id?: string;
  discrimination?: number; // IRT parameter 'a'
  guessing?: number; // IRT parameter 'c'
  exposure_count?: number;
}

interface ResponsePattern {
  question_id: string;
  is_correct: boolean;
  difficulty?: number;
  discrimination?: number;
  guessing?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert difficulty from string or number to numeric scale (1-5)
 * Supports: 'easy', 'medium', 'hard' strings or numeric 1-5 values
 */
function normalizeDifficulty(difficulty?: number | string): number {
  if (difficulty === undefined || difficulty === null) {
    return 3; // Default to medium
  }

  if (typeof difficulty === 'number') {
    return difficulty;
  }

  // Convert string to number
  const difficultyMap: Record<string, number> = {
    'very_easy': 1,
    'easy': 2,
    'medium': 3,
    'hard': 4,
    'very_hard': 5,
    // Also support lowercase variants
    'veryeasy': 1,
    'veryhard': 5,
  };

  const normalized = difficulty.toLowerCase().replace(/[\s-]/g, '_');
  return difficultyMap[normalized] || 3; // Default to medium if unknown
}

/**
 * Adaptive configuration loaded from database (2V_algorithm_config table)
 */
interface AdaptiveConfig {
  id?: string;
  test_type: string;
  track_type: string;
  algorithm_type: 'simple' | 'complex';

  // Simple Algorithm Config
  simple_difficulty_increment?: number;

  // Complex Algorithm Config (CAT/IRT)
  irt_model?: '1PL' | '2PL' | '3PL';
  initial_theta?: number;
  theta_min?: number;
  theta_max?: number;
  se_threshold?: number;
  max_information_weight?: number;
  exposure_control?: boolean;

  // Base Questions Config (from test track config, not algorithm config)
  use_base_questions?: boolean;
  base_questions_scope?: 'entire_test' | 'per_section';
  base_questions_count?: number;
}

interface AdaptiveState {
  current_difficulty?: number;
  theta?: number; // Current ability estimate
  se?: number; // Standard error of theta
  response_pattern: ResponsePattern[];
  questions_answered: number;
  base_questions_completed: boolean;
}

// ============================================================================
// SIMPLE ADAPTIVE ALGORITHM
// ============================================================================

/**
 * Simple Adaptive Algorithm
 * - Correct answer → increase difficulty
 * - Wrong answer → decrease difficulty
 */
export class SimpleAdaptiveAlgorithm {
  private config: AdaptiveConfig;
  private state: AdaptiveState;

  constructor(config: AdaptiveConfig, initialState?: AdaptiveState) {
    this.config = config;
    this.state = initialState || {
      current_difficulty: 3, // Start at medium difficulty (1-5 scale)
      response_pattern: [],
      questions_answered: 0,
      base_questions_completed: false,
    };
  }

  /**
   * Select next question based on current difficulty level
   */
  async selectNextQuestion(
    availableQuestions: Question[],
    sectionId?: string
  ): Promise<Question | null> {
    if (availableQuestions.length === 0) {
      return null;
    }

    // Handle base questions phase
    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed &&
      this.state.questions_answered < (this.config.base_questions_count || 5)
    ) {
      return this.selectBaseQuestion(availableQuestions, sectionId);
    }

    // Mark base questions as completed
    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed &&
      this.state.questions_answered >= (this.config.base_questions_count || 5)
    ) {
      this.state.base_questions_completed = true;
      // Calculate initial difficulty based on base questions performance
      this.calculateInitialDifficulty();
    }

    // Filter questions by current difficulty level
    const targetDifficulty = this.state.current_difficulty || 3;
    const increment = this.config.simple_difficulty_increment || 1;

    // Find questions within acceptable difficulty range (±increment)
    const suitableQuestions = availableQuestions.filter((q) => {
      if (!q.difficulty) return false;
      const numericDiff = normalizeDifficulty(q.difficulty);
      const diff = Math.abs(numericDiff - targetDifficulty);
      return diff <= increment;
    });

    if (suitableQuestions.length > 0) {
      // Sort by closeness to target difficulty
      suitableQuestions.sort((a, b) => {
        const diffA = Math.abs(normalizeDifficulty(a.difficulty) - targetDifficulty);
        const diffB = Math.abs(normalizeDifficulty(b.difficulty) - targetDifficulty);
        return diffA - diffB;
      });

      // Randomize among the top closest questions (to avoid always picking the same one)
      const topN = Math.min(3, suitableQuestions.length);
      const topQuestions = suitableQuestions.slice(0, topN);
      const randomIndex = Math.floor(Math.random() * topQuestions.length);
      return topQuestions[randomIndex];
    }

    // FALLBACK 1: Select any question with difficulty level (randomized)
    const questionsWithDifficulty = availableQuestions.filter((q) => q.difficulty);
    if (questionsWithDifficulty.length > 0) {
      console.warn(`⚠️ No questions found within difficulty range ${targetDifficulty}±${increment}. Using fallback with any difficulty.`);
      const shuffled = [...questionsWithDifficulty].sort(() => Math.random() - 0.5);
      return shuffled[0];
    }

    // FALLBACK 2: Last resort - any question (randomized)
    console.warn(`⚠️ No questions with difficulty metadata found. Using random question.`);
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }

  /**
   * Select base question (random or sequential from medium difficulty)
   */
  private selectBaseQuestion(
    availableQuestions: Question[],
    _sectionId?: string
  ): Question {
    // Prefer medium difficulty questions (3 on 1-5 scale)
    const mediumQuestions = availableQuestions.filter((q) => normalizeDifficulty(q.difficulty) === 3);

    if (mediumQuestions.length > 0) {
      // Random selection
      const randomIndex = Math.floor(Math.random() * mediumQuestions.length);
      return mediumQuestions[randomIndex];
    }

    // Fallback: any question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }

  /**
   * Calculate initial difficulty based on base questions performance
   */
  private calculateInitialDifficulty(): void {
    if (this.state.response_pattern.length === 0) {
      this.state.current_difficulty = 3;
      return;
    }

    const correctCount = this.state.response_pattern.filter((r) => r.is_correct).length;
    const totalCount = this.state.response_pattern.length;
    const accuracy = correctCount / totalCount;

    // Map accuracy to difficulty level (1-5)
    if (accuracy >= 0.8) {
      this.state.current_difficulty = 4; // High difficulty
    } else if (accuracy >= 0.6) {
      this.state.current_difficulty = 3; // Medium difficulty
    } else if (accuracy >= 0.4) {
      this.state.current_difficulty = 2; // Low-medium difficulty
    } else {
      this.state.current_difficulty = 1; // Low difficulty
    }
  }

  /**
   * Update state after student response
   */
  recordResponse(question: Question, isCorrect: boolean): void {
    // Add to response pattern
    this.state.response_pattern.push({
      question_id: question.id,
      is_correct: isCorrect,
      difficulty: normalizeDifficulty(question.difficulty),
    });

    this.state.questions_answered++;

    // Skip difficulty adjustment during base questions phase
    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed
    ) {
      return;
    }

    // Adjust difficulty based on response
    const increment = this.config.simple_difficulty_increment || 1;

    if (isCorrect) {
      // Increase difficulty
      this.state.current_difficulty = Math.min(
        5,
        (this.state.current_difficulty || 3) + increment
      );
    } else {
      // Decrease difficulty
      this.state.current_difficulty = Math.max(
        1,
        (this.state.current_difficulty || 3) - increment
      );
    }
  }

  /**
   * Get current state
   */
  getState(): AdaptiveState {
    return this.state;
  }

  /**
   * Check if test should terminate (for simple algorithm, use external criteria)
   */
  shouldTerminate(): boolean {
    // Simple algorithm doesn't have built-in stopping rule
    // Use external criteria (e.g., max questions, time limit)
    return false;
  }

  /**
   * Reset state for a new section (for per_section base questions scope)
   * Keeps current_difficulty but resets base questions phase and questions answered counter
   */
  resetForNewSection(): void {
    console.log('🎯 [ADAPTIVE SIMPLE] Resetting for new section, keeping difficulty:', this.state.current_difficulty);
    this.state.base_questions_completed = false;
    this.state.questions_answered = 0;
    // Note: We keep response_pattern and current_difficulty to maintain overall performance tracking
  }
}

// ============================================================================
// COMPLEX ADAPTIVE ALGORITHM (CAT WITH IRT)
// ============================================================================

/**
 * Complex Adaptive Algorithm using Item Response Theory (IRT)
 * Based on GMAT-style CAT implementation
 */
export class ComplexAdaptiveAlgorithm {
  private config: AdaptiveConfig;
  private state: AdaptiveState;

  constructor(config: AdaptiveConfig, initialState?: AdaptiveState) {
    this.config = config;
    this.state = initialState || {
      theta: config.initial_theta || 0, // Start at average ability
      se: 999, // Start with high uncertainty
      response_pattern: [],
      questions_answered: 0,
      base_questions_completed: false,
    };
  }

  /**
   * Select next question using maximum information criterion
   */
  async selectNextQuestion(
    availableQuestions: Question[],
    sectionId?: string
  ): Promise<Question | null> {
    // Count questions by difficulty
    const difficultyCount: Record<number, number> = {};
    availableQuestions.forEach(q => {
      const d = normalizeDifficulty(q.difficulty);
      difficultyCount[d] = (difficultyCount[d] || 0) + 1;
    });

    console.log('🎯 [ADAPTIVE] selectNextQuestion called:', {
      availableCount: availableQuestions.length,
      difficulties: `easy:${difficultyCount[2] || 0}, med:${difficultyCount[3] || 0}, hard:${difficultyCount[4] || 0}`,
      sectionId,
      questionsAnswered: this.state.questions_answered,
      baseQuestionsCompleted: this.state.base_questions_completed,
      currentTheta: this.state.theta,
      standardError: this.state.se?.toFixed(3)
    });

    if (availableQuestions.length === 0) {
      console.log('🎯 [ADAPTIVE] No available questions');
      return null;
    }

    // Handle base questions phase
    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed &&
      this.state.questions_answered < (this.config.base_questions_count || 5)
    ) {
      console.log('🎯 [ADAPTIVE] Selecting BASE question (phase 1)');
      return this.selectBaseQuestion(availableQuestions, sectionId);
    }

    // Mark base questions as completed and estimate initial theta
    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed &&
      this.state.questions_answered >= (this.config.base_questions_count || 5)
    ) {
      this.state.base_questions_completed = true;
      this.estimateTheta(); // Calculate theta from base questions
      console.log('🎯 [ADAPTIVE] Base questions completed, estimated theta:', this.state.theta);
    }

    // Select question with maximum information at current theta
    const currentTheta = this.state.theta || 0;
    // Note: maxInfoWeight reserved for future weighted information selection
    // const maxInfoWeight = this.config.max_information_weight || 1.0;

    // Calculate information for each question
    const questionsWithInfo = availableQuestions.map((q) => ({
      question: q,
      information: this.calculateInformation(q, currentTheta),
      exposureRate: this.calculateExposureRate(q),
    }));

    // Apply exposure control if enabled
    if (this.config.exposure_control) {
      // Filter out over-exposed questions (>20% exposure rate)
      const notOverExposed = questionsWithInfo.filter((q) => q.exposureRate < 0.2);
      if (notOverExposed.length > 0) {
        questionsWithInfo.length = 0;
        questionsWithInfo.push(...notOverExposed);
      }
    }

    // Sort by information (highest first)
    questionsWithInfo.sort((a, b) => b.information - a.information);

    // Select from top questions (to add randomness and avoid over-exposure)
    const topN = Math.min(5, questionsWithInfo.length);
    const topQuestions = questionsWithInfo.slice(0, topN);

    console.log('🎯 [ADAPTIVE] Selecting ADAPTIVE question:', {
      currentTheta,
      topQuestions: topQuestions.map(q => ({
        id: q.question.id.substring(0, 8),
        difficulty: normalizeDifficulty(q.question.difficulty),
        information: q.information.toFixed(4)
      }))
    });

    // Weight by information and select randomly
    const totalInfo = topQuestions.reduce((sum, q) => sum + q.information, 0);
    let random = Math.random() * totalInfo;

    for (const item of topQuestions) {
      random -= item.information;
      if (random <= 0) {
        console.log('🎯 [ADAPTIVE] Selected question:', {
          id: item.question.id.substring(0, 8),
          difficulty: normalizeDifficulty(item.question.difficulty),
          information: item.information.toFixed(4)
        });
        return item.question;
      }
    }

    // Fallback: return highest information question
    const selected = questionsWithInfo[0]?.question || availableQuestions[0];
    console.log('🎯 [ADAPTIVE] Fallback selection:', selected?.id?.substring(0, 8));
    return selected;
  }

  /**
   * Select base question (random from medium difficulty)
   */
  private selectBaseQuestion(
    availableQuestions: Question[],
    sectionId?: string
  ): Question {
    console.log('🎯 [ADAPTIVE] selectBaseQuestion called:', {
      availableCount: availableQuestions.length,
      sectionId
    });

    // Guard: if no questions available, return undefined
    if (availableQuestions.length === 0) {
      console.error('❌ [ADAPTIVE] selectBaseQuestion: No questions available!');
      return undefined as any;
    }

    // For IRT, select questions near theta = 0 (average difficulty)
    const mediumDifficultyQuestions = availableQuestions.filter(
      (q) => {
        const numDiff = normalizeDifficulty(q.difficulty);
        return numDiff >= 2 && numDiff <= 4;
      }
    );

    console.log('🎯 [ADAPTIVE] Medium difficulty questions:', {
      mediumCount: mediumDifficultyQuestions.length,
      totalAvailable: availableQuestions.length
    });

    if (mediumDifficultyQuestions.length > 0) {
      // Shuffle and select to ensure randomization
      const shuffled = [...mediumDifficultyQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled[0];
      console.log('🎯 [ADAPTIVE] Base question selected (medium):', {
        id: selected.id.substring(0, 8),
        difficulty: normalizeDifficulty(selected.difficulty)
      });
      return selected;
    }

    // FALLBACK: No questions with target difficulty, use any question
    console.warn(`⚠️ No medium difficulty questions (2-4) found for base questions. Using random fallback.`);
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const fallback = availableQuestions[randomIndex];
    console.log('🎯 [ADAPTIVE] Base question selected (fallback):', {
      id: fallback.id.substring(0, 8),
      difficulty: normalizeDifficulty(fallback.difficulty)
    });
    return fallback;
  }

  /**
   * Calculate Fisher Information for a question at given theta
   */
  private calculateInformation(question: Question, theta: number): number {
    const model = this.config.irt_model || '2PL';
    const b = this.difficultyToB(normalizeDifficulty(question.difficulty)); // Difficulty (b parameter)
    const a = question.discrimination || 1.0; // Discrimination
    const c = model === '3PL' ? question.guessing || 0.25 : 0; // Guessing

    const p = this.probabilityCorrect(theta, a, b, c);

    if (model === '1PL') {
      // 1PL: I(θ) = p(1-p)
      return p * (1 - p);
    } else if (model === '2PL') {
      // 2PL: I(θ) = a² * p(1-p)
      return a * a * p * (1 - p);
    } else {
      // 3PL: I(θ) = a² * [(p-c)/(1-c)]² * (1-p)/p
      if (p === 0 || p === 1) return 0;
      const numerator = (p - c) / (1 - c);
      return (a * a * numerator * numerator * (1 - p)) / p;
    }
  }

  /**
   * Calculate probability of correct response using IRT
   */
  private probabilityCorrect(
    theta: number,
    a: number,
    b: number,
    c: number
  ): number {
    const exponent = a * (theta - b);
    const p = c + (1 - c) / (1 + Math.exp(-exponent));
    return Math.max(0, Math.min(1, p)); // Clamp to [0, 1]
  }

  /**
   * Convert difficulty level (1-5) to IRT b parameter (-3 to 3)
   */
  private difficultyToB(difficulty: number): number {
    // Map 1-5 scale to -2 to 2 scale
    return (difficulty - 3) * 0.8;
  }

  /**
   * Calculate exposure rate for a question
   */
  private calculateExposureRate(question: Question): number {
    // This would require tracking total test administrations
    // For now, use a simple heuristic based on exposure_count
    const exposureCount = question.exposure_count || 0;
    const estimatedTotalTests = 1000; // This should come from database
    return exposureCount / Math.max(estimatedTotalTests, 1);
  }

  /**
   * Estimate theta using Maximum Likelihood Estimation (MLE)
   */
  private estimateTheta(): void {
    if (this.state.response_pattern.length === 0) {
      this.state.theta = this.config.initial_theta || 0;
      return;
    }

    const model = this.config.irt_model || '2PL';
    let theta = this.state.theta || 0;
    const maxIterations = 20;
    const convergence = 0.001;

    // Newton-Raphson method for MLE
    for (let iter = 0; iter < maxIterations; iter++) {
      let firstDerivative = 0;
      let secondDerivative = 0;

      for (const response of this.state.response_pattern) {
        const a = response.discrimination || 1.0;
        const b = this.difficultyToB(response.difficulty || 3);
        const c = model === '3PL' ? response.guessing || 0.25 : 0;

        const p = this.probabilityCorrect(theta, a, b, c);
        const q = 1 - p;

        if (model === '1PL' || model === '2PL') {
          const u = response.is_correct ? 1 : 0;
          firstDerivative += a * (u - p);
          secondDerivative -= a * a * p * q;
        } else {
          // 3PL is more complex
          const u = response.is_correct ? 1 : 0;
          const numerator = p - c;
          const denominator = 1 - c;
          firstDerivative += (a * (u - p) * numerator) / (denominator * p * q);
          secondDerivative -=
            (a * a * numerator * numerator) / (denominator * denominator * p * q);
        }
      }

      // Newton-Raphson update
      if (Math.abs(secondDerivative) < 0.0001) break;
      const delta = firstDerivative / secondDerivative;
      theta -= delta;

      // Apply bounds
      const thetaMin = this.config.theta_min || -4;
      const thetaMax = this.config.theta_max || 4;
      theta = Math.max(thetaMin, Math.min(thetaMax, theta));

      if (Math.abs(delta) < convergence) break;
    }

    this.state.theta = theta;

    // Calculate standard error
    this.calculateStandardError();
  }

  /**
   * Calculate standard error of theta estimate
   */
  private calculateStandardError(): void {
    if (this.state.response_pattern.length === 0) {
      this.state.se = 999;
      return;
    }

    const theta = this.state.theta || 0;
    let totalInformation = 0;

    for (const response of this.state.response_pattern) {
      const question = {
        difficulty: response.difficulty,
        discrimination: response.discrimination,
        guessing: response.guessing,
      } as Question;
      totalInformation += this.calculateInformation(question, theta);
    }

    if (totalInformation > 0) {
      this.state.se = 1 / Math.sqrt(totalInformation);
    } else {
      this.state.se = 999;
    }
  }

  /**
   * Record student response and update theta
   */
  recordResponse(question: Question, isCorrect: boolean): void {
    const previousTheta = this.state.theta;
    const numericDifficulty = normalizeDifficulty(question.difficulty);

    // Check if this is a new question or an answer change
    const existingResponseIndex = this.state.response_pattern.findIndex(
      (r) => r.question_id === question.id
    );

    if (existingResponseIndex >= 0) {
      // Update existing response (answer changed)
      this.state.response_pattern[existingResponseIndex] = {
        question_id: question.id,
        is_correct: isCorrect,
        difficulty: numericDifficulty,
        discrimination: question.discrimination,
        guessing: question.guessing,
      };
      console.log('🔄 [ADAPTIVE] Answer changed for question:', {
        questionId: question.id.substring(0, 8),
        newAnswer: isCorrect ? 'correct' : 'incorrect',
        questionsAnswered: this.state.questions_answered
      });
    } else {
      // New question - add to response pattern
      this.state.response_pattern.push({
        question_id: question.id,
        is_correct: isCorrect,
        difficulty: numericDifficulty,
        discrimination: question.discrimination,
        guessing: question.guessing,
      });

      this.state.questions_answered++;  // Only increment for NEW questions
    }

    // Skip theta estimation during base questions phase
    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed
    ) {
      console.log('🎯 [ADAPTIVE] recordResponse (base phase):', {
        questionId: question.id.substring(0, 8),
        isCorrect,
        difficulty: numericDifficulty,
        questionsAnswered: this.state.questions_answered,
        baseQuestionsCount: this.config.base_questions_count
      });
      return;
    }

    // Re-estimate theta with new response
    this.estimateTheta();

    console.log('🎯 [ADAPTIVE] recordResponse:', {
      questionId: question.id.substring(0, 8),
      isCorrect,
      difficulty: numericDifficulty,
      previousTheta: previousTheta?.toFixed(3),
      newTheta: this.state.theta?.toFixed(3),
      thetaChange: ((this.state.theta || 0) - (previousTheta || 0)).toFixed(3),
      standardError: this.state.se?.toFixed(3),
      questionsAnswered: this.state.questions_answered
    });
  }

  /**
   * Check if test should terminate based on SE threshold
   */
  shouldTerminate(): boolean {
    const seThreshold = this.config.se_threshold || 0.3;
    return (this.state.se || 999) <= seThreshold;
  }

  /**
   * Get current state
   */
  getState(): AdaptiveState {
    return this.state;
  }

  /**
   * Get final ability estimate
   */
  getFinalTheta(): number {
    return this.state.theta || 0;
  }

  /**
   * Get final standard error
   */
  getFinalSE(): number {
    return this.state.se || 999;
  }

  /**
   * Reset state for a new section (for per_section base questions scope)
   * Keeps theta but resets base questions phase and questions answered counter
   */
  resetForNewSection(): void {
    console.log('🎯 [ADAPTIVE] Resetting for new section, keeping theta:', this.state.theta?.toFixed(3));
    this.state.base_questions_completed = false;
    this.state.questions_answered = 0;
    // Note: We keep response_pattern and theta to maintain overall ability estimate
    // If you want fully independent sections, also reset: this.state.theta = this.config.initial_theta || 0;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create appropriate adaptive algorithm based on configuration
 */
export function createAdaptiveAlgorithm(
  config: AdaptiveConfig,
  initialState?: AdaptiveState
): SimpleAdaptiveAlgorithm | ComplexAdaptiveAlgorithm {
  if (config.algorithm_type === 'simple') {
    return new SimpleAdaptiveAlgorithm(config, initialState);
  } else {
    return new ComplexAdaptiveAlgorithm(config, initialState);
  }
}

/**
 * Load adaptive configuration from database (2V_algorithm_config table)
 * This is the ONLY place where algorithm configuration is defined!
 */
export async function loadAdaptiveConfig(
  testType: string,
  trackType: string
): Promise<AdaptiveConfig | null> {
  try {
    // Load from 2V_algorithm_config table
    const { data: algorithmData, error: algoError } = await supabase
      .from('2V_algorithm_config')
      .select('*')
      .eq('test_type', testType)
      .eq('track_type', trackType)
      .eq('algorithm_category', 'adaptive')
      .maybeSingle();

    if (algoError) {
      console.error('Error loading adaptive config:', algoError);
      return null;
    }

    if (!algorithmData) {
      console.warn(`No adaptive algorithm config found for ${testType}/${trackType}`);
      return null;
    }

    // Also load base questions config from test track config
    const { data: trackData, error: trackError } = await supabase
      .from('2V_test_track_config')
      .select('use_base_questions, base_questions_scope, base_questions_count')
      .eq('test_type', testType)
      .eq('track_type', trackType)
      .maybeSingle();

    if (trackError) {
      console.error('Error loading track config:', trackError);
    }

    // Combine algorithm config with base questions config
    // Convert null values to undefined for interface compatibility
    return {
      id: algorithmData.id,
      test_type: testType,
      track_type: trackType,
      algorithm_type: algorithmData.algorithm_type as 'simple' | 'complex',

      // Simple algorithm parameters (from database)
      simple_difficulty_increment: algorithmData.simple_difficulty_increment ?? undefined,

      // Complex algorithm parameters (from database)
      irt_model: (algorithmData.irt_model as '1PL' | '2PL' | '3PL' | null) ?? undefined,
      initial_theta: algorithmData.initial_theta ?? undefined,
      theta_min: algorithmData.theta_min ?? undefined,
      theta_max: algorithmData.theta_max ?? undefined,
      se_threshold: algorithmData.se_threshold ?? undefined,
      max_information_weight: algorithmData.max_information_weight ?? undefined,
      exposure_control: algorithmData.exposure_control ?? undefined,

      // Base questions config (from test track config)
      use_base_questions: trackData?.use_base_questions ?? undefined,
      base_questions_scope: (trackData?.base_questions_scope as 'entire_test' | 'per_section' | null) ?? undefined,
      base_questions_count: trackData?.base_questions_count ?? undefined,
    };
  } catch (err) {
    console.error('Error loading adaptive config:', err);
    return null;
  }
}
