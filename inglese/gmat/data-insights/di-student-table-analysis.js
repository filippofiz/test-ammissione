// Table Analysis Student Renderer
// Interactive version for students taking the test

window.DIStudentTableAnalysis = {
  sortedData: null,
  sortColumn: null,
  sortDirection: 'asc',

  render(questionData, questionId, currentAnswer) {
    // Parse questionData if it's a string
    let data = questionData;
    if (typeof questionData === 'string') {
      try {
        data = JSON.parse(questionData);
      } catch (e) {
        console.error('Failed to parse TA question data:', e);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: red; padding: 1rem;';
        errorDiv.textContent = 'Error: Invalid question data format';
        return errorDiv;
      }
    }

    console.log('📊 TA Question Data:', data);

    // Initialize sorted data
    this.sortedData = [...(data.table_data || [])];
    this.sortColumn = null;
    this.sortDirection = 'asc';

    const container = document.createElement('div');
    container.classList.add('di-ta-student-container');
    container.classList.add('tex2jax_ignore');  // Tell MathJax to skip this container

    // Table title
    if (data.table_title) {
      const title = document.createElement('h4');
      title.style.cssText = `
        margin: 0 0 1rem 0;
        color: #1f2937;
        font-size: 1.15rem;
        font-weight: 700;
      `;
      title.textContent = data.table_title;
      container.appendChild(title);
    }

    // Data table
    const tableContainer = document.createElement('div');
    tableContainer.style.cssText = `
      margin-bottom: 2rem;
      overflow-x: auto;
      background: white;
      border-radius: 8px;
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

    (data.column_headers || []).forEach((header, colIndex) => {
      const th = document.createElement('th');
      th.style.cssText = `
        padding: 0.75rem;
        text-align: left;
        border: 1px solid #e5e7eb;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
        user-select: none;
        position: relative;
        transition: background 0.2s;
      `;

      th.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span>${header}</span>
          <span class="sort-indicator-${questionId}-${colIndex}" style="margin-left: 0.5rem; color: #9ca3af;">⇅</span>
        </div>
      `;

      th.addEventListener('mouseenter', () => {
        th.style.background = '#e5e7eb';
      });

      th.addEventListener('mouseleave', () => {
        th.style.background = '#f3f4f6';
      });

      th.addEventListener('click', () => {
        this.sortTable(colIndex, data, tbody, questionId);
      });

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    tbody.id = `ta-tbody-${questionId}`;
    this.renderTableBody(tbody, this.sortedData);

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);

    // Statements section
    const statementsTitle = document.createElement('h4');
    statementsTitle.style.cssText = `
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.1rem;
      font-weight: 700;
    `;
    statementsTitle.textContent = 'For each statement, select the appropriate answer:';
    container.appendChild(statementsTitle);

    // Statements table
    const statementsTable = document.createElement('table');
    statementsTable.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const stmtThead = document.createElement('thead');
    const stmtHeaderRow = document.createElement('tr');
    stmtHeaderRow.style.cssText = 'background: #f3f4f6;';

    // Statement column
    const thStmt = document.createElement('th');
    thStmt.style.cssText = `
      padding: 0.75rem;
      text-align: left;
      border: 1px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
      width: 60%;
    `;
    thStmt.textContent = data.statement_column_title || 'Statement';
    stmtHeaderRow.appendChild(thStmt);

    // Column 1 header
    const thCol1 = document.createElement('th');
    thCol1.style.cssText = `
      padding: 0.75rem;
      text-align: center;
      border: 1px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
      width: 20%;
    `;
    thCol1.textContent = data.answer_col1_title || 'Yes';
    stmtHeaderRow.appendChild(thCol1);

    // Column 2 header
    const thCol2 = document.createElement('th');
    thCol2.style.cssText = `
      padding: 0.75rem;
      text-align: center;
      border: 1px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
      width: 20%;
    `;
    thCol2.textContent = data.answer_col2_title || 'No';
    stmtHeaderRow.appendChild(thCol2);

    stmtThead.appendChild(stmtHeaderRow);
    statementsTable.appendChild(stmtThead);

    // Statements body
    const stmtTbody = document.createElement('tbody');
    (data.statements || []).forEach((statement, si) => {
      const tr = document.createElement('tr');
      tr.style.cssText = `background: ${si % 2 === 0 ? 'white' : '#f9fafb'};`;

      // Statement text
      const tdStmt = document.createElement('td');
      tdStmt.style.cssText = `
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        color: #1f2937;
        line-height: 1.6;
      `;
      tdStmt.textContent = statement.text || statement;
      tr.appendChild(tdStmt);

      // Column 1 radio - grouped by ROW so each row selects one column
      const tdCol1 = document.createElement('td');
      tdCol1.style.cssText = `
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        text-align: center;
      `;
      const radio1 = document.createElement('input');
      radio1.type = 'radio';
      radio1.name = `ta-stmt-${questionId}-${si}`; // Group by ROW
      radio1.value = 'col1';
      radio1.style.cssText = 'cursor: pointer; transform: scale(1.3);';
      radio1.checked = currentAnswer?.[`stmt${si}`] === 'col1';
      radio1.addEventListener('change', () => {
        this.updateAnswer(questionId, data.statements);
      });
      tdCol1.appendChild(radio1);
      tr.appendChild(tdCol1);

      // Column 2 radio - grouped by ROW so each row selects one column
      const tdCol2 = document.createElement('td');
      tdCol2.style.cssText = `
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        text-align: center;
      `;
      const radio2 = document.createElement('input');
      radio2.type = 'radio';
      radio2.name = `ta-stmt-${questionId}-${si}`; // Group by ROW
      radio2.value = 'col2';
      radio2.style.cssText = 'cursor: pointer; transform: scale(1.3);';
      radio2.checked = currentAnswer?.[`stmt${si}`] === 'col2';
      radio2.addEventListener('change', () => {
        this.updateAnswer(questionId, data.statements);
      });
      tdCol2.appendChild(radio2);
      tr.appendChild(tdCol2);

      stmtTbody.appendChild(tr);
    });

    statementsTable.appendChild(stmtTbody);
    container.appendChild(statementsTable);

    return container;
  },

  updateAnswer(questionId, statements) {
    const answer = {};

    // For each statement/row, check which column is selected
    statements.forEach((stmt, si) => {
      const selected = document.querySelector(`input[name="ta-stmt-${questionId}-${si}"]:checked`);
      if (selected) {
        answer[`stmt${si}`] = selected.value; // e.g., {stmt0: 'col1', stmt1: 'col2'}
      }
    });

    // Call global answer selection function
    if (window.selectAnswerBocconi) {
      window.selectAnswerBocconi(questionId, JSON.stringify(answer));
    }
  },

  renderTableBody(tbody, data) {
    tbody.innerHTML = '';
    data.forEach((row, ri) => {
      const tr = document.createElement('tr');
      tr.style.cssText = `background: ${ri % 2 === 0 ? 'white' : '#f9fafb'};`;

      row.forEach(cell => {
        const td = document.createElement('td');
        td.style.cssText = `
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          color: #1f2937;
        `;
        td.textContent = cell;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  },

  sortTable(colIndex, data, tbody, questionId) {
    // Toggle sort direction if clicking same column
    if (this.sortColumn === colIndex) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = colIndex;
      this.sortDirection = 'asc';
    }

    // Sort the data
    this.sortedData.sort((a, b) => {
      const aVal = a[colIndex];
      const bVal = b[colIndex];

      // Try to parse as numbers
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      let comparison = 0;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Numeric comparison
        comparison = aNum - bNum;
      } else {
        // String comparison
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    // Update sort indicators
    (data.column_headers || []).forEach((header, idx) => {
      const indicator = document.querySelector(`.sort-indicator-${questionId}-${idx}`);
      if (indicator) {
        if (idx === colIndex) {
          indicator.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
          indicator.style.color = '#3b82f6';
        } else {
          indicator.textContent = '⇅';
          indicator.style.color = '#9ca3af';
        }
      }
    });

    // Re-render table body
    this.renderTableBody(tbody, this.sortedData);
  },

  // View mode for tutors - shows both student answer and correct answer visually
  renderViewMode(questionData, questionId, studentAnswer, correctAnswer) {
    console.log('🔍🔍🔍 TA renderViewMode CALLED');
    console.log('🔍 questionData:', questionData);
    console.log('🔍 questionId:', questionId);
    console.log('🔍 studentAnswer:', studentAnswer);
    console.log('🔍 correctAnswer:', correctAnswer);

    const container = this.render(questionData, questionId, studentAnswer);

    // Keep table sorting interactive - do NOT disable
    // Find statement table rows and mark them to show student vs correct
    setTimeout(() => {
      console.log('🔍 TA View Mode TIMEOUT - studentAnswer:', studentAnswer);
      console.log('🔍 TA View Mode TIMEOUT - correctAnswer:', correctAnswer);

      // Find ALL tables in the container
      const tables = container.querySelectorAll('table');
      console.log('🔍 TA Found tables:', tables.length);

      // Try both tables to find which one has radio buttons
      let stmtTable = null;
      let stmtRows = null;

      for (let i = 0; i < tables.length; i++) {
        const testRows = tables[i].querySelectorAll('tbody tr');
        if (testRows.length > 0) {
          const testRadio = testRows[0].querySelector('input[type="radio"]');
          if (testRadio) {
            console.log(`🔍 TA Found statements table at index ${i}`);
            stmtTable = tables[i];
            stmtRows = testRows;
            break;
          }
        }
      }

      if (!stmtTable || !stmtRows) {
        console.log('🔍 TA ERROR: No statements table with radio buttons found');
        return;
      }

      console.log('🔍 TA Found stmtRows:', stmtRows.length);

      stmtRows.forEach((tr, si) => {
        const stmtKey = `stmt${si}`;
        const studentValue = studentAnswer?.[stmtKey];
        const correctValue = correctAnswer?.[stmtKey];

        console.log(`🔍 TA Row ${si} - ${stmtKey}: student="${studentValue}", correct="${correctValue}"`);

        // Find both radio cells
        const col1Cell = tr.querySelector('td:nth-child(2)');
        const col2Cell = tr.querySelector('td:nth-child(3)');

        console.log(`🔍 TA Row ${si} - Found col1Cell:`, !!col1Cell, 'col2Cell:', !!col2Cell);

        const radio1 = col1Cell?.querySelector('input[type="radio"]');
        const radio2 = col2Cell?.querySelector('input[type="radio"]');

        console.log(`🔍 TA Row ${si} - Found radio1:`, !!radio1, 'radio2:', !!radio2);

        // Mark col1 radio
        if (col1Cell && radio1) {
          const isStudentAnswer = studentValue === 'col1';
          const isCorrectAnswer = correctValue === 'col1';

          console.log(`🔍 TA Row ${si} Col1 - isStudentAnswer:`, isStudentAnswer, 'isCorrectAnswer:', isCorrectAnswer);

          // Remove existing indicators
          const existingIndicator = col1Cell.querySelector('.answer-indicator');
          if (existingIndicator) existingIndicator.remove();

          if (isStudentAnswer && isCorrectAnswer) {
            // Student selected correct - green
            console.log(`🔍 TA Row ${si} Col1 - Applying CORRECT style (green)`);
            col1Cell.style.background = '#d1fae5';
            col1Cell.style.border = '3px solid #10b981';
            radio1.checked = true;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #10b981; font-weight: 700; font-size: 0.85rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✓ CORRECT';
            col1Cell.appendChild(indicator);
          } else if (isStudentAnswer && !isCorrectAnswer) {
            // Student selected wrong - red
            console.log(`🔍 TA Row ${si} Col1 - Applying WRONG style (red)`);
            col1Cell.style.background = '#fee2e2';
            col1Cell.style.border = '3px solid #ef4444';
            radio1.checked = true;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #ef4444; font-weight: 700; font-size: 0.85rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✗ Wrong';
            col1Cell.appendChild(indicator);
          } else if (!isStudentAnswer && isCorrectAnswer) {
            // Correct answer not selected - green outline
            console.log(`🔍 TA Row ${si} Col1 - Applying CORRECT ANSWER style (light green)`);
            col1Cell.style.background = '#f0fdf4';
            col1Cell.style.border = '3px solid #10b981';
            radio1.checked = false;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #10b981; font-weight: 700; font-size: 0.85rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✓ Correct';
            col1Cell.appendChild(indicator);
          } else {
            console.log(`🔍 TA Row ${si} Col1 - No styling applied`);
          }

          // Prevent changes
          radio1.addEventListener('click', (e) => {
            e.preventDefault();
            return false;
          });
        }

        // Mark col2 radio
        if (col2Cell && radio2) {
          const isStudentAnswer = studentValue === 'col2';
          const isCorrectAnswer = correctValue === 'col2';

          // Remove existing indicators
          const existingIndicator = col2Cell.querySelector('.answer-indicator');
          if (existingIndicator) existingIndicator.remove();

          if (isStudentAnswer && isCorrectAnswer) {
            // Student selected correct - green
            col2Cell.style.background = '#d1fae5';
            col2Cell.style.border = '3px solid #10b981';
            radio2.checked = true;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #10b981; font-weight: 700; font-size: 0.85rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✓ CORRECT';
            col2Cell.appendChild(indicator);
          } else if (isStudentAnswer && !isCorrectAnswer) {
            // Student selected wrong - red
            col2Cell.style.background = '#fee2e2';
            col2Cell.style.border = '3px solid #ef4444';
            radio2.checked = true;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #ef4444; font-weight: 700; font-size: 0.85rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✗ Wrong';
            col2Cell.appendChild(indicator);
          } else if (!isStudentAnswer && isCorrectAnswer) {
            // Correct answer not selected - green outline
            col2Cell.style.background = '#f0fdf4';
            col2Cell.style.border = '3px solid #10b981';
            radio2.checked = false;
            const indicator = document.createElement('div');
            indicator.className = 'answer-indicator';
            indicator.style.cssText = 'color: #10b981; font-weight: 700; font-size: 0.85rem; text-align: center; margin-top: 0.5rem;';
            indicator.textContent = '✓ Correct';
            col2Cell.appendChild(indicator);
          }

          // Prevent changes
          radio2.addEventListener('click', (e) => {
            e.preventDefault();
            return false;
          });
        }
      });
    }, 200);

    return container;
  }
};
