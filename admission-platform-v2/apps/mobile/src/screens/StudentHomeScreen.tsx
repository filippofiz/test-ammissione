/**
 * Student Home Screen (Mobile)
 * Shows test track for students with their assigned tests
 * - If multiple test types: shows selection screen
 * - If single test type: shows test track directly
 * - Test track displays tests grouped by section and exercise type
 * - Shows status: locked, unlocked, in_progress, completed
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faLock,
  faLockOpen,
  faSpinner,
  faCheckCircle,
  faClipboardList,
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { CountdownTimer } from '../components/CountdownTimer';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/auth';
import Svg, { Circle } from 'react-native-svg';

const COLORS = {
  brandDark: '#1c2545',
  brandGreen: '#00a666',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  green50: '#ECFDF5',
  green600: '#059669',
  green700: '#047857',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  yellow50: '#FFFBEB',
  yellow600: '#D97706',
  red50: '#FEF2F2',
  red200: '#FECACA',
  red700: '#B91C1C',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TestType {
  test_type: string;
  total_count: number;
  completed_count: number;
  unlocked_count: number;
}

interface TestAssignment {
  assignment_id: string;
  test_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  assigned_at: string | null;
  start_time: string | null;
  completed_at: string | null;
  score: number | null;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  duration_minutes: number;
  current_attempt: number;
  results_viewable_by_student: boolean;
}

interface GroupedTests {
  [section: string]: {
    [exerciseType: string]: TestAssignment[];
  };
}

export default function StudentHomeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const selectedTestType = route.params?.testType;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [tests, setTests] = useState<TestAssignment[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [realTestDate, setRealTestDate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTestType && testTypes.length > 0) {
      setSelectedType(selectedTestType);
      loadTests(selectedTestType);
    }
  }, [selectedTestType, testTypes]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
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

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
      } else {
        setRealTestDate(profileData?.real_test_date || null);
      }

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
        if (assignment.status === 'completed') stats.completed_count++;
        if (assignment.status === 'unlocked' || assignment.status === 'in_progress') stats.unlocked_count++;
      });

      const types = Array.from(typeMap.values());
      setTestTypes(types);

      if (types.length === 1 && !selectedTestType) {
        const singleType = types[0].test_type;
        setSelectedType(singleType);
        await loadTests(singleType);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadTests(testType: string) {
    setLoading(true);
    setError(null);

    try {
      const profile = await getCurrentProfile();
      if (!profile) throw new Error('Profile not found');

      const { data: sectionOrderData } = await supabase
        .from('2V_section_order')
        .select('section_order')
        .eq('test_type', testType)
        .maybeSingle();

      const sectionOrder = sectionOrderData?.section_order || [];

      const { data, error: testError} = await supabase
        .from('2V_test_assignments')
        .select(`
          id,
          test_id,
          status,
          assigned_at,
          start_time,
          completed_at,
          current_attempt,
          results_viewable_by_student,
          2V_tests!inner (
            test_type,
            section,
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

        const displaySection = section.toLowerCase().includes('multi')
          ? exerciseType
          : section;

        return {
          assignment_id: row.id,
          test_id: row.test_id,
          status: row.status,
          assigned_at: row.assigned_at,
          start_time: row.start_time,
          completed_at: row.completed_at,
          score: null,
          test_type: row['2V_tests'].test_type,
          section: displaySection,
          exercise_type: exerciseType,
          test_number: row['2V_tests'].test_number,
          duration_minutes: row['2V_tests'].default_duration_mins,
          current_attempt: row.current_attempt || 1,
          results_viewable_by_student: row.results_viewable_by_student || false,
        };
      });

      // Sort tests
      transformedTests.sort((a, b) => {
        const isAssessment = (item: typeof a) => {
          const text = (item.section + ' ' + item.exercise_type).toLowerCase();
          return text.includes('assess') && text.includes('iniz');
        };

        const isSimulazione = (item: typeof a) => {
          const text = (item.section + ' ' + item.exercise_type).toLowerCase();
          return text.includes('simulaz');
        };

        const aIsAssessment = isAssessment(a);
        const bIsAssessment = isAssessment(b);
        const aIsSimulazione = isSimulazione(a);
        const bIsSimulazione = isSimulazione(b);

        if (aIsAssessment && !bIsAssessment) return -1;
        if (!aIsAssessment && bIsAssessment) return 1;

        if (aIsSimulazione && !bIsSimulazione) return 1;
        if (!aIsSimulazione && bIsSimulazione) return -1;

        if (a.section !== b.section) {
          const aIndex = sectionOrder.indexOf(a.section);
          const bIndex = sectionOrder.indexOf(b.section);

          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }

          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;

          return a.section.localeCompare(b.section);
        }

        if (a.exercise_type !== b.exercise_type) {
          return a.exercise_type.localeCompare(b.exercise_type);
        }

        return a.test_number - b.test_number;
      });

      setTests(transformedTests);

      const sections = new Set(transformedTests.map(t => t.section));
      setExpandedSections(sections);
    } catch (err) {
      console.error('Error loading tests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleTestTypeSelect(testType: string) {
    setSelectedType(testType);
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

  function getStatusStyles(status: string) {
    switch (status) {
      case 'completed':
        return {
          bg: COLORS.green600,
          text: COLORS.white,
          border: COLORS.green700,
          icon: faCheckCircle,
        };
      case 'in_progress':
        return {
          bg: COLORS.blue600,
          text: COLORS.white,
          border: COLORS.blue700,
          icon: faSpinner,
        };
      case 'unlocked':
        return {
          bg: COLORS.white,
          text: COLORS.brandGreen,
          border: COLORS.brandGreen,
          icon: faLockOpen,
        };
      case 'locked':
      default:
        return {
          bg: COLORS.gray100,
          text: COLORS.gray400,
          border: COLORS.gray300,
          icon: faLock,
        };
    }
  }

  function calculateProgress() {
    if (tests.length === 0) return 0;
    const completed = tests.filter(t => t.status === 'completed').length;
    return Math.round((completed / tests.length) * 100);
  }

  function getMotivationalMessage() {
    const progress = calculateProgress();
    if (progress === 0) return '🚀 Inizia il tuo percorso!';
    if (progress < 20) return '💪 Ottimo inizio! Continua così!';
    if (progress < 40) return '🌟 Stai andando alla grande!';
    if (progress < 60) return '🔥 Sei oltre la metà! Non mollare!';
    if (progress < 80) return '🏃 Quasi alla fine! Forza!';
    if (progress < 100) return '🎯 Ancora un po\' e hai finito!';
    return '🎉 Fantastico! Hai completato tutto!';
  }

  if (loading && !refreshing) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.brandGreen} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Layout>
    );
  }

  // Test Type Selection Screen
  if (!selectedType || testTypes.length === 0) {
    return (
      <Layout>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[COLORS.brandGreen]} />
          }
        >
          <View style={styles.content}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {testTypes.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesomeIcon icon={faClipboardList} size={60} color={COLORS.gray300} />
                <Text style={styles.emptyText}>No tests assigned yet</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.selectionTitle}>Select a Test Type</Text>
                {testTypes.map((type, index) => {
                  const progress = type.total_count > 0
                    ? Math.round((type.completed_count / type.total_count) * 100)
                    : 0;

                  return (
                    <TouchableOpacity
                      key={type.test_type}
                      style={styles.testTypeCard}
                      onPress={() => handleTestTypeSelect(type.test_type)}
                    >
                      <View style={styles.testTypeIcon}>
                        <FontAwesomeIcon icon={faClipboardList} size={24} color={COLORS.white} />
                      </View>
                      <View style={styles.testTypeContent}>
                        <Text style={styles.testTypeName}>{type.test_type}</Text>
                        <View style={styles.progressRow}>
                          <Text style={styles.progressLabel}>Progress</Text>
                          <Text style={styles.progressValue}>{progress}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <View style={styles.statsRow}>
                          <Text style={styles.statText}>✅ {type.completed_count} completed</Text>
                          <Text style={styles.statText}>📝 {type.total_count} total</Text>
                          <Text style={styles.statText}>🔓 {type.unlocked_count} available</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </Layout>
    );
  }

  // Test Track Screen
  const grouped = groupTests(tests);
  const sections = Object.keys(grouped).sort();
  const progress = calculateProgress();
  const completedCount = tests.filter(t => t.status === 'completed').length;
  const unlockedCount = tests.filter(t => t.status === 'unlocked' || t.status === 'in_progress').length;

  return (
    <Layout>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadTests(selectedType)} colors={[COLORS.brandGreen]} />
        }
      >
        {/* Countdown Timer (if real test date is set) */}
        {realTestDate && (
          <View style={styles.timerCard}>
            <CountdownTimer
              targetDate={realTestDate}
              label="Your Real Test Date"
              variant="card"
              showDate={true}
            />
          </View>
        )}

        <View style={styles.content}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {testTypes.length > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedType(null);
                setTests([]);
              }}
            >
              <Text style={styles.backButtonText}>← Back to test selection</Text>
            </TouchableOpacity>
          )}

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <Text style={styles.progressCardTitle}>Your Progress</Text>

            {/* Circular Progress */}
            <View style={styles.circularProgressContainer}>
              <View style={styles.circularProgress}>
                <Svg width={160} height={160}>
                  <Circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <Circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="80, 80"
                  />
                </Svg>
                <View style={styles.progressPercentage}>
                  <Text style={styles.progressPercentageText}>{progress}%</Text>
                  <Text style={styles.progressPercentageLabel}>Complete</Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.progressStatsRow}>
              <View style={styles.progressStatBox}>
                <Text style={styles.progressStatValue}>{completedCount}</Text>
                <Text style={styles.progressStatLabel}>Completed</Text>
              </View>
              <View style={styles.progressStatDivider} />
              <View style={styles.progressStatBox}>
                <Text style={styles.progressStatValue}>{tests.length}</Text>
                <Text style={styles.progressStatLabel}>Total</Text>
              </View>
              <View style={styles.progressStatDivider} />
              <View style={styles.progressStatBox}>
                <Text style={styles.progressStatValue}>{unlockedCount}</Text>
                <Text style={styles.progressStatLabel}>Available</Text>
              </View>
            </View>

            {/* Motivation Message */}
            <View style={styles.motivationBox}>
              <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
            </View>
          </View>

          {/* Test Sections */}
          {tests.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesomeIcon icon={faClipboardList} size={60} color={COLORS.gray300} />
              <Text style={styles.emptyTitle}>No Tests Assigned Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your tutor hasn't assigned any {selectedType} tests to you yet.
                Please contact your tutor to get started.
              </Text>
            </View>
          ) : (
            sections.map((section, index) => {
              const isExpanded = expandedSections.has(section);
              const exerciseTypes = Object.keys(grouped[section]).sort((a, b) => {
                if (a.toLowerCase().includes('training')) return -1;
                if (b.toLowerCase().includes('training')) return 1;
                if (a.toLowerCase().includes('assessment')) return -1;
                if (b.toLowerCase().includes('assessment')) return 1;
                return a.localeCompare(b);
              });

              const sectionTests = exerciseTypes.flatMap(et => grouped[section][et]);
              const sectionCompleted = sectionTests.filter(t => t.status === 'completed').length;
              const sectionProgress = sectionTests.length > 0
                ? Math.round((sectionCompleted / sectionTests.length) * 100)
                : 0;

              return (
                <View key={section} style={styles.sectionCard}>
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(section)}
                  >
                    <View style={styles.sectionHeaderLeft}>
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronDown : faChevronRight}
                        size={16}
                        color={COLORS.brandGreen}
                      />
                      <Text style={styles.sectionTitle}>{section}</Text>
                    </View>
                    <View style={styles.sectionHeaderRight}>
                      <Text style={styles.sectionCount}>
                        {sectionCompleted}/{sectionTests.length}
                      </Text>
                      <View style={styles.sectionProgressBar}>
                        <View style={[styles.sectionProgressFill, { width: `${sectionProgress}%` }]} />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.sectionContent}>
                      {exerciseTypes.map(exerciseType => (
                        <View key={exerciseType} style={styles.exerciseGroup}>
                          {section !== exerciseType && (
                            <Text style={styles.exerciseTypeLabel}>{exerciseType}</Text>
                          )}
                          <View style={styles.testsGrid}>
                            {grouped[section][exerciseType].map(test => {
                              const styles_status = getStatusStyles(test.status);
                              const isClickable = test.status !== 'locked';

                              return (
                                <View key={test.assignment_id} style={styles.testContainer}>
                                  <TouchableOpacity
                                    style={[
                                      styles.testButton,
                                      { backgroundColor: styles_status.bg, borderColor: styles_status.border }
                                    ]}
                                    onPress={() => {
                                      if (isClickable) {
                                        if (test.status === 'completed') {
                                          navigation.navigate('TestResults', { assignmentId: test.assignment_id });
                                        } else {
                                          navigation.navigate('TakeTest', { assignmentId: test.assignment_id });
                                        }
                                      }
                                    }}
                                    disabled={!isClickable}
                                  >
                                    <View style={styles.testButtonContent}>
                                      <Text style={[styles.testNumber, { color: styles_status.text }]}>
                                        {test.test_number}
                                      </Text>
                                      <Text style={[styles.testAttempt, { color: styles_status.text }]}>
                                        Attempt {test.current_attempt}
                                      </Text>
                                    </View>
                                    <View style={styles.testIcon}>
                                      <FontAwesomeIcon
                                        icon={styles_status.icon}
                                        size={test.status === 'locked' ? 16 : 12}
                                        color={styles_status.text}
                                      />
                                    </View>
                                  </TouchableOpacity>

                                  {/* View Results Button */}
                                  <TouchableOpacity
                                    style={[
                                      styles.viewResultsButton,
                                      !test.results_viewable_by_student && styles.viewResultsButtonDisabled
                                    ]}
                                    onPress={() => {
                                      if (test.results_viewable_by_student) {
                                        navigation.navigate('TestResults', { assignmentId: test.assignment_id });
                                      }
                                    }}
                                    disabled={!test.results_viewable_by_student}
                                  >
                                    <Text style={[
                                      styles.viewResultsText,
                                      !test.results_viewable_by_student && styles.viewResultsTextDisabled
                                    ]}>
                                      {test.results_viewable_by_student ? 'Results' : '🔒 Locked'}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
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
  timerCard: {
    margin: 16,
    marginBottom: 0,
  },
  content: {
    padding: 16,
  },
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
  errorBox: {
    backgroundColor: COLORS.red50,
    borderWidth: 2,
    borderColor: COLORS.red200,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.red700,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.brandDark,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  testTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  testTypeContent: {
    flex: 1,
  },
  testTypeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brandGreen,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.brandGreen,
  },
  progressCard: {
    backgroundColor: COLORS.brandGreen,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  progressCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circularProgress: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressPercentage: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 40,
  },
  progressPercentageLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  progressStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressStatLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  motivationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  motivationText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderTopWidth: 4,
    borderTopColor: COLORS.brandGreen,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    paddingVertical: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginLeft: 12,
  },
  sectionHeaderRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  sectionProgressBar: {
    width: 100,
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sectionProgressFill: {
    height: '100%',
    backgroundColor: COLORS.brandGreen,
    borderRadius: 3,
  },
  sectionContent: {
    padding: 18,
    paddingTop: 8,
  },
  exerciseGroup: {
    marginBottom: 24,
  },
  exerciseTypeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray600,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  testContainer: {
    alignItems: 'center',
  },
  testButton: {
    width: (SCREEN_WIDTH - 80) / 3.5,
    height: (SCREEN_WIDTH - 80) / 3.5 * 1.2,
    borderRadius: 12,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testAttempt: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.85,
  },
  testIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  viewResultsButton: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  viewResultsButtonDisabled: {
    backgroundColor: COLORS.gray50,
    borderColor: COLORS.gray200,
    opacity: 0.6,
  },
  viewResultsText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  viewResultsTextDisabled: {
    color: COLORS.gray400,
  },
});
