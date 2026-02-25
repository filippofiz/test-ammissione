/**
 * GMAT Answer Checking Utility
 *
 * Handles the type mismatch between how correct_answer is stored in the database
 * (DI subtypes wrap answers in arrays) and how student answers are stored
 * (unwrapped form).
 *
 * Database storage (from GMAT/sources/questions/types.ts):
 *   QR/VR: correct_answer is a plain string (e.g., "c")
 *   DS:    correct_answer is ["C"]         (array of 1 string)
 *   GI:    correct_answer is ["15", "25"]  (array of 2 strings)
 *   MSR:   correct_answer is ["B", "D"]    (array of strings)
 *   TA:    correct_answer is [{obj}]       (array of 1 object)
 *   TPA:   correct_answer is [{obj}]       (array of 1 object)
 *
 * Student answer storage (from fromUnifiedAnswer):
 *   DS:  plain string "C"
 *   GI:  string[] ["15", "25"]
 *   MSR: string[] ["B", "D"]
 *   TA:  Record<string, string>
 *   TPA: { col1: string, col2: string }
 */

export function checkAnswerCorrectness(
  userAnswer: unknown,
  correctAnswer: unknown,
  diType?: string | null,
): boolean {
  if (correctAnswer == null || userAnswer == null) return false;

  // --- DI subtype-aware unwrapping and comparison ---
  if (diType) {
    switch (diType) {
      case 'DS': {
        // DB stores ["C"], student answer is "C"
        let correct = correctAnswer;
        if (Array.isArray(correctAnswer) && correctAnswer.length === 1 && typeof correctAnswer[0] === 'string') {
          correct = correctAnswer[0];
        }
        if (typeof correct === 'string' && typeof userAnswer === 'string') {
          return userAnswer.toUpperCase() === correct.toUpperCase();
        }
        return false;
      }

      case 'GI': {
        // DB stores ["15", "25"], student answer is ["15", "25"]
        // Order-sensitive (blank1 then blank2)
        const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [];
        const userArr = Array.isArray(userAnswer) ? userAnswer : [];
        if (correctArr.length !== userArr.length || correctArr.length === 0) return false;
        return correctArr.every((val: unknown, idx: number) =>
          String(val).toLowerCase() === String(userArr[idx]).toLowerCase(),
        );
      }

      case 'MSR': {
        // DB stores ["B", "D", "A"], student answer is ["B", "D", "A"]
        // Order-sensitive (each position = one sub-question)
        const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [];
        const userArr = Array.isArray(userAnswer) ? userAnswer : [];
        if (correctArr.length !== userArr.length || correctArr.length === 0) return false;
        return correctArr.every((val: unknown, idx: number) =>
          String(val).toLowerCase() === String(userArr[idx]).toLowerCase(),
        );
      }

      case 'TA': {
        // DB stores [{obj}], student answer is {obj}
        let correct = correctAnswer;
        if (Array.isArray(correctAnswer) && correctAnswer.length === 1 && typeof correctAnswer[0] === 'object') {
          correct = correctAnswer[0];
        }
        if (typeof correct === 'object' && correct !== null && !Array.isArray(correct) &&
            typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer)) {
          return JSON.stringify(userAnswer) === JSON.stringify(correct);
        }
        return false;
      }

      case 'TPA': {
        // DB stores [{col1: "55", col2: "65"}], student answer is {col1: "55", col2: "65"}
        let correct = correctAnswer;
        if (Array.isArray(correctAnswer) && correctAnswer.length === 1 && typeof correctAnswer[0] === 'object') {
          correct = correctAnswer[0];
        }
        if (typeof correct === 'object' && correct !== null && !Array.isArray(correct) &&
            typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer)) {
          return JSON.stringify(userAnswer) === JSON.stringify(correct);
        }
        return false;
      }
    }
  }

  // --- Standard comparison for QR/VR (or unknown DI type fallback) ---

  // Both strings: case-insensitive compare
  if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
    return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
  }

  // Both arrays: element-by-element comparison
  if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
    if (correctAnswer.length !== userAnswer.length) return false;
    return correctAnswer.every((val: unknown, idx: number) =>
      String(val).toLowerCase() === String(userAnswer[idx]).toLowerCase(),
    );
  }

  // Both objects: JSON stringify compare
  if (typeof correctAnswer === 'object' && correctAnswer !== null && !Array.isArray(correctAnswer) &&
      typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer)) {
    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  }

  return false;
}
