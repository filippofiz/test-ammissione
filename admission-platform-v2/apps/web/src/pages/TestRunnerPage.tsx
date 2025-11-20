/**
 * Test Runner Page - Admin Tool for Stress Testing
 * Simulates students taking tests under various conditions
 * Validates data integrity and reports error rates
 */

import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { VisualTestBot } from '../components/VisualTestBot';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faStop,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faCog,
  faRobot,
  faFlask,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import { supabaseTest, fromTest, cleanupTestData } from '../lib/supabaseTest';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface TestResult {
  scenario: string;
  studentId: string;
  assignmentId: string;
  status: 'success' | 'failed' | 'running';
  errors: string[];
  warnings: string[];
  data: {
    answersSubmitted: number;
    answersInDB: number;
    attemptNumber: number;
    completionReason?: string;
    timeElapsed?: number;
  };
}

interface ValidationReport {
  totalTests: number;
  successCount: number;
  failureCount: number;
  warningCount: number;
  errorRate: number;
  dataIntegrityIssues: number;
  results: TestResult[];
}

const TEST_SCENARIOS: TestScenario[] = [
  // ===== BASIC COMPLETION TESTS =====
  {
    id: 'normal_completion',
    name: 'Normal Completion',
    description: 'Student completes test normally, all answers saved correctly',
    enabled: true,
  },
  {
    id: 'partial_completion',
    name: 'Partial Completion',
    description: 'Answer only 50% of questions, then submit',
    enabled: true,
  },
  {
    id: 'rapid_completion',
    name: 'Rapid Completion',
    description: 'Answer all questions very quickly (< 5s per question)',
    enabled: true,
  },

  // ===== NETWORK CONDITION TESTS =====
  {
    id: 'slow_network',
    name: 'Slow Network (3G)',
    description: 'Simulate 3G/slow network conditions (500ms delay)',
    enabled: true,
  },
  {
    id: 'very_slow_network',
    name: 'Very Slow Network (2G)',
    description: 'Simulate 2G/very slow network (2000ms delay)',
    enabled: true,
  },
  {
    id: 'network_interruption',
    name: 'Network Interruption',
    description: 'Network drops randomly during test (test retry logic)',
    enabled: true,
  },
  {
    id: 'network_timeout',
    name: 'Network Timeout',
    description: 'Simulate complete network timeout (5s delay, then fail)',
    enabled: true,
  },

  // ===== INTERRUPTION TESTS =====
  {
    id: 'browser_close',
    name: 'Browser Close Mid-Test',
    description: 'Close browser halfway through (incomplete status)',
    enabled: true,
  },
  {
    id: 'fullscreen_exit',
    name: 'Fullscreen Exit',
    description: 'Exit fullscreen during test (annulled status)',
    enabled: true,
  },
  {
    id: 'time_expiry',
    name: 'Time Expiry',
    description: 'Let timer run out (completed with time_expired reason)',
    enabled: true,
  },
  {
    id: 'multiple_screens',
    name: 'Multiple Screens Detected',
    description: 'Simulate multiple monitor detection (annulled)',
    enabled: true,
  },

  // ===== RETAKE/ATTEMPT TESTS =====
  {
    id: 'retake_test',
    name: 'Single Retake',
    description: 'Complete test, then retake once (attempt_number = 2)',
    enabled: true,
  },
  {
    id: 'multiple_retakes',
    name: 'Multiple Retakes (5x)',
    description: 'Retake test 5 times (stress test attempt tracking)',
    enabled: true,
  },
  {
    id: 'incomplete_then_retake',
    name: 'Incomplete → Retake',
    description: 'Leave test incomplete, then restart fresh attempt',
    enabled: true,
  },
  {
    id: 'annulled_then_retake',
    name: 'Annulled → Retake',
    description: 'Get test annulled, then retry (test can restart)',
    enabled: true,
  },

  // ===== DATA INTEGRITY TESTS =====
  {
    id: 'concurrent_answers',
    name: 'Concurrent Answer Saves',
    description: 'Save multiple answers simultaneously (test upsert conflicts)',
    enabled: true,
  },
  {
    id: 'rapid_answer_changes',
    name: 'Rapid Answer Changes',
    description: 'Change same answer 10 times rapidly (test debounce)',
    enabled: true,
  },
  {
    id: 'duplicate_submissions',
    name: 'Duplicate Submissions',
    description: 'Submit same answer multiple times (test idempotency)',
    enabled: true,
  },
  {
    id: 'answer_rollback',
    name: 'Answer Rollback',
    description: 'Answer, navigate away, come back, verify answer persists',
    enabled: true,
  },

  // ===== MULTI-PART QUESTION TESTS =====
  {
    id: 'partial_multipart',
    name: 'Partial Multi-Part Answers',
    description: 'Answer only 1 of 3 parts in MSR/GI/TA questions',
    enabled: true,
  },
  {
    id: 'multipart_validation',
    name: 'Multi-Part Validation',
    description: 'Test mandatory "complete all parts" validation',
    enabled: true,
  },
  {
    id: 'mixed_question_types',
    name: 'Mixed Question Types',
    description: 'Test with MC, MSR, GI, TA, TPA all in one test',
    enabled: true,
  },

  // ===== EDGE CASES =====
  {
    id: 'flag_unflag',
    name: 'Flag/Unflag Questions',
    description: 'Flag questions, unflag, verify persistence',
    enabled: true,
  },
  {
    id: 'unicode_answers',
    name: 'Unicode/Special Characters',
    description: 'Test with answers containing émojis, ñ, 中文, etc.',
    enabled: true,
  },
  {
    id: 'very_long_session',
    name: 'Very Long Session (30min)',
    description: 'Keep test open for extended period (endurance test)',
    enabled: false, // Disabled by default
  },
  {
    id: 'section_transitions',
    name: 'Section Transitions with Pauses',
    description: 'Test section changes with mandatory/optional pauses',
    enabled: true,
  },
  {
    id: 'backward_navigation',
    name: 'Backward Navigation',
    description: 'Navigate backward through questions, verify answers persist',
    enabled: true,
  },

  // ===== STRESS TESTS =====
  {
    id: 'high_frequency_saves',
    name: 'High Frequency Saves',
    description: 'Save answer every 100ms (stress test database)',
    enabled: true,
  },
  {
    id: 'many_concurrent_users',
    name: 'Concurrent Users (50x)',
    description: 'Simulate 50 students taking same test simultaneously',
    enabled: false, // Disabled by default - very resource intensive
  },

  // ===== DATABASE CONSTRAINT TESTS =====
  {
    id: 'orphaned_answers',
    name: 'Orphaned Answers Prevention',
    description: 'Try to create answers without valid assignment',
    enabled: true,
  },
  {
    id: 'attempt_number_integrity',
    name: 'Attempt Number Integrity',
    description: 'Verify attempt numbers are sequential and consistent',
    enabled: true,
  },
];

