import { useState, useCallback, useRef } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoTimeChart } from '../components/DemoTimeChart';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockTimeData, mockPacingData } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function ResultsTimeDemo() {
  const [showPacingScore, setShowPacingScore] = useState(false);
  const [visibleBars, setVisibleBars] = useState(0);
  const [showPacingLine, setShowPacingLine] = useState(false);
  const [showSectionStats, setShowSectionStats] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const sweepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startBarSweep = useCallback(() => {
    let count = 0;
    const total = mockTimeData.length;
    sweepRef.current = setInterval(() => {
      count++;
      setVisibleBars(count);
      if (count >= total) {
        if (sweepRef.current) clearInterval(sweepRef.current);
      }
    }, 60);
  }, []);

  const reset = useCallback(() => {
    setShowPacingScore(false);
    setVisibleBars(0);
    setShowPacingLine(false);
    setShowSectionStats(false);
    setShowAnalysis(false);
    if (sweepRef.current) clearInterval(sweepRef.current);
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => setShowPacingScore(true), label: 'Show pacing score' },
    { delay: 1500, action: () => startBarSweep(), label: 'Sweep bars left to right' },
    { delay: 3200, action: () => setShowPacingLine(true), label: 'Show pacing chart + section area' },
    { delay: 1200, action: () => setShowSectionStats(true), label: 'Fill in section stats' },
    { delay: 2000, action: () => setShowAnalysis(true), label: 'Show analysis insights' },
    { delay: 4000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Results — Time Management">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex flex-col overflow-hidden">
        <DemoBrandHeader title="Time Management Analysis" subtitle="Pacing analysis and recommendations" />
        <div className="flex-1 max-w-5xl mx-auto w-full mt-2 min-h-0">
          <DemoTimeChart timeData={mockTimeData} pacingData={mockPacingData} visibleBars={visibleBars} showPacingLine={showPacingLine} showSectionStats={showSectionStats} showAnalysis={showAnalysis} showPacingScore={showPacingScore} />
        </div>
      </div>
    </DemoController>
  );
}
