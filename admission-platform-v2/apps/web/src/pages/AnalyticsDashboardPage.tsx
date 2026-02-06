/**
 * Analytics Dashboard Page
 * Shows student progress analytics with countdown timers and visual indicators
 * - List of students with upcoming test dates
 * - Progress comparison vs remaining time
 * - Color-coded urgency levels
 * - Quick actions to manage profiles
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faUserGraduate,
  faClock,
  faExclamationTriangle,
  faCheckCircle,
  faIdCard,
  faSpinner,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { CountdownTimer } from '../components/CountdownTimer';
import { supabase } from '../lib/supabase';

interface StudentAnalytics {
  id: string;
  name: string;
  email: string;
  real_test_date: string | null;
  average_school_grade: number | null;
  test_stats: {
    total: number;
    completed: number;
    unlocked: number;
    locked: number;
  };
  progress_percentage: number;
  days_remaining: number | null;
  urgency_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export default function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'urgency' | 'progress' | 'name'>('urgency');

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);

    try {
      // Get current tutor
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: tutorProfile } = await supabase
        .from('2V_profiles')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      if (!tutorProfile) throw new Error('Tutor profile not found');

      // Get students assigned to this tutor
      const { data: students, error: studentsError } = await supabase
        .from('2V_profiles')
        .select('id, name, email, real_test_date, average_school_grade')
        .eq('tutor_id', tutorProfile.id)
        .contains('roles', '"STUDENT"');

      if (studentsError) throw studentsError;

      // Get test assignments for these students
      const studentIds = students?.map(s => s.id) || [];
      const { data: assignments, error: assignmentsError } = await supabase
        .from('2V_test_assignments')
        .select('student_id, status')
        .in('student_id', studentIds);

      if (assignmentsError) throw assignmentsError;

      // Calculate analytics for each student
      const analytics: StudentAnalytics[] = (students || []).map(student => {
        const studentAssignments = assignments?.filter(a => a.student_id === student.id) || [];

        const test_stats = {
          total: studentAssignments.length,
          completed: studentAssignments.filter(a => a.status === 'completed').length,
          unlocked: studentAssignments.filter(a => a.status === 'unlocked').length,
          locked: studentAssignments.filter(a => a.status === 'locked').length,
        };

        const progress_percentage = test_stats.total > 0
          ? Math.round((test_stats.completed / test_stats.total) * 100)
          : 0;

        const days_remaining = student.real_test_date
          ? Math.ceil((new Date(student.real_test_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null;

        let urgency_level: StudentAnalytics['urgency_level'] = 'none';
        if (days_remaining !== null) {
          if (days_remaining < 0) urgency_level = 'critical';
          else if (days_remaining <= 7) urgency_level = 'high';
          else if (days_remaining <= 14) urgency_level = 'medium';
          else if (days_remaining <= 30) urgency_level = 'low';
        }

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          real_test_date: student.real_test_date,
          average_school_grade: student.average_school_grade,
          test_stats,
          progress_percentage,
          days_remaining,
          urgency_level,
        };
      });

      setStudents(analytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  function getSortedStudents() {
    const sorted = [...students];

    switch (sortBy) {
      case 'urgency':
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
        return sorted.sort((a, b) => {
          if (a.urgency_level !== b.urgency_level) {
            return urgencyOrder[a.urgency_level] - urgencyOrder[b.urgency_level];
          }
          return (a.days_remaining || Infinity) - (b.days_remaining || Infinity);
        });

      case 'progress':
        return sorted.sort((a, b) => a.progress_percentage - b.progress_percentage);

      case 'name':
        return sorted.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));

      default:
        return sorted;
    }
  }

  function getUrgencyStyles(level: StudentAnalytics['urgency_level']) {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-700',
          badge: 'bg-red-500',
        };
      case 'high':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-500',
          text: 'text-orange-700',
          badge: 'bg-orange-500',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-700',
          badge: 'bg-yellow-500',
        };
      case 'low':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-700',
          badge: 'bg-green-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-400',
        };
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const sortedStudents = getSortedStudents();
  const studentsWithTestDates = students.filter(s => s.real_test_date !== null);
  const criticalStudents = students.filter(s => s.urgency_level === 'critical' || s.urgency_level === 'high');

  return (
    <Layout pageTitle="Analytics Dashboard" pageSubtitle="Student Progress & Test Dates">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-brand-green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-brand-dark mt-1">{students.length}</p>
                </div>
                <FontAwesomeIcon icon={faUserGraduate} className="text-brand-green text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">With Test Dates</p>
                  <p className="text-3xl font-bold text-brand-dark mt-1">{studentsWithTestDates.length}</p>
                </div>
                <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Need Attention</p>
                  <p className="text-3xl font-bold text-brand-dark mt-1">{criticalStudents.length}</p>
                </div>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg. Progress</p>
                  <p className="text-3xl font-bold text-brand-dark mt-1">
                    {students.length > 0
                      ? Math.round(students.reduce((sum, s) => sum + s.progress_percentage, 0) / students.length)
                      : 0}%
                  </p>
                </div>
                <FontAwesomeIcon icon={faChartLine} className="text-green-500 text-3xl" />
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('urgency')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sortBy === 'urgency'
                      ? 'bg-brand-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Urgency
                </button>
                <button
                  onClick={() => setSortBy('progress')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sortBy === 'progress'
                      ? 'bg-brand-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Progress
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sortBy === 'name'
                      ? 'bg-brand-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Name
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {students.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FontAwesomeIcon icon={faUserGraduate} className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No students assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedStudents.map((student, index) => {
                const styles = getUrgencyStyles(student.urgency_level);

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-xl shadow-lg border-l-4 ${styles.border} p-6 animate-fadeInUp`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Student Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                          <FontAwesomeIcon icon={faUserGraduate} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-brand-dark">{student.name || student.email}</h3>
                          {student.name && <p className="text-sm text-gray-500">{student.email}</p>}
                          {student.average_school_grade && (
                            <p className="text-sm text-gray-600 mt-1">
                              School Average: <span className="font-semibold">{student.average_school_grade}%</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Countdown Timer */}
                      {student.real_test_date && (
                        <div className="flex-shrink-0">
                          <CountdownTimer
                            targetDate={student.real_test_date}
                            variant="compact"
                            showDate={false}
                          />
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-brand-dark">{student.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-brand-green to-green-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${student.progress_percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                          <span>✅ {student.test_stats.completed} completed</span>
                          <span>📝 {student.test_stats.total} total</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/tutor/student/${student.id}/profile`)}
                          className="px-4 py-2 bg-white border-2 border-brand-green text-brand-green rounded-lg hover:bg-brand-green hover:text-white transition-all text-sm font-semibold"
                          title="View profile"
                        >
                          <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                          Profile
                        </button>
                      </div>
                    </div>

                    {/* Urgency Badge */}
                    {student.urgency_level !== 'none' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={student.urgency_level === 'critical' || student.urgency_level === 'high' ? faExclamationTriangle : faClock}
                            className={styles.text}
                          />
                          <span className={`text-sm font-semibold ${styles.text}`}>
                            {student.days_remaining !== null && student.days_remaining < 0
                              ? 'Test date has passed!'
                              : student.days_remaining !== null
                              ? `${student.days_remaining} days until test`
                              : 'No test date set'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
