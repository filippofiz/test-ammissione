/**
 * GMAT Preparation Page
 * Student view to browse and access unlocked GMAT materials
 * - Shows materials organized by section (QR, DI, VR)
 * - Displays lock/unlock status based on tutor assignments
 * - Allows viewing PDFs inline or downloading
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faLockOpen,
  faChevronDown,
  faChevronRight,
  faGraduationCap,
  faChartLine,
  faCheckCircle,
  faTimes,
  faRocket,
  faClipboardCheck,
  faHourglass,
  faExternalLinkAlt,
  faCalculator,
  faSquareRootAlt,
  faBrain,
  faChartBar,
  faPercent,
  faBalanceScale,
  faTable,
  faPuzzlePiece,
  faLayerGroup,
  faLightbulb,
  faBookOpen,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/auth';
import {
  getStudentGMATProgress,
  getLegacyInitialAssessment,
  getLatestPlacementResult,
  getLatestSectionAssessments,
  getSectionAssessmentLocks,
  getSimulationSlots,
  createSimulationSlot,
  deleteSimulationSlot,
  getTrainingTemplates,
  getTrainingCompletions,
  getGMATTrainingAssignments,
  lockGMATTrainingTest,
  unlockGMATTrainingTest,
  lockSectionAssessment,
  unlockSectionAssessment,
  showInitialAssessment,
  hideInitialAssessment,
  showInitialAssessmentResults,
  hideInitialAssessmentResults,
  SECTION_ASSESSMENT_CONFIG,
  MOCK_SIMULATION_CONFIG,
  getAnalyticsData,
  GMAT_CYCLES,
  type GmatCycle,
  type GmatProgress,
  type LegacyAssessmentResult,
  type GmatAssessmentResult,
  type GmatSection,
  type TrainingTemplate,
  type TrainingCompletion,
  type GMATTrainingAssignment,
  type GmatAnalyticsData,
  type GmatSimulationSlot,
} from '../lib/api/gmat';
import { useNavigate, useParams } from 'react-router-dom';
import { MATERIAL_TYPE_LABELS, GMAT_STRUCTURE } from '../lib/gmat/questionAllocation';
import { GMATCycleManager } from '../components/GMATCycleManager';
import { GMATSidebar, type GMATViewSection } from '../components/GMATSidebar';
import { GMATViewToggle } from '../components/GMATViewToggle';
import { GMATAnalyticsModal } from '../components/GMATAnalyticsModal';
import { GMATMaterialsContent } from '../components/GMATMaterialsContent';
import { computeGmatScoreFromSections } from '../lib/gmat/scoreComputation';

// Student info for tutor view
interface StudentInfo {
  id: string;
  name: string;
  email: string;
}

// Topic-specific icons for visual distinction
const TOPIC_ICONS: Record<string, typeof faCalculator> = {
  // Quantitative Reasoning
  'Number Properties & Arithmetic': faCalculator,
  'Algebra': faSquareRootAlt,
  'Word Problems': faBrain,
  'Statistics & Probability': faChartBar,
  'Percents, Ratios & Proportions': faPercent,
  // Data Insights
  'Data Sufficiency': faBalanceScale,
  'Graphics Interpretation': faChartBar,
  'Table Analysis': faTable,
  'Two-Part Analysis': faPuzzlePiece,
  'Multi-Source Reasoning': faLayerGroup,
  // Verbal Reasoning
  'Critical Reasoning': faLightbulb,
  'Reading Comprehension': faBookOpen,
};

// Lock animation styles for training tests
const lockAnimationStyles = `
  @keyframes gmatLockOpen {
    0% { transform: scale(1) rotate(0deg); opacity: 1; }
    30% { transform: scale(3) rotate(-15deg); opacity: 0.8; }
    60% { transform: scale(4) rotate(10deg) translateY(-20px); opacity: 0.3; }
    100% { transform: scale(5) rotate(0deg) translateY(-30px); opacity: 0; }
  }
  @keyframes gmatLockClose {
    0% { transform: scale(1) rotate(0deg); opacity: 1; }
    30% { transform: scale(3) rotate(15deg); opacity: 0.8; }
    60% { transform: scale(4) rotate(-10deg); opacity: 0.5; }
    100% { transform: scale(3) rotate(0deg); opacity: 0; }
  }
  @keyframes gmatGlowGreen {
    0%, 100% { filter: drop-shadow(0 0 0px rgba(0, 166, 102, 0)); }
    50% { filter: drop-shadow(0 0 40px rgba(0, 166, 102, 1)) drop-shadow(0 0 80px rgba(0, 166, 102, 0.8)); }
  }
  @keyframes gmatGlowRed {
    0%, 100% { filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0)); }
    50% { filter: drop-shadow(0 0 40px rgba(220, 38, 38, 1)) drop-shadow(0 0 80px rgba(220, 38, 38, 0.8)); }
  }
  @keyframes gmatOverlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes gmatOverlayFadeOut { from { opacity: 1; } to { opacity: 0; } }
  .gmat-lock-opening { animation: gmatLockOpen 1.2s ease-out forwards, gmatGlowGreen 1.2s ease-out; }
  .gmat-lock-closing { animation: gmatLockClose 1s ease-out forwards, gmatGlowRed 1s ease-out; }
  .gmat-overlay-fade-in { animation: gmatOverlayFadeIn 0.3s ease-out; }
  .gmat-overlay-fade-out { animation: gmatOverlayFadeOut 0.3s ease-out forwards; }
`;

export default function GMATPreparationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId?: string }>();

  // Tutor mode: when viewing a student's page via /tutor/student/:studentId/gmat-preparation
  const isTutorView = !!studentId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [gmatProgress, setGmatProgress] = useState<GmatProgress | null>(null);
  const [legacyAssessment, setLegacyAssessment] = useState<LegacyAssessmentResult | null>(null);
  const [placementResult, setPlacementResult] = useState<GmatAssessmentResult | null>(null);
  const [sectionAssessments, setSectionAssessments] = useState<Record<GmatSection, GmatAssessmentResult | null>>({
    QR: null,
    DI: null,
    VR: null,
  });
  const [sectionLocks, setSectionLocks] = useState<Record<GmatSection, boolean>>({
    QR: true,
    DI: true,
    VR: true,
  });
  const [simulationSlots, setSimulationSlots] = useState<GmatSimulationSlot[]>([]);
  const [trainingTemplates, setTrainingTemplates] = useState<TrainingTemplate[]>([]);
  const [trainingCompletions, setTrainingCompletions] = useState<Map<string, TrainingCompletion>>(new Map());
  const [expandedTrainingSections, setExpandedTrainingSections] = useState<Set<string>>(new Set());
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  // Track which profile we're viewing data for (used for tutor mode)
  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);
  // View mode toggle for tutors to preview student view
  const [viewMode, setViewMode] = useState<'tutor' | 'student'>('tutor');
  // Show/hide cycle manager modal
  const [showCycleManager, setShowCycleManager] = useState(false);
  // Training test assignments for lock/unlock
  const [trainingAssignments, setTrainingAssignments] = useState<Map<string, GMATTrainingAssignment>>(new Map());
  // Lock overlay animation state
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  const [lockOverlayType, setLockOverlayType] = useState<'lock' | 'unlock'>('unlock');
  const [overlayFadingOut, setOverlayFadingOut] = useState(false);
  // Analytics modal state (now embedded in page, keep for backward compatibility)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  // Enhanced analytics data (loaded lazily when analytics tab is active)
  const [analyticsData, setAnalyticsData] = useState<GmatAnalyticsData | null>(null);
  const [analyticsDataLoading, setAnalyticsDataLoading] = useState(false);
  // Active sidebar section
  const [activeSection, setActiveSection] = useState<GMATViewSection>('preparation');
  // Current user ID for materials
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // Which cycle is currently being viewed (may differ from current cycle for historical browsing)
  const [viewedCycle, setViewedCycle] = useState<GmatCycle | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [studentId]);

  // Lazy-load enhanced analytics data when analytics tab is active
  useEffect(() => {
    if (activeSection !== 'analytics') return;
    if (analyticsData || analyticsDataLoading) return;
    const targetId = studentId || currentUserId;
    if (!targetId) return;

    setAnalyticsDataLoading(true);
    getAnalyticsData(targetId)
      .then(data => setAnalyticsData(data))
      .catch(err => console.error('Failed to load analytics data:', err))
      .finally(() => setAnalyticsDataLoading(false));
  }, [activeSection, studentId, currentUserId, analyticsData, analyticsDataLoading]);

  async function handleCycleChange(cycle: GmatCycle) {
    setViewedCycle(cycle);
    if (!targetProfileId) return;
    const [completions, assignments, sectionResults, secLocks, slots] = await Promise.all([
      getTrainingCompletions(targetProfileId, cycle),
      getGMATTrainingAssignments(targetProfileId, cycle),
      getLatestSectionAssessments(targetProfileId, cycle),
      getSectionAssessmentLocks(targetProfileId, cycle),
      getSimulationSlots(targetProfileId, cycle),
    ]);
    setTrainingCompletions(completions);
    setTrainingAssignments(assignments);
    setSectionAssessments(sectionResults);
    setSectionLocks(secLocks);
    setSimulationSlots(slots);
  }

  async function loadMaterials() {
    setLoading(true);
    setError(null);

    try {
      // Determine which profile ID to use
      let targetProfileId: string;

      if (isTutorView && studentId) {
        // Tutor viewing a student - use the studentId from URL
        targetProfileId = studentId;

        // Fetch student info for the header
        const { data: studentData, error: studentError } = await supabase
          .from('2V_profiles')
          .select('id, name, email')
          .eq('id', studentId)
          .single();

        if (studentError) throw new Error('Student not found');
        setStudentInfo({
          id: studentData.id,
          name: studentData.name || '',
          email: studentData.email,
        });
      } else {
        // Student viewing their own page
        const profile = await getCurrentProfile();
        if (!profile) throw new Error('Profile not found');
        targetProfileId = profile.id;
      }

      // Also get current user ID for materials
      const currentProfile = await getCurrentProfile();
      if (currentProfile) {
        setCurrentUserId(currentProfile.id);
      }

      setTargetProfileId(targetProfileId);

      // Load progress and non-cycle data in parallel; cycle-dependent fetches come after
      const [progress, legacyResult, placementRes, templates] = await Promise.all([
        getStudentGMATProgress(targetProfileId),
        getLegacyInitialAssessment(targetProfileId),
        getLatestPlacementResult(targetProfileId),
        getTrainingTemplates(),
      ]);
      setGmatProgress(progress);
      setLegacyAssessment(legacyResult);
      setPlacementResult(placementRes);
      setTrainingTemplates(templates);

      // Fetch all cycle-dependent data now that we know the student's cycle
      const cycle = progress?.gmat_cycle ?? 'Foundation' as GmatCycle;
      const [completions, assignments, sectionResults, secLocks, slots] = await Promise.all([
        getTrainingCompletions(targetProfileId, cycle),
        getGMATTrainingAssignments(targetProfileId, cycle),
        getLatestSectionAssessments(targetProfileId, cycle),
        getSectionAssessmentLocks(targetProfileId, cycle),
        getSimulationSlots(targetProfileId, cycle),
      ]);
      setTrainingCompletions(completions);
      setTrainingAssignments(assignments);
      setSectionAssessments(sectionResults);
      setSectionLocks(secLocks);
      setSimulationSlots(slots);

      // Reset viewed cycle to student's current cycle on (re)load
      if (progress?.gmat_cycle) {
        setViewedCycle(progress.gmat_cycle);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  }


  // Handle lock/unlock training test with animation
  async function handleLockToggle(templateId: string, action: 'lock' | 'unlock') {
    if (!studentId) return;

    // Show animation
    setLockOverlayType(action);
    setShowLockOverlay(true);
    setOverlayFadingOut(false);

    try {
      const cycle = viewedCycle ?? gmatProgress!.gmat_cycle;
      // Perform the actual lock/unlock
      if (action === 'lock') {
        await lockGMATTrainingTest(studentId, templateId, cycle);
      } else {
        await unlockGMATTrainingTest(studentId, templateId, cycle);
      }

      // Update local state
      setTrainingAssignments(prev => {
        const next = new Map(prev);
        const existing = next.get(templateId);
        next.set(templateId, {
          id: existing?.id || '',
          student_id: studentId,
          test_id: templateId,
          status: action === 'lock' ? 'locked' : 'unlocked',
          assigned_by: existing?.assigned_by || null,
          assigned_at: existing?.assigned_at || new Date().toISOString(),
          completed_at: existing?.completed_at || null,
        });
        return next;
      });

      // Wait for animation then fade out
      setTimeout(() => {
        setOverlayFadingOut(true);
        setTimeout(() => {
          setShowLockOverlay(false);
          setOverlayFadingOut(false);
        }, 300);
      }, action === 'unlock' ? 1200 : 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update test status');
      setShowLockOverlay(false);
    }
  }

  // Check if a training test is locked
  // Lock all training tests for a student
  async function handleLockAllTrainingTests() {
    if (!studentId) return;

    setLockOverlayType('lock');
    setShowLockOverlay(true);
    setOverlayFadingOut(false);

    try {
      const cycle = viewedCycle ?? gmatProgress!.gmat_cycle;
      // Lock all training templates
      const lockPromises = trainingTemplates.map(template =>
        lockGMATTrainingTest(studentId, template.id, cycle)
      );
      await Promise.all(lockPromises);

      // Update local state - set all to locked
      setTrainingAssignments(prev => {
        const next = new Map(prev);
        trainingTemplates.forEach(template => {
          next.set(template.id, {
            id: prev.get(template.id)?.id || '',
            student_id: studentId,
            test_id: template.id,
            status: 'locked',
            assigned_by: prev.get(template.id)?.assigned_by || null,
            assigned_at: prev.get(template.id)?.assigned_at || new Date().toISOString(),
            completed_at: prev.get(template.id)?.completed_at || null,
          });
        });
        return next;
      });

      setTimeout(() => {
        setOverlayFadingOut(true);
        setTimeout(() => {
          setShowLockOverlay(false);
          setOverlayFadingOut(false);
        }, 300);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock all tests');
      setShowLockOverlay(false);
    }
  }

  // Lock all section assessments for a student
  async function handleLockAllSectionAssessments() {
    if (!studentId || !gmatProgress) return;
    const cycle = viewedCycle ?? gmatProgress.gmat_cycle;
    try {
      await Promise.all([
        lockSectionAssessment(studentId, 'QR', cycle),
        lockSectionAssessment(studentId, 'DI', cycle),
        lockSectionAssessment(studentId, 'VR', cycle),
      ]);
      setSectionLocks({ QR: true, DI: true, VR: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock all section assessments');
    }
  }

  // Unlock all section assessments for a student
  async function handleUnlockAllSectionAssessments() {
    if (!studentId || !gmatProgress) return;
    const cycle = viewedCycle ?? gmatProgress.gmat_cycle;
    try {
      await Promise.all([
        unlockSectionAssessment(studentId, 'QR', cycle),
        unlockSectionAssessment(studentId, 'DI', cycle),
        unlockSectionAssessment(studentId, 'VR', cycle),
      ]);
      setSectionLocks({ QR: false, DI: false, VR: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock all section assessments');
    }
  }

  // Unlock all training tests for a student
  async function handleUnlockAllTrainingTests() {
    if (!studentId) return;

    setLockOverlayType('unlock');
    setShowLockOverlay(true);
    setOverlayFadingOut(false);

    try {
      const cycle = viewedCycle ?? gmatProgress!.gmat_cycle;
      // Unlock all training templates
      const unlockPromises = trainingTemplates.map(template =>
        unlockGMATTrainingTest(studentId, template.id, cycle)
      );
      await Promise.all(unlockPromises);

      // Update local state - set all to unlocked
      setTrainingAssignments(prev => {
        const next = new Map(prev);
        trainingTemplates.forEach(template => {
          next.set(template.id, {
            id: prev.get(template.id)?.id || '',
            student_id: studentId,
            test_id: template.id,
            status: 'unlocked',
            assigned_by: prev.get(template.id)?.assigned_by || null,
            assigned_at: prev.get(template.id)?.assigned_at || new Date().toISOString(),
            completed_at: prev.get(template.id)?.completed_at || null,
          });
        });
        return next;
      });

      setTimeout(() => {
        setOverlayFadingOut(true);
        setTimeout(() => {
          setShowLockOverlay(false);
          setOverlayFadingOut(false);
        }, 300);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock all tests');
      setShowLockOverlay(false);
    }
  }

  // Loading state
  if (loading) {
    const pageTitle = isTutorView ? `GMAT - ${studentInfo?.name || 'Student'}` : 'GMAT Preparation';
    const pageSubtitle = isTutorView ? studentInfo?.email || '' : 'Your personalized learning path';
    return (
      <Layout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const pageTitle = isTutorView ? `GMAT - ${studentInfo?.name || 'Student'}` : 'GMAT Preparation';
  const pageSubtitle = isTutorView ? studentInfo?.email || '' : 'Your personalized learning path';

  // Derive latest completed simulation result for analytics/sidebar components
  const latestCompletedSlot = [...simulationSlots].reverse().find(s => s.status === 'completed');
  const latestMockSimulation = latestCompletedSlot?.result ?? null;

  return (
    <Layout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {/* Lock Animation Styles */}
      <style>{lockAnimationStyles}</style>

      {/* Lock Overlay */}
      {showLockOverlay && (
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center ${overlayFadingOut ? 'gmat-overlay-fade-out' : 'gmat-overlay-fade-in'}`}>
          <div className={`text-[120px] ${lockOverlayType === 'unlock' ? 'text-brand-green' : 'text-red-600'}`}>
            <FontAwesomeIcon
              icon={lockOverlayType === 'unlock' ? faLockOpen : faLock}
              className={lockOverlayType === 'unlock' ? 'gmat-lock-opening' : 'gmat-lock-closing'}
            />
          </div>
        </div>
      )}

      {/* Back Button for Tutor View */}
      {isTutorView && (
        <div className="px-4 md:px-6 pt-4">
          <button
            onClick={() => navigate('/tutor/students')}
            className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faChevronRight} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Students</span>
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Sidebar - narrower on laptop screens, slightly wider on large screens */}
        <aside className="w-full lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
          <GMATSidebar
            studentId={studentId}
            studentInfo={studentInfo}
            gmatProgress={gmatProgress}
            placementResult={placementResult}
            sectionAssessments={sectionAssessments}
            mockSimulation={latestMockSimulation}
            trainingCompletions={trainingCompletions}
            totalTrainingTests={trainingTemplates.length}
            isTutorView={isTutorView}
            viewMode={viewMode}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onChangeCycle={() => setShowCycleManager(true)}
          />
        </aside>

        {/* Main Content - 2/3 width on desktop */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* View Toggle for Tutors */}
          {isTutorView && (
            <GMATViewToggle viewMode={viewMode} onToggle={setViewMode} />
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Materials View */}
          {activeSection === 'materials' && currentUserId && (studentId || currentUserId) && (
            <GMATMaterialsContent
              studentId={studentId || currentUserId}
              currentUserId={currentUserId}
              isTutorView={isTutorView}
              viewMode={viewMode}
            />
          )}

          {/* Analytics View */}
          {activeSection === 'analytics' && (
            <GMATAnalyticsModal
              isOpen={true}
              onClose={() => setActiveSection('preparation')}
              gmatProgress={gmatProgress}
              placementResult={placementResult}
              sectionAssessments={sectionAssessments}
              mockSimulation={latestMockSimulation}
              trainingCompletions={trainingCompletions}
              totalTrainingTests={trainingTemplates.length}
              embedded={true}
              analyticsData={analyticsData}
            />
          )}

          {/* Preparation View */}
          {activeSection === 'preparation' && (
            <>
          {/* Cycle Navigation — shown when student has a cycle assigned */}
          {gmatProgress?.gmat_cycle && viewedCycle && (
            <div className="flex items-center gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
              {GMAT_CYCLES.filter(c => {
                const currentIdx = GMAT_CYCLES.indexOf(gmatProgress.gmat_cycle);
                return GMAT_CYCLES.indexOf(c) <= currentIdx;
              }).map(cycle => {
                const isActive = viewedCycle === cycle;
                const isCurrent = gmatProgress.gmat_cycle === cycle;
                return (
                  <button
                    key={cycle}
                    onClick={() => handleCycleChange(cycle)}
                    className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {cycle}
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-green rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Past cycle banner */}
          {gmatProgress?.gmat_cycle && viewedCycle && viewedCycle !== gmatProgress.gmat_cycle && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-3 text-sm text-amber-700">
              <span>Viewing <strong>{viewedCycle}</strong> cycle history — read only</span>
              <button
                onClick={() => handleCycleChange(gmatProgress.gmat_cycle)}
                className="ml-auto px-3 py-1 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Back to current
              </button>
            </div>
          )}

          {/* Placement Assessment CTA — Show for students with no cycle and no pending/completed placement */}
          {!isTutorView && !gmatProgress?.gmat_cycle && !placementResult && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
                  <FontAwesomeIcon icon={faClipboardCheck} className="text-2xl text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-emerald-800">Take the Placement Assessment</h2>
                  <p className="text-emerald-700 text-sm mt-1">
                    Complete a placement assessment to determine your preparation cycle (Foundation, Development, or Excellence).
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    45 questions across 3 sections • 90 minutes
                  </p>
                </div>
                <button
                  onClick={() => navigate('/student/take-test/gmat-placement-assessment')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          )}

          {/* Tutor: Preview Placement Assessment button */}
          {isTutorView && viewMode === 'tutor' && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => navigate('/tutor/take-test/gmat-placement-assessment?preview=true')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faEye} className="text-gray-500" />
                Preview Placement Assessment
              </button>
            </div>
          )}

          {/* Pending Placement Validation Banner - Only show in main content for visibility */}
          {placementResult && !placementResult.tutor_validated && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center">
                  <FontAwesomeIcon icon={faHourglass} className="text-2xl text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-amber-700">Awaiting Cycle Assignment</h2>
                  <p className="text-amber-600 text-sm mt-1">
                    Your placement assessment has been completed. Your tutor will review your results and assign your cycle.
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-600">
                      Score: <span className="font-semibold">{placementResult.score_raw}/{placementResult.score_total}</span>
                      {' '}({placementResult.score_percentage.toFixed(1)}%)
                    </span>
                    <span className="text-gray-600">
                      Suggested: <span className="font-semibold text-amber-700">{placementResult.suggested_cycle}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legacy Initial Assessment Section */}
          {legacyAssessment && (
            // Show section if: tutor view OR (student view AND section is visible)
            (isTutorView || (gmatProgress?.initial_assessment_visible ?? true)) && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClipboardCheck} className="text-orange-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Initial Assessment</h2>
                    <p className="text-sm text-gray-500">Your placement assessment result</p>
                  </div>
                </div>

                {/* Tutor Controls */}
                {isTutorView && viewMode === 'tutor' && studentId && gmatProgress && (
                  <div className="flex items-center gap-2">
                    {/* Section Visibility Toggle */}
                    {gmatProgress.initial_assessment_visible ? (
                      <button
                        onClick={async () => {
                          try {
                            await hideInitialAssessment(studentId);
                            setGmatProgress(prev => prev ? { ...prev, initial_assessment_visible: false } : null);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to hide assessment');
                          }
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                        title="Hide this section from student view"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Hide Section
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await showInitialAssessment(studentId);
                            setGmatProgress(prev => prev ? { ...prev, initial_assessment_visible: true } : null);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to show assessment');
                          }
                        }}
                        className="px-3 py-1.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Show Section
                      </button>
                    )}
                    {/* Results Visibility Toggle */}
                    {legacyAssessment.status === 'completed' && (
                      gmatProgress.initial_assessment_results_visible ? (
                        <button
                          onClick={async () => {
                            try {
                              await hideInitialAssessmentResults(studentId);
                              setGmatProgress(prev => prev ? { ...prev, initial_assessment_results_visible: false } : null);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Failed to hide results');
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-2"
                          title="Hide results from student"
                        >
                          <FontAwesomeIcon icon={faLock} />
                          Hide Results
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await showInitialAssessmentResults(studentId);
                              setGmatProgress(prev => prev ? { ...prev, initial_assessment_results_visible: true } : null);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Failed to show results');
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
                          title="Show results to student"
                        >
                          <FontAwesomeIcon icon={faLockOpen} />
                          Show Results
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Hidden Section Banner for Tutors */}
              {isTutorView && viewMode === 'tutor' && gmatProgress && !gmatProgress.initial_assessment_visible && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  This section is hidden from the student's view
                </div>
              )}

              <div className="border-2 border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    {legacyAssessment.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                          Completed
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faHourglass} className="text-xs" />
                        {legacyAssessment.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    )}

                    {/* Score Display - only show if results are visible (or tutor view) */}
                    {legacyAssessment.status === 'completed' && legacyAssessment.score !== null &&
                      (isTutorView || (gmatProgress?.initial_assessment_results_visible ?? true)) && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {legacyAssessment.score}/{legacyAssessment.max_score || '?'}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    )}

                    {/* Percentage Display - only show if results are visible (or tutor view) */}
                    {legacyAssessment.status === 'completed' && legacyAssessment.percentage !== null &&
                      (isTutorView || (gmatProgress?.initial_assessment_results_visible ?? true)) && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(legacyAssessment.percentage)}%
                        </div>
                        <div className="text-xs text-gray-500">Percentage</div>
                      </div>
                    )}

                    {/* Results Hidden Notice for Students */}
                    {!isTutorView && legacyAssessment.status === 'completed' &&
                      gmatProgress && !gmatProgress.initial_assessment_results_visible && (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                        Results will be available soon
                      </div>
                    )}

                    {/* Completion Date */}
                    {legacyAssessment.completed_at && (
                      <div className="text-sm text-gray-500">
                        Completed: {new Date(legacyAssessment.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* View Results Button - only show if results are visible (or tutor view) */}
                  {legacyAssessment.status === 'completed' &&
                    (isTutorView || (gmatProgress?.initial_assessment_results_visible ?? true)) && (
                    <button
                      onClick={() => navigate(`/student/test-results/${legacyAssessment.id}`)}
                      className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                      View Results
                    </button>
                  )}
                </div>
              </div>
            </div>
            )
          )}

          {/* Topic Training Tests Section */}
          {gmatProgress && trainingTemplates.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClipboardCheck} className="text-emerald-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Topic Training Tests</h2>
                    <p className="text-sm text-gray-500">
                      Practice tests tailored to your {viewedCycle ?? gmatProgress.gmat_cycle} cycle
                    </p>
                  </div>
                </div>

                {/* Tutor Lock All / Unlock All Controls — only for current cycle */}
                {isTutorView && viewMode === 'tutor' && studentId && viewedCycle === gmatProgress.gmat_cycle && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUnlockAllTrainingTests}
                      className="px-3 py-1.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faLockOpen} />
                      Unlock All
                    </button>
                    <button
                      onClick={handleLockAllTrainingTests}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faLock} />
                      Lock All
                    </button>
                  </div>
                )}
              </div>

              {/* Group templates by section */}
              {(['Quantitative Reasoning', 'Data Insights', 'Verbal Reasoning'] as const).map(sectionName => {
                const sectionCode = sectionName === 'Quantitative Reasoning' ? 'QR'
                  : sectionName === 'Data Insights' ? 'DI' : 'VR';
                const sectionTemplates = trainingTemplates.filter(t =>
                  t.section === sectionName || t.section === sectionCode
                );

                if (sectionTemplates.length === 0) return null;

                const sectionColors: Record<string, { bg: string; border: string; text: string; lightBg: string }> = {
                  'Quantitative Reasoning': { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', lightBg: 'bg-blue-50' },
                  'Data Insights': { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700', lightBg: 'bg-purple-50' },
                  'Verbal Reasoning': { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', lightBg: 'bg-green-50' },
                };
                const colors = sectionColors[sectionName];
                const isExpanded = expandedTrainingSections.has(sectionName);

                // Group by topic
                const topicGroups = new Map<string, TrainingTemplate[]>();
                sectionTemplates.forEach(t => {
                  const topicName = t.topic || 'General';
                  if (!topicGroups.has(topicName)) {
                    topicGroups.set(topicName, []);
                  }
                  topicGroups.get(topicName)!.push(t);
                });

                // Get curriculum-based topic order from GMAT_STRUCTURE
                const sectionStructure = GMAT_STRUCTURE[sectionName];
                const topicOrder: string[] = sectionStructure?.topics.map(t => t.name) || [];

                // Sort topics by curriculum order
                const sortedTopicEntries = Array.from(topicGroups.entries()).sort((a, b) => {
                  const indexA = topicOrder.indexOf(a[0]);
                  const indexB = topicOrder.indexOf(b[0]);
                  // Topics not in curriculum go to the end
                  const orderA = indexA === -1 ? 999 : indexA;
                  const orderB = indexB === -1 ? 999 : indexB;
                  return orderA - orderB;
                });

                // Calculate section stats
                const totalTests = sectionTemplates.length;
                const completedTests = sectionTemplates.filter(t => trainingCompletions.has(t.id)).length;

                return (
                  <div key={sectionName} className={`${colors.lightBg} border-2 ${colors.border} rounded-xl mb-4 overflow-hidden`}>
                    {/* Section Header */}
                    <button
                      onClick={() => {
                        setExpandedTrainingSections(prev => {
                          const next = new Set(prev);
                          if (next.has(sectionName)) {
                            next.delete(sectionName);
                          } else {
                            next.add(sectionName);
                          }
                          return next;
                        });
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:opacity-90 transition-opacity"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronDown : faChevronRight}
                          className={`${colors.text} text-sm`}
                        />
                        <span className={`font-bold ${colors.text}`}>{sectionName}</span>
                        <span className={`text-xs ${colors.text} ${colors.bg} px-2 py-1 rounded-full`}>
                          {completedTests}/{totalTests} completed
                        </span>
                      </div>
                      {completedTests === totalTests && totalTests > 0 && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                      )}
                    </button>

                    {/* Section Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 px-4 py-4 space-y-4 bg-white/50">
                        {sortedTopicEntries.map(([topicName, templates]) => {
                          const topicIcon = TOPIC_ICONS[topicName] || faClipboardCheck;
                          return (
                          <div key={topicName} className="flex gap-3 items-stretch">
                            {/* Topic Box - Icon + Name together, matching card height */}
                            <div className={`flex-shrink-0 w-28 rounded-xl ${colors.bg} p-4 flex flex-col items-center justify-center min-h-[120px]`}>
                              <div className={`w-10 h-10 rounded-lg ${colors.lightBg} flex items-center justify-center mb-2`}>
                                <FontAwesomeIcon icon={topicIcon} className={`text-lg ${colors.text}`} />
                              </div>
                              <p className={`text-xs font-semibold ${colors.text} text-center leading-tight`}>
                                {topicName}
                              </p>
                            </div>

                            {/* Training/Assessment Cards */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              {templates
                                .sort((a, b) => {
                                  // Sort by material type: training1 < training2 < assessment
                                  const order = { training1: 1, training2: 2, assessment: 3 };
                                  return (order[a.material_type as keyof typeof order] || 99) -
                                         (order[b.material_type as keyof typeof order] || 99);
                                })
                                .map(template => {
                                  const completion = trainingCompletions.get(template.id);
                                  const isCompleted = !!completion;
                                  const effectiveCycle = viewedCycle ?? gmatProgress.gmat_cycle;
                                  const cycleAlloc = template.question_allocation?.by_cycle?.[effectiveCycle];
                                  const hasQuestionsForCycle = cycleAlloc?.allocated_questions &&
                                    cycleAlloc.allocated_questions.length > 0;
                                  const isViewingPastCycle = viewedCycle !== gmatProgress.gmat_cycle;
                                  const requirements = template.question_requirements;
                                  // Past cycle: never show as locked (history view only)
                                  // Student view: completed tests are never locked (can view result)
                                  // Current cycle: locked by default until tutor explicitly unlocks
                                  const isLocked = isViewingPastCycle
                                    ? false
                                    : isCompleted && !isTutorView
                                    ? false
                                    : (() => {
                                        const assignment = trainingAssignments.get(template.id);
                                        if (!assignment) return true; // no record = locked by default
                                        return assignment.status === 'locked';
                                      })();
                                  const showLockControls = isTutorView && viewMode === 'tutor' && !isViewingPastCycle;

                                  return (
                                    <div
                                      key={template.id}
                                      className={`p-4 rounded-xl min-h-[120px] flex flex-col ${
                                        // For students: completed tests show green even if locked
                                        // For tutors: show gray if locked regardless of completion
                                        isCompleted && !isTutorView
                                          ? 'bg-green-50'
                                          : isLocked
                                          ? 'bg-gray-100'
                                          : isCompleted
                                          ? 'bg-green-50'
                                          : hasQuestionsForCycle
                                          ? 'bg-white'
                                          : 'bg-gray-50 opacity-60'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                          {/* Show lock icon only if locked AND not completed (for students) OR always for tutors */}
                                          {isLocked && (isTutorView || !isCompleted) && (
                                            <FontAwesomeIcon icon={faLock} className="text-gray-400 text-xs" />
                                          )}
                                          <span className={`text-sm font-medium ${isLocked && !isCompleted ? 'text-gray-500' : 'text-gray-800'}`}>
                                            {MATERIAL_TYPE_LABELS[template.material_type as keyof typeof MATERIAL_TYPE_LABELS] || template.material_type}
                                          </span>
                                        </div>
                                        {/* Status badges - different for tutors vs students */}
                                        {isTutorView ? (
                                          // TUTOR VIEW: Show scores and lock status
                                          isLocked ? (
                                            <div className="flex items-center gap-1.5">
                                              {isCompleted && completion && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                  <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                                  {Math.round(completion.best_score_percentage)}%
                                                  {completion.attempt_count > 1 && (
                                                    <span className="text-green-600">({completion.attempt_count}x)</span>
                                                  )}
                                                </span>
                                              )}
                                              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                                                <FontAwesomeIcon icon={faLock} className="text-xs" />
                                                Locked
                                              </span>
                                            </div>
                                          ) : isCompleted && completion ? (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                              <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                              {Math.round(completion.best_score_percentage)}%
                                              {completion.attempt_count > 1 && (
                                                <span className="text-green-600">({completion.attempt_count}x)</span>
                                              )}
                                            </span>
                                          ) : !hasQuestionsForCycle ? (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                                              N/A
                                            </span>
                                          ) : null
                                        ) : (
                                          // STUDENT VIEW: Show "Completed" for finished tests, scores only if results_visible
                                          isCompleted && completion ? (
                                            completion.results_visible ? (
                                              // Results visible - show score
                                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                                {Math.round(completion.best_score_percentage)}%
                                                {completion.attempt_count > 1 && (
                                                  <span className="text-green-600">({completion.attempt_count}x)</span>
                                                )}
                                              </span>
                                            ) : (
                                              // Results hidden - show "Completed" only
                                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                                Completed
                                              </span>
                                            )
                                          ) : isLocked ? (
                                            // Not completed but locked
                                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                                              <FontAwesomeIcon icon={faLock} className="text-xs" />
                                              Locked
                                            </span>
                                          ) : !hasQuestionsForCycle ? (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                                              N/A
                                            </span>
                                          ) : null
                                        )}
                                      </div>

                                      {requirements && (
                                        <div className={`text-xs mb-auto ${isLocked && !isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {requirements.total_questions} questions
                                          {requirements.time_limit_minutes && ` • ${requirements.time_limit_minutes} min`}
                                        </div>
                                      )}

                                      {/* Button rendering based on tutor/student view */}
                                      {showLockControls ? (
                                        // TUTOR VIEW: Lock/Unlock, View Results, Preview (NO Start)
                                        <div className="flex gap-2">
                                          {isLocked ? (
                                            <button
                                              onClick={() => handleLockToggle(template.id, 'unlock')}
                                              className="flex-1 px-2 py-1.5 bg-brand-green text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                            >
                                              <FontAwesomeIcon icon={faLockOpen} className="text-xs" />
                                              Unlock
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => handleLockToggle(template.id, 'lock')}
                                              className="px-2 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                                              title="Lock test"
                                            >
                                              <FontAwesomeIcon icon={faLock} className="text-xs" />
                                              Lock
                                            </button>
                                          )}
                                          {isCompleted && completion && (
                                            <button
                                              onClick={() => navigate(`/tutor/gmat-results/${completion.id}`)}
                                              className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                            >
                                              View Results
                                            </button>
                                          )}
                                          {hasQuestionsForCycle && (
                                            <button
                                              onClick={() => navigate(`/student/take-test/gmat-training/${template.id}?preview=true`)}
                                              className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                                              title="Preview test"
                                            >
                                              Preview
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        // STUDENT VIEW (or tutor in past-cycle read-only): Start, View Results, or status message
                                        isCompleted && completion ? (
                                          <div className="flex flex-col gap-2">
                                            {/* Tutors always see View Results; students only see it when results_visible */}
                                            {(isTutorView || completion.results_visible) ? (
                                              <button
                                                onClick={() => navigate(isTutorView
                                                  ? `/tutor/gmat-results/${completion.id}`
                                                  : `/student/gmat-results/${completion.id}`)}
                                                className="w-full px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                              >
                                                View Results
                                              </button>
                                            ) : (
                                              <div className="text-xs text-green-600 text-center py-1">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                                Results pending review
                                              </div>
                                            )}
                                          </div>
                                        ) : isLocked ? (
                                          // Not completed and locked
                                          <div className="text-xs text-gray-400 text-center py-1">
                                            <FontAwesomeIcon icon={faLock} className="mr-1" />
                                            Test is locked
                                          </div>
                                        ) : hasQuestionsForCycle ? (
                                          // Unlocked and not completed - can start
                                          <button
                                            onClick={() => {
                                              const url = `/student/take-test/gmat-training/${template.id}`;
                                              navigate(isViewingPastCycle ? `${url}?cycle=${effectiveCycle}` : url);
                                            }}
                                            className="w-full px-3 py-1.5 bg-brand-green text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                          >
                                            <FontAwesomeIcon icon={faRocket} />
                                            Start
                                          </button>
                                        ) : (
                                          <div className="text-xs text-gray-400 text-center py-1">
                                            No questions for {effectiveCycle} cycle
                                          </div>
                                        )
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Section Assessments */}
          {gmatProgress && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Section Assessments</h2>
                    <p className="text-sm text-gray-500">Test your readiness in each GMAT section</p>
                  </div>
                </div>

                {/* Tutor Lock All / Unlock All Controls — only for current cycle */}
                {isTutorView && viewMode === 'tutor' && studentId && viewedCycle === gmatProgress.gmat_cycle && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUnlockAllSectionAssessments}
                      className="px-3 py-1.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faLockOpen} />
                      Unlock All
                    </button>
                    <button
                      onClick={handleLockAllSectionAssessments}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faLock} />
                      Lock All
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 items-stretch">
                {(['QR', 'DI', 'VR'] as GmatSection[]).map((section) => {
                  const config = SECTION_ASSESSMENT_CONFIG[section];
                  const assessment = sectionAssessments[section];
                  const isPassed = assessment && assessment.score_percentage >= 60;
                  const isViewingPastCycle = viewedCycle !== gmatProgress.gmat_cycle;
                  const showLockControls = isTutorView && viewMode === 'tutor' && !isViewingPastCycle;

                  // Past cycle view: never show locked (history only)
                  const isLocked = isViewingPastCycle ? false : sectionLocks[section];

                  // Section-specific colors and icons
                  const sectionConfig: Record<GmatSection, { bg: string; border: string; text: string; lightBg: string; icon: typeof faCalculator }> = {
                    QR: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', lightBg: 'bg-blue-50', icon: faCalculator },
                    DI: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700', lightBg: 'bg-purple-50', icon: faChartBar },
                    VR: { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', lightBg: 'bg-green-50', icon: faBookOpen },
                  };
                  const colors = sectionConfig[section];

                  // Handle lock/unlock toggle for section assessments
                  const handleSectionLockToggle = async (action: 'lock' | 'unlock') => {
                    if (!studentId) return;
                    const cycle = viewedCycle ?? gmatProgress.gmat_cycle;
                    try {
                      if (action === 'lock') {
                        await lockSectionAssessment(studentId, section, cycle);
                      } else {
                        await unlockSectionAssessment(studentId, section, cycle);
                      }
                      setSectionLocks(prev => ({ ...prev, [section]: action === 'lock' }));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : `Failed to ${action} ${section} assessment`);
                    }
                  };

                  return (
                    <div key={section} className="flex-1 flex gap-3">
                      {/* Section Icon Box - matching training topic box style */}
                      <div className={`flex-shrink-0 w-24 rounded-xl ${colors.bg} p-4 flex flex-col items-center justify-center min-h-[120px]`}>
                        <div className={`w-10 h-10 rounded-lg ${colors.lightBg} flex items-center justify-center mb-2`}>
                          <FontAwesomeIcon icon={colors.icon} className={`text-lg ${colors.text}`} />
                        </div>
                        <p className={`text-xs font-semibold ${colors.text} text-center leading-tight`}>
                          {section}
                        </p>
                      </div>

                      {/* Assessment Card */}
                      <div
                        className={`flex-1 p-4 rounded-xl min-h-[120px] flex flex-col ${
                          isLocked && !assessment
                            ? 'bg-gray-100'
                            : assessment
                            ? isPassed ? 'bg-green-50' : 'bg-amber-50'
                            : 'bg-white border-2 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            {isLocked && !assessment && (
                              <FontAwesomeIcon icon={faLock} className="text-gray-400 text-xs" />
                            )}
                            <span className={`text-sm font-medium ${isLocked && !assessment ? 'text-gray-500' : 'text-gray-800'}`}>
                              {config.fullName}
                            </span>
                          </div>
                          {assessment ? (
                            <div className="flex items-center gap-1.5">
                              {assessment.metadata?.gmat_section_score != null ? (
                                <>
                                  {isPassed ? (
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1">
                                      <FontAwesomeIcon icon={faCheckCircle} className="text-xs text-green-600" />
                                      {assessment.metadata.gmat_section_score}
                                      <span className="font-normal text-indigo-400">/90</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                      {assessment.metadata.gmat_section_score}
                                      <span className="font-normal text-indigo-400">/90</span>
                                    </span>
                                  )}
                                  <span className={`text-xs font-medium ${isPassed ? 'text-green-600' : 'text-amber-600'}`}>
                                    ({Math.round(assessment.score_percentage)}%)
                                  </span>
                                </>
                              ) : isPassed ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                  <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                  {Math.round(assessment.score_percentage)}%
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  {Math.round(assessment.score_percentage)}%
                                </span>
                              )}
                            </div>
                          ) : isLocked ? (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                              <FontAwesomeIcon icon={faLock} className="text-xs" />
                              Locked
                            </span>
                          ) : null}
                        </div>

                        <div className={`text-xs mb-auto ${isLocked && !assessment ? 'text-gray-400' : 'text-gray-500'}`}>
                          {config.totalQuestions} questions • {config.timeMinutes} min
                        </div>

                        {/* Button rendering based on tutor/student view */}
                        {showLockControls ? (
                          // TUTOR VIEW: Lock/Unlock, View Results, Preview (NO Start)
                          <div className="flex gap-2 mt-2">
                            {isLocked ? (
                              <button
                                onClick={() => handleSectionLockToggle('unlock')}
                                className="flex-1 px-2 py-1.5 bg-brand-green text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <FontAwesomeIcon icon={faLockOpen} className="text-xs" />
                                Unlock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSectionLockToggle('lock')}
                                className="px-2 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                                title="Lock assessment"
                              >
                                <FontAwesomeIcon icon={faLock} className="text-xs" />
                                Lock
                              </button>
                            )}
                            {assessment && (
                              <button
                                onClick={() => navigate(`/tutor/gmat-results/${assessment.id}`)}
                                className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                              >
                                View Results
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/tutor/take-test/gmat-section-assessment/${section}?preview=true`)}
                              className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                              title="Preview assessment"
                            >
                              Preview
                            </button>
                          </div>
                        ) : (
                          // STUDENT VIEW: Start, View Results (no Retake when locked)
                          assessment ? (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => navigate(`/student/gmat-results/${assessment.id}`)}
                                className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                              >
                                View Results
                              </button>
                              {!isLocked && (
                                <button
                                  onClick={() => navigate(`/student/take-test/gmat-section-assessment/${section}`)}
                                  className="flex-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                                >
                                  Retake
                                </button>
                              )}
                            </div>
                          ) : isLocked ? (
                            <div className="text-xs text-gray-400 text-center py-1 mt-2">
                              <FontAwesomeIcon icon={faLock} className="mr-1" />
                              Assessment is locked
                            </div>
                          ) : (
                            <button
                              onClick={() => navigate(`/student/take-test/gmat-section-assessment/${section}`)}
                              className="w-full px-3 py-1.5 bg-brand-green text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-2"
                            >
                              <FontAwesomeIcon icon={faRocket} />
                              Start
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Simulations */}
          {gmatProgress && (() => {
            const isViewingPastCycle = viewedCycle !== gmatProgress.gmat_cycle;
            const currentCycle = viewedCycle ?? gmatProgress.gmat_cycle;
            const role = isTutorView ? 'tutor' : 'student';
            const completedSlots = simulationSlots.filter(s => s.status === 'completed');
            const pendingSlots = simulationSlots.filter(s => s.status === 'pending');

            return (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-600 text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Simulations</h2>
                      <p className="text-sm text-gray-500">Full GMAT practice test ({MOCK_SIMULATION_CONFIG.totalQuestions} questions, {Math.floor(MOCK_SIMULATION_CONFIG.timeMinutes / 60)}h {MOCK_SIMULATION_CONFIG.timeMinutes % 60}m)</p>
                    </div>
                  </div>

                  {/* Tutor Controls */}
                  {isTutorView && viewMode === 'tutor' && studentId && !isViewingPastCycle && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const slot = await createSimulationSlot(studentId, currentCycle, currentUserId || undefined);
                            setSimulationSlots(prev => [...prev, slot]);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to create simulation slot');
                          }
                        }}
                        className="px-3 py-1.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faLockOpen} />
                        Unlock New Simulation
                      </button>
                      <button
                        onClick={() => navigate('/tutor/take-test/gmat-simulation?preview=true')}
                        className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                        title="Preview simulation"
                      >
                        Preview
                      </button>
                    </div>
                  )}
                </div>

                {/* Slot cards */}
                {simulationSlots.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                    <FontAwesomeIcon icon={faLock} className="text-4xl text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Simulations Unlocked</h3>
                    <p className="text-sm text-gray-500">
                      {isTutorView && viewMode === 'tutor'
                        ? 'Use "Unlock New Simulation" to grant the student access to a simulation attempt.'
                        : 'Your tutor will unlock simulations when you\'re ready.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {simulationSlots.map((slot, index) => {
                      const slotNumber = index + 1;
                      if (slot.status === 'completed' && slot.result) {
                        const res = slot.result;
                        const resultUrl = `/${role}/gmat-results/${slot.result_id}`;
                        return (
                          <div key={slot.id} className="border-2 border-gray-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                  <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                  Simulation #{slotNumber} — Completed
                                </span>
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                                  {slot.gmat_cycle}
                                </span>
                                {res.completed_at && (
                                  <span className="text-xs text-gray-400">
                                    {new Date(res.completed_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {(() => {
                                const irtScore = computeGmatScoreFromSections((res as any).metadata?.section_scores);
                                return (
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-indigo-600">
                                      {irtScore ? irtScore.totalScore : `${res.score_percentage.toFixed(0)}%`}
                                    </div>
                                    {irtScore ? (
                                      <div className="text-xs text-gray-500">
                                        Est. GMAT Score · {irtScore.percentile}th pct
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-500">Est. GMAT Score</div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="font-bold text-gray-800">{res.score_raw}/{res.score_total}</div>
                                  <div className="text-xs text-gray-500">Raw Score</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-gray-800">{res.score_percentage.toFixed(0)}%</div>
                                  <div className="text-xs text-gray-500">Percentage</div>
                                </div>
                                {res.time_spent_seconds && (
                                  <div className="text-center">
                                    <div className="font-bold text-gray-800">{Math.floor(res.time_spent_seconds / 60)}m</div>
                                    <div className="text-xs text-gray-500">Time</div>
                                  </div>
                                )}
                              </div>
                              <a
                                href={resultUrl}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                                View Results
                              </a>
                            </div>
                          </div>
                        );
                      }

                      if (slot.status === 'pending') {
                        return (
                          <div key={slot.id} className="border-2 border-indigo-200 bg-indigo-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1">
                                  <FontAwesomeIcon icon={faRocket} className="text-xs" />
                                  Simulation #{slotNumber} — Ready to Start
                                </span>
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium border border-indigo-200">
                                  {slot.gmat_cycle}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Student: Start button */}
                                {!(isTutorView && viewMode === 'tutor') && (
                                  <button
                                    onClick={() => navigate(`/student/take-test/gmat-simulation?slotId=${slot.id}`)}
                                    className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                  >
                                    <FontAwesomeIcon icon={faRocket} />
                                    Start Simulation
                                  </button>
                                )}
                                {/* Tutor: Revoke button (current cycle only) */}
                                {isTutorView && viewMode === 'tutor' && !isViewingPastCycle && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await deleteSimulationSlot(slot.id);
                                        setSimulationSlots(prev => prev.filter(s => s.id !== slot.id));
                                      } catch (err) {
                                        setError(err instanceof Error ? err.message : 'Failed to revoke simulation slot');
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                                  >
                                    <FontAwesomeIcon icon={faLock} />
                                    Revoke
                                  </button>
                                )}
                              </div>
                            </div>
                            {/* Show section breakdown for pending slots */}
                            <div className="mt-3 bg-white rounded-lg p-3 border border-indigo-100">
                              <div className="grid grid-cols-3 gap-3 text-center">
                                {MOCK_SIMULATION_CONFIG.sectionOrder.map((section) => {
                                  const sectionConfig = MOCK_SIMULATION_CONFIG.sections[section];
                                  return (
                                    <div key={section}>
                                      <div className="font-semibold text-indigo-700 text-sm">{section}</div>
                                      <div className="text-xs text-gray-500">
                                        {sectionConfig.questions}q • {sectionConfig.timeMinutes}m
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}
              </div>
            );
          })()}
            </>
          )}

        </main>
      </div>

      {/* Cycle Manager Modal */}
      {showCycleManager && studentId && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCycleManager(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Manage GMAT Cycle</h3>
              <button
                onClick={() => setShowCycleManager(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
              </button>
            </div>
            <GMATCycleManager
              studentId={studentId}
              editable={true}
              onCycleChange={() => {
                setShowCycleManager(false);
                loadMaterials(); // Refresh data after cycle change
              }}
            />
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewingPdf(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{viewingPdf.title}</h3>
              <button
                onClick={() => setViewingPdf(null)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
              </button>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={viewingPdf.url}
                className="w-full h-full"
                title={viewingPdf.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal (for backward compatibility, kept but typically embedded now) */}
      {showAnalyticsModal && (
        <GMATAnalyticsModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          gmatProgress={gmatProgress}
          placementResult={placementResult}
          sectionAssessments={sectionAssessments}
          mockSimulation={latestMockSimulation}
          trainingCompletions={trainingCompletions}
          totalTrainingTests={trainingTemplates.length}
          analyticsData={analyticsData}
        />
      )}
    </Layout>
  );
}
