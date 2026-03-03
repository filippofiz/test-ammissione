import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoQuestionGallery } from '../components/DemoQuestionGallery';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockQuestionTypes } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function QuestionGalleryDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const reset = useCallback(() => {
    setVisibleCount(0);
    setActiveCard(null);
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => setVisibleCount(1), label: 'Show Multiple Choice' },
    { delay: 400, action: () => setVisibleCount(2), label: 'Show Data Sufficiency' },
    { delay: 400, action: () => setVisibleCount(3), label: 'Show MSR' },
    { delay: 400, action: () => setVisibleCount(4), label: 'Show GI' },
    { delay: 400, action: () => setVisibleCount(5), label: 'Show TA' },
    { delay: 400, action: () => setVisibleCount(6), label: 'Show TPA' },
    { delay: 1000, action: () => setActiveCard(0), label: 'Focus MC' },
    { delay: 1500, action: () => setActiveCard(1), label: 'Focus DS' },
    { delay: 1500, action: () => setActiveCard(2), label: 'Focus MSR' },
    { delay: 1500, action: () => setActiveCard(3), label: 'Focus GI' },
    { delay: 1500, action: () => setActiveCard(4), label: 'Focus TA' },
    { delay: 1500, action: () => setActiveCard(5), label: 'Focus TPA' },
    { delay: 1000, action: () => setActiveCard(null), label: 'Show stats' },
    { delay: 2000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Question Gallery">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="Question Types Gallery" subtitle="6 Advanced Question Formats" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2 flex flex-col justify-center">
          <DemoQuestionGallery
            questionTypes={mockQuestionTypes}
            visibleCount={visibleCount}
            activeCard={activeCard}
          />
        </div>
      </div>
    </DemoController>
  );
}
