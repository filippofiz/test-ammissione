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
      // Get the chosen tests as an array from the multi-select.
      const testsDropdown = document.getElementById("testsDropdown");
      const chosenTests = Array.from(testsDropdown.selectedOptions).map(opt => opt.value);
  
      if (!email || !password || !fullName || !tutorId || chosenTests.length === 0) {
        alert("Please fill in all fields, including selecting at least one test.");
        return;
      }
  
      await signUpStudent(email, password, fullName, tutorId, chosenTests);
    });
  });
  
  // Function to Sign Up a Student and Store in Database
  async function signUpStudent(email, password, fullName, tutorId, chosenTests) {
    const { data, error } = await supabase.auth.signUp({ email, password });
  
    if (error) {
      console.error("❌ Signup failed:", error.message);
      alert("Signup failed: " + error.message);
      return;
    }
  
    const user = data.user;
    console.log("✅ Signup successful! Auth UID:", user.id);
  
    // Wait until the user exists in `auth.users`
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
  
    if (!tutorId) {
      alert("Please select a tutor.");
      return;
    }
  
    // Insert student with selected tutor and chosen tests (save in 'tests' column as array of text)
    const { error: insertError } = await supabase
      .from("students")
      .insert([{ auth_uid: user.id, email, name: fullName, tutor_id: tutorId, tests: chosenTests }]);
  
    if (insertError) {
      console.error("❌ Error saving student info:", insertError.message);
      alert("Error saving student info.");
      return;
    }
  
    // Initialize test progress in student_tests for each chosen test.
    await initializeStudentTests(user.id, chosenTests);
  
    alert("✅ Signup successful! You can now log in.");
    window.location.href = "login.html"; // Redirect to login
  }
  
  // Function to initialize test progress for a new student based on chosen tests.
  // For each chosen test (tipologia_test), we query the appropriate table(s)
  // and create entries in the student_tests table with the column tipologia_test set accordingly.
  async function initializeStudentTests(authUid, chosenTests) {
    console.log("📌 Initializing tests for user:", authUid, "with chosen tests:", chosenTests);
  
    const testEntries = [];
  
    // Process chosen tests from the tolc_i table.
    const { data: tolcTests, error: tolcError } = await supabase
      .from("questions")
      .select("section, test_number, progressivo, tipologia_test")
      .in("tipologia_test", chosenTests)
      .order("section, test_number, progressivo");
  
    if (tolcError) {
      console.error("❌ Error fetching tolc_i test structure:", tolcError.message);
    } else if (tolcTests) {
      // Remove duplicates manually.
      const uniqueTolcTests = Array.from(
        new Set(tolcTests.map(test => `${test.section}|${test.test_number}|${test.progressivo}|${test.tipologia_test}`))
        ).map(key => {
            const parts = key.split("|");
            return { 
                section: Number(parts[0]), 
                test_number: Number(parts[1]), 
                progressivo: Number(parts[2]), 
                tipologia_test: parts[3]
            };
        });
  
      uniqueTolcTests.forEach(test => {
        // Unlock tests with progressivo === 1 (first test for that tipologia) and lock others.
        testEntries.push({
          auth_uid: authUid,
          section: test.section,
          test_number: test.test_number,
          progressivo: test.progressivo,
          tipologia_test: test.tipologia_test,
          status: test.progressivo === 1 ? "unlocked" : "locked"
        });
      });
    }
  
    // Process chosen tests from the bocconi table.
    const { data: bocconiTests, error: bocconiError } = await supabase
      .from("questions_bocconi")
      .select("section, test_number, tipologia_test")
      .in("tipologia_test", chosenTests)
      .order("section, test_number");
  
    if (bocconiError) {
      console.error("❌ Error fetching bocconi test structure:", bocconiError.message);
    } else if (bocconiTests) {
      const uniqueBocconiTests = Array.from(
        new Set(bocconiTests.map(test => `${test.section}-${test.test_number}-${test.tipologia_test}`))
      ).map(key => {
        const [section, test_number, tipologia_test] = key.split("-").map((v, i) => i < 2 ? Number(v) : v);
        return { section, test_number, tipologia_test };
      });
  
      uniqueBocconiTests.forEach(test => {
        // For bocconi, we don’t have progressivo so we can set a default value (e.g., 1)
        testEntries.push({
          auth_uid: authUid,
          section: test.section,
          test_number: test.test_number,
          progressivo: 1,
          tipologia_test: test.tipologia_test,
          status: "locked" // or you might want to unlock the first one; adjust as needed
        });
      });
    }
  
    if (testEntries.length > 0) {
      const { error: insertError } = await supabase
        .from("student_tests")
        .insert(testEntries);
  
      if (insertError) {
        console.error("❌ Error initializing student tests:", insertError.message);
      } else {
        console.log("✅ Student test entries created!");
      }
    } else {
      console.log("No test entries to create.");
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
  
  async function loadTestOptions() {
    // This function queries both tables to get unique tipologia_test values.
    const { data: tolcData, error: tolcError } = await supabase
      .from("questions")
      .select("tipologia_test");
    const { data: bocconiData, error: bocconiError } = await supabase
      .from("questions_bocconi")
      .select("tipologia_test");
  
    if (tolcError) {
      console.error("❌ Error fetching tolc_i test options:", tolcError.message);
    }
    if (bocconiError) {
      console.error("❌ Error fetching bocconi test options:", bocconiError.message);
    }
  
    let options = [];
    if (tolcData) {
      tolcData.forEach(row => {
        if (row.tipologia_test && !options.includes(row.tipologia_test)) {
          options.push(row.tipologia_test);
        }
      });
    }
    if (bocconiData) {
      bocconiData.forEach(row => {
        if (row.tipologia_test && !options.includes(row.tipologia_test)) {
          options.push(row.tipologia_test);
        }
      });
    }
    
    // Populate the multi-select element.
    const testsDropdown = document.getElementById("testsDropdown");
    testsDropdown.innerHTML = ""; // Clear existing options.
    options.forEach(opt => {
      const optionEl = document.createElement("option");
      optionEl.value = opt;
      optionEl.textContent = opt;
      testsDropdown.appendChild(optionEl);
    });
  }
  
  document.getElementById("refreshTutors").addEventListener("click", loadTutors);
  document.addEventListener("DOMContentLoaded", loadTutors);
  document.addEventListener("DOMContentLoaded", loadTestOptions);