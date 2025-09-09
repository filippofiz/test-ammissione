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
let timeAllocationPercentages = null; // Percentuali tempo per sezione
let sectionDurations = {}; // Durata in secondi per ogni sezione
let currentSectionNumber = 1; // Sezione corrente
let sectionStartTime = null; // Quando è iniziata la sezione corrente
let hasSections = false; // Se il test ha sezioni
let expiredSections = new Set(); // Sezioni con tempo scaduto
let isBocconiTest = false; // Se è un test BOCCONI (navigazione unidirezionale)
let isMedicinaTest = false; // Se è un test MEDICINA (comportamento da definire)
let selectedTestType = ""; // Tipo di test selezionato

// Gestione drawer navigazione per tablet
function setupTabletNavigation() {
    const navContainer = document.querySelector('.nav-container');
    
    if (!navContainer) return;
    
    // Aggiungi click handler per aprire/chiudere
    navContainer.addEventListener('click', function(e) {
        // Solo se clicchi sull'area del handle (i primi 60px)
        if (e.offsetY < 60 || e.target === navContainer) {
            this.classList.toggle('open');
        }
    });
    
    // Chiudi quando clicchi su un numero di domanda
    const questionCells = navContainer.querySelectorAll('.question-cell');
    questionCells.forEach(cell => {
        cell.addEventListener('click', () => {
            setTimeout(() => {
                navContainer.classList.remove('open');
            }, 300);
        });
    });
}

// Sposta il bottone submit nella navigazione per tablet
function moveSubmitButtonForTablet() {
    if (window.innerWidth <= 1200) {
        const submitBtn = document.getElementById("submitAnswers");
        const navigation = document.querySelector(".navigation");
        
        if (submitBtn && navigation) {
            // Clona il bottone per mantenere gli event listener
            const submitClone = submitBtn.cloneNode(true);
            submitClone.style.fontSize = "0.85rem";
            submitClone.style.padding = "0.6rem 1rem";
            submitClone.innerHTML = "📤 Manda";
            
            // Aggiungi evento click
            submitClone.addEventListener("click", async () => {
                console.log("Submit button clicked!");
                await submitAnswers();
            });
            
            // Aggiungi alla navigazione
            navigation.appendChild(submitClone);
            
            // Nascondi l'originale
            submitBtn.style.display = "none";
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded. Initializing test...");
    
    // Imposta immediatamente la classe first-page per nascondere elementi
    document.body.classList.add('first-page');
    
    console.log("Selected Test ID:", testId);
       const submitBtn = document.getElementById("submitAnswers");
    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            console.log("Submit button clicked!");
            await submitAnswers(false); // false = non è scaduto il tempo
        });
    }

    // Ensure navigation buttons exist
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");

    if (!prevPageBtn || !nextPageBtn) {
        console.error("ERROR: One or more navigation buttons not found in HTML.");
        return;
    }

    //Add event listeners for navigation
    prevPageBtn.addEventListener("click", () => {
        if (isBocconiTest) {
            console.log("Navigazione indietro disabilitata per test BOCCONI");
            return;
        }
        if (currentPage > 1) loadQuestionsForPage(currentPage - 1);
    });
    nextPageBtn.addEventListener("click", () => {
        const nextPage = currentPage + 1;
        if (nextPage > totalPages) return;
        
        // Only prompt confirmation if the button is labeled "Prossima Sezione"
        if (nextPageBtn.textContent.trim() === "Next Section") {
        customConfirm("You are about to move to the next section. Do you want to continue?").then(confirmChange => {
            if (!confirmChange) return;
            loadQuestionsForPage(nextPage);
        });
        return;
        }
        
        loadQuestionsForPage(nextPage);
      });

    //Load test and PDF
    await loadTest();
    if (window.innerWidth <= 1200) {
        setupTabletNavigation();
        moveSubmitButtonForTablet();  // AGGIUNGI QUESTA RIGA
    }
});

