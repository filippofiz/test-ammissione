// view-tests-logic.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { updateAutoUnlockStatus } from './autoUnlock.js';

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Variabili globali
const studentId = sessionStorage.getItem("selectedStudentId");
const studentName = sessionStorage.getItem("selectedStudentName") || "Student";
let viewAnswersMode = false;
let studentTestsCache = [];

// NUOVA FUNZIONE: Uniforma la larghezza di tutti i bottoni dei test
function uniformTestButtonWidths() {
  // Piccolo delay per assicurarsi che il rendering sia completo
  setTimeout(() => {
    // Trova tutti i bottoni dei test dentro #testTree
    const testButtons = document.querySelectorAll('#testTree button');
    
    if (testButtons.length === 0) {
      console.log("Nessun bottone test trovato");
      return;
    }
    
    // Prima resettiamo tutte le larghezze per ottenere le dimensioni naturali
    testButtons.forEach(button => {
      button.style.width = 'auto';
    });
    
    // Troviamo la larghezza massima tra tutti i bottoni
    let maxWidth = 0;
    testButtons.forEach(button => {
      const width = button.offsetWidth;
      if (width > maxWidth) {
        maxWidth = width;
      }
    });
    
    // Aggiungiamo un piccolo padding extra per sicurezza
    maxWidth += 20; // 10px per lato
    
    console.log(`Larghezza massima trovata: ${maxWidth}px`);
    
    // Applichiamo la larghezza massima a tutti i bottoni
    testButtons.forEach(button => {
      button.style.width = maxWidth + 'px';
    });
    
    // Applichiamo la stessa larghezza anche a tutti i contenitori delle colonne
    // che contengono i bottoni (se hanno la classe test-column)
    const testColumns = document.querySelectorAll('.test-column');
    testColumns.forEach(column => {
      column.style.width = maxWidth + 'px';
    });
    
    // Se ci sono div che contengono direttamente i bottoni senza test-column
    // (come nel caso delle simulazioni), uniformiamo anche quelli
    testButtons.forEach(button => {
      const parentDiv = button.parentElement;
      if (parentDiv && parentDiv.style.display === 'flex' && parentDiv.style.flexDirection === 'column') {
        parentDiv.style.width = maxWidth + 'px';
      }
    });
    
    console.log(`✅ Larghezza uniforme applicata a ${testButtons.length} bottoni: ${maxWidth}px`);
  }, 100); // 100ms di delay per il rendering completo
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', async () => {
  // Controlla se c'è uno studente selezionato
  if (!studentId) {
    alert("Errore: Nessuno studente selezionato.");
    window.location.href = "tutor_dashboard.html";
    return;
  }

  // Imposta il titolo
  document.getElementById("studentTestProgressTitle").textContent = `Avanzamento preparazione di ${studentName}`;

  // Carica il nome del tutor nell'header
  await updateTutorName();

  // Aggiungi event listeners
  setupEventListeners();

  // Carica l'albero dei test
  await loadTestTree();

// Setup flag esigenze speciali
await setupSpecialNeedsToggle();

  // Aggiungi MutationObserver per monitorare cambiamenti nel testTree
  const testTree = document.getElementById('testTree');
  if (testTree) {
    const testTreeObserver = new MutationObserver((mutations) => {
      // Se sono stati aggiunti nuovi bottoni, uniforma le larghezze
      if (mutations.some(m => m.addedNodes.length > 0)) {
        uniformTestButtonWidths();
      }
    });
    
    testTreeObserver.observe(testTree, {
      childList: true,
      subtree: true
    });
  }
});

// Gestione flag esigenze speciali
async function setupSpecialNeedsToggle() {
  const checkbox = document.getElementById('specialNeedsCheckbox');
  if (!checkbox) return;
  
  // Carica stato corrente
  const { data: student } = await supabase
    .from('students')
    .select('esigenze_speciali')
    .eq('auth_uid', studentId)
    .single();
  
  checkbox.checked = student?.esigenze_speciali || false;
  
  // Gestisci il cambio di stato
  checkbox.addEventListener('change', async (e) => {
    const isChecked = e.target.checked;
    
    // Salva nel database
    const { error } = await supabase
      .from('students')
      .update({ esigenze_speciali: isChecked })
      .eq('auth_uid', studentId);
    
    if (error) {
      alert('Errore nell\'aggiornamento: ' + error.message);
      checkbox.checked = !isChecked; // Ripristina stato precedente
      return;
    }
    
    // Aggiorna tutti i valori di durata
    const durationInputs = document.querySelectorAll('.duration-input');
    
    for (const input of durationInputs) {
      const currentValue = parseInt(input.value);
      if (currentValue && currentValue > 0) {
        let newValue;
        
        if (isChecked) {
          // Applica +30%
          newValue = Math.round(currentValue * 1.3);
        } else {
          // Rimuovi il 30% (torna al valore originale)
          newValue = Math.round(currentValue / 1.3);
        }
        
        input.value = newValue;
        // Salva automaticamente
        input.dispatchEvent(new Event('change'));
      }
    }
    
    const message = isChecked 
      ? '✅ Tempo extra del 30% applicato a tutti i test' 
      : '✅ Tempo normale ripristinato per tutti i test';
    
    // Mostra un messaggio discreto invece di alert
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #00a666;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    
    setTimeout(() => msgDiv.remove(), 3000);
  });
}

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

