/**
 * GMAT Progress API Functions
 * Manages student GMAT preparation progress including cycle and seen questions
 */

import { supabase } from '../supabase';
// Import from full generated Supabase types
import type { Database } from '../../../database.types';
import { GmatScoringAlgorithm, type GmatScoreResult } from '../algorithms/gmatScoringAlgorithm';

// Types
export type GmatCycle = 'Foundation' | 'Development' | 'Excellence';

export const GMAT_CYCLES: GmatCycle[] = ['Foundation', 'Development', 'Excellence'];

type GmatProgressRow = Database['public']['Tables']['2V_gmat_student_progress']['Row'];

export interface GmatProgress {
  id: string;
  student_id: string;
  gmat_cycle: GmatCycle;
  seen_question_ids: string[];
  simulation_unlocked: boolean;
  section_qr_locked: boolean;
  section_di_locked: boolean;
  section_vr_locked: boolean;
  initial_assessment_visible: boolean;
  initial_assessment_results_visible: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Convert database row to GmatProgress interface
 */
function toGmatProgress(row: GmatProgressRow): GmatProgress {
  // Type extension for columns added in migrations 038, 039, and 040
  const extendedRow = row as GmatProgressRow & {
    simulation_unlocked?: boolean;
    section_qr_locked?: boolean;
    section_di_locked?: boolean;
    section_vr_locked?: boolean;
    initial_assessment_visible?: boolean;
    initial_assessment_results_visible?: boolean;
  };
  return {
    id: row.id,
    student_id: row.student_id,
    gmat_cycle: row.gmat_cycle as GmatCycle,
    seen_question_ids: row.seen_question_ids || [],
    simulation_unlocked: extendedRow.simulation_unlocked ?? false,
    section_qr_locked: extendedRow.section_qr_locked ?? false,
    section_di_locked: extendedRow.section_di_locked ?? false,
    section_vr_locked: extendedRow.section_vr_locked ?? false,
    initial_assessment_visible: extendedRow.initial_assessment_visible ?? true,
    initial_assessment_results_visible: extendedRow.initial_assessment_results_visible ?? true,
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
  };
}

/**
 * Initialize GMAT preparation for a student
 * Creates a new progress record with the specified cycle
 *
 * @param studentId - The student's profile ID
 * @param cycle - Initial GMAT cycle (Foundation, Development, or Excellence)
 * @returns The created GmatProgress record
 * @throws Error if initialization fails or student already has a record
 */
export async function initializeGMATPreparation(
  studentId: string,
  cycle: GmatCycle
): Promise<GmatProgress> {
  // Check if student already has a GMAT progress record
  const existing = await getStudentGMATProgress(studentId);
  if (existing) {
    throw new Error('Student already has GMAT preparation initialized. Use updateStudentGMATCycle to change the cycle.');
  }

  const { data, error } = await supabase
    .from('2V_gmat_student_progress')
    .insert({
      student_id: studentId,
      gmat_cycle: cycle,
      seen_question_ids: [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error initializing GMAT preparation:', error);
    throw new Error(`Failed to initialize GMAT preparation: ${error.message}`);
  }

  return toGmatProgress(data);
}

/**
 * Get student's current GMAT progress
 *
 * @param studentId - The student's profile ID
 * @returns The student's GmatProgress or null if not initialized
 */
export async function getStudentGMATProgress(
  studentId: string
): Promise<GmatProgress | null> {
  const { data, error } = await supabase
    .from('2V_gmat_student_progress')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching GMAT progress:', error);
    throw new Error(`Failed to fetch GMAT progress: ${error.message}`);
  }

  return data ? toGmatProgress(data) : null;
}

/**
 * Update student's GMAT cycle (promotion or demotion)
 *
 * @param studentId - The student's profile ID
 * @param newCycle - The new GMAT cycle
 * @throws Error if update fails or student has no progress record
 */
export async function updateStudentGMATCycle(
  studentId: string,
  newCycle: GmatCycle
): Promise<void> {
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      gmat_cycle: newCycle,
    })
    .eq('student_id', studentId);

  if (error) {
    console.error('Error updating GMAT cycle:', error);
    throw new Error(`Failed to update GMAT cycle: ${error.message}`);
  }
}

/**
 * Unlock GMAT simulations for a student (tutor action)
 * This allows the student to access Mock Simulation tests
 *
 * @param studentId - The student's profile ID
 * @throws Error if update fails or student has no progress record
 */
export async function unlockSimulation(studentId: string): Promise<void> {
  // Note: simulation_unlocked column added in migration 038
  // Type cast needed until database.types.ts is regenerated
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      simulation_unlocked: true,
    } as Record<string, unknown>)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error unlocking simulation:', error);
    throw new Error(`Failed to unlock simulation: ${error.message}`);
  }
}

/**
 * Lock GMAT simulations for a student (tutor action)
 * This prevents the student from accessing Mock Simulation tests
 *
 * @param studentId - The student's profile ID
 * @throws Error if update fails or student has no progress record
 */
export async function lockSimulation(studentId: string): Promise<void> {
  // Note: simulation_unlocked column added in migration 038
  // Type cast needed until database.types.ts is regenerated
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      simulation_unlocked: false,
    } as Record<string, unknown>)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error locking simulation:', error);
    throw new Error(`Failed to lock simulation: ${error.message}`);
  }
}

/**
 * Lock a section assessment for a student (tutor action)
 * This prevents the student from starting/retaking that section's assessment
 *
 * @param studentId - The student's profile ID
 * @param section - The section to lock (QR, DI, or VR)
 * @throws Error if update fails or student has no progress record
 */
export async function lockSectionAssessment(studentId: string, section: GmatSection): Promise<void> {
  // Note: section_*_locked columns added in migration 039
  // Type cast needed until database.types.ts is regenerated
  const columnName = `section_${section.toLowerCase()}_locked`;
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      [columnName]: true,
    } as Record<string, unknown>)
    .eq('student_id', studentId);

  if (error) {
    console.error(`Error locking ${section} section assessment:`, error);
    throw new Error(`Failed to lock ${section} assessment: ${error.message}`);
  }
}

/**
 * Unlock a section assessment for a student (tutor action)
 * This allows the student to start/retake that section's assessment
 *
 * @param studentId - The student's profile ID
 * @param section - The section to unlock (QR, DI, or VR)
 * @throws Error if update fails or student has no progress record
 */
export async function unlockSectionAssessment(studentId: string, section: GmatSection): Promise<void> {
  // Note: section_*_locked columns added in migration 039
  // Type cast needed until database.types.ts is regenerated
  const columnName = `section_${section.toLowerCase()}_locked`;
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      [columnName]: false,
    } as Record<string, unknown>)
    .eq('student_id', studentId);

  if (error) {
    console.error(`Error unlocking ${section} section assessment:`, error);
    throw new Error(`Failed to unlock ${section} assessment: ${error.message}`);
  }
}

/**
 * Show the initial assessment section for a student (tutor action)
 *
 * @param studentId - The student's profile ID
 * @throws Error if update fails or student has no progress record
 */
export async function showInitialAssessment(studentId: string): Promise<void> {
  // Note: initial_assessment_visible column added in migration 040
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      initial_assessment_visible: true,
    } as Record<string, unknown>)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error showing initial assessment:', error);
    throw new Error(`Failed to show initial assessment: ${error.message}`);
  }
}

/**
 * Hide the initial assessment section for a student (tutor action)
 *
 * @param studentId - The student's profile ID
 * @throws Error if update fails or student has no progress record
 */
export async function hideInitialAssessment(studentId: string): Promise<void> {
  // Note: initial_assessment_visible column added in migration 040
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      initial_assessment_visible: false,
    } as Record<string, unknown>)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error hiding initial assessment:', error);
    throw new Error(`Failed to hide initial assessment: ${error.message}`);
  }
}

/**
 * Show the initial assessment results for a student (tutor action)
 *
 * @param studentId - The student's profile ID
 * @throws Error if update fails or student has no progress record
 */
export async function showInitialAssessmentResults(studentId: string): Promise<void> {
  // Note: initial_assessment_results_visible column added in migration 040
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      initial_assessment_results_visible: true,
    } as Record<string, unknown>)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error showing initial assessment results:', error);
    throw new Error(`Failed to show initial assessment results: ${error.message}`);
  }
}

/**
 * Hide the initial assessment results for a student (tutor action)
 *
 * @param studentId - The student's profile ID
 * @throws Error if update fails or student has no progress record
 */
export async function hideInitialAssessmentResults(studentId: string): Promise<void> {
  // Note: initial_assessment_results_visible column added in migration 040
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      initial_assessment_results_visible: false,
    } as Record<string, unknown>)
    .eq('student_id', studentId);

  if (error) {
    console.error('Error hiding initial assessment results:', error);
    throw new Error(`Failed to hide initial assessment results: ${error.message}`);
  }
}

