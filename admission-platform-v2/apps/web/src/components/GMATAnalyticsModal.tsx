/**
 * GMAT Analytics Modal Component
 * Full analytics view with tabbed navigation:
 * - Overview: progress stats, scores, strengths/weaknesses
 * - Time: per-question timing analysis, pacing, time vs accuracy
 * - Categories: performance by question type, section, difficulty
 * - Progress: score trends over time
 */

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faChartLine,
  faCheckCircle,
  faGraduationCap,
  faTrophy,
  faArrowUp,
  faArrowDown,
  faClipboardCheck,
  faQuestionCircle,
  faClock,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import {
  type GmatProgress,
  type GmatAssessmentResult,
  type TrainingCompletion,
  type GmatSection,
  type GmatAnalyticsData,
  calculateEstimatedGmatScore,
} from '../lib/api/gmat';

type AnalyticsTab = 'overview' | 'time' | 'categories' | 'progress';

interface GMATAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gmatProgress: GmatProgress | null;
  placementResult: GmatAssessmentResult | null;
  sectionAssessments: Record<GmatSection, GmatAssessmentResult | null>;
  mockSimulation: GmatAssessmentResult | null;
  trainingCompletions: Map<string, TrainingCompletion>;
  totalTrainingTests: number;
  embedded?: boolean;
  analyticsData?: GmatAnalyticsData | null;
}

// ============================================
// Helper: aggregate per-question data from all results
// ============================================
interface QuestionTimingEntry {
  questionId: string;
  timeSpent: number;
  isCorrect: boolean;
  section: string;
  difficulty: string;
  questionType: string;
  diType?: string;
  categories?: string[];
}

function aggregateQuestionData(
  analyticsData: GmatAnalyticsData
): QuestionTimingEntry[] {
  const entries: QuestionTimingEntry[] = [];
  for (const result of analyticsData.allResults) {
    if (!result.answers_data) continue;
    for (const [qid, answer] of Object.entries(result.answers_data)) {
      if (answer.is_unanswered) continue;
      const meta = analyticsData.questionMetadata.get(qid);
      entries.push({
        questionId: qid,
        timeSpent: answer.time_spent_seconds || 0,
        isCorrect: answer.is_correct,
        section: meta?.section || result.section || 'Unknown',
        difficulty: meta?.difficulty || 'medium',
        questionType: meta?.question_type || 'multiple_choice',
        diType: meta?.question_data?.di_type,
        categories: meta?.question_data?.categories,
      });
    }
  }
  return entries;
}

