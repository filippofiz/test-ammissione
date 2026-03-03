interface Test {
  id: string;
  name: string;
  status: 'completed' | 'unlocked' | 'locked';
  score: number | null;
}

interface TestTrackProps {
  name: string;
  color: string;
  tests: Test[];
  progress: number;
  isVisible: boolean;
  animateProgress: boolean;
}

export function DemoTestTrack({ name, color, tests, progress, isVisible, animateProgress }: TestTrackProps) {
  if (!isVisible) return null;

  return (
    <div className="demo-animate-fadeInUp bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Track header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderLeft: `4px solid ${color}` }}>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{name}</h3>
          <p className="text-sm text-gray-400">{tests.filter(t => t.status === 'completed').length}/{tests.length} completed</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color }}>{animateProgress ? progress : 0}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[1500ms] ease-out"
            style={{
              width: animateProgress ? `${progress}%` : '0%',
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Tests */}
      <div className="px-5 pb-4 flex items-center gap-2 overflow-x-auto">
        {tests.map((test) => (
          <div
            key={test.id}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
              ${test.status === 'completed' ? 'border-green-300 bg-green-50 text-green-700' : ''}
              ${test.status === 'unlocked' ? 'border-blue-300 bg-blue-50 text-blue-700' : ''}
              ${test.status === 'locked' ? 'border-gray-200 bg-gray-50 text-gray-400' : ''}`}
          >
            {test.status === 'completed' && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
            {test.status === 'locked' && (
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            )}
            {test.status === 'unlocked' && (
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
            <span>{test.name}</span>
            {test.score !== null && (
              <span className="bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full font-bold">{test.score}%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
