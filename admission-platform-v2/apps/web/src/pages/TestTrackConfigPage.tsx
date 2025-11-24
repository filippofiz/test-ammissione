/**
 * Test Track Configuration Page
 * Allows tutors to configure parameters for different test tracks:
 * - Assessment Iniziale
 * - Simulazione
 * - Training (placeholder)
 * - Assessment Monotematico (placeholder)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCog,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface TestTrackConfig {
  id?: string;
  test_type: string;
  track_type: string;
  section_order_mode: 'mandatory' | 'user_choice' | 'no_sections' | 'macro_sections_mandatory' | 'macro_sections_user_choice';
  section_order: string[] | null; // The ordered list of sections for mandatory mode
  time_per_section: Record<string, number> | null;
  total_time_minutes: number | null;
  navigation_mode: 'forward_only' | 'back_forward';
  navigation_between_sections?: 'forward_only' | 'back_forward';
  can_leave_blank: boolean | null;
  pause_mode: 'no_pause' | 'between_sections' | 'user_choice';
  pause_sections: string[] | null;
  pause_duration_minutes: number;
  max_pauses?: number;
  test_start_message?: string; // English message
  messaggio_iniziale_test?: string; // Italian message
  question_order?: 'sequential' | 'random';
  adaptivity_mode?: 'non_adaptive' | 'adaptive';
  use_base_questions?: boolean;
  base_questions_scope?: 'entire_test' | 'per_section';
  base_questions_count?: number;
  algorithm_id?: string;
  questions_per_section?: Record<string, number>; // Number of questions per section (for multi-section tests)
  total_questions?: number; // Total number of questions (for single-section tests)

  // Review & Edit Feature (GMAT-style)
  allow_review_at_end?: boolean; // Allow review screen at end of section
  allow_bookmarks?: boolean; // Allow flagging questions during test
  max_answer_changes?: number; // Max number of answer changes allowed (e.g., 3 for GMAT)
  max_questions_to_review?: number | null; // Max questions viewable in review (null = unlimited)
  section_adaptivity_config?: Record<string, { type: 'base' | 'adaptive'; difficulty?: string }> | null; // Section adaptivity configuration
  difficulty_levels_count?: number; // Number of difficulty levels (2, 3, or 4)
  training_config: any;
  assessment_mono_config: any;
}

interface AdaptiveValidation {
  valid: boolean;
  warning?: boolean;
  message: string;
  questionsWithLevels?: number;
  totalQuestions?: number;
}

export default function TestTrackConfigPage() {
  const { testType } = useParams<{ testType: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [trackTypes, setTrackTypes] = useState<Array<{ value: string; label: string; hasConfig: boolean }>>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [config, setConfig] = useState<TestTrackConfig>({
    test_type: testType || 'GMAT',
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
    algorithm_id: '',
    allow_review_at_end: false,
    allow_bookmarks: false,
    max_answer_changes: 0,
    max_questions_to_review: null,
    training_config: {},
    assessment_mono_config: {},
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [sectionTimes, setSectionTimes] = useState<Record<string, number>>({});
  const [adaptiveValidation, setAdaptiveValidation] = useState<AdaptiveValidation | null>(null);
  const [validatingAdaptive, setValidatingAdaptive] = useState(false);

  // Track if test has sections
  const [hasSections, setHasSections] = useState<boolean>(true);

  // Track if using macro sections instead of standard sections
  const [useMacroSections, setUseMacroSections] = useState<boolean>(false);

  // Track section adaptivity (for PDF tests with difficulty-based sections)
  const [useSectionAdaptivity, setUseSectionAdaptivity] = useState<boolean>(false);

  // Track number of difficulty levels (2, 3, or 4)
  const [difficultyLevelsCount, setDifficultyLevelsCount] = useState<number>(3);

  // Track section adaptivity configuration: which sections are base vs adaptive and their difficulty level
  const [sectionAdaptivityConfig, setSectionAdaptivityConfig] = useState<Record<string, {
    type: 'base' | 'adaptive';
    difficulty?: string; // e.g., 'easy', 'medium', 'hard'
  }>>({});

  // Store all test variations and their times
  const [testVariations, setTestVariations] = useState<Array<{
    id: string;
    test_type: string;
    section: string;
    exercise_type: string;
    test_number: number;
    default_duration_mins: number;
  }>>([]);

  // Track which sections have varying times
  const [sectionsWithVariations, setSectionsWithVariations] = useState<Set<string>>(new Set());

  // Track if we're showing individual test durations
  const [showDurationDetails, setShowDurationDetails] = useState(false);

  // Track editing state for durations
  const [editingDuration, setEditingDuration] = useState<string>('');

  // Track section duration allocation mode
  const [sectionDurationMode, setSectionDurationMode] = useState<'proportional' | 'specific'>('proportional');

  // Track specific section durations
  const [specificSectionDurations, setSpecificSectionDurations] = useState<Record<string, number>>({});

  // Track questions per section
  const [questionsPerSection, setQuestionsPerSection] = useState<Record<string, number>>({});

  // Track total time minutes (separate from individual test durations)
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number | null>(null);

  // Track validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Algorithms from library
  const [algorithms, setAlgorithms] = useState<Array<{ id: string; algorithm_type: string; display_name?: string; description?: string }>>([]);

  useEffect(() => {
    if (testType) {
      loadTrackTypes();
    }
  }, [testType]);

  useEffect(() => {
    if (testType && selectedTrack) {
      loadConfig();
    }
  }, [testType, selectedTrack]);

  useEffect(() => {
    if (testType && selectedTrack) {
      loadSections();
    }
  }, [testType, selectedTrack, useMacroSections]);

  // Initialize specific section durations when sections or duration mode changes
  useEffect(() => {
    if (sectionDurationMode === 'specific' && sections.length > 0 && Object.keys(specificSectionDurations).length === 0) {
      const defaultDuration = testVariations[0]?.default_duration_mins || 0;
      const durationPerSection = Math.round(defaultDuration / sections.length);
      const initialDurations: Record<string, number> = {};
      sections.forEach(section => {
        initialDurations[section] = durationPerSection;
      });
      setSpecificSectionDurations(initialDurations);
    }
  }, [sectionDurationMode, sections, testVariations]);

  // Auto-generate test start message based on configuration
  function generateTestStartMessage(language: string = 'it'): string {
    // Use i18n.getFixedT to get translations in specific language
    const tLang = i18n.getFixedT(language);

    // Translate track type
    const translatedTrack = tLang(`testTracks.${selectedTrack}`);

    let message = `${tLang('testStartMsg.welcome', { testType, trackType: translatedTrack })}!\n\n`;

    // Section order information - ONLY if test has sections
    if (hasSections && config.section_order_mode !== 'no_sections') {
      if (config.section_order_mode === 'mandatory' && sections.length > 0) {
        message += `📋 ${tLang('testStartMsg.sectionsInOrder', { count: sections.length })}:\n`;
        sections.forEach((section, index) => {
          message += `   ${index + 1}. ${section}\n`;
        });
        message += '\n';
      } else if (config.section_order_mode === 'user_choice') {
        message += `📋 ${tLang('testStartMsg.chooseOrder')}\n\n`;
      }
    }

    // Time information
    if (totalTimeMinutes) {
      message += `⏱️ ${tLang('testStartMsg.totalDuration', { minutes: totalTimeMinutes })}\n`;

      // Only show section-specific times if test has sections
      if (hasSections && sectionDurationMode === 'specific' && Object.keys(specificSectionDurations).length > 0) {
        message += `\n${tLang('testStartMsg.timePerSection')}:\n`;
        sections.forEach(section => {
          const duration = specificSectionDurations[section];
          if (duration) {
            message += `   • ${section}: ${duration} ${tLang('common.minutes')}\n`;
          }
        });
      } else if (hasSections && sections.length > 0) {
        const timePerSection = Math.round(totalTimeMinutes / sections.length);
        message += `   (${tLang('testStartMsg.approximately', { minutes: timePerSection })})\n`;
      }
      message += '\n';
    }

    // Navigation information
    if (config.navigation_mode === 'forward_only') {
      message += `➡️ ${tLang('testStartMsg.navForwardOnly')}\n`;
    } else {
      message += `↔️ ${tLang('testStartMsg.navBackForward')}\n`;
    }

    // Navigation between sections - ONLY if test has sections
    if (hasSections && config.navigation_between_sections) {
      if (config.navigation_between_sections === 'forward_only') {
        message += `➡️ ${tLang('testStartMsg.betweenSectionsForward')}\n`;
      } else {
        message += `↔️ ${tLang('testStartMsg.betweenSectionsBack')}\n`;
      }
    }
    message += '\n';

    // Blank answers
    if (config.can_leave_blank === false) {
      message += `✅ ${tLang('testStartMsg.mustAnswerAll')}\n\n`;
    } else if (config.can_leave_blank === true) {
      message += `⚪ ${tLang('testStartMsg.canLeaveBlank')}\n\n`;
    }

    // Pause information
    if (config.pause_mode === 'no_pause') {
      message += `⏸️ ${tLang('testStartMsg.noBreaks')}\n`;
    } else if (config.pause_mode === 'between_sections' && config.pause_sections && config.pause_sections.length > 0) {
      message += `⏸️ ${tLang('testStartMsg.mandatoryBreaks', { minutes: config.pause_duration_minutes })}:\n`;
      config.pause_sections.forEach(section => {
        message += `   • ${section}\n`;
      });
    } else if (config.pause_mode === 'user_choice' && config.max_pauses) {
      message += `⏸️ ${tLang('testStartMsg.optionalBreaks', { max: config.max_pauses, minutes: config.pause_duration_minutes })}\n`;
    }

    message += `\n📌 ${tLang('testStartMsg.readInstructions')}\n`;
    message += `${tLang('testStartMsg.goodLuck')} 🍀`;

    return message;
  }

  // Validate adaptive mode - check if questions have difficulty levels
  async function validateAdaptiveMode(): Promise<AdaptiveValidation> {
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
      const questionsWithDifficulty = questions?.filter(q => q.difficulty) || [];
      const questionsWithLevels = questionsWithDifficulty.length;

      if (questionsWithLevels === 0) {
        const result = {
          valid: false,
          message: 'No questions have difficulty levels assigned. Adaptive mode requires questions with difficulty levels.',
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
          message: `Only ${questionsWithLevels} of ${totalQuestions} questions have difficulty levels. This may limit adaptive algorithm effectiveness.`,
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

  // Validate when adaptivity mode changes to 'adaptive'
  useEffect(() => {
    if (config.adaptivity_mode === 'adaptive') {
      validateAdaptiveMode();
    } else {
      setAdaptiveValidation(null);
    }
  }, [config.adaptivity_mode, testType]);

  // Auto-set adaptivity_mode to non_adaptive when section adaptivity is enabled
  useEffect(() => {
    if (useSectionAdaptivity && config.adaptivity_mode === 'adaptive') {
      setConfig({ ...config, adaptivity_mode: 'non_adaptive' });
      console.log('📝 Auto-setting adaptivity_mode to non_adaptive (section adaptivity enabled)');
    }
  }, [useSectionAdaptivity]);

  // Auto-generate messages when config changes
  useEffect(() => {
    if (!config.messaggio_iniziale_test || config.messaggio_iniziale_test === '') {
      const generatedIT = generateTestStartMessage('it');
      const generatedEN = generateTestStartMessage('en');
      setConfig({
        ...config,
        messaggio_iniziale_test: generatedIT,
        test_start_message: generatedEN
      });
    }
  }, [config.section_order_mode, config.navigation_mode, config.navigation_between_sections,
      config.can_leave_blank, config.pause_mode, config.pause_sections, config.max_pauses,
      totalTimeMinutes, sectionDurationMode, sections, specificSectionDurations]);

  async function loadSections() {
    try {
      // First get test IDs for this specific track type
      const { data: trackTestsData, error: trackTestsError } = await supabase
        .from('2V_tests')
        .select('id')
        .eq('test_type', testType)
        .eq('exercise_type', selectedTrack);  // Filter by the specific track (e.g., 'Assessment Iniziale')

      if (trackTestsError) throw trackTestsError;

      const testIds = trackTestsData?.map(t => t.id) || [];

      // Load sections from database based on current mode, filtered by specific tests
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('section, macro_section')
        .in('test_id', testIds);  // Only get sections from tests of this specific track

      if (questionsError) throw questionsError;

      const uniqueSections = Array.from(new Set(
        questionsData?.map(q => useMacroSections ? q.macro_section : q.section).filter(Boolean) || []
      ));

      // Check if we have a saved section_order in config - use it to preserve custom ordering
      // but only if the sections match (user hasn't switched between standard/macro)
      if (config.section_order && config.section_order.length > 0) {
        const savedSectionsSet = new Set(config.section_order);
        const dbSectionsSet = new Set(uniqueSections);
        const sectionsMatch = config.section_order.every(s => dbSectionsSet.has(s)) &&
                             config.section_order.length === uniqueSections.length;

        if (sectionsMatch) {
          // Use saved order to preserve user's custom ordering
          setSections(config.section_order);
        } else {
          // Sections don't match (user switched modes), load fresh from DB
          setSections(uniqueSections.sort());
        }
      } else {
        // No saved order, use fresh sections from DB
        setSections(uniqueSections.sort());
      }

      // Get tests for this test type and exercise type for time information
      // Normalize track name: convert snake_case to Title Case (e.g., assessment_iniziale -> Assessment Iniziale)
      const normalizedTrackName = selectedTrack
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // For Assessment Iniziale, try to filter for Multi-topic section first
      let testsData = null;
      let testsError = null;

      if (normalizedTrackName === 'Assessment Iniziale') {
        // First try with Multi-topic filter
        const { data: multiTopicData, error: multiTopicError } = await supabase
          .from('2V_tests')
          .select('id, test_type, section, exercise_type, test_number, default_duration_mins')
          .eq('test_type', testType)
          .eq('exercise_type', normalizedTrackName)
          .eq('section', 'Multi-topic');

        if (multiTopicError) {
          testsError = multiTopicError;
        } else if (multiTopicData && multiTopicData.length > 0) {
          // Found Multi-topic tests, use them
          testsData = multiTopicData;
        } else {
          // No Multi-topic tests found, fall back to all tests for this exercise type
          const { data: allData, error: allError } = await supabase
            .from('2V_tests')
            .select('id, test_type, section, exercise_type, test_number, default_duration_mins')
            .eq('test_type', testType)
            .eq('exercise_type', normalizedTrackName);

          testsData = allData;
          testsError = allError;
        }
      } else {
        // For other exercise types, query normally
        const { data, error } = await supabase
          .from('2V_tests')
          .select('id, test_type, section, exercise_type, test_number, default_duration_mins')
          .eq('test_type', testType)
          .eq('exercise_type', normalizedTrackName);

        testsData = data;
        testsError = error;
      }

      if (testsError) throw testsError;

      if (!testsData || testsData.length === 0) {
        setSectionTimes({});
        setTestVariations([]);
        setSectionsWithVariations(new Set());
        return;
      }

      setTestVariations(testsData);

      // Extract unique sections and check for time variations
      const sectionTimeMap: Record<string, Set<number>> = {};
      testsData.forEach(test => {
        if (!sectionTimeMap[test.section]) {
          sectionTimeMap[test.section] = new Set();
        }
        if (test.default_duration_mins) {
          sectionTimeMap[test.section].add(test.default_duration_mins);
        }
      });

      // Identify sections with varying times
      const sectionsWithDifferentTimes = new Set<string>();
      const times: Record<string, number> = {};

      Object.entries(sectionTimeMap).forEach(([section, durations]) => {
        const uniqueDurations = Array.from(durations);
        if (uniqueDurations.length > 1) {
          // Multiple different times for this section
          sectionsWithDifferentTimes.add(section);
          // Use the most common or first value as default
          times[section] = uniqueDurations[0];
        } else if (uniqueDurations.length === 1) {
          // All tests have the same time
          times[section] = uniqueDurations[0];
        }
      });

      setSectionTimes(times);
      setSectionsWithVariations(sectionsWithDifferentTimes);
    } catch (err) {
      console.error('Error loading sections:', err);
    }
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedItem = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedItem);

    setSections(newSections);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  async function loadAlgorithms() {
    try {
      const { data, error } = await supabase
        .from('2V_algorithm_config')
        .select('id, algorithm_type, display_name, description')
        .order('algorithm_type');

      if (error) throw error;
      setAlgorithms(data || []);
    } catch (err) {
      console.error('Error loading algorithms:', err);
    }
  }

  async function loadTrackTypes() {
    try {
      // Load algorithms first
      await loadAlgorithms();

      // Load all track types available for this test type from the database
      const { data, error } = await supabase
        .from('2V_test_track_config')
        .select('track_type')
        .eq('test_type', testType);

      if (error) throw error;

      // Get unique track types and format them
      const uniqueTrackTypes = new Set<string>();
      data?.forEach(config => {
        if (config.track_type) {
          uniqueTrackTypes.add(config.track_type);
        }
      });

      // Convert to the format expected by the UI
      const formattedTrackTypes = Array.from(uniqueTrackTypes).map(trackType => ({
        value: trackType,
        label: trackType.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '), // Convert snake_case to Title Case
        hasConfig: true // All tracks from DB have config
      })).sort((a, b) => a.label.localeCompare(b.label));

      console.log('📋 Raw track types from DB:', data?.map(c => c.track_type));
      console.log('📋 Unique track types:', Array.from(uniqueTrackTypes));
      console.log('📋 Formatted track types:', formattedTrackTypes);

      setTrackTypes(formattedTrackTypes);

      // Set default selected track to first available track
      if (formattedTrackTypes.length > 0 && !selectedTrack) {
        setSelectedTrack(formattedTrackTypes[0].value);
      } else if (formattedTrackTypes.length === 0) {
        // No tracks configured - stop loading
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading track types:', err);
      setError('Failed to load track types');
      setLoading(false);
    }
  }

  async function loadConfig() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('2V_test_track_config')
        .select('*')
        .eq('test_type', testType)
        .eq('track_type', selectedTrack)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Detect if using macro sections from section_order_mode and normalize the value
        let detectedUseMacroSections = false;
        let normalizedMode = data.section_order_mode;

        if (data.section_order_mode === 'macro_sections_mandatory') {
          detectedUseMacroSections = true;
          normalizedMode = 'mandatory';
          console.log('📝 Auto-detected: Macro sections with mandatory order');
        } else if (data.section_order_mode === 'macro_sections_user_choice') {
          detectedUseMacroSections = true;
          normalizedMode = 'user_choice';
          console.log('📝 Auto-detected: Macro sections with user choice');
        }

        setUseMacroSections(detectedUseMacroSections);

        // Detect if using section adaptivity
        if (data.section_adaptivity_config && Object.keys(data.section_adaptivity_config).length > 0) {
          setUseSectionAdaptivity(true);
          setSectionAdaptivityConfig(data.section_adaptivity_config);
          if (data.difficulty_levels_count) {
            setDifficultyLevelsCount(data.difficulty_levels_count);
          }
          console.log('📝 Auto-detected: Section adaptivity enabled');
        }

        // Normalize section_order_mode to base value for easier UI handling
        setConfig({
          ...data,
          section_order_mode: normalizedMode
        });

        // Auto-detect if test has sections based on section_order_mode
        if (data.section_order_mode === 'no_sections') {
          setHasSections(false);
          console.log('📝 Auto-detected: Single section test (section_order_mode = no_sections)');
        } else {
          setHasSections(true);
          console.log('📝 Auto-detected: Multi-section test (section_order_mode =', data.section_order_mode + ')');
        }

        // Section order will be set by loadSections() which runs after useMacroSections is set
        // loadSections() will use the saved section_order when saving, but load from DB when changing modes

        // Load time configuration
        if (data.total_time_minutes) {
          setTotalTimeMinutes(data.total_time_minutes);
        }
        if (data.time_per_section) {
          setSpecificSectionDurations(data.time_per_section);
          setSectionDurationMode('specific');
        } else {
          setSectionDurationMode('proportional');
        }

        // Load questions per section
        if (data.questions_per_section) {
          setQuestionsPerSection(data.questions_per_section);
        }
      } else {
        // Set defaults
        setConfig({
          test_type: testType || 'GMAT',
          track_type: selectedTrack,
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
          algorithm_id: '',
          training_config: {},
          assessment_mono_config: {},
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
      // AUTO-FIX: If single section test is selected, set section_order_mode to 'no_sections'
      let finalSectionOrderMode = config.section_order_mode;
      if (hasSections === false) {
        finalSectionOrderMode = 'no_sections';
        console.log('📝 Auto-setting section_order_mode to "no_sections" (single section test)');
      } else if (useMacroSections) {
        // If using macro sections, prepend 'macro_sections_' to the mode
        if (config.section_order_mode === 'mandatory') {
          finalSectionOrderMode = 'macro_sections_mandatory';
          console.log('📝 Auto-setting section_order_mode to "macro_sections_mandatory" (macro sections with mandatory order)');
        } else if (config.section_order_mode === 'user_choice') {
          finalSectionOrderMode = 'macro_sections_user_choice';
          console.log('📝 Auto-setting section_order_mode to "macro_sections_user_choice" (macro sections with user choice)');
        }
      }

      // Validation
      const errors: string[] = [];

      // Only validate section-related config if test has sections
      if (hasSections) {
        // Check section order mode
        if (!finalSectionOrderMode) {
          errors.push('Section order mode is required');
        }

        // Check if mandatory mode has sections selected
        if (finalSectionOrderMode === 'mandatory' && (!sections || sections.length === 0)) {
          errors.push('Please configure section order');
        }

        // Check navigation between sections
        if (!config.navigation_between_sections) {
          errors.push('Navigation between sections is required');
        }
      }

      // Check navigation inside section (always required)
      if (!config.navigation_mode) {
        errors.push('Navigation inside section is required');
      }

      // Check pause mode
      if (!config.pause_mode) {
        errors.push('Pause mode is required');
      }

      // Check pause configuration
      if (config.pause_mode === 'between_sections') {
        if (!config.pause_sections || config.pause_sections.length === 0) {
          errors.push('Please select at least one section for mandatory pause');
        }
        if (!config.pause_duration_minutes || config.pause_duration_minutes <= 0) {
          errors.push('Pause duration must be greater than 0');
        }
      }

      if (config.pause_mode === 'user_choice') {
        if (!config.pause_duration_minutes || config.pause_duration_minutes <= 0) {
          errors.push('Pause duration must be greater than 0');
        }
        if (!config.max_pauses || config.max_pauses <= 0) {
          errors.push('Maximum number of pauses must be greater than 0');
        }
      }

      // Check blank answers setting exists
      if (config.can_leave_blank === undefined || config.can_leave_blank === null) {
        errors.push('Blank answers setting is required');
      }

      // Check adaptive mode configuration
      if (config.adaptivity_mode === 'adaptive') {
        if (!adaptiveValidation || !adaptiveValidation.valid) {
          errors.push('Adaptive mode requires questions with difficulty levels');
        }
        if (config.use_base_questions) {
          if (!config.base_questions_count || config.base_questions_count <= 0) {
            errors.push('Base questions count must be greater than 0');
          }
          if (!config.base_questions_scope) {
            errors.push('Base questions scope is required');
          }
        }
        if (!config.algorithm_id) {
          errors.push('Algorithm is required for adaptive mode');
        }
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        setError('Please complete all required fields before saving');
        setSaving(false);
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Clear validation errors if all is good
      setValidationErrors([]);

      // Prepare the data to save
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { algorithm_type, ...configWithoutOldField } = config as any;

      const dataToSave = {
        ...configWithoutOldField,
        test_type: testType,
        track_type: selectedTrack,
        // Use the auto-corrected section_order_mode
        section_order_mode: finalSectionOrderMode,
        // Include section order if mandatory mode is selected AND has sections
        section_order: (hasSections && (finalSectionOrderMode === 'mandatory' || finalSectionOrderMode === 'macro_sections_mandatory')) ? sections : null,
        // Set navigation_between_sections to null when no sections
        navigation_between_sections: hasSections ? config.navigation_between_sections : null,
        // Include time configuration
        total_time_minutes: totalTimeMinutes,
        time_per_section: sectionDurationMode === 'specific' ? specificSectionDurations : null,
        // Include questions per section (only if has sections and values are set)
        questions_per_section: hasSections && Object.keys(questionsPerSection).length > 0 ? questionsPerSection : null,
        // Set pause_duration_minutes to null when no_pause is selected
        pause_duration_minutes: config.pause_mode === 'no_pause' ? null : config.pause_duration_minutes,
        // Set pause_sections to null when not 'between_sections'
        pause_sections: config.pause_mode === 'between_sections' ? config.pause_sections : null,
        // Set max_pauses to null when not 'user_choice'
        max_pauses: config.pause_mode === 'user_choice' ? config.max_pauses : null,
        // Set adaptive-related fields to null when non_adaptive
        base_questions_scope: config.adaptivity_mode === 'adaptive' ? config.base_questions_scope : null,
        base_questions_count: config.adaptivity_mode === 'adaptive' ? config.base_questions_count : null,
        algorithm_id: config.adaptivity_mode === 'adaptive' ? config.algorithm_id : null,
        // Include section adaptivity config
        section_adaptivity_config: useSectionAdaptivity ? sectionAdaptivityConfig : null,
        difficulty_levels_count: useSectionAdaptivity ? difficultyLevelsCount : null,
      };

      console.log('💾 Saving configuration:', dataToSave);

      const { error } = await supabase
        .from('2V_test_track_config')
        .upsert(dataToSave, {
          onConflict: 'test_type,track_type'
        });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      setSaveSuccess(true);
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error saving config:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(err?.message || err?.hint || 'Failed to save configuration. Please check console for details.');
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  const currentTrack = trackTypes.find(t => t.value === selectedTrack);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading configuration...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      pageTitle={`Configure ${testType} Test Tracks`}
      pageSubtitle="Test Track Settings"
    >
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Track Type Tabs */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCog} className="text-brand-green" />
              Select Test Track
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trackTypes.length === 0 ? (
                <div className="col-span-full">
                  <p className="text-center text-gray-500 py-4 mb-6">
                    No track types configured for {testType}. Create your first track configuration:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'assessment_iniziale', label: 'Assessment Iniziale' },
                      { value: 'simulazione', label: 'Simulazione' },
                      { value: 'training', label: 'Training' },
                      { value: 'assessment_monotematico', label: 'Assessment Monotematico' }
                    ].map(track => (
                      <button
                        key={track.value}
                        onClick={async () => {
                          // Create default config for this track
                          const { error } = await supabase
                            .from('2V_test_track_config')
                            .insert({
                              test_type: testType,
                              track_type: track.value,
                              section_order_mode: 'mandatory',
                              navigation_mode: 'forward_only',
                              navigation_between_sections: 'forward_only',
                              can_leave_blank: false,
                              pause_mode: 'between_sections',
                              pause_duration_minutes: 5,
                              max_pauses: 3,
                              question_order: 'sequential',
                              adaptivity_mode: 'non_adaptive',
                              use_base_questions: false,
                              base_questions_scope: 'entire_test',
                              base_questions_count: 5,
                              algorithm_id: '',
                              training_config: {},
                              assessment_mono_config: {},
                            });

                          if (error) {
                            console.error('Error creating track config:', error);
                            setError('Failed to create track configuration');
                          } else {
                            // Reload track types
                            await loadTrackTypes();
                            setSelectedTrack(track.value);
                          }
                        }}
                        className="p-4 rounded-xl font-semibold transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300"
                      >
                        + {track.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {trackTypes.map(track => (
                    <button
                      key={track.value}
                      onClick={() => setSelectedTrack(track.value)}
                      className={`p-4 rounded-xl font-semibold transition-all relative ${
                        selectedTrack === track.value
                          ? 'bg-gradient-to-r from-brand-green to-green-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {track.label}
                      {/* Configured badge */}
                      <span className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                        selectedTrack === track.value ? 'bg-white' : 'bg-green-500'
                      }`} title="Configured" />
                    </button>
                  ))}
                  {/* Show missing track type buttons */}
                  {[
                    { value: 'Assessment Iniziale', label: 'Assessment Iniziale' },
                    { value: 'Simulazione', label: 'Simulazione' },
                    { value: 'Training', label: 'Training' },
                    { value: 'Assessment Monotematico', label: 'Assessment Monotematico' }
                  ]
                    .filter(track => !trackTypes.some(t => t.value.toLowerCase().replace(/\s+/g, '_') === track.value.toLowerCase().replace(/\s+/g, '_')))
                    .map(track => (
                      <div key={track.value} className="relative">
                        <button
                          onClick={async () => {
                            // Check if there are existing configs to copy from
                            if (trackTypes.length > 0) {
                              // Show copy option
                              const copyFrom = await new Promise<string | null>((resolve) => {
                                const choice = confirm(`Copy configuration from "${trackTypes[0].label}"?\n\nClick OK to copy, or Cancel to create with defaults.`);
                                resolve(choice ? trackTypes[0].value : null);
                              });

                              if (copyFrom) {
                                // Copy configuration from selected track
                                const { data: sourceConfig } = await supabase
                                  .from('2V_test_track_config')
                                  .select('*')
                                  .eq('test_type', testType)
                                  .eq('track_type', copyFrom)
                                  .single();

                                if (sourceConfig) {
                                  const { id, created_at, updated_at, created_by, ...configToCopy } = sourceConfig;
                                  const { error } = await supabase
                                    .from('2V_test_track_config')
                                    .insert({
                                      ...configToCopy,
                                      track_type: track.value,
                                    });

                                  if (error) {
                                    console.error('Error creating track config:', error);
                                    setError('Failed to create track configuration');
                                  } else {
                                    await loadTrackTypes();
                                    setSelectedTrack(track.value);
                                  }
                                  return;
                                }
                              }
                            }

                            // Create default config for this track
                            const { error } = await supabase
                              .from('2V_test_track_config')
                              .insert({
                                test_type: testType,
                                track_type: track.value,
                                section_order_mode: 'mandatory',
                                navigation_mode: 'forward_only',
                                navigation_between_sections: 'forward_only',
                                can_leave_blank: false,
                                pause_mode: 'between_sections',
                                pause_duration_minutes: 5,
                                max_pauses: 3,
                                question_order: 'sequential',
                                adaptivity_mode: 'non_adaptive',
                                use_base_questions: false,
                                base_questions_scope: 'entire_test',
                                base_questions_count: 5,
                                algorithm_id: '',
                                training_config: {},
                                assessment_mono_config: {},
                              });

                            if (error) {
                              console.error('Error creating track config:', error);
                              setError('Failed to create track configuration');
                            } else {
                              // Reload track types
                              await loadTrackTypes();
                              setSelectedTrack(track.value);
                            }
                          }}
                          className="w-full p-4 rounded-xl font-semibold transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300"
                        >
                          + {track.label}
                        </button>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">
              {currentTrack?.label} Configuration
            </h2>

            {/* Success Message */}
            {saveSuccess && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                <p className="text-green-700 font-medium">Configuration saved successfully!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
                  <p className="text-red-700 font-bold">{error}</p>
                </div>
                {validationErrors.length > 0 && (
                  <ul className="ml-8 mt-3 space-y-1">
                    {validationErrors.map((err, index) => (
                      <li key={index} className="text-red-600 text-sm">• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!currentTrack?.hasConfig ? (
              /* Placeholder for Training and Assessment Monotematico */
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faCog} className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Configuration Coming Soon
                </h3>
                <p className="text-gray-500">
                  Configuration options for {currentTrack?.label} will be added in a future update.
                </p>
              </div>
            ) : (
              /* Configuration Form for Assessment Iniziale and Simulazione */
              <div className="space-y-8">
                {/* Has Sections Toggle */}
                <div className="border-b border-gray-200 pb-6 bg-yellow-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Test Structure</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="test_structure"
                        checked={hasSections === true && useMacroSections === false}
                        onChange={() => {
                          setHasSections(true);
                          setUseMacroSections(false);
                        }}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Test has sections (Standard)</div>
                        <div className="text-sm text-gray-600">Test is divided into standard sections from the section column</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="test_structure"
                        checked={hasSections === true && useMacroSections === true}
                        onChange={() => {
                          setHasSections(true);
                          setUseMacroSections(true);
                        }}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Test has sections (Macro Sections)</div>
                        <div className="text-sm text-gray-600">Test is divided into macro sections (e.g., RW1, RW2, Math1, Math2)</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="test_structure"
                        checked={hasSections === false}
                        onChange={() => {
                          setHasSections(false);
                          setUseMacroSections(false);
                        }}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Single section test</div>
                        <div className="text-sm text-gray-600">Test is a single continuous set of questions</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Section Order - Only show if has sections */}
                {hasSections && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Section Order</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="section_order"
                        checked={config.section_order_mode === 'mandatory'}
                        onChange={() => setConfig({ ...config, section_order_mode: 'mandatory' })}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Mandatory Sequence</div>
                        <div className="text-sm text-gray-600">Sections must be completed in a fixed order</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="section_order"
                        checked={config.section_order_mode === 'user_choice'}
                        onChange={() => setConfig({ ...config, section_order_mode: 'user_choice' })}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">User Choice</div>
                        <div className="text-sm text-gray-600">Student can choose section order</div>
                      </div>
                    </label>
                  </div>

                  {/* Show section ordering when mandatory is selected */}
                  {config.section_order_mode === 'mandatory' && sections.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <h4 className="font-semibold text-brand-dark mb-2">Section Order Configuration</h4>
                      <p className="text-sm text-gray-700 mb-4">
                        Drag and drop to reorder sections. This order will be enforced when students take the test.
                      </p>
                      <div className="space-y-2">
                        {sections.map((section, index) => (
                          <div
                            key={section}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-3 bg-white border-2 rounded-lg cursor-move transition-all ${
                              draggedIndex === index
                                ? 'border-brand-green shadow-lg scale-105 opacity-50'
                                : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                            }`}
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                            </svg>
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="font-semibold text-gray-800 flex-1">{section}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-3 italic">
                        💡 Students will see and complete sections in this exact order
                      </p>
                    </div>
                  )}
                </div>
                )}

                {/* Test Duration - Always shown */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Test Duration</h3>

                  {testVariations.length > 0 ? (() => {
                    // Check if all tests have the same duration
                    const allDurations = testVariations.map(t => t.default_duration_mins);
                    const uniqueDurations = Array.from(new Set(allDurations));
                    const allSame = uniqueDurations.length === 1;

                    return (
                      <div>
                        {allSame ? (
                          // All tests have the same duration
                          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-800">Duration for all tests (minutes)</h4>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                ✓ Consistent
                              </span>
                            </div>
                            <input
                              type="number"
                              defaultValue={uniqueDurations[0] || ''}
                              onBlur={async (e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  e.target.value = uniqueDurations[0]?.toString() || '';
                                  return;
                                }

                                const newDuration = parseInt(value);
                                if (isNaN(newDuration) || newDuration <= 0) {
                                  e.target.value = uniqueDurations[0]?.toString() || '';
                                  return;
                                }

                                // Update state for config saving
                                setTotalTimeMinutes(newDuration);

                                // Update all tests to have the same duration
                                for (const test of testVariations) {
                                  await supabase
                                    .from('2V_tests')
                                    .update({ default_duration_mins: newDuration })
                                    .eq('id', test.id);
                                }

                                // Reload to show updated values
                                loadSections();
                              }}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-lg font-bold"
                            />
                            <p className="text-xs text-gray-600 mt-2">
                              All {testVariations.length} tests have the same duration
                            </p>

                            {/* Allow expanding to see individual tests */}
                            <button
                              onClick={() => setShowDurationDetails(!showDurationDetails)}
                              className="w-full mt-4 px-4 py-2 bg-white border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors font-semibold text-gray-800 flex items-center justify-between"
                            >
                              <span>{showDurationDetails ? 'Hide' : 'Show'} individual tests</span>
                              <svg
                                className={`w-5 h-5 transition-transform ${showDurationDetails ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {showDurationDetails && (
                              <div className="mt-4 space-y-2 p-3 bg-white rounded-lg border border-green-200">
                                {testVariations.map(test => (
                                  <div key={test.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <span className="font-medium text-gray-700 text-sm">
                                      {test.section === 'Multi-topic'
                                        ? `${test.test_type} ${test.exercise_type} - Test ${test.test_number}`
                                        : `${test.test_type} ${test.section} - Test ${test.test_number}`}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        key={test.id}
                                        defaultValue={test.default_duration_mins || ''}
                                        onBlur={async (e) => {
                                          const value = e.target.value;
                                          if (value === '') {
                                            e.target.value = test.default_duration_mins?.toString() || '';
                                            return;
                                          }

                                          const newDuration = parseInt(value);
                                          if (isNaN(newDuration) || newDuration <= 0) {
                                            e.target.value = test.default_duration_mins?.toString() || '';
                                            return;
                                          }

                                          await supabase
                                            .from('2V_tests')
                                            .update({ default_duration_mins: newDuration })
                                            .eq('id', test.id);

                                          // Reload to show updated values
                                          loadSections();
                                        }}
                                        className="w-24 px-3 py-1 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-sm font-bold"
                                      />
                                      <span className="text-gray-600 text-xs">min</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Tests have different durations - show warning
                          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-800">Duration inconsistency detected</h4>
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                ⚠️ Different times
                              </span>
                            </div>
                            <p className="text-sm text-orange-800 mb-4">
                              Tests in this track have different durations. Click to expand and see details.
                            </p>

                            <button
                              onClick={() => setShowDurationDetails(!showDurationDetails)}
                              className="w-full px-4 py-2 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-gray-800 flex items-center justify-between"
                            >
                              <span>{showDurationDetails ? 'Hide' : 'Show'} individual test durations</span>
                              <svg
                                className={`w-5 h-5 transition-transform ${showDurationDetails ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {showDurationDetails && (
                              <div className="mt-4 space-y-2 p-3 bg-white rounded-lg border border-orange-200">
                                {testVariations.map(test => (
                                  <div key={test.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <span className="font-medium text-gray-700 text-sm">
                                      {test.section === 'Multi-topic'
                                        ? `${test.test_type} ${test.exercise_type} - Test ${test.test_number}`
                                        : `${test.test_type} ${test.section} - Test ${test.test_number}`}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        key={test.id}
                                        defaultValue={test.default_duration_mins || ''}
                                        onBlur={async (e) => {
                                          const value = e.target.value;
                                          if (value === '') {
                                            e.target.value = test.default_duration_mins?.toString() || '';
                                            return;
                                          }

                                          const newDuration = parseInt(value);
                                          if (isNaN(newDuration) || newDuration <= 0) {
                                            e.target.value = test.default_duration_mins?.toString() || '';
                                            return;
                                          }

                                          await supabase
                                            .from('2V_tests')
                                            .update({ default_duration_mins: newDuration })
                                            .eq('id', test.id);

                                          // Reload to show updated values
                                          loadSections();
                                        }}
                                        className="w-24 px-3 py-1 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-sm font-bold"
                                      />
                                      <span className="text-gray-600 text-xs">min</span>
                                    </div>
                                  </div>
                                ))}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <button
                                    className="w-full px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                    onClick={async () => {
                                      // Use the first test's duration as the standard
                                      const standardDuration = testVariations[0].default_duration_mins;

                                      for (const test of testVariations) {
                                        await supabase
                                          .from('2V_tests')
                                          .update({ default_duration_mins: standardDuration })
                                          .eq('id', test.id);
                                      }

                                      // Reload and close details
                                      setShowDurationDetails(false);
                                      loadSections();
                                    }}
                                  >
                                    Set same duration for all tests
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">Total Test Duration (minutes)</h4>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          ℹ️ No tests yet
                        </span>
                      </div>
                      <input
                        type="number"
                        value={totalTimeMinutes || ''}
                        onChange={(e) => setTotalTimeMinutes(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-lg font-bold"
                        placeholder="Enter duration in minutes (e.g., 60)"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        No tests found in database for {testType} {selectedTrack}. Set a default duration here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Section Adaptivity - Only show if has sections */}
                {hasSections && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Section Adaptivity</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enable section-based adaptivity. Each section can have different difficulty levels based on student performance.
                  </p>

                  <div className="space-y-3 mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="section_adaptivity"
                        checked={useSectionAdaptivity === false}
                        onChange={() => setUseSectionAdaptivity(false)}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">No Section Adaptivity</div>
                        <div className="text-sm text-gray-600">Standard fixed difficulty sections</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="section_adaptivity"
                        checked={useSectionAdaptivity === true}
                        onChange={() => setUseSectionAdaptivity(true)}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Enable Section Adaptivity</div>
                        <div className="text-sm text-gray-600">Sections adapt based on performance (base sections + easy/medium/hard)</div>
                      </div>
                    </label>
                  </div>

                  {/* Section Adaptivity Configuration */}
                  {useSectionAdaptivity && sections.length > 0 && (
                    <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                      <h4 className="font-semibold text-brand-dark mb-3">Configure Section Adaptivity</h4>

                      {/* Number of difficulty levels */}
                      <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Difficulty Levels:
                        </label>
                        <select
                          value={difficultyLevelsCount}
                          onChange={(e) => setDifficultyLevelsCount(parseInt(e.target.value))}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        >
                          <option value={2}>2 Levels (Easy, Hard)</option>
                          <option value={3}>3 Levels (Easy, Medium, Hard)</option>
                          <option value={4}>4 Levels (Very Easy, Easy, Hard, Very Hard)</option>
                        </select>
                      </div>

                      <p className="text-sm text-gray-700 mb-4">
                        Mark sections as "Base" (to establish baseline) or "Adaptive" (adjusts difficulty based on performance)
                      </p>
                      <div className="space-y-3">
                        {sections.map((section, index) => {
                          // Generate difficulty level options based on count
                          const difficultyLevels = (() => {
                            if (difficultyLevelsCount === 2) return ['easy', 'hard'];
                            if (difficultyLevelsCount === 3) return ['easy', 'medium', 'hard'];
                            return ['very_easy', 'easy', 'hard', 'very_hard'];
                          })();

                          const difficultyLabels: Record<string, string> = {
                            'very_easy': 'Very Easy',
                            'easy': 'Easy',
                            'medium': 'Medium',
                            'hard': 'Hard',
                            'very_hard': 'Very Hard'
                          };

                          return (
                            <div key={section} className="p-4 bg-white rounded-lg border-2 border-purple-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-gray-800">{section}</span>
                                <div className="flex gap-3">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`section_adaptivity_${section}`}
                                      checked={sectionAdaptivityConfig[section]?.type === 'base'}
                                      onChange={() => {
                                        setSectionAdaptivityConfig({
                                          ...sectionAdaptivityConfig,
                                          [section]: { type: 'base' }
                                        });
                                      }}
                                      className="w-4 h-4 text-brand-green"
                                    />
                                    <span className="text-sm font-semibold">Base Section</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`section_adaptivity_${section}`}
                                      checked={sectionAdaptivityConfig[section]?.type === 'adaptive'}
                                      onChange={() => {
                                        setSectionAdaptivityConfig({
                                          ...sectionAdaptivityConfig,
                                          [section]: { type: 'adaptive', difficulty: difficultyLevels[0] }
                                        });
                                      }}
                                      className="w-4 h-4 text-brand-green"
                                    />
                                    <span className="text-sm font-semibold">Adaptive Section</span>
                                  </label>
                                </div>
                              </div>

                              {/* Difficulty level dropdown for adaptive sections */}
                              {sectionAdaptivityConfig[section]?.type === 'adaptive' && (
                                <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Difficulty Level:
                                  </label>
                                  <select
                                    value={sectionAdaptivityConfig[section]?.difficulty || difficultyLevels[0]}
                                    onChange={(e) => {
                                      setSectionAdaptivityConfig({
                                        ...sectionAdaptivityConfig,
                                        [section]: { type: 'adaptive', difficulty: e.target.value }
                                      });
                                    }}
                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-brand-green focus:outline-none bg-white"
                                  >
                                    {difficultyLevels.map(level => (
                                      <option key={level} value={level}>
                                        {difficultyLabels[level]}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-600 mt-3 italic">
                        💡 Base sections establish student baseline. Adaptive sections adjust difficulty based on performance.
                      </p>
                    </div>
                  )}
                </div>
                )}

                {/* Duration per Section - Only show if has sections */}
                {hasSections && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Duration per Section</h3>

                  <div className="space-y-4 mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sectionDurationMode"
                        checked={sectionDurationMode === 'proportional'}
                        onChange={() => setSectionDurationMode('proportional')}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Proportional Allocation</div>
                        <div className="text-sm text-gray-600">Divide total duration equally by number of sections</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sectionDurationMode"
                        checked={sectionDurationMode === 'specific'}
                        onChange={() => setSectionDurationMode('specific')}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Specific Allocation</div>
                        <div className="text-sm text-gray-600">Set duration for each section individually</div>
                      </div>
                    </label>
                  </div>

                  {sectionDurationMode === 'proportional' && sections.length > 0 && (
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3">Proportional Distribution</h4>
                      <p className="text-sm text-gray-700 mb-4">
                        {sections.length} sections will each receive equal time allocation
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sections.map(section => {
                          const totalDuration = testVariations[0]?.default_duration_mins || 0;
                          const durationPerSection = Math.round(totalDuration / sections.length);
                          const isAdaptive = sectionAdaptivityConfig[section]?.type === 'adaptive';

                          return (
                            <div key={section} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                              <span className="font-medium text-gray-700 text-sm">
                                {section}
                                {isAdaptive && <span className="ml-2 text-xs text-purple-600">(adaptive)</span>}
                              </span>
                              <span className="text-blue-600 font-bold">{durationPerSection} min</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-600 mt-3 italic">
                        Time automatically calculated based on total test duration
                      </p>
                    </div>
                  )}

                  {sectionDurationMode === 'specific' && sections.length > 0 && (
                    <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-4">Specific Duration per Section</h4>
                      <div className="space-y-3">
                        {sections.map(section => {
                          const defaultValue = specificSectionDurations[section] || Math.round((testVariations[0]?.default_duration_mins || 0) / sections.length);
                          const isAdaptive = sectionAdaptivityConfig[section]?.type === 'adaptive';

                          return (
                            <div key={section} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                              <label className="font-medium text-gray-700 text-sm flex-1">
                                {section}
                                {isAdaptive && <span className="ml-2 text-xs text-purple-600">(adaptive)</span>}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={specificSectionDurations[section] || defaultValue}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value > 0) {
                                      setSpecificSectionDurations({
                                        ...specificSectionDurations,
                                        [section]: value
                                      });
                                    }
                                  }}
                                  className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-sm font-bold"
                                />
                                <span className="text-gray-600 text-xs">min</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-600 mt-3 italic">
                        💡 Set specific time limits for each section
                      </p>
                    </div>
                  )}
                </div>
                )}

                {/* Questions per Section */}
                {hasSections && sections.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Questions per Section</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Set the number of questions to show for each section (for adaptive tests, this is the target number)
                  </p>
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="space-y-3">
                      {sections.map(section => {
                        const defaultValue = questionsPerSection[section] || 20;

                        return (
                          <div key={section} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                            <label className="font-medium text-gray-700 text-sm flex-1">
                              {section}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={questionsPerSection[section] ?? defaultValue}
                                onChange={(e) => {
                                  const rawValue = e.target.value;
                                  if (rawValue === '') {
                                    // Allow empty for typing
                                    setQuestionsPerSection({
                                      ...questionsPerSection,
                                      [section]: 0
                                    });
                                  } else {
                                    const value = parseInt(rawValue);
                                    if (!isNaN(value) && value >= 0) {
                                      setQuestionsPerSection({
                                        ...questionsPerSection,
                                        [section]: value
                                      });
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  // Reset to default if empty or 0 on blur
                                  const value = parseInt(e.target.value);
                                  if (isNaN(value) || value <= 0) {
                                    setQuestionsPerSection({
                                      ...questionsPerSection,
                                      [section]: defaultValue
                                    });
                                  }
                                }}
                                className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-sm font-bold"
                                min="1"
                              />
                              <span className="text-gray-600 text-xs">questions</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-600 mt-3 italic">
                      💡 GMAT defaults: Data Insights (20), Quantitative (21), Verbal (23)
                    </p>
                  </div>
                </div>
                )}

                {/* Navigation Inside Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Navigation Inside Section</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="navigation_inside"
                        checked={config.navigation_mode === 'forward_only'}
                        onChange={() => setConfig({ ...config, navigation_mode: 'forward_only' })}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Forward Only</div>
                        <div className="text-sm text-gray-600">Cannot go back to previous questions within a section</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="navigation_inside"
                        checked={config.navigation_mode === 'back_forward'}
                        onChange={() => setConfig({ ...config, navigation_mode: 'back_forward' })}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Back & Forward</div>
                        <div className="text-sm text-gray-600">Can navigate freely between questions within a section</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Navigation Between Sections - Only show if has sections */}
                {hasSections && (
                <div className={`border-b border-gray-200 pb-6 ${!config.navigation_between_sections ? 'border-red-300 bg-red-50 p-4 rounded-xl' : ''}`}>
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Navigation Between Sections</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="navigation_between"
                        checked={config.navigation_between_sections === 'forward_only'}
                        onChange={() => setConfig({ ...config, navigation_between_sections: 'forward_only' })}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Forward Only</div>
                        <div className="text-sm text-gray-600">Cannot go back to previous sections once completed</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="navigation_between"
                        checked={config.navigation_between_sections === 'back_forward'}
                        onChange={() => setConfig({ ...config, navigation_between_sections: 'back_forward' })}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Back & Forward</div>
                        <div className="text-sm text-gray-600">Can navigate freely between all sections</div>
                      </div>
                    </label>
                  </div>
                </div>
                )}

                {/* Blank Answers */}
                <div className={`border-b border-gray-200 pb-6 ${config.can_leave_blank === null || config.can_leave_blank === undefined ? 'border-red-300 bg-red-50 p-4 rounded-xl' : ''}`}>
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Blank Answers</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="blank_answers"
                        checked={config.can_leave_blank === true}
                        onChange={() => setConfig({ ...config, can_leave_blank: true })}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Yes - Allow Blank Answers</div>
                        <div className="text-sm text-gray-600">Students can leave questions unanswered</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="blank_answers"
                        checked={config.can_leave_blank === false}
                        onChange={() => setConfig({ ...config, can_leave_blank: false })}
                        className="w-5 h-5 text-brand-green"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">No - Require All Answers</div>
                        <div className="text-sm text-gray-600">Students must answer all questions</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Review & Edit Feature */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Review & Edit (End of Section)</h3>
                  <p className="text-sm text-gray-600 mb-4">Allow students to review and change answers at the end of each section (GMAT-style)</p>

                  <div className="space-y-4">
                    {/* Enable Review */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.allow_review_at_end || false}
                        onChange={(e) => setConfig({
                          ...config,
                          allow_review_at_end: e.target.checked,
                          allow_bookmarks: e.target.checked ? config.allow_bookmarks : false,
                          max_answer_changes: e.target.checked ? (config.max_answer_changes || 3) : 0
                        })}
                        className="w-5 h-5 text-brand-green rounded"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Enable Review Screen</div>
                        <div className="text-sm text-gray-600">Show review screen at end of section to revisit questions</div>
                      </div>
                    </label>

                    {config.allow_review_at_end && (
                      <div className="ml-8 space-y-4 p-4 bg-blue-50 rounded-xl">
                        {/* Allow Bookmarks */}
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.allow_bookmarks || false}
                            onChange={(e) => setConfig({ ...config, allow_bookmarks: e.target.checked })}
                            className="w-5 h-5 text-brand-green rounded"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">Allow Bookmarks</div>
                            <div className="text-sm text-gray-600">Let students flag questions to easily find them in review</div>
                          </div>
                        </label>

                        {/* Max Answer Changes */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Max Answer Changes
                          </label>
                          <input
                            type="number"
                            value={config.max_answer_changes || 3}
                            onChange={(e) => setConfig({ ...config, max_answer_changes: parseInt(e.target.value) || 0 })}
                            min="0"
                            max="99"
                            className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">Number of answers that can be changed (GMAT uses 3). Set to 0 for view-only review.</p>
                        </div>

                        {/* Max Questions to Review */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Max Questions to Review
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={config.max_questions_to_review || ''}
                              onChange={(e) => setConfig({
                                ...config,
                                max_questions_to_review: e.target.value ? parseInt(e.target.value) : null
                              })}
                              min="1"
                              placeholder="Unlimited"
                              className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                            />
                            <span className="text-sm text-gray-500">Leave empty for unlimited</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Maximum number of questions viewable in review screen</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pause Configuration */}
                <div>
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Pause Settings</h3>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="pause"
                          checked={config.pause_mode === 'no_pause'}
                          onChange={() => setConfig({ ...config, pause_mode: 'no_pause' })}
                          className="w-5 h-5 text-brand-green"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">No Pause</div>
                          <div className="text-sm text-gray-600">No breaks allowed during test</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="pause"
                          checked={config.pause_mode === 'between_sections'}
                          onChange={() => setConfig({ ...config, pause_mode: 'between_sections' })}
                          className="w-5 h-5 text-brand-green"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">Mandatory Pause (Between Specific Sections)</div>
                          <div className="text-sm text-gray-600">Pause required after specific sections</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="pause"
                          checked={config.pause_mode === 'user_choice'}
                          onChange={() => setConfig({ ...config, pause_mode: 'user_choice' })}
                          className="w-5 h-5 text-brand-green"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">Student Choice (Between Sections)</div>
                          <div className="text-sm text-gray-600">Student can choose to pause between sections</div>
                        </div>
                      </label>
                    </div>

                    {/* Mandatory Pause Configuration */}
                    {config.pause_mode === 'between_sections' && sections.length > 0 && (
                      <div className={`p-4 rounded-xl ${(!config.pause_sections || config.pause_sections.length === 0) ? 'bg-red-50 border-2 border-red-300' : 'bg-orange-50 border-2 border-orange-200'}`}>
                        <h4 className="font-semibold text-gray-800 mb-3">Select Sections for Mandatory Pause</h4>
                        <p className="text-sm text-gray-700 mb-4">
                          Choose after which sections the student must take a pause
                        </p>
                        <div className="space-y-2 mb-4">
                          {sections.map((section, index) => (
                            <label key={section} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-orange-100 rounded">
                              <input
                                type="checkbox"
                                checked={(config.pause_sections || []).includes(section)}
                                onChange={(e) => {
                                  const currentSections = config.pause_sections || [];
                                  if (e.target.checked) {
                                    setConfig({ ...config, pause_sections: [...currentSections, section] });
                                  } else {
                                    setConfig({ ...config, pause_sections: currentSections.filter(s => s !== section) });
                                  }
                                }}
                                className="w-4 h-4 text-brand-green rounded"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                After {section} {index < sections.length - 1 ? '→' : '(Last section)'}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Pause Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={config.pause_duration_minutes}
                            onChange={(e) => setConfig({ ...config, pause_duration_minutes: parseInt(e.target.value) || 5 })}
                            min="1"
                            max="30"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Student Choice Configuration */}
                    {config.pause_mode === 'user_choice' && (
                      <div className={`p-4 rounded-xl ${!config.max_pauses || config.max_pauses <= 0 ? 'bg-red-50 border-2 border-red-300' : 'bg-purple-50 border-2 border-purple-200'}`}>
                        <h4 className="font-semibold text-gray-800 mb-3">Student Choice Settings</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Maximum Number of Pauses
                            </label>
                            <input
                              type="number"
                              value={config.max_pauses || ''}
                              onChange={(e) => setConfig({ ...config, max_pauses: parseInt(e.target.value) || 0 })}
                              min="1"
                              max="10"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                            />
                            <p className="text-xs text-gray-600 mt-1">How many times can the student pause?</p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Pause Duration (minutes)
                            </label>
                            <input
                              type="number"
                              value={config.pause_duration_minutes}
                              onChange={(e) => setConfig({ ...config, pause_duration_minutes: parseInt(e.target.value) || 5 })}
                              min="1"
                              max="30"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                            />
                            <p className="text-xs text-gray-600 mt-1">Duration of each pause</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Presentation */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Question Presentation</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Question Order
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                          <input
                            type="radio"
                            name="question_order"
                            value="sequential"
                            checked={config.question_order === 'sequential'}
                            onChange={() => setConfig({ ...config, question_order: 'sequential' })}
                            className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Sequential Order</div>
                            <div className="text-sm text-gray-600">Questions appear in their defined order</div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                          <input
                            type="radio"
                            name="question_order"
                            value="random"
                            checked={config.question_order === 'random'}
                            onChange={() => setConfig({ ...config, question_order: 'random' })}
                            className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Random Order</div>
                            <div className="text-sm text-gray-600">Questions shuffled randomly</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Adaptivity - Hide when section adaptivity is enabled */}
                {!useSectionAdaptivity && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Test Adaptivity</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Adaptivity Mode
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                          <input
                            type="radio"
                            name="adaptivity_mode"
                            value="non_adaptive"
                            checked={config.adaptivity_mode === 'non_adaptive'}
                            onChange={() => setConfig({ ...config, adaptivity_mode: 'non_adaptive' })}
                            className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Non-Adaptive (Traditional)</div>
                            <div className="text-sm text-gray-600">All students see same difficulty level</div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                          <input
                            type="radio"
                            name="adaptivity_mode"
                            value="adaptive"
                            checked={config.adaptivity_mode === 'adaptive'}
                            onChange={() => setConfig({ ...config, adaptivity_mode: 'adaptive' })}
                            className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Adaptive</div>
                            <div className="text-sm text-gray-600">Difficulty adjusts to student performance</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Adaptive Configuration */}
                    {config.adaptivity_mode === 'adaptive' && (
                      <div className="space-y-4 bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        {/* Validation Status */}
                        {validatingAdaptive && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-green"></div>
                            Validating question difficulty levels...
                          </div>
                        )}

                        {adaptiveValidation && (
                          <div className={`p-3 rounded-lg ${
                            !adaptiveValidation.valid
                              ? 'bg-red-100 border-2 border-red-300'
                              : adaptiveValidation.warning
                              ? 'bg-yellow-100 border-2 border-yellow-300'
                              : 'bg-green-100 border-2 border-green-300'
                          }`}>
                            <div className="flex items-start gap-2">
                              {!adaptiveValidation.valid && (
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mt-0.5" />
                              )}
                              {adaptiveValidation.warning && (
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mt-0.5" />
                              )}
                              {adaptiveValidation.valid && !adaptiveValidation.warning && (
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className={`text-sm font-semibold ${
                                  !adaptiveValidation.valid ? 'text-red-800' : adaptiveValidation.warning ? 'text-yellow-800' : 'text-green-800'
                                }`}>
                                  {adaptiveValidation.message}
                                </div>
                                {adaptiveValidation.questionsWithLevels !== undefined && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {adaptiveValidation.questionsWithLevels} / {adaptiveValidation.totalQuestions} questions have difficulty levels
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {adaptiveValidation?.valid && (
                          <>
                            {/* Base Questions */}
                            <div>
                              <label className="flex items-center gap-3 mb-3">
                                <input
                                  type="checkbox"
                                  checked={config.use_base_questions || false}
                                  onChange={(e) => setConfig({ ...config, use_base_questions: e.target.checked })}
                                  className="w-5 h-5 text-brand-green rounded focus:ring-brand-green"
                                />
                                <span className="font-semibold text-gray-900">Use base questions for baseline</span>
                              </label>

                              {config.use_base_questions && (
                                <div className="space-y-4 pl-8">
                                  {/* Base Questions Scope */}
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Base Questions Scope
                                    </label>
                                    <div className="space-y-2">
                                      <label className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-brand-green">
                                        <input
                                          type="radio"
                                          name="base_questions_scope"
                                          value="entire_test"
                                          checked={config.base_questions_scope === 'entire_test'}
                                          onChange={() => setConfig({ ...config, base_questions_scope: 'entire_test' })}
                                          className="mt-0.5 w-4 h-4 text-brand-green focus:ring-brand-green"
                                        />
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-gray-900">Entire Test</div>
                                          <div className="text-xs text-gray-600">Baseline established once, performance carries across all sections</div>
                                        </div>
                                      </label>

                                      <label className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-brand-green">
                                        <input
                                          type="radio"
                                          name="base_questions_scope"
                                          value="per_section"
                                          checked={config.base_questions_scope === 'per_section'}
                                          onChange={() => setConfig({ ...config, base_questions_scope: 'per_section' })}
                                          className="mt-0.5 w-4 h-4 text-brand-green focus:ring-brand-green"
                                        />
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-gray-900">Per Section</div>
                                          <div className="text-xs text-gray-600">Each section independently establishes new baseline</div>
                                        </div>
                                      </label>
                                    </div>
                                  </div>

                                  {/* Number of Base Questions */}
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Number of Base Questions
                                    </label>
                                    <input
                                      type="number"
                                      value={config.base_questions_count || 5}
                                      onChange={(e) => setConfig({ ...config, base_questions_count: parseInt(e.target.value) || 5 })}
                                      min="1"
                                      max="20"
                                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Algorithm Selection */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Algorithm
                              </label>
                              {algorithms.length === 0 ? (
                                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                  <p className="text-sm text-yellow-700">
                                    No algorithms configured. <a href="/tutor/algorithm-config" className="text-brand-green underline font-semibold">Create one in the Algorithm Library</a>
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <select
                                    value={config.algorithm_id || ''}
                                    onChange={(e) => setConfig({ ...config, algorithm_id: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none font-medium"
                                  >
                                    <option value="">Select an algorithm...</option>
                                    {algorithms.map((algo) => (
                                      <option key={algo.id} value={algo.id}>
                                        {algo.display_name || algo.algorithm_type}
                                      </option>
                                    ))}
                                  </select>
                                  {config.algorithm_id && (
                                    <p className="text-xs text-gray-500">
                                      {algorithms.find(a => a.id === config.algorithm_id)?.description || 'No description'}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-2">
                                    <a href="/tutor/algorithm-config" className="text-brand-green underline">Manage algorithms</a>
                                  </p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* Test Start Message - Bilingual */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-brand-dark">Test Start Message (Bilingual)</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const regeneratedIT = generateTestStartMessage('it');
                        const regeneratedEN = generateTestStartMessage('en');
                        setConfig({
                          ...config,
                          messaggio_iniziale_test: regeneratedIT,
                          test_start_message: regeneratedEN
                        });
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                    >
                      🔄 Regenerate Both
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    This message will be displayed to students before they start the test in their selected language.
                    Auto-generated based on your configuration and can be edited.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Italian Message */}
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🇮🇹 Italian / Italiano
                      </label>
                      <textarea
                        value={config.messaggio_iniziale_test || ''}
                        onChange={(e) => setConfig({ ...config, messaggio_iniziale_test: e.target.value })}
                        rows={15}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none font-mono text-sm whitespace-pre-wrap"
                        placeholder="Messaggio iniziale test (Italiano)..."
                      />
                    </div>

                    {/* English Message */}
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🇬🇧 English / Inglese
                      </label>
                      <textarea
                        value={config.test_start_message || ''}
                        onChange={(e) => setConfig({ ...config, test_start_message: e.target.value })}
                        rows={15}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none font-mono text-sm whitespace-pre-wrap"
                        placeholder="Test start message (English)..."
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-2">
                    💡 You can edit both messages freely. Click "Regenerate Both" to restore auto-generated versions based on current settings.
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all bg-gradient-to-r from-brand-green to-green-600 text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSave} className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
