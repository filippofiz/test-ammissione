/**
 * Tutor API Functions
 * Queries the 2V_ tables (NOT old legacy tables)
 * All functions use TypeScript strict mode and proper error handling
 */

import { supabase } from '../supabase';
import type { Database } from '../database.types';

// Types from database
type Profile = Database['public']['Tables']['2V_profiles']['Row'];
type Test = Database['public']['Tables']['2V_tests']['Row'];
type TestAssignment = Database['public']['Tables']['2V_test_assignments']['Row'];

/**
 * Student with their test assignments
 */
export interface StudentWithAssignments {
  id: string;
  name: string | null;
  email: string;
  tutor_id: string | null;
  tutor_name?: string;
  real_test_date?: string | null;
  assignments: Array<{
    id: string;
    test_id: string;
    test_name: string;
    test_type: string;
    section: string;
    status: string;
    assigned_at: string;
    completed_at: string | null;
  }>;
}

/**
 * Get current tutor's profile ID
 */
export async function getCurrentTutorId(): Promise<string | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Auth error:', authError);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('2V_profiles')
    .select('id')
    .eq('auth_uid', user.id)
    .single();

  if (profileError) {
    console.error('Profile error:', profileError);
    return null;
  }

  return profile?.id || null;
}

/**
 * Fetch tutor's own students with their test assignments
 */
export async function fetchMyStudents(): Promise<StudentWithAssignments[]> {
  const tutorId = await getCurrentTutorId();
  if (!tutorId) {
    throw new Error('No tutor ID found');
  }

  // Get students assigned to this tutor
  const { data: students, error: studentsError } = await supabase
    .from('2V_profiles')
    .select('id, name, email, tutor_id, real_test_date')
    .eq('tutor_id', tutorId)
    .contains('roles', '"STUDENT"');

  if (studentsError) {
    console.error('Students error:', studentsError);
    throw new Error('Failed to fetch students');
  }

  if (!students || students.length === 0) {
    return [];
  }

  // Get test assignments for these students
  const studentIds = students.map(s => s.id);
  const { data: assignments, error: assignmentsError } = await supabase
    .from('2V_test_assignments')
    .select(`
      id,
      student_id,
      test_id,
      status,
      assigned_at,
      completed_at,
      2V_tests (
        id,
        test_type,
        section,
        exercise_type,
        test_number
      )
    `)
    .in('student_id', studentIds);

  if (assignmentsError) {
    console.error('Assignments error:', assignmentsError);
    throw new Error('Failed to fetch assignments');
  }

  // Combine students with their assignments
  const studentsWithAssignments: StudentWithAssignments[] = students.map(student => ({
    id: student.id,
    name: student.name,
    email: student.email,
    tutor_id: student.tutor_id,
    real_test_date: student.real_test_date,
    assignments: (assignments || [])
      .filter(a => a.student_id === student.id)
      .map(a => ({
        id: a.id,
        test_id: a.test_id,
        test_name: formatTestName(a['2V_tests']),
        test_type: a['2V_tests']?.test_type || '',
        section: a['2V_tests']?.section || '',
        status: a.status,
        assigned_at: a.assigned_at,
        completed_at: a.completed_at,
      })),
  }));

  return studentsWithAssignments;
}

/**
 * Fetch ALL students in the system (for admin view)
 */
export async function fetchAllStudents(): Promise<StudentWithAssignments[]> {
  // Get all students with their tutor info
  const { data: students, error: studentsError } = await supabase
    .from('2V_profiles')
    .select(`
      id,
      name,
      email,
      tutor_id,
      real_test_date,
      tutor:tutor_id (
        name
      )
    `)
    .contains('roles', '"STUDENT"');

  if (studentsError) {
    console.error('Students error:', studentsError);
    throw new Error('Failed to fetch all students');
  }

  if (!students || students.length === 0) {
    return [];
  }

  // Get test assignments for all students
  const studentIds = students.map(s => s.id);
  const { data: assignments, error: assignmentsError } = await supabase
    .from('2V_test_assignments')
    .select(`
      id,
      student_id,
      test_id,
      status,
      assigned_at,
      completed_at,
      2V_tests (
        id,
        test_type,
        section,
        exercise_type,
        test_number
      )
    `)
    .in('student_id', studentIds);

  if (assignmentsError) {
    console.error('Assignments error:', assignmentsError);
    throw new Error('Failed to fetch assignments');
  }

  // Combine students with their assignments
  const studentsWithAssignments: StudentWithAssignments[] = students.map(student => ({
    id: student.id,
    name: student.name,
    email: student.email,
    tutor_id: student.tutor_id,
    tutor_name: student.tutor?.name || undefined,
    real_test_date: student.real_test_date,
    assignments: (assignments || [])
      .filter(a => a.student_id === student.id)
      .map(a => ({
        id: a.id,
        test_id: a.test_id,
        test_name: formatTestName(a['2V_tests']),
        test_type: a['2V_tests']?.test_type || '',
        section: a['2V_tests']?.section || '',
        status: a.status,
        assigned_at: a.assigned_at,
        completed_at: a.completed_at,
      })),
  }));

  return studentsWithAssignments;
}

/**
 * Get all available tests for assignment
 */
export async function fetchAvailableTests(): Promise<Test[]> {
  const { data: tests, error } = await supabase
    .from('2V_tests')
    .select('*')
    .eq('is_active', true)
    .order('test_type')
    .order('section')
    .order('exercise_type')
    .order('test_number');

  if (error) {
    console.error('Tests error:', error);
    throw new Error('Failed to fetch available tests');
  }

  return tests || [];
}

/**
 * Assign a test to a student
 */
export async function assignTestToStudent(
  studentId: string,
  testId: string
): Promise<void> {
  const tutorId = await getCurrentTutorId();
  if (!tutorId) {
    throw new Error('No tutor ID found');
  }

  const { error } = await supabase
    .from('2V_test_assignments')
    .insert({
      student_id: studentId,
      test_id: testId,
      status: 'locked',
      assigned_by: tutorId,
      assigned_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Assign test error:', error);
    throw new Error('Failed to assign test');
  }
}

/**
 * Unlock a test for a student
 */
export async function unlockTest(assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from('2V_test_assignments')
    .update({ status: 'unlocked' })
    .eq('id', assignmentId);

  if (error) {
    console.error('Unlock test error:', error);
    throw new Error('Failed to unlock test');
  }
}

/**
 * Format test name from test object
 */
function formatTestName(test: any): string {
  if (!test) return 'Unknown Test';

  const { test_type, section, exercise_type, test_number } = test;
  return `${test_type} - ${section} - ${exercise_type} #${test_number}`;
}
