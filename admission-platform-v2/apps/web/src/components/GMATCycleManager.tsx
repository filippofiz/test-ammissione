/**
 * GMAT Cycle Manager Component
 * Reusable component for displaying and managing a student's GMAT preparation cycle
 * Used by tutors to view/change student cycles and by students to see their current cycle
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRocket,
  faArrowUp,
  faArrowDown,
  faQuestionCircle,
  faRedo,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import {
  getStudentGMATProgress,
  initializeGMATPreparation,
  updateStudentGMATCycle,
  clearSeenQuestions,
  getSeenQuestionsCount,
  type GmatCycle,
  type GmatProgress,
  GMAT_CYCLES,
} from '../lib/api/gmat';

interface GMATCycleManagerProps {
  studentId: string;
  /** If true, shows management controls (change cycle, reset). If false, shows read-only display */
  editable?: boolean;
  /** Callback when cycle changes */
  onCycleChange?: (newCycle: GmatCycle) => void;
  /** Optional class name for the container */
  className?: string;
}

// Helper to get cycle display info
function getCycleInfo(cycle: GmatCycle) {
  const info: Record<GmatCycle, { color: string; bgColor: string; borderColor: string; scoreRange: string; description: string }> = {
    Foundation: {
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      scoreRange: '505-605',
      description: 'Building core skills (60% Easy, 30% Medium, 10% Hard)',
    },
    Development: {
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      scoreRange: '605-665',
      description: 'Advancing skills (25% Easy, 50% Medium, 25% Hard)',
    },
    Excellence: {
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      scoreRange: '665-715+',
      description: 'Mastering advanced content (5% Easy, 30% Medium, 65% Hard)',
    },
  };
  return info[cycle];
}

