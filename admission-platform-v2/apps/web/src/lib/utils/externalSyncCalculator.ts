/**
 * External Sync Calculator
 *
 * IMPORTANT: This utility is ONLY used for syncing test results to external platforms.
 * It has ZERO impact on the main platform's results, scoring, or grading systems.
 *
 * Purpose: Calculate correct/wrong/blank counts for external platform synchronization
 */

import { supabase } from '../supabase';

interface AnswerComparisonResult {
  correct: number;
  wrong: number;
  blank: number;
  totalQuestions: number;
}

/**
 * Calculate test results for external sync ONLY
 * Does not affect internal platform results/scoring
 */
export async function calculateResultsForExternalSync(
  assignmentId: string,
  attemptNumber: number,
  totalQuestions: number
): Promise<AnswerComparisonResult> {
  try {
    console.log('📊 [EXTERNAL SYNC] Calculating results for external platform only');

    // Fetch student answers for this attempt
    const { data: answers, error: answersError } = await supabase
      .from('2V_student_answers')
      .select('question_id, answer')
      .eq('assignment_id', assignmentId)
      .eq('attempt_number', attemptNumber) as {
        data: Array<{ question_id: string; answer: any }> | null;
        error: any;
      };

    if (answersError) {
      console.error('❌ [EXTERNAL SYNC] Error fetching answers:', answersError);
      throw answersError;
    }

    if (!answers || answers.length === 0) {
      console.log('⚠️ [EXTERNAL SYNC] No answers found');
      return {
        correct: 0,
        wrong: 0,
        blank: totalQuestions,
        totalQuestions
      };
    }

    // Get question IDs
    const questionIds = answers.map(a => a.question_id);

    // Fetch questions with correct answers
    const { data: questions, error: questionsError } = await supabase
      .from('2V_questions')
      .select('id, question_data, question_type, answers')
      .in('id', questionIds) as {
        data: Array<{
          id: string;
          question_data: any;
          question_type: string;
          answers: any;
        }> | null;
        error: any;
      };

    if (questionsError) {
      console.error('❌ [EXTERNAL SYNC] Error fetching questions:', questionsError);
      throw questionsError;
    }

    if (!questions) {
      console.log('⚠️ [EXTERNAL SYNC] No questions found');
      return {
        correct: 0,
        wrong: 0,
        blank: totalQuestions,
        totalQuestions
      };
    }

    // Create map of question ID to question
    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Calculate correct/wrong counts
    let correctCount = 0;
    let wrongCount = 0;

    for (const answer of answers) {
      const question = questionMap.get(answer.question_id);
      if (!question) continue;

      const studentAns = answer.answer;

      // Skip if no answer provided (blank)
      if (!studentAns || isAnswerBlank(studentAns)) {
        continue;
      }

      // Check if answer is correct
      const isCorrect = checkIfCorrect(question, studentAns);

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }

    const answeredCount = correctCount + wrongCount;
    const blankCount = totalQuestions - answeredCount;

    console.log('✅ [EXTERNAL SYNC] Results calculated:', {
      correct: correctCount,
      wrong: wrongCount,
      blank: blankCount,
      total: totalQuestions
    });

    return {
      correct: correctCount,
      wrong: wrongCount,
      blank: blankCount,
      totalQuestions
    };

  } catch (error) {
    console.error('💥 [EXTERNAL SYNC] Error calculating results:', error);
    // Return safe defaults on error
    return {
      correct: 0,
      wrong: 0,
      blank: totalQuestions,
      totalQuestions
    };
  }
}

/**
 * Check if an answer is blank/empty
 */
function isAnswerBlank(studentAns: any): boolean {
  if (!studentAns) return true;

  // Check if answer field is null/undefined/empty
  if (studentAns.answer === null || studentAns.answer === undefined || studentAns.answer === '') {
    return true;
  }

  // Check if answers array is empty
  if (studentAns.answers) {
    if (Array.isArray(studentAns.answers) && studentAns.answers.length === 0) {
      return true;
    }
    if (typeof studentAns.answers === 'object' && Object.keys(studentAns.answers).length === 0) {
      return true;
    }
  }

  return false;
}

/**
 * Check if student answer is correct
 * Copied from TestResultsPage.tsx - used ONLY for external sync
 */
