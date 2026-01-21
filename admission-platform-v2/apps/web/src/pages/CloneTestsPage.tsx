/**
 * Clone Tests Page
 * Allows cloning tests across different test types (BOCCONI -> TOLC, etc.)
 * Questions are shared via additional_test_ids array
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCopy,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

interface Test {
  id: string;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  format: string;
  default_duration_mins: number;
  is_active: boolean;
  materia: string | null;
}

interface Question {
  id: string;
  test_id: string;
  question_number: number;
  additional_test_ids: string[] | null;
}

export default function CloneTestsPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  const [targetTestType, setTargetTestType] = useState<string>('');
  const [cloning, setCloning] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentCloneIndex, setCurrentCloneIndex] = useState(0);
  const [cloneResults, setCloneResults] = useState<Array<{ test: Test; success: boolean; message: string }>>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      const { data, error: fetchError } = await supabase
        .from('2V_tests')
        .select('*')
        .order('test_type')
        .order('section')
        .order('exercise_type')
        .order('test_number');

      if (fetchError) throw fetchError;
      setTests(data || []);
    } catch (err) {
      console.error('Error loading tests:', err);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }

  function toggleTestSelection(test: Test) {
    setSelectedTests((prev) => {
      const isSelected = prev.some((t) => t.id === test.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== test.id);
      } else {
        return [...prev, test];
      }
    });
  }

  async function cloneSingleTest(test: Test, normalizedTargetType: string): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Check if target test already exists
      const { data: existingTest } = await supabase
        .from('2V_tests')
        .select('id')
        .ilike('test_type', normalizedTargetType)
        .eq('section', test.section)
        .eq('exercise_type', test.exercise_type)
        .eq('test_number', test.test_number)
        .maybeSingle();

      if (existingTest) {
        return {
          success: false,
          message: `Already exists`,
        };
      }

      // 2. Create new test (clone test row)
      const { data: newTest, error: createError } = await supabase
        .from('2V_tests')
        .insert({
          test_type: normalizedTargetType,
          section: test.section,
          exercise_type: test.exercise_type,
          test_number: test.test_number,
          format: test.format,
          default_duration_mins: test.default_duration_mins,
          is_active: test.is_active,
          materia: test.materia,
        })
        .select()
        .single();

      if (createError) throw createError;

      // 3. Get all questions from source test
      const { data: questions, error: questionsError } = await supabase
        .from('2V_questions')
        .select('id, test_id, question_number, additional_test_ids')
        .eq('test_id', test.id);

      if (questionsError) throw questionsError;

      // 4. Update each question's additional_test_ids to include new test
      let updatedCount = 0;
      for (const question of questions || []) {
        const currentAdditionalIds = question.additional_test_ids || [];
        const newAdditionalIds = [...currentAdditionalIds, newTest.id];

        const { error: updateError } = await supabase
          .from('2V_questions')
          .update({ additional_test_ids: newAdditionalIds })
          .eq('id', question.id);

        if (!updateError) {
          updatedCount++;
        }
      }

      return {
        success: true,
        message: `Cloned successfully (${updatedCount} questions)`,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to clone',
      };
    }
  }

  async function handleCloneTests() {
    if (selectedTests.length === 0) {
      setError('Please select at least one test to clone');
      return;
    }

    if (!targetTestType || targetTestType.trim() === '') {
      setError('Please enter a target test type');
      return;
    }

    setCloning(true);
    setShowProgressModal(true);
    setCurrentCloneIndex(0);
    setCloneResults([]);
    setError(null);
    setSuccess(null);

    const normalizedTargetType = targetTestType.trim().toUpperCase();
    const results: Array<{ test: Test; success: boolean; message: string }> = [];

    for (let i = 0; i < selectedTests.length; i++) {
      setCurrentCloneIndex(i);
      const test = selectedTests[i];

      const result = await cloneSingleTest(test, normalizedTargetType);
      results.push({
        test,
        success: result.success,
        message: result.message,
      });

      setCloneResults([...results]);
    }

    setCurrentCloneIndex(selectedTests.length);

    // Reload tests
    await loadTests();

    // Reset selection
    setSelectedTests([]);
    setCloning(false);

    // Show summary
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    if (successCount > 0) {
      setSuccess(`Successfully cloned ${successCount} test${successCount > 1 ? 's' : ''}!`);
    }
    if (failCount > 0) {
      setError(`Failed to clone ${failCount} test${failCount > 1 ? 's' : ''}`);
    }
  }

  // Group tests by test_type
  const testsByType = tests.reduce((acc, test) => {
    if (!acc[test.test_type]) {
      acc[test.test_type] = [];
    }
    acc[test.test_type].push(test);
    return acc;
  }, {} as Record<string, Test[]>);

  // Get existing test types from database + allow custom
  const existingTestTypes = Object.keys(testsByType).sort();

  // Check if a test already exists in target test type
  const testExistsInTarget = (sourceTest: Test): boolean => {
    if (!targetTestType) return false;
    return tests.some(
      (t) =>
        t.test_type.toUpperCase() === targetTestType.toUpperCase() &&
        t.section === sourceTest.section &&
        t.exercise_type === sourceTest.exercise_type &&
        t.test_number === sourceTest.test_number
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading tests...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Clone Tests">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mb-4 text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
              <FontAwesomeIcon icon={faCopy} className="text-emerald-500" />
              Clone Tests
            </h1>
            <p className="text-gray-600 mt-2">
              Clone tests across different test types. Questions will be shared automatically.
            </p>
          </div>

          {/* Status Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-1">Success!</h3>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Select Target Test Type */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-brand-dark mb-4">
              1. Select Target Test Type (where to clone)
            </h2>
            <input
              type="text"
              list="test-types-select"
              value={targetTestType}
              onChange={(e) => setTargetTestType(e.target.value.toUpperCase())}
              placeholder="TOLC, SAT, GMAT, LUISS, CATTOLICA, or type new..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none uppercase text-lg font-semibold"
            />
            <datalist id="test-types-select">
              {existingTestTypes.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
            <p className="text-sm text-gray-600 mt-2">
              💡 Select existing or type a new test type
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Select Source Test */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-dark mb-4">2. Select Source Test</h2>

              {!targetTestType ? (
                <div className="text-center py-12 text-gray-400">
                  <p>👆 Select target test type first</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {Object.entries(testsByType).map(([testType, testsInType]) => (
                    <div key={testType}>
                      <h3 className="font-bold text-sm text-gray-500 uppercase mb-2 sticky top-0 bg-white py-2">
                        {testType} ({testsInType.length})
                      </h3>
                      <div className="space-y-2">
                        {testsInType.map((test) => {
                          const alreadyExists = testExistsInTarget(test);
                          const isSelected = selectedTests.some((t) => t.id === test.id);
                          return (
                            <button
                              key={test.id}
                              onClick={() => !alreadyExists && toggleTestSelection(test)}
                              disabled={alreadyExists}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all relative ${
                                alreadyExists
                                  ? 'border-green-200 bg-green-50 opacity-60 cursor-not-allowed'
                                  : isSelected
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                              }`}
                            >
                              {/* Checkbox */}
                              {!alreadyExists && (
                                <div className="absolute top-2 left-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                  />
                                </div>
                              )}

                              {alreadyExists && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                  Exists in {targetTestType}
                                </div>
                              )}
                              <div className={`font-semibold text-brand-dark ${!alreadyExists ? 'ml-7' : ''}`}>
                                {test.section}
                              </div>
                              <div className={`text-sm text-gray-600 ${!alreadyExists ? 'ml-7' : ''}`}>
                                {test.exercise_type} {test.test_number}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Configure Clone */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-dark mb-4">
                3. Review & Clone {selectedTests.length > 0 && `(${selectedTests.length} selected)`}
              </h2>

              {!targetTestType ? (
                <div className="text-center py-12 text-gray-400">
                  <p>👆 Select target test type first</p>
                </div>
              ) : selectedTests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FontAwesomeIcon icon={faCopy} className="text-6xl mb-4 opacity-20" />
                  <p>Select tests to clone</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selected Tests */}
                  <div className="p-4 bg-gray-50 rounded-lg max-h-[300px] overflow-y-auto">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                      Selected Tests ({selectedTests.length})
                    </h3>
                    <div className="space-y-1">
                      {selectedTests.map((test) => (
                        <div key={test.id} className="text-sm">
                          <span className="font-semibold">{test.test_type}</span> - {test.section} - {test.exercise_type} {test.test_number}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                    <h3 className="text-sm font-bold text-emerald-900 uppercase mb-2">
                      Will Create in {targetTestType}
                    </h3>
                    <div className="text-emerald-700">
                      {selectedTests.length} test{selectedTests.length > 1 ? 's' : ''} will be cloned
                    </div>
                  </div>

                  {/* Clone Button */}
                  <button
                    onClick={handleCloneTests}
                    disabled={cloning}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {cloning ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        Cloning Tests...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCopy} />
                        Clone {selectedTests.length} Test{selectedTests.length > 1 ? 's' : ''}
                      </>
                    )}
                  </button>

                  {/* Info */}
                  <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">How it works:</h4>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Creates new tests in {targetTestType}</li>
                      <li>All questions stay in the source tests</li>
                      <li>Questions get the new test IDs in additional_test_ids</li>
                      <li>Edit a question once → updates in both tests</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">
              Cloning Tests to {targetTestType}
            </h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {Math.min(currentCloneIndex + (cloning ? 1 : 0), selectedTests.length)} of {selectedTests.length}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-all duration-300"
                  style={{
                    width: `${((currentCloneIndex + (cloning && currentCloneIndex < selectedTests.length ? 1 : 0)) / selectedTests.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Current Test */}
            {cloning && currentCloneIndex < selectedTests.length && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center gap-3">
                <FontAwesomeIcon icon={faSpinner} className="text-blue-600 animate-spin text-xl" />
                <div>
                  <div className="font-bold text-blue-900">
                    Cloning {currentCloneIndex + 1} of {selectedTests.length}
                  </div>
                  <div className="text-sm text-blue-700">
                    {selectedTests[currentCloneIndex].section} - {selectedTests[currentCloneIndex].exercise_type} {selectedTests[currentCloneIndex].test_number}
                  </div>
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto mb-6">
              {cloneResults.map((result, index) => (
                <div
                  key={result.test.id}
                  className={`p-3 rounded-lg border-2 flex items-start gap-3 ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={result.success ? faCheckCircle : faExclamationTriangle}
                    className={`text-lg mt-0.5 ${result.success ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {result.test.section} - {result.test.exercise_type} {result.test.test_number}
                    </div>
                    <div className={`text-xs ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            {!cloning && (
              <button
                onClick={() => {
                  setShowProgressModal(false);
                  setCloneResults([]);
                }}
                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