export function GMATCycleManager({
  studentId,
  editable = true,
  onCycleChange,
  className = '',
}: GMATCycleManagerProps) {
  const [gmatProgress, setGmatProgress] = useState<GmatProgress | null>(null);
  const [gmatLoading, setGmatLoading] = useState(true);
  const [gmatSeenCount, setGmatSeenCount] = useState(0);
  const [showCycleConfirm, setShowCycleConfirm] = useState<GmatCycle | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadGmatProgress();
  }, [studentId]);

  async function loadGmatProgress() {
    if (!studentId) return;

    setGmatLoading(true);
    try {
      const progress = await getStudentGMATProgress(studentId);
      setGmatProgress(progress);
      if (progress) {
        const count = await getSeenQuestionsCount(studentId);
        setGmatSeenCount(count);
      }
    } catch (err) {
      console.error('Error loading GMAT progress:', err);
      setError('Failed to load GMAT progress');
    } finally {
      setGmatLoading(false);
    }
  }

  async function handleInitializeGMAT(cycle: GmatCycle) {
    if (!studentId) return;

    setGmatLoading(true);
    setError(null);
    try {
      const progress = await initializeGMATPreparation(studentId, cycle);
      setGmatProgress(progress);
      setGmatSeenCount(0);
      setSuccessMessage(`GMAT preparation initialized with ${cycle} cycle!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      onCycleChange?.(cycle);
    } catch (err) {
      console.error('Error initializing GMAT:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize GMAT preparation');
    } finally {
      setGmatLoading(false);
    }
  }

  async function handleUpdateCycle(newCycle: GmatCycle) {
    if (!studentId) return;

    setGmatLoading(true);
    setShowCycleConfirm(null);
    setError(null);
    try {
      await updateStudentGMATCycle(studentId, newCycle);
      setGmatProgress(prev => prev ? { ...prev, gmat_cycle: newCycle } : null);
      setSuccessMessage(`Student cycle updated to ${newCycle}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      onCycleChange?.(newCycle);
    } catch (err) {
      console.error('Error updating GMAT cycle:', err);
      setError(err instanceof Error ? err.message : 'Failed to update GMAT cycle');
    } finally {
      setGmatLoading(false);
    }
  }

  async function handleResetSeenQuestions() {
    if (!studentId) return;

    setGmatLoading(true);
    setShowResetConfirm(false);
    setError(null);
    try {
      await clearSeenQuestions(studentId);
      setGmatSeenCount(0);
      setGmatProgress(prev => prev ? { ...prev, seen_question_ids: [] } : null);
      setSuccessMessage('Seen questions have been reset!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error resetting seen questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset seen questions');
    } finally {
      setGmatLoading(false);
    }
  }

  // Loading state
  if (gmatLoading) {
    return (
      <div className={`bg-gray-50 rounded-xl p-8 text-center ${className}`}>
        <FontAwesomeIcon icon={faSpinner} className="text-3xl text-gray-400 animate-spin mb-2" />
        <p className="text-gray-500">Loading GMAT progress...</p>
      </div>
    );
  }

  // No GMAT progress - show initialization options (only if editable)
  if (!gmatProgress) {
    if (!editable) {
      return (
        <div className={`bg-gray-50 rounded-xl p-6 text-center ${className}`}>
          <FontAwesomeIcon icon={faQuestionCircle} className="text-4xl text-gray-300 mb-2" />
          <p className="text-gray-600 font-medium">GMAT preparation not yet initialized</p>
          <p className="text-gray-500 text-sm mt-1">Ask your tutor to set up your GMAT cycle</p>
        </div>
      );
    }

    return (
      <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-xl p-3">
            <p className="text-green-700 font-medium text-sm">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-3">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="text-center mb-6">
          <FontAwesomeIcon icon={faQuestionCircle} className="text-4xl text-gray-300 mb-2" />
          <p className="text-gray-600 font-medium">GMAT preparation not yet initialized</p>
          <p className="text-gray-500 text-sm mt-1">Select an initial cycle to start tracking progress</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GMAT_CYCLES.map((cycle) => {
            const info = getCycleInfo(cycle);
            return (
              <button
                key={cycle}
                onClick={() => handleInitializeGMAT(cycle)}
                className={`p-4 rounded-xl border-2 ${info.borderColor} ${info.bgColor} hover:shadow-md transition-all text-left`}
              >
                <h4 className={`font-bold ${info.color} text-lg`}>{cycle}</h4>
                <p className="text-gray-600 text-sm mt-1">Target: {info.scoreRange}</p>
                <p className="text-gray-500 text-xs mt-2">{info.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Show current cycle
  const info = getCycleInfo(gmatProgress.gmat_cycle);

  return (
    <div className={className}>
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-xl p-3">
          <p className="text-green-700 font-medium text-sm">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-3">
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Current Cycle Display */}
      <div className={`${info.bgColor} border-2 ${info.borderColor} rounded-xl p-5 mb-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${info.bgColor} border-2 ${info.borderColor} flex items-center justify-center`}>
              <FontAwesomeIcon icon={faRocket} className={`text-2xl ${info.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-2xl font-bold ${info.color}`}>
                  {gmatProgress.gmat_cycle}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${info.bgColor} ${info.color} border ${info.borderColor}`}>
                  Target: {info.scoreRange}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{info.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-600">
              <FontAwesomeIcon icon={faQuestionCircle} className="text-sm" />
              <span className="text-sm font-medium">{gmatSeenCount} questions seen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Management Controls (only if editable) */}
      {editable && (
        <div className="space-y-4">
          {/* Cycle Change Options */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Change Cycle</h4>
            <div className="flex flex-wrap gap-2">
              {GMAT_CYCLES.map((cycle) => {
                const isCurrentCycle = cycle === gmatProgress.gmat_cycle;
                const cycleInfo = getCycleInfo(cycle);
                const currentIndex = GMAT_CYCLES.indexOf(gmatProgress.gmat_cycle);
                const targetIndex = GMAT_CYCLES.indexOf(cycle);
                const isPromotion = targetIndex > currentIndex;

                return (
                  <button
                    key={cycle}
                    onClick={() => !isCurrentCycle && setShowCycleConfirm(cycle)}
                    disabled={isCurrentCycle}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                      isCurrentCycle
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : `${cycleInfo.bgColor} ${cycleInfo.color} border-2 ${cycleInfo.borderColor} hover:shadow-md`
                    }`}
                  >
                    {!isCurrentCycle && (
                      <FontAwesomeIcon
                        icon={isPromotion ? faArrowUp : faArrowDown}
                        className={isPromotion ? 'text-green-600' : 'text-amber-600'}
                      />
                    )}
                    {cycle}
                    {isCurrentCycle && <span className="text-xs">(Current)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Seen Questions */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-700">Reset Seen Questions</h4>
                <p className="text-gray-500 text-sm">Clear question history to allow seeing all questions again</p>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={gmatSeenCount === 0}
                className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                  gmatSeenCount === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-100 text-red-600 border-2 border-red-200 hover:bg-red-200'
                }`}
              >
                <FontAwesomeIcon icon={faRedo} />
                Reset ({gmatSeenCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Change Confirmation Modal */}
      {showCycleConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeInUp">
            <div className={`p-4 ${getCycleInfo(showCycleConfirm).bgColor}`}>
              <h3 className={`text-lg font-bold ${getCycleInfo(showCycleConfirm).color}`}>
                Change to {showCycleConfirm} Cycle?
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                This will change the GMAT preparation cycle from{' '}
                <strong>{gmatProgress?.gmat_cycle}</strong> to{' '}
                <strong>{showCycleConfirm}</strong>.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Questions will be allocated based on the {showCycleConfirm} difficulty distribution.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCycleConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateCycle(showCycleConfirm)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                    showCycleConfirm === 'Excellence'
                      ? 'bg-green-600 hover:bg-green-700'
                      : showCycleConfirm === 'Development'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeInUp">
            <div className="p-4 bg-red-50">
              <h3 className="text-lg font-bold text-red-700">Reset Seen Questions?</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                This will clear all {gmatSeenCount} questions from the history.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                The same questions may appear again in future tests. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetSeenQuestions}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Reset Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
