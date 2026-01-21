import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startValidation,
  pauseValidation,
  resumeValidation,
  stopValidation,
  getValidationStatus,
  getLatestValidationJob,
  calculateFlagStatistics,
  getTestTypes,
  ValidationJob,
} from '../lib/api/aiValidation';
import { Layout } from '../components/Layout';

const FLAG_LABELS: Record<string, { label: string; severity: string }> = {
  ai_verified_correct: { label: 'AI Verified Correct', severity: 'success' },
  technical_malformed_json: { label: 'Malformed JSON', severity: 'critical' },
  technical_missing_image: { label: 'Missing Image', severity: 'critical' },
  technical_missing_fields: { label: 'Missing Fields', severity: 'critical' },
  technical_invalid_latex: { label: 'Invalid LaTeX', severity: 'high' },
  incorrect_answer: { label: 'Incorrect Answer', severity: 'high' },
  no_correct_answer: { label: 'No Correct Answer', severity: 'high' },
  multiple_correct_answers: { label: 'Multiple Correct', severity: 'medium' },
  unclear_question: { label: 'Unclear Question', severity: 'medium' },
  missing_information: { label: 'Missing Information', severity: 'medium' },
  typo_detected: { label: 'Typo Detected', severity: 'low' },
  formatting_issue: { label: 'Formatting Issue', severity: 'low' },
  translation_mismatch: { label: 'Translation Mismatch', severity: 'medium' },
  options_not_distinct: { label: 'Options Not Distinct', severity: 'medium' },
};

