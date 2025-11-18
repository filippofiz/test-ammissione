/**
 * Test Track Configuration Screen (Mobile)
 * Allows tutors to configure parameters for different test tracks:
 * - Assessment Iniziale
 * - Simulazione
 * - Training (placeholder)
 * - Assessment Monotematico (placeholder)
 *
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
  faCog,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../lib/supabase';
// Temporarily disabled - draggable-flatlist removed due to worklets version conflict
// import DraggableFlatList, {
//   ScaleDecorator,
//   RenderItemParams,
// } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green300: '#86EFAC',
  green600: '#16A34A',
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red200: '#FECACA',
  red300: '#FCA5A5',
  red600: '#DC2626',
  red700: '#B91C1C',
  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange200: '#FED7AA',
  orange300: '#FDBA74',
  orange700: '#C2410C',
  orange800: '#9A3412',
  purple50: '#FAF5FF',
  purple100: '#F3E8FF',
  purple200: '#E9D5FF',
  yellow100: '#FEF9C3',
  yellow300: '#FDE047',
  yellow600: '#CA8A04',
  yellow800: '#854D0E',
};

interface TestTrackConfig {
  id?: string;
  test_type: string;
  track_type: string;
  section_order_mode: 'mandatory' | 'user_choice';
  section_order: string[] | null;
  time_per_section: Record<string, number> | null;
  total_time_minutes: number | null;
  navigation_mode: 'forward_only' | 'back_forward';
  navigation_between_sections?: 'forward_only' | 'back_forward';
  can_leave_blank: boolean | null;
  pause_mode: 'no_pause' | 'between_sections' | 'user_choice';
  pause_sections: string[] | null;
  pause_duration_minutes: number;
  max_pauses?: number;
  test_start_message?: string;
  messaggio_iniziale_test?: string;
  question_order?: 'sequential' | 'random';
  adaptivity_mode?: 'non_adaptive' | 'adaptive';
  use_base_questions?: boolean;
  base_questions_scope?: 'entire_test' | 'per_section';
  base_questions_count?: number;
  algorithm_type?: 'simple' | 'complex';
  training_config: any;
  assessment_mono_config: any;
}

interface SectionItem {
  key: string;
  section: string;
}

const TRACK_TYPES = [
  { value: 'Assessment Iniziale', label: 'Assessment Iniziale', hasConfig: true },
  { value: 'Simulazione', label: 'Simulazione', hasConfig: true },
  { value: 'Training', label: 'Training', hasConfig: false },
  { value: 'Assessment Monotematico', label: 'Assessment Monotematico', hasConfig: false },
];

type Props = NativeStackScreenProps<RootStackParamList, 'TestTrackConfig'>;

export default function TestTrackConfigScreen({ navigation, route }: Props) {
  const testType = 'GMAT'; // In full app, this would come from route params or context

  const [selectedTrack, setSelectedTrack] = useState<string>('Assessment Iniziale');
  const [config, setConfig] = useState<TestTrackConfig>({
    test_type: testType,
    track_type: 'Assessment Iniziale',
    section_order_mode: 'mandatory',
    section_order: null,
    time_per_section: null,
    total_time_minutes: null,
    navigation_mode: 'forward_only',
    navigation_between_sections: 'forward_only',
    can_leave_blank: false,
    pause_mode: 'between_sections',
    pause_sections: null,
    pause_duration_minutes: 5,
    max_pauses: 3,
    question_order: 'sequential',
    adaptivity_mode: 'non_adaptive',
    use_base_questions: false,
    base_questions_scope: 'entire_test',
    base_questions_count: 5,
    algorithm_type: 'simple',
    training_config: {},
    assessment_mono_config: {},
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sectionItems, setSectionItems] = useState<SectionItem[]>([]);
  const [allSections, setAllSections] = useState<string[]>([]);
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number>(0);
  const [specificSectionDurations, setSpecificSectionDurations] = useState<Record<string, number>>({});
  const [sectionDurationMode, setSectionDurationMode] = useState<'proportional' | 'specific'>('proportional');
  const [showDurationDetails, setShowDurationDetails] = useState(false);
  const [validatingAdaptive, setValidatingAdaptive] = useState(false);
  const [adaptiveValidation, setAdaptiveValidation] = useState<{
    valid: boolean;
    warning?: boolean;
    message: string;
    questionsWithLevels?: number;
    totalQuestions?: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedTrack]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // Load sections
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('section')
        .eq('test_type', testType);

      if (questionsError) throw questionsError;

      const uniqueSections = Array.from(new Set(questionsData?.map((q) => q.section) || []));
      uniqueSections.sort();
      setAllSections(uniqueSections);

      // Load config
      const { data: configData, error: configError } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType)
        .eq('track_type', selectedTrack)
        .maybeSingle();

      if (configError && configError.code !== 'PGRST116') throw configError;

      if (configData) {
        setConfig(configData);
        if (configData.section_order && configData.section_order.length > 0) {
          const items: SectionItem[] = configData.section_order.map((section, index) => ({
            key: `${section}-${index}`,
            section,
          }));
          setSectionItems(items);
        } else {
          const items: SectionItem[] = uniqueSections.map((section, index) => ({
            key: `${section}-${index}`,
            section,
          }));
          setSectionItems(items);
        }
        if (configData.total_time_minutes) {
          setTotalTimeMinutes(configData.total_time_minutes);
        }
        if (configData.time_per_section) {
          setSpecificSectionDurations(configData.time_per_section);
          setSectionDurationMode('specific');
        } else {
          setSectionDurationMode('proportional');
        }
      } else {
        const items: SectionItem[] = uniqueSections.map((section, index) => ({
          key: `${section}-${index}`,
          section,
        }));
        setSectionItems(items);
      }

      // Load test duration
      const { data: testsData, error: testsError } = await supabase
        .from('2V_tests')
        .select('default_duration_mins')
        .eq('test_type', testType)
        .eq('exercise_type', selectedTrack)
        .limit(1)
        .maybeSingle();

      if (!testsError && testsData && testsData.default_duration_mins) {
        if (totalTimeMinutes === 0) {
          setTotalTimeMinutes(testsData.default_duration_mins);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function validateAdaptiveMode() {
    setValidatingAdaptive(true);
    try {
      const { data: questions, error } = await supabase
        .from('2V_questions')
        .select('id, difficulty')
        .eq('test_type', testType);

      if (error) {
        setValidatingAdaptive(false);
        return {
          valid: false,
          message: 'Error checking question difficulty levels',
        };
      }

      const totalQuestions = questions?.length || 0;
      const questionsWithDifficulty = questions?.filter((q) => q.difficulty) || [];
      const questionsWithLevels = questionsWithDifficulty.length;

      if (questionsWithLevels === 0) {
        const result = {
          valid: false,
          message: 'No questions have difficulty levels. Adaptive mode requires questions with difficulty levels.',
          questionsWithLevels: 0,
          totalQuestions,
        };
        setAdaptiveValidation(result);
        setValidatingAdaptive(false);
        return result;
      }

      if (questionsWithLevels < totalQuestions * 0.5) {
        const result = {
          valid: true,
          warning: true,
          message: `Only ${questionsWithLevels} of ${totalQuestions} questions have difficulty levels.`,
          questionsWithLevels,
          totalQuestions,
        };
        setAdaptiveValidation(result);
        setValidatingAdaptive(false);
        return result;
      }

      const result = {
        valid: true,
        message: `✓ ${questionsWithLevels} questions with difficulty levels found.`,
        questionsWithLevels,
        totalQuestions,
      };
      setAdaptiveValidation(result);
      setValidatingAdaptive(false);
      return result;
    } catch (err) {
      const result = {
        valid: false,
        message: 'Error validating adaptive mode',
      };
      setAdaptiveValidation(result);
      setValidatingAdaptive(false);
      return result;
    }
  }

  useEffect(() => {
    if (config.adaptivity_mode === 'adaptive') {
      validateAdaptiveMode();
    } else {
      setAdaptiveValidation(null);
    }
  }, [config.adaptivity_mode, testType]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Validation
      const errors: string[] = [];

      if (!config.section_order_mode) {
        errors.push('Section order mode is required');
      }

      if (config.section_order_mode === 'mandatory' && (!sectionItems || sectionItems.length === 0)) {
        errors.push('Please configure section order');
      }

      if (!config.navigation_mode) {
        errors.push('Navigation inside section is required');
      }

      if (!config.navigation_between_sections) {
        errors.push('Navigation between sections is required');
      }

      if (!config.pause_mode) {
        errors.push('Pause mode is required');
      }

      if (config.pause_mode === 'between_sections') {
        if (!config.pause_sections || config.pause_sections.length === 0) {
          errors.push('Select at least one section for pause');
        }
        if (!config.pause_duration_minutes || config.pause_duration_minutes <= 0) {
          errors.push('Pause duration must be > 0');
        }
      }

      if (config.pause_mode === 'user_choice') {
        if (!config.pause_duration_minutes || config.pause_duration_minutes <= 0) {
          errors.push('Pause duration must be > 0');
        }
        if (!config.max_pauses || config.max_pauses <= 0) {
          errors.push('Max pauses must be > 0');
        }
      }

      if (config.can_leave_blank === undefined || config.can_leave_blank === null) {
        errors.push('Blank answers setting is required');
      }

      if (config.adaptivity_mode === 'adaptive') {
        if (!adaptiveValidation || !adaptiveValidation.valid) {
          errors.push('Adaptive mode requires questions with difficulty levels');
        }
        if (config.use_base_questions) {
          if (!config.base_questions_count || config.base_questions_count <= 0) {
            errors.push('Base questions count must be > 0');
          }
          if (!config.base_questions_scope) {
            errors.push('Base questions scope is required');
          }
        }
        if (!config.algorithm_type) {
          errors.push('Algorithm type is required for adaptive mode');
        }
      }

      if (errors.length > 0) {
        setError(errors.join('\n'));
        Alert.alert('Validation Error', errors.join('\n'));
        setSaving(false);
        return;
      }

      // Prepare data
      const sectionOrder = sectionItems.map((item) => item.section);
      const dataToSave = {
        ...config,
        test_type: testType,
        track_type: selectedTrack,
        section_order: config.section_order_mode === 'mandatory' ? sectionOrder : null,
        total_time_minutes: totalTimeMinutes,
        time_per_section: sectionDurationMode === 'specific' ? specificSectionDurations : null,
      };

      const { error: upsertError } = await supabase
        .from('2V_test_track_config')
        .upsert(dataToSave, {
          onConflict: 'test_type,track_type',
        });

      if (upsertError) throw upsertError;

      setSaveSuccess(true);
      Alert.alert('Success', 'Configuration saved successfully!');
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error('Error saving config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  // Temporarily disabled - draggable-flatlist removed
  /*
  function renderSectionItem({ item, drag, isActive }: RenderItemParams<SectionItem>) {
    const index = sectionItems.findIndex((s) => s.key === item.key);

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.sectionDragItem, isActive && styles.sectionDragItemActive]}
          activeOpacity={0.9}
        >
          <View style={styles.sectionDragNumber}>
            <Text style={styles.sectionDragNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.sectionDragText}>{item.section}</Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }
  */

  const currentTrack = TRACK_TYPES.find((t) => t.value === selectedTrack);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brandGreen} />
        <Text style={styles.loadingText}>Loading configuration...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color={COLORS.brandDark} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Configure Test Tracks</Text>
            <Text style={styles.headerSubtitle}>{testType} Test Track Settings</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Success Message */}
          {saveSuccess && (
            <View style={styles.successBanner}>
              <FontAwesomeIcon icon={faCheckCircle} size={20} color={COLORS.green600} />
              <Text style={styles.successText}>Configuration saved successfully!</Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorBanner}>
              <FontAwesomeIcon icon={faExclamationTriangle} size={20} color={COLORS.red600} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Track Type Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesomeIcon icon={faCog} size={20} color={COLORS.brandGreen} />
              <Text style={styles.cardTitle}>Select Test Track</Text>
            </View>
            <View style={styles.trackTypeGrid}>
              {TRACK_TYPES.map((track) => (
                <TouchableOpacity
                  key={track.value}
                  onPress={() => setSelectedTrack(track.value)}
                  style={[
                    styles.trackTypeButton,
                    selectedTrack === track.value && styles.trackTypeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.trackTypeButtonText,
                      selectedTrack === track.value && styles.trackTypeButtonTextActive,
                    ]}
                  >
                    {track.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Configuration Form */}
          {!currentTrack?.hasConfig ? (
            <View style={styles.placeholderCard}>
              <FontAwesomeIcon icon={faCog} size={64} color={COLORS.gray300} />
              <Text style={styles.placeholderTitle}>Configuration Coming Soon</Text>
              <Text style={styles.placeholderText}>
                Configuration for {currentTrack?.label} will be added in a future update.
              </Text>
            </View>
          ) : (
            <>
              {/* Section Order */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Section Order</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, section_order_mode: 'mandatory' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.section_order_mode === 'mandatory' && styles.radioChecked,
                      ]}
                    >
                      {config.section_order_mode === 'mandatory' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Mandatory Sequence</Text>
                      <Text style={styles.radioLabelDesc}>
                        Sections in fixed order
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, section_order_mode: 'user_choice' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.section_order_mode === 'user_choice' && styles.radioChecked,
                      ]}
                    >
                      {config.section_order_mode === 'user_choice' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>User Choice</Text>
                      <Text style={styles.radioLabelDesc}>Student chooses order</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {config.section_order_mode === 'mandatory' && sectionItems.length > 0 && (
                  <View style={styles.sectionOrderBox}>
                    <Text style={styles.sectionOrderTitle}>Section Order (Read-only)</Text>
                    <View style={styles.draggableContainer}>
                      <ScrollView>
                        {sectionItems.map((item, index) => (
                          <View key={item.key} style={styles.sectionDragItem}>
                            <View style={styles.sectionDragNumber}>
                              <Text style={styles.sectionDragNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.sectionDragText}>{item.section}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>

              {/* Test Duration */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Test Duration</Text>
                <Text style={styles.fieldLabel}>Total Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={totalTimeMinutes.toString()}
                  onChangeText={(text) => {
                    const val = parseInt(text) || 0;
                    setTotalTimeMinutes(val);
                  }}
                />
              </View>

              {/* Duration per Section */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Duration per Section</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() => setSectionDurationMode('proportional')}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        sectionDurationMode === 'proportional' && styles.radioChecked,
                      ]}
                    >
                      {sectionDurationMode === 'proportional' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Proportional</Text>
                      <Text style={styles.radioLabelDesc}>Equal time per section</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSectionDurationMode('specific')}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        sectionDurationMode === 'specific' && styles.radioChecked,
                      ]}
                    >
                      {sectionDurationMode === 'specific' && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Specific</Text>
                      <Text style={styles.radioLabelDesc}>Set time per section</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {sectionDurationMode === 'specific' && sectionItems.length > 0 && (
                  <View style={styles.specificDurationsBox}>
                    {sectionItems.map((item) => {
                      const defaultVal =
                        specificSectionDurations[item.section] ||
                        Math.round(totalTimeMinutes / sectionItems.length);
                      return (
                        <View key={item.key} style={styles.durationRow}>
                          <Text style={styles.durationLabel}>{item.section}</Text>
                          <View style={styles.durationInputContainer}>
                            <TextInput
                              style={styles.durationInput}
                              keyboardType="number-pad"
                              value={(specificSectionDurations[item.section] || defaultVal).toString()}
                              onChangeText={(text) => {
                                const val = parseInt(text) || 0;
                                setSpecificSectionDurations({
                                  ...specificSectionDurations,
                                  [item.section]: val,
                                });
                              }}
                            />
                            <Text style={styles.durationUnit}>min</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Navigation Inside Section */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Navigation Inside Section</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, navigation_mode: 'forward_only' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.navigation_mode === 'forward_only' && styles.radioChecked,
                      ]}
                    >
                      {config.navigation_mode === 'forward_only' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Forward Only</Text>
                      <Text style={styles.radioLabelDesc}>No going back</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, navigation_mode: 'back_forward' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.navigation_mode === 'back_forward' && styles.radioChecked,
                      ]}
                    >
                      {config.navigation_mode === 'back_forward' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Back & Forward</Text>
                      <Text style={styles.radioLabelDesc}>Free navigation</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Navigation Between Sections */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Navigation Between Sections</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() =>
                      setConfig({ ...config, navigation_between_sections: 'forward_only' })
                    }
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.navigation_between_sections === 'forward_only' &&
                          styles.radioChecked,
                      ]}
                    >
                      {config.navigation_between_sections === 'forward_only' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Forward Only</Text>
                      <Text style={styles.radioLabelDesc}>Cannot return to sections</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setConfig({ ...config, navigation_between_sections: 'back_forward' })
                    }
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.navigation_between_sections === 'back_forward' &&
                          styles.radioChecked,
                      ]}
                    >
                      {config.navigation_between_sections === 'back_forward' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Back & Forward</Text>
                      <Text style={styles.radioLabelDesc}>Free section navigation</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Blank Answers */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Blank Answers</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, can_leave_blank: true })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.can_leave_blank === true && styles.radioChecked,
                      ]}
                    >
                      {config.can_leave_blank === true && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Allow Blank</Text>
                      <Text style={styles.radioLabelDesc}>Students can skip questions</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, can_leave_blank: false })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.can_leave_blank === false && styles.radioChecked,
                      ]}
                    >
                      {config.can_leave_blank === false && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Require All</Text>
                      <Text style={styles.radioLabelDesc}>Must answer all questions</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pause Settings */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Pause Settings</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, pause_mode: 'no_pause' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.pause_mode === 'no_pause' && styles.radioChecked,
                      ]}
                    >
                      {config.pause_mode === 'no_pause' && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>No Pause</Text>
                      <Text style={styles.radioLabelDesc}>No breaks allowed</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, pause_mode: 'between_sections' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.pause_mode === 'between_sections' && styles.radioChecked,
                      ]}
                    >
                      {config.pause_mode === 'between_sections' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Mandatory Pause</Text>
                      <Text style={styles.radioLabelDesc}>After specific sections</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, pause_mode: 'user_choice' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.pause_mode === 'user_choice' && styles.radioChecked,
                      ]}
                    >
                      {config.pause_mode === 'user_choice' && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Student Choice</Text>
                      <Text style={styles.radioLabelDesc}>Optional pauses</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {config.pause_mode === 'between_sections' && sectionItems.length > 0 && (
                  <View style={styles.pauseSectionsBox}>
                    <Text style={styles.pauseSectionsTitle}>Select Sections for Pause</Text>
                    {sectionItems.map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => {
                          const current = config.pause_sections || [];
                          if (current.includes(item.section)) {
                            setConfig({
                              ...config,
                              pause_sections: current.filter((s) => s !== item.section),
                            });
                          } else {
                            setConfig({
                              ...config,
                              pause_sections: [...current, item.section],
                            });
                          }
                        }}
                        style={styles.checkboxRow}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            (config.pause_sections || []).includes(item.section) &&
                              styles.checkboxChecked,
                          ]}
                        >
                          {(config.pause_sections || []).includes(item.section) && (
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              size={16}
                              color={COLORS.white}
                            />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>After {item.section}</Text>
                      </TouchableOpacity>
                    ))}
                    <Text style={styles.fieldLabel}>Pause Duration (minutes)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={config.pause_duration_minutes.toString()}
                      onChangeText={(text) =>
                        setConfig({
                          ...config,
                          pause_duration_minutes: parseInt(text) || 5,
                        })
                      }
                    />
                  </View>
                )}

                {config.pause_mode === 'user_choice' && (
                  <View style={styles.pauseUserChoiceBox}>
                    <Text style={styles.fieldLabel}>Maximum Pauses</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={(config.max_pauses || 3).toString()}
                      onChangeText={(text) =>
                        setConfig({ ...config, max_pauses: parseInt(text) || 3 })
                      }
                    />
                    <Text style={styles.fieldLabel}>Pause Duration (minutes)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={config.pause_duration_minutes.toString()}
                      onChangeText={(text) =>
                        setConfig({
                          ...config,
                          pause_duration_minutes: parseInt(text) || 5,
                        })
                      }
                    />
                  </View>
                )}
              </View>

              {/* Question Order */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Question Presentation</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, question_order: 'sequential' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.question_order === 'sequential' && styles.radioChecked,
                      ]}
                    >
                      {config.question_order === 'sequential' && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Sequential Order</Text>
                      <Text style={styles.radioLabelDesc}>Defined order</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, question_order: 'random' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.question_order === 'random' && styles.radioChecked,
                      ]}
                    >
                      {config.question_order === 'random' && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Random Order</Text>
                      <Text style={styles.radioLabelDesc}>Questions shuffled</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Adaptivity */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Test Adaptivity</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, adaptivity_mode: 'non_adaptive' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.adaptivity_mode === 'non_adaptive' && styles.radioChecked,
                      ]}
                    >
                      {config.adaptivity_mode === 'non_adaptive' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Non-Adaptive</Text>
                      <Text style={styles.radioLabelDesc}>Traditional testing</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setConfig({ ...config, adaptivity_mode: 'adaptive' })}
                    style={styles.radioOption}
                  >
                    <View
                      style={[
                        styles.radio,
                        config.adaptivity_mode === 'adaptive' && styles.radioChecked,
                      ]}
                    >
                      {config.adaptivity_mode === 'adaptive' && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelTitle}>Adaptive</Text>
                      <Text style={styles.radioLabelDesc}>Difficulty adjusts</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {config.adaptivity_mode === 'adaptive' && (
                  <View style={styles.adaptiveConfigBox}>
                    {validatingAdaptive && (
                      <View style={styles.validatingRow}>
                        <ActivityIndicator size="small" color={COLORS.brandGreen} />
                        <Text style={styles.validatingText}>Validating...</Text>
                      </View>
                    )}

                    {adaptiveValidation && (
                      <View
                        style={[
                          styles.validationBox,
                          !adaptiveValidation.valid && styles.validationBoxError,
                          adaptiveValidation.warning && styles.validationBoxWarning,
                          adaptiveValidation.valid &&
                            !adaptiveValidation.warning &&
                            styles.validationBoxSuccess,
                        ]}
                      >
                        <Text style={styles.validationText}>{adaptiveValidation.message}</Text>
                        {adaptiveValidation.questionsWithLevels !== undefined && (
                          <Text style={styles.validationSubtext}>
                            {adaptiveValidation.questionsWithLevels} /{' '}
                            {adaptiveValidation.totalQuestions} questions with levels
                          </Text>
                        )}
                      </View>
                    )}

                    {adaptiveValidation?.valid && (
                      <>
                        <View style={styles.switchRow}>
                          <Text style={styles.switchLabel}>Use Base Questions</Text>
                          <Switch
                            value={config.use_base_questions || false}
                            onValueChange={(val) =>
                              setConfig({ ...config, use_base_questions: val })
                            }
                            trackColor={{ false: COLORS.gray300, true: COLORS.brandGreen }}
                            thumbColor={COLORS.white}
                          />
                        </View>

                        {config.use_base_questions && (
                          <>
                            <Text style={styles.fieldLabel}>Base Questions Scope</Text>
                            <View style={styles.radioGroup}>
                              <TouchableOpacity
                                onPress={() =>
                                  setConfig({
                                    ...config,
                                    base_questions_scope: 'entire_test',
                                  })
                                }
                                style={styles.radioOption}
                              >
                                <View
                                  style={[
                                    styles.radio,
                                    config.base_questions_scope === 'entire_test' &&
                                      styles.radioChecked,
                                  ]}
                                >
                                  {config.base_questions_scope === 'entire_test' && (
                                    <View style={styles.radioDot} />
                                  )}
                                </View>
                                <View style={styles.radioLabel}>
                                  <Text style={styles.radioLabelTitle}>Entire Test</Text>
                                  <Text style={styles.radioLabelDesc}>Once for whole test</Text>
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  setConfig({ ...config, base_questions_scope: 'per_section' })
                                }
                                style={styles.radioOption}
                              >
                                <View
                                  style={[
                                    styles.radio,
                                    config.base_questions_scope === 'per_section' &&
                                      styles.radioChecked,
                                  ]}
                                >
                                  {config.base_questions_scope === 'per_section' && (
                                    <View style={styles.radioDot} />
                                  )}
                                </View>
                                <View style={styles.radioLabel}>
                                  <Text style={styles.radioLabelTitle}>Per Section</Text>
                                  <Text style={styles.radioLabelDesc}>Each section</Text>
                                </View>
                              </TouchableOpacity>
                            </View>

                            <Text style={styles.fieldLabel}>Base Questions Count</Text>
                            <TextInput
                              style={styles.input}
                              keyboardType="number-pad"
                              value={(config.base_questions_count || 5).toString()}
                              onChangeText={(text) =>
                                setConfig({
                                  ...config,
                                  base_questions_count: parseInt(text) || 5,
                                })
                              }
                            />
                          </>
                        )}

                        <Text style={styles.fieldLabel}>Algorithm Type</Text>
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
                              {config.algorithm_type === 'simple' && (
                                <View style={styles.radioDot} />
                              )}
                            </View>
                            <View style={styles.radioLabel}>
                              <Text style={styles.radioLabelTitle}>Simple</Text>
                              <Text style={styles.radioLabelDesc}>
                                Correct → harder, Wrong → easier
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
                              {config.algorithm_type === 'complex' && (
                                <View style={styles.radioDot} />
                              )}
                            </View>
                            <View style={styles.radioLabel}>
                              <Text style={styles.radioLabelTitle}>Complex (CAT)</Text>
                              <Text style={styles.radioLabelDesc}>Uses IRT</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>

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
            </>
          )}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
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
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.green50,
    borderWidth: 2,
    borderColor: COLORS.green200,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.green600,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.red50,
    borderWidth: 2,
    borderColor: COLORS.red200,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.red600,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brandDark,
  },
  trackTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trackTypeButton: {
    flex: 1,
    minWidth: '48%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  trackTypeButtonActive: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  trackTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  trackTypeButtonTextActive: {
    color: COLORS.white,
  },
  placeholderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray600,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 12,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
  },
  sectionOrderBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.blue50,
    borderWidth: 2,
    borderColor: COLORS.blue200,
    borderRadius: 8,
  },
  sectionOrderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.brandDark,
    marginBottom: 12,
  },
  draggableContainer: {
    minHeight: 200,
  },
  sectionDragItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    marginBottom: 8,
  },
  sectionDragItemActive: {
    borderColor: COLORS.brandGreen,
    backgroundColor: COLORS.green50,
    elevation: 4,
  },
  sectionDragNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.blue600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionDragNumberText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionDragText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
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
  specificDurationsBox: {
    marginTop: 16,
    gap: 8,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.purple200,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
    flex: 1,
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationInput: {
    width: 70,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  durationUnit: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  pauseSectionsBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.orange50,
    borderWidth: 2,
    borderColor: COLORS.orange200,
    borderRadius: 8,
  },
  pauseSectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.brandDark,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.gray700,
  },
  pauseUserChoiceBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.purple50,
    borderWidth: 2,
    borderColor: COLORS.purple200,
    borderRadius: 8,
  },
  adaptiveConfigBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.green50,
    borderWidth: 2,
    borderColor: COLORS.green200,
    borderRadius: 8,
  },
  validatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  validatingText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  validationBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  validationBoxError: {
    backgroundColor: COLORS.red100,
    borderWidth: 2,
    borderColor: COLORS.red300,
  },
  validationBoxWarning: {
    backgroundColor: COLORS.yellow100,
    borderWidth: 2,
    borderColor: COLORS.yellow300,
  },
  validationBoxSuccess: {
    backgroundColor: COLORS.green100,
    borderWidth: 2,
    borderColor: COLORS.green300,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  validationSubtext: {
    fontSize: 10,
    color: COLORS.gray600,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
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
