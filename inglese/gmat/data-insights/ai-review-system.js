// AI Question Review & Training System
// Handles approval/rejection workflow and few-shot learning

class AIReviewSystem {
  constructor() {
    this.supabaseUrl = 'https://elrwpaezjnemmiegkyin.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI';
  }

  // Show review modal after AI generation
  showReviewModal(questionType, difficulty, generatedData, onApprove, onReject) {
    const overlay = document.createElement('div');
    overlay.className = 'ai-review-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20000;
      animation: fadeIn 0.2s;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      max-width: 1000px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.3s;
    `;

    const typeName = this.getTypeName(questionType);

    modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🤖</div>
        <h2 style="margin: 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
          Review AI-Generated Question
        </h2>
        <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">
          ${typeName} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
        </p>
      </div>

      <!-- Tab Navigation -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
        <button id="preview-tab" style="
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-bottom: 3px solid #2563eb;
          cursor: pointer;
          font-weight: 600;
          border-radius: 8px 8px 0 0;
        ">📋 Question Preview</button>
        <button id="json-tab" style="
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          cursor: pointer;
          font-weight: 600;
          border-radius: 8px 8px 0 0;
        ">🔧 JSON Data</button>
      </div>

      <!-- Preview Content -->
      <div id="preview-content" style="
        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        min-height: 250px;
      ">
        ${this.renderQuestionPreview(questionType, generatedData)}
      </div>

      <!-- JSON Content (hidden by default) -->
      <div id="json-content" style="
        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        display: none;
      ">
        <pre style="
          background: white;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.5;
          border: 1px solid #d1d5db;
          max-height: 400px;
        ">${JSON.stringify(generatedData, null, 2)}</pre>
      </div>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.25rem; margin-bottom: 2rem; border-radius: 8px;">
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <div style="font-size: 1.5rem;">💡</div>
          <div>
            <h4 style="margin: 0 0 0.5rem 0; color: #92400e; font-size: 1rem; font-weight: 600;">
              Quality Check:
            </h4>
            <ul style="margin: 0; padding-left: 1.25rem; color: #78350f; line-height: 1.8;">
              <li>Is the question factually correct?</li>
              <li>Does it match the requested difficulty level?</li>
              <li>Is the format exactly as specified?</li>
              <li>Are all answer options/data complete?</li>
            </ul>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
          Quality Rating:
        </label>
        <div id="star-rating" style="display: flex; gap: 0.5rem; font-size: 2rem; cursor: pointer;">
          ${[1,2,3,4,5].map(i => `<span data-rating="${i}" style="color: #d1d5db; transition: color 0.2s;">⭐</span>`).join('')}
        </div>
        <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.85rem;" id="rating-label">Click to rate</p>
      </div>

      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
          Feedback / Issues (Optional):
        </label>
        <textarea id="feedback-text" rows="3" style="
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
        " placeholder="What needs improvement? What was wrong? (helps AI learn)"></textarea>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="reject-btn" style="
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(239, 68, 68, 0.4)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(239, 68, 68, 0.3)';">
          ❌ Reject
        </button>

        <button id="edit-approve-btn" style="
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(245, 158, 11, 0.4)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(245, 158, 11, 0.3)';">
          ✏️ Edit & Approve
        </button>

        <button id="approve-btn" style="
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(16, 185, 129, 0.4)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(16, 185, 129, 0.3)';">
          ✅ Approve & Use
        </button>
      </div>

      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Render chart if GI question with chart_config
    if (questionType === 'GI' && generatedData.chart_config) {
      this.renderChartInReview(generatedData.chart_config);
    }

    // Tab switching functionality
    const previewTab = modal.querySelector('#preview-tab');
    const jsonTab = modal.querySelector('#json-tab');
    const previewContent = modal.querySelector('#preview-content');
    const jsonContent = modal.querySelector('#json-content');

    previewTab.addEventListener('click', () => {
      previewTab.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
      previewTab.style.color = 'white';
      previewTab.style.borderBottom = '3px solid #2563eb';
      jsonTab.style.background = '#f3f4f6';
      jsonTab.style.color = '#6b7280';
      jsonTab.style.borderBottom = 'none';
      previewContent.style.display = 'block';
      jsonContent.style.display = 'none';
    });

    jsonTab.addEventListener('click', () => {
      jsonTab.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
      jsonTab.style.color = 'white';
      jsonTab.style.borderBottom = '3px solid #2563eb';
      previewTab.style.background = '#f3f4f6';
      previewTab.style.color = '#6b7280';
      previewTab.style.borderBottom = 'none';
      jsonContent.style.display = 'block';
      previewContent.style.display = 'none';
    });

    // Star rating functionality
    let selectedRating = 0;
    const stars = modal.querySelectorAll('#star-rating span');
    const ratingLabel = modal.querySelector('#rating-label');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        this.updateStars(stars, selectedRating);
        ratingLabel.textContent = this.getRatingText(selectedRating);
        ratingLabel.style.color = this.getRatingColor(selectedRating);
      });

      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.dataset.rating);
        this.updateStars(stars, rating, true);
      });
    });

    modal.querySelector('#star-rating').addEventListener('mouseleave', () => {
      this.updateStars(stars, selectedRating);
    });

    // Button handlers
    modal.querySelector('#approve-btn').addEventListener('click', async () => {
      if (selectedRating === 0) {
        alert('⭐ Please rate the question quality first!');
        return;
      }
      await this.handleApproval(questionType, difficulty, generatedData, selectedRating, modal.querySelector('#feedback-text').value);
      document.body.removeChild(overlay);
      onApprove(generatedData);
    });

    modal.querySelector('#edit-approve-btn').addEventListener('click', async () => {
      if (selectedRating === 0) {
        alert('⭐ Please rate the question quality first!');
        return;
      }
      // Save as corrected (will be updated when user saves edited version)
      await this.handleCorrection(questionType, difficulty, generatedData, selectedRating, modal.querySelector('#feedback-text').value);
      document.body.removeChild(overlay);
      onApprove(generatedData); // Let user edit in form
    });

    modal.querySelector('#reject-btn').addEventListener('click', async () => {
      const feedback = modal.querySelector('#feedback-text').value.trim();
      if (!feedback) {
        alert('📝 Please provide feedback on why you\'re rejecting this question (helps AI learn!)');
        return;
      }
      await this.handleRejection(questionType, difficulty, generatedData, selectedRating, feedback);
      document.body.removeChild(overlay);
      onReject();
    });
  }

  updateStars(stars, rating, isHover = false) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.style.color = isHover ? '#fbbf24' : '#f59e0b';
      } else {
        star.style.color = '#d1d5db';
      }
    });
  }

  getRatingText(rating) {
    const texts = {
      1: '⭐ Poor - Major issues',
      2: '⭐⭐ Below Average - Needs work',
      3: '⭐⭐⭐ Average - Acceptable',
      4: '⭐⭐⭐⭐ Good - Minor tweaks',
      5: '⭐⭐⭐⭐⭐ Excellent - Perfect!'
    };
    return texts[rating] || 'Click to rate';
  }

  getRatingColor(rating) {
    const colors = {
      1: '#dc2626',
      2: '#f59e0b',
      3: '#3b82f6',
      4: '#10b981',
      5: '#059669'
    };
    return colors[rating] || '#6b7280';
  }

  getTypeName(type) {
    const names = {
      DS: 'Data Sufficiency',
      GI: 'Graphics Interpretation',
      TA: 'Table Analysis',
      TPA: 'Two-Part Analysis',
      MSR: 'Multi-Source Reasoning'
    };
    return names[type] || type;
  }

  // Save approved question
  async handleApproval(questionType, difficulty, generatedData, rating, feedback) {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/ai_question_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          question_type: questionType,
          difficulty: difficulty,
          generated_json: generatedData,
          status: 'approved',
          rating: rating,
          correction_notes: feedback || null,
          reviewed_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save approval');
      }

      console.log('✅ Question approved and saved for training');
    } catch (error) {
      console.error('Error saving approval:', error);
    }
  }

  // Save corrected question
  async handleCorrection(questionType, difficulty, generatedData, rating, feedback) {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/ai_question_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          question_type: questionType,
          difficulty: difficulty,
          generated_json: generatedData,
          status: 'corrected',
          rating: rating,
          correction_notes: feedback || null,
          reviewed_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save correction');
      }

      console.log('✏️ Question marked for correction');
    } catch (error) {
      console.error('Error saving correction:', error);
    }
  }

  // Save rejected question with feedback
  async handleRejection(questionType, difficulty, generatedData, rating, feedback) {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/ai_question_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          question_type: questionType,
          difficulty: difficulty,
          generated_json: generatedData,
          status: 'rejected',
          rating: rating || null,
          rejection_reason: feedback,
          reviewed_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save rejection');
      }

      console.log('❌ Question rejected with feedback for AI learning');
    } catch (error) {
      console.error('Error saving rejection:', error);
    }
  }

  // Get approved examples for few-shot learning
  async getApprovedExamples(questionType, difficulty, limit = 3) {
    try {
      // Get top-rated approved questions, preferring less-used examples
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/ai_question_history?` +
        `question_type=eq.${questionType}&` +
        `difficulty=eq.${difficulty}&` +
        `status=in.(approved,corrected)&` +
        `rating=gte.4&` +
        `order=rating.desc,example_usage_count.asc&` +
        `limit=${limit}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch examples');
      }

      const examples = await response.json();

      // Increment usage count for these examples
      if (examples.length > 0) {
        await this.incrementExampleUsage(examples.map(e => e.id));
      }

      return examples;
    } catch (error) {
      console.error('Error fetching examples:', error);
      return [];
    }
  }

  // Track example usage for rotation
  async incrementExampleUsage(ids) {
    try {
      for (const id of ids) {
        await fetch(`${this.supabaseUrl}/rest/v1/rpc/increment_example_usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          },
          body: JSON.stringify({ question_id: id })
        });
      }
    } catch (error) {
      console.error('Error incrementing example usage:', error);
    }
  }

  // Get common rejection patterns to avoid
  async getRejectionPatterns(questionType) {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/ai_question_history?` +
        `question_type=eq.${questionType}&` +
        `status=eq.rejected&` +
        `order=created_at.desc&` +
        `limit=10`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        }
      );

      if (!response.ok) {
        return [];
      }

      const rejections = await response.json();
      return rejections.map(r => r.rejection_reason).filter(Boolean);
    } catch (error) {
      console.error('Error fetching rejection patterns:', error);
      return [];
    }
  }

  // Render formatted question preview based on type
  renderQuestionPreview(questionType, data) {
    const previews = {
      DS: () => `
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1.5rem 0; color: #1f2937; font-size: 1.2rem; font-weight: 600;">Data Sufficiency</h3>
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 6px; line-height: 1.8;">
            <p style="margin: 0; color: #1f2937;">${data.problem || 'N/A'}</p>
          </div>
          <div style="margin-bottom: 1rem; padding: 1rem; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px;">
            <strong style="color: #1e40af;">(1)</strong> ${data.statement1 || 'N/A'}
          </div>
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px;">
            <strong style="color: #1e40af;">(2)</strong> ${data.statement2 || 'N/A'}
          </div>
          <div style="margin-bottom: 1rem;">
            <strong style="color: #374151; display: block; margin-bottom: 0.75rem;">Select your answer:</strong>
            ${Object.entries(data.answer_choices || {}).map(([key, text]) => `
              <div style="margin-bottom: 0.5rem;">
                <label style="display: flex; align-items: start; padding: 0.75rem; background: ${key === data.correct_answer ? '#dcfce7' : '#f9fafb'}; border-radius: 6px; cursor: pointer; border: 2px solid ${key === data.correct_answer ? '#10b981' : 'transparent'};">
                  <input type="radio" name="ds_answer" value="${key}" ${key === data.correct_answer ? 'checked' : ''} style="margin-right: 0.75rem; margin-top: 0.25rem; cursor: pointer;">
                  <span style="color: #1f2937; line-height: 1.6;"><strong>${key})</strong> ${text}</span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>
      `,

      GI: () => {
        const statementWithDropdowns = (data.statement_text || 'N/A')
          .replace('[BLANK1]', `<select style="padding: 0.5rem; border: 2px solid #10b981; border-radius: 6px; background: #dcfce7; font-weight: 600; cursor: pointer; margin: 0 0.25rem;">
            ${(data.blank1_options || []).map(opt => `<option ${opt === data.blank1_correct ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>`)
          .replace('[BLANK2]', `<select style="padding: 0.5rem; border: 2px solid #10b981; border-radius: 6px; background: #dcfce7; font-weight: 600; cursor: pointer; margin: 0 0.25rem;">
            ${(data.blank2_options || []).map(opt => `<option ${opt === data.blank2_correct ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>`);

        // Render chart canvas (will be populated by renderChartInReview)
        let chartHtml = '';
        if (data.chart_config) {
          chartHtml = `
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 8px; border: 2px solid #e5e7eb;">
              <div style="position: relative; height: 400px; width: 100%;">
                <canvas id="ai-review-chart-canvas"></canvas>
              </div>
            </div>
          `;
        } else if (data.image_url) {
          chartHtml = `<div style="margin-bottom: 1.5rem; padding: 1rem; background: #f3f4f6; border-radius: 6px; text-align: center;">
            <img src="${data.image_url}" style="max-width: 100%; border-radius: 6px;" alt="Chart">
          </div>`;
        }

        return `
          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 1.5rem 0; color: #1f2937; font-size: 1.2rem; font-weight: 600;">Graphics Interpretation</h3>
            ${chartHtml}
            ${data.context_text ? `<div style="margin-bottom: 1.5rem; padding: 1rem; background: #eff6ff; border-radius: 6px; border-left: 3px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-size: 0.95rem;">${data.context_text}</p>
            </div>` : ''}
            <div style="margin-bottom: 1.5rem; padding: 1.5rem; background: #f9fafb; border-radius: 6px; line-height: 2; font-size: 1.05rem;">
              <p style="margin: 0; color: #1f2937;">${statementWithDropdowns}</p>
            </div>
            <div style="padding: 1rem; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #10b981;">
              <strong style="color: #15803d;">✓ Correct answers are pre-selected in dropdowns above</strong>
            </div>
          </div>
        `;
      },

      TA: () => `
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1.5rem 0; color: #1f2937; font-size: 1.2rem; font-weight: 600;">${data.table_title || 'Table Analysis'}</h3>
          <div style="overflow-x: auto; margin-bottom: 1.5rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
              <thead>
                <tr style="background: #f3f4f6;">
                  ${(data.column_headers || []).map(h => `<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${(data.table_data || []).map((row, i) => `
                  <tr style="background: ${i % 2 === 0 ? 'white' : '#f9fafb'};">
                    ${row.map(cell => `<td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div style="margin-top: 1.5rem;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 60%;">${data.statement_column_title || 'Statement'}</th>
                  <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 20%;">${data.answer_col1_title || 'True'}</th>
                  <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 20%;">${data.answer_col2_title || 'False'}</th>
                </tr>
              </thead>
              <tbody>
                ${(data.statements || []).map((stmt, i) => `
                  <tr style="background: ${i % 2 === 0 ? 'white' : '#f9fafb'};">
                    <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${stmt.text}</td>
                    <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; text-align: center; background: ${stmt.is_true ? '#dcfce7' : 'transparent'};">
                      <input type="radio" name="ta_stmt_${i}" ${stmt.is_true ? 'checked' : ''} style="cursor: pointer; transform: scale(1.2);">
                    </td>
                    <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; text-align: center; background: ${!stmt.is_true ? '#dcfce7' : 'transparent'};">
                      <input type="radio" name="ta_stmt_${i}" ${!stmt.is_true ? 'checked' : ''} style="cursor: pointer; transform: scale(1.2);">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `,

      TPA: () => `
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1.5rem 0; color: #1f2937; font-size: 1.2rem; font-weight: 600;">Two-Part Analysis</h3>
          <div style="margin-bottom: 1.5rem; padding: 1.5rem; background: #f9fafb; border-radius: 6px; line-height: 1.8;">
            <p style="margin: 0; color: #1f2937;">${data.scenario || 'N/A'}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 60%;">${data.statement_title || 'Option'}</th>
                <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 20%;">${data.column1_title || 'Column 1'}</th>
                <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 20%;">${data.column2_title || 'Column 2'}</th>
              </tr>
            </thead>
            <tbody>
              ${(data.shared_options || []).map((opt, i) => {
                const answer = data.correct_answers?.[opt] || '';
                return `
                  <tr style="background: ${i % 2 === 0 ? 'white' : '#f9fafb'};">
                    <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${opt}</td>
                    <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; text-align: center; background: ${answer === 'col1' ? '#dcfce7' : 'transparent'};">
                      <input type="radio" name="tpa_col1" value="${i}" ${answer === 'col1' ? 'checked' : ''} style="cursor: pointer; transform: scale(1.2);">
                    </td>
                    <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; text-align: center; background: ${answer === 'col2' ? '#dcfce7' : 'transparent'};">
                      <input type="radio" name="tpa_col2" value="${i}" ${answer === 'col2' ? 'checked' : ''} style="cursor: pointer; transform: scale(1.2);">
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `,

      MSR: () => `
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1.5rem 0; color: #1f2937; font-size: 1.2rem; font-weight: 600;">Multi-Source Reasoning</h3>

          <!-- Tab Navigation for Sources -->
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
            ${(data.sources || []).map((source, i) => `
              <button onclick="
                document.querySelectorAll('.msr-source').forEach(s => s.style.display = 'none');
                document.getElementById('msr-source-${i}').style.display = 'block';
                document.querySelectorAll('.msr-tab-btn').forEach(b => {
                  b.style.background = '#f3f4f6';
                  b.style.color = '#6b7280';
                  b.style.borderBottom = 'none';
                });
                this.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                this.style.color = 'white';
                this.style.borderBottom = '3px solid #2563eb';
              " class="msr-tab-btn" style="
                padding: 0.75rem 1.5rem;
                background: ${i === 0 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#f3f4f6'};
                color: ${i === 0 ? 'white' : '#6b7280'};
                border: none;
                ${i === 0 ? 'border-bottom: 3px solid #2563eb;' : ''}
                cursor: pointer;
                font-weight: 600;
                border-radius: 8px 8px 0 0;
              ">📑 ${source.tab_name}</button>
            `).join('')}
          </div>

          <!-- Sources Content -->
          <div style="margin-bottom: 2rem;">
            ${(data.sources || []).map((source, i) => `
              <div id="msr-source-${i}" class="msr-source" style="display: ${i === 0 ? 'block' : 'none'}; padding: 1.5rem; background: #f9fafb; border-radius: 6px; min-height: 200px;">
                ${source.content_type === 'text' ? `
                  <div style="color: #374151; white-space: pre-wrap; line-height: 1.8;">${source.content}</div>
                ` : source.content_type === 'table' ? `
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                      <tr style="background: #e5e7eb;">
                        ${(source.table_headers || []).map(h => `<th style="padding: 0.75rem; border: 1px solid #d1d5db; text-align: left; font-weight: 600; color: #374151;">${h}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${(source.table_data || []).map((row, ri) => `
                        <tr style="background: ${ri % 2 === 0 ? 'white' : '#f9fafb'};">
                          ${row.map(cell => `<td style="padding: 0.75rem; border: 1px solid #d1d5db; color: #1f2937;">${cell}</td>`).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Questions -->
          <div style="background: #f3f4f6; padding: 1.5rem; border-radius: 8px;">
            <h4 style="margin: 0 0 1rem 0; color: #374151; font-weight: 600;">Answer the questions:</h4>
            ${(data.questions || []).map((q, i) => `
              <div style="margin-bottom: 1.5rem; padding: 1.5rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                <strong style="display: block; margin-bottom: 1rem; color: #1f2937;">${i+1}. ${q.text}</strong>
                ${q.question_type === 'multiple_choice' ? `
                  <div>
                    ${Object.entries(q.options || {}).map(([letter, text]) => {
                      const isCorrect = letter.toLowerCase() === q.correct_answer?.toLowerCase();
                      return `
                        <div style="margin-bottom: 0.5rem;">
                          <label style="display: flex; align-items: start; padding: 0.75rem; background: ${isCorrect ? '#dcfce7' : '#f9fafb'}; border-radius: 6px; cursor: pointer; border: 2px solid ${isCorrect ? '#10b981' : 'transparent'};">
                            <input type="radio" name="msr_q${i}" value="${letter}" ${isCorrect ? 'checked' : ''} style="margin-right: 0.75rem; margin-top: 0.25rem; cursor: pointer;">
                            <span style="color: #1f2937; line-height: 1.6;"><strong>${letter.toUpperCase()})</strong> ${text}</span>
                          </label>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : q.question_type === 'two_column' ? `
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-top: 1rem;">
                    <thead>
                      <tr style="background: #f3f4f6;">
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 60%;">Statement</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 20%;">${q.column1_title || 'Yes'}</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; width: 20%;">${q.column2_title || 'No'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(q.statements || []).map((stmt, si) => {
                        const answer = q.correct_answers?.[stmt] || '';
                        return `
                          <tr style="background: ${si % 2 === 0 ? 'white' : '#f9fafb'};">
                            <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${stmt}</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; text-align: center; background: ${answer === 'col1' ? '#dcfce7' : 'transparent'};">
                              <input type="radio" name="msr_q${i}_stmt${si}" ${answer === 'col1' ? 'checked' : ''} style="cursor: pointer; transform: scale(1.2);">
                            </td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; text-align: center; background: ${answer === 'col2' ? '#dcfce7' : 'transparent'};">
                              <input type="radio" name="msr_q${i}_stmt${si}" ${answer === 'col2' ? 'checked' : ''} style="cursor: pointer; transform: scale(1.2);">
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `
    };

    return previews[questionType] ? previews[questionType]() : '<p>Preview not available for this question type.</p>';
  }

  renderChartInReview(chartConfig) {
    console.log('renderChartInReview called with config:', chartConfig);

    // Wait for canvas to be in DOM
    setTimeout(() => {
      const canvas = document.getElementById('ai-review-chart-canvas');

      if (!canvas) {
        console.error('Chart canvas not found in review modal');
        return;
      }

      if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
      }

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
        new Chart(ctx, {
          type: chartConfig.type,
          data: {
            labels: chartConfig.labels || [],
            datasets: chartConfig.datasets.map(ds => ({
              label: ds.label,
              data: ds.data,
              backgroundColor: chartConfig.type === 'pie' ? (ds.colors || [ds.color]) : ds.color + '20',
              borderColor: ds.color,
              borderWidth: 2,
              tension: 0.1
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
        });
        console.log('✅ Chart rendered successfully in review modal');
      } catch (error) {
        console.error('Error rendering chart in review:', error);
      }
    }, 100); // Small delay to ensure DOM is ready
  }
}

// Global instance
window.AIReviewSystem = new AIReviewSystem();
