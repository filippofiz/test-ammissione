// test_bancaDati.js - Sistema completo per test Banca Dati con CSS integrato

// Variabili globali
const supabase = window.supabase;
let questions = [];
let currentPage = 1;
let totalPages = 1;
let studentAnswers = {};
let correctMapping = {};
let timerStarted = false;
let isSubmitting = false;
let testId = null;

// Variabili per gestione sezioni
let sectionBoundaries = {};
let sectionNames = [];
let sectionEndTimes = {};
let globalTimerInterval = null;
let hasSections = false;
let isBocconiTest = false;
let isGMATTest = false;
let pageToSectionMap = {};
let sectionToFirstPageMap = {};
let sectionDurations = {};
let sectionStartTime = null;
let currentSectionNumber = 1;
let expiredSections = new Set();
let totalTestTime = 0;
let timeAllocationPercentages = null; // Nuova variabile per percentuali personalizzate

// GMAT-specific variables
let bookmarkedQuestions = new Set(); // Track bookmarked questions by question number
let gmatSectionOrder = []; // Section order for GMAT (e.g., ['Quant', 'Verbal', 'DI'])
let currentGMATSectionIndex = 0; // Current section in the order
let isReviewMode = false; // Whether we're in review mode
let breakTaken = false; // Track if 10-minute break has been taken
let inBreak = false; // Currently in break
let breakTimerInterval = null; // Timer for break countdown

// GMAT Adaptive Testing variables
let isGMATAssessmentIniziale = false; // True if Assessment Iniziale
let isGMATSimulazioni = false; // True if Simulazioni
let allQuestionsPool = {}; // Pool of all questions by section
let selectedQuestions = []; // Adaptively selected questions for the test
let studentPerformanceHistory = []; // Track last 5 answers (true/false) - for adaptive algorithm
let studentPerformanceHistoryFull = []; // Track ALL answers from start - for display
let currentSectionQuestionCount = 0; // Questions shown in current section
let adaptiveSelectionLog = []; // Log of why each question was selected (for debugging)

// Inizializzazione
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTest);
} else {
  initializeTest();
}

async function initializeTest() {
  console.log("🚀 Inizializzazione test...");
  
  testId = sessionStorage.getItem("selectedTestId");
  console.log("🎯 Test ID recuperato:", testId);
  
  if (!testId) {
    console.error("❌ Test ID non trovato nel sessionStorage");
    showCustomAlert("Errore: Test ID non trovato. Verrai reindirizzato alla selezione test.", () => {
      window.location.href = "test_selection.html";
    });
    return;
  }
  
  await initializeEventListeners();
  await loadTest();
}

async function initializeEventListeners() {
  console.log("📌 Inizializzazione event listeners...");
  
  // Fullscreen exit handling
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && timerStarted && !isSubmitting) {
      event.preventDefault();
      showCustomAlert("⚠ Il test è stato annullato. Verrai reindirizzato al tuo albero dei test.", () => {
        window.location.href = "test_selection.html";
      });
    }
  });
  
  let fullscreenExitConfirmShown = false;
  document.addEventListener("fullscreenchange", () => {
    if (isSubmitting) return;
    if (timerStarted && !document.fullscreenElement && !fullscreenExitConfirmShown) {
      fullscreenExitConfirmShown = true;

      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:999999';

      const dialog = document.createElement('div');
      dialog.style.cssText = 'background:white;padding:3rem;border-radius:20px;max-width:600px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5)';
      dialog.innerHTML = '<div style="font-size:4rem;margin-bottom:1rem">⚠️</div><h2 style="color:#dc2626;margin-bottom:1rem;font-size:1.8rem">Warning!</h2><p style="font-size:1.2rem;color:#374151;margin-bottom:1rem">You have exited full screen mode.<br><strong>You must return to full screen to continue.</strong></p><div style="font-size:1.1rem;font-weight:600;color:#dc2626;margin-bottom:0.5rem">⏰ You must make a choice within <span id="countdown" style="font-size:2.5rem;font-weight:800">5</span> seconds</div><p style="font-size:0.95rem;color:#6b7280;margin-bottom:2rem">or the test will be automatically annulled</p><div style="display:flex;gap:1rem;justify-content:center"><button id="returnFullscreen" style="background:linear-gradient(135deg,#00a666,#00c775);color:white;border:none;padding:1rem 2rem;border-radius:12px;font-size:1.1rem;font-weight:600;cursor:pointer">🔄 Return to Full Screen</button><button id="exitTest" style="background:#dc2626;color:white;border:none;padding:1rem 2rem;border-radius:12px;font-size:1.1rem;font-weight:600;cursor:pointer">❌ Exit and Annul Test</button></div>';

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      // Countdown timer
      let timeLeft = 5;
      const countdownSpan = dialog.querySelector('#countdown');
      const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownSpan.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          document.body.removeChild(overlay);
          showCustomAlert("⚠️ Test annulled - No choice was made within the time limit.", () => {
            window.location.href = "test_selection.html";
          });
        }
      }, 1000);

      dialog.querySelector('#returnFullscreen').addEventListener('click', async () => {
        clearInterval(countdownInterval);
        try {
          await document.documentElement.requestFullscreen();
          document.body.removeChild(overlay);
          fullscreenExitConfirmShown = false;
        } catch (err) {
          showCustomAlert("⚠ Unable to return to full screen mode. The test has been annulled.", () => {
            window.location.href = "test_selection.html";
          });
        }
      });

      dialog.querySelector('#exitTest').addEventListener('click', () => {
        clearInterval(countdownInterval);
        document.body.removeChild(overlay);
        showCustomAlert("⚠ The test has been annulled.", () => {
          window.location.href = "test_selection.html";
        });
      });
    }
  });
}

// Alert personalizzato con timeout automatico per tempo scaduto
function showCustomAlert(message, onOk, autoClose = false) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  
  const dialog = document.createElement("div");
  dialog.className = "modal-dialog";
  
  const title = document.createElement("h3");
  title.textContent = "Avviso";
  
  const content = document.createElement("p");
  content.innerHTML = message;
  
  const buttons = document.createElement("div");
  buttons.className = "modal-buttons";
  
  const okButton = document.createElement("button");
  okButton.textContent = "OK";
  okButton.id = "alertOkButton";
  okButton.className = "btn-primary";
  
  buttons.appendChild(okButton);
  dialog.appendChild(title);
  dialog.appendChild(content);
  dialog.appendChild(buttons);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  const closeDialog = () => {
    document.body.removeChild(overlay);
    if (onOk) onOk();
  };
  
  okButton.addEventListener("click", closeDialog);
  okButton.focus();
  
  // 🔧 Auto-chiusura dopo 3 secondi per tempo scaduto
  if (message.includes("Tempo scaduto")) {
    setTimeout(closeDialog, 3000);
    
    // Aggiungi countdown visivo
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        okButton.textContent = `OK (${countdown})`;
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }
}

async function loadTest() {
  console.log("🔄 LoadTest iniziato...");
  
  const currentSection = sessionStorage.getItem("currentSection");
  const currentTipologiaEsercizi = sessionStorage.getItem("currentTipologiaEsercizi");
  const currentTestProgressivo = sessionStorage.getItem("currentTestProgressivo");
  const selectedTestType = sessionStorage.getItem("selectedTestType");
  
  if (!currentSection || !currentTipologiaEsercizi) {
    showCustomAlert("Dati test non trovati. Contatta il tuo tutor.", () => {
      window.location.href = "test_selection.html";
    });
    return;
  }
  
  isBocconiTest = selectedTestType.toLowerCase().includes("bocconi");
  isGMATTest = selectedTestType.toLowerCase().trim().includes("gmat");

  // Detect GMAT test type (Assessment Iniziale vs Simulazioni)
  if (isGMATTest) {
    isGMATAssessmentIniziale = currentSection === "Assessment Iniziale";
    isGMATSimulazioni = currentSection === "Simulazioni";
    console.log(`🎯 GMAT Test Type: ${isGMATAssessmentIniziale ? 'Assessment Iniziale (ADAPTIVE)' : isGMATSimulazioni ? 'Simulazioni (NON-ADAPTIVE)' : 'Other'}`);
  }

  console.log(`🎯 Tipo test: ${isBocconiTest ? 'Bocconi' : isGMATTest ? 'GMAT' : 'Altri'} (selectedTestType: "${selectedTestType}")`);

  // Sempre cerca configurazioni in simulazioni_parti per QUALSIASI test
  await loadSectionBoundaries(selectedTestType);
  
  const { data, error } = await supabase
    .from("questions_bancaDati")
    .select("*")
    .eq("section", currentSection)
    .eq("tipologia_esercizi", currentTipologiaEsercizi)
    .eq("tipologia_test", selectedTestType)
    .eq("progressivo", currentTestProgressivo)
    .order("question_number");
  
  if (error) {
    console.error("Errore nel caricamento domande:", error);
    showCustomAlert("Errore nel caricamento del test. Controlla la console.");
    return;
  }
  if (!data || data.length === 0) {
    showCustomAlert("Nessuna domanda disponibile per questo test.");
    return;
  }

  // ✅ DEDUPLICATE questions based on question_number
  const uniqueQuestionsMap = new Map();
  let duplicatesFound = 0;

  data.forEach(q => {
    const key = `${q.question_number}`;
    if (!uniqueQuestionsMap.has(key)) {
      uniqueQuestionsMap.set(key, q);
    } else {
      duplicatesFound++;
      console.warn(`⚠️ Duplicate found: Question ${q.question_number} (ID: ${q.id})`);
    }
  });

  questions = Array.from(uniqueQuestionsMap.values());

  if (duplicatesFound > 0) {
    console.warn(`⚠️ ${duplicatesFound} duplicate question(s) removed from ${data.length} total questions`);
    console.log(`✅ Unique questions: ${questions.length}`);
  }

  // GMAT Adaptive Testing Setup
  if (isGMATTest && isGMATAssessmentIniziale) {
    console.log('🧠 Setting up GMAT Adaptive Testing for Assessment Iniziale');
    buildAdaptiveQuestionPool();
    // Calculate expected total pages: 46 questions (15+16+15) + 1 intro page = 47 pages
    totalPages = 47; // Will dynamically expand as questions are selected
  } else if (isGMATTest && isGMATSimulazioni) {
    console.log('📊 Setting up GMAT Simulazioni (non-adaptive)');
    buildSimulazioniQuestionList();
  } else if (hasSections) {
    calculatePageSectionMapping();
    totalPages = Math.max(...Object.keys(pageToSectionMap).map(p => parseInt(p))) || 1;
    totalPages++;
  } else {
    // GMAT tests: 1 question per page, other tests: 3 questions per page
    const questionsPerPage = isGMATTest ? 1 : 3;
    totalPages = Math.ceil(questions.length / questionsPerPage) + 1;
  }

  buildQuestionNavBocconi();

  // Hide nav-container for GMAT tests to give more space to questions
  const navContainer = document.querySelector('.nav-container');
  if (navContainer) {
    navContainer.style.display = isGMATTest ? 'none' : '';
  }

  loadQuestionsForPage(1);
}

