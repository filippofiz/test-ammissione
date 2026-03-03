import { useState, useCallback, useEffect, useRef } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoTestInterface } from '../components/DemoTestInterface';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockTestQuestions } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function TakeTestAnswerDemo() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(2400);

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => { timerRef.current = setInterval(() => setTimeRemaining(t => Math.max(0, t - 1)), 1000); return () => clearInterval(timerRef.current); }, []);

  const reset = useCallback(() => { setCurrentQ(0); setSelectedAnswer(null); setShowHighlight(false); setIsFlagged(false); setTimeRemaining(2400); }, []);
  const nextQuestion = () => { setSelectedAnswer(null); setShowHighlight(false); setIsFlagged(false); setCurrentQ(q => Math.min(q + 1, mockTestQuestions.length - 1)); };

  const steps: DemoStep[] = [
    { delay: 1000, action: () => setSelectedAnswer('A'), label: 'Select A' },
    { delay: 500, action: () => setShowHighlight(true), label: 'Highlight' },
    { delay: 1200, action: () => nextQuestion(), label: 'Next' },
    { delay: 1000, action: () => setSelectedAnswer('B'), label: 'Select B' },
    { delay: 500, action: () => setShowHighlight(true), label: 'Highlight' },
    { delay: 1200, action: () => nextQuestion(), label: 'Next' },
    { delay: 800, action: () => setSelectedAnswer('A'), label: 'Select A' },
    { delay: 500, action: () => setShowHighlight(true), label: 'Highlight' },
    { delay: 1000, action: () => nextQuestion(), label: 'Next' },
    { delay: 1200, action: () => setIsFlagged(true), label: 'Flag' },
    { delay: 800, action: () => setSelectedAnswer('A'), label: 'Select' },
    { delay: 500, action: () => setShowHighlight(true), label: 'Highlight' },
    { delay: 1200, action: () => nextQuestion(), label: 'Next' },
    { delay: 1000, action: () => setSelectedAnswer('B'), label: 'Select B' },
    { delay: 500, action: () => setShowHighlight(true), label: 'Highlight' },
    { delay: 2000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Take Test — Answering">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        <DemoTestInterface questions={mockTestQuestions} currentQuestionIndex={currentQ} selectedAnswer={selectedAnswer} timeRemaining={timeRemaining} isFlagged={isFlagged} showHighlight={showHighlight} />
      </div>
    </DemoController>
  );
}
