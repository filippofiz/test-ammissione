// Two-Part Analysis Question Creator
// TPA questions have a scenario/context and two related questions
// Both parts must be answered correctly

window.DITwoPartAnalysis = {
  open(moduleInstance, existingData = null) {
    this.moduleInstance = moduleInstance;
    this.existingData = existingData || {
      scenario: '',
      statement_title: '',
      column1_title: '',
      column2_title: '',
      shared_options: [],
      correct_answers: {}
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
      max-width: 1000px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    const isEdit = this.existingData.scenario !== '';

    modal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
        <div style="font-size: 2.5rem;">🔗</div>
        <div>
          <h2 style="margin: 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
            ${isEdit ? 'Edit' : 'Create'} Two-Part Analysis Question
          </h2>
          <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">
            Question #${this.moduleInstance.currentRowIndex + 1}
          </p>
        </div>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #10b981; padding: 1rem; margin-bottom: 2rem; border-radius: 6px;">
        <p style="margin: 0; color: #065f46; font-size: 0.9rem; line-height: 1.5;">
          🔗 <strong>Two-Part Analysis:</strong> Create a scenario with a table of options and two column questions.
          Both parts must be answered correctly.
        </p>
      </div>

      <div id="ai-generator-container"></div>

      <!-- Scenario/Context -->
      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Scenario/Context:*</label>
        <textarea id="tpa-scenario" rows="5"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit;"
                  placeholder="Describe the scenario or provide context for the questions...">${this.existingData.scenario}</textarea>
      </div>

      <!-- Table Titles -->
      <div style="margin-bottom: 2rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Statement Column Title:*</label>
            <input type="text" id="tpa-statement-title" value="${this.existingData.statement_title || ''}"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                   placeholder="e.g., Options, Actions">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Column 1 Title:*</label>
            <input type="text" id="tpa-col1-title" value="${this.existingData.column1_title || ''}"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                   placeholder="e.g., Meets Goal">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Column 2 Title:*</label>
            <input type="text" id="tpa-col2-title" value="${this.existingData.column2_title || ''}"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                   placeholder="e.g., Does Not Meet Goal">
          </div>
        </div>
      </div>

      <!-- Shared Options -->
      <div style="margin-bottom: 2rem; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; background: #f9fafb;">
        <h4 style="margin: 0 0 1rem 0; color: #374151; font-weight: 600;">Options/Statements</h4>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; font-size: 0.9rem;">
          Options (one per line):*
        </label>
        <textarea id="tpa-options" rows="6"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.9rem;"
                  placeholder="Increase marketing budget by 20%\nHire 3 additional sales representatives\nExpand to two new markets\nLaunch a new product line\nReduce operating costs by 15%">${(this.existingData.shared_options || []).join('\n')}</textarea>
        <button type="button" id="tpa-render-btn"
                style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          📊 Render Table
        </button>
      </div>

      <!-- Table Container -->
      <div id="tpa-table-container" style="margin-bottom: 2rem;"></div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: space-between; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
        <button id="tpa-delete-btn" style="padding: 0.75rem 1.5rem; border: 2px solid #dc2626; border-radius: 8px; background: white; color: #dc2626; font-weight: 600; cursor: pointer; ${isEdit ? '' : 'display: none;'}">
          🗑️ Delete Question
        </button>
        <div style="display: flex; gap: 1rem;">
          <button id="tpa-cancel-btn" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #374151; font-weight: 600; cursor: pointer;">
            Cancel
          </button>
          <button id="tpa-save-btn" style="padding: 0.75rem 2rem; border: none; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 600; cursor: pointer;">
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
      const generateBtn = window.AIQuestionGenerator.createGenerateButton('TPA', (generatedData) => {
        this.populateFormWithAIData(generatedData);
      });
      aiContainer.appendChild(generateBtn);
    }

    // Event Listeners
    document.getElementById('tpa-render-btn').addEventListener('click', () => this.renderTable());
    document.getElementById('tpa-save-btn').addEventListener('click', () => this.saveQuestion(overlay));
    document.getElementById('tpa-cancel-btn').addEventListener('click', () => document.body.removeChild(overlay));

    if (isEdit) {
      document.getElementById('tpa-delete-btn').addEventListener('click', () => this.deleteQuestion(overlay));
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
  },

  populateFormWithAIData(data) {
    // Populate scenario
    const scenarioField = document.getElementById('tpa-scenario');
    if (scenarioField && data.scenario) {
      scenarioField.value = data.scenario;
    }

    // Populate statement title
    const statementTitleField = document.getElementById('tpa-statement-title');
    if (statementTitleField && data.statement_title) {
      statementTitleField.value = data.statement_title;
    }

    // Populate column titles
    const col1TitleField = document.getElementById('tpa-col1-title');
    if (col1TitleField && data.column1_title) {
      col1TitleField.value = data.column1_title;
    }

    const col2TitleField = document.getElementById('tpa-col2-title');
    if (col2TitleField && data.column2_title) {
      col2TitleField.value = data.column2_title;
    }

    // Populate shared options
    const optionsField = document.getElementById('tpa-options');
    if (optionsField && data.shared_options) {
      optionsField.value = data.shared_options.join('\n');
    }

    // Store correct answers in existingData
    if (data.correct_answers) {
      this.existingData.correct_answers = data.correct_answers;
    }

    // Trigger table render to show the options table
    this.renderTable();
  },

  renderTable() {
    const optionsTextarea = document.getElementById('tpa-options');
    const statementTitleInput = document.getElementById('tpa-statement-title');
    const col1TitleInput = document.getElementById('tpa-col1-title');
    const col2TitleInput = document.getElementById('tpa-col2-title');
    const container = document.getElementById('tpa-table-container');

    if (!optionsTextarea || !container) return;

    const options = optionsTextarea.value.split('\n').filter(o => o.trim());
    const statementTitle = statementTitleInput?.value || 'Statement';
    const col1Title = col1TitleInput?.value || 'Column 1';
    const col2Title = col2TitleInput?.value || 'Column 2';

    if (options.length === 0) {
      container.innerHTML = '<p style="color: #ef4444;">⚠️ Please enter at least one option</p>';
      return;
    }

    const correctAnswers = this.existingData.correct_answers || {};

    const tableHTML = `
      <div style="border: 2px solid #d1d5db; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 1rem; text-align: left; border-right: 1px solid #d1d5db; font-weight: 600; width: 50%;">${statementTitle}</th>
              <th style="padding: 1rem; text-align: center; border-right: 1px solid #d1d5db; font-weight: 600; width: 25%;">${col1Title}</th>
              <th style="padding: 1rem; text-align: center; font-weight: 600; width: 25%;">${col2Title}</th>
            </tr>
          </thead>
          <tbody>
            ${options.map((option, idx) => `
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 1rem; border-right: 1px solid #e5e7eb;">${option}</td>
                <td style="padding: 1rem; text-align: center; border-right: 1px solid #e5e7eb;">
                  <input type="radio" name="option-${idx}" value="col1"
                         ${correctAnswers[option] === 'col1' ? 'checked' : ''}
                         onchange="window.DITwoPartAnalysis.updateAnswer('${option.replace(/'/g, "\\'")}', 'col1')"
                         style="width: 20px; height: 20px; cursor: pointer;">
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <input type="radio" name="option-${idx}" value="col2"
                         ${correctAnswers[option] === 'col2' ? 'checked' : ''}
                         onchange="window.DITwoPartAnalysis.updateAnswer('${option.replace(/'/g, "\\'")}', 'col2')"
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

  updateAnswer(option, column) {
    if (!this.existingData.correct_answers) {
      this.existingData.correct_answers = {};
    }
    this.existingData.correct_answers[option] = column;
  },

  saveQuestion(overlay) {
    // Collect data
    const scenario = document.getElementById('tpa-scenario').value.trim();
    const statementTitle = document.getElementById('tpa-statement-title').value.trim();
    const col1Title = document.getElementById('tpa-col1-title').value.trim();
    const col2Title = document.getElementById('tpa-col2-title').value.trim();
    const sharedOptions = document.getElementById('tpa-options').value.split('\n').filter(o => o.trim());
    const correctAnswers = this.existingData.correct_answers || {};

    // Validation
    if (!scenario) {
      alert('⚠️ Scenario/Context is required!');
      return;
    }

    if (!statementTitle) {
      alert('⚠️ Statement column title is required!');
      return;
    }

    if (!col1Title) {
      alert('⚠️ Column 1 title is required!');
      return;
    }

    if (!col2Title) {
      alert('⚠️ Column 2 title is required!');
      return;
    }

    if (sharedOptions.length < 2) {
      alert('⚠️ At least 2 options are required!');
      return;
    }

    if (Object.keys(correctAnswers).length === 0) {
      alert('⚠️ Please render the table and select correct answers!');
      return;
    }

    const questionData = {
      scenario,
      statement_title: statementTitle,
      column1_title: col1Title,
      column2_title: col2Title,
      shared_options: sharedOptions,
      correct_answers: correctAnswers
    };

    this.moduleInstance.saveDIQuestion('TPA', questionData);
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
    alert('✅ Two-Part Analysis question deleted successfully!');
  }
};