/**
 * Add questions to the seen list
 * Called after test completion to track which questions the student has seen
 *
 * @param studentId - The student's profile ID
 * @param questionIds - Array of question IDs to add to seen list
 */
export async function addSeenQuestions(
  studentId: string,
  questionIds: string[]
): Promise<void> {
  if (!questionIds || questionIds.length === 0) {
    return;
  }

  // Get current seen questions
  const progress = await getStudentGMATProgress(studentId);
  if (!progress) {
    console.warn('Cannot add seen questions: student has no GMAT progress record');
    return;
  }

  // Merge new question IDs with existing ones (avoid duplicates)
  const existingIds = new Set(progress.seen_question_ids);
  questionIds.forEach(id => existingIds.add(id));
  const updatedIds = Array.from(existingIds);

  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      seen_question_ids: updatedIds,
    })
    .eq('student_id', studentId);

  if (error) {
    console.error('Error adding seen questions:', error);
    throw new Error(`Failed to add seen questions: ${error.message}`);
  }
}

/**
 * Get which of the provided question IDs the student has already seen
 *
 * @param studentId - The student's profile ID
 * @param questionIds - Array of question IDs to check
 * @returns Array of question IDs that have been seen
 */
export async function getSeenQuestions(
  studentId: string,
  questionIds: string[]
): Promise<string[]> {
  const progress = await getStudentGMATProgress(studentId);
  if (!progress) {
    return [];
  }

  const seenSet = new Set(progress.seen_question_ids);
  return questionIds.filter(id => seenSet.has(id));
}

/**
 * Check if a student has GMAT preparation initialized
 *
 * @param studentId - The student's profile ID
 * @returns true if the student has a GMAT progress record
 */
export async function hasGMATPreparation(studentId: string): Promise<boolean> {
  const progress = await getStudentGMATProgress(studentId);
  return progress !== null;
}

/**
 * Get the count of seen questions for a student
 *
 * @param studentId - The student's profile ID
 * @returns The number of questions the student has seen
 */
export async function getSeenQuestionsCount(studentId: string): Promise<number> {
  const progress = await getStudentGMATProgress(studentId);
  return progress?.seen_question_ids?.length || 0;
}

/**
 * Clear all seen questions for a student (useful for resetting progress)
 *
 * @param studentId - The student's profile ID
 */
export async function clearSeenQuestions(studentId: string): Promise<void> {
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .update({
      seen_question_ids: [],
    })
    .eq('student_id', studentId);

  if (error) {
    console.error('Error clearing seen questions:', error);
    throw new Error(`Failed to clear seen questions: ${error.message}`);
  }
}

/**
 * Delete a student's GMAT progress record entirely
 * Use with caution - this removes all GMAT tracking for the student
 *
 * @param studentId - The student's profile ID
 */
export async function deleteGMATProgress(studentId: string): Promise<void> {
  const { error } = await supabase
    .from('2V_gmat_student_progress')
    .delete()
    .eq('student_id', studentId);

  if (error) {
    console.error('Error deleting GMAT progress:', error);
    throw new Error(`Failed to delete GMAT progress: ${error.message}`);
  }
}

/**
 * Get GMAT progress for multiple students at once
 * Useful for tutor dashboards
 *
 * @param studentIds - Array of student profile IDs
 * @returns Map of studentId to GmatProgress (or null if not initialized)
 */
export async function getMultipleStudentsGMATProgress(
  studentIds: string[]
): Promise<Map<string, GmatProgress | null>> {
  const { data, error } = await supabase
    .from('2V_gmat_student_progress')
    .select('*')
    .in('student_id', studentIds);

  if (error) {
    console.error('Error fetching multiple GMAT progress records:', error);
    throw new Error(`Failed to fetch GMAT progress: ${error.message}`);
  }

  const progressMap = new Map<string, GmatProgress | null>();

  // Initialize all requested IDs with null
  studentIds.forEach(id => progressMap.set(id, null));

  // Fill in the actual progress data
  data?.forEach(row => {
    progressMap.set(row.student_id, toGmatProgress(row));
  });

  return progressMap;
}

// ============================================
// Legacy Initial Assessment Functions
// ============================================

export interface LegacyAssessmentResult {
  id: string;
  test_id: string;
  student_id: string;
  status: string;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  completed_at: string | null;
  test: {
    id: string;
    test_type: string;
    section: string;
    exercise_type: string;
    test_number: number;
  } | null;
}

/**
 * Get student's legacy Initial Assessment (Assessment Iniziale) result
 * This queries the old 2V_test_assignments table for GMAT assessments
 *
 * @param studentId - The student's profile ID
 * @returns The legacy assessment result or null if not found/completed
 */
export async function getLegacyInitialAssessment(
  studentId: string
): Promise<LegacyAssessmentResult | null> {
  // First get the GMAT Initial Assessment test ID
  const { data: testData, error: testError } = await supabase
    .from('2V_tests')
    .select('id, test_type, section, exercise_type, test_number')
    .eq('test_type', 'GMAT')
    .eq('exercise_type', 'Assessment Iniziale')
    .maybeSingle();

  if (testError || !testData) {
    // Test doesn't exist - this is fine, just means no legacy assessment
    return null;
  }

  // Now get the student's assignment for this test
  // Note: score, max_score, percentage are stored in completion_details JSON
  const { data: assignmentData, error: assignmentError } = await supabase
    .from('2V_test_assignments')
    .select(`
      id,
      test_id,
      student_id,
      status,
      completion_details,
      completed_at
    `)
    .eq('student_id', studentId)
    .eq('test_id', testData.id)
    .maybeSingle();

  if (assignmentError) {
    console.error('Error fetching legacy initial assessment:', assignmentError);
    return null;
  }

  if (!assignmentData) return null;

  // Extract score info from completion_details JSON
  const details = assignmentData.completion_details as {
    score?: number;
    max_score?: number;
    percentage?: number;
  } | null;

  return {
    id: assignmentData.id,
    test_id: assignmentData.test_id,
    student_id: assignmentData.student_id,
    status: assignmentData.status,
    score: details?.score ?? null,
    max_score: details?.max_score ?? null,
    percentage: details?.percentage ?? null,
    completed_at: assignmentData.completed_at,
    test: testData,
  };
}

// ============================================
// New Assessment Results Functions (Phase 8)
// ============================================

export type GmatAssessmentType = 'placement' | 'topic_assessment' | 'section_assessment' | 'mock' | 'training';

export interface GmatAssessmentResult {
  id: string;
  student_id: string;
  assessment_type: GmatAssessmentType;
  section: string | null;
  topic: string | null;
  score_raw: number;
  score_total: number;
  score_percentage: number;
  difficulty_breakdown: {
    easy?: { correct: number; total: number; unanswered?: number };
    medium?: { correct: number; total: number; unanswered?: number };
    hard?: { correct: number; total: number; unanswered?: number };
  } | null;
  time_spent_seconds: number | null;
  suggested_cycle: GmatCycle | null;
  assigned_cycle: GmatCycle | null;
  tutor_validated: boolean | null;
  validated_by: string | null;
  validated_at: string | null;
  tutor_notes: string | null;
  question_ids: string[] | null;
  completed_at: string | null;
  created_at: string | null;
  // Per-question answer data with timing
  answers_data?: Record<string, {
    answer: string | string[] | Record<string, string>;
    time_spent_seconds: number;
    is_correct: boolean;
    is_unanswered?: boolean;
  }> | null;
  // Bookmarked question IDs
  bookmarked_question_ids?: string[] | null;
  // Unanswered questions tracking
  unanswered_count?: number;
  unanswered_question_ids?: string[];
  // IRT scoring metadata (section assessments & simulations)
  metadata?: {
    gmat_section_score?: number;
    theta?: number;
    [key: string]: unknown;
  } | null;
}

/**
 * Get student's assessment results
 *
 * @param studentId - The student's profile ID
 * @param assessmentType - Optional filter by assessment type
 * @returns Array of assessment results
 */
export async function getStudentAssessmentResults(
  studentId: string,
  assessmentType?: GmatAssessmentType
): Promise<GmatAssessmentResult[]> {
  let query = supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('student_id', studentId)
    .order('completed_at', { ascending: false });

  if (assessmentType) {
    query = query.eq('assessment_type', assessmentType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching assessment results:', error);
    throw new Error(`Failed to fetch assessment results: ${error.message}`);
  }

  return (data || []).map(row => ({
    ...row,
    assessment_type: row.assessment_type as GmatAssessmentType,
    suggested_cycle: row.suggested_cycle as GmatCycle | null,
    assigned_cycle: row.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: row.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  }));
}

/**
 * Get student's most recent placement assessment result
 *
 * @param studentId - The student's profile ID
 * @returns The most recent placement result or null
 */
export async function getLatestPlacementResult(
  studentId: string
): Promise<GmatAssessmentResult | null> {
  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('student_id', studentId)
    .eq('assessment_type', 'placement')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching placement result:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    assessment_type: data.assessment_type as GmatAssessmentType,
    suggested_cycle: data.suggested_cycle as GmatCycle | null,
    assigned_cycle: data.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: data.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  };
}

