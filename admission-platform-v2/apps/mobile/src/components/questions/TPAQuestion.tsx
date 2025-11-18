/**
 * TPA (Two-Part Analysis) Question Component (Mobile)
 * Displays scenario with two-column answer grid where student selects one option per column
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
};

interface TPAQuestionProps {
  scenario: string;
  column1Title: string;
  column2Title: string;
  sharedOptions: string[];
  selectedColumn1?: string;
  selectedColumn2?: string;
  onColumn1Change: (value: string) => void;
  onColumn2Change: (value: string) => void;
}

export function TPAQuestion({
  scenario,
  column1Title,
  column2Title,
  sharedOptions,
  selectedColumn1,
  selectedColumn2,
  onColumn1Change,
  onColumn2Change,
}: TPAQuestionProps) {
  // Use a stable unique identifier for option keys
  const questionId = React.useRef(`tpa-${Math.random().toString(36).substr(2, 9)}`).current;

  // Debug logging
  console.log('=== TPA Question Rendering ===');
  console.log('Scenario:', scenario);
  console.log('Column 1 title:', column1Title);
  console.log('Column 2 title:', column2Title);
  console.log('Shared options count:', sharedOptions?.length);
  console.log('Selected column 1:', selectedColumn1);
  console.log('Selected column 2:', selectedColumn2);

  return (
    <View style={styles.container}>
      {/* Scenario Section */}
      <View style={styles.scenarioBox}>
        <Text style={styles.scenarioText}>{scenario}</Text>
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>
        Select one option in each column. Each option can be selected in both columns.
      </Text>

      {/* Two-Column Selection Grid */}
      <View style={styles.gridBox}>
        {/* Header Row */}
        <View style={styles.gridHeader}>
          <View style={[styles.gridHeaderCell, styles.gridHeaderCellFirst]}>
            <Text style={styles.gridHeaderText}>Options</Text>
          </View>
          <View style={[styles.gridHeaderCell, styles.gridHeaderCellCol]}>
            <Text style={[styles.gridHeaderText, styles.gridHeaderTextSmall]}>{column1Title}</Text>
          </View>
          <View style={[styles.gridHeaderCell, styles.gridHeaderCellCol]}>
            <Text style={[styles.gridHeaderText, styles.gridHeaderTextSmall]}>{column2Title}</Text>
          </View>
        </View>

        {/* Option Rows */}
        <ScrollView style={styles.gridBody}>
          {sharedOptions.map((option, index) => {
            const isSelectedCol1 = selectedColumn1 === option;
            const isSelectedCol2 = selectedColumn2 === option;

            return (
              <View key={`${questionId}-opt-${index}`} style={styles.gridRow}>
                {/* Option Text */}
                <View style={styles.gridOptionCell}>
                  <Text style={styles.gridOptionText}>{option}</Text>
                </View>

                {/* Column 1 Selection */}
                <View style={styles.gridSelectionCell}>
                  <TouchableOpacity
                    onPress={() => onColumn1Change(option)}
                    style={[
                      styles.selectionCircle,
                      isSelectedCol1 ? styles.selectionCircleSelected : styles.selectionCircleUnselected
                    ]}
                    activeOpacity={0.7}
                  >
                    {isSelectedCol1 && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        size={20}
                        color={COLORS.white}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Column 2 Selection */}
                <View style={styles.gridSelectionCell}>
                  <TouchableOpacity
                    onPress={() => onColumn2Change(option)}
                    style={[
                      styles.selectionCircle,
                      isSelectedCol2 ? styles.selectionCircleSelected : styles.selectionCircleUnselected
                    ]}
                    activeOpacity={0.7}
                  >
                    {isSelectedCol2 && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        size={20}
                        color={COLORS.white}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  scenarioBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  scenarioText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.gray800,
  },
  instructions: {
    fontSize: 14,
    color: COLORS.gray700,
    fontStyle: 'italic',
  },
  gridBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray200,
  },
  gridHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRightWidth: 2,
    borderRightColor: COLORS.gray200,
  },
  gridHeaderCellFirst: {
    flex: 2,
  },
  gridHeaderCellCol: {
    flex: 1,
    alignItems: 'center',
  },
  gridHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  gridHeaderTextSmall: {
    fontSize: 12,
    textAlign: 'center',
  },
  gridBody: {
    maxHeight: 400,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  gridOptionCell: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRightWidth: 2,
    borderRightColor: COLORS.gray200,
    justifyContent: 'center',
  },
  gridOptionText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.gray800,
  },
  gridSelectionCell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: COLORS.gray200,
  },
  selectionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircleSelected: {
    borderColor: COLORS.brandGreen,
    backgroundColor: COLORS.brandGreen,
  },
  selectionCircleUnselected: {
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
  },
});
