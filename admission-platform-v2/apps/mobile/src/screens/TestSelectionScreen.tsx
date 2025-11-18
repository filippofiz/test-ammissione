import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { Layout } from '../components/Layout';
import { getCurrentProfile } from '../lib/auth';
import type { Profile } from '../lib/database.types';

const BRAND_COLORS = {
  primary: '#1E40AF',
  green: '#00a666',
  greenLight: '#10b981',
  dark: '#1c2545',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
};

export function TestSelectionScreen() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfile();
    // Start animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getCurrentProfile();

    if (!userProfile) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
      return;
    }

    const roles = (userProfile.roles as string[]) || [];
    const tests = (userProfile.tests as string[]) || [];

    // Security: Only students should access this page
    if (!roles.includes('STUDENT')) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
      return;
    }

    // If user has only one test, redirect them directly (they shouldn't be here)
    if (!tests || tests.length <= 1) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
      return;
    }

    setProfile(userProfile);
    setLoading(false);
  };

  const handleProceed = () => {
    if (!selectedTest) return;
    // Navigate to home with selected test (in future we'll pass the test context)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' as never, params: { test: selectedTest } as never }],
    });
  };

  const tests = (profile?.tests as string[]) || [];

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <Layout>
      <View style={styles.container}>
          {/* Background decoration - animated gradient circle */}
          <Animated.View
            style={[
              styles.bgDecoration,
              {
                transform: [{ translateX }, { translateY }],
              },
            ]}
          />

          <View style={styles.contentContainer}>
            {/* Title Section (outside card) */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{t('testSelection.title')}</Text>
              <Text style={styles.subtitle}>{t('testSelection.subtitle')}</Text>
            </View>

            {/* Selection Card */}
            <View style={styles.card}>
              {/* Decorative element inside card */}
              <View style={styles.cardDecoration} />

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={BRAND_COLORS.green} />
                  <Text style={styles.loadingText}>{t('testSelection.loading')}</Text>
                </View>
              ) : tests.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <FontAwesome5 name="inbox" size={60} color={BRAND_COLORS.gray600} style={{ opacity: 0.5, marginBottom: 16 }} />
                  <Text style={styles.emptyText}>{t('testSelection.noTests')}</Text>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View style={styles.cardTitleContainer}>
                    <FontAwesome5 name="book" size={20} color={BRAND_COLORS.dark} style={{ marginRight: 8 }} />
                    <Text style={styles.cardTitle}>{t('testSelection.availableTests')}</Text>
                  </View>

                  <View style={styles.testsContainer}>
                    {tests.map((test) => (
                      <TouchableOpacity
                        key={test}
                        onPress={() => setSelectedTest(test)}
                        activeOpacity={0.7}
                        style={[
                          styles.testButton,
                          selectedTest === test && styles.testButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.testButtonText,
                            selectedTest === test && styles.testButtonTextSelected,
                          ]}
                        >
                          {test}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={handleProceed}
                    disabled={!selectedTest}
                    activeOpacity={0.8}
                    style={[
                      styles.proceedButton,
                      !selectedTest && styles.proceedButtonDisabled,
                    ]}
                  >
                    <Text style={styles.proceedButtonText}>{t('testSelection.proceed')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Footer */}
            <Text style={styles.footer}>© 2025 Up to Ten. All rights reserved.</Text>
          </View>
        </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.gray50,
    position: 'relative',
    justifyContent: 'center',
  },
  bgDecoration: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: BRAND_COLORS.green,
    opacity: 0.08,
  },
  contentContainer: {
    flex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: BRAND_COLORS.gray600,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDecoration: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: BRAND_COLORS.green,
    opacity: 0.06,
  },
  formContainer: {
    position: 'relative',
    zIndex: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BRAND_COLORS.gray600,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: BRAND_COLORS.gray600,
    textAlign: 'center',
  },
  testsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: BRAND_COLORS.gray50,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.gray200,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonSelected: {
    backgroundColor: BRAND_COLORS.green,
    borderColor: BRAND_COLORS.green,
    shadowColor: BRAND_COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  testButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: BRAND_COLORS.dark,
  },
  testButtonTextSelected: {
    color: '#fff',
  },
  proceedButton: {
    backgroundColor: BRAND_COLORS.dark,
    minHeight: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  proceedButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    fontSize: 14,
    color: BRAND_COLORS.gray600,
    textAlign: 'center',
    marginTop: 24,
  },
});
