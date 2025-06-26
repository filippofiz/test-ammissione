// test_bancaDati.js - Sistema completo per test Banca Dati con gestione sezioni tramite boundaries

// Variabili globali - IMPORTANTE: dichiarare testId qui per evitare errori di inizializzazione
const supabase = window.supabase;
let questions = [];
let currentPage = 1;
let totalPages = 1;
let studentAnswers = {};
let correctMapping = {};
let timerStarted = false;
let isSubmitting = false;
let testId = null; // Dichiarazione iniziale

// Variabili per gestione sezioni
let sectionBoundaries = {}; // Mappa sectionNumber -> questionNumber dove inizia
let sectionNames = []; // Array di nomi delle sezioni
let sectionEndTimes = {};
let globalTimerInterval = null;
let hasSections = false;
let isBocconiTest = false;

// Alert personalizzato che non esce dallo schermo intero
function showCustomAlert(message, onOk) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  const dialog = document.createElement("div");
  dialog.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    text-align: center;
  `;
  
  dialog.innerHTML = `
    <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;">
      ${message}
    </p>
    <button id="alertOkButton" style="
      padding: 12px 40px;
      font-size: 16px;
      background: #00a666;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    ">OK</button>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  const okButton = document.getElementById("alertOkButton");
  okButton.addEventListener("click", () => {
    document.body.removeChild(overlay);
    if (onOk) onOk();
  });
  
  okButton.focus();
}

// Aspetta che il DOM sia completamente caricato
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTest);
} else {
  // DOM già caricato
  initializeTest();
}

async function initializeTest() {
  console.log("🚀 Inizializzazione test...");
  
  // Recupera testId dal sessionStorage DOPO che il DOM è caricato
  testId = sessionStorage.getItem("selectedTestId");
  console.log("🎯 Test ID recuperato:", testId);
  
  // Verifica che testId sia valido
  if (!testId) {
    console.error("❌ Test ID non trovato nel sessionStorage");
    showCustomAlert("Errore: Test ID non trovato. Verrai reindirizzato alla selezione test.", () => {
      window.location.href = "test_selection.html";
    });
    return;
  }
  
  // Verifica che tutti gli elementi necessari esistano
  const requiredElements = ['question-container', 'timer', 'time-left', 'questionNav', 'submitAnswers', 'nextPage'];
  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  
  if (missingElements.length > 0) {
    console.error("❌ Elementi mancanti nell'HTML:", missingElements);
    showCustomAlert("Errore: alcuni elementi HTML necessari non sono stati trovati. Controlla la console.");
    return;
  }
  
  // Inizializza event listeners
  await initializeEventListeners();
  
  // Carica il test
  await loadTest();
}

async function initializeEventListeners() {
  console.log("📌 Inizializzazione event listeners...");
  console.log("🎯 Test ID in initializeEventListeners:", testId);
  
  const submitBtn = document.getElementById("submitAnswers");
  if (!submitBtn) {
    console.error("❌ ERROR: 'submitAnswers' button not found.");
    return;
  }
  submitBtn.addEventListener("click", async () => {
    console.log("📌 Submit button clicked!");
    await submitAnswersBocconi();
  });
  
  // Navigation buttons
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) navigateToPrevPage();
    });
  } else {
    console.warn("⚠️ prevPage button not found in HTML");
  }
  
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) navigateToNextPage();
    });
  } else {
    console.warn("⚠️ nextPage button not found in HTML");
  }
  
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

async function loadTest() {
  console.log("🔄 LoadTest iniziato...");
  console.log("🎯 Test ID in loadTest:", testId);
  
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
  
  // Determina il tipo di test
  isBocconiTest = selectedTestType.toLowerCase().includes("bocconi");
  console.log(`🎯 selectedTestType: "${selectedTestType}"`);
  console.log(`🎯 Tipo test: ${isBocconiTest ? 'Bocconi' : 'Altri'}`);
  console.log(`🎯 currentSection: "${currentSection}"`);
  
  // Carica boundaries e nomi sezioni se è una simulazione o assessment iniziale
  if (currentSection === "Simulazioni" || currentSection === "Assessment Iniziale") {
    console.log("📊 Caricamento sezioni per simulazione/assessment...");
    await loadSectionBoundaries(selectedTestType);
  } else {
    console.log("📊 Non è una simulazione/assessment, nessuna sezione da caricare");
  }
  
  // Fetch questions from questions_bancaDati
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
  totalPages = Math.ceil(questions.length / 3) + 1;
  
  buildQuestionNavBocconi();
  loadQuestionsForPage(1);
}