/**
 * Get pending validations for a tutor
 * Returns all assessment results that haven't been validated yet
 *
 * @returns Array of pending assessment results
 */
export async function getPendingValidations(): Promise<GmatAssessmentResult[]> {
  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('tutor_validated', false)
    .not('suggested_cycle', 'is', null)
    .order('completed_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending validations:', error);
    throw new Error(`Failed to fetch pending validations: ${error.message}`);
  }

  return (data || []).map(row => ({
    ...row,
    assessment_type: row.assessment_type as GmatAssessmentType,
    suggested_cycle: row.suggested_cycle as GmatCycle | null,
    assigned_cycle: row.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: row.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  }));
}

// ============================================
// Placement Assessment Functions
// ============================================

/**
 * Placement Assessment Configuration
 * Based on assessment-strategy.md
 */
export const PLACEMENT_CONFIG = {
  totalQuestions: 45,
  questionsPerSection: 15,
  difficultyDistribution: {
    easy: 5,
    medium: 5,
    hard: 5,
  },
  timeMinutes: 90, // 1.5 hours
  sections: ['QR', 'DI', 'VR'] as const,
};

/**
 * Scoring thresholds for cycle assignment
 * Based on assessment-strategy.md
 */
export const PLACEMENT_SCORING = {
  foundationExtended: { min: 0, max: 17, percentage: { min: 0, max: 38 } },
  foundation: { min: 18, max: 25, percentage: { min: 40, max: 55 } },
  development: { min: 26, max: 33, percentage: { min: 58, max: 73 } },
  excellence: { min: 34, max: 45, percentage: { min: 76, max: 100 } },
};

/**
 * Calculate suggested cycle based on raw score
 */
export function calculateSuggestedCycle(rawScore: number, totalQuestions: number = 45): GmatCycle {
  const percentage = (rawScore / totalQuestions) * 100;

  if (percentage >= PLACEMENT_SCORING.excellence.percentage.min) {
    return 'Excellence';
  } else if (percentage >= PLACEMENT_SCORING.development.percentage.min) {
    return 'Development';
  } else {
    // Both foundationExtended and foundation map to Foundation cycle
    return 'Foundation';
  }
}

/**
 * Get questions for placement assessment
 * Fetches 15 questions per section (5 easy + 5 medium + 5 hard)
 * Excludes questions the student has already seen
 */
export async function getPlacementAssessmentQuestions(
  studentId: string
): Promise<{ questions: Array<{ id: string; section: string; difficulty: string }>; error?: string }> {
  // Get student's seen questions
  const progress = await getStudentGMATProgress(studentId);
  const seenIds = new Set(progress?.seen_question_ids || []);

  // Fetch questions from the GMAT question pool
  const { data: poolTest, error: poolError } = await supabase
    .from('2V_tests')
    .select('id')
    .eq('test_type', 'GMAT')
    .eq('exercise_type', 'Pool')
    .maybeSingle();

  if (poolError || !poolTest) {
    return { questions: [], error: 'GMAT question pool not found' };
  }

  // Fetch all questions from the pool using 2V_questions table
  const { data: allQuestions, error: questionsError } = await supabase
    .from('2V_questions')
    .select('id, section, difficulty')
    .eq('test_id', poolTest.id)
    .eq('is_active', true);

  if (questionsError || !allQuestions) {
    return { questions: [], error: 'Failed to fetch questions' };
  }

  // Group questions by section and difficulty, excluding seen questions
  const questionsBySection: Record<string, Record<string, Array<{ id: string; section: string; difficulty: string }>>> = {
    QR: { easy: [], medium: [], hard: [] },
    DI: { easy: [], medium: [], hard: [] },
    VR: { easy: [], medium: [], hard: [] },
  };

  // Map section names to codes
  const sectionMapping: Record<string, string> = {
    'Quantitative Reasoning': 'QR',
    'Data Insights': 'DI',
    'Verbal Reasoning': 'VR',
    'QR': 'QR',
    'DI': 'DI',
    'VR': 'VR',
  };

  for (const q of allQuestions) {
    if (seenIds.has(q.id)) continue;

    const sectionCode = sectionMapping[q.section] || q.section;
    const difficulty = (q.difficulty || 'medium').toLowerCase();

    if (questionsBySection[sectionCode] && questionsBySection[sectionCode][difficulty]) {
      questionsBySection[sectionCode][difficulty].push({
        id: q.id,
        section: sectionCode,
        difficulty,
      });
    }
  }

  // Select questions: 5 easy + 5 medium + 5 hard per section
  const selectedQuestions: Array<{ id: string; section: string; difficulty: string }> = [];

  for (const section of PLACEMENT_CONFIG.sections) {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const available = questionsBySection[section][difficulty];
      const needed = PLACEMENT_CONFIG.difficultyDistribution[difficulty];

      if (available.length < needed) {
        return {
          questions: [],
          error: `Not enough ${difficulty} questions for ${section}. Need ${needed}, have ${available.length}`,
        };
      }

      // Shuffle and select
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      selectedQuestions.push(...shuffled.slice(0, needed));
    }
  }

  // Shuffle all selected questions for the final order
  return {
    questions: selectedQuestions.sort(() => Math.random() - 0.5),
  };
}

/**
 * Save placement assessment result
 * This is called when a student completes the placement assessment
 */
export async function savePlacementAssessmentResult(
  studentId: string,
  scoreRaw: number,
  scoreTotal: number,
  difficultyBreakdown: GmatAssessmentResult['difficulty_breakdown'],
  questionIds: string[],
  timeSpentSeconds?: number,
  answersData?: Record<string, any>,
  bookmarkedQuestionIds?: string[]
): Promise<GmatAssessmentResult> {
  const scorePercentage = (scoreRaw / scoreTotal) * 100;
  const suggestedCycle = calculateSuggestedCycle(scoreRaw, scoreTotal);

  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .insert({
      student_id: studentId,
      assessment_type: 'placement',
      score_raw: scoreRaw,
      score_total: scoreTotal,
      score_percentage: scorePercentage,
      difficulty_breakdown: difficultyBreakdown,
      time_spent_seconds: timeSpentSeconds || null,
      suggested_cycle: suggestedCycle,
      assigned_cycle: null, // Set by tutor validation
      tutor_validated: false,
      question_ids: questionIds,
      completed_at: new Date().toISOString(),
      ...(answersData ? { answers_data: answersData } : {}),
      ...(bookmarkedQuestionIds ? { bookmarked_question_ids: bookmarkedQuestionIds } : {}),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving placement result:', error);
    throw new Error(`Failed to save placement result: ${error.message}`);
  }

  // Add questions to student's seen list
  await addSeenQuestions(studentId, questionIds);

  return {
    ...data,
    assessment_type: data.assessment_type as GmatAssessmentType,
    suggested_cycle: data.suggested_cycle as GmatCycle | null,
    assigned_cycle: data.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: data.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  };
}

/**
 * Validate a placement assessment result (tutor action)
 * This confirms or overrides the suggested cycle
 */
export async function validatePlacementResult(
  assessmentId: string,
  tutorId: string,
  assignedCycle: GmatCycle,
  tutorNotes?: string
): Promise<void> {
  // Get the assessment to find the student
  const { data: assessment, error: fetchError } = await supabase
    .from('2V_gmat_assessment_results')
    .select('student_id')
    .eq('id', assessmentId)
    .single();

  if (fetchError || !assessment) {
    throw new Error('Assessment not found');
  }

  // Update the assessment result
  const { error: updateError } = await supabase
    .from('2V_gmat_assessment_results')
    .update({
      assigned_cycle: assignedCycle,
      tutor_validated: true,
      validated_by: tutorId,
      validated_at: new Date().toISOString(),
      tutor_notes: tutorNotes || null,
    })
    .eq('id', assessmentId);

  if (updateError) {
    throw new Error(`Failed to validate assessment: ${updateError.message}`);
  }

  // Update or create student's GMAT progress with the assigned cycle
  const { data: existingProgress } = await supabase
    .from('2V_gmat_student_progress')
    .select('id')
    .eq('student_id', assessment.student_id)
    .maybeSingle();

  if (existingProgress) {
    await supabase
      .from('2V_gmat_student_progress')
      .update({ gmat_cycle: assignedCycle })
      .eq('student_id', assessment.student_id);
  } else {
    await supabase
      .from('2V_gmat_student_progress')
      .insert({
        student_id: assessment.student_id,
        gmat_cycle: assignedCycle,
        seen_question_ids: [],
      });
  }
}

/**
 * Check if a student has a pending placement validation
 */
export async function hasPendingPlacementValidation(studentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .select('id')
    .eq('student_id', studentId)
    .eq('assessment_type', 'placement')
    .eq('tutor_validated', false)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking pending validation:', error);
    return false;
  }

  return data !== null;
}

