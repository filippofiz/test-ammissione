/**
 * Test Type Selection Screen (Mobile)
 * Shows all available test types and allows tutor to select one to configure
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faCog,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

const COLORS = {
  brandDark: '#1c2545',
  brandGreen: '#00a666',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray600: '#4B5563',
  green600: '#059669',
};

export default function TestTypeSelectionScreen() {
  const navigation = useNavigation<any>();
  const [availableTestTypes, setAvailableTestTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestTypes();
  }, []);

  async function loadTestTypes() {
    try {
      const { data, error } = await supabase
        .from('2V_tests')
        .select('test_type');

      if (error) throw error;

      const testTypes = new Set<string>();
      data?.forEach(test => {
        if (test.test_type) {
          testTypes.add(test.test_type);
        }
      });
      setAvailableTestTypes(Array.from(testTypes).sort());
    } catch (err) {
      console.error('Error loading test types:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.brandGreen} />
          <Text style={styles.loadingText}>Loading test types...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <FontAwesomeIcon icon={faArrowLeft} color={COLORS.brandDark} size={20} />
          <Text style={styles.backButtonText}>Back to Test Management</Text>
        </TouchableOpacity>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Configure Test Tracks</Text>
          <Text style={styles.pageSubtitle}>
            Select a test type to configure its tracks and settings
          </Text>
        </View>

        {/* Test Types Grid */}
        {availableTestTypes.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesomeIcon icon={faClipboardList} color={COLORS.gray300} size={64} />
            <Text style={styles.emptyStateTitle}>No Test Types Available</Text>
            <Text style={styles.emptyStateText}>
              No test types have been created yet. Please create some tests first.
            </Text>
          </View>
        ) : (
          <View style={styles.testTypeGrid}>
            {availableTestTypes.map((testType, index) => (
              <TouchableOpacity
                key={testType}
                style={styles.testTypeCard}
                onPress={() => navigation.navigate('TestTrackConfig', { testType })}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>
                  <FontAwesomeIcon icon={faCog} color={COLORS.white} size={32} />
                </View>

                <Text style={styles.testTypeTitle}>{testType}</Text>

                <Text style={styles.testTypeDescription}>
                  Configure test tracks and settings for {testType}
                </Text>

                <View style={styles.arrowIndicator}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray600,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.brandDark,
  },
  pageHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  testTypeGrid: {
    gap: 16,
  },
  testTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: COLORS.gray100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  testTypeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  testTypeDescription: {
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: 16,
    textAlign: 'center',
  },
  arrowIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  arrowText: {
    fontSize: 24,
    color: COLORS.brandGreen,
    fontWeight: 'bold',
  },
});
