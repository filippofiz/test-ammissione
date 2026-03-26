/**
 * Shared types for the unified results system.
 *
 * Both GMAT results (from 2V_gmat_assessment_results) and regular test results
 * (from 2V_test_assignments + 2V_student_answers) are normalized into these
 * common types before being rendered by shared components.
 */

/**
 * Question data as needed by result display components.
 * Superset of fields from both GMAT and regular test question schemas.
 */
export interface ResultQuestion {
  id: string;
  section: string;
  difficulty?: string;
  question_type: string;
  question_data: any;
  answers: any;
  // GMAT-specific
  topic?: string;
  // Regular-test-specific
  materia?: string;
  question_text?: string;
  question_number?: number;
  correct_answer?: any;
  options?: any;
  image_url?: string;
  // Tutor review info (from joined Questions_toReview)
  Questions_toReview?: {
    needs_review: boolean;
    notes: string;
    flagged_by: string;
    flagged_at: string;
  } | null;
}

/**
 * A single question's result in the unified format.
 */
export interface UnifiedQuestionResult {
  questionId: string;
  question: ResultQuestion;
  /** Display order (1-based) */
  order: number;
  /** Whether the student answered correctly */
  isCorrect: boolean;
  /** Whether the student provided an answer (false = unanswered/skipped) */
  hasAnswer: boolean;
  /** Time spent in seconds */
  timeSpentSeconds?: number;
  /** Whether the student bookmarked this question (GMAT) */
  isBookmarked?: boolean;
  /** Whether the student flagged this question during the test (regular tests) */
  isFlagged?: boolean;
  /** The student's answer in its original format */
  studentAnswer?: any;
  // Tutor scoring (regular tests only)
  autoScore?: number | null;
  tutorScore?: number | null;
  tutorFeedback?: string | null;
  // Question review state (regular tests, tutor view)
  reviewState?: {
    needs_review: boolean;
    notes: string;
  } | null;
}

/**
 * Difficulty breakdown by level.
 */
export interface DifficultyBreakdownData {
  easy?: { correct: number; total: number; unanswered?: number };
  medium?: { correct: number; total: number; unanswered?: number };
  hard?: { correct: number; total: number; unanswered?: number };
}

/**
 * Scaled score data for algorithm-based scoring (Bocconi raw_score, IRT, etc.)
 */
export interface ScaledScoreData {
  totalScore: number;
  displayName: string;
  scoringMethod: 'raw_score' | 'irt' | string;
  sectionScores?: Record<string, number>;
  /** Detailed breakdown for raw_score method (Bocconi) */
  rawScoreDetails?: {
    correct: number;
    correctPoints: number;
    wrong: number;
    wrongPoints: number;
    blank: number;
    blankPoints: number;
    totalRawScore: number;
    totalQuestions: number;
    scaledTo50: number;
    penaltyBreakdown?: Array<{
      optionCount: number;
      count: number;
      totalPenalty: number;
      penaltyPerQuestion: number;
    }>;
  };
}

/**
 * Attempt comparison data for multi-attempt tests.
 */
export interface AttemptComparisonData {
  attemptNumber: number;
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  score: number;
  totalTime: number;
  avgTimePerQuestion: number;
  sectionStats: Record<string, { correct: number; total: number; time: number }>;
}

/**
 * The unified result data shape that all result display components consume.
 * Both GMAT and regular test data loaders normalize into this format.
 */
export interface UnifiedResultData {
  /** Data source identifier */
  source: 'gmat' | 'regular';
  /** Source record ID (assessmentId or assignmentId) */
  sourceId: string;

  // Header
  title: string;
  subtitle: string;
  completedAt?: string;
  studentName?: string;

  // Scores
  scoreRaw: number;
  scoreTotal: number;
  scorePercentage: number;

  // Time
  totalTimeSeconds?: number;

  // Questions
  questions: UnifiedQuestionResult[];
  /** Unique sections found in questions */
  sections: string[];