// ============================================
// Section Assessment Functions
// ============================================

export type GmatSection = 'QR' | 'DI' | 'VR';

/**
 * Section Assessment Configuration
 * Based on assessment-strategy.md
 */
export const SECTION_ASSESSMENT_CONFIG: Record<GmatSection, {
  totalQuestions: number;
  timeMinutes: number;
  fullName: string;
}> = {
  QR: { totalQuestions: 21, timeMinutes: 45, fullName: 'Quantitative Reasoning' },
  DI: { totalQuestions: 20, timeMinutes: 45, fullName: 'Data Insights' },
  VR: { totalQuestions: 23, timeMinutes: 45, fullName: 'Verbal Reasoning' },
};

/**
 * Difficulty distribution per cycle for Section Assessments
 * Foundation: More easy, fewer hard
 * Development: Balanced
 * Excellence: More hard, fewer easy
 */
export const SECTION_DIFFICULTY_BY_CYCLE: Record<GmatCycle, Record<GmatSection, { easy: number; medium: number; hard: number }>> = {
  Foundation: {
    QR: { easy: 9, medium: 8, hard: 4 },   // 21 total
    DI: { easy: 9, medium: 7, hard: 4 },   // 20 total
    VR: { easy: 10, medium: 9, hard: 4 },  // 23 total
  },
  Development: {
    QR: { easy: 6, medium: 9, hard: 6 },   // 21 total
    DI: { easy: 6, medium: 8, hard: 6 },   // 20 total
    VR: { easy: 7, medium: 9, hard: 7 },   // 23 total
  },
  Excellence: {
    QR: { easy: 4, medium: 8, hard: 9 },   // 21 total
    DI: { easy: 4, medium: 7, hard: 9 },   // 20 total
    VR: { easy: 4, medium: 9, hard: 10 },  // 23 total
  },
};

/**
 * Get questions for a Section Assessment
 * Fetches questions based on student's cycle and section
 * Uses cycle-appropriate difficulty distribution
 * Excludes questions the student has already seen
 */
export async function getSectionAssessmentQuestions(
  studentId: string,
  section: GmatSection,
  cycleOverride?: GmatCycle
): Promise<{ questions: Array<{ id: string; section: string; difficulty: string }>; error?: string }> {
  // Get student's progress to determine cycle
  const progress = await getStudentGMATProgress(studentId);
  if (!progress && !cycleOverride) {
    return { questions: [], error: 'Student has no GMAT progress record. Please complete placement assessment first.' };
  }

  const cycle = cycleOverride || progress!.gmat_cycle;
  const seenIds = new Set(progress?.seen_question_ids || []);
  const config = SECTION_ASSESSMENT_CONFIG[section];
  const distribution = SECTION_DIFFICULTY_BY_CYCLE[cycle][section];

  // Fetch questions from the GMAT question pool
  const { data: poolTest, error: poolError } = await supabase
    .from('2V_tests')
    .select('id')
    .eq('test_type', 'GMAT')
    .eq('exercise_type', 'Pool')
    .maybeSingle();

  if (poolError || !poolTest) {
    return { questions: [], error: 'GMAT question pool not found' };
  }

  // Map section codes to full names for database query
  const sectionMapping: Record<string, string[]> = {
    'QR': ['QR', 'Quantitative Reasoning'],
    'DI': ['DI', 'Data Insights'],
    'VR': ['VR', 'Verbal Reasoning'],
  };

  const sectionNames = sectionMapping[section];

  // Fetch all questions for this section from the pool
  const { data: allQuestions, error: questionsError } = await supabase
    .from('2V_questions')
    .select('id, section, difficulty')
    .eq('test_id', poolTest.id)
    .eq('is_active', true)
    .in('section', sectionNames);

  if (questionsError || !allQuestions) {
    return { questions: [], error: 'Failed to fetch questions' };
  }

  // Group questions by difficulty, excluding seen questions
  const questionsByDifficulty: Record<string, Array<{ id: string; section: string; difficulty: string }>> = {
    easy: [],
    medium: [],
    hard: [],
  };

  for (const q of allQuestions) {
    if (seenIds.has(q.id)) continue;

    const difficulty = (q.difficulty || 'medium').toLowerCase();
    if (questionsByDifficulty[difficulty]) {
      questionsByDifficulty[difficulty].push({
        id: q.id,
        section: section,
        difficulty,
      });
    }
  }

  // Select questions according to cycle distribution
  const selectedQuestions: Array<{ id: string; section: string; difficulty: string }> = [];

  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const available = questionsByDifficulty[difficulty];
    const needed = distribution[difficulty];

    if (available.length < needed) {
      return {
        questions: [],
        error: `Not enough ${difficulty} questions for ${config.fullName}. Need ${needed}, have ${available.length}`,
      };
    }

    // Shuffle and select
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    selectedQuestions.push(...shuffled.slice(0, needed));
  }

  // Verify total count
  if (selectedQuestions.length !== config.totalQuestions) {
    return {
      questions: [],
      error: `Question count mismatch. Expected ${config.totalQuestions}, got ${selectedQuestions.length}`,
    };
  }

  // Shuffle all selected questions for the final order
  return {
    questions: selectedQuestions.sort(() => Math.random() - 0.5),
  };
}

/**
 * Save section assessment result
 */
export async function saveSectionAssessmentResult(
  studentId: string,
  section: GmatSection,
  scoreRaw: number,
  scoreTotal: number,
  difficultyBreakdown: GmatAssessmentResult['difficulty_breakdown'],
  questionIds: string[],
  timeSpentSeconds?: number,
  answersData?: Record<string, any>,
  bookmarkedQuestionIds?: string[],
  sectionScore?: number,
  theta?: number,
  adjustedTheta?: number,
  se?: number,
  unansweredCount?: number,
  percentile?: number,
  cycle?: string,
  responsePatternDetails?: Array<Record<string, any>>
): Promise<GmatAssessmentResult> {
  const scorePercentage = (scoreRaw / scoreTotal) * 100;

  const hasMetadata = sectionScore != null || theta != null;
  const metadata = hasMetadata ? {
    gmat_section_score: sectionScore,
    theta,                          // raw theta before unanswered penalty
    adjusted_theta: adjustedTheta,  // theta after penalty (used for scoring)
    se,                             // standard error of theta estimate
    unanswered_count: unansweredCount,
    percentile,
    cycle,
    algorithm_version: '1.1.0',
    // Per-item IRT parameters at the final converged theta (for analytics and auditing)
    response_pattern_details: responsePatternDetails ?? null,
  } : null;

  // Use RPC (SECURITY DEFINER) to bypass RLS — students cannot direct-insert
  // section_assessment rows, only tutors can via the base RLS policy.
  const { data: resultId, error: rpcError } = await supabase.rpc(
    'save_gmat_section_assessment_result',
    {
      p_student_id: studentId,
      p_section: section,
      p_score_raw: scoreRaw,
      p_score_total: scoreTotal,
      p_score_percentage: scorePercentage,
      p_difficulty_breakdown: difficultyBreakdown ?? null,
      p_time_spent_seconds: timeSpentSeconds || null,
      p_question_ids: questionIds,
      p_answers_data: answersData || null,
      p_bookmarked_question_ids: bookmarkedQuestionIds || null,
      p_metadata: metadata,
    }
  );

  if (rpcError) {
    console.error('Error saving section assessment result:', rpcError);
    throw new Error(`Failed to save section assessment result: ${rpcError.message}`);
  }

  // Fetch the full row to return to the caller
  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('id', resultId)
    .single();

  if (error) {
    console.error('Error fetching saved section assessment result:', error);
    throw new Error(`Failed to save section assessment result: ${error.message}`);
  }

  // Add questions to student's seen list
  await addSeenQuestions(studentId, questionIds);

  return {
    ...data,
    assessment_type: data.assessment_type as GmatAssessmentType,
    suggested_cycle: data.suggested_cycle as GmatCycle | null,
    assigned_cycle: data.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: data.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  };
}

/**
 * Get student's section assessment history
 */
export async function getSectionAssessmentHistory(
  studentId: string,
  section?: GmatSection
): Promise<GmatAssessmentResult[]> {
  let query = supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('student_id', studentId)
    .eq('assessment_type', 'section_assessment')
    .order('completed_at', { ascending: false });

  if (section) {
    query = query.eq('section', section);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching section assessment history:', error);
    return [];
  }

  return (data || []).map(row => ({
    ...row,
    assessment_type: row.assessment_type as GmatAssessmentType,
    suggested_cycle: row.suggested_cycle as GmatCycle | null,
    assigned_cycle: row.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: row.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  }));
}

/**
 * Get the latest section assessment result for each section
 * Useful for showing section readiness status
 */
