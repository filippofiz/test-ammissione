// excel-form-pdf.js - Form Excel specializzato per Test PDF
// 
// Progressivo: calcolato automaticamente leggendo dalla lista #uploadedTestsList
// La lista è già filtrata per tipologia test dal dropdown
// Cerca: "sezione: tipologia_esercizi progressivo"
// Non incrementa se apri il form senza salvare
//
// Navigazione con tastiera (come Excel):
// - Frecce: muovi tra celle
// - Tab: prossima cella editabile
// - Enter: vai alla riga sotto
//
// Istruzioni collassabili: clicca su "📘 Istruzioni e suggerimenti" per aprire/chiudere
//
// Validazione completa prima del salvataggio:
// - PDF caricato obbligatorio
// - Risposte corrette: solo a, b, c, d, e
// - Numeri pagina: progressione stretta (= precedente o +1)
//   Prima riga: avviso se ≠ 1 (non blocca)
// - Argomenti (per Simulazioni): solo valori predefiniti
//
// Supporta copia/incolla multiplo da Excel per:
// - Pagina: con validazione progressione stretta
// - Risposta corretta: normalizzazione a minuscolo, solo a-e
// - Argomento: con normalizzazione e validazione
//
// Logica dei campi condizionali basata sulla Macro-sezione:
// 
// Se Macro-sezione = "Simulazioni":
//   - Sezione = "Simulazioni" (readonly)
//   - Tipologia = "Test" (readonly)
//   - Argomento = input con dropdown (datalist) - supporta sia selezione che copia/incolla
//     Normalizzazione automatica: rimuove spazi extra, prima lettera maiuscola
//     Valori validi: Algebra, Logaritmi ed esponenziali, Probabilità combinatoria e statistica,
//     Goniometria e trigonometria, Geometria, Funzioni, Pensiero critico, Ragionamento numerico
// 
// Se Macro-sezione = "Altro", "Matematica" o "Assessment Iniziale":
//   - Sezione = dropdown con tutte le opzioni matematiche
//   - Tipologia = dropdown (Esercizi per casa/Assessment)
//   - Argomento = readonly uguale alla sezione selezionata

// Configurazione Supabase
const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";

// Inizializza Supabase client
let supabase;

// Attendi che Supabase sia disponibile
function initSupabase() {
  // Prova prima a usare l'istanza globale se esiste
  if (window.supabase) {
    supabase = window.supabase;
    return true;
  }
  
  // Altrimenti prova a creare una nuova istanza
  if (window.supabaseClient && window.supabaseClient.createClient) {
    supabase = window.supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabase = supabase; // Salva globalmente
    return true;
  }
  
  return false;
}

class ExcelFormPDF {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.tableData = [];
    this.commonData = {};
    
    // Lista argomenti validi con categorie - definita una volta sola
    this.argomentiConCategoria = [
      // Matematica
      { value: 'Logica e insiemi', category: 'MAT', color: '#1976d2' },
      { value: 'Algebra', category: 'MAT', color: '#1976d2' },
      { value: 'Logaritmi ed esponenziali', category: 'MAT', color: '#1976d2' },
      { value: 'Probabilità, combinatoria e statistica', category: 'MAT', color: '#1976d2' },
      { value: 'Goniometria e trigonometria', category: 'MAT', color: '#1976d2' },
      { value: 'Geometria', category: 'MAT', color: '#1976d2' },
      { value: 'Funzioni', category: 'MAT', color: '#1976d2' },
      // Fisica
      { value: 'Cinematica e vettori', category: 'FIS', color: '#2e7d32' },
      { value: 'Dinamica e energia', category: 'FIS', color: '#2e7d32' },
      { value: 'Fluidi termodinamica e onde', category: 'FIS', color: '#2e7d32' },
      { value: 'Elettromagnetismo', category: 'FIS', color: '#2e7d32' },
      // Scienze
      { value: 'Atomo, tavola periodica e materia', category: 'SCI', color: '#d84315' },
      { value: 'Chimica organica e biochimica', category: 'SCI', color: '#d84315' },
      { value: 'Nomenclatura e legami', category: 'SCI', color: '#d84315' },
      { value: 'Stechiometria e soluzioni', category: 'SCI', color: '#d84315' },
      // Altri
      { value: 'Pensiero critico', category: 'GEN', color: '#6a1b9a' },
      { value: 'Ragionamento numerico', category: 'GEN', color: '#6a1b9a' },
      { value: 'Comprensione verbale', category: 'GEN', color: '#6a1b9a' },
      { value: 'Logica', category: 'GEN', color: '#6a1b9a' },
      { value: 'Inglese', category: 'GEN', color: '#6a1b9a' }
    ];
    
    // Lista dei valori validi estratti (usata per validazioni)
    this.validArgomenti = this.argomentiConCategoria.map(item => item.value);
    
