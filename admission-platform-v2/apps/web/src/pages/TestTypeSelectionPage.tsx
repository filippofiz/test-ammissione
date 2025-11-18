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

export default function TestTypeSelectionPage() {
  const navigate = useNavigate();
  const [availableTestTypes, setAvailableTestTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestTypes();
  }, []);

  async function loadTestTypes() {
    try {
      // Get unique test types from 2V_tests table
      const { data, error } = await supabase
        .from('2V_tests')
        .select('test_type');

      if (error) throw error;

      const testTypes = new Set<string>();
      data?.forEach(test => {
        if (test.test_type) {
          testTypes.add(test.test_type);
        }
      });
      setAvailableTestTypes(Array.from(testTypes).sort());
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
              {availableTestTypes.map((testType, index) => (
                <button
                  key={testType}
                  onClick={() => navigate(`/tutor/test-track-config/${testType}`)}
                  className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-green transform hover:scale-105 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <FontAwesomeIcon icon={faCog} className="text-4xl text-white" />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-brand-dark mb-3">
                    {testType}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">
                    Configure test tracks and settings for {testType}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="absolute bottom-4 right-4 text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