export async function getLatestSectionAssessments(
  studentId: string
): Promise<Record<GmatSection, GmatAssessmentResult | null>> {
  const result: Record<GmatSection, GmatAssessmentResult | null> = {
    QR: null,
    DI: null,
    VR: null,
  };

  for (const section of ['QR', 'DI', 'VR'] as GmatSection[]) {
    const { data, error } = await supabase
      .from('2V_gmat_assessment_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('assessment_type', 'section_assessment')
      .eq('section', section)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      result[section] = {
        ...data,
        assessment_type: data.assessment_type as GmatAssessmentType,
        suggested_cycle: data.suggested_cycle as GmatCycle | null,
        assigned_cycle: data.assigned_cycle as GmatCycle | null,
        difficulty_breakdown: data.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
      };
    }
  }

  return result;
}

/**
 * Check if student is ready for Mock Simulation
 * Requires passing all three section assessments (e.g., >= 60%)
 */
export async function isReadyForMockSimulation(
  studentId: string,
  passingPercentage: number = 60
): Promise<{ ready: boolean; sections: Record<GmatSection, { passed: boolean; percentage: number | null }> }> {
  const latestAssessments = await getLatestSectionAssessments(studentId);

  const sections: Record<GmatSection, { passed: boolean; percentage: number | null }> = {
    QR: { passed: false, percentage: null },
    DI: { passed: false, percentage: null },
    VR: { passed: false, percentage: null },
  };

  let allPassed = true;

  for (const section of ['QR', 'DI', 'VR'] as GmatSection[]) {
    const assessment = latestAssessments[section];
    if (assessment) {
      sections[section].percentage = assessment.score_percentage;
      sections[section].passed = assessment.score_percentage >= passingPercentage;
    }
    if (!sections[section].passed) {
      allPassed = false;
    }
  }

  return { ready: allPassed, sections };
}

// ============================================
// Mock Simulation Functions
// ============================================

/**
 * Mock Simulation Configuration
 * Full GMAT simulation: 64 questions total
 * Based on assessment-strategy.md
 */
export const MOCK_SIMULATION_CONFIG = {
  totalQuestions: 64,
  timeMinutes: 135, // 2h 15m
  sections: {
    QR: { questions: 21, timeMinutes: 45 },
    DI: { questions: 20, timeMinutes: 45 },
    VR: { questions: 23, timeMinutes: 45 },
  },
  // Section order matches real GMAT
  sectionOrder: ['QR', 'DI', 'VR'] as GmatSection[],
};

/**
 * Difficulty distribution per cycle for Mock Simulations
 * Same ratios as Section Assessments but scaled to full test
 */
export const MOCK_DIFFICULTY_BY_CYCLE: Record<GmatCycle, Record<GmatSection, { easy: number; medium: number; hard: number }>> = {
  Foundation: {
    QR: { easy: 9, medium: 8, hard: 4 },   // 21 total
    DI: { easy: 9, medium: 7, hard: 4 },   // 20 total
    VR: { easy: 10, medium: 9, hard: 4 },  // 23 total
  },
  Development: {
    QR: { easy: 6, medium: 9, hard: 6 },   // 21 total
    DI: { easy: 6, medium: 8, hard: 6 },   // 20 total
    VR: { easy: 7, medium: 9, hard: 7 },   // 23 total
  },
  Excellence: {
    QR: { easy: 4, medium: 8, hard: 9 },   // 21 total
    DI: { easy: 4, medium: 7, hard: 9 },   // 20 total
    VR: { easy: 4, medium: 9, hard: 10 },  // 23 total
  },
};

/**
 * Get questions for a Mock Simulation
 * Fetches questions for all three sections based on student's cycle
 * Uses cycle-appropriate difficulty distribution
 * Excludes questions the student has already seen
 */
export async function getMockSimulationQuestions(
  studentId: string,
  skipReadinessCheck: boolean = false
): Promise<{
  questions: Array<{ id: string; section: GmatSection; difficulty: string }>;
  questionsBySection: Record<GmatSection, Array<{ id: string; section: GmatSection; difficulty: string }>>;
  error?: string;
}> {
  // Check if student is ready for mock simulation (skip in preview mode)
  if (!skipReadinessCheck) {
    const readiness = await isReadyForMockSimulation(studentId);
    if (!readiness.ready) {
      const missingSections = Object.entries(readiness.sections)
        .filter(([, data]) => !data.passed)
        .map(([section]) => section);
      return {
        questions: [],
        questionsBySection: { QR: [], DI: [], VR: [] },
        error: `Complete section assessments first. Missing: ${missingSections.join(', ')}`,
      };
    }
  }

  // Get student's progress to determine cycle
  const progress = await getStudentGMATProgress(studentId);
  if (!progress && !skipReadinessCheck) {
    return {
      questions: [],
      questionsBySection: { QR: [], DI: [], VR: [] },
      error: 'Student has no GMAT progress record.',
    };
  }

  const cycle: GmatCycle = progress?.gmat_cycle || 'Development';
  const seenIds = new Set(progress?.seen_question_ids || []);

  // Fetch questions from the GMAT question pool
  const { data: poolTest, error: poolError } = await supabase
    .from('2V_tests')
    .select('id')
    .eq('test_type', 'GMAT')
    .eq('exercise_type', 'Pool')
    .maybeSingle();

  if (poolError || !poolTest) {
    return {
      questions: [],
      questionsBySection: { QR: [], DI: [], VR: [] },
      error: 'GMAT question pool not found',
    };
  }

  // Map section codes to full names for database query
  const sectionMapping: Record<GmatSection, string[]> = {
    'QR': ['QR', 'Quantitative Reasoning'],
    'DI': ['DI', 'Data Insights'],
    'VR': ['VR', 'Verbal Reasoning'],
  };

  const questionsBySection: Record<GmatSection, Array<{ id: string; section: GmatSection; difficulty: string }>> = {
    QR: [],
    DI: [],
    VR: [],
  };

  // Fetch questions for each section
  for (const section of MOCK_SIMULATION_CONFIG.sectionOrder) {
    const sectionNames = sectionMapping[section];
    const distribution = MOCK_DIFFICULTY_BY_CYCLE[cycle][section];
    const sectionConfig = MOCK_SIMULATION_CONFIG.sections[section];

    // Fetch all questions for this section from the pool
    const { data: allQuestions, error: questionsError } = await supabase
      .from('2V_questions')
      .select('id, section, difficulty')
      .eq('test_id', poolTest.id)
      .eq('is_active', true)
      .in('section', sectionNames);

    if (questionsError || !allQuestions) {
      return {
        questions: [],
        questionsBySection: { QR: [], DI: [], VR: [] },
        error: `Failed to fetch questions for ${section}`,
      };
    }

    // Group questions by difficulty, excluding seen questions
    const questionsByDifficulty: Record<string, Array<{ id: string; section: GmatSection; difficulty: string }>> = {
      easy: [],
      medium: [],
      hard: [],
    };

    for (const q of allQuestions) {
      if (seenIds.has(q.id)) continue;

      const difficulty = (q.difficulty || 'medium').toLowerCase();
      if (questionsByDifficulty[difficulty]) {
        questionsByDifficulty[difficulty].push({
          id: q.id,
          section: section,
          difficulty,
        });
      }
    }

    // Select questions according to cycle distribution
    const selectedQuestions: Array<{ id: string; section: GmatSection; difficulty: string }> = [];

    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const available = questionsByDifficulty[difficulty];
      const needed = distribution[difficulty];

      if (available.length < needed) {
        return {
          questions: [],
          questionsBySection: { QR: [], DI: [], VR: [] },
          error: `Not enough ${difficulty} questions for ${section}. Need ${needed}, have ${available.length}`,
        };
      }

      // Shuffle and select
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      selectedQuestions.push(...shuffled.slice(0, needed));
    }

    // Verify section count
    if (selectedQuestions.length !== sectionConfig.questions) {
      return {
        questions: [],
        questionsBySection: { QR: [], DI: [], VR: [] },
        error: `Question count mismatch for ${section}. Expected ${sectionConfig.questions}, got ${selectedQuestions.length}`,
      };
    }

    // Shuffle questions within section and add to result
    questionsBySection[section] = selectedQuestions.sort(() => Math.random() - 0.5);
  }

  // Combine all questions in section order
  const allQuestions: Array<{ id: string; section: GmatSection; difficulty: string }> = [
    ...questionsBySection.QR,
    ...questionsBySection.DI,
    ...questionsBySection.VR,
  ];

  // Verify total count
  if (allQuestions.length !== MOCK_SIMULATION_CONFIG.totalQuestions) {
    return {
      questions: [],
      questionsBySection: { QR: [], DI: [], VR: [] },
      error: `Total question count mismatch. Expected ${MOCK_SIMULATION_CONFIG.totalQuestions}, got ${allQuestions.length}`,
    };
  }

  return {
    questions: allQuestions,
    questionsBySection,
  };
}

