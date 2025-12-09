/**
 * Test Results Page - Tutor view of student answers
 * Shows detailed analysis of student's test attempt with answers, corrections, etc.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faTimesCircle,
  faFlag,
  faClock,
  faChartBar,
  faTrophy,
  faBolt,
  faChartLine,
  faChevronDown,
  faChevronUp,
  faArrowUp,
  faArrowDown,
  faMinus,
  faEye,
  faEyeSlash,
  faLock,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { DSQuestion } from '../components/questions/DSQuestion';
import { MSRQuestion } from '../components/questions/MSRQuestion';
import { GIQuestion } from '../components/questions/GIQuestion';
import { TAQuestion } from '../components/questions/TAQuestion';
import { TPAQuestion } from '../components/questions/TPAQuestion';
import { MultipleChoiceQuestion } from '../components/questions/MultipleChoiceQuestion';
import { LaTeX } from '../components/LaTeX';

interface Question {
  id: string;
  section: string;
  materia?: string;
  question_text: string;
  question_type: string;
  correct_answer: any;
  options?: any;
  difficulty?: number | string;
}

interface StudentAnswer {
  id: string;
  question_id: string;
  answer: any;
  time_spent_seconds: number;
  is_flagged: boolean;
  attempt_number: number;
  auto_score: number | null;
  tutor_score: number | null;
  tutor_feedback: string | null;
}

interface TestResult {
  question: Question;
  studentAnswer: StudentAnswer | null;
  isCorrect: boolean;
  order: number; // Order in which question appeared in test (from completion_details)
  questionNumber: number; // Question number in pool (from completion_details)
  difficulty: string; // Difficulty from completion_details
}

export default function TestResultsPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Determine if this is a student or tutor view based on URL
  const isStudentView = location.pathname.includes('/student/');

  // Get current language for question translations
  const isEnglish = i18n.language === 'en';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);
  const [attemptsWithAnswers, setAttemptsWithAnswers] = useState<Set<number>>(new Set());
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterCorrectness, setFilterCorrectness] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [attemptComparison, setAttemptComparison] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [resultsViewable, setResultsViewable] = useState(false);
  const [togglingViewability, setTogglingViewability] = useState(false);
  const [algorithmConfig, setAlgorithmConfig] = useState<any>(null);
  const [showScoreReport, setShowScoreReport] = useState(false);
  const [showTimeManagement, setShowTimeManagement] = useState(false);

  useEffect(() => {
    loadTestResults();
  }, [assignmentId, selectedAttempt]);

  useEffect(() => {
    if (assignment && assignment.total_attempts > 1) {
      loadAttemptComparison();
    }
  }, [assignment]);

  async function loadTestResults() {
    try {
      setLoading(true);
      setError(null);

      // Load assignment details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('2V_test_assignments')
        .select(`
          *,
          results_viewable_by_student,
          2V_tests(
            id,
            test_type,
            test_number,
            section,
            exercise_type
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      // Load student profile separately
      const { data: studentData, error: studentError } = await supabase
        .from('2V_profiles')
        .select('id, name, email')
        .eq('id', assignmentData.student_id)
        .single();

      if (studentError) throw studentError;

      // Load test track config for adaptivity and section info
      const testType = assignmentData['2V_tests'].test_type;
      const exerciseType = assignmentData['2V_tests'].exercise_type;

      // Load test_track_config for adaptivity, sections, and algorithm
      const { data: trackConfig, error: trackConfigError } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType)
        .eq('track_type', exerciseType)
        .maybeSingle();

      // If there's an algorithm_id, fetch the algorithm config
      if (!trackConfigError && trackConfig?.algorithm_id) {
        const { data: algoConfig, error: algoError } = await supabase
          .from('2V_algorithm_config')
          .select('*')
          .eq('id', trackConfig.algorithm_id)
          .single();

        // Set algorithm config if found - score calculation works for any test type
        if (!algoError && algoConfig) {
          setAlgorithmConfig(algoConfig);
        }
      }

      // Combine data
      const fullAssignmentData = {
        ...assignmentData,
        '2V_profiles': studentData
      };

      setAssignment(fullAssignmentData);
      setResultsViewable(assignmentData.results_viewable_by_student || false);

      // Load ALL answers to determine which attempts have data
      const { data: allAnswers, error: answersError } = await supabase
        .from('2V_student_answers')
        .select('question_id, created_at, updated_at, attempt_number, question_order')
        .eq('assignment_id', assignmentId)
        .order('question_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true, nullsFirst: false });

      if (answersError) throw answersError;

      if (!allAnswers || allAnswers.length === 0) {
        throw new Error(t('testResults.noAnswersFoundForAssignment'));
      }

      // Determine which attempts have answers
      const attemptsSet = new Set(allAnswers.map(a => a.attempt_number));
      setAttemptsWithAnswers(attemptsSet);

      // Auto-select the most recent attempt that has answers (first time only)
      let attemptToLoad = selectedAttempt;
      if (selectedAttempt === null) {
        // Find most recent attempt with answers (count down from current_attempt)
        for (let i = assignmentData.current_attempt || 1; i >= 1; i--) {
          if (attemptsSet.has(i)) {
            attemptToLoad = i;
            setSelectedAttempt(i);
            break;
          }
        }
      }

      // If still no attempt, can't load results
      if (attemptToLoad === null) {
        setLoading(false);
        return;
      }

      // Filter by attempt number in JavaScript
      const answers = allAnswers.filter(a => a.attempt_number === attemptToLoad);

      // Get completion_details for metadata (difficulty, etc.) if available
      const completionDetails = assignmentData.completion_details || { attempts: [] };
      const attemptRecord = completionDetails.attempts?.find(
        (a: any) => a.attempt_number === attemptToLoad
      );

      // Get question IDs - different strategies based on test configuration
      let questionIds: string[] = [];

      // Check if this is a non-adaptive test with no macro sections
      const isNonAdaptive = trackConfig?.adaptivity_mode === 'non_adaptive';
      const hasNoMacroSections = trackConfig?.section_order_mode !== 'macro_sections_mandatory';
      const shouldShowAllQuestions = isNonAdaptive && hasNoMacroSections;

      if (shouldShowAllQuestions) {
        // Load ALL questions directly from 2V_questions table using test_id
        const testId = assignmentData['2V_tests'].id;
        const { data: allTestQuestions, error: allQuestionsError } = await supabase
          .from('2V_questions')
          .select('id')
          .eq('test_id', testId)
          .order('question_number');

        if (allQuestionsError) throw allQuestionsError;

        questionIds = (allTestQuestions || []).map(q => q.id);
      } else if (answers.length > 0) {
        // Fallback: Use answers-based loading (only seen questions)
        const seenQuestionIds = new Set<string>();
        const uniqueAnswers = answers.filter(a => {
          if (seenQuestionIds.has(a.question_id)) {
            return false;
          }
          seenQuestionIds.add(a.question_id);
          return true;
        });
        questionIds = uniqueAnswers.map(a => a.question_id);
      } else {
        throw new Error(t('testResults.noAnswersFoundForAttempt', { attempt: attemptToLoad }));
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('*')
        .in('id', questionIds);

      if (questionsError) throw questionsError;

      // Create a map for quick lookup
      const questionMap = new Map(questionsData?.map(q => [q.id, q]) || []);

      // Order questions according to test order
      // Map to get the actual question objects
      let questions: Question[] = questionIds
        .map(id => questionMap.get(id))
        .filter((q: any) => q !== undefined);

      // Sort questions based on the source
      if (shouldShowAllQuestions) {
        // Custom sort: answered questions first (by question_order), then never-viewed (by question_number)
        const answerOrderMap = new Map(answers.map(a => [a.question_id, a.question_order ?? 999999]));

        questions.sort((a, b) => {
          const aHasAnswer = answerOrderMap.has(a.id);
          const bHasAnswer = answerOrderMap.has(b.id);

          // Both answered: sort by question_order
          if (aHasAnswer && bHasAnswer) {
            return answerOrderMap.get(a.id)! - answerOrderMap.get(b.id)!;
          }

          // One answered, one not: answered first
          if (aHasAnswer && !bHasAnswer) return -1;
          if (!aHasAnswer && bHasAnswer) return 1;

          // Both not answered: sort by question_number
          return (a.question_number || 0) - (b.question_number || 0);
        });
      } else {
        // Sort by question_order (primary), then created_at (secondary), then question_number (tertiary)
        const answerOrderMap = new Map(answers.map((a, idx) => [a.question_id, idx]));
        const answerCreatedAtMap = new Map(answers.map(a => [a.question_id, new Date(a.created_at).getTime()]));

        questions.sort((a, b) => {
          // Primary: question_order from answer
          const orderA = answerOrderMap.get(a.id) ?? 999999;
          const orderB = answerOrderMap.get(b.id) ?? 999999;
          if (orderA !== orderB) return orderA - orderB;

          // Secondary: created_at timestamp
          const timeA = answerCreatedAtMap.get(a.id) ?? 999999999999999;
          const timeB = answerCreatedAtMap.get(b.id) ?? 999999999999999;
          if (timeA !== timeB) return timeA - timeB;

          // Tertiary: question number from question data
          const numA = a.question_number || 0;
          const numB = b.question_number || 0;
          return numA - numB;
        });
      }

      // Create metadata map from completion_details (for difficulty info)
      const metadataMap = new Map<string, any>();
      if (attemptRecord?.test_questions) {
        attemptRecord.test_questions.forEach((tq: any) => {
          metadataMap.set(tq.question_id, {
            questionNumber: tq.question_number,
            difficulty: tq.difficulty
          });
        });
      }

      // Load full student answers for this attempt (with all fields)
      const { data: allFullAnswers, error: fullAnswersError } = await supabase
        .from('2V_student_answers')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (fullAnswersError) throw fullAnswersError;

      // Filter by attempt number in JavaScript
      const fullAnswers = allFullAnswers?.filter(a => a.attempt_number === attemptToLoad) || [];

      // Create answer lookup
      const answerMap = new Map(fullAnswers.map(a => [a.question_id, a]));

      // Build results array (questions already in correct order from answers.created_at)
      const resultsData: TestResult[] = (questions || []).map((question: any, index: number) => {
        const studentAnswer = answerMap.get(question.id) || null;
        const isCorrect = checkIfCorrect(question, studentAnswer);

        // Get metadata from completion_details if available
        const metadata = metadataMap.get(question.id);

        return {
          question,
          studentAnswer,
          isCorrect,
          // Use index + 1 as order (since questions are already sorted by answers.created_at)
          order: index + 1,
          questionNumber: metadata?.questionNumber || index + 1,
          difficulty: metadata?.difficulty || question.difficulty || 'unknown',
        };
      });

      setResults(resultsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  }

  // Helper function to compare answers flexibly (handles numeric equivalence)
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

  function checkIfCorrect(question: Question, studentAnswer: StudentAnswer | null): boolean {
    if (!studentAnswer || !studentAnswer.answer) return false;

    const studentAns = studentAnswer.answer;

    // Get correct answer from answers JSONB field
    const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
    const correctAns = answersData?.correct_answer;

    // Handle null/undefined cases
    if (!studentAns || !correctAns) return false;

    // Get question type for special handling
    const questionData = (question as any).question_data || {};
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

      console.log('🔍 [RESULTS] Flexible comparison for open-ended:', {
        questionId: question.id,
        studentValue,
        correctValue,
        result: compareAnswersFlexibly(studentValue, correctValue)
      });

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

  async function loadAttemptComparison() {
    try {
      if (!assignment || assignment.total_attempts <= 1) return;

      const attempts = [];

      // Load ALL answers for this assignment ONCE (more efficient than multiple queries)
      const { data: allAnswersForAssignment, error: allAnswersError } = await supabase
        .from('2V_student_answers')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: true });

      if (allAnswersError) throw allAnswersError;

      if (!allAnswersForAssignment || allAnswersForAssignment.length === 0) {
        return;
      }

      // Get completion details to extract start/end times for each attempt
      const completionDetails = assignment.completion_details || { attempts: [] };

      // Process each attempt
      for (let attemptNum = 1; attemptNum <= assignment.total_attempts; attemptNum++) {
        // Filter answers for this specific attempt
        const answersWithQuestionIds = allAnswersForAssignment.filter(a => a.attempt_number === attemptNum);

        if (answersWithQuestionIds.length === 0) {
          continue;
        }

        // Get question details
        const questionIds = answersWithQuestionIds.map(a => a.question_id);
        const { data: questionsData, error: questionsError } = await supabase
          .from('2V_questions')
          .select('*')
          .in('id', questionIds);

        if (questionsError) throw questionsError;

        // Order questions according to answer creation time
        const questionMap = new Map(questionsData?.map(q => [q.id, q]) || []);
        const questions = questionIds
          .map(id => questionMap.get(id))
          .filter((q: any) => q !== undefined);

        // Use filtered answers for this attempt (already loaded above)
        const answers = answersWithQuestionIds;

        // Calculate stats for this attempt
        const answerMap = new Map(answers?.map(a => [a.question_id, a]) || []);
        let correct = 0;
        let wrong = 0;
        let unanswered = 0;
        const sectionStats: Record<string, { correct: number; total: number; time: number }> = {};

        questions.forEach((question: Question) => {
          const studentAnswer = answerMap.get(question.id);
          const isCorrect = checkIfCorrect(question, studentAnswer || null);

          // Check if answer is actually provided (not null)
          const hasAnswer = studentAnswer && studentAnswer.answer &&
            (typeof studentAnswer.answer === 'object'
              ? studentAnswer.answer.answer !== null && studentAnswer.answer.answer !== undefined
              : true);

          if (!hasAnswer) {
            unanswered++;
          } else if (isCorrect) {
            correct++;
          } else {
            wrong++;
          }

          // Section stats (using individual answer times for section breakdown)
          if (!sectionStats[question.section]) {
            sectionStats[question.section] = { correct: 0, total: 0, time: 0 };
          }
          sectionStats[question.section].total++;
          if (isCorrect) sectionStats[question.section].correct++;
          if (studentAnswer) sectionStats[question.section].time += studentAnswer.time_spent_seconds || 0;
        });

        // Calculate total time from completion_details start/end times
        const attemptRecord = completionDetails.attempts?.find((a: any) => a.attempt_number === attemptNum);
        let totalTime = 0;
        if (attemptRecord?.started_at && attemptRecord?.completed_at) {
          const startTime = new Date(attemptRecord.started_at).getTime();
          const endTime = new Date(attemptRecord.completed_at).getTime();
          totalTime = Math.floor((endTime - startTime) / 1000); // Convert to seconds
        } else {
          // Fallback: sum individual answer times if completion_details not available
          totalTime = answers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0);
        }

        attempts.push({
          attemptNumber: attemptNum,
          correct,
          wrong,
          unanswered,
          total: questions.length,
          score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
          totalTime,
          avgTimePerQuestion: totalTime > 0 && questions.length > 0 ? Math.round(totalTime / questions.length) : 0,
          sectionStats,
        });
      }

      setAttemptComparison(attempts);
    } catch (err) {
      // Error loading attempt comparison
    }
  }

  async function toggleResultsViewability() {
    try {
      setTogglingViewability(true);
      const newValue = !resultsViewable;

      const { error } = await supabase
        .from('2V_test_assignments')
        .update({ results_viewable_by_student: newValue })
        .eq('id', assignmentId);

      if (error) {
        alert('Failed to update results viewability. Please try again.');
        return;
      }

      setResultsViewable(newValue);
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setTogglingViewability(false);
    }
  }

  function formatAnswer(answer: any): string {
    if (!answer) return t('testResults.noAnswer');

    if (answer.answer) return answer.answer;
    if (answer.answers) {
      if (Array.isArray(answer.answers)) {
        return answer.answers.join(', ');
      }
      if (typeof answer.answers === 'object') {
        return JSON.stringify(answer.answers, null, 2);
      }
    }
    if (answer.text) return answer.text;

    return JSON.stringify(answer);
  }

  // Render the appropriate question component based on question type
  // Matches the rendering logic from TakeTestPage.tsx
  function renderQuestionComponent(result: TestResult) {
    const { question, studentAnswer } = result;

    // Get question data (new JSON structure)
    const questionData = (question as any).question_data || {};
    const diType = questionData.di_type;

    // Helper to get localized text (using isEnglish from parent scope)
    const getLocalizedText = (italianKey: string, englishKey: string) => {
      return isEnglish && questionData[englishKey] ? questionData[englishKey] : questionData[italianKey];
    };

    // Get localized question text, options, and passage text
    const localizedQuestionText = getLocalizedText('question_text', 'question_text_eng');
    const localizedOptions = isEnglish && questionData.options_eng ? questionData.options_eng : questionData.options;
    const localizedPassageText = getLocalizedText('passage_text', 'passage_text_eng');

    // Dummy onChange - components are read-only
    const noOp = () => {};

    let component = null;

    // GMAT Data Insights Question Types
    if (diType === 'DS') {
      // DS answers are saved as: { answer: "C" }
      // So we extract directly from studentAnswer.answer
      const dsAnswer = studentAnswer?.answer;
      const extractedAnswer = typeof dsAnswer === 'string' ? dsAnswer : dsAnswer?.answer;

      // Extract correct answer from answers JSONB field
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;

      // DS correct answers are stored as an array with one element: ["C"]
      const correctDSAnswer = Array.isArray(correctAnswerData) ? correctAnswerData[0] : correctAnswerData;

      component = (
        <DSQuestion
          problem={questionData.problem || ''}
          statement1={questionData.statement1 || ''}
          statement2={questionData.statement2 || ''}
          selectedAnswer={extractedAnswer}
          correctAnswer={correctDSAnswer}
          onAnswerChange={noOp}
          readOnly={true}
          showResults={true}
        />
      );
    }
    else if (diType === 'MSR') {
      // Extract MSR answers from database structure
      // Saved as: { answer: { answers: ['A', 'B', 'C'] } }
      const msrAnswers = studentAnswer?.answer?.answers || [];

      // Extract correct answer from answers JSONB field
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;

      // MSR correct answers are stored as an array: ["a", "b", "c"]
      const correctMSRAnswers = Array.isArray(correctAnswerData) ? correctAnswerData : [];

      component = (
        <MSRQuestion
          sources={questionData.sources || []}
          questions={questionData.questions || []}
          selectedAnswers={msrAnswers}
          onAnswerChange={noOp}
          readOnly={true}
          correctAnswers={correctMSRAnswers}
          showResults={true}
        />
      );
    }
    else if (diType === 'GI') {
      // Extract GI answers from database structure
      // Saved as: { answer: { answers: { part1: 'value1', part2: 'value2' } } }
      const giAnswers = studentAnswer?.answer?.answers || {};

      // Extract correct answer from answers JSONB field
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;

      // GI correct answers - pass raw data to component for transformation
      component = (
        <GIQuestion
          chartConfig={questionData.chart_config}
          contextText={questionData.context_text}
          statementText={questionData.statement_text || ''}
          blank1Options={questionData.blank1_options || []}
          blank2Options={questionData.blank2_options || []}
          selectedBlank1={giAnswers.part1}
          selectedBlank2={giAnswers.part2}
          onBlank1Change={noOp}
          onBlank2Change={noOp}
          readOnly={true}
          correctBlank1={correctAnswerData}
          correctBlank2={correctAnswerData}
          showResults={true}
        />
      );
    }
    else if (diType === 'TA') {
      // Extract TA answers from database structure
      // Saved as: { answer: { answers: { "0": "true", "1": "false", ... } } }
      const taAnswers = studentAnswer?.answer?.answers || {};

      // Extract correct answer from answers JSONB field
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;

      // TA correct answers - pass raw data to component for transformation
      const correctTAAnswers = Array.isArray(correctAnswerData) && correctAnswerData.length > 0
        ? correctAnswerData[0]
        : correctAnswerData || {};

      component = (
        <TAQuestion
          tableTitle={questionData.table_title}
          columnHeaders={questionData.column_headers || []}
          tableData={questionData.table_data || []}
          statements={questionData.statements || []}
          selectedAnswers={taAnswers}
          onAnswerChange={noOp}
          readOnly={true}
          tableSortable={true}
          correctAnswers={correctTAAnswers}
          showResults={true}
        />
      );
    }
    else if (diType === 'TPA') {
      // Extract TPA answers from database structure
      // Saved as: { answer: { answers: { part1: 'value1', part2: 'value2' } } }
      const tpaAnswers = studentAnswer?.answer?.answers || {};

      // Extract correct answer from answers JSONB field
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;

      // TPA correct answers - pass raw data to component for transformation
      const correctTPAAnswers = Array.isArray(correctAnswerData) && correctAnswerData.length > 0
        ? correctAnswerData[0]
        : correctAnswerData || {};

      component = (
        <TPAQuestion
          scenario={questionData.scenario || ''}
          column1Title={questionData.column1_title || ''}
          column2Title={questionData.column2_title || ''}
          sharedOptions={questionData.shared_options || []}
          selectedColumn1={tpaAnswers.part1}
          selectedColumn2={tpaAnswers.part2}
          onColumn1Change={noOp}
          onColumn2Change={noOp}
          readOnly={true}
          correctColumn1={correctTPAAnswers}
          correctColumn2={correctTPAAnswers}
          showResults={true}
        />
      );
    }
    // Standard Multiple Choice
    else if (question.question_type === 'multiple_choice' && questionData.options) {
      const studentMCAnswer = studentAnswer?.answer?.answer || studentAnswer?.answer;

      // Extract correct answer from answers JSONB field
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;

      // Multiple Choice correct answers are stored as a string: "b"
      const correctMCAnswer = typeof correctAnswerData === 'string' ? correctAnswerData : correctAnswerData;

      component = (
        <MultipleChoiceQuestion
          questionText={localizedQuestionText || question.question_text || ''}
          passageText={localizedPassageText || questionData.passage_text}
          passageTitle={questionData.passage_title}
          imageUrl={questionData.image_url || question.image_url}
          options={localizedOptions}
          selectedAnswer={studentMCAnswer}
          correctAnswer={correctMCAnswer}
          onAnswerChange={noOp}
          readOnly={true}
          showResults={true}
        />
      );
    }
    // Fallback for other question types
    else {
      // Extract correct answer from answers JSONB field (new structure)
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerFromAnswers = answersData?.correct_answer;

      // Preprocess question text to fix LaTeX escaping issues from database
      const rawQuestionText = localizedQuestionText || question.question_text;
      const questionTextToRender = rawQuestionText
        ? rawQuestionText.replace(/\\([\\${}^_])/g, '$1') // Unescape: \\ → \, \$ → $, etc.
        : rawQuestionText;

      console.log('🔍 [RESULTS] Fallback question rendering:', '\n' +
        'Question ID: ' + question.id + '\n' +
        'Question Type: ' + question.question_type + '\n' +
        'Raw Question Text: ' + JSON.stringify(rawQuestionText, null, 2) + '\n' +
        'Processed Question Text: ' + JSON.stringify(questionTextToRender, null, 2) + '\n' +
        'Has Old Correct Answer: ' + !!question.correct_answer + '\n' +
        'Has Answers Field: ' + !!question.answers + '\n' +
        'Answers Data: ' + JSON.stringify(answersData, null, 2) + '\n' +
        'Correct Answer From Answers: ' + JSON.stringify(correctAnswerFromAnswers, null, 2) + '\n' +
        'Student Answer: ' + JSON.stringify(studentAnswer?.answer, null, 2)
      );

      component = (
          <div className="space-y-4">
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
              {(localizedQuestionText || question.question_text) ? (
                <div className="text-gray-800 text-lg whitespace-pre-wrap">
                  <LaTeX>{questionTextToRender}</LaTeX>
                </div>
              ) : (
                <div className="text-gray-400 italic">
                  {t('testResults.noQuestionText')} ({t('testResults.questionType')}: {t(`testResults.questionTypes.${question.question_type}`, question.question_type)})
                </div>
              )}
              {question.image_url && (
                <img src={question.image_url} alt="Question" className="mt-4 max-w-full rounded" />
              )}
            </div>

            {/* Answer Display with color coding */}
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('testResults.answer')}</div>
              <div className="p-4 rounded-lg bg-gray-50 border-2 border-gray-200 space-y-2">
                {studentAnswer ? (
                  result.isCorrect ? (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                      <span className="font-semibold text-green-700">
                        <LaTeX>{formatAnswer(studentAnswer.answer)}</LaTeX>
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                        <span className="text-sm text-gray-600">{t('testResults.yourAnswer')}</span>
                        <span className="font-semibold text-red-700">
                          <LaTeX>{formatAnswer(studentAnswer.answer)}</LaTeX>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                        <span className="text-sm text-gray-600">{t('testResults.correctAnswer')}</span>
                        <span className="font-semibold text-green-700">
                          <LaTeX>
                            {correctAnswerFromAnswers ? formatAnswer(correctAnswerFromAnswers) :
                             question.correct_answer ? formatAnswer(question.correct_answer) :
                             t('testResults.noAnswerProvided')}
                          </LaTeX>
                        </span>
                      </div>
                    </>
                  )
                ) : (
                  <div className="text-gray-500 italic">{t('testResults.noAnswerProvided')}</div>
                )}
              </div>
            </div>
          </div>
        );
      }

    return component;
  }

  // Group results by section
  function groupBySection(results: TestResult[]): Record<string, TestResult[]> {
    const grouped: Record<string, TestResult[]> = {};
    results.forEach(result => {
      const section = result.question.section || 'Other';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(result);
    });
    return grouped;
  }

  // Calculate scaled scores based on algorithm config
  function calculateScaledScores() {
    if (!algorithmConfig) return null;

    const groupedResults = groupBySection(results);
    const sectionScores: Record<string, number> = {};

    // Check scoring method
    if (algorithmConfig.scoring_method === 'raw_score') {
      // RAW SCORE: +1 correct, penalty for wrong/blank
      const penaltyBlank = parseFloat(algorithmConfig.penalty_for_blank || '0');

      // Helper function to get penalty for wrong answer
      const getPenaltyForWrong = (optionsCount?: number): number => {
        const penaltyConfig = algorithmConfig.penalty_for_wrong;

        // If no penalty configured, return 0
        if (!penaltyConfig) return 0;

        // If penalty is a simple number, return it
        if (typeof penaltyConfig === 'number') {
          return Math.abs(penaltyConfig);
        }

        // If penalty is a string (old format), parse it
        if (typeof penaltyConfig === 'string') {
          return Math.abs(parseFloat(penaltyConfig));
        }

        // If penalty is an object with option-based rules
        if (typeof penaltyConfig === 'object' && optionsCount !== undefined) {
          // Try exact match first (e.g., "3" for 3 options)
          const exactPenalty = penaltyConfig[String(optionsCount)];
          if (exactPenalty !== undefined) {
            return Math.abs(Number(exactPenalty));
          }

          // Use the penalty for the highest option count that's <= optionsCount
          const optionKeys = Object.keys(penaltyConfig)
            .filter(k => !isNaN(Number(k)))
            .map(Number)
            .sort((a, b) => a - b);

          for (let i = optionKeys.length - 1; i >= 0; i--) {
            if (optionKeys[i] <= optionsCount) {
              return Math.abs(Number(penaltyConfig[String(optionKeys[i])]));
            }
          }

          // If no match, use first available
          if (optionKeys.length > 0) {
            return Math.abs(Number(penaltyConfig[String(optionKeys[0])]));
          }
        }

        return 0;
      };

      // Helper to count options from question
      const countOptions = (question: Question): number => {
        const questionData = (question as any).question_data || {};
        const options = questionData.options || questionData.options_eng || {};

        // Count how many options exist (a, b, c, d, e, etc.)
        const optionKeys = Object.keys(options).filter(k => k.length === 1 && k >= 'a' && k <= 'z');
        return optionKeys.length;
      };

      let totalCorrect = 0;
      let totalWrong = 0;
      let totalBlank = 0;
      let totalQuestions = 0;
      let totalPenaltyPoints = 0;

      // Track penalties by option count
      const penaltyBreakdown: Record<number, { count: number; totalPenalty: number; penaltyPerQuestion: number }> = {};

      Object.keys(groupedResults).forEach(sectionName => {
        const sectionResults = groupedResults[sectionName];
        totalQuestions += sectionResults.length;

        let score = 0;
        let sectionCorrect = 0;
        let sectionWrong = 0;
        let sectionBlank = 0;

        sectionResults.forEach(r => {
          // Check if question has an actual answer (not null)
          const questionHasAnswer = hasActualAnswer(r);

          if (r.isCorrect) {
            score += 1;
            sectionCorrect++;
            totalCorrect++;
          } else if (questionHasAnswer && !r.isCorrect) {
            // Wrong answer (has answer but incorrect)
            const optionsCount = countOptions(r.question);
            const penalty = getPenaltyForWrong(optionsCount);
            score -= penalty; // Apply penalty (subtract because it's a deduction)
            totalPenaltyPoints += penalty;

            // Track penalty breakdown by option count
            if (!penaltyBreakdown[optionsCount]) {
              penaltyBreakdown[optionsCount] = {
                count: 0,
                totalPenalty: 0,
                penaltyPerQuestion: penalty
              };
            }
            penaltyBreakdown[optionsCount].count++;
            penaltyBreakdown[optionsCount].totalPenalty += penalty;

            sectionWrong++;
            totalWrong++;
          } else {
            // Blank (no answer or null answer)
            score += penaltyBlank; // Usually 0
            sectionBlank++;
            totalBlank++;
          }
        });

        sectionScores[sectionName] = parseFloat(score.toFixed(2));
      });

      // Total raw score
      const totalRawScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0);

      // Scale to 50 points (BOCCONI standard)
      const scaledTo50 = totalQuestions > 0 ? (totalRawScore / totalQuestions) * 50 : 0;

      return {
        sectionScores,
        totalScore: parseFloat(scaledTo50.toFixed(2)),
        displayName: algorithmConfig.display_name,
        rawScoreDetails: {
          correct: totalCorrect,
          correctPoints: totalCorrect * 1,
          wrong: totalWrong,
          wrongPoints: parseFloat((-totalPenaltyPoints).toFixed(2)), // Negative because it's a deduction
          blank: totalBlank,
          blankPoints: totalBlank * penaltyBlank,
          totalRawScore: parseFloat(totalRawScore.toFixed(2)),
          totalQuestions: totalQuestions,
          scaledTo50: parseFloat(scaledTo50.toFixed(2)),
          penaltyBreakdown: Object.keys(penaltyBreakdown).map(optCount => ({
            optionCount: parseInt(optCount),
            count: penaltyBreakdown[parseInt(optCount)].count,
            totalPenalty: parseFloat(penaltyBreakdown[parseInt(optCount)].totalPenalty.toFixed(2)),
            penaltyPerQuestion: parseFloat(penaltyBreakdown[parseInt(optCount)].penaltyPerQuestion.toFixed(2))
          }))
        }
      };
    } else {
      // IRT-BASED / SCALED SCORE: Use min/max ranges (GMAT style)
      Object.keys(groupedResults).forEach(sectionName => {
        const sectionResults = groupedResults[sectionName];
        const actualSectionCorrect = sectionResults.filter(r => r.isCorrect).length;
        const sectionTotal = sectionResults.length;

        const percentageCorrect = sectionTotal > 0 ? actualSectionCorrect / sectionTotal : 0;

        // Scale to section min/max range
        const scoreRange = algorithmConfig.section_score_max - algorithmConfig.section_score_min;
        const scaledScore = algorithmConfig.section_score_min + (percentageCorrect * scoreRange);

        // Round to nearest score increment
        const increment = algorithmConfig.score_increment || 1;
        sectionScores[sectionName] = Math.round(scaledScore / increment) * increment;
      });

      // Calculate total score as average of section scores
      const sectionScoreValues = Object.values(sectionScores);
      const avgSectionScore = sectionScoreValues.length > 0
        ? sectionScoreValues.reduce((sum, score) => sum + score, 0) / sectionScoreValues.length
        : 0;

      // Scale total score to total min/max range
      const totalScoreRange = algorithmConfig.total_score_max - algorithmConfig.total_score_min;
      const sectionRange = algorithmConfig.section_score_max - algorithmConfig.section_score_min;
      const normalizedScore = (avgSectionScore - algorithmConfig.section_score_min) / sectionRange;
      const totalScore = algorithmConfig.total_score_min + (normalizedScore * totalScoreRange);

      // Round to nearest score increment
      const increment = algorithmConfig.score_increment || 1;
      const finalTotalScore = Math.round(totalScore / increment) * increment;

      return {
        sectionScores,
        totalScore: finalTotalScore,
        displayName: algorithmConfig.display_name
      };
    }
  }

  // Helper function to check if a question was actually answered (not null)
  const hasActualAnswer = (result: TestResult): boolean => {
    if (!result.studentAnswer) return false;
    const answerData = result.studentAnswer.answer;
    if (!answerData) return false;

    // Check if answer is null or empty
    if (typeof answerData === 'object') {
      // Check for Data Insights questions with {answers: {...}}
      if (answerData.answers && typeof answerData.answers === 'object') {
        return Object.keys(answerData.answers).length > 0;
      }
      // Check for multiple choice questions with {answer: "..."}
      if (answerData.answer === null || answerData.answer === undefined) {
        return false;
      }
    }
    return true;
  };

  // Calculate total time from assignment start_time and completed_at
  const calculateTotalTime = (): number => {
    if (!assignment?.start_time || !assignment?.completed_at) {
      return 0;
    }
    const startTime = new Date(assignment.start_time).getTime();
    const completedTime = new Date(assignment.completed_at).getTime();
    return Math.floor((completedTime - startTime) / 1000); // Convert to seconds
  };

  // Calculate statistics
  const answeredResults = results.filter(r => hasActualAnswer(r));
  const unansweredResults = results.filter(r => !hasActualAnswer(r));

  const stats = {
    total: results.length,
    answered: answeredResults.length,
    correct: results.filter(r => r.isCorrect).length,
    wrong: results.filter(r => hasActualAnswer(r) && !r.isCorrect).length,
    unanswered: unansweredResults.length,
    flagged: results.filter(r => r.studentAnswer?.is_flagged).length,
    totalTime: calculateTotalTime(),
    score: results.length > 0 ? Math.round((results.filter(r => r.isCorrect).length / results.length) * 100) : 0,
  };

  // Get unique sections
  const sections = ['all', ...Array.from(new Set(results.map(r => r.question.section)))];
  const hasMultipleSections = sections.length > 2; // More than 'all' + one section

  // Filter results
  const filteredResults = results.filter(r => {
    if (filterSection !== 'all' && r.question.section !== filterSection) return false;

    if (filterCorrectness === 'correct' && !r.isCorrect) return false;
    if (filterCorrectness === 'wrong' && (r.isCorrect || !r.studentAnswer)) return false;
    if (filterCorrectness === 'unanswered' && r.studentAnswer) return false;

    return true;
  });

  if (loading) {
    return (
      <Layout pageTitle={t('testResults.title')} pageSubtitle={t('testResults.loading')}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FontAwesomeIcon icon={faClock} className="text-6xl text-brand-green animate-spin mb-4" />
            <p className="text-gray-600 text-lg">{t('testResults.loadingResults')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !assignment) {
    return (
      <Layout pageTitle={t('testResults.title')} pageSubtitle={t('testResults.error')}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md">
            <p className="text-red-700 font-medium">{error || t('testResults.assignmentNotFound')}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              {t('testResults.goBack')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      pageTitle={`Test Results - ${assignment['2V_profiles']?.name || 'Student'}`}
      pageSubtitle={`${assignment['2V_tests'].test_type} - Test #${assignment['2V_tests'].test_number}`}
    >
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-brand-dark hover:text-brand-green transition-colors font-medium flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {t('testResults.backToStudentTests')}
        </button>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
            <div className="text-2xl font-bold text-brand-dark">{stats.total}</div>
            <div className="text-sm text-gray-600">{t('testResults.totalQuestions')}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{stats.answered}</div>
            <div className="text-sm text-gray-600">{t('testResults.answered')}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.correct}</div>
            <div className="text-sm text-gray-600">{t('testResults.correct')}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.wrong}</div>
            <div className="text-sm text-gray-600">{t('testResults.wrong')}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{stats.unanswered}</div>
            <div className="text-sm text-gray-600">{t('testResults.unanswered')}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.flagged}</div>
            <div className="text-sm text-gray-600">{t('testResults.flagged')}</div>
          </div>
          <div className="bg-gradient-to-br from-brand-green to-green-600 rounded-xl shadow-md p-4 text-white">
            <div className="text-2xl font-bold">{stats.score}%</div>
            <div className="text-sm opacity-90">{t('testResults.score')}</div>
          </div>
        </div>

        {/* Time Management Analysis Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowTimeManagement(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faClock} className="text-2xl" />
            <div className="text-left">
              <div className="text-lg font-bold">Time Management Analysis</div>
              <div className="text-sm opacity-90">View pacing and time distribution</div>
            </div>
          </button>
        </div>

        {/* Score Report - Based on Algorithm Config */}
        {(() => {
          const scaledScores = calculateScaledScores();
          if (!scaledScores) return null;

          const groupedResults = groupBySection(results);

          return (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-purple-300">
              <button
                onClick={() => setShowScoreReport(!showScoreReport)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faChartBar} className="text-2xl text-purple-700" />
                  <div>
                    <h2 className="text-2xl font-bold text-purple-900">
                      {scaledScores.displayName} Score Report
                    </h2>
                    <p className="text-sm text-purple-700 mt-1">
                      Scaled scores based on {scaledScores.displayName} algorithm
                    </p>
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={showScoreReport ? faChevronUp : faChevronDown}
                  className="text-xl text-purple-700"
                />
              </button>

              {showScoreReport && (!isStudentView || resultsViewable) && (
                <div className="mt-6">
                  {algorithmConfig.scoring_method === 'raw_score' ? (
                    // BOCCONI: Only Total Score (centered)
                    <div className="flex justify-center">
                      <div className="bg-white rounded-lg px-6 py-4 border-2 border-purple-400 shadow-md max-w-md w-full">
                        <div className="text-sm text-purple-700 font-semibold">Total Score</div>
                        <div className="text-4xl font-bold text-purple-900 my-2">
                          {scaledScores.totalScore} / 50
                        </div>
                        {scaledScores.rawScoreDetails && (
                          <div className="mt-4 pt-4 border-t border-purple-200 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-green-700">✓ Correct ({scaledScores.rawScoreDetails.correct}):</span>
                              <span className="font-semibold text-green-700">+{scaledScores.rawScoreDetails.correctPoints}</span>
                            </div>

                            {/* Show penalty breakdown if available */}
                            {scaledScores.rawScoreDetails.penaltyBreakdown && scaledScores.rawScoreDetails.penaltyBreakdown.length > 0 ? (
                              <>
                                {scaledScores.rawScoreDetails.penaltyBreakdown
                                  .sort((a, b) => a.optionCount - b.optionCount)
                                  .map(pb => (
                                    <div key={pb.optionCount} className="flex justify-between text-sm">
                                      <span className="text-red-700">
                                        ✗ Wrong - {pb.optionCount} options ({pb.count}):
                                        <span className="text-xs ml-1">({pb.penaltyPerQuestion} each)</span>
                                      </span>
                                      <span className="font-semibold text-red-700">-{pb.totalPenalty}</span>
                                    </div>
                                  ))
                                }
                              </>
                            ) : (
                              <div className="flex justify-between text-sm">
                                <span className="text-red-700">✗ Wrong ({scaledScores.rawScoreDetails.wrong}):</span>
                                <span className="font-semibold text-red-700">{scaledScores.rawScoreDetails.wrongPoints}</span>
                              </div>
                            )}

                            {scaledScores.rawScoreDetails.blank > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">○ Blank ({scaledScores.rawScoreDetails.blank}):</span>
                                <span className="font-semibold text-gray-600">{scaledScores.rawScoreDetails.blankPoints}</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-purple-200 text-sm">
                              <span className="text-purple-700 font-semibold">Raw Total:</span>
                              <span className="font-bold text-purple-700">{scaledScores.rawScoreDetails.totalRawScore}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // GMAT: Side by side layout
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Total Score */}
                      <div className="bg-white rounded-lg px-6 py-4 border-2 border-purple-400 shadow-md h-fit">
                        <div className="text-sm text-purple-700 font-semibold">Total Score</div>
                        <div className="text-4xl font-bold text-purple-900 my-2">
                          {scaledScores.totalScore}
                        </div>
                        <div className="text-xs text-purple-600">
                          Range: {algorithmConfig.total_score_min}-{algorithmConfig.total_score_max}
                        </div>
                      </div>

                      {/* Right: Section Scores */}
                      <div className="space-y-3">
                        {Object.entries(scaledScores.sectionScores).map(([sectionName, score]) => {
                          const sectionResults = groupedResults[sectionName] || [];
                          const actualCorrect = sectionResults.filter(r => r.isCorrect).length;
                          const totalQuestions = sectionResults.length;

                          return (
                            <div key={sectionName} className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow">
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-purple-900">{sectionName}</div>
                                <div className="text-3xl font-bold text-purple-900">{score}</div>
                              </div>

                              {totalQuestions > 0 && (
                                <div className="text-sm text-purple-700 mt-2">
                                  {actualCorrect}/{totalQuestions} correct ({Math.round((actualCorrect / totalQuestions) * 100)}%)
                                </div>
                              )}

                              <div className="text-xs text-purple-600 mt-1">
                                Range: {algorithmConfig.section_score_min}-{algorithmConfig.section_score_max}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Results Visibility Control - Only shown for tutors */}
        {!isStudentView && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                resultsViewable ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <FontAwesomeIcon
                  icon={resultsViewable ? faEye : faEyeSlash}
                  className={`text-2xl ${resultsViewable ? 'text-green-600' : 'text-gray-500'}`}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-dark">
                  {resultsViewable ? t('testResults.resultsVisibleToStudent') : t('testResults.resultsHiddenFromStudent')}
                </h3>
                <p className="text-sm text-gray-600">
                  {resultsViewable
                    ? t('testResults.studentCanViewResults')
                    : t('testResults.studentCannotViewResults')}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {resultsViewable ? t('testResults.visible') : t('testResults.hidden')}
              </span>
              <button
                onClick={toggleResultsViewability}
                disabled={togglingViewability}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 ${
                  togglingViewability
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                } ${
                  resultsViewable ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    resultsViewable ? 'translate-x-9' : 'translate-x-1'
                  } flex items-center justify-center`}
                >
                  {togglingViewability ? (
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FontAwesomeIcon
                      icon={resultsViewable ? faLockOpen : faLock}
                      className={`text-xs ${resultsViewable ? 'text-green-600' : 'text-gray-500'}`}
                    />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className={`mt-4 p-3 rounded-lg ${
            resultsViewable ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            <p className={`text-sm ${resultsViewable ? 'text-green-700' : 'text-amber-700'}`}>
              {resultsViewable ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  {t('testResults.resultsVisibleMessage')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  {t('testResults.resultsHiddenMessage')}
                </>
              )}
            </p>
          </div>
        </div>
        )}

        {/* Attempt Comparison Section */}
        {assignment.total_attempts > 1 && attemptComparison.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-brand-green">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-brand-green" />
                <div>
                  <h2 className="text-xl font-bold text-brand-dark">{t('testResults.attemptComparison')}</h2>
                  <p className="text-sm text-gray-600">{t('testResults.viewImprovements', { count: assignment.total_attempts })}</p>
                </div>
              </div>
              <FontAwesomeIcon
                icon={showComparison ? faChevronUp : faChevronDown}
                className="text-xl text-gray-400"
              />
            </button>

            {showComparison && (
              <div className="mt-6 space-y-6">
                {/* Overall Progress Chart */}
                <div>
                  <h3 className="text-lg font-bold text-brand-dark mb-4">{t('testResults.scoreProgress')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attemptComparison.map((attempt, idx) => {
                      const prevAttempt = idx > 0 ? attemptComparison[idx - 1] : null;
                      const scoreDiff = prevAttempt ? attempt.score - prevAttempt.score : 0;
                      const timeDiff = prevAttempt ? attempt.avgTimePerQuestion - prevAttempt.avgTimePerQuestion : 0;

                      return (
                        <div
                          key={attempt.attemptNumber}
                          className={`p-4 rounded-lg border-2 ${
                            attempt.attemptNumber === selectedAttempt
                              ? 'border-brand-green bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-700">
                              {t('testResults.attempt')} {attempt.attemptNumber}
                            </span>
                            {attempt.attemptNumber === selectedAttempt && (
                              <span className="text-xs bg-brand-green text-white px-2 py-1 rounded">
                                {t('testResults.current')}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            {/* Score */}
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-brand-dark">{attempt.score}%</span>
                              {prevAttempt && scoreDiff !== 0 && (
                                <div className={`flex items-center gap-1 text-sm font-semibold ${
                                  scoreDiff > 0 ? 'text-green-600' : scoreDiff < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  <FontAwesomeIcon
                                    icon={scoreDiff > 0 ? faArrowUp : scoreDiff < 0 ? faArrowDown : faMinus}
                                  />
                                  {Math.abs(scoreDiff)}%
                                </div>
                              )}
                            </div>

                            {/* Correct/Wrong/Unanswered */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center p-2 bg-green-100 rounded">
                                <div className="font-bold text-green-700">{attempt.correct}</div>
                                <div className="text-green-600">{t('testResults.correct')}</div>
                              </div>
                              <div className="text-center p-2 bg-red-100 rounded">
                                <div className="font-bold text-red-700">{attempt.wrong}</div>
                                <div className="text-red-600">{t('testResults.wrong')}</div>
                              </div>
                              <div className="text-center p-2 bg-gray-100 rounded">
                                <div className="font-bold text-gray-700">{attempt.unanswered}</div>
                                <div className="text-gray-600">{t('testResults.skipped')}</div>
                              </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-center justify-between text-xs pt-2 border-t">
                              <span className="text-gray-600 flex items-center gap-1">
                                <FontAwesomeIcon icon={faClock} />
                                {t('testResults.avgTime')}: {attempt.avgTimePerQuestion}s
                              </span>
                              {prevAttempt && timeDiff !== 0 && (
                                <div className={`flex items-center gap-1 font-semibold ${
                                  timeDiff < 0 ? 'text-green-600' : timeDiff > 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  <FontAwesomeIcon
                                    icon={timeDiff < 0 ? faArrowDown : timeDiff > 0 ? faArrowUp : faMinus}
                                  />
                                  {Math.abs(timeDiff)}s
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section-by-Section Comparison */}
                <div>
                  <h3 className="text-lg font-bold text-brand-dark mb-4">{t('testResults.sectionPerformance')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('testResults.section')}</th>
                          {attemptComparison.map(attempt => (
                            <th key={attempt.attemptNumber} className="text-center py-3 px-4 font-semibold text-gray-700">
                              {t('testResults.attempt')} {attempt.attemptNumber}
                            </th>
                          ))}
                          <th className="text-center py-3 px-4 font-semibold text-green-700">{t('testResults.improvement')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(attemptComparison[0]?.sectionStats || {}).map(section => (
                          <tr key={section} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-800">{section}</td>
                            {attemptComparison.map(attempt => {
                              const sectionStat = attempt.sectionStats[section];
                              const accuracy = sectionStat
                                ? Math.round((sectionStat.correct / sectionStat.total) * 100)
                                : 0;
                              return (
                                <td key={attempt.attemptNumber} className="text-center py-3 px-4">
                                  <div className="font-semibold text-brand-dark">{accuracy}%</div>
                                  <div className="text-xs text-gray-500">
                                    {sectionStat?.correct}/{sectionStat?.total}
                                  </div>
                                  <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <FontAwesomeIcon icon={faClock} />
                                    {sectionStat ? Math.round(sectionStat.time / 60) : 0}m
                                  </div>
                                </td>
                              );
                            })}
                            <td className="text-center py-3 px-4">
                              {(() => {
                                const firstAttempt = attemptComparison[0].sectionStats[section];
                                const lastAttempt = attemptComparison[attemptComparison.length - 1].sectionStats[section];
                                const firstAccuracy = firstAttempt
                                  ? Math.round((firstAttempt.correct / firstAttempt.total) * 100)
                                  : 0;
                                const lastAccuracy = lastAttempt
                                  ? Math.round((lastAttempt.correct / lastAttempt.total) * 100)
                                  : 0;
                                const diff = lastAccuracy - firstAccuracy;

                                return diff !== 0 ? (
                                  <div className={`flex items-center justify-center gap-1 font-semibold ${
                                    diff > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    <FontAwesomeIcon icon={diff > 0 ? faArrowUp : faArrowDown} />
                                    {Math.abs(diff)}%
                                  </div>
                                ) : (
                                  <div className="text-gray-400">-</div>
                                );
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrophy} />
                    {t('testResults.keyInsights')}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    {(() => {
                      const firstAttempt = attemptComparison[0];
                      const lastAttempt = attemptComparison[attemptComparison.length - 1];
                      const scoreImprovement = lastAttempt.score - firstAttempt.score;
                      const timeImprovement = firstAttempt.avgTimePerQuestion - lastAttempt.avgTimePerQuestion;
                      const bestAttempt = [...attemptComparison].sort((a, b) => b.score - a.score)[0];

                      return (
                        <>
                          <div className="bg-white rounded p-3 border border-blue-100">
                            <div className="text-blue-700 font-semibold mb-1">{t('testResults.overallScoreChange')}</div>
                            <div className={`text-xl font-bold ${
                              scoreImprovement > 0 ? 'text-green-600' : scoreImprovement < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {scoreImprovement > 0 ? '+' : ''}{scoreImprovement}%
                            </div>
                            <div className="text-xs text-gray-600">
                              {t('testResults.fromTo', { from: firstAttempt.score, to: lastAttempt.score })}
                            </div>
                          </div>
                          <div className="bg-white rounded p-3 border border-blue-100">
                            <div className="text-blue-700 font-semibold mb-1">{t('testResults.timeEfficiency')}</div>
                            <div className={`text-xl font-bold ${
                              timeImprovement > 0 ? 'text-green-600' : timeImprovement < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {timeImprovement > 0 ? '-' : '+'}{Math.abs(timeImprovement)}s
                            </div>
                            <div className="text-xs text-gray-600">
                              {t('testResults.avgTimePerQuestion')}
                            </div>
                          </div>
                          <div className="bg-white rounded p-3 border border-blue-100">
                            <div className="text-blue-700 font-semibold mb-1">{t('testResults.bestPerformance')}</div>
                            <div className="text-xl font-bold text-brand-green">
                              {t('testResults.attempt')} {bestAttempt.attemptNumber}
                            </div>
                            <div className="text-xs text-gray-600">
                              {bestAttempt.score}% {t('testResults.accuracy')}
                            </div>
                          </div>
                          <div className="bg-white rounded p-3 border border-blue-100">
                            <div className="text-blue-700 font-semibold mb-1">{t('testResults.completionRate')}</div>
                            <div className="text-xl font-bold text-brand-dark">
                              {lastAttempt.total - lastAttempt.unanswered}/{lastAttempt.total}
                            </div>
                            <div className="text-xs text-gray-600">
                              {t('testResults.questionsAnswered')}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Section Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('testResults.filterSection')}</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green outline-none"
              >
                {sections.map(section => (
                  <option key={section} value={section}>
                    {section === 'all' ? t('testResults.allSections') : section}
                  </option>
                ))}
              </select>
            </div>

            {/* Correctness Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('testResults.show')}</label>
              <select
                value={filterCorrectness}
                onChange={(e) => setFilterCorrectness(e.target.value as any)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green outline-none"
              >
                <option value="all">{t('testResults.allQuestions')}</option>
                <option value="correct">{t('testResults.correctOnly')}</option>
                <option value="wrong">{t('testResults.wrongOnly')}</option>
                <option value="unanswered">{t('testResults.unansweredOnly')}</option>
              </select>
            </div>

            {/* Attempt Selector */}
            {assignment.total_attempts > 1 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('testResults.attempt')}</label>
                <select
                  value={selectedAttempt || ''}
                  onChange={(e) => setSelectedAttempt(Number(e.target.value))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green outline-none"
                >
                  {Array.from({ length: assignment.total_attempts }, (_, i) => i + 1).map(num => (
                    <option
                      key={num}
                      value={num}
                      disabled={!attemptsWithAnswers.has(num)}
                      className={!attemptsWithAnswers.has(num) ? 'text-gray-400' : ''}
                    >
                      {t('testResults.attempt')} {num}{!attemptsWithAnswers.has(num) ? ` (${t('testResults.noData')})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Questions List - Grouped by Section */}
        <div className="space-y-6">
          {(() => {
            const groupedResults = groupBySection(filteredResults);
            // Sort sections by the order (created_at) of the first question in each section
            const sections = Object.keys(groupedResults).sort((a, b) => {
              const firstQuestionA = groupedResults[a][0];
              const firstQuestionB = groupedResults[b][0];
              return (firstQuestionA?.order || 0) - (firstQuestionB?.order || 0);
            });

            return sections.map(sectionName => {
              // Calculate section statistics
              const sectionQuestions = groupedResults[sectionName];
              // For single-section tests, use total time; otherwise sum individual answer times
              const sectionTime = sections.length === 1
                ? calculateTotalTime()
                : sectionQuestions.reduce((sum, r) => sum + (r.studentAnswer?.time_spent_seconds || 0), 0);
              const sectionCorrect = sectionQuestions.filter(r => r.isCorrect).length;
              const sectionAnswered = sectionQuestions.filter(r => hasActualAnswer(r)).length;
              const formatTime = (seconds: number) => {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
              };

              return (
                <div key={sectionName} className="space-y-4">
                  {/* Section Header with Stats */}
                  <div className="bg-gradient-to-r from-brand-green to-green-600 text-white px-6 py-4 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{sectionName}</h3>
                        <p className="text-sm opacity-90">{sectionQuestions.length} {t('testResults.questions')}</p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{sectionCorrect}/{sectionQuestions.length}</div>
                          <div className="opacity-90">{t('testResults.correct')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{sectionAnswered}/{sectionQuestions.length}</div>
                          <div className="opacity-90">{t('testResults.answered')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatTime(sectionTime)}</div>
                          <div className="opacity-90">{t('testResults.totalTime')}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Questions in this section */}
                {groupedResults[sectionName].map((result, index) => (
                  <div
                    key={result.studentAnswer?.id || `q-${result.question.id}-${result.order}`}
                    className={`bg-white rounded-xl shadow-md border-2 ${
                      result.isCorrect ? 'border-green-200 bg-green-50/30' :
                      result.studentAnswer && !result.isCorrect ? 'border-red-200 bg-red-50/30' :
                      !result.studentAnswer ? 'border-purple-200 bg-purple-50/20' :
                      'border-gray-200'
                    }`}
                  >
                    {/* Question Metadata Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          result.isCorrect ? 'bg-green-600' :
                          result.studentAnswer && !result.isCorrect ? 'bg-red-600' :
                          !result.studentAnswer ? 'bg-purple-600' :
                          'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {result.question.materia && (
                            <span className="text-sm text-gray-700 font-medium">
                              {result.question.materia}
                            </span>
                          )}
                          {!result.studentAnswer ? (
                            <FontAwesomeIcon icon={faEyeSlash} className="text-purple-600 text-lg" title="Never Viewed" />
                          ) : !hasActualAnswer(result) ? (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold">
                              Not Answered
                            </span>
                          ) : null}
                          {result.studentAnswer?.is_flagged && (
                            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                              <FontAwesomeIcon icon={faFlag} /> {t('testResults.flagged')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {result.studentAnswer?.time_spent_seconds !== undefined && result.studentAnswer.time_spent_seconds > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                            <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                            <span className="font-medium">
                              {(() => {
                                const seconds = result.studentAnswer.time_spent_seconds;
                                const mins = Math.floor(seconds / 60);
                                const secs = seconds % 60;
                                return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                              })()}
                            </span>
                          </div>
                        )}
                        {result.isCorrect && (
                          <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-600" />
                        )}
                        {result.studentAnswer && !result.isCorrect && (
                          <FontAwesomeIcon icon={faTimesCircle} className="text-2xl text-red-600" />
                        )}
                      </div>
                    </div>

                    {/* Question Component - renders the actual question as it appeared in the test */}
                    <div className="p-6 relative pb-12">
                      {renderQuestionComponent(result)}
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {t(`testResults.questionTypes.${result.question.question_type}`, result.question.question_type)}
                      </div>
                    </div>

                    {/* Tutor Feedback Section - Only editable for tutors */}
                    {!isStudentView ? (
                      <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                        <div className="text-sm font-semibold text-gray-600 mb-2">{t('testResults.tutorNotes')}</div>
                        <textarea
                          placeholder={t('testResults.addFeedback')}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-brand-green outline-none resize-none"
                          rows={2}
                          defaultValue={result.studentAnswer?.tutor_feedback || ''}
                        />
                      </div>
                    ) : (
                      result.studentAnswer?.tutor_feedback && (
                        <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                          <div className="text-sm font-semibold text-gray-600 mb-2">{t('testResults.tutorNotes')}</div>
                          <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700">
                            {result.studentAnswer.tutor_feedback}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            );
          });
        })()}
        </div>

        {filteredResults.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">{t('testResults.noMatchingQuestions')}</p>
          </div>
        )}

        {/* Time Management Modal */}
        {showTimeManagement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowTimeManagement(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faClock} className="text-3xl" />
                  <div>
                    <h2 className="text-2xl font-bold">Time Management Analysis</h2>
                    <p className="text-sm opacity-90">Pacing analysis and recommendations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTimeManagement(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {(() => {
                  // Calculate expected time per question based on test config
                  const testType = assignment?.['2V_tests']?.test_type;
                  const totalTestTime = stats.totalTime;
                  const totalQuestions = results.length;
                  const averageTimePerQuestion = totalQuestions > 0 ? totalTestTime / totalQuestions : 0;

                  // Define expected time ranges based on test type
                  const getExpectedTimeRange = (testType: string) => {
                    switch (testType) {
                      case 'GMAT':
                        return { min: 90, ideal: 120, max: 150 }; // 1.5-2.5 min per question
                      case 'SAT':
                        return { min: 45, ideal: 75, max: 105 }; // 45s-1.75min
                      case 'BOCCONI':
                      case 'CATTOLICA':
                        return { min: 30, ideal: 60, max: 90 }; // 30s-1.5min
                      default:
                        return { min: averageTimePerQuestion * 0.7, ideal: averageTimePerQuestion, max: averageTimePerQuestion * 1.3 };
                    }
                  };

                  const expectedRange = getExpectedTimeRange(testType);

                  // Categorize questions by pacing
                  const tooFast = results.filter(r => r.studentAnswer && r.studentAnswer.time_spent_seconds < expectedRange.min);
                  const optimal = results.filter(r => r.studentAnswer && r.studentAnswer.time_spent_seconds >= expectedRange.min && r.studentAnswer.time_spent_seconds <= expectedRange.max);
                  const tooSlow = results.filter(r => r.studentAnswer && r.studentAnswer.time_spent_seconds > expectedRange.max);
                  const notViewed = results.filter(r => !r.studentAnswer);

                  // Calculate pacing score (0-100)
                  const pacingScore = Math.round((optimal.length / Math.max(1, results.length - notViewed.length)) * 100);

                  // Section-wise analysis
                  const sectionAnalysis = (() => {
                    const grouped = groupBySection(results);
                    return Object.entries(grouped).map(([section, questions]) => {
                      const sectionTotal = questions.reduce((sum, q) => sum + (q.studentAnswer?.time_spent_seconds || 0), 0);
                      const sectionAvg = sectionTotal / questions.length;
                      return { section, total: sectionTotal, average: sectionAvg, count: questions.length };
                    });
                  })();

                  return (
                    <>
                      {/* Overall Pacing Score */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-blue-900 mb-2">Overall Pacing Score</h3>
                            <p className="text-sm text-blue-700">Percentage of questions answered at optimal pace</p>
                          </div>
                          <div className={`text-6xl font-bold ${
                            pacingScore >= 70 ? 'text-green-600' :
                            pacingScore >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {pacingScore}
                          </div>
                        </div>
                      </div>

                      {/* Pacing Distribution */}
                      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FontAwesomeIcon icon={faChartBar} className="text-blue-600" />
                          Pacing Distribution
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                            <div className="text-3xl font-bold text-red-600">{tooFast.length}</div>
                            <div className="text-sm text-red-700 font-medium mt-1">Too Fast</div>
                            <div className="text-xs text-gray-600 mt-1">&lt; {Math.floor(expectedRange.min)}s</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                            <div className="text-3xl font-bold text-green-600">{optimal.length}</div>
                            <div className="text-sm text-green-700 font-medium mt-1">Optimal</div>
                            <div className="text-xs text-gray-600 mt-1">{Math.floor(expectedRange.min)}-{Math.floor(expectedRange.max)}s</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                            <div className="text-3xl font-bold text-orange-600">{tooSlow.length}</div>
                            <div className="text-sm text-orange-700 font-medium mt-1">Too Slow</div>
                            <div className="text-xs text-gray-600 mt-1">&gt; {Math.floor(expectedRange.max)}s</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                            <div className="text-3xl font-bold text-purple-600">{notViewed.length}</div>
                            <div className="text-sm text-purple-700 font-medium mt-1">Not Viewed</div>
                            <div className="text-xs text-gray-600 mt-1">0s</div>
                          </div>
                        </div>
                      </div>

                      {/* Section Analysis */}
                      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FontAwesomeIcon icon={faChartLine} className="text-indigo-600" />
                          Time by Section
                        </h3>
                        <div className="space-y-3">
                          {sectionAnalysis.map(({ section, total, average, count }) => (
                            <div key={section} className="flex items-center gap-4">
                              <div className="w-32 text-sm font-medium text-gray-700 truncate">{section}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-end pr-2"
                                      style={{ width: `${Math.min(100, (total / stats.totalTime) * 100)}%` }}
                                    >
                                      <span className="text-xs font-bold text-white">
                                        {Math.floor(total / 60)}m {total % 60}s
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-24 text-sm text-gray-600">
                                    ~{Math.floor(average)}s/q
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Question-by-Question Breakdown */}
                      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Question-by-Question Analysis</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {results.map((result, idx) => {
                            const timeSpent = result.studentAnswer?.time_spent_seconds || 0;
                            const status = !result.studentAnswer ? 'not-viewed' :
                                          timeSpent < expectedRange.min ? 'too-fast' :
                                          timeSpent > expectedRange.max ? 'too-slow' :
                                          'optimal';
                            const statusColor = {
                              'not-viewed': 'bg-purple-50 border-purple-200',
                              'too-fast': 'bg-red-50 border-red-200',
                              'optimal': 'bg-green-50 border-green-200',
                              'too-slow': 'bg-orange-50 border-orange-200'
                            }[status];

                            return (
                              <div key={idx} className={`flex items-center gap-4 p-3 rounded-lg border-2 ${statusColor}`}>
                                <div className="w-16 text-sm font-bold text-gray-700">Q{idx + 1}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          status === 'too-fast' ? 'bg-red-500' :
                                          status === 'optimal' ? 'bg-green-500' :
                                          status === 'too-slow' ? 'bg-orange-500' :
                                          'bg-purple-500'
                                        }`}
                                        style={{ width: `${Math.min(100, (timeSpent / (expectedRange.max * 2)) * 100)}%` }}
                                      />
                                    </div>
                                    <div className="w-20 text-sm font-medium text-gray-700">
                                      {timeSpent > 0 ? `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}` : '-'}
                                    </div>
                                  </div>
                                </div>
                                <div className="w-24 text-xs text-gray-600">
                                  {result.question.section}
                                </div>
                                {result.isCorrect && <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />}
                                {result.studentAnswer && !result.isCorrect && <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-300">
                        <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                          <FontAwesomeIcon icon={faBolt} className="text-yellow-600" />
                          Recommendations
                        </h3>
                        <div className="space-y-3 text-sm">
                          {tooFast.length > totalQuestions * 0.3 && (
                            <div className="flex gap-3 bg-white rounded-lg p-4 border border-yellow-200">
                              <div className="text-red-600 text-xl">⚠️</div>
                              <div>
                                <div className="font-bold text-red-700">Rushing detected</div>
                                <div className="text-gray-700 mt-1">
                                  You answered {tooFast.length} questions too quickly. Take more time to read carefully and avoid careless mistakes.
                                </div>
                              </div>
                            </div>
                          )}
                          {tooSlow.length > totalQuestions * 0.3 && (
                            <div className="flex gap-3 bg-white rounded-lg p-4 border border-yellow-200">
                              <div className="text-orange-600 text-xl">⏱️</div>
                              <div>
                                <div className="font-bold text-orange-700">Pacing issues</div>
                                <div className="text-gray-700 mt-1">
                                  You spent too long on {tooSlow.length} questions. Practice identifying questions to skip and come back to later.
                                </div>
                              </div>
                            </div>
                          )}
                          {pacingScore >= 70 && (
                            <div className="flex gap-3 bg-white rounded-lg p-4 border border-green-200">
                              <div className="text-green-600 text-xl">✅</div>
                              <div>
                                <div className="font-bold text-green-700">Excellent pacing!</div>
                                <div className="text-gray-700 mt-1">
                                  You maintained good time management on {optimal.length} questions. Keep up this balanced approach.
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-3 bg-white rounded-lg p-4 border border-blue-200">
                            <div className="text-blue-600 text-xl">💡</div>
                            <div>
                              <div className="font-bold text-blue-700">Target pace</div>
                              <div className="text-gray-700 mt-1">
                                Aim for {Math.floor(expectedRange.ideal / 60)}:{(expectedRange.ideal % 60).toString().padStart(2, '0')} per question
                                on average ({Math.floor(expectedRange.min)}-{Math.floor(expectedRange.max)} seconds range).
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