async function loadSectionBoundaries(testType) {
  try {
    console.log(`📊 Cercando boundaries per testType: "${testType}"`);
    
    // Carica boundaries e nomi sezioni SOLO da simulazioni_parti
    const { data, error } = await supabase
      .from("simulazioni_parti")
      .select("boundaries, nome_parti")
      .eq("tipologia_test", testType)
      .single();
    
    console.log("📊 Risultato query simulazioni_parti:", { data, error });
    
    if (error || !data || !data.boundaries || data.boundaries.length === 0) {
      console.log("📊 Nessuna divisione in sezioni per questo test");
      hasSections = false;
      sectionBoundaries = {};
      sectionNames = [];
      return;
    }
    
    // Imposta le sezioni
    hasSections = true;
    const boundariesArray = data.boundaries.map(b => parseInt(b)); // Converti in numeri
    sectionNames = data.nome_parti || [];
    
    console.log("📊 Boundaries trovati:", boundariesArray);
    console.log("📊 Nomi sezioni:", sectionNames);
    console.log("📊 hasSections:", hasSections);
    
    // Costruisci la mappa sectionBoundaries
    // boundaries[0] = inizio sezione 1, boundaries[1] = inizio sezione 2, etc.
    sectionBoundaries = {};
    boundariesArray.forEach((boundary, index) => {
      sectionBoundaries[index + 1] = boundary;
    });
    
    console.log("📊 Mappa sezioni:", sectionBoundaries);
  } catch (error) {
    console.error("❌ Errore caricamento boundaries:", error);
    hasSections = false;
    sectionBoundaries = {};
    sectionNames = [];
  }
}

function getCurrentSectionForQuestion(questionNumber) {
  if (!hasSections) return 1;
  
  let currentSection = 1;
  
  // Trova la sezione corrente basata sul numero domanda
  Object.entries(sectionBoundaries).forEach(([section, boundary]) => {
    if (questionNumber >= boundary) {
      currentSection = parseInt(section);
    }
  });
  
  return currentSection;
}

function getCurrentSectionForPage(page) {
  if (!hasSections || page < 2) return 1;
  
  const startIndex = (page - 2) * 3;
  const firstQuestionOnPage = questions[startIndex];
  
  if (!firstQuestionOnPage) return 1;
  
  return getCurrentSectionForQuestion(firstQuestionOnPage.question_number);
}

function isPageInDifferentSection(fromPage, toPage) {
  if (!hasSections) return false;
  
  const fromSection = getCurrentSectionForPage(fromPage);
  const toSection = getCurrentSectionForPage(toPage);
  
  return fromSection !== toSection;
}

function navigateToPrevPage() {
  // Bocconi: MAI indietro
  if (isBocconiTest) {
    return;
  }
  
  // Altri test con sezioni: solo dentro la sezione corrente
  if (hasSections) {
    const targetPage = currentPage - 1;
    if (targetPage < 2) return; // Non tornare alla pagina di benvenuto
    
    if (isPageInDifferentSection(currentPage, targetPage)) {
      showCustomAlert("Non puoi tornare alla sezione precedente!");
      return;
    }
  }
  
  loadQuestionsForPage(currentPage - 1);
}

function navigateToNextPage() {
  const targetPage = currentPage + 1;
  
  // Se cambia sezione e non è Bocconi, mostra dialog custom
  if (hasSections && !isBocconiTest && isPageInDifferentSection(currentPage, targetPage)) {
    showSectionChangeDialog(() => {
      loadQuestionsForPage(targetPage);
    });
  } else {
    loadQuestionsForPage(targetPage);
  }
}

