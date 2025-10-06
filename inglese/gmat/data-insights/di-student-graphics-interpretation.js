// Graphics Interpretation Student Renderer
// Interactive version for students taking the test

window.DIStudentGraphicsInterpretation = {
  render(questionData, questionId, currentAnswer) {
    // Parse questionData if it's a string
    let data = questionData;
    if (typeof questionData === 'string') {
      try {
        data = JSON.parse(questionData);
      } catch (e) {
        console.error('Failed to parse GI question data:', e);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: red; padding: 1rem;';
        errorDiv.textContent = 'Error: Invalid question data format';
        return errorDiv;
      }
    }

    console.log('📊 GI Question Data:', data);

    const container = document.createElement('div');
    container.classList.add('di-gi-student-container');
    container.classList.add('tex2jax_ignore');  // Tell MathJax to skip this container

    // Context text
    if (data.context_text) {
      const context = document.createElement('div');
      context.style.cssText = `
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f0f9ff;
        border-left: 4px solid #0ea5e9;
        border-radius: 4px;
        line-height: 1.6;
        white-space: pre-wrap;
      `;
      context.innerHTML = `<strong>Context:</strong><br>${data.context_text}`;
      container.appendChild(context);
    }

    // Chart rendering
    if (data.chart_config) {
      const chartContainer = document.createElement('div');
      chartContainer.style.cssText = `
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        position: relative;
        height: 400px;
      `;

      const canvasWrapper = document.createElement('div');
      canvasWrapper.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
      `;

      const canvas = document.createElement('canvas');
      canvas.id = `gi-chart-${questionId}`;
      canvasWrapper.appendChild(canvas);
      chartContainer.appendChild(canvasWrapper);
      container.appendChild(chartContainer);

      // Render chart after DOM insertion and Chart.js load
      // Use requestAnimationFrame to wait for DOM to settle
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (window.Chart) {
            this.renderChart(canvas, data.chart_config);
          } else {
            console.warn('Chart.js not loaded yet, retrying...');
            setTimeout(() => {
              this.renderChart(canvas, data.chart_config);
            }, 500);
          }
        }, 100);
      });
    }

    // Statement with dropdowns
    if (data.statement_text) {
      const statementDiv = document.createElement('div');
      statementDiv.style.cssText = `
        margin-bottom: 1.5rem;
        padding: 1.5rem;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1.05rem;
        line-height: 1.8;
      `;

      // Replace [BLANK1] and [BLANK2] with dropdowns
      let statementHTML = data.statement_text.replace(/\[BLANK1\]/g, `
        <select id="blank1-${questionId}" class="gi-dropdown" data-blank="1" data-question-id="${questionId}" style="
          padding: 0.5rem;
          border: 2px solid #3b82f6;
          border-radius: 4px;
          font-size: 1rem;
          background: #eff6ff;
          cursor: pointer;
          margin: 0 0.25rem;
        ">
          <option value="">Select...</option>
          ${data.blank1_options.map(opt => `<option value="${opt}" ${currentAnswer?.blank1 === opt ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      `);

      statementHTML = statementHTML.replace(/\[BLANK2\]/g, `
        <select id="blank2-${questionId}" class="gi-dropdown" data-blank="2" data-question-id="${questionId}" style="
          padding: 0.5rem;
          border: 2px solid #3b82f6;
          border-radius: 4px;
          font-size: 1rem;
          background: #eff6ff;
          cursor: pointer;
          margin: 0 0.25rem;
        ">
          <option value="">Select...</option>
          ${data.blank2_options.map(opt => `<option value="${opt}" ${currentAnswer?.blank2 === opt ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      `);

      statementDiv.innerHTML = statementHTML;
      container.appendChild(statementDiv);

      // Add change listeners to dropdowns
      setTimeout(() => {
        const blank1 = document.getElementById(`blank1-${questionId}`);
        const blank2 = document.getElementById(`blank2-${questionId}`);

        if (blank1) {
          blank1.addEventListener('change', () => {
            this.updateAnswer(questionId);
          });
        }

        if (blank2) {
          blank2.addEventListener('change', () => {
            this.updateAnswer(questionId);
          });
        }
      }, 100);
    }

    return container;
  },

  updateAnswer(questionId) {
    const blank1 = document.getElementById(`blank1-${questionId}`);
    const blank2 = document.getElementById(`blank2-${questionId}`);

    const answer = {
      blank1: blank1?.value || '',
      blank2: blank2?.value || ''
    };

    // Call global answer selection function
    if (window.selectAnswerBocconi) {
      window.selectAnswerBocconi(questionId, JSON.stringify(answer));
    }
  },

  renderChart(canvas, chartConfig) {
    if (!window.Chart) {
      console.error('Chart.js not loaded');
      const parent = canvas.parentElement;
      if (parent) {
        parent.innerHTML = '<div style="color: red; padding: 1rem; text-align: center;">⚠️ Chart library not loaded. Please refresh the page.</div>';
      }
      return;
    }

    // Check if chart already exists on this canvas
    if (canvas.chart) {
      console.log('📊 Chart already exists, destroying old chart');
      canvas.chart.destroy();
    }

    try {
      const ctx = canvas.getContext('2d');
      console.log('📊 Rendering chart with config:', chartConfig);

      canvas.chart = new Chart(ctx, {
        type: chartConfig.type,
        data: {
          labels: chartConfig.labels || chartConfig.datasets[0]?.data.map((d, i) => i) || [],
          datasets: chartConfig.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.color,
            borderColor: ds.color,
            borderWidth: 2,
            tension: 0.4
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: !!chartConfig.title,
              text: chartConfig.title || '',
              font: { size: 16, weight: 'bold' }
            }
          },
          scales: {
            x: {
              title: {
                display: !!chartConfig.x_axis_label,
                text: chartConfig.x_axis_label || ''
              }
            },
            y: {
              title: {
                display: !!chartConfig.y_axis_label,
                text: chartConfig.y_axis_label || ''
              }
            }
          }
        }
      });

      console.log('✅ Chart rendered successfully');
    } catch (error) {
      console.error('❌ Error rendering chart:', error);
      const parent = canvas.parentElement;
      if (parent) {
        parent.innerHTML = `<div style="color: red; padding: 1rem; text-align: center;">⚠️ Error rendering chart: ${error.message}</div>`;
      }
    }
  },

  // View mode for tutors - shows both student answer and correct answer visually
  renderViewMode(questionData, questionId, studentAnswer, correctAnswer) {
    const container = this.render(questionData, questionId, studentAnswer);

    // Find both dropdowns and mark them to show student vs correct
    setTimeout(() => {
      const dropdowns = container.querySelectorAll('select');
      dropdowns.forEach((dropdown, index) => {
        const blankKey = index === 0 ? 'blank1' : 'blank2';
        const studentValue = studentAnswer?.[blankKey];
        const correctValue = correctAnswer?.[blankKey];

        // Keep dropdown interactive (can view options) but prevent changes
        dropdown.addEventListener('mousedown', (e) => e.preventDefault());

        // Add visual indicator next to dropdown
        const indicator = document.createElement('span');
        indicator.style.cssText = 'margin-left: 0.75rem; font-weight: bold; font-size: 0.95rem;';

        if (studentValue === correctValue) {
          // Correct
          dropdown.style.borderColor = '#10b981';
          dropdown.style.borderWidth = '3px';
          dropdown.style.background = '#d1fae5';
          indicator.textContent = '✓ CORRECT';
          indicator.style.color = '#10b981';
        } else {
          // Wrong
          dropdown.style.borderColor = '#ef4444';
          dropdown.style.borderWidth = '3px';
          dropdown.style.background = '#fee2e2';
          indicator.innerHTML = `✗ Your Answer: "${studentValue}" | Correct: "${correctValue}"`;
          indicator.style.color = '#ef4444';
        }

        dropdown.parentElement.appendChild(indicator);
      });
    }, 200);

    return container;
  }
};
