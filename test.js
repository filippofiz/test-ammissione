const supabase = window.supabase;

let questions = [];
let currentPage = 1;
let totalPages = 1;
let studentAnswers = {};
let sectionPageBoundaries = {};
let sectionPageStartPages = {};
let testEndTime;
let pdfDoc = null; // Holds the loaded PDF document
let isSubmitting = false;
let testDuration; // New global variable
const testId = sessionStorage.getItem("selectedTestId");
let globalCurrentSection = "";
let sectionNames = null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded. Initializing test...");
    console.log("Selected Test ID:", testId);
    const submitBtn = document.getElementById("submitAnswers");

    if (!submitBtn) {
        console.error("ERROR: 'submitAnswers' button not found in HTML.");
        return;
    }

    console.log("Submit button found!");

    submitBtn.addEventListener("click", async () => {
        console.log("Submit button clicked!");
        await submitAnswers();
    });

    // Ensure navigation buttons exist
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");

    if (!prevPageBtn || !nextPageBtn) {
        console.error("ERROR: One or more navigation buttons not found in HTML.");
        return;
    }

    //Add event listeners for navigation
    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) loadQuestionsForPage(currentPage - 1);
    });
    nextPageBtn.addEventListener("click", () => {
        const nextPage = currentPage + 1;
        if (nextPage > totalPages) return;
        
        // Only prompt confirmation if the button is labeled "Prossima Sezione"
        if (nextPageBtn.textContent.trim() === "Prossima Sezione") {
        customConfirm("Stai per passare alla prossima sezione. Vuoi continuare?").then(confirmChange => {
            if (!confirmChange) return;
            loadQuestionsForPage(nextPage);
        });
        return;
        }
        
        loadQuestionsForPage(nextPage);
      });

    //Load test and PDF
    await loadTest();
});

