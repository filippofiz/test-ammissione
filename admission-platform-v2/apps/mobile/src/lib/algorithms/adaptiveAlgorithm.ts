/**
 * Adaptive Testing Algorithms (Mobile)
 * Simplified version for React Native
 * Implements both Simple and Complex (CAT with IRT) adaptive testing algorithms
 */

interface Question {
  id: string;
  difficulty?: number;
  section_id?: string;
  discrimination?: number;
  guessing?: number;
  exposure_count?: number;
}

interface ResponsePattern {
  question_id: string;
  is_correct: boolean;
  difficulty?: number;
  discrimination?: number;
  guessing?: number;
}

interface AdaptiveConfig {
  id?: string;
  test_type: string;
  track_type: string;
  algorithm_type: 'simple' | 'complex';
  simple_difficulty_increment?: number;
  irt_model?: '1PL' | '2PL' | '3PL';
  initial_theta?: number;
  theta_min?: number;
  theta_max?: number;
  se_threshold?: number;
  max_information_weight?: number;
  exposure_control?: boolean;
  use_base_questions?: boolean;
  base_questions_scope?: 'entire_test' | 'per_section';
  base_questions_count?: number;
}

interface AdaptiveState {
  current_difficulty?: number;
  theta?: number;
  se?: number;
  response_pattern: ResponsePattern[];
  questions_answered: number;
  base_questions_completed: boolean;
}

export class SimpleAdaptiveAlgorithm {
  private config: AdaptiveConfig;
  private state: AdaptiveState;

  constructor(config: AdaptiveConfig, initialState?: AdaptiveState) {
    this.config = config;
    this.state = initialState || {
      current_difficulty: 3,
      response_pattern: [],
      questions_answered: 0,
      base_questions_completed: false,
    };
  }

  async selectNextQuestion(
    availableQuestions: Question[],
    sectionId?: string
  ): Promise<Question | null> {
    if (availableQuestions.length === 0) return null;

    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed &&
      this.state.questions_answered < (this.config.base_questions_count || 5)
    ) {
      return this.selectBaseQuestion(availableQuestions, sectionId);
    }

    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed &&
      this.state.questions_answered >= (this.config.base_questions_count || 5)
    ) {
      this.state.base_questions_completed = true;
      this.calculateInitialDifficulty();
    }

    const targetDifficulty = this.state.current_difficulty || 3;
    const increment = this.config.simple_difficulty_increment || 1;

    const suitableQuestions = availableQuestions.filter((q) => {
      if (!q.difficulty) return false;
      const diff = Math.abs(q.difficulty - targetDifficulty);
      return diff <= increment;
    });

    if (suitableQuestions.length > 0) {
      suitableQuestions.sort((a, b) => {
        const diffA = Math.abs((a.difficulty || 0) - targetDifficulty);
        const diffB = Math.abs((b.difficulty || 0) - targetDifficulty);
        return diffA - diffB;
      });

      const topN = Math.min(3, suitableQuestions.length);
      const topQuestions = suitableQuestions.slice(0, topN);
      const randomIndex = Math.floor(Math.random() * topQuestions.length);
      return topQuestions[randomIndex];
    }

    const questionsWithDifficulty = availableQuestions.filter((q) => q.difficulty);
    if (questionsWithDifficulty.length > 0) {
      const shuffled = [...questionsWithDifficulty].sort(() => Math.random() - 0.5);
      return shuffled[0];
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }

  private selectBaseQuestion(
    availableQuestions: Question[],
    sectionId?: string
  ): Question {
    const mediumQuestions = availableQuestions.filter((q) => q.difficulty === 3);

    if (mediumQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * mediumQuestions.length);
      return mediumQuestions[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }

  private calculateInitialDifficulty(): void {
    if (this.state.response_pattern.length === 0) {
      this.state.current_difficulty = 3;
      return;
    }

    const correctCount = this.state.response_pattern.filter((r) => r.is_correct).length;
    const totalCount = this.state.response_pattern.length;
    const accuracy = correctCount / totalCount;

    if (accuracy >= 0.8) {
      this.state.current_difficulty = 4;
    } else if (accuracy >= 0.6) {
      this.state.current_difficulty = 3;
    } else if (accuracy >= 0.4) {
      this.state.current_difficulty = 2;
    } else {
      this.state.current_difficulty = 1;
    }
  }

  recordResponse(question: Question, isCorrect: boolean): void {
    this.state.response_pattern.push({
      question_id: question.id,
      is_correct: isCorrect,
      difficulty: question.difficulty,
    });

    this.state.questions_answered++;

    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed
    ) {
      return;
    }

    const increment = this.config.simple_difficulty_increment || 1;

    if (isCorrect) {
      this.state.current_difficulty = Math.min(
        5,
        (this.state.current_difficulty || 3) + increment
      );
    } else {
      this.state.current_difficulty = Math.max(
        1,
        (this.state.current_difficulty || 3) - increment
      );
    }
  }

  getState(): AdaptiveState {
    return this.state;
  }

  shouldTerminate(): boolean {
    return false;
  }
}

export class ComplexAdaptiveAlgorithm {
  private config: AdaptiveConfig;
  private state: AdaptiveState;

