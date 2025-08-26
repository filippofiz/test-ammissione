const supabase = window.supabase;

// Verify student by login code
export async function verifyStudent(loginCode) {
    let { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('login_code', loginCode)
        .single();

    if (error) {
        console.error('Login failed:', error);
        return null;
    }
    return data;
}

export async function getTestQuestions() {
    let { data, error } = await supabase.from('tests').select('*');

    if (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
    return data;
}

// Fetch all students
export async function getStudents() {
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
        console.error('Error fetching students:', error);
        return null;
    }
    return data;
}

// Add a new student
export async function addStudent(name, surname, code) {
    const { data, error } = await supabase.from('students').insert([
        { name, surname, code }
    ]);
    if (error) {
        console.error('Error adding student:', error);
        return null;
    }
    return data;
}