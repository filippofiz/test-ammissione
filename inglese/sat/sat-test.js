// SAT Test Main Controller
// Manages the entire SAT test flow including adaptive modules

import { SAT_CONFIG, getNextModule, isBreakTime } from './sat-config.js';
import SATAdaptiveManager from './sat-adaptive.js';

const supabase = window.supabase;

class SATTestController {
  constructor() {
    this.adaptiveManager = new SATAdaptiveManager(supabase);
    this.currentModule = null;
    this.currentQuestions = [];
    this.currentPage = 1;
    this.studentAnswers = {};
    this.testStartTime = null;
    this.moduleStartTime = null;
    this.isTestActive = false;
    this.studentId = sessionStorage.getItem('studentId');
  }

  // Initialize SAT test
  async init() {
    console.log('🚀 Initializing SAT Test');

    // Check for existing progress
    const savedProgress = this.adaptiveManager.loadFromSession();
    if (savedProgress.hasProgress) {
      const resume = await this.showResumeDialog();
      if (!resume) {
        this.adaptiveManager.reset();
        sessionStorage.removeItem('satCurrentModule');
      }
    }

    // Start with first module or resume
    const savedModule = sessionStorage.getItem('satCurrentModule');
    if (savedModule) {
      this.currentModule = SAT_CONFIG.modules.find(m => m.id === savedModule);
    } else {
      this.currentModule = SAT_CONFIG.modules[0]; // Start with RW Module 1
    }

    await this.loadModule(this.currentModule.id);
    this.setupEventListeners();
    this.startTest();
  }

  // Load a specific module
  async loadModule(moduleId) {
    console.log(`📚 Loading module: ${moduleId}`);

    const module = SAT_CONFIG.modules.find(m => m.id === moduleId);
    if (!module) {
      console.error(`Module ${moduleId} not found`);
      return;
    }

    this.currentModule = module;
    sessionStorage.setItem('satCurrentModule', moduleId);

    // Clear previous module data
    this.currentQuestions = [];
    this.studentAnswers = {};
    this.currentPage = 1;

    // Load questions based on module type
    if (module.isAdaptive) {
      await this.loadAdaptiveModule(module);
    } else {
      await this.loadStandardModule(module);
    }

    // Update UI
    this.updateModuleHeader();
    this.initializeTimer();
    this.loadQuestionsForPage(1);
  }

  // Load standard (non-adaptive) module
  async loadStandardModule(module) {
    const testType = `SAT PDF ${module.id.toUpperCase()}`;

    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('tipologia_test', testType)
      .order('question_number', { ascending: true });

    if (error) {
      console.error('Error loading module questions:', error);
      alert('Error loading test questions. Please try again.');
      return;
    }

    this.currentQuestions = questions || [];
    console.log(`✅ Loaded ${this.currentQuestions.length} questions for ${module.name}`);
  }

  // Load adaptive module based on Module 1 performance
  async loadAdaptiveModule(module) {
    const baseModuleId = module.adaptsFrom;
    const moduleStatus = this.adaptiveManager.getModuleStatus(baseModuleId);

    if (!moduleStatus.completed) {
      alert(`You must complete ${baseModuleId} before accessing ${module.name}`);
      await this.loadModule(baseModuleId);
      return;
    }

    // Get adaptive questions based on Module 1 score
    const adaptiveData = await this.adaptiveManager.getModule2Questions(
      baseModuleId,
      moduleStatus.score.percentage
    );

    this.currentQuestions = adaptiveData.questions;

    // Show difficulty level to student
    this.showAdaptiveNotification(adaptiveData.difficulty);

    console.log(`✅ Loaded ${this.currentQuestions.length} ${adaptiveData.difficulty} questions for ${module.name}`);
  }