  constructor(config: AdaptiveConfig, initialState?: AdaptiveState) {
    this.config = config;
    this.state = initialState || {
      theta: config.initial_theta || 0,
      se: 999,
      response_pattern: [],
      questions_answered: 0,
      base_questions_completed: false,
    };
  }

  async selectNextQuestion(
    availableQuestions: Question[],
    sectionId?: string
  ): Promise<Question | null> {
    if (availableQuestions.length === 0) return null;

    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed &&
      this.state.questions_answered < (this.config.base_questions_count || 5)
    ) {
      return this.selectBaseQuestion(availableQuestions, sectionId);
    }

    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed &&
      this.state.questions_answered >= (this.config.base_questions_count || 5)
    ) {
      this.state.base_questions_completed = true;
      this.estimateTheta();
    }

    const currentTheta = this.state.theta || 0;
    const questionsWithInfo = availableQuestions.map((q) => ({
      question: q,
      information: this.calculateInformation(q, currentTheta),
      exposureRate: this.calculateExposureRate(q),
    }));

    if (this.config.exposure_control) {
      const notOverExposed = questionsWithInfo.filter((q) => q.exposureRate < 0.2);
      if (notOverExposed.length > 0) {
        questionsWithInfo.length = 0;
        questionsWithInfo.push(...notOverExposed);
      }
    }

    questionsWithInfo.sort((a, b) => b.information - a.information);

    const topN = Math.min(5, questionsWithInfo.length);
    const topQuestions = questionsWithInfo.slice(0, topN);

    const totalInfo = topQuestions.reduce((sum, q) => sum + q.information, 0);
    let random = Math.random() * totalInfo;

    for (const item of topQuestions) {
      random -= item.information;
      if (random <= 0) {
        return item.question;
      }
    }

    return questionsWithInfo[0]?.question || availableQuestions[0];
  }

  private selectBaseQuestion(
    availableQuestions: Question[],
    sectionId?: string
  ): Question {
    const mediumDifficultyQuestions = availableQuestions.filter(
      (q) => q.difficulty && q.difficulty >= 2 && q.difficulty <= 4
    );

    if (mediumDifficultyQuestions.length > 0) {
      const shuffled = [...mediumDifficultyQuestions].sort(() => Math.random() - 0.5);
      return shuffled[0];
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }

  private calculateInformation(question: Question, theta: number): number {
    const model = this.config.irt_model || '2PL';
    const b = this.difficultyToB(question.difficulty || 3);
    const a = question.discrimination || 1.0;
    const c = model === '3PL' ? question.guessing || 0.25 : 0;

    const p = this.probabilityCorrect(theta, a, b, c);

    if (model === '1PL') {
      return p * (1 - p);
    } else if (model === '2PL') {
      return a * a * p * (1 - p);
    } else {
      if (p === 0 || p === 1) return 0;
      const numerator = (p - c) / (1 - c);
      return (a * a * numerator * numerator * (1 - p)) / p;
    }
  }

  private probabilityCorrect(
    theta: number,
    a: number,
    b: number,
    c: number
  ): number {
    const exponent = a * (theta - b);
    const p = c + (1 - c) / (1 + Math.exp(-exponent));
    return Math.max(0, Math.min(1, p));
  }

  private difficultyToB(difficulty: number): number {
    return (difficulty - 3) * 0.8;
  }

  private calculateExposureRate(question: Question): number {
    const exposureCount = question.exposure_count || 0;
    const estimatedTotalTests = 1000;
    return exposureCount / Math.max(estimatedTotalTests, 1);
  }

  private estimateTheta(): void {
    if (this.state.response_pattern.length === 0) {
      this.state.theta = this.config.initial_theta || 0;
      return;
    }

    const model = this.config.irt_model || '2PL';
    let theta = this.state.theta || 0;
    const maxIterations = 20;
    const convergence = 0.001;

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
          const u = response.is_correct ? 1 : 0;
          const numerator = p - c;
          const denominator = 1 - c;
          firstDerivative += (a * (u - p) * numerator) / (denominator * p * q);
          secondDerivative -=
            (a * a * numerator * numerator) / (denominator * denominator * p * q);
        }
      }

      if (Math.abs(secondDerivative) < 0.0001) break;
      const delta = firstDerivative / secondDerivative;
      theta -= delta;

      const thetaMin = this.config.theta_min || -4;
      const thetaMax = this.config.theta_max || 4;
      theta = Math.max(thetaMin, Math.min(thetaMax, theta));

      if (Math.abs(delta) < convergence) break;
    }

    this.state.theta = theta;
    this.calculateStandardError();
  }

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

  recordResponse(question: Question, isCorrect: boolean): void {
    this.state.response_pattern.push({
      question_id: question.id,
      is_correct: isCorrect,
      difficulty: question.difficulty,
      discrimination: question.discrimination,
      guessing: question.guessing,
    });

    this.state.questions_answered++;

    if (
      this.config.use_base_questions &&
      !this.state.base_questions_completed
    ) {
      return;
    }

    this.estimateTheta();
  }

  shouldTerminate(): boolean {
    const seThreshold = this.config.se_threshold || 0.3;
    return (this.state.se || 999) <= seThreshold;
  }

  getState(): AdaptiveState {
    return this.state;
  }

  getFinalTheta(): number {
    return this.state.theta || 0;
  }

  getFinalSE(): number {
    return this.state.se || 999;
  }
}

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
