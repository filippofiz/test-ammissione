/**
 * Student Profile Screen (React Native - Tutor View)
 * Allows tutors to:
 * - Set real test date with countdown timer
 * - Track average school grades
 * - Record past test attempts and results
 * - Add notes about the student
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { CountdownTimer } from '../components/CountdownTimer';
import { supabase } from '../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  real_test_date: string | null;
  average_school_grade: number | null;
  past_test_results: PastTestResult[];
  student_notes: string | null;
}

interface PastTestResult {
  id: string;
  date: string;
  test_type: string;
  score: number | string;
  notes?: string;
}

export default function StudentProfileScreen({ route, navigation }: any) {
  const { studentId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Form fields
  const [realTestDate, setRealTestDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [averageGrade, setAverageGrade] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [pastResults, setPastResults] = useState<PastTestResult[]>([]);

  // New past result form
  const [showAddResult, setShowAddResult] = useState(false);
  const [newResult, setNewResult] = useState({
    date: new Date(),
    showDatePicker: false,
    test_type: '',
    score: '',
    notes: '',
  });

  useEffect(() => {
    loadStudentProfile();
  }, [studentId]);

  async function loadStudentProfile() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('2V_profiles')
        .select('id, name, email, real_test_date, average_school_grade, past_test_results, student_notes')
        .eq('id', studentId)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Student not found');
      }

      const profileData: StudentProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        real_test_date: data.real_test_date,
        average_school_grade: data.average_school_grade,
        past_test_results: data.past_test_results || [],
        student_notes: data.student_notes,
      };

      setProfile(profileData);
      setRealTestDate(data.real_test_date ? new Date(data.real_test_date) : null);
      setAverageGrade(data.average_school_grade?.toString() || '');
      setStudentNotes(data.student_notes || '');
      setPastResults(data.past_test_results || []);
    } catch (err) {
      console.error('Error loading student profile:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!studentId) return;

    setSaving(true);

    try {
      const updateData: any = {
        student_notes: studentNotes || null,
        real_test_date: realTestDate ? realTestDate.toISOString() : null,
      };

      // Validate and update average grade
      if (averageGrade) {
        const grade = parseFloat(averageGrade);
        if (isNaN(grade) || grade < 0 || grade > 100) {
          throw new Error('Average grade must be between 0 and 100');
        }
        updateData.average_school_grade = grade;
      } else {
        updateData.average_school_grade = null;
      }

      // Update past results
      updateData.past_test_results = pastResults;

      const { error } = await supabase
        .from('2V_profiles')
        .update(updateData)
        .eq('id', studentId);

      if (error) throw error;

      Alert.alert('Success', 'Student profile updated successfully!');
      await loadStudentProfile();
    } catch (err) {
      console.error('Error saving student profile:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save student profile');
    } finally {
      setSaving(false);
    }
  }

  function handleAddPastResult() {
    if (!newResult.test_type || !newResult.score) {
      Alert.alert('Error', 'Please fill in test type and score');
      return;
    }

    const result: PastTestResult = {
      id: Date.now().toString(),
      date: newResult.date.toISOString(),
      test_type: newResult.test_type,
      score: newResult.score,
      notes: newResult.notes || undefined,
    };

    setPastResults([...pastResults, result]);
    setNewResult({
      date: new Date(),
      showDatePicker: false,
      test_type: '',
      score: '',
      notes: '',
    });
    setShowAddResult(false);
  }

  function handleDeletePastResult(id: string) {
    Alert.alert('Delete Result', 'Are you sure you want to delete this test result?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setPastResults(pastResults.filter((r) => r.id !== id)),
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading student profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Student not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Student Info Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{profile.name}</Text>
          <Text style={styles.headerEmail}>{profile.email}</Text>
        </View>
      </View>

      {/* Countdown Timer Card */}
      {profile.real_test_date && (
        <View style={styles.section}>
          <CountdownTimer
            targetDate={profile.real_test_date}
            label="Real Test Date"
            variant="card"
            showDate={true}
          />
        </View>
      )}

      {/* Real Test Date Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="calendar" size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>Real Test Date</Text>
        </View>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <FontAwesome name="calendar" size={16} color="#6B7280" />
            <Text style={styles.dateButtonText}>
              {realTestDate
                ? realTestDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Select Date & Time'}
            </Text>
          </TouchableOpacity>
          {realTestDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setRealTestDate(null)}
            >
              <FontAwesome name="times" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.helperText}>
          This will create a countdown timer visible to both you and the student
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={realTestDate || new Date()}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setRealTestDate(selectedDate);
            }
          }}
        />
      )}

      {/* Average School Grade Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="graduation-cap" size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>Average School Grade</Text>
        </View>
        <TextInput
          style={styles.input}
          value={averageGrade}
          onChangeText={setAverageGrade}
          placeholder="e.g., 85.5"
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.helperText}>Student's average grade at school (0-100)</Text>
      </View>

      {/* Past Test Results Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="history" size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>Past Test Results</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddResult(!showAddResult)}
          >
            <FontAwesome name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Add New Result Form */}
        {showAddResult && (
          <View style={styles.addResultForm}>
            <Text style={styles.addResultTitle}>Add Past Test Result</Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setNewResult({ ...newResult, showDatePicker: true })}
            >
              <FontAwesome name="calendar" size={14} color="#6B7280" />
              <Text style={styles.dateButtonTextSmall}>
                {newResult.date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            {newResult.showDatePicker && (
              <DateTimePicker
                value={newResult.date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setNewResult({
                    ...newResult,
                    showDatePicker: Platform.OS === 'ios',
                    date: selectedDate || newResult.date,
                  });
                }}
              />
            )}

            <TextInput
              style={styles.inputSmall}
              value={newResult.test_type}
              onChangeText={(text) => setNewResult({ ...newResult, test_type: text })}
              placeholder="Test Type (e.g., SAT, ACT, TOLC)"
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              style={styles.inputSmall}
              value={newResult.score}
              onChangeText={(text) => setNewResult({ ...newResult, score: text })}
              placeholder="Score (e.g., 1250, 28, 75%)"
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              style={styles.inputSmall}
              value={newResult.notes}
              onChangeText={(text) => setNewResult({ ...newResult, notes: text })}
              placeholder="Notes (optional)"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.addResultButtons}>
              <TouchableOpacity style={styles.addResultButton} onPress={handleAddPastResult}>
                <Text style={styles.addResultButtonText}>Add Result</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelResultButton}
                onPress={() => {
                  setShowAddResult(false);
                  setNewResult({
                    date: new Date(),
                    showDatePicker: false,
                    test_type: '',
                    score: '',
                    notes: '',
                  });
                }}
              >
                <Text style={styles.cancelResultButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Past Results List */}
        {pastResults.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="history" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No past test results recorded</Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {pastResults
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((result) => (
                <View key={result.id} style={styles.resultCard}>
                  <View style={styles.resultInfo}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultTestType}>{result.test_type}</Text>
                      <View style={styles.resultScoreBadge}>
                        <Text style={styles.resultScore}>{result.score}</Text>
                      </View>
                    </View>
                    <Text style={styles.resultDate}>
                      {new Date(result.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    {result.notes && <Text style={styles.resultNotes}>{result.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePastResult(result.id)}
                  >
                    <FontAwesome name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}
      </View>

      {/* Student Notes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="sticky-note" size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>Student Notes</Text>
        </View>
        <TextInput
          style={styles.textArea}
          value={studentNotes}
          onChangeText={setStudentNotes}
          placeholder="Add any notes about the student's progress, strengths, weaknesses, goals, etc."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Saving...</Text>
          </>
        ) : (
          <>
            <FontAwesome name="save" size={16} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Student Profile</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    backgroundColor: '#10B981',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputSmall: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
  },

  // Date Button
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dateButtonTextSmall: {
    fontSize: 14,
    color: '#1F2937',
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Add Result Form
  addResultForm: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  addResultButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addResultButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addResultButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelResultButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelResultButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 12,
  },

  // Results List
  resultsList: {
    gap: 12,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultTestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resultScoreBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultScore: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  bottomSpacer: {
    height: 32,
  },
});
