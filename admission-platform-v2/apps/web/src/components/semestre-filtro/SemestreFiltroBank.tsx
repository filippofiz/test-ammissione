/**
 * SemestreFiltroBank — Course-like experience with Theory + Exercises
 *
 * Views:
 *  1. Overview — sections grouped by materia, with progress + lock/unlock
 *  2. Section Detail — theory blocks + exercises for one section
 *  3. Question Detail — full-screen question overlay
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSpinner,
  faCheck,
  faTimes,
  faSearch,
  faLock,
  faLockOpen,
  faBook,
  faBookOpen,
  faChevronDown,
  faChevronUp,
  faRedo,
  faGraduationCap,
  faPen,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { MathJaxProvider, MathJaxRenderer } from '../MathJaxRenderer';
import { MultipleChoiceQuestion } from '../questions/MultipleChoiceQuestion';
import { DesmosGraph } from '../pool/DesmosGraph';
import { MarkdownTheoryRenderer } from './MarkdownTheoryRenderer';
import { supabase } from '../../lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankQuestion {
  id: string;
  test_id: string;
  section: string;
  materia: string;
  topic: string;
  question_number: number;
  question_type: string;
  question_data: {
    question_text: string;
    options?: Record<string, string>;
    explanation?: string;
    passage_text?: string;
    image_url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graph_description?: any;
  };
  answers: {
    correct_answer: string;
    wrong_answers?: string[];
  };
}

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
}

interface StudentAnswer {
  question_id: string;
  answer: string;
  is_correct: boolean;
}

interface SectionInfo {
  section: string;
  materia: string;
  questions: BankQuestion[];
  theory: TheoryBlock[];
  topics: string[];
  isUnlocked: boolean;
  stats: {
    totalQuestions: number;
    answeredQuestions: number;
    correctQuestions: number;
    theoryTotal: number;
    theoryRead: number;
  };
}

type View = 'overview' | 'section' | 'question';
type FilterStatus = 'all' | 'unanswered' | 'correct' | 'incorrect';

interface SemestreFiltroBankProps {
  studentId: string;
  testType: string;
  mode?: 'tutor' | 'student';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function truncateLatex(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  let cut = maxLen;
  const prefix = text.substring(0, cut);
  const dollars = (prefix.match(/\$/g) || []).length;
  if (dollars % 2 === 1) {
    const nextDollar = text.indexOf('$', cut);
    if (nextDollar !== -1) cut = nextDollar + 1;
  }
  return text.substring(0, cut) + '...';
}

// Color palettes per materia (deterministic hash)
const PALETTES = [
  { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-400', bar: 'from-blue-500 to-cyan-400' },
  { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', ring: 'ring-purple-400', bar: 'from-purple-500 to-pink-400' },
  { gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-400', bar: 'from-emerald-500 to-green-400' },
  { gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'ring-orange-400', bar: 'from-orange-500 to-amber-400' },
  { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', ring: 'ring-red-400', bar: 'from-red-500 to-rose-400' },
  { gradient: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', ring: 'ring-teal-400', bar: 'from-teal-500 to-cyan-400' },
  { gradient: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-400', bar: 'from-indigo-500 to-violet-400' },
];

function getMateriaColor(materia: string) {
  let hash = 0;
  for (let i = 0; i < materia.length; i++) hash = materia.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

// SVG progress ring
function ProgressRing({ percent, size = 52, strokeWidth = 5, color = '#10b981' }: { percent: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="#e5e7eb" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke={color} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-700" />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        className="fill-gray-700 text-[11px] font-bold" transform={`rotate(90 ${size / 2} ${size / 2})`}>
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SemestreFiltroBank({ studentId, testType, mode = 'tutor' }: SemestreFiltroBankProps) {
  const [view, setView] = useState<View>('overview');
  const [loading, setLoading] = useState(true);

  // Data
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [theory, setTheory] = useState<TheoryBlock[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, StudentAnswer>>({});
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});
  const [theoryProgressSet, setTheoryProgressSet] = useState<Set<string>>(new Set());

  // Section detail
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTheory, setExpandedTheory] = useState<Set<string>>(new Set());
  const [theoryStep, setTheoryStep] = useState<Record<string, number>>({});

  // Exercise mode: full-screen test-like experience for a topic
  const [exerciseQuestions, setExerciseQuestions] = useState<BankQuestion[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseTopicTheory, setExerciseTopicTheory] = useState<TheoryBlock[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTheoryPanel, setShowTheoryPanel] = useState(false);

  // Lock/unlock
  const [togglingSection, setTogglingSection] = useState<string | null>(null);

  // ─── Load Data ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Core data: questions + student answers (always exist)
      const [questionsRes, answersRes] = await Promise.all([
        db.from('2V_questions')
          .select('id, test_id, section, materia, topic, question_number, question_type, question_data, answers')
          .eq('test_type', testType)
          .eq('question_type', 'multiple_choice')
          .eq('is_active', true)
          .order('section').order('question_number'),
        db.from('2V_student_answers')
          .select('question_id, answer')
          .eq('student_id', studentId),
      ]);

      const parsed: BankQuestion[] = (questionsRes.data || []).map((q: any) => ({
        ...q,
        question_data: typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data,
        answers: typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers,
      }));
      setQuestions(parsed);

      // Process answers
      const aMap: Record<string, StudentAnswer> = {};
      (answersRes.data || []).forEach((a: any) => {
        const answerVal = typeof a.answer === 'string' ? a.answer : a.answer?.selected;
        const q = parsed.find((qq: BankQuestion) => qq.id === a.question_id);
        if (q && answerVal) {
          aMap[a.question_id] = { question_id: a.question_id, answer: answerVal, is_correct: answerVal === q.answers.correct_answer };
        }
      });
      setAnswersMap(aMap);

      // Theory tables — query each independently so one failure doesn't block others
      let theoryData: TheoryBlock[] = [];
      let accMap: Record<string, boolean> = {};
      let progSet = new Set<string>();

      // Query theory (try both exact testType and uppercase variant for robustness)
      const theoryRes = await db.from('semestre_filtro_theory').select('*').eq('test_type', testType).eq('is_active', true).order('order_index');
      if (theoryRes.error) {
        console.warn('SemestreFiltro: theory query error', theoryRes.error);
        // Try uppercase variant in case of case mismatch
        const retryRes = await db.from('semestre_filtro_theory').select('*').eq('test_type', testType.toUpperCase()).eq('is_active', true).order('order_index');
        if (!retryRes.error) theoryData = retryRes.data || [];
      } else {
        theoryData = theoryRes.data || [];
        // If no results, try uppercase variant
        if (theoryData.length === 0 && testType !== testType.toUpperCase()) {
          const retryRes = await db.from('semestre_filtro_theory').select('*').eq('test_type', testType.toUpperCase()).eq('is_active', true).order('order_index');
          if (!retryRes.error && retryRes.data?.length) theoryData = retryRes.data;
        }
      }
      console.log('SemestreFiltro: loaded theory blocks:', theoryData.length, 'for testType:', testType);

      // Query access
      const accessRes = await db.from('semestre_filtro_access').select('section, is_unlocked').eq('student_id', studentId).eq('test_type', testType);
      if (accessRes.error) console.warn('SemestreFiltro: access query error', accessRes.error);
      else (accessRes.data || []).forEach((a: any) => { accMap[a.section] = a.is_unlocked; });

      // Query progress
      const progressRes = await db.from('semestre_filtro_theory_progress').select('theory_id').eq('student_id', studentId);
      if (progressRes.error) console.warn('SemestreFiltro: progress query error', progressRes.error);
      else progSet = new Set((progressRes.data || []).map((p: any) => p.theory_id));

      setTheory(theoryData);
      setAccessMap(accMap);
      setTheoryProgressSet(progSet);
    } catch (err) {
      console.error('SemestreFiltro: load error', err);
    } finally {
      setLoading(false);
    }
  }, [studentId, testType]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-expand matching theory blocks and jump to matching ## section when searching
  useEffect(() => {
    if (!searchQuery || view !== 'section' || !selectedSection) return;
    const sq = searchQuery.toLowerCase();
    const sectionTheory = theoryBlocks.filter(t => {
      const norm = (s: string) => s.replace(/''/g, "'").toLowerCase();
      return norm(t.section) === norm(selectedSection);
    });
    const sorted = [...sectionTheory].sort((a, b) => a.order_index - b.order_index);

    const idsToExpand: string[] = [];
    const stepsToSet: Record<string, number> = {};
    for (const t of sorted) {
      const text = (t.title + ' ' + (t.content_formatted || t.content_raw) + ' ' + (t.topic || '')).toLowerCase();
      if (!text.includes(sq)) continue;
      idsToExpand.push(t.id);
      // Find which ## section matches
      const content = t.content_formatted || t.content_raw;
      if (content) {
        const lines = content.split('\n');
        const secs: { title: string; content: string }[] = [];
        let curTitle = '', curLines: string[] = [];
        for (const line of lines) {
          const trimmed = line.trim();
          const h2 = trimmed.match(/^##\s+(.+)/);
          if (h2 && !trimmed.startsWith('###')) {
            if (curTitle || curLines.length) {
              const c = curLines.join('\n').trim();
              if (c) secs.push({ title: curTitle, content: c });
            }
            curTitle = h2[1].replace(/\*\*/g, '').trim();
            curLines = [];
          } else {
            curLines.push(line);
          }
        }
        if (curTitle || curLines.length) {
          const c = curLines.join('\n').trim();
          if (c) secs.push({ title: curTitle, content: c });
        }
        for (let idx = 0; idx < secs.length; idx++) {
          if ((secs[idx].title + ' ' + secs[idx].content).toLowerCase().includes(sq)) {
            stepsToSet[t.id] = idx;
            break;
          }
        }
      }
    }
    if (idsToExpand.length > 0) {
      setExpandedTheory(prev => {
        const next = new Set(prev);
        idsToExpand.forEach(id => next.add(id));
        return next;
      });
    }
    if (Object.keys(stepsToSet).length > 0) {
      setTheoryStep(prev => ({ ...prev, ...stepsToSet }));
    }
  }, [searchQuery, view, selectedSection, theoryBlocks]);

  // ─── Computed: sections info ──────────────────────────────────────────────

  const sectionsInfo = useMemo((): SectionInfo[] => {
    const sMap: Record<string, { questions: BankQuestion[]; materia: string; topics: Set<string> }> = {};
    questions.forEach(q => {
      if (!sMap[q.section]) sMap[q.section] = { questions: [], materia: q.materia || 'Altro', topics: new Set() };
      sMap[q.section].questions.push(q);
      if (q.topic) sMap[q.section].topics.add(q.topic);
    });

    if (theory.length > 0) {
      const theorySections = [...new Set(theory.map(t => t.section))];
      const questionSections = Object.keys(sMap);
      console.log('SemestreFiltro: theory sections:', theorySections);
      console.log('SemestreFiltro: question sections:', questionSections);
    }

    return Object.entries(sMap).map(([section, data]) => {
      // Match theory to section — normalize escaped apostrophes ('' → ') for comparison
      const normalize = (s: string) => s.replace(/''/g, "'").trim().toLowerCase();
      let sTheory = theory.filter(t => t.section === section);
      if (sTheory.length === 0 && theory.length > 0) {
        sTheory = theory.filter(t => normalize(t.section) === normalize(section));
      }
      const answered = data.questions.filter(q => answersMap[q.id]).length;
      const correct = data.questions.filter(q => answersMap[q.id]?.is_correct).length;
      const theoryRead = sTheory.filter(t => theoryProgressSet.has(t.id)).length;
      return {
        section,
        materia: data.materia,
        questions: data.questions,
        theory: sTheory,
        topics: [...data.topics].sort(),
        isUnlocked: accessMap[section] ?? (mode === 'tutor'),
        stats: { totalQuestions: data.questions.length, answeredQuestions: answered, correctQuestions: correct, theoryTotal: sTheory.length, theoryRead: theoryRead },
      };
    }).sort((a, b) => a.materia.localeCompare(b.materia) || a.section.localeCompare(b.section));
  }, [questions, theory, answersMap, accessMap, theoryProgressSet, mode]);

  // Group by materia
  const materiaGroups = useMemo(() => {
    const groups: Record<string, SectionInfo[]> = {};
    sectionsInfo.forEach(s => {
      if (!groups[s.materia]) groups[s.materia] = [];
      groups[s.materia].push(s);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [sectionsInfo]);

  // Overall stats
  const overallStats = useMemo(() => {
    const total = sectionsInfo.reduce((s, sec) => s + sec.stats.totalQuestions, 0);
    const answered = sectionsInfo.reduce((s, sec) => s + sec.stats.answeredQuestions, 0);
    const correct = sectionsInfo.reduce((s, sec) => s + sec.stats.correctQuestions, 0);
    const theoryTotal = sectionsInfo.reduce((s, sec) => s + sec.stats.theoryTotal, 0);
    const theoryRead = sectionsInfo.reduce((s, sec) => s + sec.stats.theoryRead, 0);
    return { total, answered, correct, theoryTotal, theoryRead };
  }, [sectionsInfo]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function openSection(section: string) {
    setActiveSection(section);
    setFilterStatus('all');
    setSearchQuery('');
    setExpandedTheory(new Set());
    setView('section');
  }

  // Start exercise mode for a set of questions (topic-level or section-level)
  function startExercises(qs: BankQuestion[], topicTheory: TheoryBlock[]) {
    setExerciseQuestions(qs);
    setExerciseTopicTheory(topicTheory);
    setExerciseIndex(0);
    setShowTheoryPanel(false);
    const existing = answersMap[qs[0]?.id];
    setSelectedAnswer(existing?.answer || undefined);
    setShowResult(!!existing);
    setView('question');
  }

  function closeExercises() {
    setExerciseQuestions([]);
    setExerciseIndex(0);
    setSelectedAnswer(undefined);
    setShowResult(false);
    setShowTheoryPanel(false);
    setView('section');
  }

  function goToQuestion(idx: number) {
    if (idx < 0 || idx >= exerciseQuestions.length) return;
    setExerciseIndex(idx);
    const q = exerciseQuestions[idx];
    const existing = answersMap[q.id];
    setSelectedAnswer(existing?.answer || undefined);
    setShowResult(!!existing);
  }

  async function handleSubmitAnswer() {
    const q = exerciseQuestions[exerciseIndex];
    if (!q || !selectedAnswer) return;
    setSaving(true);
    const isCorrect = selectedAnswer === q.answers.correct_answer;
    try {
      await db.from('2V_student_answers').upsert({
        student_id: studentId,
        question_id: q.id,
        answer: { selected: selectedAnswer },
        answered_at: new Date().toISOString(),
        attempt_number: 1,
      }, { onConflict: 'student_id,question_id,attempt_number' });
      setAnswersMap(prev => ({ ...prev, [q.id]: { question_id: q.id, answer: selectedAnswer, is_correct: isCorrect } }));
      setShowResult(true);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleRetry() {
    setSelectedAnswer(undefined);
    setShowResult(false);
  }

  function goNextUnanswered() {
    for (let i = exerciseIndex + 1; i < exerciseQuestions.length; i++) {
      if (!answersMap[exerciseQuestions[i].id]) { goToQuestion(i); return; }
    }
    for (let i = 0; i < exerciseIndex; i++) {
      if (!answersMap[exerciseQuestions[i].id]) { goToQuestion(i); return; }
    }
    // All answered — go to next question or stay
    if (exerciseIndex < exerciseQuestions.length - 1) goToQuestion(exerciseIndex + 1);
  }

  async function toggleSectionAccess(section: string, unlock: boolean) {
    setTogglingSection(section);
    try {
      await db.from('semestre_filtro_access').upsert({
        student_id: studentId,
        test_type: testType,
        section,
        is_unlocked: unlock,
        unlocked_at: unlock ? new Date().toISOString() : null,
        unlocked_by: unlock ? (await supabase.auth.getUser()).data.user?.id : null,
      }, { onConflict: 'student_id,test_type,section' });
      setAccessMap(prev => ({ ...prev, [section]: unlock }));
    } catch (err) {
      console.error('Toggle access error:', err);
    } finally {
      setTogglingSection(null);
    }
  }

  async function markTheoryRead(theoryId: string) {
    if (theoryProgressSet.has(theoryId)) return;
    try {
      await db.from('semestre_filtro_theory_progress').upsert({
        student_id: studentId,
        theory_id: theoryId,
      }, { onConflict: 'student_id,theory_id' });
      setTheoryProgressSet(prev => new Set(prev).add(theoryId));
    } catch (err) {
      console.error('Mark theory read error:', err);
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FontAwesomeIcon icon={faSpinner} className="text-3xl text-brand-green animate-spin" />
      </div>
    );
  }

  // ─── Exercise Mode View (full-screen test-taking + theory drawer) ────────

  if (view === 'question' && exerciseQuestions.length > 0) {
    const currentQ = exerciseQuestions[exerciseIndex];
    const isCorrect = selectedAnswer === currentQ?.answers.correct_answer;
    const answeredCount = exerciseQuestions.filter(q => answersMap[q.id]).length;

    return (
      <MathJaxProvider>
        <div className="fixed inset-0 bg-gray-50 z-50 flex">
          {/* Theory drawer (slides from left) */}
          {showTheoryPanel && exerciseTopicTheory.length > 0 && (
            <div className="w-[420px] flex-shrink-0 bg-white border-r-2 border-gray-200 flex flex-col h-full">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBook} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">Theory</h3>
                </div>
                <button onClick={() => setShowTheoryPanel(false)} className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {exerciseTopicTheory.map(block => {
                  const content = block.content_formatted || block.content_raw;
                  const isOpen = expandedTheory.has(block.id);
                  // Split into ## sections for the drawer
                  const drawerSections = (() => {
                    const lines = content.split('\n');
                    const secs: { title: string; content: string }[] = [];
                    let curTitle = '';
                    let curLines: string[] = [];
                    for (const line of lines) {
                      const trimmed = line.trim();
                      const h2 = trimmed.match(/^##\s+(.+)/);
                      if (h2 && !trimmed.startsWith('###')) {
                        if (curTitle || curLines.length > 0) {
                          const c = curLines.join('\n').trim();
                          if (c) secs.push({ title: curTitle, content: c });
                        }
                        curTitle = h2[1].replace(/\*\*/g, '').trim();
                        curLines = [];
                      } else {
                        curLines.push(line);
                      }
                    }
                    if (curTitle || curLines.length > 0) {
                      const c = curLines.join('\n').trim();
                      if (c) secs.push({ title: curTitle, content: c });
                    }
                    return secs.length > 1 ? secs : null; // null = no splitting needed
                  })();
                  const drawerStep = theoryStep[block.id] || 0;

                  return (
                    <div key={block.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => {
                        setExpandedTheory(prev => {
                          const next = new Set(prev);
                          if (next.has(block.id)) next.delete(block.id); else next.add(block.id);
                          return next;
                        });
                      }}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left text-sm"
                      >
                        <span className="font-semibold text-gray-900">{block.title}</span>
                        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-gray-400 text-xs" />
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100">
                          {drawerSections ? (
                            <>
                              {/* Section tabs */}
                              <div className="px-3 pt-3 flex gap-1 flex-wrap">
                                {drawerSections.map((sec, i) => (
                                  <button key={i}
                                    onClick={() => setTheoryStep(prev => ({ ...prev, [block.id]: i }))}
                                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                                      i === drawerStep
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}>
                                    {sec.title ? (sec.title.length > 20 ? sec.title.slice(0, 20) + '…' : sec.title) : `§${i + 1}`}
                                  </button>
                                ))}
                              </div>
                              {/* Current section */}
                              <div className="px-4 pb-3 pt-2">
                                {drawerSections[drawerStep]?.title && (
                                  <h4 className="text-sm font-bold text-gray-900 mb-2">{drawerSections[drawerStep].title}</h4>
                                )}
                                <MarkdownTheoryRenderer className="text-sm">{drawerSections[drawerStep]?.content || ''}</MarkdownTheoryRenderer>
                              </div>
                              {/* Nav */}
                              <div className="px-4 pb-3 flex items-center justify-between">
                                <button disabled={drawerStep === 0}
                                  onClick={() => setTheoryStep(prev => ({ ...prev, [block.id]: drawerStep - 1 }))}
                                  className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                  <FontAwesomeIcon icon={faArrowLeft} /> Prev
                                </button>
                                <span className="text-[10px] text-gray-400">{drawerStep + 1}/{drawerSections.length}</span>
                                <button disabled={drawerStep === drawerSections.length - 1}
                                  onClick={() => setTheoryStep(prev => ({ ...prev, [block.id]: drawerStep + 1 }))}
                                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                  Next <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="px-4 pb-4 mt-3">
                              <MarkdownTheoryRenderer>{content}</MarkdownTheoryRenderer>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main exercise area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={closeExercises} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-brand-dark">
                    {currentQ?.topic || currentQ?.section}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Question {exerciseIndex + 1} of {exerciseQuestions.length}
                    <span className="ml-2 text-gray-400">·</span>
                    <span className="ml-2 text-green-600 font-medium">{answeredCount} answered</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Theory toggle button */}
                {exerciseTopicTheory.length > 0 && (
                  <button onClick={() => setShowTheoryPanel(!showTheoryPanel)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      showTheoryPanel
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}>
                    <FontAwesomeIcon icon={faBook} />
                    Theory
                  </button>
                )}
                {/* Result badge */}
                {showResult && (
                  <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    <FontAwesomeIcon icon={isCorrect ? faCheck : faTimes} className="mr-1" />
                    {isCorrect ? 'Correct' : `Wrong — ${currentQ.answers.correct_answer.toUpperCase()}`}
                  </div>
                )}
              </div>
            </div>

            {/* Question content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0">
                  {currentQ.question_data.graph_description && (
                    <div className="mb-4"><DesmosGraph graphDescription={currentQ.question_data.graph_description} /></div>
                  )}
                  <MultipleChoiceQuestion
                    questionText={currentQ.question_data.question_text}
                    passageText={currentQ.question_data.passage_text}
                    imageUrl={currentQ.question_data.image_url || undefined}
                    options={currentQ.question_data.options || {}}
                    selectedAnswer={selectedAnswer}
                    onAnswerChange={(answer) => { if (!showResult) setSelectedAnswer(answer); }}
                    readOnly={showResult}
                    correctAnswer={showResult ? currentQ.answers.correct_answer : undefined}
                  />
                </div>
                {showResult && currentQ.question_data.explanation && (
                  <div className="lg:w-[420px] flex-shrink-0">
                    <div className="bg-blue-50/50 rounded-xl border-2 border-blue-200 p-6 lg:sticky lg:top-4">
                      <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">Explanation</h3>
                      <div className="text-[15px] text-gray-800 leading-[1.8] space-y-3">
                        <MathJaxRenderer>{addParagraphBreaks(currentQ.question_data.explanation)}</MathJaxRenderer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer — question dots + navigation */}
            <div className="bg-white border-t-2 border-gray-200 px-6 py-4">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                {/* Question dots */}
                <div className="flex gap-1 flex-wrap max-w-[60%]">
                  {exerciseQuestions.map((q, i) => {
                    const ans = answersMap[q.id];
                    return (
                      <button key={i} onClick={() => goToQuestion(i)}
                        className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                          i === exerciseIndex ? 'ring-2 ring-brand-green ring-offset-1' : ''
                        } ${
                          !ans ? 'bg-gray-200 text-gray-500'
                            : ans.is_correct ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  {showResult ? (
                    <>
                      <button onClick={handleRetry} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm">
                        <FontAwesomeIcon icon={faRedo} className="mr-1" /> Retry
                      </button>
                      <button onClick={goNextUnanswered} className="px-4 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-600 transition-all text-sm">
                        Next <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => goToQuestion(exerciseIndex - 1)} disabled={exerciseIndex === 0}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Prev
                      </button>
                      <button onClick={handleSubmitAnswer} disabled={!selectedAnswer || saving}
                        className="px-6 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm">
                        {saving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : 'Submit'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MathJaxProvider>
    );
  }

  // ─── Section Detail View ──────────────────────────────────────────────────

  if (view === 'section' && activeSection) {
    const sectionInfo = sectionsInfo.find(s => s.section === activeSection);
    if (!sectionInfo) { setView('overview'); return null; }

    const pal = getMateriaColor(sectionInfo.materia);
    const pct = sectionInfo.stats.totalQuestions > 0
      ? Math.round((sectionInfo.stats.correctQuestions / sectionInfo.stats.totalQuestions) * 100) : 0;

    // Filter questions (search checks question text + topic)
    const sq = searchQuery.toLowerCase();
    const filteredQs = sectionInfo.questions.filter(q => {
      if (filterStatus === 'unanswered' && answersMap[q.id]) return false;
      if (filterStatus === 'correct' && (!answersMap[q.id] || !answersMap[q.id].is_correct)) return false;
      if (filterStatus === 'incorrect' && (!answersMap[q.id] || answersMap[q.id].is_correct)) return false;
      if (sq) {
        const text = ((q.question_data.question_text || '') + ' ' + (q.topic || '')).toLowerCase();
        if (!text.includes(sq)) return false;
      }
      return true;
    });

    const sortedTheory = [...sectionInfo.theory].sort((a, b) => a.order_index - b.order_index);

    // When searching, auto-expand matching theory blocks and jump to matching section
    const theoryMatchesSearch = (t: TheoryBlock): boolean => {
      if (!sq) return true;
      const text = (t.title + ' ' + (t.content_formatted || t.content_raw) + ' ' + (t.topic || '')).toLowerCase();
      return text.includes(sq);
    };

    // Find which ## section inside a theory block matches the search
    const findMatchingSection = (block: TheoryBlock): number => {
      if (!sq) return -1;
      const content = block.content_formatted || block.content_raw;
      const sections = splitH2(content);
      for (let idx = 0; idx < sections.length; idx++) {
        const text = (sections[idx].title + ' ' + sections[idx].content).toLowerCase();
        if (text.includes(sq)) return idx;
      }
      return -1;
    };

    // ─── Split theory into ## sections ────────────────────────────────────
    const splitH2 = (text: string): { title: string; content: string }[] => {
      const lines = text.split('\n');
      const secs: { title: string; content: string }[] = [];
      let curTitle = '', curLines: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        const h2 = trimmed.match(/^##\s+(.+)/);
        if (h2 && !trimmed.startsWith('###')) {
          if (curTitle || curLines.length) {
            const c = curLines.join('\n').trim();
            if (c) secs.push({ title: curTitle, content: c });
          }
          curTitle = h2[1].replace(/\*\*/g, '').trim();
          curLines = [];
        } else {
          curLines.push(line);
        }
      }
      if (curTitle || curLines.length) {
        const c = curLines.join('\n').trim();
        if (c) secs.push({ title: curTitle, content: c });
      }
      return secs.length > 0 ? secs : [{ title: '', content: text }];
    };

    // ─── Match exercises to ## sections using theory topic field ─────────
    // The theory block's `topic` field lists topics in order (comma-separated).
    // We map each topic to a ## section by finding which section mentions it,
    // then assign exercises to the section their topic maps to.
    // Stem-aware includes: handles Italian inflection (stechiometria vs stechiometrici)
    const STOP_WORDS = new Set(['e', 'di', 'del', 'dei', 'della', 'delle', 'il', 'la', 'le', 'lo', 'gli', 'un', 'una', 'in', 'per', 'con', 'su', 'da', 'a']);
    const stemIncludes = (haystack: string, needle: string): boolean => {
      if (haystack.includes(needle)) return true;
      // Try shorter stems (trim up to 3 chars from end, min stem length 5)
      if (needle.length >= 6) {
        for (let len = needle.length - 1; len >= Math.max(5, needle.length - 3); len--) {
          if (haystack.includes(needle.slice(0, len))) return true;
        }
      }
      return false;
    };

    // Word-stem overlap: checks if significant words from needle appear in haystack
    const wordStemOverlap = (haystack: string, needle: string): boolean => {
      const needleWords = needle.split(/[\s,]+/).filter(w => w.length >= 3 && !STOP_WORDS.has(w));
      if (needleWords.length === 0) return false;
      const matched = needleWords.filter(w => stemIncludes(haystack, w));
      // At least 60% of significant words must match
      return matched.length >= Math.ceil(needleWords.length * 0.6);
    };

    const stemMatch = (a: string, b: string): boolean =>
      a === b || stemIncludes(a, b) || stemIncludes(b, a) || wordStemOverlap(a, b) || wordStemOverlap(b, a);

    const matchExercisesToSections = (
      secs: { title: string; content: string }[],
      qs: BankQuestion[],
      theoryTopicField: string | null
    ): { exercises: BankQuestion[] }[] => {
      const result = secs.map(() => ({ exercises: [] as BankQuestion[] }));
      if (secs.length <= 1) {
        result[0] = { exercises: [...qs] };
        return result;
      }

      // Step 1: Build topic → section index map from the theory's topic field
      const topicList = theoryTopicField
        ? theoryTopicField.split(',').map(t => t.replace(/''/g, "'").trim().toLowerCase())
        : [];

      const topicToSection = new Map<string, number>();
      const secTitles = secs.map(s => s.title.toLowerCase());
      for (const topic of topicList) {
        if (topicToSection.has(topic)) continue;
        let found = false;

        // Pass 1: Exact/stem substring on TITLE (highest precision)
        for (let i = 0; i < secs.length; i++) {
          if (stemIncludes(secTitles[i], topic) || stemIncludes(topic, secTitles[i])) {
            topicToSection.set(topic, i);
            found = true;
            break;
          }
        }
        if (found) continue;

        // Pass 2: Word-overlap on TITLE (for reworded titles like "Numeri quantici e orbitali" vs "Numeri Quantici, Orbitali e Principi")
        for (let i = 0; i < secs.length; i++) {
          if (wordStemOverlap(secTitles[i], topic)) {
            topicToSection.set(topic, i);
            found = true;
            break;
          }
        }
        if (found) continue;

        // Pass 3: Stem substring in full content (lowest priority)
        for (let i = 0; i < secs.length; i++) {
          const text = secTitles[i] + ' ' + secs[i].content.toLowerCase();
          if (stemIncludes(text, topic)) {
            topicToSection.set(topic, i);
            break;
          }
        }
      }

      // Step 2: For each exercise, find its section via topic mapping
      const assigned = new Set<string>();
      qs.forEach(q => {
        const qTopic = (q.topic || '').toLowerCase().trim();
        if (!qTopic) return;

        // Stem-aware match in our topic→section map
        for (const [mappedTopic, secIdx] of topicToSection) {
          if (stemMatch(mappedTopic, qTopic)) {
            result[secIdx].exercises.push(q);
            assigned.add(q.id);
            return;
          }
        }
      });

      // Unmatched → last section
      qs.forEach(q => {
        if (!assigned.has(q.id)) result[result.length - 1].exercises.push(q);
      });

      return result;
    };

    // ─── Render an exercise card ──────────────────────────────────────────
    const renderExerciseCard = (qs: BankQuestion[], theoryForDrawer: TheoryBlock[]) => {
      const answered = qs.filter(q => answersMap[q.id]).length;
      const correct = qs.filter(q => answersMap[q.id]?.is_correct).length;
      const pctDone = qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0;
      return (
        <div className={`rounded-xl border-2 overflow-hidden transition-all ${pal.border} ${pal.bg}`}>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pal.gradient} flex items-center justify-center`}>
                <FontAwesomeIcon icon={faGraduationCap} className="text-white text-sm" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800">
                  {qs.length} Exercise{qs.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="text-green-600 font-semibold">{correct} correct</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-red-500 font-semibold">{answered - correct} wrong</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-400">{qs.length - answered} left</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 bg-white/60 rounded-full h-1.5 hidden sm:block">
                <div className={`h-full rounded-full bg-gradient-to-r ${pal.bar} transition-all`}
                  style={{ width: `${pctDone}%` }} />
              </div>
              <button onClick={() => startExercises(qs, theoryForDrawer)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-gradient-to-r ${pal.gradient} text-white hover:shadow-md hover:scale-[1.02]`}>
                <FontAwesomeIcon icon={faGraduationCap} />
                {answered === 0 ? 'Start' : 'Continue'}
              </button>
            </div>
          </div>
          <div className="px-4 pb-3 flex gap-1 flex-wrap">
            {qs.map((q, i) => {
              const ans = answersMap[q.id];
              return (
                <div key={i} className={`w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center ${
                  !ans ? 'bg-white/60 text-gray-400'
                    : ans.is_correct ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-500'
                }`}>{i + 1}</div>
              );
            })}
          </div>
        </div>
      );
    };

    // ─── Render a theory block with stepper + integrated exercises ────────
    const renderTheoryBlock = (block: TheoryBlock, blockExercises: BankQuestion[]) => {
      const isRead = theoryProgressSet.has(block.id);
      const isOpen = expandedTheory.has(block.id);
      const content = block.content_formatted || block.content_raw;
      const sections = splitH2(content);
      const hasStepper = sections.length > 1;
      const exercisesBySec = hasStepper ? matchExercisesToSections(sections, blockExercises, block.topic) : [];
      const step = theoryStep[block.id] || 0;
      const clampedStep = Math.min(step, sections.length - 1);
      const currentSection = sections[clampedStep];
      const currentExercises = hasStepper ? (exercisesBySec[clampedStep]?.exercises || []) : blockExercises;
      const isSearchMatch = sq && theoryMatchesSearch(block);

      return (
        <div key={block.id} className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
          isSearchMatch ? 'border-indigo-400 ring-2 ring-indigo-100'
            : isRead ? 'border-green-200' : 'border-gray-200'
        }`}>
          {/* Header */}
          <button onClick={() => {
            setExpandedTheory(prev => {
              const next = new Set(prev);
              if (next.has(block.id)) next.delete(block.id); else next.add(block.id);
              return next;
            });
          }}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRead ? 'bg-green-100' : pal.bg}`}>
                <FontAwesomeIcon icon={isRead ? faCheck : faBookOpen} className={`text-sm ${isRead ? 'text-green-600' : pal.text}`} />
              </div>
              <div>
                <span className="font-semibold text-gray-900">{block.title}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {hasStepper && <span className="text-xs text-gray-400">{sections.length} sections</span>}
                  {blockExercises.length > 0 && (
                    <span className="text-xs text-gray-400">· {blockExercises.length} exercises</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isRead && <span className="text-xs text-green-600 font-semibold">Read</span>}
              <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-gray-400" />
            </div>
          </button>

          {isOpen && (
            <div className="border-t border-gray-100">
              {/* Stepper progress + tabs */}
              {hasStepper && (
                <div className="px-5 pt-4 pb-2">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div className={`h-full rounded-full bg-gradient-to-r ${pal.bar} transition-all duration-300`}
                      style={{ width: `${((clampedStep + 1) / sections.length) * 100}%` }} />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {sections.map((sec, i) => (
                      <button key={i} onClick={() => setTheoryStep(prev => ({ ...prev, [block.id]: i }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          i === clampedStep
                            ? `bg-gradient-to-r ${pal.gradient} text-white shadow-sm`
                            : i < clampedStep
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}>
                        {sec.title ? (sec.title.length > 25 ? sec.title.slice(0, 25) + '…' : sec.title) : `§ ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Theory content for current step */}
              <div className="px-5 pb-4">
                {hasStepper && currentSection.title && (
                  <h3 className="text-lg font-bold text-gray-900 mt-3 mb-3">{currentSection.title}</h3>
                )}
                <div className={hasStepper ? '' : 'mt-4'}>
                  <MarkdownTheoryRenderer>{currentSection.content}</MarkdownTheoryRenderer>
                </div>
              </div>

              {/* Exercises for current step (inline) */}
              {currentExercises.length > 0 && (
                <div className="px-5 pb-4">
                  {renderExerciseCard(currentExercises, [block])}
                </div>
              )}

              {/* Navigation */}
              {hasStepper && (
                <div className="px-5 pb-4 flex items-center justify-between">
                  <button
                    onClick={() => setTheoryStep(prev => ({ ...prev, [block.id]: Math.max(0, clampedStep - 1) }))}
                    disabled={clampedStep === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                  </button>
                  <span className="text-xs text-gray-400 font-medium">{clampedStep + 1} / {sections.length}</span>
                  {clampedStep < sections.length - 1 ? (
                    <button
                      onClick={() => setTheoryStep(prev => ({ ...prev, [block.id]: clampedStep + 1 }))}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r ${pal.gradient} text-white hover:shadow-md transition-all`}
                    >
                      Next <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  ) : !isRead ? (
                    <button onClick={() => markTheoryRead(block.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-all">
                      <FontAwesomeIcon icon={faCheck} /> Complete
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 px-4 py-2 text-green-600 text-sm font-semibold">
                      <FontAwesomeIcon icon={faCheck} /> Completed
                    </span>
                  )}
                </div>
              )}

              {/* Non-stepper: mark as read */}
              {!hasStepper && !isRead && (
                <div className="px-5 pb-4">
                  <button onClick={() => markTheoryRead(block.id)}
                    className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                    <FontAwesomeIcon icon={faCheck} className="mr-1" /> Mark as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <MathJaxProvider>
        {/* Section Header */}
        <div className={`${pal.bg} ${pal.border} border-2 rounded-2xl p-6 mb-6`}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView('overview')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to overview
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${pal.text} ${pal.bg} border ${pal.border}`}>
                {sectionInfo.materia}
              </span>
              <ProgressRing percent={pct} size={44} strokeWidth={4} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{sectionInfo.section}</h2>
          <p className="text-sm text-gray-600">
            {sectionInfo.stats.correctQuestions}/{sectionInfo.stats.totalQuestions} correct
            {sectionInfo.stats.theoryTotal > 0 && (
              <span> · {sectionInfo.stats.theoryRead}/{sectionInfo.stats.theoryTotal} theory read</span>
            )}
          </p>
        </div>

        {/* Search bar — searches theory + exercises */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search theory & exercises..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              )}
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="all">All exercises</option>
              <option value="unanswered">Unanswered</option>
              <option value="correct">Correct</option>
              <option value="incorrect">Incorrect</option>
            </select>
          </div>
          {searchQuery && (() => {
            const q = searchQuery.toLowerCase();
            const theoryHits = sortedTheory.filter(t => {
              const text = (t.title + ' ' + (t.content_formatted || t.content_raw) + ' ' + (t.topic || '')).toLowerCase();
              return text.includes(q);
            });
            const exerciseHits = sectionInfo.questions.filter(ex => {
              const text = ((ex.question_data.question_text || '') + ' ' + (ex.topic || '')).toLowerCase();
              return text.includes(q);
            });
            return (
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faBook} className="text-indigo-400" />
                  <strong className="text-indigo-600">{theoryHits.length}</strong> theory block{theoryHits.length !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-purple-400" />
                  <strong className="text-purple-600">{exerciseHits.length}</strong> exercise{exerciseHits.length !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Theory blocks with integrated exercises */}
        {(() => {
          // Distribute exercises across theory blocks using topic field
          const low = (s: string) => s.replace(/''/g, "'").trim().toLowerCase();
          const exercisesByBlock = new Map<string, BankQuestion[]>();
          sortedTheory.forEach(t => exercisesByBlock.set(t.id, []));
          const claimed = new Set<string>();

          filteredQs.forEach(q => {
            const qTopic = low(q.topic || '');
            for (const t of sortedTheory) {
              const parts = t.topic ? t.topic.split(',').map(p => low(p)) : [];
              const match = parts.some(p => stemMatch(p, qTopic));
              if (match) {
                exercisesByBlock.get(t.id)!.push(q);
                claimed.add(q.id);
                return;
              }
            }
          });
          const orphans = filteredQs.filter(q => !claimed.has(q.id));

          // When searching, filter theory blocks to only show matches
          const visibleTheory = sq
            ? sortedTheory.filter(t => theoryMatchesSearch(t) || (exercisesByBlock.get(t.id)?.length || 0) > 0)
            : sortedTheory;

          return visibleTheory.length === 0 && filteredQs.length === 0 ? (
            sq ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-3">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
                <p className="text-gray-500 font-medium">No results for "{searchQuery}"</p>
                <p className="text-gray-400 text-sm mt-1">Try a different keyword</p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">No content for this section yet.</div>
            )
          ) : (
            <div className="space-y-5">
              {visibleTheory.map(block =>
                renderTheoryBlock(block, exercisesByBlock.get(block.id) || [])
              )}

              {/* Orphan exercises */}
              {orphans.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${pal.bar}`} />
                    <h3 className="text-lg font-bold text-gray-900">Additional Exercises</h3>
                  </div>
                  {renderExerciseCard(orphans, sortedTheory)}
                </div>
              )}
            </div>
          );
        })()}
      </MathJaxProvider>
    );
  }

  // ─── Overview View ────────────────────────────────────────────────────────

  const exercisePct = overallStats.total > 0 ? Math.round((overallStats.correct / overallStats.total) * 100) : 0;

  return (
    <MathJaxProvider>
      {/* Overall stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ProgressRing percent={exercisePct} size={80} strokeWidth={7} />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-800">{overallStats.total}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total Exercises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{overallStats.correct}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{overallStats.answered - overallStats.correct}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{overallStats.total - overallStats.answered}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Remaining</div>
            </div>
          </div>
          {overallStats.theoryTotal > 0 && (
            <div className="text-center px-4 border-l border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{overallStats.theoryRead}/{overallStats.theoryTotal}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Theory Read</div>
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-green to-emerald-400 transition-all duration-700"
              style={{ width: `${overallStats.total > 0 ? (overallStats.answered / overallStats.total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Sections grouped by materia */}
      {materiaGroups.map(([materia, sections]) => {
        const pal = getMateriaColor(materia);
        return (
          <div key={materia} className="mb-8">
            {/* Materia header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pal.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {materia.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{materia}</h3>
                <p className="text-xs text-gray-500">{sections.length} section{sections.length !== 1 ? 's' : ''} · {sections.reduce((s, sec) => s + sec.stats.totalQuestions, 0)} exercises</p>
              </div>
            </div>

            {/* Section cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map(sec => {
                const secPct = sec.stats.totalQuestions > 0
                  ? Math.round((sec.stats.correctQuestions / sec.stats.totalQuestions) * 100) : 0;
                const isLocked = !sec.isUnlocked && mode === 'student';
                const isToggling = togglingSection === sec.section;

                return (
                  <div key={sec.section}
                    className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                      isLocked ? 'border-gray-200 opacity-60' : `${pal.border}`
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <h4 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">{sec.section}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{sec.stats.totalQuestions} exercises</span>
                            {sec.stats.theoryTotal > 0 && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span><FontAwesomeIcon icon={faBook} className="mr-0.5" /> {sec.stats.theoryTotal} theory</span>
                              </>
                            )}
                            <span className="text-gray-300">|</span>
                            <span>{sec.topics.length} topic{sec.topics.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <ProgressRing percent={secPct} size={48} strokeWidth={4} />
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                        <div className={`h-full rounded-full bg-gradient-to-r ${pal.bar} transition-all duration-500`}
                          style={{ width: `${sec.stats.totalQuestions > 0 ? (sec.stats.answeredQuestions / sec.stats.totalQuestions) * 100 : 0}%` }} />
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 text-xs mb-4">
                        <span className="text-green-600 font-semibold">{sec.stats.correctQuestions} correct</span>
                        <span className="text-red-500 font-semibold">{sec.stats.answeredQuestions - sec.stats.correctQuestions} wrong</span>
                        <span className="text-gray-400">{sec.stats.totalQuestions - sec.stats.answeredQuestions} left</span>
                      </div>

                      {/* Action row */}
                      <div className="flex items-center justify-between">
                        {mode === 'tutor' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSectionAccess(sec.section, !accessMap[sec.section]); }}
                            disabled={isToggling}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              accessMap[sec.section]
                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isToggling ? (
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                              <FontAwesomeIcon icon={accessMap[sec.section] ? faLockOpen : faLock} />
                            )}
                            {accessMap[sec.section] ? 'Unlocked' : 'Locked'}
                          </button>
                        )}
                        <button
                          onClick={() => !isLocked && openSection(sec.section)}
                          disabled={isLocked}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            isLocked
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : `bg-gradient-to-r ${pal.gradient} text-white hover:shadow-md hover:scale-[1.02]`
                          }`}
                        >
                          {isLocked ? (
                            <><FontAwesomeIcon icon={faLock} /> Locked</>
                          ) : (
                            <><FontAwesomeIcon icon={faGraduationCap} /> Open</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {sectionsInfo.length === 0 && (
        <div className="text-center py-16">
          <FontAwesomeIcon icon={faBook} className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No questions found for {testType}.</p>
        </div>
      )}
    </MathJaxProvider>
  );
}
