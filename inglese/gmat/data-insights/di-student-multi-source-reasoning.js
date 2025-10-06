// Multi-Source Reasoning Student Renderer
// Interactive version for students taking the test

window.DIStudentMultiSourceReasoning = {
  sortedData: null,
  sortColumn: null,
  sortDirection: 'asc',
  msrAnswers: {}, // Store all sub-question answers: {questionId: {q0: 'a', q1: {...}, q2: 'b'}}
  msrQuestionData: {}, // Store question data for each MSR: {questionId: data}

  render(questionData, questionId, currentAnswer) {
    // Parse questionData if it's a string
    let data = questionData;
    if (typeof questionData === 'string') {
      try {
        data = JSON.parse(questionData);
      } catch (e) {
        console.error('Failed to parse MSR question data:', e);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: red; padding: 1rem;';
        errorDiv.textContent = 'Error: Invalid question data format';
        return errorDiv;
      }
    }

    // Store data for access in event handlers
    this.msrQuestionData[questionId] = data;

    console.log('📊 MSR Question Data:', data);

    const container = document.createElement('div');
    container.classList.add('di-msr-student-container');
    container.classList.add('tex2jax_ignore');  // Tell MathJax to skip this container
    container.style.cssText = `
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    `;

    // LEFT SIDE: Sources panel (fixed)
    const sourcesPanel = document.createElement('div');
    sourcesPanel.style.cssText = `
      flex: 1;
      min-width: 400px;
      max-width: 50%;
    `;

    // Tab navigation for sources
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    `;

    (data.sources || []).forEach((source, si) => {
      const tab = document.createElement('button');
      tab.className = `msr-tab-${questionId}`;
      tab.dataset.tabIndex = si;
      tab.style.cssText = `
        padding: 0.75rem 1.5rem;
        background: ${si === 0 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#f3f4f6'};
        color: ${si === 0 ? 'white' : '#6b7280'};
        border: none;
        ${si === 0 ? 'border-bottom: 3px solid #2563eb;' : ''}
        cursor: pointer;
        font-weight: 600;
        border-radius: 8px 8px 0 0;
        transition: all 0.2s;
      `;
      tab.textContent = `📑 ${source.tab_name}`;

      tab.addEventListener('click', () => {
        this.switchTab(questionId, si, data.sources.length);
      });

      tabsContainer.appendChild(tab);
    });

    sourcesPanel.appendChild(tabsContainer);

    // Sources content
    const sourcesContainer = document.createElement('div');
    sourcesContainer.style.cssText = `position: sticky; top: 1rem;`;

    (data.sources || []).forEach((source, si) => {
      const sourceDiv = document.createElement('div');
      sourceDiv.className = `msr-source-${questionId}`;
      sourceDiv.dataset.sourceIndex = si;
      sourceDiv.style.cssText = `
        display: ${si === 0 ? 'block' : 'none'};
        padding: 1.5rem;
        background: #f9fafb;
        border-radius: 6px;
        min-height: 200px;
        max-height: 600px;
        overflow-y: auto;
        overflow-x: auto;
      `;

      if (source.content_type === 'text') {
        const textContent = document.createElement('div');
        textContent.style.cssText = `
          color: #374151;
          white-space: pre-wrap;
          line-height: 1.8;
        `;
        textContent.textContent = source.content;
        sourceDiv.appendChild(textContent);
      } else if (source.content_type === 'table') {
        const table = this.renderTable(source, si, questionId);
        sourceDiv.appendChild(table);
      }

      sourcesContainer.appendChild(sourceDiv);
    });

    sourcesPanel.appendChild(sourcesContainer);
    container.appendChild(sourcesPanel);

    // RIGHT SIDE: Questions panel (one at a time with navigation)
    const questionsPanel = document.createElement('div');
    questionsPanel.style.cssText = `
      flex: 1;
      min-width: 400px;
    `;

    // Question navigation
    const questionNavigation = document.createElement('div');
    questionNavigation.style.cssText = `
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      align-items: center;
    `;

    const questionTitle = document.createElement('h4');
    questionTitle.style.cssText = `
      margin: 0;
      color: #374151;
      font-weight: 700;
      flex: 1;
    `;
    questionTitle.innerHTML = `Question <span id="msr-current-q-${questionId}">1</span> of ${(data.questions || []).length}`;
    questionNavigation.appendChild(questionTitle);

    if ((data.questions || []).length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.id = `msr-prev-${questionId}`;
      prevBtn.style.cssText = `
        padding: 0.5rem 1rem;
        background: #e5e7eb;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      `;
      prevBtn.textContent = '← Previous';
      prevBtn.addEventListener('click', () => this.navigateQuestion(questionId, -1, data.questions.length));
      questionNavigation.appendChild(prevBtn);

      const nextBtn = document.createElement('button');
      nextBtn.id = `msr-next-${questionId}`;
      nextBtn.style.cssText = `
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      `;
      nextBtn.textContent = 'Next →';
      nextBtn.addEventListener('click', () => this.navigateQuestion(questionId, 1, data.questions.length));
      questionNavigation.appendChild(nextBtn);
    }

    questionsPanel.appendChild(questionNavigation);

    // Questions container (one visible at a time)
    const questionsContainer = document.createElement('div');
    questionsContainer.style.cssText = `
      background: #f3f4f6;
      padding: 1.5rem;
      border-radius: 8px;
    `;

    (data.questions || []).forEach((question, qi) => {
      const questionDiv = this.renderQuestion(question, qi, questionId, currentAnswer);
      questionDiv.className = `msr-question-${questionId}`;
      questionDiv.dataset.questionIndex = qi;
      questionDiv.style.display = qi === 0 ? 'block' : 'none';
      questionsContainer.appendChild(questionDiv);
    });

    questionsPanel.appendChild(questionsContainer);
    container.appendChild(questionsPanel);

    // Store current question index
    if (!this.currentQuestionIndex) this.currentQuestionIndex = {};
    this.currentQuestionIndex[questionId] = 0;

    // Initialize msrAnswers from currentAnswer
    if (currentAnswer) {
      try {
        const parsed = typeof currentAnswer === 'string' ? JSON.parse(currentAnswer) : currentAnswer;
        this.msrAnswers[questionId] = parsed;
      } catch (e) {
        this.msrAnswers[questionId] = {};
      }
    } else {
      this.msrAnswers[questionId] = {};
    }

    // Initialize navigation button states
    setTimeout(() => {
      this.updateNavigationButtons(questionId, 0, data.questions.length);
    }, 0);

    return container;
  },

  switchTab(questionId, tabIndex, totalTabs) {
    // Update tab styles
    document.querySelectorAll(`.msr-tab-${questionId}`).forEach((tab, i) => {
      if (i === tabIndex) {
        tab.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        tab.style.color = 'white';
        tab.style.borderBottom = '3px solid #2563eb';
      } else {
        tab.style.background = '#f3f4f6';
        tab.style.color = '#6b7280';
        tab.style.borderBottom = 'none';
      }
    });

    // Show/hide sources
    document.querySelectorAll(`.msr-source-${questionId}`).forEach((source, i) => {
      source.style.display = i === tabIndex ? 'block' : 'none';
    });
  },

  renderTable(source, sourceIndex, questionId) {
    // Initialize sorted data for this table
    this.sortedData = [...(source.table_data || [])];
    this.sortColumn = null;
    this.sortDirection = 'asc';

    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      background: white;
    `;

    // Headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = 'background: #e5e7eb;';

    (source.table_headers || []).forEach((header, colIndex) => {
      const th = document.createElement('th');
      th.style.cssText = `
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        text-align: left;
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
          <span class="sort-indicator-${questionId}-${sourceIndex}-${colIndex}" style="margin-left: 0.5rem; color: #9ca3af;">⇅</span>
        </div>
      `;

      th.addEventListener('mouseenter', () => {
        th.style.background = '#d1d5db';
      });

      th.addEventListener('mouseleave', () => {
        th.style.background = '#e5e7eb';
      });

      th.addEventListener('click', () => {
        this.sortTable(colIndex, source, tbody, questionId, sourceIndex);
      });

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    tbody.id = `msr-tbody-${questionId}-${sourceIndex}`;
    this.renderTableBody(tbody, this.sortedData);

    table.appendChild(tbody);
    return table;
  },

  renderQuestion(question, questionIndex, questionId, currentAnswer) {
    const qDiv = document.createElement('div');
    qDiv.style.cssText = `
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    `;

    // Question text
    const qText = document.createElement('div');
    qText.style.cssText = `
      font-weight: 600;
      margin-bottom: 1rem;
      color: #1f2937;
      line-height: 1.6;
    `;
    qText.textContent = question.text;
    qDiv.appendChild(qText);

    // Get answer for this specific sub-question
    const subQuestionAnswer = this.msrAnswers[questionId]?.[`q${questionIndex}`];

    if (question.question_type === 'multiple_choice') {
      // Multiple choice format
      const choicesDiv = document.createElement('div');
      choicesDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      `;

      Object.entries(question.options || {}).forEach(([letter, text]) => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'msr-choice-item';
        choiceDiv.dataset.questionId = questionId;
        choiceDiv.dataset.letter = letter;
        choiceDiv.style.cssText = `
          padding: 0.75rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          line-height: 1.6;
        `;

        if (subQuestionAnswer === letter.toLowerCase() || subQuestionAnswer === letter.toUpperCase()) {
          choiceDiv.classList.add('selected');
          choiceDiv.style.background = '#dcfce7';
          choiceDiv.style.borderColor = '#10b981';
        }

        choiceDiv.innerHTML = `<strong>${letter.toUpperCase()})</strong> ${text}`;

        choiceDiv.addEventListener('click', () => {
          // Deselect all
          choicesDiv.querySelectorAll('.msr-choice-item').forEach(c => {
            c.classList.remove('selected');
            c.style.background = 'white';
            c.style.borderColor = '#e5e7eb';
          });

          // Select this one
          choiceDiv.classList.add('selected');
          choiceDiv.style.background = '#dcfce7';
          choiceDiv.style.borderColor = '#10b981';

          // Update answer for this sub-question
          const currentIndex = this.currentQuestionIndex[questionId] || 0;
          if (!this.msrAnswers[questionId]) this.msrAnswers[questionId] = {};
          this.msrAnswers[questionId][`q${currentIndex}`] = letter;

          // Save combined answer
          if (window.selectAnswerBocconi) {
            window.selectAnswerBocconi(questionId, JSON.stringify(this.msrAnswers[questionId]));
          }

          // Update navigation buttons
          const totalQuestions = (this.msrQuestionData[questionId]?.questions || []).length;
          this.updateNavigationButtons(questionId, currentIndex, totalQuestions);
        });

        choicesDiv.appendChild(choiceDiv);
      });

      qDiv.appendChild(choicesDiv);

    } else if (question.question_type === 'two_column') {
      // Two-column format
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
        margin-top: 1rem;
      `;

      // Header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.style.cssText = 'background: #f3f4f6;';

      const thStmt = document.createElement('th');
      thStmt.style.cssText = `
        padding: 0.75rem;
        text-align: left;
        border-bottom: 2px solid #e5e7eb;
        font-weight: 600;
        color: #374151;
        width: 60%;
      `;
      thStmt.textContent = 'Statement';
      headerRow.appendChild(thStmt);

      const thCol1 = document.createElement('th');
      thCol1.style.cssText = `
        padding: 0.75rem;
        text-align: center;
        border-bottom: 2px solid #e5e7eb;
        font-weight: 600;
        color: #374151;
        width: 20%;
      `;
      thCol1.textContent = question.column1_title || 'Yes';
      headerRow.appendChild(thCol1);

      const thCol2 = document.createElement('th');
      thCol2.style.cssText = `
        padding: 0.75rem;
        text-align: center;
        border-bottom: 2px solid #e5e7eb;
        font-weight: 600;
        color: #374151;
        width: 20%;
      `;
      thCol2.textContent = question.column2_title || 'No';
      headerRow.appendChild(thCol2);

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Body
      const tbody = document.createElement('tbody');
      (question.statements || []).forEach((stmt, si) => {
        const tr = document.createElement('tr');
        tr.style.cssText = `background: ${si % 2 === 0 ? 'white' : '#f9fafb'};`;

        const tdStmt = document.createElement('td');
        tdStmt.style.cssText = `
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        `;
        tdStmt.textContent = stmt;
        tr.appendChild(tdStmt);

        const tdCol1 = document.createElement('td');
        tdCol1.style.cssText = `
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
        `;
        const radio1 = document.createElement('input');
        radio1.type = 'radio';
        radio1.name = `msr-stmt-${questionId}-${si}`;  // Group by ROW
        radio1.value = 'col1';
        radio1.style.cssText = 'cursor: pointer; transform: scale(1.2);';
        radio1.checked = subQuestionAnswer?.[`stmt${si}`] === 'col1';
        radio1.addEventListener('change', () => {
          this.updateTwoColumnAnswer(questionId, question.statements);

          // Update navigation buttons
          const currentIndex = this.currentQuestionIndex[questionId] || 0;
          const totalQuestions = (this.msrQuestionData[questionId]?.questions || []).length;
          this.updateNavigationButtons(questionId, currentIndex, totalQuestions);
        });
        tdCol1.appendChild(radio1);
        tr.appendChild(tdCol1);

        const tdCol2 = document.createElement('td');
        tdCol2.style.cssText = `
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
        `;
        const radio2 = document.createElement('input');
        radio2.type = 'radio';
        radio2.name = `msr-stmt-${questionId}-${si}`;  // Group by ROW
        radio2.value = 'col2';
        radio2.style.cssText = 'cursor: pointer; transform: scale(1.2);';
        radio2.checked = subQuestionAnswer?.[`stmt${si}`] === 'col2';
        radio2.addEventListener('change', () => {
          this.updateTwoColumnAnswer(questionId, question.statements);

          // Update navigation buttons
          const currentIndex = this.currentQuestionIndex[questionId] || 0;
          const totalQuestions = (this.msrQuestionData[questionId]?.questions || []).length;
          this.updateNavigationButtons(questionId, currentIndex, totalQuestions);
        });
        tdCol2.appendChild(radio2);
        tr.appendChild(tdCol2);

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      qDiv.appendChild(table);
    }

    return qDiv;
  },

  updateTwoColumnAnswer(questionId, statements) {
    const answer = {};

    // For each statement/row, check which column is selected
    statements.forEach((stmt, si) => {
      const selected = document.querySelector(`input[name="msr-stmt-${questionId}-${si}"]:checked`);
      if (selected) {
        answer[`stmt${si}`] = selected.value; // e.g., {stmt0: 'col1', stmt1: 'col2'}
      }
    });

    // Update answer for this sub-question
    const currentIndex = this.currentQuestionIndex[questionId] || 0;
    if (!this.msrAnswers[questionId]) this.msrAnswers[questionId] = {};
    this.msrAnswers[questionId][`q${currentIndex}`] = answer;

    // Save combined answer
    if (window.selectAnswerBocconi) {
      window.selectAnswerBocconi(questionId, JSON.stringify(this.msrAnswers[questionId]));
    }
  },

  navigateQuestion(questionId, direction, totalQuestions) {
    const currentIndex = this.currentQuestionIndex[questionId] || 0;

    // Check if trying to go forward - must have answered current question
    if (direction > 0 && !this.isQuestionAnswered(questionId, currentIndex)) {
      alert('Please answer the current question before proceeding.');
      return;
    }

    const newIndex = currentIndex + direction;

    // Validate bounds
    if (newIndex < 0 || newIndex >= totalQuestions) return;

    // Hide current question
    document.querySelectorAll(`.msr-question-${questionId}`).forEach((q, i) => {
      q.style.display = i === newIndex ? 'block' : 'none';
    });

    // Update current index
    this.currentQuestionIndex[questionId] = newIndex;

    // Update counter
    const counter = document.getElementById(`msr-current-q-${questionId}`);
    if (counter) counter.textContent = newIndex + 1;

    // Update button states
    this.updateNavigationButtons(questionId, newIndex, totalQuestions);
  },

  isQuestionAnswered(questionId, questionIndex) {
    // Check if the question at questionIndex is answered
    const questionDiv = document.querySelector(`.msr-question-${questionId}[data-question-index="${questionIndex}"]`);
    if (!questionDiv) return false;

    // Check for multiple choice (selected radio/option)
    const selectedChoice = questionDiv.querySelector('.msr-choice-item.selected');
    if (selectedChoice) return true;

    // Check for two-column (ALL statements must be answered)
    const allRadios = questionDiv.querySelectorAll('input[type="radio"]');
    if (allRadios.length > 0) {
      // Count unique radio groups (by name)
      const radioGroups = new Set();
      allRadios.forEach(radio => radioGroups.add(radio.name));

      // Check if each group has a checked radio
      for (const groupName of radioGroups) {
        const checkedInGroup = questionDiv.querySelector(`input[name="${groupName}"]:checked`);
        if (!checkedInGroup) return false; // This group has no selection
      }
      return true; // All groups have selections
    }

    return false;
  },

  updateNavigationButtons(questionId, currentIndex, totalQuestions) {
    const prevBtn = document.getElementById(`msr-prev-${questionId}`);
    const nextBtn = document.getElementById(`msr-next-${questionId}`);

    // Previous button always disabled
    if (prevBtn) {
      prevBtn.disabled = true;
      prevBtn.style.opacity = '0.5';
      prevBtn.style.cursor = 'not-allowed';
    }

    // Next button disabled if last question OR current question not answered
    if (nextBtn) {
      const isLastQuestion = currentIndex === totalQuestions - 1;
      const isAnswered = this.isQuestionAnswered(questionId, currentIndex);

      nextBtn.disabled = isLastQuestion || !isAnswered;
      nextBtn.style.opacity = (isLastQuestion || !isAnswered) ? '0.5' : '1';
      nextBtn.style.cursor = (isLastQuestion || !isAnswered) ? 'not-allowed' : 'pointer';
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
          border: 1px solid #d1d5db;
          color: #1f2937;
        `;
        td.textContent = cell;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  },

  sortTable(colIndex, source, tbody, questionId, sourceIndex) {
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
    (source.table_headers || []).forEach((header, idx) => {
      const indicator = document.querySelector(`.sort-indicator-${questionId}-${sourceIndex}-${idx}`);
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
    console.log('🔍🔍🔍 MSR renderViewMode CALLED');
    console.log('🔍 MSR questionId:', questionId);
    console.log('🔍 MSR studentAnswer:', studentAnswer);
    console.log('🔍 MSR correctAnswer:', correctAnswer);
    console.log('🔍 MSR questionData.questions:', questionData.questions);

    const container = this.render(questionData, questionId, studentAnswer);

    // Keep navigation interactive (tabs, table sorting) but prevent answer changes
    setTimeout(() => {
      console.log('🔍 MSR View Mode TIMEOUT FIRED');

      // Prevent radio/input changes but keep buttons/tabs working
      container.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('click', (e) => {
          e.preventDefault();
          return false;
        });
      });

      // Mark answers for each sub-question
      console.log('🔍 MSR View Mode - studentAnswer:', studentAnswer);
      console.log('🔍 MSR View Mode - correctAnswer:', correctAnswer);

      questionData.questions?.forEach((subQ, idx) => {
        const qKey = `q${idx}`;
        const studentSubAnswer = studentAnswer?.[qKey];
        const correctSubAnswer = correctAnswer?.[qKey];

        console.log(`🔍 MSR ${qKey}: student=${JSON.stringify(studentSubAnswer)}, correct=${JSON.stringify(correctSubAnswer)}`);

        if (subQ.question_type === 'multiple_choice') {
          // Multiple choice - highlight the selected option
          const choiceOptions = container.querySelectorAll(`.msr-choice-item[data-question="${qKey}"]`);
          console.log(`🔍 MSR ${qKey} - Found choice options:`, choiceOptions.length);

          choiceOptions.forEach(choiceDiv => {
            const letter = choiceDiv.dataset.letter;
            const isStudent = studentSubAnswer === letter;
            const isCorrect = correctSubAnswer === letter;

            console.log(`🔍 MSR ${qKey} option ${letter}: isStudent=${isStudent}, isCorrect=${isCorrect}`);

            // Prevent click changes
            choiceDiv.style.cursor = 'default';
            choiceDiv.onclick = null;

            if (isStudent && isCorrect) {
              // Student selected correct answer - green
              choiceDiv.style.background = '#d1fae5';
              choiceDiv.style.borderColor = '#10b981';
              choiceDiv.style.borderWidth = '3px';
              choiceDiv.innerHTML += ' <span style="color: #10b981; font-weight: bold; margin-left: 0.5rem;">✓ CORRECT</span>';
            } else if (isStudent && !isCorrect) {
              // Student selected wrong answer - red
              choiceDiv.style.background = '#fee2e2';
              choiceDiv.style.borderColor = '#ef4444';
              choiceDiv.style.borderWidth = '3px';
              choiceDiv.innerHTML += ' <span style="color: #ef4444; font-weight: bold; margin-left: 0.5rem;">✗ Your Answer</span>';
            } else if (!isStudent && isCorrect) {
              // Correct answer not selected - green outline
              choiceDiv.style.background = '#f0fdf4';
              choiceDiv.style.borderColor = '#10b981';
              choiceDiv.style.borderWidth = '3px';
              choiceDiv.innerHTML += ' <span style="color: #10b981; font-weight: bold; margin-left: 0.5rem;">✓ Correct Answer</span>';
            } else {
              // Not selected, not correct - dim
              choiceDiv.style.opacity = '0.5';
            }
          });
        } else if (subQ.question_type === 'two_column') {
          // Two-column - highlight radio selections
          const statements = container.querySelectorAll(`[data-statement-question="${qKey}"]`);
          statements.forEach(stmtRow => {
            const stmtKey = stmtRow.dataset.statement;
            const studentValue = studentSubAnswer?.[stmtKey];
            const correctValue = correctSubAnswer?.[stmtKey];

            stmtRow.querySelectorAll('.msr-radio-option').forEach(optionDiv => {
              const radioValue = optionDiv.querySelector('input[type="radio"]')?.value;

              if (radioValue === correctValue && radioValue === studentValue) {
                optionDiv.style.background = '#d1fae5';
                optionDiv.style.borderColor = '#10b981';
                optionDiv.style.borderWidth = '3px';
                optionDiv.querySelector('label').innerHTML += ' <span style="color: #10b981; font-weight: bold;">✓</span>';
              } else if (radioValue === correctValue) {
                optionDiv.style.background = '#f0fdf4';
                optionDiv.style.borderColor = '#10b981';
                optionDiv.style.borderWidth = '3px';
                optionDiv.querySelector('label').innerHTML += ' <span style="color: #10b981; font-weight: bold;">✓</span>';
              } else if (radioValue === studentValue) {
                optionDiv.style.background = '#fee2e2';
                optionDiv.style.borderColor = '#ef4444';
                optionDiv.style.borderWidth = '3px';
                optionDiv.querySelector('label').innerHTML += ' <span style="color: #ef4444; font-weight: bold;">✗</span>';
              } else {
                optionDiv.style.opacity = '0.5';
              }
            });
          });
        }
      });
    }, 300);

    return container;
  }
};
