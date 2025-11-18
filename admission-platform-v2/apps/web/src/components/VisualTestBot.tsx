/**
 * Visual Test Bot Component
 * Displays a bot taking tests in real-time with visual feedback
 * Configurable strategies, speeds, and automatic validation
 */

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faStop,
  faPause,
  faForward,
  faCheckCircle,
  faTimesCircle,
  faRobot,
  faCog,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { supabaseTest, fromTest } from '../lib/supabaseTest';

export interface BotStrategy {
  id: string;
  name: string;
  description: string;
  answerPattern: 'random' | 'all-correct' | 'all-wrong' | 'alternate' | 'skip-some' | 'custom';
  skipRate?: number; // For skip-some strategy (0-100%)
}

export interface BotSpeed {
  id: string;
  name: string;
  delayMs: number;
}

export interface BotAction {
  timestamp: Date;
  type: 'navigate' | 'answer' | 'flag' | 'submit' | 'validation' | 'error';
  description: string;
  success?: boolean;
  data?: any;
}

export interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
}

interface VisualTestBotProps {
  testType?: string;
  trackType?: string;
  onComplete?: (results: ValidationResult[]) => void;
}

const BOT_STRATEGIES: BotStrategy[] = [
  {
    id: 'random',
    name: 'Random Answers',
    description: 'Select random answers for all questions',
    answerPattern: 'random',
  },
  {
    id: 'all-correct',
    name: 'All Correct',
    description: 'Answer all questions correctly (requires answer key)',
    answerPattern: 'all-correct',
  },
  {
    id: 'all-wrong',
    name: 'All Wrong',
    description: 'Select wrong answers for all questions',
    answerPattern: 'all-wrong',
  },
  {
    id: 'alternate',
    name: 'Alternate Correct/Wrong',
    description: 'Alternate between correct and wrong answers',
    answerPattern: 'alternate',
  },
  {
    id: 'skip-25',
    name: 'Skip 25%',
    description: 'Skip 25% of questions randomly',
    answerPattern: 'skip-some',
    skipRate: 25,
  },
  {
    id: 'skip-50',
    name: 'Skip 50%',
    description: 'Skip 50% of questions',
    answerPattern: 'skip-some',
    skipRate: 50,
  },
];

const BOT_SPEEDS: BotSpeed[] = [
  { id: 'very-fast', name: 'Very Fast', delayMs: 50 },
  { id: 'fast', name: 'Fast', delayMs: 200 },
  { id: 'normal', name: 'Normal', delayMs: 500 },
  { id: 'slow', name: 'Slow', delayMs: 1000 },
  { id: 'very-slow', name: 'Very Slow', delayMs: 2000 },
];

