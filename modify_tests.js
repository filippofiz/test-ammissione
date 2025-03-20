// modify_tests.js
// This script handles CSV uploads for questions.
// Depending on the selected radio button, it chooses the target table (PDF: "questions", Banca Dati: "questions_bancaDati").
// It dynamically retrieves the expected columns from Supabase (via RPC), then parses the CSV file using PapaParse.
// It converts any JSON-style array values (e.g. in wrong_answers) into PostgreSQL array literals,
// groups the CSV rows by section, tipologia_esercizi, progressivo and tipologia_test,
// sorts the groups in the desired order, and displays a summary.
// For each group, an "Upload PDF" button is provided. When clicked, the user selects a PDF file which is uploaded to the
// Supabase storage bucket "tolc_i" and its public URL is saved for that group.
// Finally, when the user clicks "Conferma Upload CSV", each CSV row’s pdf_url is set based on its group, and the CSV data is inserted.

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
          groups[key] = {
            section,
            tipologia_esercizi,
            progressivo,
            tipologia_test,
            count: 0,
            pdf_url: "" // Will be set after PDF upload.
          };
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
        summaryHtml += `<li id="group-${idx}">
            ${tipologia_esercizi} ${progressivo} di ${section} del ${tipologia_test} [${count} domande]
            <button onclick="uploadPdfForGroup('${groupKey}', ${idx})">Upload PDF</button>
            <span id="pdfStatus-${idx}"></span>
          </li>`;
      });
      summaryHtml += "</ol>";
      uploadSummaryDiv.innerHTML = summaryHtml;
  
      // Add a confirmation button to upload CSV data.
      const confirmUploadBtn = document.createElement("button");
      confirmUploadBtn.textContent = "Conferma Upload CSV";
      confirmUploadBtn.addEventListener("click", () => {
        // Before uploading CSV data, assign each row the pdf_url based on its group.
        csvData.forEach(row => {
          const key = `${row.section.trim()}||${row.tipologia_esercizi.trim()}||${row.progressivo.trim()}||${row.tipologia_test.trim()}`;
          if (groups[key] && groups[key].pdf_url) {
            row.pdf_url = groups[key].pdf_url;
          }
        });
        uploadDataToSupabase(csvData, targetTable);
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
    uploadMessageDiv.innerHTML = `<p>Upload completato con successo!</p>`;
  }
}

// Expose the function to the global scope for inline onclick usage.
window.uploadPdfForGroup = uploadPdfForGroup;