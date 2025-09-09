// modify_tests.js
// This script handles CSV uploads for questions.
// Depending on the selected radio button, it chooses the target table (PDF: "questions", Banca Dati: "questions_bancaDati").
// It dynamically retrieves the expected columns from Supabase (via RPC), then parses the CSV file using PapaParse.
// It converts any JSON-style array values (e.g. in wrong_answers) into PostgreSQL array literals,
// groups the CSV rows by section, tipologia_esercizi, progressivo and tipologia_test,
// sorts the groups in the desired order, and displays a summary.
// For each group, an "Upload PDF" button is provided. When clicked, the user selects a PDF file which is uploaded to the
// Supabase storage bucket "tolc_i" and its public URL is saved for that group.
// Finally, when the user clicks "Conferma Upload CSV", each CSV row's pdf_url is set based on its group, and the CSV data is inserted.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const csvFileInput = document.getElementById("csvFileInput");
const uploadCsvBtn = document.getElementById("uploadCsvBtn");
const uploadMessageDiv = document.getElementById("uploadMessage");
const uploadSummaryDiv = document.getElementById("uploadSummary");


// Helper: convert JSON-style array string into a PG array literal.
function convertJsonToPgArray(jsonString) {
  try {
    const arr = JSON.parse(jsonString);
    if (Array.isArray(arr)) {
      return `{${arr.join(",")}}`;
    }
    return jsonString;
  } catch (e) {
    console.error("Error converting JSON to PG array:", e);
    return jsonString;
  }
}

/**
 * Retrieves expected columns for a given table using an RPC.
 * Returns an array of column names (strings) excluding system columns.
 */
async function getExpectedColumns(tableName) {
  const { data, error } = await supabase.rpc("get_table_columns", { target_table: tableName });
  if (error) {
    console.error("Error fetching columns:", error.message);
    return [];
  }
  const systemCols = new Set(["id", "created_at", "updated_at"]);
  return data.map(row => row.column_name).filter(colName => !systemCols.has(colName));
}

// Object to hold grouped CSV rows.
const groups = {};

