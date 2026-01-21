/**
 * Student Tests Page
 * Shows all tests of a specific type for a student
 * Allows tutor to:
 * - View test status (locked, unlocked, in_progress, completed)
 * - Unlock tests
 * - View results
 * - Assign new tests
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faLock,
  faLockOpen,
  faSpinner,
  faCheckCircle,
  faClipboardList,
  faUserGraduate,
  faCalendar,
  faClock,
  faPercent,
  faEye,
  faChevronDown,
  faChevronRight,
  faPlay,
  faUser,
  faChalkboardTeacher,
  faStopwatch,
  faInfinity,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { translateTestTrackAsync } from '../lib/translateTestTrack';
import i18n from 'i18next';

// BIG DRAMATIC LOCK ANIMATION STYLES
const lockAnimationStyles = `
  @keyframes bigLockOpen {
    0% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    30% {
      transform: scale(3) rotate(-15deg);
      opacity: 0.8;
    }
    60% {
      transform: scale(4) rotate(10deg) translateY(-20px);
      opacity: 0.3;
    }
    100% {
      transform: scale(5) rotate(0deg) translateY(-30px);
      opacity: 0;
    }
  }

  @keyframes bigLockClose {
    0% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    30% {
      transform: scale(3) rotate(15deg);
      opacity: 0.8;
    }
    60% {
      transform: scale(4) rotate(-10deg);
      opacity: 0.5;
    }
    80% {
      transform: scale(3.5) rotate(5deg);
      opacity: 0.3;
    }
    100% {
      transform: scale(3) rotate(0deg);
      opacity: 0;
    }
  }

  @keyframes bigLockGlowGreen {
    0% {
      filter: drop-shadow(0 0 0px rgba(0, 166, 102, 0));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(0, 166, 102, 1)) drop-shadow(0 0 80px rgba(0, 166, 102, 0.8));
    }
    100% {
      filter: drop-shadow(0 0 0px rgba(0, 166, 102, 0));
    }
  }

  @keyframes bigLockGlowRed {
    0% {
      filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0));
    }
    50% {
      filter: drop-shadow(0 0 40px rgba(220, 38, 38, 1)) drop-shadow(0 0 80px rgba(220, 38, 38, 0.8));
    }
    100% {
      filter: drop-shadow(0 0 0px rgba(220, 38, 38, 0));
    }
  }

  @keyframes cardShake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes overlayFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .big-lock-opening {
    animation: bigLockOpen 1.2s ease-out forwards, bigLockGlowGreen 1.2s ease-out;
  }

  .big-lock-closing {
    animation: bigLockClose 1s ease-out forwards, bigLockGlowRed 1s ease-out;
  }

  .card-shake {
    animation: cardShake 0.5s ease-in-out;
  }

  .lock-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lock-overlay.fade-in {
    animation: overlayFadeIn 0.3s ease-out;
  }

  .lock-overlay.fade-out {
    animation: overlayFadeOut 0.3s ease-out forwards;
  }

  .giant-lock-container {
    font-size: 120px;
    color: #00a666;
    position: relative;
  }

  .giant-lock-container.locking {
    color: #dc2626;
  }
`;

interface TestAssignment {
  id: string;
  test_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'incomplete' | 'annulled';
  completion_status: string | null;
  assigned_at: string | null;
  start_time: string | null;
  completed_at: string | null;
  score: number | null;
  percentage_score: number | null;
  bocconi_score: number | null;
  correct_count: number | null;  // Number of correct answers
  total_questions: number | null;  // Total questions in test
  current_attempt: number;
  total_attempts: number;
  test_name: string;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  duration_minutes: number;
  question_format: 'pdf' | 'interactive' | 'mixed';  // NEW: Track if test is PDF or interactive
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
}

export default function StudentTestsPage() {
  const { t } = useTranslation();
  const { studentId, testType } = useParams<{ studentId: string; testType: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [locking, setLocking] = useState<string | null>(null);
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  const [lockOverlayType, setLockOverlayType] = useState<'lock' | 'unlock'>('unlock');
  const [overlayFadingOut, setOverlayFadingOut] = useState(false);
  const [showConfirmLock, setShowConfirmLock] = useState(false);
  const [pendingLockId, setPendingLockId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [translatedSections, setTranslatedSections] = useState<Record<string, string>>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);

  // Start Test Modal state
  const [showStartTestModal, setShowStartTestModal] = useState(false);
  const [selectedTestForStart, setSelectedTestForStart] = useState<TestAssignment | null>(null);
  const [startTestMode, setStartTestMode] = useState<'student' | 'guided'>('student');
  const [guidedTimed, setGuidedTimed] = useState(true);

  useEffect(() => {
    if (studentId && testType) {
      loadData();
    }
  }, [studentId, testType]);

  // Translate section names when assignments change
  useEffect(() => {
    if (assignments.length === 0) return;

    const translateSections = async () => {
      const sections = [...new Set(assignments.map(a => a.section))];
      const currentLang = i18n.language || 'it';

      const translations: Record<string, string> = {};

      // If language is Italian, no translation needed (DB values are in Italian)
      if (currentLang === 'it') {
        for (const section of sections) {
          translations[section] = section;
        }
        setTranslatedSections(translations);
        return;
      }

      // Translate to English
      for (const section of sections) {
        const translated = await translateTestTrackAsync(section, t, 'en');
        translations[section] = translated;
      }

      setTranslatedSections(translations);
    };

    translateSections();
  }, [assignments, t]);

  // Helper function to normalize section names for comparison (same as TestStructurePage)
  const normalizeSectionName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[,;:.!?]/g, '') // Remove punctuation
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  };

  // Helper function to get sorted sections (same logic as TestStructurePage)
  const getSortedSections = (sections: string[], sectionOrder: string[]): string[] => {
    return sections.sort((a, b) => {
      // Normalize section names for comparison
      const aNorm = normalizeSectionName(a);
      const bNorm = normalizeSectionName(b);

      // Find index in order array using normalized comparison
      const aIndex = sectionOrder.findIndex(s => normalizeSectionName(s) === aNorm);
      const bIndex = sectionOrder.findIndex(s => normalizeSectionName(s) === bNorm);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // Fall back to alphabetical
      return a.localeCompare(b);
    });
  };

  // Group tests by section
  interface GroupedTests {
    [section: string]: TestAssignment[];
  }

  function groupTestsBySection(tests: TestAssignment[]): GroupedTests {
    const grouped: GroupedTests = {};
    tests.forEach(test => {
      if (!grouped[test.section]) {
        grouped[test.section] = [];
      }
      grouped[test.section].push(test);
    });
    return grouped;
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  // Bot Control: Listen for bot commands to automate Lock/Unlock/Annul
  useEffect(() => {
    const handleBotMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, action, assignmentId } = event.data;

      if (type !== 'BOT_ACTION') return;

      console.log('🤖 Bot command received on StudentTests page:', action, { assignmentId });

      switch (action) {
        case 'LOCK_TEST':
          if (assignmentId) {
            console.log('🤖 Bot locking test:', assignmentId);
            // Find and click the lock button for this assignment
            const lockButton = document.querySelector(`button[data-assignment-id="${assignmentId}"][data-action="lock"]`);
            if (lockButton) {
              (lockButton as HTMLButtonElement).click();
            } else {
              // Fallback: use handleLock function if available
              handleLock(assignmentId);
            }
          }
          break;

        case 'UNLOCK_TEST':
          if (assignmentId) {
            console.log('🤖 Bot unlocking test:', assignmentId);
            // Find and click the unlock button
            const unlockButton = document.querySelector(`button[data-assignment-id="${assignmentId}"][data-action="unlock"]`);
            if (unlockButton) {
              (unlockButton as HTMLButtonElement).click();
            } else {
              handleUnlock(assignmentId);
            }
          }
          break;

        case 'ANNUL_TEST':
          if (assignmentId) {
            console.log('🤖 Bot annulling test:', assignmentId);
            handleAnnul(assignmentId);
          }
          break;
      }
    };

    window.addEventListener('message', handleBotMessage);

    // Send READY message when page loads
    if (window.opener) {
      console.log('📡 Student Tests page ready - sending READY signal...');
      window.opener.postMessage({
        type: 'PAGE_READY',
        page: 'StudentTests'
      }, window.location.origin);
    }

    return () => {
      window.removeEventListener('message', handleBotMessage);
    };
  }, [studentId, testType, assignments]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      // Fetch student info
      const { data: studentData, error: studentError } = await supabase
        .from('2V_profiles')
        .select('id, name, email')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      setStudent({
        id: studentData.id,
        name: studentData.name || '',
        email: studentData.email,
      });

      // AUTO-ASSIGN: Find all tests of this type that are NOT assigned to this student
      const { data: existingAssignments } = await supabase
        .from('2V_test_assignments')
        .select('test_id')
        .eq('student_id', studentId);

      const assignedTestIds = (existingAssignments || []).map(a => a.test_id);

      // Get all active tests of this test_type
      let availableTestsQuery = supabase
        .from('2V_tests')
        .select('id')
        .eq('test_type', testType)
        .eq('is_active', true);

      // Exclude already assigned tests
      if (assignedTestIds.length > 0) {
        availableTestsQuery = availableTestsQuery.not('id', 'in', `(${assignedTestIds.join(',')})`);
      }

      const { data: availableTests } = await availableTestsQuery;

      // Auto-assign any missing tests as LOCKED
      if (availableTests && availableTests.length > 0) {
        console.log(`🔄 Auto-assigning ${availableTests.length} new tests to student ${studentId}`);

        // Get current user (tutor) ID for assigned_by field
        const { data: { user } } = await supabase.auth.getUser();
        let assignedBy = null;

        if (user) {
          const { data: profile } = await supabase
            .from('2V_profiles')
            .select('id')
            .eq('auth_uid', user.id)
            .single();
          assignedBy = profile?.id;
        }

        const { error: assignError } = await supabase
          .from('2V_test_assignments')
          .insert(
            availableTests.map(test => ({
              student_id: studentId,
              test_id: test.id,
              status: 'locked',
              current_attempt: 1,
              total_attempts: 0,
              assigned_by: assignedBy,
              assigned_at: new Date().toISOString(),
            }))
          );

        if (assignError) {
          console.error('Error auto-assigning tests:', assignError);
        } else {
          console.log(`✅ Successfully auto-assigned ${availableTests.length} tests`);
        }
      }

      // Fetch section order for this test type
      const { data: sectionOrderData, error: orderError } = await supabase
        .from('2V_section_order')
        .select('section_order')
        .eq('test_type', testType)
        .maybeSingle();

      if (orderError) {
        console.error('Error fetching section order:', orderError);
      }

      const fetchedSectionOrder = sectionOrderData?.section_order || [];
      setSectionOrder(fetchedSectionOrder);

      // Fetch test assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('2V_test_assignments')
        .select(`
          id,
          test_id,
          status,
          completion_status,
          assigned_at,
          start_time,
          completed_at,
          current_attempt,
          total_attempts,
          completion_details,
          2V_tests!inner (
            test_type,
            section,
            exercise_type,
            test_number,
            default_duration_mins
          )
        `)
        .eq('student_id', studentId)
        .eq('2V_tests.test_type', testType);

      if (assignmentError) throw assignmentError;

      // For each assignment, check the question_type distribution and calculate score
      const assignmentWithFormat = await Promise.all(
        (assignmentData || []).map(async (assignment: any) => {
          // Count question types for this test (check test_id OR additional_test_ids)
          const { data: questions } = await supabase
            .from('2V_questions')
            .select('id, question_type')
            .or(`test_id.eq.${assignment.test_id},additional_test_ids.cs.["${assignment.test_id}"]`);

          // Get ACTUAL total questions from test definition (ground truth)
          const actualTotalQuestions = questions?.length || 0;

          // Determine format based on question types
          let format: 'pdf' | 'interactive' | 'mixed' = 'pdf';
          if (questions && questions.length > 0) {
            const pdfCount = questions.filter(q => q.question_type === 'pdf').length;
            const interactiveCount = questions.filter(q => q.question_type === 'multiple_choice').length;

            if (pdfCount > 0 && interactiveCount > 0) {
              format = 'mixed';
            } else if (interactiveCount > 0) {
              format = 'interactive';
            } else {
              format = 'pdf';
            }
          }

          // Calculate both percentage and Bocconi score ONLY if test has been taken
          let percentageScore: number | null = null;
          let bocconiScore: number | null = null;

          // Only calculate scores if completed_at is set (test has been finished)
          if (assignment.completed_at && questions && questions.length > 0) {
            // Find the most recent attempt that has answers (same logic as TestResultsPage)
            const { data: allAnswers } = await supabase
              .from('2V_student_answers')
              .select('attempt_number')
              .eq('assignment_id', assignment.id);

            if (allAnswers && allAnswers.length > 0) {
              // Determine which attempts have answers
              const attemptsSet = new Set(allAnswers.map(a => a.attempt_number));

              // Find most recent attempt with answers (count down from current_attempt)
              let attemptToLoad = null;
              for (let i = assignment.current_attempt || 1; i >= 1; i--) {
                if (attemptsSet.has(i)) {
                  attemptToLoad = i;
                  break;
                }
              }

              if (attemptToLoad !== null) {
                // Get student answers for the found attempt
                const { data: studentAnswers, error: answersError } = await supabase
                  .from('2V_student_answers')
                  .select('question_id, answer, auto_score')
                  .eq('assignment_id', assignment.id)
                  .eq('attempt_number', attemptToLoad);

                // Only calculate if there are answers
                if (studentAnswers && studentAnswers.length > 0) {
                  console.log(`📊 Calculating scores for assignment ${assignment.id}, attempt ${attemptToLoad}, found ${studentAnswers.length} answers`);

                  // Load questions (EXACT same way as TestResultsPage line 262-265)
                  const questionIds = studentAnswers.map(sa => sa.question_id);
                  const { data: questionsData } = await supabase
                    .from('2V_questions')
                    .select('*')
                    .in('id', questionIds);

                  if (questionsData) {
                    const questionMap = new Map(questionsData.map(q => [q.id, q]));

                    // checkIfCorrect function (EXACT copy from TestResultsPage line 370-450)
                    const checkIfCorrect = (question: any, studentAnswer: any): boolean => {
                      if (!studentAnswer || !studentAnswer.answer) return false;

                      const studentAns = studentAnswer.answer;
                      const answersData = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
                      const correctAns = answersData?.correct_answer;

                      if (!studentAns || !correctAns) return false;

                      const questionData = question.question_data || {};
                      const diType = questionData.di_type;

                      // GI (Graphical Interpretation) - student: {part1, part2}, correct: ["val1", "val2"]
                      if (diType === 'GI' && studentAns.answers && Array.isArray(correctAns)) {
                        const studentGI = studentAns.answers;
                        const match1 = String(studentGI.part1 || '').trim() === String(correctAns[0] || '').trim();
                        const match2 = String(studentGI.part2 || '').trim() === String(correctAns[1] || '').trim();
                        return match1 && match2;
                      }

                      // TA (Table Analysis) - student: {0: "true", 1: "false"}, correct: [{stmt0: "col1", stmt1: "col2"}]
                      if (diType === 'TA' && studentAns.answers) {
                        const correctTA = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
                        const studentTA = studentAns.answers;

                        // Check all statements
                        const result = Object.entries(correctTA).every(([key, value]) => {
                          const match = key.match(/stmt(\d+)/);
                          if (match) {
                            const index = parseInt(match[1], 10);
                            const expectedAnswer = value === 'col1' ? 'true' : 'false';
                            const studentValue = String(studentTA[index] || studentTA[String(index)] || '').toLowerCase();
                            const isMatch = studentValue === expectedAnswer || studentValue === String(expectedAnswer === 'true');
                            return isMatch;
                          }
                          return true;
                        });
                        return result;
                      }

                      // TPA (Two-Part Analysis) - student: {part1, part2}, correct: [{col1: "...", col2: "..."}]
                      if (diType === 'TPA' && studentAns.answers) {
                        const correctTPA = Array.isArray(correctAns) && correctAns.length > 0 ? correctAns[0] : correctAns || {};
                        const studentTPA = studentAns.answers;
                        const match1 = String(studentTPA.part1 || '').trim() === String(correctTPA.col1 || '').trim();
                        const match2 = String(studentTPA.part2 || '').trim() === String(correctTPA.col2 || '').trim();
                        return match1 && match2;
                      }

                      // MSR (Multi-Source Reasoning) - array of answers
                      if (diType === 'MSR' && studentAns.answers && Array.isArray(correctAns)) {
                        const studentMSR = Array.isArray(studentAns.answers) ? studentAns.answers : [];
                        if (studentMSR.length !== correctAns.length) {
                          return false;
                        }
                        const result = studentMSR.every((ans: any, idx: number) =>
                          String(ans || '').toLowerCase() === String(correctAns[idx] || '').toLowerCase()
                        );
                        return result;
                      }

                      // DS (Data Sufficiency) - simple string answer
                      if (diType === 'DS') {
                        const studentDS = typeof studentAns === 'string' ? studentAns : studentAns.answer;
                        const correctDS = Array.isArray(correctAns) ? correctAns[0] : correctAns;
                        const result = String(studentDS || '').toUpperCase() === String(correctDS || '').toUpperCase();
                        return result;
                      }

                      // Multiple Choice - student: {answer: "e"} or "e", correct: "e"
                      if (question.question_type === 'multiple_choice') {
                        const studentMC = studentAns.answer || studentAns;
                        const correctMC = typeof correctAns === 'string' ? correctAns : correctAns;
                        return String(studentMC || '').toLowerCase() === String(correctMC || '').toLowerCase();
                      }

                      return false;
                    };

                    // Build results array (EXACT same as TestResultsPage line 325-327)
                    const results = studentAnswers.map(sa => {
                      const question = questionMap.get(sa.question_id);
                      return {
                        question,
                        studentAnswer: sa,
                        isCorrect: question ? checkIfCorrect(question, sa) : false
                      };
                    });

                    // For Bocconi tests, calculate with penalties
                    const testType = assignment['2V_tests'].test_type;
                    const isBocconi = testType.toUpperCase() === 'BOCCONI' || testType.toUpperCase() === 'BOCCONI LAW';

                    if (isBocconi) {
                      // Load algorithm config
                      const exerciseType = assignment['2V_tests'].exercise_type;
                      const { data: trackConfig } = await supabase
                        .from('2V_test_track_config')
                        .select('algorithm_id')
                        .eq('test_type', testType)
                        .eq('track_type', exerciseType)
                        .maybeSingle();

                      if (trackConfig?.algorithm_id) {
                        const { data: algoConfig } = await supabase
                          .from('2V_algorithm_config')
                          .select('*')
                          .eq('id', trackConfig.algorithm_id)
                          .single();

                        if (algoConfig && algoConfig.scoring_method === 'raw_score') {
                          // EXACT logic from TestResultsPage calculateScaledScores (line 863-980)
                          const penaltyBlank = parseFloat(algoConfig.penalty_for_blank || '0');
                          let totalRawScore = 0;

                          // Get total questions from completion_details OR test definition (ground truth)
                          let totalQuestions = actualTotalQuestions; // Use test definition as fallback
                          if (assignment.completion_details?.attempts) {
                            const attemptData = assignment.completion_details.attempts.find(
                              (a: any) => a.attempt_number === attemptToLoad
                            );
                            if (attemptData?.total_questions) {
                              totalQuestions = attemptData.total_questions;
                            }
                          }

                          // Helper to count options (line 914-921)
                          const countOptions = (question: any): number => {
                            const questionData = question.question_data || {};
                            const options = questionData.options || questionData.options_eng || {};
                            const optionKeys = Object.keys(options).filter(k => k.length === 1 && k >= 'a' && k <= 'z');
                            return optionKeys.length;
                          };

                          // Helper to get penalty (line 868-911)
                          const getPenaltyForWrong = (optionsCount: number): number => {
                            const penaltyConfig = algoConfig.penalty_for_wrong;
                            if (!penaltyConfig) return 0;
                            if (typeof penaltyConfig === 'number') return Math.abs(penaltyConfig);
                            if (typeof penaltyConfig === 'object' && optionsCount) {
                              return Math.abs(Number(penaltyConfig[String(optionsCount)] || 0));
                            }
                            return 0;
                          };

                          // Score calculation (line 941-970)
                          results.forEach(r => {
                            if (r.isCorrect) {
                              totalRawScore += 1;
                            } else if (r.studentAnswer.answer) {
                              const optionsCount = countOptions(r.question);
                              const penalty = getPenaltyForWrong(optionsCount);
                              totalRawScore -= penalty;
                            } else {
                              totalRawScore += penaltyBlank;
                            }
                          });

                          // Scale to 50 (line 980)
                          bocconiScore = totalQuestions > 0
                            ? parseFloat(((totalRawScore / totalQuestions) * 50).toFixed(2))
                            : 0;

                          console.log(`📊 Bocconi score: ${bocconiScore}/50 (raw: ${totalRawScore}, questions: ${totalQuestions})`);
                        }
                      }
                    }

                    // Simple percentage for all tests
                    // Get total questions from completion_details OR test definition (ground truth)
                    let totalTestQuestions = actualTotalQuestions; // Use test definition as fallback
                    if (assignment.completion_details?.attempts) {
                      const attemptData = assignment.completion_details.attempts.find(
                        (a: any) => a.attempt_number === attemptToLoad
                      );
                      if (attemptData?.total_questions) {
                        totalTestQuestions = attemptData.total_questions;
                      }
                    }

                    const correctCount = results.filter(r => r.isCorrect).length;
                    percentageScore = Math.round((correctCount / totalTestQuestions) * 100);
                    console.log(`📊 Scores - Percentage: ${percentageScore}% (${correctCount}/${totalTestQuestions}), Bocconi: ${bocconiScore}/50`);

                    // Store correct count and total for display
                    return {
                      ...assignment,
                      question_format: format,
                      percentage_score: percentageScore,
                      bocconi_score: bocconiScore,
                      correct_count: correctCount,
                      total_questions: totalTestQuestions
                    };
                  }
                }
              }
            }
          }

          console.log(`📊 Final scores for assignment ${assignment.id}:`, {
            percentage_score: percentageScore,
            bocconi_score: bocconiScore,
            test_type: assignment['2V_tests'].test_type,
            status: assignment.status
          });

          return {
            ...assignment,
            question_format: format,
            percentage_score: percentageScore,
            bocconi_score: bocconiScore,
            correct_count: null,
            total_questions: null
          };
        })
      );

      // Transform assignments
      const transformedAssignments = assignmentWithFormat.map((row: any) => {
        const section = row['2V_tests'].section;
        const exerciseType = row['2V_tests'].exercise_type;
        const testNumber = row['2V_tests'].test_number;

        // If section contains "multi", use exercise_type as section name
        const displaySection = section.toLowerCase().includes('multi')
          ? exerciseType
          : section;

        // Build test name: if multi-topic, just show "ExerciseType TestNumber"
        // otherwise show "Section - ExerciseType TestNumber"
        const testName = section.toLowerCase().includes('multi')
          ? `${exerciseType} ${testNumber}`
          : `${section} - ${exerciseType} ${testNumber}`;

        return {
          id: row.id,
          test_id: row.test_id,
          status: row.status,
          completion_status: row.completion_status,
          assigned_at: row.assigned_at,
          start_time: row.start_time,
          completed_at: row.completed_at,
          score: row.percentage_score, // Simple percentage for backwards compatibility
          percentage_score: row.percentage_score,
          bocconi_score: row.bocconi_score,
          correct_count: row.correct_count,
          total_questions: row.total_questions,
          current_attempt: row.current_attempt || 1,
          total_attempts: row.total_attempts || 0,
          test_name: testName,
          test_type: row['2V_tests'].test_type,
          section: displaySection,
          exercise_type: exerciseType,
          question_format: row.question_format,
          test_number: testNumber,
          duration_minutes: row['2V_tests'].default_duration_mins,
        };
      });

      // Sort client-side using section order if available
      transformedAssignments.sort((a, b) => {
        // Helper function to check if section/exercise is Assessment Iniziale
        const isAssessment = (item: typeof a) => {
          const text = (item.section + ' ' + item.exercise_type).toLowerCase();
          return text.includes('assess') && text.includes('iniz');
        };

        // Helper function to check if section/exercise is Simulazione
        const isSimulazione = (item: typeof a) => {
          const text = (item.section + ' ' + item.exercise_type).toLowerCase();
          return text.includes('simulaz');
        };

        const aIsAssessment = isAssessment(a);
        const bIsAssessment = isAssessment(b);
        const aIsSimulazione = isSimulazione(a);
        const bIsSimulazione = isSimulazione(b);

        // Assessment Iniziale always first
        if (aIsAssessment && !bIsAssessment) return -1;
        if (!aIsAssessment && bIsAssessment) return 1;

        // Simulazione always last (but after checking assessment)
        if (aIsSimulazione && !bIsSimulazione) return 1;
        if (!aIsSimulazione && bIsSimulazione) return -1;

        // For everything else, use section ordering with normalized comparison
        if (a.section !== b.section) {
          // Normalize section names for comparison
          const aNorm = normalizeSectionName(a.section);
          const bNorm = normalizeSectionName(b.section);

          // Find index in order array using normalized comparison
          const aIndex = fetchedSectionOrder.findIndex(s => normalizeSectionName(s) === aNorm);
          const bIndex = fetchedSectionOrder.findIndex(s => normalizeSectionName(s) === bNorm);

          // If both sections are in the order array, use that order
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }

          // If only one is in the order array, prioritize it
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;

          // If neither is in the order array, use alphabetical
          return a.section.localeCompare(b.section);
        }

        // Within same section, sort by exercise type
        if (a.exercise_type !== b.exercise_type) {
          return a.exercise_type.localeCompare(b.exercise_type);
        }

        // Within same exercise type, sort by test number
        return a.test_number - b.test_number;
      });

      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(assignmentId: string) {
    setUnlocking(assignmentId);

    // Show BIG lock opening overlay
    setLockOverlayType('unlock');
    setShowLockOverlay(true);
    setOverlayFadingOut(false);

    try {
      // Wait for overlay to appear
      await new Promise(resolve => setTimeout(resolve, 300));

      // Find the assignment to check its current status
      const assignment = assignments.find(a => a.id === assignmentId);

      console.log('🔍 Unlock check:', {
        assignmentId,
        foundAssignment: !!assignment,
        status: assignment?.status,
        current_attempt: assignment?.current_attempt,
        total_attempts: assignment?.total_attempts
      });

      // Prepare update object
      const updateData: any = {
        status: 'unlocked',
        // IMPORTANT: Reset results visibility when unlocking for retake
        // This prevents students from seeing previous attempt results during new attempt
        results_viewable_by_student: false
      };

      // Only increment current_attempt when unlocking for a RETAKE
      // - completed: student finished the test, now getting another attempt
      // - locked with total_attempts > 0: test was completed and then locked again
      // Do NOT increment for first-time unlock (locked with total_attempts === 0)
      // Backward compatible: check completion_status first, then fall back to status
      const isRetake = assignment?.completion_status?.startsWith('completed') || assignment?.status === 'completed' ||
                       (assignment?.status === 'locked' && (assignment?.total_attempts || 0) > 0);

      if (isRetake) {
        updateData.current_attempt = (assignment.current_attempt || 1) + 1;

        // Ensure total_attempts is at least current_attempt - 1 to satisfy constraint
        // This handles cases where current_attempt was manually incremented
        const minTotalAttempts = updateData.current_attempt - 1;
        if ((assignment.total_attempts || 0) < minTotalAttempts) {
          updateData.total_attempts = minTotalAttempts;
          console.log(`📝 Adjusting total_attempts from ${assignment.total_attempts} to ${minTotalAttempts} to satisfy constraint`);
        }

        console.log(`📝 Unlocking for retake | New attempt: ${updateData.current_attempt} | Hiding previous results`);
      } else {
        console.log(`📝 First-time unlock - keeping attempt at ${assignment?.current_attempt || 1}`);
      }

      const { error } = await supabase
        .from('2V_test_assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) throw error;

      // Wait for lock animation to complete
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Start fading out overlay
      setOverlayFadingOut(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Hide overlay
      setShowLockOverlay(false);

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error unlocking test:', err);
      setShowLockOverlay(false);
      alert('Failed to unlock test');
    } finally {
      setUnlocking(null);
    }
  }

  function showLockConfirmation(assignmentId: string) {
    setPendingLockId(assignmentId);
    setShowConfirmLock(true);
  }

  function cancelLock() {
    setShowConfirmLock(false);
    setPendingLockId(null);
  }

  async function confirmLock() {
    if (!pendingLockId) return;

    const assignmentId = pendingLockId;
    setShowConfirmLock(false);
    setPendingLockId(null);
    setLocking(assignmentId);

    // Show BIG lock closing overlay
    setLockOverlayType('lock');
    setShowLockOverlay(true);
    setOverlayFadingOut(false);

    try {
      // Wait for overlay to appear
      await new Promise(resolve => setTimeout(resolve, 300));

      const { error } = await supabase
        .from('2V_test_assignments')
        .update({
          status: 'locked',
        })
        .eq('id', assignmentId);

      if (error) throw error;

      // Wait for lock animation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start fading out overlay
      setOverlayFadingOut(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Hide overlay
      setShowLockOverlay(false);

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error locking test:', err);
      setShowLockOverlay(false);
      alert('Failed to lock test');
    } finally {
      setLocking(null);
    }
  }

  async function handleAnnul(assignmentId: string) {
    try {
      const { error } = await supabase
        .from('2V_test_assignments')
        .update({
          status: 'annulled',
          // Reset results visibility when annulling
          results_viewable_by_student: false
        })
        .eq('id', assignmentId);

      if (error) throw error;

      console.log('✅ Test annulled:', assignmentId);
      await loadData();
    } catch (err) {
      console.error('Error annulling test:', err);
      alert('Failed to annul test');
    }
  }

  function openStartTestModal(assignment: TestAssignment) {
    setSelectedTestForStart(assignment);
    // For locked/completed tests, force guided mode
    // Backward compatible: check completion_status first, then fall back to status
    const isLocked = assignment.status === 'locked' || assignment.completion_status?.startsWith('completed') || assignment.status === 'completed';
    setStartTestMode(isLocked ? 'guided' : 'student');
    setGuidedTimed(true);
    setShowStartTestModal(true);
  }

  function handleStartTest() {
    if (!selectedTestForStart) return;

    // Build URL with query parameters for guided mode
    let url = `/take-test/${selectedTestForStart.id}`;

    if (startTestMode === 'guided') {
      const params = new URLSearchParams();
      params.set('guided', 'true');
      params.set('timed', guidedTimed ? 'true' : 'false');
      url += `?${params.toString()}`;
    }

    setShowStartTestModal(false);
    navigate(url);
  }

  function getStatusStyles(status: string, completionStatus: string | null) {
    // Backward compatible: use completion_status if available, otherwise fall back to status
    const displayStatus = completionStatus || status;

    // Check if completed (new format with timestamp or old 'completed' status)
    if (displayStatus.startsWith('completed') || displayStatus === 'completed') {
      return {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: faCheckCircle,
        iconColor: 'text-green-600',
        label: displayStatus, // Show full completion_status with timestamp
      };
    }

    if (displayStatus === 'in_progress') {
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: faSpinner,
        iconColor: 'text-blue-600',
        label: t('studentTests.statusLabels.inProgress'),
      };
    }

    // Check if incomplete (new format with timestamp or old 'incomplete' status)
    if (displayStatus.startsWith('incomplete') || displayStatus === 'incomplete') {
      return {
        bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
        border: 'border-orange-300',
        text: 'text-orange-700',
        icon: faLockOpen,
        iconColor: 'text-green-600', // Always green when unlocked
        label: displayStatus, // Show full completion_status with timestamp
      };
    }

    // Check if annulled (new format with timestamp or old 'annulled' status)
    if (displayStatus.startsWith('annulled') || displayStatus === 'annulled') {
      return {
        bg: 'bg-gradient-to-r from-red-50 to-red-100',
        border: 'border-red-300',
        text: 'text-red-700',
        icon: faLockOpen,
        iconColor: 'text-green-600', // Always green when unlocked
        label: displayStatus, // Show full completion_status with timestamp
      };
    }

    // Check status field for unlocked/locked
    if (status === 'unlocked') {
      return {
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: faLockOpen,
        iconColor: 'text-green-600', // Always green when unlocked
        label: t('studentTests.statusLabels.unlocked'),
      };
    }

    // Default: locked
    return {
      bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      icon: faLock,
      iconColor: 'text-red-600', // Always red when locked
      label: t('studentTests.statusLabels.locked'),
    };
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t('studentTests.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      pageTitle={student?.name || student?.email}
      pageSubtitle={testType}
    >
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: lockAnimationStyles }} />

      {/* Confirmation Modal for Locking */}
      {showConfirmLock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faLock} className="text-3xl text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-brand-dark mb-4">
              {t('studentTests.lockThisTest')}?
            </h2>
            <p className="text-center text-gray-600 mb-8">
              {t('studentTests.lockConfirmMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelLock}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                {t('studentTests.cancel')}
              </button>
              <button
                onClick={confirmLock}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg transition-all"
              >
                {t('studentTests.yesLockIt')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Giant Lock Overlay */}
      {showLockOverlay && (
        <div className={`lock-overlay ${overlayFadingOut ? 'fade-out' : 'fade-in'}`}>
          <div className={`giant-lock-container ${lockOverlayType === 'lock' ? 'locking' : ''}`}>
            <FontAwesomeIcon
              icon={lockOverlayType === 'lock' ? faLock : faLockOpen}
              className={lockOverlayType === 'lock' ? 'big-lock-closing' : 'big-lock-opening'}
            />
          </div>
        </div>
      )}

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor/students')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('studentTests.backToStudents')}</span>
          </button>

          {/* Page Header */}
          <div className="mb-8 animate-fadeInUp">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                    <FontAwesomeIcon icon={faUserGraduate} />
                  </div>
                  <button
                    onClick={() => navigate(`/tutor/student/${studentId}/profile`)}
                    className="px-4 py-2 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Profile
                  </button>
                </div>
                <div className="flex-1">
                  {student?.name && (
                    <p className="text-gray-600 mb-3">{student.email}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                      <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                      {testType}
                    </span>
                    <span className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                      {t('studentTests.testsAssigned', { count: assignments.length })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 animate-fadeInUp">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Scoring Info Note */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 animate-fadeInUp">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-xl mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 mb-2">{t('studentTests.scoringInfo.title')}</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {t('studentTests.scoringInfo.scoreDefinition')}</li>
                  <li>• {t('studentTests.scoringInfo.percentageDefinition')}</li>
                  <li>• {t('studentTests.scoringInfo.passDefinition')}</li>
                  <li>• {t('studentTests.scoringInfo.failDefinition')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Note: Tests are now auto-assigned when student visits this page */}

          {/* Tests List */}
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-fadeInUp">
              <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {t('studentTests.noTestsType', { testType })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const grouped = groupTestsBySection(assignments);
                const sections = Object.keys(grouped);
                const sortedSections = getSortedSections(sections, sectionOrder);

                return sortedSections.map((section, sectionIndex) => {
                  const sectionTests = grouped[section];
                  const isExpanded = expandedSections.has(section);
                  // Count tests with results (regardless of status)
                  const sectionCompleted = sectionTests.filter(t => t.correct_count !== null && t.total_questions !== null).length;
                  const sectionProgress = sectionTests.length > 0
                    ? Math.round((sectionCompleted / sectionTests.length) * 100)
                    : 0;

                  return (
                    <div
                      key={section}
                      className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-brand-green animate-fadeInUp"
                      style={{ animationDelay: `${sectionIndex * 0.05}s` }}
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FontAwesomeIcon
                            icon={isExpanded ? faChevronDown : faChevronRight}
                            className="text-brand-green"
                          />
                          <h3 className="text-xl font-bold text-brand-dark">{translatedSections[section] || section}</h3>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Show percentage badges for each completed test */}
                          {(() => {
                            const completedTests = sectionTests
                              .filter(t => t.correct_count !== null && t.total_questions !== null)
                              .sort((a, b) => {
                                // Sort: Training first, then Assessments, both by test_number
                                const aIsTraining = a.exercise_type.toLowerCase().includes('training');
                                const bIsTraining = b.exercise_type.toLowerCase().includes('training');

                                if (aIsTraining && !bIsTraining) return -1; // Training before Assessment
                                if (!aIsTraining && bIsTraining) return 1;  // Assessment after Training

                                return a.test_number - b.test_number; // Same type: sort by number
                              });

                            const trainingTests = completedTests.filter(t => t.exercise_type.toLowerCase().includes('training'));
                            const simulazioniTests = completedTests.filter(t => t.exercise_type.toLowerCase().includes('simulazion'));
                            const assessmentTests = completedTests.filter(t =>
                              !t.exercise_type.toLowerCase().includes('training') &&
                              !t.exercise_type.toLowerCase().includes('simulazion')
                            );

                            // Find the last (highest test_number) simulazione
                            const lastSimulazioneNumber = simulazioniTests.length > 0
                              ? Math.max(...simulazioniTests.map(t => t.test_number))
                              : null;

                            return completedTests.map((test, idx) => {
                              const percentage = Math.round((test.correct_count! / test.total_questions!) * 100);
                              const isPassing = percentage >= 75;
                              const isTraining = test.exercise_type.toLowerCase().includes('training');
                              const isSimulazioni = test.exercise_type.toLowerCase().includes('simulazion');
                              const isAssessment = !isTraining && !isSimulazioni;

                              // Only highlight the LAST simulazione
                              const isLastSimulazione = isSimulazioni && test.test_number === lastSimulazioneNumber;

                              // Label logic:
                              // - If only 1 training, use "T", otherwise "T1", "T2"...
                              // - If only 1 simulazioni, use "S", otherwise "S1", "S2"...
                              // - If only 1 assessment, use "A", otherwise "A1", "A2"...
                              let label = '';
                              if (isTraining) {
                                label = trainingTests.length > 1 ? `T${test.test_number}` : 'T';
                              } else if (isSimulazioni) {
                                label = simulazioniTests.length > 1 ? `S${test.test_number}` : 'S';
                              } else {
                                label = assessmentTests.length > 1 ? `A${test.test_number}` : 'A';
                              }

                              return (
                                <span
                                  key={test.id}
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    isAssessment || isLastSimulazione
                                      ? isPassing
                                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-400 ring-2 ring-purple-200'
                                        : 'bg-orange-100 text-orange-700 border-2 border-orange-400 ring-2 ring-orange-200'
                                      : isPassing
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                  }`}
                                  title={test.test_name}
                                >
                                  {label}: {percentage}%
                                </span>
                              );
                            });
                          })()}

                          <span className="text-sm text-gray-600 ml-auto">
                            {sectionCompleted}/{sectionTests.length}
                          </span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-brand-green to-green-600 h-2 rounded-full"
                              style={{ width: `${sectionProgress}%` }}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Section Content */}
                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-3">
                          {sectionTests
                            .sort((a, b) => {
                              // Training first, then Assessment Monotematico
                              const aIsTraining = a.exercise_type.toLowerCase().includes('training');
                              const bIsTraining = b.exercise_type.toLowerCase().includes('training');

                              if (aIsTraining && !bIsTraining) return -1;
                              if (!aIsTraining && bIsTraining) return 1;

                              // Within same exercise type, sort by test number
                              if (a.exercise_type !== b.exercise_type) {
                                return a.exercise_type.localeCompare(b.exercise_type);
                              }

                              return a.test_number - b.test_number;
                            })
                            .map((assignment, index) => {
                            const statusStyle = getStatusStyles(assignment.status, assignment.completion_status);
                            const isUnlocking = unlocking === assignment.id;
                            const isLocking = locking === assignment.id;

                            return (
                              <div
                                key={assignment.id}
                                className={`bg-gray-50 rounded-xl border-2 ${statusStyle.border} p-4 hover:shadow-lg transition-all duration-300 relative ${isUnlocking || isLocking ? 'card-shake' : ''}`}
                              >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                  {/* Left Section - Test Info */}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                      <FontAwesomeIcon
                                        icon={statusStyle.icon}
                                        className={`text-2xl ${statusStyle.iconColor}`}
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h3 className="text-lg font-bold text-brand-dark">
                                            {assignment.exercise_type} {assignment.test_number}
                                          </h3>
                                          {/* PDF/Interactive Badge */}
                                          <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${
                                              assignment.question_format === 'interactive'
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : assignment.question_format === 'mixed'
                                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                                            }`}
                                          >
                                            {assignment.question_format === 'interactive'
                                              ? '🎮 Interactive'
                                              : assignment.question_format === 'mixed'
                                              ? '🔄 Mixed'
                                              : '📄 PDF'}
                                          </span>
                                        </div>
                                        <span className={`text-sm font-semibold ${statusStyle.text}`}>
                                          {statusStyle.label}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Test Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                        <span>{t('studentTests.duration')}: {assignment.duration_minutes} {t('studentTests.min')}</span>
                                      </div>
                                      {assignment.assigned_at && (
                                        <div className="flex items-center gap-2">
                                          <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                                          <span>{t('studentTests.assignedAt')}: {formatDate(assignment.assigned_at)}</span>
                                        </div>
                                      )}
                                      {assignment.start_time && (
                                        <div className="flex items-center gap-2">
                                          <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                                          <span>{t('studentTests.started')}: {formatDate(assignment.start_time)}</span>
                                        </div>
                                      )}
                                      {assignment.completed_at && (
                                        <div className="flex items-center gap-2">
                                          <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                                          <span>{t('studentTests.completedAt')}: {formatDate(assignment.completed_at)}</span>
                                        </div>
                                      )}
                                      {/* Show correct/total for all completed tests */}
                                      {assignment.correct_count !== null && assignment.total_questions !== null && (
                                        <div className="flex items-center gap-2">
                                          <div className="font-bold text-brand-dark">
                                            {t('studentTests.score')}: {assignment.correct_count}/{assignment.total_questions} ({Math.round((assignment.correct_count / assignment.total_questions) * 100)}%)
                                          </div>
                                          {(() => {
                                            const percentage = Math.round((assignment.correct_count / assignment.total_questions) * 100);
                                            const isPassing = percentage >= 75;
                                            return (
                                              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                isPassing
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                              }`}>
                                                {isPassing ? '✓ PASS' : '✗ FAIL'}
                                              </span>
                                            );
                                          })()}
                                        </div>
                                      )}
                                      {assignment.test_type.toUpperCase() !== 'BOCCONI' && assignment.test_type.toUpperCase() !== 'BOCCONI LAW' && assignment.score !== null && (
                                        <div className="flex items-center gap-2 font-bold text-brand-green">
                                          <FontAwesomeIcon icon={faPercent} />
                                          <span>{t('studentTests.score')}: {assignment.score}%</span>
                                        </div>
                                      )}
                                      {assignment.status !== 'locked' && (
                                        <div className="flex items-center gap-2 font-semibold text-blue-600">
                                          <span>
                                            📝 {t('studentTests.attempt')} {assignment.current_attempt}
                                            {assignment.total_attempts > 0 && ` ${t('studentTests.of')} ${assignment.total_attempts + 1}`}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right Section - Actions */}
                                  <div className="flex flex-row md:flex-col gap-2 justify-end">
                                    {assignment.status === 'locked' && (
                                      <button
                                        onClick={() => handleUnlock(assignment.id)}
                                        disabled={isUnlocking}
                                        className="px-4 py-2 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isUnlocking ? (
                                          <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                            {t('studentTests.unlocking')}
                                          </>
                                        ) : (
                                          <>
                                            <FontAwesomeIcon icon={faLockOpen} className="mr-2" />
                                            {t('studentTests.unlock')}
                                          </>
                                        )}
                                      </button>
                                    )}
                                    {assignment.status !== 'locked' && (
                                      <button
                                        onClick={() => showLockConfirmation(assignment.id)}
                                        disabled={isLocking}
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isLocking ? (
                                          <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                            {t('studentTests.locking')}
                                          </>
                                        ) : (
                                          <>
                                            <FontAwesomeIcon icon={faLock} className="mr-2" />
                                            {t('studentTests.lock')}
                                          </>
                                        )}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => navigate(`/tutor/test-results/${assignment.id}`)}
                                      disabled={assignment.total_attempts === 0}
                                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        assignment.total_attempts === 0
                                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                      }`}
                                    >
                                      <FontAwesomeIcon icon={faEye} className="mr-2" />
                                      {t('studentTests.viewResults')}
                                    </button>
                                    {/* Start Test Button - show for all tests (guided mode available for locked/completed) */}
                                    <button
                                      onClick={() => openStartTestModal(assignment)}
                                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                                    >
                                      <FontAwesomeIcon icon={faPlay} className="mr-2" />
                                      {t('studentTests.startTest', 'Start Test')}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Start Test Configuration Modal */}
      {showStartTestModal && selectedTestForStart && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowStartTestModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{t('studentTests.startTestConfig', 'Start Test')}</h2>
                  <p className="text-white/90 text-sm mt-1">
                    {selectedTestForStart.exercise_type} {selectedTestForStart.test_number}
                  </p>
                </div>
                <button
                  onClick={() => setShowStartTestModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <span className="text-2xl font-bold">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Test Mode Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('studentTests.whoTakesTest', 'Who is taking the test?')}
                </label>
                <div className="space-y-3">
                  {/* Student mode - disabled for locked/completed tests */}
                  {(() => {
                    const isLocked = selectedTestForStart?.status === 'locked' || selectedTestForStart?.completion_status?.startsWith('completed');
                    return (
                      <label className={`flex items-start gap-3 p-4 border-2 rounded-xl transition-colors ${
                        isLocked
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                          : 'border-gray-200 cursor-pointer hover:border-purple-500'
                      }`}>
                        <input
                          type="radio"
                          name="test_mode"
                          value="student"
                          checked={startTestMode === 'student'}
                          onChange={() => !isLocked && setStartTestMode('student')}
                          disabled={isLocked}
                          className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                            <span className="font-semibold text-gray-900">{t('studentTests.studentMode', 'Student')}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {isLocked
                              ? t('studentTests.studentModeDisabled', 'Test is locked - only guided mode available')
                              : t('studentTests.studentModeDesc', 'Student takes the test independently (normal mode)')}
                          </div>
                        </div>
                      </label>
                    );
                  })()}

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-500 transition-colors">
                    <input
                      type="radio"
                      name="test_mode"
                      value="guided"
                      checked={startTestMode === 'guided'}
                      onChange={() => setStartTestMode('guided')}
                      className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faChalkboardTeacher} className="text-purple-600" />
                        <span className="font-semibold text-gray-900">{t('studentTests.guidedMode', 'Guided')}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {t('studentTests.guidedModeDesc', 'Tutor guides student through the test')}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Guided Mode Options */}
              {startTestMode === 'guided' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {/* Timed Option */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('studentTests.timeOption', 'Time limit')}
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setGuidedTimed(true)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          guidedTimed
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FontAwesomeIcon icon={faStopwatch} className="mr-2" />
                        {t('studentTests.timed', 'Timed')}
                      </button>
                      <button
                        onClick={() => setGuidedTimed(false)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          !guidedTimed
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FontAwesomeIcon icon={faInfinity} className="mr-2" />
                        {t('studentTests.noTimeLimit', 'No limit')}
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStartTestModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  {t('studentTests.cancel')}
                </button>
                <button
                  onClick={handleStartTest}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  {t('studentTests.startNow', 'Start Now')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