async function loadTest() {
    const pdfUrl = sessionStorage.getItem("testPdf");
    const currentSection = sessionStorage.getItem("currentSection"); // Ensure it's a number
    const tipologiaEsercizi = sessionStorage.getItem("currentTipologiaEsercizi"); // new
    selectedTestType = sessionStorage.getItem("selectedTestType") || ""; // Assegna alla variabile globale
  
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
    
    // ✅ Setup zoom and drag controls AFTER PDF is loaded
    setupZoomAndDrag();
 
    // SEMPRE cerca configurazioni in simulazioni_parti per QUALSIASI test
    globalCurrentSection = currentSection; // store it globally
    
    // Determina il tipo di test per la navigazione
    isBocconiTest = selectedTestType && selectedTestType.toLowerCase().includes("bocconi");
    isMedicinaTest = selectedTestType && selectedTestType.toLowerCase().includes("medicina");
    
    console.log(`🎯 Tipo test: ${selectedTestType}`);
    console.log(`   - Navigazione unidirezionale (Bocconi): ${isBocconiTest ? 'Sì' : 'No'}`);
    console.log(`   - Test Medicina: ${isMedicinaTest ? 'Sì' : 'No'}`);
    
    // Cerca se esiste configurazione per questo test type
    if (selectedTestType) {
        const { data: simulazioniData, error: simulazioniError } = await supabase
          .from("simulazioni_parti")
          .select("boundaries, boundaries_assessment_iniziale, nome_parti, time_allocation, time_allocation_assessment_iniziale")
          .eq("tipologia_test", selectedTestType ? selectedTestType.trim() : "")
          .single();
          
        if (simulazioniError || !simulazioniData) {
          console.log("No simulazioni configuration found for:", selectedTestType);
          // Per BOCCONI è normale non avere configurazione, continua senza sezioni
          sectionPageBoundaries = {};
          sectionPageStartPages = {};
          hasSections = false;
        } else {
        
        // Scegli i boundaries corretti in base al tipo di test
        let boundariesFilter;
        const isAssessmentIniziale = currentSection === "Assessment Iniziale" || tipologiaEsercizi === "Assessment";
        
        if (isAssessmentIniziale && simulazioniData.boundaries_assessment_iniziale) {
          boundariesFilter = simulazioniData.boundaries_assessment_iniziale;
          console.log("Using Assessment Iniziale boundaries:", boundariesFilter);
        } else if (simulazioniData.boundaries) {
          boundariesFilter = simulazioniData.boundaries;
          console.log("Using standard boundaries:", boundariesFilter);
        } else {
          console.log("No boundaries found, proceeding without sections");
          sectionPageBoundaries = {};
          sectionPageStartPages = {};
          return;
        }
        
        sectionNames = simulazioniData.nome_parti; // expects an array of section names
        console.log("Fetched section names:", sectionNames);
        
        // Carica le percentuali tempo se disponibili
        if (isAssessmentIniziale && simulazioniData['time_allocation_assessment_iniziale']) {
          timeAllocationPercentages = simulazioniData['time_allocation_assessment_iniziale'].map(p => parseFloat(p));
          console.log("Using Assessment Iniziale time allocation:", timeAllocationPercentages);
        } else if (simulazioniData['time_allocation']) {
          timeAllocationPercentages = simulazioniData['time_allocation'].map(p => parseFloat(p));
          console.log("Using standard time allocation:", timeAllocationPercentages);
        } else {
          timeAllocationPercentages = null;
          console.log("No time allocation found, will use proportional calculation");
        }

        // Now fetch the page numbers for questions whose question_number is in our dynamic boundaries array.
        if (!boundariesFilter || boundariesFilter.length === 0) {
          console.log("No boundaries to fetch, proceeding without sections");
          sectionPageBoundaries = {};
          sectionPageStartPages = {};
          return;
        }
        
        const { data: boundaries, error: boundaryError } = await supabase
          .from("questions")
          .select("question_number, page_number")
          .eq("pdf_url_eng", pdfUrl)  // VERSIONE INGLESE: usa pdf_url_eng
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
        hasSections = true; // Abbiamo sezioni!
        boundaries.forEach(q => {
          const index = boundariesFilter.indexOf(q.question_number);
          if (index !== -1) {
            const sectionNumber = index + 2; // first boundary becomes section 2, etc.
            sectionPageBoundaries[sectionNumber] = q.question_number;
            sectionPageStartPages[sectionNumber] = q.page_number;
          }
        });
        console.log("Section Boundaries Loaded:", sectionPageBoundaries);
        } // Chiusura dell'else aggiunto sopra
    } else {
      // Nessuna configurazione trovata per questo test
      sectionPageBoundaries = {};
      sectionPageStartPages = {};
      console.log("No configuration found in simulazioni_parti for this test type");
    }

    console.log("Final Section Boundaries:", sectionPageBoundaries);
  
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
  
    // Fetch questions - VERSIONE INGLESE: cerca sempre in pdf_url_eng
    console.log("🔍 English version - searching with pdf_url_eng:", pdfUrl);
    
    let { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("pdf_url_eng", pdfUrl)  // IMPORTANTE: usa pdf_url_eng nella versione inglese
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

// ✅ Setup Zoom and Drag Controls - Chiamata DOPO che il PDF è caricato
function setupZoomAndDrag() {
    console.log("Setting up zoom and drag controls...");
    
    // ✅ Zoom controls
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    
    if (zoomInBtn && zoomOutBtn) {
        zoomInBtn.addEventListener("click", () => {
            console.log("Zoom In clicked! Current zoom:", zoomLevel);
            zoomLevel = Math.min(zoomLevel + 0.2, 3.0); // Max zoom: 3.0x
            isRendering = false; // Forza reset del flag se necessario
            renderPage(currentPage);
        });

        zoomOutBtn.addEventListener("click", () => {
            console.log("Zoom Out clicked! Current zoom:", zoomLevel);
            zoomLevel = Math.max(zoomLevel - 0.2, 0.5); // Min zoom: 0.5x
            isRendering = false; // Forza reset del flag se necessario
            renderPage(currentPage);
        });
        
        console.log("Zoom controls setup completed!");
    } else {
        console.error("Zoom buttons not found!");
    }
    
    // ✅ Enable Drag Scrolling When Zoomed In
    const pdfViewer = document.querySelector(".pdf-viewer");
    
    if (pdfViewer) {
        pdfViewer.addEventListener("mousedown", (e) => {
            // Non iniziare il drag se clicchi sui controlli
            if (e.target.closest('.pdf-controls')) return;
            
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
    }
}


function loadQuestionsForPage(page) {
    updateSectionHeader(page);
    const submitButton = document.getElementById("submitAnswers");    
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");

    console.log(`📄 Loading Page: ${page}`);

    currentPage = page;
    sessionStorage.setItem("currentPage", currentPage);

    // ✅ First Page Special Display: Hide elements BEFORE rendering
    if (page === 1) {
        console.log("📄 First Page - Hiding elements before render");
        document.body.classList.add('first-page');
        
        // Nascondi il canvas PDF prima di renderizzare
        const pdfViewer = document.querySelector('.pdf-viewer');
        if (pdfViewer) {
            pdfViewer.style.display = 'none';
        }
        
        // Nascondi il timer
        const timer = document.getElementById('timer');
        if (timer) {
            timer.style.display = 'none';
        }
        
        // Nascondi la navigazione quiz
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.style.display = 'none';
        }
    } else {
        console.log("📄 Page > 1 - Showing elements");
        // Rimuovi la classe first-page per mostrare gli elementi
        document.body.classList.remove('first-page');
        
        // Per le altre pagine, assicurati che tutto sia visibile
        const pdfViewer = document.querySelector('.pdf-viewer');
        if (pdfViewer) pdfViewer.style.display = '';
        
        const timer = document.getElementById('timer');
        if (timer) timer.style.display = '';
        
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) navContainer.style.display = '';
        
        renderPage(page);  // Renderizza PDF solo per pagine > 1
    }

    buildQuestionNav(); // Refresh nav grid highlight

    const questionContainer = document.getElementById("question-container");
    if (!questionContainer) {
      console.error("ERROR: 'question-container' not found in HTML!");
      return;
    }
    questionContainer.innerHTML = "";

    // ✅ Continue with First Page Special Display
    if (page === 1) {
        console.log("📄 First Page - Showing Welcome Message");
        
        // Espandi la sezione delle domande a tutto schermo
        const questionSection = document.querySelector('.question-section');
        if (questionSection) {
            questionSection.style.gridColumn = '1 / -1';
            questionSection.style.maxWidth = '100%';
        }

        // Build dynamic test info
        const testInfo = [];
        
        // Navigation info
        if (isBocconiTest) {
            testInfo.push("🚫 <strong>One-way navigation</strong>: You cannot return to previous questions");
        } else {
            testInfo.push("✅ <strong>Free navigation</strong>: You can return to previous questions");
        }
        
        // Sections and time info
        if (hasSections && sectionNames && sectionNames.length > 0) {
            testInfo.push(`📚 <strong>${sectionNames.length} sections</strong> with separate timers`);
            if (timeAllocationPercentages) {
                testInfo.push("⏱️ Each section has a specific time limit");
            }
        } else {
            const minutes = Math.floor(testDuration / 60);
            testInfo.push(`⏱️ <strong>Total time</strong>: ${minutes} minutes`);
        }
        
        // Questions info
        if (questions && questions.length > 0) {
            testInfo.push(`📝 <strong>${questions.length} questions</strong> total`);
        }
        
        // Device recommendation info
        testInfo.push(`💻 <strong>Recommended device</strong>: PC/Computer for optimal performance`);
        testInfo.push(`📱 Test is accessible on tablets but experience may be limited`);

        // Section translations
        const sectionTranslations = {
            "Assessment iniziale": "Initial Assessment",
            "Assessment Iniziale": "Initial Assessment",
            "Comprensione Verbale": "Verbal Comprehension",
            "Comprensione del Testo": "Text Comprehension",
            "Comprensione verbale": "Verbal Comprehension",
            "Matematica": "Mathematics",
            "Algebra": "Algebra",
            "Geometria": "Geometry",
            "Logica": "Logic",
            "Scienze": "Sciences",
            "Fisica": "Physics",
            "Chimica": "Chemistry",
            "Biologia": "Biology",
            "Logaritmi ed esponenziali": "Logarithms and Exponentials",
            "Goniometria e trigonometria": "Goniometry and Trigonometry",
            "Funzioni": "Functions",
            "Probabilità, combinatoria e statistica": "Probability, Combinatorics and Statistics",
            "Probabilita combinatoria e statistica": "Probability, Combinatorics and Statistics",
            "Pensiero critico": "Critical Thinking",
            "Ragionamento numerico": "Numerical Reasoning"
        };

        // Clean test name and build title
        let testName = selectedTestType ? selectedTestType.replace(' PDF', '').replace(' BANCADATI', '') : 'Test';
        let testTitle = `Entrance Test Preparation Path ${testName}`;
        
        // Get current section for title and translate it
        const currentSectionName = sessionStorage.getItem("currentSection");
        if (currentSectionName) {
            const translatedSection = sectionTranslations[currentSectionName] || currentSectionName;
            testTitle += ` - ${translatedSection}`;
        }

        questionContainer.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 2.5rem;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                text-align: center;
                max-width: 600px;
                margin: 2rem auto;
                border: 1px solid #e9ecef;
            ">
                <div style="font-size: 3rem; margin-bottom: 1.5rem;">
                    🖥️
                </div>
                
                <h3 style="
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #00a666;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">
                    ${testName}
                </h3>
                
                <h2 style="
                    font-size: 1.4rem;
                    margin-bottom: 1rem;
                    font-weight: 700;
                    color: rgb(28, 37, 69);
                ">
                    ${testTitle}
                </h2>
                
                <div style="
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 10px;
                    padding: 1rem;
                    margin: 1.5rem 0;
                ">
                    <p style="font-size: 0.95rem; margin: 0; color: #856404;">
                        ⚠️ <strong>Warning:</strong> The test must be taken in full screen mode. 
                        Exiting full screen will cancel the test.
                    </p>
                </div>
                
                <div style="
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                    text-align: left;
                ">
                    <h3 style="
                        font-size: 1.1rem;
                        color: rgb(28, 37, 69);
                        margin-bottom: 1rem;
                        text-align: center;
                    ">📋 Test Information</h3>
                    <ul style="
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        font-size: 0.95rem;
                        color: #495057;
                        line-height: 2;
                    ">
                        ${testInfo.map(info => `<li>${info}</li>`).join('')}
                    </ul>
                </div>
                
                <button id="startTestBtn" style="
                    background: linear-gradient(135deg, #00a666, #00c775);
                    color: white;
                    border: none;
                    padding: 0.875rem 2.5rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border-radius: 10px;
                    cursor: pointer;
                    margin-top: 1.5rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 166, 102, 0.3);
                " 
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 166, 102, 0.4)';" 
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 166, 102, 0.3)';">
                    Start Test
                </button>
                
                <p style="
                    margin-top: 1.5rem;
                    font-size: 0.9rem;
                    color: #6c757d;
                ">
                    Good luck!
                </p>
            </div>
        `;

        // ✅ Hide navigation buttons
        prevPageBtn.style.display = "none";
        nextPageBtn.style.display = "none";
        if (submitButton) submitButton.style.display = "none";
        if (window.innerWidth <= 1200) {
            moveSubmitButtonForTablet();
        }

        // Attach event listener to "Inizia Test"
        document.getElementById("startTestBtn").addEventListener("click", async () => {
            await enforceFullScreen();  // Go fullscreen before starting
            
            // IMPORTANTE: Rimuovi la classe first-page per mostrare tutti gli elementi
            document.body.classList.remove('first-page');
            document.body.classList.add('ready');
            
            // Ripristina il layout normale con PDF
            const pdfViewer = document.querySelector('.pdf-viewer');
            if (pdfViewer) {
                pdfViewer.style.display = '';  // Ripristina display originale
                pdfViewer.style.opacity = '1';
            }
            
            // Ripristina timer
            const timer = document.getElementById('timer');
            if (timer) {
                timer.style.display = '';
                timer.style.opacity = '1';
            }
            
            // Ripristina navigazione quiz
            const navContainer = document.querySelector('.nav-container');
            if (navContainer) {
                navContainer.style.display = '';
                navContainer.style.opacity = '1';
            }
            
            const questionSection = document.querySelector('.question-section');
            if (questionSection) {
                questionSection.style.gridColumn = '';  // Ripristina grid originale
                questionSection.style.maxWidth = '';
            }
            
            // Setup timer basato su sezioni o normale
            if (hasSections && Object.keys(sectionPageBoundaries).length > 0) {
                setupSectionTimers();
            } else {
                // Timer normale senza sezioni
                testEndTime = Date.now() + testDuration * 1000;
                updateTimer();
            }
            
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
        questionDiv.innerHTML = `<h3>Question ${q.question_number}</h3>`;

        if (q.is_open_ended) {
            let input = document.createElement("input");
            input.type = "text";
            input.value = studentAnswers[q.id] || "";
            input.oninput = () => studentAnswers[q.id] = input.value;
            questionDiv.appendChild(input);
        } else {
            let choices = (q.wrong_answers || []).concat(q.correct_answer);
            // Add the two extra choices:
            choices = choices.concat(["no idea", "unsure"]);
            choices.sort((a, b) => a.localeCompare(b));

            choices.forEach(choice => {
                let btn = document.createElement("button");
                btn.textContent = choice;
                btn.onclick = () => selectAnswer(q.id, choice, btn);

                if (studentAnswers[q.id] === choice || 
                    (choice.toLowerCase() === "unsure" && studentAnswers[q.id] === "x") ||
                    (choice.toLowerCase() === "no idea" && studentAnswers[q.id] === "y")) {
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
    // Map "unsure" and "no idea" to "x" and "y" respectively.
    if (answer.toLowerCase() === "unsure") {
      mappedAnswer = "x";
    } else if (answer.toLowerCase() === "no idea") {
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
      if (btnMapped.toLowerCase() === "unsure") btnMapped = "x";
      if (btnMapped.toLowerCase() === "no idea") btnMapped = "y";
      
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

async function submitAnswers(timeExpired = false) {
    // Se NON è scaduto il tempo, chiedi conferma con dialog personalizzato
    if (!timeExpired) {
        const confirmSubmit = await customConfirm("Are you sure you want to submit your answers?");
        if (!confirmSubmit) {
            return;
        }
    }
    
    isSubmitting = true;
    let studentId = sessionStorage.getItem("studentId");

    // ✅ If `studentId` is missing, fetch it again
    if (!studentId) {
        console.log("🔄 Fetching student ID from Supabase...");

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData || !sessionData.session) {
            console.error("❌ ERROR: No active session found.");
            showCustomAlert("Sessione scaduta. Effettua nuovamente il login.");
            window.location.href = "login.html";
            return;
        }

        studentId = sessionData.session.user.id;
        sessionStorage.setItem("studentId", studentId);
        console.log("✅ Student ID restored:", studentId);
    }

    if (Object.keys(studentAnswers).length === 0 && !timeExpired) {
        showCustomAlert("No answer selected. Please answer at least one question.");
        isSubmitting = false;
        return;
    }

    console.log("📌 Submitting answers for student:", studentId);

    const submissions = questions.map(q => {
        const answer = (q.id in studentAnswers) ? studentAnswers[q.id] : "z";
        let auto_score = null;
        if (!q.is_open_ended) {
            auto_score = answer === q.correct_answer ? 1 : 0;
        }
        return {
            auth_uid: studentId,
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
        showCustomAlert("Invio fallito. Riprova.");
        isSubmitting = false;
        return;
    } else {
        console.log("✅ Answers submitted successfully!", data);
    }

    // ✅ Mark test as completed
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

    // ✅ Messaggio diverso se il tempo è scaduto
    if (timeExpired) {
        await showCustomAlert("⏰ Time's up! Your answers have been submitted automatically.", true);
    } else {
        await showCustomAlert("✅ Risposte inviate con successo!");
    }

    // ✅ Esci dal fullscreen SOLO dopo aver mostrato il messaggio
    if (document.fullscreenElement) {
        await document.exitFullscreen();
    }

    sessionStorage.setItem("testCompleted", "true");
    window.location.href = "test_selection.html";
}

function showCustomAlert(message, isTimeExpired = false) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 450px;
            animation: slideIn 0.3s ease-out;
        `;

        // Aggiungi animazione
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        dialog.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">
                ${isTimeExpired ? '⏰' : '✅'}
            </div>
            <p style="font-size: 1.2rem; color: rgb(28, 37, 69); margin-bottom: 1.5rem; line-height: 1.5;">
                ${message}
            </p>
            <button style="
                background: #00a666;
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#00c97a'" 
               onmouseout="this.style.background='#00a666'">
                OK
            </button>
        `;

        const button = dialog.querySelector('button');
        button.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve();
        });

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Auto-close dopo 5 secondi se è scaduto il tempo
        if (isTimeExpired) {
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                    resolve();
                }
            }, 5000);
        }
    });
}

// Function to update timer for sections
function updateSectionTimer() {
    const timerElement = document.getElementById("timer");
    if (!timerElement) {
        console.error("❌ ERROR: Timer element not found in HTML.");
        return;
    }

    function tick() {
        const now = Date.now();
        
        // Verifica tempo totale del test
        if (now >= testEndTime) {
            console.log("⏳ Total test time expired! Auto-submitting...");
            submitAnswers(true);
            return;
        }
        
        // Calcola quale sezione dovremmo essere
        const pageSection = getSectionForPage(currentPage);
        
        // Se siamo in una sezione diversa, aggiorna
        if (pageSection !== currentSectionNumber) {
            // Marca la sezione precedente come scaduta se necessario
            if (currentSectionNumber < pageSection) {
                expiredSections.add(currentSectionNumber);
            }
            currentSectionNumber = pageSection;
            sectionStartTime = now;
        }
        
        // Calcola tempo rimanente per questa sezione
        const sectionDuration = sectionDurations[currentSectionNumber] || 300; // Default 5 min
        const sectionEndTime = sectionStartTime + sectionDuration * 1000;
        const timeLeftInSection = Math.max(0, sectionEndTime - now);
        
        // Se il tempo della sezione è scaduto
        if (timeLeftInSection <= 0 && !expiredSections.has(currentSectionNumber)) {
            expiredSections.add(currentSectionNumber);
            console.log(`⏰ Section ${currentSectionNumber} time expired!`);
            
            // Trova la prima pagina della prossima sezione
            const nextSection = currentSectionNumber + 1;
            const nextSectionStartPage = Object.entries(sectionPageStartPages)
                .find(([sec, page]) => parseInt(sec) === nextSection)?.[1];
            
            if (nextSectionStartPage) {
                // Auto-naviga alla prossima sezione
                showCustomAlert(`⏰ Time's up for section ${currentSectionNumber}! Automatically moving to the next section.`);
                loadQuestionsForPage(nextSectionStartPage);
                return;
            } else {
                // Era l'ultima sezione, submit automatico
                console.log("⏳ Last section expired! Auto-submitting...");
                submitAnswers(true);
                return;
            }
        }
        
        // Aggiorna display del timer
        const minutes = Math.floor(timeLeftInSection / 60000);
        const seconds = Math.floor((timeLeftInSection % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Mostra sezione e tempo in formato più chiaro
        let timerText = '';
        if (sectionNames && sectionNames.length >= currentSectionNumber) {
            timerText = `<div style="font-weight: bold; margin-bottom: 5px;">📚 Section ${currentSectionNumber}: ${sectionNames[currentSectionNumber - 1]}</div>`;
            timerText += `<div>⏳ Time: <span id="time-left">${timeString}</span></div>`;
        } else {
            timerText = `⏳ Time: <span id="time-left">${timeString}</span>`;
        }
        
        timerElement.innerHTML = timerText;
        
        // Aggiungi warning se poco tempo
        if (timeLeftInSection < 60000) { // Meno di 1 minuto
            timerElement.style.backgroundColor = "#ff6b6b";
            timerElement.style.color = "white";
        } else if (timeLeftInSection < 180000) { // Meno di 3 minuti
            timerElement.style.backgroundColor = "#ffd93d";
            timerElement.style.color = "#333";
        }
    }

    // Avvia il timer
    tick();
    const timerInterval = setInterval(tick, 1000);
}

