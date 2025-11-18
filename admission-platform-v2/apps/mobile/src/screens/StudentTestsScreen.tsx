/**
 * Student Tests Screen (Mobile) - Tutor View
 * Shows all tests of a specific type for a student
 * Allows tutor to:
 * - View test status (locked, unlocked, in_progress, completed)
 * - Unlock tests
 * - Lock tests
 * - View test details
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
  Modal,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faLock,
  faLockOpen,
  faSpinner,
  faCheckCircle,
  faClipboardList,
  faUserGraduate,
  faCalendar,
  faClock,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

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
  green200: '#D1FAE5',
  green600: '#059669',
  green700: '#047857',
  blue50: '#EFF6FF',
  blue200: '#BFDBFE',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  yellow50: '#FFFBEB',
  yellow200: '#FEF08A',
  yellow600: '#D97706',
  red50: '#FEF2F2',
  red200: '#FECACA',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',
};

interface TestAssignment {
  id: string;
  test_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  assigned_at: string | null;
  start_time: string | null;
  completed_at: string | null;
  score: number | null;
  test_name: string;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  duration_minutes: number;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
}

export default function StudentTestsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { studentId, testType } = route.params;

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [locking, setLocking] = useState<string | null>(null);
  const [showConfirmLock, setShowConfirmLock] = useState(false);
  const [pendingLockId, setPendingLockId] = useState<string | null>(null);

  useEffect(() => {
    if (studentId && testType) {
      loadData();
    }
  }, [studentId, testType]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const { data: studentData, error: studentError } = await supabase
        .from('2V_profiles')
        .select('id, name, email')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      setStudent({
        id: studentData.id,
        name: studentData.name || '',
        email: studentData.email,
      });

      const { data: sectionOrderData } = await supabase
        .from('2V_section_order')
        .select('section_order')
        .eq('test_type', testType)
        .maybeSingle();

      const sectionOrder = sectionOrderData?.section_order || [];

      const { data: assignmentData, error: assignmentError } = await supabase
        .from('2V_test_assignments')
        .select(`
          id,
          test_id,
          status,
          assigned_at,
          start_time,
          completed_at,
          2V_tests!inner (
            test_type,
            section,
            exercise_type,
            test_number,
            default_duration_mins
          )
        `)
        .eq('student_id', studentId)
        .eq('2V_tests.test_type', testType);

      if (assignmentError) throw assignmentError;

      const transformedAssignments = assignmentData.map((row: any) => {
        const section = row['2V_tests'].section;
        const exerciseType = row['2V_tests'].exercise_type;
        const testNumber = row['2V_tests'].test_number;

        const displaySection = section.toLowerCase().includes('multi')
          ? exerciseType
          : section;

        const testName = section.toLowerCase().includes('multi')
          ? `${exerciseType} ${testNumber}`
          : `${section} - ${exerciseType} ${testNumber}`;

        return {
          id: row.id,
          test_id: row.test_id,
          status: row.status,
          assigned_at: row.assigned_at,
          start_time: row.start_time,
          completed_at: row.completed_at,
          score: null,
          test_name: testName,
          test_type: row['2V_tests'].test_type,
          section: displaySection,
          exercise_type: exerciseType,
          test_number: testNumber,
          duration_minutes: row['2V_tests'].default_duration_mins,
        };
      });

      transformedAssignments.sort((a, b) => {
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

      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleUnlock(assignmentId: string) {
    setUnlocking(assignmentId);

    try {
      // Find the assignment to check its current status
      const assignment = assignments.find(a => a.id === assignmentId);

      console.log('🔍 Unlock check:', {
        assignmentId,
        foundAssignment: !!assignment,
        status: assignment?.status,
        current_attempt: assignment?.current_attempt,
        total_attempts: assignment?.total_attempts
      });

      // Prepare update object
      const updateData: any = {
        status: 'unlocked',
        // IMPORTANT: Reset results visibility when unlocking for retake
        // This prevents students from seeing previous attempt results during new attempt
        results_viewable_by_student: false
      };

      // If unlocking a completed/locked test for retake, increment current_attempt
      if (assignment?.status === 'completed' || assignment?.status === 'locked') {
        updateData.current_attempt = (assignment.current_attempt || 1) + 1;

        // Ensure total_attempts is at least current_attempt - 1 to satisfy constraint
        // This handles cases where current_attempt was manually incremented
        const minTotalAttempts = updateData.current_attempt - 1;
        if ((assignment.total_attempts || 0) < minTotalAttempts) {
          updateData.total_attempts = minTotalAttempts;
          console.log(`📝 Adjusting total_attempts from ${assignment.total_attempts} to ${minTotalAttempts} to satisfy constraint`);
        }

        console.log(`📝 Unlocking completed/locked test for retake | New attempt: ${updateData.current_attempt} | Hiding previous results`);
      } else {
        console.log(`⚠️ NOT incrementing attempt - status is: ${assignment?.status}`);
      }

      const { error } = await supabase
        .from('2V_test_assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) throw error;

      await loadData();
    } catch (err) {
      console.error('Error unlocking test:', err);
      alert('Failed to unlock test');
    } finally {
      setUnlocking(null);
    }
  }

  function showLockConfirmation(assignmentId: string) {
    setPendingLockId(assignmentId);
    setShowConfirmLock(true);
  }

  function cancelLock() {
    setShowConfirmLock(false);
    setPendingLockId(null);
  }

  async function confirmLock() {
    if (!pendingLockId) return;

    const assignmentId = pendingLockId;
    setShowConfirmLock(false);
    setPendingLockId(null);
    setLocking(assignmentId);

    try {
      const { error } = await supabase
        .from('2V_test_assignments')
        .update({
          status: 'locked',
          // Reset results visibility when locking
          results_viewable_by_student: false
        })
        .eq('id', assignmentId);

      if (error) throw error;

      await loadData();
    } catch (err) {
      console.error('Error locking test:', err);
      alert('Failed to lock test');
    } finally {
      setLocking(null);
    }
  }

  async function handleAnnul(assignmentId: string) {
    try {
      const { error } = await supabase
        .from('2V_test_assignments')
        .update({
          status: 'annulled',
          // Reset results visibility when annulling
          results_viewable_by_student: false
        })
        .eq('id', assignmentId);

      if (error) throw error;

      console.log('✅ Test annulled:', assignmentId);
      await loadData();
    } catch (err) {
      console.error('Error annulling test:', err);
      alert('Failed to annul test');
    }
  }

  function getStatusStyles(status: string) {
    switch (status) {
      case 'completed':
        return {
          bg: COLORS.green50,
          border: COLORS.green200,
          text: COLORS.green700,
          icon: faCheckCircle,
          iconColor: COLORS.green600,
          label: 'Completed',
        };
      case 'in_progress':
        return {
          bg: COLORS.blue50,
          border: COLORS.blue200,
          text: COLORS.blue700,
          icon: faSpinner,
          iconColor: COLORS.blue600,
          label: 'In Progress',
        };
      case 'unlocked':
        return {
          bg: COLORS.yellow50,
          border: COLORS.yellow200,
          text: COLORS.yellow600,
          icon: faLockOpen,
          iconColor: COLORS.yellow600,
          label: 'Unlocked',
        };
      case 'locked':
      default:
        return {
          bg: COLORS.gray50,
          border: COLORS.gray200,
          text: COLORS.gray700,
          icon: faLock,
          iconColor: COLORS.gray600,
          label: 'Locked',
        };
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading && !refreshing) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.brandGreen} />
          <Text style={styles.loadingText}>Loading tests...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Lock Confirmation Modal */}
      <Modal
        visible={showConfirmLock}
        transparent
        animationType="fade"
        onRequestClose={cancelLock}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <FontAwesomeIcon icon={faLock} size={32} color={COLORS.red600} />
            </View>
            <Text style={styles.modalTitle}>Lock This Test?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to lock this test? The student will not be able to access it until you unlock it again.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={cancelLock}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmLock}>
                <Text style={styles.modalConfirmText}>Yes, Lock It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[COLORS.brandGreen]} />
        }
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={16} color={COLORS.brandGreen} />
            <Text style={styles.backButtonText}>Back to Students</Text>
          </TouchableOpacity>

          {/* Student Header */}
          <View style={styles.studentHeader}>
            <View style={styles.studentIcon}>
              <FontAwesomeIcon icon={faUserGraduate} size={24} color={COLORS.white} />
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student?.name || student?.email}</Text>
              {student?.name && (
                <Text style={styles.studentEmail}>{student.email}</Text>
              )}
              <View style={styles.studentBadges}>
                <View style={styles.testTypeBadge}>
                  <FontAwesomeIcon icon={faClipboardList} size={12} color={COLORS.blue700} />
                  <Text style={styles.testTypeBadgeText}>{testType}</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {assignments.length} {assignments.length === 1 ? 'test' : 'tests'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Error State */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Tests List */}
          {assignments.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesomeIcon icon={faClipboardList} size={60} color={COLORS.gray300} />
              <Text style={styles.emptyText}>
                No {testType} tests assigned to this student yet
              </Text>
            </View>
          ) : (
            assignments.map((assignment, index) => {
              const statusStyle = getStatusStyles(assignment.status);
              const isUnlocking = unlocking === assignment.id;
              const isLocking = locking === assignment.id;

              return (
                <View
                  key={assignment.id}
                  style={[
                    styles.testCard,
                    { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }
                  ]}
                >
                  {/* Test Info */}
                  <View style={styles.testInfo}>
                    <View style={styles.testHeader}>
                      <FontAwesomeIcon
                        icon={statusStyle.icon}
                        size={24}
                        color={statusStyle.iconColor}
                      />
                      <View style={styles.testHeaderText}>
                        <Text style={styles.testName}>{assignment.test_name}</Text>
                        <Text style={[styles.testStatus, { color: statusStyle.text }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                    </View>

                    {/* Test Details */}
                    <View style={styles.testDetails}>
                      <View style={styles.testDetail}>
                        <FontAwesomeIcon icon={faClock} size={14} color={COLORS.gray400} />
                        <Text style={styles.testDetailText}>
                          Duration: {assignment.duration_minutes} min
                        </Text>
                      </View>
                      {assignment.assigned_at && (
                        <View style={styles.testDetail}>
                          <FontAwesomeIcon icon={faCalendar} size={14} color={COLORS.gray400} />
                          <Text style={styles.testDetailText}>
                            Assigned: {formatDate(assignment.assigned_at)}
                          </Text>
                        </View>
                      )}
                      {assignment.start_time && (
                        <View style={styles.testDetail}>
                          <FontAwesomeIcon icon={faCalendar} size={14} color={COLORS.gray400} />
                          <Text style={styles.testDetailText}>
                            Started: {formatDate(assignment.start_time)}
                          </Text>
                        </View>
                      )}
                      {assignment.completed_at && (
                        <View style={styles.testDetail}>
                          <FontAwesomeIcon icon={faCalendar} size={14} color={COLORS.gray400} />
                          <Text style={styles.testDetailText}>
                            Completed: {formatDate(assignment.completed_at)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.testActions}>
                    {assignment.status === 'locked' && (
                      <TouchableOpacity
                        style={styles.unlockButton}
                        onPress={() => handleUnlock(assignment.id)}
                        disabled={isUnlocking}
                      >
                        {isUnlocking ? (
                          <>
                            <ActivityIndicator size="small" color={COLORS.white} />
                            <Text style={styles.unlockButtonText}>Unlocking...</Text>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faLockOpen} size={14} color={COLORS.white} />
                            <Text style={styles.unlockButtonText}>Unlock</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    {(assignment.status === 'unlocked' || assignment.status === 'in_progress') && (
                      <TouchableOpacity
                        style={styles.lockButton}
                        onPress={() => showLockConfirmation(assignment.id)}
                        disabled={isLocking}
                      >
                        {isLocking ? (
                          <>
                            <ActivityIndicator size="small" color={COLORS.white} />
                            <Text style={styles.lockButtonText}>Locking...</Text>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faLock} size={14} color={COLORS.white} />
                            <Text style={styles.lockButtonText}>Lock</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    {(assignment.status === 'completed' || assignment.status === 'locked') && (
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('TestResults', { assignmentId: assignment.id })}
                      >
                        <FontAwesomeIcon icon={faEye} size={14} color={COLORS.blue700} />
                        <Text style={styles.viewButtonText}>View Results</Text>
                      </TouchableOpacity>
                    )}
                  </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.brandGreen,
  },
  studentHeader: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  studentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 12,
  },
  studentBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  testTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.blue50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue200,
  },
  testTypeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.blue700,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
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
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray500,
    textAlign: 'center',
  },
  testCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testInfo: {
    marginBottom: 16,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  testHeaderText: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 4,
  },
  testStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  testDetails: {
    gap: 8,
  },
  testDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testDetailText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  testActions: {
    flexDirection: 'row',
    gap: 8,
  },
  unlockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.brandGreen,
    borderRadius: 8,
  },
  unlockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  lockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.red600,
    borderRadius: 8,
  },
  lockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.blue50,
    borderWidth: 1,
    borderColor: COLORS.blue200,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.blue700,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.red50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.red600,
    borderRadius: 12,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
});
