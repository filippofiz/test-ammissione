document.addEventListener("DOMContentLoaded", async () => {
    await loadTestTree();
});

async function loadTestTree() {
    const selectedTest = sessionStorage.getItem("selectedTestType");

    if (!selectedTest) {
        alert("No test selected. Redirecting to test selection...");
        window.location.href = "choose_test.html";
        return;
    }

    console.log(`🎯 Selected Test: ${selectedTest}`);

    // Determine test type based on "PDF"
    const testType = selectedTest.includes("PDF") ? "pdf" : "banca_dati";
    console.log(`📌 Determined Test Type: ${testType}`);

    // Get active session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData || !sessionData.session) {
        console.error("❌ No active session:", sessionError?.message);
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    const user = sessionData.session.user;
    console.log("👤 Logged-in User ID:", user.id);

    // ✅ Fetch the student's section order from `ordine_sections`
    const { data: studentTestOrder, error: studentTestOrderError } = await supabase
        .from("ordine_sections")
        .select("ordine")
        .eq("auth_uid", user.id)
        .eq("tipologia_test", selectedTest);

    if (studentTestOrderError || !studentTestOrder || studentTestOrder.length === 0) {
        console.error("❌ Error fetching student's section order:", studentTestOrderError?.message);
        window.location.href = "choose_test.html";
        alert("Section order not found. Please contact support.");
        return;
    }

    // ✅ Ensure `ordineSections` contains only unique values
    let ordineSections = [...new Set(studentTestOrder[0].ordine)];
    console.log("📊 Section Order (Unique):", ordineSections);

    if (!ordineSections || ordineSections.length === 0) {
        console.error("❌ ordine_sections is empty or missing.");
        alert("No section order available. Please contact support.");
        window.location.href = "choose_test.html";
        return;
    }

    // ✅ Fetch student's test progress
    let { data: studentTests, error: progressError } = await supabase
        .from("student_tests")
        .select("*")
        .eq("auth_uid", user.id)
        .eq("tipologia_test", selectedTest)
        .order("tipologia_esercizi, progressivo");

    if (progressError) {
        console.error("❌ Error fetching student progress:", progressError.message);
        window.location.href = "choose_test.html";
        return;
    }

    console.log("📊 Student Progress Data:", studentTests);
    console.log("📊 Selected Test Type:", selectedTest);

    // ✅ Ensure only unique sections exist in test data
    studentTests = studentTests.filter((test, index, self) =>
        index === self.findIndex((t) =>
             t.section === test.section &&
             t.tipologia_esercizi === test.tipologia_esercizi &&
             t.progressivo === test.progressivo
        )
    );

    // ✅ Sort test data based on `ordine_sections`
    studentTests.sort((a, b) => ordineSections.indexOf(a.section) - ordineSections.indexOf(b.section));
    
    displayTestTree(studentTests, studentTests, testType, selectedTest);
}

