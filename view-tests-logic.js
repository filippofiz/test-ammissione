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

  // Back button
  document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "tutor_dashboard.html";
  });
}

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

  // Fetch ordine sezioni
  const { data: studentTestOrder, error: studentTestOrderError } = await supabase
      .from("ordine_sections")
      .select("ordine")
      .eq("auth_uid", studentId)
      .eq("tipologia_test", selectedTest);

  if (studentTestOrderError || !studentTestOrder || studentTestOrder.length === 0) {
    console.error("❌ Error fetching student's section order:", studentTestOrderError?.message);
    alert("Ordine sezioni non trovato. Contatta il supporto.");
    return;
  }
  
  let ordineSections = [...new Set(studentTestOrder[0].ordine)];
  console.log("📊 Section Order (Unique):", ordineSections);

  if (!ordineSections || ordineSections.length === 0) {
      console.error("❌ ordine_sections is empty or missing.");
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

  // Fetch materie
  const { data: questionsData, error: materiaError } = await supabase
    .from("questions")
    .select("section, tipologia_esercizi, progressivo, Materia")
    .eq("tipologia_test", selectedTest);
    
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
}

// Display test tree - MODIFICATA
function displayTestTree(tests, studentTests, testType, selectedTest) {
  const tree = document.getElementById("testTree");
  tree.innerHTML = "";

  // Raggruppa per materia
  const byMat = {};
  tests.forEach(t => {
    const mat = t.Materia || "Altro";
    (byMat[mat] = byMat[mat]||[]).push(t);
  });

// Ordina materie con ordine personalizzato
const mats = Object.keys(byMat).sort((a,b) => {
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

    const h2 = document.createElement("h2");
    h2.classList.add("materia-header");
    h2.textContent = materia==="Altro" ? "Altre Materie" : materia;
    section.appendChild(h2);

    const group = byMat[materia];

    if (materia==="Simulazioni") {
      displaySimulazioni(section, group, studentTests, selectedTest);
    } else {
      displayRegularTests(section, group, studentTests, selectedTest);
    }

    tree.appendChild(section);
  });

  // AGGIUNGI: Uniforma le larghezze dopo aver costruito l'albero
  uniformTestButtonWidths();
}

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

  const { data: questions, error: questionError } = await supabase
      .from(selectedTest.includes("PDF") ? "questions" : "questions_bancaDati")
      .select("id")
      .eq("section", section)
      .eq("tipologia_esercizi", studentTestType)
      .eq("tipologia_test", selectedTest)
      .eq("progressivo", testProgressivo);

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