// When the CSV upload button is clicked:
uploadCsvBtn.addEventListener("click", async () => {
  // Clear previous messages.
  uploadMessageDiv.textContent = "";
  uploadSummaryDiv.innerHTML = "";

  // Determine CSV test type from radio buttons.
  const csvTestType = document.querySelector('input[name="csvTestType"]:checked').value;
  // Decide target table based on selection.
  const targetTable = csvTestType === "PDF" ? "questions" : "questions_bancaDati";

  // Get expected columns dynamically.
  const expectedColumns = await getExpectedColumns(targetTable);
  console.log("Expected Columns:", expectedColumns);

  // Ensure a CSV file is selected.
  if (!csvFileInput.files || csvFileInput.files.length === 0) {
    uploadMessageDiv.innerHTML = "<p class='error'>Per favore, seleziona un file CSV.</p>";
    return;
  }
  const file = csvFileInput.files[0];

  // Parse CSV with PapaParse.
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const csvData = results.data;
      const csvColumns = results.meta.fields;
      console.log("CSV Columns:", csvColumns);

      // Check if all expected columns are present.
      const missingColumns = expectedColumns.filter(col => !csvColumns.includes(col));
      if (missingColumns.length > 0) {
        uploadMessageDiv.innerHTML = `
          <p class='error'>Errore: Mancano le seguenti colonne nel CSV:</p>
          <p>Attese: ${expectedColumns.join(", ")}</p>
          <p>Presenti: ${csvColumns.join(", ")}</p>
          <p>Correggere il file CSV e riprovare.</p>
        `;
        return;
      }
      
      // Process each row: convert JSON-style arrays.
      csvData.forEach(row => {
        if (row.wrong_answers) {
          row.wrong_answers = convertJsonToPgArray(row.wrong_answers);
        }
        // You can add further conversions here if needed.
      });
      
      // Clear any previous grouping.
      for (const k in groups) { delete groups[k]; }
      
      // Group rows by section, tipologia_esercizi, progressivo, and tipologia_test.
      csvData.forEach(row => {
        const section = row.section.trim();
        const tipologia_esercizi = row.tipologia_esercizi.trim();
        const progressivo = row.progressivo.trim();
        const tipologia_test = row.tipologia_test.trim();
        const key = `${section}||${tipologia_esercizi}||${progressivo}||${tipologia_test}`;
        if (!groups[key]) {
          if (targetTable === "questions_bancaDati") {
            groups[key] = {
              section,
              tipologia_esercizi,
              progressivo,
              tipologia_test,
              count: 0,
              images: {}  // For Banca Dati, store image URLs per question.
            };
          } else {
            groups[key] = {
              section,
              tipologia_esercizi,
              progressivo,
              tipologia_test,
              count: 0,
              pdf_url: ""  // For PDF tests.
            };
          }
        }
        groups[key].count++;
      });
  
      // Convert groups to an array and sort by tipologia_test, then section, then tipologia_esercizi, then progressivo.
      const groupArray = Object.values(groups);
      groupArray.sort((a, b) => {
        if (a.tipologia_test < b.tipologia_test) return -1;
        if (a.tipologia_test > b.tipologia_test) return 1;
        if (a.section < b.section) return -1;
        if (a.section > b.section) return 1;
        if (a.tipologia_esercizi < b.tipologia_esercizi) return -1;
        if (a.tipologia_esercizi > b.tipologia_esercizi) return 1;
        return Number(a.progressivo) - Number(b.progressivo);
      });
  
      // Build the summary list.
      let summaryHtml = "<h3>Stai facendo l'upload di questi test:</h3><ol>";
      groupArray.forEach((group, idx) => {
        const { section, tipologia_esercizi, progressivo, tipologia_test, count } = group;
        const groupKey = `${section}||${tipologia_esercizi}||${progressivo}||${tipologia_test}`;
        if (targetTable === "questions_bancaDati") {
          summaryHtml += `<li id="group-${idx}">
            ${tipologia_esercizi} ${progressivo} di ${section} del ${tipologia_test} [${count} domande]
            <ul>`;
          // For each row in csvData that belongs to this group, list the question.
          const filteredRows = csvData.filter(row => {
            const key = `${row.section.trim()}||${row.tipologia_esercizi.trim()}||${row.progressivo.trim()}||${row.tipologia_test.trim()}`;
            return key === groupKey;
          });
          filteredRows.sort((a, b) => Number(a.question_number) - Number(b.question_number));
          filteredRows.forEach(row => {
            summaryHtml += `<li>
              Domanda ${row.question_number}
              <button onclick="uploadImageForGroupQuestion('${groupKey}', ${idx}, '${row.question_number}')">Upload Image</button>
              <span id="imageStatus-${idx}-${row.question_number}"></span>
            </li>`;
          });
          summaryHtml += `</ul></li>`;
        } else {
          // Existing branch for PDF tests.
          summaryHtml += `<li id="group-${idx}">
            ${tipologia_esercizi} ${progressivo} di ${section} del ${tipologia_test} [${count} domande]
            <button onclick="uploadPdfForGroup('${groupKey}', ${idx})">Upload PDF</button>
            <span id="pdfStatus-${idx}"></span>
          </li>`;
        }
      });
      summaryHtml += "</ol>";
      uploadSummaryDiv.innerHTML = summaryHtml;
  
      // Add a confirmation button to upload CSV data.
      const confirmUploadBtn = document.createElement("button");
      confirmUploadBtn.textContent = "Conferma Upload CSV";
      confirmUploadBtn.addEventListener("click", () => {
        // Before uploading CSV data, assign each row the proper URL based on its group.
        csvData.forEach(row => {
          const key = `${row.section.trim()}||${row.tipologia_esercizi.trim()}||${row.progressivo.trim()}||${row.tipologia_test.trim()}`;
          if (targetTable === "questions_bancaDati") {
            if (groups[key] && groups[key].images && groups[key].images[row.question_number]) {
              row.image_url = groups[key].images[row.question_number];
            }
          } else {
            if (groups[key] && groups[key].pdf_url) {
              row.pdf_url = groups[key].pdf_url;
            }
          }
        });
        // Filter each row so that only the expected columns are sent.
        const filteredData = csvData.map(row => filterRow(row, expectedColumns));
        uploadDataToSupabase(filteredData, targetTable);
      });
      uploadSummaryDiv.appendChild(confirmUploadBtn);
    },
    error: function (err) {
      uploadMessageDiv.innerHTML = `<p class='error'>Errore nel parsing del CSV: ${err}</p>`;
    }
  });
});
  
/**
 * Function to upload a selected PDF file for a given test group.
 * @param {string} groupKey - The composite key for the test group.
 * @param {number} groupIdx - The index used to update the status element.
 */
async function uploadPdfForGroup(groupKey, groupIdx) {
  // Create (or reuse) a hidden file input for this group.
  let fileInput = document.getElementById(`pdfInput-${groupIdx}`);
  if (!fileInput) {
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/pdf";
    fileInput.id = `pdfInput-${groupIdx}`;
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
  }
  
  fileInput.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm("Sei sicuro di voler caricare questo PDF per il test?")) return;
    
    // Define a unique file path using the group key and timestamp.
    const filePath = `${groupKey.replace(/\|\|/g, "_")}_${Date.now()}.pdf`;
    
    // Upload the file to Supabase storage bucket "tolc_i".
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("tolc_i")
      .upload(filePath, file);
    if (uploadError) {
      document.getElementById(`pdfStatus-${groupIdx}`).innerText = "Errore upload PDF.";
      console.error("Errore upload PDF:", uploadError.message);
      return;
    }
    
    // Retrieve the public URL.
    const { data, error: dataError } = supabase
      .storage
      .from("tolc_i")
      .getPublicUrl(filePath);
    if (dataError) {
      document.getElementById(`pdfStatus-${groupIdx}`).innerText = "Errore generazione URL.";
      console.error("Errore generazione URL:", dataError.message);
      return;
    }

    console.log("data: ", data);

    console.log("PDF name:", filePath);

    let publicURL = data.publicUrl;
    console.log("PDF uploaded to:", publicURL);
    
    // Save the public URL in the corresponding group.
    for (const key in groups) {
      if (key === groupKey) {
        groups[key].pdf_url = publicURL;
      }
    }
    // Update the status display.
    document.getElementById(`pdfStatus-${groupIdx}`).innerHTML = `<br><em>PDF caricato:</em> <a href="${publicURL}" target="_blank">${publicURL}</a>`;
  };
  
  // Trigger the file selection dialog.
  fileInput.click();
}
  
