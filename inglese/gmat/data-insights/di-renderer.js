// GMAT Data Insights Question Renderer Module
// Coordinates rendering of all 5 Data Insights question types for view_answers.html

class GMATDataInsightsRenderer {
  constructor() {
    // Use STUDENT renderers so tutor sees exactly what student saw
    this.renderers = {
      'DS': window.DIStudentDataSufficiency,
      'GI': window.DIStudentGraphicsInterpretation,
      'TA': window.DIStudentTableAnalysis,
      'TPA': window.DIStudentTwoPartAnalysis,
      'MSR': window.DIStudentMultiSourceReasoning
    };
  }

  // Main entry point: renders DI question for tutor view
  renderQuestion(questionData, studentAnswer, questionNumber) {
    const { di_question_type, di_question_data, correct_answer } = questionData;

    if (!di_question_type || !di_question_data) {
      console.error('❌ Missing DI question data');
      return this.renderError('Missing question data');
    }

    const renderer = this.renderers[di_question_type];
    if (!renderer) {
      console.error(`❌ No renderer found for type: ${di_question_type}`);
      return this.renderError(`Unsupported question type: ${di_question_type}`);
    }

    // Parse student answer if it's a JSON string (for GI, MSR, TA, TPA)
    let parsedStudentAnswer = studentAnswer;
    if (studentAnswer && typeof studentAnswer === 'string' && studentAnswer.startsWith('{')) {
      try {
        parsedStudentAnswer = JSON.parse(studentAnswer);
      } catch (e) {
        console.warn('⚠️ Failed to parse student answer JSON:', studentAnswer);
      }
    }

    // Parse correct answer - DI questions store correct answers in different places
    let parsedCorrectAnswer = correct_answer;

    if (di_question_type === 'DS' && di_question_data) {
      // DS stores correct answer in di_question_data.correct_answer
      parsedCorrectAnswer = di_question_data.correct_answer || correct_answer;
    } else if (di_question_type === 'GI' && di_question_data) {
      // GI stores in blank1_correct, blank2_correct
      parsedCorrectAnswer = {
        blank1: di_question_data.blank1_correct,
        blank2: di_question_data.blank2_correct
      };
    } else if (di_question_type === 'TA' && di_question_data) {
      // TA stores in di_question_data.correct_answer
      parsedCorrectAnswer = di_question_data.correct_answer || correct_answer;
    } else if (di_question_type === 'TPA' && di_question_data) {
      // TPA stores in di_question_data.correct_answers
      parsedCorrectAnswer = di_question_data.correct_answers || correct_answer;
    } else if (di_question_type === 'MSR' && di_question_data.questions) {
      // MSR: build correct answer from sub-questions
      parsedCorrectAnswer = {};
      di_question_data.questions.forEach((subQ, idx) => {
        if (subQ.question_type === 'multiple_choice' && subQ.correct_answer) {
          parsedCorrectAnswer[`q${idx}`] = subQ.correct_answer;
        } else if (subQ.question_type === 'two_column' && subQ.correct_answers) {
          parsedCorrectAnswer[`q${idx}`] = subQ.correct_answers;
        }
      });
    } else if (correct_answer && typeof correct_answer === 'string' && correct_answer.startsWith('{')) {
      try {
        parsedCorrectAnswer = JSON.parse(correct_answer);
      } catch (e) {
        console.warn('⚠️ Failed to parse correct answer JSON:', correct_answer);
      }
    }

    // Create question container
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question-item', 'di-question');
    questionDiv.classList.add(`di-type-${di_question_type.toLowerCase()}`);
    questionDiv.classList.add('tex2jax_ignore');  // Disable LaTeX/MathJax for DI questions

    // Add answer status classes
    const isCorrect = this.checkAnswer(di_question_type, di_question_data, parsedStudentAnswer, parsedCorrectAnswer);
    if (isCorrect) {
      questionDiv.classList.add('correct');
    } else if (studentAnswer && !['x', 'y', 'z', 'xx'].includes(studentAnswer)) {
      questionDiv.classList.add('wrong');
    } else if (studentAnswer === 'x') {
      questionDiv.classList.add('unsure');
    } else if (studentAnswer === 'y') {
      questionDiv.classList.add('no-idea');
    } else if (studentAnswer === 'z') {
      questionDiv.classList.add('timeout');
    }

    // Question header with status and difficulty
    const difficulty = questionData.GMAT_question_difficulty || '';
    const header = this.renderHeader(questionNumber, studentAnswer, isCorrect, difficulty);
    questionDiv.appendChild(header);

    // Render question content using STUDENT renderer in VIEW MODE
    // If student answer is a special marker (x, y, z, xx), don't pass it to renderViewMode
    // This prevents showing green checkmarks when student didn't actually answer
    const hasActualAnswer = studentAnswer && !['x', 'y', 'z', 'xx'].includes(studentAnswer.toLowerCase());
    const answerToPass = hasActualAnswer ? parsedStudentAnswer : null;

    const content = renderer.renderViewMode
      ? renderer.renderViewMode(di_question_data, questionData.id, answerToPass, parsedCorrectAnswer)
      : renderer.render(di_question_data, questionData.id, answerToPass);
    questionDiv.appendChild(content);

    return questionDiv;
  }

