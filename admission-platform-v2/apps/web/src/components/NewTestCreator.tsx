/**
 * New Test Creator Component
 * Allows creating a new test from scratch by uploading PDFs directly
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrash,
  faFileUpload,
  faCheckCircle,
  faMagic,
  faSpinner,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import { LanguageSelectionModal } from './LanguageSelectionModal';

interface SectionData {
  section: string;
  testPdfFile: File | null;
  testPdfUrl: string | null;
  solutionsPdfFile: File | null;
  solutionsPdfUrl: string | null;
  correctAnswers: string;
  questionCount: number;
}

interface NewTestMetadata {
  test_type: string;
  exercise_type: string;
  test_number: number;
  languages?: 'ITA' | 'ENG' | 'BOTH';
}

interface NewTestCreatorProps {
  onConvert: (metadata: NewTestMetadata, sections: SectionData[]) => Promise<void>;
  converting: boolean;
  savedSections?: string[]; // Sections that have already been saved to database
}

export function NewTestCreator({ onConvert, converting, savedSections = [] }: NewTestCreatorProps) {
  const [metadata, setMetadata] = useState<NewTestMetadata>({
    test_type: '',
    exercise_type: 'Training',
    test_number: 1,
  });

  const [processedSections, setProcessedSections] = useState<SectionData[]>([]); // Sections that have been converted
  const [currentSection, setCurrentSection] = useState<SectionData>({
    section: '',
    testPdfFile: null,
    testPdfUrl: null,
    solutionsPdfFile: null,
    solutionsPdfUrl: null,
    correctAnswers: '',
    questionCount: 0,
  });

  const [uploadingTestPdf, setUploadingTestPdf] = useState(false);
  const [uploadingSolutionsPdf, setUploadingSolutionsPdf] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Conversion and review state
  const [convertedQuestions, setConvertedQuestions] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdTestId, setCreatedTestId] = useState<string | null>(null); // Track test_id for subsequent sections
  const [existingTestSections, setExistingTestSections] = useState<string[]>([]); // Sections that already exist for this test

  // Existing test types and sections from database
  const [existingTestTypes, setExistingTestTypes] = useState<string[]>([]);
  const [existingSectionsByType, setExistingSectionsByType] = useState<Map<string, string[]>>(new Map());
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Test configurations
  const [testConfigs, setTestConfigs] = useState<any[]>([]);
  const [currentConfig, setCurrentConfig] = useState<any | null>(null);

  // UI state for creating new items
  const [isCreatingNewTestType, setIsCreatingNewTestType] = useState(false);
  const [isCreatingNewSection, setIsCreatingNewSection] = useState(false);

  // Load existing test types, sections, and configs
  useEffect(() => {
    const loadExistingData = async () => {
      setLoadingTypes(true);
      try {
        // Load tests (get all test types, not just active)
        const { data: tests, error: testsError } = await supabase
          .from('2V_tests')
          .select('test_type, section');

        if (testsError) throw testsError;

        // Load test configs
        const { data: configs, error: configsError } = await supabase
          .from('2V_test_track_config')
          .select('*');

        if (configsError) throw configsError;

        if (tests) {
          // Get unique test types
          const types = Array.from(new Set(tests.map(t => t.test_type))).sort();
          setExistingTestTypes(types);

          // Group sections by test type
          const sectionsByType = new Map<string, Set<string>>();
          tests.forEach(test => {
            if (!sectionsByType.has(test.test_type)) {
              sectionsByType.set(test.test_type, new Set());
            }
            sectionsByType.get(test.test_type)!.add(test.section);
          });

          // Convert Sets to sorted Arrays
          const sectionsByTypeArray = new Map<string, string[]>();
          sectionsByType.forEach((sections, type) => {
            sectionsByTypeArray.set(type, Array.from(sections).sort());
          });

          setExistingSectionsByType(sectionsByTypeArray);
        }

        if (configs) {
          setTestConfigs(configs);
        }
      } catch (err) {
        console.error('Error loading existing test data:', err);
      } finally {
        setLoadingTypes(false);
      }
    };

    loadExistingData();
  }, []);

  // Load config when test type + exercise type changes
  useEffect(() => {
    if (metadata.test_type && metadata.exercise_type) {
      const config = testConfigs.find(
        c => c.test_type === metadata.test_type && c.track_type === metadata.exercise_type
      );
      setCurrentConfig(config || null);
      console.log('Loaded config for', metadata.test_type, metadata.exercise_type, ':', config);
    } else {
      setCurrentConfig(null);
    }
  }, [metadata.test_type, metadata.exercise_type, testConfigs]);

  // Check if test already exists when metadata is complete
  useEffect(() => {
    const checkExistingTest = async () => {
      if (!metadata.test_type || !metadata.exercise_type || !metadata.test_number) {
        setExistingTestSections([]);
        return;
      }

      try {
        // Query questions directly - join with tests to get sections
        const { data: questions } = await supabase
          .from('2V_questions')
          .select(`
            section,
            2V_tests!inner (
              test_type,
              exercise_type,
              test_number
            )
          `)
          .eq('2V_tests.test_type', metadata.test_type)
          .eq('2V_tests.exercise_type', metadata.exercise_type)
          .eq('2V_tests.test_number', metadata.test_number);

        if (questions && questions.length > 0) {
          // Get unique sections from questions
          const sections = Array.from(new Set(questions.map(q => q.section)));
          setExistingTestSections(sections);
          console.log(`✓ Found existing test: ${metadata.test_type} ${metadata.exercise_type} ${metadata.test_number} with sections:`, sections);
        } else {
          setExistingTestSections([]);
        }
      } catch (err) {
        console.error('Error checking existing test:', err);
        setExistingTestSections([]);
      }
    };

    checkExistingTest();
  }, [metadata.test_type, metadata.exercise_type, metadata.test_number]);

  // Clear processedSections when test metadata changes (so sections from Training 1 don't grey out Training 2)
  useEffect(() => {
    setProcessedSections([]);
  }, [metadata.test_type, metadata.exercise_type, metadata.test_number]);

  // Helper: Get available sections from config
  const getConfigSections = (): string[] => {
    if (!currentConfig) return [];

    // Check section_order first
    if (currentConfig.section_order) {
      try {
        // section_order might be a JSON string or already an array
        const sectionOrder = typeof currentConfig.section_order === 'string'
          ? JSON.parse(currentConfig.section_order)
          : currentConfig.section_order;

        if (Array.isArray(sectionOrder) && sectionOrder.length > 0) {
          console.log('Extracted sections from section_order:', sectionOrder);
          return sectionOrder;
        }
      } catch (e) {
        console.error('Failed to parse section_order:', e);
      }
    }

    // Fallback: Check section_adaptivity_config
    if (currentConfig.section_adaptivity_config) {
      try {
        const adaptivityConfig = typeof currentConfig.section_adaptivity_config === 'string'
          ? JSON.parse(currentConfig.section_adaptivity_config)
          : currentConfig.section_adaptivity_config;

        const sections = Object.keys(adaptivityConfig);
        console.log('Extracted sections from section_adaptivity_config:', sections);
        return sections;
      } catch (e) {
        console.error('Failed to parse section_adaptivity_config:', e);
      }
    }

    return [];
  };

  // Helper: Check if config uses sections
  const configHasSections = (): boolean => {
    if (!currentConfig) return true; // Default to allowing sections if no config
    return currentConfig.section_order_mode !== 'no_sections';
  };

  const handleTestPdfUpload = async (file: File) => {
    if (!file) return;

    setUploadingTestPdf(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const fileBase64 = btoa(binary);

      // Upload via edge function
      const timestamp = Date.now();
      const filePath = `temp/test_${timestamp}.pdf`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filePath,
            imageBase64: fileBase64,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload test PDF');
      }

      const data = await response.json();
      setCurrentSection(prev => ({
        ...prev,
        testPdfFile: file,
        testPdfUrl: data.publicUrl,
      }));
    } catch (err) {
      console.error('Error uploading test PDF:', err);
      alert('Failed to upload test PDF');
    } finally {
      setUploadingTestPdf(false);
    }
  };

  const handleSolutionsPdfUpload = async (file: File) => {
    if (!file) return;

    setUploadingSolutionsPdf(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const fileBase64 = btoa(binary);

      // Upload via edge function
      const timestamp = Date.now();
      const filePath = `temp/solutions_${timestamp}.pdf`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filePath,
            imageBase64: fileBase64,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload solutions PDF');
      }

      const data = await response.json();
      setCurrentSection(prev => ({
        ...prev,
        solutionsPdfFile: file,
        solutionsPdfUrl: data.publicUrl,
      }));
    } catch (err) {
      console.error('Error uploading solutions PDF:', err);
      alert('Failed to upload solutions PDF');
    } finally {
      setUploadingSolutionsPdf(false);
    }
  };

  const handleConvertCurrentSection = async () => {
    if (!currentSection.section) {
      alert('Please enter a section name');
      return;
    }
    if (!currentSection.testPdfFile || !currentSection.testPdfUrl) {
      alert('Please upload a test PDF');
      return;
    }
    if (!currentSection.solutionsPdfFile || !currentSection.solutionsPdfUrl) {
      alert('Please upload a solutions PDF');
      return;
    }
    if (!metadata.test_type) {
      alert('Please select test type');
      return;
    }

    // Show language selection modal
    setShowLanguageModal(true);
  };

  const handleLanguageConfirm = async (languages: 'ITA' | 'ENG' | 'BOTH') => {
    // Convert ONLY current section with selected languages
    await onConvert({ ...metadata, languages }, [currentSection]);
  };

  const handleAddAnotherSection = () => {
    // Reset for next section
    setCurrentSection({
      section: '',
      testPdfFile: null,
      testPdfUrl: null,
      solutionsPdfFile: null,
      solutionsPdfUrl: null,
      correctAnswers: '',
      questionCount: 0,
    });
    setShowConvertedQuestions(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-5 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faPlus} className="text-white text-sm" />
          </div>
          Create New Test
        </h2>

        {/* Test Metadata */}
        <div className="mb-5 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-base font-bold text-gray-800 mb-3">Test Metadata</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Type *
              </label>
              {isCreatingNewTestType ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new test type (e.g., GMAT, GRE, SAT...)"
                    value={metadata.test_type}
                    onChange={(e) => setMetadata(prev => ({ ...prev, test_type: e.target.value }))}
                    className="flex-1 px-4 py-3 border-2 border-green-300 rounded-lg focus:border-brand-green focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsCreatingNewTestType(false);
                      setMetadata(prev => ({ ...prev, test_type: '' }));
                    }}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={metadata.test_type}
                  onChange={(e) => {
                    if (e.target.value === '__create_new__') {
                      setIsCreatingNewTestType(true);
                      setMetadata(prev => ({ ...prev, test_type: '' }));
                    } else {
                      setMetadata(prev => ({ ...prev, test_type: e.target.value }));
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none bg-white"
                  disabled={loadingTypes}
                >
                  <option value="">Select a test type...</option>
                  {existingTestTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="__create_new__" className="font-bold text-green-700">+ Create New Test Type...</option>
                </select>
              )}
              {loadingTypes && (
                <p className="text-xs text-gray-500 mt-1">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1" />
                  Loading existing test types...
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Exercise Type
                </label>
                <select
                  value={metadata.exercise_type}
                  onChange={(e) => setMetadata(prev => ({ ...prev, exercise_type: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none bg-white"
                >
                  <option value="Training">Training</option>
                  <option value="Assessment Monotematico">Assessment Monotematico</option>
                  <option value="Assessment Iniziale">Assessment Iniziale</option>
                  <option value="Simulazione">Simulazione</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={metadata.test_number}
                  onChange={(e) => setMetadata(prev => ({ ...prev, test_number: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Existing Test Warning */}
        {existingTestSections.length > 0 && (
          <div className="mb-4 bg-amber-50 border-2 border-amber-500 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 text-lg mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-1 text-sm">Test Already Exists!</h3>
                <p className="text-amber-800 mb-3">
                  <strong>{metadata.test_type} {metadata.exercise_type} {metadata.test_number}</strong> already exists with {existingTestSections.length} section{existingTestSections.length > 1 ? 's' : ''}:
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {existingTestSections.map((section, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-semibold">
                      {section}
                    </span>
                  ))}
                </div>
                <p className="text-amber-700 text-sm">
                  You can add a new section to this existing test. Select a section that doesn't exist yet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Saved Sections */}
        {(savedSections.length > 0 || processedSections.length > 0) && (
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              Saved Sections ({savedSections.length + processedSections.length})
            </h3>
            <div className="space-y-3">
              {savedSections.map((sectionName, index) => (
                <div key={`saved-${index}`} className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-bold text-green-900">{sectionName}</div>
                    <div className="text-sm text-green-700">Saved to database</div>
                  </div>
                </div>
              ))}
              {processedSections.map((section, index) => (
                <div key={`processed-${index}`} className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-bold text-green-900">{section.section}</div>
                    <div className="text-sm text-green-700">
                      {section.questionCount} questions saved to database
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Section (only if config uses sections) */}
        {configHasSections() ? (
          <div className="mb-5 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="text-base font-bold text-blue-900 mb-3">Add Section</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section Name *
              </label>
              {isCreatingNewSection ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new section (e.g., Quantitative 1, Verbal 1...)"
                    value={currentSection.section}
                    onChange={(e) => setCurrentSection(prev => ({ ...prev, section: e.target.value }))}
                    className="flex-1 px-4 py-3 border-2 border-green-300 rounded-lg focus:border-brand-green focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsCreatingNewSection(false);
                      setCurrentSection(prev => ({ ...prev, section: '' }));
                    }}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <select
                    value={currentSection.section}
                    onChange={(e) => {
                      if (e.target.value === '__create_new__') {
                        setIsCreatingNewSection(true);
                        setCurrentSection(prev => ({ ...prev, section: '' }));
                      } else {
                        setCurrentSection(prev => ({ ...prev, section: e.target.value }));
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none bg-white"
                  >
                    <option value="">Select a section...</option>
                    {(() => {
                      // Sections from THIS specific test instance (greyed out)
                      const sectionsFromThisTest = existingTestSections;

                      // Sections just added in this session (also greyed out)
                      const sectionsAddedNow = [...savedSections, ...processedSections.map(s => s.section)];

                      // All sections to grey out
                      const unavailableSections = [...sectionsFromThisTest, ...sectionsAddedNow];

                      console.log('🔒 Unavailable sections (will be greyed out):', unavailableSections);

                      // Priority 1: Use sections from config if available
                      const configSections = getConfigSections();
                      if (configSections.length > 0) {
                        return configSections.map(section => {
                          const isUnavailable = unavailableSections.includes(section);
                          return (
                            <option
                              key={section}
                              value={section}
                              disabled={isUnavailable}
                              className={isUnavailable ? 'text-gray-400 bg-gray-100' : ''}
                            >
                              {section}{isUnavailable ? ' (Already exists)' : ''}
                            </option>
                          );
                        });
                      }

                      // Priority 2: Use existing sections for this test type
                      if (metadata.test_type && existingSectionsByType.has(metadata.test_type)) {
                        return existingSectionsByType.get(metadata.test_type)!.map(section => {
                          const isUnavailable = unavailableSections.includes(section);
                          return (
                            <option
                              key={section}
                              value={section}
                              disabled={isUnavailable}
                              className={isUnavailable ? 'text-gray-400 bg-gray-100' : ''}
                            >
                              {section}{isUnavailable ? ' (Already exists)' : ''}
                            </option>
                          );
                        });
                      }

                      // Priority 3: Show all unique sections
                      return Array.from(new Set(
                        Array.from(existingSectionsByType.values()).flat()
                      )).sort().map(section => (
                        <option key={section} value={section}>{section}</option>
                      ));
                    })()}
                    <option value="__create_new__" className="font-bold text-green-700">+ Create New Section...</option>
                  </select>
                  {(() => {
                    const configSections = getConfigSections();
                    if (configSections.length > 0) {
                      return (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {configSections.length} sections defined in config for {metadata.test_type} - {metadata.exercise_type}
                        </p>
                      );
                    }
                    if (metadata.test_type && existingSectionsByType.has(metadata.test_type)) {
                      return (
                        <p className="text-xs text-gray-500 mt-1">
                          {existingSectionsByType.get(metadata.test_type)!.length} existing sections for {metadata.test_type}
                        </p>
                      );
                    }
                    if (!metadata.test_type) {
                      return (
                        <p className="text-xs text-blue-600 mt-1">
                          💡 Select a test type and exercise type above to see configured sections
                        </p>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test PDF *
              </label>
              <div className="flex items-center gap-3">
                <label className={`flex-1 px-4 py-3 border-2 ${currentSection.testPdfFile ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-lg cursor-pointer hover:border-brand-green transition-colors flex items-center gap-3`}>
                  <FontAwesomeIcon icon={uploadingTestPdf ? faSpinner : (currentSection.testPdfFile ? faCheckCircle : faFileUpload)} className={uploadingTestPdf ? 'animate-spin text-brand-green' : (currentSection.testPdfFile ? 'text-green-500' : 'text-gray-400')} />
                  <span className={currentSection.testPdfFile ? 'text-green-700 font-medium' : 'text-gray-600'}>
                    {uploadingTestPdf ? 'Uploading...' : (currentSection.testPdfFile ? currentSection.testPdfFile.name : 'Choose PDF file')}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files && handleTestPdfUpload(e.target.files[0])}
                    className="hidden"
                    disabled={uploadingTestPdf}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Solutions PDF *
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Upload the solutions PDF - AI will automatically extract the answer key
              </p>
              <div className="flex items-center gap-3">
                <label className={`flex-1 px-4 py-3 border-2 ${currentSection.solutionsPdfFile ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-lg cursor-pointer hover:border-brand-green transition-colors flex items-center gap-3`}>
                  <FontAwesomeIcon icon={uploadingSolutionsPdf ? faSpinner : (currentSection.solutionsPdfFile ? faCheckCircle : faFileUpload)} className={uploadingSolutionsPdf ? 'animate-spin text-brand-green' : (currentSection.solutionsPdfFile ? 'text-green-500' : 'text-gray-400')} />
                  <span className={currentSection.solutionsPdfFile ? 'text-green-700 font-medium' : 'text-gray-600'}>
                    {uploadingSolutionsPdf ? 'Uploading...' : (currentSection.solutionsPdfFile ? currentSection.solutionsPdfFile.name : 'Choose PDF file')}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files && handleSolutionsPdfUpload(e.target.files[0])}
                    className="hidden"
                    disabled={uploadingSolutionsPdf}
                  />
                </label>
              </div>
            </div>

            <button
              onClick={handleConvertCurrentSection}
              disabled={!currentSection.section || !currentSection.testPdfFile || !currentSection.solutionsPdfFile || converting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              {converting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMagic} />
                  Convert & Extract Questions
                </>
              )}
            </button>
          </div>
          </div>
        ) : (
          /* No sections mode - single PDF upload */
          <div className="mb-5 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
            <h3 className="text-base font-bold text-amber-900 mb-3">
              Single Test Upload (No Sections)
            </h3>
            <p className="text-sm text-amber-700 mb-4">
              This test type does not use sections. Upload a single PDF test.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test PDF *
                </label>
                <div className="flex items-center gap-3">
                  <label className={`flex-1 px-4 py-3 border-2 ${currentSection.testPdfFile ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-lg cursor-pointer hover:border-brand-green transition-colors flex items-center gap-3`}>
                    <FontAwesomeIcon icon={uploadingTestPdf ? faSpinner : (currentSection.testPdfFile ? faCheckCircle : faFileUpload)} className={uploadingTestPdf ? 'animate-spin text-brand-green' : (currentSection.testPdfFile ? 'text-green-500' : 'text-gray-400')} />
                    <span className={currentSection.testPdfFile ? 'text-green-700 font-medium' : 'text-gray-600'}>
                      {uploadingTestPdf ? 'Uploading...' : (currentSection.testPdfFile ? currentSection.testPdfFile.name : 'Choose PDF file')}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files && handleTestPdfUpload(e.target.files[0])}
                      className="hidden"
                      disabled={uploadingTestPdf}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Solutions PDF *
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Upload the solutions PDF - AI will automatically extract the answer key
                </p>
                <div className="flex items-center gap-3">
                  <label className={`flex-1 px-4 py-3 border-2 ${currentSection.solutionsPdfFile ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-lg cursor-pointer hover:border-brand-green transition-colors flex items-center gap-3`}>
                    <FontAwesomeIcon icon={uploadingSolutionsPdf ? faSpinner : (currentSection.solutionsPdfFile ? faCheckCircle : faFileUpload)} className={uploadingSolutionsPdf ? 'animate-spin text-brand-green' : (currentSection.solutionsPdfFile ? 'text-green-500' : 'text-gray-400')} />
                    <span className={currentSection.solutionsPdfFile ? 'text-green-700 font-medium' : 'text-gray-600'}>
                      {uploadingSolutionsPdf ? 'Uploading...' : (currentSection.solutionsPdfFile ? currentSection.solutionsPdfFile.name : 'Choose PDF file')}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files && handleSolutionsPdfUpload(e.target.files[0])}
                      className="hidden"
                      disabled={uploadingSolutionsPdf}
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentSection(prev => ({ ...prev, section: 'Main' }));
                  handleConvertCurrentSection();
                }}
                disabled={!currentSection.testPdfFile || !currentSection.solutionsPdfFile || converting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                {converting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faMagic} />
                    Convert & Extract Questions
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onConfirm={handleLanguageConfirm}
      />
    </div>
  );
}
