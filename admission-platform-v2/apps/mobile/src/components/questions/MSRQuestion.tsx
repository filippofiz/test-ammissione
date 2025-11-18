/**
 * MSR (Multi-Source Reasoning) Question Component (Mobile)
 * Displays multiple sources (text/tables) with tabbed navigation and multiple sub-questions
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from '../LaTeX';

const COLORS = {
  brandGreen: '#00a666',
  brandDark: '#1c2545',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  blue100: '#DBEAFE',
  blue800: '#1E40AF',
  green50: '#ECFDF5',
};

interface MSRSource {
  content?: string;
  tab_name: string;
  content_type: 'text' | 'table';
  table_data?: string[][];
  table_headers?: string[];
}

interface MSRSubQuestion {
  text: string;
  options: Record<string, string>;
  question_type: string;
  correct_answer: string;
}

interface MSRQuestionProps {
  sources: MSRSource[];
  questions: MSRSubQuestion[];
  selectedAnswers: string[];
  onAnswerChange: (questionIndex: number, answer: string) => void;
}

export function MSRQuestion({ sources, questions, selectedAnswers, onAnswerChange }: MSRQuestionProps) {
  const questionId = React.useRef(`msr-${Math.random().toString(36).substr(2, 9)}`).current;

  // Debug logging
  console.log('=== MSR Question Rendering ===');
  console.log('Sources count:', sources?.length);
  console.log('Questions count:', questions?.length);
  console.log('Selected answers:', selectedAnswers);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      {/* Tabbed Sources Section */}
      <View style={styles.sourcesBox}>
        {/* Tab Headers */}
        <View style={styles.tabHeaders}>
          {sources.map((source, index) => (
            <TouchableOpacity
              key={`${questionId}-tab-${index}`}
              onPress={() => setActiveTab(index)}
              style={[
                styles.tabButton,
                activeTab === index ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === index ? styles.tabTextActive : styles.tabTextInactive
                ]}
              >
                {source.tab_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.tabContent}>
          {sources[activeTab].content_type === 'text' ? (
            <Text style={styles.sourceText}>{sources[activeTab].content || ''}</Text>
          ) : (
            // Table display
            <View style={styles.tableContainer}>
              {/* Table Headers */}
              <View style={styles.tableRow}>
                {sources[activeTab].table_headers?.map((header, i) => (
                  <View key={`${questionId}-theader-${i}`} style={[styles.tableCell, styles.tableHeaderCell]}>
                    <Text style={styles.tableHeaderText}>{header}</Text>
                  </View>
                ))}
              </View>

              {/* Table Body */}
              {sources[activeTab].table_data?.map((row, i) => (
                <View key={`${questionId}-trow-${i}`} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                  {row.map((cell, j) => (
                    <View key={`${questionId}-tcell-${i}-${j}`} style={styles.tableCell}>
                      <Text style={styles.tableCellText}>{cell}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Multiple Sub-Questions */}
      <View style={styles.questionsContainer}>
        {questions.map((question, qIndex) => (
          <View key={`${questionId}-question-${qIndex}`} style={styles.questionBox}>
            {/* Question Text */}
            <View style={styles.questionHeader}>
              <View style={styles.questionBadge}>
                <Text style={styles.questionBadgeText}>Question {qIndex + 1}</Text>
              </View>
              <Text style={styles.questionText}>{question.text}</Text>
            </View>

            {/* Answer Options */}
            <View style={styles.optionsContainer}>
              {Object.entries(question.options).map(([key, value]) => {
                const isSelected = selectedAnswers[qIndex] === key;

                return (
                  <TouchableOpacity
                    key={`${questionId}-option-${qIndex}-${key}`}
                    onPress={() => onAnswerChange(qIndex, key)}
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
                      <Text style={styles.optionText}>{value}</Text>
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
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  sourcesBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.brandGreen,
  },
  tabButtonInactive: {
    backgroundColor: COLORS.gray50,
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.brandGreen,
  },
  tabTextInactive: {
    color: COLORS.gray600,
  },
  tabContent: {
    padding: 20,
    backgroundColor: COLORS.white,
    maxHeight: 400,
  },
  sourceText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.gray800,
  },
  tableContainer: {
    gap: 1,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableRowEven: {
    backgroundColor: COLORS.white,
  },
  tableRowOdd: {
    backgroundColor: COLORS.gray50,
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    padding: 12,
  },
  tableHeaderCell: {
    backgroundColor: COLORS.gray100,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  tableCellText: {
    fontSize: 14,
    color: COLORS.gray800,
  },
  questionsContainer: {
    gap: 24,
  },
  questionBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  questionHeader: {
    marginBottom: 16,
  },
  questionBadge: {
    backgroundColor: COLORS.blue100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  questionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blue800,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
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
