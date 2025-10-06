// Graphics Interpretation Question Creator
// GI questions display a graph/chart with fill-in-the-blank statements
// Each blank has dropdown options

window.DIGraphicsInterpretation = {
  open(moduleInstance, existingData = null) {
    this.moduleInstance = moduleInstance;
    this.existingData = existingData || {
      image_url: null,
      chart_config: null,  // Store chart configuration for AI-generated charts
      statement_text: '',
      blank1_options: [],
      blank1_correct: '',
      blank2_options: [],
      blank2_correct: ''
    };
    this.currentChart = null;  // Store Chart.js instance
    this.createModal();
  },

  createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'di-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 1000px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    const isEdit = this.existingData.image_url !== null || this.existingData.statement_text !== '';

    modal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
        <div style="font-size: 2.5rem;">📈</div>
        <div>
          <h2 style="margin: 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
            ${isEdit ? 'Edit' : 'Create'} Graphics Interpretation Question
          </h2>
          <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">
            Question #${this.moduleInstance.currentRowIndex + 1}
          </p>
        </div>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1rem; margin-bottom: 2rem; border-radius: 6px;">
        <p style="margin: 0; color: #1e40af; font-size: 0.9rem; line-height: 1.5;">
          📊 <strong>Graphics Interpretation:</strong> Upload a chart/graph and create 1 statement with 2 blanks [BLANK1] and [BLANK2].
        </p>
      </div>

      <div id="ai-generator-container"></div>

      <!-- Chart/Graph Upload OR AI Generated Chart -->
      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Chart/Graph:*</label>

        <!-- Canvas for AI-generated charts -->
        <div id="gi-chart-container" style="display: none; margin-bottom: 1rem; padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px;">
          <div style="position: relative; height: 450px; width: 100%;">
            <canvas id="gi-chart-canvas"></canvas>
          </div>
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <button type="button" id="gi-regenerate-chart-btn" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
              🔄 Regenerate Chart
            </button>
            <button type="button" id="gi-remove-chart-btn" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
              ✕ Remove Chart
            </button>
          </div>
        </div>

        <!-- Manual upload option (hidden when AI chart exists) -->
        <div id="gi-manual-upload-container">
          <input type="file" id="gi-image-upload" accept="image/*"
                 style="display: block; width: 100%; padding: 0.75rem; border: 2px dashed #d1d5db; border-radius: 8px; cursor: pointer;">
          <div id="gi-image-preview" style="margin-top: 1rem;"></div>
        </div>
      </div>

      <!-- Statement -->
      <div style="margin-bottom: 2rem; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; background: #f9fafb;">
        <h4 style="margin: 0 0 1rem 0; color: #374151; font-weight: 600;">Statement</h4>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; font-size: 0.9rem;">
            Statement Text (use [BLANK1] and [BLANK2] for dropdowns):*
          </label>
          <textarea id="gi-statement-text" rows="3"
                    style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit;"
                    placeholder="The correlation between sales and profit is [BLANK1], and revenue [BLANK2] from 2020 to 2021.">${this.existingData.statement_text}</textarea>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #6b7280;">💡 Must include both [BLANK1] and [BLANK2] placeholders</p>
        </div>
      </div>

      <!-- Blank 1 Options -->
      <div style="margin-bottom: 1.5rem; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; background: #f9fafb;">
        <h4 style="margin: 0 0 1rem 0; color: #374151; font-weight: 600;">Blank 1 Dropdown Options</h4>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; font-size: 0.9rem;">
            Options (one per line):*
          </label>
          <textarea id="gi-blank1-options" rows="4"
                    style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.9rem;"
                    placeholder="positive\nnegative\nzero\nvariable">${(this.existingData.blank1_options || []).join('\n')}</textarea>
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; font-size: 0.9rem;">
            Correct Answer for Blank 1:*
          </label>
          <input type="text" id="gi-blank1-correct" value="${this.existingData.blank1_correct || ''}"
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                 placeholder="e.g., positive">
        </div>
      </div>

      <!-- Blank 2 Options -->
      <div style="margin-bottom: 2rem; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; background: #f9fafb;">
        <h4 style="margin: 0 0 1rem 0; color: #374151; font-weight: 600;">Blank 2 Dropdown Options</h4>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; font-size: 0.9rem;">
            Options (one per line):*
          </label>
          <textarea id="gi-blank2-options" rows="4"
                    style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.9rem;"
                    placeholder="increased\ndecreased\nremained constant\nfluctuated">${(this.existingData.blank2_options || []).join('\n')}</textarea>
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; font-size: 0.9rem;">
            Correct Answer for Blank 2:*
          </label>
          <input type="text" id="gi-blank2-correct" value="${this.existingData.blank2_correct || ''}"
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;"
                 placeholder="e.g., increased">
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: space-between; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
        <button id="gi-delete-btn" style="padding: 0.75rem 1.5rem; border: 2px solid #dc2626; border-radius: 8px; background: white; color: #dc2626; font-weight: 600; cursor: pointer; ${isEdit ? '' : 'display: none;'}">
          🗑️ Delete Question
        </button>
        <div style="display: flex; gap: 1rem;">
          <button id="gi-cancel-btn" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #374151; font-weight: 600; cursor: pointer;">
            Cancel
          </button>
          <button id="gi-save-btn" style="padding: 0.75rem 2rem; border: none; border-radius: 8px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; font-weight: 600; cursor: pointer;">
            💾 Save Question
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add AI Generator button
    if (window.AIQuestionGenerator) {
      const aiContainer = document.getElementById('ai-generator-container');
      const generateBtn = window.AIQuestionGenerator.createGenerateButton('GI', (generatedData) => {
        this.populateFormWithAIData(generatedData);
      });
      aiContainer.appendChild(generateBtn);
    }

    // Initialize - show chart or image
    if (this.existingData.chart_config) {
      console.log('Initializing with chart config:', this.existingData.chart_config);
      this.renderChart(this.existingData.chart_config);
    } else if (this.existingData.image_url) {
      console.log('Initializing with image URL:', this.existingData.image_url);
      this.displayImage(this.existingData.image_url);
    }

    // Event Listeners
    document.getElementById('gi-image-upload').addEventListener('change', (e) => this.handleImageUpload(e));
    document.getElementById('gi-save-btn').addEventListener('click', () => this.saveQuestion(overlay));
    document.getElementById('gi-cancel-btn').addEventListener('click', () => document.body.removeChild(overlay));

    if (isEdit) {
      document.getElementById('gi-delete-btn').addEventListener('click', () => this.deleteQuestion(overlay));
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });

    // Chart buttons event listeners
    const regenerateBtn = document.getElementById('gi-regenerate-chart-btn');
    const removeChartBtn = document.getElementById('gi-remove-chart-btn');

    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => {
        if (this.existingData.chart_config) {
          this.renderChart(this.existingData.chart_config);
        }
      });
    }

    if (removeChartBtn) {
      removeChartBtn.addEventListener('click', () => {
        this.removeChart();
      });
    }
  },

  renderChart(chartConfig) {
    console.log('renderChart called with config:', chartConfig);

    const canvas = document.getElementById('gi-chart-canvas');
    const chartContainer = document.getElementById('gi-chart-container');
    const manualContainer = document.getElementById('gi-manual-upload-container');

    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    if (!chartConfig) {
      console.error('Chart config is missing');
      return;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded!');
      alert('⚠️ Chart.js library is not loaded. Please refresh the page.');
      return;
    }

    // Destroy existing chart if any
    if (this.currentChart) {
      this.currentChart.destroy();
    }

    // Show chart container, hide manual upload
    chartContainer.style.display = 'block';
    if (manualContainer) manualContainer.style.display = 'none';

    const ctx = canvas.getContext('2d');

    // Calculate smart Y-axis range
    let yAxisConfig = { beginAtZero: true };
    if (chartConfig.type !== 'pie' && chartConfig.datasets && chartConfig.datasets.length > 0) {
      const allDataPoints = chartConfig.datasets.flatMap(ds => ds.data || []);
      if (allDataPoints.length > 0) {
        const minVal = Math.min(...allDataPoints);
        const maxVal = Math.max(...allDataPoints);
        const range = maxVal - minVal;

        // If minimum value is far from 0 (more than 20% of range), adjust axis
        if (minVal > range * 0.2) {
          const padding = range * 0.15; // 15% padding
          yAxisConfig = {
            min: Math.max(0, Math.floor(minVal - padding)),
            max: Math.ceil(maxVal + padding)
          };
        }
      }
    }

    try {
      // Build Chart.js configuration
      const config = {
        type: chartConfig.type,
        data: {
          labels: chartConfig.labels || [],
          datasets: chartConfig.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: chartConfig.type === 'pie' ? (ds.colors || [ds.color]) : ds.color + '20',
            borderColor: ds.color,
            borderWidth: 2,
            tension: 0.1  // For line charts
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 16/9,
          plugins: {
            title: {
              display: !!chartConfig.title,
              text: chartConfig.title || '',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: chartConfig.type !== 'pie',
              position: 'top'
            }
          },
          scales: chartConfig.type === 'pie' ? {} : {
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
              },
              ...yAxisConfig
            }
          }
        }
      };

      // Create the chart
      this.currentChart = new Chart(ctx, config);
      console.log('Chart created successfully:', this.currentChart);

      // Convert canvas to image and store
      setTimeout(() => {
        const imageUrl = canvas.toDataURL('image/png');
        this.existingData.image_url = imageUrl;
        console.log('Chart image generated');
      }, 1000);  // Wait for chart to render
    } catch (error) {
      console.error('Error creating chart:', error);
      alert('⚠️ Error creating chart: ' + error.message);
    }
  },

  removeChart() {
    // Destroy chart instance
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }

    // Clear data
    this.existingData.chart_config = null;
    this.existingData.image_url = null;

    // Hide chart container, show manual upload
    const chartContainer = document.getElementById('gi-chart-container');
    const manualContainer = document.getElementById('gi-manual-upload-container');

    if (chartContainer) chartContainer.style.display = 'none';
    if (manualContainer) manualContainer.style.display = 'block';
  },

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const imageUrl = await this.uploadImage(file);
    this.existingData.image_url = imageUrl;
    this.displayImage(imageUrl);
  },

  displayImage(url) {
    const preview = document.getElementById('gi-image-preview');
    if (!preview) return;

    preview.innerHTML = `
      <div style="position: relative; display: inline-block;">
        <img src="${url}" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 2px solid #e5e7eb;">
        <button type="button" onclick="window.DIGraphicsInterpretation.removeImage()"
                style="position: absolute; top: 0.5rem; right: 0.5rem; background: #dc2626; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-weight: bold;">
          ✕
        </button>
      </div>
    `;
  },

  removeImage() {
    this.existingData.image_url = null;
    document.getElementById('gi-image-preview').innerHTML = '';
    document.getElementById('gi-image-upload').value = '';
  },

  populateFormWithAIData(data) {
    console.log('GI populateFormWithAIData called with:', data);

    // Populate statement text
    const statementField = document.getElementById('gi-statement-text');
    if (statementField && data.statement_text) {
      statementField.value = data.statement_text;
    }

    // Populate blank1 options
    const blank1OptionsField = document.getElementById('gi-blank1-options');
    if (blank1OptionsField && data.blank1_options) {
      blank1OptionsField.value = data.blank1_options.join('\n');
    }

    // Populate blank1 correct
    const blank1CorrectField = document.getElementById('gi-blank1-correct');
    if (blank1CorrectField && data.blank1_correct) {
      blank1CorrectField.value = data.blank1_correct;
    }

    // Populate blank2 options
    const blank2OptionsField = document.getElementById('gi-blank2-options');
    if (blank2OptionsField && data.blank2_options) {
      blank2OptionsField.value = data.blank2_options.join('\n');
    }

    // Populate blank2 correct
    const blank2CorrectField = document.getElementById('gi-blank2-correct');
    if (blank2CorrectField && data.blank2_correct) {
      blank2CorrectField.value = data.blank2_correct;
    }

    // Render chart from chart_config
    if (data.chart_config) {
      console.log('Chart config found, storing and rendering...');
      this.existingData.chart_config = data.chart_config;
      this.renderChart(data.chart_config);
    } else {
      console.warn('No chart_config in AI data!');
    }
  },

  async saveQuestion(overlay) {
    // Collect data from form
    const statementText = document.getElementById('gi-statement-text').value.trim();
    const blank1Options = document.getElementById('gi-blank1-options').value.split('\n').filter(o => o.trim());
    const blank1Correct = document.getElementById('gi-blank1-correct').value.trim();
    const blank2Options = document.getElementById('gi-blank2-options').value.split('\n').filter(o => o.trim());
    const blank2Correct = document.getElementById('gi-blank2-correct').value.trim();

    // Validation
    if (!this.existingData.image_url) {
      alert('⚠️ Chart/Graph image is required!');
      return;
    }

    if (!statementText) {
      alert('⚠️ Statement text is required!');
      return;
    }

    if (!statementText.includes('[BLANK1]')) {
      alert('⚠️ Statement must include [BLANK1] placeholder!');
      return;
    }

    if (!statementText.includes('[BLANK2]')) {
      alert('⚠️ Statement must include [BLANK2] placeholder!');
      return;
    }

    if (blank1Options.length < 2) {
      alert('⚠️ Blank 1: At least 2 dropdown options are required!');
      return;
    }

    if (!blank1Correct) {
      alert('⚠️ Blank 1 correct answer is required!');
      return;
    }

    if (blank2Options.length < 2) {
      alert('⚠️ Blank 2: At least 2 dropdown options are required!');
      return;
    }

    if (!blank2Correct) {
      alert('⚠️ Blank 2 correct answer is required!');
      return;
    }

    const questionData = {
      image_url: this.existingData.image_url,
      chart_config: this.existingData.chart_config || null,
      statement_text: statementText,
      blank1_options: blank1Options,
      blank1_correct: blank1Correct,
      blank2_options: blank2Options,
      blank2_correct: blank2Correct
    };

    console.log('Saving GI question with data:', questionData);
    this.moduleInstance.saveDIQuestion('GI', questionData);
    document.body.removeChild(overlay);
  },

  async uploadImage(file) {
    // Create a temporary data URL for now
    // TODO: Implement actual Supabase storage upload
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },

  deleteQuestion(overlay) {
    this.moduleInstance.excelFormInstance.updateCell(this.moduleInstance.currentRowIndex, 'di_question_type', '');
    this.moduleInstance.excelFormInstance.updateCell(this.moduleInstance.currentRowIndex, 'di_question_data', null);

    const rowIndex = this.moduleInstance.currentRowIndex;
    this.moduleInstance.excelFormInstance.enableStandardFields(rowIndex);

    const diBtn = document.getElementById(`di-btn-${rowIndex}`);
    if (diBtn) {
      diBtn.textContent = '➕ CREATE DATA INSIGHTS QUESTION';
      diBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      diBtn.style.borderColor = '#10b981';
    }

    document.body.removeChild(overlay);
    alert('✅ Graphics Interpretation question deleted successfully!');
  }
};
