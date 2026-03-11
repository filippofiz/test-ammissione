/**
 * Shared type definitions for the test-taking system.
 * Extracted from TakeTestPage.tsx — used by the page, hooks, and components.
 */

export interface TestConfig {
  test_type: string;
  track_type: string;
  section_order_mode: 'mandatory' | 'user_choice' | 'no_sections' | 'mandatory_macro_sections' | 'user_choice_macro_sections' | string;
  section_order: string[] | null;
  time_per_section: Record<string, number> | null;
  total_time_minutes: number | null;
  navigation_mode: 'forward_only' | 'back_forward';
  navigation_between_sections?: 'forward_only' | 'back_forward';
  can_leave_blank: boolean | null;
  pause_mode: 'no_pause' | 'between_sections' | 'user_choice';
  pause_sections: string[] | null;
  pause_duration_minutes: number;
  max_pauses?: number;
  test_start_message?: string; // English message
  messaggio_iniziale_test?: string; // Italian message

  // Calculator configuration
  calculator_type?: 'none' | 'regular' | 'graphing' | 'scientific';

  // Algorithm configuration
  question_order?: 'random' | 'sequential';
  adaptivity_mode?: 'adaptive' | 'non_adaptive' | 'static';
  use_base_questions?: boolean;
  base_questions_scope?: 'per_section' | 'entire_test';
  base_questions_count?: number;
  algorithm_type?: 'simple' | 'complex';
  baseline_difficulty?: number | string;

  // Question limits
  questions_per_section?: Record<string, number>;
  total_questions?: number;

  // Section adaptivity
  section_adaptivity_config?: Record<string, { type: 'base' | 'adaptive'; difficulty?: string }>;

  // Review & Edit feature (GMAT-style)
  allow_review_at_end?: boolean;
  allow_bookmarks?: boolean;
  max_answer_changes?: number;
  max_questions_to_review?: number | null;

  // Algorithm reference
  algorithm_id?: string;

  // Display configuration
  questions_per_page?: number;
}

export interface Question {
  id: string;
  test_type: string;
  section: string;
  macro_section?: string;
  question_number: number;
  question_type: string;
  difficulty: string;
  is_base?: boolean;

  question_data: {
    // Data Insights fields
    di_type?: 'DS' | 'MSR' | 'TPA' | 'GI' | 'TA';

    // DS (Data Sufficiency)
    problem?: string;
    statement1?: string;
    statement2?: string;

    // MSR (Multi-Source Reasoning)
    sources?: Array<{
      content?: string;
      tab_name: string;
      content_type: 'text' | 'table';
      table_data?: string[][];
      table_headers?: string[];
    }>;
    questions?: Array<{
      text: string;
      options: Record<string, string>;
      question_type: string;
      correct_answer: string;
    }>;

    // GI (Graphical Interpretation)
    chart_config?: Record<string, unknown>;
    context_text?: string;
    blank1_options?: string[];
    blank2_options?: string[];
    statement_text?: string;

    // TA (Table Analysis)
    table_data?: string[][];
    table_title?: string;
    column_headers?: string[];
    stimulus_text?: string;
    answer_col1_title?: string;
    answer_col2_title?: string;
    statements?: Array<{
      text: string;
      is_true: boolean;
    }>;

    // TPA (Two-Part Analysis)
    scenario?: string;
    column1_title?: string;
    column2_title?: string;
    shared_options?: string[];

    // Common fields
    image_url?: string | null;
    image_url_eng?: string | null;
    image_options?: Record<string, string>;
    image_options_eng?: Record<string, string>;
    question?: string;
    passage?: string;
    question_text?: string;
    question_text_eng?: string;
    options?: Record<string, string>;
    options_eng?: Record<string, string>;
    passage_text?: string;
    passage_text_eng?: string;
    passage_title?: string;
    passage_title_eng?: string;

    // Answer choices (for multiple choice)
    choices?: Array<{
      label: string;
      text: string;
    }>;

    // PDF-based test fields
    pdf_url?: string;
    page_number?: number;
  };

  answers: {
    correct_answer: string[];
    wrong_answers: string[];
  };

  // Legacy fields (for backwards compatibility)
  question_text?: string;
  answer_a?: string | null;
  answer_b?: string | null;
  answer_c?: string | null;
  answer_d?: string | null;
  answer_e?: string | null;
  correct_answer?: string;
  topic?: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | null;
  timeSpent: number;
  flagged: boolean;
  // For GMAT Data Insights questions
  msrAnswers?: string[];
  blank1?: string;
  blank2?: string;
  taAnswers?: Record<number, 'true' | 'false'>;
  column1?: string;
  column2?: string;
}

// JSONB answer format for database storage
export type JsonbAnswer =
  | { answers: string[] } // MSR
  | { answers: { part1: string | null; part2: string | null } } // GI or TPA
  | { answers: Record<number, 'true' | 'false'> } // TA
  | { answer: string | null }; // Simple questions

// Attempt data stored in completion_details
export interface AttemptData {
  attempt_number: number;
  status: string;
  reason: string;
  annulment_reason?: string | null;
  started_at: string;
  completed_at: string;
  browser_info: string;
  screen_resolution: string;
  timestamp: string;
  pause_events?: Array<{
    timestamp: string;
    section: string;
    action: 'pause_taken' | 'pause_skipped' | 'pause_auto_skipped';
  }>;
  pauses_used?: number;
  test_config?: Record<string, unknown>;
  sections_completed?: string[];
  section_times?: Record<string, number>;
  total_questions?: number;
  questions_answered?: number;
  device_diagnostics?: {
    connection_latency_ms: number | null;
    connection_status: 'good' | 'warning' | 'error';
    performance_benchmark_ms: number | null;
    performance_status: 'good' | 'warning' | 'error';
    overall_status: 'ready' | 'warning' | 'error';
    tested_at: string;
  };
  gmat_scoring?: {
    section_thetas: Record<string, { theta: number; se: number }>;
    algorithm_version: string;
  };
  [key: string]: unknown; // Allow additional properties
}

// Test info nested in assignment
export interface TestInfo {
  id: string;
  test_type: string;
  exercise_type: string;
  format: string;
  test_number?: number;
  section?: string;
  materia?: string;
}

// Algorithm configuration from database
export interface AlgorithmConfig {
  id: string;
  algorithm_type: 'simple' | 'complex';
  simple_difficulty_increment?: number;
  irt_model?: '1PL' | '2PL' | '3PL';
  initial_theta?: number;
  theta_min?: number;
  theta_max?: number;
  se_threshold?: number;
  max_information_weight?: number;
  exposure_control?: boolean;
  [key: string]: unknown;
}

// Test assignment from database
export interface TestAssignment {
  id: string;
  student_id: string;
  status: 'unlocked' | 'in_progress' | 'completed' | 'locked' | 'incomplete' | 'annulled';
  start_time: string | null;
  current_attempt: number;
  total_attempts: number;
  completion_details: {
    attempts: AttemptData[];
  } | null;
  '2V_tests'?: TestInfo;
  '2V_tests_test'?: TestInfo;
  [key: string]: unknown;
}

// Student answer from database
export interface DbStudentAnswer {
  question_id: string;
  answer: JsonbAnswer;
  is_flagged: boolean;
  time_spent_seconds: number;
  question_order: number;
  attempt_number: number;
}