/**
 * Function to perform the actual upload of CSV data to Supabase.
 */
async function uploadDataToSupabase(data, tableName) {
  const { error } = await supabase
    .from(tableName)
    .insert(data);
    if (error) {
      uploadMessageDiv.innerHTML = `<p class='error'>Errore nell'upload: ${error.message}</p>`;
    } else {
      uploadMessageDiv.innerHTML = `<p>Upload completato con successo! Ricaricamento...</p>`;
      setTimeout(() => {
        location.reload();
      }, 1000); // wait 1 second before refreshing
    }
}

// Expose the function to the global scope for inline onclick usage.
window.uploadPdfForGroup = uploadPdfForGroup;

// --- Addition: List of Already Uploaded Tests ---

async function fetchUploadedTests() {
  // Query both tables with pagination to get ALL records
  let allQuestionsData = [];
  let allBancaData = [];
  
  // Fetch questions table with pagination
  let page = 0;
  let hasMore = true;
  while (hasMore) {
    const { data, error } = await supabase
      .from("questions")
      .select("section, tipologia_esercizi, progressivo, tipologia_test")
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      allQuestionsData = [...allQuestionsData, ...data];
      if (data.length < 1000) hasMore = false;
      page++;
    }
  }
  
  // Fetch questions_bancaDati table with pagination
  page = 0;
  hasMore = true;
  while (hasMore) {
    const { data, error } = await supabase
      .from("questions_bancaDati")
      .select("section, tipologia_esercizi, progressivo, tipologia_test")
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      allBancaData = [...allBancaData, ...data];
      if (data.length < 1000) hasMore = false;
      page++;
    }
  }
  
  const questionsData = allQuestionsData;
  const bancaData = allBancaData;
  const error1 = null;
  const error2 = null;

// Tag source table so we know where to delete later
const qData = questionsData.map(t => ({ ...t, sourceTable: "questions" }));
const bData = bancaData.map(t  => ({ ...t, sourceTable: "questions_bancaDati" }));

// Merge and dedupe
const allTests = [...qData, ...bData];

  if (error1 || error2) {
    console.error("Error fetching tests:", error1, error2);
    return;
  }

  // Remove duplicates based on the combination of section, tipologia_esercizi, progressivo, and tipologia_test.
  const uniqueTestsMap = new Map();
  allTests.forEach(test => {
    const key = `${test.section}||${test.tipologia_esercizi}||${test.progressivo}||${test.tipologia_test}`;
    if (!uniqueTestsMap.has(key)) {
      uniqueTestsMap.set(key, test);
    }
  });
  const uniqueTests = Array.from(uniqueTestsMap.values());

  // Create a set of unique tipologia_test values.
  const tipologiaSet = new Set();
  uniqueTests.forEach(test => tipologiaSet.add(test.tipologia_test));
  const tipologiaArray = Array.from(tipologiaSet).sort();

  // NUOVO CODICE:
