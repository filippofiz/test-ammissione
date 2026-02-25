// ============================================
// DATABASE-COMPATIBLE GMAT QUESTION TYPES
// ============================================
// These types match the 2V_questions table structure

// ============================================
// COMMON / SHARED TYPES
// ============================================

// Standard multiple choice options (a-e)
export type MCOptions = {
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
};

// Data Sufficiency options (A-E with fixed meanings)
export type DSOptions = {
  A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.";
  B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.";
  C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.";
  D: "EACH statement ALONE is sufficient.";
  E: "Statements (1) and (2) TOGETHER are NOT sufficient.";
};

export type DSAnswer = "A" | "B" | "C" | "D" | "E";
export type MCAnswer = "a" | "b" | "c" | "d" | "e";

// Answers field format for the database
// correct_answer can be:
// - string: for single MC answer (e.g., "e")
// - string[]: for DI answers (e.g., ["B"] for DS, ["28.6%", "inverse correlation"] for GI)
// - object[]: for TA/TPA answers (e.g., [{"stmt0": "col1", "stmt1": "col2"}])
export interface AnswersField {
  wrong_answers: string[];
  correct_answer: string | (string | Record<string, string>)[];
}

// Difficulty levels
export type DifficultyString = "easy" | "medium" | "hard";
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// Section types
export type GMATSection = "Quantitative Reasoning" | "Verbal Reasoning" | "Data Insights";

// Question type in database
export type QuestionType = "multiple_choice" | "data_insights";

// Data Insights subtypes
export type DIType = "DS" | "GI" | "TA" | "TPA" | "MSR";

// ============================================
// BASE QUESTION INTERFACE (matches DB row)
// ============================================

export interface BaseQuestionRow {
  id: string;
  test_id?: string;
  test_type: "GMAT";
  question_number: number;
  question_type: QuestionType;
  section: GMATSection;
  materia?: string | null;
  difficulty?: DifficultyString | null;
  difficulty_level?: DifficultyLevel | null;
  question_data: string; // JSON stringified - will be parsed based on question type
  answers: string; // JSON stringified AnswersField
  is_active: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  irt_difficulty?: number | null;
  irt_discrimination?: number | null;
  irt_guessing?: number | null;
  conversion_info?: string | null; // JSON stringified
  duplicate_question_ids?: string; // JSON stringified array
  macro_section?: string | null;
}

// ============================================
// QUANTITATIVE REASONING QUESTION DATA
// ============================================

export interface QRQuestionData {
  question_text: string;
  options: MCOptions;
  image_url?: string | null;
  image_options?: Record<string, string> | null;
  // Table support (for questions with tabular data)
  table_title?: string;
  column_headers?: string[];
  table_data?: string[][];
  // Chart support (for questions with graphs/charts)
  chart_config?: ChartConfig;
  // Context text for complex multi-part questions
  context_text?: string;
}

// Full QR question for use in code (parsed)
export interface QuantitativeReasoningQuestion {
  id: string;
  question_number: number;
  section: "Quantitative Reasoning";
  difficulty?: DifficultyString | null;
  difficultyLevel?: DifficultyLevel | null;
  questionData: QRQuestionData;
  answers: AnswersField;
  categories?: string[];
  explanation?: string;
}

// ============================================
// VERBAL REASONING QUESTION DATA
// ============================================

export interface VRQuestionData {
  question_text: string;
  options: MCOptions;
  image_url?: string | null;
  image_options?: Record<string, string> | null;
  // Optional: for Reading Comprehension questions that share a passage
  passage_id?: string;
  passage_text?: string;
  // Optional: character offsets where each printed line starts in passage_text.
  // Key is the 1-based line number (as a string for JSON compatibility),
  // value is the 0-based character index into passage_text.
  // Populated from extract_rc_line_offsets.py output after manual verification.
  passage_line_offsets?: Record<string, number>;
}

