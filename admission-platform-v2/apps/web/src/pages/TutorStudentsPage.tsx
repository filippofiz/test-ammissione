/**
 * Tutor Home Page
 * Shows list of students with their test assignments
 * Allows tutors to view student progress and assign/unlock tests
 * Styled to match LoginPage and RoleSelectionPage design language
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGraduate,
  faClipboardList,
  faChartLine,
  faLock,
  faLockOpen,
  faSpinner,
  faCheckCircle,
  faUsers,
  faPlus,
  faEdit,
  faCalendar,
  faUser,
  faChevronDown,
  faChevronRight,
  faSearch,
  faIdCard,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { CountdownTimer } from '../components/CountdownTimer';
import {
  fetchMyStudents,
  fetchAllStudents,
  type StudentWithAssignments,
} from '../lib/api/tutors';
import { supabase } from '../lib/supabase';
import { fetchExternalStudents, updateExternalStudentEmail, type ExternalStudent } from '../lib/api/externalStudents';

export default function TutorStudentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAssignments | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [selectedTestTypes, setSelectedTestTypes] = useState<string[]>([]);
  const [assigningTests, setAssigningTests] = useState(false);
  const [testTypeCounts, setTestTypeCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentTests, setNewStudentTests] = useState<string[]>([]);
  const [newStudentTutorId, setNewStudentTutorId] = useState<string>(''); // Selected tutor for new student
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [createStudentError, setCreateStudentError] = useState<string | null>(null);
  const [externalStudents, setExternalStudents] = useState<ExternalStudent[]>([]);
  const [externalSearchQuery, setExternalSearchQuery] = useState('');
  const [loadingExternalStudents, setLoadingExternalStudents] = useState(false);
  const [newStudentExternalId, setNewStudentExternalId] = useState<number | undefined>();
  const [showExternalDropdown, setShowExternalDropdown] = useState(false);

  // Available test types (fetched from database)
  const [availableTestTypes, setAvailableTestTypes] = useState<string[]>([]);
  const [tutors, setTutors] = useState<Array<{ id: string; name: string; email: string }>>([]);

  useEffect(() => {
    loadStudents();
  }, [viewAll]);

  // Load available test types and tutors when modal opens
  useEffect(() => {
    if (showAddStudentModal) {
      loadTestTypesAndTutors();
    }
  }, [showAddStudentModal]);

  // Auto-search external students as user types
  useEffect(() => {
    // Don't search if we already have a selected student
    if (newStudentExternalId) {
      setShowExternalDropdown(false);
      return;
    }

    console.log('🔍 External search query changed:', externalSearchQuery);
    if (externalSearchQuery.length >= 2) {
      console.log('✅ Query length >= 2, setting up search timeout');
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout fired, calling loadExternalStudents');
        loadExternalStudents();
        setShowExternalDropdown(true);
      }, 500); // Debounce 500ms
      return () => clearTimeout(timeoutId);
    } else {
      console.log('❌ Query too short, clearing results');
      setExternalStudents([]);
      setShowExternalDropdown(false);
    }
  }, [externalSearchQuery, newStudentExternalId]);

  // Load available test types when assign modal opens
  useEffect(() => {
    if (showAssignTestModal) {
      loadTestTypes();
    }
  }, [showAssignTestModal]);

  // Load test counts when test modal opens
  useEffect(() => {
    if (showTestModal && selectedStudent) {
      loadTestTypeCounts();
    }
  }, [showTestModal, selectedStudent]);

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
    }
  }

  async function loadTestTypes() {
    try {
      // Fetch unique test types from 2V_tests table
      const { data: tests, error: testsError } = await supabase
        .from('2V_tests')
        .select('test_type')
        .eq('is_active', true);

      if (testsError) throw testsError;

      // Get unique test types
      const uniqueTestTypes = [...new Set(tests?.map(t => t.test_type) || [])];
      setAvailableTestTypes(uniqueTestTypes);
    } catch (err) {
      console.error('Error loading test types:', err);
    }
  }

  async function loadTestTypeCounts() {
    if (!selectedStudent) return;

    setLoadingCounts(true);
    try {
      // Fetch all test assignments for this student where the test still exists and is active
      const { data: assignments, error } = await supabase
        .from('2V_test_assignments')
        .select(`
          id,
          2V_tests!inner (
            test_type,
            is_active
          )
        `)
        .eq('student_id', selectedStudent.id)
        .eq('2V_tests.is_active', true);

      if (error) throw error;

      // Count tests per type (only those where test exists and is active)
      const counts: Record<string, number> = {};
      (assignments || []).forEach((assignment: any) => {
        const testType = assignment['2V_tests']?.test_type;
        if (testType) {
          counts[testType] = (counts[testType] || 0) + 1;
        }
      });

      setTestTypeCounts(counts);
    } catch (err) {
      console.error('Error loading test type counts:', err);
    } finally {
      setLoadingCounts(false);
    }
  }

  async function handleAssignTestTypes() {
    if (!selectedStudent || selectedTestTypes.length === 0) return;

    setAssigningTests(true);
    try {
      // Get current user (tutor) ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: tutorProfile } = await supabase
        .from('2V_profiles')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      if (!tutorProfile) throw new Error('Tutor profile not found');

      // Get current student's test types
      const { data: currentProfile } = await supabase
        .from('2V_profiles')
        .select('tests')
        .eq('id', selectedStudent.id)
        .single();

      const currentTests = currentProfile?.tests || [];

      // Merge with new test types (avoiding duplicates)
      const updatedTests = [...new Set([...currentTests, ...selectedTestTypes])];

      // Update student's test types
      const { error: profileError } = await supabase
        .from('2V_profiles')
        .update({ tests: updatedTests })
        .eq('id', selectedStudent.id);

      if (profileError) throw profileError;

      // For each new test type, get all tests and create locked assignments
      for (const testType of selectedTestTypes) {
        // Get all tests of this type
        const { data: tests, error: testsError } = await supabase
          .from('2V_tests')
          .select('id')
          .eq('test_type', testType)
          .eq('is_active', true);

        if (testsError) {
          console.error(`Error fetching tests for ${testType}:`, testsError);
          continue;
        }

        if (!tests || tests.length === 0) continue;

        // Create locked assignments for all tests of this type
        const assignments = tests.map(test => ({
          student_id: selectedStudent.id,
          test_id: test.id,
          status: 'locked',
          assigned_by: tutorProfile.id,
          assigned_at: new Date().toISOString(),
        }));

        // Use upsert with ignoreDuplicates so re-assigning a test type the
        // student already partially has doesn't fail on the UNIQUE
        // (student_id, test_id) constraint.
        const { error: assignError } = await supabase
          .from('2V_test_assignments')
          .upsert(assignments, {
            onConflict: 'student_id,test_id',
            ignoreDuplicates: true,
          });

        if (assignError) {
          console.error(`Error creating assignments for ${testType}:`, assignError);
        }
      }

      // Reload students to show updated test types and assignments
      await loadStudents();

      // Close modal and reset
      setShowAssignTestModal(false);
      setSelectedTestTypes([]);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Error assigning test types:', err);
      alert('Failed to assign test types. Please try again.');
    } finally {
      setAssigningTests(false);
    }
  }

  async function loadTestTypesAndTutors() {
    try {
      // Fetch unique test types from 2V_tests table
      const { data: tests, error: testsError } = await supabase
        .from('2V_tests')
        .select('test_type')
        .eq('is_active', true);

      if (testsError) throw testsError;

      // Get unique test types
      const uniqueTestTypes = [...new Set(tests?.map(t => t.test_type) || [])];
      setAvailableTestTypes(uniqueTestTypes);

      // Fetch all tutors and admins from profiles
      const { data: allProfiles, error: tutorsError } = await supabase
        .from('2V_profiles')
        .select('id, name, email, roles');

      if (tutorsError) throw tutorsError;

      // Filter profiles that have TUTOR or ADMIN role
      const tutorsData = (allProfiles || []).filter(profile => {
        if (!profile.roles) return false;
        const roles = Array.isArray(profile.roles) ? profile.roles : [];
        return roles.includes('TUTOR') || roles.includes('ADMIN');
      });

      setTutors(tutorsData);
      console.log('Loaded tutors:', tutorsData);

      // Set current user as default tutor
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: currentProfile } = await supabase
          .from('2V_profiles')
          .select('id')
          .eq('auth_uid', user.id)
          .single();

        if (currentProfile) {
          setNewStudentTutorId(currentProfile.id);
        }
      }
    } catch (err) {
      console.error('Error loading test types and tutors:', err);
    }
  }

  async function loadExternalStudents() {
    console.log('📡 loadExternalStudents called with query:', externalSearchQuery);
    setLoadingExternalStudents(true);
    try {
      console.log('🌐 Calling fetchExternalStudents API...');
      const students = await fetchExternalStudents(externalSearchQuery);
      console.log('✅ Received students from API:', students);
      console.log('📊 Number of students:', students.length);
      setExternalStudents(students);
      console.log('💾 State updated with external students');
    } catch (error) {
      console.error('❌ Error loading external students:', error);
      // Don't show error to user - external students are optional
    } finally {
      setLoadingExternalStudents(false);
      console.log('🏁 Loading finished');
    }
  }

  function closeAddStudentModal() {
    setShowAddStudentModal(false);
    setNewStudentEmail('');
    setNewStudentName('');
    setNewStudentPassword('');
    setNewStudentTests([]);
    setNewStudentTutorId('');
    setNewStudentExternalId(undefined);
    setExternalSearchQuery('');
    setExternalStudents([]);
    setShowExternalDropdown(false);
    setCreateStudentError(null);
  }

  async function createStudent() {
    if (!newStudentExternalId) {
      setCreateStudentError('Please search and select a student from the external system');
      return;
    }

    if (!newStudentEmail || !newStudentName || !newStudentTutorId) {
      setCreateStudentError('Please fill in all fields');
      return;
    }

    setCreatingStudent(true);
    setCreateStudentError(null);

    try {
      // Use selected tutor ID
      const tutorId = newStudentTutorId;

      // Create a throwaway Supabase client for signUp so we don't swap the tutor's session
      const { createClient } = await import('@supabase/supabase-js');
      const signUpClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      // Create auth user with default password 123456
      const { data: authData, error: authError } = await signUpClient.auth.signUp({
        email: newStudentEmail,
        password: '123456',
        options: {
          data: {
            name: newStudentName,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error(`This email (${newStudentEmail}) is already registered. Please use a different email or contact the admin.`);
        }
        throw authError;
      }
      if (!authData.user) throw new Error('Failed to create user');

      // Create profile
      const { error: profileError } = await supabase
        .from('2V_profiles')
        .insert({
          auth_uid: authData.user.id,
          email: newStudentEmail,
          name: newStudentName,
          roles: ['STUDENT'],
          tutor_id: tutorId,
          tests: newStudentTests,
          esigenze_speciali: false,
          must_change_password: true,
          platform_version: 'v2',
          external_student_id: newStudentExternalId || null,
        });

      if (profileError) throw profileError;

      // If email was manually entered (external student didn't have email), update external DB
      const selectedExternalStudent = externalStudents.find(s => s.id === newStudentExternalId);
      if (selectedExternalStudent && !selectedExternalStudent.studentMail && newStudentEmail) {
        console.log('📧 Updating external student email...');
        try {
          await updateExternalStudentEmail(newStudentExternalId, newStudentEmail);
          console.log('✅ External student email updated successfully');
        } catch (emailError) {
          console.error('⚠️ Failed to update external student email:', emailError);
          // Don't fail the whole operation, just warn
          alert('⚠️ Student created but failed to update email in external database');
        }
      }

      // Success - close modal and reload students
      closeAddStudentModal();
      await loadStudents();
    } catch (err) {
      console.error('Error creating student:', err);
      setCreateStudentError(err instanceof Error ? err.message : 'Failed to create student');
    } finally {
      setCreatingStudent(false);
    }
  }

  function getStatusStyles(status: string) {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: faCheckCircle,
        };
      case 'unlocked':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: faLockOpen,
        };
      case 'locked':
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: faLock,
        };
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Student Management">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-green/10 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

            <div className="relative z-10 p-6 md:p-8">
              {/* Header with Search and Toggle */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-brand-green" />
                    <h2 className="text-2xl font-bold text-brand-dark">Students</h2>
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                      title="Add new student"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span className="hidden sm:inline">Add Student</span>
                    </button>
                  </div>

                  {/* View All Toggle */}
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">View All Students</span>
                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={viewAll}
                        onChange={(e) => setViewAll(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="absolute inset-0 bg-gray-300 rounded-full transition-colors peer-checked:bg-brand-green peer-checked:shadow-lg"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md"></div>
                    </label>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students by name or email..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 animate-fadeInUp">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Empty State */}
              {students.length === 0 && !loading && (
                <div className="text-center py-16 animate-fadeInUp">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    {viewAll
                      ? 'No students in the system'
                      : 'No students assigned to you'}
                  </p>
                </div>
              )}

              {/* No Search Results State */}
              {students.length > 0 &&
               students.filter(student => {
                 if (!searchQuery) return true;
                 const query = searchQuery.toLowerCase();
                 const name = (student.name || '').toLowerCase();
                 const email = (student.email || '').toLowerCase();
                 return name.includes(query) || email.includes(query);
               }).length === 0 && (
                <div className="text-center py-16 animate-fadeInUp">
                  <FontAwesomeIcon icon={faSearch} className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No students found matching "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Students List */}
              <div className="space-y-4">
                {students
                  .filter(student => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    const name = (student.name || '').toLowerCase();
                    const email = (student.email || '').toLowerCase();
                    return name.includes(query) || email.includes(query);
                  })
                  .map((student, index) => {
                  // Use profile.tests as the source of truth for what tests are assigned
                  const testTypes = student.tests || [];

                  return (
                  <div
                    key={student.id}
                    className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-xl p-5 hover:shadow-xl hover:border-brand-green transition-all duration-300 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                          <FontAwesomeIcon icon={faUserGraduate} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-brand-dark">
                            {student.name || student.email}
                          </h3>
                          {student.name && (
                            <p className="text-sm text-gray-500 truncate">{student.email}</p>
                          )}

                          {/* Countdown Timer */}
                          {student.real_test_date && (
                            <div className="mt-2">
                              <CountdownTimer
                                targetDate={student.real_test_date}
                                variant="compact"
                                showDate={false}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Test Types & Actions */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Profile Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tutor/student/${student.id}/profile`);
                            }}
                            className="px-3 py-2 bg-white border-2 border-brand-green text-brand-green rounded-lg hover:bg-brand-green hover:text-white transition-all text-sm font-semibold flex items-center gap-2"
                            title="Manage student profile"
                          >
                            <FontAwesomeIcon icon={faIdCard} />
                            <span className="hidden md:inline">Profile</span>
                          </button>

                          {/* Tests Button */}
                          <button
                            onClick={() => {
                              // Get test types from profile
                              const testTypes = student.tests || [];

                              if (testTypes.length === 1) {
                                navigate(`/tutor/student/${student.id}/tests/${testTypes[0]}`);
                              } else {
                                // Show modal to choose test type
                                setSelectedStudent(student);
                                setShowTestModal(true);
                              }
                            }}
                            className="px-3 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-all text-sm font-semibold flex items-center gap-2"
                            title="View student tests"
                          >
                            <FontAwesomeIcon icon={faChartLine} />
                            <span className="hidden md:inline">Tests</span>
                          </button>

                          {/* Assign Tests Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(student);
                              setShowAssignTestModal(true);
                            }}
                            className="px-3 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-all text-sm font-semibold flex items-center gap-2"
                            title="Assign new tests"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            <span className="hidden md:inline">Assign Tests</span>
                          </button>
                        </div>

                        {/* Test Type Badges & Count */}
                        <div className="flex items-center gap-2">
                          {(() => {
                            // Get test types from profile
                            const testTypes = student.tests || [];

                            return (
                              <>
                                {/* Show test type badges */}
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                  {testTypes.map(type => (
                                    <span
                                      key={type}
                                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                  {testTypes.length === 0 && (
                                    <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-full text-xs font-medium border border-gray-200">
                                      No tests
                                    </span>
                                  )}
                                </div>

                                {/* Total count badge */}
                                {testTypes.length > 0 && (
                                  <div className="text-center px-3 py-1 bg-gradient-to-br from-brand-green to-green-600 rounded-lg border-2 border-green-700 min-w-[50px]">
                                    <div className="text-lg font-bold text-white">
                                      {testTypes.length}
                                    </div>
                                    <div className="text-xs text-white/90 font-semibold">
                                      {testTypes.length === 1 ? 'Type' : 'Types'}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}

                          {/* Tutor Badge (for "View All" mode) */}
                          {viewAll && student.tutor_name && (
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                student.tutor_name === 'You'
                                  ? 'bg-brand-green text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Tutor: {student.tutor_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeAddStudentModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-green to-green-600 p-6 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserGraduate} className="text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold">Add New Student</h2>
                </div>
                <button
                  onClick={closeAddStudentModal}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <span className="text-2xl font-bold">×</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {createStudentError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">{createStudentError}</p>
                </div>
              )}

              {/* Student Name with Autocomplete Search */}
              <div className="relative">
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Student Name *
                </label>
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Type student name to search..."
                    value={newStudentName}
                    onChange={(e) => {
                      setNewStudentName(e.target.value);
                      setExternalSearchQuery(e.target.value);
                      // Clear selection when typing
                      if (newStudentExternalId) {
                        setNewStudentExternalId(undefined);
                        setNewStudentEmail('');
                      }
                    }}
                    onFocus={() => !newStudentExternalId && externalStudents.length > 0 && setShowExternalDropdown(true)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none"
                  />
                  {loadingExternalStudents && (
                    <FontAwesomeIcon icon={faSpinner} spin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {(() => {
                  console.log('🎨 Rendering dropdown check:', {
                    showExternalDropdown,
                    studentsCount: externalStudents.length,
                    willShow: showExternalDropdown && externalStudents.length > 0
                  });
                  return null;
                })()}
                {showExternalDropdown && externalStudents.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                    {externalStudents.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setNewStudentExternalId(student.id);
                          setNewStudentName(student.studentName || '');
                          setNewStudentEmail(student.studentMail || '');
                          setExternalSearchQuery(student.studentName);
                          setShowExternalDropdown(false);
                          setCreateStudentError(null);
                        }}
                        className="w-full px-4 py-4 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="font-bold text-brand-dark text-base mb-1">{student.studentName}</div>
                        {student.studentMail && (
                          <div className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Email:</span> {student.studentMail}
                          </div>
                        )}
                        {student.parentName && (
                          <div className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Parent:</span> {student.parentName}
                          </div>
                        )}
                        {student.parentMail && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Parent Email:</span> {student.parentMail}
                          </div>
                        )}
                        {student.school && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">School:</span> {student.school}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {newStudentExternalId && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Selected: {newStudentName} (ID: {newStudentExternalId})
                  </p>
                )}

                {newStudentName.length > 0 && newStudentName.length < 2 && !newStudentExternalId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Type at least 2 characters to search
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none transition-colors ${
                    newStudentExternalId && externalStudents.find(s => s.id === newStudentExternalId)?.studentMail
                      ? 'bg-gray-50'
                      : ''
                  }`}
                  placeholder={newStudentExternalId && !externalStudents.find(s => s.id === newStudentExternalId)?.studentMail
                    ? "Email not found - enter manually"
                    : "student@example.com"
                  }
                  readOnly={!!(newStudentExternalId && externalStudents.find(s => s.id === newStudentExternalId)?.studentMail)}
                />
                {newStudentExternalId && !externalStudents.find(s => s.id === newStudentExternalId)?.studentMail && newStudentEmail && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ This email will be saved to the external student database
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Password *
                </label>
                <input
                  type="text"
                  value="123456"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none transition-colors bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default password: 123456 - Student will be required to change it on first login
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Assigned Tutor *
                </label>
                <select
                  value={newStudentTutorId}
                  onChange={(e) => setNewStudentTutorId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none transition-colors"
                >
                  <option value="">Select a tutor</option>
                  {tutors.map(tutor => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.name || tutor.email} ({tutor.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the tutor who will manage this student
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Test Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTestTypes.map(testType => (
                    <label
                      key={testType}
                      className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                        newStudentTests.includes(testType)
                          ? 'border-brand-green bg-green-50 text-brand-green'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newStudentTests.includes(testType)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewStudentTests([...newStudentTests, testType]);
                          } else {
                            setNewStudentTests(newStudentTests.filter(t => t !== testType));
                          }
                        }}
                        className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                      />
                      <span className="font-medium text-sm">{testType}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select test types this student will have access to
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={closeAddStudentModal}
                  disabled={creatingStudent}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createStudent}
                  disabled={creatingStudent}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-green to-green-600 text-white hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingStudent ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlus} />
                      Create Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Selection Modal */}
      {showTestModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setShowTestModal(false);
            setTestTypeCounts({});
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-green to-green-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserGraduate} className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedStudent.name || selectedStudent.email}
                    </h2>
                    {selectedStudent.name && (
                      <p className="text-white/80 text-sm">{selectedStudent.email}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTestModal(false);
                    setTestTypeCounts({});
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <span className="text-2xl font-bold">×</span>
                </button>
              </div>
              <p className="text-white/90 text-sm">
                {selectedStudent.tests?.length || 0} test type{(selectedStudent.tests?.length || 0) === 1 ? '' : 's'} assigned
              </p>
            </div>

            {/* Modal Content - Tests grouped by type */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              {(() => {
                // Use test types from profile
                const testTypes = selectedStudent.tests || [];

                if (loadingCounts) {
                  return (
                    <div className="text-center py-12">
                      <FontAwesomeIcon icon={faSpinner} className="text-4xl text-gray-300 mb-4 animate-spin" />
                      <p className="text-gray-500">Loading test types...</p>
                    </div>
                  );
                }

                if (testTypes.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">No active tests assigned yet</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {testTypes.map((testType) => {
                      // Get test count from loaded counts (actual assignments that exist)
                      const testCount = testTypeCounts[testType] || 0;

                      return (
                        <button
                          key={testType}
                          onClick={() => {
                            navigate(`/tutor/student/${selectedStudent.id}/tests/${testType}`);
                            setShowTestModal(false);
                          }}
                          className="group bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-brand-green hover:shadow-md transition-all duration-200 text-center"
                        >
                          <FontAwesomeIcon
                            icon={faClipboardList}
                            className="text-2xl text-brand-green mb-2"
                          />
                          <h3 className="font-bold text-brand-dark text-sm mb-1">
                            {testType}
                          </h3>
                          <span className="text-xs text-gray-600">
                            {loadingCounts ? (
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : testCount > 0 ? (
                              `${testCount} ${testCount === 1 ? 'test' : 'tests'}`
                            ) : (
                              'View tests'
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Assign Test Modal */}
      {showAssignTestModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setShowAssignTestModal(false);
            setSelectedTestTypes([]);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-green to-green-600 p-6 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Assign Tests</h2>
                    <p className="text-white/90 text-sm mt-1">
                      {selectedStudent.name || selectedStudent.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAssignTestModal(false);
                    setSelectedTestTypes([]);
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <span className="text-2xl font-bold">×</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Select test types to give this student access to. They will be able to take tests of these types.
              </p>

              {availableTestTypes.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faSpinner} className="text-4xl text-gray-300 mb-4 animate-spin" />
                  <p className="text-gray-500">Loading test types...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTestTypes.map(testType => {
                    const isSelected = selectedTestTypes.includes(testType);
                    // Check if student already has this test type in their profile
                    const currentStudentTests = selectedStudent.tests || [];
                    const isAlreadyAssigned = currentStudentTests.includes(testType);

                    return (
                      <label
                        key={testType}
                        className={`flex items-center gap-3 px-4 py-4 border-2 rounded-xl cursor-pointer transition-all ${
                          isAlreadyAssigned
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-brand-green bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isAlreadyAssigned}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTestTypes([...selectedTestTypes, testType]);
                            } else {
                              setSelectedTestTypes(selectedTestTypes.filter(t => t !== testType));
                            }
                          }}
                          className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-sm">{testType}</span>
                          {isAlreadyAssigned && (
                            <span className="block text-xs text-gray-500 mt-1">Already assigned</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedTestTypes.length} {selectedTestTypes.length === 1 ? 'type' : 'types'} selected
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAssignTestModal(false);
                      setSelectedTestTypes([]);
                    }}
                    disabled={assigningTests}
                    className="px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignTestTypes}
                    disabled={assigningTests || selectedTestTypes.length === 0}
                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-green to-green-600 text-white hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {assigningTests ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} />
                        Assign {selectedTestTypes.length} {selectedTestTypes.length === 1 ? 'Type' : 'Types'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
