/**
 * GI (Graphical Interpretation) Question Component (Mobile)
 * Displays a chart/graph with context and fill-in-the-blank statements
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from '../LaTeX';
import { Chart } from '../Chart';

const COLORS = {
  brandGreen: '#00a666',
  brandDark: '#1c2545',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  green50: '#ECFDF5',
};

interface GIQuestionProps {
  chartConfig: any; // Chart.js config or image URL
  contextText?: string;
  statementText: string;
  blank1Options: string[];
  blank2Options: string[];
  imageUrl?: string;
  selectedBlank1?: string;
  selectedBlank2?: string;
  onBlank1Change: (value: string) => void;
  onBlank2Change: (value: string) => void;
}

// Custom Dropdown Component
function DropdownSelect({
  options,
  selectedValue,
  onValueChange,
  questionId,
  blankIndex,
}: {
  options: string[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  questionId: string;
  blankIndex: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownText} numberOfLines={1}>
          {selectedValue || 'Select...'}
        </Text>
        <FontAwesomeIcon icon={faChevronDown} size={14} color={COLORS.brandGreen} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={`${questionId}-blank${blankIndex}-opt-${index}`}
                  style={[
                    styles.optionItem,
                    selectedValue === option && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onValueChange(option);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export function GIQuestion({
  chartConfig,
  contextText,
  statementText,
  blank1Options,
  blank2Options,
  imageUrl,
  selectedBlank1,
  selectedBlank2,
  onBlank1Change,
  onBlank2Change,
}: GIQuestionProps) {
  const questionId = React.useRef(`gi-${Math.random().toString(36).substr(2, 9)}`).current;

  // Debug logging
  console.log('=== GI Question Rendering ===');
  console.log('Has imageUrl:', !!imageUrl);
  console.log('Has chartConfig:', !!chartConfig);
  console.log('Context text:', contextText);
  console.log('Statement:', statementText);
  console.log('Blank1 options:', blank1Options);
  console.log('Blank2 options:', blank2Options);
  console.log('Selected blank1:', selectedBlank1);
  console.log('Selected blank2:', selectedBlank2);

  // Parse statement to find blank positions
  const parts = statementText.split(/(\[BLANK1\]|\[BLANK2\])/);

  return (
    <View style={styles.container}>
      {/* Chart/Graph Section */}
      <View style={styles.chartBox}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.chartImage}
            resizeMode="contain"
          />
        ) : chartConfig ? (
          <Chart config={chartConfig} />
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>
              📊 Chart data available in question context
            </Text>
            <Text style={styles.placeholderSubtext}>
              Use the information provided to answer
            </Text>
          </View>
        )}

        {/* Context Text */}
        {contextText && (
          <LaTeX style={styles.contextText}>{contextText}</LaTeX>
        )}
      </View>

      {/* Statement with Dropdowns */}
      <View style={styles.statementBox}>
        <View style={styles.statementContent}>
          {parts.map((part, index) => {
            if (part === '[BLANK1]') {
              return (
                <DropdownSelect
                  key={`${questionId}-part-${index}`}
                  options={blank1Options}
                  selectedValue={selectedBlank1}
                  onValueChange={onBlank1Change}
                  questionId={questionId}
                  blankIndex={1}
                />
              );
            } else if (part === '[BLANK2]') {
              return (
                <DropdownSelect
                  key={`${questionId}-part-${index}`}
                  options={blank2Options}
                  selectedValue={selectedBlank2}
                  onValueChange={onBlank2Change}
                  questionId={questionId}
                  blankIndex={2}
                />
              );
            } else {
              return (
                <LaTeX key={`${questionId}-part-${index}`} style={styles.statementText}>
                  {part}
                </LaTeX>
              );
            }
          })}
        </View>
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>
        Select options from the dropdown menus to complete the statement based on the graph above.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  chartBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  chartImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  chartPlaceholder: {
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  contextText: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray700,
  },
  statementBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  statementContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  statementText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.gray800,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: COLORS.brandGreen,
    borderRadius: 8,
    backgroundColor: COLORS.green50,
    minWidth: 150,
    maxWidth: 200,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.brandDark,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    maxHeight: 400,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  optionItemSelected: {
    backgroundColor: COLORS.green50,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.gray800,
  },
  optionTextSelected: {
    color: COLORS.brandGreen,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },
});
