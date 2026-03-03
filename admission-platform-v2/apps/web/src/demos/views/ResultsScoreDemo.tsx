import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoStatsCards } from '../components/DemoStatsCards';
import { DemoScoreReveal } from '../components/DemoScoreReveal';
import { DemoConfetti } from '../components/DemoConfetti';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockResults } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function ResultsScoreDemo() {
  const [visibleCards, setVisibleCards] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const reset = useCallback(() => { setVisibleCards(0); setShowScore(false); setShowConfetti(false); }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => setVisibleCards(1), label: 'Show Total' },
    { delay: 300, action: () => setVisibleCards(2), label: 'Show Answered' },
    { delay: 300, action: () => setVisibleCards(3), label: 'Show Correct' },
    { delay: 300, action: () => setVisibleCards(4), label: 'Show Wrong' },
    { delay: 300, action: () => setVisibleCards(5), label: 'Show Unanswered' },
    { delay: 300, action: () => setVisibleCards(6), label: 'Show Flagged' },
    { delay: 500, action: () => setVisibleCards(7), label: 'Show Score Card' },
    { delay: 1000, action: () => setShowScore(true), label: 'Animate Score' },
    { delay: 2500, action: () => setShowConfetti(true), label: 'Confetti!' },
    { delay: 4000, action: () => setShowConfetti(false), label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Results — Score Reveal">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex flex-col overflow-hidden">
        <DemoBrandHeader title={mockResults.testName} subtitle={`Student: ${mockResults.studentName} \u2022 ${mockResults.date}`} />
        <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full gap-4">
          <DemoStatsCards stats={mockResults.stats} visibleCards={visibleCards} />
          {visibleCards >= 7 && <DemoScoreReveal targetScore={mockResults.stats.score} isAnimating={showScore} size="md" />}
          <DemoConfetti active={showConfetti} />
        </div>
      </div>
    </DemoController>
  );
}
