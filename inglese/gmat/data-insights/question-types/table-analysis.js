// Table Analysis Question Creator
// TA questions have a sortable data table with True/False statements

window.DITableAnalysis = {
  open(moduleInstance, existingData = null) {
    this.moduleInstance = moduleInstance;
    this.existingData = existingData || {
      table_title: '',
      column_headers: ['Column 1', 'Column 2', 'Column 3'],
      table_data: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ],
      statement_column_title: '',
      answer_col1_title: 'True',
      answer_col2_title: 'False',
      statements: [
        { text: '', is_true: true },
        { text: '', is_true: true },
        { text: '', is_true: true }
      ]
    };
    this.createModal();
  },

  createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'di-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 1200px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    const isEdit = this.existingData.table_title !== '';

    modal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
        <div style="font-size: 2.5rem;">📊</div>
        <div>
          <h2 style="margin: 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
            ${isEdit ? 'Edit' : 'Create'} Table Analysis Question
          </h2>
          <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">
            Question #${this.moduleInstance.currentRowIndex + 1}
          </p>
        </div>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #06b6d4; padding: 1rem; margin-bottom: 2rem; border-radius: 6px;">
        <p style="margin: 0; color: #0e7490; font-size: 0.9rem; line-height: 1.5;">
          📊 <strong>Table Analysis:</strong> Create a sortable data table with exactly 3 True/False statements.
          All 3 statements must be answered correctly.
        </p>
      </div>

      <div id="ai-generator-container"></div>

      <!-- Table Title -->
      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Table Title:*</label>
        <input type="text" id="ta-title" value="${this.existingData.table_title}"
               style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
               placeholder="e.g., Annual Sales Data by Region">
      </div>

      <!-- Editable Table -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label style="font-weight: 600; color: #374151;">Data Table (sortable):*</label>
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" id="ta-add-column-btn"
                    style="padding: 0.5rem 0.75rem; background: #06b6d4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
              ➕ Column
            </button>
            <button type="button" id="ta-add-row-btn"
                    style="padding: 0.5rem 0.75rem; background: #06b6d4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
              ➕ Row
            </button>
          </div>
        </div>
        <div id="ta-table-container" style="border: 2px solid #d1d5db; border-radius: 8px; overflow: auto;"></div>
      </div>

      <!-- Answer Configuration -->
      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Answer Table Column Titles:*</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.25rem; font-size: 0.85rem; color: #6b7280;">Statement Column</label>
            <input type="text" id="ta-statement-title" value="${this.existingData.statement_column_title}"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                   placeholder="e.g., Statement">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.25rem; font-size: 0.85rem; color: #6b7280;">Column 1 (True/Yes)</label>
            <input type="text" id="ta-col1-title" value="${this.existingData.answer_col1_title}"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                   placeholder="e.g., True, Yes">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.25rem; font-size: 0.85rem; color: #6b7280;">Column 2 (False/No)</label>
            <input type="text" id="ta-col2-title" value="${this.existingData.answer_col2_title}"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                   placeholder="e.g., False, No">
          </div>
        </div>
      </div>

      <!-- 3 True/False Statements -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <label style="font-weight: 600; color: #374151;">Statements (enter text, then render table):*</label>
          <button type="button" id="ta-render-answers-btn"
                  style="padding: 0.5rem 1rem; background: #06b6d4; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            📊 Render Answer Table
          </button>
        </div>
        <div id="ta-statements-input-container"></div>
        <div id="ta-answers-table-container" style="margin-top: 1rem;"></div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: space-between; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
        <button id="ta-delete-btn" style="padding: 0.75rem 1.5rem; border: 2px solid #dc2626; border-radius: 8px; background: white; color: #dc2626; font-weight: 600; cursor: pointer; ${isEdit ? '' : 'display: none;'}">
          🗑️ Delete Question
        </button>
        <div style="display: flex; gap: 1rem;">
          <button id="ta-cancel-btn" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #374151; font-weight: 600; cursor: pointer;">
            Cancel
          </button>
          <button id="ta-save-btn" style="padding: 0.75rem 2rem; border: none; border-radius: 8px; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; font-weight: 600; cursor: pointer;">
            💾 Save Question
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add AI Generator button
    if (window.AIQuestionGenerator) {
      const aiContainer = document.getElementById('ai-generator-container');
      const generateBtn = window.AIQuestionGenerator.createGenerateButton('TA', (generatedData) => {
        this.populateFormWithAIData(generatedData);
      });
      aiContainer.appendChild(generateBtn);
    }

    // Initialize
    this.renderTable();
    this.renderStatementInputs();

    // Event Listeners
    document.getElementById('ta-add-column-btn').addEventListener('click', () => this.addColumn());
    document.getElementById('ta-add-row-btn').addEventListener('click', () => this.addRow());
    document.getElementById('ta-render-answers-btn').addEventListener('click', () => this.renderAnswersTable());
    document.getElementById('ta-save-btn').addEventListener('click', () => this.saveQuestion(overlay));
    document.getElementById('ta-cancel-btn').addEventListener('click', () => document.body.removeChild(overlay));

    if (isEdit) {
      document.getElementById('ta-delete-btn').addEventListener('click', () => this.deleteQuestion(overlay));
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
  },

  renderTable() {
    const container = document.getElementById('ta-table-container');
    if (!container) return;

    const headers = this.existingData.column_headers;
    const data = this.existingData.table_data;

    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6;">
            ${headers.map((header, idx) => `
              <th style="padding: 0.75rem; border-right: 1px solid #d1d5db; position: relative;">
                <input type="text" class="ta-header-input" data-col="${idx}" value="${header}"
                       style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-weight: 600;"
                       placeholder="Column ${idx + 1}">
                ${headers.length > 1 ? `
                  <button onclick="window.DITableAnalysis.removeColumn(${idx})"
                          style="position: absolute; top: 0.25rem; right: 0.25rem; background: #dc2626; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.7rem;">
                    ✕
                  </button>
                ` : ''}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map((row, rowIdx) => `
            <tr style="border-top: 1px solid #e5e7eb;">
              ${row.map((cell, colIdx) => `
                <td style="padding: 0.5rem; border-right: 1px solid #e5e7eb; position: relative;">
                  <input type="text" class="ta-cell-input" data-row="${rowIdx}" data-col="${colIdx}" value="${cell}"
                         style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;"
                         placeholder="Data">
                  ${colIdx === row.length - 1 && data.length > 1 ? `
                    <button onclick="window.DITableAnalysis.removeRow(${rowIdx})"
                            style="position: absolute; top: 0.25rem; right: 0.25rem; background: #dc2626; color: white; border: none; border-radius: 3px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.7rem;">
                      ✕
                    </button>
                  ` : ''}
                </td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = tableHTML;

    // Add change listeners
    document.querySelectorAll('.ta-header-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const col = parseInt(e.target.dataset.col);
        this.existingData.column_headers[col] = e.target.value;
      });
    });

    document.querySelectorAll('.ta-cell-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        this.existingData.table_data[row][col] = e.target.value;
      });
    });
  },

  addColumn() {
    const newColName = `Column ${this.existingData.column_headers.length + 1}`;
    this.existingData.column_headers.push(newColName);
    this.existingData.table_data.forEach(row => row.push(''));
    this.renderTable();
  },

  addRow() {
    const newRow = new Array(this.existingData.column_headers.length).fill('');
    this.existingData.table_data.push(newRow);
    this.renderTable();
  },

  removeColumn(colIdx) {
    if (this.existingData.column_headers.length <= 1) {
      alert('⚠️ At least one column is required!');
      return;
    }
    this.existingData.column_headers.splice(colIdx, 1);
    this.existingData.table_data.forEach(row => row.splice(colIdx, 1));
    this.renderTable();
  },

  removeRow(rowIdx) {
    if (this.existingData.table_data.length <= 1) {
      alert('⚠️ At least one row is required!');
      return;
    }
    this.existingData.table_data.splice(rowIdx, 1);
    this.renderTable();
  },

  populateFormWithAIData(data) {
    // Populate table title
    const titleField = document.getElementById('ta-title');
    if (titleField && data.table_title) {
      titleField.value = data.table_title;
    }

    // Populate column headers
    if (data.column_headers) {
      this.existingData.column_headers = data.column_headers;
    }

    // Populate table data
    if (data.table_data) {
      this.existingData.table_data = data.table_data;
    }

    // Re-render table with new data
    this.renderTable();

    // Populate statement column title
    const statementTitleField = document.getElementById('ta-statement-title');
    if (statementTitleField && data.statement_column_title) {
      statementTitleField.value = data.statement_column_title;
    }

    // Populate answer column titles
    const col1TitleField = document.getElementById('ta-col1-title');
    if (col1TitleField && data.answer_col1_title) {
      col1TitleField.value = data.answer_col1_title;
    }

    const col2TitleField = document.getElementById('ta-col2-title');
    if (col2TitleField && data.answer_col2_title) {
      col2TitleField.value = data.answer_col2_title;
    }

    // Populate statements
    if (data.statements && data.statements.length === 3) {
      this.existingData.statements = data.statements;
      this.renderStatementInputs();
    }
  },

  renderStatementInputs() {
    const container = document.getElementById('ta-statements-input-container');
    if (!container) return;

    // Always exactly 3 statement text inputs
    container.innerHTML = this.existingData.statements.map((stmt, index) => `
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; font-size: 0.9rem;">
          Statement ${index + 1}:*
        </label>
        <textarea class="ta-statement-text" data-index="${index}" rows="2"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit;"
                  placeholder="e.g., The North region had the highest growth percentage.">${stmt.text}</textarea>
      </div>
    `).join('');
  },

  renderAnswersTable() {
    const statementTitleInput = document.getElementById('ta-statement-title');
    const col1TitleInput = document.getElementById('ta-col1-title');
    const col2TitleInput = document.getElementById('ta-col2-title');

    const statementTitle = statementTitleInput?.value || 'Statement';
    const col1Title = col1TitleInput?.value || 'True';
    const col2Title = col2TitleInput?.value || 'False';

    const container = document.getElementById('ta-answers-table-container');

    if (!container) return;

    // Collect statement texts
    const statementTexts = document.querySelectorAll('.ta-statement-text');
    const statements = [];
    statementTexts.forEach((textarea, idx) => {
      const text = textarea.value.trim();
      if (text) {
        statements.push(text);
        if (this.existingData.statements[idx]) {
          this.existingData.statements[idx].text = text;
        }
      }
    });

    if (statements.length !== 3) {
      container.innerHTML = '<p style="color: #ef4444;">⚠️ Please enter all 3 statements</p>';
      return;
    }

    const tableHTML = `
      <div style="border: 2px solid #d1d5db; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 1rem; text-align: left; border-right: 1px solid #d1d5db; font-weight: 600; width: 60%;">${statementTitle}</th>
              <th style="padding: 1rem; text-align: center; border-right: 1px solid #d1d5db; font-weight: 600; width: 20%;">${col1Title}</th>
              <th style="padding: 1rem; text-align: center; font-weight: 600; width: 20%;">${col2Title}</th>
            </tr>
          </thead>
          <tbody>
            ${statements.map((stmt, idx) => `
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 1rem; border-right: 1px solid #e5e7eb;">${stmt}</td>
                <td style="padding: 1rem; text-align: center; border-right: 1px solid #e5e7eb;">
                  <input type="radio" name="stmt-${idx}" value="true"
                         ${this.existingData.statements[idx]?.is_true === true ? 'checked' : ''}
                         onchange="window.DITableAnalysis.updateAnswer(${idx}, true)"
                         style="width: 20px; height: 20px; cursor: pointer;">
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <input type="radio" name="stmt-${idx}" value="false"
                         ${this.existingData.statements[idx]?.is_true === false ? 'checked' : ''}
                         onchange="window.DITableAnalysis.updateAnswer(${idx}, false)"
                         style="width: 20px; height: 20px; cursor: pointer;">
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;
  },

  updateAnswer(index, isTrue) {
    if (this.existingData.statements[index]) {
      this.existingData.statements[index].is_true = isTrue;
    }
  },

  collectStatementData() {
    const statementTexts = document.querySelectorAll('.ta-statement-text');
    statementTexts.forEach((textarea, idx) => {
      if (this.existingData.statements[idx]) {
        this.existingData.statements[idx].text = textarea.value;
      }
    });

    const statementAnswers = document.querySelectorAll('.ta-statement-answer');
    statementAnswers.forEach((select, idx) => {
      if (this.existingData.statements[idx]) {
        this.existingData.statements[idx].is_true = select.value === 'true';
      }
    });
  },

  saveQuestion(overlay) {
    this.collectStatementData();

    // Collect data
    const tableTitle = document.getElementById('ta-title').value.trim();
    const statementColumnTitle = document.getElementById('ta-statement-title').value.trim();
    const answerCol1Title = document.getElementById('ta-col1-title').value.trim();
    const answerCol2Title = document.getElementById('ta-col2-title').value.trim();
    const columnHeaders = this.existingData.column_headers;
    const tableData = this.existingData.table_data;

    // Validation
    if (!tableTitle) {
      alert('⚠️ Table title is required!');
      return;
    }

    if (!statementColumnTitle) {
      alert('⚠️ Statement column title is required!');
      return;
    }

    if (!answerCol1Title) {
      alert('⚠️ Answer column 1 title is required!');
      return;
    }

    if (!answerCol2Title) {
      alert('⚠️ Answer column 2 title is required!');
      return;
    }

    if (columnHeaders.length === 0) {
      alert('⚠️ At least one column is required!');
      return;
    }

    if (tableData.length === 0) {
      alert('⚠️ At least one row of data is required!');
      return;
    }

    // Must have exactly 3 statements
    if (this.existingData.statements.length !== 3) {
      alert('⚠️ Exactly 3 statements are required!');
      return;
    }

    for (let i = 0; i < 3; i++) {
      if (!this.existingData.statements[i].text.trim()) {
        alert(`⚠️ Statement ${i + 1}: Text is required!`);
        return;
      }
    }

    // Generate correct_answer from is_true values
    const correctAnswer = {};
    this.existingData.statements.forEach((stmt, idx) => {
      correctAnswer[`stmt${idx}`] = stmt.is_true ? 'col1' : 'col2';
    });

    const questionData = {
      table_title: tableTitle,
      statement_column_title: statementColumnTitle,
      answer_col1_title: answerCol1Title,
      answer_col2_title: answerCol2Title,
      column_headers: columnHeaders,
      table_data: tableData,
      statements: this.existingData.statements,
      correct_answer: correctAnswer
    };

    this.moduleInstance.saveDIQuestion('TA', questionData);
    document.body.removeChild(overlay);
  },

  deleteQuestion(overlay) {
    this.moduleInstance.excelFormInstance.updateCell(this.moduleInstance.currentRowIndex, 'di_question_type', '');
    this.moduleInstance.excelFormInstance.updateCell(this.moduleInstance.currentRowIndex, 'di_question_data', null);

    const rowIndex = this.moduleInstance.currentRowIndex;
    this.moduleInstance.excelFormInstance.enableStandardFields(rowIndex);

    const diBtn = document.getElementById(`di-btn-${rowIndex}`);
    if (diBtn) {
      diBtn.textContent = '➕ CREATE DATA INSIGHTS QUESTION';
      diBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      diBtn.style.borderColor = '#10b981';
    }

    document.body.removeChild(overlay);
    alert('✅ Table Analysis question deleted successfully!');
  }
};
