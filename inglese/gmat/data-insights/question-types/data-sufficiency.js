// Data Sufficiency Question Creator
// DS questions have a problem and two statements
// Standard 5-choice format specific to Data Sufficiency

window.DIDataSufficiency = {
  open(moduleInstance, existingData = null) {
    this.moduleInstance = moduleInstance;
    this.existingData = existingData;
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
      max-width: 900px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    const isEdit = this.existingData !== null;

    modal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
        <div style="font-size: 2.5rem;">🎯</div>
        <div>
          <h2 style="margin: 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
            ${isEdit ? 'Edit' : 'Create'} Data Sufficiency Question
          </h2>
          <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">
            Question #${this.moduleInstance.currentRowIndex + 1}
          </p>
        </div>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1rem; margin-bottom: 2rem; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af; font-size: 0.9rem; line-height: 1.6;">
          <strong>📘 Data Sufficiency Format:</strong> Present a mathematical problem followed by two statements.
          Students determine if the statements provide sufficient information to solve the problem. The answer choices are always the same standard 5 options.
        </p>
      </div>

      <div id="ai-generator-container"></div>

      <form id="dsForm">
        <!-- Problem Statement -->
        <div style="margin-bottom: 2rem;">
          <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
            Problem Statement:*
            <span style="font-weight: 400; color: #6b7280; font-size: 0.9rem;">(supports LaTeX: use $...$ for inline, $$...$$ for display)</span>
          </label>
          <textarea id="dsProblem" rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; font-size: 0.95rem;"
                    placeholder="e.g., What is the value of x?">${this.existingData?.problem || ''}</textarea>
          <div id="dsProblemPreview" class="latex-preview" style="margin-top: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px; min-height: 2rem;"></div>
        </div>

        <!-- Statement 1 -->
        <div style="margin-bottom: 2rem;">
          <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
            Statement (1):*
          </label>
          <textarea id="dsStatement1" rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; font-size: 0.95rem;"
                    placeholder="e.g., x > 5">${this.existingData?.statement1 || ''}</textarea>
          <div id="dsStatement1Preview" class="latex-preview" style="margin-top: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px; min-height: 2rem;"></div>
        </div>

        <!-- Statement 2 -->
        <div style="margin-bottom: 2rem;">
          <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
            Statement (2):*
          </label>
          <textarea id="dsStatement2" rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; font-size: 0.95rem;"
                    placeholder="e.g., x < 10">${this.existingData?.statement2 || ''}</textarea>
          <div id="dsStatement2Preview" class="latex-preview" style="margin-top: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px; min-height: 2rem;"></div>
        </div>

        <!-- Image Upload (Optional) -->
        <div style="margin-bottom: 2rem;">
          <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
            Image (Optional):
          </label>
          <input type="file" id="dsImage" accept="image/*" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px;">
          ${this.existingData?.image_url ? `
            <div style="margin-top: 0.75rem;">
              <img src="${this.existingData.image_url}" style="max-width: 200px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #6b7280;">Current image</p>
            </div>
          ` : ''}
        </div>

        <!-- Correct Answer -->
        <div style="margin-bottom: 2rem;">
          <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
            Correct Answer:*
          </label>
          <select id="dsCorrectAnswer" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem;">
            <option value="">Select correct answer...</option>
            <option value="A" ${this.existingData?.correct_answer === 'A' ? 'selected' : ''}>A - Statement (1) ALONE is sufficient</option>
            <option value="B" ${this.existingData?.correct_answer === 'B' ? 'selected' : ''}>B - Statement (2) ALONE is sufficient</option>
            <option value="C" ${this.existingData?.correct_answer === 'C' ? 'selected' : ''}>C - BOTH statements TOGETHER are sufficient, but NEITHER alone</option>
            <option value="D" ${this.existingData?.correct_answer === 'D' ? 'selected' : ''}>D - EACH statement ALONE is sufficient</option>
            <option value="E" ${this.existingData?.correct_answer === 'E' ? 'selected' : ''}>E - Statements (1) and (2) TOGETHER are NOT sufficient</option>
          </select>
        </div>

        <!-- Explanation (Optional) -->
        <div style="margin-bottom: 2rem;">
          <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
            Explanation (Optional):
          </label>
          <textarea id="dsExplanation" rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem;"
                    placeholder="Provide an explanation for the correct answer...">${this.existingData?.explanation || ''}</textarea>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; justify-content: space-between; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
          <button type="button" id="dsDeleteBtn" style="padding: 0.75rem 1.5rem; border: 1px solid #ef4444; border-radius: 8px; background: white; color: #ef4444; font-weight: 600; cursor: pointer; ${!isEdit ? 'display: none;' : ''}">
            🗑️ Delete Question
          </button>
          <div style="display: flex; gap: 1rem;">
            <button type="button" id="dsCancelBtn" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #374151; font-weight: 600; cursor: pointer;">
              Cancel
            </button>
            <button type="submit" style="padding: 0.75rem 2rem; border: none; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; font-weight: 600; cursor: pointer;">
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
      const generateBtn = window.AIQuestionGenerator.createGenerateButton('DS', (generatedData) => {
        this.populateFormWithAIData(generatedData);
      });
      aiContainer.appendChild(generateBtn);
    }

    // Setup LaTeX preview
    this.setupLaTeXPreviews();

    // Event listeners
    const form = document.getElementById('dsForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveQuestion(overlay);
    });

    document.getElementById('dsCancelBtn').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    if (isEdit) {
      document.getElementById('dsDeleteBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this Data Sufficiency question?')) {
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

  setupLaTeXPreviews() {
    const renderLaTeX = (text, previewId) => {
      const preview = document.getElementById(previewId);
      if (!preview) return;

      preview.textContent = text || '(Preview will appear here)';
      preview.style.color = text ? '#111827' : '#9ca3af';

      if (window.MathJax && text) {
        MathJax.typesetPromise([preview]).catch(err => console.log('MathJax error:', err));
      }
    };

    document.getElementById('dsProblem').addEventListener('input', (e) => {
      renderLaTeX(e.target.value, 'dsProblemPreview');
    });

    document.getElementById('dsStatement1').addEventListener('input', (e) => {
      renderLaTeX(e.target.value, 'dsStatement1Preview');
    });

    document.getElementById('dsStatement2').addEventListener('input', (e) => {
      renderLaTeX(e.target.value, 'dsStatement2Preview');
    });

    // Initial render
    renderLaTeX(document.getElementById('dsProblem').value, 'dsProblemPreview');
    renderLaTeX(document.getElementById('dsStatement1').value, 'dsStatement1Preview');
    renderLaTeX(document.getElementById('dsStatement2').value, 'dsStatement2Preview');
  },

  populateFormWithAIData(data) {
    // Populate problem
    const problemField = document.getElementById('dsProblem');
    if (problemField && data.problem) {
      problemField.value = data.problem;
      problemField.dispatchEvent(new Event('input'));
    }

    // Populate statement 1
    const stmt1Field = document.getElementById('dsStatement1');
    if (stmt1Field && data.statement1) {
      stmt1Field.value = data.statement1;
      stmt1Field.dispatchEvent(new Event('input'));
    }

    // Populate statement 2
    const stmt2Field = document.getElementById('dsStatement2');
    if (stmt2Field && data.statement2) {
      stmt2Field.value = data.statement2;
      stmt2Field.dispatchEvent(new Event('input'));
    }

    // Populate correct answer
    const answerField = document.getElementById('dsCorrectAnswer');
    if (answerField && data.correct_answer) {
      answerField.value = data.correct_answer;
    }

    // Populate explanation
    const explanationField = document.getElementById('dsExplanation');
    if (explanationField && data.explanation) {
      explanationField.value = data.explanation;
    }
  },

  async saveQuestion(overlay) {
    const problem = document.getElementById('dsProblem').value.trim();
    const statement1 = document.getElementById('dsStatement1').value.trim();
    const statement2 = document.getElementById('dsStatement2').value.trim();
    const correctAnswer = document.getElementById('dsCorrectAnswer').value;
    const explanation = document.getElementById('dsExplanation').value.trim();
    const imageFile = document.getElementById('dsImage').files[0];

    // Validation
    if (!problem) {
      alert('⚠️ Problem statement is required!');
      return;
    }

    if (!statement1 || !statement2) {
      alert('⚠️ Both statements are required!');
      return;
    }

    if (!correctAnswer) {
      alert('⚠️ Please select the correct answer!');
      return;
    }

    // Handle image upload if new image selected
    let imageUrl = this.existingData?.image_url || '';
    if (imageFile) {
      // TODO: Implement image upload to Supabase storage
      // For now, create a data URL
      imageUrl = await this.uploadImage(imageFile);
    }

    // Create question data object
    const questionData = {
      problem,
      statement1,
      statement2,
      correct_answer: correctAnswer,
      explanation: explanation || null,
      image_url: imageUrl || null,
      answer_choices: {
        A: 'Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.',
        B: 'Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.',
        C: 'BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.',
        D: 'EACH statement ALONE is sufficient.',
        E: 'Statements (1) and (2) TOGETHER are NOT sufficient.'
      }
    };

    // Save to parent module
    this.moduleInstance.saveDIQuestion('DS', questionData);

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

    const questionTextarea = document.getElementById(`question-textarea-${rowIndex}`);
    if (questionTextarea) {
      questionTextarea.disabled = false;
      questionTextarea.style.background = '';
      questionTextarea.style.color = '';
      questionTextarea.placeholder = 'Testo domanda... Usa $...$ per LaTeX inline';
    }

    const correctInput = document.getElementById(`correct-input-${rowIndex}`);
    if (correctInput) {
      correctInput.disabled = false;
      correctInput.style.background = '';
      correctInput.placeholder = 'A-E';
    }

    ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
      const optionTextarea = document.getElementById(`option-${letter}-textarea-${rowIndex}`);
      if (optionTextarea) {
        optionTextarea.disabled = false;
        optionTextarea.style.background = '';
        optionTextarea.style.color = '';
        optionTextarea.placeholder = `Testo opzione ${letter.toUpperCase()}... Usa $...$ per LaTeX`;
      }
    });

    // Update button
    const diBtn = document.getElementById(`di-btn-${rowIndex}`);
    if (diBtn) {
      diBtn.textContent = '📝 Create DI Question';
      diBtn.style.background = '#10b981';
    }

    document.body.removeChild(overlay);
    alert('✅ Data Sufficiency question deleted successfully!');
  }
};
