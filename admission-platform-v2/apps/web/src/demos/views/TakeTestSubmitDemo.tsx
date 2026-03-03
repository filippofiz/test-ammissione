import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoSubmitFlow } from '../components/DemoSubmitFlow';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import '../animations/demoAnimations.css';

export default function TakeTestSubmitDemo() {
  const [phase, setPhase] = useState<'review' | 'confirm' | 'submitting' | 'success' | 'hidden'>('hidden');

  const questionStatuses = Array.from({ length: 40 }, (_, i) => ({
    number: i + 1,
    answered: i !== 23, // Q24 unanswered
    flagged: i === 3 || i === 6, // Q4 and Q7 flagged
  }));

  const reset = useCallback(() => {
    setPhase('hidden');
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => setPhase('review'), label: 'Show review' },
    { delay: 3000, action: () => setPhase('confirm'), label: 'Confirm dialog' },
    { delay: 2000, action: () => setPhase('submitting'), label: 'Submitting...' },
    { delay: 2000, action: () => setPhase('success'), label: 'Success!' },
    { delay: 4000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Take Test — Submission">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="Test Submission" subtitle="Bocconi Admission Test — Spring 2026" />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <DemoSubmitFlow
            totalQuestions={40}
            answeredCount={39}
            flaggedCount={2}
            phase={phase}
            questionStatuses={questionStatuses}
          />
        </div>
      </div>
    </DemoController>
  );
}
