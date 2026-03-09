/**
 * Pool Review Page
 * Admin page to review, approve, and reject AI-generated pool questions
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSpinner,
  faCheck,
  faTimes,
  faRobot,
  faFilter,
  faChevronDown,
  faChevronRight,
  faEdit,
  faSave,
  faSync,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { MathJaxProvider, MathJaxRenderer } from '../components/MathJaxRenderer';
import { supabase } from '../lib/supabase';
import { DesmosGraph } from '../components/pool/DesmosGraph';

// Helper to query new tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Insert paragraph breaks at sentence boundaries for wall-of-text explanations
function addParagraphBreaks(text: string): string {
  if (!text || text.length < 200) return text;
  const mathBlocks: string[] = [];
  let processed = text
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; })
    .replace(/\$[^$\n]+?\$/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; })
    .replace(/\\\([\s\S]*?\\\)/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; });
  processed = processed.replace(/([.)]) ([A-ZÀÈÉÌÒÙ])/g, '$1\n$2');
  processed = processed.replace(/\uFFFE(\d+)\uFFFE/g, (_, i) => mathBlocks[parseInt(i)]);
  return processed;
}

// Truncate text without breaking LaTeX delimiters
function truncateLatex(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  let cut = maxLen;
  // Count open $ delimiters up to cut point — if odd, extend to close the expression
  const prefix = text.substring(0, cut);
  const dollars = (prefix.match(/\$/g) || []).length;
  if (dollars % 2 === 1) {
    const nextDollar = text.indexOf('$', cut);
    if (nextDollar !== -1) cut = nextDollar + 1;
  }
  return text.substring(0, cut) + '…';
}

interface PoolQuestion {
  id: string;
  test_type: string;
  section: string;
  materia: string | null;
  question_data: {
    question_text: string;
    options: Record<string, string>;
    explanation?: string;
    graph_description?: any;
  };
  answers: {
    correct_answer: string;
    wrong_answers: string[];
  };
  source: string;
  generation_model: string | null;
  generation_cost_usd: number | null;
  review_status: string;
  review_notes: string | null;
  is_active: boolean;
  created_at: string;
}

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all';

const POOL_ALLOWED_EMAIL = 'filippo.fiz@uptoten.it';

export default function PoolReviewPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PoolQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Gate access to filippo.fiz@uptoten.it only
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email !== POOL_ALLOWED_EMAIL) {
        setAccessDenied(true);
      }
    });
  }, []);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [filterTestType, setFilterTestType] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [testTypes, setTestTypes] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<PoolQuestion | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let query = db
        .from('ai_pool_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('review_status', filterStatus);
      }
      if (filterTestType !== 'all') {
        query = query.eq('test_type', filterTestType);
      }
      if (filterSection !== 'all') {
        query = query.eq('section', filterSection);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error loading pool questions:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterTestType, filterSection]);

  const loadStats = useCallback(async () => {
    try {
      const { data: all } = await db
        .from('ai_pool_questions')
        .select('review_status');

      if (all) {
        setStats({
          pending: all.filter((q: any) => q.review_status === 'pending').length,
          approved: all.filter((q: any) => q.review_status === 'approved').length,
          rejected: all.filter((q: any) => q.review_status === 'rejected').length,
          total: all.length,
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  const loadFilters = useCallback(async () => {
    try {
      const { data } = await db
        .from('ai_pool_questions')
        .select('test_type, section');

      if (data) {
        setTestTypes([...new Set(data.map((q: any) => q.test_type))] as string[]);
        setSections([...new Set(data.map((q: any) => q.section))] as string[]);
      }
    } catch (err) {
      console.error('Error loading filters:', err);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
    loadStats();
    loadFilters();
  }, [loadQuestions, loadStats, loadFilters]);

  async function handleApprove(questionId: string) {
    setActionLoading(questionId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('2V_profiles')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      const { error } = await db
        .from('ai_pool_questions')
        .update({
          review_status: 'approved',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      if (error) throw error;
      await loadQuestions();
      await loadStats();
    } catch (err) {
      console.error('Error approving question:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(questionId: string, notes?: string) {
    setActionLoading(questionId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('2V_profiles')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      const { error } = await db
        .from('ai_pool_questions')
        .update({
          review_status: 'rejected',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || 'Rejected by admin',
        })
        .eq('id', questionId);

      if (error) throw error;
      await loadQuestions();
      await loadStats();
    } catch (err) {
      console.error('Error rejecting question:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSaveEdit() {
    if (!editData || !editingId) return;
    setActionLoading(editingId);
    try {
      const { error } = await db
        .from('ai_pool_questions')
        .update({
          question_data: editData.question_data,
          answers: editData.answers,
        })
        .eq('id', editingId);

      if (error) throw error;
      setEditingId(null);
      setEditData(null);
      await loadQuestions();
    } catch (err) {
      console.error('Error saving edit:', err);
    } finally {
      setActionLoading(null);
    }
  }

  function startEdit(question: PoolQuestion) {
    setEditingId(question.id);
    setEditData(JSON.parse(JSON.stringify(question)));
  }

  if (accessDenied) {
    return (
      <Layout pageTitle="Access Denied">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">You don't have access to this page.</p>
            <button onClick={() => navigate('/admin')} className="text-brand-green hover:underline">
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Pool Question Review">
      <MathJaxProvider>
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-brand-dark">AI Pool Question Review</h1>
                <p className="text-gray-500 text-sm">Review, approve, or reject AI-generated practice questions</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-400">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-400">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-gray-500">Approved</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-400">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-500">Rejected</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <FontAwesomeIcon icon={faFilter} className="text-gray-400" />

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="border rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Test Type</label>
                  <select
                    value={filterTestType}
                    onChange={(e) => setFilterTestType(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="all">All</option>
                    {testTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Section</label>
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="all">All</option>
                    {sections.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => { loadQuestions(); loadStats(); }}
                  className="ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Refresh"
                >
                  <FontAwesomeIcon icon={faSync} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <FontAwesomeIcon icon={faSpinner} className="text-3xl text-brand-green animate-spin" />
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <FontAwesomeIcon icon={faRobot} className="text-5xl text-gray-300 mb-4" />
                <p className="text-gray-500">No questions found with current filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isExpanded={expandedId === q.id}
                    isEditing={editingId === q.id}
                    editData={editingId === q.id ? editData : null}
                    actionLoading={actionLoading === q.id}
                    onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    onApprove={() => handleApprove(q.id)}
                    onReject={(notes) => handleReject(q.id, notes)}
                    onStartEdit={() => startEdit(q)}
                    onCancelEdit={() => { setEditingId(null); setEditData(null); }}
                    onSaveEdit={handleSaveEdit}
                    onEditChange={setEditData}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </MathJaxProvider>
    </Layout>
  );
}

interface QuestionCardProps {
  question: PoolQuestion;
  isExpanded: boolean;
  isEditing: boolean;
  editData: PoolQuestion | null;
  actionLoading: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: (notes?: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (data: PoolQuestion) => void;
}

function QuestionCard({
  question,
  isExpanded,
  isEditing,
  editData,
  actionLoading,
  onToggle,
  onApprove,
  onReject,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditChange,
}: QuestionCardProps) {
  const [rejectNotes, setRejectNotes] = useState('');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  const qd = isEditing && editData ? editData.question_data : question.question_data;
  const ans = isEditing && editData ? editData.answers : question.answers;

  return (
    <div className={`bg-white rounded-xl shadow overflow-hidden border-l-4 ${
      question.review_status === 'pending' ? 'border-yellow-400' :
      question.review_status === 'approved' ? 'border-green-400' :
      'border-red-400'
    }`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <FontAwesomeIcon
          icon={isExpanded ? faChevronDown : faChevronRight}
          className="text-gray-400 w-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[question.review_status as keyof typeof statusColors] || ''}`}>
              {question.review_status}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {question.test_type}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              {question.section}
            </span>
            {question.source === 'ai_generated' && (
              <FontAwesomeIcon icon={faRobot} className="text-gray-400 text-xs" title="AI Generated" />
            )}
          </div>
          <div className="text-sm text-gray-700 mt-1 truncate">
            <MathJaxRenderer>{truncateLatex(qd.question_text || '', 120)}</MathJaxRenderer>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Graph */}
          {qd.graph_description && (
            <div className="mt-4 mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Graph</label>
              <DesmosGraph graphDescription={qd.graph_description} />
            </div>
          )}

          {/* Question Text */}
          <div className="mt-4 mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Question</label>
            {isEditing ? (
              <textarea
                value={editData?.question_data.question_text || ''}
                onChange={(e) => {
                  if (editData) {
                    onEditChange({
                      ...editData,
                      question_data: { ...editData.question_data, question_text: e.target.value },
                    });
                  }
                }}
                className="w-full border rounded-lg p-3 text-sm font-mono"
                rows={4}
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <MathJaxRenderer>{qd.question_text}</MathJaxRenderer>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Options</label>
            <div className="space-y-2">
              {Object.entries(qd.options || {}).map(([key, value]) => {
                const isCorrect = key === ans.correct_answer;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                      isCorrect ? 'bg-green-50 border border-green-300' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-gray-500'}`}>
                      {key})
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={(editData?.question_data.options?.[key] as string) || ''}
                        onChange={(e) => {
                          if (editData) {
                            onEditChange({
                              ...editData,
                              question_data: {
                                ...editData.question_data,
                                options: { ...editData.question_data.options, [key]: e.target.value },
                              },
                            });
                          }
                        }}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <MathJaxRenderer>{value as string}</MathJaxRenderer>
                    )}
                    {isCorrect && (
                      <FontAwesomeIcon icon={faCheck} className="text-green-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correct Answer Selector (editing mode) */}
          {isEditing && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Correct Answer</label>
              <select
                value={editData?.answers.correct_answer || ''}
                onChange={(e) => {
                  if (editData) {
                    const correct = e.target.value;
                    const allKeys = Object.keys(editData.question_data.options);
                    onEditChange({
                      ...editData,
                      answers: {
                        correct_answer: correct,
                        wrong_answers: allKeys.filter(k => k !== correct),
                      },
                    });
                  }
                }}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                {Object.keys(qd.options || {}).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          )}

          {/* Explanation */}
          {qd.explanation && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Explanation</label>
              <div className="bg-blue-50 rounded-lg p-4 text-[15px] text-blue-900 leading-[1.8] space-y-2">
                <MathJaxRenderer>{addParagraphBreaks(qd.explanation)}</MathJaxRenderer>
              </div>
            </div>
          )}

          {/* Review Notes */}
          {question.review_notes && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Review Notes</label>
              <div className="bg-orange-50 rounded-lg p-3 text-sm text-orange-800">
                {question.review_notes}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
            <span>Created: {new Date(question.created_at).toLocaleString()}</span>
            <span>Source: {question.source}</span>
            {question.generation_model && <span>Model: {question.generation_model}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            {isEditing ? (
              <>
                <button
                  onClick={onSaveEdit}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faSave} />
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {question.review_status === 'pending' && (
                  <>
                    <button
                      onClick={onApprove}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                      Approve
                    </button>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        placeholder="Rejection reason (optional)"
                        className="border rounded-lg px-3 py-2 text-sm w-48"
                      />
                      <button
                        onClick={() => { onReject(rejectNotes); setRejectNotes(''); }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Reject
                      </button>
                    </div>
                  </>
                )}
                <button
                  onClick={onStartEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