async function loadTest() {
    const pdfUrl = sessionStorage.getItem("testPdf");
    const currentSection = sessionStorage.getItem("currentSection"); // Ensure it's a number
    const tipologiaEsercizi = sessionStorage.getItem("currentTipologiaEsercizi"); // new
    const selectedTestType = sessionStorage.getItem("selectedTestType"); // new
  
    console.log("Fetching test for PDF URL:", pdfUrl);
  
    if (!pdfUrl) {
      alert("Test PDF not found! Contact your tutor.");
      console.error("ERROR: No `testPdf` found in sessionStorage.");
      window.location.href = "test_selection.html";
      return;
    }
  
    let studentId = sessionStorage.getItem("studentId");
  
    // If `studentId` is missing, fetch it again (existing code)...
    if (!studentId) {
      console.log("🔄 Fetching student ID from Supabase...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData || !sessionData.session) {
        console.error("❌ ERROR: No active session found.");
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
      }
      studentId = sessionData.session.user.id;
      sessionStorage.setItem("studentId", studentId); // ✅ Save it again
      console.log("✅ Student ID restored:", studentId);
    }
  
    console.log("🎯 Student ID:", studentId);
  
    // Load PDF first, but don't render yet.
    await loadPdf(pdfUrl);
 
    // If tipologia_esercizi is "Simulazioni", fetch dynamic boundaries and section names.
    if (currentSection === "Simulazioni") {
      globalCurrentSection = currentSection; // store it globally
      const { data: simulazioniData, error: simulazioniError } = await supabase
        .from("simulazioni_parti")
        .select("boundaries, nome_parti")
        .eq("tipologia_test", selectedTestType)
        .single();
      if (simulazioniError || !simulazioniData) {
        console.error("Error fetching simulazioni boundaries:", simulazioniError);
        return;
      }
      const boundariesFilter = simulazioniData.boundaries; // expects an array of integers
      sectionNames = simulazioniData.nome_parti; // expects an array of section names
      console.log("Fetched dynamic boundaries:", boundariesFilter);
      console.log("Fetched section names:", sectionNames);

      // Now fetch the page numbers for questions whose question_number is in our dynamic boundaries array.
      const { data: boundaries, error: boundaryError } = await supabase
        .from("questions")
        .select("question_number, page_number")
        .eq("pdf_url", pdfUrl)
        .in("question_number", boundariesFilter)
        .order("question_number");
      if (boundaryError) {
        console.error("❌ Error fetching section boundaries:", boundaryError.message);
        return;
      }
      console.log("📌 Section Boundaries (Page Numbers):", boundaries);

      // Reset the section boundaries objects.
      sectionPageBoundaries = {};
      sectionPageStartPages = {};

      // Map the fetched boundaries to section numbers.
      boundaries.forEach(q => {
        const index = boundariesFilter.indexOf(q.question_number);
        if (index !== -1) {
          const sectionNumber = index + 2; // first boundary becomes section 2, etc.
          sectionPageBoundaries[sectionNumber] = q.question_number;
          sectionPageStartPages[sectionNumber] = q.page_number;
        }
      });
      console.log("Section Boundaries Loaded:", sectionPageBoundaries);
    } else {
      // If not Simulazioni, clear boundaries (they're not used)
      sectionPageBoundaries = {};
      sectionPageStartPages = {};
    }

    console.log("Section Boundaries Loaded:", sectionPageBoundaries);
  
    // Fetch test duration (existing code)...
    const { data: testData, error: testError } = await supabase
      .from("student_tests")
      .select("duration")
      .eq("auth_uid", studentId)
      .eq("section", currentSection)
      .eq("tipologia_esercizi", sessionStorage.getItem("currentTipologiaEsercizi"))
      .eq("progressivo", sessionStorage.getItem("currentTestProgressivo"))
      .eq("tipologia_test", selectedTestType)
      .single();
    if (testError || !testData) {
      console.error("❌ Error fetching test duration:", testError?.message);
      alert("Test not found.");
      return;
    }
    console.log("📌 Test Duration:", testData.duration, "seconds");
  
    testDuration = testData.duration; // Store the duration for later use
  
    // Fetch questions (existing code)...
    let { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("pdf_url", pdfUrl)
      .order("page_number, question_number", { ascending: true });
    console.log("Supabase Response:", data, error);
    if (error) {
      console.error("ERROR fetching questions:", error);
      alert("Error loading questions! Check Console.");
      return;
    }
    if (!data || data.length === 0) {
      console.warn("⚠️ WARNING: No questions found for this PDF.");
      alert("No questions available for this test.");
      return;
    }
  
    questions = data;
    totalPages = Math.max(...questions.map(q => q.page_number));
  
    // Build nav grid once and load first page.
    buildQuestionNav();
    console.log(`Test loaded successfully! Total pages: ${totalPages}`);
    loadQuestionsForPage(1);
  }

async function loadPdf(pdfUrl) {
    console.log("Loading PDF from:", pdfUrl);

    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;

        console.log(`PDF Loaded! Total pages: ${pdfDoc.numPages}`);

        //Render first page
        renderPage(1);
    } catch (error) {
        console.error("ERROR Loading PDF:", error);
        alert("Failed to load PDF. Check console for details.");
    }
}

let zoomLevel = 1.2; // Default zoom level
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

let isRendering = false;  // ✅ Prevents multiple rendering calls