async function loadSectionBoundaries(testType) {
  try {
    console.log(`📊 Cercando boundaries per testType: "${testType}"`);
    
    const currentSection = sessionStorage.getItem("currentSection");
    const isAssessmentIniziale = currentSection === "Assessment Iniziale";
    
    const { data, error } = await supabase
      .from("simulazioni_parti")
      .select("boundaries, boundaries_assessment_iniziale, nome_parti, time_allocation, time_allocation_assessment_iniziale")
      .eq("tipologia_test", testType)
      .maybeSingle();

    if (error || !data) {
      console.log("📊 Nessuna configurazione trovata per questo test");
      hasSections = false;
      return;
    }
    
    // Scegli i boundaries corretti in base al tipo di test
    let boundariesArray;
    if (isAssessmentIniziale && data.boundaries_assessment_iniziale) {
      boundariesArray = data.boundaries_assessment_iniziale.map(b => parseInt(b));
      console.log("📊 Usando boundaries Assessment Iniziale:", boundariesArray);
    } else if (data.boundaries) {
      boundariesArray = data.boundaries.map(b => parseInt(b));
      console.log("📊 Usando boundaries standard:", boundariesArray);
    } else {
      console.log("📊 Nessun boundary trovato, test senza sezioni");
      hasSections = false;
      return;
    }
    
    // Scegli l'allocazione tempo corretta
    if (isAssessmentIniziale && data['time_allocation_assessment_iniziale']) {
      timeAllocationPercentages = data['time_allocation_assessment_iniziale'].map(p => parseFloat(p));
      console.log("📊 Usando time allocation Assessment Iniziale:", timeAllocationPercentages);
    } else if (data['time_allocation']) {
      timeAllocationPercentages = data['time_allocation'].map(p => parseFloat(p));
      console.log("📊 Usando time allocation standard:", timeAllocationPercentages);
    } else {
      timeAllocationPercentages = null;
      console.log("📊 Nessuna allocazione tempo personalizzata, userò calcolo proporzionale");
    }
    
    hasSections = true;
    sectionNames = data.nome_parti || [];
    
    sectionBoundaries = {};
    boundariesArray.forEach((boundary, index) => {
      sectionBoundaries[index + 2] = parseInt(boundary);
    });
    
    console.log("📊 Sezioni caricate:", { sectionBoundaries, sectionNames, timeAllocationPercentages });
  } catch (error) {
    console.error("❌ Errore caricamento boundaries:", error);
    hasSections = false;
  }
}

function calculatePageSectionMapping() {
  pageToSectionMap = {};
  sectionToFirstPageMap = {};
  
  let currentPage = 2;
  let questionsInCurrentPage = 0;
  let currentSection = 1;
  
  sectionToFirstPageMap[1] = 2;
  
  questions.forEach((q, index) => {
    const qNum = parseInt(q.question_number);
    const qSection = getCurrentSectionForQuestion(qNum);
    
    if (qSection !== currentSection && questionsInCurrentPage > 0) {
      currentPage++;
      questionsInCurrentPage = 0;
    }
    
    if (qSection !== currentSection) {
      currentSection = qSection;
      sectionToFirstPageMap[currentSection] = currentPage;
    }
    
    pageToSectionMap[currentPage] = currentSection;
    questionsInCurrentPage++;
    
    if (questionsInCurrentPage >= 3) {
      if (index < questions.length - 1) {
        currentPage++;
        questionsInCurrentPage = 0;
      }
    }
  });
}

function getCurrentSectionForQuestion(questionNumber) {
  if (!hasSections) return 1;
  
  let currentSection = 1;
  const qNum = parseInt(questionNumber);
  
  Object.entries(sectionBoundaries).forEach(([section, boundary]) => {
    const sectionNum = parseInt(section);
    if (qNum >= boundary) {
      currentSection = sectionNum;
    }
  });
  
  return currentSection;
}

function getCurrentSectionForPage(page) {
  if (!hasSections || page < 2) return 1;
  return pageToSectionMap[page] || 1;
}

function isPageInDifferentSection(fromPage, toPage) {
  if (!hasSections) return false;
  return getCurrentSectionForPage(fromPage) !== getCurrentSectionForPage(toPage);
}

function getQuestionsForPage(page) {
  if (page === 1) return [];

  let pageQuestions = [];
  const questionsPerPage = isGMATTest ? 1 : 3;

  // GMAT Adaptive Testing
  if (isGMATTest && isGMATAssessmentIniziale) {
    const questionIndex = page - 2; // page 2 = index 0

    // Check if we need to select a new question adaptively
    if (questionIndex >= questions.length) {
      // Determine which section we should be selecting from based on total questions so far
      const currentGMATSection = determineCurrentAdaptiveSection();
      const nextQuestion = selectNextAdaptiveQuestion(currentGMATSection);

      if (nextQuestion) {
        questions.push(nextQuestion);
        // Don't recalculate totalPages - it's already set to 47 for adaptive tests
      }
    }

    if (questionIndex < questions.length) {
      pageQuestions = [questions[questionIndex]];
    }

    return pageQuestions;
  }

  if (hasSections && pageToSectionMap[page]) {
    const targetSection = pageToSectionMap[page];
    let sectionStart = 1;
    let sectionEnd = Infinity;

    if (sectionBoundaries[targetSection]) {
      sectionStart = sectionBoundaries[targetSection];
    }
    if (sectionBoundaries[targetSection + 1]) {
      sectionEnd = sectionBoundaries[targetSection + 1] - 1;
    }

    const sectionQuestions = questions.filter(q => {
      const qNum = parseInt(q.question_number);
      return qNum >= sectionStart && qNum <= sectionEnd;
    });

    let pagesInSectionBefore = 0;
    for (let p = 2; p < page; p++) {
      if (pageToSectionMap[p] === targetSection) {
        pagesInSectionBefore++;
      }
    }

    const startIndex = pagesInSectionBefore * questionsPerPage;
    pageQuestions = sectionQuestions.slice(startIndex, startIndex + questionsPerPage);
  } else {
    const startIndex = (page - 2) * questionsPerPage;
    pageQuestions = questions.slice(startIndex, startIndex + questionsPerPage);
  }

  return pageQuestions;
}

