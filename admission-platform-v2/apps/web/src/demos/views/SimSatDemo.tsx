import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoExamSimulation } from '../components/DemoExamSimulation';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockSatQuestions } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function SimSatDemo() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [time, setTime] = useState(3780); // 63 min

  const reset = useCallback(() => {
    setCurrentQ(0);
    setSelected(null);
    setHighlight(false);
    setFlagged(false);
    setTime(3780);
  }, []);

  const nextQ = (qi: number) => { setCurrentQ(qi); setSelected(null); setHighlight(false); setFlagged(false); };

  const steps: DemoStep[] = [
    // Q1 — read, answer, highlight, move
    { delay: 1200, action: () => { setSelected('B'); setTime(3720); }, label: 'Answer Q1' },
    { delay: 500, action: () => setHighlight(true), label: 'Highlight Q1' },
    { delay: 1200, action: () => nextQ(1), label: 'Next Q2' },
    // Q2
    { delay: 1200, action: () => { setSelected('B'); setTime(3660); }, label: 'Answer Q2' },
    { delay: 500, action: () => setHighlight(true), label: 'Highlight Q2' },
    { delay: 1200, action: () => nextQ(2), label: 'Next Q3' },
    // Q3 — flagged
    { delay: 1000, action: () => { setSelected('C'); setTime(3600); }, label: 'Answer Q3' },
    { delay: 500, action: () => setHighlight(true), label: 'Highlight Q3' },
    { delay: 600, action: () => setFlagged(true), label: 'Flag Q3' },
    { delay: 1000, action: () => nextQ(3), label: 'Next Q4' },
    // Q4
    { delay: 1200, action: () => { setSelected('B'); setTime(3540); }, label: 'Answer Q4' },
    { delay: 500, action: () => setHighlight(true), label: 'Highlight Q4' },
    { delay: 1200, action: () => nextQ(4), label: 'Next Q5' },
    // Q5
    { delay: 1200, action: () => { setSelected('B'); setTime(3480); }, label: 'Answer Q5' },
    { delay: 500, action: () => setHighlight(true), label: 'Highlight Q5' },
    { delay: 2000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="SAT Simulation">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="SAT Simulation" subtitle="Reading, Writing & Math" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2 flex flex-col justify-center">
          <DemoExamSimulation
            examName="SAT"
            examSubtitle="Digital SAT"
            examColor="#DC2626"
            questions={mockSatQuestions}
            currentQuestionIndex={currentQ}
            selectedAnswer={selected}
            timeRemaining={time}
            totalQuestions={54}
            isFlagged={flagged}
            showHighlight={highlight}
            language="en"
          />
        </div>
      </div>
    </DemoController>
  );
}