async function renderPage(pageNumber) {
    if (!pdfDoc) {
        console.error("ERROR: PDF not loaded yet!");
        return;
    }

    if (isRendering) {
        console.warn(`⚠️ Already rendering page ${pageNumber}. Skipping duplicate call.`);
        return;
    }

    isRendering = true;  // ✅ Set flag to prevent another render while in progress
    console.log(`Rendering Page: ${pageNumber} at Zoom Level: ${zoomLevel}`);

    try {
        const page = await pdfDoc.getPage(pageNumber);
        const canvas = document.getElementById("pdfCanvas");
        const ctx = canvas.getContext("2d");
        const pdfViewer = document.querySelector(".pdf-viewer");

        // ✅ Get viewport based on zoom level
        const viewport = page.getViewport({ scale: zoomLevel });

        // ✅ Ensure high resolution on Retina displays
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // ✅ Set correct scaling
        ctx.scale(outputScale, outputScale);

        // ✅ Clear previous rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ✅ Render PDF onto the canvas
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        await page.render(renderContext);

        // ✅ Ensure viewer can fully scroll when zoomed
        pdfViewer.scrollLeft = (canvas.width - pdfViewer.clientWidth) / 2;
        pdfViewer.scrollTop = (canvas.height - pdfViewer.clientHeight) / 2;
        setTimeout(() => { isRendering = false; }, 300);
    } catch (error) {
        console.error("❌ ERROR rendering page:", error);
    } finally {
        isRendering = false;  // ✅ Reset flag after render completes
    }
}
    

// ✅ Function to Adjust Scrolling After Zoom
function adjustScrolling() {
    const pdfViewer = document.querySelector(".pdf-viewer");
    const canvas = document.getElementById("pdfCanvas");

    pdfViewer.scrollLeft = (canvas.width - pdfViewer.clientWidth) / 2;
    pdfViewer.scrollTop = (canvas.height - pdfViewer.clientHeight) / 2;
}

// ✅ Zoom controls
document.getElementById("zoomIn").addEventListener("click", () => {
    zoomLevel = Math.min(zoomLevel + 0.2, 3.0); // Max zoom: 3.0x
    renderPage(currentPage);
});

document.getElementById("zoomOut").addEventListener("click", () => {
    zoomLevel = Math.max(zoomLevel - 0.2, 0.5); // Min zoom: 0.5x
    renderPage(currentPage);
});

// ✅ Enable Drag Scrolling When Zoomed In
const pdfViewer = document.querySelector(".pdf-viewer");

pdfViewer.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - pdfViewer.offsetLeft;
    startY = e.pageY - pdfViewer.offsetTop;
    scrollLeft = pdfViewer.scrollLeft;
    scrollTop = pdfViewer.scrollTop;
    pdfViewer.style.cursor = "grabbing";
});

pdfViewer.addEventListener("mouseleave", () => {
    isDragging = false;
    pdfViewer.style.cursor = "grab";
});

pdfViewer.addEventListener("mouseup", () => {
    isDragging = false;
    pdfViewer.style.cursor = "grab";
});

pdfViewer.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - pdfViewer.offsetLeft;
    const y = e.pageY - pdfViewer.offsetTop;
    const walkX = (x - startX) * 1.5; // Adjust scroll speed
    const walkY = (y - startY) * 1.5;
    pdfViewer.scrollLeft = scrollLeft - walkX;
    pdfViewer.scrollTop = scrollTop - walkY;
});


