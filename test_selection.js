document.addEventListener("DOMContentLoaded", async () => {
    await loadTestTree();
});

document.addEventListener("DOMContentLoaded", async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData || !sessionData.session) {
        console.log("🔄 No active session found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    await loadTestTree();
});

document.addEventListener("DOMContentLoaded", async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData || !sessionData.session) {
        console.log("🔄 No active session found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }
});

async function loadTestTree() {
    // ✅ Get active session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData || !sessionData.session) {
        console.error("❌ No active session:", sessionError?.message);
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    const user = sessionData.session.user;
    console.log("👤 Logged-in User ID:", user.id);

    // ✅ Fetch student's `auth_uid` from the `students` table
    const { data: student, error: studentError } = await supabase
        .from("students")
        .select("auth_uid, test")
        .eq("auth_uid", user.id)
        .single();

    console.log("👤 Student Data:", student);
    if (studentError || !student) {
        console.error("❌ Error fetching student record:", studentError?.message);
        alert("Student data not found. Please contact support.");
        return;
    }

    const authUid = student.auth_uid;
    const testType = student.test; // "tolc_i" or "bocconi"
    console.log("🎯 Student test type:", testType);

    // ✅ Fetch student's test progress using `auth_uid`
    const { data: studentTests, error: progressError } = await supabase
        .from("student_tests")
        .select("*")
        .eq("auth_uid", authUid)
        .order("section, test_number, progressivo");

    if (progressError) {
        console.error("❌ Error fetching student progress:", progressError.message);
        return;
    }

    console.log("📊 Student Progress Data:", studentTests);

    if (testType === "tolc_i") {
        // ✅ Fetch test structure for tolc_i
        const { data: testData, error: testError } = await supabase
            .from("questions")
            .select("section, test_number, progressivo")
            .order("section, test_number, progressivo");

        if (testError) {
            console.error("❌ Error fetching test structure:", testError.message);
            return;
        }

        // ✅ Fix: Use `testData` instead of `data`
        const uniqueTests = Array.from(new Set(testData.map(test => 
            `${test.section}-${test.test_number}-${test.progressivo}`
        ))).map(key => {
            const [section, test_number, progressivo] = key.split("-").map(Number);
            return { section, test_number, progressivo };
        });

        displayTolcTree(uniqueTests, studentTests);
    } else if (testType === "bocconi") {
        // ✅ Fetch test structure for Bocconi
        const { data: testData, error: testError } = await supabase
            .from("questions_bocconi")
            .select("section, test_number")
            .order("section, test_number");

        if (testError) {
            console.error("❌ Error fetching Bocconi test structure:", testError.message);
            return;
        }

        const uniqueTests = Array.from(new Set(testData.map(test => 
            `${test.section}-${test.test_number}`
        ))).map(key => {
            const [section, test_number] = key.split("-").map(Number);
            return { section, test_number };
        });

        displayBocconiTree(uniqueTests, studentTests);
    } else {
        console.error("❌ Unknown test type:", testType);
    }
}

