/**
 * GMAT Sidebar Component
 * Sidebar for the GMAT Preparation Page with:
 * - Section navigation (Preparation, Materials, Analytics)
 * - Student info (tutor view)
 * - Cycle display with color coding
 * - Simple progress counts
 * - Quick actions
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faGraduationCap,
  faCheckCircle,
  faClipboardCheck,
  faBook,
  faEdit,
  faBullseye,
  faRocket,
  faStar,
  faChartLine,
  faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  type GmatCycle,
  type GmatProgress,
  type GmatAssessmentResult,
  type TrainingCompletion,
  type GmatSection,
  calculateEstimatedGmatScore,
} from '../lib/api/gmat';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
}

export type GMATViewSection = 'preparation' | 'materials' | 'analytics';

interface GMATSidebarProps {
  studentId?: string;
  studentInfo?: StudentInfo | null;
  gmatProgress: GmatProgress | null;
  placementResult: GmatAssessmentResult | null;
  sectionAssessments: Record<GmatSection, GmatAssessmentResult | null>;
  mockSimulation: GmatAssessmentResult | null;
  trainingCompletions: Map<string, TrainingCompletion>;
  totalTrainingTests: number;
  isTutorView: boolean;
  viewMode: 'tutor' | 'student';
  activeSection: GMATViewSection;
  onSectionChange: (section: GMATViewSection) => void;
  onChangeCycle?: () => void;
}

// Helper to get cycle display info
function getCycleInfo(cycle: GmatCycle) {
  const info: Record<GmatCycle, {
    color: string;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    scoreRange: string;
    description: string;
    icon: IconDefinition;
  }> = {
    Foundation: {
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      iconColor: 'text-blue-600',
      scoreRange: '505-605',
      description: 'Building core skills',
      icon: faBullseye,
    },
    Development: {
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      iconColor: 'text-amber-600',
      scoreRange: '605-665',
      description: 'Advancing skills',
      icon: faRocket,
    },
    Excellence: {
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-300',
      iconColor: 'text-emerald-600',
      scoreRange: '665-715+',
      description: 'Mastering advanced',
      icon: faStar,
    },
  };
  return info[cycle];
}

// Navigation items configuration
const NAV_ITEMS: { id: GMATViewSection; label: string; icon: IconDefinition; description: string }[] = [
  { id: 'preparation', label: 'Preparation', icon: faClipboardCheck, description: 'Training & Assessments' },
  { id: 'materials', label: 'Materials', icon: faBookOpen, description: 'Study Resources' },
  { id: 'analytics', label: 'Analytics', icon: faChartLine, description: 'Performance Stats' },
];

export function GMATSidebar({
  studentInfo,
  gmatProgress,
  sectionAssessments,
  mockSimulation,
  trainingCompletions,
  totalTrainingTests,
  isTutorView,
  viewMode,
  activeSection,
  onSectionChange,
  onChangeCycle,
}: GMATSidebarProps) {
  // Calculate progress stats
  const completedTrainingTests = trainingCompletions.size;
  const trainingProgress = totalTrainingTests > 0
    ? Math.round((completedTrainingTests / totalTrainingTests) * 100)
    : 0;

  const completedAssessments = [
    sectionAssessments.QR,
    sectionAssessments.DI,
    sectionAssessments.VR,
  ].filter(Boolean).length;

  // Calculate estimated score if mock is completed
  const estimatedScore = mockSimulation
    ? calculateEstimatedGmatScore(mockSimulation.score_percentage)
    : null;

  const cycleInfo = gmatProgress ? getCycleInfo(gmatProgress.gmat_cycle) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Student Info - Tutor View Only */}
      {isTutorView && viewMode === 'tutor' && studentInfo && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-brand-green text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{studentInfo.name}</h3>
              <p className="text-sm text-gray-500 truncate">{studentInfo.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Display - Show when cycle exists */}
      {gmatProgress && cycleInfo ? (
        <div className={`rounded-xl p-4 border-2 ${cycleInfo.bgColor} ${cycleInfo.borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Current Cycle</span>
            {isTutorView && viewMode === 'tutor' && onChangeCycle && (
              <button
                onClick={onChangeCycle}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faEdit} />
                Change
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${cycleInfo.bgColor} flex items-center justify-center`}>
              <FontAwesomeIcon icon={cycleInfo.icon} className={`text-xl ${cycleInfo.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${cycleInfo.color}`}>
                {gmatProgress.gmat_cycle}
              </h3>
              <p className="text-sm text-gray-600">{cycleInfo.description}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Target Score Range</span>
              <span className={`font-semibold ${cycleInfo.color}`}>{cycleInfo.scoreRange}</span>
            </div>
          </div>
        </div>
      ) : (
        /* No Cycle Assigned - Show Set Cycle button for tutors */
        isTutorView && viewMode === 'tutor' && onChangeCycle && (
          <div className="rounded-xl p-4 border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <FontAwesomeIcon icon={faBullseye} className="text-xl text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No Cycle Assigned</p>
              <p className="text-xs text-gray-500 mb-3">Set a GMAT preparation cycle for this student</p>
              <button
                onClick={onChangeCycle}
                className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Set Cycle
              </button>
            </div>
          </div>
        )
      )}

      {/* Estimated GMAT Score - If Mock Completed */}
      {estimatedScore && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faGraduationCap} />
            <span className="text-sm font-medium opacity-90">Estimated GMAT Score</span>
          </div>
          <div className="text-4xl font-bold">{estimatedScore}</div>
          <p className="text-xs opacity-75 mt-1">Based on latest mock simulation</p>
        </div>
      )}

      {/* Navigation */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
          Navigation
        </h4>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeSection === item.id
                ? 'bg-brand-green text-white shadow-md'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              activeSection === item.id ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              <FontAwesomeIcon
                icon={item.icon}
                className={activeSection === item.id ? 'text-white' : 'text-gray-500'}
              />
            </div>
            <div className="text-left">
              <div className={`font-medium ${activeSection === item.id ? 'text-white' : 'text-gray-800'}`}>
                {item.label}
              </div>
              <div className={`text-xs ${activeSection === item.id ? 'text-white/70' : 'text-gray-500'}`}>
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Progress Summary */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
          Quick Stats
        </h4>

        {/* Training Progress */}
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faClipboardCheck} className="text-emerald-600 text-xs" />
              </div>
              <span className="text-xs font-medium text-gray-700">Training</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">
              {completedTrainingTests}/{totalTrainingTests}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        </div>

        {/* Section Assessments */}
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-xs" />
              </div>
              <span className="text-xs font-medium text-gray-700">Assessments</span>
            </div>
            <span className="text-sm font-bold text-purple-600">{completedAssessments}/3</span>
          </div>
          <div className="flex gap-1">
            {(['QR', 'DI', 'VR'] as GmatSection[]).map((section) => {
              const assessment = sectionAssessments[section];
              const isPassed = assessment && assessment.score_percentage >= 60;
              return (
                <div
                  key={section}
                  className={`flex-1 text-center py-1 rounded text-xs font-medium ${
                    isPassed
                      ? 'bg-green-100 text-green-700'
                      : assessment
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {section}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mock Simulation */}
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-600 text-xs" />
              </div>
              <span className="text-xs font-medium text-gray-700">Simulation</span>
            </div>
            {mockSimulation ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {mockSimulation.score_percentage.toFixed(0)}%
              </span>
            ) : (
              <span className="text-xs text-gray-400">Not started</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
