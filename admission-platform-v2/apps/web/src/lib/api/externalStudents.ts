// API functions for fetching external student data

export interface ExternalStudent {
  id: number;
  studentName: string;
  subjects: string | null;
  studentMail: string | null;
  parentName: string | null;
  parentPhoneNumber: string | null;
  parentMail: string | null;
  class: string | null;
  school: string | null;
  mainTutor: string | null;
}

/**
 * Fetch list of students from external Supabase project via Edge Function
 */
export async function fetchExternalStudents(searchQuery: string = ''): Promise<ExternalStudent[]> {
  console.log('🔧 fetchExternalStudents called');
  console.log('📝 Search query:', searchQuery);

  try {
    // Build URL with search parameter if provided
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log('🏠 Base URL:', baseUrl);

    const url = new URL(`${baseUrl}/functions/v1/fetch-external-students`);
    if (searchQuery) {
      url.searchParams.set('search', searchQuery);
    }

    console.log('🌐 Full URL:', url.toString());
    console.log('🔑 Auth token:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', errorText);
      throw new Error(`Failed to fetch external students: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Response data:', data);
    console.log('👥 Students in response:', data.students?.length || 0);

    return data.students || [];
  } catch (error) {
    console.error('💥 Error fetching external students:', error);
    throw error;
  }
}

/**
 * Search external students by name
 */
export async function searchExternalStudents(query: string): Promise<ExternalStudent[]> {
  return fetchExternalStudents(query);
}

/**
 * Get external student by ID
 */
export async function getExternalStudentById(id: number): Promise<ExternalStudent | null> {
  const allStudents = await fetchExternalStudents();
  return allStudents.find(student => student.id === id) || null;
}

/**
 * Update external student email
 */
export async function updateExternalStudentEmail(studentId: number, email: string): Promise<void> {
  console.log('📧 Updating external student email:', { studentId, email });

  try {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = new URL(`${baseUrl}/functions/v1/update-external-student-email`);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId, email }),
    });

    console.log('📡 Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update error:', errorText);
      throw new Error(`Failed to update external student email: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Email updated successfully:', data);
  } catch (error) {
    console.error('💥 Error updating external student email:', error);
    throw error;
  }
}

/**
 * Sync test results to external student database
 */
export async function syncTestResultsToExternal(params: {
  externalStudentId: number;
  testType: string;
  testName: string;
  completedAt: string;
  attemptNumber: number;
  status: string;
  correct: number;
  wrong: number;
  blank: number;
  totalQuestions: number;
}): Promise<void> {
  console.log('📊 Syncing test results to external database:', params);

  try {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = new URL(`${baseUrl}/functions/v1/sync-test-results-to-external`);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    console.log('📡 Sync response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Sync error:', errorText);
      throw new Error(`Failed to sync test results: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Test results synced successfully:', data);
  } catch (error) {
    console.error('💥 Error syncing test results:', error);
    throw error;
  }
}
