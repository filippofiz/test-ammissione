import { useState, useCallback, useRef } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoQuestionList } from '../components/DemoQuestionList';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockResults } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function ResultsQuestionsDemo() {
  const [visibleSections, setVisibleSections] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => { setVisibleSections(0); setExpandedQuestions(new Set()); containerRef.current?.scrollTo({ top: 0 }); }, []);
  const expandQ = (id: string) => setExpandedQuestions(prev => new Set(prev).add(id));
  const scrollDown = (amount: number) => { containerRef.current?.scrollBy({ top: amount, behavior: 'smooth' }); };

  const sections = mockResults.sections.map(s => ({
    name: s.name,
    questions: s.questions.map(q => ({ id: q.id, text: q.text, options: q.options, correctAnswer: q.correctAnswer, studentAnswer: q.studentAnswer, isCorrect: q.isCorrect, timeSpent: q.timeSpent, difficulty: q.difficulty })),
    stats: s.stats,
  }));

  const steps: DemoStep[] = [
    { delay: 500, action: () => setVisibleSections(1), label: 'Show Logic section' },
    { delay: 800, action: () => expandQ('q1'), label: 'Expand Q1 (correct)' },
    { delay: 1500, action: () => scrollDown(300), label: 'Scroll down' },
    { delay: 800, action: () => expandQ('q4'), label: 'Expand Q4 (wrong)' },
    { delay: 1500, action: () => scrollDown(400), label: 'Scroll' },
    { delay: 500, action: () => setVisibleSections(2), label: 'Show Math section' },
    { delay: 800, action: () => expandQ('q9'), label: 'Expand Q9' },
    { delay: 1200, action: () => scrollDown(400), label: 'Scroll' },
    { delay: 500, action: () => expandQ('q13'), label: 'Expand Q13 (wrong)' },
    { delay: 1500, action: () => { setVisibleSections(3); scrollDown(500); }, label: 'Show Reading' },
    { delay: 1500, action: () => { setVisibleSections(4); scrollDown(400); }, label: 'Show Data' },
    { delay: 1500, action: () => { setVisibleSections(5); scrollDown(400); }, label: 'Show Critical' },
    { delay: 2000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Results — Question Review">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 pb-0">
          <DemoBrandHeader title="Question Review" subtitle={mockResults.testName} />
        </div>
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 pt-2">
          <div className="max-w-4xl mx-auto">
            <DemoQuestionList sections={sections} visibleSections={visibleSections} expandedQuestions={expandedQuestions} />
          </div>
        </div>
      </div>
    </DemoController>
  );
}
