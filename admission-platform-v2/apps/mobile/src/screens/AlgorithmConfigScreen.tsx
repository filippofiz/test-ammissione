/**
 * Algorithm Configuration Screen (Mobile)
 * Configure algorithms for adaptive testing, scoring, and results calculation
 * Stores configuration in 2V_algorithm_config table
 * FULL IMPLEMENTATION with all web features adapted for mobile
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
  faBrain,
  faCalculator,
} from '@fortawesome/free-solid-svg-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../lib/supabase';
import { Picker } from '@react-native-picker/picker';

const COLORS = {
  brandGreen: '#00a666',
  brandDark: '#1c2545',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',
  purple50: '#FAF5FF',
  purple100: '#F3E8FF',
  purple200: '#E9D5FF',
  purple500: '#A855F7',
  purple600: '#9333EA',
  purple700: '#7E22CE',
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red200: '#FECACA',
  red600: '#DC2626',
  red700: '#B91C1C',
};

interface AlgorithmConfig {
  id?: string;
  test_type: string;
  track_type: string;
  algorithm_category: 'adaptive' | 'scoring' | 'results';
  algorithm_type: string;

  // Simple Adaptive Algorithm Config
  simple_difficulty_increment?: number;

  // Complex Adaptive Algorithm Config (GMAT-style CAT)
  irt_model?: '1PL' | '2PL' | '3PL';
  initial_theta?: number;
  theta_min?: number;
  theta_max?: number;
  se_threshold?: number;
  max_information_weight?: number;
  content_balancing?: Record<string, any>;
  exposure_control?: boolean;

  // Scoring Algorithm Config
  scoring_method?: 'raw_score' | 'weighted' | 'irt_based';
  penalty_for_wrong?: number;
  penalty_for_blank?: number;
  section_weights?: Record<string, number>;

  // Results Algorithm Config
  percentile_calculation?: 'historical' | 'normative';
  pass_threshold?: number;
  grade_boundaries?: Record<string, number>;

  created_at?: string;
  updated_at?: string;
}

const TEST_TYPES = ['GMAT', 'SAT', 'TOLC'];
const TRACK_TYPES = ['Assessment Iniziale', 'Simulazione', 'Training'];

type Props = NativeStackScreenProps<RootStackParamList, 'AlgorithmConfig'>;

export default function AlgorithmConfigScreen({ navigation, route }: Props) {
  const [selectedTestType, setSelectedTestType] = useState<string>('GMAT');
  const [selectedTrackType, setSelectedTrackType] = useState<string>('Assessment Iniziale');
  const [selectedCategory, setSelectedCategory] = useState<
    'adaptive' | 'scoring' | 'results'
  >('adaptive');

  const [config, setConfig] = useState<AlgorithmConfig>({
    test_type: selectedTestType,
    track_type: selectedTrackType,
    algorithm_category: 'adaptive',
    algorithm_type: 'simple',

    // Adaptive defaults
    simple_difficulty_increment: 1,
    irt_model: '2PL',
    initial_theta: 0.0,
    theta_min: -3.0,
    theta_max: 3.0,
    se_threshold: 0.3,
    max_information_weight: 1.0,
    exposure_control: true,

    // Scoring defaults
    scoring_method: 'raw_score',
    penalty_for_wrong: 0,
    penalty_for_blank: 0,

    // Results defaults
    percentile_calculation: 'historical',
    pass_threshold: 60,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, [selectedTestType, selectedTrackType, selectedCategory]);

  async function loadConfig() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('2V_algorithm_config')
        .select('*')
        .eq('test_type', selectedTestType)
        .eq('track_type', selectedTrackType)
        .eq('algorithm_category', selectedCategory)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfig(data);
      } else {
        // Reset to defaults for this category
        setConfig({
          test_type: selectedTestType,
          track_type: selectedTrackType,
          algorithm_category: selectedCategory,
          algorithm_type:
            selectedCategory === 'adaptive'
              ? 'simple'
              : selectedCategory === 'scoring'
              ? 'raw_score'
              : 'historical',
          simple_difficulty_increment: 1,
          irt_model: '2PL',
          initial_theta: 0.0,
          theta_min: -3.0,
          theta_max: 3.0,
          se_threshold: 0.3,
          max_information_weight: 1.0,
          exposure_control: true,
          scoring_method: 'raw_score',
          penalty_for_wrong: 0,
          penalty_for_blank: 0,
          percentile_calculation: 'historical',
          pass_threshold: 60,
        });
      }
    } catch (err) {
      console.error('Error loading config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const dataToSave = {
        ...config,
        test_type: selectedTestType,
        track_type: selectedTrackType,
        algorithm_category: selectedCategory,
      };

      const { error } = await supabase.from('2V_algorithm_config').upsert(dataToSave, {
        onConflict: 'test_type,track_type,algorithm_category',
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setSaveSuccess(true);
      Alert.alert('Success', 'Algorithm configuration saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brandGreen} />
        <Text style={styles.loadingText}>Loading configuration...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color={COLORS.brandDark} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Algorithm Configuration</Text>
          <Text style={styles.headerSubtitle}>Adaptive, Scoring & Results</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Success Message */}
        {saveSuccess && (
          <View style={styles.successBanner}>
            <FontAwesomeIcon icon={faCheckCircle} size={20} color={COLORS.green600} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.successTitle}>Configuration saved successfully!</Text>
              <Text style={styles.successSubtitle}>Algorithm settings have been updated.</Text>
            </View>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <FontAwesomeIcon icon={faExclamationTriangle} size={20} color={COLORS.red600} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorSubtitle}>{error}</Text>
            </View>
          </View>
        )}

        {/* Selection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Configuration</Text>

          {/* Test Type */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Test Type</Text>
            <View style={styles.pickerBorder}>
              <Picker
                selectedValue={selectedTestType}
                onValueChange={(value) => setSelectedTestType(value)}
                style={styles.picker}
              >
                {TEST_TYPES.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Track Type */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Track Type</Text>
            <View style={styles.pickerBorder}>
              <Picker
                selectedValue={selectedTrackType}
                onValueChange={(value) => setSelectedTrackType(value)}
                style={styles.picker}
              >
                {TRACK_TYPES.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Algorithm Category */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Algorithm Category</Text>
            <View style={styles.pickerBorder}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(value) =>
                  setSelectedCategory(value as 'adaptive' | 'scoring' | 'results')
                }
                style={styles.picker}
              >
                <Picker.Item label="Adaptive Testing" value="adaptive" />
                <Picker.Item label="Scoring" value="scoring" />
                <Picker.Item label="Results Calculation" value="results" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Adaptive Algorithm Configuration */}
        {selectedCategory === 'adaptive' && (
          <View style={styles.card}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryIconContainer}>
                <FontAwesomeIcon icon={faBrain} size={24} color={COLORS.white} />
              </View>
              <View style={styles.categoryHeaderText}>
                <Text style={styles.categoryTitle}>Adaptive Testing Algorithm</Text>
                <Text style={styles.categorySubtitle}>
                  Configure how test difficulty adapts to student performance
                </Text>
              </View>
            </View>

            {/* Algorithm Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Algorithm Type</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  onPress={() => setConfig({ ...config, algorithm_type: 'simple' })}
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radio,
                      config.algorithm_type === 'simple' && styles.radioChecked,
                    ]}
                  >
                    {config.algorithm_type === 'simple' && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.radioLabel}>
                    <Text style={styles.radioLabelTitle}>Simple Algorithm</Text>
                    <Text style={styles.radioLabelDesc}>
                      Correct → increase difficulty, Wrong → decrease difficulty
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setConfig({ ...config, algorithm_type: 'complex' })}
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radio,
                      config.algorithm_type === 'complex' && styles.radioChecked,
                    ]}
                  >
                    {config.algorithm_type === 'complex' && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.radioLabel}>
                    <Text style={styles.radioLabelTitle}>Complex Algorithm (GMAT-style CAT)</Text>
                    <Text style={styles.radioLabelDesc}>
                      Uses Item Response Theory (IRT) for optimal question selection
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Simple Algorithm Configuration */}
            {config.algorithm_type === 'simple' && (
              <View style={styles.configBox}>
                <Text style={styles.configBoxTitle}>Simple Algorithm Settings</Text>
                <Text style={styles.fieldLabel}>Difficulty Increment</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={(config.simple_difficulty_increment || 1).toString()}
                  onChangeText={(text) =>
                    setConfig({
                      ...config,
                      simple_difficulty_increment: parseInt(text) || 1,
                    })
                  }
                />
                <Text style={styles.fieldHelp}>How many difficulty levels to jump (1-5)</Text>
              </View>
            )}

            {/* Complex Algorithm Configuration */}
            {config.algorithm_type === 'complex' && (
              <View style={[styles.configBox, styles.configBoxPurple]}>
                <Text style={styles.configBoxTitle}>Complex Algorithm Settings (IRT-based)</Text>

                {/* IRT Model */}
                <Text style={styles.fieldLabel}>IRT Model</Text>
                <View style={styles.pickerBorder}>
                  <Picker
                    selectedValue={config.irt_model || '2PL'}
                    onValueChange={(value) =>
                      setConfig({ ...config, irt_model: value as '1PL' | '2PL' | '3PL' })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="1PL (Rasch Model)" value="1PL" />
                    <Picker.Item label="2PL (2-Parameter Logistic)" value="2PL" />
                    <Picker.Item label="3PL (3-Parameter Logistic)" value="3PL" />
                  </Picker>
                </View>
                <Text style={styles.fieldHelp}>Item Response Theory model</Text>

                {/* Initial Theta */}
                <Text style={styles.fieldLabel}>Initial Theta (θ)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={(config.initial_theta || 0.0).toString()}
                  onChangeText={(text) =>
                    setConfig({ ...config, initial_theta: parseFloat(text) || 0.0 })
                  }
                />
                <Text style={styles.fieldHelp}>Starting ability estimate (typically 0.0)</Text>

                {/* Theta Min */}
                <Text style={styles.fieldLabel}>Theta Min</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={(config.theta_min || -3.0).toString()}
                  onChangeText={(text) =>
                    setConfig({ ...config, theta_min: parseFloat(text) || -3.0 })
                  }
                />
                <Text style={styles.fieldHelp}>Minimum ability level</Text>

                {/* Theta Max */}
                <Text style={styles.fieldLabel}>Theta Max</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={(config.theta_max || 3.0).toString()}
                  onChangeText={(text) =>
                    setConfig({ ...config, theta_max: parseFloat(text) || 3.0 })
                  }
                />
                <Text style={styles.fieldHelp}>Maximum ability level</Text>

                {/* SE Threshold */}
                <Text style={styles.fieldLabel}>SE Threshold</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={(config.se_threshold || 0.3).toString()}
                  onChangeText={(text) =>
                    setConfig({ ...config, se_threshold: parseFloat(text) || 0.3 })
                  }
                />
                <Text style={styles.fieldHelp}>Standard error threshold for stopping rule</Text>

                {/* Max Information Weight */}
                <Text style={styles.fieldLabel}>Max Information Weight</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={(config.max_information_weight || 1.0).toString()}
                  onChangeText={(text) =>
                    setConfig({ ...config, max_information_weight: parseFloat(text) || 1.0 })
                  }
                />
                <Text style={styles.fieldHelp}>
                  Weight for maximum information criterion
                </Text>

                {/* Exposure Control */}
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    <Text style={styles.switchLabel}>Enable Exposure Control</Text>
                    <Text style={styles.switchHelp}>
                      Prevent same questions from appearing too frequently
                    </Text>
                  </View>
                  <Switch
                    value={config.exposure_control || false}
                    onValueChange={(val) => setConfig({ ...config, exposure_control: val })}
                    trackColor={{ false: COLORS.gray300, true: COLORS.brandGreen }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Scoring Algorithm Configuration */}
        {selectedCategory === 'scoring' && (
          <View style={styles.card}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIconContainer, styles.categoryIconBlue]}>
                <FontAwesomeIcon icon={faCalculator} size={24} color={COLORS.white} />
              </View>
              <View style={styles.categoryHeaderText}>
                <Text style={styles.categoryTitle}>Scoring Algorithm</Text>
                <Text style={styles.categorySubtitle}>Configure how test scores are calculated</Text>
              </View>
            </View>

            {/* Scoring Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scoring Method</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  onPress={() => setConfig({ ...config, scoring_method: 'raw_score' })}
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radio,
                      config.scoring_method === 'raw_score' && styles.radioChecked,
                    ]}
                  >
                    {config.scoring_method === 'raw_score' && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.radioLabel}>
                    <Text style={styles.radioLabelTitle}>Raw Score</Text>
                    <Text style={styles.radioLabelDesc}>Simple count of correct answers</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setConfig({ ...config, scoring_method: 'weighted' })}
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radio,
                      config.scoring_method === 'weighted' && styles.radioChecked,
                    ]}
                  >
                    {config.scoring_method === 'weighted' && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.radioLabel}>
                    <Text style={styles.radioLabelTitle}>Weighted Score</Text>
                    <Text style={styles.radioLabelDesc}>
                      Different weights for sections/difficulty levels
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setConfig({ ...config, scoring_method: 'irt_based' })}
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radio,
                      config.scoring_method === 'irt_based' && styles.radioChecked,
                    ]}
                  >
                    {config.scoring_method === 'irt_based' && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.radioLabel}>
                    <Text style={styles.radioLabelTitle}>IRT-Based Score</Text>
                    <Text style={styles.radioLabelDesc}>
                      Score based on ability estimate (θ) from IRT model
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Penalty Settings */}
            <View style={[styles.configBox, styles.configBoxBlue]}>
              <Text style={styles.configBoxTitle}>Penalty Settings</Text>

              <Text style={styles.fieldLabel}>Penalty for Wrong Answer</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={(config.penalty_for_wrong || 0).toString()}
                onChangeText={(text) =>
                  setConfig({ ...config, penalty_for_wrong: parseFloat(text) || 0 })
                }
              />
              <Text style={styles.fieldHelp}>
                Points deducted for incorrect answers (0 = no penalty)
              </Text>

              <Text style={styles.fieldLabel}>Penalty for Blank Answer</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={(config.penalty_for_blank || 0).toString()}
                onChangeText={(text) =>
                  setConfig({ ...config, penalty_for_blank: parseFloat(text) || 0 })
                }
              />
              <Text style={styles.fieldHelp}>
                Points deducted for unanswered questions (0 = no penalty)
              </Text>
            </View>
          </View>
        )}

        {/* Results Algorithm Configuration */}
        {selectedCategory === 'results' && (
          <View style={styles.card}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIconContainer, styles.categoryIconGreen]}>
                <FontAwesomeIcon icon={faCheckCircle} size={24} color={COLORS.white} />
              </View>
              <View style={styles.categoryHeaderText}>
                <Text style={styles.categoryTitle}>Results Calculation</Text>
                <Text style={styles.categorySubtitle}>
                  Configure how results, percentiles, and grades are calculated
                </Text>
              </View>
            </View>

            {/* Percentile Calculation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Percentile Calculation Method</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  onPress={() =>
                    setConfig({ ...config, percentile_calculation: 'historical' })
                  }
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radio,
                      config.percentile_calculation === 'historical' && styles.radioChecked,
                    ]}
                  >
                    {config.percentile_calculation === 'historical' && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <View style={styles.radioLabel}>
                    <Text style={styles.radioLabelTitle}>Historical</Text>
                    <Text style={styles.radioLabelDesc}>
                      Based on past student performance data
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setConfig({ ...config, percentile_calculation: 'normative' })}
                  style={styles.radioOption}
                >
                  <View
                    style={[
                      styles.radio,
                      config.percentile_calculation === 'normative' && styles.radioChecked,
                    ]}
                  >
                    {config.percentile_calculation === 'normative' && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <View style={styles.radioLabel}>
                    <Text style={styles.radioLabelTitle}>Normative</Text>
                    <Text style={styles.radioLabelDesc}>
                      Based on predefined norm group statistics
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Pass/Fail Threshold */}
            <View style={[styles.configBox, styles.configBoxGreen]}>
              <Text style={styles.configBoxTitle}>Pass/Fail Settings</Text>

              <Text style={styles.fieldLabel}>Pass Threshold (%)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={(config.pass_threshold || 60).toString()}
                onChangeText={(text) =>
                  setConfig({ ...config, pass_threshold: parseFloat(text) || 60 })
                }
              />
              <Text style={styles.fieldHelp}>
                Minimum percentage required to pass (0-100)
              </Text>
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          {saving ? (
            <>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray600,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.brandDark,
  },
  headerTitleContainer: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.brandDark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.green50,
    borderWidth: 2,
    borderColor: COLORS.green500,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green800,
  },
  successSubtitle: {
    fontSize: 12,
    color: COLORS.green700,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.red50,
    borderWidth: 2,
    borderColor: COLORS.red500,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.red800,
  },
  errorSubtitle: {
    fontSize: 12,
    color: COLORS.red700,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  pickerBorder: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    fontSize: 16,
    color: COLORS.gray800,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.purple500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconBlue: {
    backgroundColor: COLORS.blue500,
  },
  categoryIconGreen: {
    backgroundColor: COLORS.green500,
  },
  categoryHeaderText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brandDark,
  },
  categorySubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 12,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioChecked: {
    borderColor: COLORS.brandGreen,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brandGreen,
  },
  radioLabel: {
    flex: 1,
  },
  radioLabelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  radioLabelDesc: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  configBox: {
    backgroundColor: COLORS.blue50,
    borderWidth: 2,
    borderColor: COLORS.blue200,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  configBoxPurple: {
    backgroundColor: COLORS.purple50,
    borderColor: COLORS.purple200,
  },
  configBoxBlue: {
    backgroundColor: COLORS.blue50,
    borderColor: COLORS.blue200,
  },
  configBoxGreen: {
    backgroundColor: COLORS.green50,
    borderColor: COLORS.green200,
  },
  configBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
  },
  fieldHelp: {
    fontSize: 11,
    color: COLORS.gray600,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  switchHelp: {
    fontSize: 11,
    color: COLORS.gray600,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.brandGreen,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
