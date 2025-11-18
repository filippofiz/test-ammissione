/**
 * Manage Section Order Page
 * Allows tutors to drag and drop sections to reorder the test track
 * This order will be used for both student and tutor views
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faGripVertical,
  faSave,
  faPlus,
  faTrash,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

interface TestTypeOrder {
  id: string;
  test_type: string;
  section_order: string[];
}

interface AvailableSection {
  section: string;
  count: number;
}

export default function ManageSectionOrderPage() {
  const navigate = useNavigate();
  const [testTypes, setTestTypes] = useState<TestTypeOrder[]>([]);
  const [selectedTestType, setSelectedTestType] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<AvailableSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
      const uniqueTestTypes = Array.from(new Set(tests?.map(t => t.test_type) || []));

      // Get existing section orders
      const { data: orders, error: ordersError } = await supabase
        .from('2V_section_order')
        .select('*');

      if (ordersError) throw ordersError;

      // Create a map of existing orders
      const orderMap = new Map<string, TestTypeOrder>();
      orders?.forEach(order => {
        orderMap.set(order.test_type, order);
      });

      // Build test types array with existing orders or empty defaults
      const testTypesData: TestTypeOrder[] = uniqueTestTypes.map(testType => {
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
      const existingOrder = testTypes.find(t => t.test_type === testType);
      if (existingOrder) {
        setSections(existingOrder.section_order);
      }

      // Get all available sections and exercise types for this test type
      const { data: tests, error: testsError } = await supabase
        .from('2V_tests')
        .select('section, exercise_type')
        .eq('test_type', testType);

      if (testsError) throw testsError;

      // Count occurrences - use exercise_type for "Multi Topico", otherwise use section
      const sectionCounts = new Map<string, number>();
      tests?.forEach(test => {
        // If section is "Multi Topico" or similar multi-topic variants, use exercise_type
        const key = test.section.toLowerCase().includes('multi')
          ? test.exercise_type
          : test.section;

        const count = sectionCounts.get(key) || 0;
        sectionCounts.set(key, count + 1);
      });

      const available: AvailableSection[] = Array.from(sectionCounts.entries()).map(([section, count]) => ({
        section,
        count,
      }));

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
      const { error: upsertError } = await supabase
        .from('2V_section_order')
        .upsert({
          test_type: selectedTestType,
          section_order: sections,
        }, {
          onConflict: 'test_type',
        });

      if (upsertError) throw upsertError;

      // Reload data to sync
      await loadData();

      alert('Section order saved successfully!');
    } catch (err) {
      console.error('Error saving:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
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

    // Remove from old position
    newSections.splice(draggedIndex, 1);

    // Insert at new position
    newSections.splice(index, 0, draggedItem);

    setSections(newSections);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  function handleAddSection(section: string) {
    if (!sections.includes(section)) {
      setSections([...sections, section]);
    }
  }

  function handleRemoveSection(index: number) {
    setSections(sections.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const unusedSections = availableSections.filter(
    as => !sections.includes(as.section)
  );

  return (
    <Layout pageTitle="Manage Section Order" pageSubtitle="Test Track Configuration">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Tutor Dashboard</span>
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Test Type Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4">Test Types</h3>
                <div className="space-y-2">
                  {testTypes.length === 0 ? (
                    <p className="text-gray-500 text-sm">No test types configured yet</p>
                  ) : (
                    testTypes.map(tt => (
                      <button
                        key={tt.id}
                        onClick={() => setSelectedTestType(tt.test_type)}
                        className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                          selectedTestType === tt.test_type
                            ? 'bg-gradient-to-r from-brand-green to-green-600 text-white shadow-lg'
                            : 'bg-gray-50 text-brand-dark hover:bg-gray-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                        {tt.test_type}
                        <span className="text-xs ml-2 opacity-75">
                          ({tt.section_order.length} sections)
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Main Content - Drag and Drop */}
            <div className="lg:col-span-2">
              {selectedTestType ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-brand-dark">
                      Section Order for {selectedTestType}
                    </h3>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <FontAwesomeIcon icon={faSave} className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="mr-2" />
                          Save Order
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop sections to reorder them. This order will be used in the test track for students and tutors.
                  </p>

                  {/* Ordered Sections */}
                  <div className="space-y-2 mb-6">
                    {sections.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-500">No sections added yet. Add sections from the list below.</p>
                      </div>
                    ) : (
                      sections.map((section, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-move transition-all ${
                            draggedIndex === index
                              ? 'border-brand-green bg-green-50 shadow-lg scale-105'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 bg-brand-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <span className="font-semibold text-brand-dark">{section}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSection(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Available Sections to Add */}
                  {unusedSections.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase">
                        Available Sections (Click to Add)
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {unusedSections
                          .sort((a, b) => {
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
                          })
                          .map(as => {
                            const isAssessment = as.section.toLowerCase().includes('assess') && as.section.toLowerCase().includes('iniz');
                            const isSimulazione = as.section.toLowerCase().includes('simulaz');

                            return (
                              <button
                                key={as.section}
                                onClick={() => handleAddSection(as.section)}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left ${
                                  isAssessment
                                    ? 'bg-blue-100 hover:bg-blue-200 border-blue-400 hover:border-blue-500 shadow-md'
                                    : isSimulazione
                                    ? 'bg-purple-100 hover:bg-purple-200 border-purple-400 hover:border-purple-500 shadow-md'
                                    : 'bg-gray-50 hover:bg-brand-green hover:text-white border-gray-200 hover:border-brand-green'
                                }`}
                              >
                                <span className={`font-semibold ${isAssessment || isSimulazione ? 'text-brand-dark' : ''}`}>
                                  {as.section}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs opacity-75">{as.count} tests</span>
                                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Select a test type to manage section order</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