function displayTestTree(tests,studentTests, testType, selectedTest) {
    const testTree = document.getElementById("testTree");
    testTree.innerHTML = "";

    // Group tests by section first
    const sectionsMap = {};
    tests.forEach(test => {
        if (!sectionsMap[test.section]) {
            sectionsMap[test.section] = {};
        }
        if (!sectionsMap[test.section][test.tipologia_esercizi]) {
            sectionsMap[test.section][test.tipologia_esercizi] = [];
        }
        sectionsMap[test.section][test.tipologia_esercizi].push(test);
    });

    // For each section, create a section container
    Object.keys(sectionsMap).forEach(sectionKey => {
        const section = sectionKey; // Section names are already stored correctly
        const sectionDiv = document.createElement("div");
        sectionDiv.classList.add("section");
        sectionDiv.innerHTML = `<h3>${section}</h3>`;

        // Container for different types of exercises (Esercizi per casa, Assessment, Simulazioni)
        const tipologiaContainer = document.createElement("div");
        tipologiaContainer.style.display = "flex";
        tipologiaContainer.style.flexDirection = "column";
        tipologiaContainer.style.gap = "10px";

        // Ensure "Esercizi per casa" comes first, then "Assessment"
        const orderedTipologie = Object.keys(sectionsMap[section]).sort((a, b) => {
            if (a === "Esercizi per casa") return -1;
            if (b === "Esercizi per casa") return 1;
            if (a === "Assessment") return -1;
            if (b === "Assessment") return 1;
            return 0;
        });

        // Group by `tipologia_esercizi`
        orderedTipologie.forEach(tipologia => {
            const testsInTipologia = sectionsMap[section][tipologia];

            // Group tests within this tipologia by progressivo
            const groups = {};
            testsInTipologia.forEach(test => {
                if (!groups[test.progressivo]) {
                    groups[test.progressivo] = [];
                }
                groups[test.progressivo].push(test);
            });

            // Create a container for the columns (one per progressivo)
            const groupsContainer = document.createElement("div");
            groupsContainer.style.display = "flex";
            groupsContainer.style.gap = "20px";
            groupsContainer.style.marginBottom = "10px";

            // Label for tipologia
            const tipologiaLabel = document.createElement("h4");
            tipologiaLabel.textContent = tipologia;
            tipologiaContainer.appendChild(tipologiaLabel);

            // Ensure progressivo values are sorted correctly
            const orderedProgressivi = Object.keys(groups).map(Number).sort((a, b) => a - b);

            // For each progressivo group, create a column
            orderedProgressivi.forEach(progressivo => {
                const group = groups[progressivo];

                const columnDiv = document.createElement("div");
                columnDiv.style.display = "flex";
                columnDiv.style.flexDirection = "column";
                columnDiv.style.alignItems = "center";

                // For each test in this group, create a button
                group.forEach(test => {
                    // Find student's progress for this test
                    const studentTest = studentTests.find(t =>
                        t.section === test.section &&
                        t.tipologia_esercizi === test.tipologia_esercizi &&
                        t.progressivo === test.progressivo &&
                        t.id === test.id
                    );
                    const status = studentTest ? studentTest.status : "locked";

                    const testBtn = document.createElement("button");
                    testBtn.textContent = `${tipologia} ${test.progressivo}`;

                    // Apply status styles
                    if (status === "completed") {
                        testBtn.classList.add("completed");
                    } else if (status === "locked") {
                        testBtn.disabled = true;
                        testBtn.classList.add("locked");
                    } else {
                        if (testType === "pdf") {
                            testBtn.onclick = () => startPdfTest(test.section, test.tipologia_esercizi, test.progressivo, selectedTest,test.id);
                        } else {
                            testBtn.onclick = () => startBancaDatiTest(test.section, test.tipologia_esercizi, test.progressivo, selectedTest, test.id);
                        }
                    }
                    columnDiv.appendChild(testBtn);
                });

                groupsContainer.appendChild(columnDiv);
            });

            tipologiaContainer.appendChild(groupsContainer);
        });

        sectionDiv.appendChild(tipologiaContainer);
        testTree.appendChild(sectionDiv);
    });
}

// ✅ Start PDF test
async function startPdfTest(section, tipologia_esercizi, testProgressivo, selectedTest, testId) {
    console.log(`🚀 Starting PDF Test: ${section} - ${tipologia_esercizi} - ${testProgressivo} - ${selectedTest} - ${testId}`);
    const { data: testQuestion, error } = await supabase
        .from("questions")
        .select("pdf_url")
        .eq("section", section)
        .eq("tipologia_esercizi", tipologia_esercizi)
        .eq("progressivo", testProgressivo)
        .eq("tipologia_test", selectedTest)
        .limit(1)
        .single();
    

    if (error || !testQuestion) {
        console.error("❌ Error fetching PDF URL:", error?.message);
        alert("Error loading test. Please try again.");
        return;
    }

    sessionStorage.setItem("testPdf", testQuestion.pdf_url);
    sessionStorage.setItem("currentSection", section);
    sessionStorage.setItem("currentTipologiaEsercizi", tipologia_esercizi);
    sessionStorage.setItem("currentTestProgressivo", testProgressivo);
    sessionStorage.setItem("selectedTestId", testId);
    window.location.href = "test.html";
}

// ✅ Start Banca Dati test
async function startBancaDatiTest(section, tipologia_esercizi, testProgressivo, selectedTest, testId) {  
    console.log(`🚀 Starting Banca Dati Test: ${section} - ${tipologia_esercizi} - ${testProgressivo} - ${selectedTest}`);   
    sessionStorage.setItem("currentSection", section);
    sessionStorage.setItem("currentTipologiaEsercizi", tipologia_esercizi);
    sessionStorage.setItem("currentTestProgressivo", testProgressivo);
    sessionStorage.setItem("selectedTestId", testId);
    window.location.href = "test_bocconi.html";
}