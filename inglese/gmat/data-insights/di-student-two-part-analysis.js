// Two-Part Analysis Student Renderer
// Interactive version for students taking the test

window.DIStudentTwoPartAnalysis = {
  render(questionData, questionId, currentAnswer) {
    // Parse questionData if it's a string
    let data = questionData;
    if (typeof questionData === 'string') {
      try {
        data = JSON.parse(questionData);
      } catch (e) {
        console.error('Failed to parse TPA question data:', e);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: red; padding: 1rem;';
        errorDiv.textContent = 'Error: Invalid question data format';
        return errorDiv;
      }
    }


    const container = document.createElement('div');
    container.classList.add('di-tpa-student-container');
    container.classList.add('tex2jax_ignore');  // Tell MathJax to skip this container

    // Scenario
    if (data.scenario) {
      const scenarioBox = document.createElement('div');
      scenarioBox.style.cssText = `
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f0f9ff;
        border-left: 4px solid #0ea5e9;
        border-radius: 4px;
        line-height: 1.7;
        white-space: pre-wrap;
      `;
      scenarioBox.innerHTML = `<strong style="display: block; margin-bottom: 0.75rem; color: #0c4a6e;">Scenario:</strong>${data.scenario}`;
      container.appendChild(scenarioBox);
    }

    // Instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      font-weight: 600;
      color: #92400e;
    `;
    instructions.textContent = `Select one option for each column from the list below:`;
    container.appendChild(instructions);

    // Two-column table
    const tableContainer = document.createElement('div');
    tableContainer.style.cssText = `
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    `;

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = 'background: #f3f4f6;';

    // Column 1 header
    const thCol1 = document.createElement('th');
    thCol1.style.cssText = `
      padding: 0.75rem;
      text-align: center;
      border: 1px solid #e5e7eb;
      font-weight: 700;
      color: #374151;
      width: 15%;
    `;
    thCol1.textContent = data.column1_title || 'Column 1';
    headerRow.appendChild(thCol1);

    // Column 2 header
    const thCol2 = document.createElement('th');
    thCol2.style.cssText = `
      padding: 0.75rem;
      text-align: center;
      border: 1px solid #e5e7eb;
      font-weight: 700;
      color: #374151;
      width: 15%;
    `;
    thCol2.textContent = data.column2_title || 'Column 2';
    headerRow.appendChild(thCol2);

    // Option header
    const thOpt = document.createElement('th');
    thOpt.style.cssText = `
      padding: 0.75rem;
      text-align: left;
      border: 1px solid #e5e7eb;
      font-weight: 700;
      color: #374151;
      width: 70%;
    `;
    thOpt.textContent = data.statement_title || 'Option';
    headerRow.appendChild(thOpt);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    (data.shared_options || []).forEach((option, oi) => {
      const tr = document.createElement('tr');
      tr.style.cssText = `
        background: ${oi % 2 === 0 ? 'white' : '#f9fafb'};
        transition: background 0.2s;
      `;

      // Column 1 radio
      const tdCol1 = document.createElement('td');
      tdCol1.style.cssText = `
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        text-align: center;
      `;
      const radio1 = document.createElement('input');
      radio1.type = 'radio';
      radio1.name = `tpa-col1-${questionId}`;
      radio1.value = option;
      radio1.style.cssText = 'cursor: pointer; transform: scale(1.3);';
      radio1.checked = currentAnswer?.col1 === option;
      radio1.addEventListener('change', () => {
        this.updateAnswer(questionId);
      });
      tdCol1.appendChild(radio1);
      tr.appendChild(tdCol1);

      // Column 2 radio
      const tdCol2 = document.createElement('td');
      tdCol2.style.cssText = `
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        text-align: center;
      `;
      const radio2 = document.createElement('input');
      radio2.type = 'radio';
      radio2.name = `tpa-col2-${questionId}`;
      radio2.value = option;
      radio2.style.cssText = 'cursor: pointer; transform: scale(1.3);';
      radio2.checked = currentAnswer?.col2 === option;
      radio2.addEventListener('change', () => {
        this.updateAnswer(questionId);
      });
      tdCol2.appendChild(radio2);
      tr.appendChild(tdCol2);

      // Option text
      const tdOpt = document.createElement('td');
      tdOpt.style.cssText = `
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        color: #1f2937;
        line-height: 1.6;
      `;
      tdOpt.textContent = option;
      tr.appendChild(tdOpt);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);

    return container;
  },

  updateAnswer(questionId) {
    const col1Selected = document.querySelector(`input[name="tpa-col1-${questionId}"]:checked`);
    const col2Selected = document.querySelector(`input[name="tpa-col2-${questionId}"]:checked`);

    const answer = {
      col1: col1Selected?.value || '',
      col2: col2Selected?.value || ''
    };

    // Call global answer selection function
    if (window.selectAnswerBocconi) {
      window.selectAnswerBocconi(questionId, JSON.stringify(answer));
    }
  },

  // View mode for tutors - shows both student answer and correct answer visually
  renderViewMode(questionData, questionId, studentAnswer, correctAnswer) {
    const container = this.render(questionData, questionId, studentAnswer);

    // Find all radio buttons and mark them to show student vs correct
    setTimeout(() => {

      // Prevent radio changes but keep interactive
      container.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('click', (e) => {
          e.preventDefault();
          return false;
        });
      });

      // Find the table and process each row
      const table = container.querySelector('table');
      if (!table) return;

      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        // Get option value from radios in this row
        const col1Radio = row.querySelector('input[name^="tpa-col1"]');
        const col2Radio = row.querySelector('input[name^="tpa-col2"]');

        if (!col1Radio || !col2Radio) return;

        const optionValue = col1Radio.value; // Both radios have same value (the option text)

        // Check if this option is selected in col1 or col2 by student
        const isStudentCol1 = studentAnswer?.col1 === optionValue;
        const isStudentCol2 = studentAnswer?.col2 === optionValue;
        const isCorrectCol1 = correctAnswer?.col1 === optionValue;
        const isCorrectCol2 = correctAnswer?.col2 === optionValue;


        // Get the radio cells
        const col1Cell = col1Radio.closest('td');
        const col2Cell = col2Radio.closest('td');

        // Mark col1 cell
        if (col1Cell) {
          // Remove existing indicators
          const existingIndicator = col1Cell.querySelector('.answer-indicator');
          if (existingIndicator) existingIndicator.remove();

          if (isStudentCol1 && isCorrectCol1) {
            // Student selected correct answer - green
            col1Cell.style.background = '#d1fae5';
            col1Cell.style.border = '3px solid #10b981';
            col1Radio.checked = true;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #10b981; font-weight: 700; font-size: 0.75rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✓ CORRECT';
            col1Cell.appendChild(indicator);
          } else if (isStudentCol1 && !isCorrectCol1) {
            // Student selected wrong answer - red
            col1Cell.style.background = '#fee2e2';
            col1Cell.style.border = '3px solid #ef4444';
            col1Radio.checked = true;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #ef4444; font-weight: 700; font-size: 0.75rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✗ Wrong';
            col1Cell.appendChild(indicator);
          } else if (!isStudentCol1 && isCorrectCol1) {
            // Correct answer not selected - green outline
            col1Cell.style.background = '#f0fdf4';
            col1Cell.style.border = '3px solid #10b981';
            col1Radio.checked = false;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #10b981; font-weight: 700; font-size: 0.75rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✓ Correct';
            col1Cell.appendChild(indicator);
          }
        }

        // Mark col2 cell
        if (col2Cell) {
          // Remove existing indicators
          const existingIndicator = col2Cell.querySelector('.answer-indicator');
          if (existingIndicator) existingIndicator.remove();

          if (isStudentCol2 && isCorrectCol2) {
            // Student selected correct answer - green
            col2Cell.style.background = '#d1fae5';
            col2Cell.style.border = '3px solid #10b981';
            col2Radio.checked = true;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #10b981; font-weight: 700; font-size: 0.75rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✓ CORRECT';
            col2Cell.appendChild(indicator);
          } else if (isStudentCol2 && !isCorrectCol2) {
            // Student selected wrong answer - red
            col2Cell.style.background = '#fee2e2';
            col2Cell.style.border = '3px solid #ef4444';
            col2Radio.checked = true;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #ef4444; font-weight: 700; font-size: 0.75rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✗ Wrong';
            col2Cell.appendChild(indicator);
          } else if (!isStudentCol2 && isCorrectCol2) {
            // Correct answer not selected - green outline
            col2Cell.style.background = '#f0fdf4';
            col2Cell.style.border = '3px solid #10b981';
            col2Radio.checked = false;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #10b981; font-weight: 700; font-size: 0.75rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✓ Correct';
            col2Cell.appendChild(indicator);
          }
        }

        // Prevent radio changes
        col1Radio.addEventListener('click', (e) => {
          e.preventDefault();
          return false;
        });
        col2Radio.addEventListener('click', (e) => {
          e.preventDefault();
          return false;
        });
      });
    }, 200);

    return container;
  }
};