async function loadQuestionsForPage(page) {
  currentPage = page;
  sessionStorage.setItem("currentPage", currentPage);
  const questionContainer = document.getElementById("question-container");
  
  questionContainer.innerHTML = "";

  // Pagina di benvenuto
  if (page === 1) {
    const currentSection = sessionStorage.getItem("currentSection");
    
    const welcomeDiv = document.createElement("div");
    welcomeDiv.className = "welcome-page";
    
    // Titolo - solo nome del test
    const title = document.createElement("h2");
    title.textContent = currentSection;
    welcomeDiv.appendChild(title);
    
    // Box istruzioni
    const instructionsBox = document.createElement("div");
    instructionsBox.className = "instructions-box";
    
    const instructionsTitle = document.createElement("h3");
    instructionsTitle.textContent = "📋 Istruzioni:";
    instructionsBox.appendChild(instructionsTitle);
    
    const instructionsList = document.createElement("ul");
    const instructions = [];
    
    // Recupera e aggiungi la durata come prima istruzione
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        const studentId = sessionData.session.user.id;
        const currentTipologiaEsercizi = sessionStorage.getItem("currentTipologiaEsercizi");
        const currentTestProgressivo = sessionStorage.getItem("currentTestProgressivo");
        const selectedTestType = sessionStorage.getItem("selectedTestType");
        
        const { data: testData } = await supabase
          .from("student_tests")
          .select("duration")
          .eq("auth_uid", studentId)
          .eq("section", currentSection)
          .eq("tipologia_esercizi", currentTipologiaEsercizi)
          .eq("progressivo", currentTestProgressivo)
          .eq("tipologia_test", selectedTestType)
          .single();
        
        if (testData?.duration) {
          const totalSeconds = testData.duration;
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          let durationText = "";
          
          if (minutes > 0 && seconds > 0) {
            durationText = `<strong>${minutes} minuti e ${seconds} secondi</strong>`;
          } else if (minutes > 0) {
            durationText = `<strong>${minutes} minuti</strong>`;
          } else {
            durationText = `<strong>${seconds} secondi</strong>`;
          }
          
          instructions.push(`Durata del test: ${durationText}`);
        }
      }
    } catch (error) {
      console.error("Errore nel recupero durata:", error);
    }
    
    // Aggiungi le altre istruzioni
    instructions.push(
      isGMATTest ?
        "Il test prevede <strong>1 domanda per pagina</strong>" :
        "Il test prevede <strong>3 domande per pagina</strong>"
    );
    
    instructions.push(
      isBocconiTest ? 
        "Non potrai tornare indietro: la navigazione è <strong>solo in avanti</strong>" :
        hasSections ? 
          "Puoi navigare <strong>solo all'interno della sezione corrente</strong>" :
          "Puoi navigare liberamente tra le domande"
    );
    
    instructions.push("Il test va svolto a <strong>schermo intero</strong>");
    instructions.push("Ogni tentativo di uscita <strong>annulla il test</strong>");
    
    if (hasSections && sectionNames.length > 0) {
      instructions.push(`Le domande sono organizzate in <strong>${sectionNames.length} sezioni</strong>`);
    }
    
    instructions.forEach(text => {
      const li = document.createElement("li");
      li.innerHTML = text;
      instructionsList.appendChild(li);
    });
    
    instructionsBox.appendChild(instructionsList);
    welcomeDiv.appendChild(instructionsBox);
    
    // Box sezioni se presenti
    if (hasSections && sectionNames.length > 0) {
      const sectionsBox = document.createElement("div");
      sectionsBox.className = "sections-box";
      
      const sectionsTitle = document.createElement("h4");
      sectionsTitle.textContent = "📊 Sezioni del test:";
      sectionsBox.appendChild(sectionsTitle);
      
      const sectionsList = document.createElement("ol");
      sectionNames.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        sectionsList.appendChild(li);
      });
      
      sectionsBox.appendChild(sectionsList);
      welcomeDiv.appendChild(sectionsBox);
    }
    
    // Bottone start
    const startBtn = document.createElement("button");
    startBtn.id = "startTestBtn";
    startBtn.textContent = "🚀 Inizia Test";
    startBtn.addEventListener("click", async () => {
      // For GMAT tests, show section order selection
      if (isGMATTest) {
        await showGMATSectionOrderSelection();
      } else {
        timerStarted = true;
        sessionStorage.setItem('timerStarted', 'true');
        expiredSections.clear();
        await enforceFullScreen();
        await startTimerBocconi();
        loadQuestionsForPage(2);
      }
    });

    welcomeDiv.appendChild(startBtn);
    questionContainer.appendChild(welcomeDiv);
    return;
  }

  // Pagine del test
  // GMAT Info Header
  if (isGMATTest) {
    const pageQuestions = getQuestionsForPage(page);
    if (pageQuestions.length > 0) {
      const q = pageQuestions[0]; // For GMAT, only 1 question per page

      // Calculate question number
      let currentQuestionNumber, totalQuestionsDisplay;

      if (isGMATAssessmentIniziale) {
        // Assessment Iniziale: show position within current section
        const currentGMATSection = q.GMAT_section;
        const questionsInSection = questions.filter(qu => qu.GMAT_section === currentGMATSection);
        const questionIndexInSection = questionsInSection.findIndex(qu => qu.id === q.id);
        currentQuestionNumber = questionIndexInSection + 1;

        // Get target count for this section from allQuestionsPool
        const pool = allQuestionsPool[currentGMATSection];
        totalQuestionsDisplay = pool ? pool.targetCount : questionsInSection.length;
      } else {
        // Other GMAT tests: number within section
        const currentGMATSection = q.GMAT_section;
        const questionsInSection = questions.filter(qu => qu.GMAT_section === currentGMATSection);
        const questionIndexInSection = questionsInSection.findIndex(qu => qu.question_number === q.question_number);
        currentQuestionNumber = questionIndexInSection + 1;
        totalQuestionsDisplay = questionsInSection.length;
      }

      const gmatHeader = document.createElement("div");
      gmatHeader.style.cssText = `
        background: linear-gradient(135deg, #1e40af, #3b82f6);
        color: white;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      `;

      const isBookmarked = bookmarkedQuestions.has(q.question_number);

      // Get adaptive selection info for this question
      const selectionInfo = adaptiveSelectionLog.find(log => log.questionNumber === q.question_number);
      const difficulty = q.GMAT_question_difficulty || 'Unknown';
      const difficultyColors = {
        'easy': '#10b981',
        'Easy': '#10b981',
        'medium': '#f59e0b',
        'Medium': '#f59e0b',
        'hard': '#ef4444',
        'Hard': '#ef4444'
      };
      const difficultyColor = difficultyColors[difficulty] || '#6b7280';

      // Review mode indicator
      const reviewModeIndicator = isReviewMode ? `
        <div style="background:#f59e0b;color:white;padding:0.75rem;border-radius:6px;font-weight:600;text-align:center;width:100%;">
          📝 REVIEW MODE - Navigate only bookmarked questions
        </div>
      ` : '';

      // Calculate current performance dynamically
      const currentQIndex = questions.findIndex(qu => qu.question_number === q.question_number);
      const totalAnswered = studentPerformanceHistoryFull.length;
      const totalCorrect = studentPerformanceHistoryFull.filter(x => x).length;
      const overallPercentage = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

      const performanceText = totalAnswered > 0
        ? `${totalCorrect}/${totalAnswered} correct (${overallPercentage.toFixed(0)}% overall)`
        : 'First question';

      // Adaptive testing debug indicator (only for Assessment Iniziale)
      const adaptiveIndicator = isGMATAssessmentIniziale && selectionInfo ? `
        <div style="background:rgba(0,0,0,0.3);padding:0.75rem;border-radius:6px;width:100%;font-size:0.85rem;">
          <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
            <div style="background:${difficultyColor};color:white;padding:0.25rem 0.75rem;border-radius:4px;font-weight:700;">
              ${difficulty.toUpperCase()}
            </div>
            <div style="flex:1;">
              <strong>📊 Algorithm:</strong> ${selectionInfo.reason}
            </div>
            <div>
              <strong>📈 Performance:</strong> ${performanceText}
            </div>
          </div>
        </div>
      ` : (isGMATAssessmentIniziale ? `
        <div style="background:rgba(0,0,0,0.3);padding:0.75rem;border-radius:6px;width:100%;font-size:0.85rem;">
          <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
            <div style="background:${difficultyColor};color:white;padding:0.25rem 0.75rem;border-radius:4px;font-weight:700;">
              ${difficulty.toUpperCase()}
            </div>
            <div>
              <strong>ℹ️ Adaptive Testing Enabled</strong>
            </div>
          </div>
        </div>
      ` : '');

      gmatHeader.innerHTML = `
        ${reviewModeIndicator}
        ${adaptiveIndicator}
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="font-size: 1.2rem; font-weight: 700;">
            📊 ${q.argomento || 'Data Insights'}
          </div>
          <div style="font-size: 0.9rem; opacity: 0.9;">
            ${q.GMAT_section || 'GMAT Data Insights'}${q.di_question_type ? ` - ${q.di_question_type.replace(/^["']|["']$/g, '').trim()}` : ''}
          </div>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          ${!isReviewMode ? `<button id="bookmarkBtn" style="
            background: ${isBookmarked ? '#fbbf24' : 'rgba(255,255,255,0.2)'};
            color: white;
            border: 2px solid white;
            padding: 0.5rem 1rem;
            border-radius:6px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
          " title="${isBookmarked ? 'Remove bookmark' : 'Bookmark for review'}">
            ${isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
          </button>` : ''}
          <div style="font-size: 1.5rem; font-weight: 700;">
            Question ${currentQuestionNumber} of ${totalQuestionsDisplay}
          </div>
        </div>
      `;

      questionContainer.appendChild(gmatHeader);

      // Add bookmark button event listener (only if not in review mode)
      if (!isReviewMode) {
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        if (bookmarkBtn) {
          bookmarkBtn.addEventListener('click', () => toggleBookmark(q.question_number));
        }
      }
    }
  }

  // Header sezione se applicabile
  if (hasSections && sectionNames.length > 0 && !isGMATTest) {
    const currentSection = getCurrentSectionForPage(page);
    const sectionName = sectionNames[currentSection - 1] || `Sezione ${currentSection}`;

    const sectionHeader = document.createElement("div");
    sectionHeader.className = expiredSections.has(currentSection) ?
      "section-header expired" : "section-header";

    if (expiredSections.has(currentSection)) {
      sectionHeader.innerHTML = `
        <span>🔒 ${sectionName} - TEMPO SCADUTO</span>
        <span style="font-size: 14px; font-weight: normal;">Le risposte non possono essere modificate</span>
      `;
    } else {
      sectionHeader.textContent = `📍 ${sectionName}`;
    }

    questionContainer.appendChild(sectionHeader);
  }

  // Mostra domande
  const pageQuestions = getQuestionsForPage(page);
  pageQuestions.forEach((q) => {
    const qDiv = createQuestionElement(q);
    questionContainer.appendChild(qDiv);
  });

  // Container navigazione
  const navContainer = createNavigationContainer();
  questionContainer.appendChild(navContainer);

  // Trigger MathJax (will skip elements with tex2jax_ignore class)
  if (window.MathJax) {
    MathJax.typesetPromise([questionContainer])
      .then(() => console.log("🔢 MathJax Renderizzato"))
      .catch(err => console.error("❌ Errore MathJax:", err));
  }

  buildQuestionNavBocconi();
}

function createQuestionElement(q) {
  const qDiv = document.createElement("div");
  qDiv.className = "bocconi-question";

  // Numero domanda
  const questionNumber = document.createElement("h3");

  // For GMAT Assessment Iniziale: continuous numbering across all sections (1, 2, 3... 46)
  // For other GMAT tests: show number within section
  if (isGMATTest && isGMATAssessmentIniziale) {
    const globalIndex = questions.findIndex(qu => qu.id === q.id);
    questionNumber.textContent = `Domanda ${globalIndex + 1}`;
  } else if (isGMATTest && q.GMAT_section) {
    const currentGMATSection = q.GMAT_section;
    const questionsInSection = questions.filter(qu => qu.GMAT_section === currentGMATSection);
    const questionIndexInSection = questionsInSection.findIndex(qu => qu.question_number === q.question_number);
    const sectionQuestionNumber = questionIndexInSection + 1;
    questionNumber.textContent = `Domanda ${sectionQuestionNumber}`;
  } else {
    questionNumber.textContent = `Domanda ${q.question_number}`;
  }

  qDiv.appendChild(questionNumber);

  // Check if this is a GMAT Data Insights question
  if (q.di_question_type && q.di_question_data) {
    // Strip quotes from di_question_type if present (handles "DS" -> DS)
    const cleanType = q.di_question_type.replace(/^["']|["']$/g, '').trim();
    console.log('📊 Rendering DI question for student:', cleanType);

    // Use student-facing DI renderer
    let diContent = null;
    const currentAnswer = studentAnswers[q.id] || null;

    switch (cleanType) {
      case 'DS':
        if (window.DIStudentDataSufficiency) {
          diContent = window.DIStudentDataSufficiency.render(q.di_question_data, q.id, currentAnswer);
        }
        break;
      case 'GI':
        if (window.DIStudentGraphicsInterpretation) {
          diContent = window.DIStudentGraphicsInterpretation.render(q.di_question_data, q.id, currentAnswer);
        }
        break;
      case 'TA':
        if (window.DIStudentTableAnalysis) {
          diContent = window.DIStudentTableAnalysis.render(q.di_question_data, q.id, currentAnswer);
        }
        break;
      case 'TPA':
        if (window.DIStudentTwoPartAnalysis) {
          diContent = window.DIStudentTwoPartAnalysis.render(q.di_question_data, q.id, currentAnswer);
        }
        break;
      case 'MSR':
        if (window.DIStudentMultiSourceReasoning) {
          diContent = window.DIStudentMultiSourceReasoning.render(q.di_question_data, q.id, currentAnswer);
        }
        break;
    }

    if (diContent) {
      // Store correct answer for DI questions in correctMapping
      if (q.di_question_data) {
        try {
          const diData = typeof q.di_question_data === 'string'
            ? JSON.parse(q.di_question_data)
            : q.di_question_data;

          // Extract correct answer based on question type
          if (cleanType === 'MSR') {
            // For MSR, build combined correct answer from all sub-questions
            const msrCorrectAnswer = {};
            if (diData.questions) {
              diData.questions.forEach((subQ, idx) => {
                if (subQ.question_type === 'multiple_choice' && subQ.correct_answer) {
                  msrCorrectAnswer[`q${idx}`] = subQ.correct_answer;
                } else if (subQ.question_type === 'two_column' && subQ.correct_answers) {
                  msrCorrectAnswer[`q${idx}`] = subQ.correct_answers;
                }
              });
            }
            correctMapping[q.id] = JSON.stringify(msrCorrectAnswer);
          } else if (cleanType === 'GI') {
            // For GI, build correct answer from blank1_correct and blank2_correct
            const giCorrectAnswer = {
              blank1: diData.blank1_correct,
              blank2: diData.blank2_correct
            };
            correctMapping[q.id] = JSON.stringify(giCorrectAnswer);
          } else if (diData.correct_answer) {
            correctMapping[q.id] = JSON.stringify(diData.correct_answer);
          } else if (diData.correct_answers) {
            correctMapping[q.id] = JSON.stringify(diData.correct_answers);
          }
        } catch (e) {
          console.error('Error extracting DI correct answer:', e);
        }
      }

      qDiv.appendChild(diContent);
      return qDiv;
    } else {
      console.warn('⚠️ DI renderer not found for type:', q.di_question_type);
      // Fall through to standard rendering with error message
      const errorMsg = document.createElement("p");
      errorMsg.style.cssText = "color: #ef4444; padding: 1rem; background: #fee2e2; border-radius: 4px;";
      errorMsg.textContent = `⚠️ Data Insights question type "${q.di_question_type}" not yet implemented for student view.`;
      qDiv.appendChild(errorMsg);
      return qDiv;
    }
  }

  // Testo domanda (standard questions only)
  const questionText = document.createElement("p");
  questionText.className = "question-text latex";
  questionText.textContent = q.question_text;
  qDiv.appendChild(questionText);

  // Immagine domanda se presente
  if (q.image_url) {
    const img = document.createElement("img");
    img.src = q.image_url;
    img.alt = "Immagine domanda";
    img.className = "question-image";
    img.onerror = function() {
      this.style.display = "none";
      console.warn("Immagine non trovata:", q.image_url);
    };
    qDiv.appendChild(img);
  }

  // Prepara opzioni
  const choices = [];
  const optionLetters = ['a', 'b', 'c', 'd', 'e'];
  
  optionLetters.forEach(letter => {
    const optionText = q[`option_${letter}`];
    const optionImage = q[`image_option_${letter}`];
    
    if (optionText || optionImage) {
      choices.push({
        letter: letter.toUpperCase(),
        text: optionText || '',
        image: optionImage || null,
        isCorrect: letter.toUpperCase() === q.correct_answer
      });
    }
  });

  choices.push({ letter: 'X', text: 'Insicuro', isCorrect: false });
  choices.push({ letter: 'Y', text: 'Non ho idea', isCorrect: false });

  correctMapping[q.id] = q.correct_answer;

  // Container opzioni
  const choicesDiv = document.createElement("div");
  choicesDiv.className = "choices";

  choices.forEach(choice => {
    const choiceDiv = createChoiceElement(q, choice);
    choicesDiv.appendChild(choiceDiv);
  });

  qDiv.appendChild(choicesDiv);
  return qDiv;
}

function createChoiceElement(question, choice) {
  const choiceDiv = document.createElement("div");
  choiceDiv.className = "choice-item";
  choiceDiv.dataset.questionId = question.id;
  choiceDiv.dataset.letter = choice.letter;
  
  // Check se già selezionata
  if (studentAnswers[question.id] === choice.letter) {
    choiceDiv.classList.add("selected");
  }
  
  // Check se sezione scaduta
  const questionSection = getCurrentSectionForQuestion(question.question_number);
  if (hasSections && expiredSections.has(questionSection)) {
    choiceDiv.classList.add("disabled");
  }
  
  // Contenuto
  const contentDiv = document.createElement("div");
  contentDiv.style.display = "flex";
  contentDiv.style.alignItems = "flex-start";
  contentDiv.style.gap = "10px";
  
  const letterSpan = document.createElement("span");
  letterSpan.style.fontWeight = "bold";
  letterSpan.style.color = "var(--primary-green)";
  letterSpan.style.minWidth = "25px";
  letterSpan.textContent = `${choice.letter}.`;
  contentDiv.appendChild(letterSpan);
  
  const textSpan = document.createElement("span");
  textSpan.style.flex = "1";
  textSpan.className = "latex";
  textSpan.textContent = choice.text;
  contentDiv.appendChild(textSpan);
  
  choiceDiv.appendChild(contentDiv);
  
  // Immagine opzione se presente
  if (choice.image) {
    const img = document.createElement("img");
    img.src = choice.image;
    img.alt = `Opzione ${choice.letter}`;
    img.style.maxWidth = "300px";
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.display = "block";
    img.style.marginTop = "10px";
    img.style.marginLeft = "35px";
    img.style.borderRadius = "6px";
    img.onerror = function() {
      this.style.display = "none";
    };
    choiceDiv.appendChild(img);
  }
  
  // Click handler
  if (!choiceDiv.classList.contains("disabled")) {
    choiceDiv.addEventListener("click", () => {
      if (hasSections && expiredSections.has(questionSection)) {
        showCustomAlert("⏰ Il tempo per questa sezione è scaduto. Non puoi più modificare le risposte.");
        return;
      }
      selectAnswerBocconi(question.id, choice.letter, choiceDiv, choiceDiv.parentElement);
    });
  }
  
  return choiceDiv;
}

function toggleBookmark(questionNumber) {
  if (bookmarkedQuestions.has(questionNumber)) {
    bookmarkedQuestions.delete(questionNumber);
    console.log(`📑 Removed bookmark from question ${questionNumber}`);
  } else {
    bookmarkedQuestions.add(questionNumber);
    console.log(`⭐ Bookmarked question ${questionNumber}`);
  }

  // Refresh the current page to update the button
  loadQuestionsForPage(currentPage);
}

function isQuestionFullyAnswered(question) {
  const answer = studentAnswers[question.id];

  // No answer at all
  if (answer === undefined || answer === null || answer === '') {
    return false;
  }

  // Check if it's a DI (Data Insights) question that requires multiple parts
  if (question.di_question_type && question.di_question_data) {
    const cleanType = question.di_question_type.replace(/^["']|["']$/g, '').trim();

    // Data Sufficiency stores simple letter answers (A, B, C, D, E), not JSON
    if (cleanType === 'DS') {
      return answer && answer !== '' && typeof answer === 'string';
    }

    // For other DI types, try to parse as JSON
    // Check if answer looks like JSON (starts with { or [)
    if (typeof answer !== 'string' || (!answer.startsWith('{') && !answer.startsWith('['))) {
      // Not JSON, treat as simple answer
      return answer && answer !== '';
    }

    try {
      const parsedAnswer = JSON.parse(answer);

      switch (cleanType) {
        case 'GI': // Graphics Interpretation - needs both blanks
          return parsedAnswer.blank1 && parsedAnswer.blank1 !== '' &&
                 parsedAnswer.blank2 && parsedAnswer.blank2 !== '';

        case 'TPA': // Two-Part Analysis - needs both columns selected
          return parsedAnswer.col1 && parsedAnswer.col1 !== '' &&
                 parsedAnswer.col2 && parsedAnswer.col2 !== '';

        case 'TA': // Table Analysis - check if all statements have column selections
          // Format: {stmt0: 'col1', stmt1: 'col2', stmt2: 'col1'} - each row selects a column
          // Check if at least one statement is answered
          return Object.keys(parsedAnswer).some(key =>
            key.startsWith('stmt') && (parsedAnswer[key] === 'col1' || parsedAnswer[key] === 'col2')
          );

        case 'MSR': // Multi-Source Reasoning - check all sub-questions answered
          // MSR answer format: {q0: 'A', q1: {stmt0: 'col1', stmt1: 'col2'}, q2: 'B'}
          // Count total sub-questions in the question data
          const msrData = typeof question.di_question_data === 'string'
            ? JSON.parse(question.di_question_data)
            : question.di_question_data;
          const totalMSRQuestions = (msrData?.questions || []).length;

          // Check if all sub-questions have answers
          const answeredQuestions = Object.keys(parsedAnswer).filter(key => key.startsWith('q')).length;
          return answeredQuestions === totalMSRQuestions && answeredQuestions > 0;

        default:
          return answer && answer !== '';
      }
    } catch (e) {
      console.error('Error parsing answer for DI question:', e);
      // If can't parse, treat as simple answer
      return answer && answer !== '';
    }
  }

  // Regular question - just check if answer exists
  return answer && answer !== '';
}

function reorderQuestionsByGMATSection() {
  if (gmatSectionOrder.length === 0) {
    console.log('⚠️ No GMAT section order defined, keeping original order');
    return;
  }

  // For adaptive testing, questions are selected on-the-fly, no reordering needed
  if (isGMATAssessmentIniziale && Object.keys(allQuestionsPool).length > 0) {
    console.log('🧠 Adaptive mode: Section order set to', gmatSectionOrder);
    console.log('   Questions will be selected adaptively as test progresses');
    return;
  }

  // Regular reordering for non-adaptive tests
  // Group questions by GMAT_section
  const questionsBySection = {};
  questions.forEach(q => {
    const section = q.GMAT_section || 'Other';
    if (!questionsBySection[section]) {
      questionsBySection[section] = [];
    }
    questionsBySection[section].push(q);
  });

  // Sort questions within each section by question_number
  Object.keys(questionsBySection).forEach(section => {
    questionsBySection[section].sort((a, b) => {
      return parseInt(a.question_number) - parseInt(b.question_number);
    });
  });

  // Rebuild questions array in the order specified by gmatSectionOrder
  const reorderedQuestions = [];
  gmatSectionOrder.forEach(sectionName => {
    if (questionsBySection[sectionName]) {
      reorderedQuestions.push(...questionsBySection[sectionName]);
      console.log(`📋 Added ${questionsBySection[sectionName].length} questions from section: ${sectionName}`);
    }
  });

  // Add any questions from sections not in the order (shouldn't happen but just in case)
  Object.keys(questionsBySection).forEach(section => {
    if (!gmatSectionOrder.includes(section)) {
      reorderedQuestions.push(...questionsBySection[section]);
      console.warn(`⚠️ Added ${questionsBySection[section].length} questions from unlisted section: ${section}`);
    }
  });

  questions = reorderedQuestions;
  console.log(`✅ Questions reordered. Total: ${questions.length}`);
}

// ====== GMAT ADAPTIVE TESTING FUNCTIONS ======

function buildAdaptiveQuestionPool() {
  console.log('🧠 Building adaptive question pool for Assessment Iniziale');

  // Question counts per section for Assessment Iniziale
  const sectionConfig = {
    'Quantitative Reasoning': 15,
    'Data Insights': 15,
    'Verbal Reasoning': 16
  };

  // Group all questions by GMAT_section
  allQuestionsPool = {};
  questions.forEach(q => {
    const section = q.GMAT_section;
    if (!section) return;

    if (!allQuestionsPool[section]) {
      allQuestionsPool[section] = {
        all: [],
        easy: [],
        medium: [],
        hard: [],
        selected: [],
        targetCount: sectionConfig[section] || 15
      };
    }

    // Add to appropriate difficulty pool
    allQuestionsPool[section].all.push(q);
    const difficulty = (q.GMAT_question_difficulty || 'medium').toLowerCase();
    if (allQuestionsPool[section][difficulty]) {
      allQuestionsPool[section][difficulty].push(q);
    } else {
      allQuestionsPool[section].medium.push(q); // Default to medium
    }
  });

  // Sort each pool by question_number
  Object.keys(allQuestionsPool).forEach(section => {
    ['all', 'easy', 'medium', 'hard'].forEach(difficulty => {
      allQuestionsPool[section][difficulty].sort((a, b) =>
        parseInt(a.question_number) - parseInt(b.question_number)
      );
    });

    console.log(`📊 ${section}: ${allQuestionsPool[section].all.length} total questions`);
    console.log(`   - Easy: ${allQuestionsPool[section].easy.length}`);
    console.log(`   - Medium: ${allQuestionsPool[section].medium.length}`);
    console.log(`   - Hard: ${allQuestionsPool[section].hard.length}`);
    console.log(`   - Target: ${allQuestionsPool[section].targetCount} questions`);
  });

  // DON'T pre-select baseline questions - they will be selected adaptively
  // Questions are already sorted by question_number, no shuffling needed
  Object.keys(allQuestionsPool).forEach(section => {
    // Initialize selected array as empty
    allQuestionsPool[section].selected = [];

    console.log(`✅ ${section}: Pool ready for adaptive selection`);
  });

  // Start with empty questions array - will be populated adaptively
  questions = [];

  console.log(`✅ Adaptive pool ready. Initial questions: ${questions.length}`);
}

function buildSimulazioniQuestionList() {
  console.log('📊 Building question list for Simulazioni (non-adaptive)');

  // Question counts per section for Simulazioni
  const sectionConfig = {
    'Quantitative Reasoning': 21,
    'Verbal Reasoning': 23,
    'Data Insights': 21
  };

  // Group questions by section and take exact count needed
  const questionsBySection = {};
  questions.forEach(q => {
    const section = q.GMAT_section;
    if (!section) return;

    if (!questionsBySection[section]) {
      questionsBySection[section] = [];
    }
    questionsBySection[section].push(q);
  });

  // Sort and select exact count for each section
  const selectedQuestions = [];
  Object.keys(questionsBySection).forEach(section => {
    questionsBySection[section].sort((a, b) =>
      parseInt(a.question_number) - parseInt(b.question_number)
    );

    const targetCount = sectionConfig[section] || questionsBySection[section].length;
    const sectionQuestions = questionsBySection[section].slice(0, targetCount);
    selectedQuestions.push(...sectionQuestions);

    console.log(`📋 ${section}: Selected ${sectionQuestions.length}/${targetCount} questions`);
  });

  questions = selectedQuestions;
  console.log(`✅ Simulazioni questions ready. Total: ${questions.length}`);
}

function selectNextAdaptiveQuestion(currentSection) {
  const pool = allQuestionsPool[currentSection];
  if (!pool) {
    console.error(`❌ No question pool found for section: ${currentSection}`);
    return null;
  }

  // Check if we've reached the target count
  if (pool.selected.length >= pool.targetCount) {
    console.log(`✅ Section ${currentSection} complete: ${pool.selected.length}/${pool.targetCount}`);
    return null;
  }

  // BASELINE: First 5 questions in each section should be MEDIUM (by question_number order)
  if (pool.selected.length < 5) {
    const availableBaseline = pool.medium.filter(q =>
      !pool.selected.some(selected => selected.id === q.id)
    );

    if (availableBaseline.length === 0) {
      console.error(`❌ No medium questions available for baseline in ${currentSection}`);
      return null;
    }

    // Select FIRST available medium question by question_number (already sorted)
    const selectedQuestion = availableBaseline[0];

    pool.selected.push(selectedQuestion);

    adaptiveSelectionLog.push({
      questionNumber: selectedQuestion.question_number,
      section: currentSection,
      difficulty: selectedQuestion.GMAT_question_difficulty,
      reason: `Baseline question ${pool.selected.length}/5 for ${currentSection} (MEDIUM)`,
      performance: null
    });

    console.log(`🎯 BASELINE: Selected Q${selectedQuestion.question_number} (${pool.selected.length}/5) for ${currentSection}`);
    return selectedQuestion;
  }

  // ADAPTIVE: After baseline, select based on LAST ANSWER ONLY
  // Simple rule: Last answer correct → Hard, Last answer wrong → Medium

  // Get performance history for CURRENT SECTION only
  const sectionAnswers = [];
  questions.forEach((q, idx) => {
    if (q.GMAT_section === currentSection && idx < studentPerformanceHistoryFull.length) {
      sectionAnswers.push(studentPerformanceHistoryFull[idx]);
    }
  });

  const totalAnswers = sectionAnswers.length;

  // Determine difficulty based on LAST answer in current section
  let targetDifficulty = 'medium';
  let reason = '';

  if (totalAnswers > 0) {
    const lastAnswer = sectionAnswers[sectionAnswers.length - 1];
    if (lastAnswer) {
      targetDifficulty = 'hard';
      reason = 'Last answer CORRECT → Hard';
    } else {
      targetDifficulty = 'medium';
      reason = 'Last answer WRONG → Medium';
    }
  } else {
    // No answers yet in section (shouldn't happen after baseline, but fallback)
    targetDifficulty = 'medium';
    reason = 'No previous answers → Medium';
  }

  // Get available questions from target difficulty
  let availableQuestions = pool[targetDifficulty].filter(q =>
    !pool.selected.some(selected => selected.id === q.id)
  );

  // Fallback if no questions available in target difficulty
  if (availableQuestions.length === 0) {
    if (targetDifficulty === 'hard') {
      // If wanted hard but none available, try medium
      console.warn(`⚠️ No hard questions available, falling back to medium`);
      availableQuestions = pool.medium.filter(q =>
        !pool.selected.some(selected => selected.id === q.id)
      );
      reason += ' (fallback: hard→medium)';
    } else if (targetDifficulty === 'medium') {
      // If wanted medium but none available, try easy
      console.warn(`⚠️ No medium questions available, falling back to easy`);
      availableQuestions = pool.easy.filter(q =>
        !pool.selected.some(selected => selected.id === q.id)
      );
      reason += ' (fallback: medium→easy)';
    }
  }

  // Final fallback: any unselected question from all difficulties
  if (availableQuestions.length === 0) {
    console.warn(`⚠️ No questions available in preferred difficulties, using any unselected question`);
    availableQuestions = pool.all.filter(q =>
      !pool.selected.some(selected => selected.id === q.id)
    );
    reason += ' (fallback: any)';
  }

  if (availableQuestions.length === 0) {
    console.error(`❌ No more questions available for section: ${currentSection}`);
    return null;
  }

  // Select FIRST available question by question_number (already sorted)
  const selectedQuestion = availableQuestions[0];

  // Add to selected pool (ensuring no duplicates)
  if (pool.selected.some(q => q.id === selectedQuestion.id)) {
    console.error(`❌ Duplicate question detected! Q${selectedQuestion.question_number} already selected`);
    return null;
  }

  pool.selected.push(selectedQuestion);

  // Calculate display performance from CURRENT SECTION answers only
  const sectionCorrect = sectionAnswers.filter(x => x).length;
  const sectionPercentage = totalAnswers > 0 ? (sectionCorrect / totalAnswers) * 100 : 0;

  // Log the selection
  adaptiveSelectionLog.push({
    questionNumber: selectedQuestion.question_number,
    section: currentSection,
    difficulty: selectedQuestion.GMAT_question_difficulty,
    reason: `${reason} (first from ${availableQuestions.length} available)`,
    performance: totalAnswers > 0
      ? `${sectionCorrect}/${totalAnswers} correct in ${currentSection} (${sectionPercentage.toFixed(0)}%)`
      : 'First question in section'
  });

  console.log(`🎯 Selected Q${selectedQuestion.question_number} (${selectedQuestion.GMAT_question_difficulty}) for ${currentSection}`);
  console.log(`   Reason: ${reason}`);
  console.log(`   Available pool: ${availableQuestions.length} questions`);

  return selectedQuestion;
}

async function showGMATSectionOrderSelection() {
  // For adaptive testing, get sections from allQuestionsPool
  let uniqueSections;
  if (isGMATAssessmentIniziale && Object.keys(allQuestionsPool).length > 0) {
    uniqueSections = Object.keys(allQuestionsPool);
  } else {
    // For non-adaptive, get unique GMAT sections from questions
    uniqueSections = [...new Set(questions.map(q => q.GMAT_section).filter(Boolean))];
  }

  if (uniqueSections.length === 0) {
    // No sections defined, start normally
    timerStarted = true;
    sessionStorage.setItem('timerStarted', 'true');
    expiredSections.clear();
    await enforceFullScreen();
    await startTimerBocconi();
    loadQuestionsForPage(2);
    return;
  }

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:999999';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:white;padding:2rem;border-radius:12px;max-width:700px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5)';

    dialog.innerHTML = `
      <h2 style="color:#1e40af;margin-bottom:1rem;font-size:1.8rem;">📋 Select Section Order</h2>
      <p style="color:#374151;margin-bottom:1.5rem;">Drag and drop to arrange the sections in your preferred order:</p>
      <div id="sectionOrderList" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.5rem;">
        ${uniqueSections.map((section, idx) => `
          <div class="section-item" data-section="${section}" draggable="true" style="
            background:linear-gradient(135deg, #3b82f6, #60a5fa);
            color:white;
            padding:1rem;
            border-radius:8px;
            cursor:move;
            display:flex;
            align-items:center;
            gap:1rem;
            font-weight:600;
          ">
            <span style="font-size:1.5rem;">☰</span>
            <span>${idx + 1}. ${section}</span>
          </div>
        `).join('')}
      </div>
      <button id="confirmOrderBtn" style="
        background:linear-gradient(135deg,#00a666,#00c775);
        color:white;
        border:none;
        padding:1rem 2rem;
        border-radius:8px;
        font-size:1.1rem;
        font-weight:600;
        cursor:pointer;
        width:100%;
      ">✓ Confirm and Start Test</button>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Drag and drop functionality
    const listContainer = dialog.querySelector('#sectionOrderList');
    let draggedElement = null;

    listContainer.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('section-item')) {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
      }
    });

    listContainer.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('section-item')) {
        e.target.style.opacity = '1';
      }
    });

    listContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(listContainer, e.clientY);
      if (afterElement == null) {
        listContainer.appendChild(draggedElement);
      } else {
        listContainer.insertBefore(draggedElement, afterElement);
      }
      updateSectionNumbers();
    });

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.section-item:not(.dragging)')];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updateSectionNumbers() {
      const items = listContainer.querySelectorAll('.section-item');
      items.forEach((item, idx) => {
        const sectionName = item.dataset.section;
        item.querySelector('span:last-child').textContent = `${idx + 1}. ${sectionName}`;
      });
    }

    dialog.querySelector('#confirmOrderBtn').addEventListener('click', async () => {
      const items = listContainer.querySelectorAll('.section-item');
      gmatSectionOrder = Array.from(items).map(item => item.dataset.section);
      console.log('📋 GMAT Section Order:', gmatSectionOrder);

      // Reorder questions based on selected section order
      reorderQuestionsByGMATSection();

      // For adaptive tests, totalPages is already set to 47
      // No need to recalculate

      document.body.removeChild(overlay);

      timerStarted = true;
      sessionStorage.setItem('timerStarted', 'true');
      expiredSections.clear();
      await enforceFullScreen();
      await startTimerBocconi();
      loadQuestionsForPage(2);

      resolve();
    });
  });
}

