// excel-form-bancadati.js - Form Excel specializzato per Test Banca Dati con supporto LaTeX
// 
// Progressivo: calcolato automaticamente leggendo dalla lista #uploadedTestsList
// La lista è già filtrata per tipologia test dal dropdown
// Cerca: "sezione: tipologia_esercizi progressivo"
// Non incrementa se apri il form senza salvare
//
// Supporto LaTeX: i campi testo domanda e opzioni supportano LaTeX
// Usa $...$ per formule inline e $$...$$ per formule display
//
// Navigazione con tastiera (come Excel):
// - Frecce: muovi tra celle
// - Tab: prossima cella editabile
// - Enter: vai alla riga sotto
//
// Istruzioni collassabili: clicca su "📘 Istruzioni e suggerimenti" per aprire/chiudere
//
// Validazione completa prima del salvataggio:
// - Testo domanda obbligatorio
// - Almeno un'immagine (domanda o opzioni)
// - Risposte corrette: solo A, B, C, D, E
// - Tutti i testi delle opzioni compilati
// - Argomenti: validazione per macro-sezione

// Usa una variabile locale per Supabase per evitare conflitti
let supabaseBD;

// Attendi che Supabase sia disponibile
function initSupabaseBD() {
  // Usa sempre l'istanza globale se disponibile
  if (window.supabase) {
    supabaseBD = window.supabase;
    return true;
  }
  
  // Prova a creare una nuova istanza se necessario
  if (window.supabaseClient && window.supabaseClient.createClient && window.SUPABASE_URL && window.SUPABASE_KEY) {
    supabaseBD = window.supabaseClient.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    return true;
  }
  
  console.warn('Supabase non disponibile per Banca Dati');
  return false;
}