// Full VR question for use in code (parsed)
export interface VerbalReasoningQuestion {
  id: string;
  question_number: number;
  section: "Verbal Reasoning";
  difficulty?: DifficultyString | null;
  difficultyLevel?: DifficultyLevel | null;
  questionData: VRQuestionData;
  answers: AnswersField;
  categories?: string[];
  explanation?: string;
  // For categorization
  questionSubtype?: "reading-comprehension" | "critical-reasoning";
}

// ============================================
// DATA INSIGHTS QUESTION DATA TYPES
// ============================================

// --- Data Sufficiency (DS) ---
export interface DSQuestionData {
  di_type: "DS";
  problem: string;
  statement1: string;
  statement2: string;
  image_url?: string | null;
  chart_config?: ChartConfig; // For questions with graphs/charts
  table_title?: string; // For questions with tables
  column_headers?: string[]; // For questions with tables
  table_data?: string[][]; // For questions with tables
  answer_choices: DSOptions;
  correct_answer: DSAnswer;
  explanation?: string;
}

// --- Graphics Interpretation (GI) ---
export interface ChartDataset {
  label: string;
  data: number[] | Array<{ x: number; y: number }>;
  color: string;
}

export interface ChartConfig {
  type: "bar" | "line" | "scatter" | "pie";
  title: string;
  labels?: string[];
  datasets: ChartDataset[];
  x_axis_label?: string;
  y_axis_label?: string;
}

export interface GIQuestionData {
  di_type: "GI";
  chart_config: ChartConfig;
  context_text: string;
  statement_text: string; // Contains [BLANK1], [BLANK2] placeholders
  blank1_options: string[];
  blank1_correct: string;
  blank2_options: string[];
  blank2_correct: string;
}

// --- Table Analysis (TA) ---
export interface TAStatement {
  text: string;
  is_true: boolean;
}

export interface TAQuestionData {
  di_type: "TA";
  table_title: string;
  column_headers: string[];
  table_data: string[][]; // 2D array of strings
  stimulus_text?: string;
  statements: TAStatement[];
  correct_answer: Record<string, "col1" | "col2">; // e.g., {"stmt0": "col1", "stmt1": "col2"}
  answer_col1_title: string; // e.g., "True", "Correct", "Supported"
  answer_col2_title: string; // e.g., "False", "Incorrect", "Not Supported"
  statement_column_title: string; // e.g., "Statement"
}

// --- Two-Part Analysis (TPA) ---
export interface TPAQuestionData {
  di_type: "TPA";
  scenario: string;
  column1_title: string;
  column2_title: string;
  shared_options: string[];
  correct_answers: {
    col1: string;
    col2: string;
  };
  statement_title: string;
}

// --- Multi-Source Reasoning (MSR) ---
export interface MSRSourceText {
  tab_name: string;
  content_type: "text";
  content: string;
}

export interface MSRSourceTable {
  tab_name: string;
  content_type: "table";
  table_headers: string[];
  table_data: string[][];
}

export type MSRSource = MSRSourceText | MSRSourceTable;

export interface MSRSubQuestion {
  text: string;
  options: Record<string, string>; // Can be {a, b, c, d, e} or other formats
  question_type: "multiple_choice";
  correct_answer: string;
}

export interface MSRQuestionData {
  di_type: "MSR";
  sources: MSRSource[];
  questions: MSRSubQuestion[];
}

// Union type for all DI question data
export type DIQuestionData =
  | DSQuestionData
  | GIQuestionData
  | TAQuestionData
  | TPAQuestionData
  | MSRQuestionData;

// Full DI question for use in code (parsed)
export interface DataInsightsQuestion {
  id: string;
  question_number: number;
  section: "Data Insights";
  difficulty?: DifficultyString | null;
  difficultyLevel?: DifficultyLevel | null;
  questionData: DIQuestionData;
  answers: AnswersField;
  categories?: string[];
}

// ============================================
// UNION TYPES
// ============================================

export type GMATQuestion =
  | QuantitativeReasoningQuestion
  | VerbalReasoningQuestion
  | DataInsightsQuestion;

export type QuestionData = QRQuestionData | VRQuestionData | DIQuestionData;