function createNavigationContainer() {
  const navContainer = document.createElement("div");
  navContainer.className = "nav-buttons";

  // GMAT Review Mode Navigation
  if (isGMATTest && isReviewMode) {
    const currentGMATSection = getCurrentGMATSection(currentPage);
    const bookmarkedInSection = getBookmarkedQuestionsInSection(currentGMATSection);
    const currentQuestionNumber = getQuestionsForPage(currentPage)[0]?.question_number;
    const currentBookmarkIndex = bookmarkedInSection.findIndex(q => q.question_number === currentQuestionNumber);

    // Previous Bookmarked Question
    const prevBookmarkBtn = document.createElement("button");
    prevBookmarkBtn.textContent = "← Previous Bookmark";
    if (currentBookmarkIndex > 0) {
      prevBookmarkBtn.addEventListener("click", () => {
        const prevBookmarked = bookmarkedInSection[currentBookmarkIndex - 1];
        const pageNumber = getPageForQuestion(prevBookmarked.question_number);
        loadQuestionsForPage(pageNumber);
      });
    } else {
      prevBookmarkBtn.disabled = true;
      prevBookmarkBtn.classList.add("disabled");
    }

    // Next Bookmarked Question
    const nextBookmarkBtn = document.createElement("button");
    nextBookmarkBtn.textContent = "Next Bookmark →";
    if (currentBookmarkIndex < bookmarkedInSection.length - 1) {
      nextBookmarkBtn.addEventListener("click", () => {
        const nextBookmarked = bookmarkedInSection[currentBookmarkIndex + 1];
        const pageNumber = getPageForQuestion(nextBookmarked.question_number);
        loadQuestionsForPage(pageNumber);
      });
    } else {
      nextBookmarkBtn.disabled = true;
      nextBookmarkBtn.classList.add("disabled");
    }

    // Exit Review Button
    const exitReviewBtn = document.createElement("button");
    exitReviewBtn.textContent = "Exit Review & Continue →";
    exitReviewBtn.style.background = "linear-gradient(135deg,#00a666,#00c775)";
    exitReviewBtn.style.color = "white";
    exitReviewBtn.addEventListener("click", async () => {
      isReviewMode = false;
      const nextSectionStart = findNextSectionStart(currentGMATSection);
      if (nextSectionStart > 0) {
        await showGMATBreakOption(nextSectionStart);
      } else {
        await submitAnswersBocconi();
      }
    });

    navContainer.appendChild(prevBookmarkBtn);
    navContainer.appendChild(nextBookmarkBtn);
    navContainer.appendChild(exitReviewBtn);
    return navContainer;
  }

  // Regular Navigation (non-review mode)
  // Bottone Previous
  const prevBtn = document.createElement("button");
  prevBtn.id = "prevPage";
  prevBtn.textContent = "← Indietro";

  if (isBocconiTest || isGMATTest) {
    prevBtn.disabled = true;
    prevBtn.classList.add("disabled");
  } else if (hasSections) {
    const canGoPrev = currentPage > 2 && !isPageInDifferentSection(currentPage, currentPage - 1);
    prevBtn.disabled = !canGoPrev;
    if (!canGoPrev) prevBtn.classList.add("disabled");
  } else {
    prevBtn.disabled = currentPage <= 2;
    if (currentPage <= 2) prevBtn.classList.add("disabled");
  }

  prevBtn.addEventListener("click", () => {
    if (!prevBtn.disabled) navigateToPrevPage();
  });

  // Bottone Next
  const nextBtn = document.createElement("button");
  nextBtn.id = "nextPage";

  if (hasSections && !isBocconiTest && currentPage < totalPages &&
      isPageInDifferentSection(currentPage, currentPage + 1)) {
    nextBtn.textContent = "Prossima Sezione →";
    nextBtn.classList.add("section-change");
  } else {
    nextBtn.textContent = "Avanti →";
  }

  if (currentPage >= totalPages) {
    nextBtn.style.display = "none";
  }

  // GMAT: Set next button state based on whether current question is answered
  // Update ALL buttons with id="nextPage" (including any in HTML)
  if (isGMATTest && currentPage > 1) {
    const currentPageQuestions = getQuestionsForPage(currentPage);
    if (currentPageQuestions.length > 0) {
      const currentQuestion = currentPageQuestions[0];
      const isAnswered = isQuestionFullyAnswered(currentQuestion);

      // Wait for nextBtn to be added to DOM, then update all buttons
      setTimeout(() => {
        const allNextButtons = document.querySelectorAll('#nextPage');
        allNextButtons.forEach(btn => {
          if (!isAnswered) {
            btn.disabled = true;
            btn.classList.add("disabled");
            btn.title = "You must answer the current question before proceeding";
          } else {
            btn.disabled = false;
            btn.classList.remove("disabled");
            btn.title = "";
          }
        });
      }, 0);
    }
  }

  nextBtn.addEventListener("click", () => {
    // GMAT: Check if current question is answered before allowing navigation
    if (isGMATTest && currentPage > 1) {
      const currentPageQuestions = getQuestionsForPage(currentPage);
      if (currentPageQuestions.length > 0) {
        const currentQuestion = currentPageQuestions[0];
        const isAnswered = isQuestionFullyAnswered(currentQuestion);

        if (!isAnswered) {
          showCustomAlert("⚠️ Please answer the current question before proceeding to the next one.");
          return;
        }
      }
    }

    if (currentPage < totalPages) navigateToNextPage();
  });

  // Bottone Submit - SEMPRE VISIBILE
  const submitBtn = document.createElement("button");
  submitBtn.id = "submitAnswers";
  submitBtn.textContent = "📤 Invia Test";

  // Controlla se siamo nell'ultima sezione
  const currentSection = getCurrentSectionForPage(currentPage);
  const totalSections = hasSections ? Math.max(...Object.keys(sectionBoundaries).map(k => parseInt(k))) : 1;
  const isLastSection = !hasSections || currentSection >= totalSections;

  if (!isLastSection) {
    // Non nell'ultima sezione - disabilita il bottone
    submitBtn.disabled = true;
    submitBtn.classList.add("disabled");
    submitBtn.title = "Disponibile solo nell'ultima sezione";
    submitBtn.style.opacity = "0.5";
    submitBtn.style.cursor = "not-allowed";
  } else {
    // Ultima sezione - abilita il bottone
    submitBtn.addEventListener("click", async () => {
      await submitAnswersBocconi();
    });
  }

  navContainer.appendChild(prevBtn);
  navContainer.appendChild(nextBtn);
  navContainer.appendChild(submitBtn);

  return navContainer;
}
function navigateToPrevPage() {
  if (isBocconiTest) return;
  
  if (hasSections) {
    const targetPage = currentPage - 1;
    if (targetPage < 2) return;
    
    if (isPageInDifferentSection(currentPage, targetPage)) {
      showCustomAlert("Non puoi tornare alla sezione precedente!");
      return;
    }
  }
  
  loadQuestionsForPage(currentPage - 1);
}

