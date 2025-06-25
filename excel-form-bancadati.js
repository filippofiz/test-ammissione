// excel-form-bancadati.js - Form Excel specializzato per Test Banca Dati

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
      'progressivo',
      'criptato',
      'question_number',
      'correct_answer',
      'wrong_answers',
      'is_open_ended',
      'argomento',
      'image_url'
    ];
  }

  init() {
    this.createOverlay();
    this.attachStyles();
  }

  attachStyles() {
    // Evita di aggiungere stili duplicati
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
        max-width: 95%;
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
      }

      .excel-bd-table td {
        padding: 0.25rem;
        border: 1px solid #dee2e6;
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
      }

      .excel-bd-table input[type="checkbox"] {
        width: auto;
        cursor: pointer;
      }

      .excel-bd-table textarea {
        resize: vertical;
        min-height: 50px;
      }

      .excel-bd-table tr:hover {
        background: #f8f9fa;
      }

      .excel-bd-table .row-number {
        background: #e9ecef;
        text-align: center;
        font-weight: 600;
        color: #666;
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

      textarea.cell-readonly {
        resize: none;
      }

      .excel-bd-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #00a666;
      }

      .image-upload-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.75rem;
        border: 1.5px solid #00a666;
        border-radius: 4px;
        background: white;
        color: #00a666;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .image-upload-btn:hover {
        background: #00a666;
        color: white;
      }

      .image-upload-status {
        font-size: 0.75rem;
        color: #666;
      }

      .image-upload-status.uploaded {
        color: #00a666;
        font-weight: 600;
      }

      .bd-info-section {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem;
        text-align: center;
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
      <h3>🏦 Editor Domande Test Banca Dati</h3>
      <div class="excel-bd-controls">
        <button class="excel-bd-btn secondary" onclick="excelFormBancaDati.addRow()">➕ Aggiungi Riga</button>
        <button class="excel-bd-btn primary" onclick="excelFormBancaDati.save()">💾 Salva Tutto</button>
        <button class="excel-bd-btn danger" onclick="excelFormBancaDati.close()">✖ Chiudi</button>
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
        <button class="excel-bd-btn secondary" onclick="excelFormBancaDati.uploadAllImages()">📷 Carica Tutte le Immagini</button>
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
            <option value="MEDICINA BANCA DATI">MEDICINA BANCA DATI</option>
            <option value="PROFESSIONI SANITARIE BD">PROFESSIONI SANITARIE BD</option>
            <option value="VETERINARIA BD">VETERINARIA BD</option>
            <option value="ARCHITETTURA BD">ARCHITETTURA BD</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Materia:*</label>
          <input type="text" id="configBDMateria" placeholder="es. Biologia" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Sezione:*</label>
          <input type="text" id="configBDSection" placeholder="es. Genetica" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Tipologia Esercizi:*</label>
          <input type="text" id="configBDTipologiaEsercizi" placeholder="es. Quiz" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Progressivo:*</label>
          <input type="number" id="configBDProgressivo" value="1" min="1" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Numero di domande:*</label>
          <input type="number" id="configBDNumDomande" value="10" min="1" max="200" style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px;">
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="excel-bd-btn secondary" onclick="document.body.removeChild(this.closest('.excel-bd-overlay'))">Annulla</button>
          <button class="excel-bd-btn primary" onclick="excelFormBancaDati.startWithConfig(this.closest('.excel-bd-overlay'))">Continua</button>
        </div>
      </div>
    `;
    
    configModal.appendChild(configContainer);
    document.body.appendChild(configModal);
  }

  startWithConfig(configModal) {
    const tipologiaTest = document.getElementById('configBDTipologiaTest').value;
    const materia = document.getElementById('configBDMateria').value;
    const section = document.getElementById('configBDSection').value;
    const tipologiaEsercizi = document.getElementById('configBDTipologiaEsercizi').value;
    const progressivo = parseInt(document.getElementById('configBDProgressivo').value);
    const numDomande = parseInt(document.getElementById('configBDNumDomande').value);
    
    // Validazioni
    if (!tipologiaTest || !materia || !section || !tipologiaEsercizi) {
      alert('Compila tutti i campi obbligatori!');
      return;
    }
    
    if (!numDomande || numDomande < 1) {
      alert('Inserisci un numero valido di domande!');
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
      `${tipologiaTest} | ${section} | ${tipologiaEsercizi} ${progressivo}`;
    
    // Mostra info
    this.showInfoSection();
    
    // Aggiungi le righe
    for (let i = 0; i < numDomande; i++) {
      this.addRow();
    }
  }

  showInfoSection() {
    const tableWrapper = this.container.querySelector('.excel-bd-table-wrapper');
    
    const infoSection = document.createElement('div');
    infoSection.className = 'bd-info-section';
    infoSection.innerHTML = `
      <h4>📷 Test Banca Dati</h4>
      <p>Ogni domanda richiede una propria immagine. Puoi caricarle singolarmente o tutte insieme.</p>
    `;
    
    tableWrapper.insertBefore(infoSection, tableWrapper.firstChild);
  }

  buildTable() {
    const table = document.getElementById('excelBDTable');
    table.innerHTML = '';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const th = document.createElement('th');
    th.textContent = '#';
    headerRow.appendChild(th);
    
    // Colonne da mostrare (esclude criptato)
    const visibleColumns = [
      'tipologia_test',
      'Materia', 
      'section',
      'tipologia_esercizi',
      'progressivo',
      'question_number',
      'correct_answer',
      'wrong_answers',
      'argomento',
      'image_url'
    ];
    
    visibleColumns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = this.formatColumnName(col);
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    tbody.id = 'excelBDTableBody';
    table.appendChild(tbody);
  }

  formatColumnName(col) {
    const translations = {
      'tipologia_test': 'Tipologia Test',
      'Materia': 'Materia',
      'section': 'Sezione',
      'tipologia_esercizi': 'Tipologia Esercizi',
      'progressivo': 'Progressivo',
      'question_number': 'N° Domanda',
      'correct_answer': 'Risposta Corretta',
      'wrong_answers': 'Risposte Errate',
      'argomento': 'Argomento',
      'image_url': 'Immagine'
    };
    
    return translations[col] || col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  addRow() {
    const tbody = document.getElementById('excelBDTableBody');
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
      criptato: false,
      question_number: rowIndex + 1,
      correct_answer: '',
      wrong_answers: '',
      is_open_ended: false,
      argomento: '',
      image_url: ''
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
    
    // Materia - readonly
    this.createReadonlyCell(tr, rowData.Materia);
    
    // Sezione - readonly
    this.createReadonlyCell(tr, rowData.section);
    
    // Tipologia Esercizi - readonly
    this.createReadonlyCell(tr, rowData.tipologia_esercizi);
    
    // Progressivo - readonly
    this.createReadonlyCell(tr, rowData.progressivo);
    
    // N° Domanda - readonly
    this.createReadonlyCell(tr, rowData.question_number);
    
    // Risposta Corretta
    const tdCorrect = document.createElement('td');
    const correctInput = document.createElement('input');
    correctInput.type = 'text';
    correctInput.placeholder = 'A-E';
    correctInput.style.textTransform = 'uppercase';
    correctInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      const value = e.target.value.trim();
      this.updateCell(rowIndex, 'correct_answer', value);
      
      // Auto-compila wrong_answers
      if (value && ['A', 'B', 'C', 'D', 'E'].includes(value)) {
        const wrongAnswersCell = tr.cells[tr.cells.length - 3].querySelector('textarea');
        if (wrongAnswersCell) {
          const allAnswers = ['A', 'B', 'C', 'D', 'E'];
          const wrongAnswers = allAnswers.filter(a => a !== value);
          wrongAnswersCell.value = JSON.stringify(wrongAnswers);
          this.updateCell(rowIndex, 'wrong_answers', wrongAnswersCell.value);
        }
      }
    });
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
    
    // Argomento
    const tdArgomento = document.createElement('td');
    const argomentoInput = document.createElement('input');
    argomentoInput.type = 'text';
    argomentoInput.placeholder = 'es. Genetica mendeliana';
    argomentoInput.addEventListener('change', (e) => {
      this.updateCell(rowIndex, 'argomento', e.target.value);
    });
    tdArgomento.appendChild(argomentoInput);
    tr.appendChild(tdArgomento);
    
    // Immagine - pulsante upload
    const tdImage = document.createElement('td');
    const imageContainer = document.createElement('div');
    imageContainer.style.display = 'flex';
    imageContainer.style.alignItems = 'center';
    imageContainer.style.gap = '0.5rem';
    
    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = '📷 Carica';
    uploadBtn.className = 'image-upload-btn';
    uploadBtn.onclick = () => this.uploadImage(rowIndex);
    
    const statusSpan = document.createElement('span');
    statusSpan.id = `bdImageStatus-${rowIndex}`;
    statusSpan.className = 'image-upload-status';
    
    imageContainer.appendChild(uploadBtn);
    imageContainer.appendChild(statusSpan);
    tdImage.appendChild(imageContainer);
    tr.appendChild(tdImage);
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
    
    if (field === 'wrong_answers') {
      try {
        if (value.trim()) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            this.tableData[rowIndex][field] = `{${parsed.join(',')}}`;
          }
        } else {
          this.tableData[rowIndex][field] = '';
        }
      } catch (e) {
        console.error('Formato JSON non valido');
      }
    } else {
      this.tableData[rowIndex][field] = value;
    }
  }

  updateStatus() {
    document.getElementById('bdRowCount').textContent = `${this.tableData.length} righe`;
  }

  clearAll() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      this.tableData = [];
      document.getElementById('excelBDTableBody').innerHTML = '';
      
      // Ricrea le righe originali
      if (this.commonData?.num_domande) {
        for (let i = 0; i < this.commonData.num_domande; i++) {
          this.addRow();
        }
      }
      this.updateStatus();
    }
  }

  async uploadImage(rowIndex) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // TODO: Implementare upload su Supabase
      console.log(`Immagine selezionata per domanda ${rowIndex + 1}:`, file.name);
      
      // Simulazione upload
      const statusSpan = document.getElementById(`bdImageStatus-${rowIndex}`);
      if (statusSpan) {
        statusSpan.textContent = '✓ Caricata';
        statusSpan.classList.add('uploaded');
      }
      
      // Salva URL simulato
      this.tableData[rowIndex].image_url = 'https://example.com/images/q' + (rowIndex + 1) + '_' + file.name;
    };
    
    fileInput.click();
  }

  async uploadAllImages() {
    alert('Funzione per caricare multiple immagini in sviluppo...');
    // TODO: Implementare upload multiplo
  }

  close() {
    if (this.tableData.length > 0 && !confirm('Sei sicuro di voler chiudere? I dati non salvati andranno persi.')) {
      return;
    }
    this.overlay.style.display = 'none';
  }

  validate() {
    const errors = [];
    
    this.tableData.forEach((row, index) => {
      if (!row.correct_answer) {
        errors.push(`Riga ${index + 1}: Manca la risposta corretta`);
      }
      if (!row.argomento) {
        errors.push(`Riga ${index + 1}: Manca l'argomento`);
      }
      if (!row.image_url) {
        errors.push(`Riga ${index + 1}: Manca l'immagine`);
      }
    });
    
    return errors;
  }

  async save() {
    const errors = this.validate();
    
    if (errors.length > 0) {
      alert('Errori trovati:\n\n' + errors.join('\n'));
      return;
    }
    
    if (!confirm('Confermi il salvataggio di tutte le domande?')) {
      return;
    }
    
    // TODO: Implementare salvataggio su Supabase
    console.log('Dati da salvare:', this.tableData);
    alert('Test Banca Dati pronto per il salvataggio! (Implementare connessione Supabase)');
  }
}

// Crea istanza globale
const excelFormBancaDati = new ExcelFormBancaDati();
excelFormBancaDati.init();

// Esponi globalmente
window.excelFormBancaDati = excelFormBancaDati;