  // GMAT-specific
  estimatedGmatScore?: number;
  /** Per-section GMAT scores (60-90) keyed by full section name */
  gmatSectionScores?: Record<string, number>;
  /** GMAT total score percentile (0-100) */
  gmatPercentile?: number;
  /** GMAT score band label */
  gmatScoreBand?: string;
  difficultyBreakdown?: DifficultyBreakdownData | null;
  /** GMAT assessment type: placement, training, section_assessment, mock */
  assessmentType?: string;
  /** GMAT section: QR, DI, VR */
  gmatSection?: string;
  /** Topic name for training/topic assessments */
  topicName?: string;

  // Regular-test-specific
  algorithmConfig?: any;
  /** Raw track config row from 2V_test_track_config (time_per_section, questions_per_section, etc.) */
  trackConfig?: any;
  scaledScores?: ScaledScoreData | null;
  totalAttempts?: number;
  currentAttempt?: number;
  attemptsWithAnswers?: Set<number>;
  attemptComparison?: AttemptComparisonData[];
  resultsViewable?: boolean;
  isStudentView?: boolean;
  /** Full assignment record for features that need raw data */
  assignment?: any;
}

/**
 * A comparison indicator showing how a second student answered a specific question.
 * Passed down to QuestionResultCard for rich per-question comparison display.
 */
export interface ComparisonIndicator {
  studentName: string | null;
  isCorrect: boolean;
  hasAnswer: boolean;
  /** Raw stored answer value (any format — passed through toRendererAnswer for display) */
  studentAnswer: any;
  timeSpentSeconds?: number;
}

/**
 * Lightweight result summary for a comparison student.
 * Loaded on-demand when a tutor adds a student to the comparison panel.
 */
export interface ComparisonStudentResult {
  sourceId: string;
  studentName: string | null;
  completedAt: string | null;
  scoreRaw: number;
  scoreTotal: number;
  scorePercentage: number;
  /** Map from questionId → correctness state + raw answer + time */
  questionResults: Map<string, { isCorrect: boolean; hasAnswer: boolean; studentAnswer: any; timeSpentSeconds?: number }>;
}

/**
 * A student available to be added to the comparison panel.
 */
export interface AvailableComparisonStudent {
  sourceId: string;
  studentName: string | null;
  completedAt: string | null;
  alreadyAdded: boolean;
}

/**
 * Helper: Get a human-readable section name.
 */
export function getSectionFullName(section: string): string {
  const sectionNames: Record<string, string> = {
    QR: 'Quantitative Reasoning',
    DI: 'Data Insights',
    VR: 'Verbal Reasoning',
  };
  return sectionNames[section] || section;
}

/**
 * Helper: Extract question category from question_data.
 * Returns the DI type, subtype, or categories for display.
 */
export function getQuestionCategory(questionData: any): string | null {
  if (!questionData) return null;

  // DI type label
  const diType = questionData.di_type;
  if (diType) {
    const diLabels: Record<string, string> = {
      DS: 'Data Sufficiency',
      MSR: 'Multi-Source Reasoning',
      GI: 'Graphics Interpretation',
      TA: 'Table Analysis',
      TPA: 'Two-Part Analysis',
    };
    return diLabels[diType] || diType;
  }

  // Question subtype
  if (questionData.questionSubtype) return questionData.questionSubtype;

  // Categories array
  if (questionData.categories && Array.isArray(questionData.categories)) {
    return questionData.categories.join(' \u2022 ');
  }

  return null;
}

/**
 * Helper: Get assessment type label for GMAT results.
 */
export function getAssessmentTypeLabel(type: string): string {
  switch (type) {
    case 'placement': return 'Initial Assessment';
    case 'topic_assessment': return 'Topic Assessment';
    case 'section_assessment': return 'Section Assessment';
    case 'mock': return 'Mock Simulation';
    case 'training': return 'Training';
    default: return type;
  }
}

/**
 * Helper: Format topic name from slug (e.g., "01-data-sufficiency" → "Data Sufficiency").
 */
export function formatTopicName(topic: string): string {
  return topic
    .replace(/^\d+-/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
