/**
 * Algorithm Configuration Page
 * Configure algorithms for adaptive testing, scoring, and results calculation
 * Stores configuration in 2V_algorithm_config table
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  algorithm_type: string; // Primary identifier (e.g., "simple", "gmat_cat_3pl")
  display_name?: string; // Human-readable name
  description?: string; // Description of the algorithm

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

  // IRT-Based Scoring Scale Config
  section_score_min?: number;
  section_score_max?: number;
  total_score_min?: number;
  total_score_max?: number;
  score_increment?: number;

  // Results Algorithm Config
  percentile_calculation?: 'historical' | 'normative';
  pass_threshold?: number;
  grade_boundaries?: Record<string, number>;

  created_at?: string;
  updated_at?: string;
}

export default function AlgorithmConfigPage() {
  const navigate = useNavigate();

  // List of all algorithms
  const [algorithms, setAlgorithms] = useState<AlgorithmConfig[]>([]);
  const [selectedAlgorithmType, setSelectedAlgorithmType] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [config, setConfig] = useState<AlgorithmConfig>({
    algorithm_type: '',
    display_name: '',
    description: '',

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
    loadAlgorithms();
  }, []);

  useEffect(() => {
    if (selectedAlgorithmType) {
      const selected = algorithms.find(a => a.algorithm_type === selectedAlgorithmType);
      if (selected) {
        setConfig(selected);
        setIsCreatingNew(false);
      }
    }
  }, [selectedAlgorithmType, algorithms]);

  async function loadAlgorithms() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('2V_algorithm_config')
        .select('*')
        .order('algorithm_type');

      if (error) throw error;

      setAlgorithms(data || []);

      // Select first algorithm if available
      if (data && data.length > 0 && !selectedAlgorithmType) {
        setSelectedAlgorithmType(data[0].algorithm_type);
      }
    } catch (err) {
      console.error('Error loading algorithms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load algorithms');
    } finally {
      setLoading(false);
    }
  }

  function handleNewAlgorithm() {
    setIsCreatingNew(true);
    setSelectedAlgorithmType(null);
    setConfig({
      algorithm_type: '',
      display_name: '',
      description: '',
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

  async function handleDelete() {
    if (!selectedAlgorithmType) return;

    if (!confirm(`Are you sure you want to delete the algorithm "${selectedAlgorithmType}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('2V_algorithm_config')
        .delete()
        .eq('algorithm_type', selectedAlgorithmType);

      if (error) throw error;

      await loadAlgorithms();
      setSelectedAlgorithmType(null);
      setIsCreatingNew(false);
    } catch (err) {
      console.error('Error deleting algorithm:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete algorithm');
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      if (!config.algorithm_type || config.algorithm_type.trim() === '') {
        throw new Error('Algorithm type is required');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, ...configWithoutId } = config;

      const dataToSave = {
        ...configWithoutId,
        algorithm_type: config.algorithm_type.trim().toLowerCase().replace(/\s+/g, '_'),
      };

      const { error } = await supabase
        .from('2V_algorithm_config')
        .upsert(dataToSave, {
          onConflict: 'algorithm_type'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setSaveSuccess(true);
      await loadAlgorithms();
      setSelectedAlgorithmType(dataToSave.algorithm_type);
      setIsCreatingNew(false);
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
    <Layout pageTitle="Algorithm Library" pageSubtitle="Create and manage reusable algorithm configurations">
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

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl flex items-center gap-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-600" />
              <div>
                <div className="font-semibold text-green-800">Algorithm saved successfully!</div>
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

          <div className="flex gap-6">
            {/* Algorithm List Sidebar */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Algorithms</h3>
                  <button
                    onClick={handleNewAlgorithm}
                    className="px-3 py-1 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    + New
                  </button>
                </div>

                <div className="space-y-2">
                  {algorithms.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No algorithms yet</p>
                  ) : (
                    algorithms.map((algo) => (
                      <button
                        key={algo.algorithm_type}
                        onClick={() => setSelectedAlgorithmType(algo.algorithm_type)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedAlgorithmType === algo.algorithm_type
                            ? 'bg-brand-green text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-sm">{algo.display_name || algo.algorithm_type}</div>
                        <div className={`text-xs ${selectedAlgorithmType === algo.algorithm_type ? 'text-green-100' : 'text-gray-500'}`}>
                          {algo.irt_model ? `IRT ${algo.irt_model}` : 'Simple'}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Main Configuration Panel */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl p-8">
              {!selectedAlgorithmType && !isCreatingNew ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faBrain} className="text-5xl text-gray-300 mb-4" />
                  <p className="text-gray-500">Select an algorithm or create a new one</p>
                </div>
              ) : (
                <>
                  {/* Algorithm Identity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Algorithm Type (ID)
                      </label>
                      <input
                        type="text"
                        value={config.algorithm_type}
                        onChange={(e) => setConfig({ ...config, algorithm_type: e.target.value })}
                        placeholder="e.g., gmat_cat_3pl"
                        disabled={!isCreatingNew}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none font-medium disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, underscores)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={config.display_name || ''}
                        onChange={(e) => setConfig({ ...config, display_name: e.target.value })}
                        placeholder="e.g., GMAT CAT 3PL"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none font-medium"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={config.description || ''}
                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                        placeholder="Brief description of this algorithm"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:outline-none"
                      />
                    </div>
                  </div>

            {/* Adaptive Algorithm Configuration */}
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

            {/* Scoring Algorithm Configuration */}
              <div className="space-y-6 mt-8 pt-8 border-t border-gray-200">
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

                {/* Penalty Settings - for Raw Score and Weighted */}
                {(config.scoring_method === 'raw_score' || config.scoring_method === 'weighted') && (
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
                )}

                {/* IRT Scale Settings - for IRT-Based Score */}
                {config.scoring_method === 'irt_based' && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">IRT Score Scale Settings</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Section Score Min
                        </label>
                        <input
                          type="number"
                          value={config.section_score_min || 60}
                          onChange={(e) => setConfig({ ...config, section_score_min: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Minimum score per section (e.g., 60 for GMAT)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Section Score Max
                        </label>
                        <input
                          type="number"
                          value={config.section_score_max || 90}
                          onChange={(e) => setConfig({ ...config, section_score_max: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Maximum score per section (e.g., 90 for GMAT)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Total Score Min
                        </label>
                        <input
                          type="number"
                          value={config.total_score_min || 205}
                          onChange={(e) => setConfig({ ...config, total_score_min: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Minimum total score (e.g., 205 for GMAT)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Total Score Max
                        </label>
                        <input
                          type="number"
                          value={config.total_score_max || 805}
                          onChange={(e) => setConfig({ ...config, total_score_max: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Maximum total score (e.g., 805 for GMAT)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Score Increment
                        </label>
                        <input
                          type="number"
                          value={config.score_increment || 10}
                          onChange={(e) => setConfig({ ...config, score_increment: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                        />
                        <p className="text-xs text-gray-600 mt-1">Total score rounds to this increment (e.g., 10 for GMAT)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {/* Results Algorithm Configuration - Coming Soon */}
              <div className="space-y-6 mt-8 pt-8 border-t border-gray-200 opacity-50 pointer-events-none">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-500">Results Calculation</h3>
                    <p className="text-sm text-gray-400">Configure how results, percentiles, and grades are calculated</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">Coming Soon</span>
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

            {/* Save and Delete Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
              {!isCreatingNew && selectedAlgorithmType && (
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
                >
                  Delete Algorithm
                </button>
              )}
              <div className="flex-1" />
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
                    {isCreatingNew ? 'Create Algorithm' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
