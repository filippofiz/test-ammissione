import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoAnalyticsGrid } from '../components/DemoAnalyticsGrid';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockStudents } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function AnalyticsOverviewDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [sortLabel, setSortLabel] = useState('Urgency');
  const [sortedStudents, setSortedStudents] = useState(mockStudents);

  const reset = useCallback(() => {
    setVisibleCount(0);
    setAnimateProgress(false);
    setHighlightedId(null);
    setSortLabel('Urgency');
    setSortedStudents(mockStudents);
  }, []);

  const sortByUrgency = () => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
    setSortedStudents([...mockStudents].sort((a, b) => order[a.urgency] - order[b.urgency]));
    setSortLabel('Urgency');
  };

  const steps: DemoStep[] = [
    { delay: 500, action: () => setVisibleCount(2), label: 'Show first 2 students' },
    { delay: 600, action: () => setVisibleCount(4), label: 'Show 4 students' },
    { delay: 600, action: () => setVisibleCount(6), label: 'Show 6 students' },
    { delay: 600, action: () => { setVisibleCount(8); setAnimateProgress(true); }, label: 'Show all students' },
    { delay: 2000, action: () => sortByUrgency(), label: 'Sort by urgency' },
    { delay: 1500, action: () => setHighlightedId('s7'), label: 'Highlight critical student' },
    { delay: 2000, action: () => setHighlightedId('s1'), label: 'Highlight another critical' },
    { delay: 2000, action: () => setHighlightedId(null), label: 'Remove highlight' },
    { delay: 2000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Tutor Analytics">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="Tutor Analytics" subtitle="Student Monitoring Dashboard" />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2">
          <DemoAnalyticsGrid
            students={sortedStudents}
            visibleCount={visibleCount}
            highlightedId={highlightedId}
            animateProgress={animateProgress}
            sortLabel={sortLabel}
          />
        </div>
      </div>
    </DemoController>
  );
}
