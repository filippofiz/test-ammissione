// Data Sufficiency Renderer for Tutor View
// Renders DS questions with statements and answer choices

window.DIDataSufficiencyRenderer = {
  render(questionData, studentAnswer, correctAnswer) {
    // Parse questionData if it's a string
    let data = questionData;
    if (typeof questionData === 'string') {
      try {
        data = JSON.parse(questionData);
      } catch (e) {
        console.error('Failed to parse DI question data:', e);
        return this.renderError('Invalid question data format');
      }
    }

    const container = document.createElement('div');
    container.classList.add('di-ds-container');

    // Question context (if exists)
    if (data.context) {
      const context = document.createElement('div');
      context.classList.add('di-context');
      context.style.cssText = `
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f0f9ff;
        border-left: 4px solid #0ea5e9;
        border-radius: 4px;
        line-height: 1.6;
        white-space: pre-wrap;
      `;
      context.innerHTML = `<strong>Context:</strong><br>${data.context}`;
      container.appendChild(context);
    }

    // Main question (using 'problem' field)
    const questionBox = document.createElement('div');
    questionBox.classList.add('di-question-box');
    questionBox.style.cssText = `
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.6;
      white-space: pre-wrap;
    `;
    questionBox.innerHTML = data.problem || '';
    container.appendChild(questionBox);

    // Statements section
    const statementsSection = document.createElement('div');
    statementsSection.classList.add('di-statements-section');
    statementsSection.style.cssText = `margin: 1.5rem 0;`;

    const statementsTitle = document.createElement('div');
    statementsTitle.style.cssText = `
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: #1f2937;
    `;
    statementsTitle.textContent = 'Given Information:';
    statementsSection.appendChild(statementsTitle);

    // Statement (1) - using 'statement1' field
    const stmt1 = this.createStatement('(1)', data.statement1);
    statementsSection.appendChild(stmt1);

    // Statement (2) - using 'statement2' field
    const stmt2 = this.createStatement('(2)', data.statement2);
    statementsSection.appendChild(stmt2);

    container.appendChild(statementsSection);

    // Answer choices
    const choicesSection = document.createElement('div');
    choicesSection.classList.add('di-answer-choices');
    choicesSection.style.cssText = `margin-top: 1.5rem;`;

    const choicesTitle = document.createElement('div');
    choicesTitle.style.cssText = `
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: #1f2937;
    `;
    choicesTitle.textContent = 'Select your answer:';
    choicesSection.appendChild(choicesTitle);

    Object.entries(data.answer_choices || {}).forEach(([key, text]) => {
      const choice = this.createAnswerChoice(key, text, correctAnswer, studentAnswer);
      choicesSection.appendChild(choice);
    });

    container.appendChild(choicesSection);

    // Explanation if available
    if (data.explanation) {
      const explanation = document.createElement('div');
      explanation.classList.add('di-explanation');
      explanation.style.cssText = `
        margin-top: 1.5rem;
        padding: 1rem;
        background: #f0fdf4;
        border-left: 4px solid #10b981;
        border-radius: 4px;
      `;
      explanation.innerHTML = `<strong>💡 Explanation:</strong><br>${data.explanation}`;
      container.appendChild(explanation);
    }

    return container;
  },

  renderError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      padding: 1.5rem;
      background: #fee;
      border: 2px solid #fcc;
      border-radius: 8px;
      color: #c00;
    `;
    errorDiv.innerHTML = `<strong>⚠️ Error:</strong> ${message}`;
    return errorDiv;
  },

  createStatement(label, text) {
    const div = document.createElement('div');
    div.style.cssText = `
      margin-bottom: 1rem;
      padding: 1rem;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      line-height: 1.6;
      white-space: pre-wrap;
    `;

    const labelSpan = document.createElement('strong');
    labelSpan.style.cssText = `
      display: block;
      margin-bottom: 0.5rem;
      color: #92400e;
      font-size: 1.05rem;
    `;
    labelSpan.textContent = `Statement ${label}`;
    div.appendChild(labelSpan);

    const textDiv = document.createElement('div');
    textDiv.innerHTML = text;
    div.appendChild(textDiv);

    return div;
  },

  createAnswerChoice(key, text, correctAnswer, studentAnswer) {
    const isCorrect = key === correctAnswer;
    const isStudent = key === studentAnswer && !['x', 'y', 'z', 'xx'].includes(studentAnswer);

    const div = document.createElement('div');
    div.style.cssText = `
      margin-bottom: 0.5rem;
      padding: 0.75rem;
      background: ${isCorrect ? '#dcfce7' : isStudent ? '#fee2e2' : '#f9fafb'};
      border: 2px solid ${isCorrect ? '#10b981' : isStudent ? '#ef4444' : '#e5e7eb'};
      border-radius: 6px;
      display: flex;
      align-items: start;
      gap: 0.75rem;
      line-height: 1.6;
      white-space: pre-wrap;
    `;

    const icon = document.createElement('span');
    icon.style.cssText = `font-size: 1.2rem;`;
    if (isCorrect) {
      icon.textContent = '✅';
    } else if (isStudent) {
      icon.textContent = '❌';
    }

    const content = document.createElement('div');
    content.innerHTML = `<strong>${key})</strong> ${text}`;

    if (icon.textContent) {
      div.appendChild(icon);
    }
    div.appendChild(content);

    return div;
  }
};
