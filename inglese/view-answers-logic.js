// view-answers-logic.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Recupera parametri dal sessionStorage
const selectedStudentId = sessionStorage.getItem("selectedStudentId");
const selectedStudentName = sessionStorage.getItem("selectedStudentName") || "Studente";
const selectedSection = sessionStorage.getItem("selectedSection");
const selectedTipologiaEsercizi = sessionStorage.getItem("selectedTipologiaEsercizi");
const selectedProgressivo = sessionStorage.getItem("selectedTestProgressivo");
const selectedTestType = sessionStorage.getItem("selectedTestType");


// Verifica parametri
if (!selectedStudentId || !selectedSection || !selectedTipologiaEsercizi || !selectedProgressivo || !selectedTestType) {
  alert("Dati test mancanti. Riprova.");
  window.location.href = "view-tests.html";
}

// Determina quale tabella usare
const usePDF = selectedTestType.includes("PDF");
const questionsTable = usePDF ? "questions" : "questions_bancaDati";
const answersTable = usePDF ? "student_answers" : "studentbocconi_answers";

// Statistiche
let correctCount = 0;
let wrongCount = 0;
let skippedCount = 0;
let unsureCount = 0;
let noIdeaCount = 0;
let timeoutCount = 0;
let totalQuestions = 0;

// Inizializzazione
document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  
  // Aggiorna titolo e info
  document.getElementById('testTitle').textContent = `Risposte di ${selectedStudentName}`;
  document.getElementById('testInfo').textContent = `${selectedSection} - ${selectedTipologiaEsercizi} ${selectedProgressivo}`;
  
  // Carica il nome del tutor nell'header
  await updateTutorName();
  
  // Carica le risposte
  await loadTestAnswers();
  
  hideLoading();
});

// Aggiorna il nome del tutor nell'header
async function updateTutorName() {
  setTimeout(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      const userId = sessionData.session.user.id;
      const { data: tutor } = await supabase
        .from("tutors")
        .select("name")
        .eq("auth_uid", userId)
        .single();
      
      if (tutor?.name) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
          userNameElement.textContent = tutor.name;
        }
      }
    }

    // Aggiungi evento logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    });
  }, 100);
}

// Carica le risposte del test
async function loadTestAnswers() {
  try {
    // ✅ STEP 0: Get test_id from student_tests table (get LATEST attempt)
    const { data: studentTestData, error: studentTestError } = await supabase
      .from("student_tests")
      .select("id")
      .eq("auth_uid", selectedStudentId)
      .eq("section", selectedSection)
      .eq("tipologia_esercizi", selectedTipologiaEsercizi)
      .eq("progressivo", selectedProgressivo)
      .eq("tipologia_test", selectedTestType)
      .order("start_time", { ascending: false })
      .limit(1);

    if (studentTestError) {
      console.error("Errore nel recupero del test:", studentTestError.message);
      alert("Errore nel recupero del test.");
      return;
    }

    if (!studentTestData || studentTestData.length === 0) {
      alert("Test non trovato per questo studente.");
      return;
    }

    const testId = studentTestData[0].id;

    // ✅ STEP 1: Get highest question_number (= number of questions in test)
    let maxQuestionQuery = supabase.from(questionsTable).select("question_number");

    if (selectedTestType === "SAT PDF" && selectedSection === "Assessment Iniziale") {
      // For SAT, use Materia field instead of section
      maxQuestionQuery = maxQuestionQuery
        .eq("Materia", selectedSection)
        .eq("tipologia_esercizi", selectedTipologiaEsercizi)
        .eq("progressivo", selectedProgressivo)
        .eq("tipologia_test", selectedTestType);
    } else {
      // Regular query for non-SAT tests
      maxQuestionQuery = maxQuestionQuery
        .eq("section", selectedSection)
        .eq("tipologia_esercizi", selectedTipologiaEsercizi)
        .eq("progressivo", selectedProgressivo)
        .eq("tipologia_test", selectedTestType);
    }

    maxQuestionQuery = maxQuestionQuery.order("question_number", { ascending: false }).limit(1);

    const { data: maxQuestionData, error: maxQuestionError } = await maxQuestionQuery;

    if (maxQuestionError) {
      console.error("Errore nel recupero del numero di domande:", maxQuestionError.message);
      alert("Errore nel recupero del test.");
      return;
    }

    if (!maxQuestionData || maxQuestionData.length === 0) {
      alert("Nessuna domanda trovata per questo test.");
      return;
    }

    const questionCount = maxQuestionData[0].question_number;

    // ✅ STEP 2: Fetch student answers FOR THIS TEST, ordered by timestamp DESC, take top N
    const { data: answersData, error: allAnswersError } = await supabase
      .from(answersTable)
      .select("*")
      .eq("auth_uid", selectedStudentId)
      .eq("test_id", testId)
      .order("submitted_at", { ascending: false })
      .limit(questionCount);

    if (allAnswersError) {
      console.error("Errore nel recupero delle risposte:", allAnswersError.message);
      alert("Errore nel recupero delle risposte.");
      return;
    }

    if (!answersData || answersData.length === 0) {
      alert("Nessuna risposta trovata per questo studente.");
      return;
    }

    // ✅ STEP 3: Extract question IDs from answers
    const answeredQuestionIds = answersData.map(a => a.question_id);

    // ✅ STEP 4: Fetch ONLY the questions that were answered
    const { data: questionsData, error: questionsError } = await supabase
      .from(questionsTable)
      .select("*")
      .in("id", answeredQuestionIds)
      .order("question_number");

    if (questionsError) {
      console.error("Errore nel recupero delle domande:", questionsError.message);
      alert("Errore nel recupero delle domande.");
      return;
    }

    if (!questionsData || questionsData.length === 0) {
      alert("Nessuna domanda trovata per le risposte dello studente.");
      return;
    }

    totalQuestions = questionsData.length;

    // 2. Gestione PDF se disponibile - con supporto multilingua
    const pdfUrlsIt = questionsData.map(q => q.pdf_url).filter(url => url);
    const pdfUrlsEn = questionsData.map(q => q.pdf_url_eng).filter(url => url);
    const uniquePdfUrlsIt = [...new Set(pdfUrlsIt)];
    const uniquePdfUrlsEn = [...new Set(pdfUrlsEn)];

    // Salva gli URL per poterli switchare
    window.italianPdfUrl = uniquePdfUrlsIt[0] || null;
    window.englishPdfUrl = uniquePdfUrlsEn[0] || null;

    if (usePDF && (uniquePdfUrlsIt.length > 0 || uniquePdfUrlsEn.length > 0)) {
      // Carica inizialmente il PDF inglese
      document.getElementById("pdfFrame").src = uniquePdfUrlsEn[0] || uniquePdfUrlsIt[0];
      document.getElementById("pdfPanel").style.display = "flex";

      // Se non c'è PDF inglese, disabilita il toggle
      const englishToggle = document.getElementById("englishCorrectionToggle");
      if (englishToggle && !window.englishPdfUrl) {
        englishToggle.disabled = true;
        const toggleLabel = document.querySelector(".toggle-label");
        const languageToggle = document.querySelector(".language-toggle-correction");
        if (toggleLabel) toggleLabel.textContent = "🇬🇧 PDF Inglese non disponibile";
        if (languageToggle) languageToggle.style.opacity = "0.5";
      }
    } else {
      // Nascondi pannello PDF e espandi risposte
      document.getElementById("pdfPanel").style.display = "none";
      document.getElementById("answersPanel").classList.add("expanded");
    }

    // Mappa risposte
    const studentAnswersMap = {};
    if (answersData) {
      answersData.forEach(ans => {
        studentAnswersMap[ans.question_id] = ans.answer;
      });
    }

    // 5. Display domande e risposte
    displayQuestionsAndAnswers(questionsData, studentAnswersMap);
    
    // 6. Aggiorna statistiche
    updateStatistics();
    
    // 7. Trigger MathJax - but EXCLUDE Data Insights questions
    if (window.MathJax) {
      // Get all question items that are NOT Data Insights questions
      const nonDIQuestions = document.querySelectorAll('.question-item:not(.di-question)');
      if (nonDIQuestions.length > 0) {
        MathJax.typesetPromise(Array.from(nonDIQuestions)).catch(err => console.error("MathJax error:", err));
      }
    }
  } catch (error) {
    console.error("Errore generale:", error);
    alert("An error occurred while loading answers.");
  }
}

// Display domande e risposte
function displayQuestionsAndAnswers(questionsData, studentAnswersMap) {
  let listContainer = document.getElementById("questionsList");
  listContainer.innerHTML = "";

  // Reset statistiche
  correctCount = 0;
  wrongCount = 0;
  skippedCount = 0;
  unsureCount = 0;
  noIdeaCount = 0;
  timeoutCount = 0;

  // Helper function to check if a Data Insights answer is correct (must be at top level)
  // This function is used by both SAT and GMAT scoring logic
  window.isDIAnswerCorrect = function(studentAnswer, correctAnswer) {
    if (!studentAnswer || !correctAnswer) {
      return false;
    }

    try {
      // Parse if strings
      let studentObj = typeof studentAnswer === 'string' ? JSON.parse(studentAnswer) : studentAnswer;
      let correctObj = typeof correctAnswer === 'string' ? JSON.parse(correctAnswer) : correctAnswer;

      // Compare all keys
      const allKeys = new Set([...Object.keys(studentObj), ...Object.keys(correctObj)]);
      for (const key of allKeys) {
        const studentVal = studentObj[key];
        const correctVal = correctObj[key];

        // Handle nested objects (like two-column answers)
        if (typeof correctVal === 'object' && correctVal !== null) {
          if (typeof studentVal !== 'object') {
            return false;
          }
          // Compare nested keys
          const nestedKeys = new Set([...Object.keys(studentVal || {}), ...Object.keys(correctVal)]);
          for (const nestedKey of nestedKeys) {
            if (studentVal[nestedKey] !== correctVal[nestedKey]) {
              return false;
            }
          }
        } else {
          // Simple comparison (case-insensitive for letters)
          const sVal = String(studentVal || '').toLowerCase();
          const cVal = String(correctVal || '').toLowerCase();
          if (sVal !== cVal) {
            return false;
          }
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  // Check if this is a SAT test
  const isSATTest = selectedTestType === "SAT PDF";

  // Check if this is a GMAT test (GMAT uses banca dati, not PDF)
  const isGMATTest = selectedTestType === "GMAT";
  const shouldShowGMATSections = isGMATTest &&
    (selectedSection === "Assessment Iniziale" || selectedSection === "Simulazioni");

  // 🔍 CHECK: Only show modules for Simulazioni and Assessment Iniziale
  const shouldShowModules = (selectedSection === "Simulazioni" || selectedSection === "Assessment Iniziale");

  // 📊 Add SAT Score Report button for ALL SAT tests (at the top of questions list)
  if (isSATTest) {
    const scoreReportBtn = document.createElement("button");
    scoreReportBtn.className = "sat-score-report-btn";
    scoreReportBtn.innerHTML = "📊 SAT Score Report";
    scoreReportBtn.style.cssText = `
      position: relative;
      margin: 0 0 1.5rem 0;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
      transition: all 0.3s ease;
      display: block;
      width: 100%;
      max-width: 300px;
    `;
    scoreReportBtn.onmouseover = () => {
      scoreReportBtn.style.transform = "translateY(-2px)";
      scoreReportBtn.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.4)";
    };
    scoreReportBtn.onmouseout = () => {
      scoreReportBtn.style.transform = "translateY(0)";
      scoreReportBtn.style.boxShadow = "0 2px 8px rgba(34, 197, 94, 0.3)";
    };
    scoreReportBtn.onclick = (e) => {
      e.stopPropagation();
      generateSATScoreReport(questionsData, studentAnswersMap);
    };
    listContainer.appendChild(scoreReportBtn);
  }

  // 📊 Add GMAT Score Report button for GMAT tests (at the top of questions list)
  if (isGMATTest && shouldShowGMATSections) {
    const scoreReportBtn = document.createElement("button");
    scoreReportBtn.className = "gmat-score-report-btn";
    scoreReportBtn.innerHTML = "📊 GMAT Score Report";
    scoreReportBtn.style.cssText = `
      position: relative;
      margin: 0 0 1.5rem 0;
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
      transition: all 0.3s ease;
      display: block;
      width: 100%;
      max-width: 300px;
    `;
    scoreReportBtn.onmouseover = () => {
      scoreReportBtn.style.transform = "translateY(-2px)";
      scoreReportBtn.style.boxShadow = "0 4px 12px rgba(249, 115, 22, 0.4)";
    };
    scoreReportBtn.onmouseout = () => {
      scoreReportBtn.style.transform = "translateY(0)";
      scoreReportBtn.style.boxShadow = "0 2px 8px rgba(249, 115, 22, 0.3)";
    };
    scoreReportBtn.onclick = (e) => {
      e.stopPropagation();
      generateGMATScoreReport(questionsData, studentAnswersMap);
    };
    listContainer.appendChild(scoreReportBtn);
  }

  // For SAT with modules (Simulazioni/Assessment Iniziale), separate shown questions from non-shown modules
  let shownQuestions = [];
  let notShownQuestions = [];

  if (isSATTest && shouldShowModules) {
    // Separate questions by module based on SAT_section field
    const moduleQuestions = {
      'RW1': [],
      'RW2-Easy': [],
      'RW2-Hard': [],
      'Math1': [],
      'Math2-Easy': [],
      'Math2-Hard': []
    };

    const notShownModules = {};

    questionsData.forEach(q => {
      const answer = studentAnswersMap[q.id] || "";
      const satSection = q.SAT_section || q.section || "";

      // Normalize MATH to Math (handles MATH1, MATH2-Easy, MATH2-Hard)
      let normalizedSection = satSection;
      if (satSection === 'MATH1') {
        normalizedSection = 'Math1';
      } else if (satSection === 'MATH2-Easy') {
        normalizedSection = 'Math2-Easy';
      } else if (satSection === 'MATH2-Hard') {
        normalizedSection = 'Math2-Hard';
      }

      // Check if question was shown or not
      if (answer === "xx") {
        notShownQuestions.push(q);
        // Add to not shown modules
        if (!notShownModules[normalizedSection]) {
          notShownModules[normalizedSection] = [];
        }
        notShownModules[normalizedSection].push(q);
      } else {
        shownQuestions.push(q);
        // Add to shown modules
        if (moduleQuestions[normalizedSection]) {
          moduleQuestions[normalizedSection].push(q);
        } else {
          // If section doesn't match any expected module, try to determine by question number
          const qNum = parseInt(q.question_number);
          if (qNum >= 1 && qNum <= 27) {
            moduleQuestions['RW1'].push(q);
          } else if (qNum >= 28 && qNum <= 54) {
            // Could be RW2-Easy or RW2-Hard, check answer pattern
            if (moduleQuestions['RW2-Easy'].length > 0) {
              moduleQuestions['RW2-Easy'].push(q);
            } else if (moduleQuestions['RW2-Hard'].length > 0) {
              moduleQuestions['RW2-Hard'].push(q);
            } else {
              // Default to Easy if we can't determine
              moduleQuestions['RW2-Easy'].push(q);
            }
          } else if (qNum >= 55 && qNum <= 76) {
            moduleQuestions['Math1'].push(q);
          } else if (qNum >= 77 && qNum <= 98) {
            // Could be Math2-Easy or Math2-Hard
            if (moduleQuestions['Math2-Easy'].length > 0) {
              moduleQuestions['Math2-Easy'].push(q);
            } else if (moduleQuestions['Math2-Hard'].length > 0) {
              moduleQuestions['Math2-Hard'].push(q);
            } else {
              // Default to Easy if we can't determine
              moduleQuestions['Math2-Easy'].push(q);
            }
          }
        }
      }
    });


    // Display questions grouped by module
    const moduleNames = {
      'RW1': 'Reading & Writing Module 1',
      'RW2-Easy': 'Reading & Writing Module 2 (Easy)',
      'RW2-Hard': 'Reading & Writing Module 2 (Hard)',
      'Math1': 'Math Module 1',
      'Math2-Easy': 'Math Module 2 (Easy)',
      'Math2-Hard': 'Math Module 2 (Hard)'
    };

    // Define module order
    const moduleOrder = ['RW1', 'RW2-Easy', 'RW2-Hard', 'Math1', 'Math2-Easy', 'Math2-Hard'];

    // Display each module with shown questions in the correct order
    moduleOrder.forEach((moduleKey, moduleIndex) => {
      const questions = moduleQuestions[moduleKey] || [];
      if (questions.length > 0) {
        // Create module wrapper
        const moduleWrapper = document.createElement("div");
        moduleWrapper.className = "sat-module-wrapper";

        // Add module header with toggle button
        const moduleHeader = document.createElement("div");
        moduleHeader.className = "sat-section-header collapsible";
        moduleHeader.style.cursor = "pointer";

        // Add SAT Score Report button only for the first module
        if (moduleIndex === 0) {
          const scoreReportBtn = document.createElement("button");
          scoreReportBtn.className = "sat-score-report-btn";
          scoreReportBtn.innerHTML = "📊 SAT Score Report";
          scoreReportBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
            transition: all 0.3s ease;
          `;
          scoreReportBtn.onmouseover = () => {
            scoreReportBtn.style.transform = "translateY(-2px)";
            scoreReportBtn.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.4)";
          };
          scoreReportBtn.onmouseout = () => {
            scoreReportBtn.style.transform = "translateY(0)";
            scoreReportBtn.style.boxShadow = "0 2px 8px rgba(34, 197, 94, 0.3)";
          };
          scoreReportBtn.onclick = (e) => {
            e.stopPropagation();
            generateSATScoreReport(questionsData, studentAnswersMap);
          };
          listContainer.appendChild(scoreReportBtn);
        }

        const moduleId = `module-${moduleKey}-${moduleIndex}`;
        moduleHeader.innerHTML = `
          <div class="section-title">${moduleNames[moduleKey] || moduleKey}</div>
          <div class="section-info">
            <span>${questions.length} questions</span>
            <span class="toggle-arrow" id="arrow-${moduleId}">▶</span>
          </div>
        `;
        moduleWrapper.appendChild(moduleHeader);

        // Create container for module questions
        const moduleContainer = document.createElement("div");
        moduleContainer.className = "sat-section module-content";
        moduleContainer.id = moduleId;
        moduleContainer.style.display = "none"; // Start collapsed

        // Store original listContainer and temporarily switch
        const originalContainer = listContainer;
        listContainer = moduleContainer;

        // Display questions with renumbered indices starting from 1 for each module
        questions.forEach((q, index) => {
          displaySingleQuestion(q, studentAnswersMap[q.id] || "", index + 1, false, moduleContainer);
        });

        // Restore original listContainer
        listContainer = originalContainer;

        moduleWrapper.appendChild(moduleContainer);
        listContainer.appendChild(moduleWrapper);

        // Add toggle functionality
        moduleHeader.addEventListener("click", function() {
          const content = document.getElementById(moduleId);
          const arrow = document.getElementById(`arrow-${moduleId}`);
          if (content.style.display === "none") {
            content.style.display = "block";
            arrow.textContent = "▼";
          } else {
            content.style.display = "none";
            arrow.textContent = "▶";
          }
        });
      }
    });

    if (notShownQuestions.length > 0) {
      // Add separator and toggle for non-shown modules
      const notShownSection = document.createElement("div");
      notShownSection.className = "not-shown-section";
      notShownSection.innerHTML = `
        <div class="sat-section-header not-shown-header">
          <h3>📝 Adaptive Modules Not Shown (${notShownQuestions.length})</h3>
          <button id="toggleNotShown" class="toggle-btn">Show ▼</button>
        </div>
        <div id="notShownContainer" class="not-shown-container" style="display: none;">
          <p class="info-text">These questions were not shown to the student based on their adaptive path.</p>
        </div>
      `;
      listContainer.appendChild(notShownSection);

      // Add event listener for toggle
      document.getElementById("toggleNotShown").addEventListener("click", function() {
        const container = document.getElementById("notShownContainer");
        const isHidden = container.style.display === "none";
        container.style.display = isHidden ? "block" : "none";
        this.textContent = isHidden ? "Hide ▲" : "Show ▼";

        // Load not-shown modules if showing for first time
        if (isHidden && container.children.length === 1) {
          // Store current listContainer
          const originalContainer = listContainer;

          // Temporarily set listContainer to notShownContainer for appending
          listContainer = container;

          // Group and display not-shown questions by module
          Object.entries(notShownModules).forEach(([moduleKey, questions], moduleIndex) => {
            if (questions.length > 0) {
              // Create module wrapper
              const moduleWrapper = document.createElement("div");
              moduleWrapper.className = "sat-module-wrapper not-shown-wrapper";

              // Add module header for not-shown module
              const moduleHeader = document.createElement("div");
              moduleHeader.className = "sat-section-header not-shown-module-header collapsible";
              moduleHeader.style.cursor = "pointer";

              // Add " (Not Shown)" to the module name
              const moduleName = moduleNames[moduleKey] || moduleKey;
              const moduleId = `not-shown-module-${moduleKey}-${moduleIndex}`;

              moduleHeader.innerHTML = `
                <div class="section-title">${moduleName} - Not Shown</div>
                <div class="section-info">
                  <span>${questions.length} questions</span>
                  <span class="toggle-arrow" id="arrow-${moduleId}">▼</span>
                </div>
              `;
              moduleWrapper.appendChild(moduleHeader);

              // Create container for module questions
              const moduleContainer = document.createElement("div");
              moduleContainer.className = "sat-section module-content not-shown-content";
              moduleContainer.id = moduleId;
              moduleContainer.style.display = "block"; // Start expanded

              // Display questions with renumbered indices
              questions.forEach((q, index) => {
                displaySingleQuestion(q, "xx", index + 1, true);
                moduleContainer.appendChild(document.querySelector('.question-item:last-child'));
              });

              moduleWrapper.appendChild(moduleContainer);
              container.appendChild(moduleWrapper);

              // Add toggle functionality
              moduleHeader.addEventListener("click", function() {
                const content = document.getElementById(moduleId);
                const arrow = document.getElementById(`arrow-${moduleId}`);
                if (content.style.display === "none") {
                  content.style.display = "block";
                  arrow.textContent = "▼";
                } else {
                  content.style.display = "none";
                  arrow.textContent = "▶";
                }
              });
            }
          });

          // Restore original listContainer
          listContainer = originalContainer;
        }
      });
    }

  } else if (isGMATTest && shouldShowGMATSections) {
    // For GMAT with sections (Assessment Iniziale/Simulazioni), group by section
    const gmatSections = {
      'Quantitative Reasoning': [],
      'Verbal Reasoning': [],
      'Data Insights': []
    };

    // Group questions by GMAT section
    questionsData.forEach(q => {
      const gmatSection = q.GMAT_section || q.section || "";
      if (gmatSections[gmatSection]) {
        gmatSections[gmatSection].push(q);
      }
    });

    // Display questions grouped by GMAT section with collapsible headers
    const sectionOrder = ['Quantitative Reasoning', 'Verbal Reasoning', 'Data Insights'];

    sectionOrder.forEach((sectionKey, sectionIndex) => {
      const questions = gmatSections[sectionKey] || [];
      if (questions.length > 0) {
        // Create section wrapper
        const sectionWrapper = document.createElement("div");
        sectionWrapper.className = "gmat-section-wrapper";

        // Calculate section score (handle Data Insights multi-part questions)
        const correctQuestions = [];
        const incorrectQuestions = [];

        const correctInSection = questions.filter(q => {
          const studentAnswer = studentAnswersMap[q.id];
          let isCorrect = false;

          // Check if this is a Data Insights question with JSON answers
          if (q.di_question_type && studentAnswer) {
            try {
              // Parse di_question_data
              let questionData = q.di_question_data;
              if (typeof questionData === 'string') {
                questionData = JSON.parse(questionData);
              }

              // Special handling for Graphics Interpretation (GI)
              if (q.di_question_type === 'GI') {
                const studentObj = typeof studentAnswer === 'string' ? JSON.parse(studentAnswer) : studentAnswer;
                isCorrect = studentObj.blank1 === questionData.blank1_correct && studentObj.blank2 === questionData.blank2_correct;
              } else {
                // Get correct answer based on DI type
                let correctAnswer = null;

                // DS questions use simple letter answers (A, B, C, D, E) - not JSON
                if (q.di_question_type === 'DS') {
                  correctAnswer = questionData.correct_answer || q.correct_answer;
                  // Simple string comparison for DS (case-insensitive)
                  isCorrect = String(studentAnswer).toUpperCase() === String(correctAnswer).toUpperCase();
                } else if (q.di_question_type === 'TA') {
                  // TA stores in di_question_data.correct_answer
                  correctAnswer = questionData.correct_answer || q.correct_answer;
                } else if (q.di_question_type === 'TPA') {
                  // TPA stores in di_question_data.correct_answers
                  correctAnswer = questionData.correct_answers || q.correct_answer;
                } else if (q.di_question_type === 'MSR') {
                  // MSR: build correct answer from sub-questions
                  correctAnswer = {};
                  if (questionData.questions) {
                    questionData.questions.forEach((subQ, idx) => {
                      if (subQ.question_type === 'multiple_choice' && subQ.correct_answer) {
                        correctAnswer[`q${idx}`] = subQ.correct_answer;
                      } else if (subQ.question_type === 'two_column' && subQ.correct_answers) {
                        correctAnswer[`q${idx}`] = subQ.correct_answers;
                      }
                    });
                  }
                }

                // Use helper function for non-DS DI types (TA, TPA, MSR)
                // DS was already handled above with simple string comparison
                if (correctAnswer && q.di_question_type !== 'DS') {
                  isCorrect = window.isDIAnswerCorrect(studentAnswer, correctAnswer);
                }
              }
            } catch (e) {
              isCorrect = false;
            }
          } else {
            // Regular comparison for non-DI questions
            isCorrect = studentAnswer === q.correct_answer;
          }

          // Track correct/incorrect questions
          if (isCorrect) {
            correctQuestions.push(`Q${q.question_number}${q.di_question_type ? `(${q.di_question_type})` : ''}`);
          } else if (studentAnswer) {
            incorrectQuestions.push(`Q${q.question_number}${q.di_question_type ? `(${q.di_question_type})` : ''}`);
          }

          return isCorrect;
        }).length;

        console.log(`📊 ${sectionKey} SECTION SCORE: ${correctInSection}/${questions.length} correct`);
        console.log(`   ✅ Correct (${correctQuestions.length}): ${correctQuestions.join(', ')}`);
        console.log(`   ❌ Incorrect (${incorrectQuestions.length}): ${incorrectQuestions.join(', ')}`);
        const percentage = Math.round((correctInSection / questions.length) * 100);

        // Add section header with toggle button and score
        const sectionHeader = document.createElement("div");
        sectionHeader.className = "gmat-section-header collapsible";
        sectionHeader.style.cursor = "pointer";

        const sectionId = `gmat-section-${sectionKey.replace(/\s+/g, '-')}-${sectionIndex}`;
        sectionHeader.innerHTML = `
          <div class="section-title">${sectionKey}</div>
          <div class="section-info">
            <span>${correctInSection}/${questions.length} correct (${percentage}%)</span>
            <span class="toggle-arrow" id="arrow-${sectionId}">▶</span>
          </div>
        `;
        sectionWrapper.appendChild(sectionHeader);

        // Create container for section questions
        const sectionContainer = document.createElement("div");
        sectionContainer.className = "gmat-section section-content";
        sectionContainer.id = sectionId;
        sectionContainer.style.display = "none"; // Start collapsed

        // Store original listContainer and temporarily switch
        const originalContainer = listContainer;
        listContainer = sectionContainer;

        // Display questions with renumbered indices starting from 1 for each section
        questions.forEach((q, index) => {
          displaySingleQuestion(q, studentAnswersMap[q.id] || "", index + 1, false, sectionContainer);
        });

        // Restore original listContainer
        listContainer = originalContainer;

        sectionWrapper.appendChild(sectionContainer);
        listContainer.appendChild(sectionWrapper);

        // Add toggle functionality
        sectionHeader.addEventListener("click", function() {
          const content = document.getElementById(sectionId);
          const arrow = document.getElementById(`arrow-${sectionId}`);
          if (content.style.display === "none") {
            content.style.display = "block";
            arrow.textContent = "▼";
          } else {
            content.style.display = "none";
            arrow.textContent = "▶";
          }
        });
      }
    });
  } else {
    // For non-SAT/non-GMAT tests, display all questions normally
    questionsData.forEach((q, index) => {
      displaySingleQuestion(q, studentAnswersMap[q.id] || "", index + 1, false);
    });
  }
}

// New function to display a single question
function displaySingleQuestion(q, studentAnswerRaw, questionNumber, isNotShown, targetContainer = null) {
    let studentAnswer = studentAnswerRaw;
    let answerStatus = "";

    // Gestione risposte speciali - ENGLISH VERSION
    if (studentAnswerRaw === "xx") {
      studentAnswer = "Not Shown";
      answerStatus = "not-shown";
    } else if (studentAnswerRaw === "x") {
      studentAnswer = "Unsure";
      answerStatus = "special";
    } else if (studentAnswerRaw === "y") {
      studentAnswer = "No idea";
      answerStatus = "special";
    } else if (studentAnswerRaw === "z") {
      studentAnswer = "Timeout";
      answerStatus = "timeout";
    }

    // Verifica correttezza (handle Data Insights multi-part questions)
    let isCorrect;

    // 🔍 DEBUG: Check which path we're taking
    if (q.di_question_type && studentAnswerRaw) {
      // Data Insights question - use helper function

      // Special handling for Graphics Interpretation (GI)
      if (q.di_question_type === 'GI') {
        try {
          const studentObj = typeof studentAnswerRaw === 'string' ? JSON.parse(studentAnswerRaw) : studentAnswerRaw;

          // Parse di_question_data to get correct answers
          let questionData = q.di_question_data;
          if (typeof questionData === 'string') {
            questionData = JSON.parse(questionData);
          }

          const blank1Match = studentObj.blank1 === questionData.blank1_correct;
          const blank2Match = studentObj.blank2 === questionData.blank2_correct;
          isCorrect = blank1Match && blank2Match;
        } catch (e) {
          isCorrect = false;
        }
      } else {
        // Other DI types (MSR, TA, TPA, DS) - extract correct answer from di_question_data
        try {
          // Parse di_question_data
          let questionData = q.di_question_data;
          if (typeof questionData === 'string') {
            questionData = JSON.parse(questionData);
          }

          // Get correct answer based on DI type
          let correctAnswer = null;
          if (q.di_question_type === 'DS') {
            correctAnswer = questionData.correct_answer || q.correct_answer;
          } else if (q.di_question_type === 'TA') {
            correctAnswer = questionData.correct_answer || q.correct_answer;
          } else if (q.di_question_type === 'TPA') {
            correctAnswer = questionData.correct_answers || q.correct_answer;
          } else if (q.di_question_type === 'MSR') {
            // MSR: build correct answer from sub-questions
            correctAnswer = {};
            if (questionData.questions) {
              questionData.questions.forEach((subQ, idx) => {
                if (subQ.question_type === 'multiple_choice' && subQ.correct_answer) {
                  correctAnswer[`q${idx}`] = subQ.correct_answer;
                } else if (subQ.question_type === 'two_column' && subQ.correct_answers) {
                  correctAnswer[`q${idx}`] = subQ.correct_answers;
                }
              });
            }
          }

          // Use helper function to compare
          if (correctAnswer) {
            isCorrect = window.isDIAnswerCorrect(studentAnswerRaw, correctAnswer);
          } else {
            isCorrect = false;
          }
        } catch (e) {
          isCorrect = false;
        }
      }
    } else {
      // Regular question - simple comparison
      isCorrect = studentAnswerRaw === q.correct_answer;
    }

    // Aggiorna statistiche - but only for shown questions in SAT tests
    if (!isNotShown) {
      if (!studentAnswerRaw) {
        skippedCount++; // Non date
      } else if (studentAnswerRaw === "x") {
        unsureCount++;
      } else if (studentAnswerRaw === "y") {
        noIdeaCount++;
      } else if (studentAnswerRaw === "z") {
        timeoutCount++;
      } else if (studentAnswerRaw !== "xx" && isCorrect) {
        correctCount++;
      } else if (studentAnswerRaw !== "xx") {
        wrongCount++;
      }
    }

    // Crea elemento domanda
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question-item");

    // Add special styling for not-shown questions
    if (isNotShown) {
      questionDiv.classList.add("not-shown");
    } else if (isCorrect) {
      questionDiv.classList.add("correct");
    } else if (studentAnswerRaw === "x") {
      questionDiv.classList.add("unsure");
    } else if (studentAnswerRaw === "y") {
      questionDiv.classList.add("no-idea");
    } else if (studentAnswerRaw === "z") {
      questionDiv.classList.add("timeout");
    } else if (studentAnswerRaw && !["x", "y", "z", "xx"].includes(studentAnswerRaw)) {
      questionDiv.classList.add("wrong");
    }

    // Header con numero domanda e indicatore
    const header = document.createElement("div");
    header.classList.add("question-header");

    let mark = '';
    if (isNotShown) {
      mark = '<span class="not-shown-mark">👁️‍🗨️</span>';
    } else if (isCorrect) {
      mark = '<span class="check-mark">✅</span>';
    } else if (studentAnswerRaw && !["x", "y", "z", "xx"].includes(studentAnswerRaw)) {
      mark = '<span class="cross-mark">❌</span>';
    } else if (studentAnswerRaw === "x") {
      mark = '<span class="unsure-mark">❓</span>';
    } else if (studentAnswerRaw === "y") {
      mark = '<span class="no-idea-mark">🤷</span>';
    } else if (studentAnswerRaw === "z") {
      mark = '<span class="timeout-mark">⏱️</span>';
    }

    // Add difficulty badge
    const difficulty = q.GMAT_question_difficulty || '';
    const difficultyBadge = difficulty ? `<span class="difficulty-badge difficulty-${difficulty.toLowerCase()}">${difficulty}</span>` : '';

    header.innerHTML = `
      <span>Question ${questionNumber} ${difficultyBadge}</span>
      ${mark}
    `;
    questionDiv.appendChild(header);

    const isBancaDati = questionsTable === "questions_bancaDati";

    // Check if this is a GMAT Data Insights question
    if (isBancaDati && q.di_question_type && q.di_question_data && window.GMATDataInsightsRenderer) {
      // Use GMAT DI renderer
      const diQuestionDiv = window.GMATDataInsightsRenderer.renderQuestion(q, studentAnswerRaw, questionNumber);

      // Replace the current questionDiv with the DI-rendered one
      if (targetContainer) {
        targetContainer.appendChild(diQuestionDiv);
      } else if (isNotShown) {
        return diQuestionDiv;
      } else {
        const listContainer = document.getElementById("questionsList");
        listContainer.appendChild(diQuestionDiv);
      }
      return; // Skip standard rendering
    }

    // Testo domanda
    if (!usePDF) {
      const questionText = isBancaDati ? q.question_text : q.question;
      if (questionText) {
        const qText = document.createElement("div");
        qText.classList.add("question-text");
        qText.innerHTML = questionText;
        questionDiv.appendChild(qText);
      }
    }

    // Immagine se presente (hidden by default)
    if (q.image_url) {
      const imgContainer = document.createElement("div");
      imgContainer.classList.add("image-container");

      const toggleBtn = document.createElement("button");
      toggleBtn.classList.add("toggle-image-btn");
      toggleBtn.textContent = "📷 Show question image";
      toggleBtn.onclick = function() {
        const img = this.nextElementSibling;
        if (img.style.display === "none" || img.style.display === "") {
          img.style.display = "block";
          this.textContent = "📷 Hide question image";
        } else {
          img.style.display = "none";
          this.textContent = "📷 Show question image";
        }
      };

      const img = document.createElement("img");
      img.src = q.image_url;
      img.alt = "Immagine della domanda";
      img.classList.add("question-image");
      img.style.display = "none";

      imgContainer.appendChild(toggleBtn);
      imgContainer.appendChild(img);
      questionDiv.appendChild(imgContainer);
    }

    // For Banca Dati, display options with images
    if (isBancaDati) {
      const optionsContainer = document.createElement("div");
      optionsContainer.classList.add("options-container");

      ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
        const optionText = q[`option_${letter.toLowerCase()}`];
        const optionImage = q[`image_option_${letter.toLowerCase()}`];

        if (optionText || optionImage) {
          const optionDiv = document.createElement("div");
          optionDiv.classList.add("option-item");

          // Check if this is the correct answer or student answer
          if (letter === q.correct_answer?.toUpperCase()) {
            optionDiv.classList.add("option-correct");
          }
          if (letter === studentAnswerRaw?.toUpperCase()) {
            optionDiv.classList.add("option-student");
          }

          const optionLabel = document.createElement("strong");
          optionLabel.classList.add("option-label");
          optionLabel.textContent = `${letter}) `;
          optionDiv.appendChild(optionLabel);

          const optionContent = document.createElement("div");
          optionContent.classList.add("option-content");

          if (optionText) {
            const optionTextSpan = document.createElement("span");
            optionTextSpan.classList.add("option-text");
            optionTextSpan.innerHTML = optionText;
            optionContent.appendChild(optionTextSpan);
          }

          if (optionImage) {
            const toggleOptBtn = document.createElement("button");
            toggleOptBtn.classList.add("toggle-option-image-btn");
            toggleOptBtn.textContent = "🖼️ Show";
            toggleOptBtn.onclick = function() {
              const img = this.nextElementSibling;
              if (img.style.display === "none" || img.style.display === "") {
                img.style.display = "block";
                this.textContent = "🖼️ Hide";
              } else {
                img.style.display = "none";
                this.textContent = "🖼️ Show";
              }
            };

            const optionImg = document.createElement("img");
            optionImg.src = optionImage;
            optionImg.alt = `Option ${letter}`;
            optionImg.classList.add("option-image");
            optionImg.style.display = "none";

            optionContent.appendChild(toggleOptBtn);
            optionContent.appendChild(optionImg);
          }

          optionDiv.appendChild(optionContent);
          optionsContainer.appendChild(optionDiv);
        }
      });

      questionDiv.appendChild(optionsContainer);
    }

    // Risposta corretta
    const correctDiv = document.createElement("div");
    correctDiv.classList.add("answer-row");
    correctDiv.innerHTML = `
      <strong>Correct answer:</strong>
      <span class="correct-answer">${q.correct_answer}</span>
    `;
    questionDiv.appendChild(correctDiv);

    // Don't show student answer for SAT questions that weren't shown (answer "xx")
    const isSATTest = selectedTestType === "SAT PDF";
    const wasShownToStudent = !(isSATTest && studentAnswerRaw === "xx");

    if (wasShownToStudent) {
      // Risposta dello studente (shown for all questions that were actually shown to student)
      const answerDiv = document.createElement("div");
      answerDiv.classList.add("answer-row");

      if (studentAnswer) {
        const answerClass = isCorrect ? "student-answer correct" : "student-answer";
        answerDiv.innerHTML = `
          <strong>Student's answer:</strong>
          <span class="${answerClass}">${studentAnswer}</span>
        `;
      } else {
        answerDiv.innerHTML = `
          <strong>Student's answer:</strong>
          <span class="no-answer">No answer</span>
        `;
      }
      questionDiv.appendChild(answerDiv);
    }

    // Altre risposte possibili (solo se PDF e non Banca Dati)
    if (!usePDF && !isBancaDati) {
      let allChoices = [q.correct_answer, q.wrong_1, q.wrong_2, q.wrong_3, q.wrong_4]
        .filter(choice => choice); // Rimuovi valori null/undefined
      allChoices = [...new Set(allChoices)]; // Rimuovi duplicati

      const otherChoices = allChoices.filter(choice =>
        choice !== q.correct_answer && choice !== studentAnswerRaw
      );

      if (otherChoices.length > 0) {
        const otherDiv = document.createElement("div");
        otherDiv.classList.add("other-choices");
        otherDiv.innerHTML = `<strong>Other options:</strong> ${otherChoices.join(", ")}`;
        questionDiv.appendChild(otherDiv);
      }
    }

    // Add to the appropriate container
    if (targetContainer) {
      // If a target container is provided, append to it
      targetContainer.appendChild(questionDiv);
    } else if (isNotShown) {
      // For not-shown questions, return the element
      return questionDiv;
    } else {
      // For shown questions in non-SAT tests, append to the list container
      const listContainer = document.getElementById("questionsList");
      listContainer.appendChild(questionDiv);
    }
}

// Aggiorna statistiche
function updateStatistics() {
  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('wrongCount').textContent = wrongCount;
  document.getElementById('skippedCount').textContent = skippedCount;
  document.getElementById('unsureCount').textContent = unsureCount;
  document.getElementById('noIdeaCount').textContent = noIdeaCount;
  document.getElementById('timeoutCount').textContent = timeoutCount;

  // For SAT tests, calculate percentage based on shown questions only
  const isSATTest = selectedTestType === "SAT PDF";
  let effectiveTotal = totalQuestions;

  if (isSATTest) {
    // Count only questions that were actually shown to the student
    effectiveTotal = correctCount + wrongCount + skippedCount + unsureCount + noIdeaCount + timeoutCount;
  }

  const percentage = effectiveTotal > 0
    ? Math.round((correctCount / effectiveTotal) * 100)
    : 0;
  document.getElementById('percentageScore').textContent = `${percentage}%`;
}

// Mostra/nascondi loading
function showLoading() {
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

// Gestione toggle correzione inglese
document.addEventListener("DOMContentLoaded", () => {
  const englishToggle = document.getElementById("englishCorrectionToggle");
  
  if (englishToggle) {
    englishToggle.addEventListener("change", (e) => {
      const isEnglish = e.target.checked;
      const pdfFrame = document.getElementById("pdfFrame");
      
      // Cambia PDF
      if (isEnglish && window.englishPdfUrl) {
        pdfFrame.src = window.englishPdfUrl;
      } else if (!isEnglish && window.italianPdfUrl) {
        pdfFrame.src = window.italianPdfUrl;
      }
      
      // Traduci interfaccia
      if (isEnglish) {
        // Traduci le etichette in inglese
        const testTitle = document.querySelector("#testTitle");
        if (testTitle) testTitle.textContent = "Student's answers";

        const correctLabel = document.querySelector('.stat-card.correct .stat-label');
        if (correctLabel) correctLabel.textContent = "Correct";

        const wrongLabel = document.querySelector('.stat-card.wrong .stat-label');
        if (wrongLabel) wrongLabel.textContent = "Wrong";

        const unsureLabel = document.querySelector('.stat-card.unsure .stat-label');
        if (unsureLabel) unsureLabel.textContent = "Unsure";

        const noIdeaLabel = document.querySelector('.stat-card.no-idea .stat-label');
        if (noIdeaLabel) noIdeaLabel.textContent = "No idea";

        const skippedLabel = document.querySelector('.stat-card.skipped .stat-label');
        if (skippedLabel) skippedLabel.textContent = "Skipped";

        const timeoutLabel = document.querySelector('.stat-card.timeout .stat-label');
        if (timeoutLabel) timeoutLabel.textContent = "Timeout";

        const filterHint = document.querySelector('.filter-hint span');
        if (filterHint) filterHint.textContent = "💡 Click on boxes to filter answers";

        const printBtn = document.querySelector('#printBtn');
        if (printBtn) printBtn.innerHTML = "🖨️ Generate PDF";
        
        // Traduci le etichette delle risposte
        document.querySelectorAll('.answer-header').forEach(header => {
          const text = header.textContent;
          if (text.includes('Domanda')) {
            header.innerHTML = header.innerHTML.replace('Domanda', 'Question');
          }
        });
        
        document.querySelectorAll('.status-label').forEach(label => {
          const text = label.textContent;
          if (text === 'Risposta data:') label.textContent = 'Given answer:';
          if (text === 'Risposta corretta:') label.textContent = 'Correct answer:';
          if (text === 'Stato:') label.textContent = 'Status:';
        });
        
        document.querySelectorAll('.status-value').forEach(value => {
          const text = value.textContent.trim();
          if (text === 'Corretta') value.textContent = 'Correct';
          if (text === 'Errata') value.textContent = 'Wrong';
          if (text === 'Insicuro') value.textContent = 'Unsure';
          if (text === 'Non ho idea') value.textContent = 'No idea';
          if (text === 'Non risposta') value.textContent = 'Not answered';
          if (text === 'Tempo esaurito') value.textContent = 'Timeout';
        });
      } else {
        // Ripristina italiano
        const testTitle = document.querySelector("#testTitle");
        if (testTitle) testTitle.textContent = "Risposte dello studente";

        const correctLabel = document.querySelector('.stat-card.correct .stat-label');
        if (correctLabel) correctLabel.textContent = "Corrette";

        const wrongLabel = document.querySelector('.stat-card.wrong .stat-label');
        if (wrongLabel) wrongLabel.textContent = "Errate";

        const unsureLabel = document.querySelector('.stat-card.unsure .stat-label');
        if (unsureLabel) unsureLabel.textContent = "Insicuro";

        const noIdeaLabel = document.querySelector('.stat-card.no-idea .stat-label');
        if (noIdeaLabel) noIdeaLabel.textContent = "Non ho idea";

        const skippedLabel = document.querySelector('.stat-card.skipped .stat-label');
        if (skippedLabel) skippedLabel.textContent = "Non date";

        const timeoutLabel = document.querySelector('.stat-card.timeout .stat-label');
        if (timeoutLabel) timeoutLabel.textContent = "Tempo esaurito";

        const filterHint = document.querySelector('.filter-hint span');
        if (filterHint) filterHint.textContent = "💡 Clicca sui box per filtrare le risposte";

        const printBtn = document.querySelector('#printBtn');
        if (printBtn) printBtn.innerHTML = "🖨️ Genera PDF";
        
        // Ripristina etichette italiane
        document.querySelectorAll('.answer-header').forEach(header => {
          const text = header.textContent;
          if (text.includes('Question')) {
            header.innerHTML = header.innerHTML.replace('Question', 'Domanda');
          }
        });
        
        document.querySelectorAll('.status-label').forEach(label => {
          const text = label.textContent;
          if (text === 'Given answer:') label.textContent = 'Risposta data:';
          if (text === 'Correct answer:') label.textContent = 'Risposta corretta:';
          if (text === 'Status:') label.textContent = 'Stato:';
        });
        
        document.querySelectorAll('.status-value').forEach(value => {
          const text = value.textContent.trim();
          if (text === 'Correct') value.textContent = 'Corretta';
          if (text === 'Wrong') value.textContent = 'Errata';
          if (text === 'Unsure') value.textContent = 'Insicuro';
          if (text === 'No idea') value.textContent = 'Non ho idea';
          if (text === 'Not answered') value.textContent = 'Non risposta';
          if (text === 'Timeout') value.textContent = 'Tempo esaurito';
        });
      }
    });
  }
});

// SAT Score Report Generation
function generateSATScoreReport(questionsData, studentAnswersMap) {
  // Detect if this is module-based (Simulazioni/Assessment Iniziale) or section-based (Training/Assessment)
  const hasModules = questionsData.some(q => {
    const satSection = q.SAT_section || q.section || "";
    return satSection === 'RW1' || satSection.includes('RW2') || satSection === 'Math1' || satSection === 'MATH1' || satSection.includes('Math2');
  });

  if (hasModules) {
    // Module-based SAT (Simulazioni/Assessment Iniziale) - use existing logic
    generateModuleBasedReport(questionsData, studentAnswersMap);
  } else {
    // Section-based SAT (Training/Assessment) - use simple section scoring
    generateSectionBasedReport(questionsData, studentAnswersMap);
  }
}

// Original module-based report for Simulazioni/Assessment Iniziale
function generateModuleBasedReport(questionsData, studentAnswersMap) {
  // Calculate raw scores by module
  const moduleScores = {
    'RW1': { correct: 0, total: 0 },
    'RW2': { correct: 0, total: 0 },
    'Math1': { correct: 0, total: 0 },
    'Math2': { correct: 0, total: 0 }
  };

  questionsData.forEach(q => {
    const answer = studentAnswersMap[q.id] || "";
    if (answer !== "xx") { // Only count shown questions
      let module = '';
      const satSection = q.SAT_section || q.section || "";

      if (satSection === 'RW1') module = 'RW1';
      else if (satSection.includes('RW2')) module = 'RW2';
      else if (satSection === 'Math1' || satSection === 'MATH1') module = 'Math1';
      else if (satSection.includes('Math2')) module = 'Math2';

      if (module && moduleScores[module]) {
        moduleScores[module].total++;
        if (answer === q.correct_answer) {
          moduleScores[module].correct++;
        }
      }
    }
  });

  // Calculate adaptive scores based on module difficulty
  const rwRawScore = calculateAdaptiveScore(moduleScores.RW1, moduleScores.RW2, 'RW');
  const mathRawScore = calculateAdaptiveScore(moduleScores.Math1, moduleScores.Math2, 'Math');

  // Convert to scaled scores (200-800 each section)
  const rwScaledScore = convertToScaledScore(rwRawScore.total, rwRawScore.max, 'RW', rwRawScore.difficulty);
  const mathScaledScore = convertToScaledScore(mathRawScore.total, mathRawScore.max, 'Math', mathRawScore.difficulty);

  // Open score report in new tab
  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(generateScoreReportHTML({
    studentName: selectedStudentName || 'Student',
    testDate: new Date().toLocaleDateString(),
    totalScore: rwScaledScore + mathScaledScore,
    rwScore: rwScaledScore,
    mathScore: mathScaledScore,
    moduleScores: moduleScores,
    rawScores: { rw: rwRawScore, math: mathRawScore },
    isModuleBased: true
  }));
  reportWindow.document.close();
}

// New section-based report for Training/Assessment
function generateSectionBasedReport(questionsData, studentAnswersMap) {
  // Group by main category (Math or Reading & Writing)
  const sectionScores = {
    'Reading and Writing': { correct: 0, total: 0, subsections: {} },
    'Math': { correct: 0, total: 0, subsections: {} }
  };

  questionsData.forEach(q => {
    const answer = studentAnswersMap[q.id] || "";
    const section = q.section || q.Materia || "";

    // Determine main category
    let mainCategory = '';
    if (section === 'Math' || section.includes('Geometry') || section.includes('Algebra') ||
        section.includes('Problem Solving') || section.includes('Advanced Math')) {
      mainCategory = 'Math';
    } else if (section === 'Reading and Writing' || section.includes('Information and Ideas') ||
               section.includes('Craft and Structure') || section.includes('Expression of Ideas') ||
               section.includes('Standard English')) {
      mainCategory = 'Reading and Writing';
    }

    if (mainCategory && sectionScores[mainCategory]) {
      sectionScores[mainCategory].total++;

      // Track subsection
      if (!sectionScores[mainCategory].subsections[section]) {
        sectionScores[mainCategory].subsections[section] = { correct: 0, total: 0 };
      }
      sectionScores[mainCategory].subsections[section].total++;

      if (answer === q.correct_answer) {
        sectionScores[mainCategory].correct++;
        sectionScores[mainCategory].subsections[section].correct++;
      }
    }
  });

  // Calculate simple percentage-based scores (no adaptive weighting)
  const rwPercentage = sectionScores['Reading and Writing'].total > 0 ?
    sectionScores['Reading and Writing'].correct / sectionScores['Reading and Writing'].total : 0;
  const mathPercentage = sectionScores['Math'].total > 0 ?
    sectionScores['Math'].correct / sectionScores['Math'].total : 0;

  // Convert to 200-800 scale (simple linear conversion)
  const rwScore = Math.round(200 + (rwPercentage * 600));
  const mathScore = Math.round(200 + (mathPercentage * 600));

  // Open score report in new tab
  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(generateSectionScoreReportHTML({
    studentName: selectedStudentName || 'Student',
    testDate: new Date().toLocaleDateString(),
    totalScore: rwScore + mathScore,
    rwScore: rwScore,
    mathScore: mathScore,
    sectionScores: sectionScores,
    isModuleBased: false
  }));
  reportWindow.document.close();
}

function calculateAdaptiveScore(module1, module2, section) {
  const module1Percentage = module1.total > 0 ? (module1.correct / module1.total) : 0;

  // Determine if student took Easy or Hard module 2
  const threshold = section === 'RW' ? 0.70 : 0.65;
  const tookHard = module1Percentage >= threshold;

  // Adaptive scoring: Hard module questions are worth more
  const module2Multiplier = tookHard ? 1.2 : 1.0;

  const totalCorrect = module1.correct + (module2.correct * module2Multiplier);
  const maxPossible = module1.total + (module2.total * module2Multiplier);

  return {
    total: Math.round(totalCorrect),
    max: Math.round(maxPossible),
    difficulty: tookHard ? 'Hard' : 'Easy',
    module1: module1,
    module2: module2
  };
}

function convertToScaledScore(rawScore, maxRaw, section, difficulty) {
  // Simplified conversion - real SAT uses complex equating tables
  const percentage = maxRaw > 0 ? (rawScore / maxRaw) : 0;

  // Difficulty adjustment
  let baseScore = Math.round(percentage * 600) + 200; // 200-800 scale

  // Bonus for taking harder module
  if (difficulty === 'Hard') {
    baseScore += Math.round(percentage * 50); // Up to 50 point bonus
  }

  return Math.min(800, Math.max(200, baseScore));
}


function generateScoreReportHTML(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAT Score Report - ${data.studentName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e8f4f0 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .report-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1c2545 0%, #2a3a5f 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
        }
        .logo {
            width: 50px;
            height: 50px;
        }
        .header h1 { font-size: 2.5rem; margin: 0; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .content { padding: 2rem; }
        .student-info {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        .info-item { text-align: center; }
        .info-label { font-size: 0.9rem; color: #6c757d; margin-bottom: 0.5rem; }
        .info-value { font-size: 1.2rem; font-weight: 600; color: #1c2545; }
        .scores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .score-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .score-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #00a666, #1c2545);
        }
        .score-title { font-size: 1.1rem; color: #6c757d; margin-bottom: 1rem; }
        .score-main { font-size: 3rem; font-weight: 700; color: #1c2545; margin-bottom: 0.5rem; }
        .score-range { font-size: 0.9rem; color: #6c757d; margin-bottom: 1rem; }
        .percentile {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
            font-weight: 600;
        }
        .total-score {
            background: linear-gradient(135deg, #00a666, #1c2545);
            color: white;
            border: none;
        }
        .total-score .score-title { color: rgba(255,255,255,0.9); }
        .total-score .score-main { color: white; }
        .total-score .score-range { color: rgba(255,255,255,0.8); }
        .breakdown {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .methodology {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-left: 4px solid #00a666;
        }
        .methodology h3 {
            color: #1c2545;
            margin-bottom: 1.5rem;
            font-size: 1.3rem;
        }
        .methodology-toggle {
            cursor: pointer;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: color 0.3s ease;
        }
        .methodology-toggle:hover {
            color: #00a666;
        }
        .methodology-arrow {
            transition: transform 0.3s ease;
        }
        .methodology-arrow.rotated {
            transform: rotate(90deg);
        }
        .methodology h4 {
            color: #2c3e50;
            margin: 1rem 0 0.5rem 0;
            font-size: 1.1rem;
        }
        .methodology-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 1.5rem;
        }
        .methodology-section {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .methodology ul, .methodology ol {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
        }
        .methodology li {
            margin-bottom: 0.3rem;
            line-height: 1.4;
        }
        .score-formula {
            background: linear-gradient(135deg, #00a666, #1c2545);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        .score-formula h4 {
            color: white;
            margin-bottom: 0.5rem;
        }
        .formula-box {
            background: rgba(255,255,255,0.1);
            padding: 0.8rem;
            border-radius: 6px;
            border-left: 3px solid rgba(255,255,255,0.3);
        }
        .formula-box p {
            margin: 0.3rem 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        @media (max-width: 768px) {
            .methodology-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
        }
        .breakdown h3 {
            color: #1c2545;
            margin-bottom: 1.5rem;
            font-size: 1.3rem;
        }
        .module-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        .module-card {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #00a666;
        }
        .module-name { font-weight: 600; color: #1c2545; margin-bottom: 0.5rem; }
        .module-score { font-size: 1.5rem; font-weight: 700; color: #00a666; }
        .module-details { font-size: 0.9rem; color: #6c757d; margin-top: 0.5rem; }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            margin: 0.5rem 0;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #16a34a);
            border-radius: 4px;
            transition: width 1s ease;
        }
        .insights {
            background: linear-gradient(135deg, #00a666, #1c2545);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-top: 2rem;
        }
        .insights h3 { margin-bottom: 1rem; }
        .insights ul { padding-left: 1.5rem; }
        .insights li { margin-bottom: 0.5rem; }
        @media print {
            body { background: white; padding: 0; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="logo-section">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMGE2NjYiLz4KPHR4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPlU8L3R4dD4KPC9zdmc+" alt="UpToTen Logo" class="logo">
                <h1>UpToTen SAT Simulation</h1>
            </div>
            <p>Digital SAT • Adaptive Test Results</p>
        </div>

        <div class="content">
            <div class="student-info">
                <div class="info-item">
                    <div class="info-label">Student Name</div>
                    <div class="info-value">${data.studentName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Test Date</div>
                    <div class="info-value">${data.testDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Test Type</div>
                    <div class="info-value">Digital SAT (Adaptive)</div>
                </div>
            </div>

            <div class="scores-grid">
                <div class="score-card total-score">
                    <div class="score-title">Total Score</div>
                    <div class="score-main">${data.totalScore}</div>
                    <div class="score-range">400-1600 Scale</div>
                </div>

                <div class="score-card">
                    <div class="score-title">Reading & Writing</div>
                    <div class="score-main">${data.rwScore}</div>
                    <div class="score-range">200-800 Scale</div>
                </div>

                <div class="score-card">
                    <div class="score-title">Math</div>
                    <div class="score-main">${data.mathScore}</div>
                    <div class="score-range">200-800 Scale</div>
                </div>
            </div>

            <div class="breakdown">
                <h3>📊 Module Performance Breakdown</h3>
                <div class="module-grid">
                    <div class="module-card">
                        <div class="module-name">Reading & Writing Module 1</div>
                        <div class="module-score">${data.moduleScores.RW1.correct}/${data.moduleScores.RW1.total}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.moduleScores.RW1.total > 0 ? (data.moduleScores.RW1.correct/data.moduleScores.RW1.total)*100 : 0}%"></div>
                        </div>
                        <div class="module-details">${Math.round(data.moduleScores.RW1.total > 0 ? (data.moduleScores.RW1.correct/data.moduleScores.RW1.total)*100 : 0)}% Correct</div>
                    </div>

                    <div class="module-card">
                        <div class="module-name">Reading & Writing Module 2 (${data.rawScores.rw.difficulty})</div>
                        <div class="module-score">${data.moduleScores.RW2.correct}/${data.moduleScores.RW2.total}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.moduleScores.RW2.total > 0 ? (data.moduleScores.RW2.correct/data.moduleScores.RW2.total)*100 : 0}%"></div>
                        </div>
                        <div class="module-details">${Math.round(data.moduleScores.RW2.total > 0 ? (data.moduleScores.RW2.correct/data.moduleScores.RW2.total)*100 : 0)}% Correct • ${data.rawScores.rw.difficulty} Level</div>
                    </div>

                    <div class="module-card">
                        <div class="module-name">Math Module 1</div>
                        <div class="module-score">${data.moduleScores.Math1.correct}/${data.moduleScores.Math1.total}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.moduleScores.Math1.total > 0 ? (data.moduleScores.Math1.correct/data.moduleScores.Math1.total)*100 : 0}%"></div>
                        </div>
                        <div class="module-details">${Math.round(data.moduleScores.Math1.total > 0 ? (data.moduleScores.Math1.correct/data.moduleScores.Math1.total)*100 : 0)}% Correct</div>
                    </div>

                    <div class="module-card">
                        <div class="module-name">Math Module 2 (${data.rawScores.math.difficulty})</div>
                        <div class="module-score">${data.moduleScores.Math2.correct}/${data.moduleScores.Math2.total}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.moduleScores.Math2.total > 0 ? (data.moduleScores.Math2.correct/data.moduleScores.Math2.total)*100 : 0}%"></div>
                        </div>
                        <div class="module-details">${Math.round(data.moduleScores.Math2.total > 0 ? (data.moduleScores.Math2.correct/data.moduleScores.Math2.total)*100 : 0)}% Correct • ${data.rawScores.math.difficulty} Level</div>
                    </div>
                </div>
            </div>

            <div class="methodology">
                <h3 class="methodology-toggle" onclick="toggleMethodology()">
                    📚 SAT Scoring Methodology
                    <span class="methodology-arrow" id="methodology-arrow">▶</span>
                </h3>
                <div class="methodology-content" id="methodology-content" style="display: none;">
                <div class="methodology-grid">
                    <div class="methodology-section">
                        <h4>🎯 Question Weighting & Raw Score Calculation</h4>
                        <ul>
                            <li><strong>Correct Answer:</strong> +1 point (no penalty for wrong answers)</li>
                            <li><strong>Wrong Answer:</strong> 0 points (no deduction)</li>
                            <li><strong>No Answer/Skipped:</strong> 0 points</li>
                            <li><strong>Not Shown (Adaptive):</strong> Not counted in total questions</li>
                        </ul>

                        <h4>🔄 Adaptive Module Weighting</h4>
                        <ul>
                            <li><strong>Module 1:</strong> Standard weight (1.0x multiplier)</li>
                            <li><strong>Module 2 - Hard Level:</strong> Enhanced weight (1.2x multiplier)</li>
                            <li><strong>Module 2 - Easy Level:</strong> Standard weight (1.0x multiplier)</li>
                            <li><strong>Threshold for Hard Module:</strong> 70% correct in RW Module 1, 65% in Math Module 1</li>
                        </ul>
                    </div>

                    <div class="methodology-section">
                        <h4>📊 UpToTen Score Simulation Process</h4>
                        <ol>
                            <li><strong>Raw Score:</strong> Total correct answers per section</li>
                            <li><strong>Adaptive Score:</strong> Raw score × estimated difficulty multiplier</li>
                            <li><strong>Simulated Scale:</strong> Converted to approximate 200-800 scale</li>
                            <li><strong>Total Score:</strong> Sum of Reading & Writing + Math (400-1600)</li>
                            <li><strong>Note:</strong> This is UpToTen's simulation, not official SAT methodology</li>
                        </ol>

                        <h4>⚖️ UpToTen Simulation Adjustments</h4>
                        <ul>
                            <li><strong>Difficulty Bonus:</strong> Estimated bonus points for challenging modules</li>
                            <li><strong>Performance Curve:</strong> Simplified scaling approximation</li>
                            <li><strong>Educational Purpose:</strong> Designed for practice and skill assessment</li>
                        </ul>
                    </div>
                </div>

                <div class="score-formula">
                    <h4>🧮 UpToTen Simulation Formula</h4>
                    <div class="formula-box">
                        <p><strong>Adaptive Score = </strong>(Module 1 Correct) + (Module 2 Correct × Estimated Multiplier)</p>
                        <p><strong>Simulated Score = </strong>200 + (Adaptive Score / Max Possible) × 600 + Bonus</p>
                        <p><strong>Total Simulation = </strong>Reading & Writing + Math (Educational Estimate)</p>
                    </div>
                </div>
                </div>
            </div>

            <div class="insights">
                <h3>🎯 Performance Insights</h3>
                <ul>
                    <li><strong>Adaptive Testing:</strong> This score reflects performance on an adaptive test where Module 2 difficulty was determined by Module 1 performance.</li>
                    <li><strong>Reading & Writing:</strong> ${data.rawScores.rw.difficulty === 'Hard' ? 'Qualified for harder module (70%+ on Module 1) - questions worth 20% more' : 'Took easier module based on Module 1 performance'}</li>
                    <li><strong>Math:</strong> ${data.rawScores.math.difficulty === 'Hard' ? 'Qualified for harder module (65%+ on Module 1) - questions worth 20% more' : 'Took easier module based on Module 1 performance'}</li>
                    <li><strong>Educational Simulation:</strong> This score reflects your performance on our adaptive practice test. Use it to identify strengths and areas for improvement. Only official SAT tests provide College Board scores.</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        function toggleMethodology() {
            const content = document.getElementById('methodology-content');
            const arrow = document.getElementById('methodology-arrow');

            if (content.style.display === 'none') {
                content.style.display = 'block';
                arrow.textContent = '▼';
                arrow.classList.add('rotated');
            } else {
                content.style.display = 'none';
                arrow.textContent = '▶';
                arrow.classList.remove('rotated');
            }
        }
    </script>
</body>
</html>`;
}

// Generate section-based score report HTML for SAT Training/Assessment
function generateSectionScoreReportHTML(data) {
  // Build subsection cards HTML
  let subsectionHTML = '';

  // Add Reading & Writing subsections
  if (data.sectionScores['Reading and Writing'].total > 0) {
    Object.entries(data.sectionScores['Reading and Writing'].subsections).forEach(([name, scores]) => {
      const percentage = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
      subsectionHTML += `
        <div class="module-card">
          <div class="module-name">${name}</div>
          <div class="module-score">${scores.correct}/${scores.total}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="module-details">${percentage}% Correct</div>
        </div>
      `;
    });
  }

  // Add Math subsections
  if (data.sectionScores['Math'].total > 0) {
    Object.entries(data.sectionScores['Math'].subsections).forEach(([name, scores]) => {
      const percentage = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
      subsectionHTML += `
        <div class="module-card">
          <div class="module-name">${name}</div>
          <div class="module-score">${scores.correct}/${scores.total}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="module-details">${percentage}% Correct</div>
        </div>
      `;
    });
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAT Score Report - ${data.studentName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e8f4f0 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .report-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1c2545 0%, #2a3a5f 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
        }
        .logo { width: 50px; height: 50px; }
        .header h1 { font-size: 2.5rem; margin: 0; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .content { padding: 2rem; }
        .student-info {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        .info-item { text-align: center; }
        .info-label { font-size: 0.9rem; color: #6c757d; margin-bottom: 0.5rem; }
        .info-value { font-size: 1.2rem; font-weight: 600; color: #1c2545; }
        .scores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .score-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .score-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #00a666, #1c2545);
        }
        .score-title { font-size: 1.1rem; color: #6c757d; margin-bottom: 1rem; }
        .score-main { font-size: 3rem; font-weight: 700; color: #1c2545; margin-bottom: 0.5rem; }
        .score-range { font-size: 0.9rem; color: #6c757d; margin-bottom: 1rem; }
        .total-score {
            background: linear-gradient(135deg, #00a666, #1c2545);
            color: white;
            border: none;
        }
        .total-score .score-title { color: rgba(255,255,255,0.9); }
        .total-score .score-main { color: white; }
        .total-score .score-range { color: rgba(255,255,255,0.8); }
        .breakdown {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .breakdown h3 {
            color: #1c2545;
            margin-bottom: 1.5rem;
            font-size: 1.3rem;
        }
        .module-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        .module-card {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #00a666;
        }
        .module-name { font-weight: 600; color: #1c2545; margin-bottom: 0.5rem; }
        .module-score { font-size: 1.5rem; font-weight: 700; color: #00a666; }
        .module-details { font-size: 0.9rem; color: #6c757d; margin-top: 0.5rem; }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            margin: 0.5rem 0;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #16a34a);
            border-radius: 4px;
            transition: width 1s ease;
        }
        .insights {
            background: linear-gradient(135deg, #00a666, #1c2545);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-top: 2rem;
        }
        .insights h3 { margin-bottom: 1rem; }
        .insights ul { padding-left: 1.5rem; }
        .insights li { margin-bottom: 0.5rem; }
        @media print {
            body { background: white; padding: 0; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="logo-section">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMGE2NjYiLz4KPHR4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPlU8L3R4dD4KPC9zdmc+" alt="UpToTen Logo" class="logo">
                <h1>UpToTen SAT Practice</h1>
            </div>
            <p>Digital SAT • Practice Test Results</p>
        </div>

        <div class="content">
            <div class="student-info">
                <div class="info-item">
                    <div class="info-label">Student Name</div>
                    <div class="info-value">${data.studentName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Test Date</div>
                    <div class="info-value">${data.testDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Test Type</div>
                    <div class="info-value">SAT Practice</div>
                </div>
            </div>

            <div class="scores-grid">
                <div class="score-card total-score">
                    <div class="score-title">Total Score</div>
                    <div class="score-main">${data.totalScore}</div>
                    <div class="score-range">400-1600 Scale</div>
                </div>

                <div class="score-card">
                    <div class="score-title">Reading & Writing</div>
                    <div class="score-main">${data.rwScore}</div>
                    <div class="score-range">200-800 Scale</div>
                </div>

                <div class="score-card">
                    <div class="score-title">Math</div>
                    <div class="score-main">${data.mathScore}</div>
                    <div class="score-range">200-800 Scale</div>
                </div>
            </div>

            <div class="breakdown">
                <h3>📊 Section Performance Breakdown</h3>
                <div class="module-grid">
                    ${subsectionHTML}
                </div>
            </div>

            <div class="insights">
                <h3>🎯 Performance Insights</h3>
                <ul>
                    <li><strong>Practice Test:</strong> This is a practice test score based on linear scoring (not adaptive).</li>
                    <li><strong>Score Calculation:</strong> Simple percentage-based conversion to SAT scale (200-800 per section).</li>
                    <li><strong>Reading & Writing:</strong> ${data.sectionScores['Reading and Writing'].correct}/${data.sectionScores['Reading and Writing'].total} correct (${Math.round((data.sectionScores['Reading and Writing'].correct / data.sectionScores['Reading and Writing'].total) * 100)}%)</li>
                    <li><strong>Math:</strong> ${data.sectionScores['Math'].correct}/${data.sectionScores['Math'].total} correct (${Math.round((data.sectionScores['Math'].correct / data.sectionScores['Math'].total) * 100)}%)</li>
                    <li><strong>Educational Purpose:</strong> Use this score to identify strengths and areas for improvement. Only official SAT tests provide College Board scores.</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// ============================================================================
// GMAT FOCUS EDITION SCORING SYSTEM
// ============================================================================
// Based on official GMAT Focus Edition methodology (2024-2025)
// Research sources: mba.com, e-gmat.com, targettestprep.com
// ============================================================================

/**
 * GMAT Focus Edition Scoring Methodology:
 *
 * 1. Section Scores: 60-90 for Quantitative, Verbal, and Data Insights
 * 2. Total Score: 205-805 (increments ending in 5)
 * 3. Formula: Total = (Q + V + DI - 180) × (20/3) + 205, rounded to nearest 5 ending in 5
 * 4. Scoring factors: Number correct, difficulty of questions, adaptive performance
 *
 * Our Implementation:
 * - Uses difficulty-weighted scoring (Easy: 0.8x, Medium: 1.0x, Hard: 1.3x)
 * - Maps weighted performance to 60-90 scale
 * - Applies official formula for total score calculation
 */

function calculateGMATSectionScore(correctCount, totalCount, questionDifficulties) {
  if (totalCount === 0) return 60; // Minimum score

  // Calculate difficulty-weighted score
  let weightedCorrect = 0;
  let weightedTotal = 0;

  questionDifficulties.forEach((difficulty, index) => {
    let weight = 1.0; // Default medium
    if (difficulty === 'Easy') weight = 0.8;
    else if (difficulty === 'Hard') weight = 1.3;

    weightedTotal += weight;
    if (index < correctCount) {
      weightedCorrect += weight;
    }
  });

  const weightedPercentage = weightedTotal > 0 ? weightedCorrect / weightedTotal : 0;

  // Map to 60-90 scale using sigmoid curve for realistic distribution
  // This creates a curve where:
  // - 50% correct ≈ 72-75 (median)
  // - 70% correct ≈ 80-82 (good)
  // - 85%+ correct ≈ 85-90 (excellent)
  // - Below 30% ≈ 60-65 (low)

  const baseScore = 60 + (30 * (1 / (1 + Math.exp(-8 * (weightedPercentage - 0.5)))));

  // Add slight adjustment based on raw percentage for balance
  const rawBonus = (correctCount / totalCount) * 3;

  const finalScore = Math.round(baseScore + rawBonus);

  // Clamp to 60-90 range
  return Math.max(60, Math.min(90, finalScore));
}

function calculateGMATTotalScore(quantScore, verbalScore, dataInsightsScore) {
  // Official GMAT Focus formula: (Q + V + DI - 180) × (20/3) + 205
  const rawTotal = (quantScore + verbalScore + dataInsightsScore - 180) * (20/3) + 205;

  // Round to nearest 5 that ends in 5 (205, 215, 225, ...)
  let rounded = Math.round(rawTotal / 10) * 10;
  if (rounded % 10 === 0) {
    rounded += 5;
  }

  // Ensure it ends in 5
  if (rounded % 10 !== 5) {
    rounded = Math.round(rounded / 10) * 10 + 5;
  }

  // Clamp to valid range
  return Math.max(205, Math.min(805, rounded));
}

function getGMATPercentile(score, section = 'total') {
  // Percentile data based on GMAC official data (2019-2024)
  // Source: mba.com, targettestprep.com, e-gmat.com

  const percentiles = {
    total: {
      805: 100, 795: 100, 785: 99, 775: 99, 765: 99, 755: 99, 745: 99, 735: 99, 725: 99, 715: 99,
      705: 98, 695: 97, 685: 96, 675: 95, 665: 94, 655: 93, 645: 89, 635: 87, 625: 84, 615: 81,
      605: 77, 595: 73, 585: 69, 575: 65, 565: 60, 555: 55, 545: 50, 535: 45, 525: 40, 515: 35,
      505: 30, 495: 26, 485: 22, 475: 18, 465: 15, 455: 12, 445: 10, 435: 8, 425: 6, 415: 5,
      405: 4, 395: 3, 385: 2, 375: 2, 365: 1, 355: 1, 345: 1, 335: 1, 325: 1, 315: 1, 305: 0, 295: 0,
      285: 0, 275: 0, 265: 0, 255: 0, 245: 0, 235: 0, 225: 0, 215: 0, 205: 0
    },
    quant: {
      90: 100, 89: 97, 88: 94, 87: 94, 86: 91, 85: 88, 84: 85, 83: 82, 82: 79, 81: 75,
      80: 64, 79: 60, 78: 56, 77: 52, 76: 48, 75: 44, 74: 39, 73: 35, 72: 31, 71: 27,
      70: 13, 69: 11, 68: 9, 67: 7, 66: 6, 65: 5, 64: 4, 63: 3, 62: 2, 61: 1, 60: 1
    },
    verbal: {
      90: 100, 89: 100, 88: 99, 87: 98, 86: 97, 85: 96, 84: 94, 83: 92, 82: 90, 81: 87,
      80: 56, 79: 51, 78: 46, 77: 41, 76: 36, 75: 31, 74: 26, 73: 21, 72: 17, 71: 13,
      70: 4, 69: 3, 68: 2, 67: 2, 66: 1, 65: 1, 64: 1, 63: 1, 62: 1, 61: 1, 60: 1
    },
    dataInsights: {
      90: 100, 89: 100, 88: 99, 87: 98, 86: 96, 85: 94, 84: 92, 83: 89, 82: 87, 81: 85,
      80: 83, 79: 80, 78: 77, 77: 73, 76: 69, 75: 65, 74: 60, 73: 55, 72: 49, 71: 43,
      70: 21, 69: 18, 68: 15, 67: 12, 66: 10, 65: 8, 64: 7, 63: 6, 62: 5, 61: 4, 60: 4
    }
  };

  const table = percentiles[section.toLowerCase()] || percentiles.total;

  // Find closest score in table
  let closestScore = score;
  if (!table[score]) {
    const scores = Object.keys(table).map(Number).sort((a, b) => b - a);
    closestScore = scores.reduce((prev, curr) => {
      return Math.abs(curr - score) < Math.abs(prev - score) ? curr : prev;
    });
  }

  return table[closestScore] || 0;
}

function generateGMATScoreReport(questionsData, studentAnswersMap) {
  // Organize questions by section with difficulty tracking
  const sectionData = {
    'Quantitative Reasoning': { questions: [], difficulties: [] },
    'Verbal Reasoning': { questions: [], difficulties: [] },
    'Data Insights': { questions: [], difficulties: [] }
  };

  // Process each question
  questionsData.forEach(q => {
    const section = q.GMAT_section;
    if (!sectionData[section]) return;

    const studentAnswer = studentAnswersMap[q.id];
    const difficulty = q.GMAT_question_difficulty || 'Medium';

    let isCorrect = false;

    // Check if answer is correct (handle DI questions specially)
    if (q.di_question_type && studentAnswer) {
      try {
        let questionData = q.di_question_data;
        if (typeof questionData === 'string') {
          questionData = JSON.parse(questionData);
        }

        if (q.di_question_type === 'GI') {
          const studentObj = typeof studentAnswer === 'string' ? JSON.parse(studentAnswer) : studentAnswer;
          isCorrect = studentObj.blank1 === questionData.blank1_correct &&
                      studentObj.blank2 === questionData.blank2_correct;
        } else {
          let correctAnswer = null;
          if (q.di_question_type === 'DS') {
            correctAnswer = questionData.correct_answer || q.correct_answer;
          } else if (q.di_question_type === 'TA') {
            correctAnswer = questionData.correct_answer || q.correct_answer;
          } else if (q.di_question_type === 'TPA') {
            correctAnswer = questionData.correct_answers || q.correct_answer;
          } else if (q.di_question_type === 'MSR') {
            correctAnswer = {};
            if (questionData.questions) {
              questionData.questions.forEach((subQ, idx) => {
                if (subQ.question_type === 'multiple_choice' && subQ.correct_answer) {
                  correctAnswer[`q${idx}`] = subQ.correct_answer;
                } else if (subQ.question_type === 'two_column' && subQ.correct_answers) {
                  correctAnswer[`q${idx}`] = subQ.correct_answers;
                }
              });
            }
          }

          if (correctAnswer && window.isDIAnswerCorrect) {
            isCorrect = window.isDIAnswerCorrect(studentAnswer, correctAnswer);
          }
        }
      } catch (e) {
        isCorrect = false;
      }
    } else {
      // Regular question
      isCorrect = studentAnswer === q.correct_answer;
    }

    sectionData[section].questions.push({
      isCorrect,
      difficulty,
      questionNumber: q.question_number,
      id: q.id
    });
    sectionData[section].difficulties.push(difficulty);
  });

  // Calculate section scores
  const scores = {};
  Object.entries(sectionData).forEach(([section, data]) => {
    const correctCount = data.questions.filter(q => q.isCorrect).length;
    const totalCount = data.questions.length;
    const sectionScore = calculateGMATSectionScore(correctCount, totalCount, data.difficulties);

    scores[section] = {
      score: sectionScore,
      correct: correctCount,
      total: totalCount,
      percentage: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
      percentile: getGMATPercentile(sectionScore, section.split(' ')[0])
    };
  });

  // Calculate total score
  const totalScore = calculateGMATTotalScore(
    scores['Quantitative Reasoning'].score,
    scores['Verbal Reasoning'].score,
    scores['Data Insights'].score
  );

  const totalPercentile = getGMATPercentile(totalScore, 'total');

  // Generate HTML report
  generateGMATScoreReportHTML({
    totalScore,
    totalPercentile,
    quantScore: scores['Quantitative Reasoning'],
    verbalScore: scores['Verbal Reasoning'],
    dataInsightsScore: scores['Data Insights']
  });
}

function generateGMATScoreReportHTML(data) {
  const reportWindow = window.open('', '_blank');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GMAT Focus Edition Score Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            min-height: 100vh;
        }

        .report-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 800;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .total-score-section {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
        }

        .total-score {
            font-size: 5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            text-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .total-score-label {
            font-size: 1.3rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            opacity: 0.95;
            margin-bottom: 1rem;
        }

        .percentile-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 0.75rem 2rem;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: 600;
            backdrop-filter: blur(10px);
        }

        .score-range-indicator {
            margin-top: 1.5rem;
            font-size: 0.95rem;
            opacity: 0.85;
        }

        .content {
            padding: 2.5rem;
        }

        .section {
            margin-bottom: 2.5rem;
        }

        .section-title {
            font-size: 1.8rem;
            color: #1a1a2e;
            margin-bottom: 1.5rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .section-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .section-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 3px solid transparent;
        }

        .section-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .section-card.quant {
            border-color: #3b82f6;
        }

        .section-card.verbal {
            border-color: #8b5cf6;
        }

        .section-card.data-insights {
            border-color: #0ea5e9;
        }

        .section-card-title {
            font-size: 1rem;
            color: #6b7280;
            margin-bottom: 1rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .section-score-number {
            font-size: 3.5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .section-card.quant .section-score-number {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .section-card.verbal .section-score-number {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .section-card.data-insights .section-score-number {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .section-percentile {
            font-size: 1.1rem;
            color: #374151;
            margin-bottom: 0.75rem;
            font-weight: 600;
        }

        .section-details {
            font-size: 0.95rem;
            color: #6b7280;
            margin-top: 0.5rem;
        }

        .insights {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 16px;
            padding: 2rem;
            border-left: 6px solid #f59e0b;
        }

        .insights h3 {
            color: #92400e;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }

        .insights ul {
            list-style: none;
            padding: 0;
        }

        .insights li {
            padding: 0.75rem 0;
            color: #78350f;
            font-size: 1rem;
            line-height: 1.6;
            display: flex;
            align-items: start;
            gap: 0.75rem;
        }

        .insights li::before {
            content: '📊';
            flex-shrink: 0;
        }

        .methodology {
            background: #f8f9fa;
            border-radius: 16px;
            padding: 2rem;
            margin-top: 2rem;
            border: 2px solid #e5e7eb;
        }

        .methodology h3 {
            color: #1a1a2e;
            font-size: 1.4rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }

        .methodology h4 {
            color: #374151;
            font-size: 1.1rem;
            margin: 1.5rem 0 0.75rem 0;
            font-weight: 600;
        }

        .methodology p, .methodology li {
            color: #6b7280;
            line-height: 1.8;
            margin-bottom: 0.75rem;
        }

        .methodology ul, .methodology ol {
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }

        .footer {
            text-align: center;
            padding: 2rem;
            background: #f8f9fa;
            color: #6b7280;
            font-size: 0.9rem;
        }

        .print-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 1rem 2.5rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            margin: 2rem auto;
            display: block;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }

        .print-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .print-btn {
                display: none;
            }

            .report-container {
                box-shadow: none;
            }
        }

        @media (max-width: 768px) {
            .section-cards {
                grid-template-columns: 1fr;
            }

            .total-score {
                font-size: 3.5rem;
            }

            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>🎯 GMAT Focus Edition</h1>
            <p>Official Score Report</p>
        </div>

        <div class="total-score-section">
            <div class="total-score-label">Total Score</div>
            <div class="total-score">${data.totalScore}</div>
            <div class="score-range-indicator">
                Score Range: 205-805 | Median: 545
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h2 class="section-title">📈 Section Scores</h2>
                <div class="section-cards">
                    <div class="section-card quant">
                        <div class="section-card-title">Quantitative</div>
                        <div class="section-score-number">${data.quantScore.score}</div>
                        <div class="section-details">
                            ${data.quantScore.correct}/${data.quantScore.total} Correct (${data.quantScore.percentage}%)
                        </div>
                    </div>

                    <div class="section-card verbal">
                        <div class="section-card-title">Verbal</div>
                        <div class="section-score-number">${data.verbalScore.score}</div>
                        <div class="section-details">
                            ${data.verbalScore.correct}/${data.verbalScore.total} Correct (${data.verbalScore.percentage}%)
                        </div>
                    </div>

                    <div class="section-card data-insights">
                        <div class="section-card-title">Data Insights</div>
                        <div class="section-score-number">${data.dataInsightsScore.score}</div>
                        <div class="section-details">
                            ${data.dataInsightsScore.correct}/${data.dataInsightsScore.total} Correct (${data.dataInsightsScore.percentage}%)
                        </div>
                    </div>
                </div>
            </div>

            <div class="insights">
                <h3>🎯 Performance Insights</h3>
                <ul>
                    <li><strong>Total Score:</strong> ${data.totalScore} out of 805</li>
                    <li><strong>Quantitative Reasoning:</strong> Score of ${data.quantScore.score} - ${data.quantScore.percentage}% questions answered correctly with difficulty weighting applied.</li>
                    <li><strong>Verbal Reasoning:</strong> Score of ${data.verbalScore.score} - ${data.verbalScore.percentage}% questions answered correctly with difficulty weighting applied.</li>
                    <li><strong>Data Insights:</strong> Score of ${data.dataInsightsScore.score} - ${data.dataInsightsScore.percentage}% questions answered correctly with difficulty weighting applied.</li>
                    <li><strong>Score Calculation:</strong> Your total score is calculated using the official GMAT Focus formula where all three sections contribute equally.</li>
                </ul>
            </div>

            <div class="methodology">
                <h3>📊 Scoring Methodology</h3>

                <h4>GMAT Focus Edition Score Scale</h4>
                <ul>
                    <li><strong>Total Score Range:</strong> 205-805 (increments ending in 5)</li>
                    <li><strong>Section Score Range:</strong> 60-90 for each section</li>
                    <li><strong>Number of Questions:</strong> Quantitative (21), Verbal (23), Data Insights (20)</li>
                </ul>

                <h4>Score Calculation Method</h4>
                <ol>
                    <li><strong>Difficulty Weighting:</strong> Questions are weighted by difficulty (Easy: 0.8x, Medium: 1.0x, Hard: 1.3x)</li>
                    <li><strong>Section Scoring:</strong> Weighted performance mapped to 60-90 scale</li>
                    <li><strong>Total Score Formula:</strong> (Quant + Verbal + Data Insights - 180) × (20/3) + 205</li>
                    <li><strong>Equal Weighting:</strong> All three sections contribute equally to your total score</li>
                </ol>

                <h4>⚖️ About This Simulation</h4>
                <p>This score report uses UpToTen's simulation of the GMAT Focus Edition scoring system based on official GMAC methodology. The scoring algorithm incorporates:</p>
                <ul>
                    <li>Difficulty-adjusted performance measurement</li>
                    <li>Official total score conversion formula</li>
                    <li>Section score distributions matching official GMAT patterns</li>
                </ul>
                <p><strong>Note:</strong> This is an educational simulation. Only official GMAT tests administered by GMAC provide scores for business school applications.</p>
            </div>

            <button class="print-btn" onclick="window.print()">🖨️ Print Score Report</button>
        </div>

        <div class="footer">
            <p>Generated with UpToTen GMAT Preparation System</p>
            <p>Based on GMAT Focus Edition methodology</p>
        </div>
    </div>
</body>
</html>
  `;

  reportWindow.document.write(htmlContent);
  reportWindow.document.close();
}

loadTestAnswers();