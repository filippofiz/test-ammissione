// Validation flag types
export type ValidationFlag =
  | 'ai_verified_correct'
  | 'technical_malformed_json'
  | 'technical_missing_image'
  | 'technical_missing_fields'
  | 'technical_invalid_latex'
  | 'incorrect_answer'
  | 'no_correct_answer'
  | 'multiple_correct_answers'
  | 'unclear_question'
  | 'missing_information'
  | 'typo_detected'
  | 'formatting_issue'
  | 'translation_mismatch'
  | 'options_not_distinct';

export type ValidationSeverity = 'success' | 'low' | 'medium' | 'high' | 'critical';

export interface ValidationComment {
  flag: ValidationFlag;
  severity: ValidationSeverity;
  message: string;
}

export interface TechnicalValidation {
  passed: boolean;
  issues: string[];
}

export interface AISolution {
  answer: string | null;
  reasoning: string;
  confidence: number;
}

export interface AnswerVerification {
  matches_stored: boolean;
  final_verdict: 'correct' | 'stored_answer_wrong' | 'ai_answer_wrong' | 'both_wrong' | 'inconclusive';
  correct_should_be: string | null;
  explanation: string;
}

export interface QualityChecks {
  clarity_score: number;
  issues: string[];
}

export interface ValidationStatistics {
  immediate_match: boolean;
  needed_deep_verification: boolean;
  needed_re_verification: boolean;
  re_verification_changed_verdict: boolean;
  initial_verdict?: string;
  final_verdict?: string;
}

export interface AIValidationResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  validated_at: string;
  total_checks: number;
  checks_passed: number;
  flags: ValidationFlag[];
  technical_validation: TechnicalValidation;
  ai_solution?: AISolution;
  answer_verification?: AnswerVerification;
  quality_checks?: QualityChecks;
  comments: ValidationComment[];
  statistics?: ValidationStatistics;
}

export interface Question {
  id: string;
  test_id: string;
  test_type: string;
  question_number: number;
  question_type: string;
  question_data: any;
  answers: any;
  ai_validation?: AIValidationResult;
}

// Flag severity mapping
export const FLAG_SEVERITY: Record<ValidationFlag, ValidationSeverity> = {
  ai_verified_correct: 'success',
  // CRITICAL - blocks question from being usable
  technical_malformed_json: 'critical',
  technical_missing_image: 'critical',
  technical_missing_fields: 'critical',
  incorrect_answer: 'critical',
  no_correct_answer: 'critical',
  // HIGH - needs review before use
  technical_invalid_latex: 'high',
  translation_mismatch: 'high',
  unclear_question: 'high',
  missing_information: 'high',
  // MEDIUM - should be reviewed but usable
  multiple_correct_answers: 'medium',
  // LOW - suggestions for improvement
  typo_detected: 'low',
  formatting_issue: 'low',
  options_not_distinct: 'low',
};
