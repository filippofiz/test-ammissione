/**
 * Student Profile Management Page (Tutor View)
 * Allows tutors to:
 * - Set real test date with countdown timer
 * - Track average school grades
 * - Record past test attempts and results
 * - Add notes about the student
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCalendarAlt,
  faHistory,
  faSave,
  faArrowLeft,
  faPlus,
  faTrash,
  faStickyNote,
  faGraduationCap,
  faSpinner,
  faRocket,
  faArrowUp,
  faArrowDown,
  faQuestionCircle,
  faRedo,
  faUniversalAccess,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { CountdownTimer } from '../components/CountdownTimer';
import { supabase } from '../lib/supabase';
import {
  getStudentGMATProgress,
  initializeGMATPreparation,
  updateStudentGMATCycle,
  clearSeenQuestions,
  getSeenQuestionsCount,
  type GmatCycle,
  type GmatProgress,
  GMAT_CYCLES,
} from '../lib/api/gmat';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  real_test_date: string | null;
  average_school_grade: number | null;
  past_test_results: PastTestResult[];
  student_notes: string | null;
  esigenze_speciali: boolean;
}

interface PastTestResult {
  id: string;
  date: string;
  test_type: string;
  score: number | string;
  notes?: string;
}

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Form fields
  const [realTestDate, setRealTestDate] = useState<string>('');
  const [averageGrade, setAverageGrade] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [pastResults, setPastResults] = useState<PastTestResult[]>([]);
  const [esigenzeSpeciali, setEsigenzeSpeciali] = useState<boolean>(false);

  // New past result form
  const [showAddResult, setShowAddResult] = useState(false);
  const [newResult, setNewResult] = useState({
    date: '',
    test_type: '',
    score: '',
    notes: '',
  });

  // GMAT Cycle Management
  const [gmatProgress, setGmatProgress] = useState<GmatProgress | null>(null);
  const [gmatLoading, setGmatLoading] = useState(false);
  const [gmatSeenCount, setGmatSeenCount] = useState(0);
  const [showCycleConfirm, setShowCycleConfirm] = useState<GmatCycle | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentProfile();
      loadGmatProgress();
    }
  }, [studentId]);

  async function loadGmatProgress() {
    if (!studentId) return;

    setGmatLoading(true);
    try {
      const progress = await getStudentGMATProgress(studentId);
      setGmatProgress(progress);
      if (progress) {
        const count = await getSeenQuestionsCount(studentId);
        setGmatSeenCount(count);
      }
    } catch (err) {
      console.error('Error loading GMAT progress:', err);
    } finally {
      setGmatLoading(false);
    }
  }

  async function handleInitializeGMAT(cycle: GmatCycle) {
    if (!studentId) return;

    setGmatLoading(true);
    try {
      const progress = await initializeGMATPreparation(studentId, cycle);
      setGmatProgress(progress);
      setGmatSeenCount(0);
      setSuccessMessage(`GMAT preparation initialized with ${cycle} cycle!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error initializing GMAT:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize GMAT preparation');
    } finally {
      setGmatLoading(false);
    }
  }

  async function handleUpdateCycle(newCycle: GmatCycle) {
    if (!studentId) return;

    setGmatLoading(true);
    setShowCycleConfirm(null);
    try {
      await updateStudentGMATCycle(studentId, newCycle);
      setGmatProgress(prev => prev ? { ...prev, gmat_cycle: newCycle } : null);
      setSuccessMessage(`Student cycle updated to ${newCycle}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating GMAT cycle:', err);
      setError(err instanceof Error ? err.message : 'Failed to update GMAT cycle');
    } finally {
      setGmatLoading(false);
    }
  }

  async function handleResetSeenQuestions() {
    if (!studentId) return;

    setGmatLoading(true);
    setShowResetConfirm(false);
    try {
      await clearSeenQuestions(studentId);
      setGmatSeenCount(0);
      setGmatProgress(prev => prev ? { ...prev, seen_question_ids: [] } : null);
      setSuccessMessage('Seen questions have been reset!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error resetting seen questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset seen questions');
    } finally {
      setGmatLoading(false);
    }
  }

  // Helper to get cycle display info
  function getCycleInfo(cycle: GmatCycle) {
    const info: Record<GmatCycle, { color: string; bgColor: string; borderColor: string; scoreRange: string; description: string }> = {
      Foundation: {
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        scoreRange: '505-605',
        description: 'Building core skills with easier questions (60% Easy, 30% Medium, 10% Hard)',
      },
      Development: {
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        scoreRange: '605-665',
        description: 'Advancing skills with balanced difficulty (25% Easy, 50% Medium, 25% Hard)',
      },
      Excellence: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        scoreRange: '665-715+',
        description: 'Mastering advanced content (5% Easy, 30% Medium, 65% Hard)',
      },
    };
    return info[cycle];
  }

  async function loadStudentProfile() {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('2V_profiles')
        .select('id, name, email, real_test_date, average_school_grade, past_test_results, student_notes, esigenze_speciali')
        .eq('id', studentId)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error('Student not found');
      }

      // Cast past_test_results from JSON type to our interface
      const pastTestResults = (data.past_test_results as unknown as PastTestResult[]) || [];

      const profileData: StudentProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        real_test_date: data.real_test_date,
        average_school_grade: data.average_school_grade,
        past_test_results: pastTestResults,
        student_notes: data.student_notes,
        esigenze_speciali: data.esigenze_speciali || false,
      };

      setProfile(profileData);
      setRealTestDate(data.real_test_date ? new Date(data.real_test_date).toISOString().slice(0, 16) : '');
      setAverageGrade(data.average_school_grade?.toString() || '');
      setStudentNotes(data.student_notes || '');
      setPastResults(pastTestResults);
      setEsigenzeSpeciali(data.esigenze_speciali || false);
    } catch (err) {
      console.error('Error loading student profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!studentId) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updateData: any = {
        student_notes: studentNotes || null,
      };

      // Only update real_test_date if it's changed
      if (realTestDate) {
        updateData.real_test_date = new Date(realTestDate).toISOString();
      } else {
        updateData.real_test_date = null;
      }

      // Only update average_school_grade if it's a valid number
      if (averageGrade) {
        const grade = parseFloat(averageGrade);
        if (!isNaN(grade) && grade >= 0 && grade <= 100) {
          updateData.average_school_grade = grade;
        } else {
          throw new Error('Average grade must be between 0 and 100');
        }
      } else {
        updateData.average_school_grade = null;
      }

      // Update past results
      updateData.past_test_results = pastResults;

      const { error: updateError } = await supabase
        .from('2V_profiles')
        .update(updateData)
        .eq('id', studentId);

      if (updateError) throw updateError;

      setSuccessMessage('Student profile updated successfully!');

      // Reload profile to get fresh data
      await loadStudentProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving student profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save student profile');
    } finally {
      setSaving(false);
    }
  }

  function handleAddPastResult() {
    if (!newResult.date || !newResult.test_type || !newResult.score) {
      setError('Please fill in date, test type, and score');
      return;
    }

    const result: PastTestResult = {
      id: Date.now().toString(),
      date: newResult.date,
      test_type: newResult.test_type,
      score: newResult.score,
      notes: newResult.notes || undefined,
    };

    setPastResults([...pastResults, result]);
    setNewResult({ date: '', test_type: '', score: '', notes: '' });
    setShowAddResult(false);
    setError(null);
  }

  function handleDeletePastResult(id: string) {
    setPastResults(pastResults.filter(r => r.id !== id));
  }

  async function handleEsigenzeSpecialiToggle(checked: boolean) {
    if (!studentId) return;

    setEsigenzeSpeciali(checked);

    try {
      const { error: updateError } = await supabase
        .from('2V_profiles')
        .update({ esigenze_speciali: checked })
        .eq('id', studentId);

      if (updateError) throw updateError;

      setSuccessMessage(
        checked
          ? 'Special needs flag enabled and saved'
          : 'Special needs flag disabled and saved'
      );

      // Clear success message after 2 seconds
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error('Error updating special needs flag:', err);
      setError(err instanceof Error ? err.message : 'Failed to update special needs flag');
      // Revert the checkbox state on error
      setEsigenzeSpeciali(!checked);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading student profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">Student not found</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Student Profile" pageSubtitle={profile.name}>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-fadeInUp">
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fadeInUp">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Student Info Card */}
          <div className="bg-gradient-to-br from-brand-green to-green-600 rounded-2xl shadow-xl p-6 text-white mb-6">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-3xl" />
                </div>
                {/* Back Button */}
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium text-sm"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-white/80">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Countdown Timer Card */}
          {profile.real_test_date && (
            <div className="mb-6 animate-fadeInUp">
              <CountdownTimer
                targetDate={profile.real_test_date}
                label="Real Test Date"
                variant="card"
                showDate={true}
              />
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
            {/* Special Needs Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faUniversalAccess} className="text-brand-green text-xl" />
                <h3 className="text-xl font-bold text-brand-dark">Special Needs / Accommodations</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esigenzeSpeciali}
                    onChange={(e) => handleEsigenzeSpecialiToggle(e.target.checked)}
                    className="w-5 h-5 text-brand-green focus:ring-brand-green rounded"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Student has special needs (Esigenze Speciali)
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-saves when toggled. Extra time functionality will be implemented soon.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Real Test Date Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-brand-green text-xl" />
                <h3 className="text-xl font-bold text-brand-dark">Real Test Date</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set the date and time of the student's real exam
                </label>
                <input
                  type="datetime-local"
                  value={realTestDate}
                  onChange={(e) => setRealTestDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-green focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will create a countdown timer visible to both you and the student
                </p>
              </div>
            </div>

            {/* Average School Grade Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faGraduationCap} className="text-brand-green text-xl" />
                <h3 className="text-xl font-bold text-brand-dark">Average School Grade</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student's average grade at school (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={averageGrade}
                  onChange={(e) => setAverageGrade(e.target.value)}
                  placeholder="e.g., 85.5"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-green focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* GMAT Cycle Management Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faRocket} className="text-brand-green text-xl" />
                <h3 className="text-xl font-bold text-brand-dark">GMAT Preparation Cycle</h3>
              </div>

              {gmatLoading ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <FontAwesomeIcon icon={faSpinner} className="text-3xl text-gray-400 animate-spin mb-2" />
                  <p className="text-gray-500">Loading GMAT progress...</p>
                </div>
              ) : !gmatProgress ? (
                // No GMAT progress - show initialization options
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-center mb-6">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-600 font-medium">GMAT preparation not yet initialized</p>
                    <p className="text-gray-500 text-sm mt-1">Select an initial cycle to start tracking this student's GMAT progress</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {GMAT_CYCLES.map((cycle) => {
                      const info = getCycleInfo(cycle);
                      return (
                        <button
                          key={cycle}
                          onClick={() => handleInitializeGMAT(cycle)}
                          className={`p-4 rounded-xl border-2 ${info.borderColor} ${info.bgColor} hover:shadow-md transition-all text-left`}
                        >
                          <h4 className={`font-bold ${info.color} text-lg`}>{cycle}</h4>
                          <p className="text-gray-600 text-sm mt-1">Target: {info.scoreRange}</p>
                          <p className="text-gray-500 text-xs mt-2">{info.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Show current cycle and management options
                <div className="space-y-4">
                  {/* Current Cycle Display */}
                  {(() => {
                    const info = getCycleInfo(gmatProgress.gmat_cycle);
                    return (
                      <div className={`${info.bgColor} border-2 ${info.borderColor} rounded-xl p-5`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-2xl font-bold ${info.color}`}>
                                {gmatProgress.gmat_cycle}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${info.bgColor} ${info.color} border ${info.borderColor}`}>
                                Target: {info.scoreRange}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{info.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FontAwesomeIcon icon={faQuestionCircle} className="text-sm" />
                              <span className="text-sm font-medium">{gmatSeenCount} questions seen</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Cycle Change Options */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Change Cycle</h4>
                    <div className="flex flex-wrap gap-2">
                      {GMAT_CYCLES.map((cycle) => {
                        const isCurrentCycle = cycle === gmatProgress.gmat_cycle;
                        const info = getCycleInfo(cycle);
                        const currentIndex = GMAT_CYCLES.indexOf(gmatProgress.gmat_cycle);
                        const targetIndex = GMAT_CYCLES.indexOf(cycle);
                        const isPromotion = targetIndex > currentIndex;

                        return (
                          <button
                            key={cycle}
                            onClick={() => !isCurrentCycle && setShowCycleConfirm(cycle)}
                            disabled={isCurrentCycle}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                              isCurrentCycle
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : `${info.bgColor} ${info.color} border-2 ${info.borderColor} hover:shadow-md`
                            }`}
                          >
                            {!isCurrentCycle && (
                              <FontAwesomeIcon
                                icon={isPromotion ? faArrowUp : faArrowDown}
                                className={isPromotion ? 'text-green-600' : 'text-amber-600'}
                              />
                            )}
                            {cycle}
                            {isCurrentCycle && <span className="text-xs">(Current)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reset Seen Questions */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-700">Reset Seen Questions</h4>
                        <p className="text-gray-500 text-sm">Clear the student's question history to allow them to see all questions again</p>
                      </div>
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        disabled={gmatSeenCount === 0}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                          gmatSeenCount === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-600 border-2 border-red-200 hover:bg-red-200'
                        }`}
                      >
                        <FontAwesomeIcon icon={faRedo} />
                        Reset ({gmatSeenCount})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cycle Change Confirmation Modal */}
              {showCycleConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeInUp">
                    <div className={`p-4 ${getCycleInfo(showCycleConfirm).bgColor}`}>
                      <h3 className={`text-lg font-bold ${getCycleInfo(showCycleConfirm).color}`}>
                        Change to {showCycleConfirm} Cycle?
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">
                        This will change the student's GMAT preparation cycle from{' '}
                        <strong>{gmatProgress?.gmat_cycle}</strong> to{' '}
                        <strong>{showCycleConfirm}</strong>.
                      </p>
                      <p className="text-gray-500 text-sm mb-6">
                        The student will receive questions based on the {showCycleConfirm} difficulty distribution.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCycleConfirm(null)}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateCycle(showCycleConfirm)}
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                            showCycleConfirm === 'Excellence'
                              ? 'bg-green-600 hover:bg-green-700'
                              : showCycleConfirm === 'Development'
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          Confirm Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Confirmation Modal */}
              {showResetConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeInUp">
                    <div className="p-4 bg-red-50">
                      <h3 className="text-lg font-bold text-red-700">Reset Seen Questions?</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">
                        This will clear all {gmatSeenCount} questions from the student's history.
                      </p>
                      <p className="text-gray-500 text-sm mb-6">
                        The student may see the same questions again in future tests. This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleResetSeenQuestions}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          Reset Questions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Past Test Results Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faHistory} className="text-brand-green text-xl" />
                  <h3 className="text-xl font-bold text-brand-dark">Past Test Results</h3>
                </div>
                <button
                  onClick={() => setShowAddResult(!showAddResult)}
                  className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add Result
                </button>
              </div>

              {/* Add New Result Form */}
              {showAddResult && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4 animate-fadeInUp">
                  <h4 className="font-semibold text-brand-dark mb-3">Add Past Test Result</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={newResult.date}
                        onChange={(e) => setNewResult({ ...newResult, date: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Test Type</label>
                      <input
                        type="text"
                        value={newResult.test_type}
                        onChange={(e) => setNewResult({ ...newResult, test_type: e.target.value })}
                        placeholder="e.g., SAT, ACT, TOLC"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Score</label>
                      <input
                        type="text"
                        value={newResult.score}
                        onChange={(e) => setNewResult({ ...newResult, score: e.target.value })}
                        placeholder="e.g., 1250, 28, 75%"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                      <input
                        type="text"
                        value={newResult.notes}
                        onChange={(e) => setNewResult({ ...newResult, notes: e.target.value })}
                        placeholder="e.g., First attempt, with accommodations"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-green focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddPastResult}
                      className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                    >
                      Add Result
                    </button>
                    <button
                      onClick={() => {
                        setShowAddResult(false);
                        setNewResult({ date: '', test_type: '', score: '', notes: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Past Results List */}
              <div className="space-y-3">
                {pastResults.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <FontAwesomeIcon icon={faHistory} className="text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500">No past test results recorded</p>
                  </div>
                ) : (
                  pastResults
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((result) => (
                      <div
                        key={result.id}
                        className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-brand-dark text-lg">{result.test_type}</span>
                            <span className="px-3 py-1 bg-brand-green text-white rounded-full text-sm font-semibold">
                              {result.score}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">
                              {new Date(result.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                            {result.notes && <span className="ml-2">• {result.notes}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePastResult(result.id)}
                          className="ml-4 w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete result"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Student Notes Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faStickyNote} className="text-brand-green text-xl" />
                <h3 className="text-xl font-bold text-brand-dark">Student Notes</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General notes about the student
                </label>
                <textarea
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  rows={5}
                  placeholder="Add any notes about the student's progress, strengths, weaknesses, goals, etc."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-green focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Save Student Profile
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
