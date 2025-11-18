/**
 * Student Tests Page
 * Shows all tests of a specific type for a student
 * Allows tutor to:
 * - View test status (locked, unlocked, in_progress, completed)
 * - Unlock tests
 * - View results
 * - Assign new tests
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  faPercent,
  faEye,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

// BIG DRAMATIC LOCK ANIMATION STYLES
const lockAnimationStyles = `
  @keyframes bigLockOpen {
    0% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    30% {
      transform: scale(3) rotate(-15deg);
      opacity: 0.8;
    }
    60% {
      transform: scale(4) rotate(10deg) translateY(-20px);
      opacity: 0.3;
    }
    100% {
      transform: scale(5) rotate(0deg) translateY(-30px);
      opacity: 0;
    }
  }

  @keyframes bigLockClose {
    0% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    30% {
      transform: scale(3) rotate(15deg);
      opacity: 0.8;
    }
    60% {
      transform: scale(4) rotate(-10deg);
      opacity: 0.5;
    }
    80% {
      transform: scale(3.5) rotate(5deg);
      opacity: 0.3;
    }
    100% {
      transform: scale(3) rotate(0deg);
      opacity: 0;
    }
  }

  @keyframes bigLockGlowGreen {
    0% {
      filter: drop-shadow(0 0 0px rgba(0, 166, 102, 0));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(0, 166, 102, 1)) drop-shadow(0 0 80px rgba(0, 166, 102, 0.8));
    }
    100% {
      filter: drop-shadow(0 0 0px rgba(0, 166, 102, 0));
    }
  }

  @keyframes bigLockGlowRed {
    0% {
      filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(220, 38, 38, 1)) drop-shadow(0 0 80px rgba(220, 38, 38, 0.8));
    }
    100% {
      filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0));
    }
  }

  @keyframes cardShake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes overlayFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .big-lock-opening {
    animation: bigLockOpen 1.2s ease-out forwards, bigLockGlowGreen 1.2s ease-out;
  }

  .big-lock-closing {
    animation: bigLockClose 1s ease-out forwards, bigLockGlowRed 1s ease-out;
  }

  .card-shake {
    animation: cardShake 0.5s ease-in-out;
  }

  .lock-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lock-overlay.fade-in {
    animation: overlayFadeIn 0.3s ease-out;
  }

  .lock-overlay.fade-out {
    animation: overlayFadeOut 0.3s ease-out forwards;
  }

  .giant-lock-container {
    font-size: 120px;
    color: #00a666;
    position: relative;
  }

  .giant-lock-container.locking {
    color: #dc2626;
  }
`;

interface TestAssignment {
  id: string;
  test_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'incomplete' | 'annulled';
  assigned_at: string | null;
  start_time: string | null;
  completed_at: string | null;
  score: number | null;
  current_attempt: number;
  total_attempts: number;
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

export default function StudentTestsPage() {
  const { t } = useTranslation();
  const { studentId, testType } = useParams<{ studentId: string; testType: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [locking, setLocking] = useState<string | null>(null);
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  const [lockOverlayType, setLockOverlayType] = useState<'lock' | 'unlock'>('unlock');
  const [overlayFadingOut, setOverlayFadingOut] = useState(false);
  const [showConfirmLock, setShowConfirmLock] = useState(false);
  const [pendingLockId, setPendingLockId] = useState<string | null>(null);

  useEffect(() => {
    if (studentId && testType) {
      loadData();
    }
  }, [studentId, testType]);

  // Bot Control: Listen for bot commands to automate Lock/Unlock/Annul
  useEffect(() => {
    const handleBotMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, action, assignmentId } = event.data;

      if (type !== 'BOT_ACTION') return;

      console.log('🤖 Bot command received on StudentTests page:', action, { assignmentId });

      switch (action) {
        case 'LOCK_TEST':
          if (assignmentId) {
            console.log('🤖 Bot locking test:', assignmentId);
            // Find and click the lock button for this assignment
            const lockButton = document.querySelector(`button[data-assignment-id="${assignmentId}"][data-action="lock"]`);
            if (lockButton) {
              (lockButton as HTMLButtonElement).click();
            } else {
              // Fallback: use handleLock function if available
              handleLock(assignmentId);
            }
          }
          break;

        case 'UNLOCK_TEST':
          if (assignmentId) {
            console.log('🤖 Bot unlocking test:', assignmentId);
            // Find and click the unlock button
            const unlockButton = document.querySelector(`button[data-assignment-id="${assignmentId}"][data-action="unlock"]`);
            if (unlockButton) {
              (unlockButton as HTMLButtonElement).click();
            } else {
              handleUnlock(assignmentId);
            }
          }
          break;

        case 'ANNUL_TEST':
          if (assignmentId) {
            console.log('🤖 Bot annulling test:', assignmentId);
            handleAnnul(assignmentId);
          }
          break;
      }
    };

    window.addEventListener('message', handleBotMessage);

    // Send READY message when page loads
    if (window.opener) {
      console.log('📡 Student Tests page ready - sending READY signal...');
      window.opener.postMessage({
        type: 'PAGE_READY',
        page: 'StudentTests'
      }, window.location.origin);
    }

    return () => {
      window.removeEventListener('message', handleBotMessage);
    };
  }, [studentId, testType, assignments]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // Fetch student info
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

      // Fetch section order for this test type
      const { data: sectionOrderData, error: orderError } = await supabase
        .from('2V_section_order')
        .select('section_order')
        .eq('test_type', testType)
        .maybeSingle();

      if (orderError) {
        console.error('Error fetching section order:', orderError);
      }

      const sectionOrder = sectionOrderData?.section_order || [];

      // Fetch test assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('2V_test_assignments')
        .select(`
          id,
          test_id,
          status,
          assigned_at,
          start_time,
          completed_at,
          current_attempt,
          total_attempts,
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

      // Transform assignments
      const transformedAssignments = assignmentData.map((row: any) => {
        const section = row['2V_tests'].section;
        const exerciseType = row['2V_tests'].exercise_type;
        const testNumber = row['2V_tests'].test_number;

        // If section contains "multi", use exercise_type as section name
        const displaySection = section.toLowerCase().includes('multi')
          ? exerciseType
          : section;

        // Build test name: if multi-topic, just show "ExerciseType TestNumber"
        // otherwise show "Section - ExerciseType TestNumber"
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
          score: null, // TODO: Extract from completion_details JSONB or test_results table
          current_attempt: row.current_attempt || 1,
          total_attempts: row.total_attempts || 0,
          test_name: testName,
          test_type: row['2V_tests'].test_type,
          section: displaySection,
          exercise_type: exerciseType,
          test_number: testNumber,
          duration_minutes: row['2V_tests'].default_duration_mins,
        };
      });

      // Sort client-side using section order if available
      transformedAssignments.sort((a, b) => {
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

        // For everything else, use section ordering
        if (a.section !== b.section) {
          const aIndex = sectionOrder.indexOf(a.section);
          const bIndex = sectionOrder.indexOf(b.section);

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

      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(assignmentId: string) {
    setUnlocking(assignmentId);

    // Show BIG lock opening overlay
    setLockOverlayType('unlock');
    setShowLockOverlay(true);
    setOverlayFadingOut(false);

    try {
      // Wait for overlay to appear
      await new Promise(resolve => setTimeout(resolve, 300));

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

      // Wait for lock animation to complete
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Start fading out overlay
      setOverlayFadingOut(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Hide overlay
      setShowLockOverlay(false);

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error unlocking test:', err);
      setShowLockOverlay(false);
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

    // Show BIG lock closing overlay
    setLockOverlayType('lock');
    setShowLockOverlay(true);
    setOverlayFadingOut(false);

    try {
      // Wait for overlay to appear
      await new Promise(resolve => setTimeout(resolve, 300));

      const { error } = await supabase
        .from('2V_test_assignments')
        .update({
          status: 'locked',
        })
        .eq('id', assignmentId);

      if (error) throw error;

      // Wait for lock animation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start fading out overlay
      setOverlayFadingOut(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Hide overlay
      setShowLockOverlay(false);

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error locking test:', err);
      setShowLockOverlay(false);
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
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: faCheckCircle,
          iconColor: 'text-green-600',
          label: t('studentTests.statusLabels.completed'),
        };
      case 'in_progress':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: faSpinner,
          iconColor: 'text-blue-600',
          label: t('studentTests.statusLabels.inProgress'),
        };
      case 'unlocked':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: faLockOpen,
          iconColor: 'text-green-600', // Always green when unlocked
          label: t('studentTests.statusLabels.unlocked'),
        };
      case 'incomplete':
        return {
          bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
          border: 'border-orange-300',
          text: 'text-orange-700',
          icon: faLockOpen,
          iconColor: 'text-green-600', // Always green when unlocked
          label: t('studentTests.statusLabels.incomplete'),
        };
      case 'annulled':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: faLockOpen,
          iconColor: 'text-green-600', // Always green when unlocked
          label: t('studentTests.statusLabels.annulled'),
        };
      case 'locked':
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: faLock,
          iconColor: 'text-red-600', // Always red when locked
          label: t('studentTests.statusLabels.locked'),
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t('studentTests.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      pageTitle={student?.name || student?.email}
      pageSubtitle={testType}
    >
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: lockAnimationStyles }} />

      {/* Confirmation Modal for Locking */}
      {showConfirmLock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faLock} className="text-3xl text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-brand-dark mb-4">
              {t('studentTests.lockThisTest')}?
            </h2>
            <p className="text-center text-gray-600 mb-8">
              {t('studentTests.lockConfirmMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelLock}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                {t('studentTests.cancel')}
              </button>
              <button
                onClick={confirmLock}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg transition-all"
              >
                {t('studentTests.yesLockIt')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Giant Lock Overlay */}
      {showLockOverlay && (
        <div className={`lock-overlay ${overlayFadingOut ? 'fade-out' : 'fade-in'}`}>
          <div className={`giant-lock-container ${lockOverlayType === 'lock' ? 'locking' : ''}`}>
            <FontAwesomeIcon
              icon={lockOverlayType === 'lock' ? faLock : faLockOpen}
              className={lockOverlayType === 'lock' ? 'big-lock-closing' : 'big-lock-opening'}
            />
          </div>
        </div>
      )}

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor/students')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('studentTests.backToStudents')}</span>
          </button>

          {/* Page Header */}
          <div className="mb-8 animate-fadeInUp">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                  <FontAwesomeIcon icon={faUserGraduate} />
                </div>
                <div className="flex-1">
                  {student?.name && (
                    <p className="text-gray-600 mb-3">{student.email}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                      <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                      {testType}
                    </span>
                    <span className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                      {t('studentTests.testsAssigned', { count: assignments.length })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 animate-fadeInUp">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => alert('Assign new tests feature coming soon')}
              className="px-6 py-3 rounded-xl font-semibold text-base transition-all transform bg-gradient-to-r from-brand-green to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {t('studentTests.assignNewTest')}
            </button>
          </div>

          {/* Tests List */}
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-fadeInUp">
              <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {t('studentTests.noTestsType', { testType })}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignments.map((assignment, index) => {
                const statusStyle = getStatusStyles(assignment.status);
                const isUnlocking = unlocking === assignment.id;
                const isLocking = locking === assignment.id;

                return (
                  <div
                    key={assignment.id}
                    className={`bg-white rounded-xl border-2 ${statusStyle.border} p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp relative ${isUnlocking || isLocking ? 'card-shake' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left Section - Test Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <FontAwesomeIcon
                            icon={statusStyle.icon}
                            className={`text-2xl ${statusStyle.iconColor}`}
                          />
                          <div>
                            <h3 className="text-lg font-bold text-brand-dark">
                              {assignment.test_name}
                            </h3>
                            <span className={`text-sm font-semibold ${statusStyle.text}`}>
                              {statusStyle.label}
                            </span>
                          </div>
                        </div>

                        {/* Test Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                            <span>{t('studentTests.duration')}: {assignment.duration_minutes} {t('studentTests.min')}</span>
                          </div>
                          {assignment.assigned_at && (
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                              <span>{t('studentTests.assignedAt')}: {formatDate(assignment.assigned_at)}</span>
                            </div>
                          )}
                          {assignment.start_time && (
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                              <span>{t('studentTests.started')}: {formatDate(assignment.start_time)}</span>
                            </div>
                          )}
                          {assignment.completed_at && (
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                              <span>{t('studentTests.completedAt')}: {formatDate(assignment.completed_at)}</span>
                            </div>
                          )}
                          {assignment.score !== null && (
                            <div className="flex items-center gap-2 font-bold text-brand-green">
                              <FontAwesomeIcon icon={faPercent} />
                              <span>{t('studentTests.score')}: {assignment.score}%</span>
                            </div>
                          )}
                          {assignment.status !== 'locked' && (
                            <div className="flex items-center gap-2 font-semibold text-blue-600">
                              <span>
                                📝 {t('studentTests.attempt')} {assignment.current_attempt}
                                {assignment.total_attempts > 0 && ` ${t('studentTests.of')} ${assignment.total_attempts + 1}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-row md:flex-col gap-2 justify-end">
                        {assignment.status === 'locked' && (
                          <button
                            onClick={() => handleUnlock(assignment.id)}
                            disabled={isUnlocking}
                            className="px-4 py-2 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUnlocking ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                {t('studentTests.unlocking')}
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faLockOpen} className="mr-2" />
                                {t('studentTests.unlock')}
                              </>
                            )}
                          </button>
                        )}
                        {assignment.status !== 'locked' && (
                          <button
                            onClick={() => showLockConfirmation(assignment.id)}
                            disabled={isLocking}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLocking ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                {t('studentTests.locking')}
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faLock} className="mr-2" />
                                {t('studentTests.lock')}
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/tutor/test-results/${assignment.id}`)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100 transition-all"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-2" />
                          {t('studentTests.viewResults')}
                        </button>
                      </div>
                    </div>
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
