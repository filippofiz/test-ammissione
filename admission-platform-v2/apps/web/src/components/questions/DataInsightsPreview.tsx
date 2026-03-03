/**
 * Data Insights Question Preview Component
 * Used in ReviewQuestionsPage to display GMAT Data Insights questions
 * Renders DS, MSR, GI, TA, TPA question types in read-only preview mode
 */

import { DSQuestion } from './DSQuestion';
import { MSRQuestion } from './MSRQuestion';
import { GIQuestion } from './GIQuestion';
import { TAQuestion } from './TAQuestion';
import { TPAQuestion } from './TPAQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';

interface DataInsightsPreviewProps {
  questionData: any;
  answers: any;
  showCorrectAnswer?: boolean;
}

export function DataInsightsPreview({
  questionData,
  answers,
  showCorrectAnswer = true,
}: DataInsightsPreviewProps) {
  const diType = questionData?.di_type;

  // DS - Data Sufficiency
  if (diType === 'DS') {
    // DB stores correct_answer as ["C"] (array of 1 string) — unwrap it
    const dsCorrect = answers?.correct_answer;
    const dsCorrectStr = Array.isArray(dsCorrect) ? dsCorrect[0] : dsCorrect;
    return (
      <DSQuestion
        problem={questionData?.problem || ''}
        statement1={questionData?.statement1 || ''}
        statement2={questionData?.statement2 || ''}
        selectedAnswer={undefined}
        correctAnswer={showCorrectAnswer ? dsCorrectStr : undefined}
        onAnswerChange={() => {}}
        readOnly={true}
        showResults={showCorrectAnswer}
      />
    );
  }

  // MSR - Multi-Source Reasoning
  if (diType === 'MSR') {
    const sources = questionData?.sources || [];
    const questions = questionData?.questions || [];
    const correctAnswers = questions.map((q: any) => q.correct_answer);

    return (
      <MSRQuestion
        sources={sources}
        questions={questions}
        questionStem={questionData?.question_stem}
        selectedAnswers={[]}
        onAnswerChange={() => {}}
        readOnly={true}
        correctAnswers={showCorrectAnswer ? correctAnswers : []}
        showResults={showCorrectAnswer}
      />
    );
  }

  // GI - Graphical Interpretation
  if (diType === 'GI') {
    // DB stores correct_answer as ["val1", "val2"] — index 0 = blank1, index 1 = blank2
    const giCorrect = answers?.correct_answer;
    const giCorrectArr = Array.isArray(giCorrect) ? giCorrect : [];
    return (
      <GIQuestion
        chartConfig={questionData?.chart_config}
        contextText={questionData?.context_text}
        statementText={questionData?.statement_text || ''}
        blank1Options={questionData?.blank1_options || []}
        blank2Options={questionData?.blank2_options || []}
        imageUrl={questionData?.image_url}
        selectedBlank1={undefined}
        selectedBlank2={undefined}
        onBlank1Change={() => {}}
        onBlank2Change={() => {}}
        readOnly={true}
        correctBlank1={showCorrectAnswer ? giCorrectArr[0] : undefined}
        correctBlank2={showCorrectAnswer ? giCorrectArr[1] : undefined}
        showResults={showCorrectAnswer}
      />
    );
  }

  // TA - Table Analysis
  if (diType === 'TA') {
    const statements = questionData?.statements || [];
    // Build correct answers mapping from statements
    const correctAnswers: Record<number, 'true' | 'false'> = {};
    if (showCorrectAnswer && answers?.correct_answer) {
      // DB stores correct_answer as [{stmt0: "col1", ...}] — unwrap the array
      const ca = Array.isArray(answers.correct_answer)
        ? answers.correct_answer[0]
        : answers.correct_answer;
      Object.entries(ca || {}).forEach(([key, value]) => {
        const match = key.match(/stmt(\d+)/);
        if (match) {
          const index = parseInt(match[1], 10);
          correctAnswers[index] = value === 'col1' ? 'true' : 'false';
        }
      });
    }

    return (
      <TAQuestion
        tableTitle={questionData?.table_title}
        stimulusText={questionData?.stimulus_text}
        columnHeaders={questionData?.column_headers || []}
        tableData={questionData?.table_data || []}
        statements={statements}
        col1Title={questionData?.answer_col1_title}
        col2Title={questionData?.answer_col2_title}
        selectedAnswers={{}}
        onAnswerChange={() => {}}
        readOnly={true}
        tableSortable={true}
        correctAnswers={showCorrectAnswer ? correctAnswers : {}}
        showResults={showCorrectAnswer}
      />
    );
  }

  // TPA - Two-Part Analysis
  if (diType === 'TPA') {
    const correctAnswer = answers?.correct_answer;
    let correctCol1: string | undefined;
    let correctCol2: string | undefined;

    if (showCorrectAnswer && correctAnswer) {
      // DB stores correct_answer as [{col1, col2}] — unwrap the array
      const ca = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
      if (ca && typeof ca === 'object' && 'col1' in ca) {
        correctCol1 = ca.col1;
        correctCol2 = ca.col2;
      }
    }

    return (
      <TPAQuestion
        scenario={questionData?.scenario || ''}
        column1Title={questionData?.column1_title || 'Column 1'}
        column2Title={questionData?.column2_title || 'Column 2'}
        sharedOptions={questionData?.shared_options || []}
        selectedColumn1={undefined}
        selectedColumn2={undefined}
        onColumn1Change={() => {}}
        onColumn2Change={() => {}}
        readOnly={true}
        correctColumn1={showCorrectAnswer ? correctCol1 : undefined}
        correctColumn2={showCorrectAnswer ? correctCol2 : undefined}
        showResults={showCorrectAnswer}
      />
    );
  }

  // CR - Critical Reasoning (uses MultipleChoice)
  if (diType === 'CR' && questionData?.options) {
    return (
      <MultipleChoiceQuestion
        questionText={questionData?.question_text || ''}
        passageText={questionData?.passage_text}
        passageTitle={questionData?.passage_title}
        imageUrl={questionData?.image_url}
        options={questionData.options}
        selectedAnswer={undefined}
        onAnswerChange={() => {}}
        readOnly={true}
        correctAnswer={showCorrectAnswer ? answers?.correct_answer : undefined}
        showResults={showCorrectAnswer}
      />
    );
  }

  // RC - Reading Comprehension (uses MultipleChoice)
  if (diType === 'RC' && questionData?.options) {
    return (
      <MultipleChoiceQuestion
        questionText={questionData?.question_text || ''}
        passageText={questionData?.passage_text}
        passageTitle={questionData?.passage_title}
        imageUrl={questionData?.image_url}
        options={questionData.options}
        selectedAnswer={undefined}
        onAnswerChange={() => {}}
        readOnly={true}
        correctAnswer={showCorrectAnswer ? answers?.correct_answer : undefined}
        showResults={showCorrectAnswer}
      />
    );
  }

  // Fallback: generic multiple choice if options are present
  if (questionData?.options) {
    return (
      <MultipleChoiceQuestion
        questionText={questionData?.question_text || questionData?.problem || ''}
        passageText={questionData?.passage_text}
        passageTitle={questionData?.passage_title}
        imageUrl={questionData?.image_url}
        options={questionData.options}
        selectedAnswer={undefined}
        onAnswerChange={() => {}}
        readOnly={true}
        correctAnswer={showCorrectAnswer ? answers?.correct_answer : undefined}
        showResults={showCorrectAnswer}
      />
    );
  }

  // Unknown type - show raw data for debugging
  return (
    <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
      <p className="text-yellow-800 font-semibold mb-2">
        Unknown Data Insights type: {diType || 'not specified'}
      </p>
      <pre className="text-xs text-gray-600 overflow-x-auto">
        {JSON.stringify({ questionData, answers }, null, 2)}
      </pre>
    </div>
  );
}
