import { DemoStudentCard } from './DemoStudentCard';

interface Student {
  id: string;
  name: string;
  daysRemaining: number;
  progress: number;
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'none';
  testsCompleted: number;
  testsTotal: number;
  avgScore: number;
  trend: 'up' | 'down' | 'stable';
}

interface AnalyticsGridProps {
  students: Student[];
  visibleCount: number;
  highlightedId: string | null;
  animateProgress: boolean;
  sortLabel: string;
}

export function DemoAnalyticsGrid({ students, visibleCount, highlightedId, animateProgress, sortLabel }: AnalyticsGridProps) {
  const criticalCount = students.filter(s => s.urgency === 'critical').length;
  const avgProgress = Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length);

  return (
    <div className="max-w-5xl mx-auto space-y-3">
      {/* Header with summary */}
      <div className="demo-animate-fadeInUp bg-gradient-to-r from-[rgb(28,37,69)] to-[rgb(40,52,96)] rounded-xl p-4 text-white">
        <h1 className="text-lg font-bold mb-3">Student Analytics Dashboard</h1>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg p-2.5 text-center">
            <div className="text-2xl font-bold">{students.length}</div>
            <div className="text-[11px] text-blue-200">Total Students</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2.5 text-center">
            <div className="text-2xl font-bold text-red-300">{criticalCount}</div>
            <div className="text-[11px] text-blue-200">Need Attention</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2.5 text-center">
            <div className="text-2xl font-bold text-[#00a666]">{avgProgress}%</div>
            <div className="text-[11px] text-blue-200">Avg Progress</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2.5 text-center">
            <div className="text-2xl font-bold text-amber-300">{students.filter(s => s.daysRemaining <= 14).length}</div>
            <div className="text-[11px] text-blue-200">Test in 2 Weeks</div>
          </div>
        </div>
      </div>

      {/* Sort indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Students</h2>
        <div className="demo-animate-fadeIn flex items-center gap-2 bg-gray-100 rounded-lg px-2.5 py-1 text-xs text-gray-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          Sorted by: <span className="font-medium">{sortLabel}</span>
        </div>
      </div>

      {/* Student grid */}
      <div className="grid grid-cols-2 gap-3">
        {students.slice(0, visibleCount).map((student, i) => (
          <div key={student.id} style={{ animationDelay: `${i * 100}ms` }}>
            <DemoStudentCard
              name={student.name}
              daysRemaining={student.daysRemaining}
              progress={student.progress}
              urgency={student.urgency}
              testsCompleted={student.testsCompleted}
              testsTotal={student.testsTotal}
              avgScore={student.avgScore}
              trend={student.trend}
              isVisible={true}
              isHighlighted={student.id === highlightedId}
              animateProgress={animateProgress}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
