/**
 * Student Home Page
 * Shows test track for students with their assigned tests
 * - If multiple test types: shows selection screen
 * - If single test type: shows test track directly
 * - Test track displays tests grouped by section and exercise type
 * - Shows status: locked, unlocked, completed
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faLockOpen,
  faSpinner,
  faCheckCircle,
  faClipboardList,
  faChartLine,
  faChevronDown,
  faChevronRight,
  faChevronUp,
  faRocket,
  faTrophy,
  faFire,
  faTimes,
  faClock,
  faQuestionCircle,
  faBook,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { CountdownTimer } from '../components/CountdownTimer';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/auth';
import { translateTestTrack, translateTestTrackAsync } from '../lib/translateTestTrack';
import i18n from 'i18next';

interface TestType {
  test_type: string;
  total_count: number;
  completed_count: number;
  unlocked_count: number;
}

interface TestAssignment {
  assignment_id: string;
  test_id: string;
  status: 'locked' | 'unlocked' | 'completed';
  completion_status: string | null;
  assigned_at: string | null;
  start_time: string | null;
  completed_at: string | null;
  score: number | null;
  current_attempt: number;
  total_attempts: number;
  results_viewable_by_student: boolean;
  completion_details?: {
    attempts?: Array<{
      attempt_number: number;
      status: string;
      reason: string;
      started_at: string;
      completed_at: string;
      total_time_seconds: number;
      section_times: Record<string, number>;
      questions_answered: number;
      total_questions: number;
      score?: number;
      correct_answers?: number;
      annulment_reason?: string;
      browser_info?: string;
      screen_resolution?: string;
    }>;
  };
  test_type: string;
  section: string;
  materia: string | null;
  exercise_type: string;
  test_number: number;
  duration_minutes: number;
}

interface GroupedTests {
  [section: string]: {
    [exerciseType: string]: TestAssignment[];
  };
}

export default function StudentHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTestType = searchParams.get('test');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [tests, setTests] = useState<TestAssignment[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [selectedTestForDetails, setSelectedTestForDetails] = useState<TestAssignment | null>(null);
  const [showAttemptHistory, setShowAttemptHistory] = useState(false);
  const [attemptStats, setAttemptStats] = useState<Record<number, {
    questionsAnswered: number;
    sectionTimes: Record<string, number>;
    totalTime: number;
  }>>({});
  const [realTestDate, setRealTestDate] = useState<string | null>(null);
  const [translatedSections, setTranslatedSections] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  // Translate section names when tests change
  useEffect(() => {
    if (tests.length === 0) return;

    const translateSections = async () => {
      const sections = [...new Set(tests.map(test => test.section))];
      const currentLang = i18n.language || 'it';

      const translations: Record<string, string> = {};

      // If language is Italian, no translation needed (DB values are in Italian)
      if (currentLang === 'it') {
        for (const section of sections) {
          translations[section] = section;
        }
        setTranslatedSections(translations);
        return;
      }

      // Translate to English
      for (const section of sections) {
        // Try i18n first, then fall back to Google Translate
        const translated = await translateTestTrackAsync(section, t, 'en');
        translations[section] = translated;
      }

      setTranslatedSections(translations);
    };

    translateSections();
  }, [tests, t]);

  useEffect(() => {
    if (selectedTestType && testTypes.length > 0) {
      setSelectedType(selectedTestType);
      loadTests(selectedTestType);
    }
  }, [selectedTestType, testTypes]);

  // Load attempt statistics from answers table when showing attempt history
  async function loadAttemptStatistics(assignmentId: string, attemptNumbers: number[]) {
    try {
      const stats: Record<number, { questionsAnswered: number; sectionTimes: Record<string, number>; totalTime: number }> = {};

      // Fetch answers for all attempts with question details (to get section)
      const { data: answers, error } = await supabase
        .from('2V_student_answers')
        .select(`
          attempt_number,
          time_spent_seconds,
          2V_questions!inner(section)
        `)
        .eq('assignment_id', assignmentId)
        .in('attempt_number', attemptNumbers);

      if (error) {
        return;
      }

      // Calculate statistics per attempt
      attemptNumbers.forEach(attemptNum => {
        const attemptAnswers = answers?.filter(a => a.attempt_number === attemptNum) || [];

        const sectionTimes: Record<string, number> = {};
        let totalTime = 0;

        attemptAnswers.forEach((answer: any) => {
          const section = answer['2V_questions']?.section || 'Unknown';
          const timeSpent = answer.time_spent_seconds || 0;

          sectionTimes[section] = (sectionTimes[section] || 0) + timeSpent;
          totalTime += timeSpent;
        });

        stats[attemptNum] = {
          questionsAnswered: attemptAnswers.length,
          sectionTimes,
          totalTime
        };
      });

      setAttemptStats(stats);
    } catch (err) {
      // Error calculating attempt statistics
    }
  }

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // Get current user's profile
      const profile = await getCurrentProfile();
      if (!profile) {
        throw new Error('Profile not found');
      }

      // Fetch real test date from profile
      const { data: profileData, error: profileError } = await supabase
        .from('2V_profiles')
        .select('real_test_date')
        .eq('id', profile.id)
        .single();

      if (!profileError) {
        setRealTestDate(profileData?.real_test_date || null);
      }

      // Fetch all test types with counts
      const { data: assignments, error: assignError } = await supabase
        .from('2V_test_assignments')
        .select(`
          id,
          status,
          test_id,
          2V_tests!inner (
            test_type
          )
        `)
        .eq('student_id', profile.id);

      if (assignError) throw assignError;

      // Group by test type and calculate counts
      const typeMap = new Map<string, TestType>();

      assignments?.forEach((assignment: any) => {
        const testType = assignment['2V_tests'].test_type;

        if (!typeMap.has(testType)) {
          typeMap.set(testType, {
            test_type: testType,
            total_count: 0,
            completed_count: 0,
            unlocked_count: 0,
          });
        }

        const stats = typeMap.get(testType)!;
        stats.total_count++;
        // Backward compatible: check completion_status first, then fall back to status
        if (assignment.completion_status?.startsWith('completed') || assignment.status === 'completed') stats.completed_count++;
        if (assignment.status === 'unlocked') stats.unlocked_count++;
      });

      const types = Array.from(typeMap.values());
      setTestTypes(types);

      // If only one test type, auto-select it
      if (types.length === 1 && !selectedTestType) {
        const singleType = types[0].test_type;
        setSelectedType(singleType);
        setSearchParams({ test: singleType });
        await loadTests(singleType);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Helper function to normalize section names for comparison (same as TestStructurePage)
  const normalizeSectionName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[,;:.!?]/g, '') // Remove punctuation
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  };

  async function loadTests(testType: string) {
    setLoading(true);
    setError(null);

    try {
      const profile = await getCurrentProfile();
      if (!profile) throw new Error('Profile not found');

      // AUTO-ASSIGN: Find all tests of this type that are NOT assigned to this student
      const { data: existingAssignments } = await supabase
        .from('2V_test_assignments')
        .select('test_id')
        .eq('student_id', profile.id);

      const assignedTestIds = (existingAssignments || []).map(a => a.test_id);

      // Get all active tests of this test_type
      let availableTestsQuery = supabase
        .from('2V_tests')
        .select('id')
        .eq('test_type', testType)
        .eq('is_active', true);

      // Exclude already assigned tests
      if (assignedTestIds.length > 0) {
        availableTestsQuery = availableTestsQuery.not('id', 'in', `(${assignedTestIds.join(',')})`);
      }

      const { data: availableTests } = await availableTestsQuery;

      // Auto-assign any missing tests as LOCKED
      if (availableTests && availableTests.length > 0) {
        console.log(`🔄 Auto-assigning ${availableTests.length} new tests to student ${profile.id}`);

        const { error: assignError } = await supabase
          .from('2V_test_assignments')
          .insert(
            availableTests.map(test => ({
              student_id: profile.id,
              test_id: test.id,
              status: 'locked',
              current_attempt: 1,
              total_attempts: 0,
            }))
          );

        if (assignError) {
          console.error('Error auto-assigning tests:', assignError);
        } else {
          console.log(`✅ Successfully auto-assigned ${availableTests.length} tests`);
        }
      }

      // Fetch section order for this test type
      const { data: sectionOrderData, error: orderError } = await supabase
        .from('2V_section_order')
        .select('section_order')
        .eq('test_type', testType)
        .maybeSingle();

      const sectionOrderArray = sectionOrderData?.section_order || [];
      setSectionOrder(sectionOrderArray);

      const { data, error: testError } = await supabase
        .from('2V_test_assignments')
        .select(`
          id,
          test_id,
          status,
          completion_status,
          assigned_at,
          start_time,
          completed_at,
          current_attempt,
          total_attempts,
          completion_details,
          results_viewable_by_student,
          2V_tests!inner (
            test_type,
            section,
            materia,
            exercise_type,
            test_number,
            default_duration_mins
          )
        `)
        .eq('student_id', profile.id)
        .eq('2V_tests.test_type', testType);

      if (testError) throw testError;

      const transformedTests = data.map((row: any) => {
        const section = row['2V_tests'].section;
        const exerciseType = row['2V_tests'].exercise_type;

        // If section contains "multi", use exercise_type as section name
        const displaySection = section.toLowerCase().includes('multi')
          ? exerciseType
          : section;

        return {
          assignment_id: row.id,
          test_id: row.test_id,
          status: row.status,
          completion_status: row.completion_status,
          assigned_at: row.assigned_at,
          start_time: row.start_time,
          completed_at: row.completed_at,
          score: null, // TODO: Extract from completion_details JSONB or test_results table
          current_attempt: row.current_attempt || 1,
          total_attempts: row.total_attempts || 0,
          completion_details: row.completion_details,
          results_viewable_by_student: row.results_viewable_by_student || false,
          test_type: row['2V_tests'].test_type,
          section: displaySection,
          materia: row['2V_tests'].materia,
          exercise_type: exerciseType,
          test_number: row['2V_tests'].test_number,
          duration_minutes: row['2V_tests'].default_duration_mins,
        };
      });

      // Sort client-side using section order if available with normalized comparison
      transformedTests.sort((a, b) => {
        // Helper function to check if section/exercise is Assessment Iniziale
        const isAssessment = (item: typeof a) => {
          const text = (item.section + ' ' + item.exercise_type).toLowerCase();
          return text.includes('assess') && text.includes('iniz');
        };

        // Helper function to check if section/exercise is Simulazione
        const isSimulazione = (item: typeof a) => {
          const text = (item.section + ' ' + item.exercise_type).toLowerCase();
          return text.includes('simulaz');
        };

        const aIsAssessment = isAssessment(a);
        const bIsAssessment = isAssessment(b);
        const aIsSimulazione = isSimulazione(a);
        const bIsSimulazione = isSimulazione(b);

        // Assessment Iniziale always first
        if (aIsAssessment && !bIsAssessment) return -1;
        if (!aIsAssessment && bIsAssessment) return 1;

        // Simulazione always last (but after checking assessment)
        if (aIsSimulazione && !bIsSimulazione) return 1;
        if (!aIsSimulazione && bIsSimulazione) return -1;

        // For everything else, use section ordering with normalized comparison
        if (a.section !== b.section) {
          // Normalize section names for comparison
          const aNorm = normalizeSectionName(a.section);
          const bNorm = normalizeSectionName(b.section);

          // Find index in order array using normalized comparison
          const aIndex = sectionOrderArray.findIndex(s => normalizeSectionName(s) === aNorm);
          const bIndex = sectionOrderArray.findIndex(s => normalizeSectionName(s) === bNorm);

          // If both sections are in the order array, use that order
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }

          // If only one is in the order array, prioritize it
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;

          // If neither is in the order array, use alphabetical
          return a.section.localeCompare(b.section);
        }

        // Within same section, sort by exercise type
        if (a.exercise_type !== b.exercise_type) {
          return a.exercise_type.localeCompare(b.exercise_type);
        }

        // Within same exercise type, sort by test number
        return a.test_number - b.test_number;
      });

      setTests(transformedTests);

      // Sections start collapsed by default
      // User can click to expand individual sections
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  }

  function handleTestTypeSelect(testType: string) {
    setSelectedType(testType);
    setSearchParams({ test: testType });
    loadTests(testType);
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  function groupTests(tests: TestAssignment[]): GroupedTests {
    const grouped: GroupedTests = {};

    tests.forEach(test => {
      if (!grouped[test.section]) {
        grouped[test.section] = {};
      }
      if (!grouped[test.section][test.exercise_type]) {
        grouped[test.section][test.exercise_type] = [];
      }
      grouped[test.section][test.exercise_type].push(test);
    });

    return grouped;
  }

  function getStatusStyles(status: string, completionStatus: string | null) {
    // Backward compatible: use completion_status if available, otherwise fall back to status
    const displayStatus = completionStatus || status;

    // Check if completed (new format with timestamp or old 'completed' status)
    if (displayStatus.startsWith('completed') || displayStatus === 'completed') {
      return {
        bg: 'bg-gradient-to-r from-brand-green to-green-600',
        text: 'text-white',
        border: 'border-green-700',
        icon: faCheckCircle,
        hover: 'hover:shadow-lg',
        cursor: 'cursor-pointer',
      };
    }

    // Removed in_progress, incomplete and annulled statuses - tests stay unlocked

    // Check if unlocked (always from status field)
    if (status === 'unlocked') {
      return {
        bg: 'bg-white',
        text: 'text-brand-green',
        border: 'border-brand-green',
        icon: faLockOpen,
        hover: 'hover:bg-brand-green hover:text-white',
        cursor: 'cursor-pointer',
      };
    }

    // Default: locked
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
      icon: faLock,
      hover: 'hover:bg-blue-100 hover:border-blue-400',
      cursor: 'cursor-pointer',
    };
  }

  function calculateProgress() {
    if (tests.length === 0) return 0;
    // Backward compatible: check completion_status first, then fall back to status
    const completed = tests.filter(t => t.completion_status?.startsWith('completed') || t.status === 'completed').length;
    return Math.round((completed / tests.length) * 100);
  }

  function getMotivationalMessage() {
    const progress = calculateProgress();
    if (progress === 0) return `🚀 ${t('studentHome.motivational.start')}`;
    if (progress < 20) return `💪 ${t('studentHome.motivational.beginWell')}`;
    if (progress < 40) return `🌟 ${t('studentHome.motivational.goingGreat')}`;
    if (progress < 60) return `🔥 ${t('studentHome.motivational.halfwayThere')}`;
    if (progress < 80) return `🏃 ${t('studentHome.motivational.almostThere')}`;
    if (progress < 100) return `🎯 ${t('studentHome.motivational.almostDone')}`;
    return `🎉 ${t('studentHome.motivational.allDone')}`;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Test Type Selection Screen
  if (!selectedType || testTypes.length === 0) {
    return (
      <Layout pageTitle={t('studentHome.title')} pageSubtitle={t('studentHome.subtitle')}>
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {testTypes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  {t('studentHome.noTests')}
                </p>
              </div>
            ) : (
              <div className="animate-fadeInUp">
                <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">
                  {t('studentHome.selectTest')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testTypes.map((type, index) => {
                    const progress = type.total_count > 0
                      ? Math.round((type.completed_count / type.total_count) * 100)
                      : 0;

                    return (
                      <button
                        key={type.test_type}
                        onClick={() => handleTestTypeSelect(type.test_type)}
                        className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-brand-green hover:shadow-xl transition-all duration-300 text-left animate-fadeInUp"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            <FontAwesomeIcon icon={faClipboardList} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-brand-dark mb-2">
                              {type.test_type}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{t('studentHome.progress')}</span>
                                <span className="font-semibold">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-brand-green to-green-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                <span>✅ {type.completed_count} {t('studentHome.completed')}</span>
                                <span>📝 {type.total_count} {t('studentHome.total')}</span>
                                <span>🔓 {type.unlocked_count} {t('studentHome.available')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Test Track Screen
  const grouped = groupTests(tests);
  // Sort sections using sectionOrder from database with normalized comparison
  const sections = Object.keys(grouped).sort((a, b) => {
    if (sectionOrder.length > 0) {
      // Normalize section names for comparison
      const aNorm = normalizeSectionName(a);
      const bNorm = normalizeSectionName(b);

      // Find index in order array using normalized comparison
      const aIndex = sectionOrder.findIndex(s => normalizeSectionName(s) === aNorm);
      const bIndex = sectionOrder.findIndex(s => normalizeSectionName(s) === bNorm);

      // If both in order array, use that order
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      // If only one in order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
    }
    // Fallback to alphabetical
    return a.localeCompare(b);
  });
  const progress = calculateProgress();
  // Backward compatible: check completion_status first, then fall back to status
  const completedCount = tests.filter(t => t.completion_status?.startsWith('completed') || t.status === 'completed').length;
  const unlockedCount = tests.filter(t => t.status === 'unlocked').length;

  return (
    <Layout pageTitle={selectedType} pageSubtitle={t('testSelection.subtitle')}>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Countdown Timer (if real test date is set) */}
          {realTestDate && (
            <div className="mb-6 animate-fadeInUp">
              <CountdownTimer
                targetDate={realTestDate}
                label={t('studentHome.realTestDate')}
                variant="card"
                showDate={true}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - Test Tree */}
            <div className="lg:col-span-3 space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Back Button */}
              {testTypes.length > 1 && (
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setSearchParams({});
                    setTests([]);
                  }}
                  className="mb-4 text-brand-dark hover:text-brand-green transition-colors font-medium"
                >
                  ← {t('studentHome.backToSelection')}
                </button>
              )}

              {/* Empty State */}
              {tests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center animate-fadeInUp">
                  <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-2xl font-bold text-brand-dark mb-3">{t('studentHome.noTests')}</h3>
                  <p className="text-gray-600">
                    {t('studentHome.noTestsType', { testType: selectedType })}
                  </p>
                </div>
              ) : (
                <>
                  {sections.map((section, index) => {
                const isExpanded = expandedSections.has(section);
                const exerciseTypes = Object.keys(grouped[section]).sort((a, b) => {
                  // Training first, Assessment second
                  if (a.toLowerCase().includes('training')) return -1;
                  if (b.toLowerCase().includes('training')) return 1;
                  if (a.toLowerCase().includes('assessment')) return -1;
                  if (b.toLowerCase().includes('assessment')) return 1;
                  return a.localeCompare(b);
                });

                const sectionTests = exerciseTypes.flatMap(et => grouped[section][et]);
                // Backward compatible: check completion_status first, then fall back to status
                const sectionCompleted = sectionTests.filter(t => t.completion_status?.startsWith('completed') || t.status === 'completed').length;
                const sectionProgress = sectionTests.length > 0
                  ? Math.round((sectionCompleted / sectionTests.length) * 100)
                  : 0;

                return (
                  <div
                    key={section}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-brand-green animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronDown : faChevronRight}
                          className="text-brand-green"
                        />
                        <h3 className="text-xl font-bold text-brand-dark">{translatedSections[section] || section}</h3>
                        {/* Materia Badge */}
                        {(() => {
                          // Get unique materias from all tests in this section (exclude "Altro")
                          const uniqueMaterias = [...new Set(
                            sectionTests
                              .map(t => t.materia)
                              .filter(m => m && m.trim() !== '' && m.toLowerCase() !== 'altro')
                          )];

                          return uniqueMaterias.map(materia => (
                            <span
                              key={materia}
                              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-300"
                            >
                              {materia}
                            </span>
                          ));
                        })()}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {sectionCompleted}/{sectionTests.length}
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-brand-green to-green-600 h-2 rounded-full"
                            style={{ width: `${sectionProgress}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Section Content */}
                    {isExpanded && (
                      <div className="p-6 pt-0 space-y-6">
                        {exerciseTypes.map(exerciseType => (
                          <div key={exerciseType}>
                            {/* Only show exercise type subtitle if different from section name */}
                            {section !== exerciseType && (
                              <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                                {translateTestTrack(exerciseType, t)}
                              </h4>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                              {grouped[section][exerciseType].map(test => {
                                const styles = getStatusStyles(test.status, test.completion_status);
                                // Locked tests navigate to results page, others to take-test page
                                const isClickable = true; // All tests are now clickable

                                return (
                                  <div key={test.assignment_id} className="flex flex-col items-center gap-2">
                                    <button
                                      onClick={() => {
                                        if (test.status === 'locked') {
                                          // Only navigate to results if viewable by student
                                          if (test.results_viewable_by_student) {
                                            navigate(`/student/test-results/${test.assignment_id}`);
                                          }
                                        } else {
                                          navigate(`/take-test/${test.assignment_id}`);
                                        }
                                      }}
                                      className={`
                                        relative px-6 py-3 rounded-lg border-2 font-bold
                                        transition-all duration-200 w-full
                                        flex flex-col items-center justify-center
                                        ${styles.bg} ${styles.text} ${styles.border}
                                        ${test.status === 'locked' && !test.results_viewable_by_student ? 'cursor-not-allowed opacity-75' : styles.hover + ' ' + styles.cursor}
                                      `}
                                      title={
                                        test.status === 'locked'
                                          ? (test.results_viewable_by_student ? 'View results' : 'Results locked - ask your tutor')
                                          : 'Click to start test'
                                      }
                                    >
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="text-3xl">{test.test_number}</span>
                                        {test.status === 'locked' ? (
                                          <span className="text-xs font-medium opacity-90 mt-1">
                                            {t('studentHome.viewResults')}
                                          </span>
                                        ) : (
                                          <span className="text-xs font-medium opacity-80">
                                            {t('studentHome.attempt')} {test.current_attempt}
                                          </span>
                                        )}
                                      </div>
                                      <FontAwesomeIcon
                                        icon={styles.icon}
                                        className={`absolute top-2 right-2 ${
                                          (test.completion_status?.startsWith('completed') || test.status === 'completed')
                                            ? 'text-lg text-white'
                                            : test.status === 'locked'
                                            ? 'text-lg text-blue-600'
                                            : 'text-sm'
                                        }`}
                                      />
                                    </button>

                                    {/* View Results Button */}
                                    <button
                                      onClick={() => test.results_viewable_by_student && navigate(`/student/test-results/${test.assignment_id}`)}
                                      disabled={!test.results_viewable_by_student}
                                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 ${
                                        test.results_viewable_by_student
                                          ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 cursor-pointer'
                                          : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed opacity-60'
                                      }`}
                                      title={test.results_viewable_by_student ? t('studentHome.viewResults', 'View test details and results') : t('studentHome.resultsNotAvailable', 'Results will be available after tutor review')}
                                    >
                                      {test.results_viewable_by_student ? t('studentHome.results', 'Results') : t('studentHome.resultsLocked', '🔒 Locked')}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
                </>
              )}
            </div>

            {/* Sidebar - Progress Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-brand-green to-green-600 rounded-xl shadow-xl p-6 text-white sticky top-4">
                <h3 className="text-lg font-bold mb-4 text-center">{t('studentHome.yourProgress')}</h3>

                {/* Circular Progress */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">✅ {t('studentHome.completed')}</span>
                    <span className="font-bold">{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">📝 {t('studentHome.total')}</span>
                    <span className="font-bold">{tests.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">🔓 {t('studentHome.available')}</span>
                    <span className="font-bold">{unlockedCount}</span>
                  </div>
                </div>

                {/* Motivational Message */}
                <div className="bg-white/20 rounded-lg p-3 text-center text-sm font-medium backdrop-blur-sm">
                  {getMotivationalMessage()}
                </div>

                {/* GMAT Materials Button - Only show when viewing GMAT test type */}
                {selectedType === 'GMAT' && (
                  <button
                    onClick={() => navigate('/student/gmat-preparation')}
                    className="w-full mt-4 py-3 px-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold backdrop-blur-sm"
                  >
                    <FontAwesomeIcon icon={faBook} />
                    {t('studentHome.studyMaterials', 'Study Materials')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Details Modal */}
      {selectedTestForDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedTestForDetails(null);
            setShowAttemptHistory(false);
            setAttemptStats({});
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeInUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-brand-dark">
                {t('studentHome.testDetails', { number: selectedTestForDetails.test_number })}
              </h3>
              <button
                onClick={() => {
                  setSelectedTestForDetails(null);
                  setShowAttemptHistory(false);
                  setAttemptStats({});
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">{t('studentHome.status')}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  (selectedTestForDetails.completion_status?.startsWith('completed') || selectedTestForDetails.status === 'completed') ? 'bg-green-100 text-green-700' :
                  selectedTestForDetails.status === 'unlocked' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedTestForDetails.completion_status || selectedTestForDetails.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="border-t pt-3 space-y-2">
                {/* Test Info */}
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('studentHome.testType')}:</span>
                  <span className="font-semibold text-brand-dark">{selectedTestForDetails.test_type}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('studentHome.section')}:</span>
                  <span className="font-semibold text-brand-dark">{selectedTestForDetails.section}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('studentHome.exerciseType')}:</span>
                  <span className="font-semibold text-brand-dark">{selectedTestForDetails.exercise_type}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('studentHome.duration')}:</span>
                  <span className="font-semibold text-brand-dark">{selectedTestForDetails.duration_minutes} min</span>
                </div>
              </div>

              {/* Attempt Info */}
              <div className="border-t pt-3 space-y-2">
                <h4 className="font-semibold text-brand-dark mb-2">{t('studentHome.attemptInfo')}</h4>

                <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('studentHome.currentAttempt')}:</span>
                  <span className="font-bold text-blue-700">{selectedTestForDetails.current_attempt}</span>
                </div>

                {selectedTestForDetails.total_attempts > 0 && (
                  <>
                    <div
                      className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={async () => {
                        const newState = !showAttemptHistory;
                        setShowAttemptHistory(newState);

                        // Load statistics from answers table when expanding
                        if (newState && selectedTestForDetails.completion_details?.attempts) {
                          const attemptNumbers = selectedTestForDetails.completion_details.attempts.map(a => a.attempt_number);
                          await loadAttemptStatistics(selectedTestForDetails.assignment_id, attemptNumbers);
                        }
                      }}
                    >
                      <span className="text-sm text-gray-600">{t('studentHome.totalAttemptsMade')}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700">{selectedTestForDetails.total_attempts}</span>
                        <FontAwesomeIcon
                          icon={showAttemptHistory ? faChevronUp : faChevronDown}
                          className="text-blue-600 text-xs"
                        />
                      </div>
                    </div>

                    {/* Attempt History - Expandable */}
                    {showAttemptHistory && selectedTestForDetails.completion_details?.attempts && (
                      <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                        {selectedTestForDetails.completion_details.attempts
                          .sort((a, b) => b.attempt_number - a.attempt_number)
                          .map((attempt, idx) => {
                            // Get real stats from answers table
                            const stats = attemptStats[attempt.attempt_number];
                            const questionsAnswered = stats?.questionsAnswered ?? attempt.questions_answered;
                            const sectionTimes = stats?.sectionTimes ?? attempt.section_times;
                            const totalTime = stats?.totalTime ?? attempt.total_time_seconds;

                            return (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                {/* Attempt Header */}
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-brand-dark">
                                    {t('studentHome.attempt')} #{attempt.attempt_number}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    attempt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    attempt.status === 'annulled' ? 'bg-red-100 text-red-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                    {attempt.status.toUpperCase()}
                                  </span>
                                </div>

                                {/* Attempt Details */}
                                <div className="space-y-1 text-xs">
                                  {/* Time - from answers table */}
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 flex items-center gap-1">
                                      <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                      {t('studentHome.duration')}:
                                    </span>
                                    <span className="font-medium text-gray-700">
                                      {Math.floor(totalTime / 60)}m {totalTime % 60}s
                                    </span>
                                  </div>

                                  {/* Questions Answered - from answers table */}
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 flex items-center gap-1">
                                      <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-400" />
                                      {t('studentHome.questions')}:
                                    </span>
                                    <span className="font-medium text-gray-700">
                                      {questionsAnswered}{attempt.total_questions > 0 ? ` / ${attempt.total_questions}` : ''}
                                    </span>
                                  </div>

                                  {/* Score (if completed) - from JSONB */}
                                  {attempt.status === 'completed' && attempt.score !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">{t('studentHome.score')}:</span>
                                      <span className="font-bold text-green-600">{attempt.score.toFixed(1)}%</span>
                                    </div>
                                  )}

                                  {/* Section Times - from answers table */}
                                  {Object.keys(sectionTimes).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <div className="text-gray-600 mb-1">{t('studentHome.sectionTimes')}:</div>
                                      {Object.entries(sectionTimes).map(([section, seconds]) => (
                                        <div key={section} className="flex justify-between pl-2">
                                          <span className="text-gray-500">{section}:</span>
                                          <span className="font-medium text-gray-700">
                                            {Math.floor(seconds / 60)}m {seconds % 60}s
                                          </span>
                                        </div>
                                      ))}
                                      {/* Average time per question - calculated from real data */}
                                      {questionsAnswered > 0 && (
                                        <div className="flex justify-between pl-2 mt-1 pt-1 border-t border-gray-100">
                                          <span className="text-gray-500 italic">{t('studentHome.avgPerQuestion')}:</span>
                                          <span className="font-medium text-gray-700 italic">
                                            {Math.floor(totalTime / questionsAnswered)}s
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Reason & Date - from JSONB */}
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-gray-500 text-xs">
                                      {attempt.reason.replace('_', ' ')} • {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Dates */}
              {(selectedTestForDetails.assigned_at || selectedTestForDetails.start_time || selectedTestForDetails.completed_at) && (
                <div className="border-t pt-3 space-y-2">
                  <h4 className="font-semibold text-brand-dark mb-2">{t('studentHome.dates')}</h4>

                  {selectedTestForDetails.assigned_at && (
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{t('studentHome.assigned')}:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(selectedTestForDetails.assigned_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {selectedTestForDetails.start_time && (
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{t('studentHome.started')}:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(selectedTestForDetails.start_time).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  {selectedTestForDetails.completed_at && (
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{t('studentHome.completedAt')}:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(selectedTestForDetails.completed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Score */}
              {selectedTestForDetails.score !== null && (
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="text-sm font-semibold text-gray-700">{t('studentHome.score')}:</span>
                    <span className="text-2xl font-bold text-green-700">{selectedTestForDetails.score}%</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="border-t pt-4">
                <button
                  onClick={() => {
                    setSelectedTestForDetails(null);
                    setShowAttemptHistory(false);
                    setAttemptStats({});
                    navigate(`/take-test/${selectedTestForDetails.assignment_id}`);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-brand-green to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  disabled={selectedTestForDetails.status === 'locked'}
                >
                  {(selectedTestForDetails.completion_status?.startsWith('completed') || selectedTestForDetails.status === 'completed') ? t('studentHome.viewResults') :
                   selectedTestForDetails.status === 'locked' ? t('studentHome.testLocked') :
                   t('studentHome.startTest')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
