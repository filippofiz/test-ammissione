/**
 * GMAT Materials Management Page
 * Tutor view to manage student material assignments
 * - Select a student to manage their material access
 * - Unlock/lock individual materials or bulk actions
 * - View student progress on materials
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faLockOpen,
  faFileAlt,
  faChevronDown,
  faChevronRight,
  faArrowLeft,
  faCheckCircle,
  faEye,
  faBook,
  faGraduationCap,
  faChartLine,
  faUnlockAlt,
  faCheck,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/auth';
// Import from full generated Supabase types
import type { Database } from '../../database.types';

type Profile = Database['public']['Tables']['2V_profiles']['Row'];

interface LessonMaterial {
  id: string;
  test_type: string;
  section: string;
  topic: string;
  material_type: string;
  title: string;
  description: string | null;
  pdf_storage_path: string;
  order_index: number;
  is_active: boolean;
}

interface MaterialAssignment {
  id: string;
  material_id: string;
  student_id: string;
  assigned_by: string;
  is_unlocked: boolean;
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

export default function GMATMaterialsManagementPage() {
  const { t } = useTranslation();
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Profile | null>(null);
  const [materials, setMaterials] = useState<MaterialWithStatus[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [studentId]);

  async function loadData() {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    try {
      const profile = await getCurrentProfile();
      if (!profile) throw new Error('Profile not found');
      setTutorId(profile.id);

      // Fetch student info
      const { data: studentData, error: studentError } = await supabase
        .from('2V_profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData as Profile);

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

      // Auto-expand all sections for tutor view
      const allSections = new Set(materialsWithStatus.map(m => m.section));
      setExpandedSections(allSections);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
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

  // Toggle material selection
  function toggleMaterialSelection(materialId: string) {
    setSelectedMaterials(prev => {
      const next = new Set(prev);
      if (next.has(materialId)) {
        next.delete(materialId);
      } else {
        next.add(materialId);
      }
      return next;
    });
  }

  // Select all materials in a topic
  function selectAllInTopic(topicMaterials: MaterialWithStatus[]) {
    setSelectedMaterials(prev => {
      const next = new Set(prev);
      const lockedInTopic = topicMaterials.filter(m => !m.isUnlocked);
      for (const m of lockedInTopic) {
        next.add(m.id);
      }
      return next;
    });
  }

  // Unlock a single material
  async function unlockMaterial(material: MaterialWithStatus) {
    if (!studentId || !tutorId) return;

    setActionLoading(true);
    try {
      if (material.assignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('2V_material_assignments')
          .update({
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          })
          .eq('id', material.assignment.id);

        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('2V_material_assignments')
          .insert({
            material_id: material.id,
            student_id: studentId,
            assigned_by: tutorId,
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      await loadData(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock material');
    } finally {
      setActionLoading(false);
    }
  }

  // Lock a material
  async function lockMaterial(material: MaterialWithStatus) {
    if (!material.assignment) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('2V_material_assignments')
        .update({ is_unlocked: false })
        .eq('id', material.assignment.id);

      if (error) throw error;

      await loadData(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock material');
    } finally {
      setActionLoading(false);
    }
  }

  // Bulk unlock selected materials
  async function unlockSelected() {
    if (!studentId || !tutorId || selectedMaterials.size === 0) return;

    setActionLoading(true);
    try {
      const selectedMaterialsList = materials.filter(m => selectedMaterials.has(m.id));

      for (const material of selectedMaterialsList) {
        if (material.assignment) {
          await supabase
            .from('2V_material_assignments')
            .update({
              is_unlocked: true,
              unlocked_at: new Date().toISOString(),
            })
            .eq('id', material.assignment.id);
        } else {
          await supabase
            .from('2V_material_assignments')
            .insert({
              material_id: material.id,
              student_id: studentId,
              assigned_by: tutorId,
              is_unlocked: true,
              unlocked_at: new Date().toISOString(),
            });
        }
      }

      setSelectedMaterials(new Set());
      await loadData(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock materials');
    } finally {
      setActionLoading(false);
    }
  }

  // Unlock all materials
  async function unlockAll() {
    if (!studentId || !tutorId) return;

    setActionLoading(true);
    try {
      const lockedMaterials = materials.filter(m => !m.isUnlocked);

      for (const material of lockedMaterials) {
        if (material.assignment) {
          await supabase
            .from('2V_material_assignments')
            .update({
              is_unlocked: true,
              unlocked_at: new Date().toISOString(),
            })
            .eq('id', material.assignment.id);
        } else {
          await supabase
            .from('2V_material_assignments')
            .insert({
              material_id: material.id,
              student_id: studentId,
              assigned_by: tutorId,
              is_unlocked: true,
              unlocked_at: new Date().toISOString(),
            });
        }
      }

      await loadData(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock all materials');
    } finally {
      setActionLoading(false);
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
      <Layout pageTitle="GMAT Materials" pageSubtitle="Loading...">
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
    <Layout
      pageTitle="GMAT Materials"
      pageSubtitle={student ? `Managing materials for ${student.name}` : 'Material Management'}
    >
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Students
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Student Info & Stats */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-2xl text-brand-green" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{student?.name}</h2>
                  <p className="text-gray-500">{student?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{stats.unlocked}/{stats.total}</div>
                  <div className="text-sm text-gray-500">Unlocked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.viewed}</div>
                  <div className="text-sm text-gray-500">Viewed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {selectedMaterials.size > 0 && (
                  <>
                    <span className="text-sm text-gray-600">
                      {selectedMaterials.size} selected
                    </span>
                    <button
                      onClick={unlockSelected}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faUnlockAlt} />
                      Unlock Selected
                    </button>
                    <button
                      onClick={() => setSelectedMaterials(new Set())}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={unlockAll}
                disabled={actionLoading || stats.unlocked === stats.total}
                className="px-4 py-2 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUnlockAlt} />
                Unlock All Materials
              </button>
            </div>
          </div>

          {/* Materials by Section */}
          <div className="space-y-4">
            {sortedSections.map(section => {
              const config = SECTION_CONFIG[section] || { icon: faFileAlt, color: 'gray' };
              const topics = grouped[section];
              const topicKeys = Object.keys(topics).sort();
              const isExpanded = expandedSections.has(section);
              const sectionMaterials = Object.values(topics).flat();
              const unlockedCount = sectionMaterials.filter(m => m.isUnlocked).length;

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
                        const topicLocked = topicMaterials.filter(m => !m.isUnlocked).length;

                        return (
                          <div key={topic} className="border-2 border-gray-100 rounded-xl overflow-hidden">
                            {/* Topic Header */}
                            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                              <button
                                onClick={() => toggleTopic(topicKey)}
                                className="flex items-center gap-3 flex-1"
                              >
                                <FontAwesomeIcon
                                  icon={isTopicExpanded ? faChevronDown : faChevronRight}
                                  className="text-gray-400 text-sm"
                                />
                                <span className="font-semibold text-gray-700">{topic}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {topicUnlocked}/{topicMaterials.length}
                                </span>
                              </button>

                              {topicLocked > 0 && (
                                <button
                                  onClick={() => selectAllInTopic(topicMaterials)}
                                  className="text-sm text-brand-green hover:text-green-700 font-medium"
                                >
                                  Select Locked ({topicLocked})
                                </button>
                              )}
                            </div>

                            {/* Topic Materials */}
                            {isTopicExpanded && (
                              <div className="border-t border-gray-100 px-4 py-2 space-y-2 bg-gray-50">
                                {topicMaterials.map(material => (
                                  <div
                                    key={material.id}
                                    className={`flex items-center justify-between p-3 rounded-lg bg-white border ${
                                      selectedMaterials.has(material.id)
                                        ? 'border-brand-green bg-green-50'
                                        : 'border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {/* Checkbox for locked materials */}
                                      {!material.isUnlocked && (
                                        <input
                                          type="checkbox"
                                          checked={selectedMaterials.has(material.id)}
                                          onChange={() => toggleMaterialSelection(material.id)}
                                          className="w-5 h-5 text-brand-green rounded border-gray-300 focus:ring-brand-green"
                                        />
                                      )}

                                      <FontAwesomeIcon
                                        icon={material.isUnlocked ? faLockOpen : faLock}
                                        className={material.isUnlocked ? 'text-green-600' : 'text-gray-400'}
                                      />

                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-800">
                                            {material.title}
                                          </span>
                                          {material.isViewed && (
                                            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                              <FontAwesomeIcon icon={faEye} />
                                              Viewed
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500 capitalize">
                                          {material.material_type.replace(/([0-9]+)/g, ' $1')}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {material.isUnlocked ? (
                                        <button
                                          onClick={() => lockMaterial(material)}
                                          disabled={actionLoading}
                                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                          <FontAwesomeIcon icon={faLock} />
                                          Lock
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => unlockMaterial(material)}
                                          disabled={actionLoading}
                                          className="px-3 py-1.5 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                          <FontAwesomeIcon icon={faLockOpen} />
                                          Unlock
                                        </button>
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
