/**
 * Multiple Choice Question Component (Mobile)
 * Standard multiple choice with single correct answer
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from '../LaTeX';
import { normalizeWhitespace, normalizeOptionText } from '../../lib/textUtils';

const COLORS = {
  brandGreen: '#00a666',
  brandDark: '#1c2545',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray700: '#374151',
  gray800: '#1F2937',
  green50: '#ECFDF5',
};

interface MultipleChoiceQuestionProps {
  questionText: string;
  imageUrl?: string;
  options: Record<string, string>; // { "a": "option text", "b": "option text", ... }
  selectedAnswer?: string;
  onAnswerChange: (answer: string) => void;
}

export function MultipleChoiceQuestion({
  questionText,
  imageUrl,
  options,
  selectedAnswer,
  onAnswerChange,
}: MultipleChoiceQuestionProps) {
  // Use a stable unique identifier for option keys
  const questionId = React.useRef(`mc-${Math.random().toString(36).substr(2, 9)}`).current;

  // Debug logging
  console.log('=== Multiple Choice Question Rendering ===');
  console.log('Question text:', questionText);
  console.log('Has image:', !!imageUrl);
  console.log('Options:', options);
  console.log('Selected answer:', selectedAnswer);

  return (
    <View style={styles.container}>
      {/* Question Text */}
      <View style={styles.questionBox}>
        <LaTeX style={styles.questionText}>{normalizeWhitespace(questionText)}</LaTeX>

        {/* Image if present */}
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {Object.entries(options).map(([key, text]) => {
          const isSelected = selectedAnswer === key;

          return (
            <TouchableOpacity
              key={`${questionId}-${key}`}
              onPress={() => onAnswerChange(key)}
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
                    {key.toUpperCase()}
                  </Text>
                </View>
                <LaTeX style={styles.optionText}>{normalizeOptionText(text)}</LaTeX>
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
  questionBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.gray800,
  },
  imageContainer: {
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
    alignItems: 'center',
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
    fontSize: 16,
    color: COLORS.gray800,
    lineHeight: 22,
  },
});
