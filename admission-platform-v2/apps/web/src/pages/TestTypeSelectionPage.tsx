/**
 * Test Type Selection Page
 * Shows all available test types and allows tutor to select one to configure
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCog,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

interface TestTypeInfo {
  name: string;
  isPDF: boolean;
  isAdaptive: boolean;
}

export default function TestTypeSelectionPage() {
  const navigate = useNavigate();
  const [availableTestTypes, setAvailableTestTypes] = useState<TestTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestTypes();
  }, []);

  async function loadTestTypes() {
    try {
      // Get unique test types from 2V_tests table
      const { data: testsData, error: testsError } = await supabase
        .from('2V_tests')
        .select('test_type');

      if (testsError) throw testsError;

      const testTypeNames = new Set<string>();
      testsData?.forEach(test => {
        if (test.test_type) {
          testTypeNames.add(test.test_type);
        }
      });

      // For each test type, check if it has PDF questions and/or adaptive configs
      const testTypesWithInfo = await Promise.all(
        Array.from(testTypeNames).map(async (testType) => {
          // Check if test has PDF questions
          const { data: pdfQuestions } = await supabase
            .from('2V_questions')
            .select('id')
            .eq('test_type', testType)
            .eq('question_type', 'pdf')
            .limit(1);

          // Check if test has adaptive track configs
          const { data: adaptiveConfigs } = await supabase
            .from('2V_test_track_config')
            .select('id')
            .eq('test_type', testType)
            .eq('adaptivity_mode', 'adaptive')
            .limit(1);

          return {
            name: testType,
            isPDF: (pdfQuestions?.length || 0) > 0,
            isAdaptive: (adaptiveConfigs?.length || 0) > 0,
          };
        })
      );

      setAvailableTestTypes(testTypesWithInfo.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error loading test types:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading test types...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Select Test Type" pageSubtitle="Choose a test to configure">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor/test-management')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Test Management</span>
          </button>

          {/* Page Header */}
          <div className="mb-8 text-center animate-fadeInUp">
            <h1 className="text-3xl font-bold text-brand-dark mb-2">Configure Test Tracks</h1>
            <p className="text-gray-600">Select a test type to configure its tracks and settings</p>
          </div>

          {/* Test Types Grid */}
          {availableTestTypes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-fadeInUp">
              <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-brand-dark mb-3">No Test Types Available</h3>
              <p className="text-gray-600">
                No test types have been created yet. Please create some tests first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTestTypes.map((testType, index) => {
                // Only 2 types: PDF or Adaptive/Interactive
                const isPDF = testType.isPDF;
                const isAdaptive = testType.isAdaptive;

                // PDF tests get indigo/purple styling
                // Adaptive tests get emerald/teal styling
                const cardClasses = isPDF
                  ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300'
                  : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300';

                const iconBgClasses = isPDF
                  ? 'from-indigo-500 to-purple-600'
                  : 'from-emerald-500 to-teal-600';

                const hoverBorderColor = isPDF
                  ? 'hover:border-indigo-500'
                  : 'hover:border-emerald-500';

                const badgeBg = isPDF ? 'bg-indigo-600' : 'bg-emerald-600';
                const badgeText = isPDF ? '📄 PDF' : '🎯 Adaptive';
                const arrowColor = isPDF ? 'text-indigo-600' : 'text-emerald-600';

                return (
                  <button
                    key={testType.name}
                    onClick={() => navigate(testType.name === 'GMAT' ? '/tutor/gmat-config' : `/tutor/test-track-config/${testType.name}`)}
                    className={`group relative rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 ${cardClasses} ${hoverBorderColor} transform hover:scale-105 animate-fadeInUp`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`text-xs font-bold px-3 py-1 ${badgeBg} text-white rounded-full shadow-md`}>
                        {badgeText}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${iconBgClasses} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <FontAwesomeIcon icon={faCog} className="text-4xl text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-brand-dark mb-3">
                      {testType.name}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-700 mb-4 text-sm font-semibold">
                      {isPDF ? 'PDF-based questions' : 'Interactive adaptive questions'}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {isPDF
                        ? 'Questions are displayed from PDF documents with section-based difficulty'
                        : 'Dynamic difficulty adjustment based on student performance'}
                    </p>

                    {/* Arrow Indicator */}
                    <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity ${arrowColor}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
