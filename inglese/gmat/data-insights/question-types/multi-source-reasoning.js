// Multi-Source Reasoning Question Creator
// MSR questions have multiple tabs (2-3 sources) with text/charts/tables
// Questions require analyzing and cross-referencing information from multiple sources

window.DIMultiSourceReasoning = {
  open(moduleInstance, existingData = null) {
    this.moduleInstance = moduleInstance;
    this.existingData = existingData || {
      sources: [
        { tab_name: 'Source 1', content_type: 'text', content: '' },
        { tab_name: 'Source 2', content_type: 'text', content: '' }
      ],
      questions: []
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
      max-width: 1100px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    const isEdit = this.existingData.questions && this.existingData.questions.length > 0;

    modal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
        <div style="font-size: 2.5rem;">📑</div>
        <div>
          <h2 style="margin: 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
            ${isEdit ? 'Edit' : 'Create'} Multi-Source Reasoning Question
          </h2>
          <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">
            Question #${this.moduleInstance.currentRowIndex + 1}
          </p>
        </div>
      </div>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin-bottom: 2rem; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 0.9rem; line-height: 1.6;">
          <strong>📑 Multi-Source Reasoning Format:</strong> Present information from 2-3 different sources (tabs).
          Each source can contain text, charts, or tables. Questions require students to analyze and integrate information across multiple sources.
        </p>
      </div>

      <div id="ai-generator-container"></div>

      <form id="msrForm">
        <!-- Sources Section -->
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: #374151; font-size: 1.25rem; font-weight: 700;">Information Sources (Tabs)</h3>
            <button type="button" id="addSourceBtn" style="padding: 0.5rem 1rem; border: none; border-radius: 6px; background: #f59e0b; color: white; font-weight: 600; cursor: pointer;">
              ➕ Add Source
            </button>
          </div>

          <div id="sourcesContainer" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Sources will be added here dynamically -->
          </div>
        </div>

        <!-- Questions Section -->
        <div style="margin-bottom: 2rem; padding-top: 2rem; border-top: 2px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: #374151; font-size: 1.25rem; font-weight: 700;">Questions</h3>
            <button type="button" id="addQuestionBtn" style="padding: 0.5rem 1rem; border: none; border-radius: 6px; background: #10b981; color: white; font-weight: 600; cursor: pointer;">
              ➕ Add Question
            </button>
          </div>

          <div id="questionsContainer" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Questions will be added here dynamically -->
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; justify-content: space-between; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
          <button type="button" id="msrDeleteBtn" style="padding: 0.75rem 1.5rem; border: 1px solid #ef4444; border-radius: 8px; background: white; color: #ef4444; font-weight: 600; cursor: pointer; ${!isEdit ? 'display: none;' : ''}">
            🗑️ Delete Question
          </button>
          <div style="display: flex; gap: 1rem;">
            <button type="button" id="msrCancelBtn" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #374151; font-weight: 600; cursor: pointer;">
              Cancel
            </button>
            <button type="submit" style="padding: 0.75rem 2rem; border: none; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: 600; cursor: pointer;">
              💾 Save Question
            </button>
          </div>
        </div>
      </form>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add AI Generator button
    if (window.AIQuestionGenerator) {
      const aiContainer = document.getElementById('ai-generator-container');
      const generateBtn = window.AIQuestionGenerator.createGenerateButton('MSR', (generatedData) => {
        this.populateFormWithAIData(generatedData);
      });
      aiContainer.appendChild(generateBtn);
    }

    // Render existing sources
    this.renderSources();

    // Render existing questions
    this.renderQuestions();

    // Event listeners
    const form = document.getElementById('msrForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveQuestion(overlay);
    });

    document.getElementById('addSourceBtn').addEventListener('click', () => {
      this.addSource();
    });

    document.getElementById('addQuestionBtn').addEventListener('click', () => {
      this.addQuestion();
    });

    document.getElementById('msrCancelBtn').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    if (isEdit) {
      document.getElementById('msrDeleteBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this Multi-Source Reasoning question?')) {
          this.deleteQuestion(overlay);
        }
      });
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        if (confirm('Close without saving?')) {
          document.body.removeChild(overlay);
        }
      }
    });
  },

  populateFormWithAIData(data) {

    // Populate sources - convert table_headers/table_data to HTML if needed
    if (data.sources && data.sources.length > 0) {
      console.log(`📋 Processing ${data.sources.length} sources...`);

      this.existingData.sources = data.sources.map((source, index) => {
        console.log(`  Source ${index + 1}:`, {
          tab_name: source.tab_name,
          content_type: source.content_type,
          hasContent: !!source.content,
          hasTableData: !!(source.table_headers && source.table_data)
        });

        // If source has table_headers and table_data, convert to HTML table
        if (source.table_headers && source.table_data) {
          const tableHTML = `
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>${source.table_headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; background: #f3f4f6;">${h}</th>`).join('')}</tr>
  </thead>
  <tbody>
    ${source.table_data.map(row => `<tr>${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`).join('\n    ')}
  </tbody>
</table>`.trim();

          console.log(`  ✅ Converted table data to HTML for source ${index + 1}`);

          return {
            tab_name: source.tab_name || `Source ${index + 1}`,
            content_type: source.content_type || 'table',
            content: tableHTML,
            // Keep original arrays for reference
            table_headers: source.table_headers,
            table_data: source.table_data
          };
        }

        return {
          tab_name: source.tab_name || `Source ${index + 1}`,
          content_type: source.content_type || 'text',
          content: source.content || ''
        };
      });

      console.log('✅ Sources populated in existingData:', this.existingData.sources);
      this.renderSources();
    }

    // Populate questions - handle both old format (singular "question") and new format (plural "questions")
    if (data.questions && data.questions.length > 0) {
      this.existingData.questions = data.questions;
      this.renderQuestions();
    } else if (data.question) {
      // Legacy format: convert singular "question" to array
      console.warn('⚠️ Converting old MSR format (singular "question") to new format (array "questions")');
      this.existingData.questions = [data.question];
      this.renderQuestions();
    }
  },

  renderSources() {
    // First, collect current values from inputs before re-rendering (only if inputs exist)
    const container = document.getElementById('sourcesContainer');
    if (container && container.children.length > 0) {
      this.collectSourceData();
    }

    console.log(`📝 renderSources called with ${this.existingData.sources.length} sources`);
    container.innerHTML = '';

    this.existingData.sources.forEach((source, index) => {
      console.log(`  Rendering source ${index + 1}:`, {
        tab_name: source.tab_name,
        content_type: source.content_type,
        contentLength: source.content?.length || 0
      });
      const sourceDiv = document.createElement('div');
      sourceDiv.style.cssText = 'background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem;';
      sourceDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h4 style="margin: 0; color: #374151; font-weight: 600;">Source ${index + 1}</h4>
          ${this.existingData.sources.length > 2 ? `
            <button type="button" class="remove-source-btn" data-index="${index}" style="padding: 0.25rem 0.75rem; border: 1px solid #ef4444; border-radius: 4px; background: white; color: #ef4444; font-size: 0.85rem; cursor: pointer;">
              Remove
            </button>
          ` : ''}
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Tab Name:*</label>
          <input type="text" class="source-tab-name" data-index="${index}" value="${source.tab_name || ''}"
                 placeholder="e.g., Email, Chart, Data Table"
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Content Type:*</label>
          <select class="source-content-type" data-index="${index}" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
            <option value="text" ${source.content_type === 'text' ? 'selected' : ''}>Text</option>
            <option value="chart" ${source.content_type === 'chart' ? 'selected' : ''}>Chart/Graph (with image)</option>
            <option value="table" ${source.content_type === 'table' ? 'selected' : ''}>Data Table</option>
          </select>
        </div>

        <div class="content-input-${index}">
          ${this.renderContentInput(index, source)}
        </div>
      `;

      container.appendChild(sourceDiv);

      // Add remove button listener
      const removeBtn = sourceDiv.querySelector('.remove-source-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => this.removeSource(index));
      }

      // Add content type change listener
      const typeSelect = sourceDiv.querySelector('.source-content-type');
      typeSelect.addEventListener('change', (e) => {
        this.existingData.sources[index].content_type = e.target.value;
        this.renderSources();
      });

      // Add real-time listeners for tab name and content
      const tabNameInput = sourceDiv.querySelector('.source-tab-name');
      tabNameInput.addEventListener('input', (e) => {
        this.existingData.sources[index].tab_name = e.target.value;
      });

      const contentInput = sourceDiv.querySelector('.source-content');
      if (contentInput) {
        contentInput.addEventListener('input', (e) => {
          this.existingData.sources[index].content = e.target.value;
        });
      }
    });
  },

  collectSourceData() {
    // Collect current values from all source inputs before re-rendering
    const tabNameInputs = document.querySelectorAll('.source-tab-name');
    const contentInputs = document.querySelectorAll('.source-content');

    tabNameInputs.forEach((input, index) => {
      if (this.existingData.sources[index]) {
        this.existingData.sources[index].tab_name = input.value;
      }
    });

    contentInputs.forEach((input, index) => {
      if (this.existingData.sources[index]) {
        this.existingData.sources[index].content = input.value;
      }
    });
  },

  renderContentInput(index, source) {
    if (source.content_type === 'text') {
      return `
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Content (Text):*</label>
        <textarea class="source-content" data-index="${index}" rows="8"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.9rem;"
                  placeholder="Enter the text content for this source...">${source.content || ''}</textarea>
      `;
    } else if (source.content_type === 'chart') {
      return `
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Chart/Graph Image:*</label>
        <input type="file" class="source-image" data-index="${index}" accept="image/*"
               style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
        ${source.image_url ? `
          <div style="margin-top: 0.75rem;">
            <img src="${source.image_url}" style="max-width: 300px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #6b7280;">Current image</p>
          </div>
        ` : ''}
        <textarea class="source-content" data-index="${index}" rows="3"
                  style="width: 100%; margin-top: 0.75rem; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem;"
                  placeholder="Optional: Add description or caption for the chart...">${source.content || ''}</textarea>
      `;
    } else {
      return `
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Table Data (HTML or plain text):*</label>
        <textarea class="source-content" data-index="${index}" rows="10"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.85rem;"
                  placeholder="Enter table data or HTML table code...">${source.content || ''}</textarea>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #6b7280;">Tip: Use simple table format or HTML table tags</p>
      `;
    }
  },

  addSource() {
    if (this.existingData.sources.length >= 3) {
      alert('Maximum 3 sources allowed');
      return;
    }

    this.existingData.sources.push({
      tab_name: `Source ${this.existingData.sources.length + 1}`,
      content_type: 'text',
      content: ''
    });

    this.renderSources();
  },

  removeSource(index) {
    this.existingData.sources.splice(index, 1);
    this.renderSources();
  },

  renderQuestions() {
    // Collect current question data before re-rendering (only if inputs exist)
    const container = document.getElementById('questionsContainer');
    if (container && container.children.length > 0) {
      this.collectQuestionData();
    }

    container.innerHTML = '';

    if (this.existingData.questions.length === 0) {
      container.innerHTML = '<p style="color: #9ca3af; font-style: italic;">No questions added yet. Click "Add Question" to create one.</p>';
      return;
    }

    this.existingData.questions.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.style.cssText = 'background: #f0fdf4; border: 2px solid #d1fae5; border-radius: 8px; padding: 1.5rem;';
      questionDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h4 style="margin: 0; color: #065f46; font-weight: 600;">Question ${index + 1}</h4>
          <button type="button" class="remove-question-btn" data-index="${index}" style="padding: 0.25rem 0.75rem; border: 1px solid #ef4444; border-radius: 4px; background: white; color: #ef4444; font-size: 0.85rem; cursor: pointer;">
            Remove
          </button>
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Question Text:*</label>
          <textarea class="question-text" data-index="${index}" rows="3"
                    style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                    placeholder="Enter the question...">${question.text || ''}</textarea>
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Question Type:*</label>
          <select class="question-type-select" data-index="${index}" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
            <option value="multiple_choice" ${question.question_type === 'multiple_choice' ? 'selected' : ''}>Multiple Choice (A-E)</option>
            <option value="two_column" ${question.question_type === 'two_column' ? 'selected' : ''}>Two-Column (Select from each)</option>
          </select>
        </div>

        <div class="question-content-${index}">
          ${this.renderQuestionContent(index, question)}
        </div>
      `;

      container.appendChild(questionDiv);

      // Add remove button listener
      questionDiv.querySelector('.remove-question-btn').addEventListener('click', () => this.removeQuestion(index));

      // Add question type change listener
      const typeSelect = questionDiv.querySelector('.question-type-select');
      typeSelect.addEventListener('change', (e) => {
        this.existingData.questions[index].question_type = e.target.value;
        this.renderQuestions();
      });

      // Add real-time listeners for question text
      const questionText = questionDiv.querySelector('.question-text');
      questionText.addEventListener('input', (e) => {
        this.existingData.questions[index].text = e.target.value;
      });
    });
  },

  renderQuestionContent(index, question) {
    if (question.question_type === 'two_column') {
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Column 1 Title:*</label>
            <input type="text" class="col1-title" data-index="${index}" value="${question.column1_title || ''}"
                   placeholder="e.g., Email"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Column 2 Title:*</label>
            <input type="text" class="col2-title" data-index="${index}" value="${question.column2_title || ''}"
                   placeholder="e.g., Chart"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Statements/Options (one per line):*</label>
          <textarea class="two-col-statements" data-index="${index}" rows="5"
                    style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.9rem;"
                    placeholder="Statement A\nStatement B\nStatement C\nStatement D">${(question.statements || []).join('\n')}</textarea>
          <button type="button" onclick="window.DIMultiSourceReasoning.renderTwoColumnTable(${index})"
                  style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
            📊 Render Table
          </button>
        </div>

        <div id="two-col-table-${index}" class="two-col-table-container" style="margin-top: 1rem;">
        </div>
      `;
    } else {
      // Multiple choice
      return `
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Options (one per line):*</label>
          <textarea class="question-options" data-index="${index}" rows="5"
                    style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace;"
                    placeholder="A) Option A\nB) Option B\nC) Option C\nD) Option D\nE) Option E">${
                      // Handle both array and object formats
                      Array.isArray(question.options)
                        ? question.options.join('\n')
                        : question.options
                          ? Object.entries(question.options).map(([key, val]) => `${key.toUpperCase()}) ${val}`).join('\n')
                          : ''
                    }</textarea>
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Correct Answer:*</label>
          <select class="question-answer" data-index="${index}" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
            <option value="">Select...</option>
            <option value="A" ${question.correct_answer?.toUpperCase() === 'A' ? 'selected' : ''}>A</option>
            <option value="B" ${question.correct_answer?.toUpperCase() === 'B' ? 'selected' : ''}>B</option>
            <option value="C" ${question.correct_answer?.toUpperCase() === 'C' ? 'selected' : ''}>C</option>
            <option value="D" ${question.correct_answer?.toUpperCase() === 'D' ? 'selected' : ''}>D</option>
            <option value="E" ${question.correct_answer?.toUpperCase() === 'E' ? 'selected' : ''}>E</option>
          </select>
        </div>
      `;
    }
  },

  collectQuestionData() {
    // Collect current values from all question inputs before re-rendering
    const questionTexts = document.querySelectorAll('.question-text');
    questionTexts.forEach((input, index) => {
      if (this.existingData.questions[index]) {
        this.existingData.questions[index].text = input.value;
      }
    });

    // Collect multiple choice data
    const questionOptions = document.querySelectorAll('.question-options');
    questionOptions.forEach((input, index) => {
      if (this.existingData.questions[index]) {
        this.existingData.questions[index].options = input.value.split('\n').filter(o => o.trim());
      }
    });

    const questionAnswers = document.querySelectorAll('.question-answer');
    questionAnswers.forEach((input, index) => {
      if (this.existingData.questions[index]) {
        this.existingData.questions[index].correct_answer = input.value;
      }
    });

    // Collect two-column data
    const col1Titles = document.querySelectorAll('.col1-title');
    col1Titles.forEach((input) => {
      const idx = parseInt(input.dataset.index);
      if (this.existingData.questions[idx]) {
        this.existingData.questions[idx].column1_title = input.value;
      }
    });

    const col2Titles = document.querySelectorAll('.col2-title');
    col2Titles.forEach((input) => {
      const idx = parseInt(input.dataset.index);
      if (this.existingData.questions[idx]) {
        this.existingData.questions[idx].column2_title = input.value;
      }
    });

    const twoColStatements = document.querySelectorAll('.two-col-statements');
    twoColStatements.forEach((input) => {
      const idx = parseInt(input.dataset.index);
      if (this.existingData.questions[idx]) {
        this.existingData.questions[idx].statements = input.value.split('\n').filter(o => o.trim());
      }
    });
  },

  addQuestion() {
    this.existingData.questions.push({
      text: '',
      question_type: 'multiple_choice', // or 'two_column'
      options: [],
      correct_answer: '',
      // For two-column type:
      column1_title: '',
      column2_title: '',
      statements: [],
      correct_answers: ''
    });

    this.renderQuestions();
  },

  removeQuestion(index) {
    this.existingData.questions.splice(index, 1);
    this.renderQuestions();
  },

  async saveQuestion(overlay) {
    // Collect source data
    const sources = [];
    for (let i = 0; i < this.existingData.sources.length; i++) {
      const tabName = document.querySelector(`.source-tab-name[data-index="${i}"]`).value.trim();
      const contentType = document.querySelector(`.source-content-type[data-index="${i}"]`).value;
      const content = document.querySelector(`.source-content[data-index="${i}"]`)?.value.trim() || '';

      if (!tabName) {
        alert(`⚠️ Source ${i + 1}: Tab name is required!`);
        return;
      }

      let imageUrl = this.existingData.sources[i]?.image_url || null;

      if (contentType === 'chart') {
        const imageFile = document.querySelector(`.source-image[data-index="${i}"]`)?.files[0];
        if (imageFile) {
          imageUrl = await this.uploadImage(imageFile);
        } else if (!imageUrl) {
          alert(`⚠️ Source ${i + 1}: Chart image is required!`);
          return;
        }
      }

      if (!content && contentType !== 'chart') {
        alert(`⚠️ Source ${i + 1}: Content is required!`);
        return;
      }

      sources.push({
        tab_name: tabName,
        content_type: contentType,
        content: content,
        image_url: imageUrl
      });
    }

    // Collect question data
    const questions = [];
    for (let i = 0; i < this.existingData.questions.length; i++) {
      const text = document.querySelector(`.question-text[data-index="${i}"]`).value.trim();
      const questionType = this.existingData.questions[i].question_type || 'multiple_choice';

      if (!text) {
        alert(`⚠️ Question ${i + 1}: Question text is required!`);
        return;
      }

      if (questionType === 'two_column') {
        // Two-column question
        const col1Title = document.querySelector(`.col1-title[data-index="${i}"]`).value.trim();
        const col2Title = document.querySelector(`.col2-title[data-index="${i}"]`).value.trim();
        const statements = document.querySelector(`.two-col-statements[data-index="${i}"]`).value.split('\n').filter(o => o.trim());
        const correctAnswers = this.existingData.questions[i]?.correct_answers || {};

        if (!col1Title || !col2Title) {
          alert(`⚠️ Question ${i + 1}: Both column titles are required!`);
          return;
        }

        if (statements.length < 2) {
          alert(`⚠️ Question ${i + 1}: At least 2 statements/options are required!`);
          return;
        }

        if (Object.keys(correctAnswers).length === 0) {
          alert(`⚠️ Question ${i + 1}: Please render the table and select correct answers!`);
          return;
        }

        questions.push({
          text,
          question_type: 'two_column',
          column1_title: col1Title,
          column2_title: col2Title,
          statements,
          correct_answers: correctAnswers
        });
      } else {
        // Multiple choice question
        const optionsText = document.querySelector(`.question-options[data-index="${i}"]`).value.trim();
        const correctAnswer = document.querySelector(`.question-answer[data-index="${i}"]`).value;

        const options = optionsText.split('\n').filter(o => o.trim());

        if (options.length < 2) {
          alert(`⚠️ Question ${i + 1}: At least 2 options are required!`);
          return;
        }

        if (!correctAnswer) {
          alert(`⚠️ Question ${i + 1}: Correct answer is required!`);
          return;
        }

        questions.push({
          text,
          question_type: 'multiple_choice',
          options,
          correct_answer: correctAnswer
        });
      }
    }

    if (questions.length === 0) {
      alert('⚠️ At least one question is required!');
      return;
    }

    // Create question data object
    const questionData = {
      sources,
      questions
    };

    // Save to parent module
    this.moduleInstance.saveDIQuestion('MSR', questionData);

    document.body.removeChild(overlay);
  },

  async uploadImage(file) {
    // Create a temporary data URL for now
    // TODO: Implement actual Supabase storage upload
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },

  deleteQuestion(overlay) {
    // Clear DI data from row
    this.moduleInstance.excelFormInstance.updateCell(this.moduleInstance.currentRowIndex, 'di_question_type', '');
    this.moduleInstance.excelFormInstance.updateCell(this.moduleInstance.currentRowIndex, 'di_question_data', null);

    // Re-enable standard fields
    const rowIndex = this.moduleInstance.currentRowIndex;
    this.moduleInstance.excelFormInstance.enableStandardFields(rowIndex);

    // Update button
    const diBtn = document.getElementById(`di-btn-${rowIndex}`);
    if (diBtn) {
      diBtn.textContent = '➕ CREATE DATA INSIGHTS QUESTION';
      diBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      diBtn.style.borderColor = '#10b981';
    }

    document.body.removeChild(overlay);
    alert('✅ Multi-Source Reasoning question deleted successfully!');
  },

  renderTwoColumnTable(questionIndex) {
    const statementsTextarea = document.querySelector(`.two-col-statements[data-index="${questionIndex}"]`);
    const col1TitleInput = document.querySelector(`.col1-title[data-index="${questionIndex}"]`);
    const col2TitleInput = document.querySelector(`.col2-title[data-index="${questionIndex}"]`);
    const container = document.getElementById(`two-col-table-${questionIndex}`);

    if (!statementsTextarea || !container) return;

    const statements = statementsTextarea.value.split('\n').filter(s => s.trim());
    const col1Title = col1TitleInput?.value || 'Column 1';
    const col2Title = col2TitleInput?.value || 'Column 2';

    if (statements.length === 0) {
      container.innerHTML = '<p style="color: #ef4444;">⚠️ Please enter at least one statement</p>';
      return;
    }

    // Get existing correct answers if available
    const existingAnswers = this.existingData.questions[questionIndex]?.correct_answers || {};

    const tableHTML = `
      <div style="border: 2px solid #d1d5db; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 1rem; text-align: left; border-right: 1px solid #d1d5db; font-weight: 600;">Statement</th>
              <th style="padding: 1rem; text-align: center; border-right: 1px solid #d1d5db; font-weight: 600;">${col1Title}</th>
              <th style="padding: 1rem; text-align: center; font-weight: 600;">${col2Title}</th>
            </tr>
          </thead>
          <tbody>
            ${statements.map((stmt, idx) => `
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 1rem; border-right: 1px solid #e5e7eb;">${stmt}</td>
                <td style="padding: 1rem; text-align: center; border-right: 1px solid #e5e7eb;">
                  <input type="radio" name="stmt-${questionIndex}-${idx}" value="col1"
                         ${existingAnswers[stmt] === 'col1' ? 'checked' : ''}
                         data-question="${questionIndex}" data-statement="${stmt}"
                         onchange="window.DIMultiSourceReasoning.updateTwoColumnAnswer(${questionIndex}, '${stmt}', 'col1')"
                         style="width: 20px; height: 20px; cursor: pointer;">
                </td>
                <td style="padding: 1rem; text-align: center;">
                  <input type="radio" name="stmt-${questionIndex}-${idx}" value="col2"
                         ${existingAnswers[stmt] === 'col2' ? 'checked' : ''}
                         data-question="${questionIndex}" data-statement="${stmt}"
                         onchange="window.DIMultiSourceReasoning.updateTwoColumnAnswer(${questionIndex}, '${stmt}', 'col2')"
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

  updateTwoColumnAnswer(questionIndex, statement, column) {
    if (!this.existingData.questions[questionIndex]) {
      this.existingData.questions[questionIndex] = {};
    }
    if (!this.existingData.questions[questionIndex].correct_answers) {
      this.existingData.questions[questionIndex].correct_answers = {};
    }

    this.existingData.questions[questionIndex].correct_answers[statement] = column;
  }
};
