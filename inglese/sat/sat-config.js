// SAT Test Configuration
// The SAT has 4 modules: Reading/Writing 1, Reading/Writing 2, Math 1, Math 2
// Module 2 for each section is adaptive based on Module 1 performance

export const SAT_CONFIG = {
  // Test structure
  modules: [
    {
      id: 'rw1',
      name: 'Reading and Writing - Module 1',
      type: 'english',
      duration: 32 * 60, // 32 minutes in seconds
      questionCount: 27,
      isAdaptive: false,
      order: 1
    },
    {
      id: 'rw2',
      name: 'Reading and Writing - Module 2',
      type: 'english',
      duration: 32 * 60, // 32 minutes
      questionCount: 27,
      isAdaptive: true,
      adaptsFrom: 'rw1',
      order: 2
    },
    {
      id: 'math1',
      name: 'Math - Module 1',
      type: 'math',
      duration: 35 * 60, // 35 minutes
      questionCount: 22,
      isAdaptive: false,
      order: 3
    },
    {
      id: 'math2',
      name: 'Math - Module 2',
      type: 'math',
      duration: 35 * 60, // 35 minutes
      questionCount: 22,
      isAdaptive: true,
      adaptsFrom: 'math1',
      order: 4
    }
  ],

  // Adaptive algorithm configuration
  adaptive: {
    // Difficulty levels for adaptive modules
    levels: {
      EASY: 'easy',
      MEDIUM: 'medium',
      HARD: 'hard'
    },

    // Thresholds for determining difficulty of Module 2
    // Based on percentage correct in Module 1
    thresholds: {
      english: {
        hard: 0.70,    // 70%+ correct -> hard Module 2
        medium: 0.40,  // 40-69% correct -> medium Module 2
        // Below 40% -> easy Module 2
      },
      math: {
        hard: 0.68,    // 68%+ correct -> hard Module 2
        medium: 0.41,  // 41-67% correct -> medium Module 2
        // Below 41% -> easy Module 2
      }
    }
  },

  // Break configuration
  breaks: {
    afterModule2: {
      duration: 10 * 60, // 10 minute break after Module 2
      optional: false
    }
  },

  // Total test time
  totalDuration: {
    withoutBreak: (32 + 32 + 35 + 35) * 60, // 134 minutes
    withBreak: (32 + 32 + 35 + 35 + 10) * 60 // 144 minutes
  },

  // Scoring configuration
  scoring: {
    maxScore: 1600,
    sections: {
      english: {
        min: 200,
        max: 800
      },
      math: {
        min: 200,
        max: 800
      }
    }
  },

  // Navigation rules
  navigation: {
    allowBackwardWithinModule: true,  // Can go back within current module
    allowSkipQuestions: true,          // Can skip and return to questions
    lockModuleOnComplete: true,        // Cannot return to completed modules
    showModuleProgress: true,          // Show progress within module
    showOverallProgress: true          // Show overall test progress
  }
};

// Helper function to determine Module 2 difficulty
export function getAdaptiveDifficulty(moduleType, module1Score) {
  const thresholds = SAT_CONFIG.adaptive.thresholds[moduleType];

  if (module1Score >= thresholds.hard) {
    return SAT_CONFIG.adaptive.levels.HARD;
  } else if (module1Score >= thresholds.medium) {
    return SAT_CONFIG.adaptive.levels.MEDIUM;
  } else {
    return SAT_CONFIG.adaptive.levels.EASY;
  }
}

// Helper function to get next module
export function getNextModule(currentModuleId) {
  const modules = SAT_CONFIG.modules;
  const currentIndex = modules.findIndex(m => m.id === currentModuleId);

  if (currentIndex === -1 || currentIndex === modules.length - 1) {
    return null;
  }

  return modules[currentIndex + 1];
}

// Helper function to check if break is needed
export function isBreakTime(completedModuleId) {
  return completedModuleId === 'rw2'; // Break after Reading/Writing Module 2
}