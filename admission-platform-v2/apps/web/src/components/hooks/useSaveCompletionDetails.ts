import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { supabase } from '@/lib/supabase';
import { syncTestResultsToExternal } from '@/lib/api/externalStudents';
import { calculateResultsForExternalSync } from '@/lib/utils/externalSyncCalculator';
import type { AttemptData, TestConfig, StudentAnswer, Question } from '@/types/test';

interface DeviceDiagnostics {
  connection: { status: 'checking' | 'good' | 'warning' | 'error'; value?: number };
  performance: { status: 'checking' | 'good' | 'warning' | 'error'; value?: number };
  overall: 'checking' | 'ready' | 'warning' | 'error';
}

export interface UseSaveCompletionDetailsParams {
  assignmentId: string | undefined;
  currentAttempt: number;
  config: TestConfig | null;
  deviceDiagnostics: DeviceDiagnostics | null;
  testStartTime: Date | null;
  sectionStartTime: Date | null;
  currentSection: string;
  sectionTimes: Record<string, number>;
  pauseEvents: any[];
  sections: string[];
  selectedQuestions: Question[];
  answers: Record<string, StudentAnswer>;
  sectionThetasRef: MutableRefObject<Record<string, { theta: number; se: number }>>;
}

// Row shapes we actually read from the DB (only the selected columns)
interface AssignmentRow {
  completion_details: Record<string, unknown> | null;
  start_time: string | null;
  current_attempt: number;
  total_attempts: number;
}

interface ProfileRow {
  external_student_id: number | null;
}

interface AssignmentWithTestRow {
  '2V_tests': {
    test_type: string;
    exercise_type: string;
    test_number: number;
    section: string;
  } | null;
}

