/**
 * Algorithm Configuration Page
 * Configure algorithms for adaptive testing, scoring, and results calculation
 * Stores configuration in 2V_algorithm_config table
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
  faBrain,
  faCalculator,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';

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

export default function AlgorithmConfigPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTestType = searchParams.get('testType');

  const [selectedTestType, setSelectedTestType] = useState<string>(preselectedTestType || 'GMAT');
  const [selectedTrackType, setSelectedTrackType] = useState<string>('Assessment Iniziale');
  const [selectedCategory, setSelectedCategory] = useState<'adaptive' | 'scoring' | 'results'>('adaptive');

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
          algorithm_type: selectedCategory === 'adaptive' ? 'simple' : selectedCategory === 'scoring' ? 'raw_score' : 'historical',
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

      const { error } = await supabase
        .from('2V_algorithm_config')
        .upsert(dataToSave, {
          onConflict: 'test_type,track_type,algorithm_category'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setSaveSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout pageTitle="Algorithm Configuration" pageSubtitle="Configure Adaptive, Scoring & Results Algorithms">
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
    <Layout pageTitle="Algorithm Configuration" pageSubtitle="Configure Adaptive, Scoring & Results Algorithms">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor/test-management')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Test Management</span>
          </button>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl flex items-center gap-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-600" />
              <div>
                <div className="font-semibold text-green-800">Configuration saved successfully!</div>
                <div className="text-sm text-green-700">Algorithm settings have been updated.</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-center gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-red-600" />
              <div>
                <div className="font-semibold text-red-800">Error</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Test Type and Track Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test Type
                </label>
                <select
                  value={selectedTestType}
                  onChange={(e) => setSelectedTestType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none font-medium"
                >
                  {TEST_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Track Type
                </label>
                <select
                  value={selectedTrackType}
                  onChange={(e) => setSelectedTrackType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none font-medium"
                >
                  {TRACK_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Algorithm Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as 'adaptive' | 'scoring' | 'results')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none font-medium"
                >
                  <option value="adaptive">Adaptive Testing</option>
                  <option value="scoring">Scoring</option>
                  <option value="results">Results Calculation</option>
                </select>
              </div>
            </div>

            {/* Adaptive Algorithm Configuration */}
            {selectedCategory === 'adaptive' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faBrain} className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">Adaptive Testing Algorithm</h3>
                    <p className="text-sm text-gray-600">Configure how test difficulty adapts to student performance</p>
                  </div>
                </div>

                {/* Algorithm Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Algorithm Type
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                      <input
                        type="radio"
                        name="algorithm_type"
                        value="simple"
                        checked={config.algorithm_type === 'simple'}
                        onChange={() => setConfig({ ...config, algorithm_type: 'simple' })}
                        className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Simple Algorithm</div>
                        <div className="text-sm text-gray-600">Correct answer → increase difficulty, Wrong answer → decrease difficulty</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                      <input
                        type="radio"
                        name="algorithm_type"
                        value="complex"
                        checked={config.algorithm_type === 'complex'}
                        onChange={() => setConfig({ ...config, algorithm_type: 'complex' })}
                        className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Complex Algorithm (GMAT-style CAT)</div>
                        <div className="text-sm text-gray-600">Uses Item Response Theory (IRT) for optimal question selection</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Simple Algorithm Configuration */}
                {config.algorithm_type === 'simple' && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">Simple Algorithm Settings</h4>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Difficulty Increment
                      </label>
                      <input
                        type="number"
                        value={config.simple_difficulty_increment || 1}
                        onChange={(e) => setConfig({ ...config, simple_difficulty_increment: parseInt(e.target.value) || 1 })}
                        min="1"
                        max="5"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                      />
                      <p className="text-xs text-gray-600 mt-1">How many difficulty levels to jump (1-5)</p>
                    </div>
                  </div>
                )}

                {/* Complex Algorithm Configuration */}
                {config.algorithm_type === 'complex' && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">Complex Algorithm Settings (IRT-based)</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          IRT Model
                        </label>
                        <select
                          value={config.irt_model || '2PL'}
                          onChange={(e) => setConfig({ ...config, irt_model: e.target.value as '1PL' | '2PL' | '3PL' })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        >
                          <option value="1PL">1PL (Rasch Model)</option>
                          <option value="2PL">2PL (2-Parameter Logistic)</option>
                          <option value="3PL">3PL (3-Parameter Logistic)</option>
                        </select>
                        <p className="text-xs text-gray-600 mt-1">Item Response Theory model</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Initial Theta (θ)
                        </label>
                        <input
                          type="number"
                          value={config.initial_theta || 0.0}
                          onChange={(e) => setConfig({ ...config, initial_theta: parseFloat(e.target.value) })}
                          step="0.1"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Starting ability estimate (typically 0.0)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Theta Min
                        </label>
                        <input
                          type="number"
                          value={config.theta_min || -3.0}
                          onChange={(e) => setConfig({ ...config, theta_min: parseFloat(e.target.value) })}
                          step="0.1"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Minimum ability level</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Theta Max
                        </label>
                        <input
                          type="number"
                          value={config.theta_max || 3.0}
                          onChange={(e) => setConfig({ ...config, theta_max: parseFloat(e.target.value) })}
                          step="0.1"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Maximum ability level</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          SE Threshold
                        </label>
                        <input
                          type="number"
                          value={config.se_threshold || 0.3}
                          onChange={(e) => setConfig({ ...config, se_threshold: parseFloat(e.target.value) })}
                          step="0.01"
                          min="0"
                          max="1"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Standard error threshold for stopping rule</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Max Information Weight
                        </label>
                        <input
                          type="number"
                          value={config.max_information_weight || 1.0}
                          onChange={(e) => setConfig({ ...config, max_information_weight: parseFloat(e.target.value) })}
                          step="0.1"
                          min="0"
                          max="1"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Weight for maximum information criterion</p>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={config.exposure_control || false}
                          onChange={(e) => setConfig({ ...config, exposure_control: e.target.checked })}
                          className="w-5 h-5 text-brand-green rounded focus:ring-brand-green"
                        />
                        <span className="font-semibold text-gray-900">Enable Exposure Control</span>
                      </label>
                      <p className="text-xs text-gray-600 mt-1 pl-8">Prevent same questions from appearing too frequently across different test sessions</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scoring Algorithm Configuration */}
            {selectedCategory === 'scoring' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalculator} className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">Scoring Algorithm</h3>
                    <p className="text-sm text-gray-600">Configure how test scores are calculated</p>
                  </div>
                </div>

                {/* Scoring Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Scoring Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                      <input
                        type="radio"
                        name="scoring_method"
                        value="raw_score"
                        checked={config.scoring_method === 'raw_score'}
                        onChange={() => setConfig({ ...config, scoring_method: 'raw_score' })}
                        className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Raw Score</div>
                        <div className="text-sm text-gray-600">Simple count of correct answers</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                      <input
                        type="radio"
                        name="scoring_method"
                        value="weighted"
                        checked={config.scoring_method === 'weighted'}
                        onChange={() => setConfig({ ...config, scoring_method: 'weighted' })}
                        className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Weighted Score</div>
                        <div className="text-sm text-gray-600">Different weights for sections/difficulty levels</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                      <input
                        type="radio"
                        name="scoring_method"
                        value="irt_based"
                        checked={config.scoring_method === 'irt_based'}
                        onChange={() => setConfig({ ...config, scoring_method: 'irt_based' })}
                        className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">IRT-Based Score</div>
                        <div className="text-sm text-gray-600">Score based on ability estimate (θ) from IRT model</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Penalty Settings */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">Penalty Settings</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Penalty for Wrong Answer
                      </label>
                      <input
                        type="number"
                        value={config.penalty_for_wrong || 0}
                        onChange={(e) => setConfig({ ...config, penalty_for_wrong: parseFloat(e.target.value) })}
                        step="0.25"
                        min="0"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                      />
                      <p className="text-xs text-gray-600 mt-1">Points deducted for incorrect answers (0 = no penalty)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Penalty for Blank Answer
                      </label>
                      <input
                        type="number"
                        value={config.penalty_for_blank || 0}
                        onChange={(e) => setConfig({ ...config, penalty_for_blank: parseFloat(e.target.value) })}
                        step="0.25"
                        min="0"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                      />
                      <p className="text-xs text-gray-600 mt-1">Points deducted for unanswered questions (0 = no penalty)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Algorithm Configuration */}
            {selectedCategory === 'results' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">Results Calculation</h3>
                    <p className="text-sm text-gray-600">Configure how results, percentiles, and grades are calculated</p>
                  </div>
                </div>

                {/* Percentile Calculation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Percentile Calculation Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                      <input
                        type="radio"
                        name="percentile_calculation"
                        value="historical"
                        checked={config.percentile_calculation === 'historical'}
                        onChange={() => setConfig({ ...config, percentile_calculation: 'historical' })}
                        className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Historical</div>
                        <div className="text-sm text-gray-600">Based on past student performance data</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-brand-green transition-colors">
                      <input
                        type="radio"
                        name="percentile_calculation"
                        value="normative"
                        checked={config.percentile_calculation === 'normative'}
                        onChange={() => setConfig({ ...config, percentile_calculation: 'normative' })}
                        className="mt-1 w-5 h-5 text-brand-green focus:ring-brand-green"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Normative</div>
                        <div className="text-sm text-gray-600">Based on predefined norm group statistics</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Pass/Fail Threshold */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">Pass/Fail Settings</h4>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pass Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={config.pass_threshold || 60}
                      onChange={(e) => setConfig({ ...config, pass_threshold: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                    />
                    <p className="text-xs text-gray-600 mt-1">Minimum percentage required to pass (0-100)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