// ============================================
// HELPER FUNCTIONS FOR DATABASE CONVERSION
// ============================================

/**
 * Converts a parsed question to database row format
 * Includes explanation in question_data JSONB for display in TestResultsPage
 */
export function toDBRow(question: GMATQuestion): Omit<BaseQuestionRow, "id" | "created_at" | "updated_at"> {
  const questionType: QuestionType =
    question.section === "Data Insights" ? "data_insights" : "multiple_choice";

  // Extract explanation from question (QR/VR) or from questionData (DS)
  let explanation: string | null = null;
  if ("explanation" in question && question.explanation) {
    explanation = question.explanation;
  } else if ("questionData" in question && "explanation" in question.questionData) {
    explanation = (question.questionData as { explanation?: string }).explanation ?? null;
  }

  // Include explanation and categories inside question_data JSONB
  const categories = "categories" in question ? question.categories : undefined;
  const questionDataWithExplanation = {
    ...question.questionData,
    categories: categories ?? null,
    explanation: explanation,
  };

  return {
    test_type: "GMAT",
    question_number: question.question_number,
    question_type: questionType,
    section: question.section,
    materia: null,
    difficulty: question.difficulty ?? null,
    difficulty_level: question.difficultyLevel ?? null,
    question_data: JSON.stringify(questionDataWithExplanation),
    answers: JSON.stringify(question.answers),
    is_active: true,
    duplicate_question_ids: "[]",
  };
}

/**
 * Generates the answers field for multiple choice questions
 */
export function generateMCAnswers(correctAnswer: MCAnswer): AnswersField {
  const allOptions: MCAnswer[] = ["a", "b", "c", "d", "e"];
  return {
    wrong_answers: allOptions.filter((opt) => opt !== correctAnswer),
    correct_answer: correctAnswer,
  };
}

/**
 * Generates the answers field for Data Sufficiency questions
 */
export function generateDSAnswers(correctAnswer: DSAnswer): AnswersField {
  return {
    wrong_answers: [],
    correct_answer: [correctAnswer],
  };
}

/**
 * Generates the answers field for Graphics Interpretation questions
 */
export function generateGIAnswers(blank1Correct: string, blank2Correct: string): AnswersField {
  return {
    wrong_answers: [],
    correct_answer: [blank1Correct, blank2Correct],
  };
}

/**
 * Generates the answers field for Table Analysis questions
 */
export function generateTAAnswers(correctAnswer: Record<string, "col1" | "col2">): AnswersField {
  return {
    wrong_answers: [],
    correct_answer: [correctAnswer],
  };
}

/**
 * Generates the answers field for Two-Part Analysis questions
 */
export function generateTPAAnswers(col1Answer: string, col2Answer: string): AnswersField {
  return {
    wrong_answers: [],
    correct_answer: [{ col1: col1Answer, col2: col2Answer }],
  };
}

/**
 * Generates the answers field for Multi-Source Reasoning questions
 */
export function generateMSRAnswers(correctAnswers: string[]): AnswersField {
  return {
    wrong_answers: [],
    correct_answer: correctAnswers,
  };
}

/**
 * Type guard to check if question data is Data Sufficiency
 */
export function isDS(data: DIQuestionData): data is DSQuestionData {
  return data.di_type === "DS";
}

/**
 * Type guard to check if question data is Graphics Interpretation
 */
export function isGI(data: DIQuestionData): data is GIQuestionData {
  return data.di_type === "GI";
}

/**
 * Type guard to check if question data is Table Analysis
 */
export function isTA(data: DIQuestionData): data is TAQuestionData {
  return data.di_type === "TA";
}

/**
 * Type guard to check if question data is Two-Part Analysis
 */
export function isTPA(data: DIQuestionData): data is TPAQuestionData {
  return data.di_type === "TPA";
}

/**
 * Type guard to check if question data is Multi-Source Reasoning
 */
export function isMSR(data: DIQuestionData): data is MSRQuestionData {
  return data.di_type === "MSR";
}
