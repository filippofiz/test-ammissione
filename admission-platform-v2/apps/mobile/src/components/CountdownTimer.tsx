/**
 * Countdown Timer Component (React Native)
 * Shows countdown to a target date with days, hours, minutes, and seconds
 * Can be used in both tutor and student views
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

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
      <View style={styles.loadingContainer}>
        <FontAwesome name="clock-o" size={16} color="#6B7280" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
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

  const getUrgencyStyle = () => {
    if (timeRemaining.isExpired) return styles.urgencyRed;
    if (timeRemaining.days <= 7) return styles.urgencyOrange;
    if (timeRemaining.days <= 30) return styles.urgencyYellow;
    return styles.urgencyGreen;
  };

  // Compact variant - single line
  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, getUrgencyStyle()]}>
        <FontAwesome
          name={timeRemaining.isExpired ? 'exclamation-triangle' : 'clock-o'}
          size={14}
          color="#FFF"
        />
        <Text style={styles.compactText}>
          {timeRemaining.isExpired
            ? 'Test Date Passed'
            : `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`}
        </Text>
      </View>
    );
  }

  // Full variant - with boxes for each unit
  if (variant === 'full') {
    return (
      <View style={styles.fullContainer}>
        {showDate && (
          <View style={styles.dateContainer}>
            <FontAwesome name="calendar" size={14} color="#6B7280" />
            <Text style={styles.dateText}>
              {label}: {formatDate(targetDate)}
            </Text>
          </View>
        )}
        <View style={styles.timeBoxesContainer}>
          {timeRemaining.isExpired ? (
            <View style={[styles.expiredBox, getUrgencyStyle()]}>
              <FontAwesome name="exclamation-triangle" size={20} color="#FFF" />
              <Text style={styles.expiredText}>Test Date Passed</Text>
            </View>
          ) : (
            <>
              {/* Days */}
              <View style={[styles.timeBox, getUrgencyStyle()]}>
                <Text style={styles.timeValue}>{timeRemaining.days}</Text>
                <Text style={styles.timeLabel}>Days</Text>
              </View>
              {/* Hours */}
              <View style={[styles.timeBox, getUrgencyStyle()]}>
                <Text style={styles.timeValue}>{timeRemaining.hours}</Text>
                <Text style={styles.timeLabel}>Hours</Text>
              </View>
              {/* Minutes */}
              <View style={[styles.timeBox, getUrgencyStyle()]}>
                <Text style={styles.timeValue}>{timeRemaining.minutes}</Text>
                <Text style={styles.timeLabel}>Min</Text>
              </View>
              {/* Seconds */}
              <View style={[styles.timeBox, getUrgencyStyle()]}>
                <Text style={styles.timeValue}>{timeRemaining.seconds}</Text>
                <Text style={styles.timeLabel}>Sec</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // Card variant - standalone card
  if (variant === 'card') {
    return (
      <View style={[styles.cardContainer, getUrgencyStyle()]}>
        <View style={styles.cardHeader}>
          <FontAwesome name="clock-o" size={20} color="#FFF" />
          <Text style={styles.cardTitle}>{label}</Text>
        </View>
        {showDate && <Text style={styles.cardDate}>{formatDate(targetDate)}</Text>}

        {timeRemaining.isExpired ? (
          <View style={styles.cardExpired}>
            <FontAwesome name="exclamation-triangle" size={32} color="#FFF" />
            <Text style={styles.cardExpiredText}>Test Date Has Passed</Text>
          </View>
        ) : (
          <View style={styles.cardTimeBoxes}>
            {/* Days */}
            <View style={styles.cardTimeBox}>
              <Text style={styles.cardTimeValue}>{timeRemaining.days}</Text>
              <Text style={styles.cardTimeLabel}>Days</Text>
            </View>
            {/* Hours */}
            <View style={styles.cardTimeBox}>
              <Text style={styles.cardTimeValue}>{timeRemaining.hours}</Text>
              <Text style={styles.cardTimeLabel}>Hours</Text>
            </View>
            {/* Minutes */}
            <View style={styles.cardTimeBox}>
              <Text style={styles.cardTimeValue}>{timeRemaining.minutes}</Text>
              <Text style={styles.cardTimeLabel}>Min</Text>
            </View>
            {/* Seconds */}
            <View style={styles.cardTimeBox}>
              <Text style={styles.cardTimeValue}>{timeRemaining.seconds}</Text>
              <Text style={styles.cardTimeLabel}>Sec</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },

  // Urgency colors
  urgencyGreen: {
    backgroundColor: '#10B981',
  },
  urgencyYellow: {
    backgroundColor: '#F59E0B',
  },
  urgencyOrange: {
    backgroundColor: '#F97316',
  },
  urgencyRed: {
    backgroundColor: '#EF4444',
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
  },
  compactText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Full variant
  fullContainer: {
    gap: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  timeBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  timeBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  timeValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  timeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  expiredBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  expiredText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Card variant
  cardContainer: {
    borderRadius: 16,
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 16,
  },
  cardExpired: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  cardExpiredText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardTimeBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTimeBox: {
    flex: 1,
    alignItems: 'center',
  },
  cardTimeValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  cardTimeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.8,
    marginTop: 4,
  },
});
