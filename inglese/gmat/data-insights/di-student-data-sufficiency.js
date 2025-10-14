// Data Sufficiency Student Renderer
// Interactive version for students taking the test

window.DIStudentDataSufficiency = {
  // Normalize text by removing extra whitespace
  normalizeText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')  // Replace all whitespace (spaces, tabs, newlines) with single space
      .trim();
  },

  render(questionData, questionId, currentAnswer) {
    // Parse questionData if it's a string
    let data = questionData;
    if (typeof questionData === 'string') {
      try {
        data = JSON.parse(questionData);
      } catch (e) {
        console.error('Failed to parse DI question data:', e);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: red; padding: 1rem;';
        errorDiv.textContent = 'Error: Invalid question data format';
        return errorDiv;
      }
    }

    const container = document.createElement('div');
    container.classList.add('di-ds-student-container');
    container.classList.add('tex2jax_ignore');  // Tell MathJax to skip this container

    // Question context (if exists)
    if (data.context) {
      const context = document.createElement('div');
      context.style.cssText = `
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f0f9ff;
        border-left: 4px solid #0ea5e9;
        border-radius: 4px;
        line-height: 1.6;
        font-style: normal;
        word-spacing: normal;
        letter-spacing: normal;
      `;
      const contextTitle = document.createElement('strong');
      contextTitle.textContent = 'Context:';
      context.appendChild(contextTitle);
      context.appendChild(document.createElement('br'));
      const contextText = document.createTextNode(this.normalizeText(data.context));
      context.appendChild(contextText);
      container.appendChild(context);
    }

    // Main question (using 'problem' field from database)
    const questionBox = document.createElement('div');
    questionBox.style.cssText = `
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.6;
      font-style: normal;
      word-spacing: normal;
      letter-spacing: normal;
    `;
    questionBox.textContent = this.normalizeText(data.problem);
    container.appendChild(questionBox);

    // Statements
    const statementsSection = document.createElement('div');
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

    // Statement (1) - using 'statement1' field from database
    const stmt1 = document.createElement('div');
    stmt1.style.cssText = `
      margin-bottom: 1rem;
      padding: 1rem;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      line-height: 1.6;
      font-style: normal;
      word-spacing: normal;
      letter-spacing: normal;
    `;
    const stmt1Title = document.createElement('strong');
    stmt1Title.style.cssText = 'display: block; margin-bottom: 0.5rem; color: #92400e;';
    stmt1Title.textContent = 'Statement (1)';
    stmt1.appendChild(stmt1Title);
    const stmt1Text = document.createTextNode(this.normalizeText(data.statement1));
    stmt1.appendChild(stmt1Text);
    statementsSection.appendChild(stmt1);

    // Statement (2) - using 'statement2' field from database
    const stmt2 = document.createElement('div');
    stmt2.style.cssText = `
      margin-bottom: 1rem;
      padding: 1rem;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      line-height: 1.6;
      font-style: normal;
      word-spacing: normal;
      letter-spacing: normal;
    `;
    const stmt2Title = document.createElement('strong');
    stmt2Title.style.cssText = 'display: block; margin-bottom: 0.5rem; color: #92400e;';
    stmt2Title.textContent = 'Statement (2)';
    stmt2.appendChild(stmt2Title);
    const stmt2Text = document.createTextNode(this.normalizeText(data.statement2));
    stmt2.appendChild(stmt2Text);
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
      const choiceDiv = document.createElement('div');
      choiceDiv.className = 'choice-item';
      choiceDiv.dataset.questionId = questionId;
      choiceDiv.dataset.letter = key;
      choiceDiv.style.cssText = `
        margin-bottom: 0.5rem;
        padding: 0.75rem;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        line-height: 1.6;
        font-style: normal;
        word-spacing: normal;
        letter-spacing: normal;
      `;

      if (currentAnswer === key) {
        choiceDiv.classList.add('selected');
        choiceDiv.style.background = '#dcfce7';
        choiceDiv.style.borderColor = '#10b981';
      }

      const choiceLabel = document.createElement('strong');
      choiceLabel.textContent = `${key}) `;
      choiceDiv.appendChild(choiceLabel);
      const choiceText = document.createTextNode(this.normalizeText(text));
      choiceDiv.appendChild(choiceText);

      choiceDiv.addEventListener('click', () => {
        // Deselect all choices
        choicesSection.querySelectorAll('.choice-item').forEach(c => {
          c.classList.remove('selected');
          c.style.background = 'white';
          c.style.borderColor = '#e5e7eb';
        });

        // Select this choice
        choiceDiv.classList.add('selected');
        choiceDiv.style.background = '#dcfce7';
        choiceDiv.style.borderColor = '#10b981';

        // Trigger answer selection (calls the global selectAnswerBocconi function)
        if (window.selectAnswerBocconi) {
          window.selectAnswerBocconi(questionId, key, choiceDiv, choicesSection);
        }
      });

      choicesSection.appendChild(choiceDiv);
    });

    // Add "Unsure" and "No idea" options
    ['X', 'Y'].forEach(letter => {
      const text = letter === 'X' ? 'Unsure' : 'No idea';
      const choiceDiv = document.createElement('div');
      choiceDiv.className = 'choice-item';
      choiceDiv.dataset.questionId = questionId;
      choiceDiv.dataset.letter = letter;
      choiceDiv.style.cssText = `
        margin-bottom: 0.5rem;
        padding: 0.75rem;
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-style: normal;
        word-spacing: normal;
        letter-spacing: normal;
      `;

      if (currentAnswer === letter) {
        choiceDiv.classList.add('selected');
        choiceDiv.style.background = '#dcfce7';
        choiceDiv.style.borderColor = '#10b981';
      }

      const choiceLabel = document.createElement('strong');
      choiceLabel.textContent = `${letter}) `;
      choiceDiv.appendChild(choiceLabel);
      const choiceText = document.createTextNode(text);
      choiceDiv.appendChild(choiceText);

      choiceDiv.addEventListener('click', () => {
        choicesSection.querySelectorAll('.choice-item').forEach(c => {
          c.classList.remove('selected');
          c.style.background = c.dataset.letter >= 'X' ? '#f9fafb' : 'white';
          c.style.borderColor = '#e5e7eb';
        });

        choiceDiv.classList.add('selected');
        choiceDiv.style.background = '#dcfce7';
        choiceDiv.style.borderColor = '#10b981';

        if (window.selectAnswerBocconi) {
          window.selectAnswerBocconi(questionId, letter, choiceDiv, choicesSection);
        }
      });

      choicesSection.appendChild(choiceDiv);
    });

    container.appendChild(choicesSection);

    return container;
  },

  // View mode for tutors - shows both student answer and correct answer visually
  renderViewMode(questionData, questionId, studentAnswer, correctAnswer) {
    const container = this.render(questionData, questionId, studentAnswer);

    // Find all answer choices and mark them to show student vs correct
    const choicesSection = container.querySelector('.di-answer-choices');
    if (choicesSection) {
      choicesSection.querySelectorAll('.choice-item').forEach(choiceDiv => {
        const letter = choiceDiv.dataset.letter;
        const isStudentAnswer = studentAnswer === letter || studentAnswer?.toUpperCase() === letter;
        const isCorrectAnswer = correctAnswer === letter || correctAnswer?.toUpperCase() === letter;

        // Keep interactive but prevent answer changes
        choiceDiv.style.cursor = 'default';
        const originalOnClick = choiceDiv.onclick;
        choiceDiv.onclick = null; // Remove answer selection

        if (isCorrectAnswer && isStudentAnswer) {
          // Student selected the correct answer - green
          choiceDiv.style.background = '#d1fae5';
          choiceDiv.style.borderColor = '#10b981';
          choiceDiv.style.borderWidth = '3px';
          choiceDiv.innerHTML = `<strong>${letter})</strong> ${choiceDiv.textContent.substring(3)} <span style="color: #10b981; font-weight: bold; margin-left: 0.5rem;">✓ CORRECT</span>`;
        } else if (isCorrectAnswer) {
          // Correct answer (student didn't select) - light green border
          choiceDiv.style.borderColor = '#10b981';
          choiceDiv.style.borderWidth = '3px';
          choiceDiv.style.background = '#f0fdf4';
          choiceDiv.innerHTML = `<strong>${letter})</strong> ${choiceDiv.textContent.substring(3)} <span style="color: #10b981; font-weight: bold; margin-left: 0.5rem;">✓ Correct Answer</span>`;
        } else if (isStudentAnswer) {
          // Student selected wrong answer - red
          choiceDiv.style.background = '#fee2e2';
          choiceDiv.style.borderColor = '#ef4444';
          choiceDiv.style.borderWidth = '3px';
          choiceDiv.innerHTML = `<strong>${letter})</strong> ${choiceDiv.textContent.substring(3)} <span style="color: #ef4444; font-weight: bold; margin-left: 0.5rem;">✗ Your Answer</span>`;
        } else {
          // Not selected
          choiceDiv.style.opacity = '0.5';
        }
      });
    }

    return container;
  }
};
