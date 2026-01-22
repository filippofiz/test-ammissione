/**
 * GMAT Progress API Functions
 * Manages student GMAT preparation progress including cycle and seen questions
 */

import { supabase } from '../supabase';
// Import from full generated Supabase types
import type { Database } from '../../../database.types';

// Types
export type GmatCycle = 'Foundation' | 'Development' | 'Excellence';

export const GMAT_CYCLES: GmatCycle[] = ['Foundation', 'Development', 'Excellence'];

type GmatProgressRow = Database['public']['Tables']['2V_gmat_student_progress']['Row'];

export interface GmatProgress {
  id: string;
  student_id: string;
  gmat_cycle: GmatCycle;
  seen_question_ids: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Convert database row to GmatProgress interface
 */
function toGmatProgress(row: GmatProgressRow): GmatProgress {
  return {
    id: row.id,
    student_id: row.student_id,
    gmat_cycle: row.gmat_cycle as GmatCycle,
    seen_question_ids: row.seen_question_ids || [],
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

export type GmatAssessmentType = 'placement' | 'topic_assessment' | 'section_assessment' | 'mock';

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
    easy?: { correct: number; total: number };
    medium?: { correct: number; total: number };
    hard?: { correct: number; total: number };
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
  timeSpentSeconds?: number
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
  section: GmatSection
): Promise<{ questions: Array<{ id: string; section: string; difficulty: string }>; error?: string }> {
  // Get student's progress to determine cycle
  const progress = await getStudentGMATProgress(studentId);
  if (!progress) {
    return { questions: [], error: 'Student has no GMAT progress record. Please complete placement assessment first.' };
  }

  const cycle = progress.gmat_cycle;
  const seenIds = new Set(progress.seen_question_ids || []);
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
  timeSpentSeconds?: number
): Promise<GmatAssessmentResult> {
  const scorePercentage = (scoreRaw / scoreTotal) * 100;

  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .insert({
      student_id: studentId,
      assessment_type: 'section_assessment',
      section: section,
      score_raw: scoreRaw,
      score_total: scoreTotal,
      score_percentage: scorePercentage,
      difficulty_breakdown: difficultyBreakdown,
      time_spent_seconds: timeSpentSeconds || null,
      tutor_validated: true, // Section assessments don't require validation
      question_ids: questionIds,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving section assessment result:', error);
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
  studentId: string
): Promise<{
  questions: Array<{ id: string; section: GmatSection; difficulty: string }>;
  questionsBySection: Record<GmatSection, Array<{ id: string; section: GmatSection; difficulty: string }>>;
  error?: string;
}> {
  // Check if student is ready for mock simulation
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

  // Get student's progress to determine cycle
  const progress = await getStudentGMATProgress(studentId);
  if (!progress) {
    return {
      questions: [],
      questionsBySection: { QR: [], DI: [], VR: [] },
      error: 'Student has no GMAT progress record.',
    };
  }

  const cycle = progress.gmat_cycle;
  const seenIds = new Set(progress.seen_question_ids || []);

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
  timeSpentSeconds?: number
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
 * Calculate estimated GMAT score from mock simulation percentage
 * Uses a simplified linear mapping to GMAT scale (205-805)
 */
export function calculateEstimatedGmatScore(percentage: number): number {
  // GMAT score range: 205-805 (600 point range)
  // Map percentage to score linearly
  const minScore = 205;
  const maxScore = 805;
  const range = maxScore - minScore;

  // Clamp percentage to 0-100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Calculate estimated score
  const score = minScore + (clampedPercentage / 100) * range;

  // Round to nearest 10 (GMAT scores are in increments of 10)
  return Math.round(score / 10) * 10;
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
  template_id: string;
  completed_at: string;
  score_raw: number;
  score_total: number;
  score_percentage: number;
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

  // Group by topic (which stores template_id for trainings)
  const completions = new Map<string, TrainingCompletion>();
  for (const row of data || []) {
    // topic field stores the template_id for training results
    if (row.topic && !completions.has(row.topic)) {
      completions.set(row.topic, {
        template_id: row.topic,
        completed_at: row.completed_at || '',
        score_raw: row.score_raw,
        score_total: row.score_total,
        score_percentage: row.score_percentage,
      });
    }
  }

  return completions;
}

/**
 * Save a training result
 */
export async function saveTrainingResult(
  studentId: string,
  templateId: string,
  section: string,
  scoreRaw: number,
  scoreTotal: number,
  questionIds: string[],
  difficultyBreakdown?: GmatAssessmentResult['difficulty_breakdown'],
  timeSpentSeconds?: number
): Promise<GmatAssessmentResult> {
  const scorePercentage = scoreTotal > 0 ? (scoreRaw / scoreTotal) * 100 : 0;

  const { data, error } = await supabase
    .from('2V_gmat_assessment_results')
    .insert({
      student_id: studentId,
      assessment_type: 'training',
      section: section,
      topic: templateId, // Store template ID in topic field for reference
      score_raw: scoreRaw,
      score_total: scoreTotal,
      score_percentage: scorePercentage,
      difficulty_breakdown: difficultyBreakdown || null,
      time_spent_seconds: timeSpentSeconds || null,
      tutor_validated: true, // Trainings don't require validation
      question_ids: questionIds,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving training result:', error);
    throw new Error(`Failed to save training result: ${error.message}`);
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
