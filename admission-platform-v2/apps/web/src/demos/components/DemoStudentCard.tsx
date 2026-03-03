interface StudentCardProps {
  name: string;
  daysRemaining: number;
  progress: number;
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'none';
  testsCompleted: number;
  testsTotal: number;
  avgScore: number;
  trend: 'up' | 'down' | 'stable';
  isVisible: boolean;
  isHighlighted: boolean;
  animateProgress: boolean;
}

const URGENCY_CONFIG = {
  critical: { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-500', text: 'text-red-700', label: 'CRITICAL' },
  high: { bg: 'bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-500', text: 'text-orange-700', label: 'HIGH' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-300', badge: 'bg-amber-500', text: 'text-amber-700', label: 'MEDIUM' },
  low: { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-500', text: 'text-green-700', label: 'LOW' },
  none: { bg: 'bg-gray-50', border: 'border-gray-300', badge: 'bg-gray-500', text: 'text-gray-700', label: 'NONE' },
};

export function DemoStudentCard({
  name, daysRemaining, progress, urgency, testsCompleted, testsTotal, avgScore, trend, isVisible, isHighlighted, animateProgress,
}: StudentCardProps) {
  if (!isVisible) return null;

  const config = URGENCY_CONFIG[urgency];
  const trendIcon = trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192';
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <div
      className={`demo-animate-fadeInUp ${config.bg} border-2 ${config.border} rounded-xl p-5 transition-all duration-500
        ${isHighlighted ? 'ring-4 ring-[#00a666]/30 scale-[1.02] shadow-xl' : 'shadow-md'}
        ${urgency === 'critical' ? 'demo-animate-pulseGlow' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`${config.badge} text-white text-[10px] px-2 py-0.5 rounded-full font-bold`}>
              {config.label}
            </span>
            <span className="text-sm text-gray-500">{daysRemaining} days remaining</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${config.text} demo-score-text`}>{avgScore}%</div>
          <div className={`text-sm font-medium ${trendColor}`}>{trendIcon} {trend}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{animateProgress ? progress : 0}%</span>
        </div>
        <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[1500ms] ease-out"
            style={{
              width: animateProgress ? `${progress}%` : '0%',
              backgroundColor: urgency === 'critical' ? '#EF4444' : urgency === 'high' ? '#F97316' : '#00a666',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-gray-600">{testsCompleted}/{testsTotal} tests</span>
        </div>
      </div>
    </div>
  );
}