function loadQuestionsForPage(page) {
    updateSectionHeader(page);
    const submitButton = document.getElementById("submitAnswers");    
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");

    console.log(`📄 Loading Page: ${page}`);

    currentPage = page;
    sessionStorage.setItem("currentPage", currentPage);

    renderPage(page);
    buildQuestionNav(); // Refresh nav grid highlight

    const questionContainer = document.getElementById("question-container");
    if (!questionContainer) {
      console.error("ERROR: 'question-container' not found in HTML!");
      return;
    }
    questionContainer.innerHTML = "";

    // ✅ First Page Special Display: Hide Navigation & Show Welcome Message
    if (page === 1) {
        console.log("📄 First Page - Showing Welcome Message");

        questionContainer.innerHTML = `
            <h2>Il test è da svolgere a schermo intero. Ogni tentativo di uscire annulla il test. Buon lavoro! 🎯</h2>
            <p>Premi "Inizia Test" per cominciare.</p>
            <button id="startTestBtn">Inizia Test</button>
        `;

        // ✅ Hide navigation buttons
        prevPageBtn.style.display = "none";
        nextPageBtn.style.display = "none";
        if (submitButton) submitButton.style.display = "none";


        // Attach event listener to "Inizia Test"
        document.getElementById("startTestBtn").addEventListener("click", async () => {
            await enforceFullScreen();  // Go fullscreen before starting
            // Recalculate testEndTime now that the test is starting
            testEndTime = Date.now() + testDuration * 1000;
            updateTimer();  // Start the timer
            loadQuestionsForPage(2);  // Move to the first real test page
        });

        return; // ✅ Prevent further execution
    }

    // ✅ Show navigation buttons again on other pages
    prevPageBtn.style.display = "inline-block";
    nextPageBtn.style.display = "inline-block";
    if (submitButton) submitButton.style.display = "inline-block";

    const pageQuestions = questions.filter(q => q.page_number === currentPage);

    if (pageQuestions.length === 0) {
        console.warn(`⚠️ No questions found on Page ${page}.`);
        return;
    }

    pageQuestions.forEach(q => {
        const questionDiv = document.createElement("div");
        questionDiv.innerHTML = `<h3>Quesito ${q.question_number}</h3>`;

        if (q.is_open_ended) {
            let input = document.createElement("input");
            input.type = "text";
            input.value = studentAnswers[q.id] || "";
            input.oninput = () => studentAnswers[q.id] = input.value;
            questionDiv.appendChild(input);
        } else {
            let choices = (q.wrong_answers || []).concat(q.correct_answer);
            // Add the two extra choices:
            choices = choices.concat(["insicuro", "non ho idea"]);
            choices.sort((a, b) => a.localeCompare(b));

            choices.forEach(choice => {
                let btn = document.createElement("button");
                btn.textContent = choice;
                btn.onclick = () => selectAnswer(q.id, choice, btn);

                if (studentAnswers[q.id] === choice || 
                    (choice.toLowerCase() === "insicuro" && studentAnswers[q.id] === "x") ||
                    (choice.toLowerCase() === "non ho idea" && studentAnswers[q.id] === "y")) {
                     btn.style.background = "green";
                 }

                questionDiv.appendChild(btn);
            });
        }

        questionContainer.appendChild(questionDiv);
    });

    updateNavigationButtons();
}

function selectAnswer(questionId, answer, btn) {
    let mappedAnswer = answer;
    // Map "insicuro" and "non ho idea" to "x" and "y" respectively.
    if (answer.toLowerCase() === "insicuro") {
      mappedAnswer = "x";
    } else if (answer.toLowerCase() === "non ho idea") {
      mappedAnswer = "y";
    }
    
    // Toggle the answer: if already selected, unselect it.
    if (studentAnswers[questionId] === mappedAnswer) {
      delete studentAnswers[questionId];
      mappedAnswer = null;
    } else {
      studentAnswers[questionId] = mappedAnswer;
    }
    
    buildQuestionNav(); // Update the navigation grid
    
    // Update buttons within the question UI.
    const questionDiv = btn.closest("div");
    const buttons = questionDiv.querySelectorAll("button");
    
    buttons.forEach(b => {
      let btnMapped = b.textContent;
      // Normalize the text for the extra choices.
      if (btnMapped.toLowerCase() === "insicuro") btnMapped = "x";
      if (btnMapped.toLowerCase() === "non ho idea") btnMapped = "y";
      
      if (btnMapped === studentAnswers[questionId]) {
        // If the chosen answer is one of the extra ones, color it yellow; otherwise, green.
        if (studentAnswers[questionId] === "x" || studentAnswers[questionId] === "y") {
          b.style.background = "yellow";
        } else {
          b.style.background = "green";
        }
      } else {
        b.style.background = "";
      }
    });
  }

