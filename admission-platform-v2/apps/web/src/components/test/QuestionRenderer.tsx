/**
 * QuestionRenderer Component
 *
 * Universal question type router that renders the appropriate question component
 * based on question type (DS, MSR, GI, TA, TPA, multiple_choice, open_ended).
 *
 * This component abstracts away the complexity of determining which question
 * component to use and handles answer format conversions.
 */

import { useTranslation } from 'react-i18next';
import { MathJaxRenderer } from '../MathJaxRenderer';
import { DSQuestion } from '../questions/DSQuestion';
import { MSRQuestion } from '../questions/MSRQuestion';
import { GIQuestion } from '../questions/GIQuestion';
import { TAQuestion } from '../questions/TAQuestion';
import { TPAQuestion } from '../questions/TPAQuestion';
import { MultipleChoiceQuestion } from '../questions/MultipleChoiceQuestion';
import { QuestionImage } from './QuestionImage';

/**
 * Question data structure from database
 */
export interface QuestionData {
  // Data Insights type identifier
  di_type?: 'DS' | 'MSR' | 'GI' | 'TA' | 'TPA';

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
  passage_line_offsets?: Record<string, number>;

  // Answer choices (for multiple choice)
  choices?: Array<{
    label: string;
    text: string;
  }>;
}

/**
 * Full question structure
 */
export interface Question {
  id: string;
  question_number?: number;
  question_type: string;
  section?: string;
  difficulty?: string | null;
  question_data: QuestionData;
  answers: {
    correct_answer: string | string[] | Record<string, unknown>;
    wrong_answers?: string[];
  } | string;
}

/**
 * Unified answer structure that can hold any question type's answer
 */
export interface UnifiedAnswer {
  // Simple answer (DS, multiple choice)
  answer?: string;
  // MSR answers (array of answers for sub-questions)
  msrAnswers?: string[];
  // GI answers (two blanks)
  blank1?: string;
  blank2?: string;
  // TA answers (true/false for each statement)
  taAnswers?: Record<number, 'true' | 'false'>;
  // TPA answers (two columns)
  column1?: string;
  column2?: string;
}

export interface QuestionRendererProps {
  /** The question to render */
  question: Question;
  /** Current answer(s) for this question */
  currentAnswer?: UnifiedAnswer;
  /** Callback when answer changes */
  onAnswerChange: (questionId: string, answer: UnifiedAnswer) => void;
  /** Current language for localization */
  language?: 'it' | 'en';
  /** Show results mode (displays correct/incorrect feedback) */
  showResults?: boolean;
  /** Read-only mode (disables all inputs) */
  readOnly?: boolean;
  /** Explanation text to show (for results view) */
  explanation?: string;
  /** Hide question text (for multi-question view where text is shown separately) */
  hideQuestionText?: boolean;
}

/**
 * Parse answers field which might be string or object
 */
function parseAnswers(answers: Question['answers']): { correct_answer: unknown } {
  if (typeof answers === 'string') {
    try {
      return JSON.parse(answers);
    } catch {
      return { correct_answer: answers };
    }
  }
  return answers as { correct_answer: unknown };
}

/**
 * Get localized text based on language preference
 */
function getLocalizedText(
  data: QuestionData,
  field: 'question_text' | 'passage_text' | 'passage_title',
  language: 'it' | 'en'
): string {
  const engField = `${field}_eng` as keyof QuestionData;

  if (language === 'en') {
    return (data[engField] as string) || (data[field] as string) || '';
  }
  return (data[field] as string) || (data[engField] as string) || '';
}

/**
 * Get localized options based on language preference
 */
function getLocalizedOptions(
  data: QuestionData,
  language: 'it' | 'en'
): Record<string, string> {
  if (language === 'en') {
    return data.options_eng || data.options || {};
  }
  return data.options || data.options_eng || {};
}

/**
 * Get localized image URL based on language preference
 */
function getLocalizedImage(
  data: QuestionData,
  language: 'it' | 'en'
): string | undefined {
  if (language === 'en') {
    return data.image_url_eng || data.image_url || undefined;
  }
  return data.image_url || data.image_url_eng || undefined;
}

/**
 * Get localized image options based on language preference
 */
function getLocalizedImageOptions(
  data: QuestionData,
  language: 'it' | 'en'
): Record<string, string> | undefined {
  if (language === 'en') {
    return data.image_options_eng || data.image_options;
  }
  return data.image_options || data.image_options_eng;
}

