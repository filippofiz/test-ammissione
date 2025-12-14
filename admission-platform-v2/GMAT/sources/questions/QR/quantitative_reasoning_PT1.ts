import {
  QuantitativeReasoningQuestion,
  QRQuestionData,
  generateMCAnswers,
} from "../types";

export const quantitativeReasoningQuestionsPT1: QuantitativeReasoningQuestion[] = [
  {
    id: "QR-GMAT-PT1_-00001",
    question_number: 1,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "All 15 members of a foreign language club speak one or more of three languages—Spanish, French, and German. If $\\frac{1}{3}$ of the members speak Spanish, $\\frac{2}{5}$ of the members speak French, $\\frac{2}{3}$ of the members speak German, and 1 member speaks all three of the languages, how many members speak exactly two of the languages?",
      options: {
        a: "0",
        b: "1",
        c: "2",
        d: "3",
        e: "4",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Using inclusion-exclusion principle: Let $S$, $F$, $G$ represent the sets of Spanish, French, and German speakers. $|S| = 15 \\times \\frac{1}{3} = 5$, $|F| = 15 \\times \\frac{2}{5} = 6$, $|G| = 15 \\times \\frac{2}{3} = 10$. Since all 15 members speak at least one language: $15 = 5 + 6 + 10 - (|S \\cap F| + |S \\cap G| + |F \\cap G|) + 1$. Therefore, $|S \\cap F| + |S \\cap G| + |F \\cap G| = 7$. The number speaking exactly two languages $= 7 - 3(1) = 4$.",
    categories: ["Algebra", "Counting/Sets/Series/Prob/Stats"],
  },
  {
    id: "QR-GMAT-PT1_-00002",
    question_number: 2,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "If $y$ is the average (arithmetic mean) of 15 consecutive positive integers, which of the following must be true?\n\nI. $y$ is an integer.\nII. $y > 7$\nIII. $y < 100$",
      options: {
        a: "I only",
        b: "II only",
        c: "III only",
        d: "I and II",
        e: "II and III",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "For 15 consecutive positive integers starting from $n$: $n, n+1, \\ldots, n+14$, the average is the middle term, which is $n + 7$. I. TRUE: Since $n$ is a positive integer, $n + 7$ is also an integer. II. TRUE: The minimum value occurs when $n = 1$, giving $y = 8$, so $y > 7$. III. FALSE: $y$ can be any value $\\geq 8$, including values $\\geq 100$ (e.g., starting from 993 gives $y = 1000$).",
    categories: ["Arithmetic", "Counting/Sets/Series/Prob/Stats"],
  },
  {
    id: "QR-GMAT-PT1_-00003",
    question_number: 3,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "A certain candy bar is packaged in boxes of two sizes; 1 small box and 1 large box together contain 15 of the candy bars. If 4 small boxes and 2 large boxes together contain 40 of the candy bars, how many candy bars are packaged in 1 large box?",
      options: {
        a: "3",
        b: "4",
        c: "5",
        d: "8",
        e: "10",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Let $s$ = number of candy bars in a small box and $L$ = number in a large box. From the given information: $s + L = 15$ and $4s + 2L = 40$. From the first equation, $L = 15 - s$. Substituting into the second equation: $4s + 2(15 - s) = 40$, which gives $4s + 30 - 2s = 40$, so $2s = 10$ and $s = 5$. Therefore, $L = 15 - 5 = 10$.",
    categories: ["Algebra", "Equal/Unequal/ALG"],
  },
  {
    id: "QR-GMAT-PT1_-00004",
    question_number: 4,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "In a certain nursery, 15 percent of the plants developed a fungus and died. If 40 percent of the plants that developed the fungus did not die, what percent of the plants in the nursery developed the fungus?",
      options: {
        a: "25%",
        b: "27%",
        c: "35%",
        d: "40%",
        e: "55%",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "Let $F$ be the percent of plants that developed the fungus. If $40\\%$ of plants with fungus did not die, then $60\\%$ of plants with fungus died. We know that $15\\%$ of all plants developed fungus and died. So $0.60 \\times F = 15\\%$, which gives $F = \\frac{15\\%}{0.60} = 25\\%$.",
    categories: ["Algebra", "Equal/Unequal/ALG"],
  },
  {
    id: "QR-GMAT-PT1_-00005",
    question_number: 5,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Last year in City X, the range of daily low temperatures, in degrees Fahrenheit, was 20 for the month of June and 25 for the month of July. Which of the following is the smallest possible range of City X's daily low temperatures, in degrees Fahrenheit, for the two-month period of June and July of last year?",
      options: {
        a: "5",
        b: "20",
        c: "25",
        d: "30",
        e: "45",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The range is the difference between the maximum and minimum values. June's range is 20 and July's range is 25. To minimize the combined range, we want maximum overlap between the two data sets. Since July's range (25) is larger than June's (20), the June temperatures could be entirely contained within July's range. In this case, the combined range would equal July's range of 25, which is the smallest possible combined range.",
    categories: ["Arithmetic", "Counting/Sets/Series/Prob/Stats"],
  },
  {
    id: "QR-GMAT-PT1_-00006",
    question_number: 6,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Candidate McFee received 12,000 votes, which was $\\frac{1}{4}$ of the total number of votes. If $x$ additional people had voted and each had voted for McFee, then McFee would have received $\\frac{1}{3}$ of the total number of votes. What is the value of $x$?",
      options: {
        a: "8,000",
        b: "6,000",
        c: "4,000",
        d: "3,000",
        e: "2,000",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "Total votes $= 12{,}000 \\times 4 = 48{,}000$. If $x$ additional people vote for McFee, McFee gets $12{,}000 + x$ votes out of $48{,}000 + x$ total. Setting up the equation: $12{,}000 + x = \\frac{1}{3}(48{,}000 + x)$. Solving: $12{,}000 + x = 16{,}000 + \\frac{x}{3}$, which gives $\\frac{2}{3}x = 4{,}000$, so $x = 6{,}000$.",
    categories: ["Algebra", "Equal/Unequal/ALG"],
  },
  {
    id: "QR-GMAT-PT1_-00007",
    question_number: 7,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Candle A and Candle B have equal heights but different volumes. While the candles are burning, the height of each candle decreases at its own individual constant rate, with Candle A taking a total of $t$ minutes to completely burn down and Candle B taking a total of $2t$ minutes to completely burn down. If both candles begin burning at the same time, in terms of $t$, how many minutes will it take for Candle B's height to be twice Candle A's height?",
      options: {
        a: "$\\frac{1}{4}t$",
        b: "$\\frac{1}{3}t$",
        c: "$\\frac{2}{3}t$",
        d: "$\\frac{3}{4}t$",
        e: "$t$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Let $h$ be the initial height. Candle A burns at rate $\\frac{h}{t}$, and Candle B burns at rate $\\frac{h}{2t}$. After $x$ minutes: Height of A $= h\\left(1 - \\frac{x}{t}\\right)$ and Height of B $= h\\left(1 - \\frac{x}{2t}\\right)$. Setting B $= 2$A: $h\\left(1 - \\frac{x}{2t}\\right) = 2h\\left(1 - \\frac{x}{t}\\right)$. Simplifying: $1 - \\frac{x}{2t} = 2 - \\frac{2x}{t}$. Multiplying by $2t$: $2t - x = 4t - 4x$, which gives $3x = 2t$, so $x = \\frac{2t}{3}$.",
    categories: ["Algebra", "Rates/Ratios/Percent"],
  },
  {
    id: "QR-GMAT-PT1_-00008",
    question_number: 8,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Last year a company produced millions of widgets each week. Last year the ratio of the number of defective widgets to the number of widgets produced was $\\frac{1}{4}$ for the first week, $\\frac{1}{8}$ for the second week, $\\frac{1}{16}$ for the third week, and so on for 19 weeks, where the ratio for each week after the first week was half of the ratio for the preceding week. If last year the ratio of the number of defective widgets to the number of widgets produced was $d$ for the 19th week, then $d$ satisfies which of the following inequalities?",
      options: {
        a: "$d < \\frac{1}{1,000,000}$",
        b: "$\\frac{1}{1,000,000} \\leq d < \\frac{1}{100,000}$",
        c: "$\\frac{1}{100,000} \\leq d < \\frac{1}{10,000}$",
        d: "$\\frac{1}{10,000} \\leq d < \\frac{1}{1,000}$",
        e: "$d \\geq \\frac{1}{1,000}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "The ratio follows a geometric sequence: Week $n$ has ratio $= \\frac{1}{4} \\times \\left(\\frac{1}{2}\\right)^{n-1} = \\frac{1}{2^{n+1}}$. For week 19: $d = \\frac{1}{2^{20}} = \\frac{1}{1{,}048{,}576}$. Since $1{,}048{,}576 > 1{,}000{,}000$, we have $d = \\frac{1}{1{,}048{,}576} < \\frac{1}{1{,}000{,}000}$.",
    categories: ["Arithmetic", "Counting/Sets/Series/Prob/Stats"],
  },
  {
    id: "QR-GMAT-PT1_-00009",
    question_number: 9,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "A certain manufacturer increased its gross profit on a product from 10 percent of the cost of the product to 15 percent of the cost by changing the selling price. If the new selling price was $92.00 and the cost of the product remained the same, what was the old selling price?",
      options: {
        a: "$77.40",
        b: "$80.00",
        c: "$83.64",
        d: "$87.40",
        e: "$88.00",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Let $C$ be the cost. New selling price $= C + 0.15C = 1.15C = \\$92$. So $C = \\frac{\\$92}{1.15} = \\$80$. Old selling price $= C + 0.10C = 1.10C = 1.10 \\times \\$80 = \\$88$.",
    categories: ["Arithmetic", "Rates/Ratios/Percent"],
  },
  {
    id: "QR-GMAT-PT1_-00010",
    question_number: 10,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "A batch of fresh grapes is fully dried to make raisins by 2 sequential processes. The first drying process is in the open air and results in partially dried grapes that have a weight 65% less than the weight of the fresh grapes. The partially dried grapes are then placed in a dehydrating device, making raisins that have a weight 45% less than the weight of the partially dried grapes. No other changes in weight occur. Which of the following expressions gives the value of $k$ such that, if $k$ kilograms of fresh grapes are fully dried, then the total weight of the resulting raisins is exactly 1 kilogram?",
      options: {
        a: "$\\frac{1}{(0.35)(0.55)}$",
        b: "$\\frac{1}{(0.45)(0.65)}$",
        c: "$\\frac{1 + 0.45}{0.65}$",
        d: "$\\frac{1 + 0.65}{0.45}$",
        e: "$\\frac{1}{1 - (0.35)(0.55)}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "After the first process, the weight is $k \\times (1 - 0.65) = 0.35k$ ($65\\%$ less means $35\\%$ remains). After the second process, the weight is $0.35k \\times (1 - 0.45) = 0.35k \\times 0.55$ ($45\\%$ less means $55\\%$ remains). Setting this equal to 1: $0.35 \\times 0.55 \\times k = 1$, so $k = \\frac{1}{(0.35)(0.55)}$.",
    categories: ["Arithmetic", "Rates/Ratios/Percent"],
  },
  {
    id: "QR-GMAT-PT1_-00011",
    question_number: 11,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If $x = \\sqrt[3]{a^6}$, $y = \\sqrt[3]{b^6}$, $b \\neq 0$, and $a = 4b$, then $\\frac{x}{y} =$",
      options: {
        a: "4",
        b: "8",
        c: "16",
        d: "32",
        e: "64",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Since $x = \\sqrt[3]{a^6} = a^{6/3} = a^2$ and $y = \\sqrt[3]{b^6} = b^{6/3} = b^2$, we have $\\frac{x}{y} = \\frac{a^2}{b^2}$. Substituting $a = 4b$: $\\frac{x}{y} = \\frac{(4b)^2}{b^2} = \\frac{16b^2}{b^2} = 16$.",
    categories: ["Algebra", "Value/Order/Factors"],
  },
  {
    id: "QR-GMAT-PT1_-00012",
    question_number: 12,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text: "Which of the following is closest to $100((1 + 0.03)^4 - 1)$?",
      options: {
        a: "0.001",
        b: "0.126",
        c: "12.600",
        d: "62.012",
        e: "112.600",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Calculate $(1.03)^4$: $(1.03)^2 = 1.0609$, and $(1.03)^4 = (1.0609)^2 \\approx 1.1255$. Then $100((1.03)^4 - 1) = 100(1.1255 - 1) = 100(0.1255) = 12.55$, which is closest to 12.600.",
    categories: ["Arithmetic", "Value/Order/Factors"],
  },
  {
    id: "QR-GMAT-PT1_-00013",
    question_number: 13,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "What is the largest integer $n$ such that $\\frac{1}{2^n} > 0.01$?",
      options: {
        a: "5",
        b: "6",
        c: "7",
        d: "10",
        e: "51",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "We need $\\frac{1}{2^n} > 0.01 = \\frac{1}{100}$, which means $2^n < 100$. Since $2^6 = 64 < 100$ and $2^7 = 128 > 100$, the largest integer $n$ satisfying the inequality is 6.",
    categories: ["Arithmetic", "Rates/Ratios/Percent"],
  },
  {
    id: "QR-GMAT-PT1_-00014",
    question_number: 14,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "A certain store purchased grills for $50 each and lawn chairs for $5 each and then sold each grill and each chair. The store's gross profit on each grill was 30 percent of its purchase price, and the store's gross profit on each chair was 50 percent of its purchase price. If the store sold 5 times as many chairs as grills and if the store's total gross profit on the grills and chairs was $550, what was the store's total revenue from the sale of the grills and chairs?",
      options: {
        a: "$1,530",
        b: "$1,800",
        c: "$2,050",
        d: "$2,100",
        e: "$2,360",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Profit per grill $= 0.30 \\times \\$50 = \\$15$, selling price $= \\$65$. Profit per chair $= 0.50 \\times \\$5 = \\$2.50$, selling price $= \\$7.50$. Let $g$ = number of grills. Then chairs $= 5g$. Total profit: $15g + 2.50(5g) = 27.50g = \\$550$, so $g = 20$ and chairs $= 100$. Total revenue $= 65(20) + 7.50(100) = \\$1{,}300 + \\$750 = \\$2{,}050$.",
    categories: ["Arithmetic", "Rates/Ratios/Percent"],
  },
  {
    id: "QR-GMAT-PT1_-00015",
    question_number: 15,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text: "Which of the following is equivalent to $(10^2)^{n+1}$?",
      options: {
        a: "$10^2(10^{2n})$",
        b: "$10^2(10^{n+1})$",
        c: "$10^{2n+3}$",
        d: "$10(10^{2n})$",
        e: "$(10^{2n})^2$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "$(10^2)^{n+1} = 10^{2(n+1)} = 10^{2n+2} = 10^2 \\times 10^{2n} = 10^2(10^{2n})$.",
    categories: ["Algebra", "Value/Order/Factors"],
  },
  {
    id: "QR-GMAT-PT1_-00016",
    question_number: 16,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Water flows into an empty swimming pool at a constant rate of 50 liters per minute. If the pool's total capacity is 120 cubic meters, approximately how many hours does it take until the pool is filled to $\\frac{2}{3}$ of its total capacity? (1 liter = 1,000 cubic centimeters)",
      options: {
        a: "7",
        b: "13",
        c: "27",
        d: "40",
        e: "53",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Pool capacity $= 120 \\text{ m}^3 = 120 \\times 1{,}000{,}000 \\text{ cm}^3 = 120{,}000{,}000 \\text{ cm}^3$. Since $1 \\text{ liter} = 1{,}000 \\text{ cm}^3$, capacity $= 120{,}000$ liters. Target volume $= \\frac{2}{3} \\times 120{,}000 = 80{,}000$ liters. Time $= \\frac{80{,}000}{50} = 1{,}600$ minutes $= \\frac{1{,}600}{60} \\approx 26.67$ hours $\\approx 27$ hours.",
    categories: ["Arithmetic", "Equal/Unequal/ALG"],
  },
  {
    id: "QR-GMAT-PT1_-00017",
    question_number: 17,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text: "How many positive integer divisors does $8!$ have?",
      options: {
        a: "14",
        b: "15",
        c: "24",
        d: "56",
        e: "96",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "$8! = 8 \\times 7 \\times 6 \\times 5 \\times 4 \\times 3 \\times 2 \\times 1 = 40,320$. Prime factorization: $8! = 2^7 \\times 3^2 \\times 5^1 \\times 7^1$. The number of divisors = $(7+1)(2+1)(1+1)(1+1) = 8 \\times 3 \\times 2 \\times 2 = 96$.",
    categories: ["Arithmetic", "Value/Order/Factors"],
  },
  {
    id: "QR-GMAT-PT1_-00018",
    question_number: 18,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "How many different positive two-digit integers are there such that the sum of the two digits is a prime number greater than 11?",
      options: {
        a: "Four",
        b: "Five",
        c: "Six",
        d: "Seven",
        e: "Eight",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Two-digit integers have digits summing from 1 to 18. Primes greater than 11 up to 18 are 13 and 17. For sum $= 13$: $(4,9), (5,8), (6,7), (7,6), (8,5), (9,4)$ giving $49, 58, 67, 76, 85, 94$ — that's 6 numbers. For sum $= 17$: $(8,9), (9,8)$ giving $89, 98$ — that's 2 numbers. Total $= 6 + 2 = 8$ numbers.",
    categories: ["Algebra", "Value/Order/Factors"],
  },
  {
    id: "QR-GMAT-PT1_-00019",
    question_number: 19,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text: "$\\frac{\\sqrt{2}}{4} + \\frac{3}{2\\sqrt{2}} =$",
      options: {
        a: "$\\frac{\\sqrt{2}}{2}$",
        b: "$\\frac{3\\sqrt{2}}{2}$",
        c: "$\\sqrt{2}$",
        d: "$2\\sqrt{2}$",
        e: "$3\\sqrt{2}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Rationalize the second term: $\\frac{3}{2\\sqrt{2}} = \\frac{3}{2\\sqrt{2}} \\times \\frac{\\sqrt{2}}{\\sqrt{2}} = \\frac{3\\sqrt{2}}{4}$. Then $\\frac{\\sqrt{2}}{4} + \\frac{3\\sqrt{2}}{4} = \\frac{\\sqrt{2} + 3\\sqrt{2}}{4} = \\frac{4\\sqrt{2}}{4} = \\sqrt{2}$.",
    categories: ["Algebra", "Value/Order/Factors"],
  },
  {
    id: "QR-GMAT-PT1_-00020",
    question_number: 20,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "If $x > 0$, then $\\frac{1}{\\sqrt{2x} + \\sqrt{x}} =$",
      options: {
        a: "$\\frac{1}{\\sqrt{3x}}$",
        b: "$\\frac{1}{2\\sqrt{2x}}$",
        c: "$\\frac{1}{x\\sqrt{2}}$",
        d: "$\\frac{\\sqrt{2} - 1}{\\sqrt{x}}$",
        e: "$\\frac{1 + \\sqrt{2}}{\\sqrt{x}}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "Factor $\\sqrt{x}$ from the denominator: $\\frac{1}{\\sqrt{x}(\\sqrt{2} + 1)}$. Rationalize by multiplying by $\\frac{\\sqrt{2} - 1}{\\sqrt{2} - 1}$: $\\frac{\\sqrt{2} - 1}{\\sqrt{x}(\\sqrt{2} + 1)(\\sqrt{2} - 1)} = \\frac{\\sqrt{2} - 1}{\\sqrt{x}(2 - 1)} = \\frac{\\sqrt{2} - 1}{\\sqrt{x}}$.",
    categories: ["Algebra", "Value/Order/Factors"],
  },
  {
    id: "QR-GMAT-PT1_-00021",
    question_number: 21,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "If $x$ is a real number and $x + \\sqrt{x} = 1$, which of the following is the value of $\\sqrt{x}$?",
      options: {
        a: "$\\frac{1}{2}(\\sqrt{5} - 1)$",
        b: "$\\frac{1}{2}(\\sqrt{5} + 1)$",
        c: "$\\frac{1}{2}(\\sqrt{5} - 3)$",
        d: "$\\frac{1}{2}(\\sqrt{5} + 3)$",
        e: "$\\frac{1}{2}(3 - \\sqrt{5})$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "Let $y = \\sqrt{x}$ where $y \\geq 0$. Then $x = y^2$, so $y^2 + y = 1$, which gives $y^2 + y - 1 = 0$. Using the quadratic formula: $y = \\frac{-1 \\pm \\sqrt{1 + 4}}{2} = \\frac{-1 \\pm \\sqrt{5}}{2}$. Since $y \\geq 0$, we need $y = \\frac{-1 + \\sqrt{5}}{2} = \\frac{\\sqrt{5} - 1}{2} = \\frac{1}{2}(\\sqrt{5} - 1)$.",
    categories: ["Algebra", "Equal/Unequal/ALG"],
  },
];