  // Complete current module and move to next
  async completeModule() {
    console.log(`✅ Completing module: ${this.currentModule.id}`);

    // Calculate and store module score
    const score = this.calculateModuleScore();
    this.adaptiveManager.calculateModuleScore(this.currentModule.id, this.studentAnswers);
    this.adaptiveManager.storeModuleAnswers(this.currentModule.id, this.studentAnswers);
    this.adaptiveManager.saveToSession();

    // Save to database
    await this.saveModuleResults();

    // Check if break is needed
    if (isBreakTime(this.currentModule.id)) {
      await this.showBreakScreen();
    }

    // Move to next module or complete test
    const nextModule = getNextModule(this.currentModule.id);
    if (nextModule) {
      await this.loadModule(nextModule.id);
    } else {
      await this.completeTest();
    }
  }

  // Calculate score for current module
  calculateModuleScore() {
    let correct = 0;
    let total = 0;

    for (const [questionId, answer] of Object.entries(this.studentAnswers)) {
      const question = this.currentQuestions.find(q => q.id === questionId);
      if (question) {
        total++;
        if (answer === question.correct_answer) {
          correct++;
          this.studentAnswers[questionId] = {
            answer: answer,
            isCorrect: true
          };
        } else {
          this.studentAnswers[questionId] = {
            answer: answer,
            isCorrect: false
          };
        }
      }
    }

    return { correct, total, percentage: total > 0 ? correct / total : 0 };
  }

  // Save module results to database
  async saveModuleResults() {
    const progress = this.adaptiveManager.getTestProgress();

    const testData = {
      student_id: this.studentId,
      test_type: 'SAT',
      module_id: this.currentModule.id,
      module_name: this.currentModule.name,
      answers: this.studentAnswers,
      score: this.adaptiveManager.moduleScores[this.currentModule.id],
      difficulty: this.adaptiveManager.selectedDifficulties[this.currentModule.id] || 'standard',
      completed_at: new Date().toISOString(),
      overall_progress: progress
    };

    const { error } = await supabase
      .from('sat_test_results')
      .insert([testData]);

    if (error) {
      console.error('Error saving module results:', error);
    }
  }

  // Complete entire SAT test
  async completeTest() {
    console.log('🎉 SAT Test Completed!');

    this.isTestActive = false;
    const progress = this.adaptiveManager.getTestProgress();

    // Calculate final scores
    const finalScores = this.calculateFinalScores();

    // Save final results
    await this.saveFinalResults(finalScores);

    // Clear session data
    this.adaptiveManager.reset();
    sessionStorage.removeItem('satCurrentModule');

    // Show completion screen
    this.showCompletionScreen(finalScores);
  }

  // Calculate final SAT scores
  calculateFinalScores() {
    const scores = this.adaptiveManager.moduleScores;

    // English score (RW1 + RW2)
    const rwScore = this.calculateSectionScore(['rw1', 'rw2'], scores);

    // Math score (Math1 + Math2)
    const mathScore = this.calculateSectionScore(['math1', 'math2'], scores);

    // Total score
    const totalScore = rwScore + mathScore;

    return {
      english: rwScore,
      math: mathScore,
      total: totalScore,
      modules: scores,
      difficulties: this.adaptiveManager.selectedDifficulties
    };
  }

  // Calculate section score (English or Math)
  calculateSectionScore(moduleIds, scores) {
    let totalCorrect = 0;
    let totalQuestions = 0;

    moduleIds.forEach(id => {
      if (scores[id]) {
        totalCorrect += scores[id].correct;
        totalQuestions += scores[id].total;
      }
    });

    // Convert to SAT scale (200-800)
    const percentage = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
    const scaledScore = Math.round(200 + (percentage * 600));

    return scaledScore;
  }

  // UI Methods
  updateModuleHeader() {
    const headerElement = document.getElementById('moduleHeader');
    if (headerElement) {
      headerElement.innerHTML = `
        <h2>${this.currentModule.name}</h2>
        <p>Module ${this.currentModule.order} of ${SAT_CONFIG.modules.length}</p>
      `;
    }
  }

