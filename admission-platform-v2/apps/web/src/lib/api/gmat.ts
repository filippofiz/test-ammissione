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