export default function AIValidationDashboard() {
  const navigate = useNavigate();
  const [currentJob, setCurrentJob] = useState<ValidationJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testType, setTestType] = useState<string>('');
  const [limit, setLimit] = useState<string>('');
  const [flagStats, setFlagStats] = useState<Record<string, number>>({});
  const [testTypes, setTestTypes] = useState<string[]>([]);
  const [loadingTestTypes, setLoadingTestTypes] = useState(true);

  // Load test types on mount
  useEffect(() => {
    loadTestTypes();
  }, []);

  // Poll for job status
  useEffect(() => {
    loadLatestJob();
    const interval = setInterval(() => {
      if (currentJob?.id && currentJob.status === 'running') {
        refreshJobStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentJob?.id, currentJob?.status]);

  const loadTestTypes = async () => {
    setLoadingTestTypes(true);
    const types = await getTestTypes();
    setTestTypes(types);
    setLoadingTestTypes(false);
  };

  const loadLatestJob = async () => {
    const job = await getLatestValidationJob();
    if (job) {
      setCurrentJob(job);
      if (job.flag_statistics) {
        setFlagStats(job.flag_statistics);
      }
    }
  };

  const refreshJobStatus = async () => {
    if (!currentJob?.id) return;

    const response = await getValidationStatus(currentJob.id);
    if (response.success && response.job) {
      setCurrentJob(response.job);
      if (response.job.flag_statistics) {
        setFlagStats(response.job.flag_statistics);
      }
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (testType) params.test_type = testType;
      if (limit) params.limit = parseInt(limit);

      console.log('Starting validation with params:', params);
      const response = await startValidation(params);
      console.log('Start validation response:', response);

      if (response.success && response.job_id) {
        console.log('Job created:', response.job_id);
        // Wait a moment then fetch the job
        setTimeout(() => {
          loadLatestJob();
        }, 1000);
      } else {
        console.error('Validation start failed:', response.error);
        alert(`Failed to start validation: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error starting validation:', error);
      alert(`Error starting validation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    if (!currentJob?.id) return;
    setIsLoading(true);
    await pauseValidation(currentJob.id);
    await refreshJobStatus();
    setIsLoading(false);
  };

  const handleResume = async () => {
    if (!currentJob?.id) return;
    setIsLoading(true);
    await resumeValidation(currentJob.id);
    await refreshJobStatus();
    setIsLoading(false);
  };

  const handleStop = async () => {
    if (!currentJob?.id) return;
    if (!confirm('Are you sure you want to stop this validation job?')) return;
    setIsLoading(true);
    await stopValidation(currentJob.id);
    await refreshJobStatus();
    setIsLoading(false);
  };

  const getProgressPercentage = () => {
    if (!currentJob) return 0;
    return Math.round((currentJob.processed_count / currentJob.total_questions) * 100);
  };

  const getEstimatedTimeRemaining = () => {
    if (!currentJob || currentJob.status !== 'running') return null;

    const elapsed = Date.now() - new Date(currentJob.started_at).getTime();
    const questionsProcessed = currentJob.processed_count;
    const questionsRemaining = currentJob.total_questions - questionsProcessed;

    if (questionsProcessed === 0) return null;

    const avgTimePerQuestion = elapsed / questionsProcessed;
    const estimatedMs = avgTimePerQuestion * questionsRemaining;

    const minutes = Math.floor(estimatedMs / 60000);
    const seconds = Math.floor((estimatedMs % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const getCurrentSpeed = () => {
    if (!currentJob || currentJob.status !== 'running') return 0;

    const elapsed = (Date.now() - new Date(currentJob.started_at).getTime()) / 1000 / 60; // minutes
    const questionsProcessed = currentJob.processed_count;

    if (elapsed === 0) return 0;

    return Math.round(questionsProcessed / elapsed);
  };

  const canStart = !currentJob || ['completed', 'stopped', 'failed'].includes(currentJob.status);
  const canPause = currentJob?.status === 'running';
  const canResume = currentJob?.status === 'paused';
  const canStop = currentJob && ['running', 'paused'].includes(currentJob.status);

  return (
    <Layout pageTitle="AI Validation Dashboard">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">AI Validation Dashboard</h1>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin
          </button>
        </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Control Panel</h2>

        {canStart && (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Type (optional)
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={loadingTestTypes}
                >
                  <option value="">
                    {loadingTestTypes ? 'Loading test types...' : 'All Types'}
                  </option>
                  {testTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limit (optional)
                </label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="No limit"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {canStart && (
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
              Start Validation
            </button>
          )}
          {canPause && (
            <button
              onClick={handlePause}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
              Pause
            </button>
          )}
          {canResume && (
            <button
              onClick={handleResume}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
              Resume
            </button>
          )}
          {canStop && (
            <button
              onClick={handleStop}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
              Stop
            </button>
          )}
        </div>

        {currentJob && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentJob.status === 'running'
                  ? 'bg-green-100 text-green-800'
                  : currentJob.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : currentJob.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {currentJob.status === 'running' && '● '}
              {currentJob.status.charAt(0).toUpperCase() + currentJob.status.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Progress Section */}
      {currentJob && (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Progress</h2>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {currentJob.processed_count} / {currentJob.total_questions} questions
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {currentJob.status === 'running' && (
                <>
                  <div>
                    <span className="text-gray-600">Current Speed:</span>
                    <span className="ml-2 font-medium">{getCurrentSpeed()} q/min</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Est. Time Remaining:</span>
                    <span className="ml-2 font-medium">
                      {getEstimatedTimeRemaining() || 'Calculating...'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Total Questions</div>
              <div className="text-3xl font-bold">{currentJob.total_questions}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Processed</div>
              <div className="text-3xl font-bold">{currentJob.processed_count}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <div className="text-sm text-green-600 mb-1">Verified OK</div>
              <div className="text-3xl font-bold text-green-700">
                {currentJob.passed_count}
              </div>
              <div className="text-xs text-green-600">
                {currentJob.total_questions > 0
                  ? Math.round((currentJob.passed_count / currentJob.total_questions) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <div className="text-sm text-yellow-600 mb-1">Flagged</div>
              <div className="text-3xl font-bold text-yellow-700">
                {currentJob.flagged_count}
              </div>
              <div className="text-xs text-yellow-600">
                {currentJob.total_questions > 0
                  ? Math.round((currentJob.flagged_count / currentJob.total_questions) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>

          {/* Flag Breakdown */}
          {Object.keys(flagStats).length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Issues Found</h2>
              <div className="space-y-2">
                {Object.entries(flagStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([flag, count]) => {
                    const info = FLAG_LABELS[flag] || {
                      label: flag,
                      severity: 'medium',
                    };
                    const severityColor =
                      info.severity === 'success'
                        ? 'text-green-600'
                        : info.severity === 'critical'
                        ? 'text-red-600'
                        : info.severity === 'high'
                        ? 'text-orange-600'
                        : info.severity === 'medium'
                        ? 'text-yellow-600'
                        : 'text-blue-600';

                    return (
                      <div
                        key={flag}
                        className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        <span className={`font-medium text-sm ${severityColor} break-words pr-4`}>
                          {info.label}
                        </span>
                        <span className="font-bold text-lg min-w-[40px] text-right">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Live Edge Function Logs */}
          {currentJob.logs && currentJob.logs.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Edge Function Logs
              </h2>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
                {currentJob.logs.slice(-50).map((log: string, idx: number) => (
                  <div key={idx} className="text-green-400 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validated Questions Detail */}
          {currentJob.validated_questions && currentJob.validated_questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Analyzed Questions ({currentJob.validated_questions.length})
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {currentJob.validated_questions.map((item: any, idx: number) => {
                  const validation = item.validation;
                  const hasFlags = validation?.flags && validation.flags.length > 0;
                  const isVerified = validation?.flags?.includes('ai_verified_correct');

                  let questionData: any = {};
                  let answersData: any = {};

                  try {
                    questionData = typeof item.question_data === 'string'
                      ? JSON.parse(item.question_data)
                      : item.question_data || {};
                    answersData = typeof item.answers === 'string'
                      ? JSON.parse(item.answers)
                      : item.answers || {};
                  } catch (e) {
                    console.error('Failed to parse question data:', e);
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        isVerified
                          ? 'bg-green-50 border-green-500'
                          : hasFlags
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-300">
                        <div>
                          <div className="font-mono text-xs text-gray-500 mb-1">
                            ID: {item.question_id}
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="font-semibold text-sm">
                              Q{item.question_number} - {item.test_type}
                            </span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {item.section}
                            </span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {item.question_type}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-3">
                        <div className="font-medium text-sm text-gray-700 mb-1">Question (Italian):</div>
                        <div className="text-sm bg-white p-3 rounded border whitespace-pre-wrap">
                          {questionData.question_text || 'N/A'}
                        </div>
                      </div>

                      {questionData.question_text_eng && (
                        <div className="mb-3">
                          <div className="font-medium text-sm text-gray-700 mb-1">Question (English):</div>
                          <div className="text-sm bg-white p-3 rounded border whitespace-pre-wrap">
                            {questionData.question_text_eng}
                          </div>
                        </div>
                      )}

                      {/* Passage Text if available */}
                      {questionData.passage_text && (
                        <div className="mb-3">
                          <div className="font-medium text-sm text-gray-700 mb-1">Passage (Italian):</div>
                          <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {questionData.passage_text}
                          </div>
                        </div>
                      )}

                      {questionData.passage_text_eng && (
                        <div className="mb-3">
                          <div className="font-medium text-sm text-gray-700 mb-1">Passage (English):</div>
                          <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {questionData.passage_text_eng}
                          </div>
                        </div>
                      )}

                      {/* Options */}
                      {questionData.options && (
                        <div className="mb-3">
                          <div className="font-medium text-sm text-gray-700 mb-1">Options:</div>
                          <div className="grid grid-cols-1 gap-1">
                            {Object.entries(questionData.options).map(([key, value]: [string, any]) => {
                              const isCorrect = answersData.correct_answer === key;
                              const isWrong = answersData.wrong_answers?.includes(key);

                              return (
                                <div
                                  key={key}
                                  className={`text-sm p-2 rounded border ${
                                    isCorrect
                                      ? 'bg-green-100 border-green-400 font-medium'
                                      : isWrong
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-white border-gray-200'
                                  }`}
                                >
                                  <span className="font-semibold">{key.toUpperCase()})</span> {value}
                                  {isCorrect && <span className="ml-2 text-green-700">✓ CORRECT</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* AI Validation Results */}
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="font-medium text-sm text-gray-700 mb-2">AI Validation:</div>

                        {hasFlags && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {validation.flags.map((flag: string, flagIdx: number) => {
                              const flagInfo = FLAG_LABELS[flag] || { label: flag, severity: 'medium' };
                              const severityColor =
                                flagInfo.severity === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : flagInfo.severity === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : flagInfo.severity === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : flagInfo.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800';

                              return (
                                <span
                                  key={flagIdx}
                                  className={`text-xs px-2 py-1 rounded font-medium ${severityColor}`}
                                >
                                  {flagInfo.label}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* AI Solution */}
                        {validation?.ai_solution && (
                          <div className="mb-2 p-2 bg-white rounded border">
                            <div className="font-medium text-xs text-gray-600 mb-1">AI's Answer:</div>
                            <div className="text-sm">
                              <span className="font-semibold">
                                {validation.ai_solution.answer?.toUpperCase()}
                              </span>
                              {validation.ai_solution.answer === answersData.correct_answer ? (
                                <span className="ml-2 text-green-600 font-medium">✓ Matches stored answer</span>
                              ) : (
                                <span className="ml-2 text-red-600 font-medium">
                                  ✗ Differs from stored ({answersData.correct_answer?.toUpperCase()})
                                </span>
                              )}
                            </div>
                            {validation.ai_solution.reasoning && (
                              <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                <div className="font-semibold text-gray-700 mb-1">AI Reasoning:</div>
                                {validation.ai_solution.reasoning}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Comments */}
                        {validation?.comments && validation.comments.length > 0 && (
                          <div className="mt-2">
                            <div className="font-medium text-sm text-gray-700 mb-2">Issues Found:</div>
                            <div className="space-y-2">
                              {validation.comments.map((comment: any, commentIdx: number) => (
                                <div key={commentIdx} className="text-sm bg-white p-3 rounded border border-gray-300 whitespace-pre-wrap">
                                  <div className="font-semibold text-gray-800 mb-1">
                                    {FLAG_LABELS[comment.flag]?.label || comment.flag}
                                  </div>
                                  <div className="text-gray-700">{comment.message}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {validation?.suggested_fixes && validation.suggested_fixes.length > 0 && (
                          <div className="mt-2 text-sm">
                            <div className="font-medium text-xs text-gray-600 mb-1">Suggested Fixes:</div>
                            <ul className="list-disc list-inside text-xs text-gray-600">
                              {validation.suggested_fixes.map((fix: string, fixIdx: number) => (
                                <li key={fixIdx}>{fix}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Log */}
          {currentJob.failed_count > 0 && currentJob.error_log && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">
                Failed Questions ({currentJob.failed_count})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentJob.error_log.slice(-10).map((error: any, idx: number) => (
                  <div key={idx} className="bg-red-50 p-3 rounded text-sm">
                    <div className="font-medium">Question ID: {error.question_id}</div>
                    <div className="text-red-600">{error.error}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!currentJob && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No validation job found. Start a new validation to begin.</p>
        </div>
      )}
      </div>
    </Layout>
  );
}
