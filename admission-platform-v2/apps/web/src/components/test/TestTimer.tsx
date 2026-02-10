/**
 * TestTimer Component
 *
 * A reusable timer display component for test-taking functionality.
 * Shows countdown timer with visual urgency indicators.
 *
 * Features:
 * - Displays time in MM:SS or HH:MM:SS format
 * - Color changes at warning (< 5 min) and danger (< 1 min) thresholds
 * - Optional clock icon
 * - Customizable styling via className
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { formatTime } from '../hooks/useTestTimer';

export interface TestTimerProps {
  /** Time remaining in seconds (null to hide timer) */
  timeRemaining: number | null;
  /** Warning threshold in seconds (default: 300 = 5 minutes) */
  warningThreshold?: number;
  /** Danger threshold in seconds (default: 60 = 1 minute) */
  dangerThreshold?: number;
  /** Show clock icon (default: true) */
  showIcon?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional label text (e.g., "Time Remaining") */
  label?: string;
}

export function TestTimer({
  timeRemaining,
  warningThreshold = 300,
  dangerThreshold = 60,
  showIcon = true,
  className = '',
  size = 'md',
  label,
}: TestTimerProps) {
  // Don't render if no time set
  if (timeRemaining === null) {
    return null;
  }

  // Determine urgency level for styling
  const isWarning = timeRemaining > 0 && timeRemaining <= warningThreshold;
  const isDanger = timeRemaining > 0 && timeRemaining <= dangerThreshold;
  const isExpired = timeRemaining <= 0;

  // Color classes based on urgency
  let textColorClass = 'text-gray-800';
  let iconColorClass = 'text-gray-500';

  if (isExpired) {
    textColorClass = 'text-red-600';
    iconColorClass = 'text-red-500';
  } else if (isDanger) {
    textColorClass = 'text-red-600 animate-pulse';
    iconColorClass = 'text-red-500';
  } else if (isWarning) {
    textColorClass = 'text-orange-600';
    iconColorClass = 'text-orange-500';
  }

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'text-sm',
      icon: 'text-sm',
      time: 'text-base',
    },
    md: {
      container: 'text-base',
      icon: 'text-base',
      time: 'text-lg',
    },
    lg: {
      container: 'text-lg',
      icon: 'text-lg',
      time: 'text-2xl',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${sizes.container} ${className}`}>
      {showIcon && (
        <FontAwesomeIcon icon={faClock} className={`${iconColorClass} ${sizes.icon}`} />
      )}
      <div className="flex flex-col">
        {label && (
          <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        )}
        <span className={`font-mono font-bold ${textColorClass} ${sizes.time}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
}

/**
 * Compact inline timer for headers/toolbars
 */
export function TestTimerCompact({
  timeRemaining,
  warningThreshold = 300,
  dangerThreshold = 60,
  className = '',
}: Omit<TestTimerProps, 'showIcon' | 'size' | 'label'>) {
  if (timeRemaining === null) {
    return null;
  }

  const isWarning = timeRemaining > 0 && timeRemaining <= warningThreshold;
  const isDanger = timeRemaining > 0 && timeRemaining <= dangerThreshold;
  const isExpired = timeRemaining <= 0;

  let colorClass = 'text-gray-800';
  if (isExpired || isDanger) {
    colorClass = 'text-red-600';
  } else if (isWarning) {
    colorClass = 'text-orange-600';
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <FontAwesomeIcon icon={faClock} className={`text-sm ${colorClass}`} />
      <span className={`font-mono font-bold ${colorClass}`}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}

/**
 * Large centered timer for pause/transition screens
 */
export function TestTimerLarge({
  timeRemaining,
  label,
  className = '',
}: Pick<TestTimerProps, 'timeRemaining' | 'label' | 'className'>) {
  if (timeRemaining === null) {
    return null;
  }

  return (
    <div className={`text-center ${className}`}>
      {label && (
        <p className="text-sm uppercase tracking-wide mb-2 text-gray-600">{label}</p>
      )}
      <span className="text-5xl font-mono font-bold text-gray-800">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}

export default TestTimer;
