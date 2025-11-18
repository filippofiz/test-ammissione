/**
 * Test Management Screen (Mobile)
 * Central hub for all test-related management tasks
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faArrowsUpDown,
  faCog,
  faBrain,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';

const COLORS = {
  brandDark: '#1c2545',
  brandGreen: '#00a666',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  blue500: '#3B82F6',
  blue700: '#1D4ED8',
  green600: '#059669',
};

export default function TestManagementScreen() {
  const navigation = useNavigation<any>();

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={16} color={COLORS.brandGreen} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Test Management</Text>
          <Text style={styles.pageSubtitle}>Configure Tests and Settings</Text>

          {/* Management Options */}
          <View style={styles.optionsGrid}>
            {/* Section Order */}
            <TouchableOpacity
              style={[styles.optionCard, { borderColor: COLORS.blue500 }]}
              onPress={() => navigation.navigate('ManageSectionOrder')}
            >
              <View style={[styles.optionIcon, { backgroundColor: COLORS.blue500 }]}>
                <FontAwesomeIcon icon={faArrowsUpDown} size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionTitle}>Section Order</Text>
              <Text style={styles.optionDescription}>
                Configure the display order of test sections in the test track
              </Text>
            </TouchableOpacity>

            {/* Test Settings */}
            <TouchableOpacity
              style={[styles.optionCard, { borderColor: COLORS.brandGreen }]}
              onPress={() => navigation.navigate('TestTrackConfig')}
            >
              <View style={[styles.optionIcon, { backgroundColor: COLORS.brandGreen }]}>
                <FontAwesomeIcon icon={faCog} size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionTitle}>Test Settings</Text>
              <Text style={styles.optionDescription}>
                Configure test durations, scoring, and other settings
              </Text>
            </TouchableOpacity>

            {/* Algorithm Config */}
            <TouchableOpacity
              style={[styles.optionCard, { borderColor: COLORS.blue700 }]}
              onPress={() => navigation.navigate('AlgorithmConfig')}
            >
              <View style={[styles.optionIcon, { backgroundColor: COLORS.blue700 }]}>
                <FontAwesomeIcon icon={faBrain} size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionTitle}>Algorithm Config</Text>
              <Text style={styles.optionDescription}>
                Configure adaptive algorithms and scoring methods
              </Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.brandGreen,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: 24,
  },
  optionsGrid: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
});
