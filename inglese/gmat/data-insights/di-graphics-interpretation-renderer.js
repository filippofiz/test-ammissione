// Graphics Interpretation Renderer for Tutor View
// Renders GI questions with graphs/charts and dropdown completions

window.DIGraphicsInterpretationRenderer = {
  render(questionData, studentAnswer, correctAnswer) {
    const container = document.createElement('div');
    container.classList.add('di-gi-container');

    // Graph/Chart image
    if (questionData.graph_url) {
      const graphContainer = document.createElement('div');
      graphContainer.style.cssText = `
        margin-bottom: 1.5rem;
        text-align: center;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;
      `;

      const img = document.createElement('img');
      img.src = questionData.graph_url;
      img.alt = 'Graph/Chart';
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      `;

      graphContainer.appendChild(img);
      container.appendChild(graphContainer);
    }

    // Graph description/context
    if (questionData.graph_description) {
      const description = document.createElement('div');
      description.classList.add('di-description');
      description.style.cssText = `
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f0f9ff;
        border-left: 4px solid #0ea5e9;
        border-radius: 4px;
      `;
      description.innerHTML = questionData.graph_description;
      container.appendChild(description);
    }

    // Statement with dropdowns
    const statementDiv = document.createElement('div');
    statementDiv.classList.add('di-statement');
    statementDiv.style.cssText = `
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1.05rem;
      line-height: 1.8;
    `;
    statementDiv.innerHTML = questionData.statement_text;
    container.appendChild(statementDiv);

    // Dropdown 1
    const dropdown1 = this.createDropdownSection('Dropdown 1', questionData.dropdown_1_options, studentAnswer?.dropdown1, correctAnswer?.dropdown1);
    container.appendChild(dropdown1);

    // Dropdown 2
    const dropdown2 = this.createDropdownSection('Dropdown 2', questionData.dropdown_2_options, studentAnswer?.dropdown2, correctAnswer?.dropdown2);
    container.appendChild(dropdown2);

    return container;
  },

  createDropdownSection(label, options, studentAnswer, correctAnswer) {
    const section = document.createElement('div');
    section.style.cssText = `margin-bottom: 1rem;`;

    const title = document.createElement('div');
    title.style.cssText = `
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #1f2937;
    `;
    title.textContent = label + ':';
    section.appendChild(title);

    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    `;

    options.forEach(option => {
      const isCorrect = option === correctAnswer;
      const isStudent = option === studentAnswer;

      const optionDiv = document.createElement('div');
      optionDiv.style.cssText = `
        padding: 0.75rem;
        background: ${isCorrect ? '#dcfce7' : isStudent ? '#fee2e2' : '#f9fafb'};
        border: 2px solid ${isCorrect ? '#10b981' : isStudent ? '#ef4444' : '#e5e7eb'};
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      `;

      if (isCorrect) {
        const checkmark = document.createElement('span');
        checkmark.textContent = '✅';
        optionDiv.appendChild(checkmark);
      } else if (isStudent) {
        const cross = document.createElement('span');
        cross.textContent = '❌';
        optionDiv.appendChild(cross);
      }

      const text = document.createElement('span');
      text.textContent = option;
      optionDiv.appendChild(text);

      optionsContainer.appendChild(optionDiv);
    });

    section.appendChild(optionsContainer);
    return section;
  }
};
