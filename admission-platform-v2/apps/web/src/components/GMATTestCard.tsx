/**
 * GMAT Test Card Component
 * Reusable card for displaying GMAT tests (training, assessments, simulations)
 * with lock/unlock functionality and animations
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faLockOpen,
  faRocket,
  faCheckCircle,
  faEye,
  faRedo,
  faClock,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';

// Lock animation styles - same as StudentTestsPage
const lockAnimationStyles = `
  @keyframes bigLockOpen {
    0% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    30% {
      transform: scale(3) rotate(-15deg);
      opacity: 0.8;
    }
    60% {
      transform: scale(4) rotate(10deg) translateY(-20px);
      opacity: 0.3;
    }
    100% {
      transform: scale(5) rotate(0deg) translateY(-30px);
      opacity: 0;
    }
  }

  @keyframes bigLockClose {
    0% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    30% {
      transform: scale(3) rotate(15deg);
      opacity: 0.8;
    }
    60% {
      transform: scale(4) rotate(-10deg);
      opacity: 0.5;
    }
    80% {
      transform: scale(3.5) rotate(5deg);
      opacity: 0.3;
    }
    100% {
      transform: scale(3) rotate(0deg);
      opacity: 0;
    }
  }

  @keyframes bigLockGlowGreen {
    0% {
      filter: drop-shadow(0 0 0px rgba(0, 166, 102, 0));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(0, 166, 102, 1)) drop-shadow(0 0 80px rgba(0, 166, 102, 0.8));
    }
    100% {
      filter: drop-shadow(0 0 0px rgba(0, 166, 102, 0));
    }
  }

  @keyframes bigLockGlowRed {
    0% {
      filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(220, 38, 38, 1)) drop-shadow(0 0 80px rgba(220, 38, 38, 0.8));
    }
    100% {
      filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0));
    }
  }

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes overlayFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .gmat-lock-opening {
    animation: bigLockOpen 1.2s ease-out forwards, bigLockGlowGreen 1.2s ease-out;
  }

  .gmat-lock-closing {
    animation: bigLockClose 1s ease-out forwards, bigLockGlowRed 1s ease-out;
  }

  .gmat-lock-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gmat-lock-overlay.fade-in {
    animation: overlayFadeIn 0.3s ease-out;
  }

  .gmat-lock-overlay.fade-out {
    animation: overlayFadeOut 0.3s ease-out forwards;
  }

  .gmat-giant-lock {
    font-size: 120px;
    color: #00a666;
    position: relative;
  }

  .gmat-giant-lock.locking {
    color: #dc2626;
  }
`;

// Color schemes for different card types
const colorSchemes = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700',
  },
};

interface GMATTestCardProps {
  title: string;
  subtitle?: string;
  questionCount: number;
  timeMinutes?: number;
  completion?: {
    score_percentage: number;
    completed_at?: string;
  };
  isLocked: boolean;
  isAvailable?: boolean;
  showLockControls: boolean;
  onLock?: () => void;
  onUnlock?: () => void;
  onStart: () => void;
  onViewResults?: () => void;
  colorScheme?: keyof typeof colorSchemes;
}

export function GMATTestCard({
  title,
  subtitle,
  questionCount,
  timeMinutes,
  completion,
  isLocked,
  isAvailable = true,
  showLockControls,
  onLock,
  onUnlock,
  onStart,
  onViewResults,
  colorScheme = 'blue',
}: GMATTestCardProps) {
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  const [lockOverlayType, setLockOverlayType] = useState<'lock' | 'unlock'>('unlock');
  const [overlayFadingOut, setOverlayFadingOut] = useState(false);

  const colors = colorSchemes[colorScheme];
  const isCompleted = !!completion;
  const isPassed = completion && completion.score_percentage >= 60;

  const handleLockToggle = async (action: 'lock' | 'unlock') => {
    setLockOverlayType(action);
    setShowLockOverlay(true);
    setOverlayFadingOut(false);

    // Wait for animation
    setTimeout(() => {
      setOverlayFadingOut(true);
      setTimeout(() => {
        setShowLockOverlay(false);
        setOverlayFadingOut(false);
        // Call the actual lock/unlock handler
        if (action === 'lock' && onLock) {
          onLock();
        } else if (action === 'unlock' && onUnlock) {
          onUnlock();
        }
      }, 300);
    }, action === 'unlock' ? 1200 : 1000);
  };

  // If not available (e.g., no questions for cycle), show disabled state
  if (!isAvailable) {
    return (
      <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-500">{title}</h4>
          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
            Not Available
          </span>
        </div>
        {subtitle && <p className="text-sm text-gray-400 mb-2">{subtitle}</p>}
        <div className="text-xs text-gray-400">
          <FontAwesomeIcon icon={faQuestion} className="mr-1" />
          {questionCount} questions
          {timeMinutes && (
            <>
              <span className="mx-1">•</span>
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              {timeMinutes} min
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inject animation styles */}
      <style>{lockAnimationStyles}</style>

      {/* Lock Overlay */}
      {showLockOverlay && (
        <div className={`gmat-lock-overlay ${overlayFadingOut ? 'fade-out' : 'fade-in'}`}>
          <div className={`gmat-giant-lock ${lockOverlayType === 'lock' ? 'locking' : ''}`}>
            <FontAwesomeIcon
              icon={lockOverlayType === 'unlock' ? faLockOpen : faLock}
              className={lockOverlayType === 'unlock' ? 'gmat-lock-opening' : 'gmat-lock-closing'}
            />
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className={`p-4 rounded-xl border-2 transition-all ${
          isLocked
            ? 'border-gray-300 bg-gray-50'
            : isCompleted
            ? `border-green-200 bg-green-50`
            : `${colors.border} ${colors.bg}`
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isLocked && (
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />
            )}
            <h4 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
              {title}
            </h4>
          </div>

          {/* Status Badge */}
          {isCompleted ? (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                isPassed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
              {Math.round(completion.score_percentage)}%
            </span>
          ) : isLocked ? (
            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faLock} className="text-xs" />
              Locked
            </span>
          ) : null}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className={`text-sm mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        )}

        {/* Meta Info */}
        <div className={`text-xs mb-3 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
          <FontAwesomeIcon icon={faQuestion} className="mr-1" />
          {questionCount} questions
          {timeMinutes && (
            <>
              <span className="mx-1">•</span>
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              {timeMinutes} min
            </>
          )}
          {completion?.completed_at && (
            <>
              <span className="mx-1">•</span>
              {new Date(completion.completed_at).toLocaleDateString()}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isLocked ? (
            // Locked state - show lock controls for tutor
            showLockControls && onUnlock ? (
              <button
                onClick={() => handleLockToggle('unlock')}
                className="flex-1 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faLockOpen} />
                Unlock
              </button>
            ) : (
              <div className="flex-1 px-3 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm text-center">
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Test is locked
              </div>
            )
          ) : isCompleted ? (
            // Completed state - show view results and retake
            <>
              {onViewResults && (
                <button
                  onClick={onViewResults}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faEye} />
                  Results
                </button>
              )}
              <button
                onClick={onStart}
                className={`flex-1 px-3 py-2 ${colors.iconBg} ${colors.text} rounded-lg text-sm font-medium hover:opacity-80 transition-colors flex items-center justify-center gap-2`}
              >
                <FontAwesomeIcon icon={faRedo} />
                Retake
              </button>
              {/* Lock button for tutor */}
              {showLockControls && onLock && (
                <button
                  onClick={() => handleLockToggle('lock')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  title="Lock test"
                >
                  <FontAwesomeIcon icon={faLock} />
                </button>
              )}
            </>
          ) : (
            // Unlocked, not completed state - show start
            <>
              <button
                onClick={onStart}
                className="flex-1 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faRocket} />
                Start
              </button>
              {/* Lock button for tutor */}
              {showLockControls && onLock && (
                <button
                  onClick={() => handleLockToggle('lock')}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  title="Lock test"
                >
                  <FontAwesomeIcon icon={faLock} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
