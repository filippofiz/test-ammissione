/**
 * PoolSectionSelector Component
 * Shows sections where student completed at least one Assessment Monotematico.
 * Student picks a section, sees past batch history, then starts practice.
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faStar,
  faSpinner,
  faChartLine,
  faTrophy,
  faArrowLeft,
  faHistory,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';
import { PoolSessionReview } from './PoolSessionReview';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface SectionProgress {
  section: string;
  proficiency_level: number;
  proficiency_status: string;
  total_answered: number;
  total_correct: number;
}

interface SessionSummary {
  session_id: string;
  answered_at: string;
  total: number;
  correct: number;
}

interface PoolSectionSelectorProps {
  studentId: string;
  testType: string;
  onSelectSection: (section: string) => void;
  onClose: () => void;
}

export function PoolSectionSelector({ studentId, testType, onSelectSection, onClose }: PoolSectionSelectorProps) {
  const [sections, setSections] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, SectionProgress>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sessionsMap, setSessionsMap] = useState<Record<string, SessionSummary[]>>({});
  const [loadingSessions, setLoadingSessions] = useState<string | null>(null);
  const [reviewingSession, setReviewingSession] = useState<{ sessionId: string; section: string } | null>(null);

  useEffect(() => {
    loadSections();
  }, [studentId, testType]);

  async function loadSections() {
    setLoading(true);
    try {
      // Only show sections where student completed at least one Assessment Monotematico
      const { data: assignments, error } = await supabase
        .from('2V_test_assignments')
        .select(`
          id, status, completion_status,
          2V_tests!inner (section, exercise_type)
        `)
        .eq('student_id', studentId)
        .eq('2V_tests.test_type', testType)
        .eq('2V_tests.exercise_type', 'Assessment Monotematico');

      if (error) throw error;

      const completedSections = new Set<string>();
      (assignments || []).forEach((a: any) => {
        const isCompleted = a.completion_status?.startsWith('completed') || a.status === 'completed';
        if (isCompleted && a['2V_tests']?.section) {
          completedSections.add(a['2V_tests'].section);
        }
      });

      setSections([...completedSections].sort());

      // Load student pool practice progress
      const { data: progressData } = await db
        .from('ai_pool_student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('test_type', testType);

      const map: Record<string, SectionProgress> = {};
      (progressData || []).forEach((p: any) => {
        map[p.section] = {
          section: p.section,
          proficiency_level: p.proficiency_level,
          proficiency_status: p.proficiency_status,
          total_answered: p.total_answered,
          total_correct: p.total_correct,
        };
      });
      setProgressMap(map);
    } catch (err) {
      console.error('Error loading sections:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSessions(section: string) {
    if (sessionsMap[section]) return; // already loaded
    setLoadingSessions(section);
    try {
      const { data, error } = await db
        .from('ai_pool_student_answers')
        .select('session_id, is_correct, answered_at')
        .eq('student_id', studentId)
        .eq('test_type', testType)
        .eq('section', section)
        .not('session_id', 'is', null)
        .order('answered_at', { ascending: false });

      if (error) throw error;

      // Group by session_id
      const grouped: Record<string, { total: number; correct: number; answered_at: string }> = {};
      (data || []).forEach((row: any) => {
        if (!grouped[row.session_id]) {
          grouped[row.session_id] = { total: 0, correct: 0, answered_at: row.answered_at };
        }
        grouped[row.session_id].total++;
        if (row.is_correct) grouped[row.session_id].correct++;
        // Keep the earliest answered_at as the session time
        if (row.answered_at < grouped[row.session_id].answered_at) {
          grouped[row.session_id].answered_at = row.answered_at;
        }
      });

      const sessions: SessionSummary[] = Object.entries(grouped)
        .map(([sid, g]) => ({
          session_id: sid,
          answered_at: g.answered_at,
          total: g.total,
          correct: g.correct,
        }))
        .sort((a, b) => b.answered_at.localeCompare(a.answered_at));

      setSessionsMap(prev => ({ ...prev, [section]: sessions }));
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoadingSessions(null);
    }
  }

  function handleSectionClick(section: string) {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      loadSessions(section);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Session review mode
  if (reviewingSession) {
    return (
      <PoolSessionReview
        sessionId={reviewingSession.sessionId}
        section={reviewingSession.section}
        testType={testType}
        onClose={() => setReviewingSession(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="text-3xl text-brand-green animate-spin" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">No sections available for practice.</p>
        <p className="text-sm text-gray-400">Complete at least one Assessment Monotematico to unlock a section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
          <FontAwesomeIcon icon={faChartLine} className="text-brand-green" />
          Choose a Section
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
          Back
        </button>
      </div>

      {sections.map(section => {
        const prog = progressMap[section];
        const level = prog?.proficiency_level || 0;
        const isProficient = level >= 3;
        const accuracy = prog && prog.total_answered > 0
          ? Math.round((prog.total_correct / prog.total_answered) * 100)
          : null;
        const isExpanded = expandedSection === section;
        const sessions = sessionsMap[section] || [];
        const isLoadingSessions = loadingSessions === section;

        return (
          <div
            key={section}
            className={`rounded-xl border-2 transition-all ${
              isProficient
                ? 'border-green-300 bg-green-50'
                : isExpanded
                  ? 'border-brand-green bg-white'
                  : 'border-gray-200 bg-white hover:border-brand-green'
            }`}
          >
            {/* Section header */}
            <button
              onClick={() => handleSectionClick(section)}
              className="w-full p-4 text-left hover:bg-gray-50/50 transition-colors rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-brand-dark">{section}</span>
                    {isProficient && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                        <FontAwesomeIcon icon={faTrophy} />
                        Proficient
                      </span>
                    )}
                  </div>
                  {prog && (
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{prog.total_answered} answered</span>
                      {accuracy !== null && <span>{accuracy}% correct</span>}
                      {sessions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faHistory} className="text-[10px]" />
                          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(l => (
                      <FontAwesomeIcon
                        key={l}
                        icon={faStar}
                        className={`${level >= l ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <FontAwesomeIcon
                    icon={isExpanded ? faChevronUp : faChevronDown}
                    className="text-gray-400"
                  />
                </div>
              </div>
            </button>

            {/* Expanded section: start button + session history */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {/* Start practice button */}
                <button
                  onClick={() => onSelectSection(section)}
                  className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-lg font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Start Practice
                </button>

                {/* Session history */}
                {isLoadingSessions ? (
                  <div className="flex justify-center py-4">
                    <FontAwesomeIcon icon={faSpinner} className="text-gray-400 animate-spin" />
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Past Sessions
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {sessions.map(s => {
                        const pct = Math.round((s.correct / s.total) * 100);
                        return (
                          <button
                            key={s.session_id}
                            onClick={() => setReviewingSession({ sessionId: s.session_id, section })}
                            className="w-full flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          >
                            {/* Score circle */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                              pct >= 70
                                ? 'bg-green-500'
                                : pct >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}>
                              {pct}%
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-700">
                                {s.correct}/{s.total} correct
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(s.answered_at)}
                              </div>
                            </div>
                            <div className="flex gap-0.5 flex-shrink-0">
                              {Array.from({ length: s.total }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < s.correct ? 'bg-green-400' : 'bg-red-300'
                                  }`}
                                />
                              )).slice(0, 20)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center mt-3 italic">
                    No sessions yet — start your first practice!
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