// Setup event listeners
function setupEventListeners() {
  // Toggle view answers
  document.getElementById("toggleViewAnswers").addEventListener("click", () => {
    viewAnswersMode = !viewAnswersMode;
    const toggleButton = document.getElementById("toggleViewAnswers");
    
    if (viewAnswersMode) {
      toggleButton.textContent = "🔒 Nascondi risposte dello studente";
      // Attiva modalità correzione
      document.body.classList.add('correction-mode');
    } else {
      toggleButton.textContent = "👁️ Vedi risposte dello studente";
      // Disattiva modalità correzione
      document.body.classList.remove('correction-mode');
    }
    
    loadTestTree();
  });

}

// Carica l'albero dei test
// Carica l'albero dei test
async function loadTestTree() {
  console.log("👤 Viewing tests for Student UID:", studentId);
  const selectedTest = sessionStorage.getItem("selectedTestType");

  if (!selectedTest) {
    alert("Nessun test selezionato. Reindirizzamento alla selezione test...");
    window.location.href = "choose_test.html";
    return;
  }

  console.log(`🎯 Selected Test: ${selectedTest}`);

  const testType = selectedTest.includes("PDF") ? "pdf" : "banca_dati";
  console.log(`📌 Determined Test Type: ${testType}`);

  // MODIFICATO: Fetch ordine sezioni dalla tabella globale
  const { data: globalTestOrder, error: globalTestOrderError } = await supabase
      .from("ordine_sections_global")
      .select("ordine")
      .eq("tipologia_test", selectedTest)
      .single();

  if (globalTestOrderError || !globalTestOrder) {
    console.error("❌ Error fetching global section order:", globalTestOrderError?.message);
    alert("Ordine sezioni non trovato. Contatta il supporto.");
    return;
  }
  
  let ordineSections = [...new Set(globalTestOrder.ordine)];
  console.log("📊 Global Section Order (Unique):", ordineSections);

  if (!ordineSections || ordineSections.length === 0) {
      console.error("❌ ordine_sections_global is empty or missing.");
      alert("Nessun ordine sezioni disponibile. Contatta il supporto.");
      return;
  }

  // Fetch test dello studente
  let { data: studentTests, error: progressError } = await supabase
      .from("student_tests")
      .select("*")
      .eq("auth_uid", studentId)
      .eq("tipologia_test", selectedTest)
      .order("tipologia_esercizi, progressivo");

  if (progressError) {
      console.error("❌ Error fetching student progress:", progressError.message);
      return;
  }

  console.log("📊 Student Progress Data:", studentTests);

  // Rimuovi duplicati
  studentTests = studentTests.filter((test, index, self) =>
      index === self.findIndex((t) =>
          t.section === test.section &&
          t.tipologia_esercizi === test.tipologia_esercizi &&
          t.progressivo === test.progressivo
      )
  );

  // Ordina per sezione
  studentTests.sort((a, b) => ordineSections.indexOf(a.section) - ordineSections.indexOf(b.section));

  // Fetch materie with pagination
  let questionsData = [];
  let page = 0;
  let hasMore = true;
  while (hasMore) {
    const { data, error } = await supabase
      .from("questions")
      .select("section, tipologia_esercizi, progressivo, Materia")
      .eq("tipologia_test", selectedTest)
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      questionsData = [...questionsData, ...data];
      if (data.length < 1000) hasMore = false;
      page++;
    }
  }
  const materiaError = null;
    
  if (materiaError) {
    console.error("❌ Error fetching Materia:", materiaError.message);
  }

  // Crea mappa materie
  const materiaMap = {};
  questionsData?.forEach(q => {
    materiaMap[`${q.section}|${q.tipologia_esercizi}|${q.progressivo}`] = q.Materia;
  });

  // Aggiungi materie ai test
  studentTests = studentTests.map(t => ({
    ...t,
    Materia: materiaMap[`${t.section}|${t.tipologia_esercizi}|${t.progressivo}`] || ""
  }));
  
  studentTestsCache = studentTests;
  
  // Display e setup
  displayTestTree(studentTests, studentTests, testType, selectedTest);
  setupDragDrop(studentTests);
  initSortable();
  
  // Update auto unlock status
  await updateAutoUnlockStatus(studentTestsCache);
  displayTestTree(studentTestsCache, studentTestsCache, testType, selectedTest);
  
  // Uniforma le larghezze dopo l'ultimo displayTestTree
  uniformTestButtonWidths();
  addTestBadges(); // <-- Nuova funzione che gestisce sia Training che Assessment
}

