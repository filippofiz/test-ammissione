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

export default function TutorStudentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAssignments | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      case 'in_progress':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: faSpinner,
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
    <Layout pageTitle="Student Management" pageSubtitle="Arched Preparation">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 animate-fadeInUp">

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button
                onClick={() => navigate('/assign-tests')}
                className="px-6 py-3 rounded-xl font-semibold text-base transition-all transform bg-gradient-to-r from-brand-green to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Assign New Tests
              </button>

              <button
                onClick={() => navigate('/modify-tests')}
                className="px-6 py-3 rounded-xl font-semibold text-base transition-all transform bg-gray-50 text-brand-dark hover:bg-gray-100 hover:shadow-md border border-gray-200"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Modify Tests
              </button>
            </div>
          </div>

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
                  // Get unique test types for this student
                  const testTypes = [...new Set(student.assignments.map(a => a.test_type || 'Other'))];

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
                              // If only one test type, navigate directly
                              const testTypes = [...new Set(student.assignments.map(a => a.test_type || 'Other'))];
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
                        </div>

                        {/* Test Type Badges & Count */}
                        <div className="flex items-center gap-2">
                          {(() => {
                            // Get unique test types
                            const testTypes = [...new Set(student.assignments.map(a => a.test_type || 'Other'))];

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

      {/* Test Selection Modal */}
      {showTestModal && selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowTestModal(false)}
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
                  onClick={() => setShowTestModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <span className="text-2xl font-bold">×</span>
                </button>
              </div>
              <p className="text-white/90 text-sm">
                {selectedStudent.assignments.length} {selectedStudent.assignments.length === 1 ? 'test' : 'tests'} assigned
              </p>
            </div>

            {/* Modal Content - Tests grouped by type */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              {selectedStudent.assignments.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No tests assigned yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(() => {
                    // Get unique test types
                    const testTypes = [...new Set(selectedStudent.assignments.map(a => a.test_type || 'Other'))];

                    return testTypes.map((testType) => {
                      const testsOfType = selectedStudent.assignments.filter(a => (a.test_type || 'Other') === testType);

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
                            {testsOfType.length} {testsOfType.length === 1 ? 'test' : 'tests'}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