let container = document.getElementById("uploadedTestsContainer");
if (!container) {
  container = document.createElement("div");
  container.id = "uploadedTestsContainer";
  
  // Invece di appendere al body, appendiamo al container principale
  const mainContainer = document.querySelector('.container');
  if (mainContainer) {
    mainContainer.appendChild(container);
  } else {
    // Fallback se non trova il container
    document.body.appendChild(container);
  }
}
  container.innerHTML = "<h3>Test già caricati</h3>";

  // Create the dropdown for tipologia_test.
  let dropdown = document.getElementById("uploadedTestsDropdown");
  if (!dropdown) {
    dropdown = document.createElement("select");
    dropdown.id = "uploadedTestsDropdown";
    container.appendChild(dropdown);
  }
  dropdown.innerHTML = "";
  tipologiaArray.forEach(tipologia => {
    const option = document.createElement("option");
    option.value = tipologia;
    option.textContent = tipologia;
    dropdown.appendChild(option);
  });

  // Create a container for the list of tests.
  let listContainer = document.getElementById("uploadedTestsList");
  if (!listContainer) {
    listContainer = document.createElement("ul");
    listContainer.id = "uploadedTestsList";
    container.appendChild(listContainer);
  }

  // Function to update the list based on the selected tipologia_test.
  function updateUploadedTestsList(selectedTipologia) {
    // Filter tests by selected tipologia
    const filteredTests = uniqueTests.filter(test => test.tipologia_test === selectedTipologia);

    // Sort filtered tests alphabetically by `section`
    filteredTests.sort((a, b) => a.section.localeCompare(b.section, undefined, { sensitivity: 'base' }));

    // Clear the list container
    listContainer.innerHTML = "";

    // Populate list with sorted tests
    filteredTests.forEach(test => {
      const li = document.createElement("li");
      li.textContent = `${test.section}: ${test.tipologia_esercizi} ${test.progressivo}`;

      // Contenitore per i pulsanti
      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "inline-flex";
      buttonContainer.style.gap = "0.5rem";
      buttonContainer.style.marginLeft = "1rem";

      // Pulsante Copia (per tutti i test)
      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copia";
      copyBtn.style.cssText = `
        background: white;
        color: #28a745;
        border: 1.5px solid #28a745;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.75rem;
        transition: all 0.3s ease;
      `;
      copyBtn.addEventListener('mouseenter', function() {
        this.style.background = '#28a745';
        this.style.color = 'white';
      });
      copyBtn.addEventListener('mouseleave', function() {
        this.style.background = 'white';
        this.style.color = '#28a745';
      });
      copyBtn.addEventListener("click", () => copyTest(test));
      buttonContainer.appendChild(copyBtn);

      // Pulsante Modifica (solo per test PDF, non per Banca Dati)
      if (test.sourceTable === "questions") {
        const modifyBtn = document.createElement("button");
        modifyBtn.textContent = "Modifica PDF";
        modifyBtn.classList.add("modify-test-btn");
        modifyBtn.addEventListener("click", () => modifyTestPdf(test));
        buttonContainer.appendChild(modifyBtn);

        // Pulsante Carica Inglese (nuovo)
        const uploadEnBtn = document.createElement("button");
        uploadEnBtn.textContent = "📄 Carica Inglese";
        uploadEnBtn.style.cssText = `
          background: white;
          color: #17a2b8;
          border: 1.5px solid #17a2b8;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.3s ease;
        `;
        uploadEnBtn.addEventListener('mouseenter', function() {
          this.style.background = '#17a2b8';
          this.style.color = 'white';
        });
        uploadEnBtn.addEventListener('mouseleave', function() {
          this.style.background = 'white';
          this.style.color = '#17a2b8';
        });
        uploadEnBtn.addEventListener("click", () => uploadEnglishPdf(test));
        buttonContainer.appendChild(uploadEnBtn);
      }

      // Pulsante Elimina
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Elimina";
      deleteBtn.classList.add("delete-test-btn");
      deleteBtn.addEventListener("click", () => deleteTestGroup(test));
      buttonContainer.appendChild(deleteBtn);

      li.appendChild(buttonContainer);
      listContainer.appendChild(li);
    });
  }

  async function deleteTestGroup(test) {
    const ok = confirm(
      `Sei sicuro di voler eliminare TUTTI i dati per:\n` +
      `${test.tipologia_test}, ${test.section}: ${test.tipologia_esercizi} ${test.progressivo}\n\n` +
      `Questo rimuoverà domande e progressi studenti definitivamente.`
    );
    if (!ok) return;
  
    // 1️⃣ Delete from questions/questions_bancaDati
    let { error: qErr } = await supabase
      .from(test.sourceTable)
      .delete()
      .eq("section", test.section)
      .eq("tipologia_esercizi", test.tipologia_esercizi)
      .eq("progressivo", test.progressivo)
      .eq("tipologia_test", test.tipologia_test);
  
    if (qErr) {
      alert("Errore eliminazione domande: " + qErr.message);
      console.error(qErr);
      return;
    }
  
    // 2️⃣ Delete from student_tests
    let { error: sErr } = await supabase
      .from("student_tests")
      .delete()
      .eq("section", test.section)
      .eq("tipologia_esercizi", test.tipologia_esercizi)
      .eq("progressivo", test.progressivo)
      .eq("tipologia_test", test.tipologia_test);
  
    if (sErr) {
      alert("Errore eliminazione progressi studenti: " + sErr.message);
      console.error(sErr);
      return;
    }
  
    alert("✅ Test e progressi eliminati con successo.");
    // 3️⃣ Refresh the "Test già caricati" panel
    fetchUploadedTests();
  }

  // Update list when the dropdown value changes.
  dropdown.addEventListener("change", () => {
    updateUploadedTestsList(dropdown.value);
  });

  // Initially populate the list with the first tipologia_test.
  if (tipologiaArray.length > 0) {
    updateUploadedTestsList(tipologiaArray[0]);
  }
}

// Call fetchUploadedTests after the DOM is loaded.
document.addEventListener("DOMContentLoaded", () => {
  fetchUploadedTests();
});

// Aggiungi questa funzione dopo la funzione deleteTestGroup nel file modify_tests.js