// Dialog personalizzato per cambio sezione
function showSectionChangeDialog(onConfirm) {
  // Crea overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  // Crea dialog
  const dialog = document.createElement("div");
  dialog.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-width: 450px;
    text-align: center;
  `;
  
  dialog.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #ff9800;">⚠️ Attenzione: Cambio Sezione</h3>
    <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;">
      Stai per passare alla prossima sezione.<br>
      <strong>Non potrai tornare indietro.</strong><br>
      Vuoi continuare?
    </p>
    <div style="display: flex; gap: 15px; justify-content: center;">
      <button id="cancelSectionChange" style="
        padding: 12px 30px;
        font-size: 16px;
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
      ">Annulla</button>
      <button id="confirmSectionChange" style="
        padding: 12px 30px;
        font-size: 16px;
        background: #ff9800;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      ">Continua →</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Event handlers
  document.getElementById("cancelSectionChange").addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
  
  document.getElementById("confirmSectionChange").addEventListener("click", () => {
    document.body.removeChild(overlay);
    onConfirm();
  });
  
  // Focus sul bottone conferma
  document.getElementById("confirmSectionChange").focus();
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

function loadQuestionsForPage(page) {
  currentPage = page;
  sessionStorage.setItem("currentPage", currentPage);
  const questionContainer = document.getElementById("question-container");
  let prevPageBtn = document.getElementById("prevPage");
  let nextPageBtn = document.getElementById("nextPage");
  let submitBtn = document.getElementById("submitAnswers");
  
  // Crea i bottoni se non esistono
  if (!prevPageBtn) {
    prevPageBtn = document.createElement("button");
    prevPageBtn.id = "prevPage";
    prevPageBtn.textContent = "Indietro";
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) navigateToPrevPage();
    });
  }
  
  if (!nextPageBtn) {
    nextPageBtn = document.createElement("button");
    nextPageBtn.id = "nextPage";
    nextPageBtn.textContent = "Avanti";
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) navigateToNextPage();
    });
  }
  
  if (!submitBtn) {
    submitBtn = document.createElement("button");
    submitBtn.id = "submitAnswers";
    submitBtn.textContent = "Invia Test";
    submitBtn.addEventListener("click", async () => {
      await submitAnswersBocconi();
    });
  }
  
  if (!questionContainer) {
    console.error("ERROR: question-container not found!");
    return;
  }
  
  questionContainer.innerHTML = "";

  // Welcome page (Page 1)
  if (page === 1) {
    if (prevPageBtn) prevPageBtn.style.display = "none";
    if (nextPageBtn) nextPageBtn.style.display = "none";
    if (submitBtn) submitBtn.style.display = "none";
    
    const isSimulazione = sessionStorage.getItem("currentSection") === "Simulazioni";
    const isAssessment = sessionStorage.getItem("currentSection") === "Assessment Iniziale";
    let testTypeName = "Banca Dati";
    if (isSimulazione) testTypeName = "di Simulazione";
    else if (isAssessment) testTypeName = "Assessment Iniziale";
    
    questionContainer.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1c2545; margin-bottom: 20px;">Benvenuto al Test ${testTypeName}</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #00a666; margin-bottom: 15px;">📋 Istruzioni:</h3>
          <ul style="line-height: 1.8;">
            <li>Il test prevede <strong>3 domande per pagina</strong></li>
            ${isBocconiTest ? 
              '<li>Non potrai tornare indietro: la navigazione è <strong>solo in avanti</strong></li>' :
              hasSections ? 
                '<li>Puoi navigare <strong>solo all\'interno della sezione corrente</strong></li>' :
                '<li>Puoi navigare liberamente tra le domande</li>'
            }
            <li>Il test va svolto a <strong>schermo intero</strong></li>
            <li>Ogni tentativo di uscita <strong>annulla il test</strong></li>
            ${hasSections ? `
              <li>Le domande sono organizzate in <strong>${sectionNames.length || Object.keys(sectionBoundaries).length} sezioni</strong></li>
            ` : ''}
          </ul>
        </div>
        ${hasSections && sectionNames.length > 0 ? `
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #1976d2; margin-bottom: 10px;">📊 Sezioni del test:</h4>
            <ol style="margin: 0; padding-left: 20px;">
              ${sectionNames.map(s => `<li>${s}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        <button id="startTestBtn" style="
          background: #00a666;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 18px;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
          font-weight: 600;
        ">🚀 Inizia Test</button>
      </div>
    `;
    
    document.getElementById("startTestBtn").addEventListener("click", async () => {
      timerStarted = true;
      await enforceFullScreen();
      await startTimerBocconi();
      loadQuestionsForPage(2);
    });
    return;
  }

  // For test pages
  if (prevPageBtn) {
    prevPageBtn.style.display = "inline-block";
    // Aggiungi stili per assicurare visibilità
    prevPageBtn.style.padding = "10px 20px";
    prevPageBtn.style.fontSize = "16px";
    prevPageBtn.style.backgroundColor = "#f0f0f0";
    prevPageBtn.style.border = "1px solid #ddd";
    prevPageBtn.style.borderRadius = "5px";
    prevPageBtn.style.cursor = "pointer";
    prevPageBtn.style.marginRight = "10px";
    
    // Gestione pulsante Previous
    if (isBocconiTest) {
      prevPageBtn.disabled = true;
      prevPageBtn.style.opacity = "0.5";
      prevPageBtn.style.cursor = "not-allowed";
    } else if (hasSections) {
      // Per TUTTI i test non-Bocconi con sezioni: controlla se la pagina precedente è nella stessa sezione
      const canGoPrev = currentPage > 2 && !isPageInDifferentSection(currentPage, currentPage - 1);
      prevPageBtn.disabled = !canGoPrev;
      prevPageBtn.style.opacity = canGoPrev ? "1" : "0.5";
      prevPageBtn.style.cursor = canGoPrev ? "pointer" : "not-allowed";
    } else {
      prevPageBtn.disabled = currentPage <= 2;
      prevPageBtn.style.opacity = currentPage <= 2 ? "0.5" : "1";
      prevPageBtn.style.cursor = currentPage <= 2 ? "not-allowed" : "pointer";
    }
  }
  
  if (nextPageBtn) {
    nextPageBtn.style.display = currentPage < totalPages ? "inline-block" : "none";
    // Aggiungi stili per assicurare visibilità
    nextPageBtn.style.padding = "10px 20px";
    nextPageBtn.style.fontSize = "16px";
    nextPageBtn.style.backgroundColor = "#00a666";
    nextPageBtn.style.color = "white";
    nextPageBtn.style.border = "none";
    nextPageBtn.style.borderRadius = "5px";
    nextPageBtn.style.cursor = "pointer";
    nextPageBtn.style.marginRight = "10px";
    
    // Gestione pulsante Next
    if (hasSections && !isBocconiTest && currentPage < totalPages && isPageInDifferentSection(currentPage, currentPage + 1)) {
      nextPageBtn.textContent = "Prossima Sezione →";
      nextPageBtn.style.backgroundColor = "#ff9800";
    } else {
      nextPageBtn.textContent = "Avanti";
      nextPageBtn.style.backgroundColor = "#00a666";
    }
  }
  
  if (submitBtn) {
    submitBtn.style.display = "inline-block";
    // Aggiungi stili per assicurare visibilità
    submitBtn.style.padding = "10px 20px";
    submitBtn.style.fontSize = "16px";
    submitBtn.style.backgroundColor = "#f44336";
    submitBtn.style.color = "white";
    submitBtn.style.border = "none";
    submitBtn.style.borderRadius = "5px";
    submitBtn.style.cursor = "pointer";
  }

  const startIndex = (page - 2) * 3;
  const pageQuestions = questions.slice(startIndex, startIndex + 3);

  // Mostra header sezione se applicabile
  if (hasSections && sectionNames.length > 0) {
    const currentSection = getCurrentSectionForPage(page);
    const sectionName = sectionNames[currentSection - 1] || `Sezione ${currentSection}`;
    
    const sectionHeader = document.createElement("div");
    sectionHeader.style.cssText = `
      background: #e3f2fd;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-weight: 600;
      color: #1976d2;
    `;
    sectionHeader.textContent = `📍 ${sectionName}`;
    questionContainer.appendChild(sectionHeader);
  }

  pageQuestions.forEach((q, index) => {
    const globalIndex = startIndex + index;
    const qDiv = document.createElement("div");
    qDiv.classList.add("bocconi-question");
    qDiv.style.marginBottom = "30px";
    qDiv.style.paddingBottom = "30px";
    qDiv.style.borderBottom = "2px solid #e0e0e0";

    // Numero domanda
    const questionNumber = document.createElement("h3");
    questionNumber.style.color = "#1c2545";
    questionNumber.style.marginBottom = "15px";
    questionNumber.textContent = `Domanda ${q.question_number}`;
    qDiv.appendChild(questionNumber);

    // Question text
    const questionP = document.createElement("p");
    questionP.classList.add("question-text", "latex");
    questionP.style.fontSize = "16px";
    questionP.style.lineHeight = "1.6";
    questionP.style.marginBottom = "15px";
    questionP.textContent = q.question_text;
    qDiv.appendChild(questionP);

    // Question image if exists
    if (q.image_url) {
      const img = document.createElement("img");
      img.src = q.image_url;
      img.alt = "Immagine domanda";
      img.classList.add("question-image");
      img.style.maxWidth = "500px";
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      img.style.margin = "15px 0";
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      img.onerror = function() {
        this.style.display = "none";
        console.warn("Immagine non trovata:", q.image_url);
      };
      qDiv.appendChild(img);
    }

    // Prepare choices
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

    // Aggiungi opzioni extra
    choices.push({ letter: 'X', text: 'Insicuro', isCorrect: false });
    choices.push({ letter: 'Y', text: 'Non ho idea', isCorrect: false });

    // Salva la risposta corretta
    correctMapping[q.id] = q.correct_answer;

    // Create choices container
    const choicesDiv = document.createElement("div");
    choicesDiv.classList.add("choices");
    choicesDiv.style.marginTop = "20px";

    choices.forEach(choice => {
      const choiceDiv = document.createElement("div");
      choiceDiv.classList.add("choice-item");
      choiceDiv.style.marginBottom = "10px";
      choiceDiv.style.border = "2px solid #e0e0e0";
      choiceDiv.style.padding = "12px 15px";
      choiceDiv.style.borderRadius = "8px";
      choiceDiv.style.cursor = "pointer";
      choiceDiv.style.transition = "all 0.2s ease";
      choiceDiv.dataset.questionId = q.id;
      choiceDiv.dataset.letter = choice.letter;
      
      // Hover effect
      choiceDiv.addEventListener("mouseenter", () => {
        if (!choiceDiv.classList.contains("selected")) {
          choiceDiv.style.backgroundColor = "#f5f5f5";
          choiceDiv.style.borderColor = "#00a666";
        }
      });
      
      choiceDiv.addEventListener("mouseleave", () => {
        if (!choiceDiv.classList.contains("selected")) {
          choiceDiv.style.backgroundColor = "";
          choiceDiv.style.borderColor = "#e0e0e0";
        }
      });
      
      // Contenuto della scelta
      const contentDiv = document.createElement("div");
      contentDiv.style.display = "flex";
      contentDiv.style.alignItems = "flex-start";
      contentDiv.style.gap = "10px";
      
      const letterSpan = document.createElement("span");
      letterSpan.style.fontWeight = "bold";
      letterSpan.style.color = "#00a666";
      letterSpan.style.minWidth = "25px";
      letterSpan.textContent = `${choice.letter}.`;
      contentDiv.appendChild(letterSpan);
      
      const textSpan = document.createElement("span");
      textSpan.style.flex = "1";
      textSpan.classList.add("latex");
      textSpan.textContent = choice.text;
      contentDiv.appendChild(textSpan);
      
      choiceDiv.appendChild(contentDiv);
      
      // Aggiungi immagine se presente
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
      choiceDiv.addEventListener("click", () => {
        selectAnswerBocconi(q.id, choice.letter, choiceDiv, choicesDiv);
      });
      
      // Se già selezionata, applica lo stile
      if (studentAnswers[q.id] === choice.letter) {
        choiceDiv.classList.add("selected");
        choiceDiv.style.backgroundColor = "#e8f5e9";
        choiceDiv.style.borderColor = "#00a666";
        choiceDiv.style.borderWidth = "3px";
      }
      
      choicesDiv.appendChild(choiceDiv);
    });

    qDiv.appendChild(choicesDiv);
    questionContainer.appendChild(qDiv);
  });

  // Aggiungi container per i bottoni di navigazione
  const navButtonsContainer = document.createElement("div");
  navButtonsContainer.style.cssText = `
    margin-top: 30px;
    padding: 20px;
    text-align: center;
    border-top: 2px solid #e0e0e0;
  `;
  navButtonsContainer.id = "navButtonsContainer";
  
  // Sposta i bottoni nel container
  if (prevPageBtn && prevPageBtn.style.display !== "none") {
    navButtonsContainer.appendChild(prevPageBtn);
  }
  if (nextPageBtn && nextPageBtn.style.display !== "none") {
    navButtonsContainer.appendChild(nextPageBtn);
  }
  if (submitBtn && submitBtn.style.display !== "none") {
    navButtonsContainer.appendChild(submitBtn);
  }
  
  questionContainer.appendChild(navButtonsContainer);

  // Trigger MathJax
  if (window.MathJax) {
    MathJax.typesetPromise()
      .then(() => console.log("🔢 MathJax Renderizzato"))
      .catch(err => console.error("❌ Errore MathJax:", err));
  }

  buildQuestionNavBocconi();
}

function selectAnswerBocconi(questionId, selectedLetter, choiceDiv, parent) {
  // Toggle answer
  if (studentAnswers[questionId] === selectedLetter) {
    delete studentAnswers[questionId];
    choiceDiv.classList.remove("selected");
    choiceDiv.style.backgroundColor = "";
    choiceDiv.style.borderColor = "#e0e0e0";
    choiceDiv.style.borderWidth = "2px";
  } else {
    // Reset all styles in this question
    Array.from(parent.children).forEach(child => {
      child.classList.remove("selected");
      child.style.backgroundColor = "";
      child.style.borderColor = "#e0e0e0";
      child.style.borderWidth = "2px";
    });
    
    // Set new selection
    studentAnswers[questionId] = selectedLetter;
    choiceDiv.classList.add("selected");
    choiceDiv.style.backgroundColor = "#e8f5e9";
    choiceDiv.style.borderColor = "#00a666";
    choiceDiv.style.borderWidth = "3px";
  }
  
  buildQuestionNavBocconi();
}

function buildQuestionNavBocconi() {
  const questionNav = document.getElementById("questionNav");
  if (!questionNav) return;
  questionNav.innerHTML = "";
  
  // Se è una simulazione con sezioni, mostra solo la sezione corrente
  if (hasSections && sectionNames.length > 0) {
    const currentSection = getCurrentSectionForPage(currentPage);
    
    // Aggiungi header della sezione corrente
    const sectionHeader = document.createElement("div");
    sectionHeader.style.width = "100%";
    sectionHeader.style.padding = "5px";
    sectionHeader.style.fontSize = "12px";
    sectionHeader.style.fontWeight = "bold";
    sectionHeader.style.color = "#666";
    sectionHeader.style.borderBottom = "1px solid #ddd";
    sectionHeader.style.marginBottom = "5px";
    sectionHeader.textContent = sectionNames[currentSection - 1] || `Sezione ${currentSection}`;
    questionNav.appendChild(sectionHeader);
    
    // Mostra solo le domande della sezione corrente
    questions.forEach((q, index) => {
      const qSection = getCurrentSectionForQuestion(q.question_number);
      if (qSection === currentSection) {
        createQuestionButton(q, index);
      }
    });
  } else {
    // Navigazione normale senza sezioni
    questions.forEach((q, index) => createQuestionButton(q, index));
  }
  
  function createQuestionButton(q, index) {
    const btn = document.createElement("button");
    btn.classList.add("question-cell");
    btn.style.width = "35px";
    btn.style.height = "35px";
    btn.style.margin = "2px";
    btn.style.border = "2px solid #ddd";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "600";
    btn.style.transition = "all 0.2s ease";
    btn.textContent = q.question_number;
    
    if (studentAnswers[q.id]) {
      btn.classList.add("answered");
      btn.style.backgroundColor = "#00a666";
      btn.style.color = "white";
      btn.style.borderColor = "#00a666";
    } else {
      btn.style.backgroundColor = "white";
      btn.style.color = "#333";
    }
    
    // Evidenzia domande della pagina corrente
    const pageIndex = currentPage - 2;
    const startIdx = pageIndex * 3;
    if (index >= startIdx && index < startIdx + 3) {
      btn.classList.add("current-question");
      btn.style.boxShadow = "0 0 0 3px rgba(0, 166, 102, 0.3)";
    }
    
    // Click per navigare
    btn.addEventListener("click", () => {
      const targetPage = Math.floor(index / 3) + 2;
      const currentStartIdx = (currentPage - 2) * 3;
      
      // Controlli navigazione
      if (isBocconiTest && targetPage < currentPage) {
        // Bocconi: MAI indietro
        return;
      }
      
      if (hasSections && !isBocconiTest) {
        // Altri test con sezioni: controlla se resta nella sezione corrente
        if (targetPage < currentPage && isPageInDifferentSection(currentPage, targetPage)) {
          showCustomAlert("Non puoi tornare alla sezione precedente!");
          return;
        }
        
        if (targetPage > currentPage && isPageInDifferentSection(currentPage, targetPage)) {
          showSectionChangeDialog(() => {
            loadQuestionsForPage(targetPage);
          });
          return;
        }
      }
      
      loadQuestionsForPage(targetPage);
    });
    
    // Disabilita se non raggiungibile
    if (isBocconiTest && Math.floor(index / 3) + 2 < currentPage) {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    } else if (hasSections && !isBocconiTest) {
      // Per altri test con sezioni, disabilita se in sezione precedente
      const targetPage = Math.floor(index / 3) + 2;
      if (targetPage < currentPage && isPageInDifferentSection(currentPage, targetPage)) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
      }
    }
    
    questionNav.appendChild(btn);
  }
}

