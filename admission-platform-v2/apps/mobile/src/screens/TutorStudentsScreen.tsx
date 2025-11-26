/**
 * Tutor Students Screen (Mobile)
 * Dedicated screen for viewing and managing students
 * This is the mobile equivalent of TutorStudentsPage
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
  Switch,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUserGraduate,
  faChartLine,
  faUsers,
  faPlus,
  faEdit,
  faClipboardList,
  faIdCard,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { CountdownTimer } from '../components/CountdownTimer';
import {
  fetchMyStudents,
  fetchAllStudents,
  type StudentWithAssignments,
} from '../lib/api/tutors';

// Brand colors matching web
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
  blue50: '#EFF6FF',
  blue200: '#BFDBFE',
  blue700: '#1D4ED8',
};

export default function TutorStudentsScreen() {
  const navigation = useNavigation<any>();
  const [students, setStudents] = useState<StudentWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAssignments | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [viewAll]);

  async function loadStudents() {
    setLoading(true);
    setError(null);

    try {
      const data = viewAll ? await fetchAllStudents() : await fetchMyStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadStudents();
  }

  if (loading && !refreshing) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.brandGreen} />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.brandGreen}
          />
        }
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Student Management</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('AssignTests')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <FontAwesomeIcon icon={faPlus} color={COLORS.white} size={16} />
              <Text style={styles.primaryButtonText}>Assign New Tests</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('ModifyTests')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <FontAwesomeIcon icon={faEdit} color={COLORS.brandDark} size={16} />
              <Text style={styles.secondaryButtonText}>Modify Tests</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content Card */}
        <View style={styles.mainCard}>
          {/* Header with Toggle */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <FontAwesomeIcon icon={faUsers} color={COLORS.brandGreen} size={24} />
              <Text style={styles.cardTitle}>Students</Text>
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>View All</Text>
              <Switch
                value={viewAll}
                onValueChange={setViewAll}
                trackColor={{ false: COLORS.gray300, true: COLORS.brandGreen }}
                thumbColor={COLORS.white}
                ios_backgroundColor={COLORS.gray300}
              />
            </View>
          </View>

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Empty State */}
          {students.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <FontAwesomeIcon icon={faUserGraduate} color={COLORS.gray300} size={64} />
              <Text style={styles.emptyStateText}>
                {viewAll
                  ? 'No students in the system'
                  : 'No students assigned to you'}
              </Text>
            </View>
          )}

          {/* Students List */}
          {students.map((student, index) => {
            const testTypes = [...new Set(student.assignments.map(a => a.test_type || 'Other'))];

            return (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentRow}>
                  <View style={styles.avatarCircle}>
                    <FontAwesomeIcon icon={faUserGraduate} color={COLORS.white} size={20} />
                  </View>

                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>
                      {student.name || student.email}
                    </Text>
                    {student.name && (
                      <Text style={styles.studentEmail}>{student.email}</Text>
                    )}

                    {/* Countdown Timer */}
                    {student.real_test_date && (
                      <View style={styles.timerContainer}>
                        <CountdownTimer
                          targetDate={student.real_test_date}
                          variant="compact"
                          showDate={false}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.testTypesWrapper}>
                      {testTypes.map(type => (
                        <View key={type} style={styles.testTypeBadge}>
                          <Text style={styles.testTypeText}>{type}</Text>
                        </View>
                      ))}
                      {testTypes.length === 0 && (
                        <View style={styles.testTypeBadgeEmpty}>
                          <Text style={styles.testTypeTextEmpty}>No tests</Text>
                        </View>
                      )}
                    </View>

                    {testTypes.length > 0 && (
                      <View style={styles.totalCountBadge}>
                        <Text style={styles.totalCountNumber}>{testTypes.length}</Text>
                        <Text style={styles.totalCountLabel}>
                          {testTypes.length === 1 ? 'Type' : 'Types'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Buttons Row */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('StudentProfile', { studentId: student.id })}
                    activeOpacity={0.7}
                  >
                    <FontAwesomeIcon icon={faIdCard} color={COLORS.brandGreen} size={16} />
                    <Text style={styles.profileButtonText}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.testsButton}
                    onPress={() => {
                      if (testTypes.length === 1) {
                        navigation.navigate('StudentTests', {
                          studentId: student.id,
                          testType: testTypes[0]
                        });
                      } else {
                        setSelectedStudent(student);
                        setShowTestModal(true);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <FontAwesomeIcon icon={faChartLine} color={COLORS.white} size={16} />
                    <Text style={styles.testsButtonText}>Tests</Text>
                  </TouchableOpacity>
                </View>

                {viewAll && student.tutor_name && (
                  <View
                    style={[
                      styles.tutorBadge,
                      {
                        backgroundColor:
                          student.tutor_name === 'You'
                            ? COLORS.brandGreen
                            : COLORS.gray200,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tutorBadgeText,
                        {
                          color:
                            student.tutor_name === 'You'
                              ? COLORS.white
                              : COLORS.gray700,
                        },
                      ]}
                    >
                      Tutor: {student.tutor_name}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Test Selection Modal */}
      <Modal
        visible={showTestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedStudent && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTop}>
                    <View style={styles.modalHeaderLeft}>
                      <View style={styles.modalAvatar}>
                        <FontAwesomeIcon icon={faUserGraduate} color={COLORS.white} size={24} />
                      </View>
                      <View>
                        <Text style={styles.modalTitle}>
                          {selectedStudent.name || selectedStudent.email}
                        </Text>
                        {selectedStudent.name && (
                          <Text style={styles.modalSubtitle}>{selectedStudent.email}</Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowTestModal(false)}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalTestCount}>
                    {selectedStudent.assignments.length} {selectedStudent.assignments.length === 1 ? 'test' : 'tests'} assigned
                  </Text>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedStudent.assignments.length === 0 ? (
                    <View style={styles.emptyModalState}>
                      <FontAwesomeIcon icon={faClipboardList} color={COLORS.gray300} size={64} />
                      <Text style={styles.emptyModalText}>No tests assigned yet</Text>
                    </View>
                  ) : (
                    <View style={styles.testTypeGrid}>
                      {(() => {
                        const testTypes = [...new Set(selectedStudent.assignments.map(a => a.test_type || 'Other'))];

                        return testTypes.map((testType) => {
                          const testsOfType = selectedStudent.assignments.filter(a => (a.test_type || 'Other') === testType);

                          return (
                            <TouchableOpacity
                              key={testType}
                              style={styles.testTypeCard}
                              onPress={() => {
                                navigation.navigate('StudentTests', {
                                  studentId: selectedStudent.id,
                                  testType: testType
                                });
                                setShowTestModal(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <FontAwesomeIcon
                                icon={faClipboardList}
                                color={COLORS.brandGreen}
                                size={28}
                              />
                              <Text style={styles.testTypeCardTitle}>{testType}</Text>
                              <Text style={styles.testTypeCardCount}>
                                {testsOfType.length} {testsOfType.length === 1 ? 'test' : 'tests'}
                              </Text>
                            </TouchableOpacity>
                          );
                        });
                      })()}
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  pageHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  actionButtons: {
    marginBottom: 24,
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  secondaryButtonText: {
    color: COLORS.brandDark,
    fontSize: 16,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandDark,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  studentCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.brandDark,
  },
  studentEmail: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testTypesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  testTypeBadge: {
    backgroundColor: COLORS.blue50,
    borderWidth: 1,
    borderColor: COLORS.blue200,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  testTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.blue700,
  },
  testTypeBadgeEmpty: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  testTypeTextEmpty: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray400,
  },
  totalCountBadge: {
    backgroundColor: COLORS.brandGreen,
    borderWidth: 2,
    borderColor: COLORS.green700,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 50,
  },
  totalCountNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  totalCountLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  tutorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  tutorBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    backgroundColor: COLORS.brandGreen,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  modalTestCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalBody: {
    padding: 16,
  },
  testTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  testTypeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testTypeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brandDark,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  testTypeCardCount: {
    fontSize: 11,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  emptyModalState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyModalText: {
    fontSize: 16,
    color: COLORS.gray500,
    marginTop: 16,
  },
  timerContainer: {
    marginTop: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.brandGreen,
    paddingVertical: 10,
    borderRadius: 8,
  },
  profileButtonText: {
    color: COLORS.brandGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  testsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 10,
    borderRadius: 8,
  },
  testsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
