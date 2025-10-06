// Table Analysis Renderer for Tutor View
// Renders TA questions with sortable tables and True/False statements

window.DITableAnalysisRenderer = {
  render(questionData, studentAnswer, correctAnswer) {
    const container = document.createElement('div');
    container.classList.add('di-ta-container');

    // Table introduction/context
    if (questionData.table_introduction) {
      const intro = document.createElement('div');
      intro.classList.add('di-intro');
      intro.style.cssText = `
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f0f9ff;
        border-left: 4px solid #0ea5e9;
        border-radius: 4px;
      `;
      intro.innerHTML = questionData.table_introduction;
      container.appendChild(intro);
    }

    // Data table
    if (questionData.table_data) {
      const tableContainer = document.createElement('div');
      tableContainer.style.cssText = `
        margin-bottom: 1.5rem;
        overflow-x: auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      `;

      const table = this.createTable(questionData.table_data);
      tableContainer.appendChild(table);
      container.appendChild(tableContainer);
    }

    // Instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      margin-bottom: 1rem;
      padding: 1rem;
      background: #fef3c7;
      border-radius: 6px;
      font-weight: 600;
    `;
    instructions.textContent = 'For each statement, select True or False based on the information in the table.';
    container.appendChild(instructions);

    // Statements with True/False
    const statementsContainer = document.createElement('div');
    statementsContainer.style.cssText = `margin-top: 1.5rem;`;

    questionData.statements.forEach((statement, index) => {
      const stmtDiv = this.createStatementRow(
        statement,
        index,
        studentAnswer?.[`statement_${index + 1}`],
        correctAnswer?.[`statement_${index + 1}`]
      );
      statementsContainer.appendChild(stmtDiv);
    });

    container.appendChild(statementsContainer);

    return container;
  },

  createTable(tableData) {
    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    `;

    // Headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = `background: #1f2937; color: white;`;

    tableData.headers.forEach(header => {
      const th = document.createElement('th');
      th.style.cssText = `
        padding: 0.75rem;
        text-align: left;
        border-bottom: 2px solid #374151;
      `;
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Rows
    const tbody = document.createElement('tbody');
    tableData.rows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.style.cssText = `
        background: ${idx % 2 === 0 ? '#f9fafb' : 'white'};
        border-bottom: 1px solid #e5e7eb;
      `;

      row.forEach(cell => {
        const td = document.createElement('td');
        td.style.cssText = `padding: 0.75rem;`;
        td.textContent = cell;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  },

  createStatementRow(statement, index, studentAnswer, correctAnswer) {
    const div = document.createElement('div');
    div.style.cssText = `
      margin-bottom: 1rem;
      padding: 1rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
    `;

    // Statement text
    const stmtText = document.createElement('div');
    stmtText.style.cssText = `
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: #1f2937;
    `;
    stmtText.innerHTML = `${index + 1}. ${statement}`;
    div.appendChild(stmtText);

    // True/False options
    const optionsDiv = document.createElement('div');
    optionsDiv.style.cssText = `
      display: flex;
      gap: 1rem;
    `;

    ['True', 'False'].forEach(option => {
      const isCorrect = option === correctAnswer;
      const isStudent = option === studentAnswer;

      const optionDiv = document.createElement('div');
      optionDiv.style.cssText = `
        flex: 1;
        padding: 0.75rem;
        text-align: center;
        background: ${isCorrect ? '#dcfce7' : isStudent ? '#fee2e2' : '#f9fafb'};
        border: 2px solid ${isCorrect ? '#10b981' : isStudent ? '#ef4444' : '#e5e7eb'};
        border-radius: 6px;
        font-weight: 600;
      `;

      optionDiv.textContent = option;

      if (isCorrect) {
        optionDiv.textContent += ' ✅';
      } else if (isStudent) {
        optionDiv.textContent += ' ❌';
      }

      optionsDiv.appendChild(optionDiv);
    });

    div.appendChild(optionsDiv);
    return div;
  }
};
