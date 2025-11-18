/**
 * TA (Table Analysis) Question Component (Mobile)
 * Displays a data table with statements to evaluate as True/False
 */

import React from 'react';
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
  gray700: '#374151',
  gray800: '#1F2937',
  green50: '#ECFDF5',
};

interface TAStatement {
  text: string;
  is_true?: boolean; // For answer validation (not shown to student)
}

interface TAQuestionProps {
  tableTitle?: string;
  columnHeaders: string[];
  tableData: string[][];
  statements: TAStatement[];
  selectedAnswers: Record<number, 'true' | 'false'>;
  onAnswerChange: (statementIndex: number, value: 'true' | 'false') => void;
}

export function TAQuestion({
  tableTitle,
  columnHeaders,
  tableData,
  statements,
  selectedAnswers,
  onAnswerChange,
}: TAQuestionProps) {
  const questionId = React.useRef(`ta-${Math.random().toString(36).substr(2, 9)}`).current;

  // Debug logging
  console.log('=== TA Question Rendering ===');
  console.log('Table title:', tableTitle);
  console.log('Column headers:', columnHeaders);
  console.log('Table data rows:', tableData?.length);
  console.log('Statements count:', statements?.length);
  console.log('Selected answers:', selectedAnswers);

  return (
    <View style={styles.container}>
      {/* Table Section */}
      <View style={styles.tableBox}>
        {tableTitle && (
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>{tableTitle}</Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.tableScroll}
        >
          <View style={styles.tableContainer}>
            {/* Table Headers */}
            <View style={styles.tableRow}>
              {columnHeaders.map((header, i) => (
                <View key={`${questionId}-header-${i}`} style={[styles.tableCell, styles.tableHeaderCell]}>
                  <Text style={styles.tableHeaderText}>{header}</Text>
                </View>
              ))}
            </View>

            {/* Table Body */}
            <ScrollView
              style={styles.tableBodyScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {tableData.map((row, i) => (
                <View
                  key={`${questionId}-row-${i}`}
                  style={[
                    styles.tableRow,
                    i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                  ]}
                >
                  {row.map((cell, j) => (
                    <View key={`${questionId}-cell-${i}-${j}`} style={styles.tableCell}>
                      <Text style={styles.tableCellText}>{cell}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Statements to Evaluate */}
      <View style={styles.statementsBox}>
        <View style={styles.statementsHeader}>
          <Text style={styles.statementsTitle}>
            For each statement, select True or False based on the table above
          </Text>
        </View>

        {statements.map((statement, index) => (
          <View key={`${questionId}-statement-${index}`} style={styles.statementItem}>
            {/* Statement Text */}
            <Text style={styles.statementText}>{statement.text}</Text>

            {/* True/False Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => onAnswerChange(index, 'true')}
                style={[
                  styles.answerButton,
                  selectedAnswers[index] === 'true' ? styles.answerButtonSelected : styles.answerButtonUnselected
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.answerCircle,
                    selectedAnswers[index] === 'true' ? styles.answerCircleSelected : styles.answerCircleUnselected
                  ]}
                >
                  <Text
                    style={[
                      styles.answerCircleText,
                      selectedAnswers[index] === 'true' ? styles.answerCircleTextSelected : styles.answerCircleTextUnselected
                    ]}
                  >
                    T
                  </Text>
                </View>
                <Text style={styles.answerButtonText}>True</Text>
                {selectedAnswers[index] === 'true' && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size={16}
                    color={COLORS.brandGreen}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onAnswerChange(index, 'false')}
                style={[
                  styles.answerButton,
                  selectedAnswers[index] === 'false' ? styles.answerButtonSelected : styles.answerButtonUnselected
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.answerCircle,
                    selectedAnswers[index] === 'false' ? styles.answerCircleSelected : styles.answerCircleUnselected
                  ]}
                >
                  <Text
                    style={[
                      styles.answerCircleText,
                      selectedAnswers[index] === 'false' ? styles.answerCircleTextSelected : styles.answerCircleTextUnselected
                    ]}
                  >
                    F
                  </Text>
                </View>
                <Text style={styles.answerButtonText}>False</Text>
                {selectedAnswers[index] === 'false' && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size={16}
                    color={COLORS.brandGreen}
                  />
                )}
              </TouchableOpacity>
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
  tableBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  tableHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray200,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  tableScroll: {
    maxHeight: 400,
  },
  tableContainer: {
    // Ensures header and body scroll together
  },
  tableBodyScroll: {
    maxHeight: 350,
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
    width: 120, // Fixed width instead of minWidth for alignment
    borderWidth: 1,
    borderColor: COLORS.gray300,
    padding: 12,
    justifyContent: 'center',
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
  statementsBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  statementsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray200,
  },
  statementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  statementItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  statementText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.gray800,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  answerButtonSelected: {
    borderColor: COLORS.brandGreen,
    backgroundColor: COLORS.green50,
  },
  answerButtonUnselected: {
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  answerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerCircleSelected: {
    backgroundColor: COLORS.brandGreen,
  },
  answerCircleUnselected: {
    backgroundColor: COLORS.gray200,
  },
  answerCircleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  answerCircleTextSelected: {
    color: COLORS.white,
  },
  answerCircleTextUnselected: {
    color: COLORS.gray700,
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
