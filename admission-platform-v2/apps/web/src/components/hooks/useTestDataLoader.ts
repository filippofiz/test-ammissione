/**
 * useTestDataLoader
 *
 * Extracts loadTestData + loadPreviewData out of TakeTestPage.
 * Owns all data-fetching state internally and returns values + setters
 * that TakeTestPage needs to mutate from outside (navigation, adaptive
 * algorithm updates mid-test, etc.).
 *
 * Timer state is still owned by useTestTimer in TakeTestPage; this hook
 * receives setTimeRemaining / setTimerActive as injected params so it can
 * bootstrap them once at load time.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { i18n as I18nInstance } from 'i18next';
import { supabase } from '@/lib/supabase';
import { createAdaptiveAlgorithm, type SimpleAdaptiveAlgorithm, type ComplexAdaptiveAlgorithm } from '@/lib/algorithms/adaptiveAlgorithm';
import {
  getStudentGMATProgress,
  getPlacementAssessmentQuestions,
  getSectionAssessmentQuestions,
  getMockSimulationQuestions,
  PLACEMENT_CONFIG,
  SECTION_ASSESSMENT_CONFIG,
  MOCK_SIMULATION_CONFIG,
  type GmatCycle,
  type GmatSection,
} from '@/lib/api/gmat';
import { findMatchingTemplate, getAllocatedQuestionIds, parseTestIdentifier } from '@/lib/gmat/questionAllocation';
import { filterSectionsWithAdaptivity } from '@/lib/utils/sectionUtils';
import { prepareInitialQuestions } from '@/lib/utils/questionPreparation';
import type {
  TestConfig,
  Question,
  StudentAnswer,
  AttemptData,
  AlgorithmConfig,
  TestAssignment,
  DbStudentAnswer,
} from '@/types/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeTrackType(str: string): string {
  return str.toLowerCase().replace(/[\s_]+/g, '_');
}

function parseQuestions(raw: any[]): Question[] {
  return raw.map(q => ({
    ...q,
    question_data: typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data,
    answers: typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers,
  }));
}

function buildSectionsList(configData: TestConfig, parsedQuestions: Question[]): string[] {
  let sectionsToUse: string[] = [];
  if (configData.section_order_mode === 'no_sections') {
    sectionsToUse = ['All Questions'];
  } else if (configData.section_order_mode === 'mandatory' && configData.section_order?.length) {
    sectionsToUse = configData.section_order;
  } else if (configData.section_order_mode?.includes('macro_sections') && configData.section_order?.length) {
    sectionsToUse = configData.section_order;
  } else if (configData.section_order_mode !== 'no_sections') {
    const sectionField = configData.section_order_mode?.includes('macro_sections') ? 'macro_section' : 'section';
    sectionsToUse = Array.from(new Set(
      parsedQuestions.map((q: any) => q[sectionField]).filter(Boolean)
    ));
  }

  if (configData.section_adaptivity_config && Object.keys(configData.section_adaptivity_config).length > 0) {
    const useMacroSectionAdaptivity = configData.section_order_mode?.includes('macro_sections');
    sectionsToUse = filterSectionsWithAdaptivity(sectionsToUse, configData.section_adaptivity_config, useMacroSectionAdaptivity);
  }

  return sectionsToUse;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// TODO: move DeviceDiagnostics to @/types/test
interface DeviceDiagnostics {
  connection: { status: 'checking' | 'good' | 'warning' | 'error'; value?: number };
  performance: { status: 'checking' | 'good' | 'warning' | 'error'; value?: number };
  overall: 'checking' | 'ready' | 'warning' | 'error';
}

export interface TestDataLoaderParams {
  // Route / mode
  assignmentId: string | undefined;
  isPreviewMode: boolean;
  previewTestId: string | null;
  previewStartQuestion: number;
  isTestMode: boolean;
  isGuidedMode: boolean;
  guidedTimed: boolean;

  // GMAT fork — no assignmentId, identified by type+section
  isGmatMode?: boolean;
  gmatAssessmentType?: 'placement' | 'section' | 'simulation';
  gmatSection?: GmatSection;

  // External services
  db: SupabaseClient;             // real or test supabase client
  i18n: I18nInstance;

  // Current diagnostic state (read-only, owned by TakeTestPage — pre-test diagnostics)
  deviceDiagnostics: DeviceDiagnostics | null;

  // Timer is owned by useTestTimer in TakeTestPage; wired at load time only
  setTimeRemaining: (v: number) => void;
  setTimerActive: (v: boolean) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTestDataLoader(params: TestDataLoaderParams) {
  const {
    assignmentId,
    isPreviewMode,
    previewTestId,
    previewStartQuestion,
    isTestMode,
    isGuidedMode,
    guidedTimed,
    isGmatMode = false,
    gmatAssessmentType,
    gmatSection,
    db,
    i18n,
    deviceDiagnostics,
    setTimeRemaining,
    setTimerActive,
  } = params;

  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // State owned by this hook
  // ---------------------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionPool, setQuestionPool] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [adaptiveAlgorithm, setAdaptiveAlgorithm] = useState<SimpleAdaptiveAlgorithm | ComplexAdaptiveAlgorithm | null>(null);
  const [algorithmConfig, setAlgorithmConfig] = useState<Record<string, unknown> | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<number>(1);
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false);
  const [exerciseType, setExerciseType] = useState<string>('');
  const [isPDFTest, setIsPDFTest] = useState(false);
  const [testLanguage, setTestLanguage] = useState<string>('it');
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [globalQuestionOrder, setGlobalQuestionOrder] = useState(0);

  // ---------------------------------------------------------------------------
  // loadGmatData — GMAT fork (no assignmentId, no 2V_test_assignments)
  // ---------------------------------------------------------------------------

  async function loadGmatData() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('2V_profiles')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      if (!profile?.id) {
        alert('Could not load student profile. Please try again.');
        navigate(-1);
        return;
      }

      const resolvedStudentId = profile.id as string;
      setStudentId(resolvedStudentId);

      // Fetch question refs from the appropriate API
      let questionRefs: Array<{ id: string; section: string; difficulty: string }> = [];

      if (gmatAssessmentType === 'placement') {
        const { questions, error } = await getPlacementAssessmentQuestions(resolvedStudentId);
        if (error || questions.length === 0) {
          alert(error || 'No questions available for placement assessment.');
          navigate(-1);
          return;
        }
        questionRefs = questions;
      } else if (gmatAssessmentType === 'section' && gmatSection) {
        const { questions, error } = await getSectionAssessmentQuestions(resolvedStudentId, gmatSection);
        if (error || questions.length === 0) {
          alert(error || `No questions available for ${gmatSection} section assessment.`);
          navigate(-1);
          return;
        }
        questionRefs = questions;
      } else if (gmatAssessmentType === 'simulation') {
        const { questions, error } = await getMockSimulationQuestions(resolvedStudentId);
        if (error || questions.length === 0) {
          alert(error || 'No questions available for simulation.');
          navigate(-1);
          return;
        }
        questionRefs = questions;
      } else {
        alert('Invalid GMAT assessment type.');
        navigate(-1);
        return;
      }

      // Fetch full question data
      const allIds = questionRefs.map(q => q.id);
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('*')
        .in('id', allIds);

      if (questionsError || !questionsData || questionsData.length === 0) {
        alert('Failed to load questions. Please try again.');
        navigate(-1);
        return;
      }

      // Preserve the order returned by the question selection API
      const idOrderMap = new Map(allIds.map((id, idx) => [id, idx]));
      const sortedQuestions = [...questionsData].sort(
        (a, b) => (idOrderMap.get(a.id) ?? 999) - (idOrderMap.get(b.id) ?? 999)
      );

      const parsedQuestions = parseQuestions(sortedQuestions);
      setAllQuestions(parsedQuestions);
      setQuestionPool(parsedQuestions);
      setSelectedQuestions(parsedQuestions);

      // Derive sections from question data
      const uniqueSections = Array.from(new Set(parsedQuestions.map(q => q.section).filter(Boolean))) as string[];
      // For simulation keep the standard GMAT order; for placement same order
      const sectionOrder: string[] = ['QR', 'DI', 'VR'].filter(s => uniqueSections.includes(s));
      const finalSections = sectionOrder.length > 0 ? sectionOrder : uniqueSections;
      setSections(finalSections);

      // Build in-code TestConfig (no DB lookup needed for GMAT assessments)
      const timesPerSection: Record<string, number> = {};
      if (gmatAssessmentType === 'placement') {
        const minutesPerSection = PLACEMENT_CONFIG.timeMinutes / PLACEMENT_CONFIG.sections.length;
        for (const sec of PLACEMENT_CONFIG.sections) {
          timesPerSection[sec] = minutesPerSection;
        }
      } else if (gmatAssessmentType === 'section' && gmatSection) {
        timesPerSection[gmatSection] = SECTION_ASSESSMENT_CONFIG[gmatSection].timeMinutes;
      } else if (gmatAssessmentType === 'simulation') {
        for (const [sec, cfg] of Object.entries(MOCK_SIMULATION_CONFIG.sections)) {
          timesPerSection[sec] = cfg.timeMinutes;
        }
      }

      const gmatConfig: TestConfig = {
        test_type: 'GMAT',
        track_type: `gmat_${gmatAssessmentType}`,
        section_order_mode: gmatAssessmentType === 'simulation' ? 'user_choice' : 'mandatory',
        section_order: finalSections,
        time_per_section: timesPerSection,
        total_time_minutes: null,
        navigation_mode: 'forward_only',
        navigation_between_sections: 'forward_only',
        can_leave_blank: true,
        pause_mode: 'no_pause',
        pause_sections: null,
        pause_duration_minutes: 0,
        max_pauses: 0,
        question_order: 'sequential',
        adaptivity_mode: 'non_adaptive',
        allow_review_at_end: true,
        allow_bookmarks: true,
        max_answer_changes: 3,
        max_questions_to_review: null,
        calculator_type: 'none',
      } as unknown as TestConfig;

      setConfig(gmatConfig);
      setExerciseType(
        gmatAssessmentType === 'placement' ? 'Placement Assessment'
        : gmatAssessmentType === 'section' ? 'Section Assessment'
        : 'Mock Simulation'
      );

      // Set initial timer for first section
      const firstSection = finalSections[0];
      if (firstSection && timesPerSection[firstSection]) {
        setTimeRemaining(timesPerSection[firstSection] * 60);
      }

      setShowStartScreen(true);
      setHasRestoredProgress(false);

    } catch (err) {
      console.error('[loadGmatData] Error:', err);
      alert('Failed to load GMAT assessment. Please try again.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // loadPreviewData
  // ---------------------------------------------------------------------------

  async function loadPreviewData() {
    try {
      setLoading(true);

      if (!previewTestId) {
        console.error('Preview mode: No testId provided');
        navigate('/admin/review-questions');
        return;
      }

      const { data: testInfo, error: testError } = await supabase
        .from('2V_tests')
        .select('*')
        .eq('id', previewTestId)
        .single();

      if (testError || !testInfo) {
        console.error('Preview mode: Test not found', testError);
        navigate('/admin/review-questions');
        return;
      }

      const testType = testInfo.test_type;
      const exerciseTypeValue = testInfo.exercise_type;
      setExerciseType(exerciseTypeValue || '');

      const trackTypeNormalized = normalizeTrackType(exerciseTypeValue);

      const { data: configsData, error: configsError } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType);

      if (configsError) throw configsError;

      const configData = configsData?.find((c: any) =>
        normalizeTrackType(c.track_type) === trackTypeNormalized
      );

      if (!configData) {
        alert('Test configuration not found');
        navigate('/admin/review-questions');
        return;
      }

      setConfig(configData as unknown as TestConfig);

      const isGMATAssessmentInitial1 =
        testType === 'GMAT' &&
        exerciseTypeValue === 'Assessment Iniziale' &&
        testInfo.test_number === 1;

      console.log('🎯 [PREVIEW] Question Fetching Debug:', {
        testType, exerciseType: exerciseTypeValue, test_number: testInfo.test_number, isGMATAssessmentInitial1,
      });

      let questions: any[] = [];

      if (isGMATAssessmentInitial1) {
        console.log('✅ [PREVIEW] Fetching from GMAT question pool');
        const batchSize = 1000;
        let from = 0;
        let hasMore = true;
        while (hasMore) {
          const { data: batch, error: batchError } = await supabase
            .from('2V_questions')
            .select('*')
            .eq('test_type', testType)
            .order('question_number', { ascending: true })
            .range(from, from + batchSize - 1);
          if (batchError) throw batchError;
          if (batch && batch.length > 0) {
            questions = [...questions, ...batch];
            from += batchSize;
            hasMore = batch.length === batchSize;
          } else {
            hasMore = false;
          }
        }
      } else {
        console.log('📋 [PREVIEW] Fetching questions for specific test_id:', previewTestId);
        const { data, error: questionsError } = await supabase
          .from('2V_questions')
          .select('*')
          .eq('test_id', previewTestId)
          .order('question_number', { ascending: true });
        if (questionsError) throw questionsError;
        questions = data || [];
      }

      console.log('📊 [PREVIEW] Questions fetched:', {
        count: questions?.length || 0,
        sections: questions ? [...new Set(questions.map((q: any) => q.section))].filter(Boolean) : [],
      });

      if (!questions || questions.length === 0) {
        alert('No questions found for this test');
        navigate('/admin/review-questions');
        return;
      }

      const parsedQuestions = parseQuestions(questions);

      setAllQuestions(parsedQuestions);

      if (configData.section_order_mode !== 'no_sections') {
        const uniqueSections = [...new Set(parsedQuestions.map((q: any) => q.section))] as string[];
        setSections(uniqueSections);
      } else {
        setSections([]);
      }

      setTestLanguage('it');

      const startIndex = questions.findIndex((q: any) => q.question_number === previewStartQuestion);
      setCurrentQuestionIndex(startIndex >= 0 ? startIndex : 0);

      setShowStartScreen(false);

    } catch (err) {
      console.error('Preview mode: Error loading test data', err);
      alert('Failed to load preview');
      navigate('/admin/review-questions');
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // loadTestData
  // ---------------------------------------------------------------------------

  async function loadTestData() {
    try {
      setLoading(true);

      const tableSuffix = isTestMode ? '_test' : '';
      const { data: assignment, error: assignmentError } = await db
        .from(`2V_test_assignments${tableSuffix}`)
        .select(`*, 2V_tests${tableSuffix}(id, test_type, exercise_type, format, test_number)`)
        .eq('id', assignmentId!)
        .single() as { data: TestAssignment | null; error: unknown };

      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error('Assignment not found');

      console.log('🔐 [RLS CHECK] Assignment loaded:', {
        assignmentId, student_id: assignment.student_id, status: assignment.status, tableSuffix,
      });

      if (assignment.status === 'locked') {
        setIsLocked(true);
        setShowStartScreen(false);
        setLoading(false);
        return;
      }

      // Stale session detection
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (assignment.status === 'in_progress' && assignment.start_time) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const isPageReload = navigation?.type === 'reload';
        const hasSessionMarker = sessionStorage.getItem(`test_session_${assignmentId}`);
        const isPageRefresh = isPageReload || !hasSessionMarker;

        if (isPageRefresh) {
          sessionStorage.removeItem(`test_session_${assignmentId}`);

          const existingDetails = assignment.completion_details || { attempts: [] };
          const attempts = Array.isArray(existingDetails.attempts) ? existingDetails.attempts : [];
          const currentAttemptNum = assignment.current_attempt || 1;

          const newStatus = isLocalhost ? 'annulled' : 'incomplete';
          const reason = 'browser_closed';
          const annulmentReason = isLocalhost ? 'page_refresh_localhost' : 'session_ended';

          const newAttempt = {
            attempt_number: currentAttemptNum,
            status: newStatus,
            reason,
            annulment_reason: annulmentReason,
            started_at: assignment.start_time || new Date().toISOString(),
            completed_at: new Date().toISOString(),
            browser_info: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            timestamp: new Date().toISOString(),
            device_diagnostics: deviceDiagnostics ? {
              connection_latency_ms: deviceDiagnostics.connection.value ?? null,
              connection_status: deviceDiagnostics.connection.status === 'checking' ? 'warning' : deviceDiagnostics.connection.status,
              performance_benchmark_ms: deviceDiagnostics.performance.value ?? null,
              performance_status: deviceDiagnostics.performance.status === 'checking' ? 'warning' : deviceDiagnostics.performance.status,
              overall_status: deviceDiagnostics.overall === 'checking' ? 'warning' : deviceDiagnostics.overall,
              tested_at: new Date().toISOString(),
            } : undefined,
          };

          const existingAttemptIndex = attempts.findIndex(
            (a: AttemptData) => a.attempt_number === currentAttemptNum
          );

          if (existingAttemptIndex >= 0) {
            attempts[existingAttemptIndex] = { ...attempts[existingAttemptIndex], ...newAttempt };
          } else {
            attempts.push(newAttempt);
          }

          const updateData = {
            status: newStatus,
            total_attempts: currentAttemptNum,
            completion_details: { attempts },
          } as any;

          const { error: statusError } = await db
            .from(`2V_test_assignments${tableSuffix}`)
            .update(updateData)
            .eq('id', assignmentId!)
            .select();

          if (!statusError) {
            assignment.status = newStatus;
            assignment.total_attempts = currentAttemptNum;
          }
        }

        sessionStorage.setItem(`test_session_${assignmentId}`, 'active');
      }

      const currentAttemptNum = assignment.current_attempt || 1;
      setStudentId(assignment.student_id);
      setCurrentAttempt(currentAttemptNum);

      const { data: studentProfile } = await db
        .from('2V_profiles')
        .select('esigenze_speciali')
        .eq('id', assignment.student_id)
        .single();

      const studentHasSpecialNeeds = studentProfile?.esigenze_speciali || false;
      setHasSpecialNeeds(studentHasSpecialNeeds);

      const testInfo = (assignment['2V_tests'] || assignment['2V_tests_test'])!;
      const testType = testInfo.test_type;
      const exerciseTypeValue = testInfo.exercise_type;
      const testFormat = testInfo.format;

      if (testType === 'SAT' && i18n.language !== 'en') {
        await i18n.changeLanguage('en');
      }

      setExerciseType(exerciseTypeValue || '');
      setIsPDFTest(testFormat === 'pdf');

      const trackTypeNormalized = normalizeTrackType(exerciseTypeValue);

      const { data: configsData, error: configsError } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType) as { data: TestConfig[] | null; error: unknown };

      if (configsError) throw configsError;

      const configData = configsData?.find((c: TestConfig) =>
        normalizeTrackType(c.track_type) === trackTypeNormalized
      );

      if (!configData) {
        alert('Test configuration not found. Please contact your instructor.');
        navigate(-1);
        return;
      }

      setConfig(configData);

      console.log('⏸️ [PAUSE] Configuration loaded', {
        pauseMode: configData.pause_mode,
        pauseSections: configData.pause_sections,
        pauseDurationMinutes: configData.pause_duration_minutes,
        maxPauses: configData.max_pauses,
      });

      // Load algorithm configuration
      let algorithmConfigData: AlgorithmConfig | null = null;
      if (configData.adaptivity_mode === 'adaptive' && configData.algorithm_id) {
        const { data: algConfig, error: algError } = await supabase
          .from('2V_algorithm_config')
          .select('*')
          .eq('id', configData.algorithm_id)
          .single() as { data: AlgorithmConfig | null; error: unknown };

        if (!algError && algConfig) {
          algorithmConfigData = algConfig;
          setAlgorithmConfig(algConfig as unknown as Record<string, unknown>);
        }
      }

      const testId = testInfo.id;

      const isGMATAssessmentInitial1 =
        testType === 'GMAT' &&
        exerciseTypeValue === 'Assessment Iniziale' &&
        testInfo.test_number === 1;

      const isGMATCycleBasedTest =
        testType === 'GMAT' &&
        !isGMATAssessmentInitial1 &&
        (exerciseTypeValue.toLowerCase().includes('training') || exerciseTypeValue.toLowerCase().includes('assessment'));

      console.log('🎯 Question Fetching Debug:', {
        testType, exerciseType: exerciseTypeValue, test_number: testInfo.test_number,
        isGMATAssessmentInitial1, isGMATCycleBasedTest,
      });

      let questions: Question[] = [];

      if (isGMATAssessmentInitial1) {
        console.log('✅ Fetching from GMAT question pool');
        const batchSize = 1000;
        let from = 0;
        let hasMore = true;
        while (hasMore) {
          let query = supabase
            .from('2V_questions')
            .select('*')
            .eq('test_type', testType);
          query = configData.section_order_mode === 'no_sections'
            ? query.order('question_number')
            : query.order('section').order('question_number');
          const { data: batch, error: batchError } = await query.range(from, from + batchSize - 1);
          if (batchError) throw batchError;
          if (batch && batch.length > 0) {
            questions = [...questions, ...batch] as Question[];
            from += batchSize;
            hasMore = batch.length === batchSize;
          } else {
            hasMore = false;
          }
        }
      } else if (isGMATCycleBasedTest) {
        console.log('🔄 GMAT Cycle-Based Test: Fetching allocated questions');
        const studentProgress = await getStudentGMATProgress(assignment.student_id);
        if (!studentProgress) {
          alert('You have not been assigned a GMAT preparation cycle yet. Please contact your tutor.');
          navigate(-1);
          return;
        }
        const studentCycle = studentProgress.gmat_cycle as GmatCycle;
        console.log('📊 Student GMAT Cycle:', studentCycle);

        const { section, topic, materialType } = parseTestIdentifier({
          section: testInfo.section,
          exercise_type: exerciseTypeValue,
          materia: testInfo.materia,
          test_number: testInfo.test_number,
        });

        const template = await findMatchingTemplate(section, topic, materialType);
        if (!template) {
          alert('No question allocation found for this test. Please contact your tutor.');
          navigate(-1);
          return;
        }

        const allocatedIds = await getAllocatedQuestionIds(template.id, studentCycle);
        if (!allocatedIds || allocatedIds.length === 0) {
          alert(`No questions have been allocated for the ${studentCycle} cycle. Please contact your tutor.`);
          navigate(-1);
          return;
        }

        const { data: allocatedQuestions, error: allocError } = await supabase
          .from('2V_questions')
          .select('*')
          .in('id', allocatedIds);
        if (allocError) throw allocError;

        const idOrderMap = new Map(allocatedIds.map((id: string, idx: number) => [id, idx]));
        questions = (allocatedQuestions || []).sort((a: any, b: any) => {
          return (idOrderMap.get(a.id) ?? 999) - (idOrderMap.get(b.id) ?? 999);
        }) as unknown as Question[];

        console.log('✅ Fetched allocated GMAT questions:', questions.length);

      } else {
        console.log('📋 Fetching questions for specific test_id:', testId);
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔐 [RLS CHECK] Current auth user:', { userId: user?.id, email: user?.email, testId });

        let query = supabase
          .from('2V_questions')
          .select('*')
          .or(`test_id.eq.${testId},additional_test_ids.cs.["${testId}"]`);
        query = configData.section_order_mode === 'no_sections'
          ? query.order('question_number')
          : query.order('section').order('question_number');

        const { data, error: questionsError } = await query as { data: Question[] | null; error: unknown };
        if (questionsError) throw questionsError;
        questions = data || [];
      }

      console.log('📊 Questions fetched:', { count: questions?.length || 0 });

      const parsedQuestions = parseQuestions(questions || []);

      setAllQuestions(parsedQuestions);
      setQuestionPool(parsedQuestions);

      // Build sections list
      const sectionsToUse = buildSectionsList(configData, parsedQuestions);
      setSections(sectionsToUse);

      // NOTE: selectedQuestions is set provisionally here. If answers exist in the DB
      // (i.e. this is a resume), it will be overwritten below with the original order
      // reconstructed from question_order. This prevents randomisation in
      // prepareInitialQuestions() from producing a different order on reload.
      const initialQuestions = prepareInitialQuestions(parsedQuestions, configData, algorithmConfigData);
      setSelectedQuestions(initialQuestions);

      // Initialize adaptive algorithm
      if (configData.adaptivity_mode === 'adaptive' && algorithmConfigData) {
        const algorithm = createAdaptiveAlgorithm({
          test_type: testType,
          track_type: trackTypeNormalized,
          algorithm_type: algorithmConfigData.algorithm_type || 'complex',
          simple_difficulty_increment: algorithmConfigData.simple_difficulty_increment,
          irt_model: algorithmConfigData.irt_model,
          initial_theta: algorithmConfigData.initial_theta,
          theta_min: algorithmConfigData.theta_min,
          theta_max: algorithmConfigData.theta_max,
          se_threshold: algorithmConfigData.se_threshold,
          max_information_weight: algorithmConfigData.max_information_weight,
          exposure_control: algorithmConfigData.exposure_control,
          use_base_questions: configData.use_base_questions,
          base_questions_scope: configData.base_questions_scope,
          base_questions_count: configData.base_questions_count,
        });
        setAdaptiveAlgorithm(algorithm);
      }

      // Initialize timer
      if (configData.total_time_minutes && (!isGuidedMode || guidedTimed)) {
        let totalTimeSeconds = configData.total_time_minutes * 60;
        if (studentHasSpecialNeeds) {
          totalTimeSeconds = Math.round(totalTimeSeconds * 1.3);
        }
        setTimeRemaining(totalTimeSeconds);
      }

      // Restore in-progress answers — also restore for 'incomplete' and 'annulled' because
      // stale-session detection may have just set one of those statuses (on localhost it sets
      // 'annulled', on production 'incomplete'), but the student is about to resume via the modal.
      if (
        assignment.status === 'in_progress' ||
        assignment.status === 'completed' ||
        assignment.status === 'incomplete' ||
        assignment.status === 'annulled'
      ) {
        const { data: existingAnswers, error: answersError } = await db
          .from(`2V_student_answers${tableSuffix}`)
          .select('*')
          .eq('assignment_id', assignmentId!)
          .eq('attempt_number', currentAttemptNum) as { data: DbStudentAnswer[] | null; error: unknown };

        if (!answersError && existingAnswers) {
          const loadedAnswers: Record<string, StudentAnswer> = {};

          existingAnswers.forEach((dbAnswer) => {
            const questionId = dbAnswer.question_id;
            const jsonbAnswer = dbAnswer.answer;

            let localAnswer: Partial<StudentAnswer> = {
              questionId,
              flagged: dbAnswer.is_flagged || false,
              timeSpent: dbAnswer.time_spent_seconds || 0,
            };

            if ('answer' in jsonbAnswer) {
              localAnswer.answer = jsonbAnswer.answer;
            } else if ('answers' in jsonbAnswer) {
              if (Array.isArray(jsonbAnswer.answers)) {
                localAnswer.msrAnswers = jsonbAnswer.answers;
                localAnswer.answer = jsonbAnswer.answers.join(',');
              } else {
                const answerKeys = Object.keys(jsonbAnswer.answers);
                const isGIOrTPAFormat = answerKeys.includes('part1') || answerKeys.includes('part2');
                if (isGIOrTPAFormat) {
                  const giTpaAnswer = jsonbAnswer.answers as { part1: string | null; part2: string | null };
                  localAnswer.blank1 = giTpaAnswer.part1 ?? undefined;
                  localAnswer.blank2 = giTpaAnswer.part2 ?? undefined;
                  localAnswer.column1 = giTpaAnswer.part1 ?? undefined;
                  localAnswer.column2 = giTpaAnswer.part2 ?? undefined;
                  localAnswer.answer = `${giTpaAnswer.part1 || ''}|${giTpaAnswer.part2 || ''}`;
                } else {
                  localAnswer.taAnswers = jsonbAnswer.answers as Record<number, 'true' | 'false'>;
                  localAnswer.answer = Object.values(jsonbAnswer.answers).join(',');
                }
              }
            }

            loadedAnswers[questionId] = localAnswer as StudentAnswer;
          });

          setAnswers(loadedAnswers);

          const maxQuestionOrder = existingAnswers.reduce((max, answer) => {
            return Math.max(max, answer.question_order || 0);
          }, 0);
          setGlobalQuestionOrder(maxQuestionOrder);

          // Reconstruct selectedQuestions in the exact order the student originally saw them.
          // existingAnswers rows carry question_order (1-based sequential counter) which was
          // written in goToNextQuestion() — so sorting by it gives back the original sequence.
          // This bypasses any randomisation inside prepareInitialQuestions() on reload.
          const parsedById = new Map(parsedQuestions.map(q => [q.id, q]));

          const answeredInOrder = [...existingAnswers]
            .filter(a => a.question_order != null && a.question_order > 0)
            .sort((a, b) => (a.question_order ?? 0) - (b.question_order ?? 0));

          const seenIds = new Set<string>();
          const restoredOrder: Question[] = [];

          for (const dbAnswer of answeredInOrder) {
            const q = parsedById.get(dbAnswer.question_id);
            if (q && !seenIds.has(q.id)) {
              restoredOrder.push(q);
              seenIds.add(q.id);
            }
          }

          if (restoredOrder.length > 0) {
            // Append any questions not yet visited (future questions) using the normal
            // prepared order, so the test can continue naturally after the resume point.
            const remainingQuestions = initialQuestions.filter(q => !seenIds.has(q.id));
            const fullRestoredOrder = [...restoredOrder, ...remainingQuestions];
            setSelectedQuestions(fullRestoredOrder);
            console.log(`🔄 [RESUME] Restored question order from DB: ${restoredOrder.length} answered + ${remainingQuestions.length} remaining`);
          }
        }
      }

    } catch (err) {
      alert('Failed to load test. Please try again.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Effect — run on mount / assignmentId change
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isGmatMode) {
      loadGmatData();
    } else if (isPreviewMode) {
      loadPreviewData();
    } else {
      loadTestData();
    }
    return () => {
      setTimerActive(false);
    };
  }, [assignmentId, isPreviewMode, previewTestId, isGmatMode, gmatAssessmentType, gmatSection]);

  // ---------------------------------------------------------------------------
  // Return — all owned state values + setters TakeTestPage needs externally
  // ---------------------------------------------------------------------------

  return {
    // State values
    loading,
    isLocked,
    config,
    sections, setSections,
    allQuestions,
    questionPool,
    selectedQuestions, setSelectedQuestions,
    adaptiveAlgorithm, setAdaptiveAlgorithm,
    algorithmConfig,
    studentId,
    currentAttempt, setCurrentAttempt,
    hasSpecialNeeds,
    exerciseType,
    isPDFTest,
    answers, setAnswers,
    globalQuestionOrder, setGlobalQuestionOrder,
    currentQuestionIndex, setCurrentQuestionIndex,
    showStartScreen, setShowStartScreen,
    testLanguage, setTestLanguage,
    hasRestoredProgress,
  };
}
