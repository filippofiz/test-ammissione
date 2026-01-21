import {
  QuantitativeReasoningQuestion,
  QRQuestionData,
  generateMCAnswers,
} from "../types";

export const quantitativeReasoningQuestionsSI: QuantitativeReasoningQuestion[] = [
  {
    id: "QR-GMAT-SI__-00001",
    question_number: 1,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The rainfall in City M during May of last year was 3 times the average (arithmetic mean) monthly rainfall for the other 11 months of last year. If the average monthly rainfall for last year was 3.5 inches, what was the rainfall, in inches, in City M during May?",
      options: {
        a: "1.5",
        b: "2",
        c: "4.5",
        d: "6",
        e: "9",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Let $r$ be the average monthly rainfall for the 11 months excluding May. The total rainfall for the year is $11r + 3r = 14r$ (since May had 3 times the average). The average for all 12 months is $\\frac{14r}{12} = 3.5$. Solving: $14r = 42$, so $r = 3$. Therefore, May's rainfall was $3r = 3(3) = 9$ inches. The correct answer is E.",
    categories: ["Arithmetic", "Statistics"],
  },
  {
    id: "QR-GMAT-SI__-00002",
    question_number: 2,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "The average (arithmetic mean) selling price of 5 houses in a certain neighborhood was $250,000. If the average selling price of 3 of the houses was $280,000, what was the average selling price of the other 2 houses?",
      options: {
        a: "$205,000",
        b: "$215,000",
        c: "$220,000",
        d: "$240,000",
        e: "$250,000",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "The total selling price of all 5 houses is $5 \\times 250,000 = 1,250,000$. The total selling price of 3 houses is $3 \\times 280,000 = 840,000$. The total selling price of the other 2 houses is $1,250,000 - 840,000 = 410,000$. The average selling price of the other 2 houses is $\\frac{410,000}{2} = 205,000$. The correct answer is A.",
    categories: ["Arithmetic", "Statistics"],
  },
  {
    id: "QR-GMAT-SI__-00003",
    question_number: 3,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Each book in a certain library is classified in one of three categories: fiction, nonfiction, or biography. The ratio of the number of fiction books to the number of nonfiction books is 4 to 3, and the ratio of the number of nonfiction books to the number of biographies is 3 to 2. If there are at least 10,000 books in the library, what is the least number of books that could be in the library?",
      options: {
        a: "10,000",
        b: "10,002",
        c: "10,005",
        d: "10,008",
        e: "10,009",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The ratio of fiction:nonfiction:biography is $4:3:2$ (combining the two given ratios). This means the total number of books must be a multiple of $4+3+2=9$. The smallest multiple of 9 that is at least 10,000 is found by dividing: $\\frac{10,000}{9} \\approx 1,111.11$, so we need $1,112 \\times 9 = 10,008$. The correct answer is D.",
    categories: ["Arithmetic", "Ratio and proportion"],
  },
  {
    id: "QR-GMAT-SI__-00004",
    question_number: 4,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Last fall, 40 percent of the students at a certain high school participated in after-school activities. Of those participating, 25 percent were in the chorus. If there were $x$ students in the high school last fall, how many students, in terms of $x$, were in the chorus?",
      options: {
        a: "$0.30x$",
        b: "$0.16x$",
        c: "$0.15x$",
        d: "$0.10x$",
        e: "$0.06x$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The number of students participating in after-school activities is $0.40x$. Of those, 25% were in the chorus, so the number in the chorus is $0.25 \\times 0.40x = 0.10x$. The correct answer is D.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-SI__-00005",
    question_number: 5,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Yesterday the price of a certain stock increased by 0.75 of 1 percent. By what fraction did the price of the stock increase yesterday?",
      options: {
        a: "$\\frac{3}{4}$",
        b: "$\\frac{1}{75}$",
        c: "$\\frac{3}{40}$",
        d: "$\\frac{3}{400}$",
        e: "$\\frac{1}{7,500}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "An increase of 0.75 of 1 percent means $0.75\\% = \\frac{0.75}{100} = \\frac{75}{10,000} = \\frac{3}{400}$. The correct answer is D.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-SI__-00006",
    question_number: 6,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "A contractor hired two paving firms to pave a parking lot. The first firm was to pave $\\frac{5}{8}$ of the parking lot, and the second firm was to pave the rest. On the first day, the first firm paved $\\frac{2}{3}$ of its portion and the second firm paved $\\frac{1}{2}$ of its portion. What fraction of the parking lot was not paved on the first day?",
      options: {
        a: "$\\frac{8}{48}$",
        b: "$\\frac{10}{48}$",
        c: "$\\frac{15}{48}$",
        d: "$\\frac{16}{48}$",
        e: "$\\frac{19}{48}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "The first firm paved $\\frac{2}{3} \\times \\frac{5}{8} = \\frac{10}{24} = \\frac{5}{12}$ of the total lot. The second firm's portion is $1 - \\frac{5}{8} = \\frac{3}{8}$, and they paved $\\frac{1}{2} \\times \\frac{3}{8} = \\frac{3}{16}$ of the total lot. Together they paved $\\frac{5}{12} + \\frac{3}{16} = \\frac{20}{48} + \\frac{9}{48} = \\frac{29}{48}$. The fraction not paved is $1 - \\frac{29}{48} = \\frac{19}{48}$. The correct answer is E.",
    categories: ["Arithmetic", "Operations on rational numbers"],
  },
  {
    id: "QR-GMAT-SI__-00007",
    question_number: 7,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "A furniture dealer bought a sofa at the manufacturer's price and sold it at a 20 percent discount off its regular retail price of $440. If the dealer made a 10 percent profit on the manufacturer's price of the sofa, what was the manufacturer's price?",
      options: {
        a: "$308",
        b: "$320",
        c: "$352",
        d: "$387",
        e: "$396",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "The selling price was $440 \\times 0.80 = \\$352$ (20% discount). If the manufacturer's price is $M$, then the dealer sold it for $1.10M$ (10% profit). So $1.10M = 352$, which gives $M = \\frac{352}{1.10} = 320$. The correct answer is B.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-SI__-00008",
    question_number: 8,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "Bill needs 864 tiles to tile a bathroom. He can buy tiles individually for $0.40 each, and he can buy them in boxes of 100 for $32.50 per box. What is the least amount that Bill must pay to buy the tiles he needs?",
      options: {
        a: "$260.00",
        b: "$280.80",
        c: "$285.60",
        d: "$292.50",
        e: "$345.60",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "To minimize cost, Bill should buy as many boxes as possible. $864 = 8 \\times 100 + 64$. Buying 8 boxes costs $8 \\times 32.50 = \\$260$. The remaining 64 tiles cost $64 \\times 0.40 = \\$25.60$. Total cost is $260 + 25.60 = \\$285.60$. The correct answer is C.",
    categories: ["Arithmetic", "Applied problems"],
  },
  {
    id: "QR-GMAT-SI__-00009",
    question_number: 9,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "An art auction house makes a commission of 5 percent on the first $10,000 of the selling price of a painting, 3 percent on the next $8,000, and a certain percent on any amount thereafter. If the auction house made a commission of $800 on a painting that sold for $22,000, what was the percent of the commission on the amount in excess of $18,000?",
      options: {
        a: "0.5%",
        b: "1.0%",
        c: "1.5%",
        d: "2.0%",
        e: "2.5%",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Commission on first $10,000: $10,000 \\times 0.05 = \\$500$. Commission on next $8,000: $8,000 \\times 0.03 = \\$240$. Total so far: $\\$740$. Remaining commission: $800 - 740 = \\$60$. Amount in excess of $18,000: $22,000 - 18,000 = \\$4,000$. Percent: $\\frac{60}{4,000} = 0.015 = 1.5\\%$. The correct answer is C.",
    categories: ["Arithmetic", "Percents"],
  },
];