  showAdaptiveNotification(difficulty) {
    const notification = document.createElement('div');
    notification.className = 'adaptive-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h3>Adaptive Module Selected</h3>
        <p>Based on your Module 1 performance, you'll be taking the <strong>${difficulty}</strong> version of Module 2.</p>
        <button onclick="this.parentElement.parentElement.remove()">Continue</button>
      </div>
    `;
    document.body.appendChild(notification);
  }

  showBreakScreen() {
    return new Promise(resolve => {
      const breakScreen = document.createElement('div');
      breakScreen.className = 'break-screen';
      breakScreen.innerHTML = `
        <div class="break-content">
          <h2>10-Minute Break</h2>
          <p>You've completed the Reading and Writing section!</p>
          <p>Take a 10-minute break before starting the Math section.</p>
          <div id="breakTimer">10:00</div>
          <button id="continueBtn" onclick="resolve()">Continue to Math Section</button>
        </div>
      `;
      document.body.appendChild(breakScreen);

      // Start break timer
      let breakTime = 600; // 10 minutes
      const timerInterval = setInterval(() => {
        breakTime--;
        const minutes = Math.floor(breakTime / 60);
        const seconds = breakTime % 60;
        document.getElementById('breakTimer').textContent =
          `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (breakTime <= 0) {
          clearInterval(timerInterval);
          breakScreen.remove();
          resolve();
        }
      }, 1000);
    });
  }

  showCompletionScreen(scores) {
    const completionScreen = document.createElement('div');
    completionScreen.className = 'completion-screen';
    completionScreen.innerHTML = `
      <div class="completion-content">
        <h1>🎉 SAT Test Complete!</h1>
        <div class="scores">
          <div class="score-section">
            <h3>Evidence-Based Reading and Writing</h3>
            <p class="score">${scores.english}</p>
          </div>
          <div class="score-section">
            <h3>Math</h3>
            <p class="score">${scores.math}</p>
          </div>
          <div class="total-score">
            <h2>Total Score</h2>
            <p class="score">${scores.total}</p>
          </div>
        </div>
        <button onclick="window.location.href='/'">Return to Dashboard</button>
      </div>
    `;
    document.body.appendChild(completionScreen);
  }

  // Initialize timer for current module
  initializeTimer() {
    if (this.moduleTimer) {
      clearInterval(this.moduleTimer);
    }

    let timeRemaining = this.currentModule.duration;
    this.moduleStartTime = Date.now();

    const timerElement = document.getElementById('timer');

    this.moduleTimer = setInterval(() => {
      timeRemaining--;

      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;

      if (timerElement) {
        timerElement.textContent = hours > 0
          ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          : `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      if (timeRemaining <= 0) {
        clearInterval(this.moduleTimer);
        this.completeModule();
      }
    }, 1000);
  }

  // Setup event listeners
  setupEventListeners() {
    // Navigation buttons
    document.getElementById('prevPage')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.loadQuestionsForPage(this.currentPage - 1);
      }
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
      const totalPages = Math.ceil(this.currentQuestions.length / 1); // 1 question per page for SAT
      if (this.currentPage < totalPages) {
        this.loadQuestionsForPage(this.currentPage + 1);
      }
    });

    // Complete module button
    document.getElementById('completeModule')?.addEventListener('click', () => {
      this.completeModule();
    });
  }

  // Load questions for specific page
  loadQuestionsForPage(page) {
    this.currentPage = page;
    // Implementation would integrate with existing test.js display logic
    // This is a placeholder for the actual implementation
    console.log(`Loading page ${page} for module ${this.currentModule.id}`);
  }

  // Start test
  startTest() {
    this.isTestActive = true;
    this.testStartTime = Date.now();
    console.log('⏱️ SAT Test started');
  }

  // Show resume dialog
  showResumeDialog() {
    return new Promise(resolve => {
      const resume = confirm('You have an incomplete SAT test. Would you like to resume where you left off?');
      resolve(resume);
    });
  }

  // Save final results
  async saveFinalResults(scores) {
    const { error } = await supabase
      .from('sat_final_scores')
      .insert([{
        student_id: this.studentId,
        english_score: scores.english,
        math_score: scores.math,
        total_score: scores.total,
        module_scores: scores.modules,
        module_difficulties: scores.difficulties,
        completed_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error saving final scores:', error);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const controller = new SATTestController();
  controller.init();
});

export default SATTestController;