import { DemoTestTrack } from './DemoTestTrack';
import { DemoCountdown } from './DemoCountdown';

interface Track {
  name: string;
  color: string;
  tests: { id: string; name: string; status: 'completed' | 'unlocked' | 'locked'; score: number | null }[];
  progress: number;
}

interface StudentDashboardProps {
  studentName: string;
  testDate: string;
  tracks: Track[];
  visibleTracks: number;
  animateProgress: boolean;
  showCountdown: boolean;
}

export function DemoStudentDashboard({
  studentName,
  testDate,
  tracks,
  visibleTracks,
  animateProgress,
  showCountdown,
}: StudentDashboardProps) {
  const totalCompleted = tracks.reduce((sum, t) => sum + t.tests.filter(x => x.status === 'completed').length, 0);
  const totalTests = tracks.reduce((sum, t) => sum + t.tests.length, 0);
  const overallProgress = Math.round((totalCompleted / totalTests) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {/* Welcome banner */}
      <div className="demo-animate-fadeInUp bg-gradient-to-r from-[rgb(28,37,69)] to-[rgb(40,52,96)] rounded-xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-xl font-bold mb-1">Welcome back, {studentName}!</h1>
          <p className="text-blue-200 text-sm">Your admission test preparation dashboard</p>

          <div className="mt-3 flex items-center gap-8">
            <div>
              <div className="text-xs text-blue-300 mb-1">Overall Progress</div>
              <div className="flex items-center gap-3">
                <div className="w-40 h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00a666] rounded-full transition-all duration-[2000ms] ease-out"
                    style={{ width: animateProgress ? `${overallProgress}%` : '0%' }}
                  />
                </div>
                <span className="text-lg font-bold">{animateProgress ? overallProgress : 0}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-blue-300 mb-1">Tests Completed</div>
              <div className="text-lg font-bold">{totalCompleted}/{totalTests}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {showCountdown && (
        <div className="demo-animate-fadeInUp bg-white rounded-xl shadow-lg border border-gray-100 p-3">
          <DemoCountdown targetDate={testDate} label="Time until your test" />
        </div>
      )}

      {/* Test tracks */}
      <div className="space-y-2">
        <h2 className="text-base font-bold text-gray-800">Your Test Tracks</h2>
        {tracks.map((track, i) => (
          <DemoTestTrack
            key={track.name}
            name={track.name}
            color={track.color}
            tests={track.tests}
            progress={track.progress}
            isVisible={i < visibleTracks}
            animateProgress={animateProgress}
          />
        ))}
      </div>
    </div>
  );
}
