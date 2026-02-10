/**
 * Unified result display components and hooks.
 *
 * Used by UnifiedResultsPage for both regular tests and GMAT assessments.
 */

// Types
export type {
  ResultQuestion,
  UnifiedQuestionResult,
  DifficultyBreakdownData,
  ScaledScoreData,
  AttemptComparisonData,
  UnifiedResultData,
} from './types';
export {
  getSectionFullName,
  getQuestionCategory,
  getAssessmentTypeLabel,
  formatTopicName,
} from './types';

// Components
export { ScoreSummary } from './ScoreSummary';
export { DifficultyBreakdown } from './DifficultyBreakdown';
export { TimeReport } from './TimeReport';
export { ResultsFilterBar } from './ResultsFilterBar';
export { QuestionResultCard } from './QuestionResultCard';

// Data hooks
export { useGmatResults } from './useGmatResults';
export { useRegularTestResults } from './useRegularTestResults';
