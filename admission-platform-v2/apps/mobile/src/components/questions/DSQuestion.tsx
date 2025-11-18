/**
 * DS (Data Sufficiency) Question Component (Mobile)
 * Displays problem with two statements and standard DS answer options
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from '../LaTeX';
import { normalizeWhitespace } from '../../lib/textUtils';

const COLORS = {
  brandGreen: '#00a666',
  brandDark: '#1c2545',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray700: '#374151',
  gray800: '#1F2937',
  blue50: '#EFF6FF',
  blue500: '#3B82F6',
  blue900: '#1E3A8A',
  green50: '#ECFDF5',
};

interface DSQuestionProps {
  problem: string;
  statement1: string;
  statement2: string;
  selectedAnswer?: string;
  onAnswerChange: (answer: string) => void;
}

const DS_OPTIONS = [
  {
    label: 'A',
    text: 'Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.',
  },
  {
    label: 'B',
    text: 'Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.',
  },
  {
    label: 'C',
    text: 'BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.',
  },
  {
    label: 'D',
    text: 'EACH statement ALONE is sufficient.',
  },
  {
    label: 'E',
    text: 'Statements (1) and (2) TOGETHER are NOT sufficient.',
  },
];

export function DSQuestion({
  problem,
  statement1,
  statement2,
  selectedAnswer,
  onAnswerChange,
}: DSQuestionProps) {
  // Use problem text as a stable unique identifier for option keys
  const questionId = React.useRef(`ds-${Math.random().toString(36).substr(2, 9)}`).current;

  // Debug logging
  console.log('=== DS Question Rendering ===');
  console.log('Problem:', problem);
  console.log('Statement 1:', statement1);
  console.log('Statement 2:', statement2);
  console.log('Selected answer:', selectedAnswer);

  return (
    <View style={styles.container}>
      {/* Problem Statement */}
      <View style={styles.problemBox}>
        <LaTeX style={styles.problemText}>{normalizeWhitespace(problem)}</LaTeX>

        {/* Two Statements */}
        <View style={styles.statementsBox}>
          <View style={styles.statement}>
            <Text style={styles.statementLabel}>(1)</Text>
            <LaTeX style={styles.statementText}>{normalizeWhitespace(statement1)}</LaTeX>
          </View>
          <View style={styles.statement}>
            <Text style={styles.statementLabel}>(2)</Text>
            <LaTeX style={styles.statementText}>{normalizeWhitespace(statement2)}</LaTeX>
          </View>
        </View>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {DS_OPTIONS.map((option) => {
          const isSelected = selectedAnswer === option.label;

          return (
            <TouchableOpacity
              key={`${questionId}-${option.label}`}
              onPress={() => onAnswerChange(option.label)}
              style={[
                styles.optionButton,
                isSelected ? styles.optionButtonSelected : styles.optionButtonUnselected
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionCircle,
                    isSelected ? styles.optionCircleSelected : styles.optionCircleUnselected
                  ]}
                >
                  <Text
                    style={[
                      styles.optionCircleText,
                      isSelected ? styles.optionCircleTextSelected : styles.optionCircleTextUnselected
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
                {isSelected && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size={20}
                    color={COLORS.brandGreen}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  problemBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  problemText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.gray800,
  },
  statementsBox: {
    marginTop: 24,
    backgroundColor: COLORS.blue50,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blue500,
    padding: 16,
    gap: 12,
    borderRadius: 4,
  },
  statement: {
    gap: 4,
  },
  statementLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.blue900,
  },
  statementText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.gray800,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionButtonSelected: {
    borderColor: COLORS.brandGreen,
    backgroundColor: COLORS.green50,
  },
  optionButtonUnselected: {
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCircleSelected: {
    backgroundColor: COLORS.brandGreen,
  },
  optionCircleUnselected: {
    backgroundColor: COLORS.gray200,
  },
  optionCircleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionCircleTextSelected: {
    color: COLORS.white,
  },
  optionCircleTextUnselected: {
    color: COLORS.gray700,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray800,
    lineHeight: 20,
  },
});
