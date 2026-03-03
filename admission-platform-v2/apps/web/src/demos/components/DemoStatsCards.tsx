interface StatsCardsProps {
  stats: {
    total: number;
    answered: number;
    correct: number;
    wrong: number;
    unanswered: number;
    flagged: number;
    score: number;
  };
  visibleCards: number; // How many cards to show (0-7), controlled by auto-pilot
}

const CARD_CONFIG = [
  { key: 'total', label: 'Total Questions', color: 'border-gray-300', bg: 'bg-white', text: 'text-gray-700' },
  { key: 'answered', label: 'Answered', color: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
  { key: 'correct', label: 'Correct', color: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700' },
  { key: 'wrong', label: 'Wrong', color: 'border-red-400', bg: 'bg-red-50', text: 'text-red-700' },
  { key: 'unanswered', label: 'Unanswered', color: 'border-gray-400', bg: 'bg-gray-50', text: 'text-gray-600' },
  { key: 'flagged', label: 'Flagged', color: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700' },
];

export function DemoStatsCards({ stats, visibleCards }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {CARD_CONFIG.map((card, i) => (
        <div
          key={card.key}
          className={`${card.bg} ${card.color} border-2 rounded-xl p-4 text-center transition-all duration-500
            ${i < visibleCards ? 'demo-animate-fadeInUp' : 'opacity-0'}`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className={`text-3xl font-bold ${card.text} demo-score-text`}>
            {stats[card.key as keyof typeof stats]}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">{card.label}</div>
        </div>
      ))}

      {/* Score card — special gradient */}
      <div
        className={`bg-gradient-to-br from-[#00a666] to-green-600 border-2 border-green-500 rounded-xl p-4 text-center shadow-lg transition-all duration-500
          ${visibleCards >= 7 ? 'demo-animate-bounceIn' : 'opacity-0'}`}
        style={{ animationDelay: '600ms' }}
      >
        <div className="text-3xl font-bold text-white demo-score-text">
          {stats.score}%
        </div>
        <div className="text-xs text-green-100 mt-1 font-medium">Score</div>
      </div>
    </div>
  );
}
