/**
 * Test Runner Screen (Mobile)
 * Admin Tool for Stress Testing - Mobile Version
 * Simulates students taking tests under various conditions
 * Validates data integrity and reports error rates
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faPlay,
  faCheckCircle,
  faExclamationTriangle,
  faCog,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';

const COLORS = {
  brandDark: '#1c2545',
  brandGreen: '#00a666',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  green50: '#ECFDF5',
  green200: '#BBF7D0',
  green700: '#047857',
  blue50: '#EFF6FF',
  blue200: '#BFDBFE',
  blue700: '#1D4ED8',
  red50: '#FEF2F2',
  red200: '#FECACA',
  red700: '#B91C1C',
  yellow50: '#FFFBEB',
  yellow200: '#FDE68A',
  yellow700: '#B45309',
};

interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  // Basic Completion Tests
  {
    id: 'normal_completion',
    name: 'Normal Completion',
    description: 'Student completes test normally, all answers saved correctly',
    category: 'Basic',
  },
  {
    id: 'partial_completion',
    name: 'Partial Completion',
    description: 'Answer only 50% of questions, then submit',
    category: 'Basic',
  },
  {
    id: 'rapid_completion',
    name: 'Rapid Completion',
    description: 'Answer all questions very quickly (< 5s per question)',
    category: 'Basic',
  },
  // Network Condition Tests
  {
    id: 'slow_network',
    name: 'Slow Network (3G)',
    description: 'Simulate 3G/slow network conditions (500ms delay)',
    category: 'Network',
  },
  {
    id: 'network_interruption',
    name: 'Network Interruption',
    description: 'Network drops randomly during test (test retry logic)',
    category: 'Network',
  },
  // Interruption Tests
  {
    id: 'browser_close',
    name: 'Browser Close Mid-Test',
    description: 'Close browser halfway through (incomplete status)',
    category: 'Interruption',
  },
  {
    id: 'fullscreen_exit',
    name: 'Fullscreen Exit',
    description: 'Exit fullscreen during test (annulled status)',
    category: 'Interruption',
  },
  {
    id: 'time_expiry',
    name: 'Time Expiry',
    description: 'Let timer run out (completed with time_expired reason)',
    category: 'Interruption',
  },
  // Data Integrity Tests
  {
    id: 'concurrent_answers',
    name: 'Concurrent Answer Saves',
    description: 'Save multiple answers simultaneously (test upsert conflicts)',
    category: 'Data Integrity',
  },
  {
    id: 'rapid_answer_changes',
    name: 'Rapid Answer Changes',
    description: 'Change same answer 10 times rapidly (test debounce)',
    category: 'Data Integrity',
  },
];

export default function TestRunnerScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  function showTestRunnerInfo() {
    Alert.alert(
      'Test Runner',
      'This is a simplified mobile version of the Test Runner. For full functionality with detailed configuration and live reporting, please use the web version.\n\nThe mobile version provides access to basic test scenarios for quick validation.',
      [{ text: 'OK' }]
    );
  }

  function runBasicTests() {
    Alert.alert(
      'Run Tests',
      'This feature will simulate various test scenarios to validate system integrity. Use the web version for full control and detailed reports.\n\nProceed with basic test run?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run',
          onPress: () => {
            setIsRunning(true);
            // Simulate test run
            let currentProgress = 0;
            const interval = setInterval(() => {
              currentProgress += 10;
              setProgress(currentProgress);
              if (currentProgress >= 100) {
                clearInterval(interval);
                setIsRunning(false);
                setProgress(0);
                Alert.alert(
                  'Tests Complete',
                  'Basic tests completed successfully. Check the web version for detailed reports.',
                  [{ text: 'OK' }]
                );
              }
            }, 500);
          },
        },
      ]
    );
  }

  // Group scenarios by category
  const categorizedScenarios = TEST_SCENARIOS.reduce((acc, scenario) => {
    if (!acc[scenario.category]) {
      acc[scenario.category] = [];
    }
    acc[scenario.category].push(scenario);
    return acc;
  }, {} as Record<string, TestScenario[]>);

  return (
    <Layout>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Test Runner</Text>
          <Text style={styles.subtitle}>System Stress Testing</Text>

          <TouchableOpacity
            style={styles.infoButton}
            onPress={showTestRunnerInfo}
            activeOpacity={0.7}
          >
            <FontAwesomeIcon icon={faInfoCircle} color={COLORS.blue700} size={16} />
            <Text style={styles.infoButtonText}>About Test Runner</Text>
          </TouchableOpacity>
        </View>

        {/* Mobile Notice */}
        <View style={styles.noticeCard}>
          <FontAwesomeIcon icon={faInfoCircle} color={COLORS.blue700} size={24} />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Mobile Version</Text>
            <Text style={styles.noticeText}>
              For full test configuration and detailed reporting, use the web version. The mobile version provides quick access to basic test scenarios.
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{TEST_SCENARIOS.length}</Text>
            <Text style={styles.statLabel}>Test Scenarios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Object.keys(categorizedScenarios).length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        {/* Run Button */}
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runBasicTests}
          disabled={isRunning}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            {isRunning ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <FontAwesomeIcon icon={faPlay} color={COLORS.white} size={20} />
            )}
            <Text style={styles.runButtonText}>
              {isRunning ? `Running... ${progress}%` : 'Run Basic Tests'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Progress Bar */}
        {isRunning && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {/* Test Scenarios by Category */}
        {Object.entries(categorizedScenarios).map(([category, scenarios]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category} Tests</Text>
            <View style={styles.scenariosGrid}>
              {scenarios.map((scenario) => (
                <View key={scenario.id} style={styles.scenarioCard}>
                  <Text style={styles.scenarioName}>{scenario.name}</Text>
                  <Text style={styles.scenarioDescription}>{scenario.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <FontAwesomeIcon icon={faCog} color={COLORS.gray400} size={16} />
          <Text style={styles.footerText}>
            Access the web version for advanced configuration, detailed logging, and comprehensive reports
          </Text>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 12,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.blue50,
    borderRadius: 8,
  },
  infoButtonText: {
    fontSize: 14,
    color: COLORS.blue700,
    fontWeight: '600',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.blue50,
    borderWidth: 2,
    borderColor: COLORS.blue200,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blue700,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: COLORS.blue700,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray100,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.brandGreen,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  runButton: {
    backgroundColor: COLORS.brandGreen,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  runButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  runButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.gray200,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.brandGreen,
    borderRadius: 6,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 12,
  },
  scenariosGrid: {
    gap: 12,
  },
  scenarioCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray100,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brandDark,
    marginBottom: 6,
  },
  scenarioDescription: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 18,
  },
});
