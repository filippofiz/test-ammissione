document.addEventListener("DOMContentLoaded", () => {
    const signupBtn = document.getElementById("signupBtn");
  
    if (!signupBtn) {
        console.error("❌ ERROR: Signup button not found.");
        return;
    }
  
    signupBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const fullName = document.getElementById("fullName").value.trim();
        const tutorId = document.getElementById("tutorDropdown").value;
        const testType = document.getElementById("testDropdown").value;
  
        if (!email || !password || !fullName || !tutorId || !testType) {
            alert("Please fill in all fields, including test type.");
            return;
        }
  
        await signUpStudent(email, password, fullName, tutorId, testType);
    });
});
  
  // Function to Sign Up a Student and Store in Database
async function signUpStudent(email, password, fullName, tutorId, testType) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.error("❌ Signup failed:", error.message);
        alert("Signup failed: " + error.message);
        return;
    }

    const user = data.user;
    console.log("✅ Signup successful! Auth UID:", user.id);

    //Wait until the user exists in `auth.users`
    await new Promise(resolve => setTimeout(resolve, 3000));  // Wait 3 seconds

    if (!tutorId) {
        alert("Please select a tutor.");
        return;
    }

    // Insert student with selected tutor and test type (new column 'test')
    const { error: insertError } = await supabase
        .from("students")
        .insert([{ auth_uid: user.id, email, name: fullName, tutor_id: tutorId, test: testType }]);

    if (insertError) {
        console.error("❌ Error saving student info:", insertError.message);
        alert("Error saving student info.");
        return;
    }

    // ✅ Initialize their test progress in `student_tests`
    await initializeStudentTests(user.id, testType);

    alert("✅ Signup successful! You can now log in.");
    window.location.href = "login.html"; // Redirect to login
}
  
// Function to initialize test progress for a new student based on their test type
async function initializeStudentTests(authUid, testType) {
    console.log("📌 Initializing tests for user:", authUid, "with test type:", testType);

    // Determine which questions table to use based on test type
    let tableName;
    if (testType === "tolc_i") {
        tableName = "questions";
    } else if (testType === "bocconi") {
        tableName = "questions_bocconi";
    } else {
        console.error("❌ Unknown test type:", testType);
        return;
    }

    // Fetch unique tests with `test_number` and `progressivo`
    const { data: tests, error } = await supabase
        .from(tableName)
        .select("section, test_number, progressivo")
        .order("section, test_number, progressivo");

    if (error) {
        console.error("❌ Error fetching test structure:", error.message);
        return;
    }

    // Remove duplicates manually
    const uniqueTests = Array.from(
        new Set(tests.map(test => `${test.section}-${test.test_number}-${test.progressivo}`))
    ).map(key => {
        const [section, test_number, progressivo] = key.split("-").map(Number);
        return { section, test_number, progressivo };
    });

    // Prepare test progress entries for `student_tests`
    const testEntries = uniqueTests.map(test => ({
        auth_uid: authUid,
        section: test.section,
        test_number: test.test_number,
        progressivo: test.progressivo,
        status: (test.section === 1 && test.progressivo === 1) ? "unlocked" : "locked"
    }));

    const { error: insertError } = await supabase
    .from("student_tests")
    .insert(testEntries);

    if (insertError) {
        console.error("❌ Error initializing student tests:", insertError.message);
    } else {
        console.log("✅ Student test entries created!");
    }
}
  
async function loadTutors() {
    const tutorDropdown = document.getElementById("tutorDropdown");
  
    const { data, error } = await supabase
        .from("tutors")
        .select("id, name");
  
    if (error) {
        console.error("❌ Error fetching tutors:", error.message);
        alert("Failed to load tutors.");
        return;
    }
  
    tutorDropdown.innerHTML = '<option value="">Select Your Tutor</option>';
  
    data.forEach(tutor => {
        let option = document.createElement("option");
        option.value = tutor.id;
        option.textContent = tutor.name;
        tutorDropdown.appendChild(option);
    });
}
  
document.getElementById("refreshTutors").addEventListener("click", loadTutors);
document.addEventListener("DOMContentLoaded", loadTutors);