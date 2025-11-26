/**
 * Admin Migrate Answers Page
 * Migrates old student_answers to new 2V_student_answers table
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faDatabase,
  faSearch,
  faArrowRight,
  faUserGraduate,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

interface OldStudent {
  auth_uid: string;
  name: string;
  total_answers: number;
  tests: OldTestSummary[];
  migrated_count?: number; // Number of answers already migrated
  is_migrated?: boolean; // Has any migrated data
}

interface OldTestSummary {
  test_id: string;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  question_count: number;
  migrated_count?: number; // Number of answers already migrated for this test
}

interface NewStudent {
  id: string;
  email: string;
  name: string;
}

interface MigrationResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export default function AdminMigrateAnswersPage() {
  const [loading, setLoading] = useState(false);
  const [oldStudents, setOldStudents] = useState<OldStudent[]>([]);
  const [newStudents, setNewStudents] = useState<NewStudent[]>([]);
  const [selectedOldStudent, setSelectedOldStudent] = useState<string | null>(null);
  const [selectedNewStudent, setSelectedNewStudent] = useState<string | null>(null);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStudentSearch, setNewStudentSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Check migration status when both students are selected
  useEffect(() => {
    if (selectedOldStudent && selectedNewStudent) {
      checkMigrationStatus(selectedOldStudent, selectedNewStudent);
    }
  }, [selectedOldStudent, selectedNewStudent]);

  async function loadData() {
    setLoading(true);
    await Promise.all([loadOldStudents(), loadNewStudents()]);
    setLoading(false);
  }

  async function loadOldStudents() {
    try {
      // Load all students from students table
      const { data: allStudents, error: studentsError } = await supabase
        .from('students')
        .select('auth_uid, name, email');

      console.log('Old students loaded:', allStudents?.length);

      if (studentsError) {
        console.error('Error loading old students:', studentsError);
        return;
      }

      if (!allStudents || allStudents.length === 0) {
        console.log('No old students found');
        return;
      }

      // Create student list (tests will be lazy loaded)
      const students: OldStudent[] = allStudents.map(student => ({
        auth_uid: student.auth_uid,
        name: student.name || student.email || student.auth_uid.substring(0, 8) + '...',
        total_answers: 0, // Will be counted when tests are loaded
        tests: [], // Will be loaded when student is selected
      }));

      setOldStudents(students);
    } catch (err) {
      console.error('Error in loadOldStudents:', err);
    }
  }

  async function loadStudentTests(authUid: string) {
    try {
      // Load all answers for this specific student
      const { data: answers, error: answersError } = await supabase
        .from('student_answers')
        .select('test_id, question_id')
        .eq('auth_uid', authUid);

      if (answersError) {
        console.error('Error loading student answers:', answersError);
        return;
      }

      if (!answers || answers.length === 0) return;

      // Get the old student's email to auto-match
      const { data: oldStudentData } = await supabase
        .from('students')
        .select('email, name')
        .eq('auth_uid', authUid)
        .single();

      // Get unique test_ids
      const testIds = [...new Set(answers.map(a => a.test_id))];

      // Fetch test metadata
      const { data: testMetadata, error: testError } = await supabase
        .from('student_tests')
        .select('id, tipologia_test, section, tipologia_esercizi, progressivo')
        .in('id', testIds);

      if (testError) {
        console.error('Error loading test metadata:', testError);
        return;
      }

      const testMetadataMap = new Map(testMetadata?.map(t => [t.id, t]) || []);

      // Group by test_id
      const testMap = new Map<string, any[]>();
      answers.forEach(answer => {
        if (!testMap.has(answer.test_id)) {
          testMap.set(answer.test_id, []);
        }
        testMap.get(answer.test_id)!.push(answer);
      });

      // Create test summaries
      const tests: OldTestSummary[] = [];
      for (const [test_id, testAnswers] of testMap) {
        const metadata = testMetadataMap.get(test_id);
        tests.push({
          test_id,
          test_type: metadata?.tipologia_test || 'Unknown',
          section: metadata?.section || 'Unknown',
          exercise_type: metadata?.tipologia_esercizi || 'Unknown',
          test_number: metadata?.progressivo || 0,
          question_count: testAnswers.length,
          migrated_count: 0, // Will be updated below if target student is selected
        });
      }

      // Update the student with their tests and total answer count
      const totalAnswers = answers.length;
      setOldStudents(prev => prev.map(s =>
        s.auth_uid === authUid ? {
          ...s,
          tests,
          total_answers: totalAnswers,
          migrated_count: 0, // Will be updated below
          is_migrated: false, // Will be updated below
        } : s
      ));

      // Auto-select matching new student by email or name (flexible matching)
      if (oldStudentData && newStudents.length > 0) {
        const oldEmail = oldStudentData.email?.toLowerCase().trim();
        const oldName = oldStudentData.name?.toLowerCase().trim();

        const matchingStudent = newStudents.find(ns => {
          const newEmail = ns.email?.toLowerCase().trim();
          const newName = ns.name?.toLowerCase().trim();

          // Match by email (exact) or name (exact or contains)
          return (oldEmail && newEmail && oldEmail === newEmail) ||
                 (oldName && newName && (oldName === newName || newName.includes(oldName) || oldName.includes(newName)));
        });

        if (matchingStudent) {
          console.log('Auto-selected matching student:', matchingStudent.name);
          setSelectedNewStudent(matchingStudent.id);
        } else {
          console.log('No matching student found for:', oldStudentData.email || oldStudentData.name);
        }
      }
    } catch (err) {
      console.error('Error loading student tests:', err);
    }
  }

  async function loadNewStudents() {
    try {
      const { data: profiles, error } = await supabase
        .from('2V_profiles')
        .select('id, email, name, roles')
        .order('email');

      if (error) {
        console.error('Error loading new students:', error);
        return;
      }

      if (profiles) {
        // Filter for STUDENT role on client side
        const students = profiles.filter((p: any) => p.roles?.includes('STUDENT'));
        setNewStudents(students);
      }
    } catch (err) {
      console.error('Error in loadNewStudents:', err);
    }
  }

  // Check migration status for the selected old student against the target new student
  async function checkMigrationStatus(oldAuthUid: string, newStudentId: string) {
    try {
      const oldStudent = oldStudents.find(s => s.auth_uid === oldAuthUid);
      if (!oldStudent || oldStudent.tests.length === 0) return;

      // Get all question_ids from old student's answers
      const { data: oldAnswers } = await supabase
        .from('student_answers')
        .select('question_id, test_id')
        .eq('auth_uid', oldAuthUid);

      if (!oldAnswers || oldAnswers.length === 0) return;

      const oldQuestionIds = oldAnswers.map(a => a.question_id);

      // Check which of these questions are already in 2V_student_answers for the new student
      const { data: migratedAnswers } = await supabase
        .from('2V_student_answers')
        .select('question_id')
        .eq('student_id', newStudentId)
        .in('question_id', oldQuestionIds);

      const migratedQuestionIds = new Set(migratedAnswers?.map(a => a.question_id) || []);
      const totalMigrated = migratedQuestionIds.size;

      // Count migrated answers per test
      const testMigrationCount = new Map<string, number>();
      oldAnswers.forEach(answer => {
        if (migratedQuestionIds.has(answer.question_id)) {
          const count = testMigrationCount.get(answer.test_id) || 0;
          testMigrationCount.set(answer.test_id, count + 1);
        }
      });

      // Update student and test migration counts
      setOldStudents(prev => prev.map(s => {
        if (s.auth_uid === oldAuthUid) {
          return {
            ...s,
            migrated_count: totalMigrated,
            is_migrated: totalMigrated > 0,
            tests: s.tests.map(t => ({
              ...t,
              migrated_count: testMigrationCount.get(t.test_id) || 0,
            })),
          };
        }
        return s;
      }));
    } catch (err) {
      console.error('Error checking migration status:', err);
    }
  }

  function toggleTestSelection(testId: string) {
    const newSet = new Set(selectedTests);
    if (newSet.has(testId)) {
      newSet.delete(testId);
    } else {
      newSet.add(testId);
    }
    setSelectedTests(newSet);
  }

  function selectAllTests() {
    const oldStudent = oldStudents.find(s => s.auth_uid === selectedOldStudent);
    if (oldStudent) {
      setSelectedTests(new Set(oldStudent.tests.map(t => t.test_id)));
    }
  }

  function clearTestSelection() {
    setSelectedTests(new Set());
  }

  const currentOldStudent = oldStudents.find(s => s.auth_uid === selectedOldStudent);
  const currentNewStudent = newStudents.find(s => s.id === selectedNewStudent);

  // Filter students based on search query
  const filteredOldStudents = oldStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.auth_uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNewStudents = newStudents.filter(student =>
    student.name.toLowerCase().includes(newStudentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(newStudentSearch.toLowerCase())
  );

  // Map old test metadata to new test metadata format
  function mapOldMetadataToNew(oldTest: any): { test_type: string; section: string; exercise_type: string } {
    let test_type = oldTest.tipologia_test || oldTest.test_type;
    let section = oldTest.section;
    let exercise_type = oldTest.tipologia_esercizi || oldTest.exercise_type;

    // Map test_type: Remove " PDF" suffix from all test types
    // "BOCCONI PDF" → "BOCCONI", "SAT PDF" → "SAT", "GMAT PDF" → "GMAT", etc.
    if (test_type && test_type.endsWith(' PDF')) {
      test_type = test_type.replace(' PDF', '');
    }

    // Map exercise_type: "Esercizi per casa" → "Training"
    if (exercise_type === 'Esercizi per casa') {
      exercise_type = 'Training';
    }

    // Map exercise_type: "Assessment" → "Assessment Iniziale" (when section is Assessment Iniziale)
    if (exercise_type === 'Assessment' && section === 'Assessment Iniziale') {
      exercise_type = 'Assessment Iniziale';
      section = 'Multi-topic'; // Section also changes
    }

    return { test_type, section, exercise_type };
  }

  // Check if old test has a matching new test
  async function checkTestMapping(oldTest: OldTestSummary): Promise<boolean> {
    const mapped = mapOldMetadataToNew(oldTest);

    const { data: newTests } = await supabase
      .from('2V_tests')
      .select('id')
      .eq('test_type', mapped.test_type)
      .eq('section', mapped.section)
      .eq('exercise_type', mapped.exercise_type)
      .eq('test_number', oldTest.test_number);

    return (newTests?.length || 0) > 0;
  }

  async function migrateAnswers() {
    if (!selectedOldStudent || !selectedNewStudent || selectedTests.size === 0) {
      alert('Please select old student, new student, and at least one test to migrate');
      return;
    }

    setMigrating(true);
    setResult(null);
    setProgress(0);

    const errors: string[] = [];
    const logs: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    try {
      // 1. Fetch old answers only for selected tests
      logs.push(`[1/7] Fetching old answers for student ${selectedOldStudent}...`);
      const { data: oldAnswers, error: answersError } = await supabase
        .from('student_answers')
        .select('*')
        .eq('auth_uid', selectedOldStudent)
        .in('test_id', Array.from(selectedTests));

      if (answersError) throw answersError;

      const total = oldAnswers?.length || 0;
      logs.push(`✓ Found ${total} old answers to migrate`);
      console.log(`Found ${total} old answers to migrate`);

      if (!oldAnswers || total === 0) {
        setResult({ total: 0, success: 0, failed: 0, errors: ['No old answers found for selected tests'] });
        setMigrating(false);
        return;
      }

      // 2. Get unique test_ids from old answers
      const oldTestIds = [...new Set(oldAnswers.map(a => a.test_id))];

      // 3. Fetch old test metadata by test_id
      const { data: oldTests, error: testsError } = await supabase
        .from('student_tests')
        .select('id, tipologia_test, section, tipologia_esercizi, progressivo')
        .in('id', oldTestIds);

      if (testsError) throw testsError;

      const oldTestMap = new Map(oldTests?.map(t => [t.id, t]) || []);

      // 4. Fetch all new 2V_tests
      const { data: newTests, error: newTestsError } = await supabase
        .from('2V_tests')
        .select('id, test_type, section, exercise_type, test_number');

      if (newTestsError) throw newTestsError;

      // 5. Fetch all test assignments for the target student
      const { data: assignments, error: assignmentsError } = await supabase
        .from('2V_test_assignments')
        .select('id, test_id')
        .eq('student_id', selectedNewStudent)
        .eq('current_attempt', 1);

      if (assignmentsError) throw assignmentsError;

      const assignmentMap = new Map(assignments?.map(a => [a.test_id, a.id]) || []);

      // Track assignment completion dates (latest submitted_at per assignment)
      const assignmentCompletionDates = new Map<string, Date>();
      const assignmentStartDates = new Map<string, Date>();
      const assignmentHasAnswers = new Set<string>();

      // 6. Migrate each answer
      for (let i = 0; i < oldAnswers.length; i++) {
        const oldAnswer = oldAnswers[i];
        setProgress(Math.round(((i + 1) / total) * 100));

        try {
          // Get old test metadata
          const oldTest = oldTestMap.get(oldAnswer.test_id);
          if (!oldTest) {
            errors.push(`Question ${oldAnswer.question_id}: Old test ${oldAnswer.test_id} not found`);
            failedCount++;
            continue;
          }

          // Map old metadata to new format
          const mappedMetadata = mapOldMetadataToNew(oldTest);

          // Find matching new test by mapped metadata
          const newTest = newTests?.find(t =>
            t.test_type === mappedMetadata.test_type &&
            t.section === mappedMetadata.section &&
            t.exercise_type === mappedMetadata.exercise_type &&
            t.test_number === oldTest.progressivo
          );

          if (!newTest) {
            errors.push(`Question ${oldAnswer.question_id}: No matching new test for ${mappedMetadata.test_type} - ${mappedMetadata.section} - ${mappedMetadata.exercise_type} #${oldTest.progressivo} (original: ${oldTest.tipologia_test} - ${oldTest.section} - ${oldTest.tipologia_esercizi})`);
            failedCount++;
            continue;
          }

          // Get assignment ID
          const assignmentId = assignmentMap.get(newTest.id);
          if (!assignmentId) {
            errors.push(`Question ${oldAnswer.question_id}: No assignment found for test ${newTest.id}`);
            failedCount++;
            continue;
          }

          // Insert new answer
          const { error: insertError } = await supabase
            .from('2V_student_answers')
            .insert({
              assignment_id: assignmentId,
              student_id: selectedNewStudent,
              question_id: oldAnswer.question_id,
              attempt_number: 1,
              answer: { answer: oldAnswer.answer },
              auto_score: oldAnswer.auto_score,
              time_spent_seconds: 0,
              is_flagged: false,
              submitted_at: oldAnswer.submitted_at,
              created_at: oldAnswer.submitted_at,
              updated_at: oldAnswer.submitted_at,
              is_guided: false,
              guided_settings: null,
            });

          if (insertError) {
            // Check if it's a duplicate (conflict)
            if (insertError.code === '23505') {
              console.log(`Skipping duplicate: ${oldAnswer.question_id}`);
              successCount++;
              // Still track as successful for assignment completion
              assignmentHasAnswers.add(assignmentId);
              // Track latest completion date
              const submittedDate = new Date(oldAnswer.submitted_at);
              const currentLatest = assignmentCompletionDates.get(assignmentId);
              if (!currentLatest || submittedDate > currentLatest) {
                assignmentCompletionDates.set(assignmentId, submittedDate);
              }
              // Track earliest start date
              const currentEarliest = assignmentStartDates.get(assignmentId);
              if (!currentEarliest || submittedDate < currentEarliest) {
                assignmentStartDates.set(assignmentId, submittedDate);
              }
            } else {
              errors.push(`Question ${oldAnswer.question_id}: ${insertError.message}`);
              failedCount++;
            }
          } else {
            successCount++;
            // Track assignment completion
            assignmentHasAnswers.add(assignmentId);
            // Track latest completion date
            const submittedDate = new Date(oldAnswer.submitted_at);
            const currentLatest = assignmentCompletionDates.get(assignmentId);
            if (!currentLatest || submittedDate > currentLatest) {
              assignmentCompletionDates.set(assignmentId, submittedDate);
            }
            // Track earliest start date
            const currentEarliest = assignmentStartDates.get(assignmentId);
            if (!currentEarliest || submittedDate < currentEarliest) {
              assignmentStartDates.set(assignmentId, submittedDate);
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Question ${oldAnswer.question_id}: ${message}`);
          failedCount++;
        }
      }

      // 7. Update assignments to mark as completed
      console.log(`Updating ${assignmentHasAnswers.size} assignments...`);
      for (const assignmentId of assignmentHasAnswers) {
        const completedAt = assignmentCompletionDates.get(assignmentId);
        const startTime = assignmentStartDates.get(assignmentId);

        if (completedAt) {
          const formattedDate = completedAt.toISOString().split('T')[0]; // YYYY-MM-DD
          const formattedTime = completedAt.toISOString().split('T')[1].substring(0, 5); // HH:MM
          const completionStatus = `completed ${formattedDate} at ${formattedTime}`;

          const updateData: any = {
            status: 'locked',
            completed_at: completedAt.toISOString(),
            completion_status: completionStatus,
            current_attempt: 2,
            total_attempts: 1,
          };

          // Only set start_time if it's not already set
          if (startTime) {
            updateData.start_time = startTime.toISOString();
          }

          const { error: updateError } = await supabase
            .from('2V_test_assignments')
            .update(updateData)
            .eq('id', assignmentId);

          if (updateError) {
            console.error(`Failed to update assignment ${assignmentId}:`, updateError);
            errors.push(`Assignment update failed: ${updateError.message}`);
          } else {
            console.log(`Updated assignment ${assignmentId} - completed at ${completionStatus}`);
          }
        }
      }

      setResult({
        total,
        success: successCount,
        failed: failedCount,
        errors: [
          assignmentHasAnswers.size > 0
            ? `✓ Updated ${assignmentHasAnswers.size} test assignment(s) to completed status`
            : '',
          ...errors
        ].filter(Boolean).slice(0, 50), // Limit to first 50 errors
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setResult({
        total: 0,
        success: 0,
        failed: 0,
        errors: [message],
      });
    } finally {
      setMigrating(false);
      setProgress(100);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} className="text-6xl text-brand-green mb-4 animate-spin" />
            <p className="text-gray-600">Loading migration data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <FontAwesomeIcon icon={faDatabase} className="text-3xl text-brand-green" />
            <h1 className="text-3xl font-bold text-brand-dark">Migrate Student Answers</h1>
          </div>

          {!result && (
            <div className="mb-8">
              {/* Source: Old Student Selection */}
              <div className="border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faSearch} />
                    Step 1: Select Source Student (Old System)
                  </h2>
                  {currentOldStudent && (
                    <button
                      onClick={() => {
                        setSelectedOldStudent(null);
                        setSelectedTests(new Set());
                        setSelectedNewStudent(null);
                      }}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      Change Student
                    </button>
                  )}
                </div>

                {currentOldStudent ? (
                  /* Show selected student */
                  <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-brand-dark text-lg">{currentOldStudent.name}</div>
                      {currentOldStudent.is_migrated && (() => {
                        const isFullyMigrated = (currentOldStudent.migrated_count || 0) >= currentOldStudent.total_answers;
                        return (
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            isFullyMigrated ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            ✓ {isFullyMigrated ? 'Fully' : 'Partially'} Migrated
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {currentOldStudent.total_answers} answers • {currentOldStudent.tests.length} tests
                      {currentOldStudent.is_migrated && selectedNewStudent && (() => {
                        const migratedTests = currentOldStudent.tests.filter(t => (t.migrated_count || 0) > 0).length;
                        return (
                          <> • <span className="text-green-700 font-semibold">
                            {migratedTests}/{currentOldStudent.tests.length} tests migrated ({currentOldStudent.migrated_count} answers)
                          </span></>
                        );
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{currentOldStudent.auth_uid}</div>
                  </div>
                ) : (
                  /* Show student list */
                  <>
                    {/* Search Input */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {filteredOldStudents.map(student => (
                        <button
                          key={student.auth_uid}
                          onClick={() => {
                            setSelectedOldStudent(student.auth_uid);
                            setSelectedTests(new Set());
                            // Lazy load tests when student is selected
                            if (student.tests.length === 0) {
                              loadStudentTests(student.auth_uid);
                            }
                          }}
                          className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-gray-50 transition-all"
                        >
                          <div className="font-semibold text-brand-dark truncate">{student.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {student.tests.length > 0 ? `${student.total_answers} answers • ${student.tests.length} tests` : 'Click to load'}
                          </div>
                        </button>
                      ))}
                      {filteredOldStudents.length === 0 && !loading && (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500 mb-2">
                            {searchQuery ? 'No students match your search' : 'No old students found'}
                          </p>
                          {!searchQuery && (
                            <p className="text-xs text-gray-400">
                              Check if students table has data
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Test Selection */}
          {currentOldStudent && !result && (
            <div className="border-2 border-purple-200 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserGraduate} />
                  Step 2: Select Tests to Migrate from {currentOldStudent.name}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllTests}
                    className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearTestSelection}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Migration Status Legend */}
              {currentOldStudent.is_migrated && selectedNewStudent && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Color Legend:</div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                      <span className="text-gray-600">Fully migrated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
                      <span className="text-gray-600">Partially migrated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                      <span className="text-gray-600">Not migrated</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="p-3 text-left">
                        <input type="checkbox" className="w-4 h-4" readOnly />
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700">Test Type</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Section</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Exercise Type</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Test #</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Maps To (New)</th>
                      <th className="p-3 text-right font-semibold text-gray-700">Questions</th>
                      <th className="p-3 text-right font-semibold text-gray-700">Migrated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOldStudent.tests.map(test => {
                      const mapped = mapOldMetadataToNew(test);
                      const mapsToText = mapped.test_type === test.test_type &&
                                        mapped.section === test.section &&
                                        mapped.exercise_type === test.exercise_type
                        ? '(no change)'
                        : `${mapped.test_type} - ${mapped.section} - ${mapped.exercise_type}`;

                      const isFullyMigrated = (test.migrated_count || 0) >= test.question_count;
                      const isPartiallyMigrated = (test.migrated_count || 0) > 0 && !isFullyMigrated;

                      return (
                        <tr
                          key={test.test_id}
                          className={`border-b border-gray-100 hover:bg-purple-50 cursor-pointer ${
                            selectedTests.has(test.test_id) ? 'bg-purple-50' : ''
                          } ${isFullyMigrated ? 'bg-green-50' : ''} ${isPartiallyMigrated ? 'bg-yellow-50' : ''}`}
                          onClick={() => toggleTestSelection(test.test_id)}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedTests.has(test.test_id)}
                              onChange={() => toggleTestSelection(test.test_id)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="p-3 font-medium">{test.test_type}</td>
                          <td className="p-3">{test.section}</td>
                          <td className="p-3">{test.exercise_type}</td>
                          <td className="p-3">{test.test_number}</td>
                          <td className="p-3 text-xs text-gray-600 italic">{mapsToText}</td>
                          <td className="p-3 text-right font-semibold text-purple-700">
                            {test.question_count}
                          </td>
                          <td className="p-3 text-right">
                            {(test.migrated_count || 0) > 0 ? (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                isFullyMigrated ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                              }`}>
                                {test.migrated_count}/{test.question_count}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>{selectedTests.size}</strong> tests selected •{' '}
                    <strong>
                      {currentOldStudent.tests
                        .filter(t => selectedTests.has(t.test_id))
                        .reduce((sum, t) => sum + t.question_count, 0)}
                    </strong>{' '}
                    questions will be migrated
                    {currentOldStudent.is_migrated && selectedNewStudent && (
                      <>
                        {' '}• <span className="text-green-700 font-semibold">
                          {currentOldStudent.migrated_count} already migrated
                        </span> to this student
                      </>
                    )}
                  </p>
                </div>
                {currentOldStudent.is_migrated && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600" />
                      <strong>Migration Status:</strong> Rows with green background are fully migrated,
                      yellow are partially migrated. Re-running migration will skip duplicates.
                    </p>
                  </div>
                )}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Test metadata will be automatically mapped to the new format.
                    Tests that don't have a matching equivalent in the new system will fail to migrate
                    and will be listed in the error report.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* New Student Selection - Step 3 */}
          {currentOldStudent && selectedTests.size > 0 && !result && (
            <div className="border-2 border-green-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faArrowRight} />
                Step 3: Select Target Student (New System)
                {selectedNewStudent && (
                  <span className="ml-auto text-sm font-normal text-green-600">✓ Auto-matched</span>
                )}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {selectedNewStudent ? (
                  <>Matched to: <strong>{currentNewStudent?.name}</strong> ({currentNewStudent?.email})</>
                ) : (
                  <>Select which student in the new system corresponds to <strong>{currentOldStudent.name}</strong></>
                )}
              </p>

              {/* Search Input for new students */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={newStudentSearch}
                  onChange={(e) => setNewStudentSearch(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredNewStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedNewStudent(student.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedNewStudent === student.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-brand-dark">{student.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{student.email}</div>
                  </button>
                ))}
              </div>
              {filteredNewStudents.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  {newStudentSearch ? 'No students match your search' : 'No new students found'}
                </p>
              )}
            </div>
          )}

          {/* Migration Button */}
          {!migrating && !result && currentOldStudent && currentNewStudent && selectedTests.size > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Migration Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-600">From:</div>
                  <div className="font-semibold text-blue-700">{currentOldStudent.name}</div>
                </div>
                <div>
                  <div className="text-gray-600">To:</div>
                  <div className="font-semibold text-green-700">{currentNewStudent.name}</div>
                </div>
                <div>
                  <div className="text-gray-600">Tests:</div>
                  <div className="font-semibold text-purple-700">{selectedTests.size} selected</div>
                </div>
              </div>
              <button
                onClick={migrateAnswers}
                className="w-full px-6 py-4 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
              >
                Start Migration
              </button>
            </div>
          )}

          {/* Migration Progress */}
          {migrating && (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faSpinner} className="text-6xl text-brand-green mb-4 animate-spin" />
              <p className="text-xl font-semibold text-brand-dark mb-2">Migrating Answers...</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-brand-green h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{progress}%</p>
            </div>
          )}

          {/* Migration Results */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700">{result.total}</div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-700 flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {result.success}
                  </div>
                  <div className="text-sm text-green-600">Success</div>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-red-700 flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {result.failed}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <h3 className="font-bold text-red-800 mb-2">Errors:</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {result.errors.map((error, idx) => (
                      <li key={idx} className="font-mono text-xs">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null);
                  setProgress(0);
                  setSelectedOldStudent(null);
                  setSelectedNewStudent(null);
                  setSelectedTests(new Set());
                }}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Start New Migration
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
