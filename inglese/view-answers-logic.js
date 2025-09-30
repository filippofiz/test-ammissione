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

console.log("Student ID:", selectedStudentId);
console.log("Student Name:", selectedStudentName);
console.log("Section:", selectedSection);
console.log("Tipologia Esercizi:", selectedTipologiaEsercizi);
console.log("Progressivo:", selectedProgressivo);
console.log("Test Type:", selectedTestType);

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
    console.log("🔍 DEBUG: Starting loadTestAnswers");
    console.log("🔍 DEBUG: Query parameters:", {
      questionsTable,
      selectedSection,
      selectedTipologiaEsercizi, 
      selectedProgressivo,
      selectedTestType,
      selectedStudentId
    });
    
    console.log("🔍 DEBUG: EXACT QUERY FILTERS FOR QUESTIONS TABLE:");
    console.log("  - Table:", questionsTable);
    console.log("  - section =", selectedSection);
    console.log("  - tipologia_esercizi =", selectedTipologiaEsercizi);
    console.log("  - progressivo =", selectedProgressivo);
    console.log("  - tipologia_test =", selectedTestType);

    // 1. Fetch domande per il test selezionato
    let query = supabase.from(questionsTable).select("*");

    if (selectedTestType === "SAT PDF" && selectedSection === "Assessment Iniziale") {
      // For SAT, use Materia field instead of section
      console.log("  - Using Materia field for SAT PDF");
      query = query
        .eq("Materia", selectedSection)
        .eq("tipologia_esercizi", selectedTipologiaEsercizi)
        .eq("progressivo", selectedProgressivo)
        .eq("tipologia_test", selectedTestType);
    } else {
      // Regular query for non-SAT tests
      query = query
        .eq("section", selectedSection)
        .eq("tipologia_esercizi", selectedTipologiaEsercizi)
        .eq("progressivo", selectedProgressivo)
        .eq("tipologia_test", selectedTestType);
    }

    const { data: questionsData, error: questionsError } = await query.order("question_number");
      
    if (questionsError) {
      console.error("Errore nel recupero delle domande:", questionsError.message);
      alert("Errore nel recupero delle domande.");
      return;
    }
    
    if (!questionsData || questionsData.length === 0) {
      alert("Nessuna domanda trovata per questo test.");
      return;
    }

    console.log("🔍 DEBUG: Questions fetched:", questionsData.length);
    console.log("🔍 DEBUG: First few question IDs:", questionsData.slice(0, 5).map(q => q.id));
    
    // Check which PDFs these questions come from
    const pdfCounts = {};
    questionsData.forEach(q => {
      const pdfUrl = q.pdf_url_eng || q.pdf_url || 'NO_PDF';
      pdfCounts[pdfUrl] = (pdfCounts[pdfUrl] || 0) + 1;
    });
    
    console.log("🔍 DEBUG: Questions by PDF:", pdfCounts);
    console.log("🔍 DEBUG: Number of different PDFs:", Object.keys(pdfCounts).length);
    
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
      // Carica inizialmente il PDF italiano
      document.getElementById("pdfFrame").src = uniquePdfUrlsIt[0] || uniquePdfUrlsEn[0];
      document.getElementById("pdfPanel").style.display = "flex";
      
      // Se non c'è PDF inglese, disabilita il toggle
      const englishToggle = document.getElementById("englishCorrectionToggle");
      if (!window.englishPdfUrl) {
        englishToggle.disabled = true;
        document.querySelector(".toggle-label").textContent = "🇬🇧 PDF Inglese non disponibile";
        document.querySelector(".language-toggle-correction").style.opacity = "0.5";
      }
    } else {
      // Nascondi pannello PDF e espandi risposte
      document.getElementById("pdfPanel").style.display = "none";
      document.getElementById("answersPanel").classList.add("expanded");
    }

    // 3. Array di ID domande
    const questionIds = questionsData.map(q => q.id);
    console.log("🔍 DEBUG: Question IDs array length:", questionIds.length);
    console.log("🔍 DEBUG: Using answersTable:", answersTable);

    // 4. Fetch risposte dello studente
    console.log("🔍 DEBUG: Fetching answers with query:", {
      table: answersTable,
      questionIds: questionIds.slice(0, 5) + " (...and " + (questionIds.length - 5) + " more)",
      selectedStudentId
    });
    
    const { data: answersData, error: answersError } = await supabase
      .from(answersTable)
      .select("*")
      .in("question_id", questionIds)
      .eq("auth_uid", selectedStudentId);
      
    if (answersError) {
      console.error("Errore nel recupero delle risposte:", answersError.message);
      alert("Errore nel recupero delle risposte.");
      return;
    }
    
    console.log("🔍 DEBUG: Answers fetched:", answersData ? answersData.length : 0);
    console.log("🔍 DEBUG: First few answers:", answersData ? answersData.slice(0, 10) : []);
    
    // Check which PDF the student's answers correspond to
    if (answersData && answersData.length > 0) {
      const answeredQuestionIds = new Set(answersData.map(a => a.question_id));
      const questionsWithAnswers = questionsData.filter(q => answeredQuestionIds.has(q.id));
      
      const answeredPdfCounts = {};
      questionsWithAnswers.forEach(q => {
        const pdfUrl = q.pdf_url_eng || q.pdf_url || 'NO_PDF';
        answeredPdfCounts[pdfUrl] = (answeredPdfCounts[pdfUrl] || 0) + 1;
      });
      
      console.log("🔍 DEBUG: Student answered questions from these PDFs:", answeredPdfCounts);
      
      // Check for mixing - if student has answers from multiple PDFs
      const pdfWithAnswers = Object.keys(answeredPdfCounts);
      if (pdfWithAnswers.length > 1) {
        console.log("🚨 WARNING: MIXING DETECTED! Student has answers from multiple PDFs:");
        pdfWithAnswers.forEach(pdf => {
          console.log(`   - ${pdf}: ${answeredPdfCounts[pdf]} answers`);
        });
        
        // Show which specific questions come from which PDF
        console.log("🔍 DEBUG: Detailed breakdown by question:");
        questionsWithAnswers.forEach(q => {
          const pdfUrl = q.pdf_url_eng || q.pdf_url || 'NO_PDF';
          const shortPdf = pdfUrl.split('_').pop(); // Get just the timestamp part
          console.log(`   Question ${q.question_number}: ${q.id} from ${shortPdf}`);
        });
      } else {
        console.log("✅ No mixing detected - all answers from single PDF");
      }
      
      // Find the PDF that the student actually used (should have the most answers)
      const actualPdf = Object.entries(answeredPdfCounts)
        .sort(([,a], [,b]) => b - a) // Sort by count descending
        [0]?.[0]; // Get the PDF with most answers
      console.log("🔍 DEBUG: Student's actual PDF appears to be:", actualPdf);
      
      if (actualPdf) {
        console.log("🔍 DEBUG: Re-fetching questions filtered by student's actual PDF...");
        
        // Re-fetch questions filtered by the student's actual PDF
        const { data: filteredQuestionsData, error: filteredQuestionsError } = await supabase
          .from(questionsTable)
          .select("*")
          .eq("section", selectedSection)
          .eq("tipologia_esercizi", selectedTipologiaEsercizi)
          .eq("progressivo", selectedProgressivo)
          .eq("tipologia_test", selectedTestType)
          .eq("pdf_url_eng", actualPdf)
          .order("question_number");
          
        if (filteredQuestionsError) {
          console.error("Error re-fetching filtered questions:", filteredQuestionsError);
        } else if (filteredQuestionsData && filteredQuestionsData.length > 0) {
          console.log("🔍 DEBUG: Filtered questions count:", filteredQuestionsData.length);
          // Replace the original questions data with the filtered data
          questionsData.splice(0, questionsData.length, ...filteredQuestionsData);
          totalQuestions = questionsData.length;
          console.log("✅ DEBUG: Using filtered questions data, new count:", totalQuestions);
        }
      }
    }
    
    // Check for duplicates
    if (answersData && answersData.length > 0) {
      const answersByQuestionId = {};
      answersData.forEach(ans => {
        if (!answersByQuestionId[ans.question_id]) {
          answersByQuestionId[ans.question_id] = [];
        }
        answersByQuestionId[ans.question_id].push(ans);
      });
      
      const duplicates = Object.entries(answersByQuestionId).filter(([qId, answers]) => answers.length > 1);
      if (duplicates.length > 0) {
        console.log("🚨 DEBUG: DUPLICATE ANSWERS FOUND:", duplicates.length, "questions have multiple answers");
        duplicates.forEach(([qId, answers]) => {
          console.log(`   Question ${qId} has ${answers.length} answers:`, answers);
        });
      } else {
        console.log("✅ DEBUG: No duplicate answers found");
      }
    }

    // ✅ DEDUPLICATE questions - prioritize questions that student actually answered
    const answeredQuestionIds = new Set(answersData ? answersData.map(a => a.question_id) : []);
    const uniqueQuestionsMap = new Map();
    let duplicatesRemoved = 0;

    questionsData.forEach(q => {
      const key = `${q.question_number}-${q.page_number}`;

      if (!uniqueQuestionsMap.has(key)) {
        // First occurrence - keep it
        uniqueQuestionsMap.set(key, q);
      } else {
        // Duplicate found
        duplicatesRemoved++;
        const existingQuestion = uniqueQuestionsMap.get(key);

        // ALWAYS prefer the question that was answered
        const currentHasAnswer = answeredQuestionIds.has(q.id);
        const existingHasAnswer = answeredQuestionIds.has(existingQuestion.id);

        if (currentHasAnswer && !existingHasAnswer) {
          // Current duplicate has answer, existing doesn't - REPLACE
          console.log(`⚠️ Replacing duplicate Q${q.question_number} (ID ${existingQuestion.id} → ${q.id}) because student answered ${q.id}`);
          uniqueQuestionsMap.set(key, q);
        } else if (!currentHasAnswer && existingHasAnswer) {
          // Existing has answer, current doesn't - KEEP existing (do nothing)
          console.warn(`⚠️ Duplicate removed: Question ${q.question_number} on page ${q.page_number} (ID: ${q.id}) - keeping answered version`);
        } else {
          // Both answered or both not answered - keep first occurrence
          console.warn(`⚠️ Duplicate removed: Question ${q.question_number} on page ${q.page_number} (ID: ${q.id})`);
        }
      }
    });

    // Replace questionsData with deduplicated version
    questionsData.splice(0, questionsData.length, ...Array.from(uniqueQuestionsMap.values()));
    totalQuestions = questionsData.length;

    if (duplicatesRemoved > 0) {
      console.warn(`⚠️ ${duplicatesRemoved} duplicate question(s) removed from tutor view`);
      console.log(`✅ Unique questions to display: ${questionsData.length}`);
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
    
    // 7. Trigger MathJax
    if (window.MathJax) {
      MathJax.typesetPromise().catch(err => console.error("MathJax error:", err));
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

  // Check if this is a SAT test
  const isSATTest = selectedTestType === "SAT PDF";

  // For SAT, separate shown questions from non-shown modules
  let shownQuestions = [];
  let notShownQuestions = [];

  if (isSATTest) {
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
            console.log(`📍 Placed Q${qNum} in RW1 by number (section was: ${satSection})`);
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
            console.log(`📍 Placed Q${qNum} in RW2 by number (section was: ${satSection})`);
          } else if (qNum >= 55 && qNum <= 76) {
            moduleQuestions['Math1'].push(q);
            console.log(`📍 Placed Q${qNum} in Math1 by number (section was: ${satSection})`);
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
            console.log(`📍 Placed Q${qNum} in Math2 by number (section was: ${satSection})`);
          }
        }
      }
    });

    // Debug: Show module counts
    console.log("📊 Module question counts:");
    Object.entries(moduleQuestions).forEach(([key, questions]) => {
      if (questions.length > 0) {
        console.log(`  ${key}: ${questions.length} questions`);
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
  } else {
    // For non-SAT tests, display all questions normally
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

    // Verifica correttezza
    const isCorrect = studentAnswerRaw === q.correct_answer;

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

    header.innerHTML = `
      <span>Question ${questionNumber}</span>
      ${mark}
    `;
    questionDiv.appendChild(header);

    // Testo domanda (solo se non PDF)
    if (!usePDF && q.question) {
      const qText = document.createElement("div");
      qText.classList.add("question-text");
      qText.innerHTML = q.question;
      questionDiv.appendChild(qText);
    }

    // Immagine se presente
    if (q.image_url) {
      const img = document.createElement("img");
      img.src = q.image_url;
      img.alt = "Immagine della domanda";
      img.classList.add("question-image");
      questionDiv.appendChild(img);
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

    // Altre risposte possibili (solo se non PDF)
    if (!usePDF) {
      let allChoices = [q.correct_answer, q.wrong_1, q.wrong_2, q.wrong_3, q.wrong_4]
        .filter(choice => choice); // Rimuovi valori null/undefined
      allChoices = [...new Set(allChoices)]; // Rimuovi duplicati

      const otherChoices = allChoices.filter(choice =>
        choice !== q.correct_answer && choice !== studentAnswerRaw
      );

      if (otherChoices.length > 0) {
        const otherDiv = document.createElement("div");
        otherDiv.classList.add("other-choices");
        otherDiv.innerHTML = `<strong>Altre opzioni:</strong> ${otherChoices.join(", ")}`;
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
        console.log("📄 Switched to English PDF:", window.englishPdfUrl);
      } else if (!isEnglish && window.italianPdfUrl) {
        pdfFrame.src = window.italianPdfUrl;
        console.log("📄 Switched to Italian PDF:", window.italianPdfUrl);
      }
      
      // Traduci interfaccia
      if (isEnglish) {
        // Traduci le etichette in inglese
        document.querySelector("#testTitle").textContent = "Student's answers";
        document.querySelector('.stat-card.correct .stat-label').textContent = "Correct";
        document.querySelector('.stat-card.wrong .stat-label').textContent = "Wrong";
        document.querySelector('.stat-card.unsure .stat-label').textContent = "Unsure";
        document.querySelector('.stat-card.no-idea .stat-label').textContent = "No idea";
        document.querySelector('.stat-card.skipped .stat-label').textContent = "Skipped";
        document.querySelector('.stat-card.timeout .stat-label').textContent = "Timeout";
        document.querySelector('.filter-hint span').textContent = "💡 Click on boxes to filter answers";
        document.querySelector('#printBtn').innerHTML = "🖨️ Generate PDF";
        
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
        document.querySelector("#testTitle").textContent = "Risposte dello studente";
        document.querySelector('.stat-card.correct .stat-label').textContent = "Corrette";
        document.querySelector('.stat-card.wrong .stat-label').textContent = "Errate";
        document.querySelector('.stat-card.unsure .stat-label').textContent = "Insicuro";
        document.querySelector('.stat-card.no-idea .stat-label').textContent = "Non ho idea";
        document.querySelector('.stat-card.skipped .stat-label').textContent = "Non date";
        document.querySelector('.stat-card.timeout .stat-label').textContent = "Tempo esaurito";
        document.querySelector('.filter-hint span').textContent = "💡 Clicca sui box per filtrare le risposte";
        document.querySelector('#printBtn').innerHTML = "🖨️ Genera PDF";
        
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
    rawScores: { rw: rwRawScore, math: mathRawScore }
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

loadTestAnswers();