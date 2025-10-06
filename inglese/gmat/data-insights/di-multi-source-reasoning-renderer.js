// Multi-Source Reasoning Renderer for Tutor View
// Renders MSR questions with multiple tabs and related questions

window.DIMultiSourceReasoningRenderer = {
  render(questionData, studentAnswer, correctAnswer) {
    const container = document.createElement('div');
    container.classList.add('di-msr-container');

    // Sources (Tabs) - render all sources visible for tutor
    const sourcesContainer = document.createElement('div');
    sourcesContainer.style.cssText = `
      margin-bottom: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1rem;
    `;

    questionData.sources.forEach((source, index) => {
      const sourceDiv = document.createElement('div');
      sourceDiv.style.cssText = `
        margin-bottom: ${index < questionData.sources.length - 1 ? '1.5rem' : '0'};
        padding: 1rem;
        background: #f0f9ff;
        border-left: 4px solid #0ea5e9;
        border-radius: 4px;
      `;

      const sourceTitle = document.createElement('div');
      sourceTitle.style.cssText = `
        font-weight: 700;
        font-size: 1.1rem;
        margin-bottom: 0.75rem;
        color: #0369a1;
      `;
      sourceTitle.textContent = `📑 ${source.tab_title}`;
      sourceDiv.appendChild(sourceTitle);

      const sourceContent = document.createElement('div');
      sourceContent.innerHTML = source.content;
      sourceDiv.appendChild(sourceContent);

      // If source has an image
      if (source.image_url) {
        const img = document.createElement('img');
        img.src = source.image_url;
        img.alt = source.tab_title;
        img.style.cssText = `
          max-width: 100%;
          height: auto;
          margin-top: 1rem;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        sourceDiv.appendChild(img);
      }

      sourcesContainer.appendChild(sourceDiv);
    });

    container.appendChild(sourcesContainer);

    // Questions
    const questionsContainer = document.createElement('div');
    questionsContainer.style.cssText = `margin-top: 2rem;`;

    questionData.questions.forEach((question, qIndex) => {
      const questionDiv = document.createElement('div');
      questionDiv.style.cssText = `
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
      `;

      // Question text
      const questionText = document.createElement('div');
      questionText.style.cssText = `
        font-weight: 600;
        font-size: 1.05rem;
        margin-bottom: 1rem;
        color: #1f2937;
      `;
      questionText.innerHTML = `${qIndex + 1}. ${question.question_text}`;
      questionDiv.appendChild(questionText);

      // Answer choices
      const choicesContainer = document.createElement('div');
      choicesContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      `;

      ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
        const optionKey = `option_${letter.toLowerCase()}`;
        if (question[optionKey]) {
          const choice = this.createAnswerChoice(
            letter,
            question[optionKey],
            question.correct_answer,
            studentAnswer?.[`question_${qIndex + 1}`]
          );
          choicesContainer.appendChild(choice);
        }
      });

      questionDiv.appendChild(choicesContainer);
      questionsContainer.appendChild(questionDiv);
    });

    container.appendChild(questionsContainer);

    return container;
  },

  createAnswerChoice(letter, text, correctAnswer, studentAnswer) {
    const isCorrect = letter === correctAnswer;
    const isStudent = letter === studentAnswer && !['x', 'y', 'z', 'xx'].includes(studentAnswer);

    const div = document.createElement('div');
    div.style.cssText = `
      padding: 0.75rem;
      background: ${isCorrect ? '#dcfce7' : isStudent ? '#fee2e2' : '#f9fafb'};
      border: 2px solid ${isCorrect ? '#10b981' : isStudent ? '#ef4444' : '#e5e7eb'};
      border-radius: 6px;
      display: flex;
      align-items: start;
      gap: 0.75rem;
    `;

    if (isCorrect || isStudent) {
      const icon = document.createElement('span');
      icon.style.cssText = `font-size: 1.2rem;`;
      icon.textContent = isCorrect ? '✅' : '❌';
      div.appendChild(icon);
    }

    const content = document.createElement('div');
    content.innerHTML = `<strong>${letter})</strong> ${text}`;
    div.appendChild(content);

    return div;
  }
};