    this.columns = [
      'tipologia_test',
      'Materia',
      'section',
      'tipologia_esercizi',
      'progressivo',
      'page_number',
      'question_number',
      'correct_answer',
      'wrong_answers',
      'is_open_ended',
      'argomento',
      'pdf_url'
    ];
  }

  init() {
    this.createOverlay();
    this.attachStyles();
  }

  attachStyles() {
    // Evita di aggiungere stili duplicati
    if (document.getElementById('excel-form-pdf-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'excel-form-pdf-styles';
    style.textContent = `
      .excel-pdf-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        z-index: 1000;
        overflow-y: auto;
        padding: 20px 0;
      }

      .excel-pdf-container {
        background: white;
        margin: 0 auto;
        max-width: 95%;
        width: 95%;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        min-height: 200px;
        max-height: none;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .excel-pdf-header {
        background: rgb(28, 37, 69);
        color: white;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .excel-pdf-header h3 {
        margin: 0;
        font-size: 1.3rem;
      }

      .excel-pdf-controls {
        display: flex;
        gap: 1rem;
      }

      .excel-pdf-btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.85rem;
      }

      .excel-pdf-btn.primary {
        background: #00a666;
        color: white;
      }

      .excel-pdf-btn.primary:hover {
        background: #008c55;
      }

      .excel-pdf-btn.secondary {
        background: white;
        color: rgb(28, 37, 69);
      }

      .excel-pdf-btn.secondary:hover {
        background: #f8f9fa;
      }

      .excel-pdf-btn.danger {
        background: #dc3545;
        color: white;
      }

      .excel-pdf-table-wrapper {
        padding: 1rem;
        background: #f8f9fa;
        min-height: 400px;
      }

      .excel-pdf-table {
        width: 100%;
        background: white;
        border-collapse: collapse;
        font-size: 0.85rem;
      }

      .excel-pdf-table th {
        background: #e9ecef;
        padding: 0.75rem 0.5rem;
        text-align: left;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 10;
        border: 1px solid #dee2e6;
      }

      .excel-pdf-table td {
        padding: 0.25rem;
        border: 1px solid #dee2e6;
      }

      .excel-pdf-table input,
      .excel-pdf-table select,
      .excel-pdf-table textarea {
        width: 100%;
        padding: 0.5rem;
        border: none;
        background: transparent;
        font-size: 0.85rem;
        font-family: inherit;
      }

      .excel-pdf-table input:focus,
      .excel-pdf-table select:focus,
      .excel-pdf-table textarea:focus {
        outline: 2px solid #00a666;
        background: white;
        box-shadow: 0 0 0 3px rgba(0, 166, 102, 0.1);
      }

      .excel-pdf-table select.sync-field {
        background: #e3f2fd !important;
        border: 1px solid #90caf9 !important;
      }

      .excel-pdf-table select.sync-field:focus {
        outline: 2px solid #1976d2 !important;
        background: #e3f2fd !important;
      }

      .excel-pdf-table input[type="checkbox"] {
        width: auto;
        cursor: pointer;
      }

      .excel-pdf-table textarea {
        resize: vertical;
        min-height: 50px;
      }

      .excel-pdf-table tr:hover {
        background: #f8f9fa;
      }

      .excel-pdf-table .row-number {
        background: #e9ecef;
        text-align: center;
        font-weight: 600;
        color: #666;
      }

      .excel-pdf-footer {
        background: #f8f9fa;
        padding: 1rem 1.5rem;
        border-top: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .excel-pdf-status {
        font-size: 0.85rem;
        color: #666;
      }

      .cell-readonly {
        background: #f0f0f0 !important;
        color: #666;
        cursor: not-allowed;
      }

      .cell-readonly:focus {
        outline: none !important;
        background: #f0f0f0 !important;
      }

      select.cell-readonly {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }

      textarea.cell-readonly {
        resize: none;
      }

      .excel-pdf-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #00a666;
      }

      .pdf-upload-section {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem;
        text-align: center;
      }

      .pdf-upload-btn {
        background: rgb(28, 37, 69);
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 0.5rem;
      }

      .pdf-upload-btn:hover {
        background: #1a2541;
      }

      .pdf-status {
        color: #00a666;
        font-weight: 600;
        margin-top: 0.5rem;
      }

      .sync-field {
        background: #e3f2fd !important;
        border: 1px solid #90caf9 !important;
      }

      .sync-field:focus {
        outline: 2px solid #1976d2 !important;
        background: #e3f2fd !important;
      }

      .info-banner {
        background: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 8px;
        margin: 1rem;
        font-size: 0.85rem;
        color: #1565c0;
      }
      
      .info-banner-header {
        padding: 0.75rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }
      
      .info-banner-header:hover {
        background: #bbdefb;
        border-radius: 7px 7px 0 0;
      }
      
      .info-banner-content {
        padding: 0 0.75rem 0.75rem 0.75rem;
        border-top: 1px solid #90caf9;
        display: none;
      }
      
      .info-banner.expanded .info-banner-content {
        display: block;
      }
      
      .info-banner-toggle {
        font-size: 1rem;
        transition: transform 0.3s ease;
      }
      
      .info-banner.expanded .info-banner-toggle {
        transform: rotate(180deg);
      }

      .progressivo-info-div {
        background: #fff3cd !important;
        border: 1px solid #ffeaa7 !important;
        color: #856404 !important;
        font-weight: 600;
        padding: 0.75rem;
        margin: 1rem;
        border-radius: 8px;
        font-size: 0.85rem;
        text-align: center;
      }

      .excel-pdf-loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #1976d2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 8px;
        vertical-align: middle;
      }

      .excel-pdf-table input[list] {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 0.5rem center;
        background-size: 1.2rem;
        padding-right: 2rem;
      }
      
      .excel-pdf-table input[list]:focus {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300a666' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      }
      
      .excel-pdf-table input[list].invalid-argomento {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f44336' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      }
      
      .excel-pdf-paste-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #00a666;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        font-weight: 600;
        z-index: 1100;
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .excel-pdf-table input.invalid-argomento {
        background: #ffebee !important;
        border-color: #f44336 !important;
        color: #d32f2f !important;
      }
      
      /* Responsive adjustments */
      @media (max-height: 768px) {
        .excel-pdf-overlay {
          padding: 10px 0;
        }
        
        .excel-pdf-header {
          padding: 1rem;
        }
        
        .excel-pdf-header h3 {
          font-size: 1.1rem;
        }
        
        .excel-pdf-table-wrapper {
          min-height: 300px;
        }
      }
      
      @media (max-width: 768px) {
        .excel-pdf-container {
          max-width: 98%;
          margin: 10px auto;
        }
        
        .excel-pdf-table {
          font-size: 0.75rem;
        }
        
        .excel-pdf-table th,
        .excel-pdf-table td {
          padding: 0.4rem 0.2rem;
        }
      }
      
      .excel-pdf-table input.invalid-argomento:focus {
        outline: 2px solid #f44336 !important;
        background: #ffebee !important;
      }
      
      .excel-pdf-table input.warning-field {
        background: #fff3cd !important;
        border-color: #ffc107 !important;
        color: #856404 !important;
      }
      
      .excel-pdf-table input.warning-field:focus {
        outline: 2px solid #ffc107 !important;
        background: #fff3cd !important;
      }
    `;
    document.head.appendChild(style);
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'excel-pdf-overlay';
    
    this.container = document.createElement('div');
    this.container.className = 'excel-pdf-container';
    
    const header = document.createElement('div');
    header.className = 'excel-pdf-header';
    header.innerHTML = `
      <h3>📄 Editor Domande Test PDF</h3>
      <div class="excel-pdf-controls">
        <button class="excel-pdf-btn secondary" onclick="excelFormPDF.addRow()">➕ Aggiungi Riga</button>
        <button class="excel-pdf-btn primary" onclick="excelFormPDF.save()">💾 Salva Tutto</button>
        <button class="excel-pdf-btn danger" onclick="excelFormPDF.close()">✖ Chiudi</button>
      </div>
    `;
    
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'excel-pdf-table-wrapper';
    
    const table = document.createElement('table');
    table.className = 'excel-pdf-table';
    table.id = 'excelPDFTable';
    
    const footer = document.createElement('div');
    footer.className = 'excel-pdf-footer';
    footer.innerHTML = `
      <div class="excel-pdf-status">
        <span id="pdfRowCount">0 righe</span> | 
        <span id="pdfTestInfo">Test PDF</span>
      </div>
      <div class="excel-pdf-controls">
        <button class="excel-pdf-btn secondary" onclick="excelFormPDF.clearAll()">🗑️ Pulisci Tutto</button>
        <button class="excel-pdf-btn secondary" onclick="excelFormPDF.uploadPDF()">📄 Carica PDF</button>
      </div>
    `;
    
    tableWrapper.appendChild(table);
    this.container.appendChild(header);
    this.container.appendChild(tableWrapper);
    this.container.appendChild(footer);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  }

  open() {
    this.showInitialConfig();
  }

  updateSectionField(materia) {
    const sectionField = document.getElementById('sectionField');
    
    if (materia === 'Simulazioni') {
      // Per Simulazioni: campo readonly
      sectionField.innerHTML = `
        <input type="text" id="configPDFSection" value="Simulazioni" readonly 
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; 
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      // Trigger calcolo progressivo dopo aver impostato il valore
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia === 'Assessment Iniziale') {
      // Per Assessment Iniziale: campo readonly
      sectionField.innerHTML = `
        <input type="text" id="configPDFSection" value="Assessment Iniziale" readonly 
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; 
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      // Trigger calcolo progressivo dopo aver impostato il valore
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia === 'Fisica') {
      // Per Fisica: opzioni specifiche
      const sectionOptions = [
        '',
        'Cinematica e vettori',
        'Dinamica e energia',
        'Fluidi termodinamica e onde',
        'Elettromagnetismo'
      ];
      
      let selectHTML = '<select id="configPDFSection" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">';
      selectHTML += '<option value="">Seleziona...</option>';
      sectionOptions.forEach(option => {
        if (option) {
          selectHTML += `<option value="${option}">${option}</option>`;
        }
      });
      selectHTML += '</select>';
      
      sectionField.innerHTML = selectHTML;
      
      // Aggiungi event listener al nuovo select
      document.getElementById('configPDFSection').addEventListener('change', () => this.checkAndCalculateProgressivo());
    } else if (materia === 'Scienze') {
      // Per Scienze: opzioni specifiche
      const sectionOptions = [
        '',
        'Atomo, tavola periodica e materia',
        'Chimica organica e biochimica',
        'Nomenclatura e legami',
        'Stechiometria e soluzioni'
      ];
      
      let selectHTML = '<select id="configPDFSection" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">';
      selectHTML += '<option value="">Seleziona...</option>';
      sectionOptions.forEach(option => {
        if (option) {
          selectHTML += `<option value="${option}">${option}</option>`;
        }
      });
      selectHTML += '</select>';
      
      sectionField.innerHTML = selectHTML;
      
      // Aggiungi event listener al nuovo select
      document.getElementById('configPDFSection').addEventListener('change', () => this.checkAndCalculateProgressivo());
    } else if (materia === 'Altro') {
      // Per Altro: solo opzioni generali
      const sectionOptions = [
        '',
        'Pensiero critico',
        'Ragionamento numerico',
        'Comprensione verbale',
        'Logica',
        'Inglese'
      ];
      
      let selectHTML = '<select id="configPDFSection" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">';
      selectHTML += '<option value="">Seleziona...</option>';
      sectionOptions.forEach(option => {
        if (option) {
          selectHTML += `<option value="${option}">${option}</option>`;
        }
      });
      selectHTML += '</select>';
      
      sectionField.innerHTML = selectHTML;
      
      // Aggiungi event listener al nuovo select
      document.getElementById('configPDFSection').addEventListener('change', () => this.checkAndCalculateProgressivo());
    } else if (materia === 'Matematica') {
      // Per Matematica: opzioni matematiche
      const sectionOptions = [
        '',
        'Logica e insiemi',
        'Algebra',
        'Logaritmi ed esponenziali',
        'Probabilità, combinatoria e statistica',
        'Goniometria e trigonometria',
        'Geometria',
        'Funzioni'
      ];
      
      let selectHTML = '<select id="configPDFSection" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">';
      selectHTML += '<option value="">Seleziona...</option>';
      sectionOptions.forEach(option => {
        if (option) {
          selectHTML += `<option value="${option}">${option}</option>`;
        }
      });
      selectHTML += '</select>';
      
      sectionField.innerHTML = selectHTML;
      
      // Aggiungi event listener al nuovo select
      document.getElementById('configPDFSection').addEventListener('change', () => this.checkAndCalculateProgressivo());
    } else {
      // Se non è selezionata nessuna macro-sezione
      sectionField.innerHTML = `
        <select id="configPDFSection" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
          <option value="">Seleziona prima una macro-sezione...</option>
        </select>
      `;
    }
  }

  updateTipologiaField(materia) {
    const tipologiaField = document.getElementById('tipologiaField');
    
    if (materia === 'Simulazioni') {
      // Per Simulazioni: campo readonly con valore "Test"
      tipologiaField.innerHTML = `
        <input type="text" id="configPDFTipologia" value="Test" readonly 
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; 
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      // Trigger calcolo progressivo dopo aver impostato il valore
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia === 'Assessment Iniziale') {
      // Per Assessment Iniziale: campo readonly con valore "Assessment"
      tipologiaField.innerHTML = `
        <input type="text" id="configPDFTipologia" value="Assessment" readonly 
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; 
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      // Trigger calcolo progressivo dopo aver impostato il valore
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia) {
      // Per altre macro-sezioni: dropdown con opzioni
      let selectHTML = '<select id="configPDFTipologia" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">';
      selectHTML += '<option value="">Seleziona...</option>';
      selectHTML += '<option value="Esercizi per casa">Esercizi per casa</option>';
      selectHTML += '<option value="Assessment">Assessment</option>';
      selectHTML += '</select>';
      
      tipologiaField.innerHTML = selectHTML;
      
      // Aggiungi event listener al nuovo select
      document.getElementById('configPDFTipologia').addEventListener('change', () => this.checkAndCalculateProgressivo());
    } else {
      // Se non è selezionata nessuna macro-sezione
      tipologiaField.innerHTML = `
        <select id="configPDFTipologia" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
          <option value="">Seleziona prima una macro-sezione...</option>
        </select>
      `;
    }
  }

  showInitialConfig() {
    const configModal = document.createElement('div');
    configModal.className = 'excel-pdf-overlay';
    configModal.style.display = 'block';
    configModal.style.zIndex = '1001';
    
    const configContainer = document.createElement('div');
    configContainer.className = 'excel-pdf-container';
    configContainer.style.maxWidth = '600px';
    configContainer.innerHTML = `
      <div class="excel-pdf-header">
        <h3>⚙️ Configurazione Test PDF</h3>
      </div>
      <div style="padding: 2rem;">
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Tipologia Test:*</label>
          <select id="configPDFTipologiaTest" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
            <option value="">Seleziona...</option>
            <option value="BOCCONI PDF">BOCCONI PDF</option>
            <option value="TOLC I PDF">TOLC I PDF</option>
            <option value="TOLC E PDF">TOLC E PDF</option>
            <option value="TOL PDF">TOL PDF</option>
            <option value="MEDICINA PDF">MEDICINA PDF</option>
            <option value="CATTOLICA PDF">CATTOLICA PDF</option>
            <option value="BOCCONI MAGISTRALE PDF">BOCCONI MAGISTRALE PDF</option>
            <option value="BOCCONI LAW PDF">BOCCONI LAW PDF</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Macro-sezione:*</label>
          <select id="configPDFMateria" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
            <option value="">Seleziona...</option>
            <option value="Matematica">Matematica</option>
            <option value="Fisica">Fisica</option>
            <option value="Scienze">Scienze</option>
            <option value="Assessment Iniziale">Assessment Iniziale</option>
            <option value="Simulazioni">Simulazioni</option>
            <option value="Altro">Altro</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;" id="sectionContainer">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Sezione:*</label>
          <div id="sectionField">
            <select id="configPDFSection" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
              <option value="">Seleziona prima una macro-sezione...</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;" id="tipologiaContainer">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Tipologia Esercizi:*</label>
          <div id="tipologiaField">
            <select id="configPDFTipologia" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
              <option value="">Seleziona prima una macro-sezione...</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Progressivo:</label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input type="number" id="configPDFProgressivo" value="1" min="1" readonly style="width: 100px; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px; background: #f0f0f0;">
            <span id="configProgressivoInfo" style="color: #666; font-size: 0.9rem;">Seleziona tutti i campi sopra per calcolare il progressivo</span>
          </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Numero di domande:*</label>
          <input type="number" id="configPDFNumDomande" value="10" min="1" max="200" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="excel-pdf-btn secondary" onclick="document.body.removeChild(this.closest('.excel-pdf-overlay'))">Annulla</button>
          <button class="excel-pdf-btn primary" id="continueButton" onclick="excelFormPDF.startWithConfig(this.closest('.excel-pdf-overlay'))" disabled style="opacity: 0.6; cursor: not-allowed;">Continua</button>
        </div>
      </div>
    `;
    
    configModal.appendChild(configContainer);
    document.body.appendChild(configModal);
    
    // Event listener per quando cambia la macro-sezione
    const materiaSelect = document.getElementById('configPDFMateria');
    materiaSelect.addEventListener('change', (e) => {
      this.updateSectionField(e.target.value);
      this.updateTipologiaField(e.target.value);
      // Il calcolo del progressivo verrà fatto automaticamente quando vengono creati i nuovi campi
    });
    
    // Aggiungi event listener per tipologia test
    document.getElementById('configPDFTipologiaTest').addEventListener('change', () => {
      // Prova a sincronizzare il dropdown dei test caricati
      const uploadedDropdown = document.getElementById('uploadedTestsDropdown');
      const newTipologia = document.getElementById('configPDFTipologiaTest').value;
      
      if (uploadedDropdown && newTipologia) {
        for (let option of uploadedDropdown.options) {
          if (option.value === newTipologia) {
            uploadedDropdown.value = newTipologia;
            uploadedDropdown.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
      
      this.checkAndCalculateProgressivo();
    });
    
    // Calcola il progressivo iniziale dopo un delay per permettere al dropdown di caricarsi
    setTimeout(() => {
      // Prova a selezionare automaticamente la tipologia nel dropdown
      const uploadedDropdown = document.getElementById('uploadedTestsDropdown');
      const formTipologia = document.getElementById('configPDFTipologiaTest')?.value;
      
      if (uploadedDropdown && formTipologia) {
        // Cerca l'opzione corrispondente
        for (let option of uploadedDropdown.options) {
          if (option.value === formTipologia) {
            uploadedDropdown.value = formTipologia;
            // Trigger change event per aggiornare la lista
            uploadedDropdown.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
      
      // Calcola il progressivo
      this.checkAndCalculateProgressivo();
      
      // Aggiungi listener al dropdown per ricalcolare se cambia
      if (uploadedDropdown) {
        uploadedDropdown.addEventListener('change', () => {
          // Ricalcola se tutti i campi sono compilati
          if (document.getElementById('configPDFTipologiaTest')?.value) {
            this.checkAndCalculateProgressivo();
          }
        });
      }
    }, 1000);
  }

  async checkAndCalculateProgressivo() {
    const tipologiaTest = document.getElementById('configPDFTipologiaTest').value;
    const materia = document.getElementById('configPDFMateria').value;
    const section = document.getElementById('configPDFSection').value;
    const tipologiaEsercizi = document.getElementById('configPDFTipologia').value;
    
    const progressivoInfo = document.getElementById('configProgressivoInfo');
    const progressivoInput = document.getElementById('configPDFProgressivo');
    const continueButton = document.getElementById('continueButton');
    
    // Se non sono tutti compilati, mostra messaggio di attesa e disabilita il pulsante
    if (!tipologiaTest || !materia || !section || !tipologiaEsercizi) {
      progressivoInfo.textContent = 'Seleziona tutti i campi sopra per calcolare il progressivo';
      progressivoInfo.style.color = '#666';
      progressivoInput.value = 1;
      
      // Disabilita il pulsante Continua
      if (continueButton) {
        continueButton.disabled = true;
        continueButton.style.opacity = '0.6';
        continueButton.style.cursor = 'not-allowed';
      }
      return;
    }
    
    // Calcola il progressivo SEMPRE dal DOM fresco
    progressivoInfo.textContent = 'Calcolo progressivo in corso...';
    progressivoInfo.style.color = '#1976d2';
    
    // Piccolo delay per simulare ricerca e permettere al DOM di aggiornarsi
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Raccogli TUTTI i progressivi esistenti (non solo il max)
      const progressiviTrovati = new Set();
      
      // Pattern semplificato: "sezione: tipologia_esercizi progressivo"
      // Es: "Algebra: Esercizi per casa 3"
      const searchPattern = `${section}: ${tipologiaEsercizi}`;
      
      // PRIMA: Cerca nella lista dei test già caricati (#uploadedTestsList)
      // Questa lista è già filtrata per tipologia test dal dropdown della pagina
      // Formato lista: "sezione: tipologia_esercizi progressivo" (es: "Algebra: Esercizi per casa 3")
      const testListItems = document.querySelectorAll('#uploadedTestsList li');
      
      // Verifica che il dropdown corrisponda alla tipologia test selezionata nel form
      const uploadedDropdown = document.getElementById('uploadedTestsDropdown');
      const dropdownMatchesForm = uploadedDropdown && uploadedDropdown.value === tipologiaTest;
      
      if (dropdownMatchesForm && testListItems.length > 0) {
        testListItems.forEach(li => {
          const text = li.textContent || '';
          
          // Verifica se il testo contiene il pattern esatto
          if (text.includes(searchPattern)) {
            // Estrai il numero progressivo che segue il pattern
            const match = text.match(new RegExp(`${searchPattern}\\s+(\\d+)`));
            if (match && match[1]) {
              const num = parseInt(match[1]);
              progressiviTrovati.add(num);
              console.log(`Trovato nella lista filtrata: "${searchPattern} ${num}"`);
            }
          }
        });
      }
      
      // FALLBACK: Se la lista non corrisponde o è vuota, cerca nel DOM generale
      // ma solo elementi che contengono ANCHE la tipologia test
      if (!dropdownMatchesForm || testListItems.length === 0 || progressiviTrovati.size === 0) {
        const allElements = document.querySelectorAll('td, li, div, span, p, a, h1, h2, h3, h4, h5, h6');
        
        allElements.forEach(element => {
          // Ignora elementi dentro questo form (non ancora salvati)
          if (element.closest('.excel-pdf-overlay')) return;
          
          const text = element.textContent || '';
          
          // Verifica che contenga sia la tipologia test che il pattern sezione:esercizi
          if (text.includes(tipologiaTest) && text.includes(searchPattern)) {
            const match = text.match(new RegExp(`${searchPattern}\\s+(\\d+)`));
            if (match && match[1]) {
              const num = parseInt(match[1]);
              progressiviTrovati.add(num);
              console.log(`Trovato nel DOM: "${tipologiaTest}" + "${searchPattern} ${num}"`);
            }
          }
        });
      }
      
      // Converti Set in array ordinato
      const progressiviOrdinati = Array.from(progressiviTrovati).sort((a, b) => a - b);
      
      // Trova i buchi nella sequenza
      const buchi = [];
      if (progressiviOrdinati.length > 0) {
        // Controlla buchi dal 1 al primo progressivo trovato
        for (let i = 1; i < progressiviOrdinati[0]; i++) {
          buchi.push(i);
        }
        
        // Controlla buchi tra i progressivi
        for (let i = 0; i < progressiviOrdinati.length - 1; i++) {
          const current = progressiviOrdinati[i];
          const next = progressiviOrdinati[i + 1];
          for (let j = current + 1; j < next; j++) {
            buchi.push(j);
          }
        }
      }
      
      const maxProgressivo = progressiviOrdinati.length > 0 ? Math.max(...progressiviOrdinati) : 0;
      const newProgressivo = maxProgressivo + 1;
      
      // Se ci sono buchi, mostra il dialog per la scelta
      if (buchi.length > 0) {
        const sceltaProgressivo = await this.mostraDialogSceltaProgressivo(
          section, 
          tipologiaEsercizi, 
          newProgressivo, 
          buchi, 
          progressiviOrdinati
        );
        
        // Aggiorna il campo progressivo con la scelta dell'utente
        progressivoInput.value = sceltaProgressivo;
        
        // Aggiorna UI con messaggio
        if (buchi.includes(sceltaProgressivo)) {
          progressivoInfo.textContent = `🔧 Riempito buco: progressivo ${sceltaProgressivo} (${buchi.length} buchi trovati)`;
        } else {
          progressivoInfo.textContent = `📊 Nuovo progressivo: ${sceltaProgressivo} (saltati ${buchi.length} buchi)`;
        }
        progressivoInfo.style.color = '#00a666';
      } else {
        // Nessun buco: usa il progressivo successivo automaticamente
        progressivoInput.value = newProgressivo;
        
        // Aggiorna UI con messaggio più descrittivo
        progressivoInfo.textContent = maxProgressivo === 0 
          ? `✨ Primo test per "${section}: ${tipologiaEsercizi}" (${tipologiaTest})` 
          : `📊 Trovati ${maxProgressivo} test esistenti → Progressivo: ${newProgressivo}`;
        progressivoInfo.style.color = '#00a666';
      }
      
      // Abilita il pulsante Continua ora che il progressivo è stato calcolato
      if (continueButton) {
        continueButton.disabled = false;
        continueButton.style.opacity = '1';
        continueButton.style.cursor = 'pointer';
      }
      
    } catch (error) {
      console.error('Errore nel calcolo del progressivo:', error);
      progressivoInfo.textContent = 'Errore nel calcolo - Usa il valore 1';
      progressivoInfo.style.color = '#dc3545';
      progressivoInput.value = 1;
      
      // In caso di errore, abilita comunque il pulsante
      if (continueButton) {
        continueButton.disabled = false;
        continueButton.style.opacity = '1';
        continueButton.style.cursor = 'pointer';
      }
    }
  }

  async calculateProgressivoInitial() {
    // Calcola il progressivo appena si apre l'editor
    await this.calculateProgressivo(
      this.commonData.tipologia_test,
      this.commonData.Materia,
      this.commonData.section,
      this.commonData.tipologia_esercizi
    );
    
    // Aggiorna l'header info
    document.getElementById('pdfTestInfo').textContent = 
      `${this.commonData.tipologia_test} | ${this.commonData.Materia} | ${this.commonData.section}: ${this.commonData.tipologia_esercizi} ${this.commonData.progressivo}`;
  }

  // Nuova funzione per mostrare il dialog di scelta progressivo
  async mostraDialogSceltaProgressivo(section, tipologiaEsercizi, nuovoProgressivo, buchi, esistenti) {
    return new Promise((resolve) => {
      // Crea overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      
      // Crea dialog
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 70vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      `;
      
      // Costruisci contenuto
      let html = `
        <h3 style="margin: 0 0 16px 0; color: #1976d2;">
          🔢 Scegli il progressivo per "${section}: ${tipologiaEsercizi}"
        </h3>
        <p style="margin: 0 0 20px 0; color: #666;">
          Sono stati rilevati dei "buchi" nella numerazione dei test esistenti.<br>
          Puoi scegliere di riempire un buco o usare il progressivo successivo.
        </p>
        
        <div style="margin-bottom: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
          <strong>Test esistenti:</strong> ${esistenti.length > 0 ? esistenti.join(', ') : 'Nessuno'}<br>
          <strong>Buchi rilevati:</strong> <span style="color: #ff6b6b;">${buchi.join(', ')}</span>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
      `;
      
      // Aggiungi opzione per il nuovo progressivo
      html += `
        <button class="progressivo-choice" data-value="${nuovoProgressivo}" 
                style="padding: 12px; border: 2px solid #00a666; background: #e8f5e9; 
                       border-radius: 8px; cursor: pointer; text-align: left;
                       transition: all 0.2s; font-size: 14px;"
                onmouseover="this.style.background='#c8e6c9'" 
                onmouseout="this.style.background='#e8f5e9'">
          <strong style="color: #00a666;">✅ Usa progressivo successivo: ${nuovoProgressivo}</strong><br>
          <small style="color: #666;">Continua la numerazione normale</small>
        </button>
      `;
      
      // Aggiungi opzioni per i buchi (massimo 10 per non appesantire)
      const buchiDaMostrare = buchi.slice(0, 10);
      buchiDaMostrare.forEach(buco => {
        html += `
          <button class="progressivo-choice" data-value="${buco}" 
                  style="padding: 12px; border: 2px solid #1976d2; background: #e3f2fd; 
                         border-radius: 8px; cursor: pointer; text-align: left;
                         transition: all 0.2s; font-size: 14px;"
                  onmouseover="this.style.background='#bbdefb'" 
                  onmouseout="this.style.background='#e3f2fd'">
            <strong style="color: #1976d2;">🔧 Riempi buco: ${buco}</strong><br>
            <small style="color: #666;">Completa la sequenza numerica</small>
          </button>
        `;
      });
      
      if (buchi.length > 10) {
        html += `
          <p style="text-align: center; color: #999; font-size: 12px; margin: 8px 0;">
            ... e altri ${buchi.length - 10} buchi disponibili
          </p>
        `;
      }
      
      html += '</div>';
      
      dialog.innerHTML = html;
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      // Aggiungi event listeners
      dialog.querySelectorAll('.progressivo-choice').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = parseInt(btn.dataset.value);
          document.body.removeChild(overlay);
          resolve(value);
        });
      });
      
      // Permetti chiusura con ESC (usa il progressivo successivo di default)
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay);
          document.removeEventListener('keydown', handleEsc);
          resolve(nuovoProgressivo);
        }
      };
      document.addEventListener('keydown', handleEsc);
    });
  }

  async calculateProgressivo(tipologiaTest, materia, section, tipologiaEsercizi) {
    // Trova elemento per mostrare info progressivo
    const progressivoInfoElements = document.querySelectorAll('[id*="progressivoInfo"]');
    const progressivoInfo = progressivoInfoElements[progressivoInfoElements.length - 1];
    
    if (!progressivoInfo) return;
    
    // Mostra stato di caricamento
    progressivoInfo.textContent = 'Calcolo progressivo in corso...';
    progressivoInfo.style.color = '#1976d2';
    
    try {
      // Raccogli TUTTI i progressivi esistenti (non solo il max)
      const progressiviTrovati = new Set();
      
      // Costruisci il pattern da cercare: "section: tipologia_esercizi"
      const searchPattern = `${section}: ${tipologiaEsercizi}`;
      
      // Cerca tutti gli elementi che potrebbero contenere i test
      const testElements = document.querySelectorAll('td, li, div, span, p, a');
      
      testElements.forEach(element => {
        const text = element.textContent || '';
        
        // Verifica se il testo contiene il pattern esatto
        if (text.includes(searchPattern)) {
          // Estrai il numero progressivo che segue il pattern
          const afterPattern = text.substring(text.indexOf(searchPattern) + searchPattern.length);
          const numberMatch = afterPattern.match(/\s*(\d+)/);
          
          if (numberMatch && numberMatch[1]) {
            const num = parseInt(numberMatch[1]);
            progressiviTrovati.add(num);
            console.log(`Trovato: "${searchPattern} ${num}"`);
          }
        }
      });
      
      // Se non trovato con pattern esatto, prova con variazioni
      if (progressiviTrovati.size === 0) {
        const alternativePatterns = [
          `${section.toLowerCase()}: ${tipologiaEsercizi.toLowerCase()}`,
          `${section}: ${tipologiaEsercizi}`,
          `${section}:${tipologiaEsercizi}`,  // senza spazio
        ];
        
        testElements.forEach(element => {
          const text = element.textContent || '';
          const textLower = text.toLowerCase();
          
          for (const pattern of alternativePatterns) {
            if (textLower.includes(pattern.toLowerCase())) {
              // Estrai qualsiasi numero che segue
              const matches = text.match(/\d+/g);
              if (matches) {
                matches.forEach(match => {
                  const num = parseInt(match);
                  // Considera solo numeri ragionevoli per progressivi (1-99)
                  if (num > 0 && num < 100) {
                    // Verifica che il numero sia vicino al pattern
                    const numberIndex = text.indexOf(match);
                    const patternIndex = textLower.indexOf(pattern.toLowerCase());
                    if (numberIndex > patternIndex && (numberIndex - patternIndex) < 20) {
                      progressiviTrovati.add(num);
                      console.log(`Trovato con pattern alternativo: "${pattern}" → ${num}`);
                    }
                  }
                });
              }
              break;
            }
          }
        });
      }
      
      // Converti Set in array ordinato
      const progressiviOrdinati = Array.from(progressiviTrovati).sort((a, b) => a - b);
      
      // Trova i buchi nella sequenza
      const buchi = [];
      if (progressiviOrdinati.length > 0) {
        // Controlla buchi dal 1 al primo progressivo trovato
        for (let i = 1; i < progressiviOrdinati[0]; i++) {
          buchi.push(i);
        }
        
        // Controlla buchi tra i progressivi
        for (let i = 0; i < progressiviOrdinati.length - 1; i++) {
          const current = progressiviOrdinati[i];
          const next = progressiviOrdinati[i + 1];
          for (let j = current + 1; j < next; j++) {
            buchi.push(j);
          }
        }
      }
      
      const maxProgressivo = progressiviOrdinati.length > 0 ? Math.max(...progressiviOrdinati) : 0;
      const newProgressivo = maxProgressivo + 1;
      
      // Se ci sono buchi, chiedi all'utente quale progressivo usare
      if (buchi.length > 0) {
        // Crea un dialog per la scelta
        const sceltaProgressivo = await this.mostraDialogSceltaProgressivo(
          section, 
          tipologiaEsercizi, 
          newProgressivo, 
          buchi, 
          progressiviOrdinati
        );
        
        // Usa il progressivo scelto
        this.commonData.progressivo = sceltaProgressivo;
        this.tableData.forEach(row => {
          row.progressivo = sceltaProgressivo;
        });
        
        // Aggiorna messaggio UI
        if (buchi.includes(sceltaProgressivo)) {
          progressivoInfo.textContent = `🔧 Riempito buco: "${section}: ${tipologiaEsercizi} ${sceltaProgressivo}"`;
        } else {
          progressivoInfo.textContent = `📊 Nuovo progressivo: "${section}: ${tipologiaEsercizi} ${sceltaProgressivo}"`;
        }
        progressivoInfo.style.color = '#00a666';
      } else {
        // Nessun buco: procedi automaticamente
        this.commonData.progressivo = newProgressivo;
        this.tableData.forEach(row => {
          row.progressivo = newProgressivo;
        });
        
        // Aggiorna UI con messaggio più descrittivo
        progressivoInfo.textContent = maxProgressivo === 0 
          ? `✨ Primo test per "${section}: ${tipologiaEsercizi}"` 
          : `📊 Trovati ${maxProgressivo} test esistenti per "${section}: ${tipologiaEsercizi}" → Nuovo progressivo: ${newProgressivo}`;
        progressivoInfo.style.color = '#00a666';
      }
      
      // Aggiorna tutte le celle progressivo nella tabella
      const tbody = document.getElementById('excelPDFTableBody');
      if (tbody) {
        const rows = tbody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
          const progressivoCell = rows[i].cells[5]; // Colonna progressivo
          if (progressivoCell) {
            const input = progressivoCell.querySelector('input');
            if (input) {
              input.value = this.commonData.progressivo;
            }
          }
        }
      }
      
      // Aggiorna info header
      document.getElementById('pdfTestInfo').textContent = 
        `${tipologiaTest} | ${materia} | ${section}: ${tipologiaEsercizi} ${this.commonData.progressivo}`;
      
    } catch (error) {
      console.error('Errore nel calcolo del progressivo:', error);
      progressivoInfo.textContent = 'Errore nel calcolo - Usa il valore inserito';
      progressivoInfo.style.color = '#dc3545';
    }
  }

  startWithConfig(configModal) {
    const tipologiaTest = document.getElementById('configPDFTipologiaTest').value;
    const materia = document.getElementById('configPDFMateria').value;
    const section = document.getElementById('configPDFSection').value;
    const tipologiaEsercizi = document.getElementById('configPDFTipologia').value;
    const progressivo = parseInt(document.getElementById('configPDFProgressivo').value);
    const numDomande = parseInt(document.getElementById('configPDFNumDomande').value);
    
    // Validazioni
    if (!tipologiaTest || !materia || !section || !tipologiaEsercizi) {
      alert('Compila tutti i campi obbligatori!');
      return;
    }
    
    if (!numDomande || numDomande < 1) {
      alert('Inserisci un numero valido di domande!');
      return;
    }
    
    // Verifica che il progressivo sia stato calcolato (non sia il valore di default)
    const progressivoInfo = document.getElementById('configProgressivoInfo');
    if (progressivoInfo && progressivoInfo.textContent.includes('Seleziona tutti i campi')) {
      alert('Attendi che il progressivo venga calcolato prima di continuare!');
      return;
    }
    
    this.commonData = {
      tipologia_test: tipologiaTest,
      Materia: materia,
      section: section,
      tipologia_esercizi: tipologiaEsercizi,  // Ora viene dal form iniziale
      progressivo: progressivo,
      num_domande: numDomande,
      pdf_url: ''
    };
    
    document.body.removeChild(configModal);
    
    this.tableData = [];
    this.buildTable();
    this.overlay.style.display = 'block';
    
    // Aggiorna l'header info con i dati già disponibili
    document.getElementById('pdfTestInfo').textContent = 
      `${this.commonData.tipologia_test} | ${this.commonData.Materia} | ${this.commonData.section}: ${this.commonData.tipologia_esercizi} ${this.commonData.progressivo}`;
    
    // Aggiungi subito la sezione upload PDF
    this.showPDFUploadSection();
    
    // Aggiungi le righe
    for (let i = 0; i < numDomande; i++) {
      this.addRow();
    }
    
    // Setup navigazione con tastiera
    this.setupKeyboardNavigation();
    
    // Focus sulla prima cella editabile
    setTimeout(() => {
      const firstInput = document.querySelector('#excelPDFTableBody input:not([readonly])');
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    }, 100);
  }

  validateSubsequentPages(startIndex) {
    const tbody = document.getElementById('excelPDFTableBody');
    if (!tbody) return;
    
    const allRows = tbody.getElementsByTagName('tr');
    
    for (let i = startIndex; i < this.tableData.length; i++) {
      if (allRows[i]) {
        const pageCell = allRows[i].cells[6]; // Colonna pagina
        const pageInput = pageCell.querySelector('input[type="number"]');
        
        if (pageInput) {
          const currentPage = parseInt(this.tableData[i].page_number);
          
          // Rimuovi classi precedenti
          pageInput.classList.remove('invalid-argomento', 'warning-field');
          
          if (!currentPage || isNaN(currentPage)) {
            continue; // Salta se vuoto
          }
          
          // Prima riga: avviso se diversa da 1
          if (i === 0 && currentPage !== 1) {
            pageInput.classList.add('warning-field');
            pageInput.title = '⚠️ Attenzione: di solito la prima pagina è 1';
          } else if (i > 0) {
            // Righe successive: controlla progressione
            const prevPage = parseInt(this.tableData[i - 1].page_number);
            if (!isNaN(prevPage)) {
              if (currentPage !== prevPage && currentPage !== prevPage + 1) {
                pageInput.classList.add('invalid-argomento');
                pageInput.title = `⚠️ Può essere solo ${prevPage} o ${prevPage + 1}`;
              } else {
                pageInput.title = 'Numero di pagina nel PDF. Puoi incollare una colonna da Excel.';
              }
            }
          }
        }
      }
    }
  }

  showPasteNotification(message) {
    // Rimuovi eventuali notifiche precedenti
    const existingNotification = document.querySelector('.excel-pdf-paste-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Crea nuova notifica
    const notification = document.createElement('div');
    notification.className = 'excel-pdf-paste-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Rimuovi dopo 3 secondi
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showPDFUploadSection() {
    const tableWrapper = this.container.querySelector('.excel-pdf-table-wrapper');
    
    // Rimuovi eventuali sezioni precedenti
    const existingSection = tableWrapper.querySelector('.pdf-upload-section');
    if (existingSection) existingSection.remove();
    
    const existingBanner = tableWrapper.querySelector('.info-banner');
    if (existingBanner) existingBanner.remove();
    
    // Aggiungi info banner collassabile
    const infoBanner = document.createElement('div');
    infoBanner.className = 'info-banner';
    
    const bannerHeader = document.createElement('div');
    bannerHeader.className = 'info-banner-header';
    bannerHeader.innerHTML = `
      <span>📘 Istruzioni e suggerimenti</span>
      <span class="info-banner-toggle">▼</span>
    `;
    
    const bannerContent = document.createElement('div');
    bannerContent.className = 'info-banner-content';
    
    let bannerText = `
      ℹ️ <strong>Nota:</strong> Tutti i campi comuni sono stati impostati nella configurazione iniziale.
      Compila solo le informazioni specifiche per ogni domanda.`;
    
    // Aggiungi nota speciale per Simulazioni e Assessment Iniziale
    if (this.commonData.Materia === 'Simulazioni' || this.commonData.Materia === 'Assessment Iniziale') {
      bannerText += `<br><br>💡 <strong>Suggerimento per l'argomento:</strong>
        <br>&nbsp;&nbsp;• <strong>Cliccare sul campo</strong> per vedere tutte le opzioni
        <br>&nbsp;&nbsp;• <strong>Doppio click o freccia ↓</strong> per rivedere le opzioni quando sei già nel campo
        <br>&nbsp;&nbsp;• Iniziare a digitare per filtrare le opzioni
        <br>&nbsp;&nbsp;• <strong>Incollare una colonna intera da Excel</strong> - i valori verranno distribuiti automaticamente
        <br>&nbsp;&nbsp;• I testi vengono normalizzati automaticamente (spazi rimossi, prima lettera maiuscola)`;
    }
    
    bannerText += `<br><br>📋 <strong>Copia/Incolla multiplo:</strong> Puoi incollare colonne intere da Excel per:
      <br>&nbsp;&nbsp;• <strong>Pagina</strong>: progressione stretta (ogni riga = precedente o +1)
      <br>&nbsp;&nbsp;&nbsp;&nbsp;- Prima riga: se ≠ 1 → avviso giallo (non blocca)
      <br>&nbsp;&nbsp;&nbsp;&nbsp;- Righe successive: solo uguale o +1 (errore rosso se diverso)
      <br>&nbsp;&nbsp;• <strong>Risposta corretta</strong>: solo a, b, c, d, e (minuscole automatiche)
      <br>&nbsp;&nbsp;• <strong>Argomento</strong>: con validazione automatica
      
      <br><br>⌨️ <strong>Navigazione con tastiera:</strong>
      <br>&nbsp;&nbsp;• <strong>↑ ↓</strong> Muovi tra righe (stessa colonna)
      <br>&nbsp;&nbsp;• <strong>← →</strong> Muovi tra colonne (stessa riga)
      <br>&nbsp;&nbsp;• <strong>Tab</strong> Prossima cella editabile
      <br>&nbsp;&nbsp;• <strong>Enter</strong> Vai alla riga sotto`;
    
    bannerContent.innerHTML = bannerText;
    
    // Event listener per toggle
    bannerHeader.addEventListener('click', () => {
      infoBanner.classList.toggle('expanded');
    });
    
    infoBanner.appendChild(bannerHeader);
    infoBanner.appendChild(bannerContent);
    
    const uploadSection = document.createElement('div');
    uploadSection.className = 'pdf-upload-section';
    uploadSection.innerHTML = `
      <h4>📄 Carica il PDF per questo test</h4>
      <p>Il PDF verrà associato a tutte le domande del test</p>
      <button class="pdf-upload-btn" onclick="excelFormPDF.uploadPDF()">Seleziona PDF</button>
      <div id="pdfUploadStatus"></div>
    `;
    
    tableWrapper.insertBefore(infoBanner, tableWrapper.firstChild);
    tableWrapper.insertBefore(uploadSection, infoBanner.nextSibling);
  }

  setupKeyboardNavigation() {
    const tbody = document.getElementById('excelPDFTableBody');
    if (!tbody) return;
    
    tbody.addEventListener('keydown', (e) => {
      const target = e.target;
      
      // Solo per input e textarea
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;
      
      // Trova la cella corrente
      const currentCell = target.closest('td');
      if (!currentCell) return;
      
      const currentRow = currentCell.parentElement;
      const currentRowIndex = Array.from(tbody.children).indexOf(currentRow);
      const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell);
      
      let newRow, newCell, newInput;
      
      switch(e.key) {
        case 'ArrowUp':
          // Se non è un dropdown con valore, naviga su
          if (!target.getAttribute('list') || !target.value) {
            e.preventDefault();
            if (currentRowIndex > 0) {
              newRow = tbody.children[currentRowIndex - 1];
              newCell = newRow.children[currentCellIndex];
              newInput = newCell.querySelector('input, textarea');
              if (newInput && !newInput.readOnly) {
                newInput.focus();
                newInput.select();
              }
            }
          }
          break;
          
        case 'ArrowDown':
          // Se non è un dropdown con valore (altrimenti apre il dropdown)
          if (!target.getAttribute('list') || !target.value) {
            e.preventDefault();
            if (currentRowIndex < tbody.children.length - 1) {
              newRow = tbody.children[currentRowIndex + 1];
              newCell = newRow.children[currentCellIndex];
              newInput = newCell.querySelector('input, textarea');
              if (newInput && !newInput.readOnly) {
                newInput.focus();
                newInput.select();
              }
            }
          }
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          // Trova la prossima cella editabile a sinistra
          for (let i = currentCellIndex - 1; i >= 0; i--) {
            newCell = currentRow.children[i];
            newInput = newCell.querySelector('input, textarea');
            if (newInput && !newInput.readOnly) {
              newInput.focus();
              newInput.select();
              break;
            }
          }
          break;
          
        case 'ArrowRight':
        case 'Tab':
          if (e.key === 'ArrowRight') e.preventDefault();
          // Trova la prossima cella editabile a destra
          for (let i = currentCellIndex + 1; i < currentRow.children.length; i++) {
            newCell = currentRow.children[i];
            newInput = newCell.querySelector('input, textarea');
            if (newInput && !newInput.readOnly) {
              if (e.key === 'Tab') e.preventDefault();
              newInput.focus();
              newInput.select();
              break;
            }
          }
          break;
          
        case 'Enter':
          e.preventDefault();
          // Come Excel: Enter va alla cella sotto
          if (currentRowIndex < tbody.children.length - 1) {
            newRow = tbody.children[currentRowIndex + 1];
            newCell = newRow.children[currentCellIndex];
            newInput = newCell.querySelector('input, textarea');
            if (newInput && !newInput.readOnly) {
              newInput.focus();
              newInput.select();
            }
          }
          break;
      }
    });
  }

  buildTable() {
    const table = document.getElementById('excelPDFTable');
    table.innerHTML = '';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const th = document.createElement('th');
    th.textContent = '#';
    headerRow.appendChild(th);
    
    // Colonne da mostrare (esclude criptato, pdf_url, is_open_ended)
    const visibleColumns = [
      'tipologia_test',       // readonly dal form
      'Materia',             // readonly dal form
      'section',             // readonly dal form
      'tipologia_esercizi',  // readonly dal form
      'progressivo',         // readonly calcolato
      'page_number',         // modificabile
      'question_number',     // readonly auto
      'correct_answer',      // modificabile
      'wrong_answers',       // readonly auto
      'argomento'           // modificabile
    ];
    
    visibleColumns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = this.formatColumnName(col);
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    tbody.id = 'excelPDFTableBody';
    table.appendChild(tbody);
  }

  formatColumnName(col) {
    const translations = {
      'tipologia_test': 'Tipologia Test',
      'Materia': 'Macro-sezione',
      'section': 'Sezione',
      'tipologia_esercizi': 'Tipologia Esercizi',
      'progressivo': 'Progressivo',
      'page_number': 'Pagina',
      'question_number': 'N° Domanda',
      'correct_answer': 'Risposta Corretta',
      'wrong_answers': 'Risposte Errate',
      'argomento': 'Argomento'
    };
    
    return translations[col] || col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  addRow() {
    const tbody = document.getElementById('excelPDFTableBody');
    const rowIndex = this.tableData.length;
    const tr = document.createElement('tr');
    
    // Numero riga
    const tdNum = document.createElement('td');
    tdNum.className = 'row-number';
    tdNum.textContent = rowIndex + 1;
    tr.appendChild(tdNum);
    
    // Dati della riga
    const rowData = {
      ...this.commonData,
      page_number: '',  // Vuoto di default
      question_number: rowIndex + 1,
      correct_answer: '',
      wrong_answers: '',
      is_open_ended: false,
      argomento: (this.commonData.Materia === 'Simulazioni' || this.commonData.Materia === 'Assessment Iniziale') ? '' : this.commonData.section
    };
    
    // Crea celle per colonne visibili
    this.createCells(tr, rowData, rowIndex);
    
    this.tableData.push(rowData);
    tbody.appendChild(tr);
    this.updateStatus();
  }

  createCells(tr, rowData, rowIndex) {
    // Tipologia Test - readonly
    this.createReadonlyCell(tr, rowData.tipologia_test);
    
    // Macro-sezione (Materia) - readonly
    this.createReadonlyCell(tr, rowData.Materia);
    
    // Sezione - sempre readonly perché già impostata nel form iniziale
    this.createReadonlyCell(tr, rowData.section);
    
    // Tipologia Esercizi - sempre readonly perché già impostata nel form iniziale
    this.createReadonlyCell(tr, rowData.tipologia_esercizi);
    
    // Progressivo - readonly
    this.createReadonlyCell(tr, rowData.progressivo);
    
    // Pagina - con validazione progressiva
    const tdPage = document.createElement('td');
    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.value = rowData.page_number;
    pageInput.min = '1';
    pageInput.placeholder = '';
    pageInput.title = 'Numero di pagina nel PDF. Puoi incollare una colonna da Excel.';
    
    // Funzione per validare numero pagina
    const validatePageNumber = (value, currentRowIndex) => {
      const pageNum = parseInt(value);
      
      // Rimuovi classi precedenti
      pageInput.classList.remove('invalid-argomento', 'warning-field');
      
      // Deve essere un numero valido
      if (!value || isNaN(pageNum) || pageNum < 1) {
        if (value !== '') { // Solo se c'è un valore non valido
          pageInput.classList.add('invalid-argomento');
          pageInput.title = '⚠️ Deve essere un numero maggiore di 0';
        }
        return false;
      }
      
      // Prima riga: avviso se diversa da 1
      if (currentRowIndex === 0 && pageNum !== 1) {
        pageInput.classList.add('warning-field');
        pageInput.title = '⚠️ Attenzione: di solito la prima pagina è 1';
        return true; // Non blocca
      }
      
      // Righe successive: può essere solo uguale o +1 rispetto alla precedente
      if (currentRowIndex > 0 && this.tableData[currentRowIndex - 1]) {
        const prevPageNum = parseInt(this.tableData[currentRowIndex - 1].page_number);
        if (!isNaN(prevPageNum)) {
          if (pageNum !== prevPageNum && pageNum !== prevPageNum + 1) {
            pageInput.classList.add('invalid-argomento');
            pageInput.title = `⚠️ Può essere solo ${prevPageNum} o ${prevPageNum + 1}`;
            return false;
          }
        }
      }
      
      pageInput.title = 'Numero di pagina nel PDF. Puoi incollare una colonna da Excel.';
      return true;
    };
    
    // Event listeners
    pageInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      if (validatePageNumber(value, rowIndex)) {
        this.updateCell(rowIndex, 'page_number', value);
        // Valida anche le righe successive
        this.validateSubsequentPages(rowIndex + 1);
      }
    });
    
    pageInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      const rows = pastedData.split(/\r?\n/).filter(row => row.trim() !== '');
      
      if (rows.length > 1) {
        // Incollaggio multiplo
        const tbody = document.getElementById('excelPDFTableBody');
        const allRows = tbody.getElementsByTagName('tr');
        
        rows.forEach((value, index) => {
          const targetRowIndex = rowIndex + index;
          
          if (targetRowIndex < this.tableData.length) {
            const pageNum = parseInt(value.trim()) || 0;
            this.updateCell(targetRowIndex, 'page_number', pageNum);
            
            // Aggiorna l'input visuale
            if (allRows[targetRowIndex]) {
              const targetCell = allRows[targetRowIndex].cells[6]; // Colonna pagina
              const targetInput = targetCell.querySelector('input[type="number"]');
              if (targetInput) {
                targetInput.value = pageNum;
                // Valida
                const isValid = pageNum > 0 && (targetRowIndex === 0 || pageNum >= (this.tableData[targetRowIndex - 1]?.page_number || 1));
                if (!isValid) {
                  targetInput.classList.add('invalid-argomento');
                  targetInput.title = pageNum < 1 ? '⚠️ Deve essere un numero maggiore di 0' : `⚠️ Deve essere >= ${this.tableData[targetRowIndex - 1]?.page_number} (pagina precedente)`;
                } else {
                  targetInput.classList.remove('invalid-argomento');
                  targetInput.title = 'Numero di pagina nel PDF. Puoi incollare una colonna da Excel.';
                }
              }
            }
          }
        });
        
        // Valida tutte le righe successive
        this.validateSubsequentPages(rowIndex);
        
        const incollati = Math.min(rows.length, this.tableData.length - rowIndex);
        this.showPasteNotification(`✅ Incollati ${incollati} numeri di pagina a partire dalla riga ${rowIndex + 1}`);
      } else {
        // Incollaggio singolo
        pageInput.value = parseInt(rows[0]) || 1;
        pageInput.dispatchEvent(new Event('input'));
      }
    });
    
    // Validazione iniziale
    validatePageNumber(pageInput.value, rowIndex);
    
    tdPage.appendChild(pageInput);
    tr.appendChild(tdPage);
    
    // N° Domanda - readonly
    this.createReadonlyCell(tr, rowData.question_number);
    
    // Risposta Corretta - con normalizzazione e validazione
    const tdCorrect = document.createElement('td');
    const correctInput = document.createElement('input');
    correctInput.type = 'text';
    correctInput.placeholder = 'a-e';
    correctInput.title = 'Risposta corretta (a-e). Puoi incollare una colonna da Excel.';
    correctInput.maxLength = '1';
    correctInput.style.textTransform = 'lowercase';
    
    // Funzione per normalizzare risposta
    const normalizeAnswer = (text) => {
      return text.trim().toLowerCase();
    };
    
    // Funzione per validare risposta
    const validateAnswer = (value) => {
      const normalized = normalizeAnswer(value);
      const isValid = ['a', 'b', 'c', 'd', 'e'].includes(normalized) || normalized === '';
      
      if (!isValid && normalized !== '') {
        correctInput.classList.add('invalid-argomento');
        correctInput.title = '⚠️ Solo a, b, c, d, e';
      } else {
        correctInput.classList.remove('invalid-argomento');
        correctInput.title = 'Risposta corretta (a-e). Puoi incollare una colonna da Excel.';
      }
      
      return isValid || normalized === '';
    };
    
    correctInput.addEventListener('input', (e) => {
      const normalized = normalizeAnswer(e.target.value);
      e.target.value = normalized;
      
      if (validateAnswer(normalized)) {
        this.updateCell(rowIndex, 'correct_answer', normalized);
        
        // Auto-compila wrong_answers
        if (normalized && ['a', 'b', 'c', 'd', 'e'].includes(normalized)) {
          const wrongAnswersCell = tr.cells[9].querySelector('textarea'); // Colonna wrong_answers
          if (wrongAnswersCell) {
            const allAnswers = ['a', 'b', 'c', 'd', 'e'];
            const wrongAnswers = allAnswers.filter(a => a !== normalized);
            wrongAnswersCell.value = `{${wrongAnswers.join(',')}}`;
            this.updateCell(rowIndex, 'wrong_answers', wrongAnswersCell.value);
          }
        }
      }
    });
    
    correctInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      const rows = pastedData.split(/\r?\n/).filter(row => row.trim() !== '');
      
      if (rows.length > 1) {
        // Incollaggio multiplo
        const tbody = document.getElementById('excelPDFTableBody');
        const allRows = tbody.getElementsByTagName('tr');
        
        rows.forEach((value, index) => {
          const targetRowIndex = rowIndex + index;
          
          if (targetRowIndex < this.tableData.length) {
            const normalized = normalizeAnswer(value);
            this.updateCell(targetRowIndex, 'correct_answer', normalized);
            
            // Aggiorna l'input visuale
            if (allRows[targetRowIndex]) {
              const targetCell = allRows[targetRowIndex].cells[8]; // Colonna risposta corretta
              const targetInput = targetCell.querySelector('input[type="text"]');
              if (targetInput) {
                targetInput.value = normalized;
                // Valida
                const isValid = ['a', 'b', 'c', 'd', 'e'].includes(normalized) || normalized === '';
                if (!isValid) {
                  targetInput.classList.add('invalid-argomento');
                  targetInput.title = '⚠️ Solo a, b, c, d, e';
                } else {
                  targetInput.classList.remove('invalid-argomento');
                  targetInput.title = 'Risposta corretta (a-e). Puoi incollare una colonna da Excel.';
                  
                  // Auto-compila wrong_answers
                  if (normalized && ['a', 'b', 'c', 'd', 'e'].includes(normalized)) {
                    const wrongCell = allRows[targetRowIndex].cells[9];
                    const wrongTextarea = wrongCell.querySelector('textarea');
                    if (wrongTextarea) {
                      const allAnswers = ['a', 'b', 'c', 'd', 'e'];
                      const wrongAnswers = allAnswers.filter(a => a !== normalized);
                      wrongTextarea.value = `{${wrongAnswers.join(',')}}`;
                      this.updateCell(targetRowIndex, 'wrong_answers', wrongTextarea.value);
                    }
                  }
                }
              }
            }
          }
        });
        
        const incollati = Math.min(rows.length, this.tableData.length - rowIndex);
        this.showPasteNotification(`✅ Incollate ${incollati} risposte corrette a partire dalla riga ${rowIndex + 1}`);
      } else {
        // Incollaggio singolo
        const normalized = normalizeAnswer(rows[0] || '');
        correctInput.value = normalized;
        correctInput.dispatchEvent(new Event('input'));
      }
    });
    
    // Validazione iniziale
    if (rowData.correct_answer) {
      correctInput.value = normalizeAnswer(rowData.correct_answer);
      validateAnswer(correctInput.value);
    }
    
    tdCorrect.appendChild(correctInput);
    tr.appendChild(tdCorrect);
    
    // Risposte Errate - readonly
    const tdWrong = document.createElement('td');
    const wrongTextarea = document.createElement('textarea');
    wrongTextarea.className = 'cell-readonly';
    wrongTextarea.readOnly = true;
    wrongTextarea.placeholder = 'Auto-compilato';
    tdWrong.appendChild(wrongTextarea);
    tr.appendChild(tdWrong);
    
    // Argomento - condizionale in base alla macro-sezione
    const tdArgomento = document.createElement('td');
    
    if (rowData.Materia === 'Simulazioni' || rowData.Materia === 'Assessment Iniziale') {
      // Per Simulazioni e Assessment Iniziale: usa CustomDropdown
      
      // Usa la lista definita nel constructor
      const argomentiConCategoria = this.argomentiConCategoria;
      const validArgomenti = this.validArgomenti;
      
      // Crea container per il dropdown custom
      const dropdownContainer = document.createElement('div');
      dropdownContainer.style.width = '100%';
      
      // Inizializza CustomDropdown
      const customDropdown = new CustomDropdown(dropdownContainer, {
        value: rowData.argomento || '',
        placeholder: 'Clicca o inizia a digitare...',
        items: argomentiConCategoria,
        id: `argomento-dropdown-${rowIndex}`,
        onChange: (value) => {
          this.updateCell(rowIndex, 'argomento', value);
        },
        onBlur: (value) => {
          // Normalizza il valore quando l'utente esce dal campo
          const normalized = normalizeArgomento(value);
          customDropdown.setValue(normalized);
          this.updateCell(rowIndex, 'argomento', normalized);
        }
      });
      
      // Salva riferimento al dropdown per gestione paste
      dropdownContainer.customDropdown = customDropdown;
      
      // Funzione per normalizzare il testo
      const normalizeArgomento = (text) => {
        // Rimuovi spazi extra (anche multipli interni) e converti in lowercase
        const trimmed = text.trim().replace(/\s+/g, ' ').toLowerCase();
        
        // Mappa per gestire casi speciali
        const specialCases = {
          // Matematica
          'logica e insiemi': 'Logica e insiemi',
          'algebra': 'Algebra',
          'logaritmi ed esponenziali': 'Logaritmi ed esponenziali',
          'probabilità, combinatoria e statistica': 'Probabilità, combinatoria e statistica',
          'probabilita, combinatoria e statistica': 'Probabilità, combinatoria e statistica',
          'probabilità combinatoria e statistica': 'Probabilità, combinatoria e statistica',
          'probabilita combinatoria e statistica': 'Probabilità, combinatoria e statistica',
          'goniometria e trigonometria': 'Goniometria e trigonometria',
          'geometria': 'Geometria',
          'funzioni': 'Funzioni',
          // Fisica
          'cinematica e vettori': 'Cinematica e vettori',
          'dinamica e energia': 'Dinamica e energia',
          'fluidi termodinamica e onde': 'Fluidi termodinamica e onde',
          'elettromagnetismo': 'Elettromagnetismo',
          // Scienze
          'atomo, tavola periodica e materia': 'Atomo, tavola periodica e materia',
          'atomo tavola periodica e materia': 'Atomo, tavola periodica e materia',
          'chimica organica e biochimica': 'Chimica organica e biochimica',
          'nomenclatura e legami': 'Nomenclatura e legami',
          'stechiometria e soluzioni': 'Stechiometria e soluzioni',
          // Altri
          'pensiero critico': 'Pensiero critico',
          'ragionamento numerico': 'Ragionamento numerico',
          'comprensione verbale': 'Comprensione verbale',
          'logica': 'Logica',
          'inglese': 'Inglese'
        };
        
        // Cerca corrispondenza (anche parziale)
        for (const [key, value] of Object.entries(specialCases)) {
          if (trimmed === key || trimmed.includes(key)) {
            return value;
          }
        }
        
        // Se non trova corrispondenza, applica capitalizzazione standard
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      };
      
      // Gestisci paste event sull'input del dropdown
      customDropdown.input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text');
        
        // Dividi per righe (gestisce sia \n che \r\n)
        const rows = pastedData.split(/\r?\n/).filter(row => row.trim() !== '');
        
        if (rows.length > 1) {
          // Incollaggio multiplo: distribuisci su più righe
          const tbody = document.getElementById('excelPDFTableBody');
          const allRows = tbody.getElementsByTagName('tr');
          
          rows.forEach((value, index) => {
            const targetRowIndex = rowIndex + index;
            
            // Verifica che la riga esista e che sia una simulazione o assessment iniziale
            if (targetRowIndex < this.tableData.length && (this.tableData[targetRowIndex].Materia === 'Simulazioni' || this.tableData[targetRowIndex].Materia === 'Assessment Iniziale')) {
              // Normalizza il valore prima di salvarlo
              const normalizedValue = normalizeArgomento(value);
              this.updateCell(targetRowIndex, 'argomento', normalizedValue);
              
              // Aggiorna anche il dropdown visuale se è nella tabella
              if (allRows[targetRowIndex]) {
                const targetCell = allRows[targetRowIndex].cells[10]; // Colonna argomento
                const targetDropdownContainer = targetCell.querySelector('div');
                if (targetDropdownContainer && targetDropdownContainer.customDropdown) {
                  targetDropdownContainer.customDropdown.setValue(normalizedValue);
                }
              }
            }
          });
          
          // Mostra messaggio di conferma
          const incollati = Math.min(rows.length, this.tableData.length - rowIndex);
          this.showPasteNotification(`✅ Incollati ${incollati} argomenti a partire dalla riga ${rowIndex + 1}`);
        } else {
          // Incollaggio singolo
          const normalized = normalizeArgomento(rows[0] || '');
          customDropdown.setValue(normalized);
          this.updateCell(rowIndex, 'argomento', normalized);
        }
      });
      
      tdArgomento.appendChild(dropdownContainer);
    } else {
      // Per altre macro-sezioni: readonly uguale alla sezione
      const argomentoInput = document.createElement('input');
      argomentoInput.type = 'text';
      argomentoInput.value = rowData.section;
      argomentoInput.className = 'cell-readonly';
      argomentoInput.readOnly = true;
      tdArgomento.appendChild(argomentoInput);
      // Aggiorna automaticamente il valore nel data
      this.updateCell(rowIndex, 'argomento', rowData.section);
    }
    
    tr.appendChild(tdArgomento);
  }

  createReadonlyCell(tr, value) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    input.className = 'cell-readonly';
    input.readOnly = true;
    td.appendChild(input);
    tr.appendChild(td);
  }

  updateCell(rowIndex, field, value) {
    if (!this.tableData[rowIndex]) return;
    this.tableData[rowIndex][field] = value;
  }

  updateAllRows(field, value) {
    // Questo metodo non è più necessario perché non ci sono più campi sincronizzati
    // Lo mantengo vuoto per retrocompatibilità
  }

  updateStatus() {
    document.getElementById('pdfRowCount').textContent = `${this.tableData.length} righe`;
  }

  clearAll() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      this.tableData = [];
      document.getElementById('excelPDFTableBody').innerHTML = '';
      
      // Ricrea le righe originali
      if (this.commonData?.num_domande) {
        for (let i = 0; i < this.commonData.num_domande; i++) {
          this.addRow();
        }
      }
      
      // Re-setup navigazione con tastiera
      this.setupKeyboardNavigation();
      
      this.updateStatus();
    }
  }

  async uploadPDF() {
    // Inizializza Supabase se non è già fatto
    if (!supabase && !initSupabase()) {
      alert('Errore: Supabase non disponibile. Ricarica la pagina.');
      return;
    }
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Verifica dimensione file (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('Il file PDF è troppo grande. Dimensione massima: 10MB');
        return;
      }
      
      console.log('PDF selezionato:', file.name, 'Dimensione:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      const statusDiv = document.getElementById('pdfUploadStatus');
      if (statusDiv) {
        statusDiv.innerHTML = '<p style="color: #1976d2;">⏳ Caricamento in corso...<span class="excel-pdf-loading"></span></p>';
        
        try {
          // USA ESATTAMENTE LO STESSO FORMATO DI modify_tests.js
          const groupKey = `${this.commonData.section}||${this.commonData.tipologia_esercizi}||${this.commonData.progressivo}||${this.commonData.tipologia_test}`;
          const filePath = `${groupKey.replace(/\|\|/g, "_")}_${Date.now()}.pdf`;
          
          console.log('FilePath generato:', filePath);
          
          // Carica il file su Supabase Storage nel bucket "tolc_i"
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('tolc_i')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error('Errore upload PDF:', uploadError);
            statusDiv.innerHTML = `<p style="color: #dc3545;">❌ Errore nel caricamento: ${uploadError.message}</p>`;
            return;
          }
          
          console.log('Upload completato:', uploadData);
          
          // Ottieni l'URL pubblico del file caricato
          const { data } = supabase
            .storage
            .from('tolc_i')
            .getPublicUrl(filePath);
          
          if (!data || !data.publicUrl) {
            statusDiv.innerHTML = '<p style="color: #dc3545;">❌ Errore nella generazione dell\'URL</p>';
            return;
          }
          
          const publicUrl = data.publicUrl;
          console.log('PDF caricato con successo:', publicUrl);
          
          // Salva l'URL
          this.commonData.pdf_url = publicUrl;
          
          // Aggiorna tutti i record
          this.tableData.forEach(row => {
            row.pdf_url = publicUrl;
          });
          
          // Mostra successo
          statusDiv.innerHTML = `
            <p class="pdf-status">✅ PDF caricato con successo!</p>
            <p style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
              <strong>File:</strong> ${file.name}<br>
              <strong>Dimensione:</strong> ${(file.size / 1024 / 1024).toFixed(2)}MB<br>
              <strong>URL:</strong> <a href="${publicUrl}" target="_blank" style="color: #00a666;">Visualizza PDF</a>
            </p>`;
          
          // Aggiorna info del test
          document.getElementById('pdfTestInfo').textContent = 
            `${this.commonData.tipologia_test} | ${this.commonData.Materia} | ${this.commonData.section}: ${this.commonData.tipologia_esercizi} ${this.commonData.progressivo}`;
            
        } catch (error) {
          console.error('Errore durante il caricamento:', error);
          statusDiv.innerHTML = '<p style="color: #dc3545;">❌ Errore durante il caricamento. Riprova.</p>';
        }
      }
    };
    
    fileInput.click();
  }

  close() {
    if (this.tableData.length > 0 && !confirm('Sei sicuro di voler chiudere? I dati non salvati andranno persi.')) {
      return;
    }
    this.overlay.style.display = 'none';
  }

  validate() {
    const errors = [];
    
    if (!this.commonData.pdf_url) {
      errors.push('Devi caricare il PDF prima di salvare');
    }
    
    // Usa la lista validi argomenti definita nel constructor
    const validArgomenti = this.validArgomenti;
    
    // Valori validi per risposte
    const validRisposte = ['a', 'b', 'c', 'd', 'e'];
    
    this.tableData.forEach((row, index) => {
      // Valida risposta corretta
      if (!row.correct_answer) {
        errors.push(`Riga ${index + 1}: Manca la risposta corretta`);
      } else if (!validRisposte.includes(row.correct_answer)) {
        errors.push(`Riga ${index + 1}: Risposta "${row.correct_answer}" non valida (deve essere a, b, c, d o e)`);
      }
      
      // Valida numero pagina
      const pageNum = parseInt(row.page_number);
      if (!row.page_number || isNaN(pageNum) || pageNum < 1) {
        errors.push(`Riga ${index + 1}: Numero pagina mancante o non valido`);
      } else if (index > 0) {
        const prevPageNum = parseInt(this.tableData[index - 1].page_number);
        if (!isNaN(prevPageNum) && pageNum !== prevPageNum && pageNum !== prevPageNum + 1) {
          errors.push(`Riga ${index + 1}: Pagina ${pageNum} non valida (può essere solo ${prevPageNum} o ${prevPageNum + 1})`);
        }
      }
      // Nota: non blocchiamo se la prima pagina non è 1 (è solo un avviso)
      
      // Per Simulazioni verifica che l'argomento sia selezionato e valido
      if (this.commonData.Materia === 'Simulazioni') {
        if (!row.argomento) {
          errors.push(`Riga ${index + 1}: Manca l'argomento`);
        } else if (!validArgomenti.includes(row.argomento)) {
          errors.push(`Riga ${index + 1}: Argomento "${row.argomento}" non valido`);
        }
      }
    });
    
    return errors;
  }

  async save() {
    // Inizializza Supabase se non è già fatto
    if (!supabase && !initSupabase()) {
      alert('Errore: Supabase non disponibile. Ricarica la pagina.');
      return;
    }
    
    const errors = this.validate();
    
    if (errors.length > 0) {
      alert('❌ Errori trovati - Impossibile salvare:\n\n' + errors.join('\n') + '\n\nCorreggi gli errori evidenziati in rosso e riprova.');
      return;
    }
    
    if (!confirm('Confermi il salvataggio di tutte le domande?')) {
      return;
    }
    
    try {
      // Mostra stato di caricamento
      const statusDiv = document.getElementById('uploadMessage') || document.createElement('div');
      statusDiv.innerHTML = '<p style="color: #1976d2;">⏳ Salvataggio in corso...<span class="excel-pdf-loading"></span></p>';
      
      // Prepara i dati per il salvataggio
      const dataToSave = this.tableData.map(row => {
        // Crea una copia pulita del record
        const cleanRow = {};
        
        // Copia solo i campi rilevanti (escludi campi UI)
        this.columns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            // Gestisci conversioni speciali
            if (col === 'is_open_ended') {
              cleanRow[col] = Boolean(row[col]);
            } else if (col === 'page_number' || col === 'question_number' || col === 'progressivo') {
              cleanRow[col] = parseInt(row[col]) || 0;
            } else if (col === 'wrong_answers' && typeof row[col] === 'string' && row[col].startsWith('{')) {
              // È già nel formato PostgreSQL array
              cleanRow[col] = row[col];
            } else {
              cleanRow[col] = row[col];
            }
          }
        });
        
        return cleanRow;
      });
      
      console.log('Dati pronti per il salvataggio:', dataToSave);
      
      // Inserisci i dati nella tabella questions
      const { data, error } = await supabase
        .from('questions')
        .insert(dataToSave);
      
      if (error) {
        console.error('Errore Supabase:', error);
        alert(`❌ Errore durante il salvataggio:\n${error.message}\n\nDettagli: ${error.details || 'Nessun dettaglio disponibile'}`);
        return;
      }
      
      // Mostra messaggio di successo
      alert(`✅ Test PDF salvato con successo!\n\n` +
        `Test: ${this.commonData.tipologia_test}\n` +
        `Materia: ${this.commonData.Materia}\n` +
        `Test: ${this.commonData.section}: ${this.commonData.tipologia_esercizi} ${this.commonData.progressivo}\n` +
        `Domande salvate: ${dataToSave.length}`);
      
      // Chiudi il form dopo il salvataggio
      this.overlay.style.display = 'none';
      
      // Ricarica la pagina per aggiornare la lista
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      alert(`❌ Errore durante il salvataggio:\n${error.message || 'Errore sconosciuto'}`);
    }
  }
}

// Crea istanza globale
const excelFormPDF = new ExcelFormPDF();
excelFormPDF.init();

// Esponi globalmente
window.excelFormPDF = excelFormPDF;

// Aggiungi questa funzione helper per verificare che Supabase sia pronto
window.addEventListener('load', () => {
  // Prova a inizializzare Supabase dopo che la pagina è caricata
  setTimeout(() => {
    if (!supabase) {
      initSupabase();
    }
  }, 500);
});