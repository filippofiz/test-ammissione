/**
 * Test Results Screen (Mobile) - View detailed test results
 * Shows student answers, correct answers, time spent, and performance statistics
 * This is the mobile equivalent of TestResultsPage
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faTimesCircle,
  faFlag,
  faClock,
  faChartBar,
  faChevronDown,
  faChevronRight,
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

// Brand colors matching web
const COLORS = {
  brandDark: '#1c2545',
  brandGreen: '#00a666',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  green50: '#ECFDF5',
  green200: '#BBF7D0',
  green600: '#059669',
  green700: '#047857',
  red50: '#FEF2F2',
  red200: '#FECACA',
  red600: '#DC2626',
  red700: '#B91C1C',
  blue50: '#EFF6FF',
  blue200: '#BFDBFE',
  blue700: '#1D4ED8',
  yellow50: '#FEFCE8',
  yellow200: '#FEF08A',
  yellow700: '#A16207',
  orange50: '#FFF7ED',
  orange200: '#FED7AA',
  orange600: '#EA580C',
};

interface Question {
  id: string;
  section: string;
  question_text: string;
  question_type: string;
  correct_answer: any;
  options?: any;
  difficulty?: number | string;
  question_data?: any;
  answers?: any;
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
  order: number;
  questionNumber: number;
  difficulty: string;
}

export default function TestResultsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { assignmentId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<number>(0); // 0 = not set yet
  const [filterSection, setFilterSection] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [availableAttempts, setAvailableAttempts] = useState<number[]>([]);
  const [resultsViewable, setResultsViewable] = useState(false);
  const [togglingViewability, setTogglingViewability] = useState(false);

  useEffect(() => {
    // Don't load on initial mount when selectedAttempt is 0
    // The first load will set selectedAttempt, triggering this effect again
    if (selectedAttempt === 0) {
      // Initial load to get available attempts and set selectedAttempt
      loadInitialData();
    } else {
      // Normal load with selected attempt
      loadTestResults();
    }
  }, [assignmentId, selectedAttempt]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading initial data for assignment ID:', assignmentId);

      if (!assignmentId) {
        throw new Error('No assignment ID provided');
      }

      // Load assignment details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('2V_test_assignments')
        .select(`
          *,
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

      if (assignmentError) {
        console.error('❌ Error loading assignment:', assignmentError);
        console.error('❌ Assignment ID was:', assignmentId);
        throw new Error(`Failed to load assignment: ${assignmentError.message}`);
      }

      if (!assignmentData) {
        throw new Error('Assignment not found');
      }

      console.log('✅ Assignment loaded:', assignmentData.id);

      // Extract completion_details and available attempts
      const completionDetails = assignmentData.completion_details || { attempts: [] };
      const attempts = completionDetails.attempts || [];
      const attemptNumbers = attempts.map((a: any) => a.attempt_number).sort((a: number, b: number) => a - b);
      setAvailableAttempts(attemptNumbers);

      // Set results visibility state
      setResultsViewable(assignmentData.results_viewable_by_student || false);

      // Set selected attempt - this will trigger useEffect again
      const defaultAttempt = assignmentData.current_attempt || 1;
      setSelectedAttempt(defaultAttempt);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  }

  async function loadTestResults() {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading test results for assignment ID:', assignmentId);

      if (!assignmentId) {
        throw new Error('No assignment ID provided');
      }

      // Load assignment details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('2V_test_assignments')
        .select(`
          *,
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

      if (assignmentError) {
        console.error('❌ Error loading assignment:', assignmentError);
        console.error('❌ Assignment ID was:', assignmentId);
        throw new Error(`Failed to load assignment: ${assignmentError.message}`);
      }

      if (!assignmentData) {
        throw new Error('Assignment not found');
      }

      console.log('✅ Assignment loaded:', assignmentData.id);

      // Extract completion_details and available attempts
      const completionDetails = assignmentData.completion_details || { attempts: [] };
      const attempts = completionDetails.attempts || [];
      const attemptNumbers = attempts.map((a: any) => a.attempt_number).sort((a: number, b: number) => a - b);
      setAvailableAttempts(attemptNumbers);

      // Determine which attempt to load
      let attemptToLoad = selectedAttempt;
      if (!selectedAttempt) {
        // Default to current_attempt if available, otherwise attempt 1
        attemptToLoad = assignmentData.current_attempt || 1;
        // Set selectedAttempt and let useEffect call us again with the correct attempt
        setSelectedAttempt(attemptToLoad);
        setLoading(false);
        return; // Exit early
      }

      // Load student profile separately
      const { data: studentData, error: studentError } = await supabase
        .from('2V_profiles')
        .select('id, name, email')
        .eq('id', assignmentData.student_id)
        .single();

      if (studentError) {
        console.error('❌ Error loading student profile:', studentError);
        throw new Error(`Failed to load student profile: ${studentError.message}`);
      }

      // Combine data
      const fullAssignmentData = {
        ...assignmentData,
        '2V_profiles': studentData
      };

      setAssignment(fullAssignmentData);
      setResultsViewable(assignmentData.results_viewable_by_student || false);

      // NEW APPROACH: Load questions directly from answers table ordered by created_at
      console.log(`📊 Loading questions from answers table (ordered by created_at) for attempt ${attemptToLoad}...`);

      const { data: answers, error: answersError } = await supabase
        .from('2V_student_answers')
        .select('question_id, created_at')
        .eq('assignment_id', assignmentId)
        .eq('attempt_number', attemptToLoad)
        .order('created_at', { ascending: true });

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

      // Get attempt record for metadata (difficulty, etc.) from already-loaded completion_details
      const attemptRecord = completionDetails.attempts?.find(
        (a: any) => a.attempt_number === attemptToLoad
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
        .eq('attempt_number', attemptToLoad);

      if (fullAnswersError) throw fullAnswersError;

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

      // Debug: Check for duplicate question IDs
      const resultQuestionIds = resultsData.map(r => r.question.id);
      const uniqueIds = new Set(resultQuestionIds);
      if (resultQuestionIds.length !== uniqueIds.size) {
        console.warn('⚠️  Found duplicate question IDs in results!');
        console.warn('Total questions:', resultQuestionIds.length);
        console.warn('Unique IDs:', uniqueIds.size);

        // Find which IDs are duplicated
        const counts = new Map<string, number>();
        resultQuestionIds.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
        const duplicates = Array.from(counts.entries()).filter(([_, count]) => count > 1);
        console.warn('Duplicate IDs:', duplicates);
      }
    } catch (err) {
      console.error('Error loading test results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load test results');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function checkIfCorrect(question: Question, studentAnswer: StudentAnswer | null): boolean {
    if (!studentAnswer || !studentAnswer.answer) return false;

    const studentAns = studentAnswer.answer;
    const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
    const correctAns = answersData?.correct_answer;

    if (!studentAns || !correctAns) return false;

    const questionData = (question as any).question_data || {};
    const diType = questionData.di_type;

    // GI (Graphical Interpretation)
    if (diType === 'GI' && studentAns.answers && Array.isArray(correctAns)) {
      const studentGI = studentAns.answers;
      const match1 = String(studentGI.part1 || '').trim() === String(correctAns[0] || '').trim();
      const match2 = String(studentGI.part2 || '').trim() === String(correctAns[1] || '').trim();
      return match1 && match2;
    }

    // TA (Table Analysis)
    if (diType === 'TA' && studentAns.answers) {
      const correctTA = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
      const studentTA = studentAns.answers;

      return Object.entries(correctTA).every(([key, value]) => {
        const match = key.match(/stmt(\d+)/);
        if (match) {
          const index = parseInt(match[1], 10);
          const expectedAnswer = value === 'col1' ? 'true' : 'false';
          const studentValue = String(studentTA[index] || studentTA[String(index)] || '').toLowerCase();
          return studentValue === expectedAnswer || studentValue === String(expectedAnswer === 'true');
        }
        return true;
      });
    }

    // TPA (Two-Part Analysis)
    if (diType === 'TPA' && studentAns.answers) {
      const correctTPA = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
      const studentTPA = studentAns.answers;
      const match1 = String(studentTPA.part1 || '').trim() === String(correctTPA.col1 || '').trim();
      const match2 = String(studentTPA.part2 || '').trim() === String(correctTPA.col2 || '').trim();
      return match1 && match2;
    }

    // MSR (Multi-Source Reasoning)
    if (diType === 'MSR' && studentAns.answers && Array.isArray(correctAns)) {
      const studentMSR = Array.isArray(studentAns.answers) ? studentAns.answers : [];
      if (studentMSR.length !== correctAns.length) return false;
      return studentMSR.every((ans: any, idx: number) =>
        String(ans || '').toLowerCase() === String(correctAns[idx] || '').toLowerCase()
      );
    }

    // DS (Data Sufficiency)
    if (diType === 'DS') {
      const studentDS = typeof studentAns === 'string' ? studentAns : studentAns.answer;
      const correctDS = Array.isArray(correctAns) ? correctAns[0] : correctAns;
      return String(studentDS || '').toUpperCase() === String(correctDS || '').toUpperCase();
    }

    // Multiple Choice
    if (question.question_type === 'multiple_choice') {
      const studentMC = studentAns.answer || studentAns;
      const correctMC = typeof correctAns === 'string' ? correctAns : correctAns;
      return String(studentMC || '').toLowerCase() === String(correctMC || '').toLowerCase();
    }

    return false;
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadTestResults();
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

  function toggleSection(sectionName: string) {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
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

  // Render question component
  function renderQuestionComponent(result: TestResult) {
    const { question, studentAnswer } = result;
    const questionData = (question as any).question_data || {};
    const diType = questionData.di_type;
    const noOp = () => {};

    // DS Question
    if (diType === 'DS') {
      const dsAnswer = studentAnswer?.answer;
      const extractedAnswer = typeof dsAnswer === 'string' ? dsAnswer : dsAnswer?.answer;
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;
      const correctDSAnswer = Array.isArray(correctAnswerData) ? correctAnswerData[0] : correctAnswerData;

      return (
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

    // MSR Question
    if (diType === 'MSR') {
      const msrAnswers = studentAnswer?.answer?.answers || [];
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;
      const correctMSRAnswers = Array.isArray(correctAnswerData) ? correctAnswerData : [];

      return (
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

    // GI Question
    if (diType === 'GI') {
      const giAnswers = studentAnswer?.answer?.answers || {};
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;

      return (
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

    // TA Question
    if (diType === 'TA') {
      const taAnswers = studentAnswer?.answer?.answers || {};
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;
      const correctTAAnswers = Array.isArray(correctAnswerData) && correctAnswerData.length > 0
        ? correctAnswerData[0]
        : correctAnswerData || {};

      return (
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

    // TPA Question
    if (diType === 'TPA') {
      const tpaAnswers = studentAnswer?.answer?.answers || {};
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;
      const correctTPAAnswers = Array.isArray(correctAnswerData) && correctAnswerData.length > 0
        ? correctAnswerData[0]
        : correctAnswerData || {};

      return (
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

    // Multiple Choice
    if (question.question_type === 'multiple_choice' && questionData.options) {
      const studentMCAnswer = studentAnswer?.answer?.answer || studentAnswer?.answer;
      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
      const correctAnswerData = answersData?.correct_answer;
      const correctMCAnswer = typeof correctAnswerData === 'string' ? correctAnswerData : correctAnswerData;

      return (
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

    // Fallback
    return (
      <View style={styles.fallbackQuestion}>
        <Text style={styles.fallbackQuestionText}>
          {question.question_text || 'No question text available'}
        </Text>
      </View>
    );
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

  const sections = ['all', ...Array.from(new Set(results.map(r => r.question.section)))];
  const filteredResults = results.filter(r => {
    if (filterSection !== 'all' && r.question.section !== filterSection) return false;
    return true;
  });

  if (loading && !refreshing) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.brandGreen} />
          <Text style={styles.loadingText}>Loading test results...</Text>
        </View>
      </Layout>
    );
  }

  if (error || !assignment) {
    return (
      <Layout>
        <View style={styles.centered}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Assignment not found'}</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Layout>
    );
  }

  const groupedResults = groupBySection(filteredResults);
  const sectionNames = Object.keys(groupedResults).sort();

  // Debug: Log keys that will be used for rendering
  if (results.length > 0) {
    const allKeys = [];
    sectionNames.forEach(sectionName => {
      groupedResults[sectionName].forEach((result, index) => {
        const key = result.studentAnswer?.id || `q-${result.question.id}-${result.order}`;
        allKeys.push({ section: sectionName, key, qid: result.question.id, order: result.order });
      });
    });

    // Check for duplicate keys
    const keyMap = new Map();
    allKeys.forEach(item => {
      if (keyMap.has(item.key)) {
        console.error(`🚨 DUPLICATE KEY FOUND: ${item.key}`, {
          first: keyMap.get(item.key),
          duplicate: item
        });
      } else {
        keyMap.set(item.key, item);
      }
    });

    console.log(`📊 Total items to render: ${allKeys.length}, Unique keys: ${keyMap.size}`);
  }

  return (
    <Layout>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.brandGreen}
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <FontAwesomeIcon icon={faArrowLeft} color={COLORS.brandGreen} size={20} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {assignment['2V_profiles']?.name || 'Student'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {assignment['2V_tests'].test_type} - Test #{assignment['2V_tests'].test_number}
            </Text>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderColor: COLORS.gray200 }]}>
              <Text style={[styles.statNumber, { color: COLORS.brandDark }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { borderColor: COLORS.green200 }]}>
              <Text style={[styles.statNumber, { color: COLORS.green700 }]}>{stats.correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={[styles.statCard, { borderColor: COLORS.red200 }]}>
              <Text style={[styles.statNumber, { color: COLORS.red700 }]}>{stats.wrong}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
            <View style={[styles.statCard, { borderColor: COLORS.brandGreen, backgroundColor: COLORS.brandGreen }]}>
              <Text style={[styles.statNumber, { color: COLORS.white }]}>{stats.score}%</Text>
              <Text style={[styles.statLabel, { color: COLORS.white }]}>Score</Text>
            </View>
          </View>

          {/* Results Visibility Control */}
          <View style={styles.visibilityCard}>
            <View style={styles.visibilityHeader}>
              <View style={[styles.visibilityIcon, resultsViewable ? styles.visibilityIconVisible : styles.visibilityIconHidden]}>
                <FontAwesomeIcon
                  icon={resultsViewable ? faEye : faEyeSlash}
                  size={24}
                  color={resultsViewable ? COLORS.green600 : COLORS.gray500}
                />
              </View>
              <View style={styles.visibilityTextContainer}>
                <Text style={styles.visibilityTitle}>
                  {resultsViewable ? 'Results Visible to Student' : 'Results Hidden from Student'}
                </Text>
                <Text style={styles.visibilitySubtitle}>
                  {resultsViewable
                    ? 'Student can view detailed results'
                    : 'Student cannot view results yet'}
                </Text>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>
                  {resultsViewable ? 'Visible' : 'Hidden'}
                </Text>
                <TouchableOpacity
                  onPress={toggleResultsViewability}
                  disabled={togglingViewability}
                  style={[
                    styles.toggleSwitch,
                    resultsViewable ? styles.toggleSwitchActive : styles.toggleSwitchInactive,
                    togglingViewability && styles.toggleSwitchDisabled
                  ]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.toggleSwitchThumb,
                      resultsViewable && styles.toggleSwitchThumbActive
                    ]}
                  >
                    {togglingViewability ? (
                      <ActivityIndicator size="small" color={COLORS.gray500} />
                    ) : (
                      <FontAwesomeIcon
                        icon={resultsViewable ? faLockOpen : faLock}
                        size={16}
                        color={resultsViewable ? COLORS.green600 : COLORS.gray500}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Help Text for Visibility */}
          <View style={[styles.visibilityHelpBox, resultsViewable ? styles.visibilityHelpBoxVisible : styles.visibilityHelpBoxHidden]}>
            <FontAwesomeIcon
              icon={resultsViewable ? faCheckCircle : faLock}
              size={14}
              color={resultsViewable ? COLORS.green700 : COLORS.orange600}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.visibilityHelpText, resultsViewable ? styles.visibilityHelpTextVisible : styles.visibilityHelpTextHidden]}>
              {resultsViewable
                ? 'Students can now see answers and statistics'
                : 'Enable after reviewing with student'}
            </Text>
          </View>

          {/* Attempt Selector */}
          {availableAttempts.length > 1 && (
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Select Attempt:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {availableAttempts.map(attempt => (
                  <TouchableOpacity
                    key={attempt}
                    style={[
                      styles.filterButton,
                      selectedAttempt === attempt && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedAttempt(attempt)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedAttempt === attempt && styles.filterButtonTextActive
                      ]}
                    >
                      Attempt {attempt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section Filter */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Section:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {sections.map(section => (
                <TouchableOpacity
                  key={section}
                  style={[
                    styles.filterButton,
                    filterSection === section && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterSection(section)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterSection === section && styles.filterButtonTextActive
                    ]}
                  >
                    {section === 'all' ? 'All Sections' : section}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Questions by Section */}
          {sectionNames.map(sectionName => {
            const sectionQuestions = groupedResults[sectionName];
            const sectionCorrect = sectionQuestions.filter(r => r.isCorrect).length;
            const isExpanded = expandedSections.has(sectionName);

            return (
              <View key={sectionName} style={styles.sectionContainer}>
                {/* Section Header - Clickable */}
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(sectionName)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionHeaderLeft}>
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronDown : faChevronRight}
                      color={COLORS.white}
                      size={16}
                    />
                    <Text style={styles.sectionTitle}>{sectionName}</Text>
                  </View>
                  <Text style={styles.sectionStats}>
                    {sectionCorrect}/{sectionQuestions.length} Correct
                  </Text>
                </TouchableOpacity>

                {/* Questions - Only show when expanded */}
                {isExpanded && sectionQuestions.map((result, index) => (
                  <View
                    key={result.studentAnswer?.id || `q-${result.question.id}-${result.order}`}
                    style={[
                      styles.questionCard,
                      result.isCorrect ? styles.questionCardCorrect :
                      result.studentAnswer && !result.isCorrect ? styles.questionCardWrong :
                      styles.questionCardUnanswered
                    ]}
                  >
                    {/* Question Header */}
                    <View style={styles.questionHeader}>
                      <View
                        style={[
                          styles.questionNumber,
                          result.isCorrect ? { backgroundColor: COLORS.green600 } :
                          result.studentAnswer && !result.isCorrect ? { backgroundColor: COLORS.red600 } :
                          { backgroundColor: COLORS.gray400 }
                        ]}
                      >
                        <Text style={styles.questionNumberText}>{result.order || index + 1}</Text>
                      </View>
                      <View style={styles.questionMeta}>
                        <Text style={styles.questionType}>{result.question.question_type}</Text>
                        {result.studentAnswer && (
                          <View style={styles.timeContainer}>
                            <FontAwesomeIcon icon={faClock} color={COLORS.gray600} size={12} />
                            <Text style={styles.timeText}>{result.studentAnswer.time_spent_seconds}s</Text>
                          </View>
                        )}
                      </View>
                      {result.isCorrect ? (
                        <FontAwesomeIcon icon={faCheckCircle} color={COLORS.green600} size={24} />
                      ) : result.studentAnswer ? (
                        <FontAwesomeIcon icon={faTimesCircle} color={COLORS.red600} size={24} />
                      ) : null}
                    </View>

                    {/* Question Content */}
                    <View style={styles.questionContent}>
                      {renderQuestionComponent(result)}
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray600,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.brandGreen,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray600,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    backgroundColor: COLORS.brandGreen,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sectionStats: {
    fontSize: 14,
    color: COLORS.white,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionCardCorrect: {
    borderColor: COLORS.green200,
    backgroundColor: COLORS.green50,
  },
  questionCardWrong: {
    borderColor: COLORS.red200,
    backgroundColor: COLORS.red50,
  },
  questionCardUnanswered: {
    borderColor: COLORS.gray200,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: 12,
  },
  questionNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumberText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionMeta: {
    flex: 1,
  },
  questionType: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  questionContent: {
    padding: 16,
  },
  fallbackQuestion: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  fallbackQuestionText: {
    fontSize: 16,
    color: COLORS.gray700,
  },
  errorContainer: {
    backgroundColor: COLORS.red50,
    borderWidth: 2,
    borderColor: COLORS.red200,
    borderRadius: 12,
    padding: 20,
    maxWidth: 400,
    width: '100%',
  },
  errorText: {
    color: COLORS.red700,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: COLORS.red600,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Visibility Control Styles
  visibilityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.blue200,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  visibilityIconVisible: {
    backgroundColor: COLORS.green50,
  },
  visibilityIconHidden: {
    backgroundColor: COLORS.gray100,
  },
  visibilityTextContainer: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brandDark,
    marginBottom: 2,
  },
  visibilitySubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  toggleContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 6,
  },
  toggleSwitch: {
    width: 100,
    height: 50,
    borderRadius: 25,
    padding: 4,
    justifyContent: 'center',
    borderWidth: 2,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.green600,
    borderColor: COLORS.green700,
  },
  toggleSwitchInactive: {
    backgroundColor: COLORS.gray300,
    borderColor: COLORS.gray500,
  },
  toggleSwitchDisabled: {
    opacity: 0.5,
  },
  toggleSwitchThumb: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleSwitchThumbActive: {
    transform: [{ translateX: 50 }],
  },
  visibilityHelpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  visibilityHelpBoxVisible: {
    backgroundColor: COLORS.green50,
    borderColor: COLORS.green200,
  },
  visibilityHelpBoxHidden: {
    backgroundColor: COLORS.orange50,
    borderColor: COLORS.orange200,
  },
  visibilityHelpText: {
    fontSize: 12,
    flex: 1,
  },
  visibilityHelpTextVisible: {
    color: COLORS.green700,
  },
  visibilityHelpTextHidden: {
    color: COLORS.orange600,
  },
});
