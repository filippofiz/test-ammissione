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
    const { data: questionsData, error: questionsError } = await supabase
      .from(questionsTable)
      .select("*")
      .eq("section", selectedSection)
      .eq("tipologia_esercizi", selectedTipologiaEsercizi)
      .eq("progressivo", selectedProgressivo)
      .eq("tipologia_test", selectedTestType)
      .order("question_number");
      
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
  const listContainer = document.getElementById("questionsList");
  listContainer.innerHTML = "";
  
  // Reset statistiche
  correctCount = 0;
  wrongCount = 0;
  skippedCount = 0;
  unsureCount = 0;
  noIdeaCount = 0;
  timeoutCount = 0;
  
  questionsData.forEach((q, index) => {
    const studentAnswerRaw = studentAnswersMap[q.id] || "";
    let studentAnswer = studentAnswerRaw;
    let answerStatus = "";
    
    // Gestione risposte speciali - ENGLISH VERSION
    if (studentAnswerRaw === "x") {
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
    
    // Aggiorna statistiche
    if (!studentAnswerRaw) {
      skippedCount++; // Non date
    } else if (studentAnswerRaw === "x") {
      unsureCount++;
    } else if (studentAnswerRaw === "y") {
      noIdeaCount++;
    } else if (studentAnswerRaw === "z") {
      timeoutCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }
    
    // Crea elemento domanda
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question-item");
    if (isCorrect) {
      questionDiv.classList.add("correct");
    } else if (studentAnswerRaw === "x") {
      questionDiv.classList.add("unsure");
    } else if (studentAnswerRaw === "y") {
      questionDiv.classList.add("no-idea");
    } else if (studentAnswerRaw === "z") {
      questionDiv.classList.add("timeout");
    } else if (studentAnswerRaw && !["x", "y", "z"].includes(studentAnswerRaw)) {
      questionDiv.classList.add("wrong");
    }
    
    // Header con numero domanda e indicatore
    const header = document.createElement("div");
    header.classList.add("question-header");
    let mark = '';
    if (isCorrect) {
      mark = '<span class="check-mark">✅</span>';
    } else if (studentAnswerRaw && !["x", "y", "z"].includes(studentAnswerRaw)) {
      mark = '<span class="cross-mark">❌</span>';
    } else if (studentAnswerRaw === "x") {
      mark = '<span class="unsure-mark">❓</span>';
    } else if (studentAnswerRaw === "y") {
      mark = '<span class="no-idea-mark">🤷</span>';
    } else if (studentAnswerRaw === "z") {
      mark = '<span class="timeout-mark">⏱️</span>';
    }
    
    header.innerHTML = `
      <span>Question ${index + 1}</span>
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
    
    // Risposta dello studente
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
    
    listContainer.appendChild(questionDiv);
  });
}

// Aggiorna statistiche
function updateStatistics() {
  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('wrongCount').textContent = wrongCount;
  document.getElementById('skippedCount').textContent = skippedCount;
  document.getElementById('unsureCount').textContent = unsureCount;
  document.getElementById('noIdeaCount').textContent = noIdeaCount;
  document.getElementById('timeoutCount').textContent = timeoutCount;
  
  const percentage = totalQuestions > 0 
    ? Math.round((correctCount / totalQuestions) * 100) 
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