/**
 * Take Test Screen (Mobile) - FULL IMPLEMENTATION
 * Universal test-taking interface with all features:
 * - All 6 question types
 * - Adaptive algorithms
 * - Timers
 * - Section management
 * - App exit detection (instead of fullscreen)
 * - Pause functionality
 * - Answer submission
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faFlag,
  faClock,
  faCheckCircle,
  faPause,
  faPlay,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import {
  MultipleChoiceQuestion,
  DSQuestion,
  MSRQuestion,
  GIQuestion,
  TAQuestion,
  TPAQuestion,
} from '../components/questions';
import {
  createAdaptiveAlgorithm,
  SimpleAdaptiveAlgorithm,
  ComplexAdaptiveAlgorithm,
} from '../lib/algorithms/adaptiveAlgorithm';

const COLORS = {
  brandDark: '#1c2545',
  brandGreen: '#00a666',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  red500: '#EF4444',
  red600: '#DC2626',
  yellow500: '#F59E0B',
};

interface Question {
  id: string;
  test_type: string;
  section: string;
  question_number: number;
  question_type: string;
  difficulty: string;
  question_data: any;
  answers: any;
  correct_answer?: string;
  is_base?: boolean;
  discrimination?: number;
  guessing?: number;
  exposure_count?: number;
}

interface TestConfig {
  test_type: string;
  track_type: string;
  section_order_mode: 'mandatory' | 'user_choice';
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
  test_start_message?: string;
  question_order?: 'random' | 'sequential';
  adaptivity_mode?: 'adaptive' | 'static';
  use_base_questions?: boolean;
  base_questions_scope?: 'per_section' | 'per_test';
  base_questions_count?: number;
  algorithm_type?: 'simple' | 'complex';
  baseline_difficulty?: number | string;
  questions_per_section?: Record<string, number>;
}

interface StudentAnswer {
  questionId: string;
  answer: string | null;
  timeSpent: number;
  flagged: boolean;
  msrAnswers?: string[];
  blank1?: string;
  blank2?: string;
  taAnswers?: Record<number, 'true' | 'false'>;
  column1?: string;
  column2?: string;
}

export default function TakeTestScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { assignmentId } = route.params;

  // Debug: Log route params on mount
  useEffect(() => {
    console.log('📱 TakeTestScreen mounted');
    console.log('Route params:', route.params);
    console.log('Assignment ID:', assignmentId);

    // If no assignmentId, show error
    if (!assignmentId) {
      console.error('❌ No assignment ID provided!');
      Alert.alert(
        'Error',
        'No test assignment found. Please go back and select a test.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, []);

  // State
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionPool, setQuestionPool] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});

  // Screen states
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showSectionSelectionScreen, setShowSectionSelectionScreen] = useState(false);
  const [showPauseScreen, setShowPauseScreen] = useState(false);
  const [showPauseChoiceScreen, setShowPauseChoiceScreen] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showAnswerRequiredMessage, setShowAnswerRequiredMessage] = useState(false);
  const [showSectionTransition, setShowSectionTransition] = useState(false);

  // Timers
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState<number | null>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [sectionStartTime, setSectionStartTime] = useState<Date | null>(null);
  const [pausesUsed, setPausesUsed] = useState(0);
  const [userSelectedSections, setUserSelectedSections] = useState<string[]>([]);

  // App exit detection
  const [testAnnulled, setTestAnnulled] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(5);
  const [pauseChoiceCountdown, setPauseChoiceCountdown] = useState(5);
  const [sectionTransitionCountdown, setSectionTransitionCountdown] = useState(5);

  // Adaptive testing
  const [adaptiveAlgorithm, setAdaptiveAlgorithm] = useState<SimpleAdaptiveAlgorithm | ComplexAdaptiveAlgorithm | null>(null);
  const [algorithmConfig, setAlgorithmConfig] = useState<any>(null);
  const [baseQuestionsCompletedPerSection, setBaseQuestionsCompletedPerSection] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Get current section and questions
  const currentSection = sections[currentSectionIndex];
  const questionsToUse = config?.adaptivity_mode === 'adaptive' && selectedQuestions.length > 0
    ? selectedQuestions
    : allQuestions;
  const sectionQuestions = questionsToUse.filter(q => q.section === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];
  const totalQuestionsInSection = sectionQuestions.length;

  // Debug: Log only when question data is problematic
  if (currentQuestion && !currentQuestion.question_data) {
    console.error('⚠️ Current question has no question_data:', currentQuestion);
  }
  if (currentQuestion && Object.keys(currentQuestion.question_data || {}).length === 0) {
    console.error('⚠️ Current question has empty question_data:', currentQuestion);
  }

  // Calculate section question limit
  const calculateSectionQuestionLimit = (): number => {
    if (config?.questions_per_section) {
      return config.questions_per_section[currentSection] || 20;
    }
    return totalQuestionsInSection;
  };
  const sectionQuestionLimit = calculateSectionQuestionLimit();

  useEffect(() => {
    loadTestData();

    // Monitor app state for exit detection
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Prevent navigation away from test screen
    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e) => {
      // If test is in progress, prevent navigation
      if (
        !showStartScreen &&
        !showSectionSelectionScreen &&
        !showCompletionScreen &&
        !testAnnulled
      ) {
        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Show confirmation alert
        Alert.alert(
          'Exit Test?',
          'Are you sure you want to exit the test? Your test will be annulled.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Exit',
              style: 'destructive',
              onPress: () => {
                annulTest();
                // Allow navigation after annulment
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      subscription.remove();
      backHandler.remove();
      unsubscribeBeforeRemove();
    };
  }, [assignmentId, showStartScreen, showSectionSelectionScreen, showCompletionScreen, testAnnulled, navigation]);

  // App state change handler - CRITICAL for test security
  function handleAppStateChange(nextAppState: string) {
    console.log('📱 App state change:', appState.current, '->', nextAppState);

    if (
      appState.current.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      // App went to background during active test
      if (
        !showStartScreen &&
        !showSectionSelectionScreen &&
        !showPauseScreen &&
        !showCompletionScreen &&
        !testAnnulled
      ) {
        console.log('⚠️ User exited app during test - showing warning');
        // User exited app during test - show warning
        setShowExitWarning(true);
      }
    } else if (
      appState.current.match(/inactive|background/) &&
      nextAppState.match(/active/)
    ) {
      // App returned to foreground
      if (showExitWarning && !testAnnulled) {
        console.log('✅ User returned to app - keeping warning visible');
        // Keep warning visible - user must explicitly dismiss it
        // Countdown continues running
      }
    }
    appState.current = nextAppState;
  }

  // Handle Android back button
  function handleBackPress(): boolean {
    if (
      !showStartScreen &&
      !showSectionSelectionScreen &&
      !showPauseScreen &&
      !showCompletionScreen &&
      !testAnnulled
    ) {
      // Prevent back button during test
      Alert.alert(
        'Exit Test?',
        'Are you sure you want to exit? Your test will be annulled.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => annulTest() },
        ]
      );
      return true; // Prevent default back behavior
    }
    return false;
  }

  // Exit warning countdown
  useEffect(() => {
    if (showExitWarning && exitCountdown > 0 && !testAnnulled) {
      const timer = setTimeout(() => {
        setExitCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showExitWarning && exitCountdown === 0 && !testAnnulled) {
      annulTest();
    }
  }, [showExitWarning, exitCountdown, testAnnulled]);

  // Pause choice countdown
  useEffect(() => {
    if (showPauseChoiceScreen && pauseChoiceCountdown > 0) {
      const timer = setTimeout(() => {
        setPauseChoiceCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showPauseChoiceScreen && pauseChoiceCountdown === 0) {
      handleSkipPause();
    }
  }, [showPauseChoiceScreen, pauseChoiceCountdown]);

  // Section transition countdown
  useEffect(() => {
    if (showSectionTransition && sectionTransitionCountdown > 0) {
      const timer = setTimeout(() => {
        setSectionTransitionCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSectionTransition && sectionTransitionCountdown === 0) {
      handleSectionTransitionComplete();
    }
  }, [showSectionTransition, sectionTransitionCountdown]);

  // Reset countdowns when screens show
  useEffect(() => {
    if (showPauseChoiceScreen) setPauseChoiceCountdown(5);
  }, [showPauseChoiceScreen]);

  useEffect(() => {
    if (showSectionTransition) setSectionTransitionCountdown(5);
  }, [showSectionTransition]);

  useEffect(() => {
    if (showExitWarning) setExitCountdown(5);
  }, [showExitWarning]);

  // Debug: Track question index changes
  useEffect(() => {
    console.log('🔄 Question index changed to:', currentQuestionIndex);
    console.log('Current section:', currentSection);
    console.log('Section questions:', sectionQuestions.map(q => ({ id: q.id, number: q.question_number })));
    console.log('Current question at this index:', currentQuestion);
  }, [currentQuestionIndex]);

  async function loadTestData() {
    setLoading(true);

    try {
      console.log('📊 Loading test data for assignment:', assignmentId);

      // Load test configuration
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('2V_test_assignments')
        .select(`
          id,
          test_id,
          student_id,
          status,
          2V_tests!inner (
            test_type,
            section,
            exercise_type
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) {
        console.error('❌ Error loading assignment:', assignmentError);
        console.log('Assignment ID that failed:', assignmentId);
        throw assignmentError;
      }

      console.log('✅ Assignment loaded:', assignmentData);

      const testType = assignmentData['2V_tests'].test_type;
      const exerciseType = assignmentData['2V_tests'].exercise_type;

      // Load test track configuration
      const { data: configData, error: configError } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType)
        .eq('track_type', exerciseType)
        .maybeSingle();

      if (configError) throw configError;

      const testConfig: TestConfig = configData || {
        test_type: testType,
        track_type: exerciseType,
        section_order_mode: 'mandatory',
        section_order: null,
        time_per_section: null,
        total_time_minutes: null,
        navigation_mode: 'forward_only',
        can_leave_blank: true,
        pause_mode: 'no_pause',
        pause_sections: null,
        pause_duration_minutes: 5,
      };

      setConfig(testConfig);

      // Load questions from 2V_questions table (same as web version)
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('*')
        .eq('test_type', testType)
        .order('section')
        .order('question_number');

      if (questionsError) throw questionsError;

      const questions: Question[] = (questionsData || []).map((q: any) => ({
        id: q.id,
        test_type: q.test_type,
        section: q.section,
        question_number: q.question_number,
        question_type: q.question_type || 'multiple_choice',
        difficulty: q.difficulty || '3',
        question_data: q.question_data || {},
        answers: q.answers || {},
        correct_answer: q.answers?.correct_answer?.[0],
        discrimination: q.discrimination,
        guessing: q.guessing,
        exposure_count: q.exposure_count || 0,
      }));

      setAllQuestions(questions);
      setQuestionPool(questions);

      // Get unique sections
      const uniqueSections = Array.from(new Set(questions.map(q => q.section)));
      const orderedSections = testConfig.section_order && testConfig.section_order.length > 0
        ? testConfig.section_order.filter(s => uniqueSections.includes(s))
        : uniqueSections;

      setSections(orderedSections);

      if (testConfig.section_order_mode === 'user_choice') {
        setUserSelectedSections(orderedSections);
        // Don't skip the start screen - we'll show section selection after they click "Start Test"
      }

    } catch (err: any) {
      console.error('❌ Error loading test data:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));

      let errorMessage = 'Failed to load test. Please try again.';

      if (err?.code === 'PGRST116') {
        errorMessage = 'Test assignment not found. It may have been deleted or you may not have access to it.';
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`;
      }

      Alert.alert('Error Loading Test', errorMessage, [
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function annulTest() {
    setTestAnnulled(true);
    if (timerRef.current) clearInterval(timerRef.current);

    Alert.alert(
      'Test Annulled',
      'Your test has been annulled due to exiting the app. Please contact your tutor.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('StudentHome'),
        },
      ]
    );
  }

  function returnToFullscreen() {
    setShowExitWarning(false);
    setExitCountdown(5);
  }

  async function startTest() {
    // Initialize adaptive algorithm if needed
    if (config?.adaptivity_mode === 'adaptive') {
      // Load algorithm config
      const { data: algoData } = await supabase
        .from('2V_algorithm_config')
        .select('*')
        .eq('test_type', config.test_type)
        .eq('track_type', config.track_type)
        .eq('algorithm_category', 'adaptive')
        .maybeSingle();

      if (algoData) {
        setAlgorithmConfig(algoData);
        const algorithm = createAdaptiveAlgorithm({
          ...algoData,
          use_base_questions: config.use_base_questions,
          base_questions_scope: config.base_questions_scope,
          base_questions_count: config.base_questions_count,
        });
        setAdaptiveAlgorithm(algorithm);
      }

      // Prepare initial questions
      if (config.use_base_questions) {
        const baseCount = config.base_questions_count || 5;
        const allBaseQuestions: typeof questionPool = [];

        // Load base questions for ALL sections, not just the first one
        sections.forEach(section => {
          const sectionQuestions = questionPool.filter(q => q.section === section);

          let baseQuestions = sectionQuestions.filter(q =>
            parseInt(q.difficulty) === (config.baseline_difficulty || 3)
          );

          if (baseQuestions.length < baseCount) {
            baseQuestions = sectionQuestions;
          }

          if (config.question_order === 'random') {
            baseQuestions = [...baseQuestions].sort(() => Math.random() - 0.5);
          }

          const selectedBase = baseQuestions.slice(0, baseCount);
          selectedBase.forEach(q => q.is_base = true);
          allBaseQuestions.push(...selectedBase);
        });

        console.log('📋 Loaded base questions for all sections:', allBaseQuestions.length);
        console.log('Base questions by section:',
          sections.map(s => ({
            section: s,
            count: allBaseQuestions.filter(q => q.section === s).length
          }))
        );

        setSelectedQuestions(allBaseQuestions);
      }
    }

    setShowStartScreen(false);

    // Show section selection if user choice mode
    if (config?.section_order_mode === 'user_choice') {
      setShowSectionSelectionScreen(true);
      return;
    }

    setShowSectionSelectionScreen(false);
    setTestStartTime(new Date());
    setSectionStartTime(new Date());
    startSectionTimer();
  }

  function startSectionTimer() {
    if (timerRef.current) clearInterval(timerRef.current);

    let sectionTime: number | null = null;

    if (config?.time_per_section && currentSection) {
      sectionTime = config.time_per_section[currentSection] || null;
    } else if (config?.total_time_minutes && sections.length > 0) {
      sectionTime = Math.round(config.total_time_minutes / sections.length);
    }

    if (sectionTime) {
      setTimeRemaining(sectionTime * 60);
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  function handleTimeUp() {
    if (timerRef.current) clearInterval(timerRef.current);
    Alert.alert('Time Up', 'Time is up for this section!');
    submitTest();
  }

  function handleAnswerSelect(answer: string) {
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        answer,
        timeSpent: prev[currentQuestion.id]?.timeSpent || 0,
        flagged: prev[currentQuestion.id]?.flagged || false,
      }
    }));

    if (adaptiveAlgorithm && config?.adaptivity_mode === 'adaptive') {
      const isCorrect = answer === currentQuestion.correct_answer;
      console.log('📝 Recording response to adaptive algorithm:', {
        questionId: currentQuestion.id,
        answer,
        correctAnswer: currentQuestion.correct_answer,
        isCorrect,
      });
      adaptiveAlgorithm.recordResponse(currentQuestion, isCorrect);
      console.log('Algorithm state after recording:', adaptiveAlgorithm.getState());
    }
  }

  function handleMSRAnswerChange(questionIndex: number, answer: string) {
    if (!currentQuestion) return;

    const msrAnswers = answers[currentQuestion.id]?.msrAnswers || [];
    msrAnswers[questionIndex] = answer;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        questionId: currentQuestion.id,
        msrAnswers,
        answer: msrAnswers.join(','),
        timeSpent: prev[currentQuestion.id]?.timeSpent || 0,
        flagged: prev[currentQuestion.id]?.flagged || false,
      }
    }));
  }

  function toggleFlag() {
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {
          questionId: currentQuestion.id,
          answer: null,
          timeSpent: 0,
          flagged: false,
        }),
        flagged: !(prev[currentQuestion.id]?.flagged || false),
      }
    }));
  }

  function canGoBack(): boolean {
    if (!config) return false;
    if (currentSectionIndex === 0 && currentQuestionIndex === 0) return false;

    if (currentQuestionIndex > 0 && config.navigation_mode === 'back_forward') {
      return true;
    }

    if (currentQuestionIndex === 0 && currentSectionIndex > 0 &&
        config.navigation_between_sections === 'back_forward') {
      return true;
    }

    return false;
  }

  function goToPreviousQuestion() {
    if (!canGoBack()) return;

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      const prevSectionQuestions = allQuestions.filter(
        q => q.section === sections[currentSectionIndex - 1]
      );
      setCurrentQuestionIndex(prevSectionQuestions.length - 1);
    }
  }

  async function goToNextQuestion() {
    console.log('=== goToNextQuestion called ===');
    console.log('Current question index:', currentQuestionIndex);
    console.log('Total questions in section:', totalQuestionsInSection);
    console.log('Current question ID:', currentQuestion?.id);
    console.log('Adaptivity mode:', config?.adaptivity_mode);

    if (config?.can_leave_blank === false && !answers[currentQuestion?.id]?.answer) {
      setShowAnswerRequiredMessage(true);
      setTimeout(() => setShowAnswerRequiredMessage(false), 3000);
      return;
    }

    // Handle adaptive mode
    if (config?.adaptivity_mode === 'adaptive') {
      console.log('📊 Adaptive mode - checking state');
      const algorithmState = adaptiveAlgorithm?.getState();
      console.log('Algorithm state:', algorithmState);

      const sectionSelectedQuestions = selectedQuestions.filter(q => q.section === currentSection);
      const questionLimitForSection = config.questions_per_section?.[currentSection] || 20;

      console.log('Section selected questions count:', sectionSelectedQuestions.length);
      console.log('Question limit for section:', questionLimitForSection);

      // Check if we've reached the question limit for this section
      if (sectionSelectedQuestions.length >= questionLimitForSection) {
        console.log('✅ Reached question limit, completing section');
        completeSection();
        return;
      }

      // If we still have questions to answer in this section, select next one
      if (currentQuestionIndex < sectionSelectedQuestions.length - 1) {
        // Still have questions in the selected list
        console.log('Moving to next already-selected question');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        return;
      }

      // Need to select a new adaptive question
      console.log('Need to select new adaptive question');
      const answeredQuestionIds = new Set(sectionSelectedQuestions.map(q => q.id));
      const availableQuestions = questionPool.filter(
        q => !answeredQuestionIds.has(q.id) && q.section === currentSection
      );

      console.log('Available questions for selection:', availableQuestions.length);

      if (availableQuestions.length > 0 && adaptiveAlgorithm) {
        console.log('Calling algorithm to select next question');
        const nextQuestion = await adaptiveAlgorithm.selectNextQuestion(
          availableQuestions,
          currentSection
        );

        if (nextQuestion) {
          console.log('✅ Selected next question:', nextQuestion.id);
          nextQuestion.is_base = false;
          setSelectedQuestions(prev => [...prev, nextQuestion]);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          return;
        } else {
          console.log('⚠️ Algorithm returned no question');
        }
      } else {
        console.log('⚠️ No available questions or no algorithm');
      }

      // If we get here, complete the section
      console.log('Completing section (no more questions available)');
      completeSection();
      return;
    }

    // Normal progression
    console.log('Normal progression - checking bounds');
    console.log('currentQuestionIndex:', currentQuestionIndex);
    console.log('totalQuestionsInSection:', totalQuestionsInSection);

    if (currentQuestionIndex < totalQuestionsInSection - 1) {
      const newIndex = currentQuestionIndex + 1;
      console.log('Moving to next question, new index:', newIndex);
      setCurrentQuestionIndex(newIndex);

      // Log what the next question should be
      const nextQ = sectionQuestions[newIndex];
      console.log('Next question should be:', nextQ);
    } else {
      console.log('End of section, completing section');
      completeSection();
    }
  }

  function completeSection() {
    if (currentSectionIndex < sections.length - 1) {
      // Check for pause
      const canPause = config?.pause_mode === 'between_sections' ||
        (config?.pause_mode === 'user_choice' &&
         config.pause_sections?.includes(currentSection));

      if (canPause && pausesUsed < (config.max_pauses || Infinity)) {
        setShowSectionTransition(true);
      } else {
        moveToNextSection();
      }
    } else {
      submitTest();
    }
  }

  function handleSectionTransitionComplete() {
    setShowSectionTransition(false);

    const canPause = config?.pause_mode === 'between_sections' ||
      (config?.pause_mode === 'user_choice' &&
       config.pause_sections?.includes(currentSection));

    if (canPause && pausesUsed < (config.max_pauses || Infinity)) {
      setShowPauseChoiceScreen(true);
    } else {
      moveToNextSection();
    }
  }

  function handleTakePause() {
    setShowPauseChoiceScreen(false);
    setShowPauseScreen(true);
    setPausesUsed(pausesUsed + 1);

    const pauseDuration = (config?.pause_duration_minutes || 5) * 60;
    setPauseTimeRemaining(pauseDuration);
  }

  function handleSkipPause() {
    setShowPauseChoiceScreen(false);
    moveToNextSection();
  }

  function resumeFromPause() {
    setShowPauseScreen(false);
    setPauseTimeRemaining(null);
    moveToNextSection();
  }

  function moveToNextSection() {
    setCurrentSectionIndex(currentSectionIndex + 1);
    setCurrentQuestionIndex(0);
    setSectionStartTime(new Date());
    startSectionTimer();
  }

  async function submitTest() {
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Save answers to database
      const { error } = await supabase
        .from('2V_test_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          // IMPORTANT: Hide results when test is completed
          // Tutor must explicitly enable visibility after reviewing with student
          results_viewable_by_student: false
        })
        .eq('id', assignmentId);

      if (error) throw error;

      setShowCompletionScreen(true);
    } catch (err) {
      console.error('Error submitting test:', err);
      Alert.alert('Error', 'Failed to submit test. Please try again.');
    }
  }

  function renderQuestion() {
    if (!currentQuestion) return null;

    const questionData = currentQuestion.question_data;
    const questionType = questionData.di_type || currentQuestion.question_type;

    const currentAnswer = answers[currentQuestion.id];

    switch (questionType) {
      case 'DS':
        return (
          <DSQuestion
            problem={questionData.problem || ''}
            statement1={questionData.statement1 || ''}
            statement2={questionData.statement2 || ''}
            selectedAnswer={currentAnswer?.answer || undefined}
            onAnswerChange={handleAnswerSelect}
          />
        );

      case 'MSR':
        return (
          <MSRQuestion
            sources={questionData.sources || []}
            questions={questionData.questions || []}
            selectedAnswers={currentAnswer?.msrAnswers || []}
            onAnswerChange={handleMSRAnswerChange}
          />
        );

      case 'GI':
        return (
          <GIQuestion
            chartConfig={questionData.chart_config}
            contextText={questionData.context_text}
            statementText={questionData.statement_text || ''}
            blank1Options={questionData.blank1_options || []}
            blank2Options={questionData.blank2_options || []}
            imageUrl={questionData.image_url}
            selectedBlank1={currentAnswer?.blank1}
            selectedBlank2={currentAnswer?.blank2}
            onBlank1Change={(value) => {
              setAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: {
                  ...prev[currentQuestion.id],
                  questionId: currentQuestion.id,
                  blank1: value,
                  answer: `${value},${prev[currentQuestion.id]?.blank2 || ''}`,
                  timeSpent: 0,
                  flagged: prev[currentQuestion.id]?.flagged || false,
                }
              }));
            }}
            onBlank2Change={(value) => {
              setAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: {
                  ...prev[currentQuestion.id],
                  questionId: currentQuestion.id,
                  blank2: value,
                  answer: `${prev[currentQuestion.id]?.blank1 || ''},${value}`,
                  timeSpent: 0,
                  flagged: prev[currentQuestion.id]?.flagged || false,
                }
              }));
            }}
          />
        );

      case 'TA':
        return (
          <TAQuestion
            tableTitle={questionData.table_title}
            columnHeaders={questionData.column_headers || []}
            tableData={questionData.table_data || []}
            statements={questionData.statements || []}
            selectedAnswers={currentAnswer?.taAnswers || {}}
            onAnswerChange={(index, value) => {
              setAnswers(prev => {
                const taAnswers = { ...(prev[currentQuestion.id]?.taAnswers || {}) };
                taAnswers[index] = value;
                return {
                  ...prev,
                  [currentQuestion.id]: {
                    ...prev[currentQuestion.id],
                    questionId: currentQuestion.id,
                    taAnswers,
                    answer: JSON.stringify(taAnswers),
                    timeSpent: 0,
                    flagged: prev[currentQuestion.id]?.flagged || false,
                  }
                };
              });
            }}
          />
        );

      case 'TPA':
        return (
          <TPAQuestion
            scenario={questionData.scenario || ''}
            column1Title={questionData.column1_title || 'Column 1'}
            column2Title={questionData.column2_title || 'Column 2'}
            sharedOptions={questionData.shared_options || []}
            selectedColumn1={currentAnswer?.column1}
            selectedColumn2={currentAnswer?.column2}
            onColumn1Change={(value) => {
              setAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: {
                  ...prev[currentQuestion.id],
                  questionId: currentQuestion.id,
                  column1: value,
                  answer: `${value},${prev[currentQuestion.id]?.column2 || ''}`,
                  timeSpent: 0,
                  flagged: prev[currentQuestion.id]?.flagged || false,
                }
              }));
            }}
            onColumn2Change={(value) => {
              setAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: {
                  ...prev[currentQuestion.id],
                  questionId: currentQuestion.id,
                  column2: value,
                  answer: `${prev[currentQuestion.id]?.column1 || ''},${value}`,
                  timeSpent: 0,
                  flagged: prev[currentQuestion.id]?.flagged || false,
                }
              }));
            }}
          />
        );

      default:
        // Multiple choice
        return (
          <MultipleChoiceQuestion
            questionText={questionData.question || questionData.question_text || ''}
            imageUrl={questionData.image_url}
            options={questionData.options || {}}
            selectedAnswer={currentAnswer?.answer || undefined}
            onAnswerChange={handleAnswerSelect}
          />
        );
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.brandGreen} />
          <Text style={styles.loadingText}>Loading test...</Text>
        </View>
      </Layout>
    );
  }

  // Start Screen
  if (showStartScreen) {
    return (
      <Layout>
        <View style={styles.startScreen}>
          <Text style={styles.startTitle}>Ready to Start?</Text>
          <Text style={styles.startMessage}>
            {config?.test_start_message || 'Good luck on your test!'}
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startTest}>
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  // Completion Screen
  if (showCompletionScreen) {
    return (
      <Layout>
        <View style={styles.completionScreen}>
          <FontAwesomeIcon icon={faCheckCircle} size={80} color={COLORS.brandGreen} />
          <Text style={styles.completionTitle}>Test Complete!</Text>
          <Text style={styles.completionMessage}>
            Your answers have been submitted successfully.
          </Text>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => navigation.navigate('StudentHome')}
          >
            <Text style={styles.completeButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  // Exit Warning Modal
  if (showExitWarning) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.warningOverlay}>
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Return to Test</Text>
            <Text style={styles.warningText}>
              You have exited the test app. Return to the test immediately or your test will be annulled in {exitCountdown} seconds.
            </Text>
            <TouchableOpacity style={styles.warningButton} onPress={returnToFullscreen}>
              <Text style={styles.warningButtonText}>Return to Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Main Test Interface
  return (
    <Layout>
      <View style={styles.testContainer}>
        {/* Test Security Banner - HIGHLY VISIBLE */}
        <View style={styles.securityBanner}>
          <FontAwesomeIcon icon={faLock} size={20} color={COLORS.yellow500} />
          <Text style={styles.securityText}>⚠️ TEST IN PROGRESS - DO NOT EXIT APP ⚠️</Text>
          <FontAwesomeIcon icon={faLock} size={20} color={COLORS.yellow500} />
        </View>

        {/* Header with timer and progress */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.sectionText}>{currentSection}</Text>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {sectionQuestionLimit}
            </Text>
          </View>
          {timeRemaining !== null && (
            <View style={styles.timer}>
              <FontAwesomeIcon icon={faClock} size={16} color={COLORS.brandDark} />
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            </View>
          )}
        </View>

        {/* Question */}
        <ScrollView style={styles.questionContainer}>
          {renderQuestion()}
        </ScrollView>

        {/* Answer required message */}
        {showAnswerRequiredMessage && (
          <View style={styles.answerRequiredBanner}>
            <Text style={styles.answerRequiredText}>
              Please answer the question before proceeding
            </Text>
          </View>
        )}

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, !canGoBack() && styles.navButtonDisabled]}
            onPress={goToPreviousQuestion}
            disabled={!canGoBack()}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={16} color={COLORS.white} />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.flagButton, answers[currentQuestion?.id]?.flagged && styles.flagButtonActive]}
            onPress={toggleFlag}
          >
            <FontAwesomeIcon
              icon={faFlag}
              size={20}
              color={answers[currentQuestion?.id]?.flagged ? COLORS.yellow500 : COLORS.gray500}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={goToNextQuestion}>
            <Text style={styles.navButtonText}>Next</Text>
            <FontAwesomeIcon icon={faArrowRight} size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pause Choice Modal */}
      <Modal visible={showPauseChoiceScreen} transparent animationType="fade">
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseBox}>
            <Text style={styles.pauseTitle}>Take a Pause?</Text>
            <Text style={styles.pauseText}>
              You can take a {config?.pause_duration_minutes || 5} minute pause before the next section.
              ({pausesUsed}/{config?.max_pauses || 1} pauses used)
            </Text>
            <Text style={styles.pauseCountdown}>
              Auto-continuing in {pauseChoiceCountdown}s...
            </Text>
            <View style={styles.pauseButtons}>
              <TouchableOpacity style={styles.pauseButton} onPress={handleTakePause}>
                <FontAwesomeIcon icon={faPause} size={16} color={COLORS.white} />
                <Text style={styles.pauseButtonText}>Take Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkipPause}>
                <FontAwesomeIcon icon={faPlay} size={16} color={COLORS.brandDark} />
                <Text style={styles.skipButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pause Screen */}
      <Modal visible={showPauseScreen} transparent animationType="fade">
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseBox}>
            <Text style={styles.pauseTitle}>Pause Time</Text>
            <Text style={styles.pauseText}>
              Take a break. The test will resume when you're ready.
            </Text>
            {pauseTimeRemaining !== null && (
              <Text style={styles.pauseTimer}>{formatTime(pauseTimeRemaining)}</Text>
            )}
            <TouchableOpacity style={styles.resumeButton} onPress={resumeFromPause}>
              <Text style={styles.resumeButtonText}>Resume Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Section Transition */}
      <Modal visible={showSectionTransition} transparent animationType="fade">
        <View style={styles.transitionOverlay}>
          <View style={styles.transitionBox}>
            <Text style={styles.transitionTitle}>Section Complete!</Text>
            <Text style={styles.transitionText}>
              Moving to next section in {sectionTransitionCountdown}s...
            </Text>
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray600,
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 16,
  },
  startMessage: {
    fontSize: 18,
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  completionScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginTop: 24,
    marginBottom: 16,
  },
  completionMessage: {
    fontSize: 18,
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: 32,
  },
  completeButton: {
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  testContainer: {
    flex: 1,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.red600,
    paddingVertical: 14,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.yellow500,
  },
  securityText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray200,
  },
  headerLeft: {
    flex: 1,
  },
  sectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brandDark,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.gray600,
    marginTop: 4,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brandDark,
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  answerRequiredBanner: {
    backgroundColor: COLORS.red500,
    padding: 12,
  },
  answerRequiredText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.gray200,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.gray200,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  flagButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray50,
  },
  flagButtonActive: {
    backgroundColor: COLORS.yellow500 + '20',
  },
  warningOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  warningBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.red600,
    marginBottom: 16,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  warningButton: {
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 16,
    borderRadius: 12,
  },
  warningButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  pauseOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pauseBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  pauseText: {
    fontSize: 16,
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: 16,
  },
  pauseCountdown: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 24,
  },
  pauseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 12,
    borderRadius: 8,
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.gray200,
    paddingVertical: 12,
    borderRadius: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brandDark,
  },
  pauseTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.brandGreen,
    textAlign: 'center',
    marginVertical: 24,
  },
  resumeButton: {
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 16,
    borderRadius: 12,
  },
  resumeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  transitionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  transitionBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  transitionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandGreen,
    marginBottom: 16,
    textAlign: 'center',
  },
  transitionText: {
    fontSize: 16,
    color: COLORS.gray700,
    textAlign: 'center',
  },
});
