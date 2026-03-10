/**
 * PoolPractice Component
 * Unified pool practice: student picks question count (5/10/15/20),
 * then answers questions with a timer. Results shown at the end.
 *
 * Uses a streaming buffer: pre-load 3 questions, then pick ahead
 * while the student answers. Edge function calls are queued (max 1 at a time).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faSpinner,
  faCheck,
  faTimes,
  faTrophy,
  faRobot,
  faClock,
  faPlay,
  faBrain,
  faFlask,
  faCogs,
  faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import { MathJaxProvider } from '../MathJaxRenderer';
import { ResultQuestionCard } from './ResultQuestionCard';
import { MultipleChoiceQuestion } from '../questions/MultipleChoiceQuestion';
import { supabase } from '../../lib/supabase';
import { DesmosGraph } from './DesmosGraph';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ============================================================================
// TYPES
// ============================================================================

interface PoolQuestion {
  id: string;
  question_source: 'ai_pool' | '2v';
  isUnreviewedAi: boolean;
  question_data: {
    question_text: string;
    options: Record<string, string>;
    explanation?: string;
    passage_text?: string;
    image_url?: string;
    graph_description?: any;
  };
  answers: {
    correct_answer: string;
    wrong_answers: string[];
  };
  section: string;
}

interface PoolPracticeProps {
  studentId: string;
  testType: string;
  section: string;
  onClose: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COOLDOWN_DAYS = 7;
const BUFFER_TARGET = 4;

const QUESTION_OPTIONS = [
  { count: 5, label: 'Quick', color: 'from-emerald-400 to-emerald-600' },
  { count: 10, label: 'Short', color: 'from-blue-400 to-blue-600' },
  { count: 15, label: 'Medium', color: 'from-indigo-400 to-indigo-600' },
  { count: 20, label: 'Full', color: 'from-purple-400 to-purple-600' },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PoolPractice({ studentId, testType, section, onClose }: PoolPracticeProps) {
  // Phase & UI state
  const [phase, setPhase] = useState<'setup' | 'building' | 'answering' | 'results' | 'no_questions' | 'error'>('setup');
  const [questionCount, setQuestionCount] = useState(0);
  const [buildProgress, setBuildProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<PoolQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const [shownQuestions, setShownQuestions] = useState<PoolQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [buildStep, setBuildStep] = useState(0);

  // Refs
  const questionBuffer = useRef<PoolQuestion[]>([]);
  const pickChain = useRef<Promise<unknown>>(Promise.resolve());
  const totalPickedRef = useRef(0);
  const fillingBuffer = useRef(false);
  const currentQuestionRef = useRef<PoolQuestion | null>(null);
  const sessionSeenIds = useRef<Set<string>>(new Set());
  const questionCountRef = useRef(0);
  const questionStartTime = useRef<number>(Date.now());
  const initDone = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionId = useRef<string>(crypto.randomUUID());

  // ============================================================================
  // SETUP
  // ============================================================================

  function handleStartTest(count: number) {
    console.log(`[Pool] handleStartTest: count=${count}`);
    setQuestionCount(count);
    questionCountRef.current = count;
    setPhase('building');
  }

  // ============================================================================
  // QUESTION PICKING
  // ============================================================================

  const pickQuestion = useCallback(async (): Promise<PoolQuestion | null> => {
    console.log('[Pool] pickQuestion: starting...');
    const cooldownStart = new Date();
    cooldownStart.setDate(cooldownStart.getDate() - COOLDOWN_DAYS);
    const cutoff = cooldownStart.toISOString();

    const { data: poolCooldown } = await db
      .from('ai_pool_student_answers')
      .select('question_id, question_source')
      .eq('student_id', studentId)
      .gte('answered_at', cutoff);

    const { data: regularCooldown } = await supabase
      .from('2V_student_answers')
      .select('question_id')
      .eq('student_id', studentId)
      .gte('submitted_at', cutoff);

    // All 2V questions ever answered (for pool protection)
    const { data: allTimeAnswered } = await supabase
      .from('2V_student_answers')
      .select('question_id')
      .eq('student_id', studentId);

    const everAnswered2v = new Set<string>((allTimeAnswered || []).map(a => a.question_id));

    const cooldownPool2v = new Set<string>();
    const cooldownPoolAi = new Set<string>();

    (poolCooldown || []).forEach((a: any) => {
      if (a.question_source === '2v') cooldownPool2v.add(a.question_id);
      else cooldownPoolAi.add(a.question_id);
    });
    (regularCooldown || []).forEach(a => {
      cooldownPool2v.add(a.question_id);
    });

    const cur = currentQuestionRef.current;
    if (cur) {
      if (cur.question_source === '2v') cooldownPool2v.add(cur.id);
      else cooldownPoolAi.add(cur.id);
    }

    // Exclude questions in buffer
    const bufferSize = questionBuffer.current.length;
    questionBuffer.current.forEach(q => {
      if (q.question_source === '2v') cooldownPool2v.add(q.id);
      else cooldownPoolAi.add(q.id);
    });

    // Exclude all questions seen in this session
    sessionSeenIds.current.forEach(id => {
      cooldownPool2v.add(id);
      cooldownPoolAi.add(id);
    });

    console.log(`[Pool] pickQuestion: cooldown 2v=${cooldownPool2v.size} ai=${cooldownPoolAi.size} ever_answered_2v=${everAnswered2v.size} buffer_excluded=${bufferSize} session_seen=${sessionSeenIds.current.size} current_excluded=${cur ? cur.id.substring(0, 8) : 'none'}`);

    const { data: directQuestions } = await supabase
      .from('2V_questions')
      .select('id, question_data, answers, section')
      .eq('test_type', testType)
      .eq('question_type', 'multiple_choice')
      .eq('section', section)
      .eq('is_active', true);

    const { data: testsData } = await supabase
      .from('2V_tests')
      .select('id')
      .eq('test_type', testType);

    const testIds = (testsData || []).map((t: any) => t.id);
    let sharedQuestions: any[] = [];
    const relatedTestTypes = new Set<string>([testType]);
    if (testIds.length > 0) {
      const orFilter = testIds.map((id: string) => `additional_test_ids.cs.["${id}"]`).join(',');
      const { data: shared } = await supabase
        .from('2V_questions')
        .select('id, question_data, answers, section, test_type')
        .eq('question_type', 'multiple_choice')
        .eq('section', section)
        .eq('is_active', true)
        .neq('test_type', testType)
        .or(orFilter);
      sharedQuestions = shared || [];
      sharedQuestions.forEach((q: any) => {
        if (q.test_type) relatedTestTypes.add(q.test_type);
      });
    }

    const seenIds = new Set<string>();
    const allQuestions2v = [...(directQuestions || []), ...sharedQuestions].filter(q => {
      if (seenIds.has(q.id)) return false;
      seenIds.add(q.id);
      return true;
    });

    // Only include 2V questions the student has already answered in a test
    const allQuestions2vProtected = allQuestions2v.filter(q => everAnswered2v.has(q.id));
    const protectedCount = allQuestions2v.length - allQuestions2vProtected.length;
    if (protectedCount > 0) {
      console.log(`[Pool] pickQuestion: protected ${protectedCount} unanswered 2V questions from pool`);
    }

    const available2v: PoolQuestion[] = allQuestions2vProtected
      .filter(q => {
        if (cooldownPool2v.has(q.id)) return false;
        const qd = typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data;
        return qd?.question_text && qd?.options;
      })
      .map(q => {
        const qd = typeof q.question_data === 'string' ? JSON.parse(q.question_data) : q.question_data;
        const ans = typeof q.answers === 'string' ? JSON.parse(q.answers) : q.answers;
        return {
          id: q.id,
          question_source: '2v' as const,
          isUnreviewedAi: false,
          question_data: qd,
          answers: ans,
          section: q.section,
        };
      });

    // Only serve approved AI questions from the pool
    const { data: questionsAi } = await db
      .from('ai_pool_questions')
      .select('id, question_data, answers, section, review_status')
      .in('test_type', [...relatedTestTypes])
      .eq('section', section)
      .eq('is_active', true)
      .eq('review_status', 'approved');

    const availableAi: PoolQuestion[] = (questionsAi || [])
      .filter((q: any) => !cooldownPoolAi.has(q.id))
      .map((q: any) => ({
        id: q.id,
        question_source: 'ai_pool' as const,
        isUnreviewedAi: q.review_status === 'pending',
        question_data: q.question_data,
        answers: q.answers,
        section: q.section,
      }));

    const totalAvailable = available2v.length + availableAi.length;
    console.log(`[Pool] pickQuestion: available 2v=${available2v.length} ai=${availableAi.length} total=${totalAvailable}`);

    if (totalAvailable === 0) {
      console.log('[Pool] pickQuestion: no questions available, forcing AI generation');
      try {
        return await generateNewQuestion();
      } catch {
        return null;
      }
    }

    const roll = Math.random();

    if (roll < 0.15 && totalAvailable > 3) {
      console.log(`[Pool] pickQuestion: roll=${roll.toFixed(3)} → AI generation (15% chance)`);
      try {
        const generated = await generateNewQuestion();
        if (generated) return generated;
      } catch (genErr) {
        console.error('[Pool] pickQuestion: generation failed, falling back to existing:', genErr);
      }
    }

    if (roll < 0.25 && availableAi.length > 0) {
      const picked = availableAi[Math.floor(Math.random() * availableAi.length)];
      console.log(`[Pool] pickQuestion: roll=${roll.toFixed(3)} → existing AI id=${picked.id.substring(0, 8)}`);
      return picked;
    }

    if (available2v.length > 0) {
      const picked = available2v[Math.floor(Math.random() * available2v.length)];
      console.log(`[Pool] pickQuestion: roll=${roll.toFixed(3)} → 2V id=${picked.id.substring(0, 8)}`);
      return picked;
    }

    if (availableAi.length > 0) {
      const picked = availableAi[Math.floor(Math.random() * availableAi.length)];
      console.log(`[Pool] pickQuestion: roll=${roll.toFixed(3)} → AI fallback id=${picked.id.substring(0, 8)}`);
      return picked;
    }

    console.log('[Pool] pickQuestion: returning null (nothing available)');
    return null;
  }, [studentId, testType, section]);

  async function generateNewQuestion(): Promise<PoolQuestion | null> {
    console.log('[Pool] generateNewQuestion: calling edge function...');
    const t0 = Date.now();
    const { data, error } = await supabase.functions.invoke('generate-pool-question', {
      body: { test_type: testType, section },
    });

    if (error) {
      let msg = error.message;
      try {
        const errBody = await (error as any).context?.json?.();
        if (errBody?.error) msg = errBody.error;
      } catch { /* ignore */ }
      console.error(`[Pool] generateNewQuestion: FAILED after ${Date.now() - t0}ms — ${msg}`);
      throw new Error(msg);
    }

    if (!data?.success) {
      console.error(`[Pool] generateNewQuestion: FAILED after ${Date.now() - t0}ms — ${data?.error || 'unknown'}`);
      throw new Error(data?.error || 'Generation failed');
    }

    const q = data.question;
    console.log(`[Pool] generateNewQuestion: SUCCESS in ${Date.now() - t0}ms | id=${q.id.substring(0, 8)} topic=${q.question_data?.topic || 'n/a'}`);
    return {
      id: q.id,
      question_source: 'ai_pool',
      isUnreviewedAi: true,
      question_data: q.question_data,
      answers: q.answers,
      section: q.section,
    };
  }

  // ============================================================================
  // BUFFER & QUEUE MANAGEMENT
  // ============================================================================

  const enqueuePick = useCallback((): Promise<PoolQuestion | null> => {
    console.log(`[Pool] enqueuePick: queued (totalPicked=${totalPickedRef.current} buffer=${questionBuffer.current.length})`);
    return new Promise((resolve) => {
      pickChain.current = pickChain.current.then(async () => {
        if (totalPickedRef.current >= questionCountRef.current) {
          console.log(`[Pool] enqueuePick: SKIPPED — limit reached (${totalPickedRef.current}/${questionCountRef.current})`);
          resolve(null);
          return;
        }
        console.log(`[Pool] enqueuePick: EXECUTING pick #${totalPickedRef.current + 1}...`);
        try {
          const q = await pickQuestion();
          if (q) {
            totalPickedRef.current++;
            questionBuffer.current.push(q);
            sessionSeenIds.current.add(q.id);
            console.log(`[Pool] enqueuePick: DONE — ${q.question_source} id=${q.id.substring(0, 8)} | totalPicked=${totalPickedRef.current} buffer=${questionBuffer.current.length} session_seen=${sessionSeenIds.current.size}`);
          } else {
            console.log('[Pool] enqueuePick: DONE — null (no question available)');
          }
          resolve(q);
        } catch (err) {
          console.error('[Pool] enqueuePick: FAILED', err);
          resolve(null);
        }
      });
    });
  }, [pickQuestion]);

  const fillBuffer = useCallback(async () => {
    if (fillingBuffer.current) {
      console.log(`[Pool] fillBuffer: SKIPPED (already filling) buffer=${questionBuffer.current.length}`);
      return;
    }
    fillingBuffer.current = true;
    console.log(`[Pool] fillBuffer: START buffer=${questionBuffer.current.length}/${BUFFER_TARGET}`);
    let consecutiveFailures = 0;
    const MAX_FILL_FAILURES = 2;
    try {
      while (questionBuffer.current.length < BUFFER_TARGET) {
        if (totalPickedRef.current >= questionCountRef.current) {
          console.log('[Pool] fillBuffer: question limit reached, stopping');
          break;
        }
        const q = await enqueuePick();
        if (!q) {
          consecutiveFailures++;
          console.warn(`[Pool] fillBuffer: pick failed (${consecutiveFailures}/${MAX_FILL_FAILURES})`);
          if (consecutiveFailures >= MAX_FILL_FAILURES) {
            console.log('[Pool] fillBuffer: too many consecutive failures, stopping');
            break;
          }
        } else {
          consecutiveFailures = 0;
        }
      }
    } finally {
      fillingBuffer.current = false;
      console.log(`[Pool] fillBuffer: DONE buffer=${questionBuffer.current.length}/${BUFFER_TARGET}`);
    }
  }, [enqueuePick]);

  const showQuestion = useCallback((q: PoolQuestion) => {
    console.log(`[Pool] showQuestion: ${q.question_source} id=${q.id.substring(0, 8)} unreviewed=${q.isUnreviewedAi} | buffer_remaining=${questionBuffer.current.length} session_seen=${sessionSeenIds.current.size}`);
    sessionSeenIds.current.add(q.id);
    currentQuestionRef.current = q;
    setCurrentQuestion(q);
    setPhase('answering');
    setSelectedAnswer(undefined);
    questionStartTime.current = Date.now();
    setShownQuestions(prev => {
      const newLen = prev.length + 1;
      console.log(`[Pool] showQuestion: question ${newLen}/${questionCountRef.current}`);
      return [...prev, q];
    });
    // Start filling buffer immediately when showing a question
    fillBuffer();
  }, [fillBuffer]);

  // ============================================================================
  // ANSWER HANDLING
  // ============================================================================

  async function savePoolAnswer(question: PoolQuestion, answer: string | null, order: number) {
    const isCorrect = answer ? answer === question.answers.correct_answer : false;
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const row = {
      student_id: studentId,
      question_id: question.id,
      question_source: question.question_source,
      test_type: testType,
      section,
      selected_answer: answer,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
      session_id: sessionId.current,
      question_order: order,
    };
    const { error } = await db.from('ai_pool_student_answers').insert(row);
    if (error) {
      console.error('[Pool] savePoolAnswer FAILED', error);
    } else {
      console.log(`[Pool] savePoolAnswer OK: q=${question.id.substring(0, 8)} answer=${answer ?? 'SKIPPED'} correct=${isCorrect} time=${timeSpent}s order=${order}`);
    }
  }

  async function handleNext() {
    if (!currentQuestion) return;

    const answer = selectedAnswer || null;
    const correct = answer ? answer === currentQuestion.answers.correct_answer : false;
    const newAnswers = { ...answers };
    if (answer) {
      newAnswers[currentQuestion.id] = answer;
    }
    console.log(`[Pool] handleNext: answer=${answer ?? 'SKIP'} correct=${correct} | shown=${shownQuestions.length} answered=${Object.keys(newAnswers).length}/${questionCountRef.current}`);

    setAnswers(newAnswers);

    // Save answer (or skip) immediately
    savePoolAnswer(currentQuestion, answer, shownQuestions.length);

    // Check if we've hit the limit
    if (shownQuestions.length >= questionCountRef.current) {
      console.log('[Pool] handleNext: question limit reached → ending');
      handleEnd(newAnswers);
      return;
    }

    // Get next from buffer
    const bufSize = questionBuffer.current.length;
    const next = questionBuffer.current.shift();
    console.log(`[Pool] handleNext: buffer=${bufSize} → ${next ? `instant (${next.question_source} id=${next.id.substring(0, 8)})` : 'WAITING...'}`);

    if (next) {
      showQuestion(next);
      return;
    }

    // Buffer empty, wait for pick
    setLoadingNext(true);
    setCurrentQuestion(null);
    console.log('[Pool] handleNext: buffer empty, awaiting enqueuePick...');
    await enqueuePick();
    setLoadingNext(false);

    const fromBuf = questionBuffer.current.shift();
    if (fromBuf) {
      console.log(`[Pool] handleNext: got from queue — ${fromBuf.question_source} id=${fromBuf.id.substring(0, 8)}`);
      showQuestion(fromBuf);
    } else {
      console.log('[Pool] handleNext: no more questions → ending');
      handleEnd(newAnswers);
    }
  }

  async function handleEnd(finalAnswers?: Record<string, string>) {
    const allAnswers = { ...(finalAnswers || answers) };

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeRemaining(null);

    // Save current question if not yet saved (answered or skipped)
    if (currentQuestion && !allAnswers[currentQuestion.id]) {
      if (selectedAnswer) {
        allAnswers[currentQuestion.id] = selectedAnswer;
      }
      await savePoolAnswer(currentQuestion, selectedAnswer || null, shownQuestions.length);
    }
    setAnswers(allAnswers);
    setPhase('results');

    const totalAnswered = Object.keys(allAnswers).length;
    const totalCorrect = shownQuestions.filter(q => allAnswers[q.id] === q.answers.correct_answer).length;
    console.log(`[Pool] handleEnd: shown=${shownQuestions.length} answered=${totalAnswered} correct=${totalCorrect} session=${sessionId.current}`);

    // Update proficiency based on ALL ai_pool_student_answers for this section
    try {
      const { data: allPoolAnswers } = await db
        .from('ai_pool_student_answers')
        .select('is_correct')
        .eq('student_id', studentId)
        .eq('test_type', testType)
        .eq('section', section);

      const totalAns = (allPoolAnswers || []).length;
      const totalCor = (allPoolAnswers || []).filter((a: any) => a.is_correct).length;
      const pct = totalAns > 0 ? (totalCor / totalAns) * 100 : 0;

      // 0 stars: <50%, 1 star: 50-70%, 2 stars: 70-90%, 3 stars: >90%
      let level = 0;
      if (pct >= 90) level = 3;
      else if (pct >= 70) level = 2;
      else if (pct >= 50) level = 1;

      const statusMap: Record<number, string> = { 0: 'not_started', 1: 'struggling', 2: 'developing', 3: 'proficient' };

      const updateData = {
        proficiency_level: level,
        proficiency_status: statusMap[level],
        current_streak: 0,
        total_answered: totalAns,
        total_correct: totalCor,
        proficient_at: level >= 3 ? new Date().toISOString() : null,
      };

      const { data: progressData } = await db
        .from('ai_pool_student_progress')
        .select('id')
        .eq('student_id', studentId)
        .eq('test_type', testType)
        .eq('section', section)
        .maybeSingle();

      if (progressData) {
        await db.from('ai_pool_student_progress').update(updateData).eq('id', progressData.id);
      } else {
        await db.from('ai_pool_student_progress').insert({
          student_id: studentId,
          test_type: testType,
          section,
          ...updateData,
        });
      }
      console.log(`[Pool] handleEnd: proficiency updated — level=${level} (${pct.toFixed(0)}%) total=${totalAns} correct=${totalCor}`);
    } catch (err) {
      console.error('[Pool] handleEnd: proficiency update failed', err);
    }
  }

  // ============================================================================
  // INITIALIZATION (triggered when phase becomes 'building')
  // ============================================================================

  useEffect(() => {
    if (phase !== 'building' || initDone.current) return;
    initDone.current = true;

    async function init() {
      console.log('[Pool] ========== INIT ==========');
      console.log(`[Pool] init: section=${section} testType=${testType} count=${questionCountRef.current} studentId=${studentId.substring(0, 8)}`);

      try {
        // Calculate timer duration
        const { data: trackConfig } = await db
          .from('2V_test_track_config')
          .select('time_per_section, total_time_minutes')
          .eq('test_type', testType)
          .eq('track_type', 'assessment_monotematico')
          .maybeSingle();

        let durationMins = Math.ceil(questionCountRef.current * 1.5);
        if (trackConfig?.time_per_section) {
          const sectionTime = trackConfig.time_per_section[section];
          if (sectionTime) {
            const fullDuration = Number(sectionTime);
            durationMins = Math.max(Math.ceil((fullDuration / 20) * questionCountRef.current), 5);
          }
        }

        console.log(`[Pool] init: timer=${durationMins} minutes (${durationMins * 60}s)`);
        setTimeRemaining(durationMins * 60);

        // Pre-fill: load 2 questions then start, continue filling to BUFFER_TARGET in background
        const INIT_MIN = 2;
        const MAX_INIT_FAILURES = 3;
        console.log(`[Pool] init: pre-filling (show after ${INIT_MIN}, target=${BUFFER_TARGET})...`);
        let filled = 0;
        let failures = 0;
        while (filled < INIT_MIN && failures < MAX_INIT_FAILURES) {
          if (totalPickedRef.current >= questionCountRef.current) break;
          const q = await enqueuePick();
          if (q) {
            filled++;
            setBuildProgress(filled);
            console.log(`[Pool] init: pre-fill ${filled}/${INIT_MIN} → ${q.question_source} id=${q.id.substring(0, 8)} | buffer=${questionBuffer.current.length}`);
          } else {
            failures++;
            console.warn(`[Pool] init: pre-fill attempt failed (failure ${failures}/${MAX_INIT_FAILURES}), retrying...`);
          }
        }

        if (questionBuffer.current.length === 0) {
          console.log('[Pool] init: no questions available → no_questions phase');
          setPhase('no_questions');
          return;
        }

        // Show first question immediately
        const first = questionBuffer.current.shift()!;
        console.log(`[Pool] init: showing first question ${first.question_source} id=${first.id.substring(0, 8)}`);
        showQuestion(first);

        // Continue filling buffer to BUFFER_TARGET in background
        fillBuffer();
        console.log('[Pool] ========== INIT COMPLETE ==========');
      } catch (err) {
        console.error('[Pool] init: FATAL ERROR', err);
        setErrorMsg(err instanceof Error ? err.message : 'Failed to initialize');
        setPhase('error');
      }
    }
    init();
  }, [phase, enqueuePick, fillBuffer, showQuestion, testType, section, studentId]);

  // Timer countdown — pauses while loading next question
  useEffect(() => {
    if (timeRemaining === null || phase !== 'answering' || loadingNext) return;

    if (timeRemaining <= 0) {
      console.log('[Pool] timer: TIME UP → ending');
      handleEnd();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, timeRemaining === null, loadingNext]);

  // Rotate building status messages
  const BUILD_STEPS = [
    { icon: faCogs, text: 'Initializing test engine...' },
    { icon: faBookOpen, text: 'Analyzing your section...' },
    { icon: faBrain, text: 'Selecting questions...' },
    { icon: faFlask, text: 'Calibrating difficulty...' },
    { icon: faRobot, text: 'Almost ready...' },
  ];

  useEffect(() => {
    if (phase !== 'building') return;
    const interval = setInterval(() => {
      setBuildStep(prev => (prev + 1) % BUILD_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  // Auto-end when timer hits 0
  useEffect(() => {
    if (timeRemaining === 0 && phase === 'answering') {
      console.log('[Pool] timer: reached 0 → ending');
      handleEnd();
    }
  }, [timeRemaining]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Setup — question count picker
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8">
          <button
            onClick={onClose}
            className="mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1.5" />
            Back
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-brand-dark">{section}</h2>
            <p className="text-gray-500 mt-1">How many questions?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {QUESTION_OPTIONS.map(opt => (
              <button
                key={opt.count}
                onClick={() => handleStartTest(opt.count)}
                className="p-6 rounded-2xl border-2 border-gray-200 hover:border-brand-green bg-white hover:shadow-lg transition-all text-center group"
              >
                <div className={`w-14 h-14 mx-auto mb-3 bg-gradient-to-br ${opt.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl font-bold text-white">{opt.count}</span>
                </div>
                <div className="text-sm font-semibold text-gray-700">{opt.label}</div>
                <div className="text-xs text-gray-400 mt-1">~{Math.ceil(opt.count * 1.5)} min</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Building — animated loading while pre-filling buffer
  if (phase === 'building') {
    const currentStep = BUILD_STEPS[buildStep];
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-emerald-50 z-50 flex items-center justify-center">
        <div className="max-w-sm mx-auto text-center px-8">
          {/* Orbiting dots around icon */}
          <div className="relative w-32 h-32 mx-auto mb-10">
            {/* Outer ring pulse */}
            <div
              className="absolute inset-[-8px] rounded-full border-2 border-brand-green/20 animate-ping"
              style={{ animationDuration: '3s' }}
            />
            {/* Spinning ring */}
            <div
              className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-brand-green/40 border-r-brand-green/20 animate-spin"
              style={{ animationDuration: '2s' }}
            />
            {/* Main icon */}
            <div className="relative w-32 h-32 bg-gradient-to-br from-brand-green via-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-brand-green/25">
              <FontAwesomeIcon
                icon={currentStep.icon}
                className="text-4xl text-white transition-all duration-500"
                key={buildStep}
              />
            </div>
            {/* Floating particles */}
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-brand-green/40 rounded-full animate-bounce"
                style={{
                  top: `${20 + i * 25}%`,
                  left: i === 1 ? '-12px' : 'auto',
                  right: i !== 1 ? '-12px' : 'auto',
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold text-brand-dark mb-2">Setting up your test</h2>
          <p className="text-sm text-gray-400 mb-8">{section} · {questionCount} questions</p>

          {/* Rotating status message */}
          <div className="h-6 mb-8">
            <p
              className="text-sm font-medium text-brand-green/80 transition-all duration-500"
              key={buildStep}
            >
              {currentStep.text}
            </p>
          </div>

          {/* Animated progress bar */}
          <div className="w-full bg-gray-200/60 rounded-full h-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-green to-emerald-400 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((buildProgress / BUFFER_TARGET) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Loading next question (buffer empty)
  if (loadingNext && !currentQuestion) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-brand-green animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading next question...</p>
        </div>
      </div>
    );
  }

  // No questions available
  if (phase === 'no_questions') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <FontAwesomeIcon icon={faRobot} className="text-5xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-brand-dark mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-6">
            Not enough questions available right now. Try again later or choose a different section.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
        </div>
      </div>
    );
  }

  // Error
  if (phase === 'error') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <FontAwesomeIcon icon={faTimes} className="text-5xl text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
        </div>
      </div>
    );
  }

  // Results
  if (phase === 'results') {
    const totalAnswered = Object.keys(answers).length;
    const totalCorrect = shownQuestions.filter(q => answers[q.id] === q.answers.correct_answer).length;
    const percentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const totalQuestions = shownQuestions.length;

    return (
      <MathJaxProvider>
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full p-6 md:p-8">
            {/* Score summary */}
            <div className="text-center mb-8">
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg ${
                percentage >= 70
                  ? 'bg-gradient-to-br from-green-400 to-green-600'
                  : percentage >= 50
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                    : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}>
                <span className="text-3xl font-bold text-white">{percentage}%</span>
              </div>
              <h2 className="text-2xl font-bold text-brand-dark mb-1">Test Complete</h2>
              <p className="text-gray-600">{section}</p>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{totalAnswered - totalCorrect}</div>
                  <div className="text-xs text-gray-500">Wrong</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-400">{totalQuestions - totalAnswered}</div>
                  <div className="text-xs text-gray-500">Skipped</div>
                </div>
              </div>
            </div>

            {/* Question-by-question results with expandable details */}
            <div className="space-y-3 mb-6">
              {shownQuestions.map((q, i) => {
                const answered = answers[q.id];
                const correct = answered === q.answers.correct_answer;
                const skipped = !answered;
                return (
                  <ResultQuestionCard
                    key={q.id}
                    index={i + 1}
                    question={{
                      question_text: q.question_data.question_text,
                      options: q.question_data.options,
                      explanation: q.question_data.explanation,
                      correct_answer: q.answers.correct_answer,
                    }}
                    answered={answered}
                    correct={correct}
                    skipped={skipped}
                  />
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Tests
            </button>
          </div>
        </div>
      </MathJaxProvider>
    );
  }

  // Main answering view
  return (
    <MathJaxProvider>
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        {/* Header */}
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
                <h2 className="text-xl font-bold text-brand-dark">{section}</h2>
                {currentQuestion?.isUnreviewedAi && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
                    <FontAwesomeIcon icon={faRobot} className="text-[10px]" />
                    AI
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Question {shownQuestions.length}/{questionCount}
              </p>
            </div>
          </div>

          {/* Timer */}
          {timeRemaining !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
              timeRemaining <= 60
                ? 'bg-red-100 text-red-700 animate-pulse'
                : timeRemaining <= 300
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
            }`}>
              <FontAwesomeIcon icon={faClock} />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {currentQuestion?.question_data?.graph_description && (
              <div className="mb-6">
                <DesmosGraph
                  graphDescription={currentQuestion.question_data.graph_description}
                />
              </div>
            )}

            {currentQuestion && (
              <MultipleChoiceQuestion
                questionText={currentQuestion.question_data.question_text}
                passageText={currentQuestion.question_data.passage_text}
                imageUrl={currentQuestion.question_data.image_url || undefined}
                options={currentQuestion.question_data.options}
                selectedAnswer={selectedAnswer}
                onAnswerChange={(answer) => {
                  if (phase === 'answering') setSelectedAnswer(answer);
                }}
                readOnly={false}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t-2 border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {Object.keys(answers).length}/{questionCount} answered
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="px-6 py-3 bg-brand-green text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              {shownQuestions.length >= questionCount ? (
                <>
                  Finish
                  <FontAwesomeIcon icon={faCheck} className="ml-2" />
                </>
              ) : (
                <>
                  Next
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </MathJaxProvider>
  );
}
