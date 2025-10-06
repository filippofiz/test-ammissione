// GMAT Data Insights Question Creator Module
// This module handles the creation of all 5 Data Insights question types
// Integrated with excel-form-bancadati.js

class GMATDataInsightsModule {
  constructor() {
    this.currentRowIndex = null;
    this.currentRowData = null;
    this.excelFormInstance = null;
    this.questionTypes = {
      'DS': 'Data Sufficiency',
      'GI': 'Graphics Interpretation',
      'TA': 'Table Analysis',
      'TPA': 'Two-Part Analysis',
      'MSR': 'Multi-Source Reasoning'
    };
  }

  // Main entry point: opens modal to select/create DI question
  openDIQuestionModal(rowIndex, rowData, excelFormInstance) {
    this.currentRowIndex = rowIndex;
    this.currentRowData = rowData;
    this.excelFormInstance = excelFormInstance;

    // If editing existing DI question, open edit modal
    if (rowData.di_question_type) {
      this.openEditModal(rowData.di_question_type, rowData.di_question_data);
    } else {
      // Show question type selector
      this.showQuestionTypeSelector();
    }
  }

  // Show modal to select DI question type
  showQuestionTypeSelector() {
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
      z-index: 10000;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    modal.innerHTML = `
      <h2 style="margin: 0 0 1.5rem 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
        📊 Select Data Insights Question Type
      </h2>
      <p style="color: #6b7280; margin-bottom: 1.5rem; font-size: 1rem;">
        Choose the type of Data Insights question you want to create for Question #${this.currentRowIndex + 1}
      </p>

      <!-- Batch Generator Button -->
      <div style="margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; text-align: center;">
        <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.2rem; font-weight: 700;">
          🎯 Generate Multiple Questions at Once
        </h3>
        <p style="margin: 0 0 1rem 0; color: rgba(255,255,255,0.9); font-size: 0.9rem;">
          Mix all 5 question types, set difficulty, and generate in batch with AI
        </p>
        <button id="open-batch-generator-btn" style="
          padding: 0.875rem 2rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: all 0.2s;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';">
          📚 Open Batch Generator
        </button>
      </div>

      <div style="text-align: center; margin-bottom: 1rem; color: #9ca3af; font-size: 0.9rem; font-weight: 600;">
        — OR CREATE SINGLE QUESTION —
      </div>

      <div class="di-type-grid" style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 2rem;">
        ${this.renderQuestionTypeOptions()}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
        <button class="di-btn-cancel" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #374151; font-weight: 600; cursor: pointer;">
          Cancel
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event listeners
    modal.querySelector('.di-btn-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // Batch generator button
    modal.querySelector('#open-batch-generator-btn').addEventListener('click', () => {
      document.body.removeChild(overlay);
      if (window.AIQuestionGenerator) {
        window.AIQuestionGenerator.showBatchGeneratorModal();
      } else {
        alert('AI Question Generator not loaded. Please refresh the page.');
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // Add click handlers for type cards
    modal.querySelectorAll('.di-type-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.type;
        document.body.removeChild(overlay);
        this.openCreatorForType(type);
      });
    });
  }

  renderQuestionTypeOptions() {
    const types = [
      {
        code: 'DS',
        name: 'Data Sufficiency',
        icon: '🎯',
        description: 'Present a problem with two statements. Test if data is sufficient to solve.',
        color: '#3b82f6'
      },
      {
        code: 'GI',
        name: 'Graphics Interpretation',
        icon: '📈',
        description: 'Display graphs/charts and ask students to interpret visual data.',
        color: '#8b5cf6'
      },
      {
        code: 'TA',
        name: 'Table Analysis',
        icon: '📊',
        description: 'Sortable data table with True/False statements to evaluate.',
        color: '#06b6d4'
      },
      {
        code: 'TPA',
        name: 'Two-Part Analysis',
        icon: '🔗',
        description: 'Two interconnected questions that must both be answered correctly.',
        color: '#10b981'
      },
      {
        code: 'MSR',
        name: 'Multi-Source Reasoning',
        icon: '📑',
        description: 'Multiple tabs of information (text, charts, tables) with related questions.',
        color: '#f59e0b'
      }
    ];

    return types.map(type => `
      <div class="di-type-card" data-type="${type.code}" style="
        border: 2px solid ${type.color}33;
        border-radius: 12px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.2s;
        background: ${type.color}08;
      " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px ${type.color}22';"
         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
        <div style="display: flex; align-items: flex-start; gap: 1rem;">
          <div style="font-size: 2rem; flex-shrink: 0;">${type.icon}</div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 0.5rem 0; color: ${type.color}; font-size: 1.25rem; font-weight: 700;">
              ${type.name}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.95rem; line-height: 1.5;">
              ${type.description}
            </p>
          </div>
          <div style="color: ${type.color}; font-weight: 600;">→</div>
        </div>
      </div>
    `).join('');
  }

  openCreatorForType(typeCode) {
    // Load the appropriate creator module
    switch(typeCode) {
      case 'DS':
        this.openDataSufficiencyCreator();
        break;
      case 'GI':
        this.openGraphicsInterpretationCreator();
        break;
      case 'TA':
        this.openTableAnalysisCreator();
        break;
      case 'TPA':
        this.openTwoPartAnalysisCreator();
        break;
      case 'MSR':
        this.openMultiSourceReasoningCreator();
        break;
    }
  }

  openEditModal(typeCode, questionData) {
    // Open the creator with existing data for editing
    switch(typeCode) {
      case 'DS':
        this.openDataSufficiencyCreator(questionData);
        break;
      case 'GI':
        this.openGraphicsInterpretationCreator(questionData);
        break;
      case 'TA':
        this.openTableAnalysisCreator(questionData);
        break;
      case 'TPA':
        this.openTwoPartAnalysisCreator(questionData);
        break;
      case 'MSR':
        this.openMultiSourceReasoningCreator(questionData);
        break;
    }
  }

  // Save DI question to the row
  saveDIQuestion(typeCode, questionData) {
    console.log('🔍 saveDIQuestion called:', { typeCode, questionData, rowIndex: this.currentRowIndex });

    // Update tableData
    this.excelFormInstance.updateCell(this.currentRowIndex, 'di_question_type', typeCode);
    this.excelFormInstance.updateCell(this.currentRowIndex, 'di_question_data', questionData);

    // Debug: Verify data was actually saved
    const savedData = this.excelFormInstance.tableData[this.currentRowIndex];
    console.log('✅ Data after save:', {
      di_question_type: savedData.di_question_type,
      di_question_data: savedData.di_question_data,
      hasData: !!savedData.di_question_data
    });

    // Update visible type input field
    const typeInput = document.getElementById(`di-type-input-${this.currentRowIndex}`);
    if (typeInput) {
      typeInput.value = typeCode;
    }

    // Update UI: Change button and disable standard fields
    this.updateRowUIAfterSave(typeCode);

    alert(`✅ ${this.questionTypes[typeCode]} question saved successfully!`);
  }

  updateRowUIAfterSave(typeCode) {
    const rowIndex = this.currentRowIndex;

    // Update DI button
    const diBtn = document.getElementById(`di-btn-${rowIndex}`);
    if (diBtn) {
      const typeNames = {
        'DS': 'Data Sufficiency',
        'GI': 'Graphics Interpretation',
        'TA': 'Table Analysis',
        'TPA': 'Two-Part Analysis',
        'MSR': 'Multi-Source Reasoning'
      };
      diBtn.textContent = `✏️ Edit ${typeNames[typeCode]} Question`;
      diBtn.style.background = 'linear-gradient(135deg, #0ea5e9, #06b6d4)';
      diBtn.style.borderColor = '#0ea5e9';
    }

    // Disable standard question fields with clear visual indication
    const questionTextarea = document.getElementById(`question-textarea-${rowIndex}`);
    if (questionTextarea) {
      questionTextarea.disabled = true;
      questionTextarea.style.background = 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)';
      questionTextarea.style.color = '#9ca3af';
      questionTextarea.style.border = '2px dashed #d1d5db';
      questionTextarea.style.cursor = 'not-allowed';
      questionTextarea.value = '🔒 DI Question - Use button above to edit';
      questionTextarea.placeholder = '';
    }

    const correctInput = document.getElementById(`correct-input-${rowIndex}`);
    if (correctInput) {
      correctInput.disabled = true;
      correctInput.style.background = 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)';
      correctInput.style.color = '#9ca3af';
      correctInput.style.border = '2px dashed #d1d5db';
      correctInput.style.cursor = 'not-allowed';
      correctInput.value = '🔒';
      correctInput.placeholder = '';
    }

    ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
      const optionTextarea = document.getElementById(`option-${letter}-textarea-${rowIndex}`);
      if (optionTextarea) {
        optionTextarea.disabled = true;
        optionTextarea.style.background = 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)';
        optionTextarea.style.color = '#9ca3af';
        optionTextarea.style.border = '2px dashed #d1d5db';
        optionTextarea.style.cursor = 'not-allowed';
        optionTextarea.value = '🔒 DI Question';
        optionTextarea.placeholder = '';
      }
    });

    // Disable all image upload buttons
    const imageFields = ['image_url', 'image_option_a', 'image_option_b', 'image_option_c', 'image_option_d', 'image_option_e'];
    imageFields.forEach(field => {
      const imageBtn = document.getElementById(`image-btn-${field}-${rowIndex}`);
      if (imageBtn) {
        imageBtn.disabled = true;
        imageBtn.style.background = 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)';
        imageBtn.style.color = '#9ca3af';
        imageBtn.style.border = '2px dashed #d1d5db';
        imageBtn.style.cursor = 'not-allowed';
        imageBtn.textContent = '🔒';
        imageBtn.onclick = null;
      }
    });
  }

  // Individual creator methods (to be implemented in separate files)
  openDataSufficiencyCreator(existingData = null) {
    if (window.DIDataSufficiency) {
      window.DIDataSufficiency.open(this, existingData);
    } else {
      alert('Data Sufficiency creator not loaded');
    }
  }

  openGraphicsInterpretationCreator(existingData = null) {
    if (window.DIGraphicsInterpretation) {
      window.DIGraphicsInterpretation.open(this, existingData);
    } else {
      alert('Graphics Interpretation creator not loaded');
    }
  }

  openTableAnalysisCreator(existingData = null) {
    if (window.DITableAnalysis) {
      window.DITableAnalysis.open(this, existingData);
    } else {
      alert('Table Analysis creator not loaded');
    }
  }

  openTwoPartAnalysisCreator(existingData = null) {
    if (window.DITwoPartAnalysis) {
      window.DITwoPartAnalysis.open(this, existingData);
    } else {
      alert('Two-Part Analysis creator not loaded');
    }
  }

  openMultiSourceReasoningCreator(existingData = null) {
    if (window.DIMultiSourceReasoning) {
      window.DIMultiSourceReasoning.open(this, existingData);
    } else {
      alert('Multi-Source Reasoning creator not loaded');
    }
  }
}

// Initialize global instance
window.GMATDataInsights = new GMATDataInsightsModule();
