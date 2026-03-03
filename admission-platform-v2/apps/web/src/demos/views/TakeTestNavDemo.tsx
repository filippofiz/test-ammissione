import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoTestInterface } from '../components/DemoTestInterface';
import { DemoTestNav } from '../components/DemoTestNav';
import { DemoCalculator } from '../components/DemoCalculator';
import { mockTestQuestions } from '../data/mockData';
import '../animations/demoAnimations.css';

type QStatus = 'answered' | 'flagged' | 'current' | 'unanswered' | 'not-visited';

export default function TakeTestNavDemo() {
  const [currentQ, setCurrentQ] = useState(2);
  const [showNav, setShowNav] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>('B');
  const [isFlagged, setIsFlagged] = useState(false);
  const [questionStatuses, setQuestionStatuses] = useState<{ number: number; status: QStatus }[]>(
    Array.from({ length: 8 }, (_, i) => ({ number: i + 1, status: i < 2 ? 'answered' as const : i === 2 ? 'current' as const : 'not-visited' as const }))
  );

  const reset = useCallback(() => {
    setCurrentQ(2); setShowNav(false); setShowCalc(false); setCalcDisplay('0'); setSelectedAnswer('B'); setIsFlagged(false);
    setQuestionStatuses(Array.from({ length: 8 }, (_, i) => ({ number: i + 1, status: i < 2 ? 'answered' as const : i === 2 ? 'current' as const : 'not-visited' as const })));
  }, []);

  const steps: DemoStep[] = [
    { delay: 800, action: () => setShowNav(true), label: 'Open navigator' },
    { delay: 1500, action: () => { setIsFlagged(true); setQuestionStatuses(prev => prev.map(q => q.number === 3 ? { ...q, status: 'flagged' as const } : q)); }, label: 'Flag Q3' },
    { delay: 1200, action: () => setShowCalc(true), label: 'Open calculator' },
    { delay: 800, action: () => setCalcDisplay('153'), label: 'Type' },
    { delay: 600, action: () => setCalcDisplay('153.86'), label: 'Calculate' },
    { delay: 1500, action: () => setShowCalc(false), label: 'Close calc' },
    { delay: 800, action: () => { setCurrentQ(0); setSelectedAnswer(null); setIsFlagged(false); setQuestionStatuses(prev => prev.map(q => q.number === 3 ? { ...q, status: 'flagged' as const } : q.number === 1 ? { ...q, status: 'current' as const } : q)); }, label: 'Jump Q1' },
    { delay: 1200, action: () => { setCurrentQ(2); setSelectedAnswer('A'); setQuestionStatuses(prev => prev.map(q => q.number === 3 ? { ...q, status: 'current' as const } : q.number === 1 ? { ...q, status: 'answered' as const } : q)); }, label: 'Back to flagged' },
    { delay: 2000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Take Test — Navigation">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-start justify-center gap-4 p-4 pt-8 overflow-hidden">
        <DemoTestInterface questions={mockTestQuestions} currentQuestionIndex={currentQ} selectedAnswer={selectedAnswer} timeRemaining={2156} isFlagged={isFlagged} showHighlight={false} />
        <DemoTestNav questions={questionStatuses} isVisible={showNav} currentQuestion={currentQ + 1} />
        <DemoCalculator isOpen={showCalc} displayValue={calcDisplay} />
      </div>
    </DemoController>
  );
}