function checkIfCorrect(question: any, studentAns: any): boolean {
  if (!studentAns) return false;

  // Get correct answer from answers JSONB field
  const answersData = typeof question.answers === 'string'
    ? JSON.parse(question.answers)
    : question.answers;
  const correctAns = answersData?.correct_answer;

  // Handle null/undefined cases
  if (!correctAns) return false;

  // Get question type for special handling
  const questionData = question.question_data || {};
  const diType = questionData.di_type;

  // GI (Graphical Interpretation) - student: {part1, part2}, correct: ["val1", "val2"]
  if (diType === 'GI' && studentAns.answers && Array.isArray(correctAns)) {
    const studentGI = studentAns.answers;
    const match1 = String(studentGI.part1 || '').trim() === String(correctAns[0] || '').trim();
    const match2 = String(studentGI.part2 || '').trim() === String(correctAns[1] || '').trim();
    return match1 && match2;
  }

  // TA (Table Analysis) - student: {0: "true", 1: "false"}, correct: [{stmt0: "col1", stmt1: "col2"}]
  if (diType === 'TA' && studentAns.answers) {
    const correctTA = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
    const studentTA = studentAns.answers;

    // Check all statements
    const result = Object.entries(correctTA).every(([key, value]) => {
      const match = key.match(/stmt(\d+)/);
      if (match) {
        const index = parseInt(match[1], 10);
        const expectedAnswer = value === 'col1' ? 'true' : 'false';
        const studentValue = String(studentTA[index] || studentTA[String(index)] || '').toLowerCase();
        const isMatch = studentValue === expectedAnswer || studentValue === String(expectedAnswer === 'true');
        return isMatch;
      }
      return true;
    });
    return result;
  }

  // TPA (Two-Part Analysis) - student: {part1, part2}, correct: [{col1: "...", col2: "..."}]
  if (diType === 'TPA' && studentAns.answers) {
    const correctTPA = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
    const studentTPA = studentAns.answers;
    const match1 = String(studentTPA.part1 || '').trim() === String(correctTPA.col1 || '').trim();
    const match2 = String(studentTPA.part2 || '').trim() === String(correctTPA.col2 || '').trim();
    return match1 && match2;
  }

  // MSR (Multi-Source Reasoning) - array of answers
  if (diType === 'MSR' && studentAns.answers && Array.isArray(correctAns)) {
    const studentMSR = Array.isArray(studentAns.answers) ? studentAns.answers : [];
    if (studentMSR.length !== correctAns.length) {
      return false;
    }
    const result = studentMSR.every((ans: any, idx: number) =>
      String(ans || '').toLowerCase() === String(correctAns[idx] || '').toLowerCase()
    );
    return result;
  }

  // DS (Data Sufficiency) - simple string answer
  if (diType === 'DS') {
    const studentDS = typeof studentAns === 'string' ? studentAns : studentAns.answer;
    const correctDS = Array.isArray(correctAns) ? correctAns[0] : correctAns;
    const result = String(studentDS || '').toUpperCase() === String(correctDS || '').toUpperCase();
    return result;
  }

  // Multiple Choice - student: {answer: "e"} or "e", correct: "e"
  if (question.question_type === 'multiple_choice') {
    const studentMC = studentAns.answer || studentAns;
    const correctMC = typeof correctAns === 'string' ? correctAns : correctAns;
    const result = String(studentMC || '').toLowerCase() === String(correctMC || '').toLowerCase();
    return result;
  }

  // Open-ended/text input questions - use flexible comparison
  if (studentAns.answer !== undefined && correctAns) {
    const correctValue = typeof correctAns === 'string' ? correctAns : correctAns.answer || correctAns;
    const studentValue = studentAns.answer;
    return compareAnswersFlexibly(studentValue, correctValue);
  }

  // Multiple answers comparison (for backward compatibility)
  if (studentAns.answers && correctAns.answers) {
    const studentAnswers = Array.isArray(studentAns.answers) ? studentAns.answers : [];
    const correctAnswers = Array.isArray(correctAns.answers) ? correctAns.answers : [];

    if (studentAnswers.length !== correctAnswers.length) return false;

    return studentAnswers.every((ans: any, idx: number) => compareAnswersFlexibly(ans, correctAnswers[idx]));
  }

  return false;
}

/**
 * Compare answers flexibly (handles numeric equivalence)
 * Copied from TestResultsPage.tsx
 */
function compareAnswersFlexibly(studentValue: any, correctValue: any): boolean {
  const studentStr = String(studentValue || '').trim();
  const correctStr = String(correctValue || '').trim();

  // Exact match (case-insensitive)
  if (studentStr.toLowerCase() === correctStr.toLowerCase()) {
    return true;
  }

  // Try numeric comparison (handles 0.5 = 1/2, etc.)
  const studentNum = parseFloat(studentStr);
  const correctNum = parseFloat(correctStr);

  if (!isNaN(studentNum) && !isNaN(correctNum)) {
    // Check if values are approximately equal (within small tolerance for floating point)
    return Math.abs(studentNum - correctNum) < 0.0001;
  }

  // Try evaluating as fractions (1/2 = 0.5)
  const evalFraction = (str: string): number | null => {
    const match = str.match(/^(-?\d+)\/(-?\d+)$/);
    if (match) {
      const num = parseFloat(match[1]);
      const den = parseFloat(match[2]);
      return den !== 0 ? num / den : null;
    }
    return null;
  };

  // Try evaluating as percentages (50% = 0.5)
  const evalPercentage = (str: string): number | null => {
    const match = str.match(/^(-?\d+(?:\.\d+)?)%$/);
    if (match) {
      const num = parseFloat(match[1]);
      return num / 100;
    }
    return null;
  };

  const studentFraction = evalFraction(studentStr);
  const correctFraction = evalFraction(correctStr);
  const studentPercentage = evalPercentage(studentStr);
  const correctPercentage = evalPercentage(correctStr);

  // Build normalized values for comparison
  const studentNormalized = studentPercentage ?? studentFraction ?? (!isNaN(studentNum) ? studentNum : null);
  const correctNormalized = correctPercentage ?? correctFraction ?? (!isNaN(correctNum) ? correctNum : null);

  // Compare normalized values
  if (studentNormalized !== null && correctNormalized !== null) {
    return Math.abs(studentNormalized - correctNormalized) < 0.0001;
  }

  return false;
}