async function submitAnswers() {
    // Ask the student to confirm before submission.
    if (!confirm("Sei sicuro di voler inviare le risposte?")) {
        return; // If they cancel, do nothing.
    }
    isSubmitting = true;
    let studentId = sessionStorage.getItem("studentId");

    // ✅ If `studentId` is missing, fetch it again
    if (!studentId) {
        console.log("🔄 Fetching student ID from Supabase...");

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData || !sessionData.session) {
            console.error("❌ ERROR: No active session found.");
            alert("Session expired. Please log in again.");
            window.location.href = "login.html";
            return;
        }

        studentId = sessionData.session.user.id;
        sessionStorage.setItem("studentId", studentId); // ✅ Save it again
        console.log("✅ Student ID restored:", studentId);
    }

    if (Object.keys(studentAnswers).length === 0) {
        alert("No answers selected. Please answer at least one question.");
        return;
    }

    console.log("📌 Submitting answers for student:", studentId);

    // Instead of mapping over studentAnswers, loop over all questions:
    const submissions = questions.map(q => {
        // If no answer selected for this question, assign "z"
        const answer = (q.id in studentAnswers) ? studentAnswers[q.id] : "z";
        let auto_score = null;
        if (!q.is_open_ended) {
            auto_score = answer === q.correct_answer ? 1 : 0;
        }
        return {
            auth_uid: studentId,  // Using auth_uid
            question_id: q.id,
            answer: answer,
            auto_score: auto_score,
            test_id: testId
        };
    });

    console.log("✅ Final submission data:", submissions);

    // ✅ Insert into Supabase
    let { data, error } = await supabase
        .from("student_answers")
        .insert(submissions);

    if (error) {
        console.error("❌ ERROR submitting answers:", error);
        alert("Submission failed. Please try again.");
    } else {
        console.log("✅ Answers submitted successfully!", data);
        alert("Answers submitted successfully!");
    }

    // ✅ Mark test as completed in `student_tests`
    await supabase
        .from("student_tests")
        .update({ status: "completed" })
        .eq("auth_uid", studentId)
        .eq("section", sessionStorage.getItem("currentSection"))
        .eq("tipologia_esercizi", sessionStorage.getItem("currentTipologiaEsercizi"))
        .eq("tipologia_test", sessionStorage.getItem("selectedTestType"))
        .eq("progressivo", sessionStorage.getItem("currentTestProgressivo"))
        .eq("id", testId);

    console.log("✅ Test marked as completed!");

    // ✅ Turn test button green in `test-selection.html`
    sessionStorage.setItem("testCompleted", "true");
    window.location.href = "test_selection.html";    
}

