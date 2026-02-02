/**
 * GMAT Configuration Page
 * Dedicated tutor page for managing GMAT preparation system
 * - Replaces generic TestTrackConfigPage for GMAT
 * - Shows GMAT-specific controls instead of generic track config
 * - Manages pending cycle validations
 * - Links to Question Allocation
 * - Shows legacy Initial Assessment in read-only mode
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCog,
  faCheckCircle,
  faExclamationTriangle,
  faUsers,
  faClipboardCheck,
  faChartLine,
  faRocket,
  faCheck,
  faSpinner,
  faLayerGroup,
  faBook,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import {
  getPendingValidations,
  validatePlacementResult,
  type GmatAssessmentResult,
  type GmatCycle,
  GMAT_CYCLES,
} from '../lib/api/gmat';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
}

interface PendingValidationWithStudent extends GmatAssessmentResult {
  student?: StudentProfile;
}

interface LegacyConfig {
  id: string;
  track_type: string;
  section_order_mode: string | null;
  time_per_section: Record<string, number> | null;
  total_time_minutes: number | null;
  navigation_mode: string | null;
}

export default function GMATConfigPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingValidations, setPendingValidations] = useState<PendingValidationWithStudent[]>([]);
  const [legacyConfigs, setLegacyConfigs] = useState<LegacyConfig[]>([]);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [studentCounts, setStudentCounts] = useState<{
    total: number;
    byCycle: Record<GmatCycle, number>;
  }>({ total: 0, byCycle: { Foundation: 0, Development: 0, Excellence: 0 } });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [validationsResult, configsResult, progressResult] = await Promise.all([
        // Get pending validations
        getPendingValidations().catch(() => []),
        // Get legacy track configs for GMAT
        supabase
          .from('2V_test_track_config')
          .select('id, track_type, section_order_mode, time_per_section, total_time_minutes, navigation_mode')
          .eq('test_type', 'GMAT'),
        // Get student progress counts
        supabase
          .from('2V_gmat_student_progress')
          .select('id, gmat_cycle'),
      ]);

      // Process pending validations - get student info
      if (validationsResult.length > 0) {
        const studentIds = [...new Set(validationsResult.map(v => v.student_id))];
        const { data: students } = await supabase
          .from('2V_profiles')
          .select('id, name, email')
          .in('id', studentIds);

        const studentsMap = new Map(students?.map(s => [s.id, s]) || []);
        const validationsWithStudents = validationsResult.map(v => ({
          ...v,
          student: studentsMap.get(v.student_id),
        }));
        setPendingValidations(validationsWithStudents);
      } else {
        setPendingValidations([]);
      }

      // Process legacy configs
      if (configsResult.data) {
        setLegacyConfigs(configsResult.data.map(c => ({
          ...c,
          time_per_section: c.time_per_section as Record<string, number> | null,
        })));
      }

      // Process student counts
      if (progressResult.data) {
        const counts = {
          total: progressResult.data.length,
          byCycle: {
            Foundation: progressResult.data.filter(p => p.gmat_cycle === 'Foundation').length,
            Development: progressResult.data.filter(p => p.gmat_cycle === 'Development').length,
            Excellence: progressResult.data.filter(p => p.gmat_cycle === 'Excellence').length,
          },
        };
        setStudentCounts(counts);
      }
    } catch (err) {
      console.error('Error loading GMAT config data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function validateCycle(
    assessmentId: string,
    assignedCycle: GmatCycle,
    tutorNotes?: string
  ) {
    setValidatingId(assessmentId);

    try {
      // Get current user profile for validated_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('2V_profiles')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Use the API function to validate the placement result
      await validatePlacementResult(assessmentId, profile.id, assignedCycle, tutorNotes);

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error validating cycle:', err);
      setError('Failed to validate cycle');
    } finally {
      setValidatingId(null);
    }
  }

  function getCycleColor(cycle: GmatCycle) {
    const colors: Record<GmatCycle, { bg: string; text: string; border: string }> = {
      Foundation: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
      Development: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
      Excellence: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    };
    return colors[cycle];
  }

  if (loading) {
    return (
      <Layout pageTitle="GMAT Configuration" pageSubtitle="Manage GMAT preparation system">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-brand-green animate-spin mb-4" />
            <p className="text-gray-600">Loading GMAT configuration...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="GMAT Configuration" pageSubtitle="Manage GMAT preparation system">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/tutor')}
              className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/tutor/gmat-question-allocation')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faLayerGroup} />
              Question Allocation
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Student Overview */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="text-brand-green" />
              GMAT Students Overview
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-gray-800">{studentCounts.total}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              {GMAT_CYCLES.map(cycle => {
                const colors = getCycleColor(cycle);
                return (
                  <div key={cycle} className={`text-center p-4 ${colors.bg} rounded-xl`}>
                    <div className={`text-3xl font-bold ${colors.text}`}>
                      {studentCounts.byCycle[cycle]}
                    </div>
                    <div className="text-sm text-gray-600">{cycle}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Validations */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faClipboardCheck} className="text-orange-500" />
              Pending Cycle Validations
              {pendingValidations.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  {pendingValidations.length}
                </span>
              )}
            </h2>

            {pendingValidations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-400 mb-2" />
                <p>No pending validations</p>
                <p className="text-sm">All placement assessments have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingValidations.map(validation => (
                  <div
                    key={validation.id}
                    className="border-2 border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {validation.student?.name}
                        </h3>
                        <p className="text-sm text-gray-500">{validation.student?.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <span className="text-sm text-gray-500">Score: </span>
                            <span className="font-semibold">
                              {validation.score_raw}/{validation.score_total} ({validation.score_percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Suggested: </span>
                            {validation.suggested_cycle && (
                              <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${getCycleColor(validation.suggested_cycle).bg} ${getCycleColor(validation.suggested_cycle).text}`}>
                                {validation.suggested_cycle}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {validation.completed_at ? new Date(validation.completed_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Validation Actions */}
                      <div className="flex items-center gap-2">
                        {validatingId === validation.id ? (
                          <FontAwesomeIcon icon={faSpinner} className="text-gray-400 animate-spin" />
                        ) : (
                          <>
                            {GMAT_CYCLES.map(cycle => {
                              const colors = getCycleColor(cycle);
                              const isSuggested = cycle === validation.suggested_cycle;
                              return (
                                <button
                                  key={cycle}
                                  onClick={() => validateCycle(validation.id, cycle)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${colors.bg} ${colors.text} border ${colors.border} hover:opacity-80`}
                                  title={isSuggested ? 'Confirm suggested cycle' : `Override to ${cycle}`}
                                >
                                  {isSuggested && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                                  {cycle}
                                </button>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faRocket} className="text-purple-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/tutor/gmat-question-allocation')}
                className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
              >
                <FontAwesomeIcon icon={faLayerGroup} className="text-2xl text-blue-600 mb-2" />
                <p className="font-semibold text-gray-800">Question Allocation</p>
                <p className="text-xs text-gray-500">Manage question pools by cycle</p>
              </button>

              <button
                onClick={() => navigate('/tutor/gmat-materials')}
                className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center"
              >
                <FontAwesomeIcon icon={faBook} className="text-2xl text-green-600 mb-2" />
                <p className="font-semibold text-gray-800">Materials Management</p>
                <p className="text-xs text-gray-500">Unlock PDFs for students</p>
              </button>

              <button
                onClick={() => navigate('/tutor/students')}
                className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
              >
                <FontAwesomeIcon icon={faUsers} className="text-2xl text-purple-600 mb-2" />
                <p className="font-semibold text-gray-800">Student Profiles</p>
                <p className="text-xs text-gray-500">Manage student cycles</p>
              </button>

              <button
                onClick={() => navigate('/tutor/dashboard')}
                className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-center"
              >
                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-amber-600 mb-2" />
                <p className="font-semibold text-gray-800">Progress Dashboard</p>
                <p className="text-xs text-gray-500">View overall progress</p>
              </button>
            </div>
          </div>

          {/* Legacy Configuration (Read-only) */}
          {legacyConfigs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faCog} className="text-gray-500" />
                Legacy Test Configuration
                <span className="text-sm font-normal text-gray-500">(Read-only)</span>
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                These configurations are for the legacy Initial Assessment system.
                New GMAT assessments use the cycle-based allocation system.
              </p>

              <div className="space-y-3">
                {legacyConfigs.map(config => (
                  <div
                    key={config.id}
                    className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-700">{config.track_type}</h3>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="mr-4">Mode: {config.section_order_mode}</span>
                          <span className="mr-4">Navigation: {config.navigation_mode}</span>
                          {config.total_time_minutes && (
                            <span>Time: {config.total_time_minutes} min</span>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                        Legacy
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Important Note</p>
                    <p className="text-sm text-amber-700">
                      The legacy Initial Assessment (Assessment Iniziale) uses the generic test system.
                      Students who have already taken this assessment should continue using it.
                      All new GMAT assessments (Training, Topic Assessment, Section Assessment, Mock)
                      use the dedicated GMAT cycle-based system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