async function modifyTestPdf(test) {
  // Crea un input file nascosto per il nuovo PDF
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/pdf";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);
  
  fileInput.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const ok = confirm(
      `Vuoi sostituire il PDF per:\n` +
      `${test.tipologia_test}, ${test.section}: ${test.tipologia_esercizi} ${test.progressivo}?\n\n` +
      `I dati e i progressi degli studenti rimarranno invariati.`
    );
    if (!ok) return;
    
    try {
      // 1️⃣ Carica il nuovo PDF su Supabase Storage
      const filePath = `${test.section}_${test.tipologia_esercizi}_${test.progressivo}_${test.tipologia_test}_${Date.now()}.pdf`.replace(/\s+/g, "_");
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("tolc_i")
        .upload(filePath, file);
        
      if (uploadError) {
        alert("Errore durante il caricamento del PDF: " + uploadError.message);
        console.error("Errore upload PDF:", uploadError);
        return;
      }
      
      // 2️⃣ Ottieni l'URL pubblico del nuovo PDF
      const { data, error: urlError } = supabase
        .storage
        .from("tolc_i")
        .getPublicUrl(filePath);
        
      if (urlError) {
        alert("Errore nella generazione dell'URL: " + urlError.message);
        console.error("Errore URL:", urlError);
        return;
      }
      
      const newPdfUrl = data.publicUrl;
      console.log("Nuovo PDF caricato:", newPdfUrl);
      
      // 3️⃣ Aggiorna l'URL del PDF nel database
      // Determina quale tabella aggiornare in base a sourceTable
      const tableToUpdate = test.sourceTable || "questions";
      
      const { error: updateError } = await supabase
        .from(tableToUpdate)
        .update({ pdf_url: newPdfUrl })
        .eq("section", test.section)
        .eq("tipologia_esercizi", test.tipologia_esercizi)
        .eq("progressivo", test.progressivo)
        .eq("tipologia_test", test.tipologia_test);
        
      if (updateError) {
        alert("Errore nell'aggiornamento del database: " + updateError.message);
        console.error("Errore update:", updateError);
        return;
      }
      
      // 4️⃣ (Opzionale) Elimina il vecchio PDF dal bucket se vuoi risparmiare spazio
      // Per fare questo, dovresti prima recuperare il vecchio pdf_url dal database
      // const { data: oldData } = await supabase
      //   .from(tableToUpdate)
      //   .select("pdf_url")
      //   .eq("section", test.section)
      //   .eq("tipologia_esercizi", test.tipologia_esercizi)
      //   .eq("progressivo", test.progressivo)
      //   .eq("tipologia_test", test.tipologia_test)
      //   .single();
      // 
      // if (oldData?.pdf_url) {
      //   // Estrai il nome del file dall'URL
      //   const oldFileName = oldData.pdf_url.split('/').pop();
      //   await supabase.storage.from("tolc_i").remove([oldFileName]);
      // }
      
      alert("✅ PDF aggiornato con successo!");
      
      // Ricarica la lista dei test
      fetchUploadedTests();
      
    } catch (error) {
      alert("Errore durante la modifica del PDF: " + error.message);
      console.error("Errore generale:", error);
    }
    
    // Rimuovi l'input file dal DOM
    document.body.removeChild(fileInput);
  };
  
  // Attiva la selezione del file
  fileInput.click();
}

