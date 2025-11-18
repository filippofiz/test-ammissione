/**
 * Admin Dashboard Screen (Mobile)
 * Dashboard for administrators with access to:
 * 1. All Tutor functions (Students, Test Management)
 * 2. Admin-specific tools (Test Runner, System Configuration)
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
  faUserGraduate,
  faClipboardList,
  faFlaskVial,
  faCog,
  faChartLine,
  faDatabase,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { getCurrentProfile } from '../lib/auth';
import type { Profile } from '../lib/database.types';

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
  green600: '#059669',
  green700: '#047857',
  blue500: '#3B82F6',
  blue700: '#1D4ED8',
  purple500: '#A855F7',
  purple700: '#7E22CE',
  orange500: '#F97316',
  red500: '#EF4444',
};

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userProfile = await getCurrentProfile();
    setProfile(userProfile);
    setLoading(false);
  }

  if (loading) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.brandGreen} />
          <Text style={styles.loadingText}>Loading...</Text>
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
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Admin Dashboard</Text>
          <Text style={styles.pageSubtitle}>Arched Preparation - Administrator</Text>
        </View>

        {/* Tutor Functions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Tutor Functions</Text>
          </View>

          <View style={styles.cardsRow}>
            {/* Students Card */}
            <TouchableOpacity
              style={[styles.card, { backgroundColor: COLORS.white }]}
              onPress={() => navigation.navigate('TutorStudents')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.brandGreen }]}>
                <FontAwesomeIcon icon={faUserGraduate} color={COLORS.white} size={32} />
              </View>

              <Text style={styles.cardTitle}>Students</Text>

              <Text style={styles.cardDescription}>
                View and manage students, assign tests, track progress, and view results
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>View student list</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>Assign and unlock tests</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>Track progress and results</Text>
                </View>
              </View>

              <View style={styles.arrowIndicator}>
                <Text style={[styles.arrowText, { color: COLORS.brandGreen }]}>→</Text>
              </View>
            </TouchableOpacity>

            {/* Test Management Card */}
            <TouchableOpacity
              style={[styles.card, { backgroundColor: COLORS.white }]}
              onPress={() => navigation.navigate('TestManagement')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.blue500 }]}>
                <FontAwesomeIcon icon={faClipboardList} color={COLORS.white} size={32} />
              </View>

              <Text style={styles.cardTitle}>Test Management</Text>

              <Text style={styles.cardDescription}>
                Configure test settings, manage section order, and control test availability
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: COLORS.blue500 }]} />
                  <Text style={styles.featureText}>Manage section order</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: COLORS.blue500 }]} />
                  <Text style={styles.featureText}>Configure test settings</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: COLORS.blue500 }]} />
                  <Text style={styles.featureText}>Control availability</Text>
                </View>
              </View>

              <View style={styles.arrowIndicator}>
                <Text style={[styles.arrowText, { color: COLORS.blue500 }]}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Tools Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: COLORS.purple500 }]} />
            <Text style={styles.sectionTitle}>Admin Tools</Text>
          </View>

          <View style={styles.cardsColumn}>
            {/* Test Runner Card */}
            <TouchableOpacity
              style={[styles.card, { backgroundColor: COLORS.white }]}
              onPress={() => navigation.navigate('TestRunner')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.purple500 }]}>
                <FontAwesomeIcon icon={faFlaskVial} color={COLORS.white} size={32} />
              </View>

              <Text style={styles.cardTitle}>Test Runner</Text>

              <Text style={styles.cardDescription}>
                Comprehensive testing system to validate platform integrity
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: COLORS.purple500 }]} />
                  <Text style={styles.featureText}>Simulate test scenarios</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: COLORS.purple500 }]} />
                  <Text style={styles.featureText}>Validate data integrity</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: COLORS.purple500 }]} />
                  <Text style={styles.featureText}>Generate reports</Text>
                </View>
              </View>

              <View style={styles.arrowIndicator}>
                <Text style={[styles.arrowText, { color: COLORS.purple500 }]}>→</Text>
              </View>
            </TouchableOpacity>

            {/* Analytics Card - Coming Soon */}
            <View style={[styles.card, styles.disabledCard]}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.orange500, opacity: 0.6 }]}>
                <FontAwesomeIcon icon={faChartLine} color={COLORS.white} size={32} />
              </View>

              <Text style={styles.cardTitle}>Analytics</Text>

              <Text style={styles.cardDescription}>
                View system-wide statistics and performance metrics
              </Text>

              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>

            {/* Database Card - Coming Soon */}
            <View style={[styles.card, styles.disabledCard]}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.red500, opacity: 0.6 }]}>
                <FontAwesomeIcon icon={faDatabase} color={COLORS.white} size={32} />
              </View>

              <Text style={styles.cardTitle}>Database</Text>

              <Text style={styles.cardDescription}>
                Manage database migrations and data integrity
              </Text>

              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>

            {/* Settings Card - Coming Soon */}
            <View style={[styles.card, styles.disabledCard]}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.gray500, opacity: 0.6 }]}>
                <FontAwesomeIcon icon={faCog} color={COLORS.white} size={32} />
              </View>

              <Text style={styles.cardTitle}>Settings</Text>

              <Text style={styles.cardDescription}>
                Configure system-wide settings and preferences
              </Text>

              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
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
  pageHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 32,
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 4,
    height: 32,
    backgroundColor: COLORS.brandGreen,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandDark,
  },
  cardsRow: {
    gap: 16,
  },
  cardsColumn: {
    gap: 16,
  },
  card: {
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
  disabledCard: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.brandGreen,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  arrowIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.orange500,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