// ✅ Function to Update the Timer Display (normale, senza sezioni)
function updateTimer() {
    const timerElement = document.getElementById("timer");

    if (!timerElement) {
        console.error("❌ ERROR: Timer element not found in HTML.");
        return;
    }

    function tick() {
        const now = new Date().getTime();
        const endTime = new Date(testEndTime).getTime();

        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            console.log("⏳ Time's up! Auto-submitting answers...");
            submitAnswers(true);  // ✅ Passa true per indicare che è scaduto il tempo
            clearInterval(timerInterval);
            return;
        }

        // ✅ Format Time (MM:SS)
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        timerElement.textContent = `Time remaining: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    const timerInterval = setInterval(tick, 1000);
    tick();
}

let currentSubsection = 1; // Track which subsection the student is on
function updateNavigationButtons() {
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");

    console.log(`🔄 Updating buttons for Page ${currentPage}`);

    // Determine test type based on the presence of "PDF" in the test name
    const selectedTest = sessionStorage.getItem("selectedTestType");
    
    // Classificazione test per comportamento navigazione:
    // - TOLC e CATTOLICA: navigazione con sezioni (possono muoversi dentro la sezione)
    // - BOCCONI (tutti i tipi): navigazione unidirezionale (non possono tornare indietro)
    // - MEDICINA: da definire (per ora come TOLC)
    const testType = (selectedTest.includes("TOLC") || selectedTest.includes("CATTOLICA") || selectedTest.includes("MEDICINA")) ? "tolc" : "bocconi";
    const testModality = selectedTest.includes("PDF") ? "pdf" : "banca_dati";

    console.log(`📌 Test Type Determined: ${testType} (${selectedTest})`);

    const currentSection = sessionStorage.getItem("currentSection");
    if (testType === "tolc") {
        // TOLC and CATTOLICA navigation using section boundaries.
        // Se abbiamo sezioni configurate, applica le restrizioni
        if (hasSections && Object.keys(sectionPageBoundaries).length > 0) {
            // Controlla se la PROSSIMA pagina è l'inizio di una nuova sezione
            const nextPageStartsNewSection = Object.values(sectionPageStartPages).includes(currentPage + 1);
            
            // Controlla se siamo appena passati a una nuova sezione (pagina corrente è l'inizio di una sezione)
            const currentPageIsNewSection = Object.values(sectionPageStartPages).includes(currentPage);
            
            if (nextPageStartsNewSection) {
                nextPageBtn.textContent = "Next Section";
            } else {
                nextPageBtn.textContent = "Avanti";
            }
            
            // Disable previous button if we are at the start of a new section (can't go back to previous section)
            if (currentPageIsNewSection && currentPage > 2) {
                prevPageBtn.disabled = true;
            } else {
                prevPageBtn.disabled = false;
            }
        } else {
            // Senza sezioni, navigazione normale
            nextPageBtn.textContent = "Avanti";
            prevPageBtn.disabled = false;
        }
    }
    
    // Per test BOCCONI, disabilita sempre il tasto indietro
    if (isBocconiTest) {
        prevPageBtn.disabled = true;
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

// ✅ Intercetta i tentativi di uscire dal fullscreen
document.addEventListener('keydown', function(e) {
    // Intercetta ESC key
    if (e.key === 'Escape' && document.fullscreenElement && testEndTime && !isSubmitting) {
        e.preventDefault();
        e.stopPropagation();
        
        customConfirm("⚠️ Warning! Exiting full screen will cancel the test. Are you sure you want to exit?")
            .then(confirmExit => {
                if (confirmExit) {
                    document.exitFullscreen().then(() => {
                        alert("Il test è stato annullato.");
                        window.location.href = "test_selection.html";
                    });
                }
                // Se dice no, rimane in fullscreen
            });
    }
});

// ✅ Gestisci uscite forzate (F11, etc) che non possiamo intercettare
document.addEventListener("fullscreenchange", function () {
    if (isSubmitting) return;
    if (!document.fullscreenElement && testEndTime) {
        // Se sono già uscito (tramite F11 o altro), annulla immediatamente
        alert("Il test è stato annullato perché sei uscito dallo schermo intero.");
        window.location.href = "test_selection.html";
    }
});

// Setup timer per sezioni
function setupSectionTimers() {
    console.log("Setting up section timers for PDF test");
    
    // Calcola durata per ogni sezione
    sectionDurations = {};
    
    if (timeAllocationPercentages && timeAllocationPercentages.length > 0) {
        // Usa percentuali personalizzate
        console.log("Using custom time allocation:", timeAllocationPercentages);
        
        timeAllocationPercentages.forEach((percentage, index) => {
            const sectionNum = index + 1;
            sectionDurations[sectionNum] = Math.round(testDuration * percentage / 100);
            console.log(`Section ${sectionNum}: ${percentage}% = ${sectionDurations[sectionNum]} seconds`);
        });
    } else {
        // Calcolo proporzionale basato sul numero di domande
        console.log("Using proportional time calculation");
        
        const questionsBySection = {};
        let totalQuestions = 0;
        
        questions.forEach(q => {
            const section = getSectionForQuestionNumber(q.question_number);
            if (!questionsBySection[section]) {
                questionsBySection[section] = 0;
            }
            questionsBySection[section]++;
            totalQuestions++;
        });
        
        const timePerQuestion = testDuration / totalQuestions;
        
        Object.keys(questionsBySection).forEach(section => {
            sectionDurations[section] = Math.round(timePerQuestion * questionsBySection[section]);
            console.log(`Section ${section}: ${questionsBySection[section]} questions = ${sectionDurations[section]} seconds`);
        });
    }
    
    // Inizializza timer per la prima sezione
    currentSectionNumber = 1;
    sectionStartTime = Date.now();
    testEndTime = Date.now() + testDuration * 1000; // Tempo totale come fallback
    
    updateSectionTimer(); // Avvia il timer per sezioni
}


function buildQuestionNav() {
    const questionNav = document.getElementById("questionNav");
    if (!questionNav) return;
    questionNav.innerHTML = ""; // Clear existing buttons
  
    // Determina il tipo di test basandosi sul comportamento di navigazione
    const selectedTest = sessionStorage.getItem("selectedTestType");
    const testType = (selectedTest.includes("TOLC") || selectedTest.includes("CATTOLICA") || selectedTest.includes("MEDICINA")) ? "tolc" : "bocconi";
    const testModality = selectedTest.includes("PDF") ? "pdf" : "banca_dati";
  
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
        // Per Bocconi: sempre verde, per TOLC: mantieni giallo per x/y
        if (isBocconiTest) {
          btn.classList.add("answered");  // Sempre verde per Bocconi
        } else {
          // Logica originale per TOLC
          if (studentAnswers[q.id] === "x" || studentAnswers[q.id] === "y") {
            btn.style.backgroundColor = "yellow";
          } else {
            btn.classList.add("answered");
          }
        }
      }
  
      // Disabilita navigazione indietro per test BOCCONI
      if (isBocconiTest && q.page_number < currentPage) {
        btn.disabled = true;
        btn.classList.add("non-navigabile");
        btn.title = "Non puoi tornare a questa domanda";
        // Non aggiungere event listener per questi pulsanti
      } 
      // Logica per test con sezioni (TOLC, CATTOLICA, Assessment con boundaries)
      else if (testType === "tolc" && hasSections && Object.keys(sectionPageBoundaries).length > 0) {
        // If the student is beyond the boundary, disable navigation for questions on or before that boundary.
        const targetSection = getSectionForQuestionNumber(q.question_number);
        const currentQuestion = questions.find(qq => qq.page_number === currentPage);
        const currentSectionNumber = getSectionForQuestionNumber(currentQuestion?.question_number || 1);
        
        if (targetSection < currentSectionNumber) {
          // ✅ Disable all buttons for previous sections
          btn.disabled = true;
          btn.classList.add("sezione-precedente");
          btn.title = "Previous section - not accessible";
        } else if (targetSection === currentSectionNumber) {
          // Stessa sezione - navigabile liberamente
          btn.classList.add("sezione-corrente");
          btn.title = `Question ${q.question_number} - Current section`;
          btn.addEventListener("click", () => {
            loadQuestionsForPage(q.page_number);
          });
        } else {
          // Sezione successiva - richiede conferma
          btn.classList.add("sezione-successiva");
          btn.title = `Question ${q.question_number} - Next section`;
          btn.addEventListener("click", () => {
            customConfirm("Stai per passare alla prossima sezione. Vuoi continuare?")
              .then(confirmChange => {
                if (confirmChange) {
                  loadQuestionsForPage(q.page_number);
                }
              });
          });
        }
      }
      // Per tutti gli altri casi (Bocconi banca_dati o domande non precedenti)
      else {
        btn.addEventListener("click", () => {
          loadQuestionsForPage(q.page_number);
        });
      }
  
      questionNav.appendChild(btn);
    });
  }

  function getSectionForPage(page) {
    // Usa sectionPageStartPages che contiene i numeri di PAGINA, non di domanda
    const boundariesArr = Object.entries(sectionPageStartPages)
      .map(([section, pageNum]) => ({ section: Number(section), pageNum: Number(pageNum) }))
      .sort((a, b) => a.pageNum - b.pageNum);
  
    let section = 1;
    for (const boundary of boundariesArr) {
      if (page < boundary.pageNum) break;
      section = boundary.section;
    }
    return section;
  }

  function getSectionForQuestionNumber(questionNumber) {
    const boundaries = Object.entries(sectionPageBoundaries)
      .map(([section, qNum]) => ({ section: Number(section), qNum }))
      .sort((a, b) => a.qNum - b.qNum);
  
    let section = 1;
    for (const b of boundaries) {
      // Se il questionNumber è minore del boundary, siamo ancora nella sezione precedente
      if (questionNumber < b.qNum) break;
      // Altrimenti passiamo alla sezione del boundary
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
          : "Section " + currentSectionNumber;
    
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