/**
 * GMAT Materials Content Component
 * Embedded materials view for the GMAT Preparation Page
 * Shows study materials organized by section > topic > material_type
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faLockOpen,
  faFileAlt,
  faFilePdf,
  faChevronDown,
  faChevronRight,
  faCheckCircle,
  faEye,
  faBook,
  faGraduationCap,
  faChartLine,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import type { Database } from '../../database.types';

type LessonMaterialRow = Database['public']['Tables']['2V_lesson_materials']['Row'];
type MaterialAssignmentRow = Database['public']['Tables']['2V_material_assignments']['Row'];

interface MaterialWithStatus extends LessonMaterialRow {
  assignment: MaterialAssignmentRow | null;
  isUnlocked: boolean;
  isViewed: boolean;
}

interface GroupedMaterials {
  [section: string]: {
    [topic: string]: MaterialWithStatus[];
  };
}

// Section display order and icons
const SECTION_CONFIG: Record<string, { order: number; icon: typeof faChartLine; color: string }> = {
  'Quantitative Reasoning': { order: 1, icon: faChartLine, color: 'blue' },
  'Data Insights': { order: 2, icon: faBook, color: 'purple' },
  'Verbal Reasoning': { order: 3, icon: faGraduationCap, color: 'green' },
  'reference': { order: 4, icon: faFileAlt, color: 'gray' },
  'Assessments': { order: 5, icon: faFileAlt, color: 'orange' },
  'Context': { order: 6, icon: faBook, color: 'gray' },
  'Slides': { order: 7, icon: faFileAlt, color: 'indigo' },
};

// Material type display order
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

// Color classes for sections
const SECTION_COLORS: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-100' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-100' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-100' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', iconBg: 'bg-gray-100' },
};

interface GMATMaterialsContentProps {
  studentId: string;
  currentUserId: string;
  isTutorView: boolean;
  viewMode: 'tutor' | 'student';
}

export function GMATMaterialsContent({
  studentId,
  currentUserId,
  isTutorView,
  viewMode,
}: GMATMaterialsContentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MaterialWithStatus[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['reference']));
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // PDF viewer state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const showTutorControls = isTutorView && viewMode === 'tutor';

  useEffect(() => {
    loadMaterials();
  }, [studentId]);

  async function loadMaterials() {
    setLoading(true);
    setError(null);

    try {
      // Fetch all active GMAT materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('2V_lesson_materials')
        .select('*')
        .eq('test_type', 'GMAT')
        .eq('is_active', true)
        .order('section')
        .order('topic')
        .order('order_index');

      if (materialsError) throw materialsError;

      // Fetch student's material assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('2V_material_assignments')
        .select('*')
        .eq('student_id', studentId);

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
      // Always filter out templates
      if (material.is_template) continue;

      // Student view filtering
      if (!showTutorControls) {
        // Hide Assessments and Slides sections completely
        if (material.section === 'Assessments' || material.section === 'Slides') continue;
        // Context section: only show 'overview' material type
        if (material.section === 'Context' && material.material_type !== 'overview') continue;
        // Only show unlocked materials (except reference)
        if (material.section !== 'reference' && !material.isUnlocked) continue;
      }

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
    try {
      const { data, error } = await supabase.storage
        .from('gmat-materials')
        .createSignedUrl(material.pdf_storage_path, 3600);

      if (error) throw error;

      setPdfUrl(data.signedUrl);
      setPdfTitle(material.title);
      setShowPdfViewer(true);

      // Mark as viewed if not already
      if (studentId && !material.isViewed) {
        await supabase
          .from('2V_material_assignments')
          .update({ viewed_at: new Date().toISOString() })
          .eq('material_id', material.id)
          .eq('student_id', studentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
    }
  }

  // Unlock material (tutor only)
  async function unlockMaterial(material: MaterialWithStatus) {
    if (!studentId || !currentUserId) return;

    setActionLoading(true);
    try {
      if (material.assignment) {
        const { error } = await supabase
          .from('2V_material_assignments')
          .update({
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          })
          .eq('id', material.assignment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('2V_material_assignments')
          .insert({
            material_id: material.id,
            student_id: studentId,
            assigned_by: currentUserId,
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      await loadMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock material');
    } finally {
      setActionLoading(false);
    }
  }

  // Lock material (tutor only)
  async function lockMaterial(material: MaterialWithStatus) {
    if (!material.assignment) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('2V_material_assignments')
        .update({ is_unlocked: false })
        .eq('id', material.assignment.id);

      if (error) throw error;

      await loadMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock material');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  const grouped = groupMaterials(materials);
  const sortedSections = getSortedSections(grouped);
  const hasVisibleMaterials = sortedSections.length > 0;

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* No Materials Message */}
      {!hasVisibleMaterials && (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
          <FontAwesomeIcon icon={faBook} className="text-5xl text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {showTutorControls ? 'No materials available' : 'No materials unlocked yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {showTutorControls
              ? 'Upload GMAT materials to make them available.'
              : 'Your tutor will unlock study materials for you as you progress.'}
          </p>
        </div>
      )}

      {/* Materials Sections */}
      {sortedSections.map(section => {
        const sectionConfig = SECTION_CONFIG[section] || { order: 99, icon: faFileAlt, color: 'gray' };
        const colors = SECTION_COLORS[sectionConfig.color] || SECTION_COLORS.gray;
        const topics = Object.keys(grouped[section]);
        const isExpanded = expandedSections.has(section);

        return (
          <div key={section} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section)}
              className={`w-full flex items-center justify-between p-4 ${colors.bg} hover:opacity-90 transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                  <FontAwesomeIcon icon={sectionConfig.icon} className={colors.text} />
                </div>
                <div className="text-left">
                  <h2 className={`text-lg font-semibold ${colors.text}`}>{section}</h2>
                  <p className="text-sm text-gray-500">
                    {topics.length} topic{topics.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <FontAwesomeIcon
                icon={isExpanded ? faChevronDown : faChevronRight}
                className={colors.text}
              />
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                {topics.map(topic => {
                  const topicKey = `${section}-${topic}`;
                  const topicMaterials = grouped[section][topic];
                  const isTopicExpanded = expandedTopics.has(topicKey);

                  return (
                    <div key={topicKey} className="bg-gray-50 rounded-xl border border-gray-200">
                      {/* Topic Header */}
                      <button
                        onClick={() => toggleTopic(topicKey)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors rounded-t-xl"
                      >
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={isTopicExpanded ? faChevronDown : faChevronRight}
                            className="text-gray-400 text-sm"
                          />
                          <span className="font-medium text-gray-700">{topic}</span>
                          <span className="text-xs text-gray-400">
                            ({topicMaterials.length})
                          </span>
                        </div>
                      </button>

                      {/* Topic Materials */}
                      {isTopicExpanded && (
                        <div className="border-t border-gray-200 divide-y divide-gray-100">
                          {topicMaterials.map(material => (
                            <div
                              key={material.id}
                              className={`p-3 flex items-center justify-between ${
                                !material.isUnlocked ? 'bg-white/50 opacity-70' : 'bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <FontAwesomeIcon
                                  icon={faFilePdf}
                                  className={material.isUnlocked ? 'text-red-500' : 'text-gray-400'}
                                />
                                <div>
                                  <p className={`font-medium ${material.isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                                    {material.title}
                                  </p>
                                  {material.description && (
                                    <p className="text-xs text-gray-500">{material.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      {material.material_type}
                                    </span>
                                    {material.isViewed && (
                                      <span className="text-xs text-green-600 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                        Viewed
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {material.isUnlocked ? (
                                  <>
                                    <button
                                      onClick={() => viewPdf(material)}
                                      className="px-3 py-1.5 text-sm bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                      View
                                    </button>
                                    {showTutorControls && (
                                      <button
                                        onClick={() => lockMaterial(material)}
                                        disabled={actionLoading}
                                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        title="Lock material"
                                      >
                                        <FontAwesomeIcon icon={faLock} />
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {showTutorControls ? (
                                      <button
                                        onClick={() => unlockMaterial(material)}
                                        disabled={actionLoading}
                                        className="px-3 py-1.5 text-sm bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                                      >
                                        <FontAwesomeIcon icon={faLockOpen} />
                                        Unlock
                                      </button>
                                    ) : (
                                      <span className="flex items-center gap-1 text-sm text-gray-400">
                                        <FontAwesomeIcon icon={faLock} />
                                        Locked
                                      </span>
                                    )}
                                  </>
                                )}
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
          </div>
        );
      })}

      {/* PDF Viewer Modal */}
      {showPdfViewer && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{pdfTitle}</h3>
              <button
                onClick={() => {
                  setShowPdfViewer(false);
                  setPdfUrl(null);
                  setPdfTitle('');
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* PDF Content */}
            <div className="flex-1 p-4 bg-gray-100">
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-lg border border-gray-200"
                title={pdfTitle}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
