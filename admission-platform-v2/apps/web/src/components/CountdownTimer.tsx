/**
 * Countdown Timer Component
 * Shows countdown to a target date with days, hours, minutes, and seconds
 * Can be used in both tutor and student views
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendarAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface CountdownTimerProps {
  targetDate: string | Date | null;
  label?: string;
  variant?: 'compact' | 'full' | 'card';
  showDate?: boolean;
  onExpired?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

export function CountdownTimer({
  targetDate,
  label = 'Real Test Date',
  variant = 'compact',
  showDate = true,
  onExpired,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: Math.floor(difference / 1000),
        isExpired: false,
      };
    };

    // Initial calculation
    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    // If already expired, call onExpired
    if (initial.isExpired && onExpired) {
      onExpired();
    }

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Call onExpired when countdown reaches zero
      if (remaining.isExpired && onExpired) {
        onExpired();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpired]);

  if (!targetDate) {
    return null;
  }

  if (!timeRemaining) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <FontAwesomeIcon icon={faClock} className="animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUrgencyColor = () => {
    if (timeRemaining.isExpired) return 'text-red-600 bg-red-50 border-red-200';
    if (timeRemaining.days <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (timeRemaining.days <= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-brand-green bg-green-50 border-green-200';
  };

  // Compact variant - single line
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${getUrgencyColor()} text-sm font-semibold`}>
        <FontAwesomeIcon icon={timeRemaining.isExpired ? faExclamationTriangle : faClock} />
        {timeRemaining.isExpired ? (
          <span>Test Date Passed</span>
        ) : (
          <span>
            {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
          </span>
        )}
      </div>
    );
  }

  // Full variant - with boxes for each unit
  if (variant === 'full') {
    return (
      <div className="space-y-3">
        {showDate && (
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span className="font-medium">{label}: {formatDate(targetDate)}</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          {timeRemaining.isExpired ? (
            <div className={`px-6 py-3 rounded-xl border-2 ${getUrgencyColor()} flex items-center gap-2`}>
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
              <span className="font-bold text-lg">Test Date Passed</span>
            </div>
          ) : (
            <>
              {/* Days */}
              <div className={`px-4 py-3 rounded-xl border-2 ${getUrgencyColor()}`}>
                <div className="text-3xl font-bold">{timeRemaining.days}</div>
                <div className="text-xs font-medium uppercase">Days</div>
              </div>
              {/* Hours */}
              <div className={`px-4 py-3 rounded-xl border-2 ${getUrgencyColor()}`}>
                <div className="text-3xl font-bold">{timeRemaining.hours}</div>
                <div className="text-xs font-medium uppercase">Hours</div>
              </div>
              {/* Minutes */}
              <div className={`px-4 py-3 rounded-xl border-2 ${getUrgencyColor()}`}>
                <div className="text-3xl font-bold">{timeRemaining.minutes}</div>
                <div className="text-xs font-medium uppercase">Min</div>
              </div>
              {/* Seconds */}
              <div className={`px-4 py-3 rounded-xl border-2 ${getUrgencyColor()}`}>
                <div className="text-3xl font-bold">{timeRemaining.seconds}</div>
                <div className="text-xs font-medium uppercase">Sec</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Card variant - standalone card
  if (variant === 'card') {
    return (
      <div className={`rounded-2xl border-2 p-6 ${getUrgencyColor()}`}>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FontAwesomeIcon icon={faClock} className="text-2xl" />
            <h3 className="text-lg font-bold">{label}</h3>
          </div>
          {showDate && (
            <p className="text-sm opacity-80">{formatDate(targetDate)}</p>
          )}
        </div>

        {timeRemaining.isExpired ? (
          <div className="text-center py-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-2" />
            <p className="font-bold text-lg">Test Date Has Passed</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {/* Days */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{timeRemaining.days}</div>
              <div className="text-xs font-medium uppercase opacity-80">Days</div>
            </div>
            {/* Hours */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{timeRemaining.hours}</div>
              <div className="text-xs font-medium uppercase opacity-80">Hours</div>
            </div>
            {/* Minutes */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{timeRemaining.minutes}</div>
              <div className="text-xs font-medium uppercase opacity-80">Min</div>
            </div>
            {/* Seconds */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{timeRemaining.seconds}</div>
              <div className="text-xs font-medium uppercase opacity-80">Sec</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
