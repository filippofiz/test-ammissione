import { useState, useCallback } from 'react';
import { DemoController, DemoStep } from '../DemoController';
import { DemoStudentProfile } from '../components/DemoStudentProfile';
import { DemoBrandHeader } from '../components/DemoBrandHeader';
import { mockStudentProfile } from '../data/mockData';
import '../animations/demoAnimations.css';

export default function AnalyticsDeepDiveDemo() {
  const [isVisible, setIsVisible] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const reset = useCallback(() => {
    setIsVisible(false);
    setShowChart(false);
    setShowDetails(false);
  }, []);

  const steps: DemoStep[] = [
    { delay: 500, action: () => setIsVisible(true), label: 'Show profile' },
    { delay: 1500, action: () => setShowChart(true), label: 'Show score chart' },
    { delay: 3000, action: () => setShowDetails(true), label: 'Show section scores & details' },
    { delay: 4000, action: () => {}, label: 'End' },
  ];

  return (
    <DemoController steps={steps} onReset={reset} title="Student Deep Dive">
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
        <div className="p-3 pb-0">
          <DemoBrandHeader title="Student Deep Dive" subtitle={`${mockStudentProfile.name} — Progress Analysis`} />
        </div>
        <div className="flex-1 overflow-hidden p-3 pt-2">
          <DemoStudentProfile
            name={mockStudentProfile.name}
            testDate={mockStudentProfile.testDate}
            schoolGrade={mockStudentProfile.schoolGrade}
            testHistory={mockStudentProfile.testHistory}
            sectionScores={mockStudentProfile.sectionScores}
            weakAreas={mockStudentProfile.weakAreas}
            strengths={mockStudentProfile.strengths}
            isVisible={isVisible}
            showChart={showChart}
            showDetails={showDetails}
          />
        </div>
      </div>
    </DemoController>
  );
}