export function useSaveCompletionDetails(params: UseSaveCompletionDetailsParams) {
  const {
    assignmentId, currentAttempt, config, deviceDiagnostics,
    testStartTime, sectionStartTime, currentSection,
    sectionTimes, pauseEvents, sections, selectedQuestions,
    answers, sectionThetasRef,
  } = params;

  const saveCompletionDetails = useCallback(async (
    status: 'completed' | 'incomplete' | 'annulled',
    reason: 'submitted' | 'time_expired' | 'fullscreen_exit' | 'multiple_screens' | 'browser_closed',
    annulmentReason?: string
  ): Promise<boolean> => {
    // Wraps any thenable (including Supabase builders) with a timeout
    const withTimeout = <T,>(thenable: PromiseLike<T>, ms: number, label: string): Promise<T> =>
      Promise.race([
        Promise.resolve(thenable),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        ),
      ]);

    try {
      const { data: currentAssignment, error: _fetchError } = await withTimeout(
        supabase
          .from('2V_test_assignments')
          .select('completion_details, start_time, current_attempt, total_attempts')
          .eq('id', assignmentId!)
          .single(),
        10000,
        'Fetch assignment'
      );

      const assignment = currentAssignment as AssignmentRow | null;
      const existingDetails = (assignment?.completion_details as { attempts?: AttemptData[] } | null) || { attempts: [] };
      const attempts: AttemptData[] = Array.isArray(existingDetails.attempts) ? existingDetails.attempts : [];

      const newAttempt: AttemptData = {
        attempt_number: currentAttempt,
        status,
        reason,
        started_at: assignment?.start_time || testStartTime?.toISOString() || new Date().toISOString(),
        completed_at: new Date().toISOString(),
        browser_info: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString(),
        device_diagnostics: deviceDiagnostics ? {
          connection_latency_ms: deviceDiagnostics.connection.value ?? null,
          connection_status: deviceDiagnostics.connection.status === 'checking' ? 'warning' : deviceDiagnostics.connection.status,
          performance_benchmark_ms: deviceDiagnostics.performance.value ?? null,
          performance_status: deviceDiagnostics.performance.status === 'checking' ? 'warning' : deviceDiagnostics.performance.status,
          overall_status: deviceDiagnostics.overall === 'checking' ? 'warning' : deviceDiagnostics.overall,
          tested_at: new Date().toISOString()
        } : undefined
      };

      if (annulmentReason) {
        newAttempt.annulment_reason = annulmentReason;
      }

      if (config) {
        newAttempt.test_config = {
          navigation_mode: config.navigation_mode,
          navigation_between_sections: config.navigation_between_sections,
          time_per_section: config.time_per_section,
          total_time_minutes: config.total_time_minutes,
          pause_mode: config.pause_mode,
          pause_duration_minutes: config.pause_duration_minutes,
          max_pauses: config.max_pauses
        };
      }

      newAttempt.pause_events = pauseEvents;
      newAttempt.sections_completed = sections;

      const finalSectionTimes = { ...sectionTimes };
      if (sectionStartTime && currentSection) {
        const currentSectionTime = Math.floor((new Date().getTime() - sectionStartTime.getTime()) / 1000);
        finalSectionTimes[currentSection] = (finalSectionTimes[currentSection] || 0) + currentSectionTime;
      }
      newAttempt.section_times = finalSectionTimes;

      newAttempt.total_questions = selectedQuestions.length;
      newAttempt.questions_answered = Object.keys(answers).filter(qId => {
        const ans = answers[qId];
        return ans && ans.answer !== null && ans.answer !== undefined;
      }).length;

      if (config?.test_type === 'GMAT' && Object.keys(sectionThetasRef.current).length > 0) {
        newAttempt.gmat_scoring = {
          section_thetas: sectionThetasRef.current,
          algorithm_version: '1.1.0',
        };
      }

      const existingAttemptIndex = attempts.findIndex(
        (a: AttemptData) => a.attempt_number === currentAttempt
      );

      if (existingAttemptIndex >= 0) {
        attempts[existingAttemptIndex] = { ...attempts[existingAttemptIndex], ...newAttempt };
      } else {
        attempts.push(newAttempt);
      }

      const newTotalAttempts = status === 'incomplete' ? currentAttempt - 1 : currentAttempt;

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
      const completionStatusText = `${status} ${dateStr} at ${timeStr}`;

      const finalStatus = status === 'completed' ? 'locked' : status;

      const { error } = await withTimeout(
        supabase
          .from('2V_test_assignments')
          .update({
            status: finalStatus,
            completion_status: completionStatusText,
            completed_at: new Date().toISOString(),
            completion_details: { attempts } as any,
            total_attempts: newTotalAttempts,
            results_viewable_by_student: false,
          })
          .eq('id', assignmentId!)
          .select(),
        10000,
        'Update assignment'
      );

      if (error) {
        throw error;
      }

      if (status === 'completed') {
        try {
          const { data: { user } } = await withTimeout(supabase.auth.getUser(), 5000, 'Get user');
          if (user) {
            const { data: profileData } = await withTimeout(
              supabase
                .from('2V_profiles')
                .select('external_student_id')
                .eq('auth_uid', user.id)
                .single(),
              5000,
              'Get profile'
            );

            const profile = profileData as ProfileRow | null;

            if (profile?.external_student_id) {
              const totalQuestions = selectedQuestions.length;

              const { data: assignmentWithTestData } = await withTimeout(
                supabase
                  .from('2V_test_assignments')
                  .select('2V_tests(test_type, exercise_type, test_number, section)')
                  .eq('id', assignmentId!)
                  .single(),
                5000,
                'Get test info'
              );

              const testInfo = (assignmentWithTestData as AssignmentWithTestRow | null)?.['2V_tests'];
              const testType = testInfo?.test_type || 'Unknown';
              const section = testInfo?.section || '';
              const exerciseType = testInfo?.exercise_type || '';
              const testNumber = testInfo?.test_number || '';

              let testName = testType;
              if (section && section !== 'Multi-topic') testName += ` - ${section}`;
              if (exerciseType) testName += ` - ${exerciseType}`;
              if (testNumber) testName += ` ${testNumber}`;

              console.log('📊 [EXTERNAL SYNC] Calculating results for external platform');
              const results = await withTimeout(
                calculateResultsForExternalSync(assignmentId!, currentAttempt, totalQuestions),
                10000,
                'Calculate results'
              );

              await withTimeout(syncTestResultsToExternal({
                externalStudentId: profile.external_student_id,
                testType,
                testName,
                completedAt: new Date().toISOString(),
                attemptNumber: currentAttempt,
                status,
                correct: results.correct,
                wrong: results.wrong,
                blank: results.blank,
                totalQuestions: results.totalQuestions
              }), 10000, 'Sync to external');
            }
          }
        } catch (syncError) {
          console.error('⚠️ Failed to sync results to external database:', syncError);
        }
      }

      return true;
    } catch (err) {
      return false;
    }
  }, [assignmentId, currentAttempt, config, deviceDiagnostics, testStartTime, sectionStartTime,
      currentSection, sectionTimes, pauseEvents, sections, selectedQuestions, answers, sectionThetasRef]);

  return { saveCompletionDetails };
}
