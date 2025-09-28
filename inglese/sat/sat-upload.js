// SAT Test Upload Manager
// Handles uploading SAT tests with proper module and difficulty structure

let selectedModule = null;
let selectedDifficulty = null;
let selectedTestType = null;
let uploadedPDF = null;
let questionCount = 0;

// Module configurations
const moduleConfigs = {
  'RW1': {
    name: 'Reading and Writing - Module 1',
    questions: 27,
    duration: 32,
    isAdaptive: false
  },
  'RW2': {
    name: 'Reading and Writing - Module 2',
    questions: 27,
    duration: 32,
    isAdaptive: true
  },
  'MATH1': {
    name: 'Math - Module 1',
    questions: 22,
    duration: 35,
    isAdaptive: false
  },
  'MATH2': {
    name: 'Math - Module 2',
    questions: 22,
    duration: 35,
    isAdaptive: true
  }
};

// Select test type
window.selectTestType = function(type) {
  selectedTestType = type;

  // Update UI
  document.querySelectorAll('[data-test-type]').forEach(opt => {
    opt.classList.remove('selected');
  });
  document.querySelector(`[data-test-type="${type}"]`).classList.add('selected');

  updateAutoFields();
};

// Select module
window.selectModule = function(module) {
  selectedModule = module;

  // Update UI
  document.querySelectorAll('.module-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`[data-module="${module}"]`).classList.add('selected');

  // Show/hide difficulty selector for adaptive modules
  const difficultySection = document.getElementById('difficultySection');
  if (moduleConfigs[module].isAdaptive) {
    difficultySection.style.display = 'block';
    // Reset difficulty selection
    selectedDifficulty = null;
    document.querySelectorAll('.difficulty-option').forEach(opt => {
      opt.classList.remove('selected');
    });
  } else {
    difficultySection.style.display = 'none';
    selectedDifficulty = null;
  }

  // Generate question rows
  generateQuestionRows(moduleConfigs[module].questions);

  updateAutoFields();
};

// Select difficulty
window.selectDifficulty = function(difficulty) {
  selectedDifficulty = difficulty;

  // Update UI
  document.querySelectorAll('.difficulty-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');

  updateAutoFields();

  // Regenerate question rows to update SAT section column
  if (selectedModule) {
    generateQuestionRows(moduleConfigs[selectedModule].questions);
  }
};

// Update auto-populated fields display
function updateAutoFields() {
  const autoFieldsSection = document.getElementById('autoFieldsSection');
  const displayTestType = document.getElementById('displayTestType');
  const displaySection = document.getElementById('displaySection');
  const displaySATSection = document.getElementById('displaySATSection');
  const displayExerciseType = document.getElementById('displayExerciseType');

  if (selectedTestType && selectedModule) {
    autoFieldsSection.style.display = 'block';

    displayTestType.textContent = 'SAT PDF';
    displaySection.textContent = selectedTestType;

    // Determine SAT section
    let satSection = selectedModule;
    if (moduleConfigs[selectedModule].isAdaptive && selectedDifficulty) {
      if (selectedModule === 'RW2') {
        satSection = selectedDifficulty === 'EASY' ? 'RW2-Easy' :
                     selectedDifficulty === 'HARD' ? 'RW2-Hard' : 'RW2-Medium';
      } else if (selectedModule === 'MATH2') {
        satSection = selectedDifficulty === 'EASY' ? 'MATH2-Easy' :
                     selectedDifficulty === 'HARD' ? 'MATH2-Hard' : 'MATH2-Medium';
      }
    }
    displaySATSection.textContent = satSection;

    displayExerciseType.textContent = moduleConfigs[selectedModule].isAdaptive ? 'Adaptive' : 'Standard';
  } else {
    autoFieldsSection.style.display = 'none';
  }
}

// Handle PDF selection
window.handlePDFSelect = async function(event) {
  const file = event.target.files[0];
  if (!file || file.type !== 'application/pdf') {
    showStatus('Please select a valid PDF file', 'error');
    return;
  }

  uploadedPDF = file;

  // Update UI
  const uploadArea = document.getElementById('pdfUploadArea');
  const uploadText = document.getElementById('uploadText');

  uploadArea.classList.add('has-file');
  uploadText.textContent = `📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

  // Upload to Supabase storage
  await uploadPDFToStorage();
};

// Upload PDF to Supabase storage
async function uploadPDFToStorage() {
  if (!uploadedPDF) return null;

  try {
    // Create unique filename
    const timestamp = Date.now();
    const fileName = `sat/${selectedModule}_${timestamp}.pdf`;

    // Upload to Supabase storage
    const { data, error } = await window.supabase.storage
      .from('test-pdfs')
      .upload(fileName, uploadedPDF);

    if (error) {
      showStatus(`Error uploading PDF: ${error.message}`, 'error');
      return null;
    }

    // Get public URL
    const { data: urlData } = window.supabase.storage
      .from('test-pdfs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    showStatus(`Error uploading PDF: ${error.message}`, 'error');
    return null;
  }
}

// Generate question rows
function generateQuestionRows(count) {
  const tbody = document.getElementById('questionsTableBody');
  tbody.innerHTML = '';

  // Determine SAT section to display
  let satSection = selectedModule || '';
  if (selectedModule && moduleConfigs[selectedModule].isAdaptive && selectedDifficulty) {
    if (selectedModule === 'RW2') {
      satSection = selectedDifficulty === 'EASY' ? 'RW2-Easy' :
                   selectedDifficulty === 'HARD' ? 'RW2-Hard' : 'RW2-Medium';
    } else if (selectedModule === 'MATH2') {
      satSection = selectedDifficulty === 'EASY' ? 'MATH2-Easy' :
                   selectedDifficulty === 'HARD' ? 'MATH2-Hard' : 'MATH2-Medium';
    }
  }

  for (let i = 1; i <= count; i++) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i}</td>
      <td><input type="text" value="${satSection}" readonly style="background: #f0f0f0; border: 1px solid #ccc; text-align: center;"></td>
      <td><input type="text" class="answer-input" maxlength="1" placeholder="A-E" data-question="${i}"></td>
      <td><input type="number" class="page-input" min="1" placeholder="1" data-question="${i}"></td>
      <td><input type="text" placeholder="Optional notes" data-question="${i}"></td>
    `;
    tbody.appendChild(row);
  }

  questionCount = count;
  updateQuestionCount();

  // Add input validation
  document.querySelectorAll('.answer-input').forEach(input => {
    input.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
      if (!/^[A-E]?$/.test(this.value)) {
        this.value = '';
      }
    });
  });
}