// Nuova funzione per caricare PDF inglese con controlli di sicurezza
async function uploadEnglishPdf(test) {
  console.log("📚 === INIZIO CARICAMENTO PDF INGLESE ===");
  console.log("📊 Test selezionato:", test);
  
  try {
    // 1️⃣ STEP 1: Recupera il pdf_url italiano corrente per questo gruppo
    console.log("🔍 Step 1: Recupero pdf_url italiano dal database...");
    
    const { data: italianData, error: fetchError } = await supabase
      .from("questions")
      .select("pdf_url")
      .eq("section", test.section)
      .eq("tipologia_esercizi", test.tipologia_esercizi)
      .eq("progressivo", test.progressivo)
      .eq("tipologia_test", test.tipologia_test)
      .limit(1)
      .single();
    
    if (fetchError) {
      console.error("❌ Errore nel recupero del PDF italiano:", fetchError);
      alert("Errore nel recupero del PDF italiano: " + fetchError.message);
      return;
    }
    
    if (!italianData || !italianData.pdf_url) {
      console.error("❌ PDF italiano non trovato per questo test");
      alert("PDF italiano non trovato per questo test. Carica prima il PDF italiano.");
      return;
    }
    
    const italianPdfUrl = italianData.pdf_url;
    console.log("✅ PDF italiano trovato:", italianPdfUrl);
    
    // 2️⃣ STEP 2: Verifica che tutte le righe abbiano lo stesso pdf_url (consistenza)
    console.log("🔍 Step 2: Verifico consistenza dei dati...");
    
    const { data: allRows, error: checkError } = await supabase
      .from("questions")
      .select("id, pdf_url, question_number")
      .eq("section", test.section)
      .eq("tipologia_esercizi", test.tipologia_esercizi)
      .eq("progressivo", test.progressivo)
      .eq("tipologia_test", test.tipologia_test);
    
    if (checkError) {
      console.error("❌ Errore nella verifica consistenza:", checkError);
      alert("Errore nella verifica dei dati: " + checkError.message);
      return;
    }
    
    console.log(`📊 Trovate ${allRows.length} righe per questo test`);
    
    // Verifica che tutti abbiano lo stesso pdf_url
    const inconsistentRows = allRows.filter(row => row.pdf_url !== italianPdfUrl);
    if (inconsistentRows.length > 0) {
      console.warn("⚠️ ATTENZIONE: Trovate righe con pdf_url diverso!");
      console.warn("Righe inconsistenti:", inconsistentRows);
      const proceed = confirm(
        `⚠️ ATTENZIONE: ${inconsistentRows.length} righe su ${allRows.length} hanno un pdf_url diverso.\n\n` +
        `Vuoi procedere aggiornando SOLO le ${allRows.length - inconsistentRows.length} righe con il PDF corretto?`
      );
      if (!proceed) {
        console.log("❌ Operazione annullata dall'utente");
        return;
      }
    } else {
      console.log("✅ Tutte le righe hanno lo stesso pdf_url italiano");
    }
    
    // 3️⃣ STEP 3: Crea input file per selezionare il PDF inglese
    console.log("📁 Step 3: Richiesta selezione file PDF inglese...");
    
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/pdf";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        console.log("❌ Nessun file selezionato");
        return;
      }
      
      console.log("📄 File selezionato:", file.name, "Size:", file.size, "bytes");
      
      const confirmUpload = confirm(
        `📚 Confermi il caricamento del PDF INGLESE per:\n\n` +
        `Test: ${test.tipologia_test}\n` +
        `Sezione: ${test.section}\n` +
        `Tipo: ${test.tipologia_esercizi} ${test.progressivo}\n` +
        `File: ${file.name}\n\n` +
        `Questo aggiornerà ${allRows.length - inconsistentRows.length} domande.`
      );
      
      if (!confirmUpload) {
        console.log("❌ Caricamento annullato dall'utente");
        document.body.removeChild(fileInput);
        return;
      }
      
      try {
        // 4️⃣ STEP 4: TEST BUCKET E CARICA PDF
        console.log("📤 Step 4: Test bucket e caricamento PDF...");
        
        // TEST 4.1: Verifica che il bucket esista e sia accessibile
        console.log("🔍 Test 4.1: Verifica accesso al bucket PDF_eng...");
        
        // Prova a listare i file nel bucket (anche vuoto)
        const { data: listData, error: listError } = await supabase
          .storage
          .from("PDF_eng")
          .list("", { limit: 1 });
        
        if (listError) {
          console.error("❌ Errore accesso al bucket PDF_eng:", listError);
          console.error("Dettagli errore:", {
            message: listError.message,
            status: listError.status,
            statusCode: listError.statusCode
          });
          alert(`Errore accesso al bucket PDF_eng:\n${listError.message}\n\nVerifica che il bucket esista e sia accessibile.`);
          document.body.removeChild(fileInput);
          return;
        }
        
        console.log("✅ Bucket PDF_eng accessibile. Files trovati:", listData);
        
        // TEST 4.2: Genera nome file
        const timestamp = Date.now();
        const cleanFileName = `${test.section}_${test.tipologia_esercizi}_${test.progressivo}_${test.tipologia_test}_EN_${timestamp}.pdf`
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_\-\.]/g, "");
        
        console.log("📝 Nome file pulito:", cleanFileName);
        console.log("📊 Info file da caricare:", {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
        
        // TEST 4.3: Prova upload nel bucket PDF_eng
        console.log("📤 Test 4.3: Upload file nel bucket PDF_eng...");
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from("PDF_eng")
          .upload(cleanFileName, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          console.error("❌ Errore upload PDF:", uploadError);
          console.error("Dettagli errore upload:", {
            message: uploadError.message,
            status: uploadError.status,
            statusCode: uploadError.statusCode,
            error: uploadError.error,
            __isStorageError: uploadError.__isStorageError
          });
          
          alert(`Errore durante il caricamento del PDF: ${uploadError.message}`);
          document.body.removeChild(fileInput);
          return;
        }
        
        console.log("✅ PDF caricato con successo:", uploadData);
        
        // 5️⃣ STEP 5: Ottieni l'URL pubblico del PDF inglese
        console.log("🔗 Step 5: Generazione URL pubblico...");
        
        const { data: urlData, error: urlError } = supabase
          .storage
          .from("PDF_eng")
          .getPublicUrl(cleanFileName);
        
        if (urlError) {
          console.error("❌ Errore generazione URL:", urlError);
          alert("Errore nella generazione dell'URL: " + urlError.message);
          document.body.removeChild(fileInput);
          return;
        }
        
        const englishPdfUrl = urlData.publicUrl;
        console.log("✅ URL pubblico generato:", englishPdfUrl);
        
        // 6️⃣ STEP 6: Aggiorna SOLO le righe con il pdf_url italiano corretto
        console.log("💾 Step 6: Aggiornamento database con pdf_url_eng...");
        console.log(`🎯 Aggiorno solo le righe con pdf_url = ${italianPdfUrl}`);
        
        const { data: updateData, error: updateError } = await supabase
          .from("questions")
          .update({ pdf_url_eng: englishPdfUrl })
          .eq("section", test.section)
          .eq("tipologia_esercizi", test.tipologia_esercizi)
          .eq("progressivo", test.progressivo)
          .eq("tipologia_test", test.tipologia_test)
          .eq("pdf_url", italianPdfUrl)  // IMPORTANTE: aggiorna SOLO righe con questo pdf_url
          .select();
        
        if (updateError) {
          console.error("❌ Errore aggiornamento database:", updateError);
          alert("Errore nell'aggiornamento del database: " + updateError.message);
          
          // Tentativo di pulizia: rimuovi il PDF caricato
          console.log("🧹 Tentativo di rimozione del PDF caricato...");
          await supabase.storage.from("PDF_eng").remove([cleanFileName]);
          
          document.body.removeChild(fileInput);
          return;
        }
        
        console.log(`✅ Database aggiornato! Righe modificate: ${updateData.length}`);
        console.log("📊 Dettaglio righe aggiornate:", updateData);
        
        // 7️⃣ STEP 7: Verifica finale
        console.log("✔️ Step 7: Verifica finale...");
        
        const { data: finalCheck, error: finalError } = await supabase
          .from("questions")
          .select("id, pdf_url, pdf_url_eng")
          .eq("section", test.section)
          .eq("tipologia_esercizi", test.tipologia_esercizi)
          .eq("progressivo", test.progressivo)
          .eq("tipologia_test", test.tipologia_test);
        
        if (!finalError) {
          const withEnglish = finalCheck.filter(row => row.pdf_url_eng === englishPdfUrl).length;
          const withoutEnglish = finalCheck.filter(row => !row.pdf_url_eng).length;
          
          console.log("📊 === RIEPILOGO FINALE ===");
          console.log(`✅ Righe con PDF inglese: ${withEnglish}`);
          console.log(`⏳ Righe senza PDF inglese: ${withoutEnglish}`);
          console.log(`📚 Totale righe: ${finalCheck.length}`);
          
          alert(
            `✅ PDF inglese caricato con successo!\n\n` +
            `📊 Riepilogo:\n` +
            `• Righe aggiornate: ${updateData.length}\n` +
            `• Righe totali del test: ${finalCheck.length}\n` +
            `• URL PDF inglese: ${englishPdfUrl.substring(0, 50)}...`
          );
        }
        
        console.log("🎉 === CARICAMENTO COMPLETATO CON SUCCESSO ===");
        
        // Ricarica la lista dei test
        fetchUploadedTests();
        
      } catch (error) {
        console.error("❌ Errore generale durante il caricamento:", error);
        alert("Errore durante il caricamento: " + error.message);
      } finally {
        // Pulizia: rimuovi l'input file
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
      }
    };
    
    // Attiva la selezione del file
    fileInput.click();
    
  } catch (error) {
    console.error("❌ Errore generale nella funzione uploadEnglishPdf:", error);
    alert("Errore: " + error.message);
  }
}

