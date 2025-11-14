import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const LOGO = require('../../assets/logo.png');

const BRAND_COLORS = {
  primary: '#1E40AF',
  green: '#00a666',
  dark: '#1c2545',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray600: '#4B5563',
  gray700: '#374151',
  blue50: '#EFF6FF',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const handleLogin = async () => {
    setLoading(true);

    // TODO: Connect to Supabase auth
    // Role will be determined automatically from user profile after login
    console.log('Login:', { email, password });

    setTimeout(() => {
      setLoading(false);
      alert('Login functionality coming soon! Role will be auto-detected from profile.');
    }, 1000);
  };

  // Show mobile warning for phones (< 768px)
  const isPhone = windowWidth < 768;

  if (isPhone) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.mobileWarningContainer}>
          <View style={styles.mobileWarningCard}>
            <Image
              source={LOGO}
              style={styles.logoSmall}
              resizeMode="contain"
            />
            <Text style={styles.mobileWarningTitle}>📱 Mobile Not Supported</Text>
            <Text style={styles.mobileWarningText}>
              Please use a <Text style={styles.bold}>PC</Text>,{' '}
              <Text style={styles.bold}>tablet</Text>, or{' '}
              <Text style={styles.bold}>iPad</Text> to access the platform.
            </Text>
            <Text style={styles.mobileWarningSubtext}>
              Our platform requires a larger screen for the best testing experience.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Background decoration */}
        <View style={[styles.bgDecoration, styles.bgDecorationTop]} />
        <View style={[styles.bgDecoration, styles.bgDecorationBottom]} />

        <View style={styles.contentContainer}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                <Text style={styles.titleAdmission}>Admission</Text>{' '}
                <Text style={styles.titleTest}>Test</Text>
              </Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>Excellence in Test Preparation</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            {/* Decorative element */}
            <View style={styles.cardDecoration} />

            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor={BRAND_COLORS.gray600}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={BRAND_COLORS.gray600}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />
              </View>

              {/* Remember me & Forgot password */}
              <View style={styles.optionsRow}>
                <Text style={styles.rememberText}>Remember me</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>© 2025 Up to Ten. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.gray50,
    position: 'relative',
  },
  bgDecoration: {
    position: 'absolute',
    width: 384,
    height: 384,
    borderRadius: 192,
    opacity: 0.05,
  },
  bgDecorationTop: {
    top: 0,
    right: 0,
    backgroundColor: BRAND_COLORS.green,
  },
  bgDecorationBottom: {
    bottom: 0,
    left: 0,
    backgroundColor: BRAND_COLORS.primary,
  },
  contentContainer: {
    flex: 1,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    height: 64,
    width: 200,
    marginBottom: 24,
  },
  logoSmall: {
    height: 64,
    width: 200,
    marginBottom: 24,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleAdmission: {
    color: BRAND_COLORS.dark,
  },
  titleTest: {
    color: BRAND_COLORS.green,
  },
  subtitle: {
    fontSize: 14,
    color: BRAND_COLORS.gray600,
    textAlign: 'center',
  },
  loginCard: {
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
    top: 0,
    right: 0,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: BRAND_COLORS.green,
    opacity: 0.1,
  },
  formContainer: {
    position: 'relative',
    zIndex: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_COLORS.gray700,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: BRAND_COLORS.dark,
    backgroundColor: '#fff',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberText: {
    fontSize: 14,
    color: BRAND_COLORS.gray700,
  },
  forgotPassword: {
    fontSize: 14,
    color: BRAND_COLORS.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: BRAND_COLORS.primary,
    minHeight: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: BRAND_COLORS.gray600,
  },
  signupLink: {
    fontSize: 14,
    color: BRAND_COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    fontSize: 14,
    color: BRAND_COLORS.gray600,
    textAlign: 'center',
    marginTop: 24,
  },
  // Mobile warning styles
  mobileWarningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mobileWarningCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: 448,
    alignItems: 'center',
  },
  mobileWarningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  mobileWarningText: {
    fontSize: 16,
    color: BRAND_COLORS.gray700,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  mobileWarningSubtext: {
    fontSize: 14,
    color: BRAND_COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});
