import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoEndOfPathReport } from '../components/DemoEndOfPathReport';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockEndOfPathData } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function PrepReportDemo() {
  const [showProgress, setShowProgress] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showStrengths, setShowStrengths] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const reset = useCallback(() => {
    setShowProgress(false);
    setVisibleSections(0);
    setShowStats(false);
    setShowStrengths(false);
    setShowBadge(false);
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => setShowProgress(true), label: 'Show progress arc' },
    { delay: 1000, action: () => setShowStats(true), label: 'Show stats' },
    { delay: 1500, action: () => setVisibleSections(2), label: 'Show 2 sections' },
    { delay: 800, action: () => setVisibleSections(4), label: 'Show 4 sections' },
    { delay: 800, action: () => setVisibleSections(5), label: 'Show all sections' },
    { delay: 1000, action: () => setShowStrengths(true), label: 'Show strengths' },
    { delay: 1000, action: () => setShowBadge(true), label: 'Show badge' },
    { delay: 3000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="End-of-Path Report">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="Report di Fine Percorso" subtitle="Riepilogo Preparazione" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2">
          <DemoEndOfPathReport
            examName={mockEndOfPathData.examName}
            studentName={mockEndOfPathData.studentName}
            startScore={mockEndOfPathData.startScore}
            finalScore={mockEndOfPathData.finalScore}
            improvement={mockEndOfPathData.improvement}
            totalQuestionsPracticed={mockEndOfPathData.totalQuestionsPracticed}
            totalTimeSpent={mockEndOfPathData.totalTimeSpent}
            simulationsCompleted={mockEndOfPathData.simulationsCompleted}
            sections={mockEndOfPathData.sections}
            strengths={mockEndOfPathData.strengths}
            improved={mockEndOfPathData.improved}
            readyForExam={mockEndOfPathData.readyForExam}
            showProgress={showProgress}
            visibleSections={visibleSections}
            showStats={showStats}
            showStrengths={showStrengths}
            showBadge={showBadge}
          />
        </div>
      </div>
    </DemoController>
  );
}