function navigateToNextPage() {
  const targetPage = currentPage + 1;

  // GMAT Assessment Iniziale: Check if section is complete
  if (isGMATTest && isGMATAssessmentIniziale) {
    const currentGMATSection = getCurrentGMATSection(currentPage);

    if (currentGMATSection && allQuestionsPool[currentGMATSection]) {
      const pool = allQuestionsPool[currentGMATSection];

      // Check if we've completed the target number of questions for this section
      if (pool.selected.length >= pool.targetCount) {
        console.log(`✅ Section ${currentGMATSection} complete with ${pool.selected.length}/${pool.targetCount} questions`);
        handleGMATSectionEnd(targetPage);
        return;
      }
    }

    // Section not complete, continue to next question
    loadQuestionsForPage(targetPage);
    return;
  }

  // GMAT Simulazioni: Check if section changed
  if (isGMATTest && isGMATSimulazioni && targetPage <= totalPages) {
    const currentGMATSection = getCurrentGMATSection(currentPage);
    const nextGMATSection = getCurrentGMATSection(targetPage);

    if (currentGMATSection !== nextGMATSection && currentGMATSection) {
      handleGMATSectionEnd(targetPage);
      return;
    }
  }

  if (hasSections && !isBocconiTest && isPageInDifferentSection(currentPage, targetPage)) {
    showSectionChangeDialog(() => {
      loadQuestionsForPage(targetPage);
    });
  } else {
    loadQuestionsForPage(targetPage);
  }
}

function getCurrentGMATSection(page) {
  if (page < 2) return null;
  const pageQuestions = getQuestionsForPage(page);
  if (pageQuestions.length === 0) return null;
  return pageQuestions[0].GMAT_section || null;
}

function determineCurrentAdaptiveSection() {
  // Determine which section should be active based on total questions answered
  // Section order: gmatSectionOrder (e.g., ['Quantitative Reasoning', 'Verbal Reasoning', 'Data Insights'])
  // Section targets: Quant=15, Verbal=16, DI=15

  if (!gmatSectionOrder || gmatSectionOrder.length === 0) {
    console.error('❌ No GMAT section order defined');
    return null;
  }

  // Count how many questions are already in each section
  let sectionCounts = {};
  questions.forEach(q => {
    const section = q.GMAT_section;
    if (section) {
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    }
  });

  // Go through sections in order and find the first one that's not complete
  for (const sectionName of gmatSectionOrder) {
    const pool = allQuestionsPool[sectionName];
    if (!pool) continue;

    const currentCount = sectionCounts[sectionName] || 0;
    if (currentCount < pool.targetCount) {
      console.log(`📍 Current adaptive section: ${sectionName} (${currentCount}/${pool.targetCount} questions)`);
      return sectionName;
    }
  }

  console.log('✅ All sections complete');
  return null;
}

function getBookmarkedQuestionsInSection(gmatSection) {
  return questions.filter(q =>
    q.GMAT_section === gmatSection &&
    bookmarkedQuestions.has(q.question_number)
  );
}

async function handleGMATSectionEnd(nextPage) {
  const currentGMATSection = getCurrentGMATSection(currentPage);
  const bookmarkedInSection = getBookmarkedQuestionsInSection(currentGMATSection);

  // Check if we have time remaining (get from timer)
  const timeLeftElement = document.getElementById("time-left");
  const hasTimeRemaining = timeLeftElement && timeLeftElement.textContent !== "00:00";

  // Show review mode if there are bookmarked questions and time remaining
  if (bookmarkedInSection.length > 0 && hasTimeRemaining && !isReviewMode) {
    await showGMATReviewMode(currentGMATSection, bookmarkedInSection, nextPage);
  } else {
    // No bookmarked questions or no time - proceed to break/next section
    if (nextPage <= totalPages) {
      await showGMATBreakOption(nextPage);
    } else {
      // End of test - submit
      await submitAnswersBocconi();
    }
  }
}

async function showGMATReviewMode(sectionName, bookmarkedQuestions, nextPage) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:999999';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:white;padding:2rem;border-radius:12px;max-width:600px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5)';

    dialog.innerHTML = `
      <h2 style="color:#1e40af;margin-bottom:1rem;font-size:1.8rem;">⭐ Review Bookmarked Questions</h2>
      <p style="color:#374151;margin-bottom:1rem;">
        You have <strong>${bookmarkedQuestions.length} bookmarked question(s)</strong> in the <strong>${sectionName}</strong> section.
      </p>
      <p style="color:#6b7280;margin-bottom:1.5rem;font-size:0.9rem;">
        You can review and change answers only for bookmarked questions.
        This will use your remaining time.
      </p>
      <div style="display:flex;gap:1rem;flex-direction:column;">
        <button id="enterReviewBtn" style="
          background:linear-gradient(135deg,#3b82f6,#60a5fa);
          color:white;
          border:none;
          padding:1rem 2rem;
          border-radius:8px;
          font-size:1.1rem;
          font-weight:600;
          cursor:pointer;
        ">📝 Review Bookmarked Questions</button>
        <button id="skipReviewBtn" style="
          background:#6b7280;
          color:white;
          border:none;
          padding:1rem 2rem;
          border-radius:8px;
          font-size:1.1rem;
          font-weight:600;
          cursor:pointer;
        ">→ Skip Review and Continue</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    dialog.querySelector('#enterReviewBtn').addEventListener('click', () => {
      document.body.removeChild(overlay);
      isReviewMode = true;
      // Navigate to first bookmarked question in section
      const firstBookmarked = bookmarkedQuestions[0];
      const pageNumber = getPageForQuestion(firstBookmarked.question_number);
      loadQuestionsForPage(pageNumber);
      resolve();
    });

    dialog.querySelector('#skipReviewBtn').addEventListener('click', async () => {
      document.body.removeChild(overlay);
      if (nextPage <= totalPages) {
        await showGMATBreakOption(nextPage);
      } else {
        await submitAnswersBocconi();
      }
      resolve();
    });
  });
}

async function showGMATBreakOption(nextPage) {
  if (breakTaken || nextPage > totalPages) {
    // Break already taken or no more sections, just continue
    isReviewMode = false;
    loadQuestionsForPage(nextPage);
    return;
  }

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:999999';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:white;padding:2rem;border-radius:12px;max-width:600px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5)';

    const nextSection = getCurrentGMATSection(nextPage);

    dialog.innerHTML = `
      <h2 style="color:#1e40af;margin-bottom:1rem;font-size:1.8rem;">⏸️ Optional Break</h2>
      <p style="color:#374151;margin-bottom:1rem;">
        You've completed this section. You may take a <strong>10-minute break</strong> before continuing to the next section.
      </p>
      <p style="color:#dc2626;margin-bottom:1.5rem;font-weight:600;font-size:0.9rem;">
        ⚠️ This break can only be taken once during the exam.
      </p>
      ${nextSection ? `<p style="color:#6b7280;margin-bottom:1.5rem;font-size:0.9rem;">
        Next section: <strong>${nextSection}</strong>
      </p>` : ''}
      <div style="display:flex;gap:1rem;flex-direction:column;">
        <button id="takeBreakBtn" style="
          background:linear-gradient(135deg,#3b82f6,#60a5fa);
          color:white;
          border:none;
          padding:1rem 2rem;
          border-radius:8px;
          font-size:1.1rem;
          font-weight:600;
          cursor:pointer;
        ">⏸️ Take 10-Minute Break</button>
        <button id="skipBreakBtn" style="
          background:linear-gradient(135deg,#00a666,#00c775);
          color:white;
          border:none;
          padding:1rem 2rem;
          border-radius:8px;
          font-size:1.1rem;
          font-weight:600;
          cursor:pointer;
        ">→ Continue to Next Section</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    dialog.querySelector('#takeBreakBtn').addEventListener('click', () => {
      document.body.removeChild(overlay);
      breakTaken = true;
      startGMATBreak(nextPage);
      resolve();
    });

    dialog.querySelector('#skipBreakBtn').addEventListener('click', () => {
      document.body.removeChild(overlay);
      isReviewMode = false;
      loadQuestionsForPage(nextPage);
      resolve();
    });
  });
}

function startGMATBreak(nextPage) {
  inBreak = true;
  let breakTimeRemaining = 10 * 60; // 10 minutes in seconds

  const overlay = document.createElement('div');
  overlay.id = 'breakOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:999999';

  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:white;padding:3rem;border-radius:12px;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5);text-align:center';

  dialog.innerHTML = `
    <h2 style="color:#1e40af;margin-bottom:1rem;font-size:2rem;">☕ Break Time</h2>
    <div style="font-size:4rem;font-weight:800;color:#3b82f6;margin:2rem 0;" id="breakTimer">10:00</div>
    <p style="color:#6b7280;margin-bottom:2rem;">Take a break and relax. The test will resume automatically.</p>
    <button id="endBreakBtn" style="
      background:linear-gradient(135deg,#00a666,#00c775);
      color:white;
      border:none;
      padding:1rem 2rem;
      border-radius:8px;
      font-size:1.1rem;
      font-weight:600;
      cursor:pointer;
    ">Resume Test Early</button>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const breakTimerElement = dialog.querySelector('#breakTimer');

  breakTimerInterval = setInterval(() => {
    breakTimeRemaining--;

    const mins = Math.floor(breakTimeRemaining / 60);
    const secs = breakTimeRemaining % 60;
    breakTimerElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (breakTimeRemaining <= 0) {
      endBreak(nextPage);
    }
  }, 1000);

  dialog.querySelector('#endBreakBtn').addEventListener('click', () => {
    endBreak(nextPage);
  });
}

function endBreak(nextPage) {
  if (breakTimerInterval) {
    clearInterval(breakTimerInterval);
    breakTimerInterval = null;
  }

  const overlay = document.getElementById('breakOverlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }

  inBreak = false;
  isReviewMode = false;
  loadQuestionsForPage(nextPage);
}

function getPageForQuestion(questionNumber) {
  // For GMAT tests with 1 question per page
  if (isGMATTest) {
    const questionIndex = questions.findIndex(q => q.question_number === questionNumber);
    if (questionIndex >= 0) {
      return questionIndex + 2; // page 2 is first question
    }
  }
  return 2;
}

function findNextSectionStart(currentGMATSection) {
  // Find the first page of the next GMAT section
  for (let page = 2; page <= totalPages; page++) {
    const sectionAtPage = getCurrentGMATSection(page);
    if (sectionAtPage && sectionAtPage !== currentGMATSection) {
      return page;
    }
  }
  return -1; // No next section found
}

function showSectionChangeDialog(onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  
  const dialog = document.createElement("div");
  dialog.className = "modal-dialog";
  
  const title = document.createElement("h3");
  title.textContent = "⚠️ Attenzione: Cambio Sezione";
  title.className = "text-warning";
  
  const content = document.createElement("p");
  content.innerHTML = `
    Stai per passare alla prossima sezione.<br>
    <strong>Non potrai tornare indietro.</strong><br>
    Vuoi continuare?
  `;
  
  const buttons = document.createElement("div");
  buttons.className = "modal-buttons";
  
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Annulla";
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
  
  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Continua →";
  confirmBtn.className = "section-change";
  confirmBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
    onConfirm();
  });
  
  buttons.appendChild(cancelBtn);
  buttons.appendChild(confirmBtn);
  
  dialog.appendChild(title);
  dialog.appendChild(content);
  dialog.appendChild(buttons);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  confirmBtn.focus();
}

function selectAnswerBocconi(questionId, selectedLetter, choiceDiv, parent) {
  const question = questions.find(q => q.id === questionId);
  if (!question) return;
  
  const questionSection = getCurrentSectionForQuestion(question.question_number);
  
  if (hasSections && expiredSections.has(questionSection)) {
    showCustomAlert("⏰ Il tempo per questa sezione è scaduto. Non puoi più modificare le risposte.");
    return;
  }
  
  // Toggle risposta (for regular multiple choice questions)
  if (studentAnswers[questionId] === selectedLetter && choiceDiv && parent) {
    delete studentAnswers[questionId];
    choiceDiv.classList.remove("selected");

    // GMAT: Disable next button when unselecting answer
    if (isGMATTest) {
      const nextBtn = document.getElementById('nextPage');
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled');
        nextBtn.title = 'You must answer the current question before proceeding';
      }
    }

    // GMAT Adaptive: Remove from performance history if unselecting
    if (isGMATAssessmentIniziale) {
      const perfIndex = studentPerformanceHistory.findIndex((entry, idx) => {
        const q = questions[idx];
        return q && q.id === questionId;
      });
      if (perfIndex !== -1) {
        studentPerformanceHistory.splice(perfIndex, 1);
      }
    }
  } else {
    // For regular multiple choice: Reset altre selezioni
    if (parent) {
      Array.from(parent.children).forEach(child => {
        child.classList.remove("selected");
      });
    }

    // Imposta nuova selezione
    studentAnswers[questionId] = selectedLetter;

    // For regular multiple choice: mark as selected
    if (choiceDiv) {
      choiceDiv.classList.add("selected");
    }

    // GMAT Adaptive: Track performance
    if (isGMATAssessmentIniziale) {
      let isCorrect = false;

      // Check if this is a DI question with JSON answer
      if (typeof selectedLetter === 'string' && selectedLetter.startsWith('{')) {
        // DI question - validate JSON answer against correct answer
        const correctAnswer = correctMapping[questionId];

        if (correctAnswer) {
          try {
            const studentAnswerObj = JSON.parse(selectedLetter);
            const correctAnswerObj = JSON.parse(correctAnswer);

            // Deep comparison: ALL parts must match
            isCorrect = JSON.stringify(studentAnswerObj) === JSON.stringify(correctAnswerObj);

            console.log(`🎯 DI Answer: ${isCorrect ? '✅ Correct' : '❌ Incorrect (not all parts match)'}`);
          } catch (e) {
            console.error('Error comparing DI answers:', e);
            isCorrect = false;
          }
        } else {
          // No correct answer in mapping - this is an error
          isCorrect = false;
          console.error(`❌ DI Answer: No correct answer found in database for question ${questionId}`);
        }
      } else {
        // Regular multiple choice question
        const correctAnswer = correctMapping[questionId];
        isCorrect = selectedLetter === correctAnswer;
        console.log(`🎯 Answer tracked: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
      }

      // Update full history (all answers)
      studentPerformanceHistoryFull.push(isCorrect);

      // Update recent history (last 5 for adaptive algorithm)
      studentPerformanceHistory.push(isCorrect);
      if (studentPerformanceHistory.length > 5) {
        studentPerformanceHistory.shift();
      }

      console.log(`📊 Performance history: ${studentPerformanceHistoryFull.filter(x => x).length}/${studentPerformanceHistoryFull.length} correct`);
    }
  }

  buildQuestionNavBocconi();

  // GMAT: Update next button state based on whether question is fully answered
  if (isGMATTest && currentPage > 1) {
    const currentPageQuestions = getQuestionsForPage(currentPage);
    if (currentPageQuestions.length > 0) {
      const currentQuestion = currentPageQuestions[0];
      const isFullyAnswered = isQuestionFullyAnswered(currentQuestion);

      // Update ALL buttons with id="nextPage" (there might be duplicates)
      const nextButtons = document.querySelectorAll('#nextPage');
      nextButtons.forEach(nextBtn => {
        if (isFullyAnswered) {
          nextBtn.disabled = false;
          nextBtn.classList.remove('disabled');
          nextBtn.title = '';
        } else {
          nextBtn.disabled = true;
          nextBtn.classList.add('disabled');
          nextBtn.title = 'You must answer the current question before proceeding';
        }
      });

    }
  }
}

function buildQuestionNavBocconi() {
  // Skip building navigation for GMAT tests (nav is hidden)
  if (isGMATTest) return;

  const questionNav = document.getElementById("questionNav");
  if (!questionNav) return;
  questionNav.innerHTML = "";
  
  if (hasSections && sectionNames.length > 0) {
    const currentSection = getCurrentSectionForPage(currentPage);
    
    // Header sezione
    const sectionHeader = document.createElement("div");
    sectionHeader.className = expiredSections.has(currentSection) ? 
      "section-nav-header expired" : "section-nav-header";
    
    if (expiredSections.has(currentSection)) {
      sectionHeader.innerHTML = `🔒 ${sectionNames[currentSection - 1] || `Sezione ${currentSection}`} (SCADUTA)`;
    } else {
      sectionHeader.textContent = sectionNames[currentSection - 1] || `Sezione ${currentSection}`;
    }
    
    questionNav.appendChild(sectionHeader);
    
    // Mostra solo domande della sezione corrente
    questions.forEach((q, index) => {
      const qSection = getCurrentSectionForQuestion(q.question_number);
      if (qSection === currentSection) {
        createQuestionButton(q, index);
      }
    });
  } else {
    questions.forEach((q, globalIndex) => createQuestionButton(q, globalIndex));
  }
  
  function createQuestionButton(q, index) {
    const btn = document.createElement("button");
    btn.className = "question-cell";
    btn.textContent = q.question_number;
    
    if (studentAnswers[q.id]) {
      btn.classList.add("answered");
    }
    
    // Evidenzia domande pagina corrente
    if (currentPage > 1) {
      const questionsOnCurrentPage = getQuestionsForPage(currentPage);
      const isOnCurrentPage = questionsOnCurrentPage.some(pageQ => 
        pageQ.question_number === q.question_number
      );
      
      if (isOnCurrentPage) {
        btn.classList.add("current-question");
      }
    }
    
    // Gestione disabilitazione
    const targetPage = Math.floor(index / 3) + 2;
    let shouldDisable = false;
    
    if (isBocconiTest) {
      shouldDisable = targetPage < currentPage;
    } else if (hasSections) {
      const targetSection = getCurrentSectionForQuestion(q.question_number);
      const currentSection = getCurrentSectionForPage(currentPage);
      shouldDisable = targetSection < currentSection;
    }
    
    // Sezione scaduta
    const questionSection = getCurrentSectionForQuestion(q.question_number);
    if (hasSections && expiredSections.has(questionSection)) {
      btn.classList.add("expired");
      btn.title = "Sezione scaduta - risposte bloccate";
    }
    
    if (shouldDisable) {
      btn.disabled = true;
    }
    
    // Click handler
    btn.addEventListener("click", () => {
      if (shouldDisable) return;
      
      let targetPage;
      
      if (hasSections) {
        const qSection = getCurrentSectionForQuestion(q.question_number);
        const firstPageOfSection = sectionToFirstPageMap[qSection] || 2;
        
        let questionsBeforeInSection = 0;
        for (let i = 0; i < index; i++) {
          if (getCurrentSectionForQuestion(questions[i].question_number) === qSection) {
            questionsBeforeInSection++;
          }
        }
        
        const pageWithinSection = Math.floor(questionsBeforeInSection / 3);
        targetPage = firstPageOfSection + pageWithinSection;
      } else {
        targetPage = Math.floor(index / 3) + 2;
      }
      
      if (hasSections && !isBocconiTest && targetPage > currentPage && 
          isPageInDifferentSection(currentPage, targetPage)) {
        showSectionChangeDialog(() => {
          loadQuestionsForPage(targetPage);
        });
      } else {
        loadQuestionsForPage(targetPage);
      }
    });
    
    questionNav.appendChild(btn);
  }
}

async function enforceFullScreen() {
  if (window.innerWidth > 1024) {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        console.log("🔲 Modalità schermo intero attivata");
      } catch (err) {
        console.error("❌ Modalità schermo intero non supportata:", err);
      }
    }
  }
}

async function startTimerBocconi() {
  const timerElement = document.getElementById("timer");
  const timeLeftElement = document.getElementById("time-left");
  
  if (!timerElement || !timeLeftElement) {
    console.error("❌ Timer elements not found in HTML");
    return;
  }
  
  timerElement.style.visibility = "visible";
  
  // Aggiungi label sezione se necessario
  if (hasSections && sectionNames.length > 0) {
    const sectionLabel = document.createElement("span");
    sectionLabel.id = "sectionLabel";
    timerElement.appendChild(sectionLabel);
  }
  
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session) {
    showCustomAlert("Sessione scaduta.", () => {
      window.location.href = "/";
    });
    return;
  }
  
  const studentId = sessionData.session.user.id;
  const currentSection = sessionStorage.getItem("currentSection");
  const currentTipologiaEsercizi = sessionStorage.getItem("currentTipologiaEsercizi");
  const currentTestProgressivo = sessionStorage.getItem("currentTestProgressivo");
  const selectedTestType = sessionStorage.getItem("selectedTestType");
  
  const { data: testData, error } = await supabase
    .from("student_tests")
    .select("duration")
    .eq("auth_uid", studentId)
    .eq("section", currentSection)
    .eq("tipologia_esercizi", currentTipologiaEsercizi)
    .eq("progressivo", currentTestProgressivo)
    .eq("tipologia_test", selectedTestType)
    .single();
  
  if (error || !testData) {
    showCustomAlert("Test non trovato.");
    return;
  }
  
  let totalDurationSeconds = testData.duration || 1800;

  // GMAT-specific timers
  if (isGMATTest) {
    if (isGMATAssessmentIniziale) {
      // Assessment Iniziale: 32 minutes per section
      const sectionsCount = 3; // Quant, Verbal, DI
      totalDurationSeconds = 32 * 60 * sectionsCount; // 32 min × 3 sections = 96 min
      console.log('⏱️ GMAT Assessment Iniziale: 32 min per section (96 min total)');
    } else if (isGMATSimulazioni) {
      // Simulazioni: 45 minutes per section
      const sectionsCount = 3;
      totalDurationSeconds = 45 * 60 * sectionsCount; // 45 min × 3 sections = 135 min
      console.log('⏱️ GMAT Simulazioni: 45 min per section (135 min total)');
    }
  }

  if (hasSections || isGMATTest) {
    setupSectionTimers(totalDurationSeconds);
  } else {
    setupNormalTimer(totalDurationSeconds);
  }
}

function setupNormalTimer(durationSeconds) {
  const endTime = Date.now() + durationSeconds * 1000;
  
  globalTimerInterval = setInterval(() => {
    const now = Date.now();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) {
      clearInterval(globalTimerInterval);
      showCustomAlert("⏳ Tempo scaduto! Invio automatico delle risposte.", () => {
        performSubmit();
      });
      return;
    }
    
    updateTimerDisplay(timeLeft);
  }, 1000);
}

function setupSectionTimers(totalDurationSeconds) {
  totalTestTime = totalDurationSeconds;

  sectionDurations = {};

  // GMAT-specific: Equal time per section
  if (isGMATTest) {
    const sectionsCount = 3; // Always 3 sections for GMAT
    const timePerSection = Math.round(totalDurationSeconds / sectionsCount);

    // For adaptive tests, use allQuestionsPool; for non-adaptive, use questions array
    let uniqueSections;
    if (isGMATAssessmentIniziale && Object.keys(allQuestionsPool).length > 0) {
      uniqueSections = Object.keys(allQuestionsPool);
    } else {
      uniqueSections = [...new Set(questions.map(q => q.GMAT_section).filter(Boolean))];
    }

    uniqueSections.forEach((sectionName, index) => {
      sectionDurations[index + 1] = timePerSection;
      console.log(`⏱️ ${sectionName}: ${timePerSection} seconds (${Math.round(timePerSection/60)} min)`);
    });

    // Continue with timer setup (don't return early)
  }

  // Non-GMAT tests: Se abbiamo percentuali personalizzate, usale
  if (!isGMATTest && timeAllocationPercentages && timeAllocationPercentages.length > 0) {
    console.log("📊 Usando allocazione tempo personalizzata:", timeAllocationPercentages);

    // Verifica che la somma sia circa 100
    const sum = timeAllocationPercentages.reduce((acc, val) => acc + val, 0);
    if (Math.abs(sum - 100) > 1) {
      console.warn(`⚠️ La somma delle percentuali è ${sum}%, non 100%!`);
    }

    // Assegna il tempo in base alle percentuali
    timeAllocationPercentages.forEach((percentage, index) => {
      const sectionNum = index + 1;
      sectionDurations[sectionNum] = Math.round(totalDurationSeconds * percentage / 100);
      console.log(`Sezione ${sectionNum}: ${percentage}% = ${sectionDurations[sectionNum]} secondi`);
    });
  } else if (!isGMATTest) {
    // Fallback: calcolo proporzionale basato sul numero di domande
    console.log("📊 Nessuna allocazione personalizzata, uso calcolo proporzionale");

    const questionsBySection = {};
    let totalQuestionsInSections = 0;

    questions.forEach(q => {
      const section = getCurrentSectionForQuestion(q.question_number);
      if (!questionsBySection[section]) {
        questionsBySection[section] = 0;
      }
      questionsBySection[section]++;
      totalQuestionsInSections++;
    });

    const timePerQuestion = totalDurationSeconds / totalQuestionsInSections;

    Object.keys(questionsBySection).sort((a, b) => parseInt(a) - parseInt(b)).forEach(section => {
      const sectionTime = Math.round(timePerQuestion * questionsBySection[section]);
      sectionDurations[section] = sectionTime;
    });
  }
  
  currentSectionNumber = 1;
  sectionStartTime = Date.now();
  
  const testStartTime = Date.now();
  const testEndTime = testStartTime + totalDurationSeconds * 1000;
  
  globalTimerInterval = setInterval(() => {
    if (Date.now() >= testEndTime) {
      clearInterval(globalTimerInterval);

      // If in review mode, exit it and proceed to next section
      if (isReviewMode && isGMATTest) {
        isReviewMode = false;
        showCustomAlert("⏳ Time expired during review. Proceeding to next section.", async () => {
          const currentGMATSection = getCurrentGMATSection(currentPage);
          const nextSectionStart = findNextSectionStart(currentGMATSection);
          if (nextSectionStart > 0) {
            await showGMATBreakOption(nextSectionStart);
          } else {
            performSubmit();
          }
        });
      } else {
        showCustomAlert("⏳ Tempo totale del test scaduto! Invio automatico delle risposte.", () => {
          performSubmit();
        });
      }
      return;
    }

    updateSectionTimer();
  }, 1000);
}

function updateSectionTimer() {
  const timeLeftElement = document.getElementById("time-left");
  const timerElement = document.getElementById("timer");
  if (!timeLeftElement || !timerElement) return;
  
  const pageSection = currentPage > 1 ? getCurrentSectionForPage(currentPage) : 1;
  
  if (pageSection !== currentSectionNumber) {
    currentSectionNumber = pageSection;
    sectionStartTime = Date.now();
  }
  
  const sectionDuration = sectionDurations[currentSectionNumber] || 0;
  const elapsedTime = (Date.now() - sectionStartTime) / 1000;
  const timeRemaining = Math.max(0, sectionDuration - elapsedTime);
  
  if (timeRemaining > 0) {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Aggiorna display con sezione e tempo
    let displayHTML = '';
    if (sectionNames && sectionNames.length >= currentSectionNumber) {
      displayHTML = `<div style="font-weight: bold; margin-bottom: 5px;">📚 Sezione ${currentSectionNumber}: ${sectionNames[currentSectionNumber - 1]}</div>`;
      displayHTML += `<div>⏳ Tempo: <span id="time-left">${timeString}</span></div>`;
    } else {
      displayHTML = `⏳ Tempo: <span id="time-left">${timeString}</span>`;
    }
    timerElement.innerHTML = displayHTML;
    
    // Cambia colore se manca poco
    if (timeRemaining < 60) {
      timerElement.style.backgroundColor = "#ff6b6b";
      timerElement.style.color = "white";
    } else if (timeRemaining < 300) {
      timerElement.style.backgroundColor = "#ffd93d";
      timerElement.style.color = "#333";
    } else {
      timerElement.style.backgroundColor = "";
      timerElement.style.color = "";
    }
  } else {
    // Display quando tempo scaduto
    let displayHTML = '';
    if (sectionNames && sectionNames.length >= currentSectionNumber) {
      displayHTML = `<div style="font-weight: bold; margin-bottom: 5px;">📚 Sezione ${currentSectionNumber}: ${sectionNames[currentSectionNumber - 1]}</div>`;
      displayHTML += `<div class="text-danger">⏳ Tempo: <span id="time-left">Scaduto!</span></div>`;
    } else {
      displayHTML = `⏳ Tempo: <span id="time-left" class="text-danger">Scaduto!</span>`;
    }
    timerElement.innerHTML = displayHTML;
    timerElement.style.backgroundColor = "#ff6b6b";
    timerElement.style.color = "white";
    
    if (!expiredSections.has(currentSectionNumber)) {
      expiredSections.add(currentSectionNumber);
      console.log(`⏰ Tempo scaduto per la sezione ${currentSectionNumber}`);
      
      // 🔧 NUOVO: Gestione automatica
      handleSectionExpired();
    }
  }
}
function handleSectionExpired() {
  const hasNextSection = currentSectionNumber < Object.keys(sectionDurations).length;
  
  if (hasNextSection) {
    // Passa automaticamente alla prossima sezione
    showCustomAlert(`⏰ Tempo scaduto per ${sectionNames[currentSectionNumber - 1] || 'questa sezione'}! Passaggio alla sezione successiva...`, () => {
      const nextSection = currentSectionNumber + 1;
      const firstPageOfNextSection = sectionToFirstPageMap[nextSection];
      if (firstPageOfNextSection) {
        loadQuestionsForPage(firstPageOfNextSection);
      }
    });
  } else {
    // 🔧 Ultima sezione - invio completamente automatico
    console.log("⏰ Tempo scaduto per l'ultima sezione - invio automatico!");
    
    // Mostra messaggio di invio senza interazione
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.style.background = "rgba(0, 0, 0, 0.8)";
    
    const message = document.createElement("div");
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem 3rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    
    message.innerHTML = `
      <h2 style="color: #f44336; margin-bottom: 1rem;">⏰ Tempo Scaduto!</h2>
      <p style="font-size: 1.1rem; color: #333; margin-bottom: 1rem;">
        Invio automatico delle risposte in corso...
      </p>
      <div style="
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #f44336;
        border-radius: 50%;
        margin: 0 auto;
        animation: spin 1s linear infinite;
      "></div>
    `;
    
    // Aggiungi animazione spin
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    overlay.appendChild(message);
    document.body.appendChild(overlay);
    
    // 🔧 Invio automatico dopo 2 secondi passando true per isAutoSubmit
    setTimeout(async () => {
      document.body.removeChild(overlay);
      await performSubmit(true); // true = auto submit, nessun dialog di conferma
    }, 2000);
  }
}

function updateTimerDisplay(timeLeft) {
  const timeLeftElement = document.getElementById("time-left");
  if (!timeLeftElement) return;
  
  if (hasSections) return;
  
  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  
  let display = "";
  if (hours > 0) {
    display = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  timeLeftElement.textContent = display;
  
  timeLeftElement.classList.remove("text-danger", "text-warning");
  if (timeLeft < 60000) {
    timeLeftElement.classList.add("text-danger");
  } else if (timeLeft < 300000) {
    timeLeftElement.classList.add("text-warning");
  }
}

async function submitAnswersBocconi() {
  if (isSubmitting) return;
  
  const unanswered = questions.filter(q => !studentAnswers[q.id]);
  if (unanswered.length > 0) {
    showSubmitConfirmDialog(unanswered.length, async () => {
      await performSubmit();
    });
  } else {
    await performSubmit();
  }
}

function showSubmitConfirmDialog(unansweredCount, onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  
  const dialog = document.createElement("div");
  dialog.className = "modal-dialog";
  
  const title = document.createElement("h3");
  title.textContent = "⚠️ Attenzione";
  title.className = "text-warning";
  
  const content = document.createElement("p");
  content.innerHTML = `
    Hai <strong>${unansweredCount} domande</strong> senza risposta.<br>
    Vuoi inviare comunque il test?
  `;
  
  const buttons = document.createElement("div");
  buttons.className = "modal-buttons";
  
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Torna al test";
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
  
  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Invia comunque";
  confirmBtn.id = "submitAnswers";
  confirmBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
    onConfirm();
  });
  
  buttons.appendChild(cancelBtn);
  buttons.appendChild(confirmBtn);
  
  dialog.appendChild(title);
  dialog.appendChild(content);
  dialog.appendChild(buttons);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  cancelBtn.focus();
}

async function performSubmit(isAutoSubmit = false) {
  isSubmitting = true;
  
  document.querySelectorAll("button").forEach(btn => btn.disabled = true);
  
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData || !sessionData.session) {
    if (isAutoSubmit) {
      // Se è auto-submit, reindirizza direttamente
      window.location.href = "/";
      return;
    }
    showCustomAlert("Sessione scaduta. Effettua nuovamente il login.", () => {
      window.location.href = "/";
    });
    return;
  }
  
  const studentId = sessionData.session.user.id;
  console.log("📤 Invio risposte - Student ID:", studentId);

  const submissions = questions.map(q => {
    const answer = studentAnswers[q.id] || "Z";
    let auto_score = 0;

    // Check if answer is correct
    const correctAnswer = correctMapping[q.id];
    if (correctAnswer) {
      // Check if this is a DI question with JSON answer
      if (typeof answer === 'string' && answer.startsWith('{')) {
        try {
          const studentAnswerObj = JSON.parse(answer);
          const correctAnswerObj = JSON.parse(correctAnswer);

          // Deep comparison for DI questions
          auto_score = (JSON.stringify(studentAnswerObj) === JSON.stringify(correctAnswerObj)) ? 1 : 0;
        } catch (e) {
          console.error('Error comparing DI answer during grading:', e);
          auto_score = 0;
        }
      } else {
        // Simple comparison for regular multiple choice
        auto_score = (answer === correctAnswer) ? 1 : 0;
      }
    }

    return {
      auth_uid: studentId,
      question_id: q.id,
      answer: answer,
      auto_score: auto_score,
      test_id: testId
    };
  });

  const { data, error } = await supabase
    .from("studentbocconi_answers")
    .insert(submissions);
    
  if (error) {
    console.error("❌ Errore nell'invio risposte:", error);
    if (isAutoSubmit) {
      // Se è auto-submit, vai comunque alla selezione test
      window.location.href = "test_selection.html";
      return;
    }
    showCustomAlert("Invio fallito. Riprova.");
    isSubmitting = false;
    document.querySelectorAll("button").forEach(btn => btn.disabled = false);
    return;
  }

  if (globalTimerInterval) clearInterval(globalTimerInterval);

  await supabase
    .from("student_tests")
    .update({ status: "completed" })
    .eq("auth_uid", studentId)
    .eq("section", sessionStorage.getItem("currentSection"))
    .eq("tipologia_esercizi", sessionStorage.getItem("currentTipologiaEsercizi"))
    .eq("progressivo", sessionStorage.getItem("currentTestProgressivo"))
    .eq("tipologia_test", sessionStorage.getItem("selectedTestType"))
    .eq("id", testId);

  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
  
  // 🔧 MODIFICATO: Se è auto-submit, vai direttamente senza alert
  if (isAutoSubmit) {
    window.location.href = "test_selection.html";
  } else {
    showCustomAlert("✅ Test completato con successo!", () => {
      window.location.href = "test_selection.html";
    });
  }
}

// Expose globally
window.selectAnswerBocconi = selectAnswerBocconi;
window.submitAnswersBocconi = submitAnswersBocconi;