import {
  QuantitativeReasoningQuestion,
  QRQuestionData,
  generateMCAnswers,
} from "../types";

export const quantitativeReasoningQuestions: QuantitativeReasoningQuestion[] = [
  {
    id: "QR-GMAT-SK__-00001",
    question_number: 1,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "A certain bakery has 6 employees. It pays annual salaries of $14,000 to each 2 employees, $16,000 to 1 employee, and $17,000 to each of the remaining 3 employees. The average (arithmetic mean) annual salary of these employees is closest to which of the following?",
      options: {
        a: "$15,200",
        b: "$15,500",
        c: "$15,800",
        d: "$16,000",
        e: "$16,400",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The given information can be expressed as follows, using the formula $\\frac{\\mbox{sum of }n\\mbox{ values}}{n}$, and then simplified:\\[\\frac{2(14,000) + 16,000 + 3(17,000)}{6} = \\frac{95,000}{6} = 15,833\\] The correct answer is C.",
    categories: ["Arithmetic", "Statistics"],
  },
  {
    id: "QR-GMAT-SK__-00002",
    question_number: 2,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The function $f$ is defined by $f(x) = 2^x - 3$. If $f(x) = 31$, then the value of $x$ is between:",
      options: {
        a: "1 and 2",
        b: "2 and 3",
        c: "3 and 4",
        d: "4 and 5",
        e: "5 and 6",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "From $f(x)=2^x - 3$ and $f(x) = 31$, it follows that $2^x - 3 = 31$, or $2^x = 34$. Since $2^5 = 32$ and $2^6 = 64$, and 34 is between 32 and 64, the value of $x$ is between 5 and 6",
    categories: [],
  },
  {
    id: "QR-GMAT-SK__-00003",
    question_number: 3,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "If $a$ is a positive integer, and if the units digit of $a^2$ is 9 and the units digit of $(a + 1)^2$ is 4, what is the units digit of $(a + 2)^2$?",
      options: {
        a: "1",
        b: "3",
        c: "5",
        d: "6",
        e: "14",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "Only numbers ending in 3 or 7 would yield a units digit of 9 when squared. Thus, if 9 is the units digit of $a^2$, then either 3 or 7 must be the units digit of $a$. If the units digit is 3, then $a + 1 = 3 + 1 = 4$. This makes the units digit of $(a + 1)^2$ the units digit of $4^2$, which is 6. If, however, the units digit is 7, then $a + 1 = 7 + 1 = 8$. This makes the units digit of $(a + 1)^2$ the units digit of $8^2$, which is 4, as is needed in this problem. Therefore, the units digit of $a$ must be 7. Thus, the units digit of $a + 2$ is 9. This makes the units digit of $(a + 2)^2$ the units digit of $9^2$, which is 1.",
    categories: ["Arithmetic", "Properties of numbers"],
  },
  {
    id: "QR-GMAT-SK__-00004",
    question_number: 4,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If snow accumulation increased at a constant rate of 30 millimeters per hour during a certain snowstorm, how many seconds did it take for snow accumulation to increase by 1 millimeter?",
      options: {
        a: "$\\frac{1}{120}$",
        b: "$\\frac{1}{60}$",
        c: "$\\frac{1}{20}$",
        d: "20",
        e: "120",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "30 millimeters/1 hour = 30 millimeters/60 minutes = 1 millimeter/2 minutes = 1 millimeter/120 seconds. So it takes 120 seconds for the snow accumulation to increase by 1 millimeter.",
    categories: [],
  },
  {
    id: "QR-GMAT-SK__-00006",
    question_number: 5,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "A rabbit on a controlled diet is fed daily 300 grams of a mixture of two foods, food X and food Y. Food X contains 10 percent protein and food Y contains 15 percent protein. If the rabbit's diet provides exactly 38 grams of protein daily, how many grams of food X are in the mixture?",
      options: {
        a: "100",
        b: "140",
        c: "150",
        d: "160",
        e: "200",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "Let $x$ be the number of grams of food X in the mixture. Then the number of grams of food Y in the mixture can be expressed as $300 - x$. Since the sum of protein from X and Y is 38 grams, the given information about protein content can be expressed in the following equation, which can then be solved for $x$: $0.10x + 0.15(300 - x) = 38$. Simplifying: $0.10x + 45 - 0.15x = 38$, which gives $-0.05x = -7$, so $x = 140$.",
    categories: ["Algebra", "Applied problems"],
  },
  {
    id: "QR-GMAT-SK__-00007",
    question_number: 6,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "If a committee of 3 people is to be selected from among 5 married couples so that the committee does not include two people who are married to each other, how many such committees are possible?",
      options: {
        a: "20",
        b: "40",
        c: "50",
        d: "80",
        e: "120",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The first person chosen for the committee can be any one of the 10 people that comprise the 5 married couples. The second person cannot be the first person or the spouse of the first person, so there are 8 choices for the second person chosen for the committee. The third person chosen cannot be the first or second person nor the spouse of the first or second person, leaving 6 choices for the third person. However, the order of the people chosen for the committee is immaterial since a committee consisting of Al, Bo, and Cy is the same as the committee consisting of Bo, Cy, and Al. Since there are 6 different orderings of 3 people, the total number of committees possible is $\\frac{10 \\times 8 \\times 6}{6} = 80$.",
    categories: [],
  },
  {
    id: "QR-GMAT-SK__-00009",
    question_number: 7,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If $x^2 = 2y^3$ and $2y = 4$, what is the value of $x^2 + y$?",
      options: {
        a: "-2",
        b: "3",
        c: "6",
        d: "14",
        e: "18",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("e"),
    explanation:
      "Solve the given equations for the values of $x$ and $y$. First, solve for $y$. Since $2y = 4$, then $y = 2$. Then, substitute 2 for $y$ and solve for $x$: $x^2 = 2y^3 = 2(2)^3 = 2(8) = 16$. Therefore, by substitution, $x^2 + y = 16 + 2 = 18$.",
    categories: ["Algebra", "Simplifying algebraic expressions"],
  },
  {
    id: "QR-GMAT-SK__-00010",
    question_number: 8,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "The table above shows the results of a recent school board election in which the candidate with the higher total number of votes from the five districts was declared the winner. Which district had the greatest number of votes for the winner?\n\n| District | Number of votes | Percent of votes for candidate P | Percent of votes for candidate Q |\n|----------|-----------------|----------------------------------|----------------------------------|\n| 1        | 800             | 60                               | 40                               |\n| 2        | 1,000           | 50                               | 50                               |\n| 3        | 1,500           | 50                               | 50                               |\n| 4        | 1,800           | 40                               | 60                               |\n| 5        | 1,200           | 30                               | 70                               |",
      options: {
        a: "1",
        b: "2",
        c: "3",
        d: "4",
        e: "5",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "A careful analysis of the table shows candidates P and Q were tied in districts 2 and 3 and had reverse percentages in districts 1 and 4. Since candidate Q won district 4, which is much larger than district 1, and also clearly won district 5, candidate Q won the election. Thus, it is not necessary to calculate the exact vote counts to determine the winner. Calculate the number of votes each district cast for candidate Q based on the voting data in the table, and compare the districts' votes to find out which cast the most. District 1 votes for Q = $800(0.40) = 320$. District 2 votes for Q = $1,000(0.50) = 500$. District 3 votes for Q = $1,500(0.50) = 750$. District 4 votes for Q = $1,800(0.60) = 1,080$. District 5 votes for Q = $1,200(0.70) = 840$. The correct answer is D.",
    categories: ["Arithmetic", "Interpretation of tables"],
  },
  {
    id: "QR-GMAT-SK__-00011",
    question_number: 9,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "The Earth travels around the Sun at a speed of approximately 18.5 miles per second. This approximate speed is how many miles per hour?",
      options: {
        a: "1,080",
        b: "1,160",
        c: "64,800",
        d: "66,600",
        e: "3,996,000",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "Calculate the equivalent per-hour speed, given that there are 60 seconds in one minute and 60 minutes in one hour. $\\frac{18.5 \\text{ miles}}{1 \\text{ second}} \\times \\frac{60 \\text{ seconds}}{1 \\text{ minute}} \\times \\frac{60 \\text{ minutes}}{1 \\text{ hour}} = \\frac{66,600 \\text{ miles}}{1 \\text{ hour}}$. The correct answer is D.",
    categories: ["Arithmetic", "Operations on rational numbers"],
  },
  {
    id: "QR-GMAT-SK__-00015",
    question_number: 10,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If $\\frac{x}{y} = \\frac{2}{3}$, then $\\frac{x-y}{x} =$",
      options: {
        a: "$-\\frac{1}{2}$",
        b: "$-\\frac{1}{3}$",
        c: "$\\frac{1}{3}$",
        d: "$\\frac{1}{2}$",
        e: "$\\frac{5}{6}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "Simplifying the expression $\\frac{x-y}{x}$ gives $\\frac{x-y}{x} = \\frac{x}{x} - \\frac{y}{x} = 1 - \\frac{y}{x}$. If $\\frac{x}{y} = \\frac{2}{3}$, then $\\frac{y}{x} = \\frac{3}{2}$. Thus, $\\frac{x-y}{x} = 1 - \\frac{3}{2} = -\\frac{1}{2}$. The correct answer is A.",
    categories: ["Algebra", "Simplifying algebraic expressions"],
  },
  {
    id: "QR-GMAT-SK__-00017",
    question_number: 11,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "A car traveling at a constant speed took 1 minute 48 seconds to travel the distance between a certain road sign and the beginning of a roadwork area. If the distance between the road sign and the beginning of the roadwork area was 2,400 meters, then the car was traveling at what speed, in kilometers per hour? (1 kilometer = 1,000 meters)",
      options: {
        a: "50",
        b: "60",
        c: "80",
        d: "90",
        e: "100",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "The car traveled 2,400 meters in 1 minute 48 seconds or $(1 + \\frac{48}{60})$ minutes = 1.8 minutes. Thus, the car's speed was $\\frac{2,400}{1.8}$ meters per minute, $\\frac{2,400 \\text{ meters}}{1.8 \\text{ minutes}} = \\frac{2,400 \\text{ meters}}{1.8 \\text{ minutes}} \\times \\frac{1 \\text{ kilometers}}{1,000 \\text{ meters}} \\times \\frac{60 \\text{ minutes}}{1 \\text{ hour}} = \\frac{(2,400)(60)}{(1.8)(1,000)}$ kilometers per hour $= \\frac{(240)(6)}{18}$ kilometers per hour = 80 kilometers per hour. The correct answer is C.",
    categories: [],
  },
  {
    id: "QR-GMAT-SK__-00018",
    question_number: 12,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If $y = 4 + (x - 3)^2$, then $y$ is least when $x =$",
      options: {
        a: "14",
        b: "13",
        c: "0",
        d: "3",
        e: "4",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "The value of $y$ is least when $(x - 3)^2$ is least, and that is when $(x - 3)^2 = 0$. Solving this equation for $x$ yields: $(x - 3)^2 = 0$, $x - 3 = 0$, $x = 3$. The correct answer is D.",
    categories: ["Algebra", "Second-degree equations"],
  },
  {
    id: "QR-GMAT-SK__-00019",
    question_number: 13,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text: "$\\frac{1}{1+\\frac{1}{2+\\frac{1}{3}}} =$",
      options: {
        a: "$\\frac{3}{10}$",
        b: "$\\frac{7}{10}$",
        c: "$\\frac{6}{7}$",
        d: "$\\frac{10}{7}$",
        e: "$\\frac{10}{3}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("b"),
    explanation:
      "Work the problem. $\\frac{1}{1+\\frac{1}{2+\\frac{1}{3}}} = \\frac{1}{1+\\frac{1}{\\frac{7}{3}}} = \\frac{1}{1+\\frac{3}{7}} = \\frac{1}{\\frac{10}{7}} = \\frac{7}{10}$. The correct answer is B.",
    categories: ["Arithmetic", "Operations on rational numbers"],
  },
  {
    id: "QR-GMAT-SK__-00021",
    question_number: 14,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "A box contains 100 balls, numbered from 1 to 100. If three balls are selected at random and with replacement from the box, what is the probability that the sum of the three numbers on the balls selected from the box will be odd?",
      options: {
        a: "$\\frac{1}{4}$",
        b: "$\\frac{3}{8}$",
        c: "$\\frac{1}{2}$",
        d: "$\\frac{5}{8}$",
        e: "$\\frac{3}{4}$",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "Since there are 50 odd and 50 even balls in the box, the probability of selecting an odd ball at random is $\\frac{50}{100} = \\frac{1}{2}$; the probability of selecting an even ball is the same. For the sum of the three numbers on the selected balls to be odd, either 1) the numbers must all be odd, or 2) exactly one of the numbers must be odd and the other two numbers must be even, which can occur in one of the three ways listed below. 1) Probability of selecting odd, odd, odd = $(\\frac{1}{2})(\\frac{1}{2})(\\frac{1}{2}) = \\frac{1}{8}$. 2) Probability of selecting odd, even, even = $(\\frac{1}{2})(\\frac{1}{2})(\\frac{1}{2}) = \\frac{1}{8}$. Probability of selecting even, odd, even = $(\\frac{1}{2})(\\frac{1}{2})(\\frac{1}{2}) = \\frac{1}{8}$. Probability of selecting even, even, odd = $(\\frac{1}{2})(\\frac{1}{2})(\\frac{1}{2}) = \\frac{1}{8}$. Adding all four probabilities gives $4(\\frac{1}{8}) = \\frac{1}{2}$ as the probability that the sum of the three numbers will be odd. The correct answer is C.",
    categories: ["Arithmetic", "Probability"],
  },
  {
    id: "QR-GMAT-SK__-00022",
    question_number: 15,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Company X has 50 employees and Company Y has 60 employees. Both companies have the same number of full-time employees, but Company Y has 3 more than twice the number of part-time employees that Company X has. How many part-time employees does Company Y have?",
      options: {
        a: "3",
        b: "7",
        c: "14",
        d: "17",
        e: "20",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("d"),
    explanation:
      "Let $F_x$ and $P_x$ be, respectively, the number of full-time and part-time employees of Company X, and similarly for $F_y$ and $P_y$ in the case of Company Y. The 4 equations below follow from the given information: (1) $F_x + P_x = 50$. (2) $F_y + P_y = 60$. (3) $F_x = F_y$. (4) $P_y = 3 + 2P_x$. Using equations (3) and (4) in equation (2) gives (5) $F_x + (3 + 2P_x) = 60$. Subtracting equation (1) from equation (5) gives $3 + P_x = 10$, or $P_x = 7$. Therefore, using equation (4), it follows that $P_y = 3 + 2P_x = 3 + 2(7) = 17$. The correct answer is D.",
    categories: [],
  },
  {
    id: "QR-GMAT-SK__-00023",
    question_number: 16,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "Of the 3,600 employees of Company X, $\\frac{1}{3}$ are clerical. If the clerical staff were to be reduced by $\\frac{1}{3}$, what percent of the total number of the remaining employees would then be clerical?",
      options: {
        a: "25%",
        b: "22.2%",
        c: "20%",
        d: "12.5%",
        e: "11.1%",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "First calculate the size of the clerical staff. Then calculate the changes to the clerical staff and the total company staff due to the reduction. Clerical staff = $3,600(\\frac{1}{3}) = 1,200$. Clerical staff lost = $1,200(\\frac{1}{3}) = 400$. Remaining clerical staff = $1,200 - 400 = 800$. Remaining company employees = $3,600 - 400 = 3,200$. Percent of remaining employees who are clerical staff = $\\frac{800}{3,200} = \\frac{1}{4} = 25\\%$. The correct answer is A.",
    categories: ["Arithmetic", "Percents"],
  },
  {
    id: "QR-GMAT-SK__-00027",
    question_number: 17,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 2,
    questionData: {
      question_text:
        "If $\\frac{1}{2}$ of the money in a certain trust fund was invested in stocks, $\\frac{1}{4}$ in bonds, $\\frac{1}{5}$ in a mutual fund, and the remaining $10,000 in a government certificate, what was the total amount of the trust fund?",
      options: {
        a: "$100,000",
        b: "$150,000",
        c: "$200,000",
        d: "$500,000",
        e: "$2,000,000",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("c"),
    explanation:
      "First calculate what fraction of the fund is in stocks, bonds, and mutual funds by adding the fractions. $\\frac{1}{2} + \\frac{1}{4} + \\frac{1}{5} = \\frac{19}{20}$. The remainder of the fund is in the government certificate, and the fraction of the fund in that government certificate is thus known. $1 - \\frac{19}{20} = \\frac{1}{20}$. The total amount of the trust fund $(F)$ can then be found using the following equation. $\\frac{1}{20}F = \\$10,000$. Solve for $F$: $F = \\$200,000$. The correct answer is C.",
    categories: ["Arithmetic", "Operations on rational numbers"],
  },
  {
    id: "QR-GMAT-SK__-00028",
    question_number: 18,
    section: "Quantitative Reasoning",
    difficulty: "medium",
    difficultyLevel: 3,
    questionData: {
      question_text:
        "If $2s > 8$ and $3t < 9$, which of the following could be the value of $s - t$?\n\nI. $-1$\nII. $0$\nIII. $1$",
      options: {
        a: "None",
        b: "I only",
        c: "II only",
        d: "III only",
        e: "II and III",
      },
      image_url: null,
      image_options: null,
    } as QRQuestionData,
    answers: generateMCAnswers("a"),
    explanation:
      "From $2s > 8$ and $3t < 9$ it follows that $s > 4$ and $3 > t$. Adding the last two inequalities gives $s + 3 > 4 + t$, or $s - t > 1$. None of the displayed values is greater than 1. The correct answer is A.",
    categories: [],
  },
  {
    id: "QR-GMAT-SK__-00031",
    question_number: 19,
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
    id: "QR-GMAT-SK__-00032",
    question_number: 20,
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
    id: "QR-GMAT-SK__-00033",
    question_number: 21,
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
    id: "QR-GMAT-SK__-00034",
    question_number: 22,
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
    id: "QR-GMAT-SK__-00035",
    question_number: 23,
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
    id: "QR-GMAT-SK__-00036",
    question_number: 24,
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
    id: "QR-GMAT-SK__-00037",
    question_number: 25,
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
    id: "QR-GMAT-SK__-00038",
    question_number: 26,
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
    id: "QR-GMAT-SK__-00039",
    question_number: 27,
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