  renderHeader(questionNumber, studentAnswer, isCorrect, difficulty = '') {
    const header = document.createElement('div');
    header.classList.add('answer-header');

    let mark = '';
    if (!studentAnswer || studentAnswer === 'xx') {
      mark = '<span class="skip-mark">⏭️</span>';
    } else if (isCorrect) {
      mark = '<span class="check-mark">✅</span>';
    } else if (studentAnswer && !['x', 'y', 'z', 'xx'].includes(studentAnswer)) {
      mark = '<span class="cross-mark">❌</span>';
    } else if (studentAnswer === 'x') {
      mark = '<span class="unsure-mark">❓</span>';
    } else if (studentAnswer === 'y') {
      mark = '<span class="no-idea-mark">🤷</span>';
    } else if (studentAnswer === 'z') {
      mark = '<span class="timeout-mark">⏱️</span>';
    }

    // Add difficulty badge if present
    const difficultyBadge = difficulty ? `<span class="difficulty-badge difficulty-${difficulty.toLowerCase()}">${difficulty}</span>` : '';

    header.innerHTML = `
      <span>Question ${questionNumber} ${difficultyBadge}</span>
      ${mark}
    `;

    return header;
  }

  renderAnswerSummary(type, questionData, studentAnswer, correctAnswer, isCorrect) {
    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add('di-answer-summary');
    summaryDiv.style.cssText = `
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid ${isCorrect ? '#10b981' : '#ef4444'};
    `;

    const correctDiv = document.createElement('div');
    correctDiv.classList.add('answer-row');
    correctDiv.innerHTML = `
      <strong>Correct answer:</strong>
      <span class="correct-answer">${this.formatAnswer(type, correctAnswer)}</span>
    `;
    summaryDiv.appendChild(correctDiv);

    if (studentAnswer && studentAnswer !== 'xx') {
      const studentDiv = document.createElement('div');
      studentDiv.classList.add('answer-row');
      const answerClass = isCorrect ? 'student-answer correct' : 'student-answer';
      studentDiv.innerHTML = `
        <strong>Student's answer:</strong>
        <span class="${answerClass}">${this.formatAnswer(type, studentAnswer)}</span>
      `;
      summaryDiv.appendChild(studentDiv);
    } else {
      const noAnswerDiv = document.createElement('div');
      noAnswerDiv.classList.add('answer-row');
      noAnswerDiv.innerHTML = `
        <strong>Student's answer:</strong>
        <span class="no-answer">No answer</span>
      `;
      summaryDiv.appendChild(noAnswerDiv);
    }

    return summaryDiv;
  }

  checkAnswer(type, questionData, studentAnswer, correctAnswer) {
    if (!studentAnswer || ['x', 'y', 'z', 'xx'].includes(studentAnswer)) {
      return false;
    }

    // For Graphics Interpretation (GI), compare blank1 and blank2
    if (type === 'GI') {
      try {
        const studentObj = typeof studentAnswer === 'string' ? JSON.parse(studentAnswer) : studentAnswer;
        const correctObj = typeof correctAnswer === 'string' ? JSON.parse(correctAnswer) : correctAnswer;
        return studentObj.blank1 === correctObj.blank1 && studentObj.blank2 === correctObj.blank2;
      } catch (e) {
        return false;
      }
    }

    // For multi-part questions (TPA, TA, MSR), compare JSON objects
    if (type === 'TPA' || type === 'TA' || type === 'MSR') {
      try {
        const studentObj = typeof studentAnswer === 'string' ? JSON.parse(studentAnswer) : studentAnswer;
        const correctObj = typeof correctAnswer === 'string' ? JSON.parse(correctAnswer) : correctAnswer;
        return JSON.stringify(studentObj) === JSON.stringify(correctObj);
      } catch (e) {
        return false;
      }
    }

    // For single-answer questions (DS)
    return String(studentAnswer).toUpperCase() === String(correctAnswer).toUpperCase();
  }

  formatAnswer(type, answer) {
    if (!answer) return 'N/A';

    // For multi-part questions, parse and format nicely
    if (type === 'TPA' || type === 'TA') {
      try {
        const obj = typeof answer === 'string' ? JSON.parse(answer) : answer;
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return answer;
      }
    }

    return answer;
  }

  renderError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('di-error');
    errorDiv.style.cssText = `
      padding: 1.5rem;
      background: #fee;
      border: 2px solid #fcc;
      border-radius: 8px;
      color: #c00;
    `;
    errorDiv.innerHTML = `<strong>⚠️ Error:</strong> ${message}`;
    return errorDiv;
  }
}

// Initialize global instance
window.GMATDataInsightsRenderer = new GMATDataInsightsRenderer();
