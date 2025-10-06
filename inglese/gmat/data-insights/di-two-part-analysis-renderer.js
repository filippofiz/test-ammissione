// Two-Part Analysis Renderer for Tutor View
// Renders TPA questions with two interconnected questions

window.DITwoPartAnalysisRenderer = {
  render(questionData, studentAnswer, correctAnswer) {
    const container = document.createElement('div');
    container.classList.add('di-tpa-container');

    // Introduction/Context
    if (questionData.introduction) {
      const intro = document.createElement('div');
      intro.classList.add('di-intro');
      intro.style.cssText = `
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f0f9ff;
        border-left: 4px solid #0ea5e9;
        border-radius: 4px;
      `;
      intro.innerHTML = questionData.introduction;
      container.appendChild(intro);
    }

    // Question prompts
    const promptsSection = document.createElement('div');
    promptsSection.style.cssText = `
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #fef3c7;
      border-radius: 8px;
    `;

    const part1Label = document.createElement('div');
    part1Label.style.cssText = `
      font-weight: 700;
      color: #92400e;
      margin-bottom: 0.5rem;
    `;
    part1Label.textContent = `Part 1: ${questionData.part_1_prompt}`;
    promptsSection.appendChild(part1Label);

    const part2Label = document.createElement('div');
    part2Label.style.cssText = `
      font-weight: 700;
      color: #92400e;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    `;
    part2Label.textContent = `Part 2: ${questionData.part_2_prompt}`;
    promptsSection.appendChild(part2Label);

    container.appendChild(promptsSection);

    // Answer options table
    const tableContainer = document.createElement('div');
    tableContainer.style.cssText = `
      margin-top: 1.5rem;
      overflow-x: auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const table = this.createAnswerTable(
      questionData.options,
      studentAnswer,
      correctAnswer
    );
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);

    return container;
  },

  createAnswerTable(options, studentAnswer, correctAnswer) {
    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    `;

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = `background: #1f2937; color: white;`;

    ['Option', 'Part 1', 'Part 2'].forEach(header => {
      const th = document.createElement('th');
      th.style.cssText = `
        padding: 0.75rem;
        text-align: center;
        border-bottom: 2px solid #374151;
      `;
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Rows
    const tbody = document.createElement('tbody');

    options.forEach((option, idx) => {
      const tr = document.createElement('tr');
      tr.style.cssText = `
        background: ${idx % 2 === 0 ? '#f9fafb' : 'white'};
        border-bottom: 1px solid #e5e7eb;
      `;

      // Option text
      const tdOption = document.createElement('td');
      tdOption.style.cssText = `padding: 0.75rem;`;
      tdOption.textContent = option;
      tr.appendChild(tdOption);

      // Part 1 column
      const tdPart1 = document.createElement('td');
      tdPart1.style.cssText = `
        padding: 0.75rem;
        text-align: center;
      `;

      const isPart1Correct = option === correctAnswer?.part1;
      const isPart1Student = option === studentAnswer?.part1;

      if (isPart1Correct) {
        tdPart1.innerHTML = '<span style="color: #10b981; font-size: 1.5rem;">✅</span>';
        tdPart1.style.background = '#dcfce7';
      } else if (isPart1Student) {
        tdPart1.innerHTML = '<span style="color: #ef4444; font-size: 1.5rem;">❌</span>';
        tdPart1.style.background = '#fee2e2';
      }

      tr.appendChild(tdPart1);

      // Part 2 column
      const tdPart2 = document.createElement('td');
      tdPart2.style.cssText = `
        padding: 0.75rem;
        text-align: center;
      `;

      const isPart2Correct = option === correctAnswer?.part2;
      const isPart2Student = option === studentAnswer?.part2;

      if (isPart2Correct) {
        tdPart2.innerHTML = '<span style="color: #10b981; font-size: 1.5rem;">✅</span>';
        tdPart2.style.background = '#dcfce7';
      } else if (isPart2Student) {
        tdPart2.innerHTML = '<span style="color: #ef4444; font-size: 1.5rem;">❌</span>';
        tdPart2.style.background = '#fee2e2';
      }

      tr.appendChild(tdPart2);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }
};