class ExcelFormBancaDati {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.tableData = [];
    this.commonData = {};
    this.columns = [
      'tipologia_test',
      'Materia',
      'section',
      'tipologia_esercizi',
      'GMAT_section',
      'progressivo',
      'criptato',
      'question_number',
      'GMAT_question_difficulty',
      'question_text',
      'correct_answer',
      'wrong_answers',
      'is_open_ended',
      'argomento',
      'image_url',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'option_e',
      'image_option_a',
      'image_option_b',
      'image_option_c',
      'image_option_d',
      'image_option_e',
      'SAT_section'
    ];
  }

  init() {
    this.createOverlay();
    this.attachStyles();
    this.loadMathJax();
  }

  loadMathJax() {
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'MathJax-script';
      
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']]
        },
        startup: {
          pageReady: () => {
            return MathJax.startup.defaultPageReady();
          }
        }
      };
      
      document.head.appendChild(script);
    }
  }

  // Funzione per parsare i dati dal clipboard (supporta tab-separated values)
  parseClipboardData(clipboardText) {
    // Dividi per righe
    const rows = clipboardText.split(/\r?\n/).filter(row => row.trim() !== '');
    
    // Per ogni riga, dividi per tab (Excel usa tab come separatore)
    const parsedData = rows.map(row => {
      return row.split('\t').map(cell => cell.trim());
    });
    
    return parsedData;
  }

  // Funzione per identificare quale cella è stata cliccata
  getCellInfo(element) {
  const td = element.closest('td');
  if (!td) return null;
  
  const tr = td.closest('tr');
  if (!tr) return null;
  
  const tbody = tr.closest('tbody');
  if (!tbody) return null;
  
  const rowIndex = Array.from(tbody.children).indexOf(tr);
  const cellIndex = Array.from(tr.children).indexOf(td);
  
  // Mappa dell'indice della cella al tipo di campo
  const cellTypeMap = {
    7: 'question_text',      // Testo domanda
    8: 'image_url',          // Immagine domanda (SKIP)
    9: 'correct_answer',     // Risposta corretta
    10: 'option_a',          // Opzione A
    11: 'image_option_a',    // Immagine A (SKIP)
    12: 'option_b',          // Opzione B
    13: 'image_option_b',    // Immagine B (SKIP)
    14: 'option_c',          // Opzione C
    15: 'image_option_c',    // Immagine C (SKIP)
    16: 'option_d',          // Opzione D
    17: 'image_option_d',    // Immagine D (SKIP)
    18: 'option_e',          // Opzione E
    19: 'image_option_e',    // Immagine E (SKIP)
    20: 'argomento'          // Argomento
  };
  
  return {
    rowIndex,
    cellIndex,
    fieldType: cellTypeMap[cellIndex] || null
  };
}

  handleMultiCellPaste(startCellInfo, parsedData) {
  const tbody = document.getElementById('excelBDTableBody');
  const allRows = tbody.getElementsByTagName('tr');
  
  let pastedCount = 0;
  
  // Definisci l'ordine corretto delle colonne per l'incollaggio
  // Questo array definisce in quale ordine vanno incollati i dati da Excel
  const pasteOrder = [
    { cellIndex: 8, fieldName: 'question_text' },      // Colonna 1: Testo domanda
    { cellIndex: 10, fieldName: 'correct_answer' },     // Colonna 2: Risposta corretta
    { cellIndex: 11, fieldName: 'option_a' },          // Colonna 3: Opzione A
    { cellIndex: 13, fieldName: 'option_b' },          // Colonna 4: Opzione B
    { cellIndex: 15, fieldName: 'option_c' },          // Colonna 5: Opzione C
    { cellIndex: 17, fieldName: 'option_d' },          // Colonna 6: Opzione D
    { cellIndex: 19, fieldName: 'option_e' },          // Colonna 7: Opzione E
    { cellIndex: 21, fieldName: 'argomento' }          // Colonna 8: Argomento
  ];
  
  // Trova l'indice di partenza nell'array pasteOrder
  let startOrderIndex = pasteOrder.findIndex(item => item.cellIndex === startCellInfo.cellIndex);
  if (startOrderIndex === -1) {
    // Se non è una cella valida per incollaggio, esci
    return;
  }
  
  // Per ogni riga di dati incollati
  parsedData.forEach((rowData, pasteRowIndex) => {
    const targetRowIndex = startCellInfo.rowIndex + pasteRowIndex;
    
    // Verifica che la riga esista
    if (targetRowIndex >= this.tableData.length) return;
    
    // Per ogni colonna di dati incollati
    rowData.forEach((cellData, pasteColIndex) => {
      // Calcola quale campo target usare basandosi sull'ordine di incollaggio
      const targetOrderIndex = startOrderIndex + pasteColIndex;
      
      // Se siamo oltre i campi disponibili, salta
      if (targetOrderIndex >= pasteOrder.length) return;
      
      const targetInfo = pasteOrder[targetOrderIndex];
      const fieldName = targetInfo.fieldName;
      const targetCellIndex = targetInfo.cellIndex;
      
      // Aggiorna il data model
      this.updateCell(targetRowIndex, fieldName, cellData);
      
      // Aggiorna l'UI
      if (allRows[targetRowIndex]) {
        const targetCell = allRows[targetRowIndex].cells[targetCellIndex];
        if (targetCell) {
          const input = targetCell.querySelector('input, textarea');
          if (input && !input.readOnly) {
            // Gestione speciale per risposta corretta
            if (fieldName === 'correct_answer') {
              const normalized = cellData.trim().toUpperCase();
              input.value = normalized;
              this.updateCell(targetRowIndex, fieldName, normalized);
              
              // Valida la risposta
              const isValid = ['A', 'B', 'C', 'D', 'E'].includes(normalized);
              if (!isValid && normalized !== '') {
                input.classList.add('invalid-argomento');
                input.title = '⚠️ Solo A, B, C, D, E';
              } else {
                input.classList.remove('invalid-argomento');
                input.title = 'Risposta corretta (A-E)';
                
                // Auto-compila wrong_answers
                if (normalized && ['A', 'B', 'C', 'D', 'E'].includes(normalized)) {
                  const allAnswers = ['A', 'B', 'C', 'D', 'E'];
                  const wrongAnswers = allAnswers.filter(a => a !== normalized);
                  this.updateCell(targetRowIndex, 'wrong_answers', `{${wrongAnswers.join(',')}}`);
                }
              }
            } else {
              input.value = cellData;
            }
            
            // Gestione LaTeX per campi con preview
            if (fieldName === 'question_text') {
              this.renderLaTeX(cellData, `question-preview-${targetRowIndex}`);
            } else if (fieldName.startsWith('option_')) {
              const letter = fieldName.split('_')[1];
              this.renderLaTeX(cellData, `option-${letter}-preview-${targetRowIndex}`);
            }
            
            // Validazione per argomento se è Simulazioni
            if (fieldName === 'argomento' && this.commonData.Materia === 'Simulazioni') {
              const validArgomenti = [
                'Algebra',
                'Logaritmi ed esponenziali',
                'Probabilità, combinatoria e statistica',
                'Goniometria e trigonometria',
                'Geometria',
                'Funzioni',
                'Pensiero critico',
                'Ragionamento numerico'
              ];
              
              // Normalizza l'argomento
              const normalizedArgomento = this.normalizeArgomento(cellData);
              input.value = normalizedArgomento;
              this.updateCell(targetRowIndex, 'argomento', normalizedArgomento);
              
              if (!validArgomenti.includes(normalizedArgomento) && normalizedArgomento !== '') {
                input.classList.add('invalid-argomento');
              } else {
                input.classList.remove('invalid-argomento');
              }
            }
            
            pastedCount++;
          }
        }
      }
    });
  });
  
  if (pastedCount > 0) {
    const rows = parsedData.length;
    const cols = parsedData[0]?.length || 0;
    this.showPasteNotification(`✅ Incollati ${pastedCount} valori (${rows}×${cols} celle)`);
  }
}

  // Funzione helper per normalizzare gli argomenti
  normalizeArgomento(text) {
    const trimmed = text.trim().replace(/\s+/g, ' ').toLowerCase();
    
    const specialCases = {
      'algebra': 'Algebra',
      'logaritmi ed esponenziali': 'Logaritmi ed esponenziali',
      'probabilità, combinatoria e statistica': 'Probabilità, combinatoria e statistica',
      'probabilita, combinatoria e statistica': 'Probabilità, combinatoria e statistica',
      'probabilità combinatoria e statistica': 'Probabilità, combinatoria e statistica',
      'probabilita combinatoria e statistica': 'Probabilità, combinatoria e statistica',
      'goniometria e trigonometria': 'Goniometria e trigonometria',
      'geometria': 'Geometria',
      'funzioni': 'Funzioni',
      'pensiero critico': 'Pensiero critico',
      'ragionamento numerico': 'Ragionamento numerico'
    };
    
    for (const [key, value] of Object.entries(specialCases)) {
      if (trimmed === key || trimmed.includes(key)) {
        return value;
      }
    }
    
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  attachStyles() {
    if (document.getElementById('excel-form-bancadati-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'excel-form-bancadati-styles';
    style.textContent = `
      .excel-bd-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        z-index: 1000;
        overflow: auto;
      }

      .excel-bd-container {
        background: white;
        margin: 20px auto;
        max-width: 98%;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        max-height: calc(100vh - 40px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .excel-bd-header {
        background: rgb(28, 37, 69);
        color: white;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .excel-bd-header h3 {
        margin: 0;
        font-size: 1.3rem;
      }

      .excel-bd-controls {
        display: flex;
        gap: 1rem;
      }

      .excel-bd-btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.85rem;
      }

      .excel-bd-btn.primary {
        background: #00a666;
        color: white;
      }

      .excel-bd-btn.primary:hover {
        background: #008c55;
      }

      .excel-bd-btn.secondary {
        background: white;
        color: rgb(28, 37, 69);
      }

      .excel-bd-btn.secondary:hover {
        background: #f8f9fa;
      }

      .excel-bd-btn.danger {
        background: #dc3545;
        color: white;
      }

      .excel-bd-table-wrapper {
        flex: 1;
        overflow: auto;
        padding: 1rem;
        background: #f8f9fa;
      }

      .excel-bd-table {
        width: 100%;
        background: white;
        border-collapse: collapse;
        font-size: 0.85rem;
      }

      .excel-bd-table th {
        background: #e9ecef;
        padding: 0.75rem 0.5rem;
        text-align: left;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 10;
        border: 1px solid #dee2e6;
        white-space: nowrap;
      }

      .excel-bd-table td {
        padding: 0.25rem;
        border: 1px solid #dee2e6;
        vertical-align: top;
      }

      .excel-bd-table input,
      .excel-bd-table select,
      .excel-bd-table textarea {
        width: 100%;
        padding: 0.5rem;
        border: none;
        background: transparent;
        font-size: 0.85rem;
        font-family: inherit;
      }

      .excel-bd-table input:focus,
      .excel-bd-table select:focus,
      .excel-bd-table textarea:focus {
        outline: 2px solid #00a666;
        background: white;
        box-shadow: 0 0 0 3px rgba(0, 166, 102, 0.1);
      }

      .excel-bd-table textarea {
        resize: vertical;
        min-height: 80px;
      }

      .excel-bd-table tr:hover {
        background: #f8f9fa;
      }

      .excel-bd-table .row-number {
        background: #e9ecef;
        text-align: center;
        font-weight: 600;
        color: #666;
        position: sticky;
        left: 0;
        z-index: 5;
      }

      .excel-bd-footer {
        background: #f8f9fa;
        padding: 1rem 1.5rem;
        border-top: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .excel-bd-status {
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

      .sync-field {
        background: #e3f2fd !important;
        border: 1px solid #90caf9 !important;
      }

      .sync-field:focus {
        outline: 2px solid #1976d2 !important;
        background: #e3f2fd !important;
      }

      .image-upload-cell {
        min-width: 120px;
      }

      .image-upload-btn {
        padding: 0.3rem 0.6rem;
        font-size: 0.7rem;
        border: 1px solid #00a666;
        border-radius: 4px;
        background: white;
        color: #00a666;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .image-upload-btn:hover {
        background: #00a666;
        color: white;
      }

      .image-upload-btn.uploaded {
        background: #d4edda;
        border-color: #00a666;
        color: #155724;
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

      .excel-bd-loading {
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

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .excel-bd-table input[list] {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 0.5rem center;
        background-size: 1.2rem;
        padding-right: 2rem;
      }
      
      .excel-bd-table input[list]:focus {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300a666' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      }
      
      .excel-bd-table input[list].invalid-argomento {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f44336' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      }

      .excel-bd-table input.invalid-argomento {
        background: #ffebee !important;
        border-color: #f44336 !important;
        color: #d32f2f !important;
      }
      
      .excel-bd-table input.warning-field {
        background: #fff3cd !important;
        border-color: #ffc107 !important;
        color: #856404 !important;
      }

      .excel-bd-paste-notification {
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

      .latex-preview {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 0.5rem;
        margin-top: 0.25rem;
        font-size: 0.9rem;
        min-height: 30px;
      }

      .option-group {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .option-label {
        font-weight: 600;
        color: #495057;
        margin-bottom: 0.25rem;
        font-size: 0.8rem;
      }

      .question-textarea {
        min-height: 100px;
        font-family: 'Courier New', monospace;
      }

      .option-textarea {
        min-height: 60px;
        font-family: 'Courier New', monospace;
      }

      td.question-cell {
        min-width: 300px;
      }

      td.option-cell {
        min-width: 200px;
      }
    `;
    document.head.appendChild(style);
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'excel-bd-overlay';
    
    this.container = document.createElement('div');
    this.container.className = 'excel-bd-container';
    
    const header = document.createElement('div');
    header.className = 'excel-bd-header';
    header.innerHTML = `
      <h3>🏦 Question Bank Test Editor with LaTeX</h3>
      <div class="excel-bd-controls">
        <button class="excel-bd-btn secondary" onclick="excelFormBancaDati.addRow()">➕ Add Row</button>
        <button class="excel-bd-btn info" onclick="excelFormBancaDati.saveDraft()">📝 Save Draft</button>
        <button class="excel-bd-btn primary" onclick="excelFormBancaDati.save()">💾 Save to Database</button>
        <button class="excel-bd-btn danger" onclick="excelFormBancaDati.close()">✖ Close</button>
      </div>
    `;
    
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'excel-bd-table-wrapper';
    
    const table = document.createElement('table');
    table.className = 'excel-bd-table';
    table.id = 'excelBDTable';
    
    const footer = document.createElement('div');
    footer.className = 'excel-bd-footer';
    footer.innerHTML = `
      <div class="excel-bd-status">
        <span id="bdRowCount">0 righe</span> | 
        <span id="bdTestInfo">Test Banca Dati</span>
      </div>
      <div class="excel-bd-controls">
        <button class="excel-bd-btn secondary" onclick="excelFormBancaDati.clearAll()">🗑️ Pulisci Tutto</button>
        <button class="excel-bd-btn secondary" onclick="excelFormBancaDati.renderAllLaTeX()">🔄 Aggiorna LaTeX</button>
      </div>
    `;
    
    tableWrapper.appendChild(table);
    this.container.appendChild(header);
    this.container.appendChild(tableWrapper);
    this.container.appendChild(footer);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  }

  async open() {
    // Check for existing draft first
    const hasDraft = await this.checkForDraft();

    if (hasDraft) {
      // Draft was restored, show the editor
      this.buildTable();
      this.overlay.style.display = 'block';

      document.getElementById('bdTestInfo').textContent =
        `${this.commonData.tipologia_test} | ${this.commonData.Materia} | ${this.commonData.section}: ${this.commonData.tipologia_esercizi} ${this.commonData.progressivo}`;

      this.showInfoBanner();

      // Rebuild rows from tableData
      const tbody = document.getElementById('excelBDTableBody');
      tbody.innerHTML = '';
      this.tableData.forEach((rowData, index) => {
        const tr = document.createElement('tr');

        const tdNum = document.createElement('td');
        tdNum.className = 'row-number';
        tdNum.textContent = index + 1;
        tr.appendChild(tdNum);

        this.createCells(tr, rowData, index);
        tbody.appendChild(tr);
      });

      this.updateStatus();
      this.setupKeyboardNavigation();

      // Re-render LaTeX if present
      if (window.MathJax) {
        MathJax.typesetPromise().catch(err => console.error('MathJax error:', err));
      }
    } else {
      // No draft, show config modal
      this.showInitialConfig();
    }
  }

  updateMateriaOptions(tipologiaTest) {
    const materiaSelect = document.getElementById('configBDMateria');
    if (!materiaSelect) return;

    if (tipologiaTest === 'GMAT') {
      // GMAT-specific macro-sections
      materiaSelect.innerHTML = `
        <option value="">Seleziona...</option>
        <option value="Assessment Iniziale">Assessment Iniziale</option>
        <option value="Quantitative Reasoning">Quantitative Reasoning</option>
        <option value="Data Insights">Data Insights</option>
        <option value="Verbal Reasoning">Verbal Reasoning</option>
        <option value="Simulazioni">Simulazioni</option>
      `;
    } else {
      // Default options for other tests
      materiaSelect.innerHTML = `
        <option value="">Seleziona...</option>
        <option value="Matematica">Matematica</option>
        <option value="Assessment Iniziale">Assessment Iniziale</option>
        <option value="Simulazioni">Simulazioni</option>
        <option value="Biologia">Biologia</option>
        <option value="Chimica">Chimica</option>
        <option value="Fisica">Fisica</option>
        <option value="Logica">Logica</option>
        <option value="Cultura Generale">Cultura Generale</option>
        <option value="Altro">Altro</option>
      `;
    }
  }

  updateSectionField(materia) {
    const sectionField = document.getElementById('sectionField');

    // For GMAT, section = materia (readonly)
    const tipologiaTest = document.getElementById('configBDTipologiaTest')?.value;
    const isGMAT = tipologiaTest === 'GMAT';

    if (isGMAT) {
      // For GMAT, section always equals materia
      sectionField.innerHTML = `
        <input type="text" id="configBDSection" value="${materia}" readonly
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6;
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia === 'Simulazioni') {
      sectionField.innerHTML = `
        <input type="text" id="configBDSection" value="Simulazioni" readonly
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6;
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia === 'Assessment Iniziale') {
      // NUOVO: Assessment Iniziale ha sezione fissa
      sectionField.innerHTML = `
        <input type="text" id="configBDSection" value="Assessment Iniziale" readonly
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6;
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia === 'Altro' || materia === 'Matematica') {
      const sectionOptions = [
        '',
        'Algebra',
        'Logaritmi ed esponenziali',
        'Probabilità, combinatoria e statistica',
        'Goniometria e trigonometria',
        'Geometria',
        'Funzioni',
        'Pensiero critico',
        'Ragionamento numerico'
      ];

      let selectHTML = '<select id="configBDSection" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">';
      selectHTML += '<option value="">Seleziona...</option>';
      sectionOptions.forEach(option => {
        if (option) {
          selectHTML += `<option value="${option}">${option}</option>`;
        }
      });
      selectHTML += '</select>';

      sectionField.innerHTML = selectHTML;
      document.getElementById('configBDSection').addEventListener('change', () => this.checkAndCalculateProgressivo());
    } else {
      sectionField.innerHTML = `
        <input type="text" id="configBDSection" placeholder="es. Genetica"
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
      `;
      document.getElementById('configBDSection').addEventListener('input', () => this.checkAndCalculateProgressivo());
    }
  }

  updateTipologiaField(materia) {
    const tipologiaField = document.getElementById('tipologiaField');

    // Check if GMAT
    const tipologiaTest = document.getElementById('configBDTipologiaTest')?.value;
    const isGMAT = tipologiaTest === 'GMAT';

    if (isGMAT) {
      // GMAT logic
      if (materia === 'Assessment Iniziale') {
        tipologiaField.innerHTML = `
          <input type="text" id="configBDTipologiaEsercizi" value="Assessment" readonly
                 style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6;
                        border-radius: 6px; background: #f0f0f0; color: #666;">
        `;
        setTimeout(() => this.checkAndCalculateProgressivo(), 0);
      } else if (materia === 'Simulazioni') {
        tipologiaField.innerHTML = `
          <input type="text" id="configBDTipologiaEsercizi" value="Test" readonly
                 style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6;
                        border-radius: 6px; background: #f0f0f0; color: #666;">
        `;
        setTimeout(() => this.checkAndCalculateProgressivo(), 0);
      } else if (materia === 'Quantitative Reasoning' || materia === 'Data Insights' || materia === 'Verbal Reasoning') {
        // Dropdown for the 3 main sections
        let selectHTML = '<select id="configBDTipologiaEsercizi" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">';
        selectHTML += '<option value="">Seleziona...</option>';
        selectHTML += '<option value="Esercizi per casa">Esercizi per casa</option>';
        selectHTML += '<option value="Assessment">Assessment</option>';
        selectHTML += '</select>';

        tipologiaField.innerHTML = selectHTML;
        document.getElementById('configBDTipologiaEsercizi').addEventListener('change', () => this.checkAndCalculateProgressivo());
      } else {
        tipologiaField.innerHTML = `
          <input type="text" id="configBDTipologiaEsercizi" placeholder="Seleziona macro-sezione"
                 style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
        `;
      }
    } else if (materia === 'Simulazioni') {
      tipologiaField.innerHTML = `
        <input type="text" id="configBDTipologiaEsercizi" value="Test" readonly
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6;
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia === 'Assessment Iniziale') {
      // NUOVO: Assessment Iniziale ha tipologia fissa "Assessment"
      tipologiaField.innerHTML = `
        <input type="text" id="configBDTipologiaEsercizi" value="Assessment" readonly
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6;
                      border-radius: 6px; background: #f0f0f0; color: #666;">
      `;
      setTimeout(() => this.checkAndCalculateProgressivo(), 0);
    } else if (materia === 'Altro' || materia === 'Matematica') {
      let selectHTML = '<select id="configBDTipologiaEsercizi" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">';
      selectHTML += '<option value="">Seleziona...</option>';
      selectHTML += '<option value="Esercizi per casa">Esercizi per casa</option>';
      selectHTML += '<option value="Assessment">Assessment</option>';
      selectHTML += '</select>';

      tipologiaField.innerHTML = selectHTML;
      document.getElementById('configBDTipologiaEsercizi').addEventListener('change', () => this.checkAndCalculateProgressivo());
    } else {
      tipologiaField.innerHTML = `
        <input type="text" id="configBDTipologiaEsercizi" placeholder="es. Quiz"
               style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
      `;
      document.getElementById('configBDTipologiaEsercizi').addEventListener('input', () => this.checkAndCalculateProgressivo());
    }
  }

  showInitialConfig() {
    const configModal = document.createElement('div');
    configModal.className = 'excel-bd-overlay';
    configModal.style.display = 'block';
    configModal.style.zIndex = '1001';
    
    const configContainer = document.createElement('div');
    configContainer.className = 'excel-bd-container';
    configContainer.style.maxWidth = '600px';
    configContainer.innerHTML = `
      <div class="excel-bd-header">
        <h3>⚙️ Configurazione Test Banca Dati</h3>
      </div>
      <div style="padding: 2rem;">
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Tipologia Test:*</label>
          <select id="configBDTipologiaTest" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
            <option value="">Seleziona...</option>
            <option value="ARCHED">ARCHED</option>
            <option value="PROFESSIONI SANITARIE BD">PROFESSIONI SANITARIE BD</option>
            <option value="VETERINARIA BD">VETERINARIA BD</option>
            <option value="ARCHITETTURA BD">ARCHITETTURA BD</option>
            <option value="GMAT">GMAT</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Macro-sezione:*</label>
          <select id="configBDMateria" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
            <option value="">Seleziona...</option>
            <option value="Matematica">Matematica</option>
            <option value="Assessment Iniziale">Assessment Iniziale</option>
            <option value="Simulazioni">Simulazioni</option>
            <option value="Biologia">Biologia</option>
            <option value="Chimica">Chimica</option>
            <option value="Fisica">Fisica</option>
            <option value="Logica">Logica</option>
            <option value="Cultura Generale">Cultura Generale</option>
            <option value="Altro">Altro</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;" id="sectionContainer">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Sezione:*</label>
          <div id="sectionField">
            <input type="text" id="configBDSection" placeholder="es. Genetica" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
          </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;" id="tipologiaContainer">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Tipologia Esercizi:*</label>
          <div id="tipologiaField">
            <input type="text" id="configBDTipologiaEsercizi" placeholder="es. Quiz" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
          </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Progressivo:</label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input type="number" id="configBDProgressivo" value="1" min="1" readonly style="width: 100px; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px; background: #f0f0f0;">
            <span id="configProgressivoInfo" style="color: #666; font-size: 0.9rem;">Seleziona tutti i campi sopra per calcolare il progressivo</span>
          </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Numero di domande:* <span style="font-weight: 400; color: #666;">(aggiungi numero totale includendo adaptive)</span></label>
          <input type="number" id="configBDNumDomande" value="10" min="1" max="200" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="excel-bd-btn secondary" onclick="document.body.removeChild(this.closest('.excel-bd-overlay'))">Annulla</button>
          <button class="excel-bd-btn primary" id="continueButton" onclick="excelFormBancaDati.startWithConfig(this.closest('.excel-bd-overlay'))" disabled style="opacity: 0.6; cursor: not-allowed;">Continua</button>
        </div>
      </div>
    `;
    
    configModal.appendChild(configContainer);
    document.body.appendChild(configModal);
    
    // Event listeners
    const materiaSelect = document.getElementById('configBDMateria');
    materiaSelect.addEventListener('change', (e) => {
      this.updateSectionField(e.target.value);
      this.updateTipologiaField(e.target.value);
    });
    
    // Event listeners per il calcolo del progressivo
    document.getElementById('configBDTipologiaTest').addEventListener('change', () => {
      const uploadedDropdown = document.getElementById('uploadedTestsDropdown');
      const newTipologia = document.getElementById('configBDTipologiaTest').value;

      // Update Materia options based on test type
      this.updateMateriaOptions(newTipologia);

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
    
    // Input listeners per campi non-select
    const sectionInput = document.getElementById('configBDSection');
    if (sectionInput && sectionInput.tagName === 'INPUT') {
      sectionInput.addEventListener('input', () => this.checkAndCalculateProgressivo());
    }
    
    const tipologiaInput = document.getElementById('configBDTipologiaEsercizi');
    if (tipologiaInput && tipologiaInput.tagName === 'INPUT') {
      tipologiaInput.addEventListener('input', () => this.checkAndCalculateProgressivo());
    }
    
    // Calcola il progressivo iniziale dopo un delay
    setTimeout(() => {
      const uploadedDropdown = document.getElementById('uploadedTestsDropdown');
      const formTipologia = document.getElementById('configBDTipologiaTest')?.value;
      
      if (uploadedDropdown && formTipologia) {
        for (let option of uploadedDropdown.options) {
          if (option.value === formTipologia) {
            uploadedDropdown.value = formTipologia;
            uploadedDropdown.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
      
      this.checkAndCalculateProgressivo();
      
      if (uploadedDropdown) {
        uploadedDropdown.addEventListener('change', () => {
          if (document.getElementById('configBDTipologiaTest')?.value) {
            this.checkAndCalculateProgressivo();
          }
        });
      }
    }, 1000);
  }

  async mostraDialogSceltaProgressivo(buchi, nextProgressivo, tipologiaTest, section, tipologiaEsercizi) {
    return new Promise(resolve => {
      // Create modal for choice
      const modal = document.createElement('div');
      modal.className = 'excel-bd-overlay';
      modal.style.display = 'block';
      modal.style.zIndex = '1002';
      
      const container = document.createElement('div');
      container.className = 'excel-bd-container';
      container.style.maxWidth = '500px';
      container.innerHTML = `
        <div class="excel-bd-header">
          <h3>🔢 Scegli il progressivo</h3>
        </div>
        <div style="padding: 2rem;">
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px;">
            <p style="margin: 0; font-weight: 600; color: #856404;">
              ⚠️ Trovati ${buchi.length} progressivi mancanti nella sequenza
            </p>
            <p style="margin: 0.5rem 0 0 0; color: #856404; font-size: 0.9rem;">
              Test: ${tipologiaTest}<br>
              Sezione: ${section}: ${tipologiaEsercizi}
            </p>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Progressivi mancanti (buchi):</label>
            <div style="max-height: 150px; overflow-y: auto; padding: 1rem; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px;">
              ${buchi.slice(0, 20).join(', ')}${buchi.length > 20 ? ', ...' : ''}
            </div>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <p style="font-weight: 600; margin-bottom: 1rem;">Cosa vuoi fare?</p>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <button id="btnUsaPrimoBuco" class="excel-bd-btn primary" style="width: 100%; padding: 1rem; text-align: left;">
                <div style="font-weight: 600;">📥 Usa il primo buco disponibile</div>
                <div style="font-size: 0.85rem; margin-top: 0.25rem; opacity: 0.9;">
                  Progressivo: ${buchi[0]}
                </div>
              </button>
              
              <button id="btnUsaSuccessivo" class="excel-bd-btn secondary" style="width: 100%; padding: 1rem; text-align: left;">
                <div style="font-weight: 600;">➡️ Usa il progressivo successivo</div>
                <div style="font-size: 0.85rem; margin-top: 0.25rem; opacity: 0.9;">
                  Progressivo: ${nextProgressivo}
                </div>
              </button>
            </div>
          </div>
          
          <div style="background: #e3f2fd; padding: 0.75rem; border-radius: 6px; margin-top: 1rem;">
            <p style="margin: 0; font-size: 0.85rem; color: #1565c0;">
              💡 <strong>Suggerimento:</strong> Usa il primo buco per mantenere la sequenza ordinata.
            </p>
          </div>
        </div>
      `;
      
      modal.appendChild(container);
      document.body.appendChild(modal);
      
      // Event handlers
      document.getElementById('btnUsaPrimoBuco').onclick = () => {
        document.body.removeChild(modal);
        resolve(buchi[0]);
      };
      
      document.getElementById('btnUsaSuccessivo').onclick = () => {
        document.body.removeChild(modal);
        resolve(nextProgressivo);
      };
    });
  }

  async checkAndCalculateProgressivo() {
    const tipologiaTest = document.getElementById('configBDTipologiaTest').value;
    const materia = document.getElementById('configBDMateria').value;
    const section = document.getElementById('configBDSection').value;
    const tipologiaEsercizi = document.getElementById('configBDTipologiaEsercizi').value;
    
    const progressivoInfo = document.getElementById('configProgressivoInfo');
    const progressivoInput = document.getElementById('configBDProgressivo');
    const continueButton = document.getElementById('continueButton');
    
    if (!tipologiaTest || !materia || !section || !tipologiaEsercizi) {
      progressivoInfo.textContent = 'Seleziona tutti i campi sopra per calcolare il progressivo';
      progressivoInfo.style.color = '#666';
      progressivoInput.value = 1;
      
      if (continueButton) {
        continueButton.disabled = true;
        continueButton.style.opacity = '0.6';
        continueButton.style.cursor = 'not-allowed';
      }
      return;
    }
    
    progressivoInfo.textContent = 'Calcolo progressivo in corso...';
    progressivoInfo.style.color = '#1976d2';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Collect ALL existing progressives (not just max)
      const progressiviTrovati = new Set();
      const searchPattern = `${section}: ${tipologiaEsercizi}`;
      
      const testListItems = document.querySelectorAll('#uploadedTestsList li');
      const uploadedDropdown = document.getElementById('uploadedTestsDropdown');
      const dropdownMatchesForm = uploadedDropdown && uploadedDropdown.value === tipologiaTest;
      
      if (dropdownMatchesForm && testListItems.length > 0) {
        testListItems.forEach(li => {
          const text = li.textContent || '';
          
          if (text.includes(searchPattern)) {
            const match = text.match(new RegExp(`${searchPattern}\\s+(\\d+)`));
            if (match && match[1]) {
              const num = parseInt(match[1]);
              progressiviTrovati.add(num);
              console.log(`Trovato nella lista filtrata: "${searchPattern} ${num}"`);
            }
          }
        });
      }
      
      if (!dropdownMatchesForm || testListItems.length === 0 || progressiviTrovati.size === 0) {
        const allElements = document.querySelectorAll('td, li, div, span, p, a, h1, h2, h3, h4, h5, h6');
        
        allElements.forEach(element => {
          if (element.closest('.excel-bd-overlay')) return;
          
          const text = element.textContent || '';
          
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
      
      // Convert Set to sorted array
      const progressiviOrdinati = Array.from(progressiviTrovati).sort((a, b) => a - b);
      
      // Find gaps in sequence
      const buchi = [];
      if (progressiviOrdinati.length > 0) {
        // Check for gaps before the first element
        for (let i = 1; i < progressiviOrdinati[0]; i++) {
          buchi.push(i);
        }
        
        // Check for gaps between consecutive elements
        for (let i = 0; i < progressiviOrdinati.length - 1; i++) {
          const current = progressiviOrdinati[i];
          const next = progressiviOrdinati[i + 1];
          for (let j = current + 1; j < next; j++) {
            buchi.push(j);
          }
        }
      }
      
      // Calculate new progressive
      const maxProgressivo = progressiviOrdinati.length > 0 ? Math.max(...progressiviOrdinati) : 0;
      const nextProgressivo = maxProgressivo + 1;
      
      // Check if there are gaps and user should choose
      if (buchi.length > 0) {
        // Show dialog to choose progressive
        const scelta = await this.mostraDialogSceltaProgressivo(buchi, nextProgressivo, tipologiaTest, section, tipologiaEsercizi);
        progressivoInput.value = scelta;
        progressivoInfo.textContent = `📊 Progressivo selezionato: ${scelta} (trovati ${buchi.length} buchi nella sequenza)`;
      } else {
        progressivoInput.value = nextProgressivo;
        progressivoInfo.textContent = maxProgressivo === 0 
          ? `✨ Primo test per "${section}: ${tipologiaEsercizi}" (${tipologiaTest})` 
          : `📊 Trovati ${maxProgressivo} test esistenti → Progressivo: ${nextProgressivo}`;
      }
      
      progressivoInfo.style.color = '#00a666';
      
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
      
      if (continueButton) {
        continueButton.disabled = false;
        continueButton.style.opacity = '1';
        continueButton.style.cursor = 'pointer';
      }
    }
  }

  startWithConfig(configModal) {
    const tipologiaTest = document.getElementById('configBDTipologiaTest').value;
    const materia = document.getElementById('configBDMateria').value;
    const section = document.getElementById('configBDSection').value;
    const tipologiaEsercizi = document.getElementById('configBDTipologiaEsercizi').value;
    const progressivo = parseInt(document.getElementById('configBDProgressivo').value);
    const numDomande = parseInt(document.getElementById('configBDNumDomande').value);
    
    if (!tipologiaTest || !materia || !section || !tipologiaEsercizi) {
      alert('Compila tutti i campi obbligatori!');
      return;
    }
    
    if (!numDomande || numDomande < 1) {
      alert('Inserisci un numero valido di domande!');
      return;
    }
    
    const progressivoInfo = document.getElementById('configProgressivoInfo');
    if (progressivoInfo && progressivoInfo.textContent.includes('Seleziona tutti i campi')) {
      alert('Attendi che il progressivo venga calcolato prima di continuare!');
      return;
    }
    
    this.commonData = {
      tipologia_test: tipologiaTest,
      Materia: materia,
      section: section,
      tipologia_esercizi: tipologiaEsercizi,
      progressivo: progressivo,
      num_domande: numDomande
    };
    
    document.body.removeChild(configModal);
    
    this.tableData = [];
    this.buildTable();
    this.overlay.style.display = 'block';
    
    document.getElementById('bdTestInfo').textContent = 
      `${this.commonData.tipologia_test} | ${this.commonData.Materia} | ${this.commonData.section}: ${this.commonData.tipologia_esercizi} ${this.commonData.progressivo}`;
    
    this.showInfoBanner();
    
    for (let i = 0; i < numDomande; i++) {
      this.addRow();
    }
    
    this.setupKeyboardNavigation();
    
    setTimeout(() => {
      const firstInput = document.querySelector('#excelBDTableBody textarea:not([readonly])');
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    }, 100);
  }

  showInfoBanner() {
    const tableWrapper = this.container.querySelector('.excel-bd-table-wrapper');
    
    const existingBanner = tableWrapper.querySelector('.info-banner');
    if (existingBanner) existingBanner.remove();
    
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
      Compila il testo della domanda, le opzioni e carica le immagini necessarie.
      
      <br><br>📝 <strong>Supporto LaTeX:</strong>
      <br>&nbsp;&nbsp;• Usa <code>$...$</code> per formule inline (es: $x^2 + y^2 = z^2$)
      <br>&nbsp;&nbsp;• Usa <code>$$...$$</code> per formule su riga separata
      <br>&nbsp;&nbsp;• La preview viene aggiornata automaticamente sotto ogni campo
      
      <br><br>📷 <strong>Immagini:</strong>
      <br>&nbsp;&nbsp;• Puoi caricare un'immagine per la domanda
      <br>&nbsp;&nbsp;• Puoi caricare un'immagine per ciascuna opzione (A-E)
      <br>&nbsp;&nbsp;• Almeno un'immagine è richiesta (domanda o opzioni)`;
    
    if (this.commonData.Materia === 'Simulazioni') {
      bannerText += `<br><br>💡 <strong>Suggerimento per l'argomento:</strong>
        <br>&nbsp;&nbsp;• <strong>Cliccare sul campo</strong> per vedere tutte le opzioni
        <br>&nbsp;&nbsp;• <strong>Doppio click o freccia ↓</strong> per rivedere le opzioni quando sei già nel campo
        <br>&nbsp;&nbsp;• Iniziare a digitare per filtrare le opzioni
        <br>&nbsp;&nbsp;• I testi vengono normalizzati automaticamente`;
    }
    
    bannerText += `<br><br>📋 <strong>Copia/Incolla multiplo:</strong> NUOVO! Puoi incollare tabelle complete da Excel:
      <br>&nbsp;&nbsp;• <strong>Incolla tutto insieme</strong>: domanda + risposta + opzioni A-E
      <br>&nbsp;&nbsp;• Copia da Excel con selezione rettangolare
      <br>&nbsp;&nbsp;• Il sistema distribuirà automaticamente i dati nelle celle corrette
      <br>&nbsp;&nbsp;• Funziona sia verticalmente (più righe) che orizzontalmente (più colonne)
      
      <br><br>⌨️ <strong>Navigazione con tastiera:</strong>
      <br>&nbsp;&nbsp;• <strong>Tab</strong> Prossima cella editabile
      <br>&nbsp;&nbsp;• <strong>Shift+Tab</strong> Cella precedente
      <br>&nbsp;&nbsp;• <strong>Ctrl+Enter</strong> Aggiorna preview LaTeX`;
    
    bannerContent.innerHTML = bannerText;
    
    bannerHeader.addEventListener('click', () => {
      infoBanner.classList.toggle('expanded');
    });
    
    infoBanner.appendChild(bannerHeader);
    infoBanner.appendChild(bannerContent);
    
    tableWrapper.insertBefore(infoBanner, tableWrapper.firstChild);
  }

  setupKeyboardNavigation() {
    const tbody = document.getElementById('excelBDTableBody');
    if (!tbody) return;
    
    // Gestore paste globale per la tabella
    tbody.addEventListener('paste', (e) => {
      // Se il target è un input o textarea specifico, lascia che gestisca il suo paste
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        const cellInfo = this.getCellInfo(e.target);
        if (!cellInfo) return;
        
        // Se è una delle celle che vogliamo gestire in modo speciale
        const textFields = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e'];
        if (textFields.includes(cellInfo.fieldType)) {
          e.preventDefault();
          e.stopPropagation();
          
          const clipboardData = (e.clipboardData || window.clipboardData).getData('text');
          const parsedData = this.parseClipboardData(clipboardData);
          
          this.handleMultiCellPaste(cellInfo, parsedData);
        }
      }
    });
    
    tbody.addEventListener('keydown', (e) => {
      const target = e.target;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.renderAllLaTeX();
        return;
      }
      
      if (e.key === 'Tab') {
        // Tab navigation è già gestita dal browser
        return;
      }
    });
  }

  showPasteNotification(message) {
    const existingNotification = document.querySelector('.excel-bd-paste-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'excel-bd-paste-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  buildTable() {
    const table = document.getElementById('excelBDTable');
    table.innerHTML = '';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const th = document.createElement('th');
    th.textContent = '#';
    headerRow.appendChild(th);
    
    const visibleColumns = [
      { id: 'tipologia_test', name: 'Tipologia Test', width: '120px' },
      { id: 'Materia', name: 'Macro-sezione', width: '100px' },
      { id: 'section', name: 'Sezione', width: '100px' },
      { id: 'tipologia_esercizi', name: 'Tipologia', width: '100px' },
      { id: 'GMAT_section', name: 'GMAT Section', width: '120px' },
      { id: 'progressivo', name: 'Prog.', width: '60px' },
      { id: 'question_number', name: 'N°', width: '50px' },
      { id: 'GMAT_question_difficulty', name: 'Difficulty', width: '100px' },
      { id: 'question_text', name: 'Testo Domanda (LaTeX)', width: '300px' },
      { id: 'image_url', name: 'Img Domanda', width: '120px' },
      { id: 'correct_answer', name: 'Risp.', width: '60px' },
      { id: 'option_a', name: 'Opzione A', width: '150px' },
      { id: 'image_option_a', name: 'Img A', width: '100px' },
      { id: 'option_b', name: 'Opzione B', width: '150px' },
      { id: 'image_option_b', name: 'Img B', width: '100px' },
      { id: 'option_c', name: 'Opzione C', width: '150px' },
      { id: 'image_option_c', name: 'Img C', width: '100px' },
      { id: 'option_d', name: 'Opzione D', width: '150px' },
      { id: 'image_option_d', name: 'Img D', width: '100px' },
      { id: 'option_e', name: 'Opzione E', width: '150px' },
      { id: 'image_option_e', name: 'Img E', width: '100px' },
      { id: 'argomento', name: 'Argomento', width: '150px' }
    ];
    
    visibleColumns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.name;
      th.style.minWidth = col.width;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    tbody.id = 'excelBDTableBody';
    table.appendChild(tbody);
  }

  addRow() {
    const tbody = document.getElementById('excelBDTableBody');
    const rowIndex = this.tableData.length;
    const tr = document.createElement('tr');
    
    const tdNum = document.createElement('td');
    tdNum.className = 'row-number';
    tdNum.textContent = rowIndex + 1;
    tr.appendChild(tdNum);
    
    const rowData = {
      ...this.commonData,
      GMAT_section: '',
      criptato: false,
      question_number: rowIndex + 1,
      GMAT_question_difficulty: '',
      question_text: '',
      correct_answer: '',
      wrong_answers: '',
      is_open_ended: false,
      argomento: this.commonData.Materia === 'Simulazioni' ? '' :
                  this.commonData.Materia === 'Assessment Iniziale' ? 'Assessment Iniziale' :
                  this.commonData.section,
      image_url: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      option_e: '',
      image_option_a: '',
      image_option_b: '',
      image_option_c: '',
      image_option_d: '',
      image_option_e: ''
    };
    
    this.createCells(tr, rowData, rowIndex);
    
    this.tableData.push(rowData);
    tbody.appendChild(tr);
    this.updateStatus();
  }

  createCells(tr, rowData, rowIndex) {
    // Tipologia Test - readonly
    this.createReadonlyCell(tr, rowData.tipologia_test);
    
    // Materia - readonly
    this.createReadonlyCell(tr, rowData.Materia);
    
    // Sezione - readonly
    this.createReadonlyCell(tr, rowData.section);
    
    // Tipologia Esercizi - readonly
    this.createReadonlyCell(tr, rowData.tipologia_esercizi);

    // GMAT Section - only for GMAT tests
    const isGMAT = rowData.tipologia_test === 'GMAT';
    if (isGMAT) {
      const tdGmatSection = document.createElement('td');
      const gmatSectionSelect = document.createElement('select');
      gmatSectionSelect.style.width = '100%';
      gmatSectionSelect.style.padding = '0.5rem';

      const options = ['', 'Quantitative Reasoning', 'Data Insights', 'Verbal Reasoning'];
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt || 'Seleziona...';
        if (rowData.GMAT_section === opt) {
          option.selected = true;
        }
        gmatSectionSelect.appendChild(option);
      });

      gmatSectionSelect.addEventListener('change', (e) => {
        this.updateCell(rowIndex, 'GMAT_section', e.target.value);
        // Auto-update argomento to match GMAT_section
        this.updateCell(rowIndex, 'argomento', e.target.value);
        // Update argomento field in UI
        const argomentoField = document.getElementById(`argomento-${rowIndex}`);
        if (argomentoField) {
          argomentoField.value = e.target.value;
        }
      });

      tdGmatSection.appendChild(gmatSectionSelect);
      tr.appendChild(tdGmatSection);
    } else {
      // For non-GMAT tests, add empty readonly cell
      this.createReadonlyCell(tr, '');
    }

    // Progressivo - readonly
    this.createReadonlyCell(tr, rowData.progressivo);
    
    // N° Domanda - readonly
    this.createReadonlyCell(tr, rowData.question_number);

    // GMAT Question Difficulty - only for GMAT tests
    if (isGMAT) {
      const tdDifficulty = document.createElement('td');
      const difficultySelect = document.createElement('select');
      difficultySelect.style.width = '100%';
      difficultySelect.style.padding = '0.5rem';

      const options = ['', 'Easy', 'Medium', 'Hard'];
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt || 'Seleziona...';
        if (rowData.GMAT_question_difficulty === opt) {
          option.selected = true;
        }
        difficultySelect.appendChild(option);
      });

      difficultySelect.addEventListener('change', (e) => {
        this.updateCell(rowIndex, 'GMAT_question_difficulty', e.target.value);
      });

      tdDifficulty.appendChild(difficultySelect);
      tr.appendChild(tdDifficulty);
    } else {
      // For non-GMAT tests, add empty readonly cell
      this.createReadonlyCell(tr, '');
    }

    // Testo Domanda con LaTeX
    const tdQuestion = document.createElement('td');
    tdQuestion.className = 'question-cell';
    const questionTextarea = document.createElement('textarea');
    questionTextarea.className = 'question-textarea';
    questionTextarea.placeholder = 'Testo domanda... Usa $...$ per LaTeX inline';
    questionTextarea.value = rowData.question_text || '';
    
    const questionPreview = document.createElement('div');
    questionPreview.className = 'latex-preview';
    questionPreview.id = `question-preview-${rowIndex}`;
    
    questionTextarea.addEventListener('input', (e) => {
      this.updateCell(rowIndex, 'question_text', e.target.value);
      this.renderLaTeX(e.target.value, `question-preview-${rowIndex}`);
    });
    
    tdQuestion.appendChild(questionTextarea);
    tdQuestion.appendChild(questionPreview);
    tr.appendChild(tdQuestion);
    
    // Immagine Domanda
    this.createImageCell(tr, rowIndex, 'image_url', 'Domanda');
    
    // Risposta Corretta - conserva il paste handler solo per incollaggio singolo
    const tdCorrect = document.createElement('td');
    const correctInput = document.createElement('input');
    correctInput.type = 'text';
    correctInput.placeholder = 'A-E';
    correctInput.maxLength = '1';
    correctInput.style.textTransform = 'uppercase';
    
    const normalizeAnswer = (text) => text.trim().toUpperCase();
    
    const validateAnswer = (value) => {
      const normalized = normalizeAnswer(value);
      const isValid = ['A', 'B', 'C', 'D', 'E'].includes(normalized) || normalized === '';
      
      if (!isValid && normalized !== '') {
        correctInput.classList.add('invalid-argomento');
        correctInput.title = '⚠️ Solo A, B, C, D, E';
      } else {
        correctInput.classList.remove('invalid-argomento');
        correctInput.title = 'Risposta corretta (A-E)';
      }
      
      return isValid || normalized === '';
    };
    
    correctInput.addEventListener('input', (e) => {
      const normalized = normalizeAnswer(e.target.value);
      e.target.value = normalized;
      
      if (validateAnswer(normalized)) {
        this.updateCell(rowIndex, 'correct_answer', normalized);
        
        if (normalized && ['A', 'B', 'C', 'D', 'E'].includes(normalized)) {
          const allAnswers = ['A', 'B', 'C', 'D', 'E'];
          const wrongAnswers = allAnswers.filter(a => a !== normalized);
          this.updateCell(rowIndex, 'wrong_answers', `{${wrongAnswers.join(',')}}`);
        }
      }
    });
    
    tdCorrect.appendChild(correctInput);
    tr.appendChild(tdCorrect);
    
    // Opzioni A-E con testo e immagini (senza paste handler individuale)
    ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
      // Testo opzione
      const tdOption = document.createElement('td');
      tdOption.className = 'option-cell';
      
      const optionGroup = document.createElement('div');
      optionGroup.className = 'option-group';
      
      const optionLabel = document.createElement('div');
      optionLabel.className = 'option-label';
      optionLabel.textContent = `Opzione ${letter.toUpperCase()}:`;
      
      const optionTextarea = document.createElement('textarea');
      optionTextarea.className = 'option-textarea';
      optionTextarea.placeholder = `Testo opzione ${letter.toUpperCase()}... Usa $...$ per LaTeX`;
      optionTextarea.value = rowData[`option_${letter}`] || '';
      
      const optionPreview = document.createElement('div');
      optionPreview.className = 'latex-preview';
      optionPreview.id = `option-${letter}-preview-${rowIndex}`;
      
      optionTextarea.addEventListener('input', (e) => {
        this.updateCell(rowIndex, `option_${letter}`, e.target.value);
        this.renderLaTeX(e.target.value, `option-${letter}-preview-${rowIndex}`);
      });
      
      optionGroup.appendChild(optionLabel);
      optionGroup.appendChild(optionTextarea);
      optionGroup.appendChild(optionPreview);
      tdOption.appendChild(optionGroup);
      tr.appendChild(tdOption);
      
      // Immagine opzione
      this.createImageCell(tr, rowIndex, `image_option_${letter}`, letter.toUpperCase());
    });
    
    // Argomento - MODIFICATO PER GESTIRE ASSESSMENT INIZIALE E GMAT
    const tdArgomento = document.createElement('td');

    if (isGMAT) {
      // For GMAT, argomento = GMAT_section (readonly, auto-populated)
      const argomentoInput = document.createElement('input');
      argomentoInput.type = 'text';
      argomentoInput.value = rowData.GMAT_section || '';
      argomentoInput.className = 'cell-readonly';
      argomentoInput.readOnly = true;
      argomentoInput.id = `argomento-${rowIndex}`;
      tdArgomento.appendChild(argomentoInput);
    } else if (rowData.Materia === 'Simulazioni') {
      const argomentoInput = document.createElement('input');
      argomentoInput.type = 'text';
      argomentoInput.placeholder = 'Clicca o inizia a digitare...';
      argomentoInput.value = rowData.argomento || '';
      argomentoInput.setAttribute('list', `argomento-list-${rowIndex}`);
      
      const datalist = document.createElement('datalist');
      datalist.id = `argomento-list-${rowIndex}`;
      
      const validArgomenti = [
        'Algebra',
        'Logaritmi ed esponenziali',
        'Probabilità, combinatoria e statistica',
        'Goniometria e trigonometria',
        'Geometria',
        'Funzioni',
        'Pensiero critico',
        'Ragionamento numerico'
      ];
      
      validArgomenti.forEach(arg => {
        const option = document.createElement('option');
        option.value = arg;
        datalist.appendChild(option);
      });
      
      const validateArgomento = (value) => {
        const isValid = validArgomenti.includes(value.trim()) || value.trim() === '';
        if (!isValid && value.trim() !== '') {
          argomentoInput.classList.add('invalid-argomento');
          argomentoInput.title = '⚠️ Valore non valido! Opzioni: ' + validArgomenti.join(', ');
        } else {
          argomentoInput.classList.remove('invalid-argomento');
          argomentoInput.title = 'Clicca per opzioni';
        }
        return isValid || value.trim() === '';
      };
      
      argomentoInput.addEventListener('input', (e) => {
        validateArgomento(e.target.value);
        this.updateCell(rowIndex, 'argomento', e.target.value.trim());
      });
      
      argomentoInput.addEventListener('focus', (e) => {
        e.target.setAttribute('data-current-value', e.target.value);
        e.target.value = '';
      });
      
      argomentoInput.addEventListener('dblclick', (e) => {
        e.target.setAttribute('data-current-value', e.target.value);
        e.target.value = '';
      });
      
      argomentoInput.addEventListener('blur', (e) => {
        if (!e.target.value && e.target.getAttribute('data-current-value')) {
          e.target.value = e.target.getAttribute('data-current-value');
        }
        const normalized = this.normalizeArgomento(e.target.value);
        e.target.value = normalized;
        validateArgomento(normalized);
        this.updateCell(rowIndex, 'argomento', normalized);
        e.target.removeAttribute('data-current-value');
      });
      
      validateArgomento(argomentoInput.value);
      
      tdArgomento.appendChild(argomentoInput);
      tdArgomento.appendChild(datalist);
    } else if (rowData.Materia === 'Assessment Iniziale') {
      // NUOVO: Per Assessment Iniziale - campo readonly con valore "Assessment Iniziale"
      const argomentoInput = document.createElement('input');
      argomentoInput.type = 'text';
      argomentoInput.value = 'Assessment Iniziale';
      argomentoInput.className = 'cell-readonly';
      argomentoInput.readOnly = true;
      tdArgomento.appendChild(argomentoInput);
      // Aggiorna automaticamente il valore nel data
      this.updateCell(rowIndex, 'argomento', 'Assessment Iniziale');
    } else {
      // Per altre macro-sezioni: segue la logica originale
      const argomentoInput = document.createElement('input');
      argomentoInput.type = 'text';
      argomentoInput.placeholder = 'es. Genetica mendeliana';
      argomentoInput.value = rowData.argomento || '';
      argomentoInput.addEventListener('change', (e) => {
        this.updateCell(rowIndex, 'argomento', e.target.value);
      });
      tdArgomento.appendChild(argomentoInput);
    }
    
    tr.appendChild(tdArgomento);
    
    // Render LaTeX iniziale se presente
    if (rowData.question_text) {
      this.renderLaTeX(rowData.question_text, `question-preview-${rowIndex}`);
    }
    
    ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
      if (rowData[`option_${letter}`]) {
        this.renderLaTeX(rowData[`option_${letter}`], `option-${letter}-preview-${rowIndex}`);
      }
    });
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

  createImageCell(tr, rowIndex, field, label) {
    const td = document.createElement('td');
    td.className = 'image-upload-cell';
    
    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = `📷 ${label}`;
    uploadBtn.className = 'image-upload-btn';
    if (this.tableData[rowIndex] && this.tableData[rowIndex][field]) {
      uploadBtn.classList.add('uploaded');
      uploadBtn.textContent = `✓ ${label}`;
    }
    
    uploadBtn.onclick = () => this.uploadImage(rowIndex, field, label, uploadBtn);
    
    td.appendChild(uploadBtn);
    tr.appendChild(td);
  }

  async uploadImage(rowIndex, field, label, button) {
    if (!supabaseBD && !initSupabaseBD()) {
      alert('Errore: Supabase non disponibile. Ricarica la pagina.');
      return;
    }
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('L\'immagine è troppo grande. Dimensione massima: 5MB');
        return;
      }
      
      button.textContent = `⏳ ${label}`;
      
      try {
        const timestamp = new Date().getTime();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `bancadati/${this.commonData.tipologia_test}_${this.commonData.section}_${this.commonData.progressivo}_${field}_${timestamp}_${safeFileName}`.replace(/\s+/g, '_');
        
        const { data: uploadData, error: uploadError } = await supabaseBD
          .storage
          .from('tolc_i')
          .upload(filePath, file);
        
        if (uploadError) {
          button.textContent = `❌ ${label}`;
          console.error('Errore upload immagine:', uploadError);
          alert(`Errore nel caricamento: ${uploadError.message}`);
          return;
        }
        
        const { data } = supabaseBD
          .storage
          .from('tolc_i')
          .getPublicUrl(filePath);
        
        if (!data || !data.publicUrl) {
          button.textContent = `❌ ${label}`;
          alert('Errore nella generazione dell\'URL');
          return;
        }
        
        const publicUrl = data.publicUrl;
        console.log(`Immagine ${field} caricata:`, publicUrl);
        
        this.updateCell(rowIndex, field, publicUrl);
        
        button.textContent = `✓ ${label}`;
        button.classList.add('uploaded');
        button.title = 'Clicca per sostituire';
        
      } catch (error) {
        console.error('Errore durante il caricamento:', error);
        button.textContent = `❌ ${label}`;
        alert('Errore durante il caricamento. Riprova.');
      }
    };
    
    fileInput.click();
  }

  renderLaTeX(text, previewId) {
    const previewElement = document.getElementById(previewId);
    if (!previewElement) return;
    
    previewElement.innerHTML = text || '<span style="color: #999;">Preview LaTeX...</span>';
    
    if (window.MathJax && text) {
      window.MathJax.typesetPromise([previewElement]).catch((e) => {
        console.error('Errore rendering LaTeX:', e);
      });
    }
  }

  renderAllLaTeX() {
    this.tableData.forEach((row, index) => {
      if (row.question_text) {
        this.renderLaTeX(row.question_text, `question-preview-${index}`);
      }
      
      ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
        if (row[`option_${letter}`]) {
          this.renderLaTeX(row[`option_${letter}`], `option-${letter}-preview-${index}`);
        }
      });
    });
  }

  updateCell(rowIndex, field, value) {
    if (!this.tableData[rowIndex]) return;
    this.tableData[rowIndex][field] = value;
  }

  updateStatus() {
    document.getElementById('bdRowCount').textContent = `${this.tableData.length} righe`;
  }

  clearAll() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      this.tableData = [];
      document.getElementById('excelBDTableBody').innerHTML = '';
      
      if (this.commonData?.num_domande) {
        for (let i = 0; i < this.commonData.num_domande; i++) {
          this.addRow();
        }
      }
      
      this.setupKeyboardNavigation();
      this.updateStatus();
    }
  }

  close() {
    if (this.tableData.length > 0 && !confirm('Sei sicuro di voler chiudere? I dati non salvati andranno persi.')) {
      return;
    }
    this.overlay.style.display = 'none';
  }

  validate() {
    const errors = [];
    
    const validArgomenti = [
      'Algebra',
      'Logaritmi ed esponenziali',
      'Probabilità, combinatoria e statistica',
      'Goniometria e trigonometria',
      'Geometria',
      'Funzioni',
      'Pensiero critico',
      'Ragionamento numerico'
    ];
    
    const validRisposte = ['A', 'B', 'C', 'D', 'E'];
    
    this.tableData.forEach((row, index) => {
      // Valida testo domanda
      if (!row.question_text || !row.question_text.trim()) {
        errors.push(`Riga ${index + 1}: Manca il testo della domanda`);
      }
      
      // Valida risposta corretta
      if (!row.correct_answer) {
        errors.push(`Riga ${index + 1}: Manca la risposta corretta`);
      } else if (!validRisposte.includes(row.correct_answer)) {
        errors.push(`Riga ${index + 1}: Risposta "${row.correct_answer}" non valida (deve essere A, B, C, D o E)`);
      }
      
      // Valida opzioni
      ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
        if (!row[`option_${letter}`] || !row[`option_${letter}`].trim()) {
          errors.push(`Riga ${index + 1}: Manca il testo dell'opzione ${letter.toUpperCase()}`);
        }
      });
      
           
      // Per Simulazioni verifica che l'argomento sia valido
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
    if (!supabaseBD && !initSupabaseBD()) {
      alert('Errore: Supabase non disponibile. Ricarica la pagina.');
      return;
    }
    
    const errors = this.validate();
    
    if (errors.length > 0) {
      alert('❌ Errori trovati - Impossibile salvare:\n\n' + errors.join('\n') + '\n\nCorreggi gli errori e riprova.');
      return;
    }
    
    if (!confirm('Confermi il salvataggio di tutte le domande?')) {
      return;
    }
    
    try {
      const statusDiv = document.getElementById('uploadMessage') || document.createElement('div');
      statusDiv.innerHTML = '<p style="color: #1976d2;">⏳ Salvataggio in corso...<span class="excel-bd-loading"></span></p>';
      
      const dataToSave = this.tableData.map(row => {
        const cleanRow = {};
        
        this.columns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            if (col === 'is_open_ended') {
              cleanRow[col] = Boolean(row[col]);
            } else if (col === 'question_number' || col === 'progressivo') {
              cleanRow[col] = parseInt(row[col]) || 0;
            } else if (col === 'wrong_answers' && typeof row[col] === 'string' && row[col].startsWith('{')) {
              cleanRow[col] = row[col];
            } else {
              cleanRow[col] = row[col];
            }
          }
        });
        
        return cleanRow;
      });
      
      console.log('Dati pronti per il salvataggio:', dataToSave);
      
     const { data, error } = await supabaseBD
  .from('questions_bancaDati')
  .upsert(dataToSave, {
    onConflict: 'tipologia_test,Materia,section,tipologia_esercizi,progressivo,question_number,argomento'
  });
      
      if (error) {
        console.error('Errore Supabase:', error);
        alert(`❌ Errore durante il salvataggio:\n${error.message}\n\nDettagli: ${error.details || 'Nessun dettaglio disponibile'}`);
        return;
      }
      
      alert(`✅ Test Banca Dati salvato con successo!\n\n` +
        `Test: ${this.commonData.tipologia_test}\n` +
        `Materia: ${this.commonData.Materia}\n` +
        `Test: ${this.commonData.section}: ${this.commonData.tipologia_esercizi} ${this.commonData.progressivo}\n` +
        `Domande salvate: ${dataToSave.length}`);
      
      this.overlay.style.display = 'none';

      setTimeout(() => {
        window.location.reload();
      }, 1000);

      // Clear draft after successful save
      this.clearDraft();

    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      alert(`❌ Errore durante il salvataggio:\n${error.message || 'Errore sconosciuto'}`);
    }
  }

  // Save draft to localStorage
  saveDraft() {
    const draft = {
      commonData: this.commonData,
      tableData: this.tableData,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('bancaDati_draft', JSON.stringify(draft));

    this.showCustomAlert({
      title: '📝 Draft Saved!',
      message: `<strong>Test:</strong> ${this.commonData.tipologia_test}<br>
                <strong>Subject:</strong> ${this.commonData.Materia}<br>
                <strong>Section:</strong> ${this.commonData.section}: ${this.commonData.tipologia_esercizi} ${this.commonData.progressivo}<br>
                <strong>Questions:</strong> ${this.tableData.length}<br><br>
                You can close and resume later.`,
      type: 'success'
    });
  }

  // Load draft from localStorage
  loadDraft() {
    const draftStr = localStorage.getItem('bancaDati_draft');
    if (!draftStr) return null;

    try {
      return JSON.parse(draftStr);
    } catch (error) {
      return null;
    }
  }

  // Check for existing draft and offer to restore
  async checkForDraft() {
    const draft = this.loadDraft();
    if (!draft) return false;

    const timestamp = new Date(draft.timestamp);
    const timeAgo = this.getTimeAgo(timestamp);

    const action = await this.showDraftOptions({
      title: '📝 Draft Found!',
      message: `<strong>Test:</strong> ${draft.commonData.tipologia_test}<br>
                <strong>Subject:</strong> ${draft.commonData.Materia}<br>
                <strong>Section:</strong> ${draft.commonData.section}: ${draft.commonData.tipologia_esercizi} ${draft.commonData.progressivo}<br>
                <strong>Questions:</strong> ${draft.tableData.length}<br>
                <strong>Saved:</strong> ${timeAgo}`
    });

    if (action === 'resume') {
      this.commonData = draft.commonData;
      this.tableData = draft.tableData;
      return true;
    } else if (action === 'delete') {
      this.clearDraft();
      return false;
    } else {
      // close - do nothing
      return false;
    }
  }

  // Clear draft from localStorage
  clearDraft() {
    localStorage.removeItem('bancaDati_draft');
  }

  // Helper to format time ago
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'a few seconds ago';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  // Custom alert modal
  showCustomAlert({ title, message, type = 'info' }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        backdrop-filter: blur(4px);
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
      `;

      const colors = {
        success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
        warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
        danger: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
        info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
      };

      const color = colors[type];

      modal.innerHTML = `
        <style>
          @keyframes slideIn {
            from {
              transform: translateY(-50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        </style>
        <div style="background: ${color.bg}; border-left: 5px solid ${color.border}; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: ${color.text}; font-size: 1.3rem;">${title}</h3>
          <div style="color: ${color.text}; line-height: 1.6;">${message}</div>
        </div>
        <div style="text-align: right;">
          <button id="customAlertOk" style="
            background: ${color.border};
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
          ">OK</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const okBtn = document.getElementById('customAlertOk');
      okBtn.addEventListener('mouseenter', () => {
        okBtn.style.transform = 'scale(1.05)';
        okBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      });
      okBtn.addEventListener('mouseleave', () => {
        okBtn.style.transform = 'scale(1)';
        okBtn.style.boxShadow = 'none';
      });

      okBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve();
      };
    });
  }

  // Draft options modal (3 buttons: resume, delete, close)
  showDraftOptions({ title, message }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 2rem;
        max-width: 550px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.3s ease-out;
        border: 3px solid #ffc107;
      `;

      const infoBox = document.createElement('div');
      infoBox.style.cssText = 'background: #fff3cd; border-left: 5px solid #ffc107; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;';
      infoBox.innerHTML = `
        <h3 style="margin: 0 0 0.5rem 0; color: #856404; font-size: 1.4rem;">${title}</h3>
        <div style="color: #856404; line-height: 1.8; font-size: 1rem;">${message}</div>
      `;

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';

      const resumeBtn = document.createElement('button');
      resumeBtn.textContent = '✅ Continue Working on Draft';
      resumeBtn.style.cssText = `
        background: #28a745;
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      `;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️ Delete Draft';
      deleteBtn.style.cssText = `
        background: #dc3545;
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.textContent = '❌ Close (Keep Draft)';
      closeBtn.style.cssText = `
        background: #6c757d;
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      `;

      buttonContainer.appendChild(resumeBtn);
      buttonContainer.appendChild(deleteBtn);
      buttonContainer.appendChild(closeBtn);

      modal.appendChild(infoBox);
      modal.appendChild(buttonContainer);

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Add hover effects and click handlers
      [resumeBtn, deleteBtn, closeBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'scale(1.03)';
          btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'scale(1)';
          btn.style.boxShadow = 'none';
        });
      });

      resumeBtn.addEventListener('click', () => {
        try {
          document.body.removeChild(overlay);
        } catch (e) {}
        resolve('resume');
      });

      deleteBtn.addEventListener('click', () => {
        try {
          document.body.removeChild(overlay);
        } catch (e) {}
        // Hide draft indicator
        const draftIndicator = document.getElementById('draftIndicator');
        if (draftIndicator) {
          draftIndicator.style.display = 'none';
        }
        resolve('delete');
      });

      closeBtn.addEventListener('click', () => {
        try {
          document.body.removeChild(overlay);
        } catch (e) {}
        // Hide draft indicator
        const draftIndicator = document.getElementById('draftIndicator');
        if (draftIndicator) {
          draftIndicator.style.display = 'none';
        }
        resolve('close');
      });

      // Close on escape key
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay);
          document.removeEventListener('keydown', escapeHandler);
          resolve('close');
        }
      };
      document.addEventListener('keydown', escapeHandler);
    });
  }

  // Custom confirm modal
  showCustomConfirm({ title, message, confirmText, cancelText, type = 'warning' }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        backdrop-filter: blur(4px);
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
      `;

      const colors = {
        success: { bg: '#d4edda', border: '#28a745', text: '#155724', confirmBg: '#28a745' },
        warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404', confirmBg: '#ffc107' },
        danger: { bg: '#f8d7da', border: '#dc3545', text: '#721c24', confirmBg: '#dc3545' },
        info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460', confirmBg: '#17a2b8' }
      };

      const color = colors[type];

      modal.innerHTML = `
        <style>
          @keyframes slideIn {
            from {
              transform: translateY(-50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        </style>
        <div style="background: ${color.bg}; border-left: 5px solid ${color.border}; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: ${color.text}; font-size: 1.3rem;">${title}</h3>
          <div style="color: ${color.text}; line-height: 1.6;">${message}</div>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button id="customConfirmCancel" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
          ">${cancelText}</button>
          <button id="customConfirmOk" style="
            background: ${color.confirmBg};
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
          ">${confirmText}</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const okBtn = document.getElementById('customConfirmOk');
      const cancelBtn = document.getElementById('customConfirmCancel');

      [okBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'scale(1.05)';
          btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'scale(1)';
          btn.style.boxShadow = 'none';
        });
      });

      okBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve(true);
      };

      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve(false);
      };

      // Close on escape key
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay);
          document.removeEventListener('keydown', escapeHandler);
          resolve(false);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    });
  }
}

// Crea istanza globale
const excelFormBancaDati = new ExcelFormBancaDati();
excelFormBancaDati.init();

// Esponi globalmente
window.excelFormBancaDati = excelFormBancaDati;

// Inizializza Supabase quando la pagina è pronta
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!supabaseBD) {
      initSupabaseBD();
    }
  }, 500);
});