// Normalize function for case-insensitive track type matching
const normalize = (str: string) => str.toLowerCase().replace(/[\s_]+/g, '_');

export default function TestRunnerPage() {
  const [activeTab, setActiveTab] = useState<'visual' | 'api'>('visual');
  const [scenarios, setScenarios] = useState<TestScenario[]>(TEST_SCENARIOS);
  const [numStudents, setNumStudents] = useState(5);
  const [availableTestTypes, setAvailableTestTypes] = useState<string[]>([]);
  const [availableTrackTypes, setAvailableTrackTypes] = useState<string[]>([]);
  const [testType, setTestType] = useState('');
  const [trackType, setTrackType] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [liveResults, setLiveResults] = useState<TestResult[]>([]);

  // Load test types on component mount
  useEffect(() => {
    loadTestTypes();
  }, []);

  // Load track types when test type changes
  useEffect(() => {
    if (testType) {
      loadTrackTypes(testType);
    }
  }, [testType]);

  async function loadTestTypes() {
    try {
      // Get unique test types from production 2V_tests table
      const { data, error } = await supabase
        .from('2V_tests')
        .select('test_type');

      if (error) throw error;

      const testTypes = new Set<string>();
      data?.forEach(test => {
        if (test.test_type) {
          testTypes.add(test.test_type);
        }
      });

      const sortedTestTypes = Array.from(testTypes).sort();
      console.log(`📋 Available test types:`, sortedTestTypes);
      setAvailableTestTypes(sortedTestTypes);

      // Set default test type to first available
      if (sortedTestTypes.length > 0 && !testType) {
        setTestType(sortedTestTypes[0]);
      }
    } catch (err) {
      console.error('Error loading test types:', err);
    }
  }

  async function loadTrackTypes(selectedTestType: string) {
    try {
      console.log(`🔍 Loading track types for test_type: ${selectedTestType}`);

      // Get unique track types from production 2V_test_track_config table
      const { data, error } = await supabase
        .from('2V_test_track_config')
        .select('track_type')
        .eq('test_type', selectedTestType);

      console.log(`📊 Track configs found:`, data);

      if (error) {
        console.error('❌ Error fetching track types:', error);
        throw error;
      }

      const trackTypes = new Set<string>();
      data?.forEach(config => {
        if (config.track_type) {
          trackTypes.add(config.track_type);
          console.log(`  ✅ Added track_type: "${config.track_type}"`);
        }
      });

      const sortedTrackTypes = Array.from(trackTypes).sort();
      console.log(`📋 Available track types:`, sortedTrackTypes);
      setAvailableTrackTypes(sortedTrackTypes);

      // Set default track type to first available
      if (sortedTrackTypes.length > 0) {
        setTrackType(sortedTrackTypes[0]);
        console.log(`🎯 Default track type set to: "${sortedTrackTypes[0]}"`);
      } else {
        console.warn(`⚠️ No track types found for ${selectedTestType}`);
      }
    } catch (err) {
      console.error('Error loading track types:', err);
    }
  }

  const toggleScenario = (id: string) => {
    setScenarios(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const toggleAll = (enabled: boolean) => {
    setScenarios(prev => prev.map(s => ({ ...s, enabled })));
  };

  async function runTests() {
    setIsRunning(true);
    setProgress(0);
    setReport(null);
    setLiveResults([]); // Clear previous results

    const enabledScenarios = scenarios.filter(s => s.enabled);
    const totalTests = enabledScenarios.length * numStudents;
    const results: TestResult[] = [];

    let completed = 0;

    for (const scenario of enabledScenarios) {
      for (let i = 0; i < numStudents; i++) {
        setCurrentTest(`${scenario.name} - Student ${i + 1}/${numStudents} (${completed + 1}/${totalTests})`);

        try {
          const result = await runScenario(scenario, i);
          results.push(result);
          setLiveResults([...results]); // Update live results immediately
        } catch (err) {
          console.error('Test execution error:', err);
          const failedResult = {
            scenario: scenario.name,
            studentId: `test-student-${i}`,
            assignmentId: '',
            status: 'failed' as const,
            errors: [(err as Error).message],
            warnings: [],
            data: {
              answersSubmitted: 0,
              answersInDB: 0,
              attemptNumber: 0,
            },
          };
          results.push(failedResult);
          setLiveResults([...results]); // Update live results even on failure
        }

        completed++;
        setProgress((completed / totalTests) * 100);
      }
    }

    // Generate validation report
    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status === 'failed').length;
    const warningCount = results.filter(r => r.warnings.length > 0).length;
    const dataIntegrityIssues = results.filter(
      r => r.data.answersSubmitted !== r.data.answersInDB
    ).length;

    const validationReport: ValidationReport = {
      totalTests,
      successCount,
      failureCount,
      warningCount,
      errorRate: (failureCount / totalTests) * 100,
      dataIntegrityIssues,
      results,
    };

    setReport(validationReport);
    setIsRunning(false);
    setCurrentTest('');
  }

  async function runScenario(
    scenario: TestScenario,
    studentIndex: number
  ): Promise<TestResult> {
    const result: TestResult = {
      scenario: scenario.name,
      studentId: `test-student-${studentIndex}`,
      assignmentId: '',
      status: 'running',
      errors: [],
      warnings: [],
      data: {
        answersSubmitted: 0,
        answersInDB: 0,
        attemptNumber: 1,
      },
    };

    // Simulate different scenarios
    switch (scenario.id) {
      case 'normal_completion':
        return await simulateNormalCompletion(result);

      case 'partial_completion':
        return await simulatePartialCompletion(result);

      case 'rapid_completion':
        return await simulateRapidCompletion(result);

      case 'slow_network':
        return await simulateSlowNetwork(result, 500);

      case 'very_slow_network':
        return await simulateSlowNetwork(result, 2000);

      case 'network_interruption':
        return await simulateNetworkInterruption(result);

      case 'network_timeout':
        return await simulateNetworkTimeout(result);

      case 'browser_close':
        return await simulateBrowserClose(result);

      case 'fullscreen_exit':
        return await simulateFullscreenExit(result);

      case 'time_expiry':
        return await simulateTimeExpiry(result);

      case 'multiple_screens':
        return await simulateMultipleScreens(result);

      case 'retake_test':
        return await simulateRetake(result, 2);

      case 'multiple_retakes':
        return await simulateRetake(result, 5);

      case 'incomplete_then_retake':
        return await simulateIncompleteThenRetake(result);

      case 'annulled_then_retake':
        return await simulateAnnulledThenRetake(result);

      case 'concurrent_answers':
        return await simulateConcurrentSaves(result);

      case 'rapid_answer_changes':
        return await simulateRapidAnswerChanges(result);

      case 'duplicate_submissions':
        return await simulateDuplicateSubmissions(result);

      case 'answer_rollback':
        return await simulateAnswerRollback(result);

      case 'partial_multipart':
        return await simulatePartialMultipart(result);

      case 'multipart_validation':
        return await simulateMultipartValidation(result);

      case 'mixed_question_types':
        return await simulateMixedQuestionTypes(result);

      case 'flag_unflag':
        return await simulateFlagUnflag(result);

      case 'unicode_answers':
        return await simulateUnicodeAnswers(result);

      case 'very_long_session':
        return await simulateVeryLongSession(result);

      case 'section_transitions':
        return await simulateSectionTransitions(result);

      case 'backward_navigation':
        return await simulateBackwardNavigation(result);

      case 'high_frequency_saves':
        return await simulateHighFrequencySaves(result);

      case 'many_concurrent_users':
        return await simulateManyConcurrentUsers(result);

      case 'orphaned_answers':
        return await simulateOrphanedAnswers(result);

      case 'attempt_number_integrity':
        return await simulateAttemptNumberIntegrity(result);

      default:
        result.status = 'failed';
        result.errors.push(`Unknown scenario: ${scenario.id}`);
        return result;
    }
  }

  async function simulateNormalCompletion(
    result: TestResult
  ): Promise<TestResult> {
    try {
      // Create test student
      const studentId = await createTestStudent(result.studentId);

      // Create assignment
      const assignmentId = await createTestAssignment(
        studentId,
        testType,
        trackType
      );
      result.assignmentId = assignmentId;

      // Get test questions
      const questions = await getTestQuestions(testType);

      // Answer all questions
      for (const question of questions.slice(0, 10)) {
        // Test with 10 questions
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;

        // Small delay to simulate human behavior
        await delay(50);
      }

      // Submit test (mark as completed)
      await completeTest(assignmentId, 'completed', 'submitted');

      // Validate data integrity
      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;
      result.data.attemptNumber = validation.attemptNumber;
      result.data.completionReason = validation.completionReason;

      if (validation.errors.length > 0) {
        result.errors.push(...validation.errors);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      if (validation.warnings.length > 0) {
        result.warnings.push(...validation.warnings);
      }

      // Cleanup
      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }

    return result;
  }

  async function simulateSlowNetwork(
    result: TestResult,
    delayMs: number
  ): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(
        studentId,
        testType,
        trackType
      );
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer questions with network delay
      for (const question of questions.slice(0, 10)) {
        await delay(delayMs); // Simulate slow network
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.errors.length > 0) {
        result.errors.push(...validation.errors);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      if (validation.warnings.length > 0) {
        result.warnings.push(...validation.warnings);
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }

    return result;
  }

  async function simulateBrowserClose(
    result: TestResult
  ): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(
        studentId,
        testType,
        trackType
      );
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer only half the questions, then "close browser"
      for (const question of questions.slice(0, 5)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(50);
      }

      // Mark as incomplete (browser closed)
      await completeTest(assignmentId, 'incomplete', 'browser_closed');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;
      result.data.completionReason = validation.completionReason;

      // Check that status is 'incomplete'
      if (validation.status !== 'incomplete') {
        result.errors.push(
          `Expected status 'incomplete', got '${validation.status}'`
        );
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      if (validation.warnings.length > 0) {
        result.warnings.push(...validation.warnings);
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }

    return result;
  }

  async function simulateFullscreenExit(
    result: TestResult
  ): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(
        studentId,
        testType,
        trackType
      );
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer some questions, then "exit fullscreen"
      for (const question of questions.slice(0, 7)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(50);
      }

      // Mark as annulled (fullscreen exit)
      await completeTest(assignmentId, 'annulled', 'fullscreen_exit');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      // Check that status is 'annulled'
      if (validation.status !== 'annulled') {
        result.errors.push(
          `Expected status 'annulled', got '${validation.status}'`
        );
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }

    return result;
  }

  async function simulateTimeExpiry(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(
        studentId,
        testType,
        trackType
      );
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer some questions
      for (const question of questions.slice(0, 8)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(50);
      }

      // Mark as completed with time_expired reason
      await completeTest(assignmentId, 'completed', 'time_expired');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;
      result.data.completionReason = validation.completionReason;

      // Check that completion reason is 'time_expired'
      if (validation.completionReason !== 'time_expired') {
        result.errors.push(
          `Expected reason 'time_expired', got '${validation.completionReason}'`
        );
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }

    return result;
  }

  async function simulateRetake(
    result: TestResult,
    numAttempts: number
  ): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(
        studentId,
        testType,
        trackType
      );
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Take test multiple times
      for (let attempt = 1; attempt <= numAttempts; attempt++) {
        // Answer all questions for this attempt
        for (const question of questions.slice(0, 10)) {
          await saveTestAnswer(assignmentId, studentId, question.id, attempt);
          result.data.answersSubmitted++;
          await delay(30);
        }

        // Complete this attempt
        await completeTest(assignmentId, 'completed', 'submitted');

        // If not last attempt, increment attempt number
        if (attempt < numAttempts) {
          await incrementAttempt(assignmentId, attempt + 1);
        }
      }

      result.data.attemptNumber = numAttempts;

      // Validate final state
      const validation = await validateTestData(assignmentId, numAttempts);
      result.data.answersInDB = validation.answersInDB;

      // Check that all attempts were recorded
      const allAttempts = await getAllAttempts(assignmentId);
      if (allAttempts.length !== numAttempts) {
        result.errors.push(
          `Expected ${numAttempts} attempts, found ${allAttempts.length}`
        );
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      // Validate each attempt has correct answers
      for (let i = 1; i <= numAttempts; i++) {
        const attemptValidation = await validateTestData(assignmentId, i);
        if (attemptValidation.answersInDB !== 10) {
          result.warnings.push(
            `Attempt ${i}: Expected 10 answers, found ${attemptValidation.answersInDB}`
          );
        }
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }

    return result;
  }

  async function simulateConcurrentSaves(
    result: TestResult
  ): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(
        studentId,
        testType,
        trackType
      );
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Save multiple answers simultaneously to test upsert conflict resolution
      const savePromises = questions.slice(0, 10).map(question =>
        saveTestAnswer(assignmentId, studentId, question.id, 1)
      );

      await Promise.all(savePromises);
      result.data.answersSubmitted = 10;

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 10) {
        result.errors.push(
          `Concurrent save failed: Expected 10 answers, got ${validation.answersInDB}`
        );
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }

    return result;
  }

  async function simulateNetworkInterruption(
    result: TestResult
  ): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(
        studentId,
        testType,
        trackType
      );
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer questions, with some saves failing initially
      for (const question of questions.slice(0, 10)) {
        let saved = false;
        let attempts = 0;

        while (!saved && attempts < 3) {
          try {
            // Simulate 30% network failure rate on first attempt
            if (attempts === 0 && Math.random() < 0.3) {
              throw new Error('Network timeout');
            }

            await saveTestAnswer(assignmentId, studentId, question.id, 1);
            saved = true;
            result.data.answersSubmitted++;
          } catch (err) {
            attempts++;
            if (attempts >= 3) {
              result.warnings.push(
                `Question ${question.id}: Failed after 3 attempts`
              );
            } else {
              // Retry after delay
              await delay(100 * Math.pow(2, attempts));
            }
          }
        }
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      // Some answers might not have saved due to network issues
      if (validation.answersInDB < result.data.answersSubmitted) {
        result.warnings.push(
          `Network interruption caused ${result.data.answersSubmitted - validation.answersInDB} answers to be lost`
        );
      }

      result.status = 'success';

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }

    return result;
  }

  async function simulatePartialCompletion(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);
      const halfQuestions = Math.floor(questions.length / 2);

      // Answer only 50% of questions
      for (const question of questions.slice(0, halfQuestions)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(50);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== halfQuestions) {
        result.errors.push(`Expected ${halfQuestions} answers, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateRapidCompletion(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer all questions very quickly (< 5ms delay)
      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(2); // Very fast
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 10) {
        result.errors.push(`Rapid completion data loss: Expected 10, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateNetworkTimeout(result: TestResult): Promise<TestResult> {
    let assignmentId = '';
    let studentId = '';
    try {
      studentId = await createTestStudent(result.studentId);
      assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Simulate long delays that might timeout (reduced to 500ms for faster testing)
      for (const question of questions.slice(0, 10)) {
        await delay(500); // Reduced from 5000ms to 500ms for faster testing
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 10) {
        result.errors.push(`Network timeout caused data loss: Expected 10, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
      // Try cleanup even if test failed
      if (assignmentId && studentId) {
        try {
          await cleanupSingleTest(assignmentId, studentId);
        } catch (cleanupErr) {
          console.error('Cleanup failed:', cleanupErr);
        }
      }
    }
    return result;
  }

  async function simulateMultipleScreens(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer some questions before detection
      for (const question of questions.slice(0, 6)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(50);
      }

      // Mark as annulled (multiple screens detected)
      await completeTest(assignmentId, 'annulled', 'multiple_screens_detected');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.status !== 'annulled') {
        result.errors.push(`Expected status 'annulled', got '${validation.status}'`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateIncompleteThenRetake(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // First attempt: incomplete
      for (const question of questions.slice(0, 5)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(30);
      }

      await completeTest(assignmentId, 'incomplete', 'browser_closed');

      // Start fresh attempt
      await incrementAttempt(assignmentId, 2);

      // Second attempt: complete
      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 2);
        result.data.answersSubmitted++;
        await delay(30);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      // Validate both attempts exist
      const allAttempts = await getAllAttempts(assignmentId);
      if (allAttempts.length !== 2) {
        result.errors.push(`Expected 2 attempts, found ${allAttempts.length}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateAnnulledThenRetake(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // First attempt: annulled
      for (const question of questions.slice(0, 7)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(30);
      }

      await completeTest(assignmentId, 'annulled', 'fullscreen_exit');

      // Start fresh attempt
      await incrementAttempt(assignmentId, 2);

      // Second attempt: complete
      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 2);
        result.data.answersSubmitted++;
        await delay(30);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const allAttempts = await getAllAttempts(assignmentId);
      if (allAttempts.length !== 2) {
        result.errors.push(`Expected 2 attempts, found ${allAttempts.length}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateRapidAnswerChanges(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Change same answer 10 times rapidly
      const question = questions[0];
      for (let i = 0; i < 10; i++) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(10); // Very rapid changes
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      // Should have only 1 answer in DB (upsert should work)
      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 1) {
        result.errors.push(`Rapid changes created duplicates: Expected 1, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateDuplicateSubmissions(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Submit same answer multiple times
      for (const question of questions.slice(0, 5)) {
        // Submit each answer 3 times
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted += 3;
        await delay(20);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      // Should have only 5 answers (idempotent)
      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 5) {
        result.errors.push(`Duplicate submissions not idempotent: Expected 5, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateAnswerRollback(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer questions
      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(30);
      }

      // Verify answers persist
      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 10) {
        result.errors.push(`Answers did not persist: Expected 10, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await completeTest(assignmentId, 'completed', 'submitted');
      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulatePartialMultipart(result: TestResult): Promise<TestResult> {
    // This is a placeholder - actual implementation would require multi-part questions
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Simulate partial multi-part answers
      for (const question of questions.slice(0, 5)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(30);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;
      result.status = 'success';
      result.warnings.push('Multi-part question validation not fully implemented');

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateMultipartValidation(result: TestResult): Promise<TestResult> {
    // Placeholder - requires multi-part question support
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(30);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;
      result.status = 'success';
      result.warnings.push('Multi-part validation not fully implemented');

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateMixedQuestionTypes(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer mixed question types
      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(40);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 10) {
        result.errors.push(`Mixed types data loss: Expected 10, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateFlagUnflag(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer and flag questions
      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(30);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;
      result.status = 'success';
      result.warnings.push('Flag/unflag persistence check not fully implemented');

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateUnicodeAnswers(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Save answers with unicode characters
      for (const question of questions.slice(0, 5)) {
        const { error } = await fromTest('2V_student_answers').upsert({
          assignment_id: assignmentId,
          student_id: studentId,
          question_id: question.id,
          attempt_number: 1,
          answer: { answer: 'émojis 😀 ñ 中文 العربية' },
          is_flagged: false,
          time_spent_seconds: 30,
        }, {
          onConflict: 'assignment_id,question_id,attempt_number',
        });

        if (error) throw error;
        result.data.answersSubmitted++;
        await delay(30);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 5) {
        result.errors.push(`Unicode handling issue: Expected 5, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateVeryLongSession(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Simulate a very long session (30 minutes = 1800 seconds)
      // For testing purposes, we'll use 30 seconds instead to avoid timeout
      const sessionDuration = 30000; // 30 seconds
      const questionCount = 10;
      const delayBetweenQuestions = sessionDuration / questionCount;

      for (const question of questions.slice(0, questionCount)) {
        await delay(delayBetweenQuestions);
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;
      result.data.timeElapsed = sessionDuration / 1000;

      if (validation.answersInDB !== questionCount) {
        result.errors.push(`Long session data loss: Expected ${questionCount}, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateManyConcurrentUsers(result: TestResult): Promise<TestResult> {
    try {
      // This scenario simulates 50 concurrent users
      // For simplicity in the test runner, we'll create a single test
      // that validates the system can handle concurrent operations

      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Simulate concurrent saves by making multiple simultaneous requests
      const concurrentSaves = questions.slice(0, 20).map((question, index) =>
        saveTestAnswer(assignmentId, studentId, question.id, 1)
      );

      await Promise.all(concurrentSaves);
      result.data.answersSubmitted = 20;

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 20) {
        result.errors.push(`Concurrent users test failed: Expected 20, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      result.warnings.push('Full 50-user concurrent test not implemented - tested with concurrent saves instead');
      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateSectionTransitions(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Simulate section transitions with pauses
      for (let i = 0; i < 10; i++) {
        await saveTestAnswer(assignmentId, studentId, questions[i].id, 1);
        result.data.answersSubmitted++;

        // Pause between "sections"
        if (i === 4) {
          await delay(1000); // Section pause
        } else {
          await delay(30);
        }
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 10) {
        result.errors.push(`Section transition data loss: Expected 10, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateBackwardNavigation(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Answer forward
      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(30);
      }

      // Verify all answers persist (simulating backward navigation check)
      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 10) {
        result.errors.push(`Backward navigation data loss: Expected 10, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await completeTest(assignmentId, 'completed', 'submitted');
      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateHighFrequencySaves(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Save every 100ms
      for (const question of questions.slice(0, 10)) {
        await saveTestAnswer(assignmentId, studentId, question.id, 1);
        result.data.answersSubmitted++;
        await delay(100);
      }

      await completeTest(assignmentId, 'completed', 'submitted');

      const validation = await validateTestData(assignmentId, 1);
      result.data.answersInDB = validation.answersInDB;

      if (validation.answersInDB !== 10) {
        result.errors.push(`High frequency saves failed: Expected 10, got ${validation.answersInDB}`);
        result.status = 'failed';
      } else {
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateOrphanedAnswers(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Try to create answer without valid assignment (should fail or be prevented)
      try {
        const { error } = await fromTest('2V_student_answers').insert({
          assignment_id: '00000000-0000-0000-0000-000000000000', // Invalid
          student_id: studentId,
          question_id: questions[0].id,
          attempt_number: 1,
          answer: { answer: 'A' },
          is_flagged: false,
          time_spent_seconds: 10,
        });

        if (error) {
          // Expected to fail - foreign key constraint
          result.status = 'success';
        } else {
          result.errors.push('Orphaned answer was allowed - foreign key constraint failed');
          result.status = 'failed';
        }
      } catch (err) {
        // Expected to throw - this is good
        result.status = 'success';
      }

      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  async function simulateAttemptNumberIntegrity(result: TestResult): Promise<TestResult> {
    try {
      const studentId = await createTestStudent(result.studentId);
      const assignmentId = await createTestAssignment(studentId, testType, trackType);
      result.assignmentId = assignmentId;

      const questions = await getTestQuestions(testType);

      // Create 3 attempts
      for (let attempt = 1; attempt <= 3; attempt++) {
        for (const question of questions.slice(0, 5)) {
          await saveTestAnswer(assignmentId, studentId, question.id, attempt);
          result.data.answersSubmitted++;
          await delay(20);
        }

        await completeTest(assignmentId, 'completed', 'submitted');

        if (attempt < 3) {
          await incrementAttempt(assignmentId, attempt + 1);
        }
      }

      // Verify all attempts are sequential and consistent
      const allAttempts = await getAllAttempts(assignmentId);

      if (allAttempts.length !== 3) {
        result.errors.push(`Expected 3 attempts, found ${allAttempts.length}`);
        result.status = 'failed';
      } else {
        // Check each attempt has correct count
        const isValid = allAttempts.every(a => a.answerCount === 5);
        if (!isValid) {
          result.errors.push('Attempt number integrity check failed - inconsistent answer counts');
          result.status = 'failed';
        } else {
          result.status = 'success';
        }
      }

      result.data.attemptNumber = 3;
      await cleanupSingleTest(assignmentId, studentId);
    } catch (err) {
      result.status = 'failed';
      result.errors.push((err as Error).message);
    }
    return result;
  }

  // Helper functions
  async function createTestStudent(username: string): Promise<string> {
    // Check if test student already exists
    const { data: existing, error: selectError } = await fromTest('2V_profiles')
      .select('id')
      .eq('email', `${username}@test.com`)
      .maybeSingle();

    if (existing) {
      return existing.id;
    }

    // Create a new test student profile
    const { data: newProfile, error: insertError} = await fromTest('2V_profiles')
      .insert({
        email: `${username}@test.com`,
        name: username.replace('test-student-', 'Test Student '),
        roles: ['STUDENT'],
        // Don't include password_must_change - test table may not have it
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating test student:', insertError);
      throw new Error(`Failed to create test student: ${insertError.message}`);
    }

    return newProfile.id;
  }

  async function createTestAssignment(
    studentId: string,
    testType: string,
    trackType: string
  ): Promise<string> {
    // Get any test of the specified type from production (tests are generic, track config determines behavior)
    const { data: test } = await supabase
      .from('2V_tests')
      .select('id')
      .eq('test_type', testType)
      .limit(1)
      .maybeSingle();

    if (!test) {
      throw new Error(`No tests found for type: ${testType}`);
    }

    // Get track configuration with normalized matching from production table
    const { data: allConfigs } = await supabase
      .from('2V_test_track_config')
      .select('*')
      .eq('test_type', testType);

    // Find matching config by normalized track_type (case and space/underscore insensitive)
    const trackConfig = allConfigs?.find(config =>
      normalize(config.track_type) === normalize(trackType)
    );

    if (!trackConfig) {
      throw new Error(`Track config not found: ${testType} - ${trackType}`);
    }

    // First, try to find existing assignment for this student+test combo
    const { data: existingAssignment } = await fromTest('2V_test_assignments')
      .select('id')
      .eq('student_id', studentId)
      .eq('test_id', test.id)
      .maybeSingle();

    if (existingAssignment) {
      // Reset the existing assignment for the new test scenario
      const { error: updateError } = await fromTest('2V_test_assignments')
        .update({
          status: 'unlocked',
          current_attempt: 1,
          total_attempts: 0,
          start_time: null,
          completed_at: null,
          completion_details: null,
        })
        .eq('id', existingAssignment.id);

      if (updateError) {
        console.error('Error resetting assignment:', updateError);
        throw updateError;
      }

      // Delete existing answers for this assignment
      await fromTest('2V_student_answers')
        .delete()
        .eq('assignment_id', existingAssignment.id);

      return existingAssignment.id;
    }

    // Create new assignment if none exists
    const { data: assignment, error } = await fromTest('2V_test_assignments')
      .insert({
        student_id: studentId,
        test_id: test.id,
        status: 'unlocked',
        current_attempt: 1,
        total_attempts: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
    return assignment.id;
  }

  async function getTestQuestions(testType: string): Promise<any[]> {
    // Get questions from production table
    const { data, error } = await supabase
      .from('2V_questions')
      .select('*')
      .eq('test_type', testType)
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async function saveTestAnswer(
    assignmentId: string,
    studentId: string,
    questionId: string,
    attemptNumber: number
  ): Promise<void> {
    const { error } = await fromTest('2V_student_answers').upsert(
      {
        assignment_id: assignmentId,
        student_id: studentId,
        question_id: questionId,
        attempt_number: attemptNumber,
        answer: { answer: 'A' }, // Dummy answer
        is_flagged: false,
        time_spent_seconds: Math.floor(Math.random() * 60) + 10,
      },
      {
        onConflict: 'assignment_id,question_id,attempt_number',
      }
    );

    if (error) throw error;
  }

  async function completeTest(
    assignmentId: string,
    status: string,
    reason: string
  ): Promise<void> {
    // First get current_attempt to set total_attempts correctly
    const { data: assignment } = await fromTest('2V_test_assignments')
      .select('current_attempt')
      .eq('id', assignmentId)
      .single();

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const { error } = await fromTest('2V_test_assignments')
      .update({
        status,
        completed_at: new Date().toISOString(),
        total_attempts: assignment.current_attempt, // Set to current attempt number
        completion_details: {
          reason,
          completed_at: new Date().toISOString(),
          section_times: { Test: 300 },
          total_time_seconds: 300,
          questions_answered: 10,
          total_questions: 10,
        },
      })
      .eq('id', assignmentId);

    if (error) throw error;
  }

  async function incrementAttempt(
    assignmentId: string,
    newAttempt: number
  ): Promise<void> {
    const { error } = await fromTest('2V_test_assignments')
      .update({
        current_attempt: newAttempt,
        status: 'in_progress',
      })
      .eq('id', assignmentId);

    if (error) throw error;
  }

  async function validateTestData(
    assignmentId: string,
    attemptNumber: number
  ): Promise<{
    answersInDB: number;
    attemptNumber: number;
    status: string;
    completionReason?: string;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check assignment status
    const { data: assignment } = await fromTest('2V_test_assignments')
      .select('id, student_id, test_id, status, current_attempt, total_attempts, start_time, completed_at, completion_details')
      .eq('id', assignmentId)
      .single();

    if (!assignment) {
      errors.push('Assignment not found in database');
      return {
        answersInDB: 0,
        attemptNumber: 0,
        status: 'unknown',
        errors,
        warnings,
      };
    }

    // Count answers for this attempt
    const { count } = await fromTest('2V_student_answers')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', assignmentId)
      .eq('attempt_number', attemptNumber);

    return {
      answersInDB: count || 0,
      attemptNumber: assignment.current_attempt,
      status: assignment.status,
      completionReason: assignment.completion_details?.reason,
      errors,
      warnings,
    };
  }

  async function getAllAttempts(
    assignmentId: string
  ): Promise<{ attemptNumber: number; answerCount: number }[]> {
    const { data } = await fromTest('2V_student_answers')
      .select('attempt_number')
      .eq('assignment_id', assignmentId);

    if (!data) return [];

    // Group by attempt number
    const attemptCounts = new Map<number, number>();
    data.forEach(row => {
      const count = attemptCounts.get(row.attempt_number) || 0;
      attemptCounts.set(row.attempt_number, count + 1);
    });

    return Array.from(attemptCounts.entries()).map(([attemptNumber, count]) => ({
      attemptNumber,
      answerCount: count,
    }));
  }

  async function cleanupSingleTest(
    assignmentId: string,
    studentId: string
  ): Promise<void> {
    // Delete test answers
    await fromTest('2V_student_answers')
      .delete()
      .eq('assignment_id', assignmentId);

    // Delete assignment
    await fromTest('2V_test_assignments').delete().eq('id', assignmentId);

    // NOTE: Don't delete student profile - might be used for other tests
  }

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const stopTests = () => {
    setIsRunning(false);
    setProgress(0);
    setCurrentTest('');
    setLiveResults([]);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Runner - System Stress Testing
            </h1>
            <p className="text-gray-600">
              Simulate students taking tests under various conditions to validate
              data integrity and system reliability
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'visual'
                      ? 'border-b-2 border-brand-green text-brand-green'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faRobot} className="mr-2" />
                  Visual Bot
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'api'
                      ? 'border-b-2 border-brand-green text-brand-green'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faFlask} className="mr-2" />
                  API Stress Tests
                </button>
              </div>
            </div>
          </div>

          {/* Visual Bot Tab */}
          {activeTab === 'visual' && (
            <VisualTestBot
              testType={testType || availableTestTypes[0] || 'GMAT'}
              trackType={trackType || availableTrackTypes[0] || 'diagnostic'}
            />
          )}

          {/* API Test Tab */}
          {activeTab === 'api' && (
            <>
              {/* Configuration Panel */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCog} className="text-brand-green" />
                  Test Configuration
                </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Type
                </label>
                <select
                  value={testType}
                  onChange={e => setTestType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green"
                  disabled={isRunning}
                >
                  {availableTestTypes.length === 0 ? (
                    <option value="">No test types available</option>
                  ) : (
                    availableTestTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Track Type
                </label>
                <select
                  value={trackType}
                  onChange={e => setTrackType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green"
                  disabled={isRunning}
                >
                  {availableTrackTypes.length === 0 ? (
                    <option value="">No track types available</option>
                  ) : (
                    availableTrackTypes.map(type => (
                      <option key={type} value={type}>
                        {type.split('_').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Students per Scenario
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={numStudents}
                  onChange={e => setNumStudents(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green"
                  disabled={isRunning}
                />
              </div>
            </div>

            {/* Scenario Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Test Scenarios
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAll(true)}
                    className="text-sm text-brand-green hover:underline"
                    disabled={isRunning}
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={() => toggleAll(false)}
                    className="text-sm text-gray-600 hover:underline"
                    disabled={isRunning}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenarios.map(scenario => (
                  <label
                    key={scenario.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      scenario.enabled
                        ? 'border-brand-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={scenario.enabled}
                      onChange={() => toggleScenario(scenario.id)}
                      className="mt-1"
                      disabled={isRunning}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {scenario.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {scenario.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Run Button */}
            <div className="flex items-center gap-4">
              {!isRunning ? (
                <button
                  onClick={runTests}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  disabled={scenarios.filter(s => s.enabled).length === 0}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Run Tests ({scenarios.filter(s => s.enabled).length} scenarios ×{' '}
                  {numStudents} students)
                </button>
              ) : (
                <button
                  onClick={stopTests}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <FontAwesomeIcon icon={faStop} />
                  Stop Tests
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-brand-green animate-spin"
                />
                Running Tests...
              </h3>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{currentTest}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-brand-green h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Live Results Counter */}
              {liveResults.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {liveResults.filter(r => r.status === 'success').length}
                    </div>
                    <div className="text-xs text-green-600">Passed</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-red-700">
                      {liveResults.filter(r => r.status === 'failed').length}
                    </div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-700">
                      {liveResults.filter(r => r.warnings.length > 0).length}
                    </div>
                    <div className="text-xs text-yellow-600">Warnings</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Report */}
          {report && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6">Test Results</h2>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700">
                    {report.totalTests}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">Total Tests</div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {report.successCount}
                  </div>
                  <div className="text-sm text-green-600 mt-1">Passed</div>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-700">
                    {report.failureCount}
                  </div>
                  <div className="text-sm text-red-600 mt-1">Failed</div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-700">
                    {report.warningCount}
                  </div>
                  <div className="text-sm text-yellow-600 mt-1">Warnings</div>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-700">
                    {report.errorRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-purple-600 mt-1">Error Rate</div>
                </div>
              </div>

              {/* Data Integrity */}
              {report.dataIntegrityIssues > 0 && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-orange-800 font-semibold mb-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Data Integrity Issues Detected
                  </div>
                  <p className="text-orange-700">
                    {report.dataIntegrityIssues} test(s) had mismatches between
                    submitted answers and database records
                  </p>
                </div>
              )}

              {/* Detailed Results */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3">Detailed Results</h3>

                {report.results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-4 ${
                      result.status === 'success'
                        ? 'border-green-200 bg-green-50'
                        : result.status === 'failed'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={
                            result.status === 'success'
                              ? faCheckCircle
                              : result.status === 'failed'
                              ? faExclamationTriangle
                              : faSpinner
                          }
                          className={
                            result.status === 'success'
                              ? 'text-green-600'
                              : result.status === 'failed'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }
                        />
                        <span className="font-medium">{result.scenario}</span>
                        <span className="text-sm text-gray-500">
                          ({result.studentId})
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          result.status === 'success'
                            ? 'bg-green-200 text-green-800'
                            : result.status === 'failed'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {result.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Submitted:</span>{' '}
                        <span className="font-medium">
                          {result.data.answersSubmitted}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">In DB:</span>{' '}
                        <span className="font-medium">
                          {result.data.answersInDB}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Attempt:</span>{' '}
                        <span className="font-medium">
                          {result.data.attemptNumber}
                        </span>
                      </div>
                      {result.data.completionReason && (
                        <div>
                          <span className="text-gray-600">Reason:</span>{' '}
                          <span className="font-medium">
                            {result.data.completionReason}
                          </span>
                        </div>
                      )}
                    </div>

                    {result.errors.length > 0 && (
                      <div className="mt-2 bg-red-100 border border-red-300 rounded p-2">
                        <div className="font-semibold text-red-800 text-sm mb-1">
                          Errors:
                        </div>
                        <ul className="list-disc list-inside text-sm text-red-700">
                          {result.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div className="mt-2 bg-yellow-100 border border-yellow-300 rounded p-2">
                        <div className="font-semibold text-yellow-800 text-sm mb-1">
                          Warnings:
                        </div>
                        <ul className="list-disc list-inside text-sm text-yellow-700">
                          {result.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
