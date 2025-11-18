/**
 * Home Screen - Role-based routing (Mobile)
 * Detects user role and shows appropriate dashboard
 * TUTOR/ADMIN → TutorSelectionScreen
 * STUDENT → StudentHomeScreen (TODO)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout } from '../components/Layout';
import { getCurrentProfile } from '../lib/auth';
import TutorSelectionScreen from './TutorSelectionScreen';

const BRAND_COLORS = {
  dark: '#1c2545',
  gray600: '#4B5563',
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    detectUserRole();
  }, []);

  useEffect(() => {
    // Navigate to StudentHomeScreen when role is detected as STUDENT
    if (userRole === 'STUDENT') {
      navigation.replace('StudentHome');
    }
  }, [userRole, navigation]);

  async function detectUserRole() {
    const profile = await getCurrentProfile();

    if (!profile) {
      navigation.replace('Login');
      return;
    }

    const roles = (profile.roles as string[]) || [];

    // Determine primary role
    if (roles.includes('TUTOR') || roles.includes('ADMIN')) {
      setUserRole('TUTOR');
    } else if (roles.includes('STUDENT')) {
      setUserRole('STUDENT');
    } else {
      setUserRole('UNKNOWN');
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Layout>
    );
  }

  // Render appropriate dashboard based on role
  if (userRole === 'TUTOR') {
    return <TutorSelectionScreen navigation={navigation} />;
  }

  if (userRole === 'STUDENT') {
    // Show loading while navigation happens in useEffect
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Layout>
    );
  }

  // Unknown role
  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          No role assigned. Please contact your administrator.
        </Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: BRAND_COLORS.dark,
  },
  subtitle: {
    fontSize: 16,
    color: BRAND_COLORS.gray600,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BRAND_COLORS.gray600,
  },
});
