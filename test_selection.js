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
        // ——————— AUTO-UNLOCK PASS ———————
    //
    // For each automatic test, if the previous unlock_order
    // (also automatic) is completed, unlock this one.
    //
    for (const test of studentTests) {
      if (test.unlock_mode === "automatic" && test.unlock_order > 0) {
        const prevOrder = test.unlock_order - 1;
        const prevTest = studentTests.find(t => t.unlock_order === prevOrder && t.tipologia_test === test.tipologia_test && t.auth_uid === test.auth_uid && t.status === "completed");
        if (
          prevTest &&
          prevTest.unlock_mode === "automatic" &&
          prevTest.status === "completed" &&
          test.status !== "completed"
        ) {
          const { error: updateError } = await supabase
            .from("student_tests")
            .update({ status: "unlocked" })
            .eq("id", test.id);

          if (!updateError) {
            // update our local copy so the UI will render correctly
            test.status = "unlocked";
          } else {
            console.error(
              `❌ Auto-unlock failed for test id ${test.id}:`,
              updateError.message
            );
          }
        }
      }
    }
    // —————————————————————————————————————
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
    // 1️⃣ Fetch Materia for each question
    const { data: questionsData, error: materiaError } = await supabase
    .from("questions")
    .select("section, tipologia_esercizi, progressivo, Materia")
    .eq("tipologia_test", selectedTest);

    if (materiaError) {
    console.error("❌ Error fetching Materia info:", materiaError.message);
    }

    // 2️⃣ Build a quick lookup: "section|tipologia|progressivo" → Materia
    const materiaMap = {};
    questionsData.forEach(q => {
    materiaMap[`${q.section}|${q.tipologia_esercizi}|${q.progressivo}`] = q.Materia;
    });

    // 3️⃣ Attach `Materia` to each studentTests record
    studentTests = studentTests.map(t => ({
    ...t,
    Materia: materiaMap[`${t.section}|${t.tipologia_esercizi}|${t.progressivo}`] || ""
    }));

    // Finally call your renderer with the enriched array
    displayTestTree(studentTests, studentTests, testType, selectedTest);
}

function displayTestTree(tests, studentTests, testType, selectedTest) {
    const testTree = document.getElementById("testTree");
    testTree.innerHTML = "";
  
    // 1️⃣ Group by Materia (blank → "Altro")
    const byMateria = {};
    tests.forEach(test => {
      const mat = test.Materia || "Altro";
      if (!byMateria[mat]) byMateria[mat] = [];
      byMateria[mat].push(test);
    });
  
    // 2️⃣ Decide ordering: Simulazioni first, then others α, then Altro last
    const materiaKeys = Object.keys(byMateria).sort((a, b) => {
        if (a === "Simulazioni") return  1;           // a goes after b
        if (b === "Simulazioni") return -1;           // a goes before b
        return a.localeCompare(b);                    // otherwise alphabetical
      });
  
    materiaKeys.forEach(materia => {
      const group = byMateria[materia];
      // Section wrapper for this Materia
      const matDiv = document.createElement("div");
      matDiv.classList.add("materia-section");
  
      // Header
      const h2 = document.createElement("h2");
      h2.classList.add("materia-header");
      h2.textContent = materia === "Altro" ? "Altre Materie" : materia;
      matDiv.appendChild(h2);
  
      // If Simulazioni → flat list
      if (materia === "Simulazioni") {
        const flat = document.createElement("div");
        flat.style.display = "flex";
        flat.style.flexWrap = "wrap";
        flat.style.gap = "8px";
  
        group.forEach(test => {
          const studentEntry = studentTests.find(t => t.id === test.id);
          const status = studentEntry?.status || "locked";
  
          const btn = document.createElement("button");
          btn.textContent = btn.textContent = `Test ${test.progressivo}`;;          // only the number
          if (status === "completed") btn.classList.add("completed");
          else if (status === "locked") {
            btn.disabled = true;
            btn.classList.add("locked");
          } else {
            // same click handlers as before
            if (testType === "pdf") {
              btn.onclick = () => startPdfTest(test.section, test.tipologia_esercizi, test.progressivo, selectedTest, test.id);
            } else {
              btn.onclick = () => startBancaDatiTest(test.section, test.tipologia_esercizi, test.progressivo, selectedTest, test.id);
            }
          }
          flat.appendChild(btn);
        });
  
        matDiv.appendChild(flat);
  
      } else {
        // Nested grouping (section → tipologia → progressivo)
        const sectionsMap = {};
        group.forEach(test => {
          if (!sectionsMap[test.section]) sectionsMap[test.section] = {};
          if (!sectionsMap[test.section][test.tipologia_esercizi]) {
            sectionsMap[test.section][test.tipologia_esercizi] = [];
          }
          sectionsMap[test.section][test.tipologia_esercizi].push(test);
        });
  
        Object.keys(sectionsMap).forEach(sectionKey => {
          const sectionDiv = document.createElement("div");
          sectionDiv.classList.add("section");
          sectionDiv.innerHTML = `<h3>${sectionKey}</h3>`;
  
          const tipContainer = document.createElement("div");
          tipContainer.style.display = "flex";
          tipContainer.style.flexDirection = "column";
          tipContainer.style.gap = "10px";
  
          // Order tipologie as before
          const tipKeys = Object.keys(sectionsMap[sectionKey]).sort((a, b) => {
            if (a === "Esercizi per casa") return -1;
            if (b === "Esercizi per casa") return  1;
            if (a === "Assessment")          return -1;
            if (b === "Assessment")          return  1;
            return 0;
          });
  
          tipKeys.forEach(tip => {
            const testsInTip = sectionsMap[sectionKey][tip];
            const groups = {};
            testsInTip.forEach(t => {
              if (!groups[t.progressivo]) groups[t.progressivo] = [];
              groups[t.progressivo].push(t);
            });
  
            const tipLabel = document.createElement("h4");
            tipLabel.textContent = tip;
            tipContainer.appendChild(tipLabel);
  
            const colWrapper = document.createElement("div");
            colWrapper.style.display = "flex";
            colWrapper.style.gap = "20px";
            colWrapper.style.marginBottom = "10px";
  
            Object.keys(groups).sort((a,b)=>a-b).forEach(prog => {
              const col = document.createElement("div");
              col.style.display = "flex";
              col.style.flexDirection = "column";
              col.style.alignItems = "center";
  
              groups[prog].forEach(test => {
                const studentEntry = studentTests.find(t => t.id === test.id);
                const status = studentEntry?.status || "locked";
  
                const btn = document.createElement("button");
                btn.textContent = `${tip} ${test.progressivo}`;
  
                if (status === "completed") btn.classList.add("completed");
                else if (status === "locked") {
                  btn.disabled = true;
                  btn.classList.add("locked");
                } else {
                  if (testType === "pdf") {
                    btn.onclick = () => startPdfTest(test.section, test.tipologia_esercizi, test.progressivo, selectedTest, test.id);
                  } else {
                    btn.onclick = () => startBancaDatiTest(test.section, test.tipologia_esercizi, test.progressivo, selectedTest, test.id);
                  }
                }
                col.appendChild(btn);
              });
  
              colWrapper.appendChild(col);
            });
  
            tipContainer.appendChild(colWrapper);
          });
  
          sectionDiv.appendChild(tipContainer);
          matDiv.appendChild(sectionDiv);
        });
      }
  
      testTree.appendChild(matDiv);
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
    window.location.href = "test_bancaDati.html";
}