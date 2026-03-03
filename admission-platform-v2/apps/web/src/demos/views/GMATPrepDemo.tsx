import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoGMATPrepView } from '../components/DemoGMATPrepView';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockGMATPrep } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function GMATPrepDemo() {
  const [visibleSections, setVisibleSections] = useState(0);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);

  const reset = useCallback(() => {
    setVisibleSections(0);
    setAnimateProgress(false);
    setShowRecommended(false);
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => { setVisibleSections(1); setAnimateProgress(true); }, label: 'Show Quantitative' },
    { delay: 1000, action: () => setVisibleSections(2), label: 'Show Data Insights' },
    { delay: 1000, action: () => setVisibleSections(3), label: 'Show Verbal' },
    { delay: 2000, action: () => setShowRecommended(true), label: 'Show recommendation' },
    { delay: 3000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="GMAT Preparation">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="GMAT Preparation" subtitle="Track Progress Across All Sections" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2">
          <DemoGMATPrepView
            sections={mockGMATPrep.sections}
            nextRecommended={mockGMATPrep.nextRecommended}
            visibleSections={visibleSections}
            animateProgress={animateProgress}
            showRecommended={showRecommended}
          />
        </div>
      </div>
    </DemoController>
  );
}
