/**
 * Tutor Selection Screen
 * Initial screen for tutors to choose between:
 * 1. Managing Students
 * 2. Managing Tests
 * 3. Admin Dashboard (for admins only)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUserGraduate,
  faClipboardList,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { getCurrentProfile } from '../lib/auth';
import type { Profile } from '../lib/database.types';

const COLORS = {
  brandGreen: '#00a666',
  brandDark: '#1c2545',
  white: '#ffffff',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray600: '#4B5563',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  purple500: '#A855F7',
  purple600: '#9333EA',
  purple700: '#7E22CE',
  green600: '#059669',
};

export default function TutorSelectionScreen({ navigation }: any) {
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

  const roles = (profile?.roles as string[]) || [];
  const isAdmin = roles.includes('ADMIN');

  if (loading) {
    return (
      <Layout pageTitle="Tutor Dashboard">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brandGreen} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Tutor Dashboard">
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        {/* Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Students Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('TutorHome')}
            style={styles.card}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.brandGreen }]}>
              <FontAwesomeIcon icon={faUserGraduate} size={32} color={COLORS.white} />
            </View>
            <Text style={styles.cardTitle}>Students</Text>
            <Text style={styles.cardDescription}>
              View and manage your students, assign tests, track progress, and view results
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.bullet, { backgroundColor: COLORS.brandGreen }]} />
                <Text style={styles.featureText}>View student list</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.bullet, { backgroundColor: COLORS.brandGreen }]} />
                <Text style={styles.featureText}>Assign and unlock tests</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.bullet, { backgroundColor: COLORS.brandGreen }]} />
                <Text style={styles.featureText}>Track progress and results</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Test Management Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('TestManagement')}
            style={styles.card}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.blue500 }]}>
              <FontAwesomeIcon icon={faClipboardList} size={32} color={COLORS.white} />
            </View>
            <Text style={styles.cardTitle}>Test Management</Text>
            <Text style={styles.cardDescription}>
              Manage the test catalog, upload questions, and configure test settings
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.bullet, { backgroundColor: COLORS.blue500 }]} />
                <Text style={styles.featureText}>Upload test questions</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.bullet, { backgroundColor: COLORS.blue500 }]} />
                <Text style={styles.featureText}>Manage test catalog</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.bullet, { backgroundColor: COLORS.blue500 }]} />
                <Text style={styles.featureText}>Configure test settings</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Admin Dashboard Card - Only for Admins */}
          {isAdmin && (
            <TouchableOpacity
              onPress={() => {
                // TODO: Navigate to admin dashboard
                alert('Admin Dashboard coming soon');
              }}
              style={styles.card}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.purple500 }]}>
                <FontAwesomeIcon icon={faUserShield} size={32} color={COLORS.white} />
              </View>
              <Text style={styles.cardTitle}>Admin Dashboard</Text>
              <Text style={styles.cardDescription}>
                Full administrative access to manage users, tests, and system settings
              </Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={[styles.bullet, { backgroundColor: COLORS.purple500 }]} />
                  <Text style={styles.featureText}>Manage all users</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.bullet, { backgroundColor: COLORS.purple500 }]} />
                  <Text style={styles.featureText}>System configuration</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.bullet, { backgroundColor: COLORS.purple500 }]} />
                  <Text style={styles.featureText}>Full access control</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray600,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: COLORS.gray100,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.brandDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
});
