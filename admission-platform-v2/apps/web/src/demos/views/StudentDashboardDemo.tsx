import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoStudentDashboard } from '../components/DemoStudentDashboard';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockStudentDashboard } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function StudentDashboardDemo() {
  const [visibleTracks, setVisibleTracks] = useState(0);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  const reset = useCallback(() => {
    setVisibleTracks(0);
    setAnimateProgress(false);
    setShowCountdown(false);
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => setShowCountdown(true), label: 'Show countdown' },
    { delay: 1000, action: () => { setVisibleTracks(1); setAnimateProgress(true); }, label: 'Show Logic track' },
    { delay: 800, action: () => setVisibleTracks(2), label: 'Show Math track' },
    { delay: 800, action: () => setVisibleTracks(3), label: 'Show Reading track' },
    { delay: 800, action: () => setVisibleTracks(4), label: 'Show Data track' },
    { delay: 800, action: () => setVisibleTracks(5), label: 'Show Critical track' },
    { delay: 3000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Student Dashboard">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="Student Dashboard" subtitle="Learning Journey & Progress" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2">
          <DemoStudentDashboard
            studentName={mockStudentDashboard.studentName}
            testDate={mockStudentDashboard.testDate}
            tracks={mockStudentDashboard.tracks}
            visibleTracks={visibleTracks}
            animateProgress={animateProgress}
            showCountdown={showCountdown}
          />
        </div>
      </div>
    </DemoController>
  );
}
