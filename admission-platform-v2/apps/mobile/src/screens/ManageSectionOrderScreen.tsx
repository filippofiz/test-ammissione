/**
 * Manage Section Order Screen (Mobile)
 * Allows tutors to drag and drop sections to reorder the test track
 * This order will be used for both student and tutor views
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faSave,
  faPlus,
  faTrash,
  faClipboardList,
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
  red50: '#FEF2F2',
  red200: '#FECACA',
  red500: '#EF4444',
  red700: '#B91C1C',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  purple100: '#E9D5FF',
  purple200: '#DDD6FE',
  purple400: '#A78BFA',
  purple500: '#8B5CF6',
  green50: '#F0FDF4',
  green600: '#16A34A',
};

interface TestTypeOrder {
  id: string;
  test_type: string;
  section_order: string[];
}

interface AvailableSection {
  section: string;
  count: number;
}

interface SectionItem {
  key: string;
  section: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'ManageSectionOrder'>;

export default function ManageSectionOrderScreen({ navigation }: Props) {
  const [testTypes, setTestTypes] = useState<TestTypeOrder[]>([]);
  const [selectedTestType, setSelectedTestType] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [availableSections, setAvailableSections] = useState<AvailableSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTestType) {
      loadSectionsForTestType(selectedTestType);
    }
  }, [selectedTestType]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // Get all unique test types from 2V_tests
      const { data: tests, error: testsError } = await supabase
        .from('2V_tests')
        .select('test_type');

      if (testsError) throw testsError;

      // Get unique test types
      const uniqueTestTypes = Array.from(new Set(tests?.map((t) => t.test_type) || []));

      // Get existing section orders
      const { data: orders, error: ordersError } = await supabase
        .from('2V_section_order')
        .select('*');

      if (ordersError) throw ordersError;

      // Create a map of existing orders
      const orderMap = new Map<string, TestTypeOrder>();
      orders?.forEach((order) => {
        orderMap.set(order.test_type, order);
      });

      // Build test types array with existing orders or empty defaults
      const testTypesData: TestTypeOrder[] = uniqueTestTypes.map((testType) => {
        const existing = orderMap.get(testType);
        return existing || {
          id: '', // Will be generated on save
          test_type: testType,
          section_order: [],
        };
      });

      testTypesData.sort((a, b) => a.test_type.localeCompare(b.test_type));

      setTestTypes(testTypesData);

      // Auto-select first test type
      if (testTypesData.length > 0) {
        setSelectedTestType(testTypesData[0].test_type);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadSectionsForTestType(testType: string) {
    try {
      // Get current order
      const existingOrder = testTypes.find((t) => t.test_type === testType);
      if (existingOrder) {
        const sectionItems: SectionItem[] = existingOrder.section_order.map((section, index) => ({
          key: `${section}-${index}`,
          section,
        }));
        setSections(sectionItems);
      }

      // Get all available sections and exercise types for this test type
      const { data: tests, error: testsError } = await supabase
        .from('2V_tests')
        .select('section, exercise_type')
        .eq('test_type', testType);

      if (testsError) throw testsError;

      // Count occurrences - use exercise_type for "Multi Topico", otherwise use section
      const sectionCounts = new Map<string, number>();
      tests?.forEach((test) => {
        // If section is "Multi Topico" or similar multi-topic variants, use exercise_type
        const key = test.section.toLowerCase().includes('multi')
          ? test.exercise_type
          : test.section;

        const count = sectionCounts.get(key) || 0;
        sectionCounts.set(key, count + 1);
      });

      const available: AvailableSection[] = Array.from(sectionCounts.entries()).map(
        ([section, count]) => ({
          section,
          count,
        })
      );

      setAvailableSections(available);
    } catch (err) {
      console.error('Error loading sections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sections');
    }
  }

  async function handleSave() {
    if (!selectedTestType) return;

    setSaving(true);
    setError(null);

    try {
      const sectionOrder = sections.map((item) => item.section);

      const { error: upsertError } = await supabase
        .from('2V_section_order')
        .upsert(
          {
            test_type: selectedTestType,
            section_order: sectionOrder,
          },
          {
            onConflict: 'test_type',
          }
        );

      if (upsertError) throw upsertError;

      // Reload data to sync
      await loadData();

      Alert.alert('Success', 'Section order saved successfully!');
    } catch (err) {
      console.error('Error saving:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function handleAddSection(section: string) {
    const sectionNames = sections.map((item) => item.section);
    if (!sectionNames.includes(section)) {
      const newItem: SectionItem = {
        key: `${section}-${Date.now()}`,
        section,
      };
      setSections([...sections, newItem]);
    }
  }

  function handleRemoveSection(key: string) {
    setSections(sections.filter((item) => item.key !== key));
  }

  // Temporarily disabled - draggable-flatlist removed
  /*
  function renderSectionItem({ item, drag, isActive }: RenderItemParams<SectionItem>) {
    const index = sections.findIndex((s) => s.key === item.key);

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.sectionItem,
            isActive && styles.sectionItemActive,
          ]}
          activeOpacity={0.9}
        >
          <View style={styles.sectionItemContent}>
            <View style={styles.sectionItemLeft}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.sectionItemText}>{item.section}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveSection(item.key)}
              style={styles.removeButton}
            >
              <FontAwesomeIcon icon={faTrash} size={16} color={COLORS.red500} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }
  */

  const unusedSections = availableSections.filter(
    (as) => !sections.some((item) => item.section === as.section)
  );

  const sortedUnusedSections = unusedSections.sort((a, b) => {
    const aLower = a.section.toLowerCase();
    const bLower = b.section.toLowerCase();

    const aIsAssessment = aLower.includes('assess') && aLower.includes('iniz');
    const bIsAssessment = bLower.includes('assess') && bLower.includes('iniz');
    const aIsSimulazione = aLower.includes('simulaz');
    const bIsSimulazione = bLower.includes('simulaz');

    // Assessment Iniziale always first
    if (aIsAssessment && !bIsAssessment) return -1;
    if (!aIsAssessment && bIsAssessment) return 1;

    // Simulazione always last
    if (aIsSimulazione && !bIsSimulazione) return 1;
    if (!aIsSimulazione && bIsSimulazione) return -1;

    // Everything else alphabetical
    return a.section.localeCompare(b.section);
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brandGreen} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={20} color={COLORS.brandDark} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Manage Section Order</Text>
            <Text style={styles.headerSubtitle}>Test Track Configuration</Text>
          </View>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ScrollView style={styles.content}>
          {/* Test Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Types</Text>
            <View style={styles.testTypesContainer}>
              {testTypes.length === 0 ? (
                <Text style={styles.emptyText}>No test types configured yet</Text>
              ) : (
                testTypes.map((tt) => (
                  <TouchableOpacity
                    key={tt.id || tt.test_type}
                    onPress={() => setSelectedTestType(tt.test_type)}
                    style={[
                      styles.testTypeButton,
                      selectedTestType === tt.test_type && styles.testTypeButtonActive,
                    ]}
                  >
                    <FontAwesomeIcon
                      icon={faClipboardList}
                      size={16}
                      color={
                        selectedTestType === tt.test_type ? COLORS.white : COLORS.brandDark
                      }
                      style={styles.testTypeIcon}
                    />
                    <Text
                      style={[
                        styles.testTypeText,
                        selectedTestType === tt.test_type && styles.testTypeTextActive,
                      ]}
                    >
                      {tt.test_type}
                    </Text>
                    <Text
                      style={[
                        styles.testTypeCount,
                        selectedTestType === tt.test_type && styles.testTypeCountActive,
                      ]}
                    >
                      ({tt.section_order.length} sections)
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* Section Order Management */}
          {selectedTestType ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Section Order for {selectedTestType}
                </Text>
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
                      <FontAwesomeIcon icon={faSave} size={16} color={COLORS.white} />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.instructions}>
                Long press and drag sections to reorder them. This order will be used in the
                test track for students and tutors.
              </Text>

              {/* Section List - Drag disabled temporarily */}
              <View style={styles.sectionsBox}>
                {sections.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      No sections added yet. Add sections from the list below.
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={styles.draggableList}>
                    {sections.map((item, index) => (
                      <View key={item.key} style={styles.sectionItem}>
                        <View style={styles.sectionItemContent}>
                          <View style={styles.sectionItemLeft}>
                            <View style={styles.orderBadge}>
                              <Text style={styles.orderBadgeText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.sectionItemText}>{item.section}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveSection(item.key)}
                            style={styles.removeButton}
                          >
                            <FontAwesomeIcon icon={faTrash} size={16} color={COLORS.red500} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Available Sections to Add */}
              {sortedUnusedSections.length > 0 && (
                <View style={styles.availableSectionsContainer}>
                  <Text style={styles.availableSectionsTitle}>
                    AVAILABLE SECTIONS (TAP TO ADD)
                  </Text>
                  <View style={styles.availableSectionsGrid}>
                    {sortedUnusedSections.map((as) => {
                      const isAssessment =
                        as.section.toLowerCase().includes('assess') &&
                        as.section.toLowerCase().includes('iniz');
                      const isSimulazione = as.section.toLowerCase().includes('simulaz');

                      return (
                        <TouchableOpacity
                          key={as.section}
                          onPress={() => handleAddSection(as.section)}
                          style={[
                            styles.availableSection,
                            isAssessment && styles.availableSectionAssessment,
                            isSimulazione && styles.availableSectionSimulazione,
                          ]}
                        >
                          <Text
                            style={[
                              styles.availableSectionText,
                              (isAssessment || isSimulazione) && styles.availableSectionTextSpecial,
                            ]}
                          >
                            {as.section}
                          </Text>
                          <View style={styles.availableSectionRight}>
                            <Text style={styles.availableSectionCount}>{as.count} tests</Text>
                            <FontAwesomeIcon icon={faPlus} size={12} color={COLORS.gray600} />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <FontAwesomeIcon icon={faClipboardList} size={64} color={COLORS.gray300} />
              <Text style={styles.emptyStateText}>
                Select a test type to manage section order
              </Text>
            </View>
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
  errorBanner: {
    backgroundColor: COLORS.red50,
    borderWidth: 2,
    borderColor: COLORS.red200,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  errorText: {
    color: COLORS.red700,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.brandDark,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testTypesContainer: {
    gap: 8,
  },
  testTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  testTypeButtonActive: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  testTypeIcon: {
    marginRight: 8,
  },
  testTypeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.brandDark,
  },
  testTypeTextActive: {
    color: COLORS.white,
  },
  testTypeCount: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  testTypeCountActive: {
    color: COLORS.white,
    opacity: 0.75,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionsBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    minHeight: 200,
    marginBottom: 24,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggableList: {
    padding: 8,
  },
  sectionItem: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
  },
  sectionItemActive: {
    borderColor: COLORS.brandGreen,
    backgroundColor: COLORS.green50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brandDark,
    flex: 1,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.red50,
  },
  availableSectionsContainer: {
    marginTop: 16,
  },
  availableSectionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: 12,
  },
  availableSectionsGrid: {
    gap: 8,
  },
  availableSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  availableSectionAssessment: {
    backgroundColor: COLORS.blue100,
    borderColor: COLORS.blue400,
  },
  availableSectionSimulazione: {
    backgroundColor: COLORS.purple100,
    borderColor: COLORS.purple400,
  },
  availableSectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.brandDark,
    flex: 1,
  },
  availableSectionTextSpecial: {
    color: COLORS.brandDark,
  },
  availableSectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availableSectionCount: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  emptyStateContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: 'center',
  },
});
