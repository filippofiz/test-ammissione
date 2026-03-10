/**
 * TheoryManager — Admin/Tutor CRUD for Semestre Filtro theory blocks.
 *
 * Features:
 *  - List all theory blocks grouped by section
 *  - Create / edit / delete theory
 *  - "Format with AI" button (calls edge function)
 *  - Preview formatted content with MathJax
 *  - Auto-populates materia/section/topic from existing questions
 */

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSpinner,
  faTrash,
  faSave,
  faBook,
  faChevronDown,
  faChevronUp,
  faMagic,
  faEye,
  faPen,
  faTimes,
  faCheck,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { MathJaxProvider } from '../MathJaxRenderer';
import { MarkdownTheoryRenderer } from './MarkdownTheoryRenderer';
import { supabase } from '../../lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface TheoryBlock {
  id: string;
  test_type: string;
  materia: string;
  section: string;
  topic: string | null;
  title: string;
  content_raw: string;
  content_formatted: string | null;
  order_index: number;
  is_active: boolean;
}

interface SectionMeta {
  section: string;
  materia: string;
  topics: string[];
}

interface TheoryManagerProps {
  testType: string;
}

export function TheoryManager({ testType }: TheoryManagerProps) {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<TheoryBlock[]>([]);
  const [sectionsMeta, setSectionsMeta] = useState<SectionMeta[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Editor state
  const [editing, setEditing] = useState<TheoryBlock | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formMateria, setFormMateria] = useState('');
  const [formSection, setFormSection] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formRaw, setFormRaw] = useState('');
  const [formFormatted, setFormFormatted] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load existing theory blocks
      const { data: theoryData, error: theoryErr } = await db
        .from('semestre_filtro_theory')
        .select('*')
        .eq('test_type', testType)
        .order('section')
        .order('order_index');

      if (theoryErr) throw theoryErr;
      setBlocks(theoryData || []);

      // Load section/materia/topic metadata from questions
      const { data: questionsData } = await db
        .from('2V_questions')
        .select('section, materia, topic')
        .eq('test_type', testType)
        .eq('is_active', true);

      const metaMap: Record<string, { materia: string; topics: Set<string> }> = {};
      (questionsData || []).forEach((q: any) => {
        if (!metaMap[q.section]) metaMap[q.section] = { materia: q.materia || 'Altro', topics: new Set() };
        if (q.topic) metaMap[q.section].topics.add(q.topic);
      });

      setSectionsMeta(
        Object.entries(metaMap)
          .map(([section, data]) => ({ section, materia: data.materia, topics: [...data.topics].sort() }))
          .sort((a, b) => a.materia.localeCompare(b.materia) || a.section.localeCompare(b.section))
      );
    } catch (err) {
      console.error('TheoryManager load error:', err);
      setError('Failed to load theory data. Make sure the migration has been run.');
    } finally {
      setLoading(false);
    }
  }, [testType]);

  useEffect(() => { loadData(); }, [loadData]);

  // Get unique materias and sections for dropdowns
  const uniqueMaterias = [...new Set(sectionsMeta.map(s => s.materia))].sort();
  const sectionsForMateria = formMateria ? sectionsMeta.filter(s => s.materia === formMateria) : sectionsMeta;
  const topicsForSection = sectionsMeta.find(s => s.section === formSection)?.topics || [];

  // Group blocks by section
  const groupedBlocks: Record<string, TheoryBlock[]> = {};
  blocks.forEach(b => {
    if (!groupedBlocks[b.section]) groupedBlocks[b.section] = [];
    groupedBlocks[b.section].push(b);
  });

  function startNew() {
    setIsNew(true);
    setEditing(null);
    setFormMateria(uniqueMaterias[0] || '');
    setFormSection('');
    setFormTopic('');
    setFormTitle('');
    setFormRaw('');
    setFormFormatted('');
    setFormOrder(0);
    setPreviewMode(false);
    setError('');
  }

  function startEdit(block: TheoryBlock) {
    setIsNew(false);
    setEditing(block);
    setFormMateria(block.materia);
    setFormSection(block.section);
    setFormTopic(block.topic || '');
    setFormTitle(block.title);
    setFormRaw(block.content_raw);
    setFormFormatted(block.content_formatted || '');
    setFormOrder(block.order_index);
    setPreviewMode(false);
    setError('');
  }

  function cancelEdit() {
    setEditing(null);
    setIsNew(false);
    setError('');
  }

  async function handleSave() {
    if (!formTitle.trim() || !formSection.trim() || !formMateria.trim()) {
      setError('Title, materia, and section are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const payload = {
        test_type: testType,
        materia: formMateria,
        section: formSection,
        topic: formTopic || null,
        title: formTitle.trim(),
        content_raw: formRaw,
        content_formatted: formFormatted || null,
        order_index: formOrder,
        is_active: true,
      };

      if (isNew) {
        const { error: insertErr } = await db.from('semestre_filtro_theory').insert(payload);
        if (insertErr) throw insertErr;
      } else if (editing) {
        const { error: updateErr } = await db.from('semestre_filtro_theory').update(payload).eq('id', editing.id);
        if (updateErr) throw updateErr;
      }

      await loadData();
      cancelEdit();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error: delErr } = await db.from('semestre_filtro_theory').delete().eq('id', id);
      if (delErr) throw delErr;
      setBlocks(prev => prev.filter(b => b.id !== id));
      setDeleteConfirm(null);
      if (editing?.id === id) cancelEdit();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  async function handleFormatWithAI() {
    if (!formRaw.trim()) {
      setError('Write some raw content first.');
      return;
    }
    setFormatting(true);
    setError('');

    try {
      // Call Supabase edge function for AI formatting
      const { data, error: fnErr } = await supabase.functions.invoke('format-theory-content', {
        body: {
          content_raw: formRaw,
          materia: formMateria,
          section: formSection,
          topic: formTopic,
          title: formTitle,
        },
      });

      if (fnErr) throw fnErr;
      if (data?.content_formatted) {
        setFormFormatted(data.content_formatted);
        setPreviewMode(true);
      } else {
        setError('AI returned no formatted content.');
      }
    } catch (err: any) {
      console.error('AI format error:', err);
      // Fallback: just copy raw to formatted with basic markdown cleanup
      setError('AI formatting not available yet. You can manually format the content using markdown + LaTeX.');
      setFormFormatted(formRaw);
    } finally {
      setFormatting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FontAwesomeIcon icon={faSpinner} className="text-3xl text-brand-green animate-spin" />
      </div>
    );
  }

  // Editor panel (create or edit)
  const showEditor = isNew || editing;

  return (
    <MathJaxProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">Theory Content</h2>
            <p className="text-sm text-gray-500">{testType} · {blocks.length} block{blocks.length !== 1 ? 's' : ''}</p>
          </div>
          {!showEditor && (
            <button onClick={startNew}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm">
              <FontAwesomeIcon icon={faPlus} /> New Theory Block
            </button>
          )}
        </div>

        {/* Error */}
        {error && !showEditor && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {error}
          </div>
        )}

        {/* Editor */}
        {showEditor && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-brand-green/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-brand-dark">
                {isNew ? 'New Theory Block' : `Edit: ${editing?.title}`}
              </h3>
              <button onClick={cancelEdit} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Materia *</label>
                <select value={formMateria} onChange={(e) => { setFormMateria(e.target.value); setFormSection(''); setFormTopic(''); }}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  {uniqueMaterias.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Section *</label>
                <select value={formSection} onChange={(e) => { setFormSection(e.target.value); setFormTopic(''); }}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  {sectionsForMateria.map(s => <option key={s.section} value={s.section}>{s.section}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Topic (optional)</label>
                <select value={formTopic} onChange={(e) => setFormTopic(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Section-level (no topic)</option>
                  {topicsForSection.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Legge combinata dei gas"
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Order</label>
                <input type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            {/* Content editors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Raw content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-600">Raw Content</label>
                  <button onClick={handleFormatWithAI} disabled={formatting || !formRaw.trim()}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold hover:bg-purple-100 disabled:opacity-50 transition-colors">
                    {formatting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faMagic} />}
                    Format with AI
                  </button>
                </div>
                <textarea value={formRaw} onChange={(e) => setFormRaw(e.target.value)}
                  placeholder="Write your theory content here... rough notes, formulas, explanations. AI will format it."
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono h-64 resize-y" />
              </div>

              {/* Formatted content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-600">Formatted (Markdown + LaTeX)</label>
                  <button onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                    <FontAwesomeIcon icon={previewMode ? faPen : faEye} />
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {previewMode ? (
                  <div className="border rounded-lg px-4 py-3 h-64 overflow-y-auto bg-gray-50">
                    <MarkdownTheoryRenderer>{formFormatted || formRaw || 'Nothing to preview.'}</MarkdownTheoryRenderer>
                  </div>
                ) : (
                  <textarea value={formFormatted} onChange={(e) => setFormFormatted(e.target.value)}
                    placeholder="AI-formatted content will appear here. You can also edit manually using markdown + LaTeX ($...$, $$...$$)."
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono h-64 resize-y" />
                )}
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center justify-end gap-3">
              <button onClick={cancelEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all text-sm">
                {saving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSave} />}
                {isNew ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Existing blocks list */}
        {blocks.length === 0 && !showEditor ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <FontAwesomeIcon icon={faBook} className="text-5xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No theory blocks yet</p>
            <p className="text-gray-400 text-sm mb-6">Create theory content for each section. Students will see it alongside exercises.</p>
            <button onClick={startNew}
              className="px-6 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create First Block
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedBlocks).sort(([a], [b]) => a.localeCompare(b)).map(([section, sBlocks]) => {
              const isExpanded = expandedSections.has(section);
              const meta = sectionsMeta.find(s => s.section === section);
              return (
                <div key={section} className="bg-white rounded-xl shadow overflow-hidden">
                  <button onClick={() => {
                    setExpandedSections(prev => {
                      const next = new Set(prev);
                      if (next.has(section)) next.delete(section); else next.add(section);
                      return next;
                    });
                  }}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-gray-400 w-4" />
                      <div>
                        <span className="font-bold text-gray-900">{section}</span>
                        {meta && <span className="text-xs text-gray-400 ml-2">{meta.materia}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{sBlocks.length} block{sBlocks.length !== 1 ? 's' : ''}</span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {sBlocks.sort((a, b) => a.order_index - b.order_index).map(block => (
                        <div key={block.id} className="px-5 py-3 border-b border-gray-50 last:border-b-0 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800 text-sm">{block.title}</span>
                              {block.topic && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{block.topic}</span>}
                              {block.content_formatted ? (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded font-semibold">AI formatted</span>
                              ) : (
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-semibold">Raw only</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {(block.content_raw || '').substring(0, 100)}{block.content_raw.length > 100 ? '...' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            <button onClick={() => startEdit(block)}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors text-sm">
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            {deleteConfirm === block.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(block.id)}
                                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors text-sm">
                                  <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button onClick={() => setDeleteConfirm(null)}
                                  className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-sm">
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(block.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors text-sm">
                                <FontAwesomeIcon icon={faTrash} />
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
    </MathJaxProvider>
  );
}