// ✅ Display TOLC-I test structure
function displayTolcTree(tests, studentTests) {
    const testTree = document.getElementById("testTree");
    testTree.innerHTML = "";
    
    // Group tests by section first
    const sectionsMap = {};
    tests.forEach(test => {
      if (!sectionsMap[test.section]) {
        sectionsMap[test.section] = [];
      }
      sectionsMap[test.section].push(test);
    });
    
    // Define section names
    const sectionNames = [
      "Logica e Insiemi", "Algebra", "Goniometria e Trigonometria",
      "Logaritmi e Esponenziali", "Geometria", "Probabilità, Combinatoria e Statistica", "Simulazioni"
    ];
    
    // For each section, create a section container
    Object.keys(sectionsMap).forEach(sectionKey => {
      const section = Number(sectionKey);
      const sectionDiv = document.createElement("div");
      sectionDiv.classList.add("section");
      sectionDiv.innerHTML = `<h3>${sectionNames[section - 1]}</h3>`;
      
      // Group tests within this section by test_number
      const testsInSection = sectionsMap[section];
      const groups = {};
      testsInSection.forEach(test => {
        if (!groups[test.test_number]) {
          groups[test.test_number] = [];
        }
        groups[test.test_number].push(test);
      });
      
      // Create a container for the columns (one per test_number)
      const groupsContainer = document.createElement("div");
      groupsContainer.style.display = "flex";
      groupsContainer.style.gap = "20px";
      
      // For each test_number group, sort by progressivo and create a column
      Object.keys(groups).forEach(testNumKey => {
        const testNumber = Number(testNumKey);
        const group = groups[testNumber];
        group.sort((a, b) => a.progressivo - b.progressivo);
        
        const columnDiv = document.createElement("div");
        columnDiv.style.display = "flex";
        columnDiv.style.flexDirection = "column";
        columnDiv.style.alignItems = "center";

        
        // For each test in this group, create a button
        group.forEach(test => {
          // Find student's progress for this test
          const studentTest = studentTests.find(t => 
            t.section === test.section &&
            t.test_number === test.test_number &&
            t.progressivo === test.progressivo
          );
          const status = studentTest ? studentTest.status : "locked";
          
          const testBtn = document.createElement("button");
          // Label the button with its progressivo number
          if (test.section === 7) {
            testBtn.textContent = `Simulazione ${test.test_number}`;
            } else {
                if (test.test_number === 1) {
                    testBtn.textContent = `Esercizi per casa ${test.progressivo}`;
                } else if (test.test_number === 2) {
                    testBtn.textContent = `Assessment`;
                }
            } 
          
          // Apply status styling and actions
          if (status === "completed") {
            testBtn.classList.add("completed");
          } else if (status === "locked") {
            testBtn.disabled = true;
            testBtn.classList.add("locked");
          } else {
            testBtn.onclick = () => startTolcTest(test.section, test.test_number, test.progressivo);
          }
          
          columnDiv.appendChild(testBtn);
        });
        
        groupsContainer.appendChild(columnDiv);
      });
      
      sectionDiv.appendChild(groupsContainer);
      testTree.appendChild(sectionDiv);
    });
  }

// ✅ Display Bocconi test structure
function displayBocconiTree(tests, studentTests) {
    const testTree = document.getElementById("testTree");
    testTree.innerHTML = "";
    const sectionDiv = document.createElement("div");
    sectionDiv.classList.add("section");
    sectionDiv.innerHTML = `<h3>Simulazioni</h3>`;
    testTree.appendChild(sectionDiv);

    tests.forEach(test => {
        const testBtn = document.createElement("button");
        testBtn.textContent = `Test ${test.test_number}`;
        
        const studentTest = studentTests.find(t => t.section === test.section && t.test_number === test.test_number);
        const status = studentTest ? studentTest.status : "locked";

        if (status === "completed") {
            //testBtn.textContent += " ✔ Done";
            testBtn.classList.add("completed");
        } else if (status === "locked") {
            testBtn.disabled = true;
            testBtn.classList.add("locked");
        } else {
            testBtn.onclick = () => startBocconiTest(test.section, test.test_number);
        }

        sectionDiv.appendChild(testBtn);
    });
}

async function startTolcTest(section, testNumber, testProgressivo) {
    const { data: testQuestion, error } = await supabase
        .from("questions")
        .select("pdf_url")
        .eq("section", section)
        .eq("test_number", testNumber)
        .eq("progressivo", testProgressivo)
        .limit(1)
        .single();

    if (error || !testQuestion) {
        console.error("❌ Error fetching PDF URL:", error?.message);
        alert("Error loading test. Please try again.");
        return;
    }

    sessionStorage.setItem("testPdf", testQuestion.pdf_url);
    sessionStorage.setItem("currentSection", section);
    sessionStorage.setItem("currentTestNumber", testNumber);
    sessionStorage.setItem("currentTestProgressivo", testProgressivo);
    window.location.href = "test.html";
}

async function startBocconiTest(section, testNumber) {
    sessionStorage.setItem("currentSection", section);
    sessionStorage.setItem("currentTestNumber", testNumber);
    window.location.href = "test_bocconi.html";
}