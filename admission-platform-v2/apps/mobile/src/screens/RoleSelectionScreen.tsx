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

export function RoleSelectionScreen() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
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

    // If user has only one role, redirect them directly (they shouldn't be here)
    if (roles.length === 1) {
      const tests = (userProfile.tests as string[]) || [];
      const role = roles[0];

      if (role === 'STUDENT') {
        if (tests && tests.length > 1) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'TestSelection' as never }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' as never }],
          });
        }
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }
      return;
    }

    setProfile(userProfile);
    setLoading(false);
  };

  const handleProceed = () => {
    if (!selectedRole || !profile) return;

    const tests = (profile.tests as string[]) || [];

    if (selectedRole === 'STUDENT') {
      // Check tests
      if (tests && tests.length === 1) {
        // Navigate directly to home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      } else if (tests && tests.length > 1) {
        // Navigate to test selection
        navigation.reset({
          index: 0,
          routes: [{ name: 'TestSelection' as never }],
        });
      } else {
        Alert.alert('No Tests', 'No tests have been assigned to you yet.');
      }
    } else if (selectedRole === 'TUTOR') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TutorHome' as never }],
      });
    } else if (selectedRole === 'ADMIN') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AdminDashboard' as never }],
      });
    }
  };

  const roles = (profile?.roles as string[]) || [];

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
              <Text style={styles.title}>{t('roleSelection.title')}</Text>
              <Text style={styles.subtitle}>{t('roleSelection.subtitle')}</Text>
            </View>

            {/* Selection Card */}
            <View style={styles.card}>
              {/* Decorative element inside card */}
              <View style={styles.cardDecoration} />

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={BRAND_COLORS.green} />
                  <Text style={styles.loadingText}>{t('roleSelection.loading')}</Text>
                </View>
              ) : roles.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <FontAwesome5 name="inbox" size={60} color={BRAND_COLORS.gray600} style={{ opacity: 0.5, marginBottom: 16 }} />
                  <Text style={styles.emptyText}>{t('roleSelection.noRoles')}</Text>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View style={styles.cardTitleContainer}>
                    <FontAwesome5 name="user" size={20} color={BRAND_COLORS.dark} style={{ marginRight: 8 }} />
                    <Text style={styles.cardTitle}>{t('roleSelection.availableRoles')}</Text>
                  </View>

                  <View style={styles.rolesContainer}>
                    {roles.includes('STUDENT') && (
                      <TouchableOpacity
                        onPress={() => setSelectedRole('STUDENT')}
                        activeOpacity={0.7}
                        style={[
                          styles.roleButton,
                          selectedRole === 'STUDENT' && styles.roleButtonSelected,
                        ]}
                      >
                        <View style={styles.roleButtonContent}>
                          <FontAwesome5
                            name="graduation-cap"
                            size={16}
                            color={selectedRole === 'STUDENT' ? '#fff' : BRAND_COLORS.dark}
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={[
                              styles.roleButtonText,
                              selectedRole === 'STUDENT' && styles.roleButtonTextSelected,
                            ]}
                          >
                            {t('roleSelection.student')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {roles.includes('TUTOR') && (
                      <TouchableOpacity
                        onPress={() => setSelectedRole('TUTOR')}
                        activeOpacity={0.7}
                        style={[
                          styles.roleButton,
                          selectedRole === 'TUTOR' && styles.roleButtonSelected,
                        ]}
                      >
                        <View style={styles.roleButtonContent}>
                          <FontAwesome5
                            name="chalkboard-teacher"
                            size={16}
                            color={selectedRole === 'TUTOR' ? '#fff' : BRAND_COLORS.dark}
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={[
                              styles.roleButtonText,
                              selectedRole === 'TUTOR' && styles.roleButtonTextSelected,
                            ]}
                          >
                            {t('roleSelection.tutor')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {roles.includes('ADMIN') && (
                      <TouchableOpacity
                        onPress={() => setSelectedRole('ADMIN')}
                        activeOpacity={0.7}
                        style={[
                          styles.roleButton,
                          selectedRole === 'ADMIN' && styles.roleButtonSelected,
                        ]}
                      >
                        <View style={styles.roleButtonContent}>
                          <FontAwesome5
                            name="user-shield"
                            size={16}
                            color={selectedRole === 'ADMIN' ? '#fff' : BRAND_COLORS.dark}
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={[
                              styles.roleButtonText,
                              selectedRole === 'ADMIN' && styles.roleButtonTextSelected,
                            ]}
                          >
                            {t('roleSelection.admin')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={handleProceed}
                    disabled={!selectedRole}
                    activeOpacity={0.8}
                    style={[
                      styles.proceedButton,
                      !selectedRole && styles.proceedButtonDisabled,
                    ]}
                  >
                    <Text style={styles.proceedButtonText}>{t('roleSelection.proceed')}</Text>
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
  roleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  rolesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    backgroundColor: BRAND_COLORS.gray50,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.gray200,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonSelected: {
    backgroundColor: BRAND_COLORS.green,
    borderColor: BRAND_COLORS.green,
    shadowColor: BRAND_COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  roleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: BRAND_COLORS.dark,
  },
  roleButtonTextSelected: {
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