// Sostituisci la funzione copyTest in modify_tests.js con questa versione migliorata

async function copyTest(test) {
  // Lista delle tipologie disponibili
  const tipologieDisponibili = [
    'BOCCONI',
    'TOLC I',
    'TOLC E',
    'TOL',
    'MEDICINA',
    'CATTOLICA',
    'BOCCONI MAGISTRALE',
    'BOCCONI LAW'
  ];
  
  // Rimuovi la tipologia attuale dalla lista
  const altriTipi = tipologieDisponibili.filter(t => t !== test.tipologia_test);
  
  // Crea il modal se non esiste
  let modal = document.getElementById('copyTestModal');
  if (!modal) {
    // Crea la struttura del modal
    modal = document.createElement('div');
    modal.id = 'copyTestModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
    `;
    
    modalContent.innerHTML = `
      <h3 style="margin-bottom: 1rem; color: rgb(28, 37, 69);">📋 Copia Test</h3>
      <div id="copyTestInfo" style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; font-size: 0.9rem;"></div>
      
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: rgb(28, 37, 69);">
        Seleziona la nuova tipologia test:
      </label>
      
      <select id="copyTestSelect" style="
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
        cursor: pointer;
        background: white;
      ">
        <option value="">-- Seleziona tipologia --</option>
      </select>
      
      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button id="copyTestCancel" style="
          background: white;
          color: #666;
          border: 1px solid #ddd;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          Annulla
        </button>
        <button id="copyTestConfirm" style="
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          Conferma Copia
        </button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Event listener per chiudere il modal cliccando fuori
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Mostra le informazioni del test da copiare
  document.getElementById('copyTestInfo').innerHTML = `
    <strong>Stai copiando:</strong><br>
    📚 ${test.tipologia_test}<br>
    📁 ${test.section}: ${test.tipologia_esercizi} ${test.progressivo}
  `;
  
  // Popola il select con le opzioni
  const select = document.getElementById('copyTestSelect');
  select.innerHTML = '<option value="">-- Seleziona tipologia --</option>';
  altriTipi.forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo;
    option.textContent = tipo;
    select.appendChild(option);
  });
  
  // Mostra il modal
  modal.style.display = 'flex';
  
  // Rimuovi i vecchi event listener per evitare duplicati
  const newCancelBtn = document.getElementById('copyTestCancel').cloneNode(true);
  const newConfirmBtn = document.getElementById('copyTestConfirm').cloneNode(true);
  document.getElementById('copyTestCancel').replaceWith(newCancelBtn);
  document.getElementById('copyTestConfirm').replaceWith(newConfirmBtn);
  
  // Event listener per annulla
  newCancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Event listener per conferma
  newConfirmBtn.addEventListener('click', async () => {
    const nuovaTipologia = select.value;
    
    if (!nuovaTipologia) {
      alert('Seleziona una tipologia test!');
      return;
    }
    
    // Chiudi il modal
    modal.style.display = 'none';
    
    // Conferma finale
    const conferma = confirm(
      `Confermi di voler copiare TUTTE le domande?\n\n` +
      `Da: ${test.tipologia_test}\n` +
      `A: ${nuovaTipologia}\n\n` +
      `Sezione: ${test.section}\n` +
      `Tipo: ${test.tipologia_esercizi} ${test.progressivo}`
    );
    
    if (!conferma) return;
    
    try {
      // 1. Prima recupera tutte le domande del test originale
      const { data: domande, error: fetchError } = await supabase
        .from(test.sourceTable)
        .select('*')
        .eq("section", test.section)
        .eq("tipologia_esercizi", test.tipologia_esercizi)
        .eq("progressivo", test.progressivo)
        .eq("tipologia_test", test.tipologia_test);
      
      if (fetchError) {
        alert("Errore nel recupero delle domande: " + fetchError.message);
        console.error(fetchError);
        return;
      }
      
      if (!domande || domande.length === 0) {
        alert("Nessuna domanda trovata per questo test");
        return;
      }
      
      console.log(`Trovate ${domande.length} domande da copiare`);
      
      // 2. Prepara le domande per la copia
      const domandeNuove = domande.map(domanda => {
        // Rimuovi i campi auto-generati
        const { id, created_at, updated_at, ...domandaDaCopiare } = domanda;
        
        // Cambia la tipologia test
        return {
          ...domandaDaCopiare,
          tipologia_test: nuovaTipologia
        };
      });
      
      // 3. Verifica se esiste già un test con questi parametri
      const { data: testEsistente, error: checkError } = await supabase
        .from(test.sourceTable)
        .select('id')
        .eq("section", test.section)
        .eq("tipologia_esercizi", test.tipologia_esercizi)
        .eq("progressivo", test.progressivo)
        .eq("tipologia_test", nuovaTipologia)
        .limit(1);
      
      if (checkError) {
        alert("Errore nella verifica: " + checkError.message);
        return;
      }
      
      if (testEsistente && testEsistente.length > 0) {
        const sovrascrivi = confirm(
          `⚠️ ATTENZIONE: Esiste già un test con questi parametri!\n\n` +
          `${nuovaTipologia}, ${test.section}: ${test.tipologia_esercizi} ${test.progressivo}\n\n` +
          `Vuoi SOVRASCRIVERE il test esistente?`
        );
        
        if (!sovrascrivi) return;
        
        // Elimina il test esistente prima di inserire il nuovo
        const { error: deleteError } = await supabase
          .from(test.sourceTable)
          .delete()
          .eq("section", test.section)
          .eq("tipologia_esercizi", test.tipologia_esercizi)
          .eq("progressivo", test.progressivo)
          .eq("tipologia_test", nuovaTipologia);
        
        if (deleteError) {
          alert("Errore nell'eliminazione del test esistente: " + deleteError.message);
          return;
        }
      }
      
      // 4. Inserisci le nuove domande
      const { error: insertError } = await supabase
        .from(test.sourceTable)
        .insert(domandeNuove);
      
      if (insertError) {
        alert("Errore nella copia delle domande: " + insertError.message);
        console.error(insertError);
        return;
      }
      
      alert(
        `✅ Test copiato con successo!\n\n` +
        `Da: ${test.tipologia_test}\n` +
        `A: ${nuovaTipologia}\n` +
        `Domande copiate: ${domandeNuove.length}\n\n` +
        `Il test è ora disponibile in "${nuovaTipologia}"`
      );
      
      // 5. Aggiorna la lista dei test
      fetchUploadedTests();
      
    } catch (error) {
      alert("Errore durante la copia del test: " + error.message);
      console.error("Errore generale:", error);
    }
  });
}