/**
 * Mock Simulation result with per-section breakdown
 */
export interface MockSimulationResult extends GmatAssessmentResult {
  section_scores: Record<GmatSection, {
    score_raw: number;
    score_total: number;
    score_percentage: number;
    difficulty_breakdown: GmatAssessmentResult['difficulty_breakdown'];
  }>;
}

/**
 * Save mock simulation result
 */
export async function saveMockSimulationResult(
  studentId: string,
  scoreRaw: number,
  scoreTotal: number,
  sectionScores: MockSimulationResult['section_scores'],
  questionIds: string[],
  timeSpentSeconds?: number,
  answersData?: Record<string, { answer: string | string[] | Record<string, string>; time_spent_seconds: number; is_correct: boolean; is_unanswered?: boolean }>,
  bookmarkedQuestionIds?: string[]
): Promise<GmatAssessmentResult> {
  const scorePercentage = (scoreRaw / scoreTotal) * 100;

  // Calculate overall difficulty breakdown from section breakdowns
  const overallDifficultyBreakdown: GmatAssessmentResult['difficulty_breakdown'] = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  for (const section of ['QR', 'DI', 'VR'] as GmatSection[]) {
    const sectionBreakdown = sectionScores[section].difficulty_breakdown;
    if (sectionBreakdown) {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        if (sectionBreakdown[difficulty]) {
          overallDifficultyBreakdown[difficulty]!.correct += sectionBreakdown[difficulty]!.correct;
          overallDifficultyBreakdown[difficulty]!.total += sectionBreakdown[difficulty]!.total;
        }
      }
    }
  }

  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .insert({
      student_id: studentId,
      assessment_type: 'mock',
      section: null, // Full test, not a single section
      score_raw: scoreRaw,
      score_total: scoreTotal,
      score_percentage: scorePercentage,
      difficulty_breakdown: {
        ...overallDifficultyBreakdown,
        section_scores: sectionScores, // Store per-section breakdown in the JSON
      },
      time_spent_seconds: timeSpentSeconds || null,
      tutor_validated: true, // Mock simulations don't require validation
      question_ids: questionIds,
      answers_data: answersData || null,
      bookmarked_question_ids: bookmarkedQuestionIds || null,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving mock simulation result:', error);
    throw new Error(`Failed to save mock simulation result: ${error.message}`);
  }

  // Add questions to student's seen list
  await addSeenQuestions(studentId, questionIds);

  return {
    ...data,
    assessment_type: data.assessment_type as GmatAssessmentType,
    suggested_cycle: data.suggested_cycle as GmatCycle | null,
    assigned_cycle: data.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: data.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  };
}

/**
 * Get student's mock simulation history
 */
export async function getMockSimulationHistory(
  studentId: string
): Promise<GmatAssessmentResult[]> {
  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('student_id', studentId)
    .eq('assessment_type', 'mock')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching mock simulation history:', error);
    return [];
  }

  return (data || []).map(row => ({
    ...row,
    assessment_type: row.assessment_type as GmatAssessmentType,
    suggested_cycle: row.suggested_cycle as GmatCycle | null,
    assigned_cycle: row.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: row.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  }));
}

/**
 * Get the latest mock simulation result
 */
export async function getLatestMockSimulation(
  studentId: string
): Promise<GmatAssessmentResult | null> {
  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('student_id', studentId)
    .eq('assessment_type', 'mock')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest mock simulation:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    assessment_type: data.assessment_type as GmatAssessmentType,
    suggested_cycle: data.suggested_cycle as GmatCycle | null,
    assigned_cycle: data.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: data.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  };
}

/**
 * Calculate estimated GMAT score from mock simulation percentage.
 *
 * Uses the GMAT Focus Edition scoring algorithm with a non-linear (IRT-based)
 * mapping from percentage to score. This produces a more realistic S-curve
 * distribution compared to a naive linear mapping.
 *
 * For full IRT-based scoring with per-section theta estimates, use the
 * GmatScoringAlgorithm class directly from gmatScoringAlgorithm.ts.
 */
export function calculateEstimatedGmatScore(percentage: number): number {
  const scorer = new GmatScoringAlgorithm();
  return scorer.calculateFromPercentage(percentage);
}

/**
 * Calculate full GMAT score from per-section theta estimates.
 *
 * Use this when you have theta values from the adaptive algorithm (e.g., from
 * completion_details.gmat_scoring.section_thetas). Returns a complete score
 * result with section scores, total score, percentiles, and score band.
 */
export function calculateGmatScoreFromThetas(
  qrTheta: number,
  vrTheta: number,
  diTheta: number,
  isSimulated = false
): GmatScoreResult {
  const scorer = new GmatScoringAlgorithm();
  return scorer.calculateFromThetas(qrTheta, vrTheta, diTheta, isSimulated);
}

// ============================================
// Training Template Functions
// ============================================

export interface TrainingTemplate {
  id: string;
  section: string;
  topic: string;
  material_type: string; // 'training1', 'training2', 'assessment'
  title: string;
  description: string | null;
  question_allocation: {
    by_cycle: {
      [K in GmatCycle]?: {
        allocated_questions: string[];
        allocated_at: string | null;
      };
    };
  } | null;
  question_requirements: {
    total_questions: number;
    time_limit_minutes?: number;
    difficulty_distribution: Record<GmatCycle, { easy: number; medium: number; hard: number }>;
  } | null;
}

export interface TrainingCompletion {
  id: string; // assessment result ID (most recent)
  template_id: string;
  completed_at: string;
  score_raw: number;
  score_total: number;
  score_percentage: number;
  results_visible: boolean; // Whether student can see results (tutor controlled)
  attempt_count: number; // Total number of attempts
  best_score_percentage: number; // Best score across all attempts
  time_spent_seconds?: number; // Time spent on most recent attempt
}

/**
 * Get all GMAT training templates with their allocations
 * Only returns templates that have questions allocated for at least one cycle
 */
export async function getTrainingTemplates(): Promise<TrainingTemplate[]> {
  // Note: is_active might be null for older templates, so we use .neq('is_active', false)
  // to include both true and null values
  const { data, error } = await supabase
    .from('2V_lesson_materials')
    .select('id, section, topic, material_type, title, description, question_allocation, question_requirements')
    .eq('test_type', 'GMAT')
    .eq('is_template', true)
    .neq('is_active', false)  // Include both true and null
    .in('material_type', ['training1', 'training2', 'assessment'])
    .order('section')
    .order('topic')
    .order('material_type');

  if (error) {
    console.error('Error fetching training templates:', error);
    throw new Error(`Failed to fetch training templates: ${error.message}`);
  }

  // Filter to only templates with allocations
  const filtered = (data || [])
    .filter(t => {
      const allocation = t.question_allocation as TrainingTemplate['question_allocation'];
      if (!allocation?.by_cycle) return false;
      // Check if at least one cycle has questions
      return Object.values(allocation.by_cycle).some(
        cycle => cycle?.allocated_questions && cycle.allocated_questions.length > 0
      );
    })
    .map(t => ({
      ...t,
      question_allocation: t.question_allocation as TrainingTemplate['question_allocation'],
      question_requirements: t.question_requirements as TrainingTemplate['question_requirements'],
    }));

  return filtered;
}

/**
 * Get training completions for a student
 * Uses the 2V_gmat_assessment_results table with assessment_type='training'
 * Groups by template and calculates attempt counts and best scores
 */
export async function getTrainingCompletions(
  studentId: string
): Promise<Map<string, TrainingCompletion>> {
  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('student_id', studentId)
    .eq('assessment_type', 'training')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching training completions:', error);
    return new Map();
  }

  // All returned rows are valid completions. Deduplication is handled below by
  // grouping on topic and keeping the most recent per template.
  const validResults = data || [];

  // Group by topic (which stores template_id for trainings)
  // Calculate attempt counts and best scores
  const templateAttempts = new Map<string, any[]>();
  for (const row of validResults) {
    if (row.topic) {
      const attempts = templateAttempts.get(row.topic) || [];
      attempts.push(row);
      templateAttempts.set(row.topic, attempts);
    }
  }

  const completions = new Map<string, TrainingCompletion>();
  for (const [templateId, attempts] of templateAttempts) {
    // Most recent attempt (first in the sorted array)
    const mostRecent = attempts[0];
    // Best score
    const bestScore = Math.max(...attempts.map(a => a.score_percentage));

    completions.set(templateId, {
      id: mostRecent.id, // assessment result ID for viewing results
      template_id: templateId,
      completed_at: mostRecent.completed_at || '',
      score_raw: mostRecent.score_raw,
      score_total: mostRecent.score_total,
      score_percentage: mostRecent.score_percentage,
      results_visible: mostRecent.results_visible ?? false,
      attempt_count: attempts.length,
      best_score_percentage: bestScore,
      time_spent_seconds: mostRecent.time_spent_seconds,
    });
  }

  return completions;
}