// ✅ Function to Update the Timer Display
function updateTimer() {
    const timerElement = document.getElementById("timer");

    if (!timerElement) {
        console.error("❌ ERROR: Timer element not found in HTML.");
        return;
    }

    function tick() {
        const now = new Date().getTime();
        const endTime = new Date(testEndTime).getTime();

        const timeLeft = endTime - now; // ✅ Correct calculation

        if (timeLeft <= 0) {
            console.log("⏳ Time's up! Auto-submitting answers...");
            submitAnswers();  // ✅ Auto-submit when time runs out
            clearInterval(timerInterval);
            return;
        }

        // ✅ Format Time (MM:SS)
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        timerElement.textContent = `Tempo rimasto: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    const timerInterval = setInterval(tick, 1000); // ✅ Update every second
    tick(); // ✅ Call once immediately
}

let currentSubsection = 1; // Track which subsection the student is on
function updateNavigationButtons() {
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");

    console.log(`🔄 Updating buttons for Page ${currentPage}`);

    // Determine test type based on the presence of "PDF" in the test name
    const selectedTest = sessionStorage.getItem("selectedTestType");
    const testType = selectedTest.includes("TOLC") ? "tolc" : "bocconi";
    const testModality = selectedTest.includes("PDF") ? "pdf" : "banca_dati";

    console.log(`📌 Test Type Determined: ${testType}`);

    const currentSection = sessionStorage.getItem("currentSection");
    if (testType === "tolc") {
        // TOLC navigation using section boundaries.
        const isSectionBoundary = Object.values(sectionPageStartPages).includes(currentPage);
        const isPastBoundary = Object.values(sectionPageStartPages).some(
            boundary => boundary && currentPage === boundary + 1
        );
        
        if (sessionStorage.getItem("currentSection") === "Simulazioni" && isSectionBoundary) {
            nextPageBtn.textContent = "Prossima Sezione";
        } else {
            nextPageBtn.textContent = "Avanti";
        }
        
        // Disable previous button if we are just past a section boundary.
        if (sessionStorage.getItem("currentSection") === "Simulazioni" && isPastBoundary) {
            prevPageBtn.disabled = true;
        } else {
            prevPageBtn.disabled = false;
        }
    } else if (testType === "bocconi" && testModality === "pdf") {
        prevPageBtn.disabled = true; // Disable previous button for Bocconi PDF tests
    } 

}      

// ✅ Select the test container (modify ID/class as needed)
const testContainer = document.querySelector("#testContainer"); // Ensure this ID exists in test.html

// ✅ Force Fullscreen on Wide Screen When Test Starts
async function enforceFullScreen() {
    if (window.innerWidth > 1024) { // ✅ Only for wide screens
        if (!document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
                console.log("🔲 Fullscreen Mode Activated");
            } catch (err) {
                console.error("❌ Fullscreen mode not supported:", err);
            }
        }
    }
}

// ✅ Detect Fullscreen Exit & Force Re-Entry
document.addEventListener("fullscreenchange", function () {
    if (isSubmitting) return; // ✅ Skip if already submitting
    if (!document.fullscreenElement) {
        alert("⚠ The test has been cancelled. You are being redirected to your progress tree.");
        window.location.href = "test_selection.html"; // ✅ Redirect immediately
    }
});


function buildQuestionNav() {
    const questionNav = document.getElementById("questionNav");
    if (!questionNav) return;
    questionNav.innerHTML = ""; // Clear existing buttons
  
    // Compute the "minimum allowed page" for the current section.
    // We sort all the section boundaries and choose the highest boundary that is less than the current page.
    let minPage = 1;
    const boundariesArr = Object.values(sectionPageBoundaries).sort((a, b) => a - b);
    for (const boundary of boundariesArr) {
      if (boundary < currentPage) {
        minPage = boundary;
      }
    }
  
    // Create a navigation button for every question.
    questions.forEach(q => {
      const btn = document.createElement("button");
      btn.classList.add("question-cell");
      btn.textContent = q.question_number;
  
      // Highlight if this question is on the current page.
      if (q.page_number === currentPage) {
        btn.classList.add("current-question");
      }
  
      // Highlight answered questions.
      if (studentAnswers[q.id]) {
        if (studentAnswers[q.id] === "x" || studentAnswers[q.id] === "y") {
          btn.style.backgroundColor = "yellow";
        } else {
          btn.classList.add("answered");
        }
      }
  
      // If the student is beyond the boundary, disable navigation for questions on or before that boundary.
      const targetSection = getSectionForQuestionNumber(q.question_number);
      const currentQuestion = questions.find(qq => qq.page_number === currentPage);
      const currentSectionNumber = getSectionForQuestionNumber(currentQuestion?.question_number || 1);
      
      if (targetSection < currentSectionNumber) {
        // ✅ Disable all buttons for previous sections
        btn.disabled = true;
      } else {
        btn.addEventListener("click", () => {
            if (targetSection > currentSectionNumber) {
              customConfirm("Stai per passare alla prossima sezione. Vuoi continuare?")
                .then(confirmChange => {
                  if (confirmChange) {
                    loadQuestionsForPage(q.page_number);
                  }
                  // else: do nothing, remain on the current page
                });
            } else {
              loadQuestionsForPage(q.page_number);
            }
          });
      }
  
      questionNav.appendChild(btn);
    });
  }

  function getSectionForPage(page) {
    const boundariesArr = Object.values(sectionPageBoundaries)
      .map(b => Number(b))
      .sort((a, b) => a - b);
  
    let section = 1;
    for (const boundary of boundariesArr) {
      if (page < boundary) break;
      section++;
    }
    return section;
  }

  function getSectionForQuestionNumber(questionNumber) {
    const boundaries = Object.entries(sectionPageBoundaries)
      .map(([section, qNum]) => ({ section: Number(section), qNum }))
      .sort((a, b) => a.qNum - b.qNum);
  
    let section = 1;
    for (const b of boundaries) {
      if (questionNumber - 1 < b.qNum) break;
      section = b.section;
    }
    return section;
  }  

  function customConfirm(message) {
    return new Promise(resolve => {
      // Create overlay for the modal
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '10000';
  
      // Create dialog box
      const dialog = document.createElement('div');
      dialog.style.background = '#fff';
      dialog.style.padding = '20px';
      dialog.style.borderRadius = '5px';
      dialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      dialog.innerHTML = `<p>${message}</p>`;
  
      // Create buttons container
      const btnContainer = document.createElement('div');
      btnContainer.style.marginTop = '10px';
      btnContainer.style.textAlign = 'right';
  
      // Create Yes button
      const btnYes = document.createElement('button');
      btnYes.textContent = 'Yes';
      btnYes.style.marginRight = '10px';
      btnYes.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(true);
      });
  
      // Create No button
      const btnNo = document.createElement('button');
      btnNo.textContent = 'No';
      btnNo.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(false);
      });
  
      btnContainer.appendChild(btnYes);
      btnContainer.appendChild(btnNo);
      dialog.appendChild(btnContainer);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    });
  }  

  function getCurrentSection() {
    // Get all questions for the current page.
    const pageQuestions = questions.filter(q => q.page_number === currentPage + 1);
    if (pageQuestions.length > 0) {
      // Use the first question's number (converted to Number) to determine the section.
      const firstQuestionNumber = Number(pageQuestions[0].question_number);
      return getSectionForQuestionNumber(firstQuestionNumber);
    }
    return 1;
  }  

  function updateSectionHeader(page) {
    const questionSection = document.querySelector(".question-section");
    if (!questionSection) return;
    
    // Remove any existing header
    const oldHeader = questionSection.querySelector(".section-header");
    if (oldHeader) {
      oldHeader.remove();
    }
    
    // Do not add header if we're on page 1
    if (page === 1) return;
    
    // Only add header if the test is "Simulazioni" and we have section names available.
    if (globalCurrentSection === "Simulazioni" && Array.isArray(sectionNames) && sectionNames.length > 0) {
      // Determine the current section number using your helper.
      const currentSectionNumber = getCurrentSection(); // This should return a number (e.g. 1,2,3,...)
      // Use the section name corresponding to that number.
      // (Assuming sectionNames is an array where the first element corresponds to section 1)
      const headerText =
        currentSectionNumber > 0 && currentSectionNumber <= sectionNames.length
          ? sectionNames[currentSectionNumber - 1]
          : "Sezione " + currentSectionNumber;
    
      const headerDiv = document.createElement("div");
      headerDiv.className = "section-header";
      headerDiv.innerHTML = `<p>${headerText}</p>`;
      
      // Insert header right after the timer element so it appears above the navigation buttons.
      const timerElement = document.getElementById("timer");
      if (timerElement) {
        timerElement.insertAdjacentElement("afterend", headerDiv);
      } else {
        // Fallback: insert at the top of the question section
        questionSection.insertAdjacentElement("afterbegin", headerDiv);
      }
    }
  }