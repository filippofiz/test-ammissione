/**
 * Mock data for all demo showcase views
 * Completely self-contained — no imports from main app
 */

// ============================================================
// RESULTS DEMO DATA
// ============================================================

export const mockResults = {
  testName: 'Bocconi Admission Test — Spring 2026',
  studentName: 'Marco Rossi',
  date: 'February 10, 2026',
  stats: {
    total: 40,
    answered: 40,
    correct: 36,
    wrong: 3,
    unanswered: 1,
    flagged: 2,
    score: 90,
  },
  sections: [
    {
      name: 'Logic & Problem Solving',
      questions: [
        { id: 'q1', text: 'If all roses are flowers and some flowers fade quickly, which of the following must be true?', options: ['All roses fade quickly', 'Some roses may fade quickly', 'No roses fade quickly', 'Roses never fade'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 45, difficulty: 'Easy' },
        { id: 'q2', text: 'A sequence follows the pattern: 2, 6, 18, 54, ... What is the 7th term?', options: ['486', '1458', '4374', '2916'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 62, difficulty: 'Medium' },
        { id: 'q3', text: 'In a group of 120 students, 75 study Economics, 60 study Finance, and 30 study both. How many study neither?', options: ['15', '25', '10', '20'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 78, difficulty: 'Medium' },
        { id: 'q4', text: 'If CLOUD is coded as DMPVE, how is STORM coded?', options: ['TUPSN', 'TUSQO', 'TUPSM', 'TUSPO'], correctAnswer: 'A', studentAnswer: 'B', isCorrect: false, timeSpent: 95, difficulty: 'Hard' },
        { id: 'q5', text: 'Which shape completes the pattern in the matrix?', options: ['Triangle', 'Circle', 'Square', 'Hexagon'], correctAnswer: 'C', studentAnswer: 'C', isCorrect: true, timeSpent: 55, difficulty: 'Easy' },
        { id: 'q6', text: 'A train travels 360km in 4 hours. If it increases speed by 25%, how long for 450km?', options: ['3h 20m', '4h', '3h 36m', '4h 10m'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 70, difficulty: 'Medium' },
        { id: 'q7', text: 'Three friends A, B, C sit in a row. A is not next to C. B is to the right of A. Who is in the middle?', options: ['A', 'B', 'C', 'Cannot be determined'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 40, difficulty: 'Easy' },
        { id: 'q8', text: 'If the probability of rain is 0.3 and of wind is 0.4, and they are independent, what is P(rain AND wind)?', options: ['0.12', '0.70', '0.58', '0.10'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 50, difficulty: 'Medium' },
      ],
      stats: { total: 8, correct: 7, wrong: 1, unanswered: 0 },
    },
    {
      name: 'Mathematics',
      questions: [
        { id: 'q9', text: 'Find the derivative of f(x) = 3x\u00B3 - 2x\u00B2 + 5x - 1', options: ['9x\u00B2 - 4x + 5', '9x\u00B2 - 2x + 5', '3x\u00B2 - 4x + 5', '9x\u00B3 - 4x + 5'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 35, difficulty: 'Easy' },
        { id: 'q10', text: 'Solve: log\u2082(x) + log\u2082(x-2) = 3', options: ['x = 4', 'x = 6', 'x = 8', 'x = 3'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 88, difficulty: 'Hard' },
        { id: 'q11', text: 'What is the integral of \u222B(2x + 3)dx from 0 to 4?', options: ['28', '32', '24', '36'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 42, difficulty: 'Easy' },
        { id: 'q12', text: 'In a geometric series with a\u2081 = 3 and r = 2, find S\u2086.', options: ['189', '192', '186', '195'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 65, difficulty: 'Medium' },
        { id: 'q13', text: 'Find the equation of the tangent line to y = x\u00B2 at x = 3.', options: ['y = 6x - 9', 'y = 6x + 9', 'y = 3x - 9', 'y = 6x - 3'], correctAnswer: 'A', studentAnswer: 'C', isCorrect: false, timeSpent: 110, difficulty: 'Hard' },
        { id: 'q14', text: 'If matrix A = [[1,2],[3,4]], what is det(A)?', options: ['-2', '2', '-10', '10'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 30, difficulty: 'Easy' },
        { id: 'q15', text: 'Simplify: (x\u00B2 - 9) / (x + 3)', options: ['x - 3', 'x + 3', 'x\u00B2 - 3', '(x-3)\u00B2'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 25, difficulty: 'Easy' },
        { id: 'q16', text: 'What is the area enclosed by y = x\u00B2 and y = 4?', options: ['32/3', '16/3', '8/3', '64/3'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 75, difficulty: 'Medium' },
      ],
      stats: { total: 8, correct: 7, wrong: 1, unanswered: 0 },
    },
    {
      name: 'Reading Comprehension',
      questions: [
        { id: 'q17', text: 'According to the passage, the primary cause of the 2008 financial crisis was:', options: ['Government regulation', 'Excessive risk-taking by financial institutions', 'Foreign investment', 'Consumer spending'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 60, difficulty: 'Medium' },
        { id: 'q18', text: 'The author\'s tone in the second paragraph can best be described as:', options: ['Optimistic', 'Critical', 'Neutral', 'Sarcastic'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 45, difficulty: 'Easy' },
        { id: 'q19', text: 'Which of the following best summarizes the main argument?', options: ['Markets self-correct', 'Regulation is necessary for stability', 'Innovation drives growth', 'Competition reduces prices'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 55, difficulty: 'Medium' },
        { id: 'q20', text: 'The word "ubiquitous" in line 14 most nearly means:', options: ['Rare', 'Everywhere', 'Dangerous', 'Important'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 20, difficulty: 'Easy' },
        { id: 'q21', text: 'Based on the passage, the author would most likely agree with:', options: ['Markets need no oversight', 'Moderate regulation benefits everyone', 'All banks should be nationalized', 'Risk should be eliminated'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 50, difficulty: 'Medium' },
        { id: 'q22', text: 'The function of the third paragraph is to:', options: ['Introduce a counterargument', 'Provide evidence for the thesis', 'Summarize the passage', 'Define key terms'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 40, difficulty: 'Easy' },
        { id: 'q23', text: 'Which evidence does the author use to support the claim about market volatility?', options: ['Personal anecdotes', 'Historical data from 1929-2020', 'Expert interviews', 'Hypothetical scenarios'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 55, difficulty: 'Medium' },
        { id: 'q24', text: 'What can be inferred about the author\'s view on cryptocurrency?', options: ['Fully supportive', 'Cautiously optimistic', 'Strongly opposed', 'Indifferent'], correctAnswer: 'B', studentAnswer: null, isCorrect: false, timeSpent: 0, difficulty: 'Hard' },
      ],
      stats: { total: 8, correct: 7, wrong: 0, unanswered: 1 },
    },
    {
      name: 'Data Analysis',
      questions: [
        { id: 'q25', text: 'Based on Table 1, which country had the highest GDP growth rate in Q3?', options: ['USA', 'Germany', 'Japan', 'UK'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 35, difficulty: 'Easy' },
        { id: 'q26', text: 'What is the median of the dataset: 12, 15, 18, 22, 25, 28, 31?', options: ['22', '20', '25', '18'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 28, difficulty: 'Easy' },
        { id: 'q27', text: 'If the correlation coefficient between X and Y is 0.85, this indicates:', options: ['Strong positive correlation', 'Weak negative correlation', 'No correlation', 'Perfect correlation'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 22, difficulty: 'Easy' },
        { id: 'q28', text: 'From the bar chart, calculate the percentage increase in revenue from 2023 to 2025.', options: ['42%', '35%', '50%', '28%'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 65, difficulty: 'Medium' },
        { id: 'q29', text: 'Given the scatter plot, which regression model best fits the data?', options: ['Linear', 'Quadratic', 'Exponential', 'Logarithmic'], correctAnswer: 'C', studentAnswer: 'C', isCorrect: true, timeSpent: 50, difficulty: 'Medium' },
        { id: 'q30', text: 'Calculate the standard deviation of: 10, 12, 14, 16, 18', options: ['2.83', '3.16', '2.24', '4.00'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 80, difficulty: 'Hard' },
        { id: 'q31', text: 'In a pie chart showing market share, if Company A has 35% and Company B has 28%, how many degrees does Company B occupy?', options: ['100.8\u00B0', '126\u00B0', '96\u00B0', '108\u00B0'], correctAnswer: 'A', studentAnswer: 'A', isCorrect: true, timeSpent: 40, difficulty: 'Easy' },
        { id: 'q32', text: 'Using the provided data table, what is the interquartile range?', options: ['15', '12', '18', '20'], correctAnswer: 'A', studentAnswer: 'C', isCorrect: false, timeSpent: 95, difficulty: 'Hard' },
      ],
      stats: { total: 8, correct: 7, wrong: 1, unanswered: 0 },
    },
    {
      name: 'Critical Thinking',
      questions: [
        { id: 'q33', text: 'Which of the following, if true, would most weaken the argument?', options: ['New evidence supports the claim', 'The sample size was only 15', 'Experts agree with the conclusion', 'The study was replicated'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 55, difficulty: 'Medium' },
        { id: 'q34', text: 'Identify the logical fallacy: "Everyone is buying this product, so it must be good."', options: ['Ad hominem', 'Bandwagon', 'Straw man', 'Red herring'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 30, difficulty: 'Easy' },
        { id: 'q35', text: 'Which assumption is necessary for the argument to hold?', options: ['Costs will remain stable', 'Demand will increase indefinitely', 'Competitors will not enter the market', 'Technology will not change'], correctAnswer: 'C', studentAnswer: 'C', isCorrect: true, timeSpent: 70, difficulty: 'Hard' },
        { id: 'q36', text: 'What additional information would be most useful to evaluate this claim?', options: ['The author\'s background', 'Peer-reviewed studies on the topic', 'Public opinion polls', 'The publication date'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 45, difficulty: 'Medium' },
        { id: 'q37', text: 'The argument proceeds by:', options: ['Offering an analogy', 'Citing a counter-example', 'Making a generalization from specific cases', 'Appealing to authority'], correctAnswer: 'C', studentAnswer: 'C', isCorrect: true, timeSpent: 50, difficulty: 'Medium' },
        { id: 'q38', text: 'Which of the following would strengthen the conclusion?', options: ['Anecdotal evidence', 'A controlled experiment with 10,000 subjects', 'A celebrity endorsement', 'A philosophical argument'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 35, difficulty: 'Easy' },
        { id: 'q39', text: 'The passage contains which type of reasoning error?', options: ['Circular reasoning', 'False dichotomy', 'Correlation vs causation', 'Appeal to emotion'], correctAnswer: 'C', studentAnswer: 'C', isCorrect: true, timeSpent: 60, difficulty: 'Medium' },
        { id: 'q40', text: 'Evaluate the strength of the evidence presented in paragraph 3.', options: ['Very strong — multiple sources', 'Moderate — single study', 'Weak — no data cited', 'Irrelevant'], correctAnswer: 'B', studentAnswer: 'B', isCorrect: true, timeSpent: 48, difficulty: 'Medium' },
      ],
      stats: { total: 8, correct: 8, wrong: 0, unanswered: 0 },
    },
  ],
};

// Time data for charts
export const mockTimeData = mockResults.sections.flatMap((section, si) =>
  section.questions.map((q, qi) => ({
    questionNumber: si * 8 + qi + 1,
    timeSpent: q.timeSpent,
    expected: 60,
    isCorrect: q.isCorrect,
    section: section.name,
  }))
);

export const mockPacingData = mockTimeData.reduce<{ question: number; actual: number; expected: number }[]>((acc, item, idx) => {
  const prev = idx > 0 ? acc[idx - 1] : { actual: 0, expected: 0 };
  acc.push({
    question: item.questionNumber,
    actual: prev.actual + item.timeSpent,
    expected: prev.expected + item.expected,
  });
  return acc;
}, []);

// ============================================================
// TAKE TEST DEMO DATA
// ============================================================

export const mockTestQuestions = [
  {
    id: 'tq1',
    number: 1,
    section: 'Logic & Problem Solving',
    text: 'A company has 150 employees. 90 speak English, 70 speak French, and 40 speak both. How many speak neither?',
    options: [
      { label: 'A', text: '30' },
      { label: 'B', text: '20' },
      { label: 'C', text: '40' },
      { label: 'D', text: '10' },
    ],
    correctAnswer: 'A',
    difficulty: 'Medium',
    timeLimit: 90,
  },
  {
    id: 'tq2',
    number: 2,
    section: 'Logic & Problem Solving',
    text: 'If all managers are employees and some employees are part-time, which statement MUST be true?',
    options: [
      { label: 'A', text: 'All managers are part-time' },
      { label: 'B', text: 'Some managers may be part-time' },
      { label: 'C', text: 'No managers are part-time' },
      { label: 'D', text: 'All part-time workers are managers' },
    ],
    correctAnswer: 'B',
    difficulty: 'Easy',
    timeLimit: 60,
  },
  {
    id: 'tq3',
    number: 3,
    section: 'Mathematics',
    text: 'What is the value of x if 3x + 7 = 22?',
    options: [
      { label: 'A', text: '5' },
      { label: 'B', text: '7' },
      { label: 'C', text: '3' },
      { label: 'D', text: '15' },
    ],
    correctAnswer: 'A',
    difficulty: 'Easy',
    timeLimit: 45,
  },
  {
    id: 'tq4',
    number: 4,
    section: 'Mathematics',
    text: 'A circle has a radius of 7cm. What is its area? (Use \u03C0 \u2248 3.14)',
    options: [
      { label: 'A', text: '153.86 cm\u00B2' },
      { label: 'B', text: '43.96 cm\u00B2' },
      { label: 'C', text: '49 cm\u00B2' },
      { label: 'D', text: '21.98 cm\u00B2' },
    ],
    correctAnswer: 'A',
    difficulty: 'Medium',
    timeLimit: 60,
  },
  {
    id: 'tq5',
    number: 5,
    section: 'Reading Comprehension',
    text: 'Based on the passage about sustainable energy, the author primarily argues that:',
    options: [
      { label: 'A', text: 'Solar energy is the only viable alternative' },
      { label: 'B', text: 'A diversified energy portfolio is essential for sustainability' },
      { label: 'C', text: 'Nuclear energy should be completely abandoned' },
      { label: 'D', text: 'Fossil fuels will remain dominant for decades' },
    ],
    correctAnswer: 'B',
    difficulty: 'Medium',
    timeLimit: 75,
  },
  {
    id: 'tq6',
    number: 6,
    section: 'Data Analysis',
    text: 'Given the dataset {4, 8, 12, 16, 20}, what is the mean?',
    options: [
      { label: 'A', text: '12' },
      { label: 'B', text: '10' },
      { label: 'C', text: '14' },
      { label: 'D', text: '8' },
    ],
    correctAnswer: 'A',
    difficulty: 'Easy',
    timeLimit: 30,
  },
  {
    id: 'tq7',
    number: 7,
    section: 'Critical Thinking',
    text: '"Since the CEO went to Harvard, and Harvard graduates are successful, the company will be successful." This is an example of:',
    options: [
      { label: 'A', text: 'Valid deductive reasoning' },
      { label: 'B', text: 'Hasty generalization' },
      { label: 'C', text: 'Appeal to authority' },
      { label: 'D', text: 'Circular reasoning' },
    ],
    correctAnswer: 'B',
    difficulty: 'Hard',
    timeLimit: 90,
  },
  {
    id: 'tq8',
    number: 8,
    section: 'Critical Thinking',
    text: 'Which evidence would most strengthen the hypothesis that exercise improves academic performance?',
    options: [
      { label: 'A', text: 'A testimonial from a student athlete' },
      { label: 'B', text: 'A longitudinal study of 5,000 students over 3 years' },
      { label: 'C', text: 'A blog post by a fitness trainer' },
      { label: 'D', text: 'A single classroom observation' },
    ],
    correctAnswer: 'B',
    difficulty: 'Medium',
    timeLimit: 60,
  },
];

// ============================================================
// STUDENT DASHBOARD DATA
// ============================================================

export const mockStudentDashboard = {
  studentName: 'Marco Rossi',
  testDate: '2026-03-15',
  daysRemaining: 30,
  tracks: [
    {
      name: 'Logic & Problem Solving',
      color: '#3B82F6',
      tests: [
        { id: 't1', name: 'Exercise 1', status: 'completed' as const, score: 88 },
        { id: 't2', name: 'Exercise 2', status: 'completed' as const, score: 92 },
        { id: 't3', name: 'Exercise 3', status: 'completed' as const, score: 85 },
        { id: 't4', name: 'Exercise 4', status: 'unlocked' as const, score: null },
        { id: 't5', name: 'Exercise 5', status: 'locked' as const, score: null },
      ],
      progress: 60,
    },
    {
      name: 'Mathematics',
      color: '#8B5CF6',
      tests: [
        { id: 't6', name: 'Exercise 1', status: 'completed' as const, score: 95 },
        { id: 't7', name: 'Exercise 2', status: 'completed' as const, score: 90 },
        { id: 't8', name: 'Exercise 3', status: 'unlocked' as const, score: null },
        { id: 't9', name: 'Exercise 4', status: 'locked' as const, score: null },
        { id: 't10', name: 'Exercise 5', status: 'locked' as const, score: null },
      ],
      progress: 40,
    },
    {
      name: 'Reading Comprehension',
      color: '#10B981',
      tests: [
        { id: 't11', name: 'Exercise 1', status: 'completed' as const, score: 78 },
        { id: 't12', name: 'Exercise 2', status: 'completed' as const, score: 82 },
        { id: 't13', name: 'Exercise 3', status: 'completed' as const, score: 88 },
        { id: 't14', name: 'Exercise 4', status: 'completed' as const, score: 91 },
        { id: 't15', name: 'Exercise 5', status: 'unlocked' as const, score: null },
      ],
      progress: 80,
    },
    {
      name: 'Data Analysis',
      color: '#F59E0B',
      tests: [
        { id: 't16', name: 'Exercise 1', status: 'completed' as const, score: 86 },
        { id: 't17', name: 'Exercise 2', status: 'unlocked' as const, score: null },
        { id: 't18', name: 'Exercise 3', status: 'locked' as const, score: null },
        { id: 't19', name: 'Exercise 4', status: 'locked' as const, score: null },
        { id: 't20', name: 'Exercise 5', status: 'locked' as const, score: null },
      ],
      progress: 20,
    },
    {
      name: 'Critical Thinking',
      color: '#EF4444',
      tests: [
        { id: 't21', name: 'Exercise 1', status: 'completed' as const, score: 94 },
        { id: 't22', name: 'Exercise 2', status: 'completed' as const, score: 88 },
        { id: 't23', name: 'Exercise 3', status: 'completed' as const, score: 91 },
        { id: 't24', name: 'Exercise 4', status: 'unlocked' as const, score: null },
        { id: 't25', name: 'Exercise 5', status: 'locked' as const, score: null },
      ],
      progress: 60,
    },
  ],
};

// ============================================================
// TUTOR ANALYTICS DATA
// ============================================================

export const mockStudents = [
  { id: 's1', name: 'Marco Rossi', email: 'marco.rossi@email.com', testDate: '2026-02-20', daysRemaining: 7, progress: 85, urgency: 'critical' as const, testsCompleted: 17, testsTotal: 25, avgScore: 88, trend: 'up' as const, schoolGrade: 8.5 },
  { id: 's2', name: 'Sofia Bianchi', email: 'sofia.b@email.com', testDate: '2026-02-28', daysRemaining: 15, progress: 72, urgency: 'high' as const, testsCompleted: 14, testsTotal: 25, avgScore: 82, trend: 'up' as const, schoolGrade: 7.8 },
  { id: 's3', name: 'Luca Ferrari', email: 'luca.f@email.com', testDate: '2026-03-10', daysRemaining: 25, progress: 60, urgency: 'medium' as const, testsCompleted: 12, testsTotal: 25, avgScore: 75, trend: 'stable' as const, schoolGrade: 7.2 },
  { id: 's4', name: 'Giulia Romano', email: 'giulia.r@email.com', testDate: '2026-03-15', daysRemaining: 30, progress: 90, urgency: 'low' as const, testsCompleted: 22, testsTotal: 25, avgScore: 92, trend: 'up' as const, schoolGrade: 9.1 },
  { id: 's5', name: 'Alessandro Conti', email: 'alex.c@email.com', testDate: '2026-03-20', daysRemaining: 35, progress: 45, urgency: 'medium' as const, testsCompleted: 9, testsTotal: 25, avgScore: 70, trend: 'down' as const, schoolGrade: 6.8 },
  { id: 's6', name: 'Elena Moretti', email: 'elena.m@email.com', testDate: '2026-04-01', daysRemaining: 47, progress: 55, urgency: 'low' as const, testsCompleted: 11, testsTotal: 25, avgScore: 78, trend: 'up' as const, schoolGrade: 7.5 },
  { id: 's7', name: 'Matteo Ricci', email: 'matteo.r@email.com', testDate: '2026-02-18', daysRemaining: 5, progress: 65, urgency: 'critical' as const, testsCompleted: 13, testsTotal: 25, avgScore: 74, trend: 'stable' as const, schoolGrade: 7.0 },
  { id: 's8', name: 'Chiara Colombo', email: 'chiara.c@email.com', testDate: '2026-04-15', daysRemaining: 61, progress: 30, urgency: 'low' as const, testsCompleted: 6, testsTotal: 25, avgScore: 68, trend: 'up' as const, schoolGrade: 6.5 },
];

// Student deep dive data (for Marco Rossi)
export const mockStudentProfile = {
  name: 'Marco Rossi',
  email: 'marco.rossi@email.com',
  testDate: '2026-02-20',
  schoolGrade: 8.5,
  testHistory: [
    { date: '2026-01-05', testName: 'Logic Ex. 1', score: 72 },
    { date: '2026-01-12', testName: 'Math Ex. 1', score: 78 },
    { date: '2026-01-18', testName: 'Logic Ex. 2', score: 80 },
    { date: '2026-01-25', testName: 'Reading Ex. 1', score: 75 },
    { date: '2026-01-30', testName: 'Math Ex. 2', score: 85 },
    { date: '2026-02-03', testName: 'Critical Ex. 1', score: 88 },
    { date: '2026-02-07', testName: 'Logic Ex. 3', score: 85 },
    { date: '2026-02-10', testName: 'Data Ex. 1', score: 90 },
  ],
  sectionScores: [
    { section: 'Logic', score: 85, maxScore: 100 },
    { section: 'Math', score: 90, maxScore: 100 },
    { section: 'Reading', score: 78, maxScore: 100 },
    { section: 'Data', score: 86, maxScore: 100 },
    { section: 'Critical', score: 88, maxScore: 100 },
  ],
  weakAreas: ['Reading Comprehension', 'Data Analysis — IQR calculations'],
  strengths: ['Mathematics', 'Critical Thinking', 'Logic'],
};

// ============================================================
// GMAT DATA
// ============================================================

export const mockGMATResults = {
  estimatedScore: 720,
  percentile: 94,
  sections: [
    { name: 'Quantitative Reasoning', score: 85, maxScore: 100, questions: 31, correct: 26, timeSpent: 2790 },
    { name: 'Data Insights', score: 80, maxScore: 100, questions: 20, correct: 16, timeSpent: 1800 },
    { name: 'Verbal Reasoning', score: 82, maxScore: 100, questions: 23, correct: 19, timeSpent: 2070 },
  ],
  difficultyBreakdown: {
    easy: { correct: 28, total: 30, percentage: 93 },
    medium: { correct: 22, total: 28, percentage: 79 },
    hard: { correct: 11, total: 16, percentage: 69 },
  },
  completedAt: 'February 8, 2026',
};

export const mockGMATPrep = {
  sections: [
    {
      name: 'Quantitative Reasoning',
      color: '#3B82F6',
      icon: 'calculator',
      topics: [
        { name: 'Algebra', progress: 90, completed: 9, total: 10 },
        { name: 'Geometry', progress: 70, completed: 7, total: 10 },
        { name: 'Number Properties', progress: 80, completed: 8, total: 10 },
        { name: 'Word Problems', progress: 60, completed: 6, total: 10 },
      ],
    },
    {
      name: 'Data Insights',
      color: '#8B5CF6',
      icon: 'chart',
      topics: [
        { name: 'Data Sufficiency', progress: 85, completed: 17, total: 20 },
        { name: 'Multi-Source Reasoning', progress: 65, completed: 13, total: 20 },
        { name: 'Graphics Interpretation', progress: 75, completed: 15, total: 20 },
        { name: 'Table Analysis', progress: 50, completed: 10, total: 20 },
      ],
    },
    {
      name: 'Verbal Reasoning',
      color: '#10B981',
      icon: 'book',
      topics: [
        { name: 'Critical Reasoning', progress: 88, completed: 22, total: 25 },
        { name: 'Reading Comprehension', progress: 72, completed: 18, total: 25 },
        { name: 'Sentence Correction', progress: 80, completed: 20, total: 25 },
      ],
    },
  ],
  nextRecommended: 'Table Analysis — Practice Set 11',
};

// ============================================================
// QUESTION TYPES GALLERY DATA
// ============================================================

export const mockQuestionTypes = [
  {
    type: 'Multiple Choice',
    icon: 'list',
    color: '#3B82F6',
    description: 'Standard multiple choice with 4-5 options',
    sampleQuestion: 'What is the capital of France?',
    sampleOptions: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 1,
  },
  {
    type: 'Data Sufficiency',
    icon: 'database',
    color: '#8B5CF6',
    description: 'Determine if given statements provide sufficient data to answer',
    sampleQuestion: 'Is x > 5?',
    sampleStatements: ['(1) x\u00B2 = 36', '(2) x > 0'],
    correctAnswer: 'C — Both statements together are sufficient',
  },
  {
    type: 'Multi-Source Reasoning',
    icon: 'layers',
    color: '#10B981',
    description: 'Analyze information from multiple tabs and sources',
    sampleQuestion: 'Based on the email and the spreadsheet, what was the Q3 target?',
    sources: ['Email from Director', 'Financial Spreadsheet', 'Meeting Notes'],
  },
  {
    type: 'Graphics Interpretation',
    icon: 'bar-chart',
    color: '#F59E0B',
    description: 'Interpret data from charts, graphs, and visual displays',
    sampleQuestion: 'Select the value from the dropdown that completes the statement.',
    chartType: 'Bar chart showing revenue by quarter',
  },
  {
    type: 'Table Analysis',
    icon: 'table',
    color: '#EF4444',
    description: 'Analyze sortable data tables and evaluate statements',
    sampleQuestion: 'For each statement, indicate whether it is True or False based on the data.',
    statements: ['Revenue increased YoY', 'Europe had highest growth', 'Q4 was the weakest quarter'],
  },
  {
    type: 'Two-Part Analysis',
    icon: 'columns',
    color: '#06B6D4',
    description: 'Select one answer for each of two related components',
    sampleQuestion: 'Find values of x and y that satisfy both equations.',
    columns: ['Value of x', 'Value of y'],
    options: ['2', '4', '6', '8', '10'],
  },
];

// ============================================================
// AI VALIDATION DATA
// ============================================================

export const mockAIValidation = {
  totalQuestions: 847,
  validatedCount: 841,
  accuracy: 99.2,
  flaggedCount: 6,
  categories: {
    contentIssues: 2,
    technicalIssues: 1,
    formattingIssues: 2,
    duplicates: 1,
  },
  recentValidations: [
    { id: 'av1', questionText: 'Calculate the derivative of f(x) = sin(2x)', status: 'valid' as const, confidence: 98, checks: ['Content', 'LaTeX', 'Options', 'Answer'] },
    { id: 'av2', questionText: 'Which country has the largest GDP?', status: 'valid' as const, confidence: 99, checks: ['Content', 'Formatting', 'Options', 'Answer'] },
    { id: 'av3', questionText: 'Solve the system of equations: 2x + y = 7, x - y = 2', status: 'valid' as const, confidence: 97, checks: ['Content', 'LaTeX', 'Options', 'Answer'] },
    { id: 'av4', questionText: 'The median of {3, 7, 9, 12, 15} is:', status: 'flagged' as const, confidence: 72, checks: ['Content', 'Options'], issue: 'Duplicate detected — similar to Q#412' },
    { id: 'av5', questionText: 'If P(A) = 0.4 and P(B) = 0.3, find P(A\u222AB)', status: 'valid' as const, confidence: 95, checks: ['Content', 'LaTeX', 'Options', 'Answer'] },
    { id: 'av6', questionText: 'Evaluate the integral of x\u00B2 from 0 to 3', status: 'valid' as const, confidence: 99, checks: ['Content', 'LaTeX', 'Options', 'Answer'] },
    { id: 'av7', questionText: 'Based on the chart, which sector grew fastest?', status: 'flagged' as const, confidence: 65, checks: ['Content', 'Image'], issue: 'Image reference missing — chart not found' },
    { id: 'av8', questionText: 'What is the primary function of mitochondria?', status: 'valid' as const, confidence: 98, checks: ['Content', 'Options', 'Answer'] },
    { id: 'av9', questionText: 'Simplify: (a+b)\u00B2 - (a-b)\u00B2', status: 'valid' as const, confidence: 100, checks: ['Content', 'LaTeX', 'Options', 'Answer'] },
    { id: 'av10', questionText: 'The correlation coefficient r = 0.95 indicates:', status: 'valid' as const, confidence: 96, checks: ['Content', 'Options', 'Answer'] },
    { id: 'av11', questionText: 'According to paragraph 2, the author implies that...', status: 'flagged' as const, confidence: 58, checks: ['Content'], issue: 'Formatting — LaTeX rendering error in option C' },
    { id: 'av12', questionText: 'If a triangle has sides 3, 4, and 5, what type is it?', status: 'valid' as const, confidence: 99, checks: ['Content', 'Options', 'Answer'] },
  ],
};

// ============================================================
// EXAM SIMULATION DATA
// ============================================================

export const mockTolcIQuestions = [
  { id: 'ti1', number: 8, section: 'Matematica', text: 'Quale è il valore di log₂(32)?', options: [{ label: 'A', text: '4' }, { label: 'B', text: '5' }, { label: 'C', text: '6' }, { label: 'D', text: '3' }], difficulty: 'Media', timeLimit: 90 },
  { id: 'ti2', number: 9, section: 'Matematica', text: 'Se f(x) = 3x² - 2x + 1, quanto vale f(2)?', options: [{ label: 'A', text: '9' }, { label: 'B', text: '13' }, { label: 'C', text: '11' }, { label: 'D', text: '7' }], difficulty: 'Facile', timeLimit: 60 },
  { id: 'ti3', number: 10, section: 'Logica', text: 'Se tutti i medici sono laureati e Marco è un medico, quale conclusione è valida?', options: [{ label: 'A', text: 'Marco non è laureato' }, { label: 'B', text: 'Marco è laureato' }, { label: 'C', text: 'Tutti i laureati sono medici' }, { label: 'D', text: 'Nessuna conclusione è valida' }], difficulty: 'Facile', timeLimit: 60 },
  { id: 'ti4', number: 11, section: 'Matematica', text: 'L\'integrale definito ∫₀² (2x + 1)dx vale:', options: [{ label: 'A', text: '6' }, { label: 'B', text: '8' }, { label: 'C', text: '5' }, { label: 'D', text: '7' }], difficulty: 'Media', timeLimit: 90 },
  { id: 'ti5', number: 12, section: 'Logica', text: 'In una sequenza: 2, 6, 18, 54, ... Qual è il prossimo termine?', options: [{ label: 'A', text: '108' }, { label: 'B', text: '162' }, { label: 'C', text: '216' }, { label: 'D', text: '72' }], difficulty: 'Facile', timeLimit: 60 },
];

export const mockTolcMedQuestions = [
  { id: 'tm1', number: 15, section: 'Biologia', text: 'Quale organello cellulare è responsabile della sintesi proteica?', options: [{ label: 'A', text: 'Mitocondrio' }, { label: 'B', text: 'Ribosoma' }, { label: 'C', text: 'Lisosoma' }, { label: 'D', text: 'Apparato di Golgi' }], difficulty: 'Facile', timeLimit: 60 },
  { id: 'tm2', number: 16, section: 'Chimica', text: 'Qual è il numero di ossidazione del manganese in KMnO₄?', options: [{ label: 'A', text: '+5' }, { label: 'B', text: '+7' }, { label: 'C', text: '+3' }, { label: 'D', text: '+6' }], difficulty: 'Media', timeLimit: 90 },
  { id: 'tm3', number: 17, section: 'Biologia', text: 'La mitosi produce:', options: [{ label: 'A', text: '4 cellule aploidi' }, { label: 'B', text: '2 cellule diploidi identiche' }, { label: 'C', text: '2 cellule aploidi' }, { label: 'D', text: '4 cellule diploidi' }], difficulty: 'Facile', timeLimit: 60 },
  { id: 'tm4', number: 18, section: 'Chimica', text: 'Quale legame chimico si forma tra Na e Cl nel NaCl?', options: [{ label: 'A', text: 'Covalente polare' }, { label: 'B', text: 'Ionico' }, { label: 'C', text: 'Metallico' }, { label: 'D', text: 'Covalente apolare' }], difficulty: 'Facile', timeLimit: 60 },
  { id: 'tm5', number: 19, section: 'Biologia', text: 'Il DNA è composto da nucleotidi contenenti:', options: [{ label: 'A', text: 'Ribosio, base azotata, gruppo fosfato' }, { label: 'B', text: 'Desossiribosio, base azotata, gruppo fosfato' }, { label: 'C', text: 'Glucosio, base azotata, gruppo fosfato' }, { label: 'D', text: 'Fruttosio, base azotata, gruppo fosfato' }], difficulty: 'Media', timeLimit: 90 },
];

export const mockTolcEQuestions = [
  { id: 'te1', number: 10, section: 'Logica', text: 'Se piove, il terreno è bagnato. Il terreno non è bagnato. Quale conclusione è corretta?', options: [{ label: 'A', text: 'Piove' }, { label: 'B', text: 'Non piove' }, { label: 'C', text: 'Potrebbe piovere' }, { label: 'D', text: 'Il terreno è asciutto perché è estate' }], difficulty: 'Facile', timeLimit: 60 },
  { id: 'te2', number: 11, section: 'Comprensione', text: 'Nel brano, l\'autore sostiene che la globalizzazione ha portato principalmente a:', options: [{ label: 'A', text: 'Una riduzione della povertà globale' }, { label: 'B', text: 'Un aumento delle disuguaglianze' }, { label: 'C', text: 'Una maggiore interconnessione economica' }, { label: 'D', text: 'L\'isolamento dei mercati locali' }], difficulty: 'Media', timeLimit: 90 },
  { id: 'te3', number: 12, section: 'Logica', text: 'Completa la serie: 1, 1, 2, 3, 5, 8, ...', options: [{ label: 'A', text: '11' }, { label: 'B', text: '13' }, { label: 'C', text: '10' }, { label: 'D', text: '15' }], difficulty: 'Facile', timeLimit: 60 },
  { id: 'te4', number: 13, section: 'Comprensione', text: 'Il tono dell\'autore nel terzo paragrafo può essere definito come:', options: [{ label: 'A', text: 'Ottimista' }, { label: 'B', text: 'Critico' }, { label: 'C', text: 'Neutrale' }, { label: 'D', text: 'Sarcastico' }], difficulty: 'Media', timeLimit: 90 },
  { id: 'te5', number: 14, section: 'Logica', text: 'Se A > B e B > C, quale affermazione è necessariamente vera?', options: [{ label: 'A', text: 'C > A' }, { label: 'B', text: 'A > C' }, { label: 'C', text: 'A = C' }, { label: 'D', text: 'B = C' }], difficulty: 'Facile', timeLimit: 60 },
];

export const mockGmatSimQuestions = [
  { id: 'gm1', number: 12, section: 'Quantitative', text: 'Is x > 0?\n\n(1) x² > 0\n(2) x³ > 0', options: [{ label: 'A', text: 'Statement (1) ALONE is sufficient' }, { label: 'B', text: 'Statement (2) ALONE is sufficient' }, { label: 'C', text: 'BOTH statements TOGETHER are sufficient' }, { label: 'D', text: 'EACH statement ALONE is sufficient' }, { label: 'E', text: 'Statements (1) and (2) TOGETHER are NOT sufficient' }], difficulty: 'Medium', timeLimit: 120 },
  { id: 'gm2', number: 13, section: 'Data Sufficiency', text: 'What is the value of integer n?\n\n(1) n is a prime number between 10 and 20\n(2) n is odd', options: [{ label: 'A', text: 'Statement (1) ALONE is sufficient' }, { label: 'B', text: 'Statement (2) ALONE is sufficient' }, { label: 'C', text: 'BOTH statements TOGETHER are sufficient' }, { label: 'D', text: 'EACH statement ALONE is sufficient' }, { label: 'E', text: 'Statements (1) and (2) TOGETHER are NOT sufficient' }], difficulty: 'Hard', timeLimit: 120 },
  { id: 'gm3', number: 14, section: 'Quantitative', text: 'A store sells shirts for $40 each. During a sale, the price is reduced by 20%. If a customer buys 3 shirts during the sale, what is the total cost?', options: [{ label: 'A', text: '$84' }, { label: 'B', text: '$96' }, { label: 'C', text: '$100' }, { label: 'D', text: '$108' }, { label: 'E', text: '$120' }], difficulty: 'Easy', timeLimit: 90 },
  { id: 'gm4', number: 15, section: 'Data Sufficiency', text: 'Is triangle ABC isosceles?\n\n(1) Angle A = 70°\n(2) Angle B = 70°', options: [{ label: 'A', text: 'Statement (1) ALONE is sufficient' }, { label: 'B', text: 'Statement (2) ALONE is sufficient' }, { label: 'C', text: 'BOTH statements TOGETHER are sufficient' }, { label: 'D', text: 'EACH statement ALONE is sufficient' }, { label: 'E', text: 'Statements (1) and (2) TOGETHER are NOT sufficient' }], difficulty: 'Medium', timeLimit: 120 },
  { id: 'gm5', number: 16, section: 'Quantitative', text: 'If the average of 5 numbers is 12 and the average of 3 of those numbers is 8, what is the average of the other 2 numbers?', options: [{ label: 'A', text: '14' }, { label: 'B', text: '16' }, { label: 'C', text: '18' }, { label: 'D', text: '20' }, { label: 'E', text: '22' }], difficulty: 'Medium', timeLimit: 120 },
];

export const mockSatQuestions = [
  { id: 'sa1', number: 22, section: 'Reading & Writing', text: 'The author\'s use of the word "ephemeral" in line 14 most nearly means:', options: [{ label: 'A', text: 'Lasting' }, { label: 'B', text: 'Fleeting' }, { label: 'C', text: 'Important' }, { label: 'D', text: 'Mysterious' }], difficulty: 'Easy', timeLimit: 75 },
  { id: 'sa2', number: 23, section: 'Reading & Writing', text: 'Which choice best describes the function of the third paragraph in relation to the passage as a whole?', options: [{ label: 'A', text: 'It introduces a counterargument to the main thesis' }, { label: 'B', text: 'It provides evidence supporting the author\'s claim' }, { label: 'C', text: 'It summarizes the previous two paragraphs' }, { label: 'D', text: 'It transitions to a new topic' }], difficulty: 'Medium', timeLimit: 75 },
  { id: 'sa3', number: 24, section: 'Math', text: 'If 3x + 7 = 22, what is the value of 6x + 3?', options: [{ label: 'A', text: '27' }, { label: 'B', text: '30' }, { label: 'C', text: '33' }, { label: 'D', text: '36' }], difficulty: 'Easy', timeLimit: 75 },
  { id: 'sa4', number: 25, section: 'Math', text: 'A circle has a circumference of 16π. What is its area?', options: [{ label: 'A', text: '32π' }, { label: 'B', text: '64π' }, { label: 'C', text: '128π' }, { label: 'D', text: '256π' }], difficulty: 'Medium', timeLimit: 75 },
  { id: 'sa5', number: 26, section: 'Reading & Writing', text: 'Based on the data in the table, which conclusion is best supported?', options: [{ label: 'A', text: 'Sales increased consistently from 2020 to 2024' }, { label: 'B', text: 'The largest year-over-year increase occurred in 2023' }, { label: 'C', text: 'Total revenue exceeded $10 million in every year' }, { label: 'D', text: 'Growth rates declined after 2022' }], difficulty: 'Medium', timeLimit: 75 },
];

// ============================================================
// TEST PREP DATA — ATTEMPTS COMPARISON
// ============================================================

export const mockAttemptsData = {
  examName: 'TOLC-I',
  attempts: [
    { number: 1, date: 'Gen 15', overall: 65, sections: [{ name: 'Matematica', score: 60 }, { name: 'Logica', score: 70 }, { name: 'Scienze', score: 55 }, { name: 'Comprensione', score: 75 }, { name: 'Inglese', score: 65 }] },
    { number: 2, date: 'Gen 28', overall: 78, sections: [{ name: 'Matematica', score: 75 }, { name: 'Logica', score: 82 }, { name: 'Scienze', score: 70 }, { name: 'Comprensione', score: 85 }, { name: 'Inglese', score: 78 }] },
    { number: 3, date: 'Feb 10', overall: 88, sections: [{ name: 'Matematica', score: 85 }, { name: 'Logica', score: 92 }, { name: 'Scienze', score: 82 }, { name: 'Comprensione', score: 92 }, { name: 'Inglese', score: 88 }] },
  ],
};

// ============================================================
// TEST PREP DATA — END OF PATH REPORT
// ============================================================

export const mockEndOfPathData = {
  examName: 'TOLC-I',
  studentName: 'Marco Rossi',
  startScore: 65,
  finalScore: 88,
  improvement: 23,
  totalQuestionsPracticed: 450,
  totalTimeSpent: '32 ore',
  simulationsCompleted: 12,
  sections: [
    { name: 'Matematica', mastery: 85, status: 'strong' as const },
    { name: 'Logica', mastery: 92, status: 'strong' as const },
    { name: 'Scienze', mastery: 82, status: 'good' as const },
    { name: 'Comprensione', mastery: 92, status: 'strong' as const },
    { name: 'Inglese', mastery: 88, status: 'strong' as const },
  ],
  strengths: ['Ragionamento logico', 'Comprensione del testo', 'Algebra e funzioni'],
  improved: ['Chimica organica', 'Geometria analitica', 'Probabilità e statistica'],
  readyForExam: true,
};