// Esponi le funzioni al contesto globale
window.modifyTestPdf = modifyTestPdf;
window.copyTest = copyTest;

async function uploadImageForGroupQuestion(groupKey, groupIdx, questionNumber) {
  // Create (or reuse) a hidden file input for the image upload.
  let fileInput = document.getElementById(`imageInput-${groupIdx}-${questionNumber}`);
  if (!fileInput) {
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.id = `imageInput-${groupIdx}-${questionNumber}`;
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
  }
  
  fileInput.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm("Sei sicuro di voler caricare questa immagine per la domanda?")) return;
    
    // Define a unique file path using the group key, question number, and timestamp.
    const filePath = `${groupKey.replace(/\|\|/g, "_")}_${questionNumber}_${Date.now()}.jpg`;
    
    // Upload the image file to Supabase storage bucket "images".
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("images")
      .upload(filePath, file);
      console.log("uploadData: ", uploadData);
      console.log("filePath: ", filePath);
    if (uploadError) {
      document.getElementById(`imageStatus-${groupIdx}-${questionNumber}`).innerText = "Errore upload immagine.";
      console.error("Errore upload immagine:", uploadError.message);
      return;
    }
    
    // Retrieve the public URL for the uploaded image.
    const { data, error: dataError } = supabase
      .storage
      .from("images")
      .getPublicUrl(filePath);
    if (dataError) {
      document.getElementById(`imageStatus-${groupIdx}-${questionNumber}`).innerText = "Errore generazione URL.";
      console.error("Errore generazione URL:", dataError.message);
      return;
    }
    
    let publicURL = data.publicUrl;
    console.log("Image uploaded to:", publicURL);
    
    // Save the public URL in the group object as 'image_url'
    for (const key in groups) {
      if (key === groupKey) {
        groups[key].images[questionNumber] = publicURL;
      }
    }
    // Update the status display.
    document.getElementById(`imageStatus-${groupIdx}-${questionNumber}`).innerHTML = `<br><em>Immagine caricata:</em> <a href="${publicURL}" target="_blank">${publicURL}</a>`;
  };
  
  // Trigger the file selection dialog.
  fileInput.click();
}

window.uploadImageForGroupQuestion = uploadImageForGroupQuestion;

function filterRow(row, allowedKeys) {
  const newRow = {};
  allowedKeys.forEach(key => {
    if (row.hasOwnProperty(key)) {
      newRow[key] = row[key];
    }
  });
  return newRow;
}

document.getElementById('templateBtn').addEventListener('click', () => {
  // opens the Sheet in a new tab
  window.open(
    'https://docs.google.com/spreadsheets/d/1KC3trv5Z3wfN1hjPI2q5FDrQ_0uNNnUw6JZSG4JdVts/edit?usp=sharing',
    '_blank'
  );
});