/**
 * Save a training result
 * Uses RPC function to bypass RLS while still validating ownership
 */
/**
 * Per-question answer data for detailed analytics
 */
export interface QuestionAnswerData {
  answer: string | string[] | Record<string, string>;
  time_spent_seconds: number;
  is_correct: boolean;
}

export async function saveTrainingResult(
  studentId: string,
  templateId: string,
  section: string,
  scoreRaw: number,
  scoreTotal: number,
  questionIds: string[],
  difficultyBreakdown?: GmatAssessmentResult['difficulty_breakdown'],
  timeSpentSeconds?: number,
  answersData?: Record<string, QuestionAnswerData>,
  bookmarkedQuestionIds?: string[]
): Promise<GmatAssessmentResult> {
  // Validate: Prevent saving empty results (which cause duplicate count issues)
  if (!answersData || Object.keys(answersData).length === 0) {
    throw new Error('Cannot save training result with empty answers data. Ensure at least one question was answered.');
  }

  if (!questionIds || questionIds.length === 0) {
    throw new Error('Cannot save training result without question IDs.');
  }

  const scorePercentage = scoreTotal > 0 ? (scoreRaw / scoreTotal) * 100 : 0;

  // Use RPC function to bypass RLS (function validates ownership internally)
  const { data: resultId, error: rpcError } = await supabase.rpc('save_gmat_training_result', {
    p_student_id: studentId,
    p_section: section,
    p_topic: templateId,
    p_score_raw: scoreRaw,
    p_score_total: scoreTotal,
    p_score_percentage: scorePercentage,
    p_difficulty_breakdown: difficultyBreakdown || null,
    p_time_spent_seconds: timeSpentSeconds || null,
    p_question_ids: questionIds,
    p_answers_data: answersData || null,
    p_bookmarked_question_ids: bookmarkedQuestionIds || null,
  });

  if (rpcError) {
    console.error('Error saving training result via RPC:', rpcError);
    throw new Error(`Failed to save training result: ${rpcError.message}`);
  }

  // Fetch the created result to return full data
  const { data, error: fetchError } = await supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('id', resultId)
    .single();

  // Add questions to student's seen list (do this regardless of fetch success)
  await addSeenQuestions(studentId, questionIds);

  if (fetchError || !data) {
    console.error('Error fetching saved training result:', fetchError);
    // Return a minimal result object since the save was successful
    return {
      id: resultId,
      student_id: studentId,
      assessment_type: 'training' as GmatAssessmentType,
      section,
      topic: templateId,
      score_raw: scoreRaw,
      score_total: scoreTotal,
      score_percentage: scorePercentage,
      difficulty_breakdown: difficultyBreakdown || null,
      time_spent_seconds: timeSpentSeconds || null,
      tutor_validated: true,
      question_ids: questionIds,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      suggested_cycle: null,
      assigned_cycle: null,
      validated_by: null,
      validated_at: null,
      tutor_notes: null,
    };
  }

  // Note: Auto-lock is handled by the RPC function (save_gmat_training_result)
  // which has SECURITY DEFINER and can bypass RLS on the training_locks table

  return {
    ...data,
    assessment_type: data.assessment_type as GmatAssessmentType,
    suggested_cycle: data.suggested_cycle as GmatCycle | null,
    assigned_cycle: data.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: data.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  };
}

/**
 * Check if student can start a training (has valid cycle and template has allocation for that cycle)
 */
export async function canStartTraining(
  studentId: string,
  templateId: string
): Promise<{ canStart: boolean; reason?: string; cycle?: GmatCycle }> {
  // Get student's cycle
  const progress = await getStudentGMATProgress(studentId);
  if (!progress) {
    return { canStart: false, reason: 'GMAT preparation not initialized. Please contact your tutor.' };
  }

  const cycle = progress.gmat_cycle;

  // Get template allocation
  const { data: template, error } = await supabase
    .from('2V_lesson_materials')
    .select('question_allocation')
    .eq('id', templateId)
    .single();

  if (error || !template) {
    return { canStart: false, reason: 'Training template not found.' };
  }

  const allocation = template.question_allocation as TrainingTemplate['question_allocation'];
  const cycleAllocation = allocation?.by_cycle?.[cycle];

  if (!cycleAllocation?.allocated_questions || cycleAllocation.allocated_questions.length === 0) {
    return { canStart: false, reason: `No questions allocated for ${cycle} cycle. Please contact your tutor.` };
  }

  return { canStart: true, cycle };
}

/**
 * Get full template details for starting a training
 */
export async function getTrainingTemplateDetails(
  templateId: string
): Promise<TrainingTemplate | null> {
  const { data, error } = await supabase
    .from('2V_lesson_materials')
    .select('id, section, topic, material_type, title, description, question_allocation, question_requirements')
    .eq('id', templateId)
    .eq('is_template', true)
    .single();

  if (error || !data) {
    console.error('Error fetching template details:', error);
    return null;
  }

  return {
    ...data,
    question_allocation: data.question_allocation as TrainingTemplate['question_allocation'],
    question_requirements: data.question_requirements as TrainingTemplate['question_requirements'],
  };
}

/**
 * Get questions for a training test based on template allocation and student's cycle
 */
export async function getTrainingQuestions(
  templateId: string,
  studentId: string
): Promise<{ questions: Array<{ id: string; question_number: number }>; error?: string }> {
  // Get student's cycle
  const progress = await getStudentGMATProgress(studentId);
  if (!progress) {
    return { questions: [], error: 'Student has no GMAT progress initialized.' };
  }

  const cycle = progress.gmat_cycle;

  // Get template
  const { data: template, error: templateError } = await supabase
    .from('2V_lesson_materials')
    .select('question_allocation')
    .eq('id', templateId)
    .single();

  if (templateError || !template) {
    return { questions: [], error: 'Training template not found.' };
  }

  const allocation = template.question_allocation as TrainingTemplate['question_allocation'];
  const allocatedIds = allocation?.by_cycle?.[cycle]?.allocated_questions || [];

  if (allocatedIds.length === 0) {
    return { questions: [], error: `No questions allocated for ${cycle} cycle.` };
  }

  // Fetch the questions in order
  const { data: questions, error: questionsError } = await supabase
    .from('2V_questions')
    .select('id, question_number')
    .in('id', allocatedIds);

  if (questionsError || !questions) {
    return { questions: [], error: 'Failed to fetch questions.' };
  }

  // Preserve the allocation order (or shuffle for randomization)
  const questionMap = new Map(questions.map(q => [q.id, q]));
  const orderedQuestions = allocatedIds
    .map(id => questionMap.get(id))
    .filter((q): q is { id: string; question_number: number } => q !== undefined);

  return { questions: orderedQuestions };
}

// ============================================
// GMAT Question Generation with AI
// ============================================

export type DIType = 'DS' | 'GI' | 'TA' | 'TPA' | 'MSR';

export interface GeneratedQuestion {
  question_data: Record<string, unknown>;
  answers: {
    correct_answer: unknown;
    wrong_answers: unknown[];
  };
  section: string;
  question_type: string;
  difficulty: string;
}

export interface GenerateQuestionsRequest {
  section: 'Quantitative Reasoning' | 'Data Insights';
  diType?: DIType;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  categories: string[];
  exampleQuestions: {
    question_data: Record<string, unknown>;
    answers: Record<string, unknown>;
    difficulty: string;
  }[];
  crossDifficultyReferences?: boolean; // true when examples are from other difficulty levels
}

export interface GenerateQuestionsResponse {
  success: boolean;
  questions: GeneratedQuestion[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost_usd: number;
  };
  error?: string;
}

/**
 * Generate GMAT questions using Claude AI
 */
export async function generateGMATQuestions(
  request: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, questions: [], usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0, cost_usd: 0 }, error: 'Not authenticated' };
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-gmat-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      questions: [],
      usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0, cost_usd: 0 },
      error: `API error: ${response.status} - ${errorText}`
    };
  }

  return response.json();
}

/**
 * Get the next available AI question ID for a given section
 * Format: SS-GMAT-AI__-XXXXX (e.g., QR-GMAT-AI__-00001, DI-GMAT-AI__-00001)
 */
export async function getNextAIQuestionId(section: 'Quantitative Reasoning' | 'Data Insights'): Promise<string> {
  const prefix = section === 'Quantitative Reasoning' ? 'QR' : 'DI';
  const pattern = `${prefix}-GMAT-AI__-`;

  // Find all AI-generated questions for this section to determine the next number
  // We fetch all and filter in JS because JSON path queries can be unreliable
  const { data: questions, error } = await supabase
    .from('2V_questions')
    .select('question_data')
    .eq('test_type', 'GMAT')
    .eq('section', section);

  if (error) {
    console.error('Error fetching questions for ID generation:', error);
  }

  let maxNumber = 0;

  if (questions && questions.length > 0) {
    for (const q of questions) {
      const questionData = q.question_data as Record<string, unknown> | null;
      const gmatId = questionData?.gmat_question_id as string | undefined;

      if (gmatId && gmatId.startsWith(pattern)) {
        // Extract the number part (last 5 digits)
        const match = gmatId.match(/-(\d{5})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }
  }

  const nextNumber = maxNumber + 1;
  return `${prefix}-GMAT-AI__-${String(nextNumber).padStart(5, '0')}`;
}

/**
 * Save a generated question to the database
 */
export async function saveGeneratedQuestion(
  question: GeneratedQuestion,
  questionPoolTestId: string
): Promise<{ success: boolean; questionId?: string; error?: string }> {
  // Get the next AI question ID
  const gmatQuestionId = await getNextAIQuestionId(
    question.section as 'Quantitative Reasoning' | 'Data Insights'
  );

  // Get the next question_number for this test
  const { data: maxQuestion } = await supabase
    .from('2V_questions')
    .select('question_number')
    .eq('test_id', questionPoolTestId)
    .order('question_number', { ascending: false })
    .limit(1);

  const nextQuestionNumber = (maxQuestion?.[0]?.question_number || 0) + 1;

  // Prepare question_data with the gmat_question_id
  const questionData = {
    ...question.question_data,
    gmat_question_id: gmatQuestionId,
  };

  // Insert the question
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from('2V_questions')
    .insert({
      test_id: questionPoolTestId,
      test_type: 'GMAT',
      question_number: nextQuestionNumber,
      question_type: question.question_type,
      section: question.section,
      difficulty: question.difficulty,
      question_data: questionData as any,
      answers: question.answers as any,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving question:', error);
    return { success: false, error: error.message };
  }

  return { success: true, questionId: data.id };
}

/**
 * Get the GMAT Question Pool test ID
 */
export async function getGMATQuestionPoolId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('2V_tests')
    .select('id')
    .eq('test_type', 'GMAT')
    .eq('section', 'Question Pool')
    .single();

  if (error || !data) {
    console.error('Error fetching Question Pool:', error);
    return null;
  }

  return data.id;
}

/**
 * Estimate the cost of generating questions
 * Based on average token usage for GMAT questions
 */
export function estimateGenerationCost(questionCount: number): number {
  // Rough estimates based on typical GMAT question generation
  const avgInputTokensPerQuestion = 2000; // Example questions + prompt
  const avgOutputTokensPerQuestion = 800;  // Generated question JSON

  const inputCost = (questionCount * avgInputTokensPerQuestion / 1_000_000) * 3;  // $3/1M
  const outputCost = (questionCount * avgOutputTokensPerQuestion / 1_000_000) * 15; // $15/1M

  return Math.round((inputCost + outputCost) * 1000) / 1000; // Round to 3 decimals
}

// ============================================================================
// GMAT Test Lock/Unlock Management
// ============================================================================

/**
 * Interface for GMAT training test lock status
 * Uses the dedicated 2V_gmat_training_locks table
 */
export interface GMATTrainingAssignment {
  id: string;
  student_id: string;
  test_id: string; // template_id
  status: 'locked' | 'unlocked';
  assigned_by: string | null;
  assigned_at: string | null;
  completed_at: string | null;
}

/**
 * Get all GMAT training test lock statuses for a student
 * Uses the dedicated 2V_gmat_training_locks table
 */
export async function getGMATTrainingAssignments(
  studentId: string
): Promise<Map<string, GMATTrainingAssignment>> {
  // Note: 2V_gmat_training_locks table created in migration 041
  const { data, error } = await supabase
    .from('2V_gmat_training_locks')
    .select('*')
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching GMAT training locks:', error);
    return new Map();
  }

  const assignmentMap = new Map<string, GMATTrainingAssignment>();
  (data || []).forEach((lock: any) => {
    assignmentMap.set(lock.template_id, {
      id: lock.id,
      student_id: lock.student_id,
      test_id: lock.template_id,
      status: lock.is_locked ? 'locked' : 'unlocked',
      assigned_by: lock.locked_by,
      assigned_at: lock.created_at,
      completed_at: null,
    });
  });

  return assignmentMap;
}

/**
 * Create or update a GMAT training test lock status
 * Uses the dedicated 2V_gmat_training_locks table
 */
export async function upsertGMATTrainingLock(
  studentId: string,
  templateId: string,
  isLocked: boolean,
  tutorId?: string
): Promise<void> {
  // Note: 2V_gmat_training_locks table created in migration 041
  // Use upsert with on_conflict
  const { error } = await supabase
    .from('2V_gmat_training_locks')
    .upsert({
      student_id: studentId,
      template_id: templateId,
      is_locked: isLocked,
      locked_by: tutorId || null,
    }, {
      onConflict: 'student_id,template_id',
    });

  if (error) {
    console.error('Error upserting GMAT training lock:', error);
    throw new Error(`Failed to ${isLocked ? 'lock' : 'unlock'} training test`);
  }
}

/**
 * Lock a GMAT training test for a student
 */
export async function lockGMATTrainingTest(
  studentId: string,
  templateId: string,
  tutorId?: string
): Promise<void> {
  await upsertGMATTrainingLock(studentId, templateId, true, tutorId);
}

/**
 * Unlock a GMAT training test for a student
 */
export async function unlockGMATTrainingTest(
  studentId: string,
  templateId: string,
  tutorId?: string
): Promise<void> {
  await upsertGMATTrainingLock(studentId, templateId, false, tutorId);
}

/**
 * Toggle results visibility for a training result
 * Only tutors/admins can change this
 */
export async function setTrainingResultsVisibility(
  resultId: string,
  visible: boolean
): Promise<void> {
  const { error } = await supabase
    .from('2V_gmat_assessment_results')
    .update({ results_visible: visible })
    .eq('id', resultId);

  if (error) {
    console.error('Error updating results visibility:', error);
    throw new Error(`Failed to update results visibility: ${error.message}`);
  }
}

/**
 * Get all training results for a student (for tutor view showing all attempts)
 */
export async function getAllTrainingResults(
  studentId: string,
  templateId?: string
): Promise<GmatAssessmentResult[]> {
  let query = supabase
    .from('2V_gmat_assessment_results')
    .select('*')
    .eq('student_id', studentId)
    .eq('assessment_type', 'training')
    .order('completed_at', { ascending: false });

  if (templateId) {
    query = query.eq('topic', templateId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching training results:', error);
    return [];
  }

  return (data || []).map(row => ({
    ...row,
    assessment_type: row.assessment_type as GmatAssessmentType,
    suggested_cycle: row.suggested_cycle as GmatCycle | null,
    assigned_cycle: row.assigned_cycle as GmatCycle | null,
    difficulty_breakdown: row.difficulty_breakdown as GmatAssessmentResult['difficulty_breakdown'],
  }));
}

// ============================================
// GMAT Analytics Data
// ============================================

export interface QuestionMetadata {
  id: string;
  section: string;
  difficulty: string;
  question_type: string;
  question_data: { di_type?: string; categories?: string[] };
}

export interface GmatAnalyticsData {
  /** All assessment results (training + section + mock) with answers_data */
  allResults: GmatAssessmentResult[];
  /** Question metadata keyed by question ID */
  questionMetadata: Map<string, QuestionMetadata>;
}

/**
 * Fetch comprehensive analytics data for a student.
 * Returns all assessment results with answers_data and question metadata
 * for category/time analysis.
 */
export async function getAnalyticsData(studentId: string): Promise<GmatAnalyticsData> {
  // Fetch all assessment results
  const allResults = await getStudentAssessmentResults(studentId);

  // Collect all unique question IDs from results
  const questionIdSet = new Set<string>();
  for (const result of allResults) {
    if (result.question_ids) {
      for (const qid of result.question_ids) {
        questionIdSet.add(qid);
      }
    }
  }

  const questionIds = Array.from(questionIdSet);
  const questionMetadata = new Map<string, QuestionMetadata>();

  // Fetch question metadata in batches (Supabase .in() has a limit)
  const BATCH_SIZE = 200;
  for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
    const batch = questionIds.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('2V_questions')
      .select('id, section, difficulty, question_type, question_data')
      .in('id', batch);

    if (error) {
      console.error('Error fetching question metadata for analytics:', error);
      continue;
    }

    for (const q of data || []) {
      const qData = typeof q.question_data === 'string'
        ? JSON.parse(q.question_data)
        : q.question_data;
      questionMetadata.set(q.id, {
        id: q.id,
        section: q.section || '',
        difficulty: (q.difficulty || 'medium').toLowerCase(),
        question_type: q.question_type || 'multiple_choice',
        question_data: {
          di_type: qData?.di_type,
          categories: qData?.categories,
        },
      });
    }
  }

  return { allResults, questionMetadata };
}
