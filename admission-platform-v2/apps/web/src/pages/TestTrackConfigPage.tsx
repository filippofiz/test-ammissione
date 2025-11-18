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
  section_order_mode: 'mandatory' | 'user_choice';
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
  algorithm_type?: 'simple' | 'complex';
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
    algorithm_type: 'simple',
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

  // Track total time minutes (separate from individual test durations)
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number | null>(null);

  // Track validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (testType) {
      loadTrackTypes();
    }
  }, [testType]);

  useEffect(() => {
    if (testType && selectedTrack) {
      loadSections();
      loadConfig();
    }
  }, [testType, selectedTrack]);

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

    // Section order information
    if (config.section_order_mode === 'mandatory' && sections.length > 0) {
      message += `📋 ${tLang('testStartMsg.sectionsInOrder', { count: sections.length })}:\n`;
      sections.forEach((section, index) => {
        message += `   ${index + 1}. ${section}\n`;
      });
      message += '\n';
    } else if (config.section_order_mode === 'user_choice') {
      message += `📋 ${tLang('testStartMsg.chooseOrder')}\n\n`;
    }

    // Time information
    if (totalTimeMinutes) {
      message += `⏱️ ${tLang('testStartMsg.totalDuration', { minutes: totalTimeMinutes })}\n`;

      if (sectionDurationMode === 'specific' && Object.keys(specificSectionDurations).length > 0) {
        message += `\n${tLang('testStartMsg.timePerSection')}:\n`;
        sections.forEach(section => {
          const duration = specificSectionDurations[section];
          if (duration) {
            message += `   • ${section}: ${duration} ${tLang('common.minutes')}\n`;
          }
        });
      } else if (sections.length > 0) {
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

    if (config.navigation_between_sections === 'forward_only') {
      message += `➡️ ${tLang('testStartMsg.betweenSectionsForward')}\n\n`;
    } else {
      message += `↔️ ${tLang('testStartMsg.betweenSectionsBack')}\n\n`;
    }

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
      // Get unique sections from 2V_questions for section ordering
      const { data: questionsData, error: questionsError } = await supabase
        .from('2V_questions')
        .select('section')
        .eq('test_type', testType);

      if (questionsError) throw questionsError;

      const uniqueSections = Array.from(new Set(questionsData?.map(q => q.section) || []));
      setSections(uniqueSections.sort());

      // Get tests for this test type and exercise type for time information
      const { data: testsData, error: testsError } = await supabase
        .from('2V_tests')
        .select('id, test_type, section, exercise_type, test_number, default_duration_mins')
        .eq('test_type', testType)
        .eq('exercise_type', selectedTrack);

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

  async function loadTrackTypes() {
    try {
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

      setTrackTypes(formattedTrackTypes);

      // Set default selected track to first available track
      if (formattedTrackTypes.length > 0 && !selectedTrack) {
        setSelectedTrack(formattedTrackTypes[0].value);
      }
    } catch (err) {
      console.error('Error loading track types:', err);
      setError('Failed to load track types');
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
        setConfig(data);
        // If section_order exists in config, use it; otherwise use the loaded sections
        if (data.section_order && data.section_order.length > 0) {
          setSections(data.section_order);
        }
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
          algorithm_type: 'simple',
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
      // Validation
      const errors: string[] = [];

      // Check section order mode
      if (!config.section_order_mode) {
        errors.push('Section order mode is required');
      }

      // Check if mandatory mode has sections selected
      if (config.section_order_mode === 'mandatory' && (!sections || sections.length === 0)) {
        errors.push('Please configure section order');
      }

      // Check navigation inside section
      if (!config.navigation_mode) {
        errors.push('Navigation inside section is required');
      }

      // Check navigation between sections
      if (!config.navigation_between_sections) {
        errors.push('Navigation between sections is required');
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
        if (!config.algorithm_type) {
          errors.push('Algorithm type is required for adaptive mode');
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
      const dataToSave = {
        ...config,
        test_type: testType,
        track_type: selectedTrack,
        // Include section order if mandatory mode is selected
        section_order: config.section_order_mode === 'mandatory' ? sections : null,
        // Include time configuration
        total_time_minutes: totalTimeMinutes,
        time_per_section: sectionDurationMode === 'specific' ? specificSectionDurations : null,
      };

      console.log('Saving configuration:', dataToSave);

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
            onClick={() => navigate('/tutor/students')}
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
                <p className="col-span-full text-center text-gray-500 py-4">
                  No track types configured for {testType}
                </p>
              ) : (
                trackTypes.map(track => (
                  <button
                    key={track.value}
                    onClick={() => setSelectedTrack(track.value)}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      selectedTrack === track.value
                        ? 'bg-gradient-to-r from-brand-green to-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {track.label}
                  </button>
                ))
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
                {/* Section Order */}
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

                {/* Test Duration */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-bold text-brand-dark mb-4">Test Duration</h3>

                  {testVariations.length > 0 && (() => {
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
                  })()}
                </div>

                {/* Duration per Section */}
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
                          return (
                            <div key={section} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                              <span className="font-medium text-gray-700 text-sm">{section}</span>
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
                          return (
                            <div key={section} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                              <label className="font-medium text-gray-700 text-sm flex-1">{section}</label>
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

                {/* Navigation Between Sections */}
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

                {/* Test Adaptivity */}
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

                            {/* Algorithm Type */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Algorithm Type
                              </label>
                              <div className="space-y-2">
                                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-green transition-colors">
                                  <input
                                    type="radio"
                                    name="algorithm_type"
                                    value="simple"
                                    checked={config.algorithm_type === 'simple'}
                                    onChange={() => setConfig({ ...config, algorithm_type: 'simple' })}
                                    className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                                  />
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">Simple</div>
                                    <div className="text-sm text-gray-600">Correct → harder, Wrong → easier</div>
                                  </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-green transition-colors">
                                  <input
                                    type="radio"
                                    name="algorithm_type"
                                    value="complex"
                                    checked={config.algorithm_type === 'complex'}
                                    onChange={() => setConfig({ ...config, algorithm_type: 'complex' })}
                                    className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                                  />
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">Complex (GMAT-style CAT)</div>
                                    <div className="text-sm text-gray-600">Uses Item Response Theory (IRT)</div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

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