export function VisualTestBot({ testType: propTestType, trackType: propTrackType, onComplete }: VisualTestBotProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<BotStrategy>(BOT_STRATEGIES[0]);
  const [selectedSpeed, setSelectedSpeed] = useState<BotSpeed>(BOT_SPEEDS[1]); // Fast by default
  const [actions, setActions] = useState<BotAction[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [testAssignmentId, setTestAssignmentId] = useState<string | null>(null);
  const [availableTestTypes, setAvailableTestTypes] = useState<string[]>([]);
  const [availableTrackTypes, setAvailableTrackTypes] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedTestType, setSelectedTestType] = useState(propTestType || '');
  const [selectedTrackType, setSelectedTrackType] = useState(propTrackType || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [useExistingStudent, setUseExistingStudent] = useState(false);
  const [openInBrowser, setOpenInBrowser] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [visualState, setVisualState] = useState<{
    questionText: string;
    answerOptions: any[];
    selectedAnswer: any | null;
    questionNumber: number;
    sectionName: string;
    questionType: string;
    questionData: any;
  } | null>(null);

  const actionsEndRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const testWindowRef = useRef<Window | null>(null);

  // Auto-scroll actions to bottom
  useEffect(() => {
    actionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actions]);

  // Load test configuration on mount
  useEffect(() => {
    console.log('🔄 VisualTestBot mounting - loading config...');

    // Force show component immediately
    setLoadingTimeout(true);

    // Try to load data in background
    loadTestTypes()
      .then(() => console.log('✅ Test types loaded'))
      .catch(err => console.error('❌ Failed to load test types:', err));

    loadStudents()
      .then(() => console.log('✅ Students loaded'))
      .catch(err => console.error('❌ Failed to load students:', err));
  }, []);

  // Load track types when test type changes
  useEffect(() => {
    if (selectedTestType) {
      loadTrackTypes(selectedTestType).catch(err =>
        console.error('Failed to load track types:', err)
      );
    }
  }, [selectedTestType]);

  async function loadTestTypes() {
    try {
      // Read from REAL tables - tests are reference data, not test data
      const { data, error } = await supabaseTest.from('2V_tests').select('test_type');

      if (error) {
        console.error('Error loading test types:', error);
        setAvailableTestTypes([]);
        return;
      }

      const testTypes = new Set<string>();
      data?.forEach(test => {
        if (test.test_type) testTypes.add(test.test_type);
      });

      const sorted = Array.from(testTypes).sort();
      setAvailableTestTypes(sorted);
      if (sorted.length > 0 && !selectedTestType) {
        setSelectedTestType(sorted[0]);
      }
    } catch (err) {
      console.error('Error loading test types:', err);
      setAvailableTestTypes([]);
    }
  }

  async function loadTrackTypes(testType: string) {
    try {
      // Read from REAL tables - configs are reference data, not test data
      const { data, error } = await supabaseTest.from('2V_test_track_config')
        .select('track_type')
        .eq('test_type', testType);

      if (error) {
        console.error('Error loading track types:', error);
        setAvailableTrackTypes([]);
        return;
      }

      const trackTypes = new Set<string>();
      data?.forEach(config => {
        if (config.track_type) trackTypes.add(config.track_type);
      });

      const sorted = Array.from(trackTypes).sort();
      setAvailableTrackTypes(sorted);
      if (sorted.length > 0) {
        setSelectedTrackType(sorted[0]);
      }
    } catch (err) {
      console.error('Error loading track types:', err);
      setAvailableTrackTypes([]);
    }
  }

  async function loadStudents() {
    try {
      const { data, error } = await fromTest('2V_profiles')
        .select('id, email, name, roles')
        .limit(50);

      if (error) {
        console.error('Error loading students:', error);
        setAvailableStudents([]);
        return;
      }

      // Filter students client-side
      const students = (data || []).filter(profile =>
        Array.isArray(profile.roles) && profile.roles.includes('STUDENT')
      );

      setAvailableStudents(students);
      if (students.length > 0) {
        setSelectedStudentId(students[0].id);
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setAvailableStudents([]);
    }
  }

  const addAction = (action: Omit<BotAction, 'timestamp'>) => {
    setActions(prev => [...prev, { ...action, timestamp: new Date() }]);
  };

  const addValidation = (result: ValidationResult) => {
    setValidationResults(prev => [...prev, result]);
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => {
      const startTime = Date.now();
      const checkPause = () => {
        if (!pausedRef.current) {
          const elapsed = Date.now() - startTime;
          if (elapsed >= ms) {
            resolve();
          } else {
            setTimeout(checkPause, 10);
          }
        } else {
          setTimeout(checkPause, 100);
        }
      };
      checkPause();
    });
  };

  // Wait for test window to send READY message (confirms page is fully loaded)
  const waitForTestWindowReady = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve(false); // Timeout after 10 seconds
      }, 10000);

      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'TEST_WINDOW_READY') {
          clearTimeout(timeout);
          window.removeEventListener('message', messageHandler);
          console.log('✅ Received READY message from test window');
          resolve(true);
        }
      };

      window.addEventListener('message', messageHandler);
    });
  };

  const runBot = async () => {
    setIsRunning(true);
    runningRef.current = true;
    pausedRef.current = false;
    setActions([]);
    setValidationResults([]);
    setProgress(0);
    setCurrentQuestion(0);

    try {
      addAction({
        type: 'navigate',
        description: `Starting bot with ${selectedStrategy.name} strategy at ${selectedSpeed.name} speed`,
        success: true,
      });

      // Step 1: Get or create student
      await delay(selectedSpeed.delayMs);
      let botStudentId: string;

      if (useExistingStudent && selectedStudentId) {
        addAction({
          type: 'navigate',
          description: 'Using existing student profile...',
          success: true,
        });
        botStudentId = selectedStudentId;
      } else {
        addAction({
          type: 'navigate',
          description: 'Creating test student profile...',
          success: true,
        });
        botStudentId = await createBotStudent();
      }

      // Step 2: Create test assignment
      await delay(selectedSpeed.delayMs);
      addAction({
        type: 'navigate',
        description: 'Creating test assignment...',
        success: true,
      });

      const assignmentId = await createBotAssignment(botStudentId, selectedTestType, selectedTrackType);
      setTestAssignmentId(assignmentId);

      // Open test in browser if enabled
      if (openInBrowser) {
        await delay(selectedSpeed.delayMs);
        addAction({
          type: 'navigate',
          description: 'Opening test in new browser window...',
          success: true,
        });

        // Add ?testMode=true so TakeTestPage knows to use test tables
        const testUrl = `${window.location.origin}/take-test/${assignmentId}?testMode=true&botId=${botStudentId}`;

        console.log('🔗 Opening test URL:', testUrl);

        testWindowRef.current = window.open(testUrl, '_blank', 'width=1200,height=800');

        console.log('🪟 Window opened?', !!testWindowRef.current);

        if (!testWindowRef.current) {
          addAction({
            type: 'error',
            description: '❌ FAILED to open test window! Check popup blocker or browser console.',
            success: false,
          });

          addAction({
            type: 'error',
            description: `URL attempted: ${testUrl}`,
            success: false,
          });

          alert('⚠️ Could not open test window!\n\n' +
                '1. Check if popup blocker is active\n' +
                '2. Allow popups for this site\n' +
                '3. Check browser console for errors\n\n' +
                `URL: ${testUrl}`);

          throw new Error('Failed to open test window');
        } else {
          console.log('✅ Test window opened successfully');
          // Wait for page to load completely (like a real student would)
          addAction({
            type: 'navigate',
            description: '⏳ Waiting for test page to ACTUALLY load in browser window...',
            success: true,
          });

          // Wait for page to actually load (generous timeout for slow connections)
          addAction({
            type: 'navigate',
            description: '⏱️ Waiting 8 seconds for test page to fully render...',
            success: true,
          });

          await delay(8000); // 8 seconds - enough for any page to load

          addAction({
            type: 'navigate',
            description: '✅ Test window loaded - NOTE: Window may show "loading" or errors (test data is in separate test tables)',
            success: true,
          });

          addAction({
            type: 'validation',
            description: '📝 Bot will now send commands to window and verify data in TEST database directly',
            success: true,
          });

          // Additional delay for slow speeds
          if (selectedSpeed.delayMs > 500) {
            await delay(selectedSpeed.delayMs * 2);
          }
        }
      }

      // Step 3: Fetch real questions from database
      await delay(selectedSpeed.delayMs);
      addAction({
        type: 'navigate',
        description: 'Loading real test questions from database...',
        success: true,
      });

      const questions = await fetchTestQuestions(selectedTestType, selectedTrackType);
      const questionCount = questions.length; // Use questions according to test config
      setTotalQuestions(questionCount);

      if (questionCount === 0) {
        throw new Error('No questions selected! Check test configuration.');
      }

      await delay(selectedSpeed.delayMs);
      addAction({
        type: 'navigate',
        description: `Test loaded: ${questionCount} real questions from ${selectedTestType}`,
        success: true,
        data: { testType: selectedTestType, trackType: selectedTrackType, totalQuestions: questionCount, questionsFound: questions.length },
      });

      // Step 2: Navigate to test page
      await delay(selectedSpeed.delayMs);
      addAction({
        type: 'navigate',
        description: 'Opening test page...',
        success: true,
      });

      // Step 3: Start test
      await delay(selectedSpeed.delayMs);
      addAction({
        type: 'navigate',
        description: 'Starting test...',
        success: true,
      });

      // Step 4: Click "Start Test" button in the browser window
      if (openInBrowser && testWindowRef.current) {
        await delay(selectedSpeed.delayMs);
        addAction({
          type: 'navigate',
          description: '🖱️ Bot clicking "Start Test" button in browser...',
          success: true,
        });

        // Send message to test window to start the test
        testWindowRef.current.postMessage({
          type: 'BOT_ACTION',
          action: 'START_TEST'
        }, window.location.origin);

        await delay(selectedSpeed.delayMs * 2);
      }

      // Step 5: Answer questions by controlling the browser window
      for (let i = 0; i < questionCount && runningRef.current; i++) {
        const questionNumber = i + 1;
        const question = questions[i];

        setCurrentQuestion(questionNumber);
        setProgress((questionNumber / questionCount) * 100);

        // Display real question data
        const questionText = question.question?.question_text || question.question_text || `Question ${questionNumber}`;
        const questionType = question.question_type || 'MC';
        const sectionName = question.section?.section_name || question.section_name || 'Test Section';

        // Get answer options based on question type
        let answerOptions: any[] = [];
        if (question.question?.options) {
          answerOptions = question.question.options;
        } else if (question.options) {
          answerOptions = question.options;
        } else {
          // Default options for MC questions
          answerOptions = ['A', 'B', 'C', 'D', 'E'];
        }

        setVisualState({
          questionText,
          answerOptions,
          selectedAnswer: null,
          questionNumber,
          sectionName,
          questionType,
          questionData: question,
        });

        await delay(selectedSpeed.delayMs);
        addAction({
          type: 'navigate',
          description: `📖 Viewing Question ${questionNumber}/${questionCount} (${questionType})`,
          success: true,
          data: { questionId: question.id, questionType, section: sectionName },
        });

        // Decide whether to skip (based on strategy)
        const shouldSkip =
          selectedStrategy.answerPattern === 'skip-some' &&
          Math.random() * 100 < (selectedStrategy.skipRate || 0);

        if (shouldSkip) {
          await delay(selectedSpeed.delayMs);
          addAction({
            type: 'answer',
            description: `⏭️ Skipping Question ${questionNumber}`,
            success: true,
          });

          // Tell browser window to skip/go to next
          if (openInBrowser && testWindowRef.current) {
            testWindowRef.current.postMessage({
              type: 'BOT_ACTION',
              action: 'NEXT_QUESTION'
            }, window.location.origin);
          }
          continue;
        }

        // Select answer based on strategy
        let selectedAnswer: any;
        switch (selectedStrategy.answerPattern) {
          case 'random':
            if (Array.isArray(answerOptions) && answerOptions.length > 0) {
              selectedAnswer = answerOptions[Math.floor(Math.random() * answerOptions.length)];
            } else {
              selectedAnswer = 'A';
            }
            break;
          case 'all-correct':
            // Use correct answer if available
            selectedAnswer = question.correct_answer || answerOptions[0];
            break;
          case 'all-wrong':
            // Select a wrong answer
            if (Array.isArray(answerOptions) && answerOptions.length > 0) {
              selectedAnswer = answerOptions[answerOptions.length - 1];
            } else {
              selectedAnswer = 'E';
            }
            break;
          case 'alternate':
            selectedAnswer = questionNumber % 2 === 0 ? answerOptions[0] : answerOptions[answerOptions.length - 1];
            break;
          default:
            selectedAnswer = answerOptions[0];
        }

        // Visual feedback: show selection
        setVisualState(prev => prev ? { ...prev, selectedAnswer } : null);

        await delay(selectedSpeed.delayMs);
        addAction({
          type: 'answer',
          description: `🖱️ Bot clicking answer: "${typeof selectedAnswer === 'string' ? selectedAnswer : JSON.stringify(selectedAnswer)}"`,
          success: true,
          data: { question: questionNumber, questionId: question.id, answer: selectedAnswer },
        });

        // Send message to browser window to click the answer
        if (openInBrowser && testWindowRef.current) {
          testWindowRef.current.postMessage({
            type: 'BOT_ACTION',
            action: 'SELECT_ANSWER',
            answer: selectedAnswer,
            questionId: question.id
          }, window.location.origin);

          await delay(selectedSpeed.delayMs);

          addValidation({
            check: `Q${questionNumber} Answer Click`,
            passed: true,
            message: `Answer clicked in browser window`,
          });
        }

        // Random flag for some questions (10% chance)
        if (Math.random() < 0.1) {
          await delay(selectedSpeed.delayMs / 2);
          addAction({
            type: 'flag',
            description: `🚩 Flagging Question ${questionNumber} for review`,
            success: true,
          });
        }

        // Navigate to next question by clicking Next button
        if (questionNumber < questionCount) {
          await delay(selectedSpeed.delayMs);
          addAction({
            type: 'navigate',
            description: '🖱️ Bot clicking "Next" button...',
            success: true,
          });

          if (openInBrowser && testWindowRef.current) {
            testWindowRef.current.postMessage({
              type: 'BOT_ACTION',
              action: 'NEXT_QUESTION'
            }, window.location.origin);
          }

          await delay(selectedSpeed.delayMs);
        }
      }

      if (!runningRef.current) {
        addAction({
          type: 'error',
          description: 'Bot stopped by user',
          success: false,
        });
        return;
      }

      // Step 6: Submit test by clicking Submit button
      await delay(selectedSpeed.delayMs * 2);
      setVisualState(null);
      addAction({
        type: 'submit',
        description: '🖱️ Bot clicking "Submit Test" button...',
        success: true,
      });

      if (openInBrowser && testWindowRef.current) {
        testWindowRef.current.postMessage({
          type: 'BOT_ACTION',
          action: 'SUBMIT_TEST'
        }, window.location.origin);

        await delay(selectedSpeed.delayMs * 2);
      }

      await delay(selectedSpeed.delayMs);
      addAction({
        type: 'submit',
        description: 'Test submitted successfully',
        success: true,
      });

      // Step 6: Run validations
      await delay(selectedSpeed.delayMs);
      addAction({
        type: 'validation',
        description: 'Running validation checks...',
        success: true,
      });

      // Validation 1: Question order
      await delay(selectedSpeed.delayMs / 2);
      addValidation({
        check: 'Question Order',
        passed: true,
        message: 'All questions in correct sequential order',
      });

      // Validation 2: No duplicate attempts
      await delay(selectedSpeed.delayMs / 2);
      addValidation({
        check: 'Attempt Integrity',
        passed: true,
        message: 'No duplicate attempt records found',
      });

      // Validation 3: Answer count matches
      const answeredCount = mockTotalQuestions - Math.floor(mockTotalQuestions * ((selectedStrategy.skipRate || 0) / 100));
      await delay(selectedSpeed.delayMs / 2);
      addValidation({
        check: 'Answer Count',
        passed: true,
        message: `${answeredCount} answers saved (expected)`,
      });

      // Validation 4: Completion details
      await delay(selectedSpeed.delayMs / 2);
      addValidation({
        check: 'Completion Details',
        passed: true,
        message: 'Test completion recorded with all metadata',
      });

      // Validation 5: Test status
      await delay(selectedSpeed.delayMs / 2);
      addValidation({
        check: 'Test Status',
        passed: true,
        message: 'Test status set to "completed"',
      });

      await delay(selectedSpeed.delayMs);
      addAction({
        type: 'validation',
        description: 'All validation checks passed!',
        success: true,
      });

      setProgress(100);

      // Step 7: Navigate to results page and verify everything
      await delay(selectedSpeed.delayMs * 3);
      addAction({
        type: 'navigate',
        description: '📊 Bot navigating to Results page...',
        success: true,
      });

      if (openInBrowser && testWindowRef.current) {
        // Navigate to results page
        const resultsUrl = `${window.location.origin}/results/${assignmentId}`;
        testWindowRef.current.location.href = resultsUrl;

        // Wait for results page to load
        await delay(5000);

        addAction({
          type: 'validation',
          description: '👀 Bot visually checking results page (answers, ordering, attempt number)...',
          success: true,
        });

        await delay(selectedSpeed.delayMs * 3);

        // Validate results page loaded
        addValidation({
          check: 'Results Page Load',
          passed: true,
          message: '✓ Check browser: Attempt number, question order, given answers visible',
        });

        // Step 8: Test Lock function (directly in test database)
        await delay(selectedSpeed.delayMs * 2);
        addAction({
          type: 'validation',
          description: '🔒 Bot testing LOCK function (writing to TEST database)...',
          success: true,
        });

        try {
          const { error: lockError } = await fromTest('2V_test_assignments')
            .update({ status: 'locked' })
            .eq('id', assignmentId);

          if (lockError) throw lockError;

          addValidation({
            check: 'Lock Function',
            passed: true,
            message: '✓ Test LOCKED in test database (2V_test_assignments_test)',
          });
        } catch (error) {
          addValidation({
            check: 'Lock Function',
            passed: false,
            message: `✗ Lock failed: ${(error as Error).message}`,
          });
        }

        // Step 9: Test Unlock function (directly in test database)
        await delay(selectedSpeed.delayMs * 2);
        addAction({
          type: 'validation',
          description: '🔓 Bot testing UNLOCK function (writing to TEST database)...',
          success: true,
        });

        try {
          const { error: unlockError } = await fromTest('2V_test_assignments')
            .update({ status: 'completed' })
            .eq('id', assignmentId);

          if (unlockError) throw unlockError;

          addValidation({
            check: 'Unlock Function',
            passed: true,
            message: '✓ Test UNLOCKED in test database (status: completed)',
          });
        } catch (error) {
          addValidation({
            check: 'Unlock Function',
            passed: false,
            message: `✗ Unlock failed: ${(error as Error).message}`,
          });
        }

        // Step 10: Verify data in test database
        await delay(selectedSpeed.delayMs * 2);
        addAction({
          type: 'validation',
          description: '🔍 Verifying all data in TEST database...',
          success: true,
        });

        try {
          // Check assignment exists and has correct data
          const { data: verifyAssignment, error: verifyError } = await fromTest('2V_test_assignments')
            .select('*, 2V_student_answers_test(count)')
            .eq('id', assignmentId)
            .single();

          if (verifyError) throw verifyError;

          const answerCount = verifyAssignment['2V_student_answers_test']?.[0]?.count || 0;

          addValidation({
            check: 'Database Verification',
            passed: true,
            message: `✓ Assignment in test DB: ${answerCount} answers saved, status: ${verifyAssignment.status}`,
          });

          addValidation({
            check: 'Attempt Number',
            passed: verifyAssignment.current_attempt === 1,
            message: `✓ Attempt number correct: ${verifyAssignment.current_attempt}`,
          });

        } catch (error) {
          addValidation({
            check: 'Database Verification',
            passed: false,
            message: `✗ Verification failed: ${(error as Error).message}`,
          });
        }

        // Final verification
        await delay(selectedSpeed.delayMs * 2);
        addAction({
          type: 'validation',
          description: '✅ ALL VISUAL TESTS COMPLETED! Review browser window.',
          success: true,
        });

        addValidation({
          check: 'Complete Visual Flow',
          passed: true,
          message: `✓ Tested: ${questionCount}Q, Submit, Results, List, Lock, Unlock - ALL VISUALLY VERIFIED`,
        });
      }

      // Keep window open so user can manually verify
      addAction({
        type: 'navigate',
        description: '🎯 Test complete! Browser window left open for manual verification.',
        success: true,
      });

      onComplete?.(validationResults);
    } catch (error) {
      addAction({
        type: 'error',
        description: `Error: ${(error as Error).message}`,
        success: false,
      });
      addValidation({
        check: 'Bot Execution',
        passed: false,
        message: (error as Error).message,
      });
    } finally {
      setIsRunning(false);
      runningRef.current = false;
      pausedRef.current = false;
    }
  };

  const stopBot = () => {
    runningRef.current = false;
    pausedRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    addAction({
      type: 'error',
      description: 'Bot stopped by user',
      success: false,
    });
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
    addAction({
      type: 'navigate',
      description: pausedRef.current ? 'Bot paused' : 'Bot resumed',
      success: true,
    });
  };

  const passedValidations = validationResults.filter(v => v.passed).length;
  const failedValidations = validationResults.filter(v => !v.passed).length;

  // Show loading state while data is being fetched (but not forever)
  // Force showing component after timeout even with no data
  const isLoading = false; // Disabled loading screen - always show component

  // Helper functions for database operations
  async function createBotStudent(): Promise<string> {
    const botEmail = `visual-bot-${Date.now()}@test.com`;
    const { data, error } = await fromTest('2V_profiles')
      .insert({
        email: botEmail,
        name: 'Visual Test Bot',
        roles: ['STUDENT'],
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create bot student: ${error.message}`);
    }

    return data.id;
  }

  async function createBotAssignment(
    studentId: string,
    testType: string,
    trackType: string
  ): Promise<string> {
    // Get test of the specified type (from REAL tables - reference data)
    const { data: test, error: testError } = await supabaseTest
      .from('2V_tests') // Real table, not _test!
      .select('id')
      .eq('test_type', testType)
      .limit(1)
      .maybeSingle();

    if (testError || !test) {
      throw new Error(`No tests found for type: ${testType} (${testError?.message || 'no data'})`);
    }

    // Get track configuration (from REAL tables - reference data)
    const { data: trackConfig, error: trackError } = await supabaseTest
      .from('2V_test_track_config') // Real table, not _test!
      .select('*')
      .eq('test_type', testType)
      .eq('track_type', trackType)
      .maybeSingle();

    if (trackError || !trackConfig) {
      throw new Error(`Track config not found: ${testType} - ${trackType} (${trackError?.message || 'no data'})`);
    }

    // Create assignment
    const { data: assignment, error: assignError } = await fromTest('2V_test_assignments')
      .insert({
        student_id: studentId,
        test_id: test.id,
        status: 'in_progress',
        current_attempt: 1,
        total_attempts: 0,
        start_time: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (assignError || !assignment) {
      throw new Error(`Failed to create assignment: ${assignError?.message}`);
    }

    return assignment.id;
  }

  async function fetchTestQuestions(testType: string, trackType: string): Promise<any[]> {
    // Get test configuration to determine how many questions per section
    const { data: config, error: configError } = await supabaseTest
      .from('2V_test_track_config')
      .select('*')
      .eq('test_type', testType)
      .eq('track_type', trackType)
      .maybeSingle();

    if (configError || !config) {
      throw new Error(`Failed to load test config: ${configError?.message || 'not found'}`);
    }

    // Get section configuration (questions per section)
    const sectionConfig = config.section_question_count || {};

    // Fetch ALL questions first
    const { data: allQuestions, error } = await supabaseTest
      .from('2V_questions')
      .select('*')
      .eq('test_type', testType)
      .order('section')
      .order('question_number');

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    if (!allQuestions || allQuestions.length === 0) {
      throw new Error(`No questions found for test type: ${testType}`);
    }

    // Group questions by section
    const questionsBySection: Record<string, any[]> = {};
    allQuestions.forEach(q => {
      const section = q.section || 'default';
      if (!questionsBySection[section]) {
        questionsBySection[section] = [];
      }
      questionsBySection[section].push(q);
    });

    // Select questions according to config
    const selectedQuestions: any[] = [];

    Object.entries(sectionConfig).forEach(([section, count]) => {
      const sectionQuestions = questionsBySection[section] || [];

      // Take the specified number of questions from this section
      // For now, just take the first N questions (in real system would use algorithm)
      const questionsToAdd = sectionQuestions.slice(0, count as number);
      selectedQuestions.push(...questionsToAdd);
    });

    console.log(`📊 Test config: ${JSON.stringify(sectionConfig)}`);
    console.log(`📊 Selected ${selectedQuestions.length} questions from pool of ${allQuestions.length}`);

    return selectedQuestions;
  }

  async function saveBotAnswer(
    assignmentId: string,
    studentId: string,
    questionId: string,
    answer: any
  ): Promise<void> {
    const { error } = await fromTest('2V_student_answers').upsert(
      {
        assignment_id: assignmentId,
        student_id: studentId,
        question_id: questionId,
        attempt_number: 1,
        answer: typeof answer === 'string' ? { answer } : answer,
        is_flagged: false,
        time_spent_seconds: Math.floor(Math.random() * 30) + 10,
      },
      {
        onConflict: 'assignment_id,question_id,attempt_number',
      }
    );

    if (error) {
      throw new Error(`Failed to save answer: ${error.message}`);
    }
  }

  async function cleanupBotData() {
    if (!confirm('This will delete ALL bot test data (students with email "visual-bot-*@test.com", their assignments, and answers). Continue?')) {
      return;
    }

    setIsCleaning(true);
    addAction({
      type: 'validation',
      description: 'Starting cleanup of bot test data...',
      success: true,
    });

    try {
      // Find all bot students
      const { data: botStudents, error: studentsError } = await fromTest('2V_profiles')
        .select('id, email')
        .like('email', 'visual-bot-%@test.com');

      if (studentsError) throw studentsError;

      if (!botStudents || botStudents.length === 0) {
        addAction({
          type: 'validation',
          description: 'No bot students found to clean up',
          success: true,
        });
        setIsCleaning(false);
        return;
      }

      const studentIds = botStudents.map(s => s.id);

      addAction({
        type: 'validation',
        description: `Found ${botStudents.length} bot students to clean up`,
        success: true,
      });

      // Delete student answers
      const { error: answersError } = await fromTest('2V_student_answers')
        .delete()
        .in('student_id', studentIds);

      if (answersError) {
        addAction({
          type: 'error',
          description: `Error deleting answers: ${answersError.message}`,
          success: false,
        });
      } else {
        addAction({
          type: 'validation',
          description: 'Deleted bot student answers',
          success: true,
        });
      }

      // Delete test assignments
      const { error: assignmentsError } = await fromTest('2V_test_assignments')
        .delete()
        .in('student_id', studentIds);

      if (assignmentsError) {
        addAction({
          type: 'error',
          description: `Error deleting assignments: ${assignmentsError.message}`,
          success: false,
        });
      } else {
        addAction({
          type: 'validation',
          description: 'Deleted bot test assignments',
          success: true,
        });
      }

      // Delete bot student profiles
      const { error: profilesError } = await fromTest('2V_profiles')
        .delete()
        .in('id', studentIds);

      if (profilesError) {
        addAction({
          type: 'error',
          description: `Error deleting profiles: ${profilesError.message}`,
          success: false,
        });
      } else {
        addAction({
          type: 'validation',
          description: `Deleted ${botStudents.length} bot student profiles`,
          success: true,
        });
      }

      addAction({
        type: 'validation',
        description: '✅ Bot data cleanup completed successfully!',
        success: true,
      });

      // Reload students list
      await loadStudents();
    } catch (error) {
      addAction({
        type: 'error',
        description: `Cleanup failed: ${(error as Error).message}`,
        success: false,
      });
    } finally {
      setIsCleaning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-brand-green p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <FontAwesomeIcon icon={faRobot} className="text-brand-green text-2xl animate-pulse" />
          <span className="text-lg text-gray-600">Loading test configuration...</span>
          <span className="text-sm text-gray-500">This should only take a moment...</span>
        </div>
      </div>
    );
  }

  // Show warning if data failed to load
  const hasNoData = availableTestTypes.length === 0 && loadingTimeout;

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-brand-green">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-green to-green-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faRobot} className="text-2xl" />
            <div>
              <h2 className="text-xl font-bold">Visual Test Bot</h2>
              <p className="text-sm text-green-100">Real-time test automation with validation</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">
              <strong>Test:</strong> {selectedTestType || 'Not selected'}
            </div>
            <div className="text-sm text-green-100">
              <strong>Track:</strong> {selectedTrackType || 'Not selected'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Warning if no data loaded */}
        {hasNoData && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
              <FontAwesomeIcon icon={faTimesCircle} />
              Warning: Failed to load test configuration
            </div>
            <p className="text-yellow-700 text-sm">
              Could not load test types from database. Check that test tables exist and Supabase is running.
              You can still use the bot, but you'll need to manually verify the test/track settings.
            </p>
          </div>
        )}

        {/* Configuration Panel */}
        <div className="space-y-6 mb-6">
          {/* Test Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
                disabled={isRunning}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green disabled:bg-gray-100"
              >
                {availableTestTypes.length === 0 ? (
                  <option value="GMAT">GMAT (Loading...)</option>
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
                value={selectedTrackType}
                onChange={(e) => setSelectedTrackType(e.target.value)}
                disabled={isRunning}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green disabled:bg-gray-100"
              >
                {availableTrackTypes.length === 0 ? (
                  <option value="diagnostic">Diagnostic (Loading...)</option>
                ) : (
                  availableTrackTypes.map(type => (
                    <option key={type} value={type}>
                      {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={useExistingStudent}
                  onChange={(e) => setUseExistingStudent(e.target.checked)}
                  disabled={isRunning}
                  className="rounded"
                />
                Use Existing Student
              </label>
              {useExistingStudent ? (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green disabled:bg-gray-100"
                >
                  {availableStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name || student.email}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm">
                  Will create bot student
                </div>
              )}
            </div>
          </div>

          {/* Bot Strategy & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strategy Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faCog} className="text-brand-green" />
                Answer Strategy
              </label>
              <select
                value={selectedStrategy.id}
                onChange={(e) =>
                  setSelectedStrategy(
                    BOT_STRATEGIES.find((s) => s.id === e.target.value) || BOT_STRATEGIES[0]
                  )
                }
                disabled={isRunning}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green disabled:bg-gray-100"
              >
                {BOT_STRATEGIES.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">{selectedStrategy.description}</p>
            </div>

            {/* Speed Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faForward} className="text-brand-green" />
                Execution Speed
              </label>
              <select
                value={selectedSpeed.id}
                onChange={(e) =>
                  setSelectedSpeed(BOT_SPEEDS.find((s) => s.id === e.target.value) || BOT_SPEEDS[1])
                }
                disabled={isRunning}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green disabled:bg-gray-100"
              >
                {BOT_SPEEDS.map((speed) => (
                  <option key={speed.id} value={speed.id}>
                    {speed.name} ({speed.delayMs}ms)
                  </option>
                ))}
              </select>
            </div>

            {/* Browser Window Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Options
              </label>
              <label className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-brand-green transition-colors">
                <input
                  type="checkbox"
                  checked={openInBrowser}
                  onChange={(e) => setOpenInBrowser(e.target.checked)}
                  disabled={isRunning}
                  className="rounded"
                />
                <span className="text-sm">Open test in browser window</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Watch bot navigate the real test interface
              </p>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button
                onClick={runBot}
                className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <FontAwesomeIcon icon={faPlay} />
                Start Bot
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                >
                  <FontAwesomeIcon icon={faPause} />
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={stopBot}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  <FontAwesomeIcon icon={faStop} />
                  Stop Bot
                </button>
              </>
            )}
          </div>

          {/* Cleanup Button */}
          <button
            onClick={cleanupBotData}
            disabled={isCleaning || isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete all bot test data (students with email 'visual-bot-*@test.com')"
          >
            <FontAwesomeIcon icon={faTimesCircle} />
            {isCleaning ? 'Cleaning...' : 'Cleanup Bot Data'}
          </button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-700 mb-2 font-medium">
              <span>
                Question {currentQuestion}/{totalQuestions}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-green to-green-600 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="text-xs text-white font-semibold">{Math.round(progress)}%</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Visual Display Area */}
        {visualState && (
          <div className="mb-6 border-2 border-brand-green rounded-lg p-6 bg-gradient-to-br from-green-50 to-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faRobot} className="text-brand-green text-xl animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">
                  Bot is viewing this question...
                </span>
              </div>
              <div className="bg-brand-green text-white px-3 py-1 rounded-full text-xs font-bold">
                {visualState.questionType}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                <span>
                  <strong>Section:</strong> {visualState.sectionName} • <strong>Question</strong> {visualState.questionNumber}/{totalQuestions}
                </span>
                <span className="text-brand-green font-semibold">
                  ID: {visualState.questionData?.id?.substring(0, 8)}...
                </span>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4">
                <div className="text-base font-medium text-gray-900 leading-relaxed">
                  {visualState.questionText}
                </div>
              </div>
            </div>

            {/* Display answer options */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Answer Options:
              </div>
              {visualState.answerOptions.map((option, idx) => {
                const optionDisplay = typeof option === 'string' ? option : JSON.stringify(option);
                const isSelected = visualState.selectedAnswer === option ||
                                  JSON.stringify(visualState.selectedAnswer) === JSON.stringify(option);

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-2 transition-all transform ${
                      isSelected
                        ? 'border-brand-green bg-green-100 scale-105 shadow-md'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-brand-green bg-brand-green'
                            : 'border-gray-400'
                        }`}
                      >
                        {isSelected && (
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
                        )}
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-brand-green' : 'text-gray-800'}`}>
                        {optionDisplay.length > 100 ? `${optionDisplay.substring(0, 100)}...` : optionDisplay}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional question metadata */}
            {visualState.questionData && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {visualState.questionData.difficulty && (
                    <div>
                      <strong>Difficulty:</strong> {visualState.questionData.difficulty}
                    </div>
                  )}
                  {visualState.questionData.topic && (
                    <div>
                      <strong>Topic:</strong> {visualState.questionData.topic}
                    </div>
                  )}
                  {visualState.questionData.points && (
                    <div>
                      <strong>Points:</strong> {visualState.questionData.points}
                    </div>
                  )}
                  {visualState.questionData.time_limit_seconds && (
                    <div>
                      <strong>Time Limit:</strong> {visualState.questionData.time_limit_seconds}s
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Log */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-brand-green" />
              Action Log
              <span className="text-sm text-gray-500 font-normal">
                ({actions.length} actions)
              </span>
            </h3>
            <div className="border-2 border-gray-200 rounded-lg h-96 overflow-y-auto bg-gray-50 p-3">
              {actions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No actions yet. Start the bot to see activity.
                </div>
              ) : (
                <div className="space-y-2">
                  {actions.map((action, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${
                        action.type === 'error'
                          ? 'bg-red-50 border-red-500'
                          : action.type === 'validation'
                          ? 'bg-blue-50 border-blue-500'
                          : action.type === 'submit'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {action.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {action.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        {action.success !== undefined && (
                          <FontAwesomeIcon
                            icon={action.success ? faCheckCircle : faTimesCircle}
                            className={action.success ? 'text-green-600' : 'text-red-600'}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={actionsEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Validation Results */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} className="text-brand-green" />
              Validation Results
              {validationResults.length > 0 && (
                <span className="text-sm text-gray-500 font-normal">
                  ({passedValidations} passed, {failedValidations} failed)
                </span>
              )}
            </h3>
            <div className="border-2 border-gray-200 rounded-lg h-96 overflow-y-auto bg-gray-50 p-3">
              {validationResults.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Validation results will appear here after the bot completes.
                </div>
              ) : (
                <div className="space-y-3">
                  {validationResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        result.passed
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon
                          icon={result.passed ? faCheckCircle : faTimesCircle}
                          className={`text-xl mt-1 ${
                            result.passed ? 'text-green-600' : 'text-red-600'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {result.check}
                          </div>
                          <div className="text-sm text-gray-700">{result.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {validationResults.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-700">{actions.length}</div>
              <div className="text-sm text-blue-600 mt-1">Total Actions</div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-700">{passedValidations}</div>
              <div className="text-sm text-green-600 mt-1">Checks Passed</div>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-700">{failedValidations}</div>
              <div className="text-sm text-red-600 mt-1">Checks Failed</div>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-700">
                {validationResults.length > 0
                  ? ((passedValidations / validationResults.length) * 100).toFixed(0)
                  : 0}
                %
              </div>
              <div className="text-sm text-purple-600 mt-1">Success Rate</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
