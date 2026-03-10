import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faSpinner,
  faCheck,
  faTimes,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';
import { MathJaxProvider, MathJaxRenderer } from '../MathJaxRenderer';
import { MultipleChoiceQuestion } from '../questions/MultipleChoiceQuestion';
import { DesmosGraph } from './DesmosGraph';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface SessionAnswer {
  question_id: string;
  question_source: string;
  selected_answer: string | null;
  is_correct: boolean;
  time_spent_seconds: number;
  question_order: number;
  answered_at: string;
}

interface LoadedQuestion {
  question_data: {
    question_text: string;
    options: Record<string, string>;
    explanation?: string;
    passage_text?: string;
    image_url?: string;
    graph_description?: any;
  };
  correct_answer: string;
  answer: SessionAnswer;
}

interface PoolSessionReviewProps {
  sessionId: string;
  section: string;
  testType: string;
  onClose: () => void;
}

// Insert paragraph breaks at sentence boundaries for wall-of-text explanations
function addParagraphBreaks(text: string): string {
  if (!text || text.length < 200) return text;

  // Protect math expressions from being split
  const mathBlocks: string[] = [];
  let processed = text
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; })
    .replace(/\$[^$\n]+?\$/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; })
    .replace(/\\\([\s\S]*?\\\)/g, (m) => { mathBlocks.push(m); return `\uFFFE${mathBlocks.length - 1}\uFFFE`; });

  // Add paragraph breaks: period/closing-paren + space + capital letter (not already preceded by newline)
  processed = processed.replace(/([.)]) ([A-ZÀÈÉÌÒÙ])/g, '$1\n$2');

  // Restore math
  processed = processed.replace(/\uFFFE(\d+)\uFFFE/g, (_, i) => mathBlocks[parseInt(i)]);

  return processed;
}

