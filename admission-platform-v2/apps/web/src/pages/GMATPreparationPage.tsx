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
  faFileAlt,
  faChevronDown,
  faChevronRight,
  faDownload,
  faEye,
  faBook,
  faGraduationCap,
  faChartLine,
  faCheckCircle,
  faTimes,
  faRocket,
  faClipboardCheck,
  faHourglass,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/auth';
import {
  getStudentGMATProgress,
  getLegacyInitialAssessment,
  getLatestPlacementResult,
  getLatestSectionAssessments,
  getLatestMockSimulation,
  getTrainingTemplates,
  getTrainingCompletions,
  SECTION_ASSESSMENT_CONFIG,
  MOCK_SIMULATION_CONFIG,
  calculateEstimatedGmatScore,
  type GmatCycle,
  type GmatProgress,
  type LegacyAssessmentResult,
  type GmatAssessmentResult,
  type GmatSection,
  type TrainingTemplate,
  type TrainingCompletion,
} from '../lib/api/gmat';
import { useNavigate, useParams } from 'react-router-dom';
import { MATERIAL_TYPE_LABELS } from '../lib/gmat/questionAllocation';
import { GMATCycleManager } from '../components/GMATCycleManager';

interface LessonMaterial {
  id: string;
  test_type: string;
  section: string;
  topic: string;
  material_type: string;
  title: string;
  description: string | null;
  pdf_storage_path: string;
  order_index: number | null;
  is_active: boolean | null;
  is_template: boolean | null;  // True if this is a question template (admin only)
}

interface MaterialAssignment {
  id: string;
  material_id: string;
  student_id: string;
  is_unlocked: boolean | null;
  unlocked_at: string | null;
  viewed_at: string | null;
  completed_at: string | null;
}

interface MaterialWithStatus extends LessonMaterial {
  assignment: MaterialAssignment | null;
  isUnlocked: boolean;
  isViewed: boolean;
}

interface GroupedMaterials {
  [section: string]: {
    [topic: string]: MaterialWithStatus[];
  };
}

// Section display order and icons
const SECTION_CONFIG: Record<string, { order: number; icon: any; color: string }> = {
  'Quantitative Reasoning': { order: 1, icon: faChartLine, color: 'blue' },
  'Data Insights': { order: 2, icon: faBook, color: 'purple' },
  'Verbal Reasoning': { order: 3, icon: faGraduationCap, color: 'green' },
  'Assessments': { order: 4, icon: faFileAlt, color: 'orange' },
  'Context': { order: 5, icon: faBook, color: 'gray' },
  'Slides': { order: 6, icon: faFileAlt, color: 'indigo' },
  'reference': { order: 7, icon: faFileAlt, color: 'gray' },
};

// Material type display names and order
const MATERIAL_TYPE_ORDER: Record<string, number> = {
  'lesson': 1,
  'exercises': 2,
  'training1': 3,
  'training2': 4,
  'assessment': 5,
  'practice': 6,
  'overview': 1,
  'fundamentals': 2,
  'core': 3,
  'excellence': 4,
  'mock': 1,
  'placement': 2,
  'slide': 1,
  'reference': 1,
  'other': 99,
};

// Student info for tutor view
interface StudentInfo {
  id: string;
  name: string;
  email: string;
}

