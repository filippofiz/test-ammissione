/**
 * Test Results Page - Tutor view of student answers
 * Shows detailed analysis of student's test attempt with answers, corrections, etc.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface Question {
  id: string;
  section: string;
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
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<number>(1);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterCorrectness, setFilterCorrectness] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [attemptComparison, setAttemptComparison] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [resultsViewable, setResultsViewable] = useState(false);
  const [togglingViewability, setTogglingViewability] = useState(false);

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

      // Combine data
      const fullAssignmentData = {
        ...assignmentData,
        '2V_profiles': studentData
      };

      setAssignment(fullAssignmentData);
      setResultsViewable(assignmentData.results_viewable_by_student || false);

      // Set selected attempt to the latest completed attempt
      if (assignmentData.current_attempt && !selectedAttempt) {
        setSelectedAttempt(assignmentData.current_attempt);
      }

      // NEW APPROACH: Load questions directly from answers table ordered by created_at
      // This is more reliable than JSONB order which has race conditions
      console.log('📊 Loading questions from answers table (ordered by created_at)...');

      const { data: answers, error: answersError } = await supabase
        .from('2V_student_answers')
        .select('question_id, created_at')
        .eq('assignment_id', assignmentId)
        .eq('attempt_number', selectedAttempt)
        .order('created_at', { ascending: true }); // Order by when answer was FIRST created

      if (answersError) throw answersError;

      if (!answers || answers.length === 0) {
        throw new Error('No answers found for this attempt.');
      }

      console.log(`📊 Found ${answers.length} answers for this attempt`);

      // Get question details maintaining the order from answers
      // Use a Set to track seen question_ids and filter out duplicates
      const seenQuestionIds = new Set<string>();
      const uniqueAnswers = answers.filter(a => {
        if (seenQuestionIds.has(a.question_id)) {
          console.warn(`⚠️  Duplicate question_id found in answers: ${a.question_id}`);
          return false;
        }
        seenQuestionIds.add(a.question_id);
        return true;
      });

      const questionIds = uniqueAnswers.map(a => a.question_id);
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('*')
        .in('id', questionIds);

      if (questionsError) throw questionsError;

      console.log(`📊 Loaded ${questionsData?.length || 0} questions from database`);

      // Create a map for quick lookup
      const questionMap = new Map(questionsData?.map(q => [q.id, q]) || []);

      // Order questions according to answer creation time (= order presented/answered)
      const questions: Question[] = questionIds
        .map(id => questionMap.get(id))
        .filter((q: any) => q !== undefined);

      console.log(`📊 Final questions list: ${questions.length} questions in correct order`);

      // Get completion_details for metadata (difficulty, etc.) if available
      const completionDetails = assignmentData.completion_details || { attempts: [] };
      const attemptRecord = completionDetails.attempts?.find(
        (a: any) => a.attempt_number === selectedAttempt
      );

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
      const { data: fullAnswers, error: fullAnswersError } = await supabase
        .from('2V_student_answers')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('attempt_number', selectedAttempt);

      if (fullAnswersError) throw fullAnswersError;

      // Create answer lookup
      const answerMap = new Map(fullAnswers?.map(a => [a.question_id, a]) || []);

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
      console.error('Error loading test results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load test results');
    } finally {
      setLoading(false);
    }
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
      console.log('🔍 GI Check:', { student: studentGI, correct: correctAns, match1, match2 });
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
      console.log('🔍 TA Check:', { student: studentTA, correct: correctTA, result });
      return result;
    }

    // TPA (Two-Part Analysis) - student: {part1, part2}, correct: [{col1: "...", col2: "..."}]
    if (diType === 'TPA' && studentAns.answers) {
      const correctTPA = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
      const studentTPA = studentAns.answers;
      const match1 = String(studentTPA.part1 || '').trim() === String(correctTPA.col1 || '').trim();
      const match2 = String(studentTPA.part2 || '').trim() === String(correctTPA.col2 || '').trim();
      console.log('🔍 TPA Check:', { student: studentTPA, correct: correctTPA, match1, match2 });
      return match1 && match2;
    }

    // MSR (Multi-Source Reasoning) - array of answers
    if (diType === 'MSR' && studentAns.answers && Array.isArray(correctAns)) {
      const studentMSR = Array.isArray(studentAns.answers) ? studentAns.answers : [];
      if (studentMSR.length !== correctAns.length) {
        console.log('🔍 MSR Check - Length mismatch:', { studentLen: studentMSR.length, correctLen: correctAns.length });
        return false;
      }
      const result = studentMSR.every((ans: any, idx: number) =>
        String(ans || '').toLowerCase() === String(correctAns[idx] || '').toLowerCase()
      );
      console.log('🔍 MSR Check:', { student: studentMSR, correct: correctAns, result });
      return result;
    }

    // DS (Data Sufficiency) - simple string answer
    if (diType === 'DS') {
      const studentDS = typeof studentAns === 'string' ? studentAns : studentAns.answer;
      const correctDS = Array.isArray(correctAns) ? correctAns[0] : correctAns;
      const result = String(studentDS || '').toUpperCase() === String(correctDS || '').toUpperCase();
      console.log('🔍 DS Check:', { student: studentDS, correct: correctDS, result });
      return result;
    }

    // Multiple Choice - student: {answer: "e"} or "e", correct: "e"
    if (question.question_type === 'multiple_choice') {
      const studentMC = studentAns.answer || studentAns;
      const correctMC = typeof correctAns === 'string' ? correctAns : correctAns;
      const result = String(studentMC || '').toLowerCase() === String(correctMC || '').toLowerCase();
      console.log('🔍 MC Check:', { student: studentMC, correct: correctMC, result });
      return result;
    }

    // Simple answer comparison (for backward compatibility)
    if (studentAns.answer && correctAns.answer) {
      return studentAns.answer === correctAns.answer;
    }

    // Multiple answers comparison (for backward compatibility)
    if (studentAns.answers && correctAns.answers) {
      const studentAnswers = Array.isArray(studentAns.answers) ? studentAns.answers : [];
      const correctAnswers = Array.isArray(correctAns.answers) ? correctAns.answers : [];

      if (studentAnswers.length !== correctAnswers.length) return false;

      return studentAnswers.every((ans: any, idx: number) => ans === correctAnswers[idx]);
    }

    return false;
  }

  async function loadAttemptComparison() {
    try {
      if (!assignment || assignment.total_attempts <= 1) return;

      const attempts = [];

      // Load all answers for all attempts
      for (let attemptNum = 1; attemptNum <= assignment.total_attempts; attemptNum++) {
        // NEW APPROACH: Load answers ordered by created_at (reliable ordering)
        const { data: answersWithQuestionIds, error: answersListError } = await supabase
          .from('2V_student_answers')
          .select('question_id, created_at')
          .eq('assignment_id', assignmentId)
          .eq('attempt_number', attemptNum)
          .order('created_at', { ascending: true });

        if (answersListError) throw answersListError;

        if (!answersWithQuestionIds || answersWithQuestionIds.length === 0) {
          console.warn(`No answers found for attempt ${attemptNum}, skipping`);
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

        // Load full answers for this attempt
        const { data: answers, error: answersError } = await supabase
          .from('2V_student_answers')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('attempt_number', attemptNum);

        if (answersError) throw answersError;

        // Calculate stats for this attempt
        const answerMap = new Map(answers?.map(a => [a.question_id, a]) || []);
        let correct = 0;
        let wrong = 0;
        let unanswered = 0;
        let totalTime = 0;
        const sectionStats: Record<string, { correct: number; total: number; time: number }> = {};

        questions.forEach((question: Question) => {
          const studentAnswer = answerMap.get(question.id);
          const isCorrect = checkIfCorrect(question, studentAnswer || null);

          if (!studentAnswer) {
            unanswered++;
          } else if (isCorrect) {
            correct++;
          } else {
            wrong++;
          }

          if (studentAnswer) {
            totalTime += studentAnswer.time_spent_seconds || 0;
          }

          // Section stats
          if (!sectionStats[question.section]) {
            sectionStats[question.section] = { correct: 0, total: 0, time: 0 };
          }
          sectionStats[question.section].total++;
          if (isCorrect) sectionStats[question.section].correct++;
          if (studentAnswer) sectionStats[question.section].time += studentAnswer.time_spent_seconds || 0;
        });

        attempts.push({
          attemptNumber: attemptNum,
          correct,
          wrong,
          unanswered,
          total: questions.length,
          score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
          totalTime,
          avgTimePerQuestion: answers && answers.length > 0 ? Math.round(totalTime / answers.length) : 0,
          sectionStats,
        });
      }

      setAttemptComparison(attempts);
    } catch (err) {
      console.error('Error loading attempt comparison:', err);
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
        console.error('Error toggling results viewability:', error);
        alert('Failed to update results viewability. Please try again.');
        return;
      }

      setResultsViewable(newValue);
      console.log(`✅ Results viewability toggled to: ${newValue}`);
    } catch (err) {
      console.error('Error toggling results viewability:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setTogglingViewability(false);
    }
  }

  function formatAnswer(answer: any): string {
    if (!answer) return 'No answer';

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

      console.log(`🔍 DS Question ID: ${question.id}`, {
        fullStudentAnswer: studentAnswer,
        answerField: dsAnswer,
        extractedAnswer,
        answersData,
        correctAnswerData,
        problem: questionData.problem?.substring(0, 50) + '...'
      });

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

      console.log('🔍 MSR correct_answer:', correctAnswerData);
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

      console.log('🔍 Multiple Choice correct_answer:', correctAnswerData);
      // Multiple Choice correct answers are stored as a string: "b"
      const correctMCAnswer = typeof correctAnswerData === 'string' ? correctAnswerData : correctAnswerData;

      component = (
        <MultipleChoiceQuestion
          questionText={questionData.question_text || question.question_text || ''}
          imageUrl={questionData.image_url || question.image_url}
          options={questionData.options}
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
      component = (
          <div className="space-y-4">
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
              {question.question_text ? (
                <div className="text-gray-800 text-lg whitespace-pre-wrap">
                  {question.question_text}
                </div>
              ) : (
                <div className="text-gray-400 italic">
                  {t('testResults.noQuestionText')} (Question Type: {question.question_type})
                </div>
              )}
              {question.image_url && (
                <img src={question.image_url} alt="Question" className="mt-4 max-w-full rounded" />
              )}
            </div>

            {/* Answer Display with color coding */}
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Answer:</div>
              <div className="p-4 rounded-lg bg-gray-50 border-2 border-gray-200 space-y-2">
                {studentAnswer ? (
                  result.isCorrect ? (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                      <span className="font-semibold text-green-700">{formatAnswer(studentAnswer.answer)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                        <span className="text-sm text-gray-600">Your answer:</span>
                        <span className="font-semibold text-red-700">{formatAnswer(studentAnswer.answer)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                        <span className="text-sm text-gray-600">Correct answer:</span>
                        <span className="font-semibold text-green-700">
                          {question.correct_answer ? formatAnswer(question.correct_answer) : 'No answer provided'}
                        </span>
                      </div>
                    </>
                  )
                ) : (
                  <div className="text-gray-500 italic">No answer provided</div>
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

  // Calculate statistics
  const stats = {
    total: results.length,
    answered: results.filter(r => r.studentAnswer).length,
    correct: results.filter(r => r.isCorrect).length,
    wrong: results.filter(r => r.studentAnswer && !r.isCorrect).length,
    unanswered: results.filter(r => !r.studentAnswer).length,
    flagged: results.filter(r => r.studentAnswer?.is_flagged).length,
    totalTime: results.reduce((sum, r) => sum + (r.studentAnswer?.time_spent_seconds || 0), 0),
    score: results.length > 0 ? Math.round((results.filter(r => r.isCorrect).length / results.length) * 100) : 0,
  };

  // Get unique sections
  const sections = ['all', ...Array.from(new Set(results.map(r => r.question.section)))];

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

        {/* Results Visibility Control */}
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
                  {resultsViewable ? 'Results Visible to Student' : 'Results Hidden from Student'}
                </h3>
                <p className="text-sm text-gray-600">
                  {resultsViewable
                    ? 'Student can view detailed test results and answers'
                    : 'Student cannot view results until you enable visibility'}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {resultsViewable ? 'Visible' : 'Hidden'}
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
                  Students can now see their answers, correct answers, and performance statistics for this test.
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  Enable visibility after reviewing corrections with the student. They will be able to see detailed results once enabled.
                </>
              )}
            </p>
          </div>
        </div>

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
                  value={selectedAttempt}
                  onChange={(e) => setSelectedAttempt(Number(e.target.value))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green outline-none"
                >
                  {Array.from({ length: assignment.total_attempts }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{t('testResults.attempt')} {num}</option>
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
            const sections = Object.keys(groupedResults).sort();

            return sections.map(sectionName => {
              // Calculate section statistics
              const sectionQuestions = groupedResults[sectionName];
              const sectionTime = sectionQuestions.reduce((sum, r) => sum + (r.studentAnswer?.time_spent_seconds || 0), 0);
              const sectionCorrect = sectionQuestions.filter(r => r.isCorrect).length;
              const sectionAnswered = sectionQuestions.filter(r => r.studentAnswer).length;
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
                      'border-gray-200'
                    }`}
                  >
                    {/* Question Metadata Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          result.isCorrect ? 'bg-green-600' :
                          result.studentAnswer && !result.isCorrect ? 'bg-red-600' :
                          'bg-gray-400'
                        }`}>
                          {result.order || index + 1}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-gray-500">
                            {result.question.question_type}
                          </span>
                          {result.difficulty && result.difficulty !== 'unknown' && (
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              result.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                              result.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              result.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {result.difficulty.toUpperCase()}
                            </span>
                          )}
                          {!result.studentAnswer && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold">
                              {t('testResults.notAnswered')}
                            </span>
                          )}
                          {result.studentAnswer?.is_flagged && (
                            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                              <FontAwesomeIcon icon={faFlag} /> Flagged
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {result.studentAnswer && (
                          <div className={`px-3 py-2 rounded-lg ${
                            result.studentAnswer.time_spent_seconds > 120 ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faClock} className={
                                result.studentAnswer.time_spent_seconds > 120 ? 'text-orange-600' : 'text-blue-600'
                              } />
                              <div>
                                <div className={`text-sm font-bold ${
                                  result.studentAnswer.time_spent_seconds > 120 ? 'text-orange-700' : 'text-blue-700'
                                }`}>
                                  {Math.floor(result.studentAnswer.time_spent_seconds / 60) > 0
                                    ? `${Math.floor(result.studentAnswer.time_spent_seconds / 60)}m ${result.studentAnswer.time_spent_seconds % 60}s`
                                    : `${result.studentAnswer.time_spent_seconds}s`
                                  }
                                </div>
                                <div className="text-xs text-gray-500">{t('testResults.timeSpent')}</div>
                              </div>
                            </div>
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
                    <div className="p-6">
                      {renderQuestionComponent(result)}
                    </div>

                    {/* Tutor Feedback Section */}
                    <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                      <div className="text-sm font-semibold text-gray-600 mb-2">{t('testResults.tutorNotes')}</div>
                      <textarea
                        placeholder={t('testResults.addFeedback')}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-brand-green outline-none resize-none"
                        rows={2}
                        defaultValue={result.studentAnswer?.tutor_feedback || ''}
                      />
                    </div>
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
      </div>
    </Layout>
  );
}
