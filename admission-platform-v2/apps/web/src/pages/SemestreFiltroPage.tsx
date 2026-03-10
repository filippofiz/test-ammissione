/**
 * SemestreFiltroPage
 *
 * A question bank browser for "Semestre Filtro" assignments.
 * Shows ALL questions for the test type with filtering by section, status, etc.
 * Student can answer questions one by one and track progress.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSpinner,
  faCheck,
  faTimes,
  faFilter,
  faChevronDown,
  faChevronUp,
  faSearch,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { MathJaxProvider, MathJaxRenderer } from '../components/MathJaxRenderer';
import { MultipleChoiceQuestion } from '../components/questions/MultipleChoiceQuestion';
import { DesmosGraph } from '../components/pool/DesmosGraph';
import { supabase } from '../lib/supabase';

interface BankQuestion {
  id: string;
  test_id: string;
  section: string;
  question_number: number;
  question_type: string;
  question_data: {
    question_text: string;
    options?: Record<string, string>;
    explanation?: string;
    passage_text?: string;
    image_url?: string;
    graph_description?: any;
  };
  answers: {
    correct_answer: string;
    wrong_answers?: string[];
  };
}

interface StudentAnswer {
  question_id: string;
  answer: string;
  is_correct: boolean;
}

type FilterStatus = 'all' | 'unanswered' | 'correct' | 'incorrect';

// Insert paragraph breaks at sentence boundaries
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

// Truncate text without breaking LaTeX
function truncateLatex(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  let cut = maxLen;
  const prefix = text.substring(0, cut);
  const dollars = (prefix.match(/\$/g) || []).length;
  if (dollars % 2 === 1) {
    const nextDollar = text.indexOf('$', cut);
    if (nextDollar !== -1) cut = nextDollar + 1;
  }
  return text.substring(0, cut) + '…';
}

export default function SemestreFiltroPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  // Data
  const [loading, setLoading] = useState(true);
  const [testType, setTestType] = useState('');
  const [studentId, setStudentId] = useState('');
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, StudentAnswer>>({});
  const [sections, setSections] = useState<string[]>([]);

  // Filters
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Question detail
  const [activeQuestion, setActiveQuestion] = useState<BankQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load assignment + all questions + past answers
  const loadData = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);

    try {
      // 1. Load assignment to get test_type and student_id
      const { data: assignment, error: aErr } = await supabase
        .from('2V_test_assignments')
        .select(`
          id, student_id, current_attempt,
          2V_tests!inner (test_type, section, exercise_type)
        `)
        .eq('id', assignmentId)
        .single();

      if (aErr) throw aErr;
      const tType = (assignment as any)['2V_tests'].test_type;
      const sId = assignment.student_id;
      setTestType(tType);
      setStudentId(sId);

      // 2. Load ALL multiple_choice questions for this test_type
      const { data: allQuestions, error: qErr } = await supabase
        .from('2V_questions')
        .select('id, test_id, section, question_number, question_type, question_data, answers')
        .eq('test_type', tType)
        .eq('question_type', 'multiple_choice')
        .eq('is_active', true)
        .order('section', { ascending: true })
        .order('question_number', { ascending: true });

      if (qErr) throw qErr;

      const parsed: BankQuestion[] = (allQuestions || []).map((q: any) => ({
        ...q,
        question_data: typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data,
        answers: typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers,
      }));

      setQuestions(parsed);

      // Extract unique sections
      const secs = [...new Set(parsed.map(q => q.section))].sort();
      setSections(secs);

      // 3. Load student's past answers for this assignment
      const { data: pastAnswers } = await supabase
        .from('2V_student_answers')
        .select('question_id, answer')
        .eq('student_id', sId)
        .eq('assignment_id', assignmentId);

      const aMap: Record<string, StudentAnswer> = {};
      (pastAnswers || []).forEach((a: any) => {
        const answerVal = typeof a.answer === 'string' ? a.answer : a.answer?.selected;
        const q = parsed.find(qq => qq.id === a.question_id);
        if (q && answerVal) {
          aMap[a.question_id] = {
            question_id: a.question_id,
            answer: answerVal,
            is_correct: answerVal === q.answers.correct_answer,
          };
        }
      });
      setAnswersMap(aMap);
    } catch (err) {
      console.error('SemestreFiltro: load error', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter questions
  const filtered = questions.filter(q => {
    if (filterSection !== 'all' && q.section !== filterSection) return false;
    if (filterStatus === 'unanswered' && answersMap[q.id]) return false;
    if (filterStatus === 'correct' && (!answersMap[q.id] || !answersMap[q.id].is_correct)) return false;
    if (filterStatus === 'incorrect' && (!answersMap[q.id] || answersMap[q.id].is_correct)) return false;
    if (searchQuery) {
      const text = (q.question_data.question_text || '').toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  // Stats
  const totalQuestions = questions.length;
  const totalAnswered = Object.keys(answersMap).length;
  const totalCorrect = Object.values(answersMap).filter(a => a.is_correct).length;
  const totalIncorrect = totalAnswered - totalCorrect;
  const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Save answer
  async function handleSubmitAnswer() {
    if (!activeQuestion || !selectedAnswer || !assignmentId) return;
    setSaving(true);

    const isCorrect = selectedAnswer === activeQuestion.answers.correct_answer;

    try {
      // Upsert answer
      const { error } = await supabase
        .from('2V_student_answers')
        .upsert({
          student_id: studentId,
          assignment_id: assignmentId,
          question_id: activeQuestion.id,
          answer: { selected: selectedAnswer },
          answered_at: new Date().toISOString(),
          attempt_number: 1,
        }, { onConflict: 'student_id,assignment_id,question_id,attempt_number' });

      if (error) console.error('Save error:', error);

      // Update local state
      setAnswersMap(prev => ({
        ...prev,
        [activeQuestion.id]: {
          question_id: activeQuestion.id,
          answer: selectedAnswer,
          is_correct: isCorrect,
        },
      }));
      setShowResult(true);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSaving(false);
    }
  }

  // Open question
  function openQuestion(q: BankQuestion) {
    const existing = answersMap[q.id];
    setActiveQuestion(q);
    setSelectedAnswer(existing?.answer || undefined);
    setShowResult(!!existing);
  }

  // Close question detail
  function closeQuestion() {
    setActiveQuestion(null);
    setSelectedAnswer(undefined);
    setShowResult(false);
  }

  // Retry question
  function handleRetry() {
    setSelectedAnswer(undefined);
    setShowResult(false);
  }

  // Navigate to next unanswered
  function goNextUnanswered() {
    const currentIdx = activeQuestion ? filtered.indexOf(activeQuestion) : -1;
    for (let i = currentIdx + 1; i < filtered.length; i++) {
      if (!answersMap[filtered[i].id]) {
        openQuestion(filtered[i]);
        return;
      }
    }
    // Wrap around
    for (let i = 0; i < currentIdx; i++) {
      if (!answersMap[filtered[i].id]) {
        openQuestion(filtered[i]);
        return;
      }
    }
    closeQuestion();
  }

  if (loading) {
    return (
      <Layout pageTitle="Semestre Filtro">
        <div className="flex justify-center items-center py-20">
          <FontAwesomeIcon icon={faSpinner} className="text-3xl text-brand-green animate-spin" />
        </div>
      </Layout>
    );
  }

  // Question detail overlay
  if (activeQuestion) {
    const existing = answersMap[activeQuestion.id];
    const isCorrect = selectedAnswer === activeQuestion.answers.correct_answer;

    return (
      <MathJaxProvider>
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={closeQuestion} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-brand-dark">
                  {testType} — {activeQuestion.section}
                </h2>
                <p className="text-sm text-gray-500">Question #{activeQuestion.question_number}</p>
              </div>
            </div>
            {showResult && (
              <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                <FontAwesomeIcon icon={isCorrect ? faCheck : faTimes} className="mr-1" />
                {isCorrect ? 'Correct' : `Wrong — ${activeQuestion.answers.correct_answer.toUpperCase()}`}
              </div>
            )}
          </div>

          {/* Question content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0">
                {activeQuestion.question_data.graph_description && (
                  <div className="mb-4">
                    <DesmosGraph graphDescription={activeQuestion.question_data.graph_description} />
                  </div>
                )}

                <MultipleChoiceQuestion
                  questionText={activeQuestion.question_data.question_text}
                  passageText={activeQuestion.question_data.passage_text}
                  imageUrl={activeQuestion.question_data.image_url || undefined}
                  options={activeQuestion.question_data.options || {}}
                  selectedAnswer={selectedAnswer}
                  onAnswerChange={(answer) => {
                    if (!showResult) setSelectedAnswer(answer);
                  }}
                  readOnly={showResult}
                  correctAnswer={showResult ? activeQuestion.answers.correct_answer : undefined}
                />
              </div>

              {/* Explanation panel */}
              {showResult && activeQuestion.question_data.explanation && (
                <div className="lg:w-[480px] flex-shrink-0">
                  <div className="bg-blue-50/50 rounded-xl border-2 border-blue-200 p-6 lg:sticky lg:top-4">
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">Explanation</h3>
                    <div className="text-[15px] text-gray-800 leading-[1.8] space-y-3">
                      <MathJaxRenderer>{addParagraphBreaks(activeQuestion.question_data.explanation)}</MathJaxRenderer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white border-t-2 border-gray-200 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {totalAnswered}/{totalQuestions} answered · {totalCorrect} correct
              </div>
              <div className="flex items-center gap-2">
                {showResult ? (
                  <>
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
                    >
                      <FontAwesomeIcon icon={faRedo} className="mr-1" />
                      Retry
                    </button>
                    <button
                      onClick={goNextUnanswered}
                      className="px-4 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-600 transition-all text-sm"
                    >
                      Next Unanswered
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer || saving}
                    className="px-6 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    {saving ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                      <>
                        Submit
                        <FontAwesomeIcon icon={faCheck} className="ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </MathJaxProvider>
    );
  }

  // Main question bank view
  return (
    <Layout pageTitle={`${testType} — Semestre Filtro`}>
      <MathJaxProvider>
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-brand-dark">{testType} — Semestre Filtro</h1>
                <p className="text-gray-500 text-sm">Question bank — answer at your own pace</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
                <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-gray-300">
                <div className="text-2xl font-bold text-gray-500">{totalQuestions - totalAnswered}</div>
                <div className="text-sm text-gray-500">Unanswered</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-400">
                <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-400">
                <div className="text-2xl font-bold text-red-600">{totalIncorrect}</div>
                <div className="text-sm text-gray-500">Incorrect</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-brand-dark">{pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-brand-green to-emerald-500 transition-all duration-500"
                  style={{ width: `${totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <FontAwesomeIcon icon={faFilter} className="text-gray-400" />

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

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="border rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="unanswered">Unanswered</option>
                    <option value="correct">Correct</option>
                    <option value="incorrect">Incorrect</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-gray-500 mb-1">Search</label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search question text..."
                      className="w-full border rounded-lg pl-9 pr-3 py-1.5 text-sm"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-500 self-end pb-1">
                  {filtered.length} question{filtered.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Question list grouped by section */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No questions match your filters.
              </div>
            ) : (
              <QuestionList
                questions={filtered}
                answersMap={answersMap}
                onOpenQuestion={openQuestion}
              />
            )}
          </div>
        </div>
      </MathJaxProvider>
    </Layout>
  );
}

// Grouped question list component
function QuestionList({
  questions,
  answersMap,
  onOpenQuestion,
}: {
  questions: BankQuestion[];
  answersMap: Record<string, StudentAnswer>;
  onOpenQuestion: (q: BankQuestion) => void;
}) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Group by section
  const grouped: Record<string, BankQuestion[]> = {};
  questions.forEach(q => {
    if (!grouped[q.section]) grouped[q.section] = [];
    grouped[q.section].push(q);
  });

  function toggleSection(section: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([section, qs]) => {
        const isCollapsed = collapsedSections.has(section);
        const sectionAnswered = qs.filter(q => answersMap[q.id]).length;
        const sectionCorrect = qs.filter(q => answersMap[q.id]?.is_correct).length;

        return (
          <div key={section} className="bg-white rounded-xl shadow overflow-hidden">
            <button
              onClick={() => toggleSection(section)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={isCollapsed ? faChevronDown : faChevronUp}
                  className="text-gray-400 w-4"
                />
                <span className="font-semibold text-brand-dark">{section}</span>
                <span className="text-xs text-gray-400">
                  {qs.length} question{qs.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600 font-semibold">{sectionCorrect}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{sectionAnswered}</span>
                <span className="text-gray-400">of {qs.length}</span>
              </div>
            </button>

            {!isCollapsed && (
              <div className="border-t border-gray-100">
                {qs.map(q => {
                  const ans = answersMap[q.id];
                  const qText = q.question_data.question_text || '';
                  return (
                    <button
                      key={q.id}
                      onClick={() => onOpenQuestion(q)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                    >
                      {/* Status indicator */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                        !ans
                          ? 'bg-gray-100 text-gray-400'
                          : ans.is_correct
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                      }`}>
                        {!ans ? (
                          q.question_number
                        ) : (
                          <FontAwesomeIcon icon={ans.is_correct ? faCheck : faTimes} />
                        )}
                      </div>

                      {/* Question preview */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-700 truncate">
                          <MathJaxRenderer>{truncateLatex(qText, 100)}</MathJaxRenderer>
                        </div>
                      </div>

                      {/* Answer badge */}
                      {ans && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          ans.is_correct ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                        }`}>
                          {ans.answer.toUpperCase()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