export default function GMATPreparationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId?: string }>();

  // Tutor mode: when viewing a student's page via /tutor/student/:studentId/gmat-preparation
  const isTutorView = !!studentId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MaterialWithStatus[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [gmatProgress, setGmatProgress] = useState<GmatProgress | null>(null);
  const [legacyAssessment, setLegacyAssessment] = useState<LegacyAssessmentResult | null>(null);
  const [placementResult, setPlacementResult] = useState<GmatAssessmentResult | null>(null);
  const [sectionAssessments, setSectionAssessments] = useState<Record<GmatSection, GmatAssessmentResult | null>>({
    QR: null,
    DI: null,
    VR: null,
  });
  const [mockSimulation, setMockSimulation] = useState<GmatAssessmentResult | null>(null);
  const [trainingTemplates, setTrainingTemplates] = useState<TrainingTemplate[]>([]);
  const [trainingCompletions, setTrainingCompletions] = useState<Map<string, TrainingCompletion>>(new Map());
  const [expandedTrainingSections, setExpandedTrainingSections] = useState<Set<string>>(new Set());
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  // Track which profile we're viewing data for (used for tutor mode)
  const [_targetProfileId, setTargetProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [studentId]);

  // Helper to get cycle display info
  function getCycleInfo(cycle: GmatCycle) {
    const info: Record<GmatCycle, { color: string; bgColor: string; borderColor: string; scoreRange: string; description: string }> = {
      Foundation: {
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        scoreRange: '505-605',
        description: 'Building core skills',
      },
      Development: {
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        scoreRange: '605-665',
        description: 'Advancing skills',
      },
      Excellence: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        scoreRange: '665-715+',
        description: 'Mastering advanced content',
      },
    };
    return info[cycle];
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

      setTargetProfileId(targetProfileId);

      // Load GMAT progress, legacy assessment, placement result, section assessments, mock simulation, and training data in parallel
      const [progress, legacyResult, placementRes, sectionResults, mockResult, templates, completions] = await Promise.all([
        getStudentGMATProgress(targetProfileId),
        getLegacyInitialAssessment(targetProfileId),
        getLatestPlacementResult(targetProfileId),
        getLatestSectionAssessments(targetProfileId),
        getLatestMockSimulation(targetProfileId),
        getTrainingTemplates(),
        getTrainingCompletions(targetProfileId),
      ]);
      setGmatProgress(progress);
      setLegacyAssessment(legacyResult);
      setPlacementResult(placementRes);
      setSectionAssessments(sectionResults);
      setMockSimulation(mockResult);
      setTrainingTemplates(templates);
      setTrainingCompletions(completions);


      // Fetch all active GMAT materials (excluding templates which are for admin use only)
      const { data: materialsData, error: materialsError } = await supabase
        .from('2V_lesson_materials')
        .select('*')
        .eq('test_type', 'GMAT')
        .eq('is_active', true)
        .or('is_template.is.null,is_template.eq.false')  // Exclude templates
        .order('section')
        .order('topic')
        .order('order_index');

      if (materialsError) throw materialsError;

      // Fetch student's material assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('2V_material_assignments')
        .select('*')
        .eq('student_id', targetProfileId);

      if (assignmentsError) throw assignmentsError;

      // Combine materials with assignment status
      const assignmentsMap = new Map(
        (assignmentsData || []).map(a => [a.material_id, a])
      );

      const materialsWithStatus: MaterialWithStatus[] = (materialsData || []).map(material => {
        const assignment = assignmentsMap.get(material.id) || null;
        return {
          ...material,
          assignment,
          isUnlocked: assignment?.is_unlocked || false,
          isViewed: !!assignment?.viewed_at,
        };
      });

      setMaterials(materialsWithStatus);

      // Auto-expand sections that have unlocked materials
      const sectionsWithUnlocked = new Set(
        materialsWithStatus
          .filter(m => m.isUnlocked)
          .map(m => m.section)
      );
      setExpandedSections(sectionsWithUnlocked);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  }

  // Group materials by section and topic
  function groupMaterials(materials: MaterialWithStatus[]): GroupedMaterials {
    const grouped: GroupedMaterials = {};

    for (const material of materials) {
      if (!grouped[material.section]) {
        grouped[material.section] = {};
      }
      if (!grouped[material.section][material.topic]) {
        grouped[material.section][material.topic] = [];
      }
      grouped[material.section][material.topic].push(material);
    }

    // Sort materials within each topic
    for (const section of Object.keys(grouped)) {
      for (const topic of Object.keys(grouped[section])) {
        grouped[section][topic].sort((a, b) => {
          const orderA = MATERIAL_TYPE_ORDER[a.material_type] || 99;
          const orderB = MATERIAL_TYPE_ORDER[b.material_type] || 99;
          return orderA - orderB;
        });
      }
    }

    return grouped;
  }

  // Get sorted sections
  function getSortedSections(grouped: GroupedMaterials): string[] {
    return Object.keys(grouped).sort((a, b) => {
      const orderA = SECTION_CONFIG[a]?.order || 99;
      const orderB = SECTION_CONFIG[b]?.order || 99;
      return orderA - orderB;
    });
  }

  // Toggle section expansion
  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  // Toggle topic expansion
  function toggleTopic(sectionTopic: string) {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(sectionTopic)) {
        next.delete(sectionTopic);
      } else {
        next.add(sectionTopic);
      }
      return next;
    });
  }

  // View PDF
  async function viewPdf(material: MaterialWithStatus) {
    if (!material.isUnlocked) return;

    setPdfLoading(true);
    try {
      // Get signed URL for the PDF
      const { data, error } = await supabase.storage
        .from('gmat-materials')
        .createSignedUrl(material.pdf_storage_path, 3600); // 1 hour expiry

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Failed to get PDF URL');

      // Mark as viewed
      if (material.assignment && !material.isViewed) {
        await supabase
          .from('2V_material_assignments')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', material.assignment.id);
      }

      setViewingPdf({ url: data.signedUrl, title: material.title });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
    } finally {
      setPdfLoading(false);
    }
  }

  // Download PDF
  async function downloadPdf(material: MaterialWithStatus) {
    if (!material.isUnlocked) return;

    try {
      const { data, error } = await supabase.storage
        .from('gmat-materials')
        .download(material.pdf_storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.title.replace(/\s+/g, '-') + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Mark as viewed
      if (material.assignment && !material.isViewed) {
        await supabase
          .from('2V_material_assignments')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', material.assignment.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  }

  // Calculate progress stats
  function getProgressStats() {
    const total = materials.length;
    const unlocked = materials.filter(m => m.isUnlocked).length;
    const viewed = materials.filter(m => m.isViewed).length;
    return { total, unlocked, viewed };
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

  const grouped = groupMaterials(materials);
  const sortedSections = getSortedSections(grouped);
  const stats = getProgressStats();

  const pageTitle = isTutorView ? `GMAT - ${studentInfo?.name || 'Student'}` : 'GMAT Preparation';
  const pageSubtitle = isTutorView ? studentInfo?.email || '' : 'Your personalized learning path';

  return (
    <Layout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Tutor View Header */}
          {isTutorView && studentInfo && (
            <div className="mb-6">
              {/* Back Button */}
              <button
                onClick={() => navigate('/tutor/students')}
                className="mb-4 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
              >
                <FontAwesomeIcon icon={faChevronRight} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Students</span>
              </button>

              {/* Student Info Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-brand-green">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-brand-dark">{studentInfo.name || studentInfo.email}</h2>
                    {studentInfo.name && <p className="text-gray-600">{studentInfo.email}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                        GMAT Preparation
                      </span>
                      <span className="text-sm text-gray-500">
                        Viewing as Tutor
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GMAT Cycle Manager for Tutors */}
              <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <FontAwesomeIcon icon={faRocket} className="text-xl text-brand-green" />
                  <h2 className="text-xl font-bold text-brand-dark">GMAT Preparation Cycle</h2>
                </div>
                <GMATCycleManager studentId={studentId} editable={true} />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Pending Placement Validation Banner */}
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

          {/* Current Cycle Display */}
          {gmatProgress && (
            <div className={`${getCycleInfo(gmatProgress.gmat_cycle).bgColor} border-2 ${getCycleInfo(gmatProgress.gmat_cycle).borderColor} rounded-2xl p-6 mb-6`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${getCycleInfo(gmatProgress.gmat_cycle).bgColor} border-2 ${getCycleInfo(gmatProgress.gmat_cycle).borderColor} flex items-center justify-center`}>
                  <FontAwesomeIcon icon={faRocket} className={`text-2xl ${getCycleInfo(gmatProgress.gmat_cycle).color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className={`text-xl font-bold ${getCycleInfo(gmatProgress.gmat_cycle).color}`}>
                      {gmatProgress.gmat_cycle} Cycle
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCycleInfo(gmatProgress.gmat_cycle).bgColor} ${getCycleInfo(gmatProgress.gmat_cycle).color} border ${getCycleInfo(gmatProgress.gmat_cycle).borderColor}`}>
                      Target: {getCycleInfo(gmatProgress.gmat_cycle).scoreRange}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{getCycleInfo(gmatProgress.gmat_cycle).description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Legacy Initial Assessment Section */}
          {legacyAssessment && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faClipboardCheck} className="text-orange-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Initial Assessment</h2>
                  <p className="text-sm text-gray-500">Your placement assessment result</p>
                </div>
              </div>

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

                    {/* Score Display */}
                    {legacyAssessment.status === 'completed' && legacyAssessment.score !== null && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {legacyAssessment.score}/{legacyAssessment.max_score || '?'}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    )}

                    {/* Percentage Display */}
                    {legacyAssessment.status === 'completed' && legacyAssessment.percentage !== null && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(legacyAssessment.percentage)}%
                        </div>
                        <div className="text-xs text-gray-500">Percentage</div>
                      </div>
                    )}

                    {/* Completion Date */}
                    {legacyAssessment.completed_at && (
                      <div className="text-sm text-gray-500">
                        Completed: {new Date(legacyAssessment.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* View Results Link */}
                  {legacyAssessment.status === 'completed' && (
                    <a
                      href={`/student/test-results/${legacyAssessment.id}`}
                      className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                      View Results
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Materials</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{stats.unlocked}</div>
                <div className="text-sm text-gray-600">Unlocked</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{stats.viewed}</div>
                <div className="text-sm text-gray-600">Viewed</div>
              </div>
            </div>
            {stats.unlocked > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Completion</span>
                  <span>{Math.round((stats.viewed / stats.unlocked) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-green to-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.viewed / stats.unlocked) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Assessments */}
          {gmatProgress && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Section Assessments</h2>
                  <p className="text-sm text-gray-500">Test your readiness in each GMAT section</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['QR', 'DI', 'VR'] as GmatSection[]).map((section) => {
                  const config = SECTION_ASSESSMENT_CONFIG[section];
                  const assessment = sectionAssessments[section];
                  const isPassed = assessment && assessment.score_percentage >= 60;

                  // Section-specific colors
                  const sectionColors: Record<GmatSection, { bg: string; border: string; text: string; icon: string }> = {
                    QR: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
                    DI: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
                    VR: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
                  };
                  const colors = sectionColors[section];

                  return (
                    <div
                      key={section}
                      className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-bold ${colors.text}`}>{config.fullName}</h3>
                        {assessment ? (
                          isPassed ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                              <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                              Passed
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              Needs Improvement
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Not Started
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{config.totalQuestions} questions</span>
                          <span>•</span>
                          <span>{config.timeMinutes} min</span>
                        </div>
                      </div>

                      {assessment ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className={`font-bold ${isPassed ? 'text-green-600' : 'text-amber-600'}`}>
                              {assessment.score_raw}/{assessment.score_total} ({assessment.score_percentage.toFixed(0)}%)
                            </span>
                          </div>
                          {assessment.completed_at && (
                            <div className="text-xs text-gray-500">
                              Completed: {new Date(assessment.completed_at).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <a
                              href={`/student/gmat-results/${assessment.id}`}
                              className={`flex-1 px-3 py-2 ${colors.bg} ${colors.text} border ${colors.border} rounded-lg text-sm font-medium hover:opacity-80 transition-colors text-center`}
                            >
                              View Results
                            </a>
                            <button
                              className={`flex-1 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors`}
                            >
                              Retake
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className={`w-full px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2`}
                        >
                          <FontAwesomeIcon icon={faRocket} />
                          Start Assessment
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mock Simulation Readiness */}
              {(sectionAssessments.QR || sectionAssessments.DI || sectionAssessments.VR) && (
                <div className="mt-4 pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">Mock Simulation Readiness</h4>
                      <p className="text-sm text-gray-500">
                        Pass all three section assessments (≥60%) to unlock Mock Simulations
                      </p>
                    </div>
                    {sectionAssessments.QR && sectionAssessments.DI && sectionAssessments.VR &&
                     sectionAssessments.QR.score_percentage >= 60 &&
                     sectionAssessments.DI.score_percentage >= 60 &&
                     sectionAssessments.VR.score_percentage >= 60 ? (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Ready for Mock!
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faLock} />
                        {[
                          !sectionAssessments.QR || sectionAssessments.QR.score_percentage < 60 ? 'QR' : null,
                          !sectionAssessments.DI || sectionAssessments.DI.score_percentage < 60 ? 'DI' : null,
                          !sectionAssessments.VR || sectionAssessments.VR.score_percentage < 60 ? 'VR' : null,
                        ].filter(Boolean).join(', ')} needed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mock Simulations */}
          {gmatProgress && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Mock Simulations</h2>
                  <p className="text-sm text-gray-500">Full GMAT practice test ({MOCK_SIMULATION_CONFIG.totalQuestions} questions, {Math.floor(MOCK_SIMULATION_CONFIG.timeMinutes / 60)}h {MOCK_SIMULATION_CONFIG.timeMinutes % 60}m)</p>
                </div>
              </div>

              {(() => {
                // Check if mock simulations are unlocked
                const isUnlocked = sectionAssessments.QR && sectionAssessments.DI && sectionAssessments.VR &&
                  sectionAssessments.QR.score_percentage >= 60 &&
                  sectionAssessments.DI.score_percentage >= 60 &&
                  sectionAssessments.VR.score_percentage >= 60;

                if (!isUnlocked) {
                  // Locked state
                  return (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                      <FontAwesomeIcon icon={faLock} className="text-4xl text-gray-400 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Mock Simulations Locked</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Complete all three section assessments with at least 60% to unlock mock simulations.
                      </p>
                      <div className="flex justify-center gap-4">
                        {(['QR', 'DI', 'VR'] as GmatSection[]).map((section) => {
                          const assessment = sectionAssessments[section];
                          const isPassed = assessment && assessment.score_percentage >= 60;
                          return (
                            <div key={section} className="flex items-center gap-1.5">
                              <FontAwesomeIcon
                                icon={isPassed ? faCheckCircle : faTimes}
                                className={isPassed ? 'text-green-500' : 'text-gray-400'}
                              />
                              <span className={`text-sm font-medium ${isPassed ? 'text-green-700' : 'text-gray-500'}`}>
                                {section}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Unlocked state
                return (
                  <div className="space-y-4">
                    {/* Mock test details */}
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        {MOCK_SIMULATION_CONFIG.sectionOrder.map((section) => {
                          const sectionConfig = MOCK_SIMULATION_CONFIG.sections[section];
                          return (
                            <div key={section}>
                              <div className="font-semibold text-indigo-700">{section}</div>
                              <div className="text-xs text-gray-600">
                                {sectionConfig.questions} questions • {sectionConfig.timeMinutes} min
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Latest mock result or start button */}
                    {mockSimulation ? (
                      <div className="border-2 border-gray-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit mb-2">
                              <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                              Completed
                            </span>
                            <div className="text-sm text-gray-500">
                              {mockSimulation.completed_at && new Date(mockSimulation.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-indigo-600">
                              {calculateEstimatedGmatScore(mockSimulation.score_percentage)}
                            </div>
                            <div className="text-xs text-gray-500">Estimated GMAT Score</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="font-bold text-gray-800">
                                {mockSimulation.score_raw}/{mockSimulation.score_total}
                              </div>
                              <div className="text-xs text-gray-500">Raw Score</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-gray-800">
                                {mockSimulation.score_percentage.toFixed(0)}%
                              </div>
                              <div className="text-xs text-gray-500">Percentage</div>
                            </div>
                            {mockSimulation.time_spent_seconds && (
                              <div className="text-center">
                                <div className="font-bold text-gray-800">
                                  {Math.floor(mockSimulation.time_spent_seconds / 60)}m
                                </div>
                                <div className="text-xs text-gray-500">Time</div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`/student/gmat-results/${mockSimulation.id}`}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faExternalLinkAlt} />
                              View Results
                            </a>
                            <button
                              className="px-4 py-2 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faRocket} />
                              New Mock
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">
                          You're ready for your first mock simulation! This will give you an estimated GMAT score.
                        </p>
                        <button
                          className="px-6 py-3 bg-brand-green text-white rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-3 mx-auto"
                        >
                          <FontAwesomeIcon icon={faRocket} />
                          Start Mock Simulation
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Topic Training Tests Section */}
          {gmatProgress && trainingTemplates.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faClipboardCheck} className="text-emerald-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Topic Training Tests</h2>
                  <p className="text-sm text-gray-500">
                    Practice tests tailored to your {gmatProgress.gmat_cycle} cycle
                  </p>
                </div>
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
                      <div className="border-t border-gray-200 px-4 py-3 space-y-3 bg-white/50">
                        {Array.from(topicGroups.entries()).map(([topicName, templates]) => (
                          <div key={topicName} className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">{topicName}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                                  const requirements = template.question_requirements;
                                  const cycleAlloc = template.question_allocation?.by_cycle?.[gmatProgress.gmat_cycle];
                                  const hasQuestionsForCycle = cycleAlloc?.allocated_questions &&
                                    cycleAlloc.allocated_questions.length > 0;

                                  return (
                                    <div
                                      key={template.id}
                                      className={`p-3 rounded-lg border-2 ${
                                        isCompleted
                                          ? 'bg-green-50 border-green-200'
                                          : hasQuestionsForCycle
                                          ? 'bg-white border-gray-200'
                                          : 'bg-gray-50 border-gray-200 opacity-60'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-800">
                                          {MATERIAL_TYPE_LABELS[template.material_type as keyof typeof MATERIAL_TYPE_LABELS] || template.material_type}
                                        </span>
                                        {isCompleted ? (
                                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                            {Math.round(completion.score_percentage)}%
                                          </span>
                                        ) : !hasQuestionsForCycle ? (
                                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                                            Not available
                                          </span>
                                        ) : null}
                                      </div>

                                      {requirements && (
                                        <div className="text-xs text-gray-500 mb-2">
                                          {requirements.total_questions} questions
                                          {requirements.time_limit_minutes && ` • ${requirements.time_limit_minutes} min`}
                                        </div>
                                      )}

                                      {hasQuestionsForCycle ? (
                                        isCompleted ? (
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => navigate(`/student/gmat-results/${completion.template_id}`)}
                                              className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                            >
                                              View Results
                                            </button>
                                            <button
                                              onClick={() => navigate(`/student/take-test/gmat-training/${template.id}`)}
                                              className="flex-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                                            >
                                              Retake
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => navigate(`/student/take-test/gmat-training/${template.id}`)}
                                            className="w-full px-3 py-1.5 bg-brand-green text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                          >
                                            <FontAwesomeIcon icon={faRocket} />
                                            Start
                                          </button>
                                        )
                                      ) : (
                                        <div className="text-xs text-gray-400 text-center py-1">
                                          No questions for {gmatProgress.gmat_cycle} cycle
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Section Header for Cycle-Based Materials */}
          {gmatProgress && (
            <div className="flex items-center gap-3 mb-4 mt-8">
              <div className="h-0.5 flex-1 bg-gray-200" />
              <h2 className="text-lg font-semibold text-gray-600 px-4">Cycle-Based Training Materials</h2>
              <div className="h-0.5 flex-1 bg-gray-200" />
            </div>
          )}

          {/* Materials by Section */}
          {sortedSections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 text-center">
              <FontAwesomeIcon icon={faLock} className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Materials Available</h3>
              <p className="text-gray-500">Your tutor will unlock materials for you as you progress.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSections.map(section => {
                const config = SECTION_CONFIG[section] || { icon: faFileAlt, color: 'gray' };
                const topics = grouped[section];
                const topicKeys = Object.keys(topics).sort();
                const isExpanded = expandedSections.has(section);
                const sectionMaterials = Object.values(topics).flat();
                const unlockedCount = sectionMaterials.filter(m => m.isUnlocked).length;
                const viewedCount = sectionMaterials.filter(m => m.isViewed).length;

                return (
                  <div key={section} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-${config.color}-100 flex items-center justify-center`}>
                          <FontAwesomeIcon icon={config.icon} className={`text-xl text-${config.color}-600`} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-gray-800">{section}</h3>
                          <p className="text-sm text-gray-500">
                            {unlockedCount} of {sectionMaterials.length} unlocked
                            {viewedCount > 0 && ` | ${viewedCount} viewed`}
                          </p>
                        </div>
                      </div>
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronDown : faChevronRight}
                        className="text-gray-400"
                      />
                    </button>

                    {/* Section Content */}
                    {isExpanded && (
                      <div className="border-t-2 border-gray-100 px-6 py-4 space-y-3">
                        {topicKeys.map(topic => {
                          const topicMaterials = topics[topic];
                          const topicKey = `${section}-${topic}`;
                          const isTopicExpanded = expandedTopics.has(topicKey);
                          const topicUnlocked = topicMaterials.filter(m => m.isUnlocked).length;

                          return (
                            <div key={topic} className="border-2 border-gray-100 rounded-xl overflow-hidden">
                              {/* Topic Header */}
                              <button
                                onClick={() => toggleTopic(topicKey)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <FontAwesomeIcon
                                    icon={isTopicExpanded ? faChevronDown : faChevronRight}
                                    className="text-gray-400 text-sm"
                                  />
                                  <span className="font-semibold text-gray-700">{topic}</span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {topicUnlocked}/{topicMaterials.length}
                                  </span>
                                </div>
                              </button>

                              {/* Topic Materials */}
                              {isTopicExpanded && (
                                <div className="border-t border-gray-100 px-4 py-2 space-y-2 bg-gray-50">
                                  {topicMaterials.map(material => (
                                    <div
                                      key={material.id}
                                      className={`flex items-center justify-between p-3 rounded-lg ${
                                        material.isUnlocked
                                          ? 'bg-white border border-gray-200'
                                          : 'bg-gray-100 border border-gray-200 opacity-60'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <FontAwesomeIcon
                                          icon={material.isUnlocked ? faLockOpen : faLock}
                                          className={material.isUnlocked ? 'text-green-600' : 'text-gray-400'}
                                        />
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className={`font-medium ${material.isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                                              {material.title}
                                            </span>
                                            {material.isViewed && (
                                              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm" />
                                            )}
                                          </div>
                                          <span className="text-xs text-gray-500 capitalize">
                                            {material.material_type.replace(/([0-9]+)/g, ' $1')}
                                          </span>
                                        </div>
                                      </div>

                                      {material.isUnlocked && (
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => viewPdf(material)}
                                            className="px-3 py-1.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                            disabled={pdfLoading}
                                          >
                                            <FontAwesomeIcon icon={faEye} />
                                            View
                                          </button>
                                          <button
                                            onClick={() => downloadPdf(material)}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                                          >
                                            <FontAwesomeIcon icon={faDownload} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
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
        </div>
      </div>

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
    </Layout>
  );
}
