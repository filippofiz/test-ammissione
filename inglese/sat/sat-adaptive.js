// SAT Adaptive Test Manager
// Handles the adaptive logic for SAT Module 2 selection

import { SAT_CONFIG, getAdaptiveDifficulty } from './sat-config.js';

export class SATAdaptiveManager {
  constructor(supabase) {
    this.supabase = supabase;
    this.moduleScores = {};
    this.selectedDifficulties = {};
    this.moduleAnswers = {};
  }

  // Calculate score for a completed module
  calculateModuleScore(moduleId, answers) {
    const correctAnswers = Object.values(answers).filter(a => a.isCorrect).length;
    const totalQuestions = Object.keys(answers).length;

    const score = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

    this.moduleScores[moduleId] = {
      correct: correctAnswers,
      total: totalQuestions,
      percentage: score
    };

    return score;
  }

  // Store answers for a module
  storeModuleAnswers(moduleId, answers) {
    this.moduleAnswers[moduleId] = answers;
  }

  // Get the appropriate difficulty level for Module 2
  async getModule2Questions(baseModuleId, module1Score) {
    const moduleConfig = SAT_CONFIG.modules.find(m => m.adaptsFrom === baseModuleId);
    if (!moduleConfig) return null;

    const moduleType = moduleConfig.type; // 'english' or 'math'
    const difficulty = getAdaptiveDifficulty(moduleType, module1Score);

    this.selectedDifficulties[moduleConfig.id] = difficulty;

    // Fetch questions based on difficulty
    const questions = await this.fetchAdaptiveQuestions(
      moduleConfig.id,
      difficulty,
      moduleConfig.questionCount
    );

    return {
      moduleId: moduleConfig.id,
      moduleName: moduleConfig.name,
      difficulty: difficulty,
      questions: questions
    };
  }

  // Fetch adaptive questions from database
  async fetchAdaptiveQuestions(sectionNumber, difficulty) {
    try {
      // For SAT, all questions are stored with "SAT PDF" as tipologia_test
      // We filter by section_boundaries to get the right module
      // Section 2 and 4 are adaptive (RW2 and MATH2)

      const { data: questions, error } = await this.supabase
        .from('questions')
        .select('*')
        .eq('tipologia_test', 'SAT PDF')
        .eq('adaptive_difficulty', difficulty) // Store difficulty in a separate column
        .eq('section_number', sectionNumber)   // Section 2 = RW2, Section 4 = MATH2
        .order('question_number', { ascending: true });

      if (error) {
        console.error('Error fetching adaptive questions:', error);
        return [];
      }

      return questions || [];
    } catch (error) {
      console.error('Error in fetchAdaptiveQuestions:', error);
      return [];
    }
  }

  // Alternative: Use section boundaries like CATTOLICA
  async fetchAdaptiveQuestionsFromBoundaries(allQuestions, sectionNumber, difficulty) {
    // Filter questions based on section boundaries and difficulty marker
    // This assumes questions have a difficulty marker in their data
    const sectionQuestions = allQuestions.filter(q => {
      return q.section_number === sectionNumber &&
             (!q.adaptive_difficulty || q.adaptive_difficulty === difficulty);
    });

    return sectionQuestions;
  }

  // Check if student should proceed to Module 2
  canProceedToModule2(module1Id) {
    const module1Score = this.moduleScores[module1Id];

    if (!module1Score) {
      console.error(`No score found for module ${module1Id}`);
      return false;
    }

    // Student must complete Module 1 before Module 2
    return module1Score.total > 0;
  }

  // Get current module status
  getModuleStatus(moduleId) {
    const score = this.moduleScores[moduleId];
    const difficulty = this.selectedDifficulties[moduleId];

    return {
      completed: !!score,
      score: score || null,
      difficulty: difficulty || null,
      answers: this.moduleAnswers[moduleId] || {}
    };
  }

  // Get overall test progress
  getTestProgress() {
    const completedModules = Object.keys(this.moduleScores).length;
    const totalModules = SAT_CONFIG.modules.length;

    const englishModules = ['rw1', 'rw2'];
    const mathModules = ['math1', 'math2'];

    const englishComplete = englishModules.every(m => this.moduleScores[m]);
    const mathComplete = mathModules.every(m => this.moduleScores[m]);

    return {
      modulesCompleted: completedModules,
      totalModules: totalModules,
      percentComplete: (completedModules / totalModules) * 100,
      englishComplete: englishComplete,
      mathComplete: mathComplete,
      scores: this.moduleScores,
      difficulties: this.selectedDifficulties
    };
  }

  // Reset test (for retakes)
  reset() {
    this.moduleScores = {};
    this.selectedDifficulties = {};
    this.moduleAnswers = {};
  }

  // Save progress to session
  saveToSession() {
    sessionStorage.setItem('satModuleScores', JSON.stringify(this.moduleScores));
    sessionStorage.setItem('satSelectedDifficulties', JSON.stringify(this.selectedDifficulties));
    sessionStorage.setItem('satModuleAnswers', JSON.stringify(this.moduleAnswers));
  }

  // Load progress from session
  loadFromSession() {
    const scores = sessionStorage.getItem('satModuleScores');
    const difficulties = sessionStorage.getItem('satSelectedDifficulties');
    const answers = sessionStorage.getItem('satModuleAnswers');

    if (scores) this.moduleScores = JSON.parse(scores);
    if (difficulties) this.selectedDifficulties = JSON.parse(difficulties);
    if (answers) this.moduleAnswers = JSON.parse(answers);

    return {
      hasProgress: !!(scores || difficulties || answers),
      moduleScores: this.moduleScores,
      selectedDifficulties: this.selectedDifficulties
    };
  }
}

// Export for use in main test file
export default SATAdaptiveManager;