// Display test tree - MODIFICATA
function displayTestTree(tests, studentTests, testType, selectedTest) {
  const tree = document.getElementById("testTree");
  tree.innerHTML = "";

  // Check if no tests assigned
  if (!tests || tests.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.style.cssText = `
      text-align: center;
      padding: 3rem;
      color: #6c757d;
      font-size: 1.1rem;
    `;
    emptyMessage.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">📭</div>
      <p>No tests have been assigned yet</p>
    `;
    tree.appendChild(emptyMessage);
    return;
  }

  // Raggruppa per materia
  const byMat = {};
  tests.forEach(t => {
    const mat = t.Materia || "Altro";
    (byMat[mat] = byMat[mat]||[]).push(t);
  });

// Ordina materie con ordine personalizzato
const mats = Object.keys(byMat).sort((a,b) => {
    // Assessment Iniziale sempre per primo
    if (a === "Assessment Iniziale") return -1;
    if (b === "Assessment Iniziale") return 1;

    // Definisci l'ordine prioritario
    const priorityOrder = {
        "Matematica": 1,
        "Fisica": 2,
        "Chimica": 3,
        "Altre Materie": 4,
        "Altro": 4  // stesso peso di "Altre Materie"
    };

    // Simulazioni sempre per ultime
    if (a === "Simulazioni") return 1;
    if (b === "Simulazioni") return -1;

    // Controlla se entrambe hanno priorità definita
    const priorityA = priorityOrder[a];
    const priorityB = priorityOrder[b];

    if (priorityA && priorityB) {
        return priorityA - priorityB;
    }

    // Se solo A ha priorità, va prima
    if (priorityA) return -1;

    // Se solo B ha priorità, va prima
    if (priorityB) return 1;

    // Altrimenti ordine alfabetico
    return a.localeCompare(b);
});

  mats.forEach(materia => {
    const section = document.createElement("div");
    section.classList.add("materia-section");

    // Header con toggle icon
    const h2 = document.createElement("h2");
    h2.classList.add("materia-header");

    const toggleIcon = document.createElement("span");
    toggleIcon.classList.add("toggle-icon");
    toggleIcon.textContent = "▼";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = materia==="Altro" ? "Altre Materie" : materia;

    h2.appendChild(toggleIcon);
    h2.appendChild(titleSpan);

    // Aggiungi evento click per toggle
    h2.addEventListener("click", () => {
      section.classList.toggle("collapsed");
    });

    section.appendChild(h2);

    // Content wrapper
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("materia-content");

    const group = byMat[materia];

    if (materia==="Simulazioni") {
      displaySimulazioni(contentDiv, group, studentTests, selectedTest);
    } else {
      displayRegularTests(contentDiv, group, studentTests, selectedTest);
    }

    section.appendChild(contentDiv);
    tree.appendChild(section);
  });

  // AGGIUNGI: Uniforma le larghezze dopo aver costruito l'albero
  uniformTestButtonWidths();
  addTestBadges(); // <-- Nuova funzione che gestisce sia Training che Assessment

}


// Funzione per aggiungere badge sia ai Training che agli Assessment
async function addTestBadges() {
  console.log('🏆 Aggiunta badge ai test...');
  
  // Trova tutti i bottoni dei training E degli assessment
  const testButtons = Array.from(document.querySelectorAll('#testTree button'))
    .filter(btn => {
      const text = btn.textContent;
      return (text.includes('Training') || 
              text.includes('Esercizi per casa') || 
              text.includes('Assessment'));
    });
  
  console.log(`Found ${testButtons.length} test buttons (Training + Assessment)`);
  
  // Mappa per salvare i risultati degli assessment per sezione
  const sectionAssessmentResults = new Map();
  
  for (const button of testButtons) {
    const buttonText = button.textContent;
    const match = buttonText.match(/(\d+)/);
    if (!match) continue;
    
    const progressivo = parseInt(match[1]);
    const parentCol = button.parentElement;
    
    // Controlla se il test è completato
    if (!button.classList.contains('completed')) continue;
    
    console.log(`Processing completed test: ${buttonText}`);
    
    // Determina il tipo di test
    const isAssessment = buttonText.includes('Assessment');
    const tipologiaEsercizi = isAssessment ? 'Assessment' : 'Esercizi per casa';
    
    // Rimuovi badge esistenti per evitare duplicati
    const existingBadge = parentCol.querySelector('.test-badge-container');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Aggiungi classe per posizionamento relativo
    parentCol.style.position = 'relative';
    
    // Crea il container del badge
    const badgeContainer = document.createElement('div');
    badgeContainer.className = isAssessment ? 'assessment-badge-container' : 'training-badge-container';
    badgeContainer.classList.add('test-badge-container');
    
    // Crea il badge con stato di caricamento
    const badge = document.createElement('div');
    badge.className = isAssessment ? 'assessment-badge loading' : 'training-badge loading';
    
    // Crea il tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'score-tooltip';
    tooltip.textContent = 'Caricamento...';
    
    // Crea il pannello dettagli
    const details = document.createElement('div');
    details.className = 'score-details';
    
    badgeContainer.appendChild(badge);
    badgeContainer.appendChild(tooltip);
    badgeContainer.appendChild(details);
    parentCol.appendChild(badgeContainer);
    
    // Trova la sezione corretta
    let section = null;
    let currentElement = button.parentElement;
    while (currentElement && !section) {
      const h3 = currentElement.querySelector('h3');
      if (h3) {
        section = h3.textContent;
        break;
      }
      let sibling = currentElement.previousElementSibling;
      while (sibling && !section) {
        const siblingH3 = sibling.querySelector('h3');
        if (siblingH3) {
          section = siblingH3.textContent;
          break;
        }
        sibling = sibling.previousElementSibling;
      }
      currentElement = currentElement.parentElement;
    }
    
    if (!section) {
      console.error('Section not found for button:', buttonText);
      badge.className = badge.className.replace('loading', 'failed');
      tooltip.textContent = 'Sezione non trovata';
      continue;
    }
    
    console.log(`Found section: ${section} for ${tipologiaEsercizi} ${progressivo}`);
    
    try {
      const selectedTest = sessionStorage.getItem("selectedTestType");
      const score = await getTestScore(section, progressivo, selectedTest, tipologiaEsercizi);
      
      console.log('Score retrieved:', score);
      
      // Aggiorna il badge
      updateTestBadge(badge, tooltip, details, score, isAssessment);
      
      // Per gli assessment, salva il risultato per la sezione
      if (isAssessment) {
        if (!sectionAssessmentResults.has(section)) {
          sectionAssessmentResults.set(section, []);
        }
        sectionAssessmentResults.get(section).push(score);
      }
      
      // Aggiungi evento click per espandere i dettagli
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        details.classList.toggle('show');
      });
      
    } catch (error) {
      console.error('Errore nel recupero del punteggio:', error);
      badge.className = badge.className.replace('loading', 'failed');
      tooltip.textContent = 'Errore caricamento';
    }
  }
  
  // Aggiungi badge alle sezioni che hanno assessment passati
  addSectionBadges(sectionAssessmentResults);
  
  // Aggiungi listener globale per chiudere i dettagli
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.test-badge-container')) {
      document.querySelectorAll('.score-details.show').forEach(detail => {
        detail.classList.remove('show');
      });
    }
  }, { once: true });
}

// Funzione per recuperare il punteggio di un test (Training o Assessment)
// Funzione per recuperare il punteggio di un test (Training o Assessment)
// VERSIONE CORRETTA che gestisce i duplicati
async function getTestScore(section, progressivo, selectedTest, tipologiaEsercizi) {
  console.log(`Getting score for: section=${section}, progressivo=${progressivo}, test=${selectedTest}, tipo=${tipologiaEsercizi}`);
  
  const isTestPDF = selectedTest.includes("PDF");
  const questionsTable = isTestPDF ? "questions" : "questions_bancaDati";
  const answersTable = isTestPDF ? "student_answers" : "studentbocconi_answers";
  
  // Recupera le domande del test
  let query = supabase.from(questionsTable).select("id");

  if (selectedTest === "SAT PDF" && section === "Assessment Iniziale") {
    // For SAT, get questions from all modules using Materia field
    query = query
      .eq("Materia", section)
      .eq("tipologia_esercizi", tipologiaEsercizi)
      .eq("progressivo", progressivo)
      .eq("tipologia_test", selectedTest);
  } else {
    // Regular query for non-SAT tests
    query = query
      .eq("section", section)
      .eq("tipologia_esercizi", tipologiaEsercizi)
      .eq("progressivo", progressivo)
      .eq("tipologia_test", selectedTest);
  }

  const { data: questions, error: questionsError } = await query;
  
  if (questionsError) {
    throw new Error(`Errore query domande: ${questionsError.message}`);
  }
  
  if (!questions || questions.length === 0) {
    throw new Error('Nessuna domanda trovata');
  }
  
  // Rimuovi eventuali domande duplicate
  const uniqueQuestionIds = [...new Set(questions.map(q => q.id))];
  const totalQuestions = uniqueQuestionIds.length;
  
  // Log di debug per assessment algebra
  if (section.toLowerCase().includes('algebra') && tipologiaEsercizi === 'Assessment') {
    console.log('🔍 DEBUG Assessment Algebra:');
    console.log(`- Domande totali trovate: ${questions.length}`);
    console.log(`- Domande uniche: ${uniqueQuestionIds.length}`);
    if (questions.length !== uniqueQuestionIds.length) {
      console.warn('⚠️ Trovate domande duplicate nel database!');
    }
  }
  
  // Recupera le risposte dello studente con auto_score E answer per SAT
  const { data: answers, error: answersError } = await supabase
    .from(answersTable)
    .select("question_id, auto_score, answer")
    .eq("auth_uid", studentId)
    .in("question_id", uniqueQuestionIds);

  if (answersError) {
    throw new Error(`Errore query risposte: ${answersError.message}`);
  }

  // Gestisci eventuali risposte duplicate per la stessa domanda
  // (prendi solo l'ultima risposta per ogni domanda)
  const answerMap = new Map();
  if (answers && answers.length > 0) {
    answers.forEach(answer => {
      answerMap.set(answer.question_id, answer);
    });
  }

  // Converti la mappa in array di risposte uniche
  const uniqueAnswers = Array.from(answerMap.values());

  // For SAT tests, filter out questions that were never shown (answer = 'xx')
  let shownAnswers = uniqueAnswers;
  let totalQuestionsToUse = totalQuestions;

  let satModulesShown = null;
  if (selectedTest === "SAT PDF") {
    // Filter out questions that were never shown (answer = 'xx')
    shownAnswers = uniqueAnswers.filter(a => a.answer !== 'xx');
    // For SAT, use only shown questions for percentage calculation
    totalQuestionsToUse = shownAnswers.length;
    console.log(`SAT Test: ${shownAnswers.length} questions shown out of ${totalQuestions} total`);

    // Determine which adaptive modules were shown
    // Get questions with their SAT_section to identify modules
    const { data: satQuestions } = await supabase
      .from(questionsTable)
      .select("id, SAT_section")
      .in("id", shownAnswers.map(a => a.question_id));

    if (satQuestions) {
      const modulesSet = new Set(satQuestions.map(q => q.SAT_section).filter(s => s));
      const modules = Array.from(modulesSet);

      // Identify adaptive path
      const hasRW2Easy = modules.includes('RW2-Easy');
      const hasRW2Hard = modules.includes('RW2-Hard');
      const hasMath2Easy = modules.includes('Math2-Easy');
      const hasMath2Hard = modules.includes('Math2-Hard');

      satModulesShown = {
        rw2: hasRW2Easy ? 'Easy' : (hasRW2Hard ? 'Hard' : 'N/A'),
        math2: hasMath2Easy ? 'Easy' : (hasMath2Hard ? 'Hard' : 'N/A')
      };
    }
  }

  const answeredQuestions = shownAnswers.filter(a => a.answer && a.answer !== 'z' && a.answer !== 'xx').length;
  const correctAnswers = shownAnswers.filter(a => a.auto_score === 1).length;
  
  // Log di debug per assessment algebra
  if (section.toLowerCase().includes('algebra') && tipologiaEsercizi === 'Assessment') {
    console.log(`- Risposte totali trovate: ${answers ? answers.length : 0}`);
    console.log(`- Risposte uniche: ${uniqueAnswers.length}`);
    console.log(`- Risposte corrette: ${correctAnswers}`);
    if (answers && answers.length !== uniqueAnswers.length) {
      console.warn('⚠️ Trovate risposte duplicate per le stesse domande!');
    }
  }
  
  const wrongAnswers = answeredQuestions - correctAnswers;
  const unansweredQuestions = totalQuestionsToUse - answeredQuestions;
  const percentage = totalQuestionsToUse > 0 ? Math.round((correctAnswers / totalQuestionsToUse) * 100) : 0;

  return {
    totalQuestions: totalQuestionsToUse, // Use shown questions count for SAT
    correctAnswers,
    wrongAnswers,
    answeredQuestions,
    unansweredQuestions, // Aggiungo anche le domande non risposte
    percentage,
    passed: percentage >= 60,
    satModulesShown // Include SAT module information if available
  };
}

// Funzione per aggiornare il badge con i dati
function updateTestBadge(badge, tooltip, details, score, isAssessment) {
  // Rimuovi lo stato di caricamento
  badge.classList.remove('loading');
  
  // Aggiungi la classe appropriata
  badge.classList.add(score.passed ? 'passed' : 'failed');
  
  // Aggiorna il tooltip
  tooltip.textContent = `${score.percentage}% (${score.correctAnswers}/${score.totalQuestions})`;
  
  // Aggiorna i dettagli
  const testType = isAssessment ? 'Assessment' : 'Training';
  let detailsHTML = `
    <h5>📊 Dettagli ${testType}</h5>
    <div class="score-row">
      <span class="score-label">Domande totali:</span>
      <span class="score-value">${score.totalQuestions}</span>
    </div>
    <div class="score-row">
      <span class="score-label">Risposte corrette:</span>
      <span class="score-value" style="color: #22c55e;">${score.correctAnswers}</span>
    </div>
    <div class="score-row">
      <span class="score-label">Risposte errate:</span>
      <span class="score-value" style="color: #ef4444;">${score.wrongAnswers}</span>
    </div>
    <div class="score-row">
      <span class="score-label">Non date:</span>
      <span class="score-value" style="color: #6b7280;">${score.unansweredQuestions}</span>
    </div>`;

  // Add SAT module information if available
  if (score.satModulesShown) {
    detailsHTML += `
    <div class="score-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
      <span class="score-label">📚 Moduli SAT:</span>
    </div>
    <div class="score-row">
      <span class="score-label" style="margin-left: 10px;">RW Module 2:</span>
      <span class="score-value">${score.satModulesShown.rw2}</span>
    </div>
    <div class="score-row">
      <span class="score-label" style="margin-left: 10px;">Math Module 2:</span>
      <span class="score-value">${score.satModulesShown.math2}</span>
    </div>`;
  }

  detailsHTML += `
    <div class="score-percentage ${score.passed ? 'passed' : 'failed'}">
      ${score.percentage}%
    </div>
  `;

  details.innerHTML = detailsHTML;
}

// Funzione per aggiungere badge alle sezioni con assessment passati
function addSectionBadges(sectionAssessmentResults) {
  console.log('🎯 Aggiunta badge alle sezioni con assessment passati...');
  
  sectionAssessmentResults.forEach((assessments, sectionName) => {
    // Controlla se almeno un assessment è passato
    const hasPassedAssessment = assessments.some(score => score.passed);
    
    if (hasPassedAssessment) {
      // Trova l'header della sezione
      const sectionHeaders = document.querySelectorAll('.section h3');
      const sectionHeader = Array.from(sectionHeaders).find(h3 => h3.textContent === sectionName);
      
      if (sectionHeader) {
        // Rimuovi badge esistenti
        const existingBadge = sectionHeader.querySelector('.section-passed-badge');
        if (existingBadge) {
          existingBadge.remove();
        }
        
        // Crea il badge per la sezione
        const sectionBadge = document.createElement('span');
        sectionBadge.className = 'section-passed-badge';
        sectionBadge.innerHTML = '✅';
        sectionBadge.title = 'Sezione superata (almeno un Assessment passato)';
        
        // Aggiungi il badge all'header
        sectionHeader.appendChild(sectionBadge);
        
        // Aggiungi anche una classe alla sezione per styling aggiuntivo
        const sectionDiv = sectionHeader.parentElement;
        if (sectionDiv) {
          sectionDiv.classList.add('section-passed');
        }
      }
    }
  });
}

// IMPORTANTE: Sostituisci la vecchia funzione addTrainingBadges con addTestBadges
// nelle chiamate in displayTestTree e loadTestTree

// Display simulazioni
function displaySimulazioni(section, group, studentTests, selectedTest) {
  const row = document.createElement("div");
  row.style.display="flex";
  row.style.flexWrap="wrap";
  row.style.gap="8px";

  group.forEach(t => {
    const st = studentTests.find(s =>
      s.section===t.section &&
      s.tipologia_esercizi===t.tipologia_esercizi &&
      s.progressivo===t.progressivo
    );
    const status = st?.status||"locked";

    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.alignItems = "center";
    col.style.gap = "4px";

    const btn = document.createElement("button");
    btn.textContent = `Test ${t.progressivo}`;

    setupButtonBehavior(btn, status, t, selectedTest, studentId);

    col.appendChild(btn);
    col.appendChild(createDurationInput(st));

    row.appendChild(col);
  });

  section.appendChild(row);
}

// Display regular tests
function displayRegularTests(section, group, studentTests, selectedTest) {
  const secMap = {};
  group.forEach(t => {
    (secMap[t.section]=secMap[t.section]||{})[t.tipologia_esercizi] ??= [];
    secMap[t.section][t.tipologia_esercizi].push(t);
  });

  Object.keys(secMap).forEach(secKey => {
    const secDiv = document.createElement("div");
    secDiv.classList.add("section");
    secDiv.innerHTML = `<h3>${secKey}</h3>`;

    const tipContainer = document.createElement("div");
    tipContainer.style.display="flex";
    tipContainer.style.flexDirection="column";
    tipContainer.style.gap="10px";

    Object.keys(secMap[secKey]).sort((a,b)=>{
      if(a==="Esercizi per casa") return -1;
      if(b==="Esercizi per casa") return  1;
      if(a==="Assessment") return -1;
      if(b==="Assessment") return  1;
      return 0;
    }).forEach(tip => {
      const label = document.createElement("h4");
      label.textContent = tip;
      tipContainer.appendChild(label);

      const cols = document.createElement("div");
      cols.style.display="flex";
      cols.style.gap="20px";
      cols.style.marginBottom="10px";

      const progGroups = {};
      secMap[secKey][tip].forEach(t => {
        (progGroups[t.progressivo]=progGroups[t.progressivo]||[]).push(t);
      });

      Object.keys(progGroups).sort((a,b)=>a-b).forEach(prog => {
        const col = document.createElement("div");
        col.style.display="flex";
        col.style.flexDirection="column";
        col.style.alignItems="center";
        col.classList.add("test-column"); // AGGIUNGI questa classe

        progGroups[prog].forEach(t => {
          const st = studentTests.find(s =>
            s.section===t.section &&
            s.tipologia_esercizi===t.tipologia_esercizi &&
            s.progressivo===t.progressivo
          );
          const status = st?.status||"locked";

          const btn = document.createElement("button");
          btn.textContent = `${tip} ${t.progressivo}`;

          setupButtonBehavior(btn, status, t, selectedTest, studentId);

          col.appendChild(btn);
          col.appendChild(createDurationInput(st));
        });

        cols.appendChild(col);
      });

      tipContainer.appendChild(cols);
    });

    secDiv.appendChild(tipContainer);
    section.appendChild(secDiv);
  });
}

// Setup button behavior
function setupButtonBehavior(btn, status, test, selectedTest, studentId) {
  if (viewAnswersMode) {
    if (status==="completed") {
      btn.classList.add("view-answers");
      btn.onclick = () => viewStudentAnswers(test.section, test.progressivo, test.tipologia_esercizi, selectedTest, studentId);
    } else {
      btn.classList.add("disabled-green");
      btn.onclick = null;
    }
  } else {
    if (status==="completed") {
      btn.classList.add("completed");
      btn.onclick = () => confirmResetTest(test.section, test.progressivo, test.tipologia_esercizi, selectedTest);
    } else {
      btn.classList.add(status);
      btn.onclick = () => toggleTestLock(test.section, test.progressivo, test.tipologia_esercizi, status, selectedTest);
    }
  }
}

// Create duration input
function createDurationInput(studentTest) {
  const durationWrapper = document.createElement("div");
  durationWrapper.classList.add("duration-wrapper");

  const durationLabel = document.createElement("span");
  durationLabel.classList.add("duration-label");
  durationLabel.textContent = "Durata (sec)";
  durationWrapper.appendChild(durationLabel);

  const durationInput = document.createElement("input");
  durationInput.type  = "number";
  durationInput.min   = "0";
  durationInput.value = studentTest?.duration ?? "";
  durationInput.classList.add("duration-input");
  
  if (studentTest) {
    durationInput.addEventListener("change", async () => {
      const newVal = durationInput.value;
      const { error } = await supabase
        .from("student_tests")
        .update({ duration: newVal })
        .eq("id", studentTest.id);
      if (error) {
        alert("Errore aggiornamento durata: " + error.message);
      }
    });
  }
  
  durationWrapper.appendChild(durationInput);
  return durationWrapper;
}

// Setup drag and drop
function setupDragDrop(tests) {
  const manual = document.getElementById("manualList");
  const auto   = document.getElementById("autoList");
  manual.innerHTML = "";
  auto.innerHTML   = "";

  const manualTests = tests
    .filter(t => t.unlock_mode !== "automatic")
    .sort((a, b) => a.unlock_order - b.unlock_order);

  const autoTests = tests
    .filter(t => t.unlock_mode === "automatic")
    .sort((a, b) => a.unlock_order - b.unlock_order);

  function appendLi(listEl, t) {
    const li = document.createElement("li");
    li.textContent = `${t.section} ${t.tipologia_esercizi} ${t.progressivo}`;
    li.draggable = true;
    li.dataset.testId = t.id;

    li.addEventListener("dragstart", ev => {
      ev.dataTransfer.setData("text/plain", t.id);
      ev.dataTransfer.effectAllowed = "move";
    });

    listEl.appendChild(li);
  }

  manualTests.forEach(t => appendLi(manual, t));
  autoTests.forEach(t => appendLi(auto, t));

  [manual, auto].forEach(list => {
    list.addEventListener("dragover", ev => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
    });
    
    list.addEventListener("drop", async ev => {
      ev.preventDefault();
      const id = ev.dataTransfer.getData("text/plain");
      const dragged = document.querySelector(`li[data-test-id="${id}"]`);
      if (dragged && list !== dragged.parentNode) {
        list.appendChild(dragged);
        const newMode = list.id === 'autoList' ? 'automatic' : 'manual';
        const { error } = await supabase
          .from('student_tests')
          .update({ unlock_mode: newMode })
          .eq('id', id);
        if (error) {
          alert("Errore salvando modalità di sblocco: " + error.message);
        }
      }
    });
  });
}

// Initialize sortable
function initSortable() {
  const manual = document.getElementById("manualList");
  const auto   = document.getElementById("autoList");

  [manual, auto].forEach(listEl => {
    Sortable.create(listEl, {
      group: "unlock",
      animation: 150,
      onEnd: () => persistOrder(manual, "manual").then(() => persistOrder(auto, "automatic"))
    });
  });
}

// Persist order
async function persistOrder(listEl, mode) {
  const updates = Array.from(listEl.children).map((li, idx) => ({
    id:           li.dataset.testId,
    unlock_mode:  mode,
    unlock_order: idx
  }));
  
  for (const u of updates) {
    const { error } = await supabase
      .from("student_tests")
      .update({
        unlock_mode:  u.unlock_mode,
        unlock_order: u.unlock_order
      })
      .eq("id", u.id);
    if (error) console.error("Persist error:", error.message);
  }
}

// Confirm reset test
async function confirmResetTest(section, testProgressivo, studentTestType, selectedTest) {
  const confirmReset = confirm("⚠️ Questo test è contrassegnato come completato. Vuoi reimpostarlo e rimuovere tutte le risposte dello studente?");
  if (!confirmReset) return;

  console.log(`🔄 Resetting Test: Section ${section}, Test Type: ${studentTestType}, Progressivo: ${testProgressivo}, Selected: ${selectedTest}`);

  let query = supabase
      .from(selectedTest.includes("PDF") ? "questions" : "questions_bancaDati")
      .select("id");

  if (selectedTest === "SAT PDF" && section === "Assessment Iniziale") {
    // For SAT, use Materia field
    query = query
      .eq("Materia", section)
      .eq("tipologia_esercizi", studentTestType)
      .eq("tipologia_test", selectedTest)
      .eq("progressivo", testProgressivo);
  } else {
    // Regular query for non-SAT tests
    query = query
      .eq("section", section)
      .eq("tipologia_esercizi", studentTestType)
      .eq("tipologia_test", selectedTest)
      .eq("progressivo", testProgressivo);
  }

  const { data: questions, error: questionError } = await query;

  if (questionError) {
      console.error("❌ Error fetching questions for reset:", questionError);
      alert("Impossibile reimpostare il test.");
      return;
  }

  const questionIds = questions.map(q => q.id);
  if (questionIds.length === 0) {
      alert("Nessuna domanda trovata per questo test.");
      return;
  }

  const { error: deleteError } = await supabase
      .from(selectedTest.includes("PDF") ? "student_answers" : "studentbocconi_answers")
      .delete()
      .in("question_id", questionIds)
      .eq("auth_uid", studentId);

  if (deleteError) {
      console.error("❌ Error deleting student answers:", deleteError);
      alert("Impossibile reimpostare il test.");
      return;
  }

  const { error: updateError } = await supabase
      .from("student_tests")
      .update({ status: "locked", tutor_unlocked: false })
      .eq("auth_uid", studentId)
      .eq("section", section)
      .eq("tipologia_esercizi", studentTestType)
      .eq("tipologia_test", selectedTest)
      .eq("progressivo", testProgressivo);

  if (updateError) {
      console.error("❌ Error resetting test status:", updateError);
      alert("Impossibile reimpostare il test.");
      return;
  }

  alert("✅ Test reimpostato con successo. Lo studente dovrà rifarlo.");
  loadTestTree();
}

// Toggle test lock
async function toggleTestLock(section, testProgressivo, studentTestType, currentStatus, selectedTest) {
  const newStatus = currentStatus === "locked" ? "unlocked" : "locked";
  console.log(`🔄 Toggling Test: Section ${section}, Progressivo ${testProgressivo}, Test Type ${selectedTest} → ${newStatus}`);

  let query = supabase
    .from("student_tests")
    .update({ status: newStatus, tutor_unlocked: newStatus === "unlocked" })
    .eq("auth_uid", studentId)
    .eq("section", section)
    .eq("tipologia_esercizi", studentTestType)
    .eq("tipologia_test", selectedTest)
    .eq("progressivo", testProgressivo);

  const validProgressivo = Number(testProgressivo);
  if (!isNaN(validProgressivo)) {
    query = query.eq("progressivo", validProgressivo);
  }

  const { error } = await query;

  if (error) {
      console.error("❌ Error toggling test:", error);
      alert("Impossibile aggiornare lo stato del test.");
      return;
  }

  if (section != 'Simulazioni') {
      alert(`✅ ${studentTestType} ${testProgressivo} (${section}) di ${selectedTest} è ora ${newStatus === "locked" ? "bloccato" : "sbloccato"}!`);
  } else {
      alert(`✅ Simulazione ${testProgressivo} è ora ${newStatus === "locked" ? "bloccata" : "sbloccata"}!`);
  }
  loadTestTree();
}

// View student answers
async function viewStudentAnswers(section, testProgressivo, tipologiaEsercizi, selectedTest, studentId) {
  console.log(`🚀 View Student Answers: ${section} - ${tipologiaEsercizi} - ${testProgressivo} - ${selectedTest}`);   
  sessionStorage.setItem("selectedSection", section);
  sessionStorage.setItem("selectedTipologiaEsercizi", tipologiaEsercizi);
  sessionStorage.setItem("selectedTestProgressivo", testProgressivo);
  sessionStorage.setItem("selectedTestType", selectedTest);
  sessionStorage.setItem("selectedStudentId", studentId);
  window.location.href = "view_answers.html";
}

// Export functions for global access if needed
window.confirmResetTest = confirmResetTest;
window.toggleTestLock = toggleTestLock;
window.viewStudentAnswers = viewStudentAnswers;