import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { changePassword, signOut } from '../lib/auth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';

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

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

export default function ChangePasswordScreen({ navigation }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(newPassword);

      if (result.success) {
        // Sign out the user
        await signOut();

        Alert.alert(
          'Success',
          'Password changed successfully. Please login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
                    <Text style={styles.titleChange}>Change</Text>{' '}
                    <Text style={styles.titlePassword}>Password</Text>
                  </Text>
                </View>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                  For security reasons, please change your password
                </Text>
              </View>

              {/* Change Password Card */}
              <View style={styles.card}>
                {/* Decorative element */}
                <View style={styles.cardDecoration} />

                <View style={styles.formContainer}>
                  {/* New Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor={BRAND_COLORS.gray600}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor={BRAND_COLORS.gray600}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  {/* Change Password Button */}
                  <TouchableOpacity
                    style={[styles.changeButton, loading && styles.changeButtonDisabled]}
                    onPress={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.changeButtonText}>Change Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <Text style={styles.footer}>© 2025 Up to Ten. All rights reserved.</Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
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
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleChange: {
    color: BRAND_COLORS.dark,
  },
  titlePassword: {
    color: BRAND_COLORS.green,
  },
  subtitle: {
    fontSize: 14,
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
  changeButton: {
    backgroundColor: BRAND_COLORS.primary,
    minHeight: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  changeButtonDisabled: {
    opacity: 0.7,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    fontSize: 14,
    color: BRAND_COLORS.gray600,
    textAlign: 'center',
    marginTop: 24,
  },
});