export function PoolSessionReview({ sessionId, section, testType, onClose }: PoolSessionReviewProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');
  const [hideAnswers, setHideAnswers] = useState(false);
  const [revealedQuestions, setRevealedQuestions] = useState<Set<number>>(new Set());
  const [retryAnswers, setRetryAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  async function loadSession() {
    setLoading(true);
    try {
      const { data: answersData, error: answersErr } = await db
        .from('ai_pool_student_answers')
        .select('question_id, question_source, selected_answer, is_correct, time_spent_seconds, question_order, answered_at')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });

      if (answersErr) throw answersErr;
      if (!answersData || answersData.length === 0) {
        setError('No answers found for this session.');
        setLoading(false);
        return;
      }

      const answers = answersData as SessionAnswer[];

      const aiIds = answers.filter(a => a.question_source === 'ai_pool').map(a => a.question_id);
      const tvIds = answers.filter(a => a.question_source === '2v').map(a => a.question_id);

      const [aiResult, tvResult] = await Promise.all([
        aiIds.length > 0
          ? db.from('ai_pool_questions').select('id, question_data, answers').in('id', aiIds)
          : { data: [] },
        tvIds.length > 0
          ? supabase.from('2V_questions').select('id, question_data, answers').in('id', tvIds)
          : { data: [] },
      ]);

      const qMap: Record<string, { question_data: any; answers: any }> = {};
      ((aiResult.data || []) as any[]).forEach((q: any) => { qMap[q.id] = q; });
      ((tvResult.data || []) as any[]).forEach((q: any) => { qMap[q.id] = q; });

      const loaded: LoadedQuestion[] = answers
        .sort((a, b) => (a.question_order || 0) - (b.question_order || 0))
        .map(ans => {
          const q = qMap[ans.question_id];
          if (!q) return null;
          return {
            question_data: q.question_data,
            correct_answer: q.answers.correct_answer,
            answer: ans,
          };
        })
        .filter(Boolean) as LoadedQuestion[];

      setQuestions(loaded);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load session.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="text-3xl text-brand-green animate-spin" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">{error || 'No questions found.'}</p>
          <button onClick={onClose} className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-semibold">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />Back
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const totalCorrect = questions.filter(q => q.answer.is_correct).length;
  const totalAnswered = questions.filter(q => q.answer.selected_answer !== null).length;
  const sessionDate = questions[0]?.answer.answered_at;

  return (
    <MathJaxProvider>
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        {/* Header — same layout as test-taking */}
        <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-brand-dark">{testType} — {section}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                  Review
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Question {currentIndex + 1}/{questions.length}
                {sessionDate && (
                  <span className="ml-2 text-gray-400">
                    {new Date(sessionDate).toLocaleDateString('it-IT', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Hide/show answers toggle */}
            <button
              onClick={() => {
                setHideAnswers(!hideAnswers);
                setRevealedQuestions(new Set());
                setRetryAnswers({});
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                hideAnswers
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={hideAnswers ? faEyeSlash : faEye} />
              {hideAnswers ? 'Hidden' : 'Hide'}
            </button>
            <div className="text-sm text-gray-500">
              <span className="text-green-600 font-semibold">{totalCorrect}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{totalAnswered}</span>
            </div>
          </div>
        </div>

        {/* Question Area — side by side on desktop */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {(() => {
            const isHidden = hideAnswers && !revealedQuestions.has(currentIndex);
            return (
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
                {/* Left: question + options */}
                <div className="flex-1 min-w-0">
                  {/* Result badge — hidden until revealed */}
                  {!isHidden && (() => {
                    const retryAns = retryAnswers[currentIndex];
                    const shownAnswer = retryAns || current.answer.selected_answer;
                    const shownCorrect = shownAnswer === current.correct_answer;
                    return (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4 ${
                        !shownAnswer
                          ? 'bg-gray-100 text-gray-500'
                          : shownCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                      }`}>
                        {!shownAnswer ? (
                          <>Skipped</>
                        ) : shownCorrect ? (
                          <><FontAwesomeIcon icon={faCheck} /> Correct</>
                        ) : (
                          <><FontAwesomeIcon icon={faTimes} /> Wrong — correct: {current.correct_answer.toUpperCase()}</>
                        )}
                      </div>
                    );
                  })()}

                  {current.question_data.graph_description && (
                    <div className="mb-4">
                      <DesmosGraph graphDescription={current.question_data.graph_description} />
                    </div>
                  )}

                  <MultipleChoiceQuestion
                    questionText={current.question_data.question_text}
                    passageText={current.question_data.passage_text}
                    imageUrl={current.question_data.image_url || undefined}
                    options={current.question_data.options}
                    selectedAnswer={isHidden
                      ? (retryAnswers[currentIndex] || undefined)
                      : (retryAnswers[currentIndex] || current.answer.selected_answer || undefined)}
                    onAnswerChange={(answer) => {
                      if (isHidden) {
                        setRetryAnswers(prev => ({ ...prev, [currentIndex]: answer }));
                        setRevealedQuestions(prev => new Set(prev).add(currentIndex));
                      }
                    }}
                    readOnly={!isHidden}
                    correctAnswer={isHidden ? undefined : current.correct_answer}
                  />
                </div>

                {/* Right: explanation panel — hidden until revealed */}
                <div className="lg:w-[480px] flex-shrink-0">
                  {isHidden ? (
                    <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-6 lg:sticky lg:top-4 text-center">
                      <FontAwesomeIcon icon={faEyeSlash} className="text-2xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Select an answer to reveal</p>
                    </div>
                  ) : (
                    <div className="bg-blue-50/50 rounded-xl border-2 border-blue-200 p-6 lg:sticky lg:top-4">
                      <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">Explanation</h3>
                      {current.question_data.explanation ? (
                        <div className="text-[15px] text-gray-800 leading-[1.8] space-y-3 [&_.MathJax]:my-1">
                          <MathJaxRenderer>{addParagraphBreaks(current.question_data.explanation)}</MathJaxRenderer>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No explanation available for this question.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer — prev/next navigation */}
        <div className="bg-white border-t-2 border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Question dots */}
            <div className="flex gap-1 flex-wrap">
              {questions.map((q, i) => {
                const dotHidden = hideAnswers && !revealedQuestions.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                      i === currentIndex
                        ? 'ring-2 ring-brand-green ring-offset-1'
                        : ''
                    } ${
                      dotHidden
                        ? 'bg-gray-200 text-gray-500'
                        : q.answer.selected_answer === null
                          ? 'bg-gray-200 text-gray-500'
                          : q.answer.is_correct
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
                Prev
              </button>
              <button
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-4 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                Next
                <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MathJaxProvider>
  );
}
