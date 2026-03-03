import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoUnlockAnimation } from '../components/DemoUnlockAnimation';
import { DemoConfetti } from '../components/DemoConfetti';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import '../animations/demoAnimations.css';

export default function StudentUnlockDemo() {
  const [phase, setPhase] = useState<'locked' | 'shaking' | 'bursting' | 'unlocked' | 'hidden'>('locked');
  const [showConfetti, setShowConfetti] = useState(false);

  const reset = useCallback(() => {
    setPhase('locked');
    setShowConfetti(false);
  }, []);

  const steps: DemoStep[] = [
    { delay: 1500, action: () => setPhase('shaking'), label: 'Shake lock' },
    { delay: 1000, action: () => setPhase('bursting'), label: 'Burst!' },
    { delay: 600, action: () => { setPhase('unlocked'); setShowConfetti(true); }, label: 'Unlocked!' },
    { delay: 3000, action: () => setShowConfetti(false), label: 'End confetti' },
    { delay: 2000, action: () => {}, label: 'Hold' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Test Unlock">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="Test Unlock" subtitle="Your tutor has unlocked a new test!" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-gray-800">Your tutor has unlocked a new test!</h1>
            </div>
            <DemoUnlockAnimation testName="Logic & Problem Solving — Exercise 4" phase={phase} />
            <DemoConfetti active={showConfetti} />
          </div>
        </div>
      </div>
    </DemoController>
  );
}
