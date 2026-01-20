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
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/auth';
import {
  getStudentGMATProgress,
  type GmatCycle,
  type GmatProgress,
} from '../lib/api/gmat';

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

export default function GMATPreparationPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MaterialWithStatus[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [gmatProgress, setGmatProgress] = useState<GmatProgress | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

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
      const profile = await getCurrentProfile();
      if (!profile) throw new Error('Profile not found');

      // Load GMAT progress for current student
      const progress = await getStudentGMATProgress(profile.id);
      setGmatProgress(progress);

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
        .eq('student_id', profile.id);

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
    return (
      <Layout pageTitle="GMAT Preparation" pageSubtitle="Your personalized learning path">
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

  return (
    <Layout pageTitle="GMAT Preparation" pageSubtitle="Your personalized learning path">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">{error}</p>
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