// Progress bar rimossa - non più necessaria

async function performSubmit() {
  isSubmitting = true;
  
  // Disabilita tutti i bottoni
  document.querySelectorAll("button").forEach(btn => btn.disabled = true);
  
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData || !sessionData.session) {
    showCustomAlert("Sessione scaduta. Effettua nuovamente il login.", () => {
      window.location.href = "/";
    });
    return;
  }
  
  const studentId = sessionData.session.user.id;
  console.log("📤 Invio risposte - Student ID:", studentId);
  console.log("📤 Test ID:", testId);

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

  console.log(`📊 Invio ${submissions.length} risposte...`);

  const { data, error } = await supabase
    .from("studentbocconi_answers")
    .insert(submissions);
    
  if (error) {
    console.error("❌ Errore nell'invio risposte:", error);
    showCustomAlert("Invio fallito. Riprova.");
    isSubmitting = false;
    document.querySelectorAll("button").forEach(btn => btn.disabled = false);
    return;
  }

  // Clear timers
  if (globalTimerInterval) clearInterval(globalTimerInterval);

  // Update test status
  await supabase
    .from("student_tests")
    .update({ status: "completed" })
    .eq("auth_uid", studentId)
    .eq("section", sessionStorage.getItem("currentSection"))
    .eq("tipologia_esercizi", sessionStorage.getItem("currentTipologiaEsercizi"))
    .eq("progressivo", sessionStorage.getItem("currentTestProgressivo"))
    .eq("tipologia_test", sessionStorage.getItem("selectedTestType"))
    .eq("id", testId);

  // Exit fullscreen before redirect
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
  
  showCustomAlert("✅ Test completato con successo!", () => {
    window.location.href = "test_selection.html";
  });
}