// Add question row (if needed for flexibility)
window.addQuestionRow = function() {
  const tbody = document.getElementById('questionsTableBody');
  const rowCount = tbody.children.length + 1;

  // Determine SAT section to display
  let satSection = selectedModule || '';
  if (selectedModule && moduleConfigs[selectedModule].isAdaptive && selectedDifficulty) {
    if (selectedModule === 'RW2') {
      satSection = selectedDifficulty === 'EASY' ? 'RW2-Easy' :
                   selectedDifficulty === 'HARD' ? 'RW2-Hard' : 'RW2-Medium';
    } else if (selectedModule === 'MATH2') {
      satSection = selectedDifficulty === 'EASY' ? 'MATH2-Easy' :
                   selectedDifficulty === 'HARD' ? 'MATH2-Hard' : 'MATH2-Medium';
    }
  }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${rowCount}</td>
    <td><input type="text" value="${satSection}" readonly style="background: #f0f0f0; border: 1px solid #ccc; text-align: center;"></td>
    <td><input type="text" class="answer-input" maxlength="1" placeholder="A-E" data-question="${rowCount}"></td>
    <td><input type="number" class="page-input" min="1" placeholder="1" data-question="${rowCount}"></td>
    <td><input type="text" placeholder="Optional notes" data-question="${rowCount}"></td>
  `;
  tbody.appendChild(row);

  questionCount++;
  updateQuestionCount();

  // Add validation to new input
  row.querySelector('.answer-input').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    if (!/^[A-E]?$/.test(this.value)) {
      this.value = '';
    }
  });
};

// Update question count display
function updateQuestionCount() {
  document.getElementById('questionCount').textContent = `${questionCount} questions`;
}

// Clear form
window.clearForm = function() {
  if (!confirm('Are you sure you want to clear all form data?')) return;

  // Reset selections
  selectedModule = null;
  selectedDifficulty = null;
  selectedTestType = null;
  uploadedPDF = null;

  // Clear UI
  document.querySelectorAll('.module-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelectorAll('.difficulty-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  document.querySelectorAll('[data-test-type]').forEach(opt => {
    opt.classList.remove('selected');
  });

  // Clear PDF
  const uploadArea = document.getElementById('pdfUploadArea');
  const uploadText = document.getElementById('uploadText');
  uploadArea.classList.remove('has-file');
  uploadText.textContent = 'Click to select PDF file or drag and drop here';
  document.getElementById('pdfInput').value = '';

  // Clear questions
  document.getElementById('questionsTableBody').innerHTML = '';
  questionCount = 0;
  updateQuestionCount();

  // Hide difficulty section
  document.getElementById('difficultySection').style.display = 'none';

  // Clear status
  document.getElementById('statusMessage').style.display = 'none';

  // Hide auto fields section
  document.getElementById('autoFieldsSection').style.display = 'none';
};

// Save test
window.saveTest = async function() {
  // Validation
  if (!selectedTestType) {
    showStatus('Please select a test type', 'error');
    return;
  }

  if (!selectedModule) {
    showStatus('Please select a module', 'error');
    return;
  }

  if (moduleConfigs[selectedModule].isAdaptive && !selectedDifficulty) {
    showStatus('Please select a difficulty level for adaptive module', 'error');
    return;
  }

  if (!uploadedPDF) {
    showStatus('Please upload a PDF file', 'error');
    return;
  }

  // Collect question data
  const questions = [];
  const tbody = document.getElementById('questionsTableBody');
  const rows = tbody.querySelectorAll('tr');

  let hasErrors = false;
  rows.forEach((row, index) => {
    const questionNum = index + 1;
    const answer = row.querySelector('.answer-input').value;
    const page = row.querySelector('.page-input').value;
    const notes = row.querySelector('input[type="text"]:last-child').value;

    if (!answer || !page) {
      showStatus(`Missing data for question ${questionNum}`, 'error');
      hasErrors = true;
      return;
    }

    questions.push({
      question_number: questionNum,
      correct_answer: answer.toLowerCase(),
      page_number: parseInt(page),
      notes: notes || null
    });
  });

  if (hasErrors) return;

  // Upload PDF and get URL
  showStatus('Uploading PDF...', 'info');
  const pdfUrl = await uploadPDFToStorage();

  if (!pdfUrl) {
    showStatus('Failed to upload PDF', 'error');
    return;
  }

  // Build test type string
  let testType = `SAT PDF`;

  // Determine the actual section for adaptive modules
  let moduleSection = selectedModule;
  if (moduleConfigs[selectedModule].isAdaptive && selectedDifficulty) {
    // For adaptive modules, append difficulty to create the full section name
    if (selectedModule === 'RW2') {
      moduleSection = selectedDifficulty === 'EASY' ? 'RW2-Easy' :
                      selectedDifficulty === 'HARD' ? 'RW2-Hard' : 'RW2-Medium';
    } else if (selectedModule === 'MATH2') {
      moduleSection = selectedDifficulty === 'EASY' ? 'MATH2-Easy' :
                      selectedDifficulty === 'HARD' ? 'MATH2-Hard' : 'MATH2-Medium';
    }
  }

  // Prepare data for database
  const testData = questions.map(q => ({
    tipologia_test: testType,
    Materia: selectedModule.startsWith('RW') ? 'English' : 'Math',
    section: selectedTestType, // Use the selected test type (Assessment Iniziale or Simulazioni)
    SAT_section: moduleSection, // New field specifically for SAT modules
    tipologia_esercizi: moduleConfigs[selectedModule].isAdaptive ? 'Adaptive' : 'Standard',
    progressivo: 1, // You might want to calculate this based on existing tests
    num_domande: questions.length,
    question_number: q.question_number,
    correct_answer: q.correct_answer,
    page_number: q.page_number,
    pdf_url: pdfUrl,
    notes: q.notes,
    difficulty: selectedDifficulty || 'standard',
    module_duration: moduleConfigs[selectedModule].duration,
    is_adaptive: moduleConfigs[selectedModule].isAdaptive
  }));

  // Save to database
  showStatus('Saving test data...', 'info');

  try {
    const { data, error } = await window.supabase
      .from('questions')
      .insert(testData);

    if (error) {
      showStatus(`Error saving test: ${error.message}`, 'error');
      return;
    }

    showStatus(`✅ Successfully saved ${testType} with ${questions.length} questions!`, 'success');

    // Clear form after successful save
    setTimeout(() => {
      if (confirm('Test saved successfully! Do you want to add another module?')) {
        clearForm();
      }
    }, 2000);

  } catch (error) {
    showStatus(`Error saving test: ${error.message}`, 'error');
  }
};

// Show status message
function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.textContent = message;
  statusDiv.className = 'status-message ' + type;
  statusDiv.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }
}

// Initialize drag and drop
document.addEventListener('DOMContentLoaded', function() {
  const uploadArea = document.getElementById('pdfUploadArea');

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#2196f3';
    uploadArea.style.background = '#f0f8ff';
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.background = '#fafafa';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.background = '#fafafa';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        const input = document.getElementById('pdfInput');
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handlePDFSelect({ target: input });
      } else {
        showStatus('Please upload a PDF file', 'error');
      }
    }
  });

  // Add keyboard navigation for question inputs
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement.classList.contains('answer-input') ||
          activeElement.classList.contains('page-input')) {
        e.preventDefault();

        // Find next input
        const inputs = Array.from(document.querySelectorAll('input:not([type="file"])'));
        const currentIndex = inputs.indexOf(activeElement);
        if (currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus();
        }
      }
    }
  });
});