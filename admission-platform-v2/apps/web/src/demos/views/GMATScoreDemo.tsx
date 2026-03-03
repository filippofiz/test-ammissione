import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoGMATScore } from '../components/DemoGMATScore';
import { DemoConfetti } from '../components/DemoConfetti';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockGMATResults } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function GMATScoreDemo() {
  const [showScore, setShowScore] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showPercentile, setShowPercentile] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const reset = useCallback(() => {
    setShowScore(false);
    setShowSections(false);
    setShowDifficulty(false);
    setShowPercentile(false);
    setShowConfetti(false);
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => setShowScore(true), label: 'Animate GMAT score' },
    { delay: 2800, action: () => { setShowPercentile(true); setShowConfetti(true); }, label: 'Show percentile + confetti' },
    { delay: 2000, action: () => setShowConfetti(false), label: 'End confetti' },
    { delay: 500, action: () => setShowSections(true), label: 'Show section scores' },
    { delay: 2000, action: () => setShowDifficulty(true), label: 'Show difficulty breakdown' },
    { delay: 3000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="GMAT Score Reveal">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="GMAT Score Reveal" subtitle="Estimated Score & Section Breakdown" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2 flex flex-col justify-center">
          <DemoGMATScore
            estimatedScore={mockGMATResults.estimatedScore}
            percentile={mockGMATResults.percentile}
            sections={mockGMATResults.sections}
            difficultyBreakdown={mockGMATResults.difficultyBreakdown}
            showScore={showScore}
            showSections={showSections}
            showDifficulty={showDifficulty}
            showPercentile={showPercentile}
          />
          <DemoConfetti active={showConfetti} />
        </div>
      </div>
    </DemoController>
  );
}
