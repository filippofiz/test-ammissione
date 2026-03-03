import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoAttemptsChart } from '../components/DemoAttemptsChart';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockAttemptsData } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function PrepComparisonDemo() {
  const [visibleAttempts, setVisibleAttempts] = useState(0);
  const [showBars, setShowBars] = useState(false);

  const reset = useCallback(() => {
    setVisibleAttempts(0);
    setShowBars(false);
  }, []);

  const steps: DemoStep[] = [
    { delay: 800, action: () => setVisibleAttempts(1), label: 'Show attempt 1' },
    { delay: 2000, action: () => setVisibleAttempts(2), label: 'Show attempt 2' },
    { delay: 2000, action: () => setVisibleAttempts(3), label: 'Show attempt 3' },
    { delay: 1500, action: () => setShowBars(true), label: 'Show section bars' },
    { delay: 3500, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Attempts Comparison">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="Confronto Tentativi" subtitle="Progresso nel Tempo" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2 flex flex-col justify-center">
          <DemoAttemptsChart
            examName={mockAttemptsData.examName}
            attempts={mockAttemptsData.attempts}
            visibleAttempts={visibleAttempts}
            showBars={showBars}
          />
        </div>
      </div>
    </DemoController>
  );
}
