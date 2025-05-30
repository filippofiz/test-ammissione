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
      window.location.href = "login.html";
    });
  }, 100);
}

// Carica le risposte del test
async function loadTestAnswers() {
  try {
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

    totalQuestions = questionsData.length;

    // 2. Gestione PDF se disponibile
    const pdfUrls = questionsData.map(q => q.pdf_url).filter(url => url);
    const uniquePdfUrls = [...new Set(pdfUrls)];
    
    if (usePDF && uniquePdfUrls.length > 0) {
      document.getElementById("pdfFrame").src = uniquePdfUrls[0];
      document.getElementById("pdfPanel").style.display = "flex";
    } else {
      // Nascondi pannello PDF e espandi risposte
      document.getElementById("pdfPanel").style.display = "none";
      document.getElementById("answersPanel").classList.add("expanded");
    }

    // 3. Array di ID domande
    const questionIds = questionsData.map(q => q.id);

    // 4. Fetch risposte dello studente
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
    alert("Si è verificato un errore nel caricamento delle risposte.");
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
    
    // Gestione risposte speciali
    if (studentAnswerRaw === "x") {
      studentAnswer = "Insicuro";
      answerStatus = "special";
    } else if (studentAnswerRaw === "y") {
      studentAnswer = "Non ho idea";
      answerStatus = "special";
    } else if (studentAnswerRaw === "z") {
      studentAnswer = "Tempo esaurito";
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
      <span>Domanda ${index + 1}</span>
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
      <strong>Risposta corretta:</strong> 
      <span class="correct-answer">${q.correct_answer}</span>
    `;
    questionDiv.appendChild(correctDiv);
    
    // Risposta dello studente
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("answer-row");
    
    if (studentAnswer) {
      const answerClass = isCorrect ? "student-answer correct" : "student-answer";
      answerDiv.innerHTML = `
        <strong>Risposta dello studente:</strong> 
        <span class="${answerClass}">${studentAnswer}</span>
      `;
    } else {
      answerDiv.innerHTML = `
        <strong>Risposta dello studente:</strong> 
        <span class="no-answer">Nessuna risposta</span>
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