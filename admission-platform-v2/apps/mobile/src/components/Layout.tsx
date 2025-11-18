import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentProfile, signOut } from '../lib/auth';
import type { Profile } from '../lib/database.types';

const LOGO = require('../../assets/logo_bianco_e_verde.png');

const BRAND_COLORS = {
  primary: '#1E40AF',
  green: '#00a666',
  dark: '#1c2545',
  gray50: '#F9FAFB',
};

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function Layout({ children, pageTitle, pageSubtitle }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const navigation = useNavigation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getCurrentProfile();
    setProfile(userProfile);
  };

  const handleLanguageChange = async (lang: string) => {
    await AsyncStorage.setItem('language', lang);
    await i18n.changeLanguage(lang);
    setCurrentLang(lang);
  };

  const handleLogout = async () => {
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' as never }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          {pageTitle && (
            <>
              <View style={styles.divider} />
              <View style={styles.pageTitleContainer}>
                <Text style={styles.pageTitle} numberOfLines={1}>{pageTitle}</Text>
                {pageSubtitle && (
                  <Text style={styles.pageSubtitle} numberOfLines={1}>{pageSubtitle}</Text>
                )}
              </View>
            </>
          )}
        </View>

        {profile && (
          <View style={styles.headerRight}>
            {/* Language Selector */}
            <View style={styles.languageSelector}>
              <TouchableOpacity
                onPress={() => handleLanguageChange('en')}
                style={[
                  styles.langButton,
                  currentLang === 'en' && styles.langButtonActive
                ]}
              >
                <Text style={[
                  styles.langText,
                  currentLang === 'en' && styles.langTextActive
                ]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleLanguageChange('it')}
                style={[
                  styles.langButton,
                  currentLang === 'it' && styles.langButtonActive
                ]}
              >
                <Text style={[
                  styles.langText,
                  currentLang === 'it' && styles.langTextActive
                ]}>IT</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile.name}</Text>
              <Text style={styles.userRole}>
                {Array.isArray(profile.roles) ? (profile.roles as string[]).join(', ') : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>{t('layout.logout')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.gray50,
  },
  header: {
    backgroundColor: BRAND_COLORS.dark,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    height: 40,
    width: 120,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#4B5563',
  },
  pageTitleContainer: {
    flex: 1,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pageSubtitle: {
    color: '#D1D5DB',
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageSelector: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  langButtonActive: {
    backgroundColor: BRAND_COLORS.green,
  },
  langText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
  },
  langTextActive: {
    color: '#fff',
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.8,
  },
  logoutButton: {
    backgroundColor: BRAND_COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
