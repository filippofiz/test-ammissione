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

/** Compare two flat objects by value, ignoring key insertion order. */
function objectsEqualByValue(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => String(a[k]).toLowerCase() === String(b[k]).toLowerCase());
}

/**
 * Normalize a TA answer object to an ordered array of canonical col1/col2 strings.
 *
 * DB correct_answer format:  { stmt0: "col1", stmt1: "col2", ... }  (stmtN keys, col1/col2 values)
 * Student stored format:     { 0: "true",     1: "false",    ... }  (numeric keys, true/false values)
 *
 * Both are normalized to a positionally ordered array like ["col1", "col2", "col1", ...].
 */
function normalizeTAAnswer(obj: Record<string, unknown>): string[] {
  // Determine whether keys are stmt-style ("stmt0", "stmt1"...) or numeric ("0", "1"...)
  const entries = Object.entries(obj);
  // Sort by extracted index so order is canonical regardless of insertion order
  const sorted = entries
    .map(([key, value]) => {
      const stmtMatch = key.match(/^stmt(\d+)$/);
      const numericIndex = stmtMatch ? parseInt(stmtMatch[1], 10) : parseInt(key, 10);
      // Normalize value to col1/col2
      let normalized: string;
      const v = String(value).toLowerCase();
      if (v === 'col1' || v === 'true') {
        normalized = 'col1';
      } else {
        normalized = 'col2';
      }
      return { index: numericIndex, normalized };
    })
    .sort((a, b) => a.index - b.index);
  return sorted.map(e => e.normalized);
}

/**
 * For TPA in training context: count how many columns the student got correct.
 * Returns { correct: number, total: number } so the caller can score partial credit.
 */
export function countTpaCorrectColumns(
  userAnswer: unknown,
  correctAnswer: unknown,
): { correct: number; total: number } {
  let correct = correctAnswer;
  if (Array.isArray(correctAnswer) && correctAnswer.length === 1 && typeof correctAnswer[0] === 'object') {
    correct = correctAnswer[0];
  }
  if (
    typeof correct !== 'object' || correct === null || Array.isArray(correct) ||
    typeof userAnswer !== 'object' || userAnswer === null || Array.isArray(userAnswer)
  ) {
    return { correct: 0, total: 0 };
  }
  const correctObj = correct as Record<string, unknown>;
  const userObj = userAnswer as Record<string, unknown>;
  const keys = Object.keys(correctObj);
  const correctCount = keys.filter(
    k => String(userObj[k] ?? '').toLowerCase() === String(correctObj[k]).toLowerCase()
  ).length;
  return { correct: correctCount, total: keys.length };
}

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
        // DB correct_answer: [{stmt0:"col1", stmt1:"col2", ...}]  (stmtN keys, col1/col2 values)
        // Student answer:    {0:"true", 1:"false", ...}           (numeric keys, true/false values)
        // Normalize both to an ordered col1/col2 array before comparing.
        let correct = correctAnswer;
        if (Array.isArray(correctAnswer) && correctAnswer.length === 1 && typeof correctAnswer[0] === 'object') {
          correct = correctAnswer[0];
        }
        if (typeof correct === 'object' && correct !== null && !Array.isArray(correct) &&
            typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer)) {
          const correctArr = normalizeTAAnswer(correct as Record<string, unknown>);
          const userArr = normalizeTAAnswer(userAnswer as Record<string, unknown>);
          if (correctArr.length === 0 || correctArr.length !== userArr.length) return false;
          return correctArr.every((v, i) => v === userArr[i]);
        }
        return false;
      }

      case 'TPA': {
        // DB stores [{col1: "55", col2: "65"}], student answer is {col1: "55", col2: "65"}
        // Use key-by-key comparison (not JSON.stringify) to avoid key-order false mismatches
        let correct = correctAnswer;
        if (Array.isArray(correctAnswer) && correctAnswer.length === 1 && typeof correctAnswer[0] === 'object') {
          correct = correctAnswer[0];
        }
        if (typeof correct === 'object' && correct !== null && !Array.isArray(correct) &&
            typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer)) {
          return objectsEqualByValue(userAnswer as Record<string, unknown>, correct as Record<string, unknown>);
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