export function QuestionRenderer({
  question,
  currentAnswer = {},
  onAnswerChange,
  language = 'it',
  showResults = false,
  readOnly = false,
  explanation,
  hideQuestionText = false,
}: QuestionRendererProps) {
  const { t } = useTranslation();

  // Parse question data if it's a string
  const questionData: QuestionData =
    typeof question.question_data === 'string'
      ? JSON.parse(question.question_data)
      : question.question_data;

  // Parse answers for correct answer extraction
  const answersData = parseAnswers(question.answers);
  const correctAnswerData = answersData.correct_answer;

  // Helper to create answer update
  const updateAnswer = (partialAnswer: Partial<UnifiedAnswer>) => {
    onAnswerChange(question.id, { ...currentAnswer, ...partialAnswer });
  };

  // DS (Data Sufficiency)
  if (questionData.di_type === 'DS') {
    const correctDSAnswer = Array.isArray(correctAnswerData)
      ? (correctAnswerData as string[])[0]
      : (correctAnswerData as string);

    return (
      <DSQuestion
        problem={questionData.problem || ''}
        statement1={questionData.statement1 || ''}
        statement2={questionData.statement2 || ''}
        selectedAnswer={currentAnswer.answer}
        onAnswerChange={(answer) => updateAnswer({ answer })}
        correctAnswer={correctDSAnswer}
        showResults={showResults}
        readOnly={readOnly}
        explanation={explanation}
      />
    );
  }

  // MSR (Multi-Source Reasoning)
  if (questionData.di_type === 'MSR') {
    const correctMSRAnswers = Array.isArray(correctAnswerData)
      ? (correctAnswerData as string[])
      : [];

    return (
      <MSRQuestion
        sources={questionData.sources || []}
        questions={questionData.questions || []}
        selectedAnswers={currentAnswer.msrAnswers || []}
        onAnswerChange={(qIndex, answer) => {
          const newMSRAnswers = [...(currentAnswer.msrAnswers || [])];
          newMSRAnswers[qIndex] = answer;
          updateAnswer({
            msrAnswers: newMSRAnswers,
            answer: newMSRAnswers.join(','),
          });
        }}
        correctAnswers={correctMSRAnswers}
        showResults={showResults}
        readOnly={readOnly}
      />
    );
  }

  // GI (Graphical Interpretation)
  if (questionData.di_type === 'GI') {
    return (
      <GIQuestion
        chartConfig={questionData.chart_config}
        contextText={questionData.context_text}
        statementText={questionData.statement_text || ''}
        blank1Options={questionData.blank1_options || []}
        blank2Options={questionData.blank2_options || []}
        imageUrl={getLocalizedImage(questionData, language)}
        selectedBlank1={currentAnswer.blank1}
        selectedBlank2={currentAnswer.blank2}
        onBlank1Change={(value) => {
          updateAnswer({
            blank1: value,
            answer: `${value}|${currentAnswer.blank2 || ''}`,
          });
        }}
        onBlank2Change={(value) => {
          updateAnswer({
            blank2: value,
            answer: `${currentAnswer.blank1 || ''}|${value}`,
          });
        }}
        correctBlank1={correctAnswerData}
        correctBlank2={correctAnswerData}
        showResults={showResults}
        readOnly={readOnly}
      />
    );
  }

  // TA (Table Analysis)
  if (questionData.di_type === 'TA') {
    const correctTAAnswers =
      Array.isArray(correctAnswerData) && correctAnswerData.length > 0
        ? (correctAnswerData[0] as Record<number, 'true' | 'false'>)
        : (correctAnswerData as Record<number, 'true' | 'false'>) || {};

    return (
      <TAQuestion
        tableTitle={questionData.table_title}
        stimulusText={questionData.stimulus_text}
        columnHeaders={questionData.column_headers || []}
        tableData={questionData.table_data || []}
        statements={questionData.statements || []}
        col1Title={questionData.answer_col1_title}
        col2Title={questionData.answer_col2_title}
        selectedAnswers={currentAnswer.taAnswers || {}}
        onAnswerChange={(statementIndex, value) => {
          const newTAAnswers = {
            ...(currentAnswer.taAnswers || {}),
            [statementIndex]: value,
          };
          updateAnswer({
            taAnswers: newTAAnswers,
            answer: Object.values(newTAAnswers).join(','),
          });
        }}
        correctAnswers={correctTAAnswers}
        showResults={showResults}
        readOnly={readOnly}
      />
    );
  }

  // TPA (Two-Part Analysis)
  if (questionData.di_type === 'TPA') {
    const correctTPAAnswers =
      Array.isArray(correctAnswerData) && correctAnswerData.length > 0
        ? (correctAnswerData[0] as Record<string, string>)
        : (correctAnswerData as Record<string, string>) || {};

    return (
      <TPAQuestion
        scenario={questionData.scenario || ''}
        column1Title={questionData.column1_title || ''}
        column2Title={questionData.column2_title || ''}
        sharedOptions={questionData.shared_options || []}
        selectedColumn1={currentAnswer.column1}
        selectedColumn2={currentAnswer.column2}
        onColumn1Change={(value) => {
          updateAnswer({
            column1: value,
            answer: `${value}|${currentAnswer.column2 || ''}`,
          });
        }}
        onColumn2Change={(value) => {
          updateAnswer({
            column2: value,
            answer: `${currentAnswer.column1 || ''}|${value}`,
          });
        }}
        correctColumn1={correctTPAAnswers}
        correctColumn2={correctTPAAnswers}
        showResults={showResults}
        readOnly={readOnly}
      />
    );
  }

  // Multiple Choice (standard)
  if (question.question_type === 'multiple_choice' && questionData.options) {
    const correctAnswer = Array.isArray(correctAnswerData)
      ? (correctAnswerData as string[])[0]
      : (correctAnswerData as string);

    return (
      <MultipleChoiceQuestion
        questionText={getLocalizedText(questionData, 'question_text', language)}
        passageText={getLocalizedText(questionData, 'passage_text', language) || undefined}
        passageTitle={getLocalizedText(questionData, 'passage_title', language) || undefined}
        passageLineOffsets={questionData.passage_line_offsets}
        imageUrl={getLocalizedImage(questionData, language)}
        options={getLocalizedOptions(questionData, language)}
        imageOptions={getLocalizedImageOptions(questionData, language)}
        selectedAnswer={currentAnswer.answer}
        onAnswerChange={(answer) => updateAnswer({ answer })}
        showResults={showResults}
        correctAnswer={correctAnswer}
        readOnly={readOnly}
        explanation={explanation}
        hideQuestionText={hideQuestionText}
      />
    );
  }

  // Open-ended question
  if (question.question_type === 'open_ended') {
    const questionText = getLocalizedText(questionData, 'question_text', language);
    const passageText = getLocalizedText(questionData, 'passage_text', language);
    const passageTitle = getLocalizedText(questionData, 'passage_title', language);
    const imageUrl = getLocalizedImage(questionData, language);

    if (passageText) {
      // Split-panel layout — passage sticks on the left, question drives the page scroll
      return (
        <div className="flex items-start gap-6 w-full">
          {/* Passage Text — left panel, sticky: stays visible as user scrolls */}
          <div className="flex-1 min-w-[42%] max-w-[50%] border-2 border-blue-200 rounded-xl p-6 bg-blue-50 sticky top-0 self-start">
            {passageTitle && (
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                {passageTitle}
              </h3>
            )}
            <div className="text-gray-700 whitespace-pre-wrap">
              {passageText}
            </div>
          </div>

          {/* Question and answer area — right panel, natural document flow */}
          <div className="flex-1 min-w-[42%] space-y-4">
            {imageUrl && (
              <div className="mb-4">
                <QuestionImage src={imageUrl} alt="Question image" />
              </div>
            )}
            {questionText && (
              <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
                <div className="text-lg text-gray-800">
                  <MathJaxRenderer>{questionText}</MathJaxRenderer>
                </div>
              </div>
            )}
            <textarea
              value={currentAnswer.answer || ''}
              onChange={(e) => updateAnswer({ answer: e.target.value })}
              placeholder={t('takeTest.enterYourAnswer', 'Enter your answer here...')}
              className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:ring-2 focus:ring-brand-green focus:ring-opacity-20 outline-none resize-y text-gray-800"
              disabled={readOnly}
            />
          </div>
        </div>
      );
    }

    // Layout without passage text
    return (
      <div className="space-y-4">
        {imageUrl && (
          <div className="mb-4">
            <QuestionImage src={imageUrl} alt="Question image" />
          </div>
        )}
        {questionText && (
          <div className="text-lg text-gray-800 mb-4">
            <MathJaxRenderer>{questionText}</MathJaxRenderer>
          </div>
        )}
        <textarea
          value={currentAnswer.answer || ''}
          onChange={(e) => updateAnswer({ answer: e.target.value })}
          placeholder={t('takeTest.enterYourAnswer', 'Enter your answer here...')}
          className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:ring-2 focus:ring-brand-green focus:ring-opacity-20 outline-none resize-y text-gray-800"
          disabled={readOnly}
        />
      </div>
    );
  }

  // Legacy format fallback - display question text if available
  if (questionData.question_text || questionData.question) {
    return (
      <div className="text-gray-800 text-lg whitespace-pre-wrap">
        <MathJaxRenderer>
          {questionData.question_text || questionData.question || ''}
        </MathJaxRenderer>
      </div>
    );
  }

  // Unknown question type - show warning
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800">
        Unknown question type: {question.question_type}
        {questionData.di_type && ` (DI: ${questionData.di_type})`}
      </p>
    </div>
  );
}

export default QuestionRenderer;