// ============================================
// Tab: Time Analysis
// ============================================
function TimeAnalysisTab({ analyticsData }: { analyticsData: GmatAnalyticsData }) {
  const entries = useMemo(() => aggregateQuestionData(analyticsData), [analyticsData]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FontAwesomeIcon icon={faClock} className="text-3xl text-gray-300 mb-3" />
        <p>No timing data available yet. Complete some tests to see your time analysis.</p>
      </div>
    );
  }

  // Overall average time per question
  const avgTime = Math.round(entries.reduce((s, e) => s + e.timeSpent, 0) / entries.length);

  // Average time by section
  const sectionTimeMap = new Map<string, { total: number; count: number }>();
  for (const e of entries) {
    const key = normalizeSectionLabel(e.section);
    const prev = sectionTimeMap.get(key) || { total: 0, count: 0 };
    sectionTimeMap.set(key, { total: prev.total + e.timeSpent, count: prev.count + 1 });
  }
  const sectionTimeData = Array.from(sectionTimeMap.entries())
    .map(([section, { total, count }]) => ({
      section,
      avgTime: Math.round(total / count),
      questions: count,
    }))
    .sort((a, b) => b.avgTime - a.avgTime);

  // Time distribution buckets
  const buckets = [
    { label: '0-30s', min: 0, max: 30 },
    { label: '30-60s', min: 30, max: 60 },
    { label: '60-90s', min: 60, max: 90 },
    { label: '90-120s', min: 90, max: 120 },
    { label: '120s+', min: 120, max: Infinity },
  ];
  const timeDistribution = buckets.map(b => {
    const inBucket = entries.filter(e => e.timeSpent >= b.min && e.timeSpent < b.max);
    const correct = inBucket.filter(e => e.isCorrect).length;
    return {
      bucket: b.label,
      count: inBucket.length,
      accuracy: inBucket.length > 0 ? Math.round((correct / inBucket.length) * 100) : 0,
    };
  });

  // Pacing: questions where student spent >2x average
  const slowQuestions = entries.filter(e => e.timeSpent > avgTime * 2).length;
  const fastQuestions = entries.filter(e => e.timeSpent < avgTime * 0.5).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <div className="text-sm font-medium text-blue-700 mb-1">Avg Time / Question</div>
          <div className="text-3xl font-bold text-blue-600">{avgTime}s</div>
          <div className="text-xs text-blue-500 mt-1">{entries.length} questions total</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center">
          <div className="text-sm font-medium text-amber-700 mb-1">Slow Questions</div>
          <div className="text-3xl font-bold text-amber-600">{slowQuestions}</div>
          <div className="text-xs text-amber-500 mt-1">&gt;{avgTime * 2}s (2x avg)</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
          <div className="text-sm font-medium text-emerald-700 mb-1">Quick Questions</div>
          <div className="text-3xl font-bold text-emerald-600">{fastQuestions}</div>
          <div className="text-xs text-emerald-500 mt-1">&lt;{Math.round(avgTime * 0.5)}s (half avg)</div>
        </div>
      </div>

      {/* Average time by section */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Average Time by Section</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sectionTimeData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" unit="s" />
            <YAxis type="category" dataKey="section" width={160} tick={{ fontSize: 12 }} />
            <Bar dataKey="avgTime" radius={[0, 4, 4, 0]}>
              {sectionTimeData.map((_, i) => (
                <Cell key={i} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5]} />
              ))}
              <LabelList dataKey="avgTime" position="right" formatter={(v) => `${v}s`} style={{ fontSize: 12, fontWeight: 600, fill: '#374151' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time distribution + accuracy */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Time Distribution & Accuracy</h4>
        <p className="text-xs text-gray-400 mb-4">How many questions fall in each time bucket, and accuracy within each</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={timeDistribution}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="count" orientation="left" label={{ value: 'Questions', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
            <YAxis yAxisId="accuracy" orientation="right" domain={[0, 100]} unit="%" label={{ value: 'Accuracy', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
            <Bar yAxisId="count" dataKey="count" fill="#93c5fd" name="Questions" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 600, fill: '#3b82f6' }} />
            </Bar>
            <Bar yAxisId="accuracy" dataKey="accuracy" fill="#34d399" name="Accuracy %" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="accuracy" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 600, fill: '#059669' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================
// Tab: Category Analysis
// ============================================
type CategorySortMode = 'count' | 'best' | 'worst';

function CategoryAnalysisTab({ analyticsData }: { analyticsData: GmatAnalyticsData }) {
  const entries = useMemo(() => aggregateQuestionData(analyticsData), [analyticsData]);
  const [groupBy, setGroupBy] = useState<'category' | 'section' | 'difficulty'>('category');
  const [sortBy, setSortBy] = useState<CategorySortMode>('worst');

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FontAwesomeIcon icon={faLayerGroup} className="text-3xl text-gray-300 mb-3" />
        <p>No category data available yet. Complete some tests to see your breakdown.</p>
      </div>
    );
  }

  // Group entries — for 'category' mode, a question with multiple categories counts in each
  const grouped = new Map<string, { correct: number; total: number; totalTime: number }>();

  function addToGroup(key: string, isCorrect: boolean, timeSpent: number) {
    const prev = grouped.get(key) || { correct: 0, total: 0, totalTime: 0 };
    grouped.set(key, {
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      totalTime: prev.totalTime + timeSpent,
    });
  }

  for (const e of entries) {
    if (groupBy === 'category') {
      // Use question_data.categories tags — each question may have multiple
      const cats = e.categories && e.categories.length > 0 ? e.categories : ['Uncategorized'];
      for (const cat of cats) {
        addToGroup(cat, e.isCorrect, e.timeSpent);
      }
    } else if (groupBy === 'section') {
      addToGroup(normalizeSectionLabel(e.section), e.isCorrect, e.timeSpent);
    } else {
      addToGroup(e.difficulty.charAt(0).toUpperCase() + e.difficulty.slice(1), e.isCorrect, e.timeSpent);
    }
  }

  const categoryData = Array.from(grouped.entries())
    .map(([name, stats]) => ({
      name: formatCategoryLabel(name),
      accuracy: Math.round((stats.correct / stats.total) * 100),
      count: stats.total,
      avgTime: Math.round(stats.totalTime / stats.total),
      correct: stats.correct,
    }))
    .sort((a, b) => {
      if (sortBy === 'best') return b.accuracy - a.accuracy;
      if (sortBy === 'worst') return a.accuracy - b.accuracy;
      return b.count - a.count; // 'count'
    });

  const colorForAccuracy = (acc: number) =>
    acc >= 70 ? '#10b981' : acc >= 50 ? '#f59e0b' : '#ef4444';

  const groupByLabels: Record<typeof groupBy, string> = {
    category: 'By Category',
    section: 'By Section',
    difficulty: 'By Difficulty',
  };

  const chartTitle: Record<typeof groupBy, string> = {
    category: 'Category',
    section: 'Section',
    difficulty: 'Difficulty',
  };

  const sortLabels: Record<CategorySortMode, string> = {
    worst: 'Worst First',
    best: 'Best First',
    count: 'Most Questions',
  };

  return (
    <div className="space-y-6">
      {/* Group-by selector + sort selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['category', 'section', 'difficulty'] as const).map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                groupBy === g
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {groupByLabels[g]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['worst', 'best', 'count'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                sortBy === s
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {sortLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Accuracy by {chartTitle[groupBy]}</h4>
        <ResponsiveContainer width="100%" height={Math.max(200, categoryData.length * 40)}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12 }} />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
              {categoryData.map((entry, i) => (
                <Cell key={i} fill={colorForAccuracy(entry.accuracy)} />
              ))}
              <LabelList dataKey="accuracy" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fontWeight: 600, fill: '#374151' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Category</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Questions</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Correct</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Accuracy</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Avg Time</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((cat, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                <td className="text-center px-4 py-3 text-gray-600">{cat.count}</td>
                <td className="text-center px-4 py-3 text-gray-600">{cat.correct}/{cat.count}</td>
                <td className="text-center px-4 py-3">
                  <span className={`font-bold ${
                    cat.accuracy >= 70 ? 'text-emerald-600' :
                    cat.accuracy >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {cat.accuracy}%
                  </span>
                </td>
                <td className="text-center px-4 py-3 text-gray-600">{cat.avgTime}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Tab: Progress Over Time
// ============================================
function ProgressTab({ analyticsData }: { analyticsData: GmatAnalyticsData }) {
  // Only use training and section_assessment results with a score
  const scoredResults = useMemo(() => {
    return analyticsData.allResults
      .filter(r =>
        (r.assessment_type === 'training' || r.assessment_type === 'section_assessment') &&
        r.completed_at &&
        r.score_percentage != null
      )
      .sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime());
  }, [analyticsData]);

  if (scoredResults.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FontAwesomeIcon icon={faChartLine} className="text-3xl text-gray-300 mb-3" />
        <p>Need at least 2 completed tests to show progress trends.</p>
        <p className="text-xs mt-1">{scoredResults.length} result{scoredResults.length !== 1 ? 's' : ''} so far</p>
      </div>
    );
  }

  // Score trend data points
  const trendData = scoredResults.map((r, i) => ({
    index: i + 1,
    date: new Date(r.completed_at!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    score: Math.round(r.score_percentage),
    type: r.assessment_type === 'training' ? 'Training' : `${r.section || ''} Assessment`,
  }));

  // Calculate improvement: average of first 3 vs last 3
  const firstN = scoredResults.slice(0, Math.min(3, Math.floor(scoredResults.length / 2)));
  const lastN = scoredResults.slice(-Math.min(3, Math.floor(scoredResults.length / 2)));
  const firstAvg = Math.round(firstN.reduce((s, r) => s + r.score_percentage, 0) / firstN.length);
  const lastAvg = Math.round(lastN.reduce((s, r) => s + r.score_percentage, 0) / lastN.length);
  const improvement = lastAvg - firstAvg;

  return (
    <div className="space-y-6">
      {/* Improvement summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <div className="text-sm font-medium text-blue-700 mb-1">First Tests Avg</div>
          <div className="text-3xl font-bold text-blue-600">{firstAvg}%</div>
          <div className="text-xs text-blue-500 mt-1">{firstN.length} test{firstN.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
          <div className="text-sm font-medium text-purple-700 mb-1">Recent Tests Avg</div>
          <div className="text-3xl font-bold text-purple-600">{lastAvg}%</div>
          <div className="text-xs text-purple-500 mt-1">{lastN.length} test{lastN.length !== 1 ? 's' : ''}</div>
        </div>
        <div className={`rounded-xl p-4 border text-center ${
          improvement > 0 ? 'bg-emerald-50 border-emerald-200' :
          improvement < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`text-sm font-medium mb-1 ${
            improvement > 0 ? 'text-emerald-700' : improvement < 0 ? 'text-red-700' : 'text-gray-700'
          }`}>Change</div>
          <div className={`text-3xl font-bold ${
            improvement > 0 ? 'text-emerald-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {improvement > 0 ? '+' : ''}{improvement}%
          </div>
          <div className={`text-xs mt-1 ${
            improvement > 0 ? 'text-emerald-500' : improvement < 0 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {improvement > 0 ? 'Improving' : improvement < 0 ? 'Declining' : 'Stable'}
          </div>
        </div>
      </div>

      {/* Score trend chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Score Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Score']}
              labelFormatter={(_: unknown, payload: unknown) => {
                const items = payload as Array<{ payload?: { type?: string; date?: string } }>;
                return items?.[0]?.payload ? `${items[0].payload.type} — ${items[0].payload.date}` : '';
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================
// Helpers
// ============================================
function normalizeSectionLabel(section: string): string {
  const s = section.toLowerCase();
  if (s.includes('quantitative') || s === 'qr') return 'Quantitative Reasoning';
  if (s.includes('data') || s === 'di') return 'Data Insights';
  if (s.includes('verbal') || s === 'vr') return 'Verbal Reasoning';
  return section;
}

function formatCategoryLabel(name: string): string {
  const labels: Record<string, string> = {
    multiple_choice: 'Multiple Choice',
    open_ended: 'Open Ended',
    DS: 'Data Sufficiency',
    MSR: 'Multi-Source Reasoning',
    GI: 'Graphical Interpretation',
    TA: 'Table Analysis',
    TPA: 'Two-Part Analysis',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  return labels[name] || name;
}

// ============================================
// Main Component
// ============================================
export function GMATAnalyticsModal({
  isOpen,
  onClose,
  gmatProgress,
  placementResult,
  sectionAssessments,
  mockSimulation,
  trainingCompletions,
  totalTrainingTests,
  embedded = false,
  analyticsData,
}: GMATAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');

  if (!isOpen) return null;

  // Calculate progress stats
  const completedTrainingTests = trainingCompletions.size;
  const trainingProgress = totalTrainingTests > 0
    ? Math.round((completedTrainingTests / totalTrainingTests) * 100)
    : 0;

  const completedAssessments = [
    sectionAssessments.QR,
    sectionAssessments.DI,
    sectionAssessments.VR,
  ].filter(Boolean).length;

  const questionsSeenCount = gmatProgress?.seen_question_ids?.length || 0;

  // Calculate estimated score if mock is completed
  const estimatedScore = mockSimulation
    ? calculateEstimatedGmatScore(mockSimulation.score_percentage)
    : null;

  // Calculate performance statistics
  const trainingScores = Array.from(trainingCompletions.values()).map(c => c.score_percentage);
  const averageTrainingScore = trainingScores.length > 0
    ? Math.round(trainingScores.reduce((a, b) => a + b, 0) / trainingScores.length)
    : null;

  // Use section assessments for accurate per-section performance
  const sectionScores: { section: string; score: number | null; irtScore: number | null; label: string }[] = [
    { section: 'QR', score: sectionAssessments.QR?.score_percentage ?? null, irtScore: sectionAssessments.QR?.metadata?.gmat_section_score ?? null, label: 'Quantitative Reasoning' },
    { section: 'DI', score: sectionAssessments.DI?.score_percentage ?? null, irtScore: sectionAssessments.DI?.metadata?.gmat_section_score ?? null, label: 'Data Insights' },
    { section: 'VR', score: sectionAssessments.VR?.score_percentage ?? null, irtScore: sectionAssessments.VR?.metadata?.gmat_section_score ?? null, label: 'Verbal Reasoning' },
  ];

  // Find strongest and weakest sections
  const completedSectionScores = sectionScores.filter(s => s.score !== null);
  const strongestSection = completedSectionScores.length > 0
    ? completedSectionScores.reduce((a, b) => (a.score! > b.score! ? a : b))
    : null;
  const weakestSection = completedSectionScores.length > 0
    ? completedSectionScores.reduce((a, b) => (a.score! < b.score! ? a : b))
    : null;

  // Check if enhanced data is available for advanced tabs
  const hasAnalyticsData = analyticsData && analyticsData.allResults.length > 0;

  // Tab definitions
  const tabs: { id: AnalyticsTab; label: string; icon: typeof faClock }[] = [
    { id: 'overview', label: 'Overview', icon: faChartLine },
    { id: 'time', label: 'Time', icon: faClock },
    { id: 'categories', label: 'Categories', icon: faLayerGroup },
    { id: 'progress', label: 'Progress', icon: faTrophy },
  ];

  // ---- Tab content rendering ----

  const overviewContent = (
    <div className="space-y-6">
      {/* Estimated GMAT Score - If Mock Completed */}
      {estimatedScore && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faGraduationCap} />
                <span className="text-sm font-medium opacity-90">Estimated GMAT Score</span>
              </div>
              <div className="text-5xl font-bold">{estimatedScore}</div>
              <p className="text-sm opacity-75 mt-2">Based on latest mock simulation</p>
            </div>
            {mockSimulation && (
              <div className="text-right">
                <div className="text-2xl font-bold opacity-90">
                  {mockSimulation.score_raw}/{mockSimulation.score_total}
                </div>
                <div className="text-sm opacity-75">Raw Score</div>
                <div className="text-lg font-semibold mt-1">
                  {mockSimulation.score_percentage.toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faClipboardCheck} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Training</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {completedTrainingTests}/{totalTrainingTests}
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Assessments</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {completedAssessments}/3
          </div>
          <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(completedAssessments / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Questions Seen</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {questionsSeenCount}
          </div>
          <div className="text-xs text-blue-500 mt-1">Unique questions</div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Simulation</span>
          </div>
          {mockSimulation ? (
            <>
              <div className="text-2xl font-bold text-indigo-600">
                {mockSimulation.score_percentage.toFixed(0)}%
              </div>
              <div className="text-xs text-indigo-500 mt-1">Completed</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-400">--</div>
              <div className="text-xs text-gray-400 mt-1">Not started</div>
            </>
          )}
        </div>
      </div>

      {/* Performance Analytics */}
      {(averageTrainingScore !== null || completedSectionScores.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faTrophy} className="text-amber-500" />
            Performance Analysis
          </h3>

          {averageTrainingScore !== null && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average Training Score</span>
                <span className={`text-3xl font-bold ${
                  averageTrainingScore >= 70 ? 'text-emerald-600' :
                  averageTrainingScore >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {averageTrainingScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    averageTrainingScore >= 70 ? 'bg-emerald-500' :
                    averageTrainingScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${averageTrainingScore}%` }}
                />
              </div>
            </div>
          )}

          {completedSectionScores.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Section Assessment Scores</h4>
              <div className="space-y-4">
                {sectionScores.map(({ section, score, irtScore, label }) => (
                  <div key={section} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-600">{label}</div>
                    <div className="flex-1">
                      {score !== null ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                score >= 70 ? 'bg-emerald-500' :
                                score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={`text-lg font-bold min-w-[4rem] text-right ${
                            score >= 70 ? 'text-emerald-600' :
                            score >= 50 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {Math.round(score)}%
                          </span>
                          {irtScore != null && (
                            <span className="text-sm font-bold text-indigo-600 min-w-[3rem] text-right" title="GMAT Section Score (60-90)">
                              {irtScore}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not taken yet</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {strongestSection && weakestSection && strongestSection.section !== weakestSection.section && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-2">
                  <FontAwesomeIcon icon={faArrowUp} />
                  Strongest Section
                </div>
                <div className="text-lg font-bold text-emerald-700">{strongestSection.label}</div>
                <div className="text-3xl font-bold text-emerald-600 mt-1">
                  {Math.round(strongestSection.score!)}%
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mb-2">
                  <FontAwesomeIcon icon={faArrowDown} />
                  Focus Area
                </div>
                <div className="text-lg font-bold text-amber-700">{weakestSection.label}</div>
                <div className="text-3xl font-bold text-amber-600 mt-1">
                  {Math.round(weakestSection.score!)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placement Assessment Info */}
      {placementResult && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Placement Assessment</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {placementResult.score_raw}/{placementResult.score_total}
                </div>
                <div className="text-xs text-gray-500">Raw Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {placementResult.score_percentage.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">Percentage</div>
              </div>
              {placementResult.suggested_cycle && (
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-700">
                    {placementResult.suggested_cycle}
                  </div>
                  <div className="text-xs text-gray-500">Suggested Cycle</div>
                </div>
              )}
            </div>
            {placementResult.completed_at && (
              <div className="text-sm text-gray-500">
                {new Date(placementResult.completed_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!averageTrainingScore && completedSectionScores.length === 0 && !mockSimulation && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faChartLine} className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analytics Data Yet</h3>
          <p className="text-gray-500 text-sm">
            Complete some training tests or section assessments to see your performance analytics.
          </p>
        </div>
      )}
    </div>
  );

  // Render active tab content
  const tabContent = (() => {
    switch (activeTab) {
      case 'overview':
        return overviewContent;
      case 'time':
        return hasAnalyticsData ? (
          <TimeAnalysisTab analyticsData={analyticsData!} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FontAwesomeIcon icon={faClock} className="text-3xl text-gray-300 mb-3" />
            <p>Loading analytics data...</p>
          </div>
        );
      case 'categories':
        return hasAnalyticsData ? (
          <CategoryAnalysisTab analyticsData={analyticsData!} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FontAwesomeIcon icon={faLayerGroup} className="text-3xl text-gray-300 mb-3" />
            <p>Loading analytics data...</p>
          </div>
        );
      case 'progress':
        return hasAnalyticsData ? (
          <ProgressTab analyticsData={analyticsData!} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FontAwesomeIcon icon={faChartLine} className="text-3xl text-gray-300 mb-3" />
            <p>Loading analytics data...</p>
          </div>
        );
    }
  })();

  // Tab navigation bar
  const tabBar = (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FontAwesomeIcon icon={tab.icon} className="text-xs" />
          {tab.label}
        </button>
      ))}
    </div>
  );

  // Full analytics content with tabs
  const analyticsContent = (
    <div className="space-y-6">
      {tabBar}
      {tabContent}
    </div>
  );

  // Embedded mode - render content directly without modal wrapper
  if (embedded) {
    return analyticsContent;
  }

  // Modal mode - render with modal wrapper
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="text-indigo-600 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">GMAT Analytics</h2>
              <p className="text-sm text-gray-500">Detailed performance breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {analyticsContent}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
