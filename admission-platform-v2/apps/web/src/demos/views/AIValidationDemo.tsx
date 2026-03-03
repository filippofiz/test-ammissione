import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoAIValidation } from '../components/DemoAIValidation';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockAIValidation } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function AIValidationDemo() {
  const [showStats, setShowStats] = useState(false);
  const [animateCounter, setAnimateCounter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [scanningIndex, setScanningIndex] = useState(-1);

  const reset = useCallback(() => {
    setShowStats(false);
    setAnimateCounter(false);
    setVisibleCount(0);
    setScanningIndex(-1);
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => { setShowStats(true); setAnimateCounter(true); }, label: 'Show stats' },
    { delay: 2500, action: () => setVisibleCount(3), label: 'Show first 3 results' },
    { delay: 300, action: () => setScanningIndex(0), label: 'Scan Q1' },
    { delay: 600, action: () => setScanningIndex(1), label: 'Scan Q2' },
    { delay: 600, action: () => setScanningIndex(2), label: 'Scan Q3' },
    { delay: 600, action: () => { setVisibleCount(6); setScanningIndex(3); }, label: 'More results' },
    { delay: 600, action: () => setScanningIndex(4), label: 'Scan Q5' },
    { delay: 600, action: () => setScanningIndex(5), label: 'Scan Q6' },
    { delay: 600, action: () => { setVisibleCount(9); setScanningIndex(6); }, label: 'More results' },
    { delay: 600, action: () => setScanningIndex(7), label: 'Scan' },
    { delay: 600, action: () => setScanningIndex(8), label: 'Scan' },
    { delay: 600, action: () => { setVisibleCount(12); setScanningIndex(9); }, label: 'Final batch' },
    { delay: 600, action: () => setScanningIndex(10), label: 'Scan' },
    { delay: 600, action: () => setScanningIndex(11), label: 'Scan' },
    { delay: 600, action: () => setScanningIndex(-1), label: 'Done scanning' },
    { delay: 2000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="AI Validation">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="AI Quality Assurance" subtitle="Automated Question Validation" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2">
          <DemoAIValidation
            totalQuestions={mockAIValidation.totalQuestions}
            accuracy={mockAIValidation.accuracy}
            validations={mockAIValidation.recentValidations}
            visibleCount={visibleCount}
            scanningIndex={scanningIndex}
            showStats={showStats}
            animateCounter={animateCounter}
          />
        </div>
      </div>
    </DemoController>
  );
}