async function submitAnswersBocconi() {
  if (isSubmitting) return;
  
  // Controlla se tutte le domande hanno risposta
  const unanswered = questions.filter(q => !studentAnswers[q.id]);
  if (unanswered.length > 0) {
    showSubmitConfirmDialog(unanswered.length, async () => {
      await performSubmit();
    });
  } else {
    await performSubmit();
  }
}

// Dialog per conferma invio con domande non risposte
function showSubmitConfirmDialog(unansweredCount, onConfirm) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  const dialog = document.createElement("div");
  dialog.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-width: 450px;
    text-align: center;
  `;
  
  dialog.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #ff5722;">⚠️ Attenzione</h3>
    <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;">
      Hai <strong>${unansweredCount} domande</strong> senza risposta.<br>
      Vuoi inviare comunque il test?
    </p>
    <div style="display: flex; gap: 15px; justify-content: center;">
      <button id="cancelSubmit" style="
        padding: 12px 30px;
        font-size: 16px;
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
      ">Torna al test</button>
      <button id="confirmSubmit" style="
        padding: 12px 30px;
        font-size: 16px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      ">Invia comunque</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  document.getElementById("cancelSubmit").addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
  
  document.getElementById("confirmSubmit").addEventListener("click", () => {
    document.body.removeChild(overlay);
    onConfirm();
  });
  
  document.getElementById("cancelSubmit").focus();
}

async function startTimerBocconi() {
  const timerElement = document.getElementById("timer");
  const timeLeftElement = document.getElementById("time-left");
  
  if (!timerElement || !timeLeftElement) {
    console.error("❌ Timer elements not found in HTML");
    return;
  }
  
  timerElement.style.visibility = "visible";
  
  // Se ci sono sezioni, aggiungi il nome della sezione al timer
  if (hasSections && sectionNames.length > 0) {
    const timerContainer = timerElement.parentElement || timerElement;
    const sectionLabel = document.createElement("span");
    sectionLabel.id = "sectionLabel";
    sectionLabel.style.marginLeft = "20px";
    sectionLabel.style.fontWeight = "600";
    sectionLabel.style.color = "#1976d2";
    timerContainer.appendChild(sectionLabel);
    
    // Aggiorna il label della sezione
    function updateSectionLabel() {
      const currentSection = getCurrentSectionForPage(currentPage);
      const sectionName = sectionNames[currentSection - 1] || `Sezione ${currentSection}`;
      sectionLabel.textContent = `📍 ${sectionName}`;
    }
    
    // Aggiorna periodicamente
    setInterval(updateSectionLabel, 1000);
    updateSectionLabel();
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
  
  // Recupera durata test
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
  
  const totalDurationSeconds = testData.duration || 1800; // default 30 minuti
  
  // Se il test ha sezioni, dividi il tempo
  if (hasSections) {
    setupSectionTimers(totalDurationSeconds);
  } else {
    // Timer normale per test senza sezioni
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
  // Conta domande per sezione
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
  
  // Calcola tempo per sezione proporzionale al numero di domande
  const timePerQuestion = totalDurationSeconds / totalQuestionsInSections;
  let cumulativeTime = Date.now();
  
  // Assegna tempo a ogni sezione
  Object.keys(questionsBySection).sort((a, b) => a - b).forEach(section => {
    const sectionTime = Math.round(timePerQuestion * questionsBySection[section]);
    cumulativeTime += sectionTime * 1000;
    sectionEndTimes[section] = cumulativeTime;
  });
  
  console.log("⏱️ Tempi per sezione:", sectionEndTimes);
  
  // Avvia timer globale
  const endTime = Date.now() + totalDurationSeconds * 1000;
  
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

function updateTimerDisplay(timeLeft) {
  const timeLeftElement = document.getElementById("time-left");
  if (!timeLeftElement) return;
  
  // Se ci sono sezioni, mostra solo il tempo della sezione
  if (hasSections && sectionEndTimes && Object.keys(sectionEndTimes).length > 0) {
    const currentSection = getCurrentSectionForPage(currentPage);
    const sectionEndTime = sectionEndTimes[currentSection];
    
    if (sectionEndTime) {
      const now = Date.now();
      const sectionTimeLeft = sectionEndTime - now;
      
      if (sectionTimeLeft > 0) {
        const minutes = Math.floor(sectionTimeLeft / 60000);
        const seconds = Math.floor((sectionTimeLeft % 60000) / 1000);
        
        timeLeftElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Cambia colore se manca poco tempo
        if (sectionTimeLeft < 60000) { // 1 minuto
          timeLeftElement.style.color = "#f44336";
          timeLeftElement.style.fontWeight = "bold";
        } else if (sectionTimeLeft < 300000) { // 5 minuti
          timeLeftElement.style.color = "#ff9800";
        } else {
          timeLeftElement.style.color = "";
          timeLeftElement.style.fontWeight = "";
        }
      } else {
        timeLeftElement.textContent = "Tempo scaduto!";
        timeLeftElement.style.color = "#f44336";
        timeLeftElement.style.fontWeight = "bold";
      }
    }
  } else {
    // Timer normale per test senza sezioni
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
    
    // Cambia colore se manca poco tempo
    if (timeLeft < 300000) { // 5 minuti
      timeLeftElement.style.color = "#ff9800";
    }
    if (timeLeft < 60000) { // 1 minuto
      timeLeftElement.style.color = "#f44336";
      timeLeftElement.style.fontWeight = "bold";
    }
  }
}

// Expose globally
window.selectAnswerBocconi = selectAnswerBocconi;
window.submitAnswersBocconi = submitAnswersBocconi;