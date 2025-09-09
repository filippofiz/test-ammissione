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
let pageToSectionMap = {};
let sectionToFirstPageMap = {};
let sectionDurations = {};
let sectionStartTime = null;
let currentSectionNumber = 1;
let expiredSections = new Set();
let totalTestTime = 0;
let timeAllocationPercentages = null; // Nuova variabile per percentuali personalizzate

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
  
  document.addEventListener("fullscreenchange", () => {
    if (isSubmitting) return;
    if (timerStarted && !document.fullscreenElement) {
      showCustomAlert("⚠ Il test è stato annullato perché sei uscito dallo schermo intero.", () => {
        window.location.href = "test_selection.html";
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
  console.log(`🎯 Tipo test: ${isBocconiTest ? 'Bocconi' : 'Altri'}`);
  
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
  
  questions = data;
  
  if (hasSections) {
    calculatePageSectionMapping();
    totalPages = Math.max(...Object.keys(pageToSectionMap).map(p => parseInt(p))) || 1;
    totalPages++;
  } else {
    totalPages = Math.ceil(questions.length / 3) + 1;
  }
  
  buildQuestionNavBocconi();
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
      .single();
    
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
    
    const startIndex = pagesInSectionBefore * 3;
    pageQuestions = sectionQuestions.slice(startIndex, startIndex + 3);
  } else {
    const startIndex = (page - 2) * 3;
    pageQuestions = questions.slice(startIndex, startIndex + 3);
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
    instructions.push("Il test prevede <strong>3 domande per pagina</strong>");
    
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
      timerStarted = true;
      sessionStorage.setItem('timerStarted', 'true');
      expiredSections.clear();
      await enforceFullScreen();
      await startTimerBocconi();
      loadQuestionsForPage(2);
    });
    
    welcomeDiv.appendChild(startBtn);
    questionContainer.appendChild(welcomeDiv);
    return;
  }

  // Pagine del test
  // Header sezione se applicabile
  if (hasSections && sectionNames.length > 0) {
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

  // Trigger MathJax
  if (window.MathJax) {
    MathJax.typesetPromise()
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
  questionNumber.textContent = `Domanda ${q.question_number}`;
  qDiv.appendChild(questionNumber);

  // Testo domanda
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

function createNavigationContainer() {
  const navContainer = document.createElement("div");
  navContainer.className = "nav-buttons";
  
  // Bottone Previous
  const prevBtn = document.createElement("button");
  prevBtn.id = "prevPage";
  prevBtn.textContent = "← Indietro";
  
  if (isBocconiTest) {
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
  
  nextBtn.addEventListener("click", () => {
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
  
  if (hasSections && !isBocconiTest && isPageInDifferentSection(currentPage, targetPage)) {
    showSectionChangeDialog(() => {
      loadQuestionsForPage(targetPage);
    });
  } else {
    loadQuestionsForPage(targetPage);
  }
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
  
  // Toggle risposta
  if (studentAnswers[questionId] === selectedLetter) {
    delete studentAnswers[questionId];
    choiceDiv.classList.remove("selected");
  } else {
    // Reset altre selezioni
    Array.from(parent.children).forEach(child => {
      child.classList.remove("selected");
    });
    
    // Imposta nuova selezione
    studentAnswers[questionId] = selectedLetter;
    choiceDiv.classList.add("selected");
  }
  
  buildQuestionNavBocconi();
}

function buildQuestionNavBocconi() {
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
  
  const totalDurationSeconds = testData.duration || 1800;
  
  if (hasSections) {
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
  
  // Se abbiamo percentuali personalizzate, usale
  if (timeAllocationPercentages && timeAllocationPercentages.length > 0) {
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
  } else {
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
      showCustomAlert("⏳ Tempo totale del test scaduto! Invio automatico delle risposte.", () => {
        performSubmit();
      });
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
    const auto_score = (answer === correctMapping[q.id]) ? 1 : 0